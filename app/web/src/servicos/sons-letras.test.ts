import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { ALFABETO } from '@fonema/conteudo';
import { FONEMAS_DO_ESTUDIO, fonemaDoTexto, fonemasDaSequencia, type MapaSons } from './sons-letras.ts';
import { cortarSilencio, paraWav, prepararGravacao } from './estudio-sons.ts';

const PUB = resolve(__dirname, '../../public/audio/sons');
const mapa = JSON.parse(readFileSync(`${PUB}/mapa.json`, 'utf8')) as MapaSons;

describe('som real das letras (D029 §2)', () => {
  it('o mapa publicado só aponta para arquivos que existem, aprovados ou duvidosos', () => {
    for (const [f, s] of Object.entries(mapa.fonemas)) {
      expect(existsSync(`${PUB}/${s.arquivo}`), f).toBe(true);
      expect(['aprovado', 'duvidoso'], f).toContain(s.estado);
    }
  });
  it('toda letra do alfabeto está no mapa (H sem som) e o som principal é o do currículo', () => {
    for (const l of ALFABETO) {
      expect(mapa.letras[l.letra], l.letra).toBeDefined();
      if (l.fonema) expect(mapa.letras[l.letra][0], l.letra).toBe(l.fonema); else expect(mapa.letras[l.letra]).toEqual([]);
    }
  });
  it('todo fonema principal do alfabeto pode ser gravado no Estúdio', () => {
    for (const l of ALFABETO) if (l.fonema) expect(FONEMAS_DO_ESTUDIO, l.letra).toContain(l.fonema);
  });
  it('reconhece som isolado e sequência de sons; palavra e sílaba não são som isolado', () => {
    expect(fonemaDoTexto('mmm')).toBe('m');
    expect(fonemaDoTexto('/ssss/')).toBe('s');
    expect(fonemaDoTexto('Ééééé.')).toBe('E');
    expect(fonemaDoTexto('êêêê')).toBe('e');
    expect(fonemaDoTexto('pá')).toBeNull();
    expect(fonemaDoTexto('mala')).toBeNull();
    expect(fonemasDaSequencia('sss… ooo… lll')).toEqual(['s', 'o', 'l']);
    expect(fonemasDaSequencia('ma… ca… co')).toBeNull();
    expect(fonemasDaSequencia('M, de macaco.')).toBeNull();
  });
});

describe('Estúdio de sons: preparo da gravação', () => {
  const sr = 16000;
  const sinal = (() => { const x = new Float32Array(sr * 2); for (let i = sr * 0.5; i < sr * 1.2; i++) x[i] = 0.3 * Math.sin((2 * Math.PI * 220 * i) / sr); return x; })();
  it('corta o silêncio do começo e do fim, deixando um respiro curto', () => {
    const t = cortarSilencio(sinal, sr)!;
    expect(t.inicio / sr).toBeGreaterThan(0.4); expect(t.inicio / sr).toBeLessThanOrEqual(0.5);
    expect(t.fim / sr).toBeGreaterThanOrEqual(1.2); expect(t.fim / sr).toBeLessThan(1.35);
  });
  it('gravação muda não vira som', () => {
    expect(cortarSilencio(new Float32Array(sr), sr)).toBeNull();
    expect(prepararGravacao(new Float32Array(sr), sr)).toBeNull();
  });
  it('iguala o volume e gera um WAV válido', () => {
    const y = prepararGravacao(sinal, sr)!;
    let pico = 0;
    for (const v of y) pico = Math.max(pico, Math.abs(v));
    expect(pico).toBeGreaterThan(0.7); expect(pico).toBeLessThanOrEqual(0.85);
    const wav = paraWav(y, sr);
    expect(wav.type).toBe('audio/wav');
    expect(wav.size).toBe(44 + y.length * 2);
  });
});

describe('som real nas atividades (D030 §1)', () => {
  it('todo fonema usado como estímulo, botão de som ou cena tem clipe publicado no mapa', async () => {
    const { readFileSync } = await import('node:fs');
    const { FASES, SONS_SEM_CLIPE, FALAS_DOS_PARES } = await import('@fonema/conteudo');
    const mapa = JSON.parse(readFileSync(new URL('../../public/audio/sons/mapa.json', import.meta.url), 'utf8')) as { fonemas: Record<string, unknown> };
    const usados = new Set<string>(Object.keys(FALAS_DOS_PARES));
    for (const f of FASES) for (const c of f.cenas) {
      const a = c.atividade;
      if (a?.tipo === 'escolher') for (const i of a.itens) {
        if (i.somAlvo) usados.add(i.somAlvo);
        if (i.somCorreta) usados.add(i.somCorreta);
        for (const o of i.opcoes) if (o.botaoDeSom && o.som) usados.add(o.som);
      }
      if (a?.tipo === 'ligar') for (const p of a.pares) if (p.fonema) usados.add(p.fonema);
    }
    expect(usados.size).toBeGreaterThanOrEqual(20);
    for (const x of usados) expect(mapa.fonemas[x], `fonema ${x} sem clipe em public/audio/sons/mapa.json`).toBeDefined();
    for (const x of SONS_SEM_CLIPE) expect(mapa.fonemas[x], `${x} ganhou clipe: tire de SONS_SEM_CLIPE`).toBeUndefined();
  });
});
