import { useEffect, useRef, useState } from 'react';
import { som } from '@fonema/conteudo';
import { asset } from '../servicos/ambiente.ts';

/**
 * Espelho do Som (D020): boca da Sofia/Tales DE FRENTE + RAIO-X DE LADO.
 * Integra a demo de docs/propostas/06-fonema-unificada/espelho-do-som-3d (copiada para ./espelho/ no build)
 * por meio de ./espelho-embed.html. Sem a demo, usa as imagens (placeholder).
 * P8-b: na lição, só frente + lado; "dentro da boca" e 360° ficam em "Conheça seu corpo".
 */
const QUADROS_SOFIA = ['A', 'CH', 'E', 'F', 'L', 'M', 'O', 'S'];
const QUADROS_TALES = ['A', 'E', 'I', 'M', 'O', 'U'];
const QUADRO_DO_FONEMA: Record<string, string> = { a: 'A', 'a~': 'A', E: 'E', e: 'E', 'e~': 'E', i: 'I', 'i~': 'I', O: 'O', o: 'O', 'o~': 'O', u: 'U', 'u~': 'U', m: 'M', p: 'M', b: 'M', f: 'F', v: 'F', l: 'L', lh: 'L', s: 'S', z: 'S', t: 'S', d: 'S', n: 'S', x: 'CH', j: 'CH' };

export function quadroFrente(fonema: string): { quem: 'sofia' | 'tales'; q: string } {
  const q = QUADRO_DO_FONEMA[fonema] ?? som(fonema).bocaFrente;
  if (QUADROS_SOFIA.includes(q)) return { quem: 'sofia', q };
  if (QUADROS_TALES.includes(q)) return { quem: 'tales', q };
  return { quem: 'sofia', q: som(fonema).bocaFrente };
}

let disponivel: Promise<boolean> | null = null;
export function espelhoDisponivel(): Promise<boolean> {
  disponivel ??= fetch('./espelho/espelho.js', { method: 'GET', cache: 'no-store' }).then((r) => r.ok && !(r.headers.get('content-type') ?? '').includes('text/html')).catch(() => false);
  return disponivel;
}

export interface ApiEspelho { fonema(f: string): void; modo(m: string): void; lento?(v: boolean): void; girar?(v: boolean): void; rotulos?(v: boolean): void }

export function EspelhoLado({ fonema, modo = 'lado', rotulos = false, aoPronto }: { fonema: string; modo?: string; rotulos?: boolean; aoPronto?: (api: ApiEspelho | null) => void }) {
  const [ok, setOk] = useState<boolean | null>(null);
  const ref = useRef<HTMLIFrameElement>(null);
  const [src] = useState(() => `./espelho-embed.html?f=${encodeURIComponent(fonema)}&m=${modo}&rot=${rotulos ? 1 : 0}`);
  useEffect(() => { espelhoDisponivel().then(setOk); }, []);
  useEffect(() => {
    const f = (e: MessageEvent) => {
      if (e.data?.tipo === 'espelho:pronto' && ref.current && e.source === ref.current.contentWindow) aoPronto?.((ref.current.contentWindow as any).esp ?? null);
    };
    window.addEventListener('message', f);
    return () => window.removeEventListener('message', f);
  }, [aoPronto]);
  useEffect(() => {
    const api = (ref.current?.contentWindow as any)?.esp as ApiEspelho | undefined;
    api?.fonema(fonema);
  }, [fonema]);
  useEffect(() => {
    const api = (ref.current?.contentWindow as any)?.esp as ApiEspelho | undefined;
    api?.modo(modo);
  }, [modo]);
  if (ok === null) return <div className="espelho-lado carregando-esp" />;
  if (!ok) {
    return (
      <figure className="espelho-lado espelho-placeholder">
        <img src={asset('fundos/raio-x-partes.webp')} alt="Raio-X de lado da boca: lábios, dentes, língua, céu da boca, nariz e garganta" />
        <figcaption>Raio-X de lado (imagem provisória)</figcaption>
      </figure>
    );
  }
  return <iframe ref={ref} className="espelho-lado" src={src} title="Espelho do Som: raio-X de lado" allow="autoplay" />;
}

export function EspelhoFrente({ fonema, falando }: { fonema: string; falando: boolean }) {
  const { quem, q } = quadroFrente(fonema);
  const [src, setSrc] = useState(`./espelho/recortes/rosto-${quem}-${q}.jpg`);
  useEffect(() => setSrc(`./espelho/recortes/rosto-${quem}-${q}.jpg`), [quem, q]);
  return (
    <figure className={`espelho-frente ${falando ? 'falando' : ''}`}>
      <img src={src} alt={`Boca ${quem === 'sofia' ? 'da Sofia' : 'do Tales'} fazendo o som`} onError={() => setSrc(asset(`dupla/${quem}-busto-alegre.webp`))} />
      <figcaption>{quem === 'sofia' ? 'Sofia' : 'Tales'} de frente</figcaption>
    </figure>
  );
}
