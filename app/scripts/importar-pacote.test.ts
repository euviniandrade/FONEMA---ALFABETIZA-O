import { describe, expect, it } from 'vitest';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { FASE_POR_ID, type Edicao } from '@fonema/conteudo';
import { abrirPacoteGeral, montarPacoteGeral } from '../web/src/servicos/pacote.ts';
import { montarPacote } from '../web/src/servicos/pacote-audios.ts';
import { ARQUIVO_PUBLICADAS, importarPacoteGeral, juntarEdicoes } from './importar-pacote.ts';

function repoFalso() {
  const r = mkdtempSync(join(tmpdir(), 'fonema-pacote-'));
  const j = (p: string, v: unknown) => { mkdirSync(join(r, p, '..'), { recursive: true }); writeFileSync(join(r, p), JSON.stringify(v)); };
  j(ARQUIVO_PUBLICADAS, { formato: 'fonema-edicoes', versao: 1, edicoes: [] });
  j('web/public/audio/sons/mapa.json', { versao: 1, fonemas: {} });
  j('web/public/audio/falas/manifesto.json', {});
  j('web/public/audio/nomes/manifesto.json', { sofia: [], tales: [], arquivos: { sofia: {}, tales: {} } });
  j('audio-fontes/falas/manifesto.json', {});
  j('audio-fontes/nomes/manifesto.json', { sofia: {}, tales: {} });
  mkdirSync(join(r, 'web/public/assets/figuras'), { recursive: true });
  writeFileSync(join(r, 'web/public/assets/figuras/uva.webp'), new Uint8Array([1, 2, 3]));
  return r;
}
const ed = (x: Omit<Edicao, 'em'>, em = 1): Edicao => ({ em, ...x });
const trocarPalavra = (valor: string) => ed({ colecao: 'fases', item: 'TF-10', tipo: 'definir', caminho: ['cenas', '@TF-10-C4a', 'atividade', 'itens', 0, 'mostrar'], valor });
const fala = ed({ colecao: 'fases', item: 'TF-10', tipo: 'definir', caminho: ['acolhida', 'texto'], valor: 'Oi! Hoje é dia do L!' });
const figura = { caminho: 'figuras/uva.webp', dados: new Uint8Array([9, 9, 9, 9]), mime: 'image/webp', nome: 'uva-nova.webp', em: 2 };
const semLog = { log: () => {}, masterizar: false, converter: false };
const okTeste = { cmd: 'node', args: ['-e', 'process.exit(0)'] };

describe('pacote do gerenciador (edições + figuras + áudios)', () => {
  it('monta e abre: edições sem o histórico do aparelho, figuras com o caminho em assets', () => {
    const { zip } = montarPacoteGeral({ audios: [], edicoes: [{ ...fala, chave: 'x', anteriores: [] } as Edicao], midias: [figura] });
    const { pacote, arquivos, antigo } = abrirPacoteGeral(zip);
    expect(antigo).toBe(false);
    expect(pacote.edicoes[0]).not.toHaveProperty('anteriores');
    expect(pacote.midias[0].caminho).toBe('figuras/uva.webp');
    expect([...arquivos.get(pacote.midias[0].arquivo)!]).toEqual([9, 9, 9, 9]);
  });

  it('recusa caminho de figura fora de assets', () => {
    expect(() => montarPacoteGeral({ audios: [], edicoes: [], midias: [{ ...figura, caminho: '../index.html' }] })).toThrow(/não permitido/);
  });

  it('importa: grava as edições publicadas e a figura no lugar; roda os testes', () => {
    const r = repoFalso();
    const { zip } = montarPacoteGeral({ audios: [], edicoes: [fala, trocarPalavra('LAMA')], midias: [figura] });
    const res = importarPacoteGeral(zip, { raiz: r, ...semLog, comandoTeste: okTeste });
    expect(res.edicoes).toBe(2);
    const pub = JSON.parse(readFileSync(join(r, ARQUIVO_PUBLICADAS), 'utf8'));
    expect(pub.edicoes).toHaveLength(2);
    expect([...readFileSync(join(r, 'web/public/assets/figuras/uva.webp'))]).toEqual([9, 9, 9, 9]);
    // o conteúdo em memória volta ao publicado do repositório depois da conferência
    expect(FASE_POR_ID['TF-10'].acolhida.texto).not.toBe('Oi! Hoje é dia do L!');
  });

  it('o verificador barra palavra que a criança ainda não lê: nada é gravado', () => {
    const r = repoFalso();
    const { zip } = montarPacoteGeral({ audios: [], edicoes: [trocarPalavra('PATO')], midias: [figura] });
    expect(() => importarPacoteGeral(zip, { raiz: r, ...semLog, comandoTeste: okTeste })).toThrow(/verificador barrou[\s\S]*TF-16/);
    expect(JSON.parse(readFileSync(join(r, ARQUIVO_PUBLICADAS), 'utf8')).edicoes).toHaveLength(0);
    expect([...readFileSync(join(r, 'web/public/assets/figuras/uva.webp'))]).toEqual([1, 2, 3]);
  });

  it('se os testes falham, desfaz o que gravou', () => {
    const r = repoFalso();
    const { zip } = montarPacoteGeral({ audios: [], edicoes: [fala], midias: [figura, { ...figura, caminho: 'figuras/nova.webp' }] });
    expect(() => importarPacoteGeral(zip, { raiz: r, ...semLog, comandoTeste: { cmd: 'node', args: ['-e', 'process.exit(1)'] } })).toThrow(/testes falharam/);
    expect(JSON.parse(readFileSync(join(r, ARQUIVO_PUBLICADAS), 'utf8')).edicoes).toHaveLength(0);
    expect([...readFileSync(join(r, 'web/public/assets/figuras/uva.webp'))]).toEqual([1, 2, 3]);
    expect(existsSync(join(r, 'web/public/assets/figuras/nova.webp'))).toBe(false);
  });

  it('áudios do pacote geral passam pelo importador de áudios; o pacote antigo (só áudios) continua valendo', () => {
    const r = repoFalso();
    const audio = { id: 'fala:sofia|Oi! Hoje é dia do L!', dados: new Uint8Array(30).fill(4), mime: 'audio/mpeg', texto: 'Oi! Hoje é dia do L!', origem: 'arquivo' as const, em: 3 };
    const { zip } = montarPacoteGeral({ audios: [audio], edicoes: [fala], midias: [] });
    expect(importarPacoteGeral(zip, { raiz: r, ...semLog, comandoTeste: okTeste }).audios).toBe(1);
    expect(JSON.parse(readFileSync(join(r, 'web/public/audio/falas/manifesto.json'), 'utf8'))['sofia|Oi! Hoje é dia do L!']).toMatch(/^sofia-humana-/);
    const r2 = repoFalso();
    expect(importarPacoteGeral(montarPacote([audio]).zip, { raiz: r2, ...semLog }).audios).toBe(1);
  });

  it('juntar: a edição mais nova de um mesmo lugar vale', () => {
    const j = juntarEdicoes([trocarPalavra('LUA')], [trocarPalavra('LAMA')]);
    expect(j).toHaveLength(1);
    expect(j[0].valor).toBe('LAMA');
  });
});
