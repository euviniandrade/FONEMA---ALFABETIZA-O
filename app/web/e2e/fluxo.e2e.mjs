// FONEMA · teste E2E (Playwright + Chromium do ambiente, sem `playwright install`).
// Percorre: cadastro do adulto → avatar → chegada → primeira missão (R0-F01, todas as mecânicas da sessão)
// → conquista "Meu Nome" no ritual → Mostra pro professor → visão do professor (1 toque) → painel da família
// → lojinha → álbum → segunda fase (Minhas Conquistas) → sessão R0-F02.
// Uso:  npm run e2e            (servidor de preview próprio, porta 4179)
//       npm run capturas       (idem + salva capturas em app/docs/capturas)
//       BASE_URL=http://localhost:5173 node e2e/fluxo.e2e.mjs
import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const aqui = dirname(fileURLToPath(import.meta.url));
const CAPTURAS = process.argv.includes('--capturas');
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

let n = 0;
async function cap(page, nome) {
  if (!CAPTURAS) return;
  await page.waitForTimeout(350);
  n++;
  await page.screenshot({ path: `${DIR_CAP}/${String(n).padStart(2, '0')}-${nome}.png` });
}

async function passarPorteira(page) {
  const conta = page.getByTestId('conta');
  if (await conta.count()) {
    const [a, b] = (await conta.innerText()).split('×').map((x) => Number(x.trim()));
    await page.getByTestId('resposta-porteira').fill(String(a * b));
    await page.getByTestId('entrar-adulto').click();
  }
}

/** Resolve qualquer etapa da sessão até o ritual de fim (sempre pela resposta certa). */
async function jogarSessao(page, capturar = {}) {
  const vistos = new Set();
  for (let passo = 0; passo < 400; passo++) {
    if (await page.getByTestId('ritual').count()) return;
    const cena = (await page.locator('[data-cena]').getAttribute('data-cena').catch(() => null)) ?? '';
    const tirar = async (chave) => { if (capturar[chave] && !vistos.has(chave)) { vistos.add(chave); await cap(page, capturar[chave]); } };

    if (await page.getByTestId('comecar-sessao').isVisible().catch(() => false)) { await tirar('acolhida'); await page.getByTestId('comecar-sessao').click({ timeout: 3000 }).catch(() => {}); continue; }
    const minhaVez = page.getByTestId('minha-vez');
    if (await minhaVez.isVisible().catch(() => false)) {
      await tirar('assiste');
      if (await minhaVez.isEnabled({ timeout: 500 }).catch(() => false)) await minhaVez.click({ timeout: 3000 }).catch(() => {});
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
    if (await esp.isVisible().catch(() => false) && (await esp.getAttribute('data-alvo', { timeout: 500 }).catch(() => null))) {
      await tirar('montar');
      const alvo = (await esp.getAttribute('data-alvo', { timeout: 500 }).catch(() => null)).split('|');
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

async function main() {
  if (CAPTURAS) mkdirSync(DIR_CAP, { recursive: true });
  await subirServidor();
  const browser = await chromium.launch({ executablePath: EXEC, args: ['--autoplay-policy=no-user-gesture-required'] });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: CAPTURAS ? 2 : 1, locale: 'pt-BR' });
  await ctx.addInitScript(() => localStorage.setItem('fonema-teste-rapido', '1'));
  const page = await ctx.newPage();
  const erros = [];
  page.on('pageerror', (e) => erros.push(String(e)));
  page.on('console', (m) => { if (m.type() === 'error' && !/favicon|manifest\.json|404|Failed to load resource/.test(m.text())) erros.push(m.text()); });

  console.log('1. Cadastro pelo adulto');
  await page.goto(BASE);
  await cap(page, 'inicio');
  await page.getByTestId('area-adulto').click();
  await passarPorteira(page);
  await page.getByTestId('campo-nome').fill('Mariana Souza');
  await page.locator('[data-genero="f"]').click();
  await page.getByTestId('cons-responsavel').check();
  ok((await page.locator('.previa').innerText()).includes('pronta, Mariana'), 'prévia da concordância: "pronta, Mariana"');
  await cap(page, 'cadastro-adulto');
  await page.getByTestId('cadastro-continuar').click();
  await page.locator('[data-pronuncia="1-sofia"]').click();
  await cap(page, 'nome-falado-pronuncia');
  await page.getByTestId('nome-continuar').click();
  await page.getByTestId('salvar-crianca').click();
  await page.getByTestId('entregar').click();

  console.log('2. Avatar e chegada');
  await page.locator('[data-base="crianca-02-trancas"]').click();
  await cap(page, 'avatar');
  await page.getByTestId('avatar-pronto').click();
  await page.getByTestId('primeira-missao').waitFor();
  await page.waitForTimeout(300);
  await cap(page, 'chegada-oi-nome');
  ok((await page.locator('.baloes').innerText()).includes('Oi, Mariana!'), 'a Sofia chama a criança pelo nome');

  console.log('3. Primeira missão R0-F01 (sessão C0–C9)');
  await page.getByTestId('primeira-missao').click();
  await jogarSessao(page, { acolhida: 'sessao-acolhida', assiste: 'assiste-e-faz', palmas: 'palmas-no-nome', espelho: 'espelho-do-som', escolher: 'caca-ao-som-do-nome', pausa: 'pausa-ativa', montar: 'placa-montar-nome' });
  await page.getByTestId('selo-novo').first().waitFor({ timeout: 15000 });
  await page.waitForTimeout(1200);
  await cap(page, 'ritual-conquista-moedinhas');
  ok(await page.locator('[data-testid="selo-novo"] [data-conquista="S-R0-01"]').count() === 1, 'conquista "Meu Nome" desbloqueada depois do fato');
  const ganhas = Number((await page.getByTestId('moedinhas-ganhas').innerText()).match(/\+(\d+)/)[1]);
  ok(ganhas === 4, `moedinhas fixas em bloco: +${ganhas} (4 atividades × 1)`);
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
  await page.goto(BASE + '#/adulto');
  await page.getByTestId('painel-Mariana').click();
  await page.getByTestId('painel-familia').waitFor();
  await page.getByText('Meu Nome').first().waitFor({ timeout: 5000 }).catch(() => {});
  const painel = await page.getByTestId('painel-familia').innerText();
  ok(/Nível 0 de 10/.test(painel), 'termômetro 0 de 10 no ponto de partida');
  ok(/Meu Nome/.test(painel), 'conquista aparece no painel');
  ok(/Mariana/.test(await page.getByTestId('whatsapp').innerText()), 'mensagem estilo WhatsApp com o primeiro nome');
  ok(/Ela descobriu/.test(await page.getByTestId('whatsapp').innerText()), 'concordância feminina na mensagem');
  await cap(page, 'painel-familia');
  await page.mouse.wheel(0, 700);
  await cap(page, 'painel-familia-whatsapp');

  console.log('6. Vila, recado do professor, lojinha e álbum');
  await page.goto(BASE + '#/');
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
  await page.locator('[data-item="caderno"] button').click();
  await page.getByTestId('confirmar-troca').click();
  await page.locator('[data-item="caderno"].tem').waitFor();
  ok((await page.getByTestId('moedinhas').first().innerText()).match(/\d+/)[0] === '0', 'troca de 4 moedinhas pelo caderno (saldo 0)');
  await page.goto(BASE + `#/c/${id}/album`);
  await page.getByTestId('album').waitFor();
  await cap(page, 'album-conquistas');

  console.log('7. Segunda fase: Minhas Conquistas e sessão de rimas');
  await page.goto(BASE + `#/c/${id}/fase/R0-F02`);
  await page.getByTestId('conquistas-fase').waitFor();
  ok(await page.locator('[data-estado="bloqueada"]').count() >= 1, 'conquistas ainda não ganhas aparecem apagadas com cadeado e a habilidade');
  ok(!(await page.getByTestId('ir-lojinha').count()), 'sem Lojinha na entrada da fase (P7-b)');
  await cap(page, 'fase-minhas-conquistas');
  await page.goto(BASE + `#/c/${id}/fase/R0-F03`);
  await page.waitForTimeout(300);
  ok(page.url().includes('/vila'), 'sem pular fases: R0-F03 bloqueada volta para a vila');
  await page.goto(BASE + `#/c/${id}/fase/R0-F02`);
  await page.getByTestId('comecar-missao').click();
  await jogarSessao(page, { assiste: 'assiste-parlenda', escolher2: 'rima-ou-nao', escolher: 'varal-de-rimas' });
  await page.getByTestId('ritual').waitFor();
  ok(true, 'sessão de rimas concluída até o ritual');

  console.log('8. Conheça seu corpo, mapa e celular');
  await page.goto(BASE + `#/c/${id}/corpo`);
  await page.waitForTimeout(1500);
  await cap(page, 'conheca-seu-corpo');
  await page.goto(BASE + `#/c/${id}/mapa`);
  await page.waitForTimeout(300);
  await cap(page, 'arquipelago');
  await page.goto(BASE + `#/c/${id}/regiao/R0`);
  await page.waitForTimeout(300);
  await cap(page, 'regiao-trilha-fases');
  await page.goto(BASE + '#/adulto/config');
  await cap(page, 'configuracoes-padroes-mvp');

  console.log('9. Jornada inteira R0 → R2a (modo demonstração: domínio em 1 sessão)');
  {
    const ctx2 = await browser.newContext({ viewport: { width: 1280, height: 800 }, locale: 'pt-BR' });
    await ctx2.addInitScript(() => localStorage.setItem('fonema-teste-rapido', '1'));
    const pj = await ctx2.newPage();
    pj.on('pageerror', (e) => erros.push(String(e)));
    await pj.goto(BASE + '#/adulto/config');
    await passarPorteira(pj);
    await pj.getByTestId('modo-demo').click();
    await pj.waitForFunction(() => document.querySelector('[data-testid=modo-demo]')?.checked);
    await pj.goto(BASE + '#/adulto/cadastro');
    await pj.getByTestId('campo-nome').fill('Helena');
    await pj.locator('[data-genero="n"]').click();
    ok((await pj.locator('.previa').innerText()).includes('Tudo pronto pra começar, Helena?'), 'gênero neutro: a fala muda de forma ("Tudo pronto pra começar, Helena?")');
    await pj.getByTestId('cons-responsavel').check();
    await pj.getByTestId('cadastro-continuar').click();
    await pj.getByTestId('nome-continuar').click();
    await pj.getByTestId('salvar-crianca').click();
    await pj.getByTestId('entregar').click();
    await pj.getByTestId('avatar-pronto').click();
    await pj.getByTestId('primeira-missao').waitFor();
    const idj = pj.url().split('/c/')[1].split('/')[0];
    const FASES = ['R0-F01', 'R0-F02', 'R0-F03', 'R0-F04', 'R0-F05', 'R0-F06', 'R1-F01', 'R1-F02', 'R1-F03', 'R1-F04', 'R1-F05', 'R1-F06', 'R1-F07', 'R2a-F01', 'R2a-F02', 'R2a-F03', 'R2a-F04', 'R2a-F05'];
    for (const f of FASES) {
      let concluiu = false;
      for (let tentativa = 0; tentativa < 3 && !concluiu; tentativa++) {
        await pj.goto(BASE + `#/c/${idj}/sessao/${f}`);
        await jogarSessao(pj, {});
        await pj.getByTestId('ritual').locator('h1').waitFor();
        concluiu = /Fase concluída/.test(await pj.getByTestId('ritual').locator('h1').innerText());
      }
      ok(concluiu, `fase ${f} jogada e concluída`);
    }
    await pj.goto(BASE + `#/adulto/familia/${idj}`);
    await pj.getByTestId('painel-familia').waitFor();
    await pj.getByText('Nível 2 de 10').first().waitFor({ timeout: 5000 }).catch(() => {});
    ok(/Nível 2 de 10/.test(await pj.getByTestId('painel-familia').innerText()), 'termômetro subiu para 2 depois da Cachoeira das Sílabas');
    ok(/Exploração das Palavras/.test(await pj.getByTestId('painel-familia').innerText()), 'título "Exploração das Palavras" depois do portão');
    await ctx2.close();
  }

  if (CAPTURAS) {
    const cel = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'pt-BR' });
    await cel.addInitScript(() => localStorage.setItem('fonema-teste-rapido', '1'));
    const p2 = await cel.newPage();
    // o celular tem o próprio banco: cadastro rápido
    await p2.goto(BASE + '#/adulto/cadastro');
    await passarPorteira(p2);
    await p2.getByTestId('campo-nome').fill('Kauã');
    await p2.locator('[data-genero="m"]').click();
    await p2.getByTestId('cons-responsavel').check();
    await p2.getByTestId('cadastro-continuar').click();
    await p2.getByTestId('nome-continuar').click();
    await p2.getByTestId('salvar-crianca').click();
    await p2.getByTestId('entregar').click();
    await p2.getByTestId('avatar-pronto').click();
    await p2.getByTestId('primeira-missao').click();
    await p2.getByTestId('comecar-sessao').click();
    await p2.getByTestId('minha-vez').click();
    await p2.waitForTimeout(300);
    await p2.screenshot({ path: `${DIR_CAP}/celular-01-palmas.png`, fullPage: false });
    await jogarSessao(p2, {});
    await p2.waitForTimeout(800);
    await p2.screenshot({ path: `${DIR_CAP}/celular-02-ritual.png`, fullPage: true });
    await p2.getByTestId('voltar-vila').click();
    await p2.getByTestId('vila').waitFor();
    await p2.waitForTimeout(300);
    await p2.screenshot({ path: `${DIR_CAP}/celular-03-vila.png`, fullPage: true });
    await cel.close();
  }

  ok(erros.length === 0, `sem erros de JavaScript na página${erros.length ? ': ' + erros.join(' | ') : ''}`);
  await browser.close();
  console.log('\nE2E OK');
}

main()
  .catch((e) => { console.error(e); process.exitCode = 1; })
  .finally(() => servidor?.kill());
