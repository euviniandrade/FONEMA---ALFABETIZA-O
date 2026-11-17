// FONEMA · trecho E2E: JOGOS DA VILA (D032 §4) — Estrada e Rio dos Pares, Carteiro da Vila e Casa do Som.
// Confere: os três ficam trancados sem nada ensinado; com a trilha semeada até o TF-22 abrem; uma rodada de cada um até o fim
// (com um erro e a correção); cada escolha gravada pelo contrato do motor (avaliada, mecânica do jogo, alvo, escolhido, tempo,
// 3 opções, posições, contexto 'livre'; a Estrada na habilidade do contraste `par-minimo-*`); moedinhas não mudam ao jogar;
// a cor paga do carro só com moedinhas da jornada; a casinha guarda o móvel arrastado; e o desafio de uma fase grava 'desafio'.
// Uso: node e2e/fluxo.e2e.mjs --jogos2   (também roda dentro do E2E completo e do --sem-jornada)
//      node e2e/fluxo.e2e.mjs --capturas-jogos2   (capturas 1850×980 e 390×844 em app/docs/capturas/v10-vila-*.png)
import { resolve } from 'node:path';

const lerProgresso = (pg, id) => pg.evaluate(async (cid) => {
  const db = await new Promise((r) => { const q = indexedDB.open('fonema'); q.onsuccess = () => r(q.result); });
  return await new Promise((r) => { const q = db.transaction('progressos').objectStore('progressos').get(cid); q.onsuccess = () => r(q.result); });
}, id);

/** Marca fases como concluídas e (opcional) põe moedinhas no porquinho. */
const semear = (pg, id, fases, saldo) => pg.evaluate(async ([cid, fs, s]) => {
  const db = await new Promise((r) => { const q = indexedDB.open('fonema'); q.onsuccess = () => r(q.result); });
  const p = await new Promise((r) => { const q = db.transaction('progressos').objectStore('progressos').get(cid); q.onsuccess = () => r(q.result); });
  const agora = Date.now() - 3600e3;
  for (const f of fs) p.fases[f] = { ...(p.fases[f] ?? {}), estado: 'concluida', sessoes: 1, concluidaEm: agora };
  if (typeof s === 'number') p.moedinhas = { ...p.moedinhas, saldo: s, total: Math.max(s, p.moedinhas.total) };
  await new Promise((r) => { const tx = db.transaction('progressos', 'readwrite'); tx.objectStore('progressos').put(p); tx.oncomplete = r; });
}, [id, fases, saldo]);

const tentativasDo = (p, mecanica) => Object.values(p.habilidades).flatMap((h) => h.tentativas).filter((t) => t.mecanica === mecanica);
const TF_ATE_22 = ['TF-01', 'TF-02', 'TF-03', 'TF-04', 'TF-05', 'TF-06', 'TF-07', 'TF-08', 'TF-09', 'TF-10', 'TF-11', 'TF-12', 'TF-13', 'TF-14', 'TF-15', 'TF-R2', 'TF-16', 'TF-17', 'TF-18', 'TF-19', 'TF-20', 'TF-21', 'TF-22'];
const AL_ATE_G = ['AL-A', 'AL-E', 'AL-I', 'AL-O', 'AL-U', 'AL-RV1', 'AL-M', 'AL-F', 'AL-V', 'AL-L', 'AL-S', 'AL-N', 'AL-Z', 'AL-J', 'AL-RV2', 'AL-P', 'AL-T', 'AL-B', 'AL-C', 'AL-D', 'AL-G'];

/**
 * Joga a Estrada ou o Carteiro até o fim: em cada item livre (fora do exemplo), erra uma vez no 1º item (se `errar`) e depois
 * toca o certo. `sel` = seletor das opções ('.ep-placa' / '.ct-casa').
 */
async function jogarEscolhas(pg, testid, sel, { errar = false, tirar = async () => {}, ver = () => {} } = {}) {
  let errou = !errar;
  const raiz = pg.getByTestId(testid);
  for (let passo = 0; passo < 900; passo++) {
    if (await pg.getByTestId('jogo-fim').isVisible().catch(() => false)) return true;
    if (!(await raiz.isVisible().catch(() => false))) { await pg.waitForTimeout(80); continue; }
    const livre = await raiz.getAttribute('data-livre').catch(() => null);
    const demo = await raiz.getAttribute('data-demo').catch(() => null);
    if (livre && !demo) {
      ver(await pg.locator(`${sel}[data-opcao]`).evaluateAll((es) => es.map((e) => e.dataset.opcao)));
      await tirar('escolher');
      const alvo = errou ? `${sel}[data-correta="1"]` : `${sel}:not([data-correta])`;
      await pg.locator(alvo).first().click({ timeout: 2000 }).catch(() => {});
      if (!errou) { errou = true; await pg.waitForTimeout(250); await tirar('correcao'); }
      await pg.waitForTimeout(120);
      continue;
    }
    await pg.waitForTimeout(80);
  }
  return false;
}

/** Escreve a palavra na bandeja da Casa do Som (letras móveis). */
async function escrever(pg, palavra) {
  for (const l of palavra.toUpperCase()) await pg.locator(`.cs-bandeja [data-letra="${l}"]`).click();
}

/**
 * @param {import('@playwright/test').Browser} browser
 * @param {{ BASE: string, ok: Function, passarPorteira: Function, cadastrar: Function, montarAvatar: Function, erros: string[],
 *           w?: number, h?: number, suf?: string, movel?: boolean, capturar?: boolean, dirCap?: string, rapido?: boolean }} h
 */
export async function trechoJogos2(browser, h) {
  const { BASE, ok, passarPorteira, cadastrar, montarAvatar, erros, w = 1280, h: alt = 800, suf = '', movel = false, capturar = false, dirCap, rapido = true } = h;
  console.log(`J2. Jogos da vila: Estrada e Rio dos Pares, Carteiro, Casa do Som (${w}×${alt})`);
  const ctx = await browser.newContext({ viewport: { width: w, height: alt }, locale: 'pt-BR', serviceWorkers: 'block', ...(movel ? { deviceScaleFactor: 2, isMobile: true, hasTouch: true } : {}) });
  await ctx.addInitScript((r) => { try { if (r) localStorage.setItem('fonema-teste-rapido', '1'); } catch { /* sem armazenamento */ } }, rapido);
  const pg = await ctx.newPage();
  pg.on('pageerror', (e) => erros.push(String(e)));
  const feitas = new Set();
  const cap = async (nome) => {
    if (!capturar || feitas.has(nome)) return;
    feitas.add(nome);
    await pg.waitForTimeout(rapido ? 450 : 900);
    await pg.screenshot({ path: resolve(dirCap, `v10-vila-${nome}${suf}.png`) });
    console.log(`  📸 v10-vila-${nome}${suf}.png`);
  };

  await pg.goto(BASE + '#/adulto/cadastro');
  await passarPorteira(pg);
  await cadastrar(pg, 'Lia', 'f');
  await montarAvatar(pg);
  // D032: depois do boneco pode abrir o tutorial "A grande aventura" (pulado aqui; ele tem o trecho próprio)
  await pg.locator('[data-testid="tutorial"], [data-testid="primeira-missao"]').first().waitFor({ timeout: 20000 });
  if (await pg.getByTestId('tutorial').count()) { await pg.getByTestId('pular-tutorial').click(); await pg.getByTestId('tutorial').waitFor({ state: 'detached' }); }
  await pg.waitForURL(/\/c\/[^/]+/);
  const id = pg.url().split('/c/')[1].split('/')[0];

  // sem nada ensinado: os três aparecem no Brincar, trancados
  await pg.goto(BASE + `#/c/${id}/brincar`);
  await pg.getByTestId('jogo-carteiro').waitFor();
  ok(await pg.locator('[data-testid="jogo-estrada-pares"].trancado, [data-testid="jogo-carteiro"].trancado, [data-testid="jogo-casa-som"].trancado').count() === 3,
    'Brincar › Jogos: Estrada, Carteiro e Casa do Som aparecem trancados antes de qualquer som ensinado');
  await pg.getByTestId('jogo-estrada-pares').click();
  await pg.getByTestId('jogo-inicio').waitFor();
  ok(await pg.getByTestId('jogo-comecar-ouvir').isDisabled() && await pg.getByTestId('jogo-comecar-ler').isDisabled(), 'Estrada: sem pares ensinados, nenhuma variação abre');

  // semeia a trilha até o TF-22 (pares f/v, m/b, p/b, t/d, a/e já trabalhados) e 10 moedinhas da jornada
  await semear(pg, id, [...AL_ATE_G, ...TF_ATE_22], 10);
  await pg.goto(BASE + `#/c/${id}/brincar`); await pg.reload();
  await pg.getByTestId('jogo-carteiro').waitFor();
  await cap('01-brincar');
  ok(await pg.locator('[data-testid^="jogo-"].trancado').count() === 0, 'com a trilha semeada, os jogos da vila abrem');

  // ---- Estrada: garagem (cor grátis e cor paga com moedinhas), barco, ouvir ----
  await pg.getByTestId('jogo-estrada-pares').click();
  await pg.getByTestId('jogo-comecar-ouvir').waitFor();
  await pg.getByTestId('veiculo-barco').click();
  await pg.locator('[data-cor="cor-amarelo"]').click();
  await pg.waitForTimeout(300);
  let p = await lerProgresso(pg, id);
  ok(p.moedinhas.saldo === 7 && p.itens.includes('cor-amarelo') && p.jogosVila?.corVeiculo === 'cor-amarelo', 'garagem: a cor amarela custou 3 moedinhas da jornada (sem dinheiro real) e pintou o barco');
  await cap('02-estrada-garagem');
  const antes = p.moedinhas.saldo;
  await pg.getByTestId('jogo-comecar-ouvir').click();
  await pg.getByTestId('estrada-pares').waitFor();
  const figurasVistas = new Set();
  ok(await jogarEscolhas(pg, 'estrada-pares', '.ep-placa', { errar: true, tirar: (k) => cap(k === 'escolher' ? '03-estrada-escolher' : '04-estrada-correcao'), ver: (xs) => xs.forEach((x) => figurasVistas.add(x)) }),
    'Estrada (rio, ouvir): rodada inteira, com um erro corrigido');
  await cap('05-estrada-fim');
  p = await lerProgresso(pg, id);
  const te = tentativasDo(p, 'estrada-pares');
  ok(te.length === 6, `Estrada: 6 bifurcações gravadas (${te.length})`);
  ok(te.every((t) => t.tipo === 'avaliada' && t.contexto === 'livre' && t.nOpcoes === 3 && typeof t.tempoMs === 'number' && t.posicaoCerta !== undefined && t.posicaoEscolhida !== undefined && t.alvo && t.escolhido && t.habilidade.startsWith('par-minimo-')),
    'cada bifurcação: avaliada, contexto livre, habilidade do contraste (8 de 10), alvo, escolhido, tempo, 3 opções e posições');
  ok(te.some((t) => t.respostas.length === 2 && t.comAjuda && t.escolhido !== t.alvo), 'o erro ficou registrado (escolhido ≠ alvo) e o item "com ajuda"');
  ok([...figurasVistas].every((w) => ['faca', 'vaca', 'foca', 'jaca', 'mala', 'bala', 'mula', 'dado', 'dedo', 'pato'].includes(w)), `placas só com os pares das lições concluídas (${[...figurasVistas].join(' ')})`);
  ok(p.moedinhas.saldo === antes, 'jogar não mexe nas moedinhas (regra 4)');

  // ---- Estrada: ler (a palavra no barco, figuras nas placas) ----
  await pg.getByTestId('jogo-comecar-ler').click();
  await pg.getByTestId('estrada-pares').waitFor();
  await pg.locator('.ep-passageiro').waitFor();
  await cap('06-estrada-ler');
  ok(await jogarEscolhas(pg, 'estrada-pares', '.ep-placa'), 'Estrada (ler): rodada inteira');
  p = await lerProgresso(pg, id);
  ok(tentativasDo(p, 'estrada-pares').filter((t) => t.formato === 'estrada-ler').length === 6, 'Estrada (ler): 6 leituras gravadas com o formato "estrada-ler"');

  // ---- Carteiro ----
  await pg.goto(BASE + `#/c/${id}/jogo/carteiro`);
  await pg.getByTestId('jogo-comecar').click();
  await pg.getByTestId('carteiro').waitFor();
  const envelopes = new Set();
  ok(await jogarEscolhas(pg, 'carteiro', '.ct-casa', {
    errar: true,
    tirar: async (k) => { envelopes.add(await pg.locator('.ct-palavra').innerText()); await cap(k === 'escolher' ? '07-carteiro-escolher' : '08-carteiro-correcao'); }
  }), 'Carteiro: rodada inteira, com um erro e a correção (letra que muda e o som dela)');
  await cap('09-carteiro-fim');
  p = await lerProgresso(pg, id);
  const tc = tentativasDo(p, 'carteiro');
  ok(tc.length === 5 && tc.every((t) => t.tipo === 'avaliada' && t.contexto === 'livre' && t.habilidade === 'leitura-cvcv' && t.nOpcoes === 3 && t.categoria === 'palavra' && t.posicaoCerta !== undefined),
    `Carteiro: 5 entregas gravadas (leitura, avaliadas, 3 casas, contexto livre) (${tc.length})`);
  ok(tc.some((t) => t.comAjuda && t.escolhido !== t.alvo), 'Carteiro: a casa errada ficou registrada');

  // ---- Casa do Som ----
  await pg.goto(BASE + `#/c/${id}/jogo/casa-som`);
  await pg.getByTestId('casinha').waitFor();
  await cap('10-casa-vazia');
  await pg.getByTestId('jogo-comecar').click();
  const casa = pg.getByTestId('casa-som');
  await casa.waitFor();
  for (let k = 0; k < 3; k++) {
    await pg.locator(`[data-testid="casa-som"][data-item="${k}"][data-etapa="escrever"]`).waitFor();
    await pg.locator('.cs-bandeja .peca:not([disabled])').first().waitFor();
    const palavra = await casa.getAttribute('data-palavra');
    if (k === 0) {
      // 1ª encomenda: escreve faltando a última letra, vê o confronto, reescreve sem o modelo
      await cap('11-casa-escrever');
      await escrever(pg, palavra.slice(0, -1));
      await pg.getByTestId('escrita-pronto').click();
      await pg.getByTestId('escrita-confronto').waitFor();
      await pg.getByTestId('escrita-de-novo').waitFor();
      await pg.waitForFunction(() => !document.querySelector('[data-testid="escrita-de-novo"]')?.disabled);
      await cap('12-casa-confronto');
      ok(await pg.locator('.casa.c-faltou').count() >= 1 && await pg.locator('.c-errado, .errado').count() === 0, 'Casa do Som: o confronto mostra o som que faltou, sem marcar "errado"');
      await pg.getByTestId('escrita-de-novo').click();
      await pg.locator('.cs-bandeja .peca:not([disabled])').first().waitFor();
      await escrever(pg, palavra);
    } else await escrever(pg, palavra);
    await pg.getByTestId('escrita-pronto').click();
    if (k === 0) await cap('13-casa-chegando');
  }
  await pg.getByTestId('jogo-fim').waitFor({ timeout: 30000 });
  await pg.getByTestId('casinha').waitFor();
  await cap('14-casa-casinha');
  p = await lerProgresso(pg, id);
  const tcs = tentativasDo(p, 'casa-som');
  ok(tcs.length === 3 && tcs.every((t) => t.tipo === 'avaliada' && t.contexto === 'livre' && t.habilidade === 'escrita-cvcv' && t.alvo && t.escolhido), `Casa do Som: 3 encomendas gravadas (escrita, avaliadas) (${tcs.length})`);
  ok(!tcs[0].acertou && tcs[0].respostas.length === 2 && tcs[1].acertou && tcs[2].acertou, 'só conta a 1ª escrita: a reescrita certa não vira acerto de primeira');
  ok(p.jogosVila?.moveis?.length === 3, `os 3 móveis chegaram na casinha (${p.jogosVila?.moveis?.join(' ')})`);
  ok(!Object.values(p.habilidades).some((x) => x.tentativas.some((t) => /movel|casinha/.test(t.habilidade))), 'decorar não vira tentativa nem habilidade (regra 4)');

  // arrastar um móvel: o lugar fica salvo
  const peca = pg.locator('.cs-movel').first();
  const nome = await peca.getAttribute('data-movel');
  const caixa = await peca.boundingBox();
  const sala = await pg.locator('.cs-sala').boundingBox();
  await pg.mouse.move(caixa.x + caixa.width / 2, caixa.y + caixa.height / 2);
  await pg.mouse.down();
  await pg.mouse.move(sala.x + sala.width * 0.8, sala.y + sala.height * 0.85, { steps: 8 });
  await pg.mouse.up();
  await pg.waitForTimeout(400);
  p = await lerProgresso(pg, id);
  ok(p.jogosVila.posicoes[nome].x > 60, `arrastar o móvel guarda o lugar novo na casinha (${nome}: x=${p.jogosVila.posicoes[nome].x})`);

  // ---- desafio opcional de uma fase (o mesmo jogo, aberto pelo fim da missão do TF-18) ----
  if (!capturar || !movel) {
    await pg.goto(BASE + `#/c/${id}/jogo/estrada-pares/TF-18`);
    await pg.getByTestId('jogo-comecar-ouvir').click();
    await pg.getByTestId('estrada-pares').waitFor();
    ok(await jogarEscolhas(pg, 'estrada-pares', '.ep-placa'), 'desafio do TF-18 (Estrada): rodada inteira');
    p = await lerProgresso(pg, id);
    const td = tentativasDo(p, 'estrada-pares').filter((t) => t.contexto === 'desafio');
    ok(td.length === 4 && td.every((t) => t.habilidade === 'par-minimo-m-b' || t.habilidade === 'par-minimo-f-v'), `no desafio da fase, as escolhas ficam com contexto "desafio" e os pares daquela fase (${td.map((t) => t.alvo).join(' ')})`);
    ok(await pg.getByTestId('voltar-vila').isVisible(), 'o desafio termina com o caminho de volta para a vila');
  }
  await ctx.close();
}
