/* Personagens (Sofia, avatar da criança, Bolota) e emblemas — FONEMA */
(function (W) {
  const { Ctx, lt, dk, S, gl, spark, eye } = W.FX;

  /* ---------- criança (Sofia ou avatar) ---------- */
  // o: {pele, cabelo, estilo:'cachos'|'puffs'|'crespo', camisa, macacao, sapato, flor, pose:'acena'|'aponta'|'neutro'|'feliz', oculos, bone, busto}
  W.kid = function (o = {}) {
    const c = new Ctx();
    const P = o.pele || '#B97A52', H = o.cabelo || '#2E1A10', C = o.camisa || '#F2B33D', M = o.macacao || '#1F6E82', Sp = o.sapato || '#A9472A';
    const pose = o.pose || 'acena', est = o.estilo || 'cachos';
    const hairG = c.r(H, { hi: .22, lo: .3, cx: 40, cy: 25 });
    const skinG = c.r(P, { hi: .22, lo: .18, cx: 40, cy: 30 });
    let back = '', front = '';
    if (est === 'cachos') {
      const pts = [[60, 96, 34], [70, 62, 34], [96, 44, 34], [130, 42, 34], [156, 58, 33], [168, 92, 32], [170, 126, 28], [52, 128, 28], [58, 160, 24], [164, 160, 24], [74, 182, 18], [148, 182, 18]];
      back = pts.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${hairG}"/>`).join('') +
        pts.map(([x, y, r]) => `<path d="M${x - r * .5},${y - r * .2} q${r * .3},-${r * .45} ${r * .7},-${r * .2}" stroke="${lt(H, .3)}" stroke-width="3" fill="none" stroke-linecap="round" opacity=".7"/>`).join('');
      front = [[78, 74, 18], [100, 64, 19], [124, 64, 18], [146, 78, 16], [64, 92, 12], [158, 96, 11]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${hairG}"/><path d="M${x - r * .5},${y - r * .1} q${r * .4},-${r * .5} ${r * .8},-${r * .1}" stroke="${lt(H, .32)}" stroke-width="2.5" fill="none" stroke-linecap="round" opacity=".75"/>`).join('');
    } else if (est === 'puffs') {
      back = [[56, 50, 34], [164, 50, 34]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${hairG}"/><path d="M${x - 18},${y - 10} q10,-16 28,-12" stroke="${lt(H, .3)}" stroke-width="3" fill="none" opacity=".6" stroke-linecap="round"/>`).join('') + `<ellipse cx="110" cy="98" rx="58" ry="54" fill="${hairG}"/>`;
      front = `<path d="M62,104 Q60,56 110,52 Q160,56 158,104 Q146,78 110,76 Q74,78 62,104Z" fill="${hairG}"/><path d="M70,74 Q110,40 150,74" stroke="${o.faixa || '#B23C62'}" stroke-width="9" fill="none" stroke-linecap="round"/>`;
    } else {
      back = `<ellipse cx="110" cy="92" rx="62" ry="58" fill="${hairG}"/>`;
      front = `<path d="M58,100 Q56,48 110,46 Q164,48 162,100 Q150,72 110,72 Q70,72 58,100Z" fill="${hairG}"/>`;
    }
    const arms = {
      acena: `<path d="M64,214 Q40,200 34,160" stroke="${C}" stroke-width="22" fill="none" stroke-linecap="round"/><circle cx="32" cy="150" r="13" fill="${skinG}"/><path d="M24,140 l-4,-10 M30,137 l-1,-11 M37,138 l2,-10" stroke="${P}" stroke-width="6" stroke-linecap="round"/>
              <path d="M156,214 Q172,240 166,268" stroke="${C}" stroke-width="22" fill="none" stroke-linecap="round"/><circle cx="166" cy="276" r="12" fill="${skinG}"/>`,
      aponta: `<path d="M64,214 Q50,244 56,268" stroke="${C}" stroke-width="22" fill="none" stroke-linecap="round"/><circle cx="56" cy="276" r="12" fill="${skinG}"/>
              <path d="M156,214 Q190,206 206,180" stroke="${C}" stroke-width="22" fill="none" stroke-linecap="round"/><circle cx="210" cy="172" r="12" fill="${skinG}"/><path d="M214,166 l12,-14" stroke="${P}" stroke-width="7" stroke-linecap="round"/>`,
      feliz: `<path d="M64,214 Q36,196 40,160" stroke="${C}" stroke-width="22" fill="none" stroke-linecap="round"/><circle cx="40" cy="150" r="13" fill="${skinG}"/><path d="M156,214 Q184,196 180,160" stroke="${C}" stroke-width="22" fill="none" stroke-linecap="round"/><circle cx="180" cy="150" r="13" fill="${skinG}"/>`,
      neutro: `<path d="M64,214 Q50,244 56,268" stroke="${C}" stroke-width="22" fill="none" stroke-linecap="round"/><circle cx="56" cy="276" r="12" fill="${skinG}"/><path d="M156,214 Q170,244 164,268" stroke="${C}" stroke-width="22" fill="none" stroke-linecap="round"/><circle cx="164" cy="276" r="12" fill="${skinG}"/>`,
    }[pose];
    const mouth = pose === 'neutro' ? `<path d="M98,150 Q110,160 122,150" stroke="#6A2E22" stroke-width="4" fill="none" stroke-linecap="round"/>` :
      `<path d="M94,146 Q110,168 126,146 Q110,153 94,146Z" fill="#7A2E22"/><path d="M101,156 Q110,161 119,156 Q110,159 101,156Z" fill="#D9786A"/>`;
    const body = `
      ${o.busto ? '' : `<path d="M90,284 v38 M130,284 v38" stroke="${dk(P, .1)}" stroke-width="16" stroke-linecap="round"/>
      <path d="M74,326 q16,-14 30,0 v4 h-30z M116,326 q16,-14 30,0 v4 h-30z" fill="${c.l(Sp)}" stroke="${S(Sp)}" stroke-width="2"/>`}
      <path d="M58,290 Q58,206 110,198 Q162,206 162,290 Z" fill="${c.l(C, { hi: .3 })}"/>
      <path d="M90,200 L110,222 L130,200 Z" fill="#FFFBF4"/>
      <path d="M76,218 L84,290 M144,218 L136,290" stroke="${M}" stroke-width="10" stroke-linecap="round"/>
      <path d="M74,246 h72 l4,50 h-80z" fill="${c.l(M, { hi: .25 })}"/>
      <rect x="96" y="258" width="28" height="18" rx="5" fill="${dk(M, .2)}"/><circle cx="110" cy="254" r="5" fill="#F2B33D"/>
      ${arms}`;
    const face = `
      <rect x="99" y="176" width="22" height="28" rx="8" fill="${dk(P, .12)}"/>
      <ellipse cx="58" cy="130" rx="10" ry="13" fill="${skinG}"/><ellipse cx="162" cy="130" rx="10" ry="13" fill="${skinG}"/>
      <ellipse cx="110" cy="124" rx="52" ry="56" fill="${skinG}"/>
      ${front}
      ${o.flor !== false && est === 'cachos' ? `<g transform="translate(150,74)">${[0, 72, 144, 216, 288].map(a => `<ellipse rx="7" ry="10" cy="-8" transform="rotate(${a})" fill="${c.r('#F2C94C')}"/>`).join('')}<circle r="5" fill="${c.r('#E8792E')}"/></g>` : ''}
      <path d="M80,104 Q90,97 101,103 M119,103 Q130,97 140,104" stroke="${dk(H, .1)}" stroke-width="4" fill="none" stroke-linecap="round"/>
      <ellipse cx="90" cy="124" rx="9" ry="11.5" fill="#1E120B"/><ellipse cx="130" cy="124" rx="9" ry="11.5" fill="#1E120B"/>
      <circle cx="93.5" cy="119" r="3.6" fill="#fff"/><circle cx="133.5" cy="119" r="3.6" fill="#fff"/><circle cx="87" cy="129" r="1.6" fill="#fff" opacity=".8"/><circle cx="127" cy="129" r="1.6" fill="#fff" opacity=".8"/>
      <circle cx="76" cy="144" r="9" fill="#E07F62" opacity=".42"/><circle cx="144" cy="144" r="9" fill="#E07F62" opacity=".42"/>
      <path d="M106,136 Q110,140 114,136" stroke="${dk(P, .35)}" stroke-width="3" fill="none" stroke-linecap="round"/>
      ${mouth}
      ${o.oculos ? `<circle cx="90" cy="124" r="17" fill="#BFE3EC" fill-opacity=".25" stroke="${o.oculos}" stroke-width="5"/><circle cx="130" cy="124" r="17" fill="#BFE3EC" fill-opacity=".25" stroke="${o.oculos}" stroke-width="5"/><path d="M107,122 h6" stroke="${o.oculos}" stroke-width="4"/><path d="M78,116 q6,-6 12,-6" stroke="#fff" stroke-width="3" opacity=".7" fill="none"/>` : ''}
      ${o.bone ? `<path d="M58,96 Q60,52 110,50 Q160,52 162,96Z" fill="${c.r(o.bone)}" stroke="${S(o.bone)}" stroke-width="3"/><path d="M100,92 Q140,84 190,96 Q196,104 186,108 Q140,98 100,104Z" fill="${c.l('#F2B33D')}" stroke="${S('#F2B33D')}" stroke-width="3"/><circle cx="110" cy="50" r="6" fill="#F2B33D"/>` : ''}
      ${o.chapeu ? o.chapeu : ''}
      ${gl('M70,110 q4,-26 26,-34 q-16,14 -18,36z', .18)}`;
    const vb = o.busto ? '0 20 230 240' : '0 0 230 340';
    return c.svg(back + body + face, vb, o.attrs || '');
  };
  W.sofia = (o = {}) => W.kid(Object.assign({ pele: '#B97A52', cabelo: '#2E1A10', estilo: 'cachos', camisa: '#F2B33D', macacao: '#1F6E82' }, o));
  W.lia = (o = {}) => W.kid(Object.assign({ pele: '#7A4A2E', cabelo: '#1A0F0A', estilo: 'puffs', camisa: '#B23C62', macacao: '#2F6B43', faixa: '#F2B33D', sapato: '#1F6E82' }, o));

  /* ---------- Bolota, tatu-bola ---------- */
  W.bolota = function (o = {}) {
    const c = new Ctx(); const sh = '#B98450', sk = '#E0B080';
    const bands = [0, 1, 2, 3, 4].map(i => { const x = 56 + i * 20; return `<path d="M${x},${46 + Math.abs(2 - i) * 6} Q${x - 8},90 ${x},128" stroke="${dk(sh, .3)}" stroke-width="3.5" fill="none"/><path d="M${x + 3},${50 + Math.abs(2 - i) * 6} Q${x - 4},90 ${x + 3},124" stroke="${lt(sh, .35)}" stroke-width="2" fill="none" opacity=".7"/>`; }).join('');
    const scales = Array.from({ length: 18 }, (_, i) => { const col = i % 6, row = Math.floor(i / 6); return `<circle cx="${50 + col * 20}" cy="${74 + row * 18}" r="3" fill="${dk(sh, .2)}" opacity=".5"/>`; }).join('');
    return c.svg(`${c.sh(110, 140, 82)}
      <path d="M34,114 Q12,112 8,96 Q20,104 38,104Z" fill="${c.l(sh)}" stroke="${S(sh)}" stroke-width="2.5"/>
      ${[[56, 128], [84, 134], [130, 134], [156, 128]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="13" ry="9" fill="${c.r(dk(sk, .1))}" stroke="${S(sk)}" stroke-width="2"/>`).join('')}
      <path d="M28,124 Q24,40 104,36 Q178,40 172,124 Q100,140 28,124Z" fill="${c.r(sh, { cx: 38, cy: 22, hi: .45 })}" stroke="${S(sh)}" stroke-width="3.5"/>
      ${bands}${scales}
      <path d="M150,70 Q200,62 206,96 Q206,118 180,120 Q156,118 146,100Z" fill="${c.r(sk, { cx: 40, cy: 30 })}" stroke="${S(sk)}" stroke-width="3"/>
      <path d="M150,60 Q144,34 162,30 Q170,48 164,66Z" fill="${c.r(sk)}" stroke="${S(sk)}" stroke-width="2.5"/><path d="M154,56 Q152,42 160,38 Q164,50 160,60Z" fill="#E9A090"/>
      <ellipse cx="204" cy="98" rx="6" ry="5" fill="#3B1F14"/>
      ${eye(176, 88, 7)}
      <path d="M170,76 q6,-5 13,-2" stroke="#3B1F14" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <circle cx="184" cy="106" r="6" fill="#E07F62" opacity=".45"/>
      <path d="M186,112 q6,5 12,1" stroke="#3B1F14" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      ${o.chapeu || ''}
      ${gl('M50,72 Q60,44 96,42 Q66,54 60,78Z', .45)}`, '0 0 214 150', o.attrs || '');
  };

  /* ---------- Emblemas ---------- */
  const METAL = { bronze: ['#C9824A', '#8A4E22'], prata: ['#C9D2DB', '#7D8995'], ouro: ['#F5C04A', '#B07A12'] };
  const ICON = {
    som: (c, L = 'M') => `<text x="50" y="66" font-family="Fredoka" font-weight="700" font-size="50" text-anchor="middle" fill="#FFFBF4" stroke="rgba(0,0,0,.18)" stroke-width="1">${L}</text><path d="M80,36 q8,14 0,28 M88,30 q12,20 0,40" stroke="#FFFBF4" stroke-width="4" fill="none" stroke-linecap="round" opacity=".9"/>`,
    leitor: () => `<path d="M16,36 q17,-8 34,2 q17,-10 34,-2 v38 q-17,-8 -34,2 q-17,-10 -34,-2z" fill="#FFFBF4"/><path d="M50,38 v38" stroke="rgba(0,0,0,.25)" stroke-width="2.5"/><path d="M50,30 q-4,-18 12,-24 q4,16 -12,24z" fill="#8CC084"/><path d="M24,48 h18 M24,56 h18 M58,48 h18 M58,56 h18" stroke="rgba(0,0,0,.2)" stroke-width="2.5"/>`,
    colecao: () => `<rect x="22" y="26" width="34" height="44" rx="5" fill="#FFFBF4" transform="rotate(-10 39 48)"/><rect x="44" y="24" width="34" height="44" rx="5" fill="#FFF4D0" transform="rotate(8 61 46)"/><path d="M61,36 l3,7 7,1 -5,5 1,7 -6,-3 -6,3 1,-7 -5,-5 7,-1z" fill="#F2B33D" transform="rotate(8 61 46)"/><circle cx="36" cy="42" r="6" fill="#8CC084" transform="rotate(-10 39 48)"/>`,
    vila: () => `<path d="M18,50 L50,22 L82,50" stroke="#FFFBF4" stroke-width="8" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M28,48 v28 h44 v-28" fill="#FFFBF4"/><path d="M50,72 c-14,-8 -16,-18 -8,-22 c4,-2 8,1 8,4 c0,-3 4,-6 8,-4 c8,4 6,14 -8,22z" fill="#D9483B"/>`,
    poupador: () => `<ellipse cx="50" cy="54" rx="30" ry="22" fill="#FFFBF4"/><circle cx="76" cy="50" r="8" fill="#FFFBF4"/><ellipse cx="78" cy="50" rx="4" ry="3" fill="#E9A0B0"/><path d="M34,72 v8 M62,72 v8" stroke="#FFFBF4" stroke-width="7" stroke-linecap="round"/><path d="M40,36 l6,-8 4,8" fill="#FFFBF4"/><rect x="42" y="34" width="16" height="4" rx="2" fill="rgba(0,0,0,.3)"/><circle cx="50" cy="20" r="9" fill="#F2B33D" stroke="#B07A12" stroke-width="2"/><circle cx="66" cy="48" r="2.5" fill="#3B2A20"/>`,
    generoso: () => `<rect x="22" y="42" width="56" height="36" rx="5" fill="#FFFBF4"/><rect x="18" y="32" width="64" height="14" rx="4" fill="#FFF4D0"/><path d="M50,32 v46" stroke="#D9483B" stroke-width="8"/><path d="M50,32 c-16,-16 -26,-4 -14,0z M50,32 c16,-16 26,-4 14,0z" fill="#D9483B"/>`,
    curioso: () => `<circle cx="44" cy="44" r="22" fill="none" stroke="#FFFBF4" stroke-width="8"/><circle cx="44" cy="44" r="16" fill="#BFE3EC" opacity=".5"/><path d="M60,60 l18,18" stroke="#FFFBF4" stroke-width="10" stroke-linecap="round"/><path d="M40,36 l12,8 -12,8z" fill="#FFFBF4"/>`,
    criador: () => `<path d="M24,76 l8,-20 38,-38 12,12 -38,38z" fill="#FFFBF4"/><path d="M24,76 l8,-20 12,12z" fill="#F6D8A8"/><path d="M62,26 l12,12" stroke="#D9483B" stroke-width="6"/><path d="M76,64 l2,5 5,1 -4,3 1,5 -4,-3 -4,3 1,-5 -4,-3 5,-1z" fill="#F2B33D"/>`,
    persist: () => `<path d="M12,78 L40,34 L54,54 L64,42 L88,78Z" fill="#FFFBF4"/><path d="M40,34 L34,44 L46,44Z" fill="#E6EEF2"/><path d="M64,42 V18" stroke="#FFFBF4" stroke-width="3.5"/><path d="M64,18 l14,5 -14,5z" fill="#D9483B"/><path d="M20,70 q14,-10 24,-4" stroke="#8CC084" stroke-width="4" fill="none" stroke-dasharray="3 5" stroke-linecap="round"/>`,
  };
  W.EMB_FAM = {
    som: { nome: 'Domínio de sons', cor: '#B23C62' }, leitor: { nome: 'Leitor de bioma', cor: '#2F6B43' }, colecao: { nome: 'Colecionador', cor: '#1F6E82' },
    vila: { nome: 'Ajudante da Vila', cor: '#A9472A' }, poupador: { nome: 'Poupador', cor: '#C08A1E' }, generoso: { nome: 'Generoso', cor: '#D9483B' },
    curioso: { nome: 'Curioso', cor: '#6B5BA8' }, criador: { nome: 'Criador', cor: '#E8792E' }, persist: { nome: 'Persistência', cor: '#3F7D8C' },
  };
  // emblema(fam, tier, {locked, letra, progresso})
  W.emblema = function (fam, tier, o = {}) {
    const c = new Ctx(); const f = W.EMB_FAM[fam]; const [m1, m2] = METAL[tier];
    const n = { bronze: 1, prata: 2, ouro: 3 }[tier];
    const scal = Array.from({ length: 16 }, (_, i) => { const a = i / 16 * Math.PI * 2; return `<circle cx="${(100 + Math.cos(a) * 70).toFixed(1)}" cy="${(96 + Math.sin(a) * 70).toFixed(1)}" r="13"/>`; }).join('');
    if (o.locked) {
      return c.svg(`<g opacity=".55">
        <path d="M70,140 L56,206 L76,194 L88,212 L96,150Z M130,140 L144,206 L124,194 L112,212 L104,150Z" fill="#E3D6C4"/>
        <g fill="#EADFCF">${scal}</g><circle cx="100" cy="96" r="70" fill="#EADFCF"/>
        <circle cx="100" cy="96" r="56" fill="#F6EFE4" stroke="#C9B9A2" stroke-width="3" stroke-dasharray="7 6"/>
        <g transform="translate(50,46)" opacity=".35" style="filter:grayscale(1)">${ICON[fam](c, o.letra)}</g></g>
        <g transform="translate(100,96)"><circle r="17" fill="#FFFBF4" stroke="#C9B9A2" stroke-width="2.5"/><text y="7" font-family="Fredoka" font-weight="700" font-size="21" text-anchor="middle" fill="#A8957E">?</text></g>`, '0 0 200 220', o.attrs || '');
    }
    const iconLayer = ICON[fam](c, o.letra);
    return c.svg(`
      <path d="M70,140 L56,206 L76,194 L88,212 L96,150Z" fill="${c.l(f.cor)}" stroke="${S(f.cor)}" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M130,140 L144,206 L124,194 L112,212 L104,150Z" fill="${c.l(dk(f.cor, .1))}" stroke="${S(f.cor)}" stroke-width="2.5" stroke-linejoin="round"/>
      <ellipse cx="100" cy="176" rx="70" ry="10" fill="#3b1d0c" opacity=".12"/>
      <g fill="${c.stops([[0, lt(m1, .5)], [.45, m1], [1, m2]], [0, 0, 1, 1])}" stroke="${m2}" stroke-width="2.5">${scal}</g>
      <circle cx="100" cy="96" r="70" fill="${c.stops([[0, lt(m1, .55)], [.4, m1], [1, m2]], [0, 0, 1, 1])}"/>
      <circle cx="100" cy="96" r="60" fill="${c.stops([[0, m2], [1, lt(m1, .4)]], [0, 0, 1, 1])}"/>
      <circle cx="100" cy="96" r="54" fill="${c.r(f.cor, { cx: 35, cy: 28, hi: .35 })}"/>
      <circle cx="100" cy="96" r="54" fill="none" stroke="${dk(f.cor, .35)}" stroke-width="2"/>
      <g transform="translate(50,46)" style="filter:drop-shadow(0 2px 0 rgba(0,0,0,.25))">${iconLayer}</g>
      <path d="M58,70 Q72,44 102,40 Q76,52 66,76Z" fill="#fff" opacity=".35"/>
      <g transform="translate(100,160)">
        <path d="M-50,-12 h100 l-8,12 8,12 h-100 l8,-12z" fill="${c.l(m1, { hi: .3 })}" stroke="${m2}" stroke-width="2.5" stroke-linejoin="round"/>
        ${Array.from({ length: n }, (_, i) => { const x = (i - (n - 1) / 2) * 22; return `<path transform="translate(${x},0)" d="M0,-9 l2.6,5.6 6,.8 -4.4,4.2 1.1,6 -5.3,-2.9 -5.3,2.9 1.1,-6 -4.4,-4.2 6,-.8z" fill="#FFFBF4" stroke="${m2}" stroke-width="1.2"/>`; }).join('')}
      </g>
      ${spark(160, 40, .9)}${tier === 'ouro' ? spark(40, 130, .6) : ''}`, '0 0 200 220', o.attrs || '');
  };
})(window);
/* padaria da vila: vazia (sem forno) ou aberta */
(function (W) {
  const { Ctx, lt, dk, S, gl, spark } = W.FX;
  W.padaria = function (aberta, attrs = '') {
    const c = new Ctx(); const w = '#F6E7C8', r = '#A9472A';
    return c.svg(`${c.sh(100, 186, 90)}
      <rect x="22" y="70" width="156" height="112" rx="6" fill="${c.l(w)}" stroke="${S(w, .45)}" stroke-width="3"/>
      <path d="M12,74 L40,26 h120 l28,48z" fill="${c.l(r)}" stroke="${S(r)}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M40,26 L28,74 M70,26 L64,74 M100,26 V74 M130,26 L136,74 M160,26 L172,74" stroke="${dk(r, .2)}" stroke-width="2.5" opacity=".6"/>
      <rect x="54" y="78" width="92" height="20" rx="5" fill="${c.l('#7A4B2E')}"/><text x="100" y="93" font-family="Fredoka" font-weight="700" font-size="13" text-anchor="middle" fill="#FFF4E2">PADARIA</text>
      <path d="M78,182 v-50 q22,-18 44,0 v50z" fill="${aberta ? c.l('#F2B33D') : c.l('#9C8F80')}" stroke="${S('#7A4B2E')}" stroke-width="3"/>
      ${aberta ? `<path d="M84,182 v-46 q16,-12 32,0 v46z" fill="#FFE9A8" opacity=".8"/>` : `<path d="M82,150 l36,16 M82,166 l36,-16" stroke="#7A4B2E" stroke-width="5" stroke-linecap="round"/>`}
      <rect x="32" y="110" width="36" height="34" rx="4" fill="${aberta ? c.l('#FFE08A') : '#B9AEA0'}" stroke="${S('#7A4B2E')}" stroke-width="2.5"/>
      <rect x="132" y="110" width="36" height="34" rx="4" fill="${aberta ? c.l('#FFE08A') : '#B9AEA0'}" stroke="${S('#7A4B2E')}" stroke-width="2.5"/>
      ${aberta ? `<ellipse cx="50" cy="132" rx="12" ry="6" fill="${c.r('#D99A4E')}"/><ellipse cx="150" cy="132" rx="12" ry="6" fill="${c.r('#D99A4E')}"/>
      <path d="M150,24 q-10,-12 2,-18 q12,-6 4,-14" stroke="#E6DCCB" stroke-width="6" fill="none" stroke-linecap="round" opacity=".8"/>${spark(30, 40)}${spark(176, 100, .7)}` : `<path d="M150,30 v-10" stroke="none"/>`}
      <rect x="140" y="12" width="16" height="20" fill="${c.l('#9A4B2A')}"/>`, '0 0 200 200', attrs);
  };
})(window);
