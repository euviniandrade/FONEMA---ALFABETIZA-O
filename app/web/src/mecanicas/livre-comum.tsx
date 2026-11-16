/**
 * Peças comuns do CANTINHO DA LEITURA e do BRINCAR COM SONS: opção de figura com o nome combinado (04 R10), palavra
 * escrita em que tocar toca os SONS (o caminho, não a palavra) e a fala da Sofia com o balão.
 */
import { useState } from 'react';
import { comSons, nomeDaFigura, type Fala, type Opcao } from '@fonema/conteudo';
import type { Crianca } from '@fonema/motor';
import { efeitos } from '../servicos/efeitos.ts';
import { voz } from '../servicos/voz.ts';
import { textoVoz } from '../util.ts';
import { tocarSonsEmendados } from './sons-emendados.ts';
import '../estilos-biblioteca.css';

/** Figura como opção: tocar no botãozinho fala o nome combinado da figura. */
export const opcaoFigura = (id: string): Opcao => ({ id, rotulo: nomeDaFigura(id), figura: id, falar: nomeDaFigura(id) });

export const falarFigura = (id: string) => voz.falar(nomeDaFigura(id), { quem: 'sofia' });

/** Fala da dupla com texto no balão: devolve a função e o estado da fala. */
export function useFala(crianca: Crianca, inicial: Fala) {
  const [fala, setFala] = useState<Fala>(inicial);
  const diz = async (f: Fala | string) => {
    const x: Fala = typeof f === 'string' ? { quem: 'sofia', texto: f } : f;
    setFala(x);
    await voz.falar(textoVoz(x.texto, crianca), { quem: x.quem });
  };
  return { fala, diz, setFala };
}

/** Palavras de um texto que a criança lê sozinha: tocar numa palavra toca os sons dela, um por um. */
export function TextoTocavel({ texto, acesa = -1, desligado, aoTocar, inicio = 0 }: {
  texto: string; acesa?: number; desligado?: boolean; aoTocar?: (palavra: string) => void; inicio?: number;
}) {
  const [tocando, setTocando] = useState<{ k: number; letra: number } | null>(null);
  const ws = texto.split(/\s+/);
  const tocar = async (w: string, k: number) => {
    const limpa = w.replace(/[.,!?:;…]/g, '');
    if (desligado || tocando || !limpa) return;
    let sons: (string | null)[];
    try { sons = comSons(limpa).sons; } catch { return; }
    efeitos.toque();
    aoTocar?.(limpa);
    setTocando({ k, letra: -1 });
    await tocarSonsEmendados(sons, 'separado', (letra) => setTocando({ k, letra }));
    setTocando(null);
  };
  return (
    <span className="texto-tocavel">
      {ws.map((w, k) => {
        const limpa = w.replace(/[.,!?:;…]/g, '');
        const pont = w.slice(w.indexOf(limpa) + limpa.length);
        const antes = w.slice(0, w.indexOf(limpa));
        const idx = inicio + k;
        return (
          <span key={k} className="tt-caixa">
            {antes}
            <button className={`tt-palavra ${acesa === idx ? 'acesa' : ''} ${tocando?.k === k ? 'tocando' : ''}`} onClick={() => void tocar(w, k)} disabled={desligado} aria-label={`Ouvir os sons de ${limpa}`} data-palavra={limpa.toLowerCase()}>
              {[...limpa].map((ch, j) => <span key={j} className={tocando?.k === k && tocando.letra === j ? 'letra-acesa' : ''}>{ch}</span>)}
            </button>
            {pont}
          </span>
        );
      })}
    </span>
  );
}

/** Opções escritas (palavras decodificáveis): tocar responde. A certa brilha só na 3ª tentativa (ajuda). */
export function OpcoesPalavra({ opcoes, correta, marcadas, acertou, ocupado, mostrarCerta, onEscolher }: {
  opcoes: string[]; correta: string; marcadas: string[]; acertou: boolean; ocupado: boolean; mostrarCerta: boolean; onEscolher: (o: string, k: number) => void;
}) {
  return (
    <div className="opcoes-palavra" role="group" aria-label="Respostas">
      {opcoes.map((o, k) => (
        <button key={o} className={`opcao-palavra ${acertou && o === correta ? 'certa' : ''} ${marcadas.includes(o) && o !== correta ? 'tentada' : ''} ${mostrarCerta && !acertou && o === correta ? 'modelo' : ''}`}
          disabled={ocupado || acertou} onClick={() => onEscolher(o, k)} data-opcao={o} data-correta={o === correta ? '1' : undefined}>
          {o.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
