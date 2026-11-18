// FONEMA · trecho E2E: TELAS (revisão de qualidade 18/11, itens 8, 12 e 28).
// Em 390×844 (celular) e 1850×980 (computador), em cada tela principal da criança, confere:
//   1. nenhuma rolagem para o lado (a página não "escorrega": scrollX fica 0 e nada passa da largura);
//   2. todos os botões de RESPOSTA aparecem inteiros sem rolar e sem nada por cima (rodapé fixo incluído);
//   3. no fim da missão, o "Tchau! Voltar para a vila" aparece sem rolar, e nunca "+0 moedinhas";
//   4. na tela da criança não aparecem barras de fonética (/a/, /ê/) nem texto de adulto ("domínio", "para o adulto").
// Uso: node e2e/fluxo.e2e.mjs --telas            (também roda dentro do E2E completo e do --sem-jornada)
//      node e2e/fluxo.e2e.mjs --capturas-telas   (idem + capturas em app/docs/capturas/v11-telas-*.png)
import { resolve } from 'node:path';

const AL_ATE_G = ['AL-A', 'AL-E', 'AL-I', 'AL-O', 'AL-U', 'AL-RV1', 'AL-M', 'AL-F', 'AL-V', 'AL-L', 'AL-S', 'AL-N', 'AL-Z', 'AL-J', 'AL-RV2', 'AL-P', 'AL-T', 'AL-B', 'AL-C', 'AL-D', 'AL-G'];
const TF_ATE_22 = ['TF-01', 'TF-02', 'TF-03', 'TF-04', 'TF-05', 'TF-06', 'TF-07', 'TF-08', 'TF-09', 'TF-10', 'TF-11', 'TF-12', 'TF-13', 'TF-14', 'TF-15', 'TF-R2', 'TF-16', 'TF-17', 'TF-18', 'TF-19', 'TF-20', 'TF-21', 'TF-22'];

/** Botões de resposta (o que a criança escolhe) em todas as mecânicas e jogos com 2+ opções. */
const RESPOSTAS = [
  '.opcoes .opcao', '.opcoes-palavra > button', '.opcoes-sondagem .opcao', '.liga-cartao', '.ep-placa', '.ct-casa',
  '.historia-pergunta .opcao', '.texto-perguntas .opcao'
].join(',');

const semear = (pg, id, fases, saldo) => pg.evaluate(async ([cid, fs, s]) => {
  const db = await new Promise((r) => { const q = indexedDB.open('fonema'); q.onsuccess = () => r(q.result); });
  const p = await new Promise((r) => { const q = db.transaction('progressos').objectStore('progressos').get(cid); q.onsuccess = () => r(q.result); });
  const agora = Date.now() - 3600e3;
  for (const f of fs) p.fases[f] = { ...(p.fases[f] ?? {}), estado: 'concluida', sessoes: 1, concluidaEm: agora };
  if (typeof s === 'number') p.moedinhas = { ...p.moedinhas, saldo: s, total: Math.max(s, p.moedinhas.total) };
  await new Promise((r) => { const tx = db.transaction('progressos', 'readwrite'); tx.objectStore('progressos').put(p); tx.oncomplete = r; });
}, [id, fases, saldo]);

/**
 * Mede a tela como ela está (rolada para o topo): rolagem para o lado, respostas fora da tela ou cobertas, e texto de adulto.
 * `visiveis`: seletores extras que precisam aparecer inteiros sem rolar (ex.: o "Voltar para a vila" do fim da missão).
 */
export async function medirTela(pg, { visiveis = [] } = {}) {
  return pg.evaluate(async ([respostas, extras]) => {
    window.scrollTo(0, 0);
    document.querySelectorAll('.palco,.tela-sessao,main').forEach((e) => { e.scrollTop = 0; });
    await new Promise((r) => setTimeout(r, 60));
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const desc = (e) => `${e.tagName.toLowerCase()}${e.dataset.testid ? `[${e.dataset.testid}]` : ''}${e.dataset.opcao ? `[${e.dataset.opcao}]` : ''}.${String(e.className?.baseVal ?? e.className).trim().split(/\s+/).slice(0, 2).join('.')}`;
    // 1. a página rola para o lado? Mede SEM o corte de segurança (overflow-x:clip em html/body/#root/.pagina), para achar a causa
    const semCorte = document.createElement('style');
    semCorte.textContent = 'html,body,#root,.pagina{overflow-x:visible!important}';
    document.head.appendChild(semCorte);
    await new Promise((r) => setTimeout(r, 30));
    window.scrollTo(9999, 0);
    await new Promise((r) => setTimeout(r, 30));
    const rolaLado = window.scrollX;
    window.scrollTo(0, 0);
    const largura = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth);
    // elementos que passam da borda direita (fora os presos na tela e os de dentro de uma caixa que corta ou rola)
    const vazam = [];
    const raizes = new Set([document.documentElement, document.body, document.getElementById('root'), ...document.querySelectorAll('.pagina')]);
    const cortado = (e) => { for (let a = e.parentElement; a && !raizes.has(a); a = a.parentElement) { if (getComputedStyle(a).overflowX !== 'visible') return true; } return false; };
    for (const e of document.querySelectorAll('body *')) {
      const r = e.getBoundingClientRect();
      if (r.width > 0 && r.height > 0 && r.right > vw + 1 && getComputedStyle(e).position !== 'fixed' && !e.closest('[aria-hidden=true].fundo,.fundo') && !cortado(e)) vazam.push(`${desc(e)} (${Math.round(r.right)}px)`);
      if (vazam.length >= 6) break;
    }
    semCorte.remove();
    // 2. respostas inteiras sem rolar e sem nada por cima (pointer-events ligado só durante a medida)
    const st = document.createElement('style');
    st.textContent = '*{pointer-events:auto!important}';
    document.head.appendChild(st);
    const escondidas = [];
    const confere = (el) => {
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      if (r.width < 4 || r.height < 4 || cs.visibility === 'hidden' || cs.display === 'none' || Number(cs.opacity) === 0) return true;
      const pontos = [[r.left + r.width / 2, r.top + r.height / 2], [r.left + r.width / 2, r.bottom - 8], [r.left + 10, r.top + 10], [r.right - 10, r.bottom - 10]];
      return pontos.every(([x, y]) => {
        if (x < 0 || y < 0 || x > vw || y > vh) return false;
        const no = document.elementFromPoint(x, y);
        return !!no && (el.contains(no) || no.contains(el) || !!no.closest('.opcao-caixa')?.contains(el));
      });
    };
    const respostasNaTela = [...document.querySelectorAll(respostas)];
    for (const el of respostasNaTela) if (!confere(el)) escondidas.push(`${desc(el)} (embaixo em ${Math.round(el.getBoundingClientRect().bottom)} de ${vh})`);
    for (const s of extras) {
      const el = document.querySelector(s);
      if (!el) escondidas.push(`${s} (não existe)`);
      else if (!confere(el)) escondidas.push(`${s} (embaixo em ${Math.round(el.getBoundingClientRect().bottom)} de ${vh})`);
    }
    st.remove();
    // 4. texto de adulto e fonética na tela da criança (só o que está visível)
    const texto = document.body.innerText;
    const adulto = [];
    const fonetica = texto.match(/\/[a-zãâáàéêíóôõúçẽĩũ]{1,4}\//gi);
    if (fonetica) adulto.push(`fonética na tela: ${[...new Set(fonetica)].join(' ')}`);
    if (/por domínio|para o adulto|\+0 moedinhas/i.test(texto)) adulto.push(`texto de adulto: ${texto.match(/[^\n]*(por domínio|para o adulto|\+0 moedinhas)[^\n]*/i)[0].slice(0, 80)}`);
    return { rolaLado, largura, vw, vazam, escondidas, nRespostas: respostasNaTela.length, adulto };
  }, [RESPOSTAS, visiveis]);
}

export async function trechoTelas(browser, h) {
  const { BASE, ok, passarPorteira, cadastrar, montarAvatar, jogarSessao, erros, dirCap } = h;
  console.log(`T. Telas: sem rolar para o lado e respostas à vista (390×844 e 1850×980)${dirCap ? ', com capturas v11-telas-*' : ''}`);
  const problemas = [];
  let medidas = 0;
  let comRespostas = 0;
  for (const [w, alt, suf, movel] of [[390, 844, '-celular', true], [1850, 980, '', false]].filter(([w]) => !process.env.TELAS_LARGURA || String(w) === process.env.TELAS_LARGURA)) {
    const ctx = await browser.newContext({ viewport: { width: w, height: alt }, locale: 'pt-BR', serviceWorkers: 'block', ...(movel ? { deviceScaleFactor: 2, isMobile: true, hasTouch: true } : {}) });
    await ctx.addInitScript(() => { try { localStorage.setItem('fonema-teste-rapido', '1'); } catch { /* sem armazenamento */ } });
    const pg = await ctx.newPage();
    pg.on('pageerror', (e) => erros.push(String(e)));
    const vistas = new Set();
    const medir = async (nome, opcoes = {}) => {
      await pg.waitForTimeout(opcoes.espera ?? 700);
      const m = await medirTela(pg, opcoes);
      medidas++;
      if (m.nRespostas) comRespostas++;
      const onde = `${nome}${suf}`;
      const antes = problemas.length;
      if (m.rolaLado > 0 || m.largura > m.vw + 1 || m.vazam.length) problemas.push(`${onde}: passa da largura da tela (${m.largura}px em ${m.vw}px) ${m.vazam.join(', ')}`);
      for (const e of m.escondidas) problemas.push(`${onde}: escondido ${e}`);
      for (const a of m.adulto) problemas.push(`${onde}: ${a}`);
      console.log(`  · ${onde}: ${m.nRespostas} respostas${m.escondidas.length || m.adulto.length || m.vazam.length || m.rolaLado > 0 || m.largura > m.vw + 1 ? ' ✗' : ' ok'}`);
      for (const p of problemas.slice(antes)) console.log(`      ✗ ${p}`);
      if (dirCap && !vistas.has(nome)) {
        vistas.add(nome);
        await pg.screenshot({ path: resolve(dirCap, `v11-telas-${nome}${suf}.png`) });
      }
      return m;
    };

    await pg.goto(BASE + '#/adulto/cadastro');
    await passarPorteira(pg);
    await cadastrar(pg, 'Nina', 'f');
    await montarAvatar(pg);
    await pg.getByTestId('primeira-missao').waitFor();
    await medir('chegada');
    const id = pg.url().split('/c/')[1].split('/')[0];

    // a Letra A de verdade (do zero): cada cena com respostas é medida quando as respostas já podem ser tocadas
    const gancho = (prefixo) => async (p, cena) => {
      if (!cena || vistas.has(`${prefixo}-${cena}`)) return;
      // Espelho do Som: as duas vistas (o quadro inteiro do espelho) acima do rodapé fixo, sem rolar
      if (await p.locator('.mec-espelho .espelho-embed').count().catch(() => 0)) {
        await medir(`${prefixo}-${cena}-espelho`, { espera: 900, visiveis: ['.mec-espelho .espelho-embed'] });
        vistas.add(`${prefixo}-${cena}`);
        return;
      }
      const prontas = await p.locator(`${RESPOSTAS.split(',').map((s) => `${s}:not([disabled])`).join(',')}`).count().catch(() => 0);
      const ouvindo = await p.locator('.opcoes.ouvindo').count().catch(() => 0);
      if (!prontas || ouvindo) return;
      await medir(`${prefixo}-${cena}`, { espera: 650 });
    };
    await pg.goto(BASE + `#/c/${id}/sessao/AL-A`);
    await jogarSessao(pg, { gancho: gancho('sessao') });
    await pg.getByTestId('ritual').waitFor();
    await pg.getByTestId('voltar-vila').waitFor({ timeout: 20000 });
    await pg.waitForTimeout(2500);
    const rit = await medir('ritual', { visiveis: ['[data-testid=voltar-vila]'], espera: 300 });
    const ganhas = await pg.getByTestId('moedinhas-ganhas').innerText().catch(() => '');
    if (/\+\s*0\b/.test(ganhas)) problemas.push(`ritual${suf}: mostra "+0 moedinhas"`);
    void rit;

    // trilha semeada (letras até G e sons até TF-22) e moedinhas para a Lojinha
    await semear(pg, id, [...AL_ATE_G, ...TF_ATE_22], 30);
    for (const [rota, nome, espera] of [['vila', 'vila', 1500], ['lojinha', 'lojinha', 2500], ['album', 'album', 900], ['brincar', 'brincar', 1200], ['leitura', 'leitura', 900],
      ['sons', 'trilha-sons', 900], ['alfabeto', 'trilha-az', 900], ['mapa', 'mapa', 900], ['fase/TF-01', 'entrada-tf01', 900], ['fase/AL-E', 'entrada-ale', 900]]) {
      await pg.goto(BASE + `#/c/${id}/${rota}`);
      await pg.reload();
      await medir(nome, { espera });
    }
    // na Lojinha do celular, alguma roupa aparece já na primeira tela
    await pg.goto(BASE + `#/c/${id}/lojinha`);
    await pg.locator('.item-loja').first().waitFor({ timeout: 8000 }).catch(() => {});
    await pg.waitForTimeout(800);
    const roupaNaTela = await pg.evaluate(() => [...document.querySelectorAll('.item-loja')].some((e) => { const r = e.getBoundingClientRect(); return r.top >= 0 && r.top + 60 <= innerHeight; }));
    if (!roupaNaTela) problemas.push(`lojinha${suf}: nenhuma roupa na primeira tela`);

    // lições da Trilha dos Sons com 3+ respostas (som novo, som inicial, síntese, caixas, pares mínimos, frase)
    // (cada lição tem um prazo: o objetivo aqui é medir as telas, não terminar a lição; ao estourar, o gancho interrompe o jogador)
    for (const f of ['TF-07', 'TF-09', 'TF-17']) {
      await pg.goto(BASE + `#/c/${id}/sons`);
      await pg.goto(BASE + `#/c/${id}/sessao/${f}`);
      const prazo = Date.now() + 120000;
      const g = gancho(f.toLowerCase());
      await jogarSessao(pg, { gancho: async (p, cena) => { if (Date.now() > prazo) throw new Error('prazo'); await g(p, cena); } })
        .catch((e) => { if (String(e?.message) !== 'prazo') throw e; console.log(`  (${f}: prazo de 2 min para medir; lição não terminada)`); });
    }

    // brincadeiras de escutar (fora da lição): 3 figuras, depois da demonstração
    for (const j of ['comprida', 'escondida', 'rimas', 'intruso', 'comeco']) {
      await pg.goto(BASE + `#/c/${id}/brincar/${j}`);
      await pg.locator('[data-testid=jogo-escuta]:not([data-demo]) .opcao:not([disabled])').first().waitFor({ timeout: 30000 }).catch(() => {});
      await medir(`escuta-${j}`, { espera: 700 });
    }
    // história: a primeira pergunta (figuras para escolher)
    await pg.goto(BASE + `#/c/${id}/leitura/historia-bolota-chuva`);
    for (let k = 0; k < 60; k++) {
      const passo = await pg.getByTestId('historia').getAttribute('data-passo', { timeout: 2000 }).catch(() => null);
      if (passo === 'pergunta' && await pg.locator('.historia-pergunta .opcao:not([disabled])').count()) break;
      await pg.locator('[data-testid=historia-virar]:not([disabled])').click({ timeout: 1500 }).catch(() => {});
      await pg.waitForTimeout(300);
    }
    await medir('historia-pergunta', { espera: 700 });

    // jogos da vila e jogos fônicos: a tela do jogo, já com as opções
    const jogo = async (rota, comecar, raiz, nome, visiveis = []) => {
      await pg.goto(BASE + `#/c/${id}/${rota}`);
      if (comecar) { await pg.getByTestId(comecar).click({ timeout: 8000 }).catch(() => {}); }
      await pg.getByTestId(raiz).waitFor({ timeout: 10000 }).catch(() => {});
      await medir(nome, { espera: 2500, visiveis });
    };
    await jogo('brincar/corre-som', 'variacao-letra', 'corre-som', 'jogo-corre-som');
    await jogo('brincar/come-som', 'variacao-inicio', 'come-som', 'jogo-come-som');
    await jogo('jogo/carteiro', 'jogo-comecar', 'carteiro', 'jogo-carteiro');
    await jogo('jogo/estrada-pares', 'jogo-comecar-ouvir', 'estrada-pares', 'jogo-estrada');
    await jogo('jogo/casa-som', 'jogo-comecar', 'casa-som', 'jogo-casa-som', ['[data-testid=escrita-pronto]']);
    await ctx.close();
  }
  console.log(`  ${medidas} telas medidas (${comRespostas} com botões de resposta)`);
  for (const p of problemas) console.log(`    ✗ ${p}`);
  ok(problemas.length === 0, `telas: nenhuma rolagem para o lado, respostas e "Voltar para a vila" à vista sem rolar, sem fonética nem texto de adulto (${medidas} telas, ${problemas.length} problemas)`);
}
