// FONEMA · capturas das letras "Aa" (fila do dono nº 27, item 4): letra isolada sempre maiúscula e minúscula.
// Uso: CAPTURAS_AA=<pasta> node e2e/fluxo.e2e.mjs --capturas-aa   (390×844 e 1850×980)
export async function trechoCapturasAa(browser, { BASE, ok, passarPorteira, cadastrar, montarAvatar, jogarSessao, semearTrilhaFeita, dir, erros }) {
  console.log('Aa. Capturas das letras em maiúscula e minúscula');
  for (const [w, h] of [[390, 844], [1850, 980]]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, locale: 'pt-BR', serviceWorkers: 'block' });
    await ctx.addInitScript(() => { try { localStorage.setItem('fonema-teste-rapido', '1'); } catch { /* */ } });
    const pg = await ctx.newPage();
    pg.on('pageerror', (e) => erros.push(String(e)));
    const cap = (n) => pg.screenshot({ path: `${dir}/v15-aa-${w}-${n}.png` });
    await pg.goto(BASE + '#/adulto/cadastro');
    await passarPorteira(pg);
    await cadastrar(pg, 'Ana', 'f');
    await montarAvatar(pg);
    await pg.waitForFunction(() => location.hash.includes('/c/'));
    const id = pg.url().split('/c/')[1].split('/')[0];
    // lição da letra A até a 1ª escolha com letras
    await pg.goto(BASE + `#/c/${id}/sessao/AL-A`);
    let viuLetra = false, viuEspelho = false;
    await Promise.race([jogarSessao(pg, { gancho: async (p) => {
      if (!viuEspelho && await p.locator('[data-testid=letra-espelho].visivel, .letra-surge.visivel').count().catch(() => 0)) { viuEspelho = true; await p.waitForTimeout(400); await cap('espelho'); }
      if (viuLetra) return;
      const l = p.locator('button.opcao .letra');
      if (await l.count().catch(() => 0)) { viuLetra = true; await p.waitForTimeout(400); await cap('licao-letras'); const t = await l.allInnerTexts(); ok(t.every((x) => x.length !== 1 || !/\p{L}/u.test(x)), `opções de letra em "Aa" (${t.join(' ')})`); }
    } }), pg.waitForTimeout(120000)]);
    await semearTrilhaFeita(pg, id);
    for (const [rota, nome, sel] of [['alfabeto', 'trilha-az', '.marco.letra'], ['memoria', 'memoria', '[data-carta]'], ['album', 'album', 'main']]) {
      await pg.goto(BASE + `#/c/${id}/${rota}`); await pg.reload();
      await pg.locator(sel).first().waitFor({ timeout: 20000 }).catch(() => {});
      await pg.waitForTimeout(1200);
      await cap(nome);
    }
    // selo de letra no álbum (desenhado em canvas)
    await pg.goto(BASE + `#/c/${id}/album`); await pg.reload();
    const selo = pg.locator('.selo, [data-selo], canvas').first();
    if (await selo.waitFor({ timeout: 15000 }).then(() => true, () => false)) { await selo.scrollIntoViewIfNeeded().catch(() => {}); await pg.waitForTimeout(1200); await cap('album-selo'); }
    // memória: vira uma carta de letra para ver o "Aa"
    await pg.goto(BASE + `#/c/${id}/memoria`); await pg.reload();
    const carta = pg.locator('.mem-letras [data-carta]').first();
    if (await carta.waitFor({ timeout: 15000 }).then(() => true, () => false)) { await carta.click().catch(() => {}); await pg.waitForTimeout(700); await cap('memoria-virada'); }
    await ctx.close();
  }
}
