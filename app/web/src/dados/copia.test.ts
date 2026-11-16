import { describe, expect, it } from 'vitest';
import { validarCopia } from './copia.ts';

const boa = {
  exportadoEm: '2026-11-10T12:00:00.000Z',
  criancas: [{ id: 'cr-1', nome: 'Lia' }],
  progressos: [{ criancaId: 'cr-1' }],
  eventos: [{ id: 'ev-1', criancaId: 'cr-1' }],
  demonstracoes: [{ id: 'dm-1', criancaId: 'cr-1', audioId: '(áudio fica só no aparelho)' }],
  config: { lojinha: { naVila: true } }
};

describe('cópia dos dados: validar antes de restaurar', () => {
  it('aceita a cópia que o próprio app baixa (texto ou objeto) e resume quem está nela', () => {
    for (const r of [validarCopia(JSON.stringify(boa)), validarCopia(boa)]) {
      expect(r.ok).toBe(true);
      if (!r.ok) continue;
      expect(r.resumo.criancas).toEqual(['Lia']);
      expect(r.resumo.exportadoEm?.getUTCFullYear()).toBe(2026);
      expect(r.dados.demonstracoes[0].audioId).toBeUndefined(); // o áudio não vem na cópia
    }
  });
  it('recusa arquivo que não é cópia, sem crianças ou com progresso de outra criança', () => {
    expect(validarCopia('isto não é json').ok).toBe(false);
    expect(validarCopia('[1,2]').ok).toBe(false);
    expect(validarCopia({ ...boa, eventos: undefined }).ok).toBe(false);
    expect(validarCopia({ ...boa, criancas: [] }).ok).toBe(false);
    expect(validarCopia({ ...boa, criancas: [{ id: 'cr-1' }] }).ok).toBe(false);
    expect(validarCopia({ ...boa, progressos: [{ criancaId: 'cr-2' }] }).ok).toBe(false);
  });
});
