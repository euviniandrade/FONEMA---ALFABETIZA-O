import { useEffect, useRef, useState } from 'react';
import { CONQUISTAS, FALAS, FASE_POR_ID, ITENS_LOJA, REGIOES, SONS, SURPRESAS, type ItemLoja } from '@fonema/conteudo';
import { aplicarSondagem, comprar, infoNome, podeComprar, podeEntrar } from '@fonema/motor';
import { useApp, useCrianca } from '../../contexto.tsx';
import { navegar } from '../../rotas.ts';
import { AvatarGrande, Balao, Carregando, Topo } from '../../componentes/basicos.tsx';
import { Cofrinho, Selo } from '../../componentes/recompensas.tsx';
import { EspelhoFrente, EspelhoLado, type ApiEspelho } from '../../componentes/EspelhoDoSom.tsx';
import { asset, mundo3dDisponivel } from '../../servicos/ambiente.ts';
import { efeitos } from '../../servicos/efeitos.ts';
import { gravar, temGravacao } from '../../servicos/microfone.ts';
import { voz } from '../../servicos/voz.ts';
import { novoId } from '../../dados/repositorio.ts';
import { falar, textoTela } from '../../util.ts';

/** Lojinha (de brincadeirinha, D002): pode × ainda não pode, "faltam X moedinhas", meta do cofrinho. */
export function Lojinha({ criancaId }: { criancaId: string }) {
  const { repo } = useApp();
  const { crianca, progresso, salvarProgresso } = useCrianca(criancaId);
  const [confirmar, setConfirmar] = useState<ItemLoja | null>(null);
  useEffect(() => { if (crianca) falar({ quem: 'tales', texto: 'Aqui você troca as moedinhas que ganhou aprendendo. Pode esperar e juntar para algo maior!' }, crianca); }, [crianca]);
  if (!crianca || !progresso) return <Carregando />;
  const metaId = Object.entries(progresso.contadores).find(([k, v]) => k.startsWith('meta:') && v === 1)?.[0].slice(5);
  const itemMeta = ITENS_LOJA.find((i) => i.id === metaId) ?? null;

  const comprarItem = async (i: ItemLoja) => {
    const p = comprar(progresso, i.id, i.preco);
    await salvarProgresso({ ...p, equipados: [...p.equipados, i.id].slice(-4) });
    await repo.registrarEvento({ id: novoId('ev'), criancaId, em: Date.now(), tipo: 'compra', texto: `Trocou ${i.preco} moedinhas por: ${i.nome}` });
    efeitos.moeda();
    await falar({ quem: 'sofia', texto: `Que escolha boa! ${i.nome} já está na sua mochila.` }, crianca);
    setConfirmar(null);
  };
  const definirMeta = async (i: ItemLoja) => {
    const contadores = Object.fromEntries(Object.entries(progresso.contadores).filter(([k]) => !k.startsWith('meta:')));
    await salvarProgresso({ ...progresso, contadores: { ...contadores, [`meta:${i.id}`]: 1 } });
    await falar({ quem: 'tales', texto: `Meta escolhida: ${i.nome}. Faltam ${Math.max(0, i.preco - progresso.moedinhas.saldo)} moedinhas!` }, crianca);
  };

  return (
    <div className="tela-lojinha" data-testid="lojinha">
      <Topo crianca={crianca} moedinhas={progresso.moedinhas.saldo} voltar={`c/${criancaId}/vila`} titulo="Lojinha da vila" />
      <main className="palco">
        <section className="cartao">
          <div className="loja-cab">
            <Cofrinho saldo={progresso.moedinhas.saldo} />
            <div>
              <h1 className="t">Lojinha</h1>
              <p>Moedinhas só se ganham aprendendo. Nada com dinheiro de verdade, nada por sorte.</p>
              {itemMeta ? (
                <div className="meta-cofrinho">
                  <img src={asset(itemMeta.imagem)} alt="" />
                  <div>
                    <b>Minha meta: {itemMeta.nome}</b>
                    <div className="barrinha"><i style={{ width: `${Math.min(100, (progresso.moedinhas.saldo / itemMeta.preco) * 100)}%` }} /></div>
                    <small>{progresso.moedinhas.saldo >= itemMeta.preco ? 'Já dá para trocar!' : `Faltam ${itemMeta.preco - progresso.moedinhas.saldo} moedinhas`}</small>
                  </div>
                </div>
              ) : <p className="nota-mic">Toque em "Quero juntar" para escolher uma meta para o cofrinho.</p>}
            </div>
          </div>
          <div className="grade-loja">
            {ITENS_LOJA.map((i) => {
              const tem = progresso.itens.includes(i.id);
              const { pode, faltam } = podeComprar(progresso, i.preco);
              return (
                <div key={i.id} className={`item-loja ${tem ? 'tem' : pode ? 'pode' : 'falta'}`} data-item={i.id}>
                  <img src={asset(i.imagem)} alt="" />
                  <b>{i.nome}</b>
                  <span className="preco"><img src={asset('recompensas/moeda.webp')} alt="" />{i.preco}</span>
                  {tem ? <span className="ja-tem">Na mochila ✓</span> : pode ? (
                    <button className="btn verde" onClick={() => setConfirmar(i)}>Trocar</button>
                  ) : (
                    <>
                      <div className="barrinha"><i style={{ width: `${Math.min(100, (progresso.moedinhas.saldo / i.preco) * 100)}%` }} /></div>
                      <small>Faltam {faltam}</small>
                      <button className="btn mini" onClick={() => { definirMeta(i); falar({ quem: 'sofia', texto: FALAS.lojinhaFalta.replace('[FALTAM]', String(faltam)).replace('[ITEM]', i.nome) }, crianca); }}>Quero juntar</button>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </main>
      {confirmar ? (
        <div className="modal" role="dialog" aria-modal="true" aria-label="Confirmar troca">
          <div className="cartao">
            <img src={asset(confirmar.imagem)} alt="" className="modal-img" />
            <p className="t">Trocar <b>{confirmar.preco} moedinhas</b> por <b>{confirmar.nome}</b>?</p>
            <p>{confirmar.fala}</p>
            <p className="nota-mic">Depois da troca, sobram {progresso.moedinhas.saldo - confirmar.preco} moedinhas.</p>
            <div className="linha-botoes">
              <button className="btn grande" onClick={() => setConfirmar(null)}>Esperar e juntar</button>
              <button className="btn grande verde" onClick={() => comprarItem(confirmar)} data-testid="confirmar-troca">Trocar agora</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

/** Álbum de Conquistas: por região; ganhas brilham; as outras mostram a HABILIDADE (P1-b). */
export function Album({ criancaId }: { criancaId: string }) {
  const { crianca, progresso } = useCrianca(criancaId);
  if (!crianca || !progresso) return <Carregando />;
  const letra = infoNome(crianca.nome, crianca.pronuncia.grafia).letras;
  const ganhas = Object.keys(progresso.conquistas).length;
  return (
    <div className="tela-album" data-testid="album">
      <Topo crianca={crianca} moedinhas={progresso.moedinhas.saldo} voltar={`c/${criancaId}/vila`} titulo="Álbum de Conquistas" />
      <main className="palco">
        <section className="cartao">
          <div className="album-cab">
            <AvatarGrande crianca={crianca} itens={progresso.equipados} />
            <div>
              <h1 className="t">Álbum de {crianca.nome}</h1>
              <p>{ganhas} conquistas. Cada uma conta uma coisa que você aprendeu.</p>
              {progresso.itens.length ? <div className="mochila"><b>Mochila:</b>{progresso.itens.map((i) => <img key={i} src={asset(`itens/${i}.webp`)} alt={i} title={i} />)}</div> : null}
              {progresso.areas.length ? <p className="nota-mic">Lugares novos na vila: {SURPRESAS.filter((s) => progresso.areas.includes(s.id)).map((s) => s.nome).join(' · ')}</p> : null}
            </div>
          </div>
          {REGIOES.map((r) => {
            const lista = CONQUISTAS.filter((c) => c.regiao === r.id && c.visivel_antes !== 'oculto');
            return (
              <div key={r.id} className="album-regiao">
                <h2 className="t">{r.nome}</h2>
                <div className="grade-conquistas">
                  {lista.map((c) => {
                    const g = progresso.conquistas[c.id];
                    return (
                      <div key={c.id} className={`conquista-item ${g ? 'ganha' : 'bloqueada'}`} data-conquista={c.id}>
                        <Selo conquista={c} ganha={g} bloqueado={!g} letra={letra} tamanho={110} />
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

/** "Conheça seu corpo" (P8-b): o Espelho do Som completo — frente, raio-X, dentro da boca, corpo e giro 360°. */
export function ConhecaSeuCorpo({ criancaId }: { criancaId: string }) {
  const { config } = useApp();
  const { crianca } = useCrianca(criancaId);
  const [fonema, setFonema] = useState('a');
  const [modo, setModo] = useState('lado');
  const [girar, setGirar] = useState(false);
  const api = useRef<ApiEspelho | null>(null);
  if (!crianca) return <Carregando />;
  const sons = ['a', 'E', 'i', 'O', 'u', 'm', 'l', 'f', 's', 'v'];
  const nomes: Record<string, string> = { frente: 'De frente', lado: 'Raio-X de lado', dentro: 'Dentro da boca', corpo: 'Do pulmão à boca' };
  const s = SONS[fonema];
  return (
    <div className="tela-corpo">
      <Topo crianca={crianca} voltar={`c/${criancaId}/vila`} titulo="Conheça seu corpo" />
      <main className="palco">
        <section className="cartao corpo-cartao">
          <Balao fala={{ quem: 'sofia', texto: 'Aqui você vê por dentro como o som é feito: lábios, dentes, língua, céu da boca, nariz e garganta. Escolha um som!' }} crianca={crianca} auto />
          <div className="corpo-layout">
            <div className="corpo-palco">
              <EspelhoLado fonema={fonema} modo={modo} rotulos aoPronto={(a) => (api.current = a)} />
            </div>
            <div className="corpo-controles">
              <EspelhoFrente fonema={fonema} falando={false} />
              <div className="grade-sons" role="radiogroup" aria-label="Sons">
                {sons.map((f) => <button key={f} role="radio" aria-checked={fonema === f} className={`peca ${fonema === f ? 'sel' : ''}`} onClick={() => { setFonema(f); voz.falar(SONS[f].esticado, { quem: 'sofia' }); }}>{SONS[f].letra}{f === 'E' ? 'é' : f === 'O' ? 'ó' : ''}</button>)}
              </div>
              <div className="grade-modos">
                {config.espelho.conhecaSeuCorpo.map((m) => <button key={m} className={`btn ${modo === m ? 'pri' : ''}`} onClick={() => setModo(m)}>{nomes[m]}</button>)}
                <button className={`btn ${girar ? 'pri' : ''}`} onClick={() => { setGirar(!girar); api.current?.girar?.(!girar); }}>⟳ Girar 360°</button>
              </div>
              <p className="dica-boca">👄 {s.dica}</p>
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
  useEffect(() => { if (crianca && fase?.demonstracao) falar({ quem: 'tales', texto: `Vamos mostrar pro professor, [NOME]? ${fase.demonstracao.descricao}.` }, crianca); }, [crianca, fase]);
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
      <Topo crianca={crianca} voltar={`c/${criancaId}/vila`} titulo="Mostra pro professor" />
      <main className="palco">
        <section className="cartao mostra-cartao">
          <h1 className="t">🎤 Mostra pro professor</h1>
          <p className="objetivo">{fase.demonstracao.descricao}</p>
          {estado === 'enviado' ? (
            <>
              <p className="enviado" data-testid="demonstracao-enviada">✓ Enviado para o professor (ou para a família, no uso em casa).</p>
              <button className="btn grande ipe" onClick={() => navegar(`c/${criancaId}/vila`)}>🏡 Voltar para a vila</button>
            </>
          ) : estado === 'gravando' ? (
            <div className="gravando"><p>Gravando… fala agora!</p><div className="medidor"><i style={{ width: `${nivel * 100}%` }} /></div></div>
          ) : (
            <div className="linha-botoes">
              {temGravacao() ? (
                <button className="btn grande" onClick={async () => {
                  setEstado('gravando');
                  try { const b = await gravar(4000, setNivel); await enviar('gravacao', b); } catch { setEstado('escolher'); }
                }}>🎙️ Gravar (4 s)</button>
              ) : null}
              <button className="btn grande verde" onClick={() => enviar('ao-vivo')} data-testid="mostrei-ao-vivo">👀 Mostrei ao vivo</button>
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
  { degrau: 1, pergunta: 'O que rima com GATO?', ouvir: 'gato', opcoes: [{ id: 'pato', rot: '🦆' }, { id: 'bola', rot: '⚽' }], certa: 'pato' },
  { degrau: 1, pergunta: 'Quantas palmas tem BOLOTA?', ouvir: 'bo-lo-ta', opcoes: [{ id: '2', rot: '👏👏' }, { id: '3', rot: '👏👏👏' }], certa: '3' },
  { degrau: 2, pergunta: 'Qual começa com /mmm/?', ouvir: 'mmmm', opcoes: [{ id: 'mala', rot: '🧳' }, { id: 'sol', rot: '☀️' }], certa: 'mala' },
  { degrau: 2, pergunta: 'Qual começa com /sss/?', ouvir: 'ssss', opcoes: [{ id: 'sapo', rot: '🐸' }, { id: 'lua', rot: '🌙' }], certa: 'sapo' },
  { degrau: 3, pergunta: 'Qual letra faz /aaa/?', ouvir: 'aaaa', opcoes: [{ id: 'A', rot: 'A' }, { id: 'O', rot: 'O' }, { id: 'U', rot: 'U' }], certa: 'A' },
  { degrau: 3, pergunta: 'Qual letra faz /iii/?', ouvir: 'iiii', opcoes: [{ id: 'E', rot: 'E' }, { id: 'I', rot: 'I' }, { id: 'A', rot: 'A' }], certa: 'I' },
  { degrau: 4, pergunta: 'Qual letra faz /fff/?', ouvir: 'ffff', opcoes: [{ id: 'F', rot: 'F' }, { id: 'M', rot: 'M' }, { id: 'L', rot: 'L' }], certa: 'F' },
  { degrau: 4, pergunta: 'Qual letra faz /lll/?', ouvir: 'llll', opcoes: [{ id: 'M', rot: 'M' }, { id: 'L', rot: 'L' }, { id: 'S', rot: 'S' }], certa: 'L' },
  { degrau: 5, pergunta: 'Lê a placa: qual é a figura?', mostrar: 'MALA', opcoes: [{ id: 'mala', rot: '🧳' }, { id: 'lua', rot: '🌙' }], certa: 'mala' },
  { degrau: 5, pergunta: 'Lê a placa: qual é a figura?', mostrar: 'LUA', opcoes: [{ id: 'mala', rot: '🧳' }, { id: 'lua', rot: '🌙' }], certa: 'lua' }
];

export function Sondagem({ criancaId }: { criancaId: string }) {
  const { repo } = useApp();
  const { crianca, progresso, salvarProgresso } = useCrianca(criancaId);
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
    const novo = aplicarSondagem(progresso, degrau, Date.now());
    await salvarProgresso(novo);
    await repo.registrarEvento({ id: novoId('ev'), criancaId, em: Date.now(), tipo: 'sondagem', texto: `Missão das Placas: chegou ao degrau ${degrau}` });
    await falar({ quem: 'sofia', texto: 'Todas as placas no lugar! Obrigada pela ajuda, [NOME]!' }, crianca);
  };
  const responder = async (id: string) => {
    const certo = id === p.certa;
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
      <img className="cenario" src={asset('fundos/vila.webp')} alt="" />
      <Topo crianca={crianca} voltar={`c/${criancaId}/vila`} titulo="Missão das Placas da Vila" />
      <main className="palco">
        <section className="cartao">
          {fim ? (
            <>
              <h1 className="t">Placas no lugar! 🪧</h1>
              <p>Obrigado pela ajuda. A jornada começa do começo para todo mundo; quem já sabe passa mais rápido.</p>
              <button className="btn grande ipe" onClick={() => navegar(`c/${criancaId}/vila`)}>🏡 Voltar para a vila</button>
            </>
          ) : (
            <>
              <h1 className="t">Placa {k + 1}</h1>
              <p className="objetivo">{p.pergunta}</p>
              {p.mostrar ? <div className="palavra-grande">{p.mostrar}</div> : null}
              <div className="opcoes">
                {p.opcoes.map((o) => <button key={o.id} className={`opcao ${o.rot.length === 1 ? 'opcao-letra' : ''}`} onClick={() => responder(o.id)}>{o.rot.length === 1 ? <span className="letra">{o.rot}</span> : <span className="fig">{o.rot}</span>}</button>)}
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
      <Topo crianca={crianca} moedinhas={progresso.moedinhas.saldo} titulo="Vila da Sofia · 3D">
        <button className="btn" onClick={() => navegar(`c/${criancaId}/vila`)}>🗺️ Mapa 2D</button>
        <button className="btn ipe" onClick={() => navegar(`c/${criancaId}/fase/${progresso.faseAtual}`)}>⭐ Missão</button>
      </Topo>
      <iframe ref={ref} className="mundo3d" src={`./mundo3d/index.html?cena=vila&regiao=${regiao}&fase=${progresso.faseAtual}&feitas=${feitas}`} title="Mundo 3D da Vila" allow="autoplay; fullscreen" />
      <p className="sr">{textoTela('Explore a vila, [NOME]!', crianca)}</p>
    </div>
  );
}
