# FitX

A native iOS fitness app design — **SwiftUI sources + a browser preview of every screen**.

The SwiftUI app is the product; `web/` is a faithful, interactive mock of it so the design
can be reviewed (and shared) without Xcode.

```
fitx/
├── ios/
│   ├── project.yml            XcodeGen manifest → FitX.xcodeproj
│   └── FitX/
│       ├── FitXApp.swift
│       ├── Theme.swift                 palette, cards, glass surfaces, screen header
│       ├── Model/Workout.swift         Workout, WorkoutKind, sample data
│       ├── Components/
│       │   ├── FloatingTabBar.swift    floating glass taskbar + spring pill
│       │   ├── RouteMapView.swift      stylised dark route map (Canvas + shape)
│       │   ├── WorkoutRow.swift        workout row, stat tile, activity rings
│       │   └── FilterChip.swift
│       └── Screens/
│           ├── RootView.swift          tab container, bar overlay
│           ├── TodayScreen.swift
│           ├── ProgressScreen.swift
│           ├── WorkoutsScreen.swift
│           └── WorkoutSummaryScreen.swift
└── web/                        zero-dependency preview server + screens
```

## Run the iOS app

```bash
cd fitx/ios
brew install xcodegen        # once
xcodegen generate
open FitX.xcodeproj
```

Then pick an iPhone simulator and run. Minimum iOS 17.0 (uses `UnevenRoundedRectangle`,
`Canvas`, `matchedGeometryEffect`).

To use it in an existing project instead, drag the `FitX/` folder in and keep
`UIUserInterfaceStyle = Dark` in the Info.plist.

## Run the web preview

```bash
docker compose -f docker-compose.base44.yml up -d
# http://localhost:3000
```

No dependencies: `fitx/web/server.mjs` is a plain Node static server with live reload over
Server-Sent Events. Editing anything in `fitx/web` reloads the browser.

## Screens

| Screen | What it shows |
| --- | --- |
| **Today** | Three activity rings, quick stats grid, latest workout |
| **Progress** | Distance bar chart with Week / Month / Year ranges, pace + training load, personal bests |
| **Workouts** | Month totals, All / Run / Ride / Strength filters, activity list |
| **Workout Summary** | Dark route map, key stats grid, weather + favorite badges |

## Floating glass taskbar

The centrepiece of the design, implemented natively in `FloatingTabBar.swift`:

- `.ultraThinMaterial` + a white gradient overlay + hairline border → real glass, not a flat fill
- a pink pill behind the active tab that travels with `matchedGeometryEffect` and a
  spring (`.spring(response: 0.5, dampingFraction: 0.74)`)
- the whole bar drifts up 4 pt over 3.6 s, `repeatForever(autoreverses: true)`
- active icon is tinted pink with a soft glow; inactive items sit at 55% white

The web preview reproduces the same behaviour with `backdrop-filter`, a translating
indicator element and a keyframe float.
