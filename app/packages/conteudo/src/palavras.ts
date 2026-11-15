/**
 * Banco de palavras. Cada palavra lida pela criança precisa ser DECODIFICÁVEL na etapa
 * (o teste `linter-decodificabilidade.test.ts` confere as palavras de leitura de cada região).
 * Figuras: emoji como marcador provisório (no produto, ilustrações 3D da casa).
 */
import type { Palavra, RegiaoId, ValorSonoro } from './tipos.ts';

const p = (texto: string, silabas: string, figura: string, pseudo = false): Palavra => ({
  texto,
  silabas: silabas.split('-'),
  figura,
  pseudo
});

/** Figuras faladas (R0–R1): a criança ouve, não lê. */
export const FIGURAS: Record<string, Palavra> = Object.fromEntries(
  [
    p('gato', 'ga-to', '🐱'), p('pato', 'pa-to', '🦆'), p('mão', 'mão', '✋'), p('pão', 'pão', '🍞'),
    p('bola', 'bo-la', '⚽'), p('cola', 'co-la', '🧴'), p('casa', 'ca-sa', '🏠'), p('mesa', 'me-sa', '🪑'),
    p('sapo', 'sa-po', '🐸'), p('lua', 'lu-a', '🌙'), p('rua', 'ru-a', '🛣️'), p('janela', 'ja-ne-la', '🪟'),
    p('panela', 'pa-ne-la', '🍲'), p('foca', 'fo-ca', '🦭'), p('pipoca', 'pi-po-ca', '🍿'), p('leão', 'le-ão', '🦁'),
    p('avião', 'a-vi-ão', '✈️'), p('mala', 'ma-la', '🧳'), p('macaco', 'ma-ca-co', '🐒'), p('moto', 'mo-to', '🏍️'),
    p('sol', 'sol', '☀️'), p('suco', 'su-co', '🧃'), p('faca', 'fa-ca', '🍴'), p('fogo', 'fo-go', '🔥'),
    p('formiga', 'for-mi-ga', '🐜'), p('folha', 'fo-lha', '🍃'), p('pé', 'pé', '🦶'), p('bolota', 'bo-lo-ta', '🦔'),
    p('tatu', 'ta-tu', '🦔'), p('dado', 'da-do', '🎲'), p('vovó', 'vo-vó', '👵'), p('vovô', 'vo-vô', '👴'),
    p('abelha', 'a-be-lha', '🐝'), p('uva', 'u-va', '🍇'), p('ovo', 'o-vo', '🥚'), p('ovelha', 'o-ve-lha', '🐑'),
    p('elefante', 'e-le-fan-te', '🐘'), p('estrela', 'es-tre-la', '⭐'), p('escada', 'es-ca-da', '🪜'),
    p('ilha', 'i-lha', '🏝️'), p('iglu', 'i-glu', '🧊'), p('ioiô', 'i-o-iô', '🪀'), p('urso', 'ur-so', '🐻'),
    p('abacaxi', 'a-ba-ca-xi', '🍍'), p('peixe', 'pei-xe', '🐟'), p('banana', 'ba-na-na', '🍌'),
    p('caneca', 'ca-ne-ca', '☕'), p('boneca', 'bo-ne-ca', '🪆'), p('mel', 'mel', '🍯'), p('papel', 'pa-pel', '📄'),
    p('feijão', 'fei-jão', '🫘'), p('sapato', 'sa-pa-to', '👞'), p('chave', 'cha-ve', '🔑'), p('navio', 'na-vi-o', '🚢'),
    p('garrafa', 'gar-ra-fa', '🧴'), p('concha', 'con-cha', '🐚'), p('caranguejo', 'ca-ran-gue-jo', '🦀'),
    p('copo plástico', 'co-po', '🥤'), p('sacola', 'sa-co-la', '🛍️'), p('mamãe', 'ma-mãe', '👩'), p('papai', 'pa-pai', '👨'),
    p('peteca', 'pe-te-ca', '🏸'), p('ginga', 'gin-ga', '🤸'), p('esquiva', 'es-qui-va', '🤸'), p('vela', 've-la', '🕯️'),
    p('vaca', 'va-ca', '🐄'), p('zebra', 'ze-bra', '🦓'), p('rato', 'ra-to', '🐭'),
    // Trilha do Alfabeto (D027): palavras-exemplo de H, K, Q, W, X e Y (figuras 3D em web/public/assets/figuras)
    p('hipopótamo', 'hi-po-pó-ta-mo', '🦛'), p('kiwi', 'ki-wi', '🥝'), p('queijo', 'quei-jo', '🧀'), p('xícara', 'xí-ca-ra', '🍵'),
    p('Wesley', 'Wes-ley', '🪪'), p('Yasmin', 'Yas-min', '🪪'), p('yakisoba', 'ya-ki-so-ba', '🍜'), p('xilofone', 'xi-lo-fo-ne', '🎹'), p('helicóptero', 'he-li-cóp-te-ro', '🚁'),
    // D030 §2: mais figuras para "qual figura começa com o som?" (todas com arte em web/public/assets/figuras)
    p('dedo', 'de-do', ''), p('doce', 'do-ce', ''), p('ema', 'e-ma', ''), p('elástico', 'e-lás-ti-co', ''), p('galo', 'ga-lo', ''),
    p('horta', 'hor-ta', ''), p('jacaré', 'ja-ca-ré', ''), p('jaca', 'ja-ca', ''), p('kart', 'kart', ''), p('ketchup', 'ke-tchup', ''),
    p('lobo', 'lo-bo', ''), p('ninho', 'ni-nho', ''), p('nuvem', 'nu-vem', ''), p('olho', 'o-lho', ''), p('quiabo', 'qui-a-bo', ''),
    p('quadro', 'qua-dro', ''), p('roda', 'ro-da', ''), p('tomate', 'to-ma-te', ''), p('tapete', 'ta-pe-te', ''), p('unha', 'u-nha', ''),
    p('wafer', 'wa-fer', ''), p('xadrez', 'xa-drez', ''), p('zíper', 'zí-per', ''), p('zero', 'ze-ro', '')
  ].map((w) => [w.texto, w])
);

/** Palavras de LEITURA de R2a (só M, L, F + vogais; sílabas CV). */
export const PALAVRAS_R2A: Palavra[] = [
  p('MALA', 'MA-LA', '🧳'), p('LUA', 'LU-A', '🌙'), p('FALA', 'FA-LA', '🗣️'), p('FILA', 'FI-LA', '🚶'),
  p('FOFO', 'FO-FO', '🧸'), p('MULA', 'MU-LA', '🫏'), p('LULA', 'LU-LA', '🦑'), p('MOLA', 'MO-LA', '🌀'),
  p('LAMA', 'LA-MA', '🟫'), p('MOFO', 'MO-FO', '🍞'), p('FOFA', 'FO-FA', '🧸'),
  // pseudopalavras ("nomes de bichinhos da mata")
  p('LUFO', 'LU-FO', '', true), p('FOLU', 'FO-LU', '', true), p('MUFE', 'MU-FE', '', true), p('LIFU', 'LI-FU', '', true), p('FEMO', 'FE-MO', '', true),
  // D030 §6: pseudopalavras só com valores sonoros já ensinados (sem E/O átono no fim)
  p('MIFA', 'MI-FA', '', true), p('FULI', 'FU-LI', '', true), p('MUFA', 'MU-FA', '', true)
];

export function figura(texto: string): Palavra {
  const w = FIGURAS[texto] ?? PALAVRAS_R2A.find((x) => x.texto === texto.toUpperCase());
  if (!w) throw new Error(`Palavra sem cadastro no banco: ${texto}`);
  return w;
}

/** Grafemas conhecidos ao FIM de cada região (para o linter de decodificabilidade). */
export const GRAFEMAS_DA_REGIAO: Record<string, string[]> = {
  // Trilha do Alfabeto: as letras aparecem SOLTAS ("B b"), nunca em palavras para ler
  AL: [...'ABCDEFGHIJKLMNOPQRSTUVWXYZÁÉÊ', ' '],
  R0: [],
  R1: ['A', 'E', 'I', 'O', 'U'],
  R2a: ['A', 'E', 'I', 'O', 'U', 'M', 'L', 'F']
};

/* ------------------------------------------------------------------------------------------------------------
 * D030 §6 · VALORES SONOROS: o que cada palavra usa ALÉM do som principal de cada letra.
 * ---------------------------------------------------------------------------------------------------------- */

const VOGAL = 'AEIOUÁÀÂÃÉÊÍÓÔÕÚ';
const ehVogal = (ch: string | undefined) => !!ch && VOGAL.includes(ch);

/** Valores sonoros que dá para ver pela ESCRITA (É/Ó sem acento não dá: esses vão marcados em `VALORES_DAS_PALAVRAS`). */
export function valoresInferidos(palavra: string): ValorSonoro[] {
  const w = palavra.toUpperCase().replace(/[^A-ZÁÀÂÃÉÊÍÓÔÕÚÇ]/g, '');
  const v = new Set<ValorSonoro>();
  const acento = /[ÁÀÂÃÉÊÍÓÔÕÚ]/.test(w);
  if (/É/.test(w)) v.add('e-aberto');
  if (/Ó/.test(w)) v.add('o-aberto');
  if (!acento && w.length > 2 && /[^AEIOU]ES?$|[^AEIOU]E$/.test(w)) v.add('e-final-i');
  if (!acento && w.length > 2 && /[^AEIOU]OS?$/.test(w)) v.add('o-final-u');
  if (!acento && w.length > 2 && /[AEIOU][EO]S?$/.test(w) && !/[AEO][IU]$/.test(w)) v.add(w.endsWith('E') || w.endsWith('ES') ? 'e-final-i' : 'o-final-u');
  if (/[ÃÕ]/.test(w) || /[AEIOUÁÉÍÓÚÂÊÔ][MN]([^AEIOUÁÀÂÃÉÊÍÓÔÕÚH]|$)/.test(w)) v.add('nasal');
  // vogal tônica (penúltima, em palavra sem acento terminada em A/E/O) antes de M ou N: "cama", "banana", "lama"
  if (!acento && /[AEO]S?$/.test(w)) {
    const idx = [...w].map((ch, i) => (ehVogal(ch) ? i : -1)).filter((i) => i >= 0);
    const tonica = idx[idx.length - 2];
    if (tonica !== undefined && 'AEO'.includes(w[tonica]) && 'MN'.includes(w[tonica + 1] ?? '') && ehVogal(w[tonica + 2])) v.add('nasalizada');
  }
  if (/[AEOÁÉÊÓÔÂ][IU](?![MN]([^AEIOU]|$))|[ÃÕ][OE]|UI|IU/.test(w.replace(/[QG]U(?=[EI])/g, 'K'))) v.add('ditongo');
  for (let i = 1; i < w.length - 1; i++) {
    if (w[i] === 'S' && ehVogal(w[i - 1]) && ehVogal(w[i + 1])) v.add('s-som-z');
    if (w[i] === 'R' && ehVogal(w[i - 1]) && ehVogal(w[i + 1])) v.add('r-fraco');
  }
  if (/R([^AEIOUÁÀÂÃÉÊÍÓÔÕÚR]|$)/.test(w)) v.add('r-final');
  if (/L([^AEIOUÁÀÂÃÉÊÍÓÔÕÚH]|$)/.test(w)) v.add('l-final');
  if (/S([^AEIOUÁÀÂÃÉÊÍÓÔÕÚS]|$)/.test(w) && !v.has('e-final-i') && !v.has('o-final-u')) v.add('s-final');
  if (/C[EIÉÊÍ]|Ç/.test(w)) v.add('c-som-s');
  if (/G[EIÉÊÍ]/.test(w)) v.add('g-som-j');
  if (/CH|LH|NH|RR|SS|QU|GU[EIÉÊÍ]/.test(w)) v.add('digrafo');
  if (/^H/.test(w)) v.add('h-mudo');
  if (/[BCDFGPTV][RL][AEIOUÁÀÂÃÉÊÍÓÔÕÚ]/.test(w)) v.add('encontro');
  if (/.X/.test(w)) v.add('x-outro-som');
  if (/[KWY]/.test(w)) v.add('letra-de-nomes');
  return [...v];
}

/**
 * CAMPO `valores` do conteúdo: valores sonoros de cada palavra que a criança monta ou lê (lista vazia = só o som
 * principal de cada letra). O teste confere que a marcação cobre tudo o que a escrita mostra (`valoresInferidos`)
 * e que as atividades de LEITURA autônoma só usam palavras com valores já ensinados na etapa.
 */
export const VALORES_DAS_PALAVRAS: Record<string, ValorSonoro[]> = {
  // primeiras palavrinhas da Trilha do Alfabeto
  BABÁ: [], BEBÊ: [], CAFÉ: ['e-aberto'], FACA: [], BIFE: ['e-final-i'], JACA: [], BALA: [], FILA: [], MALA: [], CAMA: ['nasalizada'],
  BANANA: ['nasalizada'], MENINA: ['e-reduzido'], BOLA: ['o-aberto'], DADO: ['o-final-u'], COPO: ['o-aberto', 'o-final-u'], MAPA: [],
  RODA: ['o-aberto'], REI: ['ditongo'], SAPO: ['o-final-u'], SOPA: [], GATO: ['o-final-u'], PATO: ['o-final-u'], LUA: [], TATU: [],
  UVA: [], VACA: [], PEIXE: ['ditongo', 'e-final-i', 'x-outro-som'], DOZE: ['e-final-i'], CABE: ['e-final-i'], DEDO: ['o-final-u'],
  // Vale do M-L-F
  MA: [], MO: [], MU: [], FALA: [], FOFO: ['o-final-u'], FOFA: [], MULA: [], LULA: [], MOLA: ['o-aberto'], LAMA: ['nasalizada'], MOFO: ['o-final-u'],
  LUFO: ['o-final-u'], FOLU: [], MUFE: ['e-final-i'], LIFU: [], FEMO: ['nasalizada', 'o-final-u'], MIFA: [], FULI: [], MUFA: []
};

/** Valores sonoros de uma palavra: os marcados no conteúdo + os que a escrita mostra. */
export function valoresDaPalavra(palavra: string): ValorSonoro[] {
  const w = palavra.toUpperCase();
  return [...new Set([...(VALORES_DAS_PALAVRAS[w] ?? []), ...valoresInferidos(w)])];
}

/**
 * Valores sonoros JÁ ENSINADOS ao fim de cada etapa (docs/pedagogia/05-regras-de-decodificabilidade.md §4).
 * Trilha A–Z: nenhum além do som principal (ela é "conhecer as letras"). O É e o Ó abertos são treinados na Ilha das
 * Vogais (R1) e valem dali em diante. O resto (E/O átonos no fim, nasais, ditongos, S entre vogais…) entra com a
 * trilha fônica; até lá, palavra com esses valores não entra em leitura autônoma.
 */
export const VALORES_ENSINADOS: Record<RegiaoId, ValorSonoro[]> = {
  AL: [], R1: ['e-aberto', 'o-aberto'], R2a: ['e-aberto', 'o-aberto'], R0: ['e-aberto', 'o-aberto']
};
/**
 * Valores que geram AVISO, não bloqueio (armadilha A5: vogal nasalizada pela consoante seguinte, "cama", "banana";
 * e o E átono que alguns falam como I, "menina"): a pronúncia varia e a letra continua com o som ensinado.
 */
export const VALORES_SO_AVISO: ValorSonoro[] = ['nasalizada', 'e-reduzido'];

/** A palavra pode entrar em LEITURA autônoma nesta etapa? (todos os valores sonoros já ensinados) */
export function leituraPermitida(palavra: string, regiao: RegiaoId): boolean {
  const ensinados = VALORES_ENSINADOS[regiao];
  return valoresDaPalavra(palavra).every((x) => ensinados.includes(x) || VALORES_SO_AVISO.includes(x));
}
