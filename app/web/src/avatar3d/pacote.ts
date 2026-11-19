/**
 * PACOTES DE BONECO para o passeio em 3ª pessoa (public/mundo3d/passeio.html, em iframe).
 *
 * O mundo 3D roda numa página própria, com o three.js dele. Para a criança andar com O PRÓPRIO boneco (mesmas cores,
 * cabelo e roupa da Lojinha), o app monta o boneco aqui, com o mesmo código do resto do app (avatarGlb.ts: modelo +
 * recoloração por máscaras), e manda só os DADOS pelo postMessage: posições, normais, UVs, índices e a textura
 * (ImageBitmap). Tudo em metros, pés em y = 0, de frente para +Z. A página monta as malhas com o three.js dela.
 * Também servem a Sofia, o Tales, o Bolota (GLB próprios) e as crianças da vila (o avatar padrão recolorido).
 */
import * as THREE from 'three';
import { criarBonecoGlb, acessorioNoModelo } from './avatarGlb.ts';
import { lerGLB } from '../componentes/glb-comum.ts';
import { ALTURA_BONECO, type Aparencia } from './modelo.ts';

export interface PacoteMalha {
  pos: Float32Array;
  nor?: Float32Array;
  uv?: Float32Array;
  idx?: Uint32Array;
  mapa?: ImageBitmap;
  /** cor do material (hex sRGB) */
  cor: string;
  rugosidade: number;
  opacidade: number;
  /** 'cabelo' = peça de penteado (cabelos.ts): no passeio ganha osso próprio com balanço (fila nº 28). */
  parte?: 'cabelo';
}
export interface Pacote { malhas: PacoteMalha[]; altura: number }

const _n = new THREE.Matrix3();
const _v = new THREE.Vector3();

/** Copia um atributo (quantizado, normalizado ou intercalado) para Float32, aplicando a matriz. */
function copiar(a: THREE.BufferAttribute | THREE.InterleavedBufferAttribute, m?: THREE.Matrix4, normal = false): Float32Array {
  const out = new Float32Array(a.count * a.itemSize);
  for (let i = 0; i < a.count; i++) {
    if (a.itemSize === 3 && m) {
      _v.fromBufferAttribute(a, i);
      if (normal) _v.applyMatrix3(_n).normalize(); else _v.applyMatrix4(m);
      out[i * 3] = _v.x; out[i * 3 + 1] = _v.y; out[i * 3 + 2] = _v.z;
    } else for (let k = 0; k < a.itemSize; k++) out[i * a.itemSize + k] = a.getComponent(i, k);
  }
  return out;
}

async function imagemDe(t: THREE.Texture | null | undefined): Promise<ImageBitmap | undefined> {
  const img = t?.image as CanvasImageSource | undefined;
  if (!img) return undefined;
  try { return await createImageBitmap(img); } catch { return undefined; }
}

/** A malha faz parte de uma peça de penteado (grupo `penteado-…`, cabelos.ts)? */
function ehCabelo(o: THREE.Object3D): boolean { for (let p: THREE.Object3D | null = o; p; p = p.parent) if (p.name.startsWith('penteado-')) return true; return false; }

/** Todas as malhas de `raiz` (com as matrizes já aplicadas) num pacote. */
async function empacotar(raiz: THREE.Object3D, altura: number): Promise<Pacote> {
  raiz.updateMatrixWorld(true);
  const malhas: PacoteMalha[] = [];
  const meshes: THREE.Mesh[] = [];
  raiz.traverse((o) => { if ((o as THREE.Mesh).isMesh) meshes.push(o as THREE.Mesh); });
  for (const me of meshes) {
    const g = me.geometry as THREE.BufferGeometry;
    const mat = (Array.isArray(me.material) ? me.material[0] : me.material) as THREE.MeshStandardMaterial;
    _n.getNormalMatrix(me.matrixWorld);
    const p = g.getAttribute('position'), n = g.getAttribute('normal'), uv = g.getAttribute('uv');
    malhas.push({
      pos: copiar(p, me.matrixWorld),
      nor: n ? copiar(n, me.matrixWorld, true) : undefined,
      uv: uv ? copiar(uv) : undefined,
      idx: g.index ? Uint32Array.from(g.index.array as ArrayLike<number>) : undefined,
      mapa: await imagemDe(mat.map),
      cor: `#${(mat.color ?? new THREE.Color(0xffffff)).getHexString()}`,
      rugosidade: mat.roughness ?? 0.9,
      opacidade: mat.transparent ? mat.opacity : 1,
      ...(ehCabelo(me) ? { parte: 'cabelo' as const } : {})
    });
  }
  return { malhas, altura };
}

/** Itens que podem ir no postMessage como transferência (sem cópia). */
export function transferiveis(p: Pacote): Transferable[] {
  const t: Transferable[] = [];
  for (const m of p.malhas) {
    t.push(m.pos.buffer as ArrayBuffer);
    if (m.nor) t.push(m.nor.buffer as ArrayBuffer);
    if (m.uv) t.push(m.uv.buffer as ArrayBuffer);
    if (m.idx) t.push(m.idx.buffer as ArrayBuffer);
    if (m.mapa) t.push(m.mapa);
  }
  return t;
}

/** O boneco da criança (ou de uma criança da vila), com as cores e os acessórios escolhidos. */
export async function pacoteDoBoneco(a: Aparencia): Promise<Pacote | null> {
  const b = await criarBonecoGlb(a);
  if (!b) return null;
  for (const id of a.acessibilidade) { const ac = acessorioNoModelo(id, b); if (ac) b.grupo.add(ac); }
  return empacotar(b.grupo, ALTURA_BONECO);
}

/**
 * Personagem de GLB próprio (Sofia, Tales, Bolota). Os modelos vêm de frente para +X; `giro` (radianos) os vira
 * para +Z. A altura do arquivo vira 1 unidade (o passeio escala para a altura do personagem).
 */
export async function pacoteDoModelo(url: string, giro = -Math.PI / 2): Promise<Pacote | null> {
  const gltf = await lerGLB(url, '[passeio]');
  if (!gltf) return null;
  const copia = gltf.scene.clone(true);
  const raiz = new THREE.Group();
  raiz.add(copia);
  copia.rotation.y = giro;
  raiz.updateMatrixWorld(true);
  const caixa = new THREE.Box3().setFromObject(copia);
  const alt = caixa.max.y - caixa.min.y || 1;
  copia.position.set(-(caixa.min.x + caixa.max.x) / 2, -caixa.min.y, -(caixa.min.z + caixa.max.z) / 2);
  const s = 1 / alt;
  const norm = new THREE.Group();
  norm.scale.setScalar(s);
  norm.add(raiz);
  return empacotar(norm, 1);
}
