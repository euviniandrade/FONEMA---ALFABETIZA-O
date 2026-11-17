// FONEMA · Mundo 3D v2 — BONECOS do passeio em 3ª pessoa (a criança e os bonecos da vila).
//
// O app manda cada boneco já pronto num "pacote" (app/web/src/avatar3d/pacote.ts): malhas com posição, normal, UV e a
// textura (ImageBitmap) — o avatar da criança com as cores dela, a Sofia, o Tales, o Bolota e crianças da vila
// (o mesmo modelo do avatar recolorido). Pés no chão (y = 0), de frente para +Z, em metros.
// Sem o app (página aberta sozinha) ou enquanto o pacote não chega, entra a RESERVA: um bonequinho feito em código.
//
// Os modelos 3D atuais são malhas inteiras, SEM esqueleto e sem animação. Por isso a animação é PROCEDURAL, no corpo
// todo: passos (balanço e quique), inclinação ao correr, respirar parado, pulo com antecipação e "amassadinho" na
// queda, tchau (pulinhos, gira para a câmera e mãozinha flutuando) e nado (deita para a frente e boia).
import * as THREE from 'three';
import { addRim, radialTex, canvasTex, clamp, lerp } from './kit.js';

/** Monta o grupo de malhas de um pacote vindo do app. */
export function malhaDoPacote(pacote) {
  const g = new THREE.Group();
  for (const m of pacote.malhas || []) {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(m.pos, 3));
    if (m.uv) geo.setAttribute('uv', new THREE.BufferAttribute(m.uv, 2));
    if (m.idx) geo.setIndex(new THREE.BufferAttribute(m.idx, 1));
    if (m.nor) geo.setAttribute('normal', new THREE.BufferAttribute(m.nor, 3)); else geo.computeVertexNormals();
    geo.computeBoundingSphere();
    let map = null;
    if (m.mapa) {
      map = new THREE.Texture(m.mapa);
      map.flipY = false; // convenção do glTF (o app manda a textura como ela está no arquivo)
      map.colorSpace = THREE.SRGBColorSpace; map.anisotropy = 4; map.needsUpdate = true;
    }
    const mat = addRim(new THREE.MeshStandardMaterial({
      map, color: new THREE.Color(m.cor || '#ffffff'), roughness: m.rugosidade ?? 0.9, metalness: 0,
      transparent: (m.opacidade ?? 1) < 1, opacity: m.opacidade ?? 1, depthWrite: (m.opacidade ?? 1) >= 1,
    }), '#FFE4BE', 0.22, 3.0);
    const malha = new THREE.Mesh(geo, mat);
    malha.castShadow = (m.opacidade ?? 1) >= 1;
    g.add(malha);
  }
  return g;
}

/** Reserva: bonequinho de brinquedo (cabeça, corpo, braços e pernas) com as cores pedidas. Altura 1,1 m. */
export function bonecoReserva({ pele = '#F0C3A0', camisa = '#FAFBFD', calca = '#5E8FB8', cabelo = '#3A2416', calcado = '#2E4374' } = {}) {
  const g = new THREE.Group();
  const mat = (c, r = 0.8) => addRim(new THREE.MeshStandardMaterial({ color: c, roughness: r }), '#FFE4BE', 0.22, 3.0);
  const add = (geo, m, x, y, z, sx = 1, sy = 1, sz = 1) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.scale.set(sx, sy, sz); o.castShadow = true; g.add(o); return o; };
  const esf = new THREE.SphereGeometry(0.5, 24, 16), cap = new THREE.CapsuleGeometry(0.5, 1, 6, 14);
  const mPele = mat(pele), mCamisa = mat(camisa), mCalca = mat(calca), mCabelo = mat(cabelo, 0.6), mPe = mat(calcado);
  add(esf, mPele, 0, 0.86, 0, 0.42, 0.42, 0.4); // cabeça
  add(esf, mCabelo, 0, 0.93, -0.03, 0.45, 0.36, 0.42); // cabelo
  add(cap, mCamisa, 0, 0.52, 0, 0.3, 0.16, 0.22); // tronco
  for (const s of [-1, 1]) {
    add(cap, mPele, s * 0.2, 0.52, 0, 0.08, 0.12, 0.08).rotation.z = s * 0.25; // braços
    add(cap, mCalca, s * 0.08, 0.2, 0, 0.1, 0.12, 0.1); // pernas
    add(esf, mPe, s * 0.08, 0.04, 0.04, 0.12, 0.08, 0.18); // pés
    add(esf, mat('#2B1E16', 0.3), s * 0.08, 0.88, 0.19, 0.05, 0.06, 0.03); // olhos
  }
  return g;
}

const SOMBRA_TEX = radialTex('rgba(20,28,40,0.55)', 'rgba(20,28,40,0)');
const MAO_TEX = canvasTex(128, 128, (g) => { g.font = '96px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('👋', 64, 70); });
const BALAO_TEX = canvasTex(128, 128, (g) => { g.fillStyle = 'rgba(255,248,236,0.96)'; g.beginPath(); g.arc(64, 58, 50, 0, 7); g.fill(); g.beginPath(); g.moveTo(52, 100); g.lineTo(64, 124); g.lineTo(76, 100); g.fill(); g.font = '60px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('💬', 64, 60); });

/**
 * Boneco animado. `raiz` vai para a cena (posição e giro no mundo); dentro dela, `pivo` (nos pés) recebe o
 * amassar/esticar e as inclinações, e `corpo` recebe o modelo (trocável: reserva → avatar de verdade).
 * Altura final = `altura` metros (o modelo é escalado).
 */
export class Boneco {
  constructor({ altura = 1.5, nome = '', menosMovimento = false } = {}) {
    this.altura = altura; this.menos = menosMovimento; this.nome = nome;
    this.raiz = new THREE.Group(); this.raiz.name = `boneco-${nome}`;
    this.pivo = new THREE.Group(); this.raiz.add(this.pivo);
    this.corpo = new THREE.Group(); this.pivo.add(this.corpo);
    // sombra de contato (sempre, também sem sombras do sol)
    this.sombra = new THREE.Mesh(new THREE.CircleGeometry(0.5, 24).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: SOMBRA_TEX, transparent: true, depthWrite: false, fog: false }));
    this.sombra.renderOrder = 1; this.sombra.scale.setScalar(altura * 0.62); this.raiz.add(this.sombra);
    // mãozinha do tchau e balão de conversa (sprites)
    this.mao = new THREE.Sprite(new THREE.SpriteMaterial({ map: MAO_TEX, transparent: true, depthTest: false, fog: false }));
    this.mao.scale.setScalar(0.55); this.mao.visible = false; this.mao.renderOrder = 6; this.raiz.add(this.mao);
    this.balao = new THREE.Sprite(new THREE.SpriteMaterial({ map: BALAO_TEX, transparent: true, depthTest: false, fog: false }));
    this.balao.scale.setScalar(0.62); this.balao.visible = false; this.balao.renderOrder = 6; this.raiz.add(this.balao);
    this.modelo = null;
    // estado da animação
    this.fase = 0; this.t = 0; this.amassa = 0; this.amassaV = 0; this.tchau = 0; this.inclina = 0; this.rola = 0; this.agua = 0; this.sobe = 0;
  }

  /** Troca o modelo (grupo com pés em y = 0, de frente para +Z, altura `alturaModelo`). */
  usarModelo(grupo, alturaModelo = 1.1) {
    if (this.modelo) { this.corpo.remove(this.modelo); this.modelo.traverse((o) => { if (o.isMesh) { o.geometry.dispose(); const m = o.material; if (m.map) m.map.dispose(); m.dispose(); } }); }
    this.modelo = grupo;
    const k = this.altura / alturaModelo;
    grupo.scale.setScalar(k);
    this.corpo.add(grupo);
    this.mao.position.set(0.38 * this.altura, this.altura * 1.02, 0);
    this.balao.position.set(0, this.altura * 1.22, 0);
  }

  set sombras(on) { this.corpo.traverse((o) => { if (o.isMesh) o.castShadow = on; }); }

  /** Dispara o tchau (dura ~1,6 s). */
  acenar() { this.tchau = 1.6; }
  /** Pulo: antecipação (amassa) — quem chama aplica a velocidade para cima. */
  impulso() { this.amassaV -= 7; }
  /** Pousou depois de uma queda com velocidade vy (negativa). */
  pousar(vy) { this.amassaV += clamp(-vy, 0, 12) * 0.9; }

  /**
   * vel: velocidade no chão (m/s) · correr: velocidade de corrida (referência) · noAr: está pulando/caindo ·
   * vy: velocidade vertical · nadando: na água · alturaChao: y dos pés.
   */
  tick(dt, { vel = 0, correr = 5, noAr = false, vy = 0, nadando = false } = {}) {
    this.t += dt;
    const a = clamp(vel / correr, 0, 1), mm = this.menos ? 0.35 : 1;
    const freq = 2.4 + vel * 2.0;
    this.fase += dt * freq;
    // mola do amassar/esticar (amortecida)
    this.amassaV += (-this.amassa * 120 - this.amassaV * 11) * dt; this.amassa += this.amassaV * dt;
    this.agua = lerp(this.agua, nadando ? 1 : 0, 1 - Math.exp(-dt * 6));
    let bob = 0, rola = 0, inclina = 0, gira = 0;
    if (noAr) {
      inclina = clamp(-vy * 0.03, -0.18, 0.12) + a * 0.12; // estica subindo, inclina descendo
      this.fase = 0;
    } else if (vel > 0.15) {
      bob = Math.abs(Math.sin(this.fase * Math.PI)) * (0.035 + 0.07 * a) * this.altura * mm;
      rola = Math.sin(this.fase * Math.PI) * (0.07 - 0.02 * a) * mm;
      inclina = (0.06 + 0.16 * a) * mm;
      gira = Math.sin(this.fase * Math.PI) * 0.06 * mm;
    } else {
      // parado: respira e balança de leve
      bob = 0; rola = Math.sin(this.t * 0.9) * 0.018 * mm; inclina = Math.sin(this.t * 0.7) * 0.012 * mm;
    }
    // tchau: pulinhos e balanço de lado
    let pulinho = 0;
    if (this.tchau > 0) {
      this.tchau -= dt;
      const k = 1.6 - this.tchau;
      pulinho = Math.abs(Math.sin(k * Math.PI * 2.5)) * 0.1 * this.altura * mm * (vel < 0.3 ? 1 : 0.3);
      rola += Math.sin(k * Math.PI * 5) * 0.12 * mm;
      this.mao.visible = true;
      this.mao.material.rotation = Math.sin(k * Math.PI * 6) * 0.5;
      this.mao.material.opacity = clamp(this.tchau * 3, 0, 1);
    } else this.mao.visible = false;
    // nado: deita para a frente e boia
    const deitado = this.agua * (vel > 0.3 ? 1.15 : 0.35);
    inclina = lerp(inclina, deitado, this.agua);
    if (this.agua > 0.01) { bob = lerp(bob, Math.sin(this.t * 3.1) * 0.05 * this.altura * mm, this.agua); rola = lerp(rola, Math.sin(this.fase * Math.PI) * 0.18 * mm, this.agua * a); }
    const k = 1 - Math.exp(-dt * 14);
    this.inclina = lerp(this.inclina, inclina, k); this.rola = lerp(this.rola, rola, k);
    this.pivo.rotation.set(this.inclina, gira, this.rola, 'YXZ');
    // amassa (negativo = estica). Respirar quando parado.
    const resp = vel < 0.15 && !noAr ? Math.sin(this.t * 2.3) * 0.012 * mm : 0;
    const s = clamp(this.amassa * 0.06, -0.16, 0.2);
    this.pivo.scale.set(1 + s * 0.55, 1 - s + resp, 1 + s * 0.55);
    this.corpo.position.y = bob + pulinho;
    // pivô um pouco acima dos pés quando deita na água (não afunda o rosto)
    this.corpo.position.z = 0;
  }

  /** Atualiza a sombra de contato: `altPe` = quanto os pés estão acima do chão. */
  sombraEm(altPe, naAgua) {
    this.sombra.position.y = -altPe + 0.03;
    const k = clamp(1 - altPe / 3, 0.25, 1);
    this.sombra.material.opacity = naAgua ? 0 : k;
    this.sombra.scale.setScalar(this.altura * 0.62 * (0.7 + 0.3 * k));
  }
}
