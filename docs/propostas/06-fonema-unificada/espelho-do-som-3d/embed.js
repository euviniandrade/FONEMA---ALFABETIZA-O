/* FONEMA · Espelho do Som — COMPONENTE EMBUTÍVEL (entrada única para o app).
 *
 * Em iframe:  embed.html?f=m&vista=frente|lado&quem=sofia|tales&compacto=1&audioBase=/audio/falas/
 *   mensagens que o iframe ACEITA (window.postMessage):
 *     { tipo: 'espelho:fonema', f: 'l' }      { tipo: 'espelho:vista', vista: 'lado' }
 *     { tipo: 'espelho:quem', quem: 'tales' } { tipo: 'espelho:lento', lento: true }
 *     { tipo: 'espelho:rotulos', rotulos: false }   { tipo: 'espelho:ouvir' }
 *   mensagens que o iframe ENVIA ao app (parent.postMessage):
 *     { tipo: 'espelho:pronto', fonemas: [...] }   { tipo: 'espelho:mudou', f, vista, quem }
 *     { tipo: 'espelho:audio', f, tocou: true|false }
 * Direto na página (sem iframe): carregue fonemas.js, espelho-frente.js, espelho-lado.js, espelho-audio.js,
 * embed.js e espelho.css, e chame  const e = EspelhoDoSom.montar(div, { fonema: 'm', vista: 'frente' }).
 *
 * Fonemas (ids de fonemas.js): a E(é) e(ê) i O(ó) o(ô) u · a~ e~ i~ o~ u~ · p b m f v · t d n l r s z ·
 * x(ch) j nh lh k g rr. Também aceita apelidos: ch, c, q, é, ê, ó, ô, ã, õ e letras maiúsculas (M → m).
 * Sem dependências externas; todos os caminhos são relativos a este arquivo.
 */
(function (global) {
  'use strict';
  const P = global.FonemasPT;
  const APELIDOS = { ch: 'x', c: 'k', q: 'k', 'é': 'E', 'ê': 'e', 'ó': 'O', 'ô': 'o', 'ã': 'a~', 'õ': 'o~', an: 'a~', on: 'o~', 'r-forte': 'rr', 'c/k': 'k', 'ch/x': 'x' };
  function idFonema(f) {
    if (f == null) return null; f = String(f).trim();
    if (P.F[f]) return f;
    const m = f.toLowerCase();
    return P.F[APELIDOS[m]] ? APELIDOS[m] : P.F[m] ? m : null;
  }

  function montar(el, o = {}) {
    let f = idFonema(o.fonema) || 'a', vista = o.vista === 'lado' ? 'lado' : 'frente', quem = o.quem === 'tales' ? 'tales' : 'sofia';
    let lento = !!o.lento, rot = o.rotulos === undefined ? !o.compacto : !!o.rotulos;
    const aoMudar = o.aoMudar || (() => {});
    el.innerHTML = `<div class="eds${o.compacto ? ' compacto' : ''}">
      <div class="eds-palco">
        <div class="eds-v" data-v="frente"></div><div class="eds-v" data-v="lado"></div>
        <div class="eds-troca" role="group" aria-label="Como olhar a boca"><button type="button" data-vista="frente">De frente</button><button type="button" data-vista="lado">De lado</button></div>
        <div class="eds-troca dir" role="group" aria-label="Quem mostra"><button type="button" data-quem="sofia">Sofia</button><button type="button" data-quem="tales">Tales</button></div>
        <p class="eds-aviso" role="note">posições simplificadas — validar com fonoaudióloga</p>
      </div>
      <div class="eds-barra"><button type="button" class="eds-ouvir">🔊 Ouvir</button><button type="button" class="eds-lento" aria-pressed="false">🐢 Câmera lenta</button><button type="button" class="eds-nomes" aria-pressed="false">🏷️ Nomes</button></div>
    </div>`;
    const $ = (s) => el.querySelector(s), $$ = (s) => [...el.querySelectorAll(s)];
    const audio = global.EspelhoAudio ? global.EspelhoAudio.criar({ audioBase: o.audioBase || '' }) : null;
    const vistas = {};
    function vistaDe(v) { // cria cada vista só quando ela aparece (as imagens são carregadas sob demanda)
      if (!vistas[v]) {
        vistas[v] = v === 'lado' ? global.EspelhoLado.criar($('.eds-v[data-v=lado]'), { fonema: f, quem, rotulos: rot, viewBox: o.viewBoxLado })
          : global.EspelhoFrente.criar($('.eds-v[data-v=frente]'), { fonema: f, viewBox: o.viewBoxFrente });
        vistas[v].fonema(f, { instantaneo: true }); vistas[v].lento(lento);
      }
      return vistas[v];
    }
    function pinta() {
      vistaDe(vista);
      $$('.eds-v').forEach((d) => d.classList.toggle('on', d.dataset.v === vista));
      $$('[data-vista]').forEach((b) => b.setAttribute('aria-pressed', b.dataset.vista === vista));
      $$('[data-quem]').forEach((b) => b.setAttribute('aria-pressed', b.dataset.quem === quem));
      $('.eds-troca.dir').style.display = vista === 'lado' ? '' : 'none';
      $('.eds-nomes').style.display = vista === 'lado' ? '' : 'none';
      $('.eds-nomes').setAttribute('aria-pressed', rot); $('.eds-lento').setAttribute('aria-pressed', lento);
      const tem = !!(audio && audio.tem(f)); $('.eds-ouvir').disabled = !tem;
    }
    const avisa = () => aoMudar({ f, vista, quem });
    const api = {
      fonema(n, op) { const id = idFonema(n); if (!id) return false; f = id; Object.values(vistas).forEach((v) => v.fonema(id, op)); pinta(); avisa(); return true; },
      vista(v) { if (v !== 'frente' && v !== 'lado') return; vista = v; pinta(); avisa(); },
      quem(q) { if (q !== 'sofia' && q !== 'tales') return; quem = q; if (vistas.lado) vistas.lado.quem(q); pinta(); avisa(); },
      lento(v) { lento = !!v; Object.values(vistas).forEach((x) => x.lento(lento)); pinta(); },
      rotulos(v) { rot = !!v; if (vistas.lado) vistas.lado.rotulos(rot); pinta(); },
      ouvir() { return audio ? audio.tocar(f, quem, { lento }) : Promise.resolve(false); },
      temAudio: (n) => !!(audio && audio.tem(idFonema(n) || f)),
      estado: () => ({ f, vista, quem, lento, rotulos: rot }),
      vistas, audio,
      destruir() { Object.values(vistas).forEach((v) => v.destruir()); if (audio) audio.parar(); el.innerHTML = ''; }
    };
    $$('[data-vista]').forEach((b) => b.addEventListener('click', () => api.vista(b.dataset.vista)));
    $$('[data-quem]').forEach((b) => b.addEventListener('click', () => api.quem(b.dataset.quem)));
    $('.eds-ouvir').addEventListener('click', () => api.ouvir());
    $('.eds-lento').addEventListener('click', () => api.lento(!lento));
    $('.eds-nomes').addEventListener('click', () => api.rotulos(!rot));
    pinta();
    if (audio) audio.pronto.then(pinta);
    return api;
  }

  // liga o componente às mensagens do app (usado por embed.html)
  function ligarMensagens(api, alvo = global.parent) {
    const manda = (m) => { if (alvo && alvo !== global) { try { alvo.postMessage(m, '*'); } catch (e) { /* nada */ } } };
    global.addEventListener('message', (ev) => {
      const m = ev.data; if (!m || typeof m !== 'object' || typeof m.tipo !== 'string' || m.tipo.indexOf('espelho:') !== 0) return;
      if (m.tipo === 'espelho:fonema') api.fonema(m.f !== undefined ? m.f : m.fonema);
      else if (m.tipo === 'espelho:vista') api.vista(m.vista);
      else if (m.tipo === 'espelho:quem') api.quem(m.quem);
      else if (m.tipo === 'espelho:lento') api.lento(m.lento);
      else if (m.tipo === 'espelho:rotulos') api.rotulos(m.rotulos);
      else if (m.tipo === 'espelho:ouvir') { const f = api.estado().f; api.ouvir().then((tocou) => manda({ tipo: 'espelho:audio', f, tocou })); }
    });
    return manda;
  }
  global.EspelhoDoSom = { montar, ligarMensagens, idFonema };
})(window);
