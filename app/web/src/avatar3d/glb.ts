/**
 * CARREGADOR DE PEÇAS PRONTAS (GLB) — contrato em app/docs/avatar-3d-contrato.md.
 *
 * O manifesto (public/assets/avatar3d/manifesto.json) diz quais peças já têm modelo pronto. Peça sem entrada no
 * manifesto usa o modelo provisório feito em código (procedural.ts). Trocar é só soltar o .glb na pasta e
 * registrar a peça no manifesto: nenhuma tela muda.
 */
import * as THREE from 'three';
import { esquecerGLB, lerGLB as lerGLBComum } from '../componentes/glb-comum.ts';
import { clone as clonarComEsqueleto } from 'three/examples/jsm/utils/SkeletonUtils.js';

export const PASTA_AVATAR3D = './assets/avatar3d/';

export interface EntradaManifesto {
  /** Arquivo .glb dentro da pasta avatar3d. */
  arquivo: string;
  /** Variante sentada (cadeira de rodas) para corpo, calça e calçado. */
  sentado?: string;
}
export interface ManifestoAvatar3D {
  versao: 1;
  pecas: Record<string, EntradaManifesto>;
}

const VAZIO: ManifestoAvatar3D = { versao: 1, pecas: {} };
let manifesto: Promise<ManifestoAvatar3D> | null = null;

/** Lê o manifesto uma vez. Qualquer falha (arquivo ausente, JSON inválido) = nenhuma peça pronta, tudo provisório. */
export function carregarManifesto(): Promise<ManifestoAvatar3D> {
  manifesto ??= fetch(`${PASTA_AVATAR3D}manifesto.json`, { cache: 'no-cache' })
    .then(async (r) => {
      if (!r.ok) return VAZIO;
      const j = (await r.json()) as Partial<ManifestoAvatar3D>;
      return j && typeof j.pecas === 'object' && j.pecas ? { versao: 1 as const, pecas: j.pecas } : VAZIO;
    })
    .catch(() => VAZIO);
  return manifesto;
}
/** Só para testes: esquece o manifesto e os modelos já lidos. */
export function esquecerManifesto() { manifesto = null; esquecerGLB(); }

/** Leitura pelo carregador compartilhado do app (componentes/glb-comum.ts): o mesmo dos prêmios em 360°. */
const lerGLB = (arquivo: string) => lerGLBComum(PASTA_AVATAR3D + arquivo, '[avatar3d]');

/** Cores que o app aplica nos materiais do GLB, pelo NOME do material (contrato). */
export interface CoresPeca {
  pele?: string;
  cabelo?: string;
  sobrancelha?: string;
  iris?: string;
  tecido?: string;
  tecido2?: string;
}

/**
 * Devolve a peça pronta (uma cópia, já colorida) ou `null` se ela não está no manifesto / não carregou.
 * As geometrias e texturas são compartilhadas entre as cópias (não descartar: `userData.compartilhado`).
 */
export async function pecaPronta(chave: string, cores: CoresPeca, sentado = false): Promise<THREE.Object3D | null> {
  const m = await carregarManifesto();
  const e = m.pecas[chave];
  if (!e) return null;
  const gltf = await lerGLB(sentado && e.sentado ? e.sentado : e.arquivo);
  if (!gltf) return null;
  const obj = clonarComEsqueleto(gltf.scene);
  obj.name = chave;
  obj.traverse((o) => {
    const malha = o as THREE.Mesh;
    if (!malha.isMesh) return;
    malha.castShadow = true;
    malha.userData.compartilhado = true;
    const pintar = (mat: THREE.Material): THREE.Material => {
      const hex = cores[mat.name as keyof CoresPeca];
      if (!hex) return mat;
      const c = mat.clone() as THREE.MeshStandardMaterial;
      c.color?.set(hex);
      c.userData.pintado = true;
      return c;
    };
    malha.material = Array.isArray(malha.material) ? malha.material.map(pintar) : pintar(malha.material);
  });
  return obj;
}

/** Procura na peça a animação de piscar (morph target "piscar") — opcional no contrato. */
export function piscarDoGLB(obj: THREE.Object3D): ((v: number) => void) | null {
  const alvos: { malha: THREE.Mesh; i: number }[] = [];
  obj.traverse((o) => {
    const malha = o as THREE.Mesh;
    const i = malha.morphTargetDictionary?.piscar;
    if (malha.isMesh && i !== undefined && malha.morphTargetInfluences) alvos.push({ malha, i });
  });
  if (!alvos.length) return null;
  return (v) => { for (const a of alvos) a.malha.morphTargetInfluences![a.i] = v; };
}
