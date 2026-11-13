/* Demo das recompensas 3D: tudo dispara sozinho na primeira vez e pode ser repetido. */
(function () {
  'use strict';
  const R = window.Recompensas, $ = (s) => document.querySelector(s);
  const espera = (ms) => new Promise((r) => setTimeout(r, ms));
  const q = new URLSearchParams(location.search);
  if (q.has('mudo')) window.RECOMPENSAS_MUDO = true;
  if (q.get('nome')) $('#iNome').value = q.get('nome');
  const letra = () => ($('#iNome').value.trim()[0] || 'A').toUpperCase();

  // 1. selo "Meu Nome" com a letra inicial do nome
  let seloNome = null;
  function montaSelo(animar = true) {
    $('#cenaSelo').innerHTML = '';
    seloNome = R.selo({ arte: 'selo-meu-nome', letra: letra(), nivel: 'bronze', tamanho: 340, rotulo: `Selo Meu Nome com a letra ${letra()}, nível bronze` });
    $('#cenaSelo').appendChild(seloNome);
    if (animar) R.entrar(seloNome);
  }
  $('#iNome').addEventListener('input', () => montaSelo(true));

  // 2. níveis: bronze → prata → ouro → diamante (D018), arte do Guardião do Meio Ambiente
  const NIV = ['bronze', 'prata', 'ouro', 'diamante']; let iN = 0;
  const seloNivel = R.selo({ arte: 'guardiao-bronze', nivel: 'bronze', tamanho: 190 });
  $('#cenaNivel').appendChild(seloNivel);
  function subir() { iN = (iN + 1) % NIV.length; R.subirNivel(seloNivel, NIV[iN], 'guardiao-' + NIV[iN]); $('#nivelTxt').textContent = NIV.slice(0, iN + 1).join(' → '); }

  // 3. moedinhas voam da pilha ao cofrinho-tatu; o contador sobe
  let moedas = 20;
  function voar() {
    return R.moedasVoam({ de: $('#pilha'), para: $('#tatu'), n: 10, aoChegar: () => { R.engolir($('#tatu')); R.contar($('#num'), moedas, moedas + 1, 160); moedas++; } });
  }
  // 6. coleção com inclinação 3D pelo ponteiro
  const COL = ['mestre-do-som', 'cacador-de-silabas', 'amigo-que-inclui', 'leitor-gentil', 'cuidador-dos-animais', 'craque-do-fair-play'];
  $('#colecao').innerHTML = COL.map((a, i) => `<figure style="--i:${i}"><img src="recortes/${a}.png" alt="Selo ${a.replace(/-/g, ' ')}"></figure>`).join('');
  document.querySelectorAll('#colecao figure').forEach((f) => {
    f.addEventListener('pointermove', (e) => { const r = f.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5; f.style.transform = `rotateY(${x * 40}deg) rotateX(${-y * 40}deg) scale(1.08)`; });
    f.addEventListener('pointerleave', () => { f.style.transform = ''; });
  });

  document.querySelectorAll('[data-de-novo]').forEach((b) => b.addEventListener('click', () => ({
    selo: () => montaSelo(true), nivel: subir, moedas: voar, bau: () => R.abrirBau($('#bau')), trofeu: () => R.trofeu($('#trofeu'))
  })[b.dataset.deNovo]()));
  $('#bMudo').addEventListener('click', (e) => { window.RECOMPENSAS_MUDO = !window.RECOMPENSAS_MUDO; e.currentTarget.setAttribute('aria-pressed', window.RECOMPENSAS_MUDO); e.currentTarget.textContent = window.RECOMPENSAS_MUDO ? '🔇 Som' : '🔊 Som'; });

  async function tudo() {
    montaSelo(true); await espera(1700);
    voar(); await espera(1500);
    subir(); await espera(1300); R.abrirBau($('#bau')); await espera(1300); R.trofeu($('#trofeu'));
  }
  $('#bTudo').addEventListener('click', tudo);
  montaSelo(false);
  if (!q.has('parado')) setTimeout(tudo, 400);
  window.DEMO_RC = { montaSelo, subir, voar, tudo };
})();
