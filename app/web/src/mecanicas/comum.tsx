import type { Atividade } from '@fonema/conteudo';
import type { Crianca, Tentativa } from '@fonema/motor';
import { modoTeste } from '../servicos/ambiente.ts';
import { ehDeterminista } from '../util.ts';

export interface ResultadoMecanica {
  tentativas: Tentativa[];
  tentouDeNovo: number;
  extras?: Record<string, number>;
}

export interface PropsMecanica<A extends Atividade> {
  atividade: A;
  crianca: Crianca;
  sessao: string;
  cenaId: string;
  revisao?: boolean;
  onFim: (r: ResultadoMecanica) => void;
}

/**
 * Uma tentativa = um item respondido. `extra` leva o detalhe do contrato do motor (D030 etapa 2):
 * `tipo`, `mecanica`, `alvo`, `categoria`, `escolhido`, `respostas`, `distratores`, `tempoMs`, `tentativaNumero`.
 */
export function tentativa(habilidade: string, sessao: string, cena: string, erros: number, extra: Partial<Tentativa> = {}): Tentativa {
  return { em: Date.now(), sessao, habilidade, acertou: erros === 0, comAjuda: erros > 0, cena, ...extra };
}

/** Semente da tentativa da atividade: muda a cada vez que a tela abre (no modo de teste é fixa: nada muda de lugar). */
export function sementeDaTentativa(): number {
  return modoTeste() ? 0 : 1 + Math.floor(Math.random() * 233279);
}
/** Sorteia a ordem (D030 §4). Semente 0 = ordem do conteúdo (modo de teste, determinístico). */
export function embaralhar<T>(lista: T[], semente: number): T[] {
  return semente ? ehDeterminista(lista, semente) : [...lista];
}
/** Banco maior que a rodada: escolhe `n` itens (sorteados com a semente; no modo de teste, os primeiros). */
export function sortearItens<T>(lista: T[], n: number | undefined, semente: number): T[] {
  if (!n || n >= lista.length) return lista;
  return embaralhar(lista, semente).slice(0, n);
}

export function Progressinho({ atual, total }: { atual: number; total: number }) {
  return (
    <div className="progressinho" aria-label={`Item ${Math.min(atual + 1, total)} de ${total}`}>
      {Array.from({ length: total }, (_, i) => <i key={i} className={i < atual ? 'feito' : i === atual ? 'agora' : ''} />)}
    </div>
  );
}
