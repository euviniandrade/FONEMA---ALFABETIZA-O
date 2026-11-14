import { describe, expect, it } from 'vitest';
import { ALFABETO, CONFIG_PADRAO, FASES, FASE_POR_ID, faseDaLetra, habilidadeLetra, seloDaLetra } from '@fonema/conteudo';
import { aplicarAtividade, calcularNivel, concluirFase, descreverTermometro, fasesConcluidas, fecharSessao, missaoInicialFeita, montarSessao, podeEntrar, progressoInicial } from '../src/index.ts';
import type { Crianca, Progresso, Tentativa } from '../src/index.ts';

const T0 = new Date('2026-11-14T15:00:00').getTime();
const cfg = CONFIG_PADRAO;
const crianca: Crianca = {
  id: 'c1', nome: 'Mariana', genero: 'f', anoNascimento: 2021,
  pronuncia: { grafia: 'Ma-ri-A-na', fala: 'Mariana', rate: 1, pitchExtra: 0, voz: 'sofia' },
  avatar: { base: 'crianca-01', cantinho: 'mata' },
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

  it('missão da letra A: curta (sem pausa automática), fecha com o selo da letra, nível 1 e a letra B liberada', () => {
    const r = jogar(progressoInicial('c1', T0), 'AL-A');
    const tipos = r.sessao.etapas.map((e) => e.cena?.atividade?.tipo ?? e.tipo);
    expect(tipos).toEqual(['acolhida', 'letra', 'espelho', 'escolher', 'escolher', 'tracar', 'ritual']);
    expect(r.relatorio.faseConcluida).toBe(true);
    expect(r.relatorio.conquistasNovas.map((c) => c.id)).toContain(seloDaLetra('A'));
    expect(r.relatorio.nivelDepois).toBe(1);
    expect(missaoInicialFeita(r.progresso)).toBe(true);
    expect(r.progresso.faseAtual).toBe('AL-B');
    expect(podeEntrar(r.progresso, 'AL-B')).toBe(true);
    expect(podeEntrar(r.progresso, 'AL-C')).toBe(false);
    expect(r.progresso.contadores.tracados).toBe(2); // maiúscula e minúscula
  });

  it('a ordem é A–Z sem pular: depois de E vem a revisão, e F só abre depois dela', () => {
    let p = progressoInicial('c1', T0);
    expect(() => concluirFase(p, 'AL-B', T0)).toThrow();
    for (const l of 'ABCDE') { expect(p.faseAtual).toBe(faseDaLetra(l)); p = concluirFase(p, faseDaLetra(l), T0); }
    expect(p.faseAtual).toBe('AL-R1');
    expect(podeEntrar(p, 'AL-F')).toBe(false);
    const r = jogar(p, 'AL-R1');
    expect(r.relatorio.faseConcluida).toBe(true);
    expect(r.progresso.faseAtual).toBe('AL-F');
    // a revisão trabalha as 5 letras do grupo (uma tentativa por habilidade no mínimo, no jogo real)
    const habs = new Set(r.sessao.etapas.flatMap((e) => (e.cena?.atividade?.tipo === 'escolher' ? e.cena.atividade.itens.map((i) => i.habilidade) : [])));
    for (const l of 'ABCDE') expect(habs.has(habilidadeLetra(l))).toBe(true);
  });

  it('volta completa: 26 selos, Festa do Alfabeto → troféu, termômetro 1, título novo e a passagem para as sílabas', () => {
    let p = progressoInicial('c1', T0);
    const al = FASES.filter((f) => f.regiao === 'AL');
    for (const f of al.slice(0, -1)) p = concluirFase(p, f.id, T0);
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
    // depois do alfabeto: sílabas (vogais abertas e fechadas → M, L, F), palavras e só então o nome
    expect(r.progresso.faseAtual).toBe('R1-F02');
    const depois = FASES.slice(al.length).map((f) => f.id);
    expect(depois.indexOf('R2a-F01')).toBeLessThan(depois.indexOf('R2a-F04'));
    expect(depois.at(-1)).toBe('R0-F01');
    expect(FASE_POR_ID['R2a-F01'].habilidades).toContain('silaba-cv');
    expect(calcularNivel(200, true, fasesConcluidas(r.progresso)).nivel).toBeGreaterThanOrEqual(7);
  });
});
