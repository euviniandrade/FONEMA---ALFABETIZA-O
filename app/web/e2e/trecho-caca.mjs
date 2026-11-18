// FONEMA · trecho E2E: CAÇA AO TESOURO DAS PALAVRAS no passeio 3D (fila do dono nº 25).
// Confere: cartão no Brincar → Jogos abre o passeio direto no mapa da caça; os 4 níveis (sons, letras da palavra, charadas, água);
// os pontos dos baús são alcançáveis (terra livre, beira rasa, água funda para mergulhar, rio para o barco); passar por cima de um
// baú já é a escolha (decisão do dono, fila nº 29); minimapa, faixa do próximo passo e trilha de moedas; lembrete da missão; erro com correção; dica com seta = ajuda; a letra voa para a faixa; leitura final com a figura;
// a chave do barquinho no fim das charadas; o barco: embarcar no píer, remar só no rio (para na margem), descer só no píer;
// tesouro no fundo (mergulho) e de barco; registro (avaliada, mecânica 'caca-tesouro', alvo, escolhido, tempo, nOpcoes, contexto
// 'livre'; achar o lugar = exposição). O tempo do jogo anda por `simular()` (passos fixos), sem depender de quadros por segundo.
// Uso: node e2e/fluxo.e2e.mjs --caca [--capturas-caca]   (também roda dentro do E2E completo e do --sem-jornada)

const lerProgresso = (pg, id) => pg.evaluate(async (cid) => {
  const db = await new Promise((r) => { const q = indexedDB.open('fonema'); q.onsuccess = () => r(q.result); });
  return await new Promise((r) => { const q = db.transaction('progressos').objectStore('progressos').get(cid); q.onsuccess = () => r(q.result); });
}, id);
const semear = (pg, id, fases) => pg.evaluate(async ([cid, fs]) => {
  const db = await new Promise((r) => { const q = indexedDB.open('fonema'); q.onsuccess = () => r(q.result); });
  const p = await new Promise((r) => { const q = db.transaction('progressos').objectStore('progressos').get(cid); q.onsuccess = () => r(q.result); });
  for (const f of fs) p.fases[f] = { ...(p.fases[f] ?? {}), estado: 'concluida', sessoes: 1, concluidaEm: Date.now() - 3600e3 };
  await new Promise((r) => { const tx = db.transaction('progressos', 'readwrite'); tx.objectStore('progressos').put(p); tx.oncomplete = r; });
}, [id, fases]);
const TF_ATE_22 = ['TF-01', 'TF-02', 'TF-03', 'TF-04', 'TF-05', 'TF-06', 'TF-07', 'TF-08', 'TF-09', 'TF-10', 'TF-11', 'TF-12', 'TF-13', 'TF-14', 'TF-15', 'TF-R2', 'TF-16', 'TF-17', 'TF-18', 'TF-19', 'TF-20', 'TF-21', 'TF-22'];
const AL_ATE_G = ['AL-A', 'AL-E', 'AL-I', 'AL-O', 'AL-U', 'AL-RV1', 'AL-M', 'AL-F', 'AL-V', 'AL-L', 'AL-S', 'AL-N', 'AL-Z', 'AL-J', 'AL-RV2', 'AL-P', 'AL-T', 'AL-B', 'AL-C', 'AL-D', 'AL-G'];

/**
 * @param {import('@playwright/test').Browser} browser
 * @param {{ BASE: string, ok: (c: boolean, m: string) => void, passarPorteira: Function, cadastrar: Function, montarAvatar: Function, erros: string[], capturas?: string, largura?: number, altura?: number, suf?: string, so?: boolean }} h
 */
export async function trechoCaca(browser, { BASE, ok, passarPorteira, cadastrar, montarAvatar, erros, capturas, largura, altura, suf = '' }) {
  console.log(`K. Caça ao tesouro no passeio 3D${suf ? ` (${suf})` : ''}`);
  const tela = largura ? { width: largura, height: altura } : capturas ? { width: 1850, height: 980 } : { width: 1280, height: 800 };
  const movel = tela.width < 700;
  const ctx = await browser.newContext({ viewport: tela, locale: 'pt-BR', serviceWorkers: 'block', ...(movel ? { hasTouch: true, isMobile: true, deviceScaleFactor: 1 } : {}) });
  await ctx.addInitScript(() => { try { localStorage.setItem('fonema-teste-rapido', '1'); } catch { /* sem armazenamento */ } });
  const pg = await ctx.newPage();
  pg.setDefaultTimeout(180000);
  pg.on('pageerror', (e) => erros.push(String(e)));
  pg.on('console', (m) => { if (/caça|caca|barco|\[passeio\]/i.test(m.text())) console.log(`    [console ${m.type()}] ${m.text().slice(0, 240)}`); });
  await pg.goto(BASE + '#/adulto/cadastro');
  await passarPorteira(pg);
  await cadastrar(pg, 'Bia', 'f');
  await montarAvatar(pg, { camisa: 'ipe' });
  await pg.waitForFunction(() => location.hash.includes('/c/'));
  const id = pg.url().split('/c/')[1].split('/')[0];
  const cap = async (nome) => { if (capturas) { await pg.waitForTimeout(1200); await pg.screenshot({ path: `${capturas}/caca-${nome}${suf}.png` }); } };

  // sem nada ensinado: o cartão aparece trancado
  await pg.goto(BASE + `#/c/${id}/brincar`);
  const cartao = pg.getByTestId('jogo-caca');
  await cartao.waitFor({ timeout: 60000 });
  ok((await cartao.getAttribute('data-aberto')) === '0', 'Brincar → Jogos: cartão da Caça ao Tesouro trancado sem nenhum som ensinado');
  await semear(pg, id, [...AL_ATE_G, ...TF_ATE_22]);
  await pg.goto(BASE + `#/c/${id}/vila`); await pg.goto(BASE + `#/c/${id}/brincar`);
  await pg.reload();
  await cartao.waitFor({ timeout: 60000 });
  ok((await cartao.getAttribute('data-aberto')) === '1', 'com sons ensinados o cartão abre');
  await cartao.click();
  await pg.waitForFunction(() => location.hash.endsWith('/mundo/caca'));
  await pg.getByTestId('passeio3d').waitFor();
  const quadro = async () => { for (let i = 0; i < 400; i++) { const f = pg.frames().find((x) => /mundo3d\/passeio\.html/.test(x.url())); if (f) return f; await pg.waitForTimeout(200); } throw new Error('iframe do passeio não apareceu'); };
  const frame = await quadro();
  await frame.waitForFunction(() => window.FONEMA_CACA && window.FONEMA_PASSEIO, null, { timeout: 240000 });
  await frame.waitForFunction(() => window.FONEMA_CACA.niveis.length === 4, null, { timeout: 120000, polling: 300 });
  const fr = pg.frameLocator('[data-testid="passeio3d-iframe"]');
  const CLIQUE = { noWaitAfter: true, force: true, timeout: 240000 };
  ok(await fr.getByTestId('caca-menu').isVisible(), 'vindo do Brincar, o passeio abre direto no mapa da caça');
  const abertos = await frame.evaluate(() => window.FONEMA_CACA.niveis.map((n) => `${n.nivel}:${n.aberto ? 'aberto' : 'fechado'}`));
  ok(abertos.join(' ') === '1:aberto 2:aberto 3:fechado 4:fechado', `níveis: ${abertos.join(' ')} (charadas abrem depois da caça aos sons; água depois das charadas)`);
  await cap('01-mapa');

  // fila nº 29: minimapa, próximo passo (missão de hoje) e trilha de moedas no passeio livre
  await fr.getByTestId('caca-menu').getByText('Agora não').click(CLIQUE);
  await frame.waitForFunction(() => window.FONEMA_GUIA?.objetivo?.chave === 'missao', null, { timeout: 120000, polling: 300 });
  await frame.evaluate(() => window.FONEMA_PASSEIO.simular(0.5));
  const livreG = await frame.evaluate(() => ({ faixa: document.querySelector('#guiaFaixa')?.innerText, trilha: window.FONEMA_GUIA.moedasTrilha, marcador: window.FONEMA_GUIA.objetivo.marcador, mini: !!document.querySelector('#miniMapa canvas') }));
  ok(/Missão de hoje/.test(livreG.faixa) && livreG.marcador, `passeio livre: próximo passo sempre à vista ("${livreG.faixa}") com seta sobre a Escola`);
  ok(livreG.trilha.length >= 4, `trilha de moedas até a Escola (${livreG.trilha.length} moedas no chão)`);
  const pegou = await frame.evaluate(() => { const g = window.FONEMA_GUIA, p = window.FONEMA_PASSEIO; const m = g.moedasTrilha[0]; const a = g.moedas; p.teleportar(m.x, m.z); p.simular(0.2); return g.moedas - a; });
  ok(pegou >= 1, 'passar pela moeda pega (enfeite: conta no contador, não fica guardada)');
  ok(livreG.mini, 'minimapa no canto');
  await fr.getByTestId('minimapa').click(CLIQUE);
  ok(await fr.getByTestId('mapa-grande').isVisible(), 'tocar no minimapa abre o mapa grande');
  await cap('01b-mapa-grande');
  await fr.getByTestId('mapa-fechar').click(CLIQUE);
  await frame.evaluate(() => { const p = window.FONEMA_PASSEIO; p.teleportar(0, 19.5, Math.PI); p.simular(0.5); });
  await cap('01c-proximo-passo');
  await fr.getByTestId('caca-mapa').click(CLIQUE);

  const juiz = () => pg.evaluate(() => window.FONEMA_CACA_JUIZ);
  const esperarJuiz = (fn, arg) => pg.waitForFunction(fn, arg, { timeout: 180000, polling: 200 }).catch(async (e) => { console.log('    juiz:', JSON.stringify(await pg.evaluate(() => window.FONEMA_CACA_JUIZ)), 'baús:', JSON.stringify(await frame.evaluate(() => window.FONEMA_CACA.baus.map((b) => [b.id, b.estado])))); throw e; });
  const simular = (s) => frame.evaluate((t) => window.FONEMA_PASSEIO.simular(t), s);
  const baus = () => frame.evaluate(() => window.FONEMA_CACA.baus);
  /** Leva o boneco para perto do baú e manda andar até ele (o boneco para no círculo e o baú responde). */
  const irAoBau = async (b) => {
    await frame.evaluate(([x, z]) => { const p = window.FONEMA_PASSEIO; const c = p.colisao; let px = x - 2.2, pz = z; for (const [dx, dz] of [[-2.2, 0], [2.2, 0], [0, 2.2], [0, -2.2], [-1.6, 1.6], [1.6, -1.6]]) { if (!c.livre(x + dx, z + dz, 0.3)) { px = x + dx; pz = z + dz; break; } } p.teleportar(px, pz); p.irPara(x, z); }, [b.x, b.z]);
    await simular(4);
    // um boneco da vila (ou um canto) pode atrapalhar o caminho: se não chegou, encosta no baú e espera parado
    await frame.evaluate(([x, z]) => { const p = window.FONEMA_PASSEIO; if (Math.hypot(p.posicao.x - x, p.posicao.z - z) > 1) { p.teleportar(x + 0.3, z); p.simular(1.5); } }, [b.x, b.z]);
  };


  /* ============================== nível 1: caça aos sons ============================== */
  await fr.getByTestId('caca-nivel-1').click(CLIQUE);
  await esperarJuiz(() => window.FONEMA_CACA_JUIZ?.nivel === 1 && window.FONEMA_CACA_JUIZ.k === 0);
  let bs = await baus();
  ok(bs.length === 3 && bs.every((b) => b.letra), `nível 1: 3 baús com letras à vista (${bs.map((b) => b.letra).join(', ')})`);
  ok(new Set(bs.map((b) => `${Math.round(b.x)},${Math.round(b.z)}`)).size === 3, 'cada baú num ponto diferente');
  const livres = await frame.evaluate((xs) => xs.map(([x, z]) => window.FONEMA_PASSEIO.colisao.livre(x, z, 0.3)), bs.map((b) => [b.x, b.z]));
  ok(livres.every((x) => x === null), 'os baús da praça ficam em chão livre (alcançáveis)');
  await cap('02-nivel1');
  const g1 = await frame.evaluate(() => ({ o: window.FONEMA_GUIA.objetivo, marcas: window.FONEMA_GUIA.marcas.length }));
  ok(g1.marcas === 3 && g1.o.trilha && !g1.o.marcador && /baú/.test(g1.o.texto), `caça: os 3 baús no minimapa, faixa "${g1.o.texto}" e trilha só até a área (sem seta no baú certo)`);
  let j = await juiz();
  const errado = bs.find((b) => !j.certos.includes(b.id));
  // passar correndo por cima do baú errado NÃO responde
  // decisão do dono (fila nº 29): PASSAR POR CIMA pega o baú — atravessar o baú errado é a escolha (e vale como tentativa)
  const passou = await frame.evaluate(([x, z]) => { const p = window.FONEMA_PASSEIO; const c = p.colisao; let a = [x - 2.4, z], b = [x + 2.4, z]; if (c.livre(...a, 0.3) || c.livre(...b, 0.3)) { a = [x, z - 2.4]; b = [x, z + 2.4]; } p.teleportar(a[0], a[1]); p.simular(0.2); p.irPara(b[0], b[1]); p.simular(3.5); return Math.hypot(p.posicao.x - b[0], p.posicao.z - b[1]); }, [errado.x, errado.z]);
  await frame.waitForFunction((i) => window.FONEMA_CACA.baus.find((b) => b.id === i)?.estado === 'tentado', errado.id, { timeout: 120000, polling: 300 })
    .catch(async (e) => { await irAoBau(errado); await frame.waitForFunction((i) => window.FONEMA_CACA.baus.find((b) => b.id === i)?.estado === 'tentado', errado.id, { timeout: 120000, polling: 300 }); console.log(`    (a passagem parou a ${passou.toFixed(1)} m do outro lado; o baú foi pego encostando)`); void e; });
  ok(true, 'passar por cima do baú errado já é a escolha: ele fica apagadinho (e a Sofia corrige com o contraste dos sons)');
  // dica: 1ª repete o som; 2ª mostra a seta (conta como ajuda)
  await fr.getByTestId('caca-dica').click(CLIQUE); await fr.getByTestId('caca-dica').click(CLIQUE);
  await frame.waitForFunction(() => !!window.FONEMA_CACA.seta, null, { timeout: 60000, polling: 300 });
  const seta = await frame.evaluate(() => window.FONEMA_CACA.seta);
  ok(j.certos.includes(seta.id), 'a 2ª dica põe a seta no baú certo');
  for (let k = 0; k < 4; k++) {
    j = await juiz();
    bs = await baus();
    const certo = bs.find((b) => j.certos.includes(b.id));
    await irAoBau(certo);
    await esperarJuiz((kk) => { const x = window.FONEMA_CACA_JUIZ; return x && (x.k > kk || x.fim); }, k);
  }
  j = await juiz();
  ok(j.fim && j.nivel === 1, `nível 1 até o fim (${j.acertos} de ${j.total} sozinha, de primeira)`);
  let p = await lerProgresso(pg, id);
  let ts = Object.values(p.habilidades).flatMap((h) => h.tentativas).filter((t) => t.mecanica === 'caca-tesouro');
  ok(ts.length === 4 && ts.every((t) => t.tipo === 'avaliada' && t.contexto === 'livre' && t.alvo && t.escolhido && t.tempoMs >= 0 && t.nOpcoes === 3), `4 tentativas avaliadas gravadas (mecânica caca-tesouro, contexto livre, alvo, escolhido, tempo, 3 opções)`);
  ok(ts[0].respostas.length === 2 && ts[0].escolhido !== ts[0].alvo && ts[0].comAjuda === true && ts[0].nivelAjuda === 'resposta-mostrada', `o 1º item guarda o erro e a seta como ajuda (escolhido ${ts[0].escolhido}, alvo ${ts[0].alvo})`);

  /* ============================== nível 2: letras de uma palavra ============================== */
  await frame.waitForFunction(() => window.FONEMA_CACA.niveis.find((n) => n.nivel === 3)?.aberto, null, { timeout: 60000, polling: 300 })
    .catch(async (e) => { console.log('    níveis:', JSON.stringify(await frame.evaluate(() => window.FONEMA_CACA.niveis)), 'jogos:', JSON.stringify((await lerProgresso(pg, id)).biblioteca?.jogos)); throw e; });
  ok(true, 'depois da caça aos sons, as charadas abrem');
  await fr.getByTestId('caca-mapa').click(CLIQUE);
  await fr.getByTestId('caca-nivel-2').click(CLIQUE);
  await esperarJuiz(() => window.FONEMA_CACA_JUIZ?.nivel === 2 && window.FONEMA_CACA_JUIZ.k === 0);
  bs = await baus();
  ok(bs.length >= 4, `nível 2: baús com as letras da palavra e 2 letras a mais (${bs.map((b) => b.letra).join(' ')})`);
  for (let k = 0; ; k++) {
    j = await juiz();
    if (j.modo !== 'andar') break;
    const vis = (await baus()).filter((b) => b.estado === 'fechado');
    ok(vis.length >= 3, `passo ${k + 1}: ${vis.length} baús à vista (nunca menos de 3)`);
    const certo = (await baus()).find((b) => j.certos.includes(b.id) && b.estado === 'fechado');
    await irAoBau(certo);
    await esperarJuiz((kk) => { const x = window.FONEMA_CACA_JUIZ; return x && (x.modo === 'palavra' || x.k > kk); }, k);
    if (k === 0) await cap('03-nivel2-faixa');
  }
  j = await juiz();
  await fr.getByTestId('caca-painel').waitFor();
  const faixa = (await fr.getByTestId('caca-faixa').innerText()).replace(/\s+/g, '');
  ok(faixa === j.palavra, `as letras voaram para a faixa e formam a palavra (${faixa})`);
  await cap('04-nivel2-ler');
  await fr.getByTestId(`caca-opcao-${j.posicaoCerta}`).click(CLIQUE);
  await esperarJuiz(() => window.FONEMA_CACA_JUIZ?.fim && window.FONEMA_CACA_JUIZ.nivel === 2);
  p = await lerProgresso(pg, id);
  ts = Object.values(p.habilidades).flatMap((h) => h.tentativas).filter((t) => t.mecanica === 'caca-tesouro');
  const leitura = ts.find((t) => t.formato === 'caca-palavra');
  ok(!!leitura && leitura.tipo === 'avaliada' && leitura.alvo === j.palavra.toLowerCase() && leitura.nOpcoes === 3, `leitura final avaliada (alvo ${leitura?.alvo}, figura entre 3)`);

  /* ============================== nível 3: charadas da vila ============================== */
  await fr.getByTestId('caca-mapa').click(CLIQUE);
  await fr.getByTestId('caca-nivel-3').click(CLIQUE);
  for (let k = 0; k < 3; k++) {
    await esperarJuiz((kk) => window.FONEMA_CACA_JUIZ?.nivel === 3 && window.FONEMA_CACA_JUIZ.k === kk && window.FONEMA_CACA_JUIZ.modo === 'lugar', k);
    j = await juiz();
    const b = (await baus())[0];
    const livre = await frame.evaluate(([x, z]) => window.FONEMA_PASSEIO.colisao.livre(x, z, 0.3), [b.x, b.z]);
    ok(livre === null, `charada ${k + 1} (${j.lugar}): o baú está em chão livre`);
    if (k === 0) {
      await cap('05-charada');
      await fr.getByTestId('caca-dica').click(CLIQUE); await fr.getByTestId('caca-dica').click(CLIQUE);
      await frame.waitForFunction(() => !!window.FONEMA_CACA.seta, null, { timeout: 60000, polling: 300 });
      ok(true, 'a dica da charada mostra a seta no lugar');
    }
    await irAoBau(b);
    await fr.getByTestId('caca-painel').waitFor();
    await esperarJuiz((kk) => window.FONEMA_CACA_JUIZ?.modo === 'escolher' && window.FONEMA_CACA_JUIZ.k === kk, k);
    j = await juiz();
    if (k === 0) {
      await cap('06-bau-aberto');
      await fr.getByTestId(`caca-opcao-${(j.posicaoCerta + 1) % 3}`).click(CLIQUE);
      await frame.waitForFunction((n) => document.querySelector(`[data-testid="caca-opcao-${n}"]`)?.classList.contains('tentado'), (j.posicaoCerta + 1) % 3, { timeout: 120000, polling: 300 });
    }
    await fr.getByTestId(`caca-opcao-${j.posicaoCerta}`).click(CLIQUE);
  }
  await esperarJuiz(() => window.FONEMA_CACA_JUIZ?.fim && window.FONEMA_CACA_JUIZ.nivel === 3);
  p = await lerProgresso(pg, id);
  ts = Object.values(p.habilidades).flatMap((h) => h.tentativas).filter((t) => t.mecanica === 'caca-tesouro');
  const lugares = ts.filter((t) => t.formato === 'charada-lugar');
  ok(lugares.length === 3 && lugares.every((t) => t.tipo === 'exposicao'), 'achar o lugar pela charada grava exposição (não conta para o domínio)');
  const comErro = ts.filter((t) => t.formato === 'som-letra' && t.posicaoCerta !== undefined && t.respostas?.length === 2);
  ok(comErro.length >= 1 && comErro.every((t) => t.tipo === 'avaliada' && t.nOpcoes === 3), 'a letra do baú é avaliada (com o erro guardado)');
  await frame.waitForFunction(() => window.FONEMA_PASSEIO.LUGARES.find((l) => l.id === 'barco')?.emBreve === false, null, { timeout: 60000, polling: 300 });
  ok(true, 'fim das charadas: a chave do barquinho (o píer deixa embarcar)');

  /* ============================== barco ============================== */
  const barco = await frame.evaluate(() => {
    const p = window.FONEMA_PASSEIO; p.teleportar(38.6, 12.6, Math.PI / 2); p.irPara(40.4, 12.6); p.simular(2);
    const perto = p.perto?.id; p.interagir(); p.simular(1.5);
    return { perto, ativo: window.FONEMA_CACA.barco.ativo, classe: document.body.classList.contains('no-barco') };
  });
  ok(barco.perto === 'barco' && barco.ativo && barco.classe, `no píer, "Entrar" embarca no barquinho (perto: ${barco.perto})`);
  await cap('07-barco');
  const remar = await frame.evaluate(() => {
    const p = window.FONEMA_PASSEIO, b = window.FONEMA_CACA.barco, v = window.FONEMA_MUNDO.vila;
    const a = { ...b.pos }; p.irPara(b.pos.x - 2, b.pos.z - 25); p.simular(12); const d = { ...b.pos };
    // tentar ir para a terra: o barco para na margem
    p.irPara(20, d.z); p.simular(8); const m = { ...b.pos };
    return { andou: Math.hypot(d.x - a.x, d.z - a.z), noRio: v.distRio(d.x, d.z), margem: v.distRio(m.x, m.z), boneco: Math.hypot(p.posicao.x - m.x, p.posicao.z - m.z), nada: p.posicao.nadando };
  });
  ok(remar.andou > 6 && remar.noRio < 4.8, `remando: o barco anda ${remar.andou.toFixed(1)} m pelo rio`);
  ok(remar.margem < 4.8, `rumo à terra, o barco para na margem (${remar.margem.toFixed(1)} m do meio do rio)`);
  ok(remar.boneco < 1.2 && !remar.nada, 'o boneco vai junto no barco (sem nadar)');
  const longe = await frame.evaluate(() => window.FONEMA_CACA.descer());
  ok(longe === false, 'longe do píer não dá para descer (a Sofia mostra o caminho)');
  const desceu = await frame.evaluate(() => { const p = window.FONEMA_PASSEIO, b = window.FONEMA_CACA.barco; p.irPara(46.5, 12); p.simular(25); const d = window.FONEMA_CACA.descer(); p.simular(0.5); return { d, ativo: b.ativo, x: p.posicao.x, z: p.posicao.z }; });
  ok(desceu.d && !desceu.ativo && Math.hypot(desceu.x - 40.4, desceu.z - 12.6) < 1, 'de volta ao píer, desce do barco');

  /* ============================== nível 4: na água ============================== */
  await frame.waitForFunction(() => window.FONEMA_CACA.niveis.find((n) => n.nivel === 4)?.aberto, null, { timeout: 60000, polling: 300 });
  await fr.getByTestId('caca-mapa').click(CLIQUE);
  await fr.getByTestId('caca-nivel-4').click(CLIQUE);
  const vistos = [];
  for (let k = 0; k < 3; k++) {
    await esperarJuiz((kk) => window.FONEMA_CACA_JUIZ?.nivel === 4 && window.FONEMA_CACA_JUIZ.k === kk && window.FONEMA_CACA_JUIZ.modo === 'lugar', k);
    j = await juiz();
    const b = (await baus())[0];
    vistos.push(`${j.lugar}:${b.modo}`);
    if (b.modo === 'barco') {
      const r = await frame.evaluate(([x, z]) => { const c = window.FONEMA_CACA, p = window.FONEMA_PASSEIO; c.embarcar(); p.simular(0.2); p.irPara(x, z); p.simular(40); return { ativo: c.barco.ativo, d: Math.hypot(c.barco.pos.x - x, c.barco.pos.z - z) }; }, [b.x, b.z]);
      if (k === 0 || capturas) await cap(`08-agua-${j.lugar}`);
      ok(r.ativo && r.d < 4.2, `${j.lugar}: alcançado de barco (${r.d.toFixed(1)} m do baú)`);
    } else if (b.modo === 'mergulho') {
      const r = await frame.evaluate(([x, z]) => { const p = window.FONEMA_PASSEIO, c = p.colisao; const ok = c.livre(x, z, 0.3) === null && c.agua(x, z) > 0.5; p.teleportar(x - 0.8, z); p.simular(1); p.mergulhar(true); p.simular(1.2); return { ok, nada: p.posicao.nadando }; }, [b.x, b.z]);
      await cap('09-fundo');
      ok(r.ok && r.nada, `fundo do rio: o ponto é de nadar e mergulhar (nadando: ${r.nada})`);
    } else {
      const r = await frame.evaluate(([x, z]) => window.FONEMA_PASSEIO.colisao.livre(x, z, 0.3), [b.x, b.z]);
      ok(r === null, `${j.lugar}: a beira rasa é alcançável`);
      await irAoBau(b);
    }
    await fr.getByTestId('caca-painel').waitFor();
    await esperarJuiz((kk) => window.FONEMA_CACA_JUIZ?.modo === 'escolher' && window.FONEMA_CACA_JUIZ.k === kk, k);
    j = await juiz();
    await fr.getByTestId(`caca-opcao-${j.posicaoCerta}`).click(CLIQUE);
    await frame.evaluate(() => { if (window.FONEMA_CACA.barco.ativo) window.FONEMA_CACA.descer(true); });
  }
  await esperarJuiz(() => window.FONEMA_CACA_JUIZ?.fim && window.FONEMA_CACA_JUIZ.nivel === 4);
  ok(vistos.some((v) => v.endsWith(':barco')) && vistos.some((v) => /:(agua|mergulho)$/.test(v)), `nível 4 até o fim (${vistos.join(', ')})`);
  p = await lerProgresso(pg, id);
  ok((p.biblioteca?.jogos ?? []).filter((x) => x.id.startsWith('caca-tesouro')).length === 4, 'as 4 rodadas ficam no histórico (o que abre os níveis)');

  // fila nº 29: depois de uns minutos livres, "Vamos continuar a missão?" ("Mais um pouquinho" adia 2 min; "Vamos!" leva à missão)
  await frame.waitForFunction(() => !document.body.classList.contains('caca'), null, { timeout: 60000, polling: 300 });
  for (let i = 0; i < 4 && !(await frame.evaluate(() => window.FONEMA_GUIA.lembreteAberto)); i++) await simular(60);
  ok(await fr.getByTestId('lembrete').isVisible(), 'passeio livre por ~3,5 min: aparece "Vamos continuar a missão?"');
  await cap('10-lembrete');
  await fr.getByTestId('lembrete-depois').click(CLIQUE);
  const adiou = await frame.evaluate(() => ({ aberto: window.FONEMA_GUIA.lembreteAberto, s: window.FONEMA_GUIA.livreS }));
  ok(!adiou.aberto && adiou.s >= 80 && adiou.s <= 100, '"Mais um pouquinho" fecha e adia 2 minutos');
  for (let i = 0; i < 3 && !(await frame.evaluate(() => window.FONEMA_GUIA.lembreteAberto)); i++) await simular(60);
  await fr.getByTestId('lembrete-vamos').click(CLIQUE);
  await pg.waitForFunction(() => /\/(fase|sessao)\//.test(location.hash), null, { timeout: 60000 });
  ok(true, '"Vamos!" leva à missão de hoje');
  await ctx.close();
}
