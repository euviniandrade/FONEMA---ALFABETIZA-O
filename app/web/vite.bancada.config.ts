import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

// Bancada de teste dos personagens vivos (src/bancada-vivo.tsx): build separado, fora do app publicado.
export default defineConfig({
  base: './',
  plugins: [react()],
  build: { rollupOptions: { input: resolve(__dirname, 'bancada-vivo.html') } }
});
