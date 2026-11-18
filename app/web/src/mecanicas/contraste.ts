import { FALAS_DOS_PARES, FALAS_FONICAS, FALA_ESPELHO_BD, contrasteDosSons, surdoESonoro, type Contraste } from '@fonema/conteudo';
import { espera } from '../servicos/ambiente.ts';
import { voz } from '../servicos/voz.ts';

const F = FALAS_FONICAS;
const sofia = (texto: string) => voz.falar(texto, { quem: 'sofia' });

/**
 * Respiro entre dois sons comparados na correção ("este é /e/… e este é /b/"): longo o bastante para a criança
 * ouvir que são DOIS sons separados (revisão 18/11, item 1).
 */
export const PAUSA_ENTRE_SONS_MS = 450;

/** Há frase completa para este par (p/b, t/d, f/v, s/z, m/n)? */
export const temFrasesDoPar = (a: string, b: string) => !!FALAS_DOS_PARES[a] && !!FALAS_DOS_PARES[b] && !!contrasteDosSons(a, b);

/**
 * Diz O QUE MUDA entre dois sons parecidos (parte do meio da correção contrastiva), tocando o som de cada um:
 * com frase completa para os pares mais comuns ("O P não tem voz:" + som; "O B tem voz:" + som), genérica para os
 * outros pares de voz ("Este não tem voz:"), e a dica de boca ou de desenho quando é o caso.
 */
export async function explicarContraste(a: string, b: string, contraste: Contraste | undefined = contrasteDosSons(a, b)): Promise<void> {
  if (contraste === 'desenho') {
    const bd = [a, b].sort().join('') === 'bd';
    await sofia(bd ? FALA_ESPELHO_BD : F.desenhoParecido);
    return;
  }
  const par = contraste === 'voz' ? surdoESonoro(a, b) : null;
  const ordem = par ?? [a, b];
  if (temFrasesDoPar(a, b)) {
    for (const x of ordem) { await sofia(FALAS_DOS_PARES[x].como); await voz.somReal(x, 1); await espera(PAUSA_ENTRE_SONS_MS); }
    if (par) await sofia(F.maoNoPescoco);
    return;
  }
  if (par) {
    await sofia(F.semVoz); await voz.somReal(par[0], 1); await espera(PAUSA_ENTRE_SONS_MS);
    await sofia(F.comVoz); await voz.somReal(par[1], 1); await espera(PAUSA_ENTRE_SONS_MS);
    await sofia(F.maoNoPescoco);
  } else if (contraste === 'boca') await sofia(F.bocaMuda);
}
