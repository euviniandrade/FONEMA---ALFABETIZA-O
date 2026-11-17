/**
 * JOGOS DA VILA (D032 §4; docs/pesquisa/47 §3 G6, G10 e G3; §5 ordem 3 a 5): regras puras de três jogos.
 *
 *  - ESTRADA E RIO DOS PARES (G6, corrida com bifurcações): o carrinho (ou o barco) chega numa bifurcação; cada caminho tem
 *    uma placa. Variação "ouvir": a Sofia diz uma palavra (vaca) e as placas têm FIGURAS do par mínimo + 1 distrator (vaca ×
 *    faca × foca). Variação "ler": o passageiro mostra a palavra ESCRITA de onde quer ir (VACA) e as placas têm as mesmas
 *    figuras; ninguém diz a palavra antes (04 R9). Os itens saem dos pares das lições JÁ CONCLUÍDAS da Trilha dos Sons,
 *    então os dois sons de cada par já foram ensinados. Habilidade = a do contraste (`habilidadeDoPar`): conta para o 8 de 10.
 *  - CARTEIRO DA VILA (G10): o envelope traz uma palavra ESCRITA; as casas têm a placa com a FIGURA de quem mora lá; a criança
 *    lê e entrega na casa certa. Palavras decodificáveis na unidade já concluída (`verificarPalavra`); as figuras das outras
 *    casas têm nomes que diferem pouco na escrita (FACA × VACA; MALA × MULA), para não bastar a 1ª letra (04 R7).
 *  - CASA DO SOM (G3): a criança "encomenda" um móvel escrevendo o nome com letras móveis (sem modelo; 04 N10); o móvel chega
 *    sempre (é brincadeira) e ela decora a casinha à vontade. Só conta a palavra certa na 1ª escrita, sem modelo.
 *
 * Regras de não entregar a resposta (docs/pedagogia/04 §1): 3 opções (R8); posição da certa sorteada sem repetir a anterior
 * (R5, `posicionarCerta` de jogos-fonicos.ts); rodada com outros itens e outra ordem a cada vez (R6). Só o que já foi
 * ensinado (regra 2; 05 §3): pares de lições concluídas, palavras que o verificador libera na unidade concluída, letras com
 * som já visto na bandeja da Casa do Som.
 * O que NUNCA conta (regra 4): cor do carro, móvel recebido, casa decorada, rodadas jogadas. Números [DP] = decisão do projeto.
 */
import { BANCO, FASES_TF, FIGURAS, PARES_CONFUSOS, VALORES_AVISO, habilidadeDoPar, valoresDaEntrada, verificarPalavra } from '@fonema/conteudo';
import type { AtividadeEscolher, AtividadeParMinimo, ItemParMinimo } from '@fonema/conteudo';
import type { DadosJogosVila, Progresso } from './estado.ts';
import { unidadeConcluida } from './biblioteca.ts';
import { letrasComSomVisto } from './sondagem-itens.ts';
import { geradorJogo, posicionarCerta } from './jogos-fonicos.ts';

export type JogoVilaId = 'estrada-pares' | 'carteiro' | 'casa-som';
export type VariacaoEstrada = 'ouvir' | 'ler';

/** Quantas escolhas por rodada [DP] (rodadas curtas: 3 a 6 itens, pesquisa 47 §5.1). */
export const ITENS_POR_RODADA: Record<JogoVilaId, number> = { 'estrada-pares': 6, carteiro: 5, 'casa-som': 3 };
/** Habilidades (as mesmas das lições: o jogo é mais um lugar onde o item aparece, 47 §5.1). */
export const HABILIDADE_CARTEIRO = 'leitura-cvcv';
export const HABILIDADE_CASA = 'escrita-cvcv';

/** Figuras com arte que o banco (`FIGURAS`/`BANCO`) ainda não conhece: só usadas pelos jogos da vila. */
export const FIGURAS_EXTRAS_VILA = ['pia', 'bule', 'mapa'];
/** A palavra tem figura com arte (para as placas do modo ouvir e as casas do Carteiro). */
export const temFiguraVila = (w: string): boolean => !!FIGURAS[w] || !!BANCO[w]?.figura || FIGURAS_EXTRAS_VILA.includes(w);

function misturar<T>(xs: readonly T[], r: () => number): T[] {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
/** Ordem dos alvos: cada item entra uma vez antes de repetir, sem o mesmo alvo duas vezes seguidas (R6). */
function ordemDosAlvos<T>(lista: T[], n: number, r: () => number, chave: (x: T) => string): T[] {
  const out: T[] = [];
  while (out.length < n && lista.length) {
    const volta = misturar(lista, r);
    if (out.length && volta.length > 1 && chave(volta[0]) === chave(out[out.length - 1])) volta.push(volta.shift()!);
    out.push(...volta);
  }
  return out.slice(0, n);
}
/**
 * A palavra pode ser LIDA/ESCRITA agora? Todos os valores sonoros ensinados numa unidade concluída (05 §2–3) e, como na
 * sondagem, sem os valores que o verificador só avisa (vogal nasalizada: cama, banana; 05 §4 A5): jogo livre não é lugar de dúvida.
 */
export function palavraLiberada(p: Progresso, w: string): boolean {
  const n = unidadeConcluida(p);
  const e = BANCO[w];
  if (n <= 0 || !e || e.pseudo || !verificarPalavra(w, n, BANCO).ok) return false;
  return !valoresDaEntrada(e).valores.some((v) => VALORES_AVISO.includes(v));
}

/* ============================================ ESTRADA E RIO DOS PARES ============================================ */

export interface ParDaEstrada { modo: VariacaoEstrada; alvo: string; outra: string; distrator: string; sons: [string, string]; habilidade: string }

export interface ItemEstrada extends ParDaEstrada {
  /** As 3 palavras na ORDEM DOS CAMINHOS (esquerda, meio, direita). */
  opcoes: string[];
  posicaoCerta: number;
}

/** Itens de par mínimo das lições concluídas (ou só da fase pedida), sem repetir o mesmo alvo × outra. */
function paresDasFases(p: Progresso, faseId?: string): ItemParMinimo[] {
  const out: ItemParMinimo[] = [];
  const visto = new Set<string>();
  for (const f of FASES_TF) {
    if (faseId ? f.id !== faseId : p.fases[f.id]?.estado !== 'concluida') continue;
    for (const c of f.cenas) {
      if (c.atividade?.tipo !== 'parMinimo') continue;
      for (const i of (c.atividade as AtividadeParMinimo).itens) {
        const k = `${i.modo}|${i.alvo}|${i.outra}`;
        if (visto.has(k) || !i.distrator) continue;
        visto.add(k);
        out.push(i);
      }
    }
  }
  return out;
}

/**
 * Banco da Estrada: os pares das lições concluídas, nas duas variações.
 *  - ouvir: as três palavras com figura (o que se ouve é livre, 05 §3; as figuras não podem faltar).
 *  - ler: as três com figura e o alvo (a palavra que a criança lê) liberado para ler agora (verificador). As outras duas
 *    só aparecem como figura (não são lidas).
 * Um item de "ouvir" vira também de "ler" quando cumpre isso, e vice-versa (mesmo par, mesmo contraste, mesma habilidade).
 */
export function bancoDaEstrada(p: Progresso, variacao: VariacaoEstrada, faseId?: string): ParDaEstrada[] {
  const out: ParDaEstrada[] = [];
  const visto = new Set<string>();
  for (const i of paresDasFases(p, faseId)) {
    const tres = [i.alvo, i.outra, i.distrator!];
    const ok = tres.every(temFiguraVila) && (variacao === 'ouvir' || palavraLiberada(p, i.alvo));
    const k = `${i.alvo}|${i.outra}`;
    if (!ok || visto.has(k)) continue;
    visto.add(k);
    out.push({ modo: variacao, alvo: i.alvo, outra: i.outra, distrator: i.distrator!, sons: i.sons as [string, string], habilidade: i.habilidade ?? habilidadeDoPar(i.sons as [string, string]) });
  }
  return out;
}

/** Mínimo de pares diferentes para a variação abrir [DP] (com 1 par só, a rodada vira decorar o lugar). */
export const MINIMO_DE_PARES = 2;

export interface EstadoVariacao<V extends string> { variacao: V; liberada: boolean; motivo?: string }

export function variacoesDaEstrada(p: Progresso): EstadoVariacao<VariacaoEstrada>[] {
  return (['ouvir', 'ler'] as const).map((v) => {
    const n = bancoDaEstrada(p, v).length;
    return n >= MINIMO_DE_PARES ? { variacao: v, liberada: true } : { variacao: v, liberada: false, motivo: 'Abre quando a trilha chegar às palavras quase iguais.' };
  });
}

/** Rodada da Estrada: `n` bifurcações, a certa em caminho sorteado (sem repetir o anterior). Vazia se não abriu. */
export function rodadaDaEstrada(p: Progresso, args: { variacao: VariacaoEstrada; semente: number; n?: number; faseId?: string }): ItemEstrada[] {
  const banco = bancoDaEstrada(p, args.variacao, args.faseId);
  if (banco.length < (args.faseId ? 1 : MINIMO_DE_PARES)) return [];
  const r = geradorJogo(args.semente);
  const ant = { pos: -1 };
  return ordemDosAlvos(banco, args.n ?? ITENS_POR_RODADA['estrada-pares'], r, (x) => x.alvo).map((par) => {
    const { opcoes, pos } = posicionarCerta(par.alvo, [par.outra, par.distrator], r, ant);
    return { ...par, opcoes, posicaoCerta: pos };
  });
}

/* ================================================ CARTEIRO DA VILA ================================================ */

export interface ItemCarteiro {
  /** A palavra do envelope (escrita; a criança lê). */
  palavra: string;
  /** Figuras das casas, na ordem da rua (esquerda → direita). */
  casas: string[];
  posicaoCerta: number;
  habilidade: string;
}

/** Quantas letras iguais na mesma posição, menos a diferença de tamanho (o distrator muda pouco: R7). */
function parecenca(a: string, b: string): number {
  let n = 0;
  for (let i = 0; i < Math.min(a.length, b.length); i++) if (a[i] === b[i]) n++;
  return n - Math.abs(a.length - b.length);
}

/** Palavras com figura que existem como "morador" de uma casa (ouvidas/vistas, não lidas: livres, 05 §3). */
const MORADORES = (): string[] => [...new Set([...Object.keys(FIGURAS), ...Object.values(BANCO).filter((e) => e.figura).map((e) => e.texto), ...FIGURAS_EXTRAS_VILA])]
  .filter((w) => /^[a-z]+$/.test(w) && w.length >= 3 && w.length <= 7 && w !== 'casa');

/**
 * Banco do Carteiro: (1) os itens "leia e toque na figura" das lições concluídas (já conferidos pelo verificador, com as
 * figuras que a lição escolheu); (2) as outras palavras com figura que o verificador libera na unidade concluída, com as
 * duas figuras de escrita mais parecida. Cada palavra aparece uma vez.
 */
export function bancoDoCarteiro(p: Progresso): { palavra: string; outras: string[] }[] {
  const out: { palavra: string; outras: string[] }[] = [];
  const tem = new Set<string>();
  for (const f of FASES_TF) {
    if (p.fases[f.id]?.estado !== 'concluida') continue;
    for (const c of f.cenas) {
      if (c.atividade?.tipo !== 'escolher') continue;
      for (const i of (c.atividade as AtividadeEscolher).itens) {
        if (i.formato !== 'ler-figura' || i.pseudo || tem.has(i.correta)) continue;
        if (!palavraLiberada(p, i.correta)) continue;
        const outras = i.opcoes.map((o) => o.id).filter((w) => w !== i.correta);
        if (outras.length < 2 || !outras.every(temFiguraVila)) continue;
        tem.add(i.correta);
        out.push({ palavra: i.correta, outras: outras.slice(0, 2) });
      }
    }
  }
  const moradores = MORADORES();
  for (const e of Object.values(BANCO)) {
    const w = e.texto;
    if (tem.has(w) || !temFiguraVila(w) || !palavraLiberada(p, w)) continue;
    const outras = moradores.filter((x) => x !== w && x[0] !== undefined)
      .map((x) => ({ x, k: parecenca(w, x) }))
      .filter((o) => o.k >= 1)
      .sort((a, b) => b.k - a.k || a.x.localeCompare(b.x))
      .slice(0, 2)
      .map((o) => o.x);
    if (outras.length < 2) continue;
    tem.add(w);
    out.push({ palavra: w, outras });
  }
  return out;
}

/** Mínimo de palavras diferentes para o Carteiro abrir [DP]. */
export const MINIMO_DE_ENVELOPES = 3;

export function carteiroLiberado(p: Progresso): EstadoVariacao<'ler'> {
  const n = bancoDoCarteiro(p).length;
  return n >= MINIMO_DE_ENVELOPES ? { variacao: 'ler', liberada: true } : { variacao: 'ler', liberada: false, motivo: 'Abre quando a trilha chegar às primeiras palavras para ler.' };
}

export function rodadaDoCarteiro(p: Progresso, args: { semente: number; n?: number }): ItemCarteiro[] {
  const banco = bancoDoCarteiro(p);
  if (banco.length < MINIMO_DE_ENVELOPES) return [];
  const r = geradorJogo(args.semente);
  const ant = { pos: -1 };
  // sem repetir envelope na mesma rodada enquanto houver palavra nova
  return ordemDosAlvos(banco, Math.min(args.n ?? ITENS_POR_RODADA.carteiro, banco.length), r, (x) => x.palavra).map((b) => {
    const { opcoes, pos } = posicionarCerta(b.palavra, b.outras, r, ant);
    return { palavra: b.palavra, casas: opcoes, posicaoCerta: pos, habilidade: HABILIDADE_CARTEIRO };
  });
}

/* =================================================== CASA DO SOM =================================================== */

/**
 * Móveis e coisas da casinha (todas com figura e com a palavra gravada na voz da Sofia). Só entram na encomenda quando a
 * palavra pode ser ESCRITA (`palavraLiberada`). Ordem = mais ou menos a ordem em que ficam liberadas na trilha.
 */
export const MOVEIS_CASA: { palavra: string; nome: string }[] = [
  { palavra: 'uva', nome: 'Cacho de uva' }, { palavra: 'ovo', nome: 'Ovo' }, { palavra: 'mala', nome: 'Mala' },
  { palavra: 'pia', nome: 'Pia' }, { palavra: 'lupa', nome: 'Lupa' }, { palavra: 'mapa', nome: 'Mapa' },
  { palavra: 'sapato', nome: 'Sapato' }, { palavra: 'pato', nome: 'Patinho' }, { palavra: 'bule', nome: 'Bule' },
  { palavra: 'bolo', nome: 'Bolo' }, { palavra: 'suco', nome: 'Suco' }, { palavra: 'jaca', nome: 'Jaca' },
  { palavra: 'dado', nome: 'Dado' }, { palavra: 'gato', nome: 'Gatinho' }, { palavra: 'tapete', nome: 'Tapete' },
  { palavra: 'tomate', nome: 'Tomate' }
];

/** Móveis que já podem ser encomendados (escritos) agora. */
export function moveisLiberados(p: Progresso): string[] {
  return MOVEIS_CASA.map((m) => m.palavra).filter((w) => palavraLiberada(p, w));
}

/** Mínimo de móveis diferentes para a Casa do Som abrir [DP]. */
export const MINIMO_DE_MOVEIS = 3;

export function casaLiberada(p: Progresso): EstadoVariacao<'escrever'> {
  const n = moveisLiberados(p).length;
  return n >= MINIMO_DE_MOVEIS ? { variacao: 'escrever', liberada: true } : { variacao: 'escrever', liberada: false, motivo: 'Abre quando a trilha chegar às primeiras palavras para escrever.' };
}

export interface EncomendaCasa {
  palavra: string;
  /** Letras móveis da bandeja (as da palavra + distratoras já ensinadas), em ordem sorteada. */
  letras: string[];
  /** As distratoras (para o registro). */
  distratoras: string[];
  habilidade: string;
}

/**
 * Bandeja da encomenda (como as Caixas de sons da trilha): as letras da palavra + até 3 distratoras JÁ ENSINADAS: o par
 * confundível de uma consoante (p/b, f/v, t/d…), o U quando a palavra termina em O que soa U (e o I para o E final), e uma
 * vogal que não está na palavra. Nenhuma letra de som ainda não ensinado (regra 2).
 */
export function bandejaDaEncomenda(p: Progresso, palavra: string, r: () => number): { letras: string[]; distratoras: string[] } {
  const w = palavra.toUpperCase();
  const daPalavra = [...new Set([...w])];
  const vistas = new Set(letrasComSomVisto(p));
  const extras: string[] = [];
  const por = (l: string) => { if (vistas.has(l) && !daPalavra.includes(l) && !extras.includes(l) && extras.length < 3) extras.push(l); };
  if (w.endsWith('O')) por('U');
  if (w.endsWith('E')) por('I');
  for (const l of misturar(daPalavra.filter((x) => !'AEIOU'.includes(x)), r)) {
    const par = PARES_CONFUSOS.find(([a, b]) => a === l.toLowerCase() || b === l.toLowerCase());
    if (par) por((par[0] === l.toLowerCase() ? par[1] : par[0]).toUpperCase());
  }
  for (const v of misturar(['A', 'E', 'I', 'O', 'U'], r)) por(v);
  return { letras: misturar([...daPalavra, ...extras], r), distratoras: extras };
}

/** As encomendas de uma rodada: móveis liberados, primeiro os que a criança ainda não tem. */
export function rodadaDaCasa(p: Progresso, args: { semente: number; n?: number }): EncomendaCasa[] {
  const livres = moveisLiberados(p);
  if (livres.length < MINIMO_DE_MOVEIS) return [];
  const r = geradorJogo(args.semente);
  const tem = new Set(dadosJogosVila(p).moveis);
  const ordem = [...misturar(livres.filter((w) => !tem.has(w)), r), ...misturar(livres.filter((w) => tem.has(w)), r)];
  return ordem.slice(0, args.n ?? ITENS_POR_RODADA['casa-som']).map((palavra) => {
    const b = bandejaDaEncomenda(p, palavra, r);
    return { palavra, letras: b.letras, distratoras: b.distratoras, habilidade: HABILIDADE_CASA };
  });
}

/* ============================================ casinha, garagem e desafios ============================================ */

export const dadosJogosVila = (p: Progresso): DadosJogosVila => ({ moveis: [], posicoes: {}, ...(p.jogosVila ?? {}) });

/** Lugar inicial de um móvel novo na sala (em %: o pé do móvel no chão), espalhado em grade para não cair um em cima do outro. */
export function lugarInicial(k: number): { x: number; y: number } {
  const col = k % 4;
  const lin = Math.floor(k / 4) % 3;
  return { x: 14 + col * 24, y: 74 + lin * 9 };
}

/** O móvel chegou (brincadeira: chega mesmo se a escrita não saiu certa; o domínio vem só da tentativa avaliada). */
export function receberMovel(p: Progresso, palavra: string): Progresso {
  const d = dadosJogosVila(p);
  if (d.moveis.includes(palavra)) return p;
  return { ...p, jogosVila: { ...d, moveis: [...d.moveis, palavra], posicoes: { ...d.posicoes, [palavra]: lugarInicial(d.moveis.length) } } };
}

/** Arrastar o móvel: guarda o lugar (preso dentro da sala). */
export function moverMovel(p: Progresso, palavra: string, x: number, y: number): Progresso {
  const d = dadosJogosVila(p);
  if (!d.moveis.includes(palavra)) return p;
  const lim = (v: number, a: number, b: number) => Math.round(Math.min(b, Math.max(a, v)) * 10) / 10;
  return { ...p, jogosVila: { ...d, posicoes: { ...d.posicoes, [palavra]: { x: lim(x, 6, 94), y: lim(y, 30, 92) } } } };
}

/** Cores do carro/barco [DP]: as duas primeiras são de graça; as outras se compram com moedinhas da jornada (D002; sem dinheiro). */
export const CORES_VEICULO: { id: string; nome: string; cor: string; preco: number }[] = [
  { id: 'cor-vermelho', nome: 'Vermelho', cor: '#e8483b', preco: 0 },
  { id: 'cor-azul', nome: 'Azul', cor: '#2f7de1', preco: 0 },
  { id: 'cor-amarelo', nome: 'Amarelo', cor: '#f4c430', preco: 3 },
  { id: 'cor-verde', nome: 'Verde', cor: '#3bb273', preco: 3 },
  { id: 'cor-roxo', nome: 'Roxo', cor: '#8e5bd6', preco: 4 },
  { id: 'cor-laranja', nome: 'Laranja', cor: '#f28b30', preco: 4 }
];
export const corLiberada = (p: Progresso, id: string): boolean => (CORES_VEICULO.find((c) => c.id === id)?.preco ?? 1) === 0 || p.itens.includes(id);
export function escolherCor(p: Progresso, id: string): Progresso {
  if (!corLiberada(p, id)) return p;
  return { ...p, jogosVila: { ...dadosJogosVila(p), corVeiculo: id } };
}

/**
 * Desafio opcional no fim de uma missão (47 §5.1: "primeiro dentro dos desafios"): a fase oferece o jogo cuja habilidade
 * ela acabou de trabalhar. Pares mínimos → Estrada (com os pares DESTA fase); leitura com figura → Carteiro; ditado → Casa do Som.
 * Só quando o jogo tem itens com o que a criança já estudou (a fase recém-concluída conta). Nunca obrigatório.
 */
export function desafioDaFase(p: Progresso, faseId: string): { jogo: JogoVilaId; variacao?: VariacaoEstrada } | null {
  const f = FASES_TF.find((x) => x.id === faseId);
  if (!f || p.fases[faseId]?.estado !== 'concluida') return null;
  const tipos = new Set(f.cenas.map((c) => c.atividade?.tipo));
  if (tipos.has('parMinimo')) {
    for (const v of ['ouvir', 'ler'] as const) if (bancoDaEstrada(p, v, faseId).length) return { jogo: 'estrada-pares', variacao: v };
  }
  if (tipos.has('ditado') && casaLiberada(p).liberada) return { jogo: 'casa-som' };
  if (f.cenas.some((c) => c.atividade?.tipo === 'escolher' && (c.atividade as AtividadeEscolher).itens.some((i) => i.formato === 'ler-figura')) && carteiroLiberado(p).liberada) return { jogo: 'carteiro' };
  return null;
}
