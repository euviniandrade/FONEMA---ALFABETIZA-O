/** Sinalizadores do ambiente. `fonema-teste-rapido` (localStorage) acelera falas e animações nos testes E2E. */
export const modoTeste = (): boolean => {
  try { return localStorage.getItem('fonema-teste-rapido') === '1'; } catch { return false; }
};
export const espera = (ms: number) => new Promise<void>((r) => setTimeout(r, modoTeste() ? Math.min(ms, 30) : ms));
/**
 * Endereço de um arquivo de assets/. Se o administrador trocou a figura ou o modelo NESTE aparelho (gerenciador,
 * servicos/edicoes.ts), devolve o arquivo trocado (blob:) no lugar do original.
 */
export const asset = (caminho: string) => TROCADOS.get(normalizarCaminhoAsset(caminho)) ?? `./assets/${caminho}`;
/** Figuras/modelos trocados pelo administrador: caminho em assets/ → endereço blob:. */
const TROCADOS = new Map<string, string>();
export const normalizarCaminhoAsset = (c: string) => c.replace(/^\.?\/?(assets\/)?/, '').split(/[?#]/)[0];
declare const __FONEMA_IMAGENS__: string[] | undefined;
/** Arquivos de public/assets no build (lista gerada pelo vite.config: inclui as figuras novas já publicadas). */
const IMAGENS_DO_BUILD = new Set(typeof __FONEMA_IMAGENS__ !== 'undefined' ? __FONEMA_IMAGENS__ : []);
/** A figura existe (no site publicado ou subida pelo administrador neste aparelho)? Para figuras novas do gerenciador. */
export const figuraExiste = (nome: string) => TROCADOS.has(`figuras/${nome}.webp`) || IMAGENS_DO_BUILD.has(`figuras/${nome}.webp`);
export function trocarAsset(caminho: string, url: string | null) {
  if (url) TROCADOS.set(normalizarCaminhoAsset(caminho), url); else TROCADOS.delete(normalizarCaminhoAsset(caminho));
}

/** O mundo 3D (mundo-3d-v2) foi copiado para ./mundo3d/? (servidores de SPA devolvem o index do app para caminhos inexistentes.) */
let mundo: Promise<boolean> | null = null;
export function mundo3dDisponivel(): Promise<boolean> {
  mundo ??= fetch('./mundo3d/index.html', { cache: 'no-store' })
    .then(async (r) => r.ok && !(await r.text()).includes('id="raiz"'))
    .catch(() => false);
  return mundo;
}
