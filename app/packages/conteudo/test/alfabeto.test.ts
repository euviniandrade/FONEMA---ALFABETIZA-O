import { describe, expect, it } from 'vitest';
import {
  ALFABETO, MARCADOR_PALAVRINHAS, PALAVRINHAS, PALAVRINHAS_REVISAO, palavrinhaPermitida, CONQUISTA_POR_ID, FALAS_ALFABETO, FASES, FASES_ALFABETO, FIGURAS, GRUPOS_ALFABETO, HABILIDADE_POR_ID, LETRAS_PARECIDAS, SONS, SONS_PARECIDOS,
  falaChave, falaNomeLetra, faseDaLetra, habilidadeLetra, seloDaLetra, sonsPurosPendentes,
  CENAS_DO_SOM, FALAS_FONICAS, LETRAS_EM_ESPELHO, LETRAS_NO_COMPORTAMENTO_ANTIGO, LETRA_POR_ID, PALAVRAS_SEM_VOZ, PARES_CONFUSOS, PARES_DE_VOZ, SONS_SEM_CLIPE, VOZES_DAS_FALAS_FONICAS,
  leituraPermitida, parConfuso, usaSomReal
} from '../src/index.ts';
import type { AtividadeEscolher, AtividadeLigar, Fase } from '../src/index.ts';

const semAcento = (t: string) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase();
const letras = FASES_ALFABETO.filter((f) => f.alfabeto?.tipo === 'letra');
const revisoes = FASES_ALFABETO.filter((f) => f.alfabeto?.tipo !== 'letra');
const escolher = (f: Fase) => f.cenas.map((c) => c.atividade).filter((a): a is AtividadeEscolher => a?.tipo === 'escolher');

describe('Trilha do Alfabeto (D027)', () => {
  it('a jornada começa pelo alfabeto: A é a primeira fase e as letras vêm em ordem A–Z', () => {
    expect(FASES[0].id).toBe('AL-A');
    expect(ALFABETO.map((l) => l.letra).join('')).toBe('ABCDEFGHIJKLMNOPQRSTUVWXYZ');
    expect(letras.map((f) => f.alfabeto!.letra).join('')).toBe('ABCDEFGHIJKLMNOPQRSTUVWXYZ');
    expect(letras.map((f) => f.id)).toEqual(ALFABETO.map((l) => faseDaLetra(l.letra)));
    // todo o alfabeto vem antes de qualquer outra etapa
    const ultimaAl = FASES.map((f) => f.regiao).lastIndexOf('AL');
    expect(FASES.slice(0, ultimaAl + 1).every((f) => f.regiao === 'AL')).toBe(true);
  });

  it('revisão a cada 5 letras e a Festa do Alfabeto no fim', () => {
    expect(FASES_ALFABETO.map((f) => f.id).join(' ')).toBe(
      'AL-A AL-B AL-C AL-D AL-E AL-R1 AL-F AL-G AL-H AL-I AL-J AL-R2 AL-K AL-L AL-M AL-N AL-O AL-R3 AL-P AL-Q AL-R S AL-T AL-R4 AL-U AL-V AL-W AL-X AL-Y AL-Z AL-FESTA'.replace('AL-R S', 'AL-R AL-S')
    );
    expect(revisoes).toHaveLength(5);
    expect(GRUPOS_ALFABETO.every((g) => g.length >= 4 && g.length <= 6)).toBe(true);
    revisoes.forEach((r, g) => {
      // a revisão mistura as letras do grupo: achar a letra, ligar letra-figura e "com qual letra começa?"
      expect(r.habilidades).toEqual(GRUPOS_ALFABETO[g].map(habilidadeLetra));
      const titulos = r.cenas.map((c) => c.titulo).slice(1);
      expect(titulos.slice(0, 3)).toEqual(['Ache a letra', 'Ligue a letra à figura', 'Com qual letra começa?']);
      expect(titulos.at(-1)).toBe('Primeiras palavrinhas');
      // D030: contraste fino e "Liga o som" entram nas revisões, entre as brincadeiras antigas e as palavrinhas
      for (const t of titulos.slice(3, -1)) expect(['Sons parecidos', 'Letras parecidas', 'Liga o som: qual é a cena?', 'Liga o som']).toContain(t);
      expect(titulos).toContain('Liga o som');
      // as brincadeiras de escuta de R0 viram aquecimento (não contam para a conclusão)
      expect(r.cenas[0].titulo).toMatch(/^Aquecimento/);
      expect(r.cenas[0].contaDominio).toBeFalsy();
      const perguntadas = new Set(escolher(r).flatMap((a) => a.itens.map((i) => i.habilidade)));
      for (const l of GRUPOS_ALFABETO[g]) expect(perguntadas.has(habilidadeLetra(l)), `${r.id}: ${l}`).toBe(true);
    });
    const festa = FASES_ALFABETO.at(-1)!;
    expect(festa.alfabeto?.tipo).toBe('festa');
    expect(festa.conquistas).toEqual(['T-ALFABETO']);
    expect(CONQUISTA_POR_ID['T-ALFABETO'].nome).toBe('Alfabeto Completo');
    expect(festa.termometro).toBe(1);
  });

  it('cada letra tem a missão: apresenta → som no Espelho → som → letra → letra → som → som → figura → traçar → selo', () => {
    for (const f of letras) {
      const l = ALFABETO.find((x) => x.letra === f.alfabeto!.letra)!;
      const real = usaSomReal(l);
      const tipos = f.cenas.map((c) => c.atividade!.tipo);
      const base = real ? ['letra', 'espelho', 'escolher', 'escolher', 'escolher', 'tracar'] : l.fonema ? ['letra', 'espelho', 'escolher', 'escolher', 'tracar'] : ['letra', 'escolher', 'escolher', 'tracar'];
      expect(tipos, f.id).toEqual(PALAVRINHAS[l.letra] ? [...base, 'montar'] : base);
      // as palavrinhas são um extra (não contam para concluir a missão: a chave de config pode desligá-las)
      expect(f.cenas.filter((c) => c.marcador !== MARCADOR_PALAVRINHAS).every((c) => c.contaDominio), f.id).toBe(true);
      expect(f.cenas.filter((c) => c.marcador === MARCADOR_PALAVRINHAS).every((c) => !c.contaDominio), f.id).toBe(true);
      expect(f.criterio.tipo).toBe('missao');
      expect(f.conquistas).toEqual([seloDaLetra(l.letra)]);
      expect(CONQUISTA_POR_ID[seloDaLetra(l.letra)].motivo).toBe(l.letra);
      expect(HABILIDADE_POR_ID[habilidadeLetra(l.letra)].regiao).toBe('AL');
      const tracar = f.cenas.find((c) => c.atividade?.tipo === 'tracar')!.atividade!;
      expect(tracar.tipo === 'tracar' && tracar.letras).toEqual([l.letra, l.minuscula]);
      const jogos = escolher(f);
      const acheLetra = jogos[0];
      const acheFigura = jogos.at(-1)!;
      expect(acheLetra.itens.map((i) => i.opcoes.length)).toEqual([3, 4]);
      expect(acheLetra.itens.map((i) => i.correta)).toEqual([l.letra, l.minuscula]);
      for (const i of jogos.flatMap((a) => a.itens)) {
        expect(new Set(i.opcoes.map((o) => o.id)).size, `${f.id}: opções repetidas`).toBe(i.opcoes.length);
        expect(i.quem).toBe(l.voz);
      }
      if (!real) {
        // comportamento antigo (H, K, W, Y): o estímulo é "Letra H." e a dica é "H, de hipopótamo."
        for (const i of [...acheLetra.itens, ...acheFigura.itens]) { expect(i.ouvir).toBe(falaNomeLetra(l)); expect(i.somAlvo).toBeUndefined(); }
        expect(acheFigura.itens[0].correta).toBe(l.palavra);
        continue;
      }
      // D030 §1: o estímulo é o SOM REAL; o nome da letra só entra como apoio depois do acerto
      for (const i of [...acheLetra.itens, ...acheFigura.itens]) {
        expect(i.somAlvo, f.id).toBe(l.fonema);
        expect(i.apoio).toEqual({ quem: l.voz, texto: `Isso! Esse é o som do ${l.letra}.` });
        expect(i.dica, `${f.id}: a dica não pode entregar a resposta`).toBeUndefined();
      }
      // letra → som: vê a letra e escolhe entre 2–3 botões de som, sem nada escrito
      const qualSom = jogos[1];
      expect(qualSom.itens.map((i) => i.mostrar)).toEqual([l.letra, l.minuscula]);
      expect(qualSom.itens.map((i) => i.opcoes.length)).toEqual([3, 3]); // R8: 3 opções em item que conta
      for (const i of qualSom.itens) {
        expect(i.correta).toBe(`som:${l.fonema}`);
        expect(i.ouvir).toBeUndefined();
        for (const o of i.opcoes) { expect(o.botaoDeSom).toBe(true); expect(o.rotulo).toBe(''); expect(SONS_SEM_CLIPE).not.toContain(o.som); }
      }
      // som → figura: sem a letra na tela, com banco maior que a rodada e a palavra-chave por último
      expect(acheFigura.sortear).toBe(2);
      for (const i of acheFigura.itens) { expect(i.mostrar, f.id).toBeUndefined(); expect(FIGURAS[i.correta], i.correta).toBeDefined(); expect(PALAVRAS_SEM_VOZ).not.toContain(i.correta); }
      expect(acheFigura.itens.at(-1)!.correta).toBe(l.palavra);
      if (acheFigura.itens.length > 1) expect(acheFigura.itens[0].correta).not.toBe(l.palavra);
    }
    expect(LETRAS_NO_COMPORTAMENTO_ANTIGO).toEqual(['H', 'K', 'W', 'Y']);
    expect(SONS_SEM_CLIPE).toEqual(['r', 'lh', 'nh']);
    // quase todas as letras têm mais de uma figura para o som (o banco é maior que a palavra-chave)
    expect(letras.filter((f) => usaSomReal(LETRA_POR_ID[f.alfabeto!.letra!]) && escolher(f).at(-1)!.itens.length >= 2).length).toBeGreaterThanOrEqual(20);
  });

  it('primeiro contato: distratoras distantes — nunca letra parecida no desenho, som parecido ou par confundível', () => {
    const junto = (grupos: string[][], a: string, b: string) => grupos.some((g) => g.includes(a) && g.includes(b));
    for (const f of letras) {
      const l = ALFABETO.find((x) => x.letra === f.alfabeto!.letra)!;
      const jogos = escolher(f);
      for (const i of jogos[0].itens) for (const o of i.opcoes) {
        const outra = o.id.toUpperCase();
        if (outra === l.letra) continue;
        expect(junto(LETRAS_PARECIDAS, l.letra, outra), `${l.letra} × ${o.id}`).toBe(false);
        if (usaSomReal(l)) expect(junto(SONS_PARECIDOS, l.letra, outra), `${l.letra} × ${o.id} (som)`).toBe(false);
      }
      for (const i of jogos.at(-1)!.itens) for (const o of i.opcoes) {
        if (o.id === i.correta) continue;
        const outra = semAcento(o.id)[0];
        expect(outra, `${f.id}: ${o.id} começa com a mesma letra`).not.toBe(l.letra);
        expect(junto(SONS_PARECIDOS, l.letra, outra), `${l.letra} × ${o.id}`).toBe(false);
      }
      // em toda a missão da letra, nenhum par de sons confundíveis aparece junto
      for (const i of jogos.flatMap((a) => a.itens)) {
        const sons = i.opcoes.map((o) => o.som).filter((x): x is string => !!x);
        for (const a of sons) for (const b of sons) expect(parConfuso(a, b), `${f.id}: ${a} × ${b}`).toBe(false);
      }
    }
  });

  it('D030 §3: os pares confundíveis e as letras em espelho são treinados nas revisões, nos dois sentidos', () => {
    const treinados = new Set<string>();
    const espelho = new Set<string>();
    for (const r of revisoes) {
      for (const c of r.cenas) {
        const a = c.atividade;
        if (a?.tipo !== 'escolher') continue;
        for (const i of a.itens) {
          if (i.formato === 'par-minimo') {
            expect(i.opcoes).toHaveLength(2);
            const [x, y] = i.opcoes.map((o) => o.som!);
            expect(parConfuso(x, y), `${c.id}: ${x} × ${y}`).toBe(true);
            expect(PARES_CONFUSOS.some(([p, q]) => (p === x && q === y) || (p === y && q === x))).toBe(true);
            expect(i.contraste).toBe(PARES_DE_VOZ.some(([p, q]) => (p === x && q === y) || (p === y && q === x)) ? 'voz' : 'boca');
            treinados.add([x, y].sort().join('/'));
            // só letras já vistas até aquela revisão
            const ate = ALFABETO.findIndex((l) => l.letra === GRUPOS_ALFABETO[revisoes.indexOf(r)].at(-1));
            for (const o of i.opcoes) if (o.letra) expect(ALFABETO.findIndex((l) => l.letra === o.letra!.toUpperCase())).toBeLessThanOrEqual(ate);
          }
          if (i.formato === 'espelho-letras') {
            expect(i.contraste).toBe('desenho');
            for (const o of i.opcoes) { expect(o.letra).toBe(o.letra!.toLowerCase()); expect(LETRAS_EM_ESPELHO).toContain(o.letra!.toUpperCase()); espelho.add(o.letra!); }
          }
        }
        const formatos = new Set(a.itens.map((i) => i.formato));
        if (formatos.has('par-minimo')) {
          // os dois sentidos: som → letra e letra → som (botões de som)
          expect(a.itens.some((i) => i.somAlvo && i.opcoes.every((o) => o.letra))).toBe(true);
          expect(a.itens.some((i) => i.mostrar && i.opcoes.every((o) => o.botaoDeSom))).toBe(true);
        }
      }
    }
    for (const par of ['b/p', 'd/t', 'f/v', 's/z', 'j/x', 'g/k', 'm/n']) expect(treinados, par).toContain(par);
    expect([...espelho].sort().join('')).toBe('bdpq');
  });

  it('Liga o som: cada letra tem a cena do faz de conta; o jogo entra nas revisões com 3–4 pares de sons diferentes', () => {
    for (const l of ALFABETO) expect(CENAS_DO_SOM[l.letra], l.letra).toBeTruthy();
    // C = K = Q, I = Y e U = W dividem a cena (e a brincadeira)
    expect(CENAS_DO_SOM.C).toBe(CENAS_DO_SOM.K); expect(CENAS_DO_SOM.C).toBe(CENAS_DO_SOM.Q);
    expect(CENAS_DO_SOM.I).toBe(CENAS_DO_SOM.Y); expect(CENAS_DO_SOM.U).toBe(CENAS_DO_SOM.W);
    expect(CENAS_DO_SOM.M).toBe('cupcake'); // "mmm, que delícia" é som de M, não de H
    expect(new Set(ALFABETO.filter((l) => !'KQYW'.includes(l.letra)).map((l) => CENAS_DO_SOM[l.letra])).size).toBe(22);
    for (const r of revisoes) {
      const ligar = r.cenas.map((c) => c.atividade).find((a): a is AtividadeLigar => a?.tipo === 'ligar')!;
      expect(ligar, r.id).toBeDefined();
      expect(ligar.pares.length).toBeGreaterThanOrEqual(3);
      expect(Math.min(ligar.pares.length, ligar.sortear ?? 4)).toBeLessThanOrEqual(4);
      expect(new Set(ligar.pares.map((p) => p.cena)).size).toBe(ligar.pares.length);
      expect(new Set(ligar.pares.map((p) => p.fonema)).size).toBe(ligar.pares.length);
      for (const p of ligar.pares) { expect(p.letra).not.toBe('H'); expect(p.cena).toBe(CENAS_DO_SOM[p.letra]); expect(p.fonema).toBe(LETRA_POR_ID[p.letra].fonema); expect(SONS_SEM_CLIPE).not.toContain(p.fonema); }
      // os outros dois modos: ouvir o som e tocar a cena; ver a cena, ouvir e tocar a letra
      const modos = escolher(r).flatMap((a) => a.itens.map((i) => i.formato));
      expect(modos).toContain('som-cena');
      expect(modos).toContain('cena-letra');
    }
  });

  it('regras fônicas do pt-BR: som principal, palavra inequívoca e letras especiais', () => {
    const som = Object.fromEntries(ALFABETO.map((l) => [l.letra, l.fonema]));
    expect(som).toMatchObject({ A: 'a', B: 'b', C: 'k', D: 'd', E: 'e', F: 'f', G: 'g', H: null, I: 'i', J: 'j', K: 'k', L: 'l', M: 'm', N: 'n', O: 'o', P: 'p', Q: 'k', R: 'rr', S: 's', T: 't', V: 'v', X: 'x', Z: 'z' });
    for (const l of ALFABETO) {
      // a palavra-exemplo começa com a letra, tem figura no banco e (se houver som) o som existe no Espelho do Som
      expect(semAcento(l.palavra)[0], l.letra).toBe(l.letra);
      expect(FIGURAS[l.palavra], `figura de ${l.palavra}`).toBeDefined();
      if (l.outraPalavra) { expect(semAcento(l.outraPalavra)[0]).toBe(l.letra); expect(FIGURAS[l.outraPalavra]).toBeDefined(); }
      if (l.fonema) expect(SONS[l.fonema], `som ${l.fonema}`).toBeDefined();
    }
    // som principal antes de vogal que não muda o som: C e G nunca com E/I; S e R no começo da palavra
    expect(ALFABETO.find((l) => l.letra === 'C')!.palavra).toMatch(/^c[aou]/);
    expect(ALFABETO.find((l) => l.letra === 'G')!.palavra).toMatch(/^g[aou]/);
    expect(ALFABETO.find((l) => l.letra === 'Q')!.palavra).toMatch(/^qu/);
    expect(ALFABETO.filter((l) => l.tipo === 'vogal').map((l) => l.letra)).toEqual(['A', 'E', 'I', 'O', 'U']);
    expect(ALFABETO.filter((l) => l.tipo === 'nomes').map((l) => l.letra)).toEqual(['K', 'W', 'Y']);
    expect(ALFABETO.filter((l) => l.tipo === 'muda').map((l) => l.letra)).toEqual(['H']);
    // letras com mais de um som avisam que o outro som vem depois (D027 §1)
    for (const letra of ['C', 'G', 'R', 'S', 'X']) expect(ALFABETO.find((l) => l.letra === letra)!.nota).toBe('outro-som');
    // E e O apresentam as duas vozes já na missão (pesquisa 44a): ê de elefante e é de pé; ô de ovo e ó de vovó
    expect(ALFABETO.find((l) => l.letra === 'E')!.segundoSom).toEqual({ ipa: '/ɛ/', fonema: 'E', palavra: 'pé' });
    expect(ALFABETO.find((l) => l.letra === 'O')!.segundoSom).toEqual({ ipa: '/ɔ/', fonema: 'O', palavra: 'vovó' });
    for (const l of ALFABETO) if (l.segundoSom) { expect(FIGURAS[l.segundoSom.palavra]).toBeDefined(); expect(SONS[l.segundoSom.fonema]).toBeDefined(); }
    // gestos: um diferente para cada letra (K repete o do C de propósito: é o mesmo som)
    const gestos = ALFABETO.filter((l) => l.letra !== 'K').map((l) => l.gesto);
    expect(new Set(gestos).size).toBe(gestos.length);
    // W e Y são letras de nomes: a figura é um crachá
    expect(ALFABETO.find((l) => l.letra === 'W')!.palavra).toBe('Wesley');
    expect(ALFABETO.find((l) => l.letra === 'Y')!.palavra).toBe('Yasmin');
    for (const letra of ['C', 'G', 'R', 'S', 'X']) expect(ALFABETO.find((l) => l.letra === letra)!.outroSom).toBeTruthy();
  });

  it('nunca diz o nome da letra como se fosse o som: a fala é "B, de bola." e o som puro fica para a fonoaudióloga', () => {
    for (const f of letras) {
      const l = ALFABETO.find((x) => x.letra === f.alfabeto!.letra)!;
      expect(falaChave(l)).toBe(`${l.letra}, de ${l.palavra}.`);
      const espelho = f.cenas.map((c) => c.atividade!).find((a) => a.tipo === 'espelho');
      if (!espelho || espelho.tipo !== 'espelho') { expect(l.tipo).toBe('muda'); continue; }
      // consoante: nada de som isolado na voz sintética; vogal: o som puro existe ("aaaa")
      if (l.tipo === 'vogal') expect(espelho.falaSom).toBeUndefined();
      else expect(espelho.falaSom).toBe(falaChave(l));
      expect(espelho.voz).toBe(l.voz);
    }
    expect(sonsPurosPendentes().map((l) => l.letra).join('')).toBe('BCDFGJKLMNPQRSTVWXYZ');
    // nenhuma fala da trilha tem som entre barras ou consoante esticada
    for (const t of Object.values(FALAS_ALFABETO)) expect(t).not.toMatch(/\/|([bcdfgjklmnpqrstvxz])\1\1/i);
  });

  it('primeiras palavrinhas: só letras já vistas, sem CE/CI/GE/GI/QUE/GUE e sem S ou R no meio', () => {
    expect(PALAVRINHAS.B).toEqual(['BABÁ']);
    expect(PALAVRINHAS.E).toEqual(['BEBÊ']);
    expect(PALAVRINHAS.F).toContain('CAFÉ');
    expect(PALAVRINHAS.L).toEqual(['BALA', 'FILA']);
    for (const [letra, palavras] of Object.entries(PALAVRINHAS)) {
      for (const w of palavras) {
        expect(palavrinhaPermitida(w, letra), `${w} depois de ${letra}`).toBe(true);
        expect(w.normalize('NFD').toUpperCase(), `${w} usa a letra ${letra}`).toContain(letra);
      }
    }
    PALAVRINHAS_REVISAO.forEach((palavras, g) => palavras.forEach((w) => expect(palavrinhaPermitida(w, GRUPOS_ALFABETO[g].at(-1)!), `${w} na revisão ${g + 1}`).toBe(true)));
    // o filtro recusa o que engana na 1ª volta
    for (const w of ['CEBOLA', 'GELO', 'QUEIJO', 'CASA', 'ARARA', 'CIDADE', 'GUIA']) expect(palavrinhaPermitida(w, 'Z'), w).toBe(false);
    expect(palavrinhaPermitida('BOLA', 'L')).toBe(false); // o O ainda não foi visto
    expect(palavrinhaPermitida('SAPO', 'S')).toBe(true);
    // D030 §5: a 1ª palavra é demonstração e depois o modelo some; as peças tocam o SOM (nunca o nome da letra)
    for (const f of FASES_ALFABETO) for (const c of f.cenas) if (c.marcador === MARCADOR_PALAVRINHAS) {
      const a = c.atividade!;
      if (a.tipo !== 'montar') throw new Error(`${c.id}: palavrinhas sem montar`);
      expect(a.modelo).toBe('demonstracao');
      expect(a.semSomDasPecas).toBeFalsy();
      // palavras com valores sonoros ainda não ensinados (BIFE, GATO, BANANA…) ficam como vocabulário
      expect(!!a.vocabulario, c.id).toBe(!a.palavras.every((w) => leituraPermitida(w, 'AL')));
    }
  });

  it('vozes: a dupla alterna entre as letras e as falas novas cabem no orçamento (≤ 9.000 caracteres)', () => {
    ALFABETO.forEach((l, i) => expect(l.voz).toBe(i % 2 === 0 ? 'sofia' : 'tales'));
    const porLetra = ALFABETO.reduce((s, l) => s + falaNomeLetra(l).length + falaChave(l).length, 0);
    const genericas = Object.values(FALAS_ALFABETO).reduce((s, t) => s + t.length, 0) * 2; // pior caso: as duas vozes
    expect(porLetra + genericas).toBeLessThan(3000);
    // D030 §11: as falas fônicas novas são genéricas (nenhuma por letra) e cabem no teto de 3.000 caracteres
    const fonicas = (Object.keys(FALAS_FONICAS) as (keyof typeof FALAS_FONICAS)[]).reduce((t, k) => t + FALAS_FONICAS[k].length * (VOZES_DAS_FALAS_FONICAS[k]?.length ?? 1), 0);
    expect(fonicas).toBeLessThan(3000);
    for (const t of Object.values(FALAS_FONICAS)) expect(t).not.toMatch(/(^|\s)[B-DF-NP-Z]([\s.,:!?]|$)|\//);
  });
});
