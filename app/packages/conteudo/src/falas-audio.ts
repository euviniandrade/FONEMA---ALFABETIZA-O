/**
 * Regras de ÁUDIO das falas — compartilhadas pelo app (web/src/servicos/voz.ts) e pelo gerador
 * (ferramentas/gerar-vozes.ts). As duas pontas PRECISAM usar as mesmas funções, senão a chave não bate.
 *
 * Como uma fala vira áudio nas vozes oficiais (Sofia e Tales, ElevenLabs):
 *   1. O nome da criança é sempre um VOCATIVO destacável ("Oi, [NOME]! Eu sou a Sofia.").
 *      No áudio ele sai da frase e vira um clipe à parte, tocado antes: "Ana!" + "Oi! Eu sou a Sofia."
 *      (na TELA o texto continua com o nome no lugar). Nome fora da lista: toca só a frase.
 *   2. A frase sem nome é procurada inteira no manifesto; se não houver, frase por frase; se não houver,
 *      pedaço por pedaço (separados por "…"). O que faltar fica em silêncio (nunca voz do navegador).
 *   3. Personagens que não são a dupla são narrados por uma das duas vozes (VOZ_DE).
 */
import type { Personagem } from './tipos.ts';

export type VozOficial = 'sofia' | 'tales';

/** Quem narra cada personagem enquanto não há voz própria (D011): nunca voz sintética do navegador. */
export const VOZ_DE: Record<Personagem, VozOficial> = {
  sofia: 'sofia',
  tales: 'tales',
  bolota: 'tales',
  davi: 'tales',
  'guarda-parque': 'tales',
  'dona-cida': 'sofia',
  pescadora: 'sofia',
  'zum-zum': 'sofia'
};

export const outraVoz = (v: VozOficial): VozOficial => (v === 'sofia' ? 'tales' : 'sofia');

/** Marcador invisível que envolve o nome da criança no texto mandado para a voz (ver util.ts → textoVoz). */
export const MARCA_NOME = '⁣';
export const marcarNome = (nome: string): string => `${MARCA_NOME}${nome}${MARCA_NOME}`;
const RE_MARCA = /⁣([^⁣]*)⁣/g;

/** Tira os marcadores (para mostrar ou para a área do adulto). */
export const semMarca = (texto: string): string => texto.replace(/⁣/g, '');

const maiuscula = (t: string): string => t.replace(/^(\s*)([a-zà-ÿ])/, (_m, a: string, b: string) => a + b.toUpperCase());

/**
 * Separa o vocativo: devolve o nome (se houver) e a frase SEM o nome.
 * `resto` = true quando sobrou nome no meio da frase (não era vocativo) — o teste de conteúdo proíbe isso.
 */
export function separarNome(texto: string): { nome: string | null; frase: string; resto: boolean } {
  let nome: string | null = null;
  for (const m of texto.matchAll(RE_MARCA)) { nome = m[1].trim() || null; break; }
  if (!nome) return { nome: null, frase: semMarca(texto).trim(), resto: false };
  let t = texto
    // "Oi, ⁣Ana⁣! Eu…" → "Oi! Eu…"   ·   "…no varal, ⁣Ana⁣: o que rima?" → "…no varal: o que rima?"
    .replace(/\s*,\s*⁣[^⁣]*⁣(?=\s*(?:[!?.,:;…]|$))/g, '')
    // "⁣Ana⁣, olha só!" / "⁣Ana⁣! Olha só!" → "Olha só!"
    .replace(/(^|[.!?…]\s+)⁣[^⁣]*⁣\s*[,!.?…]*\s*/g, (_m, a: string) => a);
  const resto = t.includes(MARCA_NOME);
  t = semMarca(t).replace(/\s{2,}/g, ' ').trim();
  // só pontuação sobrando = a fala era só o nome ("Ana!")
  if (!/[\p{L}\p{N}]/u.test(t)) t = '';
  return { nome, frase: t.split(/(?<=[.!?…])\s+/).map(maiuscula).join(' '), resto };
}

/** Identificador de arquivo do nome: "Heloísa" → "heloisa", "Maria Clara" → "maria-clara". */
export function slugNome(nome: string): string {
  return nome.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

/** Som isolado esticado ("mmm", "ssss", "éééé"): devolve a letra-base (com acento) ou null. */
export function somIsolado(pedaco: string): string | null {
  const t = pedaco.normalize('NFC').toLowerCase().replace(/[^\p{L}]/gu, '');
  if (t.length < 3) return null;
  return [...t].every((c) => c === t[0]) ? t[0] : null;
}

/**
 * Chave do manifesto: voz + texto "frouxo" (minúsculas, sem pontuação, sons esticados canônicos).
 * "Qual letra faz /mmm/?" e "qual letra faz mmmm" dão a mesma chave; "MALA" e "mala." também.
 */
export function textoChave(texto: string): string {
  return semMarca(texto)
    .normalize('NFC')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
    .split(' ')
    .map((p) => { const s = somIsolado(p); return s ? `~${s}` : p; })
    .join(' ');
}
export const chaveFala = (voz: VozOficial, texto: string): string => `${voz}|${textoChave(texto)}`;

/** Frases de uma fala ("Isso! Você conseguiu." → 2). Reticências no meio NÃO quebram a frase. */
export function frasesDaFala(frase: string): string[] {
  return frase.split(/(?<=[.!?])\s+/).map((x) => x.trim()).filter((x) => /[\p{L}\p{N}]/u.test(x));
}

/** Pedaços de uma frase separados por reticências ("sss… sapo" → ["sss", "sapo"]). */
export function pedacosDaFrase(frase: string): string[] {
  return frase.split(/…|\.{3}/).map((x) => x.trim()).filter((x) => /[\p{L}\p{N}]/u.test(x));
}
