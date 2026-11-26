/**
 * JOGOS DO PARQUE como DADOS editáveis (fila do dono nº 32: "editar os jogos"; Estúdio criativo › Jogos).
 *
 * O que dá para mudar com segurança, sem mexer nas regras dos jogos:
 *  - nome e "o que treina" (a linha do cartão) dos jogos de sons e da vila;
 *  - ligado/desligado e a ordem dos cartões no Parque de Jogos (Brincar);
 *  - a LISTA DE PALAVRAS da Casa do Som (a criança ESCREVE a palavra: regra 2). Toda palavra passa pelo verificador
 *    de decodificabilidade (edicao/verificar.ts › errosDoItem 'jogos'); e, no jogo, cada criança só recebe a palavra
 *    quando já pode escrevê-la (motor/jogos-vila.ts › palavraLiberada), qualquer que seja a lista.
 *
 * Desligar um jogo tira o cartão do Parque, o "Novo!"/cadeado dele (desbloqueio) e o desafio do fim da missão; o jogo
 * que faz parte de uma LIÇÃO (desafio dentro da cena) continua, porque é parte da lição. Nada é apagado (regra 7).
 * Os jogos de escutar têm nome e textos na coleção 'jogos-escuta' (biblioteca/escuta.ts); aqui só ligado e ordem.
 */
import { FIGURAS } from './palavras.ts';
import { BANCO } from './fases/tf-banco.ts';

export type GrupoJogo = 'sons' | 'escuta';
export interface JogoParque {
  id: string;
  grupo: GrupoJogo;
  /** Nome do cartão (os de escutar usam o nome de biblioteca/escuta.ts). */
  nome?: string;
  /** "O que treina" (linha do cartão). */
  treina?: string;
  ligado: boolean;
  /** Posição no Parque (menor = primeiro). */
  ordem: number;
  /** Casa do Som: as palavras que a criança pode ESCREVER para encomendar (passam pelo verificador). */
  palavras?: string[];
  /** Para que servem as palavras (o verificador confere ler/escrever; ouvir não). */
  usoPalavras?: 'escrever' | 'ler';
}

export const JOGOS_PARQUE: JogoParque[] = [
  { id: 'corre-som', grupo: 'sons', nome: 'Corre-Som', treina: 'Ouvir o som e correr para a letra certa', ligado: true, ordem: 1 },
  { id: 'come-som', grupo: 'sons', nome: 'Bichinho Come-Som', treina: 'Dar ao Bolota a comida que começa com o som', ligado: true, ordem: 2 },
  { id: 'estrada-pares', grupo: 'sons', nome: 'Estrada e Rio dos Pares', treina: 'Ouvir e ler palavras quase iguais', ligado: true, ordem: 3 },
  { id: 'carteiro', grupo: 'sons', nome: 'Carteiro da Vila', treina: 'Ler o nome e entregar a carta', ligado: true, ordem: 4 },
  {
    id: 'casa-som', grupo: 'sons', nome: 'Casa do Som', treina: 'Escrever para montar a casinha', ligado: true, ordem: 5, usoPalavras: 'escrever',
    palavras: ['uva', 'ovo', 'mala', 'pia', 'lupa', 'mapa', 'sapato', 'pato', 'bule', 'bolo', 'suco', 'jaca', 'dado', 'gato', 'tapete', 'tomate']
  },
  { id: 'memoria-sons', grupo: 'sons', nome: 'Memória dos Sons', treina: 'Achar o par da cena e da letra do mesmo som', ligado: true, ordem: 6 },
  { id: 'caca', grupo: 'sons', nome: 'Caça ao Tesouro', treina: 'Seguir as charadas pela vila', ligado: true, ordem: 7 },
  { id: 'comprida', grupo: 'escuta', ligado: true, ordem: 1 },
  { id: 'escondida', grupo: 'escuta', ligado: true, ordem: 2 },
  { id: 'rimas', grupo: 'escuta', ligado: true, ordem: 3 },
  { id: 'intruso', grupo: 'escuta', ligado: true, ordem: 4 },
  { id: 'comeco', grupo: 'escuta', ligado: true, ordem: 5 },
  { id: 'palmas', grupo: 'escuta', ligado: true, ordem: 6 }
];
export const JOGO_PARQUE_POR_ID: Record<string, JogoParque> = Object.fromEntries(JOGOS_PARQUE.map((j) => [j.id, j]));

/** O jogo está ligado? (jogo sem registro: ligado). */
export const jogoLigado = (id: string): boolean => JOGO_PARQUE_POR_ID[id]?.ligado !== false;
/** Nome e "treina" do jogo, com o que veio do código como reserva. */
export const nomeDoJogo = (id: string, reserva: string): string => JOGO_PARQUE_POR_ID[id]?.nome?.trim() || reserva;
export const treinaDoJogo = (id: string, reserva: string): string => JOGO_PARQUE_POR_ID[id]?.treina?.trim() || reserva;
/** Posição do jogo no Parque (sem registro: no fim, na ordem do código). */
export const ordemDoJogo = (id: string, reserva = 99): number => JOGO_PARQUE_POR_ID[id]?.ordem ?? reserva;

/** Figuras com arte que o banco (`FIGURAS`/`BANCO`) ainda não conhece: usadas pelos jogos da vila. */
export const FIGURAS_EXTRAS_JOGOS = ['pia', 'bule', 'mapa'];
/** A palavra tem figura com arte (para a encomenda e as casas). */
export const temFiguraJogo = (w: string): boolean => !!FIGURAS[w] || !!BANCO[w]?.figura || FIGURAS_EXTRAS_JOGOS.includes(w);
/** As palavras da Casa do Som (a lista editável). */
export const palavrasDaCasaDoSom = (): string[] => JOGO_PARQUE_POR_ID['casa-som']?.palavras ?? [];
