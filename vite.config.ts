import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const target = process.env.CHALLENGE_TARGET === 'reference' ? 'reference-solution' : 'starter';
const targetRoot = path.resolve(__dirname, target);

export default defineConfig({
  root: targetRoot,
  plugins: [react()],
  css: {
    postcss: {
      plugins: [],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(targetRoot, 'src'),
    },
  },
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: false,
  },
  build: {
    outDir: path.resolve(__dirname, 'dist', target),
    emptyOutDir: true,
  },
});
