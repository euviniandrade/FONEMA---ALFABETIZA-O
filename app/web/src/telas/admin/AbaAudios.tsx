/**
 * Área do administrador › ÁUDIOS: todos os áudios da plataforma com o texto ao lado; ouvir o atual, subir um arquivo
 * ou gravar pelo microfone (contagem 3-2-1, ouvir antes de salvar), aparar silêncio e igualar volume no navegador,
 * e "Voltar ao original". O áudio novo toca exatamente onde o original tocava (servicos/substituicoes.ts), neste aparelho.
 * Modo "Gravar o alfabeto": letra por letra, com o faz de conta, as palavras-exemplo e os dois sons quando a letra tem dois.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { ALFABETO, type LetraAlfabeto } from '@fonema/conteudo';
import { Icone } from '../../componentes/ui.tsx';
import { navegar } from '../../rotas.ts';
import { ROTULO_TIPO_AUDIO, filtrarCatalogo, type FiltroCatalogo, type ItemCatalogo, type TipoAudio } from '../../servicos/catalogo-audios.ts';
import { gravar, prepararArquivo, temMicrofone, type Gravando, type OpcoesPreparo } from '../../servicos/audio-edicao.ts';
import { SONS_DO_ESTUDIO } from '../../servicos/sons-letras.ts';
import { idSom, substituicoes, type MetaSubstituto } from '../../servicos/substituicoes.ts';
import { servicoAdmin } from '../../servicos/admin-conta.ts';
import { dataCurta, pararAudio, tocarAtual, tocarUrl, useCatalogo, useTocando, useTrocados } from './dados-admin.ts';

/* ------------------------------------------------------------------ quem grava (aviso de autorização) */
export interface PrefGravacao { quem: string; autorizacao: boolean }
export function usePrefGravacao(): [PrefGravacao, (p: Partial<PrefGravacao>) => void] {
  const [p, setP] = useState<PrefGravacao>({ quem: '', autorizacao: false });
  useEffect(() => { void servicoAdmin().ler<PrefGravacao>('gravacao').then((v) => { if (v) setP(v); }); }, []);
  const mudar = (n: Partial<PrefGravacao>) => setP((a) => { const v = { ...a, ...n }; void servicoAdmin().gravar('gravacao', v); return v; });
  return [p, mudar];
}

export function AvisoAutorizacao({ pref, mudar }: { pref: PrefGravacao; mudar: (p: Partial<PrefGravacao>) => void }) {
  return (
    <div className="adm-aviso" data-testid="aviso-autorizacao">
      <p><Icone nome="escudo" /> <b>Voz de pessoa real:</b> gravar a voz de um adulto para o produto pede <b>autorização por escrito</b> da pessoa (e do responsável, se for criança). Guarde o documento. A decisão de publicar é do dono.</p>
      <div className="adm-linha">
        <label className="adm-campo">Quem está gravando <input value={pref.quem} onChange={(e) => mudar({ quem: e.target.value })} placeholder="ex.: Agatha" data-testid="quem-grava" /></label>
        <label className="adm-check"><input type="checkbox" checked={pref.autorizacao} onChange={(e) => mudar({ autorizacao: e.target.checked })} data-testid="autorizou" /> A pessoa autorizou por escrito</label>
      </div>
      <p className="adm-nota">O microfone só liga quando você toca em "Gravar", e o navegador pede permissão. Os áudios ficam só neste aparelho até você gerar o pacote em "Publicar".</p>
    </div>
  );
}

/* ------------------------------------------------------------------ editor: subir arquivo ou gravar */
type Fase = 'escolher' | 'contagem' | 'gravando' | 'ouvir';
export function EditorAudio({ item, pref, aoSalvar, aoFechar, compacto = false }: { item: ItemCatalogo; pref: PrefGravacao; aoSalvar?: () => void; aoFechar: () => void; compacto?: boolean }) {
  const [fase, setFase] = useState<Fase>('escolher');
  const [bruto, setBruto] = useState<{ blob: Blob; nome: string; origem: 'arquivo' | 'gravacao' } | null>(null);
  const [opc, setOpc] = useState<OpcoesPreparo>({ aparar: true, igualar: true });
  const [pronto, setPronto] = useState<{ blob: Blob; duracaoMs?: number; url: string } | null>(null);
  const [erro, setErro] = useState('');
  const [conta, setConta] = useState(3);
  const [nivel, setNivel] = useState(0);
  const [salvando, setSalvando] = useState(false);
  const rec = useRef<Gravando | null>(null);
  const inicio = useRef(0);
  const [segundos, setSegundos] = useState(0);
  const mic = temMicrofone();
  const maxMs = item.tipo === 'frase' ? 20000 : 8000;

  useEffect(() => () => { rec.current?.cancelar(); pararAudio(); }, []);
  // prepara (aparar/igualar) sempre que o áudio bruto ou as opções mudam
  useEffect(() => {
    if (!bruto) { setPronto(null); return; }
    let vivo = true;
    setErro('');
    void prepararArquivo(bruto.blob, opc).then(
      (r) => { if (vivo) setPronto((a) => { if (a) URL.revokeObjectURL(a.url); return { ...r, url: URL.createObjectURL(r.blob) }; }); },
      (e: unknown) => { if (vivo) { setPronto(null); setErro(e instanceof Error ? e.message : 'Não deu para abrir este áudio.'); } }
    );
    return () => { vivo = false; };
  }, [bruto, opc]);

  const escolherArquivo = (f: File | undefined) => {
    if (!f) return;
    if (!/^audio\//.test(f.type) && !/\.(mp3|wav|ogg|oga|webm|m4a|aac|flac)$/i.test(f.name)) { setErro('Escolha um arquivo de áudio (mp3, wav, ogg, m4a…).'); return; }
    if (f.size > 15_000_000) { setErro('Arquivo grande demais (máximo 15 MB).'); return; }
    setBruto({ blob: f, nome: f.name, origem: 'arquivo' });
    setFase('ouvir');
  };
  const comecarGravacao = async () => {
    setErro('');
    pararAudio();
    setFase('contagem');
    for (let i = 3; i >= 1; i--) { setConta(i); await new Promise((r) => setTimeout(r, 800)); }
    try {
      rec.current = await gravar(setNivel, () => void pararGravacao(), maxMs);
      inicio.current = Date.now();
      setFase('gravando');
    } catch {
      setFase('escolher');
      setErro('O microfone não foi liberado. Permita o microfone nas configurações do navegador e tente de novo.');
    }
  };
  useEffect(() => {
    if (fase !== 'gravando') return;
    const t = setInterval(() => setSegundos(Math.floor((Date.now() - inicio.current) / 1000)), 250);
    return () => clearInterval(t);
  }, [fase]);
  const pararGravacao = async () => {
    const r = rec.current;
    rec.current = null;
    if (!r) return;
    const b = await r.parar();
    setBruto({ blob: b, nome: 'gravacao.wav', origem: 'gravacao' });
    setFase('ouvir');
  };
  const salvar = async () => {
    if (!pronto || !bruto) return;
    setSalvando(true);
    try {
      await substituicoes.salvar({
        id: item.id, blob: pronto.blob, nomeArquivo: bruto.nome, origem: bruto.origem, em: Date.now(), duracaoMs: pronto.duracaoMs,
        quem: pref.quem.trim() || undefined, texto: item.texto, autorizacao: pref.autorizacao
      });
      pararAudio();
      aoSalvar?.();
      aoFechar();
    } catch (e) { setErro(e instanceof Error ? e.message : 'Não deu para salvar.'); } finally { setSalvando(false); }
  };

  return (
    <div className={`adm-editor ${compacto ? 'compacto' : ''}`} data-testid="editor-audio" role="group" aria-label={`Trocar o áudio: ${item.texto}`}>
      {fase === 'escolher' ? (
        <div className="adm-linha">
          <label className="btn adm-btn pri"><Icone nome="baixar" />Subir arquivo
            <input type="file" accept="audio/*,.mp3,.wav,.ogg,.m4a,.webm" className="sr" data-testid="arquivo-audio" onChange={(e) => { escolherArquivo(e.target.files?.[0]); e.target.value = ''; }} />
          </label>
          <button className="btn adm-btn ipe" onClick={() => void comecarGravacao()} disabled={!mic} data-testid="gravar-microfone"><Icone nome="gravar" />Gravar agora</button>
          <button className="btn adm-btn" onClick={aoFechar}>Cancelar</button>
          {!mic ? <span className="adm-nota">Este navegador não grava (sem microfone ou sem permissão).</span> : null}
        </div>
      ) : null}
      {fase === 'contagem' ? <div className="adm-contagem" aria-live="assertive" data-testid="contagem"><span>{conta}</span><small>Prepare-se…</small></div> : null}
      {fase === 'gravando' ? (
        <div className="adm-linha" aria-live="polite">
          <span className="adm-gravando"><i style={{ transform: `scaleX(${0.08 + nivel * 0.92})` }} /></span>
          <b>Gravando… {segundos}s</b>
          <button className="btn adm-btn terra" onClick={() => void pararGravacao()} data-testid="parar-gravacao"><Icone nome="x" />Parar</button>
        </div>
      ) : null}
      {fase === 'ouvir' && bruto ? (
        <div className="adm-ouvir">
          <div className="adm-linha">
            <label className="adm-check"><input type="checkbox" checked={opc.aparar} onChange={(e) => setOpc({ ...opc, aparar: e.target.checked })} data-testid="opc-aparar" /> Aparar o silêncio das pontas</label>
            <label className="adm-check"><input type="checkbox" checked={opc.igualar} onChange={(e) => setOpc({ ...opc, igualar: e.target.checked })} data-testid="opc-igualar" /> Igualar o volume ao das outras falas</label>
          </div>
          <div className="adm-linha">
            <button className="btn adm-btn" disabled={!pronto} onClick={() => pronto && void tocarUrl(pronto.url)} data-testid="ouvir-novo"><Icone nome="tocar" />Ouvir antes de salvar</button>
            {pronto?.duracaoMs ? <span className="adm-nota">{(pronto.duracaoMs / 1000).toFixed(1).replace('.', ',')} s{!opc.aparar && !opc.igualar ? ' · arquivo como veio' : ' · preparado'}</span> : null}
            <button className="btn adm-btn verde" disabled={!pronto || salvando} onClick={() => void salvar()} data-testid="salvar-audio"><Icone nome="check" />{salvando ? 'Salvando…' : 'Salvar no lugar do original'}</button>
            <button className="btn adm-btn" onClick={() => { setBruto(null); setFase('escolher'); }}><Icone nome="repetir" />Outro</button>
            <button className="btn adm-btn" onClick={aoFechar}>Cancelar</button>
          </div>
        </div>
      ) : null}
      {erro ? <p className="adm-erro" role="alert" data-testid="erro-audio">{erro}</p> : null}
      {fase === 'escolher' ? <p className="adm-nota">Grava no máximo {maxMs / 1000} s. Fale perto do microfone, num lugar quieto.</p> : null}
    </div>
  );
}

/* ------------------------------------------------------------------ uma linha da lista */
function SituacaoAudio({ it, meta }: { it: ItemCatalogo; meta?: MetaSubstituto }) {
  if (meta) return <span className="adm-etq verde" title={meta.nomeArquivo}>Trocado aqui · {dataCurta(meta.em)}{meta.quem ? ` · ${meta.quem}` : ''}</span>;
  if (!it.arquivo) return <span className="adm-etq cinza">Sem áudio</span>;
  return <span className="adm-etq">Original</span>;
}

function LinhaAudio({ it, meta, aberto, abrir, pref }: { it: ItemCatalogo; meta?: MetaSubstituto; aberto: boolean; abrir: (v: boolean) => void; pref: PrefGravacao }) {
  const tocando = useTocando();
  return (
    <li className={`adm-audio ${meta ? 'trocado' : ''}`} data-id={it.id} data-testid="linha-audio">
      <div className="adm-audio-cab">
        <span className={`adm-tipo t-${it.tipo}`}>{ROTULO_TIPO_AUDIO[it.tipo]}</span>
        {it.voz ? <span className="adm-voz">{it.personagem === 'bolota' ? 'Bolota (voz do Tales)' : it.voz === 'sofia' ? 'Sofia' : 'Tales'}</span> : null}
        {it.auditoria ? <span className={`adm-etq ${it.auditoria === 'grave' ? 'terra' : 'ipe'}`} title="Marcado na auditoria dos clipes">Auditoria: {it.auditoria}</span> : null}
        <SituacaoAudio it={it} meta={meta} />
      </div>
      <p className="adm-texto">{it.texto}</p>
      {it.detalhe || it.fases.length ? <p className="adm-nota">{it.detalhe}{it.detalhe && it.fases.length ? ' · ' : ''}{it.fases.length ? `Onde: ${it.fases.slice(0, 4).join(', ')}${it.fases.length > 4 ? ` e mais ${it.fases.length - 4}` : ''}` : ''}</p> : null}
      <div className="adm-linha">
        <button className="btn adm-btn" disabled={!meta && !it.arquivo} onClick={() => void tocarAtual(it)} data-testid="ouvir-atual"><Icone nome="tocar" />{tocando ? 'Ouvir de novo' : 'Ouvir'}</button>
        {meta && it.arquivo ? <button className="btn adm-btn" onClick={() => void tocarUrl(`./${it.arquivo}`)}><Icone nome="tocar" />Ouvir o original</button> : null}
        <button className="btn adm-btn pri" onClick={() => abrir(!aberto)} aria-expanded={aberto} data-testid="subir-audio"><Icone nome="microfone" />{meta ? 'Trocar de novo' : 'Subir áudio'}</button>
        {meta ? <button className="btn adm-btn terra" onClick={() => void substituicoes.remover(it.id)} data-testid="voltar-original"><Icone nome="repetir" />Voltar ao original</button> : null}
      </div>
      {aberto ? <EditorAudio item={it} pref={pref} aoFechar={() => abrir(false)} /> : null}
    </li>
  );
}

/* ------------------------------------------------------------------ lista com filtros */
const LETRAS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const FASES = [['AL', 'Trilha do Alfabeto (AL)'], ['S-LETRA', 'Missão das letras (S-LETRA)'], ['TF', 'Trilha dos Sons (TF)'], ['R0', 'R0'], ['R1', 'R1'], ['R2a', 'R2a'], ['telas', 'Telas do app'], ['cantinho', 'Cantinho da Leitura'], ['bolota', 'Histórias do Bolota']] as const;
const POR_PAGINA = 40;

export function ListaAudios({ pref, inicial }: { pref: PrefGravacao; inicial?: Partial<FiltroCatalogo> }) {
  const itens = useCatalogo();
  const trocados = useTrocados();
  const [f, setF] = useState<FiltroCatalogo>({ busca: '', tipo: '', voz: '', letra: '', fase: '', so: '', ...inicial });
  const [aberto, setAberto] = useState<string | null>(null);
  const [mostrar, setMostrar] = useState(POR_PAGINA);
  const lista = useMemo(() => (itens ? filtrarCatalogo(itens, { ...f, trocados: new Set(trocados.keys()) }) : []), [itens, f, trocados]);
  useEffect(() => setMostrar(POR_PAGINA), [f]);
  if (!itens) return <p className="adm-nota">Carregando a lista de áudios…</p>;
  const mudar = (n: Partial<FiltroCatalogo>) => setF((a) => ({ ...a, ...n }));
  return (
    <>
      <div className="adm-filtros" role="search">
        <label className="adm-campo largo">Procurar <input type="search" value={f.busca} onChange={(e) => mudar({ busca: e.target.value })} placeholder="texto, palavra, fase…" data-testid="busca-audio" /></label>
        <label className="adm-campo">Tipo
          <select value={f.tipo} onChange={(e) => mudar({ tipo: e.target.value as TipoAudio | '' })} data-testid="filtro-tipo">
            <option value="">Todos</option>
            {(Object.keys(ROTULO_TIPO_AUDIO) as TipoAudio[]).map((t) => <option key={t} value={t}>{ROTULO_TIPO_AUDIO[t]}</option>)}
          </select>
        </label>
        <label className="adm-campo">Voz
          <select value={f.voz} onChange={(e) => mudar({ voz: e.target.value })} data-testid="filtro-voz"><option value="">Todas</option><option value="sofia">Sofia</option><option value="tales">Tales</option><option value="bolota">Bolota</option></select>
        </label>
        <label className="adm-campo">Letra
          <select value={f.letra} onChange={(e) => mudar({ letra: e.target.value })} data-testid="filtro-letra"><option value="">Todas</option>{LETRAS.map((l) => <option key={l}>{l}</option>)}</select>
        </label>
        <label className="adm-campo">Fase
          <select value={f.fase} onChange={(e) => mudar({ fase: e.target.value })} data-testid="filtro-fase"><option value="">Todas</option>{FASES.map(([v, r]) => <option key={v} value={v}>{r}</option>)}</select>
        </label>
        <label className="adm-campo">Mostrar
          <select value={f.so} onChange={(e) => mudar({ so: e.target.value as FiltroCatalogo['so'] })} data-testid="filtro-so"><option value="">Todos</option><option value="trocados">Trocados neste aparelho ({trocados.size})</option><option value="pendentes">Sem áudio</option><option value="auditoria">Marcados na auditoria</option></select>
        </label>
      </div>
      <p className="adm-nota" aria-live="polite" data-testid="contagem-audios">{lista.length} de {itens.length} áudios</p>
      <ul className="adm-audios">
        {lista.slice(0, mostrar).map((it) => <LinhaAudio key={it.id} it={it} meta={trocados.get(it.id)} aberto={aberto === it.id} abrir={(v) => setAberto(v ? it.id : null)} pref={pref} />)}
      </ul>
      {lista.length > mostrar ? <button className="btn adm-btn" onClick={() => setMostrar((n) => n + POR_PAGINA * 2)}>Mostrar mais ({lista.length - mostrar})</button> : null}
    </>
  );
}

/* ------------------------------------------------------------------ gravar o alfabeto */
interface PassoAlfabeto { titulo: string; letra?: LetraAlfabeto; fonemas: string[]; nota?: string }
export function passosDoAlfabeto(): PassoAlfabeto[] {
  const passos: PassoAlfabeto[] = ALFABETO.map((l) => ({
    titulo: `Letra ${l.letra}`, letra: l,
    fonemas: [l.fonema, l.segundoFonema].filter((x): x is string => !!x).filter((x, i, a) => a.indexOf(x) === i),
    nota: l.tipo === 'muda' ? 'O H não faz som sozinho: não há o que gravar. Passe para a próxima.' : l.tipo === 'nomes' ? 'Letra de nomes: usa o mesmo som de outra letra (gravar uma vez basta).' : undefined
  }));
  passos.push({ titulo: 'Dígrafos e o ã', fonemas: ['lh', 'nh', 'a~'], nota: 'Sons que aparecem depois, nas sílabas: LH, NH e o A nasal.' });
  return passos;
}

function GravarAlfabeto({ pref }: { pref: PrefGravacao }) {
  const passos = useMemo(passosDoAlfabeto, []);
  const [i, setI] = useState(0);
  const [aberto, setAberto] = useState<string | null>(null);
  const itens = useCatalogo();
  const trocados = useTrocados();
  const p = passos[i];
  const todos = useMemo(() => [...new Set(passos.flatMap((x) => x.fonemas))], [passos]);
  const feitos = todos.filter((f) => trocados.has(idSom(f))).length;
  const proximo = () => { setAberto(null); pararAudio(); setI((n) => Math.min(passos.length - 1, n + 1)); };
  return (
    <section className="adm-alfabeto" data-testid="gravar-alfabeto">
      <div className="adm-linha entre">
        <button className="btn adm-btn" onClick={() => navegar('admin/audios')}><Icone nome="seta-esq" />Voltar à lista</button>
        <span className="adm-nota" data-testid="progresso-alfabeto"><b>{feitos}</b> de {todos.length} sons gravados · passo {i + 1} de {passos.length}</span>
      </div>
      <nav className="adm-letras" aria-label="Ir para a letra">
        {passos.map((x, k) => {
          const ok = x.fonemas.length > 0 && x.fonemas.every((f) => trocados.has(idSom(f)));
          return <button key={x.titulo} className={`adm-letrinha ${k === i ? 'atual' : ''} ${ok ? 'ok' : ''}`} onClick={() => { setAberto(null); setI(k); }} aria-current={k === i ? 'step' : undefined}>{x.letra?.letra ?? 'LH…'}</button>;
        })}
      </nav>
      <div className="adm-passo">
        <div className="adm-passo-letra" aria-hidden="true">{p.letra ? <>{p.letra.letra}<small>{p.letra.minuscula}</small></> : 'lh nh ã'}</div>
        <div className="adm-passo-info">
          <h2>{p.titulo}</h2>
          {p.letra ? (
            <>
              <p><b>Faz de conta:</b> {p.letra.brincadeira}</p>
              <p><b>Palavras-exemplo:</b> {p.letra.palavras.join(', ')}</p>
              <p><b>Boca:</b> {p.letra.dicaBoca}</p>
            </>
          ) : null}
          {p.nota ? <p className="adm-nota">{p.nota}</p> : null}
          <p className="adm-nota">Grave só o <b>som</b> (ex.: "mmm"), nunca o nome da letra ("eme"). Consoantes que estouram (p, b, t…): curtinho, sem vogal depois.</p>
        </div>
      </div>
      <ul className="adm-audios">
        {p.fonemas.map((f) => {
          const s = SONS_DO_ESTUDIO.find((x) => x.fonema === f);
          const it = itens?.find((x) => x.id === idSom(f));
          if (!s || !it) return null;
          const meta = trocados.get(it.id);
          return (
            <li key={f} className={`adm-audio ${meta ? 'trocado' : ''}`} data-id={it.id} data-testid="som-alfabeto">
              <div className="adm-audio-cab"><span className="adm-tipo t-som-letra">{p.fonemas.length > 1 ? (f === p.fonemas[0] ? 'Som principal' : 'Segundo som') : 'Som da letra'}</span><SituacaoAudio it={it} meta={meta} /></div>
              <p className="adm-texto">{s.rotulo}: <b>{s.como}</b></p>
              <p className="adm-nota">Como em: {s.exemplo}</p>
              <div className="adm-linha">
                <button className="btn adm-btn" disabled={!meta && !it.arquivo} onClick={() => void tocarAtual(it)}><Icone nome="tocar" />Ouvir o atual</button>
                <button className="btn adm-btn pri" onClick={() => setAberto(aberto === f ? null : f)} data-testid="subir-audio"><Icone nome="microfone" />{meta ? 'Gravar de novo' : 'Gravar'}</button>
                {meta ? <button className="btn adm-btn terra" onClick={() => void substituicoes.remover(it.id)}><Icone nome="repetir" />Voltar ao original</button> : null}
              </div>
              {aberto === f ? <EditorAudio item={it} pref={pref} compacto aoFechar={() => setAberto(null)} aoSalvar={() => { const resto = p.fonemas.filter((x) => x !== f && !trocados.has(idSom(x))); if (!resto.length) setTimeout(proximo, 400); }} /> : null}
            </li>
          );
        })}
      </ul>
      <div className="adm-linha entre">
        <button className="btn adm-btn" disabled={i === 0} onClick={() => { setAberto(null); setI(i - 1); }}><Icone nome="seta-esq" />Letra anterior</button>
        <button className="btn adm-btn pri" disabled={i === passos.length - 1} onClick={proximo} data-testid="proxima-letra">Próxima letra<Icone nome="seta" /></button>
      </div>
    </section>
  );
}

export function AbaAudios({ sub }: { sub?: string }) {
  const [pref, mudar] = usePrefGravacao();
  return (
    <section className="adm-cartao" data-testid="aba-audios">
      <div className="adm-cab">
        <h1>Áudios da plataforma</h1>
        {sub !== 'alfabeto' ? <button className="btn adm-btn ipe" onClick={() => navegar('admin/audios/alfabeto')} data-testid="abrir-gravar-alfabeto"><Icone nome="microfone" />Gravar o alfabeto</button> : null}
      </div>
      <p className="adm-nota">Cada áudio com o texto ao lado. "Subir áudio" troca o áudio <b>neste aparelho</b>, exatamente onde ele toca (lição, jogo, história). Para valer para todos, gere o pacote em <b>Publicar</b>.</p>
      <AvisoAutorizacao pref={pref} mudar={mudar} />
      {sub === 'alfabeto' ? <GravarAlfabeto pref={pref} /> : <ListaAudios pref={pref} />}
    </section>
  );
}
