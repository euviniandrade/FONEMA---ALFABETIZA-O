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
  dominio: {
    pMin: number; tentativasMin: number; sessoesMin: number; ultimas: number; acertosNasUltimas: number; pseudoMin: number;
    /** docs/pedagogia/06 §2 item 5 [DP]: palavras DIFERENTES certas e sem ajuda (leitura e escrita de palavras). Ausente = 3. */
    itensDiferentesMin?: number;
    /** docs/pedagogia/06 §2 item 5 [DP]: tipos de atividade diferentes com acerto (ex.: som → letra e letra → som). Ausente = 2. */
    tiposDeAtividadeMin?: number;
  };
  /** Revisão espaçada: Jardim da Revisão (dias). */
  revisao: { intervalosDias: number[]; maxItensPorSessao: number };
  /** Validação do professor: sem resposta em X horas, vale o critério de domínio. */
  demonstracao: { horasParaValerCriterio: number };
  /** Voz: 'navegador' simula com speechSynthesis; 'pre-gerada' usa os mp3 das vozes oficiais quando existirem. */
  voz: { provedor: 'navegador' | 'pre-gerada'; velocidade: number };
  /**
   * Trilha do Alfabeto (D027). `primeirasPalavrinhas`: assim que as letras conhecidas permitem, a missão ganha uma
   * brincadeira curta de juntar as letras e ler (BABÁ depois do B, BEBÊ depois do E…). Padrão: ligado (o dono ainda vai confirmar).
   */
  alfabeto: { primeirasPalavrinhas: boolean };
  /**
   * Sondagem periódica (D030, etapa 9): fica DEVIDA a cada `aCadaFases` fases concluídas OU a cada `aCadaDias` dias
   * desde a última (o que vier primeiro). 0 desliga o gatilho. `idadeMinima`: abaixo dela a sondagem não é oferecida
   * à criança (o adulto ainda pode abrir). Números = decisão do projeto, a calibrar com uso real.
   */
  sondagem: { aCadaFases: number; aCadaDias: number; idadeMinima: number };
  /**
   * Reforço dirigido (D030, etapa 9; decisão do projeto): um par vira "confusão" com `errosMinPar` trocas;
   * `sessoesSeguidasParaPreRequisito` sessões seguidas com menos de `acertoMinSessao` de acerto sem ajuda mandam
   * a prática de volta ao pré-requisito; a prática recomendada tem até `maxItens` itens.
   */
  reforco: { errosMinPar: number; sessoesSeguidasParaPreRequisito: number; acertoMinSessao: number; maxItens: number };
  /**
   * Alerta para o adulto (decisão do projeto; NÃO é diagnóstico): `sessoesSemDominio` sessões avaliadas na mesma
   * habilidade sem domínio e com menos de `acertoMin` nas últimas `janela` tentativas; mesmo par trocado `trocasMin`
   * vezes; `diasSemJogar` dias parado.
   */
  risco: { sessoesSemDominio: number; acertoMin: number; janela: number; trocasMin: number; diasSemJogar: number };
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
  dominio: { pMin: 0.95, tentativasMin: 8, sessoesMin: 2, ultimas: 5, acertosNasUltimas: 4, pseudoMin: 2, itensDiferentesMin: 3, tiposDeAtividadeMin: 2 },
  revisao: { intervalosDias: [1, 2, 4, 8, 16, 32, 60], maxItensPorSessao: 4 },
  demonstracao: { horasParaValerCriterio: 72 },
  voz: { provedor: 'pre-gerada', velocidade: 0.95 },
  alfabeto: { primeirasPalavrinhas: true },
  sondagem: { aCadaFases: 8, aCadaDias: 30, idadeMinima: 6 },
  reforco: { errosMinPar: 3, sessoesSeguidasParaPreRequisito: 2, acertoMinSessao: 0.5, maxItens: 6 },
  risco: { sessoesSemDominio: 3, acertoMin: 0.6, janela: 10, trocasMin: 4, diasSemJogar: 14 },
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
