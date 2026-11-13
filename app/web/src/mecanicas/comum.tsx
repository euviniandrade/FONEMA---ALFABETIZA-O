import type { Atividade } from '@fonema/conteudo';
import type { Crianca, Tentativa } from '@fonema/motor';

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

export function tentativa(habilidade: string, sessao: string, cena: string, erros: number, extra: Partial<Tentativa> = {}): Tentativa {
  return { em: Date.now(), sessao, habilidade, acertou: erros === 0, comAjuda: erros > 0, cena, ...extra };
}

export function Progressinho({ atual, total }: { atual: number; total: number }) {
  return (
    <div className="progressinho" aria-label={`Item ${Math.min(atual + 1, total)} de ${total}`}>
      {Array.from({ length: total }, (_, i) => <i key={i} className={i < atual ? 'feito' : i === atual ? 'agora' : ''} />)}
    </div>
  );
}
