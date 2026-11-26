/**
 * DESBLOQUEIO PROGRESSIVO (D034, pedido do dono de 18/11: "liberar conforme ele for realizando e terminando as demais
 * atividades, para que ele não canse nem desanime").
 *
 * Um só catálogo dos EXTRAS (jogos, leitura livre, peças da Lojinha): o que está aberto, o que falta para abrir (com barrinha e
 * quantas missões faltam) e o que ACABOU de abrir. A trilha (fases da jornada) continua por domínio/sequência (D021, D030);
 * aqui só entra o que fica em volta dela.
 *
 *  - `catalogoDeExtras(p)`: cada extra com `aberto`, `falta` (frase curta) e, quando dá, `barra` (feito/total).
 *  - `missoesAteAbrir(p, ids)`: quantas missões da jornada faltam para cada extra abrir (simula as próximas fases concluídas;
 *    `null` = não depende só de fases, ex.: a fluência, que pede precisão de leitura).
 *  - `extrasAbertos(p)`: ids abertos (usado por `fecharSessao` para saber o que abriu na missão: `relatorio.abriu`).
 *  - `Progresso.novidades`: o que abriu e a criança ainda não visitou (selo "Novo!"); `marcarVisto` tira.
 * Nada aqui conta como domínio (regra 4): é só o que a criança pode visitar.
 */
import { BANCO, FASES, FASE_POR_ID, HISTORIAS, LETRA_POR_ID, PECAS_AVATAR, SONS_PUBLICADOS, TEXTOS_DECODIFICAVEIS, jogoLigado, usaSomReal } from '@fonema/conteudo';
import type { Progresso } from './estado.ts';
import { concluirFase } from './sequencia.ts';
import { sonsEnsinados, variacoesDoJogo, MINIMO_DE_SONS } from './jogos-fonicos.ts';
import { niveisDaMemoria } from './memoria-sons.ts';
import { carteiroLiberado, casaLiberada, variacoesDaEstrada } from './jogos-vila.ts';
import { estadoFluencia, frasesEstudadas, palavrasParaEscrever, textoLiberado, FLUENCIA_MIN_RESPOSTAS, FLUENCIA_PRECISAO_MIN, FLUENCIA_MIN_PALAVRAS } from './biblioteca.ts';
import { estadoDosCampos } from './fichas.ts';
import { niveisDaCaca } from './caca-tesouro.ts';

export type GrupoExtra = 'jogos' | 'leitura' | 'lojinha';

export interface Extra {
  /** Ex.: 'jogo:corre-som', 'jogo:corre-som:letra', 'leitura:texto:t1', 'peca:camisa:mata'. */
  id: string;
  grupo: GrupoExtra;
  nome: string;
  /** Rota relativa a `c/:id/`. */
  rota: string;
  aberto: boolean;
  /** O que falta, em frase curta (só quando fechado). */
  falta?: string;
  /** Barrinha do que falta (quando o critério não é só de fases). */
  barra?: { feito: number; total: number; rotulo: string };
  /** Id do extra "pai" (variação de um jogo, nível da memória). */
  pai?: string;
  /** Peças: sexo do boneco a que serve ('ambos' | 'f' | 'm'). */
  sexo?: string;
}

/** Sons com clipe publicado: o motor usa a mesma lista que o app (web/public/audio/sons/mapa.json). */
const temSomPublicado = (f: string) => SONS_PUBLICADOS.includes(f);

/** Letras cujo som pode entrar nos jogos livres (som real, com clipe). */
const LETRAS_DOS_JOGOS = Object.entries(LETRA_POR_ID).filter(([, l]) => !!l.fonema && usaSomReal(l) && temSomPublicado(l.fonema)).map(([id]) => id);

/** Id do extra → id do jogo no Parque (conteudo/jogos.ts). */
const ID_DO_JOGO: Record<string, string> = { memoria: 'memoria-sons' };

const NOME_VARIACAO: Record<string, string> = { letra: 'Letras', figura: 'Figuras', inicio: 'Começa com', fim: 'Termina com' };
const NOME_NIVEL_MEMORIA: Record<number, string> = { 1: 'Olhar e lembrar', 2: 'Memória', 3: 'Memória grande', 4: 'Só ouvindo' };

/**
 * Catálogo completo. `rapido` pula o que depende de tentativas (fluência) e só olha fases: é o que a simulação usa.
 */
export function catalogoDeExtras(p: Progresso, opts: { rapido?: boolean } = {}): Extra[] {
  const out: Extra[] = [];
  // ---------------- jogos fônicos (Corre-Som, Come-Som): abrem com 1 som ensinado e crescem ----------------
  for (const [jogo, nome] of [['corre-som', 'Corre-Som'], ['come-som', 'Bichinho Come-Som']] as const) {
    const vs = variacoesDoJogo(p, jogo, temSomPublicado);
    const algum = vs.some((v) => v.liberada);
    out.push({ id: `jogo:${jogo}`, grupo: 'jogos', nome, rota: `brincar/${jogo}`, aberto: algum, ...(algum ? {} : { falta: 'Abre com o primeiro som da trilha.', barra: { feito: 0, total: 1, rotulo: 'sons' } }) });
    for (const v of vs) {
      out.push({
        id: `jogo:${jogo}:${v.variacao}`, grupo: 'jogos', nome: `${nome}: ${NOME_VARIACAO[v.variacao]}`, rota: `brincar/${jogo}`, pai: `jogo:${jogo}`, aberto: v.liberada,
        ...(v.liberada ? {} : { falta: v.motivo, ...(v.variacao === 'letra' ? { barra: { feito: v.sons ?? 0, total: MINIMO_DE_SONS, rotulo: 'sons' } } : {}) })
      });
    }
  }
  // sons que já entram nos jogos livres: cada som novo da trilha aparece como "entrou nos jogos" (o jogo cresce, D034)
  const nos = new Set(sonsEnsinados(p, temSomPublicado).map((x) => x.letra));
  for (const l of LETRAS_DOS_JOGOS) out.push({ id: `som:${l}`, grupo: 'jogos', nome: `O som do ${l} entrou nos jogos`, rota: 'brincar', aberto: nos.has(l), ...(nos.has(l) ? {} : { falta: `Entra quando a trilha ensinar o som do ${l}.` }) });
  // ---------------- Memória dos Sons ----------------
  const ns = niveisDaMemoria(p, temSomPublicado);
  const memAberta = ns.some((n) => n.liberado);
  out.push({ id: 'jogo:memoria', grupo: 'jogos', nome: 'Memória dos Sons', rota: 'memoria', aberto: memAberta, ...(memAberta ? {} : { falta: ns[0].motivo }) });
  for (const n of ns) out.push({ id: `jogo:memoria:${n.nivel}`, grupo: 'jogos', nome: `Memória: ${NOME_NIVEL_MEMORIA[n.nivel]}`, rota: 'memoria', pai: 'jogo:memoria', aberto: n.liberado, ...(n.liberado ? {} : { falta: n.motivo }) });
  // ---------------- jogos da vila: leem/escrevem palavras, então abrem com as primeiras palavras decodificáveis (regra 2) ----------------
  const est = variacoesDaEstrada(p);
  const estAberta = est.some((v) => v.liberada);
  out.push({ id: 'jogo:estrada-pares', grupo: 'jogos', nome: 'Estrada e Rio dos Pares', rota: 'jogo/estrada-pares', aberto: estAberta, ...(estAberta ? {} : { falta: est[0].motivo }) });
  const car = carteiroLiberado(p);
  out.push({ id: 'jogo:carteiro', grupo: 'jogos', nome: 'Carteiro da Vila', rota: 'jogo/carteiro', aberto: car.liberada, ...(car.liberada ? {} : { falta: car.motivo }) });
  const casa = casaLiberada(p);
  out.push({ id: 'jogo:casa-som', grupo: 'jogos', nome: 'Casa do Som', rota: 'jogo/casa-som', aberto: casa.liberada, ...(casa.liberada ? {} : { falta: casa.motivo }) });

  // ---------------- Caça ao tesouro no passeio 3D (fila nº 25): abre com o 1º som (aquecimento) e cresce ----------------
  const caca = niveisDaCaca(p, temSomPublicado);
  out.push({ id: 'jogo:caca', grupo: 'jogos', nome: 'Caça ao Tesouro', rota: 'mundo/caca', aberto: caca[0].aberto, ...(caca[0].aberto ? {} : { falta: caca[0].falta }) });
  out.push({ id: 'jogo:caca:2', grupo: 'jogos', nome: 'Caça ao Tesouro: Letras da palavra', rota: 'mundo/caca', pai: 'jogo:caca', aberto: caca[1].aberto, ...(caca[1].aberto ? {} : { falta: caca[1].falta }) });

  // ---------------- Cantinho da Leitura ----------------
  for (const h of HISTORIAS) out.push({ id: `leitura:historia:${h.id}`, grupo: 'leitura', nome: h.titulo, rota: `leitura/historia-${h.id}`, aberto: true });
  for (const t of TEXTOS_DECODIFICAVEIS) {
    const ab = textoLiberado(p, t);
    out.push({ id: `leitura:texto:${t.id}`, grupo: 'leitura', nome: `Ler sozinho: ${t.titulo}`, rota: `leitura/texto-${t.id}`, aberto: ab, ...(ab ? {} : { falta: `Abre no fim do bloco ${t.bloco} da Trilha dos Sons.` }) });
  }
  const nFichas = estadoDosCampos(p).reduce((s, c) => s + c.legiveis.length, 0);
  out.push({ id: 'leitura:fichas', grupo: 'leitura', nome: 'Fichas de leitura', rota: 'leitura/fichas', aberto: nFichas > 0, ...(nFichas ? {} : { falta: 'Abre quando você aprender os sons de uma palavra.' }) });
  const frases = frasesEstudadas(p).length;
  out.push({ id: 'leitura:eco', grupo: 'leitura', nome: 'Ler em eco', rota: 'leitura/eco', aberto: frases > 0, ...(frases ? {} : { falta: 'Abre com a primeira frase da trilha.' }) });
  out.push({ id: 'leitura:coro', grupo: 'leitura', nome: 'Ler em coro', rota: 'leitura/coro', aberto: frases > 0, ...(frases ? {} : { falta: 'Abre com a primeira frase da trilha.' }) });
  const esc = palavrasParaEscrever(p, BANCO).length > 0;
  out.push({ id: 'leitura:escrita', grupo: 'leitura', nome: 'Escrever do meu jeito', rota: 'leitura/escrita', aberto: esc, ...(esc ? {} : { falta: 'Abre depois do som do M, na Trilha dos Sons.' }) });
  if (!opts.rapido) {
    // fluência: critério de leitura (ABC p. 375–376), não de fases; a barrinha mostra quanto falta
    const flu = estadoFluencia(p, BANCO);
    if (flu.liberada) out.push({ id: 'leitura:fluencia', grupo: 'leitura', nome: 'Ler mais ligeiro', rota: 'leitura/fluencia', aberto: true });
    else if (flu.motivo === 'precisao' && flu.respostas < FLUENCIA_MIN_RESPOSTAS) {
      out.push({ id: 'leitura:fluencia', grupo: 'leitura', nome: 'Ler mais ligeiro', rota: 'leitura/fluencia', aberto: false, falta: `Abre quando você tiver lido ${FLUENCIA_MIN_RESPOSTAS} palavras na trilha quase sem errar.`, barra: { feito: flu.respostas, total: FLUENCIA_MIN_RESPOSTAS, rotulo: 'palavras lidas' } });
    } else if (flu.motivo === 'precisao') {
      out.push({ id: 'leitura:fluencia', grupo: 'leitura', nome: 'Ler mais ligeiro', rota: 'leitura/fluencia', aberto: false, falta: `Abre quando você acertar ${Math.round(FLUENCIA_PRECISAO_MIN * 20)} de 20 palavras seguidas, sozinho. Agora: ${Math.round(flu.precisao * 20)} de 20.`, barra: { feito: Math.round(flu.precisao * 20), total: Math.round(FLUENCIA_PRECISAO_MIN * 20), rotulo: 'acertos em 20' } });
    } else {
      out.push({ id: 'leitura:fluencia', grupo: 'leitura', nome: 'Ler mais ligeiro', rota: 'leitura/fluencia', aberto: false, falta: `Abre quando você tiver lido ${FLUENCIA_MIN_PALAVRAS} palavras diferentes com figura.`, barra: { feito: flu.palavras, total: FLUENCIA_MIN_PALAVRAS, rotulo: 'palavras' } });
    }
  }

  // ---------------- Lojinha: peças que abrem com a jornada (a moedinha continua sendo a troca) ----------------
  for (const peca of PECAS_AVATAR) {
    if (!peca.fase || peca.indisponivel) continue;
    const e = p.fases[peca.fase]?.estado;
    const ab = e === 'aberta' || e === 'concluida';
    out.push({ id: `peca:${peca.categoria}:${peca.id}`, grupo: 'lojinha', nome: peca.nome, rota: 'lojinha', aberto: ab, sexo: peca.sexo, ...(ab ? {} : { falta: `Abre na missão "${FASE_POR_ID[peca.fase]?.titulo ?? peca.fase}".` }) });
  }
  // Estúdio criativo › Jogos (fila nº 32): jogo desligado pelo administrador sai do catálogo (sem "Novo!" nem cadeado)
  return out.filter((x) => !x.id.startsWith('jogo:') || jogoLigado(ID_DO_JOGO[x.id.split(':')[1]] ?? x.id.split(':')[1]));
}

/** Ids dos extras abertos agora (só o que depende de fases e do que já foi ensinado). */
export function extrasAbertos(p: Progresso): Set<string> {
  return new Set(catalogoDeExtras(p, { rapido: true }).filter((x) => x.aberto).map((x) => x.id));
}

/** O que abriu entre dois momentos (ex.: antes e depois de uma missão). */
export function extrasQueAbriram(antes: Progresso, depois: Progresso): string[] {
  const a = extrasAbertos(antes);
  return [...extrasAbertos(depois)].filter((id) => !a.has(id));
}

/** Avança `n` fases da jornada como se a criança as concluísse (só para prever; não mexe em nada). */
function avancar(p: Progresso, agora: number): Progresso | null {
  const id = p.faseAtual;
  if (!FASE_POR_ID[id] || p.fases[id]?.estado === 'concluida') return null;
  try { return concluirFase(p, id, agora); } catch { return null; }
}

const cacheMissoes = new Map<string, Record<string, number | null>>();

/**
 * Quantas missões da jornada faltam para cada extra fechado abrir (1 = abre ao concluir a missão de agora). `null` = não abre só
 * concluindo fases dentro do horizonte (ou depende de outra coisa, como a fluência). Guardado por estado das fases.
 */
export function missoesAteAbrir(p: Progresso, horizonte = 24): Record<string, number | null> {
  const chave = `${p.faseAtual}|${FASES.map((f) => (p.fases[f.id]?.estado ?? '-')[0]).join('')}|${horizonte}`;
  const guardado = cacheMissoes.get(chave);
  if (guardado) return guardado;
  const fechados = catalogoDeExtras(p, { rapido: true }).filter((x) => !x.aberto).map((x) => x.id);
  const out: Record<string, number | null> = Object.fromEntries(fechados.map((id) => [id, null]));
  let q: Progresso | null = p;
  let pend = new Set(fechados);
  for (let k = 1; k <= horizonte && pend.size && q; k++) {
    q = avancar(q, p.criadoEm + k);
    if (!q) break;
    const ab = extrasAbertos(q);
    for (const id of [...pend]) if (ab.has(id)) { out[id] = k; pend.delete(id); }
    pend = new Set(pend);
  }
  if (cacheMissoes.size > 50) cacheMissoes.clear();
  cacheMissoes.set(chave, out);
  return out;
}

/** "Abre na próxima missão" / "Faltam 3 missões" (frase da barrinha). */
export function textoMissoes(n: number | null | undefined): string | undefined {
  if (n == null) return undefined;
  return n <= 1 ? 'Abre na próxima missão!' : `Faltam ${n} missões para abrir.`;
}

/* ------------------------------------------------------------ "Novo!" ------------------------------------------------------------ */

/** Guarda o que acabou de abrir (selo "Novo!" até a criança visitar). */
export function anotarNovidades(p: Progresso, ids: string[]): Progresso {
  if (!ids.length) return p;
  const atuais = p.novidades ?? [];
  return { ...p, novidades: [...atuais, ...ids.filter((id) => !atuais.includes(id))] };
}

/** A criança visitou: tira o "Novo!" do extra e das variações dele (prefixo). */
export function marcarVisto(p: Progresso, prefixo: string): Progresso {
  const atuais = p.novidades ?? [];
  const resto = atuais.filter((id) => id !== prefixo && !id.startsWith(`${prefixo}:`));
  return resto.length === atuais.length ? p : { ...p, novidades: resto };
}

/** Tem algo novo com este prefixo (ex.: 'jogo:corre-som', ou o grupo 'jogo', 'leitura', 'peca')? */
export const temNovidade = (p: Progresso, prefixo: string): boolean => (p.novidades ?? []).some((id) => id === prefixo || id.startsWith(`${prefixo}:`));

/**
 * Para mostrar "Abriu!": tira as variações cujo jogo-pai abriu junto (mostra só o jogo) e, nas peças, as do outro sexo.
 */
export function abriuParaMostrar(ids: string[], sexo?: string): Extra[] {
  const todos = new Map(CATALOGO_FIXO().map((x) => [x.id, x]));
  return ids.map((id) => todos.get(id)).filter((x): x is Extra => !!x)
    .filter((x) => !x.pai || !ids.includes(x.pai))
    .filter((x) => !x.sexo || x.sexo === 'ambos' || !sexo || x.sexo === sexo);
}

/** Nomes e rotas de todos os extras (independem do progresso). */
let _fixo: Extra[] | null = null;
function CATALOGO_FIXO(): Extra[] {
  if (_fixo) return _fixo;
  const vazio = { criancaId: '-', versao: 4, faseAtual: FASES[0].id, fases: {}, habilidades: {}, desafios: 0, termometro: 0, moedinhas: { saldo: 0, total: 0, porDia: {} }, conquistas: {}, itens: [], equipados: [], areas: [], surpresas: [], contadores: {}, expressa: { regioes: [], ativa: false }, sessoesFeitas: 0, criadoEm: 0 } as Progresso;
  _fixo = catalogoDeExtras(vazio, { rapido: true });
  return _fixo;
}
