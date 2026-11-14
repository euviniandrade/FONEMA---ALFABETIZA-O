/**
 * AL · TRILHA DO ALFABETO (D027): a jornada começa aqui. Uma missão curta por letra, de A a Z, montada a partir
 * dos dados de `alfabeto.ts`, + uma revisão divertida a cada 5 letras + a Festa do Alfabeto no fim.
 *
 * Missão da letra (D027 §1):
 *   1. a dupla apresenta a letra (maiúscula e minúscula grandes) com a palavra-exemplo ("A, de abelha.");
 *   2. o SOM da letra no Espelho do Som (boca de frente);
 *   3. ouça e encontre: achar a letra entre 3–4;
 *   4. achar a figura que começa com o som da letra;
 *   5. traçar a letra com o dedo (maiúscula e minúscula);
 *   6. selo da letra (no ritual de fim).
 *
 * VOZES (orçamento curto): as frases são GENÉRICAS e gravadas uma vez por voz (`FALAS_ALFABETO`); por letra só
 * existem dois clipes curtos: "Letra B." e "B, de bola.". A Sofia e o Tales alternam entre as letras.
 * As brincadeiras de escuta de R0 (palmas, rimas, primeiro som, fala de tatu) entram como AQUECIMENTO das revisões.
 */
import type { Atividade, AtividadeEscolher, Cena, Fala, Fase, ItemEscolha, Opcao } from '../tipos.ts';
import { ALFABETO, GRUPOS_ALFABETO, LETRAS_PARECIDAS, LETRA_POR_ID, SONS_PARECIDOS, falaChave, falaNomeLetra, faseDaLetra, habilidadeLetra, seloDaLetra, type LetraAlfabeto } from '../alfabeto.ts';
import { opFig, posiciona } from '../construtores.ts';
import { FASES_R0 } from './r0.ts';

type Voz = 'sofia' | 'tales';
const f = (quem: Voz, texto: string): Fala => ({ quem, texto });

/** Frases genéricas da Trilha do Alfabeto: cada uma é gravada UMA vez por voz e serve para as 26 letras. */
export const FALAS_ALFABETO = {
  acolhida: 'Oi, [NOME]! Hoje tem letra nova!',
  olha: 'Olha só a letra de hoje!',
  grandePequena: 'Tem a grande e a pequena.',
  outroSom: 'Esta letra tem outro som, que vem depois.',
  nomes: 'Esta letra aparece em nomes.',
  muda: 'O H não faz som sozinho.',
  comU: 'O Q vem sempre com o U.',
  boca: 'Olha a minha boca fazendo o som.',
  fezOSom: 'Isso! Você fez o som!',
  acheALetra: 'Ouça e toque na letra.',
  acheAFigura: 'Qual figura começa com o som desta letra?',
  acheAFiguraLetra: 'Qual figura começa com esta letra?',
  trace: 'Agora desenhe a letra com o dedo.',
  gancho: 'Amanhã tem outra letra!',
  trilha: 'Toque na letra que está brilhando.',
  mostra: 'Mostrar a letra de hoje e dizer a palavra dela',
  // revisões e festa
  revisaoEntrada: 'Hora de brincar com as letras!',
  revisaoAcolhida: 'Hoje é dia de brincar com as letras que você já conhece!',
  comQualLetra: 'Com qual letra começa?',
  festaEntrada: 'Festa do Alfabeto!',
  festaAcolhida: 'Hoje é a Festa do Alfabeto! Você conhece todas as letras, de A a Z.',
  festaUau: 'Você conhece o alfabeto inteiro!',
  festaGancho: 'Agora a gente vai juntar as letras e fazer sílabas!'
} as const;

const indice = (letra: string) => ALFABETO.findIndex((l) => l.letra === letra);
const parecidas = (grupos: string[][], a: string, b: string) => grupos.some((g) => g.includes(a) && g.includes(b));

/**
 * Distratoras de uma letra: primeiro as letras JÁ VISTAS (as mais recentes antes), depois as próximas;
 * nunca uma letra parecida no desenho (`grupos`). Determinístico: sem sorte.
 */
function distratoras(letra: string, n: number, grupos: string[][], pool: string[] = ALFABETO.map((l) => l.letra), salto = 0): string[] {
  const i = indice(letra);
  const vistas = pool.filter((x) => indice(x) < i).reverse();
  const proximas = pool.filter((x) => indice(x) > i);
  const ordem = [...vistas, ...proximas].filter((x) => x !== letra && !parecidas(grupos, letra, x));
  const out: string[] = [];
  for (let k = 0; k < ordem.length && out.length < n; k++) out.push(ordem[(k + salto) % ordem.length]);
  return [...new Set(out)];
}

const opLetraAl = (letra: string, minuscula = false): Opcao => {
  const t = minuscula ? letra.toLowerCase() : letra;
  return { id: t, rotulo: t, letra: t };
};

/** "Ouça e toque na letra": ouve "Letra B." e acha a letra entre 3 (maiúsculas) ou 4 (minúsculas). */
function itemAcheALetra(l: LetraAlfabeto, minuscula = false, pool?: string[]): ItemEscolha {
  const outras = distratoras(l.letra, minuscula ? 3 : 2, LETRAS_PARECIDAS, pool);
  return {
    ouvir: falaNomeLetra(l), quem: l.voz, habilidade: habilidadeLetra(l.letra),
    correta: minuscula ? l.minuscula : l.letra,
    opcoes: posiciona(opLetraAl(l.letra, minuscula), outras.map((x) => opLetraAl(x, minuscula))),
    dica: falaChave(l), quemDica: l.voz
  };
}

/** "Qual figura começa com o som desta letra?": vê a letra, ouve "Letra B." e toca a figura. */
function itemAcheAFigura(l: LetraAlfabeto, palavra = l.palavra, pool?: string[], salto = 0): ItemEscolha {
  const outras = distratoras(l.letra, 2, SONS_PARECIDOS, pool, salto).map((x) => LETRA_POR_ID[x].palavra);
  return {
    ouvir: falaNomeLetra(l), quem: l.voz, mostrar: `${l.letra} ${l.minuscula}`, habilidade: habilidadeLetra(l.letra),
    correta: palavra, opcoes: posiciona(opFig(palavra), outras.map(opFig)), dica: falaChave(l), quemDica: l.voz
  };
}

/** "Com qual letra começa?": vê a figura, ouve a palavra e toca a letra. */
function itemComQualLetra(l: LetraAlfabeto, pool?: string[]): ItemEscolha {
  const outras = distratoras(l.letra, 2, [...LETRAS_PARECIDAS, ...SONS_PARECIDOS], pool);
  return {
    ouvir: l.palavra, quem: 'sofia', mostrarFigura: l.palavra, habilidade: habilidadeLetra(l.letra),
    correta: l.letra, opcoes: posiciona(opLetraAl(l.letra), outras.map((x) => opLetraAl(x))), dica: falaChave(l), quemDica: l.voz
  };
}

const NOTA: Record<NonNullable<LetraAlfabeto['nota']>, string> = {
  'outro-som': FALAS_ALFABETO.outroSom, nomes: FALAS_ALFABETO.nomes, muda: FALAS_ALFABETO.muda, 'com-u': FALAS_ALFABETO.comU
};

function faseDaLetraAl(l: LetraAlfabeto, numero: number): Fase {
  const q = l.voz;
  const hab = habilidadeLetra(l.letra);
  const id = faseDaLetra(l.letra);
  const vogal = l.tipo === 'vogal';
  const cenas: Cena[] = [
    {
      id: `${id}-C2`, tipo: 'C2', titulo: `A letra ${l.letra}`, cenario: 'licao', contaDominio: true,
      atividade: {
        tipo: 'letra', habilidade: hab, letra: l.letra, enunciado: f(q, FALAS_ALFABETO.olha),
        falas: [f(q, falaNomeLetra(l)), f(q, FALAS_ALFABETO.grandePequena), f(q, falaChave(l)), ...(l.nota ? [f(q, NOTA[l.nota])] : [])]
      }
    }
  ];
  if (l.fonema) {
    cenas.push({
      id: `${id}-C2b`, tipo: 'C2', titulo: `Espelho do Som: a boca do ${l.letra}`, cenario: 'licao', contaDominio: true,
      atividade: {
        tipo: 'espelho', habilidade: hab, fonema: l.fonema, letra: l.letra, ancora: { texto: l.palavra, figura: '' }, voz: q,
        // vogal: o som puro existe na voz ("aaaa"); consoante: "B, de bola." até a fonoaudióloga gravar o som puro
        ...(vogal ? { falaAncora: falaChave(l) } : { falaSom: falaChave(l), falaAncora: '' }),
        enunciado: f(q, FALAS_ALFABETO.boca), comemora: f(q, FALAS_ALFABETO.fezOSom)
      }
    });
  }
  cenas.push(
    {
      id: `${id}-C3`, tipo: 'C3', titulo: `Ache a letra ${l.letra}`, cenario: 'quintal', contaDominio: true,
      atividade: { tipo: 'escolher', estilo: 'tocar', habilidade: hab, enunciado: f(q, FALAS_ALFABETO.acheALetra), itens: [itemAcheALetra(l), itemAcheALetra(l, true)] }
    },
    {
      id: `${id}-C4`, tipo: 'C4', titulo: l.fonema ? 'Qual começa com o som?' : 'Qual começa com a letra?', cenario: 'quintal', contaDominio: true,
      atividade: {
        tipo: 'escolher', estilo: 'cacar', habilidade: hab, enunciado: f(q, l.fonema ? FALAS_ALFABETO.acheAFigura : FALAS_ALFABETO.acheAFiguraLetra),
        itens: [itemAcheAFigura(l), ...(l.outraPalavra ? [itemAcheAFigura(l, l.outraPalavra, undefined, 2)] : [])]
      }
    },
    {
      id: `${id}-C5`, tipo: 'C5', titulo: `Desenhe a letra ${l.letra}`, cenario: 'ilha', contaDominio: true,
      atividade: { tipo: 'tracar', habilidade: hab, letras: [l.letra, l.minuscula], enunciado: f(q, FALAS_ALFABETO.trace) }
    }
  );
  const somTexto = l.tipo === 'muda' ? 'que ela não faz som sozinha' : l.tipo === 'nomes' ? 'onde ela aparece' : 'o som dela';
  return {
    id, regiao: 'AL', numero, titulo: `Letra ${l.letra}`, objetivo: `Conhecer a letra ${l.letra} e ${somTexto}, como em ${l.palavra.toUpperCase()}`,
    sessoesPrevistas: '1 missão curta', habilidades: [hab], criterio: { tipo: 'missao' }, curta: true, alfabeto: { letra: l.letra, tipo: 'letra' },
    falaEntrada: f(q, falaNomeLetra(l)), acolhida: f(q, FALAS_ALFABETO.acolhida), gancho: f('sofia', FALAS_ALFABETO.gancho), cenas,
    fechamento: `A letra ${l.letra} acendeu na Trilha do Alfabeto.`,
    emCasa: l.tipo === 'muda'
      ? `Procurem a letra ${l.letra} em embalagens e placas. Ela não faz som sozinha: em "${l.palavra}" a gente já começa pelo som seguinte.`
      : `Procurem juntos coisas que começam como "${l.palavra}". Fale "${l.letra}, de ${l.palavra}" e deixe a criança achar a letra ${l.letra} em embalagens e placas.`,
    conquistas: [seloDaLetra(l.letra)],
    demonstracao: { descricao: FALAS_ALFABETO.mostra, habilidade: hab }
  };
}

/** Aquecimentos: as brincadeiras de escuta de R0, curtas, dentro das revisões (D027 §1). */
function aquecimento(id: string, cenaR0: string, titulo: string, max = 3): Cena {
  const cena = FASES_R0.flatMap((x) => x.cenas).find((c) => c.id === cenaR0);
  if (!cena?.atividade) throw new Error(`Aquecimento sem cena de origem: ${cenaR0}`);
  const a = cena.atividade;
  const curta: Atividade = a.tipo === 'escolher' ? { ...a, itens: a.itens.slice(0, max) } : a.tipo === 'palmas' ? { ...a, palavras: a.palavras.slice(0, max) } : a;
  return { id, tipo: 'C3', titulo: `Aquecimento: ${titulo}`, cenario: 'praca', atividade: curta };
}

const AQUECIMENTOS: [string, string][] = [
  ['R0-F03-C2', 'palmas nos pedacinhos'],
  ['R0-F02-C3', 'rima ou não rima?'],
  ['R0-F04-C3', 'o primeiro som'],
  ['R0-F05-C2', 'fala de tatu'],
  ['R0-F03-C5', 'palmas nos nomes']
];

const escolher = (habilidade: string, estilo: AtividadeEscolher['estilo'], enunciado: string, itens: ItemEscolha[]): AtividadeEscolher => ({
  tipo: 'escolher', estilo, habilidade, enunciado: f('tales', enunciado), itens
});

function faseDeRevisao(g: number, numero: number): Fase {
  const letras = GRUPOS_ALFABETO[g].map((x) => LETRA_POR_ID[x]);
  const festa = g === GRUPOS_ALFABETO.length - 1;
  const id = festa ? 'AL-FESTA' : `AL-R${g + 1}`;
  const pool = letras.map((l) => l.letra);
  const todas = ALFABETO.map((l) => l.letra);
  const hab = habilidadeLetra(letras[0].letra);
  // festa: além do grupo U–Z, volta a letras de todo o alfabeto (uma de cada grupo anterior por brincadeira)
  const deTodos = (k: number) => GRUPOS_ALFABETO.slice(0, -1).map((grupo, i) => LETRA_POR_ID[grupo[(k + i) % grupo.length]]);
  const comFigura = letras.filter((l) => l.tipo !== 'muda');
  const cenas: Cena[] = [
    aquecimento(`${id}-C3a`, AQUECIMENTOS[g][0], AQUECIMENTOS[g][1]),
    {
      id: `${id}-C4a`, tipo: 'C4', titulo: 'Ache a letra', cenario: 'praca', contaDominio: true,
      atividade: escolher(hab, 'tocar', FALAS_ALFABETO.acheALetra, letras.map((l, i) => itemAcheALetra(l, i % 2 === 1, pool)))
    },
    {
      id: `${id}-C4b`, tipo: 'C4', titulo: 'Ligue a letra à figura', cenario: 'praca', contaDominio: true,
      atividade: escolher(hab, 'cacar', FALAS_ALFABETO.acheAFigura, (festa ? [...comFigura.slice(0, 2), ...deTodos(0)] : comFigura).map((l) => itemAcheAFigura(l, l.palavra, festa ? todas : pool)))
    },
    {
      id: `${id}-C4c`, tipo: 'C4', titulo: 'Com qual letra começa?', cenario: 'praca', contaDominio: true,
      atividade: escolher(hab, 'tocar', FALAS_ALFABETO.comQualLetra, (festa ? [...letras.slice(2, 4), ...deTodos(2)] : letras).map((l) => itemComQualLetra(l, festa ? todas : pool)))
    }
  ];
  const de = letras[0].letra;
  const ate = letras[letras.length - 1].letra;
  return {
    id, regiao: 'AL', numero, titulo: festa ? 'Festa do Alfabeto' : `Revisão: de ${de} a ${ate}`,
    objetivo: festa ? 'Mostrar que conhece as 26 letras e o som de cada uma' : `Brincar com as letras de ${de} a ${ate} misturadas`,
    sessoesPrevistas: '1 missão', habilidades: letras.map((l) => habilidadeLetra(l.letra)), criterio: { tipo: 'missao' }, curta: true,
    alfabeto: { tipo: festa ? 'festa' : 'revisao' },
    falaEntrada: f('tales', festa ? FALAS_ALFABETO.festaEntrada : FALAS_ALFABETO.revisaoEntrada),
    acolhida: f('tales', festa ? FALAS_ALFABETO.festaAcolhida : FALAS_ALFABETO.revisaoAcolhida),
    gancho: f('sofia', festa ? FALAS_ALFABETO.festaGancho : FALAS_ALFABETO.gancho), cenas,
    fechamento: festa ? 'Alfabeto Completo! As 26 letras brilham na trilha, e a ponte para as sílabas abriu.' : `As letras de ${de} a ${ate} brilham juntas na trilha.`,
    emCasa: festa
      ? 'Cantem o alfabeto apontando cada letra e lembrem a palavra de cada uma ("A, de abelha").'
      : `Brinquem de "letra, de quê?" com as letras de ${de} a ${ate}: o adulto mostra a letra e a criança diz a palavra.`,
    conquistas: festa ? ['T-ALFABETO'] : letras.map((l) => seloDaLetra(l.letra)),
    ...(festa ? { termometro: 1, uau: FALAS_ALFABETO.festaUau } : {})
  };
}

/** A–E, revisão, F–J, revisão, K–O, revisão, P–T, revisão, U–Z, Festa do Alfabeto. */
export const FASES_ALFABETO: Fase[] = (() => {
  const out: Fase[] = [];
  GRUPOS_ALFABETO.forEach((grupo, g) => {
    for (const letra of grupo) out.push(faseDaLetraAl(LETRA_POR_ID[letra], out.length + 1));
    out.push(faseDeRevisao(g, out.length + 1));
  });
  return out;
})();
