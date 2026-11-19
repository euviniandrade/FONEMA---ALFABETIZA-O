// FONEMA · trecho E2E com VOZ REAL (sem 'fonema-teste-rapido'): quantas vezes o NOME da criança é dito (fila do dono nº 27, item 2).
// Regra (decisão do dono): no máximo UMA vez no começo de cada atividade, prova ou jogo (servicos/nome-falado.ts).
// Conta os clipes do nome que TOCARAM (evento 'fonema:fala' com arquivo em audio/nomes/) numa lição inteira (Letra A)
// e numa rodada de jogo de escuta (Achar a rima), e quantas falas tinham o nome no texto (o que antes seria dito).
// Uso: node e2e/fluxo.e2e.mjs --nome-falado
/**
 * @param {import('@playwright/test').Browser} browser
 */
export async function trechoNomeFalado(browser, { BASE, ok, passarPorteira, cadastrar, montarAvatar, jogarSessao, jogarLivre, erros }) {
  console.log('N. Nome da criança: no máximo uma vez por atividade (voz real)');
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, locale: 'pt-BR', serviceWorkers: 'block' });
  const pg = await ctx.newPage();
  pg.on('pageerror', (e) => erros.push(String(e)));
  await pg.addInitScript(() => {
    window.__falasN = [];
    addEventListener('fonema:fala', (e) => window.__falasN.push({ t: Date.now(), hash: location.hash, cena: document.querySelector('[data-cena]')?.getAttribute('data-cena') ?? '', arquivo: e.detail?.arquivo ?? '', texto: e.detail?.texto ?? '', trecho: e.detail?.trecho ?? 0 }));
  });
  await pg.goto(BASE);
  await pg.evaluate(() => localStorage.setItem('fonema-teste-rapido', '1'));
  await pg.goto(BASE + '#/adulto/cadastro');
  await passarPorteira(pg);
  await cadastrar(pg, 'Mariana', 'f');
  await montarAvatar(pg);
  await pg.waitForFunction(() => location.hash.includes('/c/'));
  const id = pg.url().split('/c/')[1].split('/')[0];
  await pg.evaluate(() => localStorage.removeItem('fonema-teste-rapido'));
  await pg.goto(BASE + `#/c/${id}/vila`);
  await pg.reload();
  await pg.waitForTimeout(3000);

  const resumo = async (t0, t1) => pg.evaluate(([a, b]) => {
    const fs = window.__falasN.filter((f) => f.t >= a && f.t <= b);
    const nome = fs.filter((f) => /audio\/nomes\//.test(f.arquivo));
    const comNome = fs.filter((f) => f.trecho === 0 && /Mari[aá]na/.test(f.texto));
    return { amostra: [...new Set(fs.filter((f) => f.trecho === 0).map((f) => `${f.cena}:${f.texto.slice(0, 50)}`))].slice(0, 40), fim: location.hash, falas: fs.filter((f) => f.trecho === 0).length, nome: nome.length, comNome: comNome.length, cenasComNome: nome.map((f) => f.cena || f.hash), textos: comNome.map((f) => {
      const arqs = fs.filter((g) => g.texto === f.texto && g.t >= f.t && g.t - f.t < 15000).map((g) => g.arquivo.split('/').slice(-2).join('/'));
      return `[${f.cena || f.hash.split('/').pop()}] ${f.texto} → ${arqs.join(' + ')}`;
    }).slice(0, 30),
    nomesTocados: nome.map((f) => `${f.hash.split('/').pop()} ${f.cena} «${f.texto}»`) };
  }, [t0, t1]);

  // ---- uma lição inteira (Letra A), voz real ----
  const tL = Date.now();
  await pg.evaluate((cid) => { location.hash = `#/c/${cid}/sessao/AL-A`; }, id);
  await Promise.race([jogarSessao(pg), pg.waitForTimeout(240000)]);
  const lic = await resumo(tL, Date.now());
  if (process.env.NOME_DIAG) console.log(lic.fim, lic.amostra);
  console.log(`  clipes do nome que tocaram: ${lic.nomesTocados.join(' | ')}`);
  console.log(`  falas com nome na lição:\n    ${lic.textos.join('\n    ')}`);
  const cenas = new Set(lic.cenasComNome);
  console.log(`  lição: ${lic.falas} falas, ${lic.comNome} com o nome no texto, nome dito ${lic.nome}× (${[...cenas].join(', ')})`);
  ok(lic.nome <= Math.max(1, cenas.size) && lic.cenasComNome.length === cenas.size, `lição: o nome foi dito no máximo 1× por atividade (${lic.nome}× em ${lic.comNome} falas que tinham o nome)`);

  // ---- um jogo de escuta (Achar a rima), voz real: várias rodadas ----
  const tJ = Date.now();
  await pg.evaluate((cid) => { location.hash = `#/c/${cid}/brincar/rimas`; }, id);
  await pg.getByTestId('brincar').waitFor({ timeout: 15000 });
  await Promise.race([jogarLivre(pg, 'brincar-fim'), pg.waitForTimeout(240000)]);
  const jog = await resumo(tJ, Date.now());
  console.log(`  jogo: ${jog.falas} falas, ${jog.comNome} com o nome no texto, nome dito ${jog.nome}×`);
  if (process.env.NOME_DIAG) console.log(jog.fim, jog.amostra);
  if (jog.textos.length) console.log(`  falas com nome no jogo:\n    ${jog.textos.join('\n    ')}`);
  ok(jog.nome <= 1, `jogo: o nome foi dito no máximo 1× (${jog.nome}× em ${jog.comNome} falas que tinham o nome)`);
  await ctx.close();
  return { licao: lic, jogo: jog };
}
