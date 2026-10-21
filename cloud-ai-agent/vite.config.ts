import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

// Base44 sandbox preview support: the preview reaches the dev server through a
// proxy, so the forwarded Host is "<port>-<sandbox id>.$BASE44_SANDBOX_HOST_DOMAIN"
// and Vite's host check has to allow that domain. Only applied with
// BASE44_PREVIEW_MODE=1; otherwise the original defaults are used.
const sandboxHostDomain = process.env.BASE44_SANDBOX_HOST_DOMAIN;
const allowedHosts =
  process.env.BASE44_PREVIEW_MODE === '1' && sandboxHostDomain
    ? ['localhost', sandboxHostDomain, `.${sandboxHostDomain}`]
    : undefined;

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      allowedHosts,
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch:
        process.env.DISABLE_HMR === 'true'
          ? null
          : {
              // Build output must not trigger dev-server reloads.
              ignored: ['**/release/**', '**/dist/**'],
            },
    },
  };
});
