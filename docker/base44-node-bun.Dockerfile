# Shared sandbox toolchain for the OmniChat AI desktop app in cloud-ai-agent/.
#
# - Node runs the app (project dev script is `tsx server.ts`) and the Electron
#   packaging tools, which all expect a Node runtime.
# - Bun installs dependencies from the committed bun.lock.
# - The X libraries + xvfb are only used to smoke-test the Electron shell
#   headlessly in the sandbox (see AGENTS.md); they are not needed by the app.
FROM node:22

RUN npm install -g bun@1

RUN apt-get update \
 && apt-get install -y --no-install-recommends \
      xvfb \
      libgtk-3-0 \
      libnss3 \
      libasound2 \
      libgbm1 \
      libxss1 \
      libxtst6 \
      libatk-bridge2.0-0 \
      libdrm2 \
      fonts-liberation \
 && rm -rf /var/lib/apt/lists/*
