import { describe, expect, it } from 'vitest';
import { ACESSIBILIDADE, CABELOS, CALCADOS, CALCAS, CAMISAS, CORES_CABELO, FASE_POR_ID, OLHOS, PASSOS_AVATAR, PECAS_AVATAR, PELES, pecaAvatar, pecaPadrao, pecasPara } from '../src/index.ts';

const luminancia = (hex: string) => { const n = parseInt(hex.slice(1), 16); return 0.2126 * (n >> 16) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255); };

describe('catálogo do avatar 3D (D029 §1 e §7)', () => {
  it('ids únicos por categoria e toda peça encontrável', () => {
    const chaves = PECAS_AVATAR.map((p) => `${p.categoria}:${p.id}`);
    expect(new Set(chaves).size).toBe(chaves.length);
    for (const p of PECAS_AVATAR) expect(pecaAvatar(p.categoria, p.id)).toBe(p);
  });

  it('pele: no mínimo 8 tons, da clara à negra retinta, bem distribuídos, em ordem neutra e sem "padrão" destacado', () => {
    expect(PELES.length).toBeGreaterThanOrEqual(8);
    const l = PELES.map((p) => luminancia(p.cor!));
    for (let i = 1; i < l.length; i++) expect(l[i], `tom ${i + 1} mais escuro que o anterior`).toBeLessThan(l[i - 1]);
    expect(l[0]).toBeGreaterThan(195);
    expect(l[l.length - 1]).toBeLessThan(55);
    // metade dos tons é morena, parda ou negra (não é uma paleta de claros com um escuro no fim)
    expect(l.filter((x) => x < 150).length).toBeGreaterThanOrEqual(PELES.length / 2);
    for (let i = 1; i < l.length; i++) expect(l[i - 1] - l[i], 'sem buraco na gama').toBeLessThan(45);
    expect(PELES.some((p) => p.padrao)).toBe(false);
    expect(PELES.map((p) => p.nome).join(' ')).toMatch(/Clara.*Morena.*Parda.*Negra.*retinta/);
  });

  it('olhos e cabelo: cores naturais, em hexadecimal', () => {
    expect(OLHOS.length).toBeGreaterThanOrEqual(5);
    expect(CORES_CABELO.length).toBeGreaterThanOrEqual(5);
    for (const p of [...PELES, ...OLHOS, ...CORES_CABELO, ...CAMISAS, ...CALCAS, ...CALCADOS]) expect(p.cor).toMatch(/^#[0-9A-F]{6}$/i);
  });

  it('o boneco começa no padrão: roupa toda branca, e cada sexo tem o seu modelo de cabelo padrão', () => {
    for (const sexo of ['m', 'f'] as const) {
      for (const cat of ['camisa', 'calca', 'calcado'] as const) expect(pecaPadrao(cat, sexo)?.cor).toBe('#FFFFFF');
      const cabelo = pecaPadrao('cabelo', sexo)!;
      expect(cabelo.modelo).toBe(sexo === 'm' ? 'menino-padrao' : 'menina-padrao');
      expect(cabelo.preco).toBe(0);
    }
    for (const lista of [CAMISAS, CALCAS, CALCADOS]) expect(lista.filter((p) => p.padrao).length).toBe(1);
  });

  it('só dois sexos: menina não vê cabelo de menino e menino não vê cabelo de menina; as cores valem para os dois', () => {
    const f = pecasPara('cabelo', 'f'), m = pecasPara('cabelo', 'm');
    expect(f.every((p) => p.sexo === 'f' && p.modelo!.startsWith('menina-'))).toBe(true);
    expect(m.every((p) => p.sexo === 'm' && p.modelo!.startsWith('menino-'))).toBe(true);
    for (const cat of ['pele', 'olhos', 'corCabelo', 'camisa', 'calca', 'calcado'] as const) expect(pecasPara(cat, 'f')).toEqual(pecasPara(cat, 'm'));
    expect(PECAS_AVATAR.every((p) => ['m', 'f', 'ambos'].includes(p.sexo))).toBe(true);
    // cada tipo de cabelo é um penteado diferente (ou o cabelo do próprio modelo, no padrão)
    for (const sexo of ['m', 'f'] as const) {
      const lista = CABELOS.filter((c) => c.sexo === sexo);
      expect(new Set(lista.map((c) => c.penteado ?? 'modelo')).size).toBe(lista.length);
      expect(lista.length, `cabelos de ${sexo}`).toBeGreaterThanOrEqual(9);
    }
  });

  it('cada passo tem ao menos três opções liberadas de graça (ou o padrão) para cada sexo', () => {
    for (const passo of PASSOS_AVATAR) for (const sexo of ['m', 'f'] as const) {
      const livres = pecasPara(passo.id, sexo).filter((p) => !p.fase && p.preco === 0);
      expect(livres.length, `${passo.id}/${sexo}`).toBeGreaterThanOrEqual(3);
    }
    expect(PASSOS_AVATAR.map((p) => p.id)).toEqual(['pele', 'olhos', 'corCabelo', 'cabelo', 'camisa', 'calca', 'calcado']);
  });

  it('identidade e acessibilidade são grátis; o que ainda não cabe no modelo fica fora das telas', () => {
    for (const p of [...PELES, ...OLHOS, ...CORES_CABELO, ...ACESSIBILIDADE]) { expect(p.preco).toBe(0); expect(p.fase).toBeUndefined(); }
    expect(pecasPara('acessibilidade', 'f').map((a) => a.id).sort()).toEqual(['oculos', 'pintura-no-rosto']);
    expect(ACESSIBILIDADE.filter((a) => a.indisponivel).map((a) => a.id).sort()).toEqual(['aparelho-auditivo', 'cadeira-de-rodas']);
  });

  it('cor ou penteado com cadeado aponta para uma fase que existe e tem preço', () => {
    const trancadas = PECAS_AVATAR.filter((p) => p.fase);
    expect(trancadas.length).toBeGreaterThanOrEqual(8);
    for (const p of trancadas) { expect(FASE_POR_ID[p.fase!], p.id).toBeDefined(); expect(p.preco).toBeGreaterThan(0); }
  });

  it('valores: sem joias nem adornos (D008), sem arco-íris (D009) e a camiseta nunca fica da cor da letra A', () => {
    for (const p of PECAS_AVATAR) expect(p.nome).not.toMatch(/colar|brinco|anel|pulseira|joia|coroa|piercing|maquiagem|arco-íris|fada|bruxa|mágic/i);
    expect(CAMISAS.some((c) => /marinho/i.test(c.nome) || c.id === 'marinho')).toBe(false);
  });
});
