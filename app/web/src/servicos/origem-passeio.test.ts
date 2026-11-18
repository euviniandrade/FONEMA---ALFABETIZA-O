import { describe, expect, it } from 'vitest';
import { destinoDoVoltar, type MarcaPasseio } from './origem-passeio.ts';

describe('voltar ao passeio 3D (fila nº 27, item 6)', () => {
  const marca: MarcaPasseio = { criancaId: 'k1', rota: 'c/k1/brincar', pos: { x: 3, z: 4, giro: 1 } };
  it('sem marca, a setinha faz o de sempre', () => {
    expect(destinoDoVoltar('c/k1/vila', 'c/k1/brincar', null)).toBe('c/k1/vila');
  });
  it('a tela aberta pela porta volta ao passeio', () => {
    expect(destinoDoVoltar('c/k1/vila', 'c/k1/brincar', marca)).toBe('c/k1/mundo');
    // entrada da fase (Escola): o voltar normal seria a trilha, mas veio do passeio
    expect(destinoDoVoltar('c/k1/alfabeto', 'c/k1/fase/a1', { ...marca, rota: 'c/k1/fase/a1' })).toBe('c/k1/mundo');
  });
  it('dentro do lugar, o voltar interno continua (jogo → Brincar) e o que iria à vila vai ao passeio', () => {
    expect(destinoDoVoltar('c/k1/brincar', 'c/k1/brincar/palmas', marca)).toBe('c/k1/brincar');
    expect(destinoDoVoltar('c/k1/vila', 'c/k1/sessao/a1', marca)).toBe('c/k1/mundo');
  });
  it('o próprio passeio continua voltando para a vila', () => {
    expect(destinoDoVoltar('c/k1/vila', 'c/k1/mundo', marca)).toBe('c/k1/vila');
  });
});
