# Math Agent (Android)

Jetpack Compose app: red and white, floating clear-glass tab bar (Solve, Graph, Practice, History).

## Open and run
1. Android Studio Koala (2024.1) or newer: File > Open > select this `MathAgent` folder.
2. Let Gradle sync (it downloads Gradle 8.7 and the dependencies the first time).
3. Pick an emulator or a phone (Android 8.0+) and press Run.

## What it does
- Solve: arithmetic, percentages, linear and quadratic equations with steps (works offline).
- Graph: plots any function of x, zoom slider, zero crossings.
- Practice: random problems with a streak counter.
- History: tap to solve again.

## Notes
- Trig functions use radians.
- The tab bar and input box use translucent gradients, a bright rim and a soft shadow for the glass look. Android has no built-in blur of the content behind a view, so the glass is "clear" rather than frosted.
- Photo solving is not included in this version.
