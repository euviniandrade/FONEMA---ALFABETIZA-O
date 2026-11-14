/**
 * Resumos para a família e o professor (D004, D018; jogo-completo/06).
 * Nunca: comparação com colegas, nota, rótulo ou diagnóstico.
 */
import { ALFABETO, CONQUISTA_POR_ID, FASES, FASE_POR_ID, FALAS, HABILIDADES } from '@fonema/conteudo';
import type { ConfigPlataforma } from '@fonema/conteudo';
import type { Crianca, Demonstracao, Evento, Progresso } from './estado.ts';
import { DIA_MS } from './estado.ts';
import { avaliarDominio } from './dominio.ts';
import { calcularNivel } from './nivel.ts';
import { descreverTermometro } from './termometro.ts';
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
  const ctx = { nome: c.nome, genero: c.genero };
  const jaSabe = HABILIDADES.filter((h) => p.habilidades[h.id]?.dominadaEm).map((h) => renderFala(`[NOME] ${h.paraFamilia}`, ctx));
  const aprendendo = HABILIDADES.filter((h) => p.habilidades[h.id] && !p.habilidades[h.id].dominadaEm).map((h) => ({
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
      const estado: 'dominada' | 'aprendendo' | 'nao-iniciada' = e?.dominadaEm ? 'dominada' : e ? 'aprendendo' : 'nao-iniciada';
      return { id: h.id, nome: h.nome, estado, p: e?.p ?? 0, falta: e && !e.dominadaEm ? avaliarDominio(e, cfg.dominio, h.exigePseudo).falta : [] };
    })
  }));
}
