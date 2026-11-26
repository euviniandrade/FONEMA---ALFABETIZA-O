/**
 * Estúdio criativo › Jogos (fila nº 32) no motor: a lista editada da Casa do Som NUNCA dá a uma criança palavra que ela
 * ainda não sabe escrever (palavraLiberada, regra 2); jogo desligado sai do catálogo de extras e do desafio do fim.
 */
import { afterEach, describe, expect, it } from 'vitest';
import { CONTEUDO_EDITAVEL, EDICOES_PUBLICADAS, FASES_TF, type Edicao } from '@fonema/conteudo';
import { catalogoDeExtras, desafioDaFase, moveisLiberados, progressoInicial, receberMovel, dadosJogosVila, type Progresso } from '../src/index.ts';

const T0 = new Date('2026-11-17T15:00:00').getTime();
function ateTF(ate: string): Progresso {
  const base = progressoInicial('c1', T0);
  const fases = { ...base.fases };
  for (const f of FASES_TF) { fases[f.id] = { estado: 'concluida', sessoes: 1, concluidaEm: T0 }; if (f.id === ate) break; }
  return { ...base, fases, sessoesFeitas: 3 };
}
const ed = (x: Omit<Edicao, 'em'>): Edicao => ({ em: 1, ...x });
afterEach(() => { CONTEUDO_EDITAVEL.aplicar(EDICOES_PUBLICADAS); });

describe('jogos editados no Estúdio', () => {
  it('palavra de lição mais adiante entra na lista, mas a criança só a recebe depois da lição', () => {
    CONTEUDO_EDITAVEL.aplicar([ed({ colecao: 'jogos', item: 'casa-som', tipo: 'definir', caminho: ['palavras'], valor: ['uva', 'ovo', 'mala', 'pato', 'foca'] })]);
    const cedo = moveisLiberados(ateTF('TF-22'));
    expect(cedo).toContain('pato');
    expect(cedo).not.toContain('foca');
    expect(moveisLiberados(ateTF(FASES_TF[FASES_TF.length - 1].id))).toContain('foca');
  });

  it('palavra tirada da lista: o móvel que a criança já ganhou continua na casinha', () => {
    let p = receberMovel(ateTF('TF-22'), 'bule');
    CONTEUDO_EDITAVEL.aplicar([ed({ colecao: 'jogos', item: 'casa-som', tipo: 'definir', caminho: ['palavras'], valor: ['uva', 'ovo', 'mala'] })]);
    p = { ...p };
    expect(dadosJogosVila(p).moveis).toContain('bule');
    expect(moveisLiberados(p)).not.toContain('bule');
  });

  it('jogo desligado: sem "Novo!"/cadeado no catálogo e sem desafio no fim da missão', () => {
    const p = ateTF('TF-22');
    const comPar = FASES_TF.find((f) => desafioDaFase(ateTF(f.id), f.id)?.jogo === 'estrada-pares')!;
    expect(catalogoDeExtras(p, { rapido: true }).some((x) => x.id === 'jogo:carteiro')).toBe(true);
    CONTEUDO_EDITAVEL.aplicar([
      ed({ colecao: 'jogos', item: 'carteiro', tipo: 'definir', caminho: ['ligado'], valor: false }),
      ed({ colecao: 'jogos', item: 'estrada-pares', tipo: 'definir', caminho: ['ligado'], valor: false }),
      ed({ colecao: 'jogos', item: 'memoria-sons', tipo: 'definir', caminho: ['ligado'], valor: false })
    ]);
    const ids = catalogoDeExtras(p, { rapido: true }).map((x) => x.id);
    expect(ids).not.toContain('jogo:carteiro');
    expect(ids.some((x) => x.startsWith('jogo:memoria'))).toBe(false);
    expect(ids).toContain('jogo:casa-som');
    expect(desafioDaFase(ateTF(comPar.id), comPar.id)?.jogo).not.toBe('estrada-pares');
  });
});
