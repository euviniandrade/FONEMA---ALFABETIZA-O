/// <reference lib="webworker" />
/**
 * Service worker do FONEMA (vite-plugin-pwa, estratégia injectManifest). Regras em ./regras.ts.
 *  - precache: só a casca do app (instala rápido e leve no primeiro acesso);
 *  - mídia (vozes, sons, figuras, vídeos, modelos 3D, Mundo 3D, Espelho): guardada no aparelho quando usada
 *    ("primeiro o aparelho"); pedidos com Range (áudio/vídeo) recebem o pedaço certo, também sem internet;
 *  - quem já tinha a versão antiga (tudo no precache) não perde nada: na instalação, a mídia que já estava no
 *    aparelho e não mudou passa para os caches novos sem baixar de novo.
 */
import { clientsClaim } from 'workbox-core';
import { cleanupOutdatedCaches, createHandlerBoundToURL, precacheAndRoute } from 'workbox-precaching';
import { NavigationRoute, registerRoute } from 'workbox-routing';
import { CacheFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import type { WorkboxPlugin } from 'workbox-core/types.js';
import { GRUPOS, IDADE_MAXIMA_S, PREFIXO_CACHE, fatiar, grupoDe, nomeDoCache, type Grupo } from './regras.ts';

declare const self: ServiceWorkerGlobalScope & { __WB_MANIFEST: Array<{ url: string; revision: string | null }> };
/** Versão de cada grupo de mídia (hash do conteúdo, calculado no build pelo vite.config.ts). */
declare const __FONEMA_VERSOES__: Record<Grupo, string>;
const VERSOES = __FONEMA_VERSOES__;

self.skipWaiting();
clientsClaim();

const relativo = (url: string): string | null => {
  const escopo = self.registration.scope;
  return url.startsWith(escopo) ? url.slice(escopo.length).split(/[?#]/)[0] : null;
};

/* ------------------------------------------------ mídia sob demanda (antes do precache, para migrar na instalação) */
const caches_atuais = new Set((Object.keys(GRUPOS) as Grupo[]).map((g) => nomeDoCache(g, VERSOES[g])));

/** Busca o arquivo inteiro (sem Range: assim a resposta é 200 e pode ser guardada) e entrega o pedaço pedido. */
const inteiroEFatiado: WorkboxPlugin = {
  requestWillFetch: async ({ request }) => (request.headers.has('range') ? new Request(request.url, { credentials: 'same-origin' }) : request),
  handlerWillRespond: async ({ request, response }) => fatiar(response, request.headers.get('range'))
};

const migracao = new URL('midia-revisoes.json', self.registration.scope).href;

self.addEventListener('install', (e) => { e.waitUntil(migrarPrecacheAntigo().catch(() => undefined)); });
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((nomes) => Promise.all(nomes.filter((n) => n.startsWith(PREFIXO_CACHE) && !caches_atuais.has(n)).map((n) => caches.delete(n)))));
});

/**
 * Versões antigas guardavam toda a mídia no precache. Antes que o precache novo apague essas entradas, copia para os
 * caches de mídia as que continuam iguais (mesma revisão do workbox = md5 do conteúdo). Só roda se houver o que migrar.
 */
async function migrarPrecacheAntigo() {
  const nomes = (await caches.keys()).filter((n) => n.startsWith('workbox-precache'));
  if (!nomes.length) return;
  let revisoes: Record<string, string> | null = null;
  for (const nome of nomes) {
    const antigo = await caches.open(nome);
    for (const req of await antigo.keys()) {
      const u = new URL(req.url);
      const rev = u.searchParams.get('__WB_REVISION__');
      u.searchParams.delete('__WB_REVISION__');
      const rel = relativo(u.href);
      const g = rel ? grupoDe(rel) : null;
      if (!rel || !g || !rev) continue;
      revisoes ??= await fetch(migracao, { cache: 'no-store' }).then((r) => (r.ok ? r.json() : {})).catch(() => ({}));
      if (revisoes?.[rel] !== rev) continue; // mudou (ou sumiu): baixa de novo quando for usada
      const destino = await caches.open(nomeDoCache(g, VERSOES[g]));
      if (await destino.match(u.href)) continue;
      const resp = await antigo.match(req);
      if (resp?.ok) await destino.put(u.href, resp);
    }
  }
}

for (const g of Object.keys(GRUPOS) as Grupo[]) {
  registerRoute(
    ({ url, request }) => request.method === 'GET' && url.origin === self.location.origin && grupoDe(relativo(url.href) ?? '') === g,
    new CacheFirst({
      cacheName: nomeDoCache(g, VERSOES[g]),
      plugins: [
        inteiroEFatiado,
        new ExpirationPlugin({ maxEntries: GRUPOS[g].maxArquivos, maxAgeSeconds: IDADE_MAXIMA_S, purgeOnQuotaError: true })
      ]
    })
  );
}

/* ------------------------------------------------ casca do app */
precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();
// páginas embutidas por iframe (mundo3d, espelho) não podem cair no app
registerRoute(new NavigationRoute(createHandlerBoundToURL('index.html'), { denylist: [/\/mundo3d\//, /\/espelho\//] }));
