// FONEMA · trecho E2E: PASSEIO 3D em terceira pessoa (D032 item 3).
// Confere: o boneco da criança chega do app (com a camiseta escolhida) e os outros bonecos também; anda com o teclado;
// arrastar gira a câmera; espaço pula; tchau; parede não deixa passar; clique no chão = ir até lá; conversa com a Sofia
// (fala roteirizada); D034: o Coreto (antes trancado) abre para quem começa; porta aberta tem o botão "Entrar" e leva ao Cantinho da Leitura;
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
  const quadro = async (p) => { for (let i = 0; i < 300; i++) { const f = p.frames().find((x) => /mundo3d\/passeio\.html/.test(x.url())); if (f) return f; await p.waitForTimeout(200); } throw new Error('iframe do passeio não apareceu'); };
  const frame = await quadro(pg);
    await frame.waitForFunction(() => window.FONEMA_PASSEIO, null, { timeout: 120000 });
  await frame.waitForFunction(() => (window.FONEMA_RECEBIDOS || []).length >= 6, null, { timeout: 240000, polling: 1000 }).catch(async (e) => { console.log('    recebidos até agora:', await frame.evaluate(() => window.FONEMA_RECEBIDOS)); throw e; });
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
  const q = await frame.evaluate(() => ({ q: window.FONEMA_MUNDO.qualidade, fps: window.FONEMA_MUNDO.info.fps }));
  console.log(`    qualidade ${q.q}, ${q.fps.toFixed(1)} quadros/s`);
  const CLIQUE = { noWaitAfter: true, force: true, timeout: 60000 }; // a página do mundo fica ocupada desenhando; o botão "Entrar" pulsa
  const canvas = fr.locator('#palco canvas');
  await canvas.focus({ timeout: 180000 }); // a vila nova pesa: sem placa de vídeo um quadro leva segundos
  // O navegador de teste (e o CI) desenha sem placa de vídeo: ~1 quadro/s. Por isso a entrada é de verdade (teclas, mouse,
  // toque), mas o tempo do jogo avança por `simular(s)` (passos fixos, sem desenhar): o teste não depende do FPS.
  const simular = (seg, f = frame) => f.evaluate((t) => window.FONEMA_PASSEIO.simular(t), seg);
  const ate = (fn, arg, max = 45000) => frame.waitForFunction(fn, arg, { timeout: max, polling: 200 }).then(() => true, () => false);
  const dist = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
  const segurar = async (tecla, seg) => { await pg.keyboard.down(tecla); await simular(seg); await pg.keyboard.up(tecla); return pos(); };

  // esqueleto e animação de captura de movimento chegaram; andar NÃO é pular (o boneco não quica inteiro)
  const rig = await frame.evaluate(async () => { const b = window.FONEMA_PASSEIO.boneco; for (let i = 0; i < 100 && !(b.anim && window.FONEMA_PASSEIO.boneco.anim.q); i++) { window.FONEMA_PASSEIO.simular(0.05); await new Promise((r) => setTimeout(r, 100)); } return { ossos: b.rig ? Object.keys(b.rig.ossos).length : 0, captura: !!(b.anim && b.anim.q), silhueta: b.silhuetas.length }; });
  ok(rig.ossos >= 13 && rig.captura, `o boneco tem esqueleto (${rig.ossos} ossos) e animação de captura de movimento`);
  ok(rig.silhueta > 0, 'silhueta clarinha do boneco quando algo fica na frente');
  const quique = await frame.evaluate(() => { const p = window.FONEMA_PASSEIO, b = p.boneco; p.teleportar(0, 40, Math.PI); p.teclar('arrowup', true); p.simular(0.6); let a = 1e9, z = -1e9; const v = new b.raiz.position.constructor(); for (let i = 0; i < 40; i++) { p.simular(0.025); const y = b.rig.ossos.cabeca.getWorldPosition(v).y - b.raiz.position.y; a = Math.min(a, y); z = Math.max(z, y); } p.teclar('arrowup', false); p.simular(0.5); return { sobeDesce: z - a, noAr: p.posicao.noAr }; });
  ok(quique.sobeDesce < 0.08 && !quique.noAr, `andando, a cabeça sobe e desce só ${(quique.sobeDesce * 100).toFixed(1)} cm (passada, sem pulo)`);
  // nadar no rio: nunca some — a cabeça fica fora d'água; e mergulhar (Pular vira Mergulhar) desce e volta
  const agua = await frame.evaluate(() => { const p = window.FONEMA_PASSEIO, b = p.boneco, N = p.colisao.NIVEL_AGUA; p.teleportar(36, 20, Math.PI / 2); p.irPara(44, 20); const r = []; for (let i = 0; i < 28; i++) { p.simular(0.25); r.push({ nada: p.posicao.nadando, cab: b.cabecaY() - N, x: p.posicao.x }); } p.simular(1); return { r, nada: p.posicao.nadando, cab: b.cabecaY() - N, N }; });
  const nadando = agua.r.filter((x) => x.nada);
  ok(nadando.length > 2 && nadando.every((x) => x.cab > 0), `no rio o boneco nada com a cabeça fora d'água (${nadando.length} amostras, cabeça ${Math.min(...nadando.map((x) => x.cab)).toFixed(2)} m acima ou mais)`);
  ok(agua.r.every((x) => x.cab > -0.3 || !x.nada), 'nunca some na água');
  if (capturas) { await pg.waitForTimeout(800); await pg.screenshot({ path: `${capturas}/mundo3d-08-nadando.png` }); }
  await fr.getByTestId('passeio-pular').click(CLIQUE);
  const mergulho = await frame.evaluate(() => { const p = window.FONEMA_PASSEIO, b = p.boneco, N = p.colisao.NIVEL_AGUA; const m = p.posicao.mergulhando; p.simular(1.8); const fundo = b.cabecaY() - N; p.simular(4); return { m, fundo, volta: b.cabecaY() - N, ainda: p.posicao.mergulhando }; });
  ok(mergulho.m && mergulho.fundo < -0.2 && mergulho.volta > 0 && !mergulho.ainda, `Mergulhar: a cabeça desce ${(-mergulho.fundo).toFixed(2)} m e volta para respirar`);
  if (capturas) { await frame.evaluate(() => { window.FONEMA_PASSEIO.mergulhar(true); window.FONEMA_PASSEIO.simular(1.6); }); await pg.waitForTimeout(900); await pg.screenshot({ path: `${capturas}/mundo3d-09-mergulho.png` }); await frame.evaluate(() => window.FONEMA_PASSEIO.mergulhar(false)); }
  await frame.evaluate(() => { const p = window.FONEMA_PASSEIO; p.teleportar(0, 19.5, Math.PI); p.girarCamera(0 - p.camera.giro); p.simular(0.5); });

  // andar com o teclado
  const p0 = await pos();
  const p1 = await segurar('ArrowUp', 1.2);
  ok(dist(p0, p1) > 1.5, `setinha para cima anda (${dist(p0, p1).toFixed(1)} m em 1,2 s)`);
  const p2 = await segurar('d', 0.8);
  ok(dist(p1, p2) > 0.6, 'WASD também anda');

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
  await canvas.focus({ timeout: 180000 }); // a vila nova pesa: sem placa de vídeo um quadro leva segundos
  await pg.keyboard.press('Space');
  ok((await simular(0.15)).noAr, 'espaço pula');
  ok(!(await simular(1.5)).noAr, 'e o boneco volta ao chão');
  // tchau (botão grande)
  await fr.getByTestId('passeio-tchau').click(CLIQUE);
  await simular(0.2);
  ok(await ate(() => { const b = window.FONEMA_PASSEIO.boneco; if (!b.rig) return b.mao.visible; const r = b.rig.ossos; return r.antebracoD.getWorldPosition(new r.peito.position.constructor()).y > r.bracoD.getWorldPosition(new r.peito.position.constructor()).y - 0.05; }), 'Tchau: o boneco levanta o braço e acena (esqueleto de verdade)');
  if (capturas) { await pg.waitForTimeout(150); await pg.screenshot({ path: `${capturas}/mundo3d-02-tchau.png` }); }

  // parede: andando contra a escola, não atravessa
  await frame.evaluate(() => window.FONEMA_PASSEIO.teleportar(0, -17, Math.PI));
  await frame.evaluate(() => { const p = window.FONEMA_PASSEIO; const c = p.camera; p.girarCamera(0 - c.giro); });
  await simular(0.1);
  await canvas.focus({ timeout: 180000 }); // a vila nova pesa: sem placa de vídeo um quadro leva segundos
  const pz = await segurar('ArrowUp', 4); // anda até onde der
  ok(pz.z > -25.5, `a parede da escola segura o boneco (parou em z = ${pz.z.toFixed(1)})`);

  // clique no chão = ir até lá
  await frame.evaluate(() => { const p = window.FONEMA_PASSEIO; p.teleportar(0, 19.5, Math.PI); p.girarCamera(0 - p.camera.giro); });
  await simular(0.1); // a câmera encaixa atrás do boneco
  const antes = await pos();
  await pg.mouse.click(box.x + box.width * 0.35, box.y + box.height * 0.72);
  ok(await ate(() => !!window.FONEMA_PASSEIO.destino, null, 20000), 'clicar no chão marca o destino');
  const depois = await simular(3);
  ok(dist(antes, depois) > 1, `e o boneco vai sozinho até lá (${dist(antes, depois).toFixed(1)} m)`);

  // conversar com a Sofia (fala roteirizada)
  await frame.evaluate(() => { const s = window.FONEMA_PASSEIO.npcs.lista.find((n) => n.id === 'sofia').boneco.raiz.position; window.FONEMA_PASSEIO.teleportar(s.x + 1.4, s.z + 1.4); });
  await simular(0.1);
  await fr.locator('#btAcao.on').waitFor({ timeout: 20000 });
  ok(/Conversar/.test(await fr.locator('#btAcao').innerText()), 'perto da Sofia aparece o botão "Conversar"');
  await fr.locator('#btAcao').click(CLIQUE);
  await fr.locator('#cartao.aberto').waitFor();
  const txt = await fr.locator('#cartao').innerText();
  ok(/Sofia/.test(txt) && /Oi, Bia!/.test(txt) && /Missão/.test(txt), 'a Sofia diz "Oi, Bia!" (fala já gravada) e convida para a missão');
  if (capturas) { await pg.waitForTimeout(500); await pg.screenshot({ path: `${capturas}/mundo3d-03-conversa-sofia.png` }); }
  await fr.locator('#cartao button', { hasText: 'Tchau' }).click(CLIQUE);

  // D034: o Coreto não fica mais trancado: enquanto "Ler mais ligeiro" não abre, a porta leva às palmas (escuta com música)
  await frame.evaluate(() => window.FONEMA_PASSEIO.teleportar(-2.5, 9.6, Math.PI));
  await frame.evaluate(() => { const s = window.FONEMA_PASSEIO.npcs.lista.find((n) => n.id === 'sofia'); s.boneco.raiz.position.set(-3.5, 0, 14); s.espera = 30; });
  await simular(0.1);
  await fr.locator('#btAcao.on').waitFor({ timeout: 20000 });
  ok(await fr.locator('#btAcao.on.trancado').count() === 0 && /Entrar/.test(await fr.locator('#btAcao').innerText()), 'porta do Coreto aberta para quem começa (D034: nada de porta trancada; leva às palmas)');
  if (capturas) { await pg.waitForTimeout(400); await pg.screenshot({ path: `${capturas}/mundo3d-04-porta-coreto.png` }); }

  // FPS (rAF dentro do iframe, 3 s andando)
  await canvas.focus({ timeout: 180000 }); // a vila nova pesa: sem placa de vídeo um quadro leva segundos
  await pg.keyboard.down('ArrowLeft');
  const fps = await frame.evaluate(() => new Promise((r) => { let n = 0; const t0 = performance.now(); const f = () => { n++; if (performance.now() - t0 < 3000) requestAnimationFrame(f); else r(n / ((performance.now() - t0) / 1000)); }; requestAnimationFrame(f); }));
  await pg.keyboard.up('ArrowLeft');
  // sem placa de vídeo o Chromium de teste desenha por software (~1 quadro/s nesta vila); num aparelho de verdade,
  // rode com FPS_MINIMO=30 (PC) ou 20 (celular)
  const minimo = Number(process.env.FPS_MINIMO || 0.3);
  ok(fps >= minimo, `FPS andando: ${fps.toFixed(1)} quadros/s, qualidade ${await frame.evaluate(() => window.FONEMA_MUNDO.qualidade)} (mínimo aceito aqui: ${minimo})`);

  // chegar numa porta andando (ir até lá) e entrar: Biblioteca → Cantinho da Leitura
  await frame.evaluate(() => window.FONEMA_PASSEIO.teleportar(-13.6, -4.6, -Math.PI / 2));
  await frame.evaluate(() => window.FONEMA_PASSEIO.irPara(-15.4, -5));
  await simular(3);
  await fr.locator('#btAcao.on:not(.trancado)').waitFor({ timeout: 40000 });
  ok(/Entrar/.test(await fr.locator('#btAcao').innerText()) && /Biblioteca/.test(await fr.locator('#lugar').innerText()), 'na porta da Biblioteca aparece o botão grande "Entrar"');
  if (capturas) { await pg.waitForTimeout(600); await pg.screenshot({ path: `${capturas}/mundo3d-05-porta-biblioteca.png` }); }
  await fr.locator('#btAcao').click(CLIQUE);
  await simular(1).catch(() => {}); // anda até o meio da porta e entra (a página do mundo sai)
  await pg.getByTestId('biblioteca').waitFor({ timeout: 60000 });
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
  const fc = await quadro(pc);
  await fc.waitForFunction(() => window.FONEMA_PASSEIO && (window.FONEMA_RECEBIDOS || []).includes('crianca'), null, { timeout: 120000 });
  const tamanhos = await fc.evaluate(() => ['#btPular', '#btTchau'].map((s) => { const r = document.querySelector(s).getBoundingClientRect(); return Math.min(r.width, r.height); }));
  ok(tamanhos.every((t) => t >= 60), `botões grandes no celular: Pular e Tchau com ${tamanhos.map((t) => Math.round(t)).join(' e ')} px`);
  const q0 = await fc.evaluate(() => window.FONEMA_PASSEIO.posicao);
  const cdp = await cel.newCDPSession(pc);
  const toque = (type, x, y) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y, id: 1 }] });
  await toque('touchStart', 95, 690);
  for (let k = 1; k <= 6; k++) { await toque('touchMove', 95, 690 - k * 12); await pc.waitForTimeout(30); }
  await fc.waitForFunction(() => document.querySelector('#joy').classList.contains('ativo'), null, { timeout: 20000, polling: 100 }).catch(() => {});
  await simular(1.5, fc);
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
  await fc.locator('#btPular').tap({ noWaitAfter: true, timeout: 60000 });
  ok((await simular(0.15, fc)).noAr, 'botão Pular no celular');
  if (capturas) { await pc.waitForTimeout(900); await pc.screenshot({ path: `${capturas}/mundo3d-07-celular.png` }); }
  await cel.close();
}
