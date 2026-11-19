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
// Locomoção (refeita na fila nº 28, "parece que está pulando"): o "Jog" da biblioteca é um trote de adulto com o quadril
// subindo e descendo 1/4 da perna e muito tempo com os dois pés no ar; num boneco de perna curta, tocado na passada de
// adulto, virava salto. Agora só ANDAR e CORRER (Walk e Sprint), com:
//  - CADÊNCIA DE CRIANÇA (passos por segundo) escolhida pela velocidade, e a passada encolhida para caber nela (a
//    distância à frente/atrás do quadril dos pés e joelhos é multiplicada por `s`), então o pé de apoio não escorrega;
//  - os dois ciclos alinhados pelo instante em que o pé esquerdo pisa (o Sprint começa noutro ponto);
//  - PÉ NO CHÃO: o quadril é posto na altura em que o pé mais baixo (sola: calcanhar ou ponta) toca o chão — o pé
//    ganhou osso próprio (js/esqueleto.js) e fica com a sola na inclinação da captura (chapado no apoio);
//  - o tempo no ar da corrida é reduzido (o pé mais baixo sobe só 35% do que subia na captura).
// Também: parado, conversar, pulo (no ar e chegada), nadar e boiar.
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
  for (const c of Object.values(d.clipes)) { c.P = Float32Array.from(c.P); c.R = Float32Array.from(c.R); c.dist = c.vel * c.duracao; c.off = 0; }
  const rep = { P: Float32Array.from(d.repouso.P), R: Float32Array.from(d.repouso.R) };
  // fase em que o pé esquerdo está mais à frente (= vai pisar): Walk e Sprint passam a pisar no mesmo instante do ciclo
  const pisada = (c) => { const k = ij.peE * 3 + 2, q = ij.quadril * 3 + 2, np = J * 3; let m = -1e9, a = 0; for (let f = 0; f < c.quadros; f++) { const z = c.P[f * np + k] - c.P[f * np + q]; if (z > m) { m = z; a = f; } } return a / c.quadros; };
  const base = pisada(d.clipes.andar);
  for (const nm of ['trotar', 'correr']) d.clipes[nm].off = pisada(d.clipes[nm]) - base;
  return { ...d, J, G, ij, ig, rep };
}

/** Quadro misturado: posições das juntas (J×3) e rotações do tronco (G×4). */
class Quadro {
  constructor(J, G) { this.P = new Float32Array(J * 3); this.R = new Float32Array(G * 4); this.peso = 0; }
  zerar() { this.P.fill(0); this.R.fill(0); this.peso = 0; }
  /** Soma o clipe `c` no instante `u` (0..1 do ciclo) com peso `w`. */
  somar(c, u, w) {
    if (w <= 1e-4) return;
    const n = c.quadros; u += c.off || 0; const f = c.loop ? (((u % 1) + 1) % 1) * n : Math.min(n - 1.001, Math.max(0, u) * (n - 1));
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

const _m = new THREE.Matrix4(), _e = new THREE.Euler(), _q = new THREE.Quaternion(), _q2 = new THREE.Quaternion(), _qi = new THREE.Quaternion(), _a = new THREE.Vector3(), _b = new THREE.Vector3(), _c = new THREE.Vector3();

/**
 * Animador de um boneco com esqueleto automático. `rig` = articular(...). `k` = escala do modelo (metros por unidade).
 * A cada quadro: animador.passo(dt, estado) e depois animador.aplicar() mexe os ossos.
 */
// Cadência (ciclos de 2 passos por segundo) de criança por velocidade (m/s), e a faixa em que andar vira correr.
// Referência de ordem de grandeza: criança pequena anda com ~2,2–2,8 passos/s e corre com ~3–3,4 passos/s (decisão do
// projeto a partir da proporção do boneco; não é medida de laboratório).
const CAD_ANDAR = (v) => 0.92 + 0.3 * v, CAD_CORRER = (v) => 1.28 + 0.1 * v;
const CORRE_DE = 1.4, CORRE_ATE = 3.6; // m/s (no meio, um trote leve: parte andar, parte correr)
const S_MIN = 0.45, S_MAX = 1.25; // encolhe/estica a passada
const NO_AR = 0.2; // quanto do tempo no ar da corrida fica
const ESTICA = 0.6; // quanto a perna de apoio da corrida se estica (0 = como na captura)
const INCLINA = 0.55; // quanto da inclinação do tronco da captura sai (0 = toda fica)
const JUNTA = 0.5; // quanto os pés se aproximam da linha do quadril (lado a lado)

export class Animador {
  constructor(rig, k) {
    this.rig = rig; this.k = k;
    this.fase = 0; this.tParado = 0; this.tAr = 0; this.tCai = 9; this.tNado = 0; this.tFala = 0;
    this.pLoc = 0; this.pAr = 0; this.pCai = 0; this.pNado = 0; this.pFala = 0; this.pMover = 0; this.pCorre = 0;
    this.s = 1; this.q = null; this.altQuadril = 0;
    const O = rig.ossos, M = rig.medidas;
    const dir = (a, b) => _a.copy(b).sub(a).normalize().clone();
    // posição de descanso no espaço do modelo: soma das posições locais (nenhum osso tem rotação em descanso)
    const pw = (b) => { const v = new THREE.Vector3(); for (let o = b; o && o.isBone; o = o.parent) v.add(o.userData.rep); return v; };
    this.pw = pw;
    this.repDir = {};
    for (const L of ['E', 'D']) {
      const s = L === 'E' ? 1 : -1, l = M.lados[s];
      this.repDir['coxa' + L] = dir(pw(O['coxa' + L]), pw(O['canela' + L]));
      this.repDir['canela' + L] = O['pe' + L] ? dir(pw(O['canela' + L]), pw(O['pe' + L])) : new THREE.Vector3(0, -1, 0);
      this.repDir['braco' + L] = dir(pw(O['braco' + L]), pw(O['antebraco' + L]));
      const cot = pw(O['antebraco' + L]);
      const mao = new THREE.Vector3(M.cx + s * (l ? l.borda(l.mao) + 0.02 * M.H : 0.2 * M.H), l ? l.mao : M.virilha, cot.z);
      this.repDir['antebraco' + L] = dir(cot, mao);
      const d = this.repDir['braco' + L];
      this.abre = this.abre || {}; this.abre[L] = Math.max(0, Math.atan2(Math.abs(d.x), -d.y) - 0.1);
    }
    this.perna = M.perna * k; // m
    // sola do sapato: pontos no espaço do osso do pé (calcanhar e ponta), para achar o ponto mais baixo a cada quadro
    this.sola = {};
    if (O.peE && M.sapato) for (const L of ['E', 'D']) {
      const p0 = pw(O['pe' + L]);
      this.sola[L] = [new THREE.Vector3(0, -p0.y, M.sapato.calcanhar[L] - p0.z), new THREE.Vector3(0, -p0.y, M.sapato.ponta[L] - p0.z)];
    }
    this.repPe = null; // direção pé→ponta na pose de descanso da captura (fica pronta quando as animações chegam)
  }

  /**
   * estado: { vel, noAr, nadando, agua (0..1), falando, pousou (bool, neste quadro) }
   */
  passo(dt, e) {
    const D = DADOS; if (!D) return false;
    const C = D.clipes, kf = (r) => 1 - Math.exp(-dt * r);
    const v = e.vel || 0;
    this.pAr += ((e.noAr ? 1 : 0) - this.pAr) * kf(e.noAr ? 12 : 16);
    this.pNado += ((e.nadando ? 1 : 0) - this.pNado) * kf(5);
    this.pMover += ((v > 0.12 ? 1 : 0) - this.pMover) * kf(8);
    this.pFala += ((e.falando ? 1 : 0) - this.pFala) * kf(4);
    if (e.pousou) this.tCai = 0;
    this.tCai += dt;
    this.pCai = e.noAr ? 0 : Math.max(0, 1 - this.tCai / 0.55);
    // andar ↔ correr pela velocidade (suave, sem ir e voltar)
    const tc = Math.min(1, Math.max(0, (v - CORRE_DE) / (CORRE_ATE - CORRE_DE)));
    this.pCorre += (tc * tc * (3 - 2 * tc) - this.pCorre) * kf(6);
    const wA = 1 - this.pCorre, wC = this.pCorre;
    const L = Math.max(0.2, this.perna);
    const vv = Math.max(0.3, v);
    const cad = wA * CAD_ANDAR(vv) + wC * CAD_CORRER(vv);
    const dist = (wA * C.andar.dist + wC * C.correr.dist) * L; // metros por ciclo com a passada inteira
    let s = vv / Math.max(1e-3, cad * dist);
    s = Math.min(S_MAX, Math.max(S_MIN, s));
    this.s += (s - this.s) * kf(10);
    // a cadência final sai da passada escolhida: o pé de apoio anda para trás na velocidade do corpo (não escorrega)
    if (v > 0.03) this.fase += (dt * v) / Math.max(0.05, this.s * dist);
    this.tParado += dt; this.tAr += e.noAr ? dt : -this.tAr; this.tNado += dt; this.tFala += dt;
    if (!this.q) { this.q = new Quadro(D.J, D.G); this.qL = new Quadro(D.J, D.G); }
    const q = this.q; q.zerar();
    const chao = (1 - this.pAr) * (1 - this.pNado), noAr = this.pAr * (1 - this.pNado);
    const wMov = chao * this.pMover * (1 - this.pCai * 0.6), wPar = chao * (1 - this.pMover) * (1 - this.pCai * 0.6);
    // locomoção num quadro à parte: a passada é encolhida antes de entrar na mistura
    const ql = this.qL; ql.zerar();
    ql.somar(C.andar, this.fase, wA); ql.somar(C.correr, this.fase, wC); ql.fechar();
    this.encolher(ql, this.s);
    if (wMov > 1e-4) { for (let i = 0; i < q.P.length; i++) q.P[i] += wMov * ql.P[i]; for (let i = 0; i < q.R.length; i++) q.R[i] += wMov * ql.R[i]; q.peso += wMov; }
    q.somar(C.parado, this.tParado / C.parado.duracao, wPar * (1 - this.pFala));
    q.somar(C.falar, this.tFala / C.falar.duracao, wPar * this.pFala);
    q.somar(C.puloCai, 0.18 + (this.tCai / 0.55) * 0.3, chao * this.pCai * 0.6);
    q.somar(C.puloAr, this.tAr / C.puloAr.duracao, noAr);
    const nadaMov = Math.min(1, v / 0.5);
    q.somar(C.nadar, this.tNado / C.nadar.duracao, this.pNado * nadaMov);
    q.somar(C.boiar, this.tNado / C.boiar.duracao, this.pNado * (1 - nadaMov));
    if (q.peso < 1e-3) q.somar(C.parado, this.tParado / C.parado.duracao, 1);
    q.fechar();
    // quanto do ponto mais baixo do pé a captura levanta (corrida: tempo no ar), já reduzido
    this.chaoPeso = chao * (1 - this.pAr);
    return true;
  }

  /** Encolhe a passada: joelhos, pés e mãos ficam mais perto do quadril/ombro na direção da frente (z). */
  encolher(ql, s) {
    const D = DADOS, P = ql.P, ij = D.ij;
    const zq = P[ij.quadril * 3 + 2];
    for (const L of ['E', 'D']) {
      const iz = (nm) => ij[nm + L] * 3 + 2;
      const pe0 = P[iz('pe')];
      for (const nm of ['joelho', 'pe']) P[iz(nm)] = zq + (P[iz(nm)] - zq) * s;
      P[iz('ponta')] += P[iz('pe')] - pe0; // o pé não encolhe: a ponta acompanha o tornozelo
      // perna de apoio menos dobrada (o corredor adulto afunda no apoio; no boneco isso parecia agachar a cada passo):
      // o joelho vai em direção à reta quadril→tornozelo, mais quanto mais perto do chão está o pé
      const ic = ij['coxa' + L] * 3, ik = ij['joelho' + L] * 3, ip = ij['pe' + L] * 3;
      const apoio = 1 - Math.min(1, Math.max(0, (P[ip + 1] - D.rep.P[ip + 1]) / 0.12));
      const a = ESTICA * apoio * (0.4 + 0.6 * this.pCorre);
      if (a > 0) for (let c = 0; c < 3; c++) P[ik + c] += ((P[ic + c] + P[ip + c]) / 2 - P[ik + c]) * a;
      const sb = Math.min(1, 0.35 + 0.65 * s), zo = P[iz('ombro')];
      for (const nm of ['cotovelo', 'mao']) P[iz(nm)] = zo + (P[iz(nm)] - zo) * sb;
      // braços da corrida mais junto do corpo (somados à abertura do boneco, abriam como asa vistos de trás)
      const xo = P[iz('ombro') - 2], sx = 1 - 0.45 * this.pCorre;
      for (const nm of ['cotovelo', 'mao']) P[iz(nm) - 2] = xo + (P[iz(nm) - 2] - xo) * sx;
    }
  }

  /** Mexe os ossos para o quadro atual. */
  aplicar() {
    const D = DADOS, q = this.q; if (!D || !q) return 0;
    const O = this.rig.ossos, P = q.P, R = q.R, ij = D.ij, ig = D.ig, rep = D.rep;
    for (const nm in O) { const b = O[nm]; b.quaternion.identity(); b.position.copy(b.userData.rep); }
    const W = {};
    const giro = (nome) => { const g = ig[nome] * 4; _q.set(R[g], R[g + 1], R[g + 2], R[g + 3]); _qi.set(rep.R[g], rep.R[g + 1], rep.R[g + 2], rep.R[g + 3]).invert(); return _q.clone().multiply(_qi); };
    W.quadril = giro('quadril'); W.tronco = giro('tronco'); W.peito = giro('peito'); W.cabeca = giro('cabeca');
    // tronco menos inclinado para a frente: com o cabeção, a inclinação do corredor adulto vira "corcunda olhando o chão"
    // (fora d'água; nadando o corpo deita como na captura)
    const fi = 1 - INCLINA * (1 - this.pNado);
    for (const nm of ['quadril', 'tronco', 'peito']) { _e.setFromQuaternion(W[nm], 'YXZ'); _e.x *= fi; W[nm].setFromEuler(_e); }
    _e.setFromQuaternion(W.cabeca, 'YXZ'); _e.x *= 0.3 - 0.15 * this.pMover * (1 - this.pNado); _e.z *= 0.4; W.cabeca.setFromEuler(_e);
    const local = (osso, Wpai, Wosso) => { O[osso].quaternion.copy(_q2.copy(Wpai).invert().multiply(Wosso)); };
    local('quadril', new THREE.Quaternion(), W.quadril);
    local('tronco', W.quadril, W.tronco);
    local('peito', W.tronco, W.peito);
    local('cabeca', W.peito, W.cabeca);
    const pj = (nome, out, ref = P) => { const i = ij[nome] * 3; return out.set(ref[i], ref[i + 1], ref[i + 2]); };
    const membro = (osso, Wpai, de, ate, abre = 0, ladoS = 1, repAlvo = null) => {
      const alvo = pj(ate, _b).sub(pj(de, _c)).normalize();
      if (abre) { _q.setFromAxisAngle(_a.set(0, 0, 1).applyQuaternion(W.peito), ladoS * abre); alvo.applyQuaternion(_q); }
      const atual = _a.copy(repAlvo || this.repDir[osso]).applyQuaternion(Wpai);
      const Wo = new THREE.Quaternion().setFromUnitVectors(atual, alvo).multiply(Wpai);
      local(osso, Wpai, Wo);
      return Wo;
    };
    // pés mais juntos e menos virados para fora (a base do adulto parada fica de "pernas abertas" no boneco); no chão só
    const pj0 = (1 - this.pNado) * (1 - this.pAr);
    if (pj0 > 0.01) for (const L of ['E', 'D']) {
      const xc = P[ij['coxa' + L] * 3], ik = ij['joelho' + L] * 3, ip = ij['pe' + L] * 3, it = ij['ponta' + L] * 3;
      const k = 1 - JUNTA * pj0, pe0 = P[ip];
      P[ik] = xc + (P[ik] - xc) * k; P[ip] = xc + (P[ip] - xc) * k;
      P[it] = P[ip] + (P[it] - pe0) * (1 - 0.5 * pj0);
    }
    if (!this.repPe) { this.repPe = {}; for (const L of ['E', 'D']) this.repPe[L] = pj('ponta' + L, new THREE.Vector3(), rep.P).sub(pj('pe' + L, new THREE.Vector3(), rep.P)).normalize(); }
    for (const [L, s] of [['E', 1], ['D', -1]]) {
      const Wc = membro('coxa' + L, W.quadril, 'coxa' + L, 'joelho' + L);
      const Wk = membro('canela' + L, Wc, 'joelho' + L, 'pe' + L);
      if (O['pe' + L]) membro('pe' + L, Wk, 'pe' + L, 'ponta' + L, 0, 1, this.repPe[L]);
      const Wb = membro('braco' + L, W.peito, 'ombro' + L, 'cotovelo' + L, this.abre[L] * (1 - 0.6 * this.pNado), s);
      membro('antebraco' + L, Wb, 'cotovelo' + L, 'mao' + L);
    }
    const i = ij.quadril * 3, esc = this.rig.medidas.perna;
    const dx = (P[i] - rep.P[i]) * esc;
    O.quadril.position.x += dx * 0.6;
    // PÉ NO CHÃO: o quadril vai para a altura em que a sola mais baixa fica onde a captura a põe (no apoio, no chão;
    // no ar da corrida, só um pouco acima). No ar do pulo e nadando, segue a captura como antes.
    let dy = (P[i + 1] - rep.P[i + 1]) * esc * 0.5;
    const pc = this.chaoPeso ?? 0;
    if (pc > 0.01 && this.sola.E) {
      const baixo = this.pontoBaixo(); // altura (modelo) da sola mais baixa com o quadril no lugar de descanso
      let alvo = 1e9;
      for (const L of ['E', 'D']) for (const nm of ['pe', 'ponta']) alvo = Math.min(alvo, P[ij[nm + L] * 3 + 1] - rep.P[ij[nm + L] * 3 + 1]);
      alvo = Math.max(0, alvo) * esc * NO_AR;
      dy = dy * (1 - pc) + (alvo - baixo) * pc;
    }
    O.quadril.position.y += dy;
    this.altQuadril = dy * this.k;
    return dy * this.k;
  }

  /** Sola mais baixa (calcanhar ou ponta dos dois pés), no espaço do modelo, com a pose atual e o quadril parado. */
  pontoBaixo() {
    const O = this.rig.ossos, raiz = O.raiz;
    raiz.updateMatrixWorld(true);
    _m.copy(raiz.parent.matrixWorld).invert();
    let m = 1e9;
    for (const L of ['E', 'D']) for (const p of this.sola[L]) { const y = _b.copy(p).applyMatrix4(O['pe' + L].matrixWorld).applyMatrix4(_m).y; if (y < m) m = y; }
    return m;
  }
}
