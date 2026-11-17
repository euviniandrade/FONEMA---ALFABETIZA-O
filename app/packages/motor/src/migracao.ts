/**
 * Migração dos dados salvos, SEM PERDER PROGRESSO.
 *
 * Versão 3 → 4 (17/11, Trilha dos Sons TF-23…TF-25 na jornada, antes das letras R…W e da Festa): a mesma regra da versão 3
 * (`reordenarJornada`): nada concluído se desfaz, as lições novas entram trancadas e a fase atual é a primeira que falta na
 * ordem nova (quem já tinha passado da revisão P…G volta para TF-23, a primeira lição nova).
 *
 * Versão 2 → 3 (D031, letras e sons alternados): a ordem da jornada mudou. Fases concluídas continuam concluídas e as liberadas
 * pelo nível inicial continuam liberadas; fases novas (revisões do alfabeto por bloco) entram trancadas; a fase atual é
 * recalculada pela nova ordem (a primeira que ainda falta) e é a única aberta de novo (as outras, não concluídas, voltam a
 * esperar a vez). Entradas de fases que saíram da jornada (revisões antigas AL-R1…AL-R4) ficam guardadas como estão.
 *
 * Versão 1 → 2 (D030):
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
import type { EstadoHabilidade, Progresso, ProgressoFase } from './estado.ts';
import { avaliarDominio, recalcularP } from './dominio.ts';
import { normalizarTentativa } from './tentativas.ts';
import { marcarFasesDominadas } from './jornada.ts';

export const VERSAO_PROGRESSO = 4;

/** Habilidades confirmadas por prova de fase (chefe vencido ou prova-relâmpago aprovada). */
function confirmadasPorProva(p: Progresso): Set<string> {
  const out = new Set<string>();
  for (const f of FASES) {
    const pf = p.fases?.[f.id];
    if (pf?.estado === 'concluida' && (pf.chefe?.passou || pf.expressa)) f.habilidades.forEach((h) => out.add(h));
  }
  return out;
}

/**
 * D031: refaz os estados das fases pela ordem ATUAL de `FASES` (função pura e idempotente). Nada concluído é desfeito.
 */
export function reordenarJornada(p: Progresso, agora: number): Progresso {
  const fases: Progresso['fases'] = {};
  // quem começou "já conhecendo as letras" (D026) tem a Trilha A–Z inteira liberada, inclusive as revisões novas
  const pulaAlfabeto = !!p.nivelInicial && p.nivelInicial !== 'zero';
  const antes = (id: string, regiao: string): ProgressoFase => {
    const a = p.fases[id] ?? { estado: 'bloqueada' as const, sessoes: 0 };
    return pulaAlfabeto && regiao === 'AL' && a.estado !== 'concluida' && !a.liberada ? { ...a, estado: 'aberta', liberada: true, abertaEm: a.abertaEm ?? agora } : a;
  };
  const pendente = FASES.find((f) => antes(f.id, f.regiao).estado !== 'concluida' && !antes(f.id, f.regiao).liberada);
  for (const f of FASES) {
    const a = antes(f.id, f.regiao);
    if (a.estado === 'concluida' || a.liberada) fases[f.id] = a;
    else if (f.id === pendente?.id) fases[f.id] = { ...a, estado: 'aberta', abertaEm: a.abertaEm ?? agora };
    else fases[f.id] = { ...a, estado: 'bloqueada' };
  }
  // fases que saíram da jornada: guardadas como estão (no fim, para não mudar a ordem das que estão na jornada)
  for (const [id, f] of Object.entries(p.fases)) if (!fases[id]) fases[id] = f;
  return { ...p, fases, faseAtual: pendente?.id ?? FASES[FASES.length - 1].id };
}

export function migrarProgresso(bruto: Progresso, cfg: ConfigPlataforma): Progresso {
  if (!bruto || (bruto.versao as number) >= VERSAO_PROGRESSO) return bruto;
  const v2 = (bruto.versao as number) >= 2 ? bruto : migrarV1(bruto, cfg);
  return { ...reordenarJornada(v2, bruto.ultimaSessao ?? bruto.criadoEm ?? 0), versao: VERSAO_PROGRESSO };
}

function migrarV1(bruto: Progresso, cfg: ConfigPlataforma): Progresso {
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
  const p: Progresso = { ...bruto, versao: 2, habilidades, sondagens: bruto.sondagens ?? [] };
  return marcarFasesDominadas(p, bruto.ultimaSessao ?? bruto.criadoEm ?? 0);
}
