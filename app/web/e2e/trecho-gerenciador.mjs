// FONEMA · trecho E2E: GERENCIADOR DE CONTEÚDO (fila do dono nº 18, Área do administrador).
// Confere: edita a fala de abertura de uma missão (TF-10) e vê o aviso de áudio desatualizado; tenta trocar a palavra de
// uma atividade de leitura por PATO (som do P ainda não ensinado) e vê o BLOQUEIO do verificador; troca por LAMA (válida);
// desliga as cenas antes da leitura e vê, na lição da criança, a fala nova e a palavra LAMA; edita o preço de uma peça da
// Lojinha; troca uma figura (uva) por uma imagem gerada aqui e vê o arquivo novo no lugar; o histórico lista as edições;
// exporta o pacote com tudo (.zip com edições, figura e LEIA-ME); desfaz (palavra) e volta tudo ao original.
// Uso: node e2e/fluxo.e2e.mjs --gerenciador   (também roda dentro do E2E completo e do --sem-jornada)
//      node e2e/fluxo.e2e.mjs --capturas-gerenciador  (idem + capturas 1850×980 e 390×844 em CAPTURAS_GERENCIADOR ou ../docs/capturas)
import { mkdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { deflateSync } from 'node:zlib';

/** PNG RGBA sólido (a "foto" que entra no lugar da figura da uva). */
function pngDeTeste(w = 64, h = 64, rgba = [220, 40, 160, 255]) {
  const crcT = new Uint32Array(256).map((_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
  const crc = (b) => { let c = 0xffffffff; for (const x of b) c = crcT[(c ^ x) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
  const bloco = (tipo, dados) => { const t = Buffer.concat([Buffer.from(tipo), dados]); const L = Buffer.alloc(4); L.writeUInt32BE(dados.length); const C = Buffer.alloc(4); C.writeUInt32BE(crc(t)); return Buffer.concat([L, t, C]); };
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 6;
  const linhas = Buffer.alloc((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) linhas.set(rgba, y * (w * 4 + 1) + 1 + x * 4);
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), bloco('IHDR', ihdr), bloco('IDAT', deflateSync(linhas)), bloco('IEND', Buffer.alloc(0))]);
}

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
const FALA_NOVA = 'Oi, [NOME]! Hoje o som do L vai brincar com a gente!';

async function entrarAdmin(pg, BASE, rota) {
  await pg.goto(BASE + '#/' + rota);
  await Promise.race([pg.getByTestId('area-admin').waitFor().catch(() => {}), pg.getByTestId('acesso-admin').waitFor().catch(() => {})]);
  if (await pg.getByTestId('admin-nome').count()) {
    await pg.getByTestId('admin-nome').fill('Dono');
    await pg.getByTestId('admin-senha').fill(SENHA);
    await pg.getByTestId('admin-senha2').fill(SENHA);
    await pg.getByTestId('criar-admin').click();
  } else if (await pg.getByTestId('acesso-admin').count()) {
    await pg.getByTestId('admin-senha').fill(SENHA);
    await pg.getByTestId('entrar-admin').click();
  }
  await pg.getByTestId('area-admin').waitFor();
}

/**
 * @param {import('@playwright/test').Browser} browser
 * @param {{ BASE: string, ok: Function, passarPorteira: Function, cadastrar: Function, montarAvatar: Function, erros: string[], capturas?: string }} h
 */
export async function trechoGerenciador(browser, { BASE, ok, passarPorteira, cadastrar, montarAvatar, erros, capturas }) {
  console.log('G. Gerenciador: fala da missão, palavra bloqueada × válida, lição com a edição, Lojinha, figura, histórico, pacote, desfazer');
  const ctx = await browser.newContext({ viewport: { width: 1850, height: 980 }, locale: 'pt-BR', serviceWorkers: 'block', acceptDownloads: true });
  await ctx.addInitScript(() => { try { localStorage.setItem('fonema-teste-rapido', '1'); } catch { /* sem armazenamento */ } });
  const pg = await ctx.newPage();
  pg.on('pageerror', (e) => erros.push(String(e)));
  const cap = async (nome) => { if (capturas) { await pg.waitForTimeout(250); await pg.screenshot({ path: resolve(capturas, `gerenciador-${nome}.png`) }); } };
  if (capturas) mkdirSync(capturas, { recursive: true });

  // uma criança que já lê palavras: a TF-10 fica aberta para ela
  await pg.goto(BASE + '#/adulto/cadastro');
  await passarPorteira(pg);
  await cadastrar(pg, 'Teo', 'm', { nivel: 'le-palavras' });
  await montarAvatar(pg);
  await pg.waitForFunction(() => location.hash.includes('/c/'));
  const criancaId = /#\/c\/([^/]+)/.exec(pg.url())[1];

  // MISSÕES: a jornada em ordem e a TF-10
  await entrarAdmin(pg, BASE, 'admin/missoes');
  await pg.getByTestId('aba-missoes').waitFor();
  const nJornada = await pg.getByTestId('fase-jornada').count();
  ok(nJornada > 40, `missões: a jornada inteira em ordem (${nJornada} missões)`);
  await pg.getByTestId('busca-missao').fill('TF-10');
  await pg.locator('[data-testid="fase-jornada"][data-fase="TF-10"]').click();
  await pg.locator('[data-testid="editor-fase"][data-fase="TF-10"]').waitFor();
  await cap('01-missao');

  // 1. fala de abertura: guardar → áudio desatualizado
  const acolhida = pg.getByTestId('campo-acolhida');
  await acolhida.getByTestId('valor').fill(FALA_NOVA);
  await acolhida.getByTestId('salvar-edicao').click();
  await acolhida.getByTestId('audio-desatualizado').waitFor();
  ok(/editado/.test(await acolhida.innerText()) && /Original/.test(await acolhida.innerText()), 'fala da missão editada: aparece "editado", o original ao lado e o aviso de áudio desatualizado (com gravar ou subir ali mesmo)');
  await cap('02-fala-editada');

  // 2. palavra de uma atividade de leitura: PATO bloqueada, LAMA aceita
  const c4a = pg.locator('[data-testid="cena"][data-cena="TF-10-C4a"]');
  await c4a.getByTestId('abrir-cena').click();
  const troca = c4a.locator('[data-testid="trocar-palavra"][data-item="0"]');
  ok((await troca.getByTestId('palavra-atual').innerText()).trim() === 'MALA', 'a cena "Leia e toque na figura" mostra a palavra atual (MALA)');
  await troca.getByTestId('nova-palavra').fill('pato');
  await troca.getByTestId('bloqueio-decod').waitFor();
  const motivo = await troca.getByTestId('bloqueio-decod').innerText();
  ok(/TF-16/.test(motivo) && await troca.getByTestId('salvar-palavra').isDisabled(), `palavra inválida BLOQUEADA, com o motivo em linguagem simples: "${motivo.split('\n').find((l) => /TF-16/.test(l))?.trim()}"`);
  await cap('03-bloqueio');
  await troca.getByTestId('nova-palavra').fill('lulu');
  await troca.getByTestId('sem-figura').waitFor();
  ok(await troca.getByTestId('salvar-palavra').isDisabled(), 'palavra sem figura também não entra num item de "leia e toque na figura"');
  await troca.getByTestId('nova-palavra').fill('lama');
  await troca.getByTestId('verificador-ok').waitFor();
  await troca.getByTestId('salvar-palavra').click();
  await troca.getByTestId('palavra-trocada').waitFor();
  ok((await troca.getByTestId('palavra-atual').innerText()).trim() === 'LAMA', 'palavra válida (LAMA, só sons já ensinados na TF-10) aceita e trocada');
  await cap('04-palavra-trocada');

  // 2b. palavra nova SEM figura e SEM pronúncia: sobe a figura na hora e responde às perguntas de pronúncia
  const troca1 = c4a.locator('[data-testid="trocar-palavra"][data-item="1"]');
  await troca1.getByTestId('nova-palavra').fill('lulu');
  await troca1.getByTestId('sem-figura').waitFor();
  await troca1.getByTestId('trocar-imagem').getByTestId('arquivo-imagem').setInputFiles({ name: 'lulu.png', mimeType: 'image/png', buffer: pngDeTeste(80, 80, [40, 160, 220, 255]) });
  await troca1.getByTestId('previa-imagem').waitFor();
  await troca1.getByTestId('salvar-imagem').click();
  await troca1.getByTestId('assistente-pronuncia').waitFor();
  ok(/l u l u/.test(await troca1.getByTestId('anotacao').inputValue()), 'figura nova subida na hora para "lulu"; palavra nova pede a pronúncia (assistente: "l u l u")');
  await troca1.getByTestId('salvar-pronuncia').click();
  await troca1.getByTestId('verificador-ok').waitFor();
  await troca1.getByTestId('salvar-palavra').click();
  await troca1.getByTestId('palavra-trocada').waitFor();
  ok((await troca1.getByTestId('palavra-atual').innerText()).trim() === 'LULU', 'palavra nova (LULU) com figura nova e pronúncia anotada entra no item de leitura');

  // 2c. frase (sons de cada palavra): som não ensinado bloqueado; frase válida trocada
  const c5f = pg.locator('[data-testid="cena"][data-cena="TF-10-C5f"]');
  await c5f.getByTestId('abrir-cena').click();
  const fr = c5f.locator('[data-testid="trocar-item"][data-tipo="frase"]');
  await fr.getByTestId('campo-frase').fill('A mula viu o pato.');
  await fr.getByTestId('bloqueio-decod').waitFor();
  ok(await fr.getByTestId('salvar-item').isDisabled(), 'frase: "A mula viu o pato." bloqueada (P e T ainda não ensinados)');
  await fr.getByTestId('campo-frase').fill('A mula viu a lua.');
  await fr.getByTestId('verificador-ok').waitFor();
  await fr.getByTestId('salvar-item').click();
  await fr.getByTestId('item-trocado').waitFor();
  ok(true, 'frase trocada para "A mula viu a lua." (sons de cada palavra tirados do banco)');

  // 2d. juntar os sons: palavra e opções novas
  const c3s = pg.locator('[data-testid="cena"][data-cena="TF-10-C3s"]');
  await c3s.getByTestId('abrir-cena').click();
  const si = c3s.locator('[data-testid="trocar-item"][data-tipo="sintese"][data-item="0"]');
  await si.getByTestId('campo-outras').fill('mala');
  await si.getByTestId('erro-item').waitFor();
  ok(/pelo menos 2/.test(await si.getByTestId('erro-item').innerText()), 'juntar os sons: com só 2 opções não deixa (o chute acertaria metade)');
  await si.getByTestId('campo-palavra').fill('lama');
  await si.getByTestId('campo-outras').fill('mala, mula');
  await si.getByTestId('verificador-ok').waitFor();
  await si.getByTestId('salvar-item').click();
  await si.getByTestId('item-trocado').waitFor();
  ok(true, 'juntar os sons: LAMA com as opções mala e mula');

  // 2e. fala compartilhada: mudar em todos os lugares
  const enun = c4a.locator('[data-caminho="fases|TF-10|cenas/@TF-10-C4a/atividade/enunciado/texto"]');
  await enun.getByTestId('valor').fill('Leia a palavra e toque na figura certa.');
  await enun.getByTestId('fala-compartilhada').waitFor();
  const quantos = Number(/mais (\d+) lugar/.exec(await enun.getByTestId('fala-compartilhada').innerText())[1]);
  await enun.getByTestId('em-todos').check();
  await enun.getByTestId('salvar-edicao').click();
  await enun.locator('.adm-etq.verde', { hasText: 'mais' }).waitFor({ timeout: 30000 });
  await pg.goto(BASE + '#/admin/textos');
  await pg.getByTestId('busca-texto').fill('toque na figura certa');
  await pg.waitForFunction(() => /^\d+ encontrados/.test(document.querySelector('[data-testid="contagem-textos"]')?.textContent ?? ''));
  const nIguais = Number(/^(\d+)/.exec(await pg.getByTestId('contagem-textos').innerText())[1]);
  ok(quantos > 1 && nIguais === quantos + 1, `fala compartilhada: "em todos" mudou a mesma fala aqui e em mais ${quantos} lugares (${nIguais} na busca)`);
  await pg.goto(BASE + '#/admin/missoes/TF-10');
  await pg.locator('[data-testid="editor-fase"][data-fase="TF-10"]').waitFor();

  // 3. desliga as cenas antes da leitura (a lição começa nela) e confere a ordem guardada
  for (const id of ['TF-10-C1', 'TF-10-C2', 'TF-10-C3a', 'TF-10-C3s']) {
    const c = pg.locator(`[data-testid="cena"][data-cena="${id}"]`);
    await c.getByTestId('ligar-cena').click();
    await pg.locator(`[data-testid="cena"][data-cena="${id}"].desligada`).waitFor();
  }
  ok(await pg.locator('[data-testid="cena"].desligada').count() === 4, 'cenas desligadas continuam na lista (apagadas, não: dá para religar)');

  // 4. a lição da criança mostra a fala nova e a palavra LAMA
  await pg.goto(BASE + `#/c/${criancaId}/sessao/TF-10`);
  await pg.getByTestId('comecar-sessao').waitFor({ timeout: 20000 });
  await pg.waitForFunction(() => /Hoje o som do L vai brincar com a gente/.test(document.body.innerText), null, { timeout: 15000 });
  ok(/Oi, Teo!/.test(await pg.locator('body').innerText()), 'na lição, a fala de abertura é a editada (com o nome da criança)');
  await cap('05-licao-fala');
  await pg.getByTestId('comecar-sessao').click();
  await pg.locator('[data-cena="TF-10-C4a"]').waitFor({ timeout: 20000 });
  await pg.waitForFunction(() => /\bLAMA\b/.test(document.body.innerText), null, { timeout: 20000 });
  ok(true, 'na lição, as cenas desligadas não aparecem e a atividade de leitura mostra LAMA');
  await cap('06-licao-palavra');

  // 5. Lojinha: preço
  await entrarAdmin(pg, BASE, 'admin/personagens');
  await pg.locator('[data-parte="lojinha"]').click();
  const caderno = pg.locator('[data-item-loja="caderno"]').getByTestId('campo-preco');
  await caderno.getByTestId('valor').fill('9');
  await caderno.getByTestId('salvar-edicao').click();
  await caderno.locator('.adm-etq.ipe').waitFor();
  ok(true, 'Lojinha: preço do caderno mudado para 9 moedinhas');
  await cap('07-lojinha');

  // 5b. nome do personagem dentro das falas (buscar e substituir com pré-visualização)
  await pg.locator('[data-parte="personagens"]').click();
  const bol = pg.locator('[data-personagem="bolota"]');
  await bol.getByTestId('abrir-trocar-nome').click();
  await bol.getByTestId('nome-para').fill('Bolinha');
  await bol.getByTestId('contagem-nome').waitFor();
  const nNome = Number(/^(\d+)/.exec(await bol.getByTestId('contagem-nome').innerText())[1]);
  ok(nNome > 3 && /Bolinha/.test(await bol.getByTestId('trocar-nome').innerText()), `nome nas falas: ${nNome} textos com "Bolota", com o antes → depois`);
  await bol.getByTestId('aplicar-nome').click();
  await bol.getByTestId('nome-trocado').waitFor({ timeout: 60000 });
  ok(/mudado/.test(await bol.getByTestId('nome-trocado').innerText()), `nome trocado nas falas: ${(await bol.getByTestId('nome-trocado').innerText()).split('.')[0]}`);
  await pg.locator('[data-parte="lojinha"]').click();

  // 6. texto para ler sozinho: frase com som não ensinado é bloqueada
  await pg.goto(BASE + '#/admin/leitura');
  const frase = pg.locator('[data-texto="ema-suja"]').getByTestId('campo-frase').first();
  await frase.getByTestId('valor').fill('A ema viu o rato.');
  await frase.getByTestId('bloqueio-decod').waitFor();
  ok(await frase.getByTestId('salvar-edicao').isDisabled(), 'texto para ler sozinho: "A ema viu o rato." bloqueado (R ainda não ensinado na TF-15)');
  await frase.getByTestId('valor').fill('A ema viu a lama.');

  // 7. figura: troca a uva por uma imagem nova (recortada no navegador, em webp)
  await pg.goto(BASE + '#/admin/imagens');
  await pg.getByTestId('busca-imagem').fill('uva');
  await pg.locator('[data-testid="miniatura"][data-caminho="figuras/uva.webp"]').click();
  const ti = pg.locator('[data-testid="trocar-imagem"][data-caminho="figuras/uva.webp"]');
  await ti.getByTestId('arquivo-imagem').setInputFiles({ name: 'uva-nova.png', mimeType: 'image/png', buffer: pngDeTeste() });
  await ti.getByTestId('previa-imagem').waitFor();
  await cap('08-figura');
  await ti.getByTestId('salvar-imagem').click();
  await pg.locator('[data-testid="miniatura"][data-caminho="figuras/uva.webp"].trocada').waitFor();
  const src = await pg.locator('[data-testid="miniatura"][data-caminho="figuras/uva.webp"] img').getAttribute('src');
  const tipo = await pg.evaluate(async (u) => (await (await fetch(u)).blob()).type, src);
  ok(src.startsWith('blob:') && tipo === 'image/webp', `figura trocada: a uva agora vem do arquivo novo (${tipo}, recortado no navegador)`);

  // 8. histórico
  await pg.goto(BASE + '#/admin/historico');
  await pg.getByTestId('lista-historico').waitFor();
  const nHist = await pg.getByTestId('edicao').count();
  ok(nHist >= 8 && await pg.getByTestId('midia-trocada').count() === 2, `histórico: ${nHist} edições e 2 figuras, com desfazer e voltar ao original`);
  await cap('09-historico');

  // 9. pacote com tudo
  await pg.goto(BASE + '#/admin/publicar');
  const [baixa] = await Promise.all([pg.waitForEvent('download'), pg.getByTestId('gerar-pacote-tudo').click()]);
  ok(/^fonema-pacote-\d{8}-\d{4}\.zip$/.test(baixa.suggestedFilename()), `pacote baixado: ${baixa.suggestedFilename()}`);
  const zip = lerZip(readFileSync(await baixa.path()));
  const pacote = JSON.parse(zip.get('pacote.json').toString('utf8'));
  const temPalavra = pacote.edicoes.some((e) => e.item === 'TF-10' && JSON.stringify(e.valor).includes('LAMA'));
  const midia = pacote.midias.find((m) => m.caminho === 'figuras/uva.webp');
  ok(pacote.formato === 'fonema-pacote' && temPalavra && pacote.edicoes.some((e) => e.colecao === 'lojinha') && midia && zip.get(midia.arquivo)?.length === midia.bytes && zip.has('LEIA-ME.txt'),
    `pacote.json com ${pacote.edicoes.length} edições (fala, palavra, cenas, Lojinha) e a figura nova; sem o histórico do aparelho: ${!pacote.edicoes.some((e) => 'anteriores' in e)}`);
  await cap('10-publicar');

  // 10. desfazer (palavra) e voltar tudo ao original
  await pg.goto(BASE + '#/admin/missoes/TF-10');
  const c4a2 = pg.locator('[data-testid="cena"][data-cena="TF-10-C4a"]');
  await pg.locator('[data-testid="cena"][data-cena="TF-10-C1"]').getByTestId('ligar-cena').click();
  await pg.locator('[data-testid="cena"][data-cena="TF-10-C1"]:not(.desligada)').waitFor();
  await c4a2.getByTestId('abrir-cena').click();
  await c4a2.locator('[data-item="0"]').getByTestId('original-palavra').click();
  await c4a2.locator('[data-item="0"] [data-testid="palavra-atual"]', { hasText: 'MALA' }).waitFor();
  ok(true, 'voltar ao original: a palavra volta a ser MALA; religar uma cena funciona');
  await pg.getByTestId('voltar-fase').click();
  await pg.waitForFunction(() => document.querySelectorAll('[data-testid="cena"].desligada').length === 0);
  await pg.goto(BASE + '#/admin/historico');
  pg.once('dialog', (d) => d.accept());
  await pg.getByTestId('voltar-tudo').click();
  await pg.waitForFunction(() => !document.querySelector('[data-testid="edicao"], [data-testid="midia-trocada"]'));
  ok(true, 'histórico vazio: tudo de volta ao original (edições e figura)');
  await pg.goto(BASE + `#/c/${criancaId}/sessao/TF-10`);
  await pg.getByTestId('comecar-sessao').waitFor({ timeout: 20000 });
  ok(!/Hoje o som do L vai brincar/.test(await pg.locator('body').innerText()), 'a lição volta a ter a fala original');

  if (capturas) {
    const cel = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'pt-BR', serviceWorkers: 'block' });
    await cel.addInitScript(() => { try { localStorage.setItem('fonema-teste-rapido', '1'); } catch { /* nada */ } });
    const pc = await cel.newPage();
    pc.on('pageerror', (e) => erros.push(String(e)));
    await entrarAdmin(pc, BASE, 'admin/missoes/TF-10');
    await pc.locator('[data-testid="cena"][data-cena="TF-10-C4a"]').getByTestId('abrir-cena').click();
    await pc.locator('[data-testid="cena"][data-cena="TF-10-C4a"] [data-item="0"]').getByTestId('nova-palavra').fill('pato');
    await pc.getByTestId('bloqueio-decod').first().waitFor();
    await pc.locator('[data-testid="cena"][data-cena="TF-10-C4a"]').scrollIntoViewIfNeeded();
    await pc.screenshot({ path: resolve(capturas, 'gerenciador-celular-01-missao.png') });
    for (const [rota, nome] of [['admin/textos', '02-textos'], ['admin/imagens', '03-imagens'], ['admin/personagens', '04-personagens'], ['admin/leitura', '05-leitura'], ['admin/site', '06-site'], ['admin/foto3d', '07-foto3d']]) {
      await pc.goto(BASE + '#/' + rota);
      await pc.waitForTimeout(800);
      await pc.screenshot({ path: resolve(capturas, `gerenciador-celular-${nome}.png`) });
    }
    await cel.close();
    for (const [rota, nome] of [['admin/textos', '11-textos'], ['admin/site', '12-site'], ['admin/foto3d', '13-foto3d']]) { await pg.goto(BASE + '#/' + rota); await pg.waitForTimeout(600); await cap(nome); }
  }
  await ctx.close();
}
