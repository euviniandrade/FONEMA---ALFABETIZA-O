/**
 * FOTO → 3D, segunda etapa (fila do dono nº 19). A Área do administrador (aba Foto → 3D) faz o "relevo" na hora, sem
 * servidor. Para um modelo 3D INTEIRO (com o verso de verdade), ela baixa um PEDIDO (.zip: pedido.json,
 * foto-recortada.png e relevo.glb). Este script recebe o pedido, manda a foto recortada para um serviço GRATUITO de
 * imagem → 3D (um Space público do Hugging Face, pela API do gradio), comprime o modelo como os outros GLB do projeto
 * (meshopt + WebP) e devolve um PACOTE DO GERENCIADOR, que se aplica com scripts/importar-pacote.ts.
 * Passo a passo: app/docs/como-transformar-foto-em-3d.md.
 *
 * Uso (a partir de app/):
 *   npx tsx scripts/foto-para-3d.ts caminho/fonema-pedido-3d-<nome>.zip [opções]
 *     --servico trellis|hunyuan|relevo   (padrão: trellis; "relevo" usa o relevo que veio no pedido, sem internet)
 *     --space dono/nome                  outro Space do Hugging Face com a mesma API
 *     --saida PASTA                      onde gravar o pacote (padrão: a pasta do pedido)
 *     --sem-comprimir                    não passa pelo gltf-transform
 *
 * Limites honestos: os Spaces gratuitos têm fila e cota diária (ZeroGPU); a API deles muda sem aviso. Se o serviço
 * falhar, o script diz o motivo e oferece o caminho "relevo". Foto de pessoa nunca: o pedido só existe depois da
 * confirmação do adulto, e o script recusa pedido sem ela.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { inflateRawSync } from 'node:zlib';
import { lerZip } from '../web/src/servicos/pacote-audios.ts';
import { caminhoDeMidiaPermitido, montarPacoteGeral } from '../web/src/servicos/pacote.ts';

export interface Pedido {
  formato: 'fonema-pedido-foto-3d';
  versao: 1;
  nome: string;
  slug: string;
  destino: string;
  /** Caminho em assets/, sem extensão (ex.: modelos3d/itens/carrinho). */
  caminho: string;
  confirmouQueNaoEhPessoa: boolean;
  criadoEm: string;
  quem?: string;
}

/** Abre e confere o pedido. */
export function lerPedido(zip: Uint8Array): { pedido: Pedido; foto: Uint8Array; relevo: Uint8Array | null } {
  const arqs = new Map(lerZip(zip, (d) => new Uint8Array(inflateRawSync(d))).map((a) => [basename(a.nome), a.dados]));
  const j = arqs.get('pedido.json');
  if (!j) throw new Error('Este .zip não é um pedido de foto → 3D (falta pedido.json).');
  const pedido = JSON.parse(new TextDecoder().decode(j)) as Pedido;
  if (pedido.formato !== 'fonema-pedido-foto-3d') throw new Error('Formato de pedido desconhecido.');
  if (!pedido.confirmouQueNaoEhPessoa) throw new Error('O pedido não tem a confirmação de que a foto não é de pessoa. Nada foi feito.');
  if (!caminhoDeMidiaPermitido(`${pedido.caminho}.glb`) || !pedido.caminho.startsWith('modelos3d/')) throw new Error(`Caminho não permitido: ${pedido.caminho}`);
  const foto = arqs.get('foto-recortada.png');
  if (!foto) throw new Error('Falta a foto recortada no pedido.');
  return { pedido, foto, relevo: arqs.get('relevo.glb') ?? null };
}

/** Monta o pacote do gerenciador com o modelo (e a foto de frente, se houver). */
export function pacoteDoModelo(pedido: Pedido, glb: Uint8Array, quando = new Date()): Uint8Array {
  if (glb.length < 20 || new DataView(glb.buffer, glb.byteOffset).getUint32(0, true) !== 0x46546c67) throw new Error('O modelo recebido não é um GLB.');
  return montarPacoteGeral({ audios: [], edicoes: [], midias: [{ caminho: `${pedido.caminho}.glb`, dados: glb, mime: 'model/gltf-binary', nome: `${pedido.slug}.glb`, quem: pedido.quem, em: quando.getTime() }] }, quando).zip;
}

/* ------------------------------------------------------------------ serviço gratuito (gradio) */

const SPACES: Record<string, { space: string; passos: { api: string; dados: (foto: unknown, anterior: unknown[]) => unknown[] }[] }> = {
  // TRELLIS (Microsoft, licença MIT), cópia mantida pela comunidade: gera o 3D e depois extrai o GLB
  trellis: {
    space: 'trellis-community/TRELLIS',
    passos: [
      { api: 'start_session', dados: () => [] },
      { api: 'preprocess_image', dados: (foto) => [foto] },
      { api: 'image_to_3d', dados: (_f, ant) => [ant[0], [], 0, 7.5, 12, 3, 12, 'stochastic'] },
      { api: 'extract_glb', dados: () => [0.95, 1024] }
    ]
  },
  // Hunyuan3D-2 (Tencent): forma + textura
  hunyuan: { space: 'tencent/Hunyuan3D-2', passos: [{ api: 'generation_all', dados: (foto) => ['', foto, null, null, null, null, 30, 5, 1234, 256, true, 8000, true] }] }
};

const urlDoSpace = (s: string) => `https://${s.toLowerCase().replace(/[/_.]/g, '-')}.hf.space`;

async function chamarGradio(base: string, api: string, dados: unknown[]): Promise<unknown[]> {
  const r = await fetch(`${base}/gradio_api/call/${api}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ data: dados }) });
  if (!r.ok) throw new Error(`${api}: o serviço respondeu ${r.status}`);
  const { event_id: id } = (await r.json()) as { event_id: string };
  const ev = await fetch(`${base}/gradio_api/call/${api}/${id}`);
  const texto = await ev.text();
  const erro = /event: error\ndata: (.*)/.exec(texto);
  if (erro) throw new Error(`${api}: ${erro[1] || 'erro no serviço (fila cheia ou cota do dia acabou?)'}`);
  const fim = [...texto.matchAll(/event: complete\ndata: (.*)/g)].pop();
  if (!fim) throw new Error(`${api}: o serviço não terminou`);
  return JSON.parse(fim[1]) as unknown[];
}

async function enviarArquivo(base: string, dados: Uint8Array, nome: string): Promise<unknown> {
  const fd = new FormData();
  fd.append('files', new Blob([dados as BlobPart], { type: 'image/png' }), nome);
  const r = await fetch(`${base}/gradio_api/upload`, { method: 'POST', body: fd });
  if (!r.ok) throw new Error(`envio da foto: o serviço respondeu ${r.status}`);
  const [caminho] = (await r.json()) as string[];
  return { path: caminho, meta: { _type: 'gradio.FileData' }, orig_name: nome };
}

/** Acha, na resposta do gradio, o primeiro arquivo .glb e baixa. */
async function baixarGlb(base: string, resposta: unknown): Promise<Uint8Array> {
  const achar = (x: unknown): string | null => {
    if (!x || typeof x !== 'object') return null;
    const o = x as Record<string, unknown>;
    for (const k of ['url', 'path']) if (typeof o[k] === 'string' && /\.glb(\?|$)/i.test(o[k] as string)) return o[k] as string;
    for (const v of Object.values(o)) { const a = achar(v); if (a) return a; }
    return null;
  };
  const alvo = achar(resposta);
  if (!alvo) throw new Error('O serviço não devolveu um .glb.');
  const url = /^https?:/.test(alvo) ? alvo : `${base}/gradio_api/file=${alvo}`;
  const r = await fetch(url);
  if (!r.ok) throw new Error(`download do modelo: ${r.status}`);
  return new Uint8Array(await r.arrayBuffer());
}

export async function gerarNoServico(servico: string, foto: Uint8Array, space?: string): Promise<Uint8Array> {
  const cfg = SPACES[servico];
  if (!cfg) throw new Error(`Serviço desconhecido: ${servico}`);
  const base = urlDoSpace(space ?? cfg.space);
  const arquivo = await enviarArquivo(base, foto, 'foto.png');
  let anterior: unknown[] = [];
  for (const p of cfg.passos) anterior = await chamarGradio(base, p.api, p.dados(arquivo, anterior) as unknown[]);
  return baixarGlb(base, anterior);
}

function comprimir(glb: Uint8Array): Uint8Array {
  const pasta = mkdtempSync(join(tmpdir(), 'foto3d-'));
  try {
    const ent = join(pasta, 'in.glb'), sai = join(pasta, 'out.glb');
    writeFileSync(ent, glb);
    const r = spawnSync('npx', ['--yes', '@gltf-transform/cli@4.5.1', 'optimize', ent, sai, '--texture-size', '1024', '--texture-compress', 'webp', '--compress', 'meshopt'], { stdio: 'inherit' });
    if (r.status !== 0 || !existsSync(sai)) { console.warn('  ! não deu para comprimir; o modelo vai como veio.'); return glb; }
    return new Uint8Array(readFileSync(sai));
  } finally { rmSync(pasta, { recursive: true, force: true }); }
}

async function main() {
  const args = process.argv.slice(2);
  const op = (n: string) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : undefined; };
  const arquivo = args.find((a, i) => !a.startsWith('--') && !['--servico', '--space', '--saida'].includes(args[i - 1]));
  if (!arquivo) { console.log('Uso: npx tsx scripts/foto-para-3d.ts fonema-pedido-3d-<nome>.zip [--servico trellis|hunyuan|relevo] [--space dono/nome] [--saida PASTA] [--sem-comprimir]'); process.exit(1); }
  const { pedido, foto, relevo } = lerPedido(new Uint8Array(readFileSync(arquivo)));
  const servico = op('--servico') ?? 'trellis';
  console.log(`Pedido: "${pedido.nome}" → assets/${pedido.caminho}.glb (serviço: ${servico})`);
  let glb: Uint8Array;
  if (servico === 'relevo') {
    if (!relevo) throw new Error('O pedido não trouxe o relevo.');
    glb = relevo;
  } else {
    try {
      glb = await gerarNoServico(servico, foto, op('--space'));
    } catch (e) {
      console.error(`  ✗ o serviço gratuito falhou: ${e instanceof Error ? e.message : String(e)}`);
      console.error('    Tente mais tarde (fila/cota do dia), outro --servico, ou --servico relevo (o 3D feito no navegador).');
      process.exit(2);
    }
  }
  if (!args.includes('--sem-comprimir')) glb = comprimir(glb);
  const saida = resolve(op('--saida') ?? dirname(resolve(arquivo)), `fonema-pacote-3d-${pedido.slug}.zip`);
  writeFileSync(saida, pacoteDoModelo(pedido, glb));
  console.log(`✓ ${saida} (${Math.round(glb.length / 1024)} KB de modelo)`);
  console.log('  Para aplicar no repositório: npx tsx scripts/importar-pacote.ts ' + saida);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((e) => { console.error(e instanceof Error ? e.message : e); process.exit(1); });
}
