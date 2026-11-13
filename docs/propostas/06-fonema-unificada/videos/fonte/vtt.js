const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
const ts = s => { const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), x = (s % 60).toFixed(3).padStart(6, '0'); return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${x}`; };
(async () => {
  const b = await chromium.launch(); const p = await b.newPage();
  for (const [pg, out] of [['som-m.html', 'amostra-sofia-som-m'], ['familia.html', 'amostra-familia-como-funciona'], ['professor.html', 'amostra-professor-painel']]) {
    await p.goto('file://' + path.resolve(pg)); await p.evaluate(() => window.__ready);
    const caps = await p.evaluate(() => CAP.map(c => ({ a: c.a, b: c.b, who: c.who, txt: c.html.replace(/<[^>]+>/g, '') })));
    fs.writeFileSync(`out/${out}.vtt`, 'WEBVTT\n\n' + caps.map((c, i) => `${i + 1}\n${ts(c.a)} --> ${ts(c.b)}\n<v ${c.who}>${c.txt}`).join('\n\n') + '\n');
  }
  await b.close();
})();
