import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { FASE_POR_ID, ITENS_LOJA } from '@fonema/conteudo';
import { ArmazemEdicoesMemoria, caminhoDeMidiaValido, edicoes } from './edicoes.ts';
import { asset } from './ambiente.ts';

const fala = { colecao: 'fases', item: 'TF-10', tipo: 'definir' as const, caminho: ['acolhida', 'texto'] };
const original = FASE_POR_ID['TF-10'].acolhida.texto;

describe('edições do administrador neste aparelho (gerenciador)', () => {
  beforeEach(async () => { edicoes.usar(new ArmazemEdicoesMemoria()); await edicoes.carregar(); });
  afterAll(async () => { edicoes.usar(new ArmazemEdicoesMemoria()); await edicoes.carregar(); });

  it('salvar aplica no conteúdo; a 2ª edição do mesmo lugar guarda a 1ª no histórico; desfazer volta um passo', async () => {
    await edicoes.salvar({ ...fala, valor: 'Primeira', em: 1 });
    expect(FASE_POR_ID['TF-10'].acolhida.texto).toBe('Primeira');
    const r = await edicoes.salvar({ ...fala, valor: 'Segunda', em: 2 });
    expect(FASE_POR_ID['TF-10'].acolhida.texto).toBe('Segunda');
    expect(r.anteriores?.map((a) => a.valor)).toEqual(['Primeira']);
    expect(edicoes.edicoes()).toHaveLength(1);
    await edicoes.desfazer(r.chave);
    expect(FASE_POR_ID['TF-10'].acolhida.texto).toBe('Primeira');
    await edicoes.desfazer(r.chave);
    expect(FASE_POR_ID['TF-10'].acolhida.texto).toBe(original);
    expect(edicoes.edicoes()).toHaveLength(0);
  });

  it('voltar ao original por item tira todas as edições dele', async () => {
    await edicoes.salvar({ colecao: 'lojinha', item: 'caderno', tipo: 'definir', caminho: ['preco'], valor: 7, em: 1 });
    await edicoes.salvar({ colecao: 'lojinha', item: 'caderno', tipo: 'definir', caminho: ['nome'], valor: 'Caderninho', em: 2 });
    expect(ITENS_LOJA.find((i) => i.id === 'caderno')).toMatchObject({ preco: 7, nome: 'Caderninho' });
    await edicoes.voltarItem('lojinha', 'caderno');
    expect(ITENS_LOJA.find((i) => i.id === 'caderno')).toMatchObject({ preco: 4, nome: 'Caderno' });
  });

  it('figura trocada: asset() devolve o arquivo do aparelho; voltar ao original devolve o caminho de sempre', async () => {
    expect(asset('figuras/uva.webp')).toBe('./assets/figuras/uva.webp');
    await edicoes.salvarMidia({ caminho: 'figuras/uva.webp', blob: new Blob([new Uint8Array([1, 2])], { type: 'image/webp' }), nome: 'u.webp', em: 1 });
    expect(asset('figuras/uva.webp')).toMatch(/^blob:/);
    expect(edicoes.midiaTrocada('./assets/figuras/uva.webp')?.nome).toBe('u.webp');
    await edicoes.removerMidia('figuras/uva.webp');
    expect(asset('figuras/uva.webp')).toBe('./assets/figuras/uva.webp');
  });

  it('só caminhos de figura/modelo dentro de assets', () => {
    expect(caminhoDeMidiaValido('modelos3d/sofia.glb')).toBe(true);
    expect(caminhoDeMidiaValido('../index.html')).toBe(false);
    expect(caminhoDeMidiaValido('figuras/x.js')).toBe(false);
  });
});
