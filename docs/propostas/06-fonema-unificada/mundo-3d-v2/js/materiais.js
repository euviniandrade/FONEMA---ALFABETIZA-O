// FONEMA · Mundo 3D v2 — acabamento "de jogo" dos materiais, todo procedural (nada de textura de terceiros):
//  - chão: grama com manchas, pontinhos e relevo fino; terra/pedrinha com cascalho; tudo some de longe (sem cintilar);
//  - prédios (lotes com cor por vértice): telha em fiadas, veio de madeira, reboco com sujeirinha perto do chão;
//  - cáusticas (a luz dançando no fundo do rio) em tudo o que está abaixo do nível da água.
// Os efeitos ficam atrás de um uniforme (DETALHE.on): na qualidade "baixo" o desenho pula esse trecho (o mesmo programa).
import * as THREE from 'three';

/** Estado global do acabamento (o mundo liga/desliga pela qualidade; o rio informa o nível da água). */
export const DETALHE = { on: { value: 1 }, caus: { value: 1 }, nivel: { value: -0.42 } };

export const GLSL_RUIDO = /* glsl */`
  float m_h(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
  float m_n(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
    return mix(mix(m_h(i), m_h(i + vec2(1.0, 0.0)), f.x), mix(m_h(i + vec2(0.0, 1.0)), m_h(i + vec2(1.0, 1.0)), f.x), f.y); }
  vec2 m_h2(vec2 p){ return fract(sin(vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)))) * 43758.5453); }
  // Voronoi (borda entre células): fios de luz que se mexem, como a luz do sol passando pelas ondinhas
  float m_vor(vec2 p, float t){
    vec2 i = floor(p), f = fract(p); float d1 = 8.0, d2 = 8.0;
    for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++) {
      vec2 g = vec2(float(x), float(y)); vec2 o = m_h2(i + g); o = 0.5 + 0.42 * sin(t + 6.2831 * o);
      float d = length(g + o - f); if (d < d1) { d2 = d1; d1 = d; } else if (d < d2) d2 = d;
    }
    return 1.0 - smoothstep(0.0, 0.2, d2 - d1);
  }
  float m_caustica(vec2 p, float t){
    vec2 w = vec2(sin(p.y * 0.9 + t * 0.7), cos(p.x * 0.8 - t * 0.6)) * 0.35;
    float a = m_vor(p * 0.85 + w, t * 0.9), b = m_vor(p * 1.35 - w * 1.3 + 7.1, t * 1.15 + 2.0);
    return a * 0.65 + b * 0.55 + a * b * 0.8;
  }
  vec3 m_relevo(vec3 surfPos, vec3 surfNorm, float h, float forca){
    vec3 sx = dFdx(surfPos), sy = dFdy(surfPos);
    vec2 dh = vec2(dFdx(h), dFdy(h)) * forca;
    vec3 r1 = cross(sy, surfNorm), r2 = cross(surfNorm, sx);
    float det = dot(sx, r1);
    vec3 grad = sign(det) * (dh.x * r1 + dh.y * r2);
    return normalize(abs(det) * surfNorm - grad);
  }
`;

function encadear(mat, chave, fn) {
  const prev = mat.onBeforeCompile;
  mat.onBeforeCompile = (sh, r) => { prev && prev(sh, r); fn(sh, r); };
  const k0 = mat.customProgramCacheKey ? mat.customProgramCacheKey.bind(mat) : () => '';
  mat.customProgramCacheKey = () => k0() + chave;
  return mat;
}
const VERT_WP = (sh) => {
  sh.vertexShader = 'varying vec3 vWP;\n' + sh.vertexShader.replace('#include <project_vertex>', `#include <project_vertex>
    { vec4 wpp = vec4(transformed, 1.0);
      #ifdef USE_INSTANCING
        wpp = instanceMatrix * wpp;
      #endif
      vWP = (modelMatrix * wpp).xyz; }`);
};
const uniDet = (sh, U) => { sh.uniforms.uDet = DETALHE.on; sh.uniforms.uCausF = DETALHE.caus; sh.uniforms.uNivel = DETALHE.nivel; sh.uniforms.uTempo = U.time; };
const PARS_FRAG = 'varying vec3 vWP; uniform float uDet, uCausF, uNivel, uTempo;\n' + GLSL_RUIDO;

/** Trecho de fragmento: cáusticas e cor de água em quem está abaixo do nível do rio. Usa vWP e diffuseColor. */
const CAUSTICA_FRAG = /* glsl */`
  if (vWP.y < uNivel + 0.05) {
    float prof = uNivel - vWP.y;
    diffuseColor.rgb *= mix(vec3(1.0), vec3(0.62, 0.86, 0.9), smoothstep(0.0, 2.6, prof));
    if (uCausF > 0.0) diffuseColor.rgb *= 1.0 + m_caustica(vWP.xz * 0.55, uTempo * 1.6) * smoothstep(-0.05, 0.35, prof) * exp(-prof * 0.22) * uCausF * 0.9;
  }
`;

/** Chão (terreno com textura pintada): grama viva, cascalho nos caminhos, relevo fino e cáusticas no leito do rio. */
export function addDetalheChao(mat, U) {
  return encadear(mat, 'chaoDet2', (sh) => {
    uniDet(sh, U); VERT_WP(sh);
    sh.fragmentShader = PARS_FRAG + sh.fragmentShader
      .replace('#include <map_fragment>', `#include <map_fragment>
        if (uDet > 0.5) {
          float dist = length(vWP - cameraPosition);
          float perto = 1.0 - smoothstep(14.0, 60.0, dist);
          vec3 c = diffuseColor.rgb;
          float verde = smoothstep(0.004, 0.03, c.g - max(c.r, c.b));
          vec2 p = vWP.xz;
          float n1 = m_n(p * 0.23), n2 = m_n(p * 1.7 + 3.1), n3 = m_n(p * 8.3), n4 = m_n(p * vec2(33.0, 29.0));
          vec3 g = c * (0.84 + 0.3 * n1);
          g = mix(g, g * vec3(1.18, 1.1, 0.7), smoothstep(0.6, 0.86, n2) * 0.5);   // manchas de capim mais seco
          g = mix(g, g * vec3(0.82, 0.95, 0.84), smoothstep(0.55, 0.9, 1.0 - n2) * 0.4); // trevo mais escuro
          g *= mix(1.0, 0.8 + 0.34 * (n3 * 0.45 + n4 * 0.55), perto);
          vec3 s = c * (0.95 + 0.1 * n2);
          s *= mix(1.0, (0.9 + 0.16 * step(0.74, n4)) * (1.0 - 0.1 * step(n3, 0.2)), perto); // pedrinhas e furinhos
          diffuseColor.rgb = mix(s, g, verde);
        }
        ${CAUSTICA_FRAG}`)
      .replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>
        if (uDet > 0.5) {
          float dist = length(vWP - cameraPosition);
          float perto = 1.0 - smoothstep(10.0, 40.0, dist);
          if (perto > 0.01) { float h = m_n(vWP.xz * 8.3) * 0.5 + m_n(vWP.xz * vec2(33.0, 29.0)) * 0.5; normal = m_relevo(-vViewPosition, normal, h, 0.035 * perto); }
        }`);
  });
}

/** Lotes dos prédios (cor por vértice): telha em fiadas, veio de madeira, reboco com variação e sujeirinha no pé da parede. */
export function addDetalheSuperficie(mat, U, P) {
  const norm = (hex) => { const c = new THREE.Color(hex); const l = c.r * 0.3 + c.g * 0.59 + c.b * 0.11; return new THREE.Vector3(c.r / l, c.g / l, c.b / l); };
  const u = { uTelhaN: { value: norm(P.telha) }, uMadN: { value: norm(P.madeira) }, uMad2N: { value: norm(P.madeiraClara) } };
  return encadear(mat, 'superfDet2', (sh) => {
    uniDet(sh, U); Object.assign(sh.uniforms, u);
    VERT_WP(sh);
    sh.vertexShader = 'varying vec3 vWN;\n' + sh.vertexShader.replace('#include <beginnormal_vertex>', '#include <beginnormal_vertex>\n vWN = normalize(mat3(modelMatrix) * objectNormal);');
    sh.fragmentShader = 'varying vec3 vWN; uniform vec3 uTelhaN, uMadN, uMad2N; float m_hRow;\n' + PARS_FRAG + sh.fragmentShader
      .replace('#include <color_fragment>', `#include <color_fragment>
        m_hRow = 0.0;
        if (uDet > 0.5) {
          float dist = length(vWP - cameraPosition);
          float perto = 1.0 - smoothstep(16.0, 55.0, dist);
          vec3 c0 = vColor.rgb; float lum = dot(c0, vec3(0.3, 0.59, 0.11)); vec3 cn = c0 / max(lum, 1e-3);
          vec3 an = abs(vWN);
          vec2 pt = an.y > 0.6 ? vWP.xz : (an.x > an.z ? vWP.zy : vWP.xy);
          float nG = m_n(pt * 0.9), nF = m_n(pt * 6.0);
          float f = 0.95 + 0.1 * nG;
          float telha = (1.0 - smoothstep(0.12, 0.3, distance(cn, uTelhaN))) * step(0.25, vWN.y);
          float mad = (1.0 - smoothstep(0.12, 0.26, min(distance(cn, uMadN), distance(cn, uMad2N)))) * step(lum, 0.42) * step(0.05, lum);
          if (telha > 0.01 && perto > 0.01) {
            float fy = vWP.y * 3.3, row = fract(fy);
            float col = fract((vWP.x + vWP.z) * 1.45 + floor(fy) * 0.5);
            float t = 1.0 - 0.26 * smoothstep(0.72, 1.0, row) - 0.14 * smoothstep(0.88, 1.0, col) + 0.07 * sin(col * 6.2831);
            t *= 0.92 + 0.16 * m_n(vec2(floor(fy), floor((vWP.x + vWP.z) * 1.45 + floor(fy) * 0.5)) * 1.7);
            f *= mix(1.0, t, telha * perto);
            m_hRow = (row * 0.8 + 0.2 * sin(col * 6.2831)) * telha * perto;
          }
          if (mad > 0.01 && perto > 0.01) {
            vec2 q = an.y > 0.6 ? vec2(vWP.x * 1.3, vWP.z * 13.0) : vec2(pt.x * 13.0, pt.y * 1.3);
            float veio = m_n(q + m_n(q * 0.3) * 3.0);
            f *= mix(1.0, 0.86 + 0.24 * veio, mad * perto);
          }
          f *= mix(1.0, 0.94 + 0.12 * nF, perto * (1.0 - telha) * (1.0 - mad));
          if (an.y < 0.5) f *= mix(0.84, 1.0, smoothstep(0.0, 0.9, vWP.y)); // sujeirinha no pé da parede
          diffuseColor.rgb *= f;
        }
        ${CAUSTICA_FRAG}`)
      .replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>
        if (uDet > 0.5 && m_hRow > 0.0) normal = m_relevo(-vViewPosition, normal, m_hRow, 0.05);`);
  });
}

/** Só as cáusticas (pedras e plantas do fundo do rio, que não têm cor por vértice). */
export function addCausticas(mat, U) {
  return encadear(mat, 'caus1', (sh) => {
    uniDet(sh, U); VERT_WP(sh);
    sh.fragmentShader = PARS_FRAG + sh.fragmentShader.replace('#include <color_fragment>', `#include <color_fragment>
      ${CAUSTICA_FRAG}`);
  });
}
