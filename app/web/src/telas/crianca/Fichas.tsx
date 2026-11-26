/**
 * FICHAS DE LEITURA (D033) dentro do Cantinho da Leitura: #/c/:id/leitura/fichas (os campos), …/ficha.<campo> (a ficha:
 * palavras para ler e trancadas, e os níveis) e …/ficha.<campo>.<modo> (a atividade). `.desafio` no fim = oferecida no fim de
 * uma lição da Trilha dos Sons (contexto 'desafio'); sem isso, contexto 'livre'. Nada aqui trava a trilha nem dá moedinhas.
 *
 * Palavras trancadas aparecem só como figura apagada com cadeado ("abre com as missões"; era "em breve" até a fila nº 30),
 * NUNCA escritas (regra 2). As palavras para ler
 * aparecem escritas, sem figura (a figura é a resposta do nível 1).
 */
import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { CAMPO_POR_ID, FALAS_FICHAS as F } from '@fonema/conteudo';
import { estadoDosCampos, modosDaFicha, tentativasDasFichas, type ModoFicha } from '@fonema/motor';
import { useCrianca } from '../../contexto.tsx';
import { navegar } from '../../rotas.ts';
import { Balao, Carregando, Topo } from '../../componentes/basicos.tsx';
import { ProximaMissao } from '../../componentes/Guia.tsx';
import { Boquinha } from '../../componentes/Boquinha.tsx';
import { Figura, Fundo, Icone } from '../../componentes/ui.tsx';
import { voz } from '../../servicos/voz.ts';
import { FichaBocas, FichaEscolha, type ResultadoFicha } from '../../mecanicas/FichaLeitura.tsx';
import { useRegistroLivre } from './Biblioteca.tsx';
import '../../estilos-biblioteca.css';
import '../../estilos-fichas.css';

const NOME_DO_MODO: Record<ModoFicha, { n: string; titulo: string; sub: string; icone: string }> = {
  ler: { n: '1', titulo: 'Vamos ler juntos?', sub: 'A boquinha mostra cada som', icone: 'boca' },
  ouvir: { n: '2', titulo: 'Só o som', sub: 'Escute e ache a figura', icone: 'som' },
  'ouvir-palavra': { n: '2+', titulo: 'Som e palavra', sub: 'Escute e ache a palavra escrita', icone: 'caderno' },
  bocas: { n: '3', titulo: 'Letra e boquinha', sub: 'Ligue cada letra à boca', icone: 'olho' },
  'bocas-palavra': { n: '4', titulo: 'Só a boquinha', sub: 'Olhe a boca e ache a palavra', icone: 'estrela' }
};
const MODOS: ModoFicha[] = ['ler', 'ouvir', 'ouvir-palavra', 'bocas', 'bocas-palavra'];

export function TelaFichas({ criancaId, sub }: { criancaId: string; sub: string }) {
  const { crianca, progresso } = useCrianca(criancaId);
  const reg = useRegistroLivre(criancaId);
  const partes = sub.split('.');
  const desafio = partes[partes.length - 1] === 'desafio';
  const campoId = partes[0] === 'ficha' ? partes[1] : undefined;
  const modo = partes[2] && partes[2] !== 'desafio' ? partes[2] as ModoFicha : undefined;
  const [feito, setFeito] = useState<{ acertos: number; total: number; abriu?: ModoFicha } | null>(null);
  const [rodada, setRodada] = useState(0);
  useEffect(() => { setFeito(null); }, [sub]);
  useEffect(() => () => voz.parar(), []);
  if (!crianca || !progresso) return <Carregando />;
  const campo = campoId ? CAMPO_POR_ID[campoId] : undefined;
  const sufixo = desafio ? '.desafio' : '';
  const base = `c/${criancaId}/leitura`;
  const voltar = !campo ? base : modo ? `${base}/ficha.${campo.id}${sufixo}` : desafio ? `c/${criancaId}/vila` : `${base}/fichas`;

  let corpo;
  if (campo && modo && feito) {
    corpo = (
      <section className="cartao biblio-feito ficha-feito" data-testid="ficha-feito">
        <div className="biblio-feito-selo" aria-hidden="true"><Icone nome="estrela" /></div>
        <h1 className="t">Ficha lida!</h1>
        <p>{feito.total ? `Você acertou ${feito.acertos} de ${feito.total} sozinho.` : 'Você praticou com a Sofia.'}</p>
        {feito.abriu ? <p className="ficha-abriu" data-testid="ficha-abriu"><Icone nome="estrela" />Abriu o nível {NOME_DO_MODO[feito.abriu].n}: {NOME_DO_MODO[feito.abriu].titulo}</p> : null}
        <div className="linha-botoes centro">
          <button className="btn grande" onClick={() => { setFeito(null); setRodada((r) => r + 1); }} data-testid="ficha-de-novo-rodada"><Icone nome="repetir" />De novo</button>
          <button className="btn grande ipe" onClick={() => navegar(voltar)} data-testid="ficha-voltar"><Icone nome="seta-esq" />Voltar à ficha</button>
        </div>
      </section>
    );
  } else if (campo && modo && modosDaFicha(progresso, campo.id).find((m) => m.modo === modo)?.aberto) {
    const fim = async (r: ResultadoFicha) => {
      const antes = modosDaFicha(progresso, campo.id);
      await reg.salvar({ id: `livre-ficha-${campo.id}-${modo}`, titulo: `Ficha de leitura: ${campo.titulo}` }, r.tentativas,
        (x) => ({ ...x, jogos: [...x.jogos, { id: `ficha-${campo.id}-${modo}`, em: Date.now(), acertos: r.acertos, total: r.total }] }));
      // qual nível abriu agora (para comemorar): calculado com as tentativas novas
      const depoisAc = (m: ModoFicha) => antes.find((x) => x.modo === m)!.acertos + r.tentativas.filter((t) => t.formato === `ficha-${m}` && t.tipo === 'avaliada' && t.acertou && !t.comAjuda).length;
      const ordem: [ModoFicha, ModoFicha][] = [['ler', 'ouvir'], ['ouvir', 'ouvir-palavra'], ['ouvir', 'bocas'], ['bocas', 'bocas-palavra']];
      const abriu = ordem.find(([de, para]) => de === modo && !antes.find((x) => x.modo === para)!.aberto && depoisAc(de) >= 3)?.[1];
      setFeito({ acertos: r.acertos, total: r.total, ...(abriu ? { abriu } : {}) });
    };
    const props = { progresso, campo: campo.id, crianca, sessao: reg.sessao, contexto: desafio ? 'desafio' as const : 'livre' as const, onFim: fim };
    corpo = (
      <section className="cartao atividade biblio-atividade ficha-cartao-ativ" key={`${sub}-${rodada}`}>
        <h2 className="titulo-cena t"><Icone nome={NOME_DO_MODO[modo].icone} />{campo.titulo} · {NOME_DO_MODO[modo].titulo}</h2>
        {modo === 'bocas' ? <FichaBocas {...props} /> : <FichaEscolha {...props} modo={modo} />}
      </section>
    );
  } else if (campo) {
    corpo = <Campo criancaId={criancaId} campoId={campo.id} sufixo={sufixo} desafio={desafio} />;
  } else {
    corpo = <Campos criancaId={criancaId} />;
  }

  return (
    <div className="tela-biblio tela-fichas" data-testid="fichas" data-sub={sub}>
      <Fundo cena="biblioteca" desfoque={12} tom="claro" />
      <Topo crianca={crianca} moedinhas={progresso.moedinhas.saldo} voltar={voltar} titulo="Fichas de leitura">{campo ? null : <ProximaMissao criancaId={criancaId} progresso={progresso} />}</Topo>
      <main className="palco">{corpo}</main>
    </div>
  );
}

/** Os cartões dos campos. */
function Campos({ criancaId }: { criancaId: string }) {
  const { crianca, progresso } = useCrianca(criancaId);
  const campos = useMemo(() => (progresso ? estadoDosCampos(progresso) : []), [progresso]);
  return (
    <section className="cartao biblio-cartao">
      <header className="biblio-cab">
        <div className="ficha-cab-boca"><Boquinha fonema="a" fixa /></div>
        <div>
          <h1 className="t">Fichas de leitura</h1>
          {crianca ? <Balao fala={{ quem: 'sofia', texto: F.lerJuntos }} crianca={crianca} /> : null}
        </div>
      </header>
      <div className="ficha-campos">
        {campos.map((c, k) => (
          <button key={c.campo.id} className={`ficha-campo ${c.legiveis.length ? '' : 'trancado'}`} style={{ ['--k' as string]: k } as CSSProperties}
            onClick={() => navegar(`c/${criancaId}/leitura/ficha.${c.campo.id}`)} data-testid={`ficha-campo-${c.campo.id}`} data-legiveis={c.legiveis.length}>
            <span className="ficha-campo-capa"><Figura palavra={c.campo.capa} /></span>
            <b>{c.campo.titulo}</b>
            <span className="ficha-campo-conta">
              {c.legiveis.length ? <><Icone nome="olho" />{c.legiveis.length} para ler</> : <><Icone nome="cadeado" />abre com as missões</>}
              <i className="ficha-campo-barra" aria-hidden="true"><i style={{ width: `${(100 * c.legiveis.length) / c.campo.palavras.length}%` }} /></i>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

/** A ficha de um campo: palavras para ler (escritas), trancadas (figura apagada + cadeado) e os níveis. */
function Campo({ criancaId, campoId, sufixo, desafio }: { criancaId: string; campoId: string; sufixo: string; desafio: boolean }) {
  const { crianca, progresso } = useCrianca(criancaId);
  if (!crianca || !progresso) return null;
  const c = estadoDosCampos(progresso).find((x) => x.campo.id === campoId)!;
  const modos = modosDaFicha(progresso, campoId);
  const lidas = new Set(tentativasDasFichas(progresso).filter((t) => t.tipo === 'avaliada' && t.acertou && !t.comAjuda && t.categoria !== 'grafema').map((t) => t.alvo?.toLowerCase()));
  return (
    <section className="cartao biblio-cartao ficha-campo-tela" data-testid="ficha-campo">
      <header className="ficha-titulo">
        <span className="ficha-campo-capa grande"><Figura palavra={c.campo.capa} /></span>
        <div>
          <h1 className="t">{c.campo.titulo}{desafio ? <small className="ficha-desafio-selo">desafio</small> : null}</h1>
          <p className="ficha-sub">{c.legiveis.length ? `${c.legiveis.length} palavras que você já sabe ler` : 'Ainda não tem palavra para ler aqui: abre com as missões.'}</p>
        </div>
      </header>
      <h2 className="biblio-secao t"><Icone nome="estrela" />Escolha o nível</h2>
      <div className="ficha-niveis">
        {modos.map((m, k) => (
          <button key={m.modo} className={`ficha-nivel n${m.nivel} ${m.aberto ? '' : 'trancado'}`} disabled={!m.aberto} style={{ ['--k' as string]: k } as CSSProperties}
            onClick={() => navegar(`c/${criancaId}/leitura/ficha.${campoId}.${m.modo}${sufixo}`)} data-testid={`ficha-nivel-${m.modo}`}>
            <span className="ficha-nivel-n">{NOME_DO_MODO[m.modo].n}</span>
            <b>{NOME_DO_MODO[m.modo].titulo}</b>
            <small>{m.aberto ? NOME_DO_MODO[m.modo].sub : <><Icone nome="cadeado" />{m.motivo}</>}</small>
          </button>
        ))}
      </div>
      <h2 className="biblio-secao t"><Icone nome="olho" />Palavras da ficha</h2>
      <div className="ficha-palavras">
        {c.legiveis.map((w) => (
          <span key={w} className="ficha-palavra-cartao" data-legivel={w}>{w.toUpperCase()}{lidas.has(w) ? <Icone nome="check" /> : null}</span>
        ))}
        {c.trancadas.map((w, k) => (
          <span key={w} className="ficha-palavra-cartao trancada" data-trancada={k} aria-label="Palavra que abre com as missões">
            <Figura palavra={w} /><span className="ficha-cadeado"><Icone nome="cadeado" />abre com as missões</span>
          </span>
        ))}
      </div>
    </section>
  );
}

export const MODOS_DA_FICHA = MODOS;
