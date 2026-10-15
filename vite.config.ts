import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, Plugin} from 'vite';
import {setupChatWaveBackend} from './server/serverMiddleware';

function chatWaveBackendPlugin(): Plugin {
  return {
    name: 'chatwave-backend',
    configureServer(server) {
      setupChatWaveBackend(server);
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), chatWaveBackendPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

