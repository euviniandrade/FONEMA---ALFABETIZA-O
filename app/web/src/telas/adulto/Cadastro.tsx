import { useEffect, useMemo, useState } from 'react';
import { opcoesPronuncia, renderFala, type Crianca, type OpcaoPronuncia } from '@fonema/motor';
import type { Genero } from '@fonema/conteudo';
import { useApp } from '../../contexto.tsx';
import { navegar } from '../../rotas.ts';
import { Topo } from '../../componentes/basicos.tsx';
import { novoId } from '../../dados/repositorio.ts';
import { gravar, temGravacao } from '../../servicos/microfone.ts';
import { voz } from '../../servicos/voz.ts';
import { BASES } from '../crianca/Avatar.tsx';

const ANO = new Date().getFullYear();
type Passo = 'quem' | 'nome' | 'apoios' | 'entrega';

/**
 * Cadastro pelo adulto (D002, D013; jogo-completo/01 §1): primeiro nome, gênero (3 opções), idade,
 * consentimentos em linguagem simples, gravação do nome e escolha da pronúncia, apoios e rotina.
 */
export function Cadastro() {
  const { repo } = useApp();
  const [passo, setPasso] = useState<Passo>('quem');
  const [nome, setNome] = useState('');
  const [genero, setGenero] = useState<Genero | null>(null);
  const [ano, setAno] = useState(ANO - 5);
  const [cons, setCons] = useState({ responsavel: false, vozPrimeiroNome: true, gravarVozAdulto: false });
  const [gravacao, setGravacao] = useState<Blob | null>(null);
  const [gravando, setGravando] = useState(false);
  const [nivelMic, setNivelMic] = useState(0);
  const [ajuste, setAjuste] = useState('');
  const [escolha, setEscolha] = useState<{ op: OpcaoPronuncia; voz: 'sofia' | 'tales' } | null>(null);
  const [jaSabe, setJaSabe] = useState({ letrasDoNome: 'nao-sei', lePalavras: 'nao-sei', leFrases: 'nao-sei' });
  const [apoios, setApoios] = useState({ previsivel: false, focoCurto: false, leituraReforco: false, calmo: false });
  const [rotina, setRotina] = useState({ minutosDia: 15, horaDormir: '20:00' });
  const [id] = useState(() => novoId('cr'));

  const primeiro = nome.trim().split(/\s+/)[0] ?? '';
  const nomeOk = primeiro.length >= 2 && /^[\p{L}'-]+$/u.test(primeiro);
  const opcoes = useMemo(() => {
    if (!nomeOk) return [];
    const base = opcoesPronuncia(primeiro[0].toUpperCase() + primeiro.slice(1).toLowerCase());
    if (ajuste.trim()) {
      const extra = opcoesPronuncia(primeiro).map((o) => o);
      extra[0] = { ...extra[0], id: 9, titulo: 'Como você ajustou', grafia: ajuste.trim(), fala: ajuste.replace(/-/g, '').toLowerCase().replace(/^./, (c) => c.toUpperCase()) };
      return [extra[0], ...base.slice(0, 2)];
    }
    return base;
  }, [primeiro, nomeOk, ajuste]);
  const nomeBonito = primeiro ? primeiro[0].toUpperCase() + primeiro.slice(1) : '';
  const previa = genero ? renderFala('{Você está pronto|Você está pronta|Tudo pronto pra começar}, [NOME]?', { nome: nomeBonito || 'Mariana', genero }) : '';

  useEffect(() => { setEscolha(null); }, [primeiro, ajuste]);

  const ouvir = (op: OpcaoPronuncia, quem: 'sofia' | 'tales') => voz.falar(`Oi, ${op.fala}!`, { quem, rate: op.rate, pitchExtra: op.pitchExtra });

  const salvar = async () => {
    const op = escolha?.op ?? opcoes[0];
    const c: Crianca = {
      id,
      nome: nomeBonito,
      genero: genero ?? 'n',
      anoNascimento: ano,
      pronuncia: { grafia: op.grafia, fala: op.fala, rate: op.rate, pitchExtra: op.pitchExtra, voz: escolha?.voz ?? 'sofia' },
      avatar: { base: BASES[0][0], cantinho: 'ceu' },
      apoios,
      jaSabe,
      consentimentos: { ...cons, em: Date.now() },
      rotina,
      criadoEm: Date.now()
    };
    if (gravacao && cons.gravarVozAdulto) {
      await repo.salvarAudio(`nome-${id}`, gravacao, Date.now());
      c.gravacaoNomeId = `nome-${id}`;
      c.gravacaoNomeEm = Date.now();
    }
    await repo.salvarCrianca(c);
    setPasso('entrega');
  };

  return (
    <div className="tela-adulto">
      <Topo voltar="adulto" titulo="Área do adulto · cadastro" />
      <main className="palco adulto">
        <ol className="passos-adulto">
          {(['quem', 'nome', 'apoios', 'entrega'] as Passo[]).map((p, i) => <li key={p} className={p === passo ? 'agora' : ''}>{i + 1}. {{ quem: 'Quem vai aprender', nome: 'Nome falado', apoios: 'Apoios e rotina', entrega: 'Entrega' }[p]}</li>)}
        </ol>

        {passo === 'quem' ? (
          <section className="cartao form-adulto">
            <h1 className="t">Quem vai aprender?</h1>
            <label className="campo">
              <span>Primeiro nome (ou o nome pelo qual a família chama a criança)</span>
              <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex.: Mariana" autoComplete="off" data-testid="campo-nome" />
              {nome.trim().includes(' ') ? <small>Usamos só o primeiro nome: <b>{nomeBonito}</b>. Sobrenome não é necessário.</small> : null}
            </label>
            <fieldset className="campo">
              <legend>Gênero (só para a Sofia e o Tales falarem certinho: "pronto" ou "pronta")</legend>
              <div className="linha-botoes">
                {([['m', 'Masculino'], ['f', 'Feminino'], ['n', 'Prefiro não informar']] as [Genero, string][]).map(([g, r]) => (
                  <button key={g} className={`btn ${genero === g ? 'pri' : ''}`} aria-pressed={genero === g} onClick={() => setGenero(g)} data-genero={g}>{r}</button>
                ))}
              </div>
              {previa ? <p className="previa">A Sofia vai dizer: <b>"{previa}"</b> <button className="ouvir-mini" onClick={() => voz.falar(previa, { quem: 'sofia' })} aria-label="Ouvir">🔊</button></p> : null}
            </fieldset>
            <label className="campo">
              <span>Ano de nascimento (define o tempo de cada sessão)</span>
              <select value={ano} onChange={(e) => setAno(Number(e.target.value))}>
                {Array.from({ length: 8 }, (_, i) => ANO - 2 - i).map((a) => <option key={a} value={a}>{a} ({ANO - a} anos)</option>)}
              </select>
              {ANO - ano <= 3 ? <small>Para 2–3 anos, o módulo Maternal "Primeiros Sons" virá depois do piloto. A jornada a partir de R0 funciona com o adulto junto.</small> : null}
            </label>
            <fieldset className="campo consentimentos">
              <legend>Autorizações (LGPD, art. 14) — em linguagem simples</legend>
              <label><input type="checkbox" checked={cons.responsavel} onChange={(e) => setCons({ ...cons, responsavel: e.target.checked })} data-testid="cons-responsavel" /> Sou responsável por esta criança e autorizo o uso da plataforma.</label>
              <label><input type="checkbox" checked={cons.vozPrimeiroNome} onChange={(e) => setCons({ ...cons, vozPrimeiroNome: e.target.checked })} /> A Sofia e o Tales podem falar o primeiro nome (no produto, só o primeiro nome vai ao serviço de voz; aqui a voz é feita no próprio aparelho).</label>
              <label><input type="checkbox" checked={cons.gravarVozAdulto} onChange={(e) => setCons({ ...cons, gravarVozAdulto: e.target.checked })} /> (Opcional) Guardar a minha gravação do nome por até 30 dias, para comparar a pronúncia.</label>
            </fieldset>
            <div className="nao-pedimos"><b>Não pedimos:</b> foto, CPF, endereço, sobrenome, e-mail da criança. Nenhum áudio da criança é enviado.</div>
            <button className="btn grande pri" disabled={!nomeOk || !genero || !cons.responsavel} onClick={() => setPasso('nome')} data-testid="cadastro-continuar">Continuar →</button>
          </section>
        ) : null}

        {passo === 'nome' ? (
          <section className="cartao form-adulto">
            <h1 className="t">Como se fala o nome {nomeBonito}?</h1>
            <div className="campo">
              <span>1. Grave o nome do jeito que vocês falam em casa (3 s). Fica só neste aparelho.</span>
              <div className="linha-botoes">
                {temGravacao() ? (
                  <button className="btn" disabled={gravando} onClick={async () => { setGravando(true); try { setGravacao(await gravar(3000, setNivelMic)); } catch { /* sem microfone */ } setGravando(false); }}>
                    {gravando ? '● Gravando…' : gravacao ? '↺ Regravar' : '🎙️ Gravar'}
                  </button>
                ) : <small>Este navegador não permite gravar; tudo bem, escolha pela escuta.</small>}
                {gravacao ? <button className="btn" onClick={() => new Audio(URL.createObjectURL(gravacao)).play()}>▶ Ouvir gravação</button> : null}
                {gravando ? <div className="medidor"><i style={{ width: `${nivelMic * 100}%` }} /></div> : null}
              </div>
            </div>
            <div className="campo">
              <span>2. Ouça e escolha a pronúncia que soa igual (Sofia ou Tales):</span>
              <div className="grade-pronuncia">
                {opcoes.map((op) => (
                  <div key={op.id + op.grafia} className={`pronuncia ${escolha?.op.grafia === op.grafia ? 'sel' : ''}`}>
                    <b>{op.grafia}</b><small>{op.titulo}</small>
                    <div className="linha-botoes">
                      {(['sofia', 'tales'] as const).map((q) => (
                        <button key={q} className={`btn mini ${escolha?.op.grafia === op.grafia && escolha.voz === q ? 'pri' : ''}`} onClick={() => { setEscolha({ op, voz: q }); ouvir(op, q); }} data-pronuncia={`${op.id}-${q}`}>
                          🔊 {q === 'sofia' ? 'Sofia' : 'Tales'}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <label className="campo">
              <span>Nenhuma serviu? Ajuste como se fala (sílaba forte em MAIÚSCULAS, ex.: Ka-u-Ã):</span>
              <input value={ajuste} onChange={(e) => setAjuste(e.target.value)} placeholder="Ex.: Ma-ri-A-na" />
            </label>
            <p className="nota-mic">Simulação: a voz do navegador lê as variações. No produto, as 3 versões são geradas uma vez nas vozes oficiais "Sofia — FONEMA" e "Tales — FONEMA" (só o primeiro nome é enviado).</p>
            <div className="linha-botoes">
              <button className="btn" onClick={() => setPasso('quem')}>← Voltar</button>
              <button className="btn grande pri" onClick={() => setPasso('apoios')} data-testid="nome-continuar">Continuar →</button>
            </div>
          </section>
        ) : null}

        {passo === 'apoios' ? (
          <section className="cartao form-adulto">
            <h1 className="t">O que {nomeBonito} já sabe? E de que apoio precisa?</h1>
            <p>Isso só ajuda a Sofia e o Tales a escolher o ritmo. <b>A jornada começa do começo para todo mundo.</b> "Não sei" é sempre uma boa resposta.</p>
            {([['letrasDoNome', 'Reconhece as letras do próprio nome?'], ['lePalavras', 'Lê alguma palavra sozinha?'], ['leFrases', 'Lê frases ou livrinhos?']] as const).map(([k, q]) => (
              <fieldset key={k} className="campo"><legend>{q}</legend>
                <div className="linha-botoes">{[['sim', 'Sim'], ['nao', 'Ainda não'], ['nao-sei', 'Não sei']].map(([v, r]) => <button key={v} className={`btn mini ${jaSabe[k] === v ? 'pri' : ''}`} onClick={() => setJaSabe({ ...jaSabe, [k]: v })}>{r}</button>)}</div>
              </fieldset>
            ))}
            <fieldset className="campo apoios"><legend>Apoios (sem rótulo para a criança; dá para mudar depois)</legend>
              {([['previsivel', 'Modo Previsível (trilha fixa, avisos antes das mudanças)'], ['focoCurto', 'Foco curto (blocos menores)'], ['leituraReforco', 'Leitura com reforço (passos menores)'], ['calmo', 'Modo calmo (sem música e partículas)']] as const).map(([k, r]) => (
                <label key={k}><input type="checkbox" checked={apoios[k]} onChange={(e) => setApoios({ ...apoios, [k]: e.target.checked })} /> {r}</label>
              ))}
            </fieldset>
            <div className="campo linha-campos">
              <label><span>Tempo por dia</span><select value={rotina.minutosDia} onChange={(e) => setRotina({ ...rotina, minutosDia: Number(e.target.value) })}>{[10, 12, 15, 20].map((m) => <option key={m} value={m}>{m} min</option>)}</select></label>
              <label><span>Hora de dormir (sessões param 1 h antes)</span><input type="time" value={rotina.horaDormir} onChange={(e) => setRotina({ ...rotina, horaDormir: e.target.value })} /></label>
            </div>
            <div className="linha-botoes">
              <button className="btn" onClick={() => setPasso('nome')}>← Voltar</button>
              <button className="btn grande pri" onClick={salvar} data-testid="salvar-crianca">Salvar →</button>
            </div>
          </section>
        ) : null}

        {passo === 'entrega' ? (
          <section className="cartao form-adulto entrega">
            <h1 className="t">Agora entregue o aparelho para {nomeBonito}.</h1>
            <p>Fique por perto nos primeiros 10 minutos: é um momento especial. Daqui em diante, todo texto tem áudio.</p>
            <button className="btn grande ipe" onClick={() => navegar(`c/${id}/avatar`)} data-testid="entregar">Entregar para {nomeBonito} →</button>
          </section>
        ) : null}
      </main>
    </div>
  );
}
