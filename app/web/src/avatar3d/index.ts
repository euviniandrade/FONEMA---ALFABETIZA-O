/**
 * Porta de entrada do avatar 3D para as telas. Não importa three.js direto: o motor é baixado sob demanda.
 * - `carregarMotor()`: módulo com o Palco (giro 360°) e o desenhista de miniaturas.
 * - `miniatura()`: imagem do boneco (data URL) com cache em memória e, para os bustos, no aparelho.
 * - `temWebGL()`: se o aparelho não tem WebGL, as telas usam a reserva 2D (Boneco2D).
 */
import { chaveAparencia, type Aparencia } from './modelo.ts';

export * from './modelo.ts';
export type { Palco, Enquadramento } from './motor3d.ts';

let motor: Promise<typeof import('./motor3d.ts')> | null = null;
export const carregarMotor = () => (motor ??= import('./motor3d.ts'));

let webgl: boolean | null = null;
export function temWebGL(): boolean {
  if (webgl === null) {
    try {
      const c = document.createElement('canvas');
      const gl = c.getContext('webgl2') ?? c.getContext('webgl');
      webgl = !!gl;
      (gl as WebGLRenderingContext | null)?.getExtension('WEBGL_lose_context')?.loseContext();
    } catch { webgl = false; }
  }
  return webgl;
}

const CHAVE_CACHE = 'fonema-avatar-mini-v1';
const MAX_NO_APARELHO = 14;
const memoria = new Map<string, Promise<string | null>>();

function lerCache(): Record<string, string> {
  try { return JSON.parse(localStorage.getItem(CHAVE_CACHE) || '{}') as Record<string, string>; } catch { return {}; }
}
function guardarCache(chave: string, url: string) {
  try {
    const c = lerCache();
    delete c[chave];
    c[chave] = url;
    const chaves = Object.keys(c);
    for (const k of chaves.slice(0, Math.max(0, chaves.length - MAX_NO_APARELHO))) delete c[k];
    localStorage.setItem(CHAVE_CACHE, JSON.stringify(c));
  } catch { /* sem espaço ou sem armazenamento: fica só na memória */ }
}

/** Se a miniatura já está guardada no aparelho, devolve na hora (sem esperar o motor 3D). */
export function miniaturaGuardada(a: Aparencia, tipo: 'busto' | 'corpo' = 'busto'): string | undefined {
  return tipo === 'busto' ? lerCache()[`busto|${chaveAparencia(a)}`] : undefined;
}

/**
 * Imagem do boneco. `null` = este aparelho não consegue desenhar em 3D (a tela usa a reserva 2D).
 * Bustos (cartões, topo, mapa) ficam guardados no aparelho; as outras, só na memória da sessão.
 */
export function miniatura(a: Aparencia, tipo: 'busto' | 'corpo' = 'busto', largura = 256, altura = tipo === 'busto' ? 256 : Math.round(largura * 1.45), guardar = tipo === 'busto' && largura === 256): Promise<string | null> {
  const chave = `${tipo}|${chaveAparencia(a)}`;
  const chaveMem = `${chave}|${largura}x${altura}`;
  let p = memoria.get(chaveMem);
  if (!p) {
    const salva = guardar ? lerCache()[chave] : undefined;
    p = salva ? Promise.resolve(salva) : !temWebGL() ? Promise.resolve(null) : carregarMotor()
      .then((m) => m.desenharMiniatura(a, tipo, largura, altura))
      .then((url) => { if (guardar) guardarCache(chave, url); return url; })
      .catch((e) => { console.warn('[avatar3d] miniatura falhou; uso a reserva 2D.', e); return null; });
    memoria.set(chaveMem, p);
    if (memoria.size > 160) memoria.delete(memoria.keys().next().value!);
  }
  return p;
}
