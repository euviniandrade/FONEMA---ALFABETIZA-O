// Folha de contato para revisar várias bocas de uma vez (uso interno): node ferramentas/folha.js lado a,l,k,t saida.png [quem] [w] [h]
const { chromium } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const AQUI = path.resolve(__dirname, '..');
const [vista, lista, saida, quem = 'sofia', W = '640', H = '400'] = process.argv.slice(2);
const TIPOS = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2' };
const srv = http.createServer((q, r) => { fs.readFile(path.join(AQUI, decodeURIComponent(q.url.split('?')[0])), (e, d) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': TIPOS[path.extname(q.url.split('?')[0])] || 'application/octet-stream' }); r.end(d); }); }).listen(0, async () => {
  const b = await chromium.launch(), ids = lista.split(','), imgs = [];
  for (const f of ids) {
    const p = await b.newPage({ viewport: { width: +W, height: +H }, deviceScaleFactor: 1.5 });
    p.on('pageerror', (e) => console.log('ERRO', f, e.message));
    await p.goto(`http://localhost:${srv.address().port}/embed.html?f=${encodeURIComponent(f)}&vista=${vista}&quem=${quem}&compacto=1&audioBase=nada/`); await p.waitForFunction(() => window.ESPELHO); await p.waitForLoadState('networkidle'); await p.waitForTimeout(1500);
    imgs.push([f, (await p.screenshot()).toString('base64')]); await p.close();
  }
  const cols = Math.min(3, ids.length), p = await b.newPage({ viewport: { width: cols * (+W) , height: 100 }, deviceScaleFactor: 1 });
  await p.setContent(`<body style="margin:0;display:grid;grid-template-columns:repeat(${cols},1fr);gap:4px;background:#333">${imgs.map(([f, d]) => `<div style="position:relative"><img src="data:image/png;base64,${d}" style="width:100%;display:block"><b style="position:absolute;right:6px;top:4px;background:#000;color:#fff;font:700 20px sans-serif;padding:2px 8px">${f}</b></div>`).join('')}</body>`);
  await p.screenshot({ path: saida, fullPage: true }); await b.close(); srv.close();
});
