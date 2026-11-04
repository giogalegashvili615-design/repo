# Working notes for this repository

This repository is the **archlinuxcn package collection** (`alarmcn/`, `archlinuxcn/`, `parse-pkgbuild`, `pre-commit`, …).
The Android app below lives beside it; nothing in `alarmcn/` or `archlinuxcn/` is part of it.

## Glass Gallery (`glass_gallery/`, WebView app inside a thin Android shell)

- The gallery is one self-contained page, `glass_gallery/app/src/main/assets/index.html`
  (HTML + CSS + vanilla JS, no build step, no dependencies). It is the **only** copy of the app:
  nginx serves that same directory on `/`, and Gradle packs it into the APK as `assets/index.html`.
- `MainActivity.kt` is the whole shell (package `ge.glassgallery.app`, minSdk 26, targetSdk 35):
  - loads the page from `https://appassets.androidplatform.net/assets/index.html` through
    `WebViewAssetLoader`, so no `file://` access and no INTERNET permission are needed;
  - `WebChromeClient.onShowFileChooser` + `ActivityResultContracts.StartActivityForResult` make the
    page's `<input type="file">` ("Choose Photos") open the system picker — without it the button
    silently does nothing inside the APK. Picked files arrive as blob URLs, so photos stay on the device;
  - the back button first calls the page hook `window.__ggBack()` (closes viewer → sheet → selection →
    returns to Library) and only then leaves the app.
- The tab bar animation lives entirely in the page: `renderBars()` builds the bar **once per mode**
  (`#bar.dataset.mode`) and afterwards only updates `aria-selected`, so the `.pillfx` highlight can
  spring between tabs (`movePill()` measures the selected tab and sets `transform`/`width`).
  Rebuilding the bar's innerHTML on every render would restart the animation — don't go back to that.
  Icon pop, label rise, press-scale, the ambient sheen and the search-button halo are pure CSS;
  the global `prefers-reduced-motion` rule already turns them all off.
- `glass_gallery/nginx.conf` serves the page on `/`, the download page on `/download`
  (`alias` to `dist/download.html`) and the APK on `/glass_gallery.apk` (MIME type must stay
  `application/vnd.android.package-archive`). `dist/` is bind-mounted as a directory; a single-file
  `alias` into the read-only nginx root is fine, a single-file bind mount is not.

### Rebuilding the APK

Toolchain: the `ghcr.io/cirruslabs/android-sdk:35` image (JDK 21, Android SDK with platform 35 and
build-tools 35.0.0) plus a downloaded Gradle **8.9** — the image ships no Gradle, and AGP 8.6.1 needs
Gradle ≥ 8.7 (8.9 works on JDK 21).

```bash
mkdir -p /tmp/ggbuild/gradlehome /tmp/ggbuild/out && cd /tmp/ggbuild
curl -sSLo gradle-8.9-bin.zip https://services.gradle.org/distributions/gradle-8.9-bin.zip
docker run --rm -v /tmp/ggbuild:/w ghcr.io/cirruslabs/android-sdk:35 bash -lc \
  'cd /w && (unzip -q gradle-8.9-bin.zip || jar xf gradle-8.9-bin.zip)'
rm -rf /tmp/ggbuild/src && cp -r /app/glass_gallery /tmp/ggbuild/src
docker run --rm -v /tmp/ggbuild:/work -w /work ghcr.io/cirruslabs/android-sdk:35 bash -lc '
  export GRADLE_USER_HOME=/work/gradlehome
  cd /work/src && /work/gradle-8.9/bin/gradle --no-daemon \
    -Dorg.gradle.jvmargs="-Xmx3g -XX:MaxMetaspaceSize=1g" assembleRelease'
```

`assembleRelease` writes an **unsigned** APK (`app/build/outputs/apk/release/app-release-unsigned.apk`).
The project has no signing config, so sign it with a debug keystore so it installs:

```bash
BT=/opt/android-sdk-linux/build-tools/35.0.0
keytool -genkeypair -keystore debug.keystore -storepass android -keypass android \
  -alias androiddebugkey -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=Android Debug,O=Android,C=US"
$BT/zipalign -f -p 4 src/app/build/outputs/apk/release/app-release-unsigned.apk out/aligned.apk
$BT/apksigner sign --ks debug.keystore --ks-pass pass:android --key-pass pass:android \
  --ks-key-alias androiddebugkey --out out/glass_gallery.apk out/aligned.apk
```

Copy the result to `glass_gallery/dist/glass_gallery.apk`; nginx picks the new file up on the next
request (no `restart` needed for `dist/`, only for edits to `nginx.conf`).

- Always pass the `-Dorg.gradle.jvmargs` heap flag: the default heap fails `:app:mergeDexRelease`
  with `D8: java.lang.OutOfMemoryError`, reported as "Could not receive a message from the daemon".
- There is no emulator here, so the build is verified statically: `aapt2 dump badging` (package
  `ge.glassgallery.app`, label `Glass Gallery`, minSdk 26, targetSdk 35, launchable `MainActivity`,
  adaptive icon), `apksigner verify --print-certs`, and
  `unzip -p … assets/index.html | grep -c pillfx` to prove the animated bar is inside the APK.
  Runtime behaviour (install, file picker, back button) is **not** exercised.
- Debug-key signed is fine for sideloading; a Play Store upload needs a real keystore.

### Verifying the page itself

The page is served on host port 3000, so it can be driven in the preview: tap
"Try with sample images" for content, then switch Library → Collections → Search and check that
`.pillfx` `transform` changes (5px → 93px at 375 px width), that its `opacity` drops to 0 in Search,
and that entering Select mode swaps the bar to Favorite/Remove with `.tabs.pop`.

## Environment

- `docker-compose.base44.yml` runs one `web` service (nginx) on port 3000: the gallery on `/`,
  the APK and download page from `dist/`. No database, no secrets, no Node/Python services.
- `startCommand`: `docker compose -f docker-compose.base44.yml up -d`.
