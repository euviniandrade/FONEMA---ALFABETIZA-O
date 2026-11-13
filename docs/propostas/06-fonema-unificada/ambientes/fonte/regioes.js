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
  s.add('mid', L.castShadow(s, 60, 550, 220, 10, Math.PI, .25) + L.castShadow(s, 700, 542, 200, 9, Math.PI, .22) + L.castShadow(s, 1030, 548, 160, 8, Math.PI, .22) + L.castShadow(s, 520, 566, 90, 6, Math.PI, .3) + L.castShadow(s, 950, 572, 70, 5, Math.PI, .3));
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
  s.add('near', L.castShadow(s, 30, 692, 330, 18, Math.PI, .3) + L.castShadow(s, 1000, 642, 300, 14, Math.PI, .26) + L.castShadow(s, 800, 670, 90, 6, Math.PI, .3));
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

module.exports = { '06-cerrado': cerrado };
