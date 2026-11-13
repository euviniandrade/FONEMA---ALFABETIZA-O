import type { Fala } from '@fonema/conteudo';
import { renderFala, type Crianca } from '@fonema/motor';
import { voz } from './servicos/voz.ts';

/** Texto na tela usa o nome ESCRITO; a voz usa a PRONÚNCIA escolhida pelo adulto (D013). */
export function textoTela(t: string, c?: Crianca, extras?: Record<string, string | number>): string {
  return renderFala(t, { nome: c?.nome ?? 'você', genero: c?.genero ?? 'n', extras });
}
export function textoVoz(t: string, c?: Crianca, extras?: Record<string, string | number>): string {
  return renderFala(t, { nome: c?.pronuncia.fala ?? c?.nome ?? 'você', genero: c?.genero ?? 'n', extras });
}
export function falar(f: Fala | string, c?: Crianca, extras?: Record<string, string | number>): Promise<void> {
  const fala = typeof f === 'string' ? { quem: 'sofia' as const, texto: f } : f;
  return voz.falar(textoVoz(fala.texto, c, extras), { quem: fala.quem });
}
export function falarVarias(fs: Fala[], c?: Crianca, aoMudar?: (i: number) => void): Promise<void> {
  return voz.sequencia(fs.map((f) => ({ quem: f.quem, texto: textoVoz(f.texto, c) })), aoMudar);
}
export const NOMES_PERSONAGEM: Record<string, string> = {
  sofia: 'Sofia', tales: 'Tales', bolota: 'Bolota', 'dona-cida': 'Dona Cida', davi: 'Davi', 'guarda-parque': 'Guarda-parque', pescadora: 'Pescadora', 'zum-zum': 'Zum-Zum'
};
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
