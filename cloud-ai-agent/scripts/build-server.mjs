/**
 * Bundles server.ts into a single self-contained ESM file (server.bundle.mjs)
 * that the Electron build runs inside its own main process, so the packaged
 * app carries no node_modules and no dev-only Vite branch.
 *
 * Run from cloud-ai-agent/: `node scripts/build-server.mjs`
 */
import { build } from 'esbuild';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/** Absolute path of the generated server bundle (sits next to dist/). */
export const SERVER_BUNDLE = path.join(appRoot, 'server.bundle.mjs');

export async function bundleServer() {
  await build({
    absWorkingDir: appRoot,
    entryPoints: ['server.ts'],
    outfile: SERVER_BUNDLE,
    bundle: true,
    platform: 'node',
    format: 'esm',
    target: 'node20',
    logLevel: 'info',
    // The packaged app always serves the built frontend, never the Vite dev
    // server: this removes the dynamic `import('vite')` branch in server.ts.
    define: { 'process.env.NODE_ENV': '"production"' },
    // Bundled CommonJS dependencies (express and friends) build their own
    // require calls; give the ESM output a working require.
    banner: {
      js: "import { createRequire } from 'module'; const require = createRequire(import.meta.url);",
    },
  });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await bundleServer();
}
