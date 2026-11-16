import { describe, expect, it } from 'vitest';
import { fatiar, grupoDe } from './regras.ts';

describe('cache do aparelho: grupos', () => {
  it('mídia vai para o cache sob demanda; casca e manifestos não', () => {
    expect(grupoDe('audio/falas/sofia-abc-m1.mp3')).toBe('voz');
    expect(grupoDe('./audio/nomes/sofia/alice-m1.mp3')).toBe('voz');
    expect(grupoDe('audio/sons/a.mp3')).toBe('voz');
    expect(grupoDe('assets/audio/clique.mp3')).toBe('voz');
    expect(grupoDe('assets/figuras/abelha.webp')).toBe('figuras');
    expect(grupoDe('assets/vivos/bocas.json')).toBe('figuras');
    expect(grupoDe('assets/arte/hero-loop.mp4')).toBe('video');
    expect(grupoDe('assets/vivos/corpo/sofia.webm')).toBe('video');
    expect(grupoDe('assets/modelos3d/tales.glb?x=1')).toBe('modelos');
    expect(grupoDe('mundo3d/index.html')).toBe('paginas3d');
    expect(grupoDe('espelho/espelho3d.js')).toBe('paginas3d');
    // casca: fica no precache
    expect(grupoDe('audio/falas/manifesto.json')).toBeNull();
    expect(grupoDe('audio/sons/mapa.json')).toBeNull();
    expect(grupoDe('assets/fontes/andika-latin-400-normal.woff2')).toBeNull();
    expect(grupoDe('assets/index-AbCd1234.js')).toBeNull();
    expect(grupoDe('index.html')).toBeNull();
  });
});

describe('cache do aparelho: pedidos com Range (áudio e vídeo)', () => {
  const inteiro = () => new Response(new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]), { status: 200, headers: { 'Content-Type': 'audio/mpeg' } });
  const bytes = async (r: Response) => Array.from(new Uint8Array(await r.arrayBuffer()));
  it('sem Range devolve a resposta inteira', async () => {
    const r = await fatiar(inteiro(), null);
    expect(r.status).toBe(200);
    expect((await bytes(r)).length).toBe(10);
  });
  it('bytes=0- devolve tudo como 206', async () => {
    const r = await fatiar(inteiro(), 'bytes=0-');
    expect(r.status).toBe(206);
    expect(r.headers.get('Content-Range')).toBe('bytes 0-9/10');
    expect(r.headers.get('Content-Type')).toBe('audio/mpeg');
    expect((await bytes(r)).length).toBe(10);
  });
  it('pedaço do meio, pedaço final e fim além do tamanho', async () => {
    expect(await bytes(await fatiar(inteiro(), 'bytes=2-4'))).toEqual([2, 3, 4]);
    const fim = await fatiar(inteiro(), 'bytes=-3');
    expect(fim.headers.get('Content-Range')).toBe('bytes 7-9/10');
    expect(await bytes(fim)).toEqual([7, 8, 9]);
    expect(await bytes(await fatiar(inteiro(), 'bytes=8-100'))).toEqual([8, 9]);
  });
  it('começo depois do fim responde 416; Range estranho fica sem corte', async () => {
    expect((await fatiar(inteiro(), 'bytes=20-')).status).toBe(416);
    expect((await fatiar(inteiro(), 'items=1-2')).status).toBe(200);
  });
});
