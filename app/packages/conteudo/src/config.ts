/**
 * Padrões PROVISÓRIOS do MVP, até o dono responder às perguntas da revisão
 * (docs/revisao/04-perguntas-para-o-dono.md). Tudo aqui pode ser mudado sem mexer em código:
 * a área do adulto (Configurações) grava por cima destes valores.
 */
export interface ConfigPlataforma {
  /** P1: 'surpresa' = item chega depois da conquista e a barra mostra o objetivo de aprendizagem (P1-b). */
  recompensas: { modo: 'surpresa' | 'anunciada' };
  /** P2-b: sem ranking na tela da criança. */
  ranking: { naTelaDaCrianca: boolean };
  /** P7-b: Lojinha na vila e no fim da sessão; "Minhas Conquistas" na entrada da fase. */
  lojinha: { naVila: boolean; noFimDaSessao: boolean; naEntradaDaFase: boolean };
  conquistas: { naEntradaDaFase: boolean };
  /** P8-b: na lição, frente + raio-X lateral; 360° e "dentro da boca" só em "Conheça seu corpo". */
  espelho: { licao: ('frente' | 'lado')[]; conhecaSeuCorpo: ('frente' | 'lado' | 'dentro' | 'corpo')[] };
  /** Economia fixa (jogo-completo README §3; D002). */
  moedinhas: { atividade: number; marcoDominio: number; regiao: number; tetoDia: number };
  /** Critério de domínio (doc. mestre §4.5). */
  dominio: { pMin: number; tentativasMin: number; sessoesMin: number; ultimas: number; acertosNasUltimas: number; pseudoMin: number };
  /** Revisão espaçada: Jardim da Revisão (dias). */
  revisao: { intervalosDias: number[]; maxItensPorSessao: number };
  /** Validação do professor: sem resposta em X horas, vale o critério de domínio. */
  demonstracao: { horasParaValerCriterio: number };
  /** Voz: 'navegador' simula com speechSynthesis; 'pre-gerada' usa os mp3 das vozes oficiais quando existirem. */
  voz: { provedor: 'navegador' | 'pre-gerada'; velocidade: number };
  /** Modo demonstração: libera mais de uma sessão por dia e conta 1 sessão como 2 (para testar a jornada inteira). */
  modoDemonstracao: boolean;
}

export const CONFIG_PADRAO: ConfigPlataforma = {
  recompensas: { modo: 'surpresa' },
  ranking: { naTelaDaCrianca: false },
  lojinha: { naVila: true, noFimDaSessao: true, naEntradaDaFase: false },
  conquistas: { naEntradaDaFase: true },
  espelho: { licao: ['frente', 'lado'], conhecaSeuCorpo: ['frente', 'lado', 'dentro', 'corpo'] },
  moedinhas: { atividade: 1, marcoDominio: 5, regiao: 10, tetoDia: 12 },
  dominio: { pMin: 0.95, tentativasMin: 8, sessoesMin: 2, ultimas: 5, acertosNasUltimas: 4, pseudoMin: 2 },
  revisao: { intervalosDias: [1, 2, 4, 8, 16, 32, 60], maxItensPorSessao: 4 },
  demonstracao: { horasParaValerCriterio: 72 },
  voz: { provedor: 'pre-gerada', velocidade: 0.95 },
  modoDemonstracao: false
};

export function mesclarConfig(base: ConfigPlataforma, parcial: Partial<ConfigPlataforma> | undefined): ConfigPlataforma {
  if (!parcial) return base;
  const out: any = { ...base };
  for (const [k, v] of Object.entries(parcial)) {
    out[k] = v && typeof v === 'object' && !Array.isArray(v) ? { ...(base as any)[k], ...v } : v;
  }
  return out as ConfigPlataforma;
}
