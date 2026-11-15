import { describe, expect, it } from 'vitest';
import {
  CONQUISTA_POR_ID, FASES, FALAS, FIGURAS, GRAFEMAS_DA_REGIAO, HABILIDADE_POR_ID, LETRAS_NO_COMPORTAMENTO_ANTIGO, PALAVRINHAS, PALAVRINHAS_REVISAO, PALAVRAS_R2A, REGIOES, SONS, ITENS_LOJA,
  VALORES_DAS_PALAVRAS, VALORES_ENSINADOS, VALORES_SO_AVISO, fonemasDasLetras, leituraPermitida, valoresDaPalavra, valoresInferidos
} from '../src/index.ts';
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

  /* ------------------------------------------------------------------------------------------------------------
   * D030 §12 · VERIFICADOR: valores sonoros nas leituras de TODAS as fases e nada de resposta entregue.
   * ---------------------------------------------------------------------------------------------------------- */
  const semAcento = (t: string) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase();
  const ehPalavra = (t: string) => /^\p{L}{2,}$/u.test(t);

  /** Palavras de LEITURA autônoma de uma fase: itens de ler (escolher com `leitura`) e o "ler em voz alta" (falar). */
  function leituras(f: Fase): { cena: string; palavra: string }[] {
    const out: { cena: string; palavra: string }[] = [];
    for (const c of f.cenas) {
      const a = c.atividade;
      if (a?.tipo === 'escolher') for (const i of a.itens) if (i.leitura && i.mostrar) out.push({ cena: c.id, palavra: i.mostrar });
      if (a?.tipo === 'falar' && a.leitura) for (const i of a.itens) out.push({ cena: c.id, palavra: i.texto });
    }
    return out;
  }

  it('valores sonoros: toda palavra montada ou lida está marcada no conteúdo, e a marcação cobre o que a escrita mostra', () => {
    const palavras = new Set<string>([...Object.values(PALAVRINHAS).flat(), ...PALAVRINHAS_REVISAO.flat(), ...PALAVRAS_R2A.map((w) => w.texto)]);
    for (const f of FASES) for (const c of f.cenas) {
      const a = c.atividade;
      if (a?.tipo === 'montar' || a?.tipo === 'ditado') a.palavras.filter((w) => !w.startsWith('$')).forEach((w) => palavras.add(w));
    }
    for (const f of FASES) for (const l of leituras(f)) palavras.add(l.palavra);
    for (const w of palavras) {
      expect(VALORES_DAS_PALAVRAS[w.toUpperCase()], `"${w}" sem o campo de valores sonoros`).toBeDefined();
      for (const v of valoresInferidos(w)) expect(VALORES_DAS_PALAVRAS[w.toUpperCase()], `"${w}" usa ${v}`).toContain(v);
    }
    // exemplos do diagnóstico: E e O finais que soam i e u, ó aberto, nasal e ditongo
    expect(valoresDaPalavra('BIFE')).toEqual(['e-final-i']);
    expect(valoresDaPalavra('DOZE')).toEqual(['e-final-i']);
    expect(valoresDaPalavra('GATO')).toEqual(['o-final-u']);
    expect(valoresDaPalavra('BOLA')).toEqual(['o-aberto']);
    expect(valoresDaPalavra('BANANA')).toEqual(['nasalizada']); // armadilha A5: aviso, não bloqueio
    expect(valoresDaPalavra('ANTA')).toContain('nasal');
    expect(valoresDaPalavra('REI')).toEqual(['ditongo']);
    expect(valoresDaPalavra('CASA')).toContain('s-som-z');
    expect(valoresDaPalavra('MALA')).toEqual([]);
    // as peças do Montar tocam o som de cada letra NA palavra (nunca o nome da letra)
    expect(fonemasDasLetras('GATO')).toEqual(['g', 'a', 't', 'u']);
    expect(fonemasDasLetras('BIFE')).toEqual(['b', 'i', 'f', 'i']);
    expect(fonemasDasLetras('BOLA', { o: true })).toEqual(['b', 'O', 'l', 'a']);
    expect(fonemasDasLetras('HELENA')[0]).toBeNull();
  });

  it('LEITURA autônoma em todas as fases: só palavras cujos valores sonoros já foram ensinados', () => {
    let total = 0;
    for (const f of FASES) {
      for (const l of leituras(f)) {
        total++;
        const faltam = valoresDaPalavra(l.palavra).filter((v) => !VALORES_ENSINADOS[f.regiao].includes(v) && !VALORES_SO_AVISO.includes(v));
        expect(faltam, `${l.cena}: "${l.palavra}" usa valor sonoro ainda não ensinado`).toEqual([]);
        expect(leituraPermitida(l.palavra, f.regiao)).toBe(true);
      }
      for (const c of f.cenas) {
        const a = c.atividade;
        // nenhuma leitura escapa do verificador: palavra escrita para ler tem de estar marcada como leitura
        if (a?.tipo === 'escolher') for (const i of a.itens) if (i.mostrar && ehPalavra(i.mostrar)) expect(i.leitura, `${c.id}: "${i.mostrar}" é leitura e não está marcada`).toBe(true);
        if (a?.tipo === 'falar' && a.itens.some((i) => ehPalavra(i.texto))) expect(a.leitura, `${c.id}: leitura em voz alta sem marca`).toBe(true);
        // montar/ditado com valores não ensinados só como VOCABULÁRIO (não conta como decodificação)
        if (a?.tipo === 'montar' && !a.vocabulario) for (const w of a.palavras.filter((x) => !x.startsWith('$'))) expect(leituraPermitida(w, f.regiao), `${c.id}: "${w}" precisa de vocabulario: true`).toBe(true);
        if (a?.tipo === 'montar' && a.vocabulario) expect(c.contaDominio, `${c.id}: vocabulário não conta para o domínio`).toBeFalsy();
        if (a?.tipo === 'ditado') for (const w of a.palavras) expect(leituraPermitida(w, f.regiao), `${c.id}: ditado de "${w}"`).toBe(true);
      }
    }
    expect(total).toBeGreaterThanOrEqual(15);
    // o verificador recusa de verdade
    for (const w of ['FOFO', 'BIFE', 'GATO', 'ANTA', 'REI', 'CASA', 'MUFE', 'SOL', 'GELO', 'QUEIJO', 'CARA', 'PRATO', 'HORA', 'CHUVA']) expect(leituraPermitida(w, 'R2a'), w).toBe(false);
    // Trilha A–Z: nem o Ó aberto está ensinado (BOLA e RODA ficam como vocabulário); depois da Ilha das Vogais, sim
    expect(leituraPermitida('BOLA', 'AL')).toBe(false);
    expect(leituraPermitida('BOLA', 'R2a')).toBe(true);
    for (const w of ['MALA', 'LUA', 'FOFA', 'MOLA', 'LIFU']) expect(leituraPermitida(w, 'R2a'), w).toBe(true);
  });

  it('a resposta não é entregue: nem pela letra na tela, nem pela dica, nem pela palavra inteira, nem pelo modelo', () => {
    const antigas = new Set(LETRAS_NO_COMPORTAMENTO_ANTIGO.map((l) => `letra-${l.toLowerCase()}`));
    for (const f of FASES) for (const c of f.cenas) {
      const a = c.atividade;
      if (a?.tipo === 'montar' && a.modelo === 'sempre') expect(c.contaDominio, `${c.id}: montar com modelo permanente é cópia`).toBeFalsy();
      if (a?.tipo !== 'escolher') continue;
      for (const i of a.itens) {
        const certa = i.opcoes.find((o) => o.id === i.correta)!;
        const onde = `${c.id} (${i.correta})`;
        const antiga = antigas.has(i.habilidade ?? '') && f.regiao === 'AL';
        // 1. a dica do 1º erro não diz a resposta (só as 4 letras listadas ficam no comportamento antigo)
        if (i.dica && !antiga) {
          const alvo = semAcento(certa.letra ?? certa.id);
          const dica = semAcento(i.dica);
          expect(new RegExp(alvo.length === 1 ? `(^|[^A-Z])${alvo}([^A-Z]|$)` : alvo).test(dica), `${onde}: a dica "${i.dica}" diz a resposta`).toBe(false);
        }
        // 2. som → letra / som → figura / som → cena: a letra-alvo não aparece na tela
        if (i.somAlvo && !i.mostrarFigura) expect(i.mostrar, `${onde}: a letra aparece junto do som`).toBeUndefined();
        if (i.formato === 'som-figura' || i.formato === 'som-cena') { expect(i.mostrar).toBeUndefined(); expect(i.mostrarFigura).toBeUndefined(); }
        // 3. figura como pergunta: nunca é uma das opções, e a opção-figura certa não vem acompanhada da letra
        if (i.mostrarFigura) expect(i.opcoes.some((o) => o.id === i.mostrarFigura), `${onde}: a figura da pergunta é uma opção`).toBe(false);
        if (i.mostrar && !antiga && certa.figura !== undefined && !i.leitura) {
          expect(semAcento(i.mostrar).includes(semAcento(certa.id)[0]), `${onde}: a letra "${i.mostrar}" entrega a figura`).toBe(false);
        }
        // 4. sílaba/fonema que falta: a pista não mostra a palavra inteira
        if (i.formato === 'silaba-falta' || i.formato === 'fonema-falta') {
          expect(i.mostrar, onde).toMatch(/_/);
          expect(i.mostrar, `${onde}: a pista mostra a palavra inteira`).not.toMatch(/\(/);
          expect(i.ouvir, `${onde}: a criança precisa ouvir a palavra`).toBeTruthy();
          expect((i.mostrar ?? '').replace(/_+/, certa.id)).toBe(i.ouvir!.toUpperCase());
        }
        // 5. ouvir as leituras: as opções são botões de som, sem nada escrito
        if (i.formato === 'ouvir-leituras') for (const o of i.opcoes) { expect(o.botaoDeSom, onde).toBe(true); expect(o.rotulo).toBe(''); expect(o.falar).toBeTruthy(); }
        // 6. botão de som nunca mostra texto; opção-figura precisa existir no banco
        for (const o of i.opcoes) {
          if (o.botaoDeSom) expect(o.rotulo, onde).toBe('');
          if (i.formato === 'som-figura') expect(FIGURAS[o.id], `${onde}: figura ${o.id}`).toBeDefined();
        }
      }
    }
    // "O Bolota leu errado" virou ouvir as leituras
    const bolota = FASES.flatMap((f) => f.cenas).find((c) => c.id === 'R2a-F02-C8')!.atividade!;
    expect(bolota.tipo === 'escolher' && bolota.itens.every((i) => i.formato === 'ouvir-leituras')).toBe(true);
    // "escada" não é mais pedida como "ééé"
    for (const f of FASES) for (const c of f.cenas) {
      const a = c.atividade;
      if (a?.tipo === 'escolher') for (const i of a.itens) if (/[ée]{3}/.test(i.ouvir ?? '') || i.opcoes.some((o) => o.letra === 'E' && o.id === i.correta)) expect(['escada', 'estrela']).not.toContain(i.ouvir === 'escada' || i.ouvir === 'estrela' ? i.ouvir : i.correta);
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
