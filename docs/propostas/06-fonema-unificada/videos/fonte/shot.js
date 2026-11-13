// uso: node shot.js page.html outprefix W H t1,t2,... [query]  -> outprefix-t.png + sheet
const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const [page_, out, W, H, ts, q] = process.argv.slice(2);
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: +W, height: +H } });
  await p.goto('file://' + path.resolve(page_) + (q ? '?' + q : ''));
  await p.evaluate(() => window.__ready);
  for (const tt of String(ts).split(',')) {
    await p.evaluate(x => window.renderAt(x), +tt);
    await p.screenshot({ path: `${out}-${tt}.png` });
  }
  await b.close();
})();
