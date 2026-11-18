/**
 * Pintura dos SELOS 3D (D025/D029): base 3D recortada (ouro, bronze, prata, diamante ou bloqueada),
 * o MOTIVO no centro (letra gordinha dourada com volume, ou figura 3D com sombra) e o NOME na faixa,
 * acompanhando a curva e encolhendo sozinho quando o nome é comprido.
 *
 * A mesma pintura serve ao selo parado (canvas 2D) e à textura do selo que gira em 360° (premio3d.ts).
 * As bases e a geometria (centro, curva da faixa, contorno) vêm de scripts/gerar-selos.py.
 */
import geometria from './selos-geometria.json';
import { asset } from '../servicos/ambiente.ts';
import { letraAa } from './LetraAa.tsx';

export type Forma = 'estrela' | 'escudo' | 'medalha' | 'hexagono';
export type Metal = 'bronze' | 'prata' | 'ouro' | 'diamante';
export type Motivo = { tipo: 'letra'; texto: string } | { tipo: 'figura'; src: string } | { tipo: 'misterio' };

export interface ArteSelo {
  forma: Forma;
  metal: Metal;
  nome: string;
  motivo: Motivo;
  bloqueado: boolean;
  /** Verso: nível e data gravados (nada de logotipo). */
  verso?: { nivel: string; data: string };
}

interface GeoSelo {
  w: number; h: number;
  centro: { x: number; y: number; cx: number; cy: number; r: number };
  faixa: { x0: number; x1: number; a: number; b: number; c: number; altura: number };
  contorno: number[][];
}
interface GeoPremio { w: number; h: number; contorno: number[][] }
const GEO = geometria as unknown as Record<Forma, GeoSelo> & Record<string, GeoPremio>;

export const geoSelo = (forma: Forma): GeoSelo => GEO[forma];
export const geoPremio = (nome: string): GeoPremio => GEO[nome];

/** Quanto do círculo inscrito no centro o motivo pode ocupar (a estrela tem as pontas de folga). */
const FOLGA: Record<Forma, { figura: number; letra: number; dy: number }> = {
  estrela: { figura: 1.52, letra: 1.5, dy: -0.04 },
  escudo: { figura: 1.62, letra: 1.42, dy: 0.04 },
  medalha: { figura: 1.46, letra: 1.4, dy: 0 },
  hexagono: { figura: 1.46, letra: 1.4, dy: 0 }
};

/* ------------------------------------------------------------------ imagens e fonte */
const cache = new Map<string, Promise<HTMLImageElement | null>>();
export function carregarImagem(src: string): Promise<HTMLImageElement | null> {
  let p = cache.get(src);
  if (!p) {
    p = new Promise((ok) => {
      const im = new Image();
      im.decoding = 'async';
      im.onload = () => ok(im);
      im.onerror = () => ok(null);
      im.src = src;
    });
    cache.set(src, p);
  }
  return p;
}

let fonte: Promise<void> | null = null;
export function fontePronta(): Promise<void> {
  fonte ??= (typeof document !== 'undefined' && document.fonts?.load
    ? Promise.all([document.fonts.load('700 48px Fredoka', 'AÇÃO'), document.fonts.load('600 48px Fredoka', 'AÇÃO')]).then(() => undefined, () => undefined)
    : Promise.resolve());
  return fonte;
}

export const caminhoBase = (forma: Forma, metal: Metal, bloqueado: boolean): string =>
  asset(`recompensas/bases/${forma}${bloqueado ? '-bloqueado' : metal === 'ouro' ? '' : `-${metal}`}.webp`);
export const caminhoVerso = (forma: Forma, metal: Metal, bloqueado: boolean): string =>
  asset(`recompensas/bases/${forma}-verso${bloqueado ? '-prata' : metal === 'ouro' ? '' : `-${metal}`}.webp`);

export interface ImagensSelo { base: HTMLImageElement | null; verso: HTMLImageElement | null; figura: HTMLImageElement | null }
export async function prepararSelo(arte: ArteSelo, comVerso = false): Promise<ImagensSelo> {
  const [base, verso, figura] = await Promise.all([
    carregarImagem(caminhoBase(arte.forma, arte.metal, arte.bloqueado)),
    comVerso ? carregarImagem(caminhoVerso(arte.forma, arte.metal, arte.bloqueado)) : Promise.resolve(null),
    arte.motivo.tipo === 'figura' ? carregarImagem(arte.motivo.src) : Promise.resolve(null),
    fontePronta()
  ]);
  return { base, verso, figura };
}

/* ------------------------------------------------------------------ nome na faixa */
const FONTE = (peso: number, fs: number) => `${peso} ${fs}px Fredoka, "Baloo 2", Andika, sans-serif`;
const ESPACO = 0.035; // espaçamento entre letras, em em

type Ctx = CanvasRenderingContext2D;
function largura(ctx: Ctx, t: string, fs: number): number {
  ctx.font = FONTE(700, fs);
  let w = 0;
  for (const ch of t) w += ctx.measureText(ch).width;
  return w + Math.max(0, [...t].length - 1) * fs * ESPACO;
}

export interface NomeAjustado { linhas: string[]; fs: number; largura: number; disponivel: number; altura: number }
/**
 * Ajuste automático do nome à faixa: uma linha grande quando cabe; senão encolhe; nomes compridos
 * vão para duas linhas (corte no espaço que deixa as linhas mais parecidas). Nunca passa da faixa.
 */
export function ajustarNome(ctx: Ctx, nome: string, forma: Forma): NomeAjustado {
  const f = GEO[forma].faixa;
  const disponivel = (f.x1 - f.x0) * 0.9;
  const t = nome.trim().toLocaleUpperCase('pt-BR');
  const max1 = f.altura * 0.6;
  const w1 = largura(ctx, t, max1);
  const fs1 = Math.min(max1, (max1 * disponivel) / w1);
  let melhor: NomeAjustado = { linhas: [t], fs: fs1, largura: (w1 * fs1) / max1, disponivel, altura: f.altura };
  const palavras = t.split(/\s+/);
  if (fs1 < f.altura * 0.44 && palavras.length > 1) {
    const max2 = f.altura * 0.4;
    let corte = 1;
    let menor = Infinity;
    for (let i = 1; i < palavras.length; i++) {
      const w = Math.max(largura(ctx, palavras.slice(0, i).join(' '), max2), largura(ctx, palavras.slice(i).join(' '), max2));
      if (w < menor) { menor = w; corte = i; }
    }
    const fs2 = Math.min(max2, (max2 * disponivel) / menor);
    if (fs2 > fs1 * 0.92) melhor = { linhas: [palavras.slice(0, corte).join(' '), palavras.slice(corte).join(' ')], fs: fs2, largura: (menor * fs2) / max2, disponivel, altura: f.altura };
  }
  return melhor;
}

function textoNaCurva(ctx: Ctx, t: string, fs: number, forma: Forma, desloc: number, pintar: (ch: string) => void) {
  const f = GEO[forma].faixa;
  const total = largura(ctx, t, fs);
  ctx.font = FONTE(700, fs);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  let x = (f.x0 + f.x1) / 2 - total / 2;
  for (const ch of t) {
    const w = ctx.measureText(ch).width;
    const xc = x + w / 2;
    const y = f.a * xc * xc + f.b * xc + f.c + desloc;
    ctx.save();
    ctx.translate(xc, y);
    ctx.rotate(Math.atan(2 * f.a * xc + f.b));
    pintar(ch);
    ctx.restore();
    x += w + fs * ESPACO;
  }
}

function pintarNome(ctx: Ctx, arte: ArteSelo) {
  const aj = ajustarNome(ctx, arte.nome, arte.forma);
  const { fs } = aj;
  const sobe = fs * 0.35 - GEO[arte.forma].faixa.altura * 0.05; // do meio da faixa até a linha de base
  const linhas = aj.linhas.map((t, i) => ({ t, d: aj.linhas.length === 1 ? sobe : (i === 0 ? -fs * 0.5 : fs * 0.5) + sobe }));
  const grad = ctx.createLinearGradient(0, -fs * 0.8, 0, fs * 0.15);
  if (arte.bloqueado) { grad.addColorStop(0, '#FFFFFF'); grad.addColorStop(1, '#E3E8EE'); }
  else { grad.addColorStop(0, '#FFF8CF'); grad.addColorStop(0.55, '#FFD650'); grad.addColorStop(1, '#F2A51A'); }
  ctx.lineJoin = 'round';
  for (const l of linhas) {
    textoNaCurva(ctx, l.t, fs, arte.forma, l.d, (ch) => {
      ctx.lineWidth = fs * 0.2;
      ctx.strokeStyle = arte.bloqueado ? 'rgba(74,86,104,.9)' : 'rgba(7,16,46,.92)';
      ctx.strokeText(ch, 0, fs * 0.05);
    });
    textoNaCurva(ctx, l.t, fs, arte.forma, l.d, (ch) => {
      ctx.fillStyle = grad;
      ctx.fillText(ch, 0, 0);
    });
  }
}

/* ------------------------------------------------------------------ motivo */
function pintarLetra(ctx: Ctx, texto: string, cx: number, cy: number, r: number, folga: number, cinza: boolean) {
  // fila nº 27 (4): letra sozinha sempre maiúscula e minúscula ("Aa"); duas letras (iniciais) continuam como estão
  const t = texto.length === 1 ? letraAa(texto) : texto.toLocaleUpperCase('pt-BR').slice(0, 2);
  let fs = r * (t.length > 1 ? 1.12 : 1.62);
  ctx.font = FONTE(700, fs);
  const w0 = ctx.measureText(t).width;
  if (w0 > r * folga) fs *= (r * folga) / w0;
  ctx.font = FONTE(700, fs);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  const m = ctx.measureText(t);
  const vol = fs * 0.085;
  const y = cy + (m.actualBoundingBoxAscent - m.actualBoundingBoxDescent) / 2 - vol * 0.45;
  if (!cinza) {
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 1.25);
    g.addColorStop(0, 'rgba(255,238,160,.6)'); g.addColorStop(0.45, 'rgba(255,205,80,.3)'); g.addColorStop(1, 'rgba(255,190,60,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(cx, cy, r * 1.25, 0, Math.PI * 2); ctx.fill();
  }
  ctx.lineJoin = 'round';
  // sombra projetada no esmalte
  ctx.save();
  ctx.shadowColor = 'rgba(2,8,30,.55)'; ctx.shadowBlur = fs * 0.1; ctx.shadowOffsetY = fs * 0.07;
  ctx.lineWidth = fs * 0.1; ctx.strokeStyle = cinza ? '#5E6A7B' : '#0C1A45';
  ctx.strokeText(t, cx, y + vol);
  ctx.restore();
  // contorno marinho em volta de todo o volume
  ctx.lineWidth = fs * 0.1; ctx.strokeStyle = cinza ? '#5E6A7B' : '#0C1A45';
  const N = 7;
  for (let i = N; i >= 0; i--) ctx.strokeText(t, cx, y + (vol * i) / N);
  // volume (lateral da letra)
  for (let i = N; i >= 1; i--) {
    ctx.fillStyle = cinza ? (i > 4 ? '#8793A3' : '#A3AEBC') : i > 5 ? '#7A4A06' : i > 2 ? '#A86A08' : '#C98A12';
    ctx.fillText(t, cx, y + (vol * i) / N);
  }
  // face
  const g = ctx.createLinearGradient(0, y - m.actualBoundingBoxAscent, 0, y + m.actualBoundingBoxDescent);
  if (cinza) { g.addColorStop(0, '#FFFFFF'); g.addColorStop(1, '#D5DCE5'); }
  else { g.addColorStop(0, '#FFF9C9'); g.addColorStop(0.42, '#FFD84A'); g.addColorStop(1, '#F1A012'); }
  ctx.fillStyle = g;
  ctx.fillText(t, cx, y);
  // filete de luz na borda de cima
  ctx.save();
  ctx.beginPath(); ctx.rect(cx - r * 2, y - m.actualBoundingBoxAscent - fs * 0.1, r * 4, m.actualBoundingBoxAscent * 0.62); ctx.clip();
  ctx.lineWidth = fs * 0.022; ctx.strokeStyle = cinza ? 'rgba(255,255,255,.7)' : 'rgba(255,253,235,.85)';
  ctx.strokeText(t, cx, y + fs * 0.012);
  ctx.restore();
}

/**
 * As figuras 3D vêm com um "chão" branco recortado junto (sombra sobre fundo claro). No esmalte azul do selo ele
 * vira uma mancha: tiramos as manchas brancas e neutras grandes da metade de baixo (o selo põe a própria sombra).
 */
const limpas = new Map<string, HTMLCanvasElement | HTMLImageElement>();
export function figuraSemChao(im: HTMLImageElement): HTMLCanvasElement | HTMLImageElement { return semChao(im); }
function semChao(im: HTMLImageElement): HTMLCanvasElement | HTMLImageElement {
  const pronta = limpas.get(im.src);
  if (pronta) return pronta;
  let saida: HTMLCanvasElement | HTMLImageElement = im;
  try {
    const W = Math.min(440, im.naturalWidth);
    const H = Math.round((im.naturalHeight * W) / im.naturalWidth);
    const c = novoCanvas(W, H);
    const x = c.getContext('2d', { willReadFrequently: true });
    if (x) {
      x.drawImage(im, 0, 0, W, H);
      const dados = x.getImageData(0, 0, W, H);
      const d = dados.data;
      const claro = (i: number, lim: number) => d[i + 3] > 20 && Math.min(d[i], d[i + 1], d[i + 2]) > lim && Math.max(d[i], d[i + 1], d[i + 2]) - Math.min(d[i], d[i + 1], d[i + 2]) < 16;
      const rot = new Int32Array(W * H);
      const fila = new Int32Array(W * H);
      let n = 0;
      for (let p0 = 0; p0 < W * H; p0++) {
        if (rot[p0] || !claro(p0 * 4, 226)) continue;
        n++;
        let ini = 0; let fim = 0; let somaY = 0;
        fila[fim++] = p0; rot[p0] = n;
        while (ini < fim) {
          const p = fila[ini++];
          const px = p % W; const py = (p / W) | 0;
          somaY += py;
          for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
            const qx = px + dx; const qy = py + dy;
            if (qx < 0 || qy < 0 || qx >= W || qy >= H) continue;
            const q = qy * W + qx;
            if (!rot[q] && claro(q * 4, 226)) { rot[q] = n; fila[fim++] = q; }
          }
        }
        // mancha grande, na metade de baixo = chão
        if (fim > W * H * 0.012 && somaY / fim > H * 0.6) {
          for (let k = 0; k < fim; k++) d[fila[k] * 4 + 3] = 0;
          // franja clara em volta da mancha (2 passadas)
          let borda = Array.from(fila.subarray(0, fim));
          for (let passo = 0; passo < 3; passo++) {
            const prox: number[] = [];
            for (const p of borda) {
              const px = p % W; const py = (p / W) | 0;
              for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
                const qx = px + dx; const qy = py + dy;
                if (qx < 0 || qy < 0 || qx >= W || qy >= H) continue;
                const q = qy * W + qx;
                if (d[q * 4 + 3] && claro(q * 4, 196)) { d[q * 4 + 3] = 0; prox.push(q); }
              }
            }
            borda = prox;
          }
        }
      }
      x.putImageData(dados, 0, 0);
      saida = c;
    }
  } catch { /* imagem de outra origem: fica como veio */ }
  limpas.set(im.src, saida);
  return saida;
}

let rascunho: HTMLCanvasElement | null = null;
function pintarFigura(ctx: Ctx, original: HTMLImageElement, cx: number, cy: number, lado: number, silhueta: boolean) {
  const im = semChao(original);
  const k = Math.min(lado / original.naturalWidth, lado / original.naturalHeight);
  const w = original.naturalWidth * k;
  const h = original.naturalHeight * k;
  ctx.save();
  if (silhueta) {
    // bloqueado: só a silhueta, em cinza (a criança vê a forma, não o prêmio pronto)
    rascunho ??= document.createElement('canvas');
    rascunho.width = Math.ceil(w); rascunho.height = Math.ceil(h);
    const r = rascunho.getContext('2d');
    if (r) {
      r.clearRect(0, 0, rascunho.width, rascunho.height);
      r.globalCompositeOperation = 'source-over';
      r.drawImage(im, 0, 0, w, h);
      r.globalCompositeOperation = 'source-in';
      r.fillStyle = '#6F7B8C';
      r.fillRect(0, 0, rascunho.width, rascunho.height);
      ctx.globalAlpha = 0.5;
      ctx.drawImage(rascunho, cx - w / 2, cy - h / 2);
    }
  } else {
    ctx.shadowColor = 'rgba(2,8,30,.6)'; ctx.shadowBlur = lado * 0.09; ctx.shadowOffsetY = lado * 0.05;
    ctx.drawImage(im, cx - w / 2, cy - h / 2, w, h);
  }
  ctx.restore();
}

function cadeado(ctx: Ctx, x: number, y: number, r: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.shadowColor = 'rgba(20,30,60,.35)'; ctx.shadowBlur = r * 0.3; ctx.shadowOffsetY = r * 0.12;
  ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.lineWidth = r * 0.14; ctx.strokeStyle = '#A7B2C0'; ctx.stroke();
  ctx.strokeStyle = '#4F5B6D'; ctx.lineWidth = r * 0.17; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-r * 0.3, -r * 0.08); ctx.lineTo(-r * 0.3, -r * 0.26); ctx.arc(0, -r * 0.26, r * 0.3, Math.PI, 0); ctx.lineTo(r * 0.3, -r * 0.08); ctx.stroke();
  ctx.fillStyle = '#4F5B6D';
  const w = r * 0.96; const h = r * 0.7;
  ctx.beginPath(); ctx.roundRect(-w / 2, -r * 0.1, w, h, r * 0.14); ctx.fill();
  ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.arc(0, r * 0.2, r * 0.1, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

/* ------------------------------------------------------------------ frente e verso */
/** Pinta a FRENTE do selo no canvas inteiro (o canvas deve ter a proporção de geoSelo(forma)). */
export function pintarFrente(canvas: HTMLCanvasElement, arte: ArteSelo, im: ImagensSelo): void {
  const g = GEO[arte.forma];
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const k = canvas.width / g.w;
  ctx.setTransform(k, 0, 0, k, 0, 0);
  ctx.clearRect(0, 0, g.w, g.h);
  ctx.imageSmoothingQuality = 'high';
  if (im.base) ctx.drawImage(im.base, 0, 0, g.w, g.h);
  const fl = FOLGA[arte.forma];
  const cx = (g.centro.cx + g.centro.x) / 2;
  const r = g.centro.r;
  const cy = (g.centro.cy + g.centro.y) / 2 + r * fl.dy;
  const mist = arte.motivo.tipo === 'misterio';
  if (mist) pintarLetra(ctx, '?', cx, cy, r, fl.letra, true);
  else if (arte.motivo.tipo === 'letra') pintarLetra(ctx, arte.motivo.texto, cx, cy, r, fl.letra, arte.bloqueado);
  else if (im.figura) pintarFigura(ctx, im.figura, cx, cy, r * fl.figura, arte.bloqueado);
  pintarNome(ctx, mist ? { ...arte, nome: 'Mistério' } : arte);
  if (arte.bloqueado) cadeado(ctx, g.w * 0.8, g.h * 0.13, g.h * 0.085);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}

const TOM_VERSO: Record<Metal, { claro: string; meio: string; escuro: string }> = {
  ouro: { claro: '#FFF0A8', meio: '#EDB23A', escuro: '#8A5506' },
  bronze: { claro: '#F7C9A0', meio: '#B8693A', escuro: '#5E2A0E' },
  prata: { claro: '#FFFFFF', meio: '#A9B4C2', escuro: '#515D6E' },
  diamante: { claro: '#F0FAFF', meio: '#66AEE8', escuro: '#1D5596' }
};

function estrela(ctx: Ctx, cx: number, cy: number, R: number) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 ? R * 0.5 : R;
    ctx[i ? 'lineTo' : 'moveTo'](cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
  }
  ctx.closePath();
}

/** Estrela em RELEVO no metal (verso dos selos e da moeda). */
export function relevoEstrela(ctx: Ctx, cx: number, cy: number, R: number, tom: { claro: string; meio: string; escuro: string } = TOM_VERSO.ouro) {
  ctx.lineJoin = 'round';
  ctx.save();
  ctx.lineWidth = R * 0.16;
  ctx.translate(R * 0.045, R * 0.06); estrela(ctx, cx, cy, R); ctx.fillStyle = tom.escuro; ctx.strokeStyle = tom.escuro; ctx.globalAlpha = 0.55; ctx.fill(); ctx.stroke();
  ctx.translate(-R * 0.09, -R * 0.11); estrela(ctx, cx, cy, R); ctx.fillStyle = tom.claro; ctx.strokeStyle = tom.claro; ctx.globalAlpha = 0.8; ctx.fill(); ctx.stroke();
  ctx.restore();
  const gr = ctx.createLinearGradient(cx - R, cy - R, cx + R, cy + R);
  gr.addColorStop(0, tom.claro); gr.addColorStop(0.5, tom.meio); gr.addColorStop(1, tom.escuro);
  ctx.lineWidth = R * 0.16; ctx.strokeStyle = gr; ctx.fillStyle = gr;
  estrela(ctx, cx, cy, R); ctx.fill(); ctx.stroke();
  const luz = ctx.createLinearGradient(cx, cy - R, cx, cy + R * 0.2);
  luz.addColorStop(0, 'rgba(255,255,255,.55)'); luz.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = luz; estrela(ctx, cx, cy, R * 0.86); ctx.fill();
}

/**
 * Pinta o VERSO: placa lisa de metal, uma estrela em relevo e o nível/data gravados (sem logotipo).
 * A arte já sai ESPELHADA na horizontal, para a silhueta casar com a da frente quando o selo vira.
 */
export function pintarVerso(canvas: HTMLCanvasElement, arte: ArteSelo, im: ImagensSelo): void {
  const g = GEO[arte.forma];
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const k = canvas.width / g.w;
  ctx.setTransform(-k, 0, 0, k, canvas.width, 0);
  ctx.clearRect(0, 0, g.w, g.h);
  if (im.verso) ctx.drawImage(im.verso, 0, 0, g.w, g.h);
  ctx.setTransform(k, 0, 0, k, 0, 0);
  const tom = TOM_VERSO[arte.bloqueado ? 'prata' : arte.metal];
  const cx = g.w - (g.centro.cx + g.centro.x) / 2;
  const r = g.centro.r;
  const cy0 = (g.centro.cy + g.centro.y) / 2;
  const cy = cy0 - r * 0.24;
  const R = r * 0.5;
  // revisão 18/11 (item 12): selo de letra tem a LETRA também no verso (antes era uma estrela genérica, e o selo ampliado no
  // celular podia abrir de costas mostrando "uma medalha qualquer")
  if (arte.motivo.tipo === 'letra') {
    const tv = arte.motivo.texto.length === 1 ? letraAa(arte.motivo.texto) : arte.motivo.texto; // fila nº 27 (4): "Aa"
    const fs = R * (tv.length > 1 ? 1.25 : 1.9);
    ctx.font = FONTE(700, fs); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(255,255,255,.6)'; ctx.fillText(tv, cx + fs * 0.02, cy + fs * 0.05);
    ctx.fillStyle = tom.escuro; ctx.globalAlpha = 0.85; ctx.fillText(tv, cx, cy); ctx.globalAlpha = 1;
  } else relevoEstrela(ctx, cx, cy, R, tom);
  // gravação: nível e data
  const gravar = (t: string, y: number, fs: number) => {
    ctx.font = FONTE(700, fs); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.fillText(t, cx, y + fs * 0.06);
    ctx.fillStyle = tom.escuro; ctx.globalAlpha = 0.82; ctx.fillText(t, cx, y); ctx.globalAlpha = 1;
  };
  const nivel = arte.verso?.nivel;
  if (nivel) gravar(nivel.toLocaleUpperCase('pt-BR'), cy0 + r * 0.47, r * 0.22);
  if (arte.verso?.data) gravar(arte.verso.data, cy0 + r * (nivel ? 0.72 : 0.56), r * 0.17);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}

export function novoCanvas(w: number, h: number): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = Math.round(w); c.height = Math.round(h);
  return c;
}
