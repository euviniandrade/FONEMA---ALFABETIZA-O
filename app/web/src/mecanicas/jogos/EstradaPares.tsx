/**
 * ESTRADA E RIO DOS PARES (D032 §4; docs/pesquisa/47 G6): o carrinho (ou o barco) do avatar sobe a estrada (ou o rio) e PARA
 * na bifurcação. Três caminhos, cada um com uma placa de figura: o par mínimo + 1 distrator (vaca × faca × foca; 04 R8).
 *  - ouvir: a Sofia diz a palavra; a criança toca o caminho da figura certa (CFN-PAR).
 *  - ler: o passageiro mostra a palavra ESCRITA (VACA) e ninguém a diz antes (04 R9); a criança lê e escolhe o caminho.
 * Caminho da certa sorteado (R5). Sem cronômetro: o carro espera parado (47 §3). Errou: o carro não bate nem "morre"; a placa
 * balança e a Sofia faz a correção contrastiva (ouvir: as duas palavras e o que muda entre os dois sons; ler: "leia de novo,
 * letra por letra" + o som da letra que muda, na palavra escrita). No 3º toque a certa brilha e o item vale "com ajuda" (R4).
 * Registro: tentativa AVALIADA na habilidade do CONTRASTE (`par-minimo-*`): entra no 8 de 10. Cor do carro e chegada não contam.
 */
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { FALAS, FALAS_BIBLIOTECA as B, FALAS_ESCUTA, FALAS_FONICAS as F, FALAS_TRILHA_SONS as T, comSons, contrasteDosSons, type Fala } from '@fonema/conteudo';
import type { ItemEstrada, Tentativa } from '@fonema/motor';
import { Balao, Brilho } from '../../componentes/basicos.tsx';
import { Figura, Icone } from '../../componentes/ui.tsx';
import { espera, modoTeste } from '../../servicos/ambiente.ts';
import { efeitos } from '../../servicos/efeitos.ts';
import { voz } from '../../servicos/voz.ts';
import { Progressinho } from '../comum.tsx';
import { explicarContraste } from '../contraste.ts';
import { falarFigura, useFala } from '../livre-comum.tsx';
import { registro } from '../tf-comum.tsx';
import { Veiculo, useEscolha, type PropsJogoVila } from './vila-comum.tsx';
import './estilos-jogos-vila.css';

type Etapa = 'andando' | 'parado' | 'indo' | 'chegou';
const PISTA = ['esq', 'meio', 'dir'];

/** Posição da letra que muda entre a palavra certa e a escolhida (-1 = nenhuma). */
function letraQueMuda(certa: string, outra: string): number {
  for (let k = 0; k < Math.min(certa.length, outra.length); k++) if (certa[k] !== outra[k]) return k;
  return certa.length === outra.length ? -1 : Math.min(certa.length, outra.length);
}

export function EstradaPares({ itens, demo, crianca, sessao, cena, contexto, onFim, veiculo, cor }: PropsJogoVila<ItemEstrada> & { veiculo: 'carro' | 'barco'; cor: string }) {
  const modo = (demo ?? itens[0])?.modo ?? 'ouvir';
  const enunciado: Fala = { quem: 'sofia', texto: modo === 'ouvir' ? T.parOuvir : T.lerFigura };
  const { fala, diz } = useFala(crianca, enunciado);
  const [i, setI] = useState(0);
  const [item, setItem] = useState<ItemEstrada>(demo ?? itens[0]);
  const [emDemo, setEmDemo] = useState(!!demo);
  const [etapa, setEtapa] = useState<Etapa>('andando');
  const [destino, setDestino] = useState<number | null>(null);
  const [marcas, setMarcas] = useState<Record<number, 'tentado' | 'modelo' | 'certo'>>({});
  const [balanca, setBalanca] = useState<number | null>(null);
  const [apontada, setApontada] = useState<number>(-1);
  const { livre, esperar, tocar } = useEscolha();
  const vivo = useRef(true);
  const ouviu = useRef(0);

  const dizerPalavra = (it: ItemEstrada) => voz.falar(it.alvo, { quem: 'sofia' });
  const andar = async () => { setEtapa('andando'); setDestino(null); await espera(modoTeste() ? 20 : 1300); if (vivo.current) setEtapa('parado'); };
  const irPara = async (k: number) => { setDestino(k); setEtapa('indo'); await espera(modoTeste() ? 20 : 1100); };

  useEffect(() => {
    vivo.current = true;
    let cancelado = false;
    const ok = () => vivo.current && !cancelado;
    const tentativas: Tentativa[] = [];
    let tentouDeNovo = 0;
    (async () => {
      await diz(enunciado);
      if (demo && ok()) {
        // R12: a Sofia faz uma bifurcação de exemplo (não vale)
        await diz(FALAS_ESCUTA.euFaco);
        await andar();
        if (!ok()) return;
        if (demo.modo === 'ouvir') await dizerPalavra(demo);
        await espera(400);
        setMarcas({ [demo.posicaoCerta]: 'certo' });
        efeitos.acerto();
        await irPara(demo.posicaoCerta);
        await diz(FALAS_ESCUTA.voceFaz);
        if (!ok()) return;
        setEmDemo(false);
      }
      for (let k = 0; k < itens.length; k++) {
        const it = itens[k];
        setI(k); setItem(it); setMarcas({}); setApontada(-1);
        ouviu.current = 0;
        await andar();
        if (!ok()) return;
        if (it.modo === 'ouvir') await dizerPalavra(it);
        const respostas: string[] = [];
        let posEscolhida: number | undefined;
        let erros = 0;
        let repetiu = false;
        const inicio = Date.now();
        for (;;) {
          if (!ok()) return;
          if (erros >= 2) setMarcas((m) => ({ ...m, [it.posicaoCerta]: 'modelo' }));
          const p = await esperar(it.modo === 'ouvir' ? async () => { repetiu = true; await dizerPalavra(it); } : undefined);
          if (!ok()) return;
          const escolhida = it.opcoes[p];
          respostas.push(escolhida.toUpperCase());
          posEscolhida ??= p;
          if (p === it.posicaoCerta) {
            setMarcas((m) => ({ ...m, [p]: 'certo' }));
            efeitos.acerto();
            tentativas.push({
              ...registro({
                habilidade: it.habilidade, sessao, cena, mecanica: 'estrada-pares', alvo: it.alvo.toUpperCase(), respostas, categoria: 'palavra',
                distratores: [it.outra, it.distrator].map((x) => x.toUpperCase()), inicio, posicaoCerta: it.posicaoCerta, posicaoEscolhida: posEscolhida,
                nOpcoes: it.opcoes.length, ouviuDeNovo: ouviu.current, ...(erros === 0 && repetiu ? { ajuda: 'repetiu' as const } : {})
              }),
              formato: `estrada-${it.modo}`, contexto
            });
            if (erros > 0) tentouDeNovo++;
            await irPara(p);
            await dizerPalavra(it);
            await espera(200);
            await diz({ quem: 'sofia', texto: erros > 1 ? FALAS.erroJunto.replace('?', '!') : FALAS.acertos[k % FALAS.acertos.length] });
            break;
          }
          erros++;
          efeitos.suave();
          setMarcas((m) => ({ ...m, [p]: 'tentado' }));
          setBalanca(p);
          window.setTimeout(() => setBalanca(null), 700);
          if (erros === 1) {
            if (it.modo === 'ouvir') {
              // as duas palavras e, quando é o par, o que muda entre os dois sons (como nos pares mínimos da trilha)
              await diz(F.tentaDeNovo);
              await falarFigura(escolhida);
              await espera(300);
              await dizerPalavra(it);
              if (escolhida === it.outra) {
                const [a, b] = it.sons;
                const c = contrasteDosSons(b, a);
                if (c && ok()) await explicarContraste(b, a, c);
              }
            } else {
              // ler: o caminho (a letra que muda e o som dela), nunca a palavra
              const pos = letraQueMuda(it.alvo, escolhida);
              const som = pos >= 0 ? comSons(it.alvo).sons[pos] : null;
              await diz(B.fluDeNovo);
              if (som && ok()) { setApontada(pos); await diz(F.somDaLetra); await voz.somReal(som, 2); }
            }
          } else await diz(FALAS.erro2);
        }
      }
      if (!ok()) return;
      setEtapa('chegou');
      await diz(FALAS_ESCUTA.muitoBem);
      await espera(modoTeste() ? 50 : 900);
      if (ok()) onFim({ tentativas, tentouDeNovo });
    })();
    return () => { cancelado = true; vivo.current = false; voz.parar(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const escolher = (k: number) => { if (!livre) return; efeitos.toque(); tocar(k); };
  const ouvirDeNovo = () => { if (!livre) return; ouviu.current++; efeitos.toque(); void dizerPalavra(item); };

  return (
    <div className={`mec jogo-estrada ${veiculo} etapa-${etapa}`} data-testid="estrada-pares" data-modo={item.modo} data-item={i} data-demo={emDemo ? '1' : undefined} data-livre={livre ? '1' : undefined}
      onKeyDown={(e) => { const k = { ArrowLeft: 0, ArrowUp: 1, ArrowRight: 2, '1': 0, '2': 1, '3': 2 }[e.key]; if (k !== undefined) escolher(k); }}>
      <Balao fala={fala} crianca={crianca} />
      <div className="jogo-topo"><Progressinho atual={emDemo ? 0 : i} total={itens.length} /></div>
      <div className="ep-cena">
        <svg className="ep-chao" viewBox="0 0 300 200" preserveAspectRatio="none" aria-hidden="true">
          <g className="ep-caminhos">
            <path d="M150 210 L150 120 Q150 92 52 40 L46 0" /><path d="M150 210 L150 0" /><path d="M150 210 L150 120 Q150 92 248 40 L254 0" />
          </g>
          <g className="ep-faixas">
            <path d="M150 210 L150 120 Q150 92 52 40 L46 0" /><path d="M150 210 L150 0" /><path d="M150 210 L150 120 Q150 92 248 40 L254 0" />
          </g>
        </svg>
        <div className="ep-placas" role="group" aria-label="Caminhos">
          {item.opcoes.map((w, k) => {
            const m = marcas[k];
            return (
              <div key={`${i}-${w}`} className={`ep-placa-caixa p-${PISTA[k]} ${balanca === k ? 'balanca' : ''}`} style={{ ['--k' as string]: k } as CSSProperties}>
                <button className={`ep-placa ${m ?? ''}`} onClick={() => escolher(k)} disabled={!livre} aria-label={`Caminho ${k + 1}`} data-opcao={w} data-correta={k === item.posicaoCerta ? '1' : undefined}>
                  <Figura palavra={w} />
                  {m === 'certo' ? <Brilho ativo /> : null}
                </button>
                <span className="ep-poste" aria-hidden="true" />
                <button className="ep-placa-ouvir" aria-label={`Ouvir o nome da figura ${k + 1}`} disabled={!livre} onClick={() => { efeitos.toque(); void falarFigura(w); }}><Icone nome="som" /></button>
              </div>
            );
          })}
        </div>
        <div className={`ep-veiculo ${destino !== null ? `vai-${PISTA[destino]}` : ''}`}>
          {item.modo === 'ler' ? (
            <div className="ep-passageiro" data-testid="palavra-lida" aria-label={`Palavra: ${item.alvo.toUpperCase()}`}>
              {[...item.alvo.toUpperCase()].map((ch, k) => <b key={k} className={k === apontada ? 'muda' : ''}>{ch}</b>)}
            </div>
          ) : (
            <button className="ep-ouvir" onClick={ouvirDeNovo} disabled={!livre} aria-label="Ouvir a palavra de novo" data-testid="jogo-ouvir"><Icone nome="som" /></button>
          )}
          <Veiculo tipo={veiculo} cor={cor} />
        </div>
      </div>
    </div>
  );
}
