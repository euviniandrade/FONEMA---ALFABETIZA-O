/**
 * Estúdio criativo › Jogos (fila do dono nº 32): os jogos do Parque como dados editáveis. A lista de palavras da Casa do
 * Som (a criança ESCREVE) passa pelo verificador de decodificabilidade (regras 2 e 5): palavra fora do banco, sem figura
 * ou com vogal que muda na fala é BLOQUEADA; o importador do pacote (verificarTudo) barra o mesmo.
 */
import { afterEach, describe, expect, it } from 'vitest';
import { CONTEUDO_EDITAVEL, EDICOES_PUBLICADAS, JOGOS_ESCUTA, JOGOS_PARQUE, JOGO_PARQUE_POR_ID, jogoLigado, licaoQueLibera, nomeDoJogo, verificarEdicao, verificarTudo, type Edicao } from '../src/index.ts';

const S = CONTEUDO_EDITAVEL;
const ed = (x: Omit<Edicao, 'em'>): Edicao => ({ em: 1, ...x });
afterEach(() => { S.aplicar(EDICOES_PUBLICADAS); });

describe('jogos do Parque (Estúdio criativo)', () => {
  it('todo jogo de escutar tem registro no Parque e a lista da Casa do Som passa no verificador', () => {
    for (const j of JOGOS_ESCUTA) expect(JOGO_PARQUE_POR_ID[j.id]?.grupo, j.id).toBe('escuta');
    expect(new Set(JOGOS_PARQUE.map((j) => j.id)).size).toBe(JOGOS_PARQUE.length);
    expect(verificarTudo(S).filter((x) => x.colecao === 'jogos')).toEqual([]);
  });

  it('nome, ligado e ordem mudam no próprio objeto e voltam ao original', () => {
    S.aplicar([
      ed({ colecao: 'jogos', item: 'carteiro', tipo: 'definir', caminho: ['nome'], valor: 'Correio da Vila' }),
      ed({ colecao: 'jogos', item: 'rimas', tipo: 'definir', caminho: ['ligado'], valor: false })
    ]);
    expect(nomeDoJogo('carteiro', 'x')).toBe('Correio da Vila');
    expect(jogoLigado('rimas')).toBe(false);
    S.aplicar([]);
    expect(nomeDoJogo('carteiro', 'x')).toBe('Carteiro da Vila');
    expect(jogoLigado('rimas')).toBe(true);
  });

  it('palavra fora do banco, sem figura ou com vogal nasalizada é BLOQUEADA, com o motivo em linguagem simples', () => {
    const lista = JOGO_PARQUE_POR_ID['casa-som'].palavras!;
    const tentar = (w: string) => verificarEdicao(S, ed({ colecao: 'jogos', item: 'casa-som', tipo: 'definir', caminho: ['palavras'], valor: [...lista, w] }));
    const fora = tentar('zabumbex');
    expect(fora.ok).toBe(false);
    expect(fora.novos[0].semPronuncia).toBe(true);
    const cama = tentar('cama');
    expect(cama.ok).toBe(false);
    expect(cama.novos.map((p) => p.simples).join(' ')).toMatch(/muda quando a gente fala/);
    // palavra de lição mais adiante entra: o jogo só a dá para quem já passou da lição (motor › palavraLiberada)
    const rato = tentar('rato');
    expect(rato.ok).toBe(true);
    expect(licaoQueLibera('rato')).toBe('TF-31');
    // menos de 3 palavras: o jogo nunca abriria
    expect(verificarEdicao(S, ed({ colecao: 'jogos', item: 'casa-som', tipo: 'definir', caminho: ['palavras'], valor: ['uva', 'ovo'] })).ok).toBe(false);
  });

  it('o importador do pacote (verificarTudo) também barra palavra ruim que chegasse por fora', () => {
    S.aplicar([ed({ colecao: 'jogos', item: 'casa-som', tipo: 'definir', caminho: ['palavras'], valor: ['uva', 'ovo', 'mala', 'cama'] })]);
    expect(verificarTudo(S).some((x) => x.colecao === 'jogos' && x.item === 'casa-som')).toBe(true);
  });
});
