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
 *   Precisa de Python com `pip install gradio_client`; com conta grátis do Hugging Face, HF_TOKEN=<token> (mais cota).
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

/* ------------------------------------------------------------------ serviço gratuito (Space do Hugging Face) */

/**
 * API conferida em 18/11 com `gradio_client` (view_api):
 *  - TRELLIS (trellis-community/TRELLIS): UMA chamada, /generate_and_extract_glb (imagem → GLB com textura);
 *  - Hunyuan3D-2 (tencent/Hunyuan3D-2): /generation_all (forma + textura). Em 18/11 a parte de textura do Space
 *    estava quebrada ("texgen_worker is not defined"); /shape_generation dá só a forma, sem cor.
 * A chamada vai pelo cliente oficial em Python (`pip install gradio_client`), que cuida da fila e da sessão.
 * Cota: os Spaces usam ZeroGPU; SEM conta a cota é mínima e acaba logo (em 18/11, daqui: "You have exceeded your
 * ZeroGPU quota"). Com uma conta grátis do Hugging Face, ponha o token em HF_TOKEN (nunca no código).
 */
const PY_GRADIO = `
import json, os, shutil, sys
from gradio_client import Client, handle_file
servico, space, foto, saida = sys.argv[1:5]
c = Client(space, token=os.environ.get("HF_TOKEN") or None, verbose=False)
if servico == "trellis":
    r = c.predict(handle_file(foto), [], 0, 7.5, 12, 3.0, 12, "stochastic", 0.95, 1024, api_name="/generate_and_extract_glb")
    glb = r[2]
else:
    r = c.predict(None, handle_file(foto), None, None, None, None, 30, 5.0, 1234, 256, True, 8000, False, api_name="/generation_all")
    glb = r[1]
shutil.copy(glb, saida)
print(json.dumps({"ok": True}))
`;

const SPACES: Record<string, string> = { trellis: 'trellis-community/TRELLIS', hunyuan: 'tencent/Hunyuan3D-2' };

export async function gerarNoServico(servico: string, foto: Uint8Array, space?: string): Promise<Uint8Array> {
  if (!SPACES[servico]) throw new Error(`Serviço desconhecido: ${servico}`);
  const pasta = mkdtempSync(join(tmpdir(), 'foto3d-servico-'));
  try {
    const ent = join(pasta, 'foto.png'), sai = join(pasta, 'modelo.glb'), py = join(pasta, 'chamar.py');
    writeFileSync(ent, foto);
    writeFileSync(py, PY_GRADIO);
    const r = spawnSync('python3', ['-I', py, servico, space ?? SPACES[servico], ent, sai], { encoding: 'utf8', timeout: 15 * 60_000 });
    if (r.status !== 0 || !existsSync(sai)) {
      const msg = `${r.stderr ?? ''}${r.stdout ?? ''}`;
      if (/No module named .gradio_client/.test(msg)) throw new Error('falta o cliente do gradio: pip install gradio_client');
      if (/ZeroGPU (quota|runs limit)/i.test(msg)) throw new Error('acabou a cota grátis de placa de vídeo do Space (ZeroGPU). Crie uma conta grátis no Hugging Face e rode com HF_TOKEN=... (ou tente amanhã).');
      const ultima = msg.trim().split('\n').filter(Boolean).pop() ?? `saída ${r.status}`;
      throw new Error(ultima.slice(0, 300));
    }
    return new Uint8Array(readFileSync(sai));
  } finally { rmSync(pasta, { recursive: true, force: true }); }
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
