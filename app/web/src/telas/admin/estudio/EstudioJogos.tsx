/**
 * Estúdio criativo › JOGOS (fila nº 32). Para cada jogo do Parque: prévia do cartão como a criança vê, nome, "o que
 * treina", ligado/desligado, ordem (↑ ↓) e "abrir como uma criança deste aparelho". Casa do Som: a LISTA DE PALAVRAS
 * que a criança escreve, com o verificador de decodificabilidade ao vivo (regras 2 e 5): palavra sem pronúncia anotada,
 * sem figura, sem a voz gravada ou com vogal que muda na fala NÃO entra; cada palavra mostra a lição em que passa a valer.
 */
import { useMemo, useState } from 'react';
import {
  CONTEUDO_EDITAVEL, JOGOS_PARQUE, JOGO_ESCUTA_POR_ID, licaoQueLibera, nomeDaFigura, temFiguraJogo, verificarEdicao, type JogoParque
} from '@fonema/conteudo';
import { nomeDoMovel } from '@fonema/motor';
import { Figura, Icone } from '../../../componentes/ui.tsx';
import { navegar } from '../../../rotas.ts';
import { edicoes } from '../../../servicos/edicoes.ts';
import { idFala } from '../../../servicos/substituicoes.ts';
import { chaveTrecho } from '../../../servicos/voz.ts';
import { AvisoVerificador, CampoEditavel, salvarVerificando, useVersaoEdicoes } from '../edicao-comum.tsx';
import { useCatalogo, useTrocados } from '../dados-admin.ts';
import { useCriancas } from '../useCriancas.ts';

/** Figuras da capa (as mesmas dos cartões do Parque) e a cor. */
const CAPA: Record<string, string[]> = {
  'corre-som': ['foca', 'vaca'], 'come-som': ['uva', 'abacaxi'], 'estrada-pares': ['vaca', 'faca'], carteiro: ['mala', 'lua'], 'casa-som': ['pia', 'bule'],
  'memoria-sons': ['sapo', 'pato'], caca: ['mapa'], comprida: ['sol', 'formiga'], escondida: ['sapato', 'pato'], rimas: ['pato', 'rato'], intruso: ['mao', 'pao', 'vela'],
  comeco: ['sapo', 'sapato'], palmas: ['abacaxi']
};
/** Endereço do jogo para abrir como uma criança. */
const rotaDoJogo = (crianca: string, id: string): string => {
  if (['estrada-pares', 'carteiro', 'casa-som'].includes(id)) return `c/${crianca}/jogo/${id}`;
  if (id === 'memoria-sons') return `c/${crianca}/memoria`;
  if (id === 'caca') return `c/${crianca}/mundo/caca`;
  return `c/${crianca}/brincar/${id}`;
};
/** Nome e "treina" que a criança vê (os de escutar vêm de biblioteca/escuta.ts). */
const textoDoJogo = (j: JogoParque) => (j.grupo === 'escuta' ? { nome: JOGO_ESCUTA_POR_ID[j.id]?.nome ?? j.id, treina: JOGO_ESCUTA_POR_ID[j.id]?.treina ?? '' } : { nome: j.nome ?? j.id, treina: j.treina ?? '' });

export function EstudioJogos() {
  useVersaoEdicoes();
  const [aberto, setAberto] = useState<string | null>('casa-som');
  const [msg, setMsg] = useState('');
  const grupos: { id: JogoParque['grupo']; titulo: string }[] = [{ id: 'sons', titulo: 'Jogos (Parque de Jogos)' }, { id: 'escuta', titulo: 'Brincadeiras de escutar' }];
  const mover = async (lista: JogoParque[], i: number, d: -1 | 1) => {
    const a = lista[i], b = lista[i + d];
    if (!a || !b) return;
    // troca as posições (duas edições; ficam no Histórico). Os valores são lidos ANTES: a edição muda o objeto no lugar.
    const [oa, ob] = [a.ordem, b.ordem === a.ordem ? a.ordem + d : b.ordem];
    const ra = await salvarVerificando({ colecao: 'jogos', item: a.id, tipo: 'definir', caminho: ['ordem'], valor: ob, nota: `ordem: ${textoDoJogo(a).nome} ${d < 0 ? 'sobe' : 'desce'}` });
    const rb = await salvarVerificando({ colecao: 'jogos', item: b.id, tipo: 'definir', caminho: ['ordem'], valor: oa, nota: 'ordem (troca)' });
    setMsg(ra.ok && rb.ok ? `"${textoDoJogo(a).nome}" ${d < 0 ? 'subiu' : 'desceu'} no Parque.` : 'Não deu para mudar a ordem.');
  };
  return (
    <div data-testid="estudio-jogos">
      <p className="adm-nota">Desligar um jogo tira o cartão do Parque, o "Novo!" e o convite do fim da missão. O jogo que faz parte de uma <b>lição</b> continua (é parte da lição). As regras dos jogos (o que conta como acerto, posição sorteada, só sons já ensinados) não mudam por aqui.</p>
      {msg ? <p className="adm-etq verde" role="status" data-testid="msg-ordem">{msg}</p> : null}
      {grupos.map((g) => {
        const lista = JOGOS_PARQUE.filter((j) => j.grupo === g.id).sort((a, b) => a.ordem - b.ordem);
        return (
          <section key={g.id} className="est-grupo-jogos">
            <h2>{g.titulo}</h2>
            <ol className="est-jogos">
              {lista.map((j, i) => (
                <LinhaJogo key={j.id} j={j} primeiro={i === 0} ultimo={i === lista.length - 1} aberto={aberto === j.id} abrir={(v) => setAberto(v ? j.id : null)}
                  subir={() => void mover(lista, i, -1)} descer={() => void mover(lista, i, 1)} />
              ))}
            </ol>
          </section>
        );
      })}
    </div>
  );
}

function LinhaJogo({ j, primeiro, ultimo, aberto, abrir, subir, descer }: { j: JogoParque; primeiro: boolean; ultimo: boolean; aberto: boolean; abrir: (v: boolean) => void; subir: () => void; descer: () => void }) {
  const t = textoDoJogo(j);
  return (
    <li className={`est-jogo ${j.ligado ? '' : 'desligado'}`} data-testid="linha-jogo" data-jogo={j.id}>
      <div className="est-jogo-cab">
        <div className="est-previa-cartao" aria-hidden="true" data-testid="previa-jogo">
          <span className="est-previa-figs">{(CAPA[j.id] ?? []).slice(0, 2).map((f) => <Figura key={f} palavra={f} />)}</span>
          <b>{t.nome}</b>
          <small>{t.treina}</small>
          {!j.ligado ? <span className="est-previa-off">desligado</span> : null}
        </div>
        <div className="est-jogo-acoes">
          <span className={`adm-etq ${j.ligado ? 'verde' : 'cinza'}`} data-testid="estado-jogo">{j.ligado ? 'Ligado' : 'Desligado'}</span>
          <div className="adm-linha">
            <button className="btn adm-btn" disabled={primeiro} onClick={subir} aria-label={`Subir ${t.nome}`} data-testid="subir-jogo"><Icone nome="seta-esq" className="est-cima" />Subir</button>
            <button className="btn adm-btn" disabled={ultimo} onClick={descer} aria-label={`Descer ${t.nome}`} data-testid="descer-jogo"><Icone nome="seta" className="est-baixo" />Descer</button>
            <button className="btn adm-btn pri" onClick={() => abrir(!aberto)} aria-expanded={aberto} data-testid="editar-jogo"><Icone nome="caderno" />{aberto ? 'Fechar' : 'Editar'}</button>
          </div>
        </div>
      </div>
      {aberto ? (
        <div className="est-jogo-corpo">
          <CampoEditavel alvo={{ colecao: 'jogos', item: j.id, caminho: ['ligado'] }} rotulo="Jogo ligado no Parque" tipo="booleano" testid="campo-ligado" />
          {j.id === 'caca' ? <p className="adm-nota">O nome da Caça ao Tesouro vem do passeio 3D (não muda por aqui).</p> : (
            <div className="adm-grade">
              {j.grupo === 'escuta'
                ? <CampoEditavel alvo={{ colecao: 'jogos-escuta', item: j.id, caminho: ['nome'] }} rotulo="Nome do jogo" testid="campo-nome-jogo" />
                : <CampoEditavel alvo={{ colecao: 'jogos', item: j.id, caminho: ['nome'] }} rotulo="Nome do jogo" testid="campo-nome-jogo" />}
              {j.grupo === 'escuta'
                ? <CampoEditavel alvo={{ colecao: 'jogos-escuta', item: j.id, caminho: ['treina'] }} rotulo="O que treina (linha do cartão)" />
                : <CampoEditavel alvo={{ colecao: 'jogos', item: j.id, caminho: ['treina'] }} rotulo="O que treina (linha do cartão)" />}
            </div>
          )}
          {j.palavras && j.usoPalavras ? <PalavrasDoJogo j={j} /> : null}
          {j.grupo === 'escuta' ? <p className="adm-nota">As palavras dos jogos de escutar são ouvidas (não lidas): ficam como estão; as falas do jogo se editam em <button className="adm-link" onClick={() => navegar('admin/textos')}>Textos e falas</button>.</p> : null}
          <AbrirComoCrianca jogo={j.id} />
        </div>
      ) : null}
    </li>
  );
}

/** A palavra tem a voz gravada (a Sofia diz a palavra na encomenda)? Original ou trocada neste aparelho. */
function useTemVoz(): (w: string) => boolean | null {
  const catalogo = useCatalogo();
  const trocados = useTrocados();
  return (w: string) => {
    if (!catalogo) return null;
    const id = idFala('sofia', chaveTrecho(nomeDaFigura(w)));
    return trocados.has(id) || !!catalogo.find((it) => it.id === id)?.arquivo;
  };
}

function PalavrasDoJogo({ j }: { j: JogoParque }) {
  const atual = j.palavras ?? [];
  const [lista, setLista] = useState<string[]>(atual);
  const [nova, setNova] = useState('');
  const [rodada, setRodada] = useState(0);
  const [msg, setMsg] = useState('');
  const temVoz = useTemVoz();
  const textoAtual = atual.join(',');
  const mudou = lista.join(',') !== textoAtual;
  const edicao = { colecao: 'jogos', item: j.id, tipo: 'definir' as const, caminho: ['palavras'] };
  const r = useMemo(() => (mudou ? verificarEdicao(CONTEUDO_EDITAVEL, { ...edicao, valor: lista, em: 0 }, edicoes.edicoes()) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [lista.join(','), textoAtual, rodada]);
  const semVoz = lista.filter((w) => temVoz(w) === false);
  const reg = edicoes.noLugar(edicao);
  const pode = mudou && !!r?.ok && !semVoz.length;
  const acrescentar = () => {
    const w = nova.trim().toLowerCase();
    if (!w) return;
    setMsg('');
    setLista((l) => (l.includes(w) ? l : [...l, w]));
    setNova('');
  };
  const guardar = async () => {
    const res = await salvarVerificando({ ...edicao, valor: lista, nota: `palavras do jogo ${j.nome ?? j.id}` });
    setMsg(res.ok ? 'Lista guardada neste aparelho.' : 'O verificador barrou a lista.');
    setRodada((x) => x + 1);
  };
  return (
    <fieldset className="adm-grupo est-palavras" data-testid="palavras-jogo">
      <legend>Palavras que a criança {j.usoPalavras === 'escrever' ? 'escreve' : 'lê'} neste jogo</legend>
      <p className="adm-nota">Cada palavra mostra a <b>lição</b> em que a criança passa a conseguir {j.usoPalavras === 'escrever' ? 'escrevê-la' : 'lê-la'} sozinha. No jogo, cada criança só recebe a palavra depois dessa lição. Palavra com som que nenhuma lição ensina, sem figura ou sem a voz da Sofia é bloqueada.</p>
      <ul className="est-chips">
        {lista.map((w) => {
          const licao = licaoQueLibera(w);
          const voz = temVoz(w);
          const fig = temFiguraJogo(w);
          return (
            <li key={w} className={`est-chip ${!licao || !fig || voz === false ? 'ruim' : ''}`} data-palavra={w} data-testid="chip-palavra">
              {fig ? <Figura palavra={w} /> : <span className="est-chip-sem" aria-hidden="true">?</span>}
              <span><b>{w.toUpperCase()}</b><small>{j.id === 'casa-som' ? `${nomeDoMovel(w)} · ` : ''}{licao ? `a partir da ${licao}` : 'sem pronúncia anotada'}{voz === false ? ' · sem a voz gravada' : ''}</small></span>
              <button className="est-chip-x" onClick={() => { setMsg(''); setLista((l) => l.filter((x) => x !== w)); }} aria-label={`Tirar ${w}`} data-testid="tirar-palavra"><Icone nome="x" /></button>
            </li>
          );
        })}
      </ul>
      <div className="adm-linha">
        <label className="adm-campo">Palavra nova <input value={nova} onChange={(e) => setNova(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') acrescentar(); }} placeholder="ex.: bolo" data-testid="nova-palavra" /></label>
        <button className="btn adm-btn" onClick={acrescentar} disabled={!nova.trim()} data-testid="acrescentar-palavra"><Icone nome="mais" />Pôr na lista</button>
        <button className="btn adm-btn pri" disabled={!pode} onClick={() => void guardar()} data-testid="guardar-palavras"><Icone nome="check" />Guardar a lista</button>
        {mudou ? <button className="btn adm-btn" onClick={() => setLista(atual)}>Desfazer o que não guardei</button> : null}
        {reg ? <button className="btn adm-btn" onClick={() => void edicoes.voltarAoOriginal(reg.chave).then(() => setLista(CONTEUDO_EDITAVEL.original('jogos', j.id) ? ((CONTEUDO_EDITAVEL.original('jogos', j.id) as JogoParque).palavras ?? []) : atual))} data-testid="palavras-original"><Icone nome="lixeira" />Voltar à lista original</button> : null}
      </div>
      {msg ? <span className="adm-etq verde" role="status" data-testid="msg-palavras">{msg}</span> : null}
      {mudou ? <AvisoVerificador r={r} aoPronuncia={() => setRodada((x) => x + 1)} /> : null}
      {mudou && semVoz.length ? <p className="adm-bloqueio" role="alert" data-testid="bloqueio-voz">Falta a voz da Sofia dizendo {semVoz.map((w) => `"${w}"`).join(', ')}: a encomenda é ditada em voz. Grave em <button className="adm-link" onClick={() => navegar('admin/estudio/vozes')}>Vozes</button> (procure a palavra) e volte aqui.</p> : null}
    </fieldset>
  );
}

function AbrirComoCrianca({ jogo }: { jogo: string }) {
  const { linhas } = useCriancas();
  const [quem, setQuem] = useState('');
  if (!linhas) return null;
  if (!linhas.length) return <p className="adm-nota">Para ver o jogo funcionando, cadastre uma criança neste aparelho (o jogo usa o que ela já aprendeu).</p>;
  const id = quem || linhas[0].c.id;
  return (
    <div className="adm-linha" data-testid="abrir-jogo-crianca">
      <label className="adm-campo">Ver o jogo como <select value={id} onChange={(e) => setQuem(e.target.value)}>{linhas.map((l) => <option key={l.c.id} value={l.c.id}>{l.c.nome}</option>)}</select></label>
      <button className="btn adm-btn ipe" onClick={() => navegar(rotaDoJogo(id, jogo))}><Icone nome="tocar" />Abrir o jogo</button>
      <span className="adm-nota">Abre com o progresso desta criança (o que ela jogar conta para ela).</span>
    </div>
  );
}
