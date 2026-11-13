import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// base relativa ('./') + roteamento por hash: o dist/ funciona em qualquer subcaminho de um site estático.
export default defineConfig({
  base: './',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['icones/*', 'espelho-embed.html'],
      manifest: {
        name: 'FONEMA · plataforma de alfabetização',
        short_name: 'FONEMA',
        description: 'Alfabetização pelo método fônico com Sofia e Tales.',
        lang: 'pt-BR',
        start_url: './',
        scope: './',
        display: 'standalone',
        orientation: 'any',
        background_color: '#FFF8EC',
        theme_color: '#1B3160',
        icons: [
          { src: 'icones/icone-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icones/icone-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icones/icone-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,webp,jpg,woff2,mp3,json}'],
        globIgnores: ['**/mundo3d/**/*.mp4'],
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
        navigateFallback: 'index.html',
        // páginas embutidas por iframe não podem cair no app
        navigateFallbackDenylist: [/espelho-embed\.html/, /\/mundo3d\//, /\/espelho\//],
        cleanupOutdatedCaches: true
      }
    })
  ],
  server: { port: 5173 },
  build: { outDir: 'dist', chunkSizeWarningLimit: 900 }
});
