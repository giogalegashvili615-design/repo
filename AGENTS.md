# Working notes for this repository

This repository is the **archlinuxcn package collection** (`alarmcn/`, `archlinuxcn/`, `parse-pkgbuild`, `pre-commit`, …).
It has no web application of its own, so nothing here is "the app" — `docker-compose.base44.yml` only serves build
artifacts for the sandbox preview.

## Cluck & Dash 3D (Flutter game)

- Source: `cluck_and_dash/` (`lib/*.dart`, `pubspec.yaml`). The zip as delivered did **not** compile:
  `world_painter.dart` referred to `eggs` instead of `engine.eggs`; that is fixed in the committed source.
  Dart only, no asset files, single dependency
  `shared_preferences`. The 3D-ish visuals are painted with `CustomPainter` (`lib/world_painter.dart`).
- Deliverable: `cluck_and_dash/dist/cluck_and_dash.apk` (Flutter release build), listed by
  `cluck_and_dash/dist/index.html` and served by the nginx `web` service on host port 3000.

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

## Verifying the preview

`curl -sS http://localhost:3000/` must return the download page and
`curl -sSI http://localhost:3000/cluck_and_dash.apk` a `200` with `Content-Type: application/vnd.android.package-archive`.
