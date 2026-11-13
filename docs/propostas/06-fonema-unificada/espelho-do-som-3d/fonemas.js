/* FONEMA · Espelho do Som — tabela de posições articulatórias do português brasileiro.
 *
 * ⚠️ POSIÇÕES SIMPLIFICADAS — VALIDAR COM FONOAUDIÓLOGA antes de ir para o produto.
 * Referências fonéticas usadas para montar a tabela:
 *   - Thaïs Cristófaro Silva, "Fonética e Fonologia do Português" (Contexto), cap. de consoantes e vogais do PB;
 *   - Mattoso Câmara Jr., "Estrutura da Língua Portuguesa" (sistema de 7 vogais orais + nasalidade);
 *   - Barbosa & Albano (2004), "Brazilian Portuguese", Journal of the IPA, 34(2).
 *
 * Sistema de coordenadas (o mesmo no 3D e no SVG): corte do meio da cabeça, vista de lado,
 * rosto olhando para +z. Unidade ≈ 1 cm de uma criança. z = frente(+)/trás(−), y = cima(+)/baixo(−).
 * Origem = meio da boca, entre os lábios. Pontos de referência:
 *   ponta dos dentes de cima (−0.30, −0.05) · alvéolo (−0.80, 0.50) · céu da boca duro até (−3.8, 1.25)
 *   véu (céu mole) de (−3.8, 1.25) até a úvula · parede da garganta z = −5.25 · pregas vocais (−4.9, −4.2)
 *
 * Cada fonema define:
 *   jaw   abertura da mandíbula em graus (gira em torno da articulação, perto da orelha)
 *   lab   lábios: ab (abertura no meio), lg (meia-largura), arr (arredondado/projetado 0–1), ld (lábio de baixo nos dentes)
 *   lin   superfície de cima da língua, 6 pontos [z,y]: ponta, lâmina, frente do dorso, dorso, raiz alta, raiz baixa
 *   tj    quanto a língua acompanha a mandíbula (1 = toda; 0 = pontos absolutos, usado nos contatos)
 *   vel   véu: 0 = levantado (fecha o nariz), 1 = abaixado (ar e som passam pelo nariz)
 *   voz   pregas vocais vibram?  ar: 'oral' | 'nasal' | 'oral+nasal' | 'lateral' | 'nenhum'
 *   modo  'vogal' | 'plosiva' | 'fricativa' | 'nasal' | 'lateral' | 'tepe' | 'vibrante'
 *   larg  multiplicador da largura da frente da língua (lateral: lados baixos e estreitos)
 *   boca  quadro da Sofia de frente mais parecido (M, A, O, S) e se é exato ou aproximado
 *   zona  onde a língua (ou o lábio) encosta, para o exercício "Onde está a língua?"
 */
(function (global) {
  'use strict';

  // superfície de cima da língua em repouso (boca quase fechada)
  const REPOUSO = [[-0.62, -0.28], [-1.2, 0.02], [-2.1, 0.32], [-3.2, 0.42], [-4.35, -0.3], [-4.55, -1.6]];
  const LAB = (ab, lg, arr = 0, ld = 0) => ({ ab, lg, arr, ld });

  const F = {};
  const def = (id, o) => { F[id] = Object.assign({ id, jaw: 2, tj: 1, lab: LAB(0.25, 1.05), lin: REPOUSO, vel: 0, voz: true, ar: 'oral', modo: 'vogal', larg: 1 }, o); };

  /* ---------- VOGAIS ORAIS (7) ---------- */
  def('a', { ipa: 'a', letra: 'A', ex: 'abelha', fala: 'aaaa', jaw: 13, lab: LAB(1.0, 1.05),
    lin: [[-0.66, -0.36], [-1.3, -0.32], [-2.2, -0.24], [-3.3, 0.0], [-4.6, -0.5], [-4.75, -1.7]],
    t: { labios: 'bem abertos', lingua: 'baixa e no meio, ponta atrás dos dentes de baixo', contato: 'nenhum (o ar passa livre)' },
    boca: ['A', true], zona: 'baixo', dica: 'Boca bem aberta, a língua deitadinha lá embaixo: aaa.' });
  def('E', { ipa: 'ɛ', letra: 'É', ex: 'é, pé', fala: 'éééé', jaw: 9, lab: LAB(0.7, 1.12),
    lin: [[-0.62, -0.3], [-1.2, -0.04], [-2.0, 0.22], [-3.1, 0.16], [-4.35, -0.5], [-4.55, -1.7]],
    t: { labios: 'abertos, esticados', lingua: 'frente, meio-baixa', contato: 'nenhum' }, boca: ['A', false], zona: 'baixo',
    dica: 'Boca aberta, sorrindo um pouco: éééé.' });
  def('e', { ipa: 'e', letra: 'Ê', ex: 'elefante', fala: 'êêêê', jaw: 6, lab: LAB(0.45, 1.15),
    lin: [[-0.6, -0.28], [-1.15, 0.12], [-1.9, 0.56], [-3.0, 0.46], [-4.25, -0.42], [-4.45, -1.6]],
    t: { labios: 'meio abertos, sorriso pequeno', lingua: 'frente, meio-alta', contato: 'nenhum' }, boca: ['S', false], zona: 'baixo',
    dica: 'Sorriso pequeno, boca meio aberta: êêê.' });
  def('i', { ipa: 'i', letra: 'I', ex: 'ilha', fala: 'iiii', jaw: 3, lab: LAB(0.24, 1.32),
    lin: [[-0.6, -0.25], [-1.1, 0.32], [-1.8, 0.96], [-2.9, 0.86], [-4.05, -0.2], [-4.25, -1.5]],
    t: { labios: 'esticados (sorriso largo)', lingua: 'frente e alta, pertinho do céu da boca', contato: 'lados da língua nos dentes de cima' },
    boca: ['S', false], zona: 'baixo', dica: 'Sorriso bem largo, a língua sobe na frente: iii.' });
  def('O', { ipa: 'ɔ', letra: 'Ó', ex: 'óculos', fala: 'óóóó', jaw: 10, lab: LAB(0.78, 0.72, 0.55),
    lin: [[-0.8, -0.4], [-1.5, -0.36], [-2.4, -0.06], [-3.5, 0.42], [-4.62, -0.22], [-4.72, -1.6]],
    t: { labios: 'redondos e abertos', lingua: 'atrás, meio-baixa', contato: 'nenhum' }, boca: ['O', false], zona: 'baixo',
    dica: 'Boca redonda e aberta: óóó.' });
  def('o', { ipa: 'o', letra: 'Ô', ex: 'ovo', fala: 'ôôôô', jaw: 6, lab: LAB(0.5, 0.56, 0.85),
    lin: [[-0.85, -0.4], [-1.6, -0.3], [-2.5, 0.14], [-3.6, 0.76], [-4.62, 0.0], [-4.72, -1.5]],
    t: { labios: 'redondinhos', lingua: 'atrás, meio-alta', contato: 'nenhum' }, boca: ['O', true], zona: 'baixo',
    dica: 'Boca redondinha, como a letra O: ôôô.' });
  def('u', { ipa: 'u', letra: 'U', ex: 'uva', fala: 'uuuu', jaw: 3, lab: LAB(0.3, 0.4, 1),
    lin: [[-0.9, -0.4], [-1.7, -0.24], [-2.6, 0.3], [-3.7, 1.0], [-4.62, 0.3], [-4.72, -1.4]],
    t: { labios: 'biquinho bem projetado', lingua: 'atrás e alta, perto do véu', contato: 'nenhum' }, boca: ['O', false], zona: 'baixo',
    dica: 'Biquinho pequeno, como para assobiar: uuu.' });

  /* ---------- VOGAIS NASAIS: mesma boca + véu abaixado (ar e som também pelo nariz) ---------- */
  [['a', 'ã', 'âncora', 'ãããã'], ['e', 'ẽ', 'enfeite', 'ẽẽẽẽ'], ['i', 'ĩ', 'índio', 'ĩĩĩĩ'], ['o', 'õ', 'onça', 'õõõõ'], ['u', 'ũ', 'um', 'ũũũũ']].forEach(([b, ipa, ex, fala]) => {
    const o = F[b];
    def(b + '~', { ipa, letra: o.letra.replace(/[ÊÔ]/, (c) => (c === 'Ê' ? 'E' : 'O')), ex, fala, jaw: o.jaw, lab: o.lab, lin: o.lin, vel: 0.85, ar: 'oral+nasal',
      t: Object.assign({}, o.t, { contato: 'nenhum; o véu desce e o som sai também pelo nariz' }), boca: o.boca, zona: 'veu',
      dica: o.dica.replace(/:.*$/, ', e o som passa pelo nariz: ' + fala.slice(0, 3) + '.') });
  });

  /* ---------- CONSOANTES ---------- */
  const fechada = [[-0.62, -0.26], [-1.2, 0.05], [-2.1, 0.34], [-3.2, 0.42], [-4.35, -0.3], [-4.55, -1.6]];
  def('p', { ipa: 'p', letra: 'P', ex: 'pato', fala: 'pá', jaw: 1, lab: LAB(0, 1.0), lin: fechada, voz: false, modo: 'plosiva',
    t: { labios: 'fechados, depois abrem com um soprinho', lingua: 'descansando', contato: 'lábio com lábio' }, boca: ['M', true], zona: 'labios',
    dica: 'Lábios fechadinhos, depois abrem com um soprinho, sem vibrar: p!' });
  def('b', { ipa: 'b', letra: 'B', ex: 'bola', fala: 'bá', jaw: 1, lab: LAB(0, 1.0), lin: fechada, modo: 'plosiva',
    t: { labios: 'fechados, depois abrem', lingua: 'descansando', contato: 'lábio com lábio' }, boca: ['M', true], zona: 'labios',
    dica: 'Lábios fechadinhos, depois abrem, e a garganta vibra: b!' });
  def('m', { ipa: 'm', letra: 'M', ex: 'macaco', fala: 'mmmmm', jaw: 1, lab: LAB(0, 1.0), lin: fechada, vel: 1, ar: 'nasal', modo: 'nasal',
    t: { labios: 'fechados', lingua: 'descansando', contato: 'lábio com lábio' }, boca: ['M', true], zona: 'labios',
    dica: 'Lábios fechadinhos, e o som sai pelo nariz: mmm.' });
  def('f', { ipa: 'f', letra: 'F', ex: 'foca', fala: 'ffff', jaw: 1.5, lab: LAB(0.16, 1.06, 0, 1), lin: fechada, voz: false, modo: 'fricativa',
    t: { labios: 'lábio de baixo encosta nos dentes de cima', lingua: 'descansando', contato: 'lábio de baixo + dentes de cima' }, boca: ['S', false], zona: 'dentes',
    dica: 'Dentes de cima no lábio de baixo, o ar sai fininho: fff.' });
  def('v', { ipa: 'v', letra: 'V', ex: 'vaca', fala: 'vvvv', jaw: 1.5, lab: LAB(0.16, 1.06, 0, 1), lin: fechada, modo: 'fricativa',
    t: { labios: 'lábio de baixo encosta nos dentes de cima', lingua: 'descansando', contato: 'lábio de baixo + dentes de cima' }, boca: ['S', false], zona: 'dentes',
    dica: 'Dentes de cima no lábio de baixo, e a garganta vibra: vvv.' });

  const alveolar = [[-0.8, 0.5], [-1.3, 0.8], [-2.1, 0.78], [-3.2, 0.5], [-4.3, -0.3], [-4.5, -1.6]];
  def('t', { ipa: 't', letra: 'T', ex: 'tatu', fala: 'tá', jaw: 2, tj: 0, lab: LAB(0.25, 1.06), lin: alveolar, voz: false, modo: 'plosiva',
    t: { labios: 'entreabertos', lingua: 'ponta sobe', contato: 'ponta da língua atrás dos dentes de cima (alvéolo)' }, boca: ['S', false], zona: 'alveolo',
    dica: 'Ponta da língua atrás dos dentes de cima, um toquinho, sem vibrar: t!' });
  def('d', { ipa: 'd', letra: 'D', ex: 'dado', fala: 'dá', jaw: 2, tj: 0, lab: LAB(0.25, 1.06), lin: alveolar, modo: 'plosiva',
    t: { labios: 'entreabertos', lingua: 'ponta sobe', contato: 'ponta da língua atrás dos dentes de cima (alvéolo)' }, boca: ['S', false], zona: 'alveolo',
    dica: 'Ponta da língua atrás dos dentes de cima, um toquinho, e a garganta vibra: d!' });
  def('n', { ipa: 'n', letra: 'N', ex: 'navio', fala: 'nnnnn', jaw: 2, tj: 0, lab: LAB(0.25, 1.06), lin: alveolar, vel: 1, ar: 'nasal', modo: 'nasal',
    t: { labios: 'entreabertos', lingua: 'ponta sobe', contato: 'ponta da língua no alvéolo' }, boca: ['S', false], zona: 'alveolo',
    dica: 'Ponta da língua atrás dos dentes de cima, e o som sai pelo nariz: nnn.' });
  def('l', { ipa: 'l', letra: 'L', ex: 'lua', fala: 'llllá', jaw: 3, tj: 0, lab: LAB(0.32, 1.06), larg: 0.68, ar: 'lateral', modo: 'lateral',
    lin: [[-0.8, 0.5], [-1.3, 0.66], [-2.1, 0.36], [-3.2, 0.36], [-4.4, -0.4], [-4.55, -1.6]],
    t: { labios: 'entreabertos', lingua: 'ponta encosta, lados descem', contato: 'ponta da língua no alvéolo; o ar passa pelos lados' }, boca: ['S', false], zona: 'alveolo',
    dica: 'A ponta da língua encosta atrás dos dentes de cima, e o ar passa pelos ladinhos: lll.' });
  def('r', { ipa: 'ɾ', letra: 'R', ex: 'arara (r fraco)', fala: 'ará', jaw: 3, tj: 0, lab: LAB(0.32, 1.06), modo: 'tepe',
    lin: [[-0.95, 0.16], [-1.45, 0.5], [-2.2, 0.6], [-3.2, 0.42], [-4.35, -0.35], [-4.55, -1.6]],
    t: { labios: 'entreabertos', lingua: 'a ponta bate uma vez, rapidinho', contato: 'toque rápido da ponta no alvéolo' }, boca: ['S', false], zona: 'alveolo',
    dica: 'O "r" fraquinho de arara: a ponta da língua dá uma batidinha atrás dos dentes de cima.' });
  def('s', { ipa: 's', letra: 'S', ex: 'sapo', fala: 'ssss', jaw: 1.5, tj: 0, lab: LAB(0.18, 1.22), voz: false, modo: 'fricativa',
    lin: [[-0.72, 0.27], [-1.2, 0.64], [-2.0, 0.66], [-3.1, 0.48], [-4.3, -0.32], [-4.5, -1.6]],
    t: { labios: 'sorriso, dentes juntinhos', lingua: 'ponta perto do alvéolo, sem encostar', contato: 'quase: fica um caminho fininho para o ar' }, boca: ['S', true], zona: 'alveolo',
    dica: 'Dentes juntinhos, a ponta da língua pertinho, e o ar sai como uma cobrinha: sss.' });
  def('z', { ipa: 'z', letra: 'Z', ex: 'zebra', fala: 'zzzz', jaw: 1.5, tj: 0, lab: LAB(0.18, 1.22), modo: 'fricativa',
    lin: [[-0.72, 0.27], [-1.2, 0.64], [-2.0, 0.66], [-3.1, 0.48], [-4.3, -0.32], [-4.5, -1.6]],
    t: { labios: 'sorriso, dentes juntinhos', lingua: 'ponta perto do alvéolo, sem encostar', contato: 'quase: caminho fininho para o ar' }, boca: ['S', true], zona: 'alveolo',
    dica: 'Dentes juntinhos, como uma abelhinha, e a garganta vibra: zzz.' });
  const posAlv = [[-1.0, 0.36], [-1.5, 0.84], [-2.2, 0.96], [-3.2, 0.62], [-4.35, -0.3], [-4.55, -1.6]];
  def('x', { ipa: 'ʃ', letra: 'CH/X', ex: 'chuva', fala: 'xxxx', jaw: 2, tj: 0, lab: LAB(0.32, 0.66, 0.8), lin: posAlv, voz: false, modo: 'fricativa',
    t: { labios: 'biquinho', lingua: 'ponta mais para trás, lâmina perto do céu da boca', contato: 'quase, atrás do alvéolo' }, boca: ['O', false], zona: 'palato',
    dica: 'Boca em biquinho, a língua um pouco mais para trás, o ar sai como quem pede silêncio: xxx.' });
  def('j', { ipa: 'ʒ', letra: 'J', ex: 'jacaré', fala: 'jjjj', jaw: 2, tj: 0, lab: LAB(0.32, 0.66, 0.8), lin: posAlv, modo: 'fricativa',
    t: { labios: 'biquinho', lingua: 'ponta mais para trás, lâmina perto do céu da boca', contato: 'quase, atrás do alvéolo' }, boca: ['O', false], zona: 'palato',
    dica: 'Boca em biquinho, o ar passa e a garganta vibra: jjj.' });
  const velar = [[-0.65, -0.3], [-1.3, -0.08], [-2.3, 0.45], [-3.95, 1.16], [-4.6, 0.25], [-4.72, -1.5]];
  def('k', { ipa: 'k', letra: 'C/K', ex: 'casa', fala: 'cá', jaw: 4, tj: 0, lab: LAB(0.42, 1.05), lin: velar, voz: false, modo: 'plosiva',
    t: { labios: 'entreabertos', lingua: 'o fundo (dorso) sobe', contato: 'dorso da língua no véu (céu mole)' }, boca: ['A', false], zona: 'veu',
    dica: 'O fundo da língua sobe, encosta no céu mole e solta o ar de uma vez, sem vibrar: k!' });
  def('g', { ipa: 'g', letra: 'G', ex: 'gato', fala: 'gá', jaw: 4, tj: 0, lab: LAB(0.42, 1.05), lin: velar, modo: 'plosiva',
    t: { labios: 'entreabertos', lingua: 'o fundo (dorso) sobe', contato: 'dorso da língua no véu (céu mole)' }, boca: ['A', false], zona: 'veu',
    dica: 'O fundo da língua sobe e solta o ar, e a garganta vibra: g!' });
  def('rr', { ipa: 'ʁ', letra: 'RR', ex: 'rato, carro', fala: 'rrrá', jaw: 5, tj: 0.4, lab: LAB(0.45, 1.05), voz: false, modo: 'vibrante',
    lin: [[-0.66, -0.32], [-1.3, -0.22], [-2.3, 0.12], [-3.6, 0.62], [-4.82, 0.5], [-4.85, -1.4]],
    t: { labios: 'entreabertos', lingua: 'a raiz vai para trás, perto da úvula', contato: 'quase: o ar raspa no fundo da garganta' }, boca: ['A', false], zona: 'garganta',
    dica: 'O "rr" de rato: o som raspa lá no fundo da garganta, como um motorzinho. (Em muitos sotaques soa como um sopro raspado.)' });
  def('nh', { ipa: 'ɲ', letra: 'NH', ex: 'ninho', fala: 'nhá', jaw: 2, tj: 0, lab: LAB(0.25, 1.06), vel: 1, ar: 'nasal', modo: 'nasal',
    lin: [[-0.65, -0.24], [-1.2, 0.56], [-1.95, 1.24], [-3.0, 0.92], [-4.2, -0.22], [-4.45, -1.6]],
    t: { labios: 'entreabertos', lingua: 'o meio sobe; a ponta fica embaixo', contato: 'meio da língua no céu da boca duro' }, boca: ['S', false], zona: 'palato',
    dica: 'O meio da língua encosta no céu da boca, e o som sai pelo nariz: nh.' });
  def('lh', { ipa: 'ʎ', letra: 'LH', ex: 'palhaço', fala: 'lhá', jaw: 2, tj: 0, lab: LAB(0.25, 1.06), larg: 0.7, ar: 'lateral', modo: 'lateral',
    lin: [[-0.65, -0.22], [-1.2, 0.56], [-1.95, 1.24], [-3.0, 0.84], [-4.25, -0.3], [-4.45, -1.6]],
    t: { labios: 'entreabertos', lingua: 'o meio sobe; os lados descem', contato: 'meio da língua no céu da boca; o ar passa pelos lados' }, boca: ['S', false], zona: 'palato',
    dica: 'O meio da língua encosta no céu da boca, e o ar passa pelos ladinhos: lh.' });

  // nomes falados (para a criança) dos pontos do exercício "Onde está a língua?"
  const ZONAS = {
    labios: 'nos lábios', dentes: 'nos dentes de cima', alveolo: 'atrás dos dentes de cima', palato: 'no céu da boca',
    veu: 'no céu mole, lá no fundo', garganta: 'no fundo da garganta', baixo: 'deitada lá embaixo'
  };

  // grupos dos botões
  const GRUPOS = [
    ['Vogais', ['a', 'E', 'e', 'i', 'O', 'o', 'u']],
    ['Nasais', ['a~', 'e~', 'i~', 'o~', 'u~']],
    ['Lábios', ['p', 'b', 'm', 'f', 'v']],
    ['Ponta da língua', ['t', 'd', 'n', 'l', 'r', 's', 'z']],
    ['Meio e fundo', ['x', 'j', 'nh', 'lh', 'k', 'g', 'rr']]
  ];

  /* ---------- pose (parâmetros numéricos) e interpolação ---------- */
  function pose(id) {
    const f = F[id] || F.a;
    return { jaw: f.jaw, tj: f.tj, ab: f.lab.ab, lg: f.lab.lg, arr: f.lab.arr, ld: f.lab.ld, vel: f.vel, larg: f.larg,
      lin: f.lin.map((p) => p.slice()), voz: f.voz ? 1 : 0 };
  }
  const lerp = (a, b, t) => a + (b - a) * t;
  function mistura(a, b, t) {
    const o = {};
    for (const k in a) o[k] = k === 'lin' ? a.lin.map((p, i) => [lerp(p[0], b.lin[i][0], t), lerp(p[1], b.lin[i][1], t)]) : lerp(a[k], b[k], t);
    return o;
  }
  const suave = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

  // mandíbula: gira em torno da articulação (perto da orelha)
  const DOBRA = [-5.5, 1.6];
  function giraMand(p, graus) {
    const a = (graus * Math.PI) / 180, dz = p[0] - DOBRA[0], dy = p[1] - DOBRA[1];
    const c = Math.cos(a), s = Math.sin(a);
    return [DOBRA[0] + dz * c + dy * s, DOBRA[1] - dz * s + dy * c];
  }
  // céu da boca (linha do meio): z → y
  const CEU = [[-0.5, 0.12], [-0.8, 0.5], [-1.2, 0.95], [-2.0, 1.25], [-3.0, 1.32], [-3.8, 1.25]];
  function ceuY(z) {
    if (z >= CEU[0][0]) return CEU[0][1];
    for (let i = 1; i < CEU.length; i++) if (z >= CEU[i][0]) { const [z0, y0] = CEU[i - 1], [z1, y1] = CEU[i]; return lerp(y0, y1, (z - z0) / (z1 - z0)); }
    return CEU[CEU.length - 1][1];
  }

  // voz sintetizada só como SIMULAÇÃO; no produto: áudio gravado (fonoaudióloga / vozes oficiais da Sofia e do Tales)
  let vozPt = null;
  function achaVoz() {
    if (!('speechSynthesis' in global)) return null;
    const vs = speechSynthesis.getVoices();
    return vs.find((v) => /pt[-_]BR/i.test(v.lang)) || vs.find((v) => /^pt/i.test(v.lang)) || null;
  }
  if ('speechSynthesis' in global) { vozPt = achaVoz(); speechSynthesis.onvoiceschanged = () => { vozPt = achaVoz(); }; }
  function falar(texto, { lento = false, tom = 1.25 } = {}) {
    return new Promise((ok) => {
      if (!('speechSynthesis' in global) || global.ESPELHO_MUDO) return ok();
      try {
        speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(texto);
        u.lang = 'pt-BR'; if (vozPt) u.voice = vozPt; u.rate = lento ? 0.6 : 0.95; u.pitch = tom;
        u.onend = u.onerror = () => ok();
        speechSynthesis.speak(u);
        setTimeout(ok, 6000);
      } catch (e) { ok(); }
    });
  }

  global.FonemasPT = { F, GRUPOS, ZONAS, REPOUSO, CEU, DOBRA, pose, mistura, suave, giraMand, ceuY, falar };
})(typeof window !== 'undefined' ? window : globalThis);
