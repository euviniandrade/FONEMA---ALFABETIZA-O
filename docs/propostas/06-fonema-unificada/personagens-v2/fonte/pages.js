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
  g += `<text x="34" y="104" font-family="Andika" font-weight="700" font-size="100" fill="${P.ink}">${D.L.split(' ')[0]}<tspan dx="14" fill="${col}">${D.L.split(' ')[1]}</tspan></text>`;
  g += `<g transform="translate(${w - 186},40)"><rect width="152" height="60" rx="30" fill="${P.sky}"/><path d="M24,23 h8 l11,-8 v30 l-11,-8 h-8z" fill="${P.cons}"/><path d="M50,22 q6,8 0,16" fill="none" stroke="${P.cons}" stroke-width="3.4" stroke-linecap="round"/><text x="100" y="41" text-anchor="middle" font-family="Andika" font-weight="700" font-size="32" fill="${P.cons}">/${k}/</text></g>`;
  g += `<g transform="translate(${w - 186},112)"><rect width="152" height="30" rx="15" fill="${P.peach}"/><text x="76" y="21" text-anchor="middle" font-family="Andika" font-weight="700" font-size="15" fill="#9C4A10">${D.par}</text></g>`;
  // palavra
  const word = D.word.map((l, i) => `<tspan fill="${'AEIOU'.includes(l) ? P.vowel : P.cons}" ${i === 0 ? 'text-decoration="underline"' : ''}>${l}</tspan>`).join('');
  g += `<text x="36" y="174" font-family="Andika" font-weight="700" font-size="38" letter-spacing="3">${word}</text>`;
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

// =========================== TELA DE LIÇÃO v2 ===========================
const B = require('./bolota');
function mala(x, y, s = 1) {
  return `<g transform="translate(${x},${y}) scale(${s})">
    <path d="M-30,-58 v-16 q0,-12 12,-12 h36 q12,0 12,12 v16" fill="none" stroke="${P.line}" stroke-width="13" stroke-linecap="round"/><path d="M-30,-58 v-16 q0,-12 12,-12 h36 q12,0 12,12 v16" fill="none" stroke="#8A4B2A" stroke-width="7" stroke-linecap="round"/>
    <rect x="-86" y="-60" width="172" height="118" rx="22" fill="#E2603F" stroke="${P.line}" stroke-width="4.5"/>
    <rect x="-86" y="-60" width="172" height="40" rx="20" fill="#F07A55"/><rect x="-86" y="-60" width="172" height="118" rx="22" fill="none" stroke="${P.line}" stroke-width="4.5"/>
    <rect x="-54" y="-60" width="16" height="118" fill="#B9472C" stroke="${P.line}" stroke-width="3"/><rect x="38" y="-60" width="16" height="118" fill="#B9472C" stroke="${P.line}" stroke-width="3"/>
    <circle cx="-8" cy="10" r="15" fill="${P.ipe}" stroke="${P.line}" stroke-width="3"/><ellipse cx="-56" cy="-44" rx="18" ry="6" fill="#fff" opacity=".35"/></g>`;
}
function telaEspelho2() {
  const W = 1280, H = 800;
  let g = `<rect width="${W}" height="${H}" fill="#EAF0FB"/>
    <g filter="url(#blur12)" opacity=".55"><rect x="0" y="520" width="${W}" height="280" fill="#E9C9A0"/><rect x="60" y="90" width="260" height="300" rx="20" fill="#BFE3EC"/><rect x="980" y="80" width="240" height="320" rx="20" fill="#BFE3EC"/><circle cx="1200" cy="560" r="120" fill="#8CC084"/></g>
    <rect width="${W}" height="${H}" fill="#FFF8EC" opacity=".6"/>`;
  const btn = (x, y, inner) => `<g transform="translate(${x},${y})"><rect width="64" height="64" rx="20" fill="#fff" stroke="${P.line}" stroke-opacity=".12" stroke-width="2"/>${inner}</g>`;
  g += btn(24, 18, `<path d="M15,34 L32,19 L49,34 V49 Q49,51 47,51 H38 V40 H26 V51 H17 Q15,51 15,49Z" fill="${P.cons}"/>`);
  g += btn(W - 88, 18, `<path d="M24,20 a13,13 0 0 1 20,11 c0,7 -7,9 -7,16 a5,5 0 0 1 -11,0" fill="none" stroke="${P.cons}" stroke-width="4.5" stroke-linecap="round"/><path d="M47,22 q6,8 0,17 M53,17 q10,13 0,28" fill="none" stroke="${P.cons}" stroke-width="4" stroke-linecap="round"/>`);
  g += `<g transform="translate(${W / 2 - 130},26)"><rect width="260" height="46" rx="23" fill="#fff" opacity=".9"/>${[0, 1, 2, 3, 4, 5].map(i => i < 2 ? `<circle cx="${32 + i * 39}" cy="23" r="11" fill="${P.ipe}"/>` : i === 2 ? `<circle cx="${32 + i * 39}" cy="23" r="14" fill="#fff" stroke="${P.focus}" stroke-width="5"/>` : `<circle cx="${32 + i * 39}" cy="23" r="9" fill="#D7DCEB"/>`).join('')}</g>`;
  g += `<rect x="16" y="96" width="${W - 32}" height="690" rx="40" fill="#FFFBF4" stroke="${P.line}" stroke-opacity=".08" stroke-width="2"/>`;
  // Sofia (lado esquerdo), apontando para o Espelho
  g += `<defs><clipPath id="stage"><rect x="16" y="96" width="${W - 32}" height="690" rx="40"/></clipPath></defs><g clip-path="url(#stage)"><g transform="translate(138,330) scale(.56)">${S.sofia({ expr: { eyes: 'open', mouth: 6, b: [-8, 0, -8, 0], look: [6, 0], blush: 1 }, letter: 'M', armR: { t: [250, 470], hand: 'point', hrot: -20 } })}</g></g>`;
  g += `<g transform="translate(34,116)"><rect width="230" height="168" rx="26" fill="#fff" stroke="${P.line}" stroke-opacity=".12" stroke-width="2"/><path d="M96,166 l14,22 l16,-24z" fill="#fff"/>
    <text x="20" y="42" font-size="21" fill="${P.ink}">Fecha os lábios…</text><text x="20" y="72" font-size="21" fill="${P.ink}">o som sai</text><text x="20" y="100" font-size="21" fill="${P.ink}">pelo nariz:</text><text x="20" y="142" font-size="32" font-weight="700" fill="${P.cons}">mmmm!</text>
    <g transform="translate(188,130)"><circle r="20" fill="${P.sky}"/><path d="M-7,-9 L9,0 L-7,9Z" fill="${P.cons}"/></g></g>`;
  // ESPELHO DO SOM (grande)
  const ex = 284, ey = 120, ew = 776, eh = 494;
  g += `<rect x="${ex}" y="${ey}" width="${ew}" height="${eh}" rx="36" fill="#F7E3B5"/><rect x="${ex + 8}" y="${ey + 8}" width="${ew - 16}" height="${eh - 16}" rx="30" fill="#FFFDF8" stroke="#E8C36A" stroke-width="3"/>
    <g transform="translate(${ex + ew / 2 - 120},${ey - 20})"><rect width="240" height="44" rx="22" fill="${P.focus}"/><text x="120" y="30" text-anchor="middle" font-family="Fredoka" font-weight="600" font-size="23" fill="#fff">Espelho do Som</text></g>`;
  g += `<g transform="translate(${ex + 24},${ey + 36})">${BO.frontal('m', 352, 360, { k: 1.18 })}<g transform="translate(14,322)"><rect width="150" height="28" rx="14" fill="#fff" opacity=".92"/><text x="75" y="19" text-anchor="middle" font-size="15.5" font-weight="700" fill="${P.ink}">boca da Sofia</text></g></g>`;
  g += `<g transform="translate(${ex + 390},${ey + 36}) scale(.6)">${BO.sagittal('m', { labels: false })}</g>`;
  g += `<g transform="translate(${ex + 404},${ey + 358})"><rect width="140" height="28" rx="14" fill="#fff" opacity=".92"/><text x="70" y="19" text-anchor="middle" font-size="15.5" font-weight="700" fill="${P.ink}">por dentro</text></g>`;
  g += `<g transform="translate(${ex + 404},${ey + 46})"><rect width="150" height="30" rx="15" fill="#fff" stroke="${BO.K.air}" stroke-opacity=".4" stroke-width="2"/><text x="75" y="21" text-anchor="middle" font-size="15.5" font-weight="700" fill="${BO.K.air}">ar pelo nariz</text></g>
    <g transform="translate(${ex + 404},${ey + 84})"><rect width="150" height="30" rx="15" fill="#fff" stroke="#C2416B" stroke-opacity=".4" stroke-width="2"/><text x="75" y="21" text-anchor="middle" font-size="15.5" font-weight="700" fill="#C2416B">véu aberto</text></g>`;
  // linha do tempo
  const tl = ex + 30, ty = ey + 414;
  g += `<g transform="translate(${tl},${ty})"><circle cx="24" cy="24" r="24" fill="${P.cons}"/><path d="M16,13 L35,24 L16,35Z" fill="#fff"/>
    <rect x="66" y="18" width="560" height="12" rx="6" fill="#E3E7F3"/><rect x="66" y="18" width="230" height="12" rx="6" fill="${P.cons}" opacity=".85"/><circle cx="296" cy="24" r="13" fill="#fff" stroke="${P.cons}" stroke-width="5"/>
    ${[['1 · lábios fecham', 66], ['2 · ar pelo nariz', 250], ['3 · abre: MA', 520]].map(([t, x]) => `<text x="${x}" y="60" font-size="15" fill="${P.slate}">${t}</text>`).join('')}
    <g transform="translate(646,6)"><rect width="38" height="36" rx="12" fill="${P.sky}"/><text x="19" y="24" text-anchor="middle" font-family="Fredoka" font-weight="600" font-size="15" fill="${P.cons}">½×</text></g>
    <g transform="translate(692,6)"><rect width="38" height="36" rx="12" fill="${P.sky}"/><path d="M12,18 a8,8 0 1 1 3,7 M11,12 v7 h7" fill="none" stroke="${P.cons}" stroke-width="3" stroke-linecap="round"/></g></g>`;
  // letra e palavra (coluna direita)
  const rx = 1076;
  g += `<g transform="translate(${rx},120)"><rect width="176" height="250" rx="30" fill="#fff" stroke="${P.line}" stroke-opacity=".1" stroke-width="2"/>
    <text x="88" y="146" text-anchor="middle" font-family="Andika" font-weight="700" font-size="92" fill="${P.ink}">M<tspan dx="4" fill="${P.cons}">m</tspan></text>
    <g transform="translate(28,184)"><rect width="120" height="44" rx="22" fill="${P.sky}"/><path d="M18,17 h6 l8,-6 v22 l-8,-6 h-6z" fill="${P.cons}"/><path d="M37,16 q4,6 0,12" fill="none" stroke="${P.cons}" stroke-width="3" stroke-linecap="round"/><text x="72" y="31" text-anchor="middle" font-family="Andika" font-weight="700" font-size="26" fill="${P.cons}">/m/</text></g></g>`;
  g += `<g transform="translate(${rx},386)"><rect width="176" height="228" rx="30" fill="#fff" stroke="${P.line}" stroke-opacity=".1" stroke-width="2"/>${mala(88, 100, .62)}
    <text x="88" y="196" text-anchor="middle" font-family="Andika" font-weight="700" font-size="42" fill="${P.cons}">M<tspan fill="${P.vowel}">A</tspan><tspan fill="${P.cons}">L</tspan><tspan fill="${P.vowel}">A</tspan></text>
    <path d="M38,212 h46 M92,212 h46" stroke="${P.ok}" stroke-width="5" stroke-linecap="round" opacity=".6"/></g>`;
  // sua vez
  const by = 628;
  g += `<g transform="translate(300,${by})"><ellipse cx="72" cy="70" rx="70" ry="70" fill="#C98A4B" stroke="${P.line}" stroke-width="3"/><ellipse cx="72" cy="70" rx="58" ry="58" fill="#DCEBF5"/>
     <ellipse cx="72" cy="96" rx="40" ry="26" fill="#B9CCDD"/><circle cx="72" cy="60" r="24" fill="#B9CCDD"/><ellipse cx="72" cy="66" rx="16" ry="10" fill="none" stroke="#fff" stroke-width="3" stroke-dasharray="5 5"/>
     <path d="M32,32 q16,-16 40,-18" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".7" fill="none"/>
     <text x="72" y="156" text-anchor="middle" font-size="13.5" fill="${P.slate}">seu espelho · não grava</text></g>`;
  g += `<g transform="translate(484,${by + 6})"><rect x="-8" y="-8" width="148" height="148" rx="46" fill="#DFF1E5"/><rect width="132" height="132" rx="40" fill="#2FA35B"/><rect y="120" width="132" height="12" rx="6" fill="#22814A" opacity=".8"/>
     <rect x="51" y="26" width="30" height="50" rx="15" fill="#fff"/><path d="M38,64 a28,28 0 0 0 56,0 M66,92 v14 M50,108 h32" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round"/></g>`;
  g += `<g transform="translate(652,${by + 46})"><text font-family="Andika" font-size="31" fill="${P.ink}"><tspan font-weight="700">Sua vez!</tspan> Fale <tspan font-weight="700" fill="${P.cons}">mmmm</tspan></text><text y="38" font-family="Andika" font-size="31" fill="${P.ink}">com a mão no nariz.</text>
     <text y="72" font-size="15.5" fill="${P.slate}">sua voz não é gravada · tocar no botão também vale</text></g>`;
  g += `${groundShadow(1180, 770, 60)}<g transform="translate(1160,768) scale(.34)">${B.bolota({ pose: 'read', eyes: 'open', look: [-3, 2] })}</g>`;
  return { w: W, h: H, html: page(W, H, `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${defs()}${BO.bocaDefs()}${g}</svg>`) };
}
module.exports['tela-espelho-do-som-v2'] = telaEspelho2;

// =========================== SOFIA v2 ===========================
const swatch = (x, y, c, name, role) => `<g transform="translate(${x},${y})"><rect width="50" height="50" rx="14" fill="${c}" stroke="${P.line}" stroke-opacity=".25" stroke-width="2"/><text x="64" y="21" font-family="Andika" font-weight="700" font-size="16.5" fill="${P.ink}">${name} <tspan font-weight="400" fill="${P.slate}">${c.toUpperCase()}</tspan></text><text x="64" y="42" font-family="Andika" font-size="14.5" fill="${P.slate}">${role}</text></g>`;
function sofiaFolha() {
  const W = 1800, H = 1100, sc = 0.66, base = 960;
  const views = [['FRENTE', 250, S.sofia({ expr: 'neutra' })], ['TRÊS-QUARTOS', 570, S.sofia({ expr: 'alegre', turn: 1 })], ['PERFIL', 880, S.sofiaSide()], ['COSTAS', 1180, S.sofiaBack()]];
  let g = header(W, 'Sofia · folha-modelo com uniforme', 'Frente, três-quartos, perfil e costas · polo do uniforme FONEMA, bermuda azul-marinho, tênis · sem joias nem adornos');
  for (let i = 0; i <= 4; i++) { const y = base - i * 250 * sc; g += `<line x1="90" x2="1340" y1="${y}" y2="${y}" stroke="${P.slate}" stroke-opacity=".18" stroke-dasharray="6 8"/><text x="72" y="${y + 6}" text-anchor="end" font-size="15" fill="${P.slate}">${i}</text>`; }
  g += `<text x="40" y="${base - 1000 * sc - 18}" font-size="15" fill="${P.slate}">cabeças</text>`;
  for (const [lab, x, svg] of views) {
    g += groundShadow(x, base + 4, 120) + `<g transform="translate(${x},${base - 1000 * sc}) scale(${sc})">${svg}</g>`;
    g += `<text x="${x}" y="${base + 52}" text-anchor="middle" font-family="Fredoka" font-weight="600" font-size="20" fill="${P.ink}" letter-spacing="2">${lab}</text>`;
  }
  // detalhe do rosto e do emblema
  g += `<g transform="translate(1370,150)"><rect width="0" height="0"/></g>`;
  const px = 1380;
  let side = `<rect x="${px}" y="146" width="380" height="904" rx="28" fill="#FFFDF7" stroke="${P.line}" stroke-opacity=".12" stroke-width="2"/>
    <text x="${px + 24}" y="190" font-family="Fredoka" font-weight="600" font-size="23" fill="${P.ink}">Detalhes do uniforme</text>
    <g transform="translate(${px + 24},206)"><rect width="160" height="160" rx="22" fill="${P.polo}" stroke="${P.line}" stroke-opacity=".15" stroke-width="2"/><g transform="translate(80,60) scale(1.65)">${S.emblem('M')}</g></g>
    <g transform="translate(${px + 196},206)"><rect width="160" height="160" rx="22" fill="${P.sky}"/><defs><clipPath id="fz"><rect width="160" height="160" rx="22"/></clipPath></defs><g clip-path="url(#fz)"><g transform="translate(80,-48) scale(.55)">${S.sofiaHead(S.EXPR.alegre)}</g></g></g>
    <text x="${px + 104}" y="388" text-anchor="middle" font-size="14" fill="${P.slate}">emblema bordado</text><text x="${px + 276}" y="388" text-anchor="middle" font-size="14" fill="${P.slate}">rosto sem adornos</text>`;
  const sw = [[P.skin, 'Pele', 'luz #C48A62 · sombra #7E4E33'], [P.hair, 'Cabelo', 'cachos 3C/4A soltos · brilho #6B4130'], [P.polo, 'Polo do uniforme', 'branca · sombra #DCD6C9'], [P.shirt, 'Gola e mangas Manga', 'cor-assinatura da Sofia'], [P.shorts, 'Bermuda do uniforme', 'azul-marinho · faixa Manga'], [P.pack, 'Mochila escolar', 'material, não adorno · #38A090'], [P.lace, 'Tênis', 'branco, sola verde Mata'], [P.line, 'Contorno', 'nunca preto puro']];
  sw.forEach(([c, n, r], i) => side += swatch(px + 24, 410 + i * 60, c, n, r));
  side += `<text x="${px + 24}" y="906" font-family="Fredoka" font-weight="600" font-size="19" fill="${P.ink}">Regra v2 · sem adornos</text>
    ${['Sem brincos, pulseira, miçangas, fivela ou laço.', 'A identidade vem do rosto, do cabelo,', 'do uniforme e da cor Manga.', 'Cabelo solto; se preso, só elástico liso', 'da cor do cabelo.'].map((t, i) => `<text x="${px + 24}" y="${934 + i * 22}" font-size="15" fill="${P.slate}">${t}</text>`).join('')}`;
  g += side + `<text x="90" y="1072" font-size="16" fill="${P.slate}">Sofia, ~9–10 anos · parda · 4 cabeças de altura · olhos na metade da cabeça · mãos de 4 dedos · contorno 3,5–4 px a 1000 px · luz de cima à esquerda.</text>`;
  return svgPage(W, H, g);
}
function sofiaExpr() {
  const W = 1800, H = 1130;
  const list = [
    ['alegre', 'Alegre', '"que bom te ver!"', {}],
    ['orgulhosa', 'Orgulhosa do esforço', '"foi devagarinho e deu certo!"', { armR: { t: [60, 470], hand: 'thumb', bend: 'out', hrot: 90, flip: -1 } }],
    ['curiosa', 'Curiosa', 'apresenta um som novo', {}],
    ['pensativa', 'Pensativa', '"hmm, deixa eu pensar…"', { armR: { t: [44, 392], hand: 'fist', hrot: 190 } }],
    ['surpresa', 'Surpresa alegre', 'acerto inesperado', {}],
    ['encorajadora', 'Encorajadora', '"vamos tentar juntas?"', {}],
    ['calma', 'Calma · respirando', 'pausa e regulação', {}],
    ['empatica', 'Empática', '"esse som é difícil mesmo"', {}],
    ['rindo', 'Rindo', 'humor leve, nunca da criança', {}],
    ['concentrada', 'Concentrada', 'traçando a letra', {}],
    ['escutando', 'Escutando', 'espera 3–5 s pela criança', { armL: { t: [-146, 292], hand: 'open', hrot: 250, bend: 'in' } }],
    ['comemorando', 'Comemorando', 'só no fim do bloco', { armL: { t: [-170, 230], hand: 'open', hrot: 160 }, armR: { t: [170, 230], hand: 'open', hrot: 200 } }],
  ];
  const cw = 272, ch = 452, x0 = 64, y0 = 150;
  let g = header(W, 'Sofia · 12 expressões (uniforme)', 'Busto para ler bem o rosto · elogia esforço e estratégia · nunca chantagem emocional, decepção ou comparação');
  list.forEach(([k, name, use, extra], i) => {
    const c = i % 6, r = Math.floor(i / 6), x = x0 + c * (cw + 14), y = y0 + r * (ch + 18), id = 'ex' + i;
    g += `<g transform="translate(${x},${y})"><rect width="${cw}" height="${ch}" rx="26" fill="${i % 2 ? '#FFF4E4' : '#FFFBF4'}" stroke="${P.line}" stroke-opacity=".1" stroke-width="2"/>
      <defs><clipPath id="${id}"><rect width="${cw}" height="${ch - 84}" rx="26"/></clipPath></defs>
      <g clip-path="url(#${id})"><rect width="${cw}" height="${ch - 84}" fill="${[P.sky, P.mint, P.peach][i % 3]}"/><circle cx="${cw}" cy="0" r="120" fill="#fff" opacity=".35"/><g transform="translate(${cw / 2},${-2}) scale(.62)">${S.sofia({ expr: k, letter: 'A', ...extra })}</g></g>
      <text x="${cw / 2}" y="${ch - 48}" text-anchor="middle" font-family="Fredoka" font-weight="600" font-size="20" fill="${P.ink}">${i + 1}. ${name}</text>
      <text x="${cw / 2}" y="${ch - 22}" text-anchor="middle" font-size="15" fill="${P.slate}">${use}</text></g>`;
  });
  g += `<text x="64" y="${H - 20}" font-size="16" fill="${P.slate}">Regra: parada e atenta enquanto a criança responde. "Empática" acolhe a dificuldade da tarefa e nunca culpa a criança. Nenhum adorno aparece em nenhuma expressão.</text>`;
  return svgPage(W, H, g);
}
const waves = (x, y, n = 3, rot = 0, col = P.ipeSh) => `<g transform="translate(${x},${y}) rotate(${rot})">${Array.from({ length: n }, (_, i) => `<path d="M${14 + i * 14},-${10 + i * 7} q8,${10 + i * 7} 0,${20 + i * 14}" fill="none" stroke="${col}" stroke-width="5" stroke-linecap="round" opacity="${1 - i * 0.22}"/>`).join('')}</g>`;
function letterCard(x, y, L, s = 1, col = P.cons) { return `<g transform="translate(${x},${y}) scale(${s})"><rect x="-62" y="-70" width="124" height="140" rx="28" fill="#fff" stroke="${P.line}" stroke-width="4"/><rect x="-62" y="52" width="124" height="18" rx="9" fill="${P.sky}"/><text y="34" text-anchor="middle" font-family="Andika" font-weight="700" font-size="104" fill="${col}">${L}</text></g>`; }
function confetti(seed, n, cx, cy, R) { const r = rng(seed); let g = ''; for (let i = 0; i < n; i++) { const a = r() * 6.28, d = R * (0.4 + r() * 0.6); const c = [P.ipe, P.mango, P.cons, P.ok, P.focus, P.vowel][i % 6]; g += `<rect x="-6" y="-3" width="12" height="6" rx="3" fill="${c}" transform="translate(${(cx + Math.cos(a) * d).toFixed(1)},${(cy + Math.sin(a) * d * 0.7).toFixed(1)}) rotate(${(r() * 180).toFixed(0)})"/>`; } return g; }
function sofiaPoses() {
  const W = 1800, H = 1290;
  const poses = [
    ['Apontar para a letra', 'gesto que guia a atenção', { expr: 'alegre', turn: 1, armR: { t: [236, 300], hand: 'point', hrot: -50, bend: 'out' }, headTilt: 6, letter: 'M' }, letterCard(330, 200, 'M', 0.9)],
    ['Mão no pescoço', 'som com voz: "a garganta vibra"', { expr: { eyes: 'open', mouth: 7, b: [-8, 0, -8, 0] }, letter: 'V', armR: { t: [34, 404], hand: 'open', hrot: 172, bend: 'out', flip: 1 } }, waves(-36, 408, 3, 180) + waves(84, 408, 3, 0) + `<text x="236" y="250" font-family="Andika" font-weight="700" font-size="56" fill="${P.cons}">/v/</text>`],
    ['Dedo no nariz', 'som nasal: "o ar sai pelo nariz"', { expr: { eyes: 'open', mouth: 6, b: [-6, 0, -6, 0], look: [-3, 0] }, letter: 'M', armR: { t: [50, 318], hand: 'point', hrot: -150, bend: 'out' } }, `<path d="M-150,290 q-30,-6 -60,0 M-150,312 q-30,6 -60,22" fill="none" stroke="#5C93E6" stroke-width="6" stroke-linecap="round" stroke-dasharray="2 12"/><text x="236" y="250" font-family="Andika" font-weight="700" font-size="56" fill="${P.cons}">/m/</text>`],
    ['Ouvir', 'espera a criança, mão em concha', { expr: 'escutando', letter: 'A', armL: { t: [-150, 292], hand: 'open', hrot: 250, bend: 'in' } }, waves(-220, 270, 3, 180, P.focus)],
    ['Celebrar', 'só no fim do bloco · brilho ≤ 1,5 s', { expr: 'comemorando', letter: 'A', legs: 'jump', armL: { t: [-180, 210], hand: 'wave', hrot: 160 }, armR: { t: [180, 210], hand: 'wave', hrot: 200 } }, confetti(5, 26, 0, 200, 260)],
    ['Explicar', 'olha para a tarefa, palmas abertas', { expr: 'falando', letter: 'A', armL: { t: [-196, 520], hand: 'open', hrot: 140, bend: 'in' }, armR: { t: [196, 520], hand: 'open', hrot: 40, bend: 'in' } }, ''],
    ['Convidar', '"agora você!" passa a vez', { expr: 'encorajadora', letter: 'A', turn: 1, armR: { t: [230, 470], hand: 'open', hrot: -10, bend: 'in' } }, `<circle cx="300" cy="460" r="30" fill="${P.ok}" opacity=".18"/><circle cx="300" cy="460" r="16" fill="${P.ok}" opacity=".35"/>`],
    ['Despedir', '"amanhã tem mais!"', { expr: 'alegre', letter: 'A', headTilt: -6, armR: { t: [188, 250], hand: 'wave', hrot: -100, bend: 'out' } }, `<path d="M250,200 q16,-14 30,0 M262,170 q16,-14 30,0" fill="none" stroke="${P.ipeSh}" stroke-width="5" stroke-linecap="round"/>`],
  ];
  const cw = 404, ch = 520, x0 = 64, y0 = 150;
  let g = header(W, 'Sofia · 8 poses de ensino (uniforme)', 'Cada gesto reforça a articulação e vira um estado da máquina "corpo" no Rive · mochila escolar sempre nas costas');
  poses.forEach(([name, use, o, extra], i) => {
    const c = i % 4, r = Math.floor(i / 4), x = x0 + c * (cw + 18), y = y0 + r * (ch + 18);
    g += `<g transform="translate(${x},${y})"><rect width="${cw}" height="${ch}" rx="28" fill="${i % 2 ? '#FFF4E4' : '#FFFBF4'}" stroke="${P.line}" stroke-opacity=".1" stroke-width="2"/>
      ${groundShadow(cw / 2, 438, 110)}<g transform="translate(${cw / 2 - (o.turn ? 30 : 0)},${-18}) scale(.455)">${S.sofia(o)}${extra}</g>
      <text x="${cw / 2}" y="${ch - 50}" text-anchor="middle" font-family="Fredoka" font-weight="600" font-size="23" fill="${P.ink}">${i + 1}. ${name}</text>
      <text x="${cw / 2}" y="${ch - 22}" text-anchor="middle" font-size="16" fill="${P.slate}">${use}</text></g>`;
  });
  g += `<text x="64" y="${H - 22}" font-size="16" fill="${P.slate}">Gestos são ganchos de memória: som + boca + letra sempre juntos. Nenhum gesto de enfeite durante a resposta da criança.</text>`;
  return svgPage(W, H, g);
}
module.exports['sofia-uniforme-folha-modelo'] = sofiaFolha;
module.exports['sofia-uniforme-expressoes'] = sofiaExpr;
module.exports['sofia-uniforme-poses'] = sofiaPoses;

// =========================== ANIMAIS ===========================
const AN = require('./animais');
const B2 = require('./bolota');
const FAUNA = [
  ['caramelo', 'Paçoca', 'cachorro caramelo', 'Acompanha a carteira Carla nas entregas. Leal e animado.', '/p/ PAÇOCA · AU-AU', .78, 0],
  ['gatinha', 'Nina', 'gatinha tigrada', 'Mora na biblioteca da Jaci e dorme no colo de quem lê.', '/n/ NINA · MIAU', .9, 0],
  ['papagaio', 'Loro', 'papagaio-verdadeiro', 'Repete os sons: é o jogo do eco ("fala comigo: mmm!").', '/l/ LORO · LÁ-LÁ', .82, 0],
  ['jabuti', 'Dona Lenta', 'jabuti-piranga', 'Ensina a falar devagar e esticar o som: sssapo.', '/ʒ/ JABUTI · DEVAGAR', .9, -40],
  ['capivara', 'Capi', 'capivara', 'Guardiã do lago. Respira fundo com a criança antes da lição.', '/k/ CAPI · CALMA', .76, -40],
  ['mico', 'Faísca', 'mico-leão-dourado', 'Rápido nas rimas e nos trava-línguas da Mata Atlântica.', '/f/ FAÍSCA · FOLHA', .86, 0],
  ['galinha', 'Dona Cocó', 'galinha caipira', 'Bate as asas em cada sílaba: co-có-ri-có!', '/g/ GALINHA · sílabas', .96, 0],
  ['burrinho', 'Fubá', 'burrinho', 'Carrega os livros da biblioteca itinerante pela vila.', '/b/ BURRO · LIVROS', .64, -60],
];
function animaisPage() {
  const W = 1840, H = 1400;
  let g = header(W, 'Animais da vila · 8 amigos + Bolota', 'Cada animal tem nome, personalidade e uma função nas lições · sem coleiras enfeitadas nem roupinhas');
  const cw = 422, ch = 520;
  FAUNA.forEach(([k, nome, esp, desc, sons, sc, dx], i) => {
    const c = i % 4, r = Math.floor(i / 4), x = 60 + c * (cw + 18), y = 150 + r * (ch + 22), id = 'an' + i;
    g += `<g transform="translate(${x},${y})"><rect width="${cw}" height="${ch}" rx="30" fill="#fff" stroke="${P.line}" stroke-opacity=".1" stroke-width="2"/>
      <defs><clipPath id="${id}"><rect width="${cw}" height="340" rx="30"/></clipPath></defs><g clip-path="url(#${id})"><rect width="${cw}" height="340" fill="${[P.mint, P.peach, P.sky, '#F3EEDC'][i % 4]}"/><ellipse cx="${cw / 2}" cy="330" rx="260" ry="50" fill="#fff" opacity=".45"/>
      <g transform="translate(${cw / 2 + dx},316) scale(${sc})">${AN.ANIMAIS[k]()}</g></g>
      <text x="26" y="384" font-family="Fredoka" font-weight="700" font-size="28" fill="${P.ink}">${nome}</text>
      <text x="${cw - 26}" y="384" text-anchor="end" font-family="Andika" font-weight="700" font-size="16" fill="${P.mango}">${esp}</text>
      ${wrap(desc, 46).map((t, j) => `<text x="26" y="${416 + j * 23}" font-size="16.5" fill="${P.slate}">${t}</text>`).join('')}
      <g transform="translate(26,${ch - 54})"><rect width="${cw - 52}" height="36" rx="18" fill="${P.sky}"/><text x="${(cw - 52) / 2}" y="24" text-anchor="middle" font-family="Andika" font-weight="700" font-size="16" fill="${P.cons}">${sons}</text></g></g>`;
  });
  g += `<g transform="translate(60,1252)"><rect width="1720" height="110" rx="30" fill="#fff" stroke="${P.line}" stroke-opacity=".1" stroke-width="2"/><g transform="translate(90,96) scale(.26)">${B2.bolota({ eyes: 'open', mouth: 'open', look: [3, -2] })}</g>
    <text x="190" y="46" font-family="Fredoka" font-weight="700" font-size="26" fill="${P.ink}">Bolota <tspan font-family="Andika" font-size="16" fill="${P.mango}">tatu-bola · parceiro da criança</tspan></text>
    <text x="190" y="80" font-size="16.5" fill="${P.slate}">O único que erra de propósito (troca p/b, f/v) para a criança corrigir. Os animais nunca competem com a letra na tela: aparecem em cenas, histórias e no fim do bloco.</text></g>`;
  g += `<text x="60" y="${H - 8}" font-size="1" fill="${P.slate}">Bolota (tatu-bola) continua o parceiro principal da criança: o único que erra de propósito. Os animais nunca competem com a letra na tela e aparecem em cenas, histórias e reforços de fim de bloco.</text>`;
  return svgPage(W, H, g);
}
module.exports['animais-da-vila'] = animaisPage;

// =========================== ELENCO · PROFISSÕES ===========================
const PE = require('./people');
const L0 = P.line;
const prop = {
  balde: (x, y) => `<g transform="translate(${x},${y})"><path d="M-30,-20 Q0,-60 30,-20" fill="none" stroke="${L0}" stroke-width="5"/><path d="M-36,-20 L-28,50 Q0,58 28,50 L36,-20Z" fill="#D12F2A" stroke="${L0}" stroke-width="4"/><ellipse cx="0" cy="-20" rx="36" ry="9" fill="#7FB7E8" stroke="${L0}" stroke-width="3.4"/><path d="M-26,10 h52" stroke="#F4C430" stroke-width="6"/></g>`,
  cesta: (x, y) => `<g transform="translate(${x},${y})"><path d="M-60,-30 Q0,-110 60,-30" fill="none" stroke="${L0}" stroke-width="9"/><path d="M-60,-30 Q0,-110 60,-30" fill="none" stroke="#C99A5A" stroke-width="5"/>
     <path d="M-30,-40 l-6,-36 l10,4 l4,-12 l6,14" fill="#4FA34A" stroke="${L0}" stroke-width="2.4"/><path d="M-36,-34 L-20,-10 L-14,-36Z" fill="#F28C28" stroke="${L0}" stroke-width="2.6"/><circle cx="16" cy="-36" r="22" fill="#5DB65A" stroke="${L0}" stroke-width="3"/><path d="M6,-40 q10,-8 20,0" stroke="#3F8A3C" stroke-width="3" fill="none"/><ellipse cx="44" cy="-30" rx="16" ry="13" fill="#E26D2A" stroke="${L0}" stroke-width="3"/>
     <path d="M-66,-30 L-54,30 Q0,40 54,30 L66,-30Z" fill="#C99A5A" stroke="${L0}" stroke-width="4"/><path d="M-62,-10 H62 M-58,10 H58" stroke="#A47A42" stroke-width="4"/></g>`,
  vara: (x, y) => `<g transform="translate(${x},${y})"><path d="M0,0 L120,-330" stroke="${L0}" stroke-width="11" stroke-linecap="round"/><path d="M0,0 L120,-330" stroke="#9C6A3E" stroke-width="6" stroke-linecap="round"/><path d="M120,-330 Q150,-200 140,-120" stroke="#5B5A72" stroke-width="2" fill="none"/>
     <g transform="translate(140,-90) rotate(80)"><path d="M-34,0 Q0,-26 30,0 Q0,26 -34,0Z" fill="#7FB7E8" stroke="${L0}" stroke-width="3.4"/><path d="M30,0 l18,-14 v28z" fill="#5B9BD8" stroke="${L0}" stroke-width="3"/><circle cx="-18" cy="-4" r="4" fill="${L0}"/></g><circle cx="10" cy="-30" r="12" fill="#5B5A72" stroke="${L0}" stroke-width="3"/></g>`,
  pandeiro: (x, y) => `<g transform="translate(${x},${y}) rotate(-20)"><ellipse rx="56" ry="56" fill="#FFF3D6" stroke="${L0}" stroke-width="5"/><ellipse rx="56" ry="56" fill="none" stroke="#C77B2C" stroke-width="12"/><ellipse rx="56" ry="56" fill="none" stroke="${L0}" stroke-width="3"/>${[0, 72, 144, 216, 288].map(a => `<rect x="-8" y="-62" width="16" height="12" rx="3" fill="#B8BFCC" stroke="${L0}" stroke-width="2" transform="rotate(${a})"/>`).join('')}</g>`,
  bastidor: (x, y) => `<g transform="translate(${x},${y})"><circle r="46" fill="#FFF8EC" stroke="#B5793F" stroke-width="10"/><circle r="46" fill="none" stroke="${L0}" stroke-width="3"/><path d="M-20,10 q10,-30 20,0 q10,-30 20,0" stroke="${P.vowel}" stroke-width="4" fill="none"/><path d="M-16,-14 h32" stroke="${P.cons}" stroke-width="4" stroke-dasharray="4 4"/><path d="M30,-30 l30,-30" stroke="#9AA3B8" stroke-width="3"/></g>`,
  bolsa: (x, y) => `<g><path d="M-62,400 L${x},${y - 30}" stroke="${L0}" stroke-width="16" stroke-linecap="round"/><path d="M-62,400 L${x},${y - 30}" stroke="#2B3E6B" stroke-width="10" stroke-linecap="round"/><g transform="translate(${x},${y})"><rect x="-60" y="-40" width="120" height="90" rx="14" fill="#2B5DB0" stroke="${L0}" stroke-width="4"/><path d="M-60,-40 h120 v30 q-60,20 -120,0z" fill="#1F4A90" stroke="${L0}" stroke-width="3.4"/><rect x="-34" y="-62" width="46" height="34" rx="3" fill="#FFF8EC" stroke="${L0}" stroke-width="2.6" transform="rotate(-8)"/><path d="M-30,-58 l20,14 l20,-14" stroke="${L0}" stroke-width="2" fill="none" transform="rotate(-8)"/></g></g>`,
  carta: (x, y) => `<g transform="translate(${x},${y}) rotate(-12)"><rect x="-34" y="-24" width="68" height="46" rx="5" fill="#FFF8EC" stroke="${L0}" stroke-width="3"/><path d="M-34,-24 L0,4 L34,-24" stroke="${L0}" stroke-width="2.6" fill="none"/><rect x="14" y="-18" width="14" height="14" fill="${P.vowel}"/></g>`,
  prancheta: (x, y) => `<g transform="translate(${x},${y}) rotate(8)"><rect x="-40" y="-54" width="80" height="108" rx="8" fill="#B5793F" stroke="${L0}" stroke-width="3.4"/><rect x="-32" y="-42" width="64" height="88" rx="4" fill="#fff"/><rect x="-16" y="-60" width="32" height="14" rx="4" fill="#8C93AD" stroke="${L0}" stroke-width="2.4"/><path d="M-22,-24 h44 M-22,-8 h44 M-22,8 h30" stroke="#9AA3B8" stroke-width="3"/><path d="M-6,24 h12 M0,18 v12" stroke="#E43D30" stroke-width="4"/></g>`,
  frasco: (x, y) => `<g transform="translate(${x},${y})"><path d="M-10,-50 V-20 L-34,30 Q-38,44 -24,44 H24 Q38,44 34,30 L10,-20 V-50Z" fill="#DFF4FF" stroke="${L0}" stroke-width="3.4"/><path d="M-26,18 H26 L34,30 Q38,44 24,44 H-24 Q-38,44 -34,30Z" fill="#7EE0B0"/><rect x="-14" y="-58" width="28" height="10" rx="3" fill="#8C93AD" stroke="${L0}" stroke-width="2.4"/><circle cx="-6" cy="30" r="4" fill="#fff"/><circle cx="8" cy="22" r="3" fill="#fff"/></g>`,
  volante: (x, y) => `<g transform="translate(${x},${y})"><circle r="44" fill="none" stroke="${L0}" stroke-width="14"/><circle r="44" fill="none" stroke="#3B4256" stroke-width="8"/><path d="M-40,8 L0,0 L40,8 M0,0 V40" stroke="#3B4256" stroke-width="8"/><circle r="12" fill="#F4C430" stroke="${L0}" stroke-width="3"/></g>`,
  mapa: (x, y) => `<g transform="translate(${x},${y}) rotate(-6)"><path d="M-50,-36 L-16,-44 L16,-36 L50,-44 V36 L16,44 L-16,36 L-50,44Z" fill="#F3EBC9" stroke="${L0}" stroke-width="3.2"/><path d="M-16,-44 V36 M16,-36 V44" stroke="#C9B48E" stroke-width="2"/><path d="M-40,20 Q-10,-20 30,10" stroke="#2F7D4F" stroke-width="4" stroke-dasharray="6 5" fill="none"/><path d="M30,10 l-6,-10 l12,0z" fill="#E43D30"/></g>`,
};
const ELENCO2 = [
  { k: 'kenji', nome: 'Seu Kenji', idade: 58, prof: 'padeiro', sons: '/p/ PÃO · PIPOCA · PATO', desc: 'Neto de japoneses, acorda cedo e faz pão de queijo. Paciente: ensina a esperar o pão crescer.',
    p: { skin: '#EBC39C', hair: 'curto', hairColor: '#2A2622', topColor: '#E9E2D4', top: 'apron', bottom: 'pants', bottomColor: '#5B5A72', shoe: '#3A3A4A', hat: 'padeiro', mustache: '#3A3430', expr: { eyes: 'happy', mouth: 'smile' }, armL: { t: [-60, 500], hand: 'open', hrot: 0, bend: 'in' }, armR: { t: [60, 500], hand: 'open', hrot: 180, bend: 'in' } }, front: () => PE.bandeja(0, 480, 1.1) },
  { k: 'jaci', nome: 'Jaci', idade: 35, prof: 'bibliotecária', sons: '/l/ LIVRO · LUA · LOBO', desc: 'Guarani, cuida da biblioteca e da hora do conto. Calma e curiosa, empresta os livros decodificáveis.',
    p: { skin: '#B07A50', hair: 'liso', hairColor: '#17110D', topColor: '#E2A23B', top: 'cardigan', inner: '#2F7D4F', bottom: 'skirt', bottomColor: '#7A4B8E', shoe: '#5C3A26', expr: { eyes: 'open', mouth: 'smile' }, armL: { t: [-40, 560], hand: 'open', hrot: 20, bend: 'in' }, armR: { t: [44, 560], hand: 'open', hrot: 160, bend: 'in' } }, front: () => PE.livros(0, 560, 1) },
  { k: 'rosa', nome: 'Dra. Rosa', idade: 45, prof: 'médica do posto', sons: '/s/ SAÚDE · SOPA · SAPO', desc: 'Atende no posto de saúde da vila. Ensina a lavar as mãos cantando e a abrir a boca bem grande: aaa!',
    p: { skin: '#4A2C1E', hair: 'coque', hairColor: '#1B110C', topColor: '#FBFCFF', top: 'jaleco', inner: '#7FB7E8', bottom: 'pants', bottomColor: '#3D5A8C', shoe: '#F2F2F2', expr: { eyes: 'open', mouth: 'bigSmile' }, armL: { t: [-118, 560], hand: 'open', hrot: 40, bend: 'in' }, armR: { t: [150, 610], hand: 'relax' } }, front: () => prop.prancheta(-100, 560) },
  { k: 'bento', nome: 'Bento', idade: 31, prof: 'bombeiro', sons: '/b/ BOMBEIRO · BALDE · BOLA', desc: 'Corajoso e brincalhão, treina a brigada mirim. Ensina que o /b/ "explode" como uma bolha.',
    p: { skin: '#9A6440', hair: 'fade', hairColor: '#1E1410', topColor: '#C8322B', top: 'bombeiro', bottom: 'pants', bottomColor: '#B02A24', boots: '#2B2A33', hat: 'bombeiro', expr: { eyes: 'open', mouth: 'bigSmile' }, armR: { t: [150, 590], hand: 'fist', hrot: 90 } }, front: () => prop.balde(160, 640) },
  { k: 'carla', nome: 'Carla', idade: 27, prof: 'carteira', sons: '/k/ CARTA · CASA · CAIXA', desc: 'Ruiva e sardenta, conhece cada rua. Leva cartas com palavras para a criança ler na porta das casas.',
    p: { skin: '#F2C9A8', hair: 'rabo', hairColor: '#C4602A', topColor: '#F6C343', top: 'polo', collar: '#2B5DB0', bottom: 'pants', bottomColor: '#2B3E6B', shoe: '#3A3A4A', hat: 'bone', hatColor: '#2B5DB0', expr: { eyes: 'open', mouth: 'smile' }, armR: { t: [214, 300], hand: 'open', hrot: -80, bend: 'out' } }, front: () => prop.bolsa(-96, 620) + prop.carta(236, 250) },
  { k: 'vera', nome: 'Dona Vera', idade: 52, prof: 'agricultora', sons: '/v/ VERDURA · VACA · UVA', desc: 'Planta a horta comunitária. Mostra que cada sementinha, como cada som, precisa de tempo.',
    p: { skin: '#C08458', hair: 'tranca', hairColor: '#2A1A12', topColor: '#C0473B', top: 'xadrez', bottom: 'pants', bottomColor: '#2F5DA8', boots: '#3F6B3A', hat: 'palha', expr: { eyes: 'happy', mouth: 'smile' }, armL: { t: [-40, 560], hand: 'open', hrot: 20, bend: 'in' }, armR: { t: [44, 560], hand: 'open', hrot: 160, bend: 'in' } }, front: () => prop.cesta(0, 600) },
  { k: 'nonato', nome: 'Seu Nonato', idade: 67, prof: 'pescador', sons: '/r/ REDE · REMO · RIO', desc: 'Conta histórias do rio com voz mansa. Ensina rimas de pescador e a respirar antes de falar.',
    p: { skin: '#4E2E1F', hair: 'careca', hairColor: '#E8E3DA', browColor: '#D8D2C8', beard: true, wrinkles: true, topColor: '#9CC7E0', top: 'colete', vest: '#8F7A54', bottom: 'pants', bottomColor: '#6B5B44', shoe: '#5C3A26', hat: 'pescador', expr: { eyes: 'happy', mouth: 'smile' }, armR: { t: [140, 600], hand: 'fist', hrot: 70 } }, front: () => prop.vara(140, 620) },
  { k: 'davi', nome: 'Davi', idade: 28, prof: 'professor de música', sons: '/t/ TAMBOR · TATU · TOM', desc: 'Cadeirante e percussionista. Puxa as canções das letras e marca o ritmo das sílabas no pandeiro.',
    p: { seated: true, skin: '#8D5A3B', hair: 'fade', hairColor: '#1E1410', beard: true, topColor: '#1F7A70', bottomColor: '#2F4E86', shoe: '#F4B400', expr: { eyes: 'open', mouth: 'bigSmile' }, armR: { t: [214, 300], hand: 'open', hrot: -90, bend: 'out' }, armL: { t: [-150, 690], hand: 'fist', hrot: 90 } }, front: () => prop.pandeiro(250, 236) },
  { k: 'lia', nome: 'Lia', idade: 40, prof: 'cientista e inventora', sons: '/i/ IDEIA · ÍMÃ · ILHA', desc: 'Engenheira da oficina. Os óculos de proteção são equipamento de segurança. O robô Tec erra junto.',
    p: { skin: '#3B2419', hair: 'locs', hairColor: '#1B110C', topColor: '#F6E7C9', top: 'overall', overall: '#6D3FC0', bottom: 'pants', bottomColor: '#6D3FC0', shoe: '#F28C28', goggles: true, expr: { eyes: 'open', mouth: 'bigSmile', look: [6, 2] }, armR: { t: [150, 560], hand: 'fist', hrot: 60 } }, front: () => prop.frasco(160, 560) + PE.robo(-200, 960, .5) },
  { k: 'cida', nome: 'Dona Cida', idade: 72, prof: 'artesã (bordadeira)', sons: '/f/ FIO · FITA · FIGO', desc: 'Borda letras em pano e conta causos. Usa bengala e óculos de grau. Ensina parlendas e cantigas.',
    p: { skin: '#5C3A26', hair: 'vovo', hairColor: '#CFC8BE', browColor: '#BDB6AE', topColor: '#9B6FC4', top: 'cardigan', inner: '#F6E7C9', bottom: 'skirt', bottomColor: '#2F7D4F', shoe: '#7A4B2E', glasses: '#8A5A33', wrinkles: true, expr: { eyes: 'happy', mouth: 'smile' }, armR: { t: [168, 760], hand: 'fist', hrot: 90 }, armL: { t: [-60, 540], hand: 'open', hrot: 20, bend: 'in' } },
    front: () => prop.bastidor(-40, 520) + `<path d="M172,760 V1000" stroke="${L0}" stroke-width="16" stroke-linecap="round"/><path d="M172,760 V1000" stroke="#8A5A33" stroke-width="10" stroke-linecap="round"/><path d="M150,752 q22,-14 34,8" stroke="${L0}" stroke-width="14" fill="none" stroke-linecap="round"/><path d="M150,752 q22,-14 34,8" stroke="#8A5A33" stroke-width="8" fill="none" stroke-linecap="round"/>` },
  { k: 'jorge', nome: 'Seu Jorge', idade: 49, prof: 'motorista escolar', sons: '/ʒ/ JANELA · JOGO · JUNTO', desc: 'Pontual e cuidadoso. No caminho da escola, brinca de achar letras nas placas pela janela.',
    p: { skin: '#C58B5E', hair: 'curto', hairColor: '#2A2622', mustache: '#2A2622', topColor: '#BFD9F2', top: 'camisa', bottom: 'pants', bottomColor: '#2B3E6B', shoe: '#2B2A33', hat: 'quepe', expr: { eyes: 'open', mouth: 'smile' }, armR: { t: [188, 250], hand: 'wave', hrot: -100, bend: 'out' } }, front: () => '' },
  { k: 'iara', nome: 'Iara', idade: 26, prof: 'guarda-parque', sons: '/m/ MATA · MICO · MEL', desc: 'Usa aparelho auditivo e conhece cada trilha. Ensina a ouvir os sons da mata.',
    p: { skin: '#B9784E', hair: 'tranca', hairColor: '#17110D', hearingAid: true, topColor: '#A8B47A', top: 'guarda', bottom: 'pants', bottomColor: '#4F6B3A', boots: '#5C3A26', hat: 'guarda', expr: { eyes: 'open', mouth: 'bigSmile' }, armR: { t: [150, 590], hand: 'fist', hrot: 80 } }, front: () => prop.mapa(170, 610) },
];
const cast = c => `${PE.person({ ...c.p, front: c.front() })}`;
function elencoPage() {
  const W = 1840, H = 1440;
  let g = header(W, 'Elenco da vila · 12 moradores e suas profissões', 'Diversidade de idade, cor, origem, corpo e deficiência · todos sem joias e sem adornos (óculos de grau, aparelho auditivo e bengala são acessibilidade)');
  const cw = 280, ch = 610;
  ELENCO2.forEach((c, i) => {
    const col = i % 6, r = Math.floor(i / 6), x = 60 + col * (cw + 12), y = 150 + r * (ch + 22), id = 'el' + i;
    g += `<g transform="translate(${x},${y})"><rect width="${cw}" height="${ch}" rx="28" fill="#fff" stroke="${P.line}" stroke-opacity=".1" stroke-width="2"/>
      <defs><clipPath id="${id}"><rect width="${cw}" height="420" rx="28"/></clipPath></defs><g clip-path="url(#${id})"><rect width="${cw}" height="420" fill="${[P.sky, P.mint, P.peach][i % 3]}"/><ellipse cx="${cw / 2}" cy="410" rx="170" ry="34" fill="#fff" opacity=".5"/>
      ${groundShadow(cw / 2, 404, 90)}<g transform="translate(${cw / 2},${404 - 1000 * .4}) scale(.4)">${cast(c)}</g></g>
      <text x="20" y="458" font-family="Fredoka" font-weight="700" font-size="25" fill="${P.ink}">${c.nome}</text>
      <text x="20" y="484" font-family="Andika" font-weight="700" font-size="15" fill="${P.mango}">${c.idade} anos · ${c.prof}</text>
      ${wrap(c.desc, 34).slice(0, 4).map((t, j) => `<text x="20" y="${510 + j * 20}" font-size="14.5" fill="${P.slate}">${t}</text>`).join('')}
      <g transform="translate(14,${ch - 30})"><rect width="${cw - 28}" height="26" y="-8" rx="13" fill="${P.sky}"/><text x="${(cw - 28) / 2}" y="10" text-anchor="middle" font-family="Andika" font-weight="700" font-size="13.5" fill="${P.cons}">${c.sons}</text></g></g>`;
  });
  g += `<text x="60" y="${H - 22}" font-size="16" fill="${P.slate}">Deficiência como parte da vida, nunca como "lição de superação". Profissões sem estereótipo de gênero. Validar com consultoria de diversidade e com as próprias comunidades.</text>`;
  return svgPage(W, H, g);
}
module.exports['elenco-profissoes'] = elencoPage;
module.exports.ELENCO2 = ELENCO2; module.exports.FAUNA = FAUNA;

// =========================== PRAÇA COM TODOS ===========================
const ENV = require('./env');
function pracaTodos() {
  const W = 1280, H = 800;
  const byK = Object.fromEntries(ELENCO2.map(c => [c.k, c]));
  const pp = (k, x, y, s) => groundShadow(x, y, 110 * s, 16 * s) + `<g transform="translate(${x},${y - 1000 * s}) scale(${s})">${cast(byK[k])}</g>`;
  const an = (k, x, y, s, flip = 1) => `<g transform="translate(${x},${y}) scale(${s * flip},${s})">${AN.ANIMAIS[k]()}</g>`;
  const castFn = () => {
    let g = '';
    // fundo (perto das casas)
    g += pp('kenji', 245, 486, .17) + pp('jaci', 830, 490, .17) + pp('carla', 418, 488, .165);
    g += an('papagaio', 1188, 395, .2) + an('gatinha', 870, 492, .14);
    g += pp('jorge', 1010, 494, .165) + pp('vera', 1150, 610, .19) + an('galinha', 1080, 612, .2, -1);
    // meio
    g += pp('rosa', 120, 600, .19) + pp('bento', 300, 596, .19) + an('caramelo', 380, 600, .2);
    g += an('burrinho', 640, 664, .24) + pp('nonato', 760, 620, .19);
    // frente
    g += pp('cida', 70, 760, .21) + pp('davi', 210, 770, .21) + an('jabuti', 370, 776, .2);
    g += groundShadow(540, 784, 40, 8) + `<g transform="translate(540,${784 - 205}) scale(.205)">${S.sofia({ expr: 'alegre', turn: 1, letter: 'A', armR: { t: [188, 250], hand: 'wave', hrot: -100, bend: 'out' } })}</g>`;
    g += groundShadow(612, 784, 30, 6) + `<g transform="translate(606,782) scale(.15)">${B2.bolota({ eyes: 'open', mouth: 'open', look: [3, -4] })}</g>`;
    g += an('capivara', 720, 786, .26, -1) + pp('lia', 900, 772, .21);
    g += an('mico', 1060, 776, .22) + pp('iara', 1180, 780, .21);
    return g;
  };
  let g = ENV.praca(castFn);
  g += `<g transform="translate(24,22)"><rect width="430" height="70" rx="22" fill="#FFFBF4" opacity=".93"/><text x="22" y="34" font-family="Fredoka" font-weight="700" font-size="24" fill="${P.ink}">Praça da Vila · todo o elenco</text><text x="22" y="58" font-family="Andika" font-size="14.5" fill="${P.slate}">Sofia, Bolota, 12 moradores e 8 animais · sem adornos</text></g>`;
  return { w: W, h: H, html: page(W, H, `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${defs()}${g}</svg>`) };
}
module.exports['elenco-completo-praca'] = pracaTodos;
