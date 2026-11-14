/**
 * BONECO PROVISÓRIO, feito em código (D029). Serve de reserva enquanto os modelos prontos (GLB) não chegam:
 * cada função abaixo constrói UMA peça no mesmo espaço e com as mesmas medidas do contrato
 * (app/docs/avatar-3d-contrato.md), então trocar por um GLB é só registrar o arquivo no manifesto.
 *
 * Espaço: metros, pés no chão (y = 0), de frente para +Z. Peças da cabeça são construídas em torno do
 * centro da cabeça (0, MEDIDAS.cabecaY, 0).
 */
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { COR_MASSINHA, COR_ROUPA_BASE, MEDIDAS, type Aparencia, type PecaVestida } from './modelo.ts';

const R = MEDIDAS.cabecaRaio;
const M = MEDIDAS;

/* ------------------------------------------------------------------ materiais */

const cor = (hex: string) => new THREE.Color(hex);
const mistura = (a: string, b: string, t: number) => cor(a).lerp(cor(b), t);

export function matPele(hex: string | null) {
  return new THREE.MeshStandardMaterial({ name: 'pele', color: cor(hex ?? COR_MASSINHA), roughness: 0.58, metalness: 0 });
}
function matCabelo(hex: string, liso = false) {
  return new THREE.MeshStandardMaterial({ name: 'cabelo', color: cor(hex), roughness: liso ? 0.42 : 0.72, metalness: 0, side: THREE.DoubleSide });
}
function matTecido(hex: string, nome = 'tecido') {
  return new THREE.MeshStandardMaterial({ name: nome, color: cor(hex), roughness: 0.86, metalness: 0 });
}
const matSimples = (hex: string, roughness = 0.5, metalness = 0, nome = 'fixo') => new THREE.MeshStandardMaterial({ name: nome, color: cor(hex), roughness, metalness });

function malha(geo: THREE.BufferGeometry, mat: THREE.Material, sombra = true) {
  const m = new THREE.Mesh(geo, mat);
  m.castShadow = sombra;
  m.receiveShadow = false;
  return m;
}

/* ------------------------------------------------------------------ cabeça */

interface Forma { sx: number; sy: number; sz: number; queixo: number; bochecha: number; base: number }
const FORMAS: Record<string, Forma> = {
  redondo: { sx: 1.04, sy: 0.97, sz: 0.97, queixo: 0, bochecha: 0.05, base: 0.98 },
  oval: { sx: 0.93, sy: 1.07, sz: 0.95, queixo: 0.1, bochecha: 0, base: 1.05 },
  coracao: { sx: 1.04, sy: 1.0, sz: 0.96, queixo: 0.3, bochecha: 0.035, base: 1.02 },
  quadrado: { sx: 1.01, sy: 0.97, sz: 0.96, queixo: -0.1, bochecha: 0, base: 0.9 }
};
const forma = (rosto: string | null) => FORMAS[rosto ?? 'redondo'] ?? FORMAS.redondo;

/** Ponto da superfície da cabeça na direção `d` (unitária), relativo ao centro da cabeça. `f` afasta (1 = na pele). */
function naCabeca(rosto: string | null, d: THREE.Vector3, f = 1, alvo = new THREE.Vector3()): THREE.Vector3 {
  const F = forma(rosto);
  let x = d.x * F.sx, y = d.y * F.sy, z = d.z * F.sz;
  if (d.y < 0) {
    const t = -d.y;
    const w = 1 - F.queixo * Math.pow(t, 1.6) + F.bochecha * Math.sin(Math.PI * Math.min(1, t * 1.15));
    x *= w;
    z *= 1 - F.queixo * 0.45 * Math.pow(t, 1.6);
    y *= F.base;
  }
  return alvo.set(x, y, z).multiplyScalar(R * f);
}
/** Direção a partir de azimute (0 = frente, + = lado esquerdo do boneco/direita de quem olha) e elevação. */
const dirAzEl = (az: number, el: number) => new THREE.Vector3(Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el));
const noRosto = (rosto: string | null, az: number, el: number, f = 1) => naCabeca(rosto, dirAzEl(az, el), f);

/** Textura do olho (íris com degradê, pupila e brilhos) para uma esfera: o centro da íris fica virado para +Z. */
const texturas = new Map<string, THREE.CanvasTexture>();
/** Texturas desenhadas em canvas são guardadas e compartilhadas entre os bonecos (palco e miniaturas): desenha e envia à placa uma vez só. */
function compartilhada(chave: string, criar: () => THREE.CanvasTexture): THREE.CanvasTexture {
  let t = texturas.get(chave);
  if (!t) {
    t = criar();
    t.userData.compartilhada = true;
    texturas.set(chave, t);
  }
  return t;
}

function texturaOlho(hexIris: string): THREE.CanvasTexture {
  return compartilhada(`olho:${hexIris}`, () => desenharOlho(hexIris));
}
function desenharOlho(hexIris: string): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 1024; c.height = 512;
  const g = c.getContext('2d')!;
  g.fillStyle = '#FDFCFA';
  g.fillRect(0, 0, 1024, 512);
  const cx = 256, cy = 262, ri = 116;
  // sombra suave na parte de cima do branco (pálpebra)
  const s = g.createLinearGradient(0, 110, 0, 215);
  s.addColorStop(0, 'rgba(120,110,130,.35)'); s.addColorStop(1, 'rgba(120,110,130,0)');
  g.fillStyle = s; g.fillRect(0, 100, 512, 120);
  const base = cor(hexIris);
  const claro = base.clone().lerp(cor('#FFFFFF'), 0.38), escuro = base.clone().multiplyScalar(0.42);
  const rg = g.createRadialGradient(cx, cy + 28, 8, cx, cy, ri);
  rg.addColorStop(0, `#${claro.getHexString()}`); rg.addColorStop(0.55, `#${base.getHexString()}`); rg.addColorStop(1, `#${escuro.getHexString()}`);
  g.fillStyle = rg; g.beginPath(); g.arc(cx, cy, ri, 0, Math.PI * 2); g.fill();
  g.lineWidth = 9; g.strokeStyle = `#${escuro.clone().multiplyScalar(0.6).getHexString()}`; g.stroke();
  // raios finos da íris
  g.strokeStyle = 'rgba(255,255,255,.13)'; g.lineWidth = 2;
  for (let i = 0; i < 36; i++) { const a = (i / 36) * Math.PI * 2; g.beginPath(); g.moveTo(cx + Math.cos(a) * 50, cy + Math.sin(a) * 50); g.lineTo(cx + Math.cos(a) * (ri - 12), cy + Math.sin(a) * (ri - 12)); g.stroke(); }
  g.fillStyle = '#0B0806'; g.beginPath(); g.arc(cx, cy, 56, 0, Math.PI * 2); g.fill();
  // brilhos
  g.fillStyle = 'rgba(255,255,255,.96)'; g.beginPath(); g.arc(cx + 36, cy - 40, 24, 0, Math.PI * 2); g.fill();
  g.fillStyle = 'rgba(255,255,255,.75)'; g.beginPath(); g.arc(cx - 36, cy + 40, 10, 0, Math.PI * 2); g.fill();
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

export interface Cabeca { grupo: THREE.Group; piscar: (v: number) => void }

/** Cabeça com rosto. Sem cor de olhos escolhida, o boneco fica de olhinhos fechados (rosto liso, D029). */
export function criarCabeca(a: Aparencia): Cabeca {
  const g = new THREE.Group();
  g.name = 'cabeca';
  const pele = matPele(a.pele);
  const peleHex = a.pele ?? COR_MASSINHA;

  const geo = new THREE.SphereGeometry(1, 72, 54);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  const v = new THREE.Vector3(), d = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    d.fromBufferAttribute(pos, i).normalize();
    naCabeca(a.rosto, d, 1, v);
    pos.setXYZ(i, v.x, v.y, v.z);
  }
  g.add(malha(geo, pele));

  // orelhas
  for (const lado of [-1, 1]) {
    const o = malha(new THREE.SphereGeometry(0.042, 20, 16), pele);
    o.scale.set(0.5, 1, 0.72);
    o.position.copy(noRosto(a.rosto, lado * Math.PI / 2, -0.06, 0.97));
    g.add(o);
  }

  // olhos: grandes, com brilho; piscam achatando. Sem cor escolhida, ficam fechadinhos (rosto liso).
  const RE = 0.052;
  const fechado = !a.olhos;
  const matOlho = new THREE.MeshStandardMaterial({ name: 'iris', map: a.olhos ? texturaOlho(a.olhos) : null, color: 0xffffff, roughness: 0.1, metalness: 0 });
  const matCilio = matSimples(a.sexo === 'f' ? '#1A1210' : '#2A1E18', 0.7, 0, 'cilio');
  const olhos: { bola: THREE.Mesh; cilio: THREE.Mesh }[] = [];
  for (const lado of [-1, 1]) {
    const olho = new THREE.Group();
    olho.position.copy(noRosto(a.rosto, lado * 0.34, -0.03, 0.95));
    olho.rotation.y = lado * 0.2;
    olho.rotation.x = 0.03;
    const bola = malha(new THREE.SphereGeometry(RE, 40, 28), matOlho, false);
    bola.scale.set(1, 1.14, 0.42);
    bola.visible = !fechado;
    // linha da pálpebra de cima (cílios; mais marcada nas meninas)
    const cilio = malha(new THREE.TorusGeometry(RE * 1.0, a.sexo === 'f' ? 0.0056 : 0.0036, 6, 36, Math.PI * 0.86), matCilio, false);
    cilio.rotation.z = Math.PI * 0.07;
    cilio.position.z = RE * 0.2;
    if (fechado) { cilio.rotation.z += Math.PI; cilio.scale.set(0.9, 0.5, 1); cilio.position.y = RE * 0.25; }
    else cilio.scale.set(1, 1.14, 1);
    olho.add(bola, cilio);
    g.add(olho);
    olhos.push({ bola, cilio });
  }
  const piscar = (t: number) => {
    if (fechado) return;
    const k = THREE.MathUtils.clamp(t, 0, 1);
    for (const o of olhos) { o.bola.scale.y = 1.14 * (1 - 0.93 * k); o.cilio.scale.y = 1.14 * (1 - 1.5 * k); }
  };

  // sobrancelhas (cor do cabelo; sem cabelo, um tom da pele)
  const corSob = a.cabelo ? mistura(a.cabelo.cor, '#1A120E', 0.25) : cor(peleHex).multiplyScalar(0.72);
  const matSob = new THREE.MeshStandardMaterial({ name: 'sobrancelha', color: corSob, roughness: 0.8 });
  for (const lado of [-1, 1]) {
    const s = malha(new THREE.CapsuleGeometry(0.0075, 0.05, 4, 10), matSob, false);
    s.geometry.rotateZ(Math.PI / 2);
    const p = noRosto(a.rosto, lado * 0.36, 0.36, 1.012);
    s.position.copy(p);
    s.lookAt(p.clone().multiplyScalar(2));
    s.rotateZ(lado * -0.16);
    s.scale.set(1, 1, 0.6);
    g.add(s);
  }

  // nariz
  const nariz = malha(new THREE.SphereGeometry(0.021, 20, 16), new THREE.MeshStandardMaterial({ name: 'pele', color: cor(peleHex).lerp(cor('#C0564A'), a.pele ? 0.1 : 0).multiplyScalar(0.97), roughness: 0.55 }), false);
  nariz.scale.set(1.15, 0.85, 0.9);
  nariz.position.copy(noRosto(a.rosto, 0, -0.17, 1.0));
  g.add(nariz);

  // sorriso
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= 12; i++) { const az = -0.23 + (0.46 * i) / 12; pts.push(noRosto(a.rosto, az, -0.47 + 0.075 * Math.pow(az / 0.23, 2), 1.004)); }
  const boca = malha(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 28, 0.0058, 8), new THREE.MeshStandardMaterial({ name: 'boca', color: mistura(peleHex, '#6E2420', a.pele ? 0.72 : 0.3), roughness: 0.6 }), false);
  g.add(boca);
  for (const lado of [-1, 1]) {
    const canto = malha(new THREE.SphereGeometry(0.0075, 10, 8), boca.material as THREE.Material, false);
    canto.position.copy(pts[lado < 0 ? 0 : 12]);
    g.add(canto);
  }

  // corado natural das bochechas (bem leve)
  if (a.pele) {
    const matBoch = new THREE.MeshBasicMaterial({ name: 'bochecha', color: 0xe2635a, transparent: true, opacity: 0.17, depthWrite: false });
    for (const lado of [-1, 1]) {
      const b = new THREE.Mesh(new THREE.CircleGeometry(0.034, 24), matBoch);
      const p = noRosto(a.rosto, lado * 0.66, -0.27, 1.006);
      b.position.copy(p);
      b.lookAt(p.clone().multiplyScalar(2));
      g.add(b);
    }
  }
  return { grupo: g, piscar };
}

/* ------------------------------------------------------------------ cabelo */

interface Linha { f: number; s: number; b: number; assim?: number }
/** Até onde o cabelo desce (ângulo a partir do topo) em cada azimute: testa, lados e nuca. */
function limite(l: Linha, az: number): number {
  const c = Math.cos(az);
  return l.s + (l.f - l.s) * Math.pow(Math.max(0, c), 1.3) + (l.b - l.s) * Math.max(0, -c) + (l.assim ?? 0) * Math.sin(az) * Math.max(0, c);
}
const dirTopo = (teta: number, az: number) => new THREE.Vector3(Math.sin(teta) * Math.sin(az), Math.cos(teta), Math.sin(teta) * Math.cos(az));

/** Calota de cabelo colada na cabeça, com espessura `esp` (em raios) e relevo opcional. */
function calota(rosto: string | null, l: Linha, esp: number, relevo?: (teta: number, az: number) => number): THREE.BufferGeometry {
  const NA = 80, NT = 26;
  const pos: number[] = [], idx: number[] = [];
  const v = new THREE.Vector3();
  for (let j = 0; j <= NT; j++) {
    const t = j / NT;
    for (let i = 0; i < NA; i++) {
      const az = Math.PI + (i / NA) * Math.PI * 2; // emenda atrás
      const teta = t * limite(l, az);
      const borda = 1 - 0.8 * Math.pow(t, 5);
      naCabeca(rosto, dirTopo(teta, az), 1 + esp * borda + (relevo ? relevo(teta, az) * borda : 0), v);
      pos.push(v.x, v.y, v.z);
    }
  }
  for (let j = 0; j < NT; j++) for (let i = 0; i < NA; i++) {
    const a = j * NA + i, b = j * NA + ((i + 1) % NA), c = a + NA, d2 = b + NA;
    idx.push(a, c, b, b, c, d2);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

/** Cortina de cabelo comprido: desce dos lados e de trás. `ate` = até onde (em raios abaixo do centro) atrás e nos lados. */
function cortina(rosto: string | null, o: { azIni: number; ateTras: number; ateLado: number; onda?: number; folga?: number }): THREE.BufferGeometry {
  const NA = 64, NY = 30;
  const F = forma(rosto);
  const folga = o.folga ?? 1.1;
  const pos: number[] = [], idx: number[] = [];
  for (let j = 0; j <= NY; j++) {
    const s = j / NY;
    for (let i = 0; i <= NA; i++) {
      const az = o.azIni + (i / NA) * (Math.PI * 2 - 2 * o.azIni);
      const wb = Math.pow(Math.max(0, -Math.cos(az)), 0.7);
      const yTopo = 0.55, yBase = -(o.ateLado + (o.ateTras - o.ateLado) * wb);
      const y = yTopo + (yBase - yTopo) * s;
      let r = y > 0 ? folga * Math.sqrt(Math.max(0.05, 1 - (y / folga) ** 2)) : folga * (1 - 0.1 * Math.sin(Math.PI * Math.min(1, -y / 1.9)));
      if (o.onda && y < 0.2) r += o.onda * Math.sin(-y * 9 + az * 4) * Math.min(1, (0.2 - y) / 0.6);
      r += 0.03 * s * s; // pontas abrem um pouco
      pos.push(Math.sin(az) * r * F.sx * R, y * R, Math.cos(az) * r * F.sz * R);
    }
  }
  const W = NA + 1;
  for (let j = 0; j < NY; j++) for (let i = 0; i < NA; i++) { const a = j * W + i; idx.push(a, a + W, a + 1, a + 1, a + W, a + W + 1); }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

interface Bola { p: THREE.Vector3; r: number; s?: [number, number, number] }
function bolas(lista: Bola[], detalhe = 1): THREE.BufferGeometry {
  const base = new THREE.IcosahedronGeometry(1, detalhe);
  const gs = lista.map((b) => {
    const g = base.clone();
    g.scale(b.r * (b.s?.[0] ?? 1), b.r * (b.s?.[1] ?? 1), b.r * (b.s?.[2] ?? 1));
    g.translate(b.p.x, b.p.y, b.p.z);
    return g;
  });
  const m = mergeGeometries(gs, false)!;
  gs.forEach((x) => x.dispose());
  base.dispose();
  return m;
}
/** Cachinhos espalhados (espiral de Fibonacci) dentro da linha do cabelo, a uma distância `f` (em raios) do centro. */
function cachos(rosto: string | null, l: Linha, n: number, f: number, r: number, semente = 1): Bola[] {
  const out: Bola[] = [];
  let s = semente * 9301 + 49297;
  const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  for (let i = 0; i < n; i++) {
    const y = 1 - (2 * (i + 0.5)) / n;
    const az = i * 2.399963;
    const teta = Math.acos(y);
    if (teta > limite(l, az)) continue;
    out.push({ p: naCabeca(rosto, dirTopo(teta, az), f * (0.985 + 0.04 * rnd())), r: r * (0.85 + 0.3 * rnd()) });
  }
  return out;
}

/** Cabelo (modelo provisório). Fica no espaço da cabeça (origem no centro da cabeça). */
export function criarCabelo(a: Aparencia): THREE.Group {
  const g = new THREE.Group();
  g.name = 'cabelo';
  if (!a.cabelo) return g;
  const { modelo, cor: hex } = a.cabelo;
  const rosto = a.rosto;
  const liso = modelo.startsWith('liso') || ['coque', 'rabo-de-cavalo', 'ondulado', 'ondulado-curto', 'topete', 'maria-chiquinha'].includes(modelo);
  const mat = matCabelo(hex, liso);
  const add = (geo: THREE.BufferGeometry) => g.add(malha(geo, mat));
  const CURTO: Linha = { f: 0.86, s: 1.42, b: 1.95 };

  switch (modelo) {
    case 'raspado': {
      const m = new THREE.MeshStandardMaterial({ name: 'cabelo', color: mistura(hex, a.pele ?? COR_MASSINHA, 0.35), roughness: 0.9, side: THREE.DoubleSide });
      g.add(malha(calota(rosto, { f: 0.8, s: 1.36, b: 1.9 }, 0.022), m, false));
      break;
    }
    case 'crespo-curto': {
      add(calota(rosto, CURTO, 0.07));
      add(bolas(cachos(rosto, CURTO, 520, 1.085, 0.03)));
      break;
    }
    case 'black-power': {
      const L: Linha = { f: 0.8, s: 1.5, b: 2.0 };
      add(calota(rosto, L, 0.16));
      add(bolas([...cachos(rosto, L, 300, 1.24, 0.074, 2), ...cachos(rosto, { f: 0.72, s: 1.38, b: 1.85 }, 240, 1.42, 0.078, 3)]));
      break;
    }
    case 'cacheado': {
      const L: Linha = { f: 0.82, s: 1.6, b: 2.05 };
      add(calota(rosto, L, 0.1));
      const bs = cachos(rosto, L, 300, 1.16, 0.062, 4);
      // cachos que descem dos lados e de trás até o ombro
      for (let k = 0; k < 13; k++) {
        const az = 1.25 + (k / 12) * (Math.PI * 2 - 2.5);
        const fundo = 1.05 + 0.5 * Math.pow(Math.max(0, -Math.cos(az)), 0.7);
        for (let y = 0.1; y > -fundo; y -= 0.17) {
          const rr = 1.14 + 0.05 * Math.sin(y * 9 + k);
          bs.push({ p: new THREE.Vector3(Math.sin(az) * rr * R, y * R, Math.cos(az) * rr * R * 0.96), r: 0.058 + 0.008 * Math.sin(k * 3 + y * 7) });
        }
      }
      add(bolas(bs));
      break;
    }
    case 'cacheado-curto': {
      const L: Linha = { f: 0.9, s: 1.45, b: 1.95 };
      add(calota(rosto, L, 0.09));
      add(bolas(cachos(rosto, L, 240, 1.15, 0.058, 5)));
      break;
    }
    case 'ondulado': {
      add(calota(rosto, { f: 0.95, s: 1.5, b: 1.7, assim: 0.25 }, 0.085, (t, az) => 0.012 * Math.sin(t * 9 + az * 3)));
      add(cortina(rosto, { azIni: 1.2, ateTras: 1.75, ateLado: 1.2, onda: 0.05 }));
      break;
    }
    case 'ondulado-curto': {
      add(calota(rosto, { f: 0.98, s: 1.42, b: 1.92, assim: 0.22 }, 0.1, (t, az) => 0.022 * Math.sin(t * 10 + az * 4)));
      add(bolas([-0.5, -0.2, 0.1, 0.4].map((az, i) => ({ p: naCabeca(rosto, dirTopo(0.72, az), 1.13), r: 0.062, s: [1.2, 0.75, 1] as [number, number, number], i })), 2));
      break;
    }
    case 'liso-longo': {
      add(calota(rosto, { f: 1.16, s: 1.5, b: 1.7 }, 0.075));
      add(cortina(rosto, { azIni: 1.12, ateTras: 1.8, ateLado: 1.25 }));
      break;
    }
    case 'liso-chanel': {
      add(calota(rosto, { f: 1.16, s: 1.5, b: 1.7 }, 0.08));
      add(cortina(rosto, { azIni: 1.05, ateTras: 0.82, ateLado: 0.78, folga: 1.13 }));
      break;
    }
    case 'liso-curto': {
      add(calota(rosto, { f: 1.02, s: 1.42, b: 1.92, assim: 0.3 }, 0.085));
      break;
    }
    case 'topete': {
      add(calota(rosto, { f: 0.84, s: 1.4, b: 1.92 }, 0.075));
      add(bolas([-0.34, -0.12, 0.12, 0.34].flatMap((az) => [
        { p: naCabeca(rosto, dirTopo(0.55, az), 1.2), r: 0.07, s: [0.9, 1.25, 1.1] as [number, number, number] },
        { p: naCabeca(rosto, dirTopo(0.3, az), 1.2), r: 0.066 }
      ]), 2));
      break;
    }
    case 'trancas': {
      const L: Linha = { f: 0.84, s: 1.45, b: 1.8 };
      add(calota(rosto, L, 0.05, (_t, az) => 0.012 * Math.abs(Math.sin(az * 9))));
      const bs: Bola[] = [];
      for (let k = 0; k < 17; k++) {
        const az = 1.3 + (k / 16) * (Math.PI * 2 - 2.6);
        const fundo = 1.2 + 0.55 * Math.pow(Math.max(0, -Math.cos(az)), 0.7);
        for (let y = 0.35; y > -fundo; y -= 0.105) {
          const rr = y > 0 ? 1.1 * Math.sqrt(1 - (y / 1.1) ** 2) : 1.1 + 0.02 * Math.sin(y * 5 + k);
          bs.push({ p: new THREE.Vector3(Math.sin(az) * rr * R, y * R, Math.cos(az) * rr * R * 0.96), r: 0.0155, s: [1.15, 0.9, 1.15] });
        }
      }
      add(bolas(bs));
      break;
    }
    case 'trancinhas': {
      const L: Linha = { f: 0.84, s: 1.4, b: 1.9 };
      add(calota(rosto, L, 0.035));
      const bs: Bola[] = [];
      for (let k = -4; k <= 4; k++) {
        // fileiras da testa até a nuca
        for (let t = -0.8; t <= 1.85; t += 0.085) {
          const dir = new THREE.Vector3(Math.sin(k * 0.21) * Math.cos(t - 0.5), 0, 0);
          dir.set(Math.sin(k * 0.2), Math.cos(k * 0.2) * Math.cos(t), -Math.cos(k * 0.2) * Math.sin(t)).normalize();
          const teta = Math.acos(dir.y), az = Math.atan2(dir.x, dir.z);
          if (teta > limite(L, az)) continue;
          bs.push({ p: naCabeca(rosto, dir, 1.055), r: 0.0125, s: [1.25, 1, 1.25] });
        }
      }
      add(bolas(bs));
      break;
    }
    case 'coque': {
      add(calota(rosto, { f: 0.84, s: 1.45, b: 1.9 }, 0.055, (t, az) => 0.006 * Math.sin(az * 14 + t * 2)));
      add(bolas([{ p: naCabeca(rosto, dirTopo(0.42, Math.PI), 1.3), r: 0.088 }], 3));
      break;
    }
    case 'rabo-de-cavalo': {
      add(calota(rosto, { f: 0.84, s: 1.45, b: 1.9 }, 0.055, (t, az) => 0.006 * Math.sin(az * 14 + t * 2)));
      const bs: Bola[] = [];
      for (let i = 0; i <= 12; i++) {
        const u = i / 12;
        bs.push({ p: new THREE.Vector3(0, (0.55 - 1.75 * u * u - 0.2 * u) * R, -(1.12 + 0.55 * Math.sin(u * Math.PI * 0.75)) * R), r: 0.062 * (1 - 0.55 * u) + 0.008 });
      }
      add(bolas(bs, 2));
      break;
    }
    case 'maria-chiquinha': {
      add(calota(rosto, { f: 0.84, s: 1.45, b: 1.9 }, 0.055, (t, az) => 0.006 * Math.sin(az * 14 + t * 2)));
      const bs: Bola[] = [];
      for (const lado of [-1, 1]) for (let i = 0; i <= 8; i++) {
        const u = i / 8;
        bs.push({ p: new THREE.Vector3(lado * (1.12 + 0.3 * Math.sin(u * Math.PI * 0.8)) * R, (0.45 - 1.5 * u) * R, -0.1 * R), r: 0.06 * (1 - 0.5 * u) + 0.008 });
      }
      add(bolas(bs, 2));
      break;
    }
    default:
      add(calota(rosto, CURTO, 0.07));
  }
  return g;
}

/* ------------------------------------------------------------------ corpo (pele) */

const capsula = (raio: number, y0: number, y1: number, seg = 20) => {
  const g = new THREE.CapsuleGeometry(raio, Math.max(0.001, Math.abs(y1 - y0)), 8, seg);
  g.translate(0, (y0 + y1) / 2, 0);
  return g;
};

/** Grupo do braço no ombro (pose relaxada). As peças do braço são desenhadas para baixo, a partir de y = 0. */
function braco(lado: number): THREE.Group {
  const g = new THREE.Group();
  g.position.set(lado * M.ombroX, M.ombroY, 0);
  g.rotation.z = lado * 0.2;
  g.rotation.x = 0.04;
  return g;
}
/** Grupos da perna: `coxa` no quadril e `joelho` dentro dela. Sentado (cadeira de rodas), a coxa vai para a frente. */
function perna(lado: number, sentado: boolean): { coxa: THREE.Group; joelho: THREE.Group } {
  const coxa = new THREE.Group();
  coxa.position.set(lado * M.quadrilX, M.quadrilY, 0);
  const joelho = new THREE.Group();
  joelho.position.set(0, -M.coxa, 0);
  coxa.add(joelho);
  if (sentado) { coxa.rotation.x = -Math.PI / 2; joelho.rotation.x = Math.PI / 2; }
  return { coxa, joelho };
}

export function criarCorpo(a: Aparencia, sentado: boolean): THREE.Group {
  const g = new THREE.Group();
  g.name = 'corpo';
  const pele = matPele(a.pele);
  const pesc = malha(new THREE.CylinderGeometry(0.043, 0.048, 0.1, 24), pele);
  pesc.position.y = 0.685;
  g.add(pesc);
  for (const lado of [-1, 1]) {
    const b = braco(lado);
    b.add(malha(capsula(0.037, -0.02, -0.14), pele), malha(capsula(0.033, -0.14, -0.262), pele));
    const mao = malha(new THREE.SphereGeometry(0.041, 20, 16), pele);
    mao.scale.set(0.88, 1.08, 0.8);
    mao.position.y = -0.3;
    b.add(mao);
    g.add(b);
    const { coxa, joelho } = perna(lado, sentado);
    coxa.add(malha(capsula(0.05, -0.04, -M.coxa), pele));
    joelho.add(malha(capsula(0.043, 0, -M.canela + 0.02), pele));
    const pe = malha(new THREE.SphereGeometry(1, 20, 14), pele);
    pe.scale.set(0.04, 0.03, 0.074);
    pe.position.set(0, -M.canela - 0.048, 0.03);
    joelho.add(pe);
    g.add(coxa);
  }
  return g;
}

/* ------------------------------------------------------------------ roupas */

function texturaTecido(p: PecaVestida): THREE.CanvasTexture | null {
  if (!p.estampa) return null;
  return compartilhada(`tecido:${p.estampa}:${p.cor}:${p.cor2}`, () => desenharTecido(p));
}
function desenharTecido(p: PecaVestida): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 512;
  const g = c.getContext('2d')!;
  g.fillStyle = p.cor; g.fillRect(0, 0, 512, 512);
  if (p.estampa === 'listras') {
    g.fillStyle = p.cor2;
    for (let y = 30; y < 512; y += 76) g.fillRect(0, y, 512, 34);
  } else {
    g.save();
    g.translate(256, p.estampa === 'letra' ? 232 : 236);
    g.scale(0.5, 1);
    g.fillStyle = p.cor2;
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.font = `800 ${p.estampa === 'letra' ? 150 : 120}px Fredoka, "Arial Rounded MT Bold", Arial, sans-serif`;
    g.fillText(p.estampa === 'letra' ? 'A' : '10', 0, 0);
    g.restore();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

/** Perfil do tronco (raio × altura), amostrado em alturas iguais para a estampa não deformar. */
function tronco(perfil: [number, number][], n = 28): THREE.LatheGeometry {
  const y0 = perfil[0][0], y1 = perfil[perfil.length - 1][0];
  const pts: THREE.Vector2[] = [new THREE.Vector2(0.001, y0)];
  for (let i = 0; i <= n; i++) {
    const y = y0 + ((y1 - y0) * i) / n;
    let k = 0;
    while (k < perfil.length - 2 && perfil[k + 1][0] < y) k++;
    const [ya, ra] = perfil[k], [yb, rb] = perfil[k + 1];
    const t = THREE.MathUtils.smoothstep((y - ya) / (yb - ya || 1), 0, 1);
    pts.push(new THREE.Vector2(ra + (rb - ra) * t, y));
  }
  const g = new THREE.LatheGeometry(pts, 48, Math.PI, Math.PI * 2);
  g.scale(1.1, 1, 0.8);
  return g;
}

const ROUPA_BASE_CAMISA: PecaVestida = { id: 'base', modelo: 'regata', cor: COR_ROUPA_BASE, cor2: COR_ROUPA_BASE };
const ROUPA_BASE_CALCA: PecaVestida = { id: 'base', modelo: 'bermuda', cor: COR_ROUPA_BASE, cor2: COR_ROUPA_BASE };

export function criarCamisa(a: Aparencia): THREE.Group {
  const g = new THREE.Group();
  g.name = 'camisa';
  const p = a.camisa ?? ROUPA_BASE_CAMISA;
  const tex = texturaTecido(p);
  const mat = matTecido(tex ? '#FFFFFF' : p.cor);
  if (tex) mat.map = tex;
  const mat2 = matTecido(p.cor2, 'tecido2');
  const bata = p.modelo === 'bata';
  const regata = p.modelo === 'regata';
  const perfil: [number, number][] = bata
    ? [[0.3, 0.15], [0.36, 0.138], [0.46, 0.121], [0.54, 0.116], [0.6, 0.107], [0.645, 0.084], [0.672, 0.056], [0.69, 0.048]]
    : [[0.335, 0.108], [0.4, 0.119], [0.46, 0.121], [0.54, 0.117], [0.6, 0.107], [0.645, regata ? 0.074 : 0.084], [0.672, 0.056], [0.69, 0.048]];
  g.add(malha(tronco(perfil), mat));
  // gola
  const gola = malha(new THREE.TorusGeometry(0.05, p.modelo === 'polo' ? 0.016 : 0.0105, 10, 32), p.modelo === 'polo' || p.id === 'uniforme' || p.estampa === 'numero' ? mat2 : matTecido(p.cor));
  gola.rotation.x = Math.PI / 2;
  gola.scale.set(1.05, 0.9, 1);
  gola.position.y = 0.683;
  g.add(gola);
  if (p.modelo === 'polo') {
    const aba = malha(new RoundedBoxGeometry(0.02, 0.07, 0.01, 2, 0.004), mat2, false);
    aba.position.set(0, 0.64, 0.083);
    aba.rotation.x = -0.25;
    g.add(aba);
  }
  if (bata) {
    const barra = malha(new THREE.TorusGeometry(0.149, 0.007, 8, 48), mat2, false);
    barra.rotation.x = Math.PI / 2;
    barra.scale.set(1.1, 0.8, 1);
    barra.position.y = 0.302;
    g.add(barra);
  }
  // mangas
  const matManga = p.id === 'uniforme' || p.estampa === 'numero' ? mat2 : matTecido(p.cor);
  for (const lado of [-1, 1]) {
    const b = braco(lado);
    if (p.modelo === 'bufante') {
      const m = malha(new THREE.SphereGeometry(0.064, 24, 18), matManga);
      m.scale.set(1, 0.9, 1);
      m.position.y = -0.035;
      const punho = malha(new THREE.TorusGeometry(0.04, 0.008, 8, 24), mat2, false);
      punho.rotation.x = Math.PI / 2;
      punho.position.y = -0.085;
      b.add(m, punho);
    } else if (p.modelo === 'manga-longa') {
      b.add(malha(capsula(0.048, 0.0, -0.14), matManga), malha(capsula(0.043, -0.14, -0.25), matManga));
    } else if (!regata) {
      b.add(malha(capsula(0.0475, 0.0, -0.095), matManga));
    }
    if (!regata) g.add(b);
  }
  return g;
}

export function criarCalca(a: Aparencia, sentado: boolean): THREE.Group {
  const g = new THREE.Group();
  g.name = 'calca';
  const p = a.calca ?? ROUPA_BASE_CALCA;
  const mat = matTecido(p.cor);
  const quadril = malha(new THREE.SphereGeometry(1, 32, 20), mat);
  quadril.scale.set(0.113, 0.072, 0.086);
  quadril.position.y = 0.385;
  g.add(quadril);
  if (p.modelo === 'saia') {
    if (sentado) {
      const s = malha(new THREE.SphereGeometry(1, 32, 20), mat);
      s.scale.set(0.15, 0.062, 0.125);
      s.position.set(0, 0.388, 0.075);
      g.add(s);
    } else {
      const s = malha(new THREE.LatheGeometry([[0.1, 0.25], [0.168, 0.23], [0.172, 0.235], [0.15, 0.31], [0.122, 0.39], [0.108, 0.42]].map(([r, y]) => new THREE.Vector2(r, y)), 48), mat);
      s.scale.set(1, 1, 0.86);
      (s.material as THREE.Material).side = THREE.DoubleSide;
      g.add(s);
    }
    return g;
  }
  for (const lado of [-1, 1]) {
    const { coxa, joelho } = perna(lado, sentado);
    const justa = p.modelo === 'legging';
    coxa.add(malha(capsula(justa ? 0.053 : 0.059, -0.045, -M.coxa + (p.modelo === 'bermuda' ? 0.025 : 0)), mat));
    if (p.modelo !== 'bermuda') joelho.add(malha(capsula(justa ? 0.046 : 0.052, 0.005, -M.canela + 0.045), mat));
    g.add(coxa);
  }
  return g;
}

export function criarCalcado(a: Aparencia, sentado: boolean): THREE.Group {
  const g = new THREE.Group();
  g.name = 'calcado';
  const p = a.calcado;
  if (!p) return g;
  const mat = matSimples(p.cor, 0.55, 0, 'tecido');
  const mat2 = matSimples(p.cor2, 0.6, 0, 'tecido2');
  for (const lado of [-1, 1]) {
    const { coxa, joelho } = perna(lado, sentado);
    const pe = new THREE.Group();
    pe.position.set(0, -M.canela - 0.08, 0.028); // y = 0 do pé é o chão
    joelho.add(pe);
    const elips = (sx: number, sy: number, sz: number, y: number, z: number, m: THREE.Material) => {
      const e = malha(new THREE.SphereGeometry(1, 28, 18), m);
      e.scale.set(sx, sy, sz);
      e.position.set(0, y, z);
      pe.add(e);
      return e;
    };
    if (p.modelo === 'sandalia') {
      elips(0.05, 0.012, 0.086, 0.011, 0, mat);
      for (const z of [0.03, -0.035]) {
        const t = malha(new THREE.TorusGeometry(0.041, 0.008, 8, 24, Math.PI), mat2, false);
        t.position.set(0, 0.014, z);
        t.scale.set(1, 0.95, 1);
        pe.add(t);
      }
    } else {
      const baixa = p.modelo === 'sapatilha';
      elips(0.056, 0.02, 0.093, 0.016, 0, mat2); // sola
      elips(0.052, baixa ? 0.032 : 0.044, 0.088, baixa ? 0.036 : 0.046, 0, mat);
      if (p.modelo === 'tenis') {
        elips(0.04, 0.02, 0.03, 0.035, 0.062, mat2); // biqueira
        const cano = malha(new THREE.TorusGeometry(0.043, 0.011, 8, 24), mat2, false);
        cano.rotation.x = Math.PI / 2;
        cano.position.set(0, 0.083, -0.026);
        pe.add(cano);
      } else if (p.modelo === 'bota') {
        const cano = malha(new THREE.CylinderGeometry(0.054, 0.05, 0.1, 24), mat);
        cano.position.set(0, 0.105, -0.026);
        const borda = malha(new THREE.TorusGeometry(0.054, 0.008, 8, 24), mat2, false);
        borda.rotation.x = Math.PI / 2;
        borda.position.set(0, 0.155, -0.026);
        pe.add(cano, borda);
      } else if (baixa) {
        const tira = malha(new THREE.TorusGeometry(0.044, 0.006, 8, 24, Math.PI), mat, false);
        tira.position.set(0, 0.04, -0.01);
        pe.add(tira);
      }
    }
    g.add(coxa);
  }
  return g;
}

/* ------------------------------------------------------------------ acessibilidade */

/** Óculos, aparelho auditivo e pintura no rosto: no espaço da cabeça. */
export function criarAcessorioCabeca(id: string, a: Aparencia): THREE.Group | null {
  const g = new THREE.Group();
  g.name = `acessibilidade-${id}`;
  if (id === 'oculos') {
    const mat = matSimples('#1F3A6E', 0.35, 0.1, 'armacao');
    const lente = new THREE.MeshPhysicalMaterial({ name: 'lente', color: 0xffffff, transparent: true, opacity: 0.16, roughness: 0.05, depthWrite: false });
    const centros: THREE.Vector3[] = [];
    for (const lado of [-1, 1]) {
      const c = noRosto(a.rosto, lado * 0.345, -0.02, 1.0);
      c.z = R * 1.03; c.x = lado * 0.07;
      centros.push(c);
      const aro = malha(new THREE.TorusGeometry(0.052, 0.0065, 10, 40), mat, false);
      aro.position.copy(c);
      aro.rotation.y = lado * 0.16;
      const l = new THREE.Mesh(new THREE.CircleGeometry(0.05, 32), lente);
      l.position.copy(c);
      l.rotation.y = lado * 0.16;
      g.add(aro, l);
      // haste até a orelha
      const ini = new THREE.Vector3(lado * 0.122, c.y + 0.005, c.z - 0.012), fim = noRosto(a.rosto, lado * Math.PI / 2, 0.02, 1.02);
      const meio = ini.clone().lerp(fim, 0.5); meio.x = lado * Math.max(Math.abs(ini.x), Math.abs(fim.x)) * 1.03;
      g.add(malha(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([ini, meio, fim]), 16, 0.0048, 8), mat, false));
    }
    const ponte = malha(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([centros[0].clone().setX(-0.02), new THREE.Vector3(0, centros[0].y + 0.008, R * 1.05), centros[1].clone().setX(0.02)]), 10, 0.0055, 8), mat, false);
    g.add(ponte);
    return g;
  }
  if (id === 'aparelho-auditivo') {
    const mat = matSimples('#CDBBA6', 0.4, 0, 'aparelho');
    const fio = matSimples('#F4F1EC', 0.3, 0, 'aparelho-fio');
    for (const lado of [-1, 1]) {
      const corpo = malha(new THREE.CapsuleGeometry(0.0125, 0.034, 6, 12), mat, false);
      corpo.position.copy(noRosto(a.rosto, lado * (Math.PI / 2 + 0.3), 0.0, 1.03));
      corpo.rotation.x = 0.25;
      const cima = noRosto(a.rosto, lado * (Math.PI / 2 + 0.12), 0.2, 1.05);
      const dentro = noRosto(a.rosto, lado * (Math.PI / 2 - 0.08), -0.06, 1.08);
      const curva = new THREE.CatmullRomCurve3([corpo.position.clone().add(new THREE.Vector3(0, 0.02, 0)), cima, noRosto(a.rosto, lado * (Math.PI / 2 - 0.12), 0.1, 1.1), dentro]);
      g.add(corpo, malha(new THREE.TubeGeometry(curva, 20, 0.0035, 6), fio, false));
      const molde = malha(new THREE.SphereGeometry(0.011, 12, 10), fio, false);
      molde.position.copy(dentro);
      g.add(molde);
    }
    return g;
  }
  if (id === 'pintura-no-rosto') {
    const mat = new THREE.MeshStandardMaterial({ name: 'pintura', color: 0xb5432a, roughness: 0.9 });
    for (const lado of [-1, 1]) for (const el of [-0.2, -0.3]) {
      const pts: THREE.Vector3[] = [];
      for (let i = 0; i <= 6; i++) pts.push(noRosto(a.rosto, lado * (0.52 + 0.3 * (i / 6)), el, 1.004));
      g.add(malha(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 12, 0.0065, 6), mat, false));
    }
    return g;
  }
  return null;
}

/** Cadeira de rodas (o boneco fica sentado). */
export function criarCadeira(): THREE.Group {
  const g = new THREE.Group();
  g.name = 'acessibilidade-cadeira-de-rodas';
  const quadro = matSimples('#1F3A6E', 0.35, 0.45, 'quadro');
  const pneu = matSimples('#22252B', 0.8, 0, 'pneu');
  const aro = matSimples('#C9D2DE', 0.25, 0.8, 'aro');
  const assento = matSimples('#F1B434', 0.8, 0, 'assento');
  const tubo = (a: [number, number, number], b: [number, number, number], r = 0.011) => {
    const va = new THREE.Vector3(...a), vb = new THREE.Vector3(...b);
    const m = malha(new THREE.CylinderGeometry(r, r, va.distanceTo(vb), 12), quadro);
    m.position.copy(va).lerp(vb, 0.5);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), vb.clone().sub(va).normalize());
    g.add(m);
  };
  const as = malha(new RoundedBoxGeometry(0.33, 0.04, 0.27, 3, 0.018), assento);
  as.position.set(0, 0.295, 0.035);
  const enc = malha(new RoundedBoxGeometry(0.33, 0.26, 0.035, 3, 0.016), assento);
  enc.position.set(0, 0.46, -0.115);
  enc.rotation.x = -0.08;
  g.add(as, enc);
  for (const lado of [-1, 1]) {
    const x = lado * 0.205;
    const roda = new THREE.Group();
    roda.position.set(x, 0.185, -0.03);
    roda.rotation.y = Math.PI / 2;
    roda.add(malha(new THREE.TorusGeometry(0.17, 0.016, 12, 48), pneu), malha(new THREE.TorusGeometry(0.15, 0.006, 8, 48), aro, false));
    const empurra = malha(new THREE.TorusGeometry(0.158, 0.005, 8, 48), aro, false);
    empurra.position.z = lado * 0.022;
    roda.add(empurra);
    for (let i = 0; i < 8; i++) {
      const raio = malha(new THREE.CylinderGeometry(0.003, 0.003, 0.3, 6), aro, false);
      raio.rotation.z = (i / 8) * Math.PI;
      roda.add(raio);
    }
    const cubo = malha(new THREE.CylinderGeometry(0.02, 0.02, 0.03, 16), quadro, false);
    cubo.rotation.x = Math.PI / 2;
    roda.add(cubo);
    g.add(roda);
    const xi = lado * 0.172;
    tubo([xi, 0.28, -0.11], [xi, 0.28, 0.17]);
    tubo([xi, 0.28, 0.17], [xi, 0.1, 0.23]);
    tubo([xi, 0.185, -0.03], [xi, 0.28, -0.03]);
    tubo([xi, 0.28, -0.125], [xi, 0.62, -0.15]);
    tubo([xi, 0.62, -0.15], [xi, 0.625, -0.2], 0.013);
    tubo([xi, 0.38, -0.13], [xi, 0.38, 0.1], 0.012); // apoio do braço
    tubo([xi, 0.38, 0.1], [xi, 0.28, 0.12]);
    const rodinha = malha(new THREE.TorusGeometry(0.032, 0.012, 10, 24), pneu);
    rodinha.position.set(xi, 0.044, 0.215);
    rodinha.rotation.y = Math.PI / 2;
    g.add(rodinha);
    tubo([xi, 0.044, 0.215], [xi, 0.1, 0.23], 0.008);
    const apoio = malha(new RoundedBoxGeometry(0.09, 0.012, 0.1, 2, 0.005), quadro);
    apoio.position.set(lado * 0.07, 0.142, 0.19);
    g.add(apoio);
    tubo([lado * 0.11, 0.142, 0.2], [xi, 0.142, 0.215], 0.008);
  }
  tubo([-0.172, 0.2, -0.09], [0.172, 0.2, -0.09]);
  return g;
}
