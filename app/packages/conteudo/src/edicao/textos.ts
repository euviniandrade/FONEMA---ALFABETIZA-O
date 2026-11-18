/**
 * Lista de TEXTOS E FALAS editáveis (aba "Textos e falas" do gerenciador): percorre cada coleção e acha as falas
 * ({ quem, texto }), os títulos, dicas, perguntas e outros textos, com o caminho exato de cada um (para a edição).
 */
import type { Caminho, Sobreposicao } from './sobreposicao.ts';

export type TipoTexto = 'fala' | 'titulo' | 'texto' | 'dica';
export interface TextoEditavel {
  colecao: string;
  item: string;
  /** Caminho até o TEXTO (para falas, termina em 'texto'). */
  caminho: Caminho;
  texto: string;
  tipo: TipoTexto;
  /** Quem fala (falas). */
  quem?: string;
  /** Onde aparece, em linguagem simples ("TF-07 › C3 Achar a letra › enunciado"). */
  onde: string;
}

/** Campos de texto (não falados) que valem editar. */
const CAMPOS_TEXTO: Record<string, TipoTexto> = {
  titulo: 'titulo', nome: 'titulo', objetivo: 'texto', fechamento: 'texto', emCasa: 'texto', uau: 'texto', perguntaGuia: 'texto',
  papel: 'texto', dica: 'dica', fala: 'texto', criterio: 'texto', treina: 'texto', pergunta: 'texto', acao: 'texto', ganchoProxima: 'texto',
  zumZumViraAmigo: 'texto', descricao: 'texto', sub: 'texto'
};
/** Chaves que nunca são texto para gente (ids, figuras, sons…). */
const PULAR = new Set(['id', 'figura', 'imagem', 'capa', 'cenario', 'fonema', 'som', 'somAlvo', 'somCorreta', 'correta', 'habilidade', 'habilidades', 'tipo', 'regiao',
  'formato', 'estilo', 'sons', 'letra', 'letras', 'video', 'audio', 'marcador', 'selo', 'chefe', 'mapa', 'categoria', 'motivo', 'area', 'niveis', 'visivel_antes', 'cor', 'imagens', 'liberaCom', 'ate']);

const ehObjeto = (x: unknown): x is Record<string, unknown> => !!x && typeof x === 'object' && !Array.isArray(x);

function rotuloDoSegmento(no: unknown, seg: string | number): string {
  if (ehObjeto(no) && typeof no.id === 'string') return `${no.id}${typeof no.titulo === 'string' ? ` ${no.titulo}` : ''}`;
  return String(seg);
}

/** Percorre um item e devolve os textos editáveis dele. */
export function textosDoItem(colecao: string, item: string, raiz: unknown): TextoEditavel[] {
  const out: TextoEditavel[] = [];
  const andar = (no: unknown, cam: Caminho, onde: string[]) => {
    if (typeof no === 'string') {
      // registro de textos soltos (textos de tela, falas em texto)
      if (!cam.length && no.trim()) out.push({ colecao, item, caminho: [], texto: no, tipo: colecao.startsWith('falas') ? 'fala' : 'texto', quem: colecao.startsWith('falas') ? 'sofia' : undefined, onde: item });
      return;
    }
    if (Array.isArray(no)) { no.forEach((x, i) => andar(x, [...cam, ehObjeto(x) && typeof x.id === 'string' ? `@${x.id}` : i], [...onde, ehObjeto(x) && typeof x.id === 'string' ? rotuloDoSegmento(x, i) : String(i + 1)])); return; }
    if (!ehObjeto(no)) return;
    if (typeof no.quem === 'string' && typeof no.texto === 'string') {
      out.push({ colecao, item, caminho: [...cam, 'texto'], texto: no.texto, tipo: 'fala', quem: no.quem, onde: onde.join(' › ') || item });
      return;
    }
    for (const [k, v] of Object.entries(no)) {
      if (PULAR.has(k)) continue;
      if (typeof v === 'string') {
        const tipo = CAMPOS_TEXTO[k];
        if (tipo && v.trim()) out.push({ colecao, item, caminho: [...cam, k], texto: v, tipo, onde: [...onde, k].join(' › ') });
        else if (k === 'texto' && v.trim()) out.push({ colecao, item, caminho: [...cam, k], texto: v, tipo: 'texto', onde: [...onde, k].join(' › ') });
        continue;
      }
      andar(v, [...cam, k], [...onde, k]);
    }
  };
  andar(raiz, [], [item]);
  return out;
}

/** Todos os textos editáveis de todas as coleções (fora o banco de palavras e os recursos). */
export function todosOsTextos(s: Sobreposicao): TextoEditavel[] {
  const out: TextoEditavel[] = [];
  for (const c of s.listaDeColecoes()) {
    if (c.id === 'banco' || c.id === 'recursos') continue;
    for (const id of c.ids()) out.push(...textosDoItem(c.id, id, c.obter(id)));
  }
  return out;
}
