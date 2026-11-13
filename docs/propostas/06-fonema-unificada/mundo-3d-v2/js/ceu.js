// FONEMA · Mundo 3D v2 — céu, luz, ambiente (IBL), nuvens e hora do dia.
import * as THREE from 'three';
import { blobGeo, lerp, rng, M, mergeGeos } from './kit.js';

// Paletas de luz por hora (0 = dia, 1 = entardecer). Cores quentes, nunca "noite assustadora".
export const HORAS = [
  { // dia
    topo: '#5FA8E6', meio: '#A9D6F2', horiz: '#FCE9C8', sol: '#FFF1D2', solI: 3.3, hemiC: '#CFE7FF', hemiS: '#E9C79A', hemiI: 0.55,
    nevoa: '#CFE6F2', nevoaD: 0.0019, solPos: [70, 95, 45], exp: 1.0, glow: '#FFF6DE', nuvem: '#FFFFFF', nuvemS: '#C9D9EA',
  },
  { // entardecer
    topo: '#4C5FA8', meio: '#E48D7A', horiz: '#FFC37A', sol: '#FFB46A', solI: 2.6, hemiC: '#B9B4E6', hemiS: '#F2A66B', hemiI: 0.5,
    nevoa: '#F0B48E', nevoaD: 0.0026, solPos: [-95, 26, -60], exp: 1.02, glow: '#FFC78A', nuvem: '#FFE0C4', nuvemS: '#C98AA0',
  },
];

export function criarCeu(scene) {
  const U = {
    topo: { value: new THREE.Color() }, meio: { value: new THREE.Color() }, horiz: { value: new THREE.Color() },
    glow: { value: new THREE.Color() }, sunDir: { value: new THREE.Vector3(0, 1, 0) },
  };
  const mat = new THREE.ShaderMaterial({
    uniforms: U, side: THREE.BackSide, depthWrite: false, fog: false,
    vertexShader: `varying vec3 vD; void main(){ vD = normalize(position); vec4 p = projectionMatrix * modelViewMatrix * vec4(position,1.0); gl_Position = p.xyww; }`,
    fragmentShader: `uniform vec3 topo, meio, horiz, glow; uniform vec3 sunDir; varying vec3 vD;
      void main(){
        float h = vD.y;
        vec3 c = mix(horiz, meio, smoothstep(-0.02, 0.22, h));
        c = mix(c, topo, smoothstep(0.18, 0.85, h));
        float s = max(dot(normalize(vD), normalize(sunDir)), 0.0);
        c += glow * (pow(s, 6.0) * 0.35 + pow(s, 90.0) * 0.9);
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
  sun.shadow.bias = -0.00025; sun.shadow.normalBias = 0.035; sun.shadow.radius = 4; sun.shadow.blurSamples = 12;
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
    st.nuvem = mix('nuvem'); st.nuvemS = mix('nuvemS');
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
  const out = [];
  for (let i = 0; i < n; i++) {
    const parts = [], k = 4 + Math.floor(r() * 4);
    for (let j = 0; j < k; j++) {
      const g = blobGeo(seed + i * 7 + j, 2, 0.12).clone();
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
      if (cores) { mat.color.copy(cores.nuvem); mat.emissive.copy(cores.nuvem); }
    },
  };
}
