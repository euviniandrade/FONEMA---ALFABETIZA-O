// uso: node render.js page.html out.mp4 W H dur audio.wav [query]
const { chromium } = require('playwright'); const path = require('path'); const { spawn } = require('child_process');
(async () => {
  const [page_, out, W, H, dur, audio, q] = process.argv.slice(2); const fps = 30; const N = Math.round(+dur * fps);
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: +W, height: +H } });
  await p.goto('file://' + path.resolve(page_) + (q ? '?' + q : ''));
  await p.evaluate(() => window.__ready);
  const args = ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-'];
  if (audio) args.push('-i', audio);
  args.push('-c:v', 'libx264', '-preset', 'slow', '-crf', '24', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-r', String(fps), '-movflags', '+faststart', '-tune', 'animation');
  if (audio) args.push('-c:a', 'aac', '-b:a', '96k', '-shortest');
  args.push(out);
  const ff = spawn('ffmpeg', args, { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let i = 0; i < N; i++) {
    await p.evaluate(x => window.renderAt(x), i / fps);
    const buf = await p.screenshot({ type: 'jpeg', quality: 93 });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (i % 150 === 0) process.stderr.write(`${out} ${i}/${N}\n`);
  }
  ff.stdin.end(); await new Promise(r => ff.on('close', r)); await b.close();
})();
