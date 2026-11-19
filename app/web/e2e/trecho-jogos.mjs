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
    // corrida (D035): o arco da vez primeiro (o arco não espera)
    const vez = pg.locator('[data-testid=corre-som][data-decidir="1"]');
    if (await vez.count().catch(() => 0)) {
      const antes = Number(await vez.getAttribute('data-passados').catch(() => '0'));
      const alvo = errou ? '.cs-pista[data-correta="1"]' : '.cs-pista[data-opcao]:not([data-correta])';
      await pg.locator(alvo).first().click({ timeout: 1500, force: true }).catch(() => {});
      await tirar('corre-escolher');
      const passou = await pg.waitForFunction((n) => { const e = document.querySelector('[data-testid=corre-som]'); return !e || Number(e.getAttribute('data-passados')) > n || e.getAttribute('data-fase') === 'fim'; }, antes, { timeout: 8000 }).then(() => true, () => false);
      if (!errou && passou) { errou = true; await tirar('corre-correcao'); }
      continue;
    }
    if (await pg.getByTestId('jogo-fim').isVisible().catch(() => false)) return true;
    // D035: fim da corrida do Corre-Som (Brincar: tela de resultado; fase: "Continuar" volta para a sessão)
    const continuar = pg.getByTestId('corrida-continuar');
    if (await continuar.isVisible().catch(() => false)) { await tirar('corre-fim-fase'); await continuar.click().catch(() => {}); await pg.waitForTimeout(150); continue; }
    if (await pg.getByTestId('corrida-fim').isVisible().catch(() => false)) return true;
    const corre = pg.getByTestId('corre-som');
    const come = pg.getByTestId('come-som');
    const ehCorre = await corre.isVisible().catch(() => false);
    const ehCome = !ehCorre && await come.isVisible().catch(() => false);
    if (!ehCorre && !ehCome) return true; // desafio da fase: a cena acabou e a sessão seguiu
    if (ehCorre) {
      // corrida (D035): a pista não para; o arco que vem é o da vez (data-decidir). Troca para a pista e espera ele passar.
      const decidir = await corre.getAttribute('data-decidir').catch(() => null);
      if (decidir) {
        const antes = Number(await corre.getAttribute('data-passados').catch(() => '0'));
        await tirar('corre-escolher');
        const alvo = errou ? '.cs-pista[data-correta="1"]' : '.cs-pista[data-opcao]:not([data-correta])';
        await pg.locator(alvo).first().click({ timeout: 1500, force: true }).catch(() => {});
        const passou = await pg.waitForFunction((n) => { const e = document.querySelector('[data-testid=corre-som]'); return !e || Number(e.getAttribute('data-passados')) > n || e.getAttribute('data-fase') === 'fim'; }, antes, { timeout: 6000 }).then(() => true, () => false);
        if (!errou && passou) { errou = true; await tirar('corre-correcao'); }
        continue;
      }
      const fase = await corre.getAttribute('data-fase').catch(() => '');
      if (fase === 'correndo' || fase === 'largada') await tirar('corre-correndo');
    } else {
      const livre = await come.getAttribute('data-livre').catch(() => null);
      const demo = await come.getAttribute('data-demo').catch(() => null);
      if (livre && !demo) {
        await tirar('come-escolher');
        const alvo = errou ? '.cm-prato[data-correta="1"]' : '.cm-prato:not([data-correta])';
        await pg.locator(alvo).first().click({ timeout: 2000 }).catch(() => {});
        const aceito = await pg.waitForFunction(() => !document.querySelector('[data-testid=come-som]')?.hasAttribute('data-livre'), null, { timeout: 1500 }).then(() => true, () => false);
        if (!errou && aceito) { errou = true; await pg.waitForTimeout(150); await tirar('come-correcao'); }
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
    if (k === 'corre-fim-fase') return;
    if (k === 'corre-escolher') for (const x of await pg.locator('.cs-pista[data-opcao]').evaluateAll((es) => es.map((e) => e.dataset.opcao))) letrasNaTela.add(x);
    await cap('')(k === 'corre-escolher' ? '03-corre-escolher' : k === 'corre-correcao' ? '04-corre-correcao' : '03b-corre-correndo');
  };
  ok(await jogarRodada(pg, { errar: true, tirar: tirarCorre }), 'Corre-Som (letras): corrida inteira jogada sem parar, com um erro');
  await cap('')('05-corre-fim');
  const fimC = pg.getByTestId('corrida-fim');
  const pontos = Number(await fimC.getAttribute('data-pontos').catch(() => '-1'));
  const estrelas = Number(await fimC.getAttribute('data-estrelas').catch(() => '-1'));
  ok(pontos > 0 && estrelas >= 1, `fim da corrida: pontos e estrelas (${pontos} pontos, ${estrelas} estrelas)`);
  ok(await fimC.getByTestId('corrida-erros').isVisible().catch(() => false), 'fim da corrida: a letra errada aparece com o som de cada uma (correção contrastiva no fim)');
  ok(await pg.getByTestId('corrida-proximo').isVisible().catch(() => false) === (estrelas >= 2), 'bateu a meta (2 estrelas) = "Próximo nível"');
  ok([...letrasNaTela].every((l) => 'AEIOUMF'.includes(l)), `só letras já ensinadas nas pistas (${[...letrasNaTela].join(' ')})`);
  let p = await lerProgresso(pg, id);
  const tc = tentativasDo(p, 'corre-som');
  ok(tc.length === 8, `Corre-Som: cada passagem pelo arco gravada (${tc.length} de 8 no modo de teste)`);
  ok(tc.every((t) => t.tipo === 'avaliada' && t.contexto === 'livre' && t.nOpcoes === 3 && typeof t.tempoMs === 'number' && t.posicaoCerta !== undefined && t.posicaoEscolhida !== undefined && t.alvo && t.escolhido && t.formato === 'corrida' && t.corrida && t.corrida.nivel === 1),
    'cada passagem: avaliada, formato corrida, contexto livre, alvo, escolhido, tempo, 3 opções, posições e o estado da corrida');
  ok(tc.some((t) => !t.acertou && t.escolhido !== t.alvo && t.respostas.length === 1), `a passagem errada ficou errada, com a escolha registrada (matriz de confusão) ${JSON.stringify(tc.map((t) => [t.alvo, t.escolhido, t.acertou]))}`);
  // o robô do teste às vezes toca tarde com a máquina carregada: o arco passa sem escolha e fica gravado como não-escolha (não conta)
  const comEscolha = tc.filter((t) => t.corrida?.mexeu).length;
  ok(comEscolha >= 6 && tc.every((t) => typeof t.corrida?.mexeu === 'boolean'), `passagens com escolha (a criança tocou a pista) marcadas para contar; as sem escolha marcadas para não contar (${comEscolha} de ${tc.length} com escolha)`);
  const ganhou = p.moedinhas.saldo - antes.moedinhas.saldo;
  const mostrou = Number((await pg.getByTestId('corrida-moedinhas').innerText().catch(() => '+0')).replace(/\D+/g, '') || 0);
  ok(ganhou >= 0 && ganhou <= 3 && ganhou === mostrou, `moedinhas da Lojinha pela corrida: entre 0 e 3, iguais às mostradas (${ganhou})`);

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
      gancho: async (page, cena) => {
        const oferta = page.getByTestId('oferecer-jogo');
        // a cena pode montar entre o gancho e o clique na resposta: nas duas cenas que viram jogo, espera a oferta aparecer
        // (o data-cena às vezes ainda mostra a cena anterior): enquanto faltar um jogo, espera a oferta um pouco em cada passo
        if (jogados.size < 2 && !/-C5/.test(cena)) await oferta.waitFor({ timeout: 2500 }).catch(() => {});
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

/**
 * D035: sequência de capturas de UMA corrida do Corre-Som em velocidade real (sem o modo de teste: pista 3D andando, ondas,
 * ✖, +N, placar e tempo) e o fim. Lê a medida de quadros por segundo da pista (data-fps do canvas, qualidade adaptativa).
 * Uso: node e2e/fluxo.e2e.mjs --capturas-corrida   (1850×980 e 390×844 em app/docs/capturas/v15-corrida-*.png)
 */
export async function capturasCorrida(browser, h) {
  const { BASE, ok, passarPorteira, cadastrar, montarAvatar, erros, w = 1850, h: alt = 980, suf = '', movel = false, dirCap } = h;
  console.log(`K. Corre-Som em corrida: capturas em velocidade real (${w}×${alt})`);
  const ctx = await browser.newContext({ viewport: { width: w, height: alt }, locale: 'pt-BR', serviceWorkers: 'block', ...(movel ? { deviceScaleFactor: 2, isMobile: true, hasTouch: true } : {}) });
  const pg = await ctx.newPage();
  pg.on('pageerror', (e) => erros.push(String(e)));
  await pg.goto(BASE + '#/adulto/cadastro');
  await pg.evaluate(() => localStorage.setItem('fonema-teste-rapido', '1'));
  await pg.reload();
  await passarPorteira(pg);
  await cadastrar(pg, 'Bia', 'f');
  await montarAvatar(pg);
  await pg.getByTestId('primeira-missao').waitFor();
  const id = pg.url().split('/c/')[1].split('/')[0];
  await semear(pg, id, ['AL-A', 'TF-01', 'AL-E', 'TF-02', 'AL-I', 'TF-03', 'AL-O', 'TF-04', 'AL-U', 'TF-05', 'TF-06', 'AL-RV1', 'AL-M', 'TF-07', 'AL-F', 'TF-08']);
  // a demonstração já vista (vai direto à corrida); velocidade real
  await pg.evaluate((cid) => { localStorage.setItem(`fonema-demo-jogo:${cid}:corre-som:letra`, '1'); localStorage.removeItem('fonema-teste-rapido'); }, id);
  await pg.goto(BASE + `#/c/${id}/brincar/corre-som`); await pg.reload();
  await pg.getByTestId('variacao-letra').click();
  await pg.getByTestId('corre-som').waitFor();
  const t0 = Date.now();
  await pg.waitForFunction(() => document.querySelector('[data-testid=corre-som]')?.getAttribute('data-fase') === 'correndo', null, { timeout: 30000 }).catch(() => {});
  ok(Date.now() - t0 < 15000, `a corrida largou sem "esperando a pista" (${Math.round((Date.now() - t0) / 100) / 10} s, com a fala de abertura)`);
  let n = 0, errou = false;
  const fps = [];
  const foto = async (nome) => { await pg.screenshot({ path: resolve(dirCap, `v15-corrida-${String(++n).padStart(2, '0')}-${nome}${suf}.png`) }); };
  for (let passo = 0; passo < 400; passo++) {
    if (await pg.getByTestId('corrida-fim').isVisible().catch(() => false)) break;
    const corre = pg.getByTestId('corre-som');
    const f = await pg.locator('.cs-canvas').getAttribute('data-fps').catch(() => null);
    if (f) fps.push(Number(f));
    if (await corre.getAttribute('data-decidir').catch(() => null)) {
      const antes = Number(await corre.getAttribute('data-passados').catch(() => '0'));
      if (n < 16 && antes % 2 === 0) await foto('arco');
      const alvo = !errou && antes === 2 ? '.cs-pista[data-opcao]:not([data-correta])' : '.cs-pista[data-correta="1"]';
      await pg.locator(alvo).first().click({ timeout: 1500, force: true }).catch(() => {});
      if (alvo.includes('not')) errou = true;
      await pg.waitForFunction((x) => { const e = document.querySelector('[data-testid=corre-som]'); return !e || Number(e.getAttribute('data-passados')) > x; }, antes, { timeout: 8000 }).catch(() => {});
      if (n < 18) { await pg.waitForTimeout(120); await foto(antes === 2 ? 'errou' : 'passou'); }
      continue;
    }
    await pg.waitForTimeout(150);
  }
  await pg.getByTestId('corrida-fim').waitFor({ timeout: 90000 }).catch(() => {});
  await pg.waitForTimeout(600);
  await foto('fim');
  const media = fps.length ? Math.round(fps.reduce((a, b) => a + b, 0) / fps.length) : 0;
  console.log(`  · quadros por segundo medidos pela pista (navegador sem tela, sem placa de vídeo): média ${media}, mínimo ${fps.length ? Math.min(...fps) : 0}, ${fps.length} medidas`);
  ok(await pg.getByTestId('corrida-fim').isVisible().catch(() => false), 'a corrida em velocidade real chegou ao fim com o resultado');
  await ctx.close();
}
