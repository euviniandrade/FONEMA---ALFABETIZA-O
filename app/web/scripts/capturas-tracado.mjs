// Capturas do traçado das letras (D029 §4) e do Estúdio de sons (D029 §2), pela bancada (bancada-tracado.html).
// Uso (em app/web):  node scripts/capturas-tracado.mjs [letras]      ex.: node scripts/capturas-tracado.mjs ABEGMRSaeg
// Sobe o Vite da bancada numa porta própria, tira app/docs/capturas/v4-tracado-<letra>.png (começo, com setas e números),
// -meio (depois do 1º traço), -demo (demonstração animada) e confere que seguir o roteiro na ordem libera o "Pronto".
import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const aqui = dirname(fileURLToPath(import.meta.url));
const DIR = resolve(aqui, '../../docs/capturas');
const PORTA = 4187;
const BASE = `http://localhost:${PORTA}`;
const letras = [...(process.argv[2] ?? 'ABEGMRSaeg')];
const TODAS = process.argv.includes('--todas');
mkdirSync(DIR, { recursive: true });
const nome = (l) => (l === l.toUpperCase() ? `${l}-maiuscula` : `${l}-minuscula`);

const servidor = spawn('npx', ['vite', '-c', 'vite.bancada.config.ts', '--port', String(PORTA), '--strictPort'], { cwd: resolve(aqui, '..'), stdio: 'ignore' });
const fechar = () => { try { servidor.kill(); } catch { /* já fechou */ } };
process.on('exit', fechar);
for (let i = 0; i < 60; i++) { try { if ((await fetch(`${BASE}/bancada-tracado.html`)).ok) break; } catch { /* subindo */ } await new Promise((r) => setTimeout(r, 500)); }

const abrir = () => chromium.launch({ executablePath: process.env.CHROMIUM ?? '/opt/pw-browsers/chromium', args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'] });
let nav = await abrir();
const falhas = { lista: [], push(m) { this.lista.push(m); console.error('  ✗ ' + m); }, get length() { return this.lista.length; }, map(f) { return this.lista.map(f); } };
const SO_VALIDAR = process.argv.includes('--so-validar'); // só confere as letras (sem quadros, demonstração e estúdio)
const SO_QUADROS = process.argv.includes('--so-quadros');
async function seguir(pg, traco, caixa) {
  await pg.mouse.move(caixa.x + traco[0][0] * caixa.width, caixa.y + traco[0][1] * caixa.height);
  await pg.mouse.down();
  for (const [x, y] of traco) await pg.mouse.move(caixa.x + x * caixa.width, caixa.y + y * caixa.height, { steps: 3 });
  await pg.mouse.up();
}
async function umaLetra(l, capturar) {
  const ctx = await nav.newContext({ viewport: { width: 900, height: 820 }, deviceScaleFactor: 1 });
  await ctx.addInitScript(() => { try { localStorage.setItem('fonema-teste-rapido', '1'); } catch { /* sem armazenamento */ } });
  const pg = await ctx.newPage();
  await pg.goto(`${BASE}/bancada-tracado.html?letra=${encodeURIComponent(l)}`);
  const areia = pg.getByTestId('areia');
  await areia.waitFor();
  await pg.waitForTimeout(300);
  if (capturar) await areia.screenshot({ path: `${DIR}/v4-tracado-${nome(l)}.png` });
  const roteiro = JSON.parse(await areia.getAttribute('data-roteiro'));
  const caixa = await pg.locator('.areia canvas').boundingBox();
  // fora de ordem não vale: o ÚLTIMO traço primeiro não pode avançar a vez (quando há mais de um traço)
  if (roteiro.length > 1) {
    await seguir(pg, roteiro[roteiro.length - 1], caixa);
    const vez = Number(await areia.getAttribute('data-vez'));
    if (vez !== 0) falhas.push(`${l}: traço fora de ordem avançou a vez (${vez})`);
    await pg.getByRole('button', { name: 'Apagar' }).click();
  }
  // sentido contrário não vale
  await seguir(pg, [...roteiro[0]].reverse(), caixa);
  if (roteiro[0].length > 3 && Number(await areia.getAttribute('data-vez')) !== 0) {
    const fechado = Math.hypot(roteiro[0][0][0] - roteiro[0].at(-1)[0], roteiro[0][0][1] - roteiro[0].at(-1)[1]) < 0.05;
    if (!fechado) falhas.push(`${l}: traço no sentido contrário foi aceito`);
  }
  await pg.getByRole('button', { name: 'Apagar' }).click();
  // na ordem e no sentido certos
  for (let k = 0; k < roteiro.length; k++) {
    await seguir(pg, roteiro[k], caixa);
    const vez = Number(await areia.getAttribute('data-vez'));
    if (vez !== k + 1) { falhas.push(`${l}: traço ${k + 1} de ${roteiro.length} não foi reconhecido (vez = ${vez})`); break; }
    if (k === 0 && capturar && roteiro.length > 1) await areia.screenshot({ path: `${DIR}/v4-tracado-${nome(l)}-meio.png` });
  }
  if (!(await pg.getByTestId('tracei').isEnabled())) falhas.push(`${l}: "Pronto" não liberou depois de todos os traços`);
  await ctx.close();
}
if (!SO_QUADROS) for (const l of TODAS ? [...'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'] : letras) {
  // máquina carregada: se o navegador cair no meio, abre outro e repete a letra (até 3 vezes)
  for (let t = 0; t < 3; t++) {
    const antes = falhas.lista.length;
    try { await umaLetra(l, letras.includes(l)); break; } catch (e) { falhas.lista.length = antes; if (t === 2) falhas.push(`${l}: ${String(e).slice(0, 80)}`); try { await nav.close(); } catch { /* já caiu */ } nav = await abrir(); }
  }
  process.stdout.write(l);
}
console.log('');

// demonstração animada (sem o modo de teste) e a tela inteira
if (!SO_VALIDAR && !SO_QUADROS) {
  const ctx = await nav.newContext({ viewport: { width: 900, height: 820 } });
  const pg = await ctx.newPage();
  await pg.goto(`${BASE}/bancada-tracado.html?letra=R`);
  await pg.getByTestId('areia').waitFor();
  await pg.waitForSelector('.areia.demonstrando', { timeout: 15000 }).catch(() => falhas.push('demonstração não começou'));
  await pg.waitForTimeout(1500);
  await pg.screenshot({ path: `${DIR}/v4-tracado-demonstracao.png` });
  await pg.waitForSelector('.areia:not(.demonstrando)', { timeout: 15000 }).catch(() => falhas.push('demonstração não terminou'));
  await pg.screenshot({ path: `${DIR}/v4-tracado-tela.png` });
  await ctx.close();
}
// quadro com as 52 letras (para conferir letra por letra)
if (!SO_VALIDAR) {
  const ctx = await nav.newContext({ viewport: { width: 1500, height: 900 } });
  await ctx.addInitScript(() => { try { localStorage.setItem('fonema-teste-rapido', '1'); } catch { /* sem armazenamento */ } });
  for (const [arq, conj] of [['maiusculas', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'], ['minusculas', 'abcdefghijklmnopqrstuvwxyz']]) {
    const pg = await ctx.newPage();
    await pg.setContent('<body style="margin:0;background:#fff;display:grid;grid-template-columns:repeat(7,1fr);gap:6px;padding:6px"></body>');
    for (const l of conj) {
      const p2 = await ctx.newPage();
      await p2.setViewportSize({ width: 520, height: 700 });
      await p2.goto(`${BASE}/bancada-tracado.html?letra=${l}`);
      await p2.getByTestId('areia').waitFor();
      await p2.waitForTimeout(200);
      const b64 = (await p2.getByTestId('areia').screenshot()).toString('base64');
      await p2.close();
      await pg.evaluate((s) => { const i = new Image(); i.src = `data:image/png;base64,${s}`; i.style.width = '100%'; document.body.appendChild(i); }, b64);
    }
    await pg.waitForTimeout(400);
    await pg.screenshot({ path: `${DIR}/v4-tracado-todas-${arq}.png`, fullPage: true });
    await pg.close();
  }
  await ctx.close();
}
// Estúdio de sons: lista, gravação (microfone falso do Chromium) e som gravado
if (!SO_VALIDAR && !SO_QUADROS) {
  const ctx = await nav.newContext({ viewport: { width: 1100, height: 900 }, permissions: ['microphone'] });
  const pg = await ctx.newPage();
  await pg.goto(`${BASE}/bancada-tracado.html?tela=estudio`);
  await pg.getByTestId('estudio-sons').waitFor();
  await pg.waitForTimeout(800);
  await pg.screenshot({ path: `${DIR}/v4-estudio-lista.png` });
  await pg.getByTestId('gravar-m').click();
  await pg.getByTestId('parar-m').waitFor({ timeout: 8000 }).catch(() => falhas.push('estúdio: a gravação não começou'));
  await pg.waitForTimeout(1200);
  await pg.screenshot({ path: `${DIR}/v4-estudio-gravando.png` });
  await pg.getByTestId('parar-m').click().catch(() => {});
  await pg.waitForSelector('[data-fonema="m"].gravado', { timeout: 8000 }).catch(() => falhas.push('estúdio: o som gravado não apareceu como "Gravado por você"'));
  await pg.screenshot({ path: `${DIR}/v4-estudio-gravado.png` });
  const conta = await pg.getByTestId('estudio-conta').innerText();
  if (!/^1 de/.test(conta)) falhas.push(`estúdio: contagem inesperada (${conta})`);
  // exportar e importar de volta
  const [baixado] = await Promise.all([pg.waitForEvent('download', { timeout: 8000 }), pg.getByTestId('estudio-exportar').click()]);
  const caminho = await baixado.path();
  await pg.locator('[data-fonema="m"] button[aria-label^="Apagar"]').click();
  await pg.waitForSelector('[data-fonema="m"]:not(.gravado)');
  await pg.getByTestId('estudio-arquivo').setInputFiles(caminho);
  await pg.waitForSelector('[data-fonema="m"].gravado', { timeout: 8000 }).catch(() => falhas.push('estúdio: importar não trouxe o som de volta'));
  await ctx.close();
}
await nav.close();
fechar();
if (falhas.length) { console.error('FALHAS:\n' + falhas.map((f) => '  ✗ ' + f).join('\n')); process.exit(1); }
console.log(`ok: capturas em ${DIR}`);
process.exit(0);
