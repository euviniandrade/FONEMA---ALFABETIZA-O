/**
 * Revisão espaçada (Jardim da Revisão, N5): 1 · 2 · 4 · 8 · 16 · 32 · 60 dias.
 * Acertou na data → sobe um degrau. Errou → volta ao começo (sem perder nada visível para a criança).
 */
import type { EstadoHabilidade } from './estado.ts';
import { DIA_MS } from './estado.ts';

export function agendarRevisao(h: EstadoHabilidade, agora: number, intervalos: number[]): EstadoHabilidade {
  return { ...h, revisao: { indice: 0, proxima: agora + intervalos[0] * DIA_MS } };
}

export function resultadoRevisao(h: EstadoHabilidade, acertou: boolean, agora: number, intervalos: number[]): EstadoHabilidade {
  const atual = h.revisao ?? { indice: 0, proxima: agora };
  const desde = agora - (h.dominadaEm ?? agora);
  const retencaoOk = atual.retencaoOk || (acertou && desde >= DIA_MS && desde <= 7 * DIA_MS) || (acertou && desde > 7 * DIA_MS);
  const indice = acertou ? Math.min(atual.indice + 1, intervalos.length - 1) : 0;
  return { ...h, revisao: { indice, proxima: agora + intervalos[indice] * DIA_MS, retencaoOk } };
}

/** Habilidades dominadas com revisão vencida, das mais atrasadas para as menos. */
export function revisoesVencidas(habs: Record<string, EstadoHabilidade>, agora: number, max: number): string[] {
  return Object.entries(habs)
    .filter(([, h]) => h.dominadaEm && h.revisao && h.revisao.proxima <= agora)
    .sort((a, b) => (a[1].revisao!.proxima - b[1].revisao!.proxima))
    .slice(0, max)
    .map(([id]) => id);
}
