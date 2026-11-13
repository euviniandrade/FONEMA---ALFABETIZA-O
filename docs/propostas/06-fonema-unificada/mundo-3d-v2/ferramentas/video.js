// Vídeo do passeio (arquipélago → mergulho → vila → passeio guiado), 1280×720, quadros determinísticos.
// Cada quadro é renderizado com FONEMA_MUNDO.videoAt(t) e salvo em JPEG; o ffmpeg junta (H.264, ≤ 20 MB).
// Uso, a partir de mundo-3d-v2/:  node ferramentas/video.js [fps=15] [q=medio] [só-estes-segundos...]
const { chromium } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path'), { execSync } = require('child_process');
const AQUI = path.resolve(__dirname, '..');
const TIPOS = { '.html': 'text/html', '.js': 'text/javascript', '.png': 'image/png', '.woff2': 'font/woff2' };
const FPS = Number(process.argv[2] || 15), QUAL = process.argv[3] || 'medio', DUR = 23;
const so = process.argv.slice(4).map(Number);
const DIR = process.env.QUADROS || path.join(require('os').tmpdir(), 'fonema-quadros');
const srv = http.createServer((q, r) => { const f = path.join(AQUI, decodeURIComponent(q.url.split('?')[0])); if (!f.startsWith(AQUI)) { r.writeHead(403); return r.end(); } fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': TIPOS[path.extname(f)] || 'application/octet-stream' }); r.end(d); }); }).listen(0, async () => {
  fs.mkdirSync(DIR, { recursive: true });
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
  page.on('pageerror', (e) => console.log('ERRO', e.message));
  await page.goto(`http://localhost:${srv.address().port}/index.html?captura=1&hud=0&q=${QUAL}`);
  await page.waitForFunction(() => window.FONEMA_MUNDO, null, { timeout: 300000 });
  await page.waitForTimeout(900);
  const quadros = so.length ? so.map((s) => Math.round(s * FPS)) : [...Array(DUR * FPS).keys()];
  const t0 = Date.now();
  for (const f of quadros) {
    const arq = path.join(DIR, `q${String(f).padStart(4, '0')}.jpg`);
    if (!so.length && fs.existsSync(arq)) continue; // retoma de onde parou
    await page.evaluate((t) => window.FONEMA_MUNDO.videoAt(t), f / FPS);
    await page.screenshot({ path: arq, type: 'jpeg', quality: 92, timeout: 600000 });
    if (f % FPS === 0) console.log('quadro', f, '/', quadros.length, ((Date.now() - t0) / 1000).toFixed(0) + 's');
  }
  await browser.close(); srv.close();
  if (!so.length) {
    const out = path.join(AQUI, 'capturas', 'passeio-guiado.mp4');
    execSync(`ffmpeg -y -framerate ${FPS} -i "${DIR}/q%04d.jpg" -vf "minterpolate=fps=30:mi_mode=blend,fade=t=in:st=0:d=0.5,fade=t=out:st=${DUR - 0.7}:d=0.7" -c:v libx264 -preset slow -crf 23 -maxrate 5M -bufsize 10M -pix_fmt yuv420p -movflags +faststart "${out}"`, { stdio: 'inherit' });
    console.log('ok', out, (fs.statSync(out).size / 1e6).toFixed(1) + ' MB');
  }
});
