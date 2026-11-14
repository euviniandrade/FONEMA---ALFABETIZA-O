/**
 * TRILHA DO ALFABETO (D027): as 26 letras como DADOS, na ordem A–Z.
 *
 * Para trocar a palavra-exemplo de uma letra, mude `palavra` (ela precisa existir em `palavras.ts` › FIGURAS e
 * ter arte em web/public/assets/figuras/<palavra sem acento>.webp) e rode de novo o gerador de vozes: a fala
 * "B, de bola." é montada a partir daqui (`falaChave`).
 *
 * Regras fônicas (pt-BR):
 * - cada letra entra com o SOM PRINCIPAL; os outros sons (C de cebola, G de gelo, R fraco, S entre vogais,
 *   X de táxi/exame, É e Ó abertos) e os dígrafos ficam para a etapa das sílabas (`outroSom`);
 * - H não faz som sozinho; K, W e Y são letras de nomes; Q vem sempre com U;
 * - a dupla NUNCA diz o nome da letra como se fosse o som: a fala é "B, de bola." (letra + palavra-exemplo).
 *   O som puro de consoante sai errado na voz sintética, então fica MARCADO para gravação por fonoaudióloga
 *   (`somPuro.gravado`), com aviso só na área do adulto.
 *
 * ⚠️ Posições de boca e escolhas de palavra: validar com fonoaudióloga (D020).
 */
import type { ChaveFonema } from './tipos.ts';

export interface LetraAlfabeto {
  /** Maiúscula (id da letra). */
  letra: string;
  minuscula: string;
  /** Vogal, consoante, letra muda (H) ou letra de nomes (K, W, Y). */
  tipo: 'vogal' | 'consoante' | 'muda' | 'nomes';
  /** Som principal em notação fonética (para o adulto e para a fonoaudióloga). `null` = não faz som sozinha. */
  ipa: string | null;
  /** Chave do som no Espelho do Som (espelho-do-som-3d/fonemas.js). `null` = sem Espelho (H). */
  fonema: ChaveFonema | null;
  /** Palavra-exemplo inequívoca, que começa com a letra e com o som principal. */
  palavra: string;
  /** Outra palavra com o mesmo começo e com arte pronta (item de transferência no "ouça e encontre"). */
  outraPalavra?: string;
  /** Dica de boca, curta, para a criança (texto na tela; a voz usa o Espelho do Som). */
  dicaBoca: string;
  /** Gesto para o corpo ajudar a lembrar (opcional; orientação para o adulto). */
  gesto: string;
  /** O que vem DEPOIS, na etapa das sílabas (não é ensinado na Trilha do Alfabeto). */
  outroSom?: string;
  /** Observação curta mostrada na tela da letra (H, K, Q, W, Y e letras com mais de um som). */
  nota?: 'outro-som' | 'muda' | 'nomes' | 'com-u';
  /** Quem apresenta a letra (a dupla alterna). */
  voz: 'sofia' | 'tales';
  /** Som puro da letra: fica para a gravação da fonoaudióloga (hoje a fala usa "B, de bola."). */
  somPuro: { gravado: boolean; arquivo?: string };
}

type Base = Omit<LetraAlfabeto, 'minuscula' | 'voz' | 'somPuro'>;
const L = (letra: string, tipo: LetraAlfabeto['tipo'], ipa: string | null, fonema: string | null, palavra: string, dicaBoca: string, gesto: string, extra: Partial<Base> = {}): Base => ({ letra, tipo, ipa, fonema, palavra, dicaBoca, gesto, ...extra });

const BASE: Base[] = [
  L('A', 'vogal', '/a/', 'a', 'abelha', 'Boca bem aberta, como um bocejo.', 'Abrir os braços bem grande, como a boca.', { outraPalavra: 'avião' }),
  L('B', 'consoante', '/b/', 'b', 'bola', 'Lábios fechadinhos, depois abrem; a garganta vibra.', 'Quicar uma bola de mentira.', { outraPalavra: 'banana' }),
  L('C', 'consoante', '/k/', 'k', 'casa', 'O fundo da língua sobe e solta o ar de uma vez.', 'Fazer um telhado com as mãos.', { outraPalavra: 'caneca', outroSom: 'C com som de /s/ antes de E e I (cebola, cinema) e o dígrafo CH', nota: 'outro-som' }),
  L('D', 'consoante', '/d/', 'd', 'dado', 'A ponta da língua bate atrás dos dentes de cima, e a garganta vibra.', 'Jogar um dado de mentira.'),
  L('E', 'vogal', '/e/', 'e', 'elefante', 'Sorriso meio aberto.', 'Fazer a tromba do elefante com o braço.', { outroSom: 'E aberto /ɛ/ (égua, pé) e E nasal', nota: 'outro-som' }),
  L('F', 'consoante', '/f/', 'f', 'foca', 'Dentes de cima no lábio de baixo, e um ventinho.', 'Soprar a mão, sentindo o ventinho.', { outraPalavra: 'fogo' }),
  L('G', 'consoante', '/g/', 'g', 'gato', 'O fundo da língua sobe e solta, e a garganta vibra.', 'Fazer as garrinhas do gato.', { outraPalavra: 'garrafa', outroSom: 'G com som de /ʒ/ antes de E e I (gelo, girafa) e o GU', nota: 'outro-som' }),
  L('H', 'muda', null, null, 'hipopótamo', 'O H não faz som sozinho: a boca já faz o som da letra seguinte.', 'Dedo na frente da boca: silêncio.', { outroSom: 'Dígrafos CH, LH e NH', nota: 'muda' }),
  L('I', 'vogal', '/i/', 'i', 'ilha', 'Sorriso grande.', 'Apontar o sorriso com os dois dedos.', { outraPalavra: 'iglu' }),
  L('J', 'consoante', '/ʒ/', 'j', 'janela', 'Biquinho, o ar passa e a garganta vibra.', 'Abrir uma janela de mentira.'),
  L('K', 'nomes', '/k/', 'k', 'kiwi', 'O fundo da língua sobe e solta o ar de uma vez (igual ao C de casa).', 'Fazer um telhado com as mãos, como no C.', { nota: 'nomes' }),
  L('L', 'consoante', '/l/', 'l', 'lua', 'Ponta da língua para cima, atrás dos dentes de cima.', 'Desenhar a lua no ar.', { outraPalavra: 'leão', outroSom: 'L no fim da sílaba (sol) e o dígrafo LH' }),
  L('M', 'consoante', '/m/', 'm', 'macaco', 'Lábios fechados; o som sai pelo nariz.', 'Passar a mão na barriga: mmm!', { outraPalavra: 'mala' }),
  L('N', 'consoante', '/n/', 'n', 'navio', 'Língua atrás dos dentes de cima; o som sai pelo nariz.', 'Fazer as ondas do mar com a mão.', { outroSom: 'N no fim da sílaba (canto) e o dígrafo NH' }),
  L('O', 'vogal', '/o/', 'o', 'ovo', 'Boca redondinha.', 'Fazer uma bolinha com as mãos.', { outraPalavra: 'ovelha', outroSom: 'O aberto /ɔ/ (óculos, vovó) e O nasal', nota: 'outro-som' }),
  L('P', 'consoante', '/p/', 'p', 'pato', 'Lábios fechados, depois abrem com um soprinho.', 'Abrir e fechar a mão, como o bico do pato.', { outraPalavra: 'peixe' }),
  L('Q', 'consoante', '/k/', 'k', 'queijo', 'O fundo da língua sobe e solta (igual ao C de casa). O Q vem sempre com o U.', 'Dar as mãos: o Q e o U andam juntos.', { outroSom: 'QUA (quatro), em que o U é falado', nota: 'com-u' }),
  L('R', 'consoante', '/ʁ/', 'rr', 'rato', 'O som vem lá do fundo da garganta. Todo sotaque vale!', 'Mão na garganta para sentir o motorzinho.', { outraPalavra: 'rua', outroSom: 'R fraco entre vogais (arara), RR e R no fim da sílaba', nota: 'outro-som' }),
  L('S', 'consoante', '/s/', 's', 'sapo', 'Dentinhos quase fechados, língua escondida, como uma cobrinha.', 'Fazer a cobrinha com o braço.', { outraPalavra: 'sol', outroSom: 'S com som de /z/ entre vogais (casa) e SS', nota: 'outro-som' }),
  L('T', 'consoante', '/t/', 't', 'tatu', 'A ponta da língua toca atrás dos dentes de cima e solta.', 'Bater um dedo no outro: t, t.'),
  L('U', 'vogal', '/u/', 'u', 'uva', 'Biquinho de assobio.', 'Fazer biquinho e apontar para ele.', { outraPalavra: 'urso' }),
  L('V', 'consoante', '/v/', 'v', 'vaca', 'Dentes de cima no lábio de baixo, e a garganta vibra.', 'Mão na garganta para sentir tremer.', { outraPalavra: 'vela' }),
  L('W', 'nomes', '/v/ ou /u/', 'u', 'waffle', 'Em waffle e Wilson soa como U; em Wagner soa como V.', 'Fazer o W com os dedos das duas mãos.', { nota: 'nomes' }),
  L('X', 'consoante', '/ʃ/', 'x', 'xícara', 'Biquinho de quem pede silêncio.', 'Dedo na frente da boca: xiii!', { outroSom: 'X com outros sons (táxi, exame, próximo) e o dígrafo CH', nota: 'outro-som' }),
  L('Y', 'nomes', '/i/', 'i', 'yakisoba', 'Sorriso grande (igual ao I de ilha).', 'Apontar o sorriso, como no I.', { nota: 'nomes' }),
  L('Z', 'consoante', '/z/', 'z', 'zebra', 'Dentinhos juntos, como uma abelhinha, e a garganta vibra.', 'Voar como a abelhinha: zzz.')
];

export const ALFABETO: LetraAlfabeto[] = BASE.map((b, i) => ({
  ...b,
  minuscula: b.letra.toLowerCase(),
  voz: i % 2 === 0 ? 'sofia' : 'tales',
  somPuro: { gravado: false }
}));

export const LETRA_POR_ID: Record<string, LetraAlfabeto> = Object.fromEntries(ALFABETO.map((l) => [l.letra, l]));

/** Clipes curtos por letra (uma vez cada, na voz de quem apresenta a letra). */
export const falaNomeLetra = (l: LetraAlfabeto) => `Letra ${l.letra}.`;
export const falaChave = (l: LetraAlfabeto) => `${l.letra}, de ${l.palavra}.`;
export const habilidadeLetra = (letra: string) => `letra-${letra.toLowerCase()}`;
export const faseDaLetra = (letra: string) => `AL-${letra.toUpperCase()}`;
export const seloDaLetra = (letra: string) => `S-LETRA-${letra.toUpperCase()}`;

/** Letras que se parecem no desenho: não aparecem juntas como distratoras no primeiro contato. */
export const LETRAS_PARECIDAS: string[][] = [
  ['B', 'D', 'P', 'Q'], ['M', 'N', 'W'], ['U', 'V', 'W', 'Y'], ['E', 'F'], ['O', 'Q', 'C', 'G'], ['I', 'L', 'J', 'T'], ['K', 'X'], ['S', 'Z'], ['A', 'H'], ['R', 'P', 'B']
];
/** Sons parecidos (ou iguais): as figuras dessas letras não aparecem juntas no "qual figura começa com o som?". */
export const SONS_PARECIDOS: string[][] = [
  ['C', 'K', 'Q', 'G'], ['B', 'P'], ['D', 'T'], ['F', 'V', 'W'], ['S', 'Z', 'X', 'J'], ['M', 'N'], ['I', 'Y', 'E'], ['O', 'U', 'W'], ['R', 'H'], ['A', 'H']
];

/** Grupos de revisão: a cada 5 letras (o último fecha o alfabeto, com U–Z). */
export const GRUPOS_ALFABETO: string[][] = ['ABCDE', 'FGHIJ', 'KLMNO', 'PQRST', 'UVWXYZ'].map((g) => [...g]);

/** Sons puros que ainda faltam gravar com fonoaudióloga (aviso na área do adulto). */
export function sonsPurosPendentes(): LetraAlfabeto[] {
  return ALFABETO.filter((l) => l.fonema && l.tipo !== 'vogal' && !l.somPuro.gravado);
}
