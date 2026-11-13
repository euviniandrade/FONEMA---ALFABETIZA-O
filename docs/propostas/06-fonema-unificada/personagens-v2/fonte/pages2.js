// FONEMA · personagens v2 — páginas (pranchas). node render.js [nome]
const { P, defs, page, groundShadow, uid, rng } = require('./core');
const S = require('./sofia');
const BO = require('./boca');

const TAG = 'FONEMA · personagens v2 · uniforme e sem adornos';
const header = (w, title, sub) => `<text x="60" y="78" font-family="Fredoka" font-weight="700" font-size="44" fill="${P.ink}">${title}</text>
  <text x="62" y="116" font-family="Andika" font-size="20" fill="${P.slate}">${sub}</text>
  <text x="${w - 60}" y="78" text-anchor="end" font-family="Fredoka" font-weight="600" font-size="20" fill="${P.mango}">${TAG}</text>`;
const svgPage = (W, H, inner, bg = P.cream) => ({ w: W, h: H, html: page(W, H, `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${defs()}${BO.bocaDefs()}<rect width="${W}" height="${H}" fill="${bg}"/>${inner}</svg>`) });

// ---------- ícones simples ----------
const ico = {
  lips: c => `<path d="M-14,0 Q-7,-8 0,-4 Q7,-8 14,0 Q7,9 0,8 Q-7,9 -14,0Z" fill="${c}"/><path d="M-14,0 Q0,3 14,0" stroke="#fff" stroke-width="1.6" fill="none"/>`,
  air: c => `<path d="M-14,-5 H6 a5,5 0 1 0 -5,-5 M-14,2 H10 a5,5 0 1 1 -5,5" fill="none" stroke="${c}" stroke-width="3" stroke-linecap="round"/>`,
  voice: (c, on) => `<path d="M-4,-12 V12" stroke="${c}" stroke-width="3" stroke-linecap="round"/>${on ? `<path d="M4,-8 q5,8 0,16 M10,-12 q8,12 0,24" stroke="${c}" stroke-width="3" fill="none" stroke-linecap="round"/>` : `<path d="M4,-6 l10,12 M14,-6 l-10,12" stroke="${c}" stroke-width="3" stroke-linecap="round"/>`}`,
  hand: c => `<path d="M-10,10 V-6 a3,3 0 0 1 6,0 V-10 a3,3 0 0 1 6,0 V-6 a3,3 0 0 1 6,0 V4 q0,10 -10,10 h-2 q-6,0 -9,-6 l-5,-8 a3,3 0 0 1 5,-3z" fill="${c}"/>`,
};

function infoCard(k, w = 560, h = 500) {
  const D = BO.SONS[k], vowel = k === 'a';
  const col = vowel ? P.vowel : P.cons;
  let g = `<rect width="${w}" height="${h}" rx="34" fill="#fff" stroke="${P.line}" stroke-opacity=".1" stroke-width="2"/>`;
  g += `<text x="34" y="116" font-family="Andika" font-weight="700" font-size="112" fill="${P.ink}">${D.L.split(' ')[0]}<tspan dx="14" fill="${col}">${D.L.split(' ')[1]}</tspan></text>`;
  g += `<g transform="translate(${w - 186},40)"><rect width="152" height="60" rx="30" fill="${P.sky}"/><path d="M24,23 h8 l11,-8 v30 l-11,-8 h-8z" fill="${P.cons}"/><path d="M50,22 q6,8 0,16" fill="none" stroke="${P.cons}" stroke-width="3.4" stroke-linecap="round"/><text x="100" y="41" text-anchor="middle" font-family="Andika" font-weight="700" font-size="32" fill="${P.cons}">/${k}/</text></g>`;
  g += `<g transform="translate(${w - 186},112)"><rect width="152" height="30" rx="15" fill="${P.peach}"/><text x="76" y="21" text-anchor="middle" font-family="Andika" font-weight="700" font-size="15" fill="#9C4A10">${D.par}</text></g>`;
  // palavra
  const word = D.word.map((l, i) => `<tspan fill="${'AEIOU'.includes(l) ? P.vowel : P.cons}" ${i === 0 ? 'text-decoration="underline"' : ''}>${l}</tspan>`).join('');
  g += `<text x="36" y="172" font-family="Andika" font-weight="700" font-size="38" letter-spacing="3">${word}</text>`;
  // 3 pistas
  const rows = [
    [ico.lips(P.vowel), 'Lábios', D.lab, '#FDEBE4'],
    [ico.air(BO.K.air), 'Ar', D.ar, '#E6F0FF'],
    [ico.voice(D.voz ? '#B07500' : P.slate, D.voz), 'Garganta', D.voz ? 'vibra (som com voz)' : 'quieta (só sopro)', D.voz ? '#FFF2CC' : '#EEF0F5'],
    [ico.hand('#2F7D4F'), 'Teste', D.teste, '#E6F4EA'],
  ];
  rows.forEach(([ic, a, b, bg], i) => {
    g += `<g transform="translate(30,${190 + i * 47})"><rect width="${w - 60}" height="40" rx="20" fill="${bg}"/><g transform="translate(28,20)">${ic}</g>
      <text x="56" y="27" font-family="Andika" font-weight="700" font-size="18" fill="${P.ink}">${a}:</text><text x="${56 + a.length * 10 + 14}" y="27" font-family="Andika" font-size="18" fill="${P.ink}">${b}</text></g>`;
  });
  // dica lúdica com a Sofia
  g += `<g transform="translate(30,${h - 120})"><rect width="${w - 60}" height="104" rx="26" fill="#FFF6DA" stroke="${P.ipe}" stroke-width="2.5"/>
      <g transform="translate(52,58) scale(.25) translate(0,-268)">${S.sofiaHead(S.EXPR.alegre)}</g>
      <text x="110" y="28" font-family="Fredoka" font-weight="600" font-size="16" fill="#9C6A00" letter-spacing="1">DICA DA SOFIA</text>
      ${wrap(D.dica, 42).map((t, i) => `<text x="110" y="${52 + i * 22}" font-family="Andika" font-size="18.5" fill="${P.ink}">${t}</text>`).join('')}</g>`;
  return g;
}
function wrap(t, n) { const out = []; let cur = ''; for (const w of t.split(' ')) { if ((cur + ' ' + w).trim().length > n) { out.push(cur.trim()); cur = w; } else cur += ' ' + w; } if (cur.trim()) out.push(cur.trim()); return out; }

function bocaRow(k, y) {
  let g = `<g transform="translate(40,${y})"><rect width="1760" height="560" rx="40" fill="#FFFBF4" stroke="${P.line}" stroke-opacity=".08" stroke-width="2"/>`;
  g += `<g transform="translate(24,30)">${BO.frontal(k, 560, 500)}<g transform="translate(20,466)"><rect width="196" height="34" rx="17" fill="#fff" opacity=".92"/><text x="98" y="23" text-anchor="middle" font-family="Andika" font-weight="700" font-size="17" fill="${P.ink}">a boca da Sofia · /${k}/</text></g></g>`;
  g += `<g transform="translate(600,30) scale(.926)">${BO.sagittal(k)}</g><g transform="translate(620,496)"><rect width="196" height="34" rx="17" fill="#fff" opacity=".92"/><text x="98" y="23" text-anchor="middle" font-family="Andika" font-weight="700" font-size="17" fill="${P.ink}">por dentro (de lado)</text></g>`;
  g += `<g transform="translate(1176,30)">${infoCard(k, 560, 500)}</g></g>`;
  return g;
}
function bocaPlate(list, title, sub) {
  const W = 1840, H = 160 + list.length * 590 + 60;
  let g = header(W, title, sub);
  list.forEach((k, i) => g += bocaRow(k, 150 + i * 590));
  g += `<text x="60" y="${H - 28}" font-family="Andika" font-size="16" fill="${P.slate}">Legenda: <tspan fill="${BO.K.air}" font-weight="700">· · ➜ caminho do ar</tspan> · <tspan fill="#B07500" font-weight="700">))) garganta vibra</tspan> · <tspan fill="${P.vowel}" font-weight="700">⊘ véu fecha o nariz</tspan> · camadas separadas (lábios, dentes, língua, mandíbula, véu, ar, vibração) para animar no Rive · validar com 2 fonoaudiólogas.</text>`;
  return svgPage(W, H, g);
}
module.exports = {
  'boca-zoom-m-p-b': () => bocaPlate(['m', 'p', 'b'], 'Zoom na boca · /m/ /p/ /b/', 'Os três sons dos lábios: /m/ sai pelo nariz; /p/ e /b/ seguram o ar e soltam (o /b/ com a garganta vibrando)'),
  'boca-zoom-f-v': () => bocaPlate(['f', 'v'], 'Zoom na boca · /f/ /v/', 'Dentes de cima no lábio de baixo: /f/ é só sopro, /v/ é sopro com a garganta vibrando'),
  'boca-zoom-s-l-a': () => bocaPlate(['s', 'l', 'a'], 'Zoom na boca · /s/ /l/ /a/', 'Língua em ação: chiado nos dentes (/s/), ponta da língua no céu da boca (/l/) e boca bem aberta (/a/)'),
};
