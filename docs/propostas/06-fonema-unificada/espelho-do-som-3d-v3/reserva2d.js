/* FONEMA · Espelho do Som (v3) — RESERVA sem WebGL: as duas vistas desenhadas em 2D (canvas), com a mesma pose.
 * É simples de propósito: mostra lábios, dentes, língua, véu, voz e ar para o som não ficar sem boca. */
const TAU = Math.PI * 2;
const CORP = { sofia: ['#C98F66', '#D2566A'], tales: ['#F2C3A2', '#E8707F'] };

function caixa(x, r, fundo) {
  x.save(); x.beginPath(); x.rect(r.x, r.y, r.w, r.h); x.clip();
  const g = x.createLinearGradient(0, r.y, 0, r.y + r.h); g.addColorStop(0, fundo[0]); g.addColorStop(1, fundo[1]);
  x.fillStyle = g; x.fillRect(r.x, r.y, r.w, r.h);
}

export function desenhar2D(x, P, p, e, fo, [rf, rl], quem, tempo) {
  const [pele, labio] = CORP[quem] || CORP.sofia;
  x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, x.canvas.width, x.canvas.height);
  /* ---- frente ---- */
  if (rf.w > 4 && rf.h > 4) {
    caixa(x, rf, ['#E4F2FF', '#F6FBFF']);
    const s = Math.min(rf.w / 8, rf.h / 7), cx = rf.x + rf.w / 2, cy = rf.y + rf.h * 0.52;
    x.translate(cx, cy); x.scale(s, -s);
    x.fillStyle = pele; x.beginPath(); x.ellipse(0, 1.4, 5.4, 5.6, 0, 0, TAU); x.fill();
    x.fillStyle = 'rgba(224,122,110,.35)'; for (const d of [-1, 1]) { x.beginPath(); x.ellipse(d * 3.1, 0.9, 1.1, 0.8, 0, 0, TAU); x.fill(); }
    x.fillStyle = 'rgba(0,0,0,.12)'; x.beginPath(); x.ellipse(0, 2.0, 0.55, 0.4, 0, 0, TAU); x.fill();
    const hu = p.ab * 0.4 * (1 - p.ld) + 0.36 * p.ld, hl = p.ab * 0.6 * (1 - p.ld) + 0.03 * p.ld, w = Math.max(0.25, p.lg), tu = 0.42 * (1 + 0.3 * p.arr), tl = 0.56 * (1 + 0.3 * p.arr);
    const boca = () => { x.beginPath(); x.moveTo(-w, 0); x.quadraticCurveTo(0, hu * 2, w, 0); x.quadraticCurveTo(0, -hl * 2, -w, 0); x.closePath(); };
    x.fillStyle = labio; x.beginPath(); x.moveTo(-w - 0.12, 0); x.bezierCurveTo(-w * 0.4, hu + tu * 1.5, w * 0.4, hu + tu * 1.5, w + 0.12, 0); x.bezierCurveTo(w * 0.5, -hl - tl * 1.6, -w * 0.5, -hl - tl * 1.6, -w - 0.12, 0); x.fill();
    x.save(); boca(); x.clip();
    x.fillStyle = '#5A1428'; x.fillRect(-3, -3, 6, 6);
    x.fillStyle = '#F2607C'; x.beginPath(); x.ellipse(0, -hl - 0.1 + (p.lin[0][1] > 0.2 ? 0.5 : 0), w * 0.8, 0.5, 0, 0, TAU); x.fill();
    x.fillStyle = '#FFFDF6'; x.beginPath(); x.roundRect(-1.5, -0.05, 3, 0.7, 0.18); x.fill();
    const jd = 5.4 * Math.sin(p.jaw * Math.PI / 180); x.beginPath(); x.roundRect(-1.3, -0.62 - jd, 2.6, 0.6, 0.18); x.fill();
    x.restore(); x.restore();
  }
  /* ---- lado ---- */
  if (rl.w > 4 && rl.h > 4) {
    x.setTransform(1, 0, 0, 1, 0, 0);
    caixa(x, rl, ['#FFF6E2', '#FFEBD2']);
    const s = Math.min(rl.w / 11.4, rl.h / 12.2), cx = rl.x + rl.w / 2, cy = rl.y + rl.h / 2;
    x.translate(cx, cy); x.scale(-s, -s); x.translate(2.35, 0.45); // rosto olhando para a esquerda; eixos (z, y)
    x.fillStyle = 'rgba(160,215,255,.5)'; x.strokeStyle = '#4AA8EE'; x.lineWidth = 0.14;
    x.beginPath(); x.ellipse(-6, 2.5, 6.7, 6.9, 0, 0, TAU); x.fill(); x.stroke();
    x.beginPath(); x.ellipse(0.75, 2.1, 0.75, 0.6, 0, 0, TAU); x.fill(); x.stroke();
    x.fillRect(-8.1, -9, 5.1, 6); 
    x.strokeStyle = '#F7A48F'; x.lineWidth = 0.5; x.lineCap = 'round'; x.lineJoin = 'round';
    x.beginPath(); P.CEU.forEach((q, i) => (i ? x.lineTo(q[0], q[1] + 0.25) : x.moveTo(q[0], q[1] + 0.25))); x.stroke();
    x.strokeStyle = '#D9508A'; x.beginPath(); x.moveTo(-3.8, 1.5); x.quadraticCurveTo(-4.4, 1.5 - p.vel * 0.3, -5.05 + p.vel * 0.65, 1.12 - p.vel * 0.95); x.stroke();
    const R = (q) => { const g = P.giraMand(q, p.jaw); return [q[0] + (g[0] - q[0]) * p.tj, q[1] + (g[1] - q[1]) * p.tj]; };
    const L = p.lin.map(R), f0 = P.giraMand([-1.15, -1.3], p.jaw), f1 = P.giraMand([-4.35, -3.0], p.jaw);
    x.fillStyle = '#F2607C'; x.beginPath(); x.moveTo(L[0][0], L[0][1] - 0.3);
    x.lineTo(L[0][0], L[0][1]); for (let i = 1; i < L.length; i++) { const a = L[i - 1], b = L[i]; x.quadraticCurveTo(a[0], a[1], (a[0] + b[0]) / 2, (a[1] + b[1]) / 2); }
    x.lineTo(L[5][0], L[5][1]); x.lineTo(f1[0], f1[1]); x.lineTo(f0[0], f0[1]); x.closePath(); x.fill();
    x.fillStyle = '#FFFDF6'; x.beginPath(); x.roundRect(-0.44, -0.05, 0.3, 0.66, 0.1); x.fill();
    const jd = 5.4 * Math.sin(p.jaw * Math.PI / 180); x.beginPath(); x.roundRect(-0.74, -0.52 - jd, 0.26, 0.52, 0.1); x.fill();
    const hu = p.ab * 0.4, hl = p.ab * 0.6; x.fillStyle = labio;
    x.beginPath(); x.ellipse(0.3 + p.arr * 0.4, hu + 0.25, 0.42, 0.3, 0, 0, TAU); x.fill();
    x.beginPath(); x.ellipse(0.26 + p.arr * 0.4 - p.ld * 0.3, -hl - 0.3 + p.ld * 0.2, 0.44, 0.34, 0, 0, TAU); x.fill();
    x.fillStyle = e.voz > 0.3 ? '#FFB629' : '#B9C2D6'; x.beginPath(); x.ellipse(-4.9 + (e.voz > 0.3 ? 0.06 * Math.sin(tempo * 60) : 0), -4.25, 0.8, 0.5, 0, 0, TAU); x.fill();
    if (e.ar > 0.2 && fo.ar !== 'nenhum') {
      x.fillStyle = '#23B7FF';
      const nasal = p.vel > 0.5;
      for (let k = 0; k < 6; k++) { const u = ((tempo * 0.6 + k / 6) % 1); x.globalAlpha = 1 - u; x.beginPath(); if (nasal) x.arc(1.2 + u * 2.2, 0.9 - u * 1.6, 0.16, 0, TAU); else x.arc(0.9 + u * 3, (hu - hl) / 2 - u * 0.6 + 0.3 * Math.sin(k * 2.1), 0.16, 0, TAU); x.fill(); }
      x.globalAlpha = 1;
    }
    x.restore();
  }
  x.setTransform(1, 0, 0, 1, 0, 0);
}
