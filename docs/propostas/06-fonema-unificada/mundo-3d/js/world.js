// FONEMA · Mundo 3D — arquipélago: céu, mar estilizado, 10 ilhas-bioma, rotas, nuvens, barco, balão
import * as THREE from 'three';
import { G, M, F, rng, Merger } from './util.js';
import * as N from './nature.js';
import { letterTexture, labelTexture, PAL } from './art.js';

export const ISLANDS = [
  { id: 'vila', nome: 'Vila da Sofia', x: 0, z: 0, r: 44, H: 2.5, status: 'feita', grass: '#7CC46A', grass2: '#69B35B' },
  { id: 'vogais', nome: 'Ilha das Vogais', x: 68, z: 26, r: 15, H: 2.0, status: 'feita', grass: '#93D27C', grass2: '#A6DA86', beach: 1.25 },
  { id: 'mata', nome: 'Mata Atlântica', x: 114, z: -34, r: 23, H: 3.0, status: 'atual', grass: '#3E9A57', grass2: '#4FAA5F' },
  { id: 'pampa', nome: 'Pampa', x: 78, z: -102, r: 21, H: 2.2, status: 'proxima', grass: '#A6D46C', grass2: '#B5DC7A' },
  { id: 'pantanal', nome: 'Pantanal', x: -4, z: -124, r: 23, H: 1.5, status: 'bloqueada', grass: '#7CC06A', grass2: '#8ECB72' },
  { id: 'cerrado', nome: 'Cerrado', x: -82, z: -82, r: 20, H: 2.6, status: 'bloqueada', grass: '#CDB55C', grass2: '#BBA34E', dirt: '#B0532E', dirt2: '#C86C3D' },
  { id: 'caatinga', nome: 'Caatinga', x: -112, z: -12, r: 19, H: 2.8, status: 'bloqueada', grass: '#D9BA7C', grass2: '#CDAA68', dirt: '#A0643A', dirt2: '#BC8350' },
  { id: 'amazonia', nome: 'Amazônia', x: -118, z: -168, r: 28, H: 2.4, status: 'bloqueada', grass: '#2F8A47', grass2: '#3A9A50' },
  { id: 'litoral', nome: 'Litoral e Mar', x: -6, z: -214, r: 19, H: 1.8, status: 'bloqueada', grass: '#9BD67A', grass2: '#8CCB6E', beach: 1.4 },
  { id: 'cidade', nome: 'Cidade das Letras', x: 104, z: -190, r: 22, H: 2.6, status: 'bloqueada', grass: '#8FCB7A', grass2: '#9AD184' },
  { id: 'livros', nome: 'Arquipélago dos Livros', x: 186, z: -120, r: 16, H: 2.4, status: 'bloqueada', grass: '#A7D98A', grass2: '#B6E096' },
];
export const EXTRA_ISLETS = [{ x: 206, z: -96, r: 7, H: 1.8 }, { x: 200, z: -146, r: 6, H: 1.6 }];

// ---------------- CÉU ----------------
export function makeSky() {
  const u = {
    top: { value: new THREE.Color('#4FA8E0') }, mid: { value: new THREE.Color('#9FD3EE') }, hor: { value: new THREE.Color('#FCEBCB') },
    sunDir: { value: new THREE.Vector3(0.4, 0.5, 0.3).normalize() }, sunCol: { value: new THREE.Color('#FFF2CF') }, sunGlow: { value: 0.35 },
  };
  const mat = new THREE.ShaderMaterial({
    uniforms: u, side: THREE.BackSide, depthWrite: false, fog: false,
    vertexShader: `varying vec3 vDir; void main(){ vDir = normalize(position); vec4 p = modelViewMatrix*vec4(position,1.); gl_Position = projectionMatrix*p; gl_Position.z = gl_Position.w; }`,
    fragmentShader: `uniform vec3 top, mid, hor, sunDir, sunCol; uniform float sunGlow; varying vec3 vDir;
      void main(){ float h = vDir.y;
        vec3 c = mix(hor, mid, smoothstep(0.0, 0.18, h)); c = mix(c, top, smoothstep(0.18, 0.7, h));
        c = mix(c, hor*0.98, smoothstep(0.0, -0.2, h));
        float s = max(dot(normalize(vDir), normalize(sunDir)), 0.0);
        c += sunCol * (pow(s, 6.0) * sunGlow + pow(s, 900.0) * 1.2);
        gl_FragColor = vec4(c, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  });
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(2400, 32, 16), mat);
  mesh.frustumCulled = false; mesh.renderOrder = -10;
  return { mesh, u };
}

// ---------------- MAR ESTILIZADO ----------------
export function makeSea(islands) {
  const isl = islands.map((i) => new THREE.Vector4(i.x, i.z, i.r * (i.beach || 1.15) * 1.08, 0));
  while (isl.length < 16) isl.push(new THREE.Vector4(99999, 99999, 0, 0));
  const u = {
    uTime: { value: 0 }, uIsl: { value: isl },
    uDeep: { value: new THREE.Color('#1B8DB3') }, uMid: { value: new THREE.Color('#29AFC4') }, uShallow: { value: new THREE.Color('#6FDCD3') },
    uFoam: { value: new THREE.Color('#F4FFF8') }, uSunDir: { value: new THREE.Vector3(0.4, 0.6, 0.3).normalize() }, uSunCol: { value: new THREE.Color('#FFF6E0') },
    uFogColor: { value: new THREE.Color('#FCEBCB') }, uFogNear: { value: 200 }, uFogFar: { value: 900 }, uGlint: { value: 1 },
  };
  const mat = new THREE.ShaderMaterial({
    uniforms: u, extensions: { derivatives: true },
    vertexShader: `uniform float uTime; varying vec3 vW; varying float vDepth;
      void main(){ vec4 w = modelMatrix*vec4(position,1.);
        float t = uTime;
        w.y += sin(w.x*0.07 + t*1.1)*0.28 + sin(w.z*0.09 - t*0.9)*0.24 + sin((w.x+w.z)*0.045 + t*0.6)*0.35;
        vW = w.xyz; vec4 mv = viewMatrix*w; vDepth = -mv.z; gl_Position = projectionMatrix*mv; }`,
    fragmentShader: `uniform float uTime, uFogNear, uFogFar, uGlint; uniform vec4 uIsl[16];
      uniform vec3 uDeep, uMid, uShallow, uFoam, uSunDir, uSunCol, uFogColor; varying vec3 vW; varying float vDepth;
      float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
      void main(){
        float d = 1e5;
        for(int i=0;i<16;i++){ float dd = length(vW.xz - uIsl[i].xy) - uIsl[i].z; d = min(d, dd); }
        vec3 n = normalize(cross(dFdx(vW), dFdy(vW))); if(n.y<0.) n=-n;
        float sh = 1.0 - smoothstep(0.0, 15.0, d);
        vec3 c = mix(uDeep, uMid, smoothstep(0.0, 1.0, 1.0 - smoothstep(0.0, 45.0, d)));
        c = mix(c, uShallow, sh*sh);
        float lit = 0.88 + 0.12*dot(n, normalize(uSunDir));
        c *= lit;
        // espuma na beira + anéis que se afastam
        float foam = 1.0 - smoothstep(0.0, 1.6, abs(d - 0.6 - 0.5*sin(uTime*1.3 + vW.x*0.05)));
        float ring = fract(d*0.11 - uTime*0.18); float rings = smoothstep(0.86, 0.93, ring)*(1.0 - smoothstep(0.93, 1.0, ring))*(1.0 - smoothstep(1.0, 11.0, d));
        c = mix(c, uFoam, clamp(foam*0.9 + rings*0.3, 0.0, 1.0));
        // brilho do sol (facetas) + cintilas estilizadas
        vec3 V = normalize(cameraPosition - vW); vec3 H = normalize(normalize(uSunDir) + V);
        float spec = pow(max(dot(n, H), 0.0), 140.0);
        vec2 cell = floor(vW.xz/3.0); float hsh = hash(cell);
        float tw = step(0.93, hsh) * pow(max(0.0, sin(uTime*2.2 + hsh*40.0)), 6.0);
        vec2 f = fract(vW.xz/3.0) - 0.5; float star = (1.0 - smoothstep(0.0, 0.12, abs(f.x)*abs(f.y)*40.0 + length(f)*0.6));
        c += uSunCol * (spec*0.55 + tw*star*0.7*uGlint) * (1.0 - smoothstep(150.0, 600.0, vDepth));
        float fg = smoothstep(uFogNear, uFogFar, vDepth);
        c = mix(c, uFogColor, fg);
        gl_FragColor = vec4(c, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  });
  const g = new THREE.PlaneGeometry(2600, 2600, 300, 300); g.rotateX(-Math.PI / 2);
  const mesh = new THREE.Mesh(g, mat); mesh.position.set(30, 0, -90); mesh.receiveShadow = false;
  return { mesh, u };
}

// ---------------- ILHAS-BIOMA ----------------
export function buildIslands(ctx) {
  const { m, d, f, w, group, renderer, dyn, labelSprites } = ctx;
  for (const I of ISLANDS) {
    const rnd = rng(I.x * 13 + I.z * 7 + 99);
    const occ = [];
    const GY = I.H;
    if (I.id !== 'vila') N.islandTerrain(m, { ...I, seed: Math.abs(I.x * 3 + I.z) + 5, flat: false });
    const free = (x, z, r) => Math.hypot(x - I.x, z - I.z) < I.r - 1.5 - r && occ.every(([a, b, c]) => Math.hypot(x - a, z - b) > c + r);
    const scatter = (n, rad, fn, tries = 30) => {
      let k = 0; for (let i = 0; i < n * tries && k < n; i++) {
        const a = rnd() * 6.28, rr = Math.sqrt(rnd()) * (I.r - 2), x = I.x + Math.cos(a) * rr, z = I.z + Math.sin(a) * rr;
        if (!free(x, z, rad)) continue; occ.push([x, z, rad]); fn(x, z, k++);
      }
    };
    const at = (lx, lz) => [I.x + lx, I.z + lz];
    const B = BIOMES[I.id];
    if (B) B({ I, m, f, d, w, group, renderer, rnd, occ, scatter, at, GY, dyn, free });
    // pedras na praia
    for (let i = 0; i < Math.round(I.r / 3); i++) { const a = rnd() * 6.28, rr = I.r * (1.03 + rnd() * 0.12); N.rock(d, I.x + Math.cos(a) * rr, 0.1, I.z + Math.sin(a) * rr, 0.6 + rnd(), '#CDBFA8', rnd); }
    // bandeirola de progresso (ilhas concluídas / atual)
    if (I.status === 'feita' || I.status === 'atual') {
      const fx = I.x + I.r * 0.62, fz = I.z + I.r * 0.55;
      const [px, pz] = I.id === 'vila' ? [36, 18] : [fx, fz];
      m.add(G.cyl6, '#FFFBF4', M(px, GY + 4, pz, 0, 0, 0, 0.3, 8, 0.3));
      m.add(G.ico1, '#F2B33D', M(px, GY + 8.2, pz, 0, 0, 0, 0.6));
      const flag = new Merger(5); flag.add(G.box, I.status === 'atual' ? '#B23C62' : '#F2B33D', M(1.6, 0, 0, 0, 0, 0, 3.2, 2.0, 0.06), { jitter: 0 });
      flag.add(G.box, '#FFFBF4', M(1.6, 0, 0.04, 0, 0, Math.PI / 4, 0.8, 0.8, 0.06), { jitter: 0 });
      const fm = flag.build(ctx.flagMat, { cast: true }); fm.position.set(px, GY + 7.0, pz); group.add(fm); dyn.flags.push(fm);
    }
    // rótulo
    const t = labelTexture(I.nome, I.status, renderer);
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, sizeAttenuation: false, depthTest: false, transparent: true, toneMapped: false }));
    const hh = 0.04; sp.scale.set(hh * t.userData.aspect, hh, 1); sp.center.set(0.5, 0);
    if (I.id === 'vila') sp.position.set(-16, 13, -36); else sp.position.set(I.x, GY + 5, I.z - I.r * 0.8); sp.renderOrder = 10;
    group.add(sp); labelSprites.push(sp);
  }
  for (const E of EXTRA_ISLETS) {
    N.islandTerrain(m, { ...E, seed: E.x + 3, grass: '#A7D98A', grass2: '#B6E096' });
    const rnd = rng(E.x); const f = ctx.f;
    N.palm(f, E.x, E.H, E.z, 1.2, rnd, 0.3);
    bookStack(m, E.x + 2.5, E.H, E.z + 1, rnd, 4);
  }
}

const bookCols = ['#B23C62', '#1F6E82', '#F2B33D', '#2F8A49', '#6B5BA8', '#E07F62'];
function bookStack(m, x, y, z, rnd, n = 5, s = 1) {
  for (let i = 0; i < n; i++) {
    const ang = rnd() * 0.8;
    m.add(G.box, bookCols[Math.floor(rnd() * 6)], M(x, y + (0.4 + i * 0.75) * s, z, 0, ang, 0, (3 - i * 0.2) * s, 0.72 * s, 2.2 * s));
    m.add(G.box, '#FFF4E2', M(x + 0.08 * s, y + (0.4 + i * 0.75) * s, z, 0, ang, 0, (2.85 - i * 0.2) * s, 0.55 * s, 2.24 * s));
  }
}
function house(m, w, x, y, z, ry, wall, roof, s = 1) {
  const L = F(x, y, z, ry, s);
  m.add(G.box, wall, L(0, 1.3, 0, 0, 0, 0, 3.2, 2.6, 2.6), { grad: 0.12 });
  m.add(G.prism, roof, L(0, 2.6, 0, 0, Math.PI / 2, 0, 3.3, 1.4, 3.8));
  m.add(G.box, '#1F6E82', L(0, 0.85, 1.32, 0, 0, 0, 0.8, 1.6, 0.08));
  w.add(G.box, '#F7D38A', L(1.0, 1.5, 1.32, 0, 0, 0, 0.6, 0.6, 0.06));
  w.add(G.box, '#F7D38A', L(-1.0, 1.5, 1.32, 0, 0, 0, 0.6, 0.6, 0.06));
}

const BIOMES = {
  vogais({ I, m, f, d, group, renderer, rnd, scatter, GY, occ }) {
    const letters = ['A', 'E', 'I', 'O', 'U'];
    const cols = ['#6B5BA8', '#7D6BC0', '#5E4E9C', '#8A78C9', '#6B5BA8'];
    letters.forEach((L, i) => {
      const x = I.x - 6 + i * 3.0, z = I.z + 3 - Math.abs(i - 2) * 1.2;
      const mat = new THREE.MeshStandardMaterial({ map: letterTexture(L, cols[i], renderer), roughness: 0.7 });
      const b = new THREE.Mesh(new THREE.BoxGeometry(2.6, 2.6, 2.6), mat);
      b.position.set(x, GY + 1.3 + (i % 2) * 0.0, z); b.rotation.y = (i - 2) * -0.12 + (rnd() - 0.5) * 0.2; b.castShadow = b.receiveShadow = true; group.add(b);
      occ.push([x, z, 2.2]);
      // gota lilás no topo
      m.add(G.ico1, '#A797D6', M(x, GY + 3.05, z, 0, 0, 0, 0.7, 0.9, 0.7)); m.add(G.cone8, '#A797D6', M(x, GY + 3.6, z, 0, 0, 0, 0.52, 0.6, 0.52));
    });
    // tendas listradas
    [[-6, -6, '#F2B33D'], [6, -7, '#B23C62']].forEach(([a, b, c]) => {
      const x = I.x + a, z = I.z + b; occ.push([x, z, 2.2]);
      m.add(G.cone8, c, M(x, GY + 1.6, z, 0, 0, 0, 4, 3.2, 4), { grad: 0.2 }); m.add(G.cone8, '#FFFBF4', M(x, GY + 1.61, z, 0, Math.PI / 8, 0, 3.9, 3.18, 3.9));
      m.add(G.box, '#7A4B2E', M(x, GY + 0.6, z + 1.5, 0, 0, 0, 0.9, 1.2, 0.3));
    });
    scatter(6, 1.6, (x, z) => N.palm(f, x, GY, z, 1.05 + rnd() * 0.3, rnd, 0.35));
    scatter(40, 0.4, (x, z, k) => N.flower(d, x, GY, z, ['#A797D6', '#F2B33D', '#FFFBF4'][k % 3], rnd, 1.1));
  },
  mata({ I, m, f, d, w, group, rnd, scatter, GY, occ }) {
    const mx = I.x - 4, mz = I.z - 6; occ.push([mx, mz, 9]);
    m.add(G.cone8, '#3E8A4E', M(mx, GY + 6.5, mz, 0, 0.3, 0, 20, 13, 18), { grad: 0.35, jitter: 0.08 });
    m.add(G.cone8, '#8E8A80', M(mx, GY + 11.8, mz, 0, 0.3, 0, 6.8, 3.6, 6.2), { grad: 0.3 });
    m.add(G.cone5, '#4C9A5A', M(mx + 7, GY + 4, mz + 2, 0, 0.8, 0, 11, 8, 10), { grad: 0.35 });
    // cachoeira
    const wf = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 9), new THREE.MeshStandardMaterial({ color: '#CFF3F7', emissive: '#7FD3E0', emissiveIntensity: 0.2, roughness: 0.3 }));
    wf.position.set(mx + 2.5, GY + 4.6, mz + 7.2); wf.rotation.x = -0.48; group.add(wf);
    m.add(G.cyl16, '#8FE0E8', M(mx + 2.8, GY + 0.1, mz + 10.5, 0, 0, 0, 6, 0.2, 4), { jitter: 0.02 });
    d.add(G.ico1, '#F4FFF8', M(mx + 2.7, GY + 0.35, mz + 9.2, 0, 0, 0, 2.4, 0.6, 1.2));
    occ.push([mx + 2.8, mz + 10.5, 3.2]);
    scatter(34, 1.8, (x, z, k) => N.treeRound(f, x, GY, z, 0.9 + rnd() * 0.6, ['#2F8A49', '#3B9A52', '#2A7E43'][k % 3], '#2F7D45', rnd));
    scatter(10, 1.5, (x, z) => N.palm(f, x, GY, z, 1.0 + rnd() * 0.3, rnd, 0.15));
    scatter(30, 0.4, (x, z) => { d.add(G.cone5, '#E04A5A', M(x, GY + 0.4, z, 0, rnd(), 0, 0.5, 0.8, 0.5)); d.add(G.cone5, '#4F9A48', M(x, GY + 0.3, z, 0, rnd(), 0, 0.8, 0.5, 0.8)); });
    // anel "você está aqui"
    const ring = new THREE.Mesh(new THREE.RingGeometry(3.2, 4.0, 48), new THREE.MeshBasicMaterial({ color: '#F2B33D', transparent: true, opacity: 0.9 }));
    ring.rotation.x = -Math.PI / 2; ring.position.set(I.x + 9, GY + 0.35, I.z + 10); group.add(ring);
    occ.push([I.x + 9, I.z + 10, 4.5]);
    ctxPins.push(new THREE.Vector3(I.x + 9, GY, I.z + 10));
  },
  pampa({ I, m, f, d, group, rnd, scatter, GY, occ, dyn }) {
    // cata-vento (pás animadas)
    const wx = I.x + 5, wz = I.z - 3; occ.push([wx, wz, 2]);
    m.add(G.taper6, '#FFFBF4', M(wx, GY + 4.5, wz, 0, 0, 0, 1.1, 9, 1.1));
    m.add(G.cone6, '#A9472A', M(wx, GY + 9.4, wz, 0, 0, 0, 1.4, 1.0, 1.4));
    const blades = new Merger(3);
    for (let i = 0; i < 4; i++) blades.add(G.box, i % 2 ? '#FFFBF4' : '#F2B33D', M(0, 0, 0, 0, 0, i * Math.PI / 2, 0.55, 7.5, 0.08).multiply(M(0, 0.5, 0)), { jitter: 0 });
    const bm = blades.build(dyn.flagMat); bm.position.set(wx, GY + 8.6, wz + 0.8); group.add(bm); dyn.windmills.push(bm);
    // galpão vermelho
    house(m, d, I.x - 7, GY, I.z + 3, 0.5, '#C2553A', '#7A4B2E', 1.4);
    occ.push([I.x - 7, I.z + 3, 4]);
    // cercas
    for (let i = 0; i < 14; i++) { const x = I.x - 12 + i * 1.9, z = I.z + 10; m.add(G.cyl5, '#8A5A3B', M(x, GY + 0.6, z, 0, 0, 0, 0.18, 1.2, 0.18)); }
    m.add(G.box, '#A86F3F', M(I.x - 12 + 13 * 0.95, GY + 0.9, I.z + 10, 0, 0, 0, 24.7, 0.14, 0.1));
    m.add(G.box, '#A86F3F', M(I.x - 12 + 13 * 0.95, GY + 0.5, I.z + 10, 0, 0, 0, 24.7, 0.14, 0.1));
    scatter(6, 3.0, (x, z) => N.araucaria(f, x, GY, z, 1.2 + rnd() * 0.4, rnd));
    scatter(12, 1.0, (x, z) => N.sheep(m, x, GY, z, rnd() * 6, rnd));
    scatter(60, 0.3, (x, z) => N.tuft(d, x, GY, z, 1.1, '#93C25A', rnd));
  },
  pantanal({ I, m, f, d, rnd, scatter, GY, occ }) {
    [[-6, -4, 7, 5], [7, 5, 6, 4.5], [-2, 9, 4, 3]].forEach(([a, b, rx, rz]) => {
      const x = I.x + a, z = I.z + b; occ.push([x, z, Math.max(rx, rz)]);
      m.add(G.cyl16, '#BFAF87', M(x, GY + 0.04, z, 0, rnd(), 0, rx * 2.2, 0.12, rz * 2.2), { jitter: 0.05 });
      m.add(G.cyl16, '#4DB7C9', M(x, GY + 0.1, z, 0, rnd(), 0, rx * 2, 0.12, rz * 2), { jitter: 0.02 });
      for (let i = 0; i < 5; i++) d.add(G.cyl8, '#5DAA4E', M(x + (rnd() - 0.5) * rx, GY + 0.19, z + (rnd() - 0.5) * rz, 0, 0, 0, 0.9, 0.04, 0.9));
    });
    scatter(5, 1.2, (x, z) => N.tuiuiu(m, x, GY, z, rnd() * 6));
    scatter(5, 1.0, (x, z) => N.capybara(m, x, GY, z, rnd() * 6));
    scatter(10, 1.5, (x, z) => N.palm(f, x, GY, z, 1.1 + rnd() * 0.3, rnd, 0.1));
    scatter(8, 1.8, (x, z) => N.treeRound(f, x, GY, z, 0.9 + rnd() * 0.3, '#6DB85C', '#5DA851', rnd));
    scatter(60, 0.3, (x, z) => N.tuft(d, x, GY, z, 1.2, '#5DAA4E', rnd));
  },
  cerrado({ I, m, f, d, rnd, scatter, GY }) {
    scatter(8, 2.0, (x, z, k) => { N.treeIpe(f, x, GY, z, 1.0 + rnd() * 0.4, k % 2 ? '#F6C945' : '#E77FB0', rnd); N.petals(d, x, GY, z, 1, k % 2 ? '#F8D86A' : '#F2A5C8', rnd, 8); });
    scatter(7, 1.0, (x, z) => m.add(G.cone6, '#C46A3B', M(x, GY + 1.0, z, 0, rnd(), 0, 1.4, 2.2 + rnd(), 1.4), { grad: 0.3 }));
    scatter(8, 1.5, (x, z) => N.dryTree(f, x, GY, z, 0.9 + rnd() * 0.3, rnd));
    scatter(70, 0.3, (x, z) => N.tuft(d, x, GY, z, 1.3, '#D8C46A', rnd));
  },
  caatinga({ I, m, f, d, w, rnd, scatter, GY, occ }) {
    house(m, w, I.x - 3, GY, I.z + 4, 0.4, '#F4EBDD', '#B5502C', 1.2); occ.push([I.x - 3, I.z + 4, 3.5]);
    scatter(12, 1.4, (x, z) => N.cactus(m, x, GY, z, 0.9 + rnd() * 0.6, rnd));
    scatter(8, 1.4, (x, z) => N.dryTree(f, x, GY, z, 1.0, rnd));
    scatter(14, 1.0, (x, z) => N.rock(m, x, GY, z, 0.8 + rnd() * 1.2, '#C9A97F', rnd));
  },
  amazonia({ I, m, f, d, w, group, rnd, scatter, GY, occ }) {
    // rio cruzando a ilha
    const rv = new THREE.Mesh(new THREE.PlaneGeometry(I.r * 2.3, 7, 20, 1), new THREE.MeshStandardMaterial({ color: '#3FA6B8', roughness: 0.35 }));
    const pa = rv.geometry.attributes.position; for (let i = 0; i < pa.count; i++) pa.setY(i, pa.getY(i) + Math.sin(pa.getX(i) * 0.15) * 3);
    rv.geometry.computeVertexNormals();
    rv.rotation.x = -Math.PI / 2; rv.rotation.z = 0.5; rv.position.set(I.x, GY + 0.12, I.z); rv.receiveShadow = true; group.add(rv);
    for (let i = -12; i <= 12; i++) { const x = I.x + Math.cos(-0.5) * i * 2.2, z = I.z - Math.sin(-0.5) * i * 2.2; occ.push([x + Math.sin(i * 2.2 * 0.15) * 1.5, z, 4.6]); }
    // palafita
    const hx = I.x + 8, hz = I.z + 10; occ.push([hx, hz, 3]);
    [[-1.4, -1.2], [1.4, -1.2], [-1.4, 1.2], [1.4, 1.2]].forEach(([a, b]) => m.add(G.cyl5, '#7A4B2E', M(hx + a, GY + 0.8, hz + b, 0, 0, 0, 0.25, 1.6, 0.25)));
    house(m, w, hx, GY + 1.5, hz, -0.4, '#C98E58', '#C9B061', 1.0);
    scatter(40, 2.2, (x, z, k) => N.bigTree(f, x, GY, z, 0.75 + rnd() * 0.45, rnd, ['#2F8A49', '#267A3E', '#3A9A50'][k % 3], '#2A8143'));
    scatter(12, 1.4, (x, z) => N.palm(f, x, GY, z, 1.2, rnd, 0.1));
    scatter(6, 0.5, (x, z) => d.add(G.ico1, '#E0403A', M(x, GY + 5 + rnd() * 2, z, 0, 0, 0, 0.6, 0.45, 0.9)));
  },
  litoral({ I, m, f, d, w, rnd, scatter, GY, occ }) {
    // farol listrado
    const fx = I.x + 8, fz = I.z - 6; occ.push([fx, fz, 2.5]);
    for (let i = 0; i < 5; i++) m.add(G.cyl12, i % 2 ? '#FFFBF4' : '#C9553A', M(fx, GY + 1 + i * 2, fz, 0, 0, 0, 3.2 - i * 0.22, 2, 3.2 - i * 0.22));
    m.add(G.cyl12, '#FFFBF4', M(fx, GY + 10.3, fz, 0, 0, 0, 2.6, 0.4, 2.6));
    w.add(G.cyl8, '#FFE3A0', M(fx, GY + 11.2, fz, 0, 0, 0, 1.5, 1.4, 1.5));
    m.add(G.cone8, '#C9553A', M(fx, GY + 12.5, fz, 0, 0, 0, 2.2, 1.3, 2.2));
    // casinhas coloridas
    [['#F2B33D', -8, 2], ['#7FB3D5', -4, 6], ['#E58FA4', 0, 8.5], ['#7DC48A', 4.5, 8]].forEach(([c, a, b]) => { house(m, w, I.x + a, GY, I.z + b, 0.2, c, '#A9472A', 0.9); occ.push([I.x + a, I.z + b, 2.4]); });
    scatter(9, 1.4, (x, z) => N.palm(f, x, GY, z, 1.1 + rnd() * 0.3, rnd, 0.4));
    // guarda-sóis na areia
    for (let i = 0; i < 4; i++) { const a = 1.2 + i * 0.35, rr = I.r * 1.2; const x = I.x + Math.cos(a) * rr, z = I.z + Math.sin(a) * rr;
      m.add(G.cyl5, '#FFFBF4', M(x, 1.6, z, 0, 0, 0, 0.1, 3, 0.1)); m.add(G.cone8, ['#B23C62', '#F2B33D', '#1F6E82', '#E07F62'][i], M(x, 3.1, z, 0, 0, 0, 3, 0.8, 3)); }
  },
  cidade({ I, m, f, d, w, group, renderer, rnd, scatter, GY, occ }) {
    m.add(G.cyl24, '#E6D6BE', M(I.x, GY + 0.06, I.z, 0, 0, 0, I.r * 1.2, 0.12, I.r * 1.2), { jitter: 0.03 });
    const letters = 'BCDFLMNPRSTV'.split('');
    const cols = ['#1F6E82', '#B23C62', '#2F8A49', '#E07F62', '#F2B33D', '#6B5BA8'];
    const mats = {};
    letters.forEach((L, i) => {
      const a = i / letters.length * Math.PI * 2, rr = i % 2 ? I.r * 0.62 : I.r * 0.38;
      const x = I.x + Math.cos(a) * rr, z = I.z + Math.sin(a) * rr, h = 3 + (i * 7 % 5) * 1.3, c = cols[i % 6];
      occ.push([x, z, 2.6]);
      const ry = -a + Math.PI / 2;
      m.add(G.box, ['#FBEBD0', '#F4C3A8', '#CFE5D2', '#F6E3C6'][i % 4], M(x, GY + h / 2, z, 0, ry, 0, 3.4, h, 3.4), { grad: 0.12 });
      const Lr = F(x, GY, z, ry);
      for (let k = 0; k < Math.floor(h / 1.6); k++) for (const s of [-0.8, 0.8]) for (const fz of [1.71, -1.71]) w.add(G.box, '#F7D38A', Lr(s, 1.2 + k * 1.5, fz, 0, 0, 0, 0.7, 0.8, 0.06));
      const mat = mats[L] = new THREE.MeshStandardMaterial({ map: letterTexture(L, c, renderer), roughness: 0.7 });
      const b = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.4, 2.4), mat); b.position.set(x, GY + h + 1.3, z); b.rotation.y = ry + 0.3; b.castShadow = true; group.add(b);
    });
    // torre do relógio
    m.add(G.box, '#FFFBF4', M(I.x, GY + 5, I.z, 0, 0.3, 0, 3.2, 10, 3.2)); m.add(G.pyr, '#1F6E82', M(I.x, GY + 11.5, I.z, 0, 0.3, 0, 5, 3, 5));
    m.add(G.cyl16, '#F2B33D', M(I.x, GY + 8.4, I.z, Math.PI / 2, 0.3, 0, 2.2, 3.4, 2.2)); occ.push([I.x, I.z, 3]);
    scatter(10, 1.2, (x, z) => N.treeRound(f, x, GY, z, 0.8, '#5DAE57', '#4C9A4A', rnd));
  },
  livros({ I, m, f, d, rnd, scatter, GY, occ }) {
    // livro aberto gigante
    const x = I.x - 2, z = I.z + 1; occ.push([x, z, 6]);
    m.add(G.box, '#B23C62', M(x, GY + 0.35, z, 0, 0.3, 0, 11, 0.5, 7.6));
    m.add(G.box, '#FFFBF4', M(x - 2.6, GY + 1.0, z, 0, 0.3, 0.16, 5.2, 0.6, 7));
    m.add(G.box, '#FFFBF4', M(x + 2.6, GY + 1.0, z, 0, 0.3, -0.16, 5.2, 0.6, 7));
    // livros em pé (prédios)
    [[6, -6, 7], [9, -1, 5.5], [-8, -7, 6], [4, 8, 4.5]].forEach(([a, b, h], i) => {
      const bx = I.x + a, bz = I.z + b; occ.push([bx, bz, 2.6]);
      m.add(G.box, bookCols[i % 6], M(bx, GY + h / 2, bz, 0, i * 0.4, 0, 1.4, h, 4.4), { grad: 0.15 });
      m.add(G.box, '#FFF4E2', M(bx, GY + h / 2, bz, 0, i * 0.4, 0, 1.2, h - 0.3, 4.5));
    });
    scatter(4, 2.2, (x2, z2) => bookStack(m, x2, GY, z2, rnd, 3 + Math.floor(rnd() * 3), 0.8));
    scatter(6, 1.4, (x2, z2) => N.treeRound(f, x2, GY, z2, 0.9, '#6CB85E', '#5DAE57', rnd));
  },
};
export const ctxPins = [];

// ---------------- ROTAS ENTRE ILHAS ----------------
export function buildRoutes(m, d) {
  const byId = Object.fromEntries(ISLANDS.map((i) => [i.id, i]));
  const order = ISLANDS.map((i) => i.id);
  for (let k = 1; k < order.length; k++) {
    const A = byId[order[k - 1]], B = byId[order[k]];
    if (k === 1) { bridge(m, A, B); continue; }
    const unlocked = B.status !== 'bloqueada';
    const a = new THREE.Vector3(A.x, 0, A.z), b = new THREE.Vector3(B.x, 0, B.z);
    const dir = b.clone().sub(a).normalize();
    const p0 = a.clone().addScaledVector(dir, A.r * 1.3), p2 = b.clone().addScaledVector(dir, -B.r * 1.3);
    const side = new THREE.Vector3(-dir.z, 0, dir.x).multiplyScalar(p0.distanceTo(p2) * 0.18 * (k % 2 ? 1 : -1));
    const p1 = p0.clone().add(p2).multiplyScalar(0.5).add(side);
    const curve = new THREE.QuadraticBezierCurve3(p0, p1, p2);
    const n = Math.floor(curve.getLength() / (unlocked ? 3.2 : 4.2));
    for (let i = 0; i <= n; i++) {
      const p = curve.getPoint(i / n);
      if (unlocked) {
        m.add(G.cyl8, i % 2 ? '#F2B33D' : '#FFFBF4', M(p.x, 0.5, p.z, 0, 0, 0, 1.0, 0.9, 1.0));
        m.add(G.ico0, '#F2B33D', M(p.x, 1.05, p.z, 0, 0, 0, 0.5));
      } else m.add(G.cyl8, '#FFFBF4', M(p.x, 0.32, p.z, 0, 0, 0, 0.75, 0.5, 0.75), { jitter: 0 });
    }
  }
}
function bridge(m, A, B) {
  const a = new THREE.Vector3(A.x, 0, A.z), b = new THREE.Vector3(B.x, 0, B.z);
  const dir = b.clone().sub(a).normalize();
  const p0 = a.clone().addScaledVector(dir, A.r - 1.5); p0.y = A.H + 0.15;
  const p2 = b.clone().addScaledVector(dir, -(B.r - 1.5)); p2.y = B.H + 0.15;
  const len = p0.distanceTo(p2), n = Math.floor(len / 0.62), ang = Math.atan2(dir.x, dir.z);
  const side = new THREE.Vector3(dir.z, 0, -dir.x);
  for (let i = 0; i <= n; i++) {
    const t = i / n, p = p0.clone().lerp(p2, t); p.y += Math.sin(Math.PI * t) * 1.6;
    m.add(G.box, i % 2 ? '#B9773F' : '#A86A38', M(p.x, p.y, p.z, 0, ang, 0, 2.8, 0.2, 0.5), { jitter: 0.05 });
    if (i % 4 === 0) for (const s of [-1.35, 1.35]) { const q = p.clone().addScaledVector(side, s); m.add(G.cyl5, '#7A4B2E', M(q.x, q.y + 0.6, q.z, 0, 0, 0, 0.18, 1.2, 0.18)); if (i > 0 && i < n) m.add(G.cyl5, '#7A4B2E', M(q.x, (q.y - 0.1) / 2, q.z, 0, 0, 0, 0.26, q.y + 0.2, 0.26)); }
  }
  for (const s of [-1.35, 1.35]) {
    let prev = null;
    for (let i = 0; i <= n; i += 4) {
      const t = i / n, p = p0.clone().lerp(p2, t); p.y += Math.sin(Math.PI * t) * 1.6 + 1.15; p.addScaledVector(side, s);
      if (prev) { const mid = prev.clone().add(p).multiplyScalar(0.5), seg = p.clone().sub(prev); m.add(G.box, '#E8D2A6', new THREE.Matrix4().compose(mid, new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), seg.clone().normalize()), new THREE.Vector3(0.1, 0.1, seg.length()))); }
      prev = p;
    }
  }
}

// ---------------- NUVENS, BARCO, BALÃO, PÁSSAROS ----------------
export function makeClouds(mat, n = 16) {
  const rnd = rng(77), list = [];
  for (let i = 0; i < n; i++) {
    const c = new Merger(i + 1);
    const k = 4 + Math.floor(rnd() * 4);
    for (let j = 0; j < k; j++) c.add(G.ico1, '#FFFFFF', M((j - k / 2) * 3.2 + rnd() * 1.5, rnd() * 1.6, (rnd() - 0.5) * 3, rnd(), rnd(), 0, 4 + rnd() * 3.5, 3 + rnd() * 2.2, 3.6 + rnd() * 2.5), { jitter: 0.02, grad: 0.18 });
    const mesh = c.build(mat, { cast: false, receive: false });
    const s = 1 + rnd() * 0.8; mesh.scale.setScalar(s);
    mesh.userData = { x0: -260 + rnd() * 560, z0: -300 + rnd() * 380, y: 52 + rnd() * 26, v: 1.2 + rnd() * 1.4 };
    list.push(mesh);
  }
  return list;
}
export function makeBoat(mat) {
  const b = new Merger(11);
  b.add(G.box, '#C9553A', M(0, 0.45, 0, 0, 0, 0, 1.8, 0.9, 4.4)); b.add(G.cone4, '#C9553A', M(0, 0.45, 2.6, Math.PI / 2, Math.PI / 4, 0, 1.27, 1.0, 0.9));
  b.add(G.box, '#FFFBF4', M(0, 0.95, 0, 0, 0, 0, 1.9, 0.12, 4.5));
  b.add(G.cyl6, '#7A4B2E', M(0, 3.4, 0.2, 0, 0, 0, 0.14, 5, 0.14));
  b.add(G.prism, '#FFFBF4', M(0.06, 1.3, 0.2, 0, Math.PI / 2, 0, 3.6, 4.4, 0.06), { jitter: 0 });
  b.add(G.box, '#F2B33D', M(0, 5.9, 0.5, 0, 0, 0, 0.04, 0.5, 0.9));
  const mesh = b.build(mat); return mesh;
}
export function makeBalloon(mat) {
  const b = new Merger(12);
  const sg = new THREE.SphereGeometry(4, 12, 10);
  const cols = [new THREE.Color('#B23C62'), new THREE.Color('#F2B33D'), new THREE.Color('#FFFBF4'), new THREE.Color('#1F6E82')];
  b.add(sg, '#ffffff', M(0, 0, 0, 0, 0, 0, 1, 1.15, 1), { fc: (x, y, z) => cols[Math.floor(((Math.atan2(z, x) + Math.PI) / (Math.PI * 2)) * 12) % 4], jitter: 0.03 });
  b.add(G.cone12, '#B23C62', M(0, -5.2, 0, Math.PI, 0, 0, 4.6, 2.6, 4.6));
  b.add(G.box, '#A86F3F', M(0, -8.6, 0, 0, 0, 0, 1.6, 1.2, 1.6));
  [[-0.7, -0.7], [0.7, -0.7], [-0.7, 0.7], [0.7, 0.7]].forEach(([x, z]) => b.add(G.cyl5, '#6E5D52', M(x, -7.2, z, 0, 0, 0, 0.06, 2.0, 0.06)));
  return b.build(mat, { cast: true });
}
export function makeBirds(mat, n = 7) {
  const list = [];
  for (let i = 0; i < n; i++) {
    const b = new Merger(20 + i);
    b.add(G.box, '#FFFBF4', M(-0.55, 0, 0, 0, 0, 0.35, 1.2, 0.08, 0.35), { jitter: 0 });
    b.add(G.box, '#FFFBF4', M(0.55, 0, 0, 0, 0, -0.35, 1.2, 0.08, 0.35), { jitter: 0 });
    const m = b.build(mat, { cast: false }); m.userData = { ph: i * 0.9, r: 30 + i * 6, h: 22 + i * 2.2 }; list.push(m);
  }
  return list;
}
