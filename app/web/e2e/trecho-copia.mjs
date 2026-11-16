// FONEMA · trecho E2E: guardar e RESTAURAR uma cópia dos dados (Área do Adulto → Configurações).
// Confere: o arquivo baixado volta inteiro; arquivo estranho é recusado sem mudar nada; nada é trocado antes de o
// adulto confirmar; depois de confirmar, as crianças do aparelho passam a ser as da cópia.
// Uso: node e2e/fluxo.e2e.mjs --copia   (também roda dentro do E2E completo e do --sem-jornada)
import { readFileSync } from 'node:fs';

/**
 * @param {import('@playwright/test').Browser} browser
 * @param {{ BASE: string, ok: (c: boolean, m: string) => void, passarPorteira: Function, cadastrar: Function, montarAvatar: Function, erros: string[] }} h
 */
export async function trechoCopia(browser, { BASE, ok, passarPorteira, cadastrar, montarAvatar, erros }) {
  console.log('C. Cópia dos dados: guardar, recusar arquivo estranho, confirmar antes de substituir, restaurar');
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, locale: 'pt-BR', serviceWorkers: 'block', acceptDownloads: true });
  await ctx.addInitScript(() => { try { localStorage.setItem('fonema-teste-rapido', '1'); } catch { /* sem armazenamento */ } });
  const pg = await ctx.newPage();
  pg.on('pageerror', (e) => erros.push(String(e)));
  await pg.goto(BASE + '#/adulto/cadastro');
  await passarPorteira(pg);
  await cadastrar(pg, 'Lia', 'f');
  await montarAvatar(pg);
  await pg.waitForFunction(() => location.hash.includes('/c/'));

  const irConfig = async () => {
    await pg.goto(BASE + '#/adulto/config');
    await passarPorteira(pg);
    await pg.getByTestId('restaurar-copia').waitFor();
  };
  await irConfig();
  const [baixa] = await Promise.all([pg.waitForEvent('download'), pg.getByRole('button', { name: 'Guardar uma cópia dos dados' }).click()]);
  const copia = JSON.parse(readFileSync(await baixa.path(), 'utf8'));
  ok(Array.isArray(copia.criancas) && copia.criancas.some((c) => c.nome === 'Lia'), 'a cópia baixada tem a criança do aparelho');

  // arquivo estranho: recusado, nada muda
  await pg.getByTestId('arquivo-copia').setInputFiles({ name: 'foto.json', mimeType: 'application/json', buffer: Buffer.from('{"oi":1}') });
  await pg.getByTestId('copia-erro').waitFor();
  ok(!(await pg.getByTestId('copia-confirmar').count()), 'arquivo que não é cópia: aviso de erro e nada para confirmar');

  // cópia com outro nome: só troca depois do "Sim"
  const editada = { ...copia, criancas: copia.criancas.map((c) => ({ ...c, nome: 'Lina' })) };
  const arquivo = { name: 'fonema-copia.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(editada)) };
  await pg.getByTestId('arquivo-copia').setInputFiles(arquivo);
  await pg.getByTestId('copia-confirmar').waitFor();
  ok(/Lina/.test(await pg.getByTestId('copia-confirmar').innerText()) && /substituir/.test(await pg.getByTestId('copia-confirmar').innerText()), 'antes de substituir, o adulto vê de quem é a cópia e confirma');
  await pg.getByRole('button', { name: 'Cancelar' }).click();
  await pg.goto(BASE + '#/adulto/familia');
  await passarPorteira(pg);
  await pg.waitForTimeout(800);
  ok(/Lia\b/.test(await pg.locator('body').innerText()) && !/Lina/.test(await pg.locator('body').innerText()), 'cancelar não muda nada');

  await irConfig();
  await pg.getByTestId('arquivo-copia').setInputFiles(arquivo);
  await pg.getByTestId('confirmar-restaurar').click();
  await pg.waitForLoadState('load');
  await pg.goto(BASE + '#/adulto/familia');
  await passarPorteira(pg);
  await pg.waitForFunction(() => /Lina/.test(document.body.innerText), null, { timeout: 10000 });
  ok(true, 'depois de confirmar, as crianças do aparelho são as da cópia (a conta do adulto continua a mesma)');
  await ctx.close();
}
