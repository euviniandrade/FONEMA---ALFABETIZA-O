/** Cantinho da Leitura (D030 etapa 8): fluência só com precisão ≥ 95%, lista de palavras já lidas, registro livre, alinhamento da escrita própria. */
import { describe, expect, it } from 'vitest';
import { BANCO, CONFIG_PADRAO, TEXTO_POR_ID } from '@fonema/conteudo';
import {
  alinharEscrita, dadosBiblioteca, estadoFluencia, estrelasDaLeitura, novaHabilidade, palavrasJaLidas, palavrasParaEscrever, precisaoDeLeitura,
  progressoInicial, registrarLivre, registrarTentativa, resumoFluencia, textoLiberado, unidadeConcluida
} from '../src/index.ts';
import type { Progresso, Tentativa } from '../src/index.ts';

const T0 = new Date('2026-11-16T15:00:00').getTime();
let k = 0;
const leu = (alvo: string, acertou = true, extra: Partial<Tentativa> = {}): Tentativa =>
  ({ em: T0 + k++, sessao: 's1', habilidade: 'leitura-cvcv', acertou, comAjuda: !acertou, mecanica: 'escolher', tipo: 'avaliada', alvo, categoria: 'palavra', ...extra });
function com(ts: Tentativa[], base: Progresso = progressoInicial('c1', T0)): Progresso {
  const habilidades = { ...base.habilidades };
  for (const t of ts) habilidades[t.habilidade] = registrarTentativa(habilidades[t.habilidade] ?? novaHabilidade(), t);
  return { ...base, habilidades };
}
const concluir = (p: Progresso, ...ids: string[]): Progresso => ({ ...p, fases: { ...p.fases, ...Object.fromEntries(ids.map((id) => [id, { estado: 'concluida' as const, sessoes: 1, concluidaEm: T0 }])) } });
const PALAVRAS = ['lua', 'mala', 'fila', 'mula', 'lula', 'fala', 'lama', 'uva', 'pato', 'sapo'];

describe('fluência (ABC p. 375–376; docs/pedagogia/06 §6)', () => {
  it('fica trancada sem precisão de 95% ou com poucas respostas', () => {
    expect(estadoFluencia(com([leu('lua')]), BANCO)).toMatchObject({ liberada: false, motivo: 'precisao' });
    const errando = com([...PALAVRAS.map((w) => leu(w)), ...PALAVRAS.map((w) => leu(w, false))]);
    expect(precisaoDeLeitura(errando).precisao).toBeLessThan(0.95);
    expect(estadoFluencia(errando, BANCO).liberada).toBe(false);
  });
  it('autorrelato e exposição não entram na precisão nem na lista', () => {
    const p = com([...PALAVRAS.map((w) => leu(w)), ...PALAVRAS.map((w) => leu(`${w}`, false, { tipo: 'autorrelato' }))]);
    expect(precisaoDeLeitura(p)).toEqual({ precisao: 1, respostas: 10 });
  });
  it('lista só com palavras reais, com figura, que a criança já leu certo; a mesma lista é relida', () => {
    const p = com([...PALAVRAS.map((w) => leu(w)), leu('amu', true, { pseudo: true }), leu('meia')]);
    const lidas = palavrasJaLidas(p, BANCO);
    expect(lidas).not.toContain('amu');
    expect(lidas).not.toContain('meia'); // sem figura
    const e = estadoFluencia(p, BANCO);
    expect(e.liberada).toBe(true);
    if (!e.liberada) return;
    expect(e.palavras).toHaveLength(8);
    expect(e.lista).toBe(0);
  });
  it('troca de lista depois de 3 releituras firmes; ppm e estrelas', () => {
    let p = com([...PALAVRAS.map((w) => leu(w)), ...['bolo', 'gato', 'galo', 'dado', 'dedo', 'faca'].map((w) => leu(w))]);
    const r1 = resumoFluencia(0, ['lua'], [{ certa: true, tempoMs: 2000 }, { certa: true, tempoMs: 1000 }, { certa: false, tempoMs: 3000 }], T0, false);
    expect(r1.ppm).toBe(20);
    const r2 = resumoFluencia(0, ['lua'], [{ certa: true, tempoMs: 1000 }, { certa: true, tempoMs: 1000 }, { certa: true, tempoMs: 1000 }], T0, true);
    expect(estrelasDaLeitura(r2, r1)).toBe(3);
    for (let i = 0; i < 3; i++) p = { ...p, biblioteca: { ...dadosBiblioteca(p), fluencia: [...dadosBiblioteca(p).fluencia, r2] } };
    const e = estadoFluencia(p, BANCO);
    expect(e.liberada && e.lista).toBe(1);
  });
});

describe('registro livre', () => {
  it('jogo de escuta conta como avaliada no contexto livre; o resumo vai para o adulto', () => {
    const p0 = progressoInicial('c1', T0);
    const ts: Tentativa[] = [1, 2, 3].map((i) => ({ em: T0 + i, sessao: 'x', habilidade: 'rima', acertou: true, mecanica: 'escuta', tipo: 'avaliada', alvo: 'rato' }));
    const r = registrarLivre(p0, { sessao: 'livre-1', cena: { id: 'livre-rimas', titulo: 'Achar a rima' }, tentativas: ts, cfg: CONFIG_PADRAO, agora: T0 }, (d) => ({ ...d, jogos: [...d.jogos, { id: 'rimas', em: T0, acertos: 3, total: 3 }] }));
    expect(r.progresso.habilidades.rima.tentativas.every((t) => t.contexto === 'livre')).toBe(true);
    expect(dadosBiblioteca(r.progresso).jogos).toHaveLength(1);
    expect(r.progresso.moedinhas.saldo).toBe(p0.moedinhas.saldo);
  });
});

describe('liberações', () => {
  it('textos por bloco e escrita própria depois do M', () => {
    let p = progressoInicial('c1', T0);
    expect(textoLiberado(p, TEXTO_POR_ID.oi)).toBe(false);
    expect(palavrasParaEscrever(p, BANCO)).toEqual([]);
    p = concluir(p, 'TF-01', 'TF-06', 'TF-07', 'TF-08', 'TF-09', 'TF-10');
    expect(unidadeConcluida(p)).toBe(10);
    expect(textoLiberado(p, TEXTO_POR_ID.oi)).toBe(true);
    expect(textoLiberado(p, TEXTO_POR_ID['ema-suja'])).toBe(false);
    const ws = palavrasParaEscrever(p, BANCO);
    expect(ws).toContain('lua');
    expect(ws).not.toContain('pato');
    expect(unidadeConcluida(concluir(p, 'TF-R2'))).toBe(15);
  });
});

describe('alinhar a escrita própria (04 N13)', () => {
  it('mostra o que faltou, sobrou e trocou, letra a letra', () => {
    expect(alinharEscrita('MLA', 'MALA').map((c) => c.tipo)).toEqual(['igual', 'faltou', 'igual', 'igual']);
    expect(alinharEscrita('MALA', 'MALA').every((c) => c.tipo === 'igual')).toBe(true);
    expect(alinharEscrita('PATOO', 'PATO').filter((c) => c.tipo === 'sobrou')).toHaveLength(1);
    expect(alinharEscrita('BATO', 'PATO')[0]).toMatchObject({ tipo: 'trocou', certa: 'P', escrita: 'B' });
    expect(alinharEscrita('', 'LUA').map((c) => c.tipo)).toEqual(['faltou', 'faltou', 'faltou']);
  });
});
