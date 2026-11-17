/** Contas da visão geral e dos relatórios do administrador (puro: testado em resumo-admin.test.ts). */

/**
 * Tempo de uso estimado pelos registros (atividades, sessões, fases…): soma os intervalos entre registros seguidos
 * de até `pausaMaxMin` minutos (mais que isso conta como pausa) e um minuto por bloco de uso.
 * É uma estimativa: o app não mede tempo de tela.
 */
export function minutosDeUso(momentos: number[], pausaMaxMin = 10): number {
  const t = [...momentos].sort((a, b) => a - b);
  if (!t.length) return 0;
  let ms = 0;
  let blocos = 1;
  for (let i = 1; i < t.length; i++) {
    const d = t[i] - t[i - 1];
    if (d <= pausaMaxMin * 60_000) ms += d; else blocos++;
  }
  return Math.round(ms / 60_000) + blocos;
}

export const contarDesde = (momentos: number[], desde: number) => momentos.filter((m) => m >= desde).length;

/** CSV para planilha em português (separador ";", aspas quando precisa, BOM para o Excel abrir com acentos). */
export function paraCsv(linhas: (string | number | null | undefined)[][]): string {
  const cel = (v: string | number | null | undefined) => {
    const s = v === null || v === undefined ? '' : String(v);
    // fórmula no começo da célula vira texto (proteção contra injeção em planilha)
    const seguro = /^[=+\-@]/.test(s) ? `'${s}` : s;
    return /[;"\n\r]/.test(seguro) ? `"${seguro.replace(/"/g, '""')}"` : seguro;
  };
  return '﻿' + linhas.map((l) => l.map(cel).join(';')).join('\r\n') + '\r\n';
}

export const idade = (anoNascimento: number, agora = new Date()) => Math.max(0, agora.getFullYear() - anoNascimento);
