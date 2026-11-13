// FONEMA · Mundo 3D — utilitários: aleatório determinístico, "Merger" (junta peças
// low-poly em UMA malha com cor por vértice = 1 draw call por camada) e primitivas.
import * as THREE from 'three';

export function rng(seed) {
  let a = (seed * 2654435761) >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Ruído radial suave (borda orgânica das ilhas)
export function radialNoise(seed, amp = 1) {
  const r = rng(seed);
  const terms = [2, 3, 4, 6, 9].map((k) => ({ k, a: (0.02 + r() * 0.045) * amp * (k < 5 ? 1 : 0.45), p: r() * Math.PI * 2 }));
  return (th) => terms.reduce((s, t) => s + t.a * Math.sin(t.k * th + t.p), 0);
}

export function jitterRadial(geo, f) {
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), z = p.getZ(i);
    if (x === 0 && z === 0) continue;
    const k = 1 + f(Math.atan2(z, x));
    p.setX(i, x * k); p.setZ(i, z * k);
  }
  return geo;
}

const _o = new THREE.Object3D();
export function M(x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = sx, sz = sx) {
  _o.position.set(x, y, z); _o.rotation.set(rx, ry, rz); _o.scale.set(sx, sy, sz);
  _o.updateMatrix(); return _o.matrix.clone();
}
// Referencial local (prédios): F(x,y,z,ry) devolve função L(...) com mesma assinatura de M
export function F(x, y, z, ry = 0, s = 1) {
  const base = M(x, y, z, 0, ry, 0, s);
  const L = (...a) => base.clone().multiply(M(...a));
  L.base = base;
  L.pt = (lx, ly, lz) => new THREE.Vector3(lx, ly, lz).applyMatrix4(base);
  return L;
}

// Geometrias base (reutilizadas; o Merger clona)
export const G = {
  box: new THREE.BoxGeometry(1, 1, 1),
  cyl5: new THREE.CylinderGeometry(0.5, 0.5, 1, 5),
  cyl6: new THREE.CylinderGeometry(0.5, 0.5, 1, 6),
  cyl8: new THREE.CylinderGeometry(0.5, 0.5, 1, 8),
  cyl12: new THREE.CylinderGeometry(0.5, 0.5, 1, 12),
  cyl16: new THREE.CylinderGeometry(0.5, 0.5, 1, 16),
  cyl24: new THREE.CylinderGeometry(0.5, 0.5, 1, 24),
  taper6: new THREE.CylinderGeometry(0.32, 0.5, 1, 6),
  cone3: new THREE.ConeGeometry(0.5, 1, 3),
  cone4: new THREE.ConeGeometry(0.5, 1, 4),
  cone5: new THREE.ConeGeometry(0.5, 1, 5),
  cone6: new THREE.ConeGeometry(0.5, 1, 6),
  cone8: new THREE.ConeGeometry(0.5, 1, 8),
  cone12: new THREE.ConeGeometry(0.5, 1, 12),
  ico0: new THREE.IcosahedronGeometry(0.5, 0),
  ico1: new THREE.IcosahedronGeometry(0.5, 1),
  dode: new THREE.DodecahedronGeometry(0.5, 0),
  sph: new THREE.SphereGeometry(0.5, 10, 7),
  hemi: new THREE.SphereGeometry(0.5, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2),
  torus: new THREE.TorusGeometry(0.5, 0.12, 6, 14),
  prism: (() => { // telhado de duas águas: base 1×1, altura 1
    const s = new THREE.Shape(); s.moveTo(-0.5, 0); s.lineTo(0.5, 0); s.lineTo(0, 1); s.lineTo(-0.5, 0);
    const g = new THREE.ExtrudeGeometry(s, { depth: 1, bevelEnabled: false }); g.translate(0, 0, -0.5); return g;
  })(),
  tri: (() => { // triângulo plano (bandeira de progresso)
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute([-0.5, 0, 0, 0.5, 0, 0, 0, -1, 0], 3)); return g;
  })(),
  halfcyl: new THREE.CylinderGeometry(0.5, 0.5, 1, 10, 1, false, 0, Math.PI),
};
G.pyr = G.cone4.clone().rotateY(Math.PI / 4); // pirâmide alinhada (telhado 4 águas)

const _c = new THREE.Color();
export class Merger {
  constructor(seed = 1) { this.pos = []; this.col = []; this.r = rng(seed); }
  /**
   * @param geo geometria base  @param color hex/string  @param m Matrix4
   * opt.jitter variação de tom por face (aspecto "pintado"), opt.grad escurece a base (0..1),
   * opt.fc(cx,cy,cz) -> THREE.Color : cor por face (terreno)
   */
  add(geo, color, m, opt = {}) {
    const g = geo.index ? geo.toNonIndexed() : geo.clone();
    if (m) g.applyMatrix4(m);
    const p = g.attributes.position.array;
    const base = new THREE.Color(color);
    const jit = opt.jitter ?? 0.05, grad = opt.grad ?? 0;
    let minY = Infinity, maxY = -Infinity;
    if (grad) for (let i = 1; i < p.length; i += 3) { minY = Math.min(minY, p[i]); maxY = Math.max(maxY, p[i]); }
    for (let i = 0; i < p.length; i += 9) {
      const k = 1 + (this.r() * 2 - 1) * jit;
      let c = base;
      if (opt.fc) c = opt.fc((p[i] + p[i + 3] + p[i + 6]) / 3, (p[i + 1] + p[i + 4] + p[i + 7]) / 3, (p[i + 2] + p[i + 5] + p[i + 8]) / 3) || base;
      for (let v = 0; v < 3; v++) {
        let f = k;
        if (grad) { const t = (p[i + v * 3 + 1] - minY) / Math.max(1e-4, maxY - minY); f *= (1 - grad) + grad * t; }
        this.col.push(c.r * f, c.g * f, c.b * f);
        this.pos.push(p[i + v * 3], p[i + v * 3 + 1], p[i + v * 3 + 2]);
      }
    }
    g.dispose();
    return this;
  }
  get tris() { return this.pos.length / 9; }
  build(mat, { cast = true, receive = true } = {}) {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(this.pos, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(this.col, 3));
    g.computeVertexNormals(); g.computeBoundingSphere();
    const mesh = new THREE.Mesh(g, mat);
    mesh.castShadow = cast; mesh.receiveShadow = receive;
    return mesh;
  }
}

export const lerp = (a, b, t) => a + (b - a) * t;
export const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
export const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const smooth = (t) => t * t * (3 - 2 * t);
