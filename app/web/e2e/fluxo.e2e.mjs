// FONEMA · teste E2E (Playwright + Chromium do ambiente, sem `playwright install`).
// D027: a jornada começa pela TRILHA DO ALFABETO.
// Percorre (D028): primeira vez → conta do responsável com PIN → cadastro da criança em 3 passos → avatar → chegada → letra A completa (apresentação, Espelho do Som, ache a letra,
// ache a figura, traçar) → selo da letra A no ritual → Mostra pro professor → professor (1 toque) → painel da família
// → lojinha → álbum → D031: depois da letra A vem a lição do som /a/ (TF-01; letra B trancada) → letra E → TF-02
// → jornada inteira, letras e sons alternados (modo demonstração) → nível inicial: "já conhece as letras e os sons" começa em TF-06.
// Uso:  npm run e2e            (servidor de preview próprio, porta 4179)
//       npm run capturas       (idem + salva as capturas da Trilha do Alfabeto em app/docs/capturas/alfabeto-*.png)
//       node e2e/fluxo.e2e.mjs --capturas-v2   (capturas antigas v2-*.png; a numeração é anterior à D027)
//       BASE_URL=http://localhost:5173 node e2e/fluxo.e2e.mjs
import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { trechoVozReal } from './trecho-voz-real.mjs';
import { trechoNomeFalado } from './trecho-nome-falado.mjs';
import { trechoCapturasAa } from './trecho-capturas-aa.mjs';
import { trechoCopia } from './trecho-copia.mjs';
import { capturasCorrida, roboCorrida, trechoJogos } from './trecho-jogos.mjs';
import { trechoJogos2 } from './trecho-jogos2.mjs';
import { trechoMemoria } from './trecho-memoria.mjs';
import { trechoMundo3d } from './trecho-mundo3d.mjs';
import { trechoCaca } from './trecho-caca.mjs';
import { trechoAdmin } from './trecho-admin.mjs';
import { trechoGerenciador } from './trecho-gerenciador.mjs';
import { trechoFoto3d } from './trecho-foto3d.mjs';
import { trechoTutorial } from './trecho-tutorial.mjs';
import { trechoFichas } from './trecho-fichas.mjs';
import { trechoDesbloqueio } from './trecho-desbloqueio.mjs';
import { trechoTelas } from './trecho-telas.mjs';
import { trechoGuia } from './trecho-guia.mjs';

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
 * Personaliza o boneco 3D (D029 §7): o boneco já começa pronto, então basta "Pronto!". Com `escolhas`
 * (ex.: { pele: 'pele-08', camisa: 'ipe' }) passa pelos passos e toca as cores pedidas antes de concluir.
 */
async function montarAvatar(page, escolhas = {}) {
  await page.getByTestId('montar-avatar').waitFor();
  for (const [passo, peca] of Object.entries(escolhas)) {
    await page.locator(`[data-ir-passo="${passo}"]`).click();
    await page.locator(`.montar-corpo [data-peca="${peca}"]`).click();
    await page.locator(`.montar-corpo [data-peca="${peca}"][aria-checked="true"]`).waitFor();
  }
  await page.getByTestId('avatar-pronto').click();
  await pularTutorial(page);
}

/**
 * D032: na primeira vez, depois do boneco abre o tutorial "A grande aventura". Os outros trechos pulam (botão do adulto) e caem
 * na Chegada, como antes; o tutorial inteiro é percorrido em `--tutorial` (trecho-tutorial.mjs).
 */
async function pularTutorial(page) {
  const alvo = page.locator('[data-testid="tutorial"], [data-testid="primeira-missao"], [data-testid="vila"]').first();
  await alvo.waitFor({ timeout: 15000 }).catch(() => {});
  if (await page.getByTestId('tutorial').count()) {
    await page.getByTestId('pular-tutorial').click();
    await page.getByTestId('tutorial').waitFor({ state: 'detached' });
  }
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
      // também aceita a chave pela cena exata (ex.: 'cena:AL-RV1-C4c')
      for (const k of [chave, `cena:${cena}`]) if (capturar[k] && !vistos.has(k)) { vistos.add(k); await (capturar.tirarCom ?? cap)(page, capturar[k]); }
    };

    if (await page.getByTestId('comecar-sessao').isVisible().catch(() => false)) { await tirar('acolhida'); await page.getByTestId('comecar-sessao').click({ timeout: 3000 }).catch(() => {}); continue; }
    // ---- Trilha dos Sons (D030) ----
    const somNovo = page.getByTestId('som-novo-continuar');
    if (await somNovo.isVisible().catch(() => false)) {
      if (await somNovo.isEnabled({ timeout: 300 }).catch(() => false)) { await tirar('som-novo'); await somNovo.click({ timeout: 3000 }).catch(() => {}); }
      else await page.waitForTimeout(80);
      continue;
    }
    const sintese = page.getByTestId('sintese');
    if (await sintese.isVisible().catch(() => false)) {
      const proxima = page.locator('[data-sintese-proxima]:not([disabled])');
      if (await proxima.count()) { await tirar('sintese-tocar'); await proxima.first().click({ timeout: 3000 }).catch(() => {}); await page.waitForTimeout(60); continue; }
      const juntar = page.getByTestId('sintese-juntar');
      if (await juntar.isVisible().catch(() => false)) { await juntar.click({ timeout: 3000 }).catch(() => {}); continue; }
      // depois de juntar: a escolha cai nos tratadores genéricos (figura certa ou botão de som + "É este!")
      if (!(await page.locator('.mec-sintese button.opcao').count())) { await page.waitForTimeout(80); continue; }
      await tirar('sintese-escolher');
    }
    const caixas = page.getByTestId('caixas');
    if (await caixas.isVisible().catch(() => false)) {
      const et = await caixas.getAttribute('data-etapa', { timeout: 500 }).catch(() => null);
      if (et === 'fichas') {
        const n = Number(await caixas.getAttribute('data-n-sons').catch(() => 0));
        const ficha = page.getByTestId('caixas-ficha');
        if (!(await ficha.isEnabled({ timeout: 300 }).catch(() => false))) { await page.waitForTimeout(80); continue; }
        const ja = await page.locator('.caixa.com-ficha').count();
        for (let k = ja; k < n; k++) await ficha.click({ timeout: 3000 }).catch(() => {});
        await tirar('caixas-fichas');
        await page.getByTestId('caixas-pronto').click({ timeout: 3000 }).catch(() => {});
        await page.waitForTimeout(120);
        continue;
      }
      if (et === 'letras') {
        const l = await caixas.getAttribute('data-proxima-letra').catch(() => '');
        if (l) { await tirar('caixas-letras'); await page.locator(`.caixas-letra[data-letra="${l}"]`).first().click({ timeout: 3000 }).catch(() => {}); }
        await page.waitForTimeout(80);
        continue;
      }
      await page.waitForTimeout(80);
      continue;
    }
    const fraseLi = page.getByTestId('frase-li');
    if (await fraseLi.isVisible().catch(() => false)) { if (await fraseLi.isEnabled({ timeout: 300 }).catch(() => false)) { await tirar('frase'); await fraseLi.click({ timeout: 3000 }).catch(() => {}); } else await page.waitForTimeout(80); continue; }
    const ecoLi = page.getByTestId('eco-li');
    if (await ecoLi.isVisible().catch(() => false)) { if (await ecoLi.isEnabled({ timeout: 300 }).catch(() => false)) { await tirar('eco'); await ecoLi.click({ timeout: 3000 }).catch(() => {}); } else await page.waitForTimeout(80); continue; }
    if (await page.getByTestId('troca').isVisible().catch(() => false)) await tirar(`troca-${await page.getByTestId('troca').getAttribute('data-etapa').catch(() => '')}`);
    if (await page.getByTestId('par-minimo').isVisible().catch(() => false)) await tirar(`par-${await page.getByTestId('par-minimo').getAttribute('data-modo').catch(() => '')}`);
    if (await page.getByTestId('frase').isVisible().catch(() => false)) await tirar('frase-responder');
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
    // cena que já começa como jogo (lições de vogal: Corre-Som e Bichinho Come-Som, revisão 18/11 item 10)
    const corre = page.getByTestId('corre-som');
    if (await corre.isVisible().catch(() => false)) {
      await tirar('corre-som');
      // D035: corrida sem parar; o arco da vez vem com data-decidir; no fim da fase, "Continuar"
      if (await page.getByTestId('corrida-continuar').isVisible().catch(() => false)) await page.getByTestId('corrida-continuar').click({ timeout: 2000 }).catch(() => {});
      else await roboCorrida(page); // o robô dentro da página toca o arco da vez (sem a demora do Playwright)
      await page.waitForTimeout(100);
      continue;
    }
    const come = page.getByTestId('come-som');
    if (await come.isVisible().catch(() => false)) {
      await tirar('come-som');
      if (await come.getAttribute('data-livre').catch(() => null) && !(await come.getAttribute('data-demo').catch(() => null))) await page.locator('.cm-prato[data-correta="1"]').first().click({ timeout: 2000 }).catch(() => {});
      await page.waitForTimeout(100);
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
  // MEC_FASES=R2a-F04,… troca a lista (útil para investigar uma fase só)
  for (const f of process.env.MEC_FASES?.split(',') ?? ['AL-B', 'AL-RV1', 'AL-RV3', 'R2a-F01', 'R2a-F02', 'R2a-F03', 'R2a-F04']) {
    await page.goto(BASE + `#/c/${id}/sessao/${f}`);
    await jogarSessao(page, { gancho }).catch(async (e) => { if (process.env.MEC_FALHA) await page.screenshot({ path: process.env.MEC_FALHA }); throw e; });
    console.log(`  fase ${f} jogada: ${(await page.getByTestId('ritual').locator('h1').innerText().catch(() => '')).trim()}`);
  }
  if (process.env.MEC_FASES) { await ctx.close(); return; }
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

/**
 * TRILHA DOS SONS (D030 etapas 6–8): a criança que "já conhece as letras e os sons" começa na trilha fônica (TF-06),
 * revisita TF-01 e anda, sem pular, até TF-22 — passando por som novo, síntese, leitura com palavras inventadas
 * conferidas, caixas de sons, pares mínimos, troca-letras, frase com pergunta e leitura em eco (modo demonstração).
 * `node e2e/fluxo.e2e.mjs --trilha-sons` roda só este trecho.
 */
async function trechoTrilhaSons(browser, erros) {
  console.log('11. Trilha dos Sons: TF-01, TF-06 → TF-22 (domínio em 1 sessão no modo demonstração)');
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, locale: 'pt-BR' });
  await ctx.addInitScript((c) => { try { localStorage.setItem('fonema-teste-rapido', '1'); if (c) localStorage.setItem('fonema-coletar', '1'); } catch { /* sem armazenamento */ } }, COLETAR);
  const pg = await ctx.newPage();
  pg.on('pageerror', (e) => erros.push(String(e)));
  await pg.goto(BASE + '#/adulto/config');
  await passarPorteira(pg);
  await pg.getByTestId('avancado').locator('summary').click();
  await pg.getByTestId('modo-demo').click();
  await pg.waitForFunction(() => document.querySelector('[data-testid=modo-demo]')?.checked);
  await pg.goto(BASE + '#/adulto/cadastro');
  await cadastrar(pg, 'Bruno', 'm', { nivel: 'letras-e-sons' });
  await montarAvatar(pg);
  await pg.getByTestId('primeira-missao').click();
  await pg.waitForFunction(() => location.hash.includes('/sessao/'));
  ok(pg.url().includes('/sessao/TF-06'), 'Trilha dos Sons: "já conhece as letras e os sons" começa em TF-06');
  const id = pg.url().split('/c/')[1].split('/')[0];
  await pg.goto(BASE + `#/c/${id}/sons`);
  await pg.getByTestId('trilha-sons').waitFor();
  ok(await pg.locator('.sons-marco.liberada').count() === 5 && await pg.locator('[data-fase="TF-06"][data-estado="atual"]').count() === 1 && await pg.locator('[data-fase="TF-07"]').isDisabled(), 'a trilha mostra TF-01…05 abertas para revisar, TF-06 agora e TF-07 trancada');
  const jogar = async (f) => {
    let concluiu = false;
    for (let t = 0; t < 3 && !concluiu; t++) {
      // sai da tela do ritual antes (a mesma rota com o mesmo hash não recarrega a sessão)
      await pg.goto(BASE + `#/c/${id}/sons`);
      await pg.getByTestId('trilha-sons').waitFor();
      await pg.goto(BASE + `#/c/${id}/sessao/${f}`);
      await jogarSessao(pg, {});
      await pg.getByTestId('ritual').locator('h1').waitFor();
      concluiu = /Fase concluída/.test(await pg.getByTestId('ritual').locator('h1').innerText());
    }
    return concluiu;
  };
  ok(await jogar('TF-01'), 'TF-01 (o som /a/): som novo, som → letra e som inicial');
  const ordem = ['TF-06', ...Array.from({ length: 9 }, (_, k) => `TF-${String(k + 7).padStart(2, '0')}`), 'TF-R2', ...Array.from({ length: 7 }, (_, k) => `TF-${k + 16}`)];
  for (const f of ordem) {
    const c = await jogar(f);
    if (!c) {
      // diagnóstico: as tentativas de cada habilidade da fase, direto do banco do aparelho
      const info = await pg.evaluate(async ([cid, fase]) => {
        const db = await new Promise((r) => { const q = indexedDB.open('fonema'); q.onsuccess = () => r(q.result); });
        const p = await new Promise((r) => { const q = db.transaction('progressos').objectStore('progressos').get(cid); q.onsuccess = () => r(q.result); });
        return { fase: p.fases[fase], habs: Object.fromEntries(Object.entries(p.habilidades).map(([h, e]) => [h, e.tentativas.map((t) => `${t.cena}:${t.tipo ?? '?'}:${t.acertou ? 'ok' : 'x'}${t.comAjuda ? '+aj' : ''}`).slice(-12)])) };
      }, [id, f]);
      console.log(JSON.stringify(info, null, 1).slice(0, 6000));
    }
    if (['TF-07', 'TF-16', 'TF-22'].includes(f) || !c) ok(c, `${f} jogada e concluída (por domínio, com resposta conferida)`);
  }
  await pg.goto(BASE + `#/c/${id}/sons`);
  await pg.getByTestId('trilha-sons').waitFor();
  // concluída × dominada (D030): dourada só quando TODAS as habilidades da fase firmaram (síntese, escrita, pares…),
  // o que pede mais sessões; nesta volta rápida a maioria fica verde (concluída, ainda treinando)
  const dominadas = await pg.locator('.sons-marco.dominada').count();
  const concluidas = await pg.locator('.sons-marco.feita').count() + dominadas;
  ok(concluidas === 19 && dominadas >= 1, `concluída × dominada na trilha: ${concluidas} lições concluídas, ${dominadas} já douradas (dominadas pelo motor)`);
  ok(await pg.locator('[data-fase="TF-R3"][data-estado="atual"]').count() === 1, 'depois de TF-22 vem a revisão dos sons que estouram (TF-R3)');
  // bloco 4 (17/11): TF-23 (é, ó), TF-24 (abertas sem acento, ê, ô) e TF-25 (ã) na jornada; TF-26 em diante em espera de som
  for (const f of ['TF-R3', 'TF-23', 'TF-24', 'TF-25']) ok(await jogar(f), `${f} jogada e concluída (bloco 4: é/ó, ê/ô, ã)`);
  await pg.goto(BASE + `#/c/${id}/sons`);
  await pg.getByTestId('trilha-sons').waitFor();
  ok(await pg.locator('[data-fase="TF-25"]').count() === 1 && await pg.locator('[data-fase="TF-26"]').count() === 0, 'a trilha mostra o bloco 4 até TF-25; as lições em espera de som (TF-26…) não aparecem');
  await guardarFalas(pg);
  await ctx.close();
}

/**
 * Capturas da Trilha dos Sons (v7-trilha-*): cada mecânica nova e a trilha no mapa, em 1850×980 e 390×844.
 * Usa uma criança "já lê palavras" (a trilha toda fica aberta para revisar) para ir direto a cada lição.
 * `node e2e/fluxo.e2e.mjs --capturas-trilha`
 */
async function capturasTrilhaSons(browser) {
  mkdirSync(DIR_CAP, { recursive: true });
  for (const [w, h, suf, movel] of [[1850, 980, '', false], [390, 844, '-celular', true]]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, locale: 'pt-BR', ...(movel ? { isMobile: true, hasTouch: true } : {}) });
    await ctx.addInitScript(() => { try { localStorage.setItem('fonema-teste-rapido', '1'); } catch { /* sem armazenamento */ } });
    const pg = await ctx.newPage();
    const capT = async (_p, nome) => { await pg.waitForTimeout(450); await pg.screenshot({ path: resolve(DIR_CAP, `v7-trilha-${nome}${suf}.png`) }); console.log(`  📸 v7-trilha-${nome}${suf}.png`); };
    await pg.goto(BASE + '#/adulto/cadastro');
    await passarPorteira(pg);
    await cadastrar(pg, 'Beatriz', 'f', { nivel: 'le-palavras' });
    await montarAvatar(pg);
    await pg.getByTestId('primeira-missao').waitFor();
    const id = pg.url().split('/c/')[1].split('/')[0];
    await pg.goto(BASE + `#/c/${id}/sons`);
    await pg.getByTestId('trilha-sons').waitFor();
    await capT(0, '01-trilha');
    await pg.goto(BASE + `#/c/${id}/mapa`);
    await pg.locator('[data-regiao="TF"]').waitFor();
    await capT(0, '02-mapa-ilhas');
    await pg.goto(BASE + `#/c/${id}/vila`);
    await pg.getByTestId('vila').waitFor();
    await capT(0, '03-vila-botao-sons');
    const roteiro = [
      ['TF-07', { 'som-novo': '10-som-novo', 'sintese-tocar': '11-sintese-tocar', 'sintese-escolher': '12-sintese-escolher', 'cena:TF-07-C4b': '13-leitura-inventadas', 'caixas-fichas': '14-caixas-fichas', 'caixas-letras': '15-caixas-letras', 'troca-letra': '16-mais-uma-letra', 'troca-ler': '17-mais-uma-letra-ler' }],
      ['TF-09', { 'par-ouvir': '20-par-minimo-ouvir', 'par-ler': '21-par-minimo-ler' }],
      ['TF-12', { 'som-novo': '22-regra-o-e-final', 'cena:TF-12-C3r': '23-regra-letra-que-falta' }],
      ['TF-17', { 'frase': '25-frase-ler', 'frase-responder': '26-frase-pergunta' }],
      ['TF-R2', { 'troca-letra': '24-troca-letras' }],
      ['TF-R2', { eco: '27-leitura-em-eco' }],
      ['TF-22', { 'som-novo': '28-regra-ti-di' }]
    ];
    for (const [f, mapa] of roteiro) {
      await pg.goto(BASE + `#/c/${id}/sessao/${f}`);
      await jogarSessao(pg, { ...mapa, tirarCom: capT });
    }
    await ctx.close();
  }
}

/**
 * Cantinho da Leitura e Brincar com sons (D030 etapa 8). Para chegar logo aos textos e à fluência, o progresso da Trilha dos
 * Sons é SEMEADO no banco do aparelho (fases TF concluídas + 20 leituras certas): o teste é das telas novas, não da trilha.
 * `node e2e/fluxo.e2e.mjs --cantinho` (também roda no fim do E2E). Com `capT`, tira as capturas v8-*.
 */
async function semearTrilhaFeita(pg, id) {
  await pg.evaluate(async (cid) => {
    const db = await new Promise((r) => { const q = indexedDB.open('fonema'); q.onsuccess = () => r(q.result); });
    const p = await new Promise((r) => { const q = db.transaction('progressos').objectStore('progressos').get(cid); q.onsuccess = () => r(q.result); });
    const fases = ['TF-01', 'TF-02', 'TF-03', 'TF-04', 'TF-05', 'TF-06', ...Array.from({ length: 16 }, (_, k) => `TF-${String(k + 7).padStart(2, '0')}`), 'TF-R2', 'TF-R3'];
    const agora = Date.now() - 3600e3;
    for (const f of fases) p.fases[f] = { ...(p.fases[f] ?? {}), estado: 'concluida', sessoes: 1, concluidaEm: agora };
    const ws = ['lua', 'mala', 'fila', 'mula', 'lula', 'uva', 'pato', 'sapo', 'bolo', 'gato', 'galo', 'dado', 'faca', 'vaca', 'tatu', 'lupa', 'jaca', 'suco', 'fogo', 'dedo'];
    p.habilidades['leitura-cvcv'] = { p: 0.9, tentativas: ws.map((w, k) => ({ em: agora + k, sessao: 'semente', habilidade: 'leitura-cvcv', acertou: true, tipo: 'avaliada', mecanica: 'escolher', alvo: w, categoria: 'palavra', contexto: 'trilha' })) };
    await new Promise((r) => { const tx = db.transaction('progressos', 'readwrite'); tx.objectStore('progressos').put(p); tx.oncomplete = r; });
  }, id);
}

/** Joga a tela atual do Cantinho/Brincar até aparecer o cartão de fim, respondendo certo (e errando uma vez na escrita). */
async function jogarLivre(pg, fim, capT, nomes = {}) {
  const tirou = new Set();
  const tirar = async (k) => { if (capT && nomes[k] && !tirou.has(k)) { tirou.add(k); await capT(pg, nomes[k]); } };
  for (let passo = 0; passo < 600; passo++) {
    if (await pg.getByTestId(fim).isVisible().catch(() => false)) { await tirar('fim'); return true; }
    const clicar = async (sel) => { const b = pg.locator(sel).first(); if (await b.isVisible().catch(() => false) && await b.isEnabled().catch(() => false)) { await b.click({ timeout: 2000 }).catch(() => {}); return true; } return false; };
    const hist = pg.getByTestId('historia');
    if (await hist.isVisible().catch(() => false)) {
      const ps = await hist.getAttribute('data-passo').catch(() => '');
      const pag = await hist.getAttribute('data-pagina').catch(() => '');
      if (ps === 'capa') await tirar('capa');
      if (ps === 'pagina' && pag === '2') await tirar('pagina');
      if (ps === 'pergunta' && await pg.locator('.historia-pergunta .opcao:not([disabled])').count()) await tirar('pergunta');
      if (ps === 'vocab' && await pg.locator('.vocab-cartao').count()) await tirar('vocab');
      if (ps === 'fim') { await tirar('hfim'); if (await clicar('[data-testid=historia-fim]')) continue; }
      if (await clicar('[data-testid=historia-virar]')) continue;
      if (await clicar('.historia-pergunta .opcao[data-correta="1"]')) continue;
      if (ps === 'pergunta' && !(await pg.locator('.historia-pergunta .opcao[data-correta="1"]').count()) && await clicar('.historia-pergunta .opcao')) continue;
      await pg.waitForTimeout(60); continue;
    }
    const txt = pg.getByTestId('texto-leitura');
    if (await txt.isVisible().catch(() => false)) {
      const et = await txt.getAttribute('data-etapa').catch(() => '');
      if (et === 'ler') { if (await pg.locator('[data-testid=texto-li]:not([disabled])').count()) { await tirar('texto'); await clicar('[data-testid=texto-li]'); } else await pg.waitForTimeout(60); continue; }
      if (et === 'perguntas') { if (await pg.locator('.texto-perguntas [data-correta="1"]:not([disabled])').count()) { await tirar('texto-pergunta'); await clicar('.texto-perguntas [data-correta="1"]'); } else await pg.waitForTimeout(60); continue; }
      if (et === 'coro') { await tirar('coro'); if (!(await clicar('[data-testid=texto-coro-li]'))) await pg.waitForTimeout(60); continue; }
      await pg.waitForTimeout(60); continue;
    }
    const flu = pg.getByTestId('fluencia');
    if (await flu.isVisible().catch(() => false)) {
      if (await clicar('[data-testid=flu-comecar]')) { await tirar('flu-intro'); continue; }
      if (await pg.locator('.mec-fluencia .opcao[data-correta="1"]:not([disabled])').count()) { await tirar('flu'); await clicar('.mec-fluencia .opcao[data-correta="1"]'); continue; }
      await pg.waitForTimeout(60); continue;
    }
    const eco = pg.getByTestId('eco-coro');
    if (await eco.isVisible().catch(() => false)) { if (await pg.locator('[data-testid=eco-li]:not([disabled])').count()) { await tirar('eco'); await clicar('[data-testid=eco-li]'); } else await pg.waitForTimeout(60); continue; }
    const esc = pg.getByTestId('escrita-propria');
    if (await esc.isVisible().catch(() => false)) {
      const et = await esc.getAttribute('data-etapa').catch(() => '');
      const w = (await esc.getAttribute('data-palavra').catch(() => '')).toUpperCase();
      if (et === 'escrever') {
        if (!(await pg.locator('.escrita-teclado .peca:not([disabled])').count())) { await pg.waitForTimeout(60); continue; }
        const segunda = await pg.locator('[data-testid=escrita-de-novo]').count() === 0 && tirou.has('confronto');
        const letras = segunda ? [...w] : [...w].filter((_, k) => k !== 1); // 1ª vez: falta a 2ª letra
        for (const l of letras) await pg.locator(`.escrita-teclado .peca[data-letra="${l}"]`).click();
        await tirar('escrever');
        await clicar('[data-testid=escrita-pronto]'); continue;
      }
      if (await pg.locator('[data-testid=escrita-de-novo]:not([disabled])').count()) { await tirar('confronto'); await clicar('[data-testid=escrita-de-novo]'); continue; }
      if (await clicar('[data-testid=escrita-fim]')) continue;
      await pg.waitForTimeout(60); continue;
    }
    const jogo = pg.getByTestId('jogo-escuta');
    if (await jogo.isVisible().catch(() => false)) {
      if (await pg.locator('.mec-escuta .opcao[data-correta="1"]:not([disabled])').count() && !(await jogo.getAttribute('data-demo'))) { await tirar('jogo'); await clicar('.mec-escuta .opcao[data-correta="1"]'); }
      else await pg.waitForTimeout(60);
      continue;
    }
    if (await pg.locator('.mec-palmas, [data-testid=palmas]').count()) { await pg.waitForTimeout(60); }
    await pg.waitForTimeout(60);
  }
  return false;
}

async function trechoCantinho(browser, erros, { w = 1280, h = 800, suf = '', movel = false, capturar = false } = {}) {
  console.log(`12. Cantinho da Leitura e Brincar com sons${capturar ? ` (capturas v8 ${w}×${h})` : ''}`);
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: capturar ? 2 : 1, locale: 'pt-BR', ...(movel ? { isMobile: true, hasTouch: true } : {}) });
  await ctx.addInitScript((c) => { try { localStorage.setItem('fonema-teste-rapido', '1'); if (c) localStorage.setItem('fonema-coletar', '1'); } catch { /* sem armazenamento */ } }, COLETAR);
  const pg = await ctx.newPage();
  pg.on('pageerror', (e) => erros.push(String(e)));
  const capT = capturar ? async (_p, nome) => { await pg.waitForTimeout(500); await pg.screenshot({ path: resolve(DIR_CAP, `v8-${nome}${suf}.png`) }); console.log(`  📸 v8-${nome}${suf}.png`); } : null;
  await pg.goto(BASE + '#/adulto/cadastro');
  await passarPorteira(pg);
  await cadastrar(pg, 'Lia', 'f', { nivel: 'letras-e-sons' });
  await montarAvatar(pg);
  await pg.getByTestId('primeira-missao').waitFor();
  const id = pg.url().split('/c/')[1].split('/')[0];
  // antes de qualquer lição: história aberta, textos e fluência trancados
  await pg.goto(BASE + `#/c/${id}/vila`);
  await pg.getByTestId('ir-leitura').click();
  await pg.getByTestId('biblioteca').waitFor();
  ok(await pg.getByTestId('historia-bolota-chuva').isEnabled() && await pg.getByTestId('texto-oi').isDisabled() && await pg.getByTestId('ir-fluencia').isDisabled(), 'Cantinho: história aberta antes de saber ler; texto e fluência trancados');
  if (capT) await capT(pg, '01-cantinho-trancado');
  await pg.getByTestId('historia-bolota-chuva').click();
  ok(await jogarLivre(pg, 'biblio-feito', capT, { capa: '02-historia-capa', pagina: '03-historia-pagina', pergunta: '04-historia-pergunta', vocab: '05-historia-vocabulario', hfim: '06-historia-fim' }), 'Hora da história jogada: previsão, pergunta durante, depois (direta e dedução) e 3 palavras');
  // Brincar com sons (sempre aberto)
  await pg.goto(BASE + `#/c/${id}/brincar`);
  await pg.getByTestId('brincar').waitFor();
  if (capT) await capT(pg, '07-brincar-menu');
  for (const [j, nome] of [['escondida', '08-jogo-escondida'], ['rimas', '09-jogo-rima'], ['comprida', '10-jogo-comprida']].slice(0, capturar ? 3 : 1)) {
    await pg.goto(BASE + `#/c/${id}/brincar/${j}`);
    ok(await jogarLivre(pg, 'brincar-fim', capT, { jogo: nome }), `jogo de escuta "${j}" jogado até o fim`);
  }
  // semeia a trilha feita e confere o que abre
  await semearTrilhaFeita(pg, id);
  await pg.goto(BASE + `#/c/${id}/sons`); await pg.reload();
  await pg.getByTestId('trilha-sons').waitFor();
  ok(await pg.locator('.sons-livrinho:not([disabled])').count() === 3, 'Trilha dos Sons: um texto para ler sozinho no fim de cada bloco');
  await pg.goto(BASE + `#/c/${id}/leitura`);
  await pg.getByTestId('biblioteca').waitFor();
  if (capT) await capT(pg, '11-cantinho-aberto');
  await pg.getByTestId('texto-ema-suja').click();
  ok(await jogarLivre(pg, 'biblio-feito', capT, { texto: '12-texto-ler', 'texto-pergunta': '13-texto-pergunta', coro: '14-texto-coro' }), 'texto decodificável lido, perguntas respondidas e leitura em coro');
  await pg.goto(BASE + `#/c/${id}/leitura/fluencia`);
  ok(await jogarLivre(pg, 'biblio-feito', capT, { 'flu-intro': '15-fluencia-lista', flu: '16-fluencia-palavra', fim: '17-fluencia-caminho' }), 'fluência: lista de palavras já lidas, conferida pela figura, com caminho de estrelas');
  await pg.goto(BASE + `#/c/${id}/leitura`); await pg.goto(BASE + `#/c/${id}/leitura/eco`);
  ok(await jogarLivre(pg, 'biblio-feito', capT, { eco: '18-eco' }), 'leitura em eco de frases já estudadas');
  await pg.goto(BASE + `#/c/${id}/leitura`); await pg.goto(BASE + `#/c/${id}/leitura/escrita`);
  ok(await jogarLivre(pg, 'biblio-feito', capT, { escrever: '19-escrita-escrevendo', confronto: '20-escrita-confronto' }), 'escrita própria com confronto letra a letra e reescrita sem modelo');
  // o adulto vê fluência e escrita própria
  await pg.goto(BASE + `#/adulto/familia/${id}`);
  await pg.getByTestId('painel-fluencia').waitFor();
  const painel = await pg.getByTestId('painel-fluencia').innerText();
  const escrita = await pg.getByTestId('painel-escrita-propria').innerText();
  ok(/Palavras certas por minuto/.test(painel) && !/\b(55|90) palavras por minuto/.test(painel) && escrita.length > 40, 'painel: palavras certas por minuto sem meta importada, e a escrita própria ao lado da forma certa');
  if (capT) { await pg.getByTestId('painel-fluencia').scrollIntoViewIfNeeded(); await capT(pg, '21-painel-fluencia'); }
  await guardarFalas(pg);
  await ctx.close();
}

async function main() {
  if (CAPTURAS) mkdirSync(DIR_CAP, { recursive: true });
  await subirServidor();
  const browser = await chromium.launch({ executablePath: EXEC, args: ['--autoplay-policy=no-user-gesture-required'] });
  if (process.argv.includes('--mecanicas')) { await capturasMecanicas(browser); await browser.close(); servidor?.kill(); return; }
  if (process.argv.includes('--capturas-trilha')) { await capturasTrilhaSons(browser); await browser.close(); servidor?.kill(); return; }
  if (process.argv.includes('--cantinho') || process.argv.includes('--capturas-cantinho')) {
    const errosC = [];
    if (process.argv.includes('--capturas-cantinho')) {
      mkdirSync(DIR_CAP, { recursive: true });
      await trechoCantinho(browser, errosC, { w: 1850, h: 980, capturar: true });
      await trechoCantinho(browser, errosC, { w: 390, h: 844, suf: '-celular', movel: true, capturar: true });
    } else await trechoCantinho(browser, errosC);
    await browser.close(); servidor?.kill();
    if (errosC.length) throw new Error(`erros na página:\n${errosC.join('\n')}`);
    return;
  }
  if (process.argv.includes('--copia')) {
    const errosK = [];
    await trechoCopia(browser, { BASE, ok, passarPorteira, cadastrar, montarAvatar, erros: errosK });
    await browser.close(); servidor?.kill();
    if (errosK.length) throw new Error(`erros na página:\n${errosK.join('\n')}`);
    return;
  }
  if (process.argv.includes('--admin') || process.argv.includes('--capturas-admin')) {
    const errosA = [];
    const capturas = process.argv.includes('--capturas-admin') ? (process.env.CAPTURAS_ADMIN ?? DIR_CAP) : undefined;
    await trechoAdmin(browser, { BASE, ok, passarPorteira, cadastrar, montarAvatar, erros: errosA, capturas });
    await browser.close(); servidor?.kill();
    if (errosA.length) throw new Error(`erros na página:\n${errosA.join('\n')}`);
    return;
  }
  if (process.argv.includes('--gerenciador') || process.argv.includes('--capturas-gerenciador')) {
    const errosG = [];
    const capturas = process.argv.includes('--capturas-gerenciador') ? (process.env.CAPTURAS_GERENCIADOR ?? DIR_CAP) : undefined;
    try { await trechoGerenciador(browser, { BASE, ok, passarPorteira, cadastrar, montarAvatar, erros: errosG, capturas }); }
    finally { await browser.close(); servidor?.kill(); }
    if (errosG.length) throw new Error(`erros na página:\n${errosG.join('\n')}`);
    return;
  }
  if (process.argv.includes('--foto3d') || process.argv.includes('--capturas-foto3d')) {
    const errosF3 = [];
    const capturas = process.argv.includes('--capturas-foto3d') ? DIR_CAP : undefined;
    if (capturas) mkdirSync(DIR_CAP, { recursive: true });
    try { await trechoFoto3d(browser, { BASE, ok, erros: errosF3, capturas }); }
    finally { await browser.close(); servidor?.kill(); }
    if (errosF3.length) throw new Error(`erros na página:\n${errosF3.join('\n')}`);
    return;
  }
  if (process.argv.includes('--mundo3d') || process.argv.includes('--capturas-mundo3d')) {
    const errosM = [];
    const capM = process.argv.includes('--capturas-mundo3d') ? DIR_CAP : undefined;
    if (capM) mkdirSync(DIR_CAP, { recursive: true });
    try { await trechoMundo3d(browser, { BASE, ok, passarPorteira, cadastrar, montarAvatar, erros: errosM, capturas: capM }); }
    finally { await browser.close(); servidor?.kill(); }
    if (errosM.length) throw new Error(`erros na página:\n${errosM.join('\n')}`);
    return;
  }
  if (process.argv.includes('--caca') || process.argv.includes('--capturas-caca')) {
    // fila nº 25: caça ao tesouro no passeio 3D (trecho-caca.mjs); --capturas-caca: 1850×980 e 390×844
    const errosK2 = [];
    const capK = process.argv.includes('--capturas-caca') ? (process.env.CAPTURAS_CACA ?? DIR_CAP) : undefined;
    if (capK) mkdirSync(capK, { recursive: true });
    try {
      if (!capK || process.env.CACA_LARGURA !== '390') await trechoCaca(browser, { BASE, ok, passarPorteira, cadastrar, montarAvatar, erros: errosK2, capturas: capK });
      if (capK && process.env.CACA_LARGURA !== '1850') await trechoCaca(browser, { BASE, ok, passarPorteira, cadastrar, montarAvatar, erros: errosK2, capturas: capK, largura: 390, altura: 844, suf: '-celular' });
    } finally { await browser.close(); servidor?.kill(); }
    if (errosK2.length) throw new Error(`erros na página:\n${errosK2.join('\n')}`);
    return;
  }
  if (process.argv.includes('--fichas') || process.argv.includes('--capturas-fichas')) {
    const errosF = [];
    const hF = { BASE, ok, passarPorteira, cadastrar, montarAvatar, erros: errosF, dirCap: DIR_CAP };
    if (process.argv.includes('--capturas-fichas')) {
      mkdirSync(DIR_CAP, { recursive: true });
      await trechoFichas(browser, { ...hF, w: 1850, h: 980, capturar: true });
      await trechoFichas(browser, { ...hF, w: 390, h: 844, suf: '-celular', movel: true, capturar: true });
    } else await trechoFichas(browser, hF);
    await browser.close(); servidor?.kill();
    if (errosF.length) throw new Error(`erros na página:\n${errosF.join('\n')}`);
    return;
  }
  if (process.argv.includes('--memoria') || process.argv.includes('--capturas-memoria')) {
    const errosMe = [];
    const hMe = { BASE, ok, passarPorteira, cadastrar, montarAvatar, erros: errosMe, dirCap: DIR_CAP };
    if (process.argv.includes('--capturas-memoria')) {
      mkdirSync(DIR_CAP, { recursive: true });
      await trechoMemoria(browser, { ...hMe, w: 1850, h: 980, capturar: true });
      await trechoMemoria(browser, { ...hMe, w: 390, h: 844, suf: '-celular', movel: true, capturar: true });
    } else await trechoMemoria(browser, hMe);
    await browser.close(); servidor?.kill();
    if (errosMe.length) throw new Error(`erros na página:\n${errosMe.join('\n')}`);
    return;
  }
  if (process.argv.includes('--jogos2') || process.argv.includes('--capturas-jogos2')) {
    const errosJ2 = [];
    const h2 = { BASE, ok, passarPorteira, cadastrar, montarAvatar, erros: errosJ2, dirCap: DIR_CAP };
    if (process.argv.includes('--capturas-jogos2')) {
      mkdirSync(DIR_CAP, { recursive: true });
      await trechoJogos2(browser, { ...h2, w: 1850, h: 980, capturar: true });
      await trechoJogos2(browser, { ...h2, w: 390, h: 844, suf: '-celular', movel: true, capturar: true });
    } else await trechoJogos2(browser, h2);
    await browser.close(); servidor?.kill();
    if (errosJ2.length) throw new Error(`erros na página:\n${errosJ2.join('\n')}`);
    return;
  }
  if (process.argv.includes('--desbloqueio') || process.argv.includes('--capturas-desbloqueio')) {
    const errosD = [];
    const hD = { BASE, ok, passarPorteira, cadastrar, montarAvatar, jogarSessao, erros: errosD, dirCap: DIR_CAP };
    if (process.argv.includes('--capturas-desbloqueio')) {
      mkdirSync(DIR_CAP, { recursive: true });
      await trechoDesbloqueio(browser, { ...hD, w: 1850, h: 980, capturar: true });
      await trechoDesbloqueio(browser, { ...hD, w: 390, h: 844, suf: '-celular', movel: true, capturar: true });
    } else await trechoDesbloqueio(browser, hD);
    await browser.close(); servidor?.kill();
    if (errosD.length) throw new Error(`erros na página:\n${errosD.join('\n')}`);
    return;
  }
  if (process.argv.includes('--capturas-corrida')) {
    const errosK = [];
    const h = { BASE, ok, passarPorteira, cadastrar, montarAvatar, erros: errosK, dirCap: DIR_CAP };
    mkdirSync(DIR_CAP, { recursive: true });
    await capturasCorrida(browser, { ...h, w: 1850, h: 980 });
    await capturasCorrida(browser, { ...h, w: 390, h: 844, suf: '-celular', movel: true });
    await browser.close(); servidor?.kill();
    if (errosK.length) throw new Error(`erros na página:\n${errosK.join('\n')}`);
    return;
  }
  if (process.argv.includes('--jogos') || process.argv.includes('--capturas-jogos')) {
    const errosJ = [];
    const h = { BASE, ok, passarPorteira, cadastrar, montarAvatar, jogarSessao, erros: errosJ, dirCap: DIR_CAP };
    if (process.argv.includes('--capturas-jogos')) {
      mkdirSync(DIR_CAP, { recursive: true });
      await trechoJogos(browser, { ...h, w: 1850, h: 980, capturar: true });
      await trechoJogos(browser, { ...h, w: 390, h: 844, suf: '-celular', movel: true, capturar: true });
    } else await trechoJogos(browser, h);
    await browser.close(); servidor?.kill();
    if (errosJ.length) throw new Error(`erros na página:\n${errosJ.join('\n')}`);
    return;
  }
  if (process.argv.includes('--tutorial') || process.argv.includes('--capturas-tutorial')) {
    const errosT = [];
    const hT = { BASE, ok, passarPorteira, cadastrar, erros: errosT, dirCap: DIR_CAP };
    if (process.argv.includes('--capturas-tutorial')) {
      mkdirSync(DIR_CAP, { recursive: true });
      await trechoTutorial(browser, { ...hT, w: 1850, h: 980, capturar: true });
      await trechoTutorial(browser, { ...hT, w: 390, h: 844, suf: '-celular', movel: true, capturar: true });
    } else await trechoTutorial(browser, hT);
    await browser.close(); servidor?.kill();
    if (errosT.length) throw new Error(`erros na página:\n${errosT.join('\n')}`);
    return;
  }
  if (process.argv.includes('--guia') || process.argv.includes('--capturas-guia')) {
    const errosG = [];
    const dirG = process.argv.includes('--capturas-guia') ? (process.env.CAPTURAS_GUIA ?? DIR_CAP) : undefined;
    if (dirG) mkdirSync(dirG, { recursive: true });
    await trechoGuia(browser, { BASE, ok, passarPorteira, cadastrar, montarAvatar, jogarSessao, erros: errosG, dirCap: dirG });
    await browser.close(); servidor?.kill();
    if (errosG.length) throw new Error(`erros na página:\n${errosG.join('\n')}`);
    return;
  }
  if (process.argv.includes('--telas') || process.argv.includes('--capturas-telas')) {
    const errosT = [];
    if (process.argv.includes('--capturas-telas')) mkdirSync(process.env.CAPTURAS_TELAS ?? DIR_CAP, { recursive: true });
    await trechoTelas(browser, { BASE, ok, passarPorteira, cadastrar, montarAvatar, jogarSessao, erros: errosT, dirCap: process.argv.includes('--capturas-telas') ? (process.env.CAPTURAS_TELAS ?? DIR_CAP) : undefined });
    await browser.close(); servidor?.kill();
    if (errosT.length) throw new Error(`erros na página:\n${errosT.join('\n')}`);
    return;
  }
  if (process.argv.includes('--capturas-aa')) {
    const errosA = [];
    const dir = process.env.CAPTURAS_AA ?? DIR_CAP;
    mkdirSync(dir, { recursive: true });
    await trechoCapturasAa(browser, { BASE, ok, passarPorteira, cadastrar, montarAvatar, jogarSessao, semearTrilhaFeita, dir, erros: errosA });
    await browser.close(); servidor?.kill();
    if (errosA.length) throw new Error(`erros na página:\n${errosA.join('\n')}`);
    return;
  }
  if (process.argv.includes('--nome-falado')) {
    const errosN = [];
    await trechoNomeFalado(browser, { BASE, ok, passarPorteira, cadastrar, montarAvatar, jogarSessao, jogarLivre, erros: errosN });
    await browser.close(); servidor?.kill();
    if (errosN.length) throw new Error(`erros na página:\n${errosN.join('\n')}`);
    return;
  }
  if (process.argv.includes('--voz-real')) {
    const errosV = [];
    await trechoVozReal(browser, { BASE, ok, passarPorteira, cadastrar, montarAvatar, erros: errosV });
    await browser.close(); servidor?.kill();
    if (errosV.length) throw new Error(`erros na página:\n${errosV.join('\n')}`);
    return;
  }
  if (process.argv.includes('--trilha-sons')) {
    const errosTS = [];
    await trechoTrilhaSons(browser, errosTS);
    await browser.close(); servidor?.kill();
    if (errosTS.length) throw new Error(`erros na página:\n${errosTS.join('\n')}`);
    return;
  }
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
  // D029 §7: criador de personagem — o boneco COMEÇA no padrão completo (modelo 3D de verdade) e a criança personaliza
  await page.getByTestId('montar-avatar').waitFor();
  ok(await page.locator('[data-testid="montar-avatar"][data-passo="pele"]').count() === 1, 'a personalização começa pela cor da pele');
  ok(await page.getByTestId('avatar-pronto').count() === 1 && await page.getByTestId('avatar-proximo').isEnabled(), 'nada é obrigatório: o boneco já começa pronto ("Pronto!" disponível desde o início)');
  ok(await page.locator('.montar-corpo [data-peca^="pele-"]').count() >= 8 && await page.locator('.montar-corpo [aria-checked="true"]').count() === 0, 'pele: 8 tons ou mais, em ordem neutra, sem nenhum "padrão" marcado');
  await page.locator('[data-testid=boneco3d]:not([data-estado=carregando])').waitFor({ timeout: 30000 });
  const estadoBoneco = await page.getByTestId('boneco3d').getAttribute('data-estado');
  const bonecoReal = await page.evaluate(() => !!document.querySelector('.boneco3d-canvas')?.palco?.real);
  ok(estadoBoneco !== 'pronto' || bonecoReal, `boneco no palco: ${estadoBoneco === 'pronto' ? 'modelo 3D de verdade (GLB recolorido)' : 'reserva 2D (sem WebGL neste navegador)'}`);
  ok(await page.evaluate(() => document.documentElement.scrollHeight <= window.innerHeight + 1), 'tela de personalizar sem rolagem');
  ok(await page.locator('[data-ir-passo="cabelo"]').count() === 1, 'tipo de cabelo aparece (penteados em peça 3D, fila do dono nº 20)');
  ok(await page.locator('[data-ir-passo="rosto"]').count() === 0, 'sem passos de rosto/boca (dependem de kit de peças)');
  await page.locator('.montar-corpo [data-peca="pele-07"]').click();
  await page.locator('.montar-corpo [data-peca="pele-07"][aria-checked="true"]').waitFor();
  await page.getByTestId('avatar-proximo').click();
  await page.locator('[data-testid="montar-avatar"][data-passo="olhos"]').waitFor();
  ok(await page.locator('.montar-corpo [data-peca="castanho-escuro"][aria-checked="true"]').count() === 1, 'olhos: a cor do padrão vem marcada');
  await page.locator('[data-ir-passo="corCabelo"]').click();
  await page.locator('.montar-corpo [data-peca="preto"]').click();
  await page.locator('[data-ir-passo="cabelo"]').click();
  await page.locator('[data-testid="montar-avatar"][data-passo="cabelo"]').waitFor();
  const penteados = page.locator('.montar-corpo button[role="radio"][data-estado="livre"]');
  ok(await penteados.count() >= 9, `penteado: ao menos 9 tipos livres para este sexo (${await penteados.count()})`);
  await penteados.nth(5).click();
  await page.locator('.montar-corpo button[role="radio"][aria-checked="true"]').waitFor();
  await page.locator('[data-testid=boneco3d]:not([data-estado=carregando])').waitFor({ timeout: 30000 });
  ok(true, 'escolher outro penteado troca o boneco');
  await page.locator('[data-ir-passo="camisa"]').click();
  ok(await page.locator('.montar-corpo [data-peca="branca"][aria-checked="true"]').count() === 1, 'camiseta: começa branca (padrão)');
  // D034: as cores especiais abrem uma a uma nas primeiras missões; o cadeado diz quantas missões faltam
  ok(/Abre na próxima missão · 4 moedas/.test(await page.locator('.montar-corpo [data-peca="mata"]').getAttribute('aria-label')), 'cor especial aparece com cadeado: "Abre na próxima missão · 4 moedas"');
  await page.locator('.montar-corpo [data-peca="mata"]').click();
  ok(/Lojinha/.test(await page.locator('.montar-aviso').innerText()) && await page.locator('.montar-corpo [data-peca="branca"][aria-checked="true"]').count() === 1, 'tocar numa cor trancada explica a Lojinha e não muda o boneco');
  await page.locator('.montar-corpo [data-peca="ipe"]').click();
  await page.locator('.montar-corpo [data-peca="ipe"][aria-checked="true"]').waitFor();
  await cap(page, 'avatar');
  await page.locator('[data-ir-passo="lojinha"]').click();
  await page.getByTestId('vitrine-lojinha').waitFor();
  ok(await page.locator('.vitrine-lista li').count() >= 4 && /Abre (na próxima missão|em \d+ missões)/.test(await page.getByTestId('vitrine-lojinha').innerText()), 'o fim da personalização ensina a Lojinha: o que abre depois, com quantas missões faltam e moedas');
  ok(/Acessibilidade/.test(await page.getByTestId('vitrine-lojinha').innerText()), 'acessibilidade não vem de entrada: fica na Lojinha, grátis');
  await page.getByTestId('avatar-pronto').click();
  // D032: o tutorial abre sozinho na primeira vez; aqui o adulto pula e a criança cai na Chegada (o tutorial inteiro: --tutorial)
  await page.getByTestId('tutorial').waitFor();
  ok(true, 'depois do boneco, na primeira vez, abre o tutorial "A grande aventura"');
  await pularTutorial(page);
  await page.getByTestId('primeira-missao').waitFor();
  await page.waitForTimeout(300);
  await cap(page, 'chegada-oi-nome');
  ok((await page.locator('.baloes').innerText()).includes('Oi, Mariana!'), 'a Sofia chama a criança pelo nome');

  console.log('3. Trilha do Alfabeto: a primeira missão é a letra A (D027)');
  const idA = page.url().split('/c/')[1].split('/')[0];
  await page.goto(BASE + `#/c/${idA}/alfabeto`);
  await page.getByTestId('trilha-alfabeto').waitFor();
  ok(await page.locator('.marco.letra').count() === 26 && await page.locator('.marco.revisao').count() === 3 && await page.locator('.marco.festa').count() === 1, 'a trilha mostra os 26 marcos das letras, 3 revisões (vogais, sons que esticam, sons que estouram) e a Festa do Alfabeto (D031)');
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
  // D034: depois da Letra A, a camiseta verde já abriu (só falta a moedinha); a terracota abre daqui a 3 missões
  ok(/Abre em 3 missões · 6 moedas/.test(await page.locator('[data-testid="loja-boneco"] [data-peca="terra"]').innerText()), 'Lojinha: camiseta terracota com cadeado "Abre em 3 missões · 6 moedas"');
  ok(await page.locator('[data-testid="loja-boneco"] [data-peca="mata"]:not([data-estado="fase"])').count() >= 1, 'Lojinha: a camiseta verde abriu com a 1ª missão (sem cadeado de fase)');
  ok(await page.locator('[data-testid="loja-boneco"] [data-peca="madeira"][data-estado="fase"]').count() === 1, 'Lojinha: a camiseta cor de madeira ainda espera (cadeado de fase, mesmo com moedinhas)');
  ok(await page.locator('[data-testid="loja-boneco"] [data-peca="ipe"]').innerText().then((t) => /Usando/.test(t)), 'Lojinha: a cor escolhida na personalização aparece como "Usando"');
  ok(await page.locator('[data-cat="cabelo"]').count() === 1, 'Lojinha: aba de cabelos (penteados em peça 3D)');
  await page.locator('[data-cat="cabelo"]').click();
  ok(await page.locator('[data-testid="loja-boneco"] [data-peca]').count() >= 9, 'Lojinha: 9 penteados ou mais para este sexo');
  await page.locator('[data-cat="camisa"]').click();
  await page.locator('[data-aba="acessibilidade"]').click();
  ok(await page.locator('[data-testid="loja-acessibilidade"] [data-acess]').count() === 2 && await page.locator('[data-testid="loja-acessibilidade"] [aria-checked="true"]').count() === 0, 'Acessibilidade: óculos e pintura no rosto, grátis e desligados de entrada (cadeira e aparelho aguardam modelo próprio)');
  const saldoAntesDosOculos = (await page.getByTestId('moedinhas').first().innerText()).match(/\d+/)[0];
  await page.locator('[data-acess="oculos"] button').click();
  await page.locator('[data-acess="oculos"] [aria-checked="true"]').waitFor();
  ok((await page.getByTestId('moedinhas').first().innerText()).match(/\d+/)[0] === saldoAntesDosOculos, 'colocar os óculos não custa moedinhas');
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

  console.log('7. D031: depois da letra A vem a lição do som /a/ (TF-01); a letra B espera; depois vem a letra E');
  await page.goto(BASE + `#/c/${id}/alfabeto`);
  await page.getByTestId('trilha-alfabeto').waitFor();
  ok(await page.locator('[data-fase="AL-A"][data-estado="feita"]').count() === 1 && await page.locator('[data-fase="AL-B"]').isDisabled() && await page.locator('[data-fase="AL-E"]').isDisabled(), 'trilha A–Z: a letra A brilha; B e E esperam (a próxima é a lição do som)');
  ok(/1 de 26/.test(await page.getByTestId('letras-feitas').innerText()), 'contador: 1 de 26 letras');
  ok(/Continuar a jornada/.test(await page.getByTestId('trilha-continuar').innerText()), 'trilha A–Z: o botão leva à jornada, que agora está na Trilha dos Sons');
  await capA(page, '09-trilha-depois-da-letra-a', 900);
  await page.getByTestId('trilha-continuar').click();
  await page.waitForFunction(() => location.hash.includes('/fase/'));
  ok(page.url().includes('/fase/TF-01'), 'o botão da Trilha A–Z abre a lição do som /a/ (TF-01), na outra trilha');
  await page.goto(BASE + `#/c/${id}/fase/AL-B`);
  await page.waitForFunction(() => location.hash.includes('/vila'), null, { timeout: 8000 }).catch(() => {});
  ok(page.url().includes('/vila'), 'sem pular fases: a letra B bloqueada volta para a vila');
  await page.goto(BASE + `#/c/${id}/sessao/AL-RV1`);
  // a tela da sessão vem sob demanda (React.lazy): espera o desvio para a vila em vez de um tempo fixo (300 ms falhava às vezes)
  await page.waitForFunction(() => location.hash.includes('/vila'), null, { timeout: 8000 }).catch(() => {});
  ok(page.url().includes('/vila'), 'sem pular fases: a revisão das vogais só abre depois das vogais');
  let tf01 = false;
  for (let t = 0; t < 6 && !tf01; t++) {
    // sai da tela do ritual antes: a mesma rota com o mesmo hash não recarrega a sessão
    await page.goto(BASE + `#/c/${id}/sons`);
    await page.getByTestId('trilha-sons').waitFor();
    await page.goto(BASE + `#/c/${id}/sessao/TF-01`);
    await jogarSessao(page, {});
    await page.getByTestId('ritual').locator('h1').waitFor();
    tf01 = /Fase concluída/.test(await page.getByTestId('ritual').locator('h1').innerText());
  }
  ok(tf01, 'lição TF-01 (o som /a/) concluída por domínio');
  await page.goto(BASE + `#/c/${id}/sons`);
  await page.getByTestId('trilha-sons').waitFor();
  ok(await page.locator('[data-fase="TF-01"][data-estado="feita"], [data-fase="TF-01"][data-estado="dominada"]').count() === 1 && await page.locator('[data-fase="TF-02"]').isDisabled(), 'Trilha dos Sons: TF-01 feita; TF-02 espera a letra E');
  ok(/Continuar a jornada/.test(await page.getByTestId('sons-continuar').innerText()), 'Trilha dos Sons: o botão leva à jornada, que voltou para a Trilha A–Z');
  await page.getByTestId('sons-continuar').click();
  await page.waitForFunction(() => location.hash.includes('/fase/'));
  ok(page.url().includes('/fase/AL-E'), 'o botão da Trilha dos Sons abre a letra E, na outra trilha');
  await page.getByTestId('conquistas-fase').waitFor();
  ok(await page.locator('[data-estado="bloqueada"]').count() >= 1, 'conquistas ainda não ganhas aparecem apagadas com cadeado e a habilidade');
  ok(!(await page.getByTestId('ir-lojinha').count()), 'sem Lojinha na entrada da fase (P7-b)');
  await cap(page, 'fase-minhas-conquistas');
  await page.goto(BASE + `#/c/${id}/sessao/AL-E`);
  await jogarSessao(page, {});
  await page.getByTestId('ritual').locator('h1').waitFor();
  ok(/Fase concluída: Letra/.test(await page.getByTestId('ritual').locator('h1').innerText()), 'letra E concluída');
  await page.goto(BASE + `#/c/${id}/alfabeto`);
  await page.getByTestId('trilha-alfabeto').waitFor();
  ok(await page.locator('.marco.feita').count() === 2 && /2 de 26/.test(await page.getByTestId('letras-feitas').innerText()), 'trilha A–Z: A e E brilham (2 de 26)');
  await page.goto(BASE + `#/c/${id}/sons`);
  await page.getByTestId('trilha-sons').waitFor();
  ok(await page.locator('[data-fase="TF-02"][data-estado="atual"]').count() === 1, 'depois da letra E, a lição do som /ê/ (TF-02) é a de agora');
  await capA(page, '11-trilha-sons-depois-da-letra-e', 900);

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
  ok(await page.locator('.montar-corpo [data-peca="pele-09"][aria-checked="true"]').count() === 1, 'avatar antigo migrado: o tom de pele equivalente já vem escolhido');
  await page.locator('[data-ir-passo="corCabelo"]').click();
  ok(await page.locator('.montar-corpo [data-peca="preto"][aria-checked="true"]').count() === 1, 'avatar antigo migrado: a cor do cabelo equivalente já vem escolhida');
  await page.getByTestId('avatar-pronto').click();
  await pularTutorial(page);
  await page.locator('[data-testid="primeira-missao"], [data-testid="vila"]').first().waitFor();
  await page.goto(BASE + '#/c/cr-antiga/vila');
  await page.getByTestId('vila').waitFor();
  ok(true, 'depois da escolha, a criança entra na vila e o app não pergunta de novo');

  const JORNADA = !process.argv.includes('--sem-jornada');
  {
  console.log('9. Jornada inteira: letras e sons alternados (D031) → vogais abertas → Palavras → Meu nome (modo demonstração)');
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
    // D031: cada letra logo antes da lição do som dela; revisões do alfabeto no fim de cada bloco; R H X Q K Y W antes da Festa
    const LETRAS_E_SONS = [
      'AL-A TF-01 AL-E TF-02 AL-I TF-03 AL-O TF-04 AL-U TF-05 TF-06 AL-RV1',
      'AL-M TF-07 AL-F TF-08 AL-V TF-09 AL-L TF-10 AL-S TF-11 TF-12 AL-N TF-13 AL-Z TF-14 AL-J TF-15 TF-R2 AL-RV2',
      'AL-P TF-16 AL-T TF-17 AL-B TF-18 AL-C TF-19 AL-D TF-20 AL-G TF-21 TF-22 TF-R3 AL-RV3',
      // 17/11: bloco 4 da Trilha dos Sons (é/ó, ê/ô, ã); TF-26 em diante esperam sons puros (fora da jornada)
      'TF-23 TF-24 TF-25',
      'AL-R AL-H AL-X AL-Q AL-K AL-Y AL-W AL-FESTA'
    ].join(' ').split(' ');
    const FASES = [...LETRAS_E_SONS, 'R1-F02', 'R1-F03', 'R1-F06', 'R1-F07', 'R2a-F01', 'R2a-F02', 'R2a-F03', 'R2a-F04', 'R2a-F05', 'R0-F01'];
    let viuTrofeu = false;
    for (const f of JORNADA ? FASES : []) {
      let concluiu = false;
      for (let tentativa = 0; tentativa < 3 && !concluiu; tentativa++) {
        // sai da tela do ritual antes: a mesma rota com o mesmo hash NÃO recarrega a sessão (era por isso que a 2ª e a 3ª
        // tentativa de uma lição que não concluiu na 1ª só reliam o mesmo ritual e o E2E falhava em TF-01/TF-06)
        await pj.goto(BASE + `#/c/${idj}/alfabeto`);
        await pj.getByTestId('trilha-alfabeto').waitFor();
        await pj.goto(BASE + `#/c/${idj}/sessao/${f}`);
        await jogarSessao(pj, {});
        await pj.getByTestId('ritual').locator('h1').waitFor();
        concluiu = /Fase concluída/.test(await pj.getByTestId('ritual').locator('h1').innerText());
        // o troféu só é "novo" na vez em que a Festa conclui: confere em cada tentativa, não só na última
        if (f === 'AL-FESTA' && concluiu) viuTrofeu = viuTrofeu || await pj.locator('[data-testid="selo-novo"] [data-conquista="T-ALFABETO"]').count() === 1;
        if (f === 'AL-FESTA') console.log(`  · Festa, tentativa ${tentativa + 1}: ${await pj.getByTestId('ritual').locator('h1').innerText()} · selos novos: ${await pj.locator('[data-testid="selo-novo"] [data-conquista]').evaluateAll((e) => e.map((x) => x.dataset.conquista).join(','))}`);
      }
      if (!concluiu) {
        // diagnóstico: o estado da fase e as últimas tentativas de cada habilidade dela
        const info = await pj.evaluate(async ([cid, fase]) => {
          const db = await new Promise((r) => { const q = indexedDB.open('fonema'); q.onsuccess = () => r(q.result); });
          const p = await new Promise((r) => { const q = db.transaction('progressos').objectStore('progressos').get(cid); q.onsuccess = () => r(q.result); });
          return { faseAtual: p.faseAtual, fase: p.fases[fase], habs: Object.fromEntries(Object.entries(p.habilidades).map(([h, e]) => [h, e.tentativas.map((t) => `${t.cena}:${t.tipo ?? '?'}:${t.acertou ? 'ok' : 'x'}`).slice(-10)])) };
        }, [idj, f]);
        console.log(JSON.stringify(info).slice(0, 4000));
      }
      ok(concluiu, `fase ${f} jogada e concluída`);
      if (f === 'AL-FESTA') {
        ok(viuTrofeu, 'Festa do Alfabeto: troféu "Alfabeto Completo"');
        await pj.goto(BASE + `#/c/${idj}/alfabeto`);
        await pj.getByTestId('trilha-alfabeto').waitFor();
        ok(await pj.locator('.marco.feita').count() === 30 && /26 de 26/.test(await pj.getByTestId('letras-feitas').innerText()), 'trilha completa: 26 de 26 letras, as 3 revisões e a Festa brilhando');
        ok(/Continuar a jornada/.test(await pj.getByTestId('trilha-continuar').innerText()), 'depois da Festa, a trilha leva adiante na jornada (os outros sons das vogais)');
        await capA(pj, '15-trilha-completa', 1200);
      }
    }
    if (JORNADA) {
    await pj.goto(BASE + `#/adulto/familia/${idj}`);
    await pj.getByTestId('painel-familia').waitFor();
    await pj.getByText('Nível 2 de 10').first().waitFor({ timeout: 5000 }).catch(() => {});
    ok(/Nível 2 de 10/.test(await pj.getByTestId('painel-familia').innerText()), 'termômetro subiu para 2 depois da Cachoeira dos Sons');
    ok(/Exploração das Palavras/.test(await pj.getByTestId('painel-familia').innerText()), 'título "Exploração das Palavras" depois do portão');
    }
    await guardarFalas(pj);

    console.log('10. Nível inicial escolhido pelo adulto (D026)');
    await pj.goto(BASE + '#/adulto/cadastro');
    await cadastrar(pj, 'Davi', 'm', { nivel: 'letras-e-sons' });
    await montarAvatar(pj);
    await pj.getByTestId('primeira-missao').click();
    await pj.waitForFunction(() => location.hash.includes('/sessao/'));
    ok(pj.url().includes('/sessao/TF-06'), '"já conhece as letras e os sons" pula o Alfabeto e começa na Trilha dos Sons, na primeira leitura (TF-06)');
    const idd = pj.url().split('/c/')[1].split('/')[0];
    await pj.goto(BASE + `#/c/${idd}/alfabeto`);
    await pj.locator('.marco.liberada').first().waitFor();
    ok(await pj.locator('.marco.liberada').count() === 30 && !(await pj.locator('.marco.feita').count()), 'o Alfabeto inteiro fica aberto para revisar, sem contar como concluído');
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
  await trechoTrilhaSons(browser, erros);
  await trechoCantinho(browser, erros);
  await trechoVozReal(browser, { BASE, ok, passarPorteira, cadastrar, montarAvatar, erros });
  await trechoCopia(browser, { BASE, ok, passarPorteira, cadastrar, montarAvatar, erros });
  await trechoJogos(browser, { BASE, ok, passarPorteira, cadastrar, montarAvatar, jogarSessao, erros, dirCap: DIR_CAP });
  await trechoDesbloqueio(browser, { BASE, ok, passarPorteira, cadastrar, montarAvatar, jogarSessao, erros, dirCap: DIR_CAP });
  await trechoJogos2(browser, { BASE, ok, passarPorteira, cadastrar, montarAvatar, erros, dirCap: DIR_CAP });
  await trechoFichas(browser, { BASE, ok, passarPorteira, cadastrar, montarAvatar, erros, dirCap: DIR_CAP });
  await trechoMemoria(browser, { BASE, ok, passarPorteira, cadastrar, montarAvatar, erros });
  await trechoMundo3d(browser, { BASE, ok, passarPorteira, cadastrar, montarAvatar, erros });
  await trechoCaca(browser, { BASE, ok, passarPorteira, cadastrar, montarAvatar, erros });
  await trechoAdmin(browser, { BASE, ok, passarPorteira, cadastrar, montarAvatar, erros });
  await trechoGerenciador(browser, { BASE, ok, passarPorteira, cadastrar, montarAvatar, erros });
  await trechoFoto3d(browser, { BASE, ok, erros });
  await trechoTutorial(browser, { BASE, ok, passarPorteira, cadastrar, erros, dirCap: DIR_CAP });
  await trechoTelas(browser, { BASE, ok, passarPorteira, cadastrar, montarAvatar, jogarSessao, erros });
  await trechoGuia(browser, { BASE, ok, passarPorteira, cadastrar, montarAvatar, jogarSessao, erros });

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
    await capC(0, '09-trilha-depois-da-letra-a');
    await p3.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await capC(0, '09b-trilha-fim-e-etapas');
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
    for (const [rota, nome] of [['album', '14-album'], ['lojinha', '15-lojinha'], ['mapa', '16-arquipelago'], ['regiao/R2a', '17-regiao'], ['fase/TF-01', '18-entrada-da-fase']]) {
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
    for (const [rota, nome] of [['album', '14-album'], ['lojinha', '15-lojinha'], ['mapa', '16-arquipelago'], ['regiao/R2a', '17-regiao'], ['fase/TF-01', '18-entrada-da-fase']]) {
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
