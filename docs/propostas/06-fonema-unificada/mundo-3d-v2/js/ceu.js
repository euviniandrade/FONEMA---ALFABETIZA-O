// FONEMA · Mundo 3D v2 — céu, luz, ambiente (IBL), nuvens e hora do dia.
import * as THREE from 'three';
import { blobGeo, lerp, rng, M, mergeGeos } from './kit.js';

// Paletas de luz por hora (0 = dia, 1 = entardecer). Cores quentes, nunca "noite assustadora".
export const HORAS = [
  { // dia
    // fim de manhã dourado (18/11, "padrão filme de animação"): sol quente um pouco mais baixo (sombras mais compridas),
    // preenchimento frio do céu e rebatida quente do chão; céu mais fundo no alto e horizonte com bruma creme
    topo: '#3F8FE0', meio: '#9CCDF0', horiz: '#FBE6C4', sol: '#FFE6BC', solI: 3.4, hemiC: '#BCDCFF', hemiS: '#E8C390', hemiI: 0.6,
    nevoa: '#D3E5EE', nevoaD: 0.0019, solPos: [78, 74, 42], exp: 1.0, glow: '#FFEFCF', nuvem: '#FFFFFF', nuvemS: '#B9CBE2',
  },
  { // entardecer
    topo: '#4C5FA8', meio: '#E48D7A', horiz: '#FFC37A', sol: '#FFB46A', solI: 2.6, hemiC: '#B9B4E6', hemiS: '#F2A66B', hemiI: 0.5,
    nevoa: '#F0B48E', nevoaD: 0.0026, solPos: [-95, 26, -60], exp: 1.02, glow: '#FFC78A', nuvem: '#FFE0C4', nuvemS: '#C98AA0',
  },
];

export function criarCeu(scene) {
  const U = {
    topo: { value: new THREE.Color() }, meio: { value: new THREE.Color() }, horiz: { value: new THREE.Color() },
    glow: { value: new THREE.Color() }, sunDir: { value: new THREE.Vector3(0, 1, 0) }, uTempoC: { value: 0 }, uNuvemC: { value: new THREE.Color('#fff') }, uCirros: { value: 1 },
  };
  const mat = new THREE.ShaderMaterial({
    uniforms: U, side: THREE.BackSide, depthWrite: false, fog: false,
    vertexShader: `varying vec3 vD; void main(){ vD = normalize(position); vec4 p = projectionMatrix * modelViewMatrix * vec4(position,1.0); gl_Position = p.xyww; }`,
    fragmentShader: `uniform vec3 topo, meio, horiz, glow; uniform vec3 sunDir; uniform float uTempoC, uCirros; uniform vec3 uNuvemC; varying vec3 vD;
      float ch(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
      float cn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(ch(i), ch(i + vec2(1, 0)), f.x), mix(ch(i + vec2(0, 1)), ch(i + vec2(1, 1)), f.x), f.y); }
      void main(){
        vec3 d = normalize(vD);
        float h = d.y;
        vec3 c = mix(horiz, meio, smoothstep(-0.02, 0.22, h));
        c = mix(c, topo, smoothstep(0.18, 0.85, h));
        float s = max(dot(d, normalize(sunDir)), 0.0);
        // véu de nuvens altas (cirros) bem leve, correndo devagar
        if (uCirros > 0.0 && h > 0.02) {
          vec2 q = d.xz / (h + 0.12) * 1.6 + vec2(uTempoC * 0.004, uTempoC * 0.0015);
          float w = cn(q * 1.1) * 0.55 + cn(q * 2.7 + 3.0) * 0.3 + cn(q * 6.1 - 1.0) * 0.15;
          float k = smoothstep(0.55, 0.85, w) * smoothstep(0.02, 0.25, h) * (1.0 - smoothstep(0.75, 1.0, h)) * 0.42 * uCirros;
          c = mix(c, uNuvemC, k);
        }
        // bruma do horizonte mais quente do lado do sol (profundidade atmosférica)
        c = mix(c, mix(horiz, glow, 0.5), (1.0 - smoothstep(0.0, 0.16, abs(h))) * (0.25 + 0.35 * pow(s, 3.0)));
        c += glow * (pow(s, 6.0) * 0.35 + pow(s, 90.0) * 0.9);
        c += vec3(1.0, 0.98, 0.9) * smoothstep(0.9993, 0.9997, s) * 1.6; // disco do sol
        c = mix(c, horiz * 0.96, smoothstep(0.0, -0.25, h));
        gl_FragColor = vec4(c, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  });
  const dome = new THREE.Mesh(new THREE.SphereGeometry(1800, 48, 24), mat);
  dome.renderOrder = -10; dome.frustumCulled = false;
  scene.add(dome);

  const hemi = new THREE.HemisphereLight('#fff', '#fff', 1); scene.add(hemi);
  const sun = new THREE.DirectionalLight('#fff', 3); sun.castShadow = true;
  sun.shadow.bias = -0.00025; sun.shadow.normalBias = 0.035; sun.shadow.radius = 5; sun.shadow.blurSamples = 12;
  scene.add(sun); scene.add(sun.target);
  scene.fog = new THREE.FogExp2('#fff', 0.004);

  const st = { t: 0 };
  function aplicar(t, renderer) {
    st.t = t;
    const a = HORAS[0], b = HORAS[1], c = new THREE.Color();
    const mix = (k) => c.set(a[k]).lerp(new THREE.Color(b[k]), t).clone();
    U.topo.value.copy(mix('topo')); U.meio.value.copy(mix('meio')); U.horiz.value.copy(mix('horiz')); U.glow.value.copy(mix('glow'));
    const sp = new THREE.Vector3(...a.solPos).lerp(new THREE.Vector3(...b.solPos), t);
    U.sunDir.value.copy(sp).normalize();
    sun.color.copy(mix('sol')); sun.intensity = lerp(a.solI, b.solI, t);
    sun.userData.dir = sp.clone().normalize();
    hemi.color.copy(mix('hemiC')); hemi.groundColor.copy(mix('hemiS')); hemi.intensity = lerp(a.hemiI, b.hemiI, t);
    scene.fog.color.copy(mix('nevoa')); scene.fog.density = lerp(a.nevoaD, b.nevoaD, t);
    if (renderer) renderer.toneMappingExposure = lerp(a.exp, b.exp, t);
    st.nuvem = mix('nuvem'); st.nuvemS = mix('nuvemS'); U.uNuvemC.value.copy(st.nuvem);
  }
  /** Ambiente (IBL) gerado do próprio céu: reflexos suaves e luz difusa "de estúdio". */
  function ambiente(renderer, scene) {
    const pm = new THREE.PMREMGenerator(renderer);
    const sc = new THREE.Scene();
    const d2 = new THREE.Mesh(new THREE.SphereGeometry(50, 32, 16), mat.clone()); d2.material.uniforms = U; sc.add(d2);
    const chao = new THREE.Mesh(new THREE.CircleGeometry(40, 24).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: new THREE.Color('#9BC277').multiplyScalar(0.7) }));
    chao.position.y = -2; sc.add(chao);
    const rt = pm.fromScene(sc, 0.04);
    scene.environment = rt.texture; scene.environmentIntensity = 0.38;
    pm.dispose();
    return rt;
  }
  /** Sombra do sol acompanhando a área vista (frustum justo = sombra nítida). */
  function seguir(alvo, raio = 60) {
    const d = sun.userData.dir || new THREE.Vector3(0.5, 0.8, 0.3);
    sun.position.copy(alvo).addScaledVector(d, 160); sun.target.position.copy(alvo);
    const cam = sun.shadow.camera; cam.left = -raio; cam.right = raio; cam.top = raio; cam.bottom = -raio; cam.near = 10; cam.far = 380;
    cam.updateProjectionMatrix();
  }
  return { dome, hemi, sun, aplicar, ambiente, seguir, U, st };
}

/** Nuvens fofinhas: grupos de blobs (geometria fundida por nuvem), sombreado suave e leve brilho próprio. */
export function criarNuvens(scene, n = 14, raio = 420, alt = [70, 120], seed = 5) {
  const r = rng(seed);
  const mat = new THREE.MeshStandardMaterial({ color: '#fff', roughness: 1, emissive: '#fff', emissiveIntensity: 0.28, flatShading: false });
  const uN = { uBase: { value: new THREE.Color('#C9D9EA') } };
  mat.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, uN);
    sh.vertexShader = 'varying vec3 vNW;\n' + sh.vertexShader.replace('#include <beginnormal_vertex>', '#include <beginnormal_vertex>\n vNW = normalize(mat3(modelMatrix) * objectNormal);');
    sh.fragmentShader = 'varying vec3 vNW; uniform vec3 uBase;\n' + sh.fragmentShader.replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
      { float up = vNW.y * 0.5 + 0.5; totalEmissiveRadiance *= mix(0.25, 1.15, up);
        diffuseColor.rgb *= mix(uBase, vec3(1.0), smoothstep(0.15, 0.75, up));
        float fr = pow(1.0 - clamp(dot(normalize(normal), normalize(vViewPosition)), 0.0, 1.0), 2.5);
        totalEmissiveRadiance += vec3(1.0, 0.98, 0.94) * fr * 0.35; }`);
  };
  mat.customProgramCacheKey = () => 'nuvemVol1';
  const out = [];
  for (let i = 0; i < n; i++) {
    const parts = [], k = 4 + Math.floor(r() * 4);
    for (let j = 0; j < k; j++) {
      const g = blobGeo(seed + i * 7 + j, 2, 0.12, 1, 0.55).clone();
      const s = 1 - Math.abs(j - k / 2) / k * 0.9;
      g.applyMatrix4(M((j - k / 2) * 5.2 + r() * 2, r() * 2.4 - 0.3 + s * 1.5, r() * 4 - 2, 0, 0, 0, 9 * s + r() * 3, 7 * s + r() * 2, 8 * s + r() * 2));
      parts.push(g);
    }
    const geo = mergeGeos(parts);
    // base levemente achatada
    const p = geo.attributes.position; for (let v = 0; v < p.count; v++) if (p.getY(v) < 0) p.setY(v, p.getY(v) * 0.45);
    geo.computeVertexNormals();
    const m = new THREE.Mesh(geo, mat);
    const a = r() * Math.PI * 2, d = raio * (0.35 + r() * 0.65);
    m.position.set(Math.cos(a) * d, alt[0] + r() * (alt[1] - alt[0]), Math.sin(a) * d);
    m.rotation.y = r() * 6; const sc = 0.8 + r() * 0.9; m.scale.set(sc, sc * 0.9, sc);
    m.userData.v = 0.6 + r() * 0.8; m.userData.a0 = a; m.userData.d = d;
    m.castShadow = false; m.receiveShadow = false;
    scene.add(m); out.push(m);
  }
  return {
    meshes: out, mat,
    tick(t, cores) {
      for (const m of out) { const a = m.userData.a0 + t * 0.004 * m.userData.v; m.position.x = Math.cos(a) * m.userData.d; m.position.z = Math.sin(a) * m.userData.d; }
      if (cores) { mat.color.copy(cores.nuvem); mat.emissive.copy(cores.nuvem); if (cores.nuvemS) uN.uBase.value.copy(cores.nuvemS); }
    },
  };
}

/**
 * Morros ao longe em 3 camadas (perspectiva atmosférica): cada anel é mais claro e mais azulado que o da frente, até
 * quase sumir na bruma do horizonte. Acompanham a câmera (como o céu) e trocam de cor com a hora. Uma malha por anel,
 * sem luz e sem névoa (a cor já é a do ar). No "baixo" ficam escondidos.
 */
export function criarMorros(scene, seed = 9) {
  const r = rng(seed), grupo = new THREE.Group(); grupo.name = 'morros'; grupo.renderOrder = -5;
  const camadas = [
    { R: 640, h: [26, 70], mix: 0.42, base: '#5E9A6E' },
    { R: 900, h: [50, 120], mix: 0.62, base: '#6E9AA2' },
    { R: 1250, h: [80, 190], mix: 0.8, base: '#8AA7C2' },
  ];
  const mats = [];
  for (const [ci, c] of camadas.entries()) {
    const N = 220, pos = [], col = [], idx = [], fase = r() * 10, f1 = 3 + Math.floor(r() * 3), f2 = 7 + Math.floor(r() * 5);
    for (let i = 0; i <= N; i++) {
      const a = (i / N) * Math.PI * 2;
      const n = 0.5 + 0.3 * Math.sin(a * f1 + fase) + 0.15 * Math.sin(a * f2 + fase * 2.3) + 0.08 * Math.sin(a * 23 + ci);
      const topo = lerp(c.h[0], c.h[1], Math.max(0, Math.min(1, n))) - 30;
      const x = Math.cos(a) * c.R, z = Math.sin(a) * c.R;
      pos.push(x, topo, z, x, -60, z);
      col.push(1.06, 1.06, 1.06, 0.9, 0.93, 0.98);
      if (i < N) { const k = i * 2; idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2); }
    }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.setIndex(idx);
    const m = new THREE.MeshBasicMaterial({ vertexColors: true, fog: false, side: THREE.DoubleSide, depthWrite: false });
    m.userData = { base: new THREE.Color(c.base), mix: c.mix };
    const malha = new THREE.Mesh(g, m); malha.frustumCulled = false; malha.renderOrder = -6 + ci * -0.1; grupo.add(malha); mats.push(m);
  }
  scene.add(grupo);
  const tmp = new THREE.Color();
  return {
    grupo,
    /** cor de cada anel = morro misturado com a bruma do horizonte (mais longe, mais bruma). */
    cores(horiz, nevoa) { for (const m of mats) { tmp.copy(horiz).lerp(nevoa, 0.5); m.color.copy(m.userData.base).lerp(tmp, m.userData.mix); } },
    seguir(p) { grupo.position.set(p.x, 0, p.z); },
  };
}

/** Pólen e cisquinhos de luz flutuando perto da câmera (só médio/alto), devagar, na luz quente. */
export function criarPolen(scene, n = 160, raio = 14) {
  const pos = new Float32Array(n * 3), sem = new Float32Array(n), r = rng(31);
  for (let i = 0; i < n; i++) { pos[i * 3] = (r() - 0.5) * 2 * raio; pos[i * 3 + 1] = r() * 6; pos[i * 3 + 2] = (r() - 0.5) * 2 * raio; sem[i] = r() * 100; }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('sem', new THREE.BufferAttribute(sem, 1));
  const U = { uT: { value: 0 }, uCam: { value: new THREE.Vector3() }, uR: { value: raio }, uCor: { value: new THREE.Color('#FFF1C2') }, uPx: { value: 1 } };
  const m = new THREE.ShaderMaterial({
    uniforms: U, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: `attribute float sem; uniform float uT, uR, uPx; uniform vec3 uCam; varying float vA;
      void main(){
        vec3 p = position + vec3(sin(uT * 0.31 + sem) * 1.2, sin(uT * 0.23 + sem * 1.7) * 0.6 + uT * 0.05, cos(uT * 0.27 + sem * 0.7) * 1.2);
        // caixa que acompanha a câmera (a nuvem de pólen nunca acaba)
        p.xz = uCam.xz + mod(p.xz - uCam.xz + uR, 2.0 * uR) - uR; p.y = uCam.y - 2.0 + mod(p.y - uCam.y + 2.0, 6.0);
        vec4 mv = modelViewMatrix * vec4(p, 1.0); gl_Position = projectionMatrix * mv;
        float d = -mv.z; vA = smoothstep(0.5, 2.0, d) * (1.0 - smoothstep(uR * 0.6, uR, d)) * (0.55 + 0.45 * sin(uT * 1.7 + sem * 3.0));
        gl_PointSize = uPx * 2.4 * (1.0 + 0.6 * fract(sem)) * (22.0 / max(d, 0.5));
      }`,
    fragmentShader: `uniform vec3 uCor; varying float vA; void main(){ vec2 q = gl_PointCoord - 0.5; float a = smoothstep(0.5, 0.0, length(q)); gl_FragColor = vec4(uCor * a * vA * 0.55, 1.0); }`,
  });
  const pts = new THREE.Points(g, m); pts.frustumCulled = false; scene.add(pts);
  return { pts, U, tick(t, cam, px = 1) { U.uT.value = t; U.uCam.value.copy(cam); U.uPx.value = px; } };
}
