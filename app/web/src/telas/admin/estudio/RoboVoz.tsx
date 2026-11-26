/**
 * Estúdio criativo › ROBÔ DE VOZ (fila do dono nº 33): "eu gravo o áudio e ele muda minha voz para vários cenários".
 * 1. Chave do ElevenLabs do dono (só neste aparelho, mascarada). 2. Vozes: a biblioteca dele e os 3 cenários.
 * 3. Gravar (ou subir) a própria voz, com a confirmação de que é a própria voz ou com autorização por escrito.
 * 4. Converter (UMA chamada por toque; gasta créditos). 5. Ouvir, comparar com o original, baixar ou salvar numa fala.
 * A conversão é feita pelo modelo do ElevenLabs; aqui não se mexe em tom nem velocidade (regra do projeto).
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { Icone } from '../../../componentes/ui.tsx';
import { navegar } from '../../../rotas.ts';
import { servicoAdmin } from '../../../servicos/admin-conta.ts';
import { gravar, temMicrofone, type Gravando } from '../../../servicos/audio-edicao.ts';
import { filtrarCatalogo, ROTULO_TIPO_AUDIO, type ItemCatalogo } from '../../../servicos/catalogo-audios.ts';
import {
  ELEVEN, ErroRoboVoz, MENSAGEM_ERRO, PRESETS, converterVoz, lerCreditos, listarVozes, mascararChave, podeReceberRobo, registroDoRobo, sugerirPresets,
  type IdPreset, type VozEleven
} from '../../../servicos/robo-voz.ts';
import { substituicoes } from '../../../servicos/substituicoes.ts';
import { baixar, carimbo, pararAudio, tocarUrl, useCatalogo } from '../dados-admin.ts';
import { usePrefGravacao } from '../AbaAudios.tsx';

interface Guardado { chave?: string; presets?: Partial<Record<IdPreset, string>>; modelo?: string; vozes?: VozEleven[] }
const GAVETA = 'robo-voz';
interface Resultado { id: string; url: string; blob: Blob; voz: VozEleven; cenario?: string; modelo: string; em: number }

export function RoboVoz() {
  const [g, setG] = useState<Guardado | null>(null);
  useEffect(() => { void servicoAdmin().ler<Guardado>(GAVETA).then((v) => setG(v ?? {})); }, []);
  const mudar = (n: Partial<Guardado>) => setG((a) => { const v = { ...(a ?? {}), ...n }; void servicoAdmin().gravar(GAVETA, v); return v; });
  if (!g) return <p className="adm-nota">Carregando…</p>;
  const chave = g.chave ?? '';
  return (
    <div className="est-robo" data-testid="robo-voz">
      <div className="est-robo-intro">
        <p><b>Como funciona:</b> você grava a sua fala (ou sobe um arquivo), escolhe a voz e o ElevenLabs devolve a <b>mesma fala, com a mesma emoção e o mesmo ritmo</b>, na outra voz. Quem troca a voz é o modelo de IA; o FONEMA não mexe no tom nem na velocidade.</p>
        <p className="adm-aviso" data-testid="aviso-crianca"><Icone nome="escudo" /> <b>Voz de criança:</b> o ElevenLabs não faz voz de criança de verdade, e o FONEMA não tenta contornar isso. A opção "Personagem infantil" é uma voz <b>de personagem de desenho feita por adulto</b>, como a Sofia e o Tales (decisão D011).</p>
      </div>
      <PassoChave chave={chave} salvar={(c) => mudar({ chave: c, vozes: c ? g.vozes : undefined })} />
      <PassoVozes chave={chave} g={g} mudar={mudar} />
      <PassoGravarConverter chave={chave} g={g} mudar={mudar} />
    </div>
  );
}

/* ------------------------------------------------------------------ 1. chave */
function PassoChave({ chave, salvar }: { chave: string; salvar: (c: string) => void }) {
  const [texto, setTexto] = useState('');
  const [creditos, setCreditos] = useState<string>('');
  const [editando, setEditando] = useState(!chave);
  useEffect(() => {
    if (!chave) { setCreditos(''); return; }
    let vivo = true;
    void lerCreditos(chave).then((c) => { if (vivo) setCreditos(c ? `Créditos usados no mês: ${c.usados.toLocaleString('pt-BR')} de ${c.limite.toLocaleString('pt-BR')} caracteres.` : ''); });
    return () => { vivo = false; };
  }, [chave]);
  return (
    <fieldset className="adm-grupo est-passo" data-testid="passo-chave">
      <legend><span className="est-num">1</span> Sua chave do ElevenLabs</legend>
      <p className="adm-nota">Pegue em <b>elevenlabs.io</b> › seu perfil (canto de baixo) › <b>API Keys</b> › "Create API key" (marque Speech to Speech e Voices). A chave fica guardada <b>só neste aparelho</b>, não vai no pacote do Publicar nem no código. <b>Cada conversão gasta créditos da sua conta</b> no ElevenLabs (mais ou menos o tamanho do áudio).</p>
      {chave && !editando ? (
        <div className="adm-linha">
          <span className="adm-etq verde" data-testid="chave-mascarada">Chave guardada: {mascararChave(chave)}</span>
          <button className="btn adm-btn" onClick={() => setEditando(true)}>Trocar a chave</button>
          <button className="btn adm-btn terra" onClick={() => { salvar(''); setTexto(''); setEditando(true); }} data-testid="apagar-chave"><Icone nome="lixeira" />Apagar a chave deste aparelho</button>
          {creditos ? <span className="adm-nota" data-testid="creditos">{creditos}</span> : null}
        </div>
      ) : (
        <form className="adm-linha" onSubmit={(e) => { e.preventDefault(); if (texto.trim()) { salvar(texto.trim()); setTexto(''); setEditando(false); } }}>
          <label className="adm-campo largo">Chave (API key) <input type="password" value={texto} onChange={(e) => setTexto(e.target.value)} autoComplete="off" spellCheck={false} placeholder="sk_…" data-testid="campo-chave" /></label>
          <button className="btn adm-btn pri" type="submit" disabled={!texto.trim()} data-testid="guardar-chave"><Icone nome="check" />Guardar neste aparelho</button>
          {chave ? <button className="btn adm-btn" type="button" onClick={() => setEditando(false)}>Cancelar</button> : null}
        </form>
      )}
    </fieldset>
  );
}

/* ------------------------------------------------------------------ 2. vozes e cenários */
function PassoVozes({ chave, g, mudar }: { chave: string; g: Guardado; mudar: (n: Partial<Guardado>) => void }) {
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');
  const vozes = g.vozes ?? [];
  const carregar = async () => {
    setErro(''); setCarregando(true);
    try {
      const v = await listarVozes(chave);
      mudar({ vozes: v, presets: sugerirPresets(v, g.presets) });
    } catch (e) { setErro(e instanceof ErroRoboVoz ? e.message : MENSAGEM_ERRO.outro); } finally { setCarregando(false); }
  };
  return (
    <fieldset className="adm-grupo est-passo" data-testid="passo-vozes">
      <legend><span className="est-num">2</span> Vozes e cenários</legend>
      <div className="adm-linha">
        <button className="btn adm-btn pri" disabled={!chave || carregando} onClick={() => void carregar()} data-testid="carregar-vozes"><Icone nome="repetir" />{carregando ? 'Buscando…' : vozes.length ? 'Atualizar minhas vozes' : 'Buscar minhas vozes'}</button>
        {vozes.length ? <span className="adm-nota" data-testid="total-vozes">{vozes.length} vozes na sua biblioteca do ElevenLabs.</span> : <span className="adm-nota">{chave ? 'Busque as vozes da sua conta (não gasta créditos).' : 'Guarde a chave primeiro.'}</span>}
      </div>
      {erro ? <p className="adm-erro" role="alert" data-testid="erro-vozes">{erro}</p> : null}
      {vozes.length ? (
        <div className="est-cenarios">
          {PRESETS.map((p) => (
            <label key={p.id} className="est-cenario" data-cenario={p.id}>
              <b>{p.nome}</b>
              <small>{p.explica}</small>
              <select value={g.presets?.[p.id] ?? ''} onChange={(e) => mudar({ presets: { ...g.presets, [p.id]: e.target.value || undefined } })} data-testid={`preset-${p.id}`}>
                <option value="">— escolha uma voz —</option>
                {vozes.map((v) => <option key={v.id} value={v.id}>{v.nome}{v.categoria ? ` (${v.categoria})` : ''}</option>)}
              </select>
            </label>
          ))}
        </div>
      ) : null}
      {vozes.length ? <p className="adm-nota">Não achou a voz certa? Crie no ElevenLabs (Voice Design: descreva "voz de personagem de desenho, adulta, alegre") e toque em "Atualizar minhas vozes".</p> : null}
    </fieldset>
  );
}

/* ------------------------------------------------------------------ 3–5. gravar, converter, usar */
function PassoGravarConverter({ chave, g, mudar }: { chave: string; g: Guardado; mudar: (n: Partial<Guardado>) => void }) {
  const [pref, mudarPref] = usePrefGravacao();
  const [consentimento, setConsentimento] = useState(false);
  const [original, setOriginal] = useState<{ blob: Blob; url: string; nome: string } | null>(null);
  const [gravando, setGravando] = useState(false);
  const [nivel, setNivel] = useState(0);
  const rec = useRef<Gravando | null>(null);
  const [destino, setDestino] = useState<string>('');
  const [tirarRuido, setTirarRuido] = useState(false);
  const [convertendo, setConvertendo] = useState(false);
  const [erro, setErro] = useState('');
  const [resultados, setResultados] = useState<Resultado[]>([]);
  const vozes = useMemo(() => g.vozes ?? [], [g.vozes]);
  const mic = temMicrofone();
  useEffect(() => () => { rec.current?.cancelar(); pararAudio(); }, []);
  // destino padrão: o primeiro cenário configurado
  useEffect(() => {
    if (destino && vozes.some((v) => v.id === destino)) return;
    const p = PRESETS.map((x) => g.presets?.[x.id]).find(Boolean);
    if (p) setDestino(p);
  }, [g.presets, vozes, destino]);

  const usarAudio = (blob: Blob, nome: string) => setOriginal((a) => { if (a) URL.revokeObjectURL(a.url); return { blob, url: URL.createObjectURL(blob), nome }; });
  const comecar = async () => {
    setErro('');
    try { rec.current = await gravar(setNivel, () => void parar(), 30000); setGravando(true); } catch { setErro('O microfone não foi liberado. Permita o microfone no navegador e tente de novo.'); }
  };
  const parar = async () => {
    const r = rec.current; rec.current = null; setGravando(false);
    if (r) usarAudio(await r.parar(), 'minha-voz.wav');
  };
  const arquivo = (f?: File) => {
    if (!f) return;
    if (!/^audio\//.test(f.type) && !/\.(mp3|wav|ogg|m4a|webm|flac)$/i.test(f.name)) { setErro('Escolha um arquivo de áudio (mp3, wav, m4a…).'); return; }
    if (f.size > 20_000_000) { setErro('Arquivo grande demais (máximo 20 MB).'); return; }
    setErro(''); usarAudio(f, f.name);
  };
  const vozDestino = vozes.find((v) => v.id === destino);
  const cenarioDe = (id: string) => PRESETS.find((p) => g.presets?.[p.id] === id)?.nome;
  const falta = !chave ? 'Guarde a chave (passo 1).' : !vozes.length ? 'Busque as suas vozes (passo 2).' : !original ? 'Grave ou suba a sua fala.' : !consentimento ? 'Confirme que a voz é sua ou que tem autorização.' : !vozDestino ? 'Escolha a voz de destino.' : '';
  const converter = async () => {
    if (falta || convertendo || !original || !vozDestino) return;
    setErro(''); setConvertendo(true);
    const modelo = g.modelo ?? ELEVEN.modeloPadrao;
    try {
      const blob = await converterVoz({ chave, vozId: vozDestino.id, audio: original.blob, nomeArquivo: original.nome, modelo, tirarRuido });
      const r: Resultado = { id: `${Date.now()}`, url: URL.createObjectURL(blob), blob, voz: vozDestino, cenario: cenarioDe(vozDestino.id), modelo, em: Date.now() };
      setResultados((x) => [r, ...x]);
    } catch (e) { setErro(e instanceof ErroRoboVoz ? e.message : MENSAGEM_ERRO.outro); } finally { setConvertendo(false); }
  };
  const comparar = async (r: Resultado) => { if (!original) return; await tocarUrl(original.url); await new Promise((ok) => setTimeout(ok, 350)); await tocarUrl(r.url); };

  return (
    <>
      <fieldset className="adm-grupo est-passo" data-testid="passo-gravar">
        <legend><span className="est-num">3</span> Grave a sua fala</legend>
        <label className="adm-check est-consent"><input type="checkbox" checked={consentimento} onChange={(e) => setConsentimento(e.target.checked)} data-testid="consentimento" /> <span>A voz gravada é <b>minha</b>, ou a pessoa gravada me deu <b>autorização por escrito</b> (e o responsável, se for criança). Não vou usar voz de ninguém sem permissão.</span></label>
        <div className="adm-linha">
          <label className="adm-campo">Quem está gravando <input value={pref.quem} onChange={(e) => mudarPref({ quem: e.target.value })} placeholder="ex.: o dono" data-testid="robo-quem" /></label>
        </div>
        {gravando ? (
          <div className="adm-linha" aria-live="polite">
            <span className="adm-gravando"><i style={{ transform: `scaleX(${0.08 + nivel * 0.92})` }} /></span>
            <b>Gravando… (até 30 s)</b>
            <button className="btn adm-btn terra" onClick={() => void parar()} data-testid="robo-parar"><Icone nome="x" />Parar</button>
          </div>
        ) : (
          <div className="adm-linha">
            <button className="btn adm-btn ipe" disabled={!mic} onClick={() => void comecar()} data-testid="robo-gravar"><Icone nome="gravar" />{original ? 'Gravar de novo' : 'Gravar agora'}</button>
            <label className="btn adm-btn"><Icone nome="baixar" />Subir um arquivo
              <input type="file" accept="audio/*,.mp3,.wav,.m4a,.ogg,.webm" className="sr" onChange={(e) => { arquivo(e.target.files?.[0]); e.target.value = ''; }} data-testid="robo-arquivo" />
            </label>
            {original ? <button className="btn adm-btn" onClick={() => void tocarUrl(original.url)} data-testid="robo-ouvir-original"><Icone nome="tocar" />Ouvir a minha fala</button> : null}
            {original ? <span className="adm-etq" data-testid="robo-original">{original.nome}</span> : null}
          </div>
        )}
        <p className="adm-nota">Fale com naturalidade, perto do microfone, num lugar quieto. A IA copia o seu jeito de falar (emoção, pausas, ritmo) e troca só o timbre.</p>
      </fieldset>

      <fieldset className="adm-grupo est-passo" data-testid="passo-converter">
        <legend><span className="est-num">4</span> Transformar</legend>
        {vozes.length ? (
          <div className="est-destinos" role="radiogroup" aria-label="Voz de destino">
            {PRESETS.map((p) => {
              const id = g.presets?.[p.id];
              const v = vozes.find((x) => x.id === id);
              return (
                <button key={p.id} role="radio" aria-checked={!!id && destino === id} disabled={!v} className="est-destino" onClick={() => id && setDestino(id)} data-testid={`destino-${p.id}`}>
                  <b>{p.nome}</b><small>{v ? v.nome : 'escolha a voz no passo 2'}</small>
                </button>
              );
            })}
            <label className="adm-campo">Ou outra voz da biblioteca
              <select value={destino} onChange={(e) => setDestino(e.target.value)} data-testid="destino-outra">
                <option value="">—</option>
                {vozes.map((v) => <option key={v.id} value={v.id}>{v.nome}</option>)}
              </select>
            </label>
          </div>
        ) : null}
        <div className="adm-linha">
          <label className="adm-campo">Modelo
            <select value={g.modelo ?? ELEVEN.modeloPadrao} onChange={(e) => mudar({ modelo: e.target.value })} data-testid="robo-modelo">
              {ELEVEN.modelos.map((m) => <option key={m.id} value={m.id}>{m.nome}</option>)}
            </select>
          </label>
          <label className="adm-check"><input type="checkbox" checked={tirarRuido} onChange={(e) => setTirarRuido(e.target.checked)} /> Tirar o barulho de fundo</label>
        </div>
        <div className="adm-linha">
          <button className="btn adm-btn verde est-converter" disabled={!!falta || convertendo} onClick={() => void converter()} data-testid="robo-converter"><Icone nome="raio" />{convertendo ? 'Transformando… (gastando créditos)' : `Transformar${vozDestino ? ` em "${vozDestino.nome}"` : ''}`}</button>
          {falta ? <span className="adm-nota" data-testid="robo-falta">{falta}</span> : <span className="adm-nota">Cada toque é uma conversão e gasta créditos. Nada é repetido sozinho.</span>}
        </div>
        {erro ? <p className="adm-erro" role="alert" data-testid="robo-erro">{erro}</p> : null}
      </fieldset>

      <fieldset className="adm-grupo est-passo" data-testid="passo-resultados">
        <legend><span className="est-num">5</span> Ouvir, comparar e usar</legend>
        {!resultados.length ? <p className="adm-nota">Os áudios transformados aparecem aqui (ficam só até sair desta tela: baixe ou salve numa fala).</p> : (
          <ul className="est-resultados">
            {resultados.map((r) => <LinhaResultado key={r.id} r={r} comparar={() => void comparar(r)} quem={pref.quem} autorizacao={consentimento} />)}
          </ul>
        )}
      </fieldset>
      <p className="adm-nota">Tudo o que você salvar numa fala entra no pacote do <button className="adm-link" onClick={() => navegar('admin/publicar')}>Publicar</button> marcado como <b>voz sintética (robô)</b>, com a voz e o modelo usados — nunca como voz humana.</p>
    </>
  );
}

function LinhaResultado({ r, comparar, quem, autorizacao }: { r: Resultado; comparar: () => void; quem: string; autorizacao: boolean }) {
  const [salvar, setSalvar] = useState(false);
  return (
    <li className="est-resultado" data-testid="robo-resultado">
      <div className="adm-linha">
        <span className="adm-etq ipe">{r.cenario ?? 'Voz da biblioteca'}</span>
        <b>{r.voz.nome}</b>
        <span className="adm-nota">{new Date(r.em).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
      </div>
      <div className="adm-linha">
        <button className="btn adm-btn" onClick={() => void tocarUrl(r.url)} data-testid="robo-ouvir"><Icone nome="tocar" />Ouvir</button>
        <button className="btn adm-btn" onClick={comparar} data-testid="robo-comparar"><Icone nome="repetir" />Comparar (minha voz → transformada)</button>
        <button className="btn adm-btn" onClick={() => baixar(r.blob, `fonema-robo-voz-${r.voz.nome.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-${carimbo()}.mp3`)} data-testid="robo-baixar"><Icone nome="baixar" />Baixar</button>
        <button className="btn adm-btn pri" onClick={() => setSalvar(!salvar)} aria-expanded={salvar} data-testid="robo-salvar-fala"><Icone nome="microfone" />Salvar numa fala</button>
      </div>
      {salvar ? <SalvarNaFala r={r} quem={quem} autorizacao={autorizacao} fechar={() => setSalvar(false)} /> : null}
    </li>
  );
}

/** Escolhe a fala/palavra/nome onde o áudio entra (sons puros das letras não: regra 1). */
function SalvarNaFala({ r, quem, autorizacao, fechar }: { r: Resultado; quem: string; autorizacao: boolean; fechar: () => void }) {
  const catalogo = useCatalogo();
  const [busca, setBusca] = useState('');
  const [msg, setMsg] = useState('');
  const lista = useMemo(() => (catalogo && busca.trim().length >= 2 ? filtrarCatalogo(catalogo, { busca }).filter(podeReceberRobo).slice(0, 12) : []), [catalogo, busca]);
  const usar = async (it: ItemCatalogo) => {
    await substituicoes.salvar(registroDoRobo({ id: it.id, blob: r.blob, texto: it.texto, quem, autorizacao, voz: r.voz.nome, modelo: r.modelo }));
    setMsg(`Salvo no lugar de "${it.texto}" (neste aparelho). Ouça na aba Vozes; para todos, gere o pacote em Publicar.`);
  };
  return (
    <div className="adm-editor" data-testid="robo-escolher-fala">
      <label className="adm-campo largo">Procure a fala, palavra ou nome <input type="search" value={busca} onChange={(e) => { setMsg(''); setBusca(e.target.value); }} placeholder="ex.: Muito bem" data-testid="robo-busca-fala" /></label>
      {msg ? <p className="adm-etq verde" role="status" data-testid="robo-salvo">{msg}</p> : null}
      <ul className="adm-lista est-falas">
        {lista.map((it) => (
          <li key={it.id}><button className="est-fala" onClick={() => void usar(it)} data-testid="robo-usar-fala"><span className="adm-tipo">{ROTULO_TIPO_AUDIO[it.tipo]}</span>{it.voz ? <span className="adm-voz">{it.personagem === 'bolota' ? 'Bolota' : it.voz === 'sofia' ? 'Sofia' : 'Tales'}</span> : null}<span>{it.texto}</span></button></li>
        ))}
      </ul>
      {busca.trim().length >= 2 && !lista.length ? <p className="adm-nota">Nada encontrado (os sons puros das letras não entram: esses só com voz humana gravada).</p> : null}
      <button className="btn adm-btn" onClick={fechar}>Fechar</button>
    </div>
  );
}
