import { useEffect, useRef, useState } from 'react';
import { LETRA_POR_ID, type AtividadeLetra } from '@fonema/conteudo';
import { infoNome } from '@fonema/motor';
import { Balao, Brilho } from '../componentes/basicos.tsx';
import { Figura, Icone } from '../componentes/ui.tsx';
import { efeitos } from '../servicos/efeitos.ts';
import { espera } from '../servicos/ambiente.ts';
import { voz } from '../servicos/voz.ts';
import { falar, textoVoz } from '../util.ts';
import { tentativa, type PropsMecanica } from './comum.tsx';

const NOTA: Record<string, { icone: string; texto: string }> = {
  'outro-som': { icone: 'dica', texto: 'Esta letra tem outro som, que vem depois.' },
  nomes: { icone: 'estrela', texto: 'Esta letra aparece em nomes.' },
  muda: { icone: 'boca', texto: 'O H não faz som sozinho.' },
  'com-u': { icone: 'coracao', texto: 'O Q vem sempre com o U.' }
};

/**
 * TRILHA DO ALFABETO (D027) · a tela da letra: maiúscula e minúscula bem grandes, a palavra-exemplo com figura
 * ("A, de abelha.") e, quando há, o aviso curto da letra (outro som depois, letra de nomes, H mudo, Q com U).
 * A dupla fala em sequência; os blocos da tela acendem junto com cada fala. Sem certo ou errado: é apresentação.
 */
export function Letra({ atividade, crianca, sessao, cenaId, onFim }: PropsMecanica<AtividadeLetra>) {
  const l = LETRA_POR_ID[atividade.letra];
  const [passo, setPasso] = useState(-1);
  const [pronto, setPronto] = useState(false);
  const [feito, setFeito] = useState(false);
  const vivo = useRef(true);
  const doNome = infoNome(crianca.nome, crianca.pronuncia.grafia).nome.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().startsWith(l.letra);

  const apresentar = async () => {
    setPasso(-1);
    await falar(atividade.enunciado, crianca);
    for (let i = 0; i < atividade.falas.length; i++) {
      if (!vivo.current) return;
      setPasso(i);
      await voz.falar(textoVoz(atividade.falas[i].texto, crianca), { quem: atividade.falas[i].quem });
      await espera(250);
    }
    if (vivo.current) { setPasso(99); setPronto(true); }
  };

  useEffect(() => {
    vivo.current = true;
    apresentar();
    return () => { vivo.current = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const continuar = async () => {
    setFeito(true);
    efeitos.acerto();
    await espera(500);
    onFim({ tentativas: [tentativa(atividade.habilidade, sessao, cenaId, 0)], tentouDeNovo: 0 });
  };

  // passos: 0 = "Letra B." · 1 = "Tem a grande e a pequena." · 2 = "B, de bola." · 3 = aviso da letra
  const nota = l.nota ? NOTA[l.nota] : null;
  const resto = l.palavra.slice(1);
  return (
    <div className="mec mec-letra licao" data-letra={l.letra}>
      <Balao fala={passo >= 0 && passo < atividade.falas.length ? atividade.falas[passo] : atividade.enunciado} crianca={crianca} />
      <div className="letra-palco">
        <div className={`letra-dupla ${passo >= 0 ? 'acesa' : ''} ${passo === 1 ? 'pulando' : ''}`} role="img" aria-label={`Letra ${l.letra}: maiúscula e minúscula`} data-testid="letra-grande">
          <span className="letra-bloco maiuscula"><b>{l.letra}</b><small>grande</small></span>
          <span className="letra-bloco minuscula"><b>{l.minuscula}</b><small>pequena</small></span>
          {doNome ? <span className="letra-do-nome"><Icone nome="estrela" />A letra do seu nome!</span> : null}
        </div>
        <div className={`letra-exemplo ${passo >= 2 ? 'visivel' : ''}`} aria-hidden={passo < 2}>
          <Figura palavra={l.palavra} className="letra-figura" />
          <p className="letra-palavra"><b>{l.letra}</b>, de <span><em>{l.palavra[0]}</em>{resto}</span></p>
        </div>
      </div>
      {nota ? <p className={`letra-nota ${passo >= 3 ? 'visivel' : ''}`}><Icone nome={nota.icone} /><span>{nota.texto}</span></p> : null}
      <div className="linha-botoes">
        <button className="btn" onClick={apresentar}><Icone nome="som" />Ouvir de novo</button>
        <button className="btn grande verde" onClick={continuar} disabled={!pronto || feito} data-testid="conheci-a-letra"><Icone nome="check" />Já conheci!</button>
      </div>
      {feito ? <Brilho ativo /> : null}
    </div>
  );
}
