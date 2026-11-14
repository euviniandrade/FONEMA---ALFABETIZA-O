/**
 * Camada flutuante (painéis e diálogos): sempre POR CIMA de tudo.
 * É desenhada direto no <body> (portal), fora de qualquer cartão/cabeçalho, com z-index --z-camada;
 * por isso nunca fica atrás do conteúdo da tela. Fundo escurecido clicável, tecla Esc e foco preso.
 */
import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Icone } from './ui.tsx';

const FOCAVEIS = 'button:not([disabled]),[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),summary,[tabindex]:not([tabindex="-1"])';

export function Camada({ titulo, aoFechar, children, posicao = 'centro', testId, className = '' }: { titulo: string; aoFechar: () => void; children: ReactNode; posicao?: 'centro' | 'canto'; testId?: string; className?: string }) {
  const caixa = useRef<HTMLDivElement>(null);
  const fechar = useRef(aoFechar);
  fechar.current = aoFechar;
  useEffect(() => {
    const antes = document.activeElement as HTMLElement | null;
    const el = caixa.current!;
    (el.querySelector<HTMLElement>('[data-foco-inicial]') ?? el.querySelector<HTMLElement>(FOCAVEIS) ?? el).focus();
    const tecla = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.stopPropagation(); fechar.current(); return; }
      if (e.key !== 'Tab') return;
      const f = [...el.querySelectorAll<HTMLElement>(FOCAVEIS)].filter((x) => x.offsetParent !== null);
      if (!f.length) { e.preventDefault(); return; }
      const primeiro = f[0], ultimo = f[f.length - 1];
      const fora = !el.contains(document.activeElement);
      if (e.shiftKey && (document.activeElement === primeiro || fora)) { e.preventDefault(); ultimo.focus(); }
      else if (!e.shiftKey && (document.activeElement === ultimo || fora)) { e.preventDefault(); primeiro.focus(); }
    };
    document.addEventListener('keydown', tecla, true);
    return () => { document.removeEventListener('keydown', tecla, true); antes?.focus?.(); };
  }, []);
  return createPortal(
    <div className={`camada camada-${posicao} ${className}`} data-testid={testId}>
      <div className="camada-veu" onClick={aoFechar} data-testid="camada-veu" aria-hidden="true" />
      <div className="camada-caixa" role="dialog" aria-modal="true" aria-label={titulo} ref={caixa} tabIndex={-1}>
        <header className="camada-cab">
          <h2 className="t">{titulo}</h2>
          <button className="camada-x" onClick={aoFechar} aria-label="Fechar" data-testid="camada-fechar"><Icone nome="x" /></button>
        </header>
        <div className="camada-corpo">{children}</div>
      </div>
    </div>,
    document.body
  );
}
