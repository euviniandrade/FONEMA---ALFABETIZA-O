import { useEffect, useRef, useState } from 'react';
import { PersonagemVivo } from '../../componentes/PersonagemVivo.tsx';
import { CONQUISTAS, FASE_POR_ID, REGIOES, SONS, SURPRESAS } from '@fonema/conteudo';
import { AREA_DO_DEGRAU, ehSeloDeParticipacao, infoNome, registrarSondagem, resultadoPorArea, situacaoSondagem, type AreaSondagem, type ItemSondagem } from '@fonema/motor';
import { useApp, useCrianca } from '../../contexto.tsx';
import { navegar } from '../../rotas.ts';
import { AvatarGrande, Balao, BotaoOuvir, Carregando, Topo } from '../../componentes/basicos.tsx';
import { Figura, Fundo, Icone } from '../../componentes/ui.tsx';
import { Modelo3D, Selo } from '../../componentes/recompensas.tsx';
import { EspelhoBoca, useEspelhoEmbed } from '../../componentes/EspelhoDoSom.tsx';
import { asset } from '../../servicos/ambiente.ts';
import { efeitos } from '../../servicos/efeitos.ts';
import { gravar, temGravacao } from '../../servicos/microfone.ts';
import { voz } from '../../servicos/voz.ts';
import { novoId } from '../../dados/repositorio.ts';
import { falar, falarVarias, semFonetica } from '../../util.ts';
import { letraAa } from '../../componentes/LetraAa.tsx';

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
            {/* modelos 3D de verdade, girando devagar (arrastar gira); o Zum-Zum ainda não tem modelo 3D */}
            <figure data-modelo="sofia"><Modelo3D qual="sofia" tamanho={190} modo="auto" /><figcaption>Sofia</figcaption></figure>
            <figure data-modelo="tales"><Modelo3D qual="tales" tamanho={190} modo="auto" /><figcaption>Tales</figcaption></figure>
            <figure data-modelo="bolota"><Modelo3D qual="bolota" tamanho={200} modo="auto" /><figcaption>Bolota</figcaption></figure>
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
                        <p className="dica-cadeado">{g ? `${g.nivel === 'unico' ? '' : g.nivel + ' · '}${new Date(g.em).toLocaleDateString('pt-BR')}` : c.visivel_antes === 'misterio' ? 'Mistério' : semFonetica(c.dica)}</p>
                        {/* D030: selo de participação (ver, imitar, traçar) não é selo de habilidade */}
                        {ehSeloDeParticipacao(c.id) ? <p className="selo-participacao">participação</p> : null}
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


/**
 * Sondagem lúdica "Missão das Placas da Vila" (D021 §3): para em 2 erros seguidos do mesmo degrau, termina no acerto.
 * Toda placa tem 3 opções ou mais (docs/pedagogia/04 §1 R8: com 2 opções o chute acerta metade). Para 4 e 5 anos
 * (docs/pedagogia/06 §3: sondagem de entrada para todos) ficam só as placas de escuta, som inicial e letras (degraus 1 a 4).
 */
/** A partir desta idade entram as placas de leitura (degrau 5) e a sondagem em blocos completa. */
export const IDADE_DA_LEITURA = 6;
const PLACAS: { degrau: number; pergunta: string; ouvir?: string; mostrar?: string; opcoes: { id: string; rot: string }[]; certa: string }[] = [
  { degrau: 1, pergunta: 'O que rima com GATO?', ouvir: 'gato', opcoes: [{ id: 'pato', rot: 'pato' }, { id: 'bola', rot: 'bola' }, { id: 'sol', rot: 'sol' }], certa: 'pato' },
  { degrau: 1, pergunta: 'Quantas palmas tem BOLOTA?', ouvir: 'bo-lo-ta', opcoes: [{ id: '1', rot: 'mão' }, { id: '2', rot: 'mão mão' }, { id: '3', rot: 'mão mão mão' }], certa: '3' },
  { degrau: 2, pergunta: 'Qual começa com /mmm/?', ouvir: 'mmmm', opcoes: [{ id: 'mala', rot: 'mala' }, { id: 'sol', rot: 'sol' }, { id: 'uva', rot: 'uva' }], certa: 'mala' },
  { degrau: 2, pergunta: 'Qual começa com /sss/?', ouvir: 'ssss', opcoes: [{ id: 'sapo', rot: 'sapo' }, { id: 'lua', rot: 'lua' }, { id: 'ovo', rot: 'ovo' }], certa: 'sapo' },
  { degrau: 3, pergunta: 'Qual letra faz /aaa/?', ouvir: 'aaaa', opcoes: [{ id: 'A', rot: 'A' }, { id: 'O', rot: 'O' }, { id: 'U', rot: 'U' }], certa: 'A' },
  { degrau: 3, pergunta: 'Qual letra faz /iii/?', ouvir: 'iiii', opcoes: [{ id: 'E', rot: 'E' }, { id: 'I', rot: 'I' }, { id: 'A', rot: 'A' }], certa: 'I' },
  { degrau: 4, pergunta: 'Qual letra faz /fff/?', ouvir: 'ffff', opcoes: [{ id: 'F', rot: 'F' }, { id: 'M', rot: 'M' }, { id: 'L', rot: 'L' }], certa: 'F' },
  { degrau: 4, pergunta: 'Qual letra faz /lll/?', ouvir: 'llll', opcoes: [{ id: 'M', rot: 'M' }, { id: 'L', rot: 'L' }, { id: 'S', rot: 'S' }], certa: 'L' },
  { degrau: 5, pergunta: 'Lê a placa: qual é a figura?', mostrar: 'MALA', opcoes: [{ id: 'mala', rot: 'mala' }, { id: 'lua', rot: 'lua' }, { id: 'uva', rot: 'uva' }], certa: 'mala' },
  { degrau: 5, pergunta: 'Lê a placa: qual é a figura?', mostrar: 'LUA', opcoes: [{ id: 'mala', rot: 'mala' }, { id: 'lua', rot: 'lua' }, { id: 'uva', rot: 'uva' }], certa: 'lua' }
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
  const idade = crianca ? new Date().getFullYear() - crianca.anoNascimento : 6;
  const placas = idade < IDADE_DA_LEITURA ? PLACAS.filter((x) => x.degrau <= 4) : PLACAS;
  const p = placas[k];
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
    const mesmoDegrau = placas[k - 1]?.degrau === p.degrau;
    const e = certo ? 0 : mesmoDegrau ? errosSeguidos + 1 : 1;
    setErrosSeguidos(e);
    if (e >= 2 || k + 1 >= placas.length) return terminar(m);
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
              <h2 className="titulo-cena t"><Icone nome="placa" />Placa {k + 1} de {placas.length}</h2>
              <p className="objetivo">{p.pergunta}</p>
              {p.mostrar ? <div className="pergunta"><div className="palavra-grande">{p.mostrar}</div></div> : p.ouvir ? <div className="pergunta"><BotaoOuvir onClick={() => voz.falar(p.ouvir!, { quem: 'sofia' })} rotulo="Ouvir de novo" /></div> : null}
              <div className="opcoes">
                {p.opcoes.map((o) => <button key={o.id} className={`opcao ${o.rot.length === 1 ? 'opcao-letra' : ''}`} onClick={() => responder(o.id)}>{o.rot.length === 1 ? <span className="letra">{letraAa(o.rot)}</span> : o.rot.includes(' ') ? <span className="fig-grupo">{o.rot.split(' ').map((w, n) => <Figura key={n} palavra={w} />)}</span> : <Figura palavra={o.rot} />}</button>)}
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}

/**
 * Passeio 3D pela vila (D032 item 3): a criança anda com o próprio boneco, em terceira pessoa. A tela fica em
 * Passeio3D.tsx; a rota `c/:id/mundo` continua a mesma (botão "Passear 3D" do "Mais").
 */
export { Passeio3D as Mundo3D } from './Passeio3D.tsx';
