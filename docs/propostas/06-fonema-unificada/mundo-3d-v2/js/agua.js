// FONEMA · Mundo 3D v2 — água estilizada: rio com reflexo real (Reflector) e mar do arquipélago.
import * as THREE from 'three';
import { Reflector } from 'three/addons/objects/Reflector.js';

const RIO_FRAG = `
  uniform vec3 color; uniform sampler2D tDiffuse; uniform float uTime; uniform vec3 uRaso; uniform vec3 uFundo; uniform float uRefl;
  uniform vec3 uCeu;
  varying vec4 vUv; varying vec2 vRib; varying vec3 vW;
  #include <fog_pars_fragment>
  float h(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
  float n(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f); return mix(mix(h(i),h(i+vec2(1,0)),f.x), mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x), f.y); }
  void main(){
    float across = vRib.y;                 // 0..1 de margem a margem
    float edge = min(across, 1.0 - across); // 0 na margem
    vec2 flow = vec2(vRib.x * 0.35 - uTime * 0.25, across * 3.0);
    float w = n(flow * 2.0) * 0.6 + n(flow * 5.0 + 3.1) * 0.4;
    vec4 uv = vUv; uv.xy += (vec2(w, n(flow * 3.0 + 7.0)) - 0.5) * 0.05 * uv.w;
    vec3 refl = texture2DProj(tDiffuse, uv).rgb;
    vec3 base = mix(uRaso, uFundo, smoothstep(0.02, 0.38, edge));
    vec3 V = normalize(cameraPosition - vW);
    float fres = 0.18 + 0.82 * pow(1.0 - max(V.y, 0.0), 3.0);
    vec3 c = mix(base, mix(base, refl, 0.85), clamp(fres * uRefl, 0.0, 1.0));
    // faixas de correnteza e espuma nas margens (desenho animado)
    float stripe = smoothstep(0.78, 0.92, n(vec2(vRib.x * 0.8 - uTime * 0.6, across * 9.0)));
    c += stripe * 0.10 * smoothstep(0.08, 0.25, edge);
    float foam = smoothstep(0.075, 0.0, edge + (w - 0.5) * 0.05);
    c = mix(c, vec3(1.0, 0.99, 0.95), foam * 0.85);
    float spark = pow(max(n(vW.xz * 1.7 + uTime * 0.7), 0.0), 18.0) * 2.5;
    c += spark * fres;
    gl_FragColor = vec4(c, 1.0);
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
    uCeu: { value: new THREE.Color('#A9D6F2') },
  };
  const shader = { name: 'RioFonema', uniforms: { ...THREE.UniformsLib.fog, ...uniforms }, vertexShader: RIO_VERT, fragmentShader: RIO_FRAG };
  let mesh;
  if (reflexo) {
    mesh = new Reflector(geo, { shader, textureWidth: resolucao, textureHeight: resolucao, clipBias: 0.02, multisample: 0 });
    mesh.material.fog = true;
    // os uniforms foram clonados: religar o tempo compartilhado
    mesh.material.uniforms.uTime = U.time;
  } else {
    const tex = new THREE.DataTexture(new Uint8Array([200, 225, 240, 255]), 1, 1); tex.needsUpdate = true;
    const mat = new THREE.ShaderMaterial({ ...shader, uniforms: THREE.UniformsUtils.clone(shader.uniforms), fog: true });
    mat.uniforms.uTime = U.time; mat.uniforms.tDiffuse.value = tex; mat.uniforms.uRefl.value = 0.35;
    mat.uniforms.textureMatrix.value = new THREE.Matrix4();
    mesh = new THREE.Mesh(geo, mat);
  }
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
