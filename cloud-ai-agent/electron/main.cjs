/**
 * Electron entry point for the OmniChat AI desktop app.
 *
 * It boots the bundled Express server (server.bundle.mjs, built from server.ts
 * by scripts/build-server.mjs) inside the Electron main process and shows the
 * app in a native window, so the packaged .exe needs no Node.js install.
 */
const { app, BrowserWindow, shell } = require('electron');
const fs = require('fs');
const net = require('net');
const path = require('path');
const { pathToFileURL } = require('url');

const APP_ROOT = path.join(__dirname, '..');
const SERVER_BUNDLE = path.join(APP_ROOT, 'server.bundle.mjs');
const START_PORT = Number(process.env.PORT) || 4123;
// `bun run electron:dev` opens a running Vite dev server instead of the bundle.
const DEV_URL = process.env.OMNICHAT_DEV_URL || '';

function findFreePort(startPort) {
  return new Promise((resolve, reject) => {
    let port = startPort;
    const attempt = () => {
      if (port > startPort + 20) {
        reject(new Error('No free port found for the local OmniChat server'));
        return;
      }
      const probe = net.createServer();
      probe.once('error', () => {
        port += 1;
        attempt();
      });
      probe.once('listening', () => probe.close(() => resolve(port)));
      probe.listen(port, '127.0.0.1');
    };
    attempt();
  });
}

async function waitForServer(url, timeoutMs = 30000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url);
      if (response.ok) return true;
    } catch {
      // not up yet
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  return false;
}

/**
 * Keys embedded while packaging (scripts/build-exe.mjs writes
 * electron/bundled-env.json into the app), so an installed app can chat right
 * away. A `.env` next to the .exe and a key entered in the Settings dialog both
 * take precedence over these.
 */
function loadBundledEnv() {
  try {
    const bundled = JSON.parse(fs.readFileSync(path.join(__dirname, 'bundled-env.json'), 'utf8'));
    for (const [key, value] of Object.entries(bundled)) {
      if (value && !process.env[key]) process.env[key] = String(value);
    }
  } catch {
    // this build carries no embedded keys
  }
}

/**
 * Optional .env next to the .exe, so a user can keep GEMINI_API_KEY /
 * ANTHROPIC_API_KEY outside the app (the Settings dialog also accepts keys).
 */
function loadEnvFile() {
  const candidates = [
    process.env.PORTABLE_EXECUTABLE_DIR,
    path.dirname(app.getPath('exe')),
    process.cwd(),
  ]
    .filter(Boolean)
    .map((dir) => path.join(dir, '.env'));
  for (const file of candidates) {
    try {
      process.loadEnvFile(file);
      return file;
    } catch {
      // optional file
    }
  }
  return null;
}

async function resolveAppUrl() {
  if (DEV_URL) {
    if (!(await waitForServer(DEV_URL))) {
      throw new Error(`Dev server not reachable at ${DEV_URL}`);
    }
    return DEV_URL;
  }

  loadBundledEnv();
  loadEnvFile();
  const port = await findFreePort(START_PORT);
  process.env.PORT = String(port);
  process.env.NODE_ENV = 'production';
  await import(pathToFileURL(SERVER_BUNDLE).href);

  const url = `http://127.0.0.1:${port}/`;
  if (!(await waitForServer(`${url}api/config`))) {
    throw new Error('The OmniChat server did not start');
  }
  return url;
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 400,
    minHeight: 560,
    title: 'OmniChat AI',
    backgroundColor: '#1a1a1c',
    autoHideMenuBar: true,
    webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true },
  });
  // Links in answers (and window.open) belong in the user's browser.
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
  return win;
}

if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on('second-instance', () => {
    const [win] = BrowserWindow.getAllWindows();
    if (win) {
      if (win.isMinimized()) win.restore();
      win.focus();
    }
  });

  app
    .whenReady()
    .then(async () => {
      const url = await resolveAppUrl();
      await createWindow().loadURL(url);
      app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow().loadURL(url);
      });
    })
    .catch((error) => {
      console.error('Failed to start OmniChat AI:', error);
      app.quit();
    });

  app.on('window-all-closed', () => app.quit());
}
