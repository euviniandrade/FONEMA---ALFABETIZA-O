// FONEMA · trecho E2E: ESTÚDIO CRIATIVO do administrador (fila do dono nº 32 e 33).
// Confere: as 4 partes (Jogos, Personagens, Vozes, Robô de voz) e as abas antigas continuam; Jogos: palavra com vogal
// nasalizada (CAMA) e palavra sem pronúncia são BLOQUEADAS pelo verificador, lista válida é guardada, jogo desligado some
// do Parque da criança (e o endereço direto avisa), nome e ordem mudam no cartão; Personagens: prévia do elenco;
// Vozes: falas por personagem; Robô de voz com a API do ElevenLabs FALSA (page.route; nenhuma chamada de verdade, nenhum
// crédito gasto): nada é chamado antes da chave e do consentimento, a chave aparece mascarada, a conversão manda o
// cabeçalho e os campos certos UMA vez, erros de créditos/chave/rede aparecem em linguagem simples, o resultado é salvo
// numa fala e vai ao pacote como "robo" — sem a chave dentro.
// Uso: node e2e/fluxo.e2e.mjs --estudio   (--capturas-estudio: capturas v18-estudio-* em PC 1440×900 e tablet 820×1180)
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const SENHA = 'bolota-teste-2026';
const CHAVE = 'sk_e2e_falsa_0000_ABCD1234';
const VOZES = { voices: [{ voice_id: 'v-narr', name: 'Narrador calmo', category: 'premade' }, { voice_id: 'v-sofia', name: 'Sofia — FONEMA', category: 'generated' }, { voice_id: 'v-bolota', name: 'Bolota cômico', category: 'generated', labels: { estilo: 'funny' } }] };

/** WAV curtinho (silêncio, 0,2 s) para subir como "minha fala" e para devolver como resultado falso. */
function wav(ms = 200) {
  const n = Math.round(16000 * ms / 1000);
  const b = Buffer.alloc(44 + n * 2);
  b.write('RIFF', 0); b.writeUInt32LE(36 + n * 2, 4); b.write('WAVE', 8); b.write('fmt ', 12); b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(1, 22);
  b.writeUInt32LE(16000, 24); b.writeUInt32LE(32000, 28); b.writeUInt16LE(2, 32); b.writeUInt16LE(16, 34); b.write('data', 36); b.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) b.writeInt16LE(Math.round(Math.sin(i / 8) * 3000), 44 + i * 2);
  return b;
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
 * API do ElevenLabs falsa. `modo.resposta` escolhe o que a conversão devolve ('ok' | 'quota' | 'chave' | 'rede').
 * Qualquer outro endereço do ElevenLabs é ABORTADO (nunca sai nada para a API de verdade).
 */
async function apiFalsa(ctx) {
  const reg = { voices: 0, sub: 0, sts: [], outros: [] };
  const modo = { resposta: 'ok' };
  await ctx.route('https://api.elevenlabs.io/**', async (route) => {
    const req = route.request();
    const u = new URL(req.url());
    const chave = req.headers()['xi-api-key'];
    if (req.method() === 'GET' && u.pathname === '/v1/voices') { reg.voices++; return route.fulfill({ status: chave === CHAVE ? 200 : 401, contentType: 'application/json', body: JSON.stringify(chave === CHAVE ? VOZES : { detail: { status: 'invalid_api_key' } }) }); }
    if (req.method() === 'GET' && u.pathname === '/v1/user/subscription') { reg.sub++; return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ character_count: 1200, character_limit: 30000 }) }); }
    if (req.method() === 'POST' && u.pathname.startsWith('/v1/speech-to-speech/')) {
      const corpo = req.postDataBuffer()?.toString('latin1') ?? '';
      reg.sts.push({ caminho: u.pathname, busca: u.search, chave, temAudio: /name="audio"/.test(corpo), modelo: /name="model_id"\r\n\r\n([^\r]+)/.exec(corpo)?.[1], campos: [...corpo.matchAll(/name="([^"]+)"/g)].map((m) => m[1]) });
      if (modo.resposta === 'rede') return route.abort('internetdisconnected');
      if (modo.resposta === 'quota') return route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ detail: { status: 'quota_exceeded', message: 'This request exceeds your quota of 10000.' } }) });
      if (modo.resposta === 'chave') return route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ detail: { status: 'invalid_api_key', message: 'Invalid API key' } }) });
      return route.fulfill({ status: 200, contentType: 'audio/mpeg', body: wav(300) });
    }
    reg.outros.push(`${req.method()} ${u.pathname}`);
    return route.abort();
  });
  return { reg, modo };
}

/**
 * @param {import('@playwright/test').Browser} browser
 * @param {{ BASE: string, ok: Function, passarPorteira: Function, cadastrar: Function, montarAvatar: Function, erros: string[] }} h
 */
export async function trechoEstudio(browser, { BASE, ok, passarPorteira, cadastrar, montarAvatar, erros }) {
  console.log('E. Estúdio criativo: jogos (verificador, ligar, nome, ordem), personagens, vozes, robô de voz com API falsa');
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'pt-BR', serviceWorkers: 'block', acceptDownloads: true });
  await ctx.addInitScript(() => { try { localStorage.setItem('fonema-teste-rapido', '1'); } catch { /* sem armazenamento */ } });
  const { reg, modo } = await apiFalsa(ctx);
  const pg = await ctx.newPage();
  pg.on('pageerror', (e) => erros.push(String(e)));
  try {
    // uma criança deste aparelho (para ver o Parque como ela)
    await pg.goto(BASE + '#/adulto/cadastro');
    await passarPorteira(pg);
    await cadastrar(pg, 'Lia', 'f', { nivel: 'le-palavras' });
    await montarAvatar(pg);
    await pg.waitForFunction(() => location.hash.includes('/c/'));
    const criancaId = /#\/c\/([^/]+)/.exec(pg.url())[1];

    await entrarAdmin(pg, BASE, 'admin/estudio');
    await pg.getByTestId('aba-estudio').waitFor();
    ok(await pg.locator('.est-parte').count() === 4, 'Estúdio criativo com 4 partes: Jogos, Personagens, Vozes, Robô de voz');
    for (const a of ['visao', 'textos', 'missoes', 'personagens', 'audios', 'foto3d', 'publicar', 'historico']) ok(await pg.locator(`[data-aba="${a}"]`).count() === 1, `a aba antiga "${a}" continua`);

    // ---------------- JOGOS ----------------
    await pg.getByTestId('estudio-jogos').waitFor();
    ok(await pg.getByTestId('linha-jogo').count() === 13, '13 jogos listados (7 do Parque + 6 de escutar), cada um com prévia do cartão');
    const casa = pg.locator('[data-jogo="casa-som"]');
    await casa.getByTestId('palavras-jogo').waitFor();
    ok(await casa.getByTestId('chip-palavra').count() === 16, 'Casa do Som: as 16 palavras da lista, com figura e lição');
    ok(/a partir da TF-/.test(await casa.locator('[data-palavra="pato"]').innerText()), 'cada palavra mostra a lição em que passa a valer (PATO)');
    await casa.getByTestId('nova-palavra').fill('cama');
    await casa.getByTestId('acrescentar-palavra').click();
    await casa.getByTestId('bloqueio-decod').waitFor();
    ok(/muda quando a gente fala/i.test(await casa.getByTestId('bloqueio-decod').innerText()), 'CAMA bloqueada pelo verificador (vogal nasalizada), com o motivo em linguagem simples');
    ok(await casa.getByTestId('guardar-palavras').isDisabled(), 'com palavra bloqueada, "Guardar a lista" fica desligado');
    await casa.locator('[data-palavra="cama"]').getByTestId('tirar-palavra').click();
    await casa.getByTestId('nova-palavra').fill('zabumbex');
    await casa.getByTestId('acrescentar-palavra').click();
    await casa.getByTestId('assistente-pronuncia').waitFor();
    ok(true, 'palavra sem pronúncia anotada: bloqueada e abre o assistente de pronúncia');
    await casa.locator('[data-palavra="zabumbex"]').getByTestId('tirar-palavra').click();
    await casa.locator('[data-palavra="tomate"]').getByTestId('tirar-palavra').click();
    await casa.getByTestId('verificador-ok').waitFor();
    await casa.getByTestId('guardar-palavras').click();
    await casa.getByTestId('msg-palavras').waitFor();
    ok(await casa.getByTestId('chip-palavra').count() === 15, 'lista válida (sem TOMATE) guardada neste aparelho');

    // ligar/desligar, nome e ordem
    const rimas = pg.locator('[data-jogo="rimas"]');
    await rimas.getByTestId('editar-jogo').click();
    await rimas.getByTestId('campo-ligado').getByTestId('valor').click();
    await rimas.locator('[data-testid="estado-jogo"]', { hasText: 'Desligado' }).waitFor();
    ok(true, '"Achar a rima" desligado');
    const carteiro = pg.locator('[data-jogo="carteiro"]');
    await carteiro.getByTestId('editar-jogo').click();
    await carteiro.getByTestId('campo-nome-jogo').getByTestId('valor').fill('Correio da Vila');
    await carteiro.getByTestId('campo-nome-jogo').getByTestId('salvar-edicao').click();
    await carteiro.locator('[data-testid="previa-jogo"]', { hasText: 'Correio da Vila' }).waitFor();
    ok(true, 'nome do Carteiro mudado: a prévia do cartão acompanha');
    await pg.locator('[data-jogo="corre-som"]').getByTestId('descer-jogo').click();
    await pg.getByTestId('msg-ordem').waitFor();
    const ordem = await pg.locator('.est-grupo-jogos').first().locator('[data-testid="linha-jogo"]').evaluateAll((xs) => xs.map((x) => x.getAttribute('data-jogo')));
    ok(ordem[0] === 'come-som' && ordem[1] === 'corre-som', `ordem trocada no estúdio (${ordem.slice(0, 2).join(', ')})`);

    // a criança vê
    await pg.goto(BASE + `#/c/${criancaId}/brincar`);
    await pg.getByTestId('brincar').waitFor();
    ok(await pg.getByTestId('jogo-rimas').count() === 0, 'no Parque da criança, o jogo desligado não aparece');
    ok(/Correio da Vila/.test(await pg.getByTestId('jogo-carteiro').innerText()), 'o cartão da criança mostra o nome novo');
    const cartoes = await pg.locator('.brincar-jogos-grade .brincar-jogo-cartao').evaluateAll((xs) => xs.map((x) => x.getAttribute('data-testid')));
    ok(cartoes.indexOf('jogo-come-som') < cartoes.indexOf('jogo-corre-som'), 'e na ordem escolhida (Come-Som antes do Corre-Som)');
    await pg.goto(BASE + `#/c/${criancaId}/brincar/rimas`);
    await pg.getByTestId('jogo-desligado').waitFor();
    ok(true, 'endereço direto do jogo desligado: "Este jogo está descansando"');

    // ---------------- PERSONAGENS ----------------
    await pg.goto(BASE + '#/admin/estudio/personagens');
    await pg.getByTestId('estudio-personagens').waitFor();
    ok(await pg.getByTestId('previa-personagem').count() >= 8, 'prévia do elenco (8 personagens)');
    ok(await pg.getByTestId('estudio-personagens').getByTestId('aba-personagens').count() === 1, 'o editor de personagens (nome, cor, apresentação, figuras) está dentro do estúdio');

    // ---------------- VOZES ----------------
    await pg.goto(BASE + '#/admin/estudio/vozes');
    await pg.getByTestId('estudio-vozes').waitFor();
    await pg.locator('[data-quem="tales"]').click();
    await pg.getByTestId('linha-audio').first().waitFor({ timeout: 20000 });
    ok(/de \d+ áudios/.test(await pg.getByTestId('contagem-audios').innerText()), 'vozes do Tales: lista com ouvir / subir / voltar ao original');

    // ---------------- ROBÔ DE VOZ (API falsa) ----------------
    await pg.goto(BASE + '#/admin/estudio/robo');
    await pg.getByTestId('robo-voz').waitFor();
    ok(/não faz voz de criança de verdade/i.test(await pg.getByTestId('aviso-crianca').innerText()), 'aviso claro: voz de criança só como personagem feito por adulto (D011)');
    ok(await pg.getByTestId('robo-converter').isDisabled() && /chave/i.test(await pg.getByTestId('robo-falta').innerText()), 'sem chave: "Transformar" desligado e diz o que falta');
    ok(reg.voices + reg.sts.length === 0, 'nenhuma chamada ao ElevenLabs antes da chave');
    await pg.getByTestId('campo-chave').fill(CHAVE);
    await pg.getByTestId('guardar-chave').click();
    const masc = await pg.getByTestId('chave-mascarada').innerText();
    ok(masc.includes('1234') && !masc.includes('sk_e2e'), `chave mascarada na tela (${masc.trim()})`);
    await pg.getByTestId('carregar-vozes').click();
    await pg.getByTestId('total-vozes').waitFor();
    ok(reg.voices === 1 && await pg.getByTestId('preset-infantil').inputValue() === 'v-sofia', 'vozes da biblioteca carregadas; "Personagem infantil" sugerido pela voz da Sofia');
    await pg.getByTestId('preset-comica').selectOption('v-bolota');
    await pg.getByTestId('robo-arquivo').setInputFiles({ name: 'minha-fala.wav', mimeType: 'audio/wav', buffer: wav() });
    await pg.getByTestId('robo-original').waitFor();
    ok(await pg.getByTestId('robo-converter').isDisabled() && /autoriza/i.test(await pg.getByTestId('robo-falta').innerText()), 'sem a confirmação de que a voz é sua (ou autorizada), não converte');
    ok(reg.sts.length === 0, 'nenhuma conversão antes do consentimento');
    await pg.getByTestId('consentimento').check();
    await pg.getByTestId('destino-comica').click();
    await pg.getByTestId('robo-converter').click();
    await pg.getByTestId('robo-resultado').first().waitFor();
    const c = reg.sts[0];
    ok(reg.sts.length === 1 && c.caminho === '/v1/speech-to-speech/v-bolota' && c.chave === CHAVE && c.temAudio && c.modelo === 'eleven_multilingual_sts_v2' && /output_format=mp3/.test(c.busca),
      'conversão: UMA chamada, POST speech-to-speech da voz escolhida, cabeçalho xi-api-key, campo audio e model_id multilíngue');
    ok(!c.campos.some((x) => /pitch|speed|velocidade|tom/i.test(x)), 'nenhum campo de tom ou velocidade (quem muda a voz é o modelo)');
    ok(/Bolota cômico/.test(await pg.getByTestId('robo-resultado').first().innerText()), 'resultado com ouvir, comparar, baixar e salvar');
    const [baixado] = await Promise.all([pg.waitForEvent('download'), pg.getByTestId('robo-baixar').first().click()]);
    ok(/fonema-robo-voz-bolota/.test(baixado.suggestedFilename()), `baixar o áudio transformado (${baixado.suggestedFilename()})`);

    for (const [resposta, re, rotulo] of [['quota', /créditos/i, 'sem créditos'], ['chave', /não aceitou a chave/i, 'chave recusada'], ['rede', /Sem conexão/i, 'sem internet']]) {
      modo.resposta = resposta;
      const antes = reg.sts.length;
      await pg.getByTestId('robo-converter').click();
      await pg.getByTestId('robo-erro').waitFor();
      const t = await pg.getByTestId('robo-erro').innerText();
      ok(re.test(t) && !t.includes(CHAVE) && reg.sts.length === antes + 1, `erro "${rotulo}" em linguagem simples, sem a chave e sem repetir sozinho`);
    }
    modo.resposta = 'ok';

    await pg.getByTestId('robo-salvar-fala').first().click();
    await pg.getByTestId('robo-busca-fala').fill('Muito bem');
    await pg.getByTestId('robo-usar-fala').first().waitFor({ timeout: 20000 });
    await pg.getByTestId('robo-usar-fala').first().click();
    await pg.getByTestId('robo-salvo').waitFor();
    ok(true, 'resultado salvo no lugar de uma fala (neste aparelho)');
    await pg.getByTestId('robo-busca-fala').fill('mmm');
    await pg.waitForTimeout(300);
    const sons = await pg.getByTestId('robo-usar-fala').evaluateAll((xs) => xs.map((x) => x.textContent ?? ''));
    ok(!sons.some((t) => /Som puro da letra/.test(t)), 'sons puros das letras não aparecem para receber voz do robô (regra 1)');
    ok(!(await pg.locator('body').innerText()).includes(CHAVE), 'a chave inteira não aparece em lugar nenhum da tela');

    // pacote do Publicar: a fala vai como "robo", sem a chave
    await pg.goto(BASE + '#/admin/publicar');
    await pg.getByTestId('publicar-tudo').waitFor();
    const [dl] = await Promise.all([pg.waitForEvent('download'), pg.getByTestId('gerar-pacote-tudo').click()]);
    const caminho = await dl.path();
    const { readFileSync } = await import('node:fs');
    const buf = readFileSync(caminho);
    const zip = lerZip(buf);
    const pac = JSON.parse(zip.get('pacote.json').toString('utf8'));
    const robo = (pac.audios ?? []).find((a) => a.origem === 'robo');
    ok(!!robo && robo.robo?.voz === 'Bolota cômico' && robo.autorizacao === true, 'pacote: a fala do robô vai marcada como "robo" (voz e modelo), com o consentimento');
    ok(!buf.toString('latin1').includes(CHAVE), 'pacote sem a chave do ElevenLabs');
    ok(pac.edicoes.some((e) => e.colecao === 'jogos'), 'pacote: as edições dos jogos vão junto');
    ok(reg.outros.length === 0, `nenhuma outra chamada ao ElevenLabs (${reg.outros.join(', ') || 'nenhuma'})`);
  } finally { await ctx.close(); }
}

/** Capturas v18-estudio-* (PC 1440×900 e tablet 820×1180), com a API falsa. */
export async function capturasEstudio(browser, { BASE, dir, erros }) {
  mkdirSync(dir, { recursive: true });
  for (const [w, h, suf] of [[1440, 900, 'pc'], [820, 1180, 'tablet']]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, locale: 'pt-BR', serviceWorkers: 'block' });
    await ctx.addInitScript(() => { try { localStorage.setItem('fonema-teste-rapido', '1'); } catch { /* sem armazenamento */ } });
    await apiFalsa(ctx);
    const pg = await ctx.newPage();
    pg.on('pageerror', (e) => erros.push(String(e)));
    const foto = async (nome) => { await pg.waitForTimeout(400); await pg.screenshot({ path: resolve(dir, `v18-estudio-${nome}-${suf}.jpg`), type: 'jpeg', quality: 82 }); };
    try {
      await entrarAdmin(pg, BASE, 'admin/estudio/jogos');
      await pg.getByTestId('palavras-jogo').waitFor();
      await foto('jogos');
      const casa = pg.locator('[data-jogo="casa-som"]');
      await casa.getByTestId('nova-palavra').fill('cama');
      await casa.getByTestId('acrescentar-palavra').click();
      await casa.getByTestId('bloqueio-decod').waitFor();
      await casa.getByTestId('bloqueio-decod').scrollIntoViewIfNeeded();
      await pg.evaluate(() => window.scrollBy(0, -260));
      await foto('jogos-bloqueio');
      await pg.goto(BASE + '#/admin/estudio/personagens');
      await pg.getByTestId('estudio-personagens').waitFor();
      await pg.locator('.est-elenco').scrollIntoViewIfNeeded();
      await pg.evaluate(() => window.scrollBy(0, -120));
      await foto('personagens');
      await pg.goto(BASE + '#/admin/estudio/vozes');
      await pg.getByTestId('linha-audio').first().waitFor({ timeout: 20000 });
      await foto('vozes');
      await pg.goto(BASE + '#/admin/estudio/robo');
      await pg.getByTestId('robo-voz').waitFor();
      await pg.getByTestId('campo-chave').fill(CHAVE);
      await pg.getByTestId('guardar-chave').click();
      await pg.getByTestId('carregar-vozes').click();
      await pg.getByTestId('total-vozes').waitFor();
      await pg.getByTestId('preset-comica').selectOption('v-bolota');
      await pg.getByTestId('robo-arquivo').setInputFiles({ name: 'minha-fala.wav', mimeType: 'audio/wav', buffer: wav() });
      await pg.getByTestId('consentimento').check();
      await pg.getByTestId('destino-infantil').click();
      await pg.getByTestId('robo-converter').click();
      await pg.getByTestId('robo-resultado').first().waitFor();
      await foto('robo');
      await pg.getByTestId('passo-resultados').evaluate((el) => window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 360));
      await foto('robo-resultado');
    } finally { await ctx.close(); }
  }
}
