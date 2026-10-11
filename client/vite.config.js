import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// In development, forward /api requests to the Express backend on port 3001.
// In production (Vercel), /api is handled by the serverless function in api/.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
});
