/**
 * O "redutor" da jornada: aplica o resultado de cada atividade e fecha a sessão no ritual de fim (C9).
 * Toda a regra fica aqui (testável); a tela só mostra.
 */
import { FASE_POR_ID, HABILIDADE_POR_ID, REGIAO_POR_ID, SURPRESAS } from '@fonema/conteudo';
import type { Atividade, Cena, ConfigPlataforma, Fase, Surpresa } from '@fonema/conteudo';
import type { ConquistaGanha, Demonstracao, Progresso, Tentativa } from './estado.ts';
import { avaliarDominio, dominadaDeVerdade, novaHabilidade, palavrasDaFase, paraProva, proporcao, registrarTentativa, tiposDeAtividadeDaFase, tiposDeAtividadeDoConteudo } from './dominio.ts';
import { TIPO_POR_MECANICA, acertoSozinho, ehAvaliada, normalizarTentativa } from './tentativas.ts';
import { agendarRevisao, resultadoRevisao } from './revisao.ts';
import { creditarEmBloco } from './moedinhas.ts';
import { concluirFase, fasesConcluidas, missaoInicialFeita, regiaoConcluida } from './sequencia.ts';
import { avaliarConquistas } from './conquistas.ts';
import { calcularNivel } from './nivel.ts';
import { resultadoProvaRelampago } from './trilha-expressa.ts';
import { resumoDaMissao } from './guia.ts';

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
  // D030 (selos sem exposição): só conta resposta CONFERIDA, certa e sem ajuda. A mecânica pode não ter gravado
  // `tipo`: aí vale o padrão da mecânica da cena (Letra, Espelho, Traçar e Falar nunca contam aqui).
  const conferidas = r.tentativas.map((t) => normalizarTentativa(t, cena));
  const certas = conferidas.filter(acertoSozinho).length;
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
  // contadores CONFERIDOS (D030): os selos de habilidade usam estes; os de cima ficam como registro de participação
  if (a.tipo === 'ditado') out = inc(out, 'ditado-acertos', certas);
  if (a.tipo === 'montar' && (a.porSilaba || a.habilidade === 'silaba-cv')) out = inc(out, 'silabas-montadas-certas', certas);
  if (a.habilidade === 'leitura-cvcv' && a.tipo !== 'falar' && certas > 0) out = inc(out, 'leu-sozinho-conferido', certas);
  return out;
}

/** Aplica UMA atividade concluída: tentativas no modelo do aluno + 1 desafio feito + marcadores. */
export function aplicarAtividade(p: Progresso, r: ResultadoAtividade, cfg: ConfigPlataforma, agora: number): Progresso {
  const habilidades = { ...p.habilidades };
  const ehRevisao = r.cena.tipo === 'C1' && r.cena.id.includes('-C1-revisao');
  for (const bruta of r.tentativas) {
    // D030: completa tipo/mecânica (avaliada × exposição × autorrelato) e marca a revisão mesmo quando a mecânica não marca
    const t = normalizarTentativa(ehRevisao && !bruta.revisao ? { ...bruta, revisao: true } : bruta, r.cena);
    let h = habilidades[t.habilidade] ?? novaHabilidade();
    h = registrarTentativa(h, t);
    // a revisão espaçada só anda com resposta conferida (qualquer mecânica avaliada, não só o Escolher)
    if (t.revisao && h.dominadaEm && ehAvaliada(t)) h = resultadoRevisao(h, t.acertou && !t.comAjuda, agora, cfg.revisao.intervalosDias);
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
  /** D030: a fase, além de concluída, está DOMINADA (todas as habilidades dela, com tentativas avaliadas). */
  faseDominada?: boolean;
  /** D030: habilidades desta fase que ainda pedem reforço (concluiu por participação, sem domínio). */
  reforco?: string[];
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
    if (h.dominadaEm && !h.aConfirmar) continue;
    const exige = HABILIDADE_POR_ID[id]?.exigePseudo ?? false;
    if (!avaliarDominio(h, cfg.dominio, exige, id).dominado) continue;
    if (h.dominadaEm) {
      // já estava marcada (dado antigo, chefe ou prova-relâmpago): agora o critério honesto confirmou.
      // O marco (moedinhas) que a prova de uma sessão só não deu sai agora; dado antigo já tinha recebido.
      habilidades[id] = { ...h, aConfirmar: undefined, marcoPendente: undefined };
      if (h.marcoPendente) dominadasAgora.push(id);
    } else {
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
      const doms = paraProva(args.tentativasDaSessao.filter((t) => !t.revisao));
      const r = resultadoProvaRelampago(p, fase.id, doms.filter((t) => t.acertou && !t.comAjuda).length, doms.length, agora, cfg);
      p = r.progresso;
      faseConcluida = r.passou;
      expressa = { passou: r.passou };
    } else if (fase.criterio.tipo === 'missao') {
      faseConcluida = args.atividades >= fase.cenas.filter((c) => c.contaDominio).length;
    } else if (fase.criterio.tipo === 'dominio') {
      faseConcluida = fase.criterio.habilidades.every((h) => criterioDaFaseCumprido(p, fase, h, cfg));
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
      // chefe vencido LIBERA o avanço, mas é uma sessão só: as habilidades da fase ficam "a confirmar" (não dominadas)
      // até cumprirem o critério de docs/pedagogia/06 §2 (≥ 2 sessões, palavras e tipos de atividade diferentes)
      if (passou) p = { ...p, habilidades: marcarAConfirmar(p.habilidades, fase.habilidades, agora, cfg) };
    }
    if (faseConcluida && !args.expressa) p = concluirFase(p, fase.id, agora);
  }
  // 2b. Concluída × dominada (D030): marca as fases concluídas cujas habilidades estão todas dominadas de verdade
  p = marcarFasesDominadas(p, agora);
  const faseDominada = !!p.fases[fase.id]?.dominadaEm;
  const reforco = p.fases[fase.id]?.estado === 'concluida' ? fase.habilidades.filter((h) => !dominadaDeVerdade(p.habilidades[h])) : [];

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

  // 6. D032: resumo da última missão para o painel guia (estrelinhas e selos; não mexe no domínio)
  p = { ...p, ultimaMissao: resumoDaMissao({ faseId: fase.id, atividades: args.atividades, tentativas: args.tentativasDaSessao, selos: ac.novas.map((g) => g.id), faseConcluida }, agora) };

  return {
    progresso: p,
    relatorio: {
      faseId: fase.id,
      atividades: args.atividades,
      moedinhas: credito.creditado,
      moedinhasCalculadas: credito.calculado,
      dominadasAgora,
      faseConcluida,
      faseDominada,
      reforco,
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

/**
 * A fase oferece item AVALIADO para a habilidade? (`pseudo`: item avaliado de pseudopalavra.)
 * Serve para não travar a jornada pedindo uma prova que o conteúdo da fase não dá.
 */
export function faseMede(fase: Fase, habilidade: string, pseudo = false): boolean {
  return fase.cenas.some((c) => {
    const a = c.atividade;
    if (!a || !c.contaDominio) return false;
    if ((TIPO_POR_MECANICA[a.tipo] ?? 'avaliada') !== 'avaliada') return false;
    if (a.tipo === 'montar' && (a as { vocabulario?: boolean }).vocabulario) return false;
    const itens = (a.tipo === 'escolher' ? a.itens : []) as { habilidade?: string; pseudo?: boolean }[];
    if (a.tipo === 'escolher') {
      return itens.some((i) => (i.habilidade ?? a.habilidade) === habilidade && (!pseudo || !!i.pseudo));
    }
    if (a.tipo === 'ligar') return !pseudo && a.pares.some((x) => (x.habilidade ?? a.habilidade) === habilidade);
    return a.habilidade === habilidade && !pseudo;
  });
}

/** Quantos itens de par mínimo do contraste a fase oferece (cenas que contam para o domínio). */
export function itensDeParDaFase(fase: Fase, habilidade: string): number {
  return fase.cenas.reduce((n, c) => n + (c.contaDominio && c.atividade?.tipo === 'parMinimo'
    ? c.atividade.itens.filter((i) => (i.habilidade ?? c.atividade!.habilidade) === habilidade).length : 0), 0);
}

/**
 * Critério de uma fase de DOMÍNIO para uma habilidade (D030):
 *  - regra geral: a habilidade está dominada (tentativas avaliadas);
 *  - se a fase não tem item avaliado de PSEUDOPALAVRA para uma habilidade que exige pseudo, a fase conclui quando
 *    só falta a pseudopalavra — a habilidade NÃO fica dominada (vai para reforço e para o painel);
 *  - se a fase não tem NENHUM item avaliado da habilidade, ela não segura a fase (conclui por participação).
 * Assim autorrelato nunca cumpre o critério, e a jornada não trava por falta de item conferido no conteúdo.
 */
export function criterioDaFaseCumprido(p: Progresso, fase: Fase, habilidade: string, cfg: ConfigPlataforma): boolean {
  const h = p.habilidades[habilidade];
  // "a confirmar" (chefe ou prova-relâmpago de uma sessão só) não conta: a fase pede a prova de verdade
  if (dominadaDeVerdade(h)) return true;
  if (!faseMede(fase, habilidade)) return true;
  const exige = HABILIDADE_POR_ID[habilidade]?.exigePseudo ?? false;
  const av = avaliarDominio(h, cfg.dominio, exige, habilidade);
  if (av.dominado) return true;
  if (!av.basicoCumprido) return false;
  // só falta o que ESTA fase não tem como pedir (pseudopalavra conferida, outro tipo de atividade, palavras diferentes):
  // a fase conclui, mas a habilidade NÃO fica dominada (vai para reforço e para o painel)
  if (av.faltaPseudo && faseMede(fase, habilidade, true)) return false;
  if (av.faltaTipos && (tiposDeAtividadeDaFase(fase).get(habilidade)?.size ?? 0) >= Math.min(cfg.dominio.tiposDeAtividadeMin ?? 2, tiposDeAtividadeDoConteudo(habilidade).size)) return false;
  if (av.faltaItens && palavrasDaFase(fase, habilidade) >= (cfg.dominio.itensDiferentesMin ?? 3)) return false;
  // pares mínimos: a fase só segura o "8 de 10" quando ela mesma oferece itens suficientes do contraste (nenhuma lição
  // de hoje oferece: 2 a 5 itens); senão conclui e a habilidade segue para revisão, treino e painel, sem ficar dominada
  if (av.faltaPares && itensDeParDaFase(fase, habilidade) >= (cfg.dominio.paresMinimos?.janela ?? 10)) return false;
  return true;
}

/**
 * Prova de UMA sessão (chefe vencido, prova-relâmpago): marca as habilidades ainda não dominadas como "a confirmar"
 * (`dominadaEm` + `aConfirmar`, para a jornada não pedir de novo o que a criança já mostrou), com revisão agendada e o
 * marco pendente. Nunca mexe na firmeza (p) nem em habilidade já dominada de verdade.
 */
export function marcarAConfirmar(hs0: Progresso['habilidades'], ids: string[], agora: number, cfg: ConfigPlataforma): Progresso['habilidades'] {
  const hs = { ...hs0 };
  for (const id of ids) {
    const h = hs[id] ?? novaHabilidade();
    if (h.dominadaEm) continue;
    hs[id] = agendarRevisao({ ...h, dominadaEm: agora, aConfirmar: true, marcoPendente: true }, agora, cfg.revisao.intervalosDias);
  }
  return hs;
}

/** Marca `dominadaEm` nas fases concluídas em que todas as habilidades estão dominadas de verdade. Nunca desmarca. */
export function marcarFasesDominadas(p: Progresso, agora: number): Progresso {
  let fases = p.fases;
  for (const [id, f] of Object.entries(p.fases)) {
    if (f.estado !== 'concluida' || f.dominadaEm) continue;
    const fase = FASE_POR_ID[id];
    if (!fase || !fase.habilidades.every((h) => dominadaDeVerdade(p.habilidades[h]))) continue;
    if (fases === p.fases) fases = { ...p.fases };
    fases[id] = { ...f, dominadaEm: agora };
  }
  return fases === p.fases ? p : { ...p, fases };
}

/** Configuração efetiva (modo demonstração: 1 sessão basta e menos tentativas, para testar a jornada). */
export function configEfetiva(cfg: ConfigPlataforma): ConfigPlataforma {
  if (!cfg.modoDemonstracao) return cfg;
  return { ...cfg, dominio: { ...cfg.dominio, sessoesMin: 1, tentativasMin: Math.min(cfg.dominio.tentativasMin, 4), pMin: Math.min(cfg.dominio.pMin, 0.85), acertosNasUltimas: Math.min(cfg.dominio.acertosNasUltimas, 3), pseudoMin: Math.min(cfg.dominio.pseudoMin, 1) } };
}
