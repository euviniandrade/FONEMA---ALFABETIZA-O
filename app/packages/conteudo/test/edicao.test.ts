/**
 * Gerenciador de conteúdo (fila do dono nº 18): a camada de edições aplica por cima do conteúdo SEM quebrar IDs nem
 * o motor, volta ao original, e o verificador AO VIVO bloqueia palavra que a criança ainda não sabe ler (regra 2).
 */
import { afterEach, describe, expect, it } from 'vitest';
import {
  BANCO, CONTEUDO_EDITAVEL, EDICOES_PUBLICADAS, FASES, FASE_POR_ID, FALAS, ITENS_LOJA, PALAVRAS_DAS_FICHAS, REGIAO_POR_ID, RELATORIO_PUBLICADAS, TEXTOS_TELA,
  anotarPalavra, conferirAnotacao, perguntasDePronuncia, textosDoItem, todosOsTextos, verificarEdicao, verificarTudo, type Edicao
} from '../src/index.ts';

const ed = (x: Omit<Edicao, 'em'>): Edicao => ({ em: 1, ...x });
const S = CONTEUDO_EDITAVEL;
afterEach(() => { S.aplicar(EDICOES_PUBLICADAS); });

describe('camada de edições', () => {
  it('as edições publicadas do repositório se aplicam todas e o conteúdo inteiro passa no verificador', () => {
    expect(RELATORIO_PUBLICADAS.semLugar).toEqual([]);
    expect(verificarTudo(S)).toEqual([]);
  });

  it('troca a fala de uma fase no próprio objeto (FASE_POR_ID vê) e volta ao original', () => {
    const f = FASE_POR_ID['TF-10'];
    const antes = f.acolhida.texto;
    const n = FASES.length;
    S.aplicar([ed({ colecao: 'fases', item: 'TF-10', tipo: 'definir', caminho: ['acolhida', 'texto'], valor: 'Oi! Hoje é dia do L!' })]);
    expect(FASE_POR_ID['TF-10']).toBe(f);
    expect(f.acolhida.texto).toBe('Oi! Hoje é dia do L!');
    expect(FASES.length).toBe(n);
    S.aplicar([]);
    expect(f.acolhida.texto).toBe(antes);
  });

  it('editar uma fase não muda as falas que ela divide com outras fases', () => {
    const outra = FASE_POR_ID['TF-11'];
    const antes = JSON.stringify(outra);
    S.aplicar([ed({ colecao: 'fases', item: 'TF-10', tipo: 'definir', caminho: ['gancho', 'texto'], valor: 'Até amanhã!' })]);
    expect(JSON.stringify(outra)).toBe(antes);
  });

  it('a última edição de um mesmo lugar vale; caminho por id de cena', () => {
    S.aplicar([
      ed({ colecao: 'fases', item: 'TF-10', tipo: 'definir', caminho: ['cenas', '@TF-10-C4a', 'atividade', 'itens', 0, 'mostrar'], valor: 'LUA' }),
      ed({ colecao: 'fases', item: 'TF-10', tipo: 'definir', caminho: ['cenas', '@TF-10-C4a', 'atividade', 'itens', 0, 'mostrar'], valor: 'LAMA', em: 2 })
    ]);
    const c = FASE_POR_ID['TF-10'].cenas.find((x) => x.id === 'TF-10-C4a')!;
    expect((c.atividade as { itens: { mostrar?: string }[] }).itens[0].mostrar).toBe('LAMA');
  });

  it('reordena e desliga cenas sem perder o original (os ids das cenas não mudam)', () => {
    const ids = FASE_POR_ID['TF-10'].cenas.map((c) => c.id);
    S.aplicar([
      ed({ colecao: 'fases', item: 'TF-10', tipo: 'ordem-cenas', valor: [ids[1], ids[0], ...ids.slice(2)] }),
      ed({ colecao: 'fases', item: 'TF-10', tipo: 'desligar-cenas', valor: ['TF-10-C4c'] })
    ]);
    const agora = FASE_POR_ID['TF-10'].cenas.map((c) => c.id);
    expect(agora.slice(0, 2)).toEqual([ids[1], ids[0]]);
    expect(agora).not.toContain('TF-10-C4c');
    S.aplicar([]);
    expect(FASE_POR_ID['TF-10'].cenas.map((c) => c.id)).toEqual(ids);
  });

  it('cria uma fase nova a partir de um modelo, na jornada logo depois dele, e tira ao voltar ao original', () => {
    const modelo = FASE_POR_ID['TF-10'];
    const n = FASES.length;
    const nova = { ...JSON.parse(JSON.stringify(modelo)), titulo: 'O som /l/ (mais prática)' };
    S.aplicar([ed({ colecao: 'fases', item: 'TF-10-x1', tipo: 'novo', valor: nova, depoisDe: 'TF-10', modelo: 'TF-10' })]);
    expect(FASES.length).toBe(n + 1);
    expect(FASES[FASES.findIndex((f) => f.id === 'TF-10') + 1].id).toBe('TF-10-x1');
    expect(FASE_POR_ID['TF-10-x1'].titulo).toBe('O som /l/ (mais prática)');
    expect(REGIAO_POR_ID.TF.fases).toContain('TF-10-x1');
    expect(verificarTudo(S)).toEqual([]);
    S.aplicar([]);
    expect(FASES.length).toBe(n);
    expect(FASE_POR_ID['TF-10-x1']).toBeUndefined();
  });

  it('fase rascunho fica fora da jornada (só no índice, para pré-visualizar)', () => {
    const n = FASES.length;
    S.aplicar([ed({ colecao: 'fases', item: 'TF-10-r', tipo: 'novo', valor: JSON.parse(JSON.stringify(FASE_POR_ID['TF-10'])), rascunho: true, modelo: 'TF-10' })]);
    expect(FASES.length).toBe(n);
    expect(FASE_POR_ID['TF-10-r']).toBeDefined();
  });

  it('lojinha, textos de tela, falas gerais e fichas (lista derivada refeita)', () => {
    const caderno = ITENS_LOJA.find((i) => i.id === 'caderno')!;
    S.aplicar([
      ed({ colecao: 'lojinha', item: 'caderno', tipo: 'definir', caminho: ['preco'], valor: 9 }),
      ed({ colecao: 'textos-tela', item: 'entrada.titulo', tipo: 'definir', caminho: [], valor: 'Quem chegou?' }),
      ed({ colecao: 'falas-gerais', item: 'chegada', tipo: 'definir', caminho: [0, 'texto'], valor: 'Oi, [NOME]! Eu sou a Sofia, sua guia.' }),
      ed({ colecao: 'fichas', item: 'animais', tipo: 'definir', caminho: ['palavras'], valor: ['pato', 'sapo'] })
    ]);
    expect(caderno.preco).toBe(9);
    expect(TEXTOS_TELA['entrada.titulo']).toBe('Quem chegou?');
    expect(FALAS.chegada[0].texto).toMatch(/sua guia/);
    S.aplicar([]);
    expect(caderno.preco).toBe(4);
    expect(TEXTOS_TELA['entrada.titulo']).toBe('Quem vai entrar?');
    expect(PALAVRAS_DAS_FICHAS).toContain('macaco');
  });

  it('edição cujo lugar não existe mais fica registrada como sem lugar (não quebra)', () => {
    const r = S.aplicar([ed({ colecao: 'fases', item: 'TF-10', tipo: 'definir', caminho: ['cenas', '@nao-existe', 'titulo'], valor: 'x' })]);
    expect(r.semLugar).toHaveLength(1);
  });
});

describe('verificador ao vivo (regra 2)', () => {
  const trocar = (valor: string) => ed({ colecao: 'fases', item: 'TF-10', tipo: 'definir', caminho: ['cenas', '@TF-10-C4a', 'atividade', 'itens', 0, 'mostrar'], valor });

  it('aceita palavra que a criança já lê na lição (LAMA na TF-10)', () => {
    expect(verificarEdicao(S, trocar('LAMA')).ok).toBe(true);
  });
  it('bloqueia palavra com som ainda não ensinado (PATO na TF-10) e explica em linguagem simples', () => {
    const r = verificarEdicao(S, trocar('PATO'));
    expect(r.ok).toBe(false);
    expect(r.novos[0].simples).toMatch(/só aprende na lição TF-16/);
  });
  it('palavra fora do banco pede a pronúncia', () => {
    const r = verificarEdicao(S, trocar('LULU'));
    expect(r.ok).toBe(false);
    expect(r.novos[0].semPronuncia).toBe(true);
  });
  it('não conferir a edição não muda o conteúdo (simulação numa cópia)', () => {
    const antes = JSON.stringify(FASE_POR_ID['TF-10']);
    verificarEdicao(S, trocar('PATO'));
    expect(JSON.stringify(FASE_POR_ID['TF-10'])).toBe(antes);
  });
  it('frase de texto para ler sozinho: bloqueia palavra de som não ensinado', () => {
    const r = verificarEdicao(S, ed({ colecao: 'textos', item: 'ema-suja', tipo: 'definir', caminho: ['linhas', 0, 'texto'], valor: 'A ema viu o rato.' }));
    expect(r.ok).toBe(false);
  });
  it('palavra nova com pronúncia anotada (assistente) passa a valer', () => {
    const perg = perguntasDePronuncia('lulu');
    expect(perg).toEqual([]);
    const sons = anotarPalavra('lulu');
    expect(sons).toBe('l u l u');
    expect(conferirAnotacao({ texto: 'lulu', sons })).toEqual([]);
    S.aplicar([ed({ colecao: 'banco', item: 'lulu', tipo: 'novo', valor: { texto: 'lulu', sons, oxitona: true } })]);
    expect(BANCO.lulu).toBeDefined();
    expect(verificarEdicao(S, trocar('LULU')).ok).toBe(true);
    S.aplicar([]);
    expect(BANCO.lulu).toBeUndefined();
  });
});

describe('assistente de pronúncia', () => {
  it('pergunta pelo E/O aberto ou fechado e pelo O do fim', () => {
    const p = perguntasDePronuncia('bolo');
    expect(p.map((x) => x.letra)).toEqual(['o', 'o']);
    expect(anotarPalavra('bolo')).toBe('b o l u');
    expect(anotarPalavra('bola', { 1: 'aberto' })).toBe('b ɔ l a');
    expect(anotarPalavra('casa')).toBe('k a z a');
    expect(anotarPalavra('chave')).toBe('ʃ a v i');
    for (const w of ['bolo', 'casa', 'chave', 'gelo', 'rato', 'queijo', 'mãe', 'tambor']) expect(conferirAnotacao({ texto: w, sons: anotarPalavra(w) })).toEqual([]);
  });
});

describe('lista de textos editáveis', () => {
  it('acha as falas da fase com o caminho exato e quem fala', () => {
    const t = textosDoItem('fases', 'TF-10', FASE_POR_ID['TF-10']);
    const acolhida = t.find((x) => x.caminho.join('/') === 'acolhida/texto')!;
    expect(acolhida.tipo).toBe('fala');
    expect(acolhida.texto).toBe(FASE_POR_ID['TF-10'].acolhida.texto);
    expect(t.some((x) => x.caminho[0] === 'cenas' && String(x.caminho[1]).startsWith('@'))).toBe(true);
    expect(todosOsTextos(S).length).toBeGreaterThan(1000);
  });
});
