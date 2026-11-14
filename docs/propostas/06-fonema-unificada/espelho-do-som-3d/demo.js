/* FONEMA · Espelho do Som — demo com exercícios.
 * Vistas: De frente ("Boca gigante", espelho-frente.js) e De lado (perfil 3D com janelinha, espelho-lado.js).
 * Áudio: SEM speechSynthesis. O botão "Ouvir" toca só os mp3 das vozes oficiais (espelho-audio.js); se o som
 * ainda não tem gravação, não toca nada. As instruções dos exercícios aparecem escritas.
 * Parâmetros: ?f=<fonema>&m=frente|lado&quem=sofia|tales&aba=explorar|lingua|voz|imite|corpo&audioBase=<pasta>
 */
(function () {
  'use strict';
  const P = window.FonemasPT, F = P.F;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const q = new URLSearchParams(location.search);
  let atual = F[q.get('f')] ? q.get('f') : 'a', lento = false, aba = 'explorar', vista = 'frente', pers = q.get('quem') === 'tales' ? 'tales' : 'sofia';
  const fr = EspelhoFrente.criar($('#vFrente'), { fonema: atual });
  const rx = EspelhoLado.criar($('#vLado'), { fonema: atual, quem: pers });
  const audio = EspelhoAudio.criar({ audioBase: q.get('audioBase') || '../../../../app/web/public/audio/falas/' });
  const esp = { // fachada: as duas vistas mexem juntas
    fonema: (id, o) => { fr.fonema(id, o); rx.fonema(id, o); },
    lento: (v) => { fr.lento(v); rx.lento(v); },
    destacar: (z, ok) => { (vista === 'frente' ? fr : rx).destacar(z, ok); },
    rotulos: (v) => { rx.rotulos(v); },
    onToque: (cb) => { fr.onToque(cb); rx.onToque(cb); },
    pose: (a, b, f) => { fr.pose(a, b, f); rx.pose(a, b, f); }
  };
  const falar = () => Promise.resolve(); // as falas dos exercícios ficam escritas (áudio só gravado, nunca sintetizado)
  const espera = (ms) => new Promise((r) => setTimeout(r, ms * (lento ? 2.2 : 1)));

  /* ---------- rostos ilustrados de frente (poucas bocas prontas: escolhe a mais parecida) ---------- */
  const ROSTO = {
    sofia: { M: 'p b m', A: 'a a~ E k g rr', O: 'O o o~', S: 's z i i~ t d n nh lh', F: 'f v', L: 'l', CH: 'x j u u~', E: 'e e~ r' },
    tales: { M: 'p b m', O: 'x j', U: 'u u~ o o~ O', I: 'i i~ s z t d n l f v nh lh', E: 'e e~ E r', A: 'a a~ k g rr' }
  };
  const EXATO = { sofia: 'p b m a o s z f v l x j e', tales: 'p b m u i a' };
  const rostoDe = (p, id) => { for (const [k, ids] of Object.entries(ROSTO[p])) if (ids.split(' ').includes(id)) return k; return 'A'; };
  function poeRosto() {
    const f = F[atual];
    $('#sofiaLeg').innerHTML = `A Sofia e o Tales mostram <small>${f.dica.split(':')[0]}</small>`;
  }

  /* ---------- teclado de sons ---------- */
  $('#teclado').innerHTML = P.GRUPOS.map(([nome, ids]) => `<div class="grupo"><small>${nome}</small><div>${ids.map((id) =>
    `<button class="tecla" data-f="${id}" aria-label="Som ${F[id].letra}, como em ${F[id].ex}">${F[id].letra}<small>/${F[id].ipa}/</small></button>`).join('')}</div></div>`).join('');
  $('#teclado').addEventListener('click', (e) => { const b = e.target.closest('.tecla'); if (b) { selecionar(b.dataset.f); ouvir(); } });
  audio.pronto.then(() => { $$('.tecla').forEach((b) => b.classList.toggle('com-audio', audio.tem(b.dataset.f))); pintaOuvir(); });

  const AR = { oral: '💨 ar pela boca', nasal: '👃 ar pelo nariz', 'oral+nasal': '💨👃 boca e nariz', lateral: '↔️ ar pelos lados', nenhum: '—' };
  function selecionar(id, { instantaneo = false } = {}) {
    if (!F[id]) return;
    atual = id; const f = F[id];
    esp.fonema(id, { instantaneo });
    $$('.tecla').forEach((b) => b.classList.toggle('on', b.dataset.f === id));
    $('#cLetra').textContent = f.letra; $('#cIpa').textContent = `/${f.ipa}/`; $('#cEx').textContent = 'como em ' + f.ex;
    $('#cVoz').textContent = f.voz ? '🐝 tem voz (vibra)' : '🤫 sem voz (só ar)'; $('#cVoz').classList.toggle('sim', f.voz);
    $('#cAr').textContent = (f.modo === 'plosiva' ? '💥 ' : '') + AR[f.ar];
    poeRosto(); pintaOuvir();
    if (aba === 'explorar') painelExplorar();
  }
  // "Ouvir": só áudio gravado das vozes oficiais; sem gravação, não toca nada
  function ouvir() { return audio.tocar(atual, pers, { lento }); }
  function pintaOuvir() { const tem = audio.tem(atual), b = $('#bOuvir'); b.disabled = !tem; b.textContent = tem ? '🔊 Ouvir' : '🔇 Sem gravação'; b.title = tem ? 'Ouvir a voz oficial' : 'Este som ainda não tem gravação oficial'; }
  $('#bOuvir').addEventListener('click', ouvir);
  function trocaPers(p) { pers = p === 'tales' ? 'tales' : 'sofia'; rx.quem(pers); $$('#quem button').forEach((b) => b.classList.toggle('on', b.dataset.q === pers)); if (aba === 'imite') exImite(); }
  $$('#quem button').forEach((b) => b.addEventListener('click', () => trocaPers(b.dataset.q)));

  /* ---------- vistas ---------- */
  function modo(m) {
    vista = m === 'lado' ? 'lado' : 'frente';
    $('#vFrente').classList.toggle('on', vista === 'frente'); $('#vLado').classList.toggle('on', vista === 'lado');
    $('#quem').classList.toggle('on', vista === 'lado'); $('#bNomes').style.visibility = vista === 'lado' ? '' : 'hidden';
    $$('.modos [data-modo]').forEach((b) => b.classList.toggle('on', b.dataset.modo === vista));
  }
  $$('.modos [data-modo]').forEach((b) => b.addEventListener('click', () => modo(b.dataset.modo)));
  $('#bNomes').addEventListener('click', (e) => { const v = e.currentTarget.getAttribute('aria-pressed') !== 'true'; e.currentTarget.setAttribute('aria-pressed', v); esp.rotulos(v); });
  $('#bLento').addEventListener('click', (e) => { lento = !lento; e.currentTarget.setAttribute('aria-pressed', lento); esp.lento(lento); });

  /* ---------- abas ---------- */
  $$('.abas button').forEach((b) => b.addEventListener('click', () => abrirAba(b.dataset.aba)));
  function abrirAba(a) {
    aba = a; $$('.abas button').forEach((b) => b.classList.toggle('on', b.dataset.aba === a));
    toque = null; esp.rotulos($('#bNomes').getAttribute('aria-pressed') === 'true');
    ({ explorar: painelExplorar, lingua: exLingua, voz: exVoz, imite: exImite, corpo: exCorpo })[a]();
  }
  let toque = null; // função do exercício que recebe o toque no desenho
  esp.onToque((e) => { if (toque) toque(e); else if (aba === 'explorar' && PARTES[e.zona]) { esp.destacar(e.zona); falar(PARTES[e.zona][0] + '! ' + PARTES[e.zona][1]); } });

  // sequências de transição (ex.: m → a): a boca muda de um som para outro, como na fala
  async function sequencia(ids) { for (const id of ids) { selecionar(id); await espera(1300); } }
  function painelExplorar() {
    const f = F[atual], t = f.t;
    $('#painel').innerHTML = `<h3>Som ${f.letra} <span style="color:#B04A63">/${f.ipa}/</span></h3>
      <p class="dica">${f.dica}</p>
      <p><b>Veja a boca mudando:</b></p>
      <div class="seq"><button data-s="m,a">M → A</button><button data-s="l,a">L → A</button><button data-s="t,a">T → A</button><button data-s="r,a,r,a">A-R-A</button><button data-s="f,v,f,v">F × V</button><button data-s="a,e,i,o,u">A E I O U</button></div>
      <dl class="ficha"><dt>Lábios</dt><dd>${t.labios}</dd><dt>Língua</dt><dd>${t.lingua}</dd><dt>Encosta</dt><dd>${t.contato}</dd>
      <dt>Véu</dt><dd>${f.vel > 0.5 ? 'abaixado: o som vai para o nariz' : 'levantado: fecha o nariz'}</dd>
      <dt>Voz</dt><dd>${f.voz ? 'sim, a garganta vibra 🐝' : 'não, só sai ar 🤫'}</dd><dt>Ar</dt><dd>${AR[f.ar]}</dd></dl>`;
    $$('.seq button').forEach((b) => b.addEventListener('click', () => sequencia(b.dataset.s.split(','))));
  }

  /* ---------- 1. Onde está a língua? ---------- */
  const PERGUNTAS = ['t', 'd', 'n', 'l', 'k', 'g', 'nh', 'p', 'f', 's', 'rr'];
  let estrelas = 0, iP = 0;
  function exLingua() {
    modo('lado'); const id = PERGUNTAS[iP % PERGUNTAS.length]; const f = F[id];
    selecionar('e'); // começa com a boca "neutra" (o certo só aparece depois)
    const quem = f.zona === 'labios' ? 'os lábios se encostam' : f.zona === 'dentes' ? 'o lábio de baixo encosta' : f.zona === 'garganta' ? 'o som raspa' : 'a língua encosta';
    $('#painel').innerHTML = `<h3>Onde está a língua? <span class="estrelas">⭐ ${estrelas}</span></h3>
      <p>Para fazer o <b style="font-size:22px">${f.letra}</b> de <b>${f.ex}</b>, onde ${quem}?</p>
      <p><b>Toque no lugar certo na janelinha!</b></p>
      <div class="retorno" id="ret"></div>
      <button class="btn-grande" id="bProx">Próximo som →</button>`;
    falar(`Para fazer o som de ${f.ex}, onde ${quem}? Toque no lugar certo!`);
    let tent = 0;
    toque = (e) => {
      const ok = e.zona === f.zona || (f.zona === 'alveolo' && e.zona === 'dentes' && tent > 0);
      esp.destacar(e.zona, ok);
      if (ok) {
        estrelas++; selecionar(id); $('#ret').className = 'retorno ok';
        $('#ret').textContent = `Isso! ${f.t.contato}.`; $('.estrelas').textContent = `⭐ ${estrelas}`;
        falar(`Isso! ${f.t.contato}. Olha a boca fazendo ${f.fala.slice(0, 3)}!`); toque = null;
      } else {
        tent++; $('#ret').className = 'retorno';
        $('#ret').textContent = `Quase! Dica: ${f.dica}`;
        falar('Quase! ' + f.dica);
        if (tent >= 2) esp.destacar(f.zona, true);
      }
    };
    $('#bProx').addEventListener('click', () => { iP++; exLingua(); });
  }

  /* ---------- 2. Tem voz ou não tem? (mão na garganta) ---------- */
  const PARES = [['f', 'v'], ['s', 'z'], ['p', 'b'], ['t', 'd'], ['k', 'g'], ['x', 'j']];
  let iV = 0;
  function exVoz() {
    const par = PARES[iV % PARES.length], id = par[(iV >> 1) % 2 ? 0 : 1], f = F[id];
    modo('frente'); selecionar(id);
    $('#painel').innerHTML = `<h3>Tem voz ou não tem? <span class="estrelas">⭐ ${estrelas}</span></h3>
      <p>✋ Ponha a mão na garganta e fale junto com a Sofia: <b style="font-size:22px">${f.fala.slice(0, 4)}</b></p>
      <p>A garganta tremeu?</p>
      <div class="op"><button data-r="1">🐝 Tremeu!<br><small>tem voz</small></button><button data-r="0">🌬️ Não tremeu<br><small>só ar</small></button></div>
      <div class="retorno" id="ret"></div>
      <div class="seq"><button id="bOuvirV">🔊 Ouvir de novo</button><button id="bPar">${F[par[0]].letra} × ${F[par[1]].letra}</button><button id="bProx">Próximo →</button></div>`;
    falar(`Ponha a mão na garganta e fale junto: ${f.fala}`);
    $('#bOuvirV').addEventListener('click', ouvir); $('#bOuvirV').style.display = audio.tem(id) ? '' : 'none';
    $('#bPar').addEventListener('click', async () => { modo('lado'); for (const k of [par[0], par[1], par[0], par[1]]) { selecionar(k); await espera(1500); } });
    $$('.op button').forEach((b) => b.addEventListener('click', () => {
      const ok = (b.dataset.r === '1') === f.voz;
      b.classList.add(ok ? 'certo' : 'quase');
      modo('lado'); // mostra a garganta: ondinhas douradas se tem voz
      if (ok) estrelas++;
      const txt = f.voz ? `O ${f.letra} tem voz: a garganta vibra, olha as ondinhas!` : `O ${f.letra} não tem voz: só sai ar, a garganta fica quietinha.`;
      $('#ret').className = 'retorno' + (ok ? ' ok' : ''); $('#ret').textContent = (ok ? 'Isso! ' : 'Quase! ') + txt;
      falar((ok ? 'Isso! ' : 'Quase! ') + txt);
    }));
    $('#bProx').addEventListener('click', () => { iV++; exVoz(); });
  }

  /* ---------- 3. Imite a Sofia (espelho com câmera OPCIONAL, só local) ---------- */
  let fluxo = null, iI = 0;
  const IMITE = ['m', 'a', 'o', 's', 'f', 'l', 'x', 'e'];
  function paraCamera() { if (fluxo) { fluxo.getTracks().forEach((t) => t.stop()); fluxo = null; } }
  function exImite() {
    const id = IMITE[iI % IMITE.length]; modo('frente'); selecionar(id); const quadro = rostoDe(pers, id), nomeP = pers === 'sofia' ? 'Sofia' : 'Tales';
    $('#painel').innerHTML = `<h3>Imite ${pers === 'sofia' ? 'a Sofia' : 'o Tales'}!</h3><p>Faça a boca do <b style="font-size:22px">${F[id].letra}</b> como ${pers === 'sofia' ? 'a Sofia' : 'o Tales'}.</p>
      <div class="camera"><figure><div class="mold"><img src="recortes/boca-${pers}-${quadro}.jpg" alt="Boca de frente"></div>${nomeP}</figure>
      <figure><div class="mold" id="moldCam">${fluxo ? '' : '<span>seu espelho</span>'}</div>Você</figure></div>
      <button class="btn-grande" id="bCam">${fluxo ? '📷 Desligar meu espelho' : '📷 Ligar meu espelho (câmera)'}</button>
      <button class="btn-grande" id="bFiz">Fiz! →</button>
      <p class="privado">A câmera é opcional. A imagem aparece só aqui, neste aparelho: nada é gravado nem enviado.</p>
      <div class="retorno" id="ret"></div>`;
    falar(`Faça a boca do ${F[id].fala.slice(0, 3)} igual à Sofia!`);
    const poeVideo = () => { if (!fluxo) return; const v = document.createElement('video'); v.autoplay = true; v.muted = true; v.playsInline = true; v.srcObject = fluxo; $('#moldCam').innerHTML = ''; $('#moldCam').appendChild(v); };
    poeVideo();
    $('#bCam').addEventListener('click', async () => {
      if (fluxo) { paraCamera(); exImite(); return; }
      try { fluxo = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false }); exImite(); }
      catch (e) { $('#ret').textContent = 'Tudo bem! Sem câmera, use um espelho de verdade ou só olhe a Sofia.'; }
    });
    $('#bFiz').addEventListener('click', () => { estrelas++; iI++; falar('Muito bem!'); exImite(); });
  }

  /* ---------- 4. Conheça seu corpo ---------- */
  const PARTES = {
    labios: ['Lábios', 'Fecham para o P, o B e o M, e fazem biquinho no O e no U.'],
    dentes: ['Dentes', 'O lábio de baixo encosta neles no F e no V. A língua se esconde atrás deles no S.'],
    lingua: ['Língua', 'É um músculo que sobe, desce, vai para frente e para trás. Ela muda o som!'],
    palato: ['Céu da boca', 'É o teto da boca. A língua encosta nele no NH e no LH.'],
    alveolo: ['Atrás dos dentes', 'Aquele montinho atrás dos dentes de cima. A ponta da língua bate ali no T, no D, no N, no L e no R de arara.'],
    veu: ['Véu, o céu mole', 'Fica lá no fundo. Ele sobe para fechar o nariz, e desce no M e no N para o som sair pelo nariz.'],
    nariz: ['Nariz', 'No M, no N e no NH, o som sai por aqui. Tampe o nariz e tente falar mmm!'],
    garganta: ['Garganta', 'Um tubo por onde o ar sobe dos pulmões até a boca. O RR de rato raspa lá no fundo.'],
    pregas: ['Voz', 'Na garganta há duas cortininhas (as pregas vocais) que tremem e fazem a voz. Ponha a mão no pescoço e diga aaa!'],
    pulmoes: ['Pulmões', 'Enchem de ar como balões. O ar sobe pela garganta e vira som na boca.'],
    baixo: ['Língua deitadinha', 'Nas vogais abertas, como o A, a língua fica deitada lá embaixo.']
  };
  function exCorpo() {
    modo('lado'); selecionar('a'); if (innerWidth >= 700) { $('#bNomes').setAttribute('aria-pressed', true); esp.rotulos(true); }
    const ordem = ['labios', 'dentes', 'lingua', 'alveolo', 'palato', 'veu', 'nariz', 'garganta', 'pregas'];
    $('#painel').innerHTML = `<h3>Conheça seu corpo</h3><p>Toque numa parte na janelinha ou aqui:</p>
      <div class="partes">${ordem.map((k) => `<button data-p="${k}">${PARTES[k][0]}</button>`).join('')}</div>
      <div class="retorno" id="ret"></div>
      <div class="seq"><button id="bSofiaCorpo">🔊 Ouvir a Sofia</button></div>`;
    const mostra = (k) => {
      if (!PARTES[k]) return;
      $$('.partes button').forEach((b) => b.classList.toggle('on', b.dataset.p === k));
      esp.destacar(k, true); $('#ret').innerHTML = `<b>${PARTES[k][0]}:</b> ${PARTES[k][1]}`;
    };
    $$('.partes button').forEach((b) => b.addEventListener('click', () => mostra(b.dataset.p)));
    $('#bSofiaCorpo').addEventListener('click', () => audio.fala('sofia', 'Aqui você vê por dentro como o som é feito: lábios, dentes, língua, céu da boca, nariz e garganta. Escolha um som!', 'sofia-5xs6if.mp3'));
    toque = (e) => mostra(e.zona);
  }

  if (innerWidth < 700) { $('#bNomes').setAttribute('aria-pressed', false); esp.rotulos(false); } // no celular, os nomes começam desligados
  selecionar(atual, { instantaneo: true });
  abrirAba(q.get('aba') || 'explorar');
  if (q.get('m')) modo(q.get('m')); else if (!q.get('aba')) modo('frente');
  trocaPers(pers);
  window.DEMO = { esp, fr, rx, audio, selecionar, abrirAba, modo, trocaPers, sequencia };
})();
