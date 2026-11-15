/**
 * Matriz de confusão e medidas por criança (D030, etapa 2), a partir do registro detalhado das tentativas.
 * Funções puras: recebem tentativas (ou o progresso) e devolvem números para o painel do adulto e para o reforço.
 * Só entram tentativas AVALIADAS que tenham `alvo` — dado antigo (sem alvo) não inventa confusão.
 */
import { LETRA_POR_ID, PARES_CONFUSOS, SONS } from '@fonema/conteudo';
import type { CategoriaAlvo, Progresso, Tentativa } from './estado.ts';
import { ehAvaliada, respostasErradas } from './tentativas.ts';

/** Todas as tentativas do progresso, em ordem de tempo. */
export function todasAsTentativas(p: Pick<Progresso, 'habilidades'>): Tentativa[] {
  return Object.values(p.habilidades).flatMap((h) => h.tentativas).sort((a, b) => a.em - b.em);
}

/* ------------------------------ pares conhecidos ------------------------------ */

/** Letras que se confundem pelo DESENHO (espelhamento). Decisão do projeto: lista curta e conhecida de sala de aula. */
export const PARES_DE_DESENHO: [string, string][] = [['b', 'd'], ['p', 'q'], ['b', 'p'], ['d', 'q'], ['m', 'n'], ['n', 'u']];

/** Chave do som de um alvo: a própria chave do fonema ("p", "rr") ou o som principal da letra ("C" → "k"). */
export function chaveDoSom(x: string, categoria?: CategoriaAlvo): string | undefined {
  if (!x) return undefined;
  if (categoria !== 'grafema' && SONS[x] && x !== x.toUpperCase()) return x;
  if (categoria === 'fonema') return SONS[x] ? x : undefined;
  if (x.length === 1) {
    const l = LETRA_POR_ID[x.toUpperCase()];
    if (l?.fonema) return l.fonema;
  }
  return SONS[x] ? x : undefined;
}

function mesmoPar(lista: [string, string][], a: string, b: string): boolean {
  return lista.some(([x, y]) => (x === a && y === b) || (x === b && y === a));
}

/**
 * O par é um dos "fáceis de confundir" já conhecidos? 'som' = par de PARES_CONFUSOS (p/b, t/d, f/v…);
 * 'desenho' = letras espelhadas (b/d, p/q); undefined = par inesperado.
 */
export function parConhecido(a: string, b: string, categoria?: CategoriaAlvo): 'som' | 'desenho' | undefined {
  const sa = chaveDoSom(a, categoria);
  const sb = chaveDoSom(b, categoria);
  if (sa && sb && sa !== sb && mesmoPar(PARES_CONFUSOS, sa, sb)) return 'som';
  if (a.length === 1 && b.length === 1 && mesmoPar(PARES_DE_DESENHO, a.toLowerCase(), b.toLowerCase())) return 'desenho';
  return undefined;
}

/** O parceiro de confusão mais provável de um alvo, quando ainda não há dado da criança (usa PARES_CONFUSOS). */
export function parceiroProvavel(alvo: string, categoria?: CategoriaAlvo): string | undefined {
  const s = chaveDoSom(alvo, categoria);
  if (!s) return undefined;
  const par = PARES_CONFUSOS.find(([x, y]) => x === s || y === s);
  if (!par) return undefined;
  const outro = par[0] === s ? par[1] : par[0];
  // devolve no mesmo vocabulário do alvo: letra para letra, chave para chave
  const ehLetra = alvo.length === 1 && alvo === alvo.toUpperCase() && categoria !== 'fonema';
  return ehLetra ? SONS[outro]?.letra ?? outro : outro;
}

/* ------------------------------ matriz de confusão ------------------------------ */

export interface CelulaConfusao {
  alvo: string;
  /** O que a criança respondeu no lugar do alvo. */
  escolhido: string;
  vezes: number;
  /** Em quantas sessões diferentes a troca apareceu. */
  sessoes: number;
  ultimaEm: number;
  habilidades: string[];
  categoria?: CategoriaAlvo;
  /** Par já conhecido como fácil de confundir (som parecido ou letra espelhada). */
  conhecido?: 'som' | 'desenho';
}

/** Matriz de confusão: uma célula por (alvo, resposta errada), da mais frequente para a menos. */
export function matrizDeConfusao(tentativas: Tentativa[]): CelulaConfusao[] {
  const m = new Map<string, CelulaConfusao & { _s: Set<string>; _h: Set<string> }>();
  for (const t of tentativas) {
    if (!ehAvaliada(t) || t.alvo === undefined) continue;
    // cada resposta errada diferente do item conta uma vez (tocar duas vezes na mesma errada não dobra)
    for (const e of new Set(respostasErradas(t))) {
      const k = `${t.alvo}\u0000${e}`;
      const c = m.get(k) ?? { alvo: t.alvo, escolhido: e, vezes: 0, sessoes: 0, ultimaEm: 0, habilidades: [], categoria: t.categoria, conhecido: parConhecido(t.alvo, e, t.categoria), _s: new Set<string>(), _h: new Set<string>() };
      c.vezes++;
      c._s.add(t.sessao);
      c._h.add(t.habilidade);
      c.ultimaEm = Math.max(c.ultimaEm, t.em);
      m.set(k, c);
    }
  }
  return [...m.values()]
    .map(({ _s, _h, ...c }) => ({ ...c, sessoes: _s.size, habilidades: [..._h] }))
    .sort((a, b) => b.vezes - a.vezes || b.ultimaEm - a.ultimaEm || a.alvo.localeCompare(b.alvo));
}

export interface ParConfundido {
  /** Os dois itens do par, em ordem alfabética. */
  par: [string, string];
  /** Trocas nos dois sentidos (P→B e B→P). */
  vezes: number;
  sessoes: number;
  ultimaEm: number;
  /** Sentido mais comum: quando o alvo era `alvo`, respondeu `escolhido`. */
  alvo: string;
  escolhido: string;
  habilidades: string[];
  categoria?: CategoriaAlvo;
  conhecido?: 'som' | 'desenho';
}

/**
 * Pares confundidos (os dois sentidos somados), só os que chegaram a `minimo` trocas.
 * Ordem: mais trocas primeiro; no empate, o par já conhecido (PARES_CONFUSOS) vem antes.
 */
export function paresConfundidos(tentativas: Tentativa[], minimo = 2): ParConfundido[] {
  const m = new Map<string, ParConfundido & { _melhor: number; _s: number }>();
  for (const c of matrizDeConfusao(tentativas)) {
    const par = [c.alvo, c.escolhido].sort((a, b) => a.localeCompare(b)) as [string, string];
    const k = par.join('\u0000');
    const x = m.get(k) ?? { par, vezes: 0, sessoes: 0, ultimaEm: 0, alvo: c.alvo, escolhido: c.escolhido, habilidades: [], categoria: c.categoria, conhecido: c.conhecido, _melhor: 0, _s: 0 };
    x.vezes += c.vezes;
    x.sessoes = Math.max(x.sessoes, c.sessoes);
    x.ultimaEm = Math.max(x.ultimaEm, c.ultimaEm);
    x.habilidades = [...new Set([...x.habilidades, ...c.habilidades])];
    if (c.vezes > x._melhor) { x._melhor = c.vezes; x.alvo = c.alvo; x.escolhido = c.escolhido; }
    m.set(k, x);
  }
  return [...m.values()]
    .filter((x) => x.vezes >= minimo)
    .map(({ _melhor, _s, ...x }) => x)
    .sort((a, b) => b.vezes - a.vezes || (b.conhecido ? 1 : 0) - (a.conhecido ? 1 : 0) || b.ultimaEm - a.ultimaEm);
}

/* ------------------------------ itens mais errados ------------------------------ */

export interface ItemErrado {
  alvo: string;
  categoria?: CategoriaAlvo;
  /** Vezes em que o item foi pedido (tentativas avaliadas com este alvo). */
  vezes: number;
  /** Vezes em que NÃO saiu de primeira e sem ajuda. */
  erros: number;
  taxaErro: number;
  ultimaEm: number;
  habilidades: string[];
  pseudo: boolean;
}

/** Categoria do alvo: a que a mecânica gravou; senão, deduzida (uma letra = grafema; chave de som = fonema; resto = palavra). */
export function categoriaDoAlvo(t: Pick<Tentativa, 'alvo' | 'categoria' | 'pseudo'>): CategoriaAlvo {
  if (t.categoria) return t.categoria;
  if (t.pseudo) return 'pseudopalavra';
  const a = t.alvo ?? '';
  if (a.length === 1) return /[A-ZÀ-Ý]/.test(a) ? 'grafema' : SONS[a] ? 'fonema' : 'grafema';
  if (SONS[a]) return 'fonema';
  if (/^\p{L}{2,3}$/u.test(a) && a === a.toUpperCase() && !/[AEIOU].*[AEIOU]/i.test(a.normalize('NFD'))) return 'silaba';
  return /^[\p{L}-]+$/u.test(a) ? 'palavra' : 'outro';
}

/** Itens (alvos) mais errados, com pelo menos `minErros` erros. Ordem: mais erros, depois maior taxa. */
export function itensMaisErrados(tentativas: Tentativa[], opts: { categorias?: CategoriaAlvo[]; minErros?: number } = {}): ItemErrado[] {
  const m = new Map<string, ItemErrado & { _h: Set<string> }>();
  for (const t of tentativas) {
    if (!ehAvaliada(t) || t.alvo === undefined) continue;
    const categoria = categoriaDoAlvo(t);
    if (opts.categorias && !opts.categorias.includes(categoria)) continue;
    const x = m.get(t.alvo) ?? { alvo: t.alvo, categoria, vezes: 0, erros: 0, taxaErro: 0, ultimaEm: 0, habilidades: [], pseudo: !!t.pseudo, _h: new Set<string>() };
    x.vezes++;
    if (!t.acertou || t.comAjuda) x.erros++;
    x.ultimaEm = Math.max(x.ultimaEm, t.em);
    x._h.add(t.habilidade);
    m.set(t.alvo, x);
  }
  return [...m.values()]
    .map(({ _h, ...x }) => ({ ...x, taxaErro: x.erros / x.vezes, habilidades: [..._h] }))
    .filter((x) => x.erros >= (opts.minErros ?? 1))
    .sort((a, b) => b.erros - a.erros || b.taxaErro - a.taxaErro || a.alvo.localeCompare(b.alvo));
}

/** Sons e letras mais errados. */
export function fonemasEGrafemasMaisErrados(tentativas: Tentativa[], minErros = 1): ItemErrado[] {
  return itensMaisErrados(tentativas, { categorias: ['fonema', 'grafema', 'silaba'], minErros });
}

/** "Palavras difíceis" DE VERDADE: as palavras (e pseudopalavras) em que a criança mais errou. */
export function palavrasDificeis(tentativas: Tentativa[], minErros = 1): ItemErrado[] {
  return itensMaisErrados(tentativas, { categorias: ['palavra', 'pseudopalavra'], minErros });
}

/* ------------------------------ tempo ------------------------------ */

export interface TempoHabilidade {
  habilidade: string;
  /** Itens avaliados com tempo medido. */
  itens: number;
  mediaMs: number;
  medianaMs: number;
  /** Média só dos itens certos de primeira (o tempo "limpo" da resposta). */
  mediaAcertoMs?: number;
}

function media(xs: number[]): number {
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

function mediana(xs: number[]): number {
  const o = [...xs].sort((a, b) => a - b);
  const m = Math.floor(o.length / 2);
  return o.length % 2 ? o[m] : (o[m - 1] + o[m]) / 2;
}

/** Tempo máximo aceito por item (2 min): acima disso a criança saiu da tela, e o número só atrapalharia a média. */
export const TEMPO_MAX_ITEM_MS = 120_000;

/** Tempo médio por habilidade (só tentativas avaliadas com `tempoMs` válido). */
export function tempoMedioPorHabilidade(tentativas: Tentativa[]): TempoHabilidade[] {
  const m = new Map<string, { todos: number[]; certos: number[] }>();
  for (const t of tentativas) {
    if (!ehAvaliada(t) || t.tempoMs === undefined || !(t.tempoMs > 0) || t.tempoMs > TEMPO_MAX_ITEM_MS) continue;
    const x = m.get(t.habilidade) ?? { todos: [], certos: [] };
    x.todos.push(t.tempoMs);
    if (t.acertou && !t.comAjuda) x.certos.push(t.tempoMs);
    m.set(t.habilidade, x);
  }
  return [...m.entries()].map(([habilidade, x]) => ({
    habilidade,
    itens: x.todos.length,
    mediaMs: Math.round(media(x.todos)),
    medianaMs: Math.round(mediana(x.todos)),
    mediaAcertoMs: x.certos.length ? Math.round(media(x.certos)) : undefined
  }));
}

/** Quantas tentativas avaliadas têm o detalhe (alvo) — para o painel dizer com honestidade de onde vem o dado. */
export function coberturaDoDetalhe(tentativas: Tentativa[]): { avaliadas: number; comAlvo: number; comTempo: number } {
  const av = tentativas.filter(ehAvaliada);
  return { avaliadas: av.length, comAlvo: av.filter((t) => t.alvo !== undefined).length, comTempo: av.filter((t) => t.tempoMs !== undefined).length };
}
