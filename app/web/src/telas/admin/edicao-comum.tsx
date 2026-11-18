/**
 * Peças comuns do GERENCIADOR (fila do dono nº 18): campo editável com o verificador AO VIVO, aviso de bloqueio em
 * linguagem simples, assistente de pronúncia para palavra nova e o áudio da fala (desatualizado → gravar/subir aqui).
 */
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  CONTEUDO_EDITAVEL, anotarPalavra, chaveDaEdicao, conferirAnotacao, lerCaminho, perguntasDePronuncia, temAcentoGrafico, todosOsTextos, verificarEdicao,
  type Caminho, type Edicao, type RespostaVogal, type ResultadoVerificacao, type TextoEditavel
} from '@fonema/conteudo';
import { renderFala } from '@fonema/motor';
import { Icone } from '../../componentes/ui.tsx';
import { edicoes } from '../../servicos/edicoes.ts';
import { idFala, substituicoes } from '../../servicos/substituicoes.ts';
import { VOZ_DO_PERSONAGEM, chaveTrecho } from '../../servicos/voz.ts';
import { servicoAdmin } from '../../servicos/admin-conta.ts';
import { EditorAudio, usePrefGravacao } from './AbaAudios.tsx';
import { useCatalogo, useTrocados } from './dados-admin.ts';

/** Re-renderiza quando alguma edição deste aparelho muda. */
export function useVersaoEdicoes(): number {
  const [v, setV] = useState(0);
  useEffect(() => edicoes.ouvir(() => setV((x) => x + 1)), []);
  return v;
}

export interface Alvo { colecao: string; item: string; caminho: Caminho }

/** Nome de quem está editando (para o histórico). */
export const quemEdita = () => servicoAdmin().sessao()?.nome;

/** Confere e guarda; devolve o resultado do verificador (bloqueada = nada foi guardado). */
export async function salvarVerificando(e: Omit<Edicao, 'em' | 'quem'>): Promise<ResultadoVerificacao> {
  const ed: Edicao = { ...e, em: Date.now(), quem: quemEdita() };
  const r = verificarEdicao(CONTEUDO_EDITAVEL, ed, edicoes.edicoes());
  if (r.ok) await edicoes.salvar(ed);
  return r;
}

/* ------------------------------------------------------------------ falas iguais em outros lugares */
let indice: { de: unknown; mapa: Map<string, TextoEditavel[]>; todos: TextoEditavel[] } | null = null;
/** Todos os textos editáveis agora (refeito quando as edições mudam). */
export function textosAgora(): TextoEditavel[] {
  const de = CONTEUDO_EDITAVEL.edicoes();
  if (indice?.de !== de) {
    const todos = todosOsTextos(CONTEUDO_EDITAVEL);
    const mapa = new Map<string, TextoEditavel[]>();
    for (const t of todos) if (t.tipo === 'fala') { const k = `${t.quem}|${t.texto}`; if (!mapa.has(k)) mapa.set(k, []); mapa.get(k)!.push(t); }
    indice = { de, mapa, todos };
  }
  return indice.todos;
}
/** Os lugares (fases, falas gerais…) onde a MESMA fala, da mesma pessoa, aparece. */
export function lugaresDaFala(texto: string, quem: string): TextoEditavel[] {
  textosAgora();
  return indice!.mapa.get(`${quem}|${texto}`) ?? [];
}
const mesmoLugar = (t: Alvo, a: Alvo) => t.colecao === a.colecao && t.item === a.item && JSON.stringify(t.caminho) === JSON.stringify(a.caminho);

/* ------------------------------------------------------------------ áudio da fala */

/** Os trechos (ids de áudio) de uma fala, em todas as concordâncias e sem o nome da criança. */
export function trechosDaFala(texto: string, quem = 'sofia'): { id: string; texto: string; voz: 'sofia' | 'tales' }[] {
  const voz = VOZ_DO_PERSONAGEM[quem] ?? 'sofia';
  const out = new Map<string, { id: string; texto: string; voz: 'sofia' | 'tales' }>();
  for (const genero of ['m', 'f', 'n'] as const) {
    for (const parte of renderFala(texto, { nome: '\u0001', genero }).split('\u0001')) {
      const k = chaveTrecho(parte);
      if (k) out.set(idFala(voz, k), { id: idFala(voz, k), texto: k, voz });
    }
  }
  return [...out.values()];
}

/** Situação do áudio de uma fala editada: tem clipe? (oficial ou trocado aqui). Sem clipe: gravar ou subir aqui. */
export function AudioDaFala({ texto, quem }: { texto: string; quem?: string }) {
  const catalogo = useCatalogo();
  const trocados = useTrocados();
  const [pref, mudarPref] = usePrefGravacao();
  const [abrir, setAbrir] = useState<string | null>(null);
  const trechos = useMemo(() => trechosDaFala(texto, quem), [texto, quem]);
  if (!catalogo) return null;
  const tem = (id: string) => trocados.has(id) || substituicoes.tem(id) || !!catalogo.find((i) => i.id === id)?.arquivo;
  const faltam = trechos.filter((t) => !tem(t.id));
  if (!faltam.length) return <p className="adm-nota adm-bom" data-testid="audio-ok"><Icone nome="som" /> O áudio desta fala existe.</p>;
  return (
    <div className="adm-aviso" data-testid="audio-desatualizado">
      <p><Icone nome="microfone" /> <b>Áudio desatualizado:</b> o texto mudou e {faltam.length === 1 ? 'este trecho ainda não tem' : 'estes trechos ainda não têm'} voz. Enquanto isso, a fala aparece escrita no balão.</p>
      {faltam.map((t) => (
        <div key={t.id} className="adm-linha">
          <span className="adm-voz">{t.voz === 'sofia' ? 'Sofia' : 'Tales'}</span><q>{t.texto}</q>
          <button className="btn adm-btn" onClick={() => setAbrir(abrir === t.id ? null : t.id)} data-testid="gravar-fala-editada"><Icone nome="gravar" />Gravar ou subir</button>
          {abrir === t.id ? (
            <div style={{ width: '100%' }}>
              <label className="adm-campo">Quem está gravando <input value={pref.quem} onChange={(e) => mudarPref({ quem: e.target.value })} placeholder="ex.: Agatha" /></label>
              <label className="adm-check"><input type="checkbox" checked={pref.autorizacao} onChange={(e) => mudarPref({ autorizacao: e.target.checked })} /> A pessoa autorizou por escrito</label>
              <EditorAudio item={{ id: t.id, tipo: 'frase', texto: t.texto, voz: t.voz, arquivo: null, letras: [], fases: [] }} pref={pref} aoFechar={() => setAbrir(null)} compacto />
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ assistente de pronúncia */

export function AssistentePronuncia({ palavra, aoSalvar }: { palavra: string; aoSalvar?: () => void }) {
  const w = palavra.toLowerCase();
  const perguntas = useMemo(() => perguntasDePronuncia(w), [w]);
  const [resp, setResp] = useState<Record<number, RespostaVogal>>({});
  const [oxitona, setOxitona] = useState(false);
  const [manual, setManual] = useState<string | null>(null);
  const [msg, setMsg] = useState('');
  const sons = manual ?? anotarPalavra(w, resp);
  const erros = conferirAnotacao({ texto: w, sons });
  const silabas = (w.match(/[aeiouáàâãéêíóôõú]+/g) ?? []).length;
  const salvar = async () => {
    if (erros.length) return;
    await edicoes.salvar({ colecao: 'banco', item: w, tipo: 'novo', valor: { texto: w, sons, ...(oxitona ? { oxitona: true } : {}) }, em: Date.now(), quem: quemEdita(), nota: `pronúncia de "${w}"` });
    setMsg('Pronúncia guardada. O verificador já confere a palavra.');
    aoSalvar?.();
  };
  return (
    <div className="adm-editor" data-testid="assistente-pronuncia">
      <b>Pronúncia de "{w}"</b>
      <p className="adm-nota">Palavra nova: responda como ela é falada. O verificador usa isso para saber se a criança já consegue ler.</p>
      {perguntas.map((p) => (
        <fieldset key={p.indice} className="adm-pergunta">
          <legend>{p.pergunta}</legend>
          {p.opcoes.map((o) => (
            <label key={o.valor} className="adm-check"><input type="radio" name={`p-${w}-${p.indice}`} checked={(resp[p.indice] ?? p.padrao) === o.valor} onChange={() => { setManual(null); setResp((r) => ({ ...r, [p.indice]: o.valor })); }} />{o.rotulo}</label>
          ))}
        </fieldset>
      ))}
      {!temAcentoGrafico(w) && silabas > 1 ? (
        <label className="adm-check"><input type="checkbox" checked={oxitona} onChange={(e) => setOxitona(e.target.checked)} data-testid="oxitona" /> A sílaba mais forte é a ÚLTIMA (como em ta-<b>TU</b>, pa-<b>PAI</b>)</label>
      ) : null}
      <label className="adm-campo">Sons, um por um (pode corrigir) <input value={sons} onChange={(e) => setManual(e.target.value)} data-testid="anotacao" /></label>
      {erros.length ? <p className="adm-erro" role="alert">{erros.join(' ')}</p> : null}
      <div className="adm-linha">
        <button className="btn adm-btn pri" disabled={!!erros.length} onClick={() => void salvar()} data-testid="salvar-pronuncia"><Icone nome="check" />Guardar a pronúncia</button>
        {msg ? <span className="adm-etq verde" role="status">{msg}</span> : null}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ bloqueio */

export function AvisoVerificador({ r, aoPronuncia }: { r: ResultadoVerificacao | null; aoPronuncia?: () => void }) {
  if (!r) return null;
  if (r.ok) return r.avisos.length ? <p className="adm-nota" data-testid="verificador-ok">Verificador: ok, com aviso ({[...new Set(r.avisos)].slice(0, 2).join('; ')}).</p> : <p className="adm-nota adm-bom" data-testid="verificador-ok"><Icone nome="check" /> Verificador: a criança já consegue ler isto aqui.</p>;
  const semPron = r.novos.filter((p) => p.semPronuncia && p.palavra);
  return (
    <div className="adm-bloqueio" role="alert" data-testid="bloqueio-decod">
      <p><Icone nome="escudo" /> <b>Bloqueado pelo verificador</b> (regra 2: nenhuma palavra com som que a criança ainda não aprendeu):</p>
      <ul>{r.novos.map((p) => <li key={p.tecnico}>{p.simples}</li>)}</ul>
      {semPron.map((p) => <AssistentePronuncia key={p.palavra} palavra={p.palavra!} aoSalvar={aoPronuncia} />)}
    </div>
  );
}

/* ------------------------------------------------------------------ campo editável */

type TipoCampo = 'texto' | 'numero' | 'lista' | 'cor' | 'booleano';
const paraTexto = (v: unknown, tipo: TipoCampo) => (tipo === 'lista' ? (Array.isArray(v) ? v.join(', ') : '') : v === undefined || v === null ? '' : String(v));
const doTexto = (t: string, tipo: TipoCampo): unknown => (tipo === 'numero' ? Number(t.replace(',', '.')) : tipo === 'lista' ? t.split(/[,;\n]+/).map((x) => x.trim()).filter(Boolean) : t);

/**
 * Um valor do conteúdo editável no lugar: confere AO VIVO (verificador) e só deixa guardar se passar.
 * Falas (`quem`): depois de guardar, mostra se o áudio ficou desatualizado (e deixa gravar/subir ali mesmo).
 */
export function CampoEditavel({ alvo, rotulo, tipo = 'texto', quem, multilinha, ajuda, testid }: {
  alvo: Alvo; rotulo: ReactNode; tipo?: TipoCampo; quem?: string; multilinha?: boolean; ajuda?: ReactNode; testid?: string;
}) {
  useVersaoEdicoes();
  const col = CONTEUDO_EDITAVEL.colecao(alvo.colecao);
  const atual = alvo.caminho.length ? lerCaminho(col?.obter(alvo.item), alvo.caminho) : col?.obter(alvo.item);
  const original = alvo.caminho.length ? lerCaminho(CONTEUDO_EDITAVEL.original(alvo.colecao, alvo.item), alvo.caminho) : CONTEUDO_EDITAVEL.original(alvo.colecao, alvo.item);
  const [rascunho, setRascunho] = useState(() => paraTexto(atual, tipo));
  const [salvo, setSalvo] = useState('');
  const [rodada, setRodada] = useState(0);
  const [emTodos, setEmTodos] = useState(false);
  const textoAtual = paraTexto(atual, tipo);
  useEffect(() => { setRascunho(textoAtual); }, [textoAtual]);
  const edicao = { colecao: alvo.colecao, item: alvo.item, tipo: 'definir' as const, caminho: alvo.caminho };
  const reg = edicoes.noLugar(edicao);
  const mudou = rascunho !== textoAtual;
  const valor = doTexto(rascunho, tipo);
  const invalido = tipo === 'numero' && (!Number.isFinite(valor as number) || rascunho.trim() === '');
  // verificador ao vivo (numa cópia: nada muda até guardar)
  const r = useMemo(() => (mudou && !invalido ? verificarEdicao(CONTEUDO_EDITAVEL, { ...edicao, valor, em: 0 }, edicoes.edicoes()) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rascunho, mudou, invalido, rodada, alvo.colecao, alvo.item, JSON.stringify(alvo.caminho)]);
  // a mesma fala em outros lugares (ex.: "Muito bem!" em várias fases): mudar só aqui ou em todos
  const outros = useMemo(() => (quem && mudou ? lugaresDaFala(textoAtual, quem).filter((t) => !mesmoLugar(t, alvo)) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [quem, mudou, textoAtual, rodada]);
  const salvar = async (v: unknown) => {
    const audios = quem ? { audios: trechosDaFala(String(v), quem).map((t) => t.id) } : {};
    const res = await salvarVerificando({ ...edicao, valor: v, ...audios });
    let extra = 0;
    if (res.ok && emTodos) for (const t of outros) if ((await salvarVerificando({ colecao: t.colecao, item: t.item, tipo: 'definir', caminho: t.caminho, valor: v, ...audios, nota: 'mesma fala, mudada em todos os lugares' })).ok) extra++;
    if (res.ok) setSalvo(extra ? `Guardado aqui e em mais ${extra} lugar(es).` : 'Guardado neste aparelho.');
    setRodada((x) => x + 1);
  };
  const id = `campo-${alvo.colecao}-${alvo.item}-${alvo.caminho.join('-')}`.replace(/[^a-zA-Z0-9-]/g, '_');
  const editado = !!reg || JSON.stringify(atual) !== JSON.stringify(original);
  return (
    <div className={`adm-campo-ed ${editado ? 'editado' : ''}`} data-testid={testid ?? 'campo-editavel'} data-caminho={`${alvo.colecao}|${alvo.item}|${alvo.caminho.join('/')}`}>
      <label htmlFor={id} className="adm-campo-rot">{rotulo}{quem ? <span className="adm-voz">{quem}</span> : null}{editado ? <span className="adm-etq ipe">editado</span> : null}</label>
      {tipo === 'booleano' ? (
        <label className="adm-check"><input id={id} type="checkbox" checked={atual === true} onChange={(e) => void salvar(e.target.checked)} data-testid="valor" /> ligado</label>
      ) : (
        <div className="adm-linha">
          {multilinha
            ? <textarea id={id} value={rascunho} rows={2} onChange={(e) => { setSalvo(''); setRascunho(e.target.value); }} data-testid="valor" />
            : <input id={id} type={tipo === 'cor' ? 'color' : tipo === 'numero' ? 'number' : 'text'} value={rascunho} onChange={(e) => { setSalvo(''); setRascunho(e.target.value); }} data-testid="valor" />}
          <button className="btn adm-btn pri" disabled={!mudou || invalido || (r !== null && !r.ok)} onClick={() => void salvar(valor)} data-testid="salvar-edicao"><Icone nome="check" />Guardar</button>
          {reg ? <button className="btn adm-btn" onClick={() => void edicoes.desfazer(reg.chave)} data-testid="desfazer-edicao" title="Volta ao valor anterior"><Icone nome="seta-esq" />Desfazer</button> : null}
          {reg ? <button className="btn adm-btn" onClick={() => void edicoes.voltarAoOriginal(reg.chave)} data-testid="original-edicao"><Icone nome="lixeira" />Voltar ao original</button> : null}
        </div>
      )}
      {outros.length ? (
        <div className="adm-linha" data-testid="fala-compartilhada">
          <span className="adm-nota">Esta mesma fala aparece em mais {outros.length} lugar(es) ({[...new Set(outros.map((t) => t.item))].slice(0, 4).join(', ')}{outros.length > 4 ? '…' : ''}):</span>
          <label className="adm-check"><input type="radio" checked={!emTodos} onChange={() => setEmTodos(false)} /> só aqui</label>
          <label className="adm-check"><input type="radio" checked={emTodos} onChange={() => setEmTodos(true)} data-testid="em-todos" /> em todos</label>
        </div>
      ) : null}
      {ajuda ? <p className="adm-nota">{ajuda}</p> : null}
      {editado && original !== undefined && tipo !== 'booleano' ? <p className="adm-nota">Original: <q>{paraTexto(original, tipo)}</q></p> : null}
      {salvo ? <span className="adm-etq verde" role="status">{salvo}</span> : null}
      {mudou ? <AvisoVerificador r={r} aoPronuncia={() => setRodada((x) => x + 1)} /> : null}
      {quem && editado && !mudou ? <AudioDaFala texto={textoAtual} quem={quem} /> : null}
    </div>
  );
}

/** Lista paginada simples. */
export function Paginas<T>({ itens, por = 30, render }: { itens: T[]; por?: number; render: (x: T, i: number) => ReactNode }) {
  const [p, setP] = useState(0);
  useEffect(() => { setP(0); }, [itens.length]);
  const total = Math.max(1, Math.ceil(itens.length / por));
  const fatia = itens.slice(p * por, p * por + por);
  return (
    <>
      {fatia.map((x, i) => render(x, p * por + i))}
      {total > 1 ? (
        <div className="adm-linha">
          <button className="btn adm-btn" disabled={p === 0} onClick={() => setP(p - 1)}><Icone nome="seta-esq" />Anteriores</button>
          <span className="adm-nota">Página {p + 1} de {total} ({itens.length})</span>
          <button className="btn adm-btn" disabled={p >= total - 1} onClick={() => setP(p + 1)}>Próximos<Icone nome="seta" /></button>
        </div>
      ) : null}
    </>
  );
}

export { chaveDaEdicao };
