/**
 * Resumos para a família e o professor (D004, D018; jogo-completo/06).
 * Nunca: comparação com colegas, nota, rótulo ou diagnóstico.
 */
import { ALFABETO, CONQUISTA_POR_ID, FASES, FASE_POR_ID, FALAS, HABILIDADES } from '@fonema/conteudo';
import type { ConfigPlataforma } from '@fonema/conteudo';
import type { Crianca, Demonstracao, Evento, Progresso, Tentativa } from './estado.ts';
import { DIA_MS } from './estado.ts';
import { generoDaFala } from './avatar.ts';
import { avaliarDominio, dominadaDeVerdade } from './dominio.ts';
import { coberturaDoDetalhe, fonemasEGrafemasMaisErrados, palavrasDificeis, paresConfundidos, tempoMedioPorHabilidade, todasAsTentativas, type ItemErrado, type ParConfundido } from './confusao.ts';
import { alertaDeRisco, praticasRecomendadas, type AlertaDeRisco, type PraticaRecomendada } from './reforco.ts';
import { evolucaoSondagens, quedasEntreSondagens, situacaoSondagem, type EvolucaoArea, type QuedaArea, type SituacaoSondagem } from './sondagem.ts';
import { resumoDaAjuda, posicoesDaRespostaCerta, sinaisDeChute, type ResumoAjuda, type SinalDeChute } from './ajuda.ts';
import { tipoDaTentativa } from './tentativas.ts';
import { calcularNivel } from './nivel.ts';
import { descreverTermometro, termometroMaximoDoConteudo } from './termometro.ts';
import { fasesConcluidas, missaoInicialFeita } from './sequencia.ts';
import { renderFala } from './falas.ts';

export interface ResumoFamilia {
  nome: string;
  nivel: ReturnType<typeof calcularNivel>;
  termometro: number;
  termometroTexto: string;
  faseAtual: { id: string; titulo: string; objetivo: string; emCasa: string };
  jaSabe: string[];
  aprendendo: { nome: string; falta: string[] }[];
  atividadesSemana: number;
  sessoesSemana: number;
  selosRecentes: string[];
  moedinhas: { saldo: number; total: number };
  mensagemWhatsApp: string;
}

export function resumoFamilia(c: Crianca, p: Progresso, eventos: Evento[], cfg: ConfigPlataforma, agora: number): ResumoFamilia {
  const nivel = calcularNivel(p.desafios, missaoInicialFeita(p), fasesConcluidas(p));
  const fase = FASE_POR_ID[p.faseAtual];
  const ctx = { nome: c.nome, genero: generoDaFala(c) };
  // D030: "já faz" = dominada de verdade (tentativas conferidas); o que está "a confirmar" continua em "aprendendo"
  const jaSabe = HABILIDADES.filter((h) => dominadaDeVerdade(p.habilidades[h.id])).map((h) => renderFala(`[NOME] ${h.paraFamilia}`, ctx));
  const aprendendo = HABILIDADES.filter((h) => p.habilidades[h.id] && !dominadaDeVerdade(p.habilidades[h.id])).map((h) => ({
    nome: h.nome,
    falta: avaliarDominio(p.habilidades[h.id], cfg.dominio, h.exigePseudo).falta
  }));
  const semana = eventos.filter((e) => e.em >= agora - 7 * DIA_MS);
  const selosRecentes = Object.values(p.conquistas)
    .sort((a, b) => b.em - a.em)
    .slice(0, 6)
    .map((g) => CONQUISTA_POR_ID[g.id]?.nome ?? g.id);
  const msg =
    p.sessoesFeitas <= 1 && missaoInicialFeita(p)
      ? renderFala(FALAS.familia.primeiroDia, { ...ctx, extras: { LETRA: ALFABETO[0].letra, PALAVRA: ALFABETO[0].palavra, MISSAO: FASES[0].emCasa } })
      : renderFala(
          `Oi! Resumo da semana de [NOME] no FONEMA: ${semana.filter((e) => e.tipo === 'atividade').length} atividades. ` +
            (selosRecentes[0] ? `Conquista nova: ${selosRecentes[0]}. ` : '') +
            `Agora está em "${fase.titulo}". Missão de 5 min em casa: ${fase.emCasa}`,
          ctx
        );
  return {
    nome: c.nome,
    nivel,
    termometro: p.termometro,
    termometroTexto: descreverTermometro(p.termometro),
    faseAtual: { id: fase.id, titulo: fase.titulo, objetivo: fase.objetivo, emCasa: fase.emCasa },
    jaSabe,
    aprendendo,
    atividadesSemana: semana.filter((e) => e.tipo === 'atividade').length,
    sessoesSemana: semana.filter((e) => e.tipo === 'sessao').length,
    selosRecentes,
    moedinhas: { saldo: p.moedinhas.saldo, total: p.moedinhas.total },
    mensagemWhatsApp: msg
  };
}

/** Fila do "Mostra pro professor": pendentes primeiro, as mais antigas antes. Sem resposta em 72 h, vale o critério. */
export function filaProfessor(ds: Demonstracao[], agora: number, cfg: ConfigPlataforma): Demonstracao[] {
  return ds
    .map((d) => (d.status === 'pendente' && agora - d.criadaEm > cfg.demonstracao.horasParaValerCriterio * 3600_000 ? { ...d, status: 'criterio' as const } : d))
    .sort((a, b) => (a.status === 'pendente' ? 0 : 1) - (b.status === 'pendente' ? 0 : 1) || a.criadaEm - b.criadaEm);
}

/** Mapa de habilidades da turma (professor): estado por aluno, sem ranking. */
export function mapaHabilidades(itens: { crianca: Crianca; progresso: Progresso }[], cfg: ConfigPlataforma) {
  return itens.map(({ crianca, progresso }) => ({
    crianca,
    nivel: calcularNivel(progresso.desafios, missaoInicialFeita(progresso), fasesConcluidas(progresso)),
    termometro: progresso.termometro,
    faseAtual: FASE_POR_ID[progresso.faseAtual]?.titulo ?? progresso.faseAtual,
    habilidades: HABILIDADES.map((h) => {
      const e = progresso.habilidades[h.id];
      const estado: 'dominada' | 'a-confirmar' | 'aprendendo' | 'nao-iniciada' = dominadaDeVerdade(e) ? 'dominada' : e?.dominadaEm ? 'a-confirmar' : e ? 'aprendendo' : 'nao-iniciada';
      return { id: h.id, nome: h.nome, estado, p: e?.p ?? 0, falta: e && !dominadaDeVerdade(e) ? avaliarDominio(e, cfg.dominio, h.exigePseudo).falta : [] };
    })
  }));
}

/* ------------------------------ D030: o que a criança confunde, concluído × dominado, tempo, alerta ------------------------------ */

export interface SituacaoFase {
  id: string;
  titulo: string;
  concluidaEm?: number;
  /** Todas as habilidades da fase dominadas de verdade. */
  dominada: boolean;
  /** Habilidades da fase que ainda pedem reforço, com o que falta. */
  reforco: { id: string; nome: string; estado: 'a-confirmar' | 'aprendendo'; falta: string[] }[];
}

/** Concluída × dominada, fase por fase (só as concluídas). */
export function situacaoDasFases(p: Progresso, cfg: ConfigPlataforma): SituacaoFase[] {
  return FASES.filter((f) => p.fases[f.id]?.estado === 'concluida').map((f) => {
    const reforco = f.habilidades.filter((h) => !dominadaDeVerdade(p.habilidades[h])).map((h) => ({
      id: h,
      nome: HABILIDADES.find((x) => x.id === h)?.nome ?? h,
      estado: (p.habilidades[h]?.dominadaEm ? 'a-confirmar' : 'aprendendo') as 'a-confirmar' | 'aprendendo',
      falta: avaliarDominio(p.habilidades[h], cfg.dominio, HABILIDADES.find((x) => x.id === h)?.exigePseudo ?? false).falta
    }));
    return { id: f.id, titulo: f.titulo, concluidaEm: p.fases[f.id].concluidaEm, dominada: reforco.length === 0, reforco };
  });
}

export interface ResumoAprendizagem {
  /** Fases: quantas concluídas e, dessas, quantas dominadas de verdade. */
  fases: { total: number; concluidas: number; dominadas: number; aReforcar: SituacaoFase[] };
  /** Habilidades: dominadas de verdade, marcadas mas a confirmar, e em aprendizagem. */
  habilidades: { dominadas: number; aConfirmar: number; aprendendo: number };
  /** Como as tentativas se dividem (avaliadas contam para o domínio; as outras são participação). */
  tentativas: { avaliadas: number; exposicao: number; autorrelato: number; comDetalhe: number; comTempo: number };
  pares: ParConfundido[];
  sonsELetras: ItemErrado[];
  palavras: ItemErrado[];
  /** Tempo médio por habilidade (só onde há tempo medido), com o nome da habilidade. */
  tempos: { habilidade: string; nome: string; itens: number; mediaMs: number; medianaMs: number; mediaAcertoMs?: number }[];
  /** Tempo médio geral por item (ms), ou undefined sem medida. */
  tempoMedioMs?: number;
  alerta: AlertaDeRisco;
  praticas: PraticaRecomendada[];
  sondagem: SituacaoSondagem & { evolucao: EvolucaoArea[]; quedas: QuedaArea[]; feitas: number };
  /** Ajuda graduada, "ouviu de novo" e posição da resposta certa (só onde as mecânicas gravam). */
  ajuda: ResumoAjuda & { posicoes: number[] };
  chute: SinalDeChute;
  /** Treinos rápidos com a Sofia (prática recomendada jogada pela criança), do mais novo para o mais antigo. */
  treinos: NonNullable<Progresso['treinos']>;
  termometro: { valor: number; maximoDoConteudo: number; explicacao: string };
}

/** Tudo o que o painel do adulto mostra sobre COMO a criança está aprendendo (D030). Sem nota, rótulo ou comparação. */
export function resumoAprendizagem(c: Pick<Crianca, 'anoNascimento'>, p: Progresso, cfg: ConfigPlataforma, agora: number): ResumoAprendizagem {
  const ts: Tentativa[] = todasAsTentativas(p);
  const fases = situacaoDasFases(p, cfg);
  const habs = Object.values(p.habilidades);
  const cob = coberturaDoDetalhe(ts);
  const tempos = tempoMedioPorHabilidade(ts).map((t) => ({ ...t, nome: HABILIDADES.find((h) => h.id === t.habilidade)?.nome ?? t.habilidade })).sort((a, b) => b.mediaMs - a.mediaMs);
  const itensComTempo = tempos.reduce((n, t) => n + t.itens, 0);
  const maximo = termometroMaximoDoConteudo(FASES);
  const idade = new Date(agora).getFullYear() - c.anoNascimento;
  return {
    fases: { total: FASES.length, concluidas: fases.length, dominadas: fases.filter((f) => f.dominada).length, aReforcar: fases.filter((f) => !f.dominada) },
    habilidades: {
      dominadas: habs.filter((h) => dominadaDeVerdade(h)).length,
      aConfirmar: habs.filter((h) => h.dominadaEm && h.aConfirmar).length,
      aprendendo: habs.filter((h) => !h.dominadaEm).length
    },
    tentativas: {
      avaliadas: cob.avaliadas,
      exposicao: ts.filter((t) => tipoDaTentativa(t) === 'exposicao').length,
      autorrelato: ts.filter((t) => tipoDaTentativa(t) === 'autorrelato').length,
      comDetalhe: cob.comAlvo,
      comTempo: cob.comTempo
    },
    pares: paresConfundidos(ts, cfg.reforco.errosMinPar),
    sonsELetras: fonemasEGrafemasMaisErrados(ts),
    palavras: palavrasDificeis(ts),
    tempos,
    tempoMedioMs: itensComTempo ? Math.round(tempos.reduce((s, t) => s + t.mediaMs * t.itens, 0) / itensComTempo) : undefined,
    alerta: alertaDeRisco(p, cfg, agora),
    praticas: praticasRecomendadas(p, cfg, agora),
    sondagem: { ...situacaoSondagem(p, cfg, agora, idade), evolucao: evolucaoSondagens(p), quedas: quedasEntreSondagens(p), feitas: (p.sondagens ?? []).length },
    ajuda: { ...resumoDaAjuda(ts), posicoes: posicoesDaRespostaCerta(ts) },
    chute: sinaisDeChute(ts),
    treinos: [...(p.treinos ?? [])].reverse(),
    termometro: {
      valor: p.termometro,
      maximoDoConteudo: maximo,
      explicacao: `A escala vai até 10, mas o conteúdo publicado hoje leva até ${maximo} (${descreverTermometro(maximo).replace(/\.$/, '')}). As faixas seguintes abrem quando as próximas etapas forem publicadas.`
    }
  };
}

export interface PalavraDificilDaTurma extends ItemErrado {
  /** Quantas crianças erraram este item (sem dizer quais: não há ranking). */
  criancas: number;
}

/** "Palavras difíceis" da turma: as PALAVRAS (e, à parte, os sons e letras) em que mais crianças erraram. */
export function dificuldadesDaTurma(itens: { progresso: Progresso }[]): { palavras: PalavraDificilDaTurma[]; sonsELetras: PalavraDificilDaTurma[]; pares: (ParConfundido & { criancas: number })[]; semDetalhe: boolean } {
  const junta = (pega: (ts: Tentativa[]) => ItemErrado[]): PalavraDificilDaTurma[] => {
    const m = new Map<string, PalavraDificilDaTurma>();
    for (const { progresso } of itens) {
      for (const x of pega(todasAsTentativas(progresso))) {
        const a = m.get(x.alvo);
        if (a) m.set(x.alvo, { ...a, vezes: a.vezes + x.vezes, erros: a.erros + x.erros, taxaErro: (a.erros + x.erros) / (a.vezes + x.vezes), ultimaEm: Math.max(a.ultimaEm, x.ultimaEm), habilidades: [...new Set([...a.habilidades, ...x.habilidades])], criancas: a.criancas + 1 });
        else m.set(x.alvo, { ...x, criancas: 1 });
      }
    }
    return [...m.values()].sort((a, b) => b.criancas - a.criancas || b.erros - a.erros).slice(0, 12);
  };
  const pares = new Map<string, ParConfundido & { criancas: number }>();
  let comAlvo = 0;
  for (const { progresso } of itens) {
    const ts = todasAsTentativas(progresso);
    comAlvo += coberturaDoDetalhe(ts).comAlvo;
    for (const x of paresConfundidos(ts, 2)) {
      const k = x.par.join('|');
      const a = pares.get(k);
      pares.set(k, a ? { ...a, vezes: a.vezes + x.vezes, criancas: a.criancas + 1 } : { ...x, criancas: 1 });
    }
  }
  return {
    palavras: junta((ts) => palavrasDificeis(ts)),
    sonsELetras: junta((ts) => fonemasEGrafemasMaisErrados(ts)),
    pares: [...pares.values()].sort((a, b) => b.criancas - a.criancas || b.vezes - a.vezes).slice(0, 8),
    semDetalhe: comAlvo === 0
  };
}
