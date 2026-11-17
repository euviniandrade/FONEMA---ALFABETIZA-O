import { describe, expect, it } from 'vitest';
import { contarDesde, minutosDeUso, paraCsv } from './resumo-admin.ts';

const min = 60_000;
describe('visão geral do administrador', () => {
  it('tempo de uso: soma intervalos curtos, pausa longa abre outro bloco', () => {
    expect(minutosDeUso([])).toBe(0);
    expect(minutosDeUso([0])).toBe(1);
    expect(minutosDeUso([0, 3 * min, 6 * min])).toBe(7);
    expect(minutosDeUso([0, 5 * min, 120 * min, 122 * min])).toBe(9);
  });
  it('conta registros desde uma data', () => {
    expect(contarDesde([1, 5, 10], 5)).toBe(2);
  });
  it('CSV: separador ponto e vírgula, aspas e proteção contra fórmula', () => {
    const csv = paraCsv([['Nome', 'Turma'], ['Ana; Maria', '=1+1'], ['Lia "Li"', null]]);
    expect(csv.startsWith('﻿')).toBe(true);
    expect(csv).toContain('"Ana; Maria";\'=1+1');
    expect(csv).toContain('"Lia ""Li""";');
  });
});
