/**
 * Microfone: gravação do adulto (nome falado, D013) e "Mostra pro professor", e escuta OPCIONAL da criança.
 * Regra: o reconhecimento de fala é SINAL, nunca juiz. Sempre existe o botão "Eu falei!".
 * Nenhum áudio da criança é enviado: tudo fica no aparelho (IndexedDB).
 */
export function temGravacao(): boolean {
  return typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia && typeof MediaRecorder !== 'undefined';
}

export async function gravar(ms: number, aoNivel?: (n: number) => void): Promise<Blob> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const rec = new MediaRecorder(stream);
  const partes: Blob[] = [];
  rec.ondataavailable = (e) => partes.push(e.data);
  let raf = 0;
  try {
    const ctx = new AudioContext();
    const an = ctx.createAnalyser();
    ctx.createMediaStreamSource(stream).connect(an);
    const buf = new Uint8Array(an.fftSize);
    const loop = () => {
      an.getByteTimeDomainData(buf);
      let s = 0;
      for (const v of buf) s += Math.abs(v - 128);
      aoNivel?.(Math.min(1, s / buf.length / 30));
      raf = requestAnimationFrame(loop);
    };
    loop();
  } catch { /* sem medidor */ }
  return new Promise((resolve) => {
    rec.onstop = () => {
      cancelAnimationFrame(raf);
      stream.getTracks().forEach((t) => t.stop());
      resolve(new Blob(partes, { type: rec.mimeType || 'audio/webm' }));
    };
    rec.start();
    setTimeout(() => rec.state !== 'inactive' && rec.stop(), ms);
  });
}

type SR = { lang: string; interimResults: boolean; maxAlternatives: number; start(): void; stop(): void; onresult: ((e: any) => void) | null; onerror: ((e: any) => void) | null; onend: (() => void) | null };

export function temReconhecimento(): boolean {
  return typeof window !== 'undefined' && !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
}

/** Escuta até `ms` e devolve o que ouviu (ou null). Só no aparelho quando o navegador permitir. */
export function escutar(ms = 4000): Promise<string | null> {
  const C = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  if (!C) return Promise.resolve(null);
  return new Promise((resolve) => {
    const r: SR = new C();
    r.lang = 'pt-BR';
    r.interimResults = false;
    r.maxAlternatives = 3;
    let texto: string | null = null;
    r.onresult = (e: any) => { texto = Array.from(e.results[0] as ArrayLike<any>).map((a: any) => a.transcript).join(' | '); };
    r.onerror = () => resolve(null);
    r.onend = () => resolve(texto);
    try { r.start(); } catch { resolve(null); }
    setTimeout(() => { try { r.stop(); } catch { /* já parou */ } }, ms);
  });
}
