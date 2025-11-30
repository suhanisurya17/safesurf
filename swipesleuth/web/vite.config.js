import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: '0.0.0.0', // Listen on all interfaces (IPv4 and IPv6)
    open: true,
    headers: {
      'Content-Security-Policy': "script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval' blob: http://localhost:* http://127.0.0.1:*"
    }
  }
});

