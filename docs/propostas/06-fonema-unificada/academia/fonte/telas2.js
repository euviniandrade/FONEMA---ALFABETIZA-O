// FONEMA · Academia FONEMA — telas de FAMÍLIAS e PROFESSORES
const U = require('./ui');
const { C, page, logo, ic, sofiaSvg, sofiaBust, bolotaSvg, defs } = U;

const wave = (n, w, h, col, played = 0, seed = 3) => {
  let s = '', a = seed;
  const r = () => { a = (a * 9301 + 49297) % 233280; return a / 233280; };
  for (let i = 0; i < n; i++) { const hh = 4 + r() * (h - 4); s += `<rect x="${(i * w / n).toFixed(1)}" y="${((h - hh) / 2).toFixed(1)}" width="${(w / n * 0.55).toFixed(1)}" height="${hh.toFixed(1)}" rx="1.5" fill="${i / n < played ? col : '#CFC6B6'}"/>`; }
  return `<svg width="${w}" height="${h}">${s}</svg>`;
};

module.exports = (T) => {
// =====================================================================================
// 3. FAMÍLIAS — microcursos de 5 min (áudio, vídeo, WhatsApp) + versão simples
// =====================================================================================
T['academia-familias'] = () => {
  const courses = [
    ['house', C.green, 'Como ajudar em casa', '5 passos de 1 min', 'Você não precisa ser professor', 5, 5],
    ['book', C.coral, 'Ler junto: perguntar e esperar', 'leitura dialógica', 'Pergunte, espere, repita a resposta', 5, 3],
    ['moon', C.purple, 'Rotina e sono', 'praticar no fim da tarde', 'Dormir ajuda a guardar o que aprendeu', 4, 0],
    ['screen', C.blue, 'Telas saudáveis', 'tela junto, tela com limite', 'Ver junto e conversar vale mais', 5, 1],
    ['coin', '#B4561A', 'Dinheiro e escolhas', 'educação financeira', 'Esperar, escolher, conversar sobre gastos', 5, 0],
    ['thermo', C.mango, 'Como ler o termômetro', 'nível de 0 a 10', 'Não é nota: é o caminho', 3, 3],
  ];
  const ccard = ([icn, col, t, sub, line, n, done], i) => `<div class="card" style="padding:14px 16px;border-radius:20px;height:168px;position:relative">
      <div class="row" style="gap:12px"><div style="width:46px;height:46px;border-radius:14px;background:${col};display:flex;align-items:center;justify-content:center;flex:none">${ic(icn, 24, '#fff')}</div>
        <div style="min-width:0"><div style="font-weight:700;font-size:16.5px;line-height:1.15">${t}</div><div style="font-size:12.5px;color:${C.slate};margin-top:2px">${sub}</div></div></div>
      <div style="font-size:13px;margin-top:10px;line-height:1.35;color:${C.ink}">“${line}”</div>
      <div class="row" style="gap:6px;position:absolute;left:16px;bottom:14px;right:16px">
        <span class="pill" style="background:${C.greenL};color:${C.green};padding:4px 9px;font-size:12px">${ic('ear', 13, C.green)}áudio</span>
        <span class="pill" style="background:#F1ECE2;color:${C.ink};padding:4px 8px;font-size:12px">${ic('play', 11, C.ink)}</span>
        <span class="pill" style="background:#E2F4EA;color:${C.wa};padding:4px 8px;font-size:12px">${ic('wa', 13, C.wa)}</span>
        <div style="flex:1"></div>
        <div class="row" style="gap:3px">${[...Array(n)].map((_, k) => `<i style="display:block;width:8px;height:8px;border-radius:50%;background:${k < done ? col : '#E6DECF'}"></i>`).join('')}</div>
        <span style="font-size:12px;font-weight:700;color:${C.slate};margin-left:4px;white-space:nowrap">5 min</span>
      </div></div>`;

  const msg = (html, me, t) => `<div style="align-self:${me ? 'flex-end' : 'flex-start'};max-width:92%;background:${me ? '#D9FDD3' : '#fff'};border-radius:12px;${me ? 'border-top-right-radius:2px' : 'border-top-left-radius:2px'};padding:7px 9px 5px;box-shadow:0 1px 1px rgba(0,0,0,.12);font-size:12.5px;line-height:1.35">${html}<div style="text-align:right;font-size:10px;color:#667781;margin-top:2px">${t}${me ? ' ✓✓' : ''}</div></div>`;
  const audio = (dur, col, played, av) => `<div class="row" style="gap:8px;width:220px">${av}<div style="width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center">${ic('play', 18, '#54656F')}</div><div>${wave(28, 120, 22, col, played)}<div style="font-size:10.5px;color:#667781">${dur}</div></div></div>`;

  const simple = (icn, col, t) => `<div style="display:flex;flex-direction:column;align-items:center;gap:6px;width:78px"><div style="width:62px;height:62px;border-radius:50%;background:${col};display:flex;align-items:center;justify-content:center;position:relative">${ic(icn, 30, '#fff')}<div class="abs" style="right:-4px;bottom:-4px;width:26px;height:26px;border-radius:50%;background:#fff;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,.2)">${ic('speaker', 14, C.ink)}</div></div><div style="font-size:12px;font-weight:700;text-align:center;line-height:1.2">${t}</div></div>`;

  const body = `
  <div class="top" style="background:linear-gradient(180deg,#E9F5EE,#FFF8EC)">${logo('Academia · Famílias', 40)}
    <div style="flex:1"></div>
    <div class="row" style="gap:10px;background:#fff;border-radius:999px;padding:7px 8px 7px 14px;border:1px solid rgba(43,42,76,.1);font-size:13.5px;font-weight:700">Versão simples: ouvir e ver figuras
      <span style="width:46px;height:26px;border-radius:13px;background:${C.green};position:relative;display:inline-block"><i style="position:absolute;right:3px;top:3px;width:20px;height:20px;border-radius:50%;background:#fff"></i></span></div>
    <div class="row" style="gap:8px;background:#fff;border-radius:999px;padding:7px 14px;border:1px solid rgba(43,42,76,.1);font-size:13.5px;font-weight:700">${ic('people', 16, C.ink)} Pedro · 1º ano B · Profa. Ana</div>
    <div class="listen" style="background:${C.green};border:none">${ic('speaker', 20, '#fff')}</div>
  </div>

  <div class="abs card" style="left:24px;top:82px;width:834px;height:222px;border-radius:24px;overflow:hidden;background:linear-gradient(115deg,#FFF6DE 0%,#FFFDF6 62%)">
    <div class="abs" style="left:650px;top:6px">${sofiaSvg({ expr: 'falando', armL: { t: [-170, 470], hand: 'open', bend: 'in' } }, 160, 236)}</div>
    <div class="abs" style="left:24px;top:20px;width:620px">
      <div class="row" style="gap:8px"><span class="pill" style="background:${C.mango};color:#fff">${ic('star', 14, '#fff')} MISSÃO DA SEMANA · 5 MIN</span><span class="pill" style="background:#fff;color:${C.slate};border:1px solid rgba(43,42,76,.12)">ligada ao som que o Pedro está aprendendo</span></div>
      <div style="font-size:24px;font-weight:700;line-height:1.22;margin-top:12px">No banho, achem 3 coisas que começam com <span class="an" style="color:${C.blue};text-decoration:underline;text-underline-offset:4px">vvv</span>.</div>
      <div style="font-size:14px;color:${C.slate};margin-top:6px">Exemplo: vela, vaso, vestido. Fale o som comprido, sem “vê”: <b style="color:${C.ink}">vvvela</b>.</div>
      <div class="row" style="gap:12px;margin-top:16px">
        <div class="row" style="gap:10px;background:#fff;border-radius:16px;padding:8px 14px 8px 8px;border:1px solid rgba(43,42,76,.12)"><div style="width:38px;height:38px;border-radius:50%;background:${C.green};display:flex;align-items:center;justify-content:center">${ic('play', 18, '#fff')}</div>${wave(34, 150, 26, C.green, .35)}<span style="font-size:12.5px;font-weight:700;color:${C.slate}">1:02</span></div>
        <span class="pill" style="background:${C.ink};color:#fff;padding:11px 16px;font-size:14px">${ic('play', 14, '#fff')} Ver vídeo · 0:58</span>
        <span class="pill" style="background:#fff;color:${C.green};padding:10px 14px;font-size:14px;border:2px solid ${C.green}">${ic('mic', 16, C.green)} Ouça o Pedro ler</span>
      </div>
    </div>
  </div>

  <div class="abs" style="left:24px;top:322px;width:834px">
    <div class="row" style="justify-content:space-between;margin-bottom:10px"><div class="row" style="gap:10px"><div class="fr" style="font-weight:700;font-size:22px">Microcursos de 5 minutos</div><span style="font-size:13px;color:${C.slate};font-weight:700">ouça no ônibus, assista quando der · 1 ideia por dia</span></div>
      <span class="pill" style="background:#fff;border:1px solid rgba(43,42,76,.12);color:${C.slate}">${ic('down', 14, C.slate)} baixar tudo no Wi-Fi · 4 MB</span></div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:14px">${courses.map(ccard).join('')}</div>
  </div>

  <div class="abs" style="left:878px;top:82px;width:378px;height:516px;border-radius:34px;background:#1B1B1F;padding:10px;box-shadow:0 24px 40px -22px rgba(0,0,0,.6)">
    <div style="width:100%;height:100%;border-radius:26px;overflow:hidden;background:#EFE7DD;position:relative">
      <div class="row" style="height:56px;background:#075E54;color:#fff;padding:0 14px;gap:10px">
        <div style="width:36px;height:36px;border-radius:50%;background:#fff;display:flex;align-items:center;justify-content:center">${U.logoMark(30)}</div>
        <div><div style="font-weight:700;font-size:14px">Academia FONEMA · Escola Mun. Ipê</div><div style="font-size:11px;opacity:.85">conta comercial oficial · 3 mensagens por semana</div></div></div>
      <div style="display:flex;flex-direction:column;gap:8px;padding:12px 12px">
        <div style="align-self:center;background:#FFF5C4;border-radius:8px;padding:4px 10px;font-size:11px;color:#54656F">Você aceitou receber mensagens · responda SAIR para parar</div>
        ${msg(`<b style="color:${C.green}">Segunda · o fato</b><br>O Pedro está aprendendo o som <b>vvv</b>, da letra V.`, false, '08:02')}
        ${msg(`<b style="color:${C.green}">Quarta · a missão</b>${audio('1:02 · voz da Profa. Ana', '#34B7F1', .4, `<div style="width:34px;height:34px;border-radius:50%;background:${C.navy};display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:13px">AL</div>`)}<div style="margin-top:4px">Toque <b>1</b> para ouvir de novo · <b>2</b> para o vídeo</div>`, false, '19:30')}
        ${msg(`${audio('0:14 · Pedro lendo “vaca”', '#25D366', 1, `<div style="width:34px;height:34px;border-radius:50%;background:#F2D0A4;display:flex;align-items:center;justify-content:center">${ic('mic', 16, '#7A4A2E')}</div>`)}`, true, '20:11')}
        ${msg(`<b style="color:${C.green}">Sexta · o reforço</b><br>Que bom ouvir o Pedro! Ele já lê 3 palavras com V. ${ic('heart', 12, C.coral)}`, false, '18:00')}
      </div>
      <div class="abs row" style="left:8px;right:8px;bottom:8px;gap:8px"><div style="flex:1;height:40px;border-radius:20px;background:#fff;display:flex;align-items:center;padding:0 14px;font-size:12.5px;color:#8696A0">Mensagem</div><div style="width:40px;height:40px;border-radius:50%;background:#00A884;display:flex;align-items:center;justify-content:center">${ic('mic', 20, '#fff')}</div></div>
    </div>
  </div>

  <div class="abs card" style="left:878px;top:614px;width:378px;height:168px;border-radius:20px;padding:12px 14px">
    <div class="row" style="justify-content:space-between"><div style="font-weight:700;font-size:15px">Versão simples (sem precisar ler)</div><span class="pill" style="background:${C.greenL};color:${C.green};font-size:11px;padding:3px 8px">tudo com voz</span></div>
    <div class="row" style="gap:12px;margin-top:10px;justify-content:space-between">${simple('star', C.mango, 'missão da semana')}${simple('book', C.coral, 'ler junto')}${simple('moon', C.purple, 'sono')}${simple('thermo', C.green, 'como o Pedro está')}</div>
  </div>
  <div class="abs row" style="left:24px;top:716px;width:834px;height:66px;border-radius:18px;background:#F3EEFC;padding:0 18px;gap:14px">
    ${ic('flask', 26, C.purple)}
    <div style="font-size:13.5px;line-height:1.4"><b>A ciência por trás, sem exagero:</b> repetir em dias diferentes e dormir bem ajudam a guardar o que a criança aprendeu acordada. Ninguém aprende dormindo, e não existe “treino de cérebro”.</div>
    <span class="pill" style="background:#fff;color:${C.purple};flex:none">${ic('doc', 14, C.purple)} fontes</span>
  </div>`;
  return page(body);
};

// =====================================================================================
// 4. PROFESSORES — trilha de formação com módulos, progresso e certificado
// =====================================================================================
const MODS = [
  ['flask', 'Ciência da leitura e o cérebro que lê', 'o que a pesquisa diz · neuromitos fora', 5, 1, C.purple],
  ['ear', 'Consciência fonológica', 'rima, sílaba, fonema · sem vogal extra', 5, 1, C.mango],
  ['target', 'Ensino explícito', 'eu faço, nós fazemos, você faz', 5, .6, C.coral],
  ['book', 'Linguagem oral e vocabulário', 'leitura dialógica · reconto', 4, 0, C.green],
  ['thermo', 'Avaliação formativa', 'termômetro, ditado, fluência', 5, 0, '#0E7C86'],
  ['screen', 'Painel da turma em 3 perguntas', 'quem precisa de mim hoje?', 3, 0, C.blue],
  ['people', 'Modo sala e estações', 'poucos tablets, turma inteira', 3, 0, C.navy],
  ['hands', 'Inclusão: TEA, TDAH, dislexia', 'adaptar sem rotular · Libras', 6, 0, '#B4561A'],
  ['medal', 'Projeto de prática em sala', '4 semanas com a sua turma', 4, 0, C.ipe],
];
T['academia-professores'] = () => {
  const done = MODS.reduce((a, m) => a + m[3] * m[4], 0); // 13 h
  const total = MODS.reduce((a, m) => a + m[3], 0); // 40 h
  const row = ([icn, t, sub, h, p, col], i) => {
    const st = p >= 1 ? 'done' : p > 0 ? 'now' : 'next';
    return `<div class="row" style="gap:14px;height:56px;position:relative">
      <div style="width:44px;height:44px;border-radius:50%;flex:none;display:flex;align-items:center;justify-content:center;background:${st === 'next' ? '#fff' : col};border:3px solid ${st === 'next' ? '#E2D8C6' : col};z-index:1;${st === 'now' ? `box-shadow:0 0 0 6px ${col}33;` : ''}">${st === 'done' ? ic('check', 22, '#fff', 3) : ic(icn, 20, st === 'now' ? '#fff' : '#B9AE9A')}</div>
      <div style="flex:1;min-width:0;${st === 'now' ? `background:#fff;border-radius:14px;padding:6px 12px;margin-left:-4px;box-shadow:0 8px 20px -12px rgba(43,42,76,.45);` : 'padding:6px 8px;'}">
        <div class="row" style="gap:8px"><span style="font-size:11.5px;font-weight:700;color:${C.slate}">M${i + 1}</span><span style="font-weight:700;font-size:15px;white-space:nowrap">${t}</span>${st === 'now' ? `<span class="pill" style="background:${col};color:#fff;font-size:11px;padding:2px 8px">continuar</span>` : ''}</div>
        <div class="row" style="gap:10px;font-size:12px;color:${C.slate}"><span style="white-space:nowrap">${sub}</span><div style="flex:1"></div>${st === 'now' ? `<div class="bar" style="width:90px"><i style="width:${p * 100}%;background:${col}"></i></div>` : ''}</div>
      </div>
      <div style="width:150px;font-size:12px;color:${C.slate};white-space:nowrap" class="row">${ic('play', 11, C.slate)}&nbsp;${[6, 8, 7, 7, 8, 5, 6, 9, 6][i]} vídeos · ${[2, 4, 4, 3, 3, 2, 3, 3, 3][i]} planos</div>
      <div style="width:44px;text-align:right;font-weight:700;font-size:14px;color:${st === 'next' ? C.slate : C.ink}">${h} h</div></div>`;
  };
  const ring = (pct, sz, col) => { const r = sz / 2 - 7, c = 2 * Math.PI * r; return `<svg width="${sz}" height="${sz}"><circle cx="${sz / 2}" cy="${sz / 2}" r="${r}" fill="none" stroke="#E6DECF" stroke-width="10"/><circle cx="${sz / 2}" cy="${sz / 2}" r="${r}" fill="none" stroke="${col}" stroke-width="10" stroke-linecap="round" stroke-dasharray="${c * pct} ${c}" transform="rotate(-90 ${sz / 2} ${sz / 2})"/></svg>`; };
  const req = (ok, t, d) => `<div class="row" style="gap:10px;align-items:flex-start;margin-top:8px"><div style="width:20px;height:20px;border-radius:6px;flex:none;margin-top:1px;background:${ok ? C.green : '#fff'};border:2px solid ${ok ? C.green : '#CFC6B6'};display:flex;align-items:center;justify-content:center">${ok ? ic('check', 14, '#fff', 3) : ''}</div><div style="font-size:13px;line-height:1.3"><b>${t}</b><br><span style="color:${C.slate}">${d}</span></div></div>`;

  const body = `
  <div class="top" style="background:linear-gradient(180deg,#E6EDFB,#FFF8EC)">${logo('Academia · Professores · formação continuada', 40)}
    <div style="flex:1"></div>
    <span class="pill" style="background:#fff;border:1px solid rgba(43,42,76,.12);color:${C.ink};padding:8px 14px">${ic('calendar', 15, C.ink)} Aula de hoje: som /v/ · 1º ano B</span>
    <span class="pill" style="background:#fff;border:1px solid rgba(43,42,76,.12);color:${C.ink};padding:8px 14px">${ic('people', 15, C.ink)} Comunidade · 3 novas</span>
    <div class="row" style="gap:8px;background:#fff;border-radius:999px;padding:5px 14px 5px 5px;border:1px solid rgba(43,42,76,.12)"><div style="width:30px;height:30px;border-radius:50%;background:${C.navy};color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:12px">AL</div><span style="font-weight:700;font-size:13.5px">Profa. Ana Lúcia</span></div>
  </div>

  <div class="abs card" style="left:24px;top:82px;width:792px;height:700px;border-radius:24px;padding:20px 24px">
    <div class="row" style="gap:18px">
      <div style="position:relative;width:96px;height:96px">${ring(done / total, 96, C.blue)}<div class="abs" style="left:0;top:26px;width:96px;text-align:center"><div class="fr" style="font-weight:700;font-size:24px;line-height:1">${done} h</div><div style="font-size:11px;color:${C.slate};font-weight:700">de ${total} h</div></div></div>
      <div style="flex:1">
        <div class="row" style="gap:8px"><span class="pill" style="background:${C.sky};color:${C.navy}">TRILHA 1 · ALFABETIZAÇÃO</span><span class="pill" style="background:#FFF1C2;color:#7A5200">${ic('shield', 13, '#7A5200')} certificação com parceiro: em validação</span></div>
        <div class="fr" style="font-weight:700;font-size:26px;margin-top:8px">Alfabetizar pelo som: da ciência à sala de aula</div>
        <div style="font-size:13.5px;color:${C.slate};margin-top:3px">9 módulos · 62 microvídeos de 2–3 min · 27 planos de aula · prática acompanhada na sua turma</div>
      </div>
    </div>
    <div style="position:relative;margin-top:16px">
      <div class="abs" style="left:21px;top:22px;width:3px;height:${56 * 8}px;background:repeating-linear-gradient(180deg,#E2D8C6 0 6px,transparent 6px 11px)"></div>
      <div class="abs" style="left:21px;top:22px;width:3px;height:${56 * 2.5}px;background:${C.blue}"></div>
      ${MODS.map(row).join('')}
    </div>
    <div class="row" style="gap:10px;margin-top:10px;padding:10px 14px;border-radius:14px;background:#F3EEFC;font-size:12.5px;line-height:1.4">${ic('flask', 20, C.purple)}<div><b>Neurociência sem neuromito:</b> cada módulo explica o “porquê” com os 4 pilares (atenção, engajamento ativo, retorno do erro, consolidação) e traz o quadro “mito ou fato?”. Nada de “estilos de aprendizagem” ou “cérebro direito”.</div></div>
  </div>

  <div class="abs card" style="left:836px;top:82px;width:420px;height:396px;border-radius:24px;padding:18px 20px">
    <div class="row" style="justify-content:space-between"><div class="fr" style="font-weight:700;font-size:19px">Seu certificado</div><span style="font-size:12px;font-weight:700;color:${C.slate}">liberado ao concluir 40 h</span></div>
    <div style="margin-top:10px;height:112px;border-radius:12px;background:#FFFDF7;border:2px solid #E9DFC8;position:relative;overflow:hidden">
      <div class="abs" style="left:6px;top:6px;right:6px;bottom:6px;border:1px solid #D8C79E;border-radius:8px"></div>
      <div class="abs" style="left:16px;top:14px">${U.logoMark(28)}</div>
      <div class="abs fr" style="left:52px;top:16px;font-weight:700;font-size:13px">Certificado de Formação Continuada</div>
      <div class="abs" style="left:52px;top:36px;font-size:11px;color:${C.slate}">Ana Lúcia Ferreira · 40 horas</div>
      <div class="abs" style="left:52px;top:56px;width:220px;height:5px;border-radius:3px;background:#EAE2D2"></div><div class="abs" style="left:52px;top:66px;width:180px;height:5px;border-radius:3px;background:#EAE2D2"></div>
      <div class="abs" style="right:18px;top:18px;width:64px;height:64px;border-radius:50%;background:${C.ipe};display:flex;align-items:center;justify-content:center;box-shadow:inset 0 0 0 5px rgba(255,255,255,.55)">${ic('medal', 30, '#7A5200')}</div>
      <div class="abs row" style="left:52px;bottom:12px;gap:6px;font-size:10px;color:${C.slate}">${ic('qr', 12, C.slate)} código de verificação público</div>
    </div>
    ${req(true, 'Microvídeos e leituras', '31 de 62 assistidos · tempo estimado, não tempo de tela')}
    ${req(true, 'Checagens de compreensão (≥ 70%)', '2 de 9 módulos · pode refazer quantas vezes quiser')}
    ${req(false, 'Prática na sua turma', '4 registros de aula (sem dados de alunos identificados)')}
    ${req(false, 'Encontro da comunidade de prática', '2 rodas on-line ou na escola, com formadora')}
    <div style="margin-top:10px;font-size:11.5px;color:#7A5200;background:#FFF6DE;border-radius:10px;padding:6px 10px;line-height:1.35">A rede decide se as horas contam para a carreira. Proposta: certificar com IES parceira (extensão) e termo com a Secretaria.</div>
  </div>

  <div class="abs card" style="left:836px;top:490px;width:420px;height:136px;padding-top:12px !important;border-radius:22px;padding:16px 18px;background:#EAF0FD">
    <div class="row" style="gap:8px"><span class="pill" style="background:${C.blue};color:#fff">${ic('doc', 13, '#fff')} PLANO DE AULA · HOJE</span><span style="font-size:12px;font-weight:700;color:${C.slate}">15 min · com e sem tela</span></div>
    <div style="font-weight:700;font-size:17px;margin-top:8px">Som /v/: eu faço, nós fazemos, você faz</div>
    <div style="font-size:12.5px;color:${C.slate};margin-top:3px">Microvídeo de 2:40 + roteiro + fichas da estação sem tela</div>
    <div class="row" style="gap:8px;margin-top:10px"><span class="pill" style="background:${C.ink};color:#fff;padding:7px 12px">${ic('play', 12, '#fff')} Ver 2:40</span><span class="pill" style="background:#fff;color:${C.ink};padding:7px 12px">${ic('down', 13, C.ink)} Fichas PDF</span><span class="pill" style="background:#fff;color:${C.ink};padding:7px 12px">${ic('screen', 13, C.ink)} Abrir modo sala</span></div>
  </div>

  <div class="abs card" style="left:836px;top:640px;width:420px;height:142px;border-radius:22px;padding:14px 18px">
    <div class="row" style="justify-content:space-between"><div class="row" style="gap:8px"><div style="font-weight:700;font-size:16px;white-space:nowrap">Comunidade de prática</div><span style="font-size:12px;color:${C.slate};font-weight:700;white-space:nowrap">rede municipal · 48 professoras</span></div>${ic('people', 20, C.navy)}</div>
    <div class="row" style="gap:10px;margin-top:8px;align-items:flex-start"><div style="width:30px;height:30px;border-radius:50%;background:${C.coral};color:#fff;font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center;flex:none">MR</div><div style="font-size:12.5px;line-height:1.35"><b>Profa. Márcia (2º ano A):</b> “Fiz o grupo de 4 do R/RR com as fichas e a turma leu em coro. Funcionou!”<div style="color:${C.slate};margin-top:3px">12 professoras acharam útil · 5 respostas</div></div></div>
    <div class="row" style="gap:6px;margin-top:6px;font-size:12px;font-weight:700;color:${C.navy}">${ic('calendar', 14, C.navy)} Próxima roda: qui., 19h · “ditado sem medo”</div>
  </div>`;
  return page(body);
};

// =====================================================================================
// 5. AULA — player de microvídeo com atividade ao lado
// =====================================================================================
T['academia-aula'] = () => {
  const { corte } = require('./corte');
  const chap = [['0:00', 'Por que o /v/ engana', 1], ['0:35', 'Modelar sem vogal extra', 1], ['1:20', 'Mão na garganta: f × v', 0], ['2:05', 'Eu faço, nós fazemos, você faz', 0]];
  const opt = (l, t, d, state) => `<div class="row" style="gap:12px;padding:11px 14px;border-radius:14px;border:2px solid ${state === 'ok' ? C.green : '#E2D8C6'};background:${state === 'ok' ? C.greenL : '#fff'};margin-top:8px">
      <div style="width:28px;height:28px;border-radius:50%;flex:none;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;background:${state === 'ok' ? C.green : '#F1ECE2'};color:${state === 'ok' ? '#fff' : C.ink}">${state === 'ok' ? ic('check', 16, '#fff', 3) : l}</div>
      <div style="font-size:13.5px;line-height:1.3"><b>${t}</b>${d ? `<br><span style="color:${C.slate};font-size:12.5px">${d}</span>` : ''}</div></div>`;
  const body = `
  <div class="top" style="background:linear-gradient(180deg,#E6EDFB,#FFF8EC)">${logo('Academia · Professores · Módulo 2 · Consciência fonológica', 40)}
    <div style="flex:1"></div>
    <div class="row" style="gap:10px;font-size:13px;font-weight:700;color:${C.slate}">aula 4 de 8 <div class="bar" style="width:140px"><i style="width:52%;background:${C.blue}"></i></div></div>
    <span class="pill" style="background:#fff;border:1px solid rgba(43,42,76,.12);color:${C.ink};padding:8px 14px">${ic('arrow', 15, C.ink)} Próxima aula</span>
  </div>

  <div class="abs" style="left:24px;top:82px;width:820px">
    <div style="width:820px;height:461px;border-radius:22px;overflow:hidden;position:relative;background:linear-gradient(135deg,#FFF6DE,#FDE8D7);box-shadow:0 18px 34px -20px rgba(43,42,76,.6)">
      <svg class="abs" style="left:0;top:0" width="820" height="461">${defs()}
        <circle cx="660" cy="520" r="300" fill="#fff" opacity=".45"/>
        <g transform="translate(44,74) scale(.84)"><rect x="-8" y="-8" width="316" height="336" rx="26" fill="#fff" opacity=".9"/>${corte('v')}</g>
        <text x="380" y="100" font-family="Fredoka" font-weight="600" font-size="20" fill="${C.slate}">Por dentro do /v/</text>
        <g font-family="Atkinson" font-size="17" fill="${C.ink}">
          <circle cx="388" cy="140" r="6" fill="${C.coral}"/><text x="404" y="146">dentes de cima no lábio de baixo</text>
          <circle cx="388" cy="174" r="6" fill="#2F6FE0"/><text x="404" y="180">o ar passa apertado pela boca</text>
          <circle cx="388" cy="208" r="6" fill="${C.ipe}"/><text x="404" y="214">a garganta vibra (no /f/, não)</text>
        </g>
        <rect x="380" y="236" width="236" height="56" rx="16" fill="#fff"/>
        <text x="398" y="274" font-family="Andika" font-weight="700" font-size="30" fill="${C.green}">vvvvv</text><text x="498" y="274" font-family="Atkinson" font-weight="700" font-size="18" fill="${C.green}">certo</text>
        <rect x="380" y="300" width="236" height="40" rx="14" fill="#fff" opacity=".75"/>
        <text x="398" y="327" font-family="Andika" font-weight="700" font-size="22" fill="${C.coral}" text-decoration="line-through">vê</text><text x="440" y="327" font-family="Atkinson" font-size="15" fill="${C.coral}">vogal extra: evite</text>
      </svg>
      <div class="abs" style="left:636px;top:84px">${sofiaSvg({ expr: { eyes: 'open', mouth: 'v7', b: [-4, 0, -4, 0], blush: .8 }, armR: { t: [120, 330], hand: 'open', bend: 'in', hrot: 120 } }, 190, 300)}</div>
      <div class="abs row" style="left:24px;top:20px;gap:8px"><span class="pill" style="background:${C.navy};color:#fff">MICROVÍDEO · 2:40</span><span class="pill" style="background:rgba(255,255,255,.85);color:${C.ink}">Como modelar o som /v/ sem vogal extra</span></div>
      <div class="abs" style="left:0;bottom:0;width:820px;height:58px;background:linear-gradient(180deg,transparent,rgba(20,20,40,.75))"></div>
      <div class="abs" style="left:170px;bottom:66px;width:480px;text-align:center"><span style="background:rgba(20,20,40,.82);color:#fff;font-size:17px;padding:6px 14px;border-radius:8px;line-height:1.6">Prolongue o som: “vvvaca”, nunca “vê-aca”.</span></div>
      <div class="abs row" style="left:18px;bottom:12px;right:18px;gap:14px;color:#fff">
        ${ic('pause', 22, '#fff')}
        <span style="font-size:13px;font-weight:700">1:04 / 2:40</span>
        <div style="flex:1;height:6px;border-radius:3px;background:rgba(255,255,255,.3);position:relative"><i style="position:absolute;left:0;top:0;height:6px;width:40%;border-radius:3px;background:${C.ipe}"></i>
          ${[0, 21.9, 50, 78.1].map(p => `<i style="position:absolute;left:${p}%;top:-3px;width:3px;height:12px;background:#fff;border-radius:2px"></i>`).join('')}
          <i style="position:absolute;left:40%;top:-5px;width:16px;height:16px;margin-left:-8px;border-radius:50%;background:#fff"></i></div>
        <span class="pill" style="background:rgba(255,255,255,.18);color:#fff;padding:3px 9px">1×</span>${ic('cc', 22, '#fff')}${ic('sign', 22, '#fff')}${ic('speaker', 22, '#fff')}
      </div>
    </div>
    <div class="row" style="gap:10px;margin-top:14px">${chap.map(([t, n, d], i) => `<div style="flex:1;padding:10px 12px;border-radius:14px;background:${i === 1 ? '#fff' : 'rgba(255,255,255,.55)'};border:2px solid ${i === 1 ? C.blue : 'transparent'}"><div class="row" style="gap:6px;font-size:12px;font-weight:700;color:${C.slate}">${d ? ic('check', 13, C.green, 3) : ''}${t}</div><div style="font-size:13.5px;font-weight:700;margin-top:2px;line-height:1.25">${n}</div></div>`).join('')}</div>
    <div class="row" style="gap:14px;margin-top:12px">
      <div class="card" style="flex:1;padding:12px 16px;border-radius:16px;font-size:13px;line-height:1.45"><b>Por que funciona.</b> Ver a boca enquanto ouve o som ajuda a criança a perceber o fonema (fala audiovisual). Retorno do erro na hora, sem castigo. <span style="color:${C.purple};font-weight:700">Pilares 1 e 3</span></div>
      <div class="card row" style="width:250px;padding:12px 14px;border-radius:16px;gap:10px">${ic('doc', 22, C.navy)}<div style="font-size:12.5px;line-height:1.35"><b>Transcrição e referências</b><br><span style="color:${C.slate}">revisado por fonoaudióloga</span></div></div>
    </div>
    <div class="row" style="gap:14px;margin-top:12px;padding:12px 16px;border-radius:16px;background:#F3EEFC">
      <span class="pill" style="background:${C.purple};color:#fff;flex:none">MITO OU FATO?</span>
      <div style="font-size:13px;line-height:1.4">“Cada criança aprende por um estilo: visual, auditivo ou cinestésico.” <b style="color:${C.coral}">Mito.</b> Todas se beneficiam de ouvir o som, ver a boca e traçar a letra.</div>
    </div>
  </div>

  <div class="abs card" style="left:864px;top:82px;width:392px;height:700px;border-radius:24px;padding:20px 22px">
    <div class="row" style="gap:8px"><span class="pill" style="background:${C.green};color:#fff">${ic('target', 14, '#fff')} PRATIQUE AGORA</span><span style="font-size:12px;font-weight:700;color:${C.slate}">1 de 3 · sem nota</span></div>
    <div style="font-weight:700;font-size:18px;margin-top:12px;line-height:1.3">Você vai apresentar o /v/ à turma. Qual modelo está certo?</div>
    ${opt('A', '“Este é o vê, de vaca.”', 'nome da letra, não o som', '')}
    ${opt('B', '“vvvvv… vvvaca!”', 'som prolongado, sem vogal', 'ok')}
    ${opt('C', '“vá, vé, vi, vó, vu”', 'sílabas: vêm depois', '')}
    <div style="margin-top:10px;padding:10px 12px;border-radius:12px;background:${C.greenL};font-size:13px;line-height:1.4;color:#1C5A37"><b>Isso!</b> O som contínuo deixa o fonema audível. Depois, peça “mão na garganta” para sentir a vibração.</div>
    <div style="height:1px;background:#EEE6D6;margin:16px 0 14px"></div>
    <div style="font-weight:700;font-size:15px">Leve para a sala</div>
    <div class="row" style="gap:10px;margin-top:10px;padding:10px 12px;border-radius:14px;background:#F7F3EA">${ic('doc', 20, C.navy)}<div style="flex:1;font-size:13px"><b>Roteiro de 15 min</b><br><span style="color:${C.slate}">eu faço · nós fazemos · você faz</span></div>${ic('down', 18, C.navy)}</div>
    <div class="row" style="gap:10px;margin-top:8px;padding:10px 12px;border-radius:14px;background:#F7F3EA">${ic('screen', 20, C.navy)}<div style="flex:1;font-size:13px"><b>Vídeo da Sofia no modo sala</b><br><span style="color:${C.slate}">projetar 0:38 · pausa vira leitura em coro</span></div>${ic('arrow', 18, C.navy)}</div>
    <div style="margin-top:14px;padding:12px 14px;border-radius:14px;border:2px dashed #C9D6F3;background:#F5F8FF">
      <div class="row" style="gap:8px;font-weight:700;font-size:13.5px;color:${C.navy}">${ic('calendar', 16, C.navy)} Registrar a prática (vale para o certificado)</div>
      <div style="font-size:12.5px;color:${C.slate};margin-top:4px;line-height:1.4">Depois da aula, conte em 3 linhas o que funcionou. Sem nome de aluno.</div>
    </div>
  </div>`;
  return page(body);
};

// =====================================================================================
// 6. CERTIFICADO
// =====================================================================================
T['academia-certificado'] = () => {
  // padrão tipo QR determinístico (ilustrativo, NÃO é um QR válido)
  let qr = '', a = 7; const r = () => { a = (a * 1103515245 + 12345) % 2147483648; return a / 2147483648; };
  const N = 25, cs = 3.6;
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const inF = (x < 7 && y < 7) || (x > N - 8 && y < 7) || (x < 7 && y > N - 8);
    if (inF) continue;
    if (r() > .52) qr += `<rect x="${x * cs}" y="${y * cs}" width="${cs}" height="${cs}"/>`;
  }
  const finder = (x, y) => `<rect x="${x * cs}" y="${y * cs}" width="${7 * cs}" height="${7 * cs}" fill="none" stroke="${C.ink}" stroke-width="${cs}" transform="translate(${cs / 2},${cs / 2}) scale(${6 / 7})"/><rect x="${(x + 2) * cs}" y="${(y + 2) * cs}" width="${3 * cs}" height="${3 * cs}"/>`;
  const qrSvg = `<svg width="${N * cs}" height="${N * cs}" fill="${C.ink}">${qr}${finder(0, 0)}${finder(N - 7, 0)}${finder(0, N - 7)}</svg>`;
  const MODS2 = MODS.map(m => [m[1], m[3]]);
  const border = `<svg class="abs" style="left:0;top:0" width="1040" height="700"><defs><pattern id="gui" width="28" height="28" patternUnits="userSpaceOnUse"><path d="M0,14 Q7,4 14,14 T28,14" fill="none" stroke="#E2C77A" stroke-width="1.4"/></pattern></defs>
    <rect x="10" y="10" width="1020" height="680" rx="14" fill="none" stroke="${C.navy}" stroke-width="3"/>
    <rect x="22" y="22" width="996" height="656" rx="8" fill="url(#gui)" opacity=".55"/>
    <rect x="40" y="40" width="960" height="620" rx="6" fill="#FFFDF7" stroke="#D8C79E" stroke-width="1.5"/></svg>`;
  const body = `
  <div class="abs" style="left:0;top:0;width:1280px;height:800px;background:radial-gradient(circle at 30% 20%,#2A4C8E,#132850 70%)"></div>
  <div class="abs row" style="left:40px;top:20px;gap:14px">${logo('Academia · Professores · certificado', 36, true)}</div>
  <div class="abs row" style="right:40px;top:26px;gap:10px">
    <span class="pill" style="background:rgba(255,255,255,.12);color:#fff;padding:8px 14px">${ic('down', 15, '#fff')} Baixar PDF</span>
    <span class="pill" style="background:rgba(255,255,255,.12);color:#fff;padding:8px 14px">${ic('wa', 15, '#fff')} Compartilhar</span>
    <span class="pill" style="background:${C.ipe};color:#3A2A00;padding:8px 14px">${ic('qr', 15, '#3A2A00')} Verificar autenticidade</span>
  </div>
  <div class="abs" style="left:120px;top:80px;width:1040px;height:700px;border-radius:16px;background:#FFFBF0;box-shadow:0 30px 60px -20px rgba(0,0,0,.6)">
    ${border}
    <div class="abs" style="left:430px;top:220px;font-family:Fredoka;font-weight:700;font-size:110px;color:rgba(194,65,12,.07);transform:rotate(-18deg);letter-spacing:8px">MODELO</div>
    <div class="abs row" style="left:80px;top:72px;gap:14px">${U.logoMark(64)}<div><div class="fr" style="font-weight:700;font-size:26px;line-height:1">Academia FONEMA</div><div style="font-size:12.5px;color:${C.slate};font-weight:700;margin-top:3px;letter-spacing:.5px">FONEMA · FORMAÇÃO DE PROFESSORES ALFABETIZADORES</div></div></div>
    <div class="abs" style="right:80px;top:70px;width:220px;height:66px;border:2px dashed #C9B78A;border-radius:10px;display:flex;align-items:center;justify-content:center;text-align:center;font-size:12px;color:#8A7444;font-weight:700;line-height:1.3">Logo da instituição parceira<br>(IES / Secretaria) — a definir</div>
    <div class="abs" style="left:80px;top:170px;width:880px;text-align:center">
      <div style="font-size:14px;letter-spacing:4px;font-weight:700;color:${C.slate}">CERTIFICADO DE FORMAÇÃO CONTINUADA</div>
      <div style="font-size:16px;margin-top:20px;color:${C.slate}">Certificamos que</div>
      <div class="fr" style="font-weight:600;font-size:40px;margin-top:4px;color:${C.navy}">Ana Lúcia Ferreira</div>
      <div style="width:520px;height:2px;background:#D8C79E;margin:8px auto 0"></div>
      <div style="font-size:16.5px;line-height:1.55;margin-top:14px;color:${C.ink}">concluiu a trilha <b>“Alfabetizar pelo som: da ciência à sala de aula”</b>, na modalidade a distância<br>com prática acompanhada em sala, de 03/08/2026 a 13/11/2026, com carga horária total de</div>
      <div class="row" style="justify-content:center;gap:14px;margin-top:10px"><div class="fr" style="font-weight:700;font-size:44px;color:${C.navy};line-height:1">40 horas</div><div style="text-align:left;font-size:12.5px;color:${C.slate};line-height:1.35">24 h de estudo a distância<br>12 h de prática em sala registrada<br>4 h de comunidade de prática</div></div>
    </div>
    <div class="abs" style="left:80px;top:448px;width:560px;font-size:11.5px;color:${C.slate};line-height:1.55;columns:2;column-gap:22px">
      ${MODS2.map(([t, h], i) => `<div class="row" style="justify-content:space-between;gap:8px"><span>M${i + 1} · ${t}</span><b style="color:${C.ink}">${h} h</b></div>`).join('')}
    </div>
    <div class="abs" style="left:690px;top:430px;width:100px;height:100px;border-radius:50%;background:radial-gradient(circle at 40% 35%,#FFD85A,${C.ipe} 60%,#D98E00);display:flex;align-items:center;justify-content:center;box-shadow:0 0 0 6px #FFF1C2,0 0 0 8px #E2C77A">
      <div style="text-align:center;color:#5A3D00;font-weight:700;font-size:11px;line-height:1.2">${ic('medal', 30, '#5A3D00')}<br>40 h</div></div>
    <div class="abs" style="left:820px;top:420px;width:150px;text-align:center"><div style="display:inline-block;padding:8px;background:#fff;border:1px solid #E2D8C6;border-radius:8px">${qrSvg}</div><div style="font-size:10.5px;color:${C.slate};margin-top:4px;line-height:1.3">Código: RS-2026-7Q4K-81F2<br>página pública de verificação</div></div>
    <div class="abs row" style="left:80px;top:574px;width:880px;gap:60px;justify-content:center">
      ${['Coordenação pedagógica · FONEMA', 'Instituição certificadora parceira (a definir)', 'Secretaria Municipal (se houver termo)'].map(t => `<div style="width:240px;text-align:center"><svg width="180" height="26"><path d="M10,18 C40,0 60,26 90,10 S150,4 170,16" fill="none" stroke="${C.navy}" stroke-width="1.6" opacity=".55"/></svg><div style="height:1.5px;background:${C.ink};opacity:.4"></div><div style="font-size:11.5px;color:${C.slate};margin-top:5px;line-height:1.3">${t}</div></div>`).join('')}
    </div>
    <div class="abs" style="left:80px;top:640px;width:880px;text-align:center;font-size:10.5px;color:#8A7444">Modelo ilustrativo de proposta. O reconhecimento das horas para progressão na carreira depende da instituição certificadora parceira e da rede de ensino.</div>
  </div>`;
  return page(body);
};
};
