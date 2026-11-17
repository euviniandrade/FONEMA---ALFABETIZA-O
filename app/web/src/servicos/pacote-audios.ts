/**
 * PACOTE DE ÁUDIOS (D032 item 5, "publicar para todos" sem servidor).
 *
 * O administrador troca áudios no aparelho dele (servicos/substituicoes.ts) e, quando quiser que valham para todo
 * mundo, gera um pacote .zip: os arquivos de áudio + `pacote.json` (id do áudio → arquivo no pacote, com o texto).
 * Quem cuida do repositório aplica o pacote com `npx tsx scripts/importar-pacote-audios.ts <pacote.zip>`.
 *
 * Arquivo puro (sem DOM): usado pela tela do administrador, pelo script de importação (Node) e pelos testes.
 * O .zip é escrito sem compressão (áudio já é comprimido) e lido com ou sem compressão (função de descompactar
 * injetada: no Node, zlib.inflateRawSync), para o caso de alguém abrir e fechar o zip de novo no computador.
 */

export const FORMATO_PACOTE = 'fonema-pacote-audios';

export interface ItemPacote {
  /** Id lógico do áudio (som:m, fala:sofia|Bola., nome:tales|ana, arquivo:assets/audio/x.mp3). */
  id: string;
  /** Caminho do arquivo dentro do zip (audios/0001-som-m.wav). */
  arquivo: string;
  mime: string;
  bytes: number;
  sha256?: string;
  /** Texto/legenda (o que o áudio diz). */
  texto?: string;
  /** Tipo para gente ler: "som puro da letra", "palavra", "frase"… */
  tipo?: string;
  origem: 'arquivo' | 'gravacao';
  quem?: string;
  autorizacao?: boolean;
  duracaoMs?: number;
  em: string;
}
export interface Pacote {
  formato: typeof FORMATO_PACOTE;
  versao: 1;
  criadoEm: string;
  /** Aviso fixo: quem aplica o pacote confere se as pessoas gravadas autorizaram por escrito. */
  aviso: string;
  itens: ItemPacote[];
}
export const AVISO_PACOTE = 'Vozes de pessoas reais: só publique com autorização por escrito de quem gravou (e do responsável, se for criança).';

/* ------------------------------------------------------------------ nomes de arquivo */
export function extensaoDoMime(mime: string): string {
  const m = mime.toLowerCase();
  if (m.includes('wav')) return 'wav';
  if (m.includes('mpeg') || m.includes('mp3')) return 'mp3';
  if (m.includes('webm')) return 'webm';
  if (m.includes('ogg') || m.includes('opus')) return 'ogg';
  if (m.includes('mp4') || m.includes('m4a') || m.includes('aac')) return 'm4a';
  if (m.includes('flac')) return 'flac';
  return 'bin';
}
/** Pedaço legível e seguro para nome de arquivo (sem acento, só a-z0-9 e hífen). */
export function slug(t: string, max = 40): string {
  const s = t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  return (s.slice(0, max).replace(/-+$/, '') || 'audio');
}
/** Fonema → pedaço de nome de arquivo (E = é aberto, O = ó aberto, a~ = ã), igual aos nomes de public/audio/sons. */
export function slugDoFonema(f: string): string {
  if (f === 'E') return 'e-aberto';
  if (f === 'O') return 'o-aberto';
  if (f === 'e') return 'e-fechado';
  if (f === 'o') return 'o-fechado';
  return slug(f.replace(/~/g, '-nasal'));
}
/** Nome do arquivo no pacote: ordem + tipo + parte do texto do id. */
export function nomeNoPacote(i: number, id: string, mime: string): string {
  const tipo = id.slice(0, id.indexOf(':'));
  let resto = id.slice(id.indexOf(':') + 1).replace('|', '-');
  if (tipo === 'som') resto = slugDoFonema(resto);
  return `audios/${String(i + 1).padStart(4, '0')}-${tipo}-${slug(resto)}.${extensaoDoMime(mime)}`;
}

/* ------------------------------------------------------------------ CRC-32 e zip (sem compressão) */
const TABELA_CRC = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; }
  return t;
})();
export function crc32(d: Uint8Array): number {
  let c = 0xffffffff;
  for (let i = 0; i < d.length; i++) c = TABELA_CRC[(c ^ d[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
const utf8 = (s: string) => new TextEncoder().encode(s);

function horaDos(d: Date): { hora: number; data: number } {
  return {
    hora: (d.getHours() << 11) | (d.getMinutes() << 5) | Math.floor(d.getSeconds() / 2),
    data: (Math.max(0, d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate()
  };
}

/** Monta um .zip (método "store"). Nomes em UTF-8. */
export function montarZip(arquivos: { nome: string; dados: Uint8Array }[], quando = new Date()): Uint8Array {
  const { hora, data } = horaDos(quando);
  const partes: Uint8Array[] = [];
  const central: Uint8Array[] = [];
  let pos = 0;
  for (const a of arquivos) {
    const nome = utf8(a.nome);
    const crc = crc32(a.dados);
    const loc = new DataView(new ArrayBuffer(30));
    loc.setUint32(0, 0x04034b50, true); loc.setUint16(4, 20, true); loc.setUint16(6, 0x0800, true); loc.setUint16(8, 0, true);
    loc.setUint16(10, hora, true); loc.setUint16(12, data, true); loc.setUint32(14, crc, true);
    loc.setUint32(18, a.dados.length, true); loc.setUint32(22, a.dados.length, true); loc.setUint16(26, nome.length, true); loc.setUint16(28, 0, true);
    partes.push(new Uint8Array(loc.buffer), nome, a.dados);
    const cen = new DataView(new ArrayBuffer(46));
    cen.setUint32(0, 0x02014b50, true); cen.setUint16(4, 20, true); cen.setUint16(6, 20, true); cen.setUint16(8, 0x0800, true); cen.setUint16(10, 0, true);
    cen.setUint16(12, hora, true); cen.setUint16(14, data, true); cen.setUint32(16, crc, true);
    cen.setUint32(20, a.dados.length, true); cen.setUint32(24, a.dados.length, true); cen.setUint16(28, nome.length, true);
    cen.setUint32(42, pos, true);
    central.push(new Uint8Array(cen.buffer), nome);
    pos += 30 + nome.length + a.dados.length;
  }
  const tamCentral = central.reduce((n, p) => n + p.length, 0);
  const fim = new DataView(new ArrayBuffer(22));
  fim.setUint32(0, 0x06054b50, true); fim.setUint16(8, arquivos.length, true); fim.setUint16(10, arquivos.length, true);
  fim.setUint32(12, tamCentral, true); fim.setUint32(16, pos, true);
  const tudo = [...partes, ...central, new Uint8Array(fim.buffer)];
  const out = new Uint8Array(tudo.reduce((n, p) => n + p.length, 0));
  let o = 0;
  for (const p of tudo) { out.set(p, o); o += p.length; }
  return out;
}

/** Lê um .zip (store; deflate só com `inflar`). Confere o CRC de cada arquivo. */
export function lerZip(zip: Uint8Array, inflar?: (d: Uint8Array) => Uint8Array): { nome: string; dados: Uint8Array }[] {
  const v = new DataView(zip.buffer, zip.byteOffset, zip.byteLength);
  let e = -1;
  for (let i = zip.length - 22; i >= Math.max(0, zip.length - 22 - 0xffff); i--) if (v.getUint32(i, true) === 0x06054b50) { e = i; break; }
  if (e < 0) throw new Error('Não é um arquivo .zip.');
  const n = v.getUint16(e + 10, true);
  let p = v.getUint32(e + 16, true);
  const out: { nome: string; dados: Uint8Array }[] = [];
  const dec = new TextDecoder();
  for (let k = 0; k < n; k++) {
    if (v.getUint32(p, true) !== 0x02014b50) throw new Error('Zip com índice estragado.');
    const metodo = v.getUint16(p + 10, true);
    const crc = v.getUint32(p + 16, true);
    const comp = v.getUint32(p + 20, true);
    const ln = v.getUint16(p + 28, true), lx = v.getUint16(p + 30, true), lc = v.getUint16(p + 32, true);
    const off = v.getUint32(p + 42, true);
    const nome = dec.decode(zip.subarray(p + 46, p + 46 + ln));
    p += 46 + ln + lx + lc;
    if (nome.endsWith('/')) continue;
    const ini = off + 30 + v.getUint16(off + 26, true) + v.getUint16(off + 28, true);
    const bruto = zip.subarray(ini, ini + comp);
    let dados: Uint8Array;
    if (metodo === 0) dados = bruto.slice();
    else if (metodo === 8 && inflar) dados = inflar(bruto);
    else throw new Error(`Compressão não suportada em ${nome}.`);
    if (crc32(dados) !== crc) throw new Error(`Arquivo corrompido no zip: ${nome}.`);
    out.push({ nome, dados });
  }
  return out;
}

/* ------------------------------------------------------------------ pacote */
export interface EntradaPacote {
  id: string; dados: Uint8Array; mime: string; texto?: string; tipo?: string; origem: 'arquivo' | 'gravacao';
  quem?: string; autorizacao?: boolean; duracaoMs?: number; em: number; sha256?: string;
}
/** Monta o pacote (zip com pacote.json + audios/…) a partir dos áudios trocados. */
export function montarPacote(entradas: EntradaPacote[], quando = new Date()): { zip: Uint8Array; pacote: Pacote } {
  const ordenadas = [...entradas].sort((a, b) => a.id.localeCompare(b.id));
  const itens: ItemPacote[] = ordenadas.map((e, i) => ({
    id: e.id, arquivo: nomeNoPacote(i, e.id, e.mime), mime: e.mime, bytes: e.dados.length, sha256: e.sha256, texto: e.texto, tipo: e.tipo,
    origem: e.origem, quem: e.quem, autorizacao: e.autorizacao, duracaoMs: e.duracaoMs, em: new Date(e.em).toISOString()
  }));
  const pacote: Pacote = { formato: FORMATO_PACOTE, versao: 1, criadoEm: quando.toISOString(), aviso: AVISO_PACOTE, itens };
  const leia = [
    'PACOTE DE ÁUDIOS DO FONEMA',
    '',
    `Criado em ${quando.toLocaleString('pt-BR')} com ${itens.length} áudio(s).`,
    'Para aplicar no repositório (a partir da pasta app/):',
    '  npx tsx scripts/importar-pacote-audios.ts caminho/do/pacote.zip',
    '',
    AVISO_PACOTE,
    '',
    ...itens.map((it) => `${it.arquivo}  →  ${it.id}${it.texto ? `  ("${it.texto}")` : ''}`)
  ].join('\n');
  const zip = montarZip([
    { nome: 'pacote.json', dados: utf8(JSON.stringify(pacote, null, 1)) },
    { nome: 'LEIA-ME.txt', dados: utf8(leia) },
    ...itens.map((it, i) => ({ nome: it.arquivo, dados: ordenadas[i].dados }))
  ], quando);
  return { zip, pacote };
}

/** Abre um pacote: confere formato, ids, arquivos e tamanhos. Devolve os itens com os bytes. */
export function abrirPacote(zip: Uint8Array, inflar?: (d: Uint8Array) => Uint8Array): { pacote: Pacote; arquivos: Map<string, Uint8Array> } {
  const lista = lerZip(zip, inflar);
  const arquivos = new Map(lista.map((a) => [a.nome.replace(/^.*?(?=pacote\.json$|audios\/)/, ''), a.dados]));
  const j = arquivos.get('pacote.json');
  if (!j) throw new Error('O zip não tem pacote.json: não é um pacote de áudios do FONEMA.');
  const pacote = JSON.parse(new TextDecoder().decode(j)) as Pacote;
  if (pacote.formato !== FORMATO_PACOTE || pacote.versao !== 1 || !Array.isArray(pacote.itens)) throw new Error('pacote.json de formato desconhecido.');
  for (const it of pacote.itens) {
    if (!/^(som|fala|nome|arquivo):./.test(it.id)) throw new Error(`Id de áudio inválido: ${it.id}`);
    if (!/^audios\/[a-z0-9.-]+$/.test(it.arquivo)) throw new Error(`Nome de arquivo inválido: ${it.arquivo}`);
    const d = arquivos.get(it.arquivo);
    if (!d) throw new Error(`Falta o arquivo ${it.arquivo} no zip.`);
    if (d.length !== it.bytes) throw new Error(`Tamanho diferente do esperado: ${it.arquivo}.`);
  }
  return { pacote, arquivos };
}
