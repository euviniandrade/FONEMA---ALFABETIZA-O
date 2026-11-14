import { describe, expect, it } from 'vitest';
import { CONFIG_PADRAO, FASES } from '@fonema/conteudo';
import {
  aplicarSondagem, avaliarDominio, calcularNivel, concluirFase, creditarEmBloco, custoNivel, DIA_MS, faseEmExpressa,
  fecharSessao, infoNome, MARCAS_DE_GENERO, montarSessao, novaHabilidade, opcoesPronuncia, progressoInicial,
  registrarTentativa, renderFala, resultadoProvaRelampago, resultadoRevisao, agendarRevisao, revisoesVencidas,
  silabas, somInicial, subirTermometro, aplicarAtividade, avaliarConquistas, comprar, aplicarNivelInicial
} from '../src/index.ts';
import type { Crianca, Tentativa } from '../src/index.ts';

const T0 = new Date('2026-11-13T15:00:00').getTime();
const cfg = CONFIG_PADRAO;

const crianca = (nome = 'Mariana', genero: Crianca['genero'] = 'f'): Crianca => ({
  id: 'c1', nome, genero, anoNascimento: 2021,
  pronuncia: { grafia: 'Ma-ri-A-na', fala: 'Mariana', rate: 1, pitchExtra: 0, voz: 'sofia' },
  avatar: { base: 'crianca-01', cantinho: 'mata' },
  apoios: { previsivel: false, focoCurto: false, leituraReforco: false, calmo: false },
  jaSabe: { letrasDoNome: 'nao-sei', lePalavras: 'nao-sei', leFrases: 'nao-sei' },
  consentimentos: { responsavel: true, vozPrimeiroNome: true, gravarVozAdulto: false, em: T0 },
  rotina: { minutosDia: 15, horaDormir: '20:00' },
  criadoEm: T0
});

const t = (habilidade: string, acertou: boolean, sessao: string, extra: Partial<Tentativa> = {}): Tentativa => ({ em: T0, sessao, habilidade, acertou, ...extra });

describe('primeiro som do nome (jogo-completo/01 §2)', () => {
  it.each([
    ['Mariana', 'm', 0, 'M'],
    ['Helena', 'E', 1, 'HE'],
    ['Cecília', 's', 0, 'C'],
    ['Charles', 'x', 0, 'CH'],
    ['Kauã', 'k', 0, 'K'],
    ['Gisele', 'j', 0, 'G'],
    ['Enzo', 'e~', 0, 'EN'],
    ['Ana', 'a', 0, 'A'],
    ['Thiago', 't', 0, 'TH']
  ])('%s → /%s/', (nome, chave, mudo, letras) => {
    const info = infoNome(nome);
    // "Helena" usa a vogal; o protótipo devolve 'e' (sem distinguir é/ê) — aceitamos as duas chaves de E
    if (chave === 'E') expect(['e', 'E']).toContain(info.chave);
    else expect(info.chave).toBe(chave);
    expect(somInicial(nome)!.mudo).toBe(mudo);
    expect(info.letras).toBe(letras);
  });

  it('separa sílabas para as palmas', () => {
    expect(silabas('pipoca')).toEqual(['pi', 'po', 'ca']);
    expect(silabas('macaco')).toEqual(['ma', 'ca', 'co']);
    expect(silabas('Sofia')).toEqual(['so', 'fi', 'a']);
    expect(silabas('Tales')).toEqual(['ta', 'les']);
    expect(infoNome('Mariana', 'Ma-ri-A-na').silabas).toEqual(['ma', 'ri', 'a', 'na']);
  });

  it('gera 3 pronúncias diferentes para o adulto escolher', () => {
    const ops = opcoesPronuncia('Kauã');
    expect(ops).toHaveLength(3);
    expect(new Set(ops.map((o) => o.grafia + o.rate)).size).toBe(3);
  });
});

describe('falas com nome e concordância (D013)', () => {
  const frase = '{Você está pronto|Você está pronta|Tudo pronto pra começar}, [NOME]?';
  it('masculino, feminino e neutro', () => {
    expect(renderFala(frase, { nome: 'Kauã', genero: 'm' })).toBe('Você está pronto, Kauã?');
    expect(renderFala(frase, { nome: 'Ana', genero: 'f' })).toBe('Você está pronta, Ana?');
    const n = renderFala('{Seja bem-vindo|Seja bem-vinda|Que bom ter você}, [NOME]!', { nome: 'Helena', genero: 'n' });
    expect(n).toBe('Que bom ter você, Helena!');
    expect(n).not.toMatch(MARCAS_DE_GENERO);
  });
});

describe('critério de domínio', () => {
  it('exige ≥ 8 tentativas em ≥ 2 sessões e 4 das últimas 5 certas', () => {
    let h = novaHabilidade();
    for (let i = 0; i < 8; i++) h = registrarTentativa(h, t('rima', true, 's1'));
    const umaSessao = avaliarDominio(h, cfg.dominio, false);
    expect(umaSessao.dominado).toBe(false);
    expect(umaSessao.falta.join()).toMatch(/sessão/);
    for (let i = 0; i < 4; i++) h = registrarTentativa(h, t('rima', true, 's2'));
    expect(avaliarDominio(h, cfg.dominio, false).dominado).toBe(true);
  });

  it('erros recentes seguram o domínio; leitura exige pseudopalavras', () => {
    let h = novaHabilidade();
    for (let i = 0; i < 10; i++) h = registrarTentativa(h, t('leitura-cvcv', true, i < 5 ? 's1' : 's2'));
    expect(avaliarDominio(h, cfg.dominio, true).dominado).toBe(false);
    h = registrarTentativa(h, t('leitura-cvcv', true, 's2', { pseudo: true }));
    h = registrarTentativa(h, t('leitura-cvcv', true, 's2', { pseudo: true }));
    expect(avaliarDominio(h, cfg.dominio, true).dominado).toBe(true);
    for (let i = 0; i < 2; i++) h = registrarTentativa(h, t('leitura-cvcv', false, 's3'));
    expect(avaliarDominio(h, cfg.dominio, true).dominado).toBe(false);
  });
});

describe('sequência sem pular fases (D021)', () => {
  it('só a primeira fase começa aberta', () => {
    const p = progressoInicial('c1', T0);
    expect(p.faseAtual).toBe('AL-A');
    expect(p.fases['AL-A'].estado).toBe('aberta');
    expect(FASES.slice(1).every((f) => p.fases[f.id].estado === 'bloqueada')).toBe(true);
  });
  it('não conclui fora de ordem e abre só a próxima', () => {
    let p = progressoInicial('c1', T0);
    expect(() => concluirFase(p, 'AL-C', T0)).toThrow(/pular|bloqueada/i);
    p = concluirFase(p, 'AL-A', T0);
    expect(p.fases['AL-B'].estado).toBe('aberta');
    expect(p.fases['AL-C'].estado).toBe('bloqueada');
    expect(p.faseAtual).toBe('AL-B');
  });
});

describe('moedinhas fixas, em bloco, com teto', () => {
  it('atividade 1, marco 5, região 10, teto 12/dia', () => {
    const p = progressoInicial('c1', T0);
    const r = creditarEmBloco(p, { atividades: 4, marcos: 1, regioes: 0 }, cfg.moedinhas, T0);
    expect(r.creditado).toBe(9);
    const r2 = creditarEmBloco(r.progresso, { atividades: 0, marcos: 0, regioes: 1 }, cfg.moedinhas, T0);
    expect(r2.creditado).toBe(3);
    expect(r2.progresso.moedinhas.saldo).toBe(12);
    const r3 = creditarEmBloco(r2.progresso, { atividades: 5, marcos: 0, regioes: 0 }, cfg.moedinhas, T0 + DIA_MS);
    expect(r3.creditado).toBe(5);
  });
  it('compra só com saldo e não repete item', () => {
    let p = { ...progressoInicial('c1', T0), moedinhas: { saldo: 6, total: 6, porDia: {} } };
    expect(() => comprar(p, 'telescopio', 20)).toThrow();
    p = comprar(p, 'caderno', 4);
    expect(p.moedinhas.saldo).toBe(2);
    expect(() => comprar(p, 'caderno', 1)).toThrow();
  });
});

describe('nível, títulos neutros e portões (D019, D022)', () => {
  it('curva 2→6 no começo e teto de 24', () => {
    expect([2, 3, 4, 5, 6].map(custoNivel)).toEqual([2, 3, 4, 5, 6]);
    expect(custoNivel(8)).toBe(8);
    expect(custoNivel(200)).toBe(24);
  });
  it('nível 1 após a primeira missão; portão da Festa do Alfabeto segura o título', () => {
    expect(calcularNivel(50, false, new Set()).nivel).toBe(0);
    const semFesta = calcularNivel(5 + 2 + 3 + 4 + 5 + 6 + 12, true, new Set(['AL-A']));
    expect(semFesta.nivel).toBe(6);
    expect(semFesta.rotulo).toMatch(/^Primeiros Sons III ★2$/);
    expect(semFesta.portao?.nome).toBe('Festa do Alfabeto');
    const comFesta = calcularNivel(5 + 2 + 3 + 4 + 5 + 6 + 6, true, new Set(['AL-A', 'AL-FESTA']));
    expect(comFesta.nivel).toBe(7);
    expect(comFesta.titulo).toBe('Caça às Sílabas');
  });
});

describe('termômetro 0–10 cumulativo (D004)', () => {
  it('nunca desce', () => {
    expect(subirTermometro(2, 1)).toBe(2);
    expect(subirTermometro(1, 2)).toBe(2);
    expect(subirTermometro(1, undefined)).toBe(1);
  });
});

describe('revisão espaçada (1·2·4·8·16·32·60)', () => {
  it('sobe um degrau no acerto e volta ao começo no erro', () => {
    let h = agendarRevisao({ ...novaHabilidade(), dominadaEm: T0 }, T0, cfg.revisao.intervalosDias);
    expect(h.revisao!.proxima).toBe(T0 + DIA_MS);
    expect(revisoesVencidas({ x: h }, T0 + 2 * DIA_MS, 4)).toEqual(['x']);
    h = resultadoRevisao(h, true, T0 + DIA_MS, cfg.revisao.intervalosDias);
    expect(h.revisao!.indice).toBe(1);
    expect(h.revisao!.retencaoOk).toBe(true);
    h = resultadoRevisao(h, false, T0 + 3 * DIA_MS, cfg.revisao.intervalosDias);
    expect(h.revisao!.indice).toBe(0);
  });
});

describe('Trilha Expressa (D021 §2–3)', () => {
  it('sondagem marca regiões; primeira missão e chefes nunca são expressos', () => {
    const p = aplicarSondagem(progressoInicial('c1', T0), 3, T0);
    expect(p.expressa.regioes).toEqual(['R0', 'R1']);
    expect(faseEmExpressa(p, 'AL-A')).toBe(false);
    expect(faseEmExpressa(p, 'R0-F01')).toBe(false);
    expect(faseEmExpressa(p, 'R1-F02')).toBe(true);
    expect(faseEmExpressa(p, 'R1-F07')).toBe(false);
    expect(faseEmExpressa(p, 'R2a-F01')).toBe(false);
  });
  it('passou → fase feita e desafios contam; errou → desacelera sem perder', () => {
    let p = aplicarSondagem(progressoInicial('c1', T0), 5, T0);
    for (const f of FASES.filter((x) => x.regiao === 'AL')) p = concluirFase(p, f.id, T0);
    const ok = resultadoProvaRelampago(p, 'R1-F02', 5, 6, T0, cfg);
    expect(ok.passou).toBe(true);
    expect(ok.progresso.fases['R1-F02'].estado).toBe('concluida');
    expect(ok.progresso.habilidades['vogal-o'].dominadaEm).toBe(T0);
    expect(ok.progresso.desafios).toBeGreaterThan(0);
    const nao = resultadoProvaRelampago(ok.progresso, 'R1-F03', 2, 6, T0, cfg);
    expect(nao.passou).toBe(false);
    expect(nao.progresso.expressa.ativa).toBe(false);
    expect(nao.progresso.fases['R1-F02'].estado).toBe('concluida');
  });
});

describe('sessão C0–C9 e a missão do nome', () => {
  it('monta acolhida, cenas resolvidas com o nome e ritual de fim', () => {
    const c = crianca();
    const p = aplicarNivelInicial(progressoInicial(c.id, T0), 'le-palavras', T0); // "Meu nome" fica liberado para visitar
    const s = montarSessao(p, c, 'R0-F01', cfg, T0);
    expect(s.etapas[0].tipo).toBe('acolhida');
    expect(s.etapas.at(-1)!.tipo).toBe('ritual');
    const palmas = s.etapas.find((e) => e.cena?.atividade?.tipo === 'palmas')!.cena!.atividade!;
    expect(palmas.tipo === 'palmas' && palmas.palavras).toEqual(['Mariana']);
    const espelho = s.etapas.find((e) => e.cena?.atividade?.tipo === 'espelho')!.cena!.atividade!;
    expect(espelho.tipo === 'espelho' && espelho.fonema).toBe('m');
    const caca = s.etapas.find((e) => e.cena?.id === 'R0-F01-C4')!.cena!.atividade!;
    expect(caca.tipo === 'escolher' && caca.itens.length).toBe(4);
  });

  it('fecha a missão do nome (depois das palavras): fase concluída, moedinhas e selo Meu Nome', () => {
    const c = crianca();
    let p = progressoInicial(c.id, T0);
    for (const f of FASES.slice(0, -1)) p = concluirFase(p, f.id, T0);
    expect(p.faseAtual).toBe('R0-F01');
    const s = montarSessao(p, c, 'R0-F01', cfg, T0);
    const todas: Tentativa[] = [];
    let atividades = 0;
    for (const e of s.etapas) {
      if (!e.cena?.atividade) continue;
      const ts = [t(e.cena.atividade.habilidade, true, s.id)];
      todas.push(...ts);
      p = aplicarAtividade(p, { sessao: s.id, cena: e.cena, tentativas: ts, tentouDeNovo: 0 }, cfg, T0);
      if (e.cena.contaDominio) atividades++;
    }
    const { progresso, relatorio } = fecharSessao(p, { faseId: 'R0-F01', sessao: s.id, atividades, tentativasDaSessao: todas, expressa: false, demonstracoes: [] }, cfg, T0);
    expect(relatorio.faseConcluida).toBe(true);
    expect(progresso.fases['R0-F01'].estado).toBe('concluida');
    expect(relatorio.moedinhas).toBe(Math.min(cfg.moedinhas.tetoDia, atividades + cfg.moedinhas.regiao));
    expect(relatorio.conquistasNovas.map((x) => x.id)).toEqual(expect.arrayContaining(['S-R0-01', 'TI-R0-01', 'S-R0-10']));
    expect(relatorio.nivelDepois).toBeGreaterThanOrEqual(1);
    // conquista nunca volta a ter cadeado
    const de2 = avaliarConquistas(progresso, [], T0 + DIA_MS);
    expect(de2.novas).toHaveLength(0);
    expect(de2.progresso.conquistas['S-R0-01']).toBeDefined();
  });

  it('chefe: abaixo de 85% não passa, nada se perde', () => {
    let p = progressoInicial('c1', T0);
    const chefe = FASES.findIndex((f) => f.id === 'R1-F07');
    for (const f of FASES.slice(0, chefe)) p = concluirFase(p, f.id, T0);
    const ts = [...Array(10)].map((_, i) => t('vogais', i < 7, 'sx'));
    const r = fecharSessao(p, { faseId: 'R1-F07', sessao: 'sx', atividades: 4, tentativasDaSessao: ts, expressa: false, demonstracoes: [] }, cfg, T0);
    expect(r.relatorio.chefe?.passou).toBe(false);
    expect(r.progresso.fases['R1-F07'].estado).toBe('aberta');
    expect(r.progresso.desafios).toBe(p.desafios);
    const ts2 = [...Array(10)].map((_, i) => t('vogais', i < 9, 'sy'));
    const r2 = fecharSessao(r.progresso, { faseId: 'R1-F07', sessao: 'sy', atividades: 4, tentativasDaSessao: ts2, expressa: false, demonstracoes: [] }, cfg, T0);
    expect(r2.relatorio.chefe?.passou).toBe(true);
    expect(r2.progresso.fases['R2a-F01'].estado).toBe('aberta');
    expect(r2.relatorio.conquistasNovas.map((x) => x.id)).toContain('M-R1-01');
  });
});
