/**
 * MEMÓRIA DOS SONS (nome do projeto; pedido do dono, fila nº 17; docs/pesquisa/46 §"O que levamos" item 2): jogo da memória
 * LETRA × CENA DO SOM. De um lado, a carta da cena (a Sofia fazendo o som, ou a cena atual da letra: `CENAS_DO_SOM`), que TOCA o
 * SOM PURO quando vira (regra 1: nunca o nome da letra); do outro, a carta da LETRA. A criança acha os pares.
 *
 * Níveis [DP]:
 *  1 "Olhar e lembrar": 3 pares; as cartas ficam abertas para olhar e ouvir antes de virar. A carta da letra também toca o som.
 *    Tudo é EXPOSIÇÃO (regra 4): nada conta para o domínio.
 *  2 "Memória": 3–4 pares, cartas viradas. A carta da letra vira MUDA (só a cena toca); o som da letra só toca quando o par fecha.
 *  3 "Memória grande": 5–6 pares; aqui já podem entrar sons parecidos (m/n, f/v…), nunca dois do mesmo som.
 *  4 "Só ouvindo": cartas de SOM (alto-falante, sem figura) × cartas de letra (muda): ouvir e achar a letra.
 *
 * Por que a carta da letra fica muda nos níveis 2–4 (decisão do projeto, regra 3 e docs/pedagogia/04 §1): se as duas cartas
 * tocassem o som, a criança formaria o par só comparando dois sons iguais, sem precisar saber qual letra faz aquele som; o par
 * deixaria de provar "letra ↔ som". Assim, a cena dá o som e a letra precisa ser reconhecida pelo desenho.
 *
 * Só sons já ensinados numa fase concluída (`sonsEnsinados`, o mesmo filtro dos jogos fônicos: som real, com clipe, sem os
 * "duvidosos" da auditoria). Nunca, na mesma rodada, duas letras que podem fazer o mesmo som (`MESMO_SOM`) e, nos níveis 1, 2
 * e 4, nenhum par de sons parecidos. Posições sorteadas (duas grades: cenas em cima, letras embaixo).
 *
 * O que conta (regra 4): virar e ouvir é exposição. Um par é DECISÃO quando a segunda carta virada já tinha sido vista
 * (a criança sabia o que estava escolhendo); virar uma carta nunca vista é palpite de memória e não prova nada. Assim:
 *  - par fechado com decisão → tentativa AVALIADA (mecânica 'memoria-sons');
 *  - par errado com decisão → erro do alvo (a cena) com a letra escolhida: alimenta a matriz de confusão letra × som;
 *  - par fechado por palpite, sem erro antes → tentativa de EXPOSIÇÃO (achou, mas não dá para saber se sabia).
 * Moedinhas são só enfeite (não são dadas), sem cronômetro, sem ranking.
 */
import { CENAS_DO_SOM, LETRA_POR_ID, PARES_DE_VOZ, SONS_PARECIDOS, faseDaLetra, parConfuso } from '@fonema/conteudo';
import type { CategoriaAlvo, Progresso, Tentativa, TipoTentativa, NivelAjuda } from './estado.ts';
import { geradorJogo, habilidadeDoSom, sonsEnsinados, type OpcoesSons, type SomEnsinado } from './jogos-fonicos.ts';

export type NivelMemoria = 1 | 2 | 3 | 4;
export const NIVEIS_MEMORIA: NivelMemoria[] = [1, 2, 3, 4];

/** Pares por nível [DP] (pesquisa 46: 3–6 por rodada para 4–7 anos). [mínimo, máximo] */
/** D034: o nível 1 (só olhar e lembrar, tudo exposição) abre com 2 pares, para abrir cedo e crescer com a trilha. */
export const PARES_DO_NIVEL: Record<NivelMemoria, [number, number]> = { 1: [2, 3], 2: [3, 4], 3: [5, 6], 4: [3, 4] };

/**
 * Letras que podem fazer o MESMO som no PB (nunca juntas numa rodada) [DP, conservador]: C/K/Q (/k/), S/Z/X (S entre vogais = /z/;
 * X = /s/, /z/ ou /ks/), C/S (ce, ci), G/J (ge, gi), I/Y, U/W, E/I (E átono final = /i/: chave), O/U (O átono final = /u/: pato).
 */
export const MESMO_SOM: string[][] = [['C', 'K', 'Q'], ['S', 'Z', 'X'], ['C', 'S'], ['G', 'J'], ['I', 'Y'], ['U', 'W'], ['E', 'I'], ['O', 'U']];
export const mesmoSom = (a: string, b: string) => a === b || MESMO_SOM.some((g) => g.includes(a) && g.includes(b));

/** Um par da rodada: a letra, o som (chave do fonema) e a cena do som. */
export interface ParMemoria { letra: string; som: string; cena: string; habilidade: string }

/** Uma carta na mesa. `lado` = 'cena' (cena do som; no nível 4, carta de som) ou 'letra'. */
export interface CartaMemoria { id: string; lado: 'cena' | 'letra'; letra: string; som: string; cena?: string }

export interface RodadaMemoria {
  nivel: NivelMemoria;
  pares: ParMemoria[];
  /** Cartas da grade de cima (cenas ou sons), em ordem sorteada. */
  cenas: CartaMemoria[];
  /** Cartas da grade de baixo (letras), em ordem sorteada. */
  letras: CartaMemoria[];
}

/** Sons que podem entrar no jogo: ensinados, com som real e clipe, e com cena do som. */
export function sonsDaMemoria(p: Progresso, temSom?: (f: string) => boolean, opts: OpcoesSons = {}): SomEnsinado[] {
  return sonsEnsinados(p, temSom, opts).filter((s) => !!CENAS_DO_SOM[s.letra] && !!LETRA_POR_ID[s.letra]);
}

/** Sons parecidos (par confundível, par de voz ou grupo de sons parecidos): ficam fora dos níveis 1, 2 e 4. */
export function ehParecido(a: SomEnsinado, b: SomEnsinado): boolean {
  if (parConfuso(a.som, b.som)) return true;
  if (PARES_DE_VOZ.some(([x, y]) => (x === a.som && y === b.som) || (x === b.som && y === a.som))) return true;
  return SONS_PARECIDOS.some((g) => g.includes(a.letra) && g.includes(b.letra));
}

/** Escolhe até `n` sons compatíveis (nunca o mesmo som; sem parecidos quando `semParecidos`), na ordem dada. */
function compativeis(lista: SomEnsinado[], n: number, semParecidos: boolean, obrigatoria?: string): SomEnsinado[] {
  const out: SomEnsinado[] = [];
  const ordem = obrigatoria ? [...lista.filter((s) => s.letra === obrigatoria), ...lista.filter((s) => s.letra !== obrigatoria)] : lista;
  for (const s of ordem) {
    if (out.length >= n) break;
    if (out.some((x) => x.som === s.som || mesmoSom(x.letra, s.letra) || CENAS_DO_SOM[x.letra] === CENAS_DO_SOM[s.letra])) continue;
    if (semParecidos && out.some((x) => ehParecido(x, s))) continue;
    out.push(s);
  }
  return out;
}
/** Quantos sons cabem numa rodada sem conflito (o máximo, testando várias ordens). */
function maiorConjunto(lista: SomEnsinado[], semParecidos: boolean): number {
  let melhor = 0;
  for (let s = 1; s <= 24 && melhor < 6; s++) melhor = Math.max(melhor, compativeis(misturar(lista, geradorJogo(s)), 6, semParecidos).length);
  return melhor;
}

function misturar<T>(xs: readonly T[], r: () => number): T[] {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

const semParecidosNo = (nivel: NivelMemoria) => nivel !== 3;

export interface EstadoNivelMemoria { nivel: NivelMemoria; liberado: boolean; motivo?: string }

/** Níveis abertos pelo que já foi ensinado (sons que cabem juntos na rodada). */
export function niveisDaMemoria(p: Progresso, temSom?: (f: string) => boolean): EstadoNivelMemoria[] {
  const sons = sonsDaMemoria(p, temSom);
  const semPar = maiorConjunto(sons, true);
  const comPar = maiorConjunto(sons, false);
  return NIVEIS_MEMORIA.map((nivel) => {
    const tem = semParecidosNo(nivel) ? semPar : comPar;
    const min = PARES_DO_NIVEL[nivel][0];
    return tem >= min ? { nivel, liberado: true } : { nivel, liberado: false, motivo: `Faltam ${min - tem} som${min - tem > 1 ? 's' : ''} da trilha para abrir.` };
  });
}
export const memoriaAberta = (p: Progresso, temSom?: (f: string) => boolean) => niveisDaMemoria(p, temSom).some((n) => n.liberado);

export interface PedidoMemoria {
  nivel: NivelMemoria;
  semente: number;
  temSom?: (f: string) => boolean;
  /** Letra que precisa entrar (desafio no fim da fase da letra). */
  incluir?: string;
}

/** Monta a rodada (vazia se o nível ainda não abriu). Mesma semente → mesma rodada. */
export function montarMemoria(p: Progresso, pedido: PedidoMemoria): RodadaMemoria | null {
  const { nivel, semente, temSom, incluir } = pedido;
  if (!niveisDaMemoria(p, temSom).find((n) => n.nivel === nivel)?.liberado) return null;
  const r = geradorJogo(semente || 1);
  // desafio dentro da fase (`incluir`): sem os sons duvidosos da auditoria (D034 só os põe nos jogos livres)
  const sons = sonsDaMemoria(p, temSom, incluir ? { duvidosos: false } : {});
  const [min, max] = PARES_DO_NIVEL[nivel];
  let escolhidos: SomEnsinado[] = [];
  for (let t = 0; t < 12 && escolhidos.length < max; t++) {
    const c = compativeis(misturar(sons, r), max, semParecidosNo(nivel), incluir);
    if (c.length > escolhidos.length) escolhidos = c;
  }
  if (escolhidos.length < min) return null;
  const pares: ParMemoria[] = escolhidos.map((s) => ({ letra: s.letra, som: s.som, cena: CENAS_DO_SOM[s.letra], habilidade: habilidadeDoSom(p, s.letra) }));
  const cenas = misturar(pares.map((x): CartaMemoria => ({ id: `c-${x.letra}`, lado: 'cena', letra: x.letra, som: x.som, ...(nivel === 4 ? {} : { cena: x.cena }) })), r);
  let letras = misturar(pares.map((x): CartaMemoria => ({ id: `l-${x.letra}`, lado: 'letra', letra: x.letra, som: x.som })), r);
  // posição sorteada, mas nunca TODAS as letras exatamente embaixo das suas cenas (a posição entregaria a resposta, regra 3)
  if (letras.every((l, k) => cenas[k]?.letra === l.letra)) letras = [...letras.slice(1), letras[0]];
  return { nivel, pares, cenas, letras };
}

/* ------------------------------------------------------------ desafio no fim da fase da Trilha A–Z ------------------------------------------------------------ */

/**
 * No fim da fase AL-X concluída, a Memória dos Sons vira desafio opcional (como os outros jogos no Ritual) quando o som da
 * letra X entra no jogo e o nível 2 está aberto. A rodada traz a letra X e outras já ensinadas.
 */
export function desafioMemoria(p: Progresso, faseId: string, temSom?: (f: string) => boolean): { letra: string; nivel: NivelMemoria } | null {
  const m = /^AL-([A-Z])$/.exec(faseId);
  if (!m || faseId !== faseDaLetra(m[1]) || p.fases[faseId]?.estado !== 'concluida') return null;
  if (!sonsDaMemoria(p, temSom, { duvidosos: false }).some((s) => s.letra === m[1])) return null;
  if (!niveisDaMemoria(p, temSom).find((n) => n.nivel === 2)?.liberado) return null;
  return { letra: m[1], nivel: 2 };
}

/* ------------------------------------------------------------ registro ------------------------------------------------------------ */

/** Uma virada de par (duas cartas), como a tela registra. */
export interface JogadaMemoria {
  /** Letra da carta de cena/som (o alvo: o som que a criança ouviu). */
  alvo: string;
  /** Letra da carta de letra escolhida. */
  escolhida: string;
  /** A segunda carta virada já tinha sido vista (decisão) ou não (palpite). */
  decisao: boolean;
  /** Momento da jogada. */
  em: number;
  /** Posição (na grade de letras) da carta escolhida e da carta certa. */
  posEscolhida: number;
  posCerta: number;
  /** Cartas de letra ainda na mesa na hora da jogada (as opções possíveis). */
  naMesa: number;
  /** A carta certa brilhou antes desta jogada (ajuda). */
  brilhou?: boolean;
  /** Quantas vezes a criança pediu para ouvir a cena de novo antes desta jogada. */
  ouviuDeNovo?: number;
}

export interface ResumoRegistroMemoria { tentativas: Tentativa[]; confusoes: { alvo: string; escolhida: string }[] }

/**
 * Converte as jogadas de uma rodada em tentativas (contrato de estado.ts). Uma tentativa por par FECHADO:
 * respostas = letras escolhidas com decisão para aquele alvo (erros) + a certa; tipo 'avaliada' se houve decisão (no acerto ou
 * em algum erro), senão 'exposicao'. Nível 1 é sempre exposição. `inicio` = quando a rodada ficou pronta para jogar.
 */
export function tentativasDaMemoria(args: {
  rodada: RodadaMemoria; jogadas: JogadaMemoria[]; sessao: string; cena: string; contexto: 'livre' | 'desafio'; inicio: number;
}): ResumoRegistroMemoria {
  const { rodada, jogadas, sessao, cena, contexto } = args;
  const out: Tentativa[] = [];
  const confusoes: { alvo: string; escolhida: string }[] = [];
  let desde = args.inicio;
  for (const par of rodada.pares) {
    const doAlvo = jogadas.filter((j) => j.alvo === par.letra);
    const fechou = doAlvo.find((j) => j.escolhida === par.letra);
    if (!fechou) continue;
    const antes = doAlvo.filter((j) => j.em <= fechou.em);
    const erros = antes.filter((j) => j.escolhida !== par.letra && j.decisao);
    for (const e of erros) confusoes.push({ alvo: par.letra, escolhida: e.escolhida });
    const respostas = [...erros.map((e) => e.escolhida), par.letra];
    const decidiu = fechou.decisao || erros.length > 0;
    const tipo: TipoTentativa = rodada.nivel === 1 || !decidiu ? 'exposicao' : 'avaliada';
    const brilhou = antes.some((j) => j.brilhou);
    const nivelAjuda: NivelAjuda = brilhou ? 'resposta-mostrada' : erros.length >= 2 ? 'caminho' : erros.length === 1 ? 'contraste' : 'nenhuma';
    const primeira = erros[0] ?? fechou;
    const ouviu = antes.reduce((n, j) => n + (j.ouviuDeNovo ?? 0), 0);
    const categoria: CategoriaAlvo = 'grafema';
    out.push({
      em: fechou.em, sessao, habilidade: par.habilidade, acertou: erros.length === 0 && !brilhou, cena,
      ...(erros.length || brilhou ? { comAjuda: true } : {}),
      tipo, mecanica: 'memoria-sons', alvo: par.letra, categoria, escolhido: respostas[0], respostas,
      distratores: rodada.pares.filter((x) => x.letra !== par.letra).map((x) => x.letra),
      tempoMs: Math.max(0, fechou.em - desde), tentativaNumero: erros.length + 1, nivelAjuda,
      posicaoCerta: fechou.posCerta, posicaoEscolhida: primeira.posEscolhida, nOpcoes: primeira.naMesa,
      ...(ouviu ? { ouviuDeNovo: ouviu } : {}),
      contexto, formato: rodada.nivel === 4 ? 'memoria-som-letra' : 'memoria-cena-letra'
    });
    desde = fechou.em;
  }
  return { tentativas: out.sort((a, b) => a.em - b.em), confusoes };
}

/** Rota do desafio (para o Ritual). */
export const faseDoDesafioMemoria = (letra: string) => faseDaLetra(letra);
