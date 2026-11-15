/**
 * Ajuda graduada, "ouviu de novo", posição da resposta e chute (D030 etapa 9; docs/pedagogia/06 §1, §4 e §7).
 * Funções puras sobre as tentativas. Os campos vêm de `DetalheTentativa` (estado.ts); quando a mecânica ainda não
 * os grava, o motor deduz o que dá (nível de ajuda pelo número da tentativa) e o resto fica "sem dado".
 */
import type { NivelAjuda, Tentativa } from './estado.ts';
import { NIVEIS_AJUDA } from './estado.ts';
import { ehAvaliada } from './tentativas.ts';

/**
 * Nível de ajuda do item. Gravado pela mecânica (`nivelAjuda`) vale; senão, pela escada atual das mecânicas
 * (docs/pedagogia/06 §4): de primeira = nenhuma; 2ª tentativa = correção contrastiva; 3ª ou mais = caminho;
 * `comAjuda` na 3ª ou depois = resposta mostrada (o brilho).
 */
export function nivelDeAjuda(t: Pick<Tentativa, 'nivelAjuda' | 'tentativaNumero' | 'comAjuda' | 'acertou'>): NivelAjuda {
  if (t.nivelAjuda && NIVEIS_AJUDA.includes(t.nivelAjuda)) return t.nivelAjuda;
  const n = t.tentativaNumero ?? (t.comAjuda ? 2 : 1);
  if (n <= 1) return t.comAjuda ? 'contraste' : 'nenhuma';
  if (n === 2) return 'contraste';
  return t.comAjuda ? 'resposta-mostrada' : 'caminho';
}

export interface ResumoAjuda {
  /** Itens avaliados considerados. */
  itens: number;
  porNivel: Record<NivelAjuda, number>;
  /** Itens em que a criança pediu para ouvir de novo (só quando a mecânica grava `ouviuDeNovo`). */
  ouviuDeNovo: { itens: number; vezes: number; comDado: number };
}

/** Quantas respostas precisaram de cada nível de ajuda (só avaliadas). */
export function resumoDaAjuda(tentativas: Tentativa[]): ResumoAjuda {
  const porNivel = Object.fromEntries(NIVEIS_AJUDA.map((n) => [n, 0])) as Record<NivelAjuda, number>;
  let itens = 0; let comDado = 0; let ouvItens = 0; let vezes = 0;
  for (const t of tentativas) {
    if (!ehAvaliada(t)) continue;
    itens++;
    porNivel[nivelDeAjuda(t)]++;
    if (t.ouviuDeNovo !== undefined) {
      comDado++;
      if (t.ouviuDeNovo > 0) { ouvItens++; vezes += t.ouviuDeNovo; }
    }
  }
  return { itens, porNivel, ouviuDeNovo: { itens: ouvItens, vezes, comDado } };
}

/** Em que posição a resposta certa caiu (confere o sorteio, R5). Só tentativas com `posicaoCerta`. */
export function posicoesDaRespostaCerta(tentativas: Tentativa[]): number[] {
  const out: number[] = [];
  for (const t of tentativas) if (t.posicaoCerta !== undefined && t.posicaoCerta >= 0) out[t.posicaoCerta] = (out[t.posicaoCerta] ?? 0) + 1;
  return Array.from(out, (x) => x ?? 0);
}

/* ------------------------------ chute (E-CHU) ------------------------------ */

/**
 * DECISÃO DO PROJETO (os materiais não dão número; docs/pedagogia/06 §1 só define E-CHU: "resposta muito rápida ou
 * padrão de posição"). A calibrar com uso:
 *  - resposta "muito rápida" = menos de `rapidaMs` entre a pergunta pronta e o toque;
 *  - olha as últimas `janela` respostas avaliadas; precisa de ao menos `minItens` com tempo ou posição;
 *  - chute por pressa: `proporcaoRapidasErradas` ou mais das respostas foram rápidas E erradas de primeira;
 *  - chute por posição: `mesmaPosicaoSeguidas` primeiros toques seguidos no MESMO lugar enquanto a certa mudava de
 *    lugar, com ao menos 2 erros nesse trecho.
 */
export const CHUTE = { rapidaMs: 1200, janela: 20, minItens: 6, proporcaoRapidasErradas: 0.4, mesmaPosicaoSeguidas: 5 };

export interface SinalDeChute {
  chutando: boolean;
  /** Respostas avaliadas olhadas. */
  itens: number;
  rapidasErradas: number;
  /** Maior sequência de primeiros toques no mesmo lugar (com a certa mudando de lugar). */
  mesmaPosicao: number;
  motivo?: 'pressa' | 'posicao';
}

const errouDePrimeira = (t: Tentativa) => (t.escolhido !== undefined && t.alvo !== undefined ? t.escolhido !== t.alvo : (t.tentativaNumero ?? 1) > 1 || !t.acertou);

export function sinaisDeChute(tentativas: Tentativa[], k = CHUTE): SinalDeChute {
  const ult = tentativas.filter(ehAvaliada).sort((a, b) => a.em - b.em).slice(-k.janela);
  const comTempo = ult.filter((t) => t.tempoMs !== undefined);
  const rapidasErradas = comTempo.filter((t) => t.tempoMs! < k.rapidaMs && errouDePrimeira(t)).length;
  let melhor = 0;
  let run: Tentativa[] = [];
  for (const t of ult) {
    if (t.posicaoEscolhida === undefined || t.posicaoCerta === undefined) { run = []; continue; }
    if (run.length && run[run.length - 1].posicaoEscolhida !== t.posicaoEscolhida) run = [];
    run.push(t);
    const certasVariaram = new Set(run.map((x) => x.posicaoCerta)).size > 1;
    const erros = run.filter(errouDePrimeira).length;
    if (certasVariaram && erros >= 2) melhor = Math.max(melhor, run.length);
  }
  const comPosicao = ult.filter((t) => t.posicaoEscolhida !== undefined).length;
  const itens = Math.max(comTempo.length, comPosicao);
  const pressa = comTempo.length >= k.minItens && rapidasErradas / comTempo.length >= k.proporcaoRapidasErradas;
  const posicao = comPosicao >= k.minItens && melhor >= k.mesmaPosicaoSeguidas;
  return { chutando: pressa || posicao, itens, rapidasErradas, mesmaPosicao: melhor, motivo: pressa ? 'pressa' : posicao ? 'posicao' : undefined };
}
