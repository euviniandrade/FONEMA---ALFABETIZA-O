// FONEMA · trecho E2E: JOGOS FÔNICOS (D032 §4) — Corre-Som e Bichinho Come-Som.
// Confere: os jogos ficam trancados sem sons ensinados; com sons ensinados (fases semeadas como concluídas) abrem as variações;
// uma rodada de cada jogo até o fim (com um erro e a correção); cada escolha gravada pelo contrato do motor (avaliada, mecânica
// do jogo, alvo, escolhido, tempo, 3 opções, posições, contexto 'livre'); moedinhas não mudam; e o desafio opcional dentro de
// uma fase (Letra A: "som → letra" vira Corre-Som e "som → figura" vira Bichinho) com contexto 'desafio', e a fase conclui.
// Uso: node e2e/fluxo.e2e.mjs --jogos   (também roda dentro do E2E completo e do --sem-jornada)
//      node e2e/fluxo.e2e.mjs --capturas-jogos   (capturas 1850×980 e 390×844 em app/docs/capturas/v10-jogos-*.png)
import { resolve } from 'node:path';

/** Lê o progresso da criança direto do IndexedDB. */
const lerProgresso = (pg, id) => pg.evaluate(async (cid) => {
  const db = await new Promise((r) => { const q = indexedDB.open('fonema'); q.onsuccess = () => r(q.result); });
  return await new Promise((r) => { const q = db.transaction('progressos').objectStore('progressos').get(cid); q.onsuccess = () => r(q.result); });
}, id);

/** Marca fases como concluídas (só o estado: o filtro de "já ensinado" lê as fases concluídas). */
const semear = (pg, id, fases) => pg.evaluate(async ([cid, fs]) => {
  const db = await new Promise((r) => { const q = indexedDB.open('fonema'); q.onsuccess = () => r(q.result); });
  const p = await new Promise((r) => { const q = db.transaction('progressos').objectStore('progressos').get(cid); q.onsuccess = () => r(q.result); });
  const agora = Date.now() - 3600e3;
  for (const f of fs) p.fases[f] = { ...(p.fases[f] ?? {}), estado: 'concluida', sessoes: 1, concluidaEm: agora };
  await new Promise((r) => { const tx = db.transaction('progressos', 'readwrite'); tx.objectStore('progressos').put(p); tx.oncomplete = r; });
}, [id, fases]);

const tentativasDo = (p, mecanica) => Object.values(p.habilidades).flatMap((h) => h.tentativas).filter((t) => t.mecanica === mecanica);

/**
 * Joga a rodada do jogo que está na tela até o fim (ou até a tela do jogo sumir, no desafio da fase).
 * `errar`: erra o 1º item uma vez (confere a correção e os arcos/pratinhos que voltam).
 */
async function jogarRodada(pg, { errar = false, tirar = async () => {} } = {}) {
  let errou = !errar;
  for (let passo = 0; passo < 900; passo++) {
    if (await pg.getByTestId('jogo-fim').isVisible().catch(() => false)) return true;
    const corre = pg.getByTestId('corre-som');
    const come = pg.getByTestId('come-som');
    const ehCorre = await corre.isVisible().catch(() => false);
    const ehCome = !ehCorre && await come.isVisible().catch(() => false);
    if (!ehCorre && !ehCome) return true; // desafio da fase: a cena acabou e a sessão seguiu
    if (ehCorre) {
      const fase = await corre.getAttribute('data-fase').catch(() => '');
      const demo = await corre.getAttribute('data-demo').catch(() => null);
      if (fase === 'escolher' && !demo) {
        await tirar('corre-escolher');
        const alvo = errou ? '.cs-pista[data-correta="1"]' : '.cs-pista:not([data-correta])';
        await pg.locator(alvo).first().click({ timeout: 2000 }).catch(() => {});
        if (!errou) { errou = true; await pg.waitForTimeout(300); await tirar('corre-correcao'); }
        await pg.waitForTimeout(120);
        continue;
      }
      if (fase === 'correndo' || fase === 'chegando') await tirar('corre-correndo');
    } else {
      const livre = await come.getAttribute('data-livre').catch(() => null);
      const demo = await come.getAttribute('data-demo').catch(() => null);
      if (livre && !demo) {
        await tirar('come-escolher');
        const alvo = errou ? '.cm-prato[data-correta="1"]' : '.cm-prato:not([data-correta])';
        await pg.locator(alvo).first().click({ timeout: 2000 }).catch(() => {});
        if (!errou) { errou = true; await pg.waitForTimeout(150); await tirar('come-correcao'); }
        await pg.waitForTimeout(120);
        continue;
      }
    }
    await pg.waitForTimeout(80);
  }
  return false;
}

/**
 * @param {import('@playwright/test').Browser} browser
 * @param {{ BASE: string, ok: Function, passarPorteira: Function, cadastrar: Function, montarAvatar: Function, jogarSessao: Function, erros: string[],
 *           w?: number, h?: number, suf?: string, movel?: boolean, capturar?: boolean, dirCap?: string, rapido?: boolean }} h
 */
export async function trechoJogos(browser, h) {
  const { BASE, ok, passarPorteira, cadastrar, montarAvatar, jogarSessao, erros, w = 1280, h: alt = 800, suf = '', movel = false, capturar = false, dirCap, rapido = true } = h;
  console.log(`J. Jogos fônicos: Corre-Som e Bichinho Come-Som (${w}×${alt})`);
  const ctx = await browser.newContext({ viewport: { width: w, height: alt }, locale: 'pt-BR', serviceWorkers: 'block', ...(movel ? { deviceScaleFactor: 2, isMobile: true, hasTouch: true } : {}) });
  await ctx.addInitScript((r) => { try { if (r) localStorage.setItem('fonema-teste-rapido', '1'); } catch { /* sem armazenamento */ } }, rapido);
  const pg = await ctx.newPage();
  pg.on('pageerror', (e) => erros.push(String(e)));
  const feitas = new Set();
  const cap = (prefixo) => async (nome) => {
    if (!capturar || feitas.has(prefixo + nome)) return;
    feitas.add(prefixo + nome);
    await pg.waitForTimeout(rapido ? 450 : 900);
    await pg.screenshot({ path: resolve(dirCap, `v10-jogos-${prefixo}${nome}${suf}.png`) });
    console.log(`  📸 v10-jogos-${prefixo}${nome}${suf}.png`);
  };

  await pg.goto(BASE + '#/adulto/cadastro');
  await passarPorteira(pg);
  await cadastrar(pg, 'Bia', 'f');
  await montarAvatar(pg);
  await pg.getByTestId('primeira-missao').waitFor();
  const id = pg.url().split('/c/')[1].split('/')[0];

  // sem nada ensinado: os jogos aparecem, mas trancados
  await pg.goto(BASE + `#/c/${id}/brincar`);
  await pg.getByTestId('jogo-corre-som').waitFor();
  ok(await pg.locator('[data-testid="jogo-corre-som"].trancado').count() === 1 && await pg.locator('[data-testid="jogo-come-som"].trancado').count() === 1, 'Brincar › Jogos: Corre-Som e Bichinho aparecem trancados antes de qualquer som ensinado');
  await pg.getByTestId('jogo-corre-som').click();
  await pg.getByTestId('jogo-variacoes').waitFor();
  ok(await pg.getByTestId('variacao-letra').isDisabled() && await pg.getByTestId('variacao-figura').isDisabled(), 'sem sons ensinados, nenhuma variação abre (só sons já ensinados)');

  // semeia letras e sons ensinados: vogais, M e F
  await semear(pg, id, ['AL-A', 'TF-01', 'AL-E', 'TF-02', 'AL-I', 'TF-03', 'AL-O', 'TF-04', 'AL-U', 'TF-05', 'TF-06', 'AL-RV1', 'AL-M', 'TF-07', 'AL-F', 'TF-08']);
  const antes = await lerProgresso(pg, id);
  await pg.goto(BASE + `#/c/${id}/brincar`); await pg.reload();
  await pg.getByTestId('jogo-corre-som').waitFor();
  await cap('')('01-brincar-jogos');
  ok(await pg.locator('[data-testid="jogo-corre-som"].trancado').count() === 0, 'com sons ensinados, o Corre-Som abre');

  // ---- Corre-Som, letras ----
  await pg.getByTestId('jogo-corre-som').click();
  await pg.getByTestId('variacao-letra').waitFor();
  await cap('')('02-corre-variacoes');
  ok(await pg.getByTestId('variacao-letra').isEnabled() && await pg.getByTestId('variacao-figura').isEnabled(), 'Corre-Som: "Letras" e "Figuras" abertas com 7 sons ensinados');
  await pg.getByTestId('variacao-letra').click();
  await pg.getByTestId('corre-som').waitFor();
  const letrasNaTela = new Set();
  const tirarCorre = async (k) => {
    if (k === 'corre-escolher') for (const x of await pg.locator('.cs-pista[data-opcao]').evaluateAll((es) => es.map((e) => e.dataset.opcao))) letrasNaTela.add(x);
    await cap('')(k === 'corre-escolher' ? '03-corre-escolher' : k === 'corre-correcao' ? '04-corre-correcao' : '03b-corre-correndo');
  };
  ok(await jogarRodada(pg, { errar: true, tirar: tirarCorre }), 'Corre-Som (letras): rodada inteira jogada, com um erro corrigido');
  await cap('')('05-corre-fim');
  ok([...letrasNaTela].every((l) => 'AEIOUMF'.includes(l)), `só letras já ensinadas nas pistas (${[...letrasNaTela].join(' ')})`);
  let p = await lerProgresso(pg, id);
  const tc = tentativasDo(p, 'corre-som');
  ok(tc.length === 6, `Corre-Som: 6 escolhas gravadas (${tc.length})`);
  ok(tc.every((t) => t.tipo === 'avaliada' && t.contexto === 'livre' && t.nOpcoes === 3 && typeof t.tempoMs === 'number' && t.posicaoCerta !== undefined && t.posicaoEscolhida !== undefined && t.alvo && t.escolhido && t.formato === 'som-letra'),
    'cada escolha: avaliada, contexto livre, alvo, escolhido, tempo, 3 opções e posições');
  ok(tc.some((t) => t.respostas.length === 2 && t.comAjuda && t.escolhido !== t.alvo), 'o item errado ficou "com ajuda" e com a escolha errada registrada (matriz de confusão)');
  ok(p.moedinhas.saldo === antes.moedinhas.saldo, 'moedinhas da pista são enfeite: o porquinho não muda (regra 4)');

  // ---- Bichinho Come-Som, começo ----
  await pg.goto(BASE + `#/c/${id}/brincar/come-som`);
  await pg.getByTestId('variacao-inicio').waitFor();
  await cap('')('06-come-variacoes');
  await pg.getByTestId('variacao-inicio').click();
  await pg.getByTestId('come-som').waitFor();
  ok(await jogarRodada(pg, { errar: true, tirar: async (k) => cap('')(k === 'come-escolher' ? '07-come-escolher' : '08-come-correcao') }), 'Bichinho Come-Som (começa com): rodada inteira jogada, com um erro corrigido');
  await cap('')('09-come-fim');
  p = await lerProgresso(pg, id);
  const tm = tentativasDo(p, 'come-som');
  ok(tm.length === 6 && tm.every((t) => t.tipo === 'avaliada' && t.contexto === 'livre' && t.habilidade === 'som-inicial' && t.categoria === 'fonema' && t.nOpcoes === 3), 'Bichinho: 6 escolhas gravadas (som inicial, avaliadas, contexto livre)');

  // ---- Bichinho, fim (só abre com A, I e U) ----
  await pg.getByTestId('jogo-outra').click();
  await pg.getByTestId('variacao-fim').click();
  await pg.getByTestId('come-som').waitFor();
  await cap('')('10-come-fim-escolher');
  ok(await jogarRodada(pg), 'Bichinho Come-Som (termina com): rodada inteira jogada');
  p = await lerProgresso(pg, id);
  ok(tentativasDo(p, 'come-som').filter((t) => t.habilidade === 'som-final').length === 6, 'variação "termina com": 6 escolhas na habilidade som final');

  // ---- desafio dentro da fase: Letra A ----
  if (!capturar || !movel) {
    await pg.goto(BASE + `#/c/${id}/sessao/AL-A`);
    const jogados = new Set();
    await jogarSessao(pg, {
      gancho: async (page) => {
        const oferta = page.getByTestId('oferecer-jogo');
        if (!(await oferta.isVisible().catch(() => false))) return;
        const jogo = await oferta.getAttribute('data-jogo');
        if (jogados.has(jogo)) return;
        jogados.add(jogo);
        await cap('fase-')(jogo === 'corre-som' ? '11-oferta-corre' : '13-oferta-come');
        await oferta.click();
        await page.getByTestId(jogo).waitFor();
        await jogarRodada(page, { tirar: async () => cap('fase-')(jogo === 'corre-som' ? '12-desafio-corre' : '14-desafio-come') });
      }
    });
    console.log('  · jogos oferecidos na Letra A:', [...jogados].join(', ') || 'nenhum');
    ok(jogados.has('corre-som') && jogados.has('come-som'), 'Letra A: a cena "som → letra" ofereceu o Corre-Som e a "som → figura" o Bichinho, e os dois foram jogados');
    await pg.getByTestId('ritual').locator('h1').waitFor();
    p = await lerProgresso(pg, id);
    const td = Object.values(p.habilidades).flatMap((x) => x.tentativas).filter((t) => t.contexto === 'desafio');
    ok(td.some((t) => t.mecanica === 'corre-som' && t.cena === 'AL-A-C3' && t.habilidade === 'letra-a') && td.some((t) => t.mecanica === 'come-som' && t.cena === 'AL-A-C4'),
      'no desafio, as escolhas entram na cena da fase com contexto "desafio" e a mecânica do jogo');
    ok(await pg.getByTestId('ritual').isVisible(), 'a fase segue até o ritual de fim depois do desafio');
  }
  await ctx.close();
}
