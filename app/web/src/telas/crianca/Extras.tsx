import { useEffect, useRef, useState } from 'react';
import { PersonagemVivo } from '../../componentes/PersonagemVivo.tsx';
import { CONQUISTAS, FASE_POR_ID, REGIOES, SONS, SURPRESAS } from '@fonema/conteudo';
import { AREA_DO_DEGRAU, infoNome, podeEntrar, registrarSondagem, resultadoPorArea, situacaoSondagem, type AreaSondagem, type ItemSondagem } from '@fonema/motor';
import { useApp, useCrianca } from '../../contexto.tsx';
import { navegar } from '../../rotas.ts';
import { AvatarGrande, Balao, BotaoOuvir, Carregando, Topo } from '../../componentes/basicos.tsx';
import { Figura, Fundo, Icone } from '../../componentes/ui.tsx';
import { Selo } from '../../componentes/recompensas.tsx';
import { EspelhoBoca, useEspelhoEmbed } from '../../componentes/EspelhoDoSom.tsx';
import { asset, mundo3dDisponivel } from '../../servicos/ambiente.ts';
import { efeitos } from '../../servicos/efeitos.ts';
import { gravar, temGravacao } from '../../servicos/microfone.ts';
import { voz } from '../../servicos/voz.ts';
import { novoId } from '../../dados/repositorio.ts';
import { falar, falarVarias, textoTela } from '../../util.ts';

/** Álbum de Conquistas: por região; ganhas brilham; as outras mostram a HABILIDADE (P1-b). */
export function Album({ criancaId }: { criancaId: string }) {
  const { crianca, progresso } = useCrianca(criancaId);
  if (!crianca || !progresso) return <Carregando />;
  const letra = infoNome(crianca.nome, crianca.pronuncia.grafia).letras;
  const ganhas = Object.keys(progresso.conquistas).length;
  return (
    <div className="tela-album" data-testid="album">
      <Fundo cena="biblioteca" desfoque={14} tom="calmo" />
      <Topo crianca={crianca} moedinhas={progresso.moedinhas.saldo} voltar={`c/${criancaId}/vila`} titulo="Álbum de Conquistas" />
      <main className="palco">
        <section className="cartao">
          <div className="album-cab">
            <AvatarGrande crianca={crianca} itens={progresso.equipados} />
            <div>
              <h1 className="t">Álbum de {crianca.nome}</h1>
              <p className="album-contagem"><img src={asset('figuras/estrela.webp')} alt="" />{ganhas} {ganhas === 1 ? 'conquista' : 'conquistas'}</p>
              <p>Cada uma conta uma coisa que você aprendeu.</p>
              {progresso.itens.length ? <div className="mochila"><b>Mochila:</b>{progresso.itens.map((i) => <img key={i} src={asset(`itens/${i}.webp`)} alt={i} title={i} />)}</div> : null}
              {progresso.areas.length ? <p className="nota-mic">Lugares novos na vila: {SURPRESAS.filter((s) => progresso.areas.includes(s.id)).map((s) => s.nome).join(' · ')}</p> : null}
            </div>
          </div>
          <div className="conheca-dupla" data-testid="conheca-dupla">
            <h2 className="t">Conheça a Sofia e o Tales</h2>
            <figure><PersonagemVivo quem="sofia" modo="giro" tamanho={230} /><figcaption>Sofia</figcaption></figure>
            <figure><PersonagemVivo quem="tales" modo="giro" tamanho={230} /><figcaption>Tales</figcaption></figure>
            <figure><PersonagemVivo quem="bolota" modo="giro" tamanho={150} /><figcaption>Bolota</figcaption></figure>
            <figure><PersonagemVivo quem="zum-zum" modo="giro" tamanho={96} /><figcaption>Zum-Zum</figcaption></figure>
            <small>Arraste com o dedo para girar.</small>
          </div>
          {REGIOES.map((r) => {
            const lista = CONQUISTAS.filter((c) => c.regiao === r.id && c.visivel_antes !== 'oculto');
            return (
              <div key={r.id} className="album-regiao" data-regiao={r.id}>
                <h2 className="t">{r.id === 'AL' ? 'Letras do alfabeto' : r.nome}</h2>
                <div className="grade-conquistas">
                  {lista.map((c) => {
                    const g = progresso.conquistas[c.id];
                    return (
                      <div key={c.id} className={`conquista-item ${g ? 'ganha' : 'bloqueada'}`} data-conquista={c.id}>
                        <Selo conquista={c} ganha={g} bloqueado={!g} letra={letra} tamanho={110} ampliavel />
                        <p className="dica-cadeado">{g ? `${g.nivel === 'unico' ? '' : g.nivel + ' · '}${new Date(g.em).toLocaleDateString('pt-BR')}` : c.visivel_antes === 'misterio' ? 'Mistério' : c.dica}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </section>
      </main>
    </div>
  );
}

/** "Conheça seu corpo": o Espelho do Som de frente (boca gigante por visema); o lado 3D entra com o novo embed (ver EspelhoDoSom.tsx). */
export function ConhecaSeuCorpo({ criancaId }: { criancaId: string }) {
  const { crianca } = useCrianca(criancaId);
  const [fonema, setFonema] = useState('a');
  const [falando, setFalando] = useState(false);
  const embed = useEspelhoEmbed();
  if (!crianca) return <Carregando />;
  const sons = ['a', 'E', 'i', 'O', 'u', 'm', 'l', 'f', 's', 'v'];
  const s = SONS[fonema];
  const ouvir = async (f: string) => {
    setFonema(f);
    setFalando(true);
    await voz.falar(SONS[f].esticado, { quem: 'sofia' });
    setFalando(false);
  };
  return (
    <div className="tela-corpo fundo-limpo">
      <Topo crianca={crianca} voltar={`c/${criancaId}/vila`} titulo="Conheça seu corpo" />
      <main className="palco">
        <section className="cartao corpo-cartao">
          <Balao fala={{ quem: 'sofia', texto: 'Olha como a boca faz cada som: os lábios, os dentes e a língua mudam de lugar. Escolha um som!' }} crianca={crianca} auto />
          <div className="corpo-layout">
            <div className="corpo-palco">
              <EspelhoBoca fonema={fonema} falando={falando} />
            </div>
            <div className="corpo-controles">
              <div className="grade-sons" role="radiogroup" aria-label="Sons">
                {sons.map((f) => <button key={f} role="radio" aria-checked={fonema === f} className={`peca ${fonema === f ? 'sel' : ''}`} onClick={() => ouvir(f)}>{f === 'E' ? 'É' : f === 'O' ? 'Ó' : SONS[f].letra}</button>)}
              </div>
              <button className="btn grande pri" onClick={() => ouvir(fonema)}><Icone nome="som" />Ouvir o som</button>
              {embed ? null : <p className="dica-boca"><Icone nome="boca" /><span>{s.dica}</span></p>}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

/** "Mostra pro professor" (D018): a criança grava ou mostra ao vivo; o professor responde em 1 toque. */
export function MostraProfessor({ criancaId, faseId }: { criancaId: string; faseId: string }) {
  const { repo } = useApp();
  const { crianca } = useCrianca(criancaId);
  const [estado, setEstado] = useState<'escolher' | 'gravando' | 'enviado'>('escolher');
  const [nivel, setNivel] = useState(0);
  const fase = FASE_POR_ID[faseId];
  useEffect(() => { if (crianca && fase?.demonstracao) falarVarias([{ quem: 'tales', texto: 'Vamos mostrar pro professor, [NOME]?' }, { quem: 'tales', texto: `${fase.demonstracao.descricao}.` }], crianca); }, [crianca, fase]);
  if (!crianca || !fase?.demonstracao) return <Carregando />;
  const enviar = async (modo: 'ao-vivo' | 'gravacao', audio?: Blob) => {
    const id = novoId('dm');
    let audioId: string | undefined;
    if (audio) { audioId = `audio-${id}`; await repo.salvarAudio(audioId, audio, Date.now()); }
    await repo.salvarDemonstracao({ id, criancaId, faseId, habilidade: fase.demonstracao!.habilidade, descricao: fase.demonstracao!.descricao, modo, audioId, status: 'pendente', criadaEm: Date.now() });
    await repo.registrarEvento({ id: novoId('ev'), criancaId, em: Date.now(), tipo: 'demonstracao', faseId, texto: `Mostrou pro professor: ${fase.demonstracao!.descricao}` });
    setEstado('enviado');
    efeitos.conquista();
    await falar({ quem: 'sofia', texto: 'Pronto! Seu professor vai ver e responder. Que orgulho de você, [NOME]!' }, crianca);
  };
  return (
    <div className="tela-mostra">
      <Fundo cena="praca" desfoque={14} tom="calmo" />
      <Topo crianca={crianca} voltar={`c/${criancaId}/vila`} titulo="Mostra pro professor" />
      <main className="palco">
        <section className="cartao mostra-cartao">
          <div className="mostra-arte" aria-hidden="true"><Icone nome="chapeu" /></div>
          <h1 className="t">Mostra pro professor</h1>
          <p className="objetivo">{fase.demonstracao.descricao}</p>
          {estado === 'enviado' ? (
            <>
              <p className="enviado" data-testid="demonstracao-enviada"><Icone nome="check" />Enviado para o professor (ou para a família, no uso em casa).</p>
              <button className="btn grande ipe" onClick={() => navegar(`c/${criancaId}/vila`)}><Icone nome="casa" />Voltar para a vila</button>
            </>
          ) : estado === 'gravando' ? (
            <div className="gravando"><p>Gravando… fala agora!</p><div className="medidor"><i style={{ width: `${nivel * 100}%` }} /></div></div>
          ) : (
            <div className="linha-botoes">
              {temGravacao() ? (
                <button className="btn grande" onClick={async () => {
                  setEstado('gravando');
                  try { const b = await gravar(4000, setNivel); await enviar('gravacao', b); } catch { setEstado('escolher'); }
                }}><Icone nome="gravar" />Gravar (4 s)</button>
              ) : null}
              <button className="btn grande verde" onClick={() => enviar('ao-vivo')} data-testid="mostrei-ao-vivo"><Icone nome="olho" />Mostrei ao vivo</button>
            </div>
          )}
          <p className="nota-mic">O áudio fica só neste aparelho e serve só para o professor ouvir.</p>
        </section>
      </main>
    </div>
  );
}


/** Sondagem lúdica "Missão das Placas da Vila" (D021 §3): para em 2 erros seguidos do mesmo degrau, termina no acerto. */
const PLACAS: { degrau: number; pergunta: string; ouvir?: string; mostrar?: string; opcoes: { id: string; rot: string }[]; certa: string }[] = [
  { degrau: 1, pergunta: 'O que rima com GATO?', ouvir: 'gato', opcoes: [{ id: 'pato', rot: 'pato' }, { id: 'bola', rot: 'bola' }], certa: 'pato' },
  { degrau: 1, pergunta: 'Quantas palmas tem BOLOTA?', ouvir: 'bo-lo-ta', opcoes: [{ id: '2', rot: 'mão mão' }, { id: '3', rot: 'mão mão mão' }], certa: '3' },
  { degrau: 2, pergunta: 'Qual começa com /mmm/?', ouvir: 'mmmm', opcoes: [{ id: 'mala', rot: 'mala' }, { id: 'sol', rot: 'sol' }], certa: 'mala' },
  { degrau: 2, pergunta: 'Qual começa com /sss/?', ouvir: 'ssss', opcoes: [{ id: 'sapo', rot: 'sapo' }, { id: 'lua', rot: 'lua' }], certa: 'sapo' },
  { degrau: 3, pergunta: 'Qual letra faz /aaa/?', ouvir: 'aaaa', opcoes: [{ id: 'A', rot: 'A' }, { id: 'O', rot: 'O' }, { id: 'U', rot: 'U' }], certa: 'A' },
  { degrau: 3, pergunta: 'Qual letra faz /iii/?', ouvir: 'iiii', opcoes: [{ id: 'E', rot: 'E' }, { id: 'I', rot: 'I' }, { id: 'A', rot: 'A' }], certa: 'I' },
  { degrau: 4, pergunta: 'Qual letra faz /fff/?', ouvir: 'ffff', opcoes: [{ id: 'F', rot: 'F' }, { id: 'M', rot: 'M' }, { id: 'L', rot: 'L' }], certa: 'F' },
  { degrau: 4, pergunta: 'Qual letra faz /lll/?', ouvir: 'llll', opcoes: [{ id: 'M', rot: 'M' }, { id: 'L', rot: 'L' }, { id: 'S', rot: 'S' }], certa: 'L' },
  { degrau: 5, pergunta: 'Lê a placa: qual é a figura?', mostrar: 'MALA', opcoes: [{ id: 'mala', rot: 'mala' }, { id: 'lua', rot: 'lua' }], certa: 'mala' },
  { degrau: 5, pergunta: 'Lê a placa: qual é a figura?', mostrar: 'LUA', opcoes: [{ id: 'mala', rot: 'mala' }, { id: 'lua', rot: 'lua' }], certa: 'lua' }
];

export function Sondagem({ criancaId }: { criancaId: string }) {
  const { repo, config } = useApp();
  const { crianca, progresso, salvarProgresso } = useCrianca(criancaId);
  // D030: cada resposta fica guardada por área (sons das letras, leitura, segmentação) para comparar sondagens
  const itens = useRef<(ItemSondagem & { area: AreaSondagem })[]>([]);
  const inicio = useRef(Date.now());
  const [k, setK] = useState(0);
  const [errosSeguidos, setErrosSeguidos] = useState(0);
  const [maior, setMaior] = useState(0);
  const [fim, setFim] = useState(false);
  const p = PLACAS[k];
  useEffect(() => {
    if (!crianca || fim || !p) return;
    (async () => {
      if (k === 0) await falar({ quem: 'sofia', texto: 'O Zum-Zum embaralhou as placas da vila! Me ajuda a pendurar, [NOME]?' }, crianca);
      await voz.falar(p.pergunta.replace(/\//g, ''), { quem: 'tales' });
      if (p.ouvir) await voz.falar(p.ouvir, { quem: 'sofia' });
    })();
  }, [k, crianca, fim, p]);
  if (!crianca || !progresso) return <Carregando />;

  const terminar = async (degrau: number) => {
    setFim(true);
    const agora = Date.now();
    // a primeira sondagem alimenta a Trilha Expressa (regra antiga); as periódicas só registram o resultado
    const motivo = situacaoSondagem(progresso, config, agora).motivo;
    const novo = registrarSondagem(progresso, { id: novoId('sd'), areas: resultadoPorArea(itens.current), degrau, motivo }, agora);
    await salvarProgresso(novo);
    await repo.registrarEvento({ id: novoId('ev'), criancaId, em: Date.now(), tipo: 'sondagem', texto: `Missão das Placas: chegou ao degrau ${degrau}` });
    await falar({ quem: 'sofia', texto: 'Todas as placas no lugar! Obrigada pela ajuda, [NOME]!' }, crianca);
  };
  const responder = async (id: string) => {
    const certo = id === p.certa;
    itens.current.push({ area: AREA_DO_DEGRAU[p.degrau], alvo: p.certa, escolhido: id, acertou: certo, tempoMs: Date.now() - inicio.current });
    inicio.current = Date.now();
    efeitos[certo ? 'acerto' : 'suave']();
    const m = certo ? Math.max(maior, p.degrau) : maior;
    setMaior(m);
    // para em 2 erros seguidos no mesmo degrau (a criança nunca vê "errado")
    const mesmoDegrau = PLACAS[k - 1]?.degrau === p.degrau;
    const e = certo ? 0 : mesmoDegrau ? errosSeguidos + 1 : 1;
    setErrosSeguidos(e);
    if (e >= 2 || k + 1 >= PLACAS.length) return terminar(m);
    setK(k + 1);
  };
  return (
    <div className="tela-sondagem">
      <Fundo cena="praca" desfoque={14} tom="calmo" />
      <Topo crianca={crianca} voltar={`c/${criancaId}/vila`} titulo="Missão das Placas da Vila" />
      <main className="palco">
        <section className="cartao sondagem-cartao">
          {fim ? (
            <>
              <h1 className="t">Placas no lugar!</h1>
              <p>Obrigado pela ajuda. A jornada começa do começo para todo mundo; quem já sabe passa mais rápido.</p>
              <div className="linha-botoes" style={{ justifyContent: 'center' }}><button className="btn grande ipe" onClick={() => navegar(`c/${criancaId}/vila`)}><Icone nome="casa" />Voltar para a vila</button></div>
            </>
          ) : (
            <>
              <h2 className="titulo-cena t"><Icone nome="placa" />Placa {k + 1} de {PLACAS.length}</h2>
              <p className="objetivo">{p.pergunta}</p>
              {p.mostrar ? <div className="pergunta"><div className="palavra-grande">{p.mostrar}</div></div> : p.ouvir ? <div className="pergunta"><BotaoOuvir onClick={() => voz.falar(p.ouvir!, { quem: 'sofia' })} rotulo="Ouvir de novo" /></div> : null}
              <div className="opcoes">
                {p.opcoes.map((o) => <button key={o.id} className={`opcao ${o.rot.length === 1 ? 'opcao-letra' : ''}`} onClick={() => responder(o.id)}>{o.rot.length === 1 ? <span className="letra">{o.rot}</span> : o.rot.includes(' ') ? <span className="fig-grupo">{o.rot.split(' ').map((w, n) => <Figura key={n} palavra={w} />)}</span> : <Figura palavra={o.rot} />}</button>)}
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}

/**
 * Mundo 3D explorável (docs/propostas/06-fonema-unificada/mundo-3d-v2, copiado para ./mundo3d/ no build).
 * Embutido por <iframe> + postMessage: o app envia {tipo:'fonema:init', cena, regiaoAtual} e recebe
 * {tipo:'fonema:missao', faseId}. Sem a pasta, cai no mapa 2D da vila.
 */
export function Mundo3D({ criancaId }: { criancaId: string }) {
  const { crianca, progresso } = useCrianca(criancaId);
  const [ok, setOk] = useState<boolean | null>(null);
  const ref = useRef<HTMLIFrameElement>(null);
  useEffect(() => {
    mundo3dDisponivel().then(setOk);
  }, []);
  useEffect(() => {
    const f = (e: MessageEvent) => {
      const d = e.data;
      if (!d || typeof d !== 'object') return;
      if (d.tipo === 'fonema:pronto' && progresso) {
        ref.current?.contentWindow?.postMessage({ tipo: 'fonema:init', cena: 'vila', regiaoAtual: progresso.faseAtual.split('-')[0], faseAtual: progresso.faseAtual, nome: crianca?.nome }, '*');
      }
      if (d.tipo === 'fonema:missao') {
        const fid = d.detalhe?.id ?? d.faseId ?? progresso?.faseAtual;
        navegar(progresso && podeEntrar(progresso, fid) ? `c/${criancaId}/fase/${fid}` : `c/${criancaId}/fase/${progresso?.faseAtual}`);
      }
      if (d.tipo === 'fonema:lojinha') navegar(`c/${criancaId}/lojinha`);
      if (d.tipo === 'fonema:album') navegar(`c/${criancaId}/album`);
    };
    window.addEventListener('message', f);
    return () => window.removeEventListener('message', f);
  }, [criancaId, progresso, crianca]);
  useEffect(() => { if (ok === false) navegar(`c/${criancaId}/vila`); }, [ok, criancaId]);
  if (!crianca || !progresso || ok === null) return <Carregando />;
  if (!ok) return null;
  const regiao = progresso.faseAtual.split('-')[0];
  const feitas = Object.entries(progresso.fases).filter(([, f]) => f.estado === 'concluida').map(([k]) => k).join(',');
  return (
    <div className="tela-mundo3d">
      <Topo crianca={crianca} voltar={`c/${criancaId}/vila`} titulo="Passeio pela vila em 3D">
        <button className="btn ipe" onClick={() => navegar(`c/${criancaId}/fase/${progresso.faseAtual}`)}><Icone nome="play" />Missão</button>
      </Topo>
      <iframe ref={ref} className="mundo3d" src={`./mundo3d/index.html?cena=vila&regiao=${regiao}&fase=${progresso.faseAtual}&feitas=${feitas}`} title="Mundo 3D da Vila" allow="autoplay; fullscreen" />
      <p className="sr">{textoTela('Explore a vila, [NOME]!', crianca)}</p>
    </div>
  );
}
