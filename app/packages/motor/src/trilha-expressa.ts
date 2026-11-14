/**
 * Sondagem lúdica ("Missão das Placas da Vila") e Trilha Expressa (D021 §2–3; jogo-completo/01 §5).
 * Toda criança vive a jornada desde a primeira fase (D027: a letra A), na mesma ordem; quem já sabe passa por prova-relâmpago.
 * O chefe é feito INTEIRO também na Trilha Expressa.
 */
import { FASES, FASE_POR_ID } from '@fonema/conteudo';
import type { ConfigPlataforma } from '@fonema/conteudo';
import type { Progresso } from './estado.ts';
import { concluirFase } from './sequencia.ts';
import { agendarRevisao } from './revisao.ts';
import { novaHabilidade } from './dominio.ts';

/** Degraus da sondagem → regiões que a criança já domina. */
export const DEGRAUS_SONDAGEM = [
  { degrau: 1, habilidade: 'Rima e palmas', regiao: 'R0' },
  { degrau: 2, habilidade: 'Primeiro som', regiao: 'R0' },
  { degrau: 3, habilidade: 'Vogais', regiao: 'R1' },
  { degrau: 4, habilidade: 'Letra ↔ som de consoantes', regiao: 'R2a' },
  { degrau: 5, habilidade: 'Ler palavras CV.CV e 1 pseudopalavra', regiao: 'R2a' }
];

/** maiorDegrau = último degrau vencido (a sondagem para em 2 erros seguidos no mesmo degrau). */
export function regioesDominadas(maiorDegrau: number): string[] {
  const r: string[] = [];
  if (maiorDegrau >= 2) r.push('R0');
  if (maiorDegrau >= 3) r.push('R1');
  if (maiorDegrau >= 5) r.push('R2a');
  return r;
}

export function aplicarSondagem(p: Progresso, maiorDegrau: number, agora: number): Progresso {
  const regioes = regioesDominadas(maiorDegrau);
  return { ...p, expressa: { regioes, ativa: regioes.length > 0, sondagemEm: agora, degrau: maiorDegrau } };
}

export function faseEmExpressa(p: Progresso, faseId: string): boolean {
  const f = FASE_POR_ID[faseId];
  if (!f || f.chefe || faseId === 'R0-F01' || faseId === FASES[0].id) return false; // a primeira missão e os chefes são sempre completos
  return p.expressa.ativa && p.expressa.regioes.includes(f.regiao);
}

export const LIMIAR_PROVA_RELAMPAGO = 0.8;

/**
 * Resultado da prova-relâmpago: passou → fase concluída em ritmo rápido (selos, moedinhas e história valem);
 * não passou → a Trilha Expressa DESACELERA ali (sem "reprovou", sem perda).
 */
export function resultadoProvaRelampago(
  p: Progresso,
  faseId: string,
  acertos: number,
  total: number,
  agora: number,
  cfg: ConfigPlataforma
): { progresso: Progresso; passou: boolean } {
  const passou = total > 0 && acertos / total >= LIMIAR_PROVA_RELAMPAGO;
  if (!passou) return { progresso: { ...p, expressa: { ...p.expressa, ativa: false } }, passou };
  const fase = FASE_POR_ID[faseId];
  let q = concluirFase(p, faseId, agora, { expressa: true });
  const habilidades = { ...q.habilidades };
  for (const h of fase.habilidades) {
    const atual = habilidades[h] ?? novaHabilidade();
    if (!atual.dominadaEm) habilidades[h] = agendarRevisao({ ...atual, p: Math.max(atual.p, cfg.dominio.pMin), dominadaEm: agora }, agora, cfg.revisao.intervalosDias);
  }
  // cada prova-relâmpago aprovada vale os desafios daquela fase (ninguém fica "atrás" em títulos por já saber)
  const desafiosDaFase = fase.cenas.filter((c) => c.atividade).length;
  q = { ...q, habilidades, desafios: q.desafios + desafiosDaFase };
  return { progresso: q, passou };
}
