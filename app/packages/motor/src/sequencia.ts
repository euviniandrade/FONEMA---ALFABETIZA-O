/**
 * Sequência da jornada SEM PULAR FASES (D021 §2): cada fase só abre depois da anterior.
 * Não existe atalho, compra ou botão que pule fase.
 */
import { FASES, FASE_POR_ID } from '@fonema/conteudo';
import type { Progresso, ProgressoFase } from './estado.ts';

export function progressoInicial(criancaId: string, agora: number): Progresso {
  const fases: Record<string, ProgressoFase> = {};
  FASES.forEach((f, i) => (fases[f.id] = { estado: i === 0 ? 'aberta' : 'bloqueada', sessoes: 0, abertaEm: i === 0 ? agora : undefined }));
  return {
    criancaId,
    versao: 4,
    faseAtual: FASES[0].id,
    fases,
    habilidades: {},
    desafios: 0,
    termometro: 0,
    moedinhas: { saldo: 0, total: 0, porDia: {} },
    conquistas: {},
    itens: [],
    equipados: [],
    areas: [],
    surpresas: [],
    contadores: {},
    expressa: { regioes: [], ativa: false },
    sondagens: [],
    sessoesFeitas: 0,
    criadoEm: agora
  };
}

/** A primeira missão da jornada (hoje: a letra A) já foi feita? É o que leva ao nível 1. */
export function missaoInicialFeita(p: Progresso): boolean {
  return p.fases[FASES[0].id]?.estado === 'concluida';
}

export function indiceFase(faseId: string): number {
  const i = FASES.findIndex((f) => f.id === faseId);
  if (i < 0) throw new Error(`Fase desconhecida: ${faseId}`);
  return i;
}

export function proximaFase(faseId: string): string | null {
  const i = indiceFase(faseId);
  return FASES[i + 1]?.id ?? null;
}

export function podeEntrar(p: Progresso, faseId: string): boolean {
  const e = p.fases[faseId]?.estado;
  return e === 'aberta' || e === 'concluida';
}

export function fasesConcluidas(p: Progresso): Set<string> {
  return new Set(Object.entries(p.fases).filter(([, f]) => f.estado === 'concluida').map(([id]) => id));
}

/** Conclui a fase e abre SÓ a próxima. Recusa concluir fora de ordem. */
export function concluirFase(p: Progresso, faseId: string, agora: number, opts: { expressa?: boolean } = {}): Progresso {
  const i = indiceFase(faseId);
  // fase liberada pelo nível inicial (D026) é revisão voluntária: pode ser feita fora da sequência e não abre a seguinte
  // (D031: com o nível "já conhece as letras", a Trilha A–Z inteira fica liberada, inclusive letras que vêm depois na jornada)
  const revisao = !!p.fases[faseId]?.liberada;
  for (let k = 0; k < i && !revisao; k++) {
    // D026: fases liberadas pelo nível inicial não travam a sequência (continuam abertas para revisão)
    if (p.fases[FASES[k].id]?.estado !== 'concluida' && !p.fases[FASES[k].id]?.liberada) {
      throw new Error(`Sem pular fases: ${FASES[k].id} ainda não foi concluída.`);
    }
  }
  if (p.fases[faseId]?.estado === 'bloqueada') throw new Error(`Fase bloqueada: ${faseId}`);
  const fases = { ...p.fases, [faseId]: { ...p.fases[faseId], estado: 'concluida' as const, concluidaEm: agora, expressa: !!opts.expressa, liberada: false } };
  const prox = revisao ? null : proximaFase(faseId);
  if (prox && fases[prox] && fases[prox].estado === 'bloqueada') fases[prox] = { ...fases[prox], estado: 'aberta', abertaEm: agora };
  const termometro = Math.max(p.termometro, FASE_POR_ID[faseId].termometro ?? 0);
  // a fase atual é a primeira ainda por fazer DEPOIS do ponto de partida (revisar uma fase liberada não faz a jornada voltar)
  const pendente = FASES.find((f) => fases[f.id]?.estado !== 'concluida' && !fases[f.id]?.liberada);
  // D031: a próxima na ordem pode já estar concluída (progresso salvo na ordem antiga): abre a primeira pendente
  if (pendente && fases[pendente.id]?.estado !== 'aberta') fases[pendente.id] = { ...(fases[pendente.id] ?? { sessoes: 0 }), estado: 'aberta', abertaEm: agora };
  return { ...p, fases, faseAtual: pendente?.id ?? prox ?? faseId, termometro };
}

/** Regiões totalmente concluídas. */
export function regiaoConcluida(p: Progresso, regiao: string): boolean {
  return FASES.filter((f) => f.regiao === regiao).every((f) => p.fases[f.id]?.estado === 'concluida');
}
