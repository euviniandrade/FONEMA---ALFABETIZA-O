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
import { ETAPAS_DO_CAMINHO, FALAS, FASES, FASE_POR_ID, type EtapaCaminho, type Fala } from '@fonema/conteudo';
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

/**
 * D036 (dono, 26/11): a criança pode fazer VÁRIAS missões no mesmo dia. Quantas já fez hoje (0 se o contador é de outro dia).
 * Progresso antigo sem o contador: a última missão de hoje vale 1 (não dá para saber se foram mais).
 */
export function missoesHoje(p: Pick<Progresso, 'missoesDoDia' | 'ultimaMissao' | 'ultimaSessao'>, agora: number): number {
  const hoje = diaDe(agora);
  if (p.missoesDoDia) return p.missoesDoDia.dia === hoje ? p.missoesDoDia.n : 0;
  const feita = p.ultimaMissao?.em ?? p.ultimaSessao;
  return feita !== undefined && diaDe(feita) === hoje ? 1 : 0;
}

/** Soma uma missão ao contador do dia (no fecharSessao). Só contagem: domínio, revisão e moedinhas não olham para ele. */
export function contarMissao(p: Progresso, agora: number): Progresso {
  return { ...p, missoesDoDia: { dia: diaDe(agora), n: missoesHoje(p, agora) + 1 } };
}

/**
 * A missão de agora, para a vila, as trilhas e a pílula. `feitasHoje` = quantas já foram feitas hoje; `numero` = qual é esta
 * no dia (1ª, 2ª…). `feitaHoje` fica por compatibilidade: diz só que JÁ houve missão hoje — a próxima continua disponível (D036).
 */
export function missaoDeHoje(p: Pick<Progresso, 'faseAtual' | 'ultimaMissao' | 'ultimaSessao' | 'missoesDoDia'>, agora: number): { faseId: string; passos: number; feitaHoje: boolean; feitasHoje: number; numero: number } {
  const feitasHoje = missoesHoje(p, agora);
  return { faseId: p.faseAtual, passos: passosDaMissao(p.faseAtual), feitaHoje: feitasHoje > 0, feitasHoje, numero: feitasHoje + 1 };
}

/** D036 **[DP]**: depois de quantas missões no mesmo dia o fim sugere uma pausa (só sugere; nunca bloqueia). */
export const PAUSA_DEPOIS_DE = 3;

/** D036: convite para a próxima missão, com a fala JÁ GRAVADA do Tales (manifesto: "tales|Vamos continuar a missão?"). */
export const CONVITE_PROXIMA: Fala = { quem: 'tales', texto: 'Vamos continuar a missão?' };

/**
 * D036: como o fim da missão (C9) fecha. Só falas já gravadas; nenhuma fala nova, nenhuma voz do navegador.
 *  - Há outra missão para fazer agora e ainda não deu a hora da pausa: o fim NÃO diz "amanhã" (não seria verdade). Fica o gancho
 *    da fase quando ele não fala em amanhã (ex.: "Tem um lago lá na frente…"); senão, o convite do Tales. Sem o "Tchau… a tela vai
 *    descansar" (o botão "Próxima missão" está ali).
 *  - Pausa (≥ PAUSA_DEPOIS_DE missões hoje), chefe que pede treino "outro dia" ou jornada sem próxima: o fim de antes (gancho ou
 *    "Amanhã a gente lembra!" + "Tchau… a tela vai descansar e você também."), que vira a sugestão de pausa.
 *  - `proxima`: mostrar o botão "Próxima missão" (some só quando não há próxima e quando o chefe pediu "outro dia").
 */
export function fimDaMissao(args: { fase: { gancho: Fala }; faseConcluida: boolean; feitasHoje: number; haProxima: boolean; chefeNaoPassou?: boolean }): { gancho: Fala; tchau: boolean; pausa: boolean; proxima: boolean } {
  const antigo: Fala = args.faseConcluida ? args.fase.gancho : { quem: 'sofia', texto: FALAS.ritual.amanha };
  const proxima = args.haProxima && !args.chefeNaoPassou;
  const pausa = args.feitasHoje >= PAUSA_DEPOIS_DE;
  if (!proxima || pausa) return { gancho: antigo, tchau: true, pausa: pausa && proxima, proxima };
  const gancho = args.faseConcluida && !/amanh/i.test(args.fase.gancho.texto) ? args.fase.gancho : CONVITE_PROXIMA;
  return { gancho, tchau: false, pausa: false, proxima };
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
