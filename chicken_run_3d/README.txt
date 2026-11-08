CHICKEN RUN 3D - Android Studio project

1. Open Android Studio > File > Open > select this ChickenRun3D folder. Let Gradle sync
   (it downloads Gradle 8.7 and the Android Gradle Plugin automatically).
2. Run on a phone/emulator (Run > Run 'app'), or Build > Build APK(s).

OFFLINE PLAY (optional): the game uses three.js r128. By default the app loads it from
cdnjs, so the first launch needs internet. To play fully offline, download
https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js
and save it as app/src/main/assets/three.min.js before building. The app picks it up
automatically.

The game itself is app/src/main/assets/index.html. Edit it to change gameplay.
Requirements: Android 7.0+ (API 24), Android Studio with JDK 17.
