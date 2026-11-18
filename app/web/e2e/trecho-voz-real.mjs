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
    // MEDIDOR DE SOBREPOSIÇÃO (revisão 18/11, item 1): cada áudio que soa de verdade vira um intervalo [início, fim] em ms.
    // Elementos <audio>: do 'playing' ao 'pause'/'ended'. Web Audio (sons emendados): do start ao fim do trecho (ou stop).
    window.__intervalos = [];
    const agora = () => performance.now();
    const playOrig = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function () {
      if (this.tagName === 'AUDIO' && !this.__medido) {
        this.__medido = true;
        const el = this; // eslint-disable-line @typescript-eslint/no-this-alias
        let atual = null;
        // 'playing' volta a disparar depois de um engasgo da rede: só abre um intervalo novo se o anterior já fechou
        el.addEventListener('playing', () => {
          if (atual && atual.fim === null) return;
          atual = { tipo: 'audio', nome: String(el.src).split('/').pop(), ini: agora(), fim: null, el: new WeakRef(el), t0: el.currentTime };
          window.__intervalos.push(atual);
        });
        const fecha = () => { if (atual && atual.fim === null) atual.fim = agora(); };
        el.addEventListener('pause', fecha); el.addEventListener('ended', fecha);
      }
      return playOrig.call(this);
    };
    const startOrig = AudioBufferSourceNode.prototype.start;
    AudioBufferSourceNode.prototype.start = function (when = 0, offset = 0, dur) {
      const c = this.context;
      const ini = agora() + Math.max(0, when - c.currentTime) * 1000;
      const d = (dur ?? (this.buffer ? this.buffer.duration - offset : 0)) * 1000;
      const it = { tipo: 'webaudio', nome: 'emendado', ini, fim: ini + d };
      window.__intervalos.push(it);
      const stopOrig = this.stop.bind(this);
      this.stop = (w = 0) => { const t = agora() + Math.max(0, w - c.currentTime) * 1000; if (t < it.fim) it.fim = Math.max(it.ini, t); return stopOrig(w); };
      return startOrig.call(this, when, offset, dur);
    };
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

  // ---- revisão 18/11, itens 1 e 7: a criança erra RÁPIDO (antes de o estímulo acabar) e nada toca por cima ----
  const fiz = pg.getByTestId('fiz-o-som');
  await fiz.waitFor({ timeout: 20000 });
  // botão de avanço: nunca "apagado" (disabled); enquanto a dupla mostra, o "Ouvindo…" animado
  let apagado = 0; let ouvindo = 0;
  for (let k = 0; k < 60; k++) {
    const st = await fiz.evaluate((b) => ({ dis: b.disabled, ouv: b.dataset.ouvindo === '1' })).catch(() => null);
    if (!st) break;
    if (st.dis) apagado++;
    if (st.ouv) ouvindo++;
    if (!st.ouv && !st.dis) break;
    await pg.waitForTimeout(500);
  }
  ok(apagado === 0, `"Eu fiz o som!" nunca fica apagado enquanto a Sofia mostra (indicador "Ouvindo…" visto ${ouvindo}×)`);
  await fiz.click();
  const opcao = pg.locator('.mec-escolher button.opcao').first();
  await opcao.waitFor({ timeout: 20000 });
  const tC3 = Date.now();
  // espera o som-estímulo COMEÇAR (o /a/) e erra logo em seguida, antes de ele acabar
  await pg.waitForFunction((t0) => window.__falas.some(([n, t]) => n === 'fonema:som' && t >= t0), tC3, { timeout: 30000 });
  await pg.waitForTimeout(250);
  const tErro = await pg.evaluate(() => performance.now());
  await pg.locator('.mec-escolher button.opcao:not([data-correta])').first().click();
  // a correção contrastiva inteira (≈ 10 s com voz real)
  await pg.waitForTimeout(14000);
  // intervalo sem evento de fim (o defeito simulado da Trilha dos Sons): se o clipe já parou, o fim é o início + o que ele tocou
  const ivs = await pg.evaluate(() => window.__intervalos.map((x) => {
    let fim = x.fim;
    if (fim === null) {
      const e = x.el?.deref();
      fim = e && (e.paused || e.ended) ? x.ini + Math.max(0, e.currentTime - (x.t0 ?? 0)) * 1000 : performance.now();
    }
    return { tipo: x.tipo, nome: x.nome, ini: x.ini, fim };
  }));
  // sons emendados de um mesmo lote se encostam de propósito (50 ms): junta-os antes de medir
  const el = ivs.filter((x) => x.tipo === 'audio');
  const wa = ivs.filter((x) => x.tipo === 'webaudio').sort((a, b) => a.ini - b.ini).reduce((acc, x) => { const u = acc.at(-1); if (u && x.ini <= u.fim + 5) u.fim = Math.max(u.fim, x.fim); else acc.push({ ...x }); return acc; }, []);
  const todos = [...el, ...wa].sort((a, b) => a.ini - b.ini);
  const sobre = [];
  for (let i = 0; i < todos.length; i++) for (let j = i + 1; j < todos.length; j++) {
    const o = Math.min(todos[i].fim, todos[j].fim) - Math.max(todos[i].ini, todos[j].ini);
    if (o > 50) sobre.push(`${todos[i].nome} × ${todos[j].nome}: ${Math.round(o)} ms`);
  }
  const depois = todos.filter((x) => x.ini >= tErro);
  ok(depois.length >= 3, `a correção tocou (${depois.length} áudios depois do erro: ${depois.map((x) => x.nome).join(', ')})`);
  ok(sobre.length === 0, `nenhuma fala/som por cima de outro (> 50 ms) em ${todos.length} áudios${sobre.length ? ': ' + sobre.join('; ') : ''}`);
  // sons comparados com pausa audível: entre o fim de um som de letra e o próximo áudio há respiro
  const sons = depois.filter((x) => x.tipo === 'audio' && !/^(sofia|tales)-/.test(x.nome) && /\.mp3$/.test(x.nome));
  const gaps = sons.map((s) => { const prox = depois.find((y) => y.ini > s.ini && y !== s); return prox ? Math.round(prox.ini - s.fim) : null; }).filter((g) => g !== null);
  ok(gaps.every((g) => g >= 150), `pausa audível depois de cada som comparado (${gaps.join(', ')} ms)`);
  await ctx.close();
}
