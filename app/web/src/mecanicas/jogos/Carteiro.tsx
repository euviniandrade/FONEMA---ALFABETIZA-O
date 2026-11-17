/**
 * CARTEIRO DA VILA (D032 §4; docs/pesquisa/47 G10): a criança é a carteira/o carteiro da vila. O envelope traz uma palavra
 * ESCRITA (decodificável, já ensinada); a rua tem 3 casas, cada uma com a placa da FIGURA de quem mora lá (sem o nome escrito
 * ao lado: 04 R1/R2), em ordem sorteada (R5). A criança lê o envelope e toca a casa certa: a carta voa para a caixa do correio.
 * Ninguém lê o envelope antes (R9); depois do acerto a Sofia diz a palavra. Errou: a carta volta; a Sofia diz o nome da casa
 * tocada, pede "leia de novo, letra por letra" e mostra no envelope a letra que muda, com o SOM dela (o caminho, nunca a
 * resposta). No 3º toque a casa certa brilha e o item vale "com ajuda" (R4). Uniforme, bolsa e cartas entregues não contam.
 */
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { FALAS, FALAS_BIBLIOTECA as B, FALAS_ESCUTA, FALAS_FONICAS as F, FALAS_TRILHA_SONS as T, comSons, type Fala } from '@fonema/conteudo';
import type { ItemCarteiro, Tentativa } from '@fonema/motor';
import { Balao, Brilho } from '../../componentes/basicos.tsx';
import { Figura, Icone } from '../../componentes/ui.tsx';
import { espera, modoTeste } from '../../servicos/ambiente.ts';
import { efeitos } from '../../servicos/efeitos.ts';
import { voz } from '../../servicos/voz.ts';
import { Progressinho } from '../comum.tsx';
import { falarFigura, useFala } from '../livre-comum.tsx';
import { registro } from '../tf-comum.tsx';
import { useEscolha, type PropsJogoVila } from './vila-comum.tsx';
import './estilos-jogos-vila.css';

const TELHADOS = ['#e5674f', '#4f8de5', '#f0a93b'];
const PAREDES = ['#fff4dd', '#e9f5ff', '#f2ffe9'];

function letraQueMuda(certa: string, outra: string): number {
  for (let k = 0; k < Math.min(certa.length, outra.length); k++) if (certa[k] !== outra[k]) return k;
  return certa.length === outra.length ? -1 : Math.min(certa.length, outra.length);
}

export function Carteiro({ itens, demo, crianca, sessao, cena, contexto, onFim }: PropsJogoVila<ItemCarteiro>) {
  const enunciado: Fala = { quem: 'sofia', texto: T.lerFigura };
  const { fala, diz } = useFala(crianca, enunciado);
  const [i, setI] = useState(0);
  const [item, setItem] = useState<ItemCarteiro>(demo ?? itens[0]);
  const [emDemo, setEmDemo] = useState(!!demo);
  const [marcas, setMarcas] = useState<Record<number, 'tentado' | 'modelo' | 'certo'>>({});
  const [carta, setCarta] = useState<{ casa: number; volta: boolean } | null>(null);
  const [apontada, setApontada] = useState(-1);
  const [entregues, setEntregues] = useState(0);
  const { livre, esperar, tocar } = useEscolha();
  const vivo = useRef(true);

  const voar = async (k: number, certo: boolean) => {
    setCarta({ casa: k, volta: !certo });
    await espera(modoTeste() ? 20 : 900);
    setCarta(null);
  };

  useEffect(() => {
    vivo.current = true;
    let cancelado = false;
    const ok = () => vivo.current && !cancelado;
    const tentativas: Tentativa[] = [];
    let tentouDeNovo = 0;
    (async () => {
      await diz(enunciado);
      if (demo && ok()) {
        await diz(FALAS_ESCUTA.euFaco);
        await espera(500);
        setMarcas({ [demo.posicaoCerta]: 'certo' });
        efeitos.acerto();
        await voar(demo.posicaoCerta, true);
        await voz.falar(demo.palavra, { quem: 'sofia' });
        await diz(FALAS_ESCUTA.voceFaz);
        if (!ok()) return;
        setEmDemo(false);
      }
      for (let k = 0; k < itens.length; k++) {
        const it = itens[k];
        setI(k); setItem(it); setMarcas({}); setApontada(-1);
        await espera(modoTeste() ? 20 : 450);
        const respostas: string[] = [];
        let posEscolhida: number | undefined;
        let erros = 0;
        const inicio = Date.now();
        for (;;) {
          if (!ok()) return;
          if (erros >= 2) setMarcas((m) => ({ ...m, [it.posicaoCerta]: 'modelo' }));
          const p = await esperar();
          if (!ok()) return;
          const casa = it.casas[p];
          respostas.push(casa.toUpperCase());
          posEscolhida ??= p;
          const certo = p === it.posicaoCerta;
          if (certo) {
            setMarcas((m) => ({ ...m, [p]: 'certo' }));
            efeitos.acerto();
            tentativas.push({
              ...registro({
                habilidade: it.habilidade, sessao, cena, mecanica: 'carteiro', alvo: it.palavra.toUpperCase(), respostas, categoria: 'palavra',
                distratores: it.casas.filter((_, j) => j !== it.posicaoCerta).map((x) => x.toUpperCase()), inicio, posicaoCerta: it.posicaoCerta,
                posicaoEscolhida: posEscolhida, nOpcoes: it.casas.length
              }),
              formato: 'ler-figura', contexto
            });
            if (erros > 0) tentouDeNovo++;
            await voar(p, true);
            setEntregues((n) => n + 1);
            await voz.falar(it.palavra, { quem: 'sofia' });
            await espera(200);
            await diz({ quem: 'sofia', texto: erros > 1 ? FALAS.erroJunto.replace('?', '!') : FALAS.acertos[k % FALAS.acertos.length] });
            break;
          }
          erros++;
          efeitos.suave();
          setMarcas((m) => ({ ...m, [p]: 'tentado' }));
          await voar(p, false);
          if (!ok()) return;
          if (erros === 1) {
            await diz(FALAS_ESCUTA.voceTocou);
            await falarFigura(casa);
            await diz(B.fluDeNovo);
            const pos = letraQueMuda(it.palavra, casa);
            const som = pos >= 0 && pos < it.palavra.length ? comSons(it.palavra).sons[pos] : null;
            if (som && ok()) { setApontada(pos); await diz(F.somDaLetra); await voz.somReal(som, 2); }
          } else await diz(FALAS.erro2);
        }
      }
      if (!ok()) return;
      await diz(FALAS_ESCUTA.muitoBem);
      await espera(modoTeste() ? 50 : 900);
      if (ok()) onFim({ tentativas, tentouDeNovo });
    })();
    return () => { cancelado = true; vivo.current = false; voz.parar(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const escolher = (k: number) => { if (!livre) return; efeitos.toque(); tocar(k); };

  return (
    <div className="mec jogo-carteiro" data-testid="carteiro" data-item={i} data-demo={emDemo ? '1' : undefined} data-livre={livre ? '1' : undefined}>
      <Balao fala={fala} crianca={crianca} />
      <div className="jogo-topo"><Progressinho atual={emDemo ? 0 : i} total={itens.length} /></div>
      <div className="ct-cena">
        <div className="ct-rua" role="group" aria-label="Casas da rua">
          {item.casas.map((w, k) => {
            const m = marcas[k];
            return (
              <div key={`${i}-${w}`} className="ct-casa-caixa" style={{ ['--telhado' as string]: TELHADOS[k], ['--parede' as string]: PAREDES[k], ['--k' as string]: k } as CSSProperties}>
                <button className={`ct-casa ${m ?? ''}`} onClick={() => escolher(k)} disabled={!livre} aria-label={`Casa ${k + 1}`} data-opcao={w} data-correta={k === item.posicaoCerta ? '1' : undefined}>
                  <span className="ct-telhado" aria-hidden="true" />
                  <span className="ct-parede" aria-hidden="true">
                    <span className="ct-placa"><Figura palavra={w} /></span>
                    <span className="ct-porta" />
                    <span className="ct-caixa-correio">{m === 'certo' ? <i className="ct-carta-dentro" /> : null}</span>
                  </span>
                  {m === 'certo' ? <Brilho ativo /> : null}
                </button>
                <button className="ct-casa-ouvir" aria-label={`Ouvir quem mora na casa ${k + 1}`} disabled={!livre} onClick={() => { efeitos.toque(); void falarFigura(w); }}><Icone nome="som" /></button>
              </div>
            );
          })}
        </div>
        <div className="ct-calcada" aria-hidden="true" />
        <div className="ct-carteiro">
          <div className={`ct-envelope ${carta ? `voa-${carta.casa} ${carta.volta ? 'volta' : 'entra'}` : ''}`} data-testid="palavra-lida" aria-label={`Envelope: ${item.palavra.toUpperCase()}`}>
            <span className="ct-selo" aria-hidden="true"><Icone nome="estrela" /></span>
            <span className="ct-palavra">{[...item.palavra.toUpperCase()].map((ch, k) => <b key={k} className={k === apontada ? 'muda' : ''}>{ch}</b>)}</span>
          </div>
          <div className="ct-bolsa" aria-label={`Cartas entregues: ${entregues}`}><Icone nome="check" /><b>{entregues}</b></div>
        </div>
      </div>
    </div>
  );
}
