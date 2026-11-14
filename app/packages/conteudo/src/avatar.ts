/**
 * AVATAR MONTÁVEL (D029 §1; D008): o boneco 3D da criança como DADOS — peças e cores.
 *
 * - Começa limpo; a criança escolhe (obrigatório): pele, formato do rosto, cor dos olhos, cabelo (com cor), camisa,
 *   calça/short e calçado.
 * - Só dois sexos (D029): cada peça vale para menino, para menina ou para os dois. Menina só vê peça de menina (e as
 *   comuns); menino só vê peça de menino (e as comuns).
 * - Identidade (pele, rosto, olhos, tipos de cabelo) e acessibilidade são SEMPRE grátis (D002, D008).
 * - Roupas e penteados extras abrem com o avanço das fases E com moedinhas: `fase` + `preco` ("Abre na Letra F · 12 moedas").
 * - Sem joias nem adornos (D008), sem arco-íris (D009: no máximo 2–3 cores por peça, paleta da marca e da natureza).
 *
 * O id de cada peça é também o nome do arquivo 3D quando houver modelo pronto:
 * web/public/assets/avatar3d/<categoria>-<id>.glb (ver app/docs/avatar-3d-contrato.md).
 */
import type { Genero } from './tipos.ts';

export type CategoriaAvatar = 'pele' | 'rosto' | 'olhos' | 'cabelo' | 'corCabelo' | 'camisa' | 'calca' | 'calcado' | 'acessibilidade';
export type SexoPeca = Genero | 'ambos';

export interface PecaAvatar {
  id: string;
  categoria: CategoriaAvatar;
  nome: string;
  sexo: SexoPeca;
  /** Cor principal (amostra na tela; pele, olhos, cabelo e tecido principal). */
  cor?: string;
  /** Segunda cor do tecido (mangas, listras, sola). */
  cor2?: string;
  /** Forma do modelo provisório feito em código (o GLB, quando existir, substitui). */
  modelo?: string;
  /** Estampa do tecido no modelo provisório. */
  estampa?: 'letra' | 'listras' | 'numero';
  /** Fase que precisa estar aberta para a peça aparecer destrancada. Ausente = liberada desde o começo. */
  fase?: string;
  /** Preço em moedinhas. 0 = grátis. */
  preco: number;
}

const p = (categoria: CategoriaAvatar, id: string, nome: string, sexo: SexoPeca, extra: Partial<PecaAvatar> = {}): PecaAvatar => ({ id, categoria, nome, sexo, preco: 0, ...extra });

/** Cores de pele: leque amplo e realista, do mais claro ao mais escuro. */
export const PELES: PecaAvatar[] = [
  ['pele-01', 'Pele 1', '#FBE3D4'], ['pele-02', 'Pele 2', '#F3CDB4'], ['pele-03', 'Pele 3', '#E8B994'], ['pele-04', 'Pele 4', '#D9A27A'],
  ['pele-05', 'Pele 5', '#C68A5E'], ['pele-06', 'Pele 6', '#AE7448'], ['pele-07', 'Pele 7', '#935C38'], ['pele-08', 'Pele 8', '#77472B'],
  ['pele-09', 'Pele 9', '#5C3520'], ['pele-10', 'Pele 10', '#432515']
].map(([id, nome, cor]) => p('pele', id, nome, 'ambos', { cor }));

export const ROSTOS: PecaAvatar[] = [
  p('rosto', 'redondo', 'Redondo', 'ambos'),
  p('rosto', 'oval', 'Oval', 'ambos'),
  p('rosto', 'coracao', 'Queixo fininho', 'ambos'),
  p('rosto', 'quadrado', 'Quadradinho', 'ambos')
];

export const OLHOS: PecaAvatar[] = [
  ['castanho-escuro', 'Castanho-escuro', '#4A2C17'], ['castanho', 'Castanho', '#7A4A22'], ['mel', 'Mel', '#A8742C'], ['preto', 'Preto', '#1E1410'],
  ['verde', 'Verde', '#4F7F4A'], ['azul', 'Azul', '#3F78B5'], ['cinza', 'Cinza', '#6F7F8C']
].map(([id, nome, cor]) => p('olhos', id, nome, 'ambos', { cor }));

/** Cores de cabelo: só as naturais. */
export const CORES_CABELO: PecaAvatar[] = [
  ['preto', 'Preto', '#17120F'], ['castanho-escuro', 'Castanho-escuro', '#3A2416'], ['castanho', 'Castanho', '#5E3A20'], ['castanho-claro', 'Castanho-claro', '#8A5A30'],
  ['loiro-escuro', 'Loiro-escuro', '#B08440'], ['loiro', 'Loiro', '#D9B25E'], ['ruivo', 'Ruivo', '#B4532A']
].map(([id, nome, cor]) => p('corCabelo', id, nome, 'ambos', { cor }));

/** Tipos de cabelo (identidade: grátis). Penteados extras abrem com a jornada. */
export const CABELOS: PecaAvatar[] = [
  // menina
  p('cabelo', 'f-crespo-curto', 'Crespo curto', 'f', { modelo: 'crespo-curto' }),
  p('cabelo', 'f-black-power', 'Black power', 'f', { modelo: 'black-power' }),
  p('cabelo', 'f-cacheado', 'Cacheado', 'f', { modelo: 'cacheado' }),
  p('cabelo', 'f-ondulado', 'Ondulado', 'f', { modelo: 'ondulado' }),
  p('cabelo', 'f-liso-longo', 'Liso comprido', 'f', { modelo: 'liso-longo' }),
  p('cabelo', 'f-liso-chanel', 'Liso curto', 'f', { modelo: 'liso-chanel' }),
  p('cabelo', 'f-trancas', 'Tranças', 'f', { modelo: 'trancas' }),
  p('cabelo', 'f-coque', 'Coque', 'f', { modelo: 'coque' }),
  p('cabelo', 'f-rabo-de-cavalo', 'Rabo de cavalo', 'f', { modelo: 'rabo-de-cavalo' }),
  p('cabelo', 'f-maria-chiquinha', 'Maria-chiquinha', 'f', { modelo: 'maria-chiquinha', fase: 'AL-D', preco: 8 }),
  // menino
  p('cabelo', 'm-raspado', 'Raspadinho', 'm', { modelo: 'raspado' }),
  p('cabelo', 'm-crespo-curto', 'Crespo curto', 'm', { modelo: 'crespo-curto' }),
  p('cabelo', 'm-black-power', 'Black power', 'm', { modelo: 'black-power' }),
  p('cabelo', 'm-cacheado', 'Cacheado', 'm', { modelo: 'cacheado-curto' }),
  p('cabelo', 'm-ondulado', 'Ondulado', 'm', { modelo: 'ondulado-curto' }),
  p('cabelo', 'm-liso', 'Liso', 'm', { modelo: 'liso-curto' }),
  p('cabelo', 'm-trancinhas', 'Trancinhas', 'm', { modelo: 'trancinhas' }),
  p('cabelo', 'm-topete', 'Topete', 'm', { modelo: 'topete', fase: 'AL-D', preco: 8 })
];

const MARINHO = '#1F3A6E', BRANCO = '#FAFBFD', CEU = '#8CC4EA', IPE = '#F1B434', MATA = '#2F8F5B', TERRA = '#C4673F', JEANS = '#4A6FA5', CINZA = '#8E97A6', MADEIRA = '#8A5A33';

export const CAMISAS: PecaAvatar[] = [
  p('camisa', 'uniforme', 'Camiseta da turma', 'ambos', { modelo: 'camiseta', cor: BRANCO, cor2: MARINHO, estampa: 'letra' }),
  p('camisa', 'camiseta-ceu', 'Camiseta azul', 'ambos', { modelo: 'camiseta', cor: CEU, cor2: CEU }),
  p('camisa', 'camiseta-ipe', 'Camiseta amarela', 'ambos', { modelo: 'camiseta', cor: IPE, cor2: IPE, fase: 'AL-B', preco: 4 }),
  p('camisa', 'camiseta-listrada', 'Camiseta listrada', 'ambos', { modelo: 'camiseta', cor: BRANCO, cor2: MARINHO, estampa: 'listras', fase: 'AL-C', preco: 6 }),
  p('camisa', 'polo-terra', 'Camisa polo', 'm', { modelo: 'polo', cor: TERRA, cor2: BRANCO, fase: 'AL-E', preco: 10 }),
  p('camisa', 'bata-ipe', 'Bata', 'f', { modelo: 'bata', cor: IPE, cor2: BRANCO, fase: 'AL-E', preco: 10 }),
  p('camisa', 'moletom-mata', 'Moletom', 'ambos', { modelo: 'manga-longa', cor: MATA, cor2: MATA, fase: 'AL-F', preco: 12 }),
  p('camisa', 'regata-esporte', 'Regata de esporte', 'm', { modelo: 'regata', cor: MARINHO, cor2: BRANCO, fase: 'AL-H', preco: 8 }),
  p('camisa', 'blusa-manguinha', 'Blusa de manguinha', 'f', { modelo: 'bufante', cor: CEU, cor2: BRANCO, fase: 'AL-H', preco: 8 }),
  p('camisa', 'camisa-do-time', 'Camisa do time', 'ambos', { modelo: 'camiseta', cor: MATA, cor2: IPE, estampa: 'numero', fase: 'AL-J', preco: 15 })
];

export const CALCAS: PecaAvatar[] = [
  p('calca', 'uniforme', 'Calça da turma', 'ambos', { modelo: 'calca', cor: MARINHO }),
  p('calca', 'bermuda-marinho', 'Bermuda', 'ambos', { modelo: 'bermuda', cor: MARINHO }),
  p('calca', 'saia-marinho', 'Saia', 'f', { modelo: 'saia', cor: MARINHO }),
  p('calca', 'jeans', 'Calça jeans', 'ambos', { modelo: 'calca', cor: JEANS, fase: 'AL-C', preco: 6 }),
  p('calca', 'bermuda-mata', 'Bermuda verde', 'm', { modelo: 'bermuda', cor: MATA, fase: 'AL-D', preco: 5 }),
  p('calca', 'saia-ipe', 'Saia amarela', 'f', { modelo: 'saia', cor: IPE, fase: 'AL-D', preco: 5 }),
  p('calca', 'moletom-cinza', 'Calça de moletom', 'm', { modelo: 'calca', cor: CINZA, fase: 'AL-G', preco: 8 }),
  p('calca', 'legging-mata', 'Legging', 'f', { modelo: 'legging', cor: MATA, fase: 'AL-G', preco: 8 })
];

export const CALCADOS: PecaAvatar[] = [
  p('calcado', 'tenis-branco', 'Tênis branco', 'ambos', { modelo: 'tenis', cor: BRANCO, cor2: '#DDE3EC' }),
  p('calcado', 'sandalia', 'Sandália', 'ambos', { modelo: 'sandalia', cor: MADEIRA, cor2: MARINHO }),
  p('calcado', 'tenis-azul', 'Tênis azul', 'ambos', { modelo: 'tenis', cor: JEANS, cor2: BRANCO, fase: 'AL-B', preco: 4 }),
  p('calcado', 'galocha', 'Galocha', 'ambos', { modelo: 'bota', cor: IPE, cor2: '#C98F1C', fase: 'AL-F', preco: 10 }),
  p('calcado', 'chuteira', 'Chuteira', 'm', { modelo: 'tenis', cor: '#22252B', cor2: BRANCO, fase: 'AL-I', preco: 12 }),
  p('calcado', 'sapatilha', 'Sapatilha', 'f', { modelo: 'sapatilha', cor: TERRA, cor2: TERRA, fase: 'AL-I', preco: 12 }),
  p('calcado', 'bota-de-trilha', 'Bota de trilha', 'ambos', { modelo: 'bota', cor: MADEIRA, cor2: '#5E3C20', fase: 'AL-L', preco: 14 })
];

/** Acessibilidade (D008, D029): sempre grátis, sempre opcional, nunca vem de entrada. Fica numa seção própria da Lojinha. */
export const ACESSIBILIDADE: PecaAvatar[] = [
  p('acessibilidade', 'oculos', 'Óculos', 'ambos', { cor: MARINHO }),
  p('acessibilidade', 'aparelho-auditivo', 'Aparelho auditivo', 'ambos', { cor: '#C9B8A4' }),
  p('acessibilidade', 'cadeira-de-rodas', 'Cadeira de rodas', 'ambos', { cor: MARINHO, cor2: IPE }),
  p('acessibilidade', 'pintura-no-rosto', 'Pintura no rosto', 'ambos', { cor: '#B5432A' })
];

export const PECAS_AVATAR: PecaAvatar[] = [...PELES, ...ROSTOS, ...OLHOS, ...CABELOS, ...CORES_CABELO, ...CAMISAS, ...CALCAS, ...CALCADOS, ...ACESSIBILIDADE];

const INDICE = new Map(PECAS_AVATAR.map((x) => [`${x.categoria}:${x.id}`, x]));
export function pecaAvatar(categoria: CategoriaAvatar, id: string | null | undefined): PecaAvatar | undefined {
  return id ? INDICE.get(`${categoria}:${id}`) : undefined;
}

/** Peças de uma categoria que a criança deste sexo pode ver (as do outro sexo nem aparecem). */
export function pecasPara(categoria: CategoriaAvatar, sexo: Genero): PecaAvatar[] {
  return PECAS_AVATAR.filter((x) => x.categoria === categoria && (x.sexo === 'ambos' || x.sexo === sexo));
}

/** Passos obrigatórios da montagem, na ordem (D029). */
export const PASSOS_AVATAR: { id: Exclude<CategoriaAvatar, 'corCabelo' | 'acessibilidade'>; titulo: string; pergunta: string }[] = [
  { id: 'pele', titulo: 'Pele', pergunta: 'Qual é a cor da sua pele?' },
  { id: 'rosto', titulo: 'Rosto', pergunta: 'Como é o seu rosto?' },
  { id: 'olhos', titulo: 'Olhos', pergunta: 'Qual é a cor dos seus olhos?' },
  { id: 'cabelo', titulo: 'Cabelo', pergunta: 'Como é o seu cabelo?' },
  { id: 'camisa', titulo: 'Camisa', pergunta: 'Escolha a camisa.' },
  { id: 'calca', titulo: 'Calça', pergunta: 'Calça, bermuda ou saia?' },
  { id: 'calcado', titulo: 'Calçado', pergunta: 'E nos pés?' }
];

/** Id do item na mochila (Progresso.itens) quando a peça é comprada na Lojinha. */
export const idCompraAvatar = (peca: Pick<PecaAvatar, 'categoria' | 'id'>): string => `avatar:${peca.categoria}:${peca.id}`;
