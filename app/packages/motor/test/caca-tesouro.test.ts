/**
 * Fila do dono nº 25: Caça ao tesouro das palavras (passeio 3D). Só o que já foi ensinado, baús em pontos sorteados (o certo não
 * é sempre o mais perto), ≥ 3 baús à vista, charadas que nunca dizem a resposta, níveis que abrem cedo (D034) e registro honesto.
 */
import { describe, expect, it } from 'vitest';
import { BANCO, CONFIG_PADRAO, FALAS_CACA, FASES, FASES_TF, LETRA_POR_ID, LUGARES_CACA, verificarPalavra } from '@fonema/conteudo';
import {
  PARTIDA_CACA, barcoLiberado, bausDaPalavra, ehAvaliada, idJogoCaca, letrasComSomVisto, niveisDaCaca, palavrasDaCaca, progressoInicial, registrarLivre,
  rodadaDaCaca, unidadeConcluida, type NivelCaca, type Progresso, type Tentativa
} from '../src/index.ts';

const T0 = new Date('2026-11-18T15:00:00').getTime();
/** Conclui as fases da jornada na ordem até `ate` (inclusive). */
function ate(id: string, base: Progresso = progressoInicial('c1', T0)): Progresso {
  const fases = { ...base.fases };
  for (const f of FASES) {
    fases[f.id] = { estado: 'concluida', sessoes: 1, concluidaEm: T0 };
    if (f.id === id) break;
  }
  return { ...base, fases, sessoesFeitas: 3 };
}
function ateTF(id: string): Progresso {
  const base = progressoInicial('c1', T0);
  const fases = { ...base.fases };
  for (const f of FASES_TF) { fases[f.id] = { estado: 'concluida', sessoes: 1, concluidaEm: T0 }; if (f.id === id) break; }
  return { ...base, fases, sessoesFeitas: 3 };
}
const jogou = (p: Progresso, ...ns: NivelCaca[]): Progresso => ({ ...p, biblioteca: { fluencia: [], escritas: [], historias: [], textos: [], eco: [], ...(p.biblioteca ?? {}), jogos: [...(p.biblioteca?.jogos ?? []), ...ns.map((n) => ({ id: idJogoCaca(n), em: T0, acertos: 3, total: 3 }))] } });
/** Primeiro ponto da jornada em que há N sons ensinados. */
function comSons(n: number): Progresso {
  for (const f of FASES) { const p = ate(f.id); if (letrasComSomVisto(p).length >= n) return p; }
  throw new Error('sem sons');
}

describe('níveis (D034: abre cedo e cresce)', () => {
  it('criança nova: tudo fechado, com o que falta', () => {
    const ns = niveisDaCaca(progressoInicial('c1', T0));
    expect(ns.every((n) => !n.aberto && !!n.falta)).toBe(true);
  });
  it('com 1 som: nível 1 abre como aquecimento; com 3 sons, de verdade', () => {
    const um = comSons(1);
    const n1 = niveisDaCaca(um)[0];
    expect(n1.aberto).toBe(true);
    if (letrasComSomVisto(um).length < 3) expect(n1.aquecimento).toBe(true);
    const tres = comSons(3);
    expect(niveisDaCaca(tres)[0]).toMatchObject({ aberto: true });
    expect(niveisDaCaca(tres)[0].aquecimento).toBeUndefined();
  });
  it('charadas abrem depois de uma caça aos sons; a água e o barco, depois das charadas', () => {
    const p = comSons(3);
    expect(niveisDaCaca(p)[2].aberto).toBe(false);
    expect(niveisDaCaca(jogou(p, 1))[2].aberto).toBe(true);
    expect(niveisDaCaca(jogou(p, 1))[3].aberto).toBe(false);
    expect(barcoLiberado(jogou(p, 1))).toBe(false);
    expect(barcoLiberado(jogou(p, 1, 3))).toBe(true);
    expect(niveisDaCaca(jogou(p, 1, 3))[3].aberto).toBe(true);
  });
});

describe('nível 1: caça aos sons', () => {
  it('3 baús, só letras ensinadas, posições sorteadas e o certo nem sempre o mais perto', () => {
    const p = comSons(4);
    const ensinadas = new Set(letrasComSomVisto(p));
    let maisPerto = 0, total = 0;
    const lugares = new Set<string>();
    for (let s = 1; s <= 30; s++) {
      const r = rodadaDaCaca(p, { nivel: 1, semente: s });
      expect(r.passos.length).toBeGreaterThan(0);
      for (const ps of r.passos) {
        expect(ps.baus.length).toBe(3);
        expect(new Set(ps.baus.map((b) => `${b.x},${b.z}`)).size).toBe(3);
        for (const b of ps.baus) expect(ensinadas.has(b.letra!), b.letra).toBe(true);
        const certo = ps.baus.find((b) => b.id === ps.corretas[0])!;
        expect(LETRA_POR_ID[certo.letra!].fonema).toBe(ps.somAlvo);
        const d = (b: { x: number; z: number }) => Math.hypot(b.x - PARTIDA_CACA[0], b.z - PARTIDA_CACA[1]);
        if (ps.baus.every((b) => d(certo) <= d(b))) maisPerto++;
        total++;
        lugares.add(`${certo.x},${certo.z}`);
      }
    }
    expect(maisPerto / total).toBeLessThan(0.55);
    expect(lugares.size).toBeGreaterThan(8);
  });
  it('aquecimento: figuras, e o som pedido é sempre ensinado', () => {
    const p = comSons(1);
    if (letrasComSomVisto(p).length >= 3) return;
    const r = rodadaDaCaca(p, { nivel: 1, semente: 3 });
    expect(r.aquecimento).toBe(true);
    for (const ps of r.passos) {
      expect(ps.aquecimento).toBe(true);
      expect(ps.baus.every((b) => !b.letra && !!b.figura)).toBe(true);
      expect(letrasComSomVisto(p).some((l) => LETRA_POR_ID[l].fonema === ps.somAlvo)).toBe(true);
    }
  });
});

describe('nível 2: letras de uma palavra', () => {
  const p = ateTF('TF-22');
  it('abre com palavras liberadas; cada letra faz o som de sempre e foi ensinada', () => {
    expect(niveisDaCaca(p)[1].aberto).toBe(true);
    const n = unidadeConcluida(p);
    const ensinadas = new Set(letrasComSomVisto(p));
    for (const { palavra } of palavrasDaCaca(p)) {
      expect(verificarPalavra(palavra, n, BANCO).ok, palavra).toBe(true);
      const sons = BANCO[palavra].sons!.split(' ');
      [...palavra.toUpperCase()].forEach((l, i) => { expect(ensinadas.has(l)).toBe(true); expect(LETRA_POR_ID[l].fonema).toBe(sons[i]); });
    }
    expect(palavrasDaCaca(p).some((x) => x.palavra === 'bola' || x.palavra === 'dedo')).toBe(false);
  });
  it('sempre ≥ 3 baús à vista; letra repetida: qualquer baú dela vale; figura certa entre 3', () => {
    for (let s = 1; s <= 25; s++) {
      const r = rodadaDaCaca(p, { nivel: 2, semente: s });
      const w = r.palavra!;
      expect(r.passos.length).toBe(w.letras.length);
      expect(new Set(w.figuras).size).toBe(3);
      expect(w.figuras[w.posicaoCerta]).toBe(w.texto.toLowerCase());
      const achados: string[] = [];
      for (const ps of r.passos) {
        const { visiveis, certos } = bausDaPalavra(ps, achados);
        expect(visiveis.length).toBeGreaterThanOrEqual(3);
        expect(certos.length).toBeGreaterThan(0);
        for (const id of certos) expect(ps.baus.find((b) => b.id === id)!.letra).toBe(ps.alvo);
        // distratores nunca estão na palavra
        for (const b of ps.baus.filter((x) => x.id.startsWith('d'))) expect(w.texto.includes(b.letra!)).toBe(false);
        achados.push(certos[certos.length - 1]);
      }
    }
  });
});

describe('níveis 3 e 4: charadas e água', () => {
  const p = jogou(comSons(4), 1, 3);
  it('charadas: o mesmo texto para qualquer alvo, sem letra, som ou palavra da resposta', () => {
    for (const l of LUGARES_CACA) {
      const t = l.charada.texto;
      expect(/\bletra|\bsom\b|\bsons\b/i.test(t), t).toBe(false);
      expect(/(^|\s)[A-Z](\s|[.!?,]|$)/.test(t), t).toBe(false);
      // a charada também nunca nomeia uma figura do banco de leitura (o tesouro é letra; a palavra do nível 2 não vem por charada)
      for (const { palavra } of palavrasDaCaca(ateTF('TF-22'))) expect(new RegExp(`\\b${palavra}\\b`, 'i').test(t), `${t} × ${palavra}`).toBe(false);
    }
    // e as falas da caça também não dizem letra nenhuma
    for (const f of Object.values(FALAS_CACA)) expect(/(^|\s)[A-Z](\s|[.!?,]|$)/.test(f.texto)).toBe(false);
  });
  it('nível 3: lugares de terra diferentes, um baú cada, 3 letras ensinadas no baú', () => {
    const ensinadas = new Set(letrasComSomVisto(p));
    for (let s = 1; s <= 15; s++) {
      const r = rodadaDaCaca(p, { nivel: 3, semente: s });
      expect(r.passos.length).toBe(3);
      expect(new Set(r.passos.map((x) => x.lugar)).size).toBe(3);
      for (const ps of r.passos) {
        expect(LUGARES_CACA.find((l) => l.id === ps.lugar)!.modo).toBe('terra');
        expect(ps.opcoes!.length).toBe(3);
        expect(ps.opcoes!.every((o) => ensinadas.has(o.letra!))).toBe(true);
        expect(ps.opcoes![ps.posicaoCerta!].som).toBe(ps.somAlvo);
      }
    }
  });
  it('nível 4: sempre um lugar de barco e um de nadar', () => {
    for (let s = 1; s <= 15; s++) {
      const r = rodadaDaCaca(p, { nivel: 4, semente: s });
      const modos = r.passos.map((x) => LUGARES_CACA.find((l) => l.id === x.lugar)!.modo);
      expect(modos).toContain('barco');
      expect(modos.some((m) => m === 'agua' || m === 'mergulho')).toBe(true);
    }
  });
  it('nível fechado: rodada vazia', () => {
    expect(rodadaDaCaca(comSons(4), { nivel: 4, semente: 1 }).passos).toEqual([]);
  });
});

describe('registro', () => {
  it('escolha avaliada conta; achar o lugar (exposição) não', () => {
    const p = comSons(4);
    const base = (extra: Partial<Tentativa>): Tentativa => ({ em: T0, sessao: 'livre-1', habilidade: 'x', acertou: true, mecanica: 'caca-tesouro', contexto: 'livre', ...extra });
    const av = base({ alvo: 'M', escolhido: 'M', tempoMs: 1200, nOpcoes: 3 });
    const ex = base({ tipo: 'exposicao', alvo: 'padaria', formato: 'charada-lugar' });
    expect(ehAvaliada(av)).toBe(true);
    expect(ehAvaliada(ex)).toBe(false);
    const r = registrarLivre(p, { sessao: 'livre-1', cena: { id: 'livre-caca', titulo: 'Caça' }, tentativas: [av, ex], cfg: CONFIG_PADRAO, agora: T0 });
    const ts = r.progresso.habilidades.x.tentativas;
    expect(ts.every((t) => t.contexto === 'livre' && t.mecanica === 'caca-tesouro')).toBe(true);
  });
});
