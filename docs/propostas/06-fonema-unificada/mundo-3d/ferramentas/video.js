// Vídeo determinístico 1280×720: cada quadro é renderizado com FONEMA.videoAt(t) (tempo controlado),
// capturado e depois unido com ffmpeg (H.264).
// Uso: node ferramentas/video.js [pastaDosQuadros] [fps] [só-estes-segundos...]
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs'), { execSync } = require('child_process');
const BASE = process.env.BASE || 'http://127.0.0.1:8931/index.html';
const DIR = process.argv[2] || path.resolve(__dirname, '../.quadros');
const FPS = Number(process.argv[3] || 30), DUR = 26;
const only = process.argv.slice(4).map(Number);
(async () => {
  fs.mkdirSync(DIR, { recursive: true });
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
  page.on('pageerror', (e) => console.log('[pageerror]', e.message));
  await page.goto(`${BASE}?capture=1&painel=0&hud=0&q=alto&tod=0`);
  await page.waitForFunction(() => window.FONEMA && window.FONEMA.ready, null, { timeout: 180000 });
  const frames = only.length ? only.map((s) => Math.round(s * FPS)) : [...Array(DUR * FPS + 1).keys()];
  const t0 = Date.now();
  for (const f of frames) {
    const t = f / FPS;
    await page.evaluate((t) => window.FONEMA.videoAt(t, { celebrate: 19.2 }), t);
    await page.screenshot({ path: path.join(DIR, `q${String(f).padStart(4, '0')}.jpg`), type: 'jpeg', quality: 94 });
    if (f % 30 === 0) console.log('quadro', f, ((Date.now() - t0) / 1000).toFixed(0) + 's');
  }
  await browser.close();
  if (!only.length) {
    const out = path.resolve(__dirname, '../voo-arquipelago-vila.mp4');
    execSync(`ffmpeg -y -framerate ${FPS} -i "${DIR}/q%04d.jpg" -c:v libx264 -preset slow -crf 21 -pix_fmt yuv420p -movflags +faststart -vf "fade=t=in:st=0:d=0.6,fade=t=out:st=${DUR - 0.8}:d=0.8" "${out}"`, { stdio: 'inherit' });
    console.log('ok', out, (fs.statSync(out).size / 1e6).toFixed(1) + ' MB');
  }
})();
