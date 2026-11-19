// FONEMA · Mundo 3D v2 — FOLHAS QUADRO A QUADRO do boneco do passeio (fila do dono nº 28: "parece que está pulando",
// "fantasminha"). Abre o app construído, cadastra uma criança com o penteado pedido, entra no passeio e desenha:
//  anim     — o boneco num palco neutro com chão quadriculado (10 cm), de lado e de trás, parado / 1,3 / 2,6 / 3,7 m/s,
//             com a altura da cabeça e da sola mais baixa medidas a cada quadro;
//  ref      — o manequim da Universal Animation Library (Quaternius, CC0) tocando Walk / Jog / Sprint (referência);
//  giro     — a câmera girando em volta da menina NO MUNDO (QUALS=baixo,medio,alto);
//  mat      — cabeça de perto: como está × sem silhueta × sem rim × dois lados × verso (caça ao "fantasma");
//  perto    — cabelo andando/correndo e joelhos de perto;  quique — cabeça sobe e desce como no E2E;
//  mergulho — mergulho livre com a câmera do jogo;  probe — materiais e normais das malhas;  dbg — o que cobre o boneco no fundo.
// Uso (com um build servido, nunca a pasta dist do repositório):
//   DIST=<pasta dist servida> BASE_URL=http://127.0.0.1:PORTA/ [UAL_DIR=<clone da biblioteca>/glTF] \
//     node folha.mjs <prefixo-de-saída> f-liso-comprido,f-black anim,ref,giro
// O script copia diag.js (e, para `ref`, o GLTFLoader e a biblioteca) para dentro da pasta servida.
const aqui = dirname(fileURLToPath(import.meta.url));
const req = createRequire(join(aqui, '../../../../../../app/package.json'));
const { chromium } = req('playwright');
import { writeFileSync, copyFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const BASE = process.env.BASE_URL || 'http://127.0.0.1:4720/';
const SAIDA = process.argv[2] || 'folha';
const CABELOS = (process.argv[3] || 'f-liso-comprido').split(',');
const MODOS = (process.argv[4] || 'anim,ref,giro').split(',');
const DIAG = join(aqui, 'diag.js');
const DIST = process.env.DIST;
if (!DIST) throw new Error('DIST=<pasta dist servida> é obrigatório');
copyFileSync(DIAG, DIST + '/mundo3d/diag.js');
if (MODOS.includes('ref')) {
  mkdirSync(DIST + '/mundo3d/vendor/loaders', { recursive: true }); mkdirSync(DIST + '/ual', { recursive: true });
  copyFileSync(req.resolve('three/examples/jsm/loaders/GLTFLoader.js'), DIST + '/mundo3d/vendor/loaders/GLTFLoader.js');
  if (!process.env.UAL_DIR || !existsSync(process.env.UAL_DIR)) throw new Error('ref: UAL_DIR=<clone>/glTF (git clone https://github.com/J-Ponzo/gltf-universal-animation-library)');
  for (const n of readdirSync(process.env.UAL_DIR)) copyFileSync(join(process.env.UAL_DIR, n), join(DIST, 'ual', n));
}

const salvar = (nome, url) => { writeFileSync(`${SAIDA}-${nome}.jpg`, Buffer.from(url.split(',')[1], 'base64')); console.log('  →', `${SAIDA}-${nome}.jpg`); };

async function porteira(page) {
  for (let i = 0; i < 4; i++) {
    const criar = page.getByTestId('conta-nome'), pin = page.getByTestId('pin');
    await Promise.race([criar.waitFor({ timeout: 1500 }).catch(() => {}), pin.waitFor({ timeout: 1500 }).catch(() => {}), page.waitForTimeout(700)]);
    if (await criar.count()) { await criar.fill('Ana'); await page.getByTestId('conta-continuar').click(); await page.getByTestId('conta-pin').fill('1234'); await page.getByTestId('conta-pin2').fill('1234'); await page.getByTestId('conta-criar').click(); await page.getByTestId('criar-conta').waitFor({ state: 'detached', timeout: 8000 }); continue; }
    if (await pin.count()) { await pin.fill('1234'); await page.getByTestId('tela-pin').waitFor({ state: 'detached', timeout: 8000 }); continue; }
    return;
  }
}

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM ?? '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
for (const cabelo of CABELOS) {
  const ctx = await browser.newContext({ viewport: { width: 900, height: 700 }, locale: 'pt-BR', serviceWorkers: 'block' });
  await ctx.addInitScript(() => { try { localStorage.setItem('fonema-teste-rapido', '1'); } catch { /* */ } });
  const pg = await ctx.newPage(); pg.setDefaultTimeout(240000);
  pg.on('pageerror', (e) => console.log('  [erro]', String(e).slice(0, 300)));
  await pg.goto(BASE + '#/adulto/cadastro');
  await porteira(pg);
  await pg.getByTestId('campo-nome').fill('Bia'); await pg.locator('[data-idade="5"]').click();
  await pg.locator(`[data-genero="${cabelo.startsWith('m-') ? 'm' : 'f'}"]`).click();
  await pg.getByTestId('cadastro-continuar').click(); await pg.getByTestId('nivel-continuar').click();
  await pg.getByTestId('cons-responsavel').check(); await pg.getByTestId('salvar-crianca').click(); await pg.getByTestId('entregar').click();
  await pg.getByTestId('montar-avatar').waitFor();
  await pg.locator('[data-ir-passo="cabelo"]').click();
  await pg.locator(`.montar-corpo [data-peca="${cabelo}"]`).click();
  await pg.getByTestId('avatar-pronto').click();
  const alvo = pg.locator('[data-testid="tutorial"], [data-testid="primeira-missao"], [data-testid="vila"]').first();
  await alvo.waitFor({ timeout: 15000 }).catch(() => {});
  if (await pg.getByTestId('tutorial').count()) { await pg.getByTestId('pular-tutorial').click(); await pg.getByTestId('tutorial').waitFor({ state: 'detached' }); }
  await pg.waitForTimeout(1500);
  await pg.waitForFunction(() => location.hash.includes('/c/'));
  const id = pg.url().split('/c/')[1].split('/')[0];
  await pg.goto(BASE + `#/c/${id}/mundo`);
  await pg.waitForTimeout(3000); await pg.screenshot({ path: SAIDA + '-entrada.png' });
  let frame = null;
  for (let i = 0; i < 600 && !frame; i++) { frame = pg.frames().find((x) => /mundo3d\/passeio\.html/.test(x.url())); if (!frame) await pg.waitForTimeout(200); }
  if (!frame) { await pg.screenshot({ path: SAIDA + '-erro.png' }); throw new Error('sem iframe'); }
  await frame.waitForFunction(() => window.FONEMA_PASSEIO && (window.FONEMA_RECEBIDOS || []).includes('crianca'), null, { timeout: 240000, polling: 1000 });
  await frame.evaluate(async () => { const P = window.FONEMA_PASSEIO; for (let i = 0; i < 100 && !(P.boneco.anim && P.boneco.anim.q); i++) { P.simular(0.05); await new Promise((r) => setTimeout(r, 100)); } });
  console.log(cabelo, 'pronto', await frame.evaluate(() => ({ q: window.FONEMA_MUNDO.qualidade, med: (() => { const m = window.FONEMA_PASSEIO.boneco.rig.medidas; return { H: m.H, perna: m.perna, virilha: m.virilha, k: window.FONEMA_PASSEIO.boneco.k }; })() })));
  if (MODOS.includes('probe')) {
    console.log(JSON.stringify(await frame.evaluate(() => { const b = window.FONEMA_PASSEIO.boneco; const r = []; b.modelo.traverse((o) => { if (o.isMesh && !b.silhuetas.includes(o)) { const g = o.geometry, m = o.material; const n = g.attributes.normal, p = g.attributes.position; let fora = 0, tot = 0; if (n) { const c = new p.array.constructor(3); g.computeBoundingBox(); const cx = (g.boundingBox.min.x + g.boundingBox.max.x) / 2, cy = (g.boundingBox.min.y + g.boundingBox.max.y) / 2, cz = (g.boundingBox.min.z + g.boundingBox.max.z) / 2; for (let i = 0; i < p.count; i += 7) { tot++; if ((p.getX(i) - cx) * n.getX(i) + (p.getY(i) - cy) * n.getY(i) + (p.getZ(i) - cz) * n.getZ(i) > 0) fora++; } } r.push({ v: p.count, cor: m.color.getHexString(), mapa: !!m.map, mapaTam: m.map ? [m.map.image.width, m.map.image.height] : null, transp: m.transparent, op: m.opacity, normaisParaFora: tot ? +(fora / tot).toFixed(2) : null, tipo: o.type }); } }); return r; }), null, 1));
  }
  if (MODOS.includes('mat')) {
    const url = await frame.evaluate(async () => { const m = await import('./diag.js'); return m.folhaMateriais(window.FONEMA_PASSEIO, window.FONEMA_MUNDO.renderer); });
    salvar(`${cabelo}-materiais`, url);
  }
  if (MODOS.includes('perto')) for (const [nome, vel, alvoY, alt, vista] of [['cabelo-andar', 1.3, 1.05, 1.15, 'lado'], ['cabelo-correr', 3.7, 1.05, 1.15, 'tresq'], ['joelhos-andar', 1.3, 0.35, 0.4, 'lado']]) {
    const r = await frame.evaluate(async (a) => { const m = await import('./diag.js'); return m.folhaBoneco(window.FONEMA_PASSEIO, window.FONEMA_MUNDO.renderer, { vel: a.vel, vista: a.vista, n: 24, dist: 2.3, alvoY: a.alvoY, alturaCam: a.alt, rotulo: `${a.nome} ${a.vel} m/s — de perto` }); }, { nome, vel, alvoY, alt, vista });
    salvar(`${cabelo}-${nome}`, r.url);
  }
  if (MODOS.includes('anim')) {
    for (const [nome, vel] of [['parado', 0], ['andar', 1.3], ['teclado', 2.6], ['correr', 3.7]]) for (const vista of ['lado', 'tras']) {
      const r = await frame.evaluate(async ({ vel, vista, nome }) => { const m = await import('./diag.js'); return m.folhaBoneco(window.FONEMA_PASSEIO, window.FONEMA_MUNDO.renderer, { vel, vista, n: 24, rotulo: `${nome} ${vel} m/s — ${vista}` }); }, { vel, vista, nome });
      salvar(`${cabelo}-${nome}-${vista}`, r.url);
      if (vista === 'lado') { const c = r.medidas.map((x) => x.cab); console.log(`  ${nome}: cabeça min ${Math.min(...c)} max ${Math.max(...c)} (Δ ${(Math.max(...c) - Math.min(...c)).toFixed(3)}) sola: ${r.medidas.map((x) => x.sola).join(' ')}`); }
    }
  }
  if (MODOS.includes('ref')) {
    for (const [clip, vel] of [['Walk_Loop', 1.155], ['Jog_Fwd_Loop', 5.502], ['Sprint_Loop', 7.545]]) {
      const r = await frame.evaluate(async ({ clip, vel }) => { const m = await import('./diag.js'); const pernas = 0.93; return m.folhaReferencia(window.FONEMA_MUNDO.renderer, { clip, vel: vel * pernas, rotulo: `REFERÊNCIA (manequim da biblioteca): ${clip}` }); }, { clip, vel });
      salvar(`ref-${clip}`, r.url);
    }
  }
  if (MODOS.includes('giro')) for (const qual of (process.env.QUALS || 'baixo').split(',')) {
    await frame.evaluate(async (q) => { window.FONEMA_MUNDO.definirQualidade(q); await new Promise((r) => setTimeout(r, 1500)); }, qual);
    const url = await frame.evaluate(async () => { const m = await import('./diag.js'); return m.folhaGiro(window.FONEMA_MUNDO, window.FONEMA_PASSEIO, { rotulo: 'câmera girando em volta da menina (mundo de verdade)' }); });
    salvar(`${cabelo}-giro-${qual}`, url);
    const url2 = await frame.evaluate(async () => { const m = await import('./diag.js'); return m.folhaGiro(window.FONEMA_MUNDO, window.FONEMA_PASSEIO, { rotulo: 'giro de perto, de cima', dist: 2.2, alto: 1.9 }); });
    salvar(`${cabelo}-giro-cima-${qual}`, url2);
  }
  if (MODOS.includes('quique')) console.log('QUIQUE', JSON.stringify(await frame.evaluate(() => { const r = {}; for (const vel of ['arrowup', 'shift']) { const p = window.FONEMA_PASSEIO, b = p.boneco; p.teleportar(0, 40, Math.PI); p.teclar('arrowup', true); if (vel === 'shift') p.teclar('shift', true); p.simular(0.6); let a = 1e9, z = -1e9; const v = new b.raiz.position.constructor(); for (let i = 0; i < 40; i++) { p.simular(0.025); const y = b.rig.ossos.cabeca.getWorldPosition(v).y - b.raiz.position.y; a = Math.min(a, y); z = Math.max(z, y); } p.teclar('arrowup', false); p.teclar('shift', false); p.simular(0.5); r[vel] = +(z - a).toFixed(3); } return r; })));
  if (MODOS.includes('dbg')) console.log(JSON.stringify(await frame.evaluate(async () => { const m = await import('./diag.js'); return m.depurarFundo(window.FONEMA_MUNDO, window.FONEMA_PASSEIO); })));
  if (MODOS.includes('mergulho')) {
    const url = await frame.evaluate(async () => { const m = await import('./diag.js'); return m.folhaMergulho ? m.folhaMergulho(window.FONEMA_MUNDO, window.FONEMA_PASSEIO, {}) : null; });
    if (url) salvar(`${cabelo}-mergulho`, url);
  }
  await ctx.close();
}
await browser.close();
