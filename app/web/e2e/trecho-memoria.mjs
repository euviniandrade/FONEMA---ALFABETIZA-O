// FONEMA · trecho E2E: MEMÓRIA DOS SONS (fila do dono nº 17; motor/src/memoria-sons.ts).
// Confere: o cartão aparece trancado sem nada ensinado; com as vogais, M e F abre; nível 1 (olhar e virar) grava só exposição;
// nível 2 com um palpite (não conta), um erro com decisão (vira confusão letra × som, com a correção) e pares fechados
// (avaliada, mecânica 'memoria-sons', alvo, escolhido, tempo, nOpcoes, posições, contexto 'livre'); só letras já vistas;
// moedinhas não mudam; o desafio no fim da fase AL-M grava contexto 'desafio' com o M na rodada.
// Uso: node e2e/fluxo.e2e.mjs --memoria   (também roda dentro do E2E completo e do --sem-jornada)
//      node e2e/fluxo.e2e.mjs --capturas-memoria   (capturas 1850×980 e 390×844 em app/docs/capturas/v12-memoria-*.png)
import { resolve } from 'node:path';

const lerProgresso = (pg, id) => pg.evaluate(async (cid) => {
  const db = await new Promise((r) => { const q = indexedDB.open('fonema'); q.onsuccess = () => r(q.result); });
  return await new Promise((r) => { const q = db.transaction('progressos').objectStore('progressos').get(cid); q.onsuccess = () => r(q.result); });
}, id);

const semear = (pg, id, fases) => pg.evaluate(async ([cid, fs]) => {
  const db = await new Promise((r) => { const q = indexedDB.open('fonema'); q.onsuccess = () => r(q.result); });
  const p = await new Promise((r) => { const q = db.transaction('progressos').objectStore('progressos').get(cid); q.onsuccess = () => r(q.result); });
  const agora = Date.now() - 3600e3;
  for (const f of fs) p.fases[f] = { ...(p.fases[f] ?? {}), estado: 'concluida', sessoes: 1, concluidaEm: agora };
  await new Promise((r) => { const tx = db.transaction('progressos', 'readwrite'); tx.objectStore('progressos').put(p); tx.oncomplete = r; });
}, [id, fases]);

const tentativasDa = (p) => Object.values(p.habilidades).flatMap((h) => h.tentativas).filter((t) => t.mecanica === 'memoria-sons');
const VISTAS = ['A', 'E', 'I', 'O', 'U', 'M', 'F'];

/** Espera a mesa ficar livre (sem par sendo resolvido). */
async function livre(pg) {
  await pg.waitForFunction(() => { const m = document.querySelector('[data-testid="memoria"]'); return !m || !m.hasAttribute('data-ocupado'); }, null, { timeout: 15000 });
}
/** Vira duas cartas (uma de cada grade) e espera o par se resolver (fechou ou voltou). `depois1`/`depois2`: capturas no meio. */
async function par(pg, x, y, { depois1, depois2 } = {}) {
  await livre(pg);
  await pg.locator(`[data-carta="${x}"]`).click();
  await pg.waitForSelector(`[data-carta="${x}"][data-virada]`);
  if (depois1) await depois1();
  await pg.locator(`[data-carta="${y}"]`).click();
  if (depois2) await depois2();
  await pg.waitForFunction(() => {
    const m = document.querySelector('[data-testid="memoria"]');
    return !m || (!m.hasAttribute('data-ocupado') && !m.querySelector('[data-virada]:not([data-feita])'));
  }, null, { timeout: 20000 });
}
const letrasDaMesa = (pg) => pg.locator('.mem-letras [data-carta]').evaluateAll((es) => es.map((e) => e.dataset.par));

/**
 * @param {import('@playwright/test').Browser} browser
 * @param {{ BASE: string, ok: Function, passarPorteira: Function, cadastrar: Function, montarAvatar: Function, erros: string[],
 *           w?: number, h?: number, suf?: string, movel?: boolean, capturar?: boolean, dirCap?: string }} h
 */
export async function trechoMemoria(browser, h) {
  const { BASE, ok, passarPorteira, cadastrar, montarAvatar, erros, w = 1280, h: alt = 800, suf = '', movel = false, capturar = false, dirCap } = h;
  console.log(`M. Memória dos Sons (${w}×${alt})`);
  const ctx = await browser.newContext({ viewport: { width: w, height: alt }, locale: 'pt-BR', serviceWorkers: 'block', ...(movel ? { deviceScaleFactor: 2, isMobile: true, hasTouch: true } : {}) });
  await ctx.addInitScript(() => { try { localStorage.setItem('fonema-teste-rapido', '1'); } catch { /* sem armazenamento */ } });
  const pg = await ctx.newPage();
  pg.setDefaultTimeout(30000);
  pg.on('pageerror', (e) => erros.push(String(e)));
  const cap = async (nome) => {
    if (!capturar) return;
    await pg.waitForTimeout(500);
    await pg.screenshot({ path: resolve(dirCap, `v12-memoria-${nome}${suf}.png`) });
    console.log(`  📸 v12-memoria-${nome}${suf}.png`);
  };

  await pg.goto(BASE + '#/adulto/cadastro');
  await passarPorteira(pg);
  await cadastrar(pg, 'Bia', 'f');
  await montarAvatar(pg);
  await pg.locator('[data-testid="tutorial"], [data-testid="primeira-missao"]').first().waitFor({ timeout: 20000 });
  if (await pg.getByTestId('tutorial').count()) { await pg.getByTestId('pular-tutorial').click(); await pg.getByTestId('tutorial').waitFor({ state: 'detached' }); }
  await pg.waitForURL(/\/c\/[^/]+/);
  const id = pg.url().split('/c/')[1].split('/')[0];

  // sem nada ensinado: o cartão aparece trancado
  await pg.goto(BASE + `#/c/${id}/brincar`);
  await pg.getByTestId('jogo-memoria-sons').waitFor();
  ok(await pg.locator('[data-testid="jogo-memoria-sons"].trancado').count() === 1, 'Brincar › Jogos: a Memória dos Sons aparece trancada antes de qualquer som ensinado');

  // vogais, M e F concluídos na Trilha A–Z
  await semear(pg, id, ['AL-A', 'AL-E', 'AL-I', 'AL-O', 'AL-U', 'AL-M', 'AL-F']);
  await pg.goto(BASE + `#/c/${id}/brincar`); await pg.reload();
  await pg.getByTestId('jogo-memoria-sons').waitFor();
  ok(await pg.locator('[data-testid="jogo-memoria-sons"].trancado').count() === 0, 'com as vogais, o M e o F ensinados, a Memória dos Sons abre');
  await pg.getByTestId('jogo-memoria-sons').scrollIntoViewIfNeeded();
  await cap('01-brincar');
  const moedas0 = (await lerProgresso(pg, id)).moedinhas.saldo;
  await pg.getByTestId('jogo-memoria-sons').click();
  await pg.getByTestId('memoria-niveis').waitFor();
  await cap('02-niveis');
  ok(!(await pg.getByTestId('memoria-nivel-1').isDisabled()) && !(await pg.getByTestId('memoria-nivel-2').isDisabled()), 'níveis 1 (olhar e lembrar) e 2 (memória) abertos');

  // ---- nível 1: olhar (cartas abertas), virar e formar os pares ----
  await pg.getByTestId('memoria-nivel-1').click();
  await pg.getByTestId('memoria').waitFor();
  ok(await pg.getByTestId('memoria').getAttribute('data-etapa') === 'olhar' && await pg.locator('[data-carta][data-virada]').count() === 6, 'nível 1: 3 pares, as 6 cartas abertas para olhar');
  ok(await pg.locator('.mem-cenas img.mem-fig').count() === 3, 'nível 1: as cartas de cima mostram a cena do som');
  await pg.locator('.mem-cenas [data-carta]').first().click();
  await cap('03-olhar');
  await pg.getByTestId('memoria-virar').click();
  await pg.waitForFunction(() => document.querySelector('[data-testid="memoria"]')?.getAttribute('data-etapa') === 'jogar');
  ok(await pg.locator('[data-carta][data-virada]').count() === 0, 'depois de "Virar as cartas", todas ficam viradas para baixo');
  for (const l of await letrasDaMesa(pg)) await par(pg, `c-${l}`, `l-${l}`);
  await pg.getByTestId('memoria-fim').waitFor({ timeout: 20000 });
  let p = await lerProgresso(pg, id);
  let t = tentativasDa(p);
  ok(t.length === 3 && t.every((x) => x.tipo === 'exposicao'), `nível 1: 3 pares gravados, todos como EXPOSIÇÃO (não contam; ${t.map((x) => x.tipo).join(',')})`);

  // ---- nível 2: palpite, erro com decisão, pares ----
  await pg.getByTestId('memoria-outro').click();
  await pg.getByTestId('memoria-nivel-2').click();
  await pg.getByTestId('memoria').waitFor();
  const ls = await letrasDaMesa(pg);
  ok(ls.length >= 3 && ls.length <= 4 && ls.every((l) => VISTAS.includes(l)), `nível 2: ${ls.length} pares, só com letras já vistas (${ls.join(' ')})`);
  ok(!(ls.includes('E') && ls.includes('I')) && !(ls.includes('O') && ls.includes('U')), 'nunca duas letras do mesmo som na rodada (E/I, O/U)');
  ok(await pg.locator('[data-carta][data-virada]').count() === 0, 'nível 2: começa com tudo virado');
  const [a, b, c] = ls;
  await par(pg, `c-${a}`, `l-${b}`); // palpite (letra nunca vista): não conta
  await par(pg, `c-${a}`, `l-${b}`, { depois1: () => cap('04-cena-aberta'), depois2: async () => { await pg.waitForTimeout(250); await cap('05-correcao'); } }); // erro com decisão
  await par(pg, `c-${a}`, `l-${a}`); // par (a letra certa ainda não tinha sido vista, mas houve erro antes: conta)
  await par(pg, `c-${c}`, `l-${b}`); // l-b já vista: erro com decisão no alvo c
  await par(pg, `l-${c}`, `c-${c}`); // letra primeiro; a cena já tinha sido vista: decisão, par
  for (const l of ls.slice(1)) if (l !== c) await par(pg, `c-${l}`, `l-${l}`);
  await pg.getByTestId('memoria-fim').waitFor({ timeout: 20000 });
  await cap('06-fim');
  p = await lerProgresso(pg, id);
  t = tentativasDa(p).filter((x) => x.contexto === 'livre').sort((x, y) => x.em - y.em);
  const n2 = t.slice(3);
  ok(n2.length === ls.length, `nível 2: um registro por par (${n2.length})`);
  const ta = n2.find((x) => x.alvo === a);
  ok(ta && ta.tipo === 'avaliada' && ta.escolhido === b && ta.respostas.join('') === `${b}${a}` && ta.comAjuda && ta.acertou === false,
    'o erro com decisão virou confusão letra × som (escolhido ≠ alvo), e o palpite antes dele não contou');
  const tc = n2.find((x) => x.alvo === c);
  ok(tc && tc.tipo === 'avaliada', 'par fechado com decisão (a cena já tinha sido vista) é tentativa avaliada');
  ok(n2.every((x) => x.mecanica === 'memoria-sons' && x.categoria === 'grafema' && typeof x.tempoMs === 'number' && x.nOpcoes >= 1 && x.posicaoCerta !== undefined && x.posicaoEscolhida !== undefined && x.contexto === 'livre' && x.habilidade),
    'cada par: mecânica memoria-sons, alvo, escolhido, tempo, nOpcoes (cartas de letra na mesa), posições e contexto livre');
  ok(p.moedinhas.saldo === moedas0, 'jogar não mexe nas moedinhas (enfeite só)');

  // ---- nível 4: só ouvindo (carta de som × letra, sem figura) ----
  await pg.getByTestId('memoria-outro').click();
  if (!(await pg.getByTestId('memoria-nivel-4').isDisabled())) {
    await pg.getByTestId('memoria-nivel-4').click();
    await pg.getByTestId('memoria').waitFor();
    ok(await pg.locator('.mem-cenas img.mem-fig').count() === 0, 'nível 4: cartas de som, sem figura');
    const l4 = await letrasDaMesa(pg);
    await par(pg, `c-${l4[0]}`, `l-${l4[0]}`, { depois1: () => cap('07-so-ouvindo') });
    ok(await pg.locator(`[data-carta="l-${l4[0]}"][data-feita]`).count() === 1, 'nível 4: ouvir a carta de som e achar a letra fecha o par');
  }

  // ---- desafio no fim da fase AL-M ----
  await pg.goto(BASE + `#/c/${id}/memoria/AL-M`);
  await pg.getByTestId('memoria').waitFor();
  ok(await pg.getByTestId('memoria-tela').getAttribute('data-contexto') === 'desafio', 'desafio da fase AL-M abre direto no jogo (contexto desafio)');
  const ld = await letrasDaMesa(pg);
  ok(ld.includes('M'), `o desafio da fase AL-M traz o M (${ld.join(' ')})`);
  for (const l of ld) await par(pg, `c-${l}`, `l-${l}`);
  await pg.getByTestId('memoria-fim').waitFor({ timeout: 20000 });
  p = await lerProgresso(pg, id);
  ok(tentativasDa(p).filter((x) => x.contexto === 'desafio').length === ld.length, 'desafio: os pares ficam gravados com contexto "desafio"');
  ok(await pg.getByTestId('voltar-vila').isVisible(), 'no fim do desafio, volta para a vila');
  await ctx.close();
}
