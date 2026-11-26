// FONEMA · trecho E2E: ENTRADA NOVA e ACESSOS SEPARADOS (fila do dono nº 34, 26/11/2026).
// Confere: a primeira página tem 4 acessos (criança, família, professor, administrador), cabe na tela de celular,
// tablet e PC sem rolar para o lado e com alvos de toque ≥ 44 px; a criança entra sem senha; o professor cria a
// conta com login e senha (recusa login e senha ruins), entra, erra a senha, acerta; a conta do professor não abre
// a porta da Família; a Família é criada com a confirmação de um adulto já cadastrado; "esqueci a senha" troca a
// senha no aparelho; conta antiga com PIN entra e cria login e senha; o administrador entra pelo link do rodapé.
// Uso: node e2e/fluxo.e2e.mjs --entrada        (também roda dentro do E2E completo e do --sem-jornada)
import { resolve } from 'node:path';

const TAMANHOS = [['celular', 390, 844, true], ['tablet', 820, 1180, true], ['pc', 1440, 900, false], ['pc-baixo', 1280, 720, false], ['celular-pequeno', 360, 640, true]];

/** Segura um BotaoSegurar (no modo de teste, 250 ms bastam). */
async function segurar(pg, testId) {
  const b = pg.getByTestId(testId);
  await b.scrollIntoViewIfNeeded();
  const c = await b.boundingBox();
  await pg.mouse.move(c.x + c.width / 2, c.y + c.height / 2);
  await pg.mouse.down();
  await pg.waitForTimeout(700);
  await pg.mouse.up();
}
async function entrarCom(pg, login, senha) {
  await pg.getByTestId('login-usuario').fill(login);
  await pg.getByTestId('login-senha').fill(senha);
  await pg.getByTestId('login-entrar').click();
}
async function sair(pg, BASE) {
  await pg.evaluate(() => sessionStorage.removeItem('fonema-sessao'));
  await pg.goto(BASE + '#/');
  await pg.getByTestId('inicio').waitFor();
}

/**
 * @param {import('@playwright/test').Browser} browser
 * @param {{ BASE: string, ok: (c: boolean, m: string) => void, erros: string[], dirCap?: string }} h
 */
export async function trechoEntrada(browser, { BASE, ok, erros, dirCap }) {
  console.log('E. Entrada nova: criança sem senha, Família e Professor com login e senha, Administrador no rodapé');

  // 1. a primeira página em 5 tamanhos
  for (const [nome, w, h, movel] of TAMANHOS) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, isMobile: movel, hasTouch: movel, locale: 'pt-BR', serviceWorkers: 'block' });
    await ctx.addInitScript(() => { try { localStorage.setItem('fonema-teste-rapido', '1'); } catch { /* sem armazenamento */ } });
    const pg = await ctx.newPage();
    pg.on('pageerror', (e) => erros.push(String(e)));
    await pg.goto(BASE);
    await pg.getByTestId('entrar-aluno').waitFor();
    await pg.waitForTimeout(1200); // animação de entrada
    const m = await pg.evaluate(() => {
      const caixas = [...document.querySelectorAll('[data-papel], [data-testid="primeira-vez"]')].map((b) => { const r = b.getBoundingClientRect(); return { id: b.getAttribute('data-papel') ?? 'primeira-vez', w: r.width, h: r.height, baixo: r.bottom, dir: r.right, esq: r.left }; });
      return { caixas, largura: document.documentElement.scrollWidth, vw: innerWidth, vh: innerHeight, altura: document.documentElement.scrollHeight };
    });
    ok(m.caixas.filter((c) => c.id !== 'primeira-vez').map((c) => c.id).sort().join(',') === 'admin,aluno,familia,professor', `${nome}: 4 acessos separados (criança, família, professor, administrador)`);
    ok(m.largura <= m.vw + 1 && m.caixas.every((c) => c.esq >= 0 && c.dir <= m.vw + 1), `${nome}: nada passa da largura (${m.largura} ≤ ${m.vw})`);
    ok(m.caixas.every((c) => c.h >= 44 && c.w >= 44), `${nome}: alvos de toque ≥ 44 px (${m.caixas.map((c) => `${c.id} ${Math.round(c.h)}`).join(', ')})`);
    if (!['pc-baixo', 'celular-pequeno'].includes(nome)) ok(m.caixas.every((c) => c.baixo <= m.vh + 1), `${nome}: todos os acessos aparecem sem rolar`);
    else ok(m.altura <= m.vh + 1 || (await pg.evaluate(() => { scrollTo(0, 1e5); const r = document.querySelector('[data-papel="admin"]').getBoundingClientRect(); return r.bottom <= innerHeight + 1; })), `${nome}: tela baixa rola até o último acesso (nada cortado)`);
    if (dirCap && ['celular', 'tablet', 'pc'].includes(nome)) await pg.screenshot({ path: resolve(dirCap, `v18-entrada-depois-${nome}.jpg`), type: 'jpeg', quality: 80 });
    await ctx.close();
  }

  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, locale: 'pt-BR', serviceWorkers: 'block' });
  await ctx.addInitScript(() => { try { localStorage.setItem('fonema-teste-rapido', '1'); } catch { /* sem armazenamento */ } });
  const pg = await ctx.newPage();
  pg.on('pageerror', (e) => erros.push(String(e)));
  await pg.goto(BASE);

  // 2. criança: sem senha; sem criança cadastrada, explica que um adulto cadastra
  await pg.getByTestId('entrar-aluno').click();
  await pg.getByTestId('alunos-vazio').waitFor();
  ok(await pg.locator('input[type=password]').count() === 0, 'criança: nenhuma senha pedida; sem cadastro, pede um adulto');

  // 3. professor: primeira conta do aparelho, com login e senha
  await pg.goto(BASE + '#/');
  await pg.getByTestId('entrar-professor').click();
  await pg.getByTestId('conta-nome').waitFor();
  ok(await pg.locator('[data-testid="criar-conta"][data-tipo="professor"]').count() === 1, 'professor: sem conta no aparelho, abre "Criar conta de professor(a)"');
  await pg.getByTestId('conta-nome').fill('Bia');
  await pg.getByTestId('conta-login').fill('bia souza');
  await pg.getByTestId('conta-senha').fill('123456');
  await pg.getByTestId('conta-senha2').fill('123456');
  await pg.getByTestId('conta-criar').click();
  const avisos = await pg.locator('.aviso-campo').allInnerTexts();
  ok(avisos.some((t) => /usuário/.test(t)) && avisos.some((t) => /letras/.test(t)), `login com espaço e senha só de números são recusados (${avisos.join(' | ')})`);
  await pg.getByTestId('conta-login').fill('prof.bia');
  await pg.getByTestId('conta-senha').fill('bolota22');
  await pg.getByTestId('conta-senha2').fill('bolota22');
  await pg.getByTestId('conta-criar').click();
  await pg.getByTestId('area-professor').waitFor();
  ok(true, 'professor: conta criada com login e senha → Área do Professor');
  const guardado = await pg.evaluate(async () => {
    const db = await new Promise((r) => { const q = indexedDB.open('fonema'); q.onsuccess = () => r(q.result); });
    return new Promise((r) => { const q = db.transaction('config').objectStore('config').get('contas'); q.onsuccess = () => r(JSON.stringify(q.result)); });
  });
  ok(!guardado.includes('bolota22') && /"login":"prof\.bia"/.test(guardado) && /"hashSenha":"p2:/.test(guardado), 'a senha não fica guardada: só o hash PBKDF2 (p2:)');

  // 4. professor sai e volta: senha errada recusada, certa entra
  await sair(pg, BASE);
  await pg.getByTestId('entrar-professor').click();
  await pg.getByTestId('login-usuario').waitFor();
  ok(await pg.locator('[data-testid="acesso-adulto"][data-tipo="professor"]').count() === 1, 'professor: a porta pede login e senha');
  await entrarCom(pg, 'prof.bia', 'errada99');
  await pg.getByText('Login ou senha errados').waitFor();
  ok(await pg.getByTestId('area-professor').count() === 0, 'professor: senha errada não entra');
  await entrarCom(pg, 'PROF.BIA', 'bolota22');
  await pg.getByTestId('area-professor').waitFor();
  ok(true, 'professor: login (sem diferença de maiúsculas) e senha certos → entra');

  // 5. a conta do professor não abre a porta da Família; a Família é criada com a confirmação de um adulto
  await sair(pg, BASE);
  await pg.getByTestId('entrar-familia').click();
  await entrarCom(pg, 'prof.bia', 'bolota22');
  await pg.getByTestId('login-outra-porta').waitFor();
  ok(await pg.getByTestId('area-familia').count() === 0, 'família: a conta do professor não abre a Área da Família (avisa a porta certa)');
  await pg.getByTestId('ir-criar-conta').click();
  await pg.locator('[data-testid="acesso-adulto"][data-modo="confirmar"]').waitFor();
  ok(true, 'família: criar outra conta pede antes um adulto já cadastrado');
  await entrarCom(pg, 'prof.bia', 'bolota22');
  await pg.locator('[data-testid="criar-conta"][data-tipo="responsavel"]').waitFor();
  await pg.getByTestId('conta-nome').fill('Rui');
  await pg.getByTestId('conta-login').fill('prof.bia');
  await pg.getByTestId('conta-senha').fill('familia1');
  await pg.getByTestId('conta-senha2').fill('familia1');
  await pg.getByTestId('conta-criar').click();
  await pg.getByTestId('conta-erro').waitFor();
  ok(/já existe/.test(await pg.getByTestId('conta-erro').innerText()), 'login repetido é recusado');
  await pg.getByTestId('conta-login').fill('rui@exemplo.com');
  await pg.getByTestId('conta-criar').click();
  await pg.getByTestId('area-familia').waitFor();
  ok(true, 'família: conta com e-mail como login → Área da Família');

  // 6. esqueci a senha (sem servidor: troca no aparelho, com aviso honesto)
  await sair(pg, BASE);
  await pg.getByTestId('entrar-professor').click();
  await pg.getByTestId('esqueci-senha').click();
  ok(/não dá para mandar e-mail/.test(await pg.getByTestId('esqueci').innerText()), 'esqueci a senha: diz com honestidade que não manda e-mail (sem servidor)');
  await pg.getByTestId('esqueci-login').fill('ninguem');
  await segurar(pg, 'segurar-redefinir');
  await pg.getByText('Não achamos este login').waitFor();
  await pg.getByTestId('esqueci-login').fill('prof.bia');
  await segurar(pg, 'segurar-redefinir');
  await pg.getByTestId('nova-senha1').fill('nova-senha3');
  await pg.getByTestId('nova-senha2').fill('nova-senha3');
  await pg.getByTestId('confirmar-nova-senha').click();
  await pg.getByTestId('area-professor').waitFor();
  await sair(pg, BASE);
  await pg.getByTestId('entrar-professor').click();
  await entrarCom(pg, 'prof.bia', 'bolota22');
  await pg.getByText('Login ou senha errados').waitFor();
  await entrarCom(pg, 'prof.bia', 'nova-senha3');
  await pg.getByTestId('area-professor').waitFor();
  ok(true, 'esqueci a senha: a senha nova entra e a antiga não');

  // 7. conta antiga (só PIN, de antes do login): entra com o PIN e cria login e senha
  await pg.evaluate(async () => {
    const sal = 'sal-antigo-e2e';
    const chave = await crypto.subtle.importKey('raw', new TextEncoder().encode('1234'), 'PBKDF2', false, ['deriveBits']);
    const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: new TextEncoder().encode(sal), iterations: 60_000 }, chave, 256);
    const hashPin = 'p1:' + [...new Uint8Array(bits)].map((x) => x.toString(16).padStart(2, '0')).join('');
    const db = await new Promise((r) => { const q = indexedDB.open('fonema'); q.onsuccess = () => r(q.result); });
    const atual = await new Promise((r) => { const q = db.transaction('config').objectStore('config').get('contas'); q.onsuccess = () => r(q.result); });
    const contas = [...(atual?.valor ?? []), { id: 'ct-antiga', nome: 'Rosa', tipo: 'responsavel', salt: sal, hashPin, criadaEm: 1 }];
    await new Promise((r) => { const t = db.transaction('config', 'readwrite'); t.objectStore('config').put({ id: 'contas', valor: contas }); t.oncomplete = r; });
  });
  await sair(pg, BASE);
  await pg.reload();
  await pg.getByTestId('entrar-familia').click();
  await pg.getByTestId('entrar-com-pin').click();
  await pg.getByTestId('pin').fill('0000');
  await pg.getByText('PIN incorreto').waitFor();
  await pg.getByTestId('pin').fill('1234');
  await pg.getByTestId('migrar').waitFor();
  await pg.getByTestId('migrar-login').fill('rosa');
  await pg.getByTestId('migrar-senha').fill('rosa2026');
  await pg.getByTestId('migrar-senha2').fill('rosa2026');
  await pg.getByTestId('migrar-salvar').click();
  await pg.getByTestId('area-familia').waitFor();
  await sair(pg, BASE);
  await pg.getByTestId('entrar-familia').click();
  ok(await pg.getByTestId('entrar-com-pin').count() === 0, 'conta antiga: depois de criar login e senha, o PIN some');
  await entrarCom(pg, 'rosa', 'rosa2026');
  await pg.getByTestId('area-familia').waitFor();
  ok(true, 'conta antiga com PIN: entrou com o PIN uma vez, criou login e senha e entra com eles');

  // 8. administrador: link discreto no rodapé → #/admin (senha própria)
  await sair(pg, BASE);
  await pg.getByTestId('entrar-admin-geral').click();
  await pg.getByTestId('acesso-admin').waitFor();
  ok(pg.url().endsWith('#/admin'), 'administrador: o link do rodapé abre a Área do administrador');
  await pg.getByTestId('admin-nome').fill('Dono');
  await pg.getByTestId('admin-senha').fill('dono-forte-1');
  await pg.getByTestId('admin-senha2').fill('dono-forte-1');
  await pg.getByTestId('criar-admin').click();
  await pg.getByTestId('area-admin').waitFor();
  await pg.getByTestId('sair-admin').click();
  await pg.getByTestId('inicio').waitFor();
  await pg.getByTestId('entrar-admin-geral').click();
  await pg.getByTestId('admin-senha').fill('errada-123');
  await pg.getByTestId('entrar-admin').click();
  await pg.getByTestId('admin-erro').waitFor();
  await pg.getByTestId('admin-senha').fill('dono-forte-1');
  await pg.getByTestId('entrar-admin').click();
  await pg.getByTestId('area-admin').waitFor();
  ok(true, 'administrador: senha errada recusada, senha certa entra');
  ok(await pg.locator('[data-testid="area-professor"], [data-testid="area-familia"]').count() === 0, 'administrador: área própria, separada da família e do professor');
  await ctx.close();
}
