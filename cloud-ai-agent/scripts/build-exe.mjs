/**
 * Builds the Windows desktop executable for OmniChat AI:
 *   1. vite build        -> dist/             (frontend)
 *   2. bundleServer()    -> server.bundle.mjs (API server, single file)
 *   3. electron-builder  -> release/OmniChat-AI-Setup-<version>.exe (installer)
 *                           release/OmniChat-AI-portable.exe       (no install)
 *
 * The artifact in release/ is git-ignored and is served by the running app at
 * /downloads/<file> (see server.ts), so it can be fetched from the preview.
 *
 * In the Base44 sandbox:
 *   docker compose -f docker-compose.base44.yml --profile exe run --rm exe-builder
 * Locally with Node.js installed:
 *   bun install && node scripts/build-exe.mjs
 */
import { spawn } from 'node:child_process';
import { readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build as viteBuild } from 'vite';
import { bundleServer } from './build-server.mjs';

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const releaseDir = path.join(appRoot, 'release');

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd: appRoot, stdio: 'inherit' });
    child.on('error', reject);
    child.on('exit', (code) =>
      code === 0 ? resolve() : reject(new Error(`${command} exited with code ${code}`))
    );
  });
}

console.log('== 1/3 building the frontend (vite build) ==');
await viteBuild();

console.log('== 2/3 bundling the local API server ==');
await bundleServer();

// Model keys available to the build (GEMINI_API_KEY from the Base44 secrets) are
// embedded into the app package, so the downloaded .exe can chat without the
// user pasting a key. The file lives inside the package, not the repository, and
// is deleted again below.
const bundledEnvPath = path.join(appRoot, 'electron', 'bundled-env.json');
const embeddedKeys = ['GEMINI_API_KEY', 'ANTHROPIC_API_KEY'].filter((name) => process.env[name]);
await rm(bundledEnvPath, { force: true });
if (embeddedKeys.length > 0) {
  const bundled = Object.fromEntries(embeddedKeys.map((name) => [name, process.env[name]]));
  await writeFile(bundledEnvPath, JSON.stringify(bundled, null, 2));
  console.log(`== embedding ${embeddedKeys.join(', ')} into the desktop build ==`);
}

console.log('== 3/3 packaging the Windows executable (electron-builder) ==');
const builderBin = path.join(
  appRoot,
  'node_modules',
  '.bin',
  process.platform === 'win32' ? 'electron-builder.cmd' : 'electron-builder'
);
try {
  await run(builderBin, ['--win', '--x64', '--config', 'electron-builder.yml', '--publish', 'never']);
} finally {
  await rm(bundledEnvPath, { force: true });
}

const artifacts = (await readdir(releaseDir)).filter((name) => name.endsWith('.exe'));
if (artifacts.length === 0) {
  throw new Error(`electron-builder produced no .exe in ${releaseDir}`);
}
for (const name of artifacts) {
  console.log(`== built release/${name} — downloadable at /downloads/${name} ==`);
}
