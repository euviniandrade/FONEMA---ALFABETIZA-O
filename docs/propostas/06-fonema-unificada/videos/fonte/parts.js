// Peças reutilizáveis: corte lateral, ilustrações de palavras, ícones.
function corteSVG() {
  return `<svg class="corte" viewBox="0 0 470 410" xmlns="http://www.w3.org/2000/svg" overflow="visible">
  <defs><clipPath id="headclip"><path id="perfil" d="M120,404 C72,300 58,170 118,100 C168,40 282,28 342,80 C372,106 380,140 374,162 L402,216 C410,228 404,238 390,238 L380,238 C382,246 384,250 388,254 C400,258 400,272 386,274 C400,280 398,296 382,298 C374,312 388,336 362,348 C342,358 302,354 282,348 L284,404Z"/></clipPath></defs>
  <use href="#perfil" fill="#F2C3A0" stroke="#1F1D3D" stroke-width="5" stroke-linejoin="round"/>
  <g clip-path="url(#headclip)">
    <path class="nasal" d="M246,186 C292,170 344,176 374,196 L398,232 L382,240 C352,224 302,212 252,214 Z" fill="#FFD9DF" stroke="#1F1D3D" stroke-width="3"/>
    <path d="M204,180 C226,174 244,178 252,188 L252,214 C236,232 232,262 236,300 L242,410 L206,410 C202,330 200,250 204,180Z" fill="#FFD9DF" stroke="#1F1D3D" stroke-width="3"/>
    <path d="M254,214 C300,212 344,222 372,240 L372,248 C344,234 300,224 254,224Z" fill="#E9DCCB" stroke="#1F1D3D" stroke-width="2.5"/>
    <path d="M252,226 C300,226 346,236 372,252 L372,268 C340,270 292,268 256,262 Z" fill="#B44B5E" stroke="#1F1D3D" stroke-width="2.5"/>
    <path d="M238,300 C240,262 288,246 330,250 C354,252 368,258 370,268 C340,280 296,292 242,312Z" fill="#E86C7A" stroke="#1F1D3D" stroke-width="3"/>
    <path d="M364,246 l8,0 l-2,12 l-6,0Z M362,270 l8,0 l1,-10 l-7,0Z" fill="#fff" stroke="#1F1D3D" stroke-width="2"/>
    <path class="veu" d="M254,218 C238,226 230,240 228,258" stroke="#C04A68" stroke-width="13" fill="none" stroke-linecap="round"/>
    <g class="laringe" transform="translate(222,352)"><rect x="-16" y="-8" width="32" height="16" rx="8" fill="#fff" stroke="#1F1D3D" stroke-width="3"/><path class="vib" d="M-10,0 l4,-4 l4,8 l4,-8 l4,8 l4,-4" stroke="#4B3FA8" stroke-width="2.5" fill="none" stroke-linejoin="round"/></g>
  </g>
  <g class="labios">
    <path d="M374,250 C388,252 400,258 398,268 L376,268Z" fill="#C9666A" stroke="#1F1D3D" stroke-width="3" stroke-linejoin="round"/>
    <path d="M376,268 L398,270 C400,284 394,296 380,296 C372,290 372,278 376,268Z" fill="#B9575C" stroke="#1F1D3D" stroke-width="3" stroke-linejoin="round"/>
  </g>
  <ellipse class="ring-labios" cx="388" cy="272" rx="30" ry="34" fill="none" stroke="#FF8CC6" stroke-width="5" stroke-dasharray="8 7"/>
  <path d="M330,150 q12,-8 22,2" stroke="#1F1D3D" stroke-width="4" fill="none" stroke-linecap="round"/>
  <ellipse cx="340" cy="162" rx="5" ry="7" fill="#1F1D3D"/>
  <path d="M150,200 C130,196 126,236 148,240" stroke="#1F1D3D" stroke-width="4" fill="#E8B48F"/>
  <path class="ar" d="M224,400 C220,330 216,260 222,206 C250,188 300,190 340,202 C366,210 384,222 394,236 L446,250" fill="none" stroke="none"/>
  <g class="parts"></g>
  <g class="nvib" transform="translate(408,226)" stroke="#2EC4F1" stroke-width="5" fill="none" stroke-linecap="round">
    <path d="M10,-22 q12,22 0,44"/><path d="M24,-32 q18,32 0,64"/><path d="M38,-40 q22,40 0,80"/>
  </g>
</svg>`;
}
function initParts(svg, n = 14) {
  const g = svg.querySelector('.parts'); let h = '';
  for (let i = 0; i < n; i++) h += `<circle r="7" fill="#2EC4F1" stroke="#fff" stroke-width="2.5"/>`;
  g.innerHTML = h;
}
function flowParts(svg, t, on) {
  const path = svg.querySelector('.ar'); const cs = svg.querySelectorAll('.parts circle'); const n = cs.length;
  cs.forEach((c, i) => {
    const f = ((t * 0.42 + i / n) % 1);
    const p = along(path, f);
    c.setAttribute('cx', p.x.toFixed(1)); c.setAttribute('cy', p.y.toFixed(1));
    const edge = Math.min(f / .08, (1 - f) / .12, 1);
    c.setAttribute('opacity', (on * edge).toFixed(2));
  });
}
const ILL = {
  mala: `<svg viewBox="0 0 220 170"><ellipse cx="110" cy="160" rx="84" ry="8" fill="#1F1D3D" opacity=".1"/>
   <path d="M80,44 L80,26 Q80,14 92,14 L128,14 Q140,14 140,26 L140,44" fill="none" stroke="#1F1D3D" stroke-width="9" stroke-linecap="round"/>
   <path d="M80,44 L80,26 Q80,14 92,14 L128,14 Q140,14 140,26 L140,44" fill="none" stroke="#7A4A30" stroke-width="4" stroke-linecap="round"/>
   <rect x="24" y="42" width="172" height="112" rx="18" fill="#2EC4F1" stroke="#1F1D3D" stroke-width="5"/>
   <rect x="24" y="42" width="172" height="26" rx="12" fill="#1FA7D6" stroke="#1F1D3D" stroke-width="5"/>
   <rect x="58" y="42" width="16" height="112" fill="#7A4A30" stroke="#1F1D3D" stroke-width="4"/><rect x="146" y="42" width="16" height="112" fill="#7A4A30" stroke="#1F1D3D" stroke-width="4"/>
   <rect x="98" y="60" width="24" height="16" rx="4" fill="#FFC83D" stroke="#1F1D3D" stroke-width="3.5"/>
   <circle cx="104" cy="118" r="15" fill="#FFC83D" stroke="#1F1D3D" stroke-width="3.5"/><path d="M104,108 l3,7 7,1 -5,5 1,7 -6,-3 -6,3 1,-7 -5,-5 7,-1Z" fill="#FF6B3D"/>
   <path d="M34,80 L34,140" stroke="#8FE3FF" stroke-width="6" stroke-linecap="round"/></svg>`,
  mapa: `<svg viewBox="0 0 220 170"><ellipse cx="110" cy="160" rx="90" ry="8" fill="#1F1D3D" opacity=".1"/>
   <path d="M18,34 L76,20 L144,34 L202,20 L202,140 L144,154 L76,140 L18,154Z" fill="#FFF0C2" stroke="#1F1D3D" stroke-width="5" stroke-linejoin="round"/>
   <path d="M76,20 L76,140 L144,154 L144,34Z" fill="#FBE3A6"/>
   <path d="M76,20 L76,140 M144,34 L144,154" stroke="#1F1D3D" stroke-width="4"/>
   <path d="M30,60 Q50,44 66,58 Q72,78 54,86 Q34,90 30,60Z" fill="#2FB866" stroke="#1F1D3D" stroke-width="3"/>
   <path d="M150,90 Q172,72 192,86 Q196,112 172,118 Q150,114 150,90Z" fill="#2FB866" stroke="#1F1D3D" stroke-width="3"/>
   <path d="M18,118 Q60,104 100,124 Q140,140 202,112" stroke="#2EC4F1" stroke-width="7" fill="none"/>
   <path d="M48,72 Q90,40 118,76 Q140,104 172,96" stroke="#FF6B3D" stroke-width="4" fill="none" stroke-dasharray="8 7" stroke-linecap="round"/>
   <path d="M164,88 l14,14 M178,88 l-14,14" stroke="#C2307A" stroke-width="5" stroke-linecap="round"/></svg>`,
  mola: `<svg viewBox="0 0 220 170"><ellipse cx="110" cy="160" rx="60" ry="8" fill="#1F1D3D" opacity=".1"/>
   <rect x="58" y="138" width="104" height="16" rx="6" fill="#8E7CC3" stroke="#1F1D3D" stroke-width="4"/>
   <rect x="58" y="10" width="104" height="16" rx="6" fill="#8E7CC3" stroke="#1F1D3D" stroke-width="4"/>
   ${[0, 1, 2, 3, 4, 5].map(i => `<path d="M64,${36 + i * 18} C64,${24 + i * 18} 156,${30 + i * 18} 156,${42 + i * 18}" stroke="#1F1D3D" stroke-width="13" fill="none" stroke-linecap="round"/><path d="M64,${36 + i * 18} C64,${24 + i * 18} 156,${30 + i * 18} 156,${42 + i * 18}" stroke="#AEB6C8" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M80,${30 + i * 18} C100,${28 + i * 18} 120,${30 + i * 18} 132,${33 + i * 18}" stroke="#fff" stroke-width="2.5" fill="none" stroke-linecap="round" opacity=".9"/>`).join('')}
  </svg>`,
  // objetos com M para a missão da família
  mesa: `<svg viewBox="0 0 120 100"><rect x="10" y="30" width="100" height="14" rx="5" fill="#C98A52" stroke="#1F1D3D" stroke-width="4"/><path d="M22,44 L18,92 M98,44 L102,92" stroke="#1F1D3D" stroke-width="10" stroke-linecap="round"/><path d="M22,44 L18,92 M98,44 L102,92" stroke="#A86D3A" stroke-width="4" stroke-linecap="round"/><circle cx="44" cy="22" r="10" fill="#FF6B3D" stroke="#1F1D3D" stroke-width="3.5"/><rect x="66" y="10" width="20" height="20" rx="4" fill="#2EC4F1" stroke="#1F1D3D" stroke-width="3.5"/></svg>`,
  mamao: `<svg viewBox="0 0 120 100"><path d="M60,10 C88,12 104,40 100,62 C96,84 78,94 60,94 C42,94 24,84 20,62 C16,40 32,12 60,10Z" fill="#FF9A3D" stroke="#1F1D3D" stroke-width="4"/><path d="M60,26 C76,28 84,46 82,62 C80,76 70,82 60,82 C50,82 40,76 38,62 C36,46 44,28 60,26Z" fill="#FFC27A"/><g fill="#1F1D3D"><circle cx="54" cy="52" r="4"/><circle cx="64" cy="48" r="4"/><circle cx="60" cy="60" r="4"/><circle cx="68" cy="62" r="4"/><circle cx="52" cy="66" r="4"/></g><path d="M60,10 q4,-8 12,-6" stroke="#2FB866" stroke-width="5" fill="none" stroke-linecap="round"/></svg>`,
  meia: `<svg viewBox="0 0 120 100"><path d="M42,8 L74,8 L74,58 L94,72 C104,80 98,96 84,94 L52,90 C42,88 38,80 42,70Z" fill="#E0569F" stroke="#1F1D3D" stroke-width="4" stroke-linejoin="round"/><rect x="40" y="8" width="36" height="14" rx="4" fill="#fff" stroke="#1F1D3D" stroke-width="4"/><path d="M44,34 L72,34 M44,46 L72,46" stroke="#FFC0DE" stroke-width="5"/></svg>`,
};
const ICON = {
  ear: c => `<svg viewBox="0 0 48 48"><path d="M14,20 C14,8 34,6 35,20 C36,30 26,30 26,38 C26,44 18,44 17,38" fill="none" stroke="${c}" stroke-width="4.5" stroke-linecap="round"/><path d="M21,21 C21,15 29,15 29,21" fill="none" stroke="${c}" stroke-width="4" stroke-linecap="round"/></svg>`,
  mouth: c => `<svg viewBox="0 0 48 48"><path d="M8,24 Q24,12 40,24 Q24,38 8,24Z" fill="none" stroke="${c}" stroke-width="4.5" stroke-linejoin="round"/><path d="M9,24 L39,24" stroke="${c}" stroke-width="4"/></svg>`,
  letter: c => `<svg viewBox="0 0 48 48"><text x="24" y="36" text-anchor="middle" font-family="Andika" font-weight="700" font-size="34" fill="${c}">M</text></svg>`,
  words: c => `<svg viewBox="0 0 48 48"><rect x="6" y="10" width="36" height="28" rx="6" fill="none" stroke="${c}" stroke-width="4.5"/><path d="M14,20 h20 M14,28 h12" stroke="${c}" stroke-width="4" stroke-linecap="round"/></svg>`,
  you: c => `<svg viewBox="0 0 48 48"><rect x="17" y="6" width="14" height="24" rx="7" fill="none" stroke="${c}" stroke-width="4.5"/><path d="M10,24 Q10,36 24,36 Q38,36 38,24 M24,36 L24,43" fill="none" stroke="${c}" stroke-width="4.5" stroke-linecap="round"/></svg>`,
  book: c => `<svg viewBox="0 0 48 48"><path d="M6,10 Q16,6 24,12 Q32,6 42,10 L42,38 Q32,34 24,40 Q16,34 6,38Z" fill="none" stroke="${c}" stroke-width="4.5" stroke-linejoin="round"/><path d="M24,12 L24,40" stroke="${c}" stroke-width="4"/></svg>`,
  clock: c => `<svg viewBox="0 0 48 48"><circle cx="24" cy="26" r="17" fill="none" stroke="${c}" stroke-width="4.5"/><path d="M24,16 L24,26 L31,30 M18,5 L30,5" stroke="${c}" stroke-width="4.5" stroke-linecap="round" fill="none"/></svg>`,
  lock: c => `<svg viewBox="0 0 48 48"><rect x="9" y="21" width="30" height="22" rx="5" fill="none" stroke="${c}" stroke-width="4.5"/><path d="M15,21 L15,15 Q15,6 24,6 Q33,6 33,15 L33,21" fill="none" stroke="${c}" stroke-width="4.5"/><circle cx="24" cy="32" r="3.5" fill="${c}"/></svg>`,
  phone: c => `<svg viewBox="0 0 48 48"><rect x="13" y="4" width="22" height="40" rx="5" fill="none" stroke="${c}" stroke-width="4.5"/><path d="M21,37 h6" stroke="${c}" stroke-width="4" stroke-linecap="round"/></svg>`,
  chat: c => `<svg viewBox="0 0 48 48"><path d="M24,6 C36,6 43,14 43,23 C43,32 36,40 24,40 C21,40 18,39 16,38 L7,42 L10,34 C7,31 5,27 5,23 C5,14 12,6 24,6Z" fill="none" stroke="${c}" stroke-width="4.5" stroke-linejoin="round"/><path d="M16,23 h16" stroke="${c}" stroke-width="4" stroke-linecap="round"/></svg>`,
  play: c => `<svg viewBox="0 0 48 48"><path d="M16,10 L38,24 L16,38Z" fill="${c}"/></svg>`,
};
