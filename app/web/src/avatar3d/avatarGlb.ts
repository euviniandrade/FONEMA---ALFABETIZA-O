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
export function recolorir(base: Pick<Base, 'cor' | 'mascara' | 'info'>, a: Pick<Aparencia, 'pele' | 'olhos' | 'cabelo' | 'camisa' | 'calca' | 'calcado'>): ImageData {
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
  for (let i = 0; i < d.length; i += 4) {
    const regiao = msk[i];
    if (regiao === 0) continue;
    const r = PARA_LINEAR[src[i]], g = PARA_LINEAR[src[i + 1]], b = PARA_LINEAR[src[i + 2]];
    if (regiao === 1) {
      if (!pele) continue;
      // razão canal a canal: a sombra escurece na mesma proporção e o corado/boca mantêm o desvio para o vermelho
      d[i] = srgb(tom(pele[0], r / mPele[0]));
      d[i + 1] = srgb(tom(pele[1], g / mPele[1]));
      d[i + 2] = srgb(tom(pele[2], b / mPele[2]));
    } else if (regiao === 2) {
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
  const k = `${chave}|${a.pele}|${a.olhos}|${a.cabelo}|${a.camisa}|${a.calca}|${a.calcado}`;
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
}

/** Monta o boneco de verdade com as cores escolhidas, ou `null` se o modelo não existe / não carregou. */
export async function criarBonecoGlb(a: Aparencia): Promise<BonecoGlb | null> {
  let chave = a.modelo;
  let base = await carregarBase(chave);
  if (!base && chave !== modeloPadrao(a.sexo)) { chave = modeloPadrao(a.sexo); base = await carregarBase(chave); }
  if (!base) return null;
  const mapa = texturaRecolorida(chave, base, a);
  const original = (base.malhas[0].material as THREE.MeshStandardMaterial).map;
  if (original) { mapa.offset.copy(original.offset); mapa.repeat.copy(original.repeat); mapa.rotation = original.rotation; mapa.channel = original.channel; }
  const grupo = new THREE.Group();
  grupo.name = `avatar-${chave}`;
  const interno = new THREE.Group();
  interno.applyMatrix4(base.matriz);
  for (const m of base.malhas) {
    const copia = new THREE.Mesh(m.geometry, undefined);
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
  return { grupo, olhos, cabeca: ponto(base.info.cabeca.centro) };
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
