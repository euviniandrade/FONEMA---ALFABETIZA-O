/* =====================================================================
   FONEMA — plataforma de alfabetização · protótipo da 1ª missão
   ---------------------------------------------------------------------
   Fluxo: cadastro do adulto → nome falado → entrega à criança → avatar
   → chegada à vila → missão "Meu Nome" (Assiste e Faz) → celebração
   → despedida → painéis (família, professor, termômetro 0–10).

   SIMULAÇÕES DESTE PROTÓTIPO (ver README):
   • VOZ: usa speechSynthesis do navegador (pt-BR), variando pitch/rate
     para Sofia e Tales. NO PRODUTO: falas pré-geradas no ElevenLabs com as
     vozes oficiais "Sofia — FONEMA" e "Tales — FONEMA", com uma pausa no
     lugar do nome; o nome é gerado UMA vez nas duas vozes (só o primeiro
     nome, com consentimento — Decisão 013) e encaixado na hora.
   • SONS ISOLADOS (/s/, /m/…): no produto são gravados por fonoaudióloga.
     Aqui a voz só fala palavras inteiras.
   • RECONHECIMENTO DE FALA: só é usado se o navegador oferecer
     reconhecimento NO PRÓPRIO APARELHO (processLocally). Reconhecimento
     em nuvem NÃO é usado, para nada sair do aparelho. Sem ele, vale o
     medidor de volume + botão "Eu falei!".
   • DADOS: perfil em localStorage; a gravação do adulto fica só na
     memória da aba (some ao fechar). Nada é enviado a servidor.
   ===================================================================== */
'use strict';
(function () {
  const R = window.RegrasSom;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const palco = $('#palco');
  const PECAS = '../avatar-3d/pecas/';
  const SERIE = '../serie-sofia-e-tales/imagens/';
  const P3D = '../personagens-3d/';
  const AUDIO_DUPLA = '../voz/dupla/sofia-e-tales-ilha-das-vogais.mp3';
  const params = new URLSearchParams(location.search);
  const RAPIDO = params.has('rapido') ? 0.12 : 1; // usado só nos testes automáticos
  const CHAVE = 'fonema-prototipo-v1';

  const BASES = [
    ['crianca-01-crespo-curto.png', 'cabelo crespo curto'],
    ['crianca-02-trancas.png', 'tranças'],
    ['crianca-03-coque.png', 'coque'],
    ['crianca-04-ruiva-ondulada.png', 'cabelo ruivo ondulado'],
    ['crianca-05-chanel-liso.png', 'cabelo liso chanel'],
    ['crianca-06-liso-longo-pintura.png', 'cabelo liso longo com pintura'],
    ['crianca-07-black-power-alto.png', 'black power alto'],
    ['crianca-08-oculos-aparelho.png', 'óculos e aparelho auditivo'],
    ['crianca-09-cadeira-de-rodas.png', 'cadeira de rodas']
  ];
  const CANTINHOS = [['mata', 'Mata', '#3E9A63'], ['ipe', 'Ipê', '#F4B73C'], ['ceu', 'Céu', '#A8D5F2'], ['barro', 'Barro', '#C9714C']];

  /* ------------------------------ estado ------------------------------ */
  const salvo = (() => { try { return JSON.parse(localStorage.getItem(CHAVE)) || {}; } catch (e) { return {}; } })();
  const E = Object.assign({
    nome: '', genero: null, responsavel: false, consentNome: false, consentAudio: false,
    fonetica: null, foneticaFala: null, opcaoRate: 0.95, opcaoPitch: 0, avatar: { base: 0, cantinho: 'mata' },
    moedas: 0, emblemas: [],
    prefs: { som: true, contraste: false, calmo: matchMedia('(prefers-reduced-motion: reduce)').matches }
  }, salvo);
  let gravacaoURL = null; // só em memória
  let opcoes = [];
  let M = null; // estado da missão
  const salvar = () => {
    const { nome, genero, responsavel, consentNome, consentAudio, fonetica, foneticaFala, opcaoRate, opcaoPitch, avatar, moedas, emblemas, prefs, resultado } = E;
    try { localStorage.setItem(CHAVE, JSON.stringify({ nome, genero, responsavel, consentNome, consentAudio, fonetica, foneticaFala, opcaoRate, opcaoPitch, avatar, moedas, emblemas, prefs, resultado })); } catch (e) { /* modo privado */ }
  };

  // Concordância (Decisão 013): masculino / feminino / neutra ("prefiro não informar")
  const G = (m, f, n) => (E.genero === 'm' ? m : E.genero === 'f' ? f : n);
  const N = '{N}';
  const ver = (t) => t.split(N).join(E.nome);                       // texto na tela
  const ouv = (t) => t.split(N).join(E.foneticaFala || E.nome);      // texto para a voz (grafia fonética escolhida)
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const verHTML = (t) => esc(t).split(N).join(`<span class="nome-dest">${esc(E.nome)}</span>`);
  const espera = (ms) => new Promise((r) => setTimeout(r, ms * RAPIDO));

  /* ------------------------------ voz ------------------------------ */
  // PROTÓTIPO: speechSynthesis. PRODUTO: clipes ElevenLabs "Sofia — FONEMA" / "Tales — FONEMA" + nome encaixado.
  const PERFIL = { sofia: { pitch: 1.35, rate: 0.95 }, tales: { pitch: 1.0, rate: 1.0 }, adulto: { pitch: 1.0, rate: 1.0 } };
  let vozBR = null;
  const carregaVozes = () => {
    if (!('speechSynthesis' in window)) return;
    const v = speechSynthesis.getVoices().filter((x) => /^pt/i.test(x.lang));
    vozBR = v.find((x) => /pt[-_]BR/i.test(x.lang)) || v[0] || null;
  };
  if ('speechSynthesis' in window) { carregaVozes(); speechSynthesis.onvoiceschanged = carregaVozes; }
  let falaAtual = 0;
  function falar(texto, quem = 'sofia', extra = {}) {
    const id = ++falaAtual;
    const p = PERFIL[quem] || PERFIL.sofia;
    const rate = extra.rate || p.rate;
    const estimado = Math.min(14000, 700 + texto.length * 62 / rate);
    return new Promise((ok) => {
      let feito = false;
      const fim = () => { if (!feito) { feito = true; ok(); } };
      setTimeout(fim, estimado * RAPIDO + 200);
      if (!E.prefs.som || !('speechSynthesis' in window) || RAPIDO < 1) return;
      try {
        speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(texto);
        u.lang = 'pt-BR'; if (vozBR) u.voice = vozBR;
        u.pitch = Math.max(0, Math.min(2, p.pitch + (extra.pitch || 0)));
        u.rate = rate;
        u.onend = () => { if (id === falaAtual) fim(); };
        u.onerror = fim;
        speechSynthesis.speak(u);
      } catch (e) { fim(); }
    });
  }
  const calar = () => { falaAtual++; if ('speechSynthesis' in window) speechSynthesis.cancel(); };

  /* Botão de áudio padrão para qualquer texto (para quem ainda não lê) */
  function botaoOuvir(texto, quem, rotulo) {
    const b = document.createElement('button');
    b.className = 'ouvir'; b.type = 'button';
    b.setAttribute('aria-label', rotulo || 'Ouvir');
    b.innerHTML = '<span aria-hidden="true">🔊</span>';
    b.addEventListener('click', async () => { b.classList.add('falando'); await falar(ouv(texto), quem); b.classList.remove('falando'); });
    return b;
  }
  /* Balão de fala da Sofia ou do Tales, com busto 3D e botão de áudio */
  function fala(texto, quem = 'sofia', humor = 'alegre') {
    const d = document.createElement('div');
    d.className = 'fala';
    const arq = quem === 'tales' ? `tales-busto-${humor === 'surpresa' ? 'surpreso' : humor === 'curiosa' ? 'curioso' : humor}.png` : `sofia-busto-${humor}.png`;
    d.innerHTML = `<div class="busto ${quem}"><img src="${PECAS}${arq}" alt=""></div>
      <div class="balao ${quem}"><p><span class="quem">${quem === 'tales' ? 'Tales' : 'Sofia'}</span>${verHTML(texto)}</p></div>`;
    $('.balao', d).appendChild(botaoOuvir(texto, quem, `Ouvir o que ${quem === 'tales' ? 'o Tales' : 'a Sofia'} disse`));
    return d;
  }
  async function dizer(container, linhas) {
    // linhas: [[texto, quem, humor], ...] — mostra e fala em sequência
    for (const [t, q, h] of linhas) {
      const f = fala(t, q, h);
      container.appendChild(f);
      await falar(ouv(t), q);
    }
  }

  /* ------------------------------ telas ------------------------------ */
  let telaAtual = null;
  function ir(nome) {
    calar();
    telaAtual = nome;
    palco.innerHTML = '';
    palco.scrollTop = 0;
    const t = document.createElement('section');
    t.className = 'tela'; t.dataset.tela = nome;
    palco.appendChild(t);
    TELAS[nome](t);
    atualizaTopo();
    palco.focus({ preventScroll: true });
  }
  const ETAPAS = [['assiste', '📺', 'Assiste'], ['figura', '🖼️', 'Figura'], ['letras', '🔤', 'Letras'], ['falar', '🎤', 'Falar'], ['festa', '⭐', 'Festa']];
  function atualizaTopo() {
    const tr = $('#trilha');
    const naMissao = ['assiste', 'suaVez', 'figura', 'letras', 'falar', 'celebra'].includes(telaAtual);
    tr.hidden = !naMissao;
    if (naMissao) {
      const atual = { assiste: 0, suaVez: 0, figura: 1, letras: 2, falar: 3, celebra: 4 }[telaAtual];
      tr.innerHTML = ETAPAS.map(([k, ic, nm], i) => `<li class="${i < atual ? 'feito' : i === atual ? 'agora' : ''}" ${i === atual ? 'aria-current="step"' : ''}><i aria-hidden="true">${i < atual ? '✓' : ic}</i><span>${nm}</span></li>`).join('');
    }
    $('#moedas').hidden = !['vila', 'assiste', 'suaVez', 'figura', 'letras', 'falar', 'celebra', 'mostra', 'despedida'].includes(telaAtual);
    $('#moedasNum').textContent = E.moedas;
  }

  const TELAS = {};

  /* 1 · CADASTRO DO ADULTO ------------------------------------------------ */
  TELAS.cadastro = (t) => {
    t.innerHTML = `
    <div class="adulto">
      <aside class="lado">
        <span class="selo">Área do adulto</span>
        <h2>Vamos preparar a chegada da criança</h2>
        <p>Leva 2 minutos. A Sofia e o Tales vão chamar a criança sempre pelo nome, do jeito certo.</p>
        <img src="${PECAS}dupla-sofia-tales-corpo.png" alt="Sofia e Tales, de uniforme, de braços cruzados e sorrindo">
      </aside>
      <form class="cartao form" id="fCad" novalidate>
        <div><h1>Cadastro da criança</h1><p class="sub">Quem cadastra é sempre o adulto responsável.</p></div>
        <div class="campo">
          <label for="iNome">Primeiro nome da criança</label>
          <input class="entrada" id="iNome" autocomplete="off" maxlength="24" value="${esc(E.nome)}" placeholder="Ex.: Kauã" aria-describedby="ajNome">
          <div class="ajuda" id="ajNome">Só o primeiro nome, ou o nome pelo qual a família chama. Sem sobrenome e sem apelido.</div>
        </div>
        <div class="campo" role="radiogroup" aria-labelledby="lgGen">
          <span class="legenda" id="lgGen">Gênero</span>
          <div class="generos">
            <button type="button" class="op-gen" role="radio" data-g="m" aria-checked="${E.genero === 'm'}">Masculino</button>
            <button type="button" class="op-gen" role="radio" data-g="f" aria-checked="${E.genero === 'f'}">Feminino</button>
            <button type="button" class="op-gen" role="radio" data-g="n" aria-checked="${E.genero === 'n'}">Prefiro não informar</button>
          </div>
          <div class="ajuda">Serve só para as falas: “Você está pronto?” ou “pronta?”. Com “prefiro não informar”, as falas usam forma neutra.</div>
          <div class="previa" id="previa" aria-live="polite"></div>
        </div>
        <fieldset class="consent">
          <legend class="legenda">Autorização (LGPD, art. 14)</legend>
          <label class="check"><input type="checkbox" id="cResp" ${E.responsavel ? 'checked' : ''}> <span>Sou <b>mãe, pai ou responsável legal</b> por esta criança.</span></label>
          <label class="check"><input type="checkbox" id="cNome" ${E.consentNome ? 'checked' : ''}> <span>Autorizo usar <b>só o primeiro nome</b> para a Sofia e o Tales falarem com a criança. Para o serviço de voz vai apenas o primeiro nome, nada mais.</span></label>
          <label class="check"><input type="checkbox" id="cAudio" ${E.consentAudio ? 'checked' : ''}> <span><b>Opcional:</b> autorizo gravar a minha voz dizendo o nome, só para comparar a pronúncia. Ela não treina nenhuma IA e pode ser apagada quando eu quiser (no produto, é apagada sozinha 30 dias depois da escolha).</span></label>
          <div class="nao-pedimos" aria-label="O que não pedimos"><b>Não pedimos:</b><span>foto</span><span>CPF da criança</span><span>endereço</span><span>sobrenome</span><span>escola no áudio</span></div>
        </fieldset>
        <div class="acoes"><span class="erro-form" id="erroCad" role="alert"></span><button class="btn pri grande" type="submit">Continuar <span class="ic" aria-hidden="true">→</span></button></div>
      </form>
    </div>`;
    const prev = () => {
      const nm = primeiroNome($('#iNome').value) || 'a criança';
      const g = E.genero;
      $('#previa').innerHTML = g ? `A Sofia vai dizer: <b>“${g === 'm' ? `Você está pronto, ${esc(nm)}?` : g === 'f' ? `Você está pronta, ${esc(nm)}?` : `Vamos começar, ${esc(nm)}?`}”</b>` : 'Escolha uma opção para ver como a Sofia vai falar.';
    };
    $$('.op-gen', t).forEach((b) => b.addEventListener('click', () => {
      E.genero = b.dataset.g; $$('.op-gen', t).forEach((x) => x.setAttribute('aria-checked', x === b)); prev();
    }));
    $('#iNome', t).addEventListener('input', prev);
    prev();
    $('#fCad', t).addEventListener('submit', (ev) => {
      ev.preventDefault();
      const nm = primeiroNome($('#iNome').value);
      const err = $('#erroCad');
      if (!nm) return (err.textContent = 'Escreva o primeiro nome da criança.');
      if (!E.genero) return (err.textContent = 'Escolha uma das 3 opções de gênero.');
      if (!$('#cResp').checked || !$('#cNome').checked) return (err.textContent = 'Para continuar, marque as duas primeiras autorizações.');
      if (nm !== E.nome) { E.fonetica = null; E.foneticaFala = null; }
      E.nome = nm; E.responsavel = true; E.consentNome = true; E.consentAudio = $('#cAudio').checked;
      salvar(); ir('pronuncia');
    });
  };
  function primeiroNome(v) {
    const p = (v || '').trim().split(/\s+/)[0] || '';
    const limpo = p.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ'-]/g, '').replace(/-/g, '');
    return limpo ? limpo.charAt(0).toUpperCase() + limpo.slice(1).toLowerCase() : '';
  }

  /* 2 · NOME FALADO: gravação + 3 pronúncias ------------------------------- */
  TELAS.pronuncia = (t) => {
    opcoes = R.opcoesPronuncia(E.nome);
    let sel = opcoes.findIndex((o) => o.grafia === E.fonetica);
    t.innerHTML = `
    <div class="adulto">
      <aside class="lado">
        <span class="selo">Área do adulto</span>
        <h2>Como a Sofia vai falar o nome?</h2>
        <p>O nome é a primeira palavra que importa para a criança. Queremos acertar.</p>
        <img src="${PECAS}sofia-busto-curiosa.png" alt="Sofia, curiosa" style="width:70%">
      </aside>
      <div class="cartao form">
        <div><h1>${esc(E.nome)}: como se fala?</h1><p class="sub">1) Grave você falando o nome. 2) Ouça as 3 opções na voz da Sofia e do Tales. 3) Escolha a que soa igual.</p></div>
        <div class="campo">
          <span class="legenda">1. Grave o nome com a sua voz (2–3 segundos)</span>
          <div class="grava">
            <button type="button" class="btn terra" id="bGravar" ${E.consentAudio ? '' : 'disabled'}><span class="ic" aria-hidden="true">●</span> Gravar o nome</button>
            <button type="button" class="btn" id="bOuvirGrav" disabled><span class="ic" aria-hidden="true">▶</span> Ouvir a gravação</button>
            <button type="button" class="btn" id="bApagarGrav" disabled>Apagar</button>
            <span class="estado" id="estGrav" aria-live="polite">${E.consentAudio ? 'Toque em “Gravar” e fale o nome uma vez, com calma.' : 'Gravação desligada (você não autorizou). Tudo bem: ouça as opções e escolha.'}</span>
          </div>
          <audio id="audGrav" hidden></audio>
        </div>
        <div class="campo">
          <span class="legenda">2. Como a Sofia vai falar seu nome?</span>
          <div class="pron" id="pron"></div>
        </div>
        <div class="campo">
          <label class="legenda" for="iFon">3. Nenhuma ficou igual? Ajuste a grafia e gere de novo</label>
          <div class="ajuste">
            <input class="entrada" id="iFon" autocomplete="off" value="${esc(E.fonetica || opcoes[0].grafia)}" aria-describedby="ajFon">
            <button type="button" class="btn" id="bGerar"><span class="ic" aria-hidden="true">↻</span> Gerar de novo</button>
          </div>
          <div class="ajuda" id="ajFon">Separe as sílabas com hífen e escreva a sílaba mais forte em MAIÚSCULAS. Ex.: Kauã → <b>Ka-u-Ã</b>.</div>
        </div>
        <p class="nota-produto">No produto, as 3 opções são geradas nas vozes oficiais <b>“Sofia — FONEMA”</b> e <b>“Tales — FONEMA”</b> (ElevenLabs), com o nome encaixado nas falas já gravadas. Neste protótipo, a voz é a do próprio navegador.</p>
        <div class="acoes"><span class="erro-form" id="erroPron" role="alert"></span><button class="btn" type="button" id="bVoltar">← Voltar</button><button class="btn pri grande" id="bOk" type="button">Confirmar pronúncia →</button></div>
      </div>
    </div>`;
    const desenha = () => {
      $('#pron').innerHTML = '';
      opcoes.forEach((o, i) => {
        const c = document.createElement('div');
        c.className = 'op-pron' + (i === sel ? ' sel' : '');
        c.innerHTML = `<span class="tit">Opção ${i + 1} · ${esc(o.titulo)}</span><span class="graf">${esc(o.grafia)}</span>
          <div class="vozes"><button type="button" data-q="sofia" aria-label="Ouvir opção ${i + 1} na voz da Sofia"><img src="${PECAS}sofia-busto-alegre.png" alt="">Sofia</button>
          <button type="button" data-q="tales" aria-label="Ouvir opção ${i + 1} na voz do Tales"><img src="${PECAS}tales-busto-alegre.png" alt="">Tales</button></div>
          <button type="button" class="escolher" aria-pressed="${i === sel}">${i === sel ? '✓ Escolhida' : 'É essa!'}</button>`;
        $$('.vozes button', c).forEach((b) => b.addEventListener('click', () => falar(o.fala, b.dataset.q, { rate: o.rate, pitch: o.pitchExtra })));
        $('.escolher', c).addEventListener('click', () => { sel = i; $('#iFon').value = o.grafia; desenha(); falar(o.fala, 'sofia', { rate: o.rate, pitch: o.pitchExtra }); });
        $('#pron').appendChild(c);
      });
    };
    desenha();
    $('#bGerar').addEventListener('click', () => {
      const g = $('#iFon').value.trim();
      if (!g) return;
      const nova = { id: 4, titulo: 'Do seu jeito', grafia: g, fala: R.foneticaParaFala(g), rate: 0.85, pitchExtra: 0 };
      const ja = opcoes.findIndex((o) => o.titulo === 'Do seu jeito');
      if (ja >= 0) opcoes[ja] = nova; else opcoes[2] = nova;
      sel = opcoes.indexOf(nova); desenha();
      falar(nova.fala, 'sofia', { rate: nova.rate });
    });
    // gravação (MediaRecorder) — fica só na memória da aba
    let rec = null;
    $('#bGravar').addEventListener('click', async () => {
      const est = $('#estGrav');
      if (rec && rec.state === 'recording') { rec.stop(); return; }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const partes = [];
        rec = new MediaRecorder(stream);
        rec.ondataavailable = (e) => e.data.size && partes.push(e.data);
        rec.onstop = () => {
          stream.getTracks().forEach((x) => x.stop());
          if (gravacaoURL) URL.revokeObjectURL(gravacaoURL);
          gravacaoURL = URL.createObjectURL(new Blob(partes, { type: rec.mimeType || 'audio/webm' }));
          $('#audGrav').src = gravacaoURL;
          $('#bOuvirGrav').disabled = false; $('#bApagarGrav').disabled = false;
          $('#bGravar').innerHTML = '<span class="ic" aria-hidden="true">●</span> Gravar de novo';
          est.textContent = 'Gravado! Ouça e compare com as opções abaixo. (Fica só neste aparelho.)';
        };
        rec.start();
        $('#bGravar').innerHTML = '<span class="rec-dot" aria-hidden="true"></span> Parar';
        let s = 3; est.textContent = `Gravando… fale “${E.nome}” (${s})`;
        const iv = setInterval(() => { s--; if (s > 0 && rec.state === 'recording') est.textContent = `Gravando… fale “${E.nome}” (${s})`; else { clearInterval(iv); if (rec.state === 'recording') rec.stop(); } }, 1000);
      } catch (e) {
        est.textContent = 'Não consegui acessar o microfone neste aparelho. Sem problema: ouça as opções e escolha.';
      }
    });
    $('#bOuvirGrav').addEventListener('click', () => { calar(); $('#audGrav').play().catch(() => {}); });
    $('#bApagarGrav').addEventListener('click', () => {
      if (gravacaoURL) URL.revokeObjectURL(gravacaoURL); gravacaoURL = null;
      $('#audGrav').removeAttribute('src'); $('#bOuvirGrav').disabled = true; $('#bApagarGrav').disabled = true;
      $('#estGrav').textContent = 'Gravação apagada.';
    });
    $('#bVoltar').addEventListener('click', () => ir('cadastro'));
    $('#bOk').addEventListener('click', () => {
      if (sel < 0) return ($('#erroPron').textContent = 'Toque em “É essa!” na opção que soa igual.');
      const o = opcoes[sel];
      E.fonetica = o.grafia; E.foneticaFala = o.fala; E.opcaoRate = o.rate; E.opcaoPitch = o.pitchExtra;
      salvar(); ir('entrega');
    });
  };

  /* 3 · ENTREGA PARA A CRIANÇA -------------------------------------------- */
  TELAS.entrega = (t) => {
    t.innerHTML = `<div class="entrega">
      <img src="${PECAS}dupla-sofia-tales-corpo.png" alt="Sofia e Tales esperando a criança">
      <h1>Tudo pronto! Agora passe o aparelho para ${esc(E.nome)}.</h1>
      <p class="sub">Daqui em diante, tudo tem voz: a criança não precisa saber ler.</p>
      <button class="btn ipe grande" id="bComecar"><span class="ic" aria-hidden="true">▶</span> Começar, ${esc(E.nome)}!</button>
    </div>`;
    $('#bComecar').addEventListener('click', () => ir('avatar'));
  };

  /* 4 · AVATAR RÁPIDO ----------------------------------------------------- */
  TELAS.avatar = (t) => {
    const a = E.avatar;
    t.innerHTML = `<div class="avatar-tela">
      <div class="palco-av cant-${a.cantinho}" id="palcoAv">
        <div class="cracha">${esc(E.nome)}</div><div class="disco"></div>
        <img class="av" id="avImg" src="${PECAS}${BASES[a.base][0]}" alt="Seu personagem: ${BASES[a.base][1]}">
      </div>
      <div class="escolhas">
        <div id="falaAv"></div>
        <div class="cartao"><h2 style="margin-bottom:10px">1. Escolha o seu jeito</h2>
          <div class="grade-av" role="radiogroup" aria-label="Escolha o seu jeito">${BASES.map((b, i) => `<button class="op-av ${i === 8 ? 'larga' : ''}" role="radio" aria-checked="${i === a.base}" data-i="${i}" aria-label="${b[1]}"><img src="${PECAS}${b[0]}" alt=""></button>`).join('')}</div>
        </div>
        <div class="cartao"><h2 style="margin-bottom:10px">2. Escolha a cor do seu cantinho</h2>
          <div class="grade-cant" role="radiogroup" aria-label="Cor do cantinho">${CANTINHOS.map(([k, nm, cor]) => `<button class="op-cant" role="radio" aria-checked="${k === a.cantinho}" data-k="${k}"><i style="background:${cor}" aria-hidden="true"></i>${nm}</button>`).join('')}</div>
        </div>
        <div class="acoes"><span class="sub">Óculos, aparelho e cadeira de rodas são sempre grátis. Roupas novas vêm depois, na lojinha.</span><button class="btn verde grande" id="bPronto">Pronto! <span class="ic" aria-hidden="true">✓</span></button></div>
      </div></div>`;
    const fAv = $('#falaAv');
    dizer(fAv, [[G(`Oi, ${N}! Monte o seu personagem do seu jeito. Toque para escolher!`, `Oi, ${N}! Monte a sua personagem do seu jeito. Toque para escolher!`, `Oi, ${N}! Monte o seu avatar do seu jeito. Toque para escolher!`), 'sofia', 'alegre']]);
    $$('.op-av', t).forEach((b) => b.addEventListener('click', () => {
      a.base = +b.dataset.i; $$('.op-av', t).forEach((x) => x.setAttribute('aria-checked', x === b));
      const img = $('#avImg'); img.src = PECAS + BASES[a.base][0]; img.alt = 'Seu personagem: ' + BASES[a.base][1];
      falar(BASES[a.base][1], 'sofia');
    }));
    $$('.op-cant', t).forEach((b) => b.addEventListener('click', () => {
      a.cantinho = b.dataset.k; $$('.op-cant', t).forEach((x) => x.setAttribute('aria-checked', x === b));
      $('#palcoAv').className = 'palco-av cant-' + a.cantinho;
      falar(b.textContent.trim(), 'sofia');
    }));
    $('#bPronto').addEventListener('click', () => { salvar(); ir('vila'); });
  };

  /* 5 · CHEGADA À VILA ---------------------------------------------------- */
  TELAS.vila = (t) => {
    t.classList.add('cena');
    t.innerHTML = `<img class="fundo" src="${SERIE}P1-03-palmas-silabas-portao.png" alt="Sofia, Tales e o tatu Bolota no portão de madeira da vila, entre ipês e plantas">
      <div class="veu"></div><div class="placa">Vila das Letras</div>
      <img class="av-vila" src="${PECAS}${BASES[E.avatar.base][0]}" alt="O seu personagem chegando à vila">
      <div class="falas" id="falasVila" aria-live="polite"></div>
      <div class="rodape"><button class="btn" id="bDeNovo"><span class="ic" aria-hidden="true">🔊</span> Ouvir de novo</button><button class="btn ipe grande" id="bVamos">Vamos! <span class="ic" aria-hidden="true">→</span></button></div>`;
    const linhas = () => [
      [`Oi, ${N}! Eu sou a Sofia!`, 'sofia', 'alegre'],
      [G(`E eu sou o Tales! Seja bem-vindo à Vila das Letras, ${N}!`, `E eu sou o Tales! Seja bem-vinda à Vila das Letras, ${N}!`, `E eu sou o Tales! Que bom ter você na Vila das Letras, ${N}!`), 'tales', 'alegre'],
      [G(`${N}, você está pronto para a sua primeira missão? É sobre o seu nome!`, `${N}, você está pronta para a sua primeira missão? É sobre o seu nome!`, `${N}, vamos para a primeira missão? É sobre o seu nome!`), 'sofia', 'curiosa']
    ];
    const roda = () => { $('#falasVila').innerHTML = ''; dizer($('#falasVila'), linhas()); };
    roda();
    $('#bDeNovo').addEventListener('click', roda);
    $('#bVamos').addEventListener('click', () => { iniciaMissao(); ir('assiste'); });
  };

  /* 6 · MISSÃO "MEU NOME" — formato Assiste e Faz (Decisão 015) ----------- */
  function iniciaMissao() {
    const som = R.somInicial(E.nome);
    const info = R.SONS[som.chave] || R.SONS.s;
    M = { som, info, figuras: R.rodadaFiguras(E.nome, som.chave), erros: { figura: 0, letras: 0 }, fala: { tentou: false, ouviu: false, local: false }, inicio: Date.now() };
    M.certa = M.figuras.find((f) => f.certo);
  }
  const letrasNome = () => [...E.nome.toUpperCase()];
  function nomeGrande(destaque = true) {
    const L = letrasNome();
    return `<div class="nome-grande" aria-label="${esc(E.nome)}">${L.map((c, i) => `<span class="${destaque && i < M.som.destaque ? (i < M.som.mudo ? 'mudo' : 'dest') : ''}" aria-hidden="true">${esc(c)}</span>`).join('')}</div>`;
  }
  // desenho simples da boca para o Espelho do Som
  function bocaSVG(chave) {
    const tipo = { m: 'fechada', b: 'fechada', p: 'fechada', f: 'dentes', v: 'dentes', s: 'sorriso', z: 'sorriso', i: 'sorriso', 'i~': 'sorriso', e: 'meia', 'e~': 'meia', x: 'bico', j: 'bico', u: 'bico', 'u~': 'bico', o: 'redonda', 'o~': 'redonda', a: 'aberta', 'a~': 'aberta' }[chave] || 'lingua';
    const L = '#B5512E', D = '#7A2E18';
    const formas = {
      fechada: `<path d="M22 62 Q60 54 98 62 Q60 74 22 62Z" fill="${L}"/><path d="M24 62 Q60 60 96 62" stroke="${D}" stroke-width="3" fill="none"/>`,
      dentes: `<path d="M24 56 Q60 44 96 56 Q60 84 24 56Z" fill="${D}"/><rect x="40" y="50" width="40" height="11" rx="3" fill="#fff"/><path d="M26 62 Q60 76 94 62 Q60 70 26 62Z" fill="${L}"/>`,
      sorriso: `<path d="M18 54 Q60 50 102 54 Q60 86 18 54Z" fill="${D}"/><rect x="32" y="54" width="56" height="9" rx="3" fill="#fff"/><rect x="36" y="64" width="48" height="8" rx="3" fill="#fff"/><path d="M18 54 Q60 44 102 54 Q60 52 18 54Z" fill="${L}"/>`,
      meia: `<path d="M24 52 Q60 44 96 52 Q60 88 24 52Z" fill="${D}"/><rect x="38" y="52" width="44" height="8" rx="3" fill="#fff"/><ellipse cx="60" cy="74" rx="18" ry="6" fill="#E07A7A"/>`,
      bico: `<ellipse cx="60" cy="62" rx="22" ry="20" fill="${L}"/><ellipse cx="60" cy="62" rx="9" ry="8" fill="${D}"/>`,
      redonda: `<ellipse cx="60" cy="62" rx="28" ry="30" fill="${L}"/><ellipse cx="60" cy="62" rx="17" ry="20" fill="${D}"/>`,
      aberta: `<path d="M22 46 Q60 38 98 46 Q92 100 60 102 Q28 100 22 46Z" fill="${D}"/><rect x="36" y="46" width="48" height="9" rx="3" fill="#fff"/><ellipse cx="60" cy="88" rx="22" ry="9" fill="#E07A7A"/>`,
      lingua: `<path d="M22 50 Q60 42 98 50 Q60 92 22 50Z" fill="${D}"/><rect x="34" y="50" width="52" height="9" rx="3" fill="#fff"/><path d="M42 74 Q60 50 78 74 Q60 82 42 74Z" fill="#E07A7A"/>`
    };
    return `<svg viewBox="0 0 120 120" width="100" height="100" role="img" aria-label="Desenho da boca para este som">${formas[tipo]}</svg>`;
  }

  // ESPELHO DO SOM novo (../espelho-do-som-3d/, estilos da D020): de frente a "Boca gigante" com a língua animada
  // e a Sofia e o Tales apontando; de lado a Sofia "3D fofinho" com a janelinha na bochecha (língua, dentes, véu,
  // ar e voz na posição do som). Posições simplificadas: validar com fonoaudióloga.
  const ESP = '../espelho-do-som-3d/';
  const ROSTO_SOFIA = { M: 'p b m', A: 'a a~ E k g rr', O: 'O o o~', S: 's z i i~ t d n nh lh', F: 'f v', L: 'l', CH: 'x j u u~', E: 'e e~ r' };
  const rostoSofia = (k) => { for (const [q, ids] of Object.entries(ROSTO_SOFIA)) if (ids.split(' ').includes(k)) return q; return 'A'; };
  let raioX = null, frenteX = null;
  function espelhoHTML(titulo) {
    const k = M.som.chave;
    return `<div class="espelho espelho2">
      <div class="frente-mini" aria-label="A boca de frente fazendo o som ${esc(M.info.ipa)}"></div>
      <div class="raiox-mini" aria-label="A boca de lado: onde a língua fica no som ${esc(M.info.ipa)}"></div>
      <div class="esp-txt"><h3>${titulo} <span class="ipa">${esc(M.info.ipa)}</span></h3><p>${esc(M.info.dica)}</p><p class="valida">posições simplificadas · validar com fonoaudióloga</p></div>
    </div>`;
  }
  function montaRaioX(t) {
    if (raioX) { raioX.destruir(); raioX = null; }
    if (frenteX) { frenteX.destruir(); frenteX = null; }
    const box = $('.raiox-mini', t), fbox = $('.frente-mini', t);
    if (!box || !window.EspelhoSVG || !window.FonemasPT) return;
    const k = window.FonemasPT.F[M.som.chave] ? M.som.chave : 'a';
    if (fbox && window.EspelhoFrente) frenteX = window.EspelhoFrente.criar(fbox, { fonema: 'e', viewBox: '410 30 580 650' }); // só a boca
    raioX = window.EspelhoSVG.criar(box, { fonema: 'e', personagem: 'lado3d' });
    raioX.rotulos(false);
    setTimeout(() => { if (raioX) raioX.fonema(k); if (frenteX) frenteX.fonema(k); }, 350); // a boca "chega" na posição do som
  }

  // 6a · ASSISTE: mini-vídeo da dupla apresentando o som do nome
  TELAS.assiste = (t) => {
    const c = M.certa.palavra;
    const L = letrasNome().slice(M.som.mudo, M.som.destaque).join('') || E.nome[0].toUpperCase();
    const roteiro = [
      ['Ei, Sofia! Sabia que todo nome começa com um som?', 'tales'],
      ['Sabia, Tales! O meu nome, Sofia, começa igualzinho a sapo!', 'sofia'],
      [`E o nome de ${N}? Escuta só: ${N}!`, 'tales', 'letra'],
      [`${N} começa com o mesmo som de ${c}! ${N}... ${c}!` + (M.som.nota ? ' ' + M.som.nota : ''), 'sofia', 'letra'],
      ['Olha a minha boca: ' + M.info.dica, 'sofia', 'letra'],
      [`Agora é a sua vez, ${N}!`, 'tales']
    ];
    t.innerHTML = `<div class="missao">
      <div class="video" id="vid" role="region" aria-label="Vídeo curto: Sofia e Tales apresentam o primeiro som do seu nome">
        <img src="${SERIE}P1-08-tela-de-licao-fundo-limpo.png" alt="Sofia e Tales lado a lado, em fundo limpo de lição">
        <span class="selo-v">Assiste e Faz · 1 minuto</span>
        <div class="letreiro" id="letreiro" aria-hidden="true">${esc(L)}</div>
        <div class="legenda" id="leg" aria-live="polite">Toque no ▶ para assistir com a Sofia e o Tales.</div>
        <button class="play" id="bPlay" aria-label="Assistir ao vídeo">▶</button>
      </div>
      <div class="barra-v" aria-hidden="true"><i id="barra"></i></div>
      <div class="acoes" style="justify-content:space-between">
        <button class="btn" id="bReal" title="Amostra real das vozes oficiais"><span class="ic" aria-hidden="true">🎧</span> Ouvir as vozes oficiais (exemplo: som A)</button>
        <button class="btn pri" id="bPular">Já assisti → Minha vez</button>
      </div>
      <audio id="audReal" src="${AUDIO_DUPLA}" preload="none"></audio>
    </div>`;
    let rodando = false;
    const tocar = async () => {
      if (rodando) return; rodando = true;
      $('#bPlay').hidden = true; $('#vid').classList.add('toca');
      for (let i = 0; i < roteiro.length; i++) {
        if (telaAtual !== 'assiste') return;
        const [txt, q, ef] = roteiro[i];
        $('#leg').innerHTML = `<b>${q === 'tales' ? 'Tales' : 'Sofia'}:</b> ${verHTML(txt)}`;
        $('#letreiro').classList.toggle('on', ef === 'letra');
        $('#barra').style.width = `${((i + 1) / roteiro.length) * 100}%`;
        await falar(ouv(txt), q);
        await espera(250);
      }
      if (telaAtual === 'assiste') ir('suaVez');
    };
    $('#bPlay').addEventListener('click', tocar);
    $('#bPular').addEventListener('click', () => ir('suaVez'));
    $('#bReal').addEventListener('click', () => { calar(); const a = $('#audReal'); a.paused ? a.play().catch(() => {}) : a.pause(); });
  };

  // 6b · "Agora é a sua vez, [NOME]!" + Espelho do Som
  TELAS.suaVez = (t) => {
    t.innerHTML = `<div class="missao">
      <div class="sua-vez"><h1>Agora é a sua vez, ${esc(E.nome)}!</h1></div>
      ${nomeGrande(true)}
      ${espelhoHTML('Espelho do som')}
      ${M.som.nota ? `<p class="nota-som">💡 ${esc(M.som.nota)}</p>` : ''}
      <div class="acoes"><button class="btn ipe grande" id="bIr">Vamos lá! <span class="ic" aria-hidden="true">→</span></button></div>
    </div>`;
    const esp = $('.esp-txt', t); esp.appendChild(botaoOuvir('Olha a boca: ' + M.info.dica, 'sofia', 'Ouvir a dica da boca'));
    montaRaioX(t);
    falar(ouv(`Agora é a sua vez, ${N}! Repare no comecinho do seu nome.`), 'tales');
    $('#bIr').addEventListener('click', () => ir('figura'));
  };

  // 6c · FIGURA com o mesmo som
  TELAS.figura = (t) => {
    const pergunta = `${N}, qual destas figuras começa com o mesmo som do seu nome?`;
    t.innerHTML = `<div class="missao">
      <div id="falaFig"></div>
      <div class="figuras" role="group" aria-label="Três figuras">${M.figuras.map((f, i) => `
        <div class="fig" data-i="${i}"><button class="ouvir" data-ouvir="${i}" aria-label="Ouvir: ${esc(f.palavra)}"><span aria-hidden="true">🔊</span></button>
          <button class="escolhe" data-i="${i}" style="all:unset;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:6px;width:100%;min-height:200px;justify-content:center" aria-label="Escolher ${esc(f.palavra)}">
          <span class="emo" aria-hidden="true">${f.fig}</span><span class="pal">${esc(f.palavra)}</span></button></div>`).join('')}</div>
      <div class="acoes" id="acFig"></div>
    </div>`;
    const ff = $('#falaFig');
    ff.appendChild(fala(pergunta, 'sofia', 'curiosa'));
    falar(ouv(pergunta + ' ' + M.figuras.map((f) => f.palavra).join('... ')), 'sofia');
    $$('[data-ouvir]', t).forEach((b) => b.addEventListener('click', () => falar(`${M.figuras[+b.dataset.ouvir].palavra}`, 'sofia')));
    let resolvido = false;
    $$('.escolhe', t).forEach((b) => b.addEventListener('click', async () => {
      if (resolvido) return;
      const f = M.figuras[+b.dataset.i];
      const card = b.closest('.fig');
      ff.innerHTML = '';
      if (f.certo) {
        resolvido = true;
        card.classList.add('certo'); card.classList.remove('modelo');
        $$('.fig', t).forEach((x) => x !== card && x.classList.add('quase'));
        const txt = `Isso, ${N}! ${cap(f.palavra)} e ${N} começam com o mesmo som!`;
        ff.appendChild(fala(txt, 'sofia', 'joinha'));
        $('#acFig').innerHTML = '<button class="btn verde grande" id="bCont">Continuar <span class="ic" aria-hidden="true">→</span></button>';
        $('#bCont').addEventListener('click', () => ir('letras'));
        await falar(ouv(txt), 'sofia');
      } else {
        M.erros.figura++;
        card.classList.add('quase');
        let txt;
        if (M.erros.figura === 1) {
          // 1º erro: dica (escada de ajuda), nunca punição
          txt = `Quase, ${N}! Escute: ${f.palavra}... ${N}... começam diferente. Dica: ${M.info.dica} Tente outra!`;
          ff.appendChild(fala(txt, 'sofia', 'pensando'));
        } else {
          // 2º erro: modelo — a figura certa brilha e a dupla faz junto
          const certaCard = $$('.fig', t)[M.figuras.indexOf(M.certa)];
          certaCard.classList.add('modelo');
          txt = `Vamos juntos, ${N}! Olha esta: ${M.certa.palavra}... ${N}. Começam igualzinho! Toque nela.`;
          ff.appendChild(fala(txt, 'tales', 'joinha'));
        }
        await falar(ouv(txt), M.erros.figura === 1 ? 'sofia' : 'tales');
      }
    }));
  };
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  // 6d · LETRAS do nome na ordem (arrastar ou tocar)
  TELAS.letras = (t) => {
    const L = letrasNome();
    let ordem = L.map((c, i) => ({ c, i }));
    // embaralha de forma determinística, garantindo ordem diferente da original
    const h = [...E.nome].reduce((a, c) => a + c.charCodeAt(0), 0);
    ordem = ordem.map((o, k) => ({ o, k: ((k + 1) * 7919 + h) % 97 })).sort((a, b) => a.k - b.k).map((x) => x.o);
    if (ordem.every((o, k) => o.i === k) && ordem.length > 1) ordem.push(ordem.shift());
    const txt = `Agora monte o seu nome, ${N}! Arraste as letras, ou toque nelas, na ordem certinha.`;
    t.innerHTML = `<div class="missao">
      <div id="falaL"></div>
      <div class="modelo-nome" aria-label="Modelo: ${esc(E.nome)}">${esc(E.nome.toUpperCase())}</div>
      <div class="slots" id="slots">${L.map((c, i) => `<div class="slot" data-i="${i}" aria-label="Espaço ${i + 1}"></div>`).join('')}</div>
      <div class="pecas" id="pecas">${ordem.map((o, k) => `<button class="peca" data-c="${esc(o.c)}" data-k="${k}" aria-label="Letra ${esc(o.c)}">${esc(o.c)}</button>`).join('')}</div>
      <div class="acoes" id="acL"></div>
    </div>`;
    $('#falaL').appendChild(fala(txt, 'tales', 'confiante'));
    falar(ouv(txt), 'tales');
    let prox = 0, errosSeguidos = 0;
    const marcaAlvo = () => { $$('.slot', t).forEach((s, i) => s.classList.toggle('alvo', i === prox)); };
    marcaAlvo();
    const tenta = async (peca) => {
      if (prox >= L.length) return;
      const certo = peca.dataset.c === L[prox];
      if (certo) {
        const s = $$('.slot', t)[prox];
        s.textContent = L[prox]; s.classList.add('cheio');
        peca.classList.add('usada'); peca.disabled = true;
        $$('.peca', t).forEach((p) => p.classList.remove('dica'));
        prox++; errosSeguidos = 0; marcaAlvo();
        falar(peca.dataset.c.toLowerCase(), 'sofia');
        if (prox === L.length) {
          const fim = `Você escreveu o seu nome, ${N}! ${L.join(', ')}... ${N}!`;
          $('#falaL').innerHTML = ''; $('#falaL').appendChild(fala(fim, 'sofia', 'joinha'));
          $('#acL').innerHTML = '<button class="btn verde grande" id="bContL">Continuar <span class="ic" aria-hidden="true">→</span></button>';
          $('#bContL').addEventListener('click', () => ir('falar'));
          await falar(ouv(fim), 'sofia');
        }
      } else {
        M.erros.letras++; errosSeguidos++;
        peca.classList.remove('quase'); void peca.offsetWidth; peca.classList.add('quase');
        const ant = prox === 0 ? 'Primeiro vem' : `Depois do ${L[prox - 1]} vem`;
        const msg = errosSeguidos >= 2 ? `${ant} o ${L[prox]}. Olha, ele está brilhando!` : `Quase, ${N}! ${ant} outra letra. Olhe o modelo lá em cima.`;
        if (errosSeguidos >= 2) { const d = $$('.peca:not(.usada)', t).find((p) => p.dataset.c === L[prox]); d && d.classList.add('dica'); }
        $('#falaL').innerHTML = ''; $('#falaL').appendChild(fala(msg, 'tales', 'pensando'));
        falar(ouv(msg), 'tales');
      }
    };
    // arrastar com o dedo/mouse (pointer events) + tocar para colocar
    $$('.peca', t).forEach((p) => {
      let fantasma = null, ini = null, moveu = false;
      p.addEventListener('pointerdown', (e) => { ini = { x: e.clientX, y: e.clientY }; moveu = false; p.setPointerCapture(e.pointerId); });
      p.addEventListener('pointermove', (e) => {
        if (!ini) return;
        if (!moveu && Math.hypot(e.clientX - ini.x, e.clientY - ini.y) < 10) return;
        if (!moveu) { moveu = true; fantasma = p.cloneNode(true); fantasma.classList.add('arrastando'); document.body.appendChild(fantasma); p.style.opacity = '.3'; }
        const r = p.getBoundingClientRect();
        fantasma.style.left = e.clientX - r.width / 2 + 'px'; fantasma.style.top = e.clientY - r.height / 2 + 'px';
        fantasma.style.width = r.width + 'px'; fantasma.style.height = r.height + 'px';
      });
      const solta = (e) => {
        if (!ini) return; ini = null;
        if (fantasma) { fantasma.remove(); fantasma = null; p.style.opacity = ''; }
        if (!moveu) return tenta(p);
        const alvo = document.elementFromPoint(e.clientX, e.clientY);
        const slot = alvo && alvo.closest && alvo.closest('.slot');
        if (slot) tenta(p);
      };
      p.addEventListener('pointerup', solta);
      p.addEventListener('pointercancel', () => { ini = null; if (fantasma) { fantasma.remove(); fantasma = null; p.style.opacity = ''; } });
      p.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tenta(p); } });
    });
  };

  // 6e · FALAR o som no microfone (reconhecimento opcional, só local)
  TELAS.falar = (t) => {
    const txt = `Agora fale bem alto o primeiro som do seu nome, ${N}! Como em ${N}... e ${M.certa.palavra}. Toque no microfone.`;
    t.innerHTML = `<div class="missao">
      <div id="falaF"></div>
      ${espelhoHTML('Lembre da boca')}
      <div class="mic-area">
        <button class="mic" id="bMic" aria-label="Tocar para falar no microfone">🎤</button>
        <div class="nivel" id="nivel" aria-hidden="true">${'<i></i>'.repeat(9)}</div>
        <p class="sub" id="estMic" aria-live="polite">O som não é gravado nem enviado. Só escutamos aqui, agora.</p>
        <div class="acoes" style="justify-content:center"><button class="btn ipe grande" id="bFalei">Eu falei! <span class="ic" aria-hidden="true">✓</span></button></div>
      </div>
    </div>`;
    $('#falaF').appendChild(fala(txt, 'sofia', 'confiante'));
    montaRaioX(t);
    falar(ouv(txt), 'sofia');
    let concluido = false;
    const concluir = async (ouviu) => {
      if (concluido) return; concluido = true;
      M.fala.tentou = true; M.fala.ouviu = !!ouviu;
      const msg = ouviu ? `Eu ouvi você, ${N}! Que som bonito!` : `Muito bem, ${N}! Tentar em voz alta é o que faz aprender.`;
      $('#falaF').innerHTML = ''; $('#falaF').appendChild(fala(msg, 'tales', 'joinha'));
      $('#bFalei').outerHTML = '<button class="btn verde grande" id="bTerminar">Terminar a missão <span class="ic" aria-hidden="true">⭐</span></button>';
      $('#bTerminar').addEventListener('click', () => ir('celebra'));
      await falar(ouv(msg), 'tales');
    };
    $('#bFalei').addEventListener('click', () => concluir(false));
    $('#bMic').addEventListener('click', async () => {
      const est = $('#estMic'), mic = $('#bMic');
      calar();
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mic.classList.add('ouvindo'); est.textContent = 'Estou ouvindo… pode falar!';
        const AC = window.AudioContext || window.webkitAudioContext;
        const ctx = new AC(); const src = ctx.createMediaStreamSource(stream); const an = ctx.createAnalyser(); an.fftSize = 512; src.connect(an);
        const buf = new Float32Array(an.fftSize); const barras = $$('#nivel i');
        let voz = 0; const t0 = performance.now();
        tentaReconhecerLocal().then((r) => { if (r) M.fala.local = true; if (r && r.ok) voz = 99; });
        await new Promise((ok) => {
          const passo = () => {
            an.getFloatTimeDomainData(buf);
            const rms = Math.sqrt(buf.reduce((a, v) => a + v * v, 0) / buf.length);
            barras.forEach((b, i) => { b.style.height = Math.min(60, 10 + rms * 400 * (1 - Math.abs(i - 4) / 6)) + 'px'; });
            if (rms > 0.04) voz++;
            if (performance.now() - t0 > 3500 * Math.max(RAPIDO, 0.4) || voz > 12) return ok();
            requestAnimationFrame(passo);
          };
          passo();
        });
        stream.getTracks().forEach((x) => x.stop()); ctx.close();
        mic.classList.remove('ouvindo');
        if (voz > 12) concluir(true);
        else est.textContent = 'Não ouvi bem. Pode tentar de novo, ou tocar em “Eu falei!”.';
      } catch (e) {
        est.textContent = 'O microfone não está disponível. Tudo bem: fale bem alto e toque em “Eu falei!”.';
      }
    });
  };
  // Reconhecimento de fala só se for NO APARELHO (sem enviar áudio). Retorna null se indisponível.
  async function tentaReconhecerLocal() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    // navigator.webdriver: em navegador automatizado (testes) o SR.available derruba o Chromium headless; pulamos.
    if (!SR || typeof SR.available !== 'function' || navigator.webdriver) return null;
    try {
      const disp = await SR.available({ langs: ['pt-BR'], processLocally: true });
      if (disp !== 'available') return null;
      return await new Promise((ok) => {
        const r = new SR(); r.lang = 'pt-BR'; r.processLocally = true; r.maxAlternatives = 3;
        r.onresult = (e) => {
          const txt = (e.results[0][0].transcript || '').trim();
          const s = R.somInicial(txt);
          ok({ ok: s && s.chave === M.som.chave, txt });
        };
        r.onerror = () => ok(null); r.onend = () => ok(null);
        r.start(); setTimeout(() => { try { r.stop(); } catch (e) { /* */ } }, 3500);
      });
    } catch (e) { return null; }
  }

  /* 7 · CELEBRAÇÃO -------------------------------------------------------- */
  const MOEDAS_MISSAO = 10; // fixo e igual para todos: sem sorte, sem sorteio (Decisão 002)
  // SELO de conquista (Decisão 018): nível bronze → prata → ouro → diamante. Só com esforço, nunca sorte.
  const NIVEIS = { bronze: ['#D9A066', '#9A5B2B', 'BRONZE'], prata: ['#E3E9F0', '#8C99A8', 'PRATA'], ouro: ['#FFD067', '#C98A12', 'OURO'] };
  function seloSVG(titulo, simbolo, nivel = 'bronze', cls = 'emblema') {
    const [c1, c2, rot] = NIVEIS[nivel];
    const id = 'g' + Math.random().toString(36).slice(2, 7);
    return `<svg class="${cls}" viewBox="0 0 300 330" role="img" aria-label="Selo ${esc(titulo)}, nível ${rot.toLowerCase()}">
      <defs><radialGradient id="${id}" cx="40%" cy="35%"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></radialGradient></defs>
      <path d="M150 10 l30 22 l37 -2 l12 35 l31 20 l-11 35 l11 35 l-31 20 l-12 35 l-37 -2 l-30 22 l-30 -22 l-37 2 l-12 -35 l-31 -20 l11 -35 l-11 -35 l31 -20 l12 -35 l37 2z" fill="url(#${id})" stroke="${c2}" stroke-width="6"/>
      <circle cx="150" cy="140" r="92" fill="#1B3160" stroke="#A8D5F2" stroke-width="6"/>
      <path d="M86 92 q18 -24 36 -6 q-22 9 -36 6z M214 92 q-18 -24 -36 -6 q22 9 36 6z" fill="#3E9A63"/>
      <text x="150" y="178" text-anchor="middle" font-family="Andika,'Noto Color Emoji',sans-serif" font-weight="700" font-size="${simbolo.length > 2 ? 60 : 92}" fill="#fff">${esc(simbolo)}</text>
      <path d="M30 250 h240 l-16 26 l16 26 h-240 l16 -26z" fill="#F4B73C" stroke="#C98A12" stroke-width="5"/>
      <text x="150" y="285" text-anchor="middle" font-family="Fredoka,sans-serif" font-weight="700" font-size="${titulo.length > 14 ? 24 : 30}" fill="#1C2738">${esc(titulo.toUpperCase())}</text>
      <text x="150" y="214" text-anchor="middle" font-family="Fredoka,sans-serif" font-weight="700" font-size="17" fill="#F4B73C" letter-spacing="3">${rot}</text>
    </svg>`;
  }
  // Álbum de Selos: os conquistados + próximos (sem fim). Nenhum se compra.
  const ALBUM = [
    ['meu-nome', 'Selo Meu Nome', () => E.nome.charAt(0).toUpperCase()],
    ['professor', 'Aprovado pelo Professor', () => '✓'],
    ['explica', 'Me Explicou Certinho', () => '🎤'],
    ['som', 'Maestria do Som', () => (M ? M.info.letra : '?')],
    ['gentil', 'Leitura Gentil', () => '📖'],
    ['ambiente', 'Guarda do Meio Ambiente', () => '🌱']
  ];
  function albumHTML() {
    return `<div class="album" aria-label="Álbum de Selos">${ALBUM.map(([k, nm, sim]) => {
      const tem = E.emblemas.includes(k);
      const arte = tem && k === 'meu-nome' ? `<span class="selo-img"><img src="../recompensas-3d/recortes/selo-meu-nome.png" alt=""><b>${esc(sim())}</b></span>` : null;
      return `<div class="selo-mini ${tem ? 'tem' : ''}">${tem ? (arte || seloSVG(nm.replace('Selo ', ''), sim(), 'bronze', 'mini')) : '<span class="vago" aria-hidden="true">?</span>'}<small>${esc(nm)}${tem ? '' : ' · em breve'}</small></div>`;
    }).join('')}</div>`;
  }
  // PRÓXIMO OBJETIVO (Decisão 019; jogo-completo/07): nível da jornada e título, por esforço; nunca desce.
  // Após a 1ª missão: Nível 1 · Primeiros Sons I. Nível 2 pede 2 desafios; para Caça às Sílabas (D022)
  // são 2+3+4+5+6+6 = 26 desafios e vencer a Festa das Rimas (chefe de R0).
  const PROGRESSO = { nivel: 1, titulo: 'Primeiros Sons I', feitos: 0, proxNivel: 2, paraCaca: 26 };
  function proximoHTML() {
    const p = PROGRESSO;
    const bolinhas = Array.from({ length: p.proxNivel }, (_, i) => `<span class="bol ${i < p.feitos ? 'cheia' : ''}" aria-hidden="true"></span>`).join('');
    return `<div class="proximo" aria-label="Próximo objetivo">
      <p class="titulo-j"><strong>Nível ${p.nivel}</strong> · ${esc(p.titulo)}</p>
      <p class="prox-txt">Próximo objetivo: faltam <strong>${p.proxNivel - p.feitos} desafios</strong> para o nível ${p.nivel + 1}. <span class="bolinhas">${bolinhas}</span></p>
      <p class="regra-moeda">Rumo a <strong>Caça às Sílabas</strong>: faltam ${p.paraCaca} desafios e a Festa das Rimas. Nada se perde.</p>
    </div>`;
  }
  TELAS.celebra = (t) => {
    const primeira = !E.emblemas.includes('meu-nome');
    if (primeira) { E.moedas += MOEDAS_MISSAO; E.emblemas.push('meu-nome'); }
    E.resultado = Object.assign(E.resultado || {}, { som: M.som.chave, ipa: M.info.ipa, palavra: M.certa.palavra, erros: M.erros, fala: M.fala, minutos: Math.max(1, Math.round((Date.now() - M.inicio) / 60000)), data: new Date().toISOString().slice(0, 10) });
    salvar();
    const txt = `Você conseguiu, ${N}! Descobriu o primeiro som do seu nome, achou o ${M.certa.palavra}, montou as letras e falou em voz alta! Ganhou o Selo Meu Nome!`;
    t.innerHTML = `<div class="celebra">
      <div class="selo-palco" id="seloPalco"></div>
      <div style="display:flex;flex-direction:column;gap:16px">
        <h1>Selo “Meu Nome” · bronze!</h1>
        <div id="falaC"></div>
        <div class="cartao"><div class="ganho"><span class="rc-cofrinho" id="tatu"><img src="../recompensas-3d/recortes/cofrinho-tatu.png" alt="Cofrinho-tatu"></span><span>+${MOEDAS_MISSAO} moedinhas <small class="no-cofre">no cofrinho: <b id="cofreNum">${primeira ? E.moedas - MOEDAS_MISSAO : E.moedas}</b></small></span></div>
          <p class="regra-moeda">Toda missão completa vale ${MOEDAS_MISSAO} moedinhas. Sempre o mesmo valor, para todo mundo. Sem sorte, sem sorteio.</p></div>
        <div class="cartao"><h3 style="margin-bottom:8px">Meu Álbum de Selos</h3>${albumHTML()}${proximoHTML()}</div>
        <div class="acoes"><button class="btn ipe grande" id="bMostra">Mostra pro professor <span class="ic" aria-hidden="true">→</span></button></div>
      </div></div>`;
    const fc = $('#falaC'); fc.appendChild(fala(txt, 'sofia', 'joinha'));
    falar(ouv(txt), 'sofia');
    // selo 3D animado com a LETRA INICIAL do nome (../recompensas-3d/)
    const R = window.Recompensas, sp = $('#seloPalco');
    if (R) {
      const sel = R.selo({ arte: 'selo-meu-nome', letra: E.nome.charAt(0), nivel: 'bronze', tamanho: 330, rotulo: `Selo Meu Nome com a letra ${E.nome.charAt(0).toUpperCase()}, nível bronze` });
      sp.appendChild(sel);
      if (!E.prefs.calmo) R.entrar(sel); else sel.classList.add('parado');
      // moedinhas 3D voam do selo até o cofrinho-tatu; o contador sobe
      if (primeira) {
        let n = E.moedas - MOEDAS_MISSAO;
        const conta = () => { n++; if ($('#cofreNum')) $('#cofreNum').textContent = n; if ($('#tatu')) R.engolir($('#tatu')); $('#moedasNum').textContent = Math.max(n, +$('#moedasNum').textContent || 0); };
        if (E.prefs.calmo) { $('#cofreNum').textContent = E.moedas; } else setTimeout(() => { if (telaAtual === 'celebra' && $('#tatu')) R.moedasVoam({ de: sel, para: $('#tatu'), n: MOEDAS_MISSAO, aoChegar: conta }); else $('#moedasNum').textContent = E.moedas; }, 1300);
      }
    } else sp.innerHTML = seloSVG('Meu Nome', E.nome.charAt(0).toUpperCase(), 'bronze');
    atualizaTopo();
    if (primeira && window.Recompensas && !E.prefs.calmo) setTimeout(() => { if (telaAtual === 'celebra') $('#moedasNum').textContent = E.moedas - MOEDAS_MISSAO; }, 0); // o contador sobe quando as moedinhas chegam
    $('#bMostra').addEventListener('click', () => ir('mostra'));
  };

  /* 7b · "MOSTRA PRO PROFESSOR" (Decisão 018): a criança demonstra; o professor corrige em 1 toque */
  let demoURL = null; // gravação da criança: só na memória da aba
  TELAS.mostra = (t) => {
    const txt = `${N}, vamos mostrar para o professor! Toque no microfone e diga o seu nome e o primeiro som dele. Como em ${N}... ${M.certa.palavra}!`;
    t.innerHTML = `<div class="missao">
      <div class="sua-vez"><h1>Mostra pro professor!</h1></div>
      <div id="falaM"></div>
      <div class="mic-area">
        <button class="mic" id="bGravaDemo" aria-label="Gravar para o professor">🎤</button>
        <p class="sub" id="estDemo" aria-live="polite">Neste protótipo, a gravação fica só neste aparelho. No produto, vai apenas para o professor da turma.</p>
        <div class="acoes" style="justify-content:center">
          <button class="btn" id="bOuveDemo" disabled><span class="ic" aria-hidden="true">▶</span> Ouvir</button>
          <button class="btn" id="bAoVivo">Mostrei ao vivo</button>
          <button class="btn pri grande" id="bEnvia" disabled>Enviar para o professor <span class="ic" aria-hidden="true">→</span></button>
        </div>
      </div>
      <audio id="audDemo" hidden></audio>
    </div>`;
    $('#falaM').appendChild(fala(txt, 'tales', 'confiante'));
    falar(ouv(txt), 'tales');
    const est = $('#estDemo');
    $('#bGravaDemo').addEventListener('click', async () => {
      calar();
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const partes = []; const rec = new MediaRecorder(stream);
        rec.ondataavailable = (e) => e.data.size && partes.push(e.data);
        rec.onstop = () => {
          stream.getTracks().forEach((x) => x.stop());
          if (demoURL) URL.revokeObjectURL(demoURL);
          demoURL = URL.createObjectURL(new Blob(partes, { type: rec.mimeType || 'audio/webm' }));
          $('#audDemo').src = demoURL; $('#bOuveDemo').disabled = false; $('#bEnvia').disabled = false;
          $('#bGravaDemo').classList.remove('ouvindo');
          est.textContent = 'Pronto! Ouça, se quiser, e envie para o professor.';
        };
        rec.start(); $('#bGravaDemo').classList.add('ouvindo'); est.textContent = 'Gravando… pode falar!';
        setTimeout(() => rec.state === 'recording' && rec.stop(), 3000 * Math.max(RAPIDO, 0.5));
      } catch (e) {
        est.textContent = 'O microfone não está disponível. Mostre ao vivo para o professor e toque em “Mostrei ao vivo”.';
      }
    });
    $('#bOuveDemo').addEventListener('click', () => $('#audDemo').play().catch(() => {}));
    $('#bEnvia').addEventListener('click', () => { E.resultado = Object.assign(E.resultado || {}, { demo: 'gravada' }); ir('professor'); });
    $('#bAoVivo').addEventListener('click', () => { E.resultado = Object.assign(E.resultado || {}, { demo: 'ao vivo' }); ir('professor'); });
  };

  // Visão do professor (no produto: no celular do professor, em fila; aqui simulada no mesmo aparelho)
  TELAS.professor = (t) => {
    const r = E.resultado || {};
    t.innerHTML = `<div class="adulto">
      <aside class="lado">
        <span class="selo">Visão do professor</span>
        <h2>Correção em 1 toque</h2>
        <p>Fila da turma: 1 de 10 respostas. Sem resposta em 72 h, a plataforma confirma pelo próprio critério de domínio.</p>
        <img src="${PECAS}${BASES[E.avatar.base][0]}" alt="Avatar da criança" style="width:46%">
      </aside>
      <div class="cartao form">
        <div><h1>${esc(E.nome)} · Missão “Meu Nome”</h1><p class="sub">Demonstração: ${r.demo === 'gravada' ? 'áudio gravado' : 'mostrou ao vivo'} · som inicial ${esc(M.info.ipa)} (${esc(M.certa.palavra)}) · figura ${M.erros.figura ? 'com dica' : 'de primeira'} · letras ${M.erros.letras ? 'com dica' : 'sem ajuda'}</p></div>
        ${r.demo === 'gravada' && demoURL ? `<div class="grava"><button class="btn" id="bProfOuve"><span class="ic" aria-hidden="true">▶</span> Ouvir ${esc(E.nome)}</button></div><audio id="audProf" src="${demoURL}" hidden></audio>` : ''}
        <div class="prof-botoes" role="group" aria-label="Correção em um toque">
          <button class="btn verde grande" data-v="aprendeu">✓ Aprendeu!</button>
          <button class="btn grande" data-v="treinar">↺ Vamos treinar mais</button>
          <button class="btn ipe grande" data-v="explicou">🎤 Me explicou certinho</button>
        </div>
        <div id="parabens" aria-live="polite"></div>
      </div>
    </div>`;
    const ou = $('#bProfOuve'); ou && ou.addEventListener('click', () => $('#audProf').play().catch(() => {}));
    let feito = false;
    $$('.prof-botoes button', t).forEach((b) => b.addEventListener('click', async () => {
      if (feito) return; feito = true;
      $$('.prof-botoes button', t).forEach((x) => { x.disabled = x !== b; });
      const v = b.dataset.v;
      E.resultado.professor = v;
      const box = $('#parabens');
      let txt, selo = null;
      if (v === 'treinar') {
        txt = `${N}, o professor quer treinar mais com você. Que bom! Amanhã a gente pratica juntos, sem pressa.`;
      } else {
        selo = v === 'aprendeu' ? ['professor', 'Aprovado', '✓'] : ['explica', 'Explicou Certinho', '🎤'];
        if (!E.emblemas.includes(selo[0])) { E.emblemas.push(selo[0]); E.moedas += 5; }
        txt = v === 'aprendeu' ? `Parabéns, ${N}! O professor disse que você aprendeu o som do seu nome! Ganhou um selo especial!` : `Parabéns, ${N}! O professor disse que você explicou certinho! Ganhou um selo especial!`;
      }
      salvar();
      box.innerHTML = `<div class="parabens-box">${selo ? seloSVG(selo[1], selo[2], 'bronze', 'mini-g') : ''}<div style="flex:1"></div></div>`;
      $('.parabens-box > div', box).appendChild(fala(txt, 'sofia', v === 'treinar' ? 'confiante' : 'joinha'));
      if (selo) $('.parabens-box > div', box).insertAdjacentHTML('beforeend', '<p class="regra-moeda" style="margin-top:8px">+5 moedinhas pela validação do professor (valor fixo).</p>');
      box.insertAdjacentHTML('beforeend', '<div class="acoes" style="margin-top:12px"><button class="btn ipe grande" id="bDesp">Voltar para a vila →</button></div>');
      $('#bDesp').addEventListener('click', () => ir('despedida'));
      await falar(ouv(txt), 'sofia');
    }));
  };
  function chuvaMoedas() {
    const box = document.createElement('div'); box.className = 'chuva-moedas';
    const alvo = $('#moedas').getBoundingClientRect();
    for (let i = 0; i < 10; i++) {
      const m = document.createElement('span'); m.className = 'moeda';
      const x = innerWidth * (0.3 + 0.4 * ((i * 37) % 10) / 10), y = innerHeight * 0.55;
      m.style.left = x + 'px'; m.style.top = y + 'px';
      m.style.setProperty('--dx', alvo.left + 10 - x + 'px'); m.style.setProperty('--dy', alvo.top + 6 - y + 'px');
      m.style.animationDelay = i * 0.08 + 's';
      box.appendChild(m);
    }
    document.body.appendChild(box); setTimeout(() => box.remove(), 2600);
  }

  /* 8 · DESPEDIDA (ritual de fim: gancho para amanhã, sem botão "continuar jogando") */
  TELAS.despedida = (t) => {
    t.classList.add('cena');
    t.innerHTML = `<img class="fundo" src="${P3D}06-leitura-juntos-praca.png" alt="Sofia e Tales leem juntos num banco da praça, sob um ipê amarelo">
      <div class="veu"></div>
      <img class="av-vila" src="${PECAS}${BASES[E.avatar.base][0]}" alt="O seu personagem na praça">
      <div class="falas" id="falasD" aria-live="polite"></div>
      <div class="rodape"><button class="btn pri grande" id="bAdulto">Fim por hoje · chamar o adulto</button></div>`;
    dizer($('#falasD'), [
      [`Tchau, ${N}! Amanhã o Bolota quer descobrir o som do nome dele. Você ajuda?`, 'tales', 'alegre'],
      [G(`Até amanhã, ${N}! Fiquei muito feliz por você ter vindo. Dormir bem ajuda a lembrar do que a gente aprendeu.`,
         `Até amanhã, ${N}! Fiquei muito feliz por você ter vindo. Dormir bem ajuda a lembrar do que a gente aprendeu.`,
         `Até amanhã, ${N}! Que alegria brincar com você hoje. Dormir bem ajuda a lembrar do que a gente aprendeu.`), 'sofia', 'alegre']
    ]);
    $('#bAdulto').addEventListener('click', () => ir('paineis'));
  };

  /* 9 · O QUE A PLATAFORMA REGISTRA: família, professor, termômetro ------- */
  TELAS.paineis = (t) => {
    const r = E.resultado || { ipa: M.info.ipa, palavra: M.certa.palavra, erros: M.erros, fala: M.fala, minutos: 6 };
    const ini = E.nome.charAt(0).toUpperCase();
    const art = G(`o ${E.nome}`, `a ${E.nome}`, E.nome);
    const Art = G(`O ${E.nome}`, `A ${E.nome}`, E.nome);
    const dele = G('do nome dele', 'do nome dela', 'do próprio nome');
    const pal = r.palavra.toUpperCase();
    const msg = `📚 FONEMA · ${E.nome} hoje\n\nHoje ${art} fez a primeira missão: descobriu que ${G('o nome dele', 'o nome dela', 'o próprio nome')} começa com o som ${r.ipa}, igual a ${pal}. Montou as letras ${letrasNome().join('-')} e falou o som em voz alta. Ganhou o Selo “Meu Nome” (bronze) 🏅${E.resultado && E.resultado.professor === 'aprendeu' ? ' e o professor confirmou: aprendeu! ✓' : E.resultado && E.resultado.professor === 'explicou' ? ' e o professor disse que explicou certinho! 🎤' : ''}\n\n🏠 Em casa (2 min): brinquem de “Eu vejo uma coisa que começa com ${r.ipa}…”. Elogie o esforço: “Você tentou e conseguiu!”\n\n⏱️ Tempo de tela hoje: ${r.minutos} min.`;
    const statusFig = r.erros.figura === 0 ? ['ok', 'Acertou de primeira'] : ['rev', `A revisar (${r.erros.figura} tentativa${r.erros.figura > 1 ? 's' : ''} com dica)`];
    const statusLet = r.erros.letras === 0 ? ['ok', 'Montou sem ajuda'] : ['rev', `Com ajuda (${r.erros.letras} dica${r.erros.letras > 1 ? 's' : ''})`];
    const statusFala = r.fala && r.fala.ouviu ? ['ok', 'Falou (microfone ouviu)'] : ['novo', 'Tentou (registro “eu falei”)'];
    const geral = r.professor === 'treinar' ? ['rev', 'A revisar · professor pediu mais treino'] : (r.erros.figura === 0 && r.erros.letras <= 1) || r.professor ? ['ok', 'Em domínio · confirmar amanhã'] : ['rev', 'A revisar · volta amanhã no Jardim da Revisão'];
    t.innerHTML = `<div class="paineis">
      <div>
        <h2 style="margin-bottom:10px">O que a família recebe</h2>
        <div class="zap" aria-label="Exemplo de mensagem de WhatsApp para a família">
          <div class="cab-z"><i aria-hidden="true">📚</i><div><b>FONEMA</b><br><small>canal oficial da escola</small></div></div>
          <div class="msgs">
            <div class="msg">${esc(msg)}<span class="hora">18:42</span></div>
            <div class="msg audio-z"><span aria-hidden="true">▶</span><b></b><span>0:18</span><span class="hora">18:42</span></div>
            <div class="msg"><b>Resumo da semana</b> (toda sexta)\n• Termômetro: nível 0 → caminho do nível 1\n• Treinou: som inicial do nome\n• Missão da semana: sons do começo das palavras<span class="hora">18:43</span></div>
          </div>
        </div>
        <p class="sub" style="margin-top:8px">Mensagem com áudio para quem prefere ouvir. Sem ranking e sem comparação com outras crianças.</p>
      </div>
      <div class="col-d">
        <div class="cartao">
          <h2>Termômetro de leitura · 0 a 10</h2>
          <p class="sub">${esc(Art)} está no <b>nível 0 (Ponto de partida)</b>, a caminho do <b>nível 1 (Sons e vogais)</b>. Faltam 10 níveis para a alfabetização plena.</p>
          <div class="termo" aria-label="Nível 0 de 10, primeira habilidade do nível 1 treinada">${Array.from({ length: 11 }, (_, i) => `<div class="${i === 0 ? 'agora' : ''}" style="--p:${r.erros.figura === 0 ? 30 : 18}%">${i}</div>`).join('')}</div>
          <p class="sub" style="margin-top:8px">O nível só sobe com domínio comprovado (provinha + retenção depois de alguns dias), nunca por tempo de uso. E nunca desce na tela da criança.</p>
        </div>
        <div class="cartao">
          <h2>O que o professor vê</h2>
          <table class="tabela"><thead><tr><th>Habilidade (missão “Meu Nome”)</th><th>Hoje</th></tr></thead><tbody>
            <tr><td>Som inicial do próprio nome (${esc(r.ipa)}, letra ${esc(ini)})</td><td><span class="status ${statusFig[0]}">${statusFig[1]}</span></td></tr>
            <tr><td>Letras do nome na ordem</td><td><span class="status ${statusLet[0]}">${statusLet[1]}</span></td></tr>
            <tr><td>Produção oral do som</td><td><span class="status ${statusFala[0]}">${statusFala[1]}</span></td></tr>
            <tr><td>Mostra pro professor (validação em 1 toque)</td><td><span class="status ${r.professor === 'treinar' ? 'rev' : r.professor ? 'ok' : 'novo'}">${r.professor === 'aprendeu' ? '✓ Aprendeu!' : r.professor === 'explicou' ? '🎤 Me explicou certinho' : r.professor === 'treinar' ? '↺ Vamos treinar mais' : 'Aguardando (72 h)'}</span></td></tr>
            <tr><th>Situação</th><th><span class="status ${geral[0]}">${geral[1]}</span></th></tr>
          </tbody></table>
        </div>
        <div class="duas">
          <div class="cartao"><h3>Por que isso importa</h3><ul class="lista"><li>O próprio nome é a primeira palavra significativa.</li><li>Assiste e Faz: vídeo curto, depois ação (N2, N6).</li><li>Erro com dica, sem punição (N3).</li></ul></div>
          <div class="cartao"><h3>Privacidade</h3><ul class="lista"><li>Só o primeiro nome vai para a voz.</li><li>Gravação do adulto: apagada em 30 dias.</li><li>Neste protótipo: tudo fica no aparelho.</li></ul></div>
        </div>
        <div class="acoes"><button class="btn" id="bOutro">Cadastrar outra criança</button><button class="btn terra" id="bApagaTudo">Apagar todos os dados</button></div>
      </div></div>`;
    $('#bOutro').addEventListener('click', () => { reiniciar(false); });
    $('#bApagaTudo').addEventListener('click', () => reiniciar(true));
  };

  function reiniciar(tudo) {
    const prefs = E.prefs;
    if (tudo) try { localStorage.removeItem(CHAVE); } catch (e) { /* */ }
    Object.assign(E, { nome: '', genero: null, responsavel: false, consentNome: false, consentAudio: false, fonetica: null, foneticaFala: null, avatar: { base: 0, cantinho: 'mata' }, moedas: 0, emblemas: [], resultado: null, prefs });
    if (gravacaoURL) URL.revokeObjectURL(gravacaoURL); gravacaoURL = null;
    if (demoURL) URL.revokeObjectURL(demoURL); demoURL = null;
    salvar(); ir('cadastro');
  }

  /* ------------------------------ ajustes ------------------------------ */
  function aplicaPrefs() {
    document.body.classList.toggle('contraste', E.prefs.contraste);
    document.body.classList.toggle('calmo', E.prefs.calmo);
    $('#bSom').setAttribute('aria-pressed', E.prefs.som);
    $('#bSom span').textContent = E.prefs.som ? '🔊' : '🔈';
    $('#bContraste').setAttribute('aria-pressed', E.prefs.contraste);
    $('#bMov').setAttribute('aria-pressed', E.prefs.calmo);
  }
  $('#bSom').addEventListener('click', () => { E.prefs.som = !E.prefs.som; if (!E.prefs.som) calar(); aplicaPrefs(); salvar(); });
  $('#bContraste').addEventListener('click', () => { E.prefs.contraste = !E.prefs.contraste; aplicaPrefs(); salvar(); });
  $('#bMov').addEventListener('click', () => { E.prefs.calmo = !E.prefs.calmo; aplicaPrefs(); salvar(); });
  $('#bApagar').addEventListener('click', () => reiniciar(true));
  aplicaPrefs();

  // ganchos para testes automáticos (não usados pela interface)
  window.FONEMA = { ir, estado: E, missao: () => M, regras: R };

  const telaIni = params.get('tela');
  if (telaIni && TELAS[telaIni] && E.nome) { if (!E.foneticaFala) E.foneticaFala = E.nome; iniciaMissao(); ir(telaIni); } else ir('cadastro');
})();
