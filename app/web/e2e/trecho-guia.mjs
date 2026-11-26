// FONEMA · trecho E2E: O JOGO GUIA (fila do dono nº 30, 26/11): "sempre saber qual é a próxima missão, o objetivo de cada item e
// quando usá-lo". Em 390×844 (celular) e 1440×900 (computador), confere:
//   1. pílula "Próxima missão" no topo da Lojinha, Álbum, Brincar, Cantinho, Fichas, trilhas e no mapa das ilhas: à vista, ≥ 44 px,
//      dentro da largura, com o nome da missão de agora; tocar leva à entrada da fase (nunca direto à lição);
//   2. nada disso no meio da lição nem no fim da missão (sem botão "continuar", C9); o fim mostra "Próxima missão: …" em texto;
//   3. "para que serve" no cofrinho, na Lojinha (peças e utensílios) e no Álbum;
//   4. Fichas: "abre com as missões" no lugar de "em breve".
// Uso: node e2e/fluxo.e2e.mjs --guia                     (também roda dentro do --sem-jornada)
//      node e2e/fluxo.e2e.mjs --capturas-guia            (idem + capturas v17-guia-<GUIA_PREFIXO|depois>-*.jpg em CAPTURAS_GUIA)
//      GUIA_PREFIXO=antes → só tira as capturas (as conferências viram aviso), para fotografar um build antigo com o mesmo roteiro.
//      GUIA_PASSEIO=1     → também fotografa o cartão do barquinho no passeio 3D (celular; demora).
import { resolve } from 'node:path';

const AL_ATE_G = ['AL-A', 'AL-E', 'AL-I', 'AL-O', 'AL-U', 'AL-RV1', 'AL-M', 'AL-F', 'AL-V', 'AL-L', 'AL-S', 'AL-N', 'AL-Z', 'AL-J', 'AL-RV2', 'AL-P', 'AL-T', 'AL-B', 'AL-C', 'AL-D', 'AL-G'];
const TF_ATE_22 = ['TF-01', 'TF-02', 'TF-03', 'TF-04', 'TF-05', 'TF-06', 'TF-07', 'TF-08', 'TF-09', 'TF-10', 'TF-11', 'TF-12', 'TF-13', 'TF-14', 'TF-15', 'TF-R2', 'TF-16', 'TF-17', 'TF-18', 'TF-19', 'TF-20', 'TF-21', 'TF-22'];

const semear = (pg, id, fases, saldo) => pg.evaluate(async ([cid, fs, s]) => {
  const db = await new Promise((r) => { const q = indexedDB.open('fonema'); q.onsuccess = () => r(q.result); });
  const p = await new Promise((r) => { const q = db.transaction('progressos').objectStore('progressos').get(cid); q.onsuccess = () => r(q.result); });
  const agora = Date.now() - 3600e3;
  for (const f of fs) p.fases[f] = { ...(p.fases[f] ?? {}), estado: 'concluida', sessoes: 1, concluidaEm: agora };
  if (typeof s === 'number') p.moedinhas = { ...p.moedinhas, saldo: s, total: Math.max(s, p.moedinhas.total) };
  await new Promise((r) => { const tx = db.transaction('progressos', 'readwrite'); tx.objectStore('progressos').put(p); tx.oncomplete = r; });
}, [id, fases, saldo]);

/** Onde está a pílula (ou null), medida na tela como ela aparece. */
const medirPilula = (pg) => pg.evaluate(() => {
  const b = document.querySelector('[data-testid=proxima-missao]');
  if (!b) return null;
  const r = b.getBoundingClientRect();
  const x = r.left + r.width / 2, y = r.top + r.height / 2;
  const no = document.elementFromPoint(x, y);
  return { texto: b.innerText.replace(/\s+/g, ' ').trim(), fase: b.dataset.fase, h: Math.round(r.height), esq: Math.round(r.left), dir: Math.round(r.right), topo: Math.round(r.top), base: Math.round(r.bottom), vw: innerWidth, vh: innerHeight, livre: !!no && b.contains(no) };
});

export async function trechoGuia(browser, h) {
  const { BASE, ok: okDuro, passarPorteira, cadastrar, montarAvatar, jogarSessao, erros, dirCap } = h;
  const prefixo = process.env.GUIA_PREFIXO || 'depois';
  const soCapturas = prefixo !== 'depois';
  const avisos = [];
  const ok = soCapturas ? (c, m) => { console.log(`  ${c ? '·' : '(aviso)'} ${m}`); if (!c) avisos.push(m); } : okDuro;
  console.log(`G. O jogo guia: próxima missão e para que serve (390×844 e 1440×900)${dirCap ? `, capturas v17-guia-${prefixo}-*` : ''}`);

  for (const [w, alt, suf, movel] of [[390, 844, '-celular', true], [1440, 900, '-pc', false]]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: alt }, locale: 'pt-BR', serviceWorkers: 'block', ...(movel ? { deviceScaleFactor: 2, isMobile: true, hasTouch: true } : {}) });
    await ctx.addInitScript(() => { try { localStorage.setItem('fonema-teste-rapido', '1'); } catch { /* sem armazenamento */ } });
    const pg = await ctx.newPage();
    pg.setDefaultTimeout(60000);
    pg.on('pageerror', (e) => erros.push(String(e)));
    const cap = async (nome, espera = 900) => {
      if (!dirCap) return;
      await pg.waitForTimeout(espera);
      await pg.screenshot({ path: resolve(dirCap, `v17-guia-${prefixo}-${nome}${suf}.jpg`), type: 'jpeg', quality: 80 });
    };

    await pg.goto(BASE + '#/adulto/cadastro');
    await passarPorteira(pg);
    await cadastrar(pg, 'Nina', 'f');
    await montarAvatar(pg);
    await pg.getByTestId('primeira-missao').waitFor();
    const id = pg.url().split('/c/')[1].split('/')[0];

    // a 1ª missão (Letra A) inteira; no meio da lição não há pílula
    await pg.goto(BASE + `#/c/${id}/sessao/AL-A`);
    await pg.locator('.tela-sessao, [data-testid=sessao]').first().waitFor({ timeout: 30000 }).catch(() => {});
    await pg.waitForTimeout(800);
    ok(await pg.getByTestId('proxima-missao').count() === 0, `no meio da lição não aparece a pílula "Próxima missão"${suf}`);
    await jogarSessao(pg);
    await pg.getByTestId('ritual').waitFor();
    await pg.getByTestId('voltar-vila').waitFor({ timeout: 20000 });
    await pg.waitForTimeout(2500);
    await cap('ritual', 300);
    const obj = await pg.getByTestId('bo-objetivo').innerText().catch(() => '');
    ok(/^Próxima missão: \S/.test(obj), `fim da missão: mostra "${obj}"${suf}`);
    ok(await pg.getByTestId('proxima-missao').count() === 0, `fim da missão: sem botão de começar a próxima (C9: sem "continuar")${suf}`);
    if (dirCap) { await pg.getByTestId('barra-objetivo').scrollIntoViewIfNeeded().catch(() => {}); await cap('ritual-proxima', 500); }

    // a vila depois da 1ª missão (referência: o painel guia já mostrava a próxima)
    await pg.goto(BASE + `#/c/${id}/vila`);
    await pg.getByTestId('vila').waitFor();
    await cap('vila', 1500);

    // trilha semeada (letras até G e sons até TF-22) e moedinhas
    await semear(pg, id, [...AL_ATE_G, ...TF_ATE_22], 30);
    const telas = [['lojinha', 'lojinha', 2500], ['album', 'album', 1200], ['brincar', 'brincar', 1200], ['leitura', 'leitura', 900], ['leitura/fichas', 'fichas', 900],
      ['jogo', 'jogos-vila', 900], ['sons', 'trilha-sons', 900], ['alfabeto', 'trilha-az', 900], ['mapa', 'mapa', 1200], ['regiao/R1', 'regiao', 900]];
    let faseAgora = null;
    for (const [rota, nome, espera] of telas) {
      await pg.goto(BASE + `#/c/${id}/${rota}`);
      await pg.reload();
      await pg.waitForTimeout(espera);
      await cap(nome, 200);
      const m = await medirPilula(pg);
      ok(!!m, `${nome}${suf}: pílula "Próxima missão" no topo`);
      if (!m) continue;
      faseAgora ??= m.fase;
      ok(m.fase === faseAgora && /^(Próxima missão|Missão de hoje) \S/.test(m.texto), `${nome}${suf}: "${m.texto}"`);
      ok(m.h >= 44 && m.esq >= 0 && m.dir <= m.vw && m.topo >= 0 && m.base <= m.vh && m.livre, `${nome}${suf}: inteira à vista e sem nada por cima (${m.h} px de altura, ${m.esq}–${m.dir} de ${m.vw})`);
    }
    // tocar leva à ENTRADA da missão (não direto à lição)
    await pg.goto(BASE + `#/c/${id}/album`);
    await pg.getByTestId('proxima-missao').click();
    await pg.waitForFunction(() => /\/fase\//.test(location.hash), null, { timeout: 15000 }).catch(() => {});
    ok(pg.url().endsWith(`/fase/${faseAgora}`), `tocar na pílula leva à entrada da missão (${pg.url().split('#')[1]})`);

    // Fichas: "abre com as missões" no lugar de "em breve"
    await pg.goto(BASE + `#/c/${id}/leitura/ficha.animais`);
    await pg.getByTestId('ficha-campo').waitFor();
    await cap('ficha-campo', 700);
    const fc = await pg.getByTestId('ficha-campo').innerText();
    ok(/abre com as missões/.test(fc) && !/em breve/i.test(fc), `Fichas${suf}: palavra trancada diz "abre com as missões"`);
    ok(await pg.getByTestId('proxima-missao').count() === 0, `Fichas${suf}: dentro de uma ficha, sem pílula (só na lista)`);

    // para que serve: cofrinho, Lojinha (peças e utensílios), Álbum
    await pg.goto(BASE + `#/c/${id}/lojinha`);
    await pg.getByTestId('lojinha').waitFor();
    ok(await pg.getByTestId('lojinha-para-que').isVisible().catch(() => false), `Lojinha${suf}: diz como as peças abrem`);
    await pg.locator('[data-aba=utensilios]').click();
    await cap('lojinha-utensilios', 900);
    ok(await pg.getByTestId('utensilios-para-que').isVisible().catch(() => false), `Lojinha${suf}: utensílios dizem para que servem`);
    await pg.locator('#cofre-topo').click();
    await pg.waitForTimeout(400);
    await cap('cofrinho', 1200);
    ok(await pg.getByTestId('cofrinho-para-que').isVisible().catch(() => false), `cofrinho${suf}: diz para que servem as moedinhas`);
    await pg.goto(BASE + `#/c/${id}/album`);
    await pg.getByTestId('album').waitFor();
    ok(await pg.getByTestId('album-para-que').isVisible().catch(() => false), `Álbum${suf}: diz para que serve`);

    // passeio 3D: o cartão do barquinho sem a chave (só nas capturas, no celular; demora)
    if (dirCap && movel && process.env.GUIA_PASSEIO) {
      await pg.goto(BASE + `#/c/${id}/mundo`);
      await pg.getByTestId('passeio3d').waitFor({ timeout: 60000 });
      let frame = null;
      for (let i = 0; i < 400 && !frame; i++) { frame = pg.frames().find((x) => /mundo3d\/passeio\.html/.test(x.url())) ?? null; if (!frame) await pg.waitForTimeout(200); }
      await frame.waitForFunction(() => window.FONEMA_PASSEIO && window.FONEMA_CACA, null, { timeout: 300000 });
      await frame.evaluate(() => { const p = window.FONEMA_PASSEIO; p.teleportar(37.2, 12.6, Math.PI / 2); p.simular(0.6); p.interagir(); p.simular(0.3); });
      await cap('passeio-barco', 3000);
    }
    await ctx.close();
  }
  if (soCapturas && avisos.length) console.log(`  (${prefixo}: ${avisos.length} conferências não valeram neste build — esperado no "antes")`);
}
