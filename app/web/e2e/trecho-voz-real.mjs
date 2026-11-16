// FONEMA · trecho E2E com a VOZ EM TEMPO REAL (sem o modo 'fonema-teste-rapido').
// Cobre a "trava da voz" (16/11): Trilha dos Sons → Lojinha (com a fala de boas-vindas ainda tocando) → Letra A.
// Antes da correção, o clipe da Trilha dos Sons acabava sem o navegador avisar o fim; a voz do app inteiro ficava
// esperando e o "Já conheci!" nunca liberava. Agora: a troca de tela cancela a fala, a espera tem tempo-limite
// (servicos/midia.ts) e o botão de avanço tem rede de segurança (servicos/destravar.ts).
// Uso: node e2e/fluxo.e2e.mjs --voz-real   (também roda dentro do E2E completo e do --sem-jornada)

/**
 * @param {import('@playwright/test').Browser} browser
 * @param {{ BASE: string, ok: (c: boolean, m: string) => void, passarPorteira: Function, cadastrar: Function, montarAvatar: Function, erros: string[] }} h
 */
export async function trechoVozReal(browser, { BASE, ok, passarPorteira, cadastrar, montarAvatar, erros }) {
  console.log('V. Voz em tempo real: Trilha dos Sons → Lojinha (falando) → Letra A, sem modo rápido');
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, locale: 'pt-BR', serviceWorkers: 'block' });
  const pg = await ctx.newPage();
  pg.on('pageerror', (e) => erros.push(String(e)));
  await pg.addInitScript(() => {
    window.__falas = [];
    for (const n of ['fonema:fala', 'fonema:fala-fim', 'fonema:som']) addEventListener(n, (e) => window.__falas.push([n, Date.now(), e.detail?.arquivo ?? e.detail?.fonema ?? '']));
    // diagnóstico: guarda (sem segurar na memória) cada clipe tocado, para mostrar o estado dele se a voz travar
    window.__clipes = [];
    const play = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function () {
      window.__clipes.push([String(this.src).split('/').pop(), new WeakRef(this)]);
      // SIMULA o defeito visto no Chromium (16/11): o clipe da Trilha dos Sons acaba e o navegador NÃO avisa
      // ('ended'/'pause' nunca chegam). Assim o teste não depende da sorte: o código antigo travava sempre aqui.
      if (location.hash.endsWith('/sons') && !window.__semAvisoDeFim) {
        window.__semAvisoDeFim = true;
        this.onended = null; this.onpause = null;
        for (const k of ['onended', 'onpause']) Object.defineProperty(this, k, { configurable: true, get: () => null, set: () => {} });
      }
      return play.call(this);
    };
  });
  // o cadastro pode ser rápido; o trecho que interessa, não
  await pg.goto(BASE);
  await pg.evaluate(() => localStorage.setItem('fonema-teste-rapido', '1'));
  await pg.goto(BASE + '#/adulto/cadastro');
  await passarPorteira(pg);
  await cadastrar(pg, 'Lia', 'f');
  await montarAvatar(pg);
  await pg.waitForFunction(() => location.hash.includes('/c/'));
  const id = pg.url().split('/c/')[1].split('/')[0];
  await pg.evaluate(() => localStorage.removeItem('fonema-teste-rapido'));
  await pg.goto(BASE + `#/c/${id}/vila`);
  await pg.reload();
  await pg.waitForTimeout(2500);
  const falasDesde = (t) => pg.evaluate((t0) => window.__falas.filter(([n, t]) => n !== 'fonema:fala-fim' && t >= t0).length, t);

  const tSons = Date.now();
  await pg.evaluate((cid) => { location.hash = `#/c/${cid}/sons`; }, id);
  await pg.getByTestId('trilha-sons').waitFor();
  await pg.waitForFunction((t0) => window.__falas.some(([n, t]) => n === 'fonema:fala' && t >= t0), tSons, { timeout: 10000 });
  await pg.waitForTimeout(2500); // a fala da Trilha dos Sons ainda está no fim
  await pg.evaluate((cid) => { location.hash = `#/c/${cid}/lojinha`; }, id);
  await pg.getByTestId('lojinha').waitFor();
  await pg.waitForTimeout(2500); // sai da Lojinha com a fala de boas-vindas tocando (ou ainda carregando)

  const tA = Date.now();
  await pg.evaluate((cid) => { location.hash = `#/c/${cid}/sessao/AL-A`; }, id);
  const comecar = pg.getByTestId('comecar-sessao');
  if (await comecar.waitFor({ timeout: 8000 }).then(() => true, () => false)) await comecar.click();
  const botao = pg.getByTestId('conheci-a-letra');
  await botao.waitFor({ timeout: 15000 });
  let liberou = -1;
  for (let s = 0; s < 70; s++) {
    if (await botao.isEnabled().catch(() => false)) { liberou = (Date.now() - tA) / 1000; break; }
    await pg.waitForTimeout(1000);
  }
  ok(await pg.evaluate(() => !!window.__semAvisoDeFim), 'o clipe da Trilha dos Sons tocou sem aviso de fim (defeito simulado)');
  const n = await falasDesde(tA);
  if (liberou < 0) console.log('  clipes:', JSON.stringify(await pg.evaluate(() => window.__clipes.slice(-5).map(([a, r]) => { const e = r.deref(); return [a, e ? { t: e.currentTime, d: e.duration, pausado: e.paused, acabou: e.ended } : 'coletado']; }))));
  ok(n >= 3, `a voz continua depois de sair da Lojinha falando (${n} falas/sons na Letra A)`);
  ok(liberou > 0, `"Já conheci!" liberou${liberou > 0 ? ` em ${Math.round(liberou)} s` : ' (FICOU PRESO)'}`);
  await botao.click();
  await pg.waitForFunction(() => !document.querySelector('[data-testid=conheci-a-letra]'), null, { timeout: 15000 });
  ok(true, 'a sessão segue para a cena seguinte');
  await ctx.close();
}
