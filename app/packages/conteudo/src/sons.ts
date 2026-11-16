/**
 * Banco de sons (fonemas do português brasileiro usados no MVP + os do primeiro som do nome).
 * Origem: prototipo-jogavel/regras-som.js + jogo-completo/README §5.2 (dicas de boca)
 * + espelho-do-som-3d/fonemas.js (chaves e quadros de frente).
 *
 * Palavras-figura revistas pela pesquisa 44a: saíram "escada" e "estrela" (soam "is…"), "iglu" e "ioiô", e "girafa"
 * (som de J com a letra G). "chave" e "chuva" valem para o SOM /ʃ/ (nomes com CH), nunca como exemplo da LETRA X.
 *
 * ⚠️ Dicas e posições SIMPLIFICADAS — validar com fonoaudióloga (D020).
 * No produto, cada som isolado é GRAVADO por fonoaudióloga; aqui a voz do navegador "estica" a escrita.
 */
import type { Som } from './tipos.ts';

const s = (o: Som): Som => o;

export const SONS: Record<string, Som> = {
  a: s({ chave: 'a', ipa: '/a/', letra: 'A', esticado: 'aaaa', bocaFrente: 'A', dica: 'Boca bem aberta, como um bocejo: aaa.', correcao: 'Abre mais a boca, como a minha.', palavras: [['abelha', '🐝'], ['avião', '✈️'], ['abacaxi', '🍍']] }),
  'a~': s({ chave: 'a~', ipa: '/ã/', letra: 'A', esticado: 'ãããã', bocaFrente: 'A', dica: 'Boca aberta, e o som passa pelo nariz: ããã.', correcao: 'Deixa um pouco do ar sair pelo nariz; sente?', palavras: [['âncora', '⚓'], ['antena', '📡']] }),
  E: s({ chave: 'E', ipa: '/ɛ/', letra: 'E', esticado: 'éééé', bocaFrente: 'A', dica: 'Sorriso aberto: ééé, como em PÉ.', correcao: 'Abre um pouquinho mais.', palavras: [['égua', '🐴']] }),
  e: s({ chave: 'e', ipa: '/e/', letra: 'E', esticado: 'êêêê', bocaFrente: 'S', dica: 'Sorriso meio aberto: êêê, como em VOCÊ.', correcao: 'Fecha um pouquinho.', palavras: [['elefante', '🐘']] }),
  'e~': s({ chave: 'e~', ipa: '/ẽ/', letra: 'E', esticado: 'ẽẽẽẽ', bocaFrente: 'S', dica: 'Sorriso pequeno, e o som passa pelo nariz.', correcao: 'Deixa o som sair pelo nariz.', palavras: [['envelope', '✉️']] }),
  i: s({ chave: 'i', ipa: '/i/', letra: 'I', esticado: 'iiii', bocaFrente: 'S', dica: 'Sorriso grande: iii.', correcao: 'Estica o sorriso.', palavras: [['ilha', '🏝️']] }),
  'i~': s({ chave: 'i~', ipa: '/ĩ/', letra: 'I', esticado: 'ĩĩĩĩ', bocaFrente: 'S', dica: 'Sorriso largo, e o som passa pelo nariz.', correcao: 'Deixa o som sair pelo nariz.', palavras: [['inseto', '🦗']] }),
  O: s({ chave: 'O', ipa: '/ɔ/', letra: 'O', esticado: 'óóóó', bocaFrente: 'O', dica: 'Bolinha aberta: óóó, como em VOVÓ.', correcao: 'Abre a bolinha.', palavras: [['óculos', '👓'], ['ônibus', '🚌']] }),
  o: s({ chave: 'o', ipa: '/o/', letra: 'O', esticado: 'ôôôô', bocaFrente: 'O', dica: 'Boca redondinha: ôôô, como em VOVÔ.', correcao: 'Fecha mais a boca, redondinha.', palavras: [['ovo', '🥚'], ['ovelha', '🐑'], ['olho', '👁️']] }),
  'o~': s({ chave: 'o~', ipa: '/õ/', letra: 'O', esticado: 'õõõõ', bocaFrente: 'O', dica: 'Boca redondinha, e o som passa pelo nariz.', correcao: 'Deixa o som sair pelo nariz.', palavras: [['onça', '🐆'], ['onda', '🌊']] }),
  u: s({ chave: 'u', ipa: '/u/', letra: 'U', esticado: 'uuuu', bocaFrente: 'O', dica: 'Biquinho de assobio: uuu.', correcao: 'Faz biquinho mais pra frente.', palavras: [['uva', '🍇'], ['urso', '🐻']] }),
  'u~': s({ chave: 'u~', ipa: '/ũ/', letra: 'U', esticado: 'ũũũũ', bocaFrente: 'O', dica: 'Biquinho, e o som passa pelo nariz.', correcao: 'Deixa o som sair pelo nariz.', palavras: [['um', '1️⃣']] }),
  b: s({ chave: 'b', ipa: '/b/', letra: 'B', esticado: 'bá', bocaFrente: 'M', dica: 'Lábios fechadinhos, depois abrem; a garganta vibra.', correcao: 'Fecha bem os lábios e solta, e a garganta vibra.', palavras: [['bola', '⚽'], ['banana', '🍌'], ['barco', '⛵']] }),
  d: s({ chave: 'd', ipa: '/d/', letra: 'D', esticado: 'dá', bocaFrente: 'S', dica: 'A ponta da língua bate atrás dos dentes de cima, e vibra.', correcao: 'A ponta da língua bate atrás dos dentes de cima.', palavras: [['dado', '🎲'], ['dente', '🦷'], ['doce', '🍬']] }),
  f: s({ chave: 'f', ipa: '/f/', letra: 'F', esticado: 'ffff', bocaFrente: 'S', dica: 'Dentes de cima no lábio de baixo, um ventinho: fff.', correcao: 'Encosta os dentinhos de cima no lábio de baixo e sopra.', palavras: [['foca', '🦭'], ['formiga', '🐜'], ['folha', '🍃']] }),
  g: s({ chave: 'g', ipa: '/g/', letra: 'G', esticado: 'gá', bocaFrente: 'A', dica: 'O fundo da língua sobe e solta, e vibra.', correcao: 'O fundo da língua sobe e solta.', palavras: [['gato', '🐱'], ['galinha', '🐔'], ['gota', '💧']] }),
  j: s({ chave: 'j', ipa: '/ʒ/', letra: 'J', esticado: 'jjjj', bocaFrente: 'O', dica: 'Biquinho, o ar passa e a garganta vibra: jjj.', correcao: 'Biquinho pra frente, e a garganta vibra.', palavras: [['jacaré', '🐊'], ['janela', '🪟']] }),
  k: s({ chave: 'k', ipa: '/k/', letra: 'C', esticado: 'cá', bocaFrente: 'A', dica: 'O fundo da língua sobe e solta o ar de uma vez.', correcao: 'O fundo da língua sobe e solta.', palavras: [['casa', '🏠'], ['cavalo', '🐴'], ['coelho', '🐰']] }),
  l: s({ chave: 'l', ipa: '/l/', letra: 'L', esticado: 'llll', bocaFrente: 'S', dica: 'Ponta da língua para cima, atrás dos dentes de cima: lll.', correcao: 'Ponta da língua atrás dos dentinhos de cima.', palavras: [['lua', '🌙'], ['leão', '🦁'], ['livro', '📖']] }),
  lh: s({ chave: 'lh', ipa: '/ʎ/', letra: 'LH', esticado: 'lhá', bocaFrente: 'S', dica: 'A língua sobe no meio e o ar escapa pelos lados.', correcao: 'A língua sobe no meio.', palavras: [['lhama', '🦙']] }),
  m: s({ chave: 'm', ipa: '/m/', letra: 'M', esticado: 'mmmm', bocaFrente: 'M', dica: 'Lábios fechados, o som sai pelo nariz: mmm. Sente a cosquinha?', correcao: 'Fecha os lábios e deixa zumbir.', palavras: [['macaco', '🐒'], ['mala', '🧳'], ['moto', '🏍️']] }),
  n: s({ chave: 'n', ipa: '/n/', letra: 'N', esticado: 'nnnn', bocaFrente: 'S', dica: 'Língua no céu da boca, atrás dos dentes; som pelo nariz: nnn.', correcao: 'Língua atrás dos dentes, som pelo nariz.', palavras: [['navio', '🚢'], ['nuvem', '☁️'], ['ninho', '🪺']] }),
  nh: s({ chave: 'nh', ipa: '/ɲ/', letra: 'NH', esticado: 'nhá', bocaFrente: 'S', dica: 'O meio da língua encosta e o som vai pro nariz.', correcao: 'O meio da língua encosta no céu da boca.', palavras: [['nhoque', '🍝']] }),
  p: s({ chave: 'p', ipa: '/p/', letra: 'P', esticado: 'pá', bocaFrente: 'M', dica: 'Lábios fechados, depois abrem com um soprinho: p!', correcao: 'Fecha bem os lábios e solta de uma vez.', palavras: [['pato', '🦆'], ['pipoca', '🍿'], ['peixe', '🐟']] }),
  rr: s({ chave: 'rr', ipa: '/ʁ/', letra: 'R', esticado: 'rrrá', bocaFrente: 'A', dica: 'O som lá no fundo, como um motorzinho. Todo sotaque vale!', correcao: 'O som vem lá do fundo.', palavras: [['rato', '🐭'], ['relógio', '⏰'], ['rosa', '🌹']] }),
  s: s({ chave: 's', ipa: '/s/', letra: 'S', esticado: 'ssss', bocaFrente: 'S', dica: 'Dentinhos quase fechados, língua escondida, como uma cobrinha: sss.', correcao: 'Fecha mais os dentinhos e esconde a língua.', palavras: [['sapo', '🐸'], ['sol', '☀️'], ['suco', '🧃']] }),
  t: s({ chave: 't', ipa: '/t/', letra: 'T', esticado: 'tá', bocaFrente: 'S', dica: 'A língua toca atrás dos dentes de cima e solta: t!', correcao: 'A ponta da língua bate atrás dos dentes de cima.', palavras: [['tatu', '🦔'], ['tomate', '🍅'], ['tartaruga', '🐢']] }),
  v: s({ chave: 'v', ipa: '/v/', letra: 'V', esticado: 'vvvv', bocaFrente: 'S', dica: 'Dentes de cima no lábio de baixo, e a garganta vibra: vvv.', correcao: 'Igual ao F, mas a garganta treme; sente?', palavras: [['vaca', '🐄'], ['vela', '🕯️'], ['violão', '🎸']] }),
  x: s({ chave: 'x', ipa: '/ʃ/', letra: 'X', esticado: 'xxxx', bocaFrente: 'O', dica: 'Biquinho do "xiii", como quem pede silêncio.', correcao: 'Biquinho pra frente.', palavras: [['xícara', '☕'], ['chave', '🔑'], ['chuva', '🌧️']] }),
  z: s({ chave: 'z', ipa: '/z/', letra: 'Z', esticado: 'zzzz', bocaFrente: 'S', dica: 'Dentinhos juntos, como uma abelhinha, e a garganta vibra: zzz.', correcao: 'Liga o motorzinho da garganta.', palavras: [['zebra', '🦓'], ['zíper', '🤐']] })
};

/** Pares fáceis de confundir: não aparecem juntos como distratores no 1º contato. */
export const PARES_CONFUSOS: [string, string][] = [
  ['s', 'z'], ['x', 'j'], ['p', 'b'], ['t', 'd'], ['f', 'v'], ['k', 'g'], ['m', 'n'], ['l', 'rr'], ['lh', 'l'], ['nh', 'n'], ['E', 'e'], ['O', 'o'], ['o', 'u']
];

export function som(chave: string): Som {
  return SONS[chave] ?? SONS[chave.replace('~', '')] ?? SONS.a;
}

/* ------------------------------------------------------------------------------------------------------------
 * D030 (etapas 3 e 4): som real como estímulo, correção contrastiva e pares mínimos.
 * ---------------------------------------------------------------------------------------------------------- */

/** Fonemas SEM clipe aprovado (app/docs/auditoria-sons-letras.md): quem depende deles fica no comportamento antigo. */
export const SONS_SEM_CLIPE: string[] = ['r', 'lh', 'nh'];

/** Pares que só mudam na VOZ (surdo, sonoro): a correção diz "este não tem voz / este tem voz". */
export const PARES_DE_VOZ: [string, string][] = [['p', 'b'], ['t', 'd'], ['f', 'v'], ['s', 'z'], ['x', 'j'], ['k', 'g']];

/**
 * Habilidade de um item de PAR MÍNIMO a partir dos dois sons que mudam (docs/pedagogia/02; revisão de 16/11): cada par
 * grava a habilidade do SEU contraste — nunca a leitura em geral. Vogal × vogal = 'par-minimo-vogal'; consoantes = o par
 * em ordem fixa ('par-minimo-p-b', 'par-minimo-m-b'…).
 */
const ORDEM_DO_PAR = ['f', 'v', 's', 'z', 'x', 'j', 'p', 'm', 'b', 't', 'd', 'k', 'g', 'n', 'l', 'rr'];
export function habilidadeDoPar(sons: [string, string]): string {
  const vogal = (x: string) => /^[aeiouEO]~?$/.test(x);
  if (vogal(sons[0]) && vogal(sons[1])) return 'par-minimo-vogal';
  const [a, b] = [...sons].sort((x, y) => (ORDEM_DO_PAR.indexOf(x) + 99) % 99 - (ORDEM_DO_PAR.indexOf(y) + 99) % 99 || x.localeCompare(y));
  return `par-minimo-${a}-${b}`;
}

/** Os dois sons são um par fácil de confundir? */
export function parConfuso(a: string, b: string): boolean {
  return PARES_CONFUSOS.some(([x, y]) => (x === a && y === b) || (x === b && y === a));
}
/** O que muda entre dois sons parecidos (para a correção contrastiva); `undefined` = sons distantes. */
export function contrasteDosSons(a: string, b: string): 'voz' | 'boca' | undefined {
  if (PARES_DE_VOZ.some(([x, y]) => (x === a && y === b) || (x === b && y === a))) return 'voz';
  return parConfuso(a, b) ? 'boca' : undefined;
}
/** Num par de voz, qual é o surdo e qual é o sonoro. */
export function surdoESonoro(a: string, b: string): [string, string] | null {
  return PARES_DE_VOZ.find(([x, y]) => (x === a && y === b) || (x === b && y === a)) ?? null;
}

/**
 * FALAS FÔNICAS (D030 §11): poucas frases GENÉRICAS, gravadas uma vez, que se combinam com os clipes de som já
 * existentes ("Essa letra faz este som:" + clipe + "Eu pedi este som:" + clipe). Nenhuma diz o nome nem a resposta.
 * `voz` diz em qual(is) voz(es) a frase é gravada.
 */
export const FALAS_FONICAS = {
  // correção contrastiva (sempre a Sofia)
  letraFaz: 'Essa letra faz este som:',
  figuraComeca: 'Essa figura começa com este som:',
  cenaFaz: 'Essa cena faz este som:',
  voceEscolheu: 'Você escolheu este som:',
  euPedi: 'Eu pedi este som:',
  somDaLetra: 'O som desta letra é este:',
  palavraComeca: 'A palavra começa com este som:',
  somQueFalta: 'O som que falta é este:',
  tentaDeNovo: 'Escuta os dois e tenta de novo.',
  semVoz: 'Este não tem voz:',
  comVoz: 'Este tem voz:',
  maoNoPescoco: 'Ponha a mão no pescoço para sentir.',
  bocaMuda: 'Olha a boca: ela se mexe diferente em cada som.',
  desenhoParecido: 'Essas letras se parecem. Olha bem o desenho de cada uma.',
  // apoio depois do acerto (na voz de quem apresenta a letra) — em seguida toca o clipe "Letra B."
  essaEALetra: 'Isso! Esse é o som desta letra.',
  // enunciados novos
  qualSom: 'Qual é o som desta letra? Toque para ouvir e escolha.',
  qualFigura: 'Qual figura começa com este som?',
  sonsParecidos: 'Estes sons se parecem. Escute bem!',
  letrasParecidas: 'Estas letras se parecem. Olhe bem!',
  ligaOSom: 'Ligue cada letra à cena que faz o som dela.',
  qualCena: 'Ouça o som. Qual cena faz esse som?',
  qualLetraDaCena: 'Olhe a cena e ouça o som. Qual é a letra?',
  qualSomFalta: 'Qual som falta nesta palavra?',
  // montar sem cópia
  semModelo: 'Agora sem o modelo. Escute a palavra e monte.',
  escutaDeNovo: 'Escuta de novo.',
  pecaBrilha: 'Olha, a peça certa está brilhando.',
  // ouvir as leituras
  ouvirLeituras: 'Toque para ouvir cada leitura e escolha a que combina.'
} as const;

/** Em qual voz cada fala fônica é gravada (as demais: só a Sofia). */
export const VOZES_DAS_FALAS_FONICAS: Partial<Record<keyof typeof FALAS_FONICAS, ('sofia' | 'tales')[]>> = {
  essaEALetra: ['sofia', 'tales'], qualSom: ['sofia', 'tales'], qualFigura: ['sofia', 'tales'],
  sonsParecidos: ['tales'], letrasParecidas: ['tales'], ligaOSom: ['tales'], qualCena: ['tales'], qualLetraDaCena: ['tales'], qualSomFalta: ['tales']
};

const ACENTO_FONEMA: Record<string, string | null> = {
  A: 'a', Á: 'a', À: 'a', Â: 'a', Ã: 'a~', E: 'e', É: 'E', Ê: 'e', I: 'i', Í: 'i', O: 'o', Ó: 'O', Ô: 'o', Õ: 'o', U: 'u', Ú: 'u',
  B: 'b', C: 'k', Ç: 's', D: 'd', F: 'f', G: 'g', H: null, J: 'j', K: 'k', L: 'l', M: 'm', N: 'n', P: 'p', Q: 'k', R: 'rr', S: 's', T: 't', V: 'v', W: 'u', X: 'x', Y: 'i', Z: 'z'
};
const EH_VOGAL = /[AEIOUÁÀÂÃÉÊÍÓÔÕÚ]/;

/**
 * Som de CADA LETRA de uma palavra, na posição em que está (para as peças do Montar tocarem o fonema, D030 §5).
 * Regras simples do pt-BR: E e O átonos no fim soam i e u; S entre vogais soa z; C e G antes de E/I soam s e j;
 * U de QUE/QUI/GUE/GUI e H não soam (`null`); R entre vogais é o R fraco (sem clipe: `null`).
 * `abertas`: a palavra tem É/Ó aberto sem acento (BOLA, COPO): vale para a PRIMEIRA vogal E/O.
 */
export function fonemasDasLetras(palavra: string, abertas: { e?: boolean; o?: boolean } = {}): (string | null)[] {
  const w = [...palavra.toUpperCase()];
  let abriuE = !abertas.e;
  let abriuO = !abertas.o;
  const temAcento = /[ÁÀÂÃÉÊÍÓÔÕÚ]/.test(palavra.toUpperCase());
  return w.map((ch, i) => {
    const ant = w[i - 1] ?? '';
    const prox = w[i + 1] ?? '';
    const fim = i === w.length - 1;
    if (ch === 'E' && !abriuE) { abriuE = true; return 'E'; }
    if (ch === 'O' && !abriuO) { abriuO = true; return 'O'; }
    if (fim && !temAcento && w.length > 2 && ch === 'E') return 'i';
    if (fim && !temAcento && w.length > 2 && ch === 'O') return 'u';
    if (ch === 'S' && EH_VOGAL.test(ant) && EH_VOGAL.test(prox)) return 'z';
    if (ch === 'C' && /[EIÉÊÍ]/.test(prox)) return 's';
    if (ch === 'G' && /[EIÉÊÍ]/.test(prox)) return 'j';
    if (ch === 'U' && /[QG]/.test(ant) && /[EIÉÊÍ]/.test(prox)) return null;
    if (ch === 'R' && EH_VOGAL.test(ant) && EH_VOGAL.test(prox)) return null;
    if (ch === 'R' && ant === 'R') return null;
    if (ch === 'S' && ant === 'S') return null;
    if (ch === 'H') return null;
    return ch in ACENTO_FONEMA ? ACENTO_FONEMA[ch] : null;
  });
}

/**
 * CORREÇÃO CONTRASTIVA com frases completas para os pares mais confundidos (p/b, t/d, f/v, s/z, m/n): depois do som
 * escolhido, a Sofia diz o que cada um tem de diferente, e toca o som de cada um ("O P não tem voz:" + clipe).
 * `tocou` só é dito quando a criança tocou numa LETRA. Os outros pares (c/g, x/j, l/r, o/u) usam as frases genéricas.
 */
export const FALAS_DOS_PARES: Record<string, { tocou: string; como: string }> = {
  p: { tocou: 'Você tocou no P.', como: 'O P não tem voz:' },
  b: { tocou: 'Você tocou no B.', como: 'O B tem voz:' },
  t: { tocou: 'Você tocou no T.', como: 'O T não tem voz:' },
  d: { tocou: 'Você tocou no D.', como: 'O D tem voz:' },
  f: { tocou: 'Você tocou no F.', como: 'O F não tem voz, é só um ventinho:' },
  v: { tocou: 'Você tocou no V.', como: 'O V tem voz, a garganta treme:' },
  s: { tocou: 'Você tocou no S.', como: 'O S não tem voz, é só o ar:' },
  z: { tocou: 'Você tocou no Z.', como: 'O Z tem voz, como uma abelhinha:' },
  m: { tocou: 'Você tocou no M.', como: 'No M, os lábios ficam fechados:' },
  n: { tocou: 'Você tocou no N.', como: 'No N, a língua sobe atrás dos dentes:' }
};
/** Letras em espelho b × d: o que muda é o desenho. */
export const FALA_ESPELHO_BD = 'No b, a barriga vem depois do pauzinho. No d, a barriga vem antes.';
/** Falas ditas pelas telas fora do conteúdo das fases (para o gerador de vozes não depender do coletor do E2E). */
export const FALAS_DAS_TELAS: { quem: 'sofia' | 'tales'; texto: string }[] = [
  { quem: 'sofia', texto: 'Muito bem! Letra por letra.' },
  { quem: 'sofia', texto: 'Olha: assim você escreveu, e assim os adultos escrevem. Repara na diferença.' },
  { quem: 'sofia', texto: 'Olha minha boca e escuta:' },
  { quem: 'sofia', texto: 'Tudo bem! Toque em eu falei.' },
  { quem: 'sofia', texto: 'Você montou a palavra!' },
  { quem: 'tales', texto: 'Aqui você troca as moedinhas que ganhou aprendendo. Pode esperar e juntar para algo maior!' },
  { quem: 'sofia', texto: 'Que escolha boa! Já está na sua mochila.' },
  { quem: 'tales', texto: 'Meta escolhida! Agora é juntar moedinhas aprendendo.' },
  { quem: 'sofia', texto: 'Que escolha boa! Já está no seu boneco.' },
  { quem: 'sofia', texto: 'Pronto! Seu professor vai ver e responder. Que orgulho de você, [NOME]!' },
  { quem: 'sofia', texto: 'O Zum-Zum embaralhou as placas da vila! Me ajuda a pendurar, [NOME]?' },
  { quem: 'sofia', texto: 'Todas as placas no lugar! Obrigada pela ajuda, [NOME]!' },
  { quem: 'sofia', texto: 'Vamos treinar mais um pouquinho e tentar de novo outro dia. Nada se perde!' }
];
