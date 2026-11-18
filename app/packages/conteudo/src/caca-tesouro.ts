/**
 * CAÇA AO TESOURO DAS PALAVRAS (fila do dono nº 25; nome do projeto): falas e lugares da caça no passeio 3D.
 * As regras (o que entra, o que conta) ficam no motor: packages/motor/src/caca-tesouro.ts.
 *
 * Charadas: dicas FALADAS (a criança de 4–7 anos ainda não lê) que ensinam o CAMINHO e o LUGAR, nunca a resposta (regra 3):
 * nenhuma charada diz letra, som ou palavra-alvo; o mesmo texto vale para qualquer alvo (teste do motor). Textos curtos e
 * originais (regra 9). A apresentação de cada lugar (ensinar o cenário na 1ª vez) é só TEXTO na tela + a charada falada.
 */
import type { Fala } from './tipos.ts';

const s = (texto: string): Fala => ({ quem: 'sofia', texto });

/** Falas da caça (todas na voz da Sofia; geradas por scripts/gerar-vozes.ts). */
export const FALAS_CACA = {
  sons: s('Escute o som e ache o baú com a letra desse som.'),
  sonsFigura: s('Escute o som e ache o baú com a figura que começa assim.'),
  palavra: s('Ache as letras da palavra, um som de cada vez.'),
  lerPalavra: s('Leia a palavra e toque na figura.'),
  charadas: s('Escute a charada e encontre o baú.'),
  qualLetra: s('Qual letra faz este som?'),
  agua: s('Agora os tesouros estão na água!'),
  chave: s('Você ganhou a chave do barquinho!'),
  barco: s('Arraste o dedo ou use as setinhas para remar. Para descer, volte ao píer.'),
  outroBau: s('Esse baú não. Procure outro!'),
  leDeNovo: s('Olhe as letras de novo, som por som.')
} as const;

export type LugarCacaId = 'padaria' | 'biblioteca' | 'coreto' | 'horta' | 'campinho' | 'escola' | 'casa' | 'cais' | 'rio' | 'fundo' | 'ponte' | 'margem';

export interface LugarCaca {
  id: LugarCacaId;
  nome: string;
  icone: string;
  /** Como se chega: andando, na água rasa (nadando), mergulhando ou de barco. */
  modo: 'terra' | 'agua' | 'mergulho' | 'barco';
  /** Charada falada: ensina o caminho/lugar; nunca diz a resposta. */
  charada: Fala;
  /** Apresentação do lugar na 1ª vez (texto na tela). */
  apresenta: string;
  /** Onde fica o baú (x, z no mundo 3D; js/caca-tesouro.js confere se o ponto é alcançável). */
  ponto: [number, number];
}

export const LUGARES_CACA: LugarCaca[] = [
  { id: 'padaria', nome: 'Padaria', icone: '🥖', modo: 'terra', charada: s('Procure perto de onde se compra pão.'), apresenta: 'Esta é a Padaria. Lá dentro fica a Lojinha.', ponto: [14.5, -3.5] },
  { id: 'biblioteca', nome: 'Biblioteca', icone: '📚', modo: 'terra', charada: s('Procure onde os livros moram.'), apresenta: 'Esta é a Biblioteca: o Cantinho da Leitura.', ponto: [-13.5, -1.5] },
  { id: 'coreto', nome: 'Coreto', icone: '🎪', modo: 'terra', charada: s('Procure perto de onde a banda toca.'), apresenta: 'Este é o Coreto, no meio da praça.', ponto: [4.5, 6.5] },
  { id: 'horta', nome: 'Horta', icone: '🥕', modo: 'terra', charada: s('Procure onde as verduras crescem.'), apresenta: 'Esta é a Horta da vila.', ponto: [14, 15] },
  { id: 'campinho', nome: 'Campinho', icone: '⚽', modo: 'terra', charada: s('Procure onde a bola rola.'), apresenta: 'Este é o Campinho: lá tem jogos de sons.', ponto: [-28.5, 26.5] },
  { id: 'escola', nome: 'Escola', icone: '🏫', modo: 'terra', charada: s('Procure perto de onde as crianças aprendem.'), apresenta: 'Esta é a Escola: lá ficam as missões.', ponto: [4.5, -15] },
  { id: 'casa', nome: 'Casa da Sofia', icone: '🏡', modo: 'terra', charada: s('Procure perto da casa da Sofia.'), apresenta: 'Esta é a casa da Sofia.', ponto: [-4, 25] },
  { id: 'cais', nome: 'Píer', icone: '⛵', modo: 'terra', charada: s('Procure perto de onde o barquinho dorme.'), apresenta: 'Este é o píer, onde o barquinho fica.', ponto: [36.5, 9] },
  { id: 'rio', nome: 'Beira do rio', icone: '🌊', modo: 'agua', charada: s('Procure na água rasinha do rio.'), apresenta: 'Na beira do rio dá para nadar.', ponto: [38.5, -2] },
  { id: 'fundo', nome: 'Fundo do rio', icone: '🤿', modo: 'mergulho', charada: s('Procure no fundo do rio. Mergulhe!'), apresenta: 'Na água funda, o botão Pular vira Mergulhar.', ponto: [41.8, 21] },
  { id: 'ponte', nome: 'Debaixo da ponte', icone: '🌉', modo: 'barco', charada: s('Vá de barco até debaixo da ponte.'), apresenta: 'A ponte cruza o rio. De barco, dá para passar embaixo.', ponto: [45.5, -46] },
  { id: 'margem', nome: 'Outro lado do rio', icone: '🌿', modo: 'barco', charada: s('Vá de barco até o outro lado do rio.'), apresenta: 'O outro lado do rio só se alcança de barco.', ponto: [51.5, 0] }
];
export const LUGAR_CACA_POR_ID = Object.fromEntries(LUGARES_CACA.map((l) => [l.id, l])) as Record<LugarCacaId, LugarCaca>;

/**
 * Pontos da praça e arredores para os baús dos níveis 1 e 2 (perto da chegada; a posição de cada baú é sorteada entre eles).
 * js/caca-tesouro.js empurra um ponto para o lugar livre mais perto se ele cair numa parede.
 */
export const PONTOS_PRACA: [number, number][] = [
  [-6, 14], [6, 14], [-10, 6], [10, 6], [-7, -3], [7, -3], [0, 27], [-7, 30], [7, 30], [12, 1], [-12, 1], [0, -9], [-4, 18.5], [4, 18.5], [-13, 12], [13, 12]
];
