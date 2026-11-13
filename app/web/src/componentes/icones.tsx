/** Ícones desenhados em SVG (traço arredondado, 2 cores no máximo — D009), consistentes em todo o app. */
import type { SVGProps } from 'react';

type P = SVGProps<SVGSVGElement> & { tamanho?: number };
const base = ({ tamanho = 28, ...p }: P) => ({ width: tamanho, height: tamanho, viewBox: '0 0 32 32', fill: 'none', stroke: 'currentColor', strokeWidth: 2.6, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true, ...p });

export const IcSom = (p: P & { ligado?: boolean }) => (
  <svg {...base(p)}>
    <path d="M5 12.5h5l6-5v17l-6-5H5z" fill="currentColor" stroke="none" />
    {p.ligado !== false ? <><path d="M20.5 11.5a6 6 0 0 1 0 9" /><path d="M24 8a11 11 0 0 1 0 16" /></> : <path d="M21 12l7 8M28 12l-7 8" />}
  </svg>
);
export const IcContraste = (p: P) => (
  <svg {...base(p)}><circle cx="16" cy="16" r="11" /><path d="M16 5a11 11 0 0 1 0 22z" fill="currentColor" stroke="none" /></svg>
);
export const IcMovimento = (p: P & { reduzido?: boolean }) => (
  <svg {...base(p)}>
    <path d="M6 20c2-6 6-9 10-9s8 3 10 9" /><path d="M4 20h24" /><circle cx="24.5" cy="12.5" r="2.4" fill="currentColor" stroke="none" />
    <path d="M10 20v3M22 20v3" />
  </svg>
);
export const IcVoltar = (p: P) => (<svg {...base(p)}><path d="M19 7l-9 9 9 9" /></svg>);
export const IcCadeado = (p: P) => (<svg {...base(p)}><rect x="7" y="14" width="18" height="13" rx="3.5" /><path d="M11 14v-3.5a5 5 0 0 1 10 0V14" /><circle cx="16" cy="20.5" r="1.6" fill="currentColor" stroke="none" /></svg>);
export const IcMusica = (p: P & { ligado?: boolean }) => (
  <svg {...base(p)}><path d="M12 23V8l13-3v15" /><circle cx="9" cy="23" r="3.2" fill="currentColor" stroke="none" /><circle cx="22" cy="20" r="3.2" fill="currentColor" stroke="none" />{p.ligado === false ? <path d="M5 5l22 22" /> : null}</svg>
);
export const IcSeta = (p: P) => (<svg {...base(p)}><path d="M7 16h17M17 9l7 7-7 7" /></svg>);
export const IcMais = (p: P) => (<svg {...base(p)}><path d="M16 7v18M7 16h18" /></svg>);
export const IcEstrela = (p: P) => (<svg {...base(p)}><path d="M16 4l3.6 7.4 8.1 1.2-5.9 5.7 1.4 8.1L16 22.6l-7.2 3.8 1.4-8.1-5.9-5.7 8.1-1.2z" fill="currentColor" /></svg>);
export const IcPessoa = (p: P) => (<svg {...base(p)}><circle cx="16" cy="11" r="5" /><path d="M6 27c1.5-5.5 5.5-8 10-8s8.5 2.5 10 8" /></svg>);
