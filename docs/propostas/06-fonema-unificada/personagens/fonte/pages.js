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
