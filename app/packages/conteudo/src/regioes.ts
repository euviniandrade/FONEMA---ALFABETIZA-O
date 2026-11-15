import type { Fase, Regiao } from './tipos.ts';
import { FASES_ALFABETO } from './fases/alfabeto.ts';
import { FASES_R0 } from './fases/r0.ts';
import { FASES_R1 } from './fases/r1.ts';
import { FASES_R2A } from './fases/r2a.ts';
import { FASES_TF } from './fases/tf.ts';

/**
 * ORDEM DA JORNADA (D027 + D030; D021: sem pular fases): Alfabeto → Trilha dos Sons → vogais abertas → palavras → Meu nome.
 *
 * 1. AL  · Trilha do Alfabeto: 26 letras (A–Z), revisão a cada 5 letras e a Festa do Alfabeto. É "conhecer as letras"
 *          (nome, forma, traçado): NÃO libera leitura e escrita (D030 §4).
 * 2. TF  · Trilha dos Sons (D030): a trilha fônica que ENSINA A LER, na ordem de docs/pedagogia/01 — vogais (TF-01…06),
 *          consoantes que se prolongam (TF-07…15 + revisão TF-R2) e consoantes de estouro (TF-16…22 + revisão TF-R3).
 *          O nível inicial "já conhece as letras e os sons" começa nela (TF-06, a primeira leitura).
 * 3. R1  · Os OUTROS sons das vogais (é/ê, ó/ô) e as 5 vogais misturadas: na trilha fônica eles vêm DEPOIS das
 *          consoantes de estouro (TF-23 e TF-24, docs/pedagogia/01 §6), e é exatamente aqui que ficam.
 * 4. R2a · Vale do M-L-F: as primeiras palavras e o chefe "Cachoeira das Sílabas". Depois da Trilha dos Sons vira
 *          REVISÃO de leitura e escrita (M, L e F já foram ensinados em TF-07, TF-08 e TF-10; as habilidades são as mesmas).
 * 5. R0  · Meu nome: "O som do meu nome" chega como presente depois das primeiras palavras, quando a criança já
 *          conhece todas as letras (inclusive K, W, Y e o H mudo) e consegue montar o próprio nome entendendo cada som.
 *
 * As brincadeiras de escuta de R0 (rimas, palmas, primeiro som, fala de tatu) NÃO são mais uma etapa antes das letras:
 * viraram aquecimentos curtos dentro das revisões do alfabeto. As fases antigas continuam no banco (`FASES_R0`).
 */
const R1_NA_JORNADA = ['R1-F02', 'R1-F03', 'R1-F06', 'R1-F07'];
const FASES_VOGAIS = FASES_R1.filter((f) => R1_NA_JORNADA.includes(f.id));
const FASES_MEU_NOME = FASES_R0.filter((f) => f.id === 'R0-F01');

export const FASES: Fase[] = [...FASES_ALFABETO, ...FASES_TF, ...FASES_VOGAIS, ...FASES_R2A, ...FASES_MEU_NOME];
export const FASE_POR_ID: Record<string, Fase> = Object.fromEntries(FASES.map((f) => [f.id, f]));

export const REGIOES: Regiao[] = [
  {
    id: 'AL', etapa: 'Alfabeto', nome: 'Trilha do Alfabeto', perguntaGuia: 'Que som cada letra tem?', cenario: 'quintal',
    mapa: { x: 17, y: 36 }, fases: FASES_ALFABETO.map((f) => f.id), selo: 'Alfabeto Completo', chefe: 'Festa do Alfabeto',
    zumZumViraAmigo: 'O Zum-Zum seguiu a trilha inteira e aprendeu que cada letra tem o seu som.',
    ganchoProxima: 'Agora cada letra mostra o seu som, e os sons viram palavras!'
  },
  {
    id: 'TF', etapa: 'Ler e escrever', nome: 'Trilha dos Sons', perguntaGuia: 'Como os sons viram palavras?', cenario: 'biblioteca',
    mapa: { x: 46.5, y: 54 }, fases: FASES_TF.map((f) => f.id), selo: 'Leitura dos Sons', chefe: 'Revisão dos sons que estouram',
    zumZumViraAmigo: 'O Zum-Zum juntou os sons devagar, até o fim, e leu a primeira frase.',
    ganchoProxima: 'Agora as vogais mostram os outros sons delas: é, ê, ó, ô!'
  },
  {
    id: 'R1', etapa: 'Vogais abertas', nome: 'Ilha das Vogais', perguntaGuia: 'Que outros sons as vogais fazem?', cenario: 'ilha',
    mapa: { x: 39, y: 30 }, fases: FASES_VOGAIS.map((f) => f.id), selo: 'Leitura da Ilha', chefe: 'O Farol Apagado',
    zumZumViraAmigo: 'O Zum-Zum descobriu que olhar a boca ajuda a ouvir e ganhou um lugar no barco do Bolota.',
    ganchoProxima: 'A luz do farol chegou à mata, e de lá veio um som comprido: /mmm/.'
  },
  {
    id: 'R2a', etapa: 'Palavras', nome: 'Mata Atlântica · Vale do M-L-F', perguntaGuia: 'Como as letras viram palavras?', cenario: 'mata',
    mapa: { x: 59, y: 33 }, fases: FASES_R2A.map((f) => f.id), selo: 'Leitura da Mata', chefe: 'Cachoeira das Sílabas',
    zumZumViraAmigo: 'O Zum-Zum aprendeu que devagar e até o fim a palavra aparece, e ajudou a carregar as letras do guia.',
    ganchoProxima: 'Tem um presente esperando no quintal: o seu nome!'
  },
  {
    id: 'R0', etapa: 'Meu nome', nome: 'Quintal da Sofia · Meu nome', perguntaGuia: 'Que sons moram no meu nome?', cenario: 'quintal',
    mapa: { x: 76, y: 47 }, fases: FASES_MEU_NOME.map((f) => f.id), selo: 'Leitura do Quintal', chefe: 'O som do meu nome',
    zumZumViraAmigo: 'O Zum-Zum ouviu o seu nome inteiro, bem quietinho.',
    ganchoProxima: 'As palavras querem virar frases. Em breve!'
  }
];
export const REGIAO_POR_ID: Record<string, Regiao> = Object.fromEntries(REGIOES.map((r) => [r.id, r]));
