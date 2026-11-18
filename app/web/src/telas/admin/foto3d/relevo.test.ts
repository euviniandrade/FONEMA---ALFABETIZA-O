import { describe, expect, it } from 'vitest';
import { caixaDaMascara, escreverGLB, montarRelevo, recortarFundo, slugItem } from './relevo.ts';

/** Foto sintética: fundo claro com um círculo vermelho (com um "buraco" amarelo no meio) e uma sujeirinha no canto. */
function foto(w = 80, h = 60, alfa = false) {
  const px = new Uint8Array(w * h * 4);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = (y * w + x) * 4;
    const d = Math.hypot(x - 40, y - 30);
    const [r, g, b] = d < 6 ? [250, 245, 240] : d < 20 ? [200, 40, 40] : x > 74 && y > 54 ? [10, 10, 10] : [245, 245, 240];
    px[i] = r; px[i + 1] = g; px[i + 2] = b; px[i + 3] = alfa ? (d < 20 ? 255 : 0) : 255;
  }
  return px;
}

describe('foto → 3D (relevo)', () => {
  it('separa o objeto do fundo pela cor da borda, tapa o buraco do meio e tira a sujeira', () => {
    const m = recortarFundo(foto(), 80, 60, 40);
    expect(m.px[30 * 80 + 40]).toBe(1); // o miolo claro (mesma cor do fundo) não vaza: fica dentro do objeto
    expect(m.px[30 * 80 + 25]).toBe(1);
    expect(m.px[2 * 80 + 2]).toBe(0);
    expect(m.px[58 * 80 + 78]).toBe(0); // sujeira no canto
    expect(caixaDaMascara(m)).toEqual({ x: 21, y: 11, w: 39, h: 39 });
  });

  it('PNG com transparência: vale o canal alfa', () => {
    const m = recortarFundo(foto(80, 60, true), 80, 60, 5);
    expect(m.px[30 * 80 + 40]).toBe(1);
    expect(m.px[0]).toBe(0);
  });

  it('a almofada tem altura 1, frente e verso, e borda fina', () => {
    const r = montarRelevo(recortarFundo(foto(), 80, 60), { espessura: 0.15, celulas: 40 });
    let ymin = Infinity, ymax = -Infinity, zmax = -Infinity, zmin = Infinity;
    for (let i = 0; i < r.pos.length; i += 3) { ymin = Math.min(ymin, r.pos[i + 1]); ymax = Math.max(ymax, r.pos[i + 1]); zmax = Math.max(zmax, r.pos[i + 2]); zmin = Math.min(zmin, r.pos[i + 2]); }
    expect(ymin).toBeGreaterThanOrEqual(-0.01);
    expect(ymax).toBeCloseTo(1, 1);
    expect(zmax).toBeGreaterThan(0.1);
    expect(zmin).toBeLessThan(-0.1);
    expect(r.idx.length % 6).toBe(0);
    for (const i of r.idx) expect(i).toBeLessThan(r.pos.length / 3);
    for (const u of r.uv) { expect(u).toBeGreaterThanOrEqual(0); expect(u).toBeLessThanOrEqual(1); }
  });

  it('grava um GLB válido (cabeçalho, JSON e binário alinhados)', () => {
    const r = montarRelevo(recortarFundo(foto(), 80, 60), { celulas: 24 });
    const glb = escreverGLB(r, new Uint8Array([0xff, 0xd8, 0xff, 0xd9, 1]), 'image/jpeg', 'bola');
    const v = new DataView(glb.buffer);
    expect(v.getUint32(0, true)).toBe(0x46546c67);
    expect(v.getUint32(8, true)).toBe(glb.length);
    const jl = v.getUint32(12, true);
    expect(jl % 4).toBe(0);
    const json = JSON.parse(new TextDecoder().decode(glb.slice(20, 20 + jl)));
    expect(json.meshes[0].primitives[0].attributes).toEqual({ POSITION: 0, NORMAL: 1, TEXCOORD_0: 2 });
    expect(json.images[0].mimeType).toBe('image/jpeg');
    expect(v.getUint32(20 + jl, true)).toBe(json.buffers[0].byteLength);
    for (const bv of json.bufferViews) expect(bv.byteOffset % 4).toBe(0);
  });

  it('nome de arquivo seguro', () => {
    expect(slugItem('Carrinho Azul da Vovó!')).toBe('carrinho-azul-da-vovo');
    expect(slugItem('***')).toBe('objeto');
  });
});
