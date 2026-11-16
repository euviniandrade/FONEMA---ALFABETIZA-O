/**
 * AL · TRILHA DO ALFABETO (D027): a jornada começa aqui. Uma missão curta por letra, de A a Z, montada a partir
 * dos dados de `alfabeto.ts`, + uma revisão no fim de cada bloco da trilha fônica + a Festa do Alfabeto (D031: na jornada,
 * cada letra vem logo antes da lição da Trilha dos Sons que ensina o som dela; ver regioes.ts).
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
import { ALFABETO, BLOCOS_ALFABETO, CENAS_DO_SOM, GRUPOS_ALFABETO, LETRAS_EM_ESPELHO, LICAO_DA_LETRA, ORDEM_LETRAS_JORNADA, PALAVRAS_FORA_DO_SOM_INICIAL, PALAVRAS_SEM_VOZ, PALAVRINHAS_REVISAO, PALAVRINHAS_REVISAO_JORNADA, letrasVistasAte, palavrinhasDaLetra, LETRAS_PARECIDAS, LETRA_POR_ID, SONS_PARECIDOS, falaChave, falaNomeLetra, faseDaLetra, habilidadeLetra, seloDaLetra, usaSomReal, type LetraAlfabeto } from '../alfabeto.ts';
import { FIGURAS, leituraPermitida } from '../palavras.ts';
import { FALAS_FONICAS, PARES_CONFUSOS, contrasteDosSons, parConfuso } from '../sons.ts';
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
  doisSonsE: 'Esta letra tem dois sons: o de elefante e o de pé.',
  doisSonsO: 'Esta letra tem dois sons: o de ovo e o de vovó.',
  palavrinha: 'As letras juntas viram palavra! Monte comigo.',
  nomes: 'Esta letra aparece em nomes.',
  muda: 'O H não faz som sozinho.',
  comU: 'O Q vem sempre com o U.',
  boca: 'Olha a minha boca fazendo o som.',
  repita: 'Repita comigo!',
  fezOSom: 'Isso! Você fez o som!',
  acheALetra: 'Ouça e toque na letra.',
  acheAFigura: 'Qual figura começa com o som desta letra?',
  acheAFiguraLetra: 'Qual figura começa com esta letra?',
  trace: 'Agora desenhe a letra com o dedo.',
  gancho: 'Amanhã tem outra letra!',
  // D031: depois da letra vem a lição da Trilha dos Sons com o som dela (mesmo texto e voz do gancho da trilha: já gravado)
  ganchoSom: 'Amanhã tem mais um som!',
  trilha: 'Toque na letra que está brilhando.',
  mostra: 'Mostrar a letra de hoje e dizer a palavra dela',
  // revisões e festa
  revisaoEntrada: 'Hora de brincar com as letras!',
  revisaoAcolhida: 'Hoje é dia de brincar com as letras que você já conhece!',
  comQualLetra: 'Com qual letra começa?',
  festaEntrada: 'Festa do Alfabeto!',
  festaAcolhida: 'Hoje é a Festa do Alfabeto! Você conhece todas as letras, de A a Z.',
  festaUau: 'Você conhece o alfabeto inteiro!',
  // D031: depois da Festa vêm os outros sons das vogais (é, ê, ó, ô); fala nova, sem voz ainda (docs/falas-pendentes.md)
  festaGancho: 'Agora as vogais vão mostrar os outros sons delas!'
} as const;

/** Posição da letra na ordem em que a JORNADA apresenta as letras (D031): "já vistas" = as que vêm antes nesta ordem. */
const indice = (letra: string) => ORDEM_LETRAS_JORNADA.indexOf(letra);
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
  // as distratoras também não formam par confundível ENTRE SI (m × n, p × b…): no primeiro contato nada se parece
  const somDe = (x: string) => LETRA_POR_ID[x]?.fonema;
  const out: string[] = [];
  for (let k = 0; k < ordem.length && out.length < n; k++) {
    const x = ordem[(k + salto) % ordem.length];
    if (out.includes(x) || out.some((y) => somDe(x) && somDe(y) && (somDe(x) === somDe(y) || parConfuso(somDe(x)!, somDe(y)!)))) continue;
    out.push(x);
  }
  return out;
}

const opLetraAl = (letra: string, minuscula = false): Opcao => {
  const t = minuscula ? letra.toLowerCase() : letra;
  const l = LETRA_POR_ID[letra.toUpperCase()];
  return { id: t, rotulo: t, letra: t, ...(l?.fonema ? { som: l.fonema } : {}) };
};
/** Botão de som (letra → som): não mostra nada escrito; tocar toca o fonema. */
const opSom = (fonema: string): Opcao => ({ id: `som:${fonema}`, rotulo: '', som: fonema, botaoDeSom: true });
/** Figura como opção, com o som do começo da palavra (para a correção contrastiva). */
const opFigDe = (palavra: string, l?: LetraAlfabeto): Opcao => ({ ...opFig(palavra), ...(l?.fonema ? { som: l.fonema } : {}) });
/** Apoio dito DEPOIS do acerto, com o nome da letra: "Isso! Esse é o som do B." */
export const falaApoio = (l: LetraAlfabeto) => `Isso! Esse é o som do ${l.letra}.`;
const apoioDe = (l: LetraAlfabeto): Fala => f(l.voz, falaApoio(l));
/** Só letras que entram nos jogos de som real (sem H e sem as letras de nomes). */
const comSom = (pool?: string[]) => (pool ?? ALFABETO.map((x) => x.letra)).filter((x) => usaSomReal(LETRA_POR_ID[x]));

/**
 * "Ouça o som e toque na letra" (D030 §1): o estímulo é o SOM REAL da letra, 2 vezes; o nome da letra só entra
 * como apoio depois do acerto. Distratoras distantes no desenho E no som (primeiro contato).
 * H, K, W e Y ficam no comportamento antigo (ouve "Letra H.").
 */
function itemAcheALetra(l: LetraAlfabeto, minuscula = false, pool?: string[]): ItemEscolha {
  const real = usaSomReal(l);
  const outras = distratoras(l.letra, minuscula ? 3 : 2, real ? [...LETRAS_PARECIDAS, ...SONS_PARECIDOS] : LETRAS_PARECIDAS, real ? comSom(pool) : pool);
  const base = {
    quem: l.voz, habilidade: habilidadeLetra(l.letra), correta: minuscula ? l.minuscula : l.letra,
    opcoes: posiciona(opLetraAl(l.letra, minuscula), outras.map((x) => opLetraAl(x, minuscula)))
  };
  if (!real) return { ...base, ouvir: falaNomeLetra(l), dica: falaChave(l), quemDica: l.voz, formato: 'outro' };
  return { ...base, ouvir: falaNomeLetra(l), somAlvo: l.fonema!, apoio: apoioDe(l), formato: 'som-letra' };
}

/** Sons distantes do som da letra (nunca um par confundível), de letras já vistas primeiro. */
function sonsDistantes(l: LetraAlfabeto, n: number, pool?: string[], salto = 0): string[] {
  const out: string[] = [];
  for (const x of distratoras(l.letra, 22, SONS_PARECIDOS, comSom(pool), salto)) {
    const fx = LETRA_POR_ID[x].fonema!;
    if (fx !== l.fonema && !out.includes(fx) && !parConfuso(fx, l.fonema!) && !out.some((y) => parConfuso(fx, y))) out.push(fx);
    if (out.length === n) break;
  }
  return out;
}

/** "Qual é o som desta letra?" (letra → som): vê a letra e escolhe entre 3 botões de som, que tocam ao toque (R8: 3 opções). */
function itemQualSom(l: LetraAlfabeto, minuscula = false, pool?: string[]): ItemEscolha {
  const outros = sonsDistantes(l, 2, pool, minuscula ? 2 : 0);
  return {
    quem: l.voz, mostrar: minuscula ? l.minuscula : l.letra, habilidade: habilidadeLetra(l.letra), correta: `som:${l.fonema}`,
    opcoes: posiciona(opSom(l.fonema!), outros.map(opSom)), apoio: apoioDe(l), formato: 'letra-som'
  };
}

/** Palavras com figura e voz que começam com o som da letra: primeiro as que NÃO são a palavra-chave recém-apresentada. */
export function figurasDoSom(l: LetraAlfabeto): string[] {
  const boas = l.palavras.filter((w) => FIGURAS[w] && !PALAVRAS_SEM_VOZ.includes(w) && !PALAVRAS_FORA_DO_SOM_INICIAL.includes(w));
  const extra = l.outraPalavra && FIGURAS[l.outraPalavra] && !boas.includes(l.outraPalavra) ? [l.outraPalavra] : [];
  const todas = [...new Set([...boas, ...extra])];
  return [...todas.filter((w) => w !== l.palavra), ...todas.filter((w) => w === l.palavra)];
}

/**
 * "Qual figura começa com este som?" (D030 §2a): ouve o SOM REAL, sem a letra na tela, e escolhe entre figuras —
 * de preferência outra palavra, não a palavra-chave. H, K, W e Y: comportamento antigo (vê a letra, ouve "Letra H.").
 */
function itemAcheAFigura(l: LetraAlfabeto, palavra = l.palavra, pool?: string[], salto = 0): ItemEscolha {
  const real = usaSomReal(l);
  const outras = distratoras(l.letra, 2, SONS_PARECIDOS, real ? comSom(pool) : pool, salto).map((x) => LETRA_POR_ID[x]);
  // a figura distratora também varia: a k-ésima palavra da outra letra
  const figDe = (x: LetraAlfabeto, k: number) => { const fs = figurasDoSom(x); return fs.length ? fs[(k + salto) % fs.length] : x.palavra; };
  const base = { quem: l.voz, habilidade: habilidadeLetra(l.letra), correta: palavra };
  if (!real) {
    return { ...base, ouvir: falaNomeLetra(l), mostrar: `${l.letra} ${l.minuscula}`, opcoes: posiciona(opFig(palavra), outras.map((x) => opFig(x.palavra))), dica: falaChave(l), quemDica: l.voz, formato: 'letra-figura' };
  }
  return {
    ...base, ouvir: falaNomeLetra(l), somAlvo: l.fonema!, somCorreta: l.fonema!, apoio: apoioDe(l), formato: 'som-figura',
    opcoes: posiciona(opFigDe(palavra, l), outras.map((x, k) => opFigDe(figDe(x, k), x)))
  };
}

/** "Com qual letra começa?": vê a figura, ouve a palavra e toca a letra. A correção toca os dois sons, sem dizer a letra. */
function itemComQualLetra(l: LetraAlfabeto, pool?: string[]): ItemEscolha {
  const outras = distratoras(l.letra, 2, [...LETRAS_PARECIDAS, ...SONS_PARECIDOS], pool);
  const real = usaSomReal(l);
  return {
    ouvir: l.palavra, quem: 'sofia', mostrarFigura: l.palavra, habilidade: habilidadeLetra(l.letra), formato: 'figura-letra',
    correta: l.letra, opcoes: posiciona(opLetraAl(l.letra), outras.map((x) => opLetraAl(x))),
    ...(real ? { somCorreta: l.fonema!, apoio: apoioDe(l) } : { dica: falaChave(l), quemDica: l.voz })
  };
}

/**
 * PAR MÍNIMO (D030 §3): depois do primeiro contato, os dois sons confundíveis aparecem JUNTOS, nos dois sentidos
 * (som → letra e letra → som), com a correção que diz o que muda (voz, boca).
 */
function itensParMinimo(a: LetraAlfabeto, b: LetraAlfabeto): ItemEscolha[] {
  const contraste = contrasteDosSons(a.fonema!, b.fonema!) ?? 'boca';
  const somLetra = (x: LetraAlfabeto, y: LetraAlfabeto): ItemEscolha => ({
    quem: x.voz, ouvir: falaNomeLetra(x), somAlvo: x.fonema!, habilidade: habilidadeLetra(x.letra), correta: x.letra, contraste, formato: 'par-minimo',
    opcoes: posiciona(opLetraAl(x.letra), [opLetraAl(y.letra)]), apoio: apoioDe(x)
  });
  const letraSom = (x: LetraAlfabeto, y: LetraAlfabeto): ItemEscolha => ({
    quem: x.voz, mostrar: x.letra, habilidade: habilidadeLetra(x.letra), correta: `som:${x.fonema}`, contraste, formato: 'par-minimo',
    opcoes: posiciona(opSom(x.fonema!), [opSom(y.fonema!)]), apoio: apoioDe(x)
  });
  return [somLetra(a, b), somLetra(b, a), letraSom(a, b)];
}
/** Pares confundíveis cujas duas letras já foram vistas até o fim do grupo `g` (grupos antigos, alfabéticos) e que se completam NESTE grupo. */
export function paresDoGrupo(g: number): [string, string][] {
  return paresEntre(GRUPOS_ALFABETO.slice(0, g + 1).flat(), GRUPOS_ALFABETO[g]);
}
/** Pares confundíveis entre letras já vistas (`vistasTodas`) com pelo menos uma letra do grupo `doGrupo`. */
export function paresEntre(vistasTodas: string[], doGrupo: string[]): [string, string][] {
  const vistas = vistasTodas.filter((x) => usaSomReal(LETRA_POR_ID[x]) && x !== 'Q');
  const letraDe = (fonema: string) => vistas.find((x) => LETRA_POR_ID[x].fonema === fonema);
  const out: [string, string][] = [];
  for (const [fa, fb] of PARES_CONFUSOS) {
    const la = letraDe(fa);
    const lb = letraDe(fb);
    if (la && lb && la !== lb && (doGrupo.includes(la) || doGrupo.includes(lb))) out.push([la, lb]);
  }
  return out;
}

/** LETRAS EM ESPELHO (b, d, p, q): ouve o som e acha a letra minúscula entre as que se parecem no desenho. */
function itensEspelho(letras: string[]): ItemEscolha[] {
  return letras.map((x) => {
    const l = LETRA_POR_ID[x];
    return {
      quem: l.voz, ouvir: falaNomeLetra(l), somAlvo: l.fonema!, habilidade: habilidadeLetra(x), correta: l.minuscula, contraste: 'desenho' as const, formato: 'espelho-letras' as const,
      opcoes: posiciona(opLetraAl(x, true), letras.filter((y) => y !== x).map((y) => opLetraAl(y, true))), apoio: apoioDe(l)
    };
  });
}

/** LIGA O SOM: letras do grupo com som real e cena própria (C = K = Q, I = Y, U = W: fica a primeira). */
export function paresLigaOSom(letras: string[]): { letra: string; cena: string; fonema: string; habilidade: string }[] {
  const out: { letra: string; cena: string; fonema: string; habilidade: string }[] = [];
  for (const x of letras) {
    const l = LETRA_POR_ID[x];
    if (!l.fonema || l.tipo === 'muda' || out.some((p) => p.cena === CENAS_DO_SOM[x] || p.fonema === l.fonema)) continue;
    out.push({ letra: x, cena: CENAS_DO_SOM[x], fonema: l.fonema, habilidade: habilidadeLetra(x) });
  }
  return out;
}
const opCena = (cena: string, fonema: string): Opcao => ({ id: cena, rotulo: '', figura: '', som: fonema });
/** Liga o som, modo 1: ouve o som e toca a CENA que faz esse som. */
function itemSomCena(p: { letra: string; cena: string; fonema: string }, todos: { letra: string; cena: string; fonema: string }[]): ItemEscolha {
  const outras = todos.filter((x) => x.cena !== p.cena && !parConfuso(x.fonema, p.fonema)).slice(0, 2);
  return {
    quem: LETRA_POR_ID[p.letra].voz, ouvir: falaNomeLetra(LETRA_POR_ID[p.letra]), somAlvo: p.fonema, somCorreta: p.fonema, habilidade: habilidadeLetra(p.letra), correta: p.cena, formato: 'som-cena',
    opcoes: posiciona(opCena(p.cena, p.fonema), outras.map((x) => opCena(x.cena, x.fonema)))
  };
}
/** Liga o som, modo 2: vê a cena, ouve o som e toca a LETRA. */
function itemCenaLetra(p: { letra: string; cena: string; fonema: string }, todos: { letra: string; cena: string; fonema: string }[]): ItemEscolha {
  const outras = todos.filter((x) => x.letra !== p.letra && !parConfuso(x.fonema, p.fonema)).slice(0, 2);
  return {
    quem: LETRA_POR_ID[p.letra].voz, ouvir: falaNomeLetra(LETRA_POR_ID[p.letra]), somAlvo: p.fonema, somCorreta: p.fonema, mostrarFigura: p.cena, habilidade: habilidadeLetra(p.letra), correta: p.letra, formato: 'cena-letra',
    opcoes: posiciona(opLetraAl(p.letra), outras.map((x) => opLetraAl(x.letra))), apoio: apoioDe(LETRA_POR_ID[p.letra])
  };
}

/** Cena das PRIMEIRAS PALAVRINHAS: juntar as letras já vistas e ler (o motor tira esta cena se a chave estiver desligada). */
export const MARCADOR_PALAVRINHAS = 'palavrinhas';
function cenaPalavrinhas(id: string, habilidade: string, quem: Voz, palavras: string[], vistasAte: string[]): Cena {
  // sem modelo, a bandeja precisa ter letras a mais (senão só resta acertar a ordem): duas letras já vistas, fora das palavras
  const usadas = new Set(palavras.flatMap((w) => [...w.normalize('NFD').replace(/[\u0300-\u036f]/g, '')]));
  const vistas = vistasAte.map((x) => LETRA_POR_ID[x]).filter((l) => l.tipo === 'vogal' || l.tipo === 'consoante').map((l) => l.letra);
  const distratoras = vistas.filter((x) => !usadas.has(x) && x !== 'Q').reverse().slice(0, 2);
  return {
    id, tipo: 'C5', titulo: 'Primeiras palavrinhas', cenario: 'quintal', marcador: MARCADOR_PALAVRINHAS,
    // D030 §5: a 1ª palavra é demonstração guiada; depois o modelo some e as peças tocam o SOM. Palavras com valores
    // sonoros ainda não ensinados (BIFE, GATO, BANANA…) ficam como vocabulário: não contam como decodificação.
    atividade: {
      tipo: 'montar', habilidade, palavras, mostrarModelo: true, modelo: 'demonstracao', enunciado: f(quem, FALAS_ALFABETO.palavrinha),
      ...(distratoras.length ? { distratoras } : {}),
      ...(palavras.every((w) => leituraPermitida(w, 'AL')) ? {} : { vocabulario: true })
    }
  };
}

const NOTA: Record<Exclude<NonNullable<LetraAlfabeto['nota']>, 'dois-sons'>, string> = {
  'outro-som': FALAS_ALFABETO.outroSom, nomes: FALAS_ALFABETO.nomes, muda: FALAS_ALFABETO.muda, 'com-u': FALAS_ALFABETO.comU
};

function faseDaLetraAl(l: LetraAlfabeto, numero: number): Fase {
  const q = l.voz;
  const hab = habilidadeLetra(l.letra);
  const id = faseDaLetra(l.letra);
  const vogal = l.tipo === 'vogal';
  const real = usaSomReal(l);
  const cenas: Cena[] = [
    {
      id: `${id}-C2`, tipo: 'C2', titulo: `A letra ${l.letra}`, cenario: 'licao', contaDominio: true,
      atividade: {
        tipo: 'letra', habilidade: hab, letra: l.letra, enunciado: f(q, FALAS_ALFABETO.olha),
        brincadeira: f(q, l.brincadeira), repita: f(q, FALAS_ALFABETO.repita),
        falas: [f(q, falaNomeLetra(l)), f(q, FALAS_ALFABETO.grandePequena), f(q, falaChave(l)), ...(l.nota ? [f(q, l.nota === 'dois-sons' ? (l.letra === 'E' ? FALAS_ALFABETO.doisSonsE : FALAS_ALFABETO.doisSonsO) : NOTA[l.nota])] : [])]
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
      // o título aparece na tela: com som real ele não pode dizer a letra (a resposta)
      id: `${id}-C3`, tipo: 'C3', titulo: real ? 'Ouça o som e ache a letra' : `Ache a letra ${l.letra}`, cenario: 'quintal', contaDominio: true,
      atividade: { tipo: 'escolher', estilo: 'tocar', habilidade: hab, enunciado: f(q, FALAS_ALFABETO.acheALetra), itens: [itemAcheALetra(l), itemAcheALetra(l, true)] }
    },
    // letra → som (D030 §1): só para as letras com som real
    ...(real ? [{
      id: `${id}-C3b`, tipo: 'C3' as const, titulo: `Qual é o som do ${l.letra}?`, cenario: 'quintal', contaDominio: true,
      atividade: { tipo: 'escolher' as const, estilo: 'tocar' as const, habilidade: hab, enunciado: f(q, FALAS_FONICAS.qualSom), itens: [itemQualSom(l), itemQualSom(l, true)] }
    }] : []),
    {
      id: `${id}-C4`, tipo: 'C4', titulo: l.fonema ? 'Qual começa com o som?' : 'Qual começa com a letra?', cenario: 'quintal', contaDominio: true,
      atividade: {
        tipo: 'escolher', estilo: 'cacar', habilidade: hab,
        enunciado: f(q, real ? FALAS_FONICAS.qualFigura : l.fonema ? FALAS_ALFABETO.acheAFigura : FALAS_ALFABETO.acheAFiguraLetra),
        // banco maior que a rodada: sorteia 2 (a palavra-chave recém-apresentada fica por último)
        itens: real ? figurasDoSom(l).map((w, k) => itemAcheAFigura(l, w, undefined, k)) : [itemAcheAFigura(l), ...(l.outraPalavra ? [itemAcheAFigura(l, l.outraPalavra, undefined, 2)] : [])],
        ...(real ? { sortear: 2 } : {})
      }
    },
    {
      id: `${id}-C5`, tipo: 'C5', titulo: `Desenhe a letra ${l.letra}`, cenario: 'ilha', contaDominio: true,
      atividade: { tipo: 'tracar', habilidade: hab, letras: [l.letra, l.minuscula], enunciado: f(q, FALAS_ALFABETO.trace) }
    }
  );
  const palavrinhas = palavrinhasDaLetra(l.letra);
  if (palavrinhas.length) cenas.push(cenaPalavrinhas(`${id}-C5p`, hab, q, palavrinhas, letrasVistasAte(l.letra)));
  const somTexto = l.tipo === 'muda' ? 'que ela não faz som sozinha' : l.tipo === 'nomes' ? 'onde ela aparece' : 'o som dela';
  return {
    id, regiao: 'AL', numero, titulo: `Letra ${l.letra}`, objetivo: `Conhecer a letra ${l.letra} e ${somTexto}, como em ${l.palavra.toUpperCase()}`,
    sessoesPrevistas: '1 missão curta', habilidades: [hab], criterio: { tipo: 'missao' }, curta: true, alfabeto: { letra: l.letra, tipo: 'letra' },
    falaEntrada: f(q, falaNomeLetra(l)), acolhida: f(q, FALAS_ALFABETO.acolhida), gancho: f('sofia', LICAO_DA_LETRA[l.letra] ? FALAS_ALFABETO.ganchoSom : FALAS_ALFABETO.gancho), cenas,
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

/** Como montar uma revisão do alfabeto: as letras do grupo, as já vistas ATÉ o fim dele e os grupos anteriores (para a Festa). */
interface PlanoRevisao {
  id: string;
  grupo: string[];
  /** Todas as letras vistas até o fim do grupo (inclusive), na ordem em que foram vistas. */
  vistas: string[];
  /** Grupos anteriores (a Festa volta a uma letra de cada um). */
  anteriores: string[][];
  festa: boolean;
  aquecimento: [string, string];
  palavrinhas: string[];
}

function faseDeRevisao(plano: PlanoRevisao, numero: number): Fase {
  const { id, festa, vistas } = plano;
  const letras = plano.grupo.map((x) => LETRA_POR_ID[x]);
  const pool = letras.map((l) => l.letra);
  const todas = festa ? ALFABETO.map((l) => l.letra) : vistas;
  const hab = habilidadeLetra(letras[0].letra);
  // festa: além do último grupo, volta a letras de todo o alfabeto (uma de cada grupo anterior por brincadeira)
  const deTodos = (k: number) => plano.anteriores.map((grupo, i) => LETRA_POR_ID[grupo[(k + i) % grupo.length]]);
  const comFigura = letras.filter((l) => l.tipo !== 'muda');
  const cenas: Cena[] = [
    aquecimento(`${id}-C3a`, plano.aquecimento[0], plano.aquecimento[1]),
    {
      id: `${id}-C4a`, tipo: 'C4', titulo: 'Ache a letra', cenario: 'praca', contaDominio: true,
      atividade: escolher(hab, 'tocar', FALAS_ALFABETO.acheALetra, letras.map((l, i) => itemAcheALetra(l, i % 2 === 1, pool)))
    },
    {
      id: `${id}-C4b`, tipo: 'C4', titulo: 'Ligue a letra à figura', cenario: 'praca', contaDominio: true,
      atividade: escolher(hab, 'cacar', FALAS_FONICAS.qualFigura, (festa ? [...comFigura.slice(0, 2), ...deTodos(0)] : comFigura).map((l) => itemAcheAFigura(l, usaSomReal(l) ? figurasDoSom(l)[0] : l.palavra, festa ? todas : pool)))
    },
    {
      id: `${id}-C4c`, tipo: 'C4', titulo: 'Com qual letra começa?', cenario: 'praca', contaDominio: true,
      atividade: escolher(hab, 'tocar', FALAS_ALFABETO.comQualLetra, (festa ? [...letras.slice(2, 4), ...deTodos(2)] : letras).map((l) => itemComQualLetra(l, festa ? todas : pool)))
    }
  ];
  // D030 §3: contraste fino só DEPOIS do primeiro contato — pares confundíveis e letras em espelho
  const pares = [...paresEntre(vistas, pool), ...(festa ? ([['P', 'B'], ['T', 'D']] as [string, string][]) : [])];
  if (pares.length) {
    cenas.push({
      id: `${id}-C4d`, tipo: 'C4', titulo: 'Sons parecidos', cenario: 'praca', contaDominio: true,
      atividade: { ...escolher(hab, 'tocar', FALAS_FONICAS.sonsParecidos, pares.flatMap(([a, b]) => itensParMinimo(LETRA_POR_ID[a], LETRA_POR_ID[b]))), ...(pares.length > 2 ? { sortear: 6 } : {}) }
    });
  }
  const espelho = LETRAS_EM_ESPELHO.filter((x) => vistas.includes(x));
  if (espelho.length >= 2 && (espelho.some((x) => pool.includes(x)) || festa)) {
    cenas.push({
      id: `${id}-C4e`, tipo: 'C4', titulo: 'Letras parecidas', cenario: 'praca', contaDominio: true,
      atividade: { ...escolher(hab, 'tocar', FALAS_FONICAS.letrasParecidas, itensEspelho(espelho)), ...(festa ? { sortear: 2 } : {}) }
    });
  }
  // LIGA O SOM: a letra e a cena que faz o som dela (ouvir → cena, cena → letra, e ligar os pares)
  const liga = paresLigaOSom(pool);
  if (liga.length >= 3) {
    cenas.push(
      {
        id: `${id}-C4f`, tipo: 'C4', titulo: 'Liga o som: qual é a cena?', cenario: 'praca', contaDominio: true,
        atividade: { ...escolher(hab, 'cacar', FALAS_FONICAS.qualCena, liga.map((p, k) => (k % 2 === 0 ? itemSomCena(p, liga) : itemCenaLetra(p, liga)))), sortear: 3 }
      },
      {
        id: `${id}-C4g`, tipo: 'C4', titulo: 'Liga o som', cenario: 'praca', contaDominio: true,
        atividade: { tipo: 'ligar', habilidade: hab, enunciado: f('tales', FALAS_FONICAS.ligaOSom), pares: liga, ...(liga.length > 4 ? { sortear: 4 } : {}) }
      }
    );
  }
  if (plano.palavrinhas.length) cenas.push(cenaPalavrinhas(`${id}-C5p`, hab, 'tales', plano.palavrinhas, vistas));
  const alfabetica = !/^AL-RV/.test(id);
  const de = letras[0].letra;
  const ate = letras[letras.length - 1].letra;
  const lista = `${pool.slice(0, -1).join(', ')} e ${pool.at(-1)}`;
  const nomeGrupo = alfabetica ? `de ${de} a ${ate}` : lista;
  return {
    id, regiao: 'AL', numero, titulo: festa ? 'Festa do Alfabeto' : alfabetica ? `Revisão: de ${de} a ${ate}` : `Revisão: ${lista}`,
    objetivo: festa ? 'Mostrar que conhece as 26 letras e o som de cada uma' : `Brincar com as letras ${nomeGrupo} misturadas`,
    sessoesPrevistas: '1 missão', habilidades: letras.map((l) => habilidadeLetra(l.letra)), criterio: { tipo: 'missao' }, curta: true,
    alfabeto: { tipo: festa ? 'festa' : 'revisao' },
    falaEntrada: f('tales', festa ? FALAS_ALFABETO.festaEntrada : FALAS_ALFABETO.revisaoEntrada),
    acolhida: f('tales', festa ? FALAS_ALFABETO.festaAcolhida : FALAS_ALFABETO.revisaoAcolhida),
    gancho: f('sofia', festa ? FALAS_ALFABETO.festaGancho : FALAS_ALFABETO.gancho), cenas,
    fechamento: festa ? 'Alfabeto Completo! As 26 letras brilham na trilha.' : `As letras ${nomeGrupo} brilham juntas na trilha.`,
    emCasa: festa
      ? 'Cantem o alfabeto apontando cada letra e lembrem a palavra de cada uma ("A, de abelha").'
      : `Brinquem de "letra, de quê?" com as letras ${nomeGrupo}: o adulto mostra a letra e a criança diz a palavra.`,
    conquistas: festa ? ['T-ALFABETO'] : letras.map((l) => seloDaLetra(l.letra)),
    ...(festa ? { termometro: 1, uau: FALAS_ALFABETO.festaUau } : {})
  };
}

/**
 * Revisões ANTIGAS (A–E, F–J, K–O, P–T, em ordem alfabética): ficam no banco (regra 7), FORA da jornada desde a D031.
 * Quem já as concluiu não perde nada; elas só não aparecem mais no caminho.
 */
export const FASES_ALFABETO_REVISOES_ANTIGAS: Fase[] = GRUPOS_ALFABETO.slice(0, -1).map((grupo, g) =>
  faseDeRevisao({
    id: `AL-R${g + 1}`, grupo, vistas: GRUPOS_ALFABETO.slice(0, g + 1).flat(), anteriores: [], festa: false,
    aquecimento: AQUECIMENTOS[g], palavrinhas: PALAVRINHAS_REVISAO[g]
  }, 0)
);

/** D031: aquecimento de cada revisão da jornada. */
const AQUECIMENTO_DA_REVISAO: Record<string, [string, string]> = {
  'AL-RV1': AQUECIMENTOS[0], 'AL-RV2': AQUECIMENTOS[1], 'AL-RV3': AQUECIMENTOS[2], 'AL-FESTA': AQUECIMENTOS[4]
};

/**
 * Trilha A–Z no MAPA (regra 7): as 26 letras em ordem alfabética, depois as revisões da jornada (vogais; sons que esticam;
 * sons que estouram) e a Festa do Alfabeto. A ORDEM DA JORNADA (D031) é outra: cada letra entra logo antes da lição da
 * Trilha dos Sons que ensina o som dela (regioes.ts monta essa ordem).
 */
export const FASES_ALFABETO: Fase[] = (() => {
  const out: Fase[] = ALFABETO.map((l, i) => faseDaLetraAl(l, i + 1));
  BLOCOS_ALFABETO.forEach((b, k) => {
    out.push(faseDeRevisao({
      id: b.id, grupo: b.letras, vistas: BLOCOS_ALFABETO.slice(0, k + 1).flatMap((x) => x.letras),
      anteriores: BLOCOS_ALFABETO.slice(0, k).map((x) => x.letras), festa: b.id === 'AL-FESTA',
      aquecimento: AQUECIMENTO_DA_REVISAO[b.id], palavrinhas: PALAVRINHAS_REVISAO_JORNADA[b.id] ?? []
    }, out.length + 1));
  });
  return out;
})();
