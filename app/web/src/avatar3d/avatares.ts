/**
 * Manifesto dos avatares 3D (public/assets/modelos3d/avatares.json, gerado por app/ferramentas/avatar-mascaras.py).
 * Diz quais modelos existem (padrão de menino e de menina, e as variações de cabelo que já chegaram) e traz, de cada
 * um, as médias de cor de cada região e as âncoras (olhos, cabeça, frente) que o app usa para recolorir e encaixar
 * óculos e pintura. Não importa three.js.
 */
export const PASTA_MODELOS3D = './assets/modelos3d/';

export interface InfoAvatar {
  arquivo: string;
  cor: string;
  mascara: string;
  /** Média de cor (0–255) de cada região na textura original; `roupa` é o branco de referência. */
  medias: { pele: [number, number, number]; cabelo: [number, number, number]; iris: [number, number, number]; roupa: [number, number, number] };
  /** Direção do rosto no plano XZ do arquivo. */
  frente: [number, number];
  caixa: { min: [number, number, number]; max: [number, number, number] };
  olhos: { centro: [number, number, number]; raioIris: number; raioOlho: number }[];
  cabeca: { centro: [number, number, number] };
  /** Com outro penteado, a sobrancelha pintada sai e o app desenha uma nova (a da menina fica em parte debaixo da franja). */
  sobrancelhaDesenhada?: boolean;
}
export interface ManifestoAvatares { versao: 1; modelos: Record<string, InfoAvatar> }

const VAZIO: ManifestoAvatares = { versao: 1, modelos: {} };
let manifesto: Promise<ManifestoAvatares> | null = null;

/** Lê o manifesto uma vez. Qualquer falha = nenhum modelo pronto (o app usa a reserva). */
export function carregarAvatares(): Promise<ManifestoAvatares> {
  manifesto ??= fetch(`${PASTA_MODELOS3D}avatares.json`, { cache: 'no-cache' })
    .then(async (r) => {
      if (!r.ok) return VAZIO;
      const j = (await r.json()) as Partial<ManifestoAvatares>;
      return j && typeof j.modelos === 'object' && j.modelos ? { versao: 1 as const, modelos: j.modelos } : VAZIO;
    })
    .catch(() => VAZIO);
  return manifesto;
}

/** Chaves dos modelos que existem de verdade (para a tela mostrar só os tipos de cabelo que já têm arquivo). */
export const modelosExistentes = (): Promise<Set<string>> => carregarAvatares().then((m) => new Set(Object.keys(m.modelos)));
