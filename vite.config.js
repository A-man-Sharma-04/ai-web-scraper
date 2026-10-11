import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Frontend sources live in client/ (server code stays at the repo root).
// In development, /api requests are proxied to the Express backend on port 3001.
// In production (Vercel), /api is handled by the serverless function in api/.
export default defineConfig({
  root: 'client',
  plugins: [react()],
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
  server: {
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
});
