/**
 * PACOTE DO GERENCIADOR ("publicar para todos" sem servidor; fila do dono nº 18). Generaliza o pacote de áudios
 * (pacote-audios.ts, que continua valendo): um .zip com TUDO o que o administrador mudou neste aparelho:
 *   pacote.json   formato "fonema-pacote" versão 2: áudios (como no pacote de áudios), edições do conteúdo e mídias
 *   audios/…      os áudios trocados
 *   midias/…      as figuras e os modelos 3D trocados (cada um com o caminho em assets/ onde entra)
 *   LEIA-ME.txt
 * Quem cuida do repositório aplica com `npx tsx scripts/importar-pacote.ts pacote.zip` (roda o verificador e os
 * testes e não aplica nada se algo quebrar). Arquivo puro (sem DOM): app, importador e testes.
 */
import type { Edicao } from '@fonema/conteudo';
import { AVISO_PACOTE, FORMATO_PACOTE, abrirPacote, lerZip, montarZip, nomeNoPacote, slug, type EntradaPacote, type ItemPacote, type Pacote } from './pacote-audios.ts';

export const FORMATO_PACOTE_GERAL = 'fonema-pacote';

export interface ItemMidia {
  /** Caminho dentro de web/public/assets/ (figuras/uva.webp, modelos3d/sofia.glb). */
  caminho: string;
  arquivo: string;
  mime: string;
  bytes: number;
  sha256?: string;
  nome?: string;
  quem?: string;
  em: string;
}
export interface PacoteGeral {
  formato: typeof FORMATO_PACOTE_GERAL;
  versao: 2;
  criadoEm: string;
  aviso: string;
  audios: ItemPacote[];
  edicoes: Edicao[];
  midias: ItemMidia[];
}
export interface EntradaMidia { caminho: string; dados: Uint8Array; mime: string; nome?: string; quem?: string; em: number; sha256?: string }

const utf8 = (s: string) => new TextEncoder().encode(s);
const extensao = (c: string) => (/\.([a-z0-9]+)$/i.exec(c)?.[1] ?? 'bin').toLowerCase();
export const caminhoDeMidiaPermitido = (c: string) => /^[a-z0-9][a-z0-9/_.-]*\.(webp|png|jpg|jpeg|glb|svg)$/i.test(c) && !c.includes('..') && !c.includes('//');

/** Tira o que é só deste aparelho (histórico, chave) das edições que vão no pacote. */
export function limparEdicao(e: Edicao & { chave?: string; anteriores?: unknown }): Edicao {
  const { chave: _c, anteriores: _a, ...resto } = e;
  void _c; void _a;
  return resto;
}

/** Monta o pacote geral. */
export function montarPacoteGeral(dados: { audios: EntradaPacote[]; edicoes: Edicao[]; midias: EntradaMidia[] }, quando = new Date()): { zip: Uint8Array; pacote: PacoteGeral } {
  const audiosOrd = [...dados.audios].sort((a, b) => a.id.localeCompare(b.id));
  const audios: ItemPacote[] = audiosOrd.map((e, i) => ({
    id: e.id, arquivo: nomeNoPacote(i, e.id, e.mime), mime: e.mime, bytes: e.dados.length, sha256: e.sha256, texto: e.texto, tipo: e.tipo,
    origem: e.origem, ...(e.robo ? { robo: e.robo } : {}), quem: e.quem, autorizacao: e.autorizacao, duracaoMs: e.duracaoMs, em: new Date(e.em).toISOString()
  }));
  const midiasOrd = [...dados.midias].sort((a, b) => a.caminho.localeCompare(b.caminho));
  for (const m of midiasOrd) if (!caminhoDeMidiaPermitido(m.caminho)) throw new Error(`Caminho de figura não permitido: ${m.caminho}`);
  const midias: ItemMidia[] = midiasOrd.map((m, i) => ({
    caminho: m.caminho, arquivo: `midias/${String(i + 1).padStart(4, '0')}-${slug(m.caminho.replace(/\.[a-z0-9]+$/i, ''), 50)}.${extensao(m.caminho)}`,
    mime: m.mime, bytes: m.dados.length, sha256: m.sha256, nome: m.nome, quem: m.quem, em: new Date(m.em).toISOString()
  }));
  const edicoes = [...dados.edicoes].sort((a, b) => a.em - b.em).map(limparEdicao);
  const pacote: PacoteGeral = { formato: FORMATO_PACOTE_GERAL, versao: 2, criadoEm: quando.toISOString(), aviso: AVISO_PACOTE, audios, edicoes, midias };
  const leia = [
    'PACOTE DO FONEMA (gerenciador)',
    '',
    `Criado em ${quando.toLocaleString('pt-BR')}: ${edicoes.length} edição(ões) do conteúdo, ${audios.length} áudio(s), ${midias.length} figura(s)/modelo(s).`,
    'Para aplicar no repositório (a partir da pasta app/):',
    '  npx tsx scripts/importar-pacote.ts caminho/do/pacote.zip',
    'O importador confere a decodificabilidade e roda os testes; se algo quebrar, nada é aplicado.',
    '',
    AVISO_PACOTE,
    '',
    ...edicoes.map((e) => `edição: ${e.colecao} › ${e.item}${e.caminho?.length ? ` › ${e.caminho.join(' › ')}` : ''} (${e.tipo})${e.nota ? ` — ${e.nota}` : ''}`),
    ...audios.map((it) => `${it.arquivo}  →  ${it.id}${it.texto ? `  ("${it.texto}")` : ''}`),
    ...midias.map((m) => `${m.arquivo}  →  assets/${m.caminho}`)
  ].join('\n');
  const zip = montarZip([
    { nome: 'pacote.json', dados: utf8(JSON.stringify(pacote, null, 1)) },
    { nome: 'LEIA-ME.txt', dados: utf8(leia) },
    ...audios.map((it, i) => ({ nome: it.arquivo, dados: audiosOrd[i].dados })),
    ...midias.map((m, i) => ({ nome: m.arquivo, dados: midiasOrd[i].dados }))
  ], quando);
  return { zip, pacote };
}

/** Abre um pacote (o geral ou o antigo, só de áudios). Confere formato, caminhos, arquivos e tamanhos. */
export function abrirPacoteGeral(zip: Uint8Array, inflar?: (d: Uint8Array) => Uint8Array): { pacote: PacoteGeral; arquivos: Map<string, Uint8Array>; antigo: boolean } {
  const lista = lerZip(zip, inflar);
  const arquivos = new Map(lista.map((a) => [a.nome.replace(/^.*?(?=pacote\.json$|audios\/|midias\/)/, ''), a.dados]));
  const j = arquivos.get('pacote.json');
  if (!j) throw new Error('O zip não tem pacote.json: não é um pacote do FONEMA.');
  const bruto = JSON.parse(new TextDecoder().decode(j)) as { formato?: string; versao?: number };
  if (bruto.formato === FORMATO_PACOTE) {
    const { pacote: p } = abrirPacote(zip, inflar);
    const v1 = p as Pacote;
    return { pacote: { formato: FORMATO_PACOTE_GERAL, versao: 2, criadoEm: v1.criadoEm, aviso: v1.aviso, audios: v1.itens, edicoes: [], midias: [] }, arquivos, antigo: true };
  }
  const pacote = bruto as PacoteGeral;
  if (pacote.formato !== FORMATO_PACOTE_GERAL || pacote.versao !== 2 || !Array.isArray(pacote.audios) || !Array.isArray(pacote.edicoes) || !Array.isArray(pacote.midias)) {
    throw new Error('pacote.json de formato desconhecido.');
  }
  for (const it of pacote.audios) {
    if (!/^(som|fala|nome|arquivo):./.test(it.id)) throw new Error(`Id de áudio inválido: ${it.id}`);
    if (!/^audios\/[a-z0-9.-]+$/.test(it.arquivo)) throw new Error(`Nome de arquivo inválido: ${it.arquivo}`);
    const d = arquivos.get(it.arquivo);
    if (!d) throw new Error(`Falta o arquivo ${it.arquivo} no zip.`);
    if (d.length !== it.bytes) throw new Error(`Tamanho diferente do esperado: ${it.arquivo}.`);
  }
  for (const m of pacote.midias) {
    if (!caminhoDeMidiaPermitido(m.caminho)) throw new Error(`Caminho de figura não permitido: ${m.caminho}`);
    if (!/^midias\/[a-z0-9.-]+$/.test(m.arquivo)) throw new Error(`Nome de arquivo inválido: ${m.arquivo}`);
    const d = arquivos.get(m.arquivo);
    if (!d) throw new Error(`Falta o arquivo ${m.arquivo} no zip.`);
    if (d.length !== m.bytes) throw new Error(`Tamanho diferente do esperado: ${m.arquivo}.`);
  }
  for (const e of pacote.edicoes) {
    if (!e || typeof e.colecao !== 'string' || typeof e.item !== 'string' || !['definir', 'novo', 'ordem-cenas', 'desligar-cenas'].includes(e.tipo)) throw new Error('Edição inválida no pacote.');
  }
  return { pacote, arquivos, antigo: false };
}

/** Reconstrói um pacote SÓ DE ÁUDIOS (formato antigo) com os áudios do pacote geral, para o importador de áudios. */
export function pacoteDeAudios(p: PacoteGeral, arquivos: Map<string, Uint8Array>): Uint8Array {
  const pacote: Pacote = { formato: FORMATO_PACOTE, versao: 1, criadoEm: p.criadoEm, aviso: p.aviso, itens: p.audios };
  return montarZip([
    { nome: 'pacote.json', dados: utf8(JSON.stringify(pacote, null, 1)) },
    ...p.audios.map((it) => ({ nome: it.arquivo, dados: arquivos.get(it.arquivo)! }))
  ]);
}

