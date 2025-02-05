import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
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
