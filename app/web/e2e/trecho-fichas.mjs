// FONEMA · trecho E2E: FICHAS DE LEITURA por campo semântico (D033).
// Confere: sem lição concluída, as fichas ficam trancadas; com a trilha semeada até o TF-22 abrem; palavras trancadas aparecem
// só como figura com cadeado (nunca escritas); os 4 níveis destrancam com acertos e cada um roda até o fim (com um erro e a
// correção): 1 "Vamos ler juntos?" (boquinha em cada letra, exposição + leitura avaliada), 2 só o som → figura e → palavra
// escrita (sem a palavra escrita antes da resposta), 3 letra ↔ boquinha (bocas de classes diferentes na rodada), 4 só as
// bocas → figura; cada escolha gravada pelo contrato do motor (tipo, mecânica 'ficha', alvo, escolhido, tempo, nOpcoes,
// posições, contexto, formato) e o desafio (vindo de uma lição) gravado com contexto 'desafio'.
// Uso: node e2e/fluxo.e2e.mjs --fichas   (também roda dentro do E2E completo e do --sem-jornada)
//      node e2e/fluxo.e2e.mjs --capturas-fichas   (capturas 1850×980 e 390×844 em app/docs/capturas/v11-fichas-*.png)
import { resolve } from 'node:path';

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
const fichas = (p) => Object.values(p.habilidades).flatMap((h) => h.tentativas).filter((t) => t.mecanica === 'ficha');
const TF_ATE_22 = ['TF-01', 'TF-02', 'TF-03', 'TF-04', 'TF-05', 'TF-06', 'TF-07', 'TF-08', 'TF-09', 'TF-10', 'TF-11', 'TF-12', 'TF-13', 'TF-14', 'TF-15', 'TF-R2', 'TF-16', 'TF-17', 'TF-18', 'TF-19', 'TF-20', 'TF-21', 'TF-22'];
/** Bocas iguais de frente (conteudo/src/fichas.ts › CLASSE_DA_BOCA): nunca duas da mesma classe na rodada. */
const CLASSE = { p: 1, b: 1, m: 1, f: 2, v: 2, t: 3, d: 3, n: 3, l: 3, r: 3, s: 4, z: 4, i: 4, e: 4, E: 4, u: 5, x: 5, j: 5, o: 6, O: 6, a: 7, k: 7, g: 7, rr: 7 };

/** Joga uma rodada de escolha (níveis 1, 2 e 4) até a tela de fim; erra uma vez no 1º item se `errar`. */
async function rodadaEscolha(pg, { errar = false, tirar = async () => {}, ver = async () => {} } = {}) {
  let errou = !errar;
  for (let passo = 0; passo < 2500; passo++) {
    if (await pg.getByTestId('ficha-feito').isVisible().catch(() => false)) return true;
    const juntos = pg.getByTestId('ficha-ler-juntos');
    if (await juntos.isVisible().catch(() => false)) { await tirar('inicio'); await juntos.click(); continue; }
    const etapa = await pg.getByTestId('ficha-atividade').getAttribute('data-etapa').catch(() => null);
    if (etapa === 'guia') await tirar('guia');
    if (etapa === 'escolher' && !(await pg.locator('.ficha-opcao[data-correta]').isDisabled().catch(() => true))) {
      await ver();
      await tirar('escolher');
      if (!errou) { await pg.locator('.ficha-opcao:not([data-correta]):not(.tentada)').first().click(); errou = true; await pg.waitForTimeout(150); await tirar('correcao'); }
      else await pg.locator('.ficha-opcao[data-correta]').click();
      await pg.waitForTimeout(120);
      if (await pg.getByTestId('ficha-atividade').getAttribute('data-etapa').catch(() => null) === 'feito') await tirar('festa');
      continue;
    }
    await pg.waitForTimeout(60);
  }
  return false;
}

/** Nível 3: liga cada letra à boquinha; erra uma vez no começo se `errar`. Devolve os fonemas das bocas da rodada. */
async function rodadaBocas(pg, { errar = false, tirar = async () => {} } = {}) {
  await pg.locator('.ficha-boca-btn').first().waitFor();
  const fonemas = await pg.locator('.ficha-boca-btn').evaluateAll((es) => es.map((e) => e.dataset.fonema));
  await tirar('ligar');
  let errou = !errar;
  for (let passo = 0; passo < 400; passo++) {
    if (await pg.getByTestId('ficha-feito').isVisible().catch(() => false)) return fonemas;
    const livres = await pg.locator('.ficha-letra-solta:not(.ligada)').evaluateAll((es) => es.map((e) => e.dataset.letra));
    if (!livres.length) { await pg.waitForTimeout(80); continue; }
    const l = livres[0];
    await pg.locator(`.ficha-letra-solta[data-letra="${l}"]`).click({ timeout: 3000 }).catch(() => {});
    if (!errou) {
      await pg.locator(`.ficha-boca-btn:not(.ligada):not([data-boca="${l}"])`).first().click({ timeout: 3000 }).catch(() => {});
      errou = true;
      await pg.waitForTimeout(200);
      await tirar('ligar-correcao');
    }
    await pg.locator(`.ficha-boca-btn[data-boca="${l}"]`).click({ timeout: 3000 }).catch(() => {});
    await pg.waitForTimeout(120);
  }
  return null;
}

/**
 * @param {import('@playwright/test').Browser} browser
 * @param {{ BASE: string, ok: Function, passarPorteira: Function, cadastrar: Function, montarAvatar: Function, erros: string[],
 *           w?: number, h?: number, suf?: string, movel?: boolean, capturar?: boolean, dirCap?: string }} h
 */
export async function trechoFichas(browser, h) {
  const { BASE, ok, passarPorteira, cadastrar, montarAvatar, erros, w = 1280, h: alt = 800, suf = '', movel = false, capturar = false, dirCap } = h;
  console.log(`F. Fichas de leitura por campo semântico (${w}×${alt})`);
  const ctx = await browser.newContext({ viewport: { width: w, height: alt }, locale: 'pt-BR', serviceWorkers: 'block', ...(movel ? { deviceScaleFactor: 2, isMobile: true, hasTouch: true } : {}) });
  await ctx.addInitScript(() => { try { localStorage.setItem('fonema-teste-rapido', '1'); } catch { /* sem armazenamento */ } });
  const pg = await ctx.newPage();
  pg.on('pageerror', (e) => erros.push(String(e)));
  const feitas = new Set();
  const cap = async (nome) => {
    if (!capturar || feitas.has(nome)) return;
    feitas.add(nome);
    await pg.waitForTimeout(500);
    await pg.screenshot({ path: resolve(dirCap, `v11-fichas-${nome}${suf}.png`) });
    console.log(`  📸 v11-fichas-${nome}${suf}.png`);
  };

  await pg.goto(BASE + '#/adulto/cadastro');
  await passarPorteira(pg);
  await cadastrar(pg, 'Bia', 'f');
  await montarAvatar(pg);
  await pg.locator('[data-testid="tutorial"], [data-testid="primeira-missao"]').first().waitFor({ timeout: 20000 });
  if (await pg.getByTestId('tutorial').count()) { await pg.getByTestId('pular-tutorial').click(); await pg.getByTestId('tutorial').waitFor({ state: 'detached' }); }
  await pg.waitForURL(/\/c\/[^/]+/);
  const id = pg.url().split('/c/')[1].split('/')[0];

  // sem lição concluída: a porta das fichas aparece trancada no Cantinho
  await pg.goto(BASE + `#/c/${id}/leitura`);
  await pg.getByTestId('ir-fichas').waitFor();
  ok(await pg.getByTestId('ir-fichas').isDisabled(), 'Cantinho: "Fichas de leitura" trancada antes de qualquer som ensinado');

  await semear(pg, id, TF_ATE_22);
  await pg.reload();
  await pg.getByTestId('ir-fichas').waitFor();
  ok(!(await pg.getByTestId('ir-fichas').isDisabled()), 'com a trilha até o TF-22, as fichas abrem');
  await cap('01-cantinho');
  const saldo0 = (await lerProgresso(pg, id)).moedinhas?.saldo ?? 0;
  await pg.getByTestId('ir-fichas').click();
  await pg.getByTestId('ficha-campo-animais').waitFor();
  await cap('02-campos');
  ok(Number(await pg.getByTestId('ficha-campo-animais').getAttribute('data-legiveis')) > 0, 'cartão "Animais" com palavras para ler');
  await pg.getByTestId('ficha-campo-animais').click();
  await pg.getByTestId('ficha-campo').waitFor();
  await cap('03-ficha-animais');
  const legiveis = await pg.locator('[data-legivel]').evaluateAll((es) => es.map((e) => e.dataset.legivel));
  const textoTrancadas = (await pg.locator('[data-trancada]').allInnerTexts()).join(' ');
  ok(legiveis.includes('pato') && !legiveis.includes('rato') && !legiveis.includes('leão'), `palavras para ler só com sons ensinados (${legiveis.join(' ')})`);
  ok(await pg.locator('[data-trancada]').count() > 0 && !/RATO|LEÃO|PEIXE|ZEBRA|COBRA/.test(textoTrancadas), 'palavras trancadas aparecem só como figura com cadeado, nunca escritas (regra 2)');
  ok(!(await pg.getByTestId('ficha-nivel-ler').isDisabled()) && await pg.getByTestId('ficha-nivel-ouvir').isDisabled() && await pg.getByTestId('ficha-nivel-bocas').isDisabled() && await pg.getByTestId('ficha-nivel-bocas-palavra').isDisabled(),
    'só o nível 1 aberto no começo');

  // ---- nível 1: ler junto ----
  const abrir = async (modo) => {
    await pg.goto(BASE + `#/c/${id}/leitura/ficha.animais`);
    await pg.getByTestId(`ficha-nivel-${modo}`).waitFor();
    if (await pg.getByTestId(`ficha-nivel-${modo}`).isDisabled()) return false;
    await pg.getByTestId(`ficha-nivel-${modo}`).click();
    await pg.getByTestId('ficha-atividade').waitFor();
    return true;
  };
  ok(await abrir('ler'), 'nível 1 abre');
  let bocasNaGuia = 0;
  let letrasEscritas = true;
  ok(await rodadaEscolha(pg, {
    errar: true,
    tirar: async (k) => {
      if (k === 'guia') { bocasNaGuia = Math.max(bocasNaGuia, await pg.locator('.ficha-pedaco .boquinha').count()); }
      await cap({ inicio: '04-ler-inicio', guia: '05-ler-boquinhas', escolher: '06-ler-o-que-ficou', correcao: '07-ler-correcao', festa: '08-ler-festa' }[k] ?? k);
    },
    ver: async () => { letrasEscritas &&= (await pg.locator('.ficha-letra').count()) > 0 && (await pg.locator('.ficha-revela').count()) === 0; }
  }), 'nível 1: rodada inteira, com um erro corrigido');
  ok(bocasNaGuia >= 2, `nível 1: uma boquinha em cima de cada letra (${bocasNaGuia})`);
  ok(letrasEscritas, 'nível 1: a palavra escrita e nenhuma figura antes da escolha');
  await cap('09-ler-fim');
  let p = await lerProgresso(pg, id);
  let ts = fichas(p);
  const ler = ts.filter((t) => t.formato === 'ficha-ler');
  ok(ler.length >= 1 && ler.every((t) => t.tipo === 'avaliada' && t.habilidade === 'leitura-cvcv' && t.nOpcoes === 3 && typeof t.tempoMs === 'number' && t.posicaoCerta !== undefined && t.posicaoEscolhida !== undefined && t.alvo && t.escolhido && t.contexto === 'livre'),
    `nível 1: escolhas avaliadas pelo contrato do motor (${ler.length})`);
  ok(ts.filter((t) => t.formato === 'ficha-ler-junto').every((t) => t.tipo === 'exposicao') && ts.some((t) => t.formato === 'ficha-ler-junto'), 'ler junto gravado como exposição (não conta domínio)');
  ok(ler.some((t) => t.respostas.length === 2 && t.escolhido !== t.alvo), 'o erro ficou registrado (escolhido ≠ alvo)');
  // mais rodadas até abrir o nível 2
  for (let k = 0; k < 3 && !(await abrir('ouvir')); k++) { await abrir('ler'); await rodadaEscolha(pg); }
  ok(await abrir('ouvir'), 'nível 2 abre com 3 acertos sozinho no nível 1');

  // ---- nível 2: só o som ----
  let semEscrita = true;
  ok(await rodadaEscolha(pg, {
    errar: true, tirar: (k) => cap({ guia: '10-som-bolinhas', escolher: '11-som-escolher' }[k] ?? `x-${k}`),
    ver: async () => { semEscrita &&= (await pg.locator('.ficha-letra').count()) === 0 && (await pg.locator('.ficha-pedaco .boquinha').count()) === 0; }
  }), 'nível 2 (só o som → figura): rodada inteira');
  ok(semEscrita, 'nível 2: nem a palavra escrita nem a boca antes da resposta');
  for (let k = 0; k < 3 && !(await abrir('ouvir-palavra')); k++) { await abrir('ouvir'); await rodadaEscolha(pg); }
  ok(await abrir('ouvir-palavra'), 'degrau "som → palavra escrita" abre com 3 acertos');
  ok(await rodadaEscolha(pg, { tirar: (k) => cap(k === 'escolher' ? '12-som-palavra' : `y-${k}`) }), 'nível 2 (só o som → palavra escrita): rodada inteira');
  p = await lerProgresso(pg, id);
  ts = fichas(p);
  ok(ts.filter((t) => t.formato === 'ficha-ouvir').every((t) => t.habilidade === 'sintese' && t.tipo === 'avaliada') && ts.filter((t) => t.formato === 'ficha-ouvir-palavra').every((t) => t.habilidade === 'leitura-cvcv'),
    'nível 2 gravado como síntese (figura) e leitura (palavra escrita)');

  // ---- nível 3: letra ↔ boquinha ----
  ok(await abrir('bocas'), 'nível 3 abre');
  const f1 = await rodadaBocas(pg, { errar: true, tirar: (k) => cap(k === 'ligar' ? '13-ligar' : '14-ligar-correcao') });
  ok(!!f1, 'nível 3: rodada inteira, com um erro corrigido');
  ok(f1 && new Set(f1.map((x) => CLASSE[x])).size === f1.length, `nível 3: bocas visualmente diferentes na rodada (${f1?.join(' ')})`);
  for (let k = 0; k < 4 && !(await abrir('bocas-palavra')); k++) { await abrir('bocas'); await rodadaBocas(pg); }
  p = await lerProgresso(pg, id);
  ts = fichas(p).filter((t) => t.formato === 'ficha-bocas');
  ok(ts.length > 0 && ts.every((t) => t.habilidade === 'boca-som' && t.categoria === 'grafema' && (t.tipo === 'avaliada') === (t.nOpcoes >= 3)), 'nível 3: habilidade boca-som; só vale como medida com 3 bocas ou mais');

  // ---- nível 4: só as bocas ----
  ok(await abrir('bocas-palavra'), 'nível 4 abre com 3 acertos no nível 3');
  let semLetraNem = true;
  ok(await rodadaEscolha(pg, {
    errar: true, tirar: (k) => cap({ escolher: '15-so-boca', correcao: '16-so-boca-correcao' }[k] ?? `z-${k}`),
    ver: async () => { semLetraNem &&= (await pg.locator('.ficha-letra').count()) === 0 && (await pg.locator('.ficha-pedaco .boquinha').count()) >= 2; }
  }), 'nível 4 (só as bocas → figura): rodada inteira');
  ok(semLetraNem, 'nível 4: só as boquinhas, sem letras');
  p = await lerProgresso(pg, id);
  ok(fichas(p).filter((t) => t.formato === 'ficha-bocas-palavra').every((t) => t.habilidade === 'boca-som' && t.nOpcoes === 3), 'nível 4 gravado (boca-som, 3 opções)');

  // ---- desafio vindo de uma lição ----
  await pg.goto(BASE + `#/c/${id}/leitura/ficha.animais.desafio`);
  await pg.getByTestId('ficha-nivel-ler').click();
  await pg.getByTestId('ficha-atividade').waitFor();
  ok(await rodadaEscolha(pg), 'desafio: rodada inteira');
  p = await lerProgresso(pg, id);
  ok(fichas(p).some((t) => t.contexto === 'desafio' && t.formato === 'ficha-ler'), 'desafio gravado com contexto "desafio"');
  ok((p.moedinhas?.saldo ?? 0) === saldo0, 'fichas não dão moedinhas');
  await ctx.close();
}
