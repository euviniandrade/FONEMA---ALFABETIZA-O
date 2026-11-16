import { useEffect, useState } from 'react';

/** Quanto silêncio (sem fala nem som novo) basta para soltar um botão de avanço que esperava a voz. */
export const SILENCIO_PARA_SOLTAR_MS = 6000;

/**
 * Rede de segurança dos botões de AVANÇO ("Já conheci!", "Eu fiz o som!", "Continuar", "Minha vez!"):
 * enquanto `travado` for verdadeiro, observa a voz; se ninguém falar nem tocar som por `silencioMs`
 * (além da duração do clipe que estiver tocando), devolve true e a tela libera o botão.
 * A voz já não trava sozinha (servicos/midia.ts); isto cobre qualquer outro caminho que esqueça de liberar.
 */
export function useDestravar(travado: boolean, silencioMs = SILENCIO_PARA_SOLTAR_MS): boolean {
  const [solto, setSolto] = useState(false);
  useEffect(() => {
    if (!travado) return;
    let t = setTimeout(() => setSolto(true), silencioMs);
    const mexeu = (e: Event) => {
      clearTimeout(t);
      const audio = (e as CustomEvent<{ audio?: HTMLMediaElement }>).detail?.audio;
      const d = audio && Number.isFinite(audio.duration) ? audio.duration * 1000 : 0;
      t = setTimeout(() => setSolto(true), silencioMs + d);
    };
    const tipos = ['fonema:fala', 'fonema:fala-fim', 'fonema:som', 'fonema:som-fim'];
    tipos.forEach((n) => window.addEventListener(n, mexeu));
    return () => {
      clearTimeout(t);
      tipos.forEach((n) => window.removeEventListener(n, mexeu));
      setSolto(false);
    };
  }, [travado, silencioMs]);
  return travado && solto;
}
