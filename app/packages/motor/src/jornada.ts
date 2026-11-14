/**
 * O "redutor" da jornada: aplica o resultado de cada atividade e fecha a sessão no ritual de fim (C9).
 * Toda a regra fica aqui (testável); a tela só mostra.
 */
import { FASE_POR_ID, HABILIDADE_POR_ID, REGIAO_POR_ID, SURPRESAS } from '@fonema/conteudo';
import type { Atividade, Cena, ConfigPlataforma, Surpresa } from '@fonema/conteudo';
import type { ConquistaGanha, Demonstracao, Progresso, Tentativa } from './estado.ts';
import { avaliarDominio, novaHabilidade, proporcao, registrarTentativa } from './dominio.ts';
import { agendarRevisao, resultadoRevisao } from './revisao.ts';
import { creditarEmBloco } from './moedinhas.ts';
import { concluirFase, fasesConcluidas, missaoInicialFeita, regiaoConcluida } from './sequencia.ts';
import { avaliarConquistas } from './conquistas.ts';
import { calcularNivel } from './nivel.ts';
import { resultadoProvaRelampago } from './trilha-expressa.ts';

export interface ResultadoAtividade {
  sessao: string;
  cena: Cena;
  tentativas: Tentativa[];
  /** A criança acertou depois de ter errado (selo "Errei, e agora?"). */
  tentouDeNovo: number;
  /** Extras específicos da mecânica (ex.: letras traçadas, palavras do ditado). */
  extras?: Record<string, number>;
}

function inc(c: Record<string, number>, k: string, v = 1): Record<string, number> {
  return { ...c, [k]: (c[k] ?? 0) + v };
}

/** Marcadores de esforço por mecânica (alimentam os selos). */
function contadoresDa(a: Atividade | undefined, cena: Cena, r: ResultadoAtividade, c: Record<string, number>): Record<string, number> {
  let out = c;
  const certas = r.tentativas.filter((t) => t.acertou).length;
  if (cena.marcador) out = inc(out, cena.marcador);
  if (cena.id.endsWith('-C7') && cena.id.startsWith('R0-F06')) out = inc(out, 'album-familia');
  if (cena.id.startsWith('R2a-F05-C7')) out = inc(out, 'guia-da-mata');
  if (r.tentouDeNovo) out = inc(out, 'tentou-de-novo', r.tentouDeNovo);
  if (!a) return out;
  if (a.tipo === 'escolher' && a.estilo === 'ensinar') out = inc(out, 'ensinar', certas);
  if (a.tipo === 'escolher' && a.estilo === 'revisao') out = inc(out, 'revisao-acertos', certas);
  if (a.tipo === 'escolher' && a.estilo === 'cacar' && a.habilidade.startsWith('vogal')) out = inc(out, 'cacar-vogal', certas);
  if (a.tipo === 'escolher' && a.itens.some((i) => i.mostrar) && a.habilidade === 'leitura-cvcv') out = inc(out, 'palavra-que-faz', certas);
  if (a.tipo === 'espelho' && /^[aEeiOou]$/.test(a.fonema)) out = { ...out, ['espelho-vogais']: Math.min(5, (out['espelho-vogais'] ?? 0) + 1) };
  if (a.tipo === 'espelho' && /^[mlf]$/.test(a.fonema)) out = inc(out, 'espelho-mlf');
  if (a.tipo === 'tracar') out = inc(out, 'tracados', r.extras?.tracados ?? a.letras.length);
  if (a.tipo === 'ditado') out = inc(out, 'ditado-palavras', r.extras?.palavras ?? a.palavras.length);
  if (a.tipo === 'montar' && a.porSilaba) out = inc(out, 'silabas-montadas', a.palavras.length * 2);
  if (a.tipo === 'montar' && !a.porSilaba && a.habilidade === 'silaba-cv') out = inc(out, 'silabas-montadas', a.palavras.length);
  if (a.tipo === 'falar' && a.habilidade === 'leitura-cvcv' && r.tentativas.some((t) => t.acertou && !t.comAjuda)) out = inc(out, 'leu-sozinho');
  return out;
}

/** Aplica UMA atividade concluída: tentativas no modelo do aluno + 1 desafio feito + marcadores. */
export function aplicarAtividade(p: Progresso, r: ResultadoAtividade, cfg: ConfigPlataforma, agora: number): Progresso {
  const habilidades = { ...p.habilidades };
  for (const t of r.tentativas) {
    let h = habilidades[t.habilidade] ?? novaHabilidade();
    h = registrarTentativa(h, t);
    if (t.revisao && h.dominadaEm) h = resultadoRevisao(h, t.acertou && !t.comAjuda, agora, cfg.revisao.intervalosDias);
    habilidades[t.habilidade] = h;
  }
  const a = r.cena.atividade;
  // Um desafio só conta quando a criança tentou de verdade (jogo-completo/07 §3 regra 1)
  const tentou = r.tentativas.length > 0 || a?.tipo === 'pausa';
  return {
    ...p,
    habilidades,
    desafios: p.desafios + (tentou ? 1 : 0),
    contadores: contadoresDa(a, r.cena, r, p.contadores)
  };
}

export interface RelatorioSessao {
  faseId: string;
  atividades: number;
  moedinhas: number;
  moedinhasCalculadas: number;
  dominadasAgora: string[];
  faseConcluida: boolean;
  regiaoConcluida?: string;
  chefe?: { leitura: number; escrita?: number; passou: boolean };
  expressa?: { passou: boolean };
  conquistasNovas: ConquistaGanha[];
  surpresas: Surpresa[];
  nivelAntes: number;
  nivelDepois: number;
  tituloNovo?: string;
  termometroAntes: number;
  termometroDepois: number;
}

/**
 * Fecha a sessão no ritual de fim (C9): domínio, conclusão da fase (sem pular), moedinhas em bloco,
 * conquistas DEPOIS do fato e surpresas de nível.
 */
export function fecharSessao(
  p0: Progresso,
  args: { faseId: string; sessao: string; atividades: number; tentativasDaSessao: Tentativa[]; expressa: boolean; demonstracoes: Demonstracao[] },
  cfg: ConfigPlataforma,
  agora: number
): { progresso: Progresso; relatorio: RelatorioSessao } {
  const fase = FASE_POR_ID[args.faseId];
  const antes = calcularNivel(p0.desafios, missaoInicialFeita(p0), fasesConcluidas(p0));
  const termometroAntes = p0.termometro;
  let p: Progresso = {
    ...p0,
    sessoesFeitas: p0.sessoesFeitas + 1,
    ultimaSessao: agora,
    fases: { ...p0.fases, [fase.id]: { ...p0.fases[fase.id], sessoes: (p0.fases[fase.id]?.sessoes ?? 0) + 1 } },
    contadores: inc(p0.contadores, 'rituais')
  };

  // 1. Domínio: habilidades que firmaram agora → marco (5 moedinhas) + revisão agendada
  const dominadasAgora: string[] = [];
  const habilidades = { ...p.habilidades };
  for (const [id, h] of Object.entries(habilidades)) {
    if (h.dominadaEm) continue;
    const exige = HABILIDADE_POR_ID[id]?.exigePseudo ?? false;
    if (avaliarDominio(h, cfg.dominio, exige).dominado) {
      habilidades[id] = agendarRevisao({ ...h, dominadaEm: agora }, agora, cfg.revisao.intervalosDias);
      dominadasAgora.push(id);
    }
  }
  p = { ...p, habilidades };

  // 2. Conclusão da fase
  let faseConcluida = false;
  let chefe: RelatorioSessao['chefe'];
  let expressa: RelatorioSessao['expressa'];
  const jaConcluida = p.fases[fase.id]?.estado === 'concluida';
  if (!jaConcluida) {
    if (args.expressa) {
      const doms = args.tentativasDaSessao.filter((t) => !t.revisao);
      const r = resultadoProvaRelampago(p, fase.id, doms.filter((t) => t.acertou && !t.comAjuda).length, doms.length, agora, cfg);
      p = r.progresso;
      faseConcluida = r.passou;
      expressa = { passou: r.passou };
    } else if (fase.criterio.tipo === 'missao') {
      faseConcluida = args.atividades >= fase.cenas.filter((c) => c.contaDominio).length;
    } else if (fase.criterio.tipo === 'dominio') {
      faseConcluida = fase.criterio.habilidades.every((h) => !!p.habilidades[h]?.dominadaEm);
    } else if (fase.criterio.tipo === 'chefe') {
      const crit = fase.criterio;
      const doChefe = args.tentativasDaSessao.filter((t) => !t.revisao);
      const escrita = doChefe.filter((t) => t.habilidade === 'escrita-cvcv');
      const leitura = doChefe.filter((t) => t.habilidade !== 'escrita-cvcv');
      const pl = proporcao(leitura);
      const pe = escrita.length ? proporcao(escrita) : undefined;
      const passou = pl >= crit.leituraMin && (crit.escritaMin === undefined || (pe ?? 0) >= crit.escritaMin);
      chefe = { leitura: pl, escrita: pe, passou };
      p = { ...p, fases: { ...p.fases, [fase.id]: { ...p.fases[fase.id], chefe: { ...chefe, em: agora } } } };
      faseConcluida = passou;
      // chefe vencido = domínio confirmado das habilidades da fase
      if (passou) {
        const hs = { ...p.habilidades };
        for (const id of fase.habilidades) {
          const h = hs[id] ?? novaHabilidade();
          if (!h.dominadaEm) {
            hs[id] = agendarRevisao({ ...h, dominadaEm: agora }, agora, cfg.revisao.intervalosDias);
            dominadasAgora.push(id);
          }
        }
        p = { ...p, habilidades: hs };
      }
    }
    if (faseConcluida && !args.expressa) p = concluirFase(p, fase.id, agora);
  }

  // 3. Moedinhas em bloco (teto/dia)
  const regiaoFechou = faseConcluida && regiaoConcluida(p, fase.regiao) ? fase.regiao : undefined;
  const credito = creditarEmBloco(p, { atividades: args.atividades, marcos: dominadasAgora.length, regioes: regiaoFechou ? 1 : 0 }, cfg.moedinhas, agora);
  p = credito.progresso;

  // 4. Conquistas depois do fato
  const ac = avaliarConquistas(p, args.demonstracoes, agora);
  p = ac.progresso;

  // 5. Nível e surpresas (P1-b: chegam depois, sem anúncio)
  const depois = calcularNivel(p.desafios, missaoInicialFeita(p), fasesConcluidas(p));
  const surpresas = SURPRESAS.filter((s) => s.nivel <= depois.nivel && !p.surpresas.includes(s.id));
  if (surpresas.length) {
    p = {
      ...p,
      surpresas: [...p.surpresas, ...surpresas.map((s) => s.id)],
      itens: [...p.itens, ...surpresas.filter((s) => s.tipo === 'item' && !p.itens.includes(s.id)).map((s) => s.id)],
      areas: [...p.areas, ...surpresas.filter((s) => s.tipo === 'area').map((s) => s.id)]
    };
  }

  return {
    progresso: p,
    relatorio: {
      faseId: fase.id,
      atividades: args.atividades,
      moedinhas: credito.creditado,
      moedinhasCalculadas: credito.calculado,
      dominadasAgora,
      faseConcluida,
      regiaoConcluida: regiaoFechou ? REGIAO_POR_ID[regiaoFechou].nome : undefined,
      chefe,
      expressa,
      conquistasNovas: ac.novas,
      surpresas,
      nivelAntes: antes.nivel,
      nivelDepois: depois.nivel,
      tituloNovo: depois.titulo && depois.titulo !== antes.titulo ? depois.titulo : undefined,
      termometroAntes,
      termometroDepois: p.termometro
    }
  };
}

/** Configuração efetiva (modo demonstração: 1 sessão basta e menos tentativas, para testar a jornada). */
export function configEfetiva(cfg: ConfigPlataforma): ConfigPlataforma {
  if (!cfg.modoDemonstracao) return cfg;
  return { ...cfg, dominio: { ...cfg.dominio, sessoesMin: 1, tentativasMin: Math.min(cfg.dominio.tentativasMin, 4), pMin: Math.min(cfg.dominio.pMin, 0.85), acertosNasUltimas: Math.min(cfg.dominio.acertosNasUltimas, 3), pseudoMin: Math.min(cfg.dominio.pseudoMin, 1) } };
}
