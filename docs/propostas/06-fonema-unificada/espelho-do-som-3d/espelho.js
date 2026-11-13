/* FONEMA · Espelho do Som — carregador.
 * EspelhoSom.criar(div, { fonema, modo }) → Promise<api>
 * Tenta a versão 3D (Three.js, módulo ES); se não houver WebGL, ou se a página foi aberta direto do disco
 * (file://, onde o navegador bloqueia módulos), usa a versão 2D em SVG com as mesmas posições.
 * A página precisa de um importmap com "three" e "three/addons/" (ver demo.html) para o 3D.
 */
(function (global) {
  'use strict';
  const BASE = (document.currentScript && document.currentScript.src.replace(/[^/]*$/, '')) || './';
  function temWebGL() {
    try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch (e) { return false; }
  }
  async function criar(container, opts = {}) {
    container.classList.add('esp-palco');
    if (!opts.forcar2D && temWebGL() && location.protocol !== 'file:') {
      try {
        const m = await import(BASE + 'espelho3d.js');
        const api = m.criar(container, opts);
        container.classList.add('esp-3d');
        return api;
      } catch (e) { console.warn('Espelho do Som: 3D indisponível, usando 2D.', e); container.innerHTML = ''; }
    }
    container.classList.add('esp-2d');
    return global.EspelhoSVG.criar(container, opts);
  }
  // quadro da Sofia de frente mais parecido para cada fonema (M, A, O, S) e o centro da boca em cada quadro (%)
  const SOFIA = { M: [25.8, 28.4], A: [75.1, 29.3], O: [25.8, 79.2], S: [75.1, 78.8] };
  global.EspelhoSom = { criar, BASE, SOFIA };
})(window);
