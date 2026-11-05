# Working notes for this repository

This repository is the **archlinuxcn package collection** (`alarmcn/`, `archlinuxcn/`, `parse-pkgbuild`, `pre-commit`, …).
It has no web application of its own, so nothing here is "the app" — `docker-compose.base44.yml` only serves build
artifacts for the sandbox preview.

## GlassNotes (native Android, Jetpack Compose)

- Source: `glass_notes/` — Kotlin only, a single `app/src/main/java/com/example/glassnotes/MainActivity.kt`
  (all UI is Compose). The zip has no Gradle wrapper and no launcher icon; the icon added here lives in
  `app/src/main/res/`: adaptive `mipmap-anydpi-v26/ic_launcher{,_round}.xml` over the vector drawables
  `ic_launcher_background` (amber gradient), `ic_launcher_foreground` (white note sheet) and
  `ic_launcher_monochrome` (themed icons, API 33+). minSdk is 26, so the adaptive icon needs no PNG fallback.
  `glass_notes/dist/icon.png` (512 px, Play-Store size) is rasterized from an SVG copy of the same artwork with
  `apk add rsvg-convert && rsvg-convert -w 512 -h 512 icon.svg -o icon.png` (alpine already has `librsvg` but not
  the `rsvg-convert` package) and is what the download page shows.
- App name: `android:label="Notes"` in the manifest; the APK is `notes.apk`.
- Deliverable: `glass_notes/dist/notes.apk`, served by the nginx `web` service on host port 3000.
  `glass_notes/dist/builds.html` lists all three builds (`/builds.html`), a card each with its own
  `/assistant.apk`, `/notes.apk`, `/cluck_and_dash.apk` download link. The previous Cluck & Dash APK stays downloadable at `/cluck_and_dash.apk`
  (nginx `alias` to `cluck_and_dash/dist`, mounted at `/srv/cluck` — a file bind-mount into the read-only nginx
  root fails with "read-only file system", mount a directory instead).

## Assistant site (landing page on `/`)

- `assistant_site/index.html` is the single-file marketing site served at `/`: hero with the phone mock, three
  feature cards, the **$4 / month** pricing card, and the APK download button. No build step, no dependencies.
- Served by nginx as `location = / { root /srv/site; try_files /index.html =404; }` with
  `./assistant_site:/srv/site:ro` mounted in compose. **Do not use `alias` on the exact-match `location = /`** —
  nginx 1.31 concatenates index handling onto the alias and answers `500 "/srv/site/index.htmlindex.html" is not
  a directory`.
- **Checkout** (`payments/`, Node 22 + Express + `stripe`): `POST /api/checkout` creates a Stripe Checkout
  Session in `subscription` mode with inline `price_data` — $4.00 USD / month, so no Price ID has to be created
  in the dashboard. Stripe Checkout offers **Google Pay** (and Apple Pay) on supported devices once the Stripe
  account has wallets enabled. `success_url` / `cancel_url` are built from `BASE44_PUBLIC_HOST_SUFFIX`
  (`https://3000-<suffix>/`), so never hardcode them.
- nginx proxies `location /api/` to `http://payments:8000`, so the browser talks to the site's own origin.
  **Restart the `web` service after editing `nginx.conf`** — the file is bind-mounted, but nginx only reads it at
  start (`docker compose ... restart web`).
- Without `STRIPE_SECRET_KEY` the service still boots: `/api/health` reports `{"checkout":false}` and
  `/api/checkout` answers `503 {"error":"not_configured"}`, which the page turns into a friendly note. The key is
  delivered by the platform in `/run/base44/app.env` (`env_file`, listed last so a dashboard value wins).
- `npm install` runs from the compose command into the bind-mounted `payments/` dir (no lockfile committed).

### Rebuilding the APK

Toolchain: the `flutter-android-builder` image (JDK 17 + Android SDK with platforms 35/36 and build-tools 35/36)
plus a downloaded Gradle **8.9** — AGP 8.6.1 does not work on the Gradle 9.x that the Flutter build cached.
`gradle` is not in the image, so fetch the distribution once:

```bash
mkdir -p /tmp/glassbuild/gradlehome /tmp/glassbuild/out
cd /tmp/glassbuild && curl -sSLo gradle-8.9-bin.zip https://services.gradle.org/distributions/gradle-8.9-bin.zip
docker run --rm -v /tmp/glassbuild:/w alpine sh -c "apk add --no-cache unzip; cd /w && unzip -q gradle-8.9-bin.zip"
cp -r /app/glass_notes /tmp/glassbuild/src
docker run --rm -v /tmp/glassbuild:/work -w /work flutter-android-builder bash -lc '
  export GRADLE_USER_HOME=/work/gradlehome
  cd /work/src && /work/gradle-8.9/bin/gradle --no-daemon \
    -Dorg.gradle.jvmargs="-Xmx3g -XX:MaxMetaspaceSize=1g" assembleRelease'
```

- **Heap is the trap**: the default 512 MiB heap makes `:app:mergeDexRelease` die with
  `D8: java.lang.OutOfMemoryError`, which surfaces as the useless "Could not receive a message from the daemon".
  Always pass the `-Dorg.gradle.jvmargs` above.
- `assembleRelease` produces an **unsigned** APK (`app-release-unsigned.apk`) because the project has no signing
  config. Sign it with a debug keystore so it installs, then verify:

```bash
BT=/opt/android-sdk/build-tools/35.0.0
keytool -genkeypair -keystore debug.keystore -storepass android -keypass android -alias androiddebugkey \
  -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=Android Debug,O=Android,C=US"
$BT/zipalign -f -p 4 src/app/build/outputs/apk/release/app-release-unsigned.apk out/aligned.apk
$BT/apksigner sign --ks debug.keystore --ks-pass pass:android --key-pass pass:android \
  --ks-key-alias androiddebugkey --out out/notes.apk out/aligned.apk
```

- Debug-key signed is fine for sideloading; a Play Store upload needs a real keystore.
- There is no emulator here, so runtime behaviour is not exercised. The build is verified by
  `aapt dump badging` (`com.example.glassnotes`, minSdk 26, targetSdk 35, launchable `MainActivity`) and
  `apksigner verify --print-certs`.

## GlassAssistant (native Android, Jetpack Compose chat UI)

- Source: `glass_assistant/` — Kotlin + Compose (`MainActivity.kt` UI, `Gemini.kt` REST call to
  `generativelanguage.googleapis.com`). The zip as delivered did **not** compile: `MainActivity.kt` used
  `MutableInteractionSource` without `import androidx.compose.foundation.interaction.MutableInteractionSource`
  (fixed in the committed source).
- No API key is baked in: the app reads the Gemini key from its own *Settings* screen (SharedPreferences `cfg`)
  and answers in "Demo mode" while it is blank. Keep it that way — never embed `GEMINI_API_KEY` in the APK.
- Icon added the same way as the Notes app (`res/drawable/ic_launcher_{background,foreground,monochrome}.xml` +
  `res/mipmap-anydpi-v26/ic_launcher{,_round}.xml`): the glass sphere from the app's empty state. Manifest label
  `Assistant`, applicationId `com.example.glassassistant`, minSdk 26, targetSdk 35.
- Build: same toolchain as GlassNotes — `flutter-android-builder` + Gradle **8.9** + the `-Dorg.gradle.jvmargs`
  heap flag (AGP 8.7.3 needs Gradle ≥ 8.9 and dies on the default heap). Copy the source to a host-mounted work
  dir, `assembleRelease`, `zipalign`, `apksigner sign` with `/tmp/glassbuild/debug.keystore`.
- Deliverable: `glass_assistant/dist/assistant.apk` (10.7 MB, debug-key signed), served at `/assistant.apk` by
  the nginx `web` service — `location = /assistant.apk` aliased to `/srv/assistant`, bind-mounted from
  `glass_assistant/dist` (directories, not single files into the read-only root).
- No emulator here: verified with `aapt dump badging` (package, label `Assistant`, minSdk 26, targetSdk 35,
  launchable `MainActivity`, adaptive icon present) and `apksigner verify`. Runtime behaviour (Gemini round-trip,
  glass tab bar) is not exercised.

## Cluck & Dash 3D (Flutter game)

- Source: `cluck_and_dash/` (`lib/*.dart`, `pubspec.yaml`). The zip as delivered did **not** compile:
  `world_painter.dart` referred to `eggs` instead of `engine.eggs`; that is fixed in the committed source.
  Dart only, no asset files, single dependency
  `shared_preferences`. The 3D-ish visuals are painted with `CustomPainter` (`lib/world_painter.dart`).
- Deliverable: `cluck_and_dash/dist/cluck_and_dash.apk` (Flutter release build), still downloadable at
  `http://localhost:3000/cluck_and_dash.apk` through the nginx `web` service (its own `index.html` is not the
  preview landing page — `assistant_site/index.html` is).

### Rebuilding the APK

The zip this project came from has no `android/` platform folder, so the Android scaffold has to be generated once.
Flutter is **not** installed on the sandbox host — everything runs in a container. A toolchain image with
Flutter stable + Android SDK (cmdline-tools, platform 35/36, build-tools 35/36) + JDK 17 can be built from a
Dockerfile that only installs SDKs (never copy app source into the image):

```bash
mkdir -p /tmp/apkwork && \
docker run --rm -v /tmp/apkwork:/work -v /app/cluck_and_dash:/src:ro \
  -e GRADLE_USER_HOME=/work/gradle flutter-android-builder bash -lc '
  set -e
  cd /work
  flutter create --org com.cluckandash --project-name cluck_and_dash --platforms=android app
  cp -r /src/lib/. app/lib/
  cp /src/pubspec.yaml /src/analysis_options.yaml app/
  cd app && flutter pub get && flutter build apk --release
  cp build/app/outputs/flutter-apk/app-release.apk /work/cluck_and_dash.apk'
```

Smoke check without a device: a `flutter test` widget test that sets a 390×844 surface, taps *Start Run*, pumps frames
and renders `matchesGoldenFile` images for menu / playing / game over proves the game boots, ticks and paints.
Text shows as black boxes there (the test fonts are the Ahem placeholders) and the "Best run" capsule reports a
~12 px `RenderFlex` overflow — an artifact of those square fonts, not of real devices. `shared_preferences` needs
`SharedPreferences.setMockInitialValues({})` and the pub cache must be on a host-mounted path, otherwise the
ephemeral container's `/root/.pub-cache` paths in `.dart_tool/package_config.json` go stale between runs.

Notes learned the hard way:

- `flutter create` is run into an empty `app/` directory and the real `lib/` + `pubspec.yaml` are copied over it —
  running it inside the source directory risks the template overwriting files.
- The first `flutter build apk` downloads the Android NDK, Gradle and AGP artifacts (several hundred MB, ~5–10 min).
  Keep `GRADLE_USER_HOME` on a host-mounted path so a rebuild does not re-download Gradle.
- The release APK is debug-key signed (fine for sideloading); a Play Store upload would need a real keystore.
- `docker run` started in the background with `nohup … &` keeps going after `run_shell_command` returns, so a long
  build can be started once and watched with `tail -f` on its log.

## Blob Wallet (Android WebView wrapper)

- Source: `blob_wallet/` (from the uploaded zip): Kotlin `MainActivity` hosts a WebView over the local
  `app/src/main/assets/index.html` wallet UI (`https://appassets.androidplatform.net/assets/index.html` through
  `WebViewAssetLoader`), package `ge.blobwallet.app`, label `Blob Wallet`, minSdk 24.
- Build: the zip has no Gradle wrapper. Same toolchain as the other apps (`flutter-android-builder` + Gradle
  **8.9** + `-Dorg.gradle.jvmargs` heap flag). Only two build edits were needed: AGP 8.5.2 → **8.6.1** and
  compileSdk/targetSdk 34 → **35**, because the image only carries SDK platforms 35/36.
- Icon: the artwork is the user-supplied 512 px squircle, kept at `blob_wallet/icon-source.png` (and as
  `blob_wallet/dist/icon.png`). `mipmap-*/ic_launcher{,_round}.png` are that image scaled to 48/72/96/144/192;
  `mipmap-*/ic_foreground.png` is the same artwork **full-bleed** at 108/162/216/324/432 for the existing adaptive
  icon, whose background is `@color/ic_bg` (#B9AEFF). That colour is exactly the icon's own lavender, so the
  squircle's edge is invisible under the adaptive mask — do not add padding around the foreground, it only makes
  the blob shrink.
- The uploaded `BlobWallet-android1.zip` update (versionCode **2** / 1.1, same package) turned `index.html` into an
  account-gated app: a lavender sign-in overlay (`#auth`, email+password hashed with `crypto.subtle` and kept in
  `localStorage` under `bw3a`/`bw3u`, or a Google preview sheet when `GOOGLE_CLIENT_ID` is empty), a ₾0.00 starting
  balance, `#topb` top-up and Sign out on the profile tab. Its build files went back to AGP 8.5.2 / compileSdk 34;
  keep this repo's 8.6.1 / 35 bump. The zip's own mipmap PNGs are the original artwork — the committed icons stay
  the scaled user-supplied squircle described below.
- Deliverable: `blob_wallet/dist/blob_wallet.apk` (2.7 MB, debug-key signed), served at `/blob_wallet.apk`
  (nginx `alias` → `/srv/blobwallet`, bind-mounted from `blob_wallet/dist`), with a card on `/builds.html`.
- Verified: `aapt dump badging` (package, label, minSdk 24, targetSdk 35, launchable `MainActivity`, adaptive
  icon) and `apksigner verify`; the packaged 432×432 foreground compares byte-identical to the generated
  `mipmap-xxxhdpi/ic_foreground.png`. Runtime behaviour is not exercised — there is no emulator here.

## Wallet (native Android, Kotlin + Compose, NFC tap-to-pay demo)

- Source: `mumin_wallet/` (from `MuminWallet-Android.zip`): `MainActivity` drives NFC reader mode + biometrics,
  `PayService` is an HCE `HostApduService`, `Wallet.kt` holds the demo balance/token/HMAC, `Ui.kt` renders the
  Wallet / Terminal tabs. Package `ge.mumin.wallet`, minSdk 30, targetSdk **35**.
- **Name**: the zip shipped as "Mumin Wallet"; the manifest label and `strings.xml` `hce_desc` were changed to
  **Wallet** at the user's request. The package id, theme name (`Theme.Mumin`) and directory keep the original
  `mumin` naming — renaming them would change the app's identity and let it install alongside itself.
- Build edits, same as Blob Wallet: AGP 8.5.2 → **8.6.1** and compileSdk/targetSdk 34 → **35** (the image only
  has platforms 35/36). Compose compiler 1.5.14 pairs with Kotlin 1.9.24 — do not bump one alone.
- No launcher icon in the zip, so the APK uses the stock Android icon (the other apps got bespoke artwork; this
  one has none supplied).
- Deliverable: `mumin_wallet/dist/wallet.apk` (~39 MB — Compose + `material-icons-extended`), debug-key signed,
  served at `/wallet.apk` (nginx `alias` → `/srv/wallet`, bind-mounted from `mumin_wallet/dist`) with a card on
  `/builds.html`. The APK is a two-phone NFC demo: a real bank terminal will not accept it (see the project
  README), and there is no emulator here, so the tap-to-pay round trip is untested.

## Verifying the preview

`curl -sS http://localhost:3000/` must return the download page and
`curl -sSI http://localhost:3000/notes.apk` a `200` with `Content-Type: application/vnd.android.package-archive`
(`/cluck_and_dash.apk` and `/assistant.apk` must still answer the same way). Check the served bytes match the committed file:

```bash
curl -sS -o /tmp/dl.apk http://localhost:3000/notes.apk && sha256sum /tmp/dl.apk glass_notes/dist/notes.apk
```
