// FONEMA · Mundo 3D v2 — ESQUELETO AUTOMÁTICO dos bonecos do passeio (pedido do dono, fila nº 21: "o personagem não anda,
// ele fica pulando").
//
// Os modelos 3D (avatar da criança, Sofia, Tales, Bolota, crianças da vila) chegam como UMA malha inteira, sem esqueleto.
// Aqui, no próprio navegador e sem mexer nos arquivos, o boneco ganha um esqueleto: a malha é lida fatia por fatia (de baixo
// para cima) para achar o vão entre as pernas (virilha), o vão entre o braço e o tronco (axila) e a linha do ombro. Cada
// vértice recebe pesos suaves para os ossos (quadril, tronco, peito, cabeça, coxa, canela, braço e antebraço de cada lado)
// e a malha vira uma SkinnedMesh com o MESMO material (textura e cores do avatar continuam as mesmas: o recolor por máscaras
// acontece antes, no app). Se a leitura não achar pernas ou braços (Bolota, reserva estranha), entram medidas padrão.
//
//   const rig = articular(grupo);   // grupo: pés em y = 0, de frente para +Z (malhas filhas diretas)
//   rig.ossos.coxaE.rotation.x = …  // a pose é montada em boneco.js a cada quadro
import * as THREE from 'three';

const sst = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

/** Lê as posições de todas as malhas do grupo (no espaço do grupo). */
function posicoes(grupo) {
  grupo.updateMatrixWorld(true);
  const inv = new THREE.Matrix4().copy(grupo.matrixWorld).invert();
  const lista = [], m = new THREE.Matrix4(), v = new THREE.Vector3();
  let total = 0;
  for (const o of grupo.children) if (o.isMesh) { total += o.geometry.attributes.position.count; lista.push(o); }
  const P = new Float32Array(total * 3);
  let k = 0;
  for (const o of lista) {
    m.multiplyMatrices(inv, o.matrixWorld);
    const a = o.geometry.attributes.position;
    for (let i = 0; i < a.count; i++) { v.fromBufferAttribute(a, i).applyMatrix4(m); P[k++] = v.x; P[k++] = v.y; P[k++] = v.z; }
  }
  return { P, malhas: lista };
}

/** Intervalos ocupados em x de uma fatia (vão maior que `vao` separa). */
function intervalos(xs, vao) {
  xs.sort((a, b) => a - b);
  const r = []; let ini = xs[0], fim = xs[0];
  for (let i = 1; i < xs.length; i++) { if (xs[i] - fim > vao) { r.push([ini, fim]); ini = xs[i]; } fim = xs[i]; }
  if (xs.length) r.push([ini, fim]);
  return r;
}

/** Mede o boneco: virilha, pernas, axilas, ombros, pescoço. Tudo no espaço do modelo. */
export function medir(P) {
  const n = P.length / 3;
  let H = 0, x0 = 1e9, x1 = -1e9, zs = 0;
  for (let i = 0; i < n; i++) { H = Math.max(H, P[i * 3 + 1]); x0 = Math.min(x0, P[i * 3]); x1 = Math.max(x1, P[i * 3]); zs += P[i * 3 + 2]; }
  const NB = 90, fat = Array.from({ length: NB }, () => ({ x: [], z: [] }));
  for (let i = 0; i < n; i++) { const b = Math.min(NB - 1, Math.floor((P[i * 3 + 1] / H) * NB)); fat[b].x.push(P[i * 3]); fat[b].z.push(P[i * 3 + 2]); }
  // centro: meio da caixa (os pés podem estar um à frente do outro, mas o boneco é simétrico)
  const cx = (x0 + x1) / 2;
  const vao = 0.012 * H;
  const iv = fat.map((f) => (f.x.length > 6 ? intervalos(f.x.slice(), vao) : []));
  // virilha: sobe enquanto houver vão passando pelo centro
  let virilha = 0, falhas = 0;
  for (let b = 1; b < NB * 0.6; b++) {
    const r = iv[b]; let vaoNoCentro = false;
    for (let k = 0; k + 1 < r.length; k++) if (r[k][1] < cx + 0.03 * H && r[k + 1][0] > cx - 0.03 * H && r[k + 1][0] - r[k][1] > 0) { const meio = (r[k][1] + r[k + 1][0]) / 2; if (Math.abs(meio - cx) < 0.05 * H) vaoNoCentro = true; }
    if (vaoNoCentro) { virilha = (b + 1) / NB * H; falhas = 0; } else if (b / NB > 0.06 && ++falhas > 2) break;
  }
  const temPernas = virilha > 0.12 * H;
  if (!temPernas) virilha = 0.16 * H;
  // pernas: meia distância entre os centros das pernas
  let px = 0, pn = 0;
  for (let b = 0; b < (virilha / H) * NB * 0.8; b++) for (const x of fat[b].x) { px += Math.abs(x - cx); pn++; }
  const pernaX = pn ? Math.max(0.035 * H, px / pn) : 0.07 * H;
  // braços: vão de cada lado (não no centro) entre a virilha-0,1H e 0,7H
  const lados = {};
  for (const s of [-1, 1]) {
    // candidatos: em cada fatia, o vão mais externo deste lado que tem corpo dos dois lados
    const cand = new Array(NB).fill(null);
    for (let b = Math.floor(Math.max(0.1, virilha / H - 0.14) * NB); b < NB * 0.7; b++) {
      const r = iv[b]; if (r.length < 2) continue;
      let melhor = null;
      for (let k = 0; k + 1 < r.length; k++) {
        const a = r[k][1], c = r[k + 1][0], meio = (a + c) / 2, d = (meio - cx) * s;
        if (d < 0.05 * H) continue; // vão das pernas / do meio
        const fora = s > 0 ? r.slice(k + 1) : r.slice(0, k + 1);
        const larg = fora.reduce((q, w) => q + (w[1] - w[0]), 0);
        if (larg < 0.02 * H || larg > 0.16 * H) continue;
        if (!melhor || d > melhor.d) melhor = { d, borda: Math.abs((s > 0 ? a : c) - cx) + 0.006 * H };
      }
      cand[b] = melhor;
    }
    // semente perto de 0,4 H; cresce para cima e para baixo enquanto a borda for contínua (o braço é uma peça só)
    let sem = -1;
    for (let d = 0; d < NB * 0.15 && sem < 0; d++) for (const b of [Math.round(0.4 * NB) + d, Math.round(0.4 * NB) - d]) if (sem < 0 && cand[b]) sem = b;
    if (sem < 0) { lados[s] = null; continue; }
    const usados = [sem];
    for (const passo of [1, -1]) {
      let b = sem, ult = cand[sem].borda, falha = 0;
      while (b + passo >= 0 && b + passo < NB && falha <= 2) {
        b += passo;
        if (cand[b] && Math.abs(cand[b].borda - ult) < 0.035 * H) { usados.push(b); ult = cand[b].borda; falha = 0; } else falha++;
      }
    }
    if (usados.length < 4) { lados[s] = null; continue; }
    const pts = usados.map((b) => [(b + 0.5) / NB * H, cand[b].borda]);
    const zz = [];
    for (const b of usados) { const lim = cx + s * (cand[b].borda + 0.01 * H); fat[b].x.forEach((x, i) => { if ((x - lim) * s > 0) zz.push(fat[b].z[i]); }); }
    // reta da borda (o braço abre para baixo em pose "A")
    let sy = 0, sx = 0, syy = 0, syx = 0;
    for (const [y, x] of pts) { sy += y; sx += x; syy += y * y; syx += y * x; }
    const N = pts.length, den = N * syy - sy * sy;
    let incl = den > 1e-9 ? (N * syx - sy * sx) / den : 0;
    incl = Math.max(-0.8, Math.min(0.1, incl));
    const base = (sx - incl * sy) / N;
    const axila = Math.max(...pts.map((p) => p[0]));
    let mao = Math.min(...pts.map((p) => p[0]));
    // a mão costuma descer além do último vão achado (dedos encostados na coxa): desce enquanto houver algo para fora da borda
    {
      const bb = Math.min(...pts.filter((p) => p[0] < mao + 0.03 * H).map((p) => p[1]));
      const b0 = Math.floor((mao / H) * NB);
      for (let b = b0 - 1; b >= Math.max(0, b0 - 0.1 * NB, ((virilha - 0.02 * H) / H) * NB); b--) {
        let c = 0; fat[b].x.forEach((x) => { if ((x - cx) * s > bb + 0.005 * H) c++; });
        if (c < 4) break;
        mao = b / NB * H;
      }
    }
    zz.sort((a, b) => a - b);
    const zMed = zz.length ? zz[zz.length >> 1] : zs / n;
    const zR = zz.length > 10 ? Math.max(0.05 * H, (zz[Math.floor(zz.length * 0.95)] - zz[Math.floor(zz.length * 0.05)]) * 0.6) : 0.08 * H;
    // braço que não parece braço (bicho redondo, casco): sem braço
    if (zR > 0.13 * H || axila - mao > 0.4 * H || axila > 0.62 * H) { lados[s] = null; continue; }
    // borda fatia a fatia (onde o vão foi visto), suavizada; fora dela, a reta
    const ord = pts.slice().sort((p, q) => p[0] - q[0]);
    const suave = ord.map((p, i) => [p[0], [ord[Math.max(0, i - 1)][1], p[1], ord[Math.min(ord.length - 1, i + 1)][1]].sort((a, b) => a - b)[1]]);
    const borda = (y) => {
      if (y <= suave[0][0]) return suave[0][1];
      if (y >= suave[suave.length - 1][0]) return base + incl * Math.min(y, axila) + (suave[suave.length - 1][1] - (base + incl * suave[suave.length - 1][0]));
      let i = 1; while (suave[i][0] < y) i++;
      const [ya, xa] = suave[i - 1], [yb, xb] = suave[i];
      return xa + (xb - xa) * (y - ya) / Math.max(1e-6, yb - ya);
    };
    lados[s] = { base, incl, axila, mao, zMed, zR, borda };
  }
  // pescoço: chibi = cabeça grande; começa acima dos ombros
  const axilaM = Math.max(lados[1]?.axila ?? 0, lados[-1]?.axila ?? 0) || 0.45 * H;
  const pescoco = Math.max(axilaM + 0.1 * H, Math.min(0.66 * H, axilaM + 0.17 * H));
  return { H, cx, zc: zs / n, virilha, temPernas, pernaX, lados, axila: axilaM, pescoco };
}

const TODOS = Array.from({ length: 16 }, (_, i) => i);
const NOMES = ['raiz', 'quadril', 'tronco', 'peito', 'cabeca', 'coxaE', 'canelaE', 'coxaD', 'canelaD', 'bracoE', 'antebracoE', 'bracoD', 'antebracoD', 'peE', 'peD', 'cabelo'];

/**
 * Dá esqueleto ao grupo (troca cada Mesh por uma SkinnedMesh com o mesmo material). Devolve { ossos, medidas, malhas }.
 * "E" = lado +X do modelo (a esquerda do boneco, que olha para +Z); "D" = lado −X.
 */
export function articular(grupo) {
  const { P, malhas } = posicoes(grupo);
  if (!malhas.length) return null;
  const md = medir(P);
  const { H, cx, zc, virilha, pernaX, lados } = md;
  const o = {};
  for (const nm of NOMES) { o[nm] = new THREE.Bone(); o[nm].name = nm; }
  // posições (no espaço do grupo; depois cada osso fica relativo ao pai)
  const abs = {};
  const quadrilY = virilha + 0.05 * H;
  abs.raiz = [cx, 0, zc];
  abs.quadril = [cx, quadrilY, zc];
  abs.tronco = [cx, quadrilY + 0.08 * H, zc];
  abs.peito = [cx, md.axila, zc];
  abs.cabeca = [cx, md.pescoco, zc];
  // tornozelo: o sapato é a parte de baixo da canela; o pé (osso novo, fila nº 28) gira à parte para a sola ficar no chão
  const tornozelo = Math.min(0.075 * H, virilha * 0.3);
  const pes = {};
  for (const s of [1, -1]) {
    // frente e calcanhar do sapato deste lado (vértices abaixo do tornozelo)
    let z0 = 1e9, z1 = -1e9, n = 0;
    for (let i = 0; i < P.length / 3; i++) { const y = P[i * 3 + 1], x = P[i * 3]; if (y < tornozelo && (x - cx) * s > 0) { z0 = Math.min(z0, P[i * 3 + 2]); z1 = Math.max(z1, P[i * 3 + 2]); n++; } }
    pes[s] = n > 10 ? { z0, z1 } : { z0: zc - 0.05 * H, z1: zc + 0.08 * H };
  }
  // cabelo de peça (penteado): pende de um ponto atrás e no alto da cabeça e balança com mola (js/animacoes.js)
  const pivoCabelo = md.pescoco + 0.55 * (H - md.pescoco);
  abs.cabelo = [cx, pivoCabelo, zc - 0.04 * H];
  for (const [s, L] of [[1, 'E'], [-1, 'D']]) {
    abs['coxa' + L] = [cx + s * pernaX, virilha + 0.03 * H, zc];
    abs['canela' + L] = [cx + s * pernaX, virilha * 0.5, zc];
    // o tornozelo fica um pouco atrás do meio do sapato (o pé aponta para a frente)
    abs['pe' + L] = [cx + s * pernaX, tornozelo, pes[s].z0 + (pes[s].z1 - pes[s].z0) * 0.32];
    const l = lados[s];
    const ombroY = l ? l.axila + 0.07 * H : md.axila + 0.06 * H;
    const ombroX = l ? l.borda(l.axila) + 0.035 * H : 0.17 * H;
    const maoY = l ? l.mao : virilha;
    const zA = l ? l.zMed : zc;
    abs['braco' + L] = [cx + s * ombroX, ombroY, zA];
    const cotY = (ombroY + maoY) / 2 + 0.02 * H;
    abs['antebraco' + L] = [cx + s * (l ? l.borda(cotY) + 0.03 * H : ombroX + 0.02 * H), cotY, zA];
  }
  const pai = { quadril: 'raiz', tronco: 'quadril', peito: 'tronco', cabeca: 'peito', coxaE: 'quadril', canelaE: 'coxaE', coxaD: 'quadril', canelaD: 'coxaD', bracoE: 'peito', antebracoE: 'bracoE', bracoD: 'peito', antebracoD: 'bracoD', peE: 'canelaE', peD: 'canelaD', cabelo: 'cabeca' };
  o.raiz.position.set(...abs.raiz);
  for (const nm of NOMES.slice(1)) {
    const p = abs[pai[nm]], a = abs[nm];
    o[nm].position.set(a[0] - p[0], a[1] - p[1], a[2] - p[2]);
    o[pai[nm]].add(o[nm]);
  }
  grupo.add(o.raiz);
  grupo.updateMatrixWorld(true);
  const ossos = NOMES.map((nm) => o[nm]);
  const I = Object.fromEntries(NOMES.map((nm, i) => [nm, i]));
  const esqueleto = new THREE.Skeleton(ossos);

  // pesos por vértice
  let k = 0;
  const w = new Float32Array(NOMES.length);
  const trocadas = [], vistas = new Set();
  for (const me of malhas) {
    const cnt = me.geometry.attributes.position.count;
    const si = new Uint16Array(cnt * 4), sw = new Float32Array(cnt * 4);
    const gBraco = new Float32Array(cnt), gLado = new Float32Array(cnt);
    const cabelo = me.userData.parte === 'cabelo'; // para achar as "pontes" (abaixo)
    for (let i = 0; i < cnt; i++, k++) {
      const x = P[k * 3], y = P[k * 3 + 1], z = P[k * 3 + 2];
      w.fill(0);
      const s = x >= cx ? 1 : -1, L = s > 0 ? 'E' : 'D', l = lados[s];
      // braço
      let wb = 0;
      if (l) {
        const d = (x - cx) * s, b = l.borda(y);
        wb = sst(b - 0.008 * H, b + 0.012 * H, d) * (1 - sst(l.zR, l.zR + 0.05 * H, Math.abs(z - l.zMed))) * (1 - sst(l.axila + 0.03 * H, l.axila + 0.11 * H, y));
        // nos ombros (acima da axila), só o que está bem para fora do tronco
        if (y > l.axila) wb *= sst(b + 0.0 * H, b + 0.04 * H, d);
        wb *= sst(l.mao - 0.03 * H, l.mao - 0.005 * H, y); // abaixo da mão não há braço
      }
      // perna
      const wp = md.temPernas ? (1 - sst(virilha - 0.035 * H, virilha + 0.045 * H, y)) * (1 - wb) : 0;
      const lado = sst(-0.012 * H, 0.012 * H, x - cx); // 1 = E
      const resto = 1 - wb - wp;
      if (wb > 0) {
        const ab = abs['antebraco' + L][1];
        const fa = sst(ab + 0.03 * H, ab - 0.03 * H, y);
        w[I['antebraco' + L]] += wb * fa; w[I['braco' + L]] += wb * (1 - fa);
      }
      if (wp > 0) {
        const kn = abs.canelaE[1];
        const fc = sst(kn + 0.06 * H, kn - 0.06 * H, y); // joelho largo: a calça dobra em curva, sem vinco (fila nº 28)
        const fp = sst(tornozelo + 0.002 * H, tornozelo - 0.02 * H, y); // sapato = pé; a barra da calça fica com a canela
        for (const [LL, f] of [['E', lado], ['D', 1 - lado]]) { w[I['pe' + LL]] += wp * f * fc * fp; w[I['canela' + LL]] += wp * f * fc * (1 - fp); w[I['coxa' + LL]] += wp * f * (1 - fc); }
      }
      if (resto > 1e-4) {
        const fCab = sst(md.pescoco - 0.03 * H, md.pescoco + 0.03 * H, y);
        const fPei = sst(abs.tronco[1] + 0.04 * H, md.axila - 0.02 * H, y) * (1 - fCab);
        const fTro = sst(quadrilY - 0.02 * H, abs.tronco[1] + 0.04 * H, y) * (1 - fCab - fPei);
        const fQua = Math.max(0, 1 - fCab - fPei - fTro);
        w[I.cabeca] += resto * fCab; w[I.peito] += resto * fPei; w[I.tronco] += resto * fTro; w[I.quadril] += resto * fQua;
      }
      if (cabelo) {
        // peça de cabelo: só cabeça e osso do cabelo (antes o cabelo comprido abaixo do pescoço ia para o peito e até
        // para o braço, e balançava "duro" junto); quanto mais abaixo do ponto de onde pende, mais segue a mola
        w.fill(0);
        const tc = sst(pivoCabelo - 0.03 * H, pivoCabelo - 0.3 * H, y);
        w[I.cabelo] = tc; w[I.cabeca] = 1 - tc;
      }
      gBraco[i] = cabelo ? 0 : wb; gLado[i] = cabelo ? 0 : wp * (lado - 0.5) * 2;
      // 4 maiores
      const ord = TODOS.slice().sort((a, b) => w[b] - w[a]).slice(0, 4);
      let soma = 0; for (const j of ord) soma += w[j];
      if (soma < 1e-6) { si[i * 4] = I.quadril; sw[i * 4] = 1; continue; }
      ord.forEach((j, q) => { si[i * 4 + q] = j; sw[i * 4 + q] = w[j] / soma; });
    }
    // geometria repetida (a reserva usa a mesma esfera na cabeça, nos olhos e nos pés): cada malha leva a sua cópia
    const geo = vistas.has(me.geometry) ? me.geometry.clone() : me.geometry;
    vistas.add(me.geometry);
    geo.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(si, 4));
    geo.setAttribute('skinWeight', new THREE.Float32BufferAttribute(sw, 4));
    // Pontes: o gerador da malha às vezes cola a mão no quadril ou uma perna na outra com triângulos compridos. Parados,
    // não aparecem; com o braço balançando viram uma "fita" esticada. Esses triângulos (um canto no braço e outro no
    // corpo, ou um canto em cada perna) são desfeitos.
    if (geo.index) {
      const ix = geo.index.array, pa = geo.attributes.position, A = new THREE.Vector3(), B = new THREE.Vector3(), C = new THREE.Vector3();
      const lim = 0.018 * H / Math.max(1e-6, Math.min(me.scale.x, me.scale.y, me.scale.z));
      let desfeitos = 0;
      for (let t = 0; t + 2 < ix.length; t += 3) {
        const a = ix[t], b = ix[t + 1], c = ix[t + 2];
        const db = Math.max(gBraco[a], gBraco[b], gBraco[c]) - Math.min(gBraco[a], gBraco[b], gBraco[c]);
        const dl = Math.max(gLado[a], gLado[b], gLado[c]) - Math.min(gLado[a], gLado[b], gLado[c]);
        if (db < 0.6 && dl < 1.2) continue;
        A.fromBufferAttribute(pa, a); B.fromBufferAttribute(pa, b); C.fromBufferAttribute(pa, c);
        if (Math.max(A.distanceTo(B), B.distanceTo(C), C.distanceTo(A)) < lim) continue;
        ix[t + 1] = a; ix[t + 2] = a; desfeitos++;
      }
      if (desfeitos) geo.index.needsUpdate = true;
    }
    const sk = new THREE.SkinnedMesh(geo, me.material);
    sk.position.copy(me.position); sk.quaternion.copy(me.quaternion); sk.scale.copy(me.scale);
    sk.castShadow = me.castShadow; sk.receiveShadow = me.receiveShadow; sk.renderOrder = me.renderOrder;
    grupo.remove(me); grupo.add(sk);
    sk.updateMatrixWorld(true);
    sk.bind(esqueleto, sk.matrixWorld);
    trocadas.push(sk);
  }
  // pose de descanso de cada osso (para somar a animação por cima)
  for (const b of ossos) b.userData.rep = b.position.clone();
  // comprimento da perna (do quadril ao chão) e do braço, no espaço do modelo
  const perna = abs.coxaE[1], braco = Math.max(0.1 * H, abs.bracoE[1] - (lados[1]?.mao ?? virilha));
  // pé: ponta e calcanhar do sapato no espaço do modelo (descanso), para pôr a sola no chão (js/animacoes.js)
  const sapato = { tornozelo, ponta: {}, calcanhar: {} };
  for (const [s, L] of [[1, 'E'], [-1, 'D']]) { sapato.ponta[L] = pes[s].z1; sapato.calcanhar[L] = pes[s].z0; }
  return { ossos: o, esqueleto, malhas: trocadas, medidas: { ...md, perna, braco, sapato } };
}
