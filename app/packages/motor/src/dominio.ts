/**
 * Critério de domínio (doc. mestre §4.5; jogo-completo README §3):
 *  (1) prática: P(domínio) ≥ 0,95, ≥ 8 tentativas em ≥ 2 sessões, 4 das últimas 5 certas
 *      e, nas habilidades de decodificação, ≥ 2 pseudopalavras certas;
 *  (2–4) generalização, transferência e retenção 24 h–7 d entram pela revisão espaçada (revisao.ts).
 * P(domínio) por BKT (Bayesian Knowledge Tracing) com parâmetros conservadores.
 *
 * DOMÍNIO HONESTO (D030, etapa 5): só tentativa AVALIADA entra na conta (a criança respondeu e o app conferiu).
 * Exposição (Letra, Espelho, Traçar) e autorrelato (Falar: "Li!") ficam registradas como PARTICIPAÇÃO: não mexem
 * na firmeza, não somam tentativas, sessões nem pseudopalavras.
 */
import type { ConfigPlataforma } from '@fonema/conteudo';
import type { EstadoHabilidade, Tentativa } from './estado.ts';
import { ehAvaliada } from './tentativas.ts';

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

/** Guarda a tentativa. Só a AVALIADA mexe na firmeza; exposição e autorrelato ficam como participação. */
export function registrarTentativa(h: EstadoHabilidade, t: Tentativa): EstadoHabilidade {
  return { ...h, tentativas: [...h.tentativas, t], p: ehAvaliada(t) ? atualizarP(h.p, t.acertou, t.comAjuda) : h.p };
}

/** Firmeza recalculada do zero, só com as tentativas avaliadas (migração de dados antigos). */
export function recalcularP(tentativas: Tentativa[]): number {
  return tentativas.filter(ehAvaliada).reduce((p, t) => atualizarP(p, t.acertou, t.comAjuda), BKT.p0);
}

export interface AvaliacaoDominio {
  dominado: boolean;
  p: number;
  tentativas: number;
  sessoes: number;
  acertosRecentes: number;
  pseudoCertas: number;
  /** Tentativas de exposição e autorrelato (participação: não contam para o domínio). */
  participacoes: number;
  /** O que ainda falta, em linguagem de adulto (painel do professor). */
  falta: string[];
  /** Falta só a pseudopalavra avaliada (todo o resto do critério está cumprido). */
  soFaltaPseudo: boolean;
}

export function avaliarDominio(h: EstadoHabilidade | undefined, cfg: ConfigPlataforma['dominio'], exigePseudo: boolean): AvaliacaoDominio {
  const todas = h?.tentativas ?? [];
  const ts = todas.filter(ehAvaliada);
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
  const faltaPseudo = exigePseudo && pseudoCertas < cfg.pseudoMin;
  const soFaltaPseudo = faltaPseudo && falta.length === 0;
  if (faltaPseudo) falta.push(`${cfg.pseudoMin - pseudoCertas} pseudopalavra(s) em atividade conferida`);
  return { dominado: falta.length === 0, p, tentativas: ts.length, sessoes, acertosRecentes, pseudoCertas, participacoes: todas.length - ts.length, falta, soFaltaPseudo };
}

/** Dominada DE VERDADE: marcada como dominada e sem a etiqueta "a confirmar". */
export function dominadaDeVerdade(h: EstadoHabilidade | undefined): boolean {
  return !!h?.dominadaEm && !h.aConfirmar;
}

/**
 * Prova-relâmpago (Trilha Expressa) e chefe: proporção de acertos sem ajuda nas tentativas AVALIADAS.
 * Se a prova não teve nenhuma tentativa avaliada (conteúdo só de autorrelato), vale a conta antiga com todas,
 * para a jornada não travar por falta de item conferido.
 */
export function proporcao(tentativas: Tentativa[]): number {
  const avaliadas = paraProva(tentativas);
  if (!avaliadas.length) return 0;
  return avaliadas.filter((t) => t.acertou && !t.comAjuda).length / avaliadas.length;
}

/** As tentativas que valem numa prova: as avaliadas; se não houver nenhuma, todas. */
export function paraProva<T extends Tentativa>(tentativas: T[]): T[] {
  const avaliadas = tentativas.filter(ehAvaliada);
  return avaliadas.length ? avaliadas : tentativas;
}
