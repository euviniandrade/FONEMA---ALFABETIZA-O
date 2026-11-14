/**
 * ESTÚDIO DE SONS (D029 §2): gravação do som de cada letra por um ADULTO (professora, fonoaudióloga, família),
 * no próprio aparelho. O som gravado vale mais que o clipe gerado (servicos/sons-letras.ts).
 *
 *  - grava pelo microfone (com medidor de volume), corta o silêncio das pontas sozinho, iguala o volume e guarda
 *    como WAV (toca em qualquer navegador) no repositório do aparelho (IndexedDB), id `som-letra-<fonema>`;
 *  - exporta/importa todos os sons num arquivo .json (para levar a outro aparelho ou mandar para a escola).
 * Nada sai do aparelho sozinho: o arquivo só existe se o adulto exportar.
 */
import { FONEMAS_DO_ESTUDIO, idDaGravacao, sonsLetras } from './sons-letras.ts';

export interface RepoAudios {
  salvarAudio(id: string, blob: Blob, agora: number): Promise<void>;
  obterAudio(id: string): Promise<Blob | undefined>;
  apagarAudio(id: string): Promise<void>;
}

/** Acha o trecho com som (índices de amostra) ou null se a gravação ficou muda. */
export function cortarSilencio(x: Float32Array, sr: number): { inicio: number; fim: number } | null {
  const n = Math.max(1, Math.round(sr * 0.01));
  const rms: number[] = [];
  for (let i = 0; i + n <= x.length; i += n) { let s = 0; for (let k = i; k < i + n; k++) s += x[k] * x[k]; rms.push(Math.sqrt(s / n)); }
  const pico = Math.max(0, ...rms);
  if (pico < 0.01) return null;
  const limiar = Math.max(pico * 0.08, 0.006);
  const a = rms.findIndex((v) => v >= limiar);
  let b = rms.length - 1;
  while (b > a && rms[b] < limiar) b--;
  // respiro: 40 ms antes (consoantes fracas) e 90 ms depois (fim do som)
  return { inicio: Math.max(0, a * n - Math.round(sr * 0.04)), fim: Math.min(x.length, (b + 1) * n + Math.round(sr * 0.09)) };
}

/** Corta o silêncio, aplica fade curto nas pontas e leva o pico a −1,5 dB. */
export function prepararGravacao(x: Float32Array, sr: number): Float32Array | null {
  const t = cortarSilencio(x, sr);
  if (!t || t.fim - t.inicio < sr * 0.05) return null;
  const y = x.slice(t.inicio, t.fim);
  let pico = 0;
  for (const v of y) pico = Math.max(pico, Math.abs(v));
  const g = Math.min(8, 0.84 / (pico || 1));
  const fi = Math.min(y.length >> 2, Math.round(sr * 0.006)), fo = Math.min(y.length >> 2, Math.round(sr * 0.03));
  for (let i = 0; i < y.length; i++) {
    let k = g;
    if (i < fi) k *= i / fi;
    if (i >= y.length - fo) k *= (y.length - 1 - i) / fo;
    y[i] *= k;
  }
  return y;
}

/** WAV PCM 16 bits, mono. */
export function paraWav(x: Float32Array, sr: number): Blob {
  const buf = new ArrayBuffer(44 + x.length * 2);
  const v = new DataView(buf);
  const txt = (o: number, s: string) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
  txt(0, 'RIFF'); v.setUint32(4, 36 + x.length * 2, true); txt(8, 'WAVE'); txt(12, 'fmt ');
  v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true); v.setUint32(24, sr, true); v.setUint32(28, sr * 2, true);
  v.setUint16(32, 2, true); v.setUint16(34, 16, true); txt(36, 'data'); v.setUint32(40, x.length * 2, true);
  for (let i = 0; i < x.length; i++) v.setInt16(44 + i * 2, Math.round(Math.max(-1, Math.min(1, x[i])) * 32767), true);
  return new Blob([buf], { type: 'audio/wav' });
}

export function temMicrofone(): boolean {
  return typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia && typeof MediaRecorder !== 'undefined';
}

export interface GravacaoEmCurso { parar(): Promise<{ wav: Blob; duracaoMs: number } | null>; cancelar(): void }

/** Começa a gravar. `aoNivel` recebe o volume (0–1) várias vezes por segundo. Para sozinho em `maxMs`. */
export async function iniciarGravacao(aoNivel: (n: number) => void, aoParar: () => void, maxMs = 5000): Promise<GravacaoEmCurso> {
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
  const fechar = () => { cancelAnimationFrame(raf); stream.getTracks().forEach((t) => t.stop()); aoNivel(0); };
  const fim = new Promise<Blob>((resolve) => { rec.onstop = () => resolve(new Blob(partes, { type: rec.mimeType || 'audio/webm' })); });
  rec.start();
  const relogio = setTimeout(() => { if (rec.state !== 'inactive') aoParar(); }, maxMs);
  return {
    async parar() {
      clearTimeout(relogio);
      if (rec.state !== 'inactive') rec.stop();
      const bruto = await fim;
      fechar();
      try {
        const audio = await ctx.decodeAudioData(await bruto.arrayBuffer());
        const pronto = prepararGravacao(audio.getChannelData(0).slice(), audio.sampleRate);
        void ctx.close();
        return pronto ? { wav: paraWav(pronto, audio.sampleRate), duracaoMs: Math.round((pronto.length / audio.sampleRate) * 1000) } : null;
      } catch { void ctx.close(); return null; }
    },
    cancelar() { clearTimeout(relogio); if (rec.state !== 'inactive') rec.stop(); fechar(); void ctx.close(); }
  };
}

export async function salvarSom(repo: RepoAudios, fonema: string, wav: Blob) {
  await repo.salvarAudio(idDaGravacao(fonema), wav, Date.now());
  sonsLetras.recarregar(fonema);
}
export async function apagarSom(repo: RepoAudios, fonema: string) {
  await repo.apagarAudio(idDaGravacao(fonema));
  sonsLetras.recarregar(fonema);
}

const paraBase64 = async (b: Blob) => {
  const bytes = new Uint8Array(await b.arrayBuffer());
  let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s);
};
const deBase64 = (t: string, tipo: string) => { const s = atob(t); const u = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i); return new Blob([u], { type: tipo }); };

export interface PacoteSons { formato: 'fonema-sons-das-letras'; versao: 1; exportadoEm: string; sons: Record<string, { tipo: string; base64: string }> }

/** Todos os sons gravados neste aparelho, num arquivo .json. */
export async function exportarSons(repo: RepoAudios): Promise<{ arquivo: Blob; quantos: number }> {
  const sons: PacoteSons['sons'] = {};
  for (const f of FONEMAS_DO_ESTUDIO) { const b = await repo.obterAudio(idDaGravacao(f)); if (b) sons[f] = { tipo: b.type || 'audio/wav', base64: await paraBase64(b) }; }
  const pacote: PacoteSons = { formato: 'fonema-sons-das-letras', versao: 1, exportadoEm: new Date().toISOString(), sons };
  return { arquivo: new Blob([JSON.stringify(pacote)], { type: 'application/json' }), quantos: Object.keys(sons).length };
}
/** Lê um arquivo exportado e guarda os sons (substitui os que já existem para os mesmos fonemas). */
export async function importarSons(repo: RepoAudios, texto: string): Promise<number> {
  const p = JSON.parse(texto) as Partial<PacoteSons>;
  if (p.formato !== 'fonema-sons-das-letras' || !p.sons) throw new Error('Este arquivo não é de sons do FONEMA.');
  let n = 0;
  for (const [f, s] of Object.entries(p.sons)) {
    if (!FONEMAS_DO_ESTUDIO.includes(f) || !/^audio\//.test(s.tipo) || typeof s.base64 !== 'string' || s.base64.length > 4_000_000) continue;
    await salvarSom(repo, f, deBase64(s.base64, s.tipo));
    n++;
  }
  return n;
}
