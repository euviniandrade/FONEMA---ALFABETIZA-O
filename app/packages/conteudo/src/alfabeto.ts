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
 * E e O apresentam as DUAS vozes já na missão da letra (ê de elefante e é de pé; ô de ovo e ó de vovó), com o
 * som principal no Espelho do Som; a distinção fina (é × ê, ó × ô) é treinada depois, na Ilha das Vogais.
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
  nota?: 'outro-som' | 'dois-sons' | 'muda' | 'nomes' | 'com-u';
  /** E e O: a segunda "voz" da vogal, apresentada já na missão da letra (ê de elefante e é de pé; ô de ovo e ó de vovó). */
  segundoSom?: { ipa: string; fonema: ChaveFonema; palavra: string };
  /** Quem apresenta a letra (a dupla alterna). */
  voz: 'sofia' | 'tales';
  /** Som puro da letra: fica para a gravação da fonoaudióloga (hoje a fala usa "B, de bola."). */
  somPuro: { gravado: boolean; arquivo?: string };
  /**
   * Faz de conta que leva o corpo a fazer o som (D029 §2, pesquisa 45): a dupla diz a brincadeira e, em seguida,
   * toca o SOM REAL da letra (web/public/audio/sons ou o Estúdio de sons). Letras de mesmo som usam a mesma
   * brincadeira (C = K = Q; I = Y; U = W). Texto nosso, a partir do Abecedário do MEC (público).
   */
  brincadeira: string;
  /** Três palavras-exemplo com figura (a primeira é `palavra`). As que ainda não têm arte aparecem só escritas. */
  palavras: [string, string, string];
  /** Segundo som da letra, apresentado logo depois do principal (G de gelo, S de casa, W de Wagner, é, ó, R fraco). */
  segundoFonema?: ChaveFonema;
}

type Base = Omit<LetraAlfabeto, 'minuscula' | 'voz' | 'somPuro' | 'brincadeira' | 'palavras' | 'segundoFonema'>;
const L = (letra: string, tipo: LetraAlfabeto['tipo'], ipa: string | null, fonema: string | null, palavra: string, dicaBoca: string, gesto: string, extra: Partial<Base> = {}): Base => ({ letra, tipo, ipa, fonema, palavra, dicaBoca, gesto, ...extra });

const BASE: Base[] = [
  L('A', 'vogal', '/a/', 'a', 'abelha', 'Boca bem aberta, língua deitada.', 'Abrir os braços bem grande, junto com a boca.', { outraPalavra: 'avião', outroSom: 'A nasal (ã, AM, AN)' }),
  L('B', 'consoante', '/b/', 'b', 'bola', 'Lábios fecham e abrem; a garganta vibra.', 'Quicar uma bola de mentira: b, b, b.', { outraPalavra: 'banana', outroSom: 'BR e BL' }),
  L('C', 'consoante', '/k/', 'k', 'casa', 'O fundo da língua sobe e solta o ar de uma vez, sem voz.', 'Bater à porta da casa: toc-toc.', { outraPalavra: 'caneca', outroSom: 'C com som de /s/ antes de E e I (cebola, cinema), Ç e o dígrafo CH', nota: 'outro-som' }),
  L('D', 'consoante', '/d/', 'd', 'dado', 'A ponta da língua bate atrás dos dentes de cima; a garganta vibra.', 'Chacoalhar e jogar um dado de mentira.', { outroSom: 'DI, que soa "dji" em muitas regiões, e DR' }),
  L('E', 'vogal', '/e/', 'e', 'elefante', 'Sorriso meio aberto.', 'Braço esticado como a tromba do elefante.', { segundoSom: { ipa: '/ɛ/', fonema: 'E', palavra: 'pé' }, outroSom: 'E nasal (EM, EN) e E final com som de I', nota: 'dois-sons' }),
  L('F', 'consoante', '/f/', 'f', 'foca', 'Dentes de cima no lábio de baixo; sai um ventinho, sem voz.', 'Soprar a palma da mão e sentir o ventinho.', { outraPalavra: 'folha', outroSom: 'FR e FL' }),
  L('G', 'consoante', '/g/', 'g', 'gato', 'O fundo da língua sobe e solta; a garganta vibra.', 'Dedo no gogó: g, g, g.', { outraPalavra: 'garrafa', outroSom: 'G com som de /ʒ/ antes de E e I (gelo, girafa), GU, GR e GL', nota: 'outro-som' }),
  L('H', 'muda', null, null, 'hipopótamo', 'O H não tem boca própria: a boca já faz o som da letra seguinte.', 'Mão aberta cobrindo a boca: letra calada.', { outraPalavra: 'helicóptero', outroSom: 'Dígrafos CH, LH e NH', nota: 'muda' }),
  L('I', 'vogal', '/i/', 'i', 'ilha', 'Sorriso grande, dentes quase juntos.', 'Desenhar o pingo do i no ar, sorrindo.', { outroSom: 'I nasal (IM, IN) e I em ditongo (pai, lei)' }),
  L('J', 'consoante', '/ʒ/', 'j', 'janela', 'Biquinho para a frente; o ar passa e a garganta vibra.', 'Abrir e fechar os braços, como a boca do jacaré.', { outroSom: 'GE e GI escrevem o mesmo som' }),
  L('K', 'nomes', '/k/', 'k', 'kiwi', 'Igual ao C de casa: o fundo da língua sobe e solta.', 'O mesmo do C: bater à porta.', { nota: 'nomes' }),
  L('L', 'consoante', '/l/', 'l', 'lua', 'A ponta da língua sobe atrás dos dentes de cima e fica; o ar sai pelos lados.', 'Reger com o dedo: lá, lá, lá.', { outraPalavra: 'leão', outroSom: 'L no fim da sílaba (sol soa "sou"), LH e os encontros BL, CL, FL, PL' }),
  L('M', 'consoante', '/m/', 'm', 'macaco', 'Lábios fechados; o som sai pelo nariz.', 'Mão na barriga: mmm, que gostoso!', { outraPalavra: 'mala', outroSom: 'AM, EM, IM, OM, UM' }),
  L('N', 'consoante', '/n/', 'n', 'navio', 'Ponta da língua atrás dos dentes de cima; o som sai pelo nariz.', 'Dedo encostado no nariz, sentindo vibrar.', { outroSom: 'AN, EN, IN, ON, UN e o dígrafo NH' }),
  L('O', 'vogal', '/o/', 'o', 'ovo', 'Boca redonda e fechadinha.', 'Mãos formando um ovo.', { outraPalavra: 'ovelha', segundoSom: { ipa: '/ɔ/', fonema: 'O', palavra: 'vovó' }, outroSom: 'O nasal (OM, ON) e O final com som de U', nota: 'dois-sons' }),
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

const MORDE = 'Faz de conta que você morde uma maçã bem crocante.';
const ESQUECEU = 'Faz de conta que você esqueceu o lanche em casa.';
const MACAQUINHO = 'Faz de conta que você é um macaquinho.';
/** Faz de conta de cada letra (pesquisa 45). C = K = Q, I = Y e U = W dividem a mesma brincadeira (e o mesmo clipe). */
export const BRINCADEIRAS: Record<string, string> = {
  A: 'Faz de conta que você está no médico: abre bem a boca!',
  B: 'Faz de conta que você quica uma bola no chão.',
  C: MORDE,
  D: 'Faz de conta que você toca um tambor com os dedos.',
  E: 'Faz de conta que você ganhou um troféu!',
  F: 'Faz de conta que você sopra as velinhas do bolo.',
  G: 'Faz de conta que você toma um gole de água.',
  H: 'Faz de conta que você fecha um zíper na boca.',
  I: ESQUECEU,
  J: 'Faz de conta que você pilota um barco a motor.',
  K: MORDE,
  L: 'Faz de conta que você lambe um sorvete.',
  M: 'Faz de conta que a comida está uma delícia.',
  N: 'Faz de conta que você diz não com a boca fechada.',
  O: 'Faz de conta que você chama um amigo lá longe.',
  P: 'Faz de conta que você estoura bolhas de sabão.',
  Q: MORDE,
  R: 'Faz de conta que você liga o motor de um carrinho.',
  S: 'Faz de conta que você é uma cobrinha.',
  T: 'Faz de conta que você bate na porta com um dedo.',
  U: MACAQUINHO,
  V: 'Faz de conta que você pilota um avião.',
  W: MACAQUINHO,
  X: 'Faz de conta que você pede silêncio.',
  Y: ESQUECEU,
  Z: 'Faz de conta que você é uma abelhinha.'
};
/** Três palavras-exemplo por letra (a primeira é a palavra-chave). Com arte quando existe em palavras.ts › FIGURAS. */
export const TRES_PALAVRAS: Record<string, [string, string, string]> = {
  A: ['abelha', 'avião', 'abacaxi'], B: ['bola', 'banana', 'boneca'], C: ['casa', 'caneca', 'cola'], D: ['dado', 'dedo', 'doce'],
  E: ['elefante', 'ema', 'elástico'], F: ['foca', 'folha', 'faca'], G: ['gato', 'garrafa', 'galo'], H: ['hipopótamo', 'helicóptero', 'horta'],
  I: ['ilha', 'iglu', 'ioiô'], J: ['janela', 'jacaré', 'jaca'], K: ['kiwi', 'kart', 'ketchup'], L: ['lua', 'leão', 'lobo'],
  M: ['macaco', 'mala', 'moto'], N: ['navio', 'ninho', 'nuvem'], O: ['ovo', 'ovelha', 'olho'], P: ['pato', 'peixe', 'pipoca'],
  Q: ['queijo', 'quiabo', 'quadro'], R: ['rato', 'rua', 'roda'], S: ['sapo', 'sol', 'suco'], T: ['tatu', 'tomate', 'tapete'],
  U: ['uva', 'urso', 'unha'], V: ['vaca', 'vela', 'vovó'], W: ['Wesley', 'Wagner', 'wafer'], X: ['xícara', 'xilofone', 'xadrez'],
  Y: ['Yasmin', 'yakisoba', 'Yuri'], Z: ['zebra', 'zíper', 'zero']
};
/** Segundo som de cada letra que tem dois (pesquisa 45): tocado logo depois do aviso "esta letra tem outro som". */
export const SEGUNDO_FONEMA: Record<string, ChaveFonema> = { E: 'E', O: 'O', G: 'j', S: 'z', W: 'v', R: 'r', C: 's' };

export const ALFABETO: LetraAlfabeto[] = BASE.map((b, i) => ({
  ...b,
  minuscula: b.letra.toLowerCase(),
  voz: i % 2 === 0 ? 'sofia' : 'tales',
  somPuro: { gravado: false },
  brincadeira: BRINCADEIRAS[b.letra],
  palavras: TRES_PALAVRAS[b.letra],
  ...(SEGUNDO_FONEMA[b.letra] ? { segundoFonema: SEGUNDO_FONEMA[b.letra] } : {})
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

/**
 * PRIMEIRAS PALAVRINHAS (pesquisa 44 §4.3): palavras que a criança já consegue ler com as letras vistas ATÉ aquela
 * letra, para juntar as letras e ler desde cedo (liga/desliga em config.ts › alfabeto.primeirasPalavrinhas).
 * Regras da 1ª volta (conferidas no teste): só letras já vistas; nada de CE, CI, GE, GI, QUE, QUI, GUE, GUI;
 * S e R só no COMEÇO da palavra (no meio o som é outro).
 */
export const PALAVRINHAS: Record<string, string[]> = {
  B: ['BABÁ'], E: ['BEBÊ'], F: ['CAFÉ', 'FACA'], I: ['BIFE'], J: ['JACA'], L: ['BALA', 'FILA'], M: ['MALA', 'CAMA'], N: ['BANANA', 'MENINA'],
  O: ['BOLA', 'DADO'], P: ['COPO', 'MAPA'], R: ['RODA', 'REI'], S: ['SAPO', 'SOPA'], T: ['GATO', 'PATO'], U: ['LUA', 'TATU'], V: ['UVA', 'VACA'], X: ['PEIXE'], Z: ['DOZE']
};
/** Palavrinhas das revisões (uma por grupo de letras) e da Festa do Alfabeto. */
export const PALAVRINHAS_REVISAO: string[][] = [['BABÁ', 'BEBÊ', 'CABE'], ['CAFÉ', 'BIFE', 'JACA'], ['BALA', 'BOLA', 'DEDO'], ['PATO', 'RODA', 'SAPO'], ['LUA', 'UVA', 'VACA']];

/** A palavra respeita as regras da 1ª volta com as letras vistas até `ate` (inclusive)? */
export function palavrinhaPermitida(palavra: string, ate: string): boolean {
  const w = palavra.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
  const vistas = ALFABETO.slice(0, ALFABETO.findIndex((l) => l.letra === ate) + 1).map((l) => l.letra);
  if (![...w].every((ch) => vistas.includes(ch))) return false;
  if (/C[EI]|G[EI]|[QG]U[EI]|H|K|W|Y/.test(w)) return false;
  return !/[SR]/.test(w.slice(1));
}
