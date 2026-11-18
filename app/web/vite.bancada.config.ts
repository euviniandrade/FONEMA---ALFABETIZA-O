import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

// Bancadas de teste (personagens vivos: src/bancada-vivo.tsx; traçado e estúdio de sons: src/bancada-tracado.tsx):
// build separado, fora do app publicado.
export default defineConfig({
  base: './',
  plugins: [react()],
  build: { rollupOptions: { input: [resolve(__dirname, 'bancada-vivo.html'), resolve(__dirname, 'bancada-tracado.html'), resolve(__dirname, 'bancada-avatar.html')] } }
});
