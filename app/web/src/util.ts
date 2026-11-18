import { nomeDoPersonagem, type Fala } from '@fonema/conteudo';
import { generoDaFala, renderFala, type Crianca } from '@fonema/motor';
import { voz } from './servicos/voz.ts';

/** Texto na tela usa o nome ESCRITO; a voz usa a PRONÚNCIA escolhida pelo adulto (D013). */
export function textoTela(t: string, c?: Crianca, extras?: Record<string, string | number>): string {
  return renderFala(t, { nome: c?.nome ?? 'você', genero: generoDaFala(c), extras });
}
export function textoVoz(t: string, c?: Crianca, extras?: Record<string, string | number>): string {
  return renderFala(t, { nome: c?.pronuncia.fala ?? c?.nome ?? 'você', genero: generoDaFala(c), extras });
}
export function falar(f: Fala | string, c?: Crianca, extras?: Record<string, string | number>): Promise<void> {
  const fala = typeof f === 'string' ? { quem: 'sofia' as const, texto: f } : f;
  return voz.falar(textoVoz(fala.texto, c, extras), { quem: fala.quem });
}
export function falarVarias(fs: Fala[], c?: Crianca, aoMudar?: (i: number) => void): Promise<void> {
  return voz.sequencia(fs.map((f) => ({ quem: f.quem, texto: textoVoz(f.texto, c) })), aoMudar);
}
/** Nome de cada personagem (vem de conteudo/personagens.ts: o administrador pode mudar no gerenciador). */
export const NOMES_PERSONAGEM: Record<string, string> = new Proxy({} as Record<string, string>, {
  get: (_, k) => (typeof k === 'string' ? nomeDoPersonagem(k) : undefined)
});
export function ehDeterminista<T>(arr: T[], semente: number): T[] {
  const a = [...arr];
  let s = semente || 1;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Revisão 18/11 (item 11): a criança não lê símbolos de fonética. Nos títulos mostrados na tela da criança, "/a/" vira
 * "do A" ("O som /a/" → "O som do A"; "Qual letra faz /fff/?" → "Qual letra faz o som do F?"). A VOZ continua usando o
 * texto original (os clipes gravados são achados pelo texto).
 */
const LETRA_DO_SOM: Record<string, string> = { k: 'C', ss: 'S', rr: 'RR' };
export function semFonetica(t: string): string {
  if (!t || !t.includes('/')) return t;
  const letra = (som: string) => {
    const s = som.toLowerCase().replace(/(.)\1+/g, '$1');
    return LETRA_DO_SOM[s] ?? s.toUpperCase();
  };
  return t
    .replace(/\bfaz \/([^/\s]{1,4})\//gi, (_, s) => `faz o som do ${letra(s)}`)
    .replace(/\b(som|sons) \/([^/\s]{1,4})\/ e \/([^/\s]{1,4})\//gi, (_, p, a, b) => `${p} do ${letra(a)} e do ${letra(b)}`)
    .replace(/\b(som|Som) \/([^/\s]{1,4})\//g, (_, p, s) => `${p} do ${letra(s)}`)
    .replace(/: \/([^/\s]{1,4})\//g, (_, s) => `: ${letra(s)}`)
    .replace(/\/([^/\s]{1,4})\//g, (_, s) => letra(s));
}
