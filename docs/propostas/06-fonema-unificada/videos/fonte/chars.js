// Personagens desenhados em SVG: Sofia (parda, ~9–10 anos, cabelo cacheado volumoso) e Bolota (filhote de tatu-bola).
const INK = '#1F1D3D';
function rng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }

function sofiaSVG(opts = {}) {
  const letter = opts.letter || 'm';
  const R = rng(7);
  const SK = '#B47B57', SK2 = '#96603F', HAIR = '#2C1911', HAIR2 = '#5B3423', HAIRHI = '#7A4A30';
  const back = [];
  for (let i = 0; i < 26; i++) {
    const a = Math.PI * (0.98 + i / 25 * 1.04);
    const rx = 138 + R() * 8, ry = 140 + R() * 8;
    back.push([200 + Math.cos(a) * rx * 0.98, 190 + Math.sin(a) * ry * 0.92, 40 + R() * 14]);
  }
  for (let i = 0; i < 4; i++) { back.push([70 + i * 9, 222 + i * 24, 36 - i * 2]); back.push([330 - i * 9, 222 + i * 24, 36 - i * 2]); }
  back.push([200, 150, 120], [140, 200, 80], [260, 200, 80], [200, 90, 90]);
  const circ = (c) => `<circle cx="${c[0].toFixed(1)}" cy="${c[1].toFixed(1)}" r="${c[2].toFixed(1)}"/>`;
  const curls = [];
  const R2 = rng(11);
  for (let i = 0; i < 46; i++) {
    const a = Math.PI * (0.95 + R2() * 1.1), rr = 100 + R2() * 62;
    const x = 200 + Math.cos(a) * rr, y = 185 + Math.sin(a) * rr * 0.95;
    if (x > 118 && x < 282 && y > 100 && y < 290) continue;
    const s = 7 + R2() * 7, rot = R2() * 360;
    curls.push(`<path d="M${(x - s).toFixed(1)},${y.toFixed(1)} a${s},${s} 0 1,1 ${(s * 1.4).toFixed(1)},${(s * .9).toFixed(1)}" transform="rotate(${rot.toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})" stroke="${R2() > .5 ? HAIR2 : HAIRHI}" stroke-width="3.2" fill="none" stroke-linecap="round"/>`);
  }
  const fringe = [];
  for (let i = 0; i < 9; i++) { const x = 128 + i * 18; fringe.push([x, 112 + Math.abs(i - 4) * 3 + (i % 2) * 6, 22 + (i % 3) * 3]); }
  fringe.push([150, 92, 30], [200, 84, 34], [250, 92, 30]);
  const fcurls = fringe.map(c => `<path d="M${c[0] - 8},${c[1] + 2} a8,8 0 1,1 10,8" stroke="${HAIRHI}" stroke-width="3" fill="none" stroke-linecap="round"/>`).join('');

  const arm = `<g class="arm">
      <path d="M-22,-8 C-26,30 -24,62 -18,92 L18,92 C22,62 22,30 18,-8 Z" fill="${SK}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
      <path d="M-30,-6 C-34,14 -32,32 -28,46 Q0,54 28,46 C32,30 32,10 26,-10 C14,-30 -18,-30 -30,-6Z" fill="#FF6B3D" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
      <g class="hand-point" transform="translate(0,104)">
        <path d="M-5,6 L-5,58 a7,7 0 0 0 14,0 L9,6Z" fill="${SK}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
        <ellipse cx="0" cy="4" rx="21" ry="19" fill="${SK}" stroke="${INK}" stroke-width="4"/>
        <path d="M-12,-2 q8,6 18,2" stroke="${SK2}" stroke-width="3" fill="none" stroke-linecap="round"/>
      </g>
      <g class="hand-fist" transform="translate(0,104)" style="display:none">
        <ellipse cx="0" cy="6" rx="20" ry="20" fill="${SK}" stroke="${INK}" stroke-width="4"/>
        <path d="M-10,0 q10,7 20,0" stroke="${SK2}" stroke-width="3" fill="none" stroke-linecap="round"/>
      </g>
      <g class="hand-open" transform="translate(0,104)" style="display:none">
        <g fill="${SK}" stroke="${INK}" stroke-width="4" stroke-linejoin="round">
          <rect x="-21" y="14" width="11" height="34" rx="5.5" transform="rotate(14 -15 14)"/>
          <rect x="-8" y="18" width="11" height="40" rx="5.5" transform="rotate(4 -3 18)"/>
          <rect x="5" y="16" width="11" height="38" rx="5.5" transform="rotate(-6 10 16)"/>
          <rect x="16" y="10" width="10" height="30" rx="5" transform="rotate(-18 21 10)"/>
          <rect x="-34" y="-6" width="11" height="28" rx="5.5" transform="rotate(52 -28 -6)"/>
        </g>
        <path d="M-22,-8 C-26,8 -24,26 -14,32 C0,38 16,34 22,24 C28,12 24,-4 20,-10Z" fill="${SK}"/>
        <path d="M-22,-8 C-26,8 -24,26 -14,32 M22,24 C28,12 24,-4 20,-10" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>
      </g>
    </g>`;

  return `<svg class="sofia" viewBox="0 0 400 560" xmlns="http://www.w3.org/2000/svg" overflow="visible">
  <g class="s-all">
    <g fill="${INK}" stroke="${INK}" stroke-width="9">${back.map(circ).join('')}</g>
    <g fill="${HAIR}">${back.map(circ).join('')}</g>
    <g>${curls.join('')}</g>
    <path d="M176,250 L176,322 Q200,336 224,322 L224,250Z" fill="${SK2}" stroke="${INK}" stroke-width="4"/>
    <path d="M78,560 C78,430 104,352 162,334 Q200,352 238,334 C296,352 322,430 322,560Z" fill="#FF6B3D" stroke="${INK}" stroke-width="4.5" stroke-linejoin="round"/>
    <path d="M162,334 Q200,366 238,334" fill="none" stroke="${INK}" stroke-width="4"/>
    <path d="M170,338 Q200,358 230,338" fill="none" stroke="#FFB08F" stroke-width="5" stroke-linecap="round"/>
    <path d="M110,420 Q118,480 112,560" fill="none" stroke="#E2502A" stroke-width="6" stroke-linecap="round" opacity=".7"/>
    <circle cx="200" cy="448" r="40" fill="#FFF8EC" stroke="${INK}" stroke-width="4"/>
    <text x="200" y="468" text-anchor="middle" font-family="Andika" font-weight="700" font-size="58" fill="#C2307A">${letter}</text>
    <g transform="translate(266,392)"><circle r="15" fill="#FFC83D" stroke="${INK}" stroke-width="3"/><circle cx="-5" cy="-2" r="5" fill="#fff" stroke="${INK}" stroke-width="2"/><circle cx="5" cy="-2" r="5" fill="#fff" stroke="${INK}" stroke-width="2"/><circle cx="-5" cy="-2" r="2" fill="${INK}"/><circle cx="5" cy="-2" r="2" fill="${INK}"/><path d="M-2,4 L0,8 L2,4Z" fill="#FF6B3D"/><path d="M-12,-11 l4,5 M12,-11 l-4,5" stroke="${INK}" stroke-width="2.5" stroke-linecap="round"/></g>
    <g class="notebook" transform="translate(300,470) rotate(-8)">
      <rect x="-40" y="-56" width="80" height="104" rx="10" fill="#FFC83D" stroke="${INK}" stroke-width="4"/>
      <rect x="-40" y="-56" width="16" height="104" rx="6" fill="#F0A92A" stroke="${INK}" stroke-width="4"/>
      <circle cx="10" cy="-12" r="14" fill="#fff" stroke="${INK}" stroke-width="3"/><text x="10" y="-5" text-anchor="middle" font-family="Fredoka" font-weight="700" font-size="20" fill="#C2307A">a</text>
      <ellipse cx="-30" cy="20" rx="20" ry="22" fill="${SK}" stroke="${INK}" stroke-width="4"/>
    </g>
    <ellipse cx="118" cy="196" rx="15" ry="21" fill="${SK}" stroke="${INK}" stroke-width="4"/>
    <ellipse cx="282" cy="196" rx="15" ry="21" fill="${SK}" stroke="${INK}" stroke-width="4"/>
    <path d="M116,190 q6,6 0,12 M284,190 q-6,6 0,12" stroke="${SK2}" stroke-width="3" fill="none" stroke-linecap="round"/>
    <circle cx="117" cy="222" r="5" fill="#FFC83D" stroke="${INK}" stroke-width="2.5"/><circle cx="283" cy="222" r="5" fill="#FFC83D" stroke="${INK}" stroke-width="2.5"/>
    <g class="head">
      <path d="M122,176 C120,112 156,82 200,82 C244,82 280,112 278,176 C276,240 246,284 200,284 C154,284 124,240 122,176Z" fill="${SK}" stroke="${INK}" stroke-width="4.5"/>
      <path d="M140,128 Q200,108 262,128 Q250,146 200,140 Q150,146 140,128Z" fill="${SK2}" opacity=".45"/>
      <g fill="${HAIR}">${fringe.map(circ).join('')}</g>
      <g>${fcurls}</g>
      <ellipse cx="152" cy="222" rx="18" ry="11" fill="#E0705E" opacity=".38"/>
      <ellipse cx="248" cy="222" rx="18" ry="11" fill="#E0705E" opacity=".38"/>
      <path class="brow-l" d="M150,152 Q166,142 182,150" stroke="${HAIR}" stroke-width="6" fill="none" stroke-linecap="round"/>
      <path class="brow-r" d="M218,150 Q234,142 250,152" stroke="${HAIR}" stroke-width="6" fill="none" stroke-linecap="round"/>
      <g class="eyes">
        <g class="eye" style="transform-origin:166px 182px"><ellipse cx="166" cy="182" rx="14" ry="17" fill="#2A1712"/><ellipse class="iris" cx="166" cy="184" rx="9" ry="11" fill="#5A3020"/><circle cx="171" cy="176" r="5" fill="#fff"/><circle cx="161" cy="190" r="2.4" fill="#fff"/><path d="M150,174 q-6,-4 -9,-9" stroke="${INK}" stroke-width="3.5" stroke-linecap="round" fill="none"/></g>
        <g class="eye" style="transform-origin:234px 182px"><ellipse cx="234" cy="182" rx="14" ry="17" fill="#2A1712"/><ellipse class="iris" cx="234" cy="184" rx="9" ry="11" fill="#5A3020"/><circle cx="239" cy="176" r="5" fill="#fff"/><circle cx="229" cy="190" r="2.4" fill="#fff"/><path d="M250,174 q6,-4 9,-9" stroke="${INK}" stroke-width="3.5" stroke-linecap="round" fill="none"/></g>
      </g>
      <g class="nose"><path d="M194,200 q-4,14 6,16 q8,0 8,-5" stroke="${SK2}" stroke-width="4" fill="none" stroke-linecap="round"/></g>
      <g class="mouth">
        <g class="m-smile"><path d="M176,232 Q200,262 224,232 Q200,242 176,232Z" fill="#6E2430" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/><path d="M188,246 Q200,240 212,246 Q200,254 188,246Z" fill="#E86C7A"/><path d="M180,234 Q200,240 220,234" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" opacity=".95"/></g>
        <g class="m-closed" style="display:none"><path d="M180,236 Q190,229 200,232 Q210,229 220,236 Q210,246 200,245 Q190,246 180,236Z" fill="#8C4A3F" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/><path d="M181,236 Q200,239 219,236" stroke="${INK}" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M192,241 q8,2 16,0" stroke="#B9706A" stroke-width="2.5" fill="none" stroke-linecap="round"/></g>
        <g class="m-open" style="display:none"><path d="M182,230 Q200,226 218,230 Q222,258 200,262 Q178,258 182,230Z" fill="#6E2430" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/><path d="M188,252 Q200,244 212,252 Q200,262 188,252Z" fill="#E86C7A"/><path d="M186,232 Q200,236 214,232" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round"/></g>
        <g class="m-soft" style="display:none"><path d="M182,236 Q200,250 218,236" stroke="${INK}" stroke-width="4" fill="none" stroke-linecap="round"/></g>
      </g>
    </g>
    <g class="armR" transform="translate(112,368)">${arm}</g>
  </g>
</svg>`;
}

function bolotaSVG() {
  const SH = '#D9A867', SH2 = '#B98647', SH3 = '#EBC88E', FACE = '#F4DDBE';
  const R = rng(3); const dots = [];
  for (let i = 0; i < 46; i++) { const x = 70 + R() * 130, y = 50 + R() * 85; const dx = x - 135, dy = y - 132; if ((dx * dx) / (66 * 66) + (dy * dy) / (88 * 88) > 0.86) continue; dots.push(`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(2 + R() * 2.5).toFixed(1)}" fill="${SH3}"/>`); }
  return `<svg class="bolota" viewBox="0 0 240 190" xmlns="http://www.w3.org/2000/svg" overflow="visible">
  <g class="b-all">
    <ellipse cx="128" cy="176" rx="92" ry="9" fill="${INK}" opacity=".12"/>
    <g fill="#7A5A3A" stroke="${INK}" stroke-width="3.5"><ellipse cx="92" cy="166" rx="15" ry="9"/><ellipse cx="170" cy="166" rx="15" ry="9"/></g>
    <path d="M200,140 q26,-4 30,-22 q-14,6 -30,8Z" fill="${SH2}" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/>
    <path d="M60,160 C52,86 92,44 140,44 C190,44 216,88 210,160 Z" fill="${SH}" stroke="${INK}" stroke-width="4.5" stroke-linejoin="round"/>
    ${dots.join('')}
    <g fill="${SH2}" stroke="${INK}" stroke-width="3.5">
      <path d="M112,48 Q102,100 108,160 L124,160 Q118,100 126,46Z"/>
      <path d="M140,44 Q134,100 140,160 L156,160 Q150,100 156,45Z"/>
      <path d="M168,50 Q166,104 172,160 L186,160 Q182,104 182,58Z"/>
    </g>
    <path d="M78,82 Q96,58 124,54" stroke="#F6DDB0" stroke-width="7" fill="none" stroke-linecap="round" opacity=".8"/>
    <path d="M60,160 L210,160" stroke="${INK}" stroke-width="4.5" stroke-linecap="round"/>
    <g class="b-head">
      <path d="M30,74 Q24,58 36,52 Q46,58 44,72Z" fill="${SH2}" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/>
      <path d="M86,72 Q90,56 80,50 Q70,56 72,70Z" fill="${SH2}" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/>
      <ellipse cx="58" cy="116" rx="44" ry="42" fill="${FACE}" stroke="${INK}" stroke-width="4.5"/>
      <path d="M20,96 Q58,58 98,96 Q80,86 58,86 Q38,86 20,96Z" fill="${SH}" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/>
      <path d="M40,80 l6,6 M58,76 l0,8 M76,80 l-6,6" stroke="${SH2}" stroke-width="3" stroke-linecap="round"/>
      <g class="b-eyes">
        <g class="b-eye" style="transform-origin:42px 112px"><ellipse cx="42" cy="112" rx="9" ry="11" fill="${INK}"/><circle cx="45" cy="107" r="3.6" fill="#fff"/></g>
        <g class="b-eye" style="transform-origin:74px 112px"><ellipse cx="74" cy="112" rx="9" ry="11" fill="${INK}"/><circle cx="77" cy="107" r="3.6" fill="#fff"/></g>
      </g>
      <ellipse cx="34" cy="132" rx="8" ry="5" fill="#F09A8A" opacity=".55"/><ellipse cx="84" cy="132" rx="8" ry="5" fill="#F09A8A" opacity=".55"/>
      <ellipse cx="58" cy="130" rx="9" ry="6.5" fill="#E2727C" stroke="${INK}" stroke-width="3"/>
      <path class="b-mouth" d="M50,141 Q58,149 66,141" stroke="${INK}" stroke-width="3.5" fill="none" stroke-linecap="round"/>
    </g>
  </g>
</svg>`;
}

function poseSofia(root, t, { mouth = 'smile', arm = 12, hand = 'fist', look = 0, bob = true, blink = true, brow = 0 } = {}) {
  if (!root) return;
  for (const m of ['smile', 'closed', 'open', 'soft']) { const g = root.querySelector('.m-' + m); if (g) g.style.display = m === mouth ? '' : 'none'; }
  root.querySelector('.armR').setAttribute('transform', `translate(112,368) rotate(${arm})`);
  for (const h of ['point', 'open', 'fist']) root.querySelector('.hand-' + h).style.display = hand === h ? '' : 'none';
  const k = blink ? blinkAt(t) : 1;
  root.querySelectorAll('.eye').forEach(e => e.style.transform = `scaleY(${k})`);
  root.querySelectorAll('.iris').forEach(e => e.setAttribute('transform', `translate(${look * 3},0)`));
  const by = bob ? Math.sin(t * 2.2) * 2.5 : 0;
  root.querySelector('.s-all').setAttribute('transform', `translate(0,${by.toFixed(2)})`);
  root.querySelector('.head').setAttribute('transform', `rotate(${(Math.sin(t * 1.3) * 1.2).toFixed(2)} 200 260)`);
  root.querySelector('.brow-l').setAttribute('transform', `translate(0,${-brow * 5})`);
  root.querySelector('.brow-r').setAttribute('transform', `translate(0,${-brow * 5})`);
}
function poseBolota(root, t, { hop = 0, blink = true, tilt = 0 } = {}) {
  if (!root) return;
  const k = blink ? blinkAt(t + 0.9) : 1;
  root.querySelectorAll('.b-eye').forEach(e => e.style.transform = `scaleY(${k})`);
  const y = -Math.abs(Math.sin(t * 3)) * hop * 14 + Math.sin(t * 2.6) * 1.5;
  root.querySelector('.b-all').setAttribute('transform', `translate(0,${y.toFixed(2)})`);
  root.querySelector('.b-head').setAttribute('transform', `rotate(${(tilt + Math.sin(t * 1.7) * 3).toFixed(2)} 58 150)`);
}
