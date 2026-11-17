/**
 * BICHINHO COME-SOM (D032 §4; docs/pesquisa/47 G5): o Bolota está com fome de sons. Ele "pede" um som (o SOM PURO, regra 1)
 * e a criança dá, entre 3 pratinhos em posições sorteadas (R5), a comida/figura que COMEÇA com esse som (ou, na variação
 * "fim", que TERMINA com ele). Só toque, sem coordenação fina: é o jogo dos menores.
 * Tocar no alto-falante do pratinho diz o nome da figura sem responder (04 R10). Errou: o Bolota cheira, faz "hum?" e devolve
 * (nunca fica triste, doente ou bravo; nada de "ele está com fome" para chamar a criança de volta: pesquisa 47 §4); a correção
 * compara os dois sons. No 3º pratinho, o certo brilha e o item vale "com ajuda" (R4). Carinho e barriga cheia não contam.
 */
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { FALAS, FALAS_ESCUTA, type Fala } from '@fonema/conteudo';
import type { ItemJogo, Tentativa } from '@fonema/motor';
import { idDoRegistro } from '@fonema/motor';
import { Balao, Brilho } from '../../componentes/basicos.tsx';
import { Figura, Icone } from '../../componentes/ui.tsx';
import { asset, espera, modoTeste } from '../../servicos/ambiente.ts';
import { efeitos } from '../../servicos/efeitos.ts';
import { voz } from '../../servicos/voz.ts';
import { textoVoz } from '../../util.ts';
import { Progressinho } from '../comum.tsx';
import { registro } from '../tf-comum.tsx';
import { comemorar, corrigirEscolha, dizerFigura, tocarSom } from './correcao.ts';
import type { PropsJogoFonico } from './CorreSom.tsx';
import './estilos-jogos.css';

type Humor = 'pedindo' | 'mastigando' | 'cheirando' | 'feliz' | 'esperando';
const ESPERA_REPETIR_MS = 9000;

export function ComeSom({ itens, crianca, sessao, cena, contexto, enunciado, demo, onFim }: PropsJogoFonico) {
  const [i, setI] = useState(0);
  const [item, setItem] = useState<ItemJogo>(demo ?? itens[0]);
  const [emDemo, setEmDemo] = useState(!!demo);
  const [fala, setFala] = useState<Fala>(enunciado);
  const [humor, setHumor] = useState<Humor>('esperando');
  const [acesa, setAcesa] = useState<number | null>(null);
  const [voando, setVoando] = useState<number | null>(null);
  const [marcas, setMarcas] = useState<Record<number, 'tentado' | 'modelo' | 'certo'>>({});
  const [livre, setLivre] = useState(false);
  const [comidas, setComidas] = useState(0);
  const [fim, setFim] = useState(false);
  const vivo = useRef(true);
  const escolha = useRef<((k: number) => void) | null>(null);
  const ouviu = useRef(0);
  const repetiu = useRef(false);

  const diz = async (f: Fala | string) => {
    const x: Fala = typeof f === 'string' ? { quem: 'sofia', texto: f } : f;
    setFala(x);
    await voz.falar(textoVoz(x.texto, crianca), { quem: x.quem });
  };
  /** O Bolota "pede" o som: a bolha dele pulsa enquanto o som puro toca. */
  const pedir = async (it: ItemJogo, vezes: number) => { setHumor('pedindo'); await tocarSom(it.somAlvo, vezes); if (vivo.current) setHumor('esperando'); };
  const apresentar = async (it: ItemJogo, primeira: boolean) => {
    if (primeira) await diz(enunciado);
    for (let k = 0; k < it.opcoes.length; k++) { if (!vivo.current) return; setAcesa(k); await dizerFigura(it.opcoes[k]); await espera(200); }
    setAcesa(null);
    if (vivo.current) await pedir(it, 2);
  };
  const esperarEscolha = (it: ItemJogo) => new Promise<number>((ok) => {
    let timer = 0;
    const repetir = () => { timer = window.setTimeout(async () => { if (!escolha.current) return; repetiu.current = true; await pedir(it, 1); repetir(); }, ESPERA_REPETIR_MS); };
    repetir();
    setLivre(true);
    escolha.current = (k) => { window.clearTimeout(timer); escolha.current = null; setLivre(false); ok(k); };
  });
  /** A comida voa até o Bolota. Certo: ele come (nham!). Errado: ele cheira, faz "hum?" e devolve. */
  const levar = async (k: number, certo: boolean) => {
    setVoando(k);
    await espera(modoTeste() ? 30 : 650);
    if (certo) { setHumor('mastigando'); efeitos.acerto(); setComidas((n) => n + 1); await espera(modoTeste() ? 30 : 900); setHumor('feliz'); }
    else { setHumor('cheirando'); efeitos.suave(); await espera(modoTeste() ? 30 : 900); setHumor('esperando'); }
    setVoando(null);
  };

  useEffect(() => {
    vivo.current = true;
    let cancelado = false;
    const ok = () => vivo.current && !cancelado;
    const tentativas: Tentativa[] = [];
    let tentouDeNovo = 0;
    (async () => {
      if (demo) {
        await diz(FALAS_ESCUTA.euFaco);
        if (!ok()) return;
        await apresentar(demo, false);
        if (!ok()) return;
        setMarcas({ [demo.posicaoCerta]: 'certo' });
        await levar(demo.posicaoCerta, true);
        await diz(FALAS_ESCUTA.voceFaz);
        if (!ok()) return;
        setEmDemo(false);
      }
      for (let k = 0; k < itens.length; k++) {
        const it = itens[k];
        setI(k); setItem(it); setMarcas({}); setHumor('esperando');
        ouviu.current = 0; repetiu.current = false;
        await espera(modoTeste() ? 20 : 350);
        await apresentar(it, k === 0 && !demo);
        const respostas: string[] = [];
        let posEscolhida: number | undefined;
        const inicio = Date.now();
        let erros = 0;
        for (;;) {
          if (!ok()) return;
          if (erros >= 2) setMarcas((m) => ({ ...m, [it.posicaoCerta]: 'modelo' }));
          const p = await esperarEscolha(it);
          if (!ok()) return;
          const o = it.opcoes[p];
          respostas.push(idDoRegistro(it, o));
          posEscolhida ??= p;
          const certo = p === it.posicaoCerta;
          await levar(p, certo);
          if (!ok()) return;
          if (certo) {
            setMarcas((m) => ({ ...m, [p]: 'certo' }));
            tentativas.push({
              ...registro({
                habilidade: it.habilidade, sessao, cena, mecanica: 'come-som', alvo: idDoRegistro(it, it.opcoes[it.posicaoCerta]), respostas, categoria: it.categoria,
                distratores: it.opcoes.filter((_, j) => j !== it.posicaoCerta).map((x) => idDoRegistro(it, x)), inicio, posicaoCerta: it.posicaoCerta, posicaoEscolhida: posEscolhida,
                nOpcoes: it.opcoes.length, ouviuDeNovo: ouviu.current, revisao: contexto === 'revisao', ...(erros === 0 && repetiu.current ? { ajuda: 'repetiu' as const } : {})
              }),
              formato: it.formato, contexto
            });
            if (erros > 0) tentouDeNovo++;
            await dizerFigura(o);
            await comemorar(it, k, erros, crianca, diz);
            break;
          }
          erros++;
          setMarcas((m) => ({ ...m, [p]: 'tentado' }));
          if (erros === 1) { await corrigirEscolha(it, o, diz, ok); if (ok()) await pedir(it, 1); }
          else await diz({ quem: 'sofia', texto: FALAS.erro2 });
        }
      }
      if (!ok()) return;
      setFim(true); setHumor('feliz');
      await diz(FALAS_ESCUTA.muitoBem);
      await espera(modoTeste() ? 50 : 900);
      if (ok()) onFim({ tentativas, tentouDeNovo });
    })();
    return () => { cancelado = true; vivo.current = false; voz.parar(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tocar = (k: number) => { if (!escolha.current) return; efeitos.toque(); escolha.current(k); };
  const ouvirDeNovo = () => { if (!livre) return; ouviu.current++; efeitos.toque(); void pedir(item, 1); };

  return (
    <div className={`mec jogo-come humor-${humor} ${fim ? 'cheio' : ''}`} data-testid="come-som" data-item={i} data-demo={emDemo ? '1' : undefined} data-formato={item.formato} data-livre={livre ? '1' : undefined}>
      <Balao fala={fala} crianca={crianca} />
      <div className="jogo-topo">
        <Progressinho atual={emDemo ? 0 : i} total={itens.length} />
      </div>
      <div className="cm-cena">
        <div className="cm-bolota">
          <button className={`cm-bolha ${humor === 'pedindo' ? 'pulsando' : ''}`} onClick={ouvirDeNovo} disabled={!livre} aria-label="Ouvir o som que o Bolota pediu" data-testid="jogo-ouvir">
            <Icone nome="som" />
            <span className="cm-bolha-ondas" aria-hidden="true"><i /><i /><i /></span>
          </button>
          <img className="cm-bolota-img" src={asset('vivos/corpo/bolota-parado.webp')} alt="O Bolota" draggable={false} />
          <span className="cm-barriga" aria-hidden="true">{Array.from({ length: Math.min(comidas, 6) }, (_, k) => <i key={k} style={{ ['--k' as string]: k } as CSSProperties} />)}</span>
          {humor === 'mastigando' || humor === 'feliz' ? <span className="cm-coracoes" aria-hidden="true"><i /><i /><i /></span> : null}
          {humor === 'cheirando' ? <span className="cm-hum" aria-hidden="true">?</span> : null}
        </div>
        <div className="cm-toalha" role="group" aria-label="Comidas">
          {item.opcoes.map((o, k) => {
            const m = marcas[k];
            return (
              <div key={`${i}-${o.id}`} className={`cm-prato-caixa ${voando === k ? 'voando' : ''}`} style={{ ['--k' as string]: k } as CSSProperties}>
                <button className={`cm-prato ${m ?? ''} ${acesa === k ? 'acesa' : ''}`} onClick={() => tocar(k)} disabled={!livre}
                  aria-label={`Comida ${k + 1}`} data-opcao={o.id} data-correta={k === item.posicaoCerta ? '1' : undefined}>
                  <Figura palavra={o.figura ?? o.id} />
                  {m === 'certo' ? <Brilho ativo /> : null}
                </button>
                <button className="cm-prato-ouvir" aria-label={`Ouvir o nome da comida ${k + 1}`} disabled={!livre} onClick={() => { efeitos.toque(); void dizerFigura(o); }}>
                  <Icone nome="som" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
