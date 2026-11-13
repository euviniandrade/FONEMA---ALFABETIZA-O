// FONEMA · Mundo 3D v2 — Sofia, Tales (recortes das artes 3D, D007), Bolota e Zum-Zum (modelados),
// e os PORTAIS DE MISSÃO (livro aberto brilhante) que disparam `fonema:missao`.
import * as THREE from 'three';
import { G, M, Lote, rbox, radialTex, canvasTex, roundRect, addRim, matStd } from './kit.js';

const BASE = new URL('../', import.meta.url);
const blobSombra = radialTex('rgba(30,24,40,0.55)', 'rgba(30,24,40,0)');

function sombraContato(sx, sz) {
  const m = new THREE.Mesh(G.plane, new THREE.MeshBasicMaterial({ map: blobSombra, transparent: true, depthWrite: false, fog: false }));
  m.rotation.x = -Math.PI / 2; m.scale.set(sx, sz, 1); m.renderOrder = 2; m.userData.camada1 = true; return m;
}

/** Personagem "sprite 3D": plano recortado que sempre encara a câmera (eixo Y), com sombra real e idle. */
export async function criarSprite(arquivo, altura, { fase = 0 } = {}) {
  const tex = await new THREE.TextureLoader().loadAsync(new URL('assets/' + arquivo, BASE).href);
  tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  const asp = tex.image.width / tex.image.height;
  const geo = new THREE.PlaneGeometry(altura * asp, altura).translate(0, altura / 2, 0);
  const mat = new THREE.MeshBasicMaterial({ map: tex, alphaTest: 0.45, side: THREE.DoubleSide, toneMapped: false });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.castShadow = true; mesh.userData.camada1 = true;
  mesh.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: tex, alphaTest: 0.45 });
  const g = new THREE.Group(); g.add(mesh);
  const sh = sombraContato(altura * asp * 0.9, altura * 0.35); sh.position.y = 0.03; g.add(sh);
  g.userData = { mesh, fase, altura, mat };
  g.userData.tick = (t, cam, tint) => {
    const p = g.getWorldPosition(new THREE.Vector3());
    mesh.rotation.y = Math.atan2(cam.position.x - p.x, cam.position.z - p.z);
    const b = Math.sin(t * 2.2 + fase);
    mesh.scale.set(1 - b * 0.008, 1 + b * 0.012, 1);
    mesh.rotation.z = Math.sin(t * 1.1 + fase) * 0.012;
    if (tint) mat.color.copy(tint);
  };
  return g;
}

/** Bolota, o tatu-bola aprendiz (paleta da folha-modelo): casco com 3 cintas, cabeça em "chapéu". */
export function criarBolota() {
  const L = new Lote(41);
  const casco = '#C9975A', cinta = '#A2723B', pele = '#EDC7A4', rosa = '#E8978E';
  L.add(G.sph, casco, M(0, 0.42, 0, 0, 0, 0, 1.0, 0.78, 0.82), { grad: 0.3 });
  for (const x of [-0.2, 0, 0.2]) L.add(new THREE.SphereGeometry(0.5, 28, 16, 0, Math.PI * 2, 0, Math.PI * 0.62), cinta, M(x, 0.42, 0, 0, 0, Math.PI / 2, 0.83, 0.12, 0.85));
  for (let i = 0; i < 26; i++) { const a = (i / 26) * Math.PI * 2; for (const yy of [0.62, 0.48]) L.add(G.sphLo, '#E8C690', M(Math.cos(a) * 0.36 * (yy > 0.6 ? 0.7 : 1), yy + 0.12, Math.sin(a) * 0.3 * (yy > 0.6 ? 0.7 : 1), 0, 0, 0, 0.06)); }
  L.add(G.sph, pele, M(0.52, 0.42, 0, 0, 0, -0.2, 0.42, 0.4, 0.4));
  L.add(new THREE.SphereGeometry(0.5, 24, 12, 0, Math.PI * 2, 0, Math.PI * 0.45), casco, M(0.55, 0.47, 0, 0, 0, -0.45, 0.44, 0.4, 0.42));
  L.add(G.sph, pele, M(0.74, 0.36, 0, 0, 0, -0.3, 0.2, 0.15, 0.17));
  L.add(G.sph, rosa, M(0.84, 0.36, 0, 0, 0, 0, 0.08));
  for (const s of [-1, 1]) {
    L.add(G.sph, '#2B1E16', M(0.68, 0.48, s * 0.12, 0, 0, 0, 0.1));
    L.add(G.sph, '#FFFFFF', M(0.72, 0.51, s * 0.13, 0, 0, 0, 0.035));
    L.add(G.cone, pele, M(0.45, 0.74, s * 0.15, s * 0.3, 0, -0.2, 0.14, 0.24, 0.08));
    L.add(G.cone, rosa, M(0.46, 0.73, s * 0.155, s * 0.3, 0, -0.2, 0.09, 0.17, 0.05));
    L.add(G.sph, rosa, M(0.62, 0.36, s * 0.17, 0, 0, 0, 0.07, 0.05, 0.05));
    for (const x of [-0.25, 0.25]) L.add(G.capsule, pele, M(x, 0.09, s * 0.25, 0, 0, 0, 0.12, 0.08, 0.12));
  }
  L.add(G.cone, casco, M(-0.55, 0.25, 0, 0, 0, Math.PI / 2 + 0.5, 0.12, 0.4, 0.12));
  const mesh = L.build(addRim(matStd({ roughness: 0.6 }), '#FFE6C0', 0.3));
  const g = new THREE.Group(); g.add(mesh);
  const sh = sombraContato(1.4, 1.0); sh.position.y = 0.03; g.add(sh);
  g.scale.setScalar(1.15);
  g.userData.tick = (t) => { const b = Math.sin(t * 2.6); mesh.scale.set(1 + b * 0.015, 1 - b * 0.02, 1 + b * 0.015); mesh.rotation.z = Math.sin(t * 0.9) * 0.03; };
  return g;
}

/** Zum-Zum, o besouro barulhento (vilão leve, D019): voa de leve, asas zunindo. 2 cores + olhos. */
export function criarZumZum() {
  const L = new Lote(5), azul = '#2F7F8F', amarelo = '#F2B33D';
  L.add(G.sph, azul, M(0, 0, 0, 0, 0, 0, 0.7, 0.55, 0.9), { top: '#4FA6B3' });
  L.add(rbox(0.04, 0.32, 0.7, 0.02), '#1D4E5A', M(0, 0.2, -0.05));
  for (const z of [-0.12, 0.12]) L.add(G.torus, amarelo, M(0, 0, z, 0, 0, 0, 0.66, 0.53, 0.7));
  L.add(G.sph, azul, M(0, 0.02, 0.48, 0, 0, 0, 0.46, 0.4, 0.38));
  for (const s of [-1, 1]) {
    L.add(G.sph, '#FFFFFF', M(s * 0.13, 0.1, 0.62, 0, 0, 0, 0.2));
    L.add(G.sph, '#20242E', M(s * 0.14, 0.11, 0.7, 0, 0, 0, 0.09));
    L.add(G.cyl10, '#20242E', M(s * 0.12, 0.38, 0.6, -0.6, 0, s * 0.4, 0.025, 0.4, 0.025));
    L.add(G.sph, amarelo, M(s * 0.2, 0.55, 0.72, 0, 0, 0, 0.07));
    for (const z of [-0.2, 0.05, 0.3]) L.add(G.cyl10, '#20242E', M(s * 0.32, -0.25, z, 0, 0, s * 0.6, 0.03, 0.25, 0.03));
  }
  L.add(G.capsule, '#20242E', M(0, -0.05, 0.69, Math.PI / 2, 0, 0, 0.06, 0.03, 0.06));
  const corpo = L.build(addRim(matStd({ roughness: 0.35, metalness: 0.1 }), '#BFF4FF', 0.5));
  const asaMat = new THREE.MeshStandardMaterial({ color: '#DDF3FF', transparent: true, opacity: 0.45, roughness: 0.2, side: THREE.DoubleSide, depthWrite: false });
  const asaGeo = new THREE.CircleGeometry(0.5, 18).scale(0.55, 1, 1).rotateX(-Math.PI / 2).translate(0.32, 0, 0);
  const a1 = new THREE.Mesh(asaGeo, asaMat), a2 = new THREE.Mesh(asaGeo, asaMat); a2.scale.x = -1;
  a1.position.set(0.08, 0.3, -0.05); a2.position.set(-0.08, 0.3, -0.05);
  const g = new THREE.Group(), inner = new THREE.Group(); inner.add(corpo, a1, a2); g.add(inner);
  g.scale.setScalar(1.25);
  g.userData.tick = (t, centro) => {
    const a = t * 0.45;
    const p = new THREE.Vector3(centro.x + Math.sin(a) * 9 + Math.sin(a * 3.1) * 1.4, centro.y + 4.2 + Math.sin(a * 2.3) * 1.1 + Math.sin(t * 23) * 0.04, centro.z + Math.sin(a * 2) * 6);
    const ahead = new THREE.Vector3(centro.x + Math.sin(a + 0.05) * 9 + Math.sin((a + 0.05) * 3.1) * 1.4, p.y, centro.z + Math.sin((a + 0.05) * 2) * 6);
    g.position.copy(p); g.lookAt(ahead);
    inner.rotation.z = Math.sin(t * 2.0) * 0.25;
    const f = Math.sin(t * 60) * 0.5; a1.rotation.z = 0.3 + f; a2.rotation.z = -0.3 - f;
  };
  return g;
}

/** Rótulo de lugar (sprite sempre legível). */
export function rotulo(texto, { cor = '#2E4374', fundo = 'rgba(255,250,240,0.94)', icone = '', escala = 1 } = {}) {
  const tex = canvasTex(640, 150, (g, w, h) => {
    g.font = '700 70px Fredoka, Andika, sans-serif';
    const tw = g.measureText(texto).width + (icone ? 90 : 0) + 70, x0 = (w - tw) / 2;
    roundRect(g, x0, 14, tw, h - 34, 50); g.fillStyle = fundo; g.shadowColor = 'rgba(40,30,60,0.35)'; g.shadowBlur = 14; g.shadowOffsetY = 5; g.fill();
    g.shadowColor = 'transparent'; g.fillStyle = cor; g.textBaseline = 'middle'; g.textAlign = 'left';
    if (icone) { g.font = '62px sans-serif'; g.fillText(icone, x0 + 30, h / 2 - 3); g.font = '700 70px Fredoka, Andika, sans-serif'; }
    g.fillText(texto, x0 + 35 + (icone ? 85 : 0), h / 2 - 2);
  });
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: true, transparent: true, alphaTest: 0.02, fog: false, toneMapped: false }));
  s.scale.set(6.4 * escala, 1.5 * escala, 1); s.renderOrder = 5;
  return s;
}

/** Portal de missão: livro aberto em pé, página que brilha, anel dourado, faíscas e letra flutuante. */
export function criarPortal({ id, nome, letra = '★', estado = 'atual' }) {
  const g = new THREE.Group();
  const ativo = estado !== 'bloqueada';
  const corBrilho = estado === 'feita' ? '#9FE3A8' : '#FFD66B';
  const L = new Lote(9);
  L.add(new THREE.CylinderGeometry(1.7, 1.95, 0.45, 32), '#E3D6C2', M(0, 0.22, 0), { grad: 0.35 });
  L.add(new THREE.CylinderGeometry(1.75, 1.75, 0.08, 32), estado === 'bloqueada' ? '#A8A8B4' : '#F2B33D', M(0, 0.47, 0));
  L.add(rbox(0.5, 0.9, 0.5, 0.1), '#E3D6C2', M(0, 0.9, -0.1));
  // capas do livro (marinho) abertas em V, lombada e páginas
  const capa = estado === 'bloqueada' ? '#7B7F92' : '#2E4374';
  for (const s of [-1, 1]) {
    L.add(rbox(1.25, 1.7, 0.12, 0.06), capa, M(s * 0.62, 2.15, 0.02, 0, -s * 0.38, 0));
    L.add(rbox(1.12, 1.56, 0.16, 0.05), '#FFF6E3', M(s * 0.58, 2.15, 0.12, 0, -s * 0.38, 0));
    for (let k = 0; k < 4; k++) L.add(rbox(0.7, 0.05, 0.02, 0.01), '#C9B99C', M(s * 0.58, 2.55 - k * 0.22, 0.22 + 0.02, 0, -s * 0.38, 0));
  }
  L.add(G.cyl, capa, M(0, 2.15, -0.12, 0, 0, 0, 0.2, 1.72, 0.2));
  const livro = L.build(addRim(matStd({ roughness: 0.55 }), '#FFE6B0', 0.25));
  g.add(livro);
  const brilhoMat = new THREE.MeshBasicMaterial({ map: radialTex('rgba(255,240,190,1)', 'rgba(255,214,107,0)'), color: corBrilho, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, toneMapped: false });
  const aura = new THREE.Sprite(brilhoMat); aura.scale.set(4.6, 4.6, 1); aura.position.set(0, 2.3, 0.4); if (ativo) g.add(aura);
  const anel = new THREE.Mesh(new THREE.TorusGeometry(1.45, 0.07, 10, 48), new THREE.MeshStandardMaterial({ color: corBrilho, emissive: corBrilho, emissiveIntensity: ativo ? 2.2 : 0.0, roughness: 0.3 }));
  anel.rotation.x = Math.PI / 2; anel.position.y = 0.6; g.add(anel);
  // letra flutuante (o som da fase)
  const lt = canvasTex(256, 256, (c) => { c.fillStyle = '#FFF8E7'; c.beginPath(); c.arc(128, 128, 116, 0, Math.PI * 2); c.fill(); c.lineWidth = 12; c.strokeStyle = estado === 'bloqueada' ? '#8A8EA0' : '#F2B33D'; c.stroke(); c.fillStyle = estado === 'bloqueada' ? '#8A8EA0' : '#2E4374'; c.font = '700 150px Andika, Fredoka, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(estado === 'bloqueada' ? '🔒' : letra, 128, 140); });
  const letraS = new THREE.Sprite(new THREE.SpriteMaterial({ map: lt, toneMapped: false, fog: false, alphaTest: 0.05 })); letraS.scale.set(1.2, 1.2, 1); letraS.position.set(0, 3.9, 0); g.add(letraS);
  // faíscas subindo
  const N = 40, pos = new Float32Array(N * 3), seed = new Float32Array(N);
  for (let i = 0; i < N; i++) { seed[i] = Math.random(); }
  const pg = new THREE.BufferGeometry(); pg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const pts = new THREE.Points(pg, new THREE.PointsMaterial({ color: corBrilho, size: 0.16, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false, map: radialTex('rgba(255,255,255,1)', 'rgba(255,255,255,0)', 32), toneMapped: false }));
  if (ativo) g.add(pts);
  // área de toque (invisível, generosa para dedos pequenos)
  const hit = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.2, 5, 12), new THREE.MeshBasicMaterial({ visible: false }));
  hit.position.y = 2.5; hit.userData.missao = { id, nome, estado }; g.add(hit);
  g.userData = { id, nome, estado, hit, luzPos: new THREE.Vector3(0, 2.4, 0.6) };
  g.userData.tick = (t) => {
    letraS.position.y = 3.95 + Math.sin(t * 2 + id.length) * 0.15;
    if (!ativo) return;
    const pulse = estado === 'atual' ? 1 + Math.sin(t * 3) * 0.12 : 1;
    aura.scale.setScalar(4.4 * pulse); anel.rotation.z = t * 0.6; anel.material.emissiveIntensity = 1.6 + Math.sin(t * 3) * 0.6;
    for (let i = 0; i < N; i++) { const k = (seed[i] + t * 0.18) % 1, a = seed[i] * 40 + t * 0.6; pos[i * 3] = Math.cos(a) * (1.2 - k * 0.6); pos[i * 3 + 1] = 0.6 + k * 3.8; pos[i * 3 + 2] = Math.sin(a) * (1.2 - k * 0.6); }
    pg.attributes.position.needsUpdate = true;
  };
  return g;
}
