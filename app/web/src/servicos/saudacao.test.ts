import { describe, expect, it } from 'vitest';
import { deveSaudar, diaDe } from './saudacao.ts';

describe('saudação só na 1ª entrada do dia (fila nº 27)', () => {
  const dia1 = new Date(2026, 10, 18, 9, 0).getTime();
  const tarde = new Date(2026, 10, 18, 17, 30).getTime();
  const dia2 = new Date(2026, 10, 19, 8, 0).getTime();
  it('cumprimenta quem ainda não foi cumprimentado hoje', () => {
    expect(deveSaudar({}, 'c1', dia1)).toBe(true);
  });
  it('voltar à vila no mesmo dia não cumprimenta de novo', () => {
    expect(deveSaudar({ c1: diaDe(dia1) }, 'c1', tarde)).toBe(false);
  });
  it('no dia seguinte cumprimenta de novo; cada criança tem o seu registro', () => {
    expect(deveSaudar({ c1: diaDe(dia1) }, 'c1', dia2)).toBe(true);
    expect(deveSaudar({ c1: diaDe(dia1) }, 'c2', tarde)).toBe(true);
  });
});
