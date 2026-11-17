/**
 * Aplica um PACOTE DE ÁUDIOS gerado na Área do administrador (Publicar › Gerar pacote) ao repositório, para que os
 * áudios trocados passem a valer para TODOS na próxima versão publicada do site. Passo a passo para o dono:
 * app/docs/como-trocar-audios.md.
 *
 * Uso (a partir de app/):
 *   npx tsx scripts/importar-pacote-audios.ts caminho/fonema-pacote-audios-AAAAMMDD-HHMM.zip [opções]
 *     --seco                   só mostra o que faria (não muda nada)
 *     --sem-masterizar         não roda ferramentas/masterizar-audio.py (copia direto para public/)
 *     --confirmo-autorizacao   obrigatório se alguma GRAVAÇÃO do pacote veio sem a marca "a pessoa autorizou por escrito"
 *
 * O que faz, para cada áudio do pacote (o id diz onde ele entra):
 *   som:<fonema>        → public/audio/sons/<fonema>-humana-<hash>.mp3 e public/audio/sons/mapa.json (estado "aprovado",
 *                         origem "voz humana"); o arquivo como veio fica em audio-fontes/sons/humana/
 *   fala:<voz>|<trecho> → audio-fontes/falas/<voz>-humana-<hash>.mp3 + audio-fontes/falas/manifesto.json, e a
 *                         masterização (ferramentas/masterizar-audio.py) gera o clipe e o manifesto de public/
 *   nome:<voz>|<chave>  → audio-fontes/nomes/<voz>/<chave>-humana-<hash>.mp3 + manifesto, idem
 *   arquivo:<caminho>   → substitui o próprio arquivo (só assets/audio/… ou audio/…, .mp3)
 * Converte para mp3 com o ffmpeg quando o áudio veio em outro formato (wav, webm…). Sem ffmpeg, guarda como veio.
 * Registra tudo em audio-fontes/voz-humana.json, marca os clipes em docs/auditoria-audio.json como "voz humana"
 * (e acrescenta uma seção em docs/auditoria-sons-letras.md para os sons das letras) e refaz o resumo da auditoria
 * da Área do administrador. Os arquivos ganham nome novo: o cache dos aparelhos nunca fica com o áudio antigo.
 */
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { inflateRawSync } from 'node:zlib';
import { abrirPacote, extensaoDoMime, slug, slugDoFonema, type ItemPacote, type Pacote } from '../web/src/servicos/pacote-audios.ts';
import { gerarResumoAuditoria } from './resumo-auditoria-audio.ts';

const RAIZ_PADRAO = resolve(dirname(fileURLToPath(import.meta.url)), '..');

export interface OpcoesImportacao {
  raiz?: string;
  seco?: boolean;
  masterizar?: boolean;
  /** Converter para mp3 com o ffmpeg (desligado nos testes). */
  converter?: boolean;
  confirmoAutorizacao?: boolean;
  agora?: Date;
  log?: (m: string) => void;
}
export interface ResultadoImportacao { aplicados: { id: string; destino: string }[]; avisos: string[]; masterizou: boolean }

const VOGAIS = new Set(['a', 'e', 'E', 'i', 'o', 'O', 'u', 'a~']);
const EXPLOSIVOS = new Set(['p', 'b', 't', 'd', 'k', 'g']);
const IPA: Record<string, string> = { a: '/a/', 'a~': '/ã/', E: '/ɛ/', e: '/e/', i: '/i/', O: '/ɔ/', o: '/o/', u: '/u/', b: '/b/', d: '/d/', f: '/f/', g: '/g/', j: '/ʒ/', k: '/k/', l: '/l/', lh: '/ʎ/', m: '/m/', n: '/n/', nh: '/ɲ/', p: '/p/', r: '/ɾ/', rr: '/ʁ/', s: '/s/', t: '/t/', v: '/v/', x: '/ʃ/', z: '/z/' };
const tipoDoSom = (f: string) => (VOGAIS.has(f) ? 'vogal' : EXPLOSIVOS.has(f) || f === 'r' ? 'explosivo' : 'continuo');

const lerJson = <T>(p: string, padrao: T): T => (existsSync(p) ? (JSON.parse(readFileSync(p, 'utf8')) as T) : padrao);
const temFfmpeg = () => spawnSync('ffmpeg', ['-version'], { stdio: 'ignore' }).status === 0;

/** Grava o áudio no destino (sem extensão), em mp3 quando dá para converter. Devolve o caminho final. */
function gravarAudio(dados: Uint8Array, mime: string, destinoSemExt: string, converter: boolean, seco: boolean): string {
  const ext = extensaoDoMime(mime);
  if (ext === 'mp3' || !converter) {
    const final = `${destinoSemExt}.${ext === 'bin' ? 'mp3' : ext}`;
    if (!seco) { mkdirSync(dirname(final), { recursive: true }); writeFileSync(final, dados); }
    return final;
  }
  const final = `${destinoSemExt}.mp3`;
  if (seco) return final;
  mkdirSync(dirname(final), { recursive: true });
  const tmp = `${destinoSemExt}.entrada.${ext}`;
  writeFileSync(tmp, dados);
  const r = spawnSync('ffmpeg', ['-v', 'error', '-y', '-i', tmp, '-ac', '1', '-ar', '44100', '-c:a', 'libmp3lame', '-b:a', '96k', final]);
  spawnSync('rm', ['-f', tmp]);
  if (r.status !== 0) throw new Error(`ffmpeg não converteu ${destinoSemExt}: ${r.stderr?.toString().slice(0, 300)}`);
  return final;
}

export function importarPacote(zip: Uint8Array, o: OpcoesImportacao = {}): ResultadoImportacao {
  const raiz = o.raiz ?? RAIZ_PADRAO;
  const log = o.log ?? ((m: string) => console.log(m));
  const seco = !!o.seco;
  const converter = o.converter ?? temFfmpeg();
  const agora = (o.agora ?? new Date()).toISOString();
  const { pacote, arquivos } = abrirPacote(zip, (d) => inflateRawSync(d));
  const avisos: string[] = [];
  const semAutorizacao = pacote.itens.filter((i) => i.origem === 'gravacao' && !i.autorizacao);
  if (semAutorizacao.length && !o.confirmoAutorizacao) {
    throw new Error(`${semAutorizacao.length} gravação(ões) sem a marca de autorização por escrito (${semAutorizacao.map((i) => i.id).join(', ')}). ` +
      'Confira a autorização de quem gravou e rode de novo com --confirmo-autorizacao.');
  }
  if (!converter) avisos.push('Sem ffmpeg (ou conversão desligada): áudios que não são mp3 ficam no formato original (wav/webm tocam nos navegadores atuais).');

  const PUB = resolve(raiz, 'web/public');
  const FONTES = resolve(raiz, 'audio-fontes');
  const mapaSonsP = resolve(PUB, 'audio/sons/mapa.json');
  const fontesFalasP = resolve(FONTES, 'falas/manifesto.json');
  const fontesNomesP = resolve(FONTES, 'nomes/manifesto.json');
  const pubFalasP = resolve(PUB, 'audio/falas/manifesto.json');
  const pubNomesP = resolve(PUB, 'audio/nomes/manifesto.json');
  const registroP = resolve(FONTES, 'voz-humana.json');
  const mapaSons = lerJson<{ fonemas: Record<string, Record<string, unknown>>; letras?: Record<string, string[]> }>(mapaSonsP, { fonemas: {} });
  const fontesFalas = lerJson<Record<string, string>>(fontesFalasP, {});
  const fontesNomes = lerJson<Record<string, Record<string, string>>>(fontesNomesP, {});
  const pubFalas = lerJson<Record<string, string>>(pubFalasP, {});
  const pubNomes = lerJson<{ sofia: string[]; tales: string[]; arquivos: Record<string, Record<string, string>> }>(pubNomesP, { sofia: [], tales: [], arquivos: { sofia: {}, tales: {} } });
  const registro = lerJson<Record<string, unknown>>(registroP, {});
  const masterizar = o.masterizar ?? true;
  let precisaMasterizar = false;
  const aplicados: { id: string; destino: string }[] = [];
  // sem masterização, as falas e os nomes vão direto para public/ (e o manifesto público é atualizado aqui)
  const diretoParaPublic = !masterizar;

  for (const it of pacote.itens) {
    const dados = arquivos.get(it.arquivo)!;
    const hash = createHash('sha256').update(dados).digest('hex').slice(0, 8);
    const tipo = it.id.slice(0, it.id.indexOf(':'));
    const resto = it.id.slice(it.id.indexOf(':') + 1);
    let destino = '';
    if (tipo === 'som') {
      const f = resto;
      const base = `${slugDoFonema(f)}-humana-${hash}`;
      if (!seco) { mkdirSync(resolve(FONTES, 'sons/humana'), { recursive: true }); writeFileSync(resolve(FONTES, `sons/humana/${base}.${extensaoDoMime(it.mime)}`), dados); }
      destino = gravarAudio(dados, it.mime, resolve(PUB, 'audio/sons', base), converter, seco);
      const antes = mapaSons.fonemas[f] ?? {};
      mapaSons.fonemas[f] = {
        ...antes, arquivo: destino.slice(resolve(PUB, 'audio/sons').length + 1), estado: 'aprovado', origem: 'voz humana',
        tipo: (antes.tipo as string) ?? tipoDoSom(f), ipa: (antes.ipa as string) ?? IPA[f] ?? `/${f}/`, letras: (antes.letras as string[]) ?? [],
        duracaoMs: it.duracaoMs ?? (antes.duracaoMs as number) ?? 0
      };
    } else if (tipo === 'fala' || tipo === 'nome') {
      const i = resto.indexOf('|');
      const vozId = resto.slice(0, i);
      const chave = resto.slice(i + 1);
      if (vozId !== 'sofia' && vozId !== 'tales') throw new Error(`Voz desconhecida em ${it.id}`);
      if (tipo === 'fala') {
        const base = `${vozId}-humana-${hash}`;
        if (diretoParaPublic) {
          destino = gravarAudio(dados, it.mime, resolve(PUB, 'audio/falas', base), converter, seco);
          pubFalas[resto] = destino.slice(resolve(PUB, 'audio/falas').length + 1);
        } else {
          destino = gravarAudio(dados, it.mime, resolve(FONTES, 'falas', base), converter, seco);
          precisaMasterizar = true;
        }
        fontesFalas[resto] = destino.slice(destino.lastIndexOf('/') + 1);
      } else {
        const base = `${slug(chave)}-humana-${hash}`;
        if (diretoParaPublic) {
          destino = gravarAudio(dados, it.mime, resolve(PUB, 'audio/nomes', vozId, base), converter, seco);
          (pubNomes.arquivos[vozId] ??= {})[chave] = destino.slice(destino.lastIndexOf('/') + 1);
          if (!pubNomes[vozId].includes(chave)) pubNomes[vozId].push(chave);
        } else {
          destino = gravarAudio(dados, it.mime, resolve(FONTES, 'nomes', vozId, base), converter, seco);
          precisaMasterizar = true;
        }
        (fontesNomes[vozId] ??= {})[chave] = destino.slice(destino.lastIndexOf('/') + 1);
      }
    } else if (tipo === 'arquivo') {
      if (!/^(assets\/audio|audio)\/[a-z0-9/_-]+\.mp3$/.test(resto) || resto.includes('..')) throw new Error(`Caminho não permitido: ${resto}`);
      const alvo = resolve(PUB, resto);
      const gravado = gravarAudio(dados, it.mime, alvo.slice(0, -extname(alvo).length), converter, seco);
      if (gravado !== alvo) { avisos.push(`${resto}: sem ffmpeg o arquivo ficou como ${gravado.slice(PUB.length + 1)} e o original continua tocando. Converta para mp3 e rode de novo.`); }
      destino = gravado;
    } else throw new Error(`Tipo de áudio desconhecido: ${it.id}`);
    registro[it.id] = { destino: destino.slice(raiz.length + 1), texto: it.texto, quem: it.quem, autorizacao: !!it.autorizacao, origem: it.origem, sha256: it.sha256, pacote: pacote.criadoEm, importadoEm: agora };
    aplicados.push({ id: it.id, destino: destino.slice(raiz.length + 1) });
    log(`  ${it.id}  →  ${destino.slice(raiz.length + 1)}`);
  }

  let masterizou = false;
  if (!seco) {
    writeFileSync(mapaSonsP, JSON.stringify(mapaSons, null, 1));
    writeFileSync(fontesFalasP, JSON.stringify(fontesFalas, null, 1));
    writeFileSync(fontesNomesP, JSON.stringify(fontesNomes, null, 1));
    if (diretoParaPublic) {
      writeFileSync(pubFalasP, JSON.stringify(pubFalas, null, 1));
      writeFileSync(pubNomesP, JSON.stringify(pubNomes, null, 1));
    }
    mkdirSync(FONTES, { recursive: true });
    writeFileSync(registroP, JSON.stringify(registro, null, 1) + '\n');
    if (precisaMasterizar) {
      const r = spawnSync('python3', ['ferramentas/masterizar-audio.py'], { cwd: raiz, encoding: 'utf8' });
      masterizou = r.status === 0;
      if (!masterizou) avisos.push(`A masterização não rodou (${(r.stderr || r.error?.message || '').toString().slice(0, 200)}). Rode "python3 ferramentas/masterizar-audio.py" antes de publicar, ou importe de novo com --sem-masterizar.`);
      else log(r.stdout.trim().split('\n').slice(-2).join('\n'));
    }
    marcarAuditoria(raiz, pacote, aplicados, agora);
    try { gerarResumoAuditoria(raiz); } catch (e) { avisos.push(`Resumo da auditoria não foi refeito: ${(e as Error).message}`); }
  }
  for (const a of avisos) log(`AVISO: ${a}`);
  return { aplicados, avisos, masterizou };
}

const MARCAR_PY = `
import json, sys
p = sys.argv[1]
lista = json.load(open(p))
for m in json.load(sys.stdin):
    achou = False
    for c in lista:
        if c.get('voz') != m['voz']:
            continue
        if m['tipo'] == 'fala':
            ok = c.get('tipo') == 'fala' and c.get('chave') == m['chave']
        else:
            arq = str(c.get('arquivo', ''))
            ok = c.get('tipo') != 'fala' and ('nomes/' + m['voz'] + '/') in arq and (c.get('chave') == m['chave'] or ('/' + m['chave']) in arq)
        if ok:
            c['voz_humana'] = m['marca']
            achou = True
    if not achou:
        lista.append({'tipo': m['tipo'], 'voz': m['voz'], 'chave': m['chave'], 'arquivo': m['marca'].get('destino'), 'gravidade': 'humana', 'voz_humana': m['marca']})
json.dump(lista, open(p, 'w'), ensure_ascii=False, indent=1)
`;

/** Marca os clipes trocados como "voz humana" na auditoria (docs/auditoria-audio.json e docs/auditoria-sons-letras.md). */
function marcarAuditoria(raiz: string, pacote: Pacote, aplicados: { id: string; destino: string }[], agora: string) {
  const audP = resolve(raiz, 'docs/auditoria-audio.json');
  const destinoDe = new Map(aplicados.map((a) => [a.id, a.destino]));
  const marca = (it: ItemPacote) => ({ em: agora, pacote: pacote.criadoEm, quem: it.quem ?? null, autorizacao: !!it.autorizacao, destino: destinoDe.get(it.id) });
  if (existsSync(audP)) {
    const marcas: { tipo: string; voz: string; chave: string; marca: ReturnType<typeof marca> }[] = [];
    for (const it of pacote.itens) {
      const [tipo, resto] = [it.id.slice(0, it.id.indexOf(':')), it.id.slice(it.id.indexOf(':') + 1)];
      if (tipo !== 'fala' && tipo !== 'nome') continue;
      marcas.push({ tipo, voz: resto.slice(0, resto.indexOf('|')), chave: resto.slice(resto.indexOf('|') + 1), marca: marca(it) });
    }
    // o arquivo é escrito pelo Python (ferramentas/auditar-audio.py): marcado pelo Python para manter o mesmo formato
    if (marcas.length) {
      const r = spawnSync('python3', ['-c', MARCAR_PY, audP], { input: JSON.stringify(marcas), encoding: 'utf8' });
      if (r.status !== 0) throw new Error(`Não deu para marcar a auditoria: ${(r.stderr || r.error?.message || '').toString().slice(0, 200)}`);
    }
  }
  const sons = pacote.itens.filter((i) => i.id.startsWith('som:'));
  const sonsP = resolve(raiz, 'docs/auditoria-sons-letras.md');
  if (sons.length && existsSync(sonsP)) {
    appendFileSync(sonsP, [
      '', `## Voz humana (pacote de ${pacote.criadoEm.slice(0, 10)}, importado em ${agora.slice(0, 10)})`, '',
      'Sons trocados por gravação de pessoa real pela Área do administrador (scripts/importar-pacote-audios.ts). Valem mais que as medidas acima.', '',
      '| Fonema | Arquivo | Quem gravou | Autorização por escrito |', '|---|---|---|---|',
      ...sons.map((s) => `| \`${s.id.slice(4)}\` | ${destinoDe.get(s.id)} | ${s.quem ?? '—'} | ${s.autorizacao ? 'sim' : 'confirmada na importação'} |`), ''
    ].join('\n'));
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const arq = args.find((a) => !a.startsWith('--'));
  if (!arq) { console.error('Uso: npx tsx scripts/importar-pacote-audios.ts pacote.zip [--seco] [--sem-masterizar] [--confirmo-autorizacao]'); process.exit(2); }
  try {
    console.log(`Pacote: ${arq}`);
    const r = importarPacote(new Uint8Array(readFileSync(arq)), { seco: args.includes('--seco'), masterizar: !args.includes('--sem-masterizar'), confirmoAutorizacao: args.includes('--confirmo-autorizacao') });
    console.log(`\n${r.aplicados.length} áudio(s) ${args.includes('--seco') ? 'seriam aplicados (nada mudou: --seco)' : 'aplicados'}.`);
    if (!args.includes('--seco')) console.log('Agora: npm test (confere os manifestos), ouça os áudios no app (npm run dev) e faça o commit de web/public/audio, audio-fontes e docs.');
  } catch (e) {
    console.error(`ERRO: ${(e as Error).message}`);
    process.exit(1);
  }
}

