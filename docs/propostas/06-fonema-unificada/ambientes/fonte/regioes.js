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
  [[660, 640], [760, 650], [860, 640]].forEach(([x, y], i) => { horta += `<path d="M${x - 46},${y} L${x + 46},${y} L${x + 52},${y + 22} L${x - 52},${y + 22}Z" fill="#7A4A2A"/><path d="M${x - 46},${y} L${x + 46},${y}" stroke="#9A6A40" stroke-width="4"/>`; for (let k = 0; k < 4; k++) horta += canopy(x - 33 + k * 22, y - 6, 12, 9, ['#3E7A30', '#5EA040', '#9CD070'], 300 + i * 9 + k, { n: 6 }); });
  horta += `<g>${[0, 1, 2].map(i => `<path d="M${652 + i * 18},${632} q-4,-10 0,-14" stroke="#4E8A34" stroke-width="3" fill="none"/><path d="M${648 + i * 18},${640} q4,-10 8,0z" fill="#F28C28"/>`).join('')}</g>`;
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
  const s = new Scene('mata', { layers: true });
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
  s.add('mid', `<path d="M540,300 Q600,250 700,262 Q800,256 840,300 L860,620 L520,620Z" fill="${s.lin([[0, '#6E7A66'], [1, '#4A5446']])}"/>`);
  s.add('mid', canopy(560, 290, 90, 40, ['#2E5A34', '#3E7A44', '#6EA860'], 81, { n: 14 }) + canopy(820, 296, 80, 36, ['#2E5A34', '#3E7A44', '#6EA860'], 82, { n: 14 }));
  s.add('mid', `<path d="M650,272 Q690,268 730,272 L748,560 Q690,574 632,560Z" fill="${s.lin([[0, '#E8F4F2'], [.5, '#CFE8EA'], [1, '#F4FAF8']])}"/>`);
  let st = ''; const rw = rng(3); for (let i = 0; i < 26; i++) { const x = 640 + rw() * 100; st += `<path d="M${f(x)},${f(276 + rw() * 40)} L${f(x + (x - 690) * .12)},${f(470 + rw() * 90)}" stroke="#FFFFFF" stroke-width="${f(1 + rw() * 2.5)}" opacity="${f(.4 + rw() * .5)}" stroke-linecap="round"/>`; }
  s.add('mid', st + `<ellipse cx="690" cy="566" rx="120" ry="30" fill="#FFFFFF" opacity=".75" filter="${s.blur(10)}"/>`);
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
  s.add('near', `<path d="${fl.d}" fill="${s.lin([[0, '#5A6E3A'], [1, '#3A4A26']])}"/>`);
  // poça de lama
  s.add('near', `<ellipse cx="500" cy="720" rx="110" ry="26" fill="#5A3E26"/><ellipse cx="500" cy="716" rx="94" ry="19" fill="#7A5434"/><ellipse cx="470" cy="710" rx="30" ry="5" fill="#A88262" opacity=".7"/>${[[440, 724], [540, 712], [560, 726]].map(([x, y]) => `<path d="M${x},${y} l-4,4 m8,-4 l4,4 m-4,-6 v6" stroke="#4A3220" stroke-width="2"/>`).join('')}`);
  s.hotspot('near', 500, 714, 54, 'lama');
  // tronco caído com fila de formigas
  s.add('near', `<path d="M760,700 L1120,672 Q1140,690 1124,708 L770,734 Q750,718 760,700Z" fill="#6A4A30"/><path d="M770,708 L1110,682" stroke="#8A6A48" stroke-width="6" stroke-linecap="round" opacity=".7"/><ellipse cx="1122" cy="690" rx="12" ry="18" fill="#9A7A56"/><ellipse cx="1122" cy="690" rx="7" ry="11" fill="#7A5A3A"/>${[0, 1, 2, 3].map(i => `<path d="M${800 + i * 70},700 q10,-14 24,-6" stroke="#4E8A3A" stroke-width="5" fill="none" stroke-linecap="round"/>`).join('')}`);
  let ants = ''; for (let i = 0; i < 18; i++) { const x = 840 + i * 13, y = 694 - i * 1.05; ants += `<ellipse cx="${x}" cy="${f(y)}" rx="2.6" ry="1.6" fill="#3A1E12"/><circle cx="${x + 3.5}" cy="${f(y - .5)}" r="1.4" fill="#3A1E12"/>${i % 3 === 0 ? `<path d="M${x - 1},${f(y - 2)} l3,-6 l4,3z" fill="#7EC060"/>` : ''}`; }
  s.add('near', ants);
  s.hotspot('near', 950, 686, 48, 'fila');
  // árvore com oco e favo (jataí)
  s.add('near', `<path d="M70,${H + 10} Q60,500 90,250 L210,250 Q220,500 230,${H + 10}Z" fill="${s.lin([[0, '#4A3828'], [.5, '#6A5038'], [1, '#3A2A1E']], 0, 0, 1, 0)}"/><path d="M110,${H} Q100,520 120,260" stroke="#7A6048" stroke-width="10" fill="none" opacity=".6"/>`);
  s.add('near', `<ellipse cx="160" cy="470" rx="26" ry="38" fill="#2A1A10"/><path d="M144,452 h32 v40 h-32z" fill="#E8B030" clip-path="${s.clip('<ellipse cx="160" cy="470" rx="22" ry="34"/>')}"/>${[0, 1, 2, 3].map(r => [0, 1, 2].map(c => `<path transform="translate(${148 + c * 11 + (r % 2) * 5},${448 + r * 10})" d="M0,-5 L4.3,-2.5 L4.3,2.5 L0,5 L-4.3,2.5 L-4.3,-2.5Z" fill="#F2C24A" stroke="#C88A18" stroke-width="1.2"/>`).join('')).join('')}${L.abelhas(186, 450, 7, 4)}`);
  s.hotspot('near', 160, 470, 42, 'favo');
  s.add('near', mico_branch(s));
  // ninho com ovo
  s.add('near', `<g transform="translate(1210,560)"><path d="M-80,-40 Q0,-20 90,-60" stroke="#4A3828" stroke-width="12" fill="none" stroke-linecap="round"/><path d="M-30,-40 Q0,-10 30,-40 Q0,-50 -30,-40Z" fill="#8A6A42"/>${Array.from({ length: 10 }, (_, i) => `<path d="M${-30 + i * 6},-38 l8,-6" stroke="#B08A5A" stroke-width="1.6"/>`).join('')}<ellipse cx="-8" cy="-44" rx="8" ry="6" fill="#DCEFF0"/><ellipse cx="8" cy="-45" rx="8" ry="6" fill="#CFE8EA"/></g>`);
  s.hotspot('near', 1210, 514, 34, 'ovo');
  s.add('near', grass(41, 160, 240, W, 650, 790, ['#4E7A34', '#6A9A44', '#3E6A2A', '#8AB85A'], 8, 24));
  s.add('near', bromelia(300, 760, 1.1) + bromelia(1150, 760, .9, ['#3F7A3E', '#6FAE55'], '#F2A33A'));
  s.add('near', L.borboleta(640, 620, 1.4, '#3D7DE0', '#9FD0FF', 10));
  // primeiro plano: folhas grandes escuras
  s.add('fg', `<g filter="${s.blur(3)}">${bigLeaves(-40, 840, 1.6, 11, ['#1A3020', '#24402A'], 1, 7)}${bigLeaves(1320, 860, 1.5, 12, ['#1A3020', '#24402A'], -1, 7)}</g>`);
  s.add('fg', `<path d="M380,0 Q400,140 370,260" stroke="#3A4A2A" stroke-width="5" fill="none"/><path d="M1240,0 Q1220,120 1250,200" stroke="#3A4A2A" stroke-width="4" fill="none"/>${canopy(380, 10, 120, 40, ['#1E3A24', '#2A4E30', '#3E6A40'], 91, { n: 14 })}${canopy(1180, 0, 200, 50, ['#1E3A24', '#2A4E30', '#3E6A40'], 92, { n: 18 })}${canopy(0, 0, 160, 60, ['#1E3A24', '#2A4E30', '#3E6A40'], 93, { n: 18 })}`);
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
  const sunX = 860, sunY = 440;
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
  s.add('far', `<path d="M470,${fy} V${fy - 60}" stroke="#5A4A4A" stroke-width="2"/>${[0, 1, 2, 3, 4, 5, 6, 7].map(i => `<path d="M470,${fy - 60} l${f(Math.cos(i * Math.PI / 4) * 16)},${f(Math.sin(i * Math.PI / 4) * 16)}" stroke="#5A4A4A" stroke-width="2"/>`).join('')}<path d="M462,${fy} L470,${fy - 60} L478,${fy}" stroke="#5A4A4A" stroke-width="1.5" fill="none"/>`);
  // coxilhas médias
  const m1 = ridge(7, 540, 26, { fr: [.6, 1.5, 3], wt: [1, .4, .15] });
  s.add('mid', `<path d="${m1.d}" fill="${s.lin([[0, '#9A9A52'], [1, '#6E7A3A']])}"/>`);
  s.add('mid', `<path d="${m1.d}" fill="${s.rad([[0, '#FFC070', .5], [1, '#FFC070', 0]], .67, 0, .5)}"/>`);
  // umbu (Phytolacca) solitário
  const ux = 980, uy = m1.y(980) + 6;
  s.add('mid', L.castShadow(s, ux, uy, 340, 12, 0, .35, '#2A1A24') + `<path d="M${ux - 40},${uy} Q${ux - 30},${uy - 50} ${ux - 14},${uy - 80} L${ux + 16},${uy - 80} Q${ux + 30},${uy - 50} ${ux + 46},${uy}Z" fill="#4A3A34"/>` + tree(ux, uy - 60, { h: 40, w: 16, crown: [240, 120], cols: ['#3A4A2A', '#526A34', '#86904A', '#E8B070'], seed: 31, lobes: 5, n: 22, lx: -.4, ly: -.5, spread: 1.1 }));
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
  s.add('near', `<g transform="translate(286,576)"><path d="M-10,0 L-10,-40 Q-10,-46 -4,-46 L10,-46 Q16,-46 16,-40 L16,-6 Q30,-4 32,6 L32,12 L-10,12Z" fill="#3A2218" transform="rotate(180 10 -10)"/><path d="M-6,-30 h20" stroke="#6A4A34" stroke-width="3" transform="rotate(180 10 -10)"/></g>`);
  s.hotspot('near', 296, 584, 34, 'bota');
  // boi (próximo) e tatu-mulita
  s.add('near', L.castShadow(s, 1060, 720, 160, 8, 0, .3, '#2A1A1A') + L.boi(1040, 722, 1.25, true, '#E8DCCB'));
  s.hotspot('near', 1036, 650, 58, 'boi');
  s.add('near', L.tatu(420, 742, .9, false));
  s.hotspot('near', 430, 722, 38, 'tatu');
  // pote de barro junto ao moirão
  s.add('near', `<g transform="translate(150,720)">${shadowE(4, 0, 30, .35)}<path d="M-22,0 Q-34,-26 -16,-44 L-14,-52 L14,-52 L16,-44 Q34,-26 22,0Z" fill="#B0603A"/><ellipse cx="0" cy="-52" rx="16" ry="5" fill="#8A4626"/><path d="M-18,-30 Q0,-24 18,-30" stroke="#E0905A" stroke-width="3" fill="none"/><path d="M-14,-36 Q-20,-20 -12,-6" stroke="#E8A070" stroke-width="4" fill="none" opacity=".6" stroke-linecap="round"/></g>`);
  s.hotspot('near', 150, 692, 38, 'pote');
  s.add('near', L.ema(1200, 640, .75, true) + L.queroquero(520, 734, 1.1, false) + L.queroquero(900, 744, .9, true));
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
  pv += tree(730, 522, { h: 170, w: 12, crown: [230, 120], cols: ['#B0407A', '#D45E98', '#F08AB8', '#FFD0E4'], seed: 51, lobes: 5, n: 20, lx: -.7, ly: -.5 });
  pv += `<path d="M690,330 Q730,316 770,330 Q760,346 730,348 Q700,346 690,330Z" fill="#7A5A3A"/>${Array.from({ length: 12 }, (_, i) => `<path d="M${692 + i * 6},334 l6,-8" stroke="#9A7A52" stroke-width="2"/>`).join('')}`;
  pv += L.tuiuiu(720, 334, .62, false) + L.tuiuiu(758, 332, .56, true);
  pv += fanPalm(860, 524, { h: 120, seed: 52, len: 60, col: ['#3E5A3A', '#5E7A4A', '#8EA66A'] });
  s.add('mid', `<g id="${gid}">${pv}</g>` + reflection(s, gid, 526, `M540,526 H920 V700 H540Z`, .35, 2.5));
  s.hotspot('mid', 740, 300, 54, 'ninho');
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

module.exports = { '01-quintal-vila': quintal, '02-ilha-das-vogais': ilha, '03-mata-atlantica': mata, '04-pampa': pampa, '05-pantanal': pantanal, '06-cerrado': cerrado };
