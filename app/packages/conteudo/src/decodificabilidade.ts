/**
 * VERIFICADOR DE DECODIFICABILIDADE (D030 etapa 7; docs/pedagogia/05-regras-de-decodificabilidade.md §6).
 *
 * Uma palavra só entra em tarefa de LER ou ESCREVER quando cada letra dela está sendo usada com um VALOR SONORO já
 * ensinado, naquela posição (05 §2). Não basta a letra ter sido vista: "gato" e "gelo" usam o G com valores diferentes.
 *
 * Como funciona (05 §6):
 *  1. cada unidade da trilha fônica declara os valores que ensina (`UNIDADES_TF`, grafema + contexto → som);
 *  2. a palavra é dividida em grafemas (dígrafos primeiro; depois vogal + M/N no fim da sílaba; depois letras) e cada
 *     grafema ganha o valor pela posição E pela PRONÚNCIA ANOTADA à mão no banco (E/O abertos sem acento, a sílaba
 *     forte e os sons do X não se deduzem das letras);
 *  3. o verificador confere se a anotação bate com as letras e acusa palavra sem anotação;
 *  4. resultado por palavra: ERRO (o teste falha) ou AVISO (o teste passa, mas lista);
 *  5. frases e textos: cada palavra passa por 1–4; aceita a lista curta de palavras frequentes (§5) dentro do limite;
 *  6. relatório por fase: o que foi lido, o valor que barrou e a unidade que o libera.
 *
 * Notação dos sons na anotação (um símbolo por som, separados por espaço): a e ɛ i o ɔ u · ã ẽ ĩ õ ũ · m n ɲ · f v s z
 * ʃ ʒ · l ʎ · ɾ (R fraco) R (R forte) · p b t d k g · tʃ dʒ (T e D antes do som de I, em muitas regiões).
 * Ex.: "pato" = "p a t u"; "tia" = "tʃ i a"; "bola" = "b ɔ l a".
 *
 * [DP] O formato, os nomes dos valores e a escolha erro × aviso são decisão do projeto a partir de 05 §4 e §6.
 */

/* ------------------------------------------------------------------------------------------------------------ */
/* 1. Valores sonoros e a unidade que ensina cada um                                                             */
/* ------------------------------------------------------------------------------------------------------------ */

export type ValorTF =
  | 'a' | 'e' | 'i' | 'o' | 'u' | 'ditongo'
  | 'm' | 'f' | 'v' | 'l' | 's' | 'o-final-u' | 'e-final-i' | 'n' | 'z' | 'j'
  | 'p' | 't' | 'b' | 'c-k' | 'd' | 'g' | 'ti-di'
  | 'e-aberto' | 'o-aberto' | 'acento' | 'acento-tonico' | 'e-aberto-sem-acento' | 'o-aberto-sem-acento' | 'circunflexo' | 'ditongo-ou'
  | 'nasal-a' | 'nasal-e' | 'nasal-i' | 'nasal-o' | 'nasal-u' | 'm-antes-pb' | 'ditongo-nasal'
  | 'r-forte' | 'r-fraco' | 'r-final' | 'rr' | 'h-mudo'
  | 'lh' | 'nh' | 'ch' | 'x-ch' | 'qu-k' | 'qu-kw' | 'gu-g'
  | 'g-j' | 'c-s' | 'ss' | 'cedilha' | 's-z' | 'letra-de-nomes' | 'l-final' | 's-final' | 's-apos-consoante' | 'x-outro'
  | 'encontro-r' | 'encontro-l'
  // só AVISO (05 §4 A5 e variação de fala): não bloqueiam
  | 'nasalizada' | 'e-reduzido' | 'o-reduzido';

export interface UnidadeTF {
  /** "TF-07" */
  id: string;
  numero: number;
  bloco: number;
  titulo: string;
  /** Valores sonoros que a unidade ENSINA (passam a valer dali em diante). */
  valores: ValorTF[];
}

const U = (numero: number, bloco: number, titulo: string, valores: ValorTF[]): UnidadeTF => ({ id: `TF-${String(numero).padStart(2, '0')}`, numero, bloco, titulo, valores });

/** As 53 unidades de docs/pedagogia/01-escopo-e-sequencia.md §4, com os valores que cada uma libera. */
export const UNIDADES_TF: UnidadeTF[] = [
  U(1, 1, '/a/', ['a']), U(2, 1, '/e/ fechado', ['e']), U(3, 1, '/i/', ['i']), U(4, 1, '/o/ fechado', ['o']), U(5, 1, '/u/', ['u']),
  U(6, 1, 'Revisão das vogais e ai, ei, oi, ui', ['ditongo']),
  U(7, 2, '/m/', ['m']), U(8, 2, '/f/', ['f']), U(9, 2, '/v/', ['v']), U(10, 2, '/l/', ['l']), U(11, 2, '/s/ no começo', ['s']),
  U(12, 2, 'O e E no fim soam U e I', ['o-final-u', 'e-final-i']), U(13, 2, '/n/', ['n']), U(14, 2, '/z/', ['z']), U(15, 2, '/ʒ/ (J)', ['j']),
  U(16, 3, '/p/', ['p']), U(17, 3, '/t/', ['t']), U(18, 3, '/b/', ['b']), U(19, 3, '/k/ (ca, co, cu)', ['c-k']), U(20, 3, '/d/', ['d']),
  U(21, 3, '/g/ (ga, go, gu)', ['g']), U(22, 3, 'ti e di', ['ti-di']),
  U(23, 4, 'é e ó com acento', ['e-aberto', 'o-aberto', 'acento', 'acento-tonico']),
  U(24, 4, 'E e O abertos sem acento; ê e ô', ['e-aberto-sem-acento', 'o-aberto-sem-acento', 'circunflexo', 'ditongo-ou']),
  U(25, 4, '/ã/', ['nasal-a']), U(26, 4, '/ẽ/', ['nasal-e']), U(27, 4, '/ĩ/', ['nasal-i']), U(28, 4, '/õ/', ['nasal-o']), U(29, 4, '/ũ/', ['nasal-u']),
  U(30, 4, 'M antes de P e B; ão, ãe, õe', ['m-antes-pb', 'ditongo-nasal']),
  U(31, 5, 'R forte no começo', ['r-forte']), U(32, 5, 'R fraco', ['r-fraco']), U(33, 5, 'R no fim da sílaba', ['r-final']), U(34, 5, 'RR', ['rr']), U(35, 5, 'H mudo', ['h-mudo']),
  U(36, 6, 'LH', ['lh']), U(37, 6, 'NH', ['nh']), U(38, 6, 'CH', ['ch']), U(39, 6, 'X com som de CH', ['x-ch']), U(40, 6, 'QU (que, qui)', ['qu-k']),
  U(41, 6, 'QU (qua, quo)', ['qu-kw']), U(42, 6, 'GU (gue, gui)', ['gu-g']),
  U(43, 7, 'C e G: dois sons', []), U(44, 7, 'GE e GI', ['g-j']), U(45, 7, 'CE e CI', ['c-s']), U(46, 7, 'SS e Ç', ['ss', 'cedilha']), U(47, 7, 'S entre vogais', ['s-z']),
  U(48, 7, 'K, Y e W', ['letra-de-nomes']), U(49, 7, 'L no fim da sílaba', ['l-final']), U(50, 7, 'S e Z no fim da sílaba', ['s-final', 's-apos-consoante']),
  U(51, 7, 'Outros sons do X', ['x-outro']), U(52, 8, 'Consoante + R', ['encontro-r']), U(53, 8, 'Consoante + L', ['encontro-l'])
];
export const UNIDADE_TF_POR_ID: Record<string, UnidadeTF> = Object.fromEntries(UNIDADES_TF.map((u) => [u.id, u]));

/** Valores que só geram AVISO (05 §6.4): nasalização pela consoante seguinte ("cama") e vogal átona reduzida na fala. */
export const VALORES_AVISO: ValorTF[] = ['nasalizada', 'e-reduzido', 'o-reduzido'];
/** Valores que, mesmo ensinados, seguem com AVISO por variar de região (05 §6.4): ti/di e R de fim de sílaba. */
export const VALORES_REGIONAIS: ValorTF[] = ['ti-di', 'r-final'];

/** Unidade que ensina o valor (número); `undefined` para os valores só de aviso. */
export function unidadeDoValor(v: ValorTF): number | undefined {
  return UNIDADES_TF.find((u) => u.valores.includes(v))?.numero;
}
/** Valores já ensinados AO FIM da unidade `n` (inclusive a própria unidade). */
export function valoresAte(n: number): Set<ValorTF> {
  return new Set(UNIDADES_TF.filter((u) => u.numero <= n).flatMap((u) => u.valores));
}
/** "TF-07" → 7 */
export const numeroDaUnidade = (id: string) => UNIDADE_TF_POR_ID[id]?.numero ?? Number(id.replace(/\D/g, ''));

/* ------------------------------------------------------------------------------------------------------------ */
/* 2. Banco de palavras com pronúncia anotada                                                                    */
/* ------------------------------------------------------------------------------------------------------------ */

export interface EntradaBanco {
  /** A palavra como aparece (minúsculas; nomes próprios com maiúscula). */
  texto: string;
  /** Pronúncia anotada à mão, som a som, separada por espaço ("p a t u"). */
  sons: string;
  /** Sílaba forte na ÚLTIMA sílaba (oxítona) sem acento gráfico (tatu, papai, miau). Padrão: penúltima. */
  oxitona?: boolean;
  /** Palavra inventada (nome de bichinho): não pode ser palavra real. */
  pseudo?: boolean;
  /** Nome da figura em web/public/assets/figuras (sem acento), quando existe arte. */
  figura?: string;
}

/* ------------------------------------------------------------------------------------------------------------ */
/* 3. Análise: grafemas, sons e valores                                                                          */
/* ------------------------------------------------------------------------------------------------------------ */

const VOGAIS = 'aeiouáàâãéêíóôõú';
const ehVogal = (c: string | undefined) => !!c && VOGAIS.includes(c);
const ACENTOS = /[áàâãéêíóôõú]/;

export interface Grafema {
  /** As letras (ex.: "ch", "am", "t"). */
  g: string;
  /** Posição da primeira letra na palavra. */
  i: number;
}

/** Divide em grafemas: dígrafos primeiro (ch, lh, nh, rr, ss, qu, gu), depois vogal + M/N no fim da sílaba, depois letras. */
export function grafemas(palavra: string): Grafema[] {
  const w = palavra.toLowerCase();
  const out: Grafema[] = [];
  let i = 0;
  while (i < w.length) {
    const c = w[i];
    const d = w.slice(i, i + 2);
    const prox = w[i + 2];
    if (['ch', 'lh', 'nh', 'rr', 'ss'].includes(d)) { out.push({ g: d, i }); i += 2; continue; }
    if ((d === 'qu' || d === 'gu') && /[eiéêí]/.test(prox ?? '')) { out.push({ g: d, i }); i += 2; continue; }
    if (d === 'qu' && /[aoáó]/.test(prox ?? '')) { out.push({ g: d, i }); i += 2; continue; }
    // vogal + M/N no fim da sílaba (seguida de consoante que não é H, ou do fim da palavra) = vogal nasal
    if (ehVogal(c) && 'mn'.includes(w[i + 1] ?? '') && (i + 2 >= w.length || (!ehVogal(w[i + 2]) && w[i + 2] !== 'h'))) { out.push({ g: w.slice(i, i + 2), i }); i += 2; continue; }
    out.push({ g: c, i });
    i += 1;
  }
  return out;
}

/** Sons esperados para cada grafema (alternativas). `[]` = mudo (H). */
function sonsPossiveis(g: string, w: string, gi: number): string[][] {
  const prox = w[gi + g.length];
  const fimSilaba = !ehVogal(prox);
  switch (g) {
    case 'a': case 'á': case 'à': case 'â': return [['a']];
    case 'e': return [['e'], ['ɛ'], ['i']];
    case 'é': return [['ɛ']];
    case 'ê': return [['e']];
    case 'i': case 'í': case 'y': return [['i']];
    case 'o': return [['o'], ['ɔ'], ['u']];
    case 'ó': return [['ɔ']];
    case 'ô': return [['o']];
    case 'u': case 'ú': return [['u']];
    case 'ã': return [['ã']];
    case 'õ': return [['õ']];
    case 'b': return [['b']];
    case 'c': return /[eiéêí]/.test(prox ?? '') ? [['s']] : [['k']];
    case 'ç': return [['s']];
    case 'd': return [['d'], ['dʒ']];
    case 'f': return [['f']];
    case 'g': return /[eiéêí]/.test(prox ?? '') ? [['ʒ']] : [['g']];
    case 'h': return [[]];
    case 'j': return [['ʒ']];
    case 'k': return [['k']];
    case 'l': return fimSilaba ? [['u'], ['l']] : [['l']];
    case 'm': return [['m']];
    case 'n': return [['n']];
    case 'p': return [['p']];
    case 'q': return [['k']];
    case 'r': return [['R'], ['ɾ'], []];
    case 's': return [['s'], ['z']];
    case 't': return [['t'], ['tʃ']];
    case 'v': return [['v']];
    case 'w': return [['u'], ['v']];
    case 'x': return [['ʃ'], ['k', 's'], ['z'], ['s']];
    case 'z': return [['z'], ['s']];
    case 'ch': return [['ʃ']];
    case 'lh': return [['ʎ']];
    case 'nh': return [['ɲ']];
    case 'rr': return [['R']];
    case 'ss': return [['s']];
    case 'qu': return /[aoáó]/.test(prox ?? '') ? [['k', 'u']] : [['k']];
    case 'gu': return [['g']];
    default: {
      // vogal + m/n (nasal)
      const v = g[0];
      const nasal: Record<string, string> = { a: 'ã', â: 'ã', e: 'ẽ', ê: 'ẽ', i: 'ĩ', o: 'õ', ô: 'õ', u: 'ũ' };
      if (nasal[v]) return v === 'e' && gi + g.length === w.length ? [['ẽ', 'i'], ['ẽ']] : [[nasal[v]]];
      return [[g]];
    }
  }
}

export interface AnaliseGrafema { g: string; sons: string[]; valor: ValorTF }
export interface Analise { grafemas: AnaliseGrafema[]; erros: string[] }

/** Lê a anotação ("p a t u") como lista de sons. */
export const sonsDaAnotacao = (sons: string) => sons.trim().split(/\s+/).filter(Boolean);

/**
 * Casa os grafemas com a pronúncia anotada e dá a cada um o VALOR SONORO pela posição e pelo som anotado.
 * Erros = a anotação não bate com as letras.
 */
export function analisar(e: EntradaBanco): Analise {
  const w = e.texto.toLowerCase();
  const gs = grafemas(w);
  const sons = sonsDaAnotacao(e.sons);
  const erros: string[] = [];
  const out: AnaliseGrafema[] = [];
  let k = 0;
  const temAcento = ACENTOS.test(w);
  gs.forEach((gr, idx) => {
    const alternativas = sonsPossiveis(gr.g, w, gr.i);
    // escolhe a alternativa que casa com a anotação (a mais longa primeiro)
    const casa = [...alternativas].sort((a, b) => b.length - a.length).find((alt) => alt.every((s, j) => sons[k + j] === s));
    if (!casa) {
      erros.push(`"${e.texto}": a anotação "${sons.slice(k, k + 2).join(' ')}" não combina com "${gr.g}"`);
      out.push({ g: gr.g, sons: [], valor: 'a' });
      return;
    }
    const meus = sons.slice(k, k + casa.length);
    k += casa.length;
    out.push({ g: gr.g, sons: meus, valor: valorDoGrafema(gr, idx, gs, w, meus, temAcento) });
  });
  if (k !== sons.length) erros.push(`"${e.texto}": sobram sons na anotação (${sons.slice(k).join(' ')})`);
  return { grafemas: out, erros };
}

function valorDoGrafema(gr: Grafema, idx: number, gs: Grafema[], w: string, sons: string[], temAcento: boolean): ValorTF {
  const g = gr.g;
  const ant = w[gr.i - 1];
  const prox = w[gr.i + g.length];
  const ultimo = idx === gs.length - 1 || (idx === gs.length - 2 && gs[gs.length - 1].g === 's');
  const s = sons[0];
  const inicioPalavra = gr.i === 0;
  const fimSilaba = !ehVogal(prox);
  // dígrafos e vogais nasais
  if (g === 'ch') return 'ch';
  if (g === 'lh') return 'lh';
  if (g === 'nh') return 'nh';
  if (g === 'rr') return 'rr';
  if (g === 'ss') return 'ss';
  if (g === 'qu') return sons.length > 1 ? 'qu-kw' : 'qu-k';
  if (g === 'gu') return 'gu-g';
  if (g.length === 2 && ehVogal(g[0])) {
    if (g[1] === 'm' && /[pb]/.test(prox ?? '')) return 'm-antes-pb';
    if (g[0] === 'e' && sons.length > 1) return 'ditongo-nasal';
    return ({ ã: 'nasal-a', ẽ: 'nasal-e', ĩ: 'nasal-i', õ: 'nasal-o', ũ: 'nasal-u' } as Record<string, ValorTF>)[s] ?? 'nasal-a';
  }
  switch (g) {
    case 'a': return 'a';
    case 'á': case 'à': case 'í': case 'ú': return 'acento';
    case 'â': case 'ê': case 'ô': return 'circunflexo';
    case 'é': return 'e-aberto';
    case 'ó': return 'o-aberto';
    case 'ã': return /[oe]/.test(prox ?? '') ? 'ditongo-nasal' : 'nasal-a';
    case 'õ': return prox === 'e' ? 'ditongo-nasal' : 'nasal-o';
    case 'e':
      if (s === 'ɛ') return 'e-aberto-sem-acento';
      if (s === 'i') return ultimo && !temAcento ? 'e-final-i' : ultimo ? 'e-final-i' : ehVogal(ant) ? 'ditongo' : 'e-reduzido';
      return 'e';
    case 'o':
      if (s === 'ɔ') return 'o-aberto-sem-acento';
      if (s === 'u') return ultimo ? 'o-final-u' : ehVogal(ant) ? (ant === 'o' ? 'ditongo-ou' : 'ditongo') : 'o-reduzido';
      return 'o';
    case 'i':
      // semivogal: I depois de vogal (pai, meia, foi, fui) = ditongo
      return ehVogal(ant) ? 'ditongo' : 'i';
    case 'u':
      if (ant === 'o') return 'ditongo-ou';
      return ehVogal(ant) ? 'ditongo' : 'u';
    case 'm': return 'm';
    case 'n': return 'n';
    case 'f': return 'f';
    case 'v': return 'v';
    case 'j': return 'j';
    case 'p': return 'p';
    case 'b': return 'b';
    case 'k': case 'w': case 'y': return 'letra-de-nomes';
    case 't': return s === 'tʃ' ? 'ti-di' : 't';
    case 'd': return s === 'dʒ' ? 'ti-di' : 'd';
    case 'c': return s === 's' ? 'c-s' : 'c-k';
    case 'ç': return 'cedilha';
    case 'g': return s === 'ʒ' ? 'g-j' : 'g';
    case 'h': return 'h-mudo';
    case 'x': return s === 'ʃ' ? 'x-ch' : 'x-outro';
    case 'z': return fimSilaba ? 's-final' : 'z';
    case 'l':
      if (fimSilaba) return 'l-final';
      return /[bcdfgptv]/.test(ant ?? '') ? 'encontro-l' : 'l';
    case 'r':
      if (/[bcdfgptv]/.test(ant ?? '')) return 'encontro-r';
      if (inicioPalavra) return 'r-forte';
      if (fimSilaba) return 'r-final';
      if (ehVogal(ant)) return 'r-fraco';
      return 'r-forte'; // honra, Israel
    case 's':
      if (inicioPalavra) return 's';
      if (fimSilaba) return 's-final';
      if (ehVogal(ant)) return 's-z';
      return 's-apos-consoante';
    default: return 'a';
  }
}

/** Tônica fora da penúltima sem acento gráfico e sem a regra das terminações em I, U e ditongo (05 §4 A20). */
function tonicaIrregular(e: EntradaBanco): boolean {
  if (!e.oxitona) return false;
  const w = e.texto.toLowerCase();
  if (ACENTOS.test(w)) return false;
  return !/([iu]|[iu]s|[iu][mn]|[aeo][iu])$/.test(w);
}

/** Valores sonoros da palavra (um por grafema, sem repetição) + os avisos de leitura. */
export function valoresDaEntrada(e: EntradaBanco): { valores: ValorTF[]; avisos: string[]; erros: string[] } {
  const a = analisar(e);
  const valores = new Set<ValorTF>(a.grafemas.map((g) => g.valor));
  const avisos: string[] = [];
  if (tonicaIrregular(e)) valores.add('acento-tonico');
  // A5: vogal TÔNICA antes de M/N da sílaba seguinte (cama, banana, lama): soa nasalizada em boa parte do Brasil
  const w = e.texto.toLowerCase();
  if (!e.oxitona && !ACENTOS.test(w)) {
    const vs = [...w].map((c, i) => (ehVogal(c) ? i : -1)).filter((i) => i >= 0);
    const tonica = vs.length >= 2 ? vs[vs.length - 2] : vs[0];
    if (tonica !== undefined && 'mn'.includes(w[tonica + 1] ?? '') && ehVogal(w[tonica + 2])) valores.add('nasalizada');
  }
  for (const v of valores) if (VALORES_AVISO.includes(v)) avisos.push(`"${e.texto}": ${v === 'nasalizada' ? 'vogal nasalizada pela consoante seguinte (A5)' : 'vogal átona que muda na fala'}`);
  return { valores: [...valores], avisos, erros: a.erros };
}

/* ------------------------------------------------------------------------------------------------------------ */
/* 4. Verificação de palavra, frase, texto e palavra inventada                                                   */
/* ------------------------------------------------------------------------------------------------------------ */

export interface Resultado {
  ok: boolean;
  erros: string[];
  avisos: string[];
}

/** Monta o banco (texto → entrada), recusando anotação repetida e diferente. */
export function montarBanco(entradas: EntradaBanco[]): Record<string, EntradaBanco> {
  const b: Record<string, EntradaBanco> = {};
  for (const e of entradas) {
    const k = e.texto.toLowerCase();
    if (b[k] && b[k].sons !== e.sons) throw new Error(`Banco: "${k}" com duas anotações diferentes`);
    b[k] = e;
  }
  return b;
}

/**
 * A palavra pode ser LIDA ou ESCRITA sozinha ao fim da unidade `n`? Erros: fora do banco, anotação que não bate,
 * valor ainda não ensinado. Avisos: A5 (nasalização), vogal átona reduzida, pronúncia regional já ensinada (ti/di, R final).
 */
export function verificarPalavra(palavra: string, n: number, banco: Record<string, EntradaBanco>, permitidos: Set<ValorTF> = valoresAte(n)): Resultado {
  const e = banco[palavra.toLowerCase()];
  if (!e) return { ok: false, erros: [`"${palavra}" não está no banco de palavras com pronúncia anotada`], avisos: [] };
  const { valores, avisos, erros } = valoresDaEntrada(e);
  for (const v of valores) {
    if (VALORES_AVISO.includes(v)) continue;
    if (!permitidos.has(v)) {
      const u = unidadeDoValor(v);
      erros.push(`"${e.texto}" usa ${v}, ensinado só em ${u ? UNIDADES_TF[u - 1].id : '?'}`);
    } else if (VALORES_REGIONAIS.includes(v)) avisos.push(`"${e.texto}": ${v} varia de região (todas as pronúncias valem)`);
  }
  return { ok: erros.length === 0, erros, avisos };
}

/** Unidade a partir da qual a palavra é decodificável (o maior valor que ela usa). */
export function unidadeQueLibera(palavra: string, banco: Record<string, EntradaBanco>): number | undefined {
  const e = banco[palavra.toLowerCase()];
  if (!e) return undefined;
  const us = valoresDaEntrada(e).valores.filter((v) => !VALORES_AVISO.includes(v)).map((v) => unidadeDoValor(v) ?? 0);
  return Math.max(1, ...us);
}

/**
 * PALAVRAS FREQUENTES ensinadas à parte (05 §5) [DP]: lista curta, cada uma amarrada à unidade a partir da qual pode
 * aparecer em frases. PRECISA DE APROVAÇÃO HUMANA (não vem de nenhum material). Fora da lista e indecodável = erro.
 */
export const FREQUENTES: { palavra: string; desde: number }[] = [
  { palavra: 'é', desde: 12 }, { palavra: 'um', desde: 13 }, { palavra: 'não', desde: 13 }, { palavra: 'de', desde: 20 },
  { palavra: 'com', desde: 19 }, { palavra: 'que', desde: 19 }
];
/** Quantas palavras frequentes (não decodificáveis) uma frase aceita (05 §3) [DP]. */
export const FREQUENTES_POR_FRASE = 1;
/** Porcentagem mínima de palavras decodificáveis num texto para ler sozinho (05 §3; VT-PE p. 31) [DP na aplicação]. */
export const PORCENTAGEM_TEXTO = 0.95;

export const palavrasDaFrase = (frase: string) => frase.toLowerCase().replace(/[.,!?;:…"“”]/g, ' ').split(/\s+/).filter(Boolean);

/** Frase para ler: todas as palavras decodificáveis, ou no máximo 1 palavra frequente já liberada. */
export function verificarFrase(frase: string, n: number, banco: Record<string, EntradaBanco>, permitidos?: Set<ValorTF>): Resultado & { frequentes: string[] } {
  const erros: string[] = [];
  const avisos: string[] = [];
  const frequentes: string[] = [];
  for (const w of palavrasDaFrase(frase)) {
    const r = verificarPalavra(w, n, banco, permitidos);
    avisos.push(...r.avisos);
    if (r.ok) continue;
    const f = FREQUENTES.find((x) => x.palavra === w);
    if (f && f.desde <= n) frequentes.push(w);
    else erros.push(...r.erros);
  }
  if (frequentes.length > FREQUENTES_POR_FRASE) erros.push(`"${frase}": ${frequentes.length} palavras frequentes (máximo ${FREQUENTES_POR_FRASE})`);
  return { ok: erros.length === 0, erros, avisos, frequentes };
}

/** Texto para ler sozinho: ≥ 95% de palavras decodificáveis; o resto da lista de frequentes. */
export function verificarTexto(texto: string, n: number, banco: Record<string, EntradaBanco>): Resultado & { porcentagem: number } {
  const ws = palavrasDaFrase(texto);
  const erros: string[] = [];
  const avisos: string[] = [];
  let boas = 0;
  for (const w of ws) {
    const r = verificarPalavra(w, n, banco);
    avisos.push(...r.avisos);
    if (r.ok) { boas++; continue; }
    const f = FREQUENTES.find((x) => x.palavra === w);
    if (!(f && f.desde <= n)) erros.push(...r.erros);
  }
  const porcentagem = ws.length ? boas / ws.length : 1;
  if (porcentagem < PORCENTAGEM_TEXTO) erros.push(`texto com ${Math.round(porcentagem * 100)}% de palavras decodificáveis (mínimo ${PORCENTAGEM_TEXTO * 100}%)`);
  return { ok: erros.length === 0, erros, avisos, porcentagem };
}

/** Palavras que não podem ser "inventadas" (parecem palavrão ou palavra feia) [DP]. */
const PROIBIDAS = ['puta', 'puto', 'pica', 'pinto', 'cu', 'bosta', 'merda', 'caca', 'coco', 'xixi', 'bunda', 'peido', 'porra', 'foda', 'fode', 'teta', 'buceta', 'caralho', 'piroca', 'pau', 'cocô'];

/**
 * Palavra INVENTADA (05 §3): só valores ensinados, sílabas do português (consoante + vogal, vogal, ditongo), não é
 * palavra real nem parece palavrão.
 */
export function verificarPseudo(palavra: string, n: number, banco: Record<string, EntradaBanco>, reais: Set<string>): Resultado {
  const r = verificarPalavra(palavra, n, banco);
  const w = palavra.toLowerCase();
  if (!banco[w]?.pseudo) r.erros.push(`"${palavra}" não está marcada como inventada no banco`);
  if (reais.has(w)) r.erros.push(`"${palavra}" é palavra de verdade`);
  if (PROIBIDAS.some((p) => w === p || w.startsWith(p) || w.endsWith(p))) r.erros.push(`"${palavra}" parece palavra feia`);
  // sílabas simples: consoante (opcional) + vogal (com ou sem acento, ou Ã) + I/U de ditongo, e M/N no fim da sílaba (vogal
  // nasal); os valores (acento, nasal, R) continuam barrados pela unidade em `verificarPalavra`
  if (!/^([bcdfgjlmnprstvz]?(ã|[aeiouáéíóúâêô][iu]?)([mn](?![aeiouáéíóúâêôã]))?)+$/.test(w)) r.erros.push(`"${palavra}" tem sílaba que não é do português simples`);
  return { ok: r.erros.length === 0, erros: r.erros, avisos: r.avisos };
}
