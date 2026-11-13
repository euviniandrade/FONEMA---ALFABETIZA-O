// Corte lateral (sagital) esquemático e animável — "Por dentro da boca" do Espelho do Som.
// Caixa 300×320, rosto virado para a direita. Cada parte é uma camada separada (vira osso/estado no Rive).
const { P, uid } = require('./core');

const C = {
  skin: '#D9A07A', skinLine: P.line, nasal: '#F7D6CF', phar: '#E8A29C', oral: '#A9475A',
  bone: '#F4E6D0', tooth: '#FFFDF6', lip: '#C2705F', tongue: '#E4747C', velum: '#EF9C98',
  air: '#2F6FE0', voice: '#F4B400',
};
const FON = {
  m: { jaw: 0, velum: 'down', air: 'nasal', voice: true, tongue: [[168, 180], [222, 172]], lips: 'closed' },
  f: { jaw: 3, velum: 'up', air: 'oral', voice: false, tongue: [[168, 178], [222, 172]], lips: 'labiodental' },
  v: { jaw: 3, velum: 'up', air: 'oral', voice: true, tongue: [[168, 178], [222, 172]], lips: 'labiodental' },
  s: { jaw: 2, velum: 'up', air: 'oral', voice: false, tongue: [[170, 160], [226, 140]], lips: 'apart' },
  l: { jaw: 6, velum: 'up', air: 'lateral', voice: true, tongue: [[166, 172], [229, 130]], lips: 'apart' },
  a: { jaw: 15, velum: 'up', air: 'oral', voice: true, tongue: [[166, 194], [218, 190]], lips: 'open' },
};

function corte(fon, o = {}) {
  const F = typeof fon === 'string' ? FON[fon] : fon;
  const id = uid('ct'), mk = uid('ar');
  const [[dx, dy], [tx, ty]] = F.tongue;
  let g = `<defs><marker id="${mk}" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4.2" markerHeight="4.2" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10z" fill="${C.air}"/></marker>
    <clipPath id="${id}"><rect x="0" y="0" width="300" height="320" rx="22"/></clipPath></defs><g clip-path="url(#${id})">`;
  g += `<rect width="300" height="320" fill="${o.bg || '#F4F7FE'}"/>`;
  // cabeça (parte fixa)
  g += `<path d="M-10,-10 H196 C214,10 228,40 232,66 L264,96 Q271,108 255,113 L250,116 Q256,126 258,138 Q259,150 246,154 L228,151 L120,151 L118,240 L170,262 Q190,272 196,330 L-10,330Z" fill="${C.skin}" stroke="${C.skinLine}" stroke-width="3.2" stroke-linejoin="round"/>`;
  g += `<path d="M246,128 Q258,132 258,142 Q258,151 246,154 L238,150 Q240,136 246,128Z" fill="${C.lip}"/>`;
  // cavidade nasal, faringe, cavidade oral
  g += `<path d="M116,70 Q180,56 238,80 L257,104 Q252,112 238,108 Q190,111 134,113 Q110,110 112,92Z" fill="${C.nasal}" stroke="${C.skinLine}" stroke-width="2.2"/>`;
  g += `<path d="M86,96 Q78,190 92,330 L124,330 Q114,200 124,112 Q104,96 86,96Z" fill="${C.phar}" stroke="${C.skinLine}" stroke-width="2.2"/>`;
  g += `<path d="M124,118 L232,122 L248,152 L250,200 L124,200Z" fill="${C.oral}"/>`;
  // palato duro + dentes de cima
  g += `<path d="M132,112 Q190,107 238,110 L236,123 Q190,121 132,125Z" fill="${C.bone}" stroke="${C.skinLine}" stroke-width="2.2"/>`;
  g += `<path d="M229,116 L242,116 Q247,136 241,150 L232,150 Q227,134 229,116Z" fill="${C.tooth}" stroke="${C.skinLine}" stroke-width="2.2"/>`;
  // véu palatino
  g += F.velum === 'down'
    ? `<path d="M136,114 Q116,124 112,160 Q117,168 125,160 Q128,136 138,126Z" fill="${C.velum}" stroke="${C.skinLine}" stroke-width="2.2"/>`
    : `<path d="M136,113 Q110,112 92,100 Q88,110 96,116 Q116,128 138,126Z" fill="${C.velum}" stroke="${C.skinLine}" stroke-width="2.2"/>`;
  // mandíbula (gira em torno da ATM)
  const ll = F.lips === 'labiodental' ? 'translate(-12,-6)' : '';
  g += `<g transform="rotate(${F.jaw} 118 138)">
    <path d="M118,151 L246,157 Q258,161 256,175 Q251,184 244,189 Q248,207 236,222 Q220,236 180,240 L118,240Z" fill="${C.skin}" stroke="${C.skinLine}" stroke-width="3.2" stroke-linejoin="round"/>
    <path d="M118,160 L118,240 L150,240 Q170,200 226,186 L228,160Z" fill="${C.oral}"/>
    <path d="M118,242 C108,200 128,${dy} ${dx},${dy} C${dx + 36},${dy} ${tx - 14},${ty - 6} ${tx},${ty} Q${tx + 7},${ty + 9} ${tx - 6},${ty + 15} C206,186 176,200 160,242Z" fill="${C.tongue}" stroke="${C.skinLine}" stroke-width="2.4" stroke-linejoin="round"/>
    <path d="M${dx - 10},${dy + 16} Q${dx + 20},${dy + 8} ${tx - 20},${ty + 12}" fill="none" stroke="#C85A62" stroke-width="2" stroke-linecap="round" opacity=".6"/>
    <path d="M229,158 L240,158 Q243,172 237,182 L230,182 Q227,170 229,158Z" fill="${C.tooth}" stroke="${C.skinLine}" stroke-width="2.2"/>
    <path transform="${ll}" d="M242,158 Q256,160 256,172 Q254,184 242,186 Q236,172 242,158Z" fill="${C.lip}" stroke="${C.skinLine}" stroke-width="2.2"/>
  </g>`;
  // laringe (pregas vocais)
  g += `<g transform="translate(104,286)"><ellipse rx="15" ry="9" fill="#F3B8B2" stroke="${C.skinLine}" stroke-width="2"/><path d="M-9,-1 L0,3 L9,-1" fill="none" stroke="${C.skinLine}" stroke-width="2.2" stroke-linecap="round"/></g>`;
  if (F.voice) g += `<g fill="none" stroke="${C.voice}" stroke-width="4.2" stroke-linecap="round">
      <path d="M136,276 q8,10 0,20 M148,270 q12,16 0,32 M160,264 q16,22 0,44"/><path d="M72,276 q-8,10 0,20 M60,270 q-12,16 0,32"/></g>`;
  // fluxo de ar
  const A = `fill="none" stroke="${C.air}" stroke-width="4" stroke-linecap="round" stroke-dasharray="1 9" marker-end="url(#${mk})"`;
  if (F.air === 'nasal') g += `<path d="M104,312 Q100,200 104,120 Q112,90 160,86 Q220,84 246,100 L288,104" ${A}/>`;
  else if (F.air === 'lateral') g += `<path d="M106,312 Q102,200 120,160 Q150,${dy - 30} 200,${ty + 8}" ${A} opacity=".9"/><path d="M200,${ty + 22} Q236,166 288,${172 + F.jaw * 2}" ${A}/><text x="160" y="${ty + 46}" font-family="Andika" font-size="13" fill="${C.air}">pelos lados</text>`;
  else g += `<path d="M106,312 Q102,200 120,${Math.min(dy, ty) - 14 + F.jaw} Q170,${Math.min(dy, ty) - 18 + F.jaw} ${F.lips === 'labiodental' ? 236 : 226},${(F.lips === 'labiodental' ? 150 : ty - 2) + F.jaw * 1.4} L290,${154 + F.jaw * 2.2}" ${A}/>`;
  g += `</g><rect width="300" height="320" rx="22" fill="none" stroke="${P.line}" stroke-opacity=".18" stroke-width="2"/>`;
  return g;
}

// legendas em linguagem infantil
const PISTAS = {
  m: ['lábios fechados', 'ar sai pelo nariz', 'garganta vibra'],
  f: ['dentes no lábio de baixo', 'ar sopra pela boca', 'garganta quieta'],
  v: ['dentes no lábio de baixo', 'ar sai pela boca', 'garganta vibra'],
  s: ['dentes juntinhos', 'ar chia na ponta da língua', 'garganta quieta'],
  l: ['ponta da língua no céu da boca', 'ar passa pelos lados', 'garganta vibra'],
  a: ['boca bem aberta', 'língua deitada', 'garganta vibra'],
};
module.exports = { corte, FON, PISTAS, C };
