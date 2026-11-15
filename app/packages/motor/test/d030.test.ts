/**
 * D030 (etapas 2, 5 e 9): registro detalhado, migração, matriz de confusão, domínio honesto, concluída × dominada,
 * reforço dirigido, pré-requisito, alerta e sondagem periódica.
 */
import { describe, expect, it } from 'vitest';
import { CONFIG_PADRAO, FASES, FASE_POR_ID, HABILIDADE_POR_ID, PARES_CONFUSOS, mesclarConfig } from '@fonema/conteudo';
import type { Cena } from '@fonema/conteudo';
import {
  AVATAR_LIMPO, DIA_MS, TIPO_POR_MECANICA, agendarRevisao, alertaDeRisco, aplicarAtividade, atividadeDeRevisao, avaliarDominio, categoriaDoAlvo,
  chaveDoSom, concluirFase, criterioDaFaseCumprido, detalharTentativa, dificuldadesDaTurma, dominadaDeVerdade, ehAvaliada, evolucaoSondagens, faseMede,
  faseQueEnsina, fecharSessao, fonemasEGrafemasMaisErrados, itensDeRevisao, itensDoPar, marcarFasesDominadas, matrizDeConfusao, mecanicaDaCena,
  migrarProgresso, montarSessao, normalizarTentativa, novaHabilidade, palavrasDificeis, parConhecido, parceiroProvavel, paresConfundidos,
  praticasRecomendadas, preRequisitoDe, progressoInicial, proporcao, proximaPratica, recalcularP, registrarSondagem, registrarTentativa,
  resultadoPorArea, resumoAprendizagem, resumoFamilia, sessoesSeguidasComErro, situacaoDasFases, situacaoSondagem, tempoMedioPorHabilidade,
  termometroMaximoDoConteudo, tipoDaTentativa, tipoDeErro
} from '../src/index.ts';
import type { Crianca, EstadoHabilidade, Progresso, Tentativa } from '../src/index.ts';

const T0 = new Date('2026-11-15T15:00:00').getTime();
const cfg = CONFIG_PADRAO;
const crianca: Crianca = {
  id: 'c1', nome: 'Mariana', genero: 'f', anoNascimento: 2019,
  pronuncia: { grafia: 'Ma-ri-A-na', fala: 'Mariana', rate: 1, pitchExtra: 0, voz: 'sofia' },
  avatar: { ...AVATAR_LIMPO, cantinho: 'mata' },
  apoios: { previsivel: false, focoCurto: false, leituraReforco: false, calmo: false },
  jaSabe: { letrasDoNome: 'nao-sei', lePalavras: 'nao-sei', leFrases: 'nao-sei' },
  consentimentos: { responsavel: true, vozPrimeiroNome: true, gravarVozAdulto: false, em: T0 },
  rotina: { minutosDia: 15, horaDormir: '20:00' },
  criadoEm: T0
};

let relogio = 0;
/** Tentativa avaliada (mecânica 'escolher') por padrão. */
const t = (habilidade: string, acertou: boolean, sessao: string, extra: Partial<Tentativa> = {}): Tentativa =>
  ({ em: T0 + relogio++, sessao, habilidade, acertou, mecanica: 'escolher', ...extra });
/** Troca: o alvo era `alvo`, a criança tocou em `escolhido` e depois acertou com ajuda. */
const troca = (habilidade: string, alvo: string, escolhido: string, sessao: string): Tentativa =>
  t(habilidade, true, sessao, { comAjuda: true, alvo, escolhido, respostas: [escolhido, alvo], distratores: [escolhido], tentativaNumero: 2 });
const certo = (habilidade: string, alvo: string, sessao: string, extra: Partial<Tentativa> = {}): Tentativa =>
  t(habilidade, true, sessao, { alvo, escolhido: alvo, respostas: [alvo], tentativaNumero: 1, ...extra });

function comTentativas(ts: Tentativa[], base: Progresso = progressoInicial('c1', T0)): Progresso {
  const habilidades = { ...base.habilidades };
  for (const x of ts) habilidades[x.habilidade] = registrarTentativa(habilidades[x.habilidade] ?? novaHabilidade(), x);
  return { ...base, habilidades };
}

const cenaDe = (faseId: string, tipo: string): Cena => FASE_POR_ID[faseId].cenas.find((c) => c.atividade?.tipo === tipo)!;

describe('registro detalhado de tentativas (contrato DetalheTentativa)', () => {
  it('classifica cada mecânica: avaliada × exposição × autorrelato', () => {
    expect(TIPO_POR_MECANICA.escolher).toBe('avaliada');
    expect(TIPO_POR_MECANICA.montar).toBe('avaliada');
    expect(TIPO_POR_MECANICA.ditado).toBe('avaliada');
    expect(TIPO_POR_MECANICA.letra).toBe('exposicao');
    expect(TIPO_POR_MECANICA.espelho).toBe('exposicao');
    expect(TIPO_POR_MECANICA.tracar).toBe('exposicao');
    expect(TIPO_POR_MECANICA.falar).toBe('autorrelato');
  });

  it('dado antigo (sem tipo nem mecânica) é classificado pela cena', () => {
    const letra = cenaDe('AL-A', 'letra');
    const escolher = cenaDe('AL-A', 'escolher');
    expect(mecanicaDaCena(letra.id)).toBe('letra');
    expect(tipoDaTentativa({ cena: letra.id })).toBe('exposicao');
    expect(tipoDaTentativa({ cena: escolher.id })).toBe('avaliada');
    expect(tipoDaTentativa({ cena: 'AL-B-C1-revisao' })).toBe('avaliada');
    expect(tipoDaTentativa({ cena: 'AL-B-C6-pausa' })).toBe('exposicao');
    // cena que não existe mais: fica como era antes (avaliada), para não apagar evidência
    expect(tipoDaTentativa({ cena: 'fase-que-saiu-do-ar' })).toBe('avaliada');
    expect(tipoDaTentativa({})).toBe('avaliada');
  });

  it('o tipo informado pela mecânica vale mais que o padrão (e "resposta" é aceito como "avaliada")', () => {
    const tracar = cenaDe('AL-A', 'tracar');
    expect(tipoDaTentativa({ cena: tracar.id, tipo: 'avaliada' })).toBe('avaliada');
    expect(tipoDaTentativa({ cena: tracar.id, tipo: 'resposta' as never })).toBe('avaliada');
    expect(tipoDaTentativa({ mecanica: 'montar', tipo: 'exposicao' })).toBe('exposicao');
    expect(ehAvaliada({ mecanica: 'falar' })).toBe(false);
  });

  it('normaliza na entrada: grava mecânica e tipo, deduz escolhido e número da tentativa', () => {
    const cena = cenaDe('AL-B', 'escolher');
    const n = normalizarTentativa({ em: T0, sessao: 's', habilidade: 'letra-b', acertou: true, comAjuda: true, alvo: 'B', respostas: ['D', 'P', 'B'] }, cena);
    expect(n).toMatchObject({ mecanica: 'escolher', tipo: 'avaliada', escolhido: 'D', tentativaNumero: 3, cena: cena.id });
    const primeira = normalizarTentativa({ em: T0, sessao: 's', habilidade: 'letra-b', acertou: true, alvo: 'B' }, cena);
    expect(primeira.escolhido).toBe('B');
    expect(normalizarTentativa({ em: T0, sessao: 's', habilidade: 'x', acertou: true, tempoMs: -5 }).tempoMs).toBeUndefined();
    expect(detalharTentativa({ em: T0, sessao: 's', habilidade: 'x', acertou: true, pseudo: true }, { alvo: 'FOLU', tempoMs: 900, escolhido: undefined })).toMatchObject({ pseudo: true, alvo: 'FOLU', tempoMs: 900 });
  });

  it('aplicarAtividade guarda o detalhe e marca a revisão mesmo quando a mecânica não marca', () => {
    const cena = cenaDe('AL-B', 'escolher');
    let p = progressoInicial('c1', T0);
    p = aplicarAtividade(p, { sessao: 's1', cena, tentativas: [{ em: T0, sessao: 's1', habilidade: 'letra-b', acertou: true, comAjuda: true, alvo: 'B', respostas: ['D', 'B'], distratores: ['D', 'P'], tempoMs: 4200 }], tentouDeNovo: 1 }, cfg, T0);
    expect(p.habilidades['letra-b'].tentativas[0]).toMatchObject({ tipo: 'avaliada', mecanica: 'escolher', alvo: 'B', escolhido: 'D', distratores: ['D', 'P'], tempoMs: 4200, tentativaNumero: 2 });
    const revisao: Cena = { id: 'AL-C-C1-revisao-2', tipo: 'C1', titulo: 'Jardim da Revisão', cenario: 'quintal', atividade: cenaDe('R2a-F05', 'ditado').atividade };
    p = aplicarAtividade(p, { sessao: 's1', cena: revisao, tentativas: [{ em: T0, sessao: 's1', habilidade: 'escrita-cvcv', acertou: true }], tentouDeNovo: 0 }, cfg, T0);
    expect(p.habilidades['escrita-cvcv'].tentativas[0]).toMatchObject({ revisao: true, mecanica: 'ditado', tipo: 'avaliada' });
  });
});

describe('domínio honesto: exposição e autorrelato não contam', () => {
  it('Letra, Espelho, Traçar e Falar ficam registrados como participação e não mexem na firmeza', () => {
    let h = novaHabilidade();
    const p0 = h.p;
    for (const mecanica of ['letra', 'espelho', 'tracar', 'falar'] as const) {
      for (let i = 0; i < 6; i++) h = registrarTentativa(h, t('letra-a', true, i < 3 ? 's1' : 's2', { mecanica }));
    }
    expect(h.tentativas).toHaveLength(24);
    expect(h.p).toBe(p0);
    const av = avaliarDominio(h, cfg.dominio, false);
    expect(av.dominado).toBe(false);
    expect(av.tentativas).toBe(0);
    expect(av.sessoes).toBe(0);
    expect(av.participacoes).toBe(24);
  });

  it('com as mesmas tentativas AVALIADAS, o domínio sai como antes', () => {
    let h = novaHabilidade();
    for (let i = 0; i < 12; i++) h = registrarTentativa(h, t('letra-a', true, i < 8 ? 's1' : 's2'));
    expect(avaliarDominio(h, cfg.dominio, false).dominado).toBe(true);
  });

  it('pseudopalavra por autorrelato não cumpre o critério; por resposta conferida, cumpre', () => {
    let h = novaHabilidade();
    for (let i = 0; i < 10; i++) h = registrarTentativa(h, t('leitura-cvcv', true, i < 5 ? 's1' : 's2'));
    for (let i = 0; i < 4; i++) h = registrarTentativa(h, t('leitura-cvcv', true, 's2', { pseudo: true, mecanica: 'falar' }));
    const so = avaliarDominio(h, cfg.dominio, true);
    expect(so.dominado).toBe(false);
    expect(so.pseudoCertas).toBe(0);
    expect(so.soFaltaPseudo).toBe(true);
    expect(so.falta.join()).toMatch(/pseudopalavra/);
    for (let i = 0; i < 2; i++) h = registrarTentativa(h, t('leitura-cvcv', true, 's2', { pseudo: true }));
    expect(avaliarDominio(h, cfg.dominio, true).dominado).toBe(true);
  });

  it('provas (chefe, relâmpago) contam só as respostas conferidas', () => {
    const ts = [t('leitura-cvcv', false, 's'), t('leitura-cvcv', true, 's'), ...[1, 2, 3, 4].map(() => t('leitura-cvcv', true, 's', { mecanica: 'falar' }))];
    expect(proporcao(ts)).toBe(0.5);
    // prova só de autorrelato: vale a conta antiga, para não travar a jornada
    expect(proporcao(ts.slice(2))).toBe(1);
  });

  it('jogar a missão de uma letra duas vezes NÃO domina a letra só com Letra+Espelho+Traçar', () => {
    let p = progressoInicial('c1', T0);
    const f = FASE_POR_ID['AL-A'];
    for (const sessao of ['s1', 's2']) {
      const todas: Tentativa[] = [];
      let atividades = 0;
      for (const c of f.cenas) {
        const a = c.atividade;
        if (!a || TIPO_POR_MECANICA[a.tipo] === 'avaliada') continue; // a criança só fez as cenas de exposição
        const ts = Array.from({ length: 4 }, () => ({ em: T0, sessao, habilidade: 'letra-a', acertou: true, cena: c.id }));
        p = aplicarAtividade(p, { sessao, cena: c, tentativas: ts, tentouDeNovo: 0 }, cfg, T0);
        if (c.contaDominio) { atividades++; todas.push(...ts); }
      }
      p = fecharSessao(p, { faseId: 'AL-A', sessao, atividades, tentativasDaSessao: todas, expressa: false, demonstracoes: [] }, cfg, T0).progresso;
    }
    expect(p.habilidades['letra-a'].tentativas.length).toBeGreaterThanOrEqual(8);
    expect(p.habilidades['letra-a'].dominadaEm).toBeUndefined();
  });
});

describe('concluída × dominada', () => {
  /** Joga a fase inteira acertando tudo. */
  function jogar(p: Progresso, faseId: string, agora: number, sessaoId?: string) {
    const s = montarSessao(p, crianca, faseId, cfg, agora);
    const id = sessaoId ?? s.id;
    const todas: Tentativa[] = [];
    let atividades = 0;
    for (const e of s.etapas) {
      const a = e.cena?.atividade;
      if (!a) continue;
      const n = a.tipo === 'escolher' ? Math.max(1, a.itens.length) : 1;
      const ts: Tentativa[] = Array.from({ length: n }, (_, k) => ({ em: agora, sessao: id, habilidade: (a.tipo === 'escolher' ? a.itens[k]?.habilidade : undefined) ?? a.habilidade, acertou: true, cena: e.cena!.id }));
      p = aplicarAtividade(p, { sessao: id, cena: e.cena!, tentativas: ts, tentouDeNovo: 0 }, cfg, agora);
      if (e.cena!.contaDominio) { atividades++; todas.push(...ts); }
    }
    return fecharSessao(p, { faseId, sessao: id, atividades, tentativasDaSessao: todas, expressa: false, demonstracoes: [] }, cfg, agora);
  }

  it('a missão da letra conclui por participação (jornada não trava), mas fica marcada como NÃO dominada, com reforço', () => {
    const r = jogar(progressoInicial('c1', T0), 'AL-A', T0);
    expect(r.relatorio.faseConcluida).toBe(true);
    expect(r.relatorio.faseDominada).toBe(false);
    expect(r.relatorio.reforco).toEqual(['letra-a']);
    expect(r.progresso.fases['AL-A'].estado).toBe('concluida');
    expect(r.progresso.fases['AL-A'].dominadaEm).toBeUndefined();
    expect(r.progresso.fases['AL-B'].estado).toBe('aberta');
    const sit = situacaoDasFases(r.progresso, cfg);
    expect(sit).toHaveLength(1);
    expect(sit[0]).toMatchObject({ id: 'AL-A', dominada: false });
    expect(sit[0].reforco[0]).toMatchObject({ id: 'letra-a', estado: 'aprendendo' });
  });

  it('quando a habilidade firma com respostas conferidas, a fase já concluída passa a dominada', () => {
    let p = jogar(progressoInicial('c1', T0), 'AL-A', T0).progresso;
    const mais = Array.from({ length: 10 }, (_, i) => t('letra-a', true, i < 5 ? 'x1' : 'x2'));
    p = comTentativas(mais, p);
    const r = fecharSessao(p, { faseId: 'AL-B', sessao: 'x2', atividades: 0, tentativasDaSessao: [], expressa: false, demonstracoes: [] }, cfg, T0 + DIA_MS);
    expect(r.relatorio.dominadasAgora).toContain('letra-a');
    expect(r.progresso.fases['AL-A'].dominadaEm).toBe(T0 + DIA_MS);
    expect(situacaoDasFases(r.progresso, cfg)[0].dominada).toBe(true);
    expect(marcarFasesDominadas(r.progresso, T0 + 2 * DIA_MS)).toBe(r.progresso); // nunca remarca
  });

  it('toda fase de domínio é alcançável só com itens conferidos (a jornada inteira anda, sem travar)', () => {
    let p = progressoInicial('c1', T0);
    let agora = T0;
    for (const f of FASES) {
      let ok = false;
      for (let s = 0; s < 4 && !ok; s++) {
        agora += DIA_MS;
        const r = jogar(p, f.id, agora, `${f.id}-s${s}`);
        p = r.progresso;
        ok = p.fases[f.id].estado === 'concluida';
      }
      expect(ok, `fase ${f.id} não concluiu em 4 sessões perfeitas`).toBe(true);
    }
    // quem lê pseudopalavra só por autorrelato não fica "dominada de verdade" em leitura
    const leitura = p.habilidades['leitura-cvcv'];
    const temPseudoConferida = FASES.some((f) => faseMede(f, 'leitura-cvcv', true));
    if (!temPseudoConferida) expect(dominadaDeVerdade(leitura)).toBe(false);
  });

  it('fase de domínio sem item conferido de pseudopalavra conclui quando só falta a pseudo — sem dominar', () => {
    const fase = FASES.find((f) => f.criterio.tipo === 'dominio' && f.criterio.habilidades.includes('leitura-cvcv'));
    if (!fase) return;
    const ts = Array.from({ length: 10 }, (_, i) => t('leitura-cvcv', true, i < 5 ? 's1' : 's2'));
    const p = comTentativas(ts);
    const mede = faseMede(fase, 'leitura-cvcv', true);
    expect(criterioDaFaseCumprido(p, fase, 'leitura-cvcv', cfg)).toBe(!mede);
    expect(avaliarDominio(p.habilidades['leitura-cvcv'], cfg.dominio, true).dominado).toBe(false);
    // com erro recente não conclui de jeito nenhum
    const ruim = comTentativas([t('leitura-cvcv', false, 's2'), t('leitura-cvcv', false, 's2')], p);
    expect(criterioDaFaseCumprido(ruim, fase, 'leitura-cvcv', cfg)).toBe(false);
  });

  it('chefe vencido sem pseudopalavra conferida deixa a leitura "a confirmar"', () => {
    let p = progressoInicial('c1', T0);
    for (const f of FASES) { if (f.id === 'R2a-F05') break; p = concluirFase(p, f.id, T0); }
    const ts = [...Array.from({ length: 4 }, () => t('leitura-cvcv', true, 'chefe')), ...Array.from({ length: 3 }, () => t('leitura-cvcv', true, 'chefe', { mecanica: 'falar', pseudo: true })), ...Array.from({ length: 4 }, () => t('escrita-cvcv', true, 'chefe', { mecanica: 'ditado' }))];
    p = comTentativas(ts, p);
    const r = fecharSessao(p, { faseId: 'R2a-F05', sessao: 'chefe', atividades: 3, tentativasDaSessao: ts, expressa: false, demonstracoes: [] }, cfg, T0);
    expect(r.relatorio.chefe?.passou).toBe(true);
    expect(r.progresso.habilidades['leitura-cvcv']).toMatchObject({ dominadaEm: T0, aConfirmar: true });
    expect(r.progresso.habilidades['escrita-cvcv'].aConfirmar).toBeUndefined();
    expect(r.relatorio.faseDominada).toBe(false);
    expect(r.relatorio.reforco).toEqual(['leitura-cvcv']);
  });
});

describe('migração dos dados salvos (versão 1 → 2) sem perder progresso', () => {
  function antigo(): Progresso {
    let p = progressoInicial('c1', T0);
    p = concluirFase(p, 'AL-A', T0);
    const letra = cenaDe('AL-A', 'letra').id;
    const espelho = cenaDe('AL-A', 'espelho').id;
    const tracar = cenaDe('AL-A', 'tracar').id;
    const escolher = cenaDe('AL-A', 'escolher').id;
    // como o app antigo gravava: sem tipo, sem mecânica, P subindo com tudo
    const brutas: Tentativa[] = [];
    for (const s of ['s1', 's2']) {
      for (const cena of [letra, espelho, tracar, tracar]) brutas.push({ em: T0, sessao: s, habilidade: 'letra-a', acertou: true, cena });
      brutas.push({ em: T0, sessao: s, habilidade: 'letra-a', acertou: true, cena: escolher });
    }
    const h: EstadoHabilidade = agendarRevisao({ tentativas: brutas, p: 0.99, dominadaEm: T0 }, T0, cfg.revisao.intervalosDias);
    return { ...p, versao: 1, sondagens: undefined, habilidades: { 'letra-a': h }, moedinhas: { saldo: 7, total: 9, porDia: {} }, conquistas: { 'S-LETRA-A': { id: 'S-LETRA-A', nivel: 'unico', em: T0, vista: true } }, desafios: 12, sessoesFeitas: 2, termometro: 1 };
  }

  it('mantém fases, moedinhas, selos, desafios, revisão e TODAS as tentativas', () => {
    const v1 = antigo();
    const v2 = migrarProgresso(v1, cfg);
    expect(v2.versao).toBe(2);
    expect(v2.fases).toEqual(v1.fases);
    expect(v2.moedinhas).toEqual(v1.moedinhas);
    expect(v2.conquistas).toEqual(v1.conquistas);
    expect(v2.desafios).toBe(12);
    expect(v2.termometro).toBe(1);
    expect(v2.sondagens).toEqual([]);
    const h = v2.habilidades['letra-a'];
    expect(h.tentativas).toHaveLength(10);
    expect(h.dominadaEm).toBe(T0);
    expect(h.revisao).toEqual(v1.habilidades['letra-a'].revisao);
  });

  it('classifica as tentativas antigas, refaz a firmeza só com as conferidas e etiqueta "a confirmar"', () => {
    const v2 = migrarProgresso(antigo(), cfg);
    const h = v2.habilidades['letra-a'];
    expect(h.tentativas.filter((x) => x.tipo === 'exposicao')).toHaveLength(8);
    expect(h.tentativas.filter((x) => x.tipo === 'avaliada')).toHaveLength(2);
    expect(h.p).toBeCloseTo(recalcularP(h.tentativas), 10);
    expect(h.p).toBeLessThan(0.95);
    expect(h.aConfirmar).toBe(true);
    expect(dominadaDeVerdade(h)).toBe(false);
    expect(v2.fases['AL-A'].dominadaEm).toBeUndefined();
    // o painel da família deixa de dizer "já faz" para o que só foi exposição
    expect(resumoFamilia(crianca, v2, [], cfg, T0).jaSabe).toHaveLength(0);
  });

  it('é idempotente, não mexe em dado já migrado e aceita progresso sem campos novos', () => {
    const v2 = migrarProgresso(antigo(), cfg);
    expect(migrarProgresso(v2, cfg)).toBe(v2);
    const novo = progressoInicial('c1', T0);
    expect(migrarProgresso(novo, cfg)).toBe(novo);
    const cru = { ...progressoInicial('c1', T0), versao: 1 as const, habilidades: { rima: { tentativas: [{ em: T0, sessao: 's', habilidade: 'rima', acertou: true }], p: 0.4 } } };
    expect(migrarProgresso(cru, cfg).habilidades.rima.tentativas[0].tipo).toBe('avaliada');
  });

  it('domínio antigo que se sustenta com respostas conferidas (ou por chefe vencido) continua dominado de verdade', () => {
    const v1 = antigo();
    const boas = Array.from({ length: 10 }, (_, i) => ({ em: T0, sessao: i < 5 ? 's1' : 's2', habilidade: 'rima', acertou: true }));
    v1.habilidades.rima = { tentativas: boas, p: 0.99, dominadaEm: T0 };
    v1.habilidades.vogais = { tentativas: [], p: 0.97, dominadaEm: T0 };
    v1.fases['R1-F07'] = { estado: 'concluida', sessoes: 1, concluidaEm: T0, chefe: { leitura: 1, passou: true, em: T0 } };
    const v2 = migrarProgresso(v1, cfg);
    expect(dominadaDeVerdade(v2.habilidades.rima)).toBe(true);
    expect(dominadaDeVerdade(v2.habilidades.vogais)).toBe(true);
    expect(v2.habilidades.vogais.p).toBe(0.97);
    expect(v2.fases['R1-F07'].dominadaEm).toBeDefined();
  });

  it('a etiqueta "a confirmar" some sozinha quando o critério honesto é cumprido', () => {
    let p = migrarProgresso(antigo(), cfg);
    p = comTentativas(Array.from({ length: 10 }, (_, i) => t('letra-a', true, i < 5 ? 'n1' : 'n2')), p);
    const r = fecharSessao(p, { faseId: 'AL-B', sessao: 'n2', atividades: 0, tentativasDaSessao: [], expressa: false, demonstracoes: [] }, cfg, T0 + DIA_MS);
    expect(r.progresso.habilidades['letra-a'].aConfirmar).toBeUndefined();
    expect(r.progresso.habilidades['letra-a'].dominadaEm).toBe(T0); // a data original fica
    expect(r.relatorio.dominadasAgora).not.toContain('letra-a'); // sem moedinha em dobro
    expect(r.progresso.fases['AL-A'].dominadaEm).toBe(T0 + DIA_MS);
  });
});

describe('matriz de confusão', () => {
  const ts = [
    troca('letra-p', 'P', 'B', 's1'), troca('letra-p', 'P', 'B', 's2'), troca('letra-b', 'B', 'P', 's2'),
    troca('letra-m', 'M', 'N', 's1'), certo('letra-p', 'P', 's2'), certo('letra-m', 'M', 's1'),
    t('letra-p', false, 's3', { mecanica: 'falar', alvo: 'P', escolhido: 'Q' }), // autorrelato não entra
    t('letra-z', true, 's3') // sem alvo (dado antigo) não entra
  ];

  it('conta "escolheu B quando o alvo era P", por sentido', () => {
    const m = matrizDeConfusao(ts);
    expect(m[0]).toMatchObject({ alvo: 'P', escolhido: 'B', vezes: 2, sessoes: 2, conhecido: 'som' });
    expect(m.find((c) => c.alvo === 'B' && c.escolhido === 'P')?.vezes).toBe(1);
    expect(m.find((c) => c.escolhido === 'Q')).toBeUndefined();
    expect(m).toHaveLength(3);
  });

  it('tocar duas vezes na mesma opção errada no mesmo item conta uma troca', () => {
    const m = matrizDeConfusao([t('letra-p', true, 's1', { comAjuda: true, alvo: 'P', respostas: ['B', 'B', 'D', 'P'] })]);
    expect(m.map((c) => [c.escolhido, c.vezes])).toEqual(expect.arrayContaining([['B', 1], ['D', 1]]));
  });

  it('pares confundidos somam os dois sentidos e respeitam o mínimo', () => {
    const pares = paresConfundidos(ts, 2);
    expect(pares).toHaveLength(1);
    expect(pares[0]).toMatchObject({ par: ['B', 'P'], vezes: 3, alvo: 'P', escolhido: 'B', conhecido: 'som' });
    expect(paresConfundidos(ts, 1).map((x) => x.par.join(''))).toEqual(['BP', 'MN']);
  });

  it('usa PARES_CONFUSOS para reconhecer pares conhecidos (letra ou chave de som) e letras espelhadas', () => {
    for (const [a, b] of PARES_CONFUSOS) expect(parConhecido(a, b, 'fonema'), `${a}/${b}`).toBe('som');
    expect(parConhecido('P', 'B')).toBe('som');
    expect(parConhecido('C', 'G')).toBe('som'); // C → /k/
    expect(parConhecido('f', 'v')).toBe('som');
    expect(parConhecido('b', 'd')).toBe('desenho');
    expect(parConhecido('P', 'Q')).toBe('desenho');
    expect(parConhecido('A', 'M')).toBeUndefined();
    expect(parConhecido('MALA', 'LUA')).toBeUndefined();
    expect(chaveDoSom('C')).toBe('k');
    expect(chaveDoSom('rr')).toBe('rr');
    expect(parceiroProvavel('P')).toBe('B');
    expect(parceiroProvavel('f')).toBe('v');
    expect(parceiroProvavel('A')).toBeUndefined();
    expect([tipoDeErro('P', 'B'), tipoDeErro('C', 'G'), tipoDeErro('M', 'N'), tipoDeErro('b', 'd'), tipoDeErro('A', 'M')]).toEqual(['E-VOZ', 'E-VOZ', 'E-NAS', 'E-VIS', undefined]);
  });

  it('sons e letras mais errados × palavras difíceis (palavras de verdade)', () => {
    const tudo = [
      ...ts,
      t('leitura-cvcv', false, 's1', { alvo: 'MALA', escolhido: 'LUA', mecanica: 'escolher' }),
      t('escrita-cvcv', true, 's1', { alvo: 'MALA', comAjuda: true, mecanica: 'ditado' }),
      certo('leitura-cvcv', 'LUA', 's1'),
      t('leitura-cvcv', false, 's2', { alvo: 'FOLU', pseudo: true })
    ];
    const sons = fonemasEGrafemasMaisErrados(tudo);
    expect(sons[0]).toMatchObject({ alvo: 'P', erros: 2, vezes: 3, categoria: 'grafema' });
    expect(sons.map((x) => x.alvo)).not.toContain('MALA');
    const palavras = palavrasDificeis(tudo);
    expect(palavras.map((x) => x.alvo)).toEqual(['MALA', 'FOLU']);
    expect(palavras[0]).toMatchObject({ erros: 2, vezes: 2, taxaErro: 1, habilidades: ['leitura-cvcv', 'escrita-cvcv'] });
    expect(palavras[1]).toMatchObject({ pseudo: true, categoria: 'pseudopalavra' });
    expect(categoriaDoAlvo({ alvo: 'p' })).toBe('fonema');
    expect(categoriaDoAlvo({ alvo: 'MA' })).toBe('silaba');
    expect(categoriaDoAlvo({ alvo: 'MA', categoria: 'palavra' })).toBe('palavra');
  });

  it('tempo médio por habilidade: só conferidas, com tempo válido', () => {
    const tempos = tempoMedioPorHabilidade([
      certo('letra-p', 'P', 's1', { tempoMs: 2000 }), troca('letra-p', 'P', 'B', 's1'), { ...troca('letra-p', 'P', 'B', 's1'), tempoMs: 6000 },
      certo('letra-p', 'P', 's1', { tempoMs: 4000 }), certo('letra-p', 'P', 's1', { tempoMs: 999_999 }),
      t('letra-p', true, 's1', { mecanica: 'tracar', tempoMs: 50_000 }), certo('letra-m', 'M', 's1')
    ]);
    expect(tempos).toEqual([{ habilidade: 'letra-p', itens: 3, mediaMs: 4000, medianaMs: 4000, mediaAcertoMs: 3000 }]);
  });
});

describe('reforço dirigido e pré-requisito', () => {
  it('par confundido vira prática com os dois lado a lado', () => {
    const duas = comTentativas([troca('letra-b', 'B', 'D', 's1'), troca('letra-b', 'B', 'D', 's2'), certo('letra-b', 'B', 's2')]);
    expect(proximaPratica(duas, cfg, T0)).toBeNull(); // 2 trocas ainda não são padrão (docs/pedagogia/06 §5: 3)
    const p = comTentativas([troca('letra-b', 'B', 'D', 's2')], duas);
    const pratica = proximaPratica(p, cfg, T0)!;
    expect(pratica.motivo).toBe('par-confundido');
    expect(pratica.foco).toMatchObject({ alvo: 'B', confundidoCom: 'D', vezes: 3, conhecido: 'desenho' });
    expect(pratica.habilidade).toBe('letra-b');
    expect(pratica.faseId).toBe('AL-B');
    expect(pratica.paraAdulto).toMatch(/Troca B por D/);
    expect(pratica.itens.length).toBeLessThanOrEqual(cfg.reforco.maxItens);
    const itens = itensDoPar('B', 'D', 6);
    for (const i of itens) expect(i.opcoes.some((o) => o.id === i.correta && /^[bd]$/i.test(o.letra ?? o.id))).toBe(true);
  });

  it('som muito errado sem troca repetida: supõe o parceiro de PARES_CONFUSOS', () => {
    const p = comTentativas([t('letra-f', false, 's1', { alvo: 'F', escolhido: 'M' }), t('letra-f', false, 's1', { alvo: 'F', escolhido: 'L' }), t('letra-f', false, 's1', { alvo: 'F', escolhido: 'A' })]);
    const pratica = praticasRecomendadas(p, cfg, T0).find((x) => x.foco?.suposto);
    expect(pratica?.foco).toMatchObject({ alvo: 'F', confundidoCom: 'V', suposto: true });
  });

  it('errou 2 sessões seguidas → volta ao pré-requisito (e a prioridade é dele)', () => {
    const ruim = (s: string) => [t('leitura-cvcv', false, s), t('leitura-cvcv', false, s), t('leitura-cvcv', true, s)];
    const uma = comTentativas(ruim('s1'));
    expect(sessoesSeguidasComErro(uma.habilidades['leitura-cvcv'], 0.5)).toBe(1);
    expect(praticasRecomendadas(uma, cfg, T0).some((x) => x.motivo === 'pre-requisito')).toBe(false);
    const duas = comTentativas([...ruim('s1'), ...ruim('s2')]);
    expect(sessoesSeguidasComErro(duas.habilidades['leitura-cvcv'], 0.5)).toBe(2);
    const pratica = proximaPratica(duas, cfg, T0)!;
    expect(pratica).toMatchObject({ motivo: 'pre-requisito', habilidade: 'silaba-cv', origem: 'leitura-cvcv' });
    expect(pratica.faseId).toBe(faseQueEnsina('silaba-cv'));
    expect(pratica.paraAdulto).toMatch(/voltar um passo/);
    // uma sessão boa no meio zera a sequência
    const melhorou = comTentativas([...ruim('s1'), ...ruim('s2'), t('leitura-cvcv', true, 's3'), t('leitura-cvcv', true, 's3')]);
    expect(sessoesSeguidasComErro(melhorou.habilidades['leitura-cvcv'], 0.5)).toBe(0);
  });

  it('pré-requisito: o primeiro ainda não dominado; habilidade sem pré-requisito volta à própria apresentação', () => {
    const p = progressoInicial('c1', T0);
    expect(preRequisitoDe('escrita-cvcv', p)).toBe('leitura-cvcv');
    expect(preRequisitoDe('vogal-o', p)).toBe('letra-o');
    expect(preRequisitoDe('letra-a', p)).toBeUndefined();
    const comM = { ...p, habilidades: { 'gpc-m': { tentativas: [], p: 0.99, dominadaEm: T0 } } };
    expect(preRequisitoDe('silaba-cv', comM)).toBe('gpc-l');
    const ruim = comTentativas(['s1', 's2'].flatMap((s) => [t('letra-a', false, s), t('letra-a', false, s)]));
    expect(proximaPratica(ruim, cfg, T0)).toMatchObject({ motivo: 'pre-requisito', habilidade: 'letra-a', faseId: 'AL-A' });
    for (const [h, pres] of Object.entries({ 'leitura-cvcv': ['silaba-cv'] })) for (const x of [h, ...pres]) expect(HABILIDADE_POR_ID[x]).toBeDefined();
  });

  it('fase concluída e não dominada entra como reforço; revisão vencida entra por último; sem histórico, nada', () => {
    expect(proximaPratica(progressoInicial('c1', T0), cfg, T0)).toBeNull();
    let p = concluirFase(progressoInicial('c1', T0), 'AL-A', T0);
    p = { ...p, habilidades: { rima: agendarRevisao({ tentativas: [], p: 0.99, dominadaEm: T0 }, T0, cfg.revisao.intervalosDias) } };
    const ps = praticasRecomendadas(p, cfg, T0 + 3 * DIA_MS);
    expect(ps.map((x) => [x.motivo, x.habilidade])).toEqual([['reforco', 'letra-a'], ['revisao', 'rima']]);
    expect(ps[0].itens.length).toBeGreaterThan(0);
  });
});

describe('alerta para o adulto', () => {
  it('sem sinais: nenhum; explica o critério', () => {
    const a = alertaDeRisco(progressoInicial('c1', T0), cfg, T0);
    expect(a.nivel).toBe('nenhum');
    expect(a.criterio).toMatch(/não é diagnóstico/);
  });

  it('1 sinal = atenção; 2 sinais de aprendizagem = precisa de apoio', () => {
    const ruim = (h: string) => ['s1', 's2'].flatMap((s) => [t(h, false, s), t(h, false, s)]);
    const um = alertaDeRisco(comTentativas(ruim('letra-a')), cfg, T0);
    expect(um.nivel).toBe('atencao');
    expect(um.sinais[0]).toMatchObject({ tipo: 'erro-seguido', habilidade: 'letra-a' });
    const dois = alertaDeRisco(comTentativas([...ruim('letra-a'), ...ruim('letra-b')]), cfg, T0);
    expect(dois.nivel).toBe('risco');
  });

  it('muitas sessões sem firmar, troca repetida e dias sem jogar', () => {
    const longas = ['s1', 's2', 's3', 's4'].flatMap((s) => [t('vogal-e', false, s), t('vogal-e', true, s), t('vogal-e', false, s)]);
    expect(alertaDeRisco(comTentativas(longas), cfg, T0).sinais[0].tipo).toBe('sem-dominio');
    const trocas = ['s1', 's1', 's2', 's2'].map((s) => troca('letra-p', 'P', 'B', s));
    expect(alertaDeRisco(comTentativas([...trocas, ...Array.from({ length: 8 }, () => certo('letra-p', 'P', 's2'))]), cfg, T0).sinais.map((s) => s.tipo)).toContain('troca-repetida');
    const parado = { ...progressoInicial('c1', T0), sessoesFeitas: 3, ultimaSessao: T0 };
    const a = alertaDeRisco(parado, cfg, T0 + 20 * DIA_MS);
    expect(a).toMatchObject({ nivel: 'atencao' });
    expect(a.sinais[0].tipo).toBe('sem-jogar');
    expect(alertaDeRisco(parado, cfg, T0 + 5 * DIA_MS).nivel).toBe('nenhum');
  });

  it('habilidade dominada de verdade não gera alerta', () => {
    const p = comTentativas(['s1', 's2'].flatMap((s) => [t('rima', false, s), t('rima', false, s)]));
    p.habilidades.rima = { ...p.habilidades.rima, dominadaEm: T0 };
    expect(alertaDeRisco(p, cfg, T0).nivel).toBe('nenhum');
  });
});

describe('sondagem periódica', () => {
  const jogou = (p: Progresso): Progresso => ({ ...p, sessoesFeitas: 1 });

  it('a primeira fica devida depois da 1ª sessão (regra antiga), respeitando a idade mínima', () => {
    const p = progressoInicial('c1', T0);
    expect(situacaoSondagem(p, cfg, T0).devida).toBe(false);
    expect(situacaoSondagem(jogou(p), cfg, T0)).toMatchObject({ devida: true, motivo: 'inicial' });
    expect(situacaoSondagem(jogou(p), cfg, T0, 5).devida).toBe(false);
    expect(situacaoSondagem(jogou(p), cfg, T0, 6).devida).toBe(true);
  });

  it('a primeira alimenta a Trilha Expressa; as seguintes só registram', () => {
    const areas = resultadoPorArea([
      { area: 'segmentacao', alvo: 'pato', escolhido: 'pato', acertou: true }, { area: 'segmentacao', alvo: '3', escolhido: '2', acertou: false },
      { area: 'sons-letras', alvo: 'A', escolhido: 'A', acertou: true, tempoMs: 1500 }
    ]);
    expect(areas.segmentacao).toMatchObject({ acertos: 1, total: 2 });
    expect(areas.ditado).toBeUndefined(); // área não medida fica ausente (não é zero)
    let p = registrarSondagem(jogou(progressoInicial('c1', T0)), { id: 'sd1', areas, degrau: 3 }, T0);
    expect(p.expressa).toMatchObject({ regioes: ['R0', 'R1'], ativa: true, sondagemEm: T0, degrau: 3 });
    expect(p.sondagens).toHaveLength(1);
    expect(p.sondagens![0]).toMatchObject({ motivo: 'inicial', faseAtual: 'AL-A', fasesConcluidas: 0 });
    p = registrarSondagem(p, { id: 'sd2', areas, degrau: 1, motivo: 'dias' }, T0 + 40 * DIA_MS);
    expect(p.expressa).toMatchObject({ regioes: ['R0', 'R1'], degrau: 3, sondagemEm: T0 });
    expect(p.sondagens).toHaveLength(2);
  });

  it('volta a ficar devida a cada N fases ou M dias (configurável; 0 desliga)', () => {
    let p = registrarSondagem(jogou(progressoInicial('c1', T0)), { id: 'sd1', areas: {} }, T0);
    expect(situacaoSondagem(p, cfg, T0 + DIA_MS).devida).toBe(false);
    expect(situacaoSondagem(p, cfg, T0 + cfg.sondagem.aCadaDias * DIA_MS)).toMatchObject({ devida: true, motivo: 'dias' });
    for (const f of FASES.slice(0, cfg.sondagem.aCadaFases - 1)) p = concluirFase(p, f.id, T0);
    expect(situacaoSondagem(p, cfg, T0 + DIA_MS).devida).toBe(false);
    p = concluirFase(p, FASES[cfg.sondagem.aCadaFases - 1].id, T0);
    expect(situacaoSondagem(p, cfg, T0 + DIA_MS)).toMatchObject({ devida: true, motivo: 'fases', fasesDesde: cfg.sondagem.aCadaFases });
    const desligada = mesclarConfig(cfg, { sondagem: { aCadaFases: 0, aCadaDias: 0, idadeMinima: 6 } });
    expect(situacaoSondagem(p, desligada, T0 + 400 * DIA_MS).devida).toBe(false);
    const curta = mesclarConfig(cfg, { sondagem: { aCadaFases: 2, aCadaDias: 0, idadeMinima: 6 } });
    expect(situacaoSondagem(p, curta, T0 + DIA_MS).motivo).toBe('fases');
    // feita a sondagem, zera a contagem
    p = registrarSondagem(p, { id: 'sd2', areas: {} }, T0 + 2 * DIA_MS);
    expect(situacaoSondagem(p, cfg, T0 + 3 * DIA_MS)).toMatchObject({ devida: false, fasesDesde: 0 });
  });

  it('dado antigo: a Missão das Placas já feita vale como a sondagem inicial', () => {
    const p = { ...jogou(progressoInicial('c1', T0)), sondagens: undefined, expressa: { regioes: [], ativa: false, sondagemEm: T0, degrau: 1 } };
    expect(situacaoSondagem(p, cfg, T0 + DIA_MS).devida).toBe(false);
    expect(situacaoSondagem(p, cfg, T0 + 31 * DIA_MS)).toMatchObject({ devida: true, motivo: 'dias' });
  });

  it('evolução por área entre sondagens', () => {
    let p = registrarSondagem(jogou(progressoInicial('c1', T0)), { id: 'a', areas: { 'sons-letras': { acertos: 1, total: 4 } } }, T0);
    p = registrarSondagem(p, { id: 'b', areas: { 'sons-letras': { acertos: 3, total: 4 }, 'leitura-palavras': { acertos: 1, total: 2 } } }, T0 + 30 * DIA_MS);
    const ev = evolucaoSondagens(p);
    expect(ev).toHaveLength(5);
    expect(ev.find((e) => e.area === 'sons-letras')).toMatchObject({ variacao: 0.5 });
    expect(ev.find((e) => e.area === 'leitura-palavras')?.variacao).toBeUndefined();
    expect(ev.find((e) => e.area === 'ditado')?.medidas).toEqual([]);
  });
});

describe('revisão espaçada além do Escolher', () => {
  it('habilidade só com Ditado ganha revisão na própria mecânica', () => {
    expect(itensDeRevisao('escrita-cvcv', 4, 0)).toEqual([]);
    const a = atividadeDeRevisao('escrita-cvcv', 2);
    expect(a?.tipo).toBe('ditado');
    let p = progressoInicial('c1', T0);
    p = { ...p, habilidades: { 'escrita-cvcv': agendarRevisao({ tentativas: [], p: 0.99, dominadaEm: T0 }, T0, cfg.revisao.intervalosDias) } };
    const s = montarSessao(p, crianca, 'AL-A', cfg, T0 + 2 * DIA_MS);
    const c1 = s.etapas.filter((e) => e.cena?.tipo === 'C1');
    expect(c1).toHaveLength(1);
    expect(c1[0].cena).toMatchObject({ id: 'AL-A-C1-revisao-2', titulo: 'Jardim da Revisão' });
    expect(c1[0].cena!.atividade!.tipo).toBe('ditado');
    // o acerto conferido sobe o degrau da revisão
    const q = aplicarAtividade(p, { sessao: s.id, cena: c1[0].cena!, tentativas: [{ em: T0, sessao: s.id, habilidade: 'escrita-cvcv', acertou: true }], tentouDeNovo: 0 }, cfg, T0 + 2 * DIA_MS);
    expect(q.habilidades['escrita-cvcv'].revisao!.indice).toBe(1);
  });

  it('revisão com exposição não sobe degrau; itens em que a criança errou vêm primeiro', () => {
    let p = progressoInicial('c1', T0);
    p = { ...p, habilidades: { 'letra-a': agendarRevisao({ tentativas: [], p: 0.99, dominadaEm: T0 }, T0, cfg.revisao.intervalosDias) } };
    const cena: Cena = { id: 'AL-B-C1-revisao', tipo: 'C1', titulo: 'x', cenario: 'quintal', atividade: cenaDe('AL-A', 'tracar').atividade };
    const q = aplicarAtividade(p, { sessao: 's', cena, tentativas: [{ em: T0, sessao: 's', habilidade: 'letra-a', acertou: true }], tentouDeNovo: 0 }, cfg, T0 + DIA_MS);
    expect(q.habilidades['letra-a'].revisao!.indice).toBe(0);
    const todos = itensDeRevisao('letra-a', 50, 0);
    expect(todos.length).toBeGreaterThan(1);
    const alvo = todos[todos.length - 1].correta;
    expect(itensDeRevisao('letra-a', 2, 0, [alvo])[0].correta).toBe(alvo);
    expect(new Set(itensDeRevisao('letra-a', 3, 1)).size).toBe(Math.min(3, todos.length));
  });
});

describe("mecânica nova 'ligar' (Liga o som)", () => {
  it('é avaliada, entra no registro e no domínio, e a revisão que a traz monta sessão', () => {
    const fase = FASES.find((f) => f.cenas.some((c) => c.atividade?.tipo === 'ligar'));
    expect(fase, 'nenhuma fase com Liga o som').toBeDefined();
    const cena = fase!.cenas.find((c) => c.atividade?.tipo === 'ligar')!;
    expect(mecanicaDaCena(cena.id)).toBe('ligar');
    expect(tipoDaTentativa({ cena: cena.id })).toBe('avaliada');
    const a = cena.atividade!;
    const hab = a.tipo === 'ligar' ? a.pares[0].habilidade ?? a.habilidade : a.habilidade;
    let p = progressoInicial('c1', T0);
    p = aplicarAtividade(p, { sessao: 's1', cena, tentativas: [{ em: T0, sessao: 's1', habilidade: hab, acertou: true, alvo: 'Z', escolhido: 'S', respostas: ['S', 'Z'], comAjuda: true }], tentouDeNovo: 1 }, cfg, T0);
    expect(p.habilidades[hab].tentativas[0]).toMatchObject({ mecanica: 'ligar', tipo: 'avaliada', tentativaNumero: 2 });
    expect(p.habilidades[hab].p).not.toBe(novaHabilidade().p);
    expect(matrizDeConfusao(p.habilidades[hab].tentativas)[0]).toMatchObject({ alvo: 'Z', escolhido: 'S', conhecido: 'som' });
    const focoCurto = { ...crianca, apoios: { ...crianca.apoios, focoCurto: true } };
    let q = progressoInicial('c1', T0);
    for (const f of FASES) { if (f.id === fase!.id) break; q = concluirFase(q, f.id, T0); }
    const s = montarSessao(q, focoCurto, fase!.id, cfg, T0);
    const ligar = s.etapas.find((e) => e.cena?.atividade?.tipo === 'ligar')?.cena?.atividade;
    expect(ligar?.tipo === 'ligar' && ligar.pares.length).toBeGreaterThanOrEqual(Math.min(3, a.tipo === 'ligar' ? a.pares.length : 3));
  });
});

describe('painel do adulto: resumo de aprendizagem', () => {
  it('junta pares, palavras, tempo, concluído × dominado, alerta, prática, sondagem e o teto do termômetro', () => {
    let p = concluirFase(progressoInicial('c1', T0), 'AL-A', T0);
    p = comTentativas([
      troca('letra-b', 'B', 'D', 's1'), troca('letra-b', 'B', 'D', 's1'), { ...troca('letra-b', 'B', 'D', 's2'), tempoMs: 5000 }, certo('letra-b', 'B', 's2', { tempoMs: 3000 }),
      t('leitura-cvcv', false, 's2', { alvo: 'MALA', escolhido: 'LUA' }), t('letra-a', true, 's1', { mecanica: 'tracar' }), t('leitura-cvcv', true, 's2', { mecanica: 'falar' })
    ], p);
    const r = resumoAprendizagem(crianca, { ...p, sessoesFeitas: 2, ultimaSessao: T0 }, cfg, T0);
    expect(r.fases).toMatchObject({ concluidas: 1, dominadas: 0, total: FASES.length });
    expect(r.fases.aReforcar[0].id).toBe('AL-A');
    expect(r.tentativas).toMatchObject({ avaliadas: 5, exposicao: 1, autorrelato: 1, comDetalhe: 5, comTempo: 2 });
    expect(r.pares[0].erro).toBe('E-VIS');
    expect(r.pares[0].par).toEqual(['B', 'D']);
    expect(r.palavras.map((x) => x.alvo)).toEqual(['MALA']);
    expect(r.sonsELetras[0].alvo).toBe('B');
    expect(r.tempos[0]).toMatchObject({ habilidade: 'letra-b', mediaMs: 4000 });
    expect(r.tempoMedioMs).toBe(4000);
    expect(r.praticas[0].motivo).toBe('par-confundido');
    expect(r.sondagem.devida).toBe(true);
    expect(r.termometro.maximoDoConteudo).toBe(2);
    expect(r.termometro.explicacao).toMatch(/até 10/);
  });

  it('o teto do termômetro vem do conteúdo publicado (hoje 2 de 10)', () => {
    expect(termometroMaximoDoConteudo(FASES)).toBe(2);
    expect(FASES.filter((f) => f.termometro).map((f) => f.termometro).sort()).toEqual([1, 1, 2]);
  });

  it('turma: palavras difíceis de verdade, sem dizer quem errou', () => {
    const a = comTentativas([t('leitura-cvcv', false, 's1', { alvo: 'MALA', escolhido: 'LUA' }), troca('letra-p', 'P', 'B', 's1'), troca('letra-p', 'P', 'B', 's1')]);
    const b = comTentativas([t('leitura-cvcv', false, 's1', { alvo: 'MALA', escolhido: 'FALA' }), t('leitura-cvcv', false, 's1', { alvo: 'LUA', escolhido: 'MALA' })]);
    const d = dificuldadesDaTurma([{ progresso: a }, { progresso: b }]);
    expect(d.palavras[0]).toMatchObject({ alvo: 'MALA', criancas: 2, erros: 2 });
    expect(d.palavras[1]).toMatchObject({ alvo: 'LUA', criancas: 1 });
    expect(d.sonsELetras[0]).toMatchObject({ alvo: 'P', criancas: 1 });
    expect(d.pares[0]).toMatchObject({ par: ['B', 'P'], criancas: 1 });
    expect(d.semDetalhe).toBe(false);
    expect(dificuldadesDaTurma([{ progresso: comTentativas([t('rima', false, 's')]) }]).semDetalhe).toBe(true);
  });
});
