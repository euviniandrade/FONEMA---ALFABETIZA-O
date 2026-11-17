// FONEMA · trecho E2E: TUTORIAL "A grande aventura" e PAINEL GUIA (D032 itens 1 e 2).
// Confere: o tutorial abre sozinho depois do boneco; os 6 passos (mundo, caminho com 9 etapas e "Você está aqui", como mexer com
// 1 toque e 1 arraste, prêmios, jogos, primeira missão com a barrinha); retoma no passo em que parou; o mini-exercício não grava
// tentativa; termina na primeira fase; depois de visto não abre sozinho; reabre pelo "Como jogar?" e fecha; painel guia na vila e nas
// trilhas (sem cobrir a fala nem a barra da vila no PC; faixa que abre no celular); barrinha da missão na sessão; alvos ≥ 60 px.
// Uso: node e2e/fluxo.e2e.mjs --tutorial   (também roda dentro do E2E completo e do --sem-jornada)
//      node e2e/fluxo.e2e.mjs --capturas-tutorial   (capturas 1850×980 e 390×844 em app/docs/capturas/v10-tutorial-*.png)

const lerProgresso = (pg, id) => pg.evaluate(async (cid) => {
  const db = await new Promise((r) => { const q = indexedDB.open('fonema'); q.onsuccess = () => r(q.result); });
  return await new Promise((r) => { const q = db.transaction('progressos').objectStore('progressos').get(cid); q.onsuccess = () => r(q.result); });
}, id);

/** Botões visíveis menores que `min` px (largura ou altura) dentro de `sel`. */
const pequenos = (pg, sel, min = 60) => pg.evaluate(([s, m]) => [...document.querySelectorAll(`${s} button`)]
  .filter((b) => { const r = b.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(b).visibility !== 'hidden' && (r.width < m - 0.5 || r.height < m - 0.5); })
  .map((b) => `${b.getAttribute('data-testid') ?? b.className} ${Math.round(b.getBoundingClientRect().width)}×${Math.round(b.getBoundingClientRect().height)}`), [sel, min]);

/** Alvos tocáveis (fases, lugares do mapa, botões da barra) cujo centro está debaixo do painel guia. */
const cobertosPeloGuia = (pg) => pg.evaluate(() => [...document.querySelectorAll('[data-fase], [data-ponto], [data-regiao], .hud-doca button, .hud-fala button, .topo button')]
  .filter((e) => !e.closest('.guia'))
  .map((e) => { const r = e.getBoundingClientRect(); return { e, x: r.left + r.width / 2, y: r.top + r.height / 2, r }; })
  .filter(({ x, y, r }) => r.width > 0 && x >= 0 && y >= 0 && x < innerWidth && y < innerHeight)
  .filter(({ x, y }) => !!document.elementFromPoint(x, y)?.closest('.guia'))
  .map(({ e }) => e.getAttribute('data-fase') ?? e.getAttribute('data-ponto') ?? e.className));

const sobrepoe = (a, b) => !!a && !!b && a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;

/**
 * @param {import('@playwright/test').Browser} browser
 * @param {{ BASE: string, ok: Function, passarPorteira: Function, cadastrar: Function, erros: string[], w?: number, h?: number, suf?: string, movel?: boolean, capturar?: boolean, dirCap: string }} h
 */
export async function trechoTutorial(browser, h) {
  const { BASE, ok, cadastrar, erros, w = 1280, h: alt = 800, suf = '', movel = false, capturar = false, dirCap } = h;
  console.log(`T. Tutorial "A grande aventura" e painel guia (${w}×${alt})`);
  const ctx = await browser.newContext({ viewport: { width: w, height: alt }, locale: 'pt-BR', serviceWorkers: 'block', ...(movel ? { deviceScaleFactor: 2, isMobile: true, hasTouch: true } : { deviceScaleFactor: capturar ? 1 : 1 }) });
  await ctx.addInitScript(() => { try { localStorage.setItem('fonema-teste-rapido', '1'); } catch { /* sem armazenamento */ } });
  const pg = await ctx.newPage();
  pg.on('pageerror', (e) => erros.push(`[tutorial] ${e}`));
  const cap = async (nome, espera = 500) => { if (!capturar) return; await pg.waitForTimeout(espera); await pg.screenshot({ path: `${dirCap}/v10-tutorial${suf}-${nome}.png` }); };
  const passo = async (n) => { await pg.locator(`[data-testid="tutorial"][data-passo="${n}"]`).waitFor(); await pg.waitForTimeout(250); };
  const seguir = async (n) => { await pg.getByTestId('tutorial-seguir').click(); await passo(n); };

  await pg.goto(BASE + '#/adulto/cadastro');
  await cadastrar(pg, 'Tiago', 'm');
  await pg.getByTestId('montar-avatar').waitFor();
  await pg.getByTestId('avatar-pronto').click();

  // 1 · o mundo
  await passo(0);
  const id = /#\/c\/([^/]+)/.exec(pg.url())[1];
  ok(/\/tutorial$/.test(pg.url()), 'depois do boneco, na primeira vez, o tutorial abre sozinho');
  ok(await pg.locator('.tut-passos li').count() === 6 && await pg.getByTestId('pular-tutorial').count() === 1, 'tutorial: 6 passos com figuras e o botão "Pular" do adulto');
  ok((await pequenos(pg, '.tela-tutorial')).length === 0, `tutorial: todos os botões com 60 px ou mais ${JSON.stringify(await pequenos(pg, '.tela-tutorial'))}`);
  await pg.locator('.tut-camera img').evaluate((i) => i.complete || new Promise((r) => { i.onload = r; i.onerror = r; }));
  await cap('01-mundo', 900);

  // 2 · o caminho
  await seguir(1);
  await pg.waitForTimeout(400);
  ok(await pg.locator('.tut-caminho .etapa').count() === 9 && await pg.locator('.tut-caminho .etapa.trancada').count() === 4, 'caminho: 9 etapas em ordem, as 4 que ainda não existem com cadeado');
  ok(await pg.locator('.tut-caminho .etapa.agora[data-etapa="letras"]').count() === 1 && /Você está aqui/.test(await pg.locator('.tut-caminho .etapa.agora').innerText()), 'caminho: "Você está aqui" em "Letras e sons"');
  const nomes = await pg.locator('.tut-caminho .etapa-nome').allInnerTexts();
  ok(nomes.slice(0, 4).join('|') === 'Letras e sons|Ler palavras|Frases|Historinhas', `caminho na ordem: ${nomes.join(' → ')}`);
  await cap('02-caminho', 700);

  // retomar: sair no meio e voltar pela vila → reabre no passo em que parou
  if (!capturar) {
    await pg.goto(BASE + `#/c/${id}/vila`);
    await passo(1);
    ok(true, 'saiu no meio: ao voltar para a vila, o tutorial reabre no passo em que parou');
  }

  // 3 · como mexer: 1 toque e 1 arraste
  await seguir(2);
  ok(await pg.locator('[data-mexer="tocar"]').count() === 1, 'como mexer: primeiro, tocar na estrela');
  await cap('03-mexer-tocar', 500);
  await pg.getByTestId('tutorial-estrela').click();
  await pg.locator('[data-mexer="arrastar"]').waitFor();
  const moeda = await pg.getByTestId('tutorial-moeda').boundingBox();
  const porco = await pg.getByTestId('tutorial-porquinho').boundingBox();
  await pg.mouse.move(moeda.x + moeda.width / 2, moeda.y + moeda.height / 2);
  await pg.mouse.down();
  for (let i = 1; i <= 12; i++) await pg.mouse.move(moeda.x + moeda.width / 2 + ((porco.x + porco.width / 2) - (moeda.x + moeda.width / 2)) * i / 12, moeda.y + moeda.height / 2 + ((porco.y + porco.height / 2) - (moeda.y + moeda.height / 2)) * i / 12);
  if (capturar) await pg.screenshot({ path: `${dirCap}/v10-tutorial${suf}-03b-mexer-arrastando.png` });
  await pg.mouse.up();
  await pg.locator('[data-mexer="pronto"]').waitFor({ timeout: 10000 });
  ok(true, 'como mexer: tocou na estrela e arrastou a moedinha até o porquinho');
  const pMeio = await lerProgresso(pg, id);
  const tentativas = Object.values(pMeio.habilidades ?? {}).reduce((s, x) => s + (x.tentativas?.length ?? 0), 0);
  ok(tentativas === 0 && pMeio.sessoesFeitas === 0 && pMeio.desafios === 0 && pMeio.moedinhas.saldo === 0, 'o mini-exercício não conta como avaliação (nenhuma tentativa, desafio ou moedinha)');
  ok(pMeio.tutorial?.passo === 2 && !pMeio.tutorial?.vistoEm, 'o progresso guarda o passo do tutorial (para retomar)');
  await cap('03-mexer-pronto', 400);

  // 4 · prêmios · 5 · jogos
  await seguir(3);
  ok(await pg.locator('.tut-premio').count() === 3 && await pg.locator('.tut-depois img[src*="barco"]').count() === 1, 'prêmios: moedinhas, Lojinha (barco e carro trancados, para depois), selos/álbum e nível');
  await cap('04-premios', 700);
  await seguir(4);
  ok(await pg.locator('.tut-jogos-lista li').count() >= 3 && /Brincar/.test(await pg.locator('.tut-brincar').innerText()), 'jogos: o botão Brincar e alguns jogos');
  await cap('05-jogos', 700);

  // 6 · a primeira missão
  await seguir(5);
  await pg.locator('.tut-missao .barra-missao.cheia').waitFor({ timeout: 10000 });
  ok(/Letra A/.test(await pg.locator('.tut-missao-titulo').innerText()), 'a primeira missão: "Letra A", com a barrinha que enche a cada desafio');
  await cap('06-missao', 500);
  if (!capturar) {
    await pg.getByTestId('tutorial-voltar').click();
    await passo(4);
    ok(true, 'a setinha de voltar volta um passo');
    await seguir(5);
  }
  await pg.getByTestId('tutorial-comecar').click();
  await pg.waitForFunction(() => location.hash.includes('/sessao/'));
  await pg.locator('.tela-sessao').waitFor();
  ok(/\/sessao\/AL-A/.test(pg.url()), 'o fim do tutorial leva direto à primeira fase');
  const pFim = await lerProgresso(pg, id);
  ok(!!pFim.tutorial?.vistoEm, 'tutorial marcado como visto');

  // barrinha da missão na sessão
  await pg.getByTestId('comecar-sessao').click();
  await pg.getByTestId('trilha-missao').waitFor();
  ok(await pg.locator('.trilha-missao .bm-pontos li').count() >= 3 && await pg.locator('.trilha-missao .bm-pontos li.agora').count() === 1, 'na sessão: barrinha da missão com um pontinho por passo e a estrela no de agora');
  ok(!/Eu faço|Nós fazemos|Você faz|Desafio/.test(await pg.locator('.topo').innerText()), 'a barrinha não mostra nomes de método');
  await cap('07-sessao-barra', 900);

  // vila: não reabre sozinho; painel guia
  await pg.goto(BASE + `#/c/${id}/vila`);
  await pg.getByTestId('vila').waitFor();
  ok(/\/vila$/.test(pg.url()), 'depois de visto, o tutorial não abre mais sozinho');
  await pg.getByTestId('painel-guia').waitFor();
  if (!movel) {
    const guia = await pg.locator('.guia-vila .guia-corpo').boundingBox();
    const mapa = await pg.locator('.mapa-nav').boundingBox();
    ok(mapa.x >= guia.x + guia.width - 1, 'vila (PC): o mapa começa depois da coluna do painel (nenhum lugar fica escondido)');
    const fala = await pg.locator('.hud-fala').boundingBox();
    const doca = await pg.locator('.hud-doca').boundingBox();
    ok(guia && guia.height > 200 && !sobrepoe(guia, fala) && !sobrepoe(guia, doca), 'vila (PC): painel guia ao lado, sem cobrir a fala nem a barra');
    ok(await pg.getByTestId('guia-continuar').isVisible() && await pg.getByTestId('como-jogar').isVisible(), 'painel guia: "Continuar" e "Como jogar?"');
  } else {
    ok(await pg.getByTestId('guia-abrir').isVisible() && !(await pg.locator('.guia-vila .guia-corpo').isVisible()), 'vila (celular): painel guia recolhido numa faixa em cima');
    await cap('08-vila-faixa', 900);
    await pg.getByTestId('guia-abrir').click();
    await pg.locator('.guia-vila .guia-corpo').waitFor();
    ok(true, 'vila (celular): tocar na faixa abre o painel');
  }
  ok(/Você está aqui/i.test(await pg.locator('.guia-vila').innerText()) && /Letras e sons/.test(await pg.locator('.guia-vila .guia-aqui').innerText()), 'painel guia: "Você está aqui: Letras e sons"');
  ok((await pequenos(pg, '.guia-vila .guia-corpo')).length === 0, `painel guia: botões com 60 px ou mais ${JSON.stringify(await pequenos(pg, '.guia-vila .guia-corpo'))}`);
  await cap(movel ? '09-vila-guia-aberto' : '08-vila-guia', 1200);

  // nenhum alvo tocável debaixo do painel, em vários tamanhos (o painel do celular é aberto/fechado pela criança)
  if (!capturar) {
    for (const [vw, vh] of [[1850, 980], [1366, 768], [1280, 800], [768, 1024], [390, 844]]) {
      await pg.setViewportSize({ width: vw, height: vh });
      for (const r of ['vila', 'alfabeto', 'sons']) {
        await pg.goto(BASE + `#/c/${id}/${r}`);
        await pg.getByTestId('painel-guia').waitFor();
        await pg.waitForTimeout(700);
        const cob = await cobertosPeloGuia(pg);
        ok(cob.length === 0, `${r} ${vw}×${vh}: o painel guia não cobre nada tocável ${cob.length ? JSON.stringify(cob) : ''}`);
      }
    }
    await pg.setViewportSize({ width: w, height: alt });
    await pg.goto(BASE + `#/c/${id}/vila`);
    await pg.getByTestId('vila').waitFor();
  }

  // reabrir pelo "Como jogar?" e fechar
  if (movel && !(await pg.getByTestId('como-jogar').isVisible())) await pg.getByTestId('guia-abrir').click();
  await pg.getByTestId('como-jogar').click();
  await passo(0);
  ok(/\/tutorial\/de-novo$/.test(pg.url()) && /Fechar/.test(await pg.getByTestId('pular-tutorial').innerText()), '"Como jogar?" reabre o tutorial do começo, com "Fechar"');
  await pg.getByTestId('pular-tutorial').click();
  await pg.getByTestId('vila').waitFor();
  ok(true, 'fechar o tutorial reaberto volta para a vila');

  // trilhas: painel guia
  await pg.goto(BASE + `#/c/${id}/alfabeto`);
  await pg.getByTestId('trilha-alfabeto').waitFor();
  ok(await pg.locator('.guia-trilha').count() === 1, 'Trilha do Alfabeto: painel guia');
  if (!movel && w >= 1200) {
    const g = await pg.locator('.guia-trilha .guia-corpo').boundingBox();
    const c = await pg.locator('.alfabeto-cartao').boundingBox();
    ok(!sobrepoe(g, c), 'Trilha do Alfabeto (PC): o painel fica ao lado, sem cobrir a trilha');
  }
  await cap('10-trilha-alfabeto', 1000);
  await pg.goto(BASE + `#/c/${id}/sons`);
  await pg.getByTestId('trilha-sons').waitFor();
  ok(await pg.locator('.guia-trilha').count() === 1, 'Trilha dos Sons: painel guia');
  await cap('11-trilha-sons', 1000);
  await ctx.close();
}
