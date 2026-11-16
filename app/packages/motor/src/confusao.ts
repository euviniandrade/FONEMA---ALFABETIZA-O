/**
 * Matriz de confusão e medidas por criança (D030, etapa 2), a partir do registro detalhado das tentativas.
 * Funções puras: recebem tentativas (ou o progresso) e devolvem números para o painel do adulto e para o reforço.
 * Só entram tentativas AVALIADAS que tenham `alvo` — dado antigo (sem alvo) não inventa confusão.
 */
import { LETRA_POR_ID, PARES_CONFUSOS, PARES_DE_VOZ, SONS } from '@fonema/conteudo';
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

/**
 * Tipos de erro de docs/pedagogia/06 §1 que dá para reconhecer pelos dados gravados: pelo par (alvo, resposta) — letra,
 * som ou palavra escrita/lida — e, no caso do chute (E-CHU), pelo tempo. E-ACR, E-ORD e E-IRR também entram.
 * Regras de reconhecimento: decisão do projeto [DP], a partir dos exemplos de 06 §1 (ABC p. 418–420; SOA p. 118, 147–186).
 */
export type TipoDeErro = 'E-VOZ' | 'E-NAS' | 'E-VOG' | 'E-FIM' | 'E-OMI' | 'E-ACR' | 'E-ORD' | 'E-CTX' | 'E-IRR' | 'E-VIS' | 'E-NOM' | 'E-CHU';

export const NOME_DO_ERRO: Record<TipoDeErro, string> = {
  'E-VOZ': 'troca de som com voz e sem voz',
  'E-NAS': 'troca entre sons do nariz',
  'E-VOG': 'troca de vogal',
  'E-FIM': 'escreve como fala no fim da palavra',
  'E-OMI': 'esquece uma letra ou um som',
  'E-ACR': 'põe uma letra a mais',
  'E-ORD': 'troca a ordem das letras',
  'E-CTX': 'regra de posição (r/rr, c/qu, g/gu, s/ss)',
  'E-IRR': 'escolha sem regra (j/g, ch/x, s/ç)',
  'E-VIS': 'letras de desenho parecido',
  'E-NOM': 'usa o nome da letra no lugar do som',
  'E-CHU': 'resposta rápida demais (chute)'
};

const semAcento = (w: string) => w.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
const ehPalavra = (w: string) => /^[\p{L}]{2,}$/u.test(w);
const ehSubsequencia = (curta: string, longa: string) => { let i = 0; for (const ch of longa) if (ch === curta[i]) i++; return i === curta.length; };
/** Regras de posição (E-CTX): RR/R, SS/S, QU/C, GU/G. */
const canonCtx = (w: string) => w.replace(/RR/g, 'R').replace(/SS/g, 'S').replace(/QU(?=[EI])/g, 'K').replace(/C(?=[AOU])/g, 'K').replace(/GU(?=[EI])/g, 'G');
/** Escolhas sem regra (E-IRR): J/G antes de E e I, CH/X, Ç/S/C antes de E e I. */
const canonIrr = (w: string) => canonCtx(w).replace(/CH/g, 'X').replace(/G(?=[EI])/g, 'J').replace(/Ç/g, 'S').replace(/C(?=[EI])/g, 'S');
/** Nome das letras, do jeito que a criança escreve quando usa o nome no lugar do som (E-NOM: "K" por "CA"). */
const NOMES_DAS_LETRAS: Record<string, string[]> = {
  B: ['BE'], C: ['CE', 'SE'], D: ['DE'], F: ['EFE'], G: ['GE', 'JE'], H: ['AGA'], J: ['JOTA'], K: ['CA', 'KA'], L: ['ELE'], M: ['EME'], N: ['ENE'],
  P: ['PE'], Q: ['QUE', 'KE'], R: ['ERRE', 'ERE'], S: ['ESSE', 'ESE'], T: ['TE'], V: ['VE'], X: ['XIS', 'CHIS'], Z: ['ZE']
};
/** `escrito` vira `alvo` trocando ao menos uma letra pelo NOME dela? ("KZA" → "CASA" não; "PTK" → "PETECA" sim.) */
function usouNome(alvo: string, escrito: string): boolean {
  const memo = new Map<string, boolean>();
  const ir = (i: number, j: number, usou: boolean): boolean => {
    const k = `${i},${j},${usou}`;
    if (memo.has(k)) return memo.get(k)!;
    let r = false;
    if (j === escrito.length) r = i === alvo.length && usou;
    else {
      if (alvo[i] === escrito[j]) r = ir(i + 1, j + 1, usou);
      if (!r) for (const n of NOMES_DAS_LETRAS[escrito[j]] ?? []) if (alvo.startsWith(n, i) && ir(i + n.length, j + 1, true)) { r = true; break; }
    }
    memo.set(k, r);
    return r;
  };
  return escrito.length < alvo.length && ir(0, 0, false);
}

/** Troca de UMA letra ou som: voz (p/b…), nasal (m/n/nh), vogal (inclusive é/ê), desenho (b/d, p/q). */
function tipoDaTroca(alvo: string, escolhido: string, categoria?: CategoriaAlvo): TipoDeErro | undefined {
  const a = chaveDoSom(alvo, categoria);
  const b = chaveDoSom(escolhido, categoria);
  if (a && b && a !== b) {
    if (mesmoPar(PARES_DE_VOZ, a, b)) return 'E-VOZ';
    const nasal = (x: string) => x === 'm' || x === 'n' || x === 'nh';
    if (nasal(a) && nasal(b)) return 'E-NAS';
    const vogal = (x: string) => /^[aeiou]~?$/i.test(x);
    if (vogal(a) && vogal(b)) return 'E-VOG';
  }
  if (alvo.length === 1 && escolhido.length === 1 && mesmoPar(PARES_DE_DESENHO, alvo.toLowerCase(), escolhido.toLowerCase())) return 'E-VIS';
  return undefined;
}

/** Classifica a troca entre o alvo e a resposta (letra, som ou palavra). `undefined` = não dá para dizer. */
export function tipoDeErro(alvo: string, escolhido: string, categoria?: CategoriaAlvo): TipoDeErro | undefined {
  if (!alvo || !escolhido || alvo === escolhido) return undefined;
  if (!(ehPalavra(alvo) && ehPalavra(escolhido)) || categoria === 'fonema' || categoria === 'grafema') return tipoDaTroca(alvo, escolhido, categoria);
  const a = semAcento(alvo);
  const b = semAcento(escolhido);
  if (a === b) {
    // só o acento mudou: é/ê, ó/ô (vogal aberta × fechada)
    return 'E-VOG';
  }
  if (canonCtx(a) === canonCtx(b)) return 'E-CTX';
  if (canonIrr(a) === canonIrr(b)) return 'E-IRR';
  if (a.length === b.length) {
    const dif = [...a].map((ch, k) => (ch === b[k] ? -1 : k)).filter((k) => k >= 0);
    // E-FIM: escreve como fala no fim (lobu, sorveti, papeu)
    if (dif.length === 1 && dif[0] === a.length - 1 && [['O', 'U'], ['E', 'I'], ['L', 'U']].some(([x, y]) => a.endsWith(x) && b.endsWith(y))) return 'E-FIM';
    if (dif.length === 1) return tipoDaTroca(a[dif[0]], b[dif[0]], 'grafema');
    if ([...a].sort().join() === [...b].sort().join()) return 'E-ORD';
    return undefined;
  }
  if (usouNome(a, b)) return 'E-NOM';
  if (b.length < a.length && ehSubsequencia(b, a)) return 'E-OMI';
  if (b.length > a.length && ehSubsequencia(a, b)) return 'E-ACR';
  return undefined;
}

/** Resposta rápida demais para ter sido pensada (mesmo limite de ajuda.ts › CHUTE.rapidaMs). */
export const CHUTE_RAPIDO_MS = 1200;

/**
 * Tipo de erro de UMA tentativa avaliada que não saiu certa de primeira: E-CHU quando foi rápida demais; senão, o tipo
 * da primeira resposta errada. Sem `alvo` (dado antigo) não se inventa tipo.
 */
export function tipoDeErroDaTentativa(t: Tentativa): TipoDeErro | undefined {
  if (!ehAvaliada(t) || t.alvo === undefined) return undefined;
  const errada = respostasErradas(t)[0];
  if (errada === undefined) return undefined;
  if (t.tempoMs !== undefined && t.tempoMs >= 0 && t.tempoMs < CHUTE_RAPIDO_MS) return 'E-CHU';
  return tipoDeErro(t.alvo, errada, t.categoria);
}

export interface ErroFrequente { erro: TipoDeErro; nome: string; vezes: number; sessoes: number; exemplos: { alvo: string; escolhido: string }[] }

/** Tipos de erro mais frequentes da criança (painel do adulto, 06 §8 item 4), do mais comum para o menos. */
export function tiposDeErroFrequentes(tentativas: Tentativa[], minimo = 2): ErroFrequente[] {
  const m = new Map<TipoDeErro, ErroFrequente & { s: Set<string> }>();
  for (const t of tentativas) {
    const erro = tipoDeErroDaTentativa(t);
    if (!erro) continue;
    const x = m.get(erro) ?? { erro, nome: NOME_DO_ERRO[erro], vezes: 0, sessoes: 0, exemplos: [], s: new Set<string>() };
    x.vezes++;
    x.s.add(t.sessao);
    if (x.exemplos.length < 3) x.exemplos.push({ alvo: t.alvo!, escolhido: respostasErradas(t)[0] });
    m.set(erro, x);
  }
  return [...m.values()].filter((x) => x.vezes >= minimo).map(({ s, ...x }) => ({ ...x, sessoes: s.size })).sort((a, b) => b.vezes - a.vezes);
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
  const m = new Map<string, CelulaConfusao>();
  const sessoes = new Map<string, Set<string>>();
  for (const t of tentativas) {
    if (!ehAvaliada(t) || t.alvo === undefined) continue;
    // cada resposta errada diferente do item conta uma vez (tocar duas vezes na mesma errada não dobra)
    for (const e of new Set(respostasErradas(t))) {
      const k = `${t.alvo}\u0000${e}`;
      const c = m.get(k) ?? { alvo: t.alvo, escolhido: e, vezes: 0, sessoes: 0, ultimaEm: 0, habilidades: [], categoria: t.categoria, conhecido: parConhecido(t.alvo, e, t.categoria) };
      c.vezes++;
      sessoes.set(k, (sessoes.get(k) ?? new Set<string>()).add(t.sessao));
      if (!c.habilidades.includes(t.habilidade)) c.habilidades.push(t.habilidade);
      c.ultimaEm = Math.max(c.ultimaEm, t.em);
      m.set(k, c);
    }
  }
  return [...m.entries()]
    .map(([k, c]) => ({ ...c, sessoes: sessoes.get(k)!.size }))
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
  /** Tipo de erro (docs/pedagogia/06 §1), quando o par deixa reconhecer. */
  erro?: TipoDeErro;
}

/**
 * Pares confundidos (os dois sentidos somados), só os que chegaram a `minimo` trocas.
 * Ordem: mais trocas primeiro; no empate, o par já conhecido (PARES_CONFUSOS) vem antes.
 */
export function paresConfundidos(tentativas: Tentativa[], minimo = 2): ParConfundido[] {
  const m = new Map<string, ParConfundido>();
  const melhor = new Map<string, number>();
  for (const c of matrizDeConfusao(tentativas)) {
    const par = [c.alvo, c.escolhido].sort((a, b) => a.localeCompare(b)) as [string, string];
    const k = par.join('\u0000');
    const x = m.get(k) ?? { par, vezes: 0, sessoes: 0, ultimaEm: 0, alvo: c.alvo, escolhido: c.escolhido, habilidades: [], categoria: c.categoria, conhecido: c.conhecido };
    x.vezes += c.vezes;
    x.sessoes = Math.max(x.sessoes, c.sessoes);
    x.ultimaEm = Math.max(x.ultimaEm, c.ultimaEm);
    x.habilidades = [...new Set([...x.habilidades, ...c.habilidades])];
    if (c.vezes > (melhor.get(k) ?? 0)) { melhor.set(k, c.vezes); x.alvo = c.alvo; x.escolhido = c.escolhido; }
    m.set(k, x);
  }
  return [...m.values()]
    .filter((x) => x.vezes >= minimo)
    .map((x) => ({ ...x, erro: tipoDeErro(x.alvo, x.escolhido, x.categoria) }))
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
  const m = new Map<string, ItemErrado>();
  for (const t of tentativas) {
    if (!ehAvaliada(t) || t.alvo === undefined) continue;
    const categoria = categoriaDoAlvo(t);
    if (opts.categorias && !opts.categorias.includes(categoria)) continue;
    const x = m.get(t.alvo) ?? { alvo: t.alvo, categoria, vezes: 0, erros: 0, taxaErro: 0, ultimaEm: 0, habilidades: [], pseudo: !!t.pseudo };
    x.vezes++;
    if (!t.acertou || t.comAjuda) x.erros++;
    x.ultimaEm = Math.max(x.ultimaEm, t.em);
    if (!x.habilidades.includes(t.habilidade)) x.habilidades.push(t.habilidade);
    m.set(t.alvo, x);
  }
  return [...m.values()]
    .map((x) => ({ ...x, taxaErro: x.erros / x.vezes }))
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
