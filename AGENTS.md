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

Chat must produce real streamed model output: a canned, empty or "not configured"
answer means no key reached the server. The default model is the `gemini-flash-latest`
alias (3.8 Flash at the time of writing), and `server.ts` retries the other current
Flash models before giving up — the model ids in `src/constants/models.ts` must be ids
the API actually serves (`curl "$GEMINI_URL/v1beta/models?key=…"` lists them).

Desktop builds embed the key that is present while packaging: `scripts/build-exe.mjs`
writes `electron/bundled-env.json` (git-ignored, deleted again after packaging) into
the app package and `electron/main.cjs` loads it before the user's own `.env`, so a
downloaded `.exe`/installer chats with no setup. Anyone holding the artifact can
extract that key, so share the file only with people you would give the key to; a
build without the key still works, the user then pastes their own in Settings.

## Building the Windows executable

    docker compose -f docker-compose.base44.yml --profile exe run --rm exe-builder

That runs `scripts/build-exe.mjs`: `vite build` → `scripts/build-server.mjs` (bundles
`server.ts` into one `server.bundle.mjs`) → electron-builder, producing two x64
artifacts:

- `release/OmniChat-AI-Setup-<version>.exe` — the installer (NSIS, per-user, assisted:
  folder choice, desktop/start-menu shortcuts, uninstall entry). Version comes from
  `package.json`.
- `release/OmniChat-AI-portable.exe` — single file that runs without installing.

They are git-ignored and the running dev server serves them at
`/downloads/<name>` (route added in `server.ts`), so no rebuild is needed after a
new artifact lands: `express.static` reads the folder per request.

Building the installer runs Windows tools (makensis, and then the installer itself
once to emit its uninstaller) through Wine, so `exe-builder` uses its own image,
`docker/base44-exe-builder.Dockerfile` — the shared toolchain plus Debian `wine` and
`wine32:i386`. Rebuild it after changing that Dockerfile:

    docker compose -f docker-compose.base44.yml --profile exe build exe-builder

electron-builder's bundled Wine 11 toolset does not work in this image (`wine: failed
to load .../lib/wine/x86_64-unix/ntdll.dll error c0000135`), so `electron-builder.yml`
asks for no wine toolset and the `wine` on PATH is used instead.

Non-obvious points:

- The packaged app must not contain `node_modules`: everything runs from
  `server.bundle.mjs` + `dist/`, so `electron-builder.yml` excludes `node_modules`
  explicitly (otherwise ~173 MB of dev-time dependencies ship inside the .exe).
- The server bundle has to be ESM. Bundling `server.ts` to CommonJS fails because
  `import.meta.url` (used for `__dirname`) is empty in CJS output.
- `asar` is off so Electron's ESM loader can import `server.bundle.mjs` from disk.
- The portable .exe needs no Wine; the NSIS installer does (see above), which is why
  the packaging service has its own image.
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

- Whether a packaged build really carries a key is checkable without printing it: build
  the Linux variant of the same package, run it under Xvfb and read `hasGeminiKey` from
  its own `/api/config` (regenerate `electron/bundled-env.json` from the container env
  first, and delete it again afterwards) — see the smoke test above, plus
  `curl -sN -X POST http://127.0.0.1:4123/api/chat` for a real streamed answer.
- The installer can only be checked structurally in the sandbox: the packaging run
  succeeds, electron-builder's own `nsisValidation` rejects a truncated installer, and
  the file downloads from `/downloads/`. Running it here under Wine
  (`OmniChat-AI-Setup-<version>.exe /S /D=C:\dir`, with and without Xvfb) hangs or exits
  2 without installing anything, so installation itself has to be checked on Windows.
- Known pre-existing issue in the imported UI code: the browser console logs a React
  "two children with the same key" error. It is not caused by the sandbox setup.
