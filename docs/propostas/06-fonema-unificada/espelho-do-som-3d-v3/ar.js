/* FONEMA · Espelho do Som (v3) — o AR (partículas) e o marcador "o som nasce aqui".
 *
 * O caminho do ar é recalculado a cada quadro a partir da pose: garganta → por cima da língua → entre os lábios
 * (boca) ou garganta → por trás do véu → nariz. Onde a língua ou os lábios fecham a passagem, o ar para e se
 * acumula; quando soltam, ele sai de uma vez (estouro). Nos sons laterais (L, LH) o ar contorna a língua pelos lados.
 */
import { VIA_GARGANTA, VIA_NARIZ, abertura } from './modelo.js';

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const mix = (a, b, t) => a + (b - a) * t;
const sm = (t) => { t = clamp(t); return t * t * (3 - 2 * t); };

/** Caminhos do ar para a pose p. Devolve { oral: [...], nasal: [...], bloqueio: 0..1 | null, lateral } com pontos {z,y,lx,ly,fora}. */
export function caminhos(P, p, topo, nTopo) {
  const { hu, hl, J } = abertura(p);
  const base = VIA_GARGANTA.slice(0, 5).map((q) => ({ z: q[0], y: q[1], lx: 0.3, ly: 0.3 }));
  const oral = base.slice();
  let bloqueio = null, menor = 9;
  const lateral = p.larg < 0.9;
  // por cima da língua, da raiz até a ponta
  for (let i = nTopo - 3; i >= 0; i -= 3) {
    const z = topo[i * 2], y = topo[i * 2 + 1];
    if (z < -4.45) continue;
    const teto = z > -3.8 ? P.ceuY(z) : 1.25;
    const folga = teto - y;
    if (z > -4.0 && folga < menor) { menor = folga; if (folga < 0.09 && !lateral) bloqueio = oral.length; }
    const aperto = lateral ? sm((0.35 - folga) / 0.3) : 0;
    oral.push({ z, y: y + Math.max(0.05, folga) * 0.5 - aperto * 0.35, lx: mix(0.85, 0.35, aperto), ly: Math.max(0.04, folga * 0.32), dx: aperto * 1.3 });
  }
  const meio = (hu - hl) / 2 - (p.dy || 0), abre = hu + hl;
  oral.push({ z: -0.42, y: mix(-0.1 - J * 0.4, meio, 0.5), lx: 0.55, ly: Math.max(0.03, J * 0.2 + 0.03) });
  const iLab = oral.length;
  oral.push({ z: 0.3 + p.arr * 0.45, y: meio, lx: Math.max(0.12, p.lg * 0.55), ly: Math.max(0.02, abre * 0.28) });
  if (bloqueio === null && abre < 0.05 && p.ld < 0.5) bloqueio = iLab;
  // (F/V: os dentes pousam no lábio, mas o ar passa; não é bloqueio)
  const iFora = oral.length;
  oral.push({ z: 1.5 + p.arr * 0.4, y: meio - 0.12, lx: 0.5, ly: 0.3, fora: 0.45 });
  oral.push({ z: 3.0, y: meio - 0.4, lx: 1.0, ly: 0.6, fora: 0.8 });
  oral.push({ z: 4.6, y: meio - 0.8, lx: 1.6, ly: 1.0, fora: 1 });
  const nasal = base.concat(VIA_NARIZ.map((q) => ({ z: q[0], y: q[1], lx: 0.24, ly: 0.24 })));
  const iNar = nasal.length;
  nasal.push({ z: 1.2, y: 0.85, lx: 0.5, ly: 0.25, fora: 0.5, nx: 0.42 }, { z: 2.3, y: 0.0, lx: 0.8, ly: 0.45, fora: 0.85, nx: 0.5 }, { z: 3.4, y: -1.0, lx: 1.2, ly: 0.7, fora: 1, nx: 0.6 });
  for (let i = base.length + 5; i < iNar; i++) nasal[i].nx = 0.36 * sm((i - base.length - 4) / 3); // as duas narinas
  return { oral, nasal, bloqueio: bloqueio === null ? null : bloqueio / (oral.length - 1), fimBoca: iFora / (oral.length - 1), fimNariz: iNar / (nasal.length - 1) };
}

export function criarAr(THREE, { n = 110, cor = 0x23b7ff, tamanho = 0.3, ordem = 4, soFora = false } = {}) {
  const g = new THREE.BufferGeometry();
  const pos = new Float32Array(n * 3), alfa = new Float32Array(n), tam = new Float32Array(n);
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('alfa', new THREE.BufferAttribute(alfa, 1));
  g.setAttribute('tam', new THREE.BufferAttribute(tam, 1));
  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false,
    uniforms: { uCor: { value: new THREE.Color(cor) }, uEsc: { value: 400 } },
    vertexShader: `attribute float alfa; attribute float tam; uniform float uEsc; varying float vA;
      void main(){ vA = alfa; vec4 mv = modelViewMatrix * vec4(position,1.0); gl_PointSize = tam * uEsc / -mv.z; gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `uniform vec3 uCor; varying float vA;
      void main(){ vec2 d = gl_PointCoord - 0.5; float r = length(d) * 2.0; if (r > 1.0 || vA < 0.01) discard;
        float miolo = smoothstep(0.62, 0.1, r); float borda = smoothstep(1.0, 0.82, r);
        vec3 c = mix(uCor, vec3(1.0), miolo * 0.85);
        gl_FragColor = vec4(c, borda * vA * mix(0.72, 1.0, miolo));
        #include <colorspace_fragment>
      }`
  });
  const pontos = new THREE.Points(g, mat); pontos.frustumCulled = false; pontos.renderOrder = ordem;
  // estado de cada partícula
  const u = new Float32Array(n), canal = new Uint8Array(n), ox = new Float32Array(n), oy = new Float32Array(n), vel = new Float32Array(n), vida = new Float32Array(n);
  let s = 12345; const rnd = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  for (let i = 0; i < n; i++) { u[i] = rnd(); const a = rnd() * 6.283, r = Math.sqrt(rnd()); ox[i] = Math.cos(a) * r; oy[i] = Math.sin(a) * r; vel[i] = 0.75 + rnd() * 0.5; }
  let visivel = 0;

  /** dt em s; ar 0..1 (quanto ar passa agora); forca 0..3; nasal 0..1 (fração pelo nariz); cam = caminhos() */
  function atualizar(dt, cam, { ar, forca, nasal, tempo }) {
    visivel += (ar - visivel) * Math.min(1, dt * (ar > visivel ? 9 : 5));
    const bl = cam.bloqueio, vBase = 0.2 + 0.11 * forca;
    for (let i = 0; i < n; i++) {
      const pts = canal[i] ? cam.nasal : cam.oral, m = pts.length - 1, fim = canal[i] ? cam.fimNariz : cam.fimBoca;
      let v = vBase * vel[i];
      if (u[i] > fim) v *= 0.75 + 0.5 * forca; // do lado de fora: sopro forte vai longe e rápido
      let nu = u[i] + dt * v * (0.25 + 0.75 * visivel);
      const limite = !canal[i] && bl !== null ? bl * (1 - 0.5 * ((i * 0.618) % 1)) - 0.012 : 2; // o ar preso enche o espaço atrás do fechamento
      if (u[i] <= limite + 0.02 && nu > limite) nu = limite; // a passagem está fechada: o ar para e se junta
      if (nu >= 1 || (canal[i] === 0 && nasal >= 1 && nu > 0.2) || (canal[i] === 1 && nasal <= 0 && nu > 0.2 && nu < fim)) { nu = rnd() * 0.12; canal[i] = rnd() < nasal ? 1 : 0; vida[i] = 0; }
      else if (nu < 0.2 && ((canal[i] === 0 && nasal >= 1) || (canal[i] === 1 && nasal <= 0))) canal[i] = nasal >= 1 ? 1 : 0;
      if (!(nu >= 0)) nu = 0;
      u[i] = nu; vida[i] += dt;
      const t = nu * m, k = Math.min(m - 1, Math.floor(t)), f = t - k, a = pts[k], b = pts[k + 1];
      const lx = mix(a.lx, b.lx, f), ly = mix(a.ly, b.ly, f), dx = mix(a.dx || 0, b.dx || 0, f), nx = mix(a.nx || 0, b.nx || 0, f), fora = mix(a.fora || 0, b.fora || 0, f);
      const lado = ox[i] >= 0 ? 1 : -1;
      const treme = nu > limite - 0.03 && limite < 2 ? 0.035 * Math.sin(tempo * 40 + i * 1.7) : 0;
      const o = i * 3;
      const abre = soFora ? 1 + 1.6 * fora : 1; // de frente o sopro se espalha em volta da boca
      pos[o] = ox[i] * lx * abre + lado * (dx + nx) + treme;
      pos[o + 1] = mix(a.y, b.y, f) + oy[i] * ly * abre + treme;
      pos[o + 2] = mix(a.z, b.z, f) + (fora ? 0.25 * oy[i] * fora : 0);
      const entra = sm(Math.min(nu / 0.05, vida[i] / 0.25)), sai = 1 - sm((nu - 0.86) / 0.14);
      alfa[i] = visivel * entra * sai * (fora ? mix(1, 0.75, fora) : 1) * (soFora ? sm(fora / 0.3) * 0.8 : 1);
      tam[i] = tamanho * (0.8 + 0.4 * Math.abs(oy[i])) * (1 + 0.5 * fora);
    }
    g.attributes.position.needsUpdate = true; g.attributes.alfa.needsUpdate = true; g.attributes.tam.needsUpdate = true;
  }
  /** adianta a simulação (para capturas paradas: o ar já aparece no caminho) */
  function aquecer(cam, o, passos = 90) { for (let k = 0; k < passos; k++) atualizar(0.05, cam, o); }
  return { pontos, atualizar, aquecer, escala(v) { mat.uniforms.uEsc.value = v; }, liberar() { g.dispose(); mat.dispose(); } };
}

/** Marcador "o som nasce aqui": um anel que pulsa no ponto onde a boca faz o som (o papel do dedo que aponta). */
export function criarMarcador(THREE) {
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const x = c.getContext('2d');
  const anel = (r, lw, cor) => { x.beginPath(); x.arc(128, 128, r, 0, 6.2832); x.lineWidth = lw; x.strokeStyle = cor; x.stroke(); };
  const gr = x.createRadialGradient(128, 128, 20, 128, 128, 124); gr.addColorStop(0, 'rgba(255,214,64,0.0)'); gr.addColorStop(0.55, 'rgba(255,205,40,0.28)'); gr.addColorStop(1, 'rgba(255,205,40,0)');
  x.fillStyle = gr; x.fillRect(0, 0, 256, 256);
  anel(84, 30, 'rgba(255,255,255,0.95)'); anel(84, 18, '#FFB300'); anel(84, 6, '#FFE27A');
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false, depthWrite: false, opacity: 0 });
  const sp = new THREE.Sprite(mat); sp.renderOrder = 20;
  let a = 0;
  return {
    sprite: sp,
    atualizar(dt, alvo, forca, tempo, tamanho = 1) {
      a += (forca - a) * Math.min(1, dt * 7);
      mat.opacity = a; sp.visible = a > 0.01;
      if (alvo) sp.position.set(alvo[0], alvo[1], alvo[2]);
      const e = tamanho * (1.15 + 0.16 * Math.sin(tempo * 5.2));
      sp.scale.set(e, e, 1);
    },
    liberar() { tex.dispose(); mat.dispose(); }
  };
}
