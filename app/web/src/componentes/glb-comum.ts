/**
 * Carregador de GLB COMPARTILHADO (um só para o app): boneco do avatar (avatar3d/glb.ts) e prêmios em 360°
 * (componentes/premio3d.ts) usam o mesmo GLTFLoader, com malha comprimida em meshopt e textura WebP,
 * e o mesmo cache por endereço (cada arquivo é baixado e decodificado uma vez).
 *
 * Só é importado por módulos carregados sob demanda: three.js não entra na página de entrada do app.
 */
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';

let loader: GLTFLoader | null = null;
const lidos = new Map<string, Promise<GLTF | null>>();

/** Lê um GLB (com cache). Falha de rede ou de arquivo devolve `null`: quem chama mostra a reserva. */
export function lerGLB(url: string, aviso = '[glb]'): Promise<GLTF | null> {
  let p = lidos.get(url);
  if (!p) {
    loader ??= new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
    p = loader.loadAsync(url).catch((e) => {
      console.warn(`${aviso} não consegui ler ${url}; uso a reserva.`, e);
      lidos.delete(url);
      return null;
    });
    lidos.set(url, p);
  }
  return p;
}

/** Só para testes: esquece os modelos já lidos. */
export function esquecerGLB() { lidos.clear(); }
