/**
 * Reforço dirigido, pré-requisito e alerta para o adulto (D030, etapa 9).
 * Funções puras: dado o histórico, devolvem a "próxima prática recomendada" para as telas consumirem.
 *
 * DECISÕES DO PROJETO (não vêm de material citado; números em config › reforco e config › risco, a calibrar com uso):
 *  - um par vira "confusão" com 3 trocas (docs/pedagogia/06 §5); a prática foca nesse par (itens que põem os dois lado a lado);
 *  - 2 sessões seguidas com menos da metade de acertos sem ajuda na mesma habilidade → volta ao pré-requisito;
 *  - o alerta nunca é diagnóstico: diz o que foi observado e o que fazer em casa ou na aula.
 */
import { FASES, HABILIDADES, HABILIDADE_POR_ID } from '@fonema/conteudo';
import type { ConfigPlataforma, ItemEscolha } from '@fonema/conteudo';
import type { EstadoHabilidade, Progresso, Tentativa } from './estado.ts';
import { DIA_MS } from './estado.ts';
import { avaliarDominio, dominadaDeVerdade } from './dominio.ts';
import { ehAvaliada } from './tentativas.ts';
import { paresConfundidos, parceiroProvavel, fonemasEGrafemasMaisErrados, todasAsTentativas, type ParConfundido } from './confusao.ts';
import { revisoesVencidas } from './revisao.ts';

/* ------------------------------ pré-requisitos ------------------------------ */

const VOGAIS_HAB = ['vogal-a', 'vogal-e', 'vogal-i', 'vogal-o', 'vogal-u'];

/**
 * Pré-requisitos por habilidade (decisão do projeto, na ordem da jornada: letra → som → sílaba → palavra → escrita).
 * Habilidade fora da lista (as letras, rima, sílabas orais) não tem pré-requisito: a volta é à apresentação dela.
 */
export const PRE_REQUISITOS: Record<string, string[]> = {
  'som-inicial': ['silaba'],
  sintese: ['som-inicial'],
  'som-do-nome': ['som-inicial'],
  'vogal-a': ['letra-a'], 'vogal-e': ['letra-e'], 'vogal-i': ['letra-i'], 'vogal-o': ['letra-o'], 'vogal-u': ['letra-u'],
  'o-aberto-fechado': ['vogal-o'],
  vogais: VOGAIS_HAB,
  'gpc-m': ['letra-m'], 'gpc-l': ['letra-l'], 'gpc-f': ['letra-f'],
  'silaba-cv': ['gpc-m', 'gpc-l', 'gpc-f', 'vogais'],
  'leitura-cvcv': ['silaba-cv'],
  'escrita-cvcv': ['leitura-cvcv']
};

/** Fase que APRESENTA a habilidade (a primeira em que ela é a habilidade principal; senão, a primeira que a traz). */
export function faseQueEnsina(habilidade: string): string | undefined {
  return (FASES.find((f) => f.habilidades[0] === habilidade) ?? FASES.find((f) => f.habilidades.includes(habilidade)))?.id;
}

/** Pré-requisito a retomar: o primeiro ainda não dominado de verdade; se todos estão, o mais fraco (menor firmeza). */
export function preRequisitoDe(habilidade: string, p: Pick<Progresso, 'habilidades'>): string | undefined {
  const lista = (PRE_REQUISITOS[habilidade] ?? []).filter((h) => HABILIDADE_POR_ID[h]);
  if (!lista.length) return undefined;
  const fraco = lista.find((h) => !dominadaDeVerdade(p.habilidades[h]));
  if (fraco) return fraco;
  return [...lista].sort((a, b) => (p.habilidades[a]?.p ?? 0) - (p.habilidades[b]?.p ?? 0))[0];
}

/* ------------------------------ sessões com erro ------------------------------ */

export interface SessaoDaHabilidade {
  sessao: string;
  em: number;
  avaliadas: number;
  /** Proporção de acertos de primeira e sem ajuda. */
  acerto: number;
}

/** Desempenho da habilidade por sessão (só tentativas avaliadas), da mais antiga para a mais nova. */
export function sessoesDaHabilidade(h: EstadoHabilidade | undefined): SessaoDaHabilidade[] {
  const m = new Map<string, { em: number; n: number; ok: number }>();
  for (const t of h?.tentativas ?? []) {
    if (!ehAvaliada(t)) continue;
    const x = m.get(t.sessao) ?? { em: t.em, n: 0, ok: 0 };
    x.n++;
    if (t.acertou && !t.comAjuda) x.ok++;
    x.em = Math.min(x.em, t.em);
    m.set(t.sessao, x);
  }
  return [...m.entries()].map(([sessao, x]) => ({ sessao, em: x.em, avaliadas: x.n, acerto: x.ok / x.n })).sort((a, b) => a.em - b.em);
}

/** Quantas das ÚLTIMAS sessões seguidas da habilidade ficaram abaixo do acerto mínimo (sessão com 1 item só não conta). */
export function sessoesSeguidasComErro(h: EstadoHabilidade | undefined, acertoMin: number): number {
  const ss = sessoesDaHabilidade(h).filter((s) => s.avaliadas >= 2);
  let n = 0;
  for (let i = ss.length - 1; i >= 0 && ss[i].acerto < acertoMin; i--) n++;
  return n;
}

/* ------------------------------ itens de prática ------------------------------ */

function igual(a: string | undefined, b: string): boolean {
  return a !== undefined && a.localeCompare(b, 'pt', { sensitivity: 'base' }) === 0;
}

function opcaoBate(o: ItemEscolha['opcoes'][number], x: string): boolean {
  return igual(o.id, x) || igual(o.letra, x) || o.som === x;
}

/** Banco de itens de Escolher já publicados (revisados no conteúdo), com a habilidade de cada um. */
function bancoDeItens(): ItemEscolha[] {
  const todos: ItemEscolha[] = [];
  for (const f of FASES) {
    for (const c of f.cenas) {
      const a = c.atividade;
      if (a?.tipo === 'escolher' && !a.gerador) todos.push(...a.itens.map((i) => ({ ...i, habilidade: i.habilidade ?? a.habilidade })));
    }
  }
  return todos;
}

/**
 * Itens focados num par confundido: primeiro os que põem os DOIS lado a lado (um é a resposta, o outro é opção),
 * depois os que têm um dos dois como resposta. Sem repetição; até `max`.
 */
export function itensDoPar(a: string, b: string, max: number): ItemEscolha[] {
  const banco = bancoDeItens();
  const certa = (i: ItemEscolha, x: string) => i.opcoes.some((o) => o.id === i.correta && opcaoBate(o, x));
  const tem = (i: ItemEscolha, x: string) => i.opcoes.some((o) => opcaoBate(o, x));
  const lado = banco.filter((i) => (certa(i, a) && tem(i, b)) || (certa(i, b) && tem(i, a)));
  const um = banco.filter((i) => (certa(i, a) || certa(i, b)) && !lado.includes(i));
  const out: ItemEscolha[] = [];
  const vistos = new Set<string>();
  for (const i of [...lado, ...um]) {
    const k = `${i.ouvir ?? ''}|${i.mostrar ?? ''}|${i.mostrarFigura ?? ''}|${i.correta}|${i.opcoes.map((o) => o.id).sort().join(',')}`;
    if (vistos.has(k)) continue;
    vistos.add(k);
    out.push(i);
    if (out.length >= max) break;
  }
  return out;
}

/** Itens avaliados de uma habilidade (para reforço e pré-requisito), sem repetição; até `max`. */
export function itensDaHabilidade(habilidade: string, max: number): ItemEscolha[] {
  const out: ItemEscolha[] = [];
  const vistos = new Set<string>();
  for (const i of bancoDeItens()) {
    if (i.habilidade !== habilidade) continue;
    const k = `${i.ouvir ?? ''}|${i.mostrar ?? ''}|${i.mostrarFigura ?? ''}|${i.correta}`;
    if (vistos.has(k)) continue;
    vistos.add(k);
    out.push(i);
    if (out.length >= max) break;
  }
  return out;
}

/* ------------------------------ próxima prática recomendada ------------------------------ */

export type MotivoPratica = 'pre-requisito' | 'par-confundido' | 'reforco' | 'revisao';

export interface PraticaRecomendada {
  motivo: MotivoPratica;
  /** Habilidade a praticar (no pré-requisito, é a habilidade para onde se VOLTA). */
  habilidade: string;
  nomeHabilidade: string;
  /** Habilidade que originou a recomendação (onde a criança errou). */
  origem?: string;
  /** Par em foco: a criança respondeu `confundidoCom` quando o certo era `alvo`. */
  foco?: { alvo: string; confundidoCom: string; vezes: number; conhecido?: 'som' | 'desenho'; suposto?: boolean };
  /** Fase onde a habilidade é apresentada (para a tela abrir "jogar de novo"). */
  faseId?: string;
  /** Itens prontos (Escolher) para a prática; vazio = o conteúdo ainda não tem item conferido para isso. */
  itens: ItemEscolha[];
  /** Explicação curta para o adulto. */
  paraAdulto: string;
}

const nome = (h: string) => HABILIDADE_POR_ID[h]?.nome ?? h;

function textoPar(par: { alvo: string; confundidoCom: string; conhecido?: 'som' | 'desenho' }): string {
  const porque = par.conhecido === 'som' ? ' São sons parecidos na boca: vale comparar os dois devagar, olhando a boca.'
    : par.conhecido === 'desenho' ? ' São letras de desenho parecido: vale traçar as duas, uma ao lado da outra.' : '';
  return `Troca ${par.alvo} por ${par.confundidoCom} (era ${par.alvo}, respondeu ${par.confundidoCom}).${porque}`;
}

/**
 * Lista de práticas recomendadas, em ordem de prioridade:
 *  1. PRÉ-REQUISITO — errou N sessões seguidas na mesma habilidade (config › reforco): volta um passo;
 *  2. PAR CONFUNDIDO — trocas repetidas entre dois itens: prática com os dois lado a lado;
 *  3. REFORÇO — habilidade de fase já concluída que ainda não está dominada (da mais fraca para a mais firme);
 *  4. REVISÃO — habilidade dominada com revisão espaçada vencida.
 */
export function praticasRecomendadas(p: Progresso, cfg: ConfigPlataforma, agora: number): PraticaRecomendada[] {
  const out: PraticaRecomendada[] = [];
  const r = cfg.reforco;
  const tentativas = todasAsTentativas(p);
  const usadas = new Set<string>();

  // 1. pré-requisito
  for (const h of HABILIDADES) {
    const e = p.habilidades[h.id];
    if (!e || dominadaDeVerdade(e)) continue;
    const seguidas = sessoesSeguidasComErro(e, r.acertoMinSessao);
    if (seguidas < r.sessoesSeguidasParaPreRequisito) continue;
    const pre = preRequisitoDe(h.id, p);
    const alvo = pre ?? h.id;
    usadas.add(h.id);
    usadas.add(alvo);
    out.push({
      motivo: 'pre-requisito', habilidade: alvo, nomeHabilidade: nome(alvo), origem: h.id, faseId: faseQueEnsina(alvo),
      itens: itensDaHabilidade(alvo, r.maxItens),
      paraAdulto: pre
        ? `Em "${h.nome}" foram ${seguidas} sessões seguidas com mais erro do que acerto. Antes de insistir, vale voltar um passo: "${nome(pre)}".`
        : `Em "${h.nome}" foram ${seguidas} sessões seguidas com mais erro do que acerto. Vale rever a apresentação desta habilidade, com calma, antes de seguir.`
    });
  }

  // 2. pares confundidos (dados da criança)
  for (const par of paresConfundidos(tentativas, r.errosMinPar)) {
    const hab = par.habilidades[0];
    out.push({
      motivo: 'par-confundido', habilidade: hab, nomeHabilidade: nome(hab), faseId: faseQueEnsina(hab),
      foco: { alvo: par.alvo, confundidoCom: par.escolhido, vezes: par.vezes, conhecido: par.conhecido },
      itens: itensDoPar(par.alvo, par.escolhido, r.maxItens),
      paraAdulto: `${textoPar({ alvo: par.alvo, confundidoCom: par.escolhido, conhecido: par.conhecido })} (${par.vezes} vezes)`
    });
  }
  // 2b. som/letra muito errado, ainda sem troca repetida: supõe o par mais provável (PARES_CONFUSOS)
  const jaEmPar = new Set(out.flatMap((x) => (x.foco ? [x.foco.alvo, x.foco.confundidoCom] : [])));
  for (const item of fonemasEGrafemasMaisErrados(tentativas, r.errosMinPar)) {
    if (jaEmPar.has(item.alvo)) continue;
    const parceiro = parceiroProvavel(item.alvo, item.categoria);
    if (!parceiro) continue;
    const hab = item.habilidades[0];
    out.push({
      motivo: 'par-confundido', habilidade: hab, nomeHabilidade: nome(hab), faseId: faseQueEnsina(hab),
      foco: { alvo: item.alvo, confundidoCom: parceiro, vezes: item.erros, conhecido: 'som', suposto: true },
      itens: itensDoPar(item.alvo, parceiro, r.maxItens),
      paraAdulto: `Errou ${item.alvo} ${item.erros} vezes. O som mais parecido com ele é o de ${parceiro}: vale comparar os dois devagar.`
    });
  }

  // 3. reforço: fase concluída, habilidade ainda não dominada de verdade
  const concluidas = FASES.filter((f) => p.fases[f.id]?.estado === 'concluida');
  const pendentes = [...new Set(concluidas.flatMap((f) => f.habilidades))].filter((h) => !dominadaDeVerdade(p.habilidades[h]) && !usadas.has(h));
  pendentes.sort((a, b) => (p.habilidades[a]?.p ?? 0) - (p.habilidades[b]?.p ?? 0));
  for (const h of pendentes) {
    const exige = HABILIDADE_POR_ID[h]?.exigePseudo ?? false;
    const falta = avaliarDominio(p.habilidades[h], cfg.dominio, exige).falta;
    out.push({
      motivo: 'reforco', habilidade: h, nomeHabilidade: nome(h), faseId: faseQueEnsina(h), itens: itensDaHabilidade(h, r.maxItens),
      paraAdulto: `A fase foi concluída, mas "${nome(h)}" ainda não está firme. Falta: ${falta.slice(0, 2).join('; ') || 'confirmar em atividade conferida'}.`
    });
  }

  // 4. revisão espaçada vencida
  for (const h of revisoesVencidas(p.habilidades, agora, 3)) {
    if (usadas.has(h)) continue;
    out.push({ motivo: 'revisao', habilidade: h, nomeHabilidade: nome(h), faseId: faseQueEnsina(h), itens: itensDaHabilidade(h, r.maxItens), paraAdulto: `Hora de relembrar "${nome(h)}" (revisão espaçada).` });
  }
  return out;
}

/** A próxima prática recomendada (a de maior prioridade), ou `null` quando não há nada a reforçar. */
export function proximaPratica(p: Progresso, cfg: ConfigPlataforma, agora: number): PraticaRecomendada | null {
  return praticasRecomendadas(p, cfg, agora)[0] ?? null;
}

/* ------------------------------ alerta para o adulto ------------------------------ */

export interface AlertaDeRisco {
  /** 'nenhum' = nada a apontar; 'atencao' = 1 sinal; 'risco' = 2 ou mais sinais de aprendizagem. */
  nivel: 'nenhum' | 'atencao' | 'risco';
  sinais: { tipo: 'sem-dominio' | 'erro-seguido' | 'troca-repetida' | 'sem-jogar'; habilidade?: string; texto: string }[];
  /** Como o alerta é calculado, em linguagem simples (aparece no painel). */
  criterio: string;
}

function acertoRecente(ts: Tentativa[], janela: number): number {
  const u = ts.filter(ehAvaliada).slice(-janela);
  return u.length ? u.filter((t) => t.acertou && !t.comAjuda).length / u.length : 1;
}

/**
 * Alerta para o adulto (DECISÃO DO PROJETO, não é diagnóstico nem rótulo). Sinais observados:
 *  - 'sem-dominio': N sessões avaliadas na mesma habilidade, sem domínio, e menos de X% de acerto nas últimas tentativas;
 *  - 'erro-seguido': sessões seguidas com mais erro do que acerto na mesma habilidade;
 *  - 'troca-repetida': o mesmo par trocado várias vezes, em mais de uma sessão;
 *  - 'sem-jogar': muitos dias sem jogar (sinal de rotina, não de aprendizagem: sozinho só dá "atenção").
 */
export function alertaDeRisco(p: Progresso, cfg: ConfigPlataforma, agora: number): AlertaDeRisco {
  const k = cfg.risco;
  const sinais: AlertaDeRisco['sinais'] = [];
  for (const h of HABILIDADES) {
    const e = p.habilidades[h.id];
    if (!e || dominadaDeVerdade(e)) continue;
    const ss = sessoesDaHabilidade(e);
    const ac = acertoRecente(e.tentativas, k.janela);
    if (ss.length >= k.sessoesSemDominio && ac < k.acertoMin) {
      sinais.push({ tipo: 'sem-dominio', habilidade: h.id, texto: `"${h.nome}": ${ss.length} sessões de treino e ${Math.round(ac * 100)}% de acerto nas últimas tentativas.` });
    } else if (sessoesSeguidasComErro(e, cfg.reforco.acertoMinSessao) >= cfg.reforco.sessoesSeguidasParaPreRequisito) {
      sinais.push({ tipo: 'erro-seguido', habilidade: h.id, texto: `"${h.nome}": sessões seguidas com mais erro do que acerto.` });
    }
  }
  const trocas: ParConfundido[] = paresConfundidos(todasAsTentativas(p), k.trocasMin).filter((x) => x.sessoes >= 2);
  for (const t of trocas.slice(0, 3)) sinais.push({ tipo: 'troca-repetida', habilidade: t.habilidades[0], texto: `Troca ${t.alvo} por ${t.escolhido} com frequência (${t.vezes} vezes).` });
  const dias = p.ultimaSessao ? Math.floor((agora - p.ultimaSessao) / DIA_MS) : 0;
  if (p.sessoesFeitas > 0 && dias >= k.diasSemJogar) sinais.push({ tipo: 'sem-jogar', texto: `${dias} dias sem jogar. Pouco e sempre funciona melhor do que muito de uma vez.` });
  const deAprendizagem = sinais.filter((s) => s.tipo !== 'sem-jogar').length;
  return {
    nivel: deAprendizagem >= 2 ? 'risco' : sinais.length ? 'atencao' : 'nenhum',
    sinais,
    criterio:
      `Critério do FONEMA (decisão do projeto, não é diagnóstico): aparece "atenção" com 1 sinal e "precisa de apoio" com 2 ou mais. ` +
      `Sinais: ${k.sessoesSemDominio} sessões na mesma habilidade sem firmar e menos de ${Math.round(k.acertoMin * 100)}% de acerto; ` +
      `${cfg.reforco.sessoesSeguidasParaPreRequisito} sessões seguidas com mais erro do que acerto; a mesma troca ${k.trocasMin} vezes ou mais; ` +
      `${k.diasSemJogar} dias sem jogar.`
  };
}
