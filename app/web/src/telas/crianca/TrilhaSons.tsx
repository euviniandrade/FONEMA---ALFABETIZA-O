import { useEffect, useMemo, type CSSProperties } from 'react';
import { FALAS_TRILHA_SONS, FASES_TF, REGIOES, TEXTOS_DECODIFICAVEIS, type Fase } from '@fonema/conteudo';
import { podeEntrar, textoLiberado, type Progresso } from '@fonema/motor';
import { useCrianca } from '../../contexto.tsx';
import { navegar } from '../../rotas.ts';
import { Carregando, Topo } from '../../componentes/basicos.tsx';
import { ProximaMissao } from '../../componentes/Guia.tsx';
import { PainelGuia } from '../../componentes/Guia.tsx';
import { Fundo, Icone } from '../../componentes/ui.tsx';
import { asset } from '../../servicos/ambiente.ts';
import { letraAa } from '../../componentes/LetraAa.tsx';
import { falar } from '../../util.ts';
import '../../estilos-trilha-sons.css';
import '../../estilos-biblioteca.css';

type Estado = 'dominada' | 'feita' | 'atual' | 'liberada' | 'aberta' | 'trancada';

/** Concluída × dominada (D030 etapa 5): o disco fica dourado só quando o motor marcou a fase como DOMINADA. */
function estadoDe(p: Progresso, f: Fase): Estado {
  const pf = p.fases[f.id];
  if (pf?.estado === 'concluida') return pf.dominadaEm ? 'dominada' : 'feita';
  if (f.id === p.faseAtual) return 'atual';
  if (pf?.estado === 'aberta') return pf.liberada ? 'liberada' : 'aberta';
  return 'trancada';
}
const ROTULO: Record<Estado, string> = {
  dominada: 'dominada', feita: 'concluída, ainda em treino', atual: 'é a de agora', liberada: 'aberta para revisar', aberta: 'aberta', trancada: 'ainda trancada'
};
const BLOCOS: { n: number; titulo: string; sub: string }[] = [
  { n: 1, titulo: 'Os sons das vogais', sub: 'a, e, i, o, u e as vogais juntas' },
  { n: 2, titulo: 'Sons que esticam', sub: 'mmm, fff, vvv, lll, sss… e as primeiras frases' },
  { n: 3, titulo: 'Sons que estouram', sub: 'p, t, b, c, d, g e o TI e DI' },
  // 17/11: blocos 4 e 5 aparecem quando têm lição na jornada (as em espera de som ficam de fora, fases/tf.ts)
  { n: 4, titulo: 'Vogais abertas e nasais', sub: 'é, ó, ê, ô, ã…' },
  { n: 5, titulo: 'O som do R', sub: 'rato, rua, arara' }
];

/**
 * TRILHA DOS SONS (D030): a trilha fônica que ensina a LER e ESCREVER, em blocos (vogais, sons que esticam, sons que estouram, vogais abertas e nasais, R). Cada disco é uma lição (o som
 * novo), uma regra (O/E no fim, TI/DI) ou uma revisão (estrela). Verde = concluída; dourado = dominada (respostas
 * conferidas, em dias diferentes). Sem pular: só abre o que o motor liberou (D021/D026).
 */
export function TrilhaSons({ criancaId }: { criancaId: string }) {
  const { crianca, progresso } = useCrianca(criancaId);
  const fala = useMemo(() => ({ quem: 'sofia' as const, texto: FALAS_TRILHA_SONS.trilha }), []);
  useEffect(() => { if (crianca) void falar(fala, crianca); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [crianca?.id]);
  if (!crianca || !progresso) return <Carregando />;

  const feitas = FASES_TF.filter((f) => progresso.fases[f.id]?.estado === 'concluida').length;
  const dominadas = FASES_TF.filter((f) => progresso.fases[f.id]?.dominadaEm).length;
  const naTrilha = FASES_TF.some((f) => f.id === progresso.faseAtual);
  const etapaAtual = REGIOES.find((r) => r.fases.includes(progresso.faseAtual))?.id;
  let k = 0;

  return (
    <div className="tela-sons com-guia" data-testid="trilha-sons">
      <Fundo cena="biblioteca" desfoque={14} tom="claro" />
      <Topo crianca={crianca} moedinhas={progresso.moedinhas.saldo} voltar={`c/${criancaId}/vila`} titulo="Trilha dos Sons"><ProximaMissao criancaId={criancaId} progresso={progresso} /></Topo>
      <main className="palco">
        <PainelGuia crianca={crianca} progresso={progresso} onde="trilha" />
        <section className="cartao sons-cartao">
          <header className="sons-cab">
            <img className="sons-dupla" src={asset('dupla/dupla-corpo.webp')} alt="Sofia e Tales" />
            <div className="sons-cab-texto">
              <h1 className="t">Trilha dos Sons</h1>
              <p className="pergunta-guia">Cada som novo vira palavra para ler e escrever!</p>
              <div className="alfabeto-progresso" role="progressbar" aria-valuemin={0} aria-valuemax={FASES_TF.length} aria-valuenow={feitas} aria-label={`${feitas} de ${FASES_TF.length} lições`}>
                <div className="alfabeto-barra"><i style={{ width: `${(feitas / FASES_TF.length) * 100}%` }} /></div>
                <b data-testid="sons-feitas">{feitas} de {FASES_TF.length} lições · {dominadas} dominadas</b>
              </div>
              <div className="sons-legenda" aria-hidden="true">
                <span><i className="l-dominada" />dominada</span><span><i className="l-feita" />concluída, ainda treinando</span><span><i className="l-atual" />a de agora</span><span><i className="l-trancada" />trancada</span>
              </div>
            </div>
            <button className="ouvir" onClick={() => void falar(fala, crianca)} aria-label="Ouvir"><Icone nome="som" /></button>
          </header>

          <div className="sons-blocos">
            {BLOCOS.filter((b) => FASES_TF.some((f) => f.trilhaSons?.bloco === b.n)).map((b) => (
              <section key={b.n} className={`sons-bloco b${b.n}`} aria-label={b.titulo}>
                <h2 className="t">{b.titulo} <small>{b.sub}</small></h2>
                <ol className="sons-fila">
                  {FASES_TF.filter((f) => f.trilhaSons?.bloco === b.n).map((f) => {
                    const e = estadoDe(progresso, f);
                    const ts = f.trilhaSons!;
                    const aberto = podeEntrar(progresso, f.id);
                    return (
                      <li key={f.id} className={`sons-marco ${e} ${ts.tipo}`} style={{ ['--i' as string]: k++ } as CSSProperties}>
                        <button disabled={!aberto} onClick={() => navegar(`c/${criancaId}/fase/${f.id}`)} data-fase={f.id} data-estado={e} aria-label={`${f.titulo}: ${ROTULO[e]}`} aria-current={e === 'atual' ? 'step' : undefined}>
                          <span className="sons-disco">
                            {ts.tipo === 'revisao' && ts.rotulo === '★' ? <Icone nome="estrela" /> : letraAa(ts.rotulo)}
                            {e === 'dominada' || e === 'feita' ? <span className="sons-selo"><Icone nome={e === 'dominada' ? 'estrela' : 'check'} /></span> : null}
                            {e === 'trancada' ? <span className="sons-cadeado"><Icone nome="cadeado" /></span> : null}
                          </span>
                          <span className="sons-rotulo">{e === 'atual' ? 'Agora!' : ts.tipo === 'revisao' ? 'Revisão' : ts.tipo === 'regra' ? 'Segredo' : ''}</span>
                        </button>
                      </li>
                    );
                  })}
                </ol>
                {TEXTOS_DECODIFICAVEIS.filter((t) => t.bloco === b.n).map((t) => {
                  const aberto = textoLiberado(progresso, t);
                  return (
                    <button key={t.id} className={`sons-livrinho ${aberto ? '' : 'trancado'}`} disabled={!aberto} onClick={() => navegar(`c/${criancaId}/leitura/texto-${t.id}`)} data-texto={t.id} aria-label={`Texto para ler sozinho: ${t.titulo}`}>
                      <Icone nome={aberto ? 'caderno' : 'cadeado'} /><span>Ler sozinho: <b>{t.titulo}</b></span>
                    </button>
                  );
                })}
              </section>
            ))}
          </div>

          <div className="sons-rodape">
            <ol className="jornada-etapas" aria-label="As etapas da jornada">
              {REGIOES.map((r) => (
                <li key={r.id} className={r.id === etapaAtual ? 'agora' : r.fases.every((x) => progresso.fases[x]?.estado === 'concluida') ? 'feita' : ''}>
                  <b>{r.etapa}</b><small>{r.nome.split(' · ')[0]}</small>
                </li>
              ))}
            </ol>
            {/* D031: a jornada alterna letra (Trilha A–Z) e lição (aqui): o botão sempre leva à fase de agora, em qualquer trilha */}
            <button className="btn enorme ipe brilha" onClick={() => navegar(`c/${criancaId}/fase/${progresso.faseAtual}`)} data-testid="sons-continuar">
              <Icone nome="play" />{!naTrilha ? 'Continuar a jornada' : feitas ? 'Continuar' : 'Começar'}
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
