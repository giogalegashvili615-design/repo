# iOS 26 Music — Android app

The iOS 26 style music player, packaged as an Android app.
It loads `app/src/main/assets/index.html` in a WebView, so the design is identical to the web version.

## Build the APK (about 5 minutes the first time)

1. Install **Android Studio** (free): https://developer.android.com/studio
2. **File > Open** and choose this `iOS26Music-Android` folder. Wait for "Gradle sync" to finish
   (it downloads the Android SDK pieces it needs automatically).
3. Menu **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
4. Click **locate** in the popup. The file is `app/build/outputs/apk/debug/app-debug.apk`.
5. Copy it to your phone and open it (allow "Install unknown apps" when asked).

Or, with a terminal and JDK 17 + the Android SDK installed: `./gradlew assembleRelease`
(output: `app/build/outputs/apk/release/app-release.apk`, installable directly).

## Using your own music

Open **Library > Add MP3** and pick files. Any file works, including ones with no extension.
Tracks are saved inside the app and stay after you close it.
Songs from Search/Home are 30-second previews; your own files play in full.

## Notes

- Minimum Android version: 8.0 (API 26).
- The Back button closes Now Playing / Up Next first, then sends the app to the background.
- To change the design, edit `app/src/main/assets/index.html` and rebuild.
