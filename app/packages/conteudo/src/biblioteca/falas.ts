/**
 * Falas-moldura do CANTINHO DA LEITURA (fluência, leitura em eco e em coro, escrita própria) e do BRINCAR COM SONS.
 * Genéricas, gravadas uma vez, combinadas com os clipes de palavra e de som que já existem.
 */
import type { Fala } from '../tipos.ts';

const s = (texto: string): Fala => ({ quem: 'sofia', texto });
const t = (texto: string): Fala => ({ quem: 'tales', texto });

export const FALAS_BIBLIOTECA = {
  cantinho: s('Bem-vindo ao Cantinho da Leitura! Escolha o que vamos fazer.'),
  brincar: t('Vamos brincar com os sons das palavras!'),
  // fluência: releitura de lista (ABC p. 375–376; VT-1A p. 197, 202)
  fluAbre: s('Leia cada palavra em voz alta e toque na figura dela. Quanto mais você lê, mais ligeiro fica!'),
  fluTrancada: s('Primeiro vamos ler mais palavras na Trilha dos Sons. Depois a gente volta aqui.'),
  fluDeNovo: s('Leia de novo, letra por letra.'),
  fluFim: s('Você leu a lista inteira!'),
  fluMelhorou: s('Você leu mais ligeiro que da outra vez!'),
  fluMic: s('Pode ler perto do microfone. Ele só ajuda a Sofia a ouvir.'),
  // eco e coro (SOA p. 246–248; ABC p. 375–376)
  ecoAbre: s('Escute como eu leio. Depois, leia você, do mesmo jeito.'),
  ecoVez: s('Agora leia você, em voz alta.'),
  coroAbre: s('Vamos ler juntos, ao mesmo tempo!'),
  ecoFim: s('Que leitura bonita!'),
  // escrita própria com confronto (ABC p. 262, 421–423; SOA p. 122–123)
  escAbre: s('Escreva o nome desta figura do seu jeito. Não tem certo nem errado!'),
  escCompara: s('Olha o que você escreveu. E agora, olha como se escreve.'),
  escFaltou: s('Aqui tem mais um som. Escute:'),
  escFaltouLetra: s('Esse som se escreve com esta letra.'),
  escSobrou: s('Esta letra não aparece nesta palavra.'),
  escIgual: s('Você escreveu igualzinho!'),
  escDeNovo: s('Quer escrever de novo, agora sem olhar?'),
  escTrancada: s('A escrita do seu jeito abre depois do som do M, na Trilha dos Sons.')
} as const;
