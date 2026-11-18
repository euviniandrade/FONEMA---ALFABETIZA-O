/**
 * CAÇA AO TESOURO DAS PALAVRAS (fila do dono nº 25; nome do projeto; docs/pesquisa/47 G9 "caça ao tesouro"): regras puras da
 * caça dentro do passeio 3D. A página do mundo (mundo-3d-v2/js/caca-tesouro.js) só desenha os baús e avisa quando a criança
 * chega; quem decide o que entra, o que é certo e o que conta é este arquivo (e o app, web/src/telas/crianca/caca/).
 *
 * Níveis (cada um abre cedo e cresce, D034):
 *  1. CAÇA AOS SONS — a Sofia toca o SOM PURO de uma letra já ensinada (regra 1); 3 baús com letras em pontos SORTEADOS da praça
 *     (regra 3); a criança anda até o círculo do baú certo e ele abre. Com menos de 3 sons ensinados é AQUECIMENTO: os baús
 *     mostram FIGURAS (a certa começa com o som ensinado; as outras são só ouvidas, 05 §3) e grava EXPOSIÇÃO (regra 4, D034).
 *  2. CAÇA ÀS LETRAS DE UMA PALAVRA — palavra decodificável já liberada (`bancoDoCarteiro` + verificador, regra 2), só com letras
 *     cujo som naquela palavra é o som "de sempre" da letra (MALA sim; BOLA e DEDO não: O aberto, O que soa U). A cada som
 *     tocado, a criança acha o baú da letra (qualquer baú com a letra certa vale: MALA tem dois A); a letra voa para a faixa.
 *     Sempre ≥ 3 baús à vista (letras que faltam + 2 letras ensinadas que não estão na palavra). No fim ela LÊ a palavra da faixa
 *     e escolhe a figura entre 3 (avaliada; formato 'caca-palavra': a leitura vem depois de ouvir os sons um a um, então o painel
 *     não deve misturar com a leitura "seca" do Carteiro).
 *  3. CHARADAS DE LUGAR — a Sofia diz uma charada que ensina o caminho ("perto de onde se compra pão"), nunca a resposta; no lugar
 *     há um baú; aberto, ele mostra 3 letras e a Sofia toca o som (avaliado). Achar o lugar = EXPOSIÇÃO (exploração, regra 4).
 *  4. NA ÁGUA — baús na água rasa, no fundo do rio (mergulho), debaixo da ponte e do outro lado do rio (de barco).
 *
 * O barquinho é destrancado ao terminar o nível 3 (`barcoLiberado`). Nada de cronômetro, placar ou ranking; moedinhas que
 * aparecem pelo caminho são enfeite (não ficam guardadas). Números [DP] = decisão do projeto.
 */
import { BANCO, LETRA_POR_ID, LUGARES_CACA, LUGAR_CACA_POR_ID, PONTOS_PRACA, type LugarCacaId } from '@fonema/conteudo';
import type { CategoriaAlvo, Progresso } from './estado.ts';
import { dadosBiblioteca } from './biblioteca.ts';
import { geradorJogo, idDoRegistro, montarRodada, posicionarCerta, sonsEnsinados, variacoesDoJogo, habilidadeDoSom, MINIMO_DE_SONS, type ItemJogo, type OpcaoJogo } from './jogos-fonicos.ts';
import { bancoDoCarteiro, HABILIDADE_CARTEIRO } from './jogos-vila.ts';

export type NivelCaca = 1 | 2 | 3 | 4;
export const NIVEIS_CACA: NivelCaca[] = [1, 2, 3, 4];
export const NOME_NIVEL_CACA: Record<NivelCaca, string> = { 1: 'Caça aos sons', 2: 'Letras da palavra', 3: 'Charadas da vila', 4: 'Tesouros na água' };
export const ICONE_NIVEL_CACA: Record<NivelCaca, string> = { 1: '🔊', 2: '🔤', 3: '🗺️', 4: '🌊' };
/** Escolhas por rodada [DP] (rodadas curtas). */
export const PASSOS_CACA: Record<NivelCaca, number> = { 1: 4, 2: 0, 3: 3, 4: 3 };
/** Id gravado em `biblioteca.jogos` ao terminar um nível (é o que abre o seguinte). */
export const idJogoCaca = (n: NivelCaca) => `caca-tesouro-${n}`;
/** Ponto de partida do passeio (para conferir que o baú certo não é sempre o mais perto). */
export const PARTIDA_CACA: [number, number] = [0, 19.5];

export interface EstadoNivelCaca { nivel: NivelCaca; nome: string; icone: string; aberto: boolean; falta?: string; aquecimento?: boolean }

/** Um baú no mundo. `id` é único na rodada. */
export interface BauCaca { id: string; letra?: string; figura?: string; som: string; x: number; z: number; lugar?: LugarCacaId }

/** Uma escolha avaliada (ou de aquecimento). */
export interface PassoCaca {
  /** 'andar': ir até o baú certo entre os que estão à vista (níveis 1 e 2). 'abrir': achar o baú do lugar e escolher a letra (3 e 4). */
  modo: 'andar' | 'abrir';
  somAlvo: string;
  /** Baús à vista neste passo (no nível 2 o app tira os já achados: `bausDaPalavra`). */
  baus: BauCaca[];
  /** Ids dos baús que valem como certos (nível 1: um; nível 2: todos os da letra pedida que ainda não foram achados). */
  corretas: string[];
  /** Nível 3/4: as 3 letras do baú aberto, na ordem da tela, e onde está a certa. */
  opcoes?: OpcaoJogo[];
  posicaoCerta?: number;
  lugar?: LugarCacaId;
  alvo: string;
  distratores: string[];
  habilidade: string;
  categoria: CategoriaAlvo;
  formato: string;
  /** D034: aquecimento (menos de 3 sons): grava exposição. */
  aquecimento?: boolean;
  /** Nível 2: a letra pedida (posição na palavra). */
  indice?: number;
}

export interface PalavraCaca { texto: string; letras: string[]; sons: string[]; figuras: string[]; posicaoCerta: number; habilidade: string }

export interface RodadaCaca { nivel: NivelCaca; passos: PassoCaca[]; palavra?: PalavraCaca; aquecimento?: boolean }

/* ------------------------------------------------------------ o que está aberto ------------------------------------------------------------ */

export const jogouNivelCaca = (p: Progresso, n: NivelCaca): boolean => dadosBiblioteca(p).jogos.some((j) => j.id === idJogoCaca(n));
/** O barquinho do passeio: destrancado ao terminar uma caça de charadas (nível 3). */
export const barcoLiberado = (p: Progresso): boolean => jogouNivelCaca(p, 3);

/**
 * Palavras do nível 2: liberadas para LER (Carteiro: verificador na unidade concluída, figura, distratores de escrita parecida) e
 * em que cada letra faz o som "de sempre" (o som que o app toca para aquela letra), com clipe.
 */
export function palavrasDaCaca(p: Progresso, temSom?: (f: string) => boolean): { palavra: string; outras: string[] }[] {
  return bancoDoCarteiro(p).filter(({ palavra }) => {
    const e = BANCO[palavra];
    if (!e?.sons) return false;
    const sons = e.sons.split(/\s+/);
    const letras = [...palavra.toUpperCase()];
    if (sons.length !== letras.length) return false;
    return letras.every((l, i) => { const f = LETRA_POR_ID[l]?.fonema; return !!f && f === sons[i] && (!temSom || temSom(f)); });
  });
}

/** Letras ensinadas que podem ser distratoras na palavra (não estão nela). */
function distratorasDaPalavra(p: Progresso, palavra: string, temSom?: (f: string) => boolean): string[] {
  const tem = new Set(palavra.toUpperCase());
  return sonsEnsinados(p, temSom).map((s) => s.letra).filter((l) => !tem.has(l) && l.length === 1);
}
export const MINIMO_PALAVRAS_CACA = 3;

export function niveisDaCaca(p: Progresso, temSom?: (f: string) => boolean): EstadoNivelCaca[] {
  const sons = sonsEnsinados(p, temSom);
  const figura = variacoesDoJogo(p, 'corre-som', temSom).find((v) => v.variacao === 'figura')!;
  const base = (nivel: NivelCaca) => ({ nivel, nome: NOME_NIVEL_CACA[nivel], icone: ICONE_NIVEL_CACA[nivel] });
  const palavras = palavrasDaCaca(p, temSom).filter((x) => distratorasDaPalavra(p, x.palavra, temSom).length >= 2);
  const tres = sons.length >= MINIMO_DE_SONS;
  const n1: EstadoNivelCaca = tres ? { ...base(1), aberto: true }
    : figura.liberada ? { ...base(1), aberto: true, aquecimento: true } : { ...base(1), aberto: false, falta: 'Abre com o primeiro som da trilha.' };
  const n2: EstadoNivelCaca = palavras.length >= MINIMO_PALAVRAS_CACA ? { ...base(2), aberto: true } : { ...base(2), aberto: false, falta: 'Abre quando a trilha chegar às primeiras palavras para ler.' };
  const n3: EstadoNivelCaca = !tres ? { ...base(3), aberto: false, falta: `Abre com ${MINIMO_DE_SONS} sons da trilha.` }
    : jogouNivelCaca(p, 1) ? { ...base(3), aberto: true } : { ...base(3), aberto: false, falta: 'Abre depois de uma Caça aos sons.' };
  const n4: EstadoNivelCaca = !tres ? { ...base(4), aberto: false, falta: `Abre com ${MINIMO_DE_SONS} sons da trilha.` }
    : barcoLiberado(p) ? { ...base(4), aberto: true } : { ...base(4), aberto: false, falta: 'Abre quando você ganhar a chave do barquinho (Charadas da vila).' };
  return [n1, n2, n3, n4];
}
export const cacaAberta = (p: Progresso, temSom?: (f: string) => boolean): boolean => niveisDaCaca(p, temSom).some((n) => n.aberto);

/* ------------------------------------------------------------ sorteio ------------------------------------------------------------ */

function misturar<T>(xs: readonly T[], r: () => number): T[] {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
/** `n` pontos diferentes da praça, sorteados (a posição de cada baú nunca é fixa: regra 3). */
function pontosSorteados(n: number, r: () => number): [number, number][] { return misturar(PONTOS_PRACA, r).slice(0, n); }

const passoDoItem = (it: ItemJogo, baus: BauCaca[], extra: Partial<PassoCaca> = {}): PassoCaca => ({
  modo: 'andar', somAlvo: it.somAlvo, baus, corretas: [(baus[it.posicaoCerta] ?? baus[0]).id], alvo: idDoRegistro(it, it.opcoes[it.posicaoCerta]),
  distratores: it.opcoes.filter((_, j) => j !== it.posicaoCerta).map((o) => idDoRegistro(it, o)), habilidade: it.habilidade, categoria: it.categoria,
  formato: it.formato, ...(it.aquecimento ? { aquecimento: true } : {}), ...extra
});

/**
 * Uma rodada do nível pedido, só com o que a criança já estudou. Vazia quando o nível está fechado.
 * Mesma semente → mesma rodada (testes); o app passa uma semente nova a cada rodada.
 */
export function rodadaDaCaca(p: Progresso, args: { nivel: NivelCaca; semente: number; temSom?: (f: string) => boolean }): RodadaCaca {
  const { nivel, semente, temSom } = args;
  const st = niveisDaCaca(p, temSom).find((x) => x.nivel === nivel)!;
  if (!st.aberto) return { nivel, passos: [] };
  const r = geradorJogo(semente);

  if (nivel === 1) {
    const variacao = st.aquecimento ? 'figura' : 'letra';
    const itens = montarRodada(p, 'corre-som', { variacao, semente: semente + 7, temSom, n: PASSOS_CACA[1] });
    const passos = itens.map((it, k) => {
      const pts = pontosSorteados(3, r);
      const baus: BauCaca[] = it.opcoes.map((o, j) => ({ id: `b${k}-${j}`, ...(o.letra ? { letra: o.letra } : { figura: o.figura }), som: o.som, x: pts[j][0], z: pts[j][1] }));
      return passoDoItem(it, baus);
    });
    return { nivel, passos, ...(st.aquecimento ? { aquecimento: true } : {}) };
  }

  if (nivel === 2) {
    const banco = palavrasDaCaca(p, temSom).filter((x) => distratorasDaPalavra(p, x.palavra, temSom).length >= 2);
    const escolha = misturar(banco, r)[0];
    const texto = escolha.palavra.toUpperCase();
    const letras = [...texto];
    const sons = BANCO[escolha.palavra].sons!.split(/\s+/);
    const distr = misturar(distratorasDaPalavra(p, escolha.palavra, temSom), r).slice(0, 2);
    const pts = pontosSorteados(letras.length + distr.length, r);
    const baus: BauCaca[] = [
      ...letras.map((l, i) => ({ id: `l${i}`, letra: l, som: sons[i], x: pts[i][0], z: pts[i][1] })),
      ...distr.map((l, i) => ({ id: `d${i}`, letra: l, som: LETRA_POR_ID[l].fonema!, x: pts[letras.length + i][0], z: pts[letras.length + i][1] }))
    ];
    const passos: PassoCaca[] = letras.map((l, i) => ({
      modo: 'andar', somAlvo: sons[i], baus, corretas: baus.filter((b) => b.letra === l && b.id.startsWith('l')).map((b) => b.id), alvo: l,
      distratores: [...new Set(baus.filter((b) => b.letra !== l).map((b) => b.letra!))], habilidade: habilidadeDoSom(p, l), categoria: 'grafema', formato: 'som-letra', indice: i
    }));
    const { opcoes, pos } = posicionarCerta(escolha.palavra, escolha.outras, r, { pos: -1 });
    return { nivel, passos, palavra: { texto, letras, sons, figuras: opcoes, posicaoCerta: pos, habilidade: HABILIDADE_CARTEIRO } };
  }

  // níveis 3 e 4: um baú por lugar; aberto, ele mostra 3 letras
  const itens = montarRodada(p, 'corre-som', { variacao: 'letra', semente: semente + 11, temSom, n: PASSOS_CACA[nivel] });
  const terra = LUGARES_CACA.filter((l) => l.modo === 'terra').map((l) => l.id);
  const agua: LugarCacaId[] = ['rio', 'fundo', 'ponte', 'margem'];
  let lugares: LugarCacaId[];
  if (nivel === 3) lugares = misturar(terra, r).slice(0, itens.length);
  else {
    // sempre pelo menos um lugar de barco e um de nadar/mergulhar, em ordem sorteada
    const barco = misturar(['ponte', 'margem'] as LugarCacaId[], r)[0];
    const nado = misturar(['rio', 'fundo'] as LugarCacaId[], r)[0];
    const resto = misturar(agua.filter((x) => x !== barco && x !== nado), r);
    lugares = misturar([barco, nado, ...resto].slice(0, itens.length), r);
  }
  const passos = itens.map((it, k) => {
    const l = LUGAR_CACA_POR_ID[lugares[k]];
    const bau: BauCaca = { id: `t${k}`, som: it.somAlvo, x: l.ponto[0], z: l.ponto[1], lugar: l.id };
    return { ...passoDoItem(it, [bau]), modo: 'abrir' as const, corretas: [bau.id], opcoes: it.opcoes, posicaoCerta: it.posicaoCerta, lugar: l.id };
  });
  return { nivel, passos };
}

/** Nível 2: baús ainda à vista (os achados saem) e os que valem para a letra do passo. */
export function bausDaPalavra(passo: PassoCaca, achados: string[]): { visiveis: BauCaca[]; certos: string[] } {
  const visiveis = passo.baus.filter((b) => !achados.includes(b.id));
  return { visiveis, certos: passo.corretas.filter((id) => !achados.includes(id)) };
}
