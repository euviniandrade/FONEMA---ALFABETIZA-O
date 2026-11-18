/**
 * D034 · desbloqueio progressivo na tela: o selo "Novo!" (o que abriu e a criança ainda não visitou), o "o que falta" de quem está
 * fechado (cadeado + bolinhas das missões que faltam ou barrinha) e o painel "Abriu!" do fim da missão.
 *
 * "Visto" fica no aparelho (localStorage), não no progresso: assim tocar num cartão não disputa gravação com o jogo que abre em
 * seguida (o progresso guarda só o que abriu: `Progresso.novidades`, preenchido por `fecharSessao`).
 */
import { useEffect, useMemo, useRef, type CSSProperties } from 'react';
import { abriuParaMostrar, missoesAteAbrir, textoMissoes, type Extra, type Progresso } from '@fonema/motor';
import { Figura, Icone } from './ui.tsx';
import '../estilos-desbloqueio.css';
import { letraAa } from './LetraAa.tsx';

const chave = (criancaId: string) => `fonema-visto:${criancaId}`;
function vistos(criancaId: string): string[] {
  try { return JSON.parse(localStorage.getItem(chave(criancaId)) || '[]') as string[]; } catch { return []; }
}

/** Marca como visto (tira o "Novo!") o extra e as variações dele. */
export function marcarVistoAqui(criancaId: string, prefixo: string) {
  try {
    const v = new Set(vistos(criancaId));
    v.add(prefixo);
    localStorage.setItem(chave(criancaId), JSON.stringify([...v]));
  } catch { /* sem armazenamento: o selo só continua aparecendo */ }
}

/** Há algo novo (aberto e não visitado) com este prefixo? ('jogo', 'jogo:corre-som', 'leitura', 'peca', 'som'…) */
export function ehNovo(p: Progresso, criancaId: string, prefixo: string): boolean {
  const v = vistos(criancaId);
  const visto = (id: string) => v.some((x) => id === x || id.startsWith(`${x}:`));
  return (p.novidades ?? []).some((id) => (id === prefixo || id.startsWith(`${prefixo}:`)) && !visto(id));
}

/** Selo "Novo!" (pisca uma vez e fica). */
export function SeloNovo({ className = '' }: { className?: string }) {
  return <span className={`selo-novo-d34 ${className}`} data-testid="selo-novo-extra">Novo!</span>;
}

/** Quantas missões faltam para cada extra fechado (calculado uma vez por estado das fases). */
export function useMissoesAteAbrir(p: Progresso | undefined): Record<string, number | null> {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => (p ? missoesAteAbrir(p) : {}), [p?.faseAtual, p && Object.values(p.fases).filter((f) => f.estado === 'concluida').length]);
}

/**
 * O que falta para abrir: cadeado, frase e bolinhas (uma por missão que falta, até 8) ou a barrinha do critério.
 * `n` = missões que faltam (de `missoesAteAbrir`); `barra` = feito/total quando o critério não é só de fases.
 */
export function Falta({ texto, n, barra, compacto }: { texto?: string; n?: number | null; barra?: Extra['barra']; compacto?: boolean }) {
  const missoes = textoMissoes(n);
  return (
    <span className={`falta-d34 ${compacto ? 'compacto' : ''}`} data-testid="falta" data-missoes={n ?? ''}>
      <span className="falta-linha"><Icone nome="cadeado" /><span>{missoes ?? texto ?? 'Abre logo, logo.'}</span></span>
      {n != null && n > 0 ? (
        <span className="falta-bolinhas" aria-label={missoes}>
          {Array.from({ length: Math.min(n, 8) }, (_, i) => <i key={i} />)}{n > 8 ? <b>+{n - 8}</b> : null}
        </span>
      ) : barra ? (
        <span className="falta-barra" role="progressbar" aria-valuemin={0} aria-valuemax={barra.total} aria-valuenow={Math.min(barra.feito, barra.total)} aria-label={`${barra.feito} de ${barra.total} ${barra.rotulo}`}>
          <i style={{ width: `${Math.min(100, (100 * barra.feito) / Math.max(1, barra.total))}%` }} />
          <small>{Math.min(barra.feito, barra.total)}/{barra.total}</small>
        </span>
      ) : null}
    </span>
  );
}

const ICONE_DO_GRUPO: Record<string, string> = { jogos: 'estrela', leitura: 'caderno', lojinha: 'lojinha' };
const FIGURA_DO_JOGO: Record<string, string> = { 'jogo:corre-som': 'bola', 'jogo:come-som': 'uva', 'jogo:memoria': 'estrela', 'jogo:estrada-pares': 'vaca', 'jogo:carteiro': 'mala', 'jogo:casa-som': 'pia', 'jogo:caca': 'mapa' };

/** Painel "Abriu!" do fim da missão: cada coisa nova com animação; tocar leva lá. */
export function PainelAbriu({ ids, sexo, criancaId, ir }: { ids: string[]; sexo?: string; criancaId: string; ir: (rota: string) => void }) {
  const itens = abriuParaMostrar(ids, sexo).slice(0, 6);
  const caixa = useRef<HTMLDivElement>(null);
  // aparece à vista (no celular o ritual é comprido)
  useEffect(() => { caixa.current?.scrollIntoView?.({ behavior: 'smooth', block: 'center' }); }, []);
  if (!itens.length) return null;
  return (
    <div className="abriu-d34" data-testid="abriu" role="status" ref={caixa}>
      <h2 className="t"><Icone nome="estrela" />Abriu!</h2>
      <div className="abriu-grade">
        {itens.map((x, k) => {
          const letra = x.id.startsWith('som:') ? x.id.slice(4) : null;
          const fig = FIGURA_DO_JOGO[x.id];
          return (
            <button key={x.id} className={`abriu-item grupo-${x.grupo}`} style={{ ['--k' as string]: k } as CSSProperties} data-abriu={x.id}
              onClick={() => { marcarVistoAqui(criancaId, x.id); ir(`c/${criancaId}/${x.rota}`); }}>
              <span className="abriu-fig" aria-hidden="true">{letra ? <b className="abriu-letra">{letraAa(letra)}</b> : fig ? <Figura palavra={fig} /> : <Icone nome={ICONE_DO_GRUPO[x.grupo]} />}</span>
              <span className="abriu-nome">{x.nome}</span>
              <SeloNovo />
            </button>
          );
        })}
      </div>
    </div>
  );
}
