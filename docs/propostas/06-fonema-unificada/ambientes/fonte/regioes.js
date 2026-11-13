// FONEMA · 11 regiões da jornada (cenários com camadas de paralaxe)
const L = require('./lib');
const { W, H, f, rng, mix, Scene, finish, sky, sunGlow, rays, cloud, ridge, mesa, canopy, tree, palm, fanPalm, treeFern, embauba, cactus, dryBush, grass, flowers, bigLeaves, bromelia, rock, shadowE, birdV, particles, shimmer, reflection, house } = L;

// árvore tortuosa do cerrado (tronco retorcido, casca grossa, copa rala)
function crooked(x, y, { h = 150, seed = 1, bark = '#4A3426', barkHi = '#7A5A40', cols, crown = 70, n = 14, lx = .6, ly = -.7, flowersCol = null } = {}) {
  const r = rng(seed); let g = ''; const tips = [];
  const branch = (bx, by, a, len, w, d) => {
    const pts = [[bx, by]]; let px = bx, py = by, aa = a;
    for (let i = 0; i < 3; i++) { aa += (r() - .5) * .8; aa = aa * .85 + (-Math.PI / 2) * .15; px += Math.cos(aa) * len / 3; py += Math.sin(aa) * len / 3; pts.push([px, py]); }
    g += `<path d="M${pts.map(p => `${f(p[0])},${f(p[1])}`).join(' L')}" stroke="${bark}" stroke-width="${f(w)}" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;
    g += `<path d="M${pts.map(p => `${f(p[0] - w * .2)},${f(p[1])}`).join(' L')}" stroke="${barkHi}" stroke-width="${f(w * .3)}" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity=".6"/>`;
    if (d < 2) { const k = 2 + (r() < .5 ? 1 : 0); for (let i = 0; i < k; i++) branch(px, py, aa + (i - (k - 1) / 2) * 1.0 + (r() - .5) * .3, len * (d ? .5 : .6), w * .6, d + 1); }
    else tips.push([px, py]);
  };
  branch(x, y, -Math.PI / 2 + (r() - .5) * .3, h * .55, h * .085, 0);
  tips.forEach(([tx, ty], i) => g += canopy(tx, ty - 4, crown * (.42 + r() * .12), crown * (.26 + r() * .06), cols, seed * 31 + i, { n, lx, ly }));
  if (flowersCol) tips.forEach(([tx, ty], i) => g += particles(seed + i, 10, tx - crown * .35, tx + crown * .35, ty - crown * .3, ty + crown * .1, flowersCol, 2.4, .9));
  return g;
}
function cupinzeiro(x, y, h, w, seed = 1) {
  return `${shadowE(x, y, w * 1.1, .3)}<path d="M${x - w},${y} Q${x - w * .9},${y - h * .5} ${x - w * .35},${y - h * .85} Q${x - w * .1},${y - h * 1.05} ${x + w * .2},${y - h * .9} Q${x + w * .7},${y - h * .6} ${x + w},${y}Z" fill="#B0623A"/><path d="M${x - w * .7},${y - 4} Q${x - w * .65},${y - h * .5} ${x - w * .25},${y - h * .82}" stroke="#D9895A" stroke-width="${w * .3}" fill="none" stroke-linecap="round" opacity=".7"/><path d="M${x + w * .5},${y - 2} Q${x + w * .55},${y - h * .4} ${x + w * .15},${y - h * .8}" stroke="#8A4628" stroke-width="${w * .25}" fill="none" opacity=".6"/>${[.3, .55].map(t => `<ellipse cx="${x + w * (t - .5) * .8}" cy="${y - h * t}" rx="${w * .1}" ry="${w * .07}" fill="#5A2A16"/>`).join('')}`;
}

// =============================================================================================
// 06 · CERRADO — fim de tarde dourado da estação seca
// =============================================================================================
function cerrado() {
  const s = new Scene('cerrado', { layers: true });
  const sunX = 1000, sunY = 318;
  sky(s, [[0, '#5E93C2'], [.38, '#A9C3D6'], [.62, '#F4D7A2'], [.78, '#F8C98A']]);
  sunGlow(s, sunX, sunY, 34, '#FFF4D2', '#FFC874', 640, .7);
  s.add('sky', cloud(s, 240, 170, 260, '#FFF4E6', '#D9B4B0', 3, .95) + cloud(s, 700, 110, 180, '#FFF6EA', '#D8C0C4', 5, .7) + cloud(s, 1170, 236, 150, '#FFEBD0', '#E8B49A', 9, .85));
  s.add('sky', birdV(560, 230, 1.1) + birdV(600, 250, .8) + birdV(530, 262, .7));
  // chapadas distantes
  const haze = '#E9C7A6';
  s.add('far', `<path d="${mesa(-40, 520, 330, 450, 3)}" fill="${mix('#8B7FA8', haze, .45)}"/><path d="${mesa(380, 900, 352, 450, 4)}" fill="${mix('#8B7FA8', haze, .62)}"/><path d="${mesa(820, 1340, 340, 450, 5)}" fill="${mix('#8B7FA8', haze, .55)}"/>`);
  s.add('far', `<path d="M-40,348 L0,342 L80,340 L160,345 L240,338" stroke="${mix('#B7A9C9', haze, .2)}" stroke-width="3" fill="none" opacity=".6"/>`);
  const r1 = ridge(11, 446, 10, { fr: [1.3, 3.1, 7], wt: [1, .4, .2] });
  s.add('far', `<path d="${r1.d}" fill="${s.lin([[0, mix('#A9A060', haze, .45)], [1, '#C9A866']])}"/>`);
  // vereda de buritis (faixa verde com brilho d'água)
  let ver = `<path d="M-20,470 Q300,452 640,462 Q960,472 1300,456 L1300,480 Q900,490 640,482 Q300,474 -20,490Z" fill="${mix('#5E8A3E', haze, .3)}"/>`;
  const rB = rng(7);
  for (let i = 0; i < 22; i++) { const x = -10 + i * 62 + rB() * 40, y = 476 + rB() * 8, sc = .17 + rB() * .1; if (x > 560 && x < 700) continue; ver += `<g transform="translate(${f(x)},${f(y)}) scale(${f(sc)})">${fanPalm(0, 0, { h: 300 + rB() * 80, seed: i + 3, len: 90, col: [mix('#3B6B34', haze, .35), mix('#5E9447', haze, .35), mix('#9CC46A', haze, .3)], trunk: [mix('#6A5A48', haze, .35), '#8C7A62'], skirt: mix('#9C7A4A', haze, .3) })}</g>`; }
  ver += `<path d="M560,484 Q700,478 860,482 Q980,486 1100,480" stroke="#FFE7B0" stroke-width="3" opacity=".75" fill="none" stroke-linecap="round" filter="${s.blur(.8)}"/>`;
  s.add('far', ver);
  // planície dourada (mid)
  const r2 = ridge(21, 500, 8, { fr: [1, 2.6], wt: [1, .4] });
  s.add('mid', `<path d="${r2.d}" fill="${s.lin([[0, '#D9B061'], [.35, '#C99A48'], [1, '#B07F38']])}"/>`);
  s.add('mid', `<path d="${r2.d}" fill="${s.rad([[0, '#FFE2A0', .55], [1, '#FFE2A0', 0]], .78, .0, .5)}"/>`);
  s.add('mid', grass(31, 160, 0, W, 492, 560, ['#E2BC6E', '#C9984A', '#EDCB84'], 6, 14));
  // árvores distantes (névoa dourada)
  [[60, 512, 40], [430, 508, 34], [520, 514, 26], [960, 506, 30], [1150, 512, 36], [640, 510, 22]].forEach(([x, y, c], i) => s.add('mid', crooked(x, y, { h: c * 1.3, seed: 60 + i, cols: [mix('#6E7A3E', '#E9C7A6', .45), mix('#8A9450', '#E9C7A6', .4), mix('#B8BC72', '#E9C7A6', .35)], crown: c * 1.6, n: 8 })));
  // sombras longas (sol à direita)
  s.add('mid', L.castShadow(s, 176, 549, 170, 7, Math.PI, .28) + L.castShadow(s, 766, 541, 170, 7, Math.PI, .25) + L.castShadow(s, 1086, 547, 130, 6, Math.PI, .25) + L.castShadow(s, 590, 567, 80, 4, Math.PI, .3) + L.castShadow(s, 1000, 573, 50, 3, Math.PI, .3));
  // árvores médias
  s.add('mid', crooked(170, 548, { h: 120, seed: 4, cols: ['#4E6A2E', '#6E8A3A', '#A3B45A', '#D3D88A'], crown: 80 }));
  s.add('mid', cupinzeiro(320, 552, 46, 16) + cupinzeiro(860, 540, 34, 12) + cupinzeiro(1220, 548, 52, 18));
  s.add('mid', crooked(760, 540, { h: 118, seed: 9, cols: ['#C98A10', '#F0B21A', '#FFD24A', '#FFF0A0'], crown: 90, lx: .6 }));
  s.add('mid', crooked(1080, 546, { h: 96, seed: 12, cols: ['#55703A', '#728E44', '#A8B860'], crown: 60 }));
  // lobo-guará e seriema
  s.add('mid', L.lobo(560, 566, .62, false));
  s.add('mid', L.seriema(990, 572, .62, true));
  s.hotspot('mid', 993, 528, 34, 'seriema');
  // primeiro plano médio: trilha de terra vermelha
  s.add('near', `<path d="M-20,${H + 10} L-20,590 Q300,560 640,580 Q980,600 1300,570 L1300,${H + 10}Z" fill="${s.lin([[0, '#C59448'], [1, '#9C6A2E']])}"/>`);
  s.add('near', `<path d="M470,${H + 10} Q520,700 640,640 Q760,590 700,560 Q690,556 712,552 Q800,590 690,650 Q600,710 700,${H + 10}Z" fill="${s.lin([[0, '#C46A3A'], [1, '#A8502A']])}"/>`);
  s.add('near', `<path d="M520,${H} Q560,700 650,650" stroke="#E0905A" stroke-width="6" fill="none" opacity=".5" stroke-linecap="round"/>`);
  s.add('near', grass(41, 240, 0, 480, 590, 790, ['#D7A54E', '#B98636', '#E8C474', '#9A6A2A'], 12, 36) + grass(42, 240, 720, W, 580, 790, ['#D7A54E', '#B98636', '#E8C474', '#9A6A2A'], 12, 36));
  s.add('near', flowers(5, 30, 0, 460, 610, 780, ['#B98AD8', '#FFFFFF', '#F2C94C']) + flowers(6, 30, 760, W, 600, 780, ['#B98AD8', '#FFFFFF', '#F2C94C']));
  s.add('near', L.castShadow(s, 270, 692, 300, 12, Math.PI, .3) + L.castShadow(s, 1200, 642, 300, 11, Math.PI, .26) + L.castShadow(s, 880, 670, 90, 5, Math.PI, .3));
  // pequizeiro com frutos (esquerda)
  s.add('near', crooked(260, 690, { h: 250, seed: 17, cols: ['#3E5A2A', '#5C7A34', '#8EAA4C', '#C8D67A'], crown: 130, n: 18 }));
  const pq = [[214, 436], [262, 452], [316, 440]];
  s.add('near', pq.map(([x, y]) => `<path d="M${x},${y - 18} v8" stroke="#4A3426" stroke-width="2"/><circle cx="${x}" cy="${y}" r="11" fill="#7FA04A"/><circle cx="${x - 3}" cy="${y - 3}" r="4" fill="#B8D07A" opacity=".8"/>`).join(''));
  s.hotspot('near', 262, 446, 52, 'pequi');
  // coruja-buraqueira no montinho
  s.add('near', `<path d="M60,712 Q100,690 150,712Z" fill="#9C5A30"/><ellipse cx="104" cy="709" rx="12" ry="5" fill="#3A1A0C"/>`);
  s.add('near', L.coruja(118, 706, 1.25));
  s.hotspot('near', 118, 654, 38, 'coruja');
  // cajuzinho-do-cerrado (direita, chão)
  let cj = '';
  [[1010, 700], [1060, 712], [1110, 698]].forEach(([x, y], i) => { cj += canopy(x, y - 14, 36, 18, ['#3E6A2E', '#5E8A3A', '#9CC060'], 50 + i, { n: 10 }); });
  [[1004, 682], [1050, 694], [1100, 680], [1074, 676]].forEach(([x, y]) => cj += `<path d="M${x - 6},${y} q6,-14 12,0 q-2,10 -6,12 q-4,-2 -6,-12z" fill="#E2402E"/><path d="M${x - 4},${y - 2} q4,-6 6,0" stroke="#FF8A70" stroke-width="2" fill="none"/><path d="M${x - 4},${y + 12} q4,8 8,0z" fill="#8A5A2E"/>`);
  s.add('near', cj);
  s.hotspot('near', 1056, 688, 52, 'caju');
  // árvore seca com araras-canindé (direita)
  s.add('near', crooked(1190, 640, { h: 330, seed: 23, cols: ['#52703A', '#6E8C46', '#A5BA66'], crown: 70, n: 8 }));
  s.add('near', L.arara(1152, 368, .95, false, 'canide') + L.arara(1196, 386, .9, true, 'canide'));
  s.hotspot('near', 1172, 368, 46, 'arara');
  s.add('near', L.tatu(860, 668, .8, true));
  // primeiro plano: capim alto desfocado + canela-de-ema
  s.add('fg', `<g filter="${s.blur(2.2)}">${grass(61, 60, -20, 300, 760, 820, ['#8A5A22', '#6E4618', '#A87430'], 50, 110, .2, 4)}${grass(62, 60, 980, 1300, 760, 820, ['#8A5A22', '#6E4618', '#A87430'], 50, 120, -.2, 4)}</g>`);
  s.add('fg', `<g filter="${s.blur(1.2)}"><path d="M1240,800 Q1236,720 1246,650" stroke="#3A2A1E" stroke-width="7" fill="none"/>${[0, 1, 2, 3, 4, 5].map(i => `<path d="M1244,${700 - i * 10} l${i % 2 ? 22 : -22},-10" stroke="#5E7A3A" stroke-width="3" stroke-linecap="round"/>`).join('')}<circle cx="1246" cy="644" r="12" fill="#9A6AD0"/><circle cx="1242" cy="640" r="5" fill="#C7A6EE"/></g>`);
  s.add('fg', particles(91, 50, 0, W, 300, 700, '#FFF0C0', 2.2, .55));
  rays(s, sunX, sunY, [2.2, 2.45, 2.75, 2.95, 3.1], 1100, '#FFE6B0', .18, 'sky', .05);
  finish(s, { vignette: '#4A2A14', vo: .3, warm: '#FFB060', warmO: .1 });
  return s;
}


// cerca de madeira
function fence(x0, x1, y, h, col = '#8A5A36', gap = 34, slope = 0) {
  let g = `<path d="M${x0},${y - h * .62} L${x1},${y - h * .62 + slope}" stroke="${col}" stroke-width="5"/><path d="M${x0},${y - h * .3} L${x1},${y - h * .3 + slope}" stroke="${col}" stroke-width="5"/>`;
  for (let x = x0; x <= x1; x += gap) { const yy = y + (x - x0) / (x1 - x0) * slope; g += `<path d="M${x - 4},${yy} L${x - 4},${yy - h} L${x},${yy - h - 5} L${x + 4},${yy - h} L${x + 4},${yy}Z" fill="${col}"/><path d="M${x - 2},${yy} V${yy - h + 2}" stroke="${mix(col, '#FFFFFF', .25)}" stroke-width="2" opacity=".7"/>`; }
  return g;
}
function pipa(x, y, s = 1, rot = 0, c1 = '#E2483D', c2 = '#F2B33D', tail = true) {
  return `<g transform="translate(${x},${y}) rotate(${rot}) scale(${s})"><path d="M0,-30 L22,0 L0,34 L-22,0Z" fill="${c1}"/><path d="M0,-30 L22,0 L0,0Z M0,0 L-22,0 L0,34Z" fill="${c2}"/><path d="M0,-30 V34 M-22,0 H22" stroke="#7A4A2A" stroke-width="1.4"/>${tail ? `<path d="M0,34 q10,20 -4,36 q-12,16 4,34" stroke="#7A4A2A" stroke-width="1.4" fill="none"/>${[[2, 48], [-4, 66], [-2, 86]].map(([a, b], i) => `<path d="M${a - 6},${b - 4} l12,8 M${a + 6},${b - 4} l-12,8" stroke="${i % 2 ? c1 : c2}" stroke-width="4"/>`).join('')}` : ''}</g>`;
}
function bola(x, y, r = 16) { return `${shadowE(x + 4, y + r * .95, r * 1.1, .3)}<circle cx="${x}" cy="${y}" r="${r}" fill="#F4F0E6"/><path d="M${x - r},${y} A${r},${r} 0 0 0 ${x + r},${y}Z" fill="#E2483D" opacity=".9"/><path d="M${x - r * .2},${y - r} Q${x + r * .5},${y} ${x - r * .2},${y + r}" stroke="#2F5DA8" stroke-width="${r * .22}" fill="none"/><circle cx="${x - r * .4}" cy="${y - r * .45}" r="${r * .25}" fill="#fff" opacity=".7"/>`; }
function varal(x0, x1, y, seed) {
  const r = rng(seed); const cols = ['#E2483D', '#F2B33D', '#4FA3C7', '#FFFFFF', '#6FB86A', '#B56FD0']; let g = `<path d="M${x0},${y} Q${(x0 + x1) / 2},${y + 22} ${x1},${y}" stroke="#7A6A5A" stroke-width="1.6" fill="none"/>`;
  for (let i = 1; i < 6; i++) { const t = i / 6, x = x0 + (x1 - x0) * t, yy = y + 4 * t * (1 - t) * 22, c = cols[Math.floor(r() * cols.length)], w = 22 + r() * 14; g += i % 2 ? `<path d="M${f(x - w / 2)},${f(yy)} h${f(w)} l-3,${f(w * 1.1)} h${f(-w + 6)}Z" fill="${c}"/><path d="M${f(x - w / 2)},${f(yy)} h${f(w)}" stroke="${mix(c, '#000000', .2)}" stroke-width="3"/>` : `<path d="M${f(x - w / 2)},${f(yy)} h${f(w)} l4,10 l-6,2 v${f(w * .8)} h${f(-w + 4)} v${f(-w * .8)} l-6,-2Z" fill="${c}"/>`; }
  return g;
}

// =============================================================================================
// 01 · QUINTAL DA SOFIA / VILA DO BOLOTA — manhã ensolarada
// =============================================================================================
function quintal() {
  const s = new Scene('quintal');
  sky(s, [[0, '#7EB8E0'], [.5, '#BFE0EE'], [.75, '#F6E6C4']]);
  sunGlow(s, 210, 150, 40, '#FFF8E0', '#FFE6A0', 560, .7);
  s.add('sky', cloud(s, 640, 140, 240, '#FFFFFF', '#CFE0EC', 2, .95) + cloud(s, 1060, 90, 200, '#FFFFFF', '#D2E2EE', 8, .9) + cloud(s, 400, 250, 120, '#FFFFFF', '#DCE8F0', 4, .7));
  s.add('sky', pipa(980, 210, .7, 12, '#4FA3C7', '#F2B33D') + `<path d="M980,234 Q900,380 820,470" stroke="#fff" stroke-width="1" opacity=".7" fill="none"/>`);
  s.hotspot('sky', 980, 212, 40, 'pipa');
  // morros distantes com a vila no alto
  const haze = '#DCEBEF';
  const r1 = ridge(3, 360, 40, { fr: [.8, 2, 4.5], wt: [1, .4, .15] });
  s.add('far', `<path d="${r1.d}" fill="${mix('#6FA86A', haze, .55)}"/>`);
  let vila = ''; const rv = rng(5);
  for (let i = 0; i < 16; i++) { const x = 560 + i * 26 + rv() * 8, y = r1.y(x) + 6, w = 16 + rv() * 10, h = 12 + rv() * 10; vila += `<rect x="${f(x)}" y="${f(y - h)}" width="${f(w)}" height="${f(h + 10)}" fill="${mix(['#F2C46A', '#E98A6A', '#F6EBD8', '#8CC0D8'][i % 4], haze, .45)}"/><path d="M${f(x - 2)},${f(y - h)} L${f(x + w / 2)},${f(y - h - 7)} L${f(x + w + 2)},${f(y - h)}Z" fill="${mix('#B5541E', haze, .45)}"/>`; }
  vila += `<rect x="752" y="${f(r1.y(760) - 46)}" width="16" height="46" fill="${mix('#F6EBD8', haze, .4)}"/><path d="M748,${f(r1.y(760) - 46)} L760,${f(r1.y(760) - 64)} L772,${f(r1.y(760) - 46)}Z" fill="${mix('#B5541E', haze, .4)}"/>`;
  s.add('far', vila);
  const r2 = ridge(9, 420, 26, { fr: [1, 2.4, 6], wt: [1, .4, .15] });
  s.add('far', `<path d="${r2.d}" fill="${mix('#5E9A50', haze, .35)}"/>`);
  for (let i = 0; i < 14; i++) { const x = 30 + i * 92; s.add('far', canopy(x, r2.y(x) - 12, 34, 20, [mix('#4E8A44', haze, .35), mix('#6AA858', haze, .35), mix('#9CCB7A', haze, .3)], 70 + i, { n: 10, lx: -.6 })); }
  // rua da vila (mid): casario
  s.add('mid', `<path d="M-20,${H} L-20,500 L1300,500 L1300,${H}Z" fill="#D9C39A"/>`);
  const hs = [[600, 120, 110, '#F2C46A', '#C0552A'], [726, 100, 92, '#8CC0D8', '#B5541E'], [832, 130, 120, '#F4E4C8', '#A84A22'], [968, 110, 100, '#E98A6A', '#B5541E'], [1084, 140, 116, '#B7D98A', '#9E4A20'], [1230, 110, 96, '#F2C46A', '#C0552A']];
  hs.forEach(([x, w, h, c, rf]) => s.add('mid', house(x, 500, w, h, { wall: c, roof: rf, roofH: 34 })));
  s.add('mid', `<path d="M590,500 H1300" stroke="#B89A6E" stroke-width="4"/>`);
  // mangueira grande (esquerda)
  s.add('mid', tree(230, 560, { h: 180, w: 20, crown: [250, 160], cols: ['#2E6A36', '#3F8A44', '#77B85A', '#B8DE88'], seed: 7, lobes: 5, n: 26, lx: -.6, ly: -.8 }));
  [[150, 400], [210, 440], [330, 420], [380, 460], [260, 470]].forEach(([x, y]) => s.add('mid', `<path d="M${x},${y - 10} v6" stroke="#3A5A2A" stroke-width="1.5"/><ellipse cx="${x}" cy="${y}" rx="7" ry="9" fill="#F2A33A"/><ellipse cx="${x - 2}" cy="${y - 3}" rx="2.5" ry="3.5" fill="#FFD27A"/><ellipse cx="${x + 2}" cy="${y + 3}" rx="4" ry="5" fill="#E2483D" opacity=".35"/>`));
  // quintal: gramado
  const g1 = ridge(13, 560, 10, { fr: [1, 2.2], wt: [1, .4] });
  s.add('near', `<path d="${g1.d}" fill="${s.lin([[0, '#9CD070'], [.5, '#7CB85A'], [1, '#4E8A3A']])}"/>`);
  s.add('near', `<path d="M560,${H + 10} Q600,700 610,640 Q616,600 600,572 L650,572 Q664,600 670,640 Q690,720 760,${H + 10}Z" fill="#D9BE8A"/>${[[606, 590, 18], [622, 618, 22], [612, 652, 26], [632, 690, 30], [622, 736, 34], [660, 780, 38]].map(([x, y, w]) => `<ellipse cx="${x}" cy="${y}" rx="${w}" ry="${w * .32}" fill="#C9AE7E"/><ellipse cx="${x - w * .15}" cy="${y - w * .08}" rx="${w * .6}" ry="${w * .16}" fill="#E8D4A8"/>`).join('')}`);
  s.add('near', flowers(81, 40, 0, 540, 568, 590, ['#E26D5A', '#F2C94C', '#FFFFFF', '#E89ACB'], 4) + flowers(82, 40, 700, 1050, 568, 590, ['#E26D5A', '#F2C94C', '#FFFFFF', '#B98AD8'], 4));
  s.add('near', L.castShadow(s, 300, 566, 360, 26, 0, .25, '#1E3A18'));
  s.add('near', fence(-10, 560, 566, 54, '#9A6A40', 36) + fence(668, 1290, 566, 54, '#9A6A40', 36) + `<path d="M556,566 V500 M672,566 V500" stroke="#7A4A2A" stroke-width="10"/><path d="M550,500 Q614,470 678,500" stroke="#7A4A2A" stroke-width="7" fill="none"/>` + canopy(560, 500, 26, 16, ['#3E7A30', '#5EA040', '#9CD070'], 88, { n: 6 }) + flowers(89, 8, 540, 590, 488, 512, ['#E2483D', '#F2C94C'], 3.4));
  s.add('near', varal(640, 1010, 470, 3) + `<path d="M640,470 V566 M1010,470 V566" stroke="#7A5A3A" stroke-width="5"/>`);
  // gato no muro
  s.add('near', `<rect x="1060" y="510" width="230" height="58" fill="${s.lin([[0, '#F0E2C4'], [1, '#D2BC94']])}"/><rect x="1054" y="502" width="240" height="12" rx="3" fill="#B5541E"/><rect x="1054" y="512" width="240" height="4" fill="#7A3A18" opacity=".4"/>${Array.from({ length: 7 }, (_, i) => `<path d="M${1060 + i * 34},516 v52" stroke="#C9B08A" stroke-width="1.5"/>`).join('')}<path d="M1060,540 h230" stroke="#C9B08A" stroke-width="1.5"/>`);
  s.add('near', L.gato(1150, 506, 1.1, true));
  s.hotspot('near', 1150, 470, 40, 'gato');
  // horta
  let horta = '';
  [[800, 630], [905, 640], [1010, 630]].forEach(([x, y], i) => { horta += `<path d="M${x - 46},${y} L${x + 46},${y} L${x + 52},${y + 22} L${x - 52},${y + 22}Z" fill="#7A4A2A"/><path d="M${x - 46},${y} L${x + 46},${y}" stroke="#9A6A40" stroke-width="4"/>`; for (let k = 0; k < 4; k++) horta += canopy(x - 33 + k * 22, y - 6, 12, 9, ['#3E7A30', '#5EA040', '#9CD070'], 300 + i * 9 + k, { n: 6 }); });
  horta += `<g>${[0, 1, 2].map(i => `<path d="M${792 + i * 18},${622} q-4,-10 0,-14" stroke="#4E8A34" stroke-width="3" fill="none"/><path d="M${788 + i * 18},${630} q4,-10 8,0z" fill="#F28C28"/>`).join('')}</g>`;
  s.add('near', horta);
  // laguinho com pato e sapo
  const pond = 'M880,720 Q900,680 1010,676 Q1140,672 1170,706 Q1180,742 1050,750 Q900,754 880,720Z';
  s.add('near', `<path d="${pond}" fill="#6E9A54"/><path d="M890,718 Q906,688 1010,684 Q1130,680 1160,708 Q1166,736 1050,742 Q910,746 890,718Z" fill="${s.lin([[0, '#9ED2E0'], [1, '#5E9EB8']])}"/>${shimmer(4, 20, 920, 1140, 690, 738, '#FFFFFF', .7)}`);
  s.add('near', L.pato(1020, 712, 1.05, false, '#F6F2E6'));
  s.hotspot('near', 1030, 694, 38, 'pato');
  s.add('near', rock(1150, 724, 34, 22, ['#7D8A7A', '#A0AC9A', '#CBD4C2'], 3) + L.sapo(1150, 704, .95, true));
  s.hotspot('near', 1150, 690, 30, 'sapo');
  // bola na grama
  s.add('near', bola(470, 700, 22));
  s.hotspot('near', 470, 700, 36, 'bola');
  s.add('near', L.cachorro(330, 650, 1.1, false));
  s.add('near', grass(5, 200, 0, W, 580, 800, ['#6EAA4E', '#84BC5E', '#5A9640', '#A2CF74'], 6, 18));
  s.add('near', flowers(8, 50, 0, W, 600, 790, ['#F2C94C', '#FFFFFF', '#E26D5A', '#B98AD8'], 3));
  s.add('fg', `<g filter="${s.blur(2.5)}">${bigLeaves(-30, 820, 1.1, 4, ['#2E5A2A', '#3E7A34'], 1, 6)}${bigLeaves(1300, 830, 1, 5, ['#2E5A2A', '#3E7A34'], -1, 5)}</g>`);
  s.add('fg', L.borboleta(560, 560, 1, '#F2B33D', '#FFE08A', -10) + L.borboleta(820, 610, .8, '#E2483D', '#FF9A8A', 14));
  rays(s, 210, 150, [.5, .75, 1.0, 1.25], 1000, '#FFF6D0', .16, 'sky');
  finish(s, { vignette: '#3A2A18', vo: .22, warm: '#FFD080', warmO: .1 });
  return s;
}

// =============================================================================================
// 02 · ILHA DAS VOGAIS — meio-dia luminoso, mar turquesa
// =============================================================================================
function ilha() {
  const s = new Scene('ilha');
  sky(s, [[0, '#3E9AD6'], [.45, '#8ED0EE'], [.58, '#D8F0F4']]);
  sunGlow(s, 1080, 110, 36, '#FFFDF0', '#FFF4C0', 480, .55);
  s.add('sky', cloud(s, 260, 160, 280, '#FFFFFF', '#C6DDEE', 12, 1) + cloud(s, 760, 110, 200, '#FFFFFF', '#CAE0EE', 14, .9) + cloud(s, 560, 300, 160, '#FFFFFF', '#D6E8F2', 15, .8) + cloud(s, 1120, 290, 120, '#FFFFFF', '#D6E8F2', 16, .75));
  s.add('sky', L.fragata(380, 250, .5) + birdV(470, 220, .9, '#4A5A70'));
  // mar
  const hz = 430;
  s.add('far', `<rect x="0" y="${hz}" width="${W}" height="${H - hz}" fill="${s.lin([[0, '#2A86B8'], [.3, '#2FA2C4'], [.65, '#45C2CC'], [1, '#7EDCD4']])}"/>`);
  s.add('far', `<rect x="0" y="${hz}" width="${W}" height="10" fill="#CFEFF4" opacity=".6" filter="${s.blur(3)}"/>`);
  // ilhotas distantes
  s.add('far', `<path d="M60,${hz} Q90,${hz - 24} 130,${hz - 20} Q170,${hz - 26} 200,${hz}Z" fill="${mix('#4E8A6A', '#BFE4EC', .6)}"/><path d="M980,${hz} Q1020,${hz - 40} 1070,${hz - 30} Q1120,${hz - 18} 1150,${hz}Z" fill="${mix('#4E8A6A', '#BFE4EC', .55)}"/>`);
  s.add('far', shimmer(21, 120, 0, W, hz + 8, 600, '#FFFFFF', .55, 1080, 30));
  // ilha principal (mid)
  const isl = `M330,${hz + 70} Q360,${hz + 10} 430,${hz - 10} Q480,${hz - 50} 560,${hz - 56} Q620,${hz - 110} 700,${hz - 92} Q760,${hz - 70} 800,${hz - 30} Q880,${hz - 20} 920,${hz + 20} Q950,${hz + 50} 960,${hz + 70}Z`;
  s.add('mid', `<path d="M300,${hz + 76} Q640,${hz + 40} 990,${hz + 76} Q640,${hz + 92} 300,${hz + 76}Z" fill="#E8F8F4" opacity=".8"/>`);
  s.add('mid', `<path d="${isl}" fill="${s.lin([[0, '#5E9E54'], [1, '#3E7A3E']])}"/><path d="M330,${hz + 70} Q480,${hz + 34} 640,${hz + 40} Q820,${hz + 36} 960,${hz + 70}Z" fill="#F2DDB0"/>`);
  s.add('mid', rock(430, hz + 50, 60, 70, ['#7A6E62', '#9C9084', '#C9BEB0'], 4) + rock(880, hz + 56, 44, 50, ['#7A6E62', '#9C9084', '#C9BEB0'], 6));
  [[520, hz + 40, 150, -30, 1], [580, hz + 46, 180, 20, 2], [700, hz + 40, 200, 40, 3], [770, hz + 46, 150, -20, 4], [640, hz + 44, 120, 10, 5]].forEach(([x, y, h, lean, sd]) => s.add('mid', `<g transform="translate(${x},${y}) scale(.62) translate(${-x},${-y})">${palm(x, y, { h, lean, seed: sd, len: 110 })}</g>`));
  s.add('mid', canopy(470, hz + 4, 60, 34, ['#2E6A3A', '#4C8A48', '#86C06A', '#C8E8A0'], 41, { lx: .5, ly: -.8 }) + canopy(840, hz + 2, 70, 34, ['#2E6A3A', '#4C8A48', '#86C06A', '#C8E8A0'], 42, { lx: .5, ly: -.8 }) + canopy(660, hz - 70, 70, 34, ['#2E6A3A', '#4C8A48', '#86C06A', '#C8E8A0'], 43, { lx: .5, ly: -.8 }));
  // faixa de mar mais próxima e onda quebrando
  s.add('mid', `<path d="M0,580 Q320,560 640,575 Q960,590 1280,566 L1280,610 L0,610Z" fill="#3FB6C8" opacity=".55"/>`);
  // praia (near)
  const beach = `M-20,${H + 10} L-20,640 Q200,600 460,618 Q760,640 1000,610 Q1160,590 1300,600 L1300,${H + 10}Z`;
  s.add('near', `<path d="M-20,632 Q200,592 460,610 Q760,632 1000,602 Q1160,582 1300,592 L1300,640 L-20,660Z" fill="#9EE4E4" opacity=".8"/>`);
  s.add('near', `<path d="M-20,628 Q200,588 460,606 Q760,628 1000,598 Q1160,578 1300,588" stroke="#FFFFFF" stroke-width="5" fill="none" opacity=".85" stroke-linecap="round"/>`);
  s.add('near', `<path d="${beach}" fill="${s.lin([[0, '#F4E0B4'], [.4, '#EED2A0'], [1, '#E2BE84']])}"/><path d="M-20,650 Q200,612 460,630 Q760,652 1000,622 Q1160,602 1300,612 L1300,628 Q1160,618 1000,640 Q760,668 460,646 Q200,630 -20,666Z" fill="#D9B880" opacity=".55"/>`);
  s.add('near', particles(30, 140, 0, W, 650, 800, '#C9A46A', 1.4, .5));
  s.add('near', `<path d="M-20,660 Q200,622 460,640 Q760,662 1000,632 Q1160,612 1300,622" stroke="#C9A06A" stroke-width="14" fill="none" opacity=".25" filter="${s.blur(4)}"/>`);
  let vine = `<path d="M760,800 Q820,740 900,760 Q980,780 1060,740 Q1140,700 1300,730" stroke="#4E8A3A" stroke-width="3" fill="none"/>`; const rvv = rng(77);
  for (let i = 0; i < 26; i++) { const t = i / 26, x = 760 + t * 540, y = 760 - Math.sin(t * 6) * 18 + rvv() * 20 + (t > .5 ? -10 : 10); vine += `<path d="M${f(x)},${f(y)} q-10,-12 0,-18 q10,6 0,18z" fill="${i % 2 ? '#5E9A44' : '#4A8A38'}"/>`; if (i % 3 === 0) vine += `<circle cx="${f(x + 8)}" cy="${f(y - 6)}" r="7" fill="#C86AB8"/><circle cx="${f(x + 8)}" cy="${f(y - 6)}" r="2.5" fill="#FBE0F0"/>`; }
  s.add('near', vine);
  s.add('near', [[260, 760], [820, 690], [520, 670], [960, 740]].map(([x, y], i) => `<path transform="translate(${x},${y}) rotate(${i * 40})" d="M-8,4 Q0,-10 8,4Z" fill="${['#F8E6D6', '#F2C6B0', '#FFF4E6', '#E8D0C0'][i]}"/>`).join(''));
  s.add('near', Array.from({ length: 8 }, (_, i) => `<ellipse cx="${400 + i * 34 + (i % 2) * 8}" cy="${792 - i * 14 + (i % 2) * 6}" rx="5" ry="3" fill="#C9A06A" opacity=".5"/>`).join(''));
  // onda (direita, quebrando na pedra)
  s.add('near', rock(1180, 640, 110, 80, ['#6E665E', '#8E857A', '#BDB2A2'], 9));
  s.add('near', `<g filter="${s.blur(1.2)}">${[[1080, 590, 34], [1110, 572, 30], [1136, 566, 26], [1100, 604, 28], [1060, 606, 22], [1150, 586, 22]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#FFFFFF" opacity=".85"/>`).join('')}</g><g>${[[1090, 586, 18], [1118, 570, 16], [1066, 600, 12]].map(([x, y, r]) => `<circle cx="${x - 4}" cy="${y - 4}" r="${r}" fill="#FFFFFF"/>`).join('')}</g><path d="M1020,622 Q1060,600 1100,612 Q1080,620 1040,628Z" fill="#BFF0EE"/>${particles(31, 50, 1040, 1190, 520, 600, '#FFFFFF', 2.6, .9)}`);
  s.hotspot('near', 1110, 584, 46, 'onda');
  // ave (atobá) sobre a pedra
  s.add('near', `<g transform="translate(1200,566)"><path d="M-14,0 Q-18,-26 0,-30 Q14,-28 14,-6 Q8,4 -14,0Z" fill="#6E5A48"/><path d="M-6,-6 Q4,-2 12,-8 L12,-2 Q0,4 -8,0Z" fill="#F7F3EA"/><circle cx="4" cy="-34" r="9" fill="#6E5A48"/><path d="M10,-36 L26,-32 L10,-30Z" fill="#E8D070"/><circle cx="6" cy="-36" r="1.5" fill="#111"/><path d="M-4,0 l-2,6 M4,0 l2,6" stroke="#E8D070" stroke-width="3"/></g>`);
  s.hotspot('near', 1204, 548, 34, 'ave');
  // estrela-do-mar
  const star = (x, y, r, c) => `<path transform="translate(${x},${y})" d="${Array.from({ length: 10 }, (_, i) => { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * .42 : r; return `${i ? 'L' : 'M'}${f(Math.cos(a) * rr)},${f(Math.sin(a) * rr * .7)}`; }).join(' ')}Z" fill="${c}" stroke="${mix(c, '#000000', .2)}" stroke-width="2" stroke-linejoin="round"/>`;
  s.add('near', shadowE(352, 720, 30, .2) + star(350, 712, 30, '#F2804A') + particles(33, 10, 330, 370, 700, 724, '#FFD0A0', 1.4, .9));
  s.hotspot('near', 350, 710, 40, 'estrela');
  // ninho de tartaruga com ovos
  s.add('near', `<ellipse cx="640" cy="726" rx="70" ry="20" fill="#D2AE74"/><ellipse cx="640" cy="722" rx="56" ry="14" fill="#C29A60"/>${[[616, 714], [634, 710], [652, 712], [626, 722], [646, 722], [664, 718]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="9" ry="8" fill="#FBF6EA"/><ellipse cx="${x - 3}" cy="${y - 3}" rx="3" ry="2" fill="#fff"/>`).join('')}<path d="M560,760 q30,-6 60,-30 M700,750 q-20,-6 -40,-24" stroke="#B88C52" stroke-width="3" stroke-dasharray="4 6" fill="none"/>`);
  s.hotspot('near', 640, 716, 46, 'ovo');
  // uva-da-praia (arbusto com cachos)
  s.add('near', canopy(150, 600, 120, 70, ['#3A6E3A', '#5A9448', '#9CCB6A', '#D8EEA0'], 51, { n: 26 }) + canopy(70, 640, 80, 50, ['#3A6E3A', '#5A9448', '#9CCB6A'], 52, { n: 16 }));
  [[120, 620], [170, 632], [210, 612]].forEach(([x, y]) => s.add('near', Array.from({ length: 8 }, (_, i) => `<circle cx="${x + (i % 3) * 7 - 7}" cy="${y + Math.floor(i / 3) * 7}" r="4.2" fill="${i % 2 ? '#7A3A6A' : '#9A4A86'}"/>`).join('')));
  s.hotspot('near', 170, 626, 44, 'uva');
  s.add('near', L.caranguejo(900, 700, 1.1));
  s.add('fg', `<g filter="${s.blur(1)}">${palm(1330, 820, { h: 560, lean: -110, seed: 9, len: 240, w: 18, col: ['#1A4A28', '#245E32', '#3A7A44'], trunk: ['#5A4030', '#7A5A40'] })}</g>`);
  s.add('fg', `<g filter="${s.blur(2.5)}">${grass(71, 30, -20, 160, 780, 810, ['#8AA05A', '#6E8A44'], 40, 80, .1, 3)}</g>`);
  finish(s, { vignette: '#1A3A4A', vo: .2, warm: '#FFE8A0', warmO: .08 });
  return s;
}

// =============================================================================================
// 03 · MATA ATLÂNTICA — manhã de neblina, cachoeira (Vale do M-L-F / Trilha do V-S-N)
// =============================================================================================
function mata() {
  const s = new Scene('mata');
  sky(s, [[0, '#BFD8D0'], [.4, '#E6EEDA'], [.7, '#F4EED4']]);
  sunGlow(s, 760, 120, 0, '#FFF', '#FFF2C8', 600, .6);
  s.add('sky', `<circle cx="1090" cy="120" r="30" fill="#FFFFFF" opacity=".75"/><circle cx="1080" cy="116" r="30" fill="#E8EEE0" opacity=".9"/>`);
  s.hotspot('sky', 1092, 122, 40, 'lua');
  // serras em camadas com neblina
  const fog = '#E8EEDF';
  [[310, 70, '#5E8A72', .62, 2], [360, 60, '#4E7E60', .48, 4], [420, 50, '#3E6E4E', .34, 6]].forEach(([y, a, c, k, sd]) => {
    const r = ridge(sd, y, a, { fr: [.9, 2.2, 5, 13], wt: [1, .5, .25, .12] });
    s.add('far', `<path d="${r.d}" fill="${mix(c, fog, k)}"/>`);
    let tr = ''; for (let x = -10; x < W + 20; x += 18) tr += `<circle cx="${x}" cy="${f(r.y(x) + 4)}" r="${10 + (x * 7 % 6)}" fill="${mix(c, fog, k)}"/>`;
    s.add('far', tr + `<rect x="0" y="${y + 10}" width="${W}" height="120" fill="${s.lin([[0, fog, 0], [.5, fog, .7], [1, fog, 0]])}"/>`);
  });
  // penhasco com cachoeira (mid)
  const cliff = 'M500,630 L520,470 Q526,400 560,350 Q590,300 640,282 L652,276 L730,276 L748,284 Q800,300 830,350 Q858,410 866,500 L884,630Z';
  s.add('mid', `<path d="${cliff}" fill="${s.lin([[0, '#7A8270'], [.5, '#5E6656'], [1, '#3E4638']], 0, 0, 1, 0)}"/>`);
  s.add('mid', [[530, 420, 600, 400], [520, 500, 610, 490], [780, 380, 850, 400], [800, 470, 860, 480], [540, 560, 620, 556], [770, 560, 870, 566]].map(([a, b, c, d]) => `<path d="M${a},${b} Q${(a + c) / 2},${b - 8} ${c},${d}" stroke="#8E9684" stroke-width="3" fill="none" opacity=".6"/><path d="M${a},${b + 4} Q${(a + c) / 2},${b - 4} ${c},${d + 4}" stroke="#2E3628" stroke-width="2" fill="none" opacity=".4"/>`).join(''));
  s.add('mid', canopy(570, 300, 80, 34, ['#2E5A34', '#3E7A44', '#6EA860', '#B8DC90'], 81, { lx: .3 }) + canopy(820, 306, 76, 32, ['#2E5A34', '#3E7A44', '#6EA860', '#B8DC90'], 82, { lx: -.3 }) + canopy(540, 470, 30, 14, ['#3E6A3A', '#5A8A48', '#8AB868'], 83) + canopy(850, 430, 26, 12, ['#3E6A3A', '#5A8A48', '#8AB868'], 84));
  s.add('mid', `<path d="M650,274 Q690,266 732,274 Q746,310 756,570 Q690,588 624,570 Q634,310 650,274Z" fill="${s.lin([[0, '#F4FBFA'], [.4, '#CFE8EA'], [1, '#F4FAF8']])}"/><path d="M650,274 Q690,266 732,274 Q720,284 690,282 Q660,284 650,274Z" fill="#FFFFFF"/>`);
  let st = ''; const rw = rng(3); for (let i = 0; i < 34; i++) { const x = 650 + rw() * 82, y0 = 280 + rw() * 60; st += `<path d="M${f(x)},${f(y0)} Q${f(x + (x - 690) * .05)},${f(y0 + 120)} ${f(x + (x - 690) * .16)},${f(460 + rw() * 110)}" stroke="${rw() < .5 ? '#FFFFFF' : '#A8D4D8'}" stroke-width="${f(1 + rw() * 2.5)}" opacity="${f(.4 + rw() * .5)}" stroke-linecap="round" fill="none"/>`; }
  s.add('mid', st + `<ellipse cx="690" cy="570" rx="140" ry="36" fill="#FFFFFF" opacity=".8" filter="${s.blur(12)}"/>${particles(9, 40, 600, 780, 520, 600, '#FFFFFF', 2.4, .8)}`);
  // poço
  s.add('mid', `<path d="M480,600 Q690,560 900,600 Q900,640 690,646 Q480,640 480,600Z" fill="${s.lin([[0, '#7EB8B0'], [1, '#3E7E78']])}"/>${shimmer(8, 40, 520, 860, 590, 640, '#FFFFFF', .6, 690, 20)}`);
  // árvores da mata (mid) – quaresmeiras, embaúbas, palmitos, samambaiaçus
  s.add('mid', tree(300, 600, { h: 200, w: 14, crown: [190, 120], cols: ['#6A3E8A', '#8E5AB0', '#B98AD8', '#E2C8F2'], seed: 21, lobes: 4, n: 18, lx: .3 }));
  s.add('mid', tree(1010, 600, { h: 220, w: 15, crown: [200, 130], cols: ['#2E5A30', '#3E7A3A', '#6EA858', '#B4D890'], seed: 22, lobes: 4, n: 18, lx: -.3 }));
  s.add('mid', embauba(430, 610, { h: 270, seed: 5 }) + embauba(910, 600, { h: 240, seed: 6 }));
  s.add('mid', `<g transform="translate(1160,610) scale(.8) translate(-1160,-610)">${palm(1160, 610, { h: 300, lean: 10, seed: 11, len: 110, nuts: false, col: ['#2E5A30', '#3E7A3A', '#7EB060'], trunk: ['#7A7060', '#9A9080'], w: 6 })}</g>`);
  s.add('mid', treeFern(180, 640, { h: 170, seed: 7 }) + treeFern(860, 650, { h: 120, seed: 8, len: 70 }));
  s.add('mid', L.tucano(1000, 420, 1.1, true));
  // chão da floresta (near)
  const fl = ridge(31, 640, 14, { fr: [1, 2.5, 6], wt: [1, .4, .2] });
  s.add('near', `<path d="${fl.d}" fill="${s.lin([[0, '#5E7238'], [.4, '#455A2A'], [1, '#2A3818']])}"/>`);
  { const rl = rng(66); let lit = ''; for (let i = 0; i < 160; i++) { const x = rl() * W, y = 650 + Math.pow(rl(), .8) * 150, k = (y - 640) / 160; lit += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(3 + k * 6)}" ry="${f(1.5 + k * 2.5)}" transform="rotate(${f(rl() * 180)} ${f(x)} ${f(y)})" fill="${['#8A6A3A', '#A8783A', '#6A5A2E', '#C2903E'][i % 4]}" opacity="${f(.5 + rl() * .4)}"/>`; } s.add('near', lit); }
  s.add('near', `<g transform="translate(330,720) scale(.55) translate(-330,-720)">${treeFern(330, 720, { h: 8, seed: 33, len: 110, n: 9 })}</g><g transform="translate(1080,760) scale(.6) translate(-1080,-760)">${treeFern(1080, 760, { h: 8, seed: 34, len: 110, n: 9 })}</g>`);
  // poça de lama
  s.add('near', `<ellipse cx="500" cy="720" rx="110" ry="26" fill="#5A3E26"/><ellipse cx="500" cy="716" rx="94" ry="19" fill="#7A5434"/><ellipse cx="470" cy="710" rx="30" ry="5" fill="#A88262" opacity=".7"/>${[[440, 724], [540, 712], [560, 726]].map(([x, y]) => `<path d="M${x},${y} l-4,4 m8,-4 l4,4 m-4,-6 v6" stroke="#4A3220" stroke-width="2"/>`).join('')}`);
  s.hotspot('near', 500, 714, 54, 'lama');
  // tronco caído com fila de formigas
  s.add('near', `<path d="M760,700 L1120,672 Q1140,690 1124,708 L770,734 Q750,718 760,700Z" fill="#6A4A30"/><path d="M770,708 L1110,682" stroke="#8A6A48" stroke-width="6" stroke-linecap="round" opacity=".7"/><ellipse cx="1122" cy="690" rx="12" ry="18" fill="#9A7A56"/><ellipse cx="1122" cy="690" rx="7" ry="11" fill="#7A5A3A"/>${[0, 1, 2, 3].map(i => `<path d="M${800 + i * 70},700 q10,-14 24,-6" stroke="#4E8A3A" stroke-width="5" fill="none" stroke-linecap="round"/>`).join('')}`);
  let ants = ''; for (let i = 0; i < 13; i++) { const x = 830 + i * 19, y = 696 - i * 1.5; ants += `<g transform="translate(${x},${f(y)}) scale(1.6)"><ellipse cx="-3" cy="0" rx="2.6" ry="1.8" fill="#2A140C"/><ellipse cx="1" cy="0" rx="1.6" ry="1.2" fill="#2A140C"/><circle cx="4" cy="-.5" r="1.5" fill="#2A140C"/><path d="M-3,1 l-2,3 M0,1 l0,3 M1,1 l2,3" stroke="#2A140C" stroke-width=".7"/>${i % 2 === 0 ? `<path d="M2,-2 l4,-9 l5,5z" fill="#8ED060"/>` : ''}</g>`; }
  s.add('near', ants);
  s.hotspot('near', 950, 686, 48, 'fila');
  // árvore com oco e favo (jataí)
  s.add('near', `<path d="M20,${H + 10} Q70,720 80,640 Q66,450 92,-20 L208,-20 Q222,450 220,640 Q236,720 300,${H + 10}Z" fill="${s.lin([[0, '#3A2A1E'], [.35, '#6A5038'], [.6, '#5A4430'], [1, '#2A1E14']], 0, 0, 1, 0)}"/>${[110, 130, 170, 190].map((x, i) => `<path d="M${x},${H} Q${x - 6 + i * 3},520 ${x + 2},-20" stroke="${i % 2 ? '#2A1E14' : '#8A6A4A'}" stroke-width="${i % 2 ? 3 : 5}" fill="none" opacity=".45"/>`).join('')}<path d="M90,260 Q110,330 92,420 Q100,520 84,620" stroke="#5E7A3A" stroke-width="14" fill="none" opacity=".55" stroke-linecap="round"/><path d="M60,${H} Q100,740 130,700 M260,${H} Q220,740 200,700" stroke="#4A3828" stroke-width="16" fill="none" stroke-linecap="round"/>`);
  s.add('near', `<ellipse cx="160" cy="470" rx="26" ry="38" fill="#2A1A10"/><path d="M144,452 h32 v40 h-32z" fill="#E8B030" clip-path="${s.clip('<ellipse cx="160" cy="470" rx="22" ry="34"/>')}"/>${[0, 1, 2, 3].map(r => [0, 1, 2].map(c => `<path transform="translate(${148 + c * 11 + (r % 2) * 5},${448 + r * 10})" d="M0,-5 L4.3,-2.5 L4.3,2.5 L0,5 L-4.3,2.5 L-4.3,-2.5Z" fill="#F2C24A" stroke="#C88A18" stroke-width="1.2"/>`).join('')).join('')}${L.abelhas(186, 450, 7, 4)}`);
  s.hotspot('near', 160, 470, 42, 'favo');
  s.add('near', mico_branch(s));
  // ninho com ovo
  s.add('near', `<g transform="translate(1210,560)"><path d="M-80,-40 Q0,-20 90,-60" stroke="#4A3828" stroke-width="12" fill="none" stroke-linecap="round"/><path d="M-30,-40 Q0,-10 30,-40 Q0,-50 -30,-40Z" fill="#8A6A42"/>${Array.from({ length: 10 }, (_, i) => `<path d="M${-30 + i * 6},-38 l8,-6" stroke="#B08A5A" stroke-width="1.6"/>`).join('')}<ellipse cx="-8" cy="-44" rx="8" ry="6" fill="#DCEFF0"/><ellipse cx="8" cy="-45" rx="8" ry="6" fill="#CFE8EA"/></g>`);
  s.hotspot('near', 1210, 514, 34, 'ovo');
  s.add('near', grass(41, 90, 240, W, 650, 790, ['#3E6A2A', '#4E7A34', '#2E5A22', '#5E8A3E'], 8, 22));
  s.add('near', bromelia(300, 760, 1.1) + bromelia(1150, 760, .9, ['#3F7A3E', '#6FAE55'], '#F2A33A'));
  s.add('near', L.borboleta(640, 620, 1.4, '#3D7DE0', '#9FD0FF', 10));
  // primeiro plano: folhas grandes escuras
  s.add('fg', `<g filter="${s.blur(2.5)}">${bigLeaves(-30, 810, 1.5, 11, ['#16281A', '#1E3624', '#24402A'], 1, 7, 5, 85)}${bigLeaves(1310, 820, 1.5, 12, ['#16281A', '#1E3624', '#24402A'], -1, 7, 5, 85)}</g>`);
  s.add('fg', `<g filter="${s.blur(1.5)}">${bigLeaves(60, -20, 1.2, 13, ['#1A2E1E', '#22402A', '#2E5236'], 1, 7, 110, 200)}${bigLeaves(1230, -30, 1.2, 14, ['#1A2E1E', '#22402A', '#2E5236'], -1, 7, 110, 200)}</g><path d="M420,0 Q440,160 400,300 Q392,330 404,360" stroke="#2E3A22" stroke-width="5" fill="none"/><path d="M1080,0 Q1060,120 1090,230" stroke="#2E3A22" stroke-width="4" fill="none"/>${[[404, 360], [1090, 230]].map(([x, y]) => `<path d="M${x},${y} q-10,10 -2,22 q10,-6 2,-22z" fill="#3E6A3A"/>`).join('')}`);
  rays(s, 760, -40, [1.25, 1.45, 1.7, 1.95], 1000, '#FFF6D8', .3, 'fg', .04);
  s.add('fg', particles(51, 50, 300, 1100, 200, 700, '#FFF8DA', 2, .6));
  finish(s, { vignette: '#1A2A1A', vo: .3, warm: '#FFE6A0', warmO: .08 });
  return s;
}
function mico_branch(s) {
  return `<path d="M230,330 Q330,320 420,350" stroke="#4A3828" stroke-width="10" fill="none" stroke-linecap="round"/>${canopy(430, 340, 50, 24, ['#2E5A30', '#3E7A3A', '#6EA858'], 61, { n: 8 })}${L.mico(320, 316, 1.05, false)}`;
}

// =============================================================================================
// 04 · PAMPA — pôr do sol nas coxilhas (dia → noite)
// =============================================================================================
function pampa() {
  const s = new Scene('pampa');
  const sunX = 600, sunY = 452;
  sky(s, [[0, '#3E4A86'], [.3, '#8E6AA0'], [.52, '#E8907A'], [.62, '#F8C27A']]);
  sunGlow(s, sunX, sunY, 40, '#FFF0C0', '#FFB060', 700, .8);
  s.add('sky', `<circle cx="200" cy="140" r="22" fill="#FFF6E6" opacity=".9"/><circle cx="200" cy="140" r="40" fill="#FFF6E6" opacity=".12"/>${particles(41, 30, 0, 600, 20, 220, '#FFFFFF', 1.2, .8)}`);
  s.add('sky', cloud(s, 420, 300, 300, '#FFC79A', '#B0607A', 21, .85) + cloud(s, 1100, 250, 240, '#FFD0A0', '#B86A80', 22, .8) + cloud(s, 760, 200, 160, '#FFC0A0', '#A0607A', 23, .6));
  s.add('sky', birdV(640, 330, 1, '#4A2A3A') + birdV(680, 350, .7, '#4A2A3A'));
  const haze = '#F4B48A';
  [[470, 18, '#8A7A8A', .5, 3], [500, 22, '#7A7A62', .35, 5]].forEach(([y, a, c, k, sd]) => { const r = ridge(sd, y, a, { fr: [.7, 1.6, 3.2], wt: [1, .5, .2] }); s.add('far', `<path d="${r.d}" fill="${mix(c, haze, k)}"/>`); });
  // estância distante
  const fx = 300, fy = 492;
  s.add('far', `<rect x="${fx}" y="${fy - 26}" width="70" height="26" fill="${mix('#F0E0D0', haze, .3)}"/><path d="M${fx - 6},${fy - 24} L${fx + 35},${fy - 44} L${fx + 76},${fy - 24}Z" fill="${mix('#9A3A2A', haze, .3)}"/><rect x="${fx + 28}" y="${fy - 14}" width="12" height="14" fill="#5A3A2A"/>`);
  s.add('far', `<path d="M420,${fy} V${fy - 60}" stroke="#5A4A4A" stroke-width="2"/>${[0, 1, 2, 3, 4, 5, 6, 7].map(i => `<path d="M420,${fy - 60} l${f(Math.cos(i * Math.PI / 4) * 16)},${f(Math.sin(i * Math.PI / 4) * 16)}" stroke="#5A4A4A" stroke-width="2"/>`).join('')}<path d="M412,${fy} L420,${fy - 60} L428,${fy}" stroke="#5A4A4A" stroke-width="1.5" fill="none"/>`);
  // coxilhas médias
  const m1 = ridge(7, 540, 26, { fr: [.6, 1.5, 3], wt: [1, .4, .15] });
  s.add('mid', `<path d="${m1.d}" fill="${s.lin([[0, '#9A9A52'], [1, '#6E7A3A']])}"/>`);
  s.add('mid', `<path d="${m1.d}" fill="${s.rad([[0, '#FFC070', .5], [1, '#FFC070', 0]], .67, 0, .5)}"/>`);
  // umbu (Phytolacca) solitário
  const ux = 980, uy = m1.y(980) + 6;
  s.add('mid', L.castShadow(s, ux, uy, 340, 12, 0, .35, '#2A1A24') + `<path d="M${ux - 56},${uy} Q${ux - 34},${uy - 10} ${ux - 30},${uy - 40} Q${ux - 26},${uy - 80} ${ux - 50},${uy - 120} L${ux - 30},${uy - 126} Q${ux},${uy - 96} ${ux + 6},${uy - 130} L${ux + 26},${uy - 128} Q${ux + 22},${uy - 90} ${ux + 54},${uy - 118} L${ux + 64},${uy - 108} Q${ux + 30},${uy - 70} ${ux + 34},${uy - 30} Q${ux + 40},${uy - 8} ${ux + 66},${uy}Z" fill="${s.lin([[0, '#6A5248'], [.5, '#4A3A34'], [1, '#2E2420']], 0, 0, 1, 0)}"/><path d="M${ux - 20},${uy - 6} Q${ux - 14},${uy - 60} ${ux - 34},${uy - 110}" stroke="#8A6E5E" stroke-width="5" fill="none" opacity=".6"/>` + canopy(ux - 60, uy - 150, 110, 52, ['#3A4A2A', '#526A34', '#86904A', '#E8B070'], 31, { lx: -.6, ly: -.5 }) + canopy(ux + 70, uy - 150, 100, 48, ['#3A4A2A', '#526A34', '#86904A', '#E8B070'], 32, { lx: -.6, ly: -.5 }) + canopy(ux, uy - 186, 120, 54, ['#3A4A2A', '#526A34', '#86904A', '#E8B070'], 33, { lx: -.6, ly: -.5 }));
  [[560, 1], [640, 1.05], [720, .95]].forEach(([x, k], i) => s.add('mid', L.cavalo(x, m1.y(x) + 8, .42 * k, i % 2 === 0, ['#6A3A26', '#3A2A22', '#A87A52'][i], '#2A1A12')));
  s.add('mid', grass(11, 160, 0, W, 520, 600, ['#A8A050', '#8A8A44', '#C2B060'], 4, 10));
  // primeiro plano: campo + açude
  const n1 = ridge(9, 610, 14, { fr: [.8, 2], wt: [1, .3] });
  s.add('near', `<path d="${n1.d}" fill="${s.lin([[0, '#7E8A3E'], [1, '#4E5A28']])}"/>`);
  const ac = 'M560,690 Q600,650 760,648 Q930,646 980,680 Q990,716 800,722 Q600,724 560,690Z';
  s.add('near', `<path d="${ac}" fill="#5A6A30"/><path d="M572,688 Q610,658 760,656 Q920,654 968,682 Q970,708 800,714 Q610,716 572,688Z" fill="${s.lin([[0, '#F8B07A'], [1, '#B06A7A']])}"/>${shimmer(14, 40, 600, 960, 664, 712, '#FFE6B0', .8, 860, 26)}`);
  s.add('near', L.pato(700, 690, 1, false, '#7A5A3A') + L.pato(752, 700, .8, false, '#6A4A2A'));
  s.hotspot('near', 712, 676, 38, 'pato');
  // cerca com bota no moirão
  s.add('near', fence(-10, 440, 650, 70, '#5A3A26', 70, 0) + `<path d="M440,650 L1300,630" stroke="#3A2A20" stroke-width="1.4" opacity=".7"/><path d="M440,632 L1300,612" stroke="#3A2A20" stroke-width="1.4" opacity=".7"/>`);
  s.add('near', `<g transform="translate(372,722)">${shadowE(14, 2, 34, .35)}<path d="M-14,-62 L14,-62 L16,-18 Q36,-18 46,-8 Q50,0 44,2 L-14,2Z" fill="${s.lin([[0, '#8A4E2A'], [1, '#5A2E16']], 0, 0, 1, 0)}"/><path d="M-16,-66 h32 v8 h-32z" fill="#4A2412"/><path d="M-14,2 L46,2 L46,-2 L-14,-2Z" fill="#2A140A"/><path d="M-8,-56 V-8" stroke="#B87A4A" stroke-width="4" opacity=".6" stroke-linecap="round"/><path d="M-12,-40 q14,6 26,0 M-12,-30 q14,6 26,0" stroke="#C89060" stroke-width="1.6" fill="none" opacity=".8"/><path d="M18,-14 q14,0 24,8" stroke="#B87A4A" stroke-width="2.5" fill="none" opacity=".6"/></g>`);
  s.hotspot('near', 384, 694, 44, 'bota');
  // boi (próximo) e tatu-mulita
  s.add('near', L.castShadow(s, 1060, 720, 160, 8, 0, .3, '#2A1A1A') + L.boi(1040, 722, 1.05, true, '#E8DCCB'));
  s.hotspot('near', 1030, 662, 54, 'boi');
  s.add('near', L.tatu(490, 750, .9, false));
  s.hotspot('near', 500, 730, 38, 'tatu');
  // pote de barro junto ao moirão
  s.add('near', `<g transform="translate(150,720)">${shadowE(4, 0, 30, .35)}<path d="M-22,0 Q-34,-26 -16,-44 L-14,-52 L14,-52 L16,-44 Q34,-26 22,0Z" fill="#B0603A"/><ellipse cx="0" cy="-52" rx="16" ry="5" fill="#8A4626"/><path d="M-18,-30 Q0,-24 18,-30" stroke="#E0905A" stroke-width="3" fill="none"/><path d="M-14,-36 Q-20,-20 -12,-6" stroke="#E8A070" stroke-width="4" fill="none" opacity=".6" stroke-linecap="round"/></g>`);
  s.hotspot('near', 150, 692, 38, 'pote');
  s.add('near', L.ema(1200, 640, .75, true) + L.queroquero(590, 744, 1.1, false) + L.queroquero(900, 744, .9, true));
  s.add('near', grass(13, 220, 0, W, 630, 800, ['#8A9040', '#6E7A34', '#A8A050', '#C8A060'], 8, 26));
  s.add('near', flowers(16, 30, 0, W, 640, 790, ['#F2C94C', '#FFFFFF', '#E89ACB'], 2.6));
  s.add('fg', `<g filter="${s.blur(2.5)}">${grass(17, 50, -20, 360, 780, 812, ['#4A4A22', '#5E5A2A', '#3A3A1A'], 50, 110, .25, 4)}${grass(18, 40, 1000, 1300, 784, 812, ['#4A4A22', '#5E5A2A'], 40, 90, -.2, 4)}</g>`);
  rays(s, sunX, sunY, [3.3, 3.55, 3.8, 4.1, 5.3, 5.6, 5.9], 900, '#FFD8A0', .2, 'sky', .05);
  finish(s, { vignette: '#2A1630', vo: .32, warm: '#FF9A60', warmO: .12 });
  return s;
}

// =============================================================================================
// 05 · PANTANAL — amanhecer dourado, campo alagado
// =============================================================================================
function pantanal() {
  const s = new Scene('pantanal');
  const sunX = 250, sunY = 330;
  sky(s, [[0, '#7A9CC2'], [.35, '#C8C6C8'], [.55, '#F4D2A0'], [.62, '#FAE2B8']]);
  sunGlow(s, sunX, sunY, 34, '#FFF6D8', '#FFD08A', 620, .8);
  // chuva ao longe (direita)
  s.add('sky', cloud(s, 1060, 250, 340, '#D8D4DA', '#7A7A8E', 31, .95));
  let rain = ''; for (let i = 0; i < 40; i++) { const x = 920 + i * 7; rain += `<path d="M${x},258 L${x - 18},420" stroke="#8A8EA2" stroke-width="1.6" opacity=".35"/>`; }
  s.add('sky', `<g filter="${s.blur(1.5)}">${rain}</g><path d="M900,250 L1200,250 L1180,420 L880,420Z" fill="#9A9EB0" opacity=".25" filter="${s.blur(14)}"/>`);
  s.hotspot('sky', 1050, 330, 52, 'chuva');
  s.add('sky', cloud(s, 560, 160, 220, '#FFF0DA', '#D8A8A0', 32, .8) + birdV(420, 250, 1, '#3A2A2A') + birdV(450, 270, .8, '#3A2A2A') + birdV(400, 276, .7, '#3A2A2A'));
  const hz = 440, haze = '#F4D8B0';
  // capões no horizonte
  let cap = ''; const rc = rng(9); for (let x = -20; x < W + 20; x += 26) { if (rc() < .35) continue; const h = 14 + rc() * 22; cap += `<ellipse cx="${x}" cy="${hz - h * .4}" rx="${16 + rc() * 22}" ry="${h}" fill="${mix('#4E6A44', haze, .55)}"/>`; }
  s.add('far', cap + `<rect x="0" y="${hz - 4}" width="${W}" height="8" fill="${mix('#4E6A44', haze, .55)}"/>`);
  [[700, 1], [760, .8], [1240, 1.1]].forEach(([x, k], i) => s.add('far', `<g transform="translate(${x},${hz}) scale(${.22 * k})">${fanPalm(0, 0, { h: 300, seed: 40 + i, len: 90, col: [mix('#3E5A3A', haze, .5), mix('#5E7A4A', haze, .5), mix('#8EA66A', haze, .45)], trunk: [mix('#5A4A3A', haze, .5), '#8A7A6A'] })}</g>`));
  // água espelhada
  const water = `M0,${hz} H${W} V${H} H0Z`;
  s.add('far', `<path d="${water}" fill="${s.lin([[0, '#F6D6A8'], [.25, '#C8B8A8'], [1, '#6E8A8A']])}"/>`);
  s.add('far', `<ellipse cx="${sunX}" cy="${hz + 60}" rx="60" ry="160" fill="#FFF0C8" opacity=".5" filter="${s.blur(16)}"/>${shimmer(5, 120, 0, W, hz + 4, 640, '#FFF4D8', .6, sunX, 30)}`);
  s.add('far', `<rect x="0" y="${hz}" width="${W}" height="60" fill="${haze}" opacity=".45" filter="${s.blur(10)}"/>`);
  // ilha com piúva e ninho de tuiuiú (mid)
  const gid = s.id('piuva');
  let pv = `<path d="M560,520 Q700,500 900,520 L900,530 Q700,540 560,530Z" fill="#5A6A3A"/>`;
  pv += tree(730, 522, { h: 120, w: 10, crown: [170, 80], cols: ['#A8487A', '#C8689A', '#E896BC', '#FFD8E8'], seed: 51, lobes: 4, n: 20, lx: -.7, ly: -.5 });
  pv += `<path d="M700,372 Q730,360 760,372 Q752,386 730,388 Q708,386 700,372Z" fill="#7A5A3A"/>${Array.from({ length: 10 }, (_, i) => `<path d="M${702 + i * 6},376 l6,-8" stroke="#9A7A52" stroke-width="2"/>`).join('')}`;
  pv += L.tuiuiu(718, 376, .5, false) + L.tuiuiu(748, 374, .46, true);
  pv += fanPalm(850, 524, { h: 110, seed: 52, len: 46, col: ['#3E5A3A', '#5E7A4A', '#8EA66A'] });
  s.add('mid', `<g id="${gid}">${pv}</g>` + reflection(s, gid, 526, `M300,526 H1150 V720 H300Z`, .3, 3));
  s.hotspot('mid', 732, 350, 46, 'ninho');
  // jacarés e capivaras
  s.add('mid', L.jacare(420, 590, .9, false) + L.jacare(1010, 610, .7, true));
  s.add('mid', `<path d="M980,560 Q1100,540 1300,552 L1300,580 Q1100,576 980,572Z" fill="#6A7A3A"/>` + L.capivara(1100, 566, .7, true) + L.capivara(1180, 564, .55, false) + L.garca(1040, 562, .6, false));
  // margem próxima com aguapés, chalana e jabuti
  s.add('near', `<path d="M-20,${H + 10} L-20,660 Q200,640 380,660 Q520,680 540,${H + 10}Z" fill="${s.lin([[0, '#6E7A3A'], [1, '#3E4A22']])}"/>`);
  const ch = s.id('chal');
  s.add('near', `<g id="${ch}"><path d="M760,676 L1110,676 Q1100,712 1060,716 L810,716 Q770,704 760,676Z" fill="#8A4A2A"/><path d="M770,684 L1104,684" stroke="#C26A3A" stroke-width="6"/><path d="M800,676 L800,640 L1010,640 L1010,676" fill="none" stroke="#5A3A26" stroke-width="5"/><path d="M790,640 L1020,640 L1000,620 L810,620Z" fill="#E8D0A0"/><path d="M790,640 L1020,640" stroke="#C8A870" stroke-width="3"/><rect x="860" y="652" width="60" height="22" rx="3" fill="#F2E6C8" opacity=".9"/><path d="M1080,676 L1130,600" stroke="#5A3A26" stroke-width="3"/></g>`);
  s.add('near', reflection(s, ch, 716, `M740,716 H1140 V800 H740Z`, .3, 2) + `<path d="M760,716 Q940,724 1110,716" stroke="#FFF0C8" stroke-width="2" opacity=".6" fill="none"/>`);
  s.hotspot('near', 930, 660, 60, 'chalana');
  let ag = ''; const ra = rng(12);
  for (let i = 0; i < 22; i++) { const x = 420 + ra() * 360, y = 700 + ra() * 90; ag += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(14 + ra() * 10)}" ry="${f(6 + ra() * 3)}" fill="${['#3E7A3A', '#5A9A44', '#2E6A30'][i % 3]}"/><path d="M${f(x - 6)},${f(y - 2)} q6,-3 12,0" stroke="#8ACB6A" stroke-width="1.6" fill="none"/>`; if (i % 4 === 0) ag += `<path d="M${f(x)},${f(y - 2)} v-22" stroke="#4E8A3A" stroke-width="2.4"/>${[0, 1, 2].map(k => `<ellipse cx="${f(x + (k - 1) * 4)}" cy="${f(y - 22 - k * 5)}" rx="5" ry="3.4" fill="#A78AD8"/>`).join('')}<circle cx="${f(x)}" cy="${f(y - 30)}" r="1.6" fill="#F2C94C"/>`; }
  s.add('near', ag);
  s.add('near', `<ellipse cx="560" cy="742" rx="34" ry="14" fill="#2E6A30"/><path d="M528,742 Q560,726 592,742" stroke="#8ACB6A" stroke-width="2" fill="none"/><path d="M560,742 L590,736" stroke="#1E4A20" stroke-width="2"/>`);
  s.hotspot('near', 560, 738, 38, 'folha');
  s.add('near', L.castShadow(s, 230, 712, 160, 6, 0, .3, '#2A1A10') + L.jabuti(230, 714, 1.1, true));
  s.hotspot('near', 234, 694, 44, 'jabuti');
  s.add('near', grass(21, 140, -20, 400, 650, 800, ['#7A8A3A', '#5E6E2E', '#9AA850', '#C8B070'], 10, 30));
  s.add('fg', `<g filter="${s.blur(2.5)}">${grass(22, 60, 1000, 1300, 770, 812, ['#3A4A1E', '#4E5A26', '#2E3A16'], 60, 130, -.15, 4)}${grass(23, 30, -20, 200, 786, 812, ['#3A4A1E', '#4E5A26'], 40, 90, .2, 4)}</g>`);
  rays(s, sunX, sunY, [-.2, .05, .3, .55, 2.8, 3.1], 1000, '#FFE8B8', .2, 'sky', .05);
  s.add('fg', particles(61, 40, 0, W, 360, 600, '#FFF4D0', 1.8, .5));
  finish(s, { vignette: '#3A2418', vo: .28, warm: '#FFB870', warmO: .1 });
  return s;
}


// =============================================================================================
// 07 · CAATINGA / SERTÃO — tarde quente, céu profundo (chefe do Ano 1: nasalidade)
// =============================================================================================
function caatinga() {
  const s = new Scene('caatinga');
  const sunX = 1080, sunY = 170;
  sky(s, [[0, '#2F6FB0'], [.35, '#6AA6D2'], [.6, '#F2D6A6'], [.7, '#F6C88A']]);
  sunGlow(s, sunX, sunY, 34, '#FFFBE8', '#FFE2A0', 600, .6);
  s.add('sky', cloud(s, 300, 180, 200, '#FFFFFF', '#E6CDB8', 61, .7) + L.asaBranca(520, 230, 1.1, false) + L.asaBranca(580, 260, .8, false) + L.asaBranca(470, 270, .7, false));
  const haze = '#F0C89A';
  // serras e lajedos (inselbergs)
  s.add('far', `<path d="M-20,470 Q60,380 140,372 Q220,368 280,430 Q330,470 380,470Z" fill="${mix('#A0705A', haze, .5)}"/><path d="M820,470 Q880,350 980,340 Q1080,336 1130,400 Q1170,450 1240,470Z" fill="${mix('#A0705A', haze, .55)}"/><path d="M880,400 Q960,350 1040,352" stroke="${mix('#E8B890', haze, .2)}" stroke-width="6" fill="none" opacity=".6"/>`);
  const r1 = ridge(71, 476, 14, { fr: [1, 2.6, 6], wt: [1, .4, .2] });
  s.add('far', `<path d="${r1.d}" fill="${mix('#8E8A70', haze, .45)}"/>`);
  for (let x = 0; x < W; x += 30) s.add('far', dryBush(x + (x * 7 % 13), r1.y(x) + 4, .45, 200 + x, mix('#7E7468', haze, .45), x % 90 === 0 ? mix('#7A9A5A', haze, .4) : null));
  // planície (mid)
  const r2 = ridge(72, 540, 10, { fr: [1, 2.2], wt: [1, .4] });
  s.add('mid', `<path d="${r2.d}" fill="${s.lin([[0, '#D8A870'], [1, '#C08A52']])}"/>`);
  // casa de taipa com alpendre
  const hx = 470, hy = 560;
  s.add('mid', L.castShadow(s, hx + 140, hy, 260, 10, 0, .3, '#5A2A14'));
  s.add('mid', `<rect x="${hx - 120}" y="${hy - 96}" width="240" height="96" fill="${s.lin([[0, '#E8C8A0'], [1, '#C89A6A']])}"/><path d="M${hx - 120},${hy - 96} L${hx - 120},${hy}" stroke="#A8784A" stroke-width="3"/>${Array.from({ length: 10 }, (_, i) => `<path d="M${hx - 110 + i * 24},${hy - 90} l6,10 M${hx - 104 + i * 24},${hy - 40} l-4,12" stroke="#B88A5A" stroke-width="2" opacity=".6"/>`).join('')}
    <path d="M${hx - 140},${hy - 92} L${hx},${hy - 150} L${hx + 140},${hy - 92}Z" fill="#B0562E"/>${Array.from({ length: 14 }, (_, i) => `<path d="M${hx - 136 + i * 20},${hy - 92 + Math.abs(i - 7) * 0 - (7 - Math.abs(i - 7)) * 8} v${8 + (7 - Math.abs(i - 7)) * 8}" stroke="#8A3E1E" stroke-width="2" opacity=".5"/>`).join('')}
    <path d="M${hx - 150},${hy - 92} L${hx + 150},${hy - 92}" stroke="#7A3418" stroke-width="5"/>
    <rect x="${hx - 22}" y="${hy - 62}" width="44" height="62" fill="#3E86A8"/><rect x="${hx - 18}" y="${hy - 58}" width="36" height="58" fill="#4E9CC0"/><path d="M${hx},${hy - 58} v58" stroke="#2E6A8A" stroke-width="2"/>
    <rect x="${hx - 92}" y="${hy - 70}" width="34" height="30" fill="#3E86A8"/><rect x="${hx + 58}" y="${hy - 70}" width="34" height="30" fill="#3E86A8"/>
    <path d="M${hx - 160},${hy - 60} L${hx - 120},${hy - 92}" stroke="#6A4A2E" stroke-width="4"/><path d="M${hx - 162},${hy} V${hy - 60}" stroke="#6A4A2E" stroke-width="6"/>`);
  // cisterna
  s.add('mid', `<g transform="translate(660,566)"><ellipse cx="0" cy="0" rx="46" ry="10" fill="#9A7A5A" opacity=".5"/><path d="M-44,0 V-40 Q0,-56 44,-40 V0 Q0,10 -44,0Z" fill="#EDE6DA"/><ellipse cx="0" cy="-40" rx="44" ry="10" fill="#D8D0C2"/><path d="M-30,-36 V-4" stroke="#fff" stroke-width="6" opacity=".6"/><path d="M-44,-20 Q0,-8 44,-20" stroke="#4E9CC0" stroke-width="4" fill="none"/></g>`);
  // juazeiro verde + mandacarus médios
  s.add('mid', tree(780, 560, { h: 60, w: 9, crown: [120, 56], cols: ['#4A6A34', '#668A40', '#9AB860', '#D8E8A0'], seed: 73, lobes: 3, lx: .4 }));
  s.add('mid', cactus(940, 556, { h: 150, w: 10, arms: [[.42, -1, 34, 40], [.55, 1, 30, 30]], col: ['#4F7F5A', '#6FA073', '#A4CBA0'] }) + cactus(160, 556, { h: 120, w: 9, arms: [[.5, 1, 28, 30]] }));
  s.add('mid', dryBush(1060, 556, 1, 81, '#8A8076') + dryBush(1180, 560, .9, 82, '#8A8076') + dryBush(660, 562, .8, 83, '#8A8076') + dryBush(250, 560, 1, 84, '#8A8076') + dryBush(320, 566, .7, 85, '#9A9086'));
  // jumento à sombra
  s.add('mid', L.castShadow(s, 830, 586, 100, 5, 0, .3) + L.jumento(830, 588, .8, true));
  s.hotspot('mid', 830, 540, 46, 'jumento');
  // alpendre: banco com sanfona e moringa
  s.add('mid', `<g transform="translate(${hx - 70},${hy})"><rect x="-30" y="-24" width="60" height="6" fill="#7A4A2A"/><path d="M-26,-18 v18 M26,-18 v18" stroke="#5A3420" stroke-width="4"/>
    <g transform="translate(0,-38)"><rect x="-16" y="-12" width="32" height="26" rx="2" fill="#B0302A"/>${[-10, -4, 2, 8].map(x => `<path d="M${x},-12 v26" stroke="#6A1A16" stroke-width="2"/>`).join('')}<rect x="-20" y="-14" width="6" height="30" fill="#F4ECDC"/><rect x="14" y="-14" width="6" height="30" fill="#2A2A2A"/>${[0, 1, 2, 3].map(i => `<circle cx="17" cy="${-10 + i * 7}" r="1.4" fill="#E8E0D0"/>`).join('')}</g></g>`);
  s.hotspot('mid', hx - 70, hy - 40, 32, 'sanfona');
  s.add('mid', `<g transform="translate(${hx + 70},${hy})">${shadowE(0, 0, 18, .3)}<path d="M-14,0 Q-22,-16 -10,-28 L-6,-38 L6,-38 L10,-28 Q22,-16 14,0Z" fill="#B85A34"/><ellipse cx="0" cy="-38" rx="7" ry="2.5" fill="#7A3418"/><path d="M-10,-18 Q0,-14 10,-18" stroke="#E89A6A" stroke-width="2" fill="none"/></g>`);
  s.hotspot('mid', hx + 70, hy - 20, 30, 'moringa');
  // chão rachado (near)
  const r3 = ridge(74, 600, 10, { fr: [1, 2.4], wt: [1, .3] });
  s.add('near', `<path d="${r3.d}" fill="${s.lin([[0, '#D2A066'], [1, '#A8723E']])}"/>`);
  { const rc = rng(5); let cr = ''; for (let i = 0; i < 40; i++) { let x = rc() * W, y = 620 + rc() * 170; let d = `M${f(x)},${f(y)}`; for (let k = 0; k < 4; k++) { x += (rc() - .5) * 40; y += (rc() - .3) * 10; d += ` L${f(x)},${f(y)}`; } cr += `<path d="${d}" stroke="#8A5A2E" stroke-width="${f(1 + (y - 600) / 120)}" fill="none" opacity=".45"/>`; } s.add('near', cr); }
  // mandacaru grande com flor
  s.add('near', L.castShadow(s, 1000, 760, 220, 8, Math.PI, .3) + cactus(1000, 760, { h: 400, w: 22, arms: [[.36, -1, 70, 120], [.5, 1, 62, 90]], col: ['#3E7050', '#5E9468', '#9CC8A0'] }));
  s.add('near', `<g transform="translate(1000,356)">${[0, 1, 2, 3, 4, 5, 6, 7].map(i => `<ellipse cx="0" cy="-10" rx="5" ry="12" fill="#FFFDF4" transform="rotate(${i * 45})"/>`).join('')}<circle r="5" fill="#F4E08A"/></g><g transform="translate(1066,520)">${[0, 1, 2, 3, 4, 5].map(i => `<ellipse cx="0" cy="-8" rx="4" ry="9" fill="#FFFDF4" transform="rotate(${i * 60})"/>`).join('')}<circle r="4" fill="#F4E08A"/></g>`);
  s.hotspot('near', 1000, 420, 56, 'mandacaru');
  // umbuzeiro com frutos (esquerda)
  s.add('near', L.castShadow(s, 120, 740, 220, 9, Math.PI, .3) + tree(120, 740, { h: 120, w: 15, crown: [170, 80], cols: ['#5A6A3A', '#748A46', '#A8B866', '#E8E8A8'], seed: 75, lobes: 3, lx: .5, ly: -.8 }));
  [[60, 600], [100, 616], [150, 606], [190, 590], [120, 580], [40, 620]].forEach(([x, y]) => s.add('near', `<circle cx="${x}" cy="${y}" r="7" fill="#C8C060"/><circle cx="${x - 2}" cy="${y - 2}" r="2.5" fill="#F0E8A0"/>`));
  s.hotspot('near', 112, 600, 48, 'umbu');
  // xique-xique, pedras e calango
  s.add('near', rock(620, 740, 70, 36, ['#8A7060', '#AE927E', '#D8C0A8'], 77) + L.calango(620, 702, .9, true));
  s.add('near', [[420, 760], [480, 772], [760, 776], [1180, 770]].map(([x, y], i) => `<g transform="translate(${x},${y}) scale(.5)">${cactus(0, 0, { h: 60, w: 10, arms: [[.3, -1, 22, 20], [.4, 1, 20, 16]], col: ['#5A8A60', '#7AAA78', '#B0D0A8'] })}</g>`).join(''));
  s.add('near', grass(76, 70, 0, W, 620, 790, ['#C8A060', '#A8803E', '#E0C080'], 8, 20));
  s.add('fg', `<g filter="${s.blur(2.5)}">${dryBush(-10, 820, 2.3, 91, '#5A4A3E')}${dryBush(1290, 830, 2.2, 92, '#5A4A3E')}</g>`);
  s.add('fg', particles(93, 30, 0, W, 300, 700, '#FFF0C8', 1.6, .4));
  finish(s, { vignette: '#5A2A10', vo: .3, warm: '#FFA850', warmO: .12 });
  return s;
}

// =============================================================================================
// 08 · AMAZÔNIA — manhã úmida no rio, luz entre as copas (abre o Ano 2)
// =============================================================================================
function amazonia() {
  const s = new Scene('amazonia');
  const sunX = 860, sunY = 120;
  sky(s, [[0, '#9CC4C0'], [.35, '#D8E6D0'], [.55, '#F4ECCC']]);
  sunGlow(s, sunX, sunY, 28, '#FFFBE8', '#FFF0C0', 560, .7);
  s.add('sky', cloud(s, 300, 110, 220, '#FFFFFF', '#CADAD0', 81, .7) + cloud(s, 1100, 160, 180, '#FFFFFF', '#CADAD0', 82, .6));
  const fog = '#E4ECDC', hz = 452;
  // muralhas de floresta em camadas
  [[372, '#4E7A5A', .6, 1], [404, '#3E6A48', .42, 2], [440, '#2E5A3A', .25, 3]].forEach(([y, c, k, sd]) => {
    const rr = rng(sd * 11); let g = '';
    for (let x = -30; x < W + 40; x += 22 + rr() * 14) { const r = 18 + rr() * 22; g += `<circle cx="${f(x)}" cy="${f(y - rr() * 18)}" r="${f(r)}"/>`; }
    g += `<rect x="-20" y="${y}" width="${W + 40}" height="${hz - y + 10}"/>`;
    s.add('far', `<g fill="${mix(c, fog, k)}">${g}</g><rect x="0" y="${y - 6}" width="${W}" height="${hz - y + 20}" fill="${s.lin([[0, fog, 0], [1, fog, .55]])}"/>`);
  });
  // sumaúma emergente
  s.add('far', `<path d="M300,${hz} L304,250 L316,250 L320,${hz}Z" fill="${mix('#6A6A5A', fog, .45)}"/>${canopy(310, 236, 120, 34, [mix('#3E6A48', fog, .45), mix('#5A8A5A', fog, .45), mix('#8AB880', fog, .4)], 84)}`);
  // rio
  s.add('far', `<path d="M0,${hz} H${W} V${H} H0Z" fill="${s.lin([[0, '#E8E2C4'], [.3, '#B8A878'], [1, '#6A5A3A']])}"/>${shimmer(85, 120, 0, W, hz + 4, 680, '#FFF8E0', .55, sunX, 34)}`);
  s.add('far', `<rect x="0" y="${hz - 2}" width="${W}" height="40" fill="${fog}" opacity=".5" filter="${s.blur(8)}"/>`);
  // palafitas (mid)
  const pid = s.id('pal');
  let pal = '';
  [[560, 70, '#E8A040'], [660, 90, '#5AA0B8']].forEach(([x, w, c]) => { pal += `${[0, 1, 2, 3].map(i => `<path d="M${x + i * w / 3},${hz + 60} V${hz + 20}" stroke="#5A4030" stroke-width="4"/>`).join('')}<rect x="${x - 6}" y="${hz + 16}" width="${w + 12}" height="6" fill="#7A5A3E"/><rect x="${x}" y="${hz - 30}" width="${w}" height="46" fill="${c}"/><path d="M${x - 10},${hz - 28} L${x + w / 2},${hz - 56} L${x + w + 10},${hz - 28}Z" fill="#B88A50"/><rect x="${x + w * .4}" y="${hz - 16}" width="14" height="32" fill="#4A3020"/>`; });
  pal += `<path d="M520,${hz + 40} q60,8 120,0 q-60,14 -120,0z" fill="#6A3A22"/>`;
  s.add('mid', `<g id="${pid}">${pal}</g>` + reflection(s, pid, hz + 60, `M480,${hz + 60} H800 V${hz + 160} H480Z`, .3, 2));
  // vitórias-régias
  { const rv = rng(86); let vr = ''; for (let i = 0; i < 11; i++) { const x = 1020 + rv() * 240, y = 540 + rv() * 50, r = 16 + rv() * 12; vr += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(r)}" ry="${f(r * .3)}" fill="#3E7A3A"/><ellipse cx="${f(x)}" cy="${f(y - 2)}" rx="${f(r * .92)}" ry="${f(r * .26)}" fill="#5E9A4A"/><path d="M${f(x - r)},${f(y)} q${f(r)},${f(r * .3)} ${f(2 * r)},0" stroke="#A8402E" stroke-width="2" fill="none"/>`; if (i % 4 === 1) vr += `<ellipse cx="${f(x)}" cy="${f(y - 6)}" rx="7" ry="5" fill="#FBE8EE"/><ellipse cx="${f(x)}" cy="${f(y - 8)}" rx="4" ry="3" fill="#F2A8C0"/>`; } s.add('mid', vr); }
  // boto saltando
  s.add('mid', `<ellipse cx="420" cy="572" rx="70" ry="8" fill="#FFFFFF" opacity=".35"/>` + L.boto(420, 566, .9, false) + particles(87, 18, 350, 500, 540, 580, '#FFFFFF', 2, .8));
  // margem direita com açaizeiros
  s.add('mid', `<path d="M980,${hz + 30} Q1100,${hz + 10} 1300,${hz + 20} L1300,${hz + 80} Q1120,${hz + 70} 980,${hz + 40}Z" fill="#3A5A2E"/>`);
  [[1040, 1], [1090, .9], [1150, 1.1], [1220, 1], [1265, .85]].forEach(([x, k], i) => s.add('mid', `<g transform="translate(${x},${hz + 34}) scale(${.5 * k}) translate(${-x},${-(hz + 34)})">${palm(x, hz + 34, { h: 340, lean: (i % 2 ? 1 : -1) * 20, seed: 90 + i, len: 120, nuts: false, w: 5, col: ['#2E5A30', '#3E7A3A', '#7EB060'], trunk: ['#6A6050', '#8A8070'] })}</g>`));
  // margem próxima (near)
  s.add('near', `<path d="M-20,${H + 10} L-20,600 Q160,580 300,610 Q420,640 460,700 Q480,760 520,${H + 10}Z" fill="${s.lin([[0, '#4E6A30'], [1, '#2A3A1A']])}"/>` + grass(181, 120, 0, 470, 610, 790, ['#3E6A2A', '#5A8A3A', '#2E5222', '#7AA850'], 8, 26) + `<g transform="translate(60,780) scale(.7) translate(-60,-780)">${treeFern(60, 780, { h: 6, seed: 182, len: 120, n: 9 })}</g>` + bromelia(420, 760, .9, ['#3F7A3E', '#6FAE55'], '#E2483D'));
  // cacaueiro com frutos no tronco
  s.add('near', tree(180, 640, { h: 160, w: 12, crown: [200, 100], cols: ['#2E5A2E', '#3E7A3A', '#6EA858', '#C0E090'], seed: 88, lobes: 3, lx: .5 }));
  [[170, 590, '#E8A030'], [190, 560, '#C8601E'], [176, 530, '#E8B840']].forEach(([x, y, c]) => s.add('near', `<ellipse cx="${x}" cy="${y}" rx="9" ry="16" fill="${c}"/><path d="M${x - 4},${y - 12} q-2,12 0,24 M${x + 4},${y - 12} q2,12 0,24" stroke="${mix(c, '#000000', .25)}" stroke-width="1.4" fill="none"/><ellipse cx="${x - 3}" cy="${y - 5}" rx="2.5" ry="6" fill="#FFF0B0" opacity=".5"/>`));
  s.hotspot('near', 180, 560, 46, 'cacau');
  // ouriço de castanha no chão
  s.add('near', `<g transform="translate(330,690)">${shadowE(0, 4, 26, .4)}<circle cx="0" cy="-10" r="20" fill="#6A4026"/><circle cx="-5" cy="-15" r="9" fill="#8A5A36"/><path d="M-8,-12 q4,-8 12,-6" stroke="#4A2A16" stroke-width="2" fill="none"/>${[[-30, 0], [26, -2], [12, 6]].map(([a, b]) => `<path transform="translate(${a},${b})" d="M-6,0 Q-6,-10 0,-12 Q6,-10 6,0Z" fill="#7A4A2A"/><path transform="translate(${a},${b})" d="M-3,-2 Q-3,-8 0,-9" stroke="#B88A5A" stroke-width="1.5" fill="none"/>`).join('')}</g>`);
  s.hotspot('near', 330, 680, 42, 'ouriço');
  // garça no tronco submerso
  s.add('near', `<path d="M560,610 L720,594" stroke="#5A4030" stroke-width="10" stroke-linecap="round"/><path d="M640,602 l30,-30 M660,600 l10,-22" stroke="#5A4030" stroke-width="5" stroke-linecap="round"/>` + L.garca(640, 604, 1.05, true));
  s.hotspot('near', 630, 534, 50, 'garça');
  // barco de madeira (recreio)
  const bid = s.id('barco');
  s.add('near', `<g id="${bid}"><path d="M740,700 L1060,700 Q1080,700 1086,686 L1090,676 L720,676 Q722,694 740,700Z" fill="#2E6A8A"/><path d="M726,680 L1086,680" stroke="#F2F2EA" stroke-width="5"/><path d="M726,690 L1080,690" stroke="#E2483D" stroke-width="3"/><rect x="780" y="620" width="240" height="56" fill="#F4EEE0"/><path d="M760,622 L1040,622 L1030,606 L770,606Z" fill="#4E9CC0"/>${[0, 1, 2, 3, 4].map(i => `<rect x="${794 + i * 44}" y="632" width="28" height="22" rx="3" fill="#6AB0C8"/>`).join('')}<path d="M780,620 V676 M1020,620 V676" stroke="#C8C0B0" stroke-width="3"/></g>`);
  s.add('near', reflection(s, bid, 700, `M700,700 H1120 V780 H700Z`, .3, 2) + `<path d="M720,702 Q900,712 1090,702" stroke="#FFF6D8" stroke-width="2" opacity=".6" fill="none"/>`);
  s.hotspot('near', 910, 650, 66, 'barco');
  // peixe (tambaqui) saltando
  s.add('near', `<ellipse cx="560" cy="752" rx="40" ry="6" fill="#FFFFFF" opacity=".35"/><g transform="translate(560,724) rotate(-24)">${L.peixe(0, 0, 1.4, false, '#4A5A5A', '#E8A040')}</g>` + particles(89, 14, 520, 600, 730, 760, '#FFFFFF', 2, .8));
  s.hotspot('near', 560, 724, 40, 'peixe');
  // araras em voo e tucano
  s.add('sky', L.araraVoo(660, 230, .8, false, -14) + L.araraVoo(740, 268, .66, false, -8));
  s.add('near', L.tucano(250, 470, .9, false));
  // moldura: folhas e cipós
  s.add('fg', `<g filter="${s.blur(2)}">${bigLeaves(1310, 840, 1.2, 95, ['#14261A', '#1C3424', '#24402C'], -1, 6, 20, 85)}${bigLeaves(-20, -30, 1.3, 96, ['#1A2E1E', '#22402A', '#2E5236'], 1, 7, 110, 200)}${bigLeaves(1300, -30, 1.2, 97, ['#1A2E1E', '#22402A', '#2E5236'], -1, 6, 110, 200)}</g>`);
  s.add('fg', `<path d="M520,0 Q540,120 500,240 Q490,280 510,320" stroke="#2E3A22" stroke-width="5" fill="none"/><path d="M1000,0 Q980,90 1010,180" stroke="#2E3A22" stroke-width="4" fill="none"/>${[[510, 320], [1010, 180], [500, 240]].map(([x, y]) => `<path d="M${x},${y} q-12,10 -2,24 q12,-8 2,-24z" fill="#3E6A3A"/>`).join('')}`);
  rays(s, sunX, sunY - 160, [1.2, 1.4, 1.6, 1.85, 2.05], 1000, '#FFF6D0', .26, 'fg', .035);
  s.add('fg', particles(98, 50, 200, 1200, 150, 650, '#FFF8DA', 1.8, .5));
  finish(s, { vignette: '#14281A', vo: .32, warm: '#FFE09A', warmO: .08 });
  return s;
}

// =============================================================================================
// 09 · LITORAL E MAR — fim de tarde; corte acima/abaixo d'água (recife)
// =============================================================================================
function litoral() {
  const s = new Scene('litoral');
  const sunX = 380, sunY = 250, wl = 420;
  sky(s, [[0, '#4E86C0'], [.25, '#9EC0DA'], [.48, '#F8D6A8'], [.52, '#FAC890']]);
  sunGlow(s, sunX, sunY, 36, '#FFF8E0', '#FFD08A', 560, .75);
  s.add('sky', cloud(s, 820, 120, 260, '#FFF6EA', '#E0B8B0', 91, .9) + cloud(s, 160, 110, 180, '#FFF6EA', '#E0B8B0', 92, .8));
  s.add('sky', `<g transform="translate(640,170)">${L.fragata(0, 0, 1.1)}</g>` + birdV(720, 220, .9, '#3A3040') + birdV(560, 250, .7, '#3A3040'));
  s.hotspot('sky', 640, 172, 46, 'fragata');
  // mar (superfície)
  const hz = 330;
  s.add('far', `<rect x="0" y="${hz}" width="${W}" height="${wl - hz}" fill="${s.lin([[0, '#5A9AC0'], [1, '#3E8AB0']])}"/>${shimmer(93, 80, 0, W, hz + 3, wl - 6, '#FFF0C8', .7, sunX, 28)}<ellipse cx="${sunX}" cy="${hz + 30}" rx="40" ry="60" fill="#FFF0C8" opacity=".35" filter="${s.blur(10)}"/>`);
  s.add('far', L.baleiaCauda(200, hz + 22, .7) + `<g transform="translate(560,${hz + 8}) scale(.5)">${jangada(0, 0, '#FFF6E8')}</g><g transform="translate(860,${hz + 16}) scale(.7)">${jangada(0, 0, '#F6E2C8')}</g>`);
  // praia e vila à direita (mid, acima d'água)
  s.add('mid', `<path d="M840,${wl} Q960,${wl - 70} 1100,${wl - 86} Q1200,${wl - 96} 1300,${wl - 100} L1300,${wl + 40} L840,${wl + 40}Z" fill="${s.lin([[0, '#F2D8A8'], [1, '#E2BE84']])}"/>`);
  [[1000, 50, '#E8A040'], [1060, 46, '#4E9CC0'], [1112, 52, '#E26D5A'], [1172, 48, '#F4E6C8'], [1226, 50, '#6FB86A']].forEach(([x, w, c], i) => s.add('mid', house(x, wl - 82 - i * 3, w, 40, { wall: c, roof: '#B5541E', roofH: 18 })));
  [[960, 160, -30, 1], [1260, 200, -20, 2], [1180, 150, 20, 3]].forEach(([x, h, lean, sd]) => s.add('mid', `<g transform="translate(${x},${wl - 70}) scale(.7) translate(${-x},${-(wl - 70)})">${palm(x, wl - 70, { h, lean, seed: sd + 100, len: 100 })}</g>`));
  s.add('mid', `<g transform="translate(950,${wl - 40}) rotate(-6)">${jangada(0, 0, '#FFF6E8', true)}</g>`);
  // salsa-da-praia com flor
  s.add('mid', `<path d="M1180,${wl - 60} Q1220,${wl - 70} 1280,${wl - 66}" stroke="#4E8A3A" stroke-width="3" fill="none"/>${[1190, 1214, 1240, 1264].map((x, i) => `<path d="M${x},${wl - 64} q-8,-10 0,-14 q8,4 0,14z" fill="#5A9A44"/>${i % 2 ? '' : `<circle cx="${x + 8}" cy="${wl - 70}" r="7" fill="#C86AB8"/><circle cx="${x + 8}" cy="${wl - 70}" r="2.4" fill="#FBE0F0"/>`}`).join('')}`);
  s.hotspot('mid', 1206, wl - 68, 32, 'flor');
  // linha d'água
  s.add('near', `<path d="M0,${wl} H${W} V${H} H0Z" fill="${s.lin([[0, '#5CC4C8'], [.2, '#2E9AB0'], [.6, '#1E6E98'], [1, '#14466E']])}"/>`);
  s.add('near', `<path d="M0,${wl} H${W}" stroke="#E8FAF8" stroke-width="4" opacity=".9"/><path d="M0,${wl + 6} H${W}" stroke="#A8E8EC" stroke-width="3" opacity=".5"/>`);
  // cáusticas e raios de luz submarinos
  { const rc = rng(94); let ca = ''; for (let i = 0; i < 60; i++) { const x = rc() * W, y = wl + 20 + rc() * 120; ca += `<path d="M${f(x)},${f(y)} q10,-6 20,0 q10,6 20,0" stroke="#BFF4F0" stroke-width="1.6" fill="none" opacity="${f(.15 + rc() * .25)}"/>`; } s.add('near', ca); }
  s.add('near', `<g filter="${s.blur(8)}" style="mix-blend-mode:screen">${[260, 380, 520, 700, 880].map((x, i) => `<path d="M${x},${wl} L${x + 30},${wl} L${x + 120 + i * 10},${H} L${x + 40 + i * 10},${H}Z" fill="#BFF4F0" opacity=".14"/>`).join('')}</g>`);
  // areia do fundo (sobe para a direita)
  s.add('near', `<path d="M-20,${H + 10} L-20,730 Q300,700 600,720 Q900,730 1100,640 Q1200,560 1300,${wl + 40} L1300,${H + 10}Z" fill="${s.lin([[0, '#D8C08A'], [1, '#A88A5A']])}"/>`);
  s.add('near', `<path d="M1100,640 Q1200,560 1300,${wl + 40}" stroke="#F0DCA8" stroke-width="4" opacity=".5" fill="none"/>`);
  // recife de coral
  const coral = (x, y, sc, c, c2, sd) => { const r = rng(sd); let g = ''; for (let i = 0; i < 7; i++) { const a = -Math.PI / 2 + (i / 6 - .5) * 1.8, L1 = 40 + r() * 30; const ex = x + Math.cos(a) * L1 * sc, ey = y + Math.sin(a) * L1 * sc; g += `<path d="M${x},${y} Q${f((x + ex) / 2 + (r() - .5) * 20)},${f((y + ey) / 2)} ${f(ex)},${f(ey)}" stroke="${i % 2 ? c : c2}" stroke-width="${f(9 * sc)}" stroke-linecap="round" fill="none"/>`; } return g; };
  const brain = (x, y, r, c) => `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * .7}" fill="${c}"/>${[0, 1, 2, 3].map(i => `<path d="M${x - r * .8},${y - r * .3 + i * r * .2} q${r * .2},${-r * .15} ${r * .4},0 t${r * .4},0 t${r * .4},0" stroke="${mix(c, '#000000', .25)}" stroke-width="2" fill="none"/>`).join('')}`;
  const fan = (x, y, h, c) => { let g = ''; for (let i = 0; i < 9; i++) { const a = -Math.PI / 2 + (i / 8 - .5) * 1.4; g += `<path d="M${x},${y} Q${f(x + Math.cos(a) * h * .5)},${f(y + Math.sin(a) * h * .6)} ${f(x + Math.cos(a) * h)},${f(y + Math.sin(a) * h)}" stroke="${c}" stroke-width="2.4" fill="none"/>`; } return g + `<path d="M${x - h * .6},${y - h * .5} Q${x},${y - h * 1.1} ${x + h * .6},${y - h * .5}" stroke="${c}" stroke-width="1.6" fill="none" opacity=".7"/>`; };
  s.add('near', fan(160, 740, 110, '#B0407A') + coral(260, 750, 1.2, '#F28C5A', '#F2A86A', 1) + brain(360, 748, 40, '#C8A050') + fan(460, 736, 80, '#7A4AA8') + coral(560, 742, 1, '#E26D8A', '#F28CA8', 2) + brain(680, 740, 34, '#8AA060') + coral(780, 728, 1.1, '#F2B33D', '#F8CC6A', 3));
  // pedra com anêmonas
  s.add('near', rock(900, 730, 90, 60, ['#4E5A60', '#6A787E', '#8E9EA4'], 95) + [[860, 676], [900, 670], [940, 680]].map(([x, y]) => `${[-3, -1, 1, 3].map(i => `<path d="M${x},${y} q${i * 3},-10 ${i * 5},-16" stroke="#F28CA8" stroke-width="3" stroke-linecap="round" fill="none"/>`).join('')}`).join(''));
  s.hotspot('near', 900, 700, 56, 'pedra');
  // estrela-do-mar no fundo
  s.add('near', `<path transform="translate(640,770)" d="${Array.from({ length: 10 }, (_, i) => { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? 13 : 32; return `${i ? 'L' : 'M'}${f(Math.cos(a) * rr)},${f(Math.sin(a) * rr * .7)}`; }).join(' ')}Z" fill="#F2683A" stroke="#B83A22" stroke-width="2" stroke-linejoin="round"/>`);
  s.hotspot('near', 640, 766, 44, 'estrela');
  // peixes, tartaruga
  s.add('near', L.tartaruga(560, 560, 1.4, false));
  const school = (x, y, n, c, c2, sd) => { const r = rng(sd); let g = ''; for (let i = 0; i < n; i++) g += L.peixe(x + (r() - .5) * 160, y + (r() - .5) * 70, .45 + r() * .2, true, c, c2); return g; };
  s.add('near', school(250, 560, 12, '#F2C94C', '#FFF0A0', 7) + school(1000, 600, 9, '#4FA3C7', '#BFE6F4', 8) + L.peixe(820, 520, .9, false, '#E2583A', '#FFB08A'));
  // prancha boiando na linha d'água
  s.add('near', `<g transform="translate(700,${wl + 2}) rotate(-3)"><path d="M-90,0 Q-80,-12 0,-12 Q90,-12 100,-2 Q90,10 0,10 Q-80,10 -90,0Z" fill="#F2B33D"/><path d="M-80,-2 Q0,-8 92,-3" stroke="#E2483D" stroke-width="4" fill="none"/><path d="M-90,0 Q-80,10 0,10 Q90,10 100,-2 L100,4 Q90,16 0,16 Q-80,16 -90,6Z" fill="#7A5A3A" opacity=".35"/></g>`);
  s.hotspot('near', 700, wl - 2, 52, 'prancha');
  s.add('fg', `<g filter="${s.blur(2.5)}">${fan(-10, 820, 200, '#5A2A5A')}${coral(1270, 820, 3, '#7A3A3A', '#8A4A3A', 9)}</g>`);
  s.add('fg', particles(99, 60, 0, W, wl + 20, H, '#DFF8F6', 2.2, .5));
  finish(s, { vignette: '#0E2A3E', vo: .35, warm: '#FFC890', warmO: .06 });
  return s;
}
function jangada(x, y, sail = '#FFF6E8', beach = false) {
  return `<g transform="translate(${x},${y})"><path d="M-50,0 L50,0 L44,8 L-44,8Z" fill="#8A6A44"/><path d="M-4,0 V-110" stroke="#5A4030" stroke-width="3"/><path d="M-2,-108 Q50,-70 44,-4 L-2,-4Z" fill="${sail}"/><path d="M-2,-108 Q30,-80 26,-4" stroke="#E2C8A0" stroke-width="2" fill="none"/>${beach ? '' : `<path d="M-60,10 Q0,4 60,10" stroke="#FFFFFF" stroke-width="2" opacity=".6" fill="none"/>`}</g>`;
}

// =============================================================================================
// 10 · CIDADE DAS LETRAS — hora azul, janelas acesas (quem constrói a cidade?)
// =============================================================================================
function cidade() {
  const s = new Scene('cidade');
  sky(s, [[0, '#1E2A5A'], [.35, '#4A4A8A'], [.6, '#C87A8A'], [.72, '#F2A870']]);
  s.add('sky', particles(101, 70, 0, W, 0, 260, '#FFFFFF', 1.2, .9) + `<circle cx="1080" cy="110" r="24" fill="#FFF4D8"/><circle cx="1092" cy="104" r="22" fill="#3E4280"/>`);
  s.add('sky', cloud(s, 300, 230, 260, '#F2A8A0', '#7A5A8A', 102, .6));
  // silhueta distante
  const haze = '#C88A90';
  { const r = rng(103); let g = ''; let x = -10; while (x < W) { const w = 30 + r() * 50, h = 40 + r() * 110; g += `<rect x="${f(x)}" y="${f(470 - h)}" width="${f(w)}" height="${f(h + 10)}" fill="${mix('#4A3A6A', haze, .45)}"/>`; for (let k = 0; k < 6; k++) if (r() < .5) g += `<rect x="${f(x + 6 + r() * (w - 14))}" y="${f(470 - h + 10 + r() * (h - 20))}" width="4" height="5" fill="#FFD890" opacity=".8"/>`; x += w + 4; } s.add('far', g); }
  s.add('far', `<rect x="0" y="430" width="${W}" height="60" fill="${haze}" opacity=".4" filter="${s.blur(12)}"/>`);
  // rua: sobrados coloridos (mid)
  const by = 560;
  s.add('mid', `<rect x="0" y="${by}" width="${W}" height="${H - by}" fill="#5A4A5A"/>`);
  const sob = [[-20, 170, 200, '#E8A040'], [150, 150, 170, '#4E9CC0'], [300, 160, 190, '#E26D5A'], [800, 150, 180, '#6FB86A'], [950, 170, 210, '#F2D8A8'], [1120, 180, 186, '#B56FD0']];
  sob.forEach(([x, w, h, c]) => {
    let g = `<rect x="${x}" y="${by - h}" width="${w}" height="${h}" fill="${c}"/><rect x="${x}" y="${by - h}" width="${w}" height="${h}" fill="#2A2050" opacity=".35"/><rect x="${x - 4}" y="${by - h - 12}" width="${w + 8}" height="14" fill="${mix(c, '#000000', .35)}"/><rect x="${x}" y="${by - h / 2 - 4}" width="${w}" height="6" fill="${mix(c, '#000000', .3)}"/>`;
    for (let row = 0; row < 2; row++) for (let k = 0; k < 3; k++) { const wx = x + 16 + k * (w - 32) / 2.6, wy = by - h + 22 + row * h / 2; g += `<rect x="${f(wx)}" y="${f(wy)}" width="26" height="${f(h / 2 - 50)}" rx="13" fill="${(k + row) % 3 ? '#FFD27A' : '#3A3A6A'}"/>${(k + row) % 3 ? `<rect x="${f(wx - 10)}" y="${f(wy - 10)}" width="46" height="${f(h / 2 - 30)}" fill="#FFC86A" opacity=".12" filter="${s.blur(6)}"/>` : ''}`; }
    s.add('mid', g);
  });
  // torre do relógio
  const tx = 640;
  s.add('mid', `<rect x="${tx - 70}" y="${by - 300}" width="140" height="300" fill="#E8D8C0"/><rect x="${tx - 70}" y="${by - 300}" width="140" height="300" fill="#2A2050" opacity=".3"/><path d="M${tx - 84},${by - 300} L${tx},${by - 380} L${tx + 84},${by - 300}Z" fill="#9A3E2A"/><rect x="${tx - 80}" y="${by - 306}" width="160" height="10" fill="#7A6A5A"/>
    <circle cx="${tx}" cy="${by - 236}" r="46" fill="#FFF4D8"/><circle cx="${tx}" cy="${by - 236}" r="80" fill="#FFE8A0" opacity=".25" filter="${s.blur(12)}"/><circle cx="${tx}" cy="${by - 236}" r="46" fill="none" stroke="#5A4A3A" stroke-width="5"/>${Array.from({ length: 12 }, (_, i) => `<path d="M${f(tx + Math.cos(i * Math.PI / 6) * 38)},${f(by - 236 + Math.sin(i * Math.PI / 6) * 38)} L${f(tx + Math.cos(i * Math.PI / 6) * 42)},${f(by - 236 + Math.sin(i * Math.PI / 6) * 42)}" stroke="#5A4A3A" stroke-width="3"/>`).join('')}<path d="M${tx},${by - 236} L${tx},${by - 266} M${tx},${by - 236} L${tx + 20},${by - 228}" stroke="#2A2A2A" stroke-width="4" stroke-linecap="round"/>
    <path d="M${tx - 34},${by} V${by - 80} a34,34 0 0 1 68,0 V${by}Z" fill="#5A3A2A"/><rect x="${tx - 50}" y="${by - 160}" width="30" height="50" rx="15" fill="#FFD27A"/><rect x="${tx + 20}" y="${by - 160}" width="30" height="50" rx="15" fill="#FFD27A"/>`);
  s.hotspot('mid', tx, by - 236, 60, 'relógio');
  // bonde
  s.add('mid', `<path d="M0,${by - 150} H${W}" stroke="#2A2A3A" stroke-width="1.5"/><g transform="translate(470,${by + 30})"><rect x="-120" y="-90" width="240" height="84" rx="10" fill="#E8B030"/><rect x="-120" y="-20" width="240" height="14" fill="#B5541E"/>${[0, 1, 2, 3, 4].map(i => `<rect x="${-108 + i * 44}" y="-80" width="34" height="40" rx="4" fill="#FFE8A8"/>`).join('')}<rect x="-126" y="-96" width="252" height="10" rx="4" fill="#9A3E1E"/><path d="M0,-96 L-20,-180" stroke="#2A2A3A" stroke-width="3"/><circle cx="-80" cy="-4" r="11" fill="#2A2A3A"/><circle cx="80" cy="-4" r="11" fill="#2A2A3A"/><circle cx="122" cy="-40" r="7" fill="#FFF4C0"/><circle cx="122" cy="-40" r="30" fill="#FFE8A0" opacity=".25"/></g>`);
  s.add('mid', `<path d="M0,${by + 46} H${W} M0,${by + 54} H${W}" stroke="#8A7A8A" stroke-width="3" opacity=".7"/>`);
  [[150, 150, '#E2483D'], [800, 150, '#2F7D4F'], [1120, 180, '#F2C94C']].forEach(([x, w, c]) => { let a = ''; for (let k = 0; k < w; k += 25) a += `<path d="M${x + k},${by - 74} h25 v22 q-12.5,10 -25,0z" fill="${(k / 25) % 2 ? '#FFF6E6' : c}"/>`; s.add('mid', a); });
  // calçada (near)
  s.add('near', `<path d="M0,620 H${W} V${H} H0Z" fill="${s.lin([[0, '#8A7A8A'], [1, '#5A4A5A']])}"/>`);
  { let g = ''; for (let i = 0; i < 26; i++) g += `<path d="M${i * 52 - 20},${H} Q${i * 52},700 ${i * 52 + 20},620" stroke="#B8A8B0" stroke-width="2" opacity=".25" fill="none"/>`; s.add('near', g + `<path d="M0,620 H${W}" stroke="#C8B8C0" stroke-width="6"/>`); }
  // postes de luz
  [120, 1180].forEach(x => s.add('near', `<path d="M${x},${H} V480" stroke="#2A2A3A" stroke-width="8"/><path d="M${x - 18},480 h36 l-6,-34 h-24z" fill="#FFF0B8"/><circle cx="${x}" cy="466" r="90" fill="#FFD890" opacity=".22" filter="${s.blur(20)}"/><ellipse cx="${x}" cy="${H - 20}" rx="110" ry="20" fill="#FFD890" opacity=".18"/>`));
  // horta comunitária (canteiros)
  let h = '';
  [[230, 700], [370, 716]].forEach(([x, y], i) => { h += `<rect x="${x - 62}" y="${y - 26}" width="124" height="40" fill="#7A4A2A"/><rect x="${x - 66}" y="${y - 30}" width="132" height="8" fill="#9A6A40"/>`; for (let k = 0; k < 5; k++) h += canopy(x - 48 + k * 24, y - 34, 13, 10, ['#2E6A2E', '#4E8A3A', '#8AC060'], 120 + i * 7 + k, { n: 6 }); });
  h += `${[0, 1, 2].map(k => `<circle cx="${200 + k * 22}" cy="666" r="6" fill="#E2483D"/>`).join('')}`;
  s.add('near', h);
  s.hotspot('near', 300, 680, 70, 'horta');
  // chaveiro: placa com chave grande
  s.add('near', `<g transform="translate(900,560)"><path d="M0,-90 V-60" stroke="#2A2A3A" stroke-width="4"/><rect x="-60" y="-60" width="120" height="50" rx="8" fill="#3A3A6A"/><g transform="translate(0,-35)"><circle cx="-30" cy="0" r="14" fill="none" stroke="#F2C94C" stroke-width="6"/><path d="M-16,0 H40 M28,0 v10 M38,0 v8" stroke="#F2C94C" stroke-width="6" stroke-linecap="round"/></g></g>`);
  s.hotspot('near', 900, 525, 52, 'chave');
  // caixas da feira
  s.add('near', [[1010, 740, '#C8904E'], [1074, 744, '#B87E40'], [1040, 690, '#D8A060']].map(([x, y, c]) => `<rect x="${x - 34}" y="${y - 50}" width="68" height="50" fill="${c}"/>${[0, 1, 2].map(k => `<path d="M${x - 34},${y - 40 + k * 16} h68" stroke="${mix(c, '#000000', .3)}" stroke-width="2"/>`).join('')}<path d="M${x - 34},${y - 50} v50 M${x + 34},${y - 50} v50" stroke="${mix(c, '#000000', .35)}" stroke-width="4"/>`).join('') + `${[0, 1, 2, 3].map(k => `<circle cx="${1022 + k * 12}" cy="${636}" r="7" fill="${['#F28C28', '#E2483D', '#F2C94C', '#6FB86A'][k]}"/>`).join('')}`);
  s.hotspot('near', 1044, 700, 60, 'caixa');
  // balões de festa
  s.add('near', `<g>${[[740, 520, '#E2483D'], [770, 500, '#F2C94C'], [800, 524, '#4FA3C7'], [760, 540, '#6FB86A']].map(([x, y, c]) => `<path d="M${x},${y + 24} Q${x + 4},${y + 60} 770,640" stroke="#E8E0D0" stroke-width="1.2" fill="none"/><ellipse cx="${x}" cy="${y}" rx="18" ry="22" fill="${c}"/><ellipse cx="${x - 6}" cy="${y - 8}" rx="5" ry="7" fill="#fff" opacity=".45"/>`).join('')}<path d="M770,640 V700" stroke="#7A6A5A" stroke-width="3"/></g>`);
  s.hotspot('near', 770, 520, 50, 'balão');
  s.add('near', L.gato(560, 650, .9, false, '#3A3A3A'));
  // varal de livros da feira de leitura (Decisão 012: sem bandeirinhas; Decisão 009: 3 cores)
  { const cols = ['#1F3A6B', '#F2C94C', '#FFFBF4']; let b = `<path d="M-20,30 Q640,150 1300,30" stroke="#3A2A3A" stroke-width="2" fill="none"/>`; for (let i = 0; i < 30; i++) { const t = (i + .5) / 30, x = -20 + t * 1320, y = (1 - t) * (1 - t) * 30 + 2 * (1 - t) * t * 150 + t * t * 30; if (i % 2) continue; b += `<rect x="${f(x - 16)}" y="${f(y)}" width="32" height="40" rx="3" fill="${cols[(i / 2) % 3]}" stroke="#3A2A3A" stroke-width="1"/><path d="M${f(x)},${f(y)} v40" stroke="#3A2A3A" stroke-width="1" opacity=".5"/>`; } s.add('fg', `<g filter="${s.blur(1.6)}">${b}</g>`); }
  s.add('fg', particles(104, 30, 0, W, 300, 700, '#FFE8B0', 1.6, .5));
  finish(s, { vignette: '#120E2A', vo: .4, warm: '#FFB070', warmO: .08 });
  return s;
}

// =============================================================================================
// 11 · ARQUIPÉLAGO DOS LIVROS — noite estrelada, ilhas de livros (chefe final)
// =============================================================================================
function bookStack(x, y, n, seed, w0 = 160) {
  const r = rng(seed); const cols = ['#C2410C', '#1D4ED8', '#2F7D4F', '#F4B400', '#6D3FC0', '#E26D5A', '#1F7A70']; let g = '', yy = y;
  for (let i = 0; i < n; i++) { const w = w0 * (1 - i * .06) * (.9 + r() * .15), h = 20 + r() * 12, c = cols[Math.floor(r() * cols.length)], dx = (r() - .5) * 20; g += `<rect x="${f(x - w / 2 + dx)}" y="${f(yy - h)}" width="${f(w)}" height="${f(h)}" rx="3" fill="${c}"/><rect x="${f(x - w / 2 + dx + 6)}" y="${f(yy - h + 4)}" width="${f(w - 12)}" height="${f(h - 8)}" fill="#FFF8E8" opacity=".9"/><rect x="${f(x - w / 2 + dx)}" y="${f(yy - h)}" width="12" height="${f(h)}" fill="${mix(c, '#000000', .2)}"/><path d="M${f(x - w / 2 + dx + 14)},${f(yy - h / 2 - 3)} h${f(w - 22)} M${f(x - w / 2 + dx + 14)},${f(yy - h / 2 + 3)} h${f(w - 22)}" stroke="#D8C8B0" stroke-width="1" opacity=".8"/><rect x="${f(x - w / 2 + dx + 6)}" y="${f(yy - 8)}" width="${f(w - 12)}" height="4" fill="#C8B49A" opacity=".5"/><rect x="${f(x - w / 2 + dx + 2)}" y="${f(yy - h + 6)}" width="4" height="${f(h - 12)}" fill="#F4B400" opacity=".7"/>`; yy -= h; }
  return { g, top: yy };
}
function arquipelago() {
  const s = new Scene('arquipelago');
  sky(s, [[0, '#0E1236'], [.4, '#262A6A'], [.62, '#5A4A8A'], [.7, '#8A6A9A']]);
  // via láctea + estrelas
  s.add('sky', `<path d="M-50,420 Q400,120 1330,40" stroke="#B8A8E8" stroke-width="120" fill="none" opacity=".12" filter="${s.blur(30)}"/>` + particles(111, 200, 0, W, 0, 460, '#FFFFFF', 1.3, .95) + particles(112, 30, 0, W, 0, 400, '#FFE8B0', 2.2, .9));
  // constelação em forma de livro aberto
  const cst = [[860, 150], [910, 130], [960, 150], [1010, 130], [1060, 150], [1060, 210], [1010, 190], [960, 210], [910, 190], [860, 210]];
  s.add('sky', `<path d="M${cst.map(p => p.join(',')).join(' L')} Z M960,150 L960,210" stroke="#C8D0FF" stroke-width="1.2" fill="none" opacity=".55"/>${cst.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.8" fill="#FFFFFF"/><circle cx="${x}" cy="${y}" r="7" fill="#C8D0FF" opacity=".25"/>`).join('')}`);
  // lua crescente
  s.add('sky', `<circle cx="200" cy="130" r="80" fill="#FFF4D8" opacity=".12" filter="${s.blur(16)}"/><circle cx="200" cy="130" r="40" fill="#FFF4D8"/><circle cx="220" cy="118" r="36" fill="#1A1E4E"/>`);
  // cometa
  s.add('sky', `<path d="M520,120 L760,60" stroke="url(#none)" stroke-width="0"/><path d="M500,140 Q600,100 760,64" stroke="${s.lin([[0, '#FFFFFF', 0], [1, '#FFF4D0', .9]], 0, 0, 1, 0)}" stroke-width="6" fill="none" stroke-linecap="round"/><circle cx="762" cy="64" r="7" fill="#FFFFFF"/><circle cx="762" cy="64" r="20" fill="#FFF4D0" opacity=".35"/>`);
  s.hotspot('sky', 740, 72, 40, 'cometa');
  // mar noturno
  const hz = 500;
  s.add('far', `<rect x="0" y="${hz}" width="${W}" height="${H - hz}" fill="${s.lin([[0, '#3A3A7A'], [1, '#0E1236']])}"/>${shimmer(113, 100, 0, W, hz + 4, H, '#C8D0FF', .45, 200, 20)}`);
  // ilhas de livros distantes (flutuando com cachoeiras de letras)
  [[200, 430, 5, 1, .55], [1080, 400, 6, 2, .6]].forEach(([x, y, n, sd, k]) => { const b = bookStack(x, y, n, sd + 120, 150); s.add('far', `<g opacity=".85" transform="translate(${x},${y}) scale(${k}) translate(${-x},${-y})">${b.g}${canopy(x, b.top - 10, 60, 26, ['#2E5A5A', '#3E7A6A', '#6AA890'], sd + 130)}<path d="M${x - 60},${y} L${x - 40},${y + 40} L${x + 40},${y + 40} L${x + 60},${y}Z" fill="#4A3A5A"/></g>`); });
  s.add('far', `<g fill="#C8D0FF" opacity=".6" font-family="Andika" font-size="17" font-weight="700">${'aeiou'.split('').map((c, i) => `<text x="${1090 + (i % 2) * 8}" y="${436 + i * 20}" opacity="${1 - i * .15}">${c}</text>`).join('')}</g>`);
  // ilha principal com farol (mid)
  const mx = 760, my = 560;
  const main = bookStack(mx, my, 6, 141, 340);
  s.add('mid', `<path d="M${mx - 200},${my} Q${mx},${my + 30} ${mx + 200},${my}" fill="#2A2A5A"/>` + main.g);
  s.add('mid', `<path d="M${mx - 170},${main.top + 4} Q${mx},${main.top - 30} ${mx + 170},${main.top + 4}Z" fill="#3E7A5A"/>` + canopy(mx - 120, main.top - 14, 50, 24, ['#2E5A4A', '#3E7A5A', '#6AA880'], 142) + canopy(mx + 130, main.top - 10, 44, 22, ['#2E5A4A', '#3E7A5A', '#6AA880'], 143));
  // farol
  const fy = main.top - 4;
  s.add('mid', `<path d="M${mx - 26},${fy} L${mx - 16},${fy - 170} L${mx + 16},${fy - 170} L${mx + 26},${fy}Z" fill="#F4ECDC"/>${[0, 1, 2].map(i => `<path d="M${mx - 24 + i * 3},${fy - 30 - i * 50} L${mx + 24 - i * 3},${fy - 30 - i * 50} L${mx + 22 - i * 3},${fy - 54 - i * 50} L${mx - 22 + i * 3},${fy - 54 - i * 50}Z" fill="#C2410C"/>`).join('')}<rect x="${mx - 20}" y="${fy - 200}" width="40" height="30" fill="#FFE8A0"/><path d="M${mx - 26},${fy - 200} L${mx},${fy - 226} L${mx + 26},${fy - 200}Z" fill="#2A2A5A"/><rect x="${mx - 26}" y="${fy - 172}" width="52" height="6" fill="#2A2A5A"/>`);
  s.add('mid', `<g style="mix-blend-mode:screen" filter="${s.blur(6)}"><path d="M${mx},${fy - 186} L${mx - 620},${fy - 300} L${mx - 620},${fy - 160}Z" fill="${s.lin([[0, '#FFF0B0', .6], [1, '#FFF0B0', 0]], 1, 0, 0, 0)}"/><path d="M${mx},${fy - 186} L${mx + 560},${fy - 250} L${mx + 560},${fy - 140}Z" fill="${s.lin([[0, '#FFF0B0', .45], [1, '#FFF0B0', 0]])}"/></g><circle cx="${mx}" cy="${fy - 186}" r="40" fill="#FFF0B0" opacity=".5" filter="${s.blur(10)}"/>`);
  s.hotspot('mid', mx, fy - 120, 60, 'farol');
  // ponte de corda até outra ilha
  s.add('mid', `<g transform="translate(${mx + 300},${my + 60})"><path d="M-40,0 Q0,14 40,0 L34,-8 L-34,-8Z" fill="#8A5A3A"/><path d="M0,-8 V-50" stroke="#5A4030" stroke-width="2"/><circle cx="0" cy="-54" r="6" fill="#FFD27A"/><circle cx="0" cy="-54" r="22" fill="#FFD27A" opacity=".3"/><path d="M-50,6 Q0,12 50,6" stroke="#C8D0FF" stroke-width="1.5" opacity=".5" fill="none"/></g>`);
  s.add('far', `<rect x="${mx - 14}" y="${hz + 6}" width="28" height="240" fill="#FFE8A0" opacity=".22" filter="${s.blur(10)}"/><ellipse cx="${mx}" cy="${my + 20}" rx="260" ry="24" fill="#0A0C28" opacity=".45" filter="${s.blur(8)}"/>`);
  // nuvem baixa, próxima
  s.add('mid', cloud(s, 380, 380, 200, '#C8C8F0', '#5A5A9A', 144, .9));
  s.hotspot('mid', 380, 360, 50, 'nuvem');
  // cais com luneta (near)
  s.add('near', `<path d="M-20,${H + 10} L-20,640 Q200,620 420,650 L520,700 L520,${H + 10}Z" fill="#2A2050"/>`);
  { const b = bookStack(200, 700, 3, 151, 420); s.add('near', b.g); }
  s.add('near', `<g transform="translate(300,610)"><path d="M0,0 L-30,60 M0,0 L30,60 M0,0 L0,62" stroke="#5A4A3A" stroke-width="5"/><g transform="rotate(-30)"><rect x="-60" y="-12" width="100" height="24" rx="6" fill="#B8862E"/><rect x="38" y="-15" width="20" height="30" rx="4" fill="#D8A040"/><rect x="-74" y="-8" width="16" height="16" rx="3" fill="#8A6020"/><path d="M-50,-6 h80" stroke="#F8D88A" stroke-width="3" opacity=".7"/></g></g>`);
  s.hotspot('near', 300, 590, 54, 'luneta');
  s.add('near', `<path d="M820,${H + 10} Q860,720 1000,700 Q1160,690 1300,720 L1300,${H + 10}Z" fill="#2A2050"/>`);
  // livro aberto que brilha
  s.add('near', `<g transform="translate(1000,720)"><ellipse cx="0" cy="10" rx="140" ry="22" fill="#FFE8A0" opacity=".3" filter="${s.blur(10)}"/><path d="M-110,0 Q-60,-26 0,-8 Q60,-26 110,0 L110,14 Q60,-12 0,6 Q-60,-12 -110,14Z" fill="#FFF8E8"/><path d="M0,-8 V6" stroke="#C8B89A" stroke-width="2"/><path d="M-110,14 Q-60,-12 0,6 Q60,-12 110,14 L110,20 Q60,-4 0,12 Q-60,-4 -110,20Z" fill="#C2410C"/>${[-80, -60, -40, 30, 50, 70].map((x, i) => `<path d="M${x},${-8 + Math.abs(x) * .05} h${i < 3 ? 34 : 30}" stroke="#B8A890" stroke-width="2"/>`).join('')}${particles(152, 30, -80, 80, -120, -10, '#FFF0B0', 2.2, .9)}</g>`);
  s.hotspot('near', 1000, 690, 66, 'livro');
  s.add('fg', particles(153, 40, 0, W, 300, 780, '#FFF0B0', 2.4, .7));
  finish(s, { vignette: '#06081E', vo: .45, grain: .4 });
  return s;
}

module.exports = { '01-quintal-vila': quintal, '02-ilha-das-vogais': ilha, '03-mata-atlantica': mata, '04-pampa': pampa, '05-pantanal': pantanal, '06-cerrado': cerrado, '07-caatinga': caatinga, '08-amazonia': amazonia, '09-litoral-e-mar': litoral, '10-cidade-das-letras': cidade, '11-arquipelago-dos-livros': arquipelago };
