/**
 * Critério de domínio (doc. mestre §4.5; jogo-completo README §3):
 *  (1) prática: P(domínio) ≥ 0,95, ≥ 8 tentativas em ≥ 2 sessões, 4 das últimas 5 certas
 *      e, nas habilidades de decodificação, ≥ 2 pseudopalavras certas;
 *  (2–4) generalização, transferência e retenção 24 h–7 d entram pela revisão espaçada (revisao.ts).
 * P(domínio) por BKT (Bayesian Knowledge Tracing) com parâmetros conservadores.
 */
import type { ConfigPlataforma } from '@fonema/conteudo';
import type { EstadoHabilidade, Tentativa } from './estado.ts';

export const BKT = { p0: 0.15, transicao: 0.2, chute: 0.25, deslize: 0.1 };

/** Atualiza P(domínio) com uma tentativa. Acerto com ajuda conta como meio acerto. */
export function atualizarP(p: number, acertou: boolean, comAjuda = false): number {
  const { transicao, chute, deslize } = BKT;
  let post: number;
  if (acertou && !comAjuda) {
    post = (p * (1 - deslize)) / (p * (1 - deslize) + (1 - p) * chute);
  } else if (acertou && comAjuda) {
    const pc = (p * (1 - deslize)) / (p * (1 - deslize) + (1 - p) * chute);
    const pe = (p * deslize) / (p * deslize + (1 - p) * (1 - chute));
    post = (pc + pe) / 2;
  } else {
    post = (p * deslize) / (p * deslize + (1 - p) * (1 - chute));
  }
  return Math.min(0.999, post + (1 - post) * transicao);
}

export function novaHabilidade(): EstadoHabilidade {
  return { tentativas: [], p: BKT.p0 };
}

export function registrarTentativa(h: EstadoHabilidade, t: Tentativa): EstadoHabilidade {
  return { ...h, tentativas: [...h.tentativas, t], p: atualizarP(h.p, t.acertou, t.comAjuda) };
}

export interface AvaliacaoDominio {
  dominado: boolean;
  p: number;
  tentativas: number;
  sessoes: number;
  acertosRecentes: number;
  pseudoCertas: number;
  /** O que ainda falta, em linguagem de adulto (painel do professor). */
  falta: string[];
}

export function avaliarDominio(h: EstadoHabilidade | undefined, cfg: ConfigPlataforma['dominio'], exigePseudo: boolean): AvaliacaoDominio {
  const ts = h?.tentativas ?? [];
  const p = h?.p ?? BKT.p0;
  const sessoes = new Set(ts.map((t) => t.sessao)).size;
  const ultimas = ts.slice(-cfg.ultimas);
  const acertosRecentes = ultimas.filter((t) => t.acertou && !t.comAjuda).length;
  const pseudoCertas = ts.filter((t) => t.pseudo && t.acertou && !t.comAjuda).length;
  const falta: string[] = [];
  if (ts.length < cfg.tentativasMin) falta.push(`mais ${cfg.tentativasMin - ts.length} tentativa(s)`);
  if (sessoes < cfg.sessoesMin) falta.push(`treinar em mais ${cfg.sessoesMin - sessoes} sessão(ões)`);
  if (acertosRecentes < cfg.acertosNasUltimas) falta.push(`${cfg.acertosNasUltimas} acertos nas últimas ${cfg.ultimas}`);
  if (p < cfg.pMin) falta.push(`firmeza ${Math.round(p * 100)}% (meta ${Math.round(cfg.pMin * 100)}%)`);
  if (exigePseudo && pseudoCertas < cfg.pseudoMin) falta.push(`${cfg.pseudoMin - pseudoCertas} pseudopalavra(s)`);
  return { dominado: falta.length === 0, p, tentativas: ts.length, sessoes, acertosRecentes, pseudoCertas, falta };
}

/** Prova-relâmpago (Trilha Expressa) e chefe: proporção de acertos sem ajuda. */
export function proporcao(tentativas: Pick<Tentativa, 'acertou' | 'comAjuda'>[]): number {
  if (!tentativas.length) return 0;
  return tentativas.filter((t) => t.acertou && !t.comAjuda).length / tentativas.length;
}
