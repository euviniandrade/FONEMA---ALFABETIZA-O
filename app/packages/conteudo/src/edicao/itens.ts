/**
 * Trocar as PALAVRAS das atividades que levam o som de cada letra (gerenciador, fila do dono nº 18): juntar os sons
 * (síntese), caixas de sons, pares mínimos, troca-letras, frases e ditado. Cada função monta o item NOVO a partir do
 * antigo e da(s) palavra(s) nova(s), com os sons tirados do banco de palavras com pronúncia anotada (`comSons`), do
 * mesmo jeito que as fases são montadas em fases/tf.ts. Problema = `ErroItem` com o motivo em linguagem simples (e a
 * palavra sem pronúncia, para abrir o assistente). O verificador de decodificabilidade roda DEPOIS, no item montado.
 */
import { BANCO } from '../fases/tf-banco.ts';
import { comSons } from '../fases/tf.ts';
import { habilidadeDoPar } from '../sons.ts';
import { HABILIDADE_POR_ID } from '../habilidades.ts';
import { palavrasDaFrase } from '../decodificabilidade.ts';
import type { ItemFrase, ItemParMinimo, ItemTroca, Opcao, PalavraComSons } from '../tipos.ts';

export class ErroItem extends Error {
  constructor(public simples: string, public palavra?: string, public semPronuncia = false) { super(simples); }
}

const limpa = (w: string) => w.trim().toLowerCase();
/** A palavra está no banco? Senão, erro que abre o assistente de pronúncia. */
function doBanco(w: string): PalavraComSons {
  const k = limpa(w);
  if (!k) throw new ErroItem('Escreva a palavra.');
  if (!/^[a-záàâãéêíóôõúç]+$/.test(k)) throw new ErroItem(`"${w}": use só letras (uma palavra).`);
  if (!BANCO[k]) throw new ErroItem(`"${k}" é uma palavra nova: responda às perguntas de pronúncia primeiro.`, k, true);
  return comSons(k);
}
const temFiguraPadrao = (w: string) => !!BANCO[limpa(w)]?.figura;
const semRepetir = (l: string[]) => l.length === new Set(l).size;

/* ------------------------------------------------------------------ síntese */
export interface ItemSintese extends PalavraComSons { opcoes: Opcao[]; correta: string; pseudo?: boolean }
export function montarSintese(antigo: ItemSintese, palavra: string, outras: string[], temFigura = temFiguraPadrao): ItemSintese {
  const w = limpa(palavra);
  const cs = doBanco(w);
  const os = outras.map(limpa).filter(Boolean);
  if (os.length < 2) throw new ErroItem('Escreva pelo menos 2 outras palavras para as opções (3 opções no total: com 2, o chute acerta metade).');
  if (!semRepetir([w, ...os])) throw new ErroItem('As opções precisam ser diferentes entre si.');
  for (const o of os) doBanco(o);
  const certa = antigo.opcoes.find((o) => o.id === antigo.correta);
  const porFigura = !!certa && certa.figura !== undefined && !certa.botaoDeSom;
  if (porFigura) for (const x of [w, ...os]) if (!temFigura(x)) throw new ErroItem(`"${x}" não tem figura: as opções desta atividade são figuras.`, x);
  const op = (x: string): Opcao => (porFigura ? { id: x, rotulo: x, figura: '', falar: x } : { id: x, rotulo: '', falar: x, botaoDeSom: true });
  // a certa fica na posição em que estava (o app sorteia na tela)
  const pos = Math.max(0, antigo.opcoes.findIndex((o) => o.id === antigo.correta));
  const opcoes = os.map(op);
  opcoes.splice(Math.min(pos, opcoes.length), 0, op(w));
  const pseudo = !!BANCO[w]?.pseudo;
  return { ...antigo, ...cs, correta: w, opcoes, ...(pseudo ? { pseudo: true } : {}), ...(!pseudo && antigo.pseudo ? { pseudo: false } : {}) };
}

/* ------------------------------------------------------------------ caixas de sons */
export interface ItemCaixas extends PalavraComSons { figura?: string; letras: string[] }
export function montarCaixas(antigo: ItemCaixas, palavra: string, temFigura = temFiguraPadrao): ItemCaixas {
  const w = limpa(palavra);
  const cs = doBanco(w);
  const daPalavra = [...new Set([...cs.palavra])];
  const extras = antigo.letras.filter((l) => !daPalavra.includes(l)).slice(0, 2);
  if (!extras.length) { const v = ['A', 'E', 'I', 'O', 'U'].find((x) => !daPalavra.includes(x)); if (v) extras.push(v); }
  const { figura: _f, ...resto } = antigo;
  void _f;
  return { ...resto, ...cs, ...(temFigura(w) ? { figura: w } : {}), letras: [...daPalavra, ...extras] };
}

/* ------------------------------------------------------------------ pares mínimos */
/** Os dois sons que mudam entre duas palavras (um só, na mesma posição), ou erro. */
export function somQueMuda(a: string, b: string): [string, string] {
  const sa = doBanco(a).sons, sb = doBanco(b).sons;
  if (sa.length !== sb.length) throw new ErroItem(`"${limpa(a)}" e "${limpa(b)}" precisam ter o mesmo tamanho e mudar UM som só (como faca × vaca).`);
  const dif = sa.map((x, i) => (x !== sb[i] ? i : -1)).filter((i) => i >= 0);
  if (dif.length !== 1 || !sa[dif[0]] || !sb[dif[0]]) throw new ErroItem(`"${limpa(a)}" e "${limpa(b)}" precisam mudar UM som só (como faca × vaca).`);
  return [sa[dif[0]]!, sb[dif[0]]!];
}
export function montarPar(antigo: ItemParMinimo, alvo: string, outra: string, distrator: string, temFigura = temFiguraPadrao): ItemParMinimo {
  const [a, o, d] = [alvo, outra, distrator].map(limpa);
  const sons = somQueMuda(a, o);
  if (!d) throw new ErroItem('Escreva a 3ª opção (com só duas, o chute acerta metade das vezes).');
  doBanco(d);
  if (!semRepetir([a, o, d])) throw new ErroItem('As três palavras precisam ser diferentes.');
  const habilidade = habilidadeDoPar(sons);
  if (!HABILIDADE_POR_ID[habilidade]) throw new ErroItem(`O par de sons ${sons.join(' × ')} ainda não tem habilidade no painel (${habilidade}): escolha palavras que mudem um par de sons já trabalhado.`);
  if (antigo.modo === 'ouvir') for (const x of [a, o, d]) if (!temFigura(x)) throw new ErroItem(`"${x}" não tem figura: no "ouvir e tocar a figura" as três precisam de figura.`, x);
  const { figuraAlvo: _a, figuraOutra: _o, ...resto } = antigo;
  void _a; void _o;
  return { ...resto, alvo: a, outra: o, sons, distrator: d, ...(antigo.modo === 'ouvir' ? { figuraAlvo: a, figuraOutra: o } : {}), habilidade };
}

/* ------------------------------------------------------------------ troca-letras */
export function montarTroca(antigo: ItemTroca, de: string, para: string): ItemTroca {
  const D = limpa(de).toUpperCase(), P = limpa(para).toUpperCase();
  doBanco(D);
  const cp = doBanco(P);
  let posicao = -1;
  let acao: ItemTroca['acao'];
  if (D.length === P.length) {
    const dif = [...P].map((c, i) => (c !== D[i] ? i : -1)).filter((i) => i >= 0);
    if (dif.length !== 1) throw new ErroItem(`De "${D}" para "${P}" precisa mudar UMA letra só (ou pôr uma letra a mais).`);
    acao = 'trocar'; posicao = dif[0];
  } else if (P.length === D.length + 1) {
    for (let i = 0; i < P.length; i++) if (P.slice(0, i) + P.slice(i + 1) === D) { posicao = i; break; }
    if (posicao < 0) throw new ErroItem(`"${P}" precisa ser "${D}" com UMA letra a mais.`);
    acao = 'acrescentar';
  } else throw new ErroItem(`De "${D}" para "${P}" precisa mudar uma letra ou pôr uma a mais.`);
  const letra = P[posicao];
  const som = cp.sons[posicao];
  if (!som) throw new ErroItem(`A letra ${letra} de "${P}" não tem som sozinha ali: escolha outra troca.`);
  const letras = [letra, ...antigo.letras.filter((l) => l !== letra)].slice(0, Math.max(3, antigo.letras.length));
  const outras = antigo.leituras.map(limpa).filter((x) => x !== limpa(P) && x !== limpa(D));
  const terceira = outras.find((x) => !!BANCO[x]) ?? limpa(antigo.de);
  const leituras = [limpa(P), limpa(D), ...(terceira && terceira !== limpa(D) && terceira !== limpa(P) ? [terceira] : [])];
  if (leituras.length < 3) throw new ErroItem('Falta uma 3ª leitura para as opções: mude primeiro outra palavra deste item.');
  return { ...antigo, acao, de: D, para: P, posicao, letra, som, letras, leituras };
}

/* ------------------------------------------------------------------ frases */
export function montarFrase(antigo: ItemFrase, frase: string, temFigura = temFiguraPadrao, resposta?: { correta: string; opcoes: string[] }): ItemFrase {
  const f = frase.trim().replace(/\s+/g, ' ');
  if (!f) throw new ErroItem('Escreva a frase.');
  const palavras = palavrasDaFrase(f).map((w) => doBanco(w));
  const correta = limpa(resposta?.correta ?? antigo.correta);
  const opcoes = (resposta?.opcoes ?? antigo.opcoes).map(limpa).filter(Boolean);
  if (opcoes.length < 3) throw new ErroItem('A pergunta precisa de 3 figuras para escolher.');
  if (!opcoes.includes(correta)) throw new ErroItem('A resposta certa precisa estar entre as figuras.');
  if (!semRepetir(opcoes)) throw new ErroItem('As figuras precisam ser diferentes.');
  for (const o of opcoes) if (!temFigura(o)) throw new ErroItem(`"${o}" não tem figura.`, o);
  return { ...antigo, frase: f, palavras, correta, opcoes };
}

/* ------------------------------------------------------------------ ditado */
export function montarDitado(antigas: string[], palavras: string[]): { palavras: string[]; letras: string[] } {
  const ws = palavras.map((w) => limpa(w)).filter(Boolean);
  if (!ws.length) throw new ErroItem('Escreva pelo menos uma palavra.');
  for (const w of ws) doBanco(w);
  const letras = [...new Set([...antigas, ...ws.flatMap((w) => [...w.toUpperCase()])])].sort();
  return { palavras: ws.map((w) => w.toUpperCase()), letras };
}
