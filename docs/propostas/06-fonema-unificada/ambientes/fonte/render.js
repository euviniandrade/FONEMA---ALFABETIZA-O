// Renderiza os ambientes: node render.js [nome...]   (PNG 2560×1600 em ../)
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const { W, H } = require('./lib');
const scenes = Object.assign({}, require('./regioes'), require('./interiores'));

const page = svg => `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:Andika;src:url(fonts/andika-latin-400-normal.woff2) format('woff2');font-weight:400}
@font-face{font-family:Andika;src:url(fonts/andika-latin-700-normal.woff2) format('woff2');font-weight:700}
@font-face{font-family:Fredoka;src:url(fonts/fredoka-latin-600-normal.woff2) format('woff2');font-weight:600}
html,body{margin:0;padding:0;width:${W}px;height:${H}px;overflow:hidden;background:transparent}svg{display:block}</style></head><body>${svg}</body></html>`;

(async () => {
  const want = process.argv.slice(2);
  const b = await chromium.launch();
  const meta = {};
  for (const [name, fn] of Object.entries(scenes)) {
    if (want.length && !want.includes(name)) continue;
    const s = fn();
    meta[name] = s.hot;
    const file = path.join(__dirname, `_${name}.html`);
    fs.writeFileSync(file, page(s.render()));
    const p = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 2 });
    await p.goto('file://' + file); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(150);
    await p.screenshot({ path: path.join(__dirname, '..', `${name}.png`) });
    if (s.o.layers) { // camadas isoladas para a prancha de paralaxe
      fs.mkdirSync(path.join(__dirname, 'camadas'), { recursive: true });
      for (const l of ['sky', 'far', 'mid', 'near', 'fg']) {
        const lf = path.join(__dirname, `_${name}-${l}.html`);
        fs.writeFileSync(lf, page(s.render({ only: [l] })));
        await p.goto('file://' + lf); await p.waitForTimeout(100);
        await p.screenshot({ path: path.join(__dirname, 'camadas', `${name}-${l}.png`), omitBackground: true });
        fs.unlinkSync(lf);
      }
    }
    await p.close();
    console.log('ok', name, s.hot.map(h => h.word).join(', '));
  }
  fs.writeFileSync(path.join(__dirname, 'hotspots.json'), JSON.stringify(Object.assign(fs.existsSync(path.join(__dirname, 'hotspots.json')) ? JSON.parse(fs.readFileSync(path.join(__dirname, 'hotspots.json'))) : {}, meta), null, 1));
  await b.close();
})();
