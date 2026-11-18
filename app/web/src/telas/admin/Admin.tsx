/**
 * ÁREA DO ADMINISTRADOR (D032 item 5): rota própria (#/admin), separada das áreas da família e do professor.
 * Acesso com a senha do administrador, definida no primeiro uso (servicos/admin-conta.ts: PBKDF2, nada no código).
 * Abas: Visão geral · Escola · Áudios · Publicar · Site. O administrador da escola vê só Visão geral e Escola.
 * Tudo é deste aparelho (sem servidor); nada sai sem uma ação do administrador (baixar, imprimir, gerar pacote).
 */
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { FASES } from '@fonema/conteudo';
import { verificarFase } from '../../../../packages/conteudo/src/fases/verificar-fases.ts';
import { Icone } from '../../componentes/ui.tsx';
import { Carregando } from '../../componentes/basicos.tsx';
import { useApp } from '../../contexto.tsx';
import { navegar } from '../../rotas.ts';
import { servicoAdmin, senhaValida, type ContaAdmin, type SessaoAdmin } from '../../servicos/admin-conta.ts';
import { servicoConta, type Conta } from '../../servicos/conta.ts';
import { substituicoes } from '../../servicos/substituicoes.ts';
import { PROVEDORES } from '../../servicos/provedor-audios.ts';
import { sha256 } from '../../servicos/audio-edicao.ts';
import { ROTULO_TIPO_AUDIO, contarPorTipo, type TipoAudio } from '../../servicos/catalogo-audios.ts';
import { AbaAudios } from './AbaAudios.tsx';
import { AbaEscola } from './AbaEscola.tsx';
import { AbaMissoes } from './AbaMissoes.tsx';
import { AbaFoto3D, AbaHistorico, AbaImagens, AbaLeitura, AbaPersonagens, AbaTextos, ConfigConteudo } from './Gerenciador.tsx';
import { PublicarTudo } from './PublicarTudo.tsx';
import { baixar, carimbo, dataCurta, useCatalogo, useTrocados } from './dados-admin.ts';
import { idade } from './resumo-admin.ts';
import { useCriancas } from './useCriancas.ts';
import '../../estilos-admin.css';

type Aba = 'visao' | 'escola' | 'textos' | 'missoes' | 'personagens' | 'leitura' | 'imagens' | 'audios' | 'historico' | 'foto3d' | 'publicar' | 'site';
const ABAS: { id: Aba; rota: string; rotulo: string; icone: string; so?: 'geral' }[] = [
  { id: 'visao', rota: 'admin', rotulo: 'Visão geral', icone: 'grafico' },
  { id: 'escola', rota: 'admin/escola', rotulo: 'Escola', icone: 'chapeu' },
  { id: 'textos', rota: 'admin/textos', rotulo: 'Textos e falas', icone: 'caderno', so: 'geral' },
  { id: 'missoes', rota: 'admin/missoes', rotulo: 'Missões', icone: 'mapa', so: 'geral' },
  { id: 'personagens', rota: 'admin/personagens', rotulo: 'Personagens e prêmios', icone: 'pessoa', so: 'geral' },
  { id: 'leitura', rota: 'admin/leitura', rotulo: 'Histórias e leitura', icone: 'olho', so: 'geral' },
  { id: 'imagens', rota: 'admin/imagens', rotulo: 'Imagens', icone: 'album', so: 'geral' },
  { id: 'audios', rota: 'admin/audios', rotulo: 'Áudios', icone: 'microfone', so: 'geral' },
  { id: 'historico', rota: 'admin/historico', rotulo: 'Histórico', icone: 'relogio', so: 'geral' },
  { id: 'foto3d', rota: 'admin/foto3d', rotulo: 'Foto → 3D', icone: 'cubo', so: 'geral' },
  { id: 'publicar', rota: 'admin/publicar', rotulo: 'Publicar', icone: 'baixar', so: 'geral' },
  { id: 'site', rota: 'admin/site', rotulo: 'Site', icone: 'engrenagem', so: 'geral' }
];

export function Admin({ aba, sub }: { aba?: string; sub?: string }) {
  const [sessao, setSessao] = useState<SessaoAdmin | null>(() => servicoAdmin().sessao());
  if (!sessao) return <AcessoAdmin aoEntrar={setSessao} />;
  const atual = (ABAS.find((a) => a.id === aba || (aba === undefined && a.id === 'visao'))?.id ?? 'visao') as Aba;
  const permitidas = ABAS.filter((a) => !a.so || sessao.papel === 'geral');
  const aqui = permitidas.some((a) => a.id === atual) ? atual : 'visao';
  return (
    <div className="adm" data-testid="area-admin">
      <header className="adm-topo">
        <div className="adm-marca"><b>FONEMA · Administrador</b><small>{sessao.nome} · {sessao.papel === 'geral' ? 'acesso geral' : 'escola'}</small></div>
        <nav className="adm-abas" aria-label="Abas do administrador">
          {permitidas.map((a) => <button key={a.id} className="adm-aba" aria-current={a.id === aqui ? 'page' : undefined} onClick={() => navegar(a.rota)} data-aba={a.id}><Icone nome={a.icone} /><span>{a.rotulo}</span></button>)}
        </nav>
        <button className="btn adm-btn" onClick={() => { servicoAdmin().sair(); setSessao(null); navegar(''); }} data-testid="sair-admin"><Icone nome="seta-esq" />Sair</button>
      </header>
      <main className="adm-palco">
        {aqui === 'visao' ? <VisaoGeral papel={sessao.papel} /> : null}
        {aqui === 'escola' ? <AbaEscola papel={sessao.papel} /> : null}
        {aqui === 'textos' ? <AbaTextos /> : null}
        {aqui === 'missoes' ? <AbaMissoes sub={sub} /> : null}
        {aqui === 'personagens' ? <AbaPersonagens /> : null}
        {aqui === 'leitura' ? <AbaLeitura /> : null}
        {aqui === 'imagens' ? <AbaImagens /> : null}
        {aqui === 'historico' ? <AbaHistorico /> : null}
        {aqui === 'foto3d' ? <AbaFoto3D /> : null}
        {aqui === 'audios' ? <AbaAudios sub={sub} /> : null}
        {aqui === 'publicar' ? <Publicar /> : null}
        {aqui === 'site' ? <Site sessao={sessao} /> : null}
      </main>
    </div>
  );
}

/* ------------------------------------------------------------------ acesso */
function Moldura({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <div className="adm adm-acesso" data-testid="acesso-admin">
      <section className="adm-cartao estreito">
        <h1>{titulo}</h1>
        {children}
        <p className="adm-nota"><button className="adm-link" onClick={() => navegar('')}>Voltar ao FONEMA</button></p>
      </section>
    </div>
  );
}

function AcessoAdmin({ aoEntrar }: { aoEntrar: (s: SessaoAdmin) => void }) {
  const [contas, setContas] = useState<ContaAdmin[] | null>(null);
  const [nome, setNome] = useState('');
  const [senha, setSenha] = useState('');
  const [senha2, setSenha2] = useState('');
  const [quem, setQuem] = useState('');
  const [erro, setErro] = useState('');
  const [esqueci, setEsqueci] = useState(false);
  useEffect(() => { void servicoAdmin().contas().then((c) => { setContas(c); setQuem(c.find((x) => x.papel === 'geral')?.id ?? c[0]?.id ?? ''); }); }, []);
  if (!contas) return <Carregando />;
  if (!contas.some((c) => c.papel === 'geral')) {
    const criar = async (e: React.FormEvent) => {
      e.preventDefault();
      const x = senhaValida(senha);
      if (x) { setErro(x); return; }
      if (senha !== senha2) { setErro('As duas senhas não são iguais.'); return; }
      try { aoEntrar(await servicoAdmin().criarGeral(nome, senha)); } catch (z) { setErro(z instanceof Error ? z.message : 'Não deu.'); }
    };
    return (
      <Moldura titulo="Criar o acesso do administrador">
        <p>Primeiro uso neste aparelho. Escolha uma senha só sua (pelo menos 8 caracteres, com letras). Ela não fica guardada: só uma impressão digital dela (PBKDF2).</p>
        <form onSubmit={(e) => void criar(e)} className="adm-form">
          <label className="adm-campo">Seu nome <input value={nome} onChange={(e) => setNome(e.target.value)} autoComplete="name" data-testid="admin-nome" /></label>
          <label className="adm-campo">Senha <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} autoComplete="new-password" data-testid="admin-senha" /></label>
          <label className="adm-campo">Repita a senha <input type="password" value={senha2} onChange={(e) => setSenha2(e.target.value)} autoComplete="new-password" data-testid="admin-senha2" /></label>
          {erro ? <p className="adm-erro" role="alert">{erro}</p> : null}
          <button className="btn adm-btn pri" type="submit" data-testid="criar-admin"><Icone nome="check" />Criar e entrar</button>
        </form>
        <p className="adm-nota">Sem servidor, este acesso vale só neste aparelho e neste navegador. Se esquecer a senha, dá para zerar o acesso (os áudios trocados aqui se perdem).</p>
      </Moldura>
    );
  }
  if (esqueci) return <Moldura titulo="Zerar o acesso do administrador"><Zerar aoCancelar={() => setEsqueci(false)} /></Moldura>;
  const entrar = async (e: React.FormEvent) => {
    e.preventDefault();
    const r = await servicoAdmin().entrar(quem, senha);
    if (r.ok) aoEntrar(r.sessao);
    else setErro(r.motivo === 'espera' ? `Muitas tentativas. Espere ${r.segundos} s.` : 'Senha errada.');
  };
  return (
    <Moldura titulo="Área do administrador">
      <form onSubmit={(e) => void entrar(e)} className="adm-form">
        {contas.length > 1 ? (
          <label className="adm-campo">Acesso <select value={quem} onChange={(e) => setQuem(e.target.value)}>{contas.map((c) => <option key={c.id} value={c.id}>{c.nome} ({c.papel === 'geral' ? 'geral' : 'escola'})</option>)}</select></label>
        ) : <p>Olá, <b>{contas[0].nome}</b>.</p>}
        <label className="adm-campo">Senha <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} autoComplete="current-password" autoFocus data-testid="admin-senha" /></label>
        {erro ? <p className="adm-erro" role="alert" data-testid="admin-erro">{erro}</p> : null}
        <button className="btn adm-btn pri" type="submit" data-testid="entrar-admin"><Icone nome="seta" />Entrar</button>
      </form>
      <p className="adm-nota"><button className="adm-link" onClick={() => setEsqueci(true)}>Esqueci a senha</button></p>
    </Moldura>
  );
}

/** Esqueceu a senha: zera o acesso. Se o aparelho tem contas de adulto, pede o PIN de uma delas antes. */
function Zerar({ aoCancelar }: { aoCancelar: () => void }) {
  const { repo } = useApp();
  const [adultos, setAdultos] = useState<Conta[] | null>(null);
  const [quem, setQuem] = useState('');
  const [pin, setPin] = useState('');
  const [texto, setTexto] = useState('');
  const [erro, setErro] = useState('');
  useEffect(() => { void servicoConta(repo).listar().then((c) => { setAdultos(c); setQuem(c[0]?.id ?? ''); }); }, [repo]);
  if (!adultos) return <Carregando />;
  const zerar = async () => {
    if (adultos.length) {
      const r = await servicoConta(repo).entrar(quem, pin);
      if (!r.ok) { setErro(r.motivo === 'espera' ? `Espere ${r.segundos} s.` : 'PIN errado.'); return; }
    }
    await servicoAdmin().zerar();
    location.reload();
  };
  return (
    <>
      <p>Isto apaga, <b>só neste aparelho</b>: o acesso do administrador, os dados da escola e os <b>áudios trocados</b>. As crianças e o progresso ficam.</p>
      {adultos.length ? (
        <div className="adm-form">
          <p>Para confirmar, um adulto cadastrado neste aparelho digita o PIN.</p>
          <label className="adm-campo">Adulto <select value={quem} onChange={(e) => setQuem(e.target.value)}>{adultos.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}</select></label>
          <label className="adm-campo">PIN <input type="password" inputMode="numeric" maxLength={4} value={pin} onChange={(e) => setPin(e.target.value)} /></label>
        </div>
      ) : null}
      <label className="adm-campo">Escreva ZERAR para confirmar <input value={texto} onChange={(e) => setTexto(e.target.value)} /></label>
      {erro ? <p className="adm-erro" role="alert">{erro}</p> : null}
      <div className="adm-linha">
        <button className="btn adm-btn terra" disabled={texto.trim().toUpperCase() !== 'ZERAR'} onClick={() => void zerar()}><Icone nome="lixeira" />Zerar o acesso</button>
        <button className="btn adm-btn" onClick={aoCancelar}>Cancelar</button>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ visão geral */
function VisaoGeral({ papel }: { papel: 'geral' | 'escola' }) {
  const { linhas } = useCriancas();
  const catalogo = useCatalogo();
  const trocados = useTrocados();
  const [decod, setDecod] = useState<{ itens: number; erros: number; avisos: number; exemplos: string[] } | null>(null);
  useEffect(() => {
    // o verificador roda aqui mesmo (o mesmo dos testes e do relatório gerado)
    const t = setTimeout(() => {
      const itens = FASES.flatMap((f) => verificarFase(f).map((i) => ({ ...i, fase: f.id })));
      const ruins = itens.filter((i) => !i.resultado.ok);
      setDecod({ itens: itens.length, erros: ruins.length, avisos: itens.filter((i) => i.resultado.ok && i.resultado.avisos.length).length, exemplos: ruins.slice(0, 5).map((i) => `${i.fase}: ${i.texto}`) });
    }, 50);
    return () => clearTimeout(t);
  }, []);
  const porTipo = useMemo(() => (catalogo ? contarPorTipo(catalogo) : null), [catalogo]);
  const turmas = useMemo(() => [...new Set((linhas ?? []).map((l) => l.c.turma).filter(Boolean))], [linhas]);
  const tot = (linhas ?? []).reduce((a, l) => ({ s7: a.s7 + l.sessoes7, s30: a.s30 + l.sessoes30, min: a.min + l.minutos }), { s7: 0, s30: 0, min: 0 });
  const pendentes = catalogo?.filter((i) => !i.arquivo && i.tipo !== 'som-letra').length ?? 0;
  const sonsSem = catalogo?.filter((i) => !i.arquivo && i.tipo === 'som-letra').length ?? 0;
  const auditoria = catalogo?.filter((i) => i.auditoria) ?? [];
  return (
    <section className="adm-cartao" data-testid="aba-visao">
      <div className="adm-cab"><h1>Visão geral deste aparelho</h1></div>
      <div className="adm-numeros">
        <Numero rotulo="Crianças" valor={linhas?.length} />
        <Numero rotulo="Turmas" valor={linhas ? turmas.length : undefined} />
        <Numero rotulo="Sessões (7 dias)" valor={linhas ? tot.s7 : undefined} />
        <Numero rotulo="Sessões (30 dias)" valor={linhas ? tot.s30 : undefined} />
        <Numero rotulo="Tempo de uso (estimado)" valor={linhas ? `${Math.round(tot.min / 6) / 10} h` : undefined} />
        {papel === 'geral' ? <Numero rotulo="Áudios trocados aqui" valor={trocados.size} /> : null}
      </div>

      <h2>Crianças</h2>
      {!linhas ? <p className="adm-nota">Carregando…</p> : !linhas.length ? <p className="adm-nota">Nenhuma criança cadastrada neste aparelho.</p> : (
        <div className="adm-rolar"><table className="adm-tabela" data-testid="tabela-criancas">
          <thead><tr><th>Criança</th><th>Idade</th><th>Turma</th><th>Nível</th><th>Fase atual</th><th>Fases concluídas</th><th>Já faz</th><th>Sessões (30 d)</th><th>Tempo (min)</th><th>Último uso</th></tr></thead>
          <tbody>{linhas.map((l) => (
            <tr key={l.c.id}><td>{l.c.nome}</td><td>{idade(l.c.anoNascimento)}</td><td>{l.c.turma ?? '—'}</td><td>{l.resumo.nivel.rotulo}</td><td>{l.resumo.faseAtual.titulo}</td><td>{l.fasesConcluidas}</td><td>{l.resumo.jaSabe.length}</td><td>{l.sessoes30}</td><td>{l.minutos}</td><td>{dataCurta(l.ultimo)}</td></tr>
          ))}</tbody>
        </table></div>
      )}
      <p className="adm-nota">"Já faz" conta só habilidades dominadas de verdade (tentativas avaliadas); ver, ouvir e "Já conheci!" não contam. Tempo de uso é estimado pelos registros do aparelho.</p>

      <h2>Saúde do conteúdo</h2>
      <div className="adm-saude">
        <div className="adm-saude-item" data-testid="saude-decod">
          <b>Decodificabilidade</b>
          {decod ? <p>{decod.itens} leituras e escritas conferidas · <span className={decod.erros ? 'adm-ruim' : 'adm-bom'}>{decod.erros} erros</span> · {decod.avisos} com aviso</p> : <p>Conferindo…</p>}
          {decod?.exemplos.length ? <ul>{decod.exemplos.map((x) => <li key={x}>{x}</li>)}</ul> : null}
        </div>
        <div className="adm-saude-item">
          <b>Falas sem áudio</b>
          <p>{catalogo ? `${pendentes} trechos do conteúdo ainda sem clipe (o texto aparece escrito) · ${sonsSem} sons de letra sem clipe (R fraco, LH, NH…)` : 'Carregando…'}</p>
          {papel === 'geral' ? <button className="adm-link" onClick={() => navegar('admin/audios')}>Ver na aba Áudios (Mostrar › Sem áudio)</button> : null}
        </div>
        <div className="adm-saude-item">
          <b>Clipes marcados na auditoria</b>
          <p>{catalogo ? `${auditoria.filter((i) => i.auditoria === 'grave').length} graves · ${auditoria.filter((i) => i.auditoria === 'conferir').length} para conferir` : 'Carregando…'}</p>
          <p className="adm-nota">Da última auditoria dos clipes (docs/auditoria-audio.md). Trocar o áudio por voz humana tira o clipe desta lista quando o pacote é aplicado.</p>
        </div>
      </div>
      {porTipo ? (
        <div className="adm-rolar"><table className="adm-tabela">
          <thead><tr><th>Tipo de áudio</th><th>Total</th><th>Sem áudio</th><th>Na auditoria</th></tr></thead>
          <tbody>{(Object.keys(porTipo) as TipoAudio[]).filter((t) => porTipo[t].total).map((t) => <tr key={t}><td>{ROTULO_TIPO_AUDIO[t]}</td><td>{porTipo[t].total}</td><td>{porTipo[t].semAudio}</td><td>{porTipo[t].auditoria}</td></tr>)}</tbody>
        </table></div>
      ) : null}
    </section>
  );
}
function Numero({ rotulo, valor }: { rotulo: string; valor: number | string | undefined }) {
  return <div className="adm-numero"><b>{valor ?? '…'}</b><span>{rotulo}</span></div>;
}

/* ------------------------------------------------------------------ publicar */
function Publicar() {
  const trocados = useTrocados();
  const catalogo = useCatalogo();
  const [msg, setMsg] = useState('');
  const [gerando, setGerando] = useState(false);
  const lista = [...trocados.values()].sort((a, b) => a.id.localeCompare(b.id));
  const semAutorizacao = lista.filter((m) => m.origem === 'gravacao' && !m.autorizacao).length;
  const gerar = async () => {
    setGerando(true);
    try {
      const registros = await substituicoes.listar();
      const entradas = await Promise.all(registros.map(async (r) => {
        const dados = new Uint8Array(await r.blob.arrayBuffer());
        const it = catalogo?.find((x) => x.id === r.id);
        return { id: r.id, dados, mime: r.blob.type || 'application/octet-stream', texto: it?.texto ?? r.texto, tipo: it ? ROTULO_TIPO_AUDIO[it.tipo] : undefined, origem: r.origem, quem: r.quem, autorizacao: r.autorizacao, duracaoMs: r.duracaoMs, em: r.em, sha256: await sha256(dados) };
      }));
      const r = await PROVEDORES[0].publicar(entradas);
      if (r.zip) baixar(new Blob([r.zip as unknown as BlobPart], { type: 'application/zip' }), `fonema-pacote-audios-${carimbo()}.zip`);
      setMsg(r.mensagem);
    } catch (e) { setMsg(e instanceof Error ? e.message : 'Não deu para gerar o pacote.'); } finally { setGerando(false); }
  };
  return (
    <section className="adm-cartao" data-testid="aba-publicar">
      <div className="adm-cab"><h1>Publicar para todos</h1>{msg ? <span className="adm-etq verde" role="status" data-testid="msg-publicar">{msg}</span> : null}</div>
      <PublicarTudo />
      <h2>Só os áudios (pacote antigo)</h2>
      <p>Os áudios trocados valem, por enquanto, <b>só neste aparelho</b>. Como o FONEMA ainda não tem servidor, para valer para todo mundo:</p>
      <ol className="adm-passos">
        <li>Toque em <b>Gerar pacote de áudios</b>: baixa um arquivo <code>.zip</code> com os áudios e a lista de onde cada um entra.</li>
        <li>Mande o arquivo para quem cuida do repositório (e-mail, Drive, WhatsApp).</li>
        <li>Lá, ele roda <code>npx tsx scripts/importar-pacote-audios.ts pacote.zip</code> (na pasta <code>app/</code>), confere e publica uma versão nova do site.</li>
      </ol>
      <p className="adm-nota">Passo a passo completo: <code>app/docs/como-editar-a-plataforma.md</code>.</p>
      {semAutorizacao ? <p className="adm-aviso" role="alert">{semAutorizacao} gravação(ões) sem a marca "a pessoa autorizou por escrito". Publicar voz de pessoa real pede autorização por escrito (decisão do dono).</p> : null}
      <div className="adm-linha">
        <button className="btn adm-btn pri" onClick={() => void gerar()} disabled={!lista.length || gerando} data-testid="gerar-pacote"><Icone nome="baixar" />{gerando ? 'Gerando…' : `Gerar pacote de áudios (${lista.length})`}</button>
      </div>
      {lista.length ? (
        <div className="adm-rolar"><table className="adm-tabela"><thead><tr><th>Áudio</th><th>Texto</th><th>Trocado em</th><th>Quem gravou</th><th>Autorização</th></tr></thead>
          <tbody>{lista.map((m) => <tr key={m.id}><td><code>{m.id}</code></td><td>{m.texto}</td><td>{dataCurta(m.em)}</td><td>{m.quem ?? '—'}</td><td>{m.autorizacao ? 'sim' : m.origem === 'arquivo' ? '—' : 'não marcada'}</td></tr>)}</tbody>
        </table></div>
      ) : <p className="adm-nota">Nenhum áudio trocado neste aparelho ainda.</p>}
      <h2>Formas de publicar</h2>
      <ul className="adm-lista">
        {PROVEDORES.map((p) => <li key={p.nome}><b>{p.nome}</b> — {p.disponivel() ? 'disponível' : 'precisa de servidor (Vercel Blob/DB); deixado pronto no código, sem credencial'}</li>)}
      </ul>
    </section>
  );
}

/* ------------------------------------------------------------------ site */
function Site({ sessao }: { sessao: SessaoAdmin }) {
  const { configBruta, salvarConfig } = useApp();
  const [msg, setMsg] = useState('');
  const set = async (c: Parameters<typeof salvarConfig>[0]) => { await salvarConfig(c); setMsg('Salvo neste aparelho.'); };
  const [senhaAtual, setSenhaAtual] = useState('');
  const [senhaNova, setSenhaNova] = useState('');
  const [erroSenha, setErroSenha] = useState('');
  return (
    <section className="adm-cartao" data-testid="aba-site">
      <div className="adm-cab"><h1>Configurações do site</h1>{msg ? <span className="adm-etq verde" role="status">{msg}</span> : null}</div>
      <p className="adm-nota">Sem servidor, estas escolhas valem <b>só neste aparelho</b> (são as mesmas das Configurações da família/professor).</p>
      <fieldset className="adm-grupo"><legend>Recursos que já podem ser ligados e desligados</legend>
        <label className="adm-check"><input type="checkbox" checked={configBruta.lojinha.naVila} onChange={(e) => void set({ lojinha: { ...configBruta.lojinha, naVila: e.target.checked } })} /> Lojinha no mapa da vila</label>
        <label className="adm-check"><input type="checkbox" checked={configBruta.lojinha.noFimDaSessao} onChange={(e) => void set({ lojinha: { ...configBruta.lojinha, noFimDaSessao: e.target.checked } })} /> Oferecer a Lojinha no fim da missão</label>
        <label className="adm-check"><input type="checkbox" checked={configBruta.lojinha.naEntradaDaFase} onChange={(e) => void set({ lojinha: { ...configBruta.lojinha, naEntradaDaFase: e.target.checked } })} /> Atalho da Lojinha na entrada da fase</label>
        <label className="adm-check"><input type="checkbox" checked={configBruta.conquistas.naEntradaDaFase} onChange={(e) => void set({ conquistas: { naEntradaDaFase: e.target.checked } })} /> Mostrar as conquistas na entrada da fase</label>
        <label className="adm-check"><input type="checkbox" checked={configBruta.alfabeto?.primeirasPalavrinhas ?? true} onChange={(e) => void set({ alfabeto: { primeirasPalavrinhas: e.target.checked } })} /> Primeiras palavrinhas na Trilha do Alfabeto</label>
        <label className="adm-check"><input type="checkbox" checked={configBruta.modoDemonstracao} onChange={(e) => void set({ modoDemonstracao: e.target.checked })} /> Modo demonstração (cada fase em 1 sessão; desligue para a criança)</label>
      </fieldset>
      <ConfigConteudo />
      <p className="adm-nota">Ordem e conteúdo das missões: aba <button className="adm-link" onClick={() => navegar('admin/missoes')}>Missões</button> (com o verificador).</p>
      <fieldset className="adm-grupo"><legend>Precisa de servidor</legend>
        <ul className="adm-lista"><li>Publicar edições, áudios e figuras para todos os aparelhos de uma vez (hoje: pacote .zip, aba Publicar)</li><li>Login do administrador e da escola em qualquer aparelho</li><li>Relatórios da rede (várias escolas), sala de aula online, conversa com IA</li></ul>
      </fieldset>
      <fieldset className="adm-grupo"><legend>Minha senha</legend>
        <div className="adm-linha">
          <label className="adm-campo">Senha atual <input type="password" autoComplete="current-password" value={senhaAtual} onChange={(e) => setSenhaAtual(e.target.value)} /></label>
          <label className="adm-campo">Senha nova <input type="password" autoComplete="new-password" value={senhaNova} onChange={(e) => setSenhaNova(e.target.value)} /></label>
          <button className="btn adm-btn" disabled={!senhaAtual || !senhaNova} onClick={async () => { try { await servicoAdmin().trocarSenha(sessao.id, senhaAtual, senhaNova); setErroSenha(''); setSenhaAtual(''); setSenhaNova(''); setMsg('Senha trocada.'); } catch (e) { setErroSenha(e instanceof Error ? e.message : 'Não deu.'); } }}>Trocar a senha</button>
        </div>
        {erroSenha ? <p className="adm-erro" role="alert">{erroSenha}</p> : null}
      </fieldset>
    </section>
  );
}
