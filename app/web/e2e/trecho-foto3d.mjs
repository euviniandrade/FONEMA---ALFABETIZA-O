// FONEMA · trecho E2E: TRANSFORMAR FOTO EM 3D (fila do dono nº 19, Área do administrador › Foto → 3D).
// Confere: sem a confirmação "não é foto de pessoa" não dá para escolher a foto; com ela, uma foto de objeto (bola
// vermelha num fundo claro, gerada aqui) vira recorte + modelo 3D girando; "Aprovar e colocar" troca o troféu (prêmio
// 360°) NESTE aparelho; "Baixar o .glb" e "Pedir o 3D completo" baixam arquivos válidos (GLB e .zip com pedido.json).
// Uso: node e2e/fluxo.e2e.mjs --foto3d   (também roda dentro do E2E completo e do --sem-jornada)
import { deflateSync } from 'node:zlib';

/** PNG de uma bola vermelha com brilho num fundo creme (sem transparência). */
function pngBola(w = 200, h = 160) {
  const crcT = new Uint32Array(256).map((_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
  const crc = (b) => { let c = 0xffffffff; for (const x of b) c = crcT[(c ^ x) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
  const bloco = (tipo, dados) => { const t = Buffer.concat([Buffer.from(tipo), dados]); const L = Buffer.alloc(4); L.writeUInt32BE(dados.length); const C = Buffer.alloc(4); C.writeUInt32BE(crc(t)); return Buffer.concat([L, t, C]); };
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 6;
  const linhas = Buffer.alloc((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const d = Math.hypot(x - 100, y - 80), luz = Math.hypot(x - 85, y - 65);
    const px = d < 60 ? [Math.min(255, 200 + (luz < 14 ? 50 : 0)), luz < 14 ? 160 : 40, luz < 14 ? 150 : 45, 255] : [246, 240, 228, 255];
    linhas.set(px, y * (w * 4 + 1) + 1 + x * 4);
  }
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), bloco('IHDR', ihdr), bloco('IDAT', deflateSync(linhas)), bloco('IEND', Buffer.alloc(0))]);
}

const SENHA = 'bolota-teste-2026';

/**
 * @param {import('@playwright/test').Browser} browser
 * @param {{ BASE: string, ok: Function, erros: string[], capturas?: string }} h
 */
export async function trechoFoto3d(browser, { BASE, ok, erros, capturas }) {
  console.log('F3. Foto → 3D: aviso e trava de foto de pessoa, recorte, modelo girando, troca do troféu, .glb e pedido');
  const ctx = await browser.newContext({ viewport: { width: 1850, height: 980 }, locale: 'pt-BR', serviceWorkers: 'block', acceptDownloads: true });
  await ctx.addInitScript(() => { try { localStorage.setItem('fonema-teste-rapido', '1'); } catch { /* sem armazenamento */ } });
  const pg = await ctx.newPage();
  pg.on('pageerror', (e) => erros.push(String(e)));
  try {
    await pg.goto(BASE + '#/admin/foto3d');
    await Promise.race([pg.getByTestId('area-admin').waitFor().catch(() => {}), pg.getByTestId('acesso-admin').waitFor().catch(() => {})]);
    if (await pg.getByTestId('admin-nome').count()) {
      await pg.getByTestId('admin-nome').fill('Dono');
      await pg.getByTestId('admin-senha').fill(SENHA);
      await pg.getByTestId('admin-senha2').fill(SENHA);
      await pg.getByTestId('criar-admin').click();
    } else if (await pg.getByTestId('acesso-admin').count()) {
      await pg.getByTestId('admin-senha').fill(SENHA);
      await pg.getByTestId('entrar-admin').click();
    }
    await pg.getByTestId('ferramenta-foto3d').waitFor({ timeout: 20000 });
    const texto = await pg.getByTestId('ferramenta-foto3d').innerText();
    ok(/nunca foto de pessoa/i.test(texto) && /LGPD/.test(texto), 'aviso de LGPD: só objeto ou desenho, nunca foto de pessoa');
    ok(await pg.getByTestId('foto3d-arquivo').isDisabled(), 'sem a confirmação do adulto, não dá para escolher a foto');
    await pg.getByTestId('foto3d-confirmo').check();
    await pg.getByTestId('foto3d-arquivo').setInputFiles({ name: 'bola-vermelha.png', mimeType: 'image/png', buffer: pngBola() });
    await pg.getByTestId('foto3d-previa').waitFor({ timeout: 20000 });
    await pg.waitForTimeout(800);
    ok(await pg.getByTestId('foto3d-recorte').count() === 1, 'a foto vira recorte (fundo tirado) e modelo 3D girando');
    // o centro do palco não pode ser vazio: o modelo aparece
    const cheio = await pg.getByTestId('foto3d-previa').evaluate((c) => {
      const k = document.createElement('canvas'); k.width = c.width; k.height = c.height;
      const g = k.getContext('2d'); g.drawImage(c, 0, 0);
      const d = g.getImageData(c.width / 2 - 10, c.height / 2 - 10, 20, 20).data;
      let vermelho = 0; for (let i = 0; i < d.length; i += 4) if (d[i + 3] > 200 && d[i] > d[i + 1] + 40) vermelho++;
      return vermelho;
    });
    ok(cheio > 100, `o modelo aparece no palco (pixels vermelhos no meio: ${cheio})`);
    if (capturas) await pg.screenshot({ path: `${capturas}/v13-foto3d.png` });
    await pg.getByTestId('foto3d-nome').fill('Bola vermelha');
    const [baixado] = await Promise.all([pg.waitForEvent('download'), pg.getByTestId('foto3d-baixar').click()]);
    const glb = await (await import('node:fs/promises')).readFile(await baixado.path());
    ok(glb.readUInt32LE(0) === 0x46546c67 && glb.length > 2000 && baixado.suggestedFilename() === 'bola-vermelha.glb', `baixa um .glb válido (${glb.length} bytes)`);
    const [ped] = await Promise.all([pg.waitForEvent('download'), pg.getByTestId('foto3d-pedido').click()]);
    const zip = await (await import('node:fs/promises')).readFile(await ped.path());
    ok(zip.includes(Buffer.from('pedido.json')) && zip.includes(Buffer.from('foto-recortada.png')) && zip.includes(Buffer.from('"confirmouQueNaoEhPessoa": true')), 'o pedido do 3D completo traz pedido.json, a foto recortada e a confirmação');
    await pg.getByTestId('foto3d-destino').selectOption('trofeu');
    await pg.getByTestId('foto3d-colocar').click();
    await pg.getByTestId('foto3d-aviso').waitFor();
    const midias = await pg.evaluate(async () => {
      const db = await new Promise((ok2, erro) => { const r = indexedDB.open('fonema-admin'); r.onsuccess = () => ok2(r.result); r.onerror = () => erro(r.error); });
      const tx = db.transaction(['midias'], 'readonly');
      const todas = await new Promise((ok2) => { const r = tx.objectStore('midias').getAll(); r.onsuccess = () => ok2(r.result); });
      db.close();
      return todas.map((m) => m.caminho);
    });
    ok(midias.includes('modelos3d/trofeu.glb') && midias.includes('modelos3d/trofeu.webp'), 'aprovar e colocar: o troféu (prêmio 360°) é trocado neste aparelho e vai no pacote do Publicar');
    // volta ao original (não deixa o troféu trocado para os outros trechos)
    await pg.evaluate(async () => {
      const db = await new Promise((ok2, erro) => { const r = indexedDB.open('fonema-admin'); r.onsuccess = () => ok2(r.result); r.onerror = () => erro(r.error); });
      const tx = db.transaction(['midias'], 'readwrite');
      tx.objectStore('midias').delete('modelos3d/trofeu.glb'); tx.objectStore('midias').delete('modelos3d/trofeu.webp');
      await new Promise((ok2) => { tx.oncomplete = ok2; });
      db.close();
    });
  } finally { await ctx.close(); }
}
