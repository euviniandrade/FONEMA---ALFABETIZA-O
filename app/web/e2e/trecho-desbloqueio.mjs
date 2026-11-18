// FONEMA · trecho E2E: DESBLOQUEIO PROGRESSIVO (D034; fila do dono nº 22, 18/11).
// Joga como uma criança nova, missão por missão (Letra A → som /a/ → Letra E), SEM recarregar a página entre uma e outra, e confere
// o que abre depois de cada atividade: o painel "Abriu!" do fim da missão, o selo "Novo!" na barra da vila e nos cartões, que o
// selo some depois de visitar, que o que continua fechado diz o que falta (bolinhas das missões ou barrinha), que a rodada de
// aquecimento (menos de 3 sons) grava EXPOSIÇÃO e não domínio.
// Uso: node e2e/fluxo.e2e.mjs --desbloqueio            (também roda dentro do E2E completo e do --sem-jornada)
//      node e2e/fluxo.e2e.mjs --capturas-desbloqueio   (capturas 1850×980 e 390×844 em app/docs/capturas/v13-desbloqueio-*.png)
import { resolve } from 'node:path';

const lerProgresso = (pg, id) => pg.evaluate(async (cid) => {
  const db = await new Promise((r) => { const q = indexedDB.open('fonema'); q.onsuccess = () => r(q.result); });
  return await new Promise((r) => { const q = db.transaction('progressos').objectStore('progressos').get(cid); q.onsuccess = () => r(q.result); });
}, id);

export async function trechoDesbloqueio(browser, h) {
  const { BASE, ok, passarPorteira, cadastrar, montarAvatar, jogarSessao, erros, w = 1280, h: alt = 800, suf = '', movel = false, capturar = false, dirCap } = h;
  console.log(`D. Desbloqueio progressivo (D034): criança nova, missão a missão (${w}×${alt})`);
  const ctx = await browser.newContext({ viewport: { width: w, height: alt }, locale: 'pt-BR', serviceWorkers: 'block', ...(movel ? { deviceScaleFactor: 2, isMobile: true, hasTouch: true } : {}) });
  await ctx.addInitScript(() => { try { localStorage.setItem('fonema-teste-rapido', '1'); } catch { /* sem armazenamento */ } });
  const pg = await ctx.newPage();
  pg.on('pageerror', (e) => erros.push(String(e)));
  const cap = async (nome) => {
    if (!capturar) return;
    await pg.waitForTimeout(700);
    await pg.screenshot({ path: resolve(dirCap, `v13-desbloqueio-${nome}${suf}.png`) });
    console.log(`  📸 v13-desbloqueio-${nome}${suf}.png`);
  };
  const cartao = (testid) => pg.getByTestId(testid);
  const aberto = async (testid) => (await cartao(testid).getAttribute('data-aberto')) === '1';
  const temNovo = async (loc) => (await loc.locator('[data-testid="selo-novo-extra"]').count()) > 0;

  await pg.goto(BASE + '#/adulto/cadastro');
  await passarPorteira(pg);
  await cadastrar(pg, 'Nina', 'f');
  await montarAvatar(pg);
  await pg.getByTestId('primeira-missao').waitFor();
  const id = pg.url().split('/c/')[1].split('/')[0];

  // ---------------- antes de qualquer missão ----------------
  await pg.goto(BASE + `#/c/${id}/brincar`);
  await cartao('jogo-corre-som').waitFor();
  ok(!(await aberto('jogo-corre-som')) && /próxima missão/.test(await cartao('jogo-corre-som').innerText()), 'antes da 1ª missão: o Corre-Som diz "Abre na próxima missão!" (não fica um cadeado mudo)');
  ok(await cartao('jogo-corre-som').locator('.falta-bolinhas i').count() === 1, 'o que falta aparece em bolinhas: 1 bolinha = 1 missão');
  ok(/Faltam 3 missões/.test(await cartao('jogo-memoria-sons').innerText()), 'Memória dos Sons: "Faltam 3 missões para abrir."');
  await cap('00-brincar-antes');

  /** Joga a missão de agora até o ritual (até 3 tentativas, como a jornada do E2E completo) e devolve se concluiu. */
  const jogarMissao = async (faseId) => {
    for (let t = 0; t < 3; t++) {
      await pg.goto(BASE + `#/c/${id}/alfabeto`);
      await pg.getByTestId('trilha-alfabeto').waitFor();
      await pg.goto(BASE + `#/c/${id}/sessao/${faseId}`);
      await jogarSessao(pg, {});
      await pg.getByTestId('ritual').locator('h1').waitFor();
      if (/Fase concluída/.test(await pg.getByTestId('ritual').locator('h1').innerText())) return true;
    }
    return false;
  };
  /** Volta à vila pelo botão do ritual (navegação dentro do app: nada de recarregar). */
  const voltarVila = async () => {
    await pg.getByTestId('voltar-vila').click();
    await pg.getByTestId('vila').waitFor();
  };

  // ---------------- missão 1: Letra A ----------------
  ok(await jogarMissao('AL-A'), 'missão 1 (Letra A) concluída');
  await pg.getByTestId('abriu').waitFor({ timeout: 20000 });
  const abriu1 = await pg.locator('[data-abriu]').evaluateAll((e) => e.map((x) => x.dataset.abriu));
  ok(['jogo:corre-som', 'jogo:come-som', 'som:A', 'peca:camisa:mata'].every((x) => abriu1.includes(x)), `"Abriu!" no fim da 1ª missão: Corre-Som, Bichinho, o som do A nos jogos e a camiseta verde (${abriu1.join(', ')})`);
  ok(!abriu1.includes('jogo:corre-som:figura'), '"Abriu!" mostra o jogo, sem repetir as variações dele');
  await cap('01-ritual-abriu');
  await voltarVila();
  ok(await pg.locator('[data-testid="ir-brincar"][data-novo="1"]').count() === 1, 'na vila, o botão Brincar ganha o selo "Novo!" (sem recarregar a página)');
  ok(await pg.locator('[data-novo="1"][data-ponto="lojinha"], [data-novo="1"][data-ponto="boneco"]').count() === 1, 'a Lojinha também ganha "Novo!" (a peça que abriu)');
  await cap('02-vila-novo');
  await pg.getByTestId('ir-brincar').click();
  await cartao('jogo-corre-som').waitFor();
  ok(await aberto('jogo-corre-som') && await aberto('jogo-come-som'), 'Brincar: Corre-Som e Bichinho já abertos com 1 som só');
  ok(await temNovo(cartao('jogo-corre-som')) && await temNovo(cartao('jogo-come-som')), 'os dois cartões têm "Novo!"');
  ok(!(await aberto('jogo-memoria-sons')) && /Faltam 2 missões/.test(await cartao('jogo-memoria-sons').innerText()), 'a Memória conta: "Faltam 2 missões"');
  await cap('03-brincar-depois-1');
  await cartao('jogo-come-som').click();
  await pg.getByTestId('jogo-variacoes').waitFor();
  ok(await pg.getByTestId('variacao-inicio').isEnabled() && await pg.getByTestId('variacao-fim').isEnabled(), 'Bichinho: "Começa com" e "Termina com" abertos com o som do A');
  ok(await pg.getByTestId('aquecimento').count() >= 1, 'com menos de 3 sons, o cartão avisa que é para aquecer');
  // uma rodada de aquecimento, sempre na comida certa
  await pg.getByTestId('variacao-inicio').click();
  for (let passo = 0; passo < 600; passo++) {
    if (await pg.getByTestId('jogo-fim').isVisible().catch(() => false)) break;
    const livre = await pg.getByTestId('come-som').getAttribute('data-livre').catch(() => null);
    const demo = await pg.getByTestId('come-som').getAttribute('data-demo').catch(() => null);
    if (livre && !demo) await pg.locator('.cm-prato[data-correta="1"]').first().click({ timeout: 1500 }).catch(() => {});
    await pg.waitForTimeout(120);
  }
  ok(await pg.getByTestId('jogo-fim').isVisible(), 'a rodada de aquecimento do Bichinho vai até o fim');
  const p1 = await lerProgresso(pg, id);
  const doBichinho = Object.values(p1.habilidades).flatMap((x) => x.tentativas).filter((t) => t.mecanica === 'come-som');
  ok(doBichinho.length >= 5 && doBichinho.every((t) => t.tipo === 'exposicao' && t.contexto === 'livre'), `aquecimento grava EXPOSIÇÃO, não domínio (regra 4): ${doBichinho.length} escolhas, todas "exposicao"`);
  await pg.getByTestId('jogo-outra').click();
  await pg.getByRole('button', { name: /Outros jogos/ }).click();
  await cartao('jogo-come-som').waitFor();
  ok(!(await temNovo(cartao('jogo-come-som'))) && await temNovo(cartao('jogo-corre-som')), 'depois de visitar, o "Novo!" sai do Bichinho e fica no Corre-Som (ainda não visitado)');

  // ---------------- missão 2: o som /a/ ----------------
  ok(await jogarMissao('TF-01'), 'missão 2 (o som /a/) concluída');
  await pg.getByTestId('abriu').waitFor({ timeout: 20000 });
  const abriu2 = await pg.locator('[data-abriu]').evaluateAll((e) => e.map((x) => x.dataset.abriu));
  ok(abriu2.includes('peca:calcado:ipe'), `"Abriu!" da 2ª missão: o tênis amarelo na Lojinha (${abriu2.join(', ')})`);
  await voltarVila();

  // ---------------- missão 3: Letra E ----------------
  ok(await jogarMissao('AL-E'), 'missão 3 (Letra E) concluída');
  await pg.getByTestId('abriu').waitFor({ timeout: 20000 });
  const abriu3 = await pg.locator('[data-abriu]').evaluateAll((e) => e.map((x) => x.dataset.abriu));
  ok(abriu3.includes('jogo:memoria') && abriu3.includes('som:E'), `"Abriu!" da 3ª missão: Memória dos Sons e o som do E nos jogos (${abriu3.join(', ')})`);
  await cap('04-ritual-abriu-3');
  // tocar no cartão do "Abriu!" leva direto ao jogo
  await pg.locator('[data-abriu="jogo:memoria"]').click();
  await pg.getByTestId('memoria-nivel-1').waitFor();
  ok(await pg.getByTestId('memoria-nivel-1').isEnabled(), 'tocar em "Memória dos Sons" no "Abriu!" leva ao jogo, com o nível 1 aberto (2 pares)');
  ok(/Faltam 2 missões|Faltam/.test(await pg.getByTestId('memoria-nivel-2').innerText()), 'o nível 2 diz quanto falta');
  await cap('05-memoria-niveis');

  // ---------------- Cantinho: o que falta, com missões ou barrinha ----------------
  await pg.goto(BASE + `#/c/${id}/leitura`);
  await pg.getByTestId('ir-escrita').waitFor();
  ok((await pg.getByTestId('ir-escrita').locator('[data-missoes]').getAttribute('data-missoes')) === '11', 'Cantinho: "Escrever do meu jeito" diz que faltam 11 missões');
  ok(await pg.getByTestId('ir-fluencia').locator('.falta-barra').count() === 1, '"Ler mais ligeiro" (critério de leitura, não de missões) mostra a barrinha do que falta');
  await cap('06-cantinho');

  await ctx.close();
}
