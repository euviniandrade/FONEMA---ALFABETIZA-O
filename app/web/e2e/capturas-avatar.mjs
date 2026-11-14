// FONEMA · capturas do avatar 3D montável (D029) em app/docs/capturas/v4-avatar-*.png.
// Uso (depois de `npm run build`):  node web/e2e/capturas-avatar.mjs [filtro]
// Sobe o próprio servidor de preview (porta 4188), grava crianças direto no banco do aparelho e fotografa:
// boneco de frente / de lado / de costas, menino e menina montados, tela de montar (computador e celular),
// Lojinha com cadeados e seção Acessibilidade.
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

const crianca = (id, nome, genero, avatar) => ({
  id, nome, genero, anoNascimento: 2020,
  pronuncia: { grafia: nome, fala: nome, rate: 1, pitchExtra: 0, voz: 'sofia' },
  avatar: { versao: 2, cantinho: 'ceu', corCabelo: 'castanho-escuro', acessibilidade: [], pronto: true, ...avatar },
  apoios: { previsivel: false, focoCurto: false, leituraReforco: false, calmo: false },
  jaSabe: { letrasDoNome: 'nao-sei', lePalavras: 'nao-sei', leFrases: 'nao-sei' },
  consentimentos: { responsavel: true, vozPrimeiroNome: true, gravarVozAdulto: false, em: 1 },
  rotina: { minutosDia: 15, horaDormir: '20:00' }, criadoEm: Date.now()
});

const CRIANCAS = [
  crianca('cap-menina', 'Mariana', 'f', { pele: 'pele-06', rosto: 'redondo', olhos: 'castanho-escuro', cabelo: 'f-cacheado', corCabelo: 'preto', camisa: 'uniforme', calca: 'saia-marinho', calcado: 'tenis-branco' }),
  crianca('cap-menino', 'Kauã', 'm', { pele: 'pele-08', rosto: 'oval', olhos: 'castanho', cabelo: 'm-black-power', corCabelo: 'preto', camisa: 'uniforme', calca: 'uniforme', calcado: 'tenis-branco' }),
  crianca('cap-ruiva', 'Helena', 'f', { pele: 'pele-01', rosto: 'coracao', olhos: 'verde', cabelo: 'f-ondulado', corCabelo: 'ruivo', camisa: 'uniforme', calca: 'uniforme', calcado: 'tenis-branco', acessibilidade: ['oculos'] }),
  crianca('cap-liso', 'Davi', 'm', { pele: 'pele-03', rosto: 'quadrado', olhos: 'preto', cabelo: 'm-liso', corCabelo: 'preto', camisa: 'camiseta-ceu', calca: 'bermuda-marinho', calcado: 'sandalia', acessibilidade: ['cadeira-de-rodas', 'aparelho-auditivo'] }),
  crianca('cap-trancas', 'Luana', 'f', { pele: 'pele-09', rosto: 'redondo', olhos: 'castanho-escuro', cabelo: 'f-trancas', corCabelo: 'preto', camisa: 'uniforme', calca: 'uniforme', calcado: 'tenis-branco', acessibilidade: ['pintura-no-rosto'] }),
  crianca('cap-limpo', 'Bia', 'f', { pele: null, rosto: null, olhos: null, cabelo: null, camisa: null, calca: null, calcado: null, pronto: false })
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

async function semear(page, moedas = 0, fasesAbertas = []) {
  await page.goto(BASE + '#/');
  await page.waitForTimeout(600);
  await page.evaluate(async ({ lista, moedas, fasesAbertas }) => {
    const db = await new Promise((ok, erro) => { const r = indexedDB.open('fonema'); r.onsuccess = () => ok(r.result); r.onerror = () => erro(r.error); });
    const tx = db.transaction(['criancas', 'progressos'], 'readwrite');
    for (const c of lista) tx.objectStore('criancas').put(c);
    await new Promise((ok) => { tx.oncomplete = ok; });
    if (moedas || fasesAbertas.length) window.__semente = { moedas, fasesAbertas };
    db.close();
  }, { lista: CRIANCAS, moedas, fasesAbertas });
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
  await page.locator('[data-testid=boneco3d][data-estado=pronto]').first().waitFor({ timeout: 20000 });
  await page.waitForTimeout(900);
}
const girar = (page, rad) => page.evaluate((r) => document.querySelector('.boneco3d-canvas')?.palco?.definirGiro(r), rad);

async function main() {
  mkdirSync(DIR, { recursive: true });
  await subir();
  const browser = await chromium.launch({ executablePath: EXEC, args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const quer = (grupo) => !FILTRO || FILTRO.startsWith(grupo) || grupo.includes(FILTRO);
  const novo = async (largura, altura, escala = 1, celular = false) => {
    const ctx = await browser.newContext({ viewport: { width: largura, height: altura }, deviceScaleFactor: escala, isMobile: celular, hasTouch: celular, locale: 'pt-BR', reducedMotion: 'reduce' });
    await ctx.addInitScript(() => { try { localStorage.setItem('fonema-prefs', JSON.stringify({ vozLigada: false, contraste: false, menosMovimento: true })); } catch { /* sem armazenamento */ } });
    const page = await ctx.newPage();
    page.on('pageerror', (e) => console.log('  ! erro na página:', String(e)));
    page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') console.log('  · console:', m.text().slice(0, 200)); });
    await semear(page);
    return { ctx, page };
  };
  const foto = async (page, nome, alvo) => {
    const caminho = `${DIR}/v4-avatar-${nome}.png`;
    await (alvo ? page.locator(alvo).first() : page).screenshot({ path: caminho });
    console.log('  ✓', caminho);
  };

  // 1. boneco de perto: frente, lado, costas (menina e menino), mais os outros montados
  if (quer('boneco')) {
    const { ctx, page } = await novo(1850, 980);
    for (const [id, nome] of [['cap-menina', 'menina'], ['cap-menino', 'menino'], ['cap-ruiva', 'ruiva-oculos'], ['cap-liso', 'cadeira-de-rodas'], ['cap-trancas', 'trancas-pintura'], ['cap-limpo', 'limpo']]) {
      if (FILTRO && !`boneco-${nome}`.includes(FILTRO)) continue;
      await page.goto(BASE + `#/c/${id}/avatar`);
      await esperarBoneco(page);
      for (const [vista, rad] of [['frente', 0], ['lado', Math.PI / 2], ['costas', Math.PI], ['tres-quartos', 0.6]]) {
        if (!['menina', 'menino'].includes(nome) && vista !== 'frente' && vista !== 'tres-quartos') continue;
        await girar(page, rad);
        await page.waitForTimeout(350);
        await foto(page, `boneco-${nome}-${vista}`, '.boneco3d');
      }
    }
    await ctx.close();
  }

  // 2. tela de montar: computador (1850x980 e 1366x768) e celular (390x844), passo a passo
  if (quer('montar')) {
    for (const [l, a, rotulo, cel] of [[1850, 980, '1850x980', false], [1366, 768, '1366x768', false], [390, 844, '390x844', true]]) {
      const { ctx, page } = await novo(l, a, cel ? 2 : 1, cel);
      await page.goto(BASE + '#/c/cap-limpo/avatar');
      await esperarBoneco(page);
      await foto(page, `montar-${rotulo}-1-limpo`);
      const passos = [['pele', 'pele-05'], ['rosto', 'oval'], ['olhos', 'mel'], ['cabelo', 'f-rabo-de-cavalo'], ['camisa', 'uniforme'], ['calca', 'uniforme'], ['calcado', 'tenis-branco']];
      for (const [passo, peca] of passos) {
        await page.locator(`.montar-corpo [data-peca="${peca}"]`).click();
        await page.waitForTimeout(passo === 'cabelo' || passo === 'camisa' ? 2600 : 700);
        if (['cabelo', 'camisa'].includes(passo)) await foto(page, `montar-${rotulo}-${passo}`);
        if (passo === 'camisa') { await page.locator('.montar-corpo [data-estado="fase"]').first().click(); await page.waitForTimeout(300); await foto(page, `montar-${rotulo}-cadeado`); }
        await page.getByTestId('avatar-proximo').click();
        await page.waitForTimeout(500);
      }
      await page.waitForTimeout(2500);
      await foto(page, `montar-${rotulo}-8-lojinha`);
      const rola = await page.evaluate(() => document.documentElement.scrollHeight > window.innerHeight + 1);
      console.log(`  ${rola ? '✗ COM' : '✓ sem'} rolagem da página em ${rotulo}`);
      await ctx.close();
    }
  }

  // 3. Lojinha: cadeados (fase + moedas) e Acessibilidade
  if (quer('lojinha')) {
    for (const [l, a, rotulo, cel] of [[1850, 980, '1850x980', false], [390, 844, '390x844', true]]) {
      const { ctx, page } = await novo(l, a, cel ? 2 : 1, cel);
      await page.goto(BASE + '#/c/cap-menina/lojinha');
      await page.getByTestId('lojinha').waitFor();
      await enriquecer(page, 'cap-menina', 9, ['AL-A', 'AL-B', 'AL-C']);
      await page.reload();
      await page.getByTestId('lojinha').waitFor();
      await esperarBoneco(page);
      await page.waitForTimeout(3000);
      await foto(page, `lojinha-${rotulo}-cadeados`);
      await page.locator('[data-aba=acessibilidade]').click();
      await page.waitForTimeout(3000);
      await foto(page, `lojinha-${rotulo}-acessibilidade`);
      await page.locator('[data-acess=oculos] button').click();
      await page.locator('[data-acess=cadeira-de-rodas] button').click();
      await page.waitForTimeout(1500);
      await foto(page, `lojinha-${rotulo}-acessibilidade-em-uso`);
      await ctx.close();
    }
  }

  // 4. miniaturas: cartões dos alunos na entrada
  if (quer('miniaturas')) {
    const { ctx, page } = await novo(1366, 768);
    await page.goto(BASE + '#/aluno');
    await page.waitForTimeout(5000);
    await foto(page, 'miniaturas-cartoes-dos-alunos');
    await ctx.close();
  }
  await browser.close();
}

main().catch((e) => { console.error(e); process.exitCode = 1; }).finally(() => { servidor?.kill(); process.exit(); });
