/**
 * Cantinho da Leitura e Brincar com sons (D030 etapa 8): textos decodificáveis passam no verificador, histórias têm
 * perguntas antes/durante/depois e 3 palavras de vocabulário, jogos de escuta têm figuras que existem e opções plausíveis.
 */
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  BANCO, FASE_POR_ID, HABILIDADE_POR_ID, HISTORIAS, JOGOS_ESCUTA, TEXTOS_DECODIFICAVEIS, numeroDaUnidade, textoCorrido, verificarFrase, verificarPalavra,
  verificarTexto
} from '../src/index.ts';

const figura = (id: string) => existsSync(fileURLToPath(new URL(`../../../web/public/assets/figuras/${id}.webp`, import.meta.url)));
const asset = (c: string) => existsSync(fileURLToPath(new URL(`../../../web/public/assets/${c}.webp`, import.meta.url)));

describe('textos decodificáveis (05 §3)', () => {
  it('um texto por bloco da Trilha dos Sons, liberado por fases que existem', () => {
    expect(TEXTOS_DECODIFICAVEIS.map((t) => t.bloco)).toEqual([1, 2, 3]);
    for (const t of TEXTOS_DECODIFICAVEIS) for (const f of t.liberaCom) expect(FASE_POR_ID[f], f).toBeTruthy();
  });
  it('título e cada frase passam no verificador, na unidade do texto, sem palavra frequente', () => {
    for (const t of TEXTOS_DECODIFICAVEIS) {
      const n = numeroDaUnidade(t.ate);
      for (const f of [t.titulo, ...t.linhas.map((l) => l.texto)]) {
        const r = verificarFrase(f, n, BANCO);
        expect(r.erros, `${t.id}: ${f}`).toEqual([]);
        expect(r.frequentes, `${t.id}: ${f}`).toEqual([]);
      }
      const r = verificarTexto(textoCorrido(t), n, BANCO);
      expect(r.ok, t.id).toBe(true);
      expect(r.porcentagem).toBe(1);
    }
  });
  it('3 a 5 frases (o bloco 1, só com vogais, fica com 3) e 2 a 3 perguntas com opções que existem', () => {
    for (const t of TEXTOS_DECODIFICAVEIS) {
      expect(t.linhas.length).toBeGreaterThanOrEqual(3);
      expect(t.linhas.length).toBeLessThanOrEqual(5);
      expect(t.perguntas.length).toBeGreaterThanOrEqual(2);
      expect(t.perguntas.some((p) => p.tipo === 'inferencia'), t.id).toBe(true);
      for (const p of t.perguntas) {
        expect(p.opcoes).toHaveLength(3);
        expect(p.opcoes).toContain(p.correta);
        if (p.escritas) for (const o of p.opcoes) expect(verificarPalavra(o, numeroDaUnidade(t.ate), BANCO).ok, o).toBe(true);
        else for (const o of p.opcoes) expect(figura(o), o).toBe(true);
      }
    }
  });
});

describe('hora da história (04 N12, N16)', () => {
  it('perguntas antes, durante e depois; literal e de dedução; 3 palavras de vocabulário', () => {
    for (const h of HISTORIAS) {
      expect(asset(h.capa), h.capa).toBe(true);
      for (const p of h.paginas) expect(asset(p.imagem), p.imagem).toBe(true);
      const momentos = new Set(h.perguntas.map((p) => p.momento));
      expect([...momentos].sort()).toEqual(['antes', 'depois', 'durante']);
      expect(h.perguntas.some((p) => p.tipo === 'literal')).toBe(true);
      expect(h.perguntas.some((p) => p.tipo === 'inferencia')).toBe(true);
      for (const p of h.perguntas) {
        expect(p.opcoes).toHaveLength(3);
        for (const o of p.opcoes) expect(figura(o), o).toBe(true);
        if (p.tipo === 'previsao') expect(p.correta).toBeUndefined();
        else expect(p.opcoes).toContain(p.correta);
        if (p.momento === 'durante') expect(p.depoisDaPagina).toBeLessThan(h.paginas.length);
        // revisão 18/11 (itens 4 e 5): a pergunta mostra o que cita, e a bola do Bolota é a vermelha da história
        if (/\bcapa\b/i.test(p.pergunta.texto)) expect(p.mostraCapa, p.pergunta.texto).toBe(true);
        if (h.id === 'bolota-chuva' && /levou/.test(p.pergunta.texto)) expect(p.correta).toBe('bola-vermelha');
      }
      expect(h.vocabulario).toHaveLength(3);
      for (const v of h.vocabulario) {
        expect(figura(v.figura), v.figura).toBe(true);
        expect(v.opcoes).toContain(v.correta);
        for (const o of v.opcoes) expect(figura(o), o).toBe(true);
        // explicação de criança, não de dicionário: curta, sem "s.m.", "substantivo" etc.
        expect(v.explica.texto.length).toBeLessThan(110);
        expect(v.explica.texto).not.toMatch(/substantivo|adjetivo|verbo|s\.m\./i);
      }
    }
  });
});

describe('jogos de escuta (01 §3, 04 N6–N8)', () => {
  it('todas as figuras existem, a certa está nas opções e a habilidade está registrada', () => {
    for (const j of JOGOS_ESCUTA) {
      expect(HABILIDADE_POR_ID[j.habilidade], j.habilidade).toBeTruthy();
      if (j.modo === 'palmas') { expect(j.palavras?.length).toBeGreaterThanOrEqual(j.porRodada); continue; }
      expect(j.itens.length).toBeGreaterThan(j.porRodada - 1);
      for (const it of j.itens) {
        expect(it.opcoes).toContain(it.correta);
        expect(it.opcoes.length).toBeGreaterThanOrEqual(j.modo === 'comprida' ? 2 : 3);
        for (const o of [...it.opcoes, ...(it.estimulo ? [it.estimulo] : [])]) expect(figura(o), o).toBe(true);
      }
    }
  });
  it('palavra comprida: a certa tem mais pedaços; há casos em que a coisa grande tem nome curto', () => {
    const j = JOGOS_ESCUTA.find((x) => x.modo === 'comprida')!;
    for (const it of j.itens) {
      const outra = it.opcoes.find((o) => o !== it.correta)!;
      expect(it.revela![it.correta].length).toBeGreaterThan(it.revela![outra].length);
    }
    expect(j.itens.some((it) => ['sol', 'urso', 'leao'].some((g) => it.opcoes.includes(g)))).toBe(true);
  });
  it('palavra escondida: a parte destacada é a resposta', () => {
    for (const it of JOGOS_ESCUTA.find((x) => x.modo === 'dentro')!.itens) {
      const partes = it.revela![it.estimulo!];
      expect(partes.join('').length).toBeGreaterThan(it.correta.length);
      expect(partes.some((p) => p.toLowerCase() === it.correta)).toBe(true);
    }
  });
});
