/**
 * JOGOS FÔNICOS (D032 §4; docs/pesquisa/47 §3 G1 e G5, §5.1): regras puras dos dois primeiros jogos.
 *
 *  - CORRE-SOM (corredor de 3 pistas): ouve o SOM PURO (regra 1) e passa pelo arco da LETRA desse som (variação "letra",
 *    FG som → letra) ou da FIGURA que começa com esse som (variação "figura", CFN-INI). Nomes e arte são do projeto (regra 9).
 *  - BICHINHO COME-SOM (o Bolota com fome de sons): ouve o som e dá a comida/figura que COMEÇA com ele (variação "inicio",
 *    CFN-INI) ou que TERMINA com ele (variação "fim", CFN-FIM). Só escuta e toque: nada para ler (05 §3).
 *
 * Regras de não entregar a resposta (docs/pedagogia/04 §1): 3 opções (R8); posição da certa sorteada e nunca a mesma duas vezes
 * seguidas (R5); a rodada traz outros itens e outra ordem a cada vez (R6); depois do 1º contato, um distrator parecido quando
 * dá (R7: f/v, m/n, p/b…); estímulo = som real, nunca o nome da letra (R9; o app só usa fonema com clipe, `temSom`).
 * Só entra som/letra JÁ ENSINADO numa fase concluída da jornada (`letrasComSomVisto`; regra 2 e 05 §3): as figuras são só
 * ouvidas (palavra falada é livre, 05 §3), mas o som pedido e os sons dos distratores são todos de letras já ensinadas.
 *
 * O que conta (regra 4): só a escolha conferida, gravada como tentativa AVALIADA (mecânica 'corre-som'/'come-som'). Moedinhas
 * da pista, distância, pulos e "o Bolota ficou feliz" NÃO viram tentativa. Contexto: 'livre' no Brincar; 'desafio' quando o
 * jogo substitui, por escolha da criança, uma cena "som → letra" ou "som → figura" de uma fase (mesmos itens da fase).
 * Números marcados [DP] são decisão do projeto, a calibrar com uso real.
 */
import { FIGURAS, LETRA_POR_ID, SONS_DUVIDOSOS, LICAO_DA_LETRA, PALAVRAS_SEM_VOZ, PARES_DE_VOZ, SONS_PARECIDOS, figurasDoSom, fonemasDasLetras, habilidadeLetra, habilidadeTF, parConfuso, usaSomReal } from '@fonema/conteudo';
import type { AtividadeEscolher, Fala, ItemEscolha } from '@fonema/conteudo';
import type { CategoriaAlvo, Progresso } from './estado.ts';
import { letrasComSomVisto } from './sondagem-itens.ts';

export type JogoFonicoId = 'corre-som' | 'come-som';
export type VariacaoCorreSom = 'letra' | 'figura';
export type VariacaoComeSom = 'inicio' | 'fim';
export type VariacaoJogo = VariacaoCorreSom | VariacaoComeSom;

/** Uma opção do jogo: letra (arco com letra) ou figura. `som` = o som que ela faz (letra) ou com que começa/termina (figura). */
export interface OpcaoJogo {
  id: string;
  letra?: string;
  figura?: string;
  som: string;
  /** Nome combinado da figura (dito ao tocar no alto-falante dela, 04 R10). */
  falar?: string;
}

export interface ItemJogo {
  /** O id da opção certa (letra ou palavra). */
  correta: string;
  /** Som tocado como estímulo (chave do fonema; regra 1: nunca o nome da letra). */
  somAlvo: string;
  /** Opções na ORDEM DA TELA (pista 0, 1, 2). */
  opcoes: OpcaoJogo[];
  posicaoCerta: number;
  habilidade: string;
  formato: 'som-letra' | 'som-figura' | 'som-final';
  categoria: CategoriaAlvo;
  /** Dito depois do acerto ("Isso! Esse é o som do B."), quando o item veio de uma fase. */
  apoio?: Fala;
  /**
   * D034: rodada de AQUECIMENTO (menos de 3 sons ensinados): o som pedido é sempre um som já ensinado, mas as outras figuras
   * começam/terminam com sons ainda não ensinados (só ouvidos: 05 §3). Grava como EXPOSIÇÃO (regra 4), não como domínio.
   */
  aquecimento?: boolean;
}

/** Quantas escolhas por rodada [DP] (pedido: 6 a 10; rodadas curtas, pesquisa 47 §5.1). */
export const ESCOLHAS_POR_RODADA: Record<JogoFonicoId, number> = { 'corre-som': 6, 'come-som': 6 };
/** Mínimo de sons ensinados para o jogo abrir (3 opções diferentes, R8). */
export const MINIMO_DE_SONS = 3;

/** Habilidade nova do Bichinho (fim): "acha o último som das palavras" (CFN-FIM, docs/pedagogia/02). */
export const HABILIDADE_SOM_FINAL = 'som-final';
export const HABILIDADE_SOM_INICIAL = 'som-inicial';

/* ------------------------------------------------------------ sorteio ------------------------------------------------------------ */

/** Gerador determinístico (mesma semente → mesma rodada; testes). */
export function geradorJogo(semente: number): () => number {
  let a = semente >>> 0 || 1;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function misturar<T>(xs: readonly T[], r: () => number): T[] {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
/**
 * Põe a certa numa posição sorteada que NÃO repete a do item anterior (R5). `anterior.pos` guarda a última posição.
 * Exportada para o teste e para as cenas de fase convertidas em jogo.
 */
export function posicionarCerta<T>(certa: T, outras: T[], r: () => number, anterior: { pos: number }): { opcoes: T[]; pos: number } {
  const n = outras.length + 1;
  let pos = Math.floor(r() * n);
  if (pos === anterior.pos && n > 1) pos = (pos + 1 + Math.floor(r() * (n - 1))) % n;
  anterior.pos = pos;
  const opcoes = misturar(outras, r);
  opcoes.splice(pos, 0, certa);
  return { opcoes, pos };
}

/* ------------------------------------------------------------ o que já foi ensinado ------------------------------------------------------------ */

export interface SomEnsinado { letra: string; som: string }

/**
 * D034 (desbloqueio progressivo): nos jogos LIVRES (Brincar) os sons "duvidosos" da auditoria entram, porque o clipe tocado é o
 * MESMO que a trilha já usa na apresentação e na correção desses sons (tf.ts › SILABA_DO_SOM: o item que conta na trilha usa a
 * sílaba; o som puro é o mesmo clipe). Nos desafios dentro da fase continuam de fora (`duvidosos: false`). Desligar aqui volta ao
 * comportamento anterior.
 */
export const DUVIDOSOS_NOS_JOGOS_LIVRES = true;

export interface OpcoesSons {
  /** Incluir os sons "duvidosos" da auditoria (padrão: `DUVIDOSOS_NOS_JOGOS_LIVRES`; desafio dentro da fase: false). */
  duvidosos?: boolean;
}

/**
 * Sons que a criança JÁ estudou numa fase concluída (Trilha A–Z, Trilha dos Sons, vogais, Vale do M-L-F), um por som:
 * só letras do som real (sem H, K, W, Y; 04 R9), só fonemas com clipe (`temSom`, quando informado) e, fora dos jogos livres,
 * sem os sons duvidosos da auditoria (SONS_DUVIDOSOS).
 */
export function sonsEnsinados(p: Progresso, temSom?: (fonema: string) => boolean, opts: OpcoesSons = {}): SomEnsinado[] {
  const comDuvidosos = opts.duvidosos ?? DUVIDOSOS_NOS_JOGOS_LIVRES;
  const out: SomEnsinado[] = [];
  for (const letra of letrasComSomVisto(p)) {
    const l = LETRA_POR_ID[letra];
    if (!l?.fonema || !usaSomReal(l)) continue;
    // som "duvidoso" na auditoria (L, V, J e os de estouro): na trilha ele nunca é o único estímulo de item que conta
    // (a Sofia fala a sílaba); no desafio dentro da fase ele fica de fora até a gravação conferida [DP]
    if (!comDuvidosos && SONS_DUVIDOSOS.some((d) => LETRA_POR_ID[d]?.fonema === l.fonema)) continue;
    if (temSom && !temSom(l.fonema)) continue;
    if (out.some((x) => x.som === l.fonema)) continue;
    out.push({ letra, som: l.fonema });
  }
  return out;
}

/** Os dois sons se parecem (par de voz, par confundível, ou letras do mesmo grupo de sons parecidos)? */
function parecidos(a: SomEnsinado, b: SomEnsinado): boolean {
  if (parConfuso(a.som, b.som)) return true;
  if (PARES_DE_VOZ.some(([x, y]) => (x === a.som && y === b.som) || (x === b.som && y === a.som))) return true;
  return SONS_PARECIDOS.some((g) => g.includes(a.letra) && g.includes(b.letra));
}

/**
 * Dois distratores para o alvo, entre os sons ensinados: um PARECIDO quando existe (R7), o outro distante; nunca dois
 * distratores parecidos entre si (o item testaria outra coisa). `filtro` restringe quem pode ser distrator (ex.: tem figura).
 */
function distratores(alvo: SomEnsinado, sons: SomEnsinado[], r: () => number, filtro: (s: SomEnsinado) => boolean = () => true, comParecido = true): SomEnsinado[] {
  const outros = misturar(sons.filter((s) => s.som !== alvo.som && filtro(s)), r);
  // D035 (corrida, nível 1): sem distrator parecido quando dá (`comParecido: false`); não muda o sorteio do padrão
  const parecido = comParecido ? outros.find((s) => parecidos(alvo, s)) : undefined;
  const out: SomEnsinado[] = parecido ? [parecido] : [];
  for (const s of outros) {
    if (out.length >= 2) break;
    if (out.includes(s) || out.some((y) => parecidos(y, s)) || (!comParecido && parecidos(alvo, s))) continue;
    out.push(s);
  }
  for (const s of outros) { if (out.length >= 2) break; if (!out.includes(s)) out.push(s); }
  return out.slice(0, 2);
}

/** Habilidade da letra: a da Trilha dos Sons se a lição do som já foi concluída; senão a da Trilha A–Z. */
export function habilidadeDoSom(p: Progresso, letra: string): string {
  const licao = LICAO_DA_LETRA[letra];
  return licao && p.fases[licao]?.estado === 'concluida' ? habilidadeTF(letra) : habilidadeLetra(letra);
}

/* ------------------------------------------------------------ figuras ------------------------------------------------------------ */

/** Figuras (com arte e voz) que começam com o som da letra; a palavra-chave da letra fica por último (04 R1). */
export function figurasQueComecam(letra: string): string[] {
  const l = LETRA_POR_ID[letra];
  return l ? figurasDoSom(l) : [];
}

/** Sons de fim de palavra usados no "termina com" [DP]: as vogais A, I, U (o O e o E do fim soam U e I: pato, chave). */
export const SONS_FINAIS: Record<string, string> = { a: 'A', i: 'I', u: 'U' };

/**
 * Banco do "termina com": figuras com arte e voz cujo ÚLTIMO som é uma vogal clara (sem final nasal, L ou R no fim).
 * O som final vem das regras do pt-BR (`fonemasDasLetras`: pato → u, chave → i).
 */
export const FIGURAS_SOM_FINAL: { palavra: string; som: string }[] = (() => {
  const palavras = new Set<string>();
  for (const l of Object.keys(LETRA_POR_ID)) for (const w of figurasQueComecam(l)) palavras.add(w);
  for (const w of ['pato', 'sapato', 'tomate', 'tapete', 'peixe', 'chave', 'bola', 'mesa', 'panela', 'casa', 'pipoca', 'tatu', 'kiwi']) if (FIGURAS[w]) palavras.add(w);
  const out: { palavra: string; som: string }[] = [];
  for (const w of [...palavras].sort()) {
    if (PALAVRAS_SEM_VOZ.includes(w) || /[ãõmnlrsz]$|ão$/i.test(w) || /[A-Z]/.test(w[0])) continue;
    const sons = fonemasDasLetras(w).filter((s): s is string => !!s);
    const fim = sons[sons.length - 1];
    if (fim && SONS_FINAIS[fim]) out.push({ palavra: w, som: fim });
  }
  return out;
})();

/** Figuras de comer (o Bichinho prefere estas; sem comida para um som, vale outra figura com voz). */
export const COMIDAS = new Set(['uva', 'abacaxi', 'banana', 'jaca', 'pipoca', 'peixe', 'ovo', 'suco', 'tomate', 'queijo', 'quiabo', 'doce', 'kiwi', 'mel', 'yakisoba', 'ketchup', 'wafer']);
const comidaPrimeiro = (ws: string[]) => [...ws.filter((w) => COMIDAS.has(w)), ...ws.filter((w) => !COMIDAS.has(w))];

const opFigura = (palavra: string, som: string): OpcaoJogo => ({ id: palavra, figura: palavra, som, falar: palavra });
const opLetra = (s: SomEnsinado): OpcaoJogo => ({ id: s.letra, letra: s.letra, som: s.som });

/* ------------------------------------------------------------ variações liberadas ------------------------------------------------------------ */

export interface EstadoJogo { variacao: VariacaoJogo; liberada: boolean; motivo?: string; /** D034: abre já, com menos de 3 sons (rodada de aquecimento, não conta). */ aquecimento?: boolean; /** Sons que já entram (para a barrinha). */ sons?: number }

/** D034: variações de escuta (figura falada) abrem com 1 som ensinado; com menos de 3 é aquecimento (não conta). */
export const MINIMO_DE_SONS_ESCUTA = 1;

/**
 * Variações abertas pelo que já foi ensinado (pedido do dono: "variações que dependem do que já foi ensinado"; D034: "liberar
 * conforme ele for realizando"):
 *  - Corre-Som "letra": 3 sons ensinados (as 3 placas são letras: só letra ensinada aparece, regra 2).
 *  - Corre-Som "figura" e Bichinho "inicio": 1 som ensinado com figura (com 1 ou 2, rodada de aquecimento: as figuras são só ouvidas).
 *  - Bichinho "fim": 1 das vogais A, I, U ensinada (com as 3, conta; antes, aquecimento).
 */
export function variacoesDoJogo(p: Progresso, jogo: JogoFonicoId, temSom?: (fonema: string) => boolean): EstadoJogo[] {
  const sons = sonsEnsinados(p, temSom);
  const comFigura = sons.filter((s) => figurasQueComecam(s.letra).length > 0);
  const finais = Object.keys(SONS_FINAIS).filter((s) => sons.some((x) => x.som === s));
  const falta = (n: number) => `${n > 1 ? 'Faltam' : 'Falta'} ${n} som${n > 1 ? 's' : ''} da trilha para abrir.`;
  const escuta = (variacao: VariacaoJogo, n: number, completo: number): EstadoJogo => n >= MINIMO_DE_SONS_ESCUTA
    ? { variacao, liberada: true, sons: n, ...(n < completo ? { aquecimento: true } : {}) }
    : { variacao, liberada: false, sons: n, motivo: variacao === 'fim' ? 'Abre quando a vogal A, I ou U for ensinada.' : falta(MINIMO_DE_SONS_ESCUTA - n) };
  if (jogo === 'corre-som') {
    return [
      { variacao: 'letra', liberada: sons.length >= MINIMO_DE_SONS, sons: sons.length, ...(sons.length < MINIMO_DE_SONS ? { motivo: falta(MINIMO_DE_SONS - sons.length) } : {}) },
      escuta('figura', comFigura.length, MINIMO_DE_SONS)
    ];
  }
  return [escuta('inicio', comFigura.length, MINIMO_DE_SONS), escuta('fim', finais.length, 3)];
}

/**
 * D034: letras "de apoio" para as figuras distratoras do aquecimento (menos de 3 sons ensinados). Só som claro no começo da
 * palavra falada (sem C, G, X, H, K, Q, R, W, Y, que mudam de som). A figura é só OUVIDA (05 §3); a letra nunca aparece.
 */
const LETRAS_DE_APOIO = ['M', 'F', 'S', 'N', 'V', 'L', 'J', 'P', 'T', 'B', 'D', 'Z', 'A', 'E', 'I', 'O', 'U'];
function sonsDeApoio(ensinados: SomEnsinado[]): SomEnsinado[] {
  return LETRAS_DE_APOIO
    .filter((l) => !ensinados.some((s) => s.letra === l || s.som === LETRA_POR_ID[l]?.fonema))
    .filter((l) => !!LETRA_POR_ID[l]?.fonema && figurasQueComecam(l).length > 0)
    .map((l) => ({ letra: l, som: LETRA_POR_ID[l].fonema! }));
}

/* ------------------------------------------------------------ rodadas ------------------------------------------------------------ */

export interface PedidoRodada {
  variacao: VariacaoJogo;
  semente: number;
  /** Número de escolhas (padrão: ESCOLHAS_POR_RODADA). */
  n?: number;
  temSom?: (fonema: string) => boolean;
  /** D035: distrator PARECIDO quando existe (R7; padrão). `false` = distratores distantes (corrida, nível 1). */
  parecidos?: boolean;
}

/** Ordem dos alvos: cada som ensinado entra uma vez antes de repetir (rodada variada, R6), sem o mesmo alvo duas vezes seguidas. */
function alvos<T>(lista: T[], n: number, r: () => number): T[] {
  const out: T[] = [];
  while (out.length < n && lista.length) {
    const volta = misturar(lista, r);
    if (out.length && volta.length > 1 && volta[0] === out[out.length - 1]) volta.push(volta.shift()!);
    out.push(...volta);
  }
  return out.slice(0, n);
}

/**
 * Monta uma rodada do jogo só com o que a criança já estudou. Vazia quando a variação ainda não abriu.
 * Com a mesma semente a rodada é a mesma (teste); o app passa uma semente nova a cada rodada.
 */
export function montarRodada(p: Progresso, jogo: JogoFonicoId, pedido: PedidoRodada): ItemJogo[] {
  const { variacao, semente, temSom } = pedido;
  const n = pedido.n ?? ESCOLHAS_POR_RODADA[jogo];
  if (!variacoesDoJogo(p, jogo, temSom).find((v) => v.variacao === variacao)?.liberada) return [];
  const r = geradorJogo(semente);
  const sons = sonsEnsinados(p, temSom);
  const ant = { pos: -1 };

  if (variacao === 'letra') {
    return alvos(sons, n, r).map((alvo) => {
      const { opcoes, pos } = posicionarCerta(opLetra(alvo), distratores(alvo, sons, r, undefined, pedido.parecidos ?? true).map(opLetra), r, ant);
      return { correta: alvo.letra, somAlvo: alvo.som, opcoes, posicaoCerta: pos, habilidade: habilidadeDoSom(p, alvo.letra), formato: 'som-letra' as const, categoria: 'grafema' as const };
    });
  }

  if (variacao === 'figura' || variacao === 'inicio') {
    const temFig = (s: SomEnsinado) => figurasQueComecam(s.letra).length > 0;
    const comFigura = sons.filter(temFig);
    const usadas = new Set<string>();
    /** Uma figura do som, de preferência ainda não usada na rodada e que não seja a palavra-chave da letra (R1). */
    const figuraDe = (s: SomEnsinado) => {
      const fs = figurasQueComecam(s.letra);
      const chave = LETRA_POR_ID[s.letra].palavra;
      const livres = fs.filter((w) => !usadas.has(w));
      const boas = livres.filter((w) => w !== chave);
      const ordem = (xs: string[]) => (jogo === 'come-som' ? comidaPrimeiro(misturar(xs, r)) : misturar(xs, r));
      const w = (boas.length ? ordem(boas)[0] : livres.length ? livres[0] : misturar(fs, r)[0]);
      usadas.add(w);
      return w;
    };
    // D034: com menos de 3 sons, aquecimento: o som pedido é ensinado; as outras figuras vêm de sons de apoio (só ouvidas)
    const aquecimento = comFigura.length < MINIMO_DE_SONS;
    const apoio = aquecimento ? sonsDeApoio(sons) : [];
    return alvos(comFigura, n, r).map((alvo) => {
      const certa = opFigura(figuraDe(alvo), alvo.som);
      let ds = distratores(alvo, comFigura, r, temFig, pedido.parecidos ?? true);
      if (ds.length < 2) {
        const extra = misturar(apoio.filter((s) => s.som !== alvo.som && !parecidos(alvo, s) && !ds.some((d) => d.som === s.som || parecidos(d, s))), r);
        ds = [...ds, ...extra].slice(0, 2);
      }
      const outras = ds.map((s) => opFigura(figuraDe(s), s.som));
      const { opcoes, pos } = posicionarCerta(certa, outras, r, ant);
      return { correta: certa.id, somAlvo: alvo.som, opcoes, posicaoCerta: pos, habilidade: HABILIDADE_SOM_INICIAL, formato: 'som-figura' as const, categoria: 'fonema' as const, ...(aquecimento ? { aquecimento: true } : {}) };
    });
  }

  // fim: o som do fim (a, i, u); as outras duas figuras terminam com os outros dois sons
  const finais = Object.keys(SONS_FINAIS);
  const usadas = new Set<string>();
  const figuraQueTermina = (som: string) => {
    const fs = FIGURAS_SOM_FINAL.filter((f) => f.som === som && !usadas.has(f.palavra));
    const lista = misturar(fs.length ? fs : FIGURAS_SOM_FINAL.filter((x) => x.som === som), r);
    const f = lista.find((x) => COMIDAS.has(x.palavra)) ?? lista[0];
    usadas.add(f.palavra);
    return f.palavra;
  };
  // D034: só os finais já ensinados são PEDIDOS; as outras figuras terminam com os outros finais (só ouvidas). Com menos de 3, aquecimento.
  const pedidos = finais.filter((f) => sons.some((x) => x.som === f));
  const aquecimento = pedidos.length < finais.length;
  return alvos(pedidos, n, r).map((som) => {
    const certa = opFigura(figuraQueTermina(som), som);
    const outras = finais.filter((s) => s !== som).map((s) => opFigura(figuraQueTermina(s), s));
    const { opcoes, pos } = posicionarCerta(certa, outras, r, ant);
    return { correta: certa.id, somAlvo: som, opcoes, posicaoCerta: pos, habilidade: HABILIDADE_SOM_FINAL, formato: 'som-final' as const, categoria: 'fonema' as const, ...(aquecimento ? { aquecimento: true } : {}) };
  });
}

/* ------------------------------------------------------------ desafio dentro da fase ------------------------------------------------------------ */

export interface DesafioDaCena { jogo: JogoFonicoId; variacao: VariacaoJogo; itens: ItemJogo[] }

/**
 * Uma cena de fase pode virar jogo (pesquisa 47 §5.1: "o jogo é uma pele de um tipo de item que já existe")? Só quando TODOS os
 * itens são "som → letra" com som real e opções-letra (→ Corre-Som), ou TODOS "som → figura" com som real e figuras com som
 * (→ Bichinho Come-Som). Os itens continuam os da fase (já passaram pelo verificador): o jogo só muda a forma de responder.
 * Item com 4 opções (letra minúscula) fica com 3 no corredor de 3 pistas: sai um distrator distante, nunca o parecido (R7, R8).
 */
export function desafioDaCena(atividade: Pick<AtividadeEscolher, 'itens' | 'habilidade' | 'tipo'>, semente = 0): DesafioDaCena | null {
  const itens = atividade.itens;
  if (!itens.length) return null;
  const somLetra = itens.every((i) => i.formato === 'som-letra' && !!i.somAlvo && i.opcoes.length >= 3 && i.opcoes.every((o) => !!o.letra && !!o.som && !o.botaoDeSom));
  const somFigura = itens.every((i) => i.formato === 'som-figura' && !!i.somAlvo && i.opcoes.length >= 3 && i.opcoes.every((o) => !o.letra && !o.botaoDeSom && !!o.som));
  if (!somLetra && !somFigura) return null;
  const r = geradorJogo(semente);
  const ant = { pos: -1 };
  const converter = (i: ItemEscolha): ItemJogo => {
    const certa = i.opcoes.find((o) => o.id === i.correta)!;
    const somCerto = i.somCorreta ?? i.somAlvo!;
    let outras = i.opcoes.filter((o) => o.id !== i.correta);
    if (outras.length > 2) {
      const parecida = outras.find((o) => parConfuso(o.som!, somCerto));
      outras = [...(parecida ? [parecida] : []), ...outras.filter((o) => o !== parecida)].slice(0, 2);
    }
    const ficam = new Set([certa, ...outras]);
    const op = (o: (typeof i.opcoes)[number]): OpcaoJogo => (o.letra ? { id: o.id, letra: o.letra, som: o.som! } : { id: o.id, figura: o.id, som: o.som!, falar: o.falar ?? o.id });
    // semente 0 (modo de teste): a ordem do conteúdo; senão a posição da certa é sorteada de novo, sem repetir a anterior (R5)
    const opcoes = semente ? posicionarCerta(op(certa), outras.map(op), r, ant).opcoes : i.opcoes.filter((o) => ficam.has(o)).map(op);
    return {
      correta: i.correta, somAlvo: i.somAlvo!, opcoes, posicaoCerta: opcoes.findIndex((o) => o.id === i.correta), habilidade: i.habilidade ?? atividade.habilidade,
      formato: somLetra ? 'som-letra' : 'som-figura', categoria: somLetra ? 'grafema' : 'fonema', ...(i.apoio ? { apoio: i.apoio } : {})
    };
  };
  return { jogo: somLetra ? 'corre-som' : 'come-som', variacao: somLetra ? 'letra' : 'inicio', itens: itens.map(converter) };
}

/** O que vai para o registro: a letra (som → letra) ou o SOM da figura (som → figura / som final), como no Escolher. */
export const idDoRegistro = (item: Pick<ItemJogo, 'formato'>, o: OpcaoJogo): string => (item.formato === 'som-letra' ? o.id : o.som);
