import { describe, expect, it } from 'vitest';
import { ALFABETO, CONFIG_PADRAO, FASES, FASE_POR_ID, faseDaLetra, habilidadeLetra, seloDaLetra } from '@fonema/conteudo';
import { aplicarAtividade, calcularNivel, concluirFase, descreverTermometro, fasesConcluidas, fecharSessao, missaoInicialFeita, montarSessao, podeEntrar, progressoInicial } from '../src/index.ts';
import { AVATAR_PADRAO } from '../src/index.ts';
import type { Crianca, Progresso, Tentativa } from '../src/index.ts';

const T0 = new Date('2026-11-14T15:00:00').getTime();
const cfg = CONFIG_PADRAO;
const crianca: Crianca = {
  id: 'c1', nome: 'Mariana', genero: 'f', anoNascimento: 2021,
  pronuncia: { grafia: 'Ma-ri-A-na', fala: 'Mariana', rate: 1, pitchExtra: 0, voz: 'sofia' },
  avatar: { ...AVATAR_PADRAO, cantinho: 'mata' },
  apoios: { previsivel: false, focoCurto: false, leituraReforco: false, calmo: false },
  jaSabe: { letrasDoNome: 'nao-sei', lePalavras: 'nao-sei', leFrases: 'nao-sei' },
  consentimentos: { responsavel: true, vozPrimeiroNome: true, gravarVozAdulto: false, em: T0 },
  rotina: { minutosDia: 15, horaDormir: '20:00' },
  criadoEm: T0
};

/** Joga uma missão inteira acertando tudo e fecha a sessão. */
function jogar(p: Progresso, faseId: string, agora = T0) {
  const s = montarSessao(p, crianca, faseId, cfg, agora);
  const todas: Tentativa[] = [];
  let atividades = 0;
  for (const e of s.etapas) {
    const a = e.cena?.atividade;
    if (!a) continue;
    const ts: Tentativa[] = [{ em: agora, sessao: s.id, habilidade: a.habilidade, acertou: true }];
    p = aplicarAtividade(p, { sessao: s.id, cena: e.cena!, tentativas: ts, tentouDeNovo: 0 }, cfg, agora);
    if (e.cena!.contaDominio) { atividades++; todas.push(...ts); }
  }
  return { sessao: s, ...fecharSessao(p, { faseId, sessao: s.id, atividades, tentativasDaSessao: todas, expressa: false, demonstracoes: [] }, cfg, agora) };
}

describe('Trilha do Alfabeto no motor (D027)', () => {
  it('do zero: a jornada começa na letra A, e só ela está aberta', () => {
    const p = progressoInicial('c1', T0);
    expect(p.faseAtual).toBe('AL-A');
    expect(podeEntrar(p, 'AL-A')).toBe(true);
    expect(podeEntrar(p, 'AL-B')).toBe(false);
    expect(podeEntrar(p, 'R0-F01')).toBe(false);
    expect(missaoInicialFeita(p)).toBe(false);
  });

  it('missão da letra A: curta (sem pausa automática), fecha com o selo da letra, nível 1 e a lição do som /a/ liberada (D031)', () => {
    const r = jogar(progressoInicial('c1', T0), 'AL-A');
    const tipos = r.sessao.etapas.map((e) => e.cena?.atividade?.tipo ?? e.tipo);
    // D030: a missão ganhou a cena letra → som (AL-A-C3b)
    expect(tipos).toEqual(['acolhida', 'letra', 'espelho', 'escolher', 'escolher', 'escolher', 'tracar', 'ritual']);
    expect(r.relatorio.faseConcluida).toBe(true);
    expect(r.relatorio.conquistasNovas.map((c) => c.id)).toContain(seloDaLetra('A'));
    expect(r.relatorio.nivelDepois).toBe(1);
    expect(missaoInicialFeita(r.progresso)).toBe(true);
    expect(r.progresso.faseAtual).toBe('TF-01');
    expect(podeEntrar(r.progresso, 'TF-01')).toBe(true);
    expect(podeEntrar(r.progresso, 'AL-E')).toBe(false);
    expect(podeEntrar(r.progresso, 'AL-B')).toBe(false);
    expect(r.progresso.contadores.tracados).toBe(2); // maiúscula e minúscula
  });

  it('primeiras palavrinhas: entram quando as letras permitem e saem com a chave de config desligada', () => {
    let p = progressoInicial('c1', T0);
    for (const f of FASES) { if (f.id === 'AL-B') break; p = concluirFase(p, f.id, T0); }
    const comB = montarSessao(p, crianca, 'AL-B', cfg, T0);
    const montar = comB.etapas.map((e) => e.cena?.atividade).find((a) => a?.tipo === 'montar');
    expect(montar?.tipo === 'montar' && montar.palavras).toEqual(['BABÁ']);
    const semB = montarSessao(p, crianca, 'AL-B', { ...cfg, alfabeto: { primeirasPalavrinhas: false } }, T0);
    expect(semB.etapas.some((e) => e.cena?.atividade?.tipo === 'montar')).toBe(false);
    // ligada ou desligada, a missão conclui do mesmo jeito (as palavrinhas não contam para o critério)
    expect(jogar(p, 'AL-B').relatorio.faseConcluida).toBe(true);
    expect(cfg.alfabeto.primeirasPalavrinhas).toBe(true);
  });

  it('D031: sem pular, letra e lição se alternam (A → som /a/ → E → som /ê/…); depois de TF-06 vem a revisão das vogais, e M só abre depois dela', () => {
    let p = progressoInicial('c1', T0);
    expect(() => concluirFase(p, 'AL-B', T0)).toThrow();
    expect(() => concluirFase(p, 'TF-01', T0)).toThrow();
    for (const [l, tf] of [['A', 'TF-01'], ['E', 'TF-02'], ['I', 'TF-03'], ['O', 'TF-04'], ['U', 'TF-05']]) {
      expect(p.faseAtual).toBe(faseDaLetra(l)); p = concluirFase(p, faseDaLetra(l), T0);
      expect(p.faseAtual).toBe(tf); expect(podeEntrar(p, tf)).toBe(true); p = concluirFase(p, tf, T0);
    }
    p = concluirFase(p, 'TF-06', T0);
    expect(p.faseAtual).toBe('AL-RV1');
    expect(podeEntrar(p, 'AL-M')).toBe(false);
    const r = jogar(p, 'AL-RV1');
    expect(r.relatorio.faseConcluida).toBe(true);
    expect(r.progresso.faseAtual).toBe('AL-M');
    // a revisão trabalha as 5 vogais (uma tentativa por habilidade no mínimo, no jogo real)
    const habs = new Set(r.sessao.etapas.flatMap((e) => (e.cena?.atividade?.tipo === 'escolher' ? e.cena.atividade.itens.map((i) => i.habilidade) : [])));
    for (const l of 'AEIOU') expect(habs.has(habilidadeLetra(l))).toBe(true);
  });

  it('volta completa: 26 selos, Festa do Alfabeto → troféu, termômetro 1, título novo e a passagem para as sílabas', () => {
    let p = progressoInicial('c1', T0);
    const ate = FASES.findIndex((f) => f.id === 'AL-FESTA');
    for (const f of FASES.slice(0, ate)) p = concluirFase(p, f.id, T0);
    expect(p.faseAtual).toBe('AL-FESTA');
    expect(calcularNivel(200, true, fasesConcluidas(p)).portao?.nome).toBe('Festa do Alfabeto');
    const r = jogar(p, 'AL-FESTA');
    expect(r.relatorio.faseConcluida).toBe(true);
    expect(r.relatorio.regiaoConcluida).toBe('Trilha do Alfabeto');
    const ganhas = Object.keys(r.progresso.conquistas);
    for (const l of ALFABETO) expect(ganhas).toContain(seloDaLetra(l.letra));
    expect(ganhas).toContain('T-ALFABETO');
    expect(r.relatorio.termometroDepois).toBe(1);
    expect(descreverTermometro(1)).toMatch(/alfabeto/i);
    // D031: a Festa fecha letras e sons alternados; depois vêm os outros sons das vogais, palavras e só então o nome
    expect(r.progresso.faseAtual).toBe('R1-F02');
    const depois = FASES.slice(ate + 1).map((f) => f.id);
    expect(depois.indexOf('R2a-F01')).toBeLessThan(depois.indexOf('R2a-F04'));
    expect(depois.at(-1)).toBe('R0-F01');
    expect(FASE_POR_ID['R2a-F01'].habilidades).toContain('silaba-cv');
    expect(calcularNivel(200, true, fasesConcluidas(r.progresso)).nivel).toBeGreaterThanOrEqual(7);
  });
});
