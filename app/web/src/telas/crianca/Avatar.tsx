import { Fundo, Icone } from '../../componentes/ui.tsx';
import { useState } from 'react';
import { FALAS } from '@fonema/conteudo';
import { useCrianca } from '../../contexto.tsx';
import { navegar } from '../../rotas.ts';
import { AvatarGrande, Balao, Carregando, Topo } from '../../componentes/basicos.tsx';
import { asset } from '../../servicos/ambiente.ts';
import { efeitos } from '../../servicos/efeitos.ts';
import { falar } from '../../util.ts';

export const BASES: [string, string][] = [
  ['crianca-01-crespo-curto', 'cabelo crespo curto'], ['crianca-02-trancas', 'tranças'], ['crianca-03-coque', 'coque'],
  ['crianca-04-ruiva-ondulada', 'cabelo ruivo ondulado'], ['crianca-05-chanel-liso', 'cabelo liso curto'], ['crianca-06-liso-longo-pintura', 'liso longo com pintura no rosto'],
  ['crianca-07-black-power-alto', 'black power'], ['crianca-08-oculos-aparelho', 'óculos e aparelho auditivo'], ['crianca-09-cadeira-de-rodas', 'cadeira de rodas'],
  ['crianca-b01-crespo-curto', 'cabelo crespo curto'], ['crianca-b02-trancas', 'tranças'], ['crianca-b03-coque', 'coque'],
  ['crianca-b04-ruiva-ondulada', 'ruivo ondulado'], ['crianca-b05-chanel-liso', 'liso curto'], ['crianca-b06-liso-longo-pintura', 'liso longo'],
  ['crianca-b07-black-power-alto', 'black power'], ['crianca-b08-oculos-aparelho-cadeira', 'óculos, aparelho e cadeira de rodas']
];
export const CANTINHOS: [string, string, string][] = [['mata', 'Mata', '#3E9A63'], ['ipe', 'Ipê', '#F4B73C'], ['ceu', 'Céu', '#A8D5F2'], ['barro', 'Barro', '#C9714C']];

/** Avatar (D008): montado por peças, sem foto, sem joias. Acessibilidade (óculos, aparelho, cadeira) sempre grátis. */
export function Avatar({ criancaId }: { criancaId: string }) {
  const { crianca, progresso, salvarCrianca } = useCrianca(criancaId);
  const [passo, setPasso] = useState<1 | 2>(1);
  if (!crianca || !progresso) return <Carregando />;
  const primeiraVez = progresso.sessoesFeitas === 0;
  const escolher = async (base: string) => { efeitos.toque(); await salvarCrianca({ ...crianca, avatar: { ...crianca.avatar, base } }); };
  return (
    <div className="tela-avatar">
      <Fundo cena="quintal" desfoque={14} tom="calmo" />
      <Topo crianca={crianca} voltar={primeiraVez ? undefined : `c/${criancaId}/vila`} titulo="Meu personagem" />
      <main className="palco">
        <section className="cartao avatar-cartao">
          <Balao fala={FALAS.avatar} crianca={crianca} auto />
          <div className="avatar-layout">
            <AvatarGrande crianca={crianca} itens={progresso.equipados} />
            <div>
              <div className="abas" role="tablist">
                <button role="tab" aria-selected={passo === 1} className={`btn ${passo === 1 ? 'pri' : ''}`} onClick={() => setPasso(1)}><Icone nome="pessoa" />Meu jeito</button>
                <button role="tab" aria-selected={passo === 2} className={`btn ${passo === 2 ? 'pri' : ''}`} onClick={() => setPasso(2)}><Icone nome="casa" />Meu cantinho</button>
              </div>
              {passo === 1 ? (
                <div className="grade-avatar" role="radiogroup" aria-label="Escolha o jeito do seu personagem">
                  {BASES.map(([b, d]) => (
                    <button key={b} role="radio" aria-checked={crianca.avatar.base === b} className={`opcao-avatar ${crianca.avatar.base === b ? 'sel' : ''}`} onClick={() => escolher(b)} aria-label={d} data-base={b}>
                      <img src={asset(`avatar/${b}.webp`)} alt="" />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="grade-cantinho" role="radiogroup" aria-label="Cor do seu cantinho">
                  {CANTINHOS.map(([id, nome, cor]) => (
                    <button key={id} role="radio" aria-checked={crianca.avatar.cantinho === id} className={`opcao-cantinho ${crianca.avatar.cantinho === id ? 'sel' : ''}`} style={{ background: cor }} onClick={() => salvarCrianca({ ...crianca, avatar: { ...crianca.avatar, cantinho: id } })}>{nome}</button>
                  ))}
                </div>
              )}
              <p className="nota-mic">Óculos, aparelho auditivo e cadeira de rodas são sempre grátis. Sem foto, sem joias.</p>
            </div>
          </div>
          <div className="linha-botoes" style={{ justifyContent: 'flex-end' }}><button
            className="btn enorme ipe brilha"
            data-testid="avatar-pronto"
            onClick={async () => { await falar(FALAS.avatarPronto, crianca); navegar(primeiraVez ? `c/${criancaId}/chegada` : `c/${criancaId}/vila`); }}
          >
            <Icone nome="check" />Pronto!
          </button></div>
        </section>
      </main>
    </div>
  );
}
