/**
 * Moedinhas FIXAS, em bloco no ritual de fim (D002; jogo-completo README §3):
 * atividade = 1, marco de domínio = 5, região = 10; teto de 12 por dia. Sem sorte, sem perda.
 */
import type { ConfigPlataforma } from '@fonema/conteudo';
import type { Progresso } from './estado.ts';
import { diaDe } from './estado.ts';

export interface GanhoMoedinhas {
  atividades: number;
  marcos: number;
  regioes: number;
}

export interface ResultadoCredito {
  progresso: Progresso;
  creditado: number;
  calculado: number;
  /** Quanto ficou de fora por causa do teto do dia (a criança nunca vê "perdeu"). */
  acimaDoTeto: number;
}

export function calcularMoedinhas(g: GanhoMoedinhas, cfg: ConfigPlataforma['moedinhas']): number {
  return g.atividades * cfg.atividade + g.marcos * cfg.marcoDominio + g.regioes * cfg.regiao;
}

export function creditarEmBloco(p: Progresso, g: GanhoMoedinhas, cfg: ConfigPlataforma['moedinhas'], agora: number): ResultadoCredito {
  const dia = diaDe(agora);
  const jaHoje = p.moedinhas.porDia[dia] ?? 0;
  const calculado = calcularMoedinhas(g, cfg);
  const creditado = Math.max(0, Math.min(calculado, cfg.tetoDia - jaHoje));
  return {
    progresso: {
      ...p,
      moedinhas: {
        saldo: p.moedinhas.saldo + creditado,
        total: p.moedinhas.total + creditado,
        porDia: { ...p.moedinhas.porDia, [dia]: jaHoje + creditado }
      }
    },
    creditado,
    calculado,
    acimaDoTeto: calculado - creditado
  };
}

export function podeComprar(p: Progresso, preco: number): { pode: boolean; faltam: number } {
  return { pode: p.moedinhas.saldo >= preco, faltam: Math.max(0, preco - p.moedinhas.saldo) };
}

export function comprar(p: Progresso, itemId: string, preco: number): Progresso {
  if (p.itens.includes(itemId)) throw new Error('Item já está na mochila.');
  if (p.moedinhas.saldo < preco) throw new Error('Moedinhas insuficientes.');
  return { ...p, itens: [...p.itens, itemId], moedinhas: { ...p.moedinhas, saldo: p.moedinhas.saldo - preco } };
}
