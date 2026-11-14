import { describe, expect, it } from 'vitest';
import { ALFABETO, BRINCADEIRAS, TRACOS, pontosDoTraco, tracosDaLetra } from '../src/index.ts';

describe('traçado das letras (D029 §4)', () => {
  it('tem traços para as 26 maiúsculas e as 26 minúsculas', () => {
    for (const l of ALFABETO) {
      expect(tracosDaLetra(l.letra)?.length, l.letra).toBeGreaterThan(0);
      expect(tracosDaLetra(l.minuscula)?.length, l.minuscula).toBeGreaterThan(0);
    }
    expect(Object.keys(TRACOS)).toHaveLength(52);
  });
  it('cada traço cabe no quadro de 100 × 100 e usa só M, L e Q', () => {
    for (const [letra, ts] of Object.entries(TRACOS)) {
      expect(ts.length, letra).toBeLessThanOrEqual(4);
      for (const t of ts) {
        expect(t.d, letra).toMatch(/^M[\d.,\s-]+(?:[LQ][\d.,\s-]+)+$/);
        const pts = pontosDoTraco(t.d, 2);
        expect(pts.length, letra).toBeGreaterThanOrEqual(2);
        for (const p of pts) {
          expect(p.x, letra).toBeGreaterThanOrEqual(5); expect(p.x, letra).toBeLessThanOrEqual(95);
          expect(p.y, letra).toBeGreaterThanOrEqual(5); expect(p.y, letra).toBeLessThanOrEqual(99);
        }
      }
    }
  });
  it('maiúsculas ficam entre o topo (15) e a base (85); minúsculas não passam do topo das altas (12)', () => {
    for (const [letra, ts] of Object.entries(TRACOS)) {
      const ys = ts.flatMap((t) => pontosDoTraco(t.d, 1).map((p) => p.y));
      if (letra === letra.toUpperCase()) {
        expect(Math.min(...ys), letra).toBeGreaterThanOrEqual(14.9);
        expect(Math.max(...ys), letra).toBeLessThanOrEqual(letra === 'Q' ? 92.1 : 85.1);
      } else expect(Math.min(...ys), letra).toBeGreaterThanOrEqual(11.9);
    }
  });
  it('o primeiro traço começa em cima (de cima para baixo), salvo nas bolinhas e curvas', () => {
    for (const l of 'ABDEFHIJKLMNPRTUVWXYZ') {
      const p = pontosDoTraco(TRACOS[l][0].d, 2);
      expect(p[0].y, l).toBeLessThanOrEqual(15.1);
    }
  });
  it('a amostragem anda no sentido do caminho, com passo regular', () => {
    const p = pontosDoTraco('M10,10 L10,50 L50,50', 2);
    expect(p[0]).toMatchObject({ x: 10, y: 10, s: 0 });
    expect(p[p.length - 1].s).toBeCloseTo(80, 0);
    expect(p[p.length - 1].x).toBeCloseTo(50, 0);
    for (let i = 1; i < p.length; i++) expect(p[i].s).toBeGreaterThan(p[i - 1].s);
  });
});

describe('som real das letras no conteúdo (D029 §2)', () => {
  it('toda letra tem brincadeira de faz de conta e três palavras (a primeira é a palavra-chave)', () => {
    for (const l of ALFABETO) {
      expect(l.brincadeira, l.letra).toMatch(/^Faz de conta que /);
      expect(l.palavras, l.letra).toHaveLength(3);
      expect(l.palavras[0], l.letra).toBe(l.palavra);
      for (const w of l.palavras) expect(w[0].toUpperCase(), `${l.letra}: ${w}`).toBe(l.letra);
    }
  });
  it('letras de mesmo som dividem a brincadeira (C = K = Q; I = Y; U = W)', () => {
    expect(BRINCADEIRAS.C).toBe(BRINCADEIRAS.K); expect(BRINCADEIRAS.C).toBe(BRINCADEIRAS.Q);
    expect(BRINCADEIRAS.I).toBe(BRINCADEIRAS.Y); expect(BRINCADEIRAS.U).toBe(BRINCADEIRAS.W);
  });
});
