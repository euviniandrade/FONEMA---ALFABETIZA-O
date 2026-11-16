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
/**
 * Palavras-exemplo que aparecem ESCRITAS mas não são ditas: o clipe saiu duvidoso duas vezes na auditoria
 * (docs/auditoria-audio.md). Voltam a ser ditas quando houver gravação conferida de ouvido.
 */
export const PALAVRAS_SEM_VOZ: string[] = ['olho', 'unha']; // 'kart' e 'doce' foram regravadas e passaram na auditoria (15/11)
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

/**
 * Grupos de revisão ANTIGOS: a cada 5 letras, em ordem alfabética (o último fecha o alfabeto, com U–Z). Desde a D031 a jornada
 * não usa mais estes grupos (as revisões AL-R1…AL-R4 continuam no banco, fora da jornada): valem os BLOCOS_ALFABETO abaixo.
 */
export const GRUPOS_ALFABETO: string[][] = ['ABCDE', 'FGHIJ', 'KLMNO', 'PQRST', 'UVWXYZ'].map((g) => [...g]);

/**
 * D031 (alternar "conhecer as letras" e "ler"): a lição da Trilha dos Sons que ensina o som de cada letra
 * (docs/pedagogia/01-escopo-e-sequencia.md). A fase da Trilha A–Z da letra entra LOGO ANTES desta lição na jornada.
 */
export const LICAO_DA_LETRA: Record<string, string> = {
  A: 'TF-01', E: 'TF-02', I: 'TF-03', O: 'TF-04', U: 'TF-05',
  M: 'TF-07', F: 'TF-08', V: 'TF-09', L: 'TF-10', S: 'TF-11', N: 'TF-13', Z: 'TF-14', J: 'TF-15',
  P: 'TF-16', T: 'TF-17', B: 'TF-18', C: 'TF-19', D: 'TF-20', G: 'TF-21'
};

/**
 * D031: blocos de letras da jornada, reagrupados pelas letras realmente vistas. Cada bloco fecha com uma revisão do alfabeto
 * logo depois da lição `depoisDe` (fim de bloco da trilha fônica). O último bloco são as letras que a Trilha dos Sons ainda não
 * usa até TF-22, na ordem da trilha fônica (R: TF-31, H: TF-35, X: TF-39, Q: TF-40, K, Y e W: TF-48); ele fecha com a Festa.
 */
export const BLOCOS_ALFABETO: { id: string; letras: string[]; depoisDe?: string }[] = [
  { id: 'AL-RV1', letras: [...'AEIOU'], depoisDe: 'TF-06' },
  { id: 'AL-RV2', letras: [...'MFVLSNZJ'], depoisDe: 'TF-R2' },
  { id: 'AL-RV3', letras: [...'PTBCDG'], depoisDe: 'TF-R3' },
  { id: 'AL-FESTA', letras: [...'RHXQKYW'] }
];
/** D031: a ordem em que a jornada apresenta as 26 letras. */
export const ORDEM_LETRAS_JORNADA: string[] = BLOCOS_ALFABETO.flatMap((b) => b.letras);
/** Letras vistas na jornada até `ate` (inclusive). */
export const letrasVistasAte = (ate: string): string[] => ORDEM_LETRAS_JORNADA.slice(0, ORDEM_LETRAS_JORNADA.indexOf(ate) + 1);

/** Sons puros que ainda faltam gravar com fonoaudióloga (aviso na área do adulto). */
export function sonsPurosPendentes(): LetraAlfabeto[] {
  return ALFABETO.filter((l) => l.fonema && l.tipo !== 'vogal' && !l.somPuro.gravado);
}

/**
 * PRIMEIRAS PALAVRINHAS (pesquisa 44 §4.3): palavras para juntar as letras e ler desde cedo (liga/desliga em
 * config.ts › alfabeto.primeirasPalavrinhas). Só entram as que usam letras JÁ VISTAS na ordem da jornada (D031:
 * `ORDEM_LETRAS_JORNADA`); as outras ficam no banco e esperam (ver `palavrinhasDaLetra`).
 * Regras da 1ª volta (conferidas no teste): só letras já vistas; nada de CE, CI, GE, GI, QUE, QUI, GUE, GUI;
 * S e R só no COMEÇO da palavra (no meio o som é outro).
 */
export const PALAVRINHAS: Record<string, string[]> = {
  B: ['BABÁ'], E: ['BEBÊ'], F: ['CAFÉ', 'FACA'], I: ['BIFE'], J: ['JACA'], L: ['BALA', 'FILA'], M: ['MALA', 'CAMA'], N: ['BANANA', 'MENINA'],
  O: ['BOLA', 'DADO'], P: ['COPO', 'MAPA'], R: ['RODA', 'REI'], S: ['SAPO', 'SOPA'], T: ['GATO', 'PATO'], U: ['LUA', 'TATU'], V: ['UVA', 'VACA'], X: ['PEIXE'], Z: ['DOZE']
};
/** Palavrinhas das revisões ANTIGAS (AL-R1…AL-R4, ordem alfabética; fora da jornada desde a D031). */
export const PALAVRINHAS_REVISAO: string[][] = [['BABÁ', 'BEBÊ', 'CABE'], ['CAFÉ', 'BIFE', 'JACA'], ['BALA', 'BOLA', 'DEDO'], ['PATO', 'RODA', 'SAPO'], ['LUA', 'UVA', 'VACA']];
/** D031: palavrinhas das revisões da jornada e da Festa (a revisão das vogais não tem: a lição TF-06 já lê AI, EI, OI…). */
export const PALAVRINHAS_REVISAO_JORNADA: Record<string, string[]> = {
  'AL-RV2': ['MALA', 'LUA', 'UVA'], 'AL-RV3': ['BALA', 'JACA', 'VACA'], 'AL-FESTA': ['LUA', 'UVA', 'VACA']
};

/** A palavra respeita as regras da 1ª volta com as letras vistas até `ate` (inclusive)? `ordem`: padrão, a da jornada (D031). */
export function palavrinhaPermitida(palavra: string, ate: string, ordem: string[] = ORDEM_LETRAS_JORNADA): boolean {
  const w = palavra.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
  const vistas = ordem.slice(0, ordem.indexOf(ate) + 1);
  if (![...w].every((ch) => vistas.includes(ch))) return false;
  if (/C[EI]|G[EI]|[QG]U[EI]|H|K|W|Y/.test(w)) return false;
  return !/[SR]/.test(w.slice(1));
}

/**
 * D031: palavrinhas da fase da letra na jornada: as da própria letra que já dá para montar; se nenhuma serve, até 2 do banco
 * todo de palavrinhas que tenham a letra e só letras já vistas. Pode ficar vazio (a fase fica sem a cena de palavrinhas).
 */
export function palavrinhasDaLetra(letra: string): string[] {
  const proprias = (PALAVRINHAS[letra] ?? []).filter((w) => palavrinhaPermitida(w, letra));
  if (proprias.length) return proprias;
  const semAcento = (w: string) => w.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
  const banco = [...new Set([...Object.values(PALAVRINHAS).flat(), ...PALAVRINHAS_REVISAO.flat()])];
  return banco.filter((w) => semAcento(w).includes(letra) && palavrinhaPermitida(w, letra)).slice(0, 2);
}

/* ------------------------------------------------------------------------------------------------------------
 * D030 (etapas 3 e 4): som real como estímulo, cenas do som ("Liga o som") e contraste fino.
 * ---------------------------------------------------------------------------------------------------------- */

/**
 * Letras que ficam no COMPORTAMENTO ANTIGO nos jogos de som (o estímulo é "Letra H." e a dica é "H, de hipopótamo."):
 * H não faz som sozinho; K, W e Y são letras de nomes (o som delas é o de C, U/V e I, treinado nessas letras).
 */
export const LETRAS_NO_COMPORTAMENTO_ANTIGO: string[] = ['H', 'K', 'W', 'Y'];
/** A letra entra nos jogos de SOM REAL (som → letra, letra → som, som → figura)? */
export const usaSomReal = (l: LetraAlfabeto): boolean => !!l.fonema && !LETRAS_NO_COMPORTAMENTO_ANTIGO.includes(l.letra);

/**
 * CENA DO SOM de cada letra (jogo "Liga o som"): a figura do faz de conta em `BRINCADEIRAS`
 * (web/public/assets/figuras/<nome>.webp). C = K = Q, I = Y e U = W dividem a cena. H é o zíper na boca: sem som.
 */
export const CENAS_DO_SOM: Record<string, string> = {
  A: 'cena-a', B: 'bola', C: 'maca-mordida', D: 'tambor', E: 'trofeu-taca', F: 'bolo-velinhas', G: 'copo-agua', H: 'ziper',
  I: 'cena-i', J: 'barco-motor', K: 'maca-mordida', L: 'sorvete', M: 'cupcake', N: 'cena-n', O: 'cena-o', P: 'bolhas-sabao',
  Q: 'maca-mordida', R: 'carrinho', S: 'cobra', T: 'porta', U: 'macaco', V: 'aviao', W: 'macaco', X: 'cena-x', Y: 'cena-i', Z: 'abelha'
};

/** Letras em espelho (minúsculas): treinadas juntas DEPOIS do primeiro contato, com a correção "olha o desenho". */
export const LETRAS_EM_ESPELHO: string[] = ['B', 'D', 'P', 'Q'];

/** Palavras-exemplo que não servem para "começa com o som" (a vogal inicial átona muda de som: "ilástico"). */
export const PALAVRAS_FORA_DO_SOM_INICIAL: string[] = ['elástico', 'Wagner', 'wafer', 'Yuri'];
