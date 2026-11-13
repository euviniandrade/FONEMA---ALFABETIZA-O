const { chromium } = require('playwright'); const path = require('path');
const R = f => 'file://' + path.resolve(f);
async function frame(b, page, W, H, t, q, out) {
  const p = await b.newPage({ viewport: { width: W, height: H } });
  await p.goto(R(page) + '?thumb=1' + (q ? '&' + q : '')); await p.evaluate(() => window.__ready);
  await p.evaluate(x => window.renderAt(x), t); await p.screenshot({ path: out }); await p.close();
}
async function thumb(b, W, H, params, out) {
  const p = await b.newPage({ viewport: { width: W, height: H } });
  await p.goto(R('thumb.html') + '?' + new URLSearchParams(params)); await p.evaluate(() => window.__ready);
  await p.screenshot({ path: out }); await p.close();
}
(async () => {
  const b = await chromium.launch();
  await frame(b, 'som-m.html', 1280, 720, 2.6, '', 'chk/fr-m.png');
  await frame(b, 'familia.html', 1280, 720, 29.2, '', 'chk/fr-f.png');
  await frame(b, 'familia.html', 720, 1280, 16.8, 'v=1', 'chk/fr-fv.png');
  await frame(b, 'professor.html', 1280, 720, 15.2, '', 'chk/fr-p.png');
  await thumb(b, 1280, 720, { img: 'chk/fr-m.png', cat: 'Sofia apresenta o som', col: '#FFC83D', title: 'O som /m/', dur: '0:34', extra: 'Mata Atlântica · M L F', bare: '1' }, 'out/thumb-sofia-som-m.png');
  await thumb(b, 1280, 720, { img: 'chk/fr-f.png', cat: 'Para a família', col: '#C8F2D6', title: 'Como o FONEMA funciona', dur: '0:42', extra: 'também no WhatsApp' }, 'out/thumb-familia-como-funciona.png');
  await thumb(b, 720, 1280, { img: 'chk/fr-fv.png', cat: 'Para a família', col: '#C8F2D6', title: 'Como o FONEMA funciona', dur: '0:42', v: '1' }, 'out/thumb-familia-como-funciona-9x16.png');
  await thumb(b, 1280, 720, { img: 'chk/fr-p.png', cat: 'Formação do professor', col: '#D9D4FF', title: 'O painel da turma em 3 perguntas', dur: '0:32' }, 'out/thumb-professor-painel.png');
  await b.close();
})();
