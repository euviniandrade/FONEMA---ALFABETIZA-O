/**
 * BANCADA DE TESTE dos selos 3D e do giro 360° (não entra no build do app).
 *   npx vite            → /bancada-selos.html#metais | #doze | #angulos | #premios | #celebracao | #todos
 * Usa os componentes REAIS (recompensas.tsx). window.__nomes(lista) confere o ajuste dos nomes na faixa.
 */
import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { CONQUISTAS, FASE_POR_ID, SURPRESAS, type Conquista } from '@fonema/conteudo';
import { AVATAR_LIMPO, progressoInicial, type ConquistaGanha, type Crianca, type Progresso, type RelatorioSessao } from '@fonema/motor';
import { ProvedorApp, criarRepositorio } from './contexto.tsx';
import { Ritual } from './telas/crianca/Ritual.tsx';
import './estilos.css';
import './estilos-recompensas.css';
import { CelebracaoSelos, Cofrinho, Modelo3D, Premio3D, Selo, SeloGirando, formaDoSelo, type QualModelo } from './componentes/recompensas.tsx';
import { ajustarNome, fontePronta, type Forma } from './componentes/selo-pintura.ts';

const c = (id: string, nome: string, tipo: Conquista['tipo'], motivo: string, visivel: Conquista['visivel_antes'] = 'visivel'): Conquista =>
  ({ id, nome, tipo, categoria: 'fonema', regiao: 'R0', criterio: '', niveis: ['bronze', 'prata', 'ouro', 'diamante'], visivel_antes: visivel, dica: 'Escutar o comecinho das palavras', motivo });
const g = (id: string, nivel: ConquistaGanha['nivel']): ConquistaGanha => ({ id, nivel, em: Date.UTC(2026, 10, 14, 15), vista: true });
const NIVEIS = ['bronze', 'prata', 'ouro', 'diamante'] as const;
const FORMAS: Array<[string, Conquista]> = [
  ['estrela', c('f1', 'Meu Nome', 'selo', 'K')],
  ['escudo', c('f2', 'Guarda do Meio Ambiente', 'titulo', '🌱')],
  ['medalha', c('f3', 'Caça aos Sons', 'selo', '👏')],
  ['hexagono', c('f4', 'Mostrei pro Professor', 'selo_validacao', '📖')]
];

function Metais() {
  return (
    <div className="b-grade" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }} data-pronto="metais">
      {FORMAS.flatMap(([f, q]) => [
        ...NIVEIS.map((n) => <figure key={f + n}><Selo conquista={{ ...q, id: q.id + n }} ganha={g(q.id, n)} tamanho={230} /><figcaption>{f} · {n}</figcaption></figure>),
        <figure key={f + 'b'}><Selo conquista={{ ...q, id: q.id + 'b', visivel_antes: f === 'hexagono' ? 'misterio' : 'visivel' }} bloqueado tamanho={230} /><figcaption>{f === 'hexagono' ? 'mistério' : 'bloqueado'}</figcaption></figure>
      ])}
    </div>
  );
}

function Doze() {
  const ids = ['S-LETRA-A', 'S-R0-01', 'S-R0-10', 'T-ALFABETO', 'TI-R0-01', 'M-R0-01', 'V-R0-01', 'S-R2a-03'];
  const base = ids.map((i) => CONQUISTAS.find((x) => x.id === i)).filter(Boolean) as Conquista[];
  const longos = [...CONQUISTAS].filter((x) => !ids.includes(x.id)).sort((a, b) => b.nome.length - a.nome.length).slice(0, 3);
  const curto = [...CONQUISTAS].filter((x) => !ids.includes(x.id) && x.regiao !== 'AL').sort((a, b) => a.nome.length - b.nome.length)[0];
  const lista = [...base, ...longos, curto].slice(0, 12);
  return (
    <div className="b-grade" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }} data-pronto="doze">
      {lista.map((q, i) => <figure key={q.id}><Selo conquista={q} ganha={g(q.id, q.niveis.includes('bronze') ? NIVEIS[i % 4] : 'unico')} letra="K" tamanho={250} /><figcaption>{q.id} · {q.tipo} · {q.nome.length} letras</figcaption></figure>)}
    </div>
  );
}

function Angulos() {
  const q = CONQUISTAS.find((x) => x.id === 'S-LETRA-A')!;
  const t = c('ang', 'Guarda do Meio Ambiente', 'titulo', '🌱');
  return (
    <div data-pronto="angulos">
      {[[q, g(q.id, 'unico')] as const, [t, g('ang', 'prata')] as const].map(([k, gg]) => (
        <div key={k.id} className="b-grade" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
          {[0, 45, 90, 135, 180].map((a) => <figure key={a}><SeloGirando conquista={k} ganha={gg} tamanho={250} angulo={a} /><figcaption>{a}°</figcaption></figure>)}
        </div>
      ))}
    </div>
  );
}

const QUAIS: QualModelo[] = ['porquinho', 'trofeu', 'bau', 'bolota'];
function Premios() {
  return (
    <div data-pronto="premios">
      {QUAIS.map((p) => (
        <div key={p} className="b-grade" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
          {[0, 45, 90, 135, 180].map((a) => <figure key={a}><Modelo3D qual={p} tamanho={210} angulo={a} /><figcaption>{p} · {a}°</figcaption></figure>)}
        </div>
      ))}
      <div className="b-grade" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
        {[0, 45, 90, 135, 180].map((a) => <figure key={a}><Premio3D tipo="moeda" tamanho={170} angulo={a} /><figcaption>moeda · {a}°</figcaption></figure>)}
      </div>
      <div className="b-grade" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <figure><Cofrinho saldo={30} /><figcaption>cofrinho (gira; arraste)</figcaption></figure>
        <figure><Premio3D tipo="moeda" tamanho={150} /><figcaption>moeda girando (arraste)</figcaption></figure>
        <figure><SeloGirando conquista={c('liv', 'Meu Nome', 'selo', 'K')} ganha={g('liv', 'ouro')} tamanho={220} modo="parado" /><figcaption>selo (arraste; volta de frente)</figcaption></figure>
      </div>
    </div>
  );
}

/** Um modelo só, na pose de descanso, sem fundo: é daqui que scripts/gerar-miniaturas-modelos.mjs tira as imagens paradas. */
function Mini({ qual, semSombra }: { qual: QualModelo; semSombra: boolean }) {
  return <div data-pronto="mini" style={{ width: 640 }}><Modelo3D qual={qual} tamanho={640 / 1.16} angulo={0} semSombra={semSombra} /></div>;
}

function Celebracao() {
  const ids = ['S-LETRA-A', 'S-R0-10'];
  const itens = ids.map((i) => ({ conquista: CONQUISTAS.find((x) => x.id === i)!, ganha: g(i, i === 'S-R0-10' ? 'bronze' : 'unico') }));
  return <div data-pronto="celebracao" style={{ minHeight: '70vh', display: 'grid', placeItems: 'end center' }}><CelebracaoSelos itens={itens} letra="K" /></div>;
}

/* ---- telas reais com dados semeados (para capturas sem passar pelo fluxo inteiro) ---- */
const ID = 'bancada-selos';
const AGORA = Date.UTC(2026, 10, 14, 15);
const GANHAS: Array<[string, ConquistaGanha['nivel']]> = [['S-LETRA-A', 'unico'], ['S-R0-01', 'bronze'], ['S-R0-10', 'prata'], ['TI-R0-01', 'ouro'], ['S-R0-03', 'diamante'], ['M-R0-01', 'unico'], ['T-ALFABETO', 'unico']];
function dados(): { crianca: Crianca; progresso: Progresso } {
  const crianca = {
    id: ID, nome: 'Kauã', genero: 'm', anoNascimento: 2020, pronuncia: { grafia: 'Kauã', fala: 'Kauã', rate: 1, pitchExtra: 0, voz: 'sofia' },
    avatar: { ...AVATAR_LIMPO }, apoios: { previsivel: false, focoCurto: false, leituraReforco: false, calmo: false },
    jaSabe: { letrasDoNome: 'nao', lePalavras: 'nao', leFrases: 'nao' }, consentimentos: { responsavel: true, vozPrimeiroNome: true, gravarVozAdulto: false, em: AGORA },
    rotina: { minutosDia: 15, horaDormir: '20:00' }, criadoEm: AGORA
  } as unknown as Crianca;
  const progresso = progressoInicial(ID, AGORA);
  progresso.moedinhas = { saldo: 30, total: 30, porDia: {} };
  progresso.desafios = 6; progresso.sessoesFeitas = 2;
  for (const [id, nivel] of GANHAS) progresso.conquistas[id] = g(id, nivel);
  return { crianca, progresso };
}
const repo = criarRepositorio();
function Semear() {
  const [ok, setOk] = useState(false);
  useEffect(() => { const d = dados(); void repo.salvarCrianca(d.crianca).then(() => repo.salvarProgresso(d.progresso)).then(() => setOk(true)); }, []);
  return ok ? <p data-pronto="semear">Dados de teste gravados: abra /#/c/{ID}/album</p> : null;
}
function TelaRitual({ quantos }: { quantos: number }) {
  const d = dados();
  const fase = FASE_POR_ID['AL-A'] ?? Object.values(FASE_POR_ID)[0];
  const novas = (quantos > 1 ? ['S-LETRA-A', 'S-R0-10', 'S-R0-01', 'TI-R0-01'] : ['S-LETRA-A']).slice(0, quantos).map((i) => d.progresso.conquistas[i]);
  const relatorio: RelatorioSessao = { faseId: fase.id, atividades: 6, moedinhas: 10, moedinhasCalculadas: 10, dominadasAgora: [], faseConcluida: true, conquistasNovas: novas, surpresas: SURPRESAS.slice(0, 1), nivelAntes: 0, nivelDepois: 0, termometroAntes: 0, termometroDepois: 0 };
  return <div data-pronto="ritual"><ProvedorApp repo={repo}><Ritual crianca={d.crianca} progresso={d.progresso} relatorio={relatorio} fase={fase} expressa={false} /></ProvedorApp></div>;
}

declare global { interface Window { __nomes?: (nomes: string[]) => Promise<unknown> } }
window.__nomes = async (nomes: string[]) => {
  await fontePronta();
  const ctx = document.createElement('canvas').getContext('2d')!;
  const formas: Forma[] = ['estrela', 'escudo', 'medalha', 'hexagono'];
  let pior = { nome: '', forma: '', sobra: Infinity, fs: 0, linhas: 0 };
  let menorFs = { nome: '', forma: '', fs: Infinity, linhas: 0 };
  let estouros = 0; let duas = 0;
  for (const nome of nomes) for (const f of formas) {
    const a = ajustarNome(ctx, nome, f);
    const sobra = a.disponivel - a.largura;
    if (sobra < -0.01 || a.fs * a.linhas.length * 1.04 > a.altura * 0.86) estouros++;
    if (f === 'medalha' && a.linhas.length > 1) duas++;
    if (sobra < pior.sobra) pior = { nome, forma: f, sobra, fs: a.fs, linhas: a.linhas.length };
    if (a.fs < menorFs.fs) menorFs = { nome, forma: f, fs: a.fs, linhas: a.linhas.length };
  }
  return { nomes: nomes.length, estouros, duasLinhas: duas, pior, menorFs };
};

function Bancada() {
  const qual = location.hash.replace('#', '') || 'todos';
  if (qual.startsWith('ritual')) return <TelaRitual quantos={Number(qual.slice(6)) || 1} />;
  if (qual === 'semear') return <Semear />;
  if (qual.startsWith('mini-')) return <Mini qual={qual.slice(5).replace('-recorte', '') as QualModelo} semSombra={qual.endsWith('-recorte')} />;
  return (
    <main className="b-selos">
      <style>{`body{margin:0;background:radial-gradient(120% 90% at 50% 0%,#2C4C94,#16285A 60%,#0E1C44)}
        .b-selos{min-height:100vh;padding:18px 22px;color:#fff;font-family:Fredoka,sans-serif}
        .b-selos h1{font-size:26px;margin:0 0 10px;color:#FFE08A}
        .b-grade{display:grid;gap:8px 6px;justify-items:center;align-items:end;margin-bottom:16px}
        .b-grade figure{margin:0;text-align:center}.b-grade figcaption{font-size:13px;color:#BFD3F5;margin-top:2px}
        .b-grade .selo-nome{display:none}`}</style>
      {qual === 'metais' || qual === 'todos' ? <><h1>4 formatos × 4 metais (+ bloqueado e mistério)</h1><Metais /></> : null}
      {qual === 'doze' || qual === 'todos' ? <><h1>12 selos do catálogo (nomes curtos e longos)</h1><Doze /></> : null}
      {qual === 'angulos' || qual === 'todos' ? <><h1>Giro 360°: 0°, 45°, 90°, 135° e 180° (frente, borda e verso)</h1><Angulos /></> : null}
      {qual === 'celebracao' ? <><h1>Fim da fase: entra grande, girando, um por vez</h1><Celebracao /></> : null}
      {qual === 'premios' || qual === 'todos' ? <><h1>Moeda, troféu, baú e porquinho</h1><Premios /></> : null}
    </main>
  );
}

void formaDoSelo;
createRoot(document.getElementById('raiz')!).render(<Bancada />);
