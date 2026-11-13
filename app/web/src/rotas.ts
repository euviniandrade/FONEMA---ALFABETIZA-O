/** Roteamento por hash (#/c/123/vila): funciona em qualquer subcaminho de site estático e offline. */
import { useEffect, useState } from 'react';

export function lerRota(): string[] {
  return (location.hash.replace(/^#\/?/, '') || '').split('/').filter(Boolean).map(decodeURIComponent);
}

export function navegar(caminho: string) {
  const alvo = '#/' + caminho.replace(/^\/+/, '');
  if (location.hash !== alvo) location.hash = alvo;
  else window.dispatchEvent(new HashChangeEvent('hashchange'));
}

export function useRota(): string[] {
  const [r, setR] = useState(lerRota);
  useEffect(() => {
    const f = () => {
      setR(lerRota());
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', f);
    return () => window.removeEventListener('hashchange', f);
  }, []);
  return r;
}
