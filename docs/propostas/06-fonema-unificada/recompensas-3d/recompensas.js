/* FONEMA · Recompensas 3D animadas — componente sem dependências (HTML/CSS/JS puros).
 *
 *   Recompensas.selo({ arte: 'selo-meu-nome', letra: 'K', nivel: 'bronze', tamanho: 320 }) → elemento
 *   Recompensas.entrar(elSelo)                  selo entra girando em 3D + confete
 *   Recompensas.subirNivel(elSelo, 'prata', 'guardiao-prata')   pulso de nível com troca de arte
 *   Recompensas.moedasVoam({ de, para, n, aoChegar })           moedinhas voam em arco até o cofrinho
 *   Recompensas.contar(elNumero, de, ate)       contador sobe
 *   Recompensas.abrirBau(elBau) · Recompensas.trofeu(elTrofeu) · Recompensas.confete(x, y)
 *
 * Arte: recortes/ (PNG sem fundo, gerados por recortar.py a partir de imagens/). Arte provisória de IA;
 * a final será redesenhada e cedida por ilustradora. Moedinhas e selos só se ganham com esforço (D002, D018).
 */
(function (global) {
  'use strict';
  const BASE = ((document.currentScript && document.currentScript.src) || '').replace(/[^/]*$/, '') + 'recortes/';
  const reduzido = () => (global.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) || document.body.classList.contains('calmo');
  const CORES = ['#F4B73C', '#FFE08A', '#FFFFFF', '#A8D5F2', '#1B3160', '#FFF3C4']; // marca, sem arco-íris (D009)
  const NIVEIS = { bronze: 'BRONZE', prata: 'PRATA', ouro: 'OURO', diamante: 'DIAMANTE' };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

  // letra inicial do nome, dourada, gordinha, com contorno marinho e "volume" (camadas para baixo)
  function letraSVG(letra) {
    const L = esc((letra || 'A').toUpperCase().slice(0, 2)), fs = L.length > 1 ? 170 : 236, id = 'rl' + Math.random().toString(36).slice(2, 7);
    const vol = Array.from({ length: 9 }, (_, i) => `<text x="378" y="${342 + i * 2}" fill="${i > 6 ? '#7A4A06' : '#B97A0C'}">${L}</text>`).join('');
    return `<svg class="rc-letra" viewBox="0 0 753 702" aria-hidden="true">
      <defs>
        <radialGradient id="${id}l" cx="50%" cy="42%" r="50%"><stop offset="0" stop-color="#FFFBE6"/><stop offset=".35" stop-color="#FFE48A"/><stop offset=".62" stop-color="#F7C548" stop-opacity=".95"/><stop offset=".8" stop-color="#F4B73C" stop-opacity=".55"/><stop offset="1" stop-color="#F4B73C" stop-opacity="0"/></radialGradient>
        <linearGradient id="${id}g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFF6B8"/><stop offset=".45" stop-color="#FFD43B"/><stop offset="1" stop-color="#F0A410"/></linearGradient>
      </defs>
      <ellipse cx="378" cy="262" rx="168" ry="150" fill="url(#${id}l)"/>
      <g font-family="Fredoka, 'Baloo 2', Andika, sans-serif" font-weight="700" font-size="${fs}" text-anchor="middle" paint-order="stroke" stroke="#14275A" stroke-width="16" stroke-linejoin="round">${vol}
        <text x="378" y="338" fill="url(#${id}g)">${L}</text></g>
      <text x="378" y="338" font-family="Fredoka, Andika, sans-serif" font-weight="700" font-size="${fs}" text-anchor="middle" fill="none" stroke="#FFFBE0" stroke-width="5" stroke-opacity=".75" stroke-dasharray="60 900" stroke-dashoffset="-40">${L}</text>
    </svg>`;
  }

  function selo({ arte = 'selo-meu-nome', letra = null, nivel = 'bronze', tamanho = 320, rotulo = null, mostrarNivel = true } = {}) {
    const el = document.createElement('div');
    el.className = `rc-selo nivel-${nivel}`;
    if (!/^https?:$/.test(location.protocol)) el.classList.add('rc-sem-mascara'); // em file:// o navegador bloqueia máscara com imagem
    el.style.setProperty('--tam', tamanho + 'px');
    el.setAttribute('role', 'img');
    el.setAttribute('aria-label', rotulo || `Selo ${arte.replace(/-/g, ' ')}${letra ? ', letra ' + letra : ''}, nível ${nivel}`);
    pintar(el, arte, letra, nivel, mostrarNivel);
    return el;
  }
  function pintar(el, arte, letra, nivel, mostrarNivel = true) {
    const src = BASE + arte + '.png';
    el.style.setProperty('--arte', `url("${src}")`);
    el.dataset.arte = arte; el.dataset.nivel = nivel;
    const camadas = Array.from({ length: 7 }, (_, i) => `<img class="rc-camada" style="--z:${i + 1}" src="${src}" alt="">`).join('');
    const letraOk = letra && arte === 'selo-meu-nome';
    el.innerHTML = `<div class="rc-raios"></div><div class="rc-aura"></div><div class="rc-sombra"></div>
      <div class="rc-giro">${camadas}<div class="rc-face"><img src="${src}" alt="">${letraOk ? letraSVG(letra) : ''}<i class="rc-shine"></i></div></div>
      ${mostrarNivel ? `<span class="rc-nivel">${NIVEIS[nivel] || nivel}</span>` : ''}`;
    if (!letraOk) el.classList.add('sem-letra');
  }

  function centro(el) { const r = el.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }
  function entrar(el, { confete: c = true } = {}) {
    el.classList.remove('rc-entra'); void el.offsetWidth; el.classList.add('rc-entra');
    if (c && !reduzido()) setTimeout(() => { const [x, y] = centro(el); confete(x, y, { n: 90 }); }, 1150);
    som('selo');
  }
  function subirNivel(el, nivel, arte) {
    if (reduzido()) { pintar(el, arte || el.dataset.arte, null, nivel); el.className = `rc-selo nivel-${nivel}`; return; }
    el.classList.remove('rc-entra', 'rc-sobe'); void el.offsetWidth; el.classList.add('rc-sobe');
    setTimeout(() => { el.classList.remove(`nivel-${el.dataset.nivel}`); el.classList.add(`nivel-${nivel}`); pintar(el, arte || el.dataset.arte, null, nivel); el.classList.add('rc-sobe'); }, 500);
    setTimeout(() => { const [x, y] = centro(el); confete(x, y, { n: 70, cores: nivel === 'diamante' ? ['#9FE3FF', '#FFFFFF', '#A8D5F2', '#E7F7FF'] : null }); som('nivel'); }, 560);
  }

  /* ---------- confete / partículas (canvas) ---------- */
  let cv = null, ctx = null, parts = [], rodando = false;
  function confete(x, y, { n = 80, cores = null, forca = 1 } = {}) {
    if (reduzido()) return;
    if (!cv) { cv = document.createElement('canvas'); cv.className = 'rc-confete'; document.body.appendChild(cv); ctx = cv.getContext('2d'); }
    const d = Math.min(global.devicePixelRatio || 1, 2); cv.width = innerWidth * d; cv.height = innerHeight * d; ctx.setTransform(d, 0, 0, d, 0, 0);
    const pal = cores || CORES;
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, v = (4 + Math.random() * 8) * forca;
      parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 5, g: 0.22 + Math.random() * 0.1, r: 4 + Math.random() * 6, rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4,
        cor: pal[i % pal.length], forma: i % 3, vida: 1, dec: 0.008 + Math.random() * 0.008 });
    }
    if (!rodando) { rodando = true; requestAnimationFrame(passo); }
  }
  function estrela(r) { ctx.beginPath(); for (let i = 0; i < 10; i++) { const a = (i * Math.PI) / 5 - Math.PI / 2, rr = i % 2 ? r * 0.45 : r; ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } ctx.closePath(); ctx.fill(); }
  function passo() {
    ctx.clearRect(0, 0, cv.width, cv.height);
    parts = parts.filter((p) => p.vida > 0 && p.y < innerHeight + 40);
    for (const p of parts) {
      p.vy += p.g; p.vx *= 0.985; p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.vida -= p.dec;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.globalAlpha = Math.max(0, Math.min(1, p.vida * 1.6)); ctx.fillStyle = p.cor;
      if (p.cor === '#FFFFFF' || p.cor === '#1B3160') { ctx.shadowColor = '#F4B73C'; ctx.shadowBlur = 6; }
      if (p.forma === 0) estrela(p.r); else if (p.forma === 1) { ctx.beginPath(); ctx.arc(0, 0, p.r * 0.6, 0, 7); ctx.fill(); } else ctx.fillRect(-p.r, -p.r * 0.35, p.r * 2, p.r * 0.7 * Math.abs(Math.cos(p.rot * 2)) + 1);
      ctx.restore();
    }
    if (parts.length) requestAnimationFrame(passo); else { rodando = false; ctx.clearRect(0, 0, cv.width, cv.height); }
  }

  /* ---------- moedinhas em arco até o cofrinho ---------- */
  function moedasVoam({ de, para, n = 10, aoChegar = () => {}, intervalo = 110, img = 'moeda-voando' } = {}) {
    const [x0, y0] = Array.isArray(de) ? de : centro(de), alvo = Array.isArray(para) ? para : centro(para);
    if (reduzido()) { for (let i = 0; i < n; i++) aoChegar(i); return Promise.resolve(); }
    const vai = (i) => new Promise((ok) => {
      const m = document.createElement('img'); m.className = 'rc-moeda-voa'; m.src = BASE + img + '.png'; m.alt = '';
      document.body.appendChild(m);
      const sx = x0 + (Math.random() - 0.5) * 80, sy = y0 + (Math.random() - 0.5) * 40, [x1, y1] = [alvo[0], alvo[1] - 10];
      const cx = (sx + x1) / 2 + (Math.random() - 0.5) * 120, cy = Math.min(sy, y1) - 180 - Math.random() * 80; // arco alto
      const k = []; const N = 16;
      for (let s = 0; s <= N; s++) {
        const t = s / N, u = 1 - t, x = u * u * sx + 2 * u * t * cx + t * t * x1, y = u * u * sy + 2 * u * t * cy + t * t * y1;
        const esc = t < 0.15 ? 0.4 + t * 5 : 1.15 - t * 0.55;
        k.push({ transform: `translate(${x - 27}px, ${y - 27}px) rotateY(${t * 1080}deg) scale(${esc})`, opacity: t > 0.96 ? 0 : 1 });
      }
      const a = m.animate(k, { duration: 900 + Math.random() * 200, easing: 'cubic-bezier(.35,0,.6,1)', fill: 'forwards' });
      a.onfinish = () => { m.remove(); aoChegar(i); som('moeda', i); ok(); };
    });
    const todas = [];
    for (let i = 0; i < n; i++) todas.push(new Promise((r) => setTimeout(() => vai(i).then(r), i * intervalo)));
    return Promise.all(todas);
  }
  function engolir(elCofrinho) { elCofrinho.classList.remove('rc-engole'); void elCofrinho.offsetWidth; elCofrinho.classList.add('rc-engole'); }
  function contar(el, de, ate, ms = 600) {
    if (reduzido()) { el.textContent = ate; return; }
    const t0 = performance.now();
    const f = (t) => { const k = Math.min(1, (t - t0) / ms); el.textContent = Math.round(de + (ate - de) * k); if (k < 1) requestAnimationFrame(f); };
    requestAnimationFrame(f);
    const pai = el.closest('.rc-contador'); if (pai) { pai.classList.remove('rc-pula'); void pai.offsetWidth; pai.classList.add('rc-pula'); }
  }

  function abrirBau(el) {
    el.classList.remove('rc-abre'); el.classList.add('rc-fechado'); void el.offsetWidth;
    el.classList.remove('rc-fechado'); el.classList.add('rc-abre');
    if (!reduzido()) setTimeout(() => { const r = el.getBoundingClientRect(); confete(r.left + r.width / 2, r.top + r.height * 0.35, { n: 70, forca: 0.9 }); som('nivel'); }, 750);
  }
  function trofeu(el) {
    el.classList.remove('rc-sobe'); void el.offsetWidth; el.classList.add('rc-sobe');
    if (!reduzido()) setTimeout(() => { const [x, y] = centro(el); confete(x, y - 40, { n: 110 }); som('selo'); }, 1500);
  }

  /* ---------- sons curtinhos sintetizados (WebAudio). No produto: efeitos gravados. ---------- */
  let ac = null;
  function som(tipo, i = 0) {
    if (global.RECOMPENSAS_MUDO) return;
    try {
      ac = ac || new (global.AudioContext || global.webkitAudioContext)();
      const t = ac.currentTime, notas = { moeda: [1318 + (i % 4) * 110, 1760], selo: [523, 659, 784, 1046], nivel: [659, 880, 1175] }[tipo] || [880];
      notas.forEach((f, k) => {
        const o = ac.createOscillator(), g = ac.createGain(); o.type = tipo === 'moeda' ? 'triangle' : 'sine'; o.frequency.value = f;
        const t0 = t + k * (tipo === 'moeda' ? 0.06 : 0.11);
        g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(tipo === 'moeda' ? 0.08 : 0.12, t0 + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.35);
        o.connect(g); g.connect(ac.destination); o.start(t0); o.stop(t0 + 0.4);
      });
    } catch (e) { /* sem áudio */ }
  }

  global.Recompensas = { BASE, selo, pintar, entrar, subirNivel, confete, moedasVoam, engolir, contar, abrirBau, trofeu, som, reduzido };
})(window);
