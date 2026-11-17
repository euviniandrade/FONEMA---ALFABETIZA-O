/**
 * D032 itens 1 e 2 — tutorial "A grande aventura" e painel guia. Funções puras (a tela só desenha).
 *
 * - Tutorial: abre sozinho UMA vez, para quem ainda não fez nenhuma missão; pode ser pulado (adulto) e retomado no passo em
 *   que parou; depois de visto ou pulado não abre mais sozinho (reabre pelo botão "Como jogar?"). Quem já jogava antes desta
 *   versão não é interrompido: o botão "Como jogar?" fica marcado como novidade até ver. Sem migração de versão: o campo
 *   `tutorial` é opcional (progresso antigo sem ele = nunca viu).
 * - O tutorial NÃO registra tentativa nenhuma: o mini-exercício (um toque e um arraste) é só para aprender a mexer (regra 4).
 * - Caminho: em que etapa (conteudo/caminho.ts) a criança está, pela fase atual da jornada.
 * - Missão: a barrinha da missão de hoje (passos da fase atual) e o resumo da última missão (estrelinhas e selos).
 *   As estrelinhas são retorno de desempenho para a criança, não critério de domínio (o domínio é do dominio.ts).
 */
import { ETAPAS_DO_CAMINHO, FASES, FASE_POR_ID, type EtapaCaminho } from '@fonema/conteudo';
import type { Progresso, ResumoMissao, Tentativa } from './estado.ts';
import { diaDe } from './estado.ts';
import { ehAvaliada } from './tentativas.ts';

/** Quantos passos o tutorial tem (mundo, caminho, como mexer, prêmios, jogos, primeira missão). */
export const PASSOS_TUTORIAL = 6;

/** O tutorial deve abrir sozinho? Só para quem nunca fez missão e nunca viu nem pulou. */
export function tutorialPendente(p: Pick<Progresso, 'tutorial' | 'sessoesFeitas'>): boolean {
  return !p.tutorial?.vistoEm && !p.tutorial?.puladoEm && p.sessoesFeitas === 0;
}

/** Nunca viu o tutorial (nem pulou): o botão "Como jogar?" fica marcado como novidade. */
export function tutorialNovo(p: Pick<Progresso, 'tutorial'>): boolean {
  return !p.tutorial?.vistoEm && !p.tutorial?.puladoEm;
}

/** Passo em que o tutorial recomeça (retomar de onde parou; visto/pulado ou reaberto pelo botão = do começo). */
export function passoParaRetomar(p: Pick<Progresso, 'tutorial'>): number {
  if (!p.tutorial || p.tutorial.vistoEm || p.tutorial.puladoEm) return 0;
  return Math.max(0, Math.min(PASSOS_TUTORIAL - 1, p.tutorial.passo ?? 0));
}

/** Anota o andamento do tutorial. `fim`: 'visto' (chegou ao fim) ou 'pulado' (adulto pulou). Nada mais muda no progresso. */
export function marcarTutorial(p: Progresso, ev: { passo?: number; fim?: 'visto' | 'pulado' }, agora: number): Progresso {
  const t = { ...(p.tutorial ?? {}) };
  if (ev.passo !== undefined && !t.vistoEm && !t.puladoEm) t.passo = Math.max(0, Math.min(PASSOS_TUTORIAL - 1, ev.passo));
  if (ev.fim === 'visto') { t.vistoEm = t.vistoEm ?? agora; t.passo = undefined; }
  if (ev.fim === 'pulado' && !t.vistoEm) { t.puladoEm = t.puladoEm ?? agora; t.passo = undefined; }
  t.vezes = (t.vezes ?? 0) + (ev.fim ? 1 : 0);
  return { ...p, tutorial: t };
}

/* ------------------------------------------------------------ caminho ------------------------------------------------------------ */

export type EstadoEtapa = 'feita' | 'agora' | 'depois' | 'trancada';

/** Índice da etapa de uma fase da jornada (fases fora da jornada: a primeira etapa). */
export function etapaDaFase(faseId: string): number {
  const i = FASES.findIndex((f) => f.id === faseId);
  if (i < 0) return 0;
  const k = ETAPAS_DO_CAMINHO.findIndex((e) => e.ate && FASES.findIndex((f) => f.id === e.ate) >= i);
  return k < 0 ? 0 : k;
}

/** Etapas do caminho com o estado de cada uma para esta criança. */
export function estadoDoCaminho(p: Pick<Progresso, 'faseAtual' | 'fases'>): { etapa: EtapaCaminho; estado: EstadoEtapa }[] {
  const jornadaFeita = FASES.every((f) => p.fases[f.id]?.estado === 'concluida');
  const atual = jornadaFeita ? -1 : etapaDaFase(p.faseAtual);
  return ETAPAS_DO_CAMINHO.map((etapa, i) => ({
    etapa,
    estado: etapa.futura ? 'trancada' : jornadaFeita || i < atual ? 'feita' : i === atual ? 'agora' : 'depois'
  }));
}

/* ------------------------------------------------------------- missão ------------------------------------------------------------- */

/** Passos da missão de uma fase (as cenas da fase; a sessão ainda pode somar a revisão e a pausa). */
export function passosDaMissao(faseId: string): number {
  const f = FASE_POR_ID[faseId];
  return f ? Math.max(1, f.cenas.length) : 1;
}

/** A barrinha da missão de hoje, para a vila e as trilhas. */
export function missaoDeHoje(p: Pick<Progresso, 'faseAtual' | 'ultimaMissao' | 'ultimaSessao'>, agora: number): { faseId: string; passos: number; feitaHoje: boolean } {
  const feita = p.ultimaMissao?.em ?? p.ultimaSessao;
  return { faseId: p.faseAtual, passos: passosDaMissao(p.faseAtual), feitaHoje: feita !== undefined && diaDe(feita) === diaDe(agora) };
}

/**
 * Estrelinhas da missão (1 a 3) pelas respostas CONFERIDAS da sessão: 3 = quase tudo certo de primeira e sem ajuda (≥ 80%),
 * 2 = metade ou mais (≥ 50%), 1 = fez a missão. Sem resposta conferida (só apresentação), 1 estrela pela participação.
 * Limites **[DP]**; só aparecem para a criança, nunca entram no domínio.
 */
export function estrelasDaMissao(tentativas: Tentativa[]): 1 | 2 | 3 {
  const av = tentativas.filter((t) => ehAvaliada(t) && !t.revisao);
  if (!av.length) return 1;
  const sozinho = av.filter((t) => t.acertou && !t.comAjuda && (t.tentativaNumero ?? 1) <= 1).length / av.length;
  return sozinho >= 0.8 ? 3 : sozinho >= 0.5 ? 2 : 1;
}

export function resumoDaMissao(args: { faseId: string; atividades: number; tentativas: Tentativa[]; selos: string[]; faseConcluida: boolean }, agora: number): ResumoMissao {
  return { faseId: args.faseId, em: agora, desafios: args.atividades, estrelas: estrelasDaMissao(args.tentativas), selos: args.selos, faseConcluida: args.faseConcluida };
}
