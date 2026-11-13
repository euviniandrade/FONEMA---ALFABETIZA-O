// Teste de ponta a ponta do protótipo (Playwright + Chromium).
// Uso: node testes/fluxo.js   (a partir de prototipo-jogavel/)
// Gera capturas 1280×800 com deviceScaleFactor 2 em capturas/.
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const RAIZ = path.resolve(__dirname, '..');
const URL = 'file://' + path.join(RAIZ, 'index.html') + '?rapido=1';
const CAP = path.join(RAIZ, 'capturas');
fs.mkdirSync(CAP, { recursive: true });

// Microfone falso (oscilador) para exercitar MediaRecorder e o medidor de volume sem hardware.
const MIC_FALSO = () => {
  navigator.mediaDevices.getUserMedia = async () => {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator(); osc.frequency.value = 220;
    const g = ctx.createGain(); g.gain.value = 0.6;
    const dst = ctx.createMediaStreamDestination();
    osc.connect(g); g.connect(dst); osc.start();
    return dst.stream;
  };
};

const erros = [];
const ok = (cond, msg) => { if (!cond) { erros.push(msg); console.log('  ✗', msg); } else console.log('  ✓', msg); };
const pausa = (ms) => new Promise((r) => setTimeout(r, ms));

async function novaPagina(browser, { mic }) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 2 });
  if (mic) await ctx.addInitScript(MIC_FALSO);
  const page = await ctx.newPage();
  page.on('pageerror', (e) => erros.push('pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') console.log('   [console]', m.text()); });
  await page.goto(URL);
  return { ctx, page };
}
const foto = async (page, nome) => { await pausa(350); await page.screenshot({ path: path.join(CAP, nome + '.png') }); console.log('   📷', nome); };
const texto = (page) => page.locator('#palco').innerText();

async function cadastro(page, nome, g, audio) {
  await page.fill('#iNome', nome + ' Sobrenome');
  await page.click(`[data-g=${g}]`);
  await page.check('#cResp'); await page.check('#cNome');
  if (audio) await page.check('#cAudio');
}

async function missao(page, prefixo, { mic, errarFigura, errarLetra }) {
  // Assiste e Faz: mini-vídeo
  await page.click('#bPlay');
  await page.waitForSelector('#letreiro.on');
  await foto(page, prefixo + '06-assiste-video');
  await page.waitForSelector('[data-tela=suaVez]', { timeout: 20000 });
  await foto(page, prefixo + '07-agora-e-sua-vez');
  await page.click('#bIr');
  // Figura
  const figs = await page.evaluate(() => window.FONEMA.missao().figuras.map((f) => f.certo));
  const certa = figs.indexOf(true);
  if (errarFigura) {
    await page.locator('.escolhe').nth(certa === 0 ? 1 : 0).click();
    await pausa(300);
    ok(/Quase/.test(await texto(page)), 'erro na figura gera feedback acolhedor ("Quase")');
    await foto(page, prefixo + '08-figura-erro-acolhedor');
  }
  await page.locator('.escolhe').nth(certa).click();
  await page.waitForSelector('#bCont');
  await foto(page, prefixo + '09-figura-certa');
  await page.click('#bCont');
  // Letras
  const letras = await page.evaluate(() => [...window.FONEMA.estado.nome.toUpperCase()]);
  if (errarLetra) {
    const errada = await page.locator('.peca').evaluateAll((ps, l0) => ps.findIndex((p) => p.dataset.c !== l0), letras[0]);
    if (errada >= 0) await page.locator('.peca').nth(errada).click();
  }
  for (let i = 0; i < letras.length; i++) {
    const idx = await page.locator('.peca').evaluateAll((ps, c) => ps.findIndex((p) => p.dataset.c === c && !p.disabled), letras[i]);
    const peca = page.locator('.peca').nth(idx);
    if (i === 0) {
      // arrasta a primeira letra até o primeiro espaço (pointer events)
      const a = await peca.boundingBox(); const b = await page.locator('.slot').first().boundingBox();
      await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2); await page.mouse.down();
      await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 8 }); await page.mouse.up();
    } else await peca.click();
    if (i === Math.floor(letras.length / 2)) await foto(page, prefixo + '10-letras-montando');
  }
  await page.waitForSelector('#bContL');
  await page.click('#bContL');
  // Falar
  if (mic) { await page.click('#bMic'); }
  else { await page.click('#bMic'); await pausa(400); await foto(page, prefixo + '11-falar-sem-microfone'); await page.click('#bFalei'); }
  await page.waitForSelector('#bTerminar', { timeout: 10000 });
  if (mic) await foto(page, prefixo + '11-falar-ouvi');
  await page.click('#bTerminar');
  await pausa(900);
  await foto(page, prefixo + '12-celebracao-selo');
  const tCel = await texto(page); if (!/Próximo objetivo/.test(tCel)) console.log(tCel.slice(-500));
  ok(/Próximo objetivo: faltam 2 desafios/.test(tCel) && /Caçador de Sílabas/.test(await texto(page)), 'álbum mostra o próximo objetivo e o caminho para Caçador de Sílabas (D019)');
  await page.click('#bMostra');
}

(async () => {
  const browser = await chromium.launch();

  /* ---------- Fluxo A: Kauã, masculino, com microfone ---------- */
  console.log('Fluxo A · Kauã · masculino');
  {
    const { ctx, page } = await novaPagina(browser, { mic: true });
    await cadastro(page, 'kauã', 'm', true);
    ok((await page.textContent('#previa')).includes('pronto, Kauã'), 'prévia de concordância masculina');
    await foto(page, '01-cadastro-adulto');
    await page.click('button[type=submit]');
    await page.waitForSelector('[data-tela=pronuncia]');
    ok((await page.textContent('h1')).includes('Kauã'), 'só o primeiro nome (sem sobrenome), capitalizado');
    await page.click('#bGravar');
    await page.waitForSelector('#bOuvirGrav:not([disabled])', { timeout: 8000 });
    ok(true, 'gravação do nome com MediaRecorder');
    const grafias = await page.locator('.op-pron .graf').allInnerTexts();
    console.log('   opções:', grafias.join(' | '));
    ok(grafias.length === 3 && grafias.includes('Ka-u-Ã'), '3 opções de pronúncia, incluindo Ka-u-Ã');
    await page.locator('.op-pron .escolher').nth(grafias.indexOf('Ka-u-Ã')).click();
    await page.fill('#iFon', 'Ka-u-Ã'); await page.click('#bGerar');
    await foto(page, '02-nome-falado-pronuncia');
    await page.click('#bOk');
    await foto(page, '03-entrega-para-crianca');
    await page.click('#bComecar');
    await page.locator('.op-av').nth(6).click(); await page.click('.op-cant[data-k=ipe]');
    await foto(page, '04-avatar');
    await page.click('#bPronto');
    await page.waitForFunction(() => document.querySelectorAll('#falasVila .fala').length === 3);
    const tv = await texto(page);
    ok(/Oi, Kauã!/.test(tv), 'chegada: "Oi, Kauã!"');
    ok(/bem-vindo/.test(tv) && /pronto/.test(tv), 'concordância masculina (bem-vindo, pronto)');
    await foto(page, '05-chegada-vila');
    await page.click('#bVamos');
    await missao(page, '', { mic: true, errarFigura: true, errarLetra: true });
    await page.click('#bGravaDemo');
    await page.waitForSelector('#bEnvia:not([disabled])', { timeout: 8000 });
    await foto(page, '13-mostra-pro-professor');
    await page.click('#bEnvia');
    await page.click('[data-v=aprendeu]');
    await page.waitForSelector('#bDesp');
    ok(/Parabéns, Kauã!/.test(await texto(page)), 'parabéns do professor com o nome');
    await foto(page, '14-professor-1-toque');
    await page.click('#bDesp');
    await page.waitForFunction(() => document.querySelectorAll('#falasD .fala').length === 2);
    ok(/Tchau, Kauã!/.test(await texto(page)), 'despedida pelo nome');
    await foto(page, '15-despedida');
    await page.click('#bAdulto');
    const tp = await texto(page);
    ok(/Hoje o Kauã/.test(tp) && /nome dele/.test(tp), 'mensagem da família com concordância masculina');
    ok(/Termômetro/.test(tp) && /professor/.test(tp), 'painéis: família, termômetro e professor');
    const moedas = await page.evaluate(() => window.FONEMA.estado.moedas);
    ok(moedas === 15, `moedinhas fixas: 10 da missão + 5 do professor = ${moedas}`);
    await foto(page, '16-paineis-familia-professor-termometro');
    await page.evaluate(() => document.querySelector('#palco').scrollTo(0, 9999));
    await foto(page, '17-paineis-rolado');
    const ls = await page.evaluate(() => localStorage.getItem('fonema-prototipo-v1'));
    ok(!/Sobrenome/i.test(ls) && !/blob:/.test(ls), 'localStorage sem sobrenome e sem áudio');
    await ctx.close();
  }

  /* ---------- Fluxo B: Helena, prefiro não informar, sem microfone ---------- */
  console.log('Fluxo B · Helena · prefiro não informar');
  {
    const { ctx, page } = await novaPagina(browser, { mic: false });
    await cadastro(page, 'Helena', 'n', false);
    ok((await page.textContent('#previa')).includes('Vamos começar, Helena?'), 'prévia neutra');
    await foto(page, 'b-01-cadastro-neutro');
    await page.click('button[type=submit]');
    ok(await page.isDisabled('#bGravar'), 'gravação desligada sem consentimento');
    await page.locator('.op-pron .escolher').first().click();
    await page.click('#bOk');
    await page.click('#bComecar');
    await page.locator('.op-av').nth(1).click();
    await page.click('#bPronto');
    await page.waitForFunction(() => document.querySelectorAll('#falasVila .fala').length === 3);
    const tv = await texto(page);
    ok(/Oi, Helena!/.test(tv), 'chegada: "Oi, Helena!"');
    ok(!/pront[oa]|bem-vind[oa]/.test(tv), 'falas neutras (sem pronto/pronta/bem-vindo/a)');
    await foto(page, 'b-05-chegada-vila-neutra');
    await page.click('#bVamos');
    const som = await page.evaluate(() => window.FONEMA.missao().som);
    ok(som.chave === 'e' && som.mudo === 1, 'Helena: H mudo, primeiro som /e/');
    await page.click('#bPlay');
    await page.waitForSelector('[data-tela=suaVez]', { timeout: 20000 });
    await foto(page, 'b-07-h-mudo');
    await page.click('#bIr');
    // celular: mesma tela em 390×844
    await page.setViewportSize({ width: 390, height: 844 });
    await foto(page, 'b-08-celular-figuras');
    await page.setViewportSize({ width: 1280, height: 800 });
    const certa = await page.evaluate(() => window.FONEMA.missao().figuras.findIndex((f) => f.certo));
    const errs = [0, 1, 2].filter((i) => i !== certa);
    await page.locator('.escolhe').nth(errs[0]).click(); await pausa(200);
    await page.locator('.escolhe').nth(errs[1]).click(); await pausa(300);
    ok(await page.locator('.fig.modelo').count() === 1, '2º erro: figura certa vira modelo (escada de ajuda)');
    await foto(page, 'b-08-figura-modelo-apos-2-erros');
    await page.locator('.escolhe').nth(certa).click();
    await page.click('#bCont');
    for (const c of ['H', 'E', 'L', 'E', 'N', 'A']) {
      const idx = await page.locator('.peca').evaluateAll((ps, c) => ps.findIndex((p) => p.dataset.c === c && !p.disabled), c);
      await page.locator('.peca').nth(idx).click();
    }
    await page.click('#bContL');
    await page.click('#bMic'); await pausa(400);
    ok(/microfone não está disponível/.test(await texto(page)), 'sem microfone: mensagem + botão "Eu falei!"');
    await foto(page, 'b-11-falar-sem-microfone');
    await page.click('#bFalei');
    await page.click('#bTerminar');
    await pausa(600);
    ok(/Você conseguiu, Helena!/.test(await texto(page)), 'celebração neutra com o nome');
    await page.click('#bMostra');
    await page.click('#bAoVivo');
    await page.click('[data-v=treinar]');
    await page.waitForSelector('#bDesp');
    ok(/treinar mais com você/.test(await texto(page)), '"Vamos treinar mais" acolhedor, sem selo nem perda');
    await foto(page, 'b-14-professor-treinar-mais');
    await page.click('#bDesp');
    await page.waitForFunction(() => document.querySelectorAll('#falasD .fala').length === 2);
    const td = await texto(page);
    ok(/Até amanhã, Helena!/.test(td) && !/querid|orgulhos/.test(td), 'despedida neutra pelo nome');
    await page.click('#bAdulto');
    const tp = await texto(page);
    ok(/Hoje Helena fez/.test(tp) && /próprio nome/.test(tp) && !/nome dela|nome dele/.test(tp), 'mensagem da família neutra');
    await foto(page, 'b-16-paineis-neutro');
    // alto contraste + menos movimento
    await page.click('#bContraste'); await page.click('#bMov');
    ok(await page.evaluate(() => document.body.classList.contains('contraste') && document.body.classList.contains('calmo')), 'alto contraste e reduzir movimento');
    await foto(page, 'b-17-alto-contraste');
    // regras do primeiro som
    const tab = await page.evaluate(() => ['Cecília', 'Gisele', 'Chico', 'Guilherme', 'Xavier', 'Thiago', 'Enzo', 'Yasmin', 'Quésia', 'Rafael']
      .map((n) => n + ':' + window.FONEMA.regras.somInicial(n).chave));
    console.log('   regras:', tab.join(' '));
    ok(tab.join(' ') === 'Cecília:s Gisele:j Chico:x Guilherme:g Xavier:x Thiago:t Enzo:e~ Yasmin:i Quésia:k Rafael:rr', 'tabela de regras (C/G suaves, dígrafos, X, H mudo, nasal)');
    await ctx.close();
  }

  await browser.close();
  console.log(erros.length ? `\nFALHAS (${erros.length}):\n- ` + erros.join('\n- ') : '\nTudo certo: 2 fluxos completos sem erros.');
  process.exit(erros.length ? 1 : 0);
})();
