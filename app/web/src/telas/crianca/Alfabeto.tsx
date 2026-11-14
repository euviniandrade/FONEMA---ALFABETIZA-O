import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { ALFABETO, FALAS_ALFABETO, FASES_ALFABETO, REGIOES, type Fase } from '@fonema/conteudo';
import { podeEntrar, type Progresso } from '@fonema/motor';
import { useCrianca } from '../../contexto.tsx';
import { navegar } from '../../rotas.ts';
import { Carregando, Topo } from '../../componentes/basicos.tsx';
import { Figura, Fundo, Icone } from '../../componentes/ui.tsx';
import { asset } from '../../servicos/ambiente.ts';
import { falar } from '../../util.ts';

type Estado = 'feita' | 'atual' | 'liberada' | 'aberta' | 'trancada';

function estadoDe(p: Progresso, f: Fase): Estado {
  const pf = p.fases[f.id];
  if (pf?.estado === 'concluida') return 'feita';
  if (f.id === p.faseAtual) return 'atual';
  if (pf?.estado === 'aberta') return pf.liberada ? 'liberada' : 'aberta';
  return 'trancada';
}
const ROTULO: Record<Estado, string> = { feita: 'concluída', atual: 'é a de agora', liberada: 'aberta para revisar', aberta: 'aberta', trancada: 'ainda trancada' };

/** Quantas colunas cabem (a trilha serpenteia: uma fileira vai, a outra volta). */
function useColunas(): number {
  const calc = () => (typeof window === 'undefined' ? 7 : window.innerWidth < 520 ? 4 : window.innerWidth < 860 ? 5 : window.innerWidth < 1120 ? 6 : 7);
  const [c, setC] = useState(calc);
  useEffect(() => {
    const f = () => setC(calc());
    window.addEventListener('resize', f);
    return () => window.removeEventListener('resize', f);
  }, []);
  return c;
}

/**
 * TRILHA DO ALFABETO (D027): o caminho das 26 letras, de A a Z, com as revisões (estrelas) e a Festa do Alfabeto
 * (troféu) no fim. Letras concluídas brilham em ouro; a de agora pulsa; as próximas esperam com cadeado.
 * Sem pular: só abre o que o motor liberou (D021/D026).
 */
export function TrilhaAlfabeto({ criancaId }: { criancaId: string }) {
  const { crianca, progresso } = useCrianca(criancaId);
  const colunas = useColunas();
  const fala = useMemo(() => ({ quem: 'sofia' as const, texto: FALAS_ALFABETO.trilha }), []);
  useEffect(() => { if (crianca) falar(fala, crianca); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [crianca?.id]);
  if (!crianca || !progresso) return <Carregando />;

  const letrasFeitas = FASES_ALFABETO.filter((f) => f.alfabeto?.tipo === 'letra' && progresso.fases[f.id]?.estado === 'concluida').length;
  const completo = progresso.fases['AL-FESTA']?.estado === 'concluida';
  const noAlfabeto = FASES_ALFABETO.some((f) => f.id === progresso.faseAtual);
  const etapaAtual = REGIOES.find((r) => r.fases.includes(progresso.faseAtual))?.id;

  return (
    <div className="tela-alfabeto" data-testid="trilha-alfabeto">
      <Fundo cena="quintal" desfoque={14} tom="claro" />
      <Topo crianca={crianca} moedinhas={progresso.moedinhas.saldo} voltar={`c/${criancaId}/vila`} titulo="Trilha do Alfabeto" />
      <main className="palco">
        <section className="cartao alfabeto-cartao">
          <header className="alfabeto-cab">
            <img className="alfabeto-dupla" src={asset('dupla/dupla-corpo.webp')} alt="Sofia e Tales" />
            <div className="alfabeto-cab-texto">
              <h1 className="t">Trilha do Alfabeto</h1>
              <p className="pergunta-guia">Cada letra tem o seu som. Uma letra por vez, de A a Z!</p>
              <div className="alfabeto-progresso" role="progressbar" aria-valuemin={0} aria-valuemax={26} aria-valuenow={letrasFeitas} aria-label={`${letrasFeitas} de 26 letras conhecidas`}>
                <div className="alfabeto-barra"><i style={{ width: `${(letrasFeitas / 26) * 100}%` }} /></div>
                <b data-testid="letras-feitas">{letrasFeitas} de 26 letras</b>
              </div>
            </div>
            <button className="ouvir" onClick={() => falar(fala, crianca)} aria-label="Ouvir"><Icone nome="som" /></button>
          </header>

          <ol className="alfabeto-trilha" style={{ ['--colunas' as string]: colunas } as CSSProperties}>
            {FASES_ALFABETO.map((f, i) => {
              const e = estadoDe(progresso, f);
              const tipo = f.alfabeto!.tipo;
              const l = tipo === 'letra' ? ALFABETO.find((x) => x.letra === f.alfabeto!.letra)! : null;
              const linha = Math.floor(i / colunas);
              const naLinha = i % colunas;
              const col = linha % 2 === 0 ? naLinha : colunas - 1 - naLinha;
              // de onde vem o caminho: da esquerda, da direita ou de cima (na virada da fileira)
              const vem = i === 0 ? 'inicio' : naLinha === 0 ? 'cima' : linha % 2 === 0 ? 'esquerda' : 'direita';
              const aberto = podeEntrar(progresso, f.id);
              const nome = l ? `Letra ${l.letra}, de ${l.palavra}` : f.titulo;
              return (
                <li key={f.id} className={`marco ${tipo} ${e} vem-${vem}`} style={{ gridColumn: col + 1, gridRow: linha + 1, ['--i' as string]: i } as CSSProperties}>
                  <button
                    className="marco-btn" disabled={!aberto} data-fase={f.id} data-estado={e}
                    aria-label={`${nome}: ${ROTULO[e]}`} aria-current={e === 'atual' ? 'step' : undefined}
                    onClick={() => navegar(`c/${criancaId}/fase/${f.id}`)}
                  >
                    <span className="marco-disco">
                      {l ? <b>{l.letra}<small>{l.minuscula}</small></b> : <Icone nome={tipo === 'festa' ? 'trofeu' : 'estrela'} />}
                      {e === 'feita' ? <span className="marco-check"><Icone nome="check" /></span> : null}
                      {e === 'trancada' ? <span className="marco-cadeado"><Icone nome="cadeado" /></span> : null}
                    </span>
                    {l && e === 'feita' ? <Figura palavra={l.palavra} className="marco-figura" /> : null}
                    <span className="marco-rotulo">{l ? (e === 'atual' ? 'Agora!' : e === 'feita' ? l.palavra : '') : tipo === 'festa' ? 'Festa!' : 'Revisão'}</span>
                  </button>
                </li>
              );
            })}
          </ol>

          <div className="alfabeto-rodape">
            <ol className="jornada-etapas" aria-label="As etapas da jornada">
              {REGIOES.map((r) => (
                <li key={r.id} className={r.id === etapaAtual ? 'agora' : r.fases.every((x) => progresso.fases[x]?.estado === 'concluida') ? 'feita' : ''}>
                  <b>{r.etapa}</b><small>{r.nome.split(' · ')[0]}</small>
                </li>
              ))}
              <li className="breve"><b>Frases</b><small>Em breve</small></li>
            </ol>
            <button className="btn enorme ipe brilha" onClick={() => navegar(`c/${criancaId}/fase/${progresso.faseAtual}`)} data-testid="trilha-continuar">
              <Icone nome="play" />{completo && !noAlfabeto ? 'Continuar a jornada' : letrasFeitas ? 'Continuar' : 'Começar pela letra A'}
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
