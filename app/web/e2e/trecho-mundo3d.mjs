// FONEMA · trecho E2E: PASSEIO 3D em terceira pessoa (D032 item 3).
// Confere: o boneco da criança chega do app (com a camiseta escolhida) e os outros bonecos também; anda com o teclado;
// arrastar gira a câmera; espaço pula; tchau; parede não deixa passar; clique no chão = ir até lá; conversa com a Sofia
// (fala roteirizada); porta trancada diz o que falta; porta aberta tem o botão "Entrar" e leva ao Cantinho da Leitura;
// FPS mínimo. No celular (390×844, toque): joystick aparece onde o dedo encosta e anda.
// Uso: node e2e/fluxo.e2e.mjs --mundo3d [--capturas-mundo3d]   (também roda dentro do E2E completo e do --sem-jornada)

/**
 * @param {import('@playwright/test').Browser} browser
 * @param {{ BASE: string, ok: (c: boolean, m: string) => void, passarPorteira: Function, cadastrar: Function, montarAvatar: Function, erros: string[], capturas?: string }} h
 */
export async function trechoMundo3d(browser, { BASE, ok, passarPorteira, cadastrar, montarAvatar, erros, capturas }) {
  console.log('M. Passeio 3D: o próprio boneco andando pela vila');
  const largo = capturas ? { width: 1850, height: 980 } : { width: 1280, height: 800 };
  const ctx = await browser.newContext({ viewport: largo, locale: 'pt-BR', serviceWorkers: 'block' });
  await ctx.addInitScript(() => { try { localStorage.setItem('fonema-teste-rapido', '1'); } catch { /* sem armazenamento */ } });
  const pg = await ctx.newPage();
  pg.on('pageerror', (e) => erros.push(String(e)));
  pg.on('console', (m) => { if (/passeio|npcs|avatar3d|glb/.test(m.text())) console.log(`    [console ${m.type()}] ${m.text().slice(0, 240)}`); });
  await pg.goto(BASE + '#/adulto/cadastro');
  await passarPorteira(pg);
  await cadastrar(pg, 'Bia', 'f');
  await montarAvatar(pg, { camisa: 'ipe' });
  await pg.waitForFunction(() => location.hash.includes('/c/'));
  const id = pg.url().split('/c/')[1].split('/')[0];

  // entra pelo botão "Passear 3D" do "Mais"
  await pg.goto(BASE + `#/c/${id}/vila`);
  await pg.getByTestId('ir-mais').click();
  await pg.locator('[data-ponto="mundo3d"]').click();
  await pg.getByTestId('passeio3d').waitFor();
  const fr = pg.frameLocator('[data-testid="passeio3d-iframe"]');
  const frame = await (await pg.getByTestId('passeio3d-iframe').elementHandle()).contentFrame();
  frame.on?.('pageerror', (e) => erros.push(String(e)));
  await frame.waitForFunction(() => window.FONEMA_PASSEIO, null, { timeout: 120000 });
  await frame.waitForFunction(() => (window.FONEMA_RECEBIDOS || []).length >= 6, null, { timeout: 60000 }).catch(async (e) => { console.log('    recebidos até agora:', await frame.evaluate(() => window.FONEMA_RECEBIDOS)); throw e; });
  const recebidos = await frame.evaluate(() => window.FONEMA_RECEBIDOS);
  ok(recebidos.includes('crianca') && ['sofia', 'tales', 'bolota', 'crianca-1', 'crianca-2'].every((x) => recebidos.includes(x)), `o app mandou o boneco da criança e os outros 5 bonecos (${recebidos.join(', ')})`);
  // a camiseta amarela escolhida está na textura do boneco (amostra da cor média da textura do avatar)
  const amarelo = await frame.evaluate(() => {
    const p = window.FONEMA_PASSEIO, raiz = p.npcs && window.FONEMA_MUNDO.scene.getObjectByName('boneco-crianca');
    let px = 0;
    raiz.traverse((o) => { if (o.isMesh && o.material.map && o.material.map.image) { const im = o.material.map.image; const c = document.createElement('canvas'); c.width = 64; c.height = 64; const g = c.getContext('2d'); g.drawImage(im, 0, 0, 64, 64); const d = g.getImageData(0, 0, 64, 64).data; for (let i = 0; i < d.length; i += 4) if (d[i] > 200 && d[i + 1] > 140 && d[i + 1] < 210 && d[i + 2] < 110) px++; } });
    return px;
  });
  ok(amarelo > 40, `o boneco no mundo é o da criança, com a camiseta amarela escolhida (${amarelo} texels amarelos)`);
  if (capturas) { await pg.waitForTimeout(1500); await pg.screenshot({ path: `${capturas}/mundo3d-01-chegada.png` }); }

  const pos = () => frame.evaluate(() => window.FONEMA_PASSEIO.posicao);
  const canvas = fr.locator('#palco canvas');
  await canvas.focus();

  // andar com o teclado (setinha para cima por 1,5 s)
  const p0 = await pos();
  await pg.keyboard.down('ArrowUp'); await pg.waitForTimeout(1500); await pg.keyboard.up('ArrowUp');
  const p1 = await pos();
  ok(Math.hypot(p1.x - p0.x, p1.z - p0.z) > 1.5, `setinha anda (${Math.hypot(p1.x - p0.x, p1.z - p0.z).toFixed(1)} m)`);
  await pg.keyboard.down('d'); await pg.waitForTimeout(700); await pg.keyboard.up('d');
  const p1b = await pos();
  ok(Math.hypot(p1b.x - p1.x, p1b.z - p1.z) > 0.6, 'WASD também anda');

  // girar a câmera arrastando o mouse
  const g0 = await frame.evaluate(() => window.FONEMA_PASSEIO.camera.giro);
  const box = await pg.getByTestId('passeio3d-iframe').boundingBox();
  await pg.mouse.move(box.x + box.width * 0.6, box.y + box.height * 0.5);
  await pg.mouse.down(); await pg.mouse.move(box.x + box.width * 0.6 + 220, box.y + box.height * 0.5, { steps: 8 }); await pg.mouse.up();
  const g1 = await frame.evaluate(() => window.FONEMA_PASSEIO.camera.giro);
  ok(Math.abs(g1 - g0) > 0.5, `arrastar o mouse gira a câmera (${(g1 - g0).toFixed(2)} rad)`);
  // roda = zoom
  const d0 = await frame.evaluate(() => window.FONEMA_PASSEIO.camera.dist);
  await pg.mouse.wheel(0, 400); await pg.waitForTimeout(200);
  ok((await frame.evaluate(() => window.FONEMA_PASSEIO.camera.dist)) > d0, 'a roda do mouse afasta a câmera');

  // pular (espaço)
  await canvas.focus();
  await pg.keyboard.press('Space');
  await pg.waitForTimeout(120);
  const noAr = await frame.evaluate(() => window.FONEMA_PASSEIO.posicao.noAr);
  ok(noAr, 'espaço pula');
  await pg.waitForTimeout(800);
  ok(!(await frame.evaluate(() => window.FONEMA_PASSEIO.posicao.noAr)), 'e o boneco volta ao chão');
  // tchau (botão grande)
  await fr.getByTestId('passeio-tchau').click();
  await pg.waitForTimeout(250);
  ok(await frame.evaluate(() => window.FONEMA_MUNDO.scene.getObjectByName('boneco-crianca').children.some((c) => c.isSprite && c.visible)), 'Tchau: o boneco acena (mãozinha aparece)');
  if (capturas) { await pg.waitForTimeout(150); await pg.screenshot({ path: `${capturas}/mundo3d-02-tchau.png` }); }

  // parede: andando contra a escola, não atravessa
  await frame.evaluate(() => window.FONEMA_PASSEIO.teleportar(0, -17, Math.PI));
  await frame.evaluate(() => { const p = window.FONEMA_PASSEIO; const c = p.camera; p.girarCamera(0 - c.giro); });
  await pg.waitForTimeout(200);
  await pg.keyboard.down('ArrowUp'); await pg.waitForTimeout(2500); await pg.keyboard.up('ArrowUp');
  const pz = await pos();
  ok(pz.z > -25.5, `a parede da escola segura o boneco (parou em z = ${pz.z.toFixed(1)})`);

  // clique no chão = ir até lá
  await frame.evaluate(() => window.FONEMA_PASSEIO.teleportar(0, 19.5, Math.PI));
  await pg.waitForTimeout(400);
  const antes = await pos();
  await pg.mouse.click(box.x + box.width * 0.35, box.y + box.height * 0.72);
  await pg.waitForTimeout(1800);
  const depois = await pos();
  ok(Math.hypot(depois.x - antes.x, depois.z - antes.z) > 1, `clicar no chão leva o boneco até lá (${Math.hypot(depois.x - antes.x, depois.z - antes.z).toFixed(1)} m)`);

  // conversar com a Sofia (fala roteirizada)
  await frame.evaluate(() => { const s = window.FONEMA_PASSEIO.npcs.lista.find((n) => n.id === 'sofia').boneco.raiz.position; window.FONEMA_PASSEIO.teleportar(s.x + 1.4, s.z + 1.4); });
  await fr.locator('#btAcao.on').waitFor({ timeout: 5000 });
  ok(/Conversar/.test(await fr.locator('#btAcao').innerText()), 'perto da Sofia aparece o botão "Conversar"');
  await fr.locator('#btAcao').click();
  await fr.locator('#cartao.aberto').waitFor();
  const txt = await fr.locator('#cartao').innerText();
  ok(/Sofia/.test(txt) && /Oi, Bia!/.test(txt) && /Missão/.test(txt), 'a Sofia diz "Oi, Bia!" (fala já gravada) e convida para a missão');
  if (capturas) { await pg.waitForTimeout(500); await pg.screenshot({ path: `${capturas}/mundo3d-03-conversa-sofia.png` }); }
  await fr.locator('#cartao button', { hasText: 'Tchau' }).click();

  // porta trancada (Coreto: "Ler mais ligeiro" ainda não abriu para quem começa)
  await frame.evaluate(() => window.FONEMA_PASSEIO.teleportar(-2.5, 9.6, Math.PI));
  await frame.evaluate(() => { const s = window.FONEMA_PASSEIO.npcs.lista.find((n) => n.id === 'sofia'); s.boneco.raiz.position.set(-3.5, 0, 14); s.espera = 30; });
  await fr.locator('#btAcao.on.trancado').waitFor({ timeout: 6000 });
  await fr.locator('#btAcao').click();
  await fr.locator('#cartao.aberto').waitFor();
  ok(/trancado/.test(await fr.locator('#cartao').innerText()) && /palavras/.test(await fr.locator('#cartao').innerText()), 'porta trancada: cadeado e o que falta ("…ler mais palavras")');
  if (capturas) { await pg.waitForTimeout(400); await pg.screenshot({ path: `${capturas}/mundo3d-04-porta-trancada.png` }); }
  await fr.locator('#cartao button', { hasText: 'Ok' }).click();

  // FPS (rAF dentro do iframe, 3 s andando)
  await canvas.focus();
  await pg.keyboard.down('ArrowLeft');
  const fps = await frame.evaluate(() => new Promise((r) => { let n = 0; const t0 = performance.now(); const f = () => { n++; if (performance.now() - t0 < 3000) requestAnimationFrame(f); else r(n / ((performance.now() - t0) / 1000)); }; requestAnimationFrame(f); }));
  await pg.keyboard.up('ArrowLeft');
  const minimo = Number(process.env.FPS_MINIMO || 6);
  ok(fps >= minimo, `FPS andando: ${fps.toFixed(1)} (mínimo aceito aqui: ${minimo}; navegador de teste sem placa de vídeo)`);

  // chegar numa porta andando (ir até lá) e entrar: Biblioteca → Cantinho da Leitura
  await frame.evaluate(() => window.FONEMA_PASSEIO.teleportar(-10.5, -4.5, -Math.PI / 2));
  await frame.evaluate(() => window.FONEMA_PASSEIO.irPara(-15.4, -5));
  await fr.locator('#btAcao.on:not(.trancado)').waitFor({ timeout: 8000 });
  ok(/Entrar/.test(await fr.locator('#btAcao').innerText()) && /Biblioteca/.test(await fr.locator('#lugar').innerText()), 'na porta da Biblioteca aparece o botão grande "Entrar"');
  if (capturas) { await pg.waitForTimeout(600); await pg.screenshot({ path: `${capturas}/mundo3d-05-porta-biblioteca.png` }); }
  await fr.locator('#btAcao').click();
  await pg.getByTestId('biblioteca').waitFor({ timeout: 10000 });
  ok(pg.url().endsWith(`/c/${id}/leitura`), 'Entrar leva ao Cantinho da Leitura');
  await ctx.close();

  // ---------- celular (toque): joystick ----------
  const cel = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'pt-BR', serviceWorkers: 'block' });
  await cel.addInitScript(() => { try { localStorage.setItem('fonema-teste-rapido', '1'); } catch { /* sem armazenamento */ } });
  const pc = await cel.newPage();
  pc.on('pageerror', (e) => erros.push(String(e)));
  await pc.goto(BASE + '#/adulto/cadastro');
  await passarPorteira(pc);
  await cadastrar(pc, 'Rui', 'm');
  await montarAvatar(pc, { camisa: 'ceu' });
  await pc.waitForFunction(() => location.hash.includes('/c/'));
  const idc = pc.url().split('/c/')[1].split('/')[0];
  await pc.goto(BASE + `#/c/${idc}/mundo`);
  await pc.getByTestId('passeio3d').waitFor();
  const fc = await (await pc.getByTestId('passeio3d-iframe').elementHandle()).contentFrame();
  await fc.waitForFunction(() => window.FONEMA_PASSEIO && (window.FONEMA_RECEBIDOS || []).includes('crianca'), null, { timeout: 120000 });
  const tamanhos = await fc.evaluate(() => ['#btPular', '#btTchau'].map((s) => { const r = document.querySelector(s).getBoundingClientRect(); return Math.min(r.width, r.height); }));
  ok(tamanhos.every((t) => t >= 60), `botões grandes no celular: Pular e Tchau com ${tamanhos.map((t) => Math.round(t)).join(' e ')} px`);
  const q0 = await fc.evaluate(() => window.FONEMA_PASSEIO.posicao);
  const cdp = await cel.newCDPSession(pc);
  const toque = (type, x, y) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y, id: 1 }] });
  await toque('touchStart', 95, 690);
  for (let k = 1; k <= 6; k++) { await toque('touchMove', 95, 690 - k * 12); await pc.waitForTimeout(30); }
  await pc.waitForTimeout(1300);
  ok(await fc.evaluate(() => document.querySelector('#joy').classList.contains('ativo')), 'o joystick aparece onde o dedo encosta (lado esquerdo)');
  if (capturas) await pc.screenshot({ path: `${capturas}/mundo3d-06-celular-joystick.png` });
  await toque('touchEnd');
  const q1 = await fc.evaluate(() => window.FONEMA_PASSEIO.posicao);
  ok(Math.hypot(q1.x - q0.x, q1.z - q0.z) > 1, `arrastar o dedo à esquerda anda (${Math.hypot(q1.x - q0.x, q1.z - q0.z).toFixed(1)} m)`);
  // dedo à direita gira a câmera
  const c0 = await fc.evaluate(() => window.FONEMA_PASSEIO.camera.giro);
  await toque('touchStart', 300, 420);
  for (let k = 1; k <= 6; k++) { await toque('touchMove', 300 - k * 18, 420); await pc.waitForTimeout(20); }
  await toque('touchEnd');
  ok(Math.abs((await fc.evaluate(() => window.FONEMA_PASSEIO.camera.giro)) - c0) > 0.3, 'arrastar o dedo à direita gira a câmera');
  await fc.locator('#btPular').tap();
  await pc.waitForTimeout(100);
  ok(await fc.evaluate(() => window.FONEMA_PASSEIO.posicao.noAr), 'botão Pular no celular');
  if (capturas) { await pc.waitForTimeout(900); await pc.screenshot({ path: `${capturas}/mundo3d-07-celular.png` }); }
  await cel.close();
}
