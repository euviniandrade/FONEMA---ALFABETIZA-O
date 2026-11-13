import { useEffect, useMemo, useState } from 'react';
import { NIVEIS_INICIAIS, aplicarNivelInicial, opcoesPronuncia, progressoInicial, renderFala, type Crianca, type NivelInicial, type OpcaoPronuncia } from '@fonema/motor';
import type { Genero } from '@fonema/conteudo';
import { useApp } from '../../contexto.tsx';
import { navegar } from '../../rotas.ts';
import { Rosto, Topo } from '../../componentes/basicos.tsx';
import { Fundo, Icone } from '../../componentes/ui.tsx';
import { asset } from '../../servicos/ambiente.ts';
import { novoId } from '../../dados/repositorio.ts';
import { gravar, temGravacao } from '../../servicos/microfone.ts';
import { voz } from '../../servicos/voz.ts';
import { BASES } from '../crianca/Avatar.tsx';

const ANO = new Date().getFullYear();
type Passo = 'nome' | 'falar' | 'genero' | 'nivel' | 'autorizacao' | 'entrega';
const PASSOS: [Passo, string][] = [['nome', 'Nome'], ['falar', 'Como falar'], ['genero', 'Gênero'], ['nivel', 'De onde começa'], ['autorizacao', 'Autorização']];

/**
 * Cadastro pelo adulto em passos ilustrados (D002, D013, D026): 1 nome · 2 como falar o nome · 3 gênero para as falas ·
 * 4 de onde a criança começa · 5 autorização (LGPD em linguagem simples, com apoios e rotina opcionais).
 */
export function Cadastro() {
  const { repo } = useApp();
  const [passo, setPasso] = useState<Passo>('nome');
  const [nome, setNome] = useState('');
  const [genero, setGenero] = useState<Genero | null>(null);
  const [ano, setAno] = useState(ANO - 5);
  const [nivel, setNivel] = useState<NivelInicial>('zero');
  const [cons, setCons] = useState({ responsavel: false, vozPrimeiroNome: true, gravarVozAdulto: false });
  const [gravacao, setGravacao] = useState<Blob | null>(null);
  const [gravando, setGravando] = useState(false);
  const [nivelMic, setNivelMic] = useState(0);
  const [ajuste, setAjuste] = useState('');
  const [escolha, setEscolha] = useState<{ op: OpcaoPronuncia; voz: 'sofia' | 'tales' } | null>(null);
  const [jaSabe] = useState({ letrasDoNome: 'nao-sei', lePalavras: 'nao-sei', leFrases: 'nao-sei' });
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

  const ouvir = (op: OpcaoPronuncia, quem: 'sofia' | 'tales') => voz.simularPronuncia(`Oi, ${op.fala}!`, { quem, rate: op.rate, pitchExtra: op.pitchExtra });

  const salvar = async () => {
    const op = escolha?.op ?? opcoes[0];
    const agora = Date.now();
    const c: Crianca = {
      id,
      nome: nomeBonito,
      genero: genero ?? 'n',
      anoNascimento: ano,
      pronuncia: { grafia: op.grafia, fala: op.fala, rate: op.rate, pitchExtra: op.pitchExtra, voz: escolha?.voz ?? 'sofia' },
      avatar: { base: BASES[0][0], cantinho: 'ceu' },
      apoios,
      jaSabe: { ...jaSabe, letrasDoNome: nivel === 'zero' ? 'nao-sei' : 'sim', lePalavras: nivel === 'le-palavras' ? 'sim' : 'nao-sei' },
      consentimentos: { ...cons, em: agora },
      rotina,
      criadoEm: agora
    };
    if (gravacao && cons.gravarVozAdulto) {
      await repo.salvarAudio(`nome-${id}`, gravacao, agora);
      c.gravacaoNomeId = `nome-${id}`;
      c.gravacaoNomeEm = agora;
    }
    await repo.salvarCrianca(c);
    // D026: o nível inicial escolhido pelo adulto define o ponto de partida (do zero é o padrão)
    await repo.salvarProgresso(aplicarNivelInicial(progressoInicial(id, agora), nivel, agora));
    setPasso('entrega');
  };

  const idx = PASSOS.findIndex(([p]) => p === passo);
  const falaDupla: Record<Passo, [string, string]> = {
    nome: ['Sofia', 'Que bom que vocês chegaram! Como a criança se chama?'],
    falar: ['Tales', `Queremos chamar ${nomeBonito || 'a criança'} do jeitinho certo. Ouça e escolha!`],
    genero: ['Sofia', 'É só para a gente falar certinho: "pronto" ou "pronta".'],
    nivel: ['Tales', 'A gente ensina desde o comecinho. Na dúvida, escolha "Do zero".'],
    autorizacao: ['Sofia', 'Falta só a sua autorização. Tudo fica neste aparelho.'],
    entrega: ['Sofia', 'Tudo pronto!']
  };

  if (passo === 'entrega') {
    return (
      <div className="tela-adulto">
        <Fundo cena="quintal" desfoque={10} tom="claro" />
        <Topo voltar="adulto" titulo="Cadastro concluído" />
        <main className="palco adulto">
          <section className="cartao entrega">
            <img className="entrega-arte" src={asset('dupla/dupla-corpo.webp')} alt="Sofia e Tales" />
            <h1 className="t">Agora entregue o aparelho para {nomeBonito}.</h1>
            <p>Fique por perto nos primeiros 10 minutos: é um momento especial. Daqui em diante, todo texto tem áudio.</p>
            <button className="btn enorme ipe brilha" onClick={() => navegar(`c/${id}/avatar`)} data-testid="entregar"><Icone nome="play" />Entregar para {nomeBonito}</button>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="tela-adulto">
      <Fundo cena="quintal" desfoque={14} tom="claro" />
      <Topo voltar="adulto" titulo="Cadastro" />
      <main className="palco adulto">
        <div className="cadastro">
          <aside className="cadastro-dupla">
            <p className="cadastro-fala" key={passo}><b>{falaDupla[passo][0]}</b>{falaDupla[passo][1]}</p>
            <img src={asset('dupla/dupla-corpo.webp')} alt="Sofia e Tales dão as boas-vindas" />
          </aside>

          <section className="cartao cadastro-cartao">
            <ol className="passos" aria-label={`Passo ${idx + 1} de ${PASSOS.length}`}>
              {PASSOS.map(([p, r], i) => (
                <li key={p} className={i < idx ? 'feito' : i === idx ? 'agora' : ''} aria-current={i === idx ? 'step' : undefined}>
                  <i>{i < idx ? <Icone nome="check" /> : i + 1}</i>{r}
                </li>
              ))}
            </ol>

            {passo === 'nome' ? (
              <div className="passo-corpo" key="nome">
                <h1 className="t">Quem vai aprender?</h1>
                <p className="passo-sub">Só o primeiro nome (ou como a família chama a criança).</p>
                <label className="campo">
                  <span className="sr">Primeiro nome</span>
                  <input className="nome-grande" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Mariana" autoComplete="off" autoCapitalize="words" data-testid="campo-nome" />
                  {nome.trim().includes(' ') ? <small>Usamos só o primeiro nome: <b>{nomeBonito}</b>. Sobrenome não é necessário.</small> : null}
                </label>
                <label className="campo">
                  <span>Ano de nascimento</span>
                  <select value={ano} onChange={(e) => setAno(Number(e.target.value))}>
                    {Array.from({ length: 8 }, (_, i) => ANO - 2 - i).map((a) => <option key={a} value={a}>{a} ({ANO - a} anos)</option>)}
                  </select>
                  <small>{ANO - ano <= 3 ? 'Para 2–3 anos, a jornada funciona com o adulto junto.' : 'Define o tempo de cada sessão.'}</small>
                </label>
              </div>
            ) : null}

            {passo === 'falar' ? (
              <div className="passo-corpo" key="falar">
                <h1 className="t">Como se fala {nomeBonito}?</h1>
                <p className="passo-sub">Toque para ouvir e escolha a pronúncia que soa igual à de casa.</p>
                <div className="grade-pronuncia">
                  {opcoes.map((op) => (
                    <div key={op.id + op.grafia} className={`pronuncia ${escolha?.op.grafia === op.grafia ? 'sel' : ''}`}>
                      <b>{op.grafia}</b><small>{op.titulo}</small>
                      <div className="linha-botoes">
                        {(['sofia', 'tales'] as const).map((q) => (
                          <button key={q} className={`btn mini ${escolha?.op.grafia === op.grafia && escolha.voz === q ? 'ipe' : ''}`} onClick={() => { setEscolha({ op, voz: q }); ouvir(op, q); }} data-pronuncia={`${op.id}-${q}`} aria-label={`Ouvir ${op.grafia} na voz ${q === 'sofia' ? 'da Sofia' : 'do Tales'}`}>
                            <Rosto quem={q} tamanho={44} />{q === 'sofia' ? 'Sofia' : 'Tales'}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <details className="mais-opcoes">
                  <summary><Icone nome="microfone" />Nenhuma serviu? Ajuste ou grave</summary>
                  <label className="campo">
                    <span>Escreva como se fala (sílaba forte em MAIÚSCULAS, ex.: Ka-u-Ã)</span>
                    <input value={ajuste} onChange={(e) => setAjuste(e.target.value)} placeholder="Ma-ri-A-na" />
                  </label>
                  <div className="linha-botoes">
                    {temGravacao() ? (
                      <button className="btn" disabled={gravando} onClick={async () => { setGravando(true); try { setGravacao(await gravar(3000, setNivelMic)); } catch { /* sem microfone */ } setGravando(false); }}>
                        <Icone nome={gravacao ? 'repetir' : 'gravar'} />{gravando ? 'Gravando…' : gravacao ? 'Regravar' : 'Gravar o nome (3 s)'}
                      </button>
                    ) : <small>Este navegador não permite gravar; tudo bem, escolha pela escuta.</small>}
                    {gravacao ? <button className="btn" onClick={() => new Audio(URL.createObjectURL(gravacao)).play()}><Icone nome="tocar" />Ouvir gravação</button> : null}
                    {gravando ? <div className="medidor"><i style={{ width: `${nivelMic * 100}%` }} /></div> : null}
                  </div>
                  <p className="nota-mic">A gravação fica só neste aparelho. No produto, as versões são geradas uma vez nas vozes oficiais da Sofia e do Tales (só o primeiro nome é enviado).</p>
                </details>
              </div>
            ) : null}

            {passo === 'genero' ? (
              <div className="passo-corpo" key="genero">
                <h1 className="t">Como a dupla fala com {nomeBonito}?</h1>
                <p className="passo-sub">Só para a Sofia e o Tales concordarem as palavras nas falas.</p>
                <div className="escolhas">
                  {([['f', 'Feminino', '"Você está pronta?"', 'sofia'], ['m', 'Masculino', '"Você está pronto?"', 'tales'], ['n', 'Prefiro não informar', '"Tudo pronto pra começar?"', 'dupla']] as [Genero, string, string, string][]).map(([g, r, ex, arte]) => (
                    <button key={g} className="escolha" aria-pressed={genero === g} onClick={() => setGenero(g)} data-genero={g}>
                      <div className="escolha-arte">{arte === 'dupla' ? <img src={asset('dupla/dupla-corpo.webp')} alt="" /> : <Rosto quem={arte as 'sofia' | 'tales'} humor="joinha" tamanho={84} />}</div>
                      <div><b>{r}</b><small>{ex}</small></div>
                    </button>
                  ))}
                </div>
                {previa ? (
                  <p className="previa"><Rosto quem="sofia" tamanho={60} /><span>A Sofia vai dizer: <b>"{previa}"</b></span><button className="ouvir-mini" onClick={() => voz.falar(previa, { quem: 'sofia' })} aria-label="Ouvir"><Icone nome="som" /></button></p>
                ) : null}
              </div>
            ) : null}

            {passo === 'nivel' ? (
              <div className="passo-corpo" key="nivel">
                <h1 className="t">De onde {nomeBonito} começa?</h1>
                <p className="passo-sub">Dá para mudar depois, na área da família.</p>
                <div className="escolhas" role="group" aria-label="Nível inicial">
                  {NIVEIS_INICIAIS.map((n) => (
                    <button key={n.id} className="escolha" aria-pressed={nivel === n.id} onClick={() => setNivel(n.id)} data-nivel={n.id}>
                      {n.id === 'zero' ? <span className="etiqueta verde recomendado">Recomendado</span> : null}
                      <div className="escolha-arte">
                        {n.id === 'zero' ? <img src={asset('figuras/muda.webp')} alt="" /> : n.id === 'letras-e-sons' ? <div className="mini-pecas" aria-hidden="true"><span>A</span><span>M</span><span>L</span></div> : <img src={asset('recompensas/bau-livros.webp')} alt="" />}
                      </div>
                      <div>
                        <b>{n.titulo}</b>
                        <small>{n.resumo}</small>
                        <ul>{n.perguntas.map((q) => <li key={q}><Icone nome="check" /><span>{q}</span></li>)}</ul>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {passo === 'autorizacao' ? (
              <div className="passo-corpo" key="autorizacao">
                <h1 className="t">Sua autorização</h1>
                <p className="passo-sub">Em linguagem simples (LGPD, art. 14).</p>
                <label className="opcao-linha"><input type="checkbox" checked={cons.responsavel} onChange={(e) => setCons({ ...cons, responsavel: e.target.checked })} data-testid="cons-responsavel" /> <span><b>Sou responsável por {nomeBonito}</b> e autorizo o uso da plataforma.</span></label>
                <label className="opcao-linha"><input type="checkbox" checked={cons.vozPrimeiroNome} onChange={(e) => setCons({ ...cons, vozPrimeiroNome: e.target.checked })} /> <span>A Sofia e o Tales podem falar o primeiro nome.</span></label>
                <label className="opcao-linha"><input type="checkbox" checked={cons.gravarVozAdulto} onChange={(e) => setCons({ ...cons, gravarVozAdulto: e.target.checked })} /> <span>(Opcional) Guardar a minha gravação do nome por até 30 dias.</span></label>
                <div className="nao-pedimos"><Icone nome="escudo" /><span><b>Não pedimos:</b> foto, CPF, endereço, sobrenome nem e-mail da criança. Nenhum áudio da criança é enviado.</span></div>
                <details className="mais-opcoes">
                  <summary><Icone nome="coracao" />Apoios e rotina (opcional)</summary>
                  <p className="nota-mic">Sem rótulo para a criança; dá para mudar depois.</p>
                  {([['previsivel', 'Modo Previsível (trilha fixa, avisos antes das mudanças)'], ['focoCurto', 'Foco curto (blocos menores)'], ['leituraReforco', 'Leitura com reforço (passos menores)'], ['calmo', 'Modo calmo (sem música e partículas)']] as const).map(([k, r]) => (
                    <label key={k} className="opcao-linha"><input type="checkbox" checked={apoios[k]} onChange={(e) => setApoios({ ...apoios, [k]: e.target.checked })} /> {r}</label>
                  ))}
                  <div className="campo linha-campos">
                    <label><span>Tempo por dia</span><select value={rotina.minutosDia} onChange={(e) => setRotina({ ...rotina, minutosDia: Number(e.target.value) })}>{[10, 12, 15, 20].map((m) => <option key={m} value={m}>{m} min</option>)}</select></label>
                    <label><span>Hora de dormir</span><input type="time" value={rotina.horaDormir} onChange={(e) => setRotina({ ...rotina, horaDormir: e.target.value })} /></label>
                  </div>
                </details>
              </div>
            ) : null}

            <div className="passo-pe">
              {idx > 0 ? <button className="btn" onClick={() => setPasso(PASSOS[idx - 1][0])}><Icone nome="seta-esq" />Voltar</button> : <span />}
              {passo === 'nome' ? <button className="btn grande pri" disabled={!nomeOk} onClick={() => setPasso('falar')} data-testid="cadastro-continuar">Continuar<Icone nome="seta" /></button> : null}
              {passo === 'falar' ? <button className="btn grande pri" onClick={() => setPasso('genero')} data-testid="nome-continuar">Continuar<Icone nome="seta" /></button> : null}
              {passo === 'genero' ? <button className="btn grande pri" disabled={!genero} onClick={() => setPasso('nivel')} data-testid="genero-continuar">Continuar<Icone nome="seta" /></button> : null}
              {passo === 'nivel' ? <button className="btn grande pri" onClick={() => setPasso('autorizacao')} data-testid="nivel-continuar">Continuar<Icone nome="seta" /></button> : null}
              {passo === 'autorizacao' ? <button className="btn grande verde" disabled={!cons.responsavel} onClick={salvar} data-testid="salvar-crianca"><Icone nome="check" />Salvar</button> : null}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
