// FONEMA · Mundo 3D v2 — BONECOS do passeio em 3ª pessoa (a criança e os bonecos da vila).
//
// O app manda cada boneco já pronto num "pacote" (app/web/src/avatar3d/pacote.ts): malhas com posição, normal, UV e a
// textura (ImageBitmap) — o avatar da criança com as cores dela, a Sofia, o Tales, o Bolota e crianças da vila
// (o mesmo modelo do avatar recolorido). Pés no chão (y = 0), de frente para +Z, em metros.
// Sem o app (página aberta sozinha) ou enquanto o pacote não chega, entra a RESERVA: um bonequinho feito em código.
//
// Os modelos 3D chegam como malhas inteiras, SEM esqueleto. Ao entrar no passeio, cada um ganha um esqueleto automático
// (js/esqueleto.js: pernas, braços, tronco e cabeça achados pela forma da malha) e a animação mexe os ossos: passos de
// verdade, braços balançando, tchau com o braço, pulo e nado (fila do dono nº 21, 18/11).
import * as THREE from 'three';
import { addRim, radialTex, canvasTex, clamp, lerp } from './kit.js';
import { articular } from './esqueleto.js';
import { Animador, carregarAnimacoes, animacoesProntas } from './animacoes.js';

carregarAnimacoes();

const _cab = new THREE.Vector3(), _raiz = new THREE.Vector3(), _e = new THREE.Euler(), _qt = new THREE.Quaternion();
const sst = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };

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

/** Silhueta clarinha que aparece quando algo fica na frente do boneco (varal, poste, árvore, degrau, água funda). */
function materialSilhueta() {
  const m = new THREE.MeshBasicMaterial({ color: '#FFF1C9', transparent: true, opacity: 0.42, depthWrite: false, depthFunc: THREE.GreaterDepth, fog: false });
  // empurra a silhueta 0,35 m para perto da câmera: assim um braço na frente da barriga (o próprio corpo) não acende
  m.onBeforeCompile = (sh) => { sh.vertexShader = sh.vertexShader.replace('#include <project_vertex>', '#include <project_vertex>\n  mvPosition.z += 0.35; gl_Position = projectionMatrix * mvPosition;'); };
  m.customProgramCacheKey = () => 'silhueta-boneco';
  return m;
}

/**
 * Boneco animado. `raiz` vai para a cena (posição e giro no mundo); dentro dela, `pivo` recebe as inclinações do corpo
 * inteiro (nado deitado) e o amassar/esticar do PULO, e `corpo` recebe o modelo (trocável: reserva → avatar de verdade).
 * O modelo ganha ESQUELETO automático (js/esqueleto.js): pernas que dão passos de verdade (o pé de apoio fica no chão:
 * a cadência acompanha a velocidade), braços que balançam ao contrário das pernas, tronco que gira de leve, tchau com o
 * braço, pulo com pernas encolhidas e nado de crawl com a cabeça para fora. Sem esqueleto (falha na leitura), o corpo
 * inteiro só se inclina, sem quicar.
 * Altura final = `altura` metros (o modelo é escalado).
 */
export class Boneco {
  constructor({ altura = 1.5, nome = '', menosMovimento = false, silhueta = false } = {}) {
    this.altura = altura; this.menos = menosMovimento; this.nome = nome; this.comSilhueta = silhueta;
    this.raiz = new THREE.Group(); this.raiz.name = `boneco-${nome}`;
    this.pivo = new THREE.Group(); this.raiz.add(this.pivo);
    this.corpo = new THREE.Group(); this.pivo.add(this.corpo);
    // sombra de contato (sempre, também sem sombras do sol)
    this.sombra = new THREE.Mesh(new THREE.CircleGeometry(0.5, 24).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: SOMBRA_TEX, transparent: true, depthWrite: false, fog: false }));
    this.sombra.renderOrder = 1; this.sombra.scale.setScalar(altura * 0.62); this.raiz.add(this.sombra);
    // mãozinha do tchau (sprite pequeno junto da mão) e balão de conversa
    this.mao = new THREE.Sprite(new THREE.SpriteMaterial({ map: MAO_TEX, transparent: true, depthTest: false, fog: false }));
    this.mao.scale.setScalar(0.42); this.mao.visible = false; this.mao.renderOrder = 6; this.raiz.add(this.mao);
    this.balao = new THREE.Sprite(new THREE.SpriteMaterial({ map: BALAO_TEX, transparent: true, depthTest: false, fog: false }));
    this.balao.scale.setScalar(0.62); this.balao.visible = false; this.balao.renderOrder = 6; this.raiz.add(this.balao);
    this.modelo = null; this.rig = null; this.silhuetas = [];
    // estado da animação
    this.fase = 0; this.t = 0; this.amassa = 0; this.amassaV = 0; this.tchau = 0; this.inclina = 0; this.rola = 0; this.agua = 0;
    this.ar = 0; this.vau = 0; this.nadoFase = 0; this.passo = 0; this.velSuave = 0;
  }

  /** Troca o modelo (grupo com pés em y = 0, de frente para +Z, altura `alturaModelo`). */
  usarModelo(grupo, alturaModelo = 1.1) {
    if (this.modelo) {
      this.corpo.remove(this.modelo);
      this.modelo.traverse((o) => { if (o.isMesh) { o.geometry.dispose(); const m = o.material; if (m.map) m.map.dispose(); m.dispose(); } });
      for (const s of this.silhuetas) s.material.dispose();
      this.silhuetas = [];
    }
    this.modelo = grupo;
    const k = this.altura / alturaModelo;
    this.k = k;
    grupo.scale.setScalar(k);
    this.corpo.add(grupo);
    this.rig = null;
    try { this.rig = articular(grupo); } catch (e) { console.warn('[boneco] sem esqueleto', this.nome, e); }
    this.anim = this.rig && this.rig.medidas.temPernas ? new Animador(this.rig, k) : null; // bicho sem pernas: gingado em código
    if (this.rig && this.comSilhueta) {
      const mat = materialSilhueta();
      for (const sk of this.rig.malhas) {
        const s = new THREE.SkinnedMesh(sk.geometry, mat);
        s.position.copy(sk.position); s.quaternion.copy(sk.quaternion); s.scale.copy(sk.scale);
        s.renderOrder = 5; s.frustumCulled = false; s.castShadow = false;
        grupo.add(s); s.bind(this.rig.esqueleto, sk.bindMatrix);
        this.silhuetas.push(s);
      }
    }
    this.mao.position.set(-0.42 * this.altura, this.altura * 1.0, 0);
    this.balao.position.set(0, this.altura * 1.22, 0);
  }

  set sombras(on) { this.corpo.traverse((o) => { if (o.isMesh && !this.silhuetas.includes(o)) o.castShadow = on; }); }

  /** Dispara o tchau (dura ~1,6 s). */
  acenar() { this.tchau = 1.6; }
  /** Pulo: antecipação (amassa) — quem chama aplica a velocidade para cima. */
  impulso() { this.amassaV -= 5; }
  /** Pousou depois de uma queda com velocidade vy (negativa). */
  pousar(vy) { this.amassaV += clamp(-vy, 0, 12) * 0.6; this.pousou = true; }
  /** Altura (acima dos pés) do ponto em que o corpo gira para deitar na água: quem nada põe este ponto na superfície. */
  get alturaNado() { return this.altura * 0.52; }
  /** Onde fica a raiz em relação à superfície quando nada: com captura, na superfície (a cabeça é posta para fora
   *  medindo o osso); sem ela, abaixo, para o corpo deitado ficar na linha d'água. */
  get baseNado() { return this.anim && animacoesProntas() ? 0 : -this.alturaNado + 0.05; }
  /** Altura (no mundo) da cabeça, ou null. */
  cabecaY() { return this.rig ? this.rig.ossos.cabeca.getWorldPosition(_cab).y : null; }

  /**
   * vel: velocidade no chão (m/s) · correr: velocidade de corrida (referência) · noAr: está pulando/caindo ·
   * vy: velocidade vertical · nadando: na água funda · vau: 0..1 água rasa (até a cintura).
   */
  tick(dt, { vel = 0, correr = 5, noAr = false, vy = 0, nadando = false, vau = 0, falando = false, mergulho = 0, fundura = this.altura * 0.72 } = {}) {
    this.t += dt;
    const mm = this.menos ? 0.5 : 1;
    const kf = (r) => 1 - Math.exp(-dt * r);
    this.velSuave = lerp(this.velSuave, vel, kf(10));
    const v = this.velSuave;
    const a = clamp(v / correr, 0, 1);
    // mola do amassar/esticar (só no pulo e na queda)
    this.amassaV += (-this.amassa * 120 - this.amassaV * 11) * dt; this.amassa += this.amassaV * dt;
    this.agua = lerp(this.agua, nadando ? 1 : 0, kf(5));
    this.vau = lerp(this.vau, nadando ? 0 : vau, kf(5));
    this.ar = lerp(this.ar, noAr ? 1 : 0, kf(noAr ? 14 : 18));
    // ---- passada: a cadência sai do tamanho do passo, para o pé de apoio não escorregar ----
    const L = this.rig ? this.rig.medidas.perna * this.k : this.altura * 0.3;
    const andar = sst(0.08, 0.35, v) * (1 - this.ar) * (1 - this.agua);
    const amp = (0.26 + 0.5 * a) * (1 - 0.35 * this.vau); // abertura da coxa (rad)
    const passo = 2 * L * Math.sin(amp) * (1 + 0.45 * sst(0.55, 0.9, a)); // na corrida há um instante no ar
    if (v > 0.03) this.fase += dt * Math.PI * v / Math.max(0.12, passo);
    else this.fase = lerp(this.fase, Math.round(this.fase / Math.PI) * Math.PI, kf(6)); // parado: pés juntos
    const f = this.fase;
    // ---- tchau ----
    let tch = 0, kt = 0;
    if (this.tchau > 0) {
      this.tchau -= dt; kt = 1.6 - this.tchau;
      tch = sst(0, 0.25, kt) * sst(0, 0.3, this.tchau);
      this.mao.visible = !this.rig; // com braço de verdade, a mãozinha flutuante só no boneco sem esqueleto
      this.mao.material.rotation = Math.sin(kt * Math.PI * 6) * 0.5;
      this.mao.material.opacity = clamp(this.tchau * 3, 0, 1);
    } else this.mao.visible = false;

    // ---- com captura de movimento (js/animacoes.js) ----
    if (this.anim && this.anim.passo(dt, { vel: v, noAr, nadando, falando, pousou: this.pousou })) {
      this.pousou = false;
      this.mergulho = lerp(this.mergulho || 0, mergulho, kf(3));
      this.pivo.position.y = 0; this.pivo.scale.set(1, 1, 1);
      // mergulho: o corpo aponta para baixo na descida e volta a ficar reto lá embaixo
      this.pivo.rotation.set(this.mergulho * 0.35 * this.agua, 0, 0, 'YXZ');
      this.anim.aplicar();
      this.posarTchau(tch, kt);
      // na água: a cabeça fica fora (ou, no mergulho, bem embaixo) — mede onde a cabeça ficou e ajusta o corpo
      if (this.agua > 0.01) {
        this.corpo.position.y = 0;
        this.raiz.updateMatrixWorld(true);
        const cab = this.rig.ossos.cabeca.getWorldPosition(_cab).y - this.raiz.getWorldPosition(_raiz).y;
        const alvo = lerp(this.altura * 0.05, -fundura, this.mergulho) + Math.sin(this.t * 2.4) * 0.025 * mm * (1 - this.mergulho);
        this.boia = lerp(this.boia ?? 0, alvo - cab, this.boia === undefined ? 1 : kf(10));
        this.corpo.position.y = this.boia * this.agua;
      } else { this.corpo.position.y = 0; this.boia = undefined; }
      return;
    }

    // ---- sem captura (ainda carregando): corpo inteiro só inclina (nada de quicar) ----
    const hp = this.agua * this.alturaNado;
    const deitado = this.agua * (1.22 + 0.12 * Math.sin(this.t * 2.2) * mm);
    let incl = 0.035 * a * (1 - this.agua) + deitado;
    if (!this.rig && this.ar < 0.5) incl += andar * 0.05;
    let rola = this.agua * Math.sin(this.nadoFase) * 0.12 * mm;
    // bicho sem pernas separadas (Bolota): gingado de um lado para o outro no ritmo dos passos, sem pular
    if (this.rig && !this.rig.medidas.temPernas) rola += Math.sin(this.fase) * 0.13 * andar * mm;
    this.inclina = lerp(this.inclina, incl, kf(10)); this.rola = lerp(this.rola, rola, kf(10));
    this.pivo.position.y = hp;
    this.pivo.rotation.set(this.inclina, 0, this.rola, 'YXZ');
    const s = clamp(this.amassa * 0.045, -0.12, 0.14);
    this.pivo.scale.set(1 + s * 0.5, 1 - s, 1 + s * 0.5);
    // o quadril desce um tiquinho quando as pernas abrem (passada de verdade) e boia na água
    const queda = L * (1 - Math.cos(amp * Math.abs(Math.sin(f)))) * 0.55 * andar;
    this.corpo.position.y = -hp - queda + this.agua * Math.sin(this.t * 2.6) * 0.03 * mm;
    if (!this.rig) return;

    // ---- ossos ----
    const O = this.rig.ossos;
    for (const nm in O) { const b = O[nm]; b.rotation.set(0, 0, 0); b.position.copy(b.userData.rep); }
    const resp = Math.sin(this.t * 2.3) * 0.025 * mm, parado = 1 - sst(0.05, 0.3, v);
    // tronco
    O.tronco.rotation.y = Math.sin(f) * 0.12 * (0.4 + a) * andar * mm;
    O.peito.rotation.x = (0.04 + 0.12 * a) * andar + resp * parado + 0.15 * this.ar;
    O.peito.rotation.y = -Math.sin(f) * 0.05 * andar * mm;
    O.cabeca.rotation.x = -(0.04 + 0.1 * a) * andar - 0.85 * this.agua;
    O.cabeca.rotation.y = Math.sin(this.t * 0.45) * 0.12 * parado * (1 - tch) * mm;
    O.quadril.rotation.y = -Math.sin(f) * 0.06 * andar * mm;
    // pernas e braços (E = fase f; D = fase f + π)
    const nado = this.nadoFase += dt * (this.agua > 0.05 ? (v > 0.3 ? 4.2 : 2.2) : 0);
    for (const [sd, L2, ph] of [[1, 'E', 0], [-1, 'D', Math.PI]]) {
      const sn = Math.sin(f + ph), cs = Math.cos(f + ph);
      // andar: coxa vai para a frente (rotação x negativa) e o joelho dobra quando a perna volta pelo ar
      let coxa = -amp * sn * andar, canela = (0.08 + (0.55 + 0.95 * a) * Math.max(0, cs) ** 1.5) * andar;
      // pulo: encolhe as pernas
      coxa = lerp(coxa, -0.55 - clamp(vy, -6, 6) * 0.03 + (sd > 0 ? 0.12 : -0.1), this.ar);
      canela = lerp(canela, 0.95, this.ar);
      // nado: pernas esticadas batendo
      const bate = Math.sin(this.t * 9 + ph) * 0.32 * mm;
      coxa = lerp(coxa, bate, this.agua); canela = lerp(canela, 0.18 + Math.max(0, -bate) * 0.6, this.agua);
      O['coxa' + L2].rotation.x = coxa; O['canela' + L2].rotation.x = canela;
      O['coxa' + L2].rotation.z = sd * 0.02;
      // braços: balançam ao contrário da perna do mesmo lado
      const ab = 0.07 + 0.08 * a + 0.55 * this.vau; // abre um pouco do corpo (e bem aberto no rio raso)
      let bx = amp * 1.05 * sn * andar * mm + resp * 0.8 * parado, bz = sd * ab, ax = -(0.12 + 0.95 * a) * andar - 0.08;
      // pulo: braços para cima e para fora
      bx = lerp(bx, -0.3, this.ar); bz = lerp(bz, sd * 0.6, this.ar); ax = lerp(ax, -0.25, this.ar);
      // nado (crawl): o braço dá a volta inteira, um de cada vez
      if (this.agua > 0.01) {
        const g = nado + ph;
        bx = lerp(bx, -((g % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2), this.agua > 0.5 ? 1 : 0);
        bz = lerp(bz, sd * (0.18 + 0.12 * Math.max(0, Math.sin(g))), this.agua);
        ax = lerp(ax, -0.25 - 0.35 * Math.max(0, Math.sin(g)), this.agua);
      }
      O['braco' + L2].rotation.x = bx; O['braco' + L2].rotation.z = bz; O['antebraco' + L2].rotation.x = ax;
    }
    this.posarTchau(tch, kt);
  }

  /** Tchau por cima da pose: braço direito (lado D) levantado e antebraço abanando. */
  posarTchau(tch, kt) {
    if (!(tch > 0) || !this.rig) return;
    const O = this.rig.ossos;
    _e.set(-0.25, 0, -1.5); _qt.setFromEuler(_e); O.bracoD.quaternion.slerp(_qt, tch);
    _e.set(-0.2, 0, -1.2 + Math.sin(kt * Math.PI * 5.5) * 0.45); _qt.setFromEuler(_e); O.antebracoD.quaternion.slerp(_qt, tch);
    _e.set(0, 0, -0.06 * tch); _qt.setFromEuler(_e); O.peito.quaternion.multiply(_qt);
  }

  /** Atualiza a sombra de contato: `altPe` = quanto os pés estão acima do chão. */
  sombraEm(altPe, naAgua) {
    this.sombra.position.y = -altPe + 0.03;
    const k = clamp(1 - altPe / 3, 0.25, 1);
    this.sombra.material.opacity = naAgua ? 0 : k;
    this.sombra.scale.setScalar(this.altura * 0.62 * (0.7 + 0.3 * k));
  }
}
