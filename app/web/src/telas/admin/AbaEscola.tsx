/**
 * Área do administrador › ESCOLA (dados formais): cadastro da escola, turmas, professores, turma de cada criança,
 * acesso do administrador da escola e relatórios (planilha CSV e relatório para imprimir/salvar em PDF).
 * Tudo fica NESTE aparelho (banco "fonema-admin"); nada sai sem o administrador baixar ou imprimir.
 */
import { useEffect, useState } from 'react';
import { Icone } from '../../componentes/ui.tsx';
import { useApp } from '../../contexto.tsx';
import { servicoAdmin, senhaValida, type ContaAdmin } from '../../servicos/admin-conta.ts';
import { novoId } from '../../dados/repositorio.ts';
import { baixar, carimbo, dataCurta } from './dados-admin.ts';
import { idade, paraCsv } from './resumo-admin.ts';
import { useCriancas, type LinhaCrianca } from './useCriancas.ts';

export interface DadosEscola { nome: string; inep: string; cnpj: string; endereco: string; cidade: string; uf: string; telefone: string; email: string; diretor: string; coordenador: string; anoLetivo: string }
export interface Turma { id: string; nome: string; ano: string; turno: string; professor: string }
export interface ProfessorEscola { id: string; nome: string; email: string; turmas: string }
const ESCOLA_VAZIA: DadosEscola = { nome: '', inep: '', cnpj: '', endereco: '', cidade: '', uf: '', telefone: '', email: '', diretor: '', coordenador: '', anoLetivo: String(new Date().getFullYear()) };

const CAMPOS: [keyof DadosEscola, string, string?][] = [
  ['nome', 'Nome da escola'], ['inep', 'Código INEP'], ['cnpj', 'CNPJ'], ['anoLetivo', 'Ano letivo'], ['endereco', 'Endereço'], ['cidade', 'Cidade'], ['uf', 'UF'],
  ['telefone', 'Telefone'], ['email', 'E-mail', 'email'], ['diretor', 'Diretor(a)'], ['coordenador', 'Coordenador(a) pedagógico(a)']
];

export function useEscola() {
  const [escola, setEscola] = useState<DadosEscola>(ESCOLA_VAZIA);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [profs, setProfs] = useState<ProfessorEscola[]>([]);
  useEffect(() => {
    const s = servicoAdmin();
    void s.ler<DadosEscola>('escola').then((v) => v && setEscola({ ...ESCOLA_VAZIA, ...v }));
    void s.ler<Turma[]>('turmas').then((v) => v && setTurmas(v));
    void s.ler<ProfessorEscola[]>('professores').then((v) => v && setProfs(v));
  }, []);
  return { escola, setEscola, turmas, setTurmas, profs, setProfs };
}

function linhasRelatorio(escola: DadosEscola, linhas: LinhaCrianca[]) {
  return [
    ['Escola', 'INEP', 'Ano letivo', 'Turma', 'Criança', 'Idade', 'Nível', 'Fase atual', 'Fases concluídas', 'Sessões (total)', 'Sessões (30 dias)', 'Tempo de uso estimado (min)', 'Último uso', 'Já faz (dominado)'],
    ...linhas.map((l) => [escola.nome, escola.inep, escola.anoLetivo, l.c.turma ?? '', l.c.nome, idade(l.c.anoNascimento), l.resumo.nivel.rotulo, l.resumo.faseAtual.titulo, l.fasesConcluidas, l.sessoes, l.sessoes30, l.minutos, dataCurta(l.ultimo), l.resumo.jaSabe.length])
  ];
}

export function AbaEscola({ papel }: { papel: 'geral' | 'escola' }) {
  const { repo } = useApp();
  const { escola, setEscola, turmas, setTurmas, profs, setProfs } = useEscola();
  const { linhas, recarregar } = useCriancas();
  const [msg, setMsg] = useState('');
  const salvarEscola = async () => { await servicoAdmin().gravar('escola', escola); setMsg('Dados da escola salvos.'); };
  const salvarTurmas = async (t: Turma[]) => { setTurmas(t); await servicoAdmin().gravar('turmas', t); };
  const salvarProfs = async (p: ProfessorEscola[]) => { setProfs(p); await servicoAdmin().gravar('professores', p); };
  const [contasAdulto, setContasAdulto] = useState<{ nome: string; email?: string }[]>([]);
  useEffect(() => { void repo.listarContas().then((cs) => setContasAdulto(cs.filter((c) => c.tipo === 'professor').map((c) => ({ nome: c.nome, email: c.email })))); }, [repo]);

  const csv = () => {
    if (!linhas) return;
    baixar(new Blob([paraCsv(linhasRelatorio(escola, linhas))], { type: 'text/csv;charset=utf-8' }), `fonema-relatorio-${carimbo()}.csv`);
    setMsg('Planilha baixada. Ela tem nomes de crianças: guarde com cuidado (LGPD).');
  };
  const imprimir = () => {
    document.documentElement.classList.add('adm-imprimindo');
    const tirar = () => { document.documentElement.classList.remove('adm-imprimindo'); window.removeEventListener('afterprint', tirar); };
    window.addEventListener('afterprint', tirar);
    window.print();
    setTimeout(tirar, 1500);
  };

  return (
    <section className="adm-cartao" data-testid="aba-escola">
      <div className="adm-cab"><h1>Escola</h1>{msg ? <span className="adm-etq verde" role="status">{msg}</span> : null}</div>
      <p className="adm-nota">Dados formais da escola, só neste aparelho. Os relatórios têm nomes de crianças: baixe ou imprima só quando for usar, e guarde com cuidado (LGPD).</p>

      <fieldset className="adm-grupo"><legend>Cadastro da escola</legend>
        <div className="adm-grade">
          {CAMPOS.map(([k, r, t]) => <label key={k} className="adm-campo">{r}<input type={t ?? 'text'} value={escola[k]} onChange={(e) => setEscola({ ...escola, [k]: e.target.value })} data-testid={`escola-${k}`} /></label>)}
        </div>
        <button className="btn adm-btn verde" onClick={() => void salvarEscola()} data-testid="salvar-escola"><Icone nome="check" />Salvar dados da escola</button>
      </fieldset>

      <fieldset className="adm-grupo"><legend>Turmas</legend>
        <table className="adm-tabela"><thead><tr><th>Turma</th><th>Ano/série</th><th>Turno</th><th>Professor(a)</th><th>Crianças</th><th /></tr></thead>
          <tbody>
            {turmas.map((t, i) => (
              <tr key={t.id}>
                {(['nome', 'ano', 'turno', 'professor'] as const).map((k) => <td key={k}><input aria-label={k} value={t[k]} onChange={(e) => { const n = [...turmas]; n[i] = { ...t, [k]: e.target.value }; setTurmas(n); }} onBlur={() => void salvarTurmas(turmas)} /></td>)}
                <td>{linhas?.filter((l) => l.c.turma === t.nome).length ?? '…'}</td>
                <td><button className="btn adm-btn terra" aria-label={`Remover a turma ${t.nome}`} onClick={() => void salvarTurmas(turmas.filter((x) => x.id !== t.id))}><Icone nome="lixeira" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
        <button className="btn adm-btn" onClick={() => void salvarTurmas([...turmas, { id: novoId('tu'), nome: `Turma ${turmas.length + 1}`, ano: '1º ano', turno: 'Manhã', professor: '' }])} data-testid="nova-turma"><Icone nome="mais" />Nova turma</button>
      </fieldset>

      <fieldset className="adm-grupo"><legend>Professores</legend>
        <table className="adm-tabela"><thead><tr><th>Nome</th><th>E-mail</th><th>Turmas</th><th /></tr></thead>
          <tbody>
            {profs.map((p, i) => (
              <tr key={p.id}>
                {(['nome', 'email', 'turmas'] as const).map((k) => <td key={k}><input aria-label={k} value={p[k]} onChange={(e) => { const n = [...profs]; n[i] = { ...p, [k]: e.target.value }; setProfs(n); }} onBlur={() => void salvarProfs(profs)} /></td>)}
                <td><button className="btn adm-btn terra" aria-label={`Remover ${p.nome}`} onClick={() => void salvarProfs(profs.filter((x) => x.id !== p.id))}><Icone nome="lixeira" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="adm-linha">
          <button className="btn adm-btn" onClick={() => void salvarProfs([...profs, { id: novoId('pr'), nome: '', email: '', turmas: '' }])}><Icone nome="mais" />Novo professor</button>
          {contasAdulto.length ? <span className="adm-nota">Contas de professor neste aparelho: {contasAdulto.map((c) => c.nome).join(', ')}.</span> : null}
        </div>
      </fieldset>

      <fieldset className="adm-grupo"><legend>Turma de cada criança</legend>
        {!linhas ? <p className="adm-nota">Carregando…</p> : !linhas.length ? <p className="adm-nota">Nenhuma criança cadastrada neste aparelho.</p> : (
          <table className="adm-tabela"><thead><tr><th>Criança</th><th>Idade</th><th>Turma</th></tr></thead>
            <tbody>
              {linhas.map((l) => (
                <tr key={l.c.id}><td>{l.c.nome}</td><td>{idade(l.c.anoNascimento)}</td>
                  <td><select value={l.c.turma ?? ''} onChange={async (e) => { await repo.salvarCrianca({ ...l.c, turma: e.target.value || undefined }); recarregar(); }} aria-label={`Turma de ${l.c.nome}`}>
                    <option value="">Sem turma</option>{turmas.map((t) => <option key={t.id} value={t.nome}>{t.nome}</option>)}
                    {l.c.turma && !turmas.some((t) => t.nome === l.c.turma) ? <option value={l.c.turma}>{l.c.turma}</option> : null}
                  </select></td></tr>
              ))}
            </tbody>
          </table>
        )}
      </fieldset>

      <fieldset className="adm-grupo"><legend>Relatórios</legend>
        <div className="adm-linha">
          <button className="btn adm-btn pri" onClick={csv} disabled={!linhas?.length} data-testid="baixar-csv"><Icone nome="baixar" />Planilha (CSV)</button>
          <button className="btn adm-btn" onClick={imprimir} disabled={!linhas} data-testid="imprimir-relatorio"><Icone nome="caderno" />Imprimir / salvar em PDF</button>
        </div>
      </fieldset>

      {papel === 'geral' ? <AcessosEscola /> : null}

      {/* relatório para impressão (só aparece no papel) */}
      <div className="adm-impressao" aria-hidden="true">
        <h1>{escola.nome || 'Escola'} — relatório FONEMA</h1>
        <p>{[escola.inep && `INEP ${escola.inep}`, escola.cidade && `${escola.cidade}${escola.uf ? `/${escola.uf}` : ''}`, `Ano letivo ${escola.anoLetivo}`, `Gerado em ${new Date().toLocaleString('pt-BR')}`].filter(Boolean).join(' · ')}</p>
        {linhas ? (
          <table><thead><tr>{linhasRelatorio(escola, []).at(0)!.slice(3).map((h) => <th key={h}>{h}</th>)}</tr></thead>
            <tbody>{linhasRelatorio(escola, linhas).slice(1).map((l, i) => <tr key={i}>{l.slice(3).map((v, k) => <td key={k}>{v}</td>)}</tr>)}</tbody>
          </table>
        ) : null}
        <p>Nível e "já faz" contam só o que a criança mostrou nas atividades avaliadas (exposição e autorrelato não contam). Tempo de uso é estimado pelos registros do aparelho.</p>
      </div>
    </section>
  );
}

function AcessosEscola() {
  const [contas, setContas] = useState<ContaAdmin[]>([]);
  const [nome, setNome] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const ler = () => void servicoAdmin().contas().then((c) => setContas(c.filter((x) => x.papel === 'escola')));
  useEffect(ler, []);
  const criar = async () => {
    const e = senhaValida(senha);
    if (e) { setErro(e); return; }
    try { await servicoAdmin().criarEscola(nome, senha); setNome(''); setSenha(''); setErro(''); ler(); } catch (x) { setErro(x instanceof Error ? x.message : 'Não deu.'); }
  };
  return (
    <fieldset className="adm-grupo"><legend>Acesso do administrador da escola</legend>
      <p className="adm-nota">Quem entra com este acesso vê a visão geral e esta aba (dados da escola e relatórios). Não troca áudios nem configura o site.</p>
      <ul className="adm-lista">{contas.map((c) => <li key={c.id}>{c.nome} <small>criado em {dataCurta(c.criadaEm)}</small> <button className="btn adm-btn terra" onClick={async () => { await servicoAdmin().removerConta(c.id); ler(); }}>Remover</button></li>)}</ul>
      <div className="adm-linha">
        <label className="adm-campo">Nome <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="ex.: Coordenação" /></label>
        <label className="adm-campo">Senha (8+ caracteres) <input type="password" autoComplete="new-password" value={senha} onChange={(e) => setSenha(e.target.value)} /></label>
        <button className="btn adm-btn" onClick={() => void criar()} disabled={!nome.trim() || !senha}><Icone nome="mais" />Criar acesso</button>
      </div>
      {erro ? <p className="adm-erro" role="alert">{erro}</p> : null}
    </fieldset>
  );
}
