const { P, defs, page, groundShadow } = require('./core');
const S = require('./sofia');

const header = (w, title, sub) => `<text x="60" y="78" class="t" font-family="Fredoka" font-weight="700" font-size="44" fill="${P.ink}">${title}</text>
  <text x="62" y="116" font-family="Andika" font-size="20" fill="${P.slate}">${sub}</text>
  <text x="${w - 60}" y="78" text-anchor="end" font-family="Fredoka" font-weight="600" font-size="20" fill="${P.mango}">FONEMA · proposta unificada · personagens</text>`;
const swatch = (x, y, c, name, role) => `<g transform="translate(${x},${y})"><rect width="54" height="54" rx="14" fill="${c}" stroke="${P.line}" stroke-opacity=".25" stroke-width="2"/><text x="68" y="23" font-family="Andika" font-weight="700" font-size="17" fill="${P.ink}">${name} <tspan font-weight="400" fill="${P.slate}">${c.toUpperCase()}</tspan></text><text x="68" y="45" font-family="Andika" font-size="15" fill="${P.slate}">${role}</text></g>`;

function sofiaFolhaModelo() {
  const W = 1800, H = 1100, sc = 0.66, base = 960;
  const views = [
    ['FRENTE', 260, S.sofia({ expr: 'neutra' })],
    ['TRÊS-QUARTOS', 590, S.sofia({ expr: 'alegre', turn: 1 })],
    ['PERFIL', 900, S.sofiaSide()],
    ['COSTAS', 1200, S.sofiaBack()],
  ];
  let g = '';
  // grade de altura (unidades de cabeça)
  const top = base - 1000 * sc;
  for (let i = 0; i <= 4; i++) {
    const y = base - i * 250 * sc;
    g += `<line x1="90" x2="1380" y1="${y}" y2="${y}" stroke="${P.slate}" stroke-opacity=".18" stroke-dasharray="6 8"/><text x="72" y="${y + 6}" text-anchor="end" font-size="15" fill="${P.slate}">${i}</text>`;
  }
  g += `<text x="40" y="${top - 18}" font-size="15" fill="${P.slate}">cabeças</text>`;
  for (const [lab, x, svg] of views) {
    g += groundShadow(x, base + 4, 120);
    g += `<g transform="translate(${x},${base - 1000 * sc}) scale(${sc})">${svg}</g>`;
    g += `<text x="${x}" y="${base + 52}" text-anchor="middle" font-family="Fredoka" font-weight="600" font-size="20" fill="${P.ink}" letter-spacing="2">${lab}</text>`;
  }
  // painel lateral
  const px = 1420;
  let side = `<rect x="${px}" y="150" width="340" height="900" rx="28" fill="#FFFDF7" stroke="${P.line}" stroke-opacity=".12" stroke-width="2"/>
   <text x="${px + 24}" y="196" font-family="Fredoka" font-weight="600" font-size="24" fill="${P.ink}">Paleta da Sofia</text>`;
  const sw = [[P.skin, 'Pele', 'base · luz #C48A62'], [P.skinSh, 'Pele sombra', 'dobras, pescoço'], [P.hair, 'Cabelo', 'cachos 3C/4A · brilho #6B4130'], [P.shirt, 'Camiseta Manga', 'acento da Sofia (não texto)'], [P.shorts, 'Bermuda jeans', 'sombra #22467F'], [P.pack, 'Mochila', 'exploradora · #38A090'], [P.strap, 'Alças couro', 'presilha e alças'], [P.ipe, 'Ipê amarelo', 'fivela, brincos, fecho'], [P.lace, 'Tênis / cadarço', 'sola verde Mata'], [P.line, 'Contorno', 'nunca preto puro']];
  sw.forEach(([c, n, r], i) => side += swatch(px + 24, 220 + i * 66, c, n, r));
  side += `<text x="${px + 24}" y="${910}" font-family="Fredoka" font-weight="600" font-size="20" fill="${P.ink}">Proporção</text>
   <text x="${px + 24}" y="${938}" font-size="15.5" fill="${P.slate}">4 cabeças de altura · olhos na</text>
   <text x="${px + 24}" y="${960}" font-size="15.5" fill="${P.slate}">metade da cabeça · mãos de 4 dedos</text>
   <text x="${px + 24}" y="${982}" font-size="15.5" fill="${P.slate}">arredondadas · contorno 3,5–4 px</text>
   <text x="${px + 24}" y="${1004}" font-size="15.5" fill="${P.slate}">(a 1000 px de altura) · luz de cima</text>
   <text x="${px + 24}" y="${1026}" font-size="15.5" fill="${P.slate}">à esquerda.</text>`;
  // nota de rodapé + comparação de altura
  const foot = `<text x="90" y="1072" font-size="16" fill="${P.slate}">Sofia, ~9–10 anos · parda · fivela de flor de ipê (identidade fixa) · mochila de exploradora com caderno amarelo e lupa · camiseta com a "letra da semana" (troca por fase) · brincos de bolinha.</text>`;
  const body = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${defs()}
   <rect width="${W}" height="${H}" fill="${P.cream}"/>
   ${header(W, 'Sofia · folha-modelo (turnaround)', 'Frente, três-quartos, perfil e costas · ilustração vetorial de referência para a ilustradora e para o rig em Rive')}
   ${g}${side}${foot}</svg>`;
  return { w: W, h: H, html: page(W, H, body) };
}

module.exports = { 'sofia-folha-modelo': sofiaFolhaModelo };

function sofiaExpressoes() {
  const W = 1800, H = 1160;
  const list = [
    ['alegre', 'Alegre', 'abertura, "que bom te ver!"', {}],
    ['orgulhosa', 'Orgulhosa do esforço', '"foi devagarinho e deu certo!"', { armR: { t: [60, 470], hand: 'thumb', bend: 'out', hrot: 90, flip: -1 } }],
    ['curiosa', 'Curiosa', 'apresenta um som novo', {}],
    ['pensativa', 'Pensativa', '"hmm, deixa eu pensar…"', { armR: { t: [44, 392], hand: 'fist', hrot: 190 } }],
    ['surpresa', 'Surpresa alegre', 'acerto inesperado', {}],
    ['encorajadora', 'Encorajadora', '"vamos tentar juntas?"', { armR: { t: [104, 560], hand: 'open', hrot: -60, bend: 'in' } }],
    ['calma', 'Calma · respirando', 'pausa, regulação, fim de sessão', { armL: { t: [-40, 560], hand: 'relax', hrot: 20 }, armR: { t: [40, 560], hand: 'relax', hrot: 160 } }],
    ['empatica', 'Empática (triste leve)', '"esse som é difícil mesmo"', { armR: { t: [30, 520], hand: 'relax', hrot: 150 } }],
    ['rindo', 'Rindo', 'humor leve, nunca da criança', {}],
    ['concentrada', 'Concentrada', 'escrevendo / traçando letra', {}],
    ['escutando', 'Escutando', 'espera 3–5 s pela criança', { armL: { t: [-146, 292], hand: 'open', hrot: 250, bend: 'in' } }],
    ['comemorando', 'Comemorando', 'só no fim do bloco', { armL: { t: [-170, 230], hand: 'open', hrot: 160 }, armR: { t: [170, 230], hand: 'open', hrot: 200 } }],
  ];
  const cw = 272, ch = 470, x0 = 64, y0 = 150;
  let g = '';
  list.forEach(([k, name, use, extra], i) => {
    const c = i % 6, r = Math.floor(i / 6);
    const x = x0 + c * (cw + 14), y = y0 + r * (ch + 22);
    const id = 'ex' + i;
    g += `<g transform="translate(${x},${y})"><rect width="${cw}" height="${ch}" rx="26" fill="${i % 2 ? '#FFF4E4' : '#FFFBF4'}" stroke="${P.line}" stroke-opacity=".1" stroke-width="2"/>
      <defs><clipPath id="${id}"><rect width="${cw}" height="${ch - 92}" rx="26"/></clipPath></defs>
      <g clip-path="url(#${id})"><circle cx="${cw / 2}" cy="190" r="118" fill="${[P.sky, P.mint, P.peach][i % 3]}"/><g transform="translate(${cw / 2},${12}) scale(.58)">${S.sofia({ expr: k, letter: '', ...extra })}</g></g>
      <text x="${cw / 2}" y="${ch - 54}" text-anchor="middle" font-family="Fredoka" font-weight="600" font-size="21" fill="${P.ink}">${i + 1}. ${name}</text>
      <text x="${cw / 2}" y="${ch - 26}" text-anchor="middle" font-size="15.5" fill="${P.slate}">${use}</text></g>`;
  });
  const body = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${defs()}<rect width="${W}" height="${H}" fill="${P.cream}"/>
   ${header(W, 'Sofia · 12 expressões', 'Elogia esforço e estratégia · nunca chantagem emocional ("fiquei triste porque você saiu"), nunca decepção, nunca comparação')}
   ${g}
   <text x="60" y="${H - 22}" font-size="16" fill="${P.slate}">Regra: a Sofia fica parada e atenta enquanto a criança responde (sem animação de fundo). "Empática" acolhe a dificuldade da tarefa — nunca culpa a criança nem pede que ela fique por causa da Sofia.</text></svg>`;
  return { w: W, h: H, html: page(W, H, body) };
}
module.exports['sofia-expressoes'] = sofiaExpressoes;

const waves = (x, y, n = 3, rot = 0, col = P.ipeSh) => `<g transform="translate(${x},${y}) rotate(${rot})">${Array.from({ length: n }, (_, i) => `<path d="M${14 + i * 14},-${10 + i * 7} q${8},${10 + i * 7} 0,${20 + i * 14}" fill="none" stroke="${col}" stroke-width="5" stroke-linecap="round" opacity="${1 - i * 0.22}"/>`).join('')}</g>`;
function letterCard(x, y, L, s = 1, col = P.cons) { return `<g transform="translate(${x},${y}) scale(${s})"><rect x="-62" y="-70" width="124" height="140" rx="28" fill="#fff" stroke="${P.line}" stroke-width="4"/><rect x="-62" y="52" width="124" height="18" rx="9" fill="${P.sky}"/><text y="34" text-anchor="middle" font-family="Andika" font-weight="700" font-size="104" fill="${col}">${L}</text></g>`; }
function confetti(seed, n, cx, cy, R) { const r = require('./core').rng(seed); let g = ''; for (let i = 0; i < n; i++) { const a = r() * 6.28, d = R * (0.4 + r() * 0.6); const c = [P.ipe, P.mango, P.cons, P.ok, P.focus, P.vowel][i % 6]; g += `<rect x="-6" y="-3" width="12" height="6" rx="3" fill="${c}" transform="translate(${(cx + Math.cos(a) * d).toFixed(1)},${(cy + Math.sin(a) * d * 0.7).toFixed(1)}) rotate(${(r() * 180).toFixed(0)})"/>`; } return g; }

function sofiaPoses() {
  const W = 1800, H = 1290;
  const poses = [
    ['Apontar para a letra', 'gesto que guia a atenção (sinalização)', { expr: 'alegre', turn: 1, armR: { t: [236, 300], hand: 'point', hrot: -50, bend: 'out' }, headTilt: 6 }, letterCard(330, 200, 'M', 0.9)],
    ['Mão no pescoço', 'som vozeado: "a garganta vibra" (/v/, /b/, /z/)', { expr: { eyes: 'open', mouth: 7, b: [-8, 0, -8, 0], look: [0, 0] }, armR: { t: [34, 404], hand: 'open', hrot: 172, bend: 'out', flip: 1 } }, waves(-36, 408, 3, 180) + waves(84, 408, 3, 0) + `<text x="236" y="250" font-family="Andika" font-weight="700" font-size="56" fill="${P.cons}">/v/</text>`],
    ['Dedo no nariz', 'som nasal: "o ar sai pelo nariz" (/m/, /n/)', { expr: { eyes: 'open', mouth: 6, b: [-6, 0, -6, 0], look: [-3, 0] }, armR: { t: [50, 318], hand: 'point', hrot: -150, bend: 'out' } }, `<path d="M-150,290 q-30,-6 -60,0 M-150,312 q-30,6 -60,22" fill="none" stroke="#8BB8E6" stroke-width="6" stroke-linecap="round" stroke-dasharray="2 12"/><text x="236" y="250" font-family="Andika" font-weight="700" font-size="56" fill="${P.cons}">/m/</text>`],
    ['Ouvir', 'espera a criança 3–5 s, mão em concha', { expr: 'escutando', armL: { t: [-150, 292], hand: 'open', hrot: 250, bend: 'in' } }, waves(-220, 270, 3, 180, P.focus)],
    ['Celebrar', 'só no fim do bloco · brilho ≤ 1,5 s', { expr: 'comemorando', legs: 'jump', armL: { t: [-180, 210], hand: 'wave', hrot: 160 }, armR: { t: [180, 210], hand: 'wave', hrot: 200 } }, confetti(5, 26, 0, 200, 260)],
    ['Explicar', 'olha para a tarefa, palmas abertas', { expr: 'falando', armL: { t: [-196, 520], hand: 'open', hrot: 140, bend: 'in' }, armR: { t: [196, 520], hand: 'open', hrot: 40, bend: 'in' } }, ''],
    ['Convidar', '"agora você!" — passa a vez à criança', { expr: 'encorajadora', turn: 1, armR: { t: [230, 470], hand: 'open', hrot: -10, bend: 'in' } }, `<circle cx="300" cy="460" r="30" fill="${P.ok}" opacity=".18"/><circle cx="300" cy="460" r="16" fill="${P.ok}" opacity=".35"/>`],
    ['Despedir', '"amanhã tem mais! mostra pra alguém de casa"', { expr: 'alegre', headTilt: -6, armR: { t: [188, 250], hand: 'wave', hrot: -100, bend: 'out' } }, `<path d="M250,200 q16,-14 30,0 M262,170 q16,-14 30,0" fill="none" stroke="${P.ipeSh}" stroke-width="5" stroke-linecap="round"/>`],
  ];
  const cw = 404, ch = 520, x0 = 64, y0 = 150;
  let g = '';
  poses.forEach(([name, use, o, extra], i) => {
    const c = i % 4, r = Math.floor(i / 4);
    const x = x0 + c * (cw + 18), y = y0 + r * (ch + 18);
    g += `<g transform="translate(${x},${y})"><rect width="${cw}" height="${ch}" rx="28" fill="${i % 2 ? '#FFF4E4' : '#FFFBF4'}" stroke="${P.line}" stroke-opacity=".1" stroke-width="2"/>
      ${groundShadow(cw / 2, 438, 110)}
      <g transform="translate(${cw / 2 - (o.turn ? 30 : 0)},${-18}) scale(.455)">${S.sofia({ letter: i === 0 ? 'M' : i === 1 ? 'V' : i === 2 ? 'M' : 'A', ...o })}${extra}</g>
      <text x="${cw / 2}" y="${ch - 50}" text-anchor="middle" font-family="Fredoka" font-weight="600" font-size="23" fill="${P.ink}">${i + 1}. ${name}</text>
      <text x="${cw / 2}" y="${ch - 22}" text-anchor="middle" font-size="16" fill="${P.slate}">${use}</text></g>`;
  });
  const body = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${defs()}<rect width="${W}" height="${H}" fill="${P.cream}"/>
   ${header(W, 'Sofia · 8 poses de ensino', 'Cada gesto reforça a articulação (Ehri; Sargiani et al.) e vira um estado da state machine "corpo" no Rive')}
   ${g}<text x="64" y="${H - 22}" font-size="16" fill="${P.slate}">Gestos são ganchos de memória, não mecanismo de aprendizagem: som + boca + letra sempre congruentes e simultâneos. Nenhum gesto de enfeite durante a resposta da criança.</text></svg>`;
  return { w: W, h: H, html: page(W, H, body) };
}
module.exports['sofia-poses'] = sofiaPoses;

const B = require('./bolota');
function bolotaFolha() {
  const W = 1800, H = 1100;
  let g = '';
  const card = (x, y, w, h, title, sub, inner, tone = '#FFFBF4') => `<g transform="translate(${x},${y})"><rect width="${w}" height="${h}" rx="28" fill="${tone}" stroke="${P.line}" stroke-opacity=".1" stroke-width="2"/>${inner}
     <text x="${w / 2}" y="${h - 46}" text-anchor="middle" font-family="Fredoka" font-weight="600" font-size="22" fill="${P.ink}" letter-spacing="1">${title}</text>
     <text x="${w / 2}" y="${h - 20}" text-anchor="middle" font-size="15.5" fill="${P.slate}">${sub}</text></g>`;
  g += card(60, 150, 620, 470, 'LATERAL ¾ (pose padrão)', 'olha para a direita · cabeça grande, olhos de filhote', `${groundShadow(300, 360, 190)}<g transform="translate(290,360) scale(1.25)">${B.bolota({})}</g>`);
  g += card(700, 150, 330, 470, 'FRENTE', 'escudo da cabeça em "chapéu"', `${groundShadow(165, 360, 120)}<g transform="translate(165,360) scale(.95)">${B.bolotaFront()}</g>`, '#FFF4E4');
  g += card(1050, 150, 330, 470, 'COSTAS', 'escudo da cauda · 3 cintas', `${groundShadow(165, 360, 120)}<g transform="translate(165,360) scale(.95)">${B.bolotaBack()}</g>`);
  // sequência virar bola
  const arrow = x => `<path d="M${x},190 l30,0 m-10,-10 l10,10 l-10,10" stroke="${P.slate}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
  const seq = `${groundShadow(120, 280, 80)}<g transform="translate(110,280) scale(.5)">${B.bolota({ eyes: 'wide', mouth: 'o', ears: 'down' })}</g>${arrow(225)}
    ${groundShadow(355, 280, 70)}<g transform="translate(340,280) scale(.55)">${B.bolota({ pose: 'half', eyes: 'open' })}</g>${arrow(445)}
    ${groundShadow(580, 280, 60)}<g transform="translate(580,280) scale(.62)">${B.bolotaBall({ motion: false, rot: 0 })}</g>`;
  g += card(60, 640, 700, 410, 'VIRA BOLA EM 3 TEMPOS', 'susto/timidez → meio enrolado → bola fechada (escudos da cabeça e cauda encaixam)', seq, '#FFF4E4');
  // escala com Sofia
  const sc = `<line x1="40" x2="560" y1="330" y2="330" stroke="${P.slate}" stroke-opacity=".25"/>${groundShadow(170, 330, 80)}<g transform="translate(170,${330 - 1000 * 0.3}) scale(.3)">${S.sofia({ expr: 'alegre', armR: { t: [150, 640], hand: 'relax' } })}</g>
    ${groundShadow(330, 330, 60)}<g transform="translate(320,330) scale(.4)">${B.bolota({ eyes: 'happy', look: [0, 0] })}</g>
    <path d="M440,330 V250" stroke="${P.mango}" stroke-width="3"/><path d="M432,250 h16 M432,330 h16" stroke="${P.mango}" stroke-width="3"/><text x="458" y="296" font-size="17" fill="${P.ink}">Bolota ≈</text><text x="458" y="318" font-size="17" fill="${P.ink}">altura do joelho</text>`;
  g += card(780, 640, 600, 410, 'ESCALA COM A SOFIA', 'menor e mais novo que a criança: inverte a hierarquia (efeito protegido)', sc.replace(/330/g, '300').replace(/250/g, '220'));
  // paleta
  let side = `<rect x="1400" y="150" width="340" height="900" rx="28" fill="#FFFDF7" stroke="${P.line}" stroke-opacity=".12" stroke-width="2"/>
    <text x="1424" y="196" font-family="Fredoka" font-weight="600" font-size="24" fill="${P.ink}">Paleta do Bolota</text>`;
  [[P.shell, 'Casco', 'base · luz #E6BD82'], [P.shellSh, 'Casco sombra', 'laterais e base'], [P.band, 'Cintas', '3 cintas móveis'], [P.scute, 'Escamas', 'rosetas, opacidade 55%'], [P.bskin, 'Pele', 'rosto, patas'], [P.bear, 'Orelha / focinho', 'interior rosado'], ['#F6E2CB', 'Barriga', 'pelos claros'], [P.ipe, 'Caderninho', 'registro do que aprendeu']].forEach(([c, n, r], i) => side += swatch(1424, 220 + i * 66, c, n, r));
  side += `<text x="1424" y="776" font-family="Fredoka" font-weight="600" font-size="20" fill="${P.ink}">Quem é</text>
   ${['Filhote de tatu-bola (Tolypeutes', 'tricinctus), fauna da Caatinga e do', 'Cerrado, ameaçado de extinção.', 'Erra de propósito o que a criança', 'JÁ domina (p/b, f/v, b/d…); a', 'criança corrige e ele melhora de', 'verdade na sessão. Nunca é piada', 'humilhante. Rolar como bola é seu', 'jeito de "pensar" ou se acalmar.'].map((t, i) => `<text x="1424" y="${806 + i * 24}" font-size="15.5" fill="${P.slate}">${t}</text>`).join('')}`;
  const body = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${defs()}<rect width="${W}" height="${H}" fill="${P.cream}"/>
   ${header(W, 'Bolota · folha-modelo', 'O aprendiz que erra e aprende · lateral, frente, costas, virar bola e escala')}${g}${side}</svg>`;
  return { w: W, h: H, html: page(W, H, body) };
}
function bolotaExpr() {
  const W = 1800, H = 1030;
  const L = [
    ['Alegre', 'chega para a lição', {}],
    ['Curioso', '"o que é isso?"', { eyes: 'wide', mouth: 'o', look: [4, -3], extra: 'q' }],
    ['Errou (oops!)', 'troca /p/ por /b/ de propósito', { eyes: 'squint', mouth: 'wobbly', ears: 'down', extra: 'sweat' }],
    ['Pensando', 'espera a criança ensinar', { eyes: 'half', mouth: 'flat', look: [4, -6], brow: -10 }],
    ['Aprendeu!', '"ah, agora entendi!"', { eyes: 'wide', mouth: 'open', extra: 'bulb' }],
    ['Agradecido', '"obrigado por me ensinar"', { eyes: 'happy', mouth: 'smile', extra: 'heart', blush: 1.6 }],
    ['Surpreso', 'susto leve, orelhas baixas', { eyes: 'wide', mouth: 'o', ears: 'down' }],
    ['Lendo o caderninho', 'mostra o que aprendeu', { pose: 'read', eyes: 'open', look: [4, 2], mouth: 'smile' }],
    ['Tímido', 'meio enrolado, espiando', { pose: 'half', eyes: 'open', look: [3, 1] }],
    ['Rolando como bola', 'jeito de pensar ou se acalmar', { pose: 'ball' }],
    ['Comemorando', 'pula quando acerta junto', { pose: 'jump', eyes: 'happy', mouth: 'open', extra: 'spark' }],
    ['Sonolento', '"lê para o Bolota dormir"', { eyes: 'closed', mouth: 'flat', ears: 'down', extra: 'zzz' }],
  ];
  const cw = 272, ch = 400, x0 = 64, y0 = 150;
  let g = '';
  L.forEach(([n, u, o], i) => {
    const c = i % 6, r = Math.floor(i / 6), x = x0 + c * (cw + 14), y = y0 + r * (ch + 20);
    const s = o.pose === 'ball' ? 0.6 : o.pose === 'half' ? 0.72 : 0.56;
    g += `<g transform="translate(${x},${y})"><rect width="${cw}" height="${ch}" rx="26" fill="${i % 2 ? '#FFF4E4' : '#FFFBF4'}" stroke="${P.line}" stroke-opacity=".1" stroke-width="2"/>
      <circle cx="${cw / 2}" cy="180" r="112" fill="${[P.sky, P.mint, P.peach][i % 3]}"/>${groundShadow(cw / 2, 280, 100)}
      <g transform="translate(${cw / 2 - (o.pose === 'ball' ? -14 : o.pose === 'read' ? 40 : 28)},280) scale(${s})">${B.bolota(o)}</g>
      <text x="${cw / 2}" y="${ch - 50}" text-anchor="middle" font-family="Fredoka" font-weight="600" font-size="21" fill="${P.ink}">${i + 1}. ${n}</text>
      <text x="${cw / 2}" y="${ch - 24}" text-anchor="middle" font-size="15.5" fill="${P.slate}">${u}</text></g>`;
  });
  const body = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${defs()}<rect width="${W}" height="${H}" fill="${P.cream}"/>
   ${header(W, 'Bolota · 12 expressões e estados', 'Erra, pensa, aprende e agradece — o erro é dele, a correção é da criança (efeito protegido)')}${g}
   <text x="64" y="${H - 22}" font-size="16" fill="${P.slate}">Bolota nunca erra o que a criança ainda não domina; o "oops" é leve e logo vira "aprendeu!". Rolar como bola nunca é castigo nem sinal de medo da criança.</text></svg>`;
  return { w: W, h: H, html: page(W, H, body) };
}
module.exports['bolota-folha-modelo'] = bolotaFolha;
module.exports['bolota-expressoes'] = bolotaExpr;
