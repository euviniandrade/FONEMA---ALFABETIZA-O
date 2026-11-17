/**
 * Trilha dos Sons, blocos 4 e 5 (TF-23…TF-32 e TF-R4; 17/11): vogais abertas, vogais nasais e o R. Só entra na jornada a lição
 * cujos sons puros estão publicados no mapa de sons, e só depois de todas as anteriores (a trilha não se pula); as outras ficam
 * escritas, conferidas pelo verificador e EM ESPERA.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  BANCO, FASES, FASES_TF, FASES_TF_EM_ESPERA, HABILIDADE_POR_ID, SONS_PUBLICADOS, TODAS_AS_FASES_TF, fonemasDaFase, habilidadeDoPar, montarLetrasESons
} from '../src/index.ts';
import { leiturasDaFase, verificarFase } from '../src/fases/verificar-fases.ts';

const MAPA = JSON.parse(readFileSync(fileURLToPath(new URL('../../../web/public/audio/sons/mapa.json', import.meta.url)), 'utf8')) as { fonemas: Record<string, unknown> };
const NOVAS = TODAS_AS_FASES_TF.filter((f) => ['TF-R4', ...Array.from({ length: 10 }, (_, k) => `TF-${k + 23}`)].includes(f.id));

describe('Trilha dos Sons, blocos 4 e 5', () => {
  it('SONS_PUBLICADOS é igual ao mapa de sons publicado', () => {
    expect([...SONS_PUBLICADOS].sort()).toEqual(Object.keys(MAPA.fonemas).sort());
  });

  it('na jornada: TF-23, TF-24 e TF-25; em espera: TF-26…TF-30, TF-R4, TF-31 e TF-32, cada uma com o motivo', () => {
    expect(NOVAS.map((f) => f.id)).toEqual(['TF-23', 'TF-24', 'TF-25', 'TF-26', 'TF-27', 'TF-28', 'TF-29', 'TF-30', 'TF-R4', 'TF-31', 'TF-32']);
    const ids = FASES_TF.map((f) => f.id);
    expect(ids.slice(-3)).toEqual(['TF-23', 'TF-24', 'TF-25']);
    expect(FASES_TF_EM_ESPERA.map((e) => e.fase.id)).toEqual(['TF-26', 'TF-27', 'TF-28', 'TF-29', 'TF-30', 'TF-R4', 'TF-31', 'TF-32']);
    for (const e of FASES_TF_EM_ESPERA) expect(e.motivo, e.fase.id).toMatch(/aguardando som|vem depois/);
    // a primeira em espera é a que falta som (o /ẽ/); o R fraco também espera o próprio som
    expect(FASES_TF_EM_ESPERA[0].sonsQueFaltam).toContain('e~');
    expect(FASES_TF_EM_ESPERA.find((e) => e.fase.id === 'TF-32')!.sonsQueFaltam).toContain('r');
    // nada em espera entra na jornada
    for (const e of FASES_TF_EM_ESPERA) expect(FASES.map((f) => f.id)).not.toContain(e.fase.id);
  });

  it('toda lição da jornada só toca sons publicados no mapa (nada de voz do navegador nem de nome de letra no lugar)', () => {
    for (const f of FASES_TF) for (const x of fonemasDaFase(f)) expect(MAPA.fonemas[x], `${f.id}: som ${x}`).toBeDefined();
    for (const f of NOVAS) for (const c of f.cenas) {
      const a = c.atividade;
      if (a?.tipo === 'escolher') for (const i of a.itens) expect(i.ouvir ?? '', `${c.id}`).not.toMatch(/^Letra /);
    }
  });

  it('o verificador passa em TODAS as lições escritas, também nas em espera (erro = build falha)', () => {
    let n = 0;
    for (const f of NOVAS) for (const i of verificarFase(f)) { n++; expect(i.resultado.erros, `${f.id} ${i.cena}: "${i.texto}"`).toEqual([]); }
    expect(n).toBeGreaterThan(120);
  });

  it('roteiro: som novo antes da letra, síntese, leitura com 2 inventadas conferidas, escrita (caixas ou ditado) e desafio', () => {
    for (const f of NOVAS) {
      const tipos = f.cenas.map((c) => c.atividade?.tipo);
      const revisao = f.trilhaSons!.tipo === 'revisao';
      if (!revisao) {
        expect(tipos, f.id).toContain('somNovo');
        expect(tipos.indexOf('somNovo'), f.id).toBeLessThan(tipos.indexOf('escolher', 1));
      }
      expect(tipos, f.id).toContain('sintese');
      expect(tipos.includes('caixas') || tipos.includes('ditado'), `${f.id} sem escrita`).toBe(true);
      expect(tipos.some((t) => t === 'parMinimo' || t === 'troca' || t === 'frase'), `${f.id} sem desafio`).toBe(true);
      expect(leiturasDaFase(f).filter((l) => l.tipo === 'pseudo').length, `${f.id} sem palavra inventada`).toBeGreaterThanOrEqual(2);
      const conferida = f.cenas.some((c) => c.atividade?.tipo === 'escolher' && c.atividade.itens.some((i) => i.pseudo && i.formato === 'ouvir-leituras' && i.opcoes.length >= 3));
      expect(conferida, `${f.id}: inventada sem conferência`).toBe(true);
      expect(f.criterio.tipo).toBe('dominio');
      for (const h of f.habilidades) expect(HABILIDADE_POR_ID[h], `${f.id}: habilidade ${h}`).toBeDefined();
    }
  });

  it('caixas de sons só com palavras de uma letra por som (dígrafo e vogal nasal com 2 letras vão para o ditado)', () => {
    for (const f of NOVAS) for (const c of f.cenas) {
      const a = c.atividade;
      if (a?.tipo === 'caixas') for (const i of a.itens) expect(i.sons.every(Boolean), `${c.id}: ${i.palavra}`).toBe(true);
    }
  });

  it('pares mínimos: 3 opções diferentes, habilidade do contraste e distrator do banco', () => {
    for (const f of NOVAS) for (const c of f.cenas) {
      const a = c.atividade;
      if (a?.tipo !== 'parMinimo') continue;
      for (const i of a.itens) {
        expect(new Set([i.alvo, i.outra, i.distrator]).size, `${c.id}: ${i.alvo}`).toBe(3);
        expect(i.habilidade).toBe(habilidadeDoPar(i.sons));
        expect(BANCO[i.distrator!], `${c.id}: distrator ${i.distrator}`).toBeDefined();
        expect(HABILIDADE_POR_ID[i.habilidade!], i.habilidade).toBeDefined();
      }
    }
  });

  it('frase decodificável no fim do bloco que está na jornada (TF-25) e na revisão do bloco 4 (com eco)', () => {
    const frase = (id: string) => TODAS_AS_FASES_TF.find((f) => f.id === id)!.cenas.find((c) => c.atividade?.tipo === 'frase')?.atividade;
    expect(frase('TF-25')).toBeDefined();
    const r4 = frase('TF-R4');
    expect(r4 && r4.tipo === 'frase' && r4.eco).toBe(true);
  });

  it('D031: a letra R entra logo antes de TF-31 quando ela estiver na jornada; até lá, fica no bloco da Festa', () => {
    const agora = FASES.map((f) => f.id);
    expect(agora.slice(agora.indexOf('TF-25'), agora.indexOf('TF-25') + 3)).toEqual(['TF-25', 'AL-R', 'AL-H']);
    const tudoPronto = montarLetrasESons(TODAS_AS_FASES_TF).map((f) => f.id);
    expect(tudoPronto[tudoPronto.indexOf('TF-31') - 1]).toBe('AL-R');
    expect(tudoPronto.filter((x) => x === 'AL-R')).toHaveLength(1);
    expect(tudoPronto.slice(tudoPronto.indexOf('TF-32') + 1)).toEqual(['AL-H', 'AL-X', 'AL-Q', 'AL-K', 'AL-Y', 'AL-W', 'AL-FESTA']);
  });
});
