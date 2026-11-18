import type { ReactNode } from 'react';
import { efeitos } from '../servicos/efeitos.ts';
import './botao-ouvindo.css';

/**
 * Botão de AVANÇO das telas em que ESCUTAR é a própria atividade (apresentação da letra, som novo, Espelho do Som,
 * página da história): enquanto a dupla fala, o botão NÃO fica apagado/desbotado (parecia quebrado; revisão 18/11, item 7):
 * fica com a cor normal, uma ondinha animada e "Ouvindo…". Tocar nele aí só dá um toque suave (nada se perde). Quando a
 * escuta acaba, vira o botão de sempre.
 * Nas outras telas o avanço não espera a voz: libera logo e tocar nele corta a fala com fade (servicos/canal-audio.ts).
 */
export function BotaoOuvindo({ ouvindo, onClick, disabled, className = 'btn grande verde', testId, children }: {
  ouvindo: boolean; onClick: () => void; disabled?: boolean; className?: string; testId?: string; children: ReactNode;
}) {
  if (ouvindo) {
    return (
      <button className={`${className} btn-ouvindo`} aria-disabled="true" data-testid={testId} data-ouvindo="1" onClick={() => efeitos.suave()}>
        <span className="ouvindo-onda" aria-hidden="true"><i /><i /><i /><i /></span>Ouvindo…
      </button>
    );
  }
  return <button className={className} onClick={onClick} disabled={disabled} data-testid={testId}>{children}</button>;
}
