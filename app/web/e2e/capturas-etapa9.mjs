// FONEMA · capturas da etapa 9 da D030 (sondagem em blocos, treino rápido, painel) e dos personagens 3D, em
// app/docs/capturas/v7-*.png (1850×980 e 390×844, "-celular").
// Uso:  node web/e2e/capturas-etapa9.mjs   (faz o build numa pasta separada e sobe o preview na porta 4193, para não
// disputar web/dist nem a porta 4179 dos outros testes). Com BASE_URL definido, usa o servidor indicado.
// Também confere (falha alto): a sondagem passa pelas 5 placas e grava o resultado por área; o treino registra
// respostas conferidas no contexto "reforço"; o painel mostra as sondagens lado a lado, a queda e o ditado escrito.
import { chromium } from '@playwright/test';
import { spawn, spawnSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const aqui = dirname(fileURLToPath(import.meta.url));
const DIR = resolve(aqui, '../../docs/capturas');
const EXEC = process.env.CHROMIUM ?? '/opt/pw-browsers/chromium';
const PORTA = 4193;
const SAIDA = process.env.DIST_ETAPA9 ?? resolve(tmpdir(), 'fonema-dist-etapa9');
const VITE = resolve(aqui, '../../node_modules/vite/bin/vite.js');
let BASE = process.env.BASE_URL;
let servidor;
const DIA = 86400000;
const AGORA = Date.now();
const ID = 'cap9-bia';

const CRIANCA = {
  id: ID, nome: 'Bia', genero: 'f', anoNascimento: new Date().getFullYear() - 7,
  pronuncia: { grafia: 'Bia', fala: 'Bia', rate: 1, pitchExtra: 0, voz: 'sofia' },
  avatar: { versao: 3, cantinho: 'ceu', pele: null, olhos: null, corCabelo: null, cabelo: null, camisa: null, calca: null, calcado: null, acessibilidade: [], pronto: true },
  apoios: { previsivel: false, focoCurto: false, leituraReforco: false, calmo: false },
  jaSabe: { letrasDoNome: 'nao-sei', lePalavras: 'nao-sei', leFrases: 'nao-sei' },
  consentimentos: { responsavel: true, vozPrimeiroNome: true, gravarVozAdulto: false, em: 1 },
  rotina: { minutosDia: 15, horaDormir: '20:00' }, criadoEm: AGORA - 60 * DIA
};

async function subir() {
  if (BASE) return;
  console.log('· build em', SAIDA);
  const b = spawnSync(process.execPath, [VITE, 'build', '--outDir', SAIDA, '--emptyOutDir', '--logLevel', 'error'], { cwd: resolve(aqui, '..'), stdio: 'inherit' });
  if (b.status !== 0) throw new Error('build falhou');
  servidor = spawn(process.execPath, [VITE, 'preview', '--outDir', SAIDA, '--port', String(PORTA), '--strictPort'], { cwd: resolve(aqui, '..'), stdio: 'ignore' });
  BASE = `http://localhost:${PORTA}/`;
  for (let i = 0; i < 80; i++) {
    try { if ((await fetch(BASE)).ok) return; } catch { /* esperando */ }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error('servidor de preview não subiu');
}

/** Grava a criança, abre a vila (cria o progresso) e semeia: fases vistas, trocas B→D, duas sondagens antigas. */
async function semear(page) {
  await page.goto(BASE + '#/');
  await page.waitForTimeout(700);
  await page.evaluate(async (c) => {
    const db = await new Promise((ok, erro) => { const r = indexedDB.open('fonema'); r.onsuccess = () => ok(r.result); r.onerror = () => erro(r.error); });
    const tx = db.transaction(['criancas'], 'readwrite');
    tx.objectStore('criancas').put(c);
    await new Promise((ok) => { tx.oncomplete = ok; });
    db.close();
  }, CRIANCA);
  await page.goto(`${BASE}#/c/${ID}/vila`);
  await page.waitForTimeout(1200);
  await page.evaluate(async ({ id, agora, dia }) => {
    const db = await new Promise((ok, erro) => { const r = indexedDB.open('fonema'); r.onsuccess = () => ok(r.result); r.onerror = () => erro(r.error); });
    const tx = db.transaction(['progressos'], 'readwrite');
    const st = tx.objectStore('progressos');
    const p = await new Promise((ok) => { const r = st.get(id); r.onsuccess = () => ok(r.result); });
    // todas as fases ANTES da Festa do Alfabeto, mais a Ilha das Vogais e o Vale do M-L-F, concluídas
    const ids = Object.keys(p.fases);
    const ate = ids.indexOf('AL-FESTA');
    for (const f of ids.slice(0, ate < 0 ? 26 : ate)) p.fases[f] = { ...p.fases[f], estado: 'concluida', sessoes: 1, concluidaEm: agora - 20 * dia };
    for (const f of ids.filter((x) => x.startsWith('R1-') || x.startsWith('R2a-'))) p.fases[f] = { ...p.fases[f], estado: 'concluida', sessoes: 1, concluidaEm: agora - 10 * dia };
    let rel = 0;
    const t = (habilidade, sessao, d, extra) => ({ em: agora - d * dia + rel++ * 1000, sessao, habilidade, acertou: true, mecanica: 'escolher', tipo: 'avaliada', ...extra });
    const troca = (h, alvo, esc, s, d) => t(h, s, d, { comAjuda: true, alvo, escolhido: esc, respostas: [esc, alvo], distratores: [esc], tentativaNumero: 2, tempoMs: 6400, posicaoCerta: rel % 3, posicaoEscolhida: (rel + 1) % 3 });
    const certo = (h, alvo, s, d) => t(h, s, d, { alvo, escolhido: alvo, respostas: [alvo], tentativaNumero: 1, tempoMs: 2300, posicaoCerta: rel % 3, posicaoEscolhida: rel % 3, ouviuDeNovo: rel % 4 === 0 ? 1 : 0 });
    const ts = [
      troca('letra-b', 'B', 'D', 's1', 9), troca('letra-b', 'B', 'D', 's2', 6), troca('letra-b', 'B', 'D', 's3', 3), certo('letra-b', 'B', 's3', 3),
      certo('letra-d', 'D', 's2', 6), t('letra-d', 's3', 3, { comAjuda: true, alvo: 'D', escolhido: 'B', respostas: ['B', 'P', 'D'], tentativaNumero: 3, tempoMs: 9100 }),
      ...Array.from({ length: 6 }, (_, i) => certo('vogais', 'AEIOU'[i % 5], 's2', 6))
    ];
    p.habilidades = {};
    for (const x of ts) { const h = p.habilidades[x.habilidade] ?? { tentativas: [], p: 0.3 }; h.tentativas.push(x); p.habilidades[x.habilidade] = h; }
    p.sessoesFeitas = 12; p.ultimaSessao = agora - dia; p.desafios = 60; p.criadoEm = agora - 60 * dia; p.faseAtual = 'AL-FESTA';
    if (p.fases['AL-FESTA']) p.fases['AL-FESTA'] = { ...p.fases['AL-FESTA'], estado: 'aberta' };
    p.expressa = { regioes: [], ativa: false, sondagemEm: agora - 70 * dia, degrau: 2 };
    p.sondagens = [
      { id: 'sd0', em: agora - 70 * dia, motivo: 'inicial', tela: 'placas', faseAtual: 'AL-A', fasesConcluidas: 0, degrau: 2, areas: { segmentacao: { acertos: 2, total: 4 } } },
      { id: 'sd1', em: agora - 35 * dia, motivo: 'dias', tela: 'blocos', faseAtual: 'AL-T', fasesConcluidas: 20, areas: {
        'sons-letras': { acertos: 4, total: 4 }, 'leitura-palavras': { acertos: 2, total: 3 }, pseudopalavras: { acertos: 1, total: 3 }, segmentacao: { acertos: 2, total: 3 },
        ditado: { acertos: 1, total: 3, itens: [{ alvo: 'FACA', escolhido: 'FACA', escrito: 'FACA', acertou: true }, { alvo: 'VACA', escolhido: 'FACA', escrito: 'FACA', acertou: false }, { alvo: 'TATU', escolhido: 'TATO', escrito: 'TATO', acertou: false }] } } }
    ];
    p.treinos = [];
    st.put(p);
    await new Promise((ok) => { tx.oncomplete = ok; });
    db.close();
  }, { id: ID, agora: AGORA, dia: DIA });
}

const entrarComo = (page, tipo) => page.evaluate((tipo) => sessionStorage.setItem('fonema-sessao', JSON.stringify({ contaId: 'cap', nome: 'Mamãe', tipo, ate: Date.now() + 3600000 })), tipo);
const lerProgresso = (page) => page.evaluate(async (id) => {
  const db = await new Promise((ok, erro) => { const r = indexedDB.open('fonema'); r.onsuccess = () => ok(r.result); r.onerror = () => erro(r.error); });
  const p = await new Promise((ok) => { const r = db.transaction(['progressos']).objectStore('progressos').get(id); r.onsuccess = () => ok(r.result); });
  db.close();
  return p;
}, ID);

async function main() {
  mkdirSync(DIR, { recursive: true });
  await subir();
  const browser = await chromium.launch({ executablePath: EXEC, args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const problemas = [];
  const exigir = (cond, msg) => { if (!cond) { problemas.push(msg); console.log('  ! ' + msg); } };

  for (const [suf, w, h, cel] of [['', 1850, 980, false], ['-celular', 390, 844, true]]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, isMobile: cel, hasTouch: cel, locale: 'pt-BR', reducedMotion: 'reduce' });
    await ctx.addInitScript(() => { try { localStorage.setItem('fonema-prefs', JSON.stringify({ vozLigada: false, contraste: false, menosMovimento: true })); localStorage.setItem('fonema-teste-rapido', '1'); } catch { /* sem armazenamento */ } });
    const page = await ctx.newPage();
    page.on('pageerror', (e) => { problemas.push(String(e)); console.log('  ! erro na página:', String(e)); });
    await semear(page);
    const foto = async (nome, alvo, inteira = false) => {
      const caminho = `${DIR}/v7-${nome}${suf}.png`;
      if (alvo) await page.locator(alvo).first().screenshot({ path: caminho });
      else await page.screenshot({ path: caminho, fullPage: inteira });
      console.log('  ✓', caminho);
    };
    const estouro = async (nome) => {
      const d = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      const quem = d > 1 ? await page.evaluate(() => [...document.querySelectorAll('body *')].filter((e) => e.getBoundingClientRect().right > document.documentElement.clientWidth + 1).slice(-4).map((e) => `${e.tagName.toLowerCase()}.${String(e.className).split(' ')[0]}`).join(' ')) : '';
      exigir(d <= 1, `${nome}${suf}: estouro lateral de ${d}px (${quem})`);
    };
    const esperar3d = async (n = 1) => {
      await page.waitForFunction((n) => document.querySelectorAll('canvas[data-giro]').length >= n, n, { timeout: 60000 }).catch(() => exigir(false, 'modelo 3D não carregou'));
      await page.waitForTimeout(1500);
    };

    // ---------- personagens 3D: chegada e Álbum ----------
    await page.goto(`${BASE}#/c/${ID}/chegada`);
    await page.locator('.dupla-giravel').waitFor({ timeout: 20000 });
    await esperar3d(2);
    exigir((await page.locator('.dupla-giravel canvas[data-giro="3d"]').count()) === 2, 'chegada: Sofia e Tales não estão em 3D');
    await foto('personagens3d-chegada');
    await estouro('personagens3d-chegada');
    await page.goto(`${BASE}#/c/${ID}/album`);
    await page.locator('[data-testid=conheca-dupla]').waitFor({ timeout: 20000 });
    await page.locator('[data-testid=conheca-dupla]').scrollIntoViewIfNeeded();
    await esperar3d(3);
    exigir((await page.locator('[data-testid=conheca-dupla] canvas[data-giro="3d"]').count()) === 3, 'Álbum: Sofia, Tales e Bolota não estão em 3D');
    await foto('personagens3d-album', '[data-testid=conheca-dupla]');
    // arrastar gira (o ângulo muda): compara o quadro antes e depois de arrastar a Sofia
    if (!cel) {
      const c = page.locator('[data-modelo=sofia] canvas');
      const antes = await c.screenshot();
      const box = await c.boundingBox();
      await page.mouse.move(box.x + box.width * 0.3, box.y + box.height * 0.5); await page.mouse.down();
      await page.mouse.move(box.x + box.width * 0.9, box.y + box.height * 0.5, { steps: 10 });
      await page.waitForTimeout(200);
      await foto('personagens3d-album-girando', '[data-modelo=sofia]');
      exigir(Buffer.compare(antes, await c.screenshot()) !== 0, 'arrastar não girou a Sofia');
      await page.mouse.up();
    }

    // ---------- sondagem em blocos ----------
    await page.goto(`${BASE}#/c/${ID}/sondagem`);
    await page.getByTestId('sondagem-blocos').waitFor({ timeout: 20000 });
    await esperar3d(1);
    await foto('sondagem-intro');
    await estouro('sondagem-intro');
    await page.getByTestId('comecar-sondagem').click();
    const vistas = new Set();
    for (let passo = 0; passo < 120; passo++) {
      if (await page.getByTestId('sondagem-fim').isVisible().catch(() => false)) break;
      const area = await page.locator('.sondagem-blocos').getAttribute('data-area');
      const exemplo = await page.locator('[data-exemplo]').isVisible().catch(() => false);
      const item = page.locator('[data-item][data-pronto="1"]');
      if (exemplo && !vistas.has('exemplo')) { vistas.add('exemplo'); await foto('sondagem-segmentacao-exemplo'); continue; }
      if (!(await item.isVisible().catch(() => false))) { await page.waitForTimeout(80); continue; }
      const alvo = await item.getAttribute('data-item');
      if (!vistas.has(area)) { vistas.add(area); await page.waitForTimeout(250); await foto(`sondagem-${area}`); await estouro(`sondagem-${area}`); }
      if (area === 'ditado') {
        for (const l of alvo) await page.locator(`.sondagem-ditado .peca[data-peca="${l}"]:not([disabled])`).first().click();
        await page.getByTestId('ditado-pronto').click();
      } else if (area === 'pseudopalavras') {
        await page.locator(`[data-testid=opcao-sondagem][data-opcao="${alvo}"]`).click();
        await page.getByTestId('confirmar-leitura').click();
      } else {
        // a última resposta de sons sai "errada" de propósito, para o resultado não ser perfeito
        const errar = area === 'sons-letras' && !vistas.has('errou');
        if (errar) vistas.add('errou');
        await page.locator(errar ? `[data-testid=opcao-sondagem]:not([data-opcao="${alvo}"])` : `[data-testid=opcao-sondagem][data-opcao="${alvo}"]`).first().click();
      }
      await page.waitForTimeout(120);
    }
    await page.getByTestId('sondagem-fim').waitFor({ timeout: 20000 });
    await esperar3d(1);
    await foto('sondagem-fim');
    exigir([...vistas].filter((x) => x !== 'exemplo' && x !== 'errou').length === 5, `sondagem: placas vistas ${[...vistas].join(', ')}`);
    const p1 = await lerProgresso(page);
    const ult = p1.sondagens[p1.sondagens.length - 1];
    exigir(ult.tela === 'blocos' && Object.keys(ult.areas).length === 5, 'sondagem não gravou as 5 áreas: ' + JSON.stringify(ult.areas).slice(0, 200));
    exigir(ult.areas.ditado?.itens?.every((i) => i.escrito), 'ditado sem o escrito guardado');

    // ---------- treino rápido ----------
    await page.goto(`${BASE}#/c/${ID}/vila`);
    await page.getByTestId('ir-treino').waitFor({ timeout: 20000 }).catch(() => exigir(false, 'vila sem o botão Treino rápido'));
    await page.waitForTimeout(600);
    await foto('treino-vila');
    await page.getByTestId('ir-treino').click();
    await page.getByTestId('comecar-treino').waitFor({ timeout: 20000 });
    await esperar3d(1);
    await foto('treino-intro');
    await estouro('treino-intro');
    await page.getByTestId('comecar-treino').click();
    let fotoJogo = false;
    for (let passo = 0; passo < 200; passo++) {
      if (await page.getByTestId('treino-fim').isVisible().catch(() => false)) break;
      const confirmar = page.getByTestId('confirmar-som');
      if (await confirmar.isVisible().catch(() => false)) {
        if (await confirmar.isEnabled().catch(() => false)) await confirmar.click().catch(() => {});
        else await page.locator('button.opcao[data-correta="1"]').first().click().catch(() => {});
        continue;
      }
      const certa = page.locator('button.opcao[data-correta="1"]').first();
      if (await certa.isVisible().catch(() => false)) {
        if (!fotoJogo) { fotoJogo = true; await page.waitForTimeout(300); await foto('treino-jogo'); await estouro('treino-jogo'); }
        await certa.click().catch(() => {});
      }
      await page.waitForTimeout(120);
    }
    await page.getByTestId('treino-fim').waitFor({ timeout: 20000 });
    await esperar3d(1);
    await foto('treino-fim');
    const p2 = await lerProgresso(page);
    const doTreino = Object.values(p2.habilidades).flatMap((x) => x.tentativas).filter((x) => x.contexto === 'reforco');
    exigir(doTreino.length >= 3 && doTreino.every((x) => x.tipo === 'avaliada'), `treino gravou ${doTreino.length} respostas no contexto reforço`);
    exigir(p2.treinos?.length === 1, 'treino não ficou no histórico');
    await page.goto(`${BASE}#/c/${ID}/vila`);
    await page.waitForTimeout(1200);
    exigir(!(await page.getByTestId('ir-treino').count()), 'o treino apareceu de novo no mesmo dia');

    // ---------- painel do adulto ----------
    await entrarComo(page, 'responsavel');
    await page.goto(`${BASE}#/familia/crianca/${ID}`);
    await page.reload();
    await page.locator('[data-testid=sondagem-periodica]').waitFor({ timeout: 20000 });
    await page.waitForTimeout(600);
    await foto('painel-familia', null, true);
    await estouro('painel-familia');
    if (!cel) {
      for (const b of ['sondagem-periodica', 'ajuda-graduada', 'treinos-rapidos', 'pratica-recomendada']) await foto(`painel-${b}`, `[data-testid=${b}]`);
      if (await page.locator('[data-testid=alerta-adulto]').count()) await foto('painel-alerta', '[data-testid=alerta-adulto]');
      const s = await page.locator('[data-testid=sondagem-periodica]').innerText();
      exigir((await page.locator('[data-testid=sondagens-comparadas] thead th').count()) >= 4, 'painel não mostra as sondagens lado a lado');
      exigir(/Ditado/.test(s) && /Pseudo|bichinho|inventad/i.test(s), 'painel sem as áreas novas');
      exigir(await page.locator('[data-testid=ditado-escrito]').count() === 1, 'painel não mostra o que a criança escreveu no ditado');
      exigir(/treino|Treino/.test(await page.locator('[data-testid=treinos-rapidos]').innerText()), 'painel sem o treino');
    }
    await ctx.close();
  }

  // ---------- estrela da Fase concluída (sem halo) ----------
  {
    const ctx = await browser.newContext({ viewport: { width: 1850, height: 980 }, locale: 'pt-BR', reducedMotion: 'reduce' });
    await ctx.addInitScript(() => { try { localStorage.setItem('fonema-prefs', JSON.stringify({ vozLigada: false, contraste: false, menosMovimento: true })); localStorage.setItem('fonema-teste-rapido', '1'); } catch { /* ok */ } });
    const page = await ctx.newPage();
    await page.setContent(`<body style="margin:0;display:flex;gap:30px;padding:30px;background:linear-gradient(#8CC5EC,#2C4C94)"><img src="${BASE}assets/figuras/estrela.webp" style="width:260px;height:260px"><img src="${BASE}assets/figuras/cena-a.webp" style="width:260px;height:260px;background:#fff;border-radius:20px"><img src="${BASE}assets/figuras/cena-o.webp" style="width:260px;height:260px;background:#fff;border-radius:20px"><img src="${BASE}assets/figuras/cena-n.webp" style="width:260px;height:260px;background:#fff;border-radius:20px"></body>`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(800);
    await page.screenshot({ path: `${DIR}/v7-figuras-estrela-e-cenas.png`, clip: { x: 0, y: 0, width: 1250, height: 330 } });
    console.log('  ✓', `${DIR}/v7-figuras-estrela-e-cenas.png`);
    await ctx.close();
  }

  await browser.close();
  servidor?.kill();
  if (problemas.length) { console.log(`\n${problemas.length} problema(s):\n- ${problemas.join('\n- ')}`); process.exit(1); }
  console.log('\nTudo certo.');
}

main().catch((e) => { console.error(e); servidor?.kill(); process.exit(1); });
