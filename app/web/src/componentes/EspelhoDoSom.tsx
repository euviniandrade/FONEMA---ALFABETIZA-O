import { useEffect, useRef, useState } from 'react';
import { asset } from '../servicos/ambiente.ts';

/**
 * Espelho do Som (D020) dentro do app.
 *
 * VISTA PADRÃO: a boca DE FRENTE ("Boca gigante"). O raio-X escuro antigo saiu (reprovado pelo dono).
 *
 * 1) Com o componente novo (docs/.../espelho-do-som-3d/embed.html, copiado para ./espelho/ no build): iframe
 *    `./espelho/embed.html?f=<fonema>&vista=frente&quem=sofia&compacto=1`, com as abas "De frente / De lado"
 *    (lado = perfil 3D da Sofia ou do Tales). O app troca o som por postMessage `{ tipo: 'espelho:fonema', f }`.
 *    A VOZ continua vindo do app (mp3 oficiais), então o embed não toca nada sozinho.
 * 2) Sem o embed (pasta ausente): as bocas ilustradas por visema de public/assets/espelho/frente-*.webp.
 *
 * PONTO DE TROCA: `USAR_EMBED_NOVO` (desligue para voltar às imagens) e a URL em `urlEmbed`.
 */
export const USAR_EMBED_NOVO = true;
const urlEmbed = (fonema: string) => `./espelho/embed.html?f=${encodeURIComponent(fonema)}&vista=frente&quem=sofia&compacto=1&audioBase=${encodeURIComponent('../audio/falas/')}`;

let embed: Promise<boolean> | null = null;
/** O embed novo foi copiado para ./espelho/? (servidores de SPA devolvem o index do app para caminhos inexistentes.) */
export function espelhoEmbedDisponivel(): Promise<boolean> {
  if (!USAR_EMBED_NOVO) return Promise.resolve(false);
  embed ??= fetch('./espelho/embed.html', { cache: 'no-store' }).then(async (r) => r.ok && !(await r.text()).includes('id="raiz"')).catch(() => false);
  return embed;
}
export function useEspelhoEmbed(): boolean | null {
  const [ok, setOk] = useState<boolean | null>(USAR_EMBED_NOVO ? null : false);
  useEffect(() => { espelhoEmbedDisponivel().then(setOk); }, []);
  return ok;
}

export type Visema = 'boca-vazia' | 'u' | 'o' | 'm' | 'f' | 'i';
const VISEMA_DO_FONEMA: Record<string, Visema> = {
  a: 'boca-vazia', 'a~': 'boca-vazia', l: 'boca-vazia', lh: 'boca-vazia', r: 'boca-vazia', rr: 'boca-vazia', k: 'boca-vazia', g: 'boca-vazia',
  u: 'u', 'u~': 'u', x: 'u', j: 'u',
  O: 'o', o: 'o', 'o~': 'o',
  m: 'm', p: 'm', b: 'm',
  f: 'f', v: 'f',
  i: 'i', 'i~': 'i', E: 'i', e: 'i', 'e~': 'i', s: 'i', z: 'i', t: 'i', d: 'i', n: 'i'
};
export const visemaDe = (fonema: string): Visema => VISEMA_DO_FONEMA[fonema] ?? VISEMA_DO_FONEMA[fonema.toLowerCase()] ?? 'boca-vazia';

const DESCRICAO: Record<Visema, string> = {
  'boca-vazia': 'boca bem aberta', u: 'biquinho', o: 'boca redonda', m: 'lábios fechados', f: 'dentes de cima no lábio de baixo', i: 'sorriso com os dentes juntinhos'
};

/** Boca gigante de frente (e de lado, no embed), pelo som. `falando` dá o destaque enquanto a voz faz o som. */
export function EspelhoBoca({ fonema, falando = false }: { fonema: string; falando?: boolean }) {
  const v = visemaDe(fonema);
  const embedOk = useEspelhoEmbed();
  const quadro = useRef<HTMLIFrameElement>(null);
  const [src] = useState(() => urlEmbed(fonema));
  useEffect(() => {
    quadro.current?.contentWindow?.postMessage({ tipo: 'espelho:fonema', f: fonema }, '*');
  }, [fonema]);
  if (embedOk === null) return <figure className="espelho-boca carregando-esp" />;
  if (embedOk) {
    return (
      <figure className={`espelho-boca espelho-embed ${falando ? 'falando' : ''}`}>
        <iframe ref={quadro} src={src} title="Espelho do Som: a boca de frente e de lado" allow="autoplay" onLoad={() => quadro.current?.contentWindow?.postMessage({ tipo: 'espelho:fonema', f: fonema }, '*')} />
      </figure>
    );
  }
  return (
    <figure className={`espelho-boca ${falando ? 'falando' : ''}`} data-visema={v}>
      <img key={v} src={asset(`espelho/frente-${v}.webp`)} alt={`A Sofia e o Tales mostram a boca fazendo o som: ${DESCRICAO[v]}`} />
    </figure>
  );
}
