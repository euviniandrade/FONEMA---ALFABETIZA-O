/**
 * FICHAS DE LEITURA POR CAMPO SEMÂNTICO (D033): regras puras — o que a criança já pode LER em cada campo, quais níveis
 * estão abertos e os itens de cada rodada. Conteúdo, classes de boca e níveis: @fonema/conteudo › fichas.ts.
 *
 *  - "Já legível": todos os valores sonoros ensinados numa unidade CONCLUÍDA (05 §2–3; o mesmo critério dos jogos da vila e da
 *    escrita própria), sem os valores que o verificador só avisa (vogal nasalizada) e com todos os sons puros publicados (a
 *    ficha toca cada som). O resto do campo fica trancado, "abre com as missões" — nunca para ler (regra 2).
 *  - Níveis destrancam com acertos SOZINHO (sem ajuda) no nível anterior, em qualquer campo [DP: 3 acertos]; nada fecha de
 *    novo e errar não tira nada (sem punição).
 *  - Registro (contrato do motor, estado.ts): mecânica 'ficha'; `formato` diz o nível; ler junto (nível 1) é EXPOSIÇÃO; as
 *    escolhas conferidas são AVALIADAS (leitura, síntese ou boca ↔ som).
 */
import {
  BANCO, CAMPOS_SEMANTICOS, CAMPO_POR_ID, FASE_POR_ID, PALAVRAS_DAS_FICHAS, SONS_PUBLICADOS, VALORES_AVISO, bocasDistinguiveis, classeDaBoca, fichaTemSons,
  letrasComSomPrincipal, palavrasDistinguiveisPelaBoca, sonsDaFicha, valoresDaEntrada, verificarPalavra, type CampoSemantico
} from '@fonema/conteudo';
import type { Progresso, Tentativa } from './estado.ts';
import { unidadeConcluida } from './biblioteca.ts';
import { acertoSozinho } from './tentativas.ts';

/** Modos das fichas: nível 1 (ler junto), 2 (só o som → figura; degrau: → palavra escrita), 3 (letra ↔ boca), 4 (só bocas → figura). */
export type ModoFicha = 'ler' | 'ouvir' | 'ouvir-palavra' | 'bocas' | 'bocas-palavra';
export const MODOS_FICHA: ModoFicha[] = ['ler', 'ouvir', 'ouvir-palavra', 'bocas', 'bocas-palavra'];
export const NIVEL_DO_MODO: Record<ModoFicha, 1 | 2 | 3 | 4> = { ler: 1, ouvir: 2, 'ouvir-palavra': 2, bocas: 3, 'bocas-palavra': 4 };
/** `formato` gravado em cada tentativa (o tipo de atividade, 06 §2 item 5). */
export const FORMATO_DO_MODO: Record<ModoFicha, string> = { ler: 'ficha-ler', ouvir: 'ficha-ouvir', 'ouvir-palavra': 'ficha-ouvir-palavra', bocas: 'ficha-bocas', 'bocas-palavra': 'ficha-bocas-palavra' };
/** Formato da parte guiada do nível 1 (ler junto): exposição, não conta para domínio (regra 4). */
export const FORMATO_LER_JUNTO = 'ficha-ler-junto';
/**
 * Habilidade de cada modo: a escolha da figura depois de ler junto é LEITURA; só o som → figura é SÍNTESE (juntar sons
 * ouvidos); só o som → palavra escrita é LEITURA (as opções escritas são lidas); bocas → consciência articulatória.
 */
export const HABILIDADE_DO_MODO: Record<ModoFicha, string> = { ler: 'leitura-cvcv', ouvir: 'sintese', 'ouvir-palavra': 'leitura-cvcv', bocas: 'boca-som', 'bocas-palavra': 'boca-som' };
/** [DP] Acertos sozinho no modo anterior para abrir o próximo. */
export const FICHAS_ACERTOS_PARA_ABRIR = 3;
/** [DP] Palavras por rodada (níveis 1, 2 e 4) e pares letra ↔ boca por rodada (nível 3). */
export const FICHAS_POR_RODADA = 3;
export const PARES_POR_RODADA = 4;

type Rng = () => number;

/* ------------------------------------------------------------ o que a criança já lê ------------------------------------------------------------ */

/** A palavra pode ser LIDA na ficha agora? (sons ensinados numa unidade concluída, sem aviso, sons puros publicados) */
export function legivelNaFicha(p: Progresso, w: string): boolean {
  return legivelNaUnidade(unidadeConcluida(p), w);
}
/** O resultado só depende da unidade concluída: guardado para não refazer a análise a cada tela. */
const LEGIVEL = new Map<string, boolean>();
function legivelNaUnidade(n: number, w: string): boolean {
  const chave = `${n}|${w.toLowerCase()}`;
  const ja = LEGIVEL.get(chave);
  if (ja !== undefined) return ja;
  const e = BANCO[w.toLowerCase()];
  const ok = n > 0 && !!e && !e.pseudo && verificarPalavra(e.texto, n, BANCO).ok && !valoresDaEntrada(e).valores.some((v) => VALORES_AVISO.includes(v)) && fichaTemSons(e.texto);
  LEGIVEL.set(chave, ok);
  return ok;
}

export interface EstadoCampo { campo: CampoSemantico; legiveis: string[]; trancadas: string[] }

/** Cada campo com as palavras que a criança já lê e as trancadas ("abre com as missões"). */
export function estadoDosCampos(p: Progresso): EstadoCampo[] {
  return CAMPOS_SEMANTICOS.map((campo) => {
    const legiveis = campo.palavras.filter((w) => legivelNaFicha(p, w));
    return { campo, legiveis, trancadas: campo.palavras.filter((w) => !legiveis.includes(w)) };
  });
}

/** Tentativas das fichas (todas as habilidades), na ordem em que aconteceram. */
export function tentativasDasFichas(p: Progresso): Tentativa[] {
  return Object.values(p.habilidades).flatMap((h) => h.tentativas).filter((t) => t.mecanica === 'ficha').sort((a, b) => a.em - b.em);
}
/** Acertos sozinho (sem ajuda, avaliados) num modo, em qualquer campo. */
export const acertosNoModo = (p: Progresso, modo: ModoFicha): number =>
  tentativasDasFichas(p).filter((t) => t.formato === FORMATO_DO_MODO[modo] && acertoSozinho(t)).length;

/** Palavras legíveis em qualquer campo do banco (para as opções ESCRITAS do degrau "ouvir → palavra"). */
export function palavrasLegiveis(p: Progresso): string[] {
  return Object.values(BANCO).filter((e) => !e.pseudo && legivelNaFicha(p, e.texto)).map((e) => e.texto.toLowerCase());
}

export interface EstadoModo { modo: ModoFicha; nivel: 1 | 2 | 3 | 4; aberto: boolean; acertos: number; motivo?: string }

/** Os modos de um campo: abertos ou trancados (com o porquê, em linguagem de criança/adulto). */
export function modosDaFicha(p: Progresso, campoId: string): EstadoModo[] {
  const campo = estadoDosCampos(p).find((c) => c.campo.id === campoId);
  const temLeitura = !!campo?.legiveis.length;
  const ac = Object.fromEntries(MODOS_FICHA.map((m) => [m, acertosNoModo(p, m)])) as Record<ModoFicha, number>;
  const falta = (m: ModoFicha, nome: string) => `Abre com ${FICHAS_ACERTOS_PARA_ABRIR} acertos em "${nome}" (faltam ${Math.max(0, FICHAS_ACERTOS_PARA_ABRIR - ac[m])})`;
  const out: EstadoModo[] = [];
  const add = (modo: ModoFicha, aberto: boolean, motivo?: string) => out.push({ modo, nivel: NIVEL_DO_MODO[modo], aberto, acertos: ac[modo], ...(aberto ? {} : { motivo }) });
  const semPalavra = 'Abre quando você aprender os sons de uma palavra deste cartão';
  add('ler', temLeitura, semPalavra);
  add('ouvir', temLeitura && ac.ler >= FICHAS_ACERTOS_PARA_ABRIR, temLeitura ? falta('ler', 'Vamos ler juntos') : semPalavra);
  const legiveisTodas = temLeitura ? palavrasLegiveis(p) : [];
  add('ouvir-palavra', temLeitura && ac.ouvir >= FICHAS_ACERTOS_PARA_ABRIR && legiveisTodas.length >= 3,
    !temLeitura ? semPalavra : ac.ouvir < FICHAS_ACERTOS_PARA_ABRIR ? falta('ouvir', 'Só o som') : 'Abre quando você souber ler mais palavras');
  const parOk = temLeitura && !!rodadaDeBocas(p, campoId, () => 0.5);
  add('bocas', parOk && ac.ouvir + ac['ouvir-palavra'] >= FICHAS_ACERTOS_PARA_ABRIR,
    !temLeitura ? semPalavra : !parOk ? 'Abre quando você souber mais sons' : falta('ouvir', 'Só o som'));
  const alvosBoca = temLeitura ? campo!.legiveis.filter((w) => distratoresPelaBoca(w, () => 0.5).length >= 2) : [];
  add('bocas-palavra', alvosBoca.length > 0 && ac.bocas >= FICHAS_ACERTOS_PARA_ABRIR,
    !temLeitura ? semPalavra : !alvosBoca.length ? 'Abre quando houver palavras com bocas bem diferentes' : falta('bocas', 'Letra e boquinha'));
  return out;
}

/* ------------------------------------------------------------ itens ------------------------------------------------------------ */

function misturar<T>(xs: readonly T[], r: Rng): T[] {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

/** Quanto duas palavras se parecem pelo som (para o distrator que "compartilha sons", R7): mesmo começo, sons em comum, tamanho. */
function parecenca(a: string, b: string): number {
  const sa = sonsDaFicha(a);
  const sb = sonsDaFicha(b);
  let n = 0;
  if (sa[0] === sb[0]) n += 3;
  if (sa[sa.length - 1] === sb[sb.length - 1]) n += 1;
  const resto = [...sb];
  for (const s of sa) { const k = resto.indexOf(s); if (k >= 0) { n++; resto.splice(k, 1); } }
  if (Math.abs(sa.length - sb.length) <= 1) n += 1;
  return n;
}
/** Figura de uma palavra do banco (duas palavras com a mesma figura não podem ser opções juntas). */
const figuraDe = (w: string) => BANCO[w]?.figura ?? w;

/** Escolhe `n` distratores do `pool` que compartilham sons com o alvo (entre os mais parecidos, sorteado). */
function escolherDistratores(alvo: string, pool: string[], n: number, r: Rng, extra: (d: string, ja: string[]) => boolean = () => true): string[] {
  const candidatos = misturar(pool.filter((w) => w !== alvo && figuraDe(w) !== figuraDe(alvo) && sonsDaFicha(w).join() !== sonsDaFicha(alvo).join()), r)
    .map((w) => ({ w, s: parecenca(alvo, w) }))
    .sort((a, b) => b.s - a.s);
  const out: string[] = [];
  // primeiro entre os que dividem ao menos 2 pontos de parecença (som em comum); depois qualquer um
  for (const limite of [2, -1]) {
    for (const c of candidatos) {
      if (out.length >= n) break;
      if (c.s < limite || out.includes(c.w) || out.some((o) => figuraDe(o) === figuraDe(c.w))) continue;
      if (!extra(c.w, out)) continue;
      out.push(c.w);
    }
  }
  return out.slice(0, n);
}

/** Palavras com figura e com som que servem de distrator de FIGURA (não precisam ser legíveis: a criança não lê a figura). */
const POOL_FIGURAS = PALAVRAS_DAS_FICHAS.filter((w) => BANCO[w]?.figura && fichaTemSons(w));

/** Distratores do nível 4: bocas diferentes do alvo e entre si (senão a resposta seria adivinhação). */
export function distratoresPelaBoca(alvo: string, r: Rng, n = 2): string[] {
  return escolherDistratores(alvo, POOL_FIGURAS, n, r, (d, ja) => palavrasDistinguiveisPelaBoca(alvo, d) && ja.every((o) => palavrasDistinguiveisPelaBoca(o, d)));
}

export interface ItemFicha {
  palavra: string;
  /** Opções na ORDEM DA TELA (a certa incluída). Figuras nos modos ler, ouvir e bocas-palavra; palavras escritas em ouvir-palavra. */
  opcoes: string[];
  posicaoCerta: number;
}

/**
 * A rodada de um modo (níveis 1, 2 e 4): até `FICHAS_POR_RODADA` palavras legíveis do campo, cada uma com 2 distratores que
 * dividem sons com ela (R7); posição da certa sorteada e nunca a mesma duas vezes seguidas (R5).
 */
export function rodadaDaFicha(p: Progresso, campoId: string, modo: Exclude<ModoFicha, 'bocas'>, r: Rng, n = FICHAS_POR_RODADA): ItemFicha[] {
  const campo = estadoDosCampos(p).find((c) => c.campo.id === campoId);
  if (!campo) return [];
  const legiveis = modo === 'ouvir-palavra' ? palavrasLegiveis(p) : [];
  let alvos = misturar(campo.legiveis, r);
  if (modo === 'bocas-palavra') alvos = alvos.filter((w) => distratoresPelaBoca(w, r).length >= 2);
  const out: ItemFicha[] = [];
  let antes = -1;
  for (const palavra of alvos.slice(0, n)) {
    const ds = modo === 'bocas-palavra' ? distratoresPelaBoca(palavra, r)
      : modo === 'ouvir-palavra' ? escolherDistratores(palavra, legiveis, 2, r)
        : escolherDistratores(palavra, POOL_FIGURAS, 2, r);
    if (ds.length < 2) continue;
    let pos = Math.floor(r() * 3);
    if (pos === antes) pos = (pos + 1 + Math.floor(r() * 2)) % 3;
    antes = pos;
    const opcoes = [...ds];
    opcoes.splice(pos, 0, palavra);
    out.push({ palavra, opcoes, posicaoCerta: pos });
  }
  return out;
}

export interface ParBoca { letra: string; fonema: string }

/**
 * Rodada do nível 3: `PARES_POR_RODADA` letras soltas e as bocas delas, com bocas visualmente DIFERENTES (nunca duas da mesma
 * classe: /t/×/d/×/n/, /f/×/v/, /p/×/b/×/m/, /k/×/g/, /s/×/z/…). Começa pelas letras de uma palavra legível do campo (o som
 * principal de cada letra) e completa com letras de outras palavras que a criança já lê. `null` se não der 3 pares.
 */
export function rodadaDeBocas(p: Progresso, campoId: string, r: Rng, n = PARES_POR_RODADA): { palavra: string; pares: ParBoca[] } | null {
  const campo = estadoDosCampos(p).find((c) => c.campo.id === campoId);
  if (!campo?.legiveis.length) return null;
  const palavra = misturar(campo.legiveis, r)[0];
  const pares: ParBoca[] = [];
  const cabe = (x: ParBoca) => !pares.some((y) => y.letra === x.letra) && bocasDistinguiveis([...pares.map((y) => y.fonema), x.fonema]);
  for (const x of misturar(letrasComSomPrincipal(palavra), r)) if (pares.length < n && SONS_PUBLICADOS.includes(x.fonema) && classeDaBoca(x.fonema) && cabe(x)) pares.push(x);
  if (pares.length < n) {
    for (const w of misturar(palavrasLegiveis(p), r)) {
      for (const x of letrasComSomPrincipal(w)) if (pares.length < n && SONS_PUBLICADOS.includes(x.fonema) && classeDaBoca(x.fonema) && cabe(x)) pares.push(x);
      if (pares.length >= n) break;
    }
  }
  return pares.length >= 3 ? { palavra, pares } : null;
}

/* ------------------------------------------------------------ desafio numa fase ------------------------------------------------------------ */

/**
 * Ficha oferecida como desafio OPCIONAL no fim de uma lição da Trilha dos Sons: o campo com mais palavras legíveis (preferindo
 * um que tenha palavra com a letra da lição). `null` fora da Trilha dos Sons ou sem palavra legível.
 */
export function campoDoDesafio(p: Progresso, faseId: string): string | null {
  const f = FASE_POR_ID[faseId];
  if (!f?.trilhaSons) return null;
  const letra = (f.trilhaSons.rotulo ?? '').toLowerCase();
  const cs = estadoDosCampos(p).filter((c) => c.legiveis.length > 0);
  if (!cs.length) return null;
  const pontos = (c: EstadoCampo) => c.legiveis.length + (letra && c.legiveis.some((w) => w.includes(letra)) ? 100 : 0);
  return [...cs].sort((a, b) => pontos(b) - pontos(a))[0].campo.id;
}

export const campoPorId = (id: string): CampoSemantico | undefined => CAMPO_POR_ID[id];
