// FONEMA · capturas do painel do adulto (D030) em app/docs/capturas/v5-painel-*.png.
// Uso:  node web/e2e/capturas-painel.mjs   (faz o próprio build numa pasta separada e sobe o servidor na porta 4191,
// para não disputar web/dist nem a porta dos outros testes). Com BASE_URL definido, usa o servidor indicado.
// Grava direto no banco do aparelho três crianças: uma com trocas e alerta, uma indo bem e uma com dados antigos (versão 1).
import { chromium } from '@playwright/test';
import { spawn, spawnSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const aqui = dirname(fileURLToPath(import.meta.url));
const DIR = resolve(aqui, '../../docs/capturas');
const EXEC = process.env.CHROMIUM ?? '/opt/pw-browsers/chromium';
const PORTA = 4191;
const SAIDA = process.env.DIST_PAINEL ?? resolve(tmpdir(), 'fonema-dist-painel');
const VITE = resolve(aqui, '../../node_modules/vite/bin/vite.js');
let BASE = process.env.BASE_URL;
let servidor;

const DIA = 86400000;
const AGORA = Date.now();

const crianca = (id, nome, genero, ano) => ({
  id, nome, genero, anoNascimento: ano,
  pronuncia: { grafia: nome, fala: nome, rate: 1, pitchExtra: 0, voz: 'sofia' },
  avatar: { versao: 2, cantinho: 'ceu', corCabelo: 'preto', acessibilidade: [], pronto: true, pele: 'pele-06', rosto: 'redondo', olhos: 'castanho-escuro', cabelo: genero === 'f' ? 'f-cacheado' : 'm-liso', camisa: 'uniforme', calca: 'uniforme', calcado: 'tenis-branco' },
  apoios: { previsivel: false, focoCurto: false, leituraReforco: false, calmo: false },
  jaSabe: { letrasDoNome: 'nao-sei', lePalavras: 'nao-sei', leFrases: 'nao-sei' },
  consentimentos: { responsavel: true, vozPrimeiroNome: true, gravarVozAdulto: false, em: 1 },
  rotina: { minutosDia: 15, horaDormir: '20:00' }, criadoEm: AGORA - 40 * DIA
});
const CRIANCAS = [crianca('cap-p-ana', 'Ana', 'f', 2019), crianca('cap-p-davi', 'Davi', 'm', 2019), crianca('cap-p-lia', 'Lia', 'f', 2020)];

let relogio = 0;
const t = (habilidade, sessao, dia, extra) => ({ em: AGORA - dia * DIA + relogio++ * 1000, sessao, habilidade, acertou: true, mecanica: 'escolher', tipo: 'avaliada', ...extra });
const certo = (h, alvo, s, d, ms = 2600) => t(h, s, d, { alvo, escolhido: alvo, respostas: [alvo], tentativaNumero: 1, tempoMs: ms });
const troca = (h, alvo, esc, s, d, ms = 7400) => t(h, s, d, { comAjuda: true, alvo, escolhido: esc, respostas: [esc, alvo], distratores: [esc], tentativaNumero: 2, tempoMs: ms });
const expo = (h, s, d, mecanica) => t(h, s, d, { mecanica, tipo: mecanica === 'falar' ? 'autorrelato' : 'exposicao' });

/** Tentativas de cada criança (por habilidade). */
const HIST = {
  // Ana: troca P/B e B/D, erra em leitura duas sessões seguidas, palavras difíceis
  'cap-p-ana': [
    ...['s1', 's2', 's3'].flatMap((s, i) => [troca('letra-p', 'P', 'B', s, 9 - i), troca('letra-b', 'B', 'P', s, 9 - i), certo('letra-p', 'P', s, 9 - i), expo('letra-p', s, 9 - i, 'letra'), expo('letra-p', s, 9 - i, 'tracar')]),
    troca('letra-b', 'B', 'D', 's2', 8), troca('letra-b', 'B', 'D', 's3', 7), troca('letra-d', 'D', 'B', 's3', 7),
    ...['s1', 's2'].flatMap((s, i) => Array.from({ length: 5 }, () => certo('letra-a', 'A', s, 9 - i, 1900))),
    ...['s4', 's5'].flatMap((s, i) => [
      t('leitura-cvcv', s, 3 - i, { acertou: false, alvo: 'MALA', escolhido: 'LAMA', respostas: ['LAMA', 'FALA'], categoria: 'palavra', tempoMs: 11800 }),
      t('leitura-cvcv', s, 3 - i, { acertou: false, alvo: 'FILA', escolhido: 'FALA', respostas: ['FALA'], categoria: 'palavra', tempoMs: 10300 }),
      t('leitura-cvcv', s, 3 - i, { alvo: 'LUA', escolhido: 'LUA', respostas: ['LUA'], categoria: 'palavra', tempoMs: 6200 }),
      t('escrita-cvcv', s, 3 - i, { mecanica: 'ditado', comAjuda: true, alvo: 'MALA', escolhido: 'MLA', respostas: ['MLA', 'MALA'], categoria: 'palavra', tempoMs: 15400 }),
      expo('leitura-cvcv', s, 3 - i, 'falar')
    ]),
    t('leitura-cvcv', 's5', 2, { acertou: false, pseudo: true, alvo: 'FOLU', escolhido: 'FALU', respostas: ['FALU'], categoria: 'pseudopalavra', tempoMs: 12900 })
  ],
  // Davi: indo bem, sem alerta
  'cap-p-davi': [
    ...['a', 'b', 'c', 'd', 'e'].flatMap((l) => ['s1', 's2'].flatMap((s, i) => Array.from({ length: 5 }, () => certo(`letra-${l}`, l.toUpperCase(), s, 6 - i, 2100)))),
    troca('letra-e', 'E', 'I', 's2', 5), expo('letra-a', 's1', 6, 'espelho'), expo('letra-a', 's1', 6, 'tracar')
  ]
};

async function subir() {
  if (BASE) return;
  console.log('· build em', SAIDA);
  const b = spawnSync(process.execPath, [VITE, 'build', '--outDir', SAIDA, '--emptyOutDir', '--logLevel', 'error'], { cwd: resolve(aqui, '..'), stdio: 'inherit' });
  if (b.status !== 0) throw new Error('build falhou');
  servidor = spawn(process.execPath, [VITE, 'preview', '--outDir', SAIDA, '--port', String(PORTA), '--strictPort'], { cwd: resolve(aqui, '..'), stdio: 'ignore' });
  BASE = `http://localhost:${PORTA}/`;
  for (let i = 0; i < 80; i++) {
    try { if ((await fetch(BASE)).ok) return; } catch { /* esperando */ }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error('servidor de preview não subiu');
}

async function semear(page) {
  await page.goto(BASE + '#/');
  await page.waitForTimeout(700);
  await page.evaluate(async (lista) => {
    const db = await new Promise((ok, erro) => { const r = indexedDB.open('fonema'); r.onsuccess = () => ok(r.result); r.onerror = () => erro(r.error); });
    const tx = db.transaction(['criancas'], 'readwrite');
    for (const c of lista) tx.objectStore('criancas').put(c);
    await new Promise((ok) => { tx.oncomplete = ok; });
    db.close();
  }, CRIANCAS);
  // o app cria o progresso de cada criança ao abrir a vila dela
  for (const c of CRIANCAS) { await page.goto(`${BASE}#/c/${c.id}/vila`); await page.waitForTimeout(900); }
  await page.evaluate(async ({ hist, agora, dia }) => {
    const BKT = (p, ok, ajuda) => { const c = (p * 0.9) / (p * 0.9 + (1 - p) * 0.25), e = (p * 0.1) / (p * 0.1 + (1 - p) * 0.75); const post = ok && !ajuda ? c : ok ? (c + e) / 2 : e; return Math.min(0.999, post + (1 - post) * 0.2); };
    const db = await new Promise((ok, erro) => { const r = indexedDB.open('fonema'); r.onsuccess = () => ok(r.result); r.onerror = () => erro(r.error); });
    const tx = db.transaction(['progressos'], 'readwrite');
    const st = tx.objectStore('progressos');
    const pegar = (id) => new Promise((ok) => { const r = st.get(id); r.onsuccess = () => ok(r.result); });
    const concluir = (p, ids, dias) => { for (const f of ids) if (p.fases[f]) p.fases[f] = { ...p.fases[f], estado: 'concluida', sessoes: 1, concluidaEm: agora - dias * dia }; };
    for (const [id, ts] of Object.entries(hist)) {
      const p = await pegar(id);
      if (!p) continue;
      p.habilidades = {};
      for (const x of ts) {
        const h = p.habilidades[x.habilidade] ?? { tentativas: [], p: 0.15 };
        h.tentativas.push(x);
        if (x.tipo === 'avaliada') h.p = BKT(h.p, x.acertou, x.comAjuda);
        p.habilidades[x.habilidade] = h;
      }
      p.sessoesFeitas = 5; p.ultimaSessao = agora - dia; p.desafios = 30; p.criadoEm = agora - 40 * dia;
      if (id === 'cap-p-ana') {
        concluir(p, ['AL-A', 'AL-B', 'AL-C', 'AL-D'], 6); p.faseAtual = 'AL-E'; p.fases['AL-E'] = { ...p.fases['AL-E'], estado: 'aberta' };
        p.habilidades['letra-a'].dominadaEm = agora - 8 * dia;
        p.fases['AL-A'].dominadaEm = agora - 8 * dia;
        p.expressa = { regioes: [], ativa: false, sondagemEm: agora - 35 * dia, degrau: 2 };
        p.sondagens = [
          { id: 'sd1', em: agora - 35 * dia, motivo: 'inicial', faseAtual: 'AL-A', fasesConcluidas: 0, degrau: 2, areas: { segmentacao: { acertos: 2, total: 4 }, 'sons-letras': { acertos: 1, total: 4 } } },
          { id: 'sd2', em: agora - 3 * dia, motivo: 'dias', faseAtual: 'AL-E', fasesConcluidas: 4, degrau: 4, areas: { segmentacao: { acertos: 4, total: 4 }, 'sons-letras': { acertos: 3, total: 4 }, 'leitura-palavras': { acertos: 0, total: 2 } } }
        ];
      } else {
        concluir(p, ['AL-A', 'AL-B', 'AL-C', 'AL-D', 'AL-E'], 4); p.faseAtual = 'AL-R1'; p.fases['AL-R1'] = { ...p.fases['AL-R1'], estado: 'aberta' };
        for (const l of ['a', 'b', 'c', 'd', 'e']) { p.habilidades[`letra-${l}`].dominadaEm = agora - 5 * dia; p.fases[`AL-${l.toUpperCase()}`].dominadaEm = agora - 5 * dia; }
        p.termometro = 0;
      }
      st.put(p);
    }
    // Lia: dados ANTIGOS (versão 1): "dominou" a letra A só com Letra, Espelho e Traçar — a migração etiqueta "a confirmar"
    const lia = await pegar('cap-p-lia');
    if (lia) {
      lia.versao = 1; delete lia.sondagens;
      concluir(lia, ['AL-A'], 10); lia.faseAtual = 'AL-B'; lia.fases['AL-B'] = { ...lia.fases['AL-B'], estado: 'aberta' };
      const cenas = ['AL-A-C2', 'AL-A-C2b', 'AL-A-C5', 'AL-A-C5'];
      lia.habilidades = { 'letra-a': { p: 0.99, dominadaEm: agora - 10 * dia, revisao: { indice: 1, proxima: agora + 2 * dia }, tentativas: ['v1', 'v2'].flatMap((s, i) => [...cenas.map((cena) => ({ em: agora - (12 - i) * dia, sessao: s, habilidade: 'letra-a', acertou: true, cena })), { em: agora - (12 - i) * dia, sessao: s, habilidade: 'letra-a', acertou: true, cena: 'AL-A-C3' }]) } };
      lia.sessoesFeitas = 2; lia.ultimaSessao = agora - 20 * dia; lia.desafios = 10;
      st.put(lia);
    }
    await new Promise((ok) => { tx.oncomplete = ok; });
    db.close();
  }, { hist: HIST, agora: AGORA, dia: DIA });
}

const entrarComo = (page, tipo) => page.evaluate((tipo) => sessionStorage.setItem('fonema-sessao', JSON.stringify({ contaId: 'cap', nome: tipo === 'professor' ? 'Profa. Rosa' : 'Mamãe', tipo, ate: Date.now() + 3600000 })), tipo);

async function main() {
  mkdirSync(DIR, { recursive: true });
  await subir();
  const browser = await chromium.launch({ executablePath: EXEC, args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const problemas = [];
  const novo = async (largura, altura, celular = false) => {
    const ctx = await browser.newContext({ viewport: { width: largura, height: altura }, isMobile: celular, hasTouch: celular, locale: 'pt-BR', reducedMotion: 'reduce' });
    await ctx.addInitScript(() => { try { localStorage.setItem('fonema-prefs', JSON.stringify({ vozLigada: false, contraste: false, menosMovimento: true })); localStorage.setItem('fonema-teste-rapido', '1'); } catch { /* sem armazenamento */ } });
    const page = await ctx.newPage();
    page.on('pageerror', (e) => { problemas.push(String(e)); console.log('  ! erro na página:', String(e)); });
    await semear(page);
    return { ctx, page };
  };
  const foto = async (page, nome, alvo, inteira = false) => {
    const caminho = `${DIR}/v5-painel-${nome}.png`;
    if (alvo) await page.locator(alvo).first().screenshot({ path: caminho });
    else await page.screenshot({ path: caminho, fullPage: inteira });
    console.log('  ✓', caminho);
  };
  const abrir = async (page, rota, espera) => { await page.goto(BASE + '#/' + rota); await page.reload(); await page.locator(espera).first().waitFor({ timeout: 20000 }); await page.waitForTimeout(700); };
  const estouro = async (page, nome) => {
    const d = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    if (d > 1) { problemas.push(`${nome}: estouro lateral de ${d}px`); console.log(`  ! ${nome}: estouro lateral de ${d}px`); }
  };
  const texto = (page, sel) => page.locator(sel).first().innerText();

  for (const [rotulo, w, h, cel] of [['', 1850, 980, false], ['-celular', 390, 844, true]]) {
    const { ctx, page } = await novo(w, h, cel);
    await entrarComo(page, 'responsavel');
    await abrir(page, 'familia/crianca/cap-p-ana', '[data-testid=confusoes]');
    await foto(page, `familia-ana${rotulo}`, null, true);
    await estouro(page, `familia-ana${rotulo}`);
    if (!cel) {
      for (const b of ['alerta-adulto', 'concluido-dominado', 'confusoes', 'palavras-dificeis', 'tempo', 'pratica-recomendada', 'sondagem-periodica']) await foto(page, `bloco-${b}`, `[data-testid=${b}]`);
      // conferências de conteúdo (falham alto se o painel não mostrar o que deve)
      const conf = await texto(page, '[data-testid=confusoes]');
      if (!/P\s*↔\s*B|B\s*↔\s*P/.test(conf.replace(/\n/g, ' '))) problemas.push('painel não mostra o par P ↔ B: ' + conf.slice(0, 200));
      const pal = await texto(page, '[data-testid=palavras-dificeis]');
      if (!/MALA/.test(pal) || !/FILA/.test(pal)) problemas.push('palavras difíceis sem MALA/FILA: ' + pal.slice(0, 200));
      if ((await page.locator('[data-testid=alerta-adulto]').getAttribute('data-nivel')) !== 'risco') problemas.push('alerta da Ana não é "risco"');
      if (!/até 2/.test(await texto(page, '[data-testid=teto-termometro]'))) problemas.push('teto do termômetro não explicado');
    }
    await abrir(page, 'familia/crianca/cap-p-davi', '[data-testid=confusoes]');
    await foto(page, `familia-davi${rotulo}`, null, true);
    await estouro(page, `familia-davi${rotulo}`);
    if (!cel) {
      if (await page.locator('[data-testid=alerta-adulto]').count()) problemas.push('Davi (indo bem) recebeu alerta');
      if ((await texto(page, '[data-testid=fases-dominadas]')) !== '5') problemas.push('Davi: fases dominadas ≠ 5');
    }
    await abrir(page, 'familia/crianca/cap-p-lia', '[data-testid=confusoes]');
    await foto(page, `familia-lia-dados-antigos${rotulo}`, '[data-testid=concluido-dominado]');
    if (!cel) {
      const cd = await texto(page, '[data-testid=concluido-dominado]');
      if ((await texto(page, '[data-testid=fases-dominadas]')) !== '0' || !/a confirmar/.test(cd)) problemas.push('Lia (dados antigos): migração não etiquetou "a confirmar": ' + cd.slice(0, 200));
      if (!/8 vezes ouvindo/.test(cd)) problemas.push('Lia: exposição não contada à parte: ' + cd.slice(0, 300));
    }
    await entrarComo(page, 'professor');
    await abrir(page, 'professor', '[data-testid=professor-turma]');
    await foto(page, `professor-turma${rotulo}`, null, true);
    await estouro(page, `professor-turma${rotulo}`);
    await page.locator('[data-testid=painel-prof-Ana]').click();
    await page.locator('[data-testid=aprendizagem-Ana]').waitFor();
    await foto(page, `professor-turma-aluno-aberto${rotulo}`, null, true);
    await estouro(page, `professor-turma-aluno-aberto${rotulo}`);
    await abrir(page, 'professor/palavras', '[data-testid=professor-palavras]');
    await foto(page, `professor-palavras${rotulo}`, null, true);
    await estouro(page, `professor-palavras${rotulo}`);
    if (!cel && !/MALA/.test(await texto(page, '[data-testid=lista-palavras]'))) problemas.push('professor: lista de palavras sem MALA');
    await abrir(page, 'professor/habilidades', '[data-testid=professor-habilidades]');
    await foto(page, `professor-habilidades${rotulo}`, '[data-testid=professor-habilidades]');
    await ctx.close();
  }
  await browser.close();
  servidor?.kill();
  if (problemas.length) { console.log('\nPROBLEMAS:\n - ' + problemas.join('\n - ')); process.exit(1); }
  console.log('\nCapturas do painel: tudo certo.');
}

main().catch((e) => { console.error(e); servidor?.kill(); process.exit(1); });
