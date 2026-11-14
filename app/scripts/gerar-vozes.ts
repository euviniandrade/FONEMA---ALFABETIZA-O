/**
 * Gera os áudios OFICIAIS das falas e dos nomes com a API do ElevenLabs
 * (vozes "Sofia — FONEMA" e "Tales — FONEMA", escolhidas pelo dono).
 *
 * - Falas: packages/conteudo/src/falas.json → audio-fontes/falas/{voz}-{hash}.mp3 + manifesto.json (bruto do TTS)
 *   (cada fala é dividida no [NOME]: o trecho antes e o depois viram clipes separados)
 * - Nomes: NOMES_COMUNS → audio-fontes/nomes/{voz}/{nome}.mp3 + manifesto.json
 * - Nunca regenera o que já existe (cache em disco). Para quando atingir o orçamento.
 * - Regravar um clipe com defeito: audio-fontes/ajustes.json (arquivo novo com sufixo -r<versão>; nada é apagado).
 * - No fim roda ferramentas/masterizar-audio.py (→ web/public/audio) e pede a auditoria (ferramentas/auditar-audio.py).
 *   --so-ajustes: gera só o que está em ajustes.json (não toca nas falas novas do conteúdo).
 *
 * A chave da API NÃO fica no repositório: neste ambiente ela é injetada pelo proxy.
 * Uso: npx tsx scripts/gerar-vozes.ts --orcamento 18000 [--simular]
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
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
const API = 'https://api.elevenlabs.io/v1';
const CHAVE = process.env.ELEVENLABS_API_KEY ?? 'proxy-injected';
const arg = (n: string, d?: string) => { const i = process.argv.indexOf(n); return i >= 0 ? process.argv[i + 1] : d; };
const ORCAMENTO = Number(arg('--orcamento', '2000'));
const SIMULAR = process.argv.includes('--simular');
/** Clipes BRUTOS do TTS (nunca apagados). Os que vão ao ar saem de ferramentas/masterizar-audio.py → web/public/audio. */
const FONTES = 'audio-fontes';

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
  t = t.replace(/\//g, '').replace(/(?<!\p{L})\p{Lu}{2,}(?!\p{L})/gu, (w) => w.toLowerCase());
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

type Ajuste = { texto?: string; versao: number; lento?: boolean };
/**
 * Regravações (audio-fontes/ajustes.json): { falas: { "voz|chave": { texto?, versao } }, nomes: { "voz|nome": { texto?, versao } } }.
 * Um ajuste gera um arquivo NOVO (sufixo -r<versao>), sem apagar o anterior, e o manifesto das fontes passa a apontar para ele.
 * "texto" troca só o que vai para o TTS (pontuação/contexto para a fala não sair cortada); a chave continua a mesma.
 */
const AJUSTES: { falas: Record<string, Ajuste>; nomes: Record<string, Ajuste> } = existsSync(`${FONTES}/ajustes.json`) ? JSON.parse(readFileSync(`${FONTES}/ajustes.json`, 'utf8')) : { falas: {}, nomes: {} };
const lerJson = <T,>(arq: string, padrao: T): T => (existsSync(arq) ? JSON.parse(readFileSync(arq, 'utf8')) : padrao);

/** Texto enviado ao TTS para uma chave do manifesto (o registrado na geração, o do ajuste ou o calculado). */
function textoDe(chave: string, registrados: Record<string, string>): string {
  const k = chave.slice(chave.indexOf('|') + 1);
  return registrados[chave] ?? AJUSTES.falas[chave]?.texto ?? paraTTS(k)?.texto ?? k;
}
/** --textos: imprime { "voz|chave": textoEnviadoAoTTS } para a auditoria (ferramentas/auditar-audio.py). Não gasta créditos. */
function imprimirTextos() {
  const man = lerJson<Record<string, string>>(`${FONTES}/falas/manifesto.json`, {});
  const reg = lerJson<Record<string, string>>(`${FONTES}/falas/textos.json`, {});
  console.log(JSON.stringify(Object.fromEntries(Object.keys(man).map((c) => [c, textoDe(c, reg)]))));
}

async function main() {
  if (process.argv.includes('--textos')) return imprimirTextos();
  const SO_AJUSTES = process.argv.includes('--so-ajustes');
  const falas = JSON.parse(readFileSync('packages/conteudo/src/falas.json', 'utf8')) as { voz: Voz; texto: string }[];
  mkdirSync(`${FONTES}/falas`, { recursive: true });
  const manFalasArq = `${FONTES}/falas/manifesto.json`;
  const manFalas = lerJson<Record<string, string>>(manFalasArq, {});
  const textosArq = `${FONTES}/falas/textos.json`;
  const textos = lerJson<Record<string, string>>(textosArq, {});
  const tarefas: { voz: Voz; texto: string; lento: boolean; destino: string; registrar: () => void }[] = [];

  const chaves = new Set<string>(Object.keys(AJUSTES.falas));
  if (!SO_AJUSTES) for (const f of falas) for (const parte of f.texto.split('[NOME]')) { const k = chaveTrecho(parte); if (k) chaves.add(`${f.voz}|${k}`); }
  for (const chave of chaves) {
    const voz = chave.slice(0, chave.indexOf('|')) as Voz;
    const k = chave.slice(chave.indexOf('|') + 1);
    const aj = AJUSTES.falas[chave];
    const arq = `${voz}-${hash(chave)}${VERSAO[voz]}${aj ? `-r${aj.versao}` : ''}.mp3`;
    if (existsSync(`${FONTES}/falas/${arq}`)) { manFalas[chave] = arq; continue; }
    const tts = aj?.texto ? { texto: aj.texto, lento: aj.lento ?? aj.texto.split(/\s+/).length <= 2 } : paraTTS(k);
    if (!tts) { semAudio.add(k); continue; }
    // o Eleven v3 (Tales) corta o fim da fala quando o texto acaba em vírgula (trecho antes do nome): reticências resolvem
    if (voz === 'tales' && !aj?.texto) tts.texto = tts.texto.replace(/,\s*$/, '…');
    tarefas.push({ voz, ...tts, destino: `${FONTES}/falas/${arq}`, registrar: () => { manFalas[chave] = arq; textos[chave] = tts.texto; } });
  }
  const manNomesArq = `${FONTES}/nomes/manifesto.json`;
  const manNomes = lerJson<Record<Voz, Record<string, string>>>(manNomesArq, { sofia: {}, tales: {} });
  for (const voz of Object.keys(VOZES) as Voz[]) {
    mkdirSync(`${FONTES}/nomes/${voz}`, { recursive: true });
    for (const nome of NOMES_COMUNS) {
      const k = chaveNome(nome);
      const aj = AJUSTES.nomes[`${voz}|${k}`];
      if (SO_AJUSTES && !aj) continue;
      const arq = `${k}${aj ? `-r${aj.versao}` : ''}.mp3`;
      const destino = `${FONTES}/nomes/${voz}/${arq}`;
      const registrar = () => { manNomes[voz][k] = arq; };
      if (existsSync(destino)) { registrar(); continue; }
      tarefas.push({ voz, texto: aj?.texto ?? `${nome}.`, lento: true, destino, registrar });
    }
  }
  const gravar = () => {
    writeFileSync(manFalasArq, JSON.stringify(manFalas, null, 1));
    writeFileSync(textosArq, JSON.stringify(textos, null, 1));
    writeFileSync(manNomesArq, JSON.stringify(manNomes, null, 1));
  };
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
      if (++feitos % 25 === 0) { console.log(`  ${feitos}/${tarefas.length} (${gastos} caracteres)`); gravar(); }
    }
  }
  try {
    await Promise.all([trabalhador(), trabalhador(), trabalhador()]);
  } finally {
    gravar();
    const depois = await creditos();
    console.log(`gerados ${feitos} clipes (${gastos} caracteres enviados) · créditos usados depois: ${depois.usados} (gasto real: ${depois.usados - antes.usados})`);
    // os clipes brutos nunca vão ao ar direto: masterização (fade, silêncio nas pontas, volume) e depois a AUDITORIA
    execFileSync('python3', ['ferramentas/masterizar-audio.py'], { stdio: 'inherit' });
    console.log('agora rode a auditoria: python3 ferramentas/auditar-audio.py  (nenhum áudio vai ao ar sem ela)');
  }
}

main().catch((e) => { console.error(e); process.exitCode = 1; });
