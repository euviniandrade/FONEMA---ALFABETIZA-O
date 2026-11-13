import type { Fase, Regiao } from './tipos.ts';
import { FASES_R0 } from './fases/r0.ts';
import { FASES_R1 } from './fases/r1.ts';
import { FASES_R2A } from './fases/r2a.ts';

/** Ordem da jornada: a sequência de fases é ESTA (D021: sem pular fases). */
export const FASES: Fase[] = [...FASES_R0, ...FASES_R1, ...FASES_R2A];
export const FASE_POR_ID: Record<string, Fase> = Object.fromEntries(FASES.map((f) => [f.id, f]));

export const REGIOES: Regiao[] = [
  {
    id: 'R0', nome: 'Quintal da Sofia', perguntaGuia: 'Quem sou eu e quem vive comigo?', cenario: 'quintal',
    mapa: { x: 38, y: 74 }, fases: FASES_R0.map((f) => f.id), selo: 'Leitura do Quintal', chefe: 'Festa das Rimas',
    zumZumViraAmigo: 'O Zum-Zum ouviu a festa inteira quietinho e aprendeu que quem escuta até o fim descobre a rima.',
    ganchoProxima: 'Uma garrafa chegou com um mapa e 5 sinais: as vogais!'
  },
  {
    id: 'R1', nome: 'Ilha das Vogais', perguntaGuia: 'Que sons as letras fazem?', cenario: 'ilha',
    mapa: { x: 61, y: 82 }, fases: FASES_R1.map((f) => f.id), selo: 'Leitura da Ilha', chefe: 'O Farol Apagado',
    zumZumViraAmigo: 'O Zum-Zum descobriu que olhar a boca ajuda a ouvir e ganhou um lugar no barco do Bolota.',
    ganchoProxima: 'A luz do farol chegou à mata, e de lá veio um som comprido: /mmm/.'
  },
  {
    id: 'R2a', nome: 'Mata Atlântica · Vale do M-L-F', perguntaGuia: 'Como as letras viram palavras?', cenario: 'mata',
    mapa: { x: 72, y: 63 }, fases: FASES_R2A.map((f) => f.id), selo: 'Leitura da Mata', chefe: 'Cachoeira das Sílabas',
    zumZumViraAmigo: 'O Zum-Zum aprendeu que devagar e até o fim a palavra aparece, e ajudou a carregar as letras do guia.',
    ganchoProxima: 'A ponte do rio está em obras; do outro lado, um tucano espia e chama.'
  }
];
export const REGIAO_POR_ID: Record<string, Regiao> = Object.fromEntries(REGIOES.map((r) => [r.id, r]));
