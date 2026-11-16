/**
 * ESCREVER DO MEU JEITO, com confronto (docs/pedagogia/04 N13; 02 ESC-PRO-01; ABC p. 262, 421–423; SOA p. 122–123).
 *  1. A Sofia mostra uma figura e diz o nome. A criança escreve com as letras móveis do jeito dela: o alfabeto inteiro,
 *     sem modelo, sem conferência letra a letra, sem "errado".
 *  2. "Pronto": a escrita dela aparece em cima e a forma certa embaixo, alinhadas letra a letra. O que é igual ganha uma
 *     estrelinha; onde FALTOU um som, a casa fica tracejada e a Sofia aponta: "Aqui tem mais um som" + o SOM real da letra
 *     + "esse som se escreve com esta letra". Letra a mais fica em cinza ("não aparece nesta palavra"). Nada em vermelho.
 *  3. Pode reescrever SEM o modelo (a forma certa some): refazer em vez de copiar (ABC p. 421–423).
 * Não conta para domínio (mostra o nível): fica guardado para o adulto ver, ao lado da forma certa.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { FALAS_BIBLIOTECA as B, comSons, nomeDaFigura } from '@fonema/conteudo';
import { alinharEscrita, type CasaAlinhada, type Crianca } from '@fonema/motor';
import { Balao, Brilho } from '../componentes/basicos.tsx';
import { Figura, Icone } from '../componentes/ui.tsx';
import { espera, modoTeste } from '../servicos/ambiente.ts';
import { efeitos } from '../servicos/efeitos.ts';
import { voz } from '../servicos/voz.ts';
import { useFala } from './livre-comum.tsx';

const ALFABETO = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export function EscritaPropria({ palavra, figura, crianca, onFim }: {
  palavra: string; figura: string; crianca: Crianca; onFim: (r: { escritas: { escrito: string; vez: 1 | 2 }[] }) => void;
}) {
  const { fala, diz } = useFala(crianca, B.escAbre);
  const [letras, setLetras] = useState<string[]>([]);
  const [etapa, setEtapa] = useState<'escrever' | 'comparar' | 'feito'>('escrever');
  const [vez, setVez] = useState<1 | 2>(1);
  const [ocupado, setOcupado] = useState(true);
  const [apontada, setApontada] = useState<number | null>(null);
  const escritas = useRef<{ escrito: string; vez: 1 | 2 }[]>([]);
  const vivo = useRef(true);
  const certo = palavra.toUpperCase();
  const sons = useMemo(() => comSons(palavra).sons, [palavra]);
  const alinhado: CasaAlinhada[] = useMemo(() => (etapa === 'escrever' ? [] : alinharEscrita(letras.join(''), certo)), [etapa, letras, certo]);

  const dizerPalavra = () => voz.falar(nomeDaFigura(figura), { quem: 'sofia' });
  useEffect(() => {
    vivo.current = true;
    (async () => { await diz(B.escAbre); await dizerPalavra(); setOcupado(false); })();
    return () => { vivo.current = false; voz.parar(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const por = (l: string) => { if (ocupado || etapa !== 'escrever' || letras.length >= 10) return; efeitos.toque(); setLetras((x) => [...x, l]); };
  const apagar = () => { if (ocupado || !letras.length) return; efeitos.suave(); setLetras((x) => x.slice(0, -1)); };

  const pronto = async () => {
    if (ocupado || !letras.length) return;
    setOcupado(true);
    escritas.current.push({ escrito: letras.join(''), vez });
    setEtapa('comparar');
    efeitos.acerto();
    const casas = alinharEscrita(letras.join(''), certo);
    await diz(B.escCompara);
    await dizerPalavra();
    if (casas.every((c) => c.tipo === 'igual')) { await diz(B.escIgual); setEtapa('feito'); setOcupado(false); return; }
    // a Sofia aponta o primeiro som que faltou (ou veio trocado): o SOM real e a letra que escreve esse som
    const k = casas.findIndex((c) => c.tipo === 'faltou' || c.tipo === 'trocou');
    if (k >= 0) {
      const c = casas[k];
      setApontada(k);
      const som = c.pos !== undefined ? sons[c.pos] : null;
      await diz(B.escFaltou);
      if (som) await voz.somReal(som, 2);
      await diz(B.escFaltouLetra);
      await espera(modoTeste() ? 10 : 400);
    } else if (casas.some((c) => c.tipo === 'sobrou')) {
      setApontada(casas.findIndex((c) => c.tipo === 'sobrou'));
      await diz(B.escSobrou);
    }
    if (vez === 1 && vivo.current) await diz(B.escDeNovo);
    setOcupado(false);
  };

  const deNovo = async () => {
    setLetras([]); setApontada(null); setVez(2); setEtapa('escrever'); setOcupado(true);
    await dizerPalavra();
    setOcupado(false);
  };

  return (
    <div className="mec mec-escrita" data-testid="escrita-propria" data-etapa={etapa} data-palavra={palavra}>
      <Balao fala={fala} crianca={crianca} />
      <div className="escrita-topo">
        <button className="escrita-figura" onClick={() => { efeitos.toque(); void dizerPalavra(); }} disabled={ocupado} aria-label="Ouvir o nome da figura">
          <Figura palavra={figura} />
          <span className="escuta-ouvir"><Icone nome="som" /></span>
        </button>
        {etapa === 'escrever' ? (
          <div className="escrita-linha" aria-label="O que você escreveu" data-testid="escrita-linha">
            {letras.length ? letras.map((l, k) => <b key={k} className="escrita-letra">{l}</b>) : <span className="escrita-vazia">Toque nas letras</span>}
            <i className="escrita-cursor" aria-hidden="true" />
          </div>
        ) : (
          <div className="escrita-confronto" data-testid="escrita-confronto">
            <div className="confronto-fila"><small>Você escreveu</small>
              <div className="confronto-casas">{alinhado.map((c, k) => (
                <span key={k} className={`casa c-${c.tipo} ${apontada === k ? 'apontada' : ''}`}>{c.escrita ?? ''}</span>
              ))}</div>
            </div>
            <div className="confronto-fila certa"><small>Assim se escreve</small>
              <div className="confronto-casas">{alinhado.map((c, k) => (
                <span key={k} className={`casa c-${c.tipo} ${apontada === k ? 'apontada' : ''}`}>{c.certa ?? ''}{c.tipo === 'igual' ? <i className="casa-estrela"><Icone nome="estrela" /></i> : null}</span>
              ))}</div>
            </div>
            {etapa === 'feito' ? <Brilho ativo /> : null}
          </div>
        )}
      </div>
      {etapa === 'escrever' ? (
        <>
          <div className="pecas escrita-teclado" role="group" aria-label="Letras móveis">
            {ALFABETO.map((l) => <button key={l} className="peca" onClick={() => por(l)} disabled={ocupado} data-letra={l} aria-label={`Letra ${l}`}>{l}</button>)}
          </div>
          <div className="linha-botoes centro">
            <button className="btn" onClick={apagar} disabled={ocupado || !letras.length}><Icone nome="apagar" />Apagar</button>
            <button className="btn grande verde" onClick={() => void pronto()} disabled={ocupado || !letras.length} data-testid="escrita-pronto"><Icone nome="check" />Pronto!</button>
          </div>
        </>
      ) : (
        <div className="linha-botoes centro">
          {vez === 1 && etapa === 'comparar' ? <button className="btn grande" onClick={() => void deNovo()} disabled={ocupado} data-testid="escrita-de-novo"><Icone nome="repetir" />Escrever de novo</button> : null}
          <button className="btn grande ipe" onClick={() => onFim({ escritas: escritas.current })} disabled={ocupado} data-testid="escrita-fim"><Icone nome="check" />Terminar</button>
        </div>
      )}
    </div>
  );
}
