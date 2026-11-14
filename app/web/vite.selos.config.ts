import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

// Bancada dos selos 3D (src/bancada-selos.tsx) e servidor de capturas: fora do app publicado.
// Cache próprio para não disputar o node_modules/.vite com outro servidor aberto ao mesmo tempo.
//   npx vite -c vite.selos.config.ts --port 5199        (abre /bancada-selos.html#metais)
export default defineConfig({
  base: './',
  cacheDir: 'node_modules/.vite-selos',
  plugins: [react()],
  build: { rollupOptions: { input: [resolve(__dirname, 'bancada-selos.html')] } }
});
