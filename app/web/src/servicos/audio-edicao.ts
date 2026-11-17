/**
 * Preparar um áudio novo do administrador NO NAVEGADOR (Web Audio), antes de ele substituir o original:
 *  - aparar o silêncio das pontas (mantém um respiro, para não cortar consoante fraca nem o fim da vogal);
 *  - igualar o volume (parte falada em −17 dBFS, como a masterização das falas: ferramentas/masterizar-audio.py),
 *    sem estourar (teto −1,5 dBFS) e com fade curto nas pontas;
 *  - gravar pelo microfone (com medidor de volume) e devolver o áudio bruto, para ouvir antes de salvar.
 * As funções de sinal são puras (testadas em audio-edicao.test.ts); decodificar e gravar precisam do navegador.
 */
import { paraWav } from './estudio-sons.ts';

export { paraWav };

const db = (x: number) => 10 ** (x / 20);
export const ALVO_RMS_DB = -17;
export const TETO_DB = -1.5;

/** RMS por janelas de `passoMs`. */
function envelope(x: Float32Array, sr: number, passoMs = 10): { env: Float32Array; passo: number } {
  const passo = Math.max(1, Math.round((sr * passoMs) / 1000));
  const q = Math.max(1, Math.floor(x.length / passo));
  const env = new Float32Array(q);
  for (let k = 0; k < q; k++) {
    let s = 0;
    for (let i = k * passo; i < Math.min(x.length, (k + 1) * passo); i++) s += x[i] * x[i];
    env[k] = Math.sqrt(s / passo);
  }
  return { env, passo };
}

/** Trecho com som [inicio, fim) em amostras, com respiro; null se o áudio é mudo. */
export function trechoComSom(x: Float32Array, sr: number, margemIniMs = 40, margemFimMs = 90): { inicio: number; fim: number } | null {
  if (!x.length) return null;
  let pico = 0;
  for (const v of x) pico = Math.max(pico, Math.abs(v));
  if (pico < db(-45)) return null;
  const { env, passo } = envelope(x, sr);
  const limiar = Math.max(db(-55), pico * db(-36));
  let a = 0;
  while (a < env.length && env[a] < limiar) a++;
  let b = env.length - 1;
  while (b > a && env[b] < limiar) b--;
  if (a >= env.length) return null;
  return {
    inicio: Math.max(0, a * passo - Math.round((sr * margemIniMs) / 1000)),
    fim: Math.min(x.length, (b + 1) * passo + Math.round((sr * margemFimMs) / 1000))
  };
}

/** Leva a parte falada a −17 dBFS de RMS, com teto suave em −1,5 dBFS. Devolve uma cópia. */
export function igualarVolume(x: Float32Array, sr: number): Float32Array {
  const y = x.slice();
  const { env } = envelope(y, sr);
  const ativos = Array.from(env).filter((v) => v > db(-40));
  const base = ativos.length ? ativos : Array.from(env);
  const rms = Math.sqrt(base.reduce((s, v) => s + v * v, 0) / Math.max(1, base.length));
  if (rms < 1e-6) return y;
  const g = Math.min(db(30), db(ALVO_RMS_DB) / rms);
  const teto = db(TETO_DB);
  const joelho = teto * 0.8;
  for (let i = 0; i < y.length; i++) {
    let v = y[i] * g;
    const m = Math.abs(v);
    if (m > joelho) v = Math.sign(v) * (joelho + (teto - joelho) * Math.tanh((m - joelho) / (teto - joelho)));
    y[i] = v;
  }
  return y;
}

/** Fade de entrada e de saída (sem estalo na emenda). Altera o próprio vetor. */
export function suavizarPontas(y: Float32Array, sr: number, inMs = 10, outMs = 15): Float32Array {
  const fi = Math.min(y.length >> 1, Math.round((sr * inMs) / 1000));
  const fo = Math.min(y.length >> 1, Math.round((sr * outMs) / 1000));
  for (let i = 0; i < fi; i++) y[i] *= (i / fi) ** 2;
  for (let i = 0; i < fo; i++) y[y.length - 1 - i] *= (i / fo) ** 2;
  return y;
}

export interface OpcoesPreparo { aparar: boolean; igualar: boolean }
/** Prepara o sinal conforme as opções. Devolve null se ficou mudo. */
export function prepararSinal(x: Float32Array, sr: number, o: OpcoesPreparo): Float32Array | null {
  let y = x;
  if (o.aparar) {
    const t = trechoComSom(x, sr);
    if (!t) return null;
    y = x.slice(t.inicio, t.fim);
  }
  if (o.igualar) y = igualarVolume(y, sr);
  else if (o.aparar) y = y.slice();
  if (o.aparar || o.igualar) suavizarPontas(y, sr);
  return y.length ? y : null;
}

export const duracaoMs = (n: number, sr: number) => Math.round((n / sr) * 1000);

/* ------------------------------------------------------------------ navegador */

/** Decodifica qualquer áudio que o navegador entende (mp3, wav, ogg, webm, m4a) em mono. */
export async function decodificar(blob: Blob): Promise<{ x: Float32Array; sr: number }> {
  const Ctx = (window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext);
  const ctx = new Ctx();
  try {
    const a = await ctx.decodeAudioData(await blob.arrayBuffer());
    const x = new Float32Array(a.length);
    for (let c = 0; c < a.numberOfChannels; c++) { const d = a.getChannelData(c); for (let i = 0; i < x.length; i++) x[i] += d[i] / a.numberOfChannels; }
    return { x, sr: a.sampleRate };
  } finally { void ctx.close(); }
}

/**
 * Áudio pronto para guardar. Sem aparar nem igualar, guarda o ARQUIVO como veio (byte a byte);
 * com alguma das duas, decodifica, prepara e guarda em WAV.
 */
export async function prepararArquivo(blob: Blob, o: OpcoesPreparo): Promise<{ blob: Blob; duracaoMs?: number }> {
  if (!o.aparar && !o.igualar) {
    let dur: number | undefined;
    try { const d = await decodificar(blob); dur = duracaoMs(d.x.length, d.sr); } catch { /* formato que este navegador não decodifica: guarda assim mesmo */ }
    return { blob, duracaoMs: dur };
  }
  const { x, sr } = await decodificar(blob);
  const y = prepararSinal(x, sr, o);
  if (!y) throw new Error('O áudio parece mudo (nada acima do silêncio).');
  return { blob: paraWav(y, sr), duracaoMs: duracaoMs(y.length, sr) };
}

export function temMicrofone(): boolean {
  return typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia && typeof MediaRecorder !== 'undefined';
}

export interface Gravando { parar(): Promise<Blob>; cancelar(): void }
/**
 * Começa a gravar (o navegador pede a permissão do microfone na primeira vez). `aoNivel` recebe o volume (0–1);
 * para sozinho em `maxMs` chamando `aoLimite`. Devolve o áudio bruto (webm/ogg/mp4, conforme o navegador).
 */
export async function gravar(aoNivel: (n: number) => void, aoLimite: () => void, maxMs = 20000): Promise<Gravando> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: true, autoGainControl: false } });
  const rec = new MediaRecorder(stream);
  const partes: Blob[] = [];
  rec.ondataavailable = (e) => { if (e.data.size) partes.push(e.data); };
  const ctx = new AudioContext();
  const an = ctx.createAnalyser();
  an.fftSize = 1024;
  ctx.createMediaStreamSource(stream).connect(an);
  const buf = new Uint8Array(an.fftSize);
  let raf = 0;
  const medir = () => {
    an.getByteTimeDomainData(buf);
    let s = 0;
    for (const b of buf) s += (b - 128) * (b - 128);
    aoNivel(Math.min(1, Math.sqrt(s / buf.length) / 42));
    raf = requestAnimationFrame(medir);
  };
  medir();
  const fechar = () => { cancelAnimationFrame(raf); stream.getTracks().forEach((t) => t.stop()); aoNivel(0); void ctx.close(); };
  const fim = new Promise<Blob>((resolve) => { rec.onstop = () => resolve(new Blob(partes, { type: rec.mimeType || 'audio/webm' })); });
  rec.start();
  const relogio = setTimeout(() => { if (rec.state !== 'inactive') aoLimite(); }, maxMs);
  return {
    async parar() { clearTimeout(relogio); if (rec.state !== 'inactive') rec.stop(); const b = await fim; fechar(); return b; },
    cancelar() { clearTimeout(relogio); if (rec.state !== 'inactive') rec.stop(); fechar(); }
  };
}

/** SHA-256 (hex) de um arquivo, para o pacote. */
export async function sha256(dados: Uint8Array): Promise<string | undefined> {
  try {
    const h = await crypto.subtle.digest('SHA-256', dados as unknown as ArrayBuffer);
    return [...new Uint8Array(h)].map((b) => b.toString(16).padStart(2, '0')).join('');
  } catch { return undefined; }
}
