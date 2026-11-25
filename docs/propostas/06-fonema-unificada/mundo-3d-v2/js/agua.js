// FONEMA · Mundo 3D v2 — água estilizada: rio com reflexo real (Reflector) e mar do arquipélago.
import * as THREE from 'three';
import { Reflector } from 'three/addons/objects/Reflector.js';
import { DETALHE } from './materiais.js';

const RIO_FRAG = `
  uniform vec3 color; uniform sampler2D tDiffuse; uniform float uTime; uniform vec3 uRaso; uniform vec3 uFundo; uniform float uRefl;
  uniform vec3 uCeu; uniform vec3 uSol; uniform vec3 uSolCor; uniform float uDet; uniform vec3 uCeuT, uCeuM, uCeuH;
  varying vec4 vUv; varying vec2 vRib; varying vec3 vW;
  #include <fog_pars_fragment>
  float h(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
  float n(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f); return mix(mix(h(i),h(i+vec2(1,0)),f.x), mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x), f.y); }
  // ondinhas: soma de ruídos que correm com a correnteza (altura) -> normal por diferenças
  float onda(vec2 p, float along){
    vec2 q = p + vec2(0.0, 0.0);
    return n(q * 0.9 + vec2(-uTime * 0.35, uTime * 0.12)) * 0.5 + n(q * 2.3 + vec2(uTime * 0.21, -uTime * 0.4)) * 0.3 + n(q * 5.1 - uTime * 0.6) * 0.2;
  }
  void main(){
    float across = vRib.y;                 // 0..1 de margem a margem
    float edge = min(across, 1.0 - across); // 0 na margem
    vec2 P = vW.xz;
    float e = 0.12, h0 = onda(P, vRib.x);
    vec3 N = normalize(vec3(-(onda(P + vec2(e, 0.0), vRib.x) - h0) / e * 0.22, 1.0, -(onda(P + vec2(0.0, e), vRib.x) - h0) / e * 0.22));
    vec3 V = normalize(cameraPosition - vW);
    float w = h0;
    if (!gl_FrontFacing) {
      // de baixo d'água: a "janela" clara para o céu quando se olha para cima; em volta, o espelho verde-azulado
      float up = clamp(-V.y, 0.0, 1.0);
      vec3 janela = mix(vec3(0.62, 0.9, 0.95), vec3(1.0, 1.0, 0.96), smoothstep(0.55, 0.85, w));
      vec3 c = mix(uFundo * 0.55 + uRaso * 0.15, janela, smoothstep(0.5, 0.82, up));
      c += smoothstep(0.62, 0.8, n(P * 1.4 + uTime * 0.3)) * 0.25 * smoothstep(0.4, 0.9, up);
      gl_FragColor = vec4(c, 0.92);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
      #include <fog_fragment>
      return;
    }
    vec2 flow = vec2(vRib.x * 0.35 - uTime * 0.25, across * 3.0);
    vec4 uv = vUv; uv.xy += N.xz * 0.9 * uv.w * 0.06;
    vec3 refl = texture2DProj(tDiffuse, uv).rgb;
    float forcaRefl = uRefl;
    // médio (sem espelho): o céu de verdade refletido nas ondinhas — degradê do céu, nuvens passando e bruma no horizonte
    if (uDet > 0.5 && uRefl < 0.5) {
      vec3 R = reflect(-V, N); float up = clamp(R.y, 0.0, 1.0);
      vec3 ceu = mix(uCeuH, uCeuM, smoothstep(0.0, 0.22, up)); ceu = mix(ceu, uCeuT, smoothstep(0.18, 0.85, up));
      vec2 nc = R.xz / (R.y + 0.15) * 0.8 + vec2(uTime * 0.015, uTime * 0.004);
      float nv = smoothstep(0.5, 0.78, n(nc) * 0.65 + n(nc * 2.3 + 4.1) * 0.35);
      refl = mix(ceu, vec3(1.0, 0.98, 0.95), nv * 0.6 * smoothstep(0.03, 0.3, up));
      forcaRefl = 0.72;
    }
    float fundo = smoothstep(0.02, 0.42, edge);
    vec3 base = mix(uRaso, uFundo, fundo);
    float fres = 0.12 + 0.88 * pow(1.0 - max(dot(V, N), 0.0), 4.0);
    vec3 c = mix(base, mix(base, refl, 0.88), clamp(fres * forcaRefl * 1.25, 0.0, 1.0));
    // brilho do sol nas ondinhas
    vec3 Hh = normalize(normalize(uSol) + V);
    float spec = pow(max(dot(N, Hh), 0.0), 220.0) * 3.2 + pow(max(dot(N, Hh), 0.0), 30.0) * 0.12;
    c += uSolCor * spec;
    // faixas de correnteza e espuma que vai e volta na margem
    float stripe = smoothstep(0.78, 0.92, n(vec2(vRib.x * 0.8 - uTime * 0.6, across * 9.0)));
    c += stripe * 0.08 * smoothstep(0.08, 0.25, edge);
    float vai = 0.5 + 0.5 * sin(uTime * 1.3 + vRib.x * 0.35);
    float foam = smoothstep(0.05 + vai * 0.03, 0.0, edge + (w - 0.5) * 0.05);
    foam += smoothstep(0.11 + vai * 0.04, 0.07 + vai * 0.04, edge) * smoothstep(0.45, 0.75, n(P * 3.0 + uTime * 0.4)) * 0.7;
    if (uDet > 0.5) {
      // espuma rendada na margem (abre e fecha com a marolinha) e floquinhos que descem com a correnteza
      float laco = n(P * 3.6 + vec2(uTime * 0.45, -uTime * 0.3)) * 0.6 + n(P * 8.5 - uTime * 0.65) * 0.4;
      float faixa = smoothstep(0.17 + vai * 0.03, 0.04, edge + (laco - 0.5) * 0.07);
      foam = max(foam, faixa * smoothstep(0.42, 0.6, laco) * 0.9);
      vec2 fq = vec2(vRib.x * 1.3 - uTime * 0.9, across * 22.0);
      float floco = step(0.93, h(floor(fq))) * smoothstep(0.5, 0.15, length(fract(fq) - 0.5)) * smoothstep(0.1, 0.3, edge);
      foam = max(foam, floco * 0.55);
      // brilhinhos do sol que piscam na água
      c += uSolCor * step(0.985, n(P * 7.0 + uTime * 0.9)) * pow(max(dot(N, Hh), 0.0), 40.0) * 1.6;
    }
    c = mix(c, vec3(1.0, 0.99, 0.95), clamp(foam, 0.0, 1.0) * 0.85);
    // transparência: na beirinha dá para ver a areia, as pedras e os peixinhos; no meio e de lado, quase espelho
    float a = mix(0.42, 0.86, fundo);
    a = clamp(max(a, fres * 1.1) + foam * 0.6, 0.0, 0.97);
    gl_FragColor = vec4(c, a);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
    #include <fog_fragment>
  }`;
const RIO_VERT = `
  uniform mat4 textureMatrix; attribute vec2 rib; varying vec4 vUv; varying vec2 vRib; varying vec3 vW;
  #include <fog_pars_vertex>
  void main(){ vUv = textureMatrix * vec4(position, 1.0); vRib = rib; vec4 wp = modelMatrix * vec4(position,1.0); vW = wp.xyz;
    vec4 mvPosition = viewMatrix * wp; gl_Position = projectionMatrix * mvPosition;
    #include <fog_vertex>
  }`;

/** Fita (rio) no plano local XY (normal +Z) a partir de uma curva no chão (x,z). */
function fita(curva, larguras, segs = 160) {
  const pts = curva.getSpacedPoints(segs), pos = [], rib = [], idx = [];
  let acc = 0;
  for (let i = 0; i <= segs; i++) {
    const p = pts[i], q = pts[Math.min(i + 1, segs)], o = pts[Math.max(i - 1, 0)];
    const t = new THREE.Vector2(q.x - o.x, q.y - o.y).normalize(), nrm = new THREE.Vector2(-t.y, t.x);
    const w = (typeof larguras === 'function' ? larguras(i / segs) : larguras) / 2;
    if (i) acc += p.distanceTo(pts[i - 1]);
    for (const s of [-1, 1]) {
      const x = p.x + nrm.x * w * s, z = p.y + nrm.y * w * s;
      pos.push(x, -z, 0); rib.push(acc, s < 0 ? 0 : 1);
    }
    if (i < segs) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('rib', new THREE.Float32BufferAttribute(rib, 2));
  g.setIndex(idx); g.computeVertexNormals();
  return g;
}

export function criarRio({ curva, largura = 9, y = 0.0, U, reflexo = true, resolucao = 512 }) {
  const geo = fita(curva, largura);
  const uniforms = {
    color: { value: new THREE.Color('#ffffff') }, tDiffuse: { value: null }, textureMatrix: { value: null },
    uTime: U.time, uRaso: { value: new THREE.Color('#5FD1C8') }, uFundo: { value: new THREE.Color('#1F7FA0') }, uRefl: { value: 1 },
    uCeu: { value: new THREE.Color('#A9D6F2') }, uSol: { value: new THREE.Vector3(0.5, 0.75, 0.3) }, uSolCor: { value: new THREE.Color('#FFF1D2') },
    uDet: DETALHE.on, uCeuT: { value: new THREE.Color('#3F8FE0') }, uCeuM: { value: new THREE.Color('#9CCDF0') }, uCeuH: { value: new THREE.Color('#FBE6C4') },
  };
  const shader = { name: 'RioFonema', uniforms: { ...THREE.UniformsLib.fog, ...uniforms }, vertexShader: RIO_VERT, fragmentShader: RIO_FRAG };
  let mesh;
  if (reflexo) {
    mesh = new Reflector(geo, { shader, textureWidth: resolucao, textureHeight: resolucao, clipBias: 0.02, multisample: 0 });
    mesh.material.fog = true;
    // os uniforms foram clonados: religar o tempo compartilhado
    mesh.material.uniforms.uTime = U.time; mesh.material.uniforms.uDet = DETALHE.on;
  } else {
    const tex = new THREE.DataTexture(new Uint8Array([200, 225, 240, 255]), 1, 1); tex.needsUpdate = true;
    const mat = new THREE.ShaderMaterial({ ...shader, uniforms: THREE.UniformsUtils.clone(shader.uniforms), fog: true });
    mat.uniforms.uTime = U.time; mat.uniforms.uDet = DETALHE.on; mat.uniforms.tDiffuse.value = tex; mat.uniforms.uRefl.value = 0.35;
    mat.uniforms.textureMatrix.value = new THREE.Matrix4();
    mesh = new THREE.Mesh(geo, mat);
  }
  // transparente e dos dois lados: de cima vê-se o fundo na beira; de baixo (mergulho) vê-se a superfície
  Object.assign(mesh.material, { transparent: true, side: THREE.DoubleSide, depthWrite: false });
  mesh.renderOrder = 2;
  mesh.rotation.x = -Math.PI / 2; mesh.position.y = y;
  mesh.receiveShadow = false;
  mesh.userData.uniforms = mesh.material.uniforms;
  return mesh;
}

// ---------- mar do arquipélago ----------
export function criarMar({ U, ilhas = [], tam = 2400 }) {
  const n = Math.min(ilhas.length, 16);
  const arr = []; for (let i = 0; i < 16; i++) { const il = ilhas[i]; arr.push(il ? new THREE.Vector4(il.x, il.z, il.r, 1) : new THREE.Vector4(0, 0, 0, 0)); }
  const mat = new THREE.ShaderMaterial({
    fog: true,
    uniforms: { ...THREE.UniformsUtils.clone(THREE.UniformsLib.fog), uTime: U.time, uIlhas: { value: arr }, uRaso: { value: new THREE.Color('#5ED8CB') }, uFundo: { value: new THREE.Color('#1E78AE') }, uLonge: { value: new THREE.Color('#2B86BC') }, uSol: { value: new THREE.Vector3(0.5, 0.7, 0.3) } },
    vertexShader: `uniform float uTime; varying vec3 vW; #include <fog_pars_vertex>
      void main(){ vec4 wp = modelMatrix * vec4(position,1.0);
        wp.y += sin(wp.x*0.05 + uTime*0.8)*0.25 + cos(wp.z*0.06 + uTime*0.6)*0.25;
        vW = wp.xyz; vec4 mvPosition = viewMatrix * wp; gl_Position = projectionMatrix * mvPosition;
        #include <fog_vertex>
      }`.replace('#include <fog_pars_vertex>', '\n#include <fog_pars_vertex>\n'),
    fragmentShader: `uniform float uTime; uniform vec4 uIlhas[16]; uniform vec3 uRaso, uFundo, uLonge, uSol; varying vec3 vW;
      #include <fog_pars_fragment>
      float h(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
      float n(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f); return mix(mix(h(i),h(i+vec2(1,0)),f.x), mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x), f.y); }
      void main(){
        float d = 1e5;
        for (int i = 0; i < 16; i++) { if (uIlhas[i].w > 0.5) d = min(d, length(vW.xz - uIlhas[i].xy) - uIlhas[i].z); }
        float w = n(vW.xz * 0.08 + uTime * 0.05) * 0.6 + n(vW.xz * 0.21 - uTime * 0.07) * 0.4;
        vec3 c = mix(uRaso, uFundo, smoothstep(2.0, 26.0, d + (w - 0.5) * 6.0));
        c = mix(c, uLonge, smoothstep(300.0, 900.0, length(vW.xz)));
        // anéis de espuma que se afastam da praia
        float ring = sin(d * 0.7 - uTime * 1.6 + w * 3.0);
        float foam = smoothstep(0.86, 1.0, ring) * smoothstep(14.0, 1.0, d);
        foam += smoothstep(1.6, 0.0, d + (w - 0.5) * 1.2);
        c = mix(c, vec3(1.0, 0.99, 0.95), clamp(foam, 0.0, 1.0) * 0.9);
        vec3 V = normalize(cameraPosition - vW);
        float spec = pow(max(dot(reflect(-normalize(uSol), vec3(0,1,0)), V), 0.0), 60.0);
        float glint = step(0.93, n(vW.xz * 0.6 + uTime * 0.3)) * spec * 4.0;
        c += spec * 0.35 + glint;
        float fres = pow(1.0 - max(V.y, 0.0), 4.0);
        c = mix(c, vec3(0.86, 0.93, 0.97), fres * 0.45);
        gl_FragColor = vec4(c, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
        #include <fog_fragment>
      }`,
  });
  const geo = new THREE.PlaneGeometry(tam, tam, 120, 120).rotateX(-Math.PI / 2);
  const m = new THREE.Mesh(geo, mat); m.receiveShadow = false;
  return m;
}
