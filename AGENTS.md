# Base44 sandbox notes

This repository is the archlinuxcn pacman package repository (packages live in
`archlinuxcn/` and `alarmcn/`). It also carries an app for the Base44 sandbox,
kept outside the packaging tree so the repo's `pre-commit` check does not treat
it as a package:

- `cloud-ai-agent/` — "OmniChat AI": Vite + React front end with an Express API
  server (`server.ts`) streaming Gemini and Anthropic responses. Imported from an
  AI Studio export, plus an Electron wrapper for the desktop build.
- `docker-compose.base44.yml` — the sandbox environment (service `web` on port 3000,
  one-shot `exe-builder`).
- `docker/base44-node-bun.Dockerfile` — Node 22 (runs the app and the Electron
  packaging tools) plus Bun (installs from the committed `bun.lock`; npm has no
  lockfile here and would resolve versions freely).

## Running it here

    docker compose -f docker-compose.base44.yml up -d --build

`web` bind-mounts `cloud-ai-agent/` and runs `npx tsx watch server.ts` with
`NODE_ENV=development`, so `server.ts` mounts the Vite dev server as Express
middleware: the preview serves live source and edits hot-reload. `node_modules`
lives in a Docker volume, so run package commands through the container
(`docker compose -f docker-compose.base44.yml exec web npx …`) rather than on the host.

The Vite host check is extended in `vite.config.ts` for the preview proxy host,
gated on `BASE44_PREVIEW_MODE === '1'`; unset, the config keeps its defaults.

Keys: `GEMINI_API_KEY` / `ANTHROPIC_API_KEY` are delivered on `/run/base44/app.env`
(declared in `.base44/environment.json`). The app boots without them and the models
then report "key is not configured"; a key can also be entered in the app's own
Settings dialog, or placed in a `.env` next to the desktop `.exe`.

## Building the Windows executable

    docker compose -f docker-compose.base44.yml --profile exe run --rm exe-builder

That runs `scripts/build-exe.mjs`: `vite build` → `scripts/build-server.mjs` (bundles
`server.ts` into one `server.bundle.mjs`) → electron-builder →
`release/OmniChat-AI-portable.exe` (~100 MB, x64 portable, no installer needed).
The artifact is git-ignored, and the running dev server serves it for download at
`/downloads/OmniChat-AI-portable.exe` (route added in `server.ts`).

Non-obvious points:

- The packaged app must not contain `node_modules`: everything runs from
  `server.bundle.mjs` + `dist/`, so `electron-builder.yml` excludes `node_modules`
  explicitly (otherwise ~173 MB of dev-time dependencies ship inside the .exe).
- The server bundle has to be ESM. Bundling `server.ts` to CommonJS fails because
  `import.meta.url` (used for `__dirname`) is empty in CJS output.
- `asar` is off so Electron's ESM loader can import `server.bundle.mjs` from disk.
- electron-builder produces the Windows portable .exe on Linux without Wine.
- Never publish the built artifact into `public/`: `vite build` copies `public/`
  into `dist/`, which would embed the .exe inside the app payload.
- The portable `.exe` writes its own copy of the app to a temp folder at run time;
  `.env` lookup covers both that folder and `PORTABLE_EXECUTABLE_DIR`.

## Verifying

- `curl -s http://localhost:3000/api/config` returns the model list when the API is up.
- The desktop shell can be smoke-tested headlessly (proves the packaged Electron
  app boots the bundled server and serves the built frontend). The Linux binary is
  named after `package.json` `name`, so it is `react-example`:

      docker compose -f docker-compose.base44.yml --profile exe run --rm exe-builder sh -c '
        cd /app
        npx electron-builder --linux dir --config electron-builder.yml --publish never
        Xvfb :99 -screen 0 1280x900x24 & sleep 2
        DISPLAY=:99 ./release/linux-unpacked/react-example --no-sandbox --disable-gpu & sleep 12
        curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:4123/api/config'
      # expect 200; dbus errors in the log are container noise

- Known pre-existing issue in the imported UI code: the browser console logs a React
  "two children with the same key" error. It is not caused by the sandbox setup.
