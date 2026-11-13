// Bocas da Sofia: expressões + 12 visemas (coordenadas locais, centro da boca em 0,0; largura ~60)
const { P, uid, f } = require('./core');

function openM(w, h, o = {}) {
  const tb = o.tb ?? 4;          // curvatura da borda de cima (positivo = sobe no meio)
  const cy = o.cy ?? 0;          // cantos (negativo = cantos pra cima)
  const id = uid('mc');
  const d = `M${-w / 2},${cy} C${f(-w * 0.22)},${-tb} ${f(w * 0.22)},${-tb} ${w / 2},${cy} C${f(w * 0.46)},${f(h * 1.3)} ${f(-w * 0.46)},${f(h * 1.3)} ${-w / 2},${cy}Z`;
  let inner = `<path d="${d}" fill="url(#gMouth)"/>`;
  if (o.tongue !== false) {
    const ty = o.tongueY ?? h * 0.92, tw = o.tongueW ?? w * 0.34;
    if (o.tongueUp) inner += `<path d="M${-tw},${h * 1.2} C${-tw},${h * 0.3} ${-w * 0.08},${-tb + 3} 0,${-tb + 4} C${w * 0.08},${-tb + 3} ${tw},${h * 0.3} ${tw},${h * 1.2}Z" fill="${P.tongue}"/>`;
    else if (o.tongueBack) inner += `<ellipse cx="0" cy="${f(h * 0.82)}" rx="${f(w * 0.42)}" ry="${f(h * 0.5)}" fill="${P.tongue}"/><ellipse cx="0" cy="${f(h * 0.6)}" rx="${f(w * 0.2)}" ry="${f(h * 0.12)}" fill="#F3A0A4" opacity=".7"/>`;
    else inner += `<ellipse cx="0" cy="${f(ty)}" rx="${f(tw)}" ry="${f(h * 0.32)}" fill="${P.tongue}"/><path d="M0,${f(ty - h * 0.22)} v${f(h * 0.16)}" stroke="#C85A62" stroke-width="1.6" stroke-linecap="round"/>`;
  }
  if (o.top !== false) inner += `<path d="M${-w / 2},${-tb - 4} H${w / 2} V${f((o.topH ?? Math.min(9, h * 0.3)) - tb * 0.4)} Q0,${f((o.topH ?? Math.min(9, h * 0.3)) + 2 - tb * 0.4)} ${-w / 2},${f((o.topH ?? Math.min(9, h * 0.3)) - tb * 0.4)}Z" fill="${P.teeth}"/>`;
  if (o.bottom) inner += `<path d="M${-w / 2},${h + 8} H${w / 2} V${f(h - (o.botH ?? 7))} Q0,${f(h - (o.botH ?? 7) - 2)} ${-w / 2},${f(h - (o.botH ?? 7))}Z" fill="${P.teeth}"/>`;
  if (o.bite) inner += `<path d="M${-w * 0.4},${f(h * 0.5)} H${w * 0.4}" stroke="#E7DCCB" stroke-width="1.4"/>`;
  return `<defs><clipPath id="${id}"><path d="${d}"/></clipPath></defs><g clip-path="url(#${id})">${inner}</g>
  <path d="${d}" fill="none" stroke="${P.line}" stroke-width="3.2" stroke-linejoin="round"/>
  <path d="M${f(-w * 0.22)},${f(h * 1.08 + 5)} Q0,${f(h * 1.08 + 10)} ${f(w * 0.22)},${f(h * 1.08 + 5)}" fill="none" stroke="${P.lip}" stroke-width="3" stroke-linecap="round" opacity=".55"/>`;
}
function roundM(rx, ry, o = {}) {
  const id = uid('mr');
  let inner = `<ellipse cx="0" cy="0" rx="${rx}" ry="${ry}" fill="url(#gMouth)"/>`;
  if (o.tongue !== false) inner += `<ellipse cx="0" cy="${f(ry * 0.75)}" rx="${f(rx * 0.7)}" ry="${f(ry * 0.45)}" fill="${P.tongue}"/>`;
  if (o.top) inner += `<rect x="${-rx}" y="${-ry - 2}" width="${2 * rx}" height="${o.top}" rx="2" fill="${P.teeth}"/>`;
  if (o.bottom) inner += `<rect x="${-rx}" y="${ry - o.bottom + 2}" width="${2 * rx}" height="${o.bottom}" rx="2" fill="${P.teeth}"/>`;
  const lips = o.pucker ? `<ellipse cx="0" cy="0" rx="${rx + o.pucker}" ry="${ry + o.pucker * 0.8}" fill="${P.lip}" opacity=".85" stroke="${P.line}" stroke-width="3"/><ellipse cx="${-rx * 0.2}" cy="${-ry - o.pucker * 0.35}" rx="${rx * 0.5}" ry="${o.pucker * 0.22}" fill="#B56A55" opacity=".8"/>` : '';
  return `${lips}<defs><clipPath id="${id}"><ellipse cx="0" cy="0" rx="${rx}" ry="${ry}"/></clipPath></defs><g clip-path="url(#${id})">${inner}</g><ellipse cx="0" cy="0" rx="${rx}" ry="${ry}" fill="none" stroke="${P.line}" stroke-width="3"/>`;
}
const line = (d, w = 3.6, c = P.line) => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;

// 12 visemas — ver README (agrupamento dos 22 IDs do Azure)
const VISEMAS = [
  { n: 0, nome: 'Repouso', fon: 'pausa' },
  { n: 1, nome: 'Aberta', fon: 'a, ã' },
  { n: 2, nome: 'Média espalhada', fon: 'e, é, ẽ' },
  { n: 3, nome: 'Sorriso fechado', fon: 'i, ĩ' },
  { n: 4, nome: 'Redonda aberta', fon: 'ó, ô' },
  { n: 5, nome: 'Biquinho', fon: 'u, ũ, õ' },
  { n: 6, nome: 'Lábios fechados', fon: 'p, b, m' },
  { n: 7, nome: 'Dentes no lábio', fon: 'f, v' },
  { n: 8, nome: 'Dentes juntos', fon: 's, z' },
  { n: 9, nome: 'Biquinho c/ dentes', fon: 'x/ch, j, tch, dj' },
  { n: 10, nome: 'Língua no céu', fon: 't, d, n, l, r' },
  { n: 11, nome: 'Fundo da boca', fon: 'k, g, rr, nh, lh' },
];
function viseme(n) {
  switch (n) {
    case 0: return line('M-21,0 Q0,7 21,0') + line('M-24,-2 q-3,1 -3,4', 2.4, P.skinSh);
    case 1: return openM(50, 40, { tb: 5, topH: 8 });
    case 2: return openM(60, 22, { tb: 2, topH: 7, tongueY: 22 });
    case 3: return openM(64, 13, { tb: 0, cy: -3, topH: 7, bottom: true, botH: 6, tongue: false });
    case 4: return roundM(19, 24, {});
    case 5: return roundM(8, 9, { pucker: 9, tongue: false });
    case 6: return `<path d="M-26,0 Q-12,-5 0,-3 Q12,-5 26,0 Q12,9 0,8 Q-12,9 -26,0Z" fill="${P.lip}" stroke="${P.line}" stroke-width="3" stroke-linejoin="round"/>` + line('M-25,0 Q0,3 25,0', 2.6) + `<ellipse cx="-6" cy="4.5" rx="8" ry="1.6" fill="#B56A55"/>`;
    case 7: return `<path d="M-25,2 Q0,-2 25,2 Q14,15 0,15 Q-14,15 -25,2Z" fill="${P.lip}" stroke="${P.line}" stroke-width="3" stroke-linejoin="round"/>` +
      `<path d="M-22,-6 Q0,-11 22,-6 L20,3 Q0,6 -20,3Z" fill="url(#gMouth)" stroke="${P.line}" stroke-width="3" stroke-linejoin="round"/><path d="M-17,-5 H17 V3 Q0,5.5 -17,3Z" fill="${P.teeth}"/>` + line('M-8,-5 v8 M0,-5.5 v9 M8,-5 v8', 1, '#E2D6C4');
    case 8: return openM(54, 12, { tb: 0, cy: -2, topH: 6, bottom: true, botH: 6, tongue: false, bite: true });
    case 9: return `<rect x="-20" y="-15" width="40" height="30" rx="14" fill="${P.lip}" stroke="${P.line}" stroke-width="3"/>` + roundM(13, 9, { top: 6, bottom: 6, tongue: false });
    case 10: return openM(48, 24, { tb: 3, topH: 7, tongueUp: true });
    case 11: return openM(46, 26, { tb: 3, topH: 6, tongueBack: true });
  }
}

// bocas de expressão
function mouthExpr(t) {
  switch (t) {
    case 'smile': return line('M-27,-5 Q0,17 27,-5') + line('M-29,-8 q-3,1 -2,5 M29,-8 q3,1 2,5', 2.4, P.skinSh);
    case 'softSmile': return line('M-18,-1 Q0,9 18,-1') ;
    case 'bigSmile': return openM(58, 26, { tb: -2, cy: -6, topH: 8 });
    case 'laugh': return openM(62, 36, { tb: -3, cy: -8, topH: 9 });
    case 'o': return roundM(13, 17, {});
    case 'oSmall': return roundM(8, 10, { tongue: false });
    case 'proud': return line('M-24,-3 Q-4,13 22,-7') + line('M23,-10 q4,2 2,6', 2.4, P.skinSh);
    case 'hmm': return line('M-14,2 Q2,-2 16,3', 3.4);
    case 'breath': return roundM(7, 6, { tongue: false });
    case 'kind': return line('M-17,2 Q0,8 17,2', 3.4);
    case 'focus': return line('M-12,1 Q0,4 12,1', 3.4) + `<path d="M8,2 q7,1 9,7 q-5,3 -9,-3z" fill="${P.tongue}" stroke="${P.line}" stroke-width="2.4" stroke-linejoin="round"/>`;
    case 'listen': return line('M-14,0 Q0,7 14,0', 3.4);
    case 'cheer': return openM(60, 40, { tb: -2, cy: -8, topH: 9 });
    case 'talk': return openM(40, 20, { tb: 2, topH: 7 });
    default: if (typeof t === 'number') return viseme(t); return line('M-20,0 Q0,8 20,0');
  }
}

module.exports = { viseme, mouthExpr, VISEMAS, openM, roundM };
