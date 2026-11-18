/**
 * Aplica um PACOTE DO GERENCIADOR (Área do administrador › Publicar › "Gerar pacote") ao repositório: as edições do
 * conteúdo, as figuras/modelos trocados e os áudios passam a valer para TODOS na próxima versão publicada do site.
 * Passo a passo para o dono: app/docs/como-editar-a-plataforma.md. Também aceita o pacote antigo, só de áudios.
 *
 * Uso (a partir de app/):
 *   npx tsx scripts/importar-pacote.ts caminho/fonema-pacote-AAAAMMDD-HHMM.zip [opções]
 *     --seco                   só confere e mostra o que faria (não muda nada)
 *     --sem-testes             não roda o `npm test` depois (o verificador de decodificabilidade roda sempre)
 *     --sem-masterizar         áudios: não roda ferramentas/masterizar-audio.py
 *     --confirmo-autorizacao   obrigatório se alguma GRAVAÇÃO veio sem a marca "a pessoa autorizou por escrito"
 *
 * O que faz, nesta ordem (e PARA no primeiro problema, sem deixar nada pela metade):
 *  1. confere o pacote (formato, caminhos, tamanhos) e a autorização das gravações;
 *  2. junta as edições do pacote às já publicadas (packages/conteudo/src/edicao/publicadas.json; a mais nova de cada
 *     lugar vale), aplica TUDO no conteúdo e roda o VERIFICADOR DE DECODIFICABILIDADE: edição sem lugar ou palavra
 *     que a criança ainda não lê = erro, nada é gravado;
 *  3. grava publicadas.json e as figuras/modelos em web/public/assets/<caminho> (o arquivo novo entra no lugar do antigo;
 *     o antigo continua no histórico do git);
 *  4. roda `npm test`; se falhar, DESFAZ o passo 3 e sai com erro;
 *  5. aplica os áudios com o importador de áudios (scripts/importar-pacote-audios.ts, que continua valendo sozinho).
 */
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { inflateRawSync } from 'node:zlib';
import { CONTEUDO_EDITAVEL, EDICOES_PUBLICADAS, chaveDaEdicao, explicar, verificarTudo, type ArquivoEdicoes, type Edicao } from '@fonema/conteudo';
import { abrirPacoteGeral, caminhoDeMidiaPermitido, pacoteDeAudios } from '../web/src/servicos/pacote.ts';
import { importarPacote as importarAudios, type OpcoesImportacao } from './importar-pacote-audios.ts';

const RAIZ_PADRAO = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const ARQUIVO_PUBLICADAS = 'packages/conteudo/src/edicao/publicadas.json';

export interface OpcoesPacote extends OpcoesImportacao {
  /** Rodar `npm test` depois de gravar (padrão: sim). */
  testes?: boolean;
  /** Comando de teste (os testes do importador usam um comando de mentira). */
  comandoTeste?: { cmd: string; args: string[] };
}
export interface ResultadoPacote { edicoes: number; midias: string[]; audios: number; avisos: string[] }

/** Junta as edições (a última de cada lugar vale), na ordem em que foram feitas. */
export function juntarEdicoes(antes: Edicao[], novas: Edicao[]): Edicao[] {
  const m = new Map<string, Edicao>();
  for (const e of [...antes, ...novas]) { m.delete(chaveDaEdicao(e)); m.set(chaveDaEdicao(e), e); }
  return [...m.values()];
}

/** Aplica as edições no conteúdo (em memória) e confere: devolve os problemas em linguagem simples. */
export function conferirEdicoes(todas: Edicao[]): string[] {
  const probs: string[] = [];
  try {
    const r = CONTEUDO_EDITAVEL.aplicar(todas);
    for (const s of r.semLugar) probs.push(`Edição sem lugar (${s.edicao.colecao} › ${s.edicao.item}): ${s.motivo}`);
    for (const v of verificarTudo(CONTEUDO_EDITAVEL)) for (const e of v.erros) probs.push(`${v.colecao} › ${v.item}: ${explicar(e).simples}`);
  } finally {
    CONTEUDO_EDITAVEL.aplicar(EDICOES_PUBLICADAS);
  }
  return probs;
}

export function importarPacoteGeral(zip: Uint8Array, o: OpcoesPacote = {}): ResultadoPacote {
  const raiz = o.raiz ?? RAIZ_PADRAO;
  const log = o.log ?? ((m: string) => console.log(m));
  const seco = !!o.seco;
  const { pacote, arquivos, antigo } = abrirPacoteGeral(zip, (d) => inflateRawSync(d));
  const avisos: string[] = [];
  if (antigo) {
    log('Pacote antigo (só áudios): usando o importador de áudios.');
    const r = importarAudios(zip, o);
    return { edicoes: 0, midias: [], audios: r.aplicados.length, avisos: r.avisos };
  }
  // 1. autorização das gravações (antes de mudar qualquer coisa)
  const semAutorizacao = pacote.audios.filter((i) => i.origem === 'gravacao' && !i.autorizacao);
  if (semAutorizacao.length && !o.confirmoAutorizacao) {
    throw new Error(`${semAutorizacao.length} gravação(ões) sem a marca de autorização por escrito (${semAutorizacao.map((i) => i.id).join(', ')}). ` +
      'Confira a autorização de quem gravou e rode de novo com --confirmo-autorizacao.');
  }
  for (const m of pacote.midias) if (!caminhoDeMidiaPermitido(m.caminho)) throw new Error(`Caminho de figura não permitido: ${m.caminho}`);

  // 2. edições: juntar às publicadas e conferir
  const pubP = resolve(raiz, ARQUIVO_PUBLICADAS);
  const pubAntes = existsSync(pubP) ? readFileSync(pubP, 'utf8') : null;
  const arq: ArquivoEdicoes = pubAntes ? JSON.parse(pubAntes) as ArquivoEdicoes : { formato: 'fonema-edicoes', versao: 1, edicoes: [] };
  const todas = juntarEdicoes(arq.edicoes, pacote.edicoes);
  if (pacote.edicoes.length) {
    const probs = conferirEdicoes(todas);
    if (probs.length) throw new Error(`O verificador barrou o pacote (nada foi aplicado):\n  - ${probs.join('\n  - ')}`);
    log(`Verificador de decodificabilidade: ok (${todas.length} edição(ões) publicadas no total).`);
  }
  for (const e of pacote.edicoes) log(`  edição: ${e.colecao} › ${e.item}${e.caminho?.length ? ` › ${e.caminho.join(' › ')}` : ''} (${e.tipo})`);
  for (const m of pacote.midias) log(`  figura: ${m.arquivo}  →  web/public/assets/${m.caminho}`);
  if (seco) {
    log(`(--seco) ${pacote.edicoes.length} edição(ões), ${pacote.midias.length} figura(s)/modelo(s) e ${pacote.audios.length} áudio(s) seriam aplicados.`);
    return { edicoes: pacote.edicoes.length, midias: pacote.midias.map((m) => m.caminho), audios: pacote.audios.length, avisos };
  }

  // 3. gravar (guardando o que havia, para desfazer)
  const desfazer: (() => void)[] = [];
  const gravar = (p: string, dados: Uint8Array | string) => {
    const antes = existsSync(p) ? readFileSync(p) : null;
    desfazer.push(() => { if (antes) writeFileSync(p, antes); else rmSync(p, { force: true }); });
    mkdirSync(dirname(p), { recursive: true });
    writeFileSync(p, dados);
  };
  try {
    if (pacote.edicoes.length) gravar(pubP, JSON.stringify({ ...arq, formato: 'fonema-edicoes', versao: 1, edicoes: todas }, null, 1) + '\n');
    for (const m of pacote.midias) gravar(resolve(raiz, 'web/public/assets', m.caminho), arquivos.get(m.arquivo)!);
    // 4. testes
    if (o.testes ?? true) {
      const c = o.comandoTeste ?? { cmd: 'npm', args: ['test', '--silent'] };
      log(`Rodando os testes (${c.cmd} ${c.args.join(' ')})…`);
      const r = spawnSync(c.cmd, c.args, { cwd: raiz, encoding: 'utf8' });
      if (r.status !== 0) throw new Error(`Os testes falharam; nada foi aplicado.\n${(r.stdout ?? '').split('\n').filter((l) => /FAIL|×|✗|Error/.test(l)).slice(0, 15).join('\n')}`);
      log('Testes: ok.');
    }
  } catch (e) {
    for (const f of desfazer.reverse()) { try { f(); } catch { /* segue desfazendo */ } }
    throw e;
  }
  // 5. áudios
  let audios = 0;
  if (pacote.audios.length) {
    const r = importarAudios(pacoteDeAudios(pacote, arquivos), { ...o, confirmoAutorizacao: true });
    audios = r.aplicados.length;
    avisos.push(...r.avisos);
  }
  return { edicoes: pacote.edicoes.length, midias: pacote.midias.map((m) => m.caminho), audios, avisos };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const arq = args.find((a) => !a.startsWith('--'));
  if (!arq) { console.error('Uso: npx tsx scripts/importar-pacote.ts pacote.zip [--seco] [--sem-testes] [--sem-masterizar] [--confirmo-autorizacao]'); process.exit(2); }
  try {
    console.log(`Pacote: ${arq}`);
    const r = importarPacoteGeral(new Uint8Array(readFileSync(arq)), {
      seco: args.includes('--seco'), testes: !args.includes('--sem-testes'), masterizar: !args.includes('--sem-masterizar'), confirmoAutorizacao: args.includes('--confirmo-autorizacao')
    });
    for (const a of r.avisos) console.log(`AVISO: ${a}`);
    if (!args.includes('--seco')) {
      console.log(`\nAplicado: ${r.edicoes} edição(ões), ${r.midias.length} figura(s)/modelo(s), ${r.audios} áudio(s).`);
      console.log('Agora: confira no app (npm run dev) e faça o commit de packages/conteudo/src/edicao, web/public e audio-fontes.');
    }
  } catch (e) {
    console.error(`ERRO: ${(e as Error).message}`);
    process.exit(1);
  }
}
