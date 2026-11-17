import { useEffect, useRef, useState } from 'react';

/**
 * BOQUINHA (D033, fichas de leitura): a vista DE FRENTE do Espelho do Som, simplificada, pequena o bastante para ficar em
 * cima de cada letra. É o mesmo desenho da reserva 2D do Espelho 3D (public/espelho/reserva2d.js) e a mesma tabela de poses
 * (public/espelho/fonemas.js, vinda de docs/propostas/06-fonema-unificada/espelho-do-som-3d-v3): abertura da mandíbula, lábios
 * (abertura, largura, biquinho, lábio de baixo nos dentes) e a ponta da língua. Um teste confere que os números daqui são os
 * mesmos de lá (web/src/componentes/boquinha.test.ts).
 *
 * Por que não o 3D em cada letra: seriam até 8 cenas WebGL na mesma tela (pesado no celular). O desenho em SVG é leve, nítido
 * em qualquer tamanho e respeita "menos movimento" (troca de pose sem animar).
 * Posições simplificadas: validar com fonoaudióloga (como o próprio Espelho).
 */
export interface PoseBoca { jaw: number; ab: number; lg: number; arr: number; ld: number; ponta: number }

const P = (jaw: number, ab: number, lg: number, arr: number, ld: number, ponta: number): PoseBoca => ({ jaw, ab, lg, arr, ld, ponta });
/** Pose de cada som (fonema do mapa de sons): jaw, lab.ab, lab.lg, lab.arr, lab.ld e a altura da ponta da língua (lin[0][1]). */
export const POSES: Record<string, PoseBoca> = {
  a: P(13, 1.3, 1.08, 0, 0, -0.46), E: P(8, 1.05, 1.14, 0, 0, -0.44), e: P(5, 0.85, 1.18, 0, 0, -0.44), i: P(2.5, 0.75, 1.34, 0, 0, -0.44),
  O: P(10, 0.95, 0.72, 0.55, 0, -0.4), o: P(6.5, 0.62, 0.56, 0.85, 0, -0.4), u: P(6.5, 0.36, 0.4, 1, 0, -0.4),
  p: P(1, 0, 1, 0, 0, -0.42), b: P(1, 0, 1, 0, 0, -0.42), m: P(1, 0, 1, 0, 0, -0.42),
  f: P(1.5, 0.16, 1.06, 0, 1, -0.42), v: P(1.5, 0.16, 1.06, 0, 1, -0.42),
  t: P(3, 0.6, 1.1, 0, 0, 0.5), d: P(3, 0.6, 1.1, 0, 0, 0.5), n: P(3, 0.6, 1.1, 0, 0, 0.5), l: P(8, 1.0, 1.06, 0, 0, 0.5), r: P(5, 0.7, 1.06, 0, 0, 0.1),
  s: P(1.2, 0.7, 1.24, 0, 0, 0.3), z: P(1.2, 0.7, 1.24, 0, 0, 0.3), x: P(1.5, 0.5, 0.66, 0.8, 0, 0.42), j: P(1.5, 0.5, 0.66, 0.8, 0, 0.42),
  k: P(6, 0.8, 1.05, 0, 0, -0.68), g: P(6, 0.8, 1.05, 0, 0, -0.68), rr: P(7, 0.9, 1.05, 0, 0, -0.72)
};
// vogais nasais: a mesma boca da oral (o véu desce por dentro; de frente não muda)
for (const v of ['a', 'e', 'i', 'o', 'u']) POSES[`${v}~`] = POSES[v];
/** Boca em repouso (fechadinha, quase sorrindo): antes e depois de cada som no nível 1. */
export const REPOUSO: PoseBoca = P(2, 0.1, 1.0, 0, 0, -0.42);
const ESTOURO = new Set(['p', 'b', 't', 'd', 'k', 'g']);

const misturar = (a: PoseBoca, b: PoseBoca, t: number): PoseBoca =>
  ({ jaw: a.jaw + (b.jaw - a.jaw) * t, ab: a.ab + (b.ab - a.ab) * t, lg: a.lg + (b.lg - a.lg) * t, arr: a.arr + (b.arr - a.arr) * t, ld: a.ld + (b.ld - a.ld) * t, ponta: a.ponta + (b.ponta - a.ponta) * t });
const menosMovimento = () => typeof document !== 'undefined' && document.documentElement.classList.contains('menos-movimento');

/** Persegue a pose-alvo suavemente (≈ 90 ms); com "menos movimento", troca na hora. */
function usePose(alvo: PoseBoca): PoseBoca {
  const [p, setP] = useState(alvo);
  const atual = useRef(alvo);
  useEffect(() => {
    if (menosMovimento()) { atual.current = alvo; setP(alvo); return; }
    let raf = 0;
    let antes = performance.now();
    const passo = (agora: number) => {
      const t = 1 - Math.exp(-(agora - antes) / 70);
      antes = agora;
      const novo = misturar(atual.current, alvo, t);
      atual.current = novo;
      setP(novo);
      const longe = Math.abs(novo.jaw - alvo.jaw) + Math.abs(novo.ab - alvo.ab) + Math.abs(novo.lg - alvo.lg) + Math.abs(novo.ld - alvo.ld) + Math.abs(novo.ponta - alvo.ponta);
      if (longe > 0.01) raf = requestAnimationFrame(passo);
      else { atual.current = alvo; setP(alvo); }
    };
    raf = requestAnimationFrame(passo);
    return () => cancelAnimationFrame(raf);
  }, [alvo]);
  return p;
}

const f = (n: number) => n.toFixed(3);

/** O desenho (coordenadas do Espelho: origem no meio da boca, y para cima; o SVG vira o eixo). */
function Desenho({ p, id }: { p: PoseBoca; id: string }) {
  const ld = Math.min(1, Math.max(0, p.ld));
  const hu = p.ab * 0.4 * (1 - ld) + 0.36 * ld;
  const hl = p.ab * 0.6 * (1 - ld) + 0.03 * ld;
  const w = Math.max(0.25, p.lg);
  const tu = 0.42 * (1 + 0.3 * p.arr);
  const tl = 0.56 * (1 + 0.3 * p.arr);
  const jd = 5.4 * Math.sin((p.jaw * Math.PI) / 180);
  // y para baixo no SVG: Y = -y
  const labios = `M${f(-w - 0.12)} 0 C${f(-w * 0.4)} ${f(-(hu + tu * 1.5))} ${f(w * 0.4)} ${f(-(hu + tu * 1.5))} ${f(w + 0.12)} 0 C${f(w * 0.5)} ${f(hl + tl * 1.6)} ${f(-w * 0.5)} ${f(hl + tl * 1.6)} ${f(-w - 0.12)} 0Z`;
  const boca = `M${f(-w)} 0 Q0 ${f(-hu * 2)} ${f(w)} 0 Q0 ${f(hl * 2)} ${f(-w)} 0Z`;
  // a ponta da língua só aparece quando há espaço entre os dentes (T, D, N, L, R); no S e no Z os dentes ficam juntinhos
  const pontaEmCima = p.ponta > 0.2 && p.jaw >= 2.5;
  // ponta da língua em cima (T, D, N, L, S…): uma coluna rosa do chão da boca até atrás dos dentes de cima, bem visível
  const fundo = Math.max(0.3, hl * 1.6);
  const lingua = pontaEmCima
    ? { cy: (fundo - 0.12) / 2, rx: Math.min(w * 0.34, 0.4), ry: Math.max(0.24, (fundo + 0.12) / 2) }
    : { cy: hl + 0.1, rx: w * 0.8, ry: 0.5 };
  return (
    <g>
      <defs>
        <radialGradient id={`pele-${id}`} cx="40%" cy="22%" r="85%">
          <stop offset="0" stopColor="#E3B08A" /><stop offset=".55" stopColor="#C98F66" /><stop offset="1" stopColor="#A8704C" />
        </radialGradient>
        <linearGradient id={`labio-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#E06A7C" /><stop offset="1" stopColor="#B8404F" />
        </linearGradient>
        <clipPath id={`boca-${id}`}><path d={boca} /></clipPath>
      </defs>
      <ellipse cx="0" cy="-1.6" rx="4.9" ry="5.4" fill={`url(#pele-${id})`} />
      {[-1, 1].map((d) => <ellipse key={d} cx={d * 2.55} cy="-0.75" rx="0.95" ry="0.7" fill="rgba(232,110,110,.32)" />)}
      {/* nariz: a pontinha e as narinas */}
      <ellipse cx="0" cy="-1.95" rx="0.78" ry="0.5" fill="#B87A54" opacity=".55" />
      {[-1, 1].map((d) => <ellipse key={d} cx={d * 0.32} cy="-1.72" rx="0.17" ry="0.11" fill="#6E3B26" opacity=".6" />)}
      <path d={labios} fill={`url(#labio-${id})`} />
      <g clipPath={`url(#boca-${id})`}>
        <rect x="-3" y="-3" width="6" height="6" fill="#5A1428" />
        {pontaEmCima ? null : <ellipse cx="0" cy={f(lingua.cy)} rx={f(lingua.rx)} ry={f(lingua.ry)} fill="#F2607C" />}
        <rect x="-1.3" y={f(0.02 + jd)} width="2.6" height="0.6" rx="0.18" fill="#FFFDF6" />
        {pontaEmCima ? <ellipse cx="0" cy={f(lingua.cy)} rx={f(lingua.rx)} ry={f(lingua.ry)} fill="#F2607C" stroke="#B8304F" strokeWidth=".07" /> : null}
        <rect x="-1.5" y="-0.65" width="3" height="0.7" rx="0.18" fill="#FFFDF6" />
      </g>
      {/* F e V: os dentes de cima pousam no lábio de baixo */}
      {ld > 0.5 ? <rect x="-0.95" y="-0.08" width="1.9" height="0.36" rx="0.1" fill="#FFFDF6" stroke="#E7DCCB" strokeWidth=".04" opacity={ld} /> : null}
      {/* lábios fechados (P, B, M): a linha onde um lábio encosta no outro */}
      {p.ab < 0.12 && ld < 0.5 ? <path d={`M${f(-w - 0.05)} 0 Q0 0.12 ${f(w + 0.05)} 0`} fill="none" stroke="#7A2236" strokeWidth=".09" strokeLinecap="round" opacity={f(1 - p.ab / 0.12)} /> : null}
      <path d={labios} fill="none" stroke="#9C3344" strokeWidth=".05" opacity=".45" />
      <ellipse cx={f(-w * 0.35)} cy={f(-(hu + tu * 1.1))} rx={f(w * 0.22)} ry="0.07" fill="#fff" opacity=".35" />
    </g>
  );
}

let contador = 0;

/**
 * Uma boquinha. `fonema` = chave do mapa de sons (a, m, p, rr, a~…). `falando`: a boca faz o som agora (nos sons de estouro,
 * fecha e solta). `fixa`: mostra a pose do som o tempo todo (níveis 3 e 4, sem som); senão fica em repouso até falar.
 */
export function Boquinha({ fonema, falando = false, fixa = false, destaque = false, tamanho, className = '', rotulo }: {
  fonema: string | null; falando?: boolean; fixa?: boolean; destaque?: boolean; tamanho?: number; className?: string; rotulo?: string;
}) {
  const [id] = useState(() => `bq${++contador}`);
  const pose = fonema ? POSES[fonema] ?? REPOUSO : REPOUSO;
  const [solto, setSolto] = useState(false);
  useEffect(() => {
    setSolto(false);
    if (!falando || !fonema || !ESTOURO.has(fonema)) return;
    const t = setTimeout(() => setSolto(true), 170);
    return () => clearTimeout(t);
  }, [falando, fonema]);
  const alvo = !fonema ? REPOUSO : falando ? (solto ? misturar(pose, POSES.a, 0.45) : pose) : fixa ? pose : REPOUSO;
  // o objeto da pose-alvo muda só quando muda de verdade (senão o efeito recomeçaria a cada render)
  const chave = `${fonema}|${falando}|${solto}|${fixa}`;
  const alvoEstavel = useEstavel(alvo, chave);
  const p = usePose(alvoEstavel);
  return (
    <span className={`boquinha ${falando ? 'falando' : ''} ${destaque ? 'destaque' : ''} ${fonema ? '' : 'calada'} ${className}`} style={tamanho ? { width: tamanho, height: tamanho } : undefined}
      role={rotulo ? 'img' : undefined} aria-label={rotulo} aria-hidden={rotulo ? undefined : true} data-fonema={fonema ?? ''}>
      <svg viewBox="-2.15 -2.05 4.3 4.3" preserveAspectRatio="xMidYMid slice"><Desenho p={p} id={id} /></svg>
    </span>
  );
}

function useEstavel<T>(valor: T, chave: string): T {
  const ref = useRef<{ chave: string; valor: T }>({ chave, valor });
  if (ref.current.chave !== chave) ref.current = { chave, valor };
  return ref.current.valor;
}
