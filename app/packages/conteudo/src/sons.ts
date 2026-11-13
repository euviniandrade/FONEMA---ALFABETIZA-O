/**
 * Banco de sons (fonemas do português brasileiro usados no MVP + os do primeiro som do nome).
 * Origem: prototipo-jogavel/regras-som.js + jogo-completo/README §5.2 (dicas de boca)
 * + espelho-do-som-3d/fonemas.js (chaves e quadros de frente).
 *
 * ⚠️ Dicas e posições SIMPLIFICADAS — validar com fonoaudióloga (D020).
 * No produto, cada som isolado é GRAVADO por fonoaudióloga; aqui a voz do navegador "estica" a escrita.
 */
import type { Som } from './tipos.ts';

const s = (o: Som): Som => o;

export const SONS: Record<string, Som> = {
  a: s({ chave: 'a', ipa: '/a/', letra: 'A', esticado: 'aaaa', bocaFrente: 'A', dica: 'Boca bem aberta, como um bocejo: aaa.', correcao: 'Abre mais a boca, como a minha.', palavras: [['abelha', '🐝'], ['avião', '✈️'], ['abacaxi', '🍍']] }),
  'a~': s({ chave: 'a~', ipa: '/ã/', letra: 'A', esticado: 'ãããã', bocaFrente: 'A', dica: 'Boca aberta, e o som passa pelo nariz: ããã.', correcao: 'Deixa um pouco do ar sair pelo nariz; sente?', palavras: [['âncora', '⚓'], ['antena', '📡']] }),
  E: s({ chave: 'E', ipa: '/ɛ/', letra: 'E', esticado: 'éééé', bocaFrente: 'A', dica: 'Sorriso aberto: ééé, como em PÉ.', correcao: 'Abre um pouquinho mais.', palavras: [['égua', '🐴'], ['escada', '🪜']] }),
  e: s({ chave: 'e', ipa: '/e/', letra: 'E', esticado: 'êêêê', bocaFrente: 'S', dica: 'Sorriso meio aberto: êêê, como em VOCÊ.', correcao: 'Fecha um pouquinho.', palavras: [['elefante', '🐘'], ['estrela', '⭐']] }),
  'e~': s({ chave: 'e~', ipa: '/ẽ/', letra: 'E', esticado: 'ẽẽẽẽ', bocaFrente: 'S', dica: 'Sorriso pequeno, e o som passa pelo nariz.', correcao: 'Deixa o som sair pelo nariz.', palavras: [['envelope', '✉️']] }),
  i: s({ chave: 'i', ipa: '/i/', letra: 'I', esticado: 'iiii', bocaFrente: 'S', dica: 'Sorriso grande: iii.', correcao: 'Estica o sorriso.', palavras: [['ilha', '🏝️'], ['iglu', '🧊'], ['ioiô', '🪀']] }),
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
  j: s({ chave: 'j', ipa: '/ʒ/', letra: 'J', esticado: 'jjjj', bocaFrente: 'O', dica: 'Biquinho, o ar passa e a garganta vibra: jjj.', correcao: 'Biquinho pra frente, e a garganta vibra.', palavras: [['jacaré', '🐊'], ['janela', '🪟'], ['girafa', '🦒']] }),
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
  x: s({ chave: 'x', ipa: '/ʃ/', letra: 'X', esticado: 'xxxx', bocaFrente: 'O', dica: 'Biquinho do "xiii", como quem pede silêncio.', correcao: 'Biquinho pra frente.', palavras: [['chave', '🔑'], ['chuva', '🌧️'], ['xícara', '☕']] }),
  z: s({ chave: 'z', ipa: '/z/', letra: 'Z', esticado: 'zzzz', bocaFrente: 'S', dica: 'Dentinhos juntos, como uma abelhinha, e a garganta vibra: zzz.', correcao: 'Liga o motorzinho da garganta.', palavras: [['zebra', '🦓'], ['zíper', '🤐']] })
};

/** Pares fáceis de confundir: não aparecem juntos como distratores no 1º contato. */
export const PARES_CONFUSOS: [string, string][] = [
  ['s', 'z'], ['x', 'j'], ['p', 'b'], ['t', 'd'], ['f', 'v'], ['k', 'g'], ['m', 'n'], ['l', 'rr'], ['lh', 'l'], ['nh', 'n'], ['E', 'e'], ['O', 'o'], ['o', 'u']
];

export function som(chave: string): Som {
  return SONS[chave] ?? SONS[chave.replace('~', '')] ?? SONS.a;
}
