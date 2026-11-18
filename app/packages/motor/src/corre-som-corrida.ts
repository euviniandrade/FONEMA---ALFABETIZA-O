/**
 * CORRE-SOM EM CORRIDA (D035; fila do dono nº 27, ponto 3). Pedido do dono (18/11): "O jogo não pode ficar parando: automático,
 * rápido e instantâneo; ela tem que identificar. Entrou pela porta errada: um xizinho e perde ponto. Tempo para cada atividade,
 * com objetivo e premiação… moedinha conta ponto, detalhes contam ponto, letra certa ganha bastante ponto, letra errada perde
 * ponto. E vamos elevando o nível." Substitui o "a pista desacelera e para antes de cada escolha" (D032 §4; pesquisa 47 G1).
 *
 * Regras puras (a tela só desenha): níveis, pontos, estrelas, moedinhas da Lojinha, ondas de arcos e a tentativa gravada.
 * PONTOS, ESTRELAS E TEMPO NUNCA CONTAM COMO DOMÍNIO (regra 4): só a passagem pelo arco vira tentativa avaliada, com
 * `formato: 'corrida'` e o estado da corrida antes dela (tentativas.ts › chuteDeCorrida decide o que não conta).
 * Todos os números são decisão do projeto [DP], a calibrar com uso real.
 */
import type { Progresso, Tentativa } from './estado.ts';
import { FORMATO_CORRIDA } from './tentativas.ts';
import { geradorJogo, montarRodada, posicionarCerta } from './jogos-fonicos.ts';
import type { ItemJogo, OpcaoJogo, VariacaoCorreSom } from './jogos-fonicos.ts';

/* ------------------------------------------------------------ níveis ------------------------------------------------------------ */

export interface NivelCorrida {
  nivel: number;
  /** Duração da corrida (s). */
  segundos: number;
  /** Velocidade da pista (m/s na pista 3D; a reserva 2D usa o mesmo tempo de chegada). */
  velocidade: number;
  /** Arcos por onda (o som toca UMA vez no começo da onda; cada arco é uma escolha). */
  arcosPorOnda: number;
  /** Distrator parecido (R7: f/v, m/n…) quando existe entre os sons ensinados. */
  parecidos: boolean;
  /** Meta de pontos (bater = 2 estrelas, selo da corrida e o próximo nível abre). */
  meta: number;
}

/** [DP] Sobe a velocidade, os arcos por onda, a semelhança dos distratores e a meta; o tempo diminui. */
export const NIVEIS_CORRIDA: NivelCorrida[] = [
  { nivel: 1, segundos: 60, velocidade: 5.5, arcosPorOnda: 2, parecidos: false, meta: 80 },
  { nivel: 2, segundos: 55, velocidade: 6.5, arcosPorOnda: 2, parecidos: true, meta: 110 },
  { nivel: 3, segundos: 50, velocidade: 7.5, arcosPorOnda: 3, parecidos: true, meta: 140 },
  { nivel: 4, segundos: 45, velocidade: 8.5, arcosPorOnda: 3, parecidos: true, meta: 170 },
  { nivel: 5, segundos: 45, velocidade: 9.5, arcosPorOnda: 3, parecidos: true, meta: 200 }
];
export const NIVEL_MAXIMO = NIVEIS_CORRIDA.length;
export const nivelDaCorrida = (n: number): NivelCorrida => NIVEIS_CORRIDA[Math.max(1, Math.min(NIVEL_MAXIMO, Math.floor(n) || 1)) - 1];

/** Distância (m) entre o ponto em que o arco surge e o boneco; o tempo de decisão é DISTANCIA_ARCO / velocidade. */
export const DISTANCIA_ARCO = 26;
/** Distância (m) entre dois arcos da mesma onda. */
export const ESPACO_ENTRE_ARCOS = 12;
/** Tempo (ms) que o arco leva para chegar ao boneco no nível (a reserva 2D usa este mesmo tempo). */
export const tempoDeChegadaMs = (n: NivelCorrida): number => Math.round((DISTANCIA_ARCO / n.velocidade) * 1000);

/* ------------------------------------------------------------ pontos ------------------------------------------------------------ */

/** [DP] Pontos do dono: moedinha +1, detalhe/bônus +2, letra certa +10 (com multiplicador), letra errada −5 (nunca abaixo de 0). */
export const PONTOS = { moeda: 1, bonus: 2, certo: 10, errado: -5 } as const;
/** A cada tantos acertos seguidos, um bônus de sequência (+2). */
export const BONUS_SEQUENCIA_A_CADA = 3;

export interface PlacarCorrida {
  pontos: number;
  /** Acertos seguidos agora (zera no erro). */
  sequencia: number;
  /** Erros seguidos agora (zera no acerto). */
  errosSeguidos: number;
  melhorSequencia: number;
  acertos: number;
  erros: number;
  moedas: number;
  bonus: number;
}
export const placarInicial = (): PlacarCorrida => ({ pontos: 0, sequencia: 0, errosSeguidos: 0, melhorSequencia: 0, acertos: 0, erros: 0, moedas: 0, bonus: 0 });

/** Multiplicador da letra certa pela sequência ANTES do acerto: ×1 (0–2), ×2 (3–5), ×3 (6 ou mais). */
export const multiplicador = (sequencia: number): number => (sequencia >= 6 ? 3 : sequencia >= 3 ? 2 : 1);

export type EventoCorrida = 'certo' | 'errado' | 'moeda' | 'bonus';
export interface Pontuado { placar: PlacarCorrida; delta: number; /** Ganhou também o bônus de sequência neste acerto. */ bonusSequencia: boolean }

/** Aplica um evento ao placar. Nunca deixa os pontos abaixo de zero (o delta mostrado é o que de fato mudou). */
export function pontuar(pl: PlacarCorrida, ev: EventoCorrida): Pontuado {
  const soma = (d: number) => Math.max(0, pl.pontos + d);
  if (ev === 'moeda') { const pontos = soma(PONTOS.moeda); return { placar: { ...pl, pontos, moedas: pl.moedas + 1 }, delta: pontos - pl.pontos, bonusSequencia: false }; }
  if (ev === 'bonus') { const pontos = soma(PONTOS.bonus); return { placar: { ...pl, pontos, bonus: pl.bonus + 1 }, delta: pontos - pl.pontos, bonusSequencia: false }; }
  if (ev === 'errado') {
    const pontos = soma(PONTOS.errado);
    return { placar: { ...pl, pontos, sequencia: 0, errosSeguidos: pl.errosSeguidos + 1, erros: pl.erros + 1 }, delta: pontos - pl.pontos, bonusSequencia: false };
  }
  const sequencia = pl.sequencia + 1;
  const bonusSequencia = sequencia % BONUS_SEQUENCIA_A_CADA === 0;
  const pontos = soma(PONTOS.certo * multiplicador(pl.sequencia) + (bonusSequencia ? PONTOS.bonus : 0));
  return {
    placar: { ...pl, pontos, sequencia, errosSeguidos: 0, melhorSequencia: Math.max(pl.melhorSequencia, sequencia), acertos: pl.acertos + 1, bonus: pl.bonus + (bonusSequencia ? 1 : 0) },
    delta: pontos - pl.pontos, bonusSequencia
  };
}

/** [DP] Estrelas: 1 com metade da meta, 2 ao bater a meta, 3 com uma vez e meia a meta. */
export function estrelasDaCorrida(pontos: number, meta: number): 0 | 1 | 2 | 3 {
  if (pontos >= Math.ceil(meta * 1.5)) return 3;
  if (pontos >= meta) return 2;
  if (pontos >= Math.ceil(meta / 2)) return 1;
  return 0;
}
export const bateuMeta = (pontos: number, meta: number): boolean => pontos >= meta;

/** [DP] Moedinhas da Lojinha por corrida LIVRE: uma por estrela, teto 3 (e o teto do dia de D002, via creditarEmBloco). */
export const MOEDINHAS_POR_CORRIDA_MAX = 3;
export const moedinhasDaCorrida = (estrelas: number): number => Math.max(0, Math.min(MOEDINHAS_POR_CORRIDA_MAX, Math.floor(estrelas)));

/** Nível seguinte: sobe ao bater a meta (até o máximo); senão fica. Nunca desce (sem castigo). */
export const proximoNivel = (nivel: number, pontos: number): number => (bateuMeta(pontos, nivelDaCorrida(nivel).meta) ? Math.min(NIVEL_MAXIMO, nivel + 1) : nivel);

/* ------------------------------------------------------------ ondas ------------------------------------------------------------ */

/** Uma onda: um som (tocado uma vez) e os arcos que vêm em seguida, todos com a mesma resposta em posições sorteadas (R5). */
export interface OndaCorrida { somAlvo: string; arcos: ItemJogo[] }

/**
 * Ondas da corrida LIVRE (Brincar): os alvos e os distratores vêm de `montarRodada` (só sons já ensinados, regra 2; R5–R7) e
 * cada arco extra da onda sorteia de novo a posição da certa, nunca igual à do arco anterior (R5).
 */
export function montarOndas(p: Progresso, variacao: VariacaoCorreSom, nivel: number, pedido: { semente: number; ondas: number; temSom?: (f: string) => boolean }): OndaCorrida[] {
  const nv = nivelDaCorrida(nivel);
  const base = montarRodada(p, 'corre-som', { variacao, semente: pedido.semente, temSom: pedido.temSom, n: pedido.ondas, parecidos: nv.parecidos });
  const r = geradorJogo(pedido.semente * 7 + 13);
  const ant = { pos: -1 };
  return base.map((it) => {
    const arcos: ItemJogo[] = [];
    for (let k = 0; k < nv.arcosPorOnda; k++) {
      const certa = it.opcoes[it.posicaoCerta];
      const { opcoes, pos } = posicionarCerta<OpcaoJogo>(certa, it.opcoes.filter((_, j) => j !== it.posicaoCerta), r, ant);
      arcos.push({ ...it, opcoes, posicaoCerta: pos });
    }
    return { somAlvo: it.somAlvo, arcos };
  });
}

/** Ondas de uma FASE (desafio, revisão, lições de vogal): cada item da fase é uma onda de um arco; acaba quando os itens acabam. */
export const ondasDaFase = (itens: ItemJogo[]): OndaCorrida[] => itens.map((it) => ({ somAlvo: it.somAlvo, arcos: [it] }));

/* ------------------------------------------------------------ registro ------------------------------------------------------------ */

export interface PassagemCorrida {
  item: ItemJogo;
  /** Pista em que o boneco passou (0, 1, 2). */
  pista: number;
  /** Id do registro de cada opção (letra, ou o som da figura) — `idDoRegistro`. */
  idDe: (o: OpcaoJogo) => string;
  sessao: string;
  cena: string;
  contexto: 'livre' | 'desafio' | 'revisao';
  /** ms desde que o arco ficou valendo (o som da onda já tinha tocado inteiro) até a passagem. */
  tempoMs: number;
  em: number;
  /** Placar ANTES desta passagem (a sequência cruza letras: fica gravada na tentativa). */
  antes: Pick<PlacarCorrida, 'sequencia' | 'errosSeguidos'>;
  mexeu: boolean;
  nivel?: number;
  ouviuDeNovo?: number;
  /** A letra certa foi mostrada no canto depois de um ✖ nesta onda (R4: este arco vale "com ajuda"). */
  respostaMostrada?: boolean;
}

/**
 * A passagem pelo arco vira UMA tentativa avaliada (mecânica 'corre-som', formato 'corrida'): alvo, escolhido, tempo, opções,
 * posições, contexto e o estado da corrida. Errar não tem segunda chance no mesmo arco (a pista não para): `acertou` é o arco.
 * Aquecimento (D034) grava exposição. Pontos e moedas não entram aqui (regra 4).
 */
export function tentativaDaCorrida(a: PassagemCorrida): Tentativa {
  const { item } = a;
  const certa = item.opcoes[item.posicaoCerta];
  const escolhida = item.opcoes[a.pista] ?? certa;
  const acertou = a.pista === item.posicaoCerta;
  const ajuda = a.respostaMostrada ? 'resposta-mostrada' as const : 'nenhuma' as const;
  return {
    em: a.em, sessao: a.sessao, habilidade: item.habilidade, cena: a.cena, acertou, ...(acertou && a.respostaMostrada ? { comAjuda: true } : {}),
    tipo: item.aquecimento ? 'exposicao' : 'avaliada', mecanica: 'corre-som', formato: FORMATO_CORRIDA, categoria: item.categoria,
    alvo: a.idDe(certa), escolhido: a.idDe(escolhida), respostas: [a.idDe(escolhida)],
    distratores: item.opcoes.filter((_, j) => j !== item.posicaoCerta).map(a.idDe),
    tempoMs: Math.max(0, Math.round(a.tempoMs)), tentativaNumero: 1, nivelAjuda: ajuda,
    posicaoCerta: item.posicaoCerta, posicaoEscolhida: a.pista, nOpcoes: item.opcoes.length,
    ...(a.ouviuDeNovo ? { ouviuDeNovo: a.ouviuDeNovo } : {}),
    contexto: a.contexto, ...(a.contexto === 'revisao' ? { revisao: true } : {}),
    corrida: { acertosSeguidos: a.antes.sequencia, errosSeguidos: a.antes.errosSeguidos, mexeu: a.mexeu, ...(a.nivel ? { nivel: a.nivel } : {}) }
  };
}
