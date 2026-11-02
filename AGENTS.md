# Repository notes (Base44 sessions)

## What this repository is

This checkout is the **archlinuxcn package repository** (PKGBUILDs under `alarmcn/` and
`archlinuxcn/`). It is not a web application and has no build system of its own.

The FitX iOS design lives in `fitx/` and is the only runnable UI here:

- `fitx/ios/` — SwiftUI app sources (Xcode only, cannot be compiled in this sandbox).
- `fitx/web/` — dependency-free browser preview of the same screens, served on port 3000.

## Running

```bash
docker compose -f docker-compose.base44.yml up -d
curl -s http://localhost:3000/ | head
```

`fitx/web/server.mjs` is a plain Node server (no npm dependencies) that serves the
`fitx/web` directory and injects a live-reload client. Editing files under `fitx/web/`
reloads the preview automatically — no rebuild, no restart.

Because the source is bind-mounted read-write and no packages are installed, there is
nothing to rebuild when only markup/CSS/JS changes.

## Verifying

- Web: `curl -sI http://localhost:3000/` should return `200`; the page must render the
  phone with the floating glass taskbar.
- SwiftUI: cannot be compiled or previewed on Linux. Validate changes in Xcode
  (`xcodegen generate` then run on an iPhone simulator); otherwise report the change as
  not verified.
