# Dialer26 – Android phone app (Kotlin + Jetpack Compose)

## Run it
1. Open this folder in Android Studio (Koala or newer). Let Gradle sync.
2. Run on a real phone (Android 10+). Emulators can't place real calls.
3. Allow contacts / call history / phone access when asked.
4. Tap **Set** on the banner (or menu → "Set as default phone app") and accept the system prompt.

## What's inside
- `MainActivity.kt`  Classic/Unified tab bar, keypad, recents (call log), contacts, favorites.
- `DialerInCallService.kt` + `InCallActivity.kt`  incoming/outgoing call screen once the app holds the dialer role.
- `AndroidManifest.xml`  the intent filters and `BIND_INCALL_SERVICE` service that Android requires for the dialer role.
- `Data.kt`  reads contacts and call log, places calls through `TelecomManager`.

Not included yet: call history writes, hold/merge/add-call, Bluetooth routing, contact detail screen, spam filtering.
