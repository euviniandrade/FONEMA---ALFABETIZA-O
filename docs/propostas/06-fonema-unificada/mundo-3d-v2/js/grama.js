// FONEMA · Mundo 3D v2 — grama de perto: dezenas de milhares de folhinhas numa malha só (instâncias), num "tapete"
// quadrado que acompanha a criança (a posição de cada folha dá a volta no tapete, no próprio desenho).
// Altura do chão: textura feita da malha do terreno. Onde nasce: só onde o chão pintado é verde (nada de grama na praça,
// nos caminhos ou no rio). Balança com o vento (rajadas que passam) e deita para os lados quando o boneco passa.
import * as THREE from 'three';
import { GLSL_RUIDO } from './materiais.js';
import { rng } from './kit.js';

export const GRAMA_Q = { alto: { n: 42000, tam: 30 }, medio: { n: 16000, tam: 22 }, baixo: { n: 0, tam: 16 } };

export function criarGrama({ vila, U }) {
  const { tex, ext, geo, seg } = vila.chao;
  // ---- altura do chão: a própria malha do terreno vira textura (meia precisão, filtrável em WebGL2) ----
  const n = seg + 1, P = geo.attributes.position, dados = new Uint16Array(n * n);
  for (let i = 0; i < P.count; i++) {
    const col = Math.round((P.getX(i) + ext) / (2 * ext) * seg), lin = Math.round((P.getZ(i) + ext) / (2 * ext) * seg);
    dados[lin * n + col] = THREE.DataUtils.toHalfFloat(P.getY(i));
  }
  const alt = new THREE.DataTexture(dados, n, n, THREE.RedFormat, THREE.HalfFloatType);
  alt.minFilter = alt.magFilter = THREE.LinearFilter; alt.wrapS = alt.wrapT = THREE.ClampToEdgeWrapping; alt.needsUpdate = true;
  // amostra o centro do texel: u = (x + ext) / (2 ext) * seg/n + 0.5/n
  const escalaUV = seg / n, desvioUV = 0.5 / n;

  // ---- folha: 7 vértices (3 pares afinando + ponta), y = 0..1 ao longo da folha ----
  const folha = new THREE.InstancedBufferGeometry();
  const ts = [0, 0.38, 0.72], pos = [];
  for (const t of ts) { const w = Math.pow(1 - t, 0.9) * 0.5; pos.push(-w, t, 0, w, t, 0); }
  pos.push(0, 1, 0);
  folha.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  folha.setIndex([0, 1, 2, 1, 3, 2, 2, 3, 4, 3, 5, 4, 4, 5, 6]);
  const MAX = GRAMA_Q.alto.n, r = rng(91);
  const off = new Float32Array(MAX * 2), rnd = new Float32Array(MAX * 4);
  // tufos: metade das folhas em moitinhas, metade espalhada (fica natural e cobre o chão)
  for (let i = 0; i < MAX; i++) {
    let x = r(), z = r();
    if (i % 2) { const j = i - 1; const a = r() * 6.283, d = Math.sqrt(r()) * 0.012; x = (off[j * 2] + Math.cos(a) * d + 1) % 1; z = (off[j * 2 + 1] + Math.sin(a) * d + 1) % 1; }
    off[i * 2] = x; off[i * 2 + 1] = z;
    rnd.set([r(), r(), r(), r()], i * 4);
  }
  const aOff = new THREE.InstancedBufferAttribute(off, 2), aRnd = new THREE.InstancedBufferAttribute(rnd, 4);
  folha.setAttribute('aOff', aOff); folha.setAttribute('aRnd', aRnd);
  folha.instanceCount = 0;

  const u = {
    uCentro: { value: new THREE.Vector3() }, uPe: { value: new THREE.Vector3(0, -99, 0) }, uTam: { value: 30 }, uAlt: { value: alt }, uChao: { value: tex },
    uExt: { value: ext }, uUV: { value: new THREE.Vector2(escalaUV, desvioUV) }, uNivelG: { value: vila.NIVEL_AGUA }, uVento: { value: 1 }, uTime: U.time,
  };
  const mat = new THREE.MeshLambertMaterial({ color: '#ffffff', side: THREE.DoubleSide });
  const COMUM = /* glsl */`
    attribute vec2 aOff; attribute vec4 aRnd;
    uniform vec3 uCentro, uPe; uniform float uTam, uExt, uNivelG, uVento, uTime; uniform vec2 uUV; uniform sampler2D uAlt, uChao;
    varying vec3 vCorG; varying float vT, vRc;
    ${GLSL_RUIDO}
  `;
  mat.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, u);
    sh.vertexShader = COMUM + sh.vertexShader
      .replace('#include <beginnormal_vertex>', `
        float gAng = aRnd.x * 6.2831; vec2 gDir = vec2(cos(gAng), sin(gAng)); vec2 gLado = vec2(-gDir.y, gDir.x);
        vec3 objectNormal = normalize(vec3(0.0, 1.0, 0.0) + vec3(gDir.x, 0.0, gDir.y) * 0.35 + vec3(gLado.x, 0.0, gLado.y) * position.x * 0.9);
        #ifdef USE_TANGENT
          vec3 objectTangent = vec3(1.0, 0.0, 0.0);
        #endif`)
      .replace('#include <begin_vertex>', `
        vec2 gBase = uCentro.xz - uTam * 0.5;
        vec2 wxz = gBase + mod(aOff * uTam - gBase, uTam);
        vec2 guv = (wxz + uExt) / (2.0 * uExt);
        float dentro = step(0.0, guv.x) * step(guv.x, 1.0) * step(0.0, guv.y) * step(guv.y, 1.0);
        float y0 = texture(uAlt, guv * uUV.x + uUV.y).r;
        vec3 cg = textureLod(uChao, vec2(guv.x, 1.0 - guv.y), 3.0).rgb; // a textura do chão vem do canvas (de cabeça para baixo)
        float verde = smoothstep(0.012, 0.035, cg.g - max(cg.r, cg.b));
        float dC = length(wxz - uCentro.xz);
        float borda = 1.0 - smoothstep(uTam * 0.3, uTam * 0.49, dC);
        float s = verde * borda * dentro * step(uNivelG + 0.12, y0);
        float mancha = m_n(wxz * 0.31);
        float H = (0.16 + 0.34 * aRnd.y) * (0.65 + 0.7 * mancha) * s;
        float W = 0.03 + 0.035 * aRnd.z;
        float t = position.y;
        float vento = sin(uTime * 1.9 + wxz.x * 0.45 + wxz.y * 0.3 + aRnd.w * 2.0) * 0.45 + sin(uTime * 3.7 + wxz.x * 1.3 + aRnd.w * 5.0) * 0.15
                    + (m_n(wxz * 0.09 + uTime * vec2(0.32, 0.17)) - 0.45) * 1.5;
        vec2 dobra = gDir * (0.25 + 0.35 * aRnd.z) + vec2(0.85, 0.4) * vento * 0.5 * uVento;
        vec2 dp = wxz - uPe.xz; float dd = length(dp);
        dobra += dp / max(dd, 1e-3) * (1.0 - smoothstep(0.25, 0.95, dd)) * 1.7 * step(abs(uPe.y - y0), 1.6);
        float dl = min(length(dobra), 1.4);
        vec3 transformed = vec3(wxz.x, y0 - 0.03, wxz.y);
        transformed.xz += gLado * position.x * W + dobra * H * t * t * 0.9;
        transformed.y += H * t * (1.0 - 0.3 * dl * t);
        vCorG = cg; vT = t; vRc = aRnd.w;`);
    sh.fragmentShader = 'varying vec3 vCorG; varying float vT, vRc;\n' + sh.fragmentShader.replace('#include <color_fragment>', `#include <color_fragment>
        { vec3 base = vCorG * 0.5, ponta = vCorG * vec3(1.16, 1.2, 0.84) + vec3(0.02, 0.03, 0.0);
          diffuseColor.rgb = mix(base, ponta, smoothstep(0.0, 1.0, vT)) * (0.86 + 0.28 * vRc);
          diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * vec3(1.22, 1.12, 0.62), step(0.93, vRc) * vT); }`);
  };
  mat.customProgramCacheKey = () => 'gramaFonema1';
  const malha = new THREE.Mesh(folha, mat);
  malha.frustumCulled = false; malha.receiveShadow = true; malha.castShadow = false; malha.name = 'grama';

  const _f = new THREE.Vector3();
  let qual = 'alto';
  return {
    malha,
    /** Qualidade: quantas folhas e o tamanho do tapete (no "baixo" a grama some). */
    qualidade(q) { qual = q; const c = GRAMA_Q[q] || GRAMA_Q.medio; folha.instanceCount = c.n; u.uTam.value = c.tam; malha.visible = c.n > 0; },
    /** alvo: onde a criança está (centro do tapete fica um pouco à frente da câmera); pe: pés do boneco (folhas deitam). */
    tick(camera, alvo, pe, menos) {
      if (!malha.visible) return;
      camera.getWorldDirection(_f); _f.y = 0; if (_f.lengthSq() < 1e-6) _f.set(0, 0, -1); _f.normalize();
      u.uCentro.value.copy(alvo).addScaledVector(_f, u.uTam.value * 0.22);
      if (pe) u.uPe.value.copy(pe);
      u.uVento.value = menos ? 0.25 : 1;
    },
    get qual() { return qual; },
    destruir() { folha.dispose(); mat.dispose(); alt.dispose(); },
  };
}
