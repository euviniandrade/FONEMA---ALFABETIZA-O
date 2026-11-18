/**
 * VERIFICADOR AO VIVO do gerenciador (regras 2 e 5 do CLAUDE.md): toda edição de conteúdo que a criança LÊ ou ESCREVE
 * passa pelo MESMO verificador de decodificabilidade dos testes (decodificabilidade.ts + fases/verificar-fases.ts) antes
 * de ser guardada. Se a edição cria um erro que o conteúdo original não tinha, ela é BLOQUEADA e o motivo aparece em
 * linguagem simples. Avisos (nasalização, pronúncia regional…) não bloqueiam.
 *
 * A conferência é feita numa CÓPIA do item com a edição (simular): nada muda no conteúdo até a edição ser aceita.
 */
import { BANCO } from '../fases/tf-banco.ts';
import { verificarFase } from '../fases/verificar-fases.ts';
import { UNIDADES_TF, analisar, numeroDaUnidade, verificarFrase, verificarPalavra, verificarTexto } from '../decodificabilidade.ts';
import { textoCorrido } from '../biblioteca/textos.ts';
import type { TextoDecodificavel } from '../biblioteca/tipos.ts';
import type { CampoSemantico } from '../fichas.ts';
import type { Fase } from '../tipos.ts';
import { copiar, gravarCaminho, ordenarEDesligarCenas, restaurarNoLugar, type Edicao, type Sobreposicao } from './sobreposicao.ts';

export interface Problema {
  /** Mensagem do verificador (técnica, para o relatório). */
  tecnico: string;
  /** A mesma coisa em linguagem simples. */
  simples: string;
  /** Palavra que causou o problema (para abrir o assistente de pronúncia). */
  palavra?: string;
  /** A palavra não está no banco (precisa da anotação de pronúncia). */
  semPronuncia?: boolean;
}
export interface ResultadoVerificacao {
  ok: boolean;
  /** Erros que a edição CRIA (bloqueiam). */
  novos: Problema[];
  /** Erros que já existiam no original (não bloqueiam a edição, mas aparecem). */
  antigos: Problema[];
  avisos: string[];
}

const NOME_DO_VALOR: Record<string, string> = {
  'e-aberto': 'o É aberto com acento', 'o-aberto': 'o Ó aberto com acento', acento: 'o acento', 'acento-tonico': 'a sílaba forte fora do lugar comum',
  'e-aberto-sem-acento': 'o E aberto sem acento (como em "bela")', 'o-aberto-sem-acento': 'o O aberto sem acento (como em "bola")', circunflexo: 'o acento ^',
  'ditongo-ou': 'o "ou"', 'nasal-a': 'o som de "ã"', 'nasal-e': 'o som de "en"', 'nasal-i': 'o som de "in"', 'nasal-o': 'o som de "on"', 'nasal-u': 'o som de "un"',
  'm-antes-pb': 'o M antes de P e B', 'ditongo-nasal': 'o "ão/ãe/õe"', 'r-forte': 'o R forte', 'r-fraco': 'o R fraco (como em "arara")', 'r-final': 'o R no fim da sílaba',
  rr: 'o RR', 'h-mudo': 'o H', lh: 'o LH', nh: 'o NH', ch: 'o CH', 'x-ch': 'o X com som de CH', 'qu-k': 'o QU', 'qu-kw': 'o QU de "quadro"', 'gu-g': 'o GU',
  'g-j': 'o G com som de J', 'c-s': 'o C com som de S', ss: 'o SS', cedilha: 'o Ç', 's-z': 'o S com som de Z', 'letra-de-nomes': 'K, Y ou W', 'l-final': 'o L no fim da sílaba',
  's-final': 'o S ou Z no fim da sílaba', 's-apos-consoante': 'o S depois de consoante', 'x-outro': 'outro som do X', 'encontro-r': 'consoante + R (como "pr")',
  'encontro-l': 'consoante + L (como "pl")', 'ti-di': 'o T/D com som de "tchi/dji"', 'o-final-u': 'o O do fim que soa U', 'e-final-i': 'o E do fim que soa I', ditongo: 'duas vogais juntas'
};
const nomeDoValor = (v: string) => NOME_DO_VALOR[v] ?? (v.length <= 2 ? `o som de "${v.toUpperCase()}"` : v);

/** Traduz uma mensagem do verificador para linguagem simples. */
export function explicar(msg: string): Problema {
  let m = /^"([^"]+)" não está no banco/.exec(msg);
  if (m) return { tecnico: msg, palavra: m[1], semPronuncia: true, simples: `"${m[1]}" é uma palavra nova: responda às perguntas de pronúncia para o verificador conferir se a criança já sabe ler.` };
  m = /^"([^"]+)" usa ([\w-]+), ensinado só em (TF-\d+)/.exec(msg);
  if (m) {
    const u = UNIDADES_TF.find((x) => x.id === m![3]);
    return { tecnico: msg, palavra: m[1], simples: `"${m[1]}" tem ${nomeDoValor(m[2])}, que a criança só aprende na lição ${m[3]}${u ? ` (${u.titulo})` : ''}. Aqui ela ainda não consegue ler sozinha: escolha outra palavra.` };
  }
  m = /^"([^"]+)": a anotação/.exec(msg);
  if (m) return { tecnico: msg, palavra: m[1], simples: `A pronúncia anotada de "${m[1]}" não combina com as letras. Refaça a anotação.` };
  m = /palavras frequentes/.exec(msg);
  if (m) return { tecnico: msg, simples: 'A frase tem mais de uma palavra que a criança ainda não lê pelos sons (como "é", "um", "não"). Deixe no máximo uma.' };
  m = /^texto com (\d+)%/.exec(msg);
  if (m) return { tecnico: msg, simples: `Só ${m[1]}% das palavras do texto a criança já lê sozinha. Precisa ser pelo menos 95%.` };
  m = /^"([^"]+)" não é uma palavra do banco das fichas/.exec(msg);
  if (m) return { tecnico: msg, palavra: m[1], semPronuncia: true, simples: `"${m[1]}" ainda não tem pronúncia anotada nem figura: anote a pronúncia (e suba a figura na aba Imagens).` };
  return { tecnico: msg, simples: msg };
}

/** Os erros (texto técnico) de um item, conforme a coleção. Coleções sem leitura da criança: nenhum. */
export function errosDoItem(colecao: string, item: unknown): { erros: string[]; avisos: string[] } {
  const erros: string[] = [];
  const avisos: string[] = [];
  if (!item) return { erros, avisos };
  if (colecao === 'fases') {
    for (const r of verificarFase(item as Fase)) { erros.push(...r.resultado.erros); avisos.push(...r.resultado.avisos); }
  } else if (colecao === 'textos') {
    const t = item as TextoDecodificavel;
    const n = numeroDaUnidade(t.ate);
    const r = verificarTexto(textoCorrido(t), n, BANCO);
    erros.push(...r.erros); avisos.push(...r.avisos);
    const rt = verificarFrase(t.titulo, n, BANCO);
    erros.push(...rt.erros);
    for (const p of t.perguntas) if (p.escritas) for (const o of p.opcoes) erros.push(...verificarPalavra(o, n, BANCO).erros);
  } else if (colecao === 'fichas') {
    // as fichas mostram palavras escritas só quando a criança já lê (motor/fichas.ts); aqui cada palavra precisa estar no banco
    for (const w of (item as CampoSemantico).palavras) if (!BANCO[w.toLowerCase()]) erros.push(`"${w}" não é uma palavra do banco das fichas`);
  } else if (colecao === 'banco') {
    erros.push(...analisar(item as { texto: string; sons: string }).erros);
  }
  return { erros: [...new Set(erros)], avisos: [...new Set(avisos)] };
}

/**
 * Simula a edição numa CÓPIA do item (sem mexer no conteúdo) e devolve a cópia editada.
 * Edição `novo`: a cópia é o próprio valor.
 */
export function simular(s: Sobreposicao, e: Edicao, outras: Edicao[] = []): unknown {
  const col = s.colecao(e.colecao);
  if (!col) return undefined;
  let copia = e.tipo === 'novo' ? copiar(e.valor) : copiar(col.obter(e.item));
  if (copia === undefined) return undefined;
  if (e.tipo === 'definir') {
    const cam = e.caminho ?? [];
    if (!cam.length) { if (!restaurarNoLugar(copia, e.valor)) copia = copiar(e.valor); }
    else gravarCaminho(copia, cam, e.valor);
  }
  if (e.colecao === 'fases' && (e.tipo === 'ordem-cenas' || e.tipo === 'desligar-cenas')) {
    // a ordem/desligar valem sobre as cenas ORIGINAIS: parte do original e reaplica as duas
    const orig = copiar(s.original(e.colecao, e.item)) as Fase | undefined;
    if (orig) {
      const lista = [...outras.filter((o) => o.colecao === 'fases' && o.item === e.item && o.tipo !== e.tipo && (o.tipo === 'ordem-cenas' || o.tipo === 'desligar-cenas')), e];
      const atual = copia as Fase;
      atual.cenas = orig.cenas.map((c) => atual.cenas.find((x) => x.id === c.id) ?? c);
      ordenarEDesligarCenas(atual, lista);
    }
  }
  if (e.colecao === 'fases') (copia as Fase).id = e.item;
  return copia;
}

/** Confere a edição ANTES de guardar: bloqueia se ela cria erro de decodificabilidade que o original não tinha. */
export function verificarEdicao(s: Sobreposicao, e: Edicao, outras: Edicao[] = []): ResultadoVerificacao {
  const depois = simular(s, e, outras);
  const antes = e.tipo === 'novo' ? (e.modelo ? s.colecao(e.colecao)?.obter(e.modelo) : undefined) : s.colecao(e.colecao)?.obter(e.item);
  const ra = antes ? errosDoItem(e.colecao, antes) : { erros: [], avisos: [] };
  const rd = errosDoItem(e.colecao, depois);
  const jaTinha = new Set(ra.erros);
  const novos = rd.erros.filter((x) => !jaTinha.has(x)).map(explicar);
  return { ok: novos.length === 0, novos, antigos: rd.erros.filter((x) => jaTinha.has(x)).map(explicar), avisos: rd.avisos };
}

/** Confere TODO o conteúdo como está agora (com as edições aplicadas): usado pelo importador e pelos testes. */
export function verificarTudo(s: Sobreposicao): { colecao: string; item: string; erros: string[] }[] {
  const out: { colecao: string; item: string; erros: string[] }[] = [];
  for (const c of ['fases', 'textos', 'fichas']) {
    const col = s.colecao(c);
    if (!col) continue;
    for (const id of col.ids()) {
      const { erros } = errosDoItem(c, col.obter(id));
      if (erros.length) out.push({ colecao: c, item: id, erros });
    }
  }
  return out;
}
