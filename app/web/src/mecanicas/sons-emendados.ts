/**
 * SONS EMENDADOS (síntese com som prolongado, docs/pedagogia/04 N2; "fonação conectada", ABC p. 327, 331–332):
 * toca os SONS REAIS das letras (public/audio/sons ou as gravações do Estúdio de sons, que têm prioridade) um colado ao
 * outro — "mmmaaalll…" — em ritmos cada vez mais rápidos. Usa a Web Audio API para emendar sem buraco: de cada clipe
 * contínuo pega o miolo estável, com entrada e saída suaves e uma sobreposição curta com o próximo. Os sons de estouro
 * (p, t, k, b, d, g) não se esticam: tocam inteiros, colados à vogal seguinte (docs/pedagogia/03 §5).
 *
 * Não muda tom nem velocidade de nada: só corta a duração do miolo de um som contínuo (o som segue o mesmo).
 */
import { sonsLetras } from '../servicos/sons-letras.ts';
import { modoTeste } from '../servicos/ambiente.ts';

export type Ritmo = 'separado' | 'lento' | 'medio' | 'rapido';
/** Duração do miolo de um som contínuo em cada ritmo (ms) e a pausa entre sons (só no "separado"). */
const MIOLO: Record<Ritmo, number> = { separado: 900, lento: 650, medio: 380, rapido: 230 };
const PAUSA: Record<Ritmo, number> = { separado: 380, lento: 0, medio: 0, rapido: 0 };
const ESTOURO = new Set(['p', 't', 'k', 'b', 'd', 'g']);
const SOBREPOE = 0.05;
const RAMPA = 0.04;

let ctx: AudioContext | null = null;
const buffers = new Map<string, Promise<AudioBuffer | null>>();
let ativos: AudioBufferSourceNode[] = [];
let timers: number[] = [];
let geracao = 0;
/** Promessas em espera: soltas quando os sons param (nada fica pendurado). */
let soltar: (() => void)[] = [];

function contexto(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const C = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!C) return null;
  ctx ??= new C();
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

async function buffer(fonema: string): Promise<AudioBuffer | null> {
  const o = await sonsLetras.origem(fonema);
  if (!o) return null;
  const chave = `${fonema}|${o.url}`;
  if (!buffers.has(chave)) {
    const c = contexto();
    buffers.set(chave, c ? fetch(o.url).then((r) => r.arrayBuffer()).then((b) => c.decodeAudioData(b)).catch(() => null) : Promise.resolve(null));
  }
  return buffers.get(chave)!;
}

/** Todos os sons existem (publicados ou gravados)? */
export async function temSons(fonemas: (string | null)[]): Promise<boolean> {
  return sonsLetras.temTodos(fonemas.filter((f): f is string => !!f));
}

export function pararSons() {
  geracao++;
  for (const s of ativos) { try { s.stop(); } catch { /* já parou */ } }
  ativos = [];
  for (const t of timers) clearTimeout(t);
  timers = [];
  const s = soltar;
  soltar = [];
  s.forEach((f) => f());
}

/**
 * Toca os sons emendados. `aoSom(i)` avisa quando o som da letra `i` começa (para acender a letra na tela).
 * Letras caladas (`null`) são puladas. Devolve false se algum som não existe ou se foi interrompido.
 */
export async function tocarSonsEmendados(fonemas: (string | null)[], ritmo: Ritmo, aoSom?: (i: number) => void): Promise<boolean> {
  pararSons();
  const g = geracao;
  const idx = fonemas.map((f, i) => (f ? i : -1)).filter((i) => i >= 0);
  if (modoTeste()) {
    for (const i of idx) { aoSom?.(i); await new Promise((r) => setTimeout(r, 8)); }
    return true;
  }
  const c = contexto();
  if (!c) return false;
  const bufs = await Promise.all(idx.map((i) => buffer(fonemas[i]!)));
  if (g !== geracao || bufs.some((b) => !b)) return false;
  let t = c.currentTime + 0.06;
  const inicio = t;
  bufs.forEach((b, k) => {
    const i = idx[k];
    const f = fonemas[i]!;
    const estouro = ESTOURO.has(f);
    const total = b!.duration;
    const dur = estouro ? total : Math.min(total, MIOLO[ritmo] / 1000);
    const desde = estouro ? 0 : Math.max(0, (total - dur) / 2);
    const src = c.createBufferSource();
    src.buffer = b!;
    const ganho = c.createGain();
    ganho.gain.setValueAtTime(0, t);
    ganho.gain.linearRampToValueAtTime(1, t + (estouro ? 0.005 : RAMPA));
    ganho.gain.setValueAtTime(1, t + Math.max(RAMPA, dur - RAMPA));
    ganho.gain.linearRampToValueAtTime(0, t + dur);
    src.connect(ganho).connect(c.destination);
    src.start(t, desde, dur);
    ativos.push(src);
    timers.push(window.setTimeout(() => { if (g === geracao) aoSom?.(i); }, (t - inicio) * 1000 + 40));
    t += dur + PAUSA[ritmo] / 1000 - (PAUSA[ritmo] || estouro ? 0 : SOBREPOE);
  });
  await new Promise<void>((r) => { soltar.push(r); timers.push(window.setTimeout(r, (t - inicio) * 1000 + 120)); });
  return g === geracao;
}
