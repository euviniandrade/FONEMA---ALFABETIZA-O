// FONEMA · Mundo 3D v2 — gráfico, rodada 2 (fila do dono nº 24/28: "mais bonito, detalhado e mais realista"):
//  - SOMBRA DE CONTATO: manchinhas escuras e macias no chão, no pé de árvores, arbustos, postes, bancos e do coreto (o
//    "assentado no chão" dos filmes de animação). Uma malha só (instâncias), fora do AO (camada 1) e sem sombra própria;
//  - MAIS VIDA: bandos de passarinhos voando ao longe (em V, batendo as asas no próprio desenho), borboletas em volta das
//    flores e da beira do rio, e moitas de flores do campo;
//  - MEIO-FIO das ruas calçadas (peças no lote de acabamento: fora da colisão).
// Nada disso existe na qualidade "baixo" (nem é criado; na troca ao vivo para o "baixo", tudo some). Cada grupo é UMA chamada
// de desenho. Tudo com sorteio próprio (rng com semente nova): não mexe na posição de nada que já existia.
import * as THREE from 'three';
import { M, rng, lerp, rbox, canvasTex } from './kit.js';
import { P } from './predios.js';

/** Malha instanciada a partir de [x, z, raioX, raioZ, giro, força]. */
function manchas(lista, altura) {
  const tex = canvasTex(64, 64, (g) => { const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, '#fff'); gr.addColorStop(0.35, '#c8c8c8'); gr.addColorStop(0.7, '#3a3a3a'); gr.addColorStop(1, '#000'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); }, { srgb: false, aniso: 1 });
  const mat = new THREE.MeshBasicMaterial({ color: '#1E2A18', alphaMap: tex, transparent: true, opacity: 0.34, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2, fog: true });
  // força por instância: escurece mais ou menos (cor da instância multiplica a opacidade pelo canal vermelho)
  mat.onBeforeCompile = (sh) => {
    sh.fragmentShader = sh.fragmentShader.replace('#include <alphamap_fragment>', `#include <alphamap_fragment>
      #ifdef USE_INSTANCING_COLOR
        diffuseColor.a *= vColor.r; diffuseColor.rgb = vec3(0.118, 0.165, 0.094);
      #endif`);
  };
  const geo = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2);
  const im = new THREE.InstancedMesh(geo, mat, Math.max(1, lista.length));
  const c = new THREE.Color();
  lista.forEach(([x, z, rx, rz, giro, f], i) => { im.setMatrixAt(i, M(x, altura(x, z) + 0.03, z, 0, giro, 0, rx * 2, 1, rz * 2)); im.setColorAt(i, c.setRGB(f, f, f)); });
  im.count = lista.length; im.instanceMatrix.needsUpdate = true; if (im.instanceColor) im.instanceColor.needsUpdate = true;
  im.castShadow = false; im.receiveShadow = false; im.renderOrder = 1; im.userData.camada1 = true; im.name = 'sombra-contato';
  im.computeBoundingSphere();
  return im;
}

/** Bichinho de asa (passarinho ao longe ou borboleta): as asas batem no próprio desenho (fase por instância). */
function asas(geo, mat, n, freq, amp) {
  const fase = new Float32Array(n); const r = rng(n * 13 + 7); for (let i = 0; i < n; i++) fase[i] = r() * 6.283;
  geo.setAttribute('aFase', new THREE.InstancedBufferAttribute(fase, 1));
  mat.onBeforeCompile = (sh) => {
    sh.uniforms.uT = { value: 0 }; mat.userData.sh = sh;
    sh.vertexShader = 'uniform float uT; attribute float aFase;\n' + sh.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
      transformed.y += sin(uT * ${freq.toFixed(2)} + aFase) * abs(transformed.x) * ${amp.toFixed(2)};`);
  };
  const im = new THREE.InstancedMesh(geo, mat, n);
  im.castShadow = false; im.receiveShadow = false; im.frustumCulled = false; im.userData.camada1 = true;
  return im;
}

export function criarVida({ grupo, altura, distRio, RIO_W, ctx, livre, arvores, extras }) {
  const r = rng(4242);
  const novos = [];

  // ---------- meio-fio da avenida das casas e do caminho da escola (lote de acabamento) ----------
  const meioFio = (x0, z0, x1, z1) => {
    const len = Math.hypot(x1 - x0, z1 - z0), n = Math.max(1, Math.round(len / 1.15)), ang = Math.atan2(x1 - x0, z1 - z0), l = len / n - 0.03;
    for (let i = 0; i < n; i++) { const t = (i + 0.5) / n, x = lerp(x0, x1, t), z = lerp(z0, z1, t); ctx.D.add(rbox(0.22, 0.17, l, 0.045, 1), i % 4 ? P.pedra : P.pedraEsc, M(x, altura(x, z) + 0.01, z, 0, ang, 0), { jit: 0.06 }); }
  };
  for (const s of [-1, 1]) { meioFio(s * 2.33, 14.7, s * 2.33, 31.4); meioFio(s * 2.33, 36.6, s * 2.33, 70.5); meioFio(s * 2.33, -11.6, s * 2.33, -18.2); }

  // ---------- sombras de contato ----------
  const lista = [];
  const perto = (x, z) => Math.hypot(x, z - 4) < 95;
  for (const [m] of arvores) { const e = m.elements, x = e[12], z = e[14]; if (!perto(x, z)) continue; const s = Math.hypot(e[0], e[1], e[2]); lista.push([x, z, 1.5 * s, 1.5 * s, 0, 0.9]); }
  for (const a of ctx.arbustos) { const e = a.m.elements, x = e[12], y = e[13], z = e[14]; if (y > altura(x, z) + 0.9 || !perto(x, z)) continue; const sx = Math.hypot(e[0], e[1], e[2]), sz = Math.hypot(e[8], e[9], e[10]); lista.push([x, z, 0.75 * sx, 0.75 * sz, 0, 0.75]); }
  for (const [x, z, rx, rz, g, f] of extras) lista.push([x, z, rx, rz, g, f]);
  const contato = manchas(lista, altura); grupo.add(contato); novos.push(contato);

  // ---------- moitas de flores do campo (outra malha de flores: some no "baixo") ----------
  const flores = [];
  for (let k = 0; k < 46; k++) {
    const a = r() * 6.283, d = 16 + r() * 58, cx = Math.cos(a) * d, cz = Math.sin(a) * d + 4;
    const beira = distRio(cx, cz) < RIO_W / 2 + 6;
    if (!livre(cx, cz) && !beira) continue;
    const paleta = [['#FFFFFF', '#F2B33D'], ['#B9A6E8', '#FFFFFF'], ['#F59E4C', '#F2B33D'], ['#FFFFFF', '#E86A5C']][k % 4];
    for (let i = 0; i < 26; i++) {
      const aa = r() * 6.283, dd = Math.sqrt(r()) * (1.2 + r() * 0.8), x = cx + Math.cos(aa) * dd, z = cz + Math.sin(aa) * dd;
      if (distRio(x, z) < RIO_W / 2 + 1.9) continue;
      flores.push({ m: M(x, altura(x, z) + 0.12 + r() * 0.1, z, (r() - 0.5) * 0.3, r() * 6, 0, 0.12 + r() * 0.08), c: paleta[i % 2] });
    }
  }

  // ---------- passarinhos ao longe (3 bandos em V) ----------
  const ave = new THREE.BufferGeometry();
  ave.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0.18, -0.95, 0.12, -0.2, 0, 0, -0.18, 0, 0, 0.18, 0, 0, -0.18, 0.95, 0.12, -0.2, 0, 0.02, 0.3, -0.12, 0, -0.05, 0.12, 0, -0.05], 3));
  ave.computeVertexNormals();
  const nAves = 24;
  const aves = asas(ave, new THREE.MeshBasicMaterial({ color: '#3D4457', side: THREE.DoubleSide, fog: true }), nAves, 7.5, 0.55);
  aves.name = 'bandos'; grupo.add(aves); novos.push(aves);
  const bandos = [0, 1, 2].map((i) => ({ R: 70 + i * 28, h: 26 + i * 7, v: 0.05 + i * 0.012, f: i * 2.1, cx: (i - 1) * 25, cz: 10 - i * 15, n: 8 }));

  // ---------- borboletas (perto das flores, dos canteiros e da beira do rio) ----------
  const bb = new THREE.BufferGeometry();
  bb.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0.1, 0.32, 0, 0.2, 0.28, 0, -0.1, 0, 0, 0.1, 0.28, 0, -0.1, 0, 0, -0.06, 0, 0, 0.1, -0.32, 0, 0.2, -0.28, 0, -0.1, 0, 0, 0.1, -0.28, 0, -0.1, 0, 0, -0.06], 3));
  bb.computeVertexNormals();
  const nB = 22;
  const borb = asas(bb, new THREE.MeshLambertMaterial({ color: '#ffffff', side: THREE.DoubleSide, emissive: '#ffffff', emissiveIntensity: 0.12 }), nB, 17, 2.4);
  const coresB = ['#F4C430', '#FFFFFF', '#F59E4C', '#9CC7EA', '#FFFFFF', '#F4C430'];
  const cb = new THREE.Color(), centrosB = [];
  for (let i = 0; i < nB; i++) {
    let x, z, t = 0; do { const a = r() * 6.283, d = 10 + r() * 40; x = Math.cos(a) * d; z = Math.sin(a) * d + 6; t++; } while (t < 20 && !(livre(x, z) || distRio(x, z) < RIO_W / 2 + 5));
    centrosB.push({ x, z, y: altura(x, z), R: 1.2 + r() * 2.2, v: 0.35 + r() * 0.45, f: r() * 9 });
    borb.setColorAt(i, cb.set(coresB[i % coresB.length]));
  }
  borb.instanceColor.needsUpdate = true; borb.name = 'borboletas'; grupo.add(borb); novos.push(borb);

  const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _p = new THREE.Vector3(), _s = new THREE.Vector3(1, 1, 1), _e = new THREE.Euler();
  return {
    flores,
    malhas: novos,
    /** Chamado pela vila depois de montar as flores extras. */
    juntar(m) { novos.push(m); },
    qualidade(n) { for (const m of novos) m.visible = n !== 'baixo'; },
    tick(t) {
      if (!aves.visible) return;
      let k = 0;
      for (const b of bandos) {
        const a = t * b.v + b.f, cy = b.h + Math.sin(t * 0.3 + b.f) * 3;
        for (let i = 0; i < b.n && k < nAves; i++, k++) {
          const fila = Math.ceil(i / 2), lado = i % 2 ? 1 : -1, ang = a - fila * 1.7 / b.R, rr = b.R + (i ? lado * fila * 1.4 : 0);
          _p.set(b.cx + Math.cos(ang) * rr, cy - fila * 0.15 + Math.sin(t * 1.1 + i) * 0.25, b.cz + Math.sin(ang) * rr);
          _e.set(0, -ang, Math.sin(t * 0.7 + i) * 0.12); _q.setFromEuler(_e); _s.setScalar(1.25);
          aves.setMatrixAt(k, _m.compose(_p, _q, _s));
        }
      }
      aves.instanceMatrix.needsUpdate = true;
      if (aves.material.userData.sh) aves.material.userData.sh.uniforms.uT.value = t;
      for (let i = 0; i < nB; i++) {
        const c = centrosB[i], a = t * c.v + c.f;
        _p.set(c.x + Math.cos(a) * c.R + Math.sin(a * 2.3) * 0.5, c.y + 0.7 + Math.sin(a * 3.1) * 0.35 + 0.3, c.z + Math.sin(a * 1.3) * c.R);
        _e.set(0, -a * 1.3, 0); _q.setFromEuler(_e); _s.setScalar(0.55);
        borb.setMatrixAt(i, _m.compose(_p, _q, _s));
      }
      borb.instanceMatrix.needsUpdate = true;
      if (borb.material.userData.sh) borb.material.userData.sh.uniforms.uT.value = t;
    },
  };
}
