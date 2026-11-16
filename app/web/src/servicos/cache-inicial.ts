/**
 * Primeiro acesso: o service worker só passa a cuidar da página alguns instantes depois de ela abrir. O que a página
 * carregou antes disso (arte da entrada, primeiras falas, figuras) não ficou guardado no aparelho. Quando o service
 * worker assume, pede de novo esses arquivos através dele: quase sempre vêm do cache do navegador (sem gastar dados)
 * e ficam guardados para abrir sem internet. Nas visitas seguintes não faz nada.
 */
const MIDIA = /\.(?:webp|png|jpe?g|svg|gif|mp3|wav|ogg|json|glb|webm|mp4)$/i;

export function guardarOQueJaCarregou(): void {
  try {
    const sw = navigator.serviceWorker;
    if (!sw || sw.controller) return;
    sw.addEventListener('controllerchange', () => {
      const vistos = new Set<string>();
      for (const e of performance.getEntriesByType('resource')) {
        const u = new URL(e.name, location.href);
        if (u.origin !== location.origin || !MIDIA.test(u.pathname)) continue;
        u.hash = '';
        vistos.add(u.href);
      }
      for (const u of vistos) void fetch(u).catch(() => undefined);
    }, { once: true });
  } catch { /* navegador sem service worker */ }
}
