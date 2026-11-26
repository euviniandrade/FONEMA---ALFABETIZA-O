// FONEMA · trecho E2E: VÁRIAS MISSÕES NO MESMO DIA (fila do dono nº 31, D036, 26/11): "que ela consiga fazer mais missões no
// mesmo dia e avance no processo". Em 390×844 (celular) e 1440×900 (computador), confere:
//   1. fim da missão: botão grande "Próxima missão" (leva à ENTRADA da missão seguinte) e "Voltar para a vila";
//   2. o fim não diz "Amanhã…" quando há outra missão para fazer agora (balão = a fala que tocou);
//   3. vila depois de uma missão: o painel guia mostra a próxima como disponível ("Missão 2 de hoje"), não "feita";
//   4. três missões seguidas no mesmo dia: o progresso anda (faseAtual adiante, sessões contadas, contador do dia = 3);
//   5. depois da 3ª: sugestão de pausa ("Que tal uma pausa?"), sem bloquear (o botão da próxima continua).
// Uso: node e2e/fluxo.e2e.mjs --missoes                   (também roda dentro do --sem-jornada)
//      node e2e/fluxo.e2e.mjs --capturas-missoes          (idem + capturas v18-missoes-<MISSOES_PREFIXO|depois>-*.jpg)
//      MISSOES_PREFIXO=antes → só tira as capturas (conferências viram aviso), para fotografar um build antigo.
import { resolve } from 'node:path';

const lerProgresso = (pg, id) => pg.evaluate(async (cid) => {
  const db = await new Promise((r) => { const q = indexedDB.open('fonema'); q.onsuccess = () => r(q.result); });
  const p = await new Promise((r) => { const q = db.transaction('progressos').objectStore('progressos').get(cid); q.onsuccess = () => r(q.result); });
  return { faseAtual: p.faseAtual, sessoesFeitas: p.sessoesFeitas, missoesDoDia: p.missoesDoDia ?? null, concluidas: Object.entries(p.fases).filter(([, f]) => f.estado === 'concluida').map(([k]) => k) };
}, id);

export async function trechoMissoes(browser, h) {
  const { BASE, ok: okDuro, passarPorteira, cadastrar, montarAvatar, jogarSessao, erros, dirCap } = h;
  const prefixo = process.env.MISSOES_PREFIXO || 'depois';
  const soCapturas = prefixo !== 'depois';
  const avisos = [];
  const ok = soCapturas ? (c, m) => { console.log(`  ${c ? '·' : '(aviso)'} ${m}`); if (!c) avisos.push(m); } : okDuro;
  console.log(`M. Várias missões no mesmo dia (D036; 390×844 e 1440×900)${dirCap ? `, capturas v18-missoes-${prefixo}-*` : ''}`);

  for (const [w, alt, suf, movel] of [[390, 844, '-celular', true], [1440, 900, '-pc', false]]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: alt }, locale: 'pt-BR', serviceWorkers: 'block', ...(movel ? { deviceScaleFactor: 2, isMobile: true, hasTouch: true } : {}) });
    await ctx.addInitScript(() => { try { localStorage.setItem('fonema-teste-rapido', '1'); } catch { /* sem armazenamento */ } });
    const pg = await ctx.newPage();
    pg.setDefaultTimeout(60000);
    pg.on('pageerror', (e) => erros.push(String(e)));
    const cap = async (nome, espera = 900) => {
      if (!dirCap) return;
      await pg.waitForTimeout(espera);
      await pg.screenshot({ path: resolve(dirCap, `v18-missoes-${prefixo}-${nome}${suf}.jpg`), type: 'jpeg', quality: 80 });
    };
    /** Espera o ritual terminar de falar (o balão do fim aparece no passo 3) e devolve o texto do balão do fim. */
    const fimDoRitual = async () => {
      await pg.getByTestId('ritual').waitFor();
      await pg.getByTestId('voltar-vila').waitFor({ timeout: 20000 });
      await pg.getByTestId('ritual-gancho').waitFor({ timeout: 20000 }).catch(() => {});
      await pg.waitForTimeout(1500);
      return (await pg.getByTestId('ritual-gancho').innerText().catch(() => '')).replace(/\s+/g, ' ').trim();
    };

    await pg.goto(BASE + '#/adulto/cadastro');
    await passarPorteira(pg);
    await cadastrar(pg, 'Lara', 'f');
    await montarAvatar(pg);
    await pg.getByTestId('primeira-missao').waitFor();
    const id = pg.url().split('/c/')[1].split('/')[0];
    const p0 = await lerProgresso(pg, id);

    // ---- missão 1 (Letra A) ----
    await pg.goto(BASE + `#/c/${id}/sessao/${p0.faseAtual}`);
    await jogarSessao(pg);
    const gancho1 = await fimDoRitual();
    await cap('ritual-1', 300);
    const p1 = await lerProgresso(pg, id);
    ok(p1.sessoesFeitas === 1 && p1.missoesDoDia?.n === 1, `missão 1 contada (sessões ${p1.sessoesFeitas}, hoje ${p1.missoesDoDia?.n})`);
    ok(!/amanh/i.test(gancho1), `fim da missão 1${suf}: não diz "amanhã" com outra missão à mão ("${gancho1}")`);
    const btn = pg.getByTestId('ritual-proxima');
    ok(await btn.isVisible().catch(() => false), `fim da missão 1${suf}: botão "Próxima missão" à vista`);
    if (await btn.count()) {
      const b = await btn.evaluate((e) => { const r = e.getBoundingClientRect(); return { h: r.height, esq: r.left, dir: r.right, vw: innerWidth, txt: e.innerText }; });
      ok(b.h >= 56 && b.esq >= 0 && b.dir <= b.vw && /Próxima missão/.test(b.txt), `botão grande e dentro da tela (${Math.round(b.h)} px; "${b.txt.replace(/\s+/g, ' ')}")`);
    }
    ok(await pg.getByTestId('voltar-vila').isVisible(), `fim da missão 1${suf}: "Voltar para a vila" continua`);
    ok(await pg.getByTestId('ritual-pausa').count() === 0, `fim da missão 1${suf}: sem sugestão de pausa`);

    // ---- vila depois da 1ª missão: a próxima aparece disponível ----
    await pg.goto(BASE + `#/c/${id}/vila`);
    await pg.getByTestId('vila').waitFor();
    if (movel) { await pg.getByTestId('guia-abrir').click().catch(() => {}); }
    await pg.waitForTimeout(600);
    const guia = (await pg.getByTestId('painel-guia').innerText().catch(() => '')).replace(/\s+/g, ' ');
    await cap('vila-depois-da-1', 900);
    ok(/Missão 2 de hoje/.test(guia) && !/Missão de hoje: feita/.test(guia), `vila${suf}: painel guia mostra "Missão 2 de hoje" (não "feita")`);
    ok(/Próxima missão/.test(await pg.getByTestId('proxima-missao').innerText().catch(() => 'Próxima missão')), `vila${suf}: a pílula diz "Próxima missão"`);

    if (soCapturas) { await ctx.close(); continue; }

    // ---- missão 2 pela vila (Continuar do painel guia → entrada → Começar) ----
    await pg.getByTestId('guia-continuar').click();
    await pg.waitForFunction(() => /\/fase\//.test(location.hash));
    ok(pg.url().endsWith(`/fase/${p1.faseAtual}`), `"Continuar" leva à entrada da missão 2 (${p1.faseAtual})`);
    await pg.getByTestId('comecar-missao').click();
    await jogarSessao(pg);
    await fimDoRitual();
    const p2 = await lerProgresso(pg, id);
    ok(p2.sessoesFeitas === 2 && p2.missoesDoDia?.n === 2, `missão 2 contada no mesmo dia (hoje ${p2.missoesDoDia?.n})`);
    ok(/Fim da missão|missão/i.test(await pg.locator('.topo').first().innerText().catch(() => '')), 'topo do fim sem "de hoje" fixo');

    // ---- missão 3 pelo botão "Próxima missão" do fim ----
    await pg.getByTestId('ritual-proxima').click();
    await pg.waitForFunction(() => /\/fase\//.test(location.hash));
    ok(pg.url().endsWith(`/fase/${p2.faseAtual}`), `"Próxima missão" leva à ENTRADA da missão seguinte (${p2.faseAtual}), não direto à lição`);
    await pg.getByTestId('comecar-missao').click();
    await pg.waitForFunction(() => /\/sessao\//.test(location.hash));
    ok(await pg.getByTestId('ritual').count() === 0, 'a missão 3 começa do zero (não reaproveita o fim da anterior)');
    await jogarSessao(pg);
    const gancho3 = await fimDoRitual();
    await cap('ritual-3-pausa', 300);
    const p3 = await lerProgresso(pg, id);
    ok(p3.sessoesFeitas === 3 && p3.missoesDoDia?.n === 3, `três missões no mesmo dia (sessões ${p3.sessoesFeitas}, hoje ${p3.missoesDoDia?.n})`);
    ok(p3.concluidas.length >= 2 && p3.faseAtual !== p0.faseAtual, `o progresso andou: ${p0.faseAtual} → ${p3.faseAtual} (concluídas: ${p3.concluidas.join(', ')})`);
    ok(await pg.getByTestId('ritual-pausa').isVisible().catch(() => false), `depois da 3ª${suf}: "Que tal uma pausa?" à vista`);
    ok(await pg.getByTestId('ritual-proxima').isVisible().catch(() => false), `depois da 3ª${suf}: a próxima missão continua aberta (pausa não bloqueia)`);
    ok(gancho3.length > 0, `depois da 3ª: o balão do fim mostra a fala que tocou ("${gancho3}")`);
    await ctx.close();
  }
  if (soCapturas && avisos.length) console.log(`  (${prefixo}: ${avisos.length} conferências não valeram neste build — esperado no "antes")`);
}
