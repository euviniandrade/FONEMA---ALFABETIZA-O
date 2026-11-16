/**
 * TREINO RÁPIDO COM A SOFIA (D030 etapa 9; docs/pedagogia/06 §5): a "próxima prática recomendada" vira uma rodada
 * curta que a criança joga. Itens focados no par confundido, com a volta ao pré-requisito quando ela existe.
 * Cada resposta é registrada como AVALIADA, com `contexto: 'reforco'` (não se mistura com a sondagem).
 *
 * Regras (decisão do projeto, a partir de 06 §5: "curto (minutos), usa itens novos, não tira nada"):
 *  - no máximo `TREINO_MAX_ITENS` itens; primeiro os da volta ao pré-requisito (até 2), depois os do foco;
 *  - só itens de Escolher já publicados e conferidos no conteúdo (bancoDeItens em reforco.ts);
 *  - oferecido no máximo uma vez por dia (`treinoDisponivel`), para não virar castigo;
 *  - não dá nem tira moedinhas; conta como desafio feito (esforço) e pode firmar domínio como qualquer resposta conferida.
 */
import { HABILIDADE_POR_ID } from '@fonema/conteudo';
import type { AtividadeEscolher, Cena, ConfigPlataforma, ItemEscolha } from '@fonema/conteudo';
import type { ConquistaGanha, Demonstracao, Progresso, Tentativa } from './estado.ts';
import { diaDe } from './estado.ts';
import { praticasRecomendadas, type PraticaRecomendada } from './reforco.ts';
import { aplicarAtividade } from './jornada.ts';
import { avaliarDominio } from './dominio.ts';
import { agendarRevisao } from './revisao.ts';
import { avaliarConquistas } from './conquistas.ts';

export const TREINO_MAX_ITENS = 5;
export const TREINO_MIN_ITENS = 3;

export interface TreinoRapido {
  /** A prática que originou o treino (a de maior prioridade com itens). */
  pratica: PraticaRecomendada;
  /** Volta ao pré-requisito incluída no começo do treino, quando há. */
  volta?: PraticaRecomendada;
  /** Atividade pronta para a mecânica Escolher. */
  atividade: AtividadeEscolher;
  /** Cena sintética (o motor e o registro usam o id). */
  cena: Cena;
  /** Frase curta para a criança ("Vamos treinar o som do F e do V"). Sem nota, sem "você errou". */
  titulo: string;
}

const chaveItem = (i: ItemEscolha) => `${i.ouvir ?? ''}|${i.mostrar ?? ''}|${i.mostrarFigura ?? ''}|${i.somAlvo ?? ''}|${i.correta}`;

function tituloDo(pr: PraticaRecomendada): string {
  if (pr.foco) return `Treino rápido: ${pr.foco.alvo} e ${pr.foco.confundidoCom}`;
  return `Treino rápido: ${pr.nomeHabilidade}`;
}

/** Monta o treino a partir das práticas recomendadas; `null` quando não há nada com itens para treinar. */
export function montarTreino(p: Progresso, cfg: ConfigPlataforma, agora: number): TreinoRapido | null {
  const todas = praticasRecomendadas(p, cfg, agora).filter((x) => x.itens.length > 0);
  const pratica = todas.find((x) => x.motivo === 'par-confundido' || x.motivo === 'pre-requisito') ?? todas[0];
  if (!pratica) return null;
  // volta ao pré-requisito: se o foco é um par e há também um pré-requisito pendente (ou vice-versa), os dois entram
  const volta = pratica.motivo === 'pre-requisito' ? undefined : todas.find((x) => x.motivo === 'pre-requisito');
  const vistos = new Set<string>();
  const itens: ItemEscolha[] = [];
  const pegar = (lista: ItemEscolha[], n: number) => {
    for (const i of lista) {
      if (itens.length >= TREINO_MAX_ITENS || n <= 0) break;
      const k = chaveItem(i);
      if (vistos.has(k)) continue;
      vistos.add(k);
      itens.push(i);
      n--;
    }
  };
  if (volta) pegar(volta.itens, 2);
  pegar(pratica.itens, TREINO_MAX_ITENS);
  // pré-requisito sem item conferido suficiente: completa com a própria prática seguinte do mesmo tipo
  if (itens.length < TREINO_MIN_ITENS) for (const x of todas) pegar(x.itens, TREINO_MAX_ITENS);
  if (itens.length < TREINO_MIN_ITENS) return null;
  const habilidade = pratica.habilidade;
  const atividade: AtividadeEscolher = {
    tipo: 'escolher',
    habilidade,
    // falas com clipe gravado (sem voz nova): "Vamos treinar mais um pouquinho juntos, [NOME]."
    enunciado: { quem: 'sofia', texto: 'Vamos treinar mais um pouquinho juntos, [NOME]. Treinar é assim mesmo!' },
    comemora: { quem: 'sofia', texto: 'Você escutou com atenção.' },
    itens: itens.map((i) => ({ ...i, habilidade: i.habilidade ?? habilidade }))
  };
  const cena: Cena = { id: `TREINO-${habilidade}`, tipo: 'C4', titulo: tituloDo(pratica), cenario: 'quintal', atividade, contaDominio: true };
  return { pratica, volta, atividade, cena, titulo: tituloDo(pratica) };
}

/** Já treinou hoje? O treino rápido aparece no máximo uma vez por dia. */
export function treinoDisponivel(p: Progresso, cfg: ConfigPlataforma, agora: number): TreinoRapido | null {
  const hoje = diaDe(agora);
  if ((p.treinos ?? []).some((t) => diaDe(t.em) === hoje)) return null;
  if (p.sessoesFeitas < 1) return null;
  return montarTreino(p, cfg, agora);
}

/**
 * Registra o treino: respostas como AVALIADAS no contexto 'reforco', domínio firmado quando o critério fecha
 * (igual ao fim de sessão), conquistas avaliadas DEPOIS do fato. Nada é tirado.
 */
export function registrarTreino(
  p0: Progresso,
  treino: Pick<TreinoRapido, 'cena' | 'pratica'>,
  sessao: string,
  tentativas: Tentativa[],
  cfg: ConfigPlataforma,
  agora: number,
  demonstracoes: Demonstracao[] = []
): { progresso: Progresso; novas: ConquistaGanha[]; dominadasAgora: string[] } {
  const marcadas = tentativas.map((t) => ({ ...t, sessao, contexto: 'reforco' as const, tipo: 'avaliada' as const, mecanica: t.mecanica ?? ('escolher' as const) }));
  let p = aplicarAtividade(p0, { sessao, cena: treino.cena, tentativas: marcadas, tentouDeNovo: 0 }, cfg, agora);
  const dominadasAgora: string[] = [];
  const habilidades = { ...p.habilidades };
  for (const id of new Set(marcadas.map((t) => t.habilidade))) {
    const h = habilidades[id];
    if (!h || (h.dominadaEm && !h.aConfirmar)) continue;
    if (!avaliarDominio(h, cfg.dominio, HABILIDADE_POR_ID[id]?.exigePseudo ?? false, id).dominado) continue;
    if (h.dominadaEm) { habilidades[id] = { ...h, aConfirmar: undefined, marcoPendente: undefined }; if (h.marcoPendente) dominadasAgora.push(id); }
    else { habilidades[id] = agendarRevisao({ ...h, dominadaEm: agora }, agora, cfg.revisao.intervalosDias); dominadasAgora.push(id); }
  }
  const acertos = marcadas.filter((t) => t.acertou && !t.comAjuda).length;
  p = {
    ...p,
    habilidades,
    contadores: { ...p.contadores, 'treinos-rapidos': (p.contadores['treinos-rapidos'] ?? 0) + 1 },
    treinos: [...(p.treinos ?? []), { em: agora, habilidade: treino.pratica.habilidade, motivo: treino.pratica.motivo, acertos, total: marcadas.length }]
  };
  const ac = avaliarConquistas(p, demonstracoes, agora);
  return { progresso: ac.progresso, novas: ac.novas, dominadasAgora };
}
