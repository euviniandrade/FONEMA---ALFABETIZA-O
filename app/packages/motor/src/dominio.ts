/**
 * Critério de domínio (doc. mestre §4.5; jogo-completo README §3):
 *  (1) prática: P(domínio) ≥ 0,95, ≥ 8 tentativas em ≥ 2 sessões, 4 das últimas 5 certas
 *      e, nas habilidades de decodificação, ≥ 2 pseudopalavras certas;
 *  (2–4) generalização, transferência e retenção 24 h–7 d entram pela revisão espaçada (revisao.ts).
 * P(domínio) por BKT (Bayesian Knowledge Tracing) com parâmetros conservadores.
 *
 * DOMÍNIO HONESTO (D030, etapa 5): só tentativa AVALIADA entra na conta (a criança respondeu e o app conferiu).
 * Exposição (Letra, Espelho, Traçar) e autorrelato (Falar: "Li!") ficam registradas como PARTICIPAÇÃO: não mexem
 * na firmeza, não somam tentativas, sessões nem pseudopalavras.
 */
import { FASES } from '@fonema/conteudo';
import type { ConfigPlataforma, Fase } from '@fonema/conteudo';
import type { EstadoHabilidade, Tentativa } from './estado.ts';
import { TIPO_POR_MECANICA, acertoSozinho, ehAvaliada } from './tentativas.ts';
import { categoriaDoAlvo } from './confusao.ts';

export const BKT = { p0: 0.15, transicao: 0.2, chute: 0.25, deslize: 0.1 };

/** Atualiza P(domínio) com uma tentativa. Acerto com ajuda conta como meio acerto. */
export function atualizarP(p: number, acertou: boolean, comAjuda = false): number {
  const { transicao, chute, deslize } = BKT;
  let post: number;
  if (acertou && !comAjuda) {
    post = (p * (1 - deslize)) / (p * (1 - deslize) + (1 - p) * chute);
  } else if (acertou && comAjuda) {
    const pc = (p * (1 - deslize)) / (p * (1 - deslize) + (1 - p) * chute);
    const pe = (p * deslize) / (p * deslize + (1 - p) * (1 - chute));
    post = (pc + pe) / 2;
  } else {
    post = (p * deslize) / (p * deslize + (1 - p) * (1 - chute));
  }
  return Math.min(0.999, post + (1 - post) * transicao);
}

export function novaHabilidade(): EstadoHabilidade {
  return { tentativas: [], p: BKT.p0 };
}

/** Guarda a tentativa. Só a AVALIADA mexe na firmeza; exposição e autorrelato ficam como participação. */
export function registrarTentativa(h: EstadoHabilidade, t: Tentativa): EstadoHabilidade {
  return { ...h, tentativas: [...h.tentativas, t], p: ehAvaliada(t) ? atualizarP(h.p, t.acertou, t.comAjuda) : h.p };
}

/** Firmeza recalculada do zero, só com as tentativas avaliadas (migração de dados antigos). */
export function recalcularP(tentativas: Tentativa[]): number {
  return tentativas.filter(ehAvaliada).reduce((p, t) => atualizarP(p, t.acertou, t.comAjuda), BKT.p0);
}

/* ------------------------------ critério 5 de docs/pedagogia/06 §2: variedade ------------------------------ */

/** Tipo de atividade de uma tentativa: a mecânica e, quando houver, o formato do item ("escolher:som-letra"). */
export function tipoDeAtividade(t: Pick<Tentativa, 'mecanica' | 'formato'>): string | undefined {
  return t.mecanica ? `${t.mecanica}${t.formato ? `:${t.formato}` : ''}` : undefined;
}

/** Tipos de atividade AVALIADA que uma fase oferece, por habilidade (mesmo vocabulário de `tipoDeAtividade`). */
export function tiposDeAtividadeDaFase(f: Fase): Map<string, Set<string>> {
  const m = new Map<string, Set<string>>();
  const add = (h: string | undefined, tipo: string) => { if (h) m.set(h, (m.get(h) ?? new Set()).add(tipo)); };
  for (const c of f.cenas) {
    const a = c.atividade;
    if (!a || !c.contaDominio || (TIPO_POR_MECANICA[a.tipo] ?? 'avaliada') !== 'avaliada') continue;
    if (a.tipo === 'escolher') { for (const i of a.itens) if (i.formato !== 'silaba-falta') add(i.habilidade ?? a.habilidade, `escolher${i.formato ? `:${i.formato}` : ''}`); continue; }
    if (a.tipo === 'montar' && (a.vocabulario || a.porSilaba)) continue;
    if (a.tipo === 'ligar') { for (const x of a.pares) add(x.habilidade ?? a.habilidade, 'ligar'); continue; }
    if (a.tipo === 'parMinimo') { for (const x of a.itens) add(x.habilidade ?? a.habilidade, 'parMinimo'); continue; }
    add(a.habilidade, a.tipo);
    if (a.tipo === 'caixas') add(a.habilidadeEscrita, 'caixas');
    if (a.tipo === 'frase') add(a.habilidadeCompreensao, 'frase');
  }
  return m;
}

/** Palavras diferentes (lidas ou escritas) que uma fase oferece para a habilidade. */
export function palavrasDaFase(f: Fase, habilidade: string): number {
  const ws = new Set<string>();
  for (const c of f.cenas) {
    const a = c.atividade;
    if (!a || !c.contaDominio) continue;
    if (a.tipo === 'escolher') { for (const i of a.itens) if ((i.habilidade ?? a.habilidade) === habilidade && (i.leitura || i.formato === 'fonema-falta')) ws.add(String(i.correta).toUpperCase()); continue; }
    if (a.tipo === 'montar' && !a.vocabulario && !a.porSilaba && a.habilidade === habilidade) a.palavras.forEach((w) => ws.add(w.toUpperCase()));
    if (a.tipo === 'ditado' && a.habilidade === habilidade) a.palavras.forEach((w) => ws.add(w.toUpperCase()));
    if (a.tipo === 'caixas' && (a.habilidade === habilidade || a.habilidadeEscrita === habilidade)) a.itens.forEach((i) => ws.add(i.palavra.toUpperCase()));
    if (a.tipo === 'sintese' && a.habilidade === habilidade) a.itens.forEach((i) => ws.add(i.palavra.toUpperCase()));
    if (a.tipo === 'parMinimo') a.itens.forEach((i) => { if ((i.habilidade ?? a.habilidade) === habilidade) ws.add(i.alvo.toUpperCase()); });
    if (a.tipo === 'troca' && a.habilidade === habilidade) a.itens.forEach((i) => ws.add(i.para.toUpperCase()));
  }
  return ws.size;
}

let tiposDoConteudo: Map<string, Set<string>> | undefined;
/**
 * Tipos de atividade AVALIADA que o conteúdo publicado oferece para cada habilidade. Serve para não exigir variedade
 * que o app não tem como dar.
 */
export function tiposDeAtividadeDoConteudo(habilidade: string): Set<string> {
  if (!tiposDoConteudo) {
    tiposDoConteudo = new Map();
    for (const f of FASES) for (const [h, tipos] of tiposDeAtividadeDaFase(f)) tiposDoConteudo.set(h, new Set([...(tiposDoConteudo.get(h) ?? []), ...tipos]));
  }
  return tiposDoConteudo.get(habilidade) ?? new Set();
}

const PALAVRA = new Set(['palavra', 'pseudopalavra']);

export interface AvaliacaoDominio {
  dominado: boolean;
  p: number;
  tentativas: number;
  sessoes: number;
  acertosRecentes: number;
  pseudoCertas: number;
  /** Palavras diferentes lidas/escritas certas e sem ajuda (critério 5; só conta em habilidade de palavras). */
  itensDiferentes: number;
  /** Tipos de atividade diferentes com acerto sem ajuda (critério 5). */
  tiposDeAtividade: number;
  /** Tentativas de exposição e autorrelato (participação: não contam para o domínio). */
  participacoes: number;
  /** O que ainda falta, em linguagem de adulto (painel do professor). */
  falta: string[];
  /** Falta só a pseudopalavra avaliada (todo o resto do critério está cumprido). */
  soFaltaPseudo: boolean;
  /** Falta só variedade (palavras diferentes e/ou outro tipo de atividade); a pseudopalavra pode faltar junto. */
  soFaltaVariedade: boolean;
  /** Critério 1 cumprido (firmeza, tentativas, sessões, acertos recentes); pode faltar pseudo e variedade. */
  basicoCumprido: boolean;
  faltaPseudo: boolean;
  faltaItens: boolean;
  faltaTipos: boolean;
}

/**
 * Critério de domínio (docs/pedagogia/06 §2) [DP]:
 *  1. firmeza ≥ pMin, ≥ tentativasMin avaliadas em ≥ sessoesMin sessões, acertosNasUltimas das últimas certas sem ajuda;
 *  2. leitura: ≥ pseudoMin palavras inventadas certas em atividade CONFERIDA;
 *  3. só tentativas avaliadas;
 *  5. variedade: em habilidade de PALAVRAS (o alvo gravado é palavra), ≥ itensDiferentesMin palavras diferentes certas;
 *     e acertos em ≥ tiposDeAtividadeMin TIPOS de atividade, quando o conteúdo publicado oferece esses tipos para a
 *     habilidade (`habilidade` informada). Dado antigo sem mecânica nem alvo não é cobrado (não se inventa evidência).
 *  6. retenção: fica com a revisão espaçada (revisao.ts), que devolve a habilidade ao treino quando a criança erra.
 */
export function avaliarDominio(h: EstadoHabilidade | undefined, cfg: ConfigPlataforma['dominio'], exigePseudo: boolean, habilidade?: string): AvaliacaoDominio {
  const todas = h?.tentativas ?? [];
  const ts = todas.filter(ehAvaliada);
  const p = h?.p ?? BKT.p0;
  const sessoes = new Set(ts.map((t) => t.sessao)).size;
  const ultimas = ts.slice(-cfg.ultimas);
  const acertosRecentes = ultimas.filter((t) => t.acertou && !t.comAjuda).length;
  const pseudoCertas = ts.filter((t) => t.pseudo && t.acertou && !t.comAjuda).length;
  const certas = ts.filter(acertoSozinho);
  // 5a. palavras diferentes (só quando a habilidade é medida em palavras com alvo gravado)
  const dePalavra = ts.filter((t) => t.alvo !== undefined && PALAVRA.has(categoriaDoAlvo(t)));
  const itensDiferentes = new Set(certas.filter((t) => t.alvo !== undefined && PALAVRA.has(categoriaDoAlvo(t))).map((t) => t.alvo!.toUpperCase())).size;
  const itensMin = cfg.itensDiferentesMin ?? 3;
  const faltaItens = dePalavra.length > 0 && itensDiferentes < itensMin;
  // 5b. tipos de atividade (só quando a mecânica foi gravada e o conteúdo oferece mais de um tipo)
  const tiposDeAtividade = new Set(certas.map(tipoDeAtividade).filter(Boolean)).size;
  const possiveis = habilidade ? tiposDeAtividadeDoConteudo(habilidade).size : 1;
  const tiposMin = Math.min(cfg.tiposDeAtividadeMin ?? 2, possiveis);
  const faltaTipos = ts.some((t) => t.mecanica) && tiposDeAtividade < tiposMin;
  const falta: string[] = [];
  if (ts.length < cfg.tentativasMin) falta.push(`mais ${cfg.tentativasMin - ts.length} tentativa(s)`);
  if (sessoes < cfg.sessoesMin) falta.push(`treinar em mais ${cfg.sessoesMin - sessoes} sessão(ões)`);
  if (acertosRecentes < cfg.acertosNasUltimas) falta.push(`${cfg.acertosNasUltimas} acertos nas últimas ${cfg.ultimas}`);
  if (p < cfg.pMin) falta.push(`firmeza ${Math.round(p * 100)}% (meta ${Math.round(cfg.pMin * 100)}%)`);
  const basico = falta.length === 0;
  const faltaPseudo = exigePseudo && pseudoCertas < cfg.pseudoMin;
  const soFaltaPseudo = faltaPseudo && basico && !faltaItens && !faltaTipos;
  if (faltaPseudo) falta.push(`${cfg.pseudoMin - pseudoCertas} pseudopalavra(s) em atividade conferida`);
  if (faltaItens) falta.push(`acertar ${itensMin - itensDiferentes} palavra(s) diferente(s)`);
  if (faltaTipos) falta.push(`acertar em mais ${tiposMin - tiposDeAtividade} tipo(s) de atividade (ex.: ouvir e achar a letra, ver a letra e achar o som)`);
  const soFaltaVariedade = basico && (faltaItens || faltaTipos);
  return {
    dominado: falta.length === 0, p, tentativas: ts.length, sessoes, acertosRecentes, pseudoCertas, itensDiferentes, tiposDeAtividade,
    participacoes: todas.length - ts.length, falta, soFaltaPseudo, soFaltaVariedade, basicoCumprido: basico, faltaPseudo, faltaItens, faltaTipos
  };
}

/** Dominada DE VERDADE: marcada como dominada e sem a etiqueta "a confirmar". */
export function dominadaDeVerdade(h: EstadoHabilidade | undefined): boolean {
  return !!h?.dominadaEm && !h.aConfirmar;
}

/**
 * Prova-relâmpago (Trilha Expressa) e chefe: proporção de acertos sem ajuda nas tentativas AVALIADAS.
 * Prova sem nenhuma tentativa avaliada vale 0: autorrelato nunca conta (D030; regra 4 do CLAUDE.md).
 */
export function proporcao(tentativas: Tentativa[]): number {
  const avaliadas = paraProva(tentativas);
  if (!avaliadas.length) return 0;
  return avaliadas.filter((t) => t.acertou && !t.comAjuda).length / avaliadas.length;
}

/** As tentativas que valem numa prova: só as avaliadas (exposição e autorrelato nunca entram). */
export function paraProva<T extends Tentativa>(tentativas: T[]): T[] {
  return tentativas.filter(ehAvaliada);
}
