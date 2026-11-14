import { describe, expect, it } from 'vitest';
import { ACESSIBILIDADE, CABELOS, CALCADOS, CALCAS, CAMISAS, CORES_CABELO, FASE_POR_ID, OLHOS, PASSOS_AVATAR, PECAS_AVATAR, PELES, ROSTOS, pecaAvatar, pecasPara } from '../src/index.ts';

describe('catálogo do avatar montável (D029)', () => {
  it('ids únicos por categoria e toda peça encontrável', () => {
    const chaves = PECAS_AVATAR.map((p) => `${p.categoria}:${p.id}`);
    expect(new Set(chaves).size).toBe(chaves.length);
    for (const p of PECAS_AVATAR) expect(pecaAvatar(p.categoria, p.id)).toBe(p);
  });

  it('leque amplo de peles, 3–4 rostos, olhos e cores naturais de cabelo', () => {
    expect(PELES.length).toBeGreaterThanOrEqual(8);
    expect(ROSTOS.length).toBeGreaterThanOrEqual(3);
    expect(ROSTOS.length).toBeLessThanOrEqual(4);
    expect(OLHOS.length).toBeGreaterThanOrEqual(5);
    expect(CORES_CABELO.length).toBeGreaterThanOrEqual(5);
    for (const p of [...PELES, ...OLHOS, ...CORES_CABELO]) expect(p.cor).toMatch(/^#[0-9A-F]{6}$/i);
  });

  it('só dois sexos: menina não vê peça de menino e menino não vê peça de menina; as comuns aparecem nos dois', () => {
    for (const cat of ['cabelo', 'camisa', 'calca', 'calcado'] as const) {
      const f = pecasPara(cat, 'f'), m = pecasPara(cat, 'm');
      expect(f.some((p) => p.sexo === 'm')).toBe(false);
      expect(m.some((p) => p.sexo === 'f')).toBe(false);
      expect(f.length).toBeGreaterThanOrEqual(3);
      expect(m.length).toBeGreaterThanOrEqual(3);
      for (const p of PECAS_AVATAR.filter((x) => x.categoria === cat && x.sexo === 'ambos')) { expect(f).toContain(p); expect(m).toContain(p); }
    }
    expect(PECAS_AVATAR.every((p) => ['m', 'f', 'ambos'].includes(p.sexo))).toBe(true);
  });

  it('cada passo obrigatório tem ao menos uma opção liberada de graça para cada sexo', () => {
    for (const passo of PASSOS_AVATAR) for (const sexo of ['m', 'f'] as const) {
      expect(pecasPara(passo.id, sexo).some((p) => !p.fase && p.preco === 0), `${passo.id}/${sexo}`).toBe(true);
    }
  });

  it('identidade e acessibilidade são grátis; o uniforme da turma já vem liberado', () => {
    for (const p of [...PELES, ...ROSTOS, ...OLHOS, ...CORES_CABELO, ...ACESSIBILIDADE]) { expect(p.preco).toBe(0); expect(p.fase).toBeUndefined(); }
    expect(ACESSIBILIDADE.map((a) => a.id).sort()).toEqual(['aparelho-auditivo', 'cadeira-de-rodas', 'oculos', 'pintura-no-rosto']);
    for (const [lista, id] of [[CAMISAS, 'uniforme'], [CALCAS, 'uniforme'], [CALCADOS, 'tenis-branco']] as const) {
      const p = lista.find((x) => x.id === id)!;
      expect(p.sexo).toBe('ambos');
      expect(p.preco).toBe(0);
      expect(p.fase).toBeUndefined();
    }
  });

  it('peça com cadeado aponta para uma fase que existe e tem preço', () => {
    const trancadas = PECAS_AVATAR.filter((p) => p.fase);
    expect(trancadas.length).toBeGreaterThanOrEqual(8);
    for (const p of trancadas) { expect(FASE_POR_ID[p.fase!], p.id).toBeDefined(); expect(p.preco).toBeGreaterThan(0); }
  });

  it('valores: sem joias nem adornos (D008) e no máximo 2 cores por peça (D009, sem arco-íris)', () => {
    for (const p of PECAS_AVATAR) {
      expect(p.nome).not.toMatch(/colar|brinco|anel|pulseira|joia|coroa|piercing|maquiagem|arco-íris|fada|bruxa|mágic/i);
      expect(Object.keys(p)).not.toContain('cor3');
    }
    expect(CABELOS.every((c) => !!c.modelo)).toBe(true);
  });
});
