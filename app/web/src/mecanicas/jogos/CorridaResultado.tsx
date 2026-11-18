/**
 * Fim da corrida do Corre-Som (D035): pontos, estrelas, meta e selo, e as letras que errou com o SOM de cada uma — aqui sim a
 * correção contrastiva completa (o som que era × o som em que passou), que não cabe no meio da corrida.
 * Pontos e estrelas são do jogo: não contam como domínio (regra 4).
 */
import { Figura, Icone } from '../../componentes/ui.tsx';
import { LetraAa } from '../../componentes/LetraAa.tsx';
import { efeitos } from '../../servicos/efeitos.ts';
import { dizerFigura, tocarSom } from './correcao.ts';
import type { ErroCorrida, ResumoCorrida } from './CorreSom.tsx';
import type { OpcaoJogo } from '@fonema/motor';

function Opcao({ o, formato }: { o: OpcaoJogo; formato: ErroCorrida['formato'] }) {
  const ouvir = async () => { efeitos.toque(); if (!o.letra) await dizerFigura(o); await tocarSom(o.som, 1); };
  return (
    <button className="cr-opcao" onClick={() => void ouvir()} aria-label={o.letra ? `Ouvir o som da letra ${o.letra}` : `Ouvir ${o.falar ?? o.id}`} data-formato={formato}>
      {o.letra ? <LetraAa letra={o.letra} className="cs-letra" /> : <Figura palavra={o.figura ?? o.id} />}
      <Icone nome="som" />
    </button>
  );
}

export function ResultadoCorrida({ resumo, moedinhas, onDeNovo, onProximo, onOutra, onContinuar }: {
  resumo: ResumoCorrida; moedinhas?: number; onDeNovo?: () => void; onProximo?: () => void; onOutra?: () => void; onContinuar?: () => void;
}) {
  // cada erro aparece uma vez (mesmo par alvo × escolhida)
  const erros = resumo.erradas.filter((e, k, xs) => xs.findIndex((x) => x.alvo.id === e.alvo.id && x.escolhida.id === e.escolhida.id) === k).slice(0, 4);
  return (
    <section className="cartao corrida-fim" data-testid="corrida-fim" data-pontos={resumo.pontos} data-estrelas={resumo.estrelas} data-bateu={resumo.bateuMeta ? '1' : undefined}>
      <h1 className="t">{resumo.bateuMeta ? 'Meta batida!' : 'Corrida feita!'}</h1>
      <div className="cr-pontos"><Icone nome="estrela" /><b>{resumo.pontos}</b><span>pontos</span></div>
      {resumo.meta ? (
        <>
          <div className="cr-estrelas" aria-label={`${resumo.estrelas} de 3 estrelas`}>
            {[1, 2, 3].map((k) => <span key={k} className={k <= resumo.estrelas ? 'cheia' : ''}><Icone nome="estrela" /></span>)}
          </div>
          <p className="cr-meta">{resumo.bateuMeta ? `Selo da corrida · Nível ${resumo.nivel}` : `Meta: ${resumo.meta} pontos`}</p>
        </>
      ) : null}
      <p className="cr-numeros">{`${resumo.acertos} certas · ${resumo.moedas} moedinhas na pista · sequência de ${resumo.melhorSequencia}`}</p>
      {moedinhas ? <p className="cr-lojinha" data-testid="corrida-moedinhas">{`+${moedinhas} moedinha${moedinhas > 1 ? 's' : ''} para a Lojinha`}</p> : null}
      {erros.length ? (
        <div className="cr-erros" data-testid="corrida-erros">
          <p>Vamos ouvir de novo:</p>
          {erros.map((e, k) => (
            <div key={k} className="cr-erro">
              <span className="cr-rot">Era</span><Opcao o={e.alvo} formato={e.formato} />
              <span className="cr-rot">você passou no</span><Opcao o={e.escolhida} formato={e.formato} />
            </div>
          ))}
        </div>
      ) : null}
      <div className="linha-botoes centro">
        {onContinuar ? <button className="btn grande" onClick={onContinuar} data-testid="corrida-continuar"><Icone nome="seta" />Continuar</button> : null}
        {onProximo ? <button className="btn grande" onClick={onProximo} data-testid="corrida-proximo"><Icone nome="raio" />Próximo nível</button> : null}
        {onDeNovo ? <button className={`btn grande ${onProximo ? 'ipe' : ''}`} onClick={onDeNovo} data-testid="jogo-de-novo"><Icone nome="repetir" />Jogar de novo</button> : null}
        {onOutra ? <button className="btn grande ipe" onClick={onOutra} data-testid="jogo-outra"><Icone nome="seta-esq" />Escolher outro</button> : null}
      </div>
    </section>
  );
}
