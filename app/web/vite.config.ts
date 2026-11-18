import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { GRUPOS, PRECACHE_IGNORAR, PRECACHE_PADROES, grupoDe, type Grupo } from './sw/regras.ts';

/**
 * Mídia guardada sob demanda pelo service worker (sw/regras.ts): md5 de cada arquivo (igual à revisão do workbox,
 * serve para migrar o precache antigo sem baixar de novo) e uma versão por grupo (muda quando algum arquivo muda).
 */
function midiaPublica() {
  const raiz = join(import.meta.dirname, 'public');
  const revisoes: Record<string, string> = {};
  const porGrupo = Object.fromEntries(Object.keys(GRUPOS).map((g) => [g, createHash('sha1')])) as Record<Grupo, ReturnType<typeof createHash>>;
  const andar = (d: string) => {
    for (const e of readdirSync(d, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const f = join(d, e.name);
      if (e.isDirectory()) { andar(f); continue; }
      const rel = relative(raiz, f).split(sep).join('/');
      const g = grupoDe(rel);
      if (!g) continue;
      const md5 = createHash('md5').update(readFileSync(f)).digest('hex');
      revisoes[rel] = md5;
      porGrupo[g].update(`${rel}:${md5}\n`);
    }
  };
  andar(raiz);
  const versoes = Object.fromEntries(Object.entries(porGrupo).map(([g, h]) => [g, h.digest('hex').slice(0, 10)])) as Record<Grupo, string>;
  return { revisoes, versoes };
}
const midia = midiaPublica();

/** Figuras e modelos de public/assets (lista para a aba Imagens do gerenciador). */
function imagensPublicas(): string[] {
  const raiz = join(import.meta.dirname, 'public/assets');
  const out: string[] = [];
  const andar = (d: string) => {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      const f = join(d, e.name);
      if (e.isDirectory()) andar(f);
      else if (/\.(webp|png|jpe?g|glb)$/i.test(e.name)) out.push(relative(raiz, f).split(sep).join('/'));
    }
  };
  andar(raiz);
  return out.sort();
}

// base relativa ('./') + roteamento por hash: o dist/ funciona em qualquer subcaminho de um site estático.
export default defineConfig({
  base: './',
  define: { __FONEMA_VERSOES__: JSON.stringify(midia.versoes), __FONEMA_IMAGENS__: JSON.stringify(imagensPublicas()) },
  plugins: [
    react(),
    {
      // lido só pelo service worker novo, uma vez, quando o aparelho ainda tem a mídia no precache antigo
      name: 'fonema-midia-revisoes',
      apply: 'build',
      generateBundle() { this.emitFile({ type: 'asset', fileName: 'midia-revisoes.json', source: JSON.stringify(midia.revisoes) }); }
    },
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      strategies: 'injectManifest',
      srcDir: 'sw',
      filename: 'sw.ts',
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
      injectManifest: {
        globPatterns: PRECACHE_PADROES,
        globIgnores: PRECACHE_IGNORAR,
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
        // só os pedaços com hash no nome (JS/CSS do vite) dispensam revisão; fontes e o resto levam a revisão do conteúdo
        dontCacheBustURLsMatching: /^assets\/[^/]*-[A-Za-z0-9_-]{8}\.(?:js|css)$/
      }
    })
  ],
  server: { port: 5173 },
  build: { outDir: 'dist', chunkSizeWarningLimit: 900 }
});
