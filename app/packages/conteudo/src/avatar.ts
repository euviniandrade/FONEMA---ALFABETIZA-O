/**
 * AVATAR 3D DA CRIANÇA (D029 §1 e §7; D008): o boneco como DADOS — cores e variações.
 *
 * - O boneco COMEÇA num padrão completo (modelo 3D pronto: rosto, cabelo, roupa toda branca com o "A" azul) e a
 *   criança vai personalizando, como nos criadores de personagem dos jogos: cor da pele, dos olhos, do cabelo,
 *   da camiseta, da calça e do calçado. O tipo de cabelo troca o modelo inteiro (só aparece quando o arquivo existe).
 * - Só dois sexos (D029): menino usa o modelo de menino; menina, o de menina. Cabelos são por sexo.
 * - Identidade (pele, olhos, cor e tipo de cabelo) e acessibilidade são SEMPRE grátis (D002, D008).
 * - Cores especiais de roupa e penteados extras abrem com o avanço das fases E com moedinhas
 *   ("Abre na Letra C · 6 moedas").
 * - Sem joias nem adornos (D008), sem arco-íris (D009: cores lisas da paleta da marca e da natureza).
 *
 * Arquivos 3D: web/public/assets/modelos3d/avatar-<menino|menina>-<cabelo>.glb, listados em avatares.json
 * (gerado por app/ferramentas/avatar-mascaras.py). Ver app/docs/avatar-3d-contrato.md.
 */
import type { Genero } from './tipos.ts';

export type CategoriaAvatar = 'pele' | 'olhos' | 'corCabelo' | 'cabelo' | 'camisa' | 'calca' | 'calcado' | 'acessibilidade';
export type SexoPeca = Genero | 'ambos';

export interface PecaAvatar {
  id: string;
  categoria: CategoriaAvatar;
  nome: string;
  sexo: SexoPeca;
  /** Cor aplicada na região do boneco (e amostra na tela). */
  cor?: string;
  /** É a cor/variação com que o modelo já vem: não recolore nada. */
  padrao?: boolean;
  /** Cabelos: chave do modelo 3D em avatares.json (ex.: "menina-coque"). */
  modelo?: string;
  /** Fase que precisa estar aberta para a peça destrancar. Ausente = liberada desde o começo. */
  fase?: string;
  /** Preço em moedinhas. 0 = grátis. */
  preco: number;
  /** Ainda não dá para mostrar com dignidade no modelo atual: fica fora das telas (o dado é preservado). */
  indisponivel?: boolean;
}

const p = (categoria: CategoriaAvatar, id: string, nome: string, sexo: SexoPeca, extra: Partial<PecaAvatar> = {}): PecaAvatar => ({ id, categoria, nome, sexo, preco: 0, ...extra });

/**
 * Cores de pele: a gama brasileira inteira, em ordem do mais claro ao mais escuro, sem "padrão" destacado
 * (clara · morena clara · morena · parda · negra clara · negra retinta e os tons entre elas).
 */
export const PELES: PecaAvatar[] = [
  ['pele-01', 'Clara', '#F2CBB0'], ['pele-02', 'Clara rosada', '#EABC9A'], ['pele-03', 'Morena clara', '#E0AC84'], ['pele-04', 'Morena', '#CF9468'],
  ['pele-05', 'Morena dourada', '#BC7E52'], ['pele-06', 'Parda', '#A56A40'], ['pele-07', 'Parda escura', '#8A5433'], ['pele-08', 'Negra clara', '#6F4128'],
  ['pele-09', 'Negra', '#543020'], ['pele-10', 'Negra retinta', '#3B2117']
].map(([id, nome, cor]) => p('pele', id, nome, 'ambos', { cor }));

export const OLHOS: PecaAvatar[] = [
  p('olhos', 'castanho-escuro', 'Castanho-escuro', 'ambos', { cor: '#3E2414', padrao: true }),
  ...[['castanho', 'Castanho-claro', '#7A4A22'], ['mel', 'Mel', '#A8742C'], ['preto', 'Preto', '#17100C'], ['verde', 'Verde', '#4F7F4A'], ['azul', 'Azul', '#3F78B5'], ['cinza', 'Cinza', '#6F7F8C']]
    .map(([id, nome, cor]) => p('olhos', id, nome, 'ambos', { cor }))
];

/** Cores de cabelo (e das sobrancelhas): só as naturais. */
export const CORES_CABELO: PecaAvatar[] = [
  p('corCabelo', 'preto', 'Preto', 'ambos', { cor: '#1B1512' }),
  p('corCabelo', 'castanho-escuro', 'Castanho-escuro', 'ambos', { cor: '#3A2416', padrao: true }),
  ...[['castanho', 'Castanho', '#5E3A20'], ['castanho-claro', 'Castanho-claro', '#8A5A30'], ['loiro-escuro', 'Loiro-escuro', '#B08440'], ['loiro', 'Loiro', '#D9B25E'], ['ruivo', 'Ruivo', '#B4532A']]
    .map(([id, nome, cor]) => p('corCabelo', id, nome, 'ambos', { cor }))
];

/**
 * Tipos de cabelo: cada um é um modelo 3D inteiro. A tela só mostra os que já têm arquivo em avatares.json;
 * enquanto só existir o padrão, o passo "tipo de cabelo" nem aparece.
 */
export const CABELOS: PecaAvatar[] = [
  p('cabelo', 'f-padrao', 'Liso no ombro', 'f', { modelo: 'menina-padrao', padrao: true }),
  p('cabelo', 'f-cacheado', 'Cacheado', 'f', { modelo: 'menina-cacheado' }),
  p('cabelo', 'f-black', 'Black power', 'f', { modelo: 'menina-black' }),
  p('cabelo', 'f-trancas', 'Tranças', 'f', { modelo: 'menina-trancas' }),
  p('cabelo', 'f-rabo', 'Rabo de cavalo', 'f', { modelo: 'menina-rabo' }),
  p('cabelo', 'f-coque', 'Coque', 'f', { modelo: 'menina-coque', fase: 'AL-D', preco: 8 }),
  p('cabelo', 'm-padrao', 'Liso curto', 'm', { modelo: 'menino-padrao', padrao: true }),
  p('cabelo', 'm-cacheado', 'Cacheado', 'm', { modelo: 'menino-cacheado' }),
  p('cabelo', 'm-crespo', 'Crespo', 'm', { modelo: 'menino-crespo' }),
  p('cabelo', 'm-franja', 'Franja', 'm', { modelo: 'menino-franja' }),
  p('cabelo', 'm-topete', 'Topete', 'm', { modelo: 'menino-topete', fase: 'AL-D', preco: 8 })
];

const MARINHO = '#22407A', CEU = '#8CC4EA', IPE = '#F1B434', MATA = '#2F8F5B', TERRA = '#C4673F', JEANS = '#4A6FA5', CINZA = '#8E97A6', MADEIRA = '#9A6A3E', GRAFITE = '#33373F';

/** Cor da camiseta. A letra "A" azul do peito nunca muda. */
export const CAMISAS: PecaAvatar[] = [
  p('camisa', 'branca', 'Branca', 'ambos', { cor: '#FFFFFF', padrao: true }),
  p('camisa', 'ceu', 'Azul-clara', 'ambos', { cor: CEU }),
  p('camisa', 'ipe', 'Amarela', 'ambos', { cor: IPE }),
  p('camisa', 'mata', 'Verde', 'ambos', { cor: MATA, fase: 'AL-B', preco: 4 }),
  p('camisa', 'terra', 'Terracota', 'ambos', { cor: TERRA, fase: 'AL-C', preco: 6 }),
  p('camisa', 'madeira', 'Cor de madeira', 'ambos', { cor: MADEIRA, fase: 'AL-F', preco: 10 })
];

export const CALCAS: PecaAvatar[] = [
  p('calca', 'branca', 'Branca', 'ambos', { cor: '#FFFFFF', padrao: true }),
  p('calca', 'marinho', 'Azul-marinho', 'ambos', { cor: MARINHO }),
  p('calca', 'jeans', 'Jeans', 'ambos', { cor: JEANS }),
  p('calca', 'mata', 'Verde', 'ambos', { cor: MATA, fase: 'AL-C', preco: 6 }),
  p('calca', 'cinza', 'Cinza', 'ambos', { cor: CINZA, fase: 'AL-D', preco: 5 }),
  p('calca', 'terra', 'Terracota', 'ambos', { cor: TERRA, fase: 'AL-G', preco: 8 })
];

export const CALCADOS: PecaAvatar[] = [
  p('calcado', 'branco', 'Branco', 'ambos', { cor: '#FFFFFF', padrao: true }),
  p('calcado', 'marinho', 'Azul-marinho', 'ambos', { cor: MARINHO }),
  p('calcado', 'ceu', 'Azul-claro', 'ambos', { cor: CEU }),
  p('calcado', 'ipe', 'Amarelo', 'ambos', { cor: IPE, fase: 'AL-B', preco: 4 }),
  p('calcado', 'terra', 'Terracota', 'ambos', { cor: TERRA, fase: 'AL-F', preco: 10 }),
  p('calcado', 'grafite', 'Grafite', 'ambos', { cor: GRAFITE, fase: 'AL-I', preco: 12 }),
  p('calcado', 'mata', 'Verde', 'ambos', { cor: MATA, fase: 'AL-L', preco: 14 })
];

/**
 * Acessibilidade (D008, D029): sempre grátis, sempre opcional, nunca vem de entrada. Fica numa seção própria da Lojinha.
 * O modelo atual é uma malha única, em pé e sem esqueleto: a cadeira de rodas precisa de um modelo sentado e o aparelho
 * auditivo precisa da orelha à mostra — ficam guardados no cadastro, mas fora da tela, até existir o modelo certo.
 */
export const ACESSIBILIDADE: PecaAvatar[] = [
  p('acessibilidade', 'oculos', 'Óculos', 'ambos', { cor: MARINHO }),
  p('acessibilidade', 'pintura-no-rosto', 'Pintura no rosto', 'ambos', { cor: '#B5432A' }),
  p('acessibilidade', 'aparelho-auditivo', 'Aparelho auditivo', 'ambos', { cor: '#C9B8A4', indisponivel: true }),
  p('acessibilidade', 'cadeira-de-rodas', 'Cadeira de rodas', 'ambos', { cor: MARINHO, indisponivel: true })
];

export const PECAS_AVATAR: PecaAvatar[] = [...PELES, ...OLHOS, ...CORES_CABELO, ...CABELOS, ...CAMISAS, ...CALCAS, ...CALCADOS, ...ACESSIBILIDADE];

const INDICE = new Map(PECAS_AVATAR.map((x) => [`${x.categoria}:${x.id}`, x]));
export function pecaAvatar(categoria: CategoriaAvatar, id: string | null | undefined): PecaAvatar | undefined {
  return id ? INDICE.get(`${categoria}:${id}`) : undefined;
}

/** Peças de uma categoria que a criança deste sexo pode ver (as do outro sexo e as indisponíveis nem aparecem). */
export function pecasPara(categoria: CategoriaAvatar, sexo: Genero): PecaAvatar[] {
  return PECAS_AVATAR.filter((x) => x.categoria === categoria && !x.indisponivel && (x.sexo === 'ambos' || x.sexo === sexo));
}

/** A peça com que o modelo já vem nesta categoria (ex.: camiseta branca), se houver. */
export function pecaPadrao(categoria: CategoriaAvatar, sexo: Genero): PecaAvatar | undefined {
  return pecasPara(categoria, sexo).find((x) => x.padrao);
}

export type PassoAvatar = Exclude<CategoriaAvatar, 'acessibilidade'>;
/** Passos da personalização, na ordem. Nenhum é obrigatório: o boneco já começa completo (D029 §7). */
export const PASSOS_AVATAR: { id: PassoAvatar; titulo: string; pergunta: string }[] = [
  { id: 'pele', titulo: 'Pele', pergunta: 'Qual é a cor da sua pele?' },
  { id: 'olhos', titulo: 'Olhos', pergunta: 'Qual é a cor dos seus olhos?' },
  { id: 'corCabelo', titulo: 'Cabelo', pergunta: 'Qual é a cor do seu cabelo?' },
  { id: 'cabelo', titulo: 'Penteado', pergunta: 'Como é o seu cabelo?' },
  { id: 'camisa', titulo: 'Camiseta', pergunta: 'Escolha a cor da camiseta.' },
  { id: 'calca', titulo: 'Calça', pergunta: 'Escolha a cor da calça.' },
  { id: 'calcado', titulo: 'Calçado', pergunta: 'E a cor do calçado?' }
];

/** Id do item na mochila (Progresso.itens) quando a peça é comprada na Lojinha. */
export const idCompraAvatar = (peca: Pick<PecaAvatar, 'categoria' | 'id'>): string => `avatar:${peca.categoria}:${peca.id}`;
