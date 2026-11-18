/**
 * MEMÓRIA DOS SONS (#/c/:id/memoria[/:faseId]) — fila do dono nº 17; regras em motor/src/memoria-sons.ts.
 *  - sem `faseId`: Brincar › Jogos; a criança escolhe o nível aberto pelo que já foi ensinado; contexto 'livre';
 *  - com `faseId` (AL-X): desafio opcional oferecido no fim da fase da Trilha A–Z (Ritual), nível 2 com a letra X; contexto 'desafio'.
 * Sem moedinhas ganhas, sem cronômetro, sem ranking. Nível 1 é só para olhar e ouvir (exposição).
 */
import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { dadosBiblioteca, desafioMemoria, montarMemoria, niveisDaMemoria, type NivelMemoria } from '@fonema/motor';
import { useCrianca } from '../../contexto.tsx';
import { navegar } from '../../rotas.ts';
import { Carregando, Topo } from '../../componentes/basicos.tsx';
import { Figura, Fundo, Icone } from '../../componentes/ui.tsx';
import { voz } from '../../servicos/voz.ts';
import { sementeDaTentativa } from '../../mecanicas/comum.tsx';
import { useSonsComClipe } from '../../mecanicas/jogos/JogoFonico.tsx';
import { MemoriaSons, type ResultadoMemoria } from '../../mecanicas/jogos/MemoriaSons.tsx';
import { Falta, useMissoesAteAbrir } from '../../componentes/Desbloqueio.tsx';
import { useRegistroLivre } from './Biblioteca.tsx';
import '../../estilos-biblioteca.css';
import '../../mecanicas/jogos/estilos-jogos.css';
import '../../mecanicas/jogos/estilos-memoria.css';

export const ID_MEMORIA = 'memoria-sons';
export const NOME_MEMORIA = 'Memória dos Sons';

const NIVEIS: { nivel: NivelMemoria; nome: string; treina: string; capa: ('fig' | 'letra' | 'som' | 'verso')[] }[] = [
  { nivel: 1, nome: 'Olhar e lembrar', treina: '3 pares. Olhe e ouça antes de virar.', capa: ['fig', 'letra'] },
  { nivel: 2, nome: 'Memória', treina: '3 ou 4 pares de cena e letra.', capa: ['verso', 'verso'] },
  { nivel: 3, nome: 'Memória grande', treina: '5 ou 6 pares. Sons mais parecidos.', capa: ['verso', 'verso', 'verso'] },
  { nivel: 4, nome: 'Só ouvindo', treina: 'Carta de som e carta de letra, sem figura.', capa: ['som', 'letra'] }
];

/** Miniatura das cartas (capa dos cartões). */
export function CapaMemoria({ itens }: { itens: ('fig' | 'letra' | 'som' | 'verso')[] }) {
  return (
    <span className="mem-capa" aria-hidden="true">
      {itens.map((x, k) => (
        <span key={k} className={`mini ${x}`}>
          {x === 'fig' ? <Figura palavra="cena-a-sofia" /> : x === 'letra' ? 'A' : x === 'som' ? <Icone nome="som" /> : <Icone nome="estrela" />}
        </span>
      ))}
    </span>
  );
}

export function MemoriaDosSons({ criancaId, faseId }: { criancaId: string; faseId?: string }) {
  const { crianca, progresso } = useCrianca(criancaId);
  const reg = useRegistroLivre(criancaId);
  const sons = useSonsComClipe();
  const [nivel, setNivel] = useState<NivelMemoria | null>(null);
  const [rodadaN, setRodadaN] = useState(0);
  const [fim, setFim] = useState<{ acertos: number; avaliadas: number; pares: number } | null>(null);
  useEffect(() => () => voz.parar(), []);
  const missoes = useMissoesAteAbrir(progresso);
  const temSom = useMemo(() => (sons ? (f: string) => sons.has(f) : undefined), [sons]);
  const desafio = useMemo(() => (progresso && faseId && temSom ? desafioMemoria(progresso, faseId, temSom) : null), [progresso, faseId, temSom]);
  const nivelAtual = desafio ? desafio.nivel : nivel;
  const rodada = useMemo(() => {
    if (!progresso || !temSom || !nivelAtual) return null;
    return montarMemoria(progresso, { nivel: nivelAtual, semente: sementeDaTentativa() || 11 + rodadaN, temSom, ...(desafio ? { incluir: desafio.letra } : {}) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nivelAtual, temSom, rodadaN, !!progresso, desafio?.letra]);

  if (!crianca || !progresso || !sons) return <Carregando />;
  const estados = niveisDaMemoria(progresso, temSom);
  const contexto = faseId ? 'desafio' as const : 'livre' as const;
  const voltar = faseId ? `c/${criancaId}/vila` : `c/${criancaId}/brincar`;
  const vezes = dadosBiblioteca(progresso).jogos.filter((x) => x.id === ID_MEMORIA).length;

  const terminar = async (r: ResultadoMemoria) => {
    const avaliadas = r.tentativas.filter((t) => t.tipo === 'avaliada');
    const acertos = avaliadas.filter((t) => t.acertou && !t.comAjuda).length;
    const titulo = `${NOME_MEMORIA} (${NIVEIS.find((x) => x.nivel === nivelAtual)?.nome ?? ''})`;
    await reg.salvar({ id: faseId ? `desafio-${ID_MEMORIA}-${faseId}` : `livre-${ID_MEMORIA}`, titulo }, r.tentativas,
      (d) => ({ ...d, jogos: [...d.jogos, { id: ID_MEMORIA, em: Date.now(), acertos, total: avaliadas.length }] }));
    setFim({ acertos, avaliadas: avaliadas.length, pares: r.tentativas.length });
  };

  return (
    <div className="tela-brincar tela-memoria" data-testid="memoria-tela" data-contexto={contexto}>
      <Fundo cena="quintal" desfoque={12} tom="claro" />
      <Topo crianca={crianca} moedinhas={progresso.moedinhas.saldo} voltar={voltar} titulo={NOME_MEMORIA} />
      <main className="palco">
        {fim ? (
          <section className="cartao biblio-feito jogo-fim" data-testid="memoria-fim">
            <div className="biblio-feito-selo" aria-hidden="true"><Icone nome="estrela" /></div>
            <h1 className="t">Todos os pares!</h1>
            <p>{`Você achou ${fim.pares} pares de som e letra.`}</p>
            <div className="linha-botoes centro">
              <button className="btn grande" onClick={() => { setFim(null); setRodadaN((r) => r + 1); }} data-testid="memoria-de-novo"><Icone nome="repetir" />Jogar de novo</button>
              {faseId ? <button className="btn grande ipe" onClick={() => navegar(`c/${criancaId}/vila`)} data-testid="voltar-vila"><Icone nome="casa" />Voltar para a vila</button>
                : <button className="btn grande ipe" onClick={() => { setFim(null); setNivel(null); }} data-testid="memoria-outro"><Icone nome="seta-esq" />Escolher outro</button>}
            </div>
          </section>
        ) : rodada && nivelAtual ? (
          <section className="cartao atividade jogo-cartao jogo-memoria-cartao" key={`${nivelAtual}-${rodadaN}`}>
            <h2 className="titulo-cena t"><Icone nome="estrela" />{NOME_MEMORIA} · {NIVEIS.find((x) => x.nivel === nivelAtual)?.nome}</h2>
            <MemoriaSons rodada={rodada} crianca={crianca} sessao={reg.sessao} cena={faseId ? `desafio-${ID_MEMORIA}-${faseId}` : `livre-${ID_MEMORIA}`} contexto={contexto} onFim={(r) => void terminar(r)} />
          </section>
        ) : (
          <section className="cartao jogo-variacoes" data-testid="memoria-niveis">
            <header className="jogo-variacoes-cab">
              <CapaMemoria itens={['fig', 'verso', 'letra']} />
              <div>
                <h1 className="t">{NOME_MEMORIA}</h1>
                <p>Vire as cartas e ache os pares: a cena que faz o som e a letra desse som.</p>
              </div>
              {vezes ? <span className="biblio-selo"><Icone nome="check" />{vezes}×</span> : null}
            </header>
            {faseId ? <p className="jv-motivo">Este desafio abre quando o som desta letra já entra no jogo.</p> : null}
            <div className="mem-niveis">
              {NIVEIS.map((v, k) => {
                const e = estados.find((x) => x.nivel === v.nivel);
                const aberto = !!e?.liberado;
                return (
                  <button key={v.nivel} className={`mem-nivel ${aberto ? '' : 'trancada'}`} style={{ ['--k' as string]: k } as CSSProperties} disabled={!aberto}
                    onClick={() => { setNivel(v.nivel); setRodadaN((r) => r + 1); }} data-testid={`memoria-nivel-${v.nivel}`}>
                    <span className="mem-nivel-num">{v.nivel}</span>
                    <CapaMemoria itens={v.capa} />
                    <b>{v.nome}</b>
                    {aberto ? <small>{v.treina}</small> : <Falta texto={e?.motivo} n={missoes[`jogo:memoria:${v.nivel}`]} compacto />}
                    {!aberto ? <span className="jogo-cadeado" aria-hidden="true"><Icone nome="cadeado" /></span> : null}
                  </button>
                );
              })}
            </div>
            <p className="brincar-nota">Só entram os sons que você já estudou na trilha. Pode jogar quantas vezes quiser.</p>
            <div className="linha-botoes centro"><button className="btn ipe" onClick={() => navegar(voltar)}><Icone nome="seta-esq" />{faseId ? 'Voltar para a vila' : 'Outros jogos'}</button></div>
          </section>
        )}
      </main>
    </div>
  );
}
