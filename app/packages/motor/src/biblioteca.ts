/**
 * CANTINHO DA LEITURA e BRINCAR COM SONS (D030 etapa 8): regras puras do registro, da fluência e da escrita própria.
 *
 * - Jogos de escuta, perguntas de história e de texto: tentativas AVALIADAS (a criança escolheu, o app conferiu), com
 *   `contexto: 'livre'`. Firmam habilidade como qualquer resposta conferida, mas não travam nenhuma fase.
 * - Previsão de história, eco, coro e escrita própria: NÃO viram tentativa (exposição/autorrelato não provam aprendizado,
 *   regra 4 do CLAUDE.md). Ficam só no resumo `Progresso.biblioteca`, para o adulto ver.
 * - Fluência (docs/pedagogia/02 FLU-PAL-01; 06 §6): releitura de lista de palavras que a criança JÁ LEU CERTO na trilha,
 *   só quando a precisão de leitura recente é ≥ 95% (ABC p. 375–376). Cada palavra é conferida pela escolha da figura;
 *   o microfone, quando ligado, é só apoio. Mede palavras certas por minuto, sem meta numérica (06 §6: as metas do ABC
 *   p. 379 são de Portugal) — o gráfico compara a criança com ela mesma.
 * Números marcados [DP] são decisão do projeto, a calibrar com uso real.
 */
import { FASES_TF, HABILIDADE_POR_ID, TEXTOS_DECODIFICAVEIS, numeroDaUnidade, verificarPalavra } from '@fonema/conteudo';
import type { Cena, ConfigPlataforma, EntradaBanco, TextoDecodificavel } from '@fonema/conteudo';
import type { ConquistaGanha, Demonstracao, Progresso, Tentativa } from './estado.ts';
import { aplicarAtividade } from './jornada.ts';
import { avaliarDominio } from './dominio.ts';
import { agendarRevisao } from './revisao.ts';
import { avaliarConquistas } from './conquistas.ts';
import { acertoSozinho, ehAvaliada } from './tentativas.ts';

/* ------------------------------------------------------------ dados guardados ------------------------------------------------------------ */

export interface RegistroFluencia {
  em: number;
  /** Número da lista (a mesma lista é relida até firmar: leitura repetida, ABC p. 375–376). */
  lista: number;
  palavras: string[];
  /** Palavras certas na 1ª escolha. */
  certas: number;
  total: number;
  /** Soma do tempo de leitura das palavras (da palavra aparecer até a escolha certa), em ms. */
  tempoMs: number;
  /** Palavras certas por minuto. */
  ppm: number;
  precisao: number;
  /** Microfone ligado e quantas palavras o reconhecimento de fala ouviu (só apoio; nunca entra na nota). */
  microfone?: { ligado: boolean; ouviu: number };
}

export interface EscritaPropria {
  em: number;
  palavra: string;
  /** O que a criança escreveu, do jeito dela (letras na ordem). */
  escrito: string;
  /** 1 = primeira escrita; 2 = reescrita depois do confronto (sem modelo). */
  vez: 1 | 2;
}

export interface DadosBiblioteca {
  fluencia: RegistroFluencia[];
  escritas: EscritaPropria[];
  historias: { id: string; em: number; acertos: number; total: number }[];
  textos: { id: string; em: number; acertos: number; total: number; ouviuSons: number }[];
  /** Leituras em eco e em coro feitas (autorrelato: só conta participação). */
  eco: { em: number; modo: 'eco' | 'coro'; frases: number }[];
  jogos: { id: string; em: number; acertos: number; total: number }[];
}

export const bibliotecaVazia = (): DadosBiblioteca => ({ fluencia: [], escritas: [], historias: [], textos: [], eco: [], jogos: [] });
export const dadosBiblioteca = (p: Progresso): DadosBiblioteca => ({ ...bibliotecaVazia(), ...(p.biblioteca ?? {}) });

/** Junta um resumo ao progresso (sem tentativas). */
export function anotarBiblioteca(p: Progresso, mudar: (d: DadosBiblioteca) => DadosBiblioteca): Progresso {
  return { ...p, biblioteca: mudar(dadosBiblioteca(p)) };
}

/* ------------------------------------------------------------ registro das respostas ------------------------------------------------------------ */

/**
 * Registra as respostas conferidas de uma atividade livre (jogo, história, texto, fluência). Como o treino rápido:
 * passa pelo motor (`aplicarAtividade`), firma domínio quando o critério é cumprido, avalia selos. Sem moedinhas.
 */
export function registrarLivre(
  p0: Progresso,
  args: { sessao: string; cena: Pick<Cena, 'id' | 'titulo'>; tentativas: Tentativa[]; cfg: ConfigPlataforma; agora: number; demonstracoes?: Demonstracao[] },
  resumo?: (d: DadosBiblioteca) => DadosBiblioteca
): { progresso: Progresso; novas: ConquistaGanha[]; dominadasAgora: string[] } {
  const { sessao, cfg, agora } = args;
  const cena: Cena = { id: args.cena.id, titulo: args.cena.titulo, tipo: 'C5', cenario: 'biblioteca' };
  // 'desafio' (jogo opcional dentro de uma fase, D032 §4) fica marcado como tal; o resto é 'livre'
  const marcadas = args.tentativas.map((t) => ({ ...t, sessao, contexto: t.contexto === 'desafio' ? 'desafio' as const : 'livre' as const }));
  let p = aplicarAtividade(p0, { sessao, cena, tentativas: marcadas, tentouDeNovo: 0 }, cfg, agora);
  const habilidades = { ...p.habilidades };
  const dominadasAgora: string[] = [];
  for (const id of new Set(marcadas.filter((t) => ehAvaliada(t)).map((t) => t.habilidade))) {
    const h = habilidades[id];
    if (!h || (h.dominadaEm && !h.aConfirmar)) continue;
    if (!avaliarDominio(h, cfg.dominio, HABILIDADE_POR_ID[id]?.exigePseudo ?? false).dominado) continue;
    if (h.dominadaEm) habilidades[id] = { ...h, aConfirmar: undefined };
    else { habilidades[id] = agendarRevisao({ ...h, dominadaEm: agora }, agora, cfg.revisao.intervalosDias); dominadasAgora.push(id); }
  }
  p = { ...p, habilidades };
  if (resumo) p = anotarBiblioteca(p, resumo);
  const ac = avaliarConquistas(p, args.demonstracoes ?? [], agora);
  return { progresso: ac.progresso, novas: ac.novas, dominadasAgora };
}

/* ------------------------------------------------------------ o que já está liberado ------------------------------------------------------------ */

const UNIDADE_DA_REVISAO: Record<string, string> = { 'TF-R2': 'TF-15', 'TF-R3': 'TF-22' };

/** Maior unidade da Trilha dos Sons já CONCLUÍDA (0 = nenhuma). Revisões valem como a última unidade do bloco. */
export function unidadeConcluida(p: Progresso): number {
  let n = 0;
  for (const f of FASES_TF) {
    if (p.fases[f.id]?.estado !== 'concluida') continue;
    n = Math.max(n, numeroDaUnidade(UNIDADE_DA_REVISAO[f.id] ?? f.id));
  }
  return n;
}

export const textoLiberado = (p: Progresso, t: TextoDecodificavel) => t.liberaCom.some((id) => p.fases[id]?.estado === 'concluida');
export const textosLiberados = (p: Progresso) => TEXTOS_DECODIFICAVEIS.filter((t) => textoLiberado(p, t));

/* ------------------------------------------------------------ fluência ------------------------------------------------------------ */

/** Habilidades de LEITURA cujas respostas entram na precisão (decodificar palavra, frase e texto). */
export const HABILIDADES_DE_LEITURA = ['leitura-cvcv', 'leitura-vogais', 'leitura-frase', 'leitura-texto', 'fluencia-palavras'];
/** Precisão mínima para treinar fluência (ABC p. 375–376). */
export const FLUENCIA_PRECISAO_MIN = 0.95;
/** [DP] Quantas respostas de leitura recentes entram na conta, e o mínimo para a conta valer. */
export const FLUENCIA_JANELA = 20;
export const FLUENCIA_MIN_RESPOSTAS = 10;
/** [DP] Tamanho da lista e quantas releituras firmes antes de trocar de lista. */
export const FLUENCIA_TAMANHO_LISTA = 8;
export const FLUENCIA_MIN_PALAVRAS = 6;
export const FLUENCIA_RELEITURAS = 3;

const leituras = (p: Progresso): Tentativa[] =>
  HABILIDADES_DE_LEITURA.flatMap((id) => p.habilidades[id]?.tentativas ?? []).filter((t) => ehAvaliada(t)).sort((a, b) => a.em - b.em);

/** Precisão de leitura recente: respostas certas, sem ajuda, nas últimas `FLUENCIA_JANELA` respostas conferidas. */
export function precisaoDeLeitura(p: Progresso): { precisao: number; respostas: number } {
  const ts = leituras(p).slice(-FLUENCIA_JANELA);
  if (!ts.length) return { precisao: 0, respostas: 0 };
  return { precisao: ts.filter(acertoSozinho).length / ts.length, respostas: ts.length };
}

/** Palavras REAIS, com figura, que a criança já leu certo e sozinha (na ordem em que leu pela primeira vez). */
export function palavrasJaLidas(p: Progresso, banco: Record<string, EntradaBanco>): string[] {
  const vistas = new Set<string>();
  const out: string[] = [];
  for (const t of leituras(p)) {
    if (!acertoSozinho(t) || !t.alvo) continue;
    const w = t.alvo.toLowerCase();
    const e = banco[w];
    if (!e || e.pseudo || !e.figura || vistas.has(w)) continue;
    vistas.add(w);
    out.push(w);
  }
  return out;
}

export type EstadoFluencia =
  | { liberada: false; motivo: 'precisao' | 'palavras'; precisao: number; respostas: number; palavras: number }
  | { liberada: true; lista: number; palavras: string[]; releituras: number; precisao: number };

/**
 * A lista de hoje: a mesma lista é relida (leitura repetida) até `FLUENCIA_RELEITURAS` leituras com precisão ≥ 95%;
 * depois vem a próxima. Trancada (com o motivo, para a tela explicar sem culpa) se a precisão ou as palavras não bastam.
 */
export function estadoFluencia(p: Progresso, banco: Record<string, EntradaBanco>): EstadoFluencia {
  const { precisao, respostas } = precisaoDeLeitura(p);
  const palavras = palavrasJaLidas(p, banco);
  if (respostas < FLUENCIA_MIN_RESPOSTAS || precisao < FLUENCIA_PRECISAO_MIN) return { liberada: false, motivo: 'precisao', precisao, respostas, palavras: palavras.length };
  if (palavras.length < FLUENCIA_MIN_PALAVRAS) return { liberada: false, motivo: 'palavras', precisao, respostas, palavras: palavras.length };
  const feitas = dadosBiblioteca(p).fluencia;
  let lista = feitas.length ? feitas[feitas.length - 1].lista : 0;
  const firmes = feitas.filter((r) => r.lista === lista && r.precisao >= FLUENCIA_PRECISAO_MIN).length;
  if (firmes >= FLUENCIA_RELEITURAS && (lista + 1) * FLUENCIA_TAMANHO_LISTA < palavras.length) lista++;
  let ws = palavras.slice(lista * FLUENCIA_TAMANHO_LISTA, (lista + 1) * FLUENCIA_TAMANHO_LISTA);
  if (ws.length < FLUENCIA_MIN_PALAVRAS) ws = palavras.slice(-FLUENCIA_TAMANHO_LISTA);
  return { liberada: true, lista, palavras: ws, releituras: feitas.filter((r) => r.lista === lista).length, precisao };
}

/** Monta o registro de uma leitura da lista (palavras certas por minuto a partir do tempo das palavras). */
export function resumoFluencia(lista: number, palavras: string[], itens: { certa: boolean; tempoMs: number; ouvido?: boolean }[], em: number, microfone: boolean): RegistroFluencia {
  const certas = itens.filter((i) => i.certa).length;
  const tempoMs = itens.reduce((s, i) => s + i.tempoMs, 0);
  const ppm = tempoMs > 0 ? Math.round((certas / (tempoMs / 60000)) * 10) / 10 : 0;
  return {
    em, lista, palavras, certas, total: itens.length, tempoMs, ppm, precisao: itens.length ? certas / itens.length : 0,
    ...(microfone ? { microfone: { ligado: true, ouviu: itens.filter((i) => i.ouvido).length } } : {})
  };
}

/**
 * Estrelinhas do caminho da criança [DP]: 1 por leitura feita; +1 quando leu tudo certo; +1 quando leu mais ligeiro que
 * a leitura anterior da mesma lista sem perder precisão. A criança vê o caminho; o número de ppm é para o adulto.
 */
export function estrelasDaLeitura(r: RegistroFluencia, anterior?: RegistroFluencia): number {
  let e = 1;
  if (r.certas === r.total) e++;
  if (anterior && anterior.lista === r.lista && r.ppm > anterior.ppm && r.precisao >= anterior.precisao) e++;
  return e;
}

/* ------------------------------------------------------------ escrita própria ------------------------------------------------------------ */

/** Palavras com figura que a criança já pode escrever (decodificáveis na unidade concluída; a partir do M, TF-07). */
export function palavrasParaEscrever(p: Progresso, banco: Record<string, EntradaBanco>): string[] {
  const n = unidadeConcluida(p);
  if (n < 7) return [];
  return Object.values(banco).filter((e) => !e.pseudo && e.figura && verificarPalavra(e.texto, n, banco).ok).map((e) => e.texto.toLowerCase());
}

export interface CasaAlinhada {
  tipo: 'igual' | 'faltou' | 'sobrou' | 'trocou';
  /** Letra da forma certa (ausente quando a criança pôs uma letra a mais). */
  certa?: string;
  /** Posição da letra na palavra certa. */
  pos?: number;
  /** Letra que a criança escreveu (ausente quando faltou). */
  escrita?: string;
}

/**
 * Alinha a escrita da criança com a forma certa, letra a letra (distância de edição), para o confronto da escrita própria
 * (docs/pedagogia/04 N13): o que é igual, o que faltou, o que sobrou e o que veio trocado. Nada é marcado como "errado".
 */
export function alinharEscrita(escrito: string, certo: string): CasaAlinhada[] {
  const a = [...escrito.toUpperCase()];
  const b = [...certo.toUpperCase()];
  const d: number[][] = Array.from({ length: a.length + 1 }, (_, i) => Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)));
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  }
  const out: CasaAlinhada[] = [];
  let i = a.length;
  let j = b.length;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && d[i][j] === d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)) {
      out.push({ tipo: a[i - 1] === b[j - 1] ? 'igual' : 'trocou', certa: b[j - 1], pos: j - 1, escrita: a[i - 1] });
      i--; j--;
    } else if (j > 0 && d[i][j] === d[i][j - 1] + 1) {
      out.push({ tipo: 'faltou', certa: b[j - 1], pos: j - 1 });
      j--;
    } else {
      out.push({ tipo: 'sobrou', escrita: a[i - 1] });
      i--;
    }
  }
  return out.reverse();
}
