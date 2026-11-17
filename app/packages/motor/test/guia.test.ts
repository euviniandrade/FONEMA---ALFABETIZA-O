/**
 * D032: tutorial "A grande aventura" (visto, pulado, retomar) e painel guia (etapa do caminho, missão de hoje, estrelinhas).
 */
import { describe, expect, it } from 'vitest';
import { CONFIG_PADRAO, ETAPAS_DO_CAMINHO, FASES } from '@fonema/conteudo';
import {
  PASSOS_TUTORIAL, estadoDoCaminho, estrelasDaMissao, etapaDaFase, fecharSessao, marcarTutorial, migrarProgresso, missaoDeHoje,
  passoParaRetomar, progressoInicial, tutorialNovo, tutorialPendente
} from '../src/index.ts';
import type { Progresso, Tentativa } from '../src/index.ts';

const T0 = new Date('2026-11-17T15:00:00').getTime();

const tent = (acertou: boolean, extra: Partial<Tentativa> = {}): Tentativa => ({ em: T0, sessao: 's1', habilidade: 'som-a', acertou, tipo: 'avaliada', mecanica: 'escolher', ...extra });

describe('tutorial: abre sozinho uma vez, pode pular e retomar', () => {
  it('criança nova (nenhuma missão): abre sozinho', () => {
    const p = progressoInicial('c1', T0);
    expect(tutorialPendente(p)).toBe(true);
    expect(tutorialNovo(p)).toBe(true);
    expect(passoParaRetomar(p)).toBe(0);
  });

  it('retoma no passo em que parou', () => {
    let p = progressoInicial('c1', T0);
    p = marcarTutorial(p, { passo: 3 }, T0);
    expect(tutorialPendente(p)).toBe(true);
    expect(passoParaRetomar(p)).toBe(3);
    // passo fora da faixa não quebra
    expect(passoParaRetomar(marcarTutorial(p, { passo: 99 }, T0))).toBe(PASSOS_TUTORIAL - 1);
  });

  it('depois de visto não abre mais sozinho; reaberto pelo botão começa do início', () => {
    let p = marcarTutorial(progressoInicial('c1', T0), { passo: 4 }, T0);
    p = marcarTutorial(p, { fim: 'visto' }, T0 + 1);
    expect(p.tutorial?.vistoEm).toBe(T0 + 1);
    expect(tutorialPendente(p)).toBe(false);
    expect(tutorialNovo(p)).toBe(false);
    expect(passoParaRetomar(p)).toBe(0);
    // ver de novo pelo "Como jogar?" não apaga a data da primeira vez nem volta a "pendente"
    const p2 = marcarTutorial(marcarTutorial(p, { passo: 2 }, T0 + 5), { fim: 'visto' }, T0 + 6);
    expect(p2.tutorial?.vistoEm).toBe(T0 + 1);
    expect(p2.tutorial?.vezes).toBe(2);
    expect(tutorialPendente(p2)).toBe(false);
  });

  it('pulado pelo adulto: não abre mais sozinho', () => {
    const p = marcarTutorial(progressoInicial('c1', T0), { fim: 'pulado' }, T0);
    expect(p.tutorial?.puladoEm).toBe(T0);
    expect(tutorialPendente(p)).toBe(false);
  });

  it('quem já jogava antes (progresso salvo sem o campo) não é interrompido, mas o botão fica marcado como novo', () => {
    const antigo = { ...progressoInicial('c1', T0), sessoesFeitas: 4 } as Progresso;
    delete (antigo as { tutorial?: unknown }).tutorial;
    const migrado = migrarProgresso(antigo, CONFIG_PADRAO);
    expect(tutorialPendente(migrado)).toBe(false);
    expect(tutorialNovo(migrado)).toBe(true);
  });

  it('marcar o tutorial não mexe em mais nada do progresso (não é avaliação)', () => {
    const p = progressoInicial('c1', T0);
    const q = marcarTutorial(marcarTutorial(p, { passo: 2 }, T0), { fim: 'visto' }, T0);
    const { tutorial: _t, ...resto } = q;
    void _t;
    expect(resto).toEqual(p);
  });
});

describe('caminho: em que etapa a criança está', () => {
  it('as etapas cobrem a jornada inteira, em ordem, e as futuras ficam trancadas', () => {
    const comFase = ETAPAS_DO_CAMINHO.filter((e) => !e.futura);
    const idx = comFase.map((e) => FASES.findIndex((f) => f.id === e.ate));
    expect(idx.every((i) => i >= 0)).toBe(true);
    expect([...idx].sort((a, b) => a - b)).toEqual(idx);
    expect(idx[idx.length - 1]).toBe(FASES.length - 1);
    expect(ETAPAS_DO_CAMINHO.slice(comFase.length).every((e) => e.futura)).toBe(true);
  });

  it('começa em "Letras e sons"; TF-06 (primeira leitura) já é "Ler palavras"; TF-10 (primeira frase) é "Frases"', () => {
    expect(ETAPAS_DO_CAMINHO[etapaDaFase('AL-A')].id).toBe('letras');
    expect(ETAPAS_DO_CAMINHO[etapaDaFase('TF-05')].id).toBe('letras');
    expect(ETAPAS_DO_CAMINHO[etapaDaFase('TF-06')].id).toBe('palavras');
    expect(ETAPAS_DO_CAMINHO[etapaDaFase('TF-10')].id).toBe('frases');
    expect(ETAPAS_DO_CAMINHO[etapaDaFase('TF-R2')].id).toBe('historias');
    expect(ETAPAS_DO_CAMINHO[etapaDaFase('R1-F02')].id).toBe('vogais');
  });

  it('estado de cada etapa', () => {
    const p = { ...progressoInicial('c1', T0), faseAtual: 'TF-07' };
    const e = estadoDoCaminho(p).map((x) => x.estado);
    expect(e.slice(0, 3)).toEqual(['feita', 'agora', 'depois']);
    expect(e.filter((x) => x === 'agora')).toHaveLength(1);
    expect(e.slice(-4)).toEqual(['trancada', 'trancada', 'trancada', 'trancada']);
  });
});

describe('missão de hoje e estrelinhas', () => {
  it('barrinha: passos da fase atual; "feita hoje" só no mesmo dia', () => {
    const p = progressoInicial('c1', T0);
    const m = missaoDeHoje(p, T0);
    expect(m.faseId).toBe(p.faseAtual);
    expect(m.passos).toBeGreaterThan(0);
    expect(m.feitaHoje).toBe(false);
    expect(missaoDeHoje({ ...p, ultimaSessao: T0 }, T0 + 1000).feitaHoje).toBe(true);
    expect(missaoDeHoje({ ...p, ultimaSessao: T0 }, T0 + 2 * 86400000).feitaHoje).toBe(false);
  });

  it('estrelinhas pelas respostas conferidas: só apresentação = 1; ajuda e segunda tentativa não contam como de primeira', () => {
    expect(estrelasDaMissao([])).toBe(1);
    expect(estrelasDaMissao([tent(true, { tipo: 'exposicao', mecanica: 'letra' })])).toBe(1);
    expect(estrelasDaMissao([tent(true), tent(true), tent(true), tent(true), tent(false)])).toBe(3);
    expect(estrelasDaMissao([tent(true), tent(true), tent(true, { comAjuda: true }), tent(false)])).toBe(2);
    expect(estrelasDaMissao([tent(true, { tentativaNumero: 2 }), tent(false), tent(true)])).toBe(1);
  });

  it('fechar a sessão guarda o resumo da última missão', () => {
    const p = progressoInicial('c1', T0);
    const r = fecharSessao(p, { faseId: p.faseAtual, sessao: 's1', atividades: 3, tentativasDaSessao: [tent(true), tent(true)], expressa: false, demonstracoes: [] }, CONFIG_PADRAO, T0);
    expect(r.progresso.ultimaMissao).toMatchObject({ faseId: p.faseAtual, em: T0, desafios: 3, estrelas: 3 });
    expect(r.progresso.ultimaMissao?.selos).toEqual(r.relatorio.conquistasNovas.map((g) => g.id));
  });
});
