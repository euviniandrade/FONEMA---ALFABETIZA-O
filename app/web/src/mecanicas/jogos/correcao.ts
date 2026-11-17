/**
 * Falas comuns dos JOGOS FÔNICOS (Corre-Som e Bichinho Come-Som). Só clipes JÁ GRAVADOS (a voz nova é de outra frente;
 * as falas próprias que fariam falta estão em app/docs/falas-pendentes.md §1c).
 *
 * Correção CONTRASTIVA do erro (docs/pedagogia/04 §1, 06 §4): "Você escolheu este som:" + o som escolhido, depois o que muda
 * entre os dois (pares de voz: "O F não tem voz… O V tem voz…") ou "Eu pedi este som:" + o som pedido, e "Escuta os dois e
 * tenta de novo." Nunca diz a resposta nem o nome da letra pedida (regras 1 e 3).
 */
import { FALAS, FALAS_DOS_PARES, FALAS_FONICAS, contrasteDosSons, type Fala } from '@fonema/conteudo';
import type { Crianca } from '@fonema/motor';
import type { ItemJogo, OpcaoJogo } from '@fonema/motor';
import { espera } from '../../servicos/ambiente.ts';
import { voz } from '../../servicos/voz.ts';
import { explicarContraste, temFrasesDoPar } from '../contraste.ts';

const F = FALAS_FONICAS;

/** Fala com balão: a tela mostra o texto enquanto a voz toca (sem clipe, fica só o texto). */
export type Dizer = (f: Fala | string) => Promise<void>;

/** Toca o som puro (estímulo), `vezes` seguidas. Sem clipe, nada toca (o item nem entra na rodada: `temSom`). */
export const tocarSom = (fonema: string, vezes = 2) => voz.somReal(fonema, vezes);

/** O nome combinado da figura (04 R10), na voz da Sofia. */
export const dizerFigura = (o: OpcaoJogo) => voz.falar(o.falar ?? o.id, { quem: 'sofia' });

/** Correção contrastiva do erro: o som escolhido × o som pedido, e o que muda entre eles. */
export async function corrigirEscolha(item: ItemJogo, escolhida: OpcaoJogo, diz: Dizer, vivo: () => boolean): Promise<void> {
  const certo = item.somAlvo;
  const contraste = contrasteDosSons(escolhida.som, certo);
  // 1. o que a criança escolheu
  if (escolhida.letra) await diz(temFrasesDoPar(escolhida.som, certo) ? FALAS_DOS_PARES[escolhida.som].tocou : F.letraFaz);
  else if (item.formato === 'som-figura') { await dizerFigura(escolhida); await diz(F.figuraComeca); }
  else { await dizerFigura(escolhida); await diz(F.voceEscolheu); }
  if (!vivo()) return;
  await voz.somReal(escolhida.som, 1);
  await espera(250);
  if (!vivo()) return;
  // 2. o que muda / o som pedido
  if (contraste === 'voz' || (contraste === 'boca' && temFrasesDoPar(escolhida.som, certo))) await explicarContraste(escolhida.som, certo, contraste);
  else {
    await diz(F.euPedi);
    await voz.somReal(certo, 1);
    await espera(200);
    if (contraste) await explicarContraste(escolhida.som, certo, contraste);
  }
  if (!vivo()) return;
  await diz(F.tentaDeNovo);
}

/** Depois do acerto: o apoio da fase ("Isso! Esse é o som do B.") quando gravado, senão um dos elogios gravados. */
export async function comemorar(item: ItemJogo, k: number, erros: number, crianca: Crianca, diz: Dizer): Promise<void> {
  if (item.apoio && erros <= 1) {
    const quem = item.apoio.quem === 'tales' ? 'tales' : 'sofia';
    if (voz.temTodas([item.apoio.texto], quem)) { await diz({ quem, texto: item.apoio.texto }); return; }
    await diz({ quem, texto: F.essaEALetra });
    return;
  }
  void crianca;
  await diz({ quem: 'sofia', texto: erros > 1 ? FALAS.erroJunto.replace('?', '!') : FALAS.acertos[k % FALAS.acertos.length] });
}
