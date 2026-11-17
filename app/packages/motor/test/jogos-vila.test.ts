/**
 * D032 §4: jogos da vila (Estrada e Rio dos Pares, Carteiro da Vila, Casa do Som) — só o que já foi ensinado, 3 opções,
 * posição sorteada, habilidade do contraste (8 de 10), palavras liberadas pelo verificador, casinha e garagem fora do domínio.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { BANCO, CONFIG_PADRAO, FASES_TF, LETRA_POR_ID, habilidadeDoPar, verificarPalavra } from '@fonema/conteudo';
import {
  CORES_VEICULO, MOVEIS_CASA, bancoDaEstrada, bancoDoCarteiro, carteiroLiberado, casaLiberada, corLiberada, dadosJogosVila, desafioDaFase,
  escolherCor, letrasComSomVisto, moverMovel, progressoInicial, receberMovel, registrarLivre, rodadaDaCasa, rodadaDaEstrada, rodadaDoCarteiro,
  temFiguraVila, unidadeConcluida, variacoesDaEstrada, avaliarDominio
} from '../src/index.ts';
import type { Progresso, Tentativa } from '../src/index.ts';

const T0 = new Date('2026-11-17T15:00:00').getTime();
/** Conclui as lições da Trilha dos Sons até a unidade `ate` (inclusive), na ordem da trilha. */
function ateTF(ate: string, base: Progresso = progressoInicial('c1', T0)): Progresso {
  const fases = { ...base.fases };
  for (const f of FASES_TF) {
    fases[f.id] = { estado: 'concluida', sessoes: 1, concluidaEm: T0 };
    if (f.id === ate) break;
  }
  return { ...base, fases, sessoesFeitas: 3 };
}
const VOZ = JSON.parse(readFileSync(fileURLToPath(new URL('../../../web/public/audio/falas/manifesto.json', import.meta.url)), 'utf8')) as Record<string, unknown>;
const ARTE = (w: string) => { try { readFileSync(fileURLToPath(new URL(`../../../web/public/assets/figuras/${w}.webp`, import.meta.url))); return true; } catch { return false; } };

describe('Estrada e Rio dos Pares', () => {
  it('fechada no começo; abre quando há pares de lições concluídas', () => {
    expect(variacoesDaEstrada(progressoInicial('c1', T0)).every((v) => !v.liberada)).toBe(true);
    expect(rodadaDaEstrada(progressoInicial('c1', T0), { variacao: 'ouvir', semente: 4 })).toEqual([]);
    const p = ateTF('TF-22');
    expect(variacoesDaEstrada(p).find((v) => v.variacao === 'ouvir')!.liberada).toBe(true);
    expect(variacoesDaEstrada(p).find((v) => v.variacao === 'ler')!.liberada).toBe(true);
  });

  it('só pares cujos DOIS sons já foram ensinados; 3 palavras diferentes; habilidade do contraste', () => {
    for (const ate of ['TF-09', 'TF-14', 'TF-18', 'TF-22']) {
      const p = ateTF(ate);
      const letras = new Set(letrasComSomVisto(p));
      for (const v of ['ouvir', 'ler'] as const) {
        for (const i of bancoDaEstrada(p, v)) {
          for (const s of i.sons) {
            const l = Object.values(LETRA_POR_ID).find((x) => x.fonema === s || x.letra.toLowerCase() === s);
            if (/^[aeiouEO]$/.test(s)) continue;
            expect(l && letras.has(l.letra), `${ate} ${i.alvo}: som ${s}`).toBe(true);
          }
          expect(new Set([i.alvo, i.outra, i.distrator]).size).toBe(3);
          expect(i.habilidade).toBe(habilidadeDoPar(i.sons));
          expect(i.habilidade.startsWith('par-minimo-')).toBe(true);
        }
      }
    }
  });

  it('ouvir: as 3 placas têm figura com arte; ler: as 3 palavras passam no verificador e o alvo tem figura', () => {
    const p = ateTF('TF-22');
    const n = unidadeConcluida(p);
    for (const i of bancoDaEstrada(p, 'ouvir')) for (const w of [i.alvo, i.outra, i.distrator]) expect(ARTE(w) || ARTE(w + '-velinhas'), w).toBe(true);
    for (const i of bancoDaEstrada(p, 'ler')) {
      expect(temFiguraVila(i.alvo)).toBe(true);
      for (const w of [i.alvo, i.outra, i.distrator]) expect(verificarPalavra(w, n, BANCO).ok, w).toBe(true);
    }
    // a palavra dita (ouvir) tem clipe gravado
    for (const i of bancoDaEstrada(p, 'ouvir')) expect(VOZ[`sofia|${i.alvo}`], i.alvo).toBeTruthy();
  });

  it('rodada: 3 caminhos, a certa sorteada e nunca no mesmo caminho duas vezes seguidas; o mesmo alvo não repete em seguida', () => {
    const p = ateTF('TF-22');
    const posicoes = new Set<number>();
    for (let s = 1; s < 30; s++) {
      const r = rodadaDaEstrada(p, { variacao: 'ouvir', semente: s });
      expect(r.length).toBe(6);
      for (let k = 0; k < r.length; k++) {
        expect(r[k].opcoes).toHaveLength(3);
        expect(r[k].opcoes[r[k].posicaoCerta]).toBe(r[k].alvo);
        posicoes.add(r[k].posicaoCerta);
        if (k) { expect(r[k].posicaoCerta).not.toBe(r[k - 1].posicaoCerta); expect(r[k].alvo).not.toBe(r[k - 1].alvo); }
      }
    }
    expect(posicoes.size).toBe(3);
  });
});

describe('Carteiro da Vila', () => {
  it('fechado sem palavras para ler; abre com a leitura da trilha', () => {
    expect(carteiroLiberado(progressoInicial('c1', T0)).liberada).toBe(false);
    expect(carteiroLiberado(ateTF('TF-10')).liberada).toBe(true);
  });

  it('todo envelope é decodificável na unidade concluída; as 3 casas têm figura; nenhuma palavra adiantada', () => {
    for (const ate of ['TF-10', 'TF-13', 'TF-17', 'TF-22']) {
      const p = ateTF(ate);
      const n = unidadeConcluida(p);
      const banco = bancoDoCarteiro(p);
      expect(banco.length).toBeGreaterThanOrEqual(3);
      for (const b of banco) {
        expect(verificarPalavra(b.palavra, n, BANCO).ok, `${ate} ${b.palavra}`).toBe(true);
        expect(b.outras).toHaveLength(2);
        for (const w of [b.palavra, ...b.outras]) expect(temFiguraVila(w), w).toBe(true);
        expect(new Set([b.palavra, ...b.outras]).size).toBe(3);
        expect(VOZ[`sofia|${b.palavra}`] ?? true).toBeTruthy();
      }
    }
    // "gato" (TF-21) não aparece antes do G
    expect(bancoDoCarteiro(ateTF('TF-17')).some((b) => b.palavra === 'gato')).toBe(false);
  });

  it('rodada: casa certa sorteada, sem repetir o lugar; sem envelope repetido', () => {
    const p = ateTF('TF-22');
    for (let s = 1; s < 20; s++) {
      const r = rodadaDoCarteiro(p, { semente: s });
      expect(r.length).toBe(5);
      expect(new Set(r.map((x) => x.palavra)).size).toBe(5);
      for (let k = 0; k < r.length; k++) {
        expect(r[k].casas[r[k].posicaoCerta]).toBe(r[k].palavra);
        if (k) expect(r[k].posicaoCerta).not.toBe(r[k - 1].posicaoCerta);
      }
    }
  });
});

describe('Casa do Som', () => {
  it('todo móvel tem figura com arte e a palavra gravada na voz da Sofia', () => {
    for (const m of MOVEIS_CASA) {
      expect(ARTE(m.palavra) || ARTE(`${m.palavra}-velinhas`), m.palavra).toBe(true);
      expect(VOZ[`sofia|${m.palavra}`], m.palavra).toBeTruthy();
    }
  });

  it('só encomenda palavra que o verificador libera para ESCREVER; bandeja só com letras de som já visto', () => {
    expect(casaLiberada(progressoInicial('c1', T0)).liberada).toBe(false);
    for (const ate of ['TF-16', 'TF-18', 'TF-22']) {
      const p = ateTF(ate);
      const n = unidadeConcluida(p);
      const vistas = new Set(letrasComSomVisto(p));
      const r = rodadaDaCasa(p, { semente: 7 });
      expect(r.length).toBe(3);
      for (const e of r) {
        expect(verificarPalavra(e.palavra, n, BANCO).ok, e.palavra).toBe(true);
        for (const l of e.letras) expect(vistas.has(l) || e.palavra.toUpperCase().includes(l), `${e.palavra}: ${l}`).toBe(true);
        for (const l of e.palavra.toUpperCase()) expect(e.letras).toContain(l);
        expect(e.distratoras.every((d) => !e.palavra.toUpperCase().includes(d))).toBe(true);
      }
    }
    // tapete (TI, TF-22) só depois do TF-22
    expect(rodadaDaCasa(ateTF('TF-21'), { semente: 1, n: 99 }).some((e) => e.palavra === 'tapete')).toBe(false);
  });

  it('palavra que termina em O (soa U) traz o U como distratora quando o U já foi ensinado', () => {
    const p = ateTF('TF-22');
    const e = rodadaDaCasa(p, { semente: 3, n: 99 }).find((x) => x.palavra.endsWith('o'));
    expect(e?.distratoras).toContain('U');
  });

  it('móvel recebido e casinha decorada ficam guardados, mas não viram tentativa nem domínio (regra 4)', () => {
    let p = ateTF('TF-22');
    p = receberMovel(p, 'mala');
    p = receberMovel(p, 'mala');
    p = moverMovel(p, 'mala', 150, -20);
    expect(dadosJogosVila(p).moveis).toEqual(['mala']);
    expect(dadosJogosVila(p).posicoes.mala).toEqual({ x: 94, y: 30 });
    expect(p.habilidades['escrita-cvcv']).toBeUndefined();
  });

  it('cor do carro: as pagas só depois de compradas com moedinhas (sem dinheiro real)', () => {
    let p = ateTF('TF-10');
    const paga = CORES_VEICULO.find((c) => c.preco > 0)!;
    expect(corLiberada(p, paga.id)).toBe(false);
    expect(escolherCor(p, paga.id)).toBe(p);
    p = escolherCor(p, CORES_VEICULO[1].id);
    expect(dadosJogosVila(p).corVeiculo).toBe(CORES_VEICULO[1].id);
    expect(corLiberada({ ...p, itens: [paga.id] }, paga.id)).toBe(true);
  });
});

describe('registro e desafio na jornada', () => {
  it('escolhas avaliadas da Estrada entram no 8 de 10 do contraste (registro livre)', () => {
    const p = ateTF('TF-22');
    const item = rodadaDaEstrada(p, { variacao: 'ouvir', semente: 2 })[0];
    const ts: Tentativa[] = Array.from({ length: 10 }, (_, k) => ({
      em: T0 + k, sessao: `s${k % 3}`, habilidade: item.habilidade, acertou: k !== 4, comAjuda: k === 4, tipo: 'avaliada', mecanica: 'estrada-pares',
      alvo: item.alvo.toUpperCase(), escolhido: item.alvo.toUpperCase(), nOpcoes: 3, posicaoCerta: item.posicaoCerta, posicaoEscolhida: item.posicaoCerta, contexto: 'livre'
    }));
    const r = registrarLivre(p, { sessao: 's9', cena: { id: 'livre-estrada-pares', titulo: 'Estrada dos Pares' }, tentativas: ts, cfg: CONFIG_PADRAO, agora: T0 + 99 });
    const h = r.progresso.habilidades[item.habilidade];
    expect(h.tentativas.filter((t) => t.mecanica === 'estrada-pares')).toHaveLength(10);
    expect(avaliarDominio(h, CONFIG_PADRAO.dominio, false, item.habilidade).faltaPares).toBe(false);
  });

  it('desafio opcional: fase com pares → Estrada; só fase concluída', () => {
    const p = ateTF('TF-18');
    expect(desafioDaFase(p, 'TF-18')?.jogo).toBe('estrada-pares');
    expect(desafioDaFase(progressoInicial('c1', T0), 'TF-18')).toBeNull();
    const fasesComPar = FASES_TF.filter((f) => f.cenas.some((c) => c.atividade?.tipo === 'parMinimo'));
    // toda fase com pares que tenham figura oferece a Estrada (TF-14 só tem pares escritos sem figura: selo × zelo)
    for (const f of fasesComPar) {
      const q = ateTF(f.id);
      const temPar = bancoDaEstrada(q, 'ouvir', f.id).length + bancoDaEstrada(q, 'ler', f.id).length > 0;
      if (temPar) expect(desafioDaFase(q, f.id)?.jogo, f.id).toBe('estrada-pares');
    }
    expect(fasesComPar.filter((f) => desafioDaFase(ateTF(f.id), f.id)?.jogo === 'estrada-pares').length).toBeGreaterThanOrEqual(3);
  });
});
