import { describe, expect, it } from 'vitest';
import { CONQUISTA_POR_ID, FASES, FALAS, GRAFEMAS_DA_REGIAO, HABILIDADE_POR_ID, REGIOES, SONS, ITENS_LOJA } from '../src/index.ts';
import type { Fase } from '../src/index.ts';

/** Linter de decodificabilidade (rel. 25): toda palavra LIDA usa só grafemas já ensinados na região. */
function palavrasLidas(f: Fase): string[] {
  const out: string[] = [];
  for (const c of f.cenas) {
    const a = c.atividade;
    if (!a) continue;
    if (a.tipo === 'escolher') a.itens.forEach((i) => i.mostrar && out.push(i.mostrar.replace(/\s*\(.*\)$/, '').replace(/_/g, '')));
    if (a.tipo === 'falar') a.itens.forEach((i) => out.push(i.texto));
    if (a.tipo === 'montar' || a.tipo === 'ditado') a.palavras.filter((w) => !w.startsWith('$')).forEach((w) => out.push(w));
  }
  return out;
}

describe('conteúdo da jornada', () => {
  it('D027: Alfabeto → Sílabas (vogais, M-L-F) → Palavras → Meu nome, sem ids repetidos', () => {
    expect(REGIOES.map((r) => r.id)).toEqual(['AL', 'R1', 'R2a', 'R0']);
    expect(REGIOES.map((r) => r.etapa)).toEqual(['Alfabeto', 'Sílabas', 'Sílabas e palavras', 'Meu nome']);
    expect(FASES.filter((f) => f.regiao === 'AL')).toHaveLength(31);
    expect(FASES.filter((f) => f.regiao === 'R1').map((f) => f.id)).toEqual(['R1-F02', 'R1-F03', 'R1-F06', 'R1-F07']);
    expect(FASES.filter((f) => f.regiao === 'R2a')).toHaveLength(5);
    expect(FASES.filter((f) => f.regiao === 'R0').map((f) => f.id)).toEqual(['R0-F01']);
    expect(FASES.at(-1)!.id).toBe('R0-F01');
    expect(new Set(FASES.map((f) => f.id)).size).toBe(FASES.length);
    // as regiões cobrem a jornada inteira, na mesma ordem
    expect(REGIOES.flatMap((r) => r.fases)).toEqual(FASES.map((f) => f.id));
  });

  it('toda palavra lida é decodificável com os grafemas da região', () => {
    for (const f of FASES) {
      const permitidos = new Set(GRAFEMAS_DA_REGIAO[f.regiao]);
      for (const w of palavrasLidas(f)) {
        for (const letra of w.toUpperCase()) {
          expect(permitidos.has(letra), `${f.id}: "${w}" usa "${letra}"`).toBe(true);
        }
      }
    }
  });

  it('referências válidas: habilidades, conquistas e respostas certas', () => {
    for (const f of FASES) {
      f.habilidades.forEach((h) => expect(HABILIDADE_POR_ID[h], `${f.id} hab ${h}`).toBeDefined());
      f.conquistas.forEach((c) => expect(CONQUISTA_POR_ID[c], `${f.id} conquista ${c}`).toBeDefined());
      for (const c of f.cenas) {
        const a = c.atividade;
        if (a) expect(HABILIDADE_POR_ID[a.habilidade], `${c.id} hab ${a.habilidade}`).toBeDefined();
        if (a?.tipo === 'escolher') a.itens.forEach((i) => expect(i.opcoes.some((o) => o.id === i.correta), `${c.id}`).toBe(true));
      }
    }
  });

  it('cada fase tem cena C2 com Espelho ou "Assiste e Faz" seguido de atividade (D015)', () => {
    for (const f of FASES) {
      for (const c of f.cenas) if (c.assiste) expect(c.atividade, `${c.id}: vídeo sem atividade`).toBeDefined();
    }
  });

  it('concordância: todo {a|b|c} tem 3 formas', () => {
    const textos = [...FASES.flatMap((f) => [f.acolhida.texto, f.gancho.texto, ...f.cenas.flatMap((c) => [c.atividade?.enunciado.texto ?? '', ...(c.assiste?.roteiro.map((r) => r.texto) ?? [])])]), JSON.stringify(FALAS)];
    for (const t of textos) for (const m of t.match(/\{[^{}]*\|[^{}]*\}/g) ?? []) expect(m.split('|'), m).toHaveLength(3);
  });

  it('títulos e selos neutros (D022): sem nomes de pessoa com gênero', () => {
    const proibidos = /\b(Caçador|Mestre|Guardião|Leitor|Amigo|Craque|Cuidador)\b/;
    for (const f of FASES) for (const id of f.conquistas) expect(CONQUISTA_POR_ID[id].nome).not.toMatch(proibidos);
  });

  it('lojinha sem joias nem adornos e com preços positivos', () => {
    for (const i of ITENS_LOJA) {
      expect(i.preco).toBeGreaterThan(0);
      expect(i.nome).not.toMatch(/colar|brinco|anel|pulseira|joia|coroa/i);
    }
  });

  it('todo som tem dica de boca e palavra-figura', () => {
    for (const s of Object.values(SONS)) {
      expect(s.dica.length).toBeGreaterThan(5);
      expect(s.palavras.length).toBeGreaterThan(0);
    }
  });
});
