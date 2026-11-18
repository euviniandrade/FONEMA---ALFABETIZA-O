/**
 * Gerenciador: trocar as palavras de síntese, caixas, pares mínimos, troca-letras, frases e ditado. O item novo é montado
 * com os sons do banco (como em fases/tf.ts) e passa pelo verificador ao vivo; fase nova entra nas etapas do caminho.
 */
import { afterEach, describe, expect, it } from 'vitest';
import {
  CONTEUDO_EDITAVEL, EDICOES_PUBLICADAS, ETAPAS_DO_CAMINHO, ErroItem, FASE_POR_ID, montarCaixas, montarDitado, montarFrase, montarPar, montarSintese, montarTroca,
  verificarEdicao, type AtividadeCaixas, type AtividadeDitado, type AtividadeFrase, type AtividadeParMinimo, type AtividadeSintese, type AtividadeTroca, type Edicao
} from '../src/index.ts';

const S = CONTEUDO_EDITAVEL;
afterEach(() => { S.aplicar(EDICOES_PUBLICADAS); });
const ativ = <T>(fase: string, cena: string) => FASE_POR_ID[fase].cenas.find((c) => c.id === cena)!.atividade as T;
const ed = (fase: string, cena: string, resto: (string | number)[], valor: unknown): Edicao => ({ colecao: 'fases', item: fase, tipo: 'definir', caminho: ['cenas', `@${cena}`, 'atividade', ...resto], valor, em: 1 });
const erro = (f: () => unknown) => { try { f(); } catch (e) { return e instanceof ErroItem ? e.simples : String(e); } return ''; };

describe('trocar palavras de atividades com o som de cada letra', () => {
  it('síntese: sons do banco, 3 opções, a certa no lugar; palavra de som não ensinado é bloqueada pelo verificador', () => {
    const a = ativ<AtividadeSintese>('TF-07', 'TF-07-C3s');
    const novo = montarSintese(a.itens[0], 'mia', ['meu', 'meia']);
    expect(novo.palavra).toBe('MIA');
    expect(novo.sons).toEqual(['m', 'i', 'a']);
    expect(novo.opcoes.map((o) => o.id).sort()).toEqual(['meia', 'meu', 'mia']);
    expect(novo.correta).toBe('mia');
    expect(verificarEdicao(S, ed('TF-07', 'TF-07-C3s', ['itens', 0], novo)).ok).toBe(true);
    const ruim = montarSintese(a.itens[0], 'mala', ['meu', 'meia']);
    expect(verificarEdicao(S, ed('TF-07', 'TF-07-C3s', ['itens', 0], ruim)).novos[0].simples).toMatch(/TF-10/);
    expect(erro(() => montarSintese(a.itens[0], 'mia', ['meu']))).toMatch(/pelo menos 2/);
    expect(erro(() => montarSintese(a.itens[0], 'xyzw', ['meu', 'meia']))).toMatch(/pronúncia/);
  });

  it('caixas: sons e letras da palavra nova, com letra a mais', () => {
    const a = ativ<AtividadeCaixas>('TF-10', 'TF-10-C4c');
    const novo = montarCaixas(a.itens[0], 'lama');
    expect(novo.palavra).toBe('LAMA');
    expect(novo.sons).toEqual(['l', 'a', 'm', 'a']);
    expect(novo.letras.slice(0, 3)).toEqual(['L', 'A', 'M']);
    expect(novo.letras.length).toBeGreaterThan(3);
    expect(verificarEdicao(S, ed('TF-10', 'TF-10-C4c', ['itens', 0], novo)).ok).toBe(true);
  });

  it('par mínimo: um som só de diferença, 3ª opção obrigatória, habilidade do par coerente', () => {
    const a = ativ<AtividadeParMinimo>('TF-09', 'TF-09-C5p');
    const ouvir = a.itens.findIndex((i) => i.modo === 'ouvir');
    const novo = montarPar(a.itens[ouvir], 'vaca', 'faca', 'foca');
    expect(novo.sons).toEqual(['v', 'f']);
    expect(novo.habilidade).toBe(a.itens[ouvir].habilidade);
    expect(novo.figuraAlvo).toBe('vaca');
    expect(erro(() => montarPar(a.itens[ouvir], 'vaca', 'mala', 'foca'))).toMatch(/UM som só/);
    expect(erro(() => montarPar(a.itens[ouvir], 'vaca', 'faca', ''))).toMatch(/3ª opção/);
    const ler = a.itens.findIndex((i) => i.modo === 'ler');
    const l2 = montarPar(a.itens[ler], 'fia', 'via', 'viu');
    expect(l2.habilidade).toBe('par-minimo-f-v');
  });

  it('troca-letras: acha a ação, a posição, a letra e o som; leituras com 3 opções', () => {
    const a = ativ<AtividadeTroca>('TF-07', 'TF-07-C5t');
    const novo = montarTroca(a.itens[0], 'ia', 'mia');
    expect(novo).toMatchObject({ acao: 'acrescentar', de: 'IA', para: 'MIA', posicao: 0, letra: 'M', som: 'm' });
    expect(novo.leituras.length).toBe(3);
    expect(novo.letras[0]).toBe('M');
    expect(erro(() => montarTroca(a.itens[0], 'eu', 'mia'))).toMatch(/UMA letra|uma letra/);
  });

  it('frase: palavras com sons; frase com som não ensinado bloqueada', () => {
    const a = ativ<AtividadeFrase>('TF-10', 'TF-10-C5f');
    const novo = montarFrase(a.itens[0], 'A mula viu a lua.');
    expect(novo.palavras.map((p) => p.palavra)).toEqual(['A', 'MULA', 'VIU', 'A', 'LUA']);
    expect(verificarEdicao(S, ed('TF-10', 'TF-10-C5f', ['itens', 0], novo)).ok).toBe(true);
    const ruim = montarFrase(a.itens[0], 'A mula viu o pato.');
    expect(verificarEdicao(S, ed('TF-10', 'TF-10-C5f', ['itens', 0], ruim)).ok).toBe(false);
    expect(erro(() => montarFrase(a.itens[0], 'A lula viu a lua.', undefined, { correta: 'lua', opcoes: ['lua', 'uva'] }))).toMatch(/3 figuras/);
  });

  it('ditado: letras cobrem as palavras novas; verificador confere', () => {
    const a = ativ<AtividadeDitado>('TF-R2', 'TF-R2-C5d');
    const novo = montarDitado(a.letras, ['lama', 'sala']);
    expect(novo.palavras).toEqual(['LAMA', 'SALA']);
    for (const l of 'LAMS') expect(novo.letras).toContain(l);
    expect(verificarEdicao(S, ed('TF-R2', 'TF-R2-C5d', ['palavras'], novo.palavras)).ok).toBe(true);
    expect(verificarEdicao(S, ed('TF-R2', 'TF-R2-C5d', ['palavras'], ['PATO'])).ok).toBe(false);
  });
});

describe('fase nova nas listas montadas na carga', () => {
  it('fase copiada do fim de uma etapa entra na mesma etapa do caminho; voltar ao original desfaz', () => {
    const letras = ETAPAS_DO_CAMINHO.find((e) => e.id === 'letras')!;
    expect(letras.ate).toBe('TF-05');
    S.aplicar([{ colecao: 'fases', item: 'TF-05-n1', tipo: 'novo', valor: JSON.parse(JSON.stringify(FASE_POR_ID['TF-05'])), depoisDe: 'TF-05', modelo: 'TF-05', em: 1 }]);
    expect(letras.ate).toBe('TF-05-n1');
    const ultima = ETAPAS_DO_CAMINHO.find((e) => e.id === 'vogais')!;
    const fim = ultima.ate!;
    S.aplicar([{ colecao: 'fases', item: `${fim}-n1`, tipo: 'novo', valor: JSON.parse(JSON.stringify(FASE_POR_ID[fim])), depoisDe: fim, modelo: fim, em: 1 }]);
    expect(ultima.ate).toBe(`${fim}-n1`);
    expect(letras.ate).toBe('TF-05');
    S.aplicar([]);
    expect(ultima.ate).toBe(fim);
  });
});
