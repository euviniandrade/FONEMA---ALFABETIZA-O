import { describe, expect, it } from 'vitest';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { montarPacote } from '../web/src/servicos/pacote-audios.ts';
import { importarPacote } from './importar-pacote-audios.ts';

/** Repositório de mentira, só com os manifestos que o importador mexe. */
function repoFalso() {
  const r = mkdtempSync(join(tmpdir(), 'fonema-importar-'));
  const j = (p: string, v: unknown) => { mkdirSync(join(r, p, '..'), { recursive: true }); writeFileSync(join(r, p), JSON.stringify(v)); };
  j('web/public/audio/sons/mapa.json', { versao: 1, fonemas: { m: { arquivo: 'm.mp3', estado: 'aprovado', tipo: 'continuo', ipa: '/m/', letras: ['M'], duracaoMs: 1400 } }, letras: { M: ['m'], R: ['rr', 'r'] } });
  j('web/public/audio/falas/manifesto.json', { 'sofia|Bola.': 'sofia-bola-m1.mp3' });
  j('web/public/audio/nomes/manifesto.json', { sofia: ['ana'], tales: [], arquivos: { sofia: { ana: 'ana-m1.mp3' }, tales: {} } });
  j('audio-fontes/falas/manifesto.json', { 'sofia|Bola.': 'sofia-bola.mp3' });
  j('audio-fontes/nomes/manifesto.json', { sofia: { ana: 'ana.mp3' }, tales: {} });
  j('docs/auditoria-audio.json', [{ tipo: 'fala', voz: 'sofia', chave: 'Bola.', arquivo: 'falas/sofia-bola-m1.mp3', gravidade: 'grave' }]);
  mkdirSync(join(r, 'web/src/telas/admin'), { recursive: true });
  writeFileSync(join(r, 'docs/auditoria-sons-letras.md'), '# Auditoria dos sons\n');
  return r;
}
const ler = (r: string, p: string) => JSON.parse(readFileSync(join(r, p), 'utf8'));
const wav = (n: number) => new Uint8Array(n).fill(3);

function pacote(autorizacao = true) {
  return montarPacote([
    { id: 'som:m', dados: wav(40), mime: 'audio/wav', texto: 'M: mmm', origem: 'gravacao', quem: 'Agatha', autorizacao, em: 0, duracaoMs: 900 },
    { id: 'som:r', dados: wav(30), mime: 'audio/wav', texto: 'R fraco', origem: 'gravacao', quem: 'Agatha', autorizacao, em: 0 },
    { id: 'fala:sofia|Bola.', dados: wav(50), mime: 'audio/mpeg', texto: 'Bola.', origem: 'arquivo', em: 0 },
    { id: 'nome:tales|agatha', dados: wav(20), mime: 'audio/mpeg', texto: 'agatha', origem: 'arquivo', em: 0 }
  ]).zip;
}

describe('importar o pacote de áudios no repositório', () => {
  it('sem a marca de autorização, só importa com --confirmo-autorizacao', () => {
    const r = repoFalso();
    expect(() => importarPacote(pacote(false), { raiz: r, masterizar: false, converter: false, log: () => {} })).toThrow(/autoriza/);
    expect(ler(r, 'web/public/audio/sons/mapa.json').fonemas.m.arquivo).toBe('m.mp3');
    expect(importarPacote(pacote(false), { raiz: r, masterizar: false, converter: false, confirmoAutorizacao: true, log: () => {} }).aplicados).toHaveLength(4);
  });

  it('cada áudio entra no lugar certo: sons no mapa, falas e nomes nos manifestos; registro e auditoria marcados', () => {
    const r = repoFalso();
    const res = importarPacote(pacote(), { raiz: r, masterizar: false, converter: false, log: () => {}, agora: new Date('2026-11-17T12:00:00Z') });
    const mapa = ler(r, 'web/public/audio/sons/mapa.json');
    expect(mapa.fonemas.m).toMatchObject({ estado: 'aprovado', origem: 'voz humana', ipa: '/m/', letras: ['M'], duracaoMs: 900 });
    expect(mapa.fonemas.m.arquivo).toMatch(/^m-humana-[0-9a-f]{8}\.wav$/);
    expect(existsSync(join(r, 'web/public/audio/sons', mapa.fonemas.m.arquivo))).toBe(true);
    expect(mapa.fonemas.r).toMatchObject({ tipo: 'explosivo', ipa: '/ɾ/', origem: 'voz humana' }); // som que não tinha clipe
    expect(existsSync(join(r, 'audio-fontes/sons/humana', mapa.fonemas.m.arquivo))).toBe(true);
    const falas = ler(r, 'web/public/audio/falas/manifesto.json');
    expect(falas['sofia|Bola.']).toMatch(/^sofia-humana-[0-9a-f]{8}\.mp3$/);
    expect(readFileSync(join(r, 'web/public/audio/falas', falas['sofia|Bola.'])).length).toBe(50);
    expect(ler(r, 'audio-fontes/falas/manifesto.json')['sofia|Bola.']).toBe(falas['sofia|Bola.']);
    const nomes = ler(r, 'web/public/audio/nomes/manifesto.json');
    expect(nomes.tales).toContain('agatha');
    expect(nomes.arquivos.tales.agatha).toMatch(/^agatha-humana-/);
    const reg = ler(r, 'audio-fontes/voz-humana.json');
    expect(reg['som:m']).toMatchObject({ quem: 'Agatha', autorizacao: true, importadoEm: '2026-11-17T12:00:00.000Z' });
    const aud = ler(r, 'docs/auditoria-audio.json');
    expect(aud[0].voz_humana).toMatchObject({ autorizacao: false });
    expect(aud.some((c: { chave?: string; gravidade?: string }) => c.chave === 'agatha' && c.gravidade === 'humana')).toBe(true);
    expect(ler(r, 'web/src/telas/admin/auditoria-resumo.json')).toEqual({}); // o clipe grave virou voz humana
    expect(readFileSync(join(r, 'docs/auditoria-sons-letras.md'), 'utf8')).toMatch(/Voz humana[\s\S]*`m`[\s\S]*Agatha/);
    expect(res.aplicados.map((a) => a.id)).toEqual(['fala:sofia|Bola.', 'nome:tales|agatha', 'som:m', 'som:r']);
  });

  it('--seco não muda nada', () => {
    const r = repoFalso();
    const antes = readFileSync(join(r, 'web/public/audio/sons/mapa.json'), 'utf8');
    importarPacote(pacote(), { raiz: r, seco: true, masterizar: false, converter: false, log: () => {} });
    expect(readFileSync(join(r, 'web/public/audio/sons/mapa.json'), 'utf8')).toBe(antes);
    expect(existsSync(join(r, 'audio-fontes/voz-humana.json'))).toBe(false);
  });

  it('com masterização: a fala vai para audio-fontes e o aviso aparece se a masterização não roda', () => {
    const r = repoFalso();
    const res = importarPacote(pacote(), { raiz: r, masterizar: true, converter: false, log: () => {} });
    expect(ler(r, 'audio-fontes/falas/manifesto.json')['sofia|Bola.']).toMatch(/^sofia-humana-/);
    expect(ler(r, 'web/public/audio/falas/manifesto.json')['sofia|Bola.']).toBe('sofia-bola-m1.mp3'); // public/ é da masterização
    expect(res.masterizou).toBe(false);
    expect(res.avisos.join(' ')).toMatch(/masteriza/);
  });

  it('caminho de arquivo fora de audio/ é recusado', () => {
    const r = repoFalso();
    const zip = montarPacote([{ id: 'arquivo:index.html', dados: wav(5), mime: 'audio/mpeg', origem: 'arquivo', em: 0 }]).zip;
    expect(() => importarPacote(zip, { raiz: r, masterizar: false, converter: false, log: () => {} })).toThrow(/não permitido/);
  });
});
