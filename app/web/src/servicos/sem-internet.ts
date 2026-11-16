/**
 * Falas que aparecem em qualquer fase (acertou, quase, vamos juntos, fim da missão, voltou) ficam no aparelho logo
 * que a criança entra, com o nome dela. Assim, sem internet, a dupla não fica muda num erro que ainda não tinha
 * acontecido com internet. São poucos clipes curtos (centenas de KB); o resto da mídia só entra quando é usado.
 */
import { FALAS, type Fala } from '@fonema/conteudo';
import type { Crianca } from '@fonema/motor';
import { voz } from './voz.ts';
import { modoTeste } from './ambiente.ts';
import { textoVoz } from '../util.ts';

const feitas = new Set<string>();

function falasComuns(): Fala[] {
  const s = (texto: string): Fala => ({ quem: 'sofia', texto });
  return [
    ...FALAS.voltou,
    FALAS.suaVez,
    ...FALAS.acertos.map(s),
    s(FALAS.erro1), s(FALAS.erro2), s(FALAS.erroJunto), s(FALAS.erroJunto.replace('?', '!')),
    ...Object.values(FALAS.ritual).map(s),
    s(FALAS.conquista), s(FALAS.surpresa)
  ];
}

export function guardarFalasComuns(c: Crianca | undefined | null): void {
  if (!c || modoTeste() || feitas.has(c.id)) return;
  if (typeof navigator === 'undefined' || !navigator.serviceWorker?.controller || navigator.onLine === false) return;
  // economia de dados ligada no aparelho: não baixa nada adiantado
  if ((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData) return;
  feitas.add(c.id);
  const ir = async () => {
    const falas = falasComuns().map((f) => ({ quem: f.quem, texto: textoVoz(f.texto, c) }));
    const arquivos = [...new Set(await voz.arquivosDasFalas(falas, c.pronuncia.fala))];
    for (const a of arquivos) {
      // um de cada vez, sem pressa: não disputa a rede com a tela que a criança está usando
      try { await fetch(a); } catch { /* sem rede: tenta de novo na próxima vez que abrir */ feitas.delete(c.id); return; }
    }
  };
  const quando = (window as Window & { requestIdleCallback?: (f: () => void, o?: { timeout: number }) => number }).requestIdleCallback;
  if (quando) quando(() => void ir(), { timeout: 8000 }); else setTimeout(() => void ir(), 4000);
}
