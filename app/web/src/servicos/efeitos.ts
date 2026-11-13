/** Efeitos sonoros curtos (−12 dB, ≤ 600 ms), gerados na hora, sem arquivo. Nunca som de erro punitivo. */
let ctx: AudioContext | null = null;
let ligado = true;
export function efeitosLigados(v: boolean) { ligado = v; }

function tom(freqs: number[], dur = 0.12, tipo: OscillatorType = 'sine', vol = 0.08) {
  if (!ligado) return;
  try {
    ctx ??= new AudioContext();
    const t0 = ctx.currentTime;
    freqs.forEach((f, i) => {
      const o = ctx!.createOscillator();
      const g = ctx!.createGain();
      o.type = tipo;
      o.frequency.value = f;
      g.gain.setValueAtTime(0, t0 + i * dur);
      g.gain.linearRampToValueAtTime(vol, t0 + i * dur + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, t0 + (i + 1) * dur + 0.1);
      o.connect(g).connect(ctx!.destination);
      o.start(t0 + i * dur);
      o.stop(t0 + (i + 1) * dur + 0.12);
    });
  } catch { /* sem áudio */ }
}

export const efeitos = {
  acerto: () => tom([660, 880], 0.09),
  toque: () => tom([520], 0.05, 'triangle', 0.05),
  palma: () => tom([180, 120], 0.04, 'square', 0.04),
  moeda: () => tom([988, 1319], 0.07, 'triangle', 0.06),
  conquista: () => tom([523, 659, 784, 1047], 0.11, 'triangle', 0.07),
  suave: () => tom([440], 0.08, 'sine', 0.04)
};
