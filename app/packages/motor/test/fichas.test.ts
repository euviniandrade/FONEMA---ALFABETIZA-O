/**
 * D033: fichas de leitura por campo semântico — filtro "já legível" (regra 2), bocas distinguíveis nos níveis 3 e 4,
 * itens com 3 opções e posição variada, níveis que destrancam com acertos e registro pelo contrato do motor.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  BANCO, CAMPOS_SEMANTICOS, CLASSE_DA_BOCA, CONFIG_PADRAO, FASES_TF, HABILIDADE_POR_ID, PALAVRAS_FICHAS, SONS_PUBLICADOS, analisar, bocasDistinguiveis,
  palavrasDistinguiveisPelaBoca, pedacosDaPalavra, unidadeQueLibera, verificarPalavra
} from '@fonema/conteudo';
import {
  FORMATO_DO_MODO, HABILIDADE_DO_MODO, acertosNoModo, campoDoDesafio, estadoDosCampos, legivelNaFicha, modosDaFicha, progressoInicial, registrarLivre,
  rodadaDaFicha, rodadaDeBocas, unidadeConcluida
} from '../src/index.ts';
import type { Progresso, Tentativa } from '../src/index.ts';

const T0 = new Date('2026-11-17T15:00:00').getTime();
function ateTF(ate: string): Progresso {
  const base = progressoInicial('c1', T0);
  const fases = { ...base.fases };
  for (const f of FASES_TF) { fases[f.id] = { estado: 'concluida', sessoes: 1, concluidaEm: T0 }; if (f.id === ate) break; }
  return { ...base, fases, sessoesFeitas: 3 };
}
let s = 3;
const rng = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
const ARTE = (w: string) => { try { readFileSync(fileURLToPath(new URL(`../../../web/public/assets/figuras/${w}.webp`, import.meta.url))); return true; } catch { return false; } };

describe('campos e banco', () => {
  it('toda palavra dos campos está no banco, com anotação que bate com as letras e figura com arte', () => {
    for (const c of CAMPOS_SEMANTICOS) for (const w of c.palavras) {
      const e = BANCO[w];
      expect(e, w).toBeTruthy();
      expect(analisar(e).erros, w).toEqual([]);
      expect(e.figura, w).toBeTruthy();
      const arq = e.figura === 'bolo' ? 'bolo-velinhas' : e.figura!;
      expect(ARTE(arq), `${w} → ${arq}.webp`).toBe(true);
    }
    for (const e of PALAVRAS_FICHAS) expect(analisar(e).erros, e.texto).toEqual([]);
  });
  it('o O final de "pato" mostra a boca do /u/; o CH de "chuva" é um pedaço só', () => {
    expect(pedacosDaPalavra('pato').map((p) => p.fonema)).toEqual(['p', 'a', 't', 'u']);
    expect(pedacosDaPalavra('chuva')[0]).toEqual({ letras: 'CH', fonema: 'x' });
  });
});

describe('filtro "já legível" (regra 2)', () => {
  it('nada para ler sem lição concluída; cada palavra legível passa no verificador na unidade concluída', () => {
    expect(estadoDosCampos(progressoInicial('c1', T0)).every((c) => c.legiveis.length === 0)).toBe(true);
    for (const ate of ['TF-10', 'TF-17', 'TF-22', 'TF-25']) {
      const p = ateTF(ate);
      const n = unidadeConcluida(p);
      for (const c of estadoDosCampos(p)) {
        for (const w of c.legiveis) {
          expect(verificarPalavra(w, n, BANCO).ok, `${w} em ${ate}`).toBe(true);
          expect(pedacosDaPalavra(w).every((x) => !x.fonema || SONS_PUBLICADOS.includes(x.fonema)), w).toBe(true);
        }
        for (const w of c.trancadas) expect(legivelNaFicha(p, w), `${w} trancada em ${ate}`).toBe(false);
      }
    }
  });
  it('palavras com som ainda não ensinado ficam trancadas (gato antes do G; bola antes do O aberto; rato antes do R)', () => {
    const p = ateTF('TF-20');
    const animais = estadoDosCampos(p).find((c) => c.campo.id === 'animais')!;
    expect(animais.legiveis).toContain('pato');
    expect(animais.trancadas).toEqual(expect.arrayContaining(['gato', 'rato', 'leão', 'foca']));
    expect(unidadeQueLibera('gato', BANCO)).toBe(21);
  });
  it('as opções ESCRITAS do degrau "som → palavra" são todas legíveis', () => {
    const p = ateTF('TF-22');
    for (let k = 0; k < 20; k++) for (const c of CAMPOS_SEMANTICOS) for (const it of rodadaDaFicha(p, c.id, 'ouvir-palavra', rng)) {
      for (const o of it.opcoes) expect(legivelNaFicha(p, o), o).toBe(true);
    }
  });
});

describe('itens', () => {
  it('3 opções diferentes, a certa entre elas, posição que muda de um item para o outro', () => {
    const p = ateTF('TF-22');
    for (let k = 0; k < 30; k++) for (const modo of ['ler', 'ouvir', 'bocas-palavra'] as const) {
      const its = rodadaDaFicha(p, 'animais', modo, rng);
      expect(its.length).toBeGreaterThan(0);
      its.forEach((it, i) => {
        expect(new Set(it.opcoes).size).toBe(3);
        expect(it.opcoes[it.posicaoCerta]).toBe(it.palavra);
        if (i > 0) expect(it.posicaoCerta).not.toBe(its[i - 1].posicaoCerta);
      });
    }
  });
  it('distratores dividem sons com a palavra (R7)', () => {
    const p = ateTF('TF-22');
    let comum = 0, total = 0;
    for (let k = 0; k < 20; k++) for (const it of rodadaDaFicha(p, 'comidas', 'ler', rng)) {
      for (const o of it.opcoes.filter((x) => x !== it.palavra)) { total++; if (pedacosDaPalavra(o).some((a) => pedacosDaPalavra(it.palavra).some((b) => a.fonema && a.fonema === b.fonema))) comum++; }
    }
    expect(comum / total).toBeGreaterThan(0.9);
  });
});

describe('bocas distinguíveis (níveis 3 e 4)', () => {
  it('sons de boca igual nunca juntos', () => {
    for (const par of [['t', 'd'], ['d', 'n'], ['t', 'n'], ['f', 'v'], ['p', 'b'], ['b', 'm'], ['p', 'm'], ['k', 'g'], ['s', 'z']]) expect(bocasDistinguiveis(par), par.join('×')).toBe(false);
    expect(bocasDistinguiveis(['p', 'f', 't', 'a'])).toBe(true);
    expect(palavrasDistinguiveisPelaBoca('pato', 'bato')).toBe(false);
    expect(palavrasDistinguiveisPelaBoca('pato', 'gato')).toBe(true);
  });
  it('rodada do nível 3: 3 ou 4 pares, letras diferentes, nenhuma classe de boca repetida, sons publicados', () => {
    for (const ate of ['TF-12', 'TF-17', 'TF-22', 'TF-25']) {
      const p = ateTF(ate);
      for (let k = 0; k < 12; k++) for (const c of CAMPOS_SEMANTICOS) {
        const r = rodadaDeBocas(p, c.id, rng);
        if (!r) continue;
        expect(r.pares.length).toBeGreaterThanOrEqual(3);
        expect(new Set(r.pares.map((x) => x.letra)).size).toBe(r.pares.length);
        expect(bocasDistinguiveis(r.pares.map((x) => x.fonema)), JSON.stringify(r.pares)).toBe(true);
        expect(r.pares.every((x) => SONS_PUBLICADOS.includes(x.fonema) && CLASSE_DA_BOCA[x.fonema])).toBe(true);
      }
    }
  });
  it('nível 4: as três palavras têm sequências de boca diferentes entre si', () => {
    const p = ateTF('TF-25');
    for (let k = 0; k < 30; k++) for (const c of CAMPOS_SEMANTICOS) for (const it of rodadaDaFicha(p, c.id, 'bocas-palavra', rng)) {
      for (let a = 0; a < 3; a++) for (let b = a + 1; b < 3; b++) expect(palavrasDistinguiveisPelaBoca(it.opcoes[a], it.opcoes[b]), it.opcoes.join(' ')).toBe(true);
    }
  });
});

describe('níveis e registro', () => {
  const t = (modo: keyof typeof FORMATO_DO_MODO, alvo: string, acertou = true, extra: Partial<Tentativa> = {}): Tentativa => ({
    em: T0 + 1000, sessao: 's', habilidade: HABILIDADE_DO_MODO[modo], acertou, comAjuda: !acertou, cena: 'ficha-animais', tipo: 'avaliada', mecanica: 'ficha',
    alvo, escolhido: alvo, respostas: [alvo], distratores: ['X', 'Y'], tempoMs: 1500, nOpcoes: 3, posicaoCerta: 1, posicaoEscolhida: 1, formato: FORMATO_DO_MODO[modo], contexto: 'livre', ...extra
  });
  it('a habilidade nova de consciência articulatória existe', () => {
    expect(HABILIDADE_POR_ID['boca-som']).toBeTruthy();
  });
  it('só o nível 1 abre no começo; 3 acertos sozinho abrem o seguinte; exposição não conta', () => {
    let p = ateTF('TF-22');
    const abertos = () => modosDaFicha(p, 'animais').filter((m) => m.aberto).map((m) => m.modo);
    expect(abertos()).toEqual(['ler']);
    const reg = (ts: Tentativa[], ctx: 'livre' | 'desafio' = 'livre') => {
      p = registrarLivre(p, { sessao: 's', cena: { id: 'livre-ficha', titulo: 'Ficha' }, tentativas: ts.map((x) => ({ ...x, contexto: ctx })), cfg: CONFIG_PADRAO, agora: T0 + 2000 }).progresso;
    };
    reg([t('ler', 'PATO', true, { tipo: 'exposicao', formato: 'ficha-ler-junto' }), t('ler', 'PATO'), t('ler', 'SAPO', false)]);
    expect(acertosNoModo(p, 'ler')).toBe(1);
    expect(abertos()).toEqual(['ler']);
    reg([t('ler', 'TATU'), t('ler', 'GATO')]);
    expect(abertos()).toEqual(['ler', 'ouvir']);
    reg([t('ouvir', 'PATO'), t('ouvir', 'SAPO'), t('ouvir', 'TATU')], 'desafio');
    expect(abertos()).toEqual(expect.arrayContaining(['ler', 'ouvir', 'ouvir-palavra', 'bocas']));
    const fichas = Object.values(p.habilidades).flatMap((h) => h.tentativas).filter((x) => x.mecanica === 'ficha');
    expect(fichas.every((x) => x.formato?.startsWith('ficha-') && x.alvo && typeof x.tempoMs === 'number')).toBe(true);
    expect(fichas.filter((x) => x.formato === 'ficha-ouvir').every((x) => x.contexto === 'desafio' && x.habilidade === 'sintese')).toBe(true);
    expect(fichas.filter((x) => x.formato === 'ficha-ler').every((x) => x.contexto === 'livre' && x.habilidade === 'leitura-cvcv')).toBe(true);
  });
  it('desafio numa lição da Trilha dos Sons: um campo com palavra legível; fora da trilha, nada', () => {
    const p = ateTF('TF-22');
    const c = campoDoDesafio(p, 'TF-22');
    expect(c).toBeTruthy();
    expect(estadoDosCampos(p).find((x) => x.campo.id === c)!.legiveis.length).toBeGreaterThan(0);
    expect(campoDoDesafio(p, 'AL-A')).toBeNull();
    expect(campoDoDesafio(progressoInicial('c1', T0), 'TF-01')).toBeNull();
  });
});
