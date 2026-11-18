/**
 * Gerenciador › MISSÕES: a jornada inteira em ordem (D031) e, por fase: título, falas, cenas (reordenar, ligar/desligar),
 * palavras das atividades e "criar uma fase nova a partir desta". Toda mudança passa pelo verificador AO VIVO e é
 * bloqueada se quebrar a regra 2 (palavra com som que a criança ainda não aprendeu). Nada é apagado: as cenas
 * desligadas e o original ficam guardados; os IDs não mudam (o progresso salvo continua valendo).
 */
import { useMemo, useState } from 'react';
import {
  BANCO, CONTEUDO_EDITAVEL, FASE_POR_ID, REGIAO_POR_ID, textosDoItem, verificarEdicao,
  type AtividadeEscolher, type Cena, type Edicao, type Fase, type ItemEscolha, type ResultadoVerificacao
} from '@fonema/conteudo';
import { Icone, caminhoFigura } from '../../componentes/ui.tsx';
import { navegar } from '../../rotas.ts';
import { edicoes } from '../../servicos/edicoes.ts';
import { AvisoVerificador, CampoEditavel, quemEdita, salvarVerificando, useVersaoEdicoes } from './edicao-comum.tsx';
import { useCriancas } from './useCriancas.ts';

const TIPO_ATIVIDADE: Record<string, string> = {
  escolher: 'Escolher', palmas: 'Palmas', montar: 'Montar palavra', ditado: 'Ditado', falar: 'Falar', espelho: 'Espelho do Som', letra: 'Apresentar a letra',
  ligar: 'Ligar letra e cena', tracar: 'Traçar', pausa: 'Pausa ativa', somNovo: 'Som novo', sintese: 'Juntar os sons', caixas: 'Caixas de sons',
  parMinimo: 'Pares mínimos', troca: 'Troca-letras', frase: 'Ler frase'
};

export function AbaMissoes({ sub }: { sub?: string }) {
  useVersaoEdicoes();
  const [busca, setBusca] = useState('');
  const ids = CONTEUDO_EDITAVEL.colecao('fases')!.ids();
  const meus = new Set(edicoes.edicoes().filter((e) => e.colecao === 'fases').map((e) => e.item));
  const b = busca.trim().toLowerCase();
  const lista = ids.map((id, i) => ({ id, i, f: FASE_POR_ID[id] })).filter((x) => x.f && (!b || `${x.id} ${x.f.titulo}`.toLowerCase().includes(b)));
  const aqui = sub && FASE_POR_ID[sub] ? sub : undefined;
  return (
    <section className="adm-cartao adm-missoes" data-testid="aba-missoes">
      <div className="adm-cab"><h1>Missões</h1><span className="adm-nota">A jornada inteira, na ordem em que a criança faz ({ids.length} missões).</span></div>
      <div className="adm-dois">
        <nav className="adm-jornada" aria-label="Jornada">
          <label className="adm-campo">Procurar <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="TF-10, letra M, frase…" data-testid="busca-missao" /></label>
          <ol>
            {lista.map(({ id, i, f }) => (
              <li key={id}>
                <button className={`adm-fase-btn ${id === aqui ? 'atual' : ''}`} onClick={() => navegar(`admin/missoes/${id}`)} data-fase={id} data-testid="fase-jornada">
                  <span className="adm-fase-n">{i + 1}</span><b>{id}</b> {f.titulo}
                  {meus.has(id) ? <span className="adm-etq ipe">editada</span> : null}
                  {!CONTEUDO_EDITAVEL.existeNoRepositorio('fases', id) ? <span className="adm-etq verde">nova</span> : null}
                </button>
              </li>
            ))}
          </ol>
        </nav>
        <div className="adm-fase-ed">
          {aqui ? <EditorFase key={aqui} faseId={aqui} /> : <p className="adm-nota">Escolha uma missão na lista para ver e editar.</p>}
        </div>
      </div>
    </section>
  );
}

function EditorFase({ faseId }: { faseId: string }) {
  const f = FASE_POR_ID[faseId];
  const novo = !CONTEUDO_EDITAVEL.existeNoRepositorio('fases', faseId);
  const naJornada = CONTEUDO_EDITAVEL.colecao('fases')!.ids().indexOf(faseId);
  const { linhas } = useCriancas();
  const [crianca, setCrianca] = useState('');
  const [criar, setCriar] = useState(false);
  const alvo = (caminho: (string | number)[]) => ({ colecao: 'fases', item: faseId, caminho });
  const reg = REGIAO_POR_ID[f.regiao];
  return (
    <div data-testid="editor-fase" data-fase={faseId}>
      <div className="adm-cab">
        <h2 style={{ margin: 0 }}>{faseId} · {f.titulo}</h2>
        <span className="adm-etq cinza">{reg?.nome ?? f.regiao}{naJornada >= 0 ? '' : ' · rascunho (fora da jornada)'}</span>
      </div>
      <div className="adm-linha">
        {linhas?.length ? (
          <>
            <label className="adm-campo">Ver na lição como <select value={crianca} onChange={(e) => setCrianca(e.target.value)} data-testid="previa-crianca"><option value="">escolha a criança</option>{linhas.map((l) => <option key={l.c.id} value={l.c.id}>{l.c.nome}</option>)}</select></label>
            <a className={`btn adm-btn ${crianca ? '' : 'desligado'}`} href={crianca ? `#/c/${crianca}/sessao/${faseId}` : undefined} target="_blank" rel="noreferrer" data-testid="ver-na-licao"><Icone nome="olho" />Abrir a lição (aba nova)</a>
          </>
        ) : <span className="adm-nota">Para ver na lição, cadastre uma criança neste aparelho (a missão precisa estar aberta para ela).</span>}
        <button className="btn adm-btn" onClick={() => setCriar(!criar)} data-testid="criar-fase"><Icone nome="copiar" />Criar fase nova a partir desta</button>
        <button className="btn adm-btn terra" onClick={() => { void edicoes.voltarItem('fases', faseId); if (novo) navegar('admin/missoes'); }} data-testid="voltar-fase"><Icone nome="lixeira" />{novo ? 'Apagar esta fase nova' : 'Voltar esta missão ao original'}</button>
      </div>
      {criar ? <CriarFase modelo={f} aoCriar={(id) => { setCriar(false); navegar(`admin/missoes/${id}`); }} /> : null}
      <CampoEditavel alvo={alvo(['titulo'])} rotulo="Título" />
      <CampoEditavel alvo={alvo(['objetivo'])} rotulo="Objetivo (aparece para o adulto)" multilinha />
      <CampoEditavel alvo={alvo(['acolhida', 'texto'])} rotulo="Fala de abertura" quem={f.acolhida.quem} multilinha testid="campo-acolhida" />
      <CampoEditavel alvo={alvo(['gancho', 'texto'])} rotulo="Fala do fim (gancho)" quem={f.gancho.quem} multilinha />
      {f.falaEntrada ? <CampoEditavel alvo={alvo(['falaEntrada', 'texto'])} rotulo="Fala da entrada" quem={f.falaEntrada.quem} /> : null}
      <h2>Cenas</h2>
      <OrdemCenas fase={f} />
    </div>
  );
}

/** Cenas na ordem atual, com as desligadas no lugar em que estavam: subir, descer, ligar, desligar, editar. */
function OrdemCenas({ fase }: { fase: Fase }) {
  const base = (CONTEUDO_EDITAVEL.original('fases', fase.id) as Fase | undefined) ?? fase;
  const aplicadas = CONTEUDO_EDITAVEL.edicoes().filter((e) => e.colecao === 'fases' && e.item === fase.id);
  const desligadas = new Set((aplicadas.find((e) => e.tipo === 'desligar-cenas')?.valor as string[] | undefined) ?? []);
  const ligadas = fase.cenas.map((c) => c.id);
  // ordem de todas: as ligadas na ordem atual; cada desligada logo depois da cena que vinha antes dela no original
  const todas: string[] = [...ligadas];
  base.cenas.forEach((c, i) => {
    if (todas.includes(c.id)) return;
    const antes = base.cenas.slice(0, i).reverse().find((x) => todas.includes(x.id));
    todas.splice(antes ? todas.indexOf(antes.id) + 1 : 0, 0, c.id);
  });
  const [r, setR] = useState<ResultadoVerificacao | null>(null);
  const salvar = async (e: Omit<Edicao, 'em' | 'quem'>) => setR(await salvarVerificando(e));
  const mover = (id: string, d: -1 | 1) => {
    const o = [...todas];
    const i = o.indexOf(id);
    const j = i + d;
    if (j < 0 || j >= o.length) return;
    [o[i], o[j]] = [o[j], o[i]];
    void salvar({ colecao: 'fases', item: fase.id, tipo: 'ordem-cenas', valor: o, nota: 'nova ordem das cenas' });
  };
  const alternar = (id: string) => {
    const d = new Set(desligadas);
    if (d.has(id)) d.delete(id); else d.add(id);
    void salvar({ colecao: 'fases', item: fase.id, tipo: 'desligar-cenas', valor: [...d], nota: d.has(id) ? `cena ${id} desligada` : `cena ${id} ligada` });
  };
  const cenaPorId = (id: string) => fase.cenas.find((c) => c.id === id) ?? base.cenas.find((c) => c.id === id)!;
  return (
    <>
      {r && !r.ok ? <AvisoVerificador r={r} /> : null}
      <ol className="adm-cenas" data-testid="lista-cenas">
        {todas.map((id, i) => {
          const c = cenaPorId(id);
          const off = desligadas.has(id);
          return (
            <li key={id} className={`adm-cena ${off ? 'desligada' : ''}`} data-cena={id} data-testid="cena">
              <div className="adm-linha entre">
                <span><b>{c.tipo}</b> · {c.titulo} <span className="adm-etq cinza">{c.atividade ? TIPO_ATIVIDADE[c.atividade.tipo] ?? c.atividade.tipo : 'só cena'}</span>{off ? <span className="adm-etq terra">desligada</span> : null}</span>
                <span className="adm-linha">
                  <button className="btn adm-btn" disabled={i === 0} onClick={() => mover(id, -1)} aria-label={`Subir ${id}`} data-testid="subir-cena">↑</button>
                  <button className="btn adm-btn" disabled={i === todas.length - 1} onClick={() => mover(id, 1)} aria-label={`Descer ${id}`} data-testid="descer-cena">↓</button>
                  <label className="adm-check"><input type="checkbox" checked={!off} onChange={() => alternar(id)} data-testid="ligar-cena" /> ligada</label>
                </span>
              </div>
              {!off ? (
                <details>
                  <summary data-testid="abrir-cena">Editar esta cena</summary>
                  <EditorCena fase={fase} cena={c} />
                </details>
              ) : null}
            </li>
          );
        })}
      </ol>
    </>
  );
}

function EditorCena({ fase, cena }: { fase: Fase; cena: Cena }) {
  const pre: (string | number)[] = ['cenas', `@${cena.id}`];
  const textos = useMemo(() => textosDoItem('fases', fase.id, cena).map((t) => ({ ...t, caminho: [...pre, ...t.caminho] })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fase.id, cena]);
  const a = cena.atividade;
  return (
    <div className="adm-cena-ed" data-testid="editor-cena">
      <Previa cena={cena} />
      {a?.tipo === 'escolher' ? (a as AtividadeEscolher).itens.map((it, i) => (it.leitura && it.mostrar ? <TrocarPalavra key={i} fase={fase} cena={cena} indice={i} item={it} /> : null)) : null}
      {a && (a.tipo === 'montar' || a.tipo === 'palmas') ? (
        <CampoEditavel alvo={{ colecao: 'fases', item: fase.id, caminho: [...pre, 'atividade', 'palavras'] }} tipo="lista" rotulo="Palavras (separadas por vírgula)" testid="campo-palavras" />
      ) : null}
      {a && ['sintese', 'caixas', 'parMinimo', 'troca', 'frase', 'ditado'].includes(a.tipo) ? (
        <p className="adm-nota">As palavras desta atividade ({TIPO_ATIVIDADE[a.tipo]}) levam o som de cada letra e as letras móveis: trocar aqui ainda não dá (fica para a próxima versão). Os textos e as falas, sim.</p>
      ) : null}
      <h3 className="adm-sub">Falas e textos da cena</h3>
      {textos.length ? textos.map((t) => (
        <CampoEditavel key={t.caminho.join('/')} alvo={{ colecao: 'fases', item: fase.id, caminho: t.caminho }} rotulo={t.onde.replace(`${fase.id} › `, '')} quem={t.tipo === 'fala' ? t.quem : undefined} multilinha={t.texto.length > 50} />
      )) : <p className="adm-nota">Sem falas nem textos nesta cena.</p>}
    </div>
  );
}

/** Pré-visualização simples (o que a criança vê e ouve), atualizada a cada edição. */
function Previa({ cena }: { cena: Cena }) {
  const a = cena.atividade;
  return (
    <div className="adm-previa" data-testid="previa-cena" aria-label="Pré-visualização">
      <small>Pré-visualização</small>
      <b>{cena.titulo}</b>
      {cena.assiste?.roteiro.map((f, i) => <p key={i}><span className="adm-voz">{f.quem}</span> {f.texto}</p>)}
      {a ? <p><span className="adm-voz">{a.enunciado.quem}</span> {a.enunciado.texto}</p> : null}
      {a?.tipo === 'escolher' ? (
        <div className="adm-previa-itens">
          {(a as AtividadeEscolher).itens.slice(0, 6).map((it, i) => (
            <span key={i} className="adm-previa-item">
              {it.mostrar ? <b className="adm-previa-palavra">{it.mostrar}</b> : it.ouvir ? <i>🔊 {it.ouvir}</i> : null}
              {it.opcoes.map((o) => {
                const src = o.figura !== undefined ? caminhoFigura(o.figura || undefined, o.rotulo) : null;
                return <span key={o.id} className={`adm-previa-op ${o.id === it.correta ? 'certa' : ''}`}>{src ? <img src={src} alt="" /> : null}{o.letra ?? o.rotulo}</span>;
              })}
            </span>
          ))}
        </div>
      ) : null}
      {a && 'palavras' in a && Array.isArray(a.palavras) ? <p>Palavras: <b>{(a.palavras as string[]).join(', ')}</b></p> : null}
    </div>
  );
}

/**
 * Trocar a palavra de um item de LEITURA ("leia e toque na figura"): muda a palavra mostrada E a opção certa (a figura
 * da palavra nova), para a resposta continuar batendo. Palavra nova precisa de figura e passa pelo verificador.
 */
function TrocarPalavra({ fase, cena, indice, item }: { fase: Fase; cena: Cena; indice: number; item: ItemEscolha }) {
  const [w, setW] = useState('');
  const [rodada, setRodada] = useState(0);
  const [msg, setMsg] = useState('');
  const caminho = ['cenas', `@${cena.id}`, 'atividade', 'itens', indice];
  const nova = w.trim().toLowerCase();
  const montar = (): ItemEscolha => {
    const certa = item.opcoes.find((o) => o.id === item.correta);
    const opcao = { ...(certa ?? {}), id: nova, rotulo: nova, falar: nova, ...(certa && 'figura' in certa ? { figura: '' } : {}) };
    return { ...item, mostrar: nova.toUpperCase(), correta: nova, opcoes: certa ? item.opcoes.map((o) => (o === certa ? opcao : o)) : [...item.opcoes, opcao] };
  };
  const semFigura = !!nova && !caminhoFigura(undefined, nova);
  const igualOutra = !!nova && item.opcoes.some((o) => o.id === nova && o.id !== item.correta);
  const r = useMemo(() => (nova && !semFigura && !igualOutra ? verificarEdicao(CONTEUDO_EDITAVEL, { colecao: 'fases', item: fase.id, tipo: 'definir', caminho, valor: montar(), em: 0 }, edicoes.edicoes()) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [nova, rodada, semFigura, igualOutra]);
  const salvar = async () => {
    const res = await salvarVerificando({ colecao: 'fases', item: fase.id, tipo: 'definir', caminho, valor: montar(), nota: `palavra "${item.mostrar}" → "${nova.toUpperCase()}"` });
    if (res.ok) { setMsg(`Trocada: ${nova.toUpperCase()}. Guardado neste aparelho.`); setW(''); }
    setRodada((x) => x + 1);
  };
  const reg = edicoes.noLugar({ colecao: 'fases', item: fase.id, tipo: 'definir', caminho });
  return (
    <div className="adm-campo-ed" data-testid="trocar-palavra" data-item={indice}>
      <span className="adm-campo-rot">Palavra para ler (item {indice + 1}): <b className="adm-previa-palavra" data-testid="palavra-atual">{item.mostrar}</b>{reg ? <span className="adm-etq ipe">editada</span> : null}</span>
      <div className="adm-linha">
        <input value={w} onChange={(e) => { setMsg(''); setW(e.target.value.replace(/\s/g, '')); }} placeholder="nova palavra" aria-label={`Nova palavra para o item ${indice + 1}`} data-testid="nova-palavra" />
        <button className="btn adm-btn pri" disabled={!nova || semFigura || igualOutra || !r?.ok} onClick={() => void salvar()} data-testid="salvar-palavra"><Icone nome="check" />Trocar</button>
        {reg ? <button className="btn adm-btn" onClick={() => void edicoes.voltarAoOriginal(reg.chave)} data-testid="original-palavra"><Icone nome="lixeira" />Voltar ao original</button> : null}
      </div>
      {semFigura ? <p className="adm-bloqueio" role="alert" data-testid="sem-figura">"{nova}" não tem figura: a criança lê e toca na figura. Escolha uma palavra com figura (ou peça a arte nova).</p> : null}
      {igualOutra ? <p className="adm-bloqueio" role="alert">"{nova}" já é uma das outras opções deste item.</p> : null}
      {nova && !semFigura && !igualOutra ? <AvisoVerificador r={r} aoPronuncia={() => setRodada((x) => x + 1)} /> : null}
      {BANCO[nova] && r?.ok ? <p className="adm-nota">Pronúncia anotada: {BANCO[nova].sons}</p> : null}
      {msg ? <span className="adm-etq verde" role="status" data-testid="palavra-trocada">{msg}</span> : null}
    </div>
  );
}

/** Fase nova a partir de um modelo: mesma estrutura, ids novos; entra logo depois do modelo na jornada (ou como rascunho). */
function CriarFase({ modelo, aoCriar }: { modelo: Fase; aoCriar: (id: string) => void }) {
  const ids = CONTEUDO_EDITAVEL.colecao('fases')!.ids();
  let k = 1;
  while (ids.includes(`${modelo.id}-n${k}`)) k++;
  const id = `${modelo.id}-n${k}`;
  const [titulo, setTitulo] = useState(`${modelo.titulo} (nova)`);
  const [lugar, setLugar] = useState<'depois' | 'rascunho'>('rascunho');
  const [r, setR] = useState<ResultadoVerificacao | null>(null);
  const criar = async () => {
    const copia = JSON.parse(JSON.stringify(modelo).split(`"${modelo.id}-`).join(`"${id}-`)) as Fase;
    copia.id = id;
    copia.titulo = titulo.trim() || copia.titulo;
    const res = await salvarVerificando({ colecao: 'fases', item: id, tipo: 'novo', valor: copia, modelo: modelo.id, ...(lugar === 'depois' ? { depoisDe: modelo.id } : { rascunho: true }), nota: `fase nova a partir de ${modelo.id}` });
    setR(res);
    if (res.ok) aoCriar(id);
  };
  return (
    <div className="adm-editor" data-testid="form-criar-fase">
      <p>A fase nova copia <b>{modelo.id}</b> inteira (cenas, atividades, falas). Depois, edite o que quiser nela. O id dela será <code>{id}</code>.</p>
      <label className="adm-campo largo">Título <input value={titulo} onChange={(e) => setTitulo(e.target.value)} data-testid="titulo-fase-nova" /></label>
      <label className="adm-check"><input type="radio" checked={lugar === 'rascunho'} onChange={() => setLugar('rascunho')} /> Rascunho: fora da jornada (só o administrador abre)</label>
      <label className="adm-check"><input type="radio" checked={lugar === 'depois'} onChange={() => setLugar('depois')} data-testid="fase-na-jornada" /> Na jornada, logo depois de {modelo.id} (quem já passou daqui vai encontrar a fase nova como próxima)</label>
      <div className="adm-linha"><button className="btn adm-btn pri" onClick={() => void criar()} data-testid="confirmar-fase-nova"><Icone nome="mais" />Criar</button></div>
      <AvisoVerificador r={r && !r.ok ? r : null} />
      <p className="adm-nota">Quem cria fases novas: {quemEdita() ?? 'administrador'}. Fase nova entra para todos só depois do pacote publicado.</p>
    </div>
  );
}
