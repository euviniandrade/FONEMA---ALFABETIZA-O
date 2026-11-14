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
 * Palavras-chave, gestos e dicas de boca alinhados à tabela A–Z da pesquisa (docs/pesquisa/44a-tabela-alfabeto.md):
 * som inicial igual em todo o Brasil, sílaba simples, figura com um só nome, dentro dos valores do projeto.
 * W e Y são letras de NOMES: a figura é um crachá ("Wesley", "Yasmin"), feito por web/scripts/cracha-nome.py.
 * Diferenças conscientes em relação à tabela (ver app/README.md): J usa "janela" (não há arte de jacaré ainda);
 * E e O entram só com o som principal (ê, ô), e o outro som (é, ó) vem na etapa das sílabas (D027 §1).
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
  L('A', 'vogal', '/a/', 'a', 'abelha', 'Boca bem aberta, língua deitada.', 'Abrir os braços bem grande, junto com a boca.', { outraPalavra: 'avião', outroSom: 'A nasal (ã, AM, AN)' }),
  L('B', 'consoante', '/b/', 'b', 'bola', 'Lábios fecham e abrem; a garganta vibra.', 'Quicar uma bola de mentira: b, b, b.', { outraPalavra: 'banana', outroSom: 'BR e BL' }),
  L('C', 'consoante', '/k/', 'k', 'casa', 'O fundo da língua sobe e solta o ar de uma vez, sem voz.', 'Bater à porta da casa: toc-toc.', { outraPalavra: 'caneca', outroSom: 'C com som de /s/ antes de E e I (cebola, cinema), Ç e o dígrafo CH', nota: 'outro-som' }),
  L('D', 'consoante', '/d/', 'd', 'dado', 'A ponta da língua bate atrás dos dentes de cima; a garganta vibra.', 'Chacoalhar e jogar um dado de mentira.', { outroSom: 'DI, que soa "dji" em muitas regiões, e DR' }),
  L('E', 'vogal', '/e/', 'e', 'elefante', 'Sorriso meio aberto.', 'Braço esticado como a tromba do elefante.', { outroSom: 'E aberto /ɛ/ (pé, ela), E nasal e E final com som de I', nota: 'outro-som' }),
  L('F', 'consoante', '/f/', 'f', 'foca', 'Dentes de cima no lábio de baixo; sai um ventinho, sem voz.', 'Soprar a palma da mão e sentir o ventinho.', { outraPalavra: 'folha', outroSom: 'FR e FL' }),
  L('G', 'consoante', '/g/', 'g', 'gato', 'O fundo da língua sobe e solta; a garganta vibra.', 'Dedo no gogó: g, g, g.', { outraPalavra: 'garrafa', outroSom: 'G com som de /ʒ/ antes de E e I (gelo, girafa), GU, GR e GL', nota: 'outro-som' }),
  L('H', 'muda', null, null, 'hipopótamo', 'O H não tem boca própria: a boca já faz o som da letra seguinte.', 'Mão aberta cobrindo a boca: letra calada.', { outraPalavra: 'helicóptero', outroSom: 'Dígrafos CH, LH e NH', nota: 'muda' }),
  L('I', 'vogal', '/i/', 'i', 'ilha', 'Sorriso grande, dentes quase juntos.', 'Desenhar o pingo do i no ar, sorrindo.', { outroSom: 'I nasal (IM, IN) e I em ditongo (pai, lei)' }),
  L('J', 'consoante', '/ʒ/', 'j', 'janela', 'Biquinho para a frente; o ar passa e a garganta vibra.', 'Abrir e fechar os braços, como a boca do jacaré.', { outroSom: 'GE e GI escrevem o mesmo som' }),
  L('K', 'nomes', '/k/', 'k', 'kiwi', 'Igual ao C de casa: o fundo da língua sobe e solta.', 'O mesmo do C: bater à porta.', { nota: 'nomes' }),
  L('L', 'consoante', '/l/', 'l', 'lua', 'A ponta da língua sobe atrás dos dentes de cima e fica; o ar sai pelos lados.', 'Reger com o dedo: lá, lá, lá.', { outraPalavra: 'leão', outroSom: 'L no fim da sílaba (sol soa "sou"), LH e os encontros BL, CL, FL, PL' }),
  L('M', 'consoante', '/m/', 'm', 'macaco', 'Lábios fechados; o som sai pelo nariz.', 'Mão na barriga: mmm, que gostoso!', { outraPalavra: 'mala', outroSom: 'AM, EM, IM, OM, UM' }),
  L('N', 'consoante', '/n/', 'n', 'navio', 'Ponta da língua atrás dos dentes de cima; o som sai pelo nariz.', 'Dedo encostado no nariz, sentindo vibrar.', { outroSom: 'AN, EN, IN, ON, UN e o dígrafo NH' }),
  L('O', 'vogal', '/o/', 'o', 'ovo', 'Boca redonda e fechadinha.', 'Mãos formando um ovo.', { outraPalavra: 'ovelha', outroSom: 'O aberto /ɔ/ (óculos, vovó), O nasal e O final com som de U', nota: 'outro-som' }),
  L('P', 'consoante', '/p/', 'p', 'pato', 'Lábios fecham e estouram, sem voz; sai um soprinho.', 'Estourar uma bolha com o dedo: p!', { outraPalavra: 'peixe', outroSom: 'PR e PL' }),
  L('Q', 'consoante', '/k/', 'k', 'queijo', 'Igual ao C de casa. O Q vem sempre com o U.', 'Dois dedos enganchados: o Q e o U de mãos dadas.', { outroSom: 'QUA e QUO, em que o U é falado (quatro)', nota: 'com-u' }),
  L('R', 'consoante', '/ʁ/', 'rr', 'rato', 'O som vem lá do fundo da garganta (ou com a língua tremendo). Todo sotaque vale!', 'Girar as mãos como uma roda: rrr.', { outraPalavra: 'rua', outroSom: 'R fraco entre vogais (arara), RR, R no fim da sílaba (porta) e os encontros PR, BR, TR', nota: 'outro-som' }),
  L('S', 'consoante', '/s/', 's', 'sapo', 'Dentes quase fechados, língua escondida, sem voz.', 'Mão em zigue-zague, como o ar saindo do balão: sss.', { outraPalavra: 'sol', outroSom: 'S com som de /z/ entre vogais (casa), SS e S no fim da sílaba', nota: 'outro-som' }),
  L('T', 'consoante', '/t/', 't', 'tatu', 'A ponta da língua bate atrás dos dentes de cima, sem voz.', 'Bater a ponta do dedo na palma: t, t, t.', { outroSom: 'TI, que soa "tchi" em muitas regiões, e TR' }),
  L('U', 'vogal', '/u/', 'u', 'uva', 'Biquinho bem para a frente.', 'Mãos em concha em volta do biquinho: uuu.', { outraPalavra: 'urso', outroSom: 'U nasal (UM, UN), U em ditongo e U calado em QUE e GUE' }),
  L('V', 'consoante', '/v/', 'v', 'vaca', 'Dentes de cima no lábio de baixo; a garganta vibra.', 'Braços como asas de avião que treme: vvv.', { outraPalavra: 'vela' }),
  L('W', 'nomes', '/w/ (som de U) ou /v/', 'u', 'Wesley', 'Em Wesley e em kiwi soa como U; em Wagner soa como V.', 'Desenhar duas ondas no ar com as mãos.', { nota: 'nomes' }),
  L('X', 'consoante', '/ʃ/', 'x', 'xícara', 'Biquinho de quem pede silêncio; o ar passa, sem voz.', 'Dedo na frente dos lábios: xxx.', { outraPalavra: 'xilofone', outroSom: 'X com outros sons (táxi, exame, próximo) e o dígrafo CH', nota: 'outro-som' }),
  L('Y', 'nomes', '/i/', 'i', 'Yasmin', 'Igual ao I de ilha: sorriso grande.', 'Braços para cima, em forma de Y.', { outraPalavra: 'yakisoba', nota: 'nomes' }),
  L('Z', 'consoante', '/z/', 'z', 'zebra', 'Igual ao S, mas a garganta vibra.', 'Dedo voando como abelha: zzz.', { outroSom: 'S entre vogais e Z no fim (luz, nariz)' })
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
