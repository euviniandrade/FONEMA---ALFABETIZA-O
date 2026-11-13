// FONEMA · Roda da Sofia — as 6 telas (HTML/CSS/SVG próprios). Gere com: node capturar.js [nome...]
const U = require('./ui');
const { C, page, logo, ic, sofiaSvg, sofiaBust, bolotaSvg, thumb, S, B, defs } = U;
const T = {};

// =====================================================================================
// 1. INÍCIO — escolha de perfil com 3 portas
// =====================================================================================
T['academia-inicio'] = () => {
  const door = (o) => `
  <div class="abs" style="left:${o.x}px;top:150px;width:236px;height:492px">
    <div class="abs" style="left:0;top:0;width:236px;height:430px;border-radius:118px 118px 22px 22px;background:${o.frame};box-shadow:0 18px 30px -18px rgba(43,42,76,.5)"></div>
    <div class="abs" style="left:14px;top:14px;width:208px;height:404px;border-radius:104px 104px 14px 14px;background:linear-gradient(180deg,${o.c1},${o.c2});overflow:hidden">
      <svg class="abs" style="left:0;top:0" width="208" height="404" viewBox="0 0 208 404">
        
        <rect x="26" y="236" width="156" height="150" rx="10" fill="rgba(255,255,255,.12)" stroke="rgba(255,255,255,.28)" stroke-width="2"/>
        <circle cx="194" cy="312" r="7" fill="${o.knob}" stroke="rgba(0,0,0,.25)" stroke-width="2"/>
      </svg>
      <div class="abs" style="left:34px;top:30px;width:140px;height:140px;border-radius:50%;background:#fff;display:flex;align-items:center;justify-content:center;box-shadow:inset 0 0 0 6px ${o.ring}">${o.art}</div>
      <div class="abs an" style="left:0;top:186px;width:208px;text-align:center;color:#fff;font-weight:700;font-size:26px;letter-spacing:.5px;text-shadow:0 2px 0 rgba(0,0,0,.15)">${o.title}</div>
      <div class="abs" style="left:36px;top:250px;width:136px;text-align:center;color:#fff;font-size:15.5px;line-height:1.3;font-weight:700">${o.sub}</div>
      <div class="abs" style="left:0;top:340px;width:208px;display:flex;justify-content:center">${o.cta}</div>
    </div>
    <div class="abs" style="left:-8px;top:426px;width:252px;height:14px;border-radius:7px;background:#E7DCC8"></div>
    <div class="abs" style="left:0;top:450px;width:236px;display:flex;gap:6px;justify-content:center;flex-wrap:wrap">${o.tags}</div>
  </div>`;
  const tag = (t, col, bg, icn) => `<span class="pill" style="background:${bg};color:${col};font-size:12px;padding:4px 10px">${icn ? ic(icn, 13, col) : ''}${t}</span>`;
  const cta = (t, col) => `<span class="pill" style="background:#fff;color:${col};font-size:15px;padding:8px 16px;box-shadow:0 4px 0 rgba(0,0,0,.15)">${t} ${ic('arrow', 16, col, 2.6)}</span>`;
  const kidArt = `<svg width="132" height="132" viewBox="0 0 132 132">${defs()}
     <g transform="translate(66,120) scale(.36)">${B.bolota({ eyes: 'happy' })}</g>
     <g transform="translate(66,34)"><circle r="22" fill="${C.mango}"/><path d="M-7,-11 v22 l18,-11z" fill="#fff"/></g></svg>`;
  const famArt = `<svg width="120" height="120" viewBox="0 0 120 120">
     <path d="M18,58 L60,24 L102,58 V100 H18Z" fill="${C.greenL}" stroke="${C.green}" stroke-width="5" stroke-linejoin="round"/>
     <path d="M38,70 c6,-4 14,-4 22,0 v22 c-8,-4 -16,-4 -22,0z M82,70 c-6,-4 -14,-4 -22,0 v22 c8,-4 16,-4 22,0z" fill="#fff" stroke="${C.green}" stroke-width="4" stroke-linejoin="round"/>
     <path d="M60,58 c-5,-9 -17,-5 -14,3 c2,5 14,10 14,10 s12,-5 14,-10 c3,-8 -9,-12 -14,-3z" fill="${C.coral}"/></svg>`;
  const profArt = `<svg width="120" height="120" viewBox="0 0 120 120">
     <rect x="20" y="58" width="80" height="44" rx="8" fill="${C.sky}" stroke="${C.navy}" stroke-width="5"/>
     <path d="M30,72 h34 M30,84 h24" stroke="${C.navy}" stroke-width="5" stroke-linecap="round"/>
     <path d="M78,86 l6,6 l12,-14" stroke="${C.green}" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
     <path d="M14,40 L60,18 L106,40 L60,62Z" fill="${C.navy}"/><path d="M36,46 v10 c14,10 34,10 48,0 v-10" fill="none" stroke="${C.navy}" stroke-width="5"/>
     <path d="M106,40 v18" stroke="${C.ipe}" stroke-width="5" stroke-linecap="round"/><circle cx="106" cy="60" r="5" fill="${C.ipe}"/></svg>`;

  const pilar = (n, t, d, col) => `<div class="row" style="gap:10px"><div class="fr" style="width:30px;height:30px;border-radius:50%;background:${col};color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:15px">${n}</div><div><div style="font-weight:700;font-size:14px">${t}</div><div style="font-size:12px;color:${C.slate};white-space:nowrap">${d}</div></div></div>`;

  const body = `
  <svg class="abs" style="left:0;top:0" width="1280" height="800"><defs><radialGradient id="glow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#FFE7B8"/><stop offset="1" stop-color="#FFF8EC" stop-opacity="0"/></radialGradient></defs>
    <circle cx="230" cy="420" r="330" fill="url(#glow)"/>
    <path d="M0,700 C260,660 520,690 760,672 C980,656 1140,676 1280,664 V800 H0Z" fill="#F6EBD6"/>
    ${[...Array(18)].map((_, i) => `<circle cx="${60 + i * 72}" cy="${716 + (i % 2) * 10}" r="3" fill="#E7D7BA"/>`).join('')}
  </svg>
  <div class="top">${logo('do FONEMA · vídeos curtos e trilhas para aprender junto')}
    <div style="flex:1"></div>
    <span class="pill" style="background:#fff;border:1px solid rgba(43,42,76,.12);color:${C.slate}">${ic('house', 15, C.slate)}Escola Municipal Ipê</span>
    <span class="pill" style="background:#fff;border:1px solid rgba(43,42,76,.12);color:${C.ink}">${ic('cc', 16, C.ink)}Legenda</span>
    <span class="pill" style="background:#fff;border:1px solid rgba(43,42,76,.12);color:${C.ink}">${ic('sign', 16, C.ink)}Libras</span>
    <span class="pill" style="background:#fff;border:1px solid rgba(43,42,76,.12);color:${C.ink}">${ic('wifi', 16, C.ink)}Baixado para usar sem internet</span>
  </div>

  <div class="abs" style="left:58px;top:208px">${sofiaSvg({ expr: 'alegre', armR: { t: [236, 290], hand: 'open', bend: 'in' }, armL: { t: [-150, 560], hand: 'relax' } }, 330, 490)}</div>
  <div class="abs" style="left:262px;top:618px">${bolotaSvg({ eyes: 'happy', look: [-4, 0] }, 150, 100)}</div>
  <div class="abs card" style="left:40px;top:96px;width:380px;padding:18px 20px 18px 22px;border-radius:26px">
    <div class="row" style="gap:14px"><div class="listen" style="background:${C.mango};border:none">${ic('speaker', 22, '#fff')}</div>
    <div class="an" style="font-size:25px;line-height:1.2;font-weight:700">Oi! Quem vai entrar<br>na roda hoje?</div></div>
    <svg class="abs" style="left:250px;top:100%" width="40" height="26"><path d="M0,0 L40,0 L8,24Z" fill="#fff"/></svg>
  </div>

  <div class="abs" style="left:470px;top:84px;width:780px">
    <div class="fr" style="font-size:30px;font-weight:700">Escolha a sua porta</div>
    <div style="font-size:15px;color:${C.slate};margin-top:4px">Cada porta abre uma trilha diferente. A Sofia apresenta, e quem assiste sai para <b style="color:${C.ink}">praticar</b>.</div>
  </div>
  ${door({ x: 470, frame: '#B4561A', c1: '#F7A240', c2: '#E07812', knob: C.ipe, ring: '#FFE1B8', art: kidArt, title: 'CRIANÇAS', sub: 'Vídeos da Sofia e hora de praticar', cta: cta('Entrar', '#C2600C'), tags: tag('4 a 8 anos', '#9A4A08', '#FDE3C4') + tag('sem leitura', '#9A4A08', '#FDE3C4', 'speaker') })}
  ${door({ x: 732, frame: '#1C5A37', c1: '#3C9A66', c2: '#246F45', knob: '#F6E2CB', ring: '#D3EEDD', art: famArt, title: 'FAMÍLIAS', sub: 'Cursos de 5 min em áudio e vídeo', cta: cta('Entrar', C.green), tags: tag('áudio primeiro', '#1C5A37', '#D7EFE0', 'ear') + tag('WhatsApp', '#1C5A37', '#D7EFE0', 'wa') })}
  ${door({ x: 994, frame: '#132850', c1: '#3563C4', c2: '#1E3A6E', knob: C.ipe, ring: '#D6E1F7', art: profArt, title: 'PROFESSORES', sub: 'Formação continuada com certificado', cta: cta('Entrar', C.navy), tags: tag('2–3 min', '#132850', '#DCE5F8', 'clock') + tag('certificado', '#132850', '#DCE5F8', 'medal') })}
  <div class="abs row" style="left:732px;top:672px;gap:6px;color:${C.slate};font-size:12px;font-weight:700;width:498px;justify-content:center">${ic('gate', 14, C.slate)} As portas dos adultos abrem com a porteira (pergunta que só adulto responde)</div>

  <div class="abs card" style="left:40px;top:712px;width:1200px;height:68px;padding:0 24px;display:flex;align-items:center;gap:24px;border-radius:18px">
    <div style="width:150px"><div class="fr" style="font-weight:700;font-size:16px">Assistir pouco,<br>praticar muito</div></div>
    ${pilar(1, 'Atenção', 'um som por vídeo', C.mango)}
    ${pilar(2, 'Engajamento ativo', 'todo vídeo termina em prática', C.green)}
    ${pilar(3, 'Retorno do erro', 'dica na hora, sem castigo', C.blue)}
    ${pilar(4, 'Consolidação', 'revisar e dormir bem', C.purple)}
    <div style="flex:1"></div>
    <div style="font-size:12px;color:${C.slate};text-align:right;line-height:1.4;white-space:nowrap">sem anúncios · sem ranking<br>nada toca sozinho</div>
  </div>`;
  return page(body);
};

// =====================================================================================
// 2. CRIANÇAS — videoteca com convite à prática e selos "assisti e pratiquei"
// =====================================================================================
T['academia-criancas'] = () => {
  const sounds = [
    ['A a', '#FDE8D7', C.coral, 'done'], ['M m', '#E3ECFB', C.blue, 'done'], ['L l', '#E3ECFB', C.blue, 'done'], ['F f', '#E3ECFB', C.blue, 'done'],
    ['V v', '#FFF1C2', C.blue, 'now'], ['S s', '#E3ECFB', C.blue, 'watched'], ['N n', '#E3ECFB', C.blue, 'soon'], ['P p', '#E3ECFB', C.blue, 'soon'],
  ];
  const stamp = (st) => {
    if (st === 'done') return `<div class="row" style="gap:4px"><span class="pill" style="background:${C.greenL};color:${C.green};padding:3px 8px;font-size:12px">${ic('ear', 13, C.green)}${ic('check', 13, C.green, 3)}</span><span class="pill" style="background:${C.greenL};color:${C.green};padding:3px 8px;font-size:12px">${ic('mic', 13, C.green)}${ic('check', 13, C.green, 3)}</span></div>`;
    if (st === 'watched') return `<div class="row" style="gap:4px"><span class="pill" style="background:${C.greenL};color:${C.green};padding:3px 8px;font-size:12px">${ic('ear', 13, C.green)}${ic('check', 13, C.green, 3)}</span><span class="pill" style="background:#FFF1C2;color:#8A5A00;padding:3px 8px;font-size:12px">${ic('mic', 13, '#8A5A00')} falta praticar</span></div>`;
    if (st === 'now') return `<span class="pill" style="background:${C.mango};color:#fff;padding:3px 10px;font-size:12px">${ic('play', 12, '#fff')} agora</span>`;
    return `<span class="pill" style="background:#F1ECE2;color:${C.slate};padding:3px 10px;font-size:12px">em obras</span>`;
  };
  const card = ([l, bg, fg, st], i) => `<div class="card" style="width:172px;overflow:hidden;border-radius:18px;${st === 'now' ? `outline:4px solid ${C.mango};outline-offset:2px;` : ''}${st === 'soon' ? 'opacity:.62;' : ''}">
      <div style="position:relative">${thumb(l, bg, fg, { w: 172, h: 98, sofia: st !== 'soon', expr: ['alegre', 'falando', 'curiosa', 'alegre', 'falando', 'encorajadora', 'alegre', 'alegre'][i] })}
      ${st !== 'soon' ? `<div class="abs row" style="left:8px;top:8px;gap:3px;font-size:11px;font-weight:700;background:rgba(43,42,76,.78);color:#fff;border-radius:8px;padding:3px 7px">${ic('play', 10, '#fff')}0:3${4 + (i % 5)}</div>` : ''}</div>
      <div style="padding:8px 10px 10px"><div class="an" style="font-weight:700;font-size:16px;margin-bottom:6px">o som de <span style="color:${fg}">${l.split(' ')[1]}</span></div>${stamp(st)}</div></div>`;

  const cat = (icn, t, n, col, active) => `<div class="row" style="gap:12px;padding:12px 14px;border-radius:16px;${active ? `background:#fff;box-shadow:0 8px 20px -12px rgba(43,42,76,.4);` : ''}">
      <div style="width:44px;height:44px;border-radius:14px;background:${col};display:flex;align-items:center;justify-content:center">${ic(icn, 24, '#fff')}</div>
      <div><div class="an" style="font-weight:700;font-size:18px">${t}</div><div style="font-size:12.5px;color:${C.slate};font-weight:700">${n}</div></div></div>`;

  const seal = (l, col, on) => `<div style="width:62px;height:62px;border-radius:50%;background:${on ? col : '#F1ECE2'};display:flex;align-items:center;justify-content:center;position:relative;box-shadow:${on ? 'inset 0 0 0 4px rgba(255,255,255,.5)' : 'inset 0 0 0 2px #E2D8C6'}">
      <span class="an" style="font-weight:700;font-size:26px;color:${on ? '#fff' : '#C9BEA9'}">${l}</span>
      ${on ? `<div class="abs" style="right:-4px;bottom:-4px;width:24px;height:24px;border-radius:50%;background:#fff;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,.18)">${ic('mic', 14, C.green, 2.6)}</div>` : ''}</div>`;

  const body = `
  <div class="top" style="background:linear-gradient(180deg,#FFF1DC,#FFF8EC)">${logo('Roda das Crianças', 40)}
    <div style="flex:1"></div>
    <div class="row" style="gap:10px;background:#fff;border-radius:999px;padding:6px 14px 6px 8px;border:1px solid rgba(43,42,76,.1)">
      <svg width="34" height="34" viewBox="0 0 34 34"><circle cx="17" cy="17" r="15" fill="#F2D0A4"/><circle cx="17" cy="14" r="6" fill="#7A4A2E"/><path d="M7,29 q10,-10 20,0" fill="#2F5DA8"/></svg>
      <span class="an" style="font-weight:700;font-size:17px">Pedro</span></div>
    <div class="row" style="gap:8px;background:#fff;border-radius:999px;padding:8px 14px;border:1px solid rgba(43,42,76,.1);font-size:13px;font-weight:700;color:${C.slate}">${ic('clock', 16, C.slate)} hoje: 1 vídeo + 1 prática <span style="display:inline-block;width:70px" class="bar"><i style="width:55%;background:${C.green}"></i></span></div>
    <div class="listen" style="background:${C.mango};border:none">${ic('speaker', 20, '#fff')}</div>
  </div>

  <div class="abs" style="left:24px;top:84px;width:236px">
    ${cat('ear', 'Sons', '18 de 33', C.mango, true)}
    ${cat('book', 'Regrinhas', '2 de 20', C.blue)}
    ${cat('star', 'Histórias', 'Cerrado · 4', C.green)}
    ${cat('lamp', 'Como funciona', '5 de 8', C.purple)}
    <div class="card" style="margin-top:18px;padding:14px 16px;border-radius:18px;background:#FFFBF2">
      <div class="row" style="gap:8px;font-weight:700;font-size:13px;color:${C.slate}">${ic('gate', 15, C.slate)} Para o adulto</div>
      <div style="font-size:12.5px;line-height:1.45;margin-top:6px;color:${C.ink}">Selo só com <b>vídeo + prática</b>. Ficar mais tempo na tela não dá selo. Depois do vídeo, nada toca sozinho.</div>
    </div>
  </div>

  <div class="abs card" style="left:280px;top:84px;width:640px;height:268px;border-radius:26px;overflow:hidden;background:linear-gradient(120deg,#FFF6D8,#FFE9C2)">
    <svg class="abs" style="left:0;top:0" width="640" height="268">${defs()}
      <circle cx="560" cy="300" r="190" fill="#fff" opacity=".45"/>
      <text x="528" y="196" text-anchor="middle" font-family="Andika" font-weight="700" font-size="140" fill="${C.blue}" opacity=".95">V</text>
      <text x="600" y="196" text-anchor="middle" font-family="Andika" font-weight="700" font-size="96" fill="${C.blue}" opacity=".95">v</text>
      <rect x="478" y="208" width="146" height="8" rx="4" fill="${C.blue}"/>
    </svg>
    <div class="abs" style="left:286px;top:12px">${sofiaSvg({ expr: { eyes: 'open', mouth: 'v7', b: [-4, 0, -4, 0], blush: .8 }, armL: { t: [-210, 420], hand: 'point' } }, 170, 250)}</div>
    <div class="abs" style="left:28px;top:24px;width:290px">
      <span class="pill" style="background:${C.mango};color:#fff">${ic('star', 14, '#fff')} SOM NOVO DE HOJE</span>
      <div class="an" style="font-size:31px;font-weight:700;line-height:1.12;margin-top:12px">A Sofia apresenta o som <span style="color:${C.blue};text-decoration:underline;text-underline-offset:5px">vvv</span></div>
      <div class="row" style="gap:6px;margin-top:12px;color:${C.slate};font-size:12.5px;font-weight:700;white-space:nowrap">${ic('ear', 16, C.slate)} ouvir ${ic('arrow', 12, '#C9BEA9')} ${ic('mouth', 16, C.slate)} boca ${ic('arrow', 12, '#C9BEA9')} letra ${ic('arrow', 12, '#C9BEA9')} ${ic('mic', 16, C.slate)} sua vez</div>
      <div class="row" style="gap:10px;margin-top:20px">
        <span class="pill" style="background:${C.ink};color:#fff;font-size:17px;padding:12px 20px">${ic('play', 18, '#fff')} Ver · 0:38</span>
        <span class="pill" style="background:#fff;color:${C.ink};font-size:13px;padding:10px 14px;border:1px solid rgba(43,42,76,.15)">${ic('cc', 16, C.ink)} CC</span>
        <span class="pill" style="background:#fff;color:${C.ink};font-size:13px;padding:10px 14px;border:1px solid rgba(43,42,76,.15)">${ic('sign', 16, C.ink)} Libras</span>
      </div>
    </div>
  </div>

  <div class="abs card" style="left:940px;top:84px;width:316px;height:268px;border-radius:26px;padding:18px 20px">
    <div class="row" style="justify-content:space-between"><div class="fr" style="font-weight:700;font-size:20px">Meus selos</div><span class="pill" style="background:${C.greenL};color:${C.green}">${ic('ear', 13, C.green)}+${ic('mic', 13, C.green)} = selo</span></div>
    <div style="font-size:12.5px;color:${C.slate};margin:4px 0 12px">Assisti <b>e</b> pratiquei com a Sofia.</div>
    <div style="display:grid;grid-template-columns:repeat(4,62px);gap:12px 12px">
      ${seal('a', C.coral, 1)}${seal('m', C.blue, 1)}${seal('l', C.blue, 1)}${seal('f', C.blue, 1)}
      ${seal('s', C.blue, 0)}${seal('v', C.blue, 0)}${seal('n', C.blue, 0)}${seal('p', C.blue, 0)}
    </div>
    <div class="row" style="gap:8px;margin-top:14px;background:#FFF6DE;border-radius:12px;padding:8px 10px;font-size:12.5px;font-weight:700;color:#7A5200">${ic('mic', 15, '#7A5200')} O selo do <span class="an" style="font-size:15px">s</span> chega quando você praticar.</div>
  </div>

  <div class="abs" style="left:280px;top:372px;width:976px">
    <div class="row" style="justify-content:space-between;margin-bottom:12px"><div class="row" style="gap:10px"><div class="fr" style="font-weight:700;font-size:22px">Sofia apresenta o som</div><span style="font-size:13px;color:${C.slate};font-weight:700">30 a 45 segundos · sempre termina com “agora é sua vez”</span></div>
      <div class="row" style="gap:10px;font-size:12.5px;color:${C.slate};font-weight:700"><span class="row" style="gap:4px">${ic('ear', 14, C.green)} assisti</span><span class="row" style="gap:4px">${ic('mic', 14, C.green)} pratiquei</span></div></div>
    <div class="row" style="gap:14px;flex-wrap:wrap;width:976px">${sounds.slice(0, 5).map(card).join('')}</div>
  </div>

  <div class="abs" style="left:280px;top:596px;width:976px">
    <div class="row" style="gap:16px">
      <div class="card" style="flex:1;height:180px;border-radius:22px;padding:16px 18px;display:flex;gap:16px;background:#F3EEFC">
        <div style="width:140px;height:148px;border-radius:16px;background:#fff;display:flex;align-items:center;justify-content:center;flex:none">${bolotaSvg({ eyes: 'open', mouth: 'o', look: [3, -2] }, 136, 100)}</div>
        <div><span class="pill" style="background:${C.purple};color:#fff">${ic('lamp', 14, '#fff')} COMO FUNCIONA</span>
          <div class="an" style="font-weight:700;font-size:21px;margin-top:10px;line-height:1.2">E se eu errar?</div>
          <div style="font-size:13.5px;color:${C.slate};margin-top:6px;line-height:1.4">O Bolota erra, a Sofia dá uma dica, e ele tenta de novo. Errar faz parte de aprender.</div>
          <div class="row" style="gap:8px;margin-top:10px"><span class="pill" style="background:#fff;color:${C.ink}">${ic('play', 12, C.ink)} 0:52</span><span class="pill" style="background:#fff;color:${C.purple}">depois: brincar de errar e tentar</span></div></div>
      </div>
      <div class="card" style="flex:1;height:180px;border-radius:22px;padding:16px 18px;display:flex;gap:16px;background:#EAF4EE">
        <div style="width:140px;height:148px;border-radius:16px;background:#fff;display:flex;align-items:center;justify-content:center;flex:none;flex-direction:column;gap:6px">
          <svg width="116" height="70" viewBox="0 0 116 70"><rect x="2" y="2" width="112" height="66" rx="10" fill="#FFF1C2" stroke="${C.coral}" stroke-width="3"/><text x="58" y="47" text-anchor="middle" font-family="Andika" font-weight="700" font-size="34" fill="${C.ink}">ca<tspan fill="${C.coral}" text-decoration="underline">rr</tspan>o</text></svg>
          <svg width="116" height="40" viewBox="0 0 116 40"><text x="58" y="30" text-anchor="middle" font-family="Andika" font-weight="700" font-size="26" fill="${C.slate}">ca<tspan fill="${C.blue}">r</tspan>o</text></svg></div>
        <div><span class="pill" style="background:${C.green};color:#fff">${ic('book', 14, '#fff')} REGRINHA</span>
          <div class="an" style="font-weight:700;font-size:21px;margin-top:10px;line-height:1.2">R ou RR?</div>
          <div style="font-size:13.5px;color:${C.slate};margin-top:6px;line-height:1.4">Entre duas vogais, o som forte pede RR. Ouça: caro, carro.</div>
          <div class="row" style="gap:8px;margin-top:10px"><span class="pill" style="background:#fff;color:${C.ink}">${ic('play', 12, C.ink)} 0:55</span><span class="pill" style="background:#fff;color:${C.green}">depois: 6 palavras para ler</span></div></div>
      </div>
    </div>
  </div>
  <div class="abs" style="left:24px;top:640px">${sofiaSvg({ expr: 'encorajadora', armL: { t: [-140, 560], hand: 'relax' }, armR: { t: [150, 560], hand: 'relax' } }, 110, 160, '-260 40 520 960')}</div>
  <div class="abs card an" style="left:118px;top:660px;width:150px;padding:10px 12px;border-radius:16px;font-size:14px;font-weight:700;line-height:1.3">Vê o vídeo e depois faz o som comigo!</div>
  `;
  return page(body);
};

require('./telas2')(T);
module.exports = T;
