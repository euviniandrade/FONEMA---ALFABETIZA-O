// FONEMA · trecho E2E: ÁREA DO ADMINISTRADOR (D032 item 5).
// Confere: cria a senha do administrador (primeiro uso) e entra de novo (senha errada recusada); sobe um áudio de teste
// (gerado aqui) para o som do /m/; a lição da letra M toca o ARQUIVO NOVO (mesmos bytes); grava um som pelo microfone
// (microfone falso do Chromium) no modo "Gravar o alfabeto"; exporta o pacote .zip (pacote.json + áudios); volta ao
// original e a lição do M toca de novo o som publicado; visão geral e escola (planilha CSV com a criança).
// Uso: node e2e/fluxo.e2e.mjs --admin   (também roda dentro do E2E completo e do --sem-jornada)
//      node e2e/fluxo.e2e.mjs --capturas-admin   (idem + capturas 1850×980 e 390×844 em CAPTURAS_ADMIN ou ../docs/capturas)
import { chromium } from '@playwright/test';
import { mkdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/** WAV PCM 16 bits mono com um tom (o "áudio de teste" que entra no lugar do som do /m/). */
function wavDeTeste(seg = 0.7, hz = 330, sr = 22050) {
  const n = Math.round(seg * sr);
  const b = Buffer.alloc(44 + n * 2);
  b.write('RIFF', 0); b.writeUInt32LE(36 + n * 2, 4); b.write('WAVE', 8); b.write('fmt ', 12);
  b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(1, 22); b.writeUInt32LE(sr, 24); b.writeUInt32LE(sr * 2, 28);
  b.writeUInt16LE(2, 32); b.writeUInt16LE(16, 34); b.write('data', 36); b.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) b.writeInt16LE(Math.round(Math.sin((2 * Math.PI * hz * i) / sr) * 12000 * Math.min(1, i / 400, (n - i) / 400)), 44 + i * 2);
  return b;
}

/** Lê os nomes e o conteúdo de um .zip sem compressão (o pacote do FONEMA é "store"). */
function lerZip(buf) {
  let e = buf.length - 22;
  while (e >= 0 && buf.readUInt32LE(e) !== 0x06054b50) e--;
  const n = buf.readUInt16LE(e + 10);
  let p = buf.readUInt32LE(e + 16);
  const out = new Map();
  for (let k = 0; k < n; k++) {
    const tam = buf.readUInt32LE(p + 20), ln = buf.readUInt16LE(p + 28), lx = buf.readUInt16LE(p + 30), lc = buf.readUInt16LE(p + 32), off = buf.readUInt32LE(p + 42);
    const nome = buf.subarray(p + 46, p + 46 + ln).toString('utf8');
    const ini = off + 30 + buf.readUInt16LE(off + 26) + buf.readUInt16LE(off + 28);
    out.set(nome, buf.subarray(ini, ini + tam));
    p += 46 + ln + lx + lc;
  }
  return out;
}

const SENHA = 'bolota-teste-2026';

async function entrarAdmin(pg, BASE, rota = 'admin') {
  await pg.goto(BASE + '#/' + rota);
  await Promise.race([pg.getByTestId('area-admin').waitFor().catch(() => {}), pg.getByTestId('acesso-admin').waitFor().catch(() => {})]);
  if (await pg.getByTestId('acesso-admin').count()) {
    await pg.getByTestId('admin-senha').fill(SENHA);
    await pg.getByTestId('entrar-admin').click();
    await pg.getByTestId('area-admin').waitFor();
  }
}

/** Espera o som de um fonema tocar na lição e devolve o registro { origem, url }. */
async function somTocado(pg, fonema) {
  const h = await pg.waitForFunction((id) => (window.__fonemaAudiosTocados ?? []).find((t) => t.id === id) ?? null, `som:${fonema}`, { timeout: 30000 });
  return h.jsonValue();
}

/**
 * @param {import('@playwright/test').Browser} _browser (o trecho abre o próprio navegador, com microfone falso)
 * @param {{ BASE: string, ok: Function, passarPorteira: Function, cadastrar: Function, montarAvatar: Function, erros: string[], capturas?: string }} h
 */
export async function trechoAdmin(_browser, { BASE, ok, passarPorteira, cadastrar, montarAvatar, erros, capturas }) {
  console.log('A. Área do administrador: senha, trocar o som do /m/, lição do M toca o novo, gravar pelo microfone, pacote, voltar ao original');
  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM ?? '/opt/pw-browsers/chromium',
    args: ['--autoplay-policy=no-user-gesture-required', '--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream']
  });
  const ctx = await browser.newContext({ viewport: { width: 1850, height: 980 }, locale: 'pt-BR', serviceWorkers: 'block', acceptDownloads: true });
  await ctx.grantPermissions(['microphone']);
  await ctx.addInitScript(() => { try { localStorage.setItem('fonema-teste-rapido', '1'); } catch { /* sem armazenamento */ } });
  const pg = await ctx.newPage();
  pg.on('pageerror', (e) => erros.push(String(e)));
  const cap = async (nome) => { if (capturas) await pg.screenshot({ path: resolve(capturas, `admin-${nome}.png`) }); };
  if (capturas) mkdirSync(capturas, { recursive: true });

  // uma criança para a lição do M
  await pg.goto(BASE + '#/adulto/cadastro');
  await passarPorteira(pg);
  await cadastrar(pg, 'Mel', 'f');
  await montarAvatar(pg);
  await pg.waitForFunction(() => location.hash.includes('/c/'));
  const criancaId = /#\/c\/([^/]+)/.exec(pg.url())[1];

  // link discreto nas Configurações → primeiro uso: criar a senha
  await pg.goto(BASE + '#/adulto/config');
  await passarPorteira(pg);
  await pg.getByTestId('ir-admin').click();
  await pg.getByTestId('acesso-admin').waitFor();
  await cap('01-primeiro-uso');
  await pg.getByTestId('admin-nome').fill('Dono');
  await pg.getByTestId('admin-senha').fill('curta');
  await pg.getByTestId('admin-senha2').fill('curta');
  await pg.getByTestId('criar-admin').click();
  ok(/8 caracteres/.test(await pg.getByTestId('acesso-admin').innerText()), 'senha curta é recusada no primeiro uso');
  await pg.getByTestId('admin-senha').fill(SENHA);
  await pg.getByTestId('admin-senha2').fill(SENHA);
  await pg.getByTestId('criar-admin').click();
  await pg.getByTestId('area-admin').waitFor();
  ok(true, 'primeiro uso: a senha do administrador é criada e a área abre');
  const guardado = await pg.evaluate(() => new Promise((res) => {
    const r = indexedDB.open('fonema-admin');
    r.onsuccess = () => { const q = r.result.transaction('chaves').objectStore('chaves').getAll(); q.onsuccess = () => res(JSON.stringify(q.result)); };
  }));
  ok(!guardado.includes(SENHA) && /p2:\d+:[0-9a-f]{64}/.test(guardado), 'a senha não fica guardada: só o hash PBKDF2 com salt');

  // visão geral
  await pg.getByTestId('tabela-criancas').waitFor();
  ok(/Mel/.test(await pg.getByTestId('tabela-criancas').innerText()), 'visão geral: a criança do aparelho aparece com o progresso resumido');
  await pg.waitForFunction(() => /erros/.test(document.querySelector('[data-testid="saude-decod"]')?.textContent ?? ''), null, { timeout: 15000 });
  ok(true, `saúde do conteúdo: ${(await pg.getByTestId('saude-decod').innerText()).split('\n')[1]}`);
  await cap('02-visao-geral');

  // sair e entrar de novo (senha errada recusada)
  await pg.getByTestId('sair-admin').click();
  await pg.goto(BASE + '#/admin');
  await pg.getByTestId('admin-senha').fill('errada-123');
  await pg.getByTestId('entrar-admin').click();
  await pg.getByTestId('admin-erro').waitFor();
  ok(true, 'senha errada: não entra');
  await pg.getByTestId('admin-senha').fill(SENHA);
  await pg.getByTestId('entrar-admin').click();
  await pg.getByTestId('area-admin').waitFor();

  // ÁUDIOS: subir o áudio de teste no lugar do som do /m/ (sem aparar nem igualar: entra byte a byte)
  await pg.goto(BASE + '#/admin/audios');
  await pg.getByTestId('aba-audios').waitFor();
  await pg.getByTestId('quem-grava').fill('Teste E2E');
  await pg.getByTestId('autorizou').check();
  await pg.getByTestId('filtro-tipo').selectOption('som-letra');
  const linhaM = pg.locator('[data-testid="linha-audio"][data-id="som:m"]');
  await linhaM.waitFor();
  ok(/mmm/.test(await linhaM.innerText()) && /Original/.test(await linhaM.innerText()), 'a lista mostra o som do /m/ com o texto ao lado ("mmm") e "Original"');
  await pg.getByTestId('busca-audio').fill('macaco');
  ok(await pg.locator('[data-testid="linha-audio"][data-id="som:m"]').count() === 1, 'busca pelo texto (macaco) acha o som do /m/');
  await pg.getByTestId('busca-audio').fill('');
  await linhaM.getByTestId('subir-audio').click();
  const wav = wavDeTeste();
  await linhaM.getByTestId('arquivo-audio').setInputFiles({ name: 'teste-m.wav', mimeType: 'audio/wav', buffer: wav });
  await linhaM.getByTestId('opc-aparar').uncheck();
  await linhaM.getByTestId('opc-igualar').uncheck();
  await pg.waitForFunction(() => !document.querySelector('[data-testid="salvar-audio"]')?.hasAttribute('disabled'));
  await cap('03-audios-subir');
  await linhaM.getByTestId('salvar-audio').click();
  await pg.waitForFunction(() => /Trocado aqui/.test(document.querySelector('[data-id="som:m"]')?.textContent ?? ''));
  ok(/Teste E2E/.test(await linhaM.innerText()), 'depois de salvar: "Trocado aqui", com quem gravou');

  // a lição da letra M toca o arquivo novo
  await pg.goto(BASE + `#/c/${criancaId}/sessao/AL-M`);
  let t = await somTocado(pg, 'm');
  ok(t.origem === 'substituto' && t.url.startsWith('blob:'), `a lição do M toca o áudio trocado (${t.origem})`);
  const bytes = await pg.evaluate(async (u) => [...new Uint8Array(await (await fetch(u)).arrayBuffer())], t.url);
  ok(bytes.length === wav.length && bytes.every((b, i) => b === wav[i]), `é exatamente o arquivo subido (${bytes.length} bytes iguais)`);

  // GRAVAR O ALFABETO: grava o som do A pelo microfone (falso) e salva
  await pg.goto(BASE + '#/admin/audios');
  await pg.getByTestId('abrir-gravar-alfabeto').click();
  await pg.getByTestId('gravar-alfabeto').waitFor();
  const passo = await pg.getByTestId('gravar-alfabeto').innerText();
  ok(/Faz de conta/.test(passo) && /abelha/.test(passo), 'gravar o alfabeto: letra A com o faz de conta e as palavras-exemplo ao lado');
  const somA = pg.locator('[data-testid="som-alfabeto"][data-id="som:a"]');
  await somA.getByTestId('subir-audio').click();
  await somA.getByTestId('gravar-microfone').click();
  await somA.getByTestId('contagem').waitFor();
  ok(true, 'contagem regressiva antes de gravar');
  await somA.getByTestId('parar-gravacao').waitFor({ timeout: 10000 });
  await cap('04-gravar-alfabeto');
  await pg.waitForTimeout(1500);
  await somA.getByTestId('parar-gravacao').click();
  await pg.waitForFunction(() => !document.querySelector('[data-id="som:a"] [data-testid="salvar-audio"]')?.hasAttribute('disabled'), null, { timeout: 15000 });
  await somA.getByTestId('salvar-audio').click();
  await pg.waitForFunction(() => /Trocado aqui/.test(document.querySelector('[data-id="som:a"]')?.textContent ?? ''));
  ok(/2 de/.test(await pg.getByTestId('progresso-alfabeto').innerText()), 'gravado pelo microfone (aparado e com volume igualado): o progresso do alfabeto conta 2 sons');
  await pg.getByTestId('proxima-letra').click();
  ok(/Letra B/.test(await pg.getByTestId('gravar-alfabeto').innerText()), '"Próxima letra" passa para o B');
  await cap('05-gravar-alfabeto-b');

  // PUBLICAR: pacote .zip
  await pg.goto(BASE + '#/admin/publicar');
  await pg.getByTestId('aba-publicar').waitFor();
  const [baixa] = await Promise.all([pg.waitForEvent('download'), pg.getByTestId('gerar-pacote').click()]);
  ok(/^fonema-pacote-audios-\d{8}-\d{4}\.zip$/.test(baixa.suggestedFilename()), `pacote baixado: ${baixa.suggestedFilename()}`);
  const zip = lerZip(readFileSync(await baixa.path()));
  const pacote = JSON.parse(zip.get('pacote.json').toString('utf8'));
  const itM = pacote.itens.find((i) => i.id === 'som:m');
  ok(pacote.formato === 'fonema-pacote-audios' && pacote.itens.length === 2 && itM?.autorizacao === true && itM.quem === 'Teste E2E', 'pacote.json com os 2 áudios trocados, quem gravou e a autorização');
  ok(Buffer.compare(zip.get(itM.arquivo), wav) === 0 && zip.has('LEIA-ME.txt'), 'o áudio do /m/ vai no zip byte a byte, com o LEIA-ME');
  await cap('06-publicar');

  // VOLTAR AO ORIGINAL
  await pg.goto(BASE + '#/admin/audios');
  await pg.getByTestId('filtro-so').selectOption('trocados');
  for (const id of ['som:m', 'som:a']) {
    const l = pg.locator(`[data-testid="linha-audio"][data-id="${id}"]`);
    await l.getByTestId('voltar-original').click();
    await l.waitFor({ state: 'detached' });
  }
  ok(/^0 de/.test(await pg.getByTestId('contagem-audios').innerText()), 'voltar ao original: nenhum áudio trocado');
  await pg.evaluate(() => { window.__fonemaAudiosTocados = []; });
  await pg.goto(BASE + `#/c/${criancaId}/sessao/AL-M`);
  t = await somTocado(pg, 'm');
  ok(t.origem === 'publicado' && /audio\/sons\/m\.mp3$/.test(t.url), `de volta ao original, a lição do M toca o som publicado (${t.url})`);

  // ESCOLA: dados formais e planilha
  await entrarAdmin(pg, BASE, 'admin/escola');
  await pg.getByTestId('escola-nome').fill('Escola Municipal Teste');
  await pg.getByTestId('salvar-escola').click();
  await pg.getByTestId('nova-turma').click();
  await pg.getByLabel('Turma de Mel').selectOption('Turma 1');
  await pg.waitForTimeout(300);
  const [csv] = await Promise.all([pg.waitForEvent('download'), pg.getByTestId('baixar-csv').click()]);
  const texto = readFileSync(await csv.path(), 'utf8');
  ok(/Escola Municipal Teste;[^\n]*;Turma 1;Mel;/.test(texto), 'escola: planilha CSV com a escola, a turma e a criança');
  await cap('07-escola');

  if (capturas) {
    // celular 390×844
    const cel = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'pt-BR', serviceWorkers: 'block' });
    await cel.addInitScript(() => { try { localStorage.setItem('fonema-teste-rapido', '1'); } catch { /* nada */ } });
    const pc = await cel.newPage();
    pc.on('pageerror', (e) => erros.push(String(e)));
    await pc.goto(BASE + '#/admin');
    await pc.getByTestId('acesso-admin').waitFor();
    await pc.screenshot({ path: resolve(capturas, 'admin-celular-01-primeiro-uso.png') });
    await pc.getByTestId('admin-nome').fill('Dono');
    await pc.getByTestId('admin-senha').fill(SENHA);
    await pc.getByTestId('admin-senha2').fill(SENHA);
    await pc.getByTestId('criar-admin').click();
    await pc.getByTestId('area-admin').waitFor();
    await pc.screenshot({ path: resolve(capturas, 'admin-celular-02-visao.png') });
    for (const [rota, nome] of [['admin/audios', '03-audios'], ['admin/audios/alfabeto', '04-alfabeto'], ['admin/escola', '05-escola'], ['admin/publicar', '06-publicar'], ['admin/site', '07-site']]) {
      await pc.goto(BASE + '#/' + rota);
      await pc.waitForTimeout(700);
      if (nome === '03-audios') { await pc.locator('[data-testid="linha-audio"]').first().getByTestId('subir-audio').click(); }
      await pc.screenshot({ path: resolve(capturas, `admin-celular-${nome}.png`) });
    }
    await cel.close();
    await pg.goto(BASE + '#/admin/site');
    await pg.getByTestId('aba-site').waitFor();
    await cap('08-site');
  }
  await ctx.close();
  await browser.close();
}
