/**
 * Memória dos Sons (fila do dono nº 17): filtro "já ensinado", nada de letras do mesmo som juntas, sem sons parecidos no
 * começo, posições sorteadas, desafio no fim da fase da Trilha A–Z e o registro (par com decisão = avaliada; palpite = exposição).
 */
import { describe, expect, it } from 'vitest';
import { CENAS_DO_SOM, CONFIG_PADRAO, FASE_POR_ID } from '@fonema/conteudo';
import {
  desafioMemoria, ehAvaliada, ehParecido, letrasComSomVisto, mesmoSom, montarMemoria, niveisDaMemoria, progressoInicial, registrarLivre,
  sonsDaMemoria, tentativasDaMemoria, type JogadaMemoria, type Progresso
} from '../src/index.ts';

const T0 = new Date('2026-11-17T15:00:00').getTime();
function concluidas(ids: string[], base: Progresso = progressoInicial('c1', T0)): Progresso {
  const fases = { ...base.fases };
  for (const id of ids) fases[id] = { estado: 'concluida', sessoes: 1, concluidaEm: T0 };
  return { ...base, fases, sessoesFeitas: 3 };
}
const ALFA = (ls: string) => [...ls].map((l) => `AL-${l}`).filter((id) => FASE_POR_ID[id]);

describe('Memória dos Sons: o que entra', () => {
  it('sem fase concluída nada abre; D034: o nível 1 (só olhar) abre com 2 sons; o 2 só com 3 sons não parecidos (E e I fazem o mesmo som no fim)', () => {
    const zero = progressoInicial('c1', T0);
    expect(niveisDaMemoria(zero).every((n) => !n.liberado)).toBe(true);
    expect(montarMemoria(zero, { nivel: 2, semente: 3 })).toBeNull();
    expect(niveisDaMemoria(concluidas(ALFA('A')))[0].liberado).toBe(false);
    expect(niveisDaMemoria(concluidas(ALFA('AE')))[0].liberado).toBe(true);
    expect(montarMemoria(concluidas(ALFA('AE')), { nivel: 1, semente: 3 })!.pares).toHaveLength(2);
    expect(niveisDaMemoria(concluidas(ALFA('AEI')))[1].liberado).toBe(false);
    expect(niveisDaMemoria(concluidas(ALFA('AEIOU')))[1].liberado).toBe(true);
  });

  it('só letras já vistas, com som real; D034: os duvidosos só no jogo livre (no desafio da fase, não); cada carta de cena é a cena do som da letra', () => {
    const p = concluidas(ALFA('ABCDEFGHIJKLMNOPQRSTUVWXYZ'));
    const vistas = letrasComSomVisto(p);
    const sons = sonsDaMemoria(p);
    expect(sons.every((s) => vistas.includes(s.letra))).toBe(true);
    for (const x of ['H', 'K', 'W', 'Y']) expect(sons.map((s) => s.letra)).not.toContain(x);
    expect(sons.map((s) => s.letra)).toContain('L');
    const doDesafio = sonsDaMemoria(p, undefined, { duvidosos: false }).map((s) => s.letra);
    for (const x of ['H', 'K', 'W', 'Y', 'L', 'V', 'P', 'T', 'B', 'C', 'D', 'G', 'J', 'R']) expect(doDesafio).not.toContain(x);
    const r = montarMemoria(p, { nivel: 3, semente: 5 })!;
    for (const c of r.cenas) expect(c.cena).toBe(CENAS_DO_SOM[c.letra]);
  });

  it('nunca duas letras do mesmo som na rodada; sem sons parecidos nos níveis 1, 2 e 4; pares no tamanho do nível', () => {
    const grupos = ['AEIOU', 'AEIOUMF', 'AEIOUMNFSZX', 'ABCDEFGIJLMNOPSTUVZ', 'AMSOFUNIEZX'];
    for (const g of grupos) {
      const p = concluidas(ALFA(g));
      for (const nivel of [1, 2, 3, 4] as const) {
        for (let s = 1; s < 30; s++) {
          const r = montarMemoria(p, { nivel, semente: s });
          if (!niveisDaMemoria(p).find((n) => n.nivel === nivel)!.liberado) { expect(r).toBeNull(); continue; }
          expect(r).not.toBeNull();
          const ls = r!.pares.map((x) => x.letra);
          const lim = { 1: [3, 3], 2: [3, 4], 3: [5, 6], 4: [3, 4] }[nivel];
          expect(ls.length).toBeGreaterThanOrEqual(lim[0]);
          expect(ls.length).toBeLessThanOrEqual(lim[1]);
          expect(new Set(r!.pares.map((x) => x.som)).size).toBe(ls.length);
          expect(new Set(r!.pares.map((x) => x.cena)).size).toBe(ls.length);
          for (const a of ls) for (const b of ls) if (a !== b) expect(mesmoSom(a, b)).toBe(false);
          if (nivel !== 3) for (const a of r!.pares) for (const b of r!.pares) if (a !== b) expect(ehParecido(a, b)).toBe(false);
          expect(r!.cenas.map((c) => c.letra).sort()).toEqual([...ls].sort());
          expect(r!.letras.map((c) => c.letra).sort()).toEqual([...ls].sort());
          if (nivel === 4) expect(r!.cenas.every((c) => !c.cena)).toBe(true);
        }
      }
    }
    expect(mesmoSom('S', 'Z')).toBe(true);
    expect(mesmoSom('C', 'Q')).toBe(true);
  });

  it('posições sorteadas: varia com a semente e as letras nunca ficam todas embaixo das suas cenas', () => {
    const p = concluidas(ALFA('AEIOUMNFSZX'));
    const ordens = new Set<string>();
    for (let s = 1; s < 40; s++) {
      const r = montarMemoria(p, { nivel: 3, semente: s })!;
      ordens.add(r.letras.map((c) => c.letra).join(''));
      expect(r.letras.every((l, k) => r.cenas[k].letra === l.letra)).toBe(false);
      expect(montarMemoria(p, { nivel: 3, semente: s })).toEqual(r);
    }
    expect(ordens.size).toBeGreaterThan(10);
  });

  it('sem clipe do som, a letra não entra (regra 1)', () => {
    const p = concluidas(ALFA('AEIOUMF'));
    expect(sonsDaMemoria(p, (f) => f !== 'm').map((s) => s.letra)).not.toContain('M');
  });

  it('desafio no fim da fase AL-X: só com a fase concluída, o som da letra no jogo e o nível 2 aberto; a letra entra na rodada', () => {
    const p = concluidas(ALFA('AEIOUMF'));
    expect(desafioMemoria(p, 'AL-M')).toEqual({ letra: 'M', nivel: 2 });
    expect(desafioMemoria(p, 'AL-B')).toBeNull();
    expect(desafioMemoria(p, 'TF-07')).toBeNull();
    expect(desafioMemoria(concluidas(ALFA('M')), 'AL-M')).toBeNull();
    for (let s = 1; s < 20; s++) expect(montarMemoria(p, { nivel: 2, semente: s, incluir: 'F' })!.pares.map((x) => x.letra)).toContain('F');
  });
});

describe('Memória dos Sons: registro', () => {
  const p = concluidas(ALFA('AEIOUMF'));
  const rodada = montarMemoria(p, { nivel: 2, semente: 7 })!;
  const [a, b, c] = rodada.pares.map((x) => x.letra);
  const j = (alvo: string, escolhida: string, decisao: boolean, em: number, extra: Partial<JogadaMemoria> = {}): JogadaMemoria => ({
    alvo, escolhida, decisao, em, posEscolhida: rodada.letras.findIndex((x) => x.letra === escolhida), posCerta: rodada.letras.findIndex((x) => x.letra === alvo), naMesa: 3, ...extra
  });

  it('par com decisão = avaliada; palpite sem erro = exposição; erro com decisão vira confusão letra × som', () => {
    const jogadas = [
      j(a, b, false, T0 + 1000), // palpite: não conta
      j(a, a, false, T0 + 2000), // achou por palpite: exposição
      j(b, c, true, T0 + 3000), // erro com decisão
      j(b, b, true, T0 + 4000),
      j(c, c, true, T0 + 5000)
    ];
    const r = tentativasDaMemoria({ rodada, jogadas, sessao: 's1', cena: 'livre-memoria-sons', contexto: 'livre', inicio: T0 });
    expect(r.tentativas).toHaveLength(3);
    const [ta, tb, tc] = r.tentativas;
    expect(ta).toMatchObject({ alvo: a, tipo: 'exposicao', mecanica: 'memoria-sons', contexto: 'livre', respostas: [a] });
    expect(ehAvaliada(ta)).toBe(false);
    expect(tb).toMatchObject({ alvo: b, escolhido: c, respostas: [c, b], acertou: false, comAjuda: true, nivelAjuda: 'contraste', tipo: 'avaliada', categoria: 'grafema' });
    expect(tc).toMatchObject({ alvo: c, escolhido: c, acertou: true, tipo: 'avaliada', nOpcoes: 3, tempoMs: 1000 });
    expect(tc.distratores?.sort()).toEqual(rodada.pares.map((x) => x.letra).filter((x) => x !== c).sort());
    expect(r.confusoes).toEqual([{ alvo: b, escolhida: c }]);
  });

  it('carta que brilhou = com ajuda; nível 1 é sempre exposição; desafio fica marcado como desafio', () => {
    const r = tentativasDaMemoria({ rodada, jogadas: [j(a, a, true, T0 + 900, { brilhou: true })], sessao: 's', cena: 'x', contexto: 'desafio', inicio: T0 });
    expect(r.tentativas[0]).toMatchObject({ comAjuda: true, acertou: false, nivelAjuda: 'resposta-mostrada', contexto: 'desafio' });
    const n1 = tentativasDaMemoria({ rodada: { ...rodada, nivel: 1 }, jogadas: [j(a, a, true, T0 + 900)], sessao: 's', cena: 'x', contexto: 'livre', inicio: T0 });
    expect(n1.tentativas[0].tipo).toBe('exposicao');
  });

  it('registrarLivre aceita as tentativas: só as avaliadas entram no domínio', () => {
    const r = tentativasDaMemoria({ rodada, jogadas: [j(a, a, false, T0 + 1000), j(b, b, true, T0 + 2000)], sessao: 's1', cena: 'livre-memoria-sons', contexto: 'livre', inicio: T0 });
    const out = registrarLivre(p, { sessao: 's1', cena: { id: 'livre-memoria-sons', titulo: 'Memória dos Sons' }, tentativas: r.tentativas, cfg: CONFIG_PADRAO, agora: T0 + 3000 });
    const hb = out.progresso.habilidades[rodada.pares[1].habilidade];
    expect(hb.tentativas.some((t) => t.mecanica === 'memoria-sons' && t.tipo === 'avaliada' && t.contexto === 'livre')).toBe(true);
  });
});
