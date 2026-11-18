/** Roteamento por hash (#/c/123/vila): funciona em qualquer subcaminho de site estático e offline. */
import { useEffect, useState } from 'react';
import { voz } from './servicos/voz.ts';

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
    voz.novaAtividade();
    let antes = location.hash;
    const f = () => {
      // trocou de tela: a fala da tela anterior (e a fila dela) é cancelada antes de a nova tela começar a falar
      // fila nº 27 (2): tela nova = atividade nova (o nome da criança pode ser dito uma vez, no começo)
      if (location.hash !== antes) { antes = location.hash; voz.parar(); voz.novaAtividade(); }
      setR(lerRota());
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', f);
    return () => window.removeEventListener('hashchange', f);
  }, []);
  return r;
}
