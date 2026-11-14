import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { NOMES_COMUNS } from '@fonema/conteudo';
import falas from '../../../packages/conteudo/src/falas.json';
import { chaveNome, chaveTrecho } from './voz.ts';

const PUB = resolve(__dirname, '../../public/audio');
const man = JSON.parse(readFileSync(`${PUB}/falas/manifesto.json`, 'utf8')) as Record<string, string>;
const nomes = JSON.parse(readFileSync(`${PUB}/nomes/manifesto.json`, 'utf8')) as Record<string, string[]> & { arquivos: Record<string, Record<string, string>> };
const seqSons = (k: string) => { const ts = k.split(/[\s…,.!?-]+/).filter(Boolean); return ts.length > 1 && ts.every((t) => /^(\p{L})\1{2,}$/iu.test(t)); };

describe('vozes oficiais pré-geradas (ElevenLabs)', () => {
  it('toda fala do falas.json tem áudio para cada trecho (exceto sequências de sons da fonoaudióloga)', () => {
    const faltam: string[] = [];
    for (const f of falas as { voz: string; texto: string }[]) {
      for (const parte of f.texto.split('[NOME]')) {
        const k = chaveTrecho(parte);
        if (!k || seqSons(k)) continue;
        const arq = man[`${f.voz}|${k}`];
        if (!arq || !existsSync(`${PUB}/falas/${arq}`)) faltam.push(`${f.voz}|${k}`);
      }
    }
    expect(faltam).toEqual([]);
  });
  it('os nomes mais comuns têm clipe nas duas vozes', () => {
    for (const voz of ['sofia', 'tales']) {
      for (const n of NOMES_COMUNS) {
        expect(nomes[voz], `${voz}/${n}`).toContain(chaveNome(n));
        expect(existsSync(`${PUB}/nomes/${voz}/${nomes.arquivos[voz][chaveNome(n)]}`), `${voz}/${n} masterizado`).toBe(true);
      }
    }
  });
  it('chave do trecho ignora pontuação solta e normaliza sons esticados', () => {
    expect(chaveTrecho('! Eu sou a Sofia.')).toBe('Eu sou a Sofia.');
    expect(chaveTrecho('mmm')).toBe('mmmm');
    expect(chaveNome('Kauã')).toBe('kaua');
  });
});
