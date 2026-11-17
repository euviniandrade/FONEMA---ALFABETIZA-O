/**
 * Relatório do verificador de decodificabilidade por fase (docs/pedagogia/05 §6.8): o que a criança lê ou escreve
 * sozinha em cada fase, o valor sonoro que barrou cada palavra e a unidade que a libera.
 * Uso: npx tsx scripts/relatorio-decodificabilidade.ts  → docs/relatorio-decodificabilidade.md
 */
import { writeFileSync } from 'node:fs';
import { FASES, FASES_TF_EM_ESPERA } from '@fonema/conteudo';
import { relatorioDaFase, verificarFase } from '../packages/conteudo/src/fases/verificar-fases.ts';

const itens = FASES.flatMap((f) => verificarFase(f));
const espera = FASES_TF_EM_ESPERA.flatMap((e) => verificarFase(e.fase));
const errosEspera = espera.filter((i) => !i.resultado.ok).length;
const erros = itens.filter((i) => !i.resultado.ok).length;
const avisos = itens.filter((i) => i.resultado.ok && i.resultado.avisos.length).length;
const md = [
  '# Relatório de decodificabilidade (gerado)',
  '',
  `Gerado por \`scripts/relatorio-decodificabilidade.ts\`. ${itens.length} leituras e escritas conferidas em ${FASES.length} fases · **${erros} erros** · ${avisos} com aviso.`,
  'Erro = valor sonoro ainda não ensinado na unidade da fase (o teste falha). Aviso = A5 (vogal nasalizada pela consoante seguinte), vogal átona que muda na fala ou pronúncia regional (TI/DI).',
  '',
  ...FASES.map(relatorioDaFase),
  '## Lições da Trilha dos Sons em espera (fora da jornada)',
  '',
  `Escritas e conferidas, mas fora da jornada até existirem os sons puros que elas tocam (fases/tf.ts › FASES_TF_EM_ESPERA). ${espera.length} leituras e escritas · **${errosEspera} erros**.`,
  '',
  ...FASES_TF_EM_ESPERA.map((e) => `${relatorioDaFase(e.fase).replace(/^(### .*)$/m, `$1 — em espera: ${e.motivo}`)}`)
].join('\n');
writeFileSync('docs/relatorio-decodificabilidade.md', md);
console.log(`${itens.length} itens · ${erros} erros · ${avisos} avisos · em espera: ${espera.length} itens, ${errosEspera} erros`);
