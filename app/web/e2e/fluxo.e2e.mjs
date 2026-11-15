// FONEMA · teste E2E (Playwright + Chromium do ambiente, sem `playwright install`).
// D027: a jornada começa pela TRILHA DO ALFABETO.
// Percorre (D028): primeira vez → conta do responsável com PIN → cadastro da criança em 3 passos → avatar → chegada → letra A completa (apresentação, Espelho do Som, ache a letra,
// ache a figura, traçar) → selo da letra A no ritual → Mostra pro professor → professor (1 toque) → painel da família
// → lojinha → álbum → letra B liberada (C ainda trancada) → letras B–E → revisão A–E → letra F liberada
// → jornada inteira (modo demonstração) → nível inicial: "já conhece as letras e os sons" pula para as sílabas.
// Uso:  npm run e2e            (servidor de preview próprio, porta 4179)
//       npm run capturas       (idem + salva as capturas da Trilha do Alfabeto em app/docs/capturas/alfabeto-*.png)
//       node e2e/fluxo.e2e.mjs --capturas-v2   (capturas antigas v2-*.png; a numeração é anterior à D027)
//       BASE_URL=http://localhost:5173 node e2e/fluxo.e2e.mjs
import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const aqui = dirname(fileURLToPath(import.meta.url));
const CAPTURAS_V2 = process.argv.includes('--capturas-v2');
const CAPTURAS_AL = process.argv.includes('--capturas');
const CAPTURAS = CAPTURAS_V2 || CAPTURAS_AL;
const COLETAR = process.argv.includes('--coletar');
const coletadas = new Set();
async function guardarFalas(pg) {
  if (!COLETAR) return;
  const l = await pg.evaluate(() => JSON.parse(localStorage.getItem('fonema-falas') || '[]'));
  l.forEach((x) => coletadas.add(x));
}
const DIR_CAP = resolve(aqui, '../../docs/capturas');
const EXEC = process.env.CHROMIUM ?? '/opt/pw-browsers/chromium';
let BASE = process.env.BASE_URL;
let servidor;

function ok(cond, msg) {
  if (!cond) throw new Error(`✗ ${msg}`);
  console.log(`  ✓ ${msg}`);
}

async function subirServidor() {
  if (BASE) return;
  const porta = 4179;
  servidor = spawn('npx', ['vite', 'preview', '--port', String(porta), '--strictPort'], { cwd: resolve(aqui, '..'), stdio: 'pipe' });
  BASE = `http://localhost:${porta}/`;
  for (let i = 0; i < 60; i++) {
    try { if ((await fetch(BASE)).ok) return; } catch { /* esperando */ }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error('servidor de preview não subiu (rode `npm run build` antes)');
}

/**
 * Monta o boneco 3D (D029): em cada passo obrigatório toca a primeira opção liberada e avança; no fim, "Pronto!".
 * `escolhas` troca a opção de um passo (ex.: { cabelo: 'f-trancas' }).
 */
async function montarAvatar(page, escolhas = {}) {
  await page.getByTestId('montar-avatar').waitFor();
  for (const passo of ['pele', 'rosto', 'olhos', 'cabelo', 'camisa', 'calca', 'calcado']) {
    await page.locator(`[data-testid="montar-avatar"][data-passo="${passo}"]`).waitFor();
    const alvo = escolhas[passo] ? `.montar-corpo [data-peca="${escolhas[passo]}"]` : '.montar-corpo [data-estado="livre"]';
    await page.locator(alvo).first().click();
    await page.locator('.montar-corpo [aria-checked="true"]').first().waitFor();
    await page.getByTestId('avatar-proximo').click();
  }
  await page.locator('[data-testid="montar-avatar"][data-passo="lojinha"]').waitFor();
  await page.getByTestId('avatar-pronto').click();
}

let n = 0;
async function cap(page, nome) {
  if (!CAPTURAS_V2) return;
  await page.waitForTimeout(350);
  n++;
  await page.screenshot({ path: `${DIR_CAP}/v2-${String(n).padStart(2, '0')}-${nome}.png` });
}

/** Capturas da Trilha do Alfabeto (D027): alfabeto-NN-nome.png (computador) e alfabeto-celular-NN-nome.png. */
async function capA(page, nome, espera = 450) {
  if (!CAPTURAS_AL) return;
  await page.waitForTimeout(espera);
  await page.screenshot({ path: `${DIR_CAP}/alfabeto-${nome}.png` });
}

/**
 * Acesso do adulto (D028): na primeira vez cria a conta (nome + PIN 1234); depois, digita o PIN.
 * Serve para qualquer rota de adulto (#/familia, #/professor e as antigas #/adulto/...).
 */
async function passarPorteira(page, { nome = 'Ana', pin = '1234' } = {}) {
  for (let i = 0; i < 4; i++) {
    const criar = page.getByTestId('conta-nome');
    const campoPin = page.getByTestId('pin');
    await Promise.race([criar.waitFor({ timeout: 1500 }).catch(() => {}), campoPin.waitFor({ timeout: 1500 }).catch(() => {}), page.waitForTimeout(700)]);
    if (await criar.count()) {
      await criar.fill(nome);
      await page.getByTestId('conta-continuar').click();
      await page.getByTestId('conta-pin').fill(pin);
      await page.getByTestId('conta-pin2').fill(pin);
      await page.getByTestId('conta-criar').click();
      await page.getByTestId('criar-conta').waitFor({ state: 'detached', timeout: 8000 });
      continue;
    }
    if (await campoPin.count()) {
      await campoPin.fill(pin);
      await page.getByTestId('tela-pin').waitFor({ state: 'detached', timeout: 8000 });
      continue;
    }
    return;
  }
}

/** Cadastro da criança em 3 passos: quem vai aprender (nome, idade, como a dupla fala) → de onde começa → tudo certo (autorização). */
async function cadastrar(page, nome, genero, { previa, capturas = false, nivel, idade = 5 } = {}) {
  await passarPorteira(page);
  await page.getByTestId('campo-nome').fill(nome);
  await page.locator(`[data-idade="${idade}"]`).click();
  ok(await page.locator('[data-genero]').count() === 2 && await page.locator('[data-genero="n"]').count() === 0, 'cadastro: só menino ou menina (D029)');
  await page.locator(`[data-genero="${genero}"]`).click();
  if (previa) ok((await page.locator('.previa').innerText()).includes(previa), `prévia da concordância: "${previa}"`);
  if (capturas) await cap(page, 'cadastro-1-quem-vai-aprender');
  await page.getByTestId('cadastro-continuar').click();
  ok(await page.locator('[data-nivel="zero"][aria-pressed="true"]').count() === 1, '"Do zero" vem pré-selecionado como nível inicial (D026)');
  if (nivel) await page.locator(`[data-nivel="${nivel}"]`).click();
  if (capturas) await cap(page, 'cadastro-2-de-onde-comeca');
  await page.getByTestId('nivel-continuar').click();
  await page.getByTestId('cons-responsavel').check();
  if (capturas) await cap(page, 'cadastro-3-tudo-certo');
  await page.getByTestId('salvar-crianca').click();
  if (capturas) await cap(page, 'cadastro-entrega');
  await page.getByTestId('entregar').click();
}

/** Resolve qualquer etapa da sessão até o ritual de fim (sempre pela resposta certa). */
async function jogarSessao(page, capturar = {}) {
  const vistos = new Set();
  for (let passo = 0; passo < 400; passo++) {
    if (await page.getByTestId('ritual').count()) return;
    const cena = (await page.locator('[data-cena]').getAttribute('data-cena', { timeout: 1000 }).catch(() => null)) ?? '';
    if (capturar.gancho) await capturar.gancho(page, cena);
    const tirar = async (chave) => {
      // também aceita a chave pela cena exata (ex.: 'cena:AL-R1-C4c')
      for (const k of [chave, `cena:${cena}`]) if (capturar[k] && !vistos.has(k)) { vistos.add(k); await (capturar.tirarCom ?? cap)(page, capturar[k]); }
    };

    if (await page.getByTestId('comecar-sessao').isVisible().catch(() => false)) { await tirar('acolhida'); await page.getByTestId('comecar-sessao').click({ timeout: 3000 }).catch(() => {}); continue; }
    const minhaVez = page.getByTestId('minha-vez');
    if (await minhaVez.isVisible().catch(() => false)) {
      await tirar('assiste');
      if (await minhaVez.isEnabled({ timeout: 500 }).catch(() => false)) await minhaVez.click({ timeout: 3000 }).catch(() => {});
      else await page.waitForTimeout(80);
      continue;
    }
    const conheci = page.getByTestId('conheci-a-letra');
    if (await conheci.isVisible().catch(() => false)) {
      if (await conheci.isEnabled({ timeout: 500 }).catch(() => false)) { if (capturar.letra) await page.waitForTimeout(650); await tirar('letra'); await conheci.click({ timeout: 3000 }).catch(() => {}); }
      else await page.waitForTimeout(80);
      continue;
    }
    const fiz = page.getByTestId('fiz-o-som');
    if (await fiz.isVisible().catch(() => false)) {
      await page.waitForTimeout(200);
      await tirar('espelho');
      if (await fiz.isEnabled({ timeout: 500 }).catch(() => false)) await fiz.click({ timeout: 3000 }).catch(() => {});
      else await page.waitForTimeout(80);
      continue;
    }
    const lamp = page.locator('[data-silabas]');
    if (await lamp.isVisible().catch(() => false)) {
      await tirar('palmas');
      const s = Number(await lamp.getAttribute('data-silabas', { timeout: 500 }).catch(() => 0));
      if (!s) continue;
      const palma = page.getByTestId('palma');
      if (!(await palma.isEnabled({ timeout: 500 }).catch(() => false))) { await page.waitForTimeout(60); continue; }
      for (let k = 0; k < s; k++) await palma.click({ timeout: 3000 }).catch(() => {});
      await page.getByTestId('pronto-palmas').click({ timeout: 3000 }).catch(() => {});
      await page.waitForTimeout(120);
      continue;
    }
    const esp = page.getByTestId('espacos').first();
    const alvoTxt = (await esp.isVisible().catch(() => false)) ? await esp.getAttribute('data-alvo', { timeout: 500 }).catch(() => null) : null;
    if (alvoTxt) {
      await tirar('montar');
      const alvo = alvoTxt.split('|');
      const ja = await page.locator('.espaco.cheio').count();
      if (ja >= alvo.length) { await page.waitForTimeout(80); continue; }
      const t = alvo[ja];
      await page.locator(`.peca[data-peca="${t}"]:not(.usada)`).first().click({ timeout: 3000 }).catch(() => {});
      continue;
    }
    const ditado = page.locator('[data-palavra]');
    if (await ditado.isVisible().catch(() => false)) {
      if (await page.getByTestId('seguir-ditado').isVisible().catch(() => false)) { await page.getByTestId('seguir-ditado').click({ timeout: 3000 }).catch(() => {}); continue; }
      const p = await ditado.getAttribute('data-palavra', { timeout: 500 }).catch(() => null);
      if (!p) continue;
      for (const l of p) await page.locator(`.teclado .peca[data-peca="${l}"]`).click({ timeout: 3000 }).catch(() => {});
      await tirar('ditado');
      await page.getByTestId('conferir-ditado').click({ timeout: 3000 }).catch(() => {});
      continue;
    }
    const tracei = page.getByTestId('tracei');
    if (await tracei.isVisible().catch(() => false)) {
      const box = await page.locator('.areia canvas').boundingBox({ timeout: 500 }).catch(() => null);
      if (!box) continue;
      await tirar('tracar-antes');
      for (let y = 0.1; y < 0.95; y += 0.05) {
        await page.mouse.move(box.x + box.width * 0.2, box.y + box.height * y);
        await page.mouse.down();
        await page.mouse.move(box.x + box.width * 0.8, box.y + box.height * y, { steps: 12 });
        await page.mouse.up();
      }
      await tirar('tracar');
      if (await tracei.isEnabled({ timeout: 500 }).catch(() => false)) await tracei.click({ timeout: 3000 }).catch(() => {});
      continue;
    }
    const euFalei = page.getByTestId('eu-falei');
    if (await euFalei.isVisible().catch(() => false)) {
      await tirar('falar');
      if (await euFalei.isEnabled({ timeout: 500 }).catch(() => false)) await euFalei.click({ timeout: 3000 }).catch(() => {});
      await page.waitForTimeout(80);
      continue;
    }
    const pausa = page.getByTestId('pausa-pronto');
    if (await pausa.isVisible().catch(() => false)) { await tirar('pausa'); await pausa.click({ timeout: 3000 }).catch(() => {}); continue; }
    // LIGA O SOM (D030): toca numa letra e na cena do mesmo par, até fechar todos
    const liga = page.getByTestId('liga-o-som');
    if (await liga.isVisible().catch(() => false)) {
      await tirar('ligar');
      const letra = page.locator('[data-liga-letra]:not([data-feita])').first();
      const l = await letra.getAttribute('data-liga-letra', { timeout: 500 }).catch(() => null);
      if (!l) { await page.waitForTimeout(80); continue; }
      await letra.click({ timeout: 3000 }).catch(() => {});
      await page.locator(`[data-liga-cena="${l}"]`).click({ timeout: 3000 }).catch(() => {});
      await page.waitForTimeout(120);
      continue;
    }
    // botões de som (letra → som, ouvir as leituras): tocar OUVE; a resposta só vale em "É este!"
    const confirmar = page.getByTestId('confirmar-som');
    if (await confirmar.isVisible().catch(() => false)) {
      await tirar('botoes-de-som');
      if (await confirmar.isEnabled({ timeout: 300 }).catch(() => false)) await confirmar.click({ timeout: 3000 }).catch(() => {});
      else await page.locator('button.opcao[data-correta="1"]').first().click({ timeout: 3000 }).catch(() => {});
      await page.waitForTimeout(120);
      continue;
    }
    const correta = page.locator('button.opcao[data-correta="1"]').first();
    if (await correta.isVisible().catch(() => false)) {
      await tirar(cena.includes('C4') ? 'escolher' : 'escolher2');
      await correta.click({ timeout: 3000 }).catch(() => {});
      await page.waitForTimeout(150);
      continue;
    }
    await page.waitForTimeout(100);
  }
  throw new Error('a sessão não chegou ao ritual de fim');
}

/**
 * Capturas das mecânicas fônicas (D030, etapas 3 e 4): `node e2e/fluxo.e2e.mjs --mecanicas`.
 * Cadastra uma criança que "já conhece as letras e os sons" (o Alfabeto fica aberto para revisar), joga algumas
 * missões e fotografa as telas novas em docs/capturas/v5-mecanicas-*.png e v5-liga-o-som-*.png (+ "-celular").
 */
async function capturasMecanicas(browser) {
  mkdirSync(DIR_CAP, { recursive: true });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, locale: 'pt-BR' });
  await ctx.addInitScript(() => { try { localStorage.setItem('fonema-teste-rapido', '1'); } catch { /* sem armazenamento */ } });
  const page = await ctx.newPage();
  const erros = [];
  page.on('pageerror', (e) => erros.push(String(e)));
  await page.goto(BASE + '#/adulto/config');
  await passarPorteira(page);
  await page.getByTestId('avancado').locator('summary').click();
  await page.getByTestId('modo-demo').click();
  await page.goto(BASE + '#/adulto/cadastro');
  await cadastrar(page, 'Helena', 'f', { nivel: 'letras-e-sons' });
  await montarAvatar(page);
  await page.getByTestId('primeira-missao').waitFor();
  const id = page.url().split('/c/')[1].split('/')[0];
  const feitos = new Set();
  const foto = async (nome) => {
    await page.waitForTimeout(700);
    await page.screenshot({ path: `${DIR_CAP}/v5-${nome}.png` });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${DIR_CAP}/v5-${nome}-celular.png` });
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.waitForTimeout(300);
    console.log(`  captura v5-${nome}`);
  };
  const uma = async (chave, fn) => { if (!feitos.has(chave)) { feitos.add(chave); await fn(); } };
  const errar = () => page.locator('.mec-escolher button.opcao:not([data-correta])').first().click({ timeout: 2000 }).catch(() => {});
  const gancho = async (pg, cena) => {
    const fmt = await pg.locator('.mec-escolher').getAttribute('data-formato', { timeout: 150 }).catch(() => null);
    if (fmt === 'som-letra') await uma('som-letra', async () => { await foto('mecanicas-som-letra'); await errar(); await foto('mecanicas-correcao-contrastiva'); });
    if (fmt === 'letra-som') await uma('letra-som', async () => { await errar(); await foto('mecanicas-letra-som'); });
    if (fmt === 'som-figura') await uma('som-figura', async () => { await foto('mecanicas-som-figura'); await errar(); await foto('mecanicas-som-figura-correcao'); });
    if (fmt === 'figura-letra') await uma('figura-letra', async () => { await foto('mecanicas-figura-letra'); });
    if (fmt === 'par-minimo') await uma(`par-minimo-${cena}`, async () => { await foto('mecanicas-par-minimo'); await errar(); await foto('mecanicas-par-minimo-correcao'); });
    if (fmt === 'espelho-letras') await uma('espelho', async () => { await foto('mecanicas-letras-em-espelho'); await errar(); await foto('mecanicas-letras-em-espelho-correcao'); });
    if (fmt === 'som-cena') await uma('som-cena', async () => { await foto('liga-o-som-ouvir-e-achar-a-cena'); });
    if (fmt === 'cena-letra') await uma('cena-letra', async () => { await foto('liga-o-som-ver-a-cena-e-achar-a-letra'); });
    if (fmt === 'silaba-falta') await uma('silaba-falta', async () => { await foto('mecanicas-silaba-que-falta'); });
    if (fmt === 'fonema-falta') await uma('fonema-falta', async () => { await foto('mecanicas-som-que-falta'); await errar(); await foto('mecanicas-som-que-falta-correcao'); });
    if (fmt === 'ouvir-leituras') await uma(`ouvir-leituras-${cena}`, async () => { await errar(); await foto(cena.includes('F04') ? 'mecanicas-pseudopalavra-ouvir-leituras' : 'mecanicas-bolota-ouvir-leituras'); });
    const modelo = await pg.locator('.mec-montar').getAttribute('data-modelo', { timeout: 150 }).catch(() => null);
    if (modelo === 'demonstracao') await uma('montar-demo', async () => { await foto('mecanicas-montar-demonstracao'); });
    if (modelo === 'sem') {
      await uma('montar-sem', async () => { await foto('mecanicas-montar-sem-modelo'); });
      // 3ª tentativa: depois de dois erros seguidos a peça certa brilha
      await uma('montar-brilho', async () => {
        const alvo = (await pg.getByTestId('espacos').getAttribute('data-alvo')).split('|');
        const ja = await pg.locator('.espaco.cheio').count();
        const errada = pg.locator(`.peca:not(.usada):not([data-peca="${alvo[ja]}"])`).first();
        if (!(await errada.count())) { feitos.delete('montar-brilho'); return; }
        await errada.click(); await pg.waitForTimeout(700); await errada.click(); await pg.waitForTimeout(700);
        await foto('mecanicas-montar-terceira-tentativa-brilho');
      });
    }
    if (await pg.getByTestId('liga-o-som').isVisible().catch(() => false)) {
      await uma('liga-inicio', async () => { await foto('liga-o-som-inicio'); });
      const prontas = await pg.locator('[data-liga-letra][data-feita]').count();
      if (prontas === 1) await uma('liga-erro', async () => {
        const letras = await pg.locator('[data-liga-letra]:not([data-feita])').evaluateAll((els) => els.map((e) => e.dataset.ligaLetra));
        if (letras.length < 2) return;
        await pg.locator(`[data-liga-letra="${letras[0]}"]`).click();
        await pg.locator(`[data-liga-cena="${letras[1]}"]`).click();
        await foto('liga-o-som-correcao');
      });
      if (prontas === 2) await uma('liga-meio', async () => { await foto('liga-o-som-ligando'); });
    }
  };
  for (const f of ['AL-B', 'AL-R1', 'AL-R4', 'R2a-F01', 'R2a-F02', 'R2a-F03', 'R2a-F04']) {
    await page.goto(BASE + `#/c/${id}/sessao/${f}`);
    await jogarSessao(page, { gancho });
    console.log(`  fase ${f} jogada`);
  }
  // a cena do som na apresentação da letra: sem o modo rápido, para a tela parar no faz de conta
  await page.evaluate(() => localStorage.removeItem('fonema-teste-rapido'));
  await ctx.addInitScript(() => { try { localStorage.removeItem('fonema-teste-rapido'); } catch { /* nada */ } });
  await page.goto(BASE + `#/c/${id}/sessao/AL-S`);
  await page.reload();
  await page.getByTestId('comecar-sessao').click({ timeout: 20000 });
  await page.locator('.letra-som .letra-cena').waitFor({ timeout: 60000 });
  await foto('liga-o-som-cena-na-apresentacao-da-letra');
  ok(erros.length === 0, `capturas das mecânicas sem erro de página${erros.length ? ': ' + erros.join(' | ') : ''}`);
  await ctx.close();
}

async function main() {
  if (CAPTURAS) mkdirSync(DIR_CAP, { recursive: true });
  await subirServidor();
  const browser = await chromium.launch({ executablePath: EXEC, args: ['--autoplay-policy=no-user-gesture-required'] });
  if (process.argv.includes('--mecanicas')) { await capturasMecanicas(browser); await browser.close(); servidor?.kill(); return; }
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: CAPTURAS ? 2 : 1, locale: 'pt-BR' });
  await ctx.addInitScript((c) => { try { localStorage.setItem('fonema-teste-rapido', '1'); if (c) localStorage.setItem('fonema-coletar', '1'); } catch { /* sem armazenamento */ } }, COLETAR);
  const page = await ctx.newPage();
  const erros = [];
  page.on('pageerror', (e) => erros.push(String(e)));
  page.on('console', (m) => { if (m.type() === 'error' && !/favicon|manifest\.json|404|Failed to load resource/.test(m.text())) erros.push(m.text()); });

  console.log('1. Cadastro pelo adulto');
  await page.goto(BASE);
  await page.getByTestId('primeira-vez').waitFor();
  if (CAPTURAS) await page.waitForTimeout(2200); // a entrada tem animação (logo cai, painel sobe)
  await cap(page, 'entrada');
  ok(await page.locator('.porta').count() === 4, 'a primeira página é "Quem vai entrar?" com os 4 caminhos (D028)');
  await page.getByTestId('entrar-aluno').click();
  await page.getByTestId('alunos-vazio').waitFor();
  ok(true, 'sem criança cadastrada, "Sou aluno(a)" explica que um adulto cadastra primeiro');
  await page.getByTestId('ir-primeira-vez').click();
  await page.getByTestId('conta-nome').waitFor();
  await cap(page, 'primeira-vez-conta-do-adulto');
  await passarPorteira(page);
  await page.getByTestId('campo-nome').waitFor();
  ok(/familia\/cadastro/.test(page.url()), 'primeira vez: conta do responsável com PIN → cadastro da criança');
  // configurações: o painel abre por cima de tudo e fecha com Esc
  await page.getByTestId('abrir-ajustes').click();
  await page.getByTestId('ajustes-painel').waitFor();
  ok(await page.evaluate(() => { const c = document.querySelector('.camada-caixa').getBoundingClientRect(); const el = document.elementFromPoint(c.left + c.width / 2, c.top + c.height / 2); return !!el && !!el.closest('.camada-caixa') && document.querySelector('.camada').parentElement === document.body; }), 'configurações abrem por cima do cadastro (camada no body)');
  await cap(page, 'configuracoes-sobre-o-cadastro');
  await page.keyboard.press('Escape');
  await page.getByTestId('ajustes-painel').waitFor({ state: 'detached' });
  ok(true, 'configurações fecham com a tecla Esc');
  await cadastrar(page, 'Mariana Souza', 'f', { previa: 'pronta, Mariana', capturas: true });

  console.log('2. Avatar e chegada');
  // D029: boneco 3D montável — começa limpo, passos obrigatórios, só peças de menina, cadeados que ensinam a Lojinha
  await page.getByTestId('montar-avatar').waitFor();
  ok(await page.locator('[data-testid="montar-avatar"][data-passo="pele"]').count() === 1, 'a montagem começa pelo primeiro passo (cor da pele), com o boneco limpo');
  ok(await page.locator('.montar-corpo [aria-checked="true"]').count() === 0, 'nada vem escolhido de entrada');
  ok(await page.getByTestId('avatar-proximo').isDisabled(), 'não dá para avançar sem escolher (passo obrigatório)');
  ok(await page.getByTestId('avatar-pronto').count() === 0, 'sem "Pronto!" antes de montar o boneco');
  ok(await page.locator('.montar-corpo [data-peca^="pele-"]').count() >= 8, 'leque amplo de cores de pele');
  await page.locator('[data-testid=boneco3d]:not([data-estado=carregando])').waitFor({ timeout: 20000 });
  ok(true, `boneco no palco: ${await page.getByTestId('boneco3d').getAttribute('data-estado') === 'pronto' ? '3D (WebGL)' : 'reserva 2D (sem WebGL neste navegador)'}`);
  ok(await page.evaluate(() => document.documentElement.scrollHeight <= window.innerHeight + 1), 'tela de montar sem rolagem');
  for (const passo of ['pele', 'rosto', 'olhos']) { await page.locator('.montar-corpo [data-estado="livre"]').nth(1).click(); await page.getByTestId('avatar-proximo').click(); await page.locator(`[data-testid="montar-avatar"]:not([data-passo="${passo}"])`).waitFor(); }
  ok(await page.locator('.montar-corpo [data-peca^="m-"]').count() === 0 && await page.locator('.montar-corpo [data-peca^="f-"]').count() >= 8, 'menina só vê cabelos de menina');
  ok(/Abre na Letra D · 8 moedas/.test(await page.locator('.montar-corpo [data-estado="fase"]').first().innerText()), 'penteado extra aparece com cadeado: "Abre na Letra D · 8 moedas"');
  await page.locator('.montar-corpo [data-estado="fase"]').first().click();
  ok(/Lojinha/.test(await page.locator('.montar-aviso').innerText()) && await page.locator('.montar-corpo [role="radio"][aria-checked="true"][data-peca^="f-"]').count() === 0, 'tocar numa peça trancada explica a Lojinha e não veste a peça');
  await page.locator('.montar-corpo [data-peca="f-trancas"]').click();
  await page.locator('[data-cor-cabelo="preto"]').click();
  await cap(page, 'avatar');
  await page.getByTestId('avatar-proximo').click();
  for (const passo of ['camisa', 'calca', 'calcado']) {
    await page.locator(`[data-testid="montar-avatar"][data-passo="${passo}"]`).waitFor();
    if (passo === 'camisa') ok(await page.locator('.montar-corpo [data-peca="uniforme"][data-estado="livre"]').count() === 1 && await page.locator('.montar-corpo [data-peca="polo-terra"]').count() === 0, 'camiseta da turma liberada; roupa de menino não aparece para a menina');
    await page.locator('.montar-corpo [data-estado="livre"]').first().click();
    await page.getByTestId('avatar-proximo').click();
  }
  await page.getByTestId('vitrine-lojinha').waitFor();
  ok(await page.locator('.vitrine-lista li').count() >= 4 && /Abre na Letra B/.test(await page.getByTestId('vitrine-lojinha').innerText()), 'o fim da montagem ensina a Lojinha: o que abre depois, com fase e moedas');
  ok(/Acessibilidade/.test(await page.getByTestId('vitrine-lojinha').innerText()), 'acessibilidade não vem de entrada: fica na Lojinha, grátis');
  await page.getByTestId('avatar-pronto').click();
  await page.getByTestId('primeira-missao').waitFor();
  await page.waitForTimeout(300);
  await cap(page, 'chegada-oi-nome');
  ok((await page.locator('.baloes').innerText()).includes('Oi, Mariana!'), 'a Sofia chama a criança pelo nome');

  console.log('3. Trilha do Alfabeto: a primeira missão é a letra A (D027)');
  const idA = page.url().split('/c/')[1].split('/')[0];
  await page.goto(BASE + `#/c/${idA}/alfabeto`);
  await page.getByTestId('trilha-alfabeto').waitFor();
  ok(await page.locator('.marco.letra').count() === 26 && await page.locator('.marco.revisao').count() === 4 && await page.locator('.marco.festa').count() === 1, 'a trilha mostra os 26 marcos das letras, 4 revisões e a Festa do Alfabeto');
  ok((await page.locator('.marco.letra [data-fase]').evaluateAll((bs) => bs.map((b) => b.dataset.fase.slice(3)).join(''))) === 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'as letras estão em ordem, de A a Z');
  ok(await page.locator('[data-fase="AL-A"][data-estado="atual"]').count() === 1 && await page.locator('.marco-btn:not([disabled])').count() === 1, 'do zero: só a letra A está aberta');
  ok(/0 de 26/.test(await page.getByTestId('letras-feitas').innerText()), 'contador: 0 de 26 letras');
  await capA(page, '01-trilha-inicio', 900);
  await page.locator('[data-fase="AL-A"]').click();
  await page.getByTestId('comecar-missao').waitFor();
  ok(/Letra A/.test(await page.locator('.entrada-fase h1').innerText()), 'entrada da missão "Letra A"');
  await capA(page, '02-entrada-letra-a');
  await page.goto(BASE + `#/c/${idA}/chegada`);
  await page.getByTestId('primeira-missao').click();
  await page.waitForFunction(() => location.hash.includes('/sessao/'));
  ok(page.url().includes('/sessao/AL-A'), 'a primeira missão da jornada é a letra A');
  await page.getByTestId('comecar-sessao').waitFor();
  ok((await page.locator('.trilha-dia li').count()) === 6, 'missão curta: 6 passos (letra, som, som → letra, letra → som, som → figura, traçar)');
  await page.getByTestId('comecar-sessao').click();
  await page.getByTestId('letra-grande').waitFor();
  ok(/A\s*grande\s*a\s*pequena/.test(await page.getByTestId('letra-grande').innerText()), 'a letra aparece grande: maiúscula e minúscula');
  await page.locator('.letra-exemplo.visivel').waitFor();
  ok(/A, de abelha/.test(await page.locator('.letra-palavra').innerText()), 'palavra-exemplo com figura: "A, de abelha"');
  const capAl = (_, nome) => capA(page, nome, 500);
  await jogarSessao(page, { letra: '03-letra-a-apresentacao', espelho: '04-letra-a-espelho-do-som', escolher2: '05-ache-a-letra', escolher: '06-ache-a-figura', 'tracar-antes': '07-tracar-a-letra', tirarCom: capAl });
  await page.getByTestId('selo-novo').first().waitFor({ timeout: 15000 });
  await page.waitForTimeout(CAPTURAS ? 1200 : 200);
  await cap(page, 'ritual-conquista-moedinhas');
  await capA(page, '08-ritual-selo-da-letra', 600);
  ok(await page.locator('[data-testid="selo-novo"] [data-conquista="S-LETRA-A"]').count() === 1, 'selo da letra A conquistado depois da missão');
  const ganhas = Number((await page.getByTestId('moedinhas-ganhas').innerText()).match(/\+(\d+)/)[1]);
  ok(ganhas === 6, `moedinhas fixas em bloco: +${ganhas} (6 atividades × 1)`);
  ok(await page.getByTestId('surpresa').count() >= 1, 'surpresa de nível entregue depois (P1-b)');
  ok(!(await page.getByText(/continuar jogando/i).count()), 'sem botão "continuar jogando" no ritual');

  console.log('4. Mostra pro professor → professor responde em 1 toque');
  await page.getByTestId('mostra-professor').click();
  await page.getByTestId('mostrei-ao-vivo').click();
  await page.getByTestId('demonstracao-enviada').waitFor();
  await cap(page, 'mostra-pro-professor');
  await page.goto(BASE + '#/adulto/professor');
  await passarPorteira(page);
  await page.getByTestId('professor').waitFor();
  await page.locator('[data-demo="pendente"]').first().waitFor({ timeout: 5000 }).catch(() => {});
  ok(await page.locator('[data-demo="pendente"]').count() === 1, 'demonstração na fila do professor');
  await cap(page, 'professor-fila');
  await page.getByTestId('aprendeu').click();
  await page.locator('[data-demo="aprendeu"]').waitFor();
  ok(true, 'professor marcou "Aprendeu!" em 1 toque');

  console.log('5. Painel da família');
  await page.getByTestId('sair').click();
  await page.getByTestId('entrar-familia').click();
  await page.getByTestId('pin').waitFor();
  await page.getByTestId('pin').fill('0000');
  await page.getByText('PIN incorreto').waitFor();
  ok(true, 'Área da Família pede o PIN e recusa o PIN errado');
  await passarPorteira(page);
  await page.getByTestId('area-familia').waitFor();
  await page.getByTestId('painel-Mariana').click();
  await page.getByTestId('painel-familia').waitFor();
  await page.getByText('Letra A').first().waitFor({ timeout: 5000 }).catch(() => {});
  const painel = await page.getByTestId('painel-familia').innerText();
  ok(/Nível 0 de 10/.test(painel), 'termômetro 0 de 10 no ponto de partida');
  ok(/Letra A/.test(painel), 'o selo da letra A aparece no painel');
  ok(/Trilha do Alfabeto/.test(await page.getByTestId('whatsapp').innerText()), 'a mensagem para a família fala da Trilha do Alfabeto');
  ok(/Mariana/.test(await page.getByTestId('whatsapp').innerText()), 'mensagem estilo WhatsApp com o primeiro nome');
  ok(/Ela descobriu/.test(await page.getByTestId('whatsapp').innerText()), 'concordância feminina na mensagem');
  await cap(page, 'painel-familia');
  await page.mouse.wheel(0, 700);
  await cap(page, 'painel-familia-whatsapp');

  console.log('6. Vila, recado do professor, lojinha e álbum');
  await page.goto(BASE + '#/');
  await page.getByTestId('entrar-aluno').click();
  ok(await page.getByTestId('jogar').getAttribute('data-perfil') === 'Mariana', 'o aluno entra pelo cartão dele, com "Continuar a aventura" em destaque');
  await page.locator('[data-perfil="Mariana"]').click();
  await page.locator('iframe.mundo3d, [data-testid="vila"]').first().waitFor();
  const id = page.url().split('/c/')[1].split('/')[0];
  if (await page.locator('iframe.mundo3d').count()) {
    // a captura do 3D é feita pela própria demo (mundo-3d-v2/capturas); aqui só conferimos a integração
    ok(true, 'mundo 3D da vila embutido como tela principal');
  }
  await page.goto(BASE + `#/c/${id}/vila`);
  await page.getByTestId('vila').waitFor();
  await page.waitForTimeout(400);
  await cap(page, 'vila-mapa');
  ok(/Parabéns, Mariana/.test(await page.getByTestId('vila').innerText()), 'a criança ouve o parabéns do professor na vila');
  await page.goto(BASE + `#/c/${id}/lojinha`);
  await page.getByTestId('lojinha').waitFor();
  await cap(page, 'lojinha');
  // D029: Lojinha do boneco — cadeados por fase + moedas, e Acessibilidade sempre grátis
  ok(/Abre na Letra C · 6 moedas/.test(await page.locator('[data-testid="loja-boneco"] [data-peca="camiseta-listrada"]').innerText()), 'Lojinha: camiseta listrada com cadeado "Abre na Letra C · 6 moedas"');
  ok(await page.locator('[data-testid="loja-boneco"] [data-peca="camiseta-ipe"][data-estado="pode"]').count() === 1, 'Lojinha: com a Letra B aberta e 6 moedinhas, a camiseta amarela (4) já pode ser trocada');
  ok(await page.locator('[data-testid="loja-boneco"] [data-peca="polo-terra"]').count() === 0, 'Lojinha: a menina não vê roupa de menino');
  await page.locator('[data-aba="acessibilidade"]').click();
  ok(await page.locator('[data-testid="loja-acessibilidade"] [data-acess]').count() === 4 && await page.locator('[data-testid="loja-acessibilidade"] [aria-checked="true"]').count() === 0, 'Acessibilidade: óculos, aparelho auditivo, cadeira de rodas e pintura no rosto, grátis e desligados de entrada');
  await page.locator('[data-acess="oculos"] button').click();
  await page.locator('[data-acess="oculos"] [aria-checked="true"]').waitFor();
  ok((await page.getByTestId('moedinhas').first().innerText()).match(/\d+/)[0] === '6', 'colocar os óculos não custa moedinhas');
  await page.locator('[data-acess="oculos"] button').click();
  await page.locator('[data-acess="oculos"] [aria-checked="false"]').waitFor();
  await page.locator('[data-aba="utensilios"]').click();
  await page.locator('[data-item="caderno"] button').click();
  await page.getByTestId('confirmar-troca').click();
  await page.locator('[data-item="caderno"].tem').waitFor();
  ok((await page.getByTestId('moedinhas').first().innerText()).match(/\d+/)[0] === '2', 'troca de 4 moedinhas pelo caderno (saldo 2)');
  await page.goto(BASE + `#/c/${id}/album`);
  await page.getByTestId('album').waitFor();
  await cap(page, 'album-conquistas');

  ok(await page.locator('.album-regiao[data-regiao="AL"] .conquista-item').count() === 27, 'Álbum: 26 selos das letras + o troféu Alfabeto Completo');
  ok(await page.locator('.album-regiao[data-regiao="AL"] .conquista-item.ganha').count() === 1, 'Álbum: só o selo da letra A brilha por enquanto');
  await page.locator('.album-regiao[data-regiao="AL"]').evaluate((el) => el.scrollIntoView({ block: 'start' }));
  await capA(page, '12-album-selos-das-letras', 700);

  console.log('7. Letra B liberada (C trancada), letras B–E e a revisão');
  await page.goto(BASE + `#/c/${id}/alfabeto`);
  await page.getByTestId('trilha-alfabeto').waitFor();
  ok(await page.locator('[data-fase="AL-A"][data-estado="feita"]').count() === 1 && await page.locator('[data-fase="AL-B"][data-estado="atual"]').count() === 1, 'trilha: a letra A brilha e a letra B está liberada');
  ok(await page.locator('[data-fase="AL-C"]').isDisabled(), 'trilha: a letra C continua trancada');
  ok(/1 de 26/.test(await page.getByTestId('letras-feitas').innerText()), 'contador: 1 de 26 letras');
  await capA(page, '09-trilha-letra-b-liberada', 900);
  await page.goto(BASE + `#/c/${id}/fase/AL-B`);
  await page.getByTestId('conquistas-fase').waitFor();
  ok(await page.locator('[data-estado="bloqueada"]').count() >= 1, 'conquistas ainda não ganhas aparecem apagadas com cadeado e a habilidade');
  ok(!(await page.getByTestId('ir-lojinha').count()), 'sem Lojinha na entrada da fase (P7-b)');
  await cap(page, 'fase-minhas-conquistas');
  await page.goto(BASE + `#/c/${id}/fase/AL-C`);
  await page.waitForTimeout(300);
  ok(page.url().includes('/vila'), 'sem pular fases: a letra C bloqueada volta para a vila');
  await page.goto(BASE + `#/c/${id}/sessao/AL-R1`);
  await page.waitForTimeout(300);
  ok(page.url().includes('/vila'), 'sem pular fases: a revisão só abre depois das 5 letras');
  for (const l of ['B', 'C', 'D', 'E']) {
    await page.goto(BASE + `#/c/${id}/sessao/AL-${l}`);
    await jogarSessao(page, {});
    await page.getByTestId('ritual').locator('h1').waitFor();
    ok(/Fase concluída: Letra/.test(await page.getByTestId('ritual').locator('h1').innerText()), `letra ${l} concluída`);
  }
  await page.goto(BASE + `#/c/${id}/alfabeto`);
  await page.getByTestId('trilha-alfabeto').waitFor();
  ok(await page.locator('[data-fase="AL-R1"][data-estado="atual"]').count() === 1 && await page.locator('[data-fase="AL-F"]').isDisabled(), 'depois de A–E vem a revisão; a letra F espera');
  await page.goto(BASE + `#/c/${id}/sessao/AL-R1`);
  await page.getByTestId('comecar-sessao').waitFor();
  ok(/Aquecimento/.test(await page.locator('.trilha-dia').innerText()), 'a revisão começa com um aquecimento de escuta (palmas)');
  await jogarSessao(page, { 'cena:AL-R1-C4a': '10a-revisao-ache-a-letra', 'cena:AL-R1-C4b': '10b-revisao-letra-figura', 'cena:AL-R1-C4c': '10c-revisao-com-qual-letra', tirarCom: capAl });
  await page.getByTestId('ritual').locator('h1').waitFor();
  ok(/Fase concluída: Revisão/.test(await page.getByTestId('ritual').locator('h1').innerText()), 'revisão das letras A–E concluída');
  await page.goto(BASE + `#/c/${id}/alfabeto`);
  await page.getByTestId('trilha-alfabeto').waitFor();
  ok(await page.locator('.marco.feita').count() === 6 && await page.locator('[data-fase="AL-F"][data-estado="atual"]').count() === 1, 'trilha: A–E e a revisão brilham; a letra F está liberada');
  ok(/5 de 26/.test(await page.getByTestId('letras-feitas').innerText()), 'contador: 5 de 26 letras');
  await capA(page, '11-trilha-depois-da-revisao', 900);

  console.log('8. Conheça seu corpo, mapa e celular');
  await page.goto(BASE + `#/c/${id}/corpo`);
  await page.waitForTimeout(1500);
  await cap(page, 'conheca-seu-corpo');
  await page.goto(BASE + `#/c/${id}/mapa`);
  await page.waitForTimeout(300);
  await cap(page, 'arquipelago');
  await page.goto(BASE + `#/c/${id}/regiao/R2a`);
  await page.waitForTimeout(300);
  await cap(page, 'regiao-trilha-fases');
  await page.goto(BASE + '#/adulto/config');
  await passarPorteira(page);
  await cap(page, 'configuracoes-padroes-mvp');

  console.log('8b. Cadastro antigo (D029): sexo "prefiro não informar" e avatar de recorte');
  await page.evaluate(async () => {
    const db = await new Promise((ok, erro) => { const r = indexedDB.open('fonema'); r.onsuccess = () => ok(r.result); r.onerror = () => erro(r.error); });
    const tx = db.transaction(['criancas'], 'readwrite');
    tx.objectStore('criancas').put({
      id: 'cr-antiga', nome: 'Rafa', genero: 'n', anoNascimento: 2020, pronuncia: { grafia: 'Rafa', fala: 'Rafa', rate: 1, pitchExtra: 0, voz: 'sofia' },
      avatar: { base: 'crianca-07-black-power-alto', cantinho: 'mata' }, apoios: { previsivel: false, focoCurto: false, leituraReforco: false, calmo: false },
      jaSabe: { letrasDoNome: 'nao-sei', lePalavras: 'nao-sei', leFrases: 'nao-sei' }, consentimentos: { responsavel: true, vozPrimeiroNome: true, gravarVozAdulto: false, em: 1 },
      rotina: { minutosDia: 15, horaDormir: '20:00' }, criadoEm: 5
    });
    await new Promise((ok) => { tx.oncomplete = ok; });
    db.close();
  });
  await page.goto(BASE + '#/aluno');
  await page.locator('[data-perfil="Rafa"]').waitFor();
  ok(true, 'criança de cadastro antigo aparece nos cartões sem quebrar');
  await page.goto(BASE + '#/c/cr-antiga/vila');
  await page.locator('[data-testid="montar-avatar"][data-passo="sexo"]').waitFor();
  ok(page.url().includes('/avatar'), 'cadastro antigo sem sexo: o app pede "menino ou menina?" uma vez, antes de qualquer tela');
  await page.locator('[data-sexo="m"]').click();
  await page.locator('[data-testid="montar-avatar"][data-passo="pele"]').waitFor();
  ok(await page.locator('.montar-corpo [data-peca="pele-09"][aria-checked="true"]').count() === 1, 'avatar antigo migrado: a cor de pele equivalente já vem escolhida');
  await page.locator('[data-ir-passo="cabelo"]').click();
  ok(await page.locator('.montar-corpo [data-peca="m-black-power"][aria-checked="true"]').count() === 1, 'avatar antigo migrado: black power de menino, depois da escolha do sexo');
  await page.locator('[data-ir-passo="lojinha"]').click();
  await page.getByTestId('avatar-pronto').click();
  await page.locator('[data-testid="primeira-missao"], [data-testid="vila"]').first().waitFor();
  await page.goto(BASE + '#/c/cr-antiga/vila');
  await page.getByTestId('vila').waitFor();
  ok(true, 'depois da escolha, a criança entra na vila e o app não pergunta de novo');

  const JORNADA = !process.argv.includes('--sem-jornada');
  {
  console.log('9. Jornada inteira: Alfabeto → Sílabas → Palavras → Meu nome (modo demonstração: domínio em 1 sessão)');
    const ctx2 = await browser.newContext({ viewport: { width: 1280, height: 800 }, locale: 'pt-BR' });
    await ctx2.addInitScript((c) => { try { localStorage.setItem('fonema-teste-rapido', '1'); if (c) localStorage.setItem('fonema-coletar', '1'); } catch { /* sem armazenamento */ } }, COLETAR);
    const pj = await ctx2.newPage();
    pj.on('pageerror', (e) => erros.push(String(e)));
    await pj.goto(BASE + '#/adulto/config');
    await passarPorteira(pj);
    await pj.getByTestId('avancado').locator('summary').click();
    await pj.getByTestId('modo-demo').click();
    await pj.waitForFunction(() => document.querySelector('[data-testid=modo-demo]')?.checked);
    await pj.goto(BASE + '#/adulto/cadastro');
    await cadastrar(pj, 'Helena', 'f', { previa: 'pronta, Helena' });
    await montarAvatar(pj);
    await pj.getByTestId('primeira-missao').waitFor();
    const idj = pj.url().split('/c/')[1].split('/')[0];
    // --sem-jornada: pula a jornada inteira (demorada) e vai direto ao nível inicial
    const AL = [...'ABCDE', 'R1', ...'FGHIJ', 'R2', ...'KLMNO', 'R3', ...'PQRST', 'R4', ...'UVWXYZ', 'FESTA'].map((x) => `AL-${x}`);
    const FASES = [...AL, 'R1-F02', 'R1-F03', 'R1-F06', 'R1-F07', 'R2a-F01', 'R2a-F02', 'R2a-F03', 'R2a-F04', 'R2a-F05', 'R0-F01'];
    for (const f of JORNADA ? FASES : []) {
      let concluiu = false;
      for (let tentativa = 0; tentativa < 3 && !concluiu; tentativa++) {
        await pj.goto(BASE + `#/c/${idj}/sessao/${f}`);
        await jogarSessao(pj, {});
        await pj.getByTestId('ritual').locator('h1').waitFor();
        concluiu = /Fase concluída/.test(await pj.getByTestId('ritual').locator('h1').innerText());
      }
      ok(concluiu, `fase ${f} jogada e concluída`);
      if (f === 'AL-FESTA') {
        ok(await pj.locator('[data-testid="selo-novo"] [data-conquista="T-ALFABETO"]').count() === 1, 'Festa do Alfabeto: troféu "Alfabeto Completo"');
        await pj.goto(BASE + `#/c/${idj}/alfabeto`);
        await pj.getByTestId('trilha-alfabeto').waitFor();
        ok(await pj.locator('.marco.feita').count() === 31 && /26 de 26/.test(await pj.getByTestId('letras-feitas').innerText()), 'trilha completa: 26 de 26 letras brilhando');
        ok(/Continuar a jornada/.test(await pj.getByTestId('trilha-continuar').innerText()), 'depois do alfabeto, a trilha leva às sílabas');
        await capA(pj, '15-trilha-completa', 1200);
      }
    }
    if (JORNADA) {
    await pj.goto(BASE + `#/adulto/familia/${idj}`);
    await pj.getByTestId('painel-familia').waitFor();
    await pj.getByText('Nível 2 de 10').first().waitFor({ timeout: 5000 }).catch(() => {});
    ok(/Nível 2 de 10/.test(await pj.getByTestId('painel-familia').innerText()), 'termômetro subiu para 2 depois da Cachoeira das Sílabas');
    ok(/Exploração das Palavras/.test(await pj.getByTestId('painel-familia').innerText()), 'título "Exploração das Palavras" depois do portão');
    }
    await guardarFalas(pj);

    console.log('10. Nível inicial escolhido pelo adulto (D026)');
    await pj.goto(BASE + '#/adulto/cadastro');
    await cadastrar(pj, 'Davi', 'm', { nivel: 'letras-e-sons' });
    await montarAvatar(pj);
    await pj.getByTestId('primeira-missao').click();
    await pj.waitForFunction(() => location.hash.includes('/sessao/'));
    ok(pj.url().includes('/sessao/R2a-F01'), '"já conhece as letras e os sons" pula o Alfabeto e começa nas sílabas (R2a-F01)');
    const idd = pj.url().split('/c/')[1].split('/')[0];
    await pj.goto(BASE + `#/c/${idd}/alfabeto`);
    await pj.locator('.marco.liberada').first().waitFor();
    ok(await pj.locator('.marco.liberada').count() === 31 && !(await pj.locator('.marco.feita').count()), 'o Alfabeto inteiro fica aberto para revisar, sem contar como concluído');
    await capA(pj, '14-trilha-liberada-para-revisar', 900);
    await pj.goto(BASE + `#/c/${idd}/sessao/AL-H`);
    await pj.getByTestId('comecar-sessao').click();
    await pj.locator('.letra-nota.visivel').waitFor();
    ok(/não faz som sozinho/.test(await pj.locator('.letra-nota').innerText()), 'letra H: "não faz som sozinho" (sem Espelho do Som)');
    await capA(pj, '13-letra-h-muda', 900);
    await pj.goto(BASE + '#/adulto/cadastro');
    await cadastrar(pj, 'Lia', 'f', { nivel: 'le-palavras' });
    await montarAvatar(pj);
    await pj.getByTestId('primeira-missao').click();
    await pj.waitForFunction(() => location.hash.includes('/sessao/'));
    ok(pj.url().includes('/sessao/R2a-F04'), '"já lê palavras" começa no ponto de leitura mais avançado (R2a-F04)');
    await pj.goto(BASE + `#/adulto/familia/${idd}`);
    await pj.getByTestId('mudar-nivel').click();
    await pj.locator('[data-nivel="zero"]').click();
    await pj.getByTestId('mudar-nivel').waitFor();
    ok(/Do zero/.test(await pj.getByTestId('nivel-inicial').innerText()), 'o adulto muda o nível inicial na área da família');
    await ctx2.close();
  }

  if (CAPTURAS_AL) {
    const cel = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'pt-BR' });
    await cel.addInitScript(() => { try { localStorage.setItem('fonema-teste-rapido', '1'); } catch { /* sem armazenamento */ } });
    const p3 = await cel.newPage();
    const capC = (_, nome) => capA(p3, `celular-${nome}`, 500);
    await p3.goto(BASE + '#/adulto/cadastro');
    await passarPorteira(p3);
    await cadastrar(p3, 'Kauã', 'm');
    await montarAvatar(p3);
    await p3.getByTestId('primeira-missao').waitFor();
    const idk = p3.url().split('/c/')[1].split('/')[0];
    await p3.goto(BASE + `#/c/${idk}/alfabeto`);
    await p3.getByTestId('trilha-alfabeto').waitFor();
    await capC(0, '01-trilha-inicio');
    await p3.goto(BASE + `#/c/${idk}/sessao/AL-A`);
    await jogarSessao(p3, { letra: '03-letra-a-apresentacao', espelho: '04-letra-a-espelho-do-som', escolher2: '05-ache-a-letra', escolher: '06-ache-a-figura', 'tracar-antes': '07-tracar-a-letra', tirarCom: capC });
    await p3.getByTestId('selo-novo').first().waitFor({ timeout: 15000 });
    await capC(0, '08-ritual-selo-da-letra');
    await p3.goto(BASE + `#/c/${idk}/alfabeto`);
    await p3.getByTestId('trilha-alfabeto').waitFor();
    await capC(0, '09-trilha-letra-b-liberada');
    await p3.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await capC(0, '09b-trilha-fim-e-etapas');
    for (const l of ['B', 'C', 'D', 'E']) { await p3.goto(BASE + `#/c/${idk}/sessao/AL-${l}`); await jogarSessao(p3, {}); }
    await p3.goto(BASE + `#/c/${idk}/sessao/AL-R1`);
    await jogarSessao(p3, { 'cena:AL-R1-C4c': '10c-revisao-com-qual-letra', tirarCom: capC });
    await p3.goto(BASE + `#/c/${idk}/alfabeto`);
    await p3.getByTestId('trilha-alfabeto').waitFor();
    await capC(0, '11-trilha-depois-da-revisao');
    await p3.goto(BASE + `#/c/${idk}/album`);
    await p3.getByTestId('album').waitFor();
    await p3.locator('.album-regiao[data-regiao="AL"]').evaluate((el) => el.scrollIntoView({ block: 'start' }));
    await capC(0, '12-album-selos-das-letras');
    await p3.goto(BASE + `#/c/${idk}/vila`);
    await p3.getByTestId('vila').waitFor();
    await capC(0, '16-vila-com-alfabeto');
    await cel.close();
  }

  if (CAPTURAS_V2) {
    const cel = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'pt-BR' });
    await cel.addInitScript(() => { try { localStorage.setItem('fonema-teste-rapido', '1'); } catch { /* sem armazenamento */ } });
    const p2 = await cel.newPage();
    // o celular tem o próprio banco: cadastro rápido
    await p2.goto(BASE + '#/adulto/cadastro');
    await passarPorteira(p2);
    await cadastrar(p2, 'Kauã', 'm');
    const capCel = async (nome, espera = 400) => { await p2.waitForTimeout(espera); await p2.screenshot({ path: `${DIR_CAP}/v2-celular-${nome}.png`, fullPage: false }); };
    await capCel('04-avatar');
    await montarAvatar(p2);
    await p2.getByTestId('primeira-missao').waitFor();
    await capCel('05-chegada');
    const idc = p2.url().split('/c/')[1].split('/')[0];
    await p2.getByTestId('primeira-missao').click();
    await p2.getByTestId('comecar-sessao').waitFor();
    await capCel('06-sessao-acolhida');
    await jogarSessao(p2, { espelho: '09-espelho-do-som', escolher: '10-escolher', pausa: '10b-pausa', montar: '11-montar', tirarCom: (_, nome) => capCel(nome, 250) });
    await p2.getByTestId('selo-novo').first().waitFor({ timeout: 15000 });
    await capCel('12-ritual', 1500);
    await p2.getByTestId('voltar-vila').click();
    await p2.getByTestId('vila').waitFor();
    await capCel('13-vila', 1200);
    for (const [rota, nome] of [['album', '14-album'], ['lojinha', '15-lojinha'], ['mapa', '16-arquipelago'], ['regiao/R2a', '17-regiao'], ['fase/AL-B', '18-entrada-da-fase']]) {
      await p2.goto(BASE + `#/c/${idc}/${rota}`);
      await capCel(nome, 900);
    }
    await p2.goto(BASE + `#/adulto/familia/${idc}`);
    await p2.getByTestId('painel-familia').waitFor();
    await capCel('19-painel-familia', 700);
    await p2.goto(BASE + '#/adulto');
    await capCel('20-area-do-adulto', 700);
    await p2.goto(BASE + '#/');
    await p2.getByTestId('primeira-vez').waitFor();
    await capCel('01-entrada', 2400);
    await p2.evaluate(() => sessionStorage.clear());
    await p2.getByTestId('entrar-familia').click();
    await p2.getByTestId('pin').waitFor();
    await capCel('02-pin-do-adulto', 600);
    await passarPorteira(p2);
    await p2.goto(BASE + '#/familia/cadastro');
    await p2.getByTestId('campo-nome').fill('Bia');
    await p2.locator('[data-idade="6"]').click();
    await p2.locator('[data-genero="f"]').click();
    await p2.getByTestId('cadastro-continuar').click();
    await capCel('03-cadastro-de-onde-comeca', 500);
    await cel.close();
  }

  if (CAPTURAS_V2) {
    const cel = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'pt-BR' });
    await cel.addInitScript(() => { try { localStorage.setItem('fonema-teste-rapido', '1'); } catch { /* sem armazenamento */ } });
    const p2 = await cel.newPage();
    // o celular tem o próprio banco: cadastro rápido
    await p2.goto(BASE + '#/adulto/cadastro');
    await passarPorteira(p2);
    await cadastrar(p2, 'Kauã', 'm');
    const capCel = async (nome, espera = 400) => { await p2.waitForTimeout(espera); await p2.screenshot({ path: `${DIR_CAP}/v2-celular-${nome}.png`, fullPage: false }); };
    await capCel('04-avatar');
    await montarAvatar(p2);
    await p2.getByTestId('primeira-missao').waitFor();
    await capCel('05-chegada');
    const idc = p2.url().split('/c/')[1].split('/')[0];
    await p2.getByTestId('primeira-missao').click();
    await p2.getByTestId('comecar-sessao').waitFor();
    await capCel('06-sessao-acolhida');
    await jogarSessao(p2, { espelho: '09-espelho-do-som', escolher: '10-escolher', pausa: '10b-pausa', montar: '11-montar', tirarCom: (_, nome) => capCel(nome, 250) });
    await p2.getByTestId('selo-novo').first().waitFor({ timeout: 15000 });
    await capCel('12-ritual', 1500);
    await p2.getByTestId('voltar-vila').click();
    await p2.getByTestId('vila').waitFor();
    await capCel('13-vila', 1200);
    for (const [rota, nome] of [['album', '14-album'], ['lojinha', '15-lojinha'], ['mapa', '16-arquipelago'], ['regiao/R2a', '17-regiao'], ['fase/AL-B', '18-entrada-da-fase']]) {
      await p2.goto(BASE + `#/c/${idc}/${rota}`);
      await capCel(nome, 900);
    }
    await p2.goto(BASE + `#/adulto/familia/${idc}`);
    await p2.getByTestId('painel-familia').waitFor();
    await capCel('19-painel-familia', 700);
    await p2.goto(BASE + '#/adulto');
    await capCel('20-area-do-adulto', 700);
    await p2.goto(BASE + '#/');
    await p2.getByTestId('jogar').waitFor();
    await capCel('01-entrada', 2400);
    await p2.evaluate(() => sessionStorage.clear());
    await p2.getByTestId('area-adulto').click();
    await p2.getByTestId('segurar-adulto').waitFor();
    await capCel('02-portao-adulto', 600);
    await passarPorteira(p2);
    await p2.goto(BASE + '#/adulto/cadastro');
    await p2.getByTestId('campo-nome').fill('Bia');
    await p2.getByTestId('cadastro-continuar').click();
    await p2.getByTestId('nome-continuar').click();
    await p2.locator('[data-genero="f"]').click();
    await p2.getByTestId('genero-continuar').click();
    await capCel('03-cadastro-de-onde-comeca', 500);
    await cel.close();
  }

  await guardarFalas(page);
  if (COLETAR) {
    const arq = resolve(aqui, 'falas-coletadas.json');
    const antes = existsSync(arq) ? JSON.parse(readFileSync(arq, 'utf8')) : [];
    writeFileSync(arq, JSON.stringify([...new Set([...antes, ...coletadas])].sort(), null, 1));
    console.log(`  · ${coletadas.size} falas coletadas → e2e/falas-coletadas.json`);
  }
  ok(erros.length === 0, `sem erros de JavaScript na página${erros.length ? ': ' + erros.join(' | ') : ''}`);
  await browser.close();
  console.log('\nE2E OK');
}

main()
  .catch((e) => { console.error(e); process.exitCode = 1; })
  .finally(() => servidor?.kill());
