import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],

  server: {
    proxy: {
      // Proxies /api/* to the local Express server (api/server.js on port 3001)
      // For ngrok testing, replace target with your ngrok URL
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      }
    }
  },

  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor'; // Separa las dependencias en un archivo aparte
          }
        },
      },
    },
    chunkSizeWarningLimit: 700, // Ajusta este valor si es necesario
  },
});
