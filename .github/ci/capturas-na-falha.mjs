// FONEMA · CI: tira uma captura de tela de cada página aberta quando o E2E termina com erro.
// Carregado antes do teste (`node --import ../../.github/ci/capturas-na-falha.mjs e2e/fluxo.e2e.mjs ...`),
// sem mexer no código do teste: guarda os navegadores abertos pelo `chromium.launch` e, quando o teste
// falha, salva as capturas em $CAPTURAS_FALHA (padrão: e2e-falha/ na pasta atual).
import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const require = createRequire(join(process.cwd(), 'package.json'));
const { chromium } = require('@playwright/test');
const pasta = resolve(process.env.CAPTURAS_FALHA ?? 'e2e-falha');
const navegadores = [];
const lancarOriginal = chromium.launch.bind(chromium);
chromium.launch = async (...args) => {
  const b = await lancarOriginal(...args);
  navegadores.push(b);
  return b;
};

let feito = false;
async function capturar(motivo) {
  if (feito) return;
  feito = true;
  mkdirSync(pasta, { recursive: true });
  const linhas = [`motivo: ${motivo}`];
  let n = 0;
  for (const b of navegadores) {
    if (!b.isConnected()) continue;
    for (const ctx of b.contexts()) {
      for (const p of ctx.pages()) {
        n++;
        const nome = `pagina-${String(n).padStart(2, '0')}.png`;
        linhas.push(`${nome}  ${p.url()}`);
        try {
          await p.screenshot({ path: join(pasta, nome), timeout: 10000 });
        } catch (e) {
          linhas.push(`  (sem captura: ${String(e).split('\n')[0]})`);
        }
      }
    }
  }
  writeFileSync(join(pasta, 'paginas.txt'), linhas.join('\n') + '\n');
  console.error(`[ci] ${n} captura(s) da falha em ${pasta}`);
  await Promise.all(navegadores.map((b) => b.close().catch(() => {})));
}

// Quando o teste falha, o `main().catch` do E2E escreve o erro com `console.error(e)` e marca
// `process.exitCode = 1`, deixando o navegador aberto. Ao ver um Error no console.error, captura na hora
// (o navegador ainda responde) e depois fecha os navegadores para o processo poder sair.
const erroOriginal = console.error.bind(console);
console.error = (...args) => {
  erroOriginal(...args);
  if (args[0] instanceof Error) void capturar(`erro: ${args[0].message.split('\n')[0]}`);
};
process.on('uncaughtExceptionMonitor', () => { void capturar('erro não tratado'); });
