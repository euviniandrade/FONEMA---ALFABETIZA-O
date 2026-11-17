/**
 * PASSEIO 3D (D032 item 3): a criança anda pela vila em terceira pessoa com O PRÓPRIO boneco.
 *
 * O mundo é a página public/mundo3d/passeio.html (fonte: docs/propostas/06-fonema-unificada/mundo-3d-v2), em iframe,
 * carregada só quando a criança abre esta tela (fora do precache). Conversa por postMessage:
 *  - página → app: `fonema:ola` (pode mandar os dados), `fonema:pronto`, `fonema:entrar` {id da porta},
 *    `fonema:falar` {falas roteirizadas já gravadas}, `fonema:parar`.
 *  - app → página: `fonema:init` {nome, primeiraMissao, menosMovimento, lugares: estado de cada porta} e
 *    `fonema:boneco` {id, pacote} — o avatar da criança e os outros bonecos, montados aqui (avatar3d/pacote.ts).
 * Cada porta leva a algo que JÁ existe no app; as trancadas dizem o que falta (mesmas regras e falas do Cantinho).
 */
import { useEffect, useRef, useState } from 'react';
import { BANCO, FALAS_BIBLIOTECA as B, type Fala } from '@fonema/conteudo';
import { estadoFluencia, palavrasParaEscrever, type Crianca, type Progresso } from '@fonema/motor';
import { useApp, useCrianca } from '../../contexto.tsx';
import { navegar } from '../../rotas.ts';
import { Carregando, Topo } from '../../componentes/basicos.tsx';
import { mundo3dDisponivel, asset } from '../../servicos/ambiente.ts';
import { voz } from '../../servicos/voz.ts';
import { falarVarias, textoTela } from '../../util.ts';
import { aparenciaDe, temWebGL, type Aparencia } from '../../avatar3d/index.ts';

interface EstadoLugar { aberto: boolean; falta?: string; fala?: Fala }

/** Para onde leva cada porta da vila (ids de js/passeio.js › LUGARES). */
export function destinosDoPasseio(criancaId: string, p: Progresso): Record<string, string> {
  const c = `c/${criancaId}`;
  return {
    escola: `${c}/fase/${p.faseAtual}`,
    biblioteca: `${c}/leitura`,
    campinho: `${c}/brincar`,
    padaria: `${c}/lojinha`,
    casa: `${c}/leitura/escrita`,
    coreto: `${c}/leitura/fluencia`
  };
}

/** Quais portas estão abertas e, nas trancadas, o que falta (as mesmas regras do Cantinho da Leitura). */
export function lugaresDoPasseio(p: Progresso): Record<string, EstadoLugar> {
  const flu = estadoFluencia(p, BANCO);
  const escrita = palavrasParaEscrever(p, BANCO).length > 0;
  return {
    escola: { aberto: true }, biblioteca: { aberto: true }, campinho: { aberto: true }, padaria: { aberto: true },
    casa: escrita ? { aberto: true } : { aberto: false, falta: 'Abre depois do som do M, na Trilha dos Sons.', fala: B.escTrancada },
    coreto: flu.liberada ? { aberto: true } : {
      aberto: false,
      falta: flu.motivo === 'precisao' ? 'Abre quando você ler as palavras da trilha quase sem errar.' : 'Abre quando você já tiver lido mais palavras.',
      fala: B.fluTrancada
    },
    barco: { aberto: false, falta: 'Em breve na Lojinha!' }
  };
}

/** Crianças da vila: o mesmo modelo do avatar, recolorido (sem a letra A mudar). */
const VIZINHOS: { id: string; a: Aparencia }[] = [
  { id: 'crianca-1', a: { sexo: 'f', modelo: 'menina-padrao', pele: '#8D5A3B', olhos: null, cabelo: '#1E140E', camisa: '#E58AA6', calca: '#2E4374', calcado: '#F2B33D', acessibilidade: [] } },
  { id: 'crianca-2', a: { sexo: 'm', modelo: 'menino-padrao', pele: '#E8B996', olhos: '#3D6E9C', cabelo: '#C7883A', camisa: '#7BC97F', calca: '#5E8FB8', calcado: '#C8643B', acessibilidade: [] } }
];
/** Personagens com GLB próprio e o giro que os põe de frente para +Z. */
const PERSONAGENS: { id: string; arquivo: string; giro: number }[] = [
  { id: 'sofia', arquivo: 'sofia.glb', giro: -Math.PI / 2 },
  { id: 'tales', arquivo: 'tales.glb', giro: -Math.PI / 2 },
  { id: 'bolota', arquivo: 'bolota.glb', giro: -Math.PI / 2 }
];

export function Passeio3D({ criancaId }: { criancaId: string }) {
  const { crianca, progresso } = useCrianca(criancaId);
  const { prefs } = useApp();
  const [ok, setOk] = useState<boolean | null>(null);
  const ref = useRef<HTMLIFrameElement>(null);
  const dados = useRef<{ crianca?: Crianca; progresso?: Progresso }>({});
  dados.current = { crianca, progresso };

  useEffect(() => { mundo3dDisponivel().then(setOk); }, []);
  useEffect(() => { if (ok === false) navegar(`c/${criancaId}/vila`); }, [ok, criancaId]);
  useEffect(() => () => voz.parar(), []);

  // estado entre renderizações: o "olá" da página chega uma vez só; os bonecos vão uma vez só
  const iniciado = useRef(false);
  const vivo = useRef(true);
  useEffect(() => () => { vivo.current = false; }, []);
  const menos = prefs.menosMovimento;

  useEffect(() => {
    if (!crianca || !progresso) return;
    const janela = () => ref.current?.contentWindow ?? null;
    const enviar = (tipo: string, detalhe: unknown, transf: Transferable[] = []) => janela()?.postMessage({ tipo, detalhe }, '*', transf);

    async function mandarBonecos(c: Crianca) {
      if (!temWebGL()) return;
      const m = await import('../../avatar3d/pacote.ts');
      const pedir = async (id: string, f: () => ReturnType<typeof m.pacoteDoBoneco>) => {
        try {
          const p = await f();
          if (p && vivo.current) enviar('fonema:boneco', { id, pacote: p }, m.transferiveis(p));
        } catch (e) { console.warn('[passeio] boneco não montou', id, e); }
      };
      // primeiro o da criança (é o que ela vê na frente), depois os outros
      await pedir('crianca', () => m.pacoteDoBoneco(aparenciaDe(c)));
      for (const p of PERSONAGENS) if (vivo.current) await pedir(p.id, () => m.pacoteDoModelo(asset(`modelos3d/${p.arquivo}`), p.giro));
      for (const v of VIZINHOS) if (vivo.current) await pedir(v.id, () => m.pacoteDoBoneco(v.a));
    }

    const ouvir = (e: MessageEvent) => {
      if (e.source !== janela()) return;
      const d = e.data as { tipo?: string; detalhe?: Record<string, unknown> };
      if (!d || typeof d !== 'object') return;
      const { crianca: c, progresso: p } = dados.current;
      if (!c || !p) return;
      if (d.tipo === 'fonema:ola' && !iniciado.current) {
        iniciado.current = true;
        enviar('fonema:init', { nome: textoTela('[NOME]', c), primeiraMissao: !p.sessoesFeitas, menosMovimento: menos, lugares: lugaresDoPasseio(p) });
        void mandarBonecos(c);
      }
      if (d.tipo === 'fonema:pronto') ref.current?.focus();
      if (d.tipo === 'fonema:falar') {
        const falas = (d.detalhe?.falas as Fala[] | undefined) ?? [];
        voz.parar();
        if (falas.length) void falarVarias(falas, c);
      }
      if (d.tipo === 'fonema:parar') voz.parar();
      if (d.tipo === 'fonema:entrar') {
        const id = String(d.detalhe?.id ?? '');
        const st = lugaresDoPasseio(p)[id];
        const rota = destinosDoPasseio(c.id, p)[id];
        if (rota && st?.aberto) { voz.parar(); navegar(rota); }
      }
    };
    window.addEventListener('message', ouvir);
    return () => window.removeEventListener('message', ouvir);
  }, [crianca, progresso, menos]);

  if (!crianca || !progresso || ok === null) return <Carregando />;
  if (!ok) return null;
  return (
    <div className="tela-mundo3d" data-testid="passeio3d">
      <Topo crianca={crianca} voltar={`c/${criancaId}/vila`} titulo="Passeio pela vila" />
      <iframe ref={ref} className="mundo3d" src="./mundo3d/passeio.html" title="Passeio pela Vila das Letras" allow="autoplay; fullscreen" data-testid="passeio3d-iframe" />
      <p className="sr">{textoTela('Passeie pela vila, [NOME]!', crianca)}</p>
    </div>
  );
}
