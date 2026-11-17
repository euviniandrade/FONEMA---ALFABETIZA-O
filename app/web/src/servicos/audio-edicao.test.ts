import { describe, expect, it } from 'vitest';
import { ALVO_RMS_DB, igualarVolume, prepararSinal, trechoComSom } from './audio-edicao.ts';

const SR = 16000;
function tom(seg: number, amp: number, silAntes = 0.5, silDepois = 0.5) {
  const n = Math.round(SR * (silAntes + seg + silDepois));
  const x = new Float32Array(n);
  const a = Math.round(SR * silAntes), b = a + Math.round(SR * seg);
  for (let i = a; i < b; i++) x[i] = amp * Math.sin((2 * Math.PI * 220 * i) / SR);
  for (let i = 0; i < n; i++) x[i] += (Math.random() - 0.5) * 0.0004; // chiado de fundo bem baixo
  return x;
}
const rmsDb = (x: Float32Array) => 20 * Math.log10(Math.sqrt(x.reduce((s, v) => s + v * v, 0) / x.length));

describe('preparo do áudio novo no navegador (aparar e igualar volume)', () => {
  it('apara o silêncio das pontas mantendo um respiro', () => {
    const x = tom(0.6, 0.3);
    const t = trechoComSom(x, SR)!;
    expect(t.inicio / SR).toBeGreaterThan(0.4);
    expect(t.inicio / SR).toBeLessThan(0.5);
    expect(t.fim / SR).toBeGreaterThan(1.1);
    expect(t.fim / SR).toBeLessThan(1.25);
  });
  it('áudio mudo: nada para guardar', () => {
    expect(trechoComSom(new Float32Array(SR), SR)).toBeNull();
    expect(prepararSinal(new Float32Array(SR), SR, { aparar: true, igualar: true })).toBeNull();
  });
  it('voz baixa sobe para o volume das falas, sem passar do teto', () => {
    const y = igualarVolume(tom(1, 0.02, 0, 0), SR);
    expect(Math.abs(rmsDb(y) - ALVO_RMS_DB)).toBeLessThan(1.5);
    expect(Math.max(...y.map(Math.abs))).toBeLessThanOrEqual(10 ** (-1.5 / 20) + 1e-6);
    const alto = igualarVolume(tom(1, 0.99, 0, 0), SR);
    expect(Math.max(...alto.map(Math.abs))).toBeLessThanOrEqual(10 ** (-1.5 / 20) + 1e-6);
  });
  it('sem opções, o sinal fica igual; com aparar, começa e termina em silêncio (fade)', () => {
    const x = tom(0.4, 0.3);
    expect(prepararSinal(x, SR, { aparar: false, igualar: false })).toBe(x);
    const y = prepararSinal(x, SR, { aparar: true, igualar: false })!;
    expect(y.length).toBeLessThan(x.length);
    expect(Math.abs(y[0])).toBeLessThan(1e-3);
    expect(Math.abs(y[y.length - 1])).toBeLessThan(1e-3);
  });
});
