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
import { NOMES_COMUNS, SONS } from '@fonema/conteudo';

const VOZES = { sofia: 'nlRJzw7MAFZF6truVWij', tales: 'HUKUk1tOcZ0szNQgemif' } as const;
type Voz = keyof typeof VOZES;
/**
 * Modelo por voz. A voz do Tales foi desenhada e aprovada no Eleven v3: no multilingual_v2 ela sai como
 * homem adulto (conferido por comparação com a amostra aprovada). A da Sofia é fiel no multilingual_v2.
 */
const MODELO: Record<Voz, string> = { sofia: 'eleven_multilingual_v2', tales: 'eleven_v3' };
/** Sufixo de versão no nome do arquivo: muda quando o modelo da voz muda, para regerar sem apagar nada. */
const VERSAO: Record<Voz, string> = { sofia: '', tales: '-v3' };
const REFAZER_NOMES_TALES = process.argv.includes('--refazer-nomes-tales');
const API = 'https://api.elevenlabs.io/v1';
const CHAVE = process.env.ELEVENLABS_API_KEY ?? 'proxy-injected';
const arg = (n: string, d?: string) => { const i = process.argv.indexOf(n); return i >= 0 ? process.argv[i + 1] : d; };
const ORCAMENTO = Number(arg('--orcamento', '18000'));
const SIMULAR = process.argv.includes('--simular');
const PUB = 'web/public/audio';

const chaveTrecho = (t: string) => t.replace(/^[\s,.!?;:…]+/, '').replace(/\s+/g, ' ').replace(/(\p{L})\1{2,}/giu, '$1$1$1$1').trim();

/**
 * Texto que vai para o TTS (a CHAVE continua sendo o texto original):
 * - som isolado de consoante ("mmmm") sai errado no TTS → "M, de macaco"; vogal esticada → "Aaaaa";
 * - palavra solta sai cortada → "Mala." com velocidade 0,85.
 */
const VOGAIS = 'aeiouáéíóúâêôãõ';
/** "sss… ooo… lll" (síntese de fonemas): o TTS não faz; fica para a gravação da fonoaudióloga. */
const ehSequenciaDeSons = (k: string) => { const ts = k.split(/[\s…,.!?-]+/).filter(Boolean); return ts.length > 1 && ts.every((t) => /^(\p{L})\1{2,}$/iu.test(t)); };
function paraTTS(k: string): { texto: string; lento: boolean } | null {
  if (ehSequenciaDeSons(k)) return null;
  let t = k.replace(/(^|[^\p{L}])(\p{L})\2{2,}(\p{L}?)(?=$|[^\p{L}])/giu, (_m, antes: string, l: string) => {
    const low = l.toLowerCase();
    if (VOGAIS.includes(low)) return antes + low.toUpperCase() + low.repeat(4);
    const som = Object.values(SONS).find((x) => x.chave === low || x.letra.toLowerCase() === low);
    return antes + (som ? `${som.letra}, de ${som.palavras[0][0]}` : l.toUpperCase());
  });
  t = t.replace(/\//g, '').replace(/\b\p{Lu}{2,}\b/gu, (w) => w.toLowerCase());
  const palavras = t.split(/\s+/).filter(Boolean);
  const lento = palavras.length <= 2;
  if (lento) t = t.charAt(0).toUpperCase() + t.slice(1).replace(/[.,!?…]?$/, (m) => m || '.');
  return { texto: t, lento };
}
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

async function tts(voz: Voz, texto: string, destino: string, lento = false) {
  for (let t = 0; t < 3; t++) {
    const r = await fetch(`${API}/text-to-speech/${VOZES[voz]}?output_format=mp3_44100_64`, {
      method: 'POST',
      headers: { 'xi-api-key': CHAVE, 'content-type': 'application/json', accept: 'audio/mpeg' },
      body: JSON.stringify({ text: texto, model_id: MODELO[voz], voice_settings: { stability: 0.5, similarity_boost: 0.8, ...(lento && voz !== 'tales' ? { speed: 0.85 } : {}) } })
    });
    if (r.ok) { writeFileSync(destino, Buffer.from(await r.arrayBuffer())); return; }
    const msg = await r.text();
    if (r.status === 429 || r.status >= 500) { await new Promise((s) => setTimeout(s, 1500 * (t + 1))); continue; }
    throw new Error(`ElevenLabs ${r.status}: ${msg.slice(0, 200)}`);
  }
  throw new Error('ElevenLabs: muitas tentativas');
}

const semAudio = new Set<string>();

/** --textos: imprime { "voz|chave": textoEnviadoAoTTS } para a auditoria (ferramentas/auditar-audio.py). Não gasta créditos. */
function imprimirTextos() {
  const man = JSON.parse(readFileSync(`${PUB}/falas/manifesto.json`, 'utf8')) as Record<string, string>;
  const out: Record<string, string> = {};
  for (const chave of Object.keys(man)) { const k = chave.slice(chave.indexOf('|') + 1); out[chave] = paraTTS(k)?.texto ?? k; }
  console.log(JSON.stringify(out));
}

async function main() {
  if (process.argv.includes('--textos')) return imprimirTextos();
  const falas = JSON.parse(readFileSync('packages/conteudo/src/falas.json', 'utf8')) as { voz: Voz; texto: string }[];
  mkdirSync(`${PUB}/falas`, { recursive: true });
  const manFalasArq = `${PUB}/falas/manifesto.json`;
  const manFalas: Record<string, string> = existsSync(manFalasArq) ? JSON.parse(readFileSync(manFalasArq, 'utf8')) : {};
  const tarefas: { voz: Voz; texto: string; lento: boolean; destino: string; registrar: () => void }[] = [];

  for (const f of falas) {
    for (const parte of f.texto.split('[NOME]')) {
      const k = chaveTrecho(parte);
      if (!k) continue;
      const chave = `${f.voz}|${k}`;
      const arq = `${f.voz}-${hash(chave)}${VERSAO[f.voz]}.mp3`;
      const refazer = process.argv.includes('--refazer-maiusculas') && /\b\p{Lu}{2,3}\b/u.test(k);
      if (!refazer && existsSync(`${PUB}/falas/${arq}`)) { manFalas[chave] = arq; continue; }
      if (tarefas.some((t) => t.destino.endsWith(arq))) continue;
      const tts = paraTTS(k);
      if (!tts) { semAudio.add(k); continue; }
      tarefas.push({ voz: f.voz, ...tts, destino: `${PUB}/falas/${arq}`, registrar: () => (manFalas[chave] = arq) });
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
      if (existsSync(destino) && !(REFAZER_NOMES_TALES && voz === 'tales')) { registrar(); continue; }
      tarefas.push({ voz, texto: `${nome}.`, lento: true, destino, registrar });
    }
  }
  if (semAudio.size) console.log(`sem áudio (sequências de sons para a fonoaudióloga): ${[...semAudio].join(' | ')}`);
  const total = tarefas.reduce((s, t) => s + t.texto.length, 0);
  const antes = await creditos();
  console.log(`a gerar: ${tarefas.length} clipes, ${total} caracteres · créditos usados antes: ${antes.usados}/${antes.limite}`);
  if (SIMULAR) { tarefas.slice(0, 400).forEach((t) => console.log(`  ${t.voz} ${t.lento ? '(lento)' : ''} ${t.texto}`)); return; }
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
      await tts(t.voz, t.texto, t.destino, t.lento);
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
