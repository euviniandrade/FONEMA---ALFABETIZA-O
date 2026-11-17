import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { BANCO, FIGURAS } from '@fonema/conteudo';
import falasConteudo from '../../../packages/conteudo/src/falas.json';
import { classificarTrecho, contarPorTipo, filtrarCatalogo, letraDaOrigem, montarCatalogo } from './catalogo-audios.ts';
import { SONS_DO_ESTUDIO } from './sons-letras.ts';
import { chaveTrecho } from './voz.ts';

const PUB = resolve(__dirname, '../../public/audio');
const ler = (p: string) => JSON.parse(readFileSync(`${PUB}/${p}`, 'utf8'));
const palavras = new Set([...Object.keys(FIGURAS), ...Object.keys(BANCO)]);

describe('catálogo de todos os áudios (Área do administrador › Áudios)', () => {
  const itens = montarCatalogo({
    sons: SONS_DO_ESTUDIO, mapaSons: ler('sons/mapa.json'), falas: ler('falas/manifesto.json'), nomes: ler('nomes/manifesto.json'),
    falasConteudo, palavrasConhecidas: palavras, chaveTrecho, extras: [{ caminho: 'assets/audio/dupla-ilha-das-vogais.mp3', texto: 'Diálogo' }]
  });
  it('classifica os trechos', () => {
    expect(classificarTrecho('Letra M.', palavras)).toEqual({ tipo: 'nome-letra', letras: ['M'] });
    expect(classificarTrecho('M, de macaco.', palavras).tipo).toBe('nome-letra');
    expect(classificarTrecho('mmmm', palavras).tipo).toBe('som-dupla');
    expect(classificarTrecho('bola', palavras)).toEqual({ tipo: 'palavra', letras: ['B'] });
    expect(classificarTrecho('lhá', palavras).tipo).toBe('silaba');
    expect(classificarTrecho('Muito bem!', palavras).tipo).toBe('frase');
    expect(letraDaOrigem('S-LETRA-M')).toBe('M');
    expect(letraDaOrigem('AL-M-C2')).toBe('M');
    expect(letraDaOrigem('TF-07')).toBeNull();
  });
  it('tem um item para cada som do Estúdio, cada clipe de fala e cada nome', () => {
    expect(itens.filter((i) => i.tipo === 'som-letra')).toHaveLength(SONS_DO_ESTUDIO.length);
    const falas = ler('falas/manifesto.json');
    for (const k of Object.keys(falas)) expect(itens.some((i) => i.id === `fala:${k}` && i.arquivo === `audio/falas/${falas[k]}`), k).toBe(true);
    const nomes = ler('nomes/manifesto.json');
    expect(itens.filter((i) => i.tipo === 'nome-crianca')).toHaveLength(nomes.sofia.length + nomes.tales.length);
    expect(new Set(itens.map((i) => i.id)).size).toBe(itens.length);
  });
  it('o som do M aponta para o clipe publicado; R fraco, LH e NH aparecem sem áudio (podem ganhar um)', () => {
    expect(itens.find((i) => i.id === 'som:m')).toMatchObject({ arquivo: 'audio/sons/m.mp3', letras: ['M'] });
    for (const f of ['r', 'lh', 'nh']) expect(itens.find((i) => i.id === `som:${f}`)?.arquivo, f).toBeNull();
  });
  it('falas do conteúdo sem clipe aparecem como pendentes', () => {
    const pend = filtrarCatalogo(itens, { so: 'pendentes' });
    expect(pend.some((i) => i.tipo !== 'som-letra')).toBe(true);
    expect(pend.every((i) => !i.arquivo)).toBe(true);
  });
  it('filtros: tipo, letra, busca sem acento e só os trocados', () => {
    expect(filtrarCatalogo(itens, { tipo: 'nome-letra', letra: 'M' }).map((i) => i.texto)).toEqual(expect.arrayContaining(['Letra M.']));
    expect(filtrarCatalogo(itens, { busca: 'macaco' }).length).toBeGreaterThan(0);
    expect(filtrarCatalogo(itens, { busca: 'LEAO', tipo: 'palavra' }).some((i) => i.texto === 'leão')).toBe(true);
    expect(filtrarCatalogo(itens, { so: 'trocados', trocados: new Set(['som:m']) }).map((i) => i.id)).toEqual(['som:m']);
    const c = contarPorTipo(itens);
    expect(c['som-letra'].total).toBe(SONS_DO_ESTUDIO.length);
  });
});
