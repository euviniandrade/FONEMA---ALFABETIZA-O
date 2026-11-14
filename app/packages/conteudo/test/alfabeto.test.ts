import { describe, expect, it } from 'vitest';
import {
  ALFABETO, MARCADOR_PALAVRINHAS, PALAVRINHAS, PALAVRINHAS_REVISAO, palavrinhaPermitida, CONQUISTA_POR_ID, FALAS_ALFABETO, FASES, FASES_ALFABETO, FIGURAS, GRUPOS_ALFABETO, HABILIDADE_POR_ID, LETRAS_PARECIDAS, SONS, SONS_PARECIDOS,
  falaChave, falaNomeLetra, faseDaLetra, habilidadeLetra, seloDaLetra, sonsPurosPendentes
} from '../src/index.ts';
import type { AtividadeEscolher, Fase } from '../src/index.ts';

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
      expect(r.cenas.map((c) => c.titulo).slice(1)).toEqual(['Ache a letra', 'Ligue a letra à figura', 'Com qual letra começa?', 'Primeiras palavrinhas']);
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

  it('cada letra tem a missão no formato da D027: apresenta → som no Espelho → ache a letra → ache a figura → traçar → selo', () => {
    for (const f of letras) {
      const l = ALFABETO.find((x) => x.letra === f.alfabeto!.letra)!;
      const tipos = f.cenas.map((c) => c.atividade!.tipo);
      const base = l.fonema ? ['letra', 'espelho', 'escolher', 'escolher', 'tracar'] : ['letra', 'escolher', 'escolher', 'tracar'];
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
      const [acheLetra, acheFigura] = escolher(f);
      expect(acheLetra.itens.map((i) => i.opcoes.length)).toEqual([3, 4]);
      expect(acheLetra.itens.map((i) => i.correta)).toEqual([l.letra, l.minuscula]);
      expect(acheFigura.itens[0].correta).toBe(l.palavra);
      for (const i of [...acheLetra.itens, ...acheFigura.itens]) {
        expect(new Set(i.opcoes.map((o) => o.id)).size, `${f.id}: opções repetidas`).toBe(i.opcoes.length);
        expect(i.ouvir).toBe(falaNomeLetra(l));
        expect(i.quem).toBe(l.voz);
      }
    }
  });

  it('distratoras: nunca uma letra parecida no desenho nem uma figura com som parecido', () => {
    const junto = (grupos: string[][], a: string, b: string) => grupos.some((g) => g.includes(a) && g.includes(b));
    for (const f of letras) {
      const l = ALFABETO.find((x) => x.letra === f.alfabeto!.letra)!;
      const [acheLetra, acheFigura] = escolher(f);
      for (const i of acheLetra.itens) for (const o of i.opcoes) if (o.id.toUpperCase() !== l.letra) expect(junto(LETRAS_PARECIDAS, l.letra, o.id.toUpperCase()), `${l.letra} × ${o.id}`).toBe(false);
      for (const i of acheFigura.itens) for (const o of i.opcoes) {
        if (o.id === i.correta) continue;
        const outra = semAcento(o.id)[0];
        expect(outra, `${f.id}: ${o.id} começa com a mesma letra`).not.toBe(l.letra);
        expect(junto(SONS_PARECIDOS, l.letra, outra), `${l.letra} × ${o.id}`).toBe(false);
      }
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
    // as peças não falam (nada de nome de letra): a dupla junta e fala a palavra
    for (const f of FASES_ALFABETO) for (const c of f.cenas) if (c.marcador === MARCADOR_PALAVRINHAS) expect(c.atividade?.tipo === 'montar' && c.atividade.semSomDasPecas).toBe(true);
  });

  it('vozes: a dupla alterna entre as letras e as falas novas cabem no orçamento (≤ 9.000 caracteres)', () => {
    ALFABETO.forEach((l, i) => expect(l.voz).toBe(i % 2 === 0 ? 'sofia' : 'tales'));
    const porLetra = ALFABETO.reduce((s, l) => s + falaNomeLetra(l).length + falaChave(l).length, 0);
    const genericas = Object.values(FALAS_ALFABETO).reduce((s, t) => s + t.length, 0) * 2; // pior caso: as duas vozes
    expect(porLetra + genericas).toBeLessThan(3000);
  });
});
