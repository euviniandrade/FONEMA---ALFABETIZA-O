// FONEMA · Mundo 3D v2 — kit de modelagem procedural "estilo animação".
// Tudo arredondado (cantos chanfrados, normais suaves), cor por vértice e lotes que viram
// UMA malha por material (poucas draw calls). Sem dependências além do Three.js vendorizado.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';

// ---------- números ----------
export function rng(seed) {
  let a = (seed * 2654435761) >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export const lerp = (a, b, t) => a + (b - a) * t;
export const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
export const smooth = (t) => t * t * (3 - 2 * t);
export const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const easeOut = (t) => 1 - Math.pow(1 - t, 3);

// ruído 2D de valor (suave, determinístico) para terreno e copas
function hash2(x, y) { const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s); }
export function noise2(x, y) {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
  const u = smooth(xf), v = smooth(yf);
  return lerp(lerp(hash2(xi, yi), hash2(xi + 1, yi), u), lerp(hash2(xi, yi + 1), hash2(xi + 1, yi + 1), u), v);
}
export function fbm(x, y, o = 4) { let s = 0, a = 0.5, f = 1; for (let i = 0; i < o; i++) { s += a * noise2(x * f, y * f); f *= 2.03; a *= 0.5; } return s; }

// ---------- matrizes ----------
const _o = new THREE.Object3D();
export function M(x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = sx, sz = sx) {
  _o.position.set(x, y, z); _o.rotation.set(rx, ry, rz); _o.scale.set(sx, sy, sz);
  _o.updateMatrix(); return _o.matrix.clone();
}
/** Referencial local (um prédio): L(x,y,z,rx,ry,rz,sx,sy,sz) já posicionado e girado no mundo. */
export function F(x, y, z, ry = 0, s = 1) {
  const base = M(x, y, z, 0, ry, 0, s);
  const L = (...a) => base.clone().multiply(M(...a));
  L.base = base;
  L.pt = (lx, ly, lz) => new THREE.Vector3(lx, ly, lz).applyMatrix4(base);
  return L;
}

// ---------- geometrias base (cache) ----------
const cache = new Map();
const memo = (k, f) => { if (!cache.has(k)) cache.set(k, f()); return cache.get(k); };
/** Caixa de cantos arredondados com dimensões reais (o raio não deforma ao escalar). */
export const rbox = (w, h, d, r = 0.08, seg = 2) => memo(`rb${w.toFixed(3)},${h.toFixed(3)},${d.toFixed(3)},${r},${seg}`, () => new RoundedBoxGeometry(w, h, d, seg, Math.min(r, w / 2 - 1e-3, h / 2 - 1e-3, d / 2 - 1e-3)));
export const G = {
  cyl: memo('cyl', () => new THREE.CylinderGeometry(0.5, 0.5, 1, 20)),
  cyl10: memo('cyl10', () => new THREE.CylinderGeometry(0.5, 0.5, 1, 10)),
  cylTaper: memo('cylT', () => new THREE.CylinderGeometry(0.36, 0.5, 1, 12)),
  cone: memo('cone', () => new THREE.ConeGeometry(0.5, 1, 20)),
  cone8: memo('cone8', () => new THREE.ConeGeometry(0.5, 1, 8)),
  sph: memo('sph', () => new THREE.SphereGeometry(0.5, 20, 14)),
  sphLo: memo('sphLo', () => new THREE.SphereGeometry(0.5, 10, 7)),
  hemi: memo('hemi', () => new THREE.SphereGeometry(0.5, 20, 8, 0, Math.PI * 2, 0, Math.PI / 2)),
  torus: memo('torus', () => new THREE.TorusGeometry(0.5, 0.1, 10, 28)),
  capsule: memo('caps', () => new THREE.CapsuleGeometry(0.5, 1, 6, 14)),
  plane: memo('plane', () => new THREE.PlaneGeometry(1, 1)),
};
/** Telhado de duas águas com beiral e volume (prisma de cantos suaves). */
export const roofGeo = (w, h, d, over = 0.25) => memo(`roof${w},${h},${d},${over}`, () => {
  const s = new THREE.Shape();
  const W = w / 2 + over;
  s.moveTo(-W, 0); s.lineTo(W, 0); s.lineTo(0, h); s.lineTo(-W, 0);
  const g = new THREE.ExtrudeGeometry(s, { depth: d + over * 2, bevelEnabled: true, bevelThickness: 0.08, bevelSize: 0.08, bevelSegments: 2, curveSegments: 1 });
  g.translate(0, 0, -(d + over * 2) / 2);
  return g;
});
/** Telhado de 4 águas arredondado (pirâmide achatada). */
export const hipRoof = (w, h, d, over = 0.3) => memo(`hip${w},${h},${d},${over}`, () => {
  const g = new THREE.CylinderGeometry(0.02, Math.SQRT1_2, 1, 4, 2).rotateY(Math.PI / 4);
  g.scale(w + over * 2, h, d + over * 2); g.translate(0, h / 2, 0); return g;
});
/** "Nuvem" orgânica para copas, arbustos e nuvens: icosfera deformada por ruído, normais suaves. */
export function blobGeo(seed = 1, detail = 3, amp = 0.18, sq = 1) {
  return memo(`blob${seed},${detail},${amp},${sq}`, () => {
    let g = new THREE.IcosahedronGeometry(0.5, detail);
    g.deleteAttribute('normal'); g.deleteAttribute('uv');
    g = mergeVertices(g);
    const p = g.attributes.position, v = new THREE.Vector3();
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i).normalize();
      const n = fbm(v.x * 2.2 + seed * 3.1, v.z * 2.2 + v.y * 1.7 + seed, 3);
      const k = 0.5 * (1 + amp * (n * 2 - 1));
      p.setXYZ(i, v.x * k, v.y * k * sq, v.z * k);
    }
    g.computeVertexNormals();
    return g;
  });
}
/** Copa "de desenho animado": vários blobs fundidos (uma geometria só). */
export function canopyGeo(seed = 1, n = 5, detail = 2) {
  return memo(`can${seed},${n},${detail}`, () => {
    const r = rng(seed * 7 + 3), parts = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + r() * 0.6, rr = i === 0 ? 0 : 0.32 + r() * 0.12;
      const s = i === 0 ? 1 : 0.62 + r() * 0.22;
      const g = blobGeo(seed * 13 + i, detail, 0.22, 0.9).clone();
      g.applyMatrix4(M(Math.cos(a) * rr, i === 0 ? 0.08 : -0.06 + r() * 0.22, Math.sin(a) * rr, 0, r() * 6, 0, s));
      parts.push(g);
    }
    return mergeGeos(parts);
  });
}
export function mergeGeos(list) {
  let nv = 0, ni = 0;
  const norm = list.map((g) => { if (!g.index) g = mergeVertices(g); nv += g.attributes.position.count; ni += g.index.count; return g; });
  const pos = new Float32Array(nv * 3), nor = new Float32Array(nv * 3), idx = new Uint32Array(ni);
  let ov = 0, oi = 0;
  for (const g of norm) {
    if (!g.attributes.normal) g.computeVertexNormals();
    pos.set(g.attributes.position.array, ov * 3); nor.set(g.attributes.normal.array, ov * 3);
    const I = g.index.array; for (let k = 0; k < I.length; k++) idx[oi + k] = I[k] + ov;
    ov += g.attributes.position.count; oi += I.length;
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  out.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
  out.setIndex(new THREE.BufferAttribute(idx, 1));
  return out;
}

// ---------- Lote: junta peças em UMA malha com cor por vértice ----------
const _c = new THREE.Color(), _c2 = new THREE.Color(), _n3 = new THREE.Matrix3(), _v = new THREE.Vector3();
export class Lote {
  constructor(seed = 1) { this.r = rng(seed); this.parts = []; this.nv = 0; this.ni = 0; }
  /**
   * geo: geometria base · cor: hex · m: Matrix4
   * o.grad: escurece a base (0..1, "oclusão pintada") · o.jit: variação de tom por peça
   * o.top: cor do topo (degradê vertical) · o.fc(x,y,z,c): cor por vértice
   */
  add(geo, cor, m, o = {}) {
    if (!geo.index) geo = mergeVertices(geo);
    this.parts.push({ geo, cor, m: m || new THREE.Matrix4(), o, k: 1 + (this.r() * 2 - 1) * (o.jit ?? 0.035) });
    this.nv += geo.attributes.position.count; this.ni += geo.index.count;
    return this;
  }
  get vazio() { return !this.parts.length; }
  geometry() {
    const pos = new Float32Array(this.nv * 3), nor = new Float32Array(this.nv * 3), col = new Float32Array(this.nv * 3);
    const idx = new Uint32Array(this.ni);
    let ov = 0, oi = 0;
    for (const { geo, cor, m, o, k } of this.parts) {
      const P = geo.attributes.position, N = geo.attributes.normal, I = geo.index.array, cnt = P.count;
      _n3.getNormalMatrix(m);
      _c.set(cor); if (o.top) _c2.set(o.top);
      let minY = Infinity, maxY = -Infinity;
      if (o.grad || o.top) for (let i = 0; i < cnt; i++) { const y = P.getY(i); if (y < minY) minY = y; if (y > maxY) maxY = y; }
      for (let i = 0; i < cnt; i++) {
        _v.fromBufferAttribute(P, i).applyMatrix4(m); pos.set([_v.x, _v.y, _v.z], (ov + i) * 3);
        const wx = _v.x, wy = _v.y, wz = _v.z;
        if (N) { _v.fromBufferAttribute(N, i).applyMatrix3(_n3).normalize(); nor.set([_v.x, _v.y, _v.z], (ov + i) * 3); }
        let r = _c.r, g = _c.g, b = _c.b;
        const t = (o.grad || o.top) ? (P.getY(i) - minY) / Math.max(1e-5, maxY - minY) : 1;
        if (o.top) { r = lerp(r, _c2.r, t); g = lerp(g, _c2.g, t); b = lerp(b, _c2.b, t); }
        let f = k; if (o.grad) f *= (1 - o.grad) + o.grad * Math.sqrt(t);
        if (o.fc) { const cc = o.fc(wx, wy, wz, t); if (cc) { r = cc.r; g = cc.g; b = cc.b; } }
        col.set([r * f, g * f, b * f], (ov + i) * 3);
      }
      for (let j = 0; j < I.length; j++) idx[oi + j] = I[j] + ov;
      ov += cnt; oi += I.length;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    g.setIndex(new THREE.BufferAttribute(idx, 1));
    g.computeBoundingSphere(); g.computeBoundingBox();
    return g;
  }
  build(mat, { cast = true, receive = true } = {}) {
    const m = new THREE.Mesh(this.geometry(), mat);
    m.castShadow = cast; m.receiveShadow = receive; return m;
  }
}

// ---------- materiais "animação" ----------
/** Luz de recorte (rim) quente: dá o "brilho de borda" típico de filme de animação. */
export function addRim(mat, cor = '#FFE2B0', forca = 0.35, pot = 3.0) {
  const u = { uRim: { value: new THREE.Color(cor) }, uRimF: { value: forca } };
  const prev = mat.onBeforeCompile;
  mat.onBeforeCompile = (sh, r) => {
    prev && prev(sh, r);
    Object.assign(sh.uniforms, u);
    sh.fragmentShader = 'uniform vec3 uRim; uniform float uRimF;\n' + sh.fragmentShader.replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
      { float fr = pow(1.0 - clamp(dot(normalize(normal), normalize(vViewPosition)), 0.0, 1.0), ${pot.toFixed(1)});
        totalEmissiveRadiance += uRim * fr * uRimF; }`);
  };
  mat.userData.rim = u;
  const key = mat.customProgramCacheKey ? mat.customProgramCacheKey() : '';
  mat.customProgramCacheKey = () => key + 'rim' + pot;
  return mat;
}
/** Vento nas copas/flores/varais (balanço proporcional à altura local). */
export function addWind(mat, U, amp = 0.05, base = 1.5) {
  const prev = mat.onBeforeCompile;
  mat.onBeforeCompile = (sh, r) => {
    sh.uniforms.uTime = U.time;
    sh.vertexShader = 'uniform float uTime;\n' + sh.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
      { vec4 wp0 = modelMatrix * vec4(transformed, 1.0);
        #ifdef USE_INSTANCING
          wp0 = modelMatrix * instanceMatrix * vec4(transformed, 1.0);
        #endif
        float hh = max(0.0, wp0.y - ${base.toFixed(2)});
        float s = sin(uTime*1.3 + wp0.x*0.21 + wp0.z*0.17) + 0.4*sin(uTime*2.3 + wp0.x*0.7);
        transformed.x += s * hh * ${amp.toFixed(4)}; transformed.z += cos(uTime*1.05 + wp0.z*0.27) * hh * ${(amp * 0.6).toFixed(4)}; }`);
    prev && prev(sh, r);
  };
  const key = mat.customProgramCacheKey ? mat.customProgramCacheKey() : '';
  mat.customProgramCacheKey = () => key + 'wind' + amp + base;
  return mat;
}
export function matStd(o = {}) {
  return new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.72, metalness: 0, ...o });
}

// ---------- texturas de canvas ----------
export async function carregarFontes() {
  const ff = [['Fredoka', 'fonts/fredoka-latin-600-normal.woff2', '600'], ['Fredoka', 'fonts/fredoka-latin-700-normal.woff2', '700'], ['Andika', 'fonts/andika-latin-700-normal.woff2', '700'], ['Andika', 'fonts/andika-latin-400-normal.woff2', '400']];
  const base = new URL('../', import.meta.url);
  await Promise.all(ff.map(async ([fam, url, w]) => {
    try { const f = new FontFace(fam, `url(${new URL(url, base)})`, { weight: w }); await f.load(); document.fonts.add(f); } catch (e) { /* segue com a fonte do sistema */ }
  }));
}
export function canvasTex(w, h, draw, { srgb = true, aniso = 4 } = {}) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d'); draw(g, w, h);
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = aniso; return t;
}
export function roundRect(g, x, y, w, h, r) {
  g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
}
/** Placa de madeira com palavra decodificável (Andika 700, a de um andar). */
export function placaTex(texto, { fundo = '#FFF6E3', borda = '#7A4A2A', tinta = '#2E3A66', icone = null, w = 512, h = 200 } = {}) {
  return canvasTex(w, h, (g) => {
    roundRect(g, 6, 6, w - 12, h - 12, 38); g.fillStyle = borda; g.fill();
    roundRect(g, 20, 20, w - 40, h - 40, 28); g.fillStyle = fundo; g.fill();
    g.fillStyle = tinta; g.textAlign = 'center'; g.textBaseline = 'middle';
    let fs = 118; g.font = `700 ${fs}px Andika, Fredoka, sans-serif`;
    while (g.measureText(texto).width > w - (icone ? 170 : 90) && fs > 40) { fs -= 4; g.font = `700 ${fs}px Andika, Fredoka, sans-serif`; }
    const x = icone ? w / 2 + 40 : w / 2;
    g.fillText(texto, x, h / 2 + 6);
    if (icone) { g.font = `${Math.round(h * 0.42)}px sans-serif`; g.fillText(icone, 92, h / 2 + 4); }
  });
}
export function radialTex(c0 = 'rgba(255,255,255,1)', c1 = 'rgba(255,255,255,0)', s = 128) {
  return canvasTex(s, s, (g) => { const gr = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2); gr.addColorStop(0, c0); gr.addColorStop(1, c1); g.fillStyle = gr; g.fillRect(0, 0, s, s); });
}
