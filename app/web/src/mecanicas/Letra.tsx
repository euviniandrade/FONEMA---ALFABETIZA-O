import { useEffect, useRef, useState } from 'react';
import { CENAS_DO_SOM, LETRA_POR_ID, PALAVRAS_SEM_VOZ, type AtividadeLetra } from '@fonema/conteudo';
import { infoNome } from '@fonema/motor';
import { Balao, Brilho } from '../componentes/basicos.tsx';
import { Figura, Icone, caminhoFigura } from '../componentes/ui.tsx';
import { efeitos } from '../servicos/efeitos.ts';
import { espera } from '../servicos/ambiente.ts';
import { voz } from '../servicos/voz.ts';
import { falar, textoVoz } from '../util.ts';
import { tentativa, type PropsMecanica } from './comum.tsx';

const NOTA: Record<string, { icone: string; texto: string }> = {
  'outro-som': { icone: 'dica', texto: 'Esta letra tem outro som, que vem depois.' },
  'dois-sons': { icone: 'boca', texto: '' },
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
  const [palavra, setPalavra] = useState(-1);
  const vivo = useRef(true);
  const inicio = useRef(Date.now());
  const doNome = infoNome(crianca.nome, crianca.pronuncia.grafia).nome.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().startsWith(l.letra);

  /** Uma fala da dupla; devolve false se a tela já saiu. */
  const diz = async (f: { texto: string; quem: 'sofia' | 'tales' | string } | undefined, p: number) => {
    if (!f || !vivo.current) return vivo.current;
    setPasso(p);
    await voz.falar(textoVoz(f.texto, crianca), { quem: f.quem as never });
    await espera(250);
    return vivo.current;
  };

  /**
   * Ordem (D029 §2, pesquisa 45): "Letra B." → grande e pequena → faz de conta → SOM REAL (3 vezes, devagar) →
   * "Repita comigo!" + o som + pausa para a criança → "B, de bola." com as três palavras → aviso da letra →
   * segundo som, quando a letra tem dois. Sem som real para a letra (ou H), fica a apresentação antiga.
   */
  const apresentar = async () => {
    setPasso(-1); setPalavra(-1);
    const fs = atividade.falas;
    const temSom = !!l.fonema && (await voz.temSomReal(l.fonema));
    await falar(atividade.enunciado, crianca);
    if (!(await diz(fs[0], 0))) return;
    if (!(await diz(fs[1], 1))) return;
    if (atividade.brincadeira && (temSom || !l.fonema)) { if (!(await diz(atividade.brincadeira, 10))) return; }
    if (temSom && l.fonema) {
      setPasso(11);
      await voz.somReal(l.fonema, l.tipo === 'vogal' ? 2 : 3);
      await espera(350);
      if (!(await diz(atividade.repita, 12))) return;
      setPasso(11);
      await voz.somReal(l.fonema, 1);
      setPasso(13);
      await espera(1800); // a vez da criança
      if (!vivo.current) return;
    }
    if (!(await diz(fs[2], 2))) return;
    // as três palavras, uma a uma, na voz da Sofia (só as que têm clipe)
    for (let k = 1; k < l.palavras.length && vivo.current; k++) {
      setPalavra(k);
      if (!PALAVRAS_SEM_VOZ.includes(l.palavras[k]) && voz.temTodas([l.palavras[k]], 'sofia')) await voz.falar(l.palavras[k], { quem: 'sofia' }); else await espera(700);
      await espera(200);
    }
    if (fs[3] && !(await diz(fs[3], 3))) return;
    if (l.segundoFonema && (await voz.temSomReal(l.segundoFonema))) { setPasso(14); await voz.somReal(l.segundoFonema, 2); await espera(300); }
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
    // apresentação: é EXPOSIÇÃO (D030 §9), não resposta avaliada
    onFim({ tentativas: [tentativa(atividade.habilidade, sessao, cenaId, 0, { tipo: 'exposicao', mecanica: 'letra', alvo: l.letra, categoria: 'grafema', tempoMs: Date.now() - inicio.current, tentativaNumero: 1 })], tentouDeNovo: 0 });
  };

  // passos: 0 = "Letra B." · 1 = "Tem a grande e a pequena." · 2 = "B, de bola." · 3 = aviso da letra
  const nota = l.nota ? { ...NOTA[l.nota], texto: l.segundoSom ? `Esta letra tem dois sons: o de ${l.palavra} e o de ${l.segundoSom.palavra}.` : NOTA[l.nota].texto } : null;
  const resto = l.palavra.slice(1);
  return (
    <div className="mec mec-letra licao" data-letra={l.letra}>
      <Balao fala={passo >= 0 && passo < atividade.falas.length ? atividade.falas[passo] : passo === 10 && atividade.brincadeira ? atividade.brincadeira : passo >= 11 && passo <= 13 && atividade.repita ? atividade.repita : atividade.enunciado} crianca={crianca} />
      <div className="letra-palco">
        <div className={`letra-dupla ${passo >= 0 ? 'acesa' : ''} ${passo === 1 ? 'pulando' : ''}`} role="img" aria-label={`Letra ${l.letra}: maiúscula e minúscula`} data-testid="letra-grande">
          <span className="letra-bloco maiuscula"><b>{l.letra}</b><small>grande</small></span>
          <span className="letra-bloco minuscula"><b>{l.minuscula}</b><small>pequena</small></span>
          {doNome ? <span className="letra-do-nome"><Icone nome="estrela" />A letra do seu nome!</span> : null}
        </div>
        <div className={`letra-exemplo ${passo >= 2 && passo < 10 || passo === 99 || passo === 14 ? 'visivel' : ''}`} aria-hidden={passo < 2}>
          <Figura palavra={l.palavra} className="letra-figura" />
          <p className="letra-palavra"><b>{l.letra}</b>, de <span><em>{l.palavra[0]}</em>{resto}</span></p>
          <ul className="letra-tres" aria-label="Outras palavras com esta letra">
            {l.palavras.slice(1).map((w, k) => (
              <li key={w} className={palavra >= k + 1 || passo === 99 ? 'visivel' : ''}>
                {caminhoFigura(undefined, w) ? <Figura palavra={w} className="letra-tres-fig" /> : null}
                <span><em>{w[0]}</em>{w.slice(1)}</span>
              </li>
            ))}
          </ul>
        </div>
        {passo >= 10 && passo <= 13 ? (
          <div className="letra-som" data-testid="letra-som" aria-live="polite">
            {/* a CENA do som (Liga o som): a figura do faz de conta aparece junto, e é ela que a criança vai ligar à letra */}
            {CENAS_DO_SOM[l.letra] && caminhoFigura(undefined, CENAS_DO_SOM[l.letra]) ? <Figura palavra={CENAS_DO_SOM[l.letra]} className="letra-cena" /> : null}
            <span className={`letra-som-onda ${passo === 11 ? 'tocando' : ''}`}><Icone nome="som" /></span>
            <p>{passo === 10 ? 'Faz de conta…' : passo === 13 ? 'Sua vez! Faça o som.' : passo === 12 ? 'Repita comigo!' : 'Escute o som da letra'}</p>
          </div>
        ) : null}
      </div>
      {nota ? <p className={`letra-nota ${passo >= 3 ? 'visivel' : ''}`}>{l.segundoSom ? <Figura palavra={l.segundoSom.palavra} className="letra-nota-fig" /> : <Icone nome={nota.icone} />}<span>{nota.texto}</span></p> : null}
      <div className="linha-botoes">
        <button className="btn" onClick={apresentar}><Icone nome="som" />Ouvir de novo</button>
        <button className="btn grande verde" onClick={continuar} disabled={!pronto || feito} data-testid="conheci-a-letra"><Icone nome="check" />Já conheci!</button>
      </div>
      {feito ? <Brilho ativo /> : null}
    </div>
  );
}
