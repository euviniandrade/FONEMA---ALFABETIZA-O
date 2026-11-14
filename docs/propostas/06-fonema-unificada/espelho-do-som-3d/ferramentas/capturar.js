// Capturas do Espelho do Som (Playwright + Chromium).
// Uso, a partir de espelho-do-som-3d/:  node ferramentas/capturar.js [filtro1,filtro2]   (filtro = começo do nome)
// Sobe um servidor local temporário na RAIZ do repositório (para os áudios do app) e salva em capturas/
// em 1280×800 (computador) e 390×844 (celular), deviceScaleFactor 2. Também monta as tiras de transição.
const { chromium } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const AQUI = path.resolve(__dirname, '..'), RAIZ = path.resolve(AQUI, '../../../..'), CAP = path.join(AQUI, 'capturas');
const REL = '/' + path.relative(RAIZ, AQUI).split(path.sep).join('/');
const TIPOS = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.json': 'application/json', '.mp3': 'audio/mpeg' };
const so = (process.argv[2] || '').split(',').filter(Boolean);
const quer = (n) => !so.length || so.some((s) => n.startsWith(s));
fs.mkdirSync(path.join(CAP, 'celular'), { recursive: true }); fs.mkdirSync(path.join(CAP, 'transicoes'), { recursive: true });

const CENAS = [ // nome, fonema, vista
  ['01-frente-A', 'a', 'frente'], ['02-frente-L-ponta-sobe', 'l', 'frente'], ['03-frente-M-fecha', 'm', 'frente'], ['04-frente-U-biquinho', 'u', 'frente'],
  ['04b-frente-K-fundo-sobe', 'k', 'frente'], ['04c-frente-F-dente-no-labio', 'f', 'frente'], ['04d-frente-O-redonda', 'o', 'frente'], ['04e-frente-I-sorriso', 'i', 'frente'],
  ['05-lado-L-ponta-no-alveolo', 'l', 'lado'], ['06-lado-K-dorso-no-veu', 'k', 'lado'], ['07-lado-M-nariz-e-voz', 'm', 'lado'], ['08-lado-S-ar-fininho', 's', 'lado'],
  ['09-lado-A-boca-aberta', 'a', 'lado'], ['09b-lado-T-ponta-no-alveolo', 't', 'lado'], ['09c-lado-CH-biquinho', 'x', 'lado']
];

const srv = http.createServer((q, r) => {
  const f = path.join(RAIZ, decodeURIComponent(q.url.split('?')[0]));
  if (!f.startsWith(RAIZ)) { r.writeHead(403); return r.end(); }
  fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': TIPOS[path.extname(f)] || 'application/octet-stream' }); r.end(d); });
}).listen(0, async () => {
  const url = (pag, query) => `http://localhost:${srv.address().port}${REL}/${pag}?${query}`;
  const browser = await chromium.launch({ args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', '--autoplay-policy=no-user-gesture-required'] });
  const abre = async (pag, query, w = 1280, h = 800, espera = 'DEMO') => {
    const p = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2 });
    p.on('pageerror', (e) => console.log('  ERRO', e.message));
    p.on('console', (m) => { if (m.type() === 'error') console.log('  console:', m.text()); });
    await p.goto(url(pag, query)); await p.waitForFunction((n) => window[n], espera);
    await p.waitForLoadState('networkidle'); await p.waitForTimeout(1900);
    return p;
  };
  const foto = async (p, nome, opt = {}) => { await p.screenshot(Object.assign({ path: path.join(CAP, nome + '.png'), timeout: 120000 }, opt)); console.log('📷', nome); };

  // 1. a experiência completa (demo.html), computador e celular
  for (const [nome, f, vista] of CENAS) {
    if (quer(nome)) { const p = await abre('demo.html', `f=${f}&m=${vista}`); await foto(p, nome); await p.close(); }
    if (quer('celular') || quer(nome)) { const p = await abre('demo.html', `f=${f}&m=${vista}`, 390, 844); await foto(p, `celular/${nome}`); await p.close(); }
  }
  // 2. Tales de lado, exercícios e o componente embutido (embed.html)
  const extras = [
    ['09d-lado-tales-L', 'demo.html', 'f=l&m=lado&quem=tales', null], ['09e-lado-tales-K', 'demo.html', 'f=k&m=lado&quem=tales', null],
    ['14-ex-onde-esta-a-lingua', 'demo.html', 'aba=lingua', null], ['15-ex-tem-voz', 'demo.html', 'aba=voz', null],
    ['16-ex-imite-a-sofia', 'demo.html', 'aba=imite', null], ['17-ex-conheca-seu-corpo', 'demo.html', 'aba=corpo', null],
    ['18-embed-frente-M', 'embed.html', 'f=m&vista=frente', [900, 620]], ['19-embed-lado-L-tales', 'embed.html', 'f=l&vista=lado&quem=tales', [900, 620]],
    ['20-embed-compacto-lado-K', 'embed.html', 'f=k&vista=lado&compacto=1', [390, 300]], ['21-embed-compacto-frente-L', 'embed.html', 'f=l&vista=frente&compacto=1', [390, 300]]
  ];
  for (const [nome, pag, query, tam] of extras) if (quer(nome)) {
    const p = await abre(pag, query, tam ? tam[0] : 1280, tam ? tam[1] : 800, pag === 'demo.html' ? 'DEMO' : 'ESPELHO'); await foto(p, nome); await p.close();
  }
  // 3. tiras de transição (quadros parados em 0, 33, 66 e 100%): frente M→A e T→A; lado L→K e T→A
  if (quer('transicao')) {
    const montar = await browser.newPage({ viewport: { width: 1280, height: 400 }, deviceScaleFactor: 1 });
    for (const [vista, a, b] of [['frente', 'm', 'a'], ['frente', 't', 'a'], ['lado', 'l', 'k'], ['lado', 't', 'a']]) {
      const p = await abre('embed.html', `f=${a}&vista=${vista}&compacto=1&rotulos=0`, 640, 440, 'ESPELHO'), arqs = [];
      for (const fr of [0, 0.33, 0.66, 1]) {
        await p.evaluate(([v, x, y, k]) => window.ESPELHO.vistas[v].pose(x, y, k), [vista, a, b, fr]); await p.waitForTimeout(350);
        const arq = `transicoes/${vista}-${a}-${b}-${Math.round(fr * 100)}`; await foto(p, arq); arqs.push(arq + '.png');
      }
      await p.close();
      const F = P_F(), rot = [`${F[a]}`, '→', '→', `${F[b]}`];
      await montar.setContent(`<body style="margin:0;background:#EAF5FD;font:700 26px sans-serif;color:#1B3160"><div style="display:flex;gap:10px;padding:12px">${arqs.map((x, i) =>
        `<figure style="margin:0;flex:1;text-align:center"><img src="data:image/png;base64,${fs.readFileSync(path.join(CAP, x)).toString('base64')}" style="width:100%;border-radius:16px;display:block"><figcaption style="padding-top:6px">${rot[i]}</figcaption></figure>`).join('')}</div></body>`);
      await montar.waitForTimeout(300);
      const el = await montar.$('div'); await foto(el, `transicao-${vista}-${a}-${b}`);
    }
    await montar.close();
  }
  await browser.close(); srv.close();
});
function P_F() { return { m: 'M', a: 'A', t: 'T', l: 'L', k: 'K' }; }
