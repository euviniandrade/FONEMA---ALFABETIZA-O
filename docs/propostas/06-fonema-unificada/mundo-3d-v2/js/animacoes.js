// FONEMA · Mundo 3D v2 — ANIMAÇÕES DE CAPTURA DE MOVIMENTO nos bonecos do passeio (fila do dono nº 21 e 24).
//
// As animações vêm da "Universal Animation Library" (Standard) de Quaternius, CC0 1.0 (assets/animacoes/LEIAME.md),
// preparadas por ferramentas/animacoes-ual.mjs: posição de cada junta e rotação do tronco, quadro a quadro.
// Aqui elas são REAPLICADAS no esqueleto automático de cada boneco (js/esqueleto.js), que tem outras proporções
// (cabeção, pernas e braços curtos) e outra pose de descanso (braços para baixo, não em T):
//  - quadril, tronco, peito e cabeça recebem a mesma rotação que a captura fez a partir da pose de descanso;
//  - coxa, canela, braço e antebraço são girados para apontar na MESMA DIREÇÃO que o osso da captura (assim o braço
//    curto do boneco faz o mesmo gesto do braço comprido do manequim);
//  - o quadril sobe e desce como na captura, na escala da perna do boneco.
// Locomoção: andar, trotar e correr se misturam pela velocidade e tocam na cadência que faz o pé de apoio ficar parado
// no chão (a velocidade natural de cada animação foi medida pelo pé). Também: parado, conversar, pulo (no ar e chegada),
// nadar e boiar.
import * as THREE from 'three';

let DADOS = null, pedido = null;
/** Baixa as animações (uma vez). Os bonecos usam a animação feita em código até elas chegarem (ou se falhar). */
export function carregarAnimacoes() {
  if (!pedido) pedido = fetch(new URL('../assets/animacoes/ual.json', import.meta.url)).then((r) => (r.ok ? r.json() : null)).then((d) => { DADOS = d && prepararDados(d); return DADOS; }).catch((e) => { console.warn('[animacoes] sem captura de movimento', e); return null; });
  return pedido;
}
export const animacoesProntas = () => !!DADOS;

function prepararDados(d) {
  const J = d.juntas.length, G = d.giros.length;
  const ij = Object.fromEntries(d.juntas.map((k, i) => [k, i])), ig = Object.fromEntries(d.giros.map((k, i) => [k, i]));
  for (const c of Object.values(d.clipes)) { c.P = Float32Array.from(c.P); c.R = Float32Array.from(c.R); c.dist = c.vel * c.duracao; }
  const rep = { P: Float32Array.from(d.repouso.P), R: Float32Array.from(d.repouso.R) };
  return { ...d, J, G, ij, ig, rep };
}

/** Quadro misturado: posições das juntas (J×3) e rotações do tronco (G×4). */
class Quadro {
  constructor(J, G) { this.P = new Float32Array(J * 3); this.R = new Float32Array(G * 4); this.peso = 0; }
  zerar() { this.P.fill(0); this.R.fill(0); this.peso = 0; }
  /** Soma o clipe `c` no instante `u` (0..1 do ciclo) com peso `w`. */
  somar(c, u, w) {
    if (w <= 1e-4) return;
    const n = c.quadros, f = c.loop ? (((u % 1) + 1) % 1) * n : Math.min(n - 1.001, Math.max(0, u) * (n - 1));
    const a = Math.floor(f), b = c.loop ? (a + 1) % n : Math.min(n - 1, a + 1), t = f - a;
    const P = this.P, R = this.R, np = P.length, nr = R.length;
    for (let i = 0; i < np; i++) P[i] += w * (c.P[a * np + i] * (1 - t) + c.P[b * np + i] * t);
    for (let g = 0; g < nr; g += 4) {
      // quatérnio: soma com o sinal alinhado ao que já está somado (depois normaliza)
      let qa0 = c.R[a * nr + g], qa1 = c.R[a * nr + g + 1], qa2 = c.R[a * nr + g + 2], qa3 = c.R[a * nr + g + 3];
      let qb0 = c.R[b * nr + g], qb1 = c.R[b * nr + g + 1], qb2 = c.R[b * nr + g + 2], qb3 = c.R[b * nr + g + 3];
      if (qa0 * qb0 + qa1 * qb1 + qa2 * qb2 + qa3 * qb3 < 0) { qb0 = -qb0; qb1 = -qb1; qb2 = -qb2; qb3 = -qb3; }
      let x = qa0 * (1 - t) + qb0 * t, y = qa1 * (1 - t) + qb1 * t, z = qa2 * (1 - t) + qb2 * t, ww = qa3 * (1 - t) + qb3 * t;
      if (R[g] * x + R[g + 1] * y + R[g + 2] * z + R[g + 3] * ww < 0) { x = -x; y = -y; z = -z; ww = -ww; }
      R[g] += w * x; R[g + 1] += w * y; R[g + 2] += w * z; R[g + 3] += w * ww;
    }
    this.peso += w;
  }
  fechar() {
    const k = this.peso > 0 ? 1 / this.peso : 0;
    for (let i = 0; i < this.P.length; i++) this.P[i] *= k;
    for (let g = 0; g < this.R.length; g += 4) { const R = this.R, l = Math.hypot(R[g], R[g + 1], R[g + 2], R[g + 3]) || 1; R[g] /= l; R[g + 1] /= l; R[g + 2] /= l; R[g + 3] /= l; }
  }
}

const _e = new THREE.Euler(), _q = new THREE.Quaternion(), _q2 = new THREE.Quaternion(), _qi = new THREE.Quaternion(), _a = new THREE.Vector3(), _b = new THREE.Vector3(), _c = new THREE.Vector3();

/**
 * Animador de um boneco com esqueleto automático. `rig` = articular(...). `k` = escala do modelo (metros por unidade).
 * A cada quadro: animador.passo(dt, estado) e depois animador.aplicar() mexe os ossos.
 */
export class Animador {
  constructor(rig, k) {
    this.rig = rig; this.k = k;
    this.fase = 0; this.tParado = 0; this.tAr = 0; this.tCai = 9; this.tNado = 0; this.tFala = 0;
    this.pLoc = 0; this.pAr = 0; this.pCai = 0; this.pNado = 0; this.pFala = 0; this.pMover = 0;
    this.q = null;
    // direções de descanso dos ossos do boneco (espaço do modelo; todos os ossos começam sem rotação)
    const O = rig.ossos, M = rig.medidas;
    const dir = (a, b) => _a.copy(b).sub(a).normalize().clone();
    // posição de descanso no espaço do modelo: soma das posições locais (nenhum osso tem rotação em descanso)
    const pw = (b) => { const v = new THREE.Vector3(); for (let o = b; o && o.isBone; o = o.parent) v.add(o.userData.rep); return v; };
    this.repDir = {};
    for (const L of ['E', 'D']) {
      const s = L === 'E' ? 1 : -1, l = M.lados[s];
      this.repDir['coxa' + L] = dir(pw(O['coxa' + L]), pw(O['canela' + L]));
      this.repDir['canela' + L] = new THREE.Vector3(0, -1, 0);
      this.repDir['braco' + L] = dir(pw(O['braco' + L]), pw(O['antebraco' + L]));
      const cot = pw(O['antebraco' + L]);
      const mao = new THREE.Vector3(M.cx + s * (l ? l.borda(l.mao) + 0.02 * M.H : 0.2 * M.H), l ? l.mao : M.virilha, cot.z);
      this.repDir['antebraco' + L] = dir(cot, mao);
      // quanto o braço do boneco fica aberto em descanso (cabeção e barriga redonda): a captura é somada a isso
      const d = this.repDir['braco' + L];
      this.abre = this.abre || {}; this.abre[L] = Math.max(0, Math.atan2(Math.abs(d.x), -d.y) - 0.1);
    }
    this.perna = M.perna * k; // m
  }

  /**
   * estado: { vel, noAr, nadando, agua (0..1), falando, pousou (bool, neste quadro) }
   */
  passo(dt, e) {
    const D = DADOS; if (!D) return false;
    const C = D.clipes, kf = (r) => 1 - Math.exp(-dt * r);
    const v = e.vel || 0;
    // pesos de estado (suaves)
    this.pAr += ((e.noAr ? 1 : 0) - this.pAr) * kf(e.noAr ? 12 : 16);
    this.pNado += ((e.nadando ? 1 : 0) - this.pNado) * kf(5);
    this.pMover += ((v > 0.12 ? 1 : 0) - this.pMover) * kf(8);
    this.pFala += ((e.falando ? 1 : 0) - this.pFala) * kf(4);
    if (e.pousou) this.tCai = 0;
    this.tCai += dt;
    this.pCai = e.noAr ? 0 : Math.max(0, 1 - this.tCai / 0.55);
    // locomoção: andar → trotar → correr pela velocidade (medida na perna do boneco)
    const L = Math.max(0.2, this.perna);
    const vAndar = C.andar.vel * L, vTrotar = C.trotar.vel * L, vCorrer = C.correr.vel * L;
    let wA, wT, wC;
    if (v <= vAndar * 1.6) { wA = 1; wT = 0; wC = 0; }
    else if (v <= vTrotar) { const t = (v - vAndar * 1.6) / Math.max(1e-3, vTrotar - vAndar * 1.6); wA = 1 - t; wT = t; wC = 0; }
    else { const t = Math.min(1, (v - vTrotar) / Math.max(1e-3, vCorrer - vTrotar)); wA = 0; wT = 1 - t; wC = t; }
    const dist = (wA * C.andar.dist + wT * C.trotar.dist + wC * C.correr.dist) * L; // metros por ciclo
    if (v > 0.03) this.fase += (dt * v) / Math.max(0.05, dist);
    this.tParado += dt; this.tAr += e.noAr ? dt : -this.tAr; this.tNado += dt; this.tFala += dt;
    // monta o quadro
    if (!this.q) { this.q = new Quadro(D.J, D.G); }
    const q = this.q; q.zerar();
    const chao = (1 - this.pAr) * (1 - this.pNado), noAr = this.pAr * (1 - this.pNado);
    const wMov = chao * this.pMover * (1 - this.pCai * 0.6), wPar = chao * (1 - this.pMover) * (1 - this.pCai * 0.6);
    q.somar(C.andar, this.fase, wMov * wA); q.somar(C.trotar, this.fase, wMov * wT); q.somar(C.correr, this.fase, wMov * wC);
    q.somar(C.parado, this.tParado / C.parado.duracao, wPar * (1 - this.pFala));
    q.somar(C.falar, this.tFala / C.falar.duracao, wPar * this.pFala);
    q.somar(C.puloCai, 0.18 + (this.tCai / 0.55) * 0.3, chao * this.pCai * 0.6);
    q.somar(C.puloAr, this.tAr / C.puloAr.duracao, noAr);
    const nadaMov = Math.min(1, v / 0.5);
    q.somar(C.nadar, this.tNado / C.nadar.duracao, this.pNado * nadaMov);
    q.somar(C.boiar, this.tNado / C.boiar.duracao, this.pNado * (1 - nadaMov));
    if (q.peso < 1e-3) q.somar(C.parado, this.tParado / C.parado.duracao, 1);
    q.fechar();
    return true;
  }

  /** Mexe os ossos para o quadro atual. Devolve a subida do quadril (m) para quem quiser usar. */
  aplicar() {
    const D = DADOS, q = this.q; if (!D || !q) return 0;
    const O = this.rig.ossos, P = q.P, R = q.R, ij = D.ij, ig = D.ig, rep = D.rep;
    for (const nm in O) { const b = O[nm]; b.quaternion.identity(); b.position.copy(b.userData.rep); }
    // giros do tronco (mundo do modelo): W = R(t) · R(descanso)⁻¹
    const W = {};
    const giro = (nome) => { const g = ig[nome] * 4; _q.set(R[g], R[g + 1], R[g + 2], R[g + 3]); _qi.set(rep.R[g], rep.R[g + 1], rep.R[g + 2], rep.R[g + 3]).invert(); return _q.clone().multiply(_qi); };
    W.quadril = giro('quadril'); W.tronco = giro('tronco'); W.peito = giro('peito'); W.cabeca = giro('cabeca');
    // cabeção de desenho: a cabeça fica quase de pé (gira para os lados como na captura, mas inclina só um pouco),
    // senão o rosto fica olhando para o chão
    _e.setFromQuaternion(W.cabeca, 'YXZ'); _e.x *= 0.3; _e.z *= 0.4; W.cabeca.setFromEuler(_e);
    const local = (osso, Wpai, Wosso) => { O[osso].quaternion.copy(_q2.copy(Wpai).invert().multiply(Wosso)); };
    local('quadril', new THREE.Quaternion(), W.quadril);
    local('tronco', W.quadril, W.tronco);
    local('peito', W.tronco, W.peito);
    local('cabeca', W.peito, W.cabeca);
    const pj = (nome, out) => { const i = ij[nome] * 3; return out.set(P[i], P[i + 1], P[i + 2]); };
    const membro = (osso, Wpai, de, ate, abre = 0, ladoS = 1) => {
      const alvo = pj(ate, _b).sub(pj(de, _c)).normalize();
      if (abre) { _q.setFromAxisAngle(_a.set(0, 0, 1).applyQuaternion(W.peito), ladoS * abre); alvo.applyQuaternion(_q); }
      const atual = _a.copy(this.repDir[osso]).applyQuaternion(Wpai);
      const Wo = new THREE.Quaternion().setFromUnitVectors(atual, alvo).multiply(Wpai);
      local(osso, Wpai, Wo);
      return Wo;
    };
    for (const [L, s] of [['E', 1], ['D', -1]]) {
      const Wc = membro('coxa' + L, W.quadril, 'coxa' + L, 'joelho' + L);
      membro('canela' + L, Wc, 'joelho' + L, 'pe' + L);
      const Wb = membro('braco' + L, W.peito, 'ombro' + L, 'cotovelo' + L, this.abre[L] * (1 - 0.6 * this.pNado), s);
      membro('antebraco' + L, Wb, 'cotovelo' + L, 'mao' + L);
    }
    // quadril sobe e desce (e balança de lado) como na captura, na escala da perna do boneco
    const i = ij.quadril * 3, esc = this.rig.medidas.perna;
    const dy = (P[i + 1] - rep.P[i + 1]) * esc, dx = (P[i] - rep.P[i]) * esc;
    O.quadril.position.x += dx * 0.6; O.quadril.position.y += dy;
    return dy * this.k;
  }
}
