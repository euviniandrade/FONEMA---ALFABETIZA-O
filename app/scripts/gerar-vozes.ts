/**
 * Gera os áudios OFICIAIS das falas e dos nomes com a API do ElevenLabs
 * (vozes "Sofia — FONEMA" e "Tales — FONEMA", escolhidas pelo dono).
 *
 * - Falas: packages/conteudo/src/falas.json → web/public/audio/falas/{voz}-{hash}.mp3 + manifesto.json
 *   (cada fala é dividida no [NOME]: o trecho antes e o depois viram clipes separados)
 * - Nomes: NOMES_COMUNS → web/public/audio/nomes/{voz}/{nome}.mp3 + manifesto.json
 * - Nunca regenera o que já existe (cache em disco). Para quando atingir o orçamento.
 *
 * A chave da API NÃO fica no repositório: neste ambiente ela é injetada pelo proxy.
 * Uso: npx tsx scripts/gerar-vozes.ts --orcamento 18000 [--simular]
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { NOMES_COMUNS } from '@fonema/conteudo';

const VOZES = { sofia: 'nlRJzw7MAFZF6truVWij', tales: 'HUKUk1tOcZ0szNQgemif' } as const;
type Voz = keyof typeof VOZES;
const API = 'https://api.elevenlabs.io/v1';
const CHAVE = process.env.ELEVENLABS_API_KEY ?? 'proxy-injected';
const arg = (n: string, d?: string) => { const i = process.argv.indexOf(n); return i >= 0 ? process.argv[i + 1] : d; };
const ORCAMENTO = Number(arg('--orcamento', '18000'));
const SIMULAR = process.argv.includes('--simular');
const PUB = 'web/public/audio';

const chaveTrecho = (t: string) => t.replace(/^[\s,.!?;:…]+/, '').replace(/\s+/g, ' ').trim();
const chaveNome = (n: string) => n.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z]+/g, '-').replace(/^-|-$/g, '');
function hash(t: string) {
  let h = 5381;
  for (const ch of t) h = ((h * 33) ^ ch.codePointAt(0)!) >>> 0;
  return h.toString(36);
}

async function creditos(): Promise<{ usados: number; limite: number }> {
  const r = await fetch(`${API}/user/subscription`, { headers: { 'xi-api-key': CHAVE } });
  const d = await r.json();
  return { usados: d.character_count, limite: d.character_limit };
}

async function tts(voz: Voz, texto: string, destino: string) {
  for (let t = 0; t < 3; t++) {
    const r = await fetch(`${API}/text-to-speech/${VOZES[voz]}?output_format=mp3_44100_64`, {
      method: 'POST',
      headers: { 'xi-api-key': CHAVE, 'content-type': 'application/json', accept: 'audio/mpeg' },
      body: JSON.stringify({ text: texto, model_id: 'eleven_multilingual_v2', voice_settings: { stability: 0.5, similarity_boost: 0.8 } })
    });
    if (r.ok) { writeFileSync(destino, Buffer.from(await r.arrayBuffer())); return; }
    const msg = await r.text();
    if (r.status === 429 || r.status >= 500) { await new Promise((s) => setTimeout(s, 1500 * (t + 1))); continue; }
    throw new Error(`ElevenLabs ${r.status}: ${msg.slice(0, 200)}`);
  }
  throw new Error('ElevenLabs: muitas tentativas');
}

async function main() {
  const falas = JSON.parse(readFileSync('packages/conteudo/src/falas.json', 'utf8')) as { voz: Voz; texto: string }[];
  mkdirSync(`${PUB}/falas`, { recursive: true });
  const manFalasArq = `${PUB}/falas/manifesto.json`;
  const manFalas: Record<string, string> = existsSync(manFalasArq) ? JSON.parse(readFileSync(manFalasArq, 'utf8')) : {};
  const tarefas: { voz: Voz; texto: string; destino: string; registrar: () => void }[] = [];

  for (const f of falas) {
    for (const parte of f.texto.split('[NOME]')) {
      const k = chaveTrecho(parte);
      if (!k) continue;
      const chave = `${f.voz}|${k}`;
      const arq = `${f.voz}-${hash(chave)}.mp3`;
      if (existsSync(`${PUB}/falas/${arq}`)) { manFalas[chave] = arq; continue; }
      if (tarefas.some((t) => t.destino.endsWith(arq))) continue;
      tarefas.push({ voz: f.voz, texto: k, destino: `${PUB}/falas/${arq}`, registrar: () => (manFalas[chave] = arq) });
    }
  }
  const manNomesArq = `${PUB}/nomes/manifesto.json`;
  const manNomes: Record<Voz, string[]> = existsSync(manNomesArq) ? JSON.parse(readFileSync(manNomesArq, 'utf8')) : { sofia: [], tales: [] };
  for (const voz of Object.keys(VOZES) as Voz[]) {
    mkdirSync(`${PUB}/nomes/${voz}`, { recursive: true });
    for (const nome of NOMES_COMUNS) {
      const k = chaveNome(nome);
      const destino = `${PUB}/nomes/${voz}/${k}.mp3`;
      const registrar = () => { if (!manNomes[voz].includes(k)) manNomes[voz].push(k); };
      if (existsSync(destino)) { registrar(); continue; }
      tarefas.push({ voz, texto: nome, destino, registrar });
    }
  }
  const total = tarefas.reduce((s, t) => s + t.texto.length, 0);
  const antes = await creditos();
  console.log(`a gerar: ${tarefas.length} clipes, ${total} caracteres · créditos usados antes: ${antes.usados}/${antes.limite}`);
  if (SIMULAR) return;
  if (antes.limite - antes.usados < Math.min(total, ORCAMENTO)) console.warn('atenção: créditos restantes podem não bastar; o script para ao atingir o limite.');

  let gastos = 0;
  let feitos = 0;
  const fila = [...tarefas];
  async function trabalhador() {
    for (;;) {
      const t = fila.shift();
      if (!t) return;
      if (gastos + t.texto.length > ORCAMENTO) { console.warn(`orçamento atingido; pulando "${t.texto.slice(0, 30)}"`); continue; }
      gastos += t.texto.length;
      await tts(t.voz, t.texto, t.destino);
      t.registrar();
      if (++feitos % 25 === 0) {
        console.log(`  ${feitos}/${tarefas.length} (${gastos} caracteres)`);
        writeFileSync(manFalasArq, JSON.stringify(manFalas, null, 1));
        writeFileSync(manNomesArq, JSON.stringify(manNomes, null, 1));
      }
    }
  }
  try {
    await Promise.all([trabalhador(), trabalhador(), trabalhador()]);
  } finally {
    writeFileSync(manFalasArq, JSON.stringify(manFalas, null, 1));
    writeFileSync(manNomesArq, JSON.stringify(manNomes, null, 1));
    const depois = await creditos();
    console.log(`gerados ${feitos} clipes (${gastos} caracteres enviados) · créditos usados depois: ${depois.usados} (gasto real: ${depois.usados - antes.usados})`);
  }
}

main().catch((e) => { console.error(e); process.exitCode = 1; });
