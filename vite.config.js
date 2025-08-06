import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: 'docs', // Serve from the docs directory
  base: '/', // Changed from '/smart-allergy-forecast-app/'
  publicDir: 'public',
  build: {
    outDir: '../dist', // Output to dist directory at root
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'docs/index.html'),
      },
    },
  },
  server: {
    port: 5173,
    open: true,
    host: true, // Allow connections from local network
  },
  preview: {
    port: 4173,
    open: true
  }
});
