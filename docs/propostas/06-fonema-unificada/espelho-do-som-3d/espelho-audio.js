/* FONEMA · Espelho do Som — ÁUDIO do botão "Ouvir".
 *
 * NÃO usa speechSynthesis. Toca só os mp3 das VOZES OFICIAIS (Sofia e Tales) já gerados pelo app
 * (app/web/public/audio/falas/ + manifesto.json, chave "quem|texto" → arquivo). Se não existe fala gravada
 * para o som, não toca nada (tem(id) === false: esconda ou desabilite o botão).
 *
 *   const au = EspelhoAudio.criar({ audioBase: '/audio/falas/' });
 *   au.tem('m')  →  true        au.tocar('m', 'sofia')  →  Promise<boolean>
 *
 * audioBase: pasta (relativa à página ou absoluta) onde ficam manifesto.json e os mp3.
 * O manifesto é lido uma vez; sem ele (ex.: file://) vale a tabela embutida abaixo.
 */
(function (global) {
  'use strict';
  const P = global.FonemasPT;
  // falas gravadas que dizem e explicam cada som: [quem, texto (chave do manifesto), arquivo conhecido]
  const FALAS = {
    a: [['sofia', '/aaaa/. Boca bem aberta, como um bocejo. Sua vez,', 'sofia-1anpdp5.mp3'], ['tales', 'A letra A faz /aaaa/!', 'tales-4fvqc.mp3']],
    E: [['tales', 'PÉ: o sorriso abre. Ééé.', 'tales-1208k4u.mp3']],
    e: [['sofia', 'VOCÊ: o sorriso fecha um pouquinho. Êêê.', 'sofia-nozyqa.mp3']],
    i: [['sofia', '/iiii/, um sorriso grande. Sua vez,', 'sofia-n7w6f5.mp3']],
    O: [['sofia', 'VOVÓ: a boca abre mais. Óóó.', 'sofia-1o64pg2.mp3']],
    o: [['tales', 'VOVÔ: a boca fecha mais, redondinha. Ôôô.', 'tales-nhro9y.mp3']],
    u: [['tales', '/uuuu/, biquinho de assobio. Sua vez,', 'tales-lm240i.mp3']],
    m: [['sofia', 'Lábios fechados, o som sai pelo nariz: /mmmm/. Sua vez,', 'sofia-g33wjr.mp3'], ['tales', 'M faz /mmmm/!', 'tales-kl8qjr.mp3']],
    f: [['sofia', '/ffff/, um ventinho. Dentes de cima no lábio de baixo. Sua vez,', 'sofia-102u0ga.mp3']],
    l: [['tales', '/llll/, a língua sobe e fica lá. Sua vez,', 'tales-1n03vx1.mp3']],
    s: [['sofia', 'Primeiro a gente escuta: /ssss/. Dentinhos quase fechados, língua escondida. Agora é a sua vez,', 'sofia-czkobd.mp3']]
  };

  function criar({ audioBase = '', manifesto = 'manifesto.json' } = {}) {
    const base = audioBase && !/\/$/.test(audioBase) ? audioBase + '/' : audioBase;
    let mapa = null, tocando = null;
    const pronto = (typeof fetch === 'function' ? fetch(base + manifesto).then((r) => (r.ok ? r.json() : null)).catch(() => null) : Promise.resolve(null))
      .then((m) => { mapa = m; return m; });
    // candidatas de um som: primeiro quem está na tela; depois a outra voz
    function candidatas(id, quem) {
      const f = P && P.F[id], lista = (FALAS[id] || []).slice();
      if (f && mapa) { // falas do tipo "M, de macaco" (quando o app gerar) entram sozinhas pelo manifesto
        const ex = f.ex.split(/[,(]/)[0].trim(), L = f.letra.split('/')[0];
        for (const q of ['sofia', 'tales']) for (const t of [`${L}, de ${ex}.`, `${L}, de ${ex}`, `${L} de ${ex}.`, `${L}, de ${ex}!`]) if (mapa[`${q}|${t}`]) lista.unshift([q, t, mapa[`${q}|${t}`]]);
      }
      return lista.sort((a, b) => (a[0] === quem ? 0 : 1) - (b[0] === quem ? 0 : 1));
    }
    function arquivo(id, quem) {
      const c = candidatas(id, quem)[0]; if (!c) return null;
      return { quem: c[0], texto: c[1], url: base + ((mapa && mapa[`${c[0]}|${c[1]}`]) || c[2]) };
    }
    function parar() { if (tocando) { try { tocando.pause(); } catch (e) { /* nada */ } tocando = null; } }
    function tocar(id, quem = 'sofia', { lento = false } = {}) {
      parar();
      const a = arquivo(id, quem);
      if (!a || typeof Audio === 'undefined') return Promise.resolve(false);
      return new Promise((ok) => {
        const el = new Audio(a.url); tocando = el; el.playbackRate = lento ? 0.8 : 1;
        el.onended = () => ok(true); el.onerror = () => ok(false);
        const p = el.play(); if (p && p.catch) p.catch(() => ok(false));
      });
    }
    // uma fala qualquer das vozes oficiais (texto exato do manifesto; arq = arquivo conhecido, se o manifesto não carregar)
    function fala(quem, texto, arq) {
      parar(); const nome = (mapa && mapa[`${quem}|${texto}`]) || arq; if (!nome || typeof Audio === 'undefined') return Promise.resolve(false);
      return new Promise((ok) => { const el = new Audio(base + nome); tocando = el; el.onended = () => ok(true); el.onerror = () => ok(false); const p = el.play(); if (p && p.catch) p.catch(() => ok(false)); });
    }
    return { pronto, fala, tem: (id) => !!(FALAS[id] || []).length || candidatas(id).length > 0, arquivo, tocar, parar };
  }
  global.EspelhoAudio = { criar, FALAS };
})(window);
