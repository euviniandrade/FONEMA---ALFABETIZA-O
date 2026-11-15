/**
 * Migração dos dados salvos (D030): versão 1 → 2, SEM PERDER PROGRESSO.
 * O que muda na versão 2:
 *  - cada tentativa ganha `tipo` (avaliada × exposição × autorrelato) e `mecanica`, deduzidos pela cena;
 *  - a firmeza (P) de cada habilidade é refeita só com as tentativas avaliadas;
 *  - habilidade que estava "dominada" só por exposição/autorrelato continua com tudo o que a criança ganhou
 *    (selos, moedinhas, fases, revisão), mas recebe a etiqueta `aConfirmar` para o adulto;
 *  - fases concluídas ganham `dominadaEm` quando todas as habilidades estão dominadas de verdade.
 * Nada é apagado: fases, moedinhas, conquistas, itens, contadores e as próprias tentativas ficam como estão.
 * Função pura e idempotente (rodar duas vezes dá o mesmo resultado).
 */
import { FASES, HABILIDADE_POR_ID } from '@fonema/conteudo';
import type { ConfigPlataforma } from '@fonema/conteudo';
import type { EstadoHabilidade, Progresso } from './estado.ts';
import { avaliarDominio, recalcularP } from './dominio.ts';
import { normalizarTentativa } from './tentativas.ts';
import { marcarFasesDominadas } from './jornada.ts';

export const VERSAO_PROGRESSO = 2;

/** Habilidades confirmadas por prova de fase (chefe vencido ou prova-relâmpago aprovada). */
function confirmadasPorProva(p: Progresso): Set<string> {
  const out = new Set<string>();
  for (const f of FASES) {
    const pf = p.fases?.[f.id];
    if (pf?.estado === 'concluida' && (pf.chefe?.passou || pf.expressa)) f.habilidades.forEach((h) => out.add(h));
  }
  return out;
}

export function migrarProgresso(bruto: Progresso, cfg: ConfigPlataforma): Progresso {
  if (!bruto || (bruto.versao as number) >= VERSAO_PROGRESSO) return bruto;
  const provadas = confirmadasPorProva(bruto);
  const habilidades: Record<string, EstadoHabilidade> = {};
  for (const [id, h] of Object.entries(bruto.habilidades ?? {})) {
    const tentativas = (h.tentativas ?? []).map((t) => normalizarTentativa(t));
    const refeita = recalcularP(tentativas);
    const exige = HABILIDADE_POR_ID[id]?.exigePseudo ?? false;
    const novo: EstadoHabilidade = { ...h, tentativas, p: refeita };
    if (h.dominadaEm) {
      const av = avaliarDominio(novo, cfg.dominio, exige);
      const pseudoOk = !exige || av.pseudoCertas >= cfg.dominio.pseudoMin;
      const confirmada = av.dominado || (provadas.has(id) && pseudoOk);
      // prova de fase vale como evidência: a firmeza guardada (que a prova elevou) fica
      if (confirmada) novo.p = Math.max(refeita, h.p ?? 0);
      else novo.aConfirmar = true;
    }
    habilidades[id] = novo;
  }
  const p: Progresso = { ...bruto, versao: VERSAO_PROGRESSO, habilidades, sondagens: bruto.sondagens ?? [] };
  return marcarFasesDominadas(p, bruto.ultimaSessao ?? bruto.criadoEm ?? 0);
}
