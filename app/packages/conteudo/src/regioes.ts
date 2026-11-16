import type { Fase, Regiao } from './tipos.ts';
import { FASES_ALFABETO } from './fases/alfabeto.ts';
import { BLOCOS_ALFABETO, LICAO_DA_LETRA, faseDaLetra } from './alfabeto.ts';
import { FASES_R0 } from './fases/r0.ts';
import { FASES_R1 } from './fases/r1.ts';
import { FASES_R2A } from './fases/r2a.ts';
import { FASES_TF } from './fases/tf.ts';

/**
 * ORDEM DA JORNADA (D027 + D030 + D031; D021: sem pular fases): letras e sons ALTERNADOS → vogais abertas → palavras → Meu nome.
 *
 * 1. AL + TF, alternadas (D031): a criança conhece uma letra (fase da Trilha A–Z: nome, forma, traçado) e LOGO DEPOIS aprende
 *    o som dela e lê com ela (lição da Trilha dos Sons), na ordem da trilha fônica (docs/pedagogia/01):
 *      A TF-01 · E TF-02 · I TF-03 · O TF-04 · U TF-05 · TF-06 · revisão das vogais (AL-RV1)
 *      M TF-07 · F TF-08 · V TF-09 · L TF-10 · S TF-11 · TF-12 · N TF-13 · Z TF-14 · J TF-15 · TF-R2 · revisão M…J (AL-RV2)
 *      P TF-16 · T TF-17 · B TF-18 · C TF-19 · D TF-20 · G TF-21 · TF-22 · TF-R3 · revisão P…G (AL-RV3)
 *      R · H · X · Q · K · Y · W (letras que a trilha fônica só usa depois de TF-22, na ordem dela) · Festa do Alfabeto
 *    A Trilha A–Z é "conhecer as letras": NÃO libera leitura e escrita sozinha (D030 §4); quem ensina a ler é a Trilha dos Sons.
 *    No MAPA a Trilha A–Z continua inteira, em ordem alfabética (regra 7): só o caminho guiado mudou.
 *    O nível inicial "já conhece as letras e os sons" começa em TF-06 e deixa a Trilha A–Z inteira aberta para revisar.
 * 2. R1  · Os OUTROS sons das vogais (é/ê, ó/ô) e as 5 vogais misturadas: na trilha fônica eles vêm DEPOIS das
 *          consoantes de estouro (TF-23 e TF-24, docs/pedagogia/01 §6), e é exatamente aqui que ficam.
 * 3. R2a · Vale do M-L-F: as primeiras palavras e o chefe "Cachoeira das Sílabas". Depois da Trilha dos Sons vira
 *          REVISÃO de leitura e escrita (M, L e F já foram ensinados em TF-07, TF-08 e TF-10; as habilidades são as mesmas).
 * 4. R0  · Meu nome: "O som do meu nome" chega como presente depois das primeiras palavras, quando a criança já
 *          conhece todas as letras (inclusive K, W, Y e o H mudo) e consegue montar o próprio nome entendendo cada som.
 *
 * As brincadeiras de escuta de R0 (rimas, palmas, primeiro som, fala de tatu) NÃO são mais uma etapa antes das letras:
 * viraram aquecimentos curtos dentro das revisões do alfabeto. As fases antigas continuam no banco (`FASES_R0`), assim como
 * as revisões antigas do alfabeto em ordem alfabética (`FASES_ALFABETO_REVISOES_ANTIGAS`, fora da jornada).
 */
const R1_NA_JORNADA = ['R1-F02', 'R1-F03', 'R1-F06', 'R1-F07'];
const FASES_VOGAIS = FASES_R1.filter((f) => R1_NA_JORNADA.includes(f.id));
const FASES_MEU_NOME = FASES_R0.filter((f) => f.id === 'R0-F01');

/** D031: letras e lições alternadas (cada fase da letra logo antes da lição do som dela; revisões no fim de cada bloco). */
export const FASES_LETRAS_E_SONS: Fase[] = (() => {
  const al = Object.fromEntries(FASES_ALFABETO.map((f) => [f.id, f]));
  const letraDaLicao = Object.fromEntries(Object.entries(LICAO_DA_LETRA).map(([letra, tf]) => [tf, letra]));
  const revisaoDepois = Object.fromEntries(BLOCOS_ALFABETO.filter((b) => b.depoisDe).map((b) => [b.depoisDe!, b.id]));
  const out: Fase[] = [];
  for (const tf of FASES_TF) {
    if (letraDaLicao[tf.id]) out.push(al[faseDaLetra(letraDaLicao[tf.id])]);
    out.push(tf);
    if (revisaoDepois[tf.id]) out.push(al[revisaoDepois[tf.id]]);
  }
  const ultimo = BLOCOS_ALFABETO[BLOCOS_ALFABETO.length - 1];
  for (const letra of ultimo.letras) out.push(al[faseDaLetra(letra)]);
  out.push(al[ultimo.id]);
  const faltam = FASES_ALFABETO.filter((f) => !out.includes(f));
  if (faltam.length || out.some((f) => !f)) throw new Error(`Jornada D031 incompleta: ${faltam.map((f) => f.id).join(', ')}`);
  return out;
})();

export const FASES: Fase[] = [...FASES_LETRAS_E_SONS, ...FASES_VOGAIS, ...FASES_R2A, ...FASES_MEU_NOME];
export const FASE_POR_ID: Record<string, Fase> = Object.fromEntries(FASES.map((f) => [f.id, f]));

export const REGIOES: Regiao[] = [
  {
    id: 'AL', etapa: 'Alfabeto', nome: 'Trilha do Alfabeto', perguntaGuia: 'Que som cada letra tem?', cenario: 'quintal',
    mapa: { x: 17, y: 36 }, fases: FASES_ALFABETO.map((f) => f.id), selo: 'Alfabeto Completo', chefe: 'Festa do Alfabeto',
    zumZumViraAmigo: 'O Zum-Zum seguiu a trilha inteira e aprendeu que cada letra tem o seu som.',
    ganchoProxima: 'Agora as vogais vão mostrar os outros sons delas!'
  },
  {
    id: 'TF', etapa: 'Ler e escrever', nome: 'Trilha dos Sons', perguntaGuia: 'Como os sons viram palavras?', cenario: 'biblioteca',
    mapa: { x: 46.5, y: 54 }, fases: FASES_TF.map((f) => f.id), selo: 'Leitura dos Sons', chefe: 'Revisão dos sons que estouram',
    zumZumViraAmigo: 'O Zum-Zum juntou os sons devagar, até o fim, e leu a primeira frase.',
    ganchoProxima: 'Faltam só algumas letras para a Festa do Alfabeto!'
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
