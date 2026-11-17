/**
 * A boquinha das fichas (Boquinha.tsx) usa a MESMA tabela de poses do Espelho do Som 3D (fonemas.js): se alguém mexer lá,
 * este teste avisa para atualizar aqui. E cada som do mapa de sons tem pose e classe de boca.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { CLASSE_DA_BOCA, SONS_PUBLICADOS } from '@fonema/conteudo';
import { POSES } from './Boquinha.tsx';

interface F { jaw: number; lab: { ab: number; lg: number; arr: number; ld: number }; lin: number[][] }
const fonte = readFileSync(fileURLToPath(new URL('../../../../docs/propostas/06-fonema-unificada/espelho-do-som-3d-v3/fonemas.js', import.meta.url)), 'utf8');
const g: { FonemasPT?: { F: Record<string, F> } } = {};
new Function('window', 'globalThis', fonte)(g, g);

describe('Boquinha (vista de frente do Espelho do Som)', () => {
  it('as poses são as do Espelho 3D (fonemas.js)', () => {
    const F = g.FonemasPT!.F;
    for (const [k, p] of Object.entries(POSES)) {
      const o = F[k];
      expect(o, k).toBeTruthy();
      expect([p.jaw, p.ab, p.lg, p.arr, p.ld, p.ponta], k).toEqual([o.jaw, o.lab.ab, o.lab.lg, o.lab.arr, o.lab.ld, o.lin[0][1]]);
    }
  });
  it('todo som publicado tem pose e classe de boca', () => {
    for (const s of SONS_PUBLICADOS) {
      expect(POSES[s], s).toBeTruthy();
      expect(CLASSE_DA_BOCA[s], s).toBeTruthy();
    }
  });
});
