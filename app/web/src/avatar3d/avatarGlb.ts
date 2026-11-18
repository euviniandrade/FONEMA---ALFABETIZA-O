/**
 * AVATAR 3D DE VERDADE (D029 §7): modelo pronto (GLB de malha única, com uma textura) recolorido por região.
 *
 * Cada modelo tem uma textura de cor e uma MÁSCARA (app/ferramentas/avatar-mascaras.py) que diz, texel por texel,
 * o que é pele, cabelo/sobrancelha, íris, camiseta, calça e calçado. Para aplicar as cores escolhidas, a textura é
 * RECOMPOSTA num canvas (uma vez por combinação de cores, em milissegundos) e vira o mapa de cor do material:
 *  - roupa branca × cor (multiplicação em luz linear: dobras e sombras continuam lá);
 *  - pele: troca de tom preservando o sombreado, o corado das bochechas e a boca (razão canal a canal, em luz linear);
 *  - cabelo e sobrancelhas: troca de tom pela luminância (mechas e brilho continuam);
 *  - íris: só o castanho pintado da íris troca de cor, seguindo o claro-escuro original; pupila, brilho, cílios e
 *    o branco do olho não mudam.
 * A letra "A", os cílios, o branco dos olhos e a sola do tênis ficam fora da máscara: nunca mudam.
 */
import * as THREE from 'three';
import { lerGLB } from '../componentes/glb-comum.ts';
import { PASTA_MODELOS3D, carregarAvatares, type InfoAvatar } from './avatares.ts';
import { criarPenteado } from './cabelos.ts';
import { ALTURA_BONECO, modeloPadrao, type Aparencia } from './modelo.ts';

interface Base {
  info: InfoAvatar;
  malhas: THREE.Mesh[];
  cor: ImageData;
  mascara: ImageData;
  /** Do espaço do arquivo para o da cena: pés no chão, de frente para +Z, altura ALTURA_BONECO. */
  matriz: THREE.Matrix4;
}

const bases = new Map<string, Promise<Base | null>>();

async function lerImagem(url: string): Promise<ImageData> {
  const blob = await (await fetch(url)).blob();
  // sem conversão de cor nem alfa pré-multiplicado: a máscara guarda números, não cores
  const bmp = await createImageBitmap(blob, { colorSpaceConversion: 'none', premultiplyAlpha: 'none' });
  const c = document.createElement('canvas');
  c.width = bmp.width; c.height = bmp.height;
  const g = c.getContext('2d', { willReadFrequently: true })!;
  g.drawImage(bmp, 0, 0);
  bmp.close();
  return g.getImageData(0, 0, c.width, c.height);
}

function carregarBase(chave: string): Promise<Base | null> {
  let p = bases.get(chave);
  if (!p) {
    p = (async () => {
      const info = (await carregarAvatares()).modelos[chave];
      if (!info) return null;
      // o mesmo carregador de GLB do resto do app (meshopt + WebP, com cache)
      const [gltf, cor, mascara] = await Promise.all([
        lerGLB(PASTA_MODELOS3D + info.arquivo, '[avatar3d]'), lerImagem(PASTA_MODELOS3D + info.cor), lerImagem(PASTA_MODELOS3D + info.mascara)
      ]);
      if (!gltf) throw new Error(`${chave}: GLB não carregou`);
      if (cor.width !== mascara.width || cor.height !== mascara.height) throw new Error(`máscara e textura de ${chave} com tamanhos diferentes`);
      const malhas: THREE.Mesh[] = [];
      gltf.scene.updateMatrixWorld(true);
      gltf.scene.traverse((o) => { if ((o as THREE.Mesh).isMesh) malhas.push(o as THREE.Mesh); });
      if (!malhas.length) throw new Error(`${chave}: GLB sem malha`);
      const { min, max } = info.caixa;
      const escala = ALTURA_BONECO / (max[1] - min[1]);
      const giro = Math.atan2(-info.frente[0], info.frente[1]);
      const matriz = new THREE.Matrix4()
        .makeScale(escala, escala, escala)
        .multiply(new THREE.Matrix4().makeRotationY(giro))
        .multiply(new THREE.Matrix4().makeTranslation(-(min[0] + max[0]) / 2, -min[1], -(min[2] + max[2]) / 2));
      return { info, malhas, cor, mascara, matriz };
    })().catch((e) => {
      console.warn(`[avatar3d] modelo ${chave} não carregou; uso a reserva.`, e);
      return null;
    });
    bases.set(chave, p);
  }
  return p;
}

/* ------------------------------------------------------------------ cabeça com o cabelo do modelo rente */

/** Crânio aproximado (elipsoide, no espaço da cena): onde as peças de cabelo (cabelos.ts) se apoiam. */
export interface Cranio { centro: THREE.Vector3; raios: THREE.Vector3; /** raio vertical abaixo do centro (nuca) */ baixo: number }

interface Pescoco { x: number; z: number; rx: number; rz: number; y0: number; y1: number }
interface Raspado { geometria: THREE.BufferGeometry; cranio: Cranio; pescoco: Pescoco | null }
const raspados = new WeakMap<THREE.BufferGeometry, Raspado>();

/**
 * Quando a criança escolhe outro penteado, o cabelo pintado no modelo (canal B da máscara; a sobrancelha fica de fora)
 * é "cortado rente": cada vértice de cabelo que passa do crânio é puxado para a superfície dele. O cabelo comprido da
 * menina vira um corte bem curto, sem buraco na cabeça e sem emenda na testa (os vértices perto da pele quase não
 * mexem). A peça de cabelo nova vai por cima. `t` leva do espaço da malha para o da cena.
 */
function cabeloRente(g: THREE.BufferGeometry, mascara: ImageData, mapa: THREE.Texture | null | undefined, t: THREE.Matrix4, olhoY: number): Raspado {
  let r = raspados.get(g);
  if (r) return r;
  const uv = g.getAttribute('uv'), pos = g.getAttribute('position'), nor = g.getAttribute('normal');
  const L = mascara.width, A = mascara.height, m = mascara.data;
  // UVs quantizados (meshopt) vêm com a transformação de textura no mapa original
  const ox = mapa?.offset.x ?? 0, oy = mapa?.offset.y ?? 0, rx = mapa?.repeat.x ?? 1, ry = mapa?.repeat.y ?? 1;
  const n = pos.count;
  const cena = new Float32Array(n * 3);
  const cabelo = new Uint8Array(n);
  const v = new THREE.Vector3();
  const min = new THREE.Vector3(Infinity, Infinity, Infinity), max = new THREE.Vector3(-Infinity, -Infinity, -Infinity);
  for (let i = 0; i < n; i++) {
    v.fromBufferAttribute(pos, i).applyMatrix4(t);
    cena[i * 3] = v.x; cena[i * 3 + 1] = v.y; cena[i * 3 + 2] = v.z;
    if (!uv) continue;
    const x = Math.min(L - 1, Math.max(0, Math.floor((uv.getX(i) * rx + ox) * L)));
    const y = Math.min(A - 1, Math.max(0, Math.floor((uv.getY(i) * ry + oy) * A)));
    if (m[(y * L + x) * 4 + 2] > 127) {
      cabelo[i] = 1;
      if (v.y > olhoY) { min.min(v); max.max(v); }
    }
  }
  // elipsoide do cabelo acima dos olhos; o crânio fica um pouco por dentro (o cabelo tem volume)
  const centro = new THREE.Vector3((min.x + max.x) / 2, olhoY, (min.z + max.z) / 2 - 0.004);
  const raios = new THREE.Vector3((max.x - min.x) / 2, max.y - olhoY, (max.z - min.z) / 2);
  const k = new THREE.Vector3(Math.min(0.93, 0.158 / raios.x), 0.9, 0.92);
  const cranio: Cranio = { centro, raios: raios.clone().multiply(k), baixo: Math.min(raios.y * 0.9, 0.1) };
  const inv = t.clone().invert();
  const nt = new THREE.Matrix3().getNormalMatrix(inv); // normais da cena de volta para a malha
  const novaPos = new Float32Array(n * 3), novaNor = new Float32Array(n * 3);
  const levantado = new Uint8Array(n);
  // o cabelo do modelo desce abaixo da nuca? (menina: sim; menino: só a sombra da gola, que fica como está)
  let abaixo = 0;
  for (let i = 0; i < n; i++) if (cabelo[i] && cena[i * 3 + 1] < centro.y - 0.7 * cranio.baixo - 0.05) abaixo++;
  const desce = abaixo > 50;
  const d = new THREE.Vector3(), nn = new THREE.Vector3();
  for (let i = 0; i < n; i++) {
    v.set(cena[i * 3], cena[i * 3 + 1], cena[i * 3 + 2]);
    if (nor) nn.fromBufferAttribute(nor, i); else nn.set(0, 1, 0);
    const linhaNuca = centro.y - 0.7 * cranio.baixo;
    // abaixo da linha da nuca o cabelo comprido não se mexe: os triângulos só de cabelo dali saem da malha (abaixo)
    if (cabelo[i] && v.y < linhaNuca && desce) levantado[i] = 1;
    if (cabelo[i] && !levantado[i] && v.y >= linhaNuca) {
      // abaixo do centro o crânio é mais baixo (nuca): o cabelo comprido sobe até ela
      const rr = v.y < centro.y ? new THREE.Vector3(cranio.raios.x, cranio.baixo, cranio.raios.z) : cranio.raios.clone();
      // nas têmporas e na frente da orelha o cabelo comprido vai para dentro (senão vira uma aba saindo do rosto)
      const frente = (v.z - centro.z) / Math.max(1e-6, Math.hypot(v.x - centro.x, v.z - centro.z));
      if (frente > 0.15 && v.y < centro.y + 0.75 * cranio.raios.y) rr.multiplyScalar(1 - 0.16 * Math.min(1, (frente - 0.15) / 0.35) * Math.min(1, (centro.y + 0.75 * cranio.raios.y - v.y) / (0.3 * cranio.raios.y)));
      d.subVectors(v, centro).divide(rr);
      const rho = d.length();
      // na nuca, até o que estava por dentro vai para a superfície (sem pontas soltas penduradas no pescoço)
      if (rho > 1 || (v.y < centro.y - 0.5 * cranio.baixo && frente < 0.3)) {
        v.copy(centro).addScaledVector(d.divideScalar(rho).multiply(rr), 1);
        // normal do elipsoide (gradiente), já no espaço da malha
        nn.copy(d).divide(rr).normalize().applyMatrix3(nt).normalize();
      }
      v.applyMatrix4(inv);
    } else v.fromBufferAttribute(pos, i);
    novaPos[i * 3] = v.x; novaPos[i * 3 + 1] = v.y; novaPos[i * 3 + 2] = v.z;
    novaNor[i * 3] = nn.x; novaNor[i * 3 + 1] = nn.y; novaNor[i * 3 + 2] = nn.z;
  }
  const geo = g.clone();
  geo.setAttribute('position', new THREE.BufferAttribute(novaPos, 3));
  geo.setAttribute('normal', new THREE.BufferAttribute(novaNor, 3));
  // o "colarinho" de pele cobre o pescoço onde o cabelo comprido saiu
  if (g.index && levantado.some((x) => x)) {
    const ix = g.index, fica: number[] = [];
    for (let i = 0; i < ix.count; i += 3) {
      const a = ix.getX(i), b = ix.getX(i + 1), c = ix.getX(i + 2);
      // triângulo com algum vértice de cabelo abaixo da nuca: é o cabelo comprido pendurado (sai), inclusive as pontas
      // presas à pele junto ao queixo (antes viravam tufinhos escuros)
      if (levantado[a] || levantado[b] || levantado[c]) continue;
      fica.push(a, b, c);
    }
    geo.setIndex(fica);
  }
  geo.computeBoundingBox(); geo.computeBoundingSphere();
  // pescoço: a textura da nuca (que o cabelo comprido escondia) não tem pele pintada direito; com cabelo curto um
  // "colarinho" de pele cobre a parte de trás dele (avatarGlb › criarBonecoGlb)
  const y1 = centro.y - 0.7 * cranio.baixo, y0 = y1 - 0.11;
  // largura do pescoço logo abaixo da nuca (pela pele dos lados; a parte de trás é cabelo e foi puxada para cima)
  let xMin = Infinity, xMax = -Infinity;
  for (let i = 0; i < n; i++) {
    const y = cena[i * 3 + 1];
    if (cabelo[i] || y < y1 - 0.07 || y > y1 - 0.01) continue;
    const x = cena[i * 3], z = cena[i * 3 + 2];
    if (Math.abs(z - centro.z) > 0.03 || Math.abs(x - centro.x) > 0.09) continue;
    xMin = Math.min(xMin, x); xMax = Math.max(xMax, x);
  }
  const rxP = (xMax - xMin) / 2;
  // só quando o cabelo do modelo descia abaixo da nuca (a menina): no menino a nuca já tem pele
  let comprido = 0;
  for (let i = 0; i < n; i++) if (cabelo[i] && cena[i * 3 + 1] < y1 - 0.05) comprido++;
  const pescoco = rxP > 0.02 && comprido > 50 ? { x: (xMin + xMax) / 2, z: centro.z + 0.005, rx: rxP, rz: rxP * 0.95, y0, y1 } : null;
  r = { geometria: geo, cranio, pescoco };
  raspados.set(g, r);
  return r;
}

/* ------------------------------------------------------------------ recoloração da textura */

const PARA_LINEAR = new Float32Array(256);
for (let i = 0; i < 256; i++) { const v = i / 255; PARA_LINEAR[i] = v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }
const PARA_SRGB = new Uint8ClampedArray(4097);
for (let i = 0; i <= 4096; i++) { const v = i / 4096; PARA_SRGB[i] = Math.round(255 * (v <= 0.0031308 ? v * 12.92 : 1.055 * Math.pow(v, 1 / 2.4) - 0.055)); }
const srgb = (linear: number) => PARA_SRGB[linear <= 0 ? 0 : linear >= 1 ? 4096 : (linear * 4096) | 0];
const linearDe = (hex: string): [number, number, number] => { const c = new THREE.Color(hex); return [c.r, c.g, c.b]; }; // THREE.Color já guarda em linear
const linearDeMedia = (m: [number, number, number]): [number, number, number] => [PARA_LINEAR[Math.round(m[0])], PARA_LINEAR[Math.round(m[1])], PARA_LINEAR[Math.round(m[2])]];
const lum = (r: number, g: number, b: number) => 0.2126 * r + 0.7152 * g + 0.0722 * b;

/**
 * Aplica no tom-alvo `t` a mesma variação que o texel tinha em relação à média da região (`razao`).
 * Mais escuro que a média: escurece na mesma proporção. Mais claro: clareia sem estourar (num tom claro o brilho
 * não vira branco chapado; num tom escuro, não acinzenta).
 */
function tom(t: number, razao: number): number {
  if (razao <= 1) return t * razao;
  // num tom escuro o brilho cresce na proporção inteira; num tom claro cresce pouco (não há para onde clarear)
  const v = t * (1 + (razao - 1) * (1 - 0.8 * Math.min(1, t)));
  return v <= 0.7 ? v : 0.7 + 0.3 * (1 - Math.exp(-(v - 0.7) / 0.3));
}

/** Recompõe a textura de cor com as cores escolhidas. Região sem cor escolhida fica como no original. */
export function recolorir(base: Pick<Base, 'cor' | 'mascara' | 'info'>, a: Pick<Aparencia, 'pele' | 'olhos' | 'cabelo' | 'camisa' | 'calca' | 'calcado' | 'penteado'>): ImageData {
  const { cor, mascara, info } = base;
  const src = cor.data, msk = mascara.data;
  const out = new ImageData(new Uint8ClampedArray(src), cor.width, cor.height);
  const d = out.data;
  const pele = a.pele ? linearDe(a.pele) : null, mPele = linearDeMedia(info.medias.pele);
  const cabelo = a.cabelo ? linearDe(a.cabelo) : null, mCabelo = linearDeMedia(info.medias.cabelo);
  const lCabelo = Math.max(0.004, lum(mCabelo[0], mCabelo[1], mCabelo[2]));
  const iris = a.olhos ? linearDe(a.olhos) : null, mIris = linearDeMedia(info.medias.iris);
  const lIris = Math.max(0.004, lum(mIris[0], mIris[1], mIris[2]));
  const branco = PARA_LINEAR[Math.round(info.medias.roupa[0])];
  const roupa = [null, null, null, null, a.camisa ? linearDe(a.camisa) : null, a.calca ? linearDe(a.calca) : null, a.calcado ? linearDe(a.calcado) : null];
  // pele escura: o original é claro, então o sombreado "cabe" inteiro; só limitamos o brilho para não estourar
  const nuca = a.penteado ? (pele ?? mPele) : null;
  for (let i = 0; i < d.length; i += 4) {
    const regiao = msk[i];
    if (regiao === 0) {
      // com cabelo curto aparece a nuca que o cabelo comprido escondia (sem cor de pele na textura): vira pele
      if (nuca && msk[i + 2] === 64) {
        // faixa da sobrancelha pintada (menina): vira pele lisa; a sobrancelha nova é desenhada por cima
        d[i] = srgb(nuca[0] * 0.97); d[i + 1] = srgb(nuca[1] * 0.97); d[i + 2] = srgb(nuca[2] * 0.97);
        continue;
      }
      if (nuca && msk[i + 2] === 128) {
        const k = Math.min(1, lum(PARA_LINEAR[src[i]], PARA_LINEAR[src[i + 1]], PARA_LINEAR[src[i + 2]]) / branco) * 0.92;
        d[i] = srgb(nuca[0] * k); d[i + 1] = srgb(nuca[1] * k); d[i + 2] = srgb(nuca[2] * k);
      }
      continue;
    }
    const r = PARA_LINEAR[src[i]], g = PARA_LINEAR[src[i + 1]], b = PARA_LINEAR[src[i + 2]];
    if (regiao === 1) {
      if (!pele) continue;
      // razão canal a canal: a sombra escurece na mesma proporção e o corado/boca mantêm o desvio para o vermelho
      d[i] = srgb(tom(pele[0], r / mPele[0]));
      d[i + 1] = srgb(tom(pele[1], g / mPele[1]));
      d[i + 2] = srgb(tom(pele[2], b / mPele[2]));
    } else if (regiao === 2) {
      if (nuca && msk[i + 2] === 64) { d[i] = srgb(nuca[0] * 0.97); d[i + 1] = srgb(nuca[1] * 0.97); d[i + 2] = srgb(nuca[2] * 0.97); continue; }
      if (!cabelo) continue;
      const k = Math.min(3.2, Math.pow(lum(r, g, b) / lCabelo, 0.9));
      d[i] = srgb(cabelo[0] * k); d[i + 1] = srgb(cabelo[1] * k); d[i + 2] = srgb(cabelo[2] * k);
    } else if (regiao === 3) {
      if (!iris) continue;
      // a máscara marca só o castanho pintado da íris (G = quanto o texel é íris); pupila, cílios, brilho e o branco
      // do olho ficam fora e não mudam. A cor nova segue o claro-escuro da íris original (anel, degradê, contorno).
      const w = msk[i + 1] / 255;
      const k = Math.min(1.6, Math.pow(lum(r, g, b) / lIris, 0.75));
      d[i] = srgb(r + (iris[0] * k - r) * w); d[i + 1] = srgb(g + (iris[1] * k - g) * w); d[i + 2] = srgb(b + (iris[2] * k - b) * w);
    } else {
      const t = roupa[regiao];
      if (!t) continue;
      // multiplicação: o branco vira a cor; o cinza das dobras vira a cor mais escura
      const k = Math.min(1.08, lum(r, g, b) / branco);
      d[i] = srgb(t[0] * k); d[i + 1] = srgb(t[1] * k); d[i + 2] = srgb(t[2] * k);
    }
  }
  return out;
}

/** Texturas recoloridas guardadas (as mesmas cores aparecem no palco e nas miniaturas). */
const texturas = new Map<string, THREE.CanvasTexture>();
const MAX_TEXTURAS = 10;

function texturaRecolorida(chave: string, base: Base, a: Aparencia): THREE.CanvasTexture {
  const k = `${chave}|${a.pele}|${a.olhos}|${a.cabelo}|${a.camisa}|${a.calca}|${a.calcado}|${a.penteado ? 1 : 0}`;
  let t = texturas.get(k);
  if (t) { texturas.delete(k); texturas.set(k, t); return t; }
  const c = document.createElement('canvas');
  c.width = base.cor.width; c.height = base.cor.height;
  c.getContext('2d')!.putImageData(recolorir(base, a), 0, 0);
  t = new THREE.CanvasTexture(c);
  t.flipY = false; // convenção do glTF
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  t.userData.compartilhada = true;
  texturas.set(k, t);
  if (texturas.size > MAX_TEXTURAS) {
    const [velha, tex] = texturas.entries().next().value!;
    texturas.delete(velha);
    tex.dispose(); // se ainda estiver em uso, a placa recebe de novo no próximo desenho
  }
  return t;
}

export interface BonecoGlb {
  grupo: THREE.Group;
  /** Âncoras já no espaço da cena (metros, pés no chão, frente +Z). */
  olhos: { centro: THREE.Vector3; raioIris: number; raioOlho: number }[];
  cabeca: THREE.Vector3;
  /** Crânio (só quando o penteado é peça separada). */
  cranio: Cranio | null;
}

/** Cor do cabelo de cada modelo, para a peça de cabelo combinar quando a criança não escolheu cor. */
const COR_PADRAO_CABELO = { f: '#3A2A20', m: '#2E221C' } as const;

/** Monta o boneco de verdade com as cores escolhidas, ou `null` se o modelo não existe / não carregou. */
export async function criarBonecoGlb(a: Aparencia): Promise<BonecoGlb | null> {
  let chave = a.modelo;
  let base = await carregarBase(chave);
  if (!base && chave !== modeloPadrao(a.sexo)) { chave = modeloPadrao(a.sexo); base = await carregarBase(chave); }
  if (!base) return null;
  const tirarCabelo = !!a.penteado;
  const mapa = texturaRecolorida(chave, base, a);
  const original = (base.malhas[0].material as THREE.MeshStandardMaterial).map;
  if (original) { mapa.offset.copy(original.offset); mapa.repeat.copy(original.repeat); mapa.rotation = original.rotation; mapa.channel = original.channel; }
  const grupo = new THREE.Group();
  grupo.name = `avatar-${chave}`;
  const interno = new THREE.Group();
  interno.applyMatrix4(base.matriz);
  const olhoY = base.info.olhos.reduce((s, o) => s + new THREE.Vector3(...o.centro).applyMatrix4(base.matriz).y, 0) / base.info.olhos.length;
  let cranio: Cranio | null = null;
  let pescoco: Pescoco | null = null;
  for (const m of base.malhas) {
    const t = base.matriz.clone().multiply(m.matrixWorld);
    const rente = tirarCabelo ? cabeloRente(m.geometry, base.mascara, original, t, olhoY) : null;
    if (rente) { cranio = rente.cranio; pescoco = rente.pescoco; }
    const copia = new THREE.Mesh(rente ? rente.geometria : m.geometry, undefined);
    copia.applyMatrix4(m.matrixWorld);
    const mat = (m.material as THREE.MeshStandardMaterial).clone();
    mat.map = mapa;
    mat.metalness = 0; mat.metalnessMap = null; // personagem não é metal; evita preto sem mapa de ambiente
    mat.roughness = 1;
    mat.userData.pintado = true;
    copia.material = mat;
    copia.castShadow = true;
    copia.userData.compartilhado = true; // geometria e texturas do modelo são de todos os bonecos
    interno.add(copia);
  }
  grupo.add(interno);
  const escala = ALTURA_BONECO / (base.info.caixa.max[1] - base.info.caixa.min[1]);
  const ponto = (p: [number, number, number]) => new THREE.Vector3(p[0], p[1], p[2]).applyMatrix4(base.matriz);
  const olhos = base.info.olhos.map((o) => ({ centro: ponto(o.centro), raioIris: o.raioIris * escala, raioOlho: o.raioOlho * escala })).sort((x, y) => x.centro.x - y.centro.x);
  const boneco: BonecoGlb = { grupo, olhos, cabeca: ponto(base.info.cabeca.centro), cranio };
  if (a.penteado && cranio) {
    const peca = criarPenteado(a.penteado, { sexo: a.sexo, cranio, olhos, cor: a.cabelo ?? COR_PADRAO_CABELO[a.sexo] });
    if (peca) grupo.add(peca);
    if (base.info.sobrancelhaDesenhada) grupo.add(sobrancelhas(interno, olhos, a.cabelo ?? COR_PADRAO_CABELO[a.sexo]));
    if (pescoco && pescoco.rx > 0.02) {
      // colarinho de pele atrás do pescoço (meia volta, um tico maior que o pescoço)
      const cor = a.pele ? new THREE.Color(a.pele) : new THREE.Color().setRGB(...linearDeMedia(base.info.medias.pele), THREE.LinearSRGBColorSpace);
      const geo = new THREE.CylinderGeometry(1, 1.08, pescoco.y1 - pescoco.y0 + 0.03, 32, 1, true, Math.PI * 0.55, Math.PI * 0.9);
      const pele = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: cor.multiplyScalar(0.93), roughness: 0.75 }));
      pele.name = 'nuca';
      pele.scale.set(pescoco.rx * 1.12, 1, pescoco.rz * 1.05);
      pele.position.set(pescoco.x, (pescoco.y0 + pescoco.y1) / 2 - 0.005, pescoco.z);
      grupo.add(pele);
    }
  }
  return boneco;
}

/** Sobrancelhas novas (arcos finos) coladas na testa, acima de cada olho, na cor do cabelo. */
function sobrancelhas(rosto: THREE.Object3D, olhos: BonecoGlb['olhos'], cor: string): THREE.Group {
  const g = new THREE.Group();
  g.name = 'sobrancelhas';
  const mat = new THREE.MeshStandardMaterial({ color: new THREE.Color(cor).multiplyScalar(0.8), roughness: 0.7 });
  rosto.updateMatrixWorld(true);
  const raio = new THREE.Raycaster();
  for (const o of olhos) {
    const lado = Math.sign(o.centro.x) || 1;
    const pts: THREE.Vector3[] = [];
    for (let k = 0; k <= 8; k++) {
      const t = k / 8 - 0.5; // -0,5 (perto do nariz) … 0,5 (fora)
      const x = o.centro.x + lado * t * o.raioOlho * 2.3;
      const y = o.centro.y + o.raioOlho * (1.75 + 0.35 * Math.cos(t * Math.PI * 1.1) - 0.1 * t);
      raio.set(new THREE.Vector3(x, y, 2), new THREE.Vector3(0, 0, -1));
      const toque = raio.intersectObject(rosto, true)[0];
      if (!toque) continue;
      const n = toque.face ? toque.face.normal.clone().transformDirection(toque.object.matrixWorld) : new THREE.Vector3(0, 0, 1);
      pts.push(toque.point.clone().addScaledVector(n, 0.002));
    }
    if (pts.length < 4) continue;
    const curva = new THREE.CatmullRomCurve3(pts);
    const geo = new THREE.TubeGeometry(curva, 24, 0.0042, 6);
    // afina nas pontas
    const p = geo.getAttribute('position');
    const v = new THREE.Vector3(), c = new THREE.Vector3();
    for (let i = 0; i < p.count; i++) {
      const anel = Math.floor(i / 7), t = anel / 24;
      curva.getPointAt(Math.min(1, t), c);
      v.fromBufferAttribute(p, i).sub(c).multiplyScalar(0.45 + 0.75 * Math.sin(Math.PI * Math.min(1, Math.max(0, t * 0.9 + 0.08)))).add(c);
      p.setXYZ(i, v.x, v.y, v.z);
    }
    geo.computeVertexNormals();
    g.add(new THREE.Mesh(geo, mat));
  }
  return g;
}

/* ------------------------------------------------------------------ acessibilidade sobre o modelo */

const matSimples = (hex: string, roughness: number, metalness = 0) => new THREE.MeshStandardMaterial({ color: new THREE.Color(hex), roughness, metalness });

/** Ponto da superfície do boneco visto de frente, em (x, y): onde encostar óculos e pintura. */
function naFrente(b: BonecoGlb, x: number, y: number): { ponto: THREE.Vector3; normal: THREE.Vector3 } | null {
  b.grupo.updateMatrixWorld(true);
  const raio = new THREE.Raycaster(new THREE.Vector3(x, y, 2), new THREE.Vector3(0, 0, -1));
  const toque = raio.intersectObject(b.grupo, true)[0];
  if (!toque) return null;
  const normal = toque.face ? toque.face.normal.clone().transformDirection(toque.object.matrixWorld) : new THREE.Vector3(0, 0, 1);
  return { ponto: toque.point, normal };
}

/** Óculos (armação azul-marinho, lentes quase invisíveis) apoiados nos olhos do modelo. */
function oculos(b: BonecoGlb): THREE.Group {
  const g = new THREE.Group();
  g.name = 'acessibilidade-oculos';
  const mat = matSimples('#22407A', 0.35, 0.1);
  const lente = new THREE.MeshPhysicalMaterial({ color: 0xffffff, transparent: true, opacity: 0.14, roughness: 0.05, depthWrite: false });
  const [e, d] = b.olhos;
  const raio = Math.max(e.raioOlho, d.raioOlho) * 1.28;
  const frente = Math.max(naFrente(b, e.centro.x, e.centro.y)?.ponto.z ?? e.centro.z, naFrente(b, d.centro.x, d.centro.y)?.ponto.z ?? d.centro.z, naFrente(b, 0, e.centro.y)?.ponto.z ?? 0) + 0.012;
  const centros = [e, d].map((o) => new THREE.Vector3(o.centro.x, o.centro.y, frente));
  // aros não se sobrepõem: se os olhos são juntos, o aro encolhe
  const r = Math.min(raio, (centros[1].x - centros[0].x) / 2 - 0.004);
  centros.forEach((c, i) => {
    const lado = i === 0 ? -1 : 1;
    const aro = new THREE.Mesh(new THREE.TorusGeometry(r, 0.0052, 10, 44), mat);
    aro.position.copy(c);
    aro.rotation.y = lado * 0.12;
    const l = new THREE.Mesh(new THREE.CircleGeometry(r, 36), lente);
    l.position.copy(c);
    l.rotation.y = lado * 0.12;
    g.add(aro, l);
    // haste: do aro até a lateral da cabeça, um pouco para trás
    const ini = new THREE.Vector3(c.x + lado * r, c.y + 0.004, c.z - 0.004);
    const lateral = Math.abs(c.x) + r + 0.03;
    const fim = new THREE.Vector3(lado * lateral, c.y + 0.006, b.cabeca.z - 0.01);
    const meio = new THREE.Vector3(lado * (lateral + 0.004), c.y + 0.006, (ini.z + fim.z) / 2 + 0.02);
    g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([ini, meio, fim]), 16, 0.0042, 8), mat));
  });
  const ponte = new THREE.CatmullRomCurve3([new THREE.Vector3(centros[0].x + r, centros[0].y + 0.004, frente), new THREE.Vector3(0, centros[0].y + 0.01, frente + 0.006), new THREE.Vector3(centros[1].x - r, centros[1].y + 0.004, frente)]);
  g.add(new THREE.Mesh(new THREE.TubeGeometry(ponte, 10, 0.0048, 8), mat));
  g.traverse((o) => { o.castShadow = false; });
  return g;
}

/** Pintura no rosto: dois traços finos em cada bochecha, colados na pele. */
function pintura(b: BonecoGlb): THREE.Group {
  const g = new THREE.Group();
  g.name = 'acessibilidade-pintura-no-rosto';
  const mat = new THREE.MeshStandardMaterial({ color: 0xb5432a, roughness: 0.9 });
  for (const o of b.olhos) {
    const lado = Math.sign(o.centro.x) || 1;
    for (const desce of [1.55, 2.05]) {
      const pts: THREE.Vector3[] = [];
      for (let i = 0; i <= 5; i++) {
        const t = naFrente(b, o.centro.x + lado * o.raioOlho * (0.1 + 0.26 * i), o.centro.y - o.raioOlho * desce);
        if (t) pts.push(t.ponto.clone().addScaledVector(t.normal, 0.0015));
      }
      if (pts.length >= 3) g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 14, 0.0042, 6), mat));
    }
  }
  return g;
}

export function acessorioNoModelo(id: string, b: BonecoGlb): THREE.Group | null {
  if (b.olhos.length < 2) return null;
  if (id === 'oculos') return oculos(b);
  if (id === 'pintura-no-rosto') return pintura(b);
  return null; // cadeira de rodas e aparelho auditivo: dependem de modelo próprio (ver catálogo)
}
