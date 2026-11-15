// FONEMA · capturas do avatar 3D (D029 §7) em app/docs/capturas/v6-avatar-*.png.
// Uso (depois de `npm run build`):  node web/e2e/capturas-avatar.mjs [grupo]
//   grupos: padrao · cores · pele · montar · lojinha · miniaturas   (sem grupo = todos)
// Sobe o próprio servidor de preview (porta 4188) — ou use BASE_URL=http://localhost:PORTA/ com um build próprio —,
// grava crianças direto no banco do aparelho e fotografa o boneco de verdade (modelo 3D recolorido).
import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const aqui = dirname(fileURLToPath(import.meta.url));
const DIR = resolve(aqui, '../../docs/capturas');
const EXEC = process.env.CHROMIUM ?? '/opt/pw-browsers/chromium';
const FILTRO = process.argv[2] ?? '';
const PORTA = 4188;
let BASE = process.env.BASE_URL;
let servidor;

const crianca = (id, nome, genero, avatar = {}) => ({
  id, nome, genero, anoNascimento: 2020,
  pronuncia: { grafia: nome, fala: nome, rate: 1, pitchExtra: 0, voz: 'sofia' },
  avatar: { versao: 3, cantinho: 'ceu', pele: null, olhos: null, corCabelo: null, cabelo: null, camisa: null, calca: null, calcado: null, acessibilidade: [], pronto: true, ...avatar },
  apoios: { previsivel: false, focoCurto: false, leituraReforco: false, calmo: false },
  jaSabe: { letrasDoNome: 'nao-sei', lePalavras: 'nao-sei', leFrases: 'nao-sei' },
  consentimentos: { responsavel: true, vozPrimeiroNome: true, gravarVozAdulto: false, em: 1 },
  rotina: { minutosDia: 15, horaDormir: '20:00' }, criadoEm: Date.now()
});

/** Seis combinações bem diferentes (três meninos, três meninas). */
const COMBINACOES = [
  ['combinacao-1-menina-negra-retinta', 'f', { pele: 'pele-10', olhos: 'preto', corCabelo: 'preto', camisa: 'ipe', calca: 'jeans', calcado: 'marinho' }],
  ['combinacao-2-menino-pardo', 'm', { pele: 'pele-06', olhos: 'mel', corCabelo: 'preto', camisa: 'ceu', calca: 'marinho' }],
  ['combinacao-3-menina-ruiva', 'f', { pele: 'pele-01', olhos: 'verde', corCabelo: 'ruivo', camisa: 'mata', calca: 'cinza', calcado: 'terra' }],
  ['combinacao-4-menino-loiro', 'm', { pele: 'pele-02', olhos: 'azul', corCabelo: 'loiro', camisa: 'terra', calca: 'jeans', calcado: 'grafite' }],
  ['combinacao-5-menina-morena', 'f', { pele: 'pele-04', olhos: 'castanho', corCabelo: 'castanho-claro', camisa: 'ceu', calca: 'terra', calcado: 'ipe' }],
  ['combinacao-6-menino-negro', 'm', { pele: 'pele-09', olhos: 'castanho', corCabelo: 'preto', camisa: 'madeira', calca: 'mata', calcado: 'mata', acessibilidade: ['oculos'] }]
];
/** Tons de pele pedidos pelo dono: clara, morena, parda, negra retinta. */
const PELES = [['clara', 'pele-01'], ['morena', 'pele-04'], ['parda', 'pele-06'], ['negra', 'pele-09'], ['negra-retinta', 'pele-10']];

const CRIANCAS = [
  crianca('cap-menino', 'Kauã', 'm'),
  crianca('cap-menina', 'Mariana', 'f'),
  crianca('cap-novo', 'Bia', 'f', { pronto: false }),
  ...COMBINACOES.map(([nome, sexo, av], i) => crianca(`cap-${nome}`, ['Luana', 'Davi', 'Helena', 'Tom', 'Ana', 'Caio'][i], sexo, av)),
  ...['m', 'f'].flatMap((sexo) => PELES.map(([nome, pele]) => crianca(`cap-pele-${sexo}-${nome}`, 'Rafa', sexo, { pele, corCabelo: nome.startsWith('negra') || nome === 'parda' ? 'preto' : null })))
];

async function subir() {
  if (BASE) return;
  servidor = spawn(process.execPath, [resolve(aqui, '../../node_modules/vite/bin/vite.js'), 'preview', '--port', String(PORTA), '--strictPort'], { cwd: resolve(aqui, '..'), stdio: 'ignore' });
  BASE = `http://localhost:${PORTA}/`;
  for (let i = 0; i < 60; i++) {
    try { if ((await fetch(BASE)).ok) return; } catch { /* esperando */ }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error('servidor de preview não subiu (rode `npm run build` antes)');
}

async function semear(page, lista = CRIANCAS) {
  await page.goto(BASE + '#/');
  await page.waitForTimeout(600);
  await page.evaluate(async (lista) => {
    const db = await new Promise((ok, erro) => { const r = indexedDB.open('fonema'); r.onsuccess = () => ok(r.result); r.onerror = () => erro(r.error); });
    const tx = db.transaction(['criancas'], 'readwrite');
    for (const c of lista) tx.objectStore('criancas').put(c);
    await new Promise((ok) => { tx.oncomplete = ok; });
    db.close();
  }, lista);
}
/** Dá moedinhas e abre fases de uma criança (depois que o app criou o progresso dela). */
async function enriquecer(page, id, moedas, fases) {
  await page.evaluate(async ({ id, moedas, fases }) => {
    const db = await new Promise((ok, erro) => { const r = indexedDB.open('fonema'); r.onsuccess = () => ok(r.result); r.onerror = () => erro(r.error); });
    const tx = db.transaction(['progressos'], 'readwrite');
    const st = tx.objectStore('progressos');
    const p = await new Promise((ok) => { const r = st.get(id); r.onsuccess = () => ok(r.result); });
    if (p) {
      p.moedinhas = { saldo: moedas, total: moedas, porDia: {} };
      p.sessoesFeitas = 3;
      for (const f of fases) if (p.fases[f]) p.fases[f] = { ...p.fases[f], estado: 'concluida' };
      st.put(p);
    }
    await new Promise((ok) => { tx.oncomplete = ok; });
    db.close();
  }, { id, moedas, fases });
}

async function esperarBoneco(page) {
  await page.locator('[data-testid=boneco3d][data-estado=pronto]').first().waitFor({ timeout: 30000 });
  await page.waitForTimeout(900);
}
const girar = (page, rad) => page.evaluate((r) => document.querySelector('.boneco3d-canvas')?.palco?.definirGiro(r), rad);

async function main() {
  mkdirSync(DIR, { recursive: true });
  await subir();
  const browser = await chromium.launch({ executablePath: EXEC, args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const quer = (grupo) => !FILTRO || FILTRO === grupo;
  const novo = async (largura, altura, escala = 1, celular = false, lista = CRIANCAS) => {
    const ctx = await browser.newContext({ viewport: { width: largura, height: altura }, deviceScaleFactor: escala, isMobile: celular, hasTouch: celular, locale: 'pt-BR', reducedMotion: 'reduce' });
    await ctx.addInitScript(() => { try { localStorage.setItem('fonema-prefs', JSON.stringify({ vozLigada: false, contraste: false, menosMovimento: true })); } catch { /* sem armazenamento */ } });
    const page = await ctx.newPage();
    page.on('pageerror', (e) => console.log('  ! erro na página:', String(e)));
    page.on('console', (m) => { if (m.type() === 'error' || (m.type() === 'warning' && m.text().includes('avatar3d'))) console.log('  · console:', m.text().slice(0, 240)); });
    await semear(page, lista);
    return { ctx, page };
  };
  const foto = async (page, nome, alvo) => {
    const caminho = `${DIR}/v6-avatar-${nome}.png`;
    await (alvo ? page.locator(alvo).first() : page).screenshot({ path: caminho });
    console.log('  ✓', caminho);
  };
  const vistas = async (page, id, nome, lista) => {
    await page.goto(BASE + `#/c/${id}/avatar`);
    await esperarBoneco(page);
    console.log(`  ${nome}: ${await page.evaluate(() => (document.querySelector('.boneco3d-canvas')?.palco?.real ? 'modelo 3D de verdade' : 'RESERVA provisória'))}`);
    for (const [vista, rad] of lista) {
      await girar(page, rad);
      await page.waitForTimeout(350);
      await foto(page, `${nome}-${vista}`, '.boneco3d');
    }
  };
  const TODAS = [['frente', 0], ['tres-quartos', 0.65], ['lado', Math.PI / 2], ['costas', Math.PI]];

  // 1. padrão: menino e menina, de frente, 3/4, lado e costas
  if (quer('padrao')) {
    const { ctx, page } = await novo(1850, 980);
    await vistas(page, 'cap-menino', 'padrao-menino', TODAS);
    await vistas(page, 'cap-menina', 'padrao-menina', TODAS);
    await ctx.close();
  }
  // 2. seis combinações de cores bem diferentes
  if (quer('cores')) {
    const { ctx, page } = await novo(1850, 980);
    for (const [nome] of COMBINACOES) await vistas(page, `cap-${nome}`, nome, [['frente', 0], ['tres-quartos', 0.65], ['costas', Math.PI]]);
    await ctx.close();
  }
  // 3. tons de pele (clara, morena, parda, negra, negra retinta), menino e menina, frente e 3/4
  if (quer('pele')) {
    const { ctx, page } = await novo(1850, 980);
    for (const sexo of ['m', 'f']) for (const [nome] of PELES) await vistas(page, `cap-pele-${sexo}-${nome}`, `pele-${sexo === 'm' ? 'menino' : 'menina'}-${nome}`, [['frente', 0], ['tres-quartos', 0.65]]);
    await ctx.close();
  }
  // 4. tela de personalizar: computador e celular
  if (quer('montar')) {
    for (const [l, a, rotulo, cel] of [[1850, 980, '1850x980', false], [1366, 768, '1366x768', false], [390, 844, '390x844', true]]) {
      const { ctx, page } = await novo(l, a, cel ? 2 : 1, cel);
      await page.goto(BASE + '#/c/cap-novo/avatar');
      await esperarBoneco(page);
      await foto(page, `montar-${rotulo}-1-padrao`);
      for (const [passo, peca] of [['pele', 'pele-06'], ['olhos', 'mel'], ['corCabelo', 'preto'], ['camisa', 'ipe'], ['calca', 'jeans'], ['calcado', 'marinho']]) {
        await page.locator(`[data-testid="montar-avatar"][data-passo="${passo}"]`).waitFor();
        await page.locator(`.montar-corpo [data-peca="${peca}"]`).click();
        await page.waitForTimeout(900);
        if (passo === 'pele' || passo === 'camisa') await foto(page, `montar-${rotulo}-${passo}`);
        if (passo === 'camisa') { await page.locator('.montar-corpo [data-estado="fase"]').first().click(); await page.waitForTimeout(300); await foto(page, `montar-${rotulo}-cadeado`); }
        await page.getByTestId('avatar-proximo').click();
        await page.waitForTimeout(400);
      }
      await page.waitForTimeout(4000);
      await foto(page, `montar-${rotulo}-lojinha`);
      const rola = await page.evaluate(() => document.documentElement.scrollHeight > window.innerHeight + 1);
      console.log(`  ${rola ? '✗ COM' : '✓ sem'} rolagem da página em ${rotulo}`);
      await ctx.close();
    }
  }
  // 5. Lojinha: cadeados (fase + moedas) e Acessibilidade
  if (quer('lojinha')) {
    for (const [l, a, rotulo, cel] of [[1850, 980, '1850x980', false], [390, 844, '390x844', true]]) {
      const { ctx, page } = await novo(l, a, cel ? 2 : 1, cel);
      await page.goto(BASE + '#/c/cap-menina/lojinha');
      await page.getByTestId('lojinha').waitFor();
      await enriquecer(page, 'cap-menina', 9, ['AL-A', 'AL-B']);
      await page.reload();
      await page.getByTestId('lojinha').waitFor();
      await esperarBoneco(page);
      await page.waitForTimeout(5000);
      await foto(page, `lojinha-${rotulo}-cadeados`);
      await page.locator('[data-aba=acessibilidade]').click();
      await page.waitForTimeout(2500);
      await page.locator('[data-acess=oculos] button').click();
      await page.locator('[data-acess=pintura-no-rosto] button').click();
      await page.waitForTimeout(2500);
      await foto(page, `lojinha-${rotulo}-acessibilidade`);
      if (!cel) { await girar(page, 0.5); await page.waitForTimeout(300); await foto(page, 'acessibilidade-oculos-e-pintura', '.boneco3d'); }
      await ctx.close();
    }
  }
  // 6. miniaturas: cartões dos alunos na entrada
  if (quer('miniaturas')) {
    const { ctx, page } = await novo(1366, 768, 1, false, CRIANCAS.filter((c) => c.id.includes('combinacao')));
    await page.goto(BASE + '#/aluno');
    await page.waitForTimeout(9000);
    await foto(page, 'miniaturas-cartoes-dos-alunos');
    await ctx.close();
  }
  await browser.close();
}

main().catch((e) => { console.error(e); process.exitCode = 1; }).finally(() => { servidor?.kill(); process.exit(); });
