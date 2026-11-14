/**
 * TRAÇADO DAS LETRAS (D029 §4): ordem e direção de cada traço, como DADOS.
 *
 * Letra bastão (imprensa), a usada no começo da alfabetização no Brasil. Cada letra é uma lista de traços NA ORDEM
 * em que a mão faz; cada traço é um caminho SVG (`d`) desenhado no SENTIDO do movimento, num quadro de 100 × 100:
 *   maiúsculas  topo y = 15 · base y = 85
 *   minúsculas  topo das altas (b, d, f, h, k, l, t) y = 7 · topo das baixas y = 37 · base y = 67 · perna (g, j, p, q, y) até y = 92
 *               (no arquivo estão escritas 5 unidades abaixo e sobem no fim: veja SOBE)
 * A tela (web/src/mecanicas/Tracar.tsx) desenha a própria letra a partir destes caminhos (por isso as setas, os
 * números e o ponto de início caem sempre em cima da letra), anima a demonstração e confere o traço da criança.
 *
 * Para mudar a ordem ou o desenho de uma letra, edite só aqui. Regras gerais seguidas: de cima para baixo, da
 * esquerda para a direita; primeiro a haste, depois a barriga; bolinhas no sentido anti-horário, começando em cima;
 * o pingo do i e do j por último.
 *
 * ⚠️ A ordem dos traços varia um pouco entre materiais didáticos: validar com a pedagoga/professora (D020).
 */
export interface TracoLetra {
  /** Caminho SVG no sentido do movimento (só M, L e Q). */
  d: string;
  /** Traço de um toque só (pingo do i e do j). */
  ponto?: boolean;
}

const t = (d: string): TracoLetra => ({ d });
const pingo = (x: number, y: number): TracoLetra => ({ d: `M${x},${y - 1} L${x},${y + 1}`, ponto: true });

// pedaços que se repetem nas minúsculas
const BOLA_ESQ = 'M66,52 Q62,42 50,42 Q32,42 32,57 Q32,72 50,72 Q62,72 66,62'; // bolinha do a, d, g, q (anti-horário, começa em cima à direita)
const BOLA_DIR = 'M34,52 Q38,42 50,42 Q68,42 68,57 Q68,72 50,72 Q38,72 34,62'; // barriga do b e do p (sai da haste)
const ARCO = 'M34,54 Q40,42 52,42 Q66,42 66,56 L66,72'; // ombro do h e do n

export const TRACOS: Record<string, TracoLetra[]> = {
  // ------------------------------------------------------------------ maiúsculas
  A: [t('M50,15 L22,85'), t('M50,15 L78,85'), t('M33,60 L67,60')],
  B: [t('M28,15 L28,85'), t('M28,15 L48,15 Q70,15 70,32 Q70,50 48,50 L28,50'), t('M28,50 L52,50 Q76,50 76,67 Q76,85 52,85 L28,85')],
  C: [t('M74,28 Q64,15 49,15 Q22,15 22,50 Q22,85 49,85 Q64,85 74,72')],
  D: [t('M28,15 L28,85'), t('M28,15 L44,15 Q76,15 76,50 Q76,85 44,85 L28,85')],
  E: [t('M30,15 L30,85'), t('M30,15 L72,15'), t('M30,50 L64,50'), t('M30,85 L72,85')],
  F: [t('M30,15 L30,85'), t('M30,15 L72,15'), t('M30,50 L64,50')],
  G: [t('M74,28 Q64,15 49,15 Q22,15 22,50 Q22,85 49,85 Q76,85 76,56'), t('M54,56 L76,56')],
  H: [t('M26,15 L26,85'), t('M74,15 L74,85'), t('M26,50 L74,50')],
  I: [t('M50,15 L50,85')],
  J: [t('M62,15 L62,64 Q62,85 44,85 Q29,85 26,68')],
  K: [t('M28,15 L28,85'), t('M72,15 L28,54'), t('M41,43 L74,85')],
  L: [t('M30,15 L30,85 L72,85')],
  M: [t('M20,15 L20,85'), t('M20,15 L50,62 L80,15'), t('M80,15 L80,85')],
  N: [t('M26,15 L26,85'), t('M26,15 L74,85'), t('M74,15 L74,85')],
  O: [t('M50,15 Q22,15 22,50 Q22,85 50,85 Q78,85 78,50 Q78,15 50,15')],
  P: [t('M28,15 L28,85'), t('M28,15 L50,15 Q74,15 74,34 Q74,53 50,53 L28,53')],
  Q: [t('M50,15 Q22,15 22,50 Q22,85 50,85 Q78,85 78,50 Q78,15 50,15'), t('M58,66 L82,92')],
  R: [t('M28,15 L28,85'), t('M28,15 L50,15 Q74,15 74,33 Q74,51 50,51 L28,51'), t('M46,51 L76,85')],
  S: [t('M72,27 Q63,15 49,15 Q26,15 26,32 Q26,46 50,50 Q76,54 76,69 Q76,85 50,85 Q34,85 24,72')],
  T: [t('M50,15 L50,85'), t('M22,15 L78,15')],
  U: [t('M26,15 L26,60 Q26,85 50,85 Q74,85 74,60 L74,15')],
  V: [t('M22,15 L50,85 L78,15')],
  W: [t('M12,15 L31,85 L50,32 L69,85 L88,15')],
  X: [t('M24,15 L76,85'), t('M76,15 L24,85')],
  Y: [t('M22,15 L50,50'), t('M78,15 L50,50 L50,85')],
  Z: [t('M24,15 L76,15 L24,85 L76,85')],
  // ------------------------------------------------------------------ minúsculas
  a: [t(BOLA_ESQ), t('M66,42 L66,72')],
  b: [t('M34,12 L34,72'), t(BOLA_DIR)],
  c: [t('M66,49 Q60,42 50,42 Q32,42 32,57 Q32,72 50,72 Q60,72 66,65')],
  d: [t(BOLA_ESQ), t('M66,12 L66,72')],
  e: [t('M33,57 L67,57 Q67,42 50,42 Q32,42 32,57 Q32,72 50,72 Q60,72 66,65')],
  f: [t('M64,19 Q60,12 53,12 Q44,12 44,24 L44,72'), t('M32,42 L58,42')],
  g: [t(BOLA_ESQ), t('M66,42 L66,84 Q66,97 50,97 Q40,97 34,90')],
  h: [t('M34,12 L34,72'), t(ARCO)],
  i: [t('M50,42 L50,72'), pingo(50, 28)],
  j: [t('M54,42 L54,84 Q54,97 42,97 Q36,97 31,92'), pingo(54, 28)],
  k: [t('M36,12 L36,72'), t('M64,42 L36,60'), t('M46,54 L66,72')],
  l: [t('M50,12 L50,72')],
  m: [t('M20,42 L20,72'), t('M20,53 Q24,42 35,42 Q50,42 50,54 L50,72'), t('M50,53 Q54,42 65,42 Q80,42 80,54 L80,72')],
  n: [t('M34,42 L34,72'), t(ARCO)],
  o: [t('M50,42 Q32,42 32,57 Q32,72 50,72 Q68,72 68,57 Q68,42 50,42')],
  p: [t('M34,42 L34,97'), t(BOLA_DIR)],
  q: [t(BOLA_ESQ), t('M66,42 L66,97')],
  r: [t('M40,42 L40,72'), t('M40,54 Q44,42 56,42 Q62,42 66,47')],
  s: [t('M64,47 Q58,42 50,42 Q36,42 36,49 Q36,56 50,57 Q66,59 66,65 Q66,72 50,72 Q40,72 34,66')],
  t: [t('M46,20 L46,62 Q46,72 56,72 Q62,72 66,67'), t('M33,42 L60,42')],
  u: [t('M34,42 L34,60 Q34,72 48,72 Q60,72 66,62'), t('M66,42 L66,72')],
  v: [t('M32,42 L50,72 L68,42')],
  w: [t('M20,42 L35,72 L50,48 L65,72 L80,42')],
  x: [t('M34,42 L66,72'), t('M66,42 L34,72')],
  y: [t('M34,42 L50,72'), t('M68,42 L40,97')],
  z: [t('M34,42 L66,42 L34,72 L66,72')]
};

// As minúsculas foram desenhadas com a base em y = 72; sobem 5 unidades para a perna do g, j, p, q, y caber no quadro.
const SOBE = 5;
for (const letra of Object.keys(TRACOS)) {
  if (letra === letra.toUpperCase()) continue;
  TRACOS[letra] = TRACOS[letra].map((tr) => ({ ...tr, d: tr.d.replace(/(-?[\d.]+),(-?[\d.]+)/g, (_m, x: string, y: string) => `${x},${Number(y) - SOBE}`) }));
}

/** Traços de uma letra (maiúscula ou minúscula); `undefined` se a letra não tem traçado definido. */
export function tracosDaLetra(letra: string): TracoLetra[] | undefined {
  return TRACOS[letra];
}

/** Pontos ao longo de um caminho (só M, L e Q), a cada `passo` unidades: para desenhar setas e conferir o traço. */
export function pontosDoTraco(d: string, passo = 2): { x: number; y: number; s: number }[] {
  const nums = (txt: string) => txt.trim().split(/[\s,]+/).map(Number);
  const brutos: [number, number][] = [];
  let atual: [number, number] = [0, 0];
  for (const m of d.matchAll(/([MLQ])([^MLQ]*)/g)) {
    const v = nums(m[2]);
    if (m[1] === 'M') { atual = [v[0], v[1]]; brutos.push(atual); }
    else if (m[1] === 'L') { for (let i = 0; i + 1 < v.length; i += 2) { atual = [v[i], v[i + 1]]; brutos.push(atual); } }
    else for (let i = 0; i + 3 < v.length; i += 4) {
      const [x0, y0] = atual;
      const [cx, cy, x1, y1] = [v[i], v[i + 1], v[i + 2], v[i + 3]];
      for (let k = 1; k <= 16; k++) { const u = k / 16; brutos.push([(1 - u) ** 2 * x0 + 2 * (1 - u) * u * cx + u * u * x1, (1 - u) ** 2 * y0 + 2 * (1 - u) * u * cy + u * u * y1]); }
      atual = [x1, y1];
    }
  }
  // reamostra por comprimento
  const out: { x: number; y: number; s: number }[] = [{ x: brutos[0][0], y: brutos[0][1], s: 0 }];
  let s = 0, falta = passo;
  for (let i = 1; i < brutos.length; i++) {
    let [x0, y0] = brutos[i - 1];
    const [x1, y1] = brutos[i];
    let seg = Math.hypot(x1 - x0, y1 - y0);
    while (seg >= falta) {
      const u = falta / seg;
      x0 += (x1 - x0) * u; y0 += (y1 - y0) * u;
      s += falta; seg -= falta; falta = passo;
      out.push({ x: x0, y: y0, s });
    }
    s += seg; falta -= seg;
  }
  const fim = brutos[brutos.length - 1];
  if (s - out[out.length - 1].s > 0.2) out.push({ x: fim[0], y: fim[1], s });
  return out;
}
