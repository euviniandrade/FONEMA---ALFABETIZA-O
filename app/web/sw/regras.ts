/**
 * Regras do cache do aparelho (service worker). Arquivo puro: usado pelo sw.ts, pelo vite.config.ts e pelos testes.
 *
 * Primeiro acesso leve: o precache leva só a casca do app (HTML, JS, CSS, ícones, fontes e os manifestos da voz).
 * Vozes, sons, figuras, vídeos, modelos 3D, Mundo 3D e Espelho entram no aparelho quando a criança usa
 * (cache em tempo de execução, "primeiro o aparelho") e continuam abrindo sem internet depois disso.
 */

/** O que vai para o precache (instalado junto com o app). Caminhos relativos à pasta publicada. */
export const PRECACHE_PADROES = [
  '*.{html,js,webmanifest}',
  'assets/*.{js,css}',
  'icones/*',
  'assets/fontes/*.woff2',
  'audio/**/*.json'
];
/** Nunca no precache, mesmo casando com os padrões acima (páginas próprias, carregadas por iframe sob demanda). */
export const PRECACHE_IGNORAR = ['mundo3d/**', 'espelho/**', 'bancada-*.html'];

export type Grupo = 'voz' | 'video' | 'modelos' | 'paginas3d' | 'figuras';

export interface ConfigGrupo {
  /** máximo de arquivos guardados neste grupo (os menos usados saem primeiro) */
  maxArquivos: number;
}
/**
 * Limites folgados de propósito: tirar do aparelho algo que a criança já usou faz a atividade parar de funcionar
 * sem internet. O teto existe só para o cache não crescer sem fim se o conteúdo mudar muito ao longo do tempo.
 */
export const GRUPOS: Record<Grupo, ConfigGrupo> = {
  voz: { maxArquivos: 4000 },
  figuras: { maxArquivos: 1500 },
  video: { maxArquivos: 120 },
  modelos: { maxArquivos: 80 },
  paginas3d: { maxArquivos: 300 }
};
/** Arquivos sem uso há mais que isto podem sair do aparelho. */
export const IDADE_MAXIMA_S = 180 * 24 * 60 * 60;

/** Grupo de um caminho relativo à pasta do app (sem "./" e sem "?…"), ou null se não é mídia guardada sob demanda. */
export function grupoDe(rel: string): Grupo | null {
  const r = rel.replace(/^\.?\//, '').split(/[?#]/)[0];
  if (r.startsWith('mundo3d/') || r.startsWith('espelho/')) return 'paginas3d';
  const ext = (r.match(/\.([a-z0-9]+)$/i)?.[1] ?? '').toLowerCase();
  if (ext === 'mp4' || ext === 'webm') return 'video';
  if (ext === 'glb' || ext === 'gltf' || ext === 'bin' || ext === 'ktx2') return 'modelos';
  if (r.startsWith('audio/') || r.startsWith('assets/audio/')) return ext === 'json' ? null : 'voz';
  if (r.startsWith('assets/') && !r.startsWith('assets/fontes/')) {
    if (['webp', 'png', 'jpg', 'jpeg', 'svg', 'gif', 'json', 'mp3', 'wav', 'ogg'].includes(ext)) return 'figuras';
  }
  return null;
}

/** Nome do cache de um grupo. A versão muda quando algum arquivo do grupo muda (o SW apaga as versões antigas). */
export const nomeDoCache = (g: Grupo, versao: string) => `fonema-${g}-${versao}`;
export const PREFIXO_CACHE = 'fonema-';

/**
 * Pedido com "Range" (áudio e vídeo pedem pedaços): devolve o pedaço pedido de uma resposta inteira (200 → 206).
 * Sem Range, ou Range que não dá para entender, devolve a resposta como veio.
 */
export async function fatiar(resp: Response, range: string | null): Promise<Response> {
  if (!range || resp.status !== 200) return resp;
  const m = /^bytes=(\d*)-(\d*)$/.exec(range.trim());
  if (!m || (m[1] === '' && m[2] === '')) return resp;
  const corpo = await resp.blob();
  const total = corpo.size;
  let ini: number, fim: number;
  if (m[1] === '') { ini = Math.max(0, total - Number(m[2])); fim = total - 1; } // últimos N bytes
  else { ini = Number(m[1]); fim = m[2] === '' ? total - 1 : Math.min(Number(m[2]), total - 1); }
  if (ini >= total || ini > fim) {
    return new Response(null, { status: 416, statusText: 'Range Not Satisfiable', headers: { 'Content-Range': `bytes */${total}` } });
  }
  const pedaco = corpo.slice(ini, fim + 1);
  const h = new Headers(resp.headers);
  h.set('Content-Range', `bytes ${ini}-${fim}/${total}`);
  h.set('Content-Length', String(pedaco.size));
  h.set('Accept-Ranges', 'bytes');
  return new Response(pedaco, { status: 206, statusText: 'Partial Content', headers: h });
}
