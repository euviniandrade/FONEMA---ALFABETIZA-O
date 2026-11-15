import { useEffect, useMemo, useRef, useState } from 'react';
import { FALAS_FONICAS, VALORES_DAS_PALAVRAS, fonemasDasLetras, type AtividadeMontar } from '@fonema/conteudo';
import { hash, silabas } from '@fonema/motor';
import { Balao, Brilho, BotaoOuvir } from '../componentes/basicos.tsx';
import { efeitos } from '../servicos/efeitos.ts';
import { espera, modoTeste } from '../servicos/ambiente.ts';
import { voz } from '../servicos/voz.ts';
import { ehDeterminista, falar, textoVoz } from '../util.ts';
import { Progressinho, tentativa, type PropsMecanica } from './comum.tsx';

interface Rodada { palavra: string; indice: number; modelo: boolean; demo: boolean }
const chaveDemo = (crianca: string, cena: string) => `fonema-demo-montar:${crianca}:${cena}`;
const jaViuDemo = (crianca: string, cena: string) => { try { return localStorage.getItem(chaveDemo(crianca, cena)) === '1'; } catch { return false; } };
const marcarDemo = (crianca: string, cena: string) => { try { localStorage.setItem(chaveDemo(crianca, cena), '1'); } catch { /* sem armazenamento */ } };

/**
 * MONTAR com o alfabeto móvel (ou a tábua de sílabas): tocar a peça certa para encher cada espaço.
 *
 * D030 §5 · montar SEM CÓPIA:
 *  - a 1ª vez de cada atividade é uma DEMONSTRAÇÃO guiada: o modelo fica visível e cada peça toca o SOM dela
 *    (registro: exposição);
 *  - depois o modelo SOME: a criança monta ouvindo a palavra (botão "Ouvir a palavra") e os sons das peças;
 *  - a peça certa só brilha na 3ª tentativa seguida, e conta como ajuda;
 *  - as peças tocam o FONEMA do mapa de sons (nunca o nome da letra: nada de "bê", "tê"); letra que não soa (H, U de
 *    QUE) fica calada.
 */
export function Montar({ atividade, crianca, sessao, cenaId, onFim }: PropsMecanica<AtividadeMontar>) {
  const rodadas = useMemo<Rodada[]>(() => {
    const ws = atividade.palavras.map((w) => w.toUpperCase());
    if (!atividade.mostrarModelo) return ws.map((palavra, indice) => ({ palavra, indice, modelo: false, demo: false }));
    if (atividade.modelo === 'sempre') return ws.map((palavra, indice) => ({ palavra, indice, modelo: true, demo: false }));
    const semModelo = ws.map((palavra, indice) => ({ palavra, indice, modelo: false, demo: false }));
    return jaViuDemo(crianca.id, cenaId) ? semModelo : [{ palavra: ws[0], indice: 0, modelo: true, demo: true }, ...semModelo];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [i, setI] = useState(0);
  const rodada = rodadas[i];
  const palavra = rodada.palavra;
  const ehNome = palavra === crianca.nome.toUpperCase();
  const alvo = useMemo(() => (atividade.porSilaba ? silabas(palavra).map((s) => s.toUpperCase()) : [...palavra]), [palavra, atividade.porSilaba]);
  /** Som de cada letra NA PALAVRA (E e O átonos do fim soam i e u; É/Ó abertos marcados no conteúdo). */
  const sons = useMemo(() => {
    const v = VALORES_DAS_PALAVRAS[palavra] ?? [];
    return fonemasDasLetras(palavra, { e: v.includes('e-aberto') && !/É/.test(palavra), o: v.includes('o-aberto') && !/Ó/.test(palavra) });
  }, [palavra]);
  const sorte = useMemo(() => (modoTeste() ? 0 : Math.floor(Math.random() * 100000)), []);
  const pecas = useMemo(() => {
    const base = alvo.map((t, k) => ({ id: `${t}-${k}`, t }));
    const extras = (atividade.distratoras ?? []).filter((t) => !alvo.includes(t)).map((t, k) => ({ id: `x${t}-${k}`, t }));
    return ehDeterminista([...base, ...extras], hash(palavra + crianca.id) + sorte + i);
  }, [alvo, atividade.distratoras, palavra, crianca.id, sorte, i]);
  const [usadas, setUsadas] = useState<string[]>([]);
  const [errosSeguidos, setErrosSeguidos] = useState(0);
  const [errosTotal, setErrosTotal] = useState(0);
  const [balanca, setBalanca] = useState<string | null>(null);
  const [pronto, setPronto] = useState(false);
  const tents = useRef<ReturnType<typeof tentativa>[]>([]);
  const deNovo = useRef(0);
  const erradas = useRef<string[]>([]);
  const brilhou = useRef(false);
  const inicio = useRef(Date.now());
  const pos = usadas.length;

  const falarPalavra = () => voz.falar(ehNome ? crianca.pronuncia.fala : palavra.toLowerCase(), { quem: 'sofia' });
  /** O som de uma peça: o fonema (letras) ou a sílaba falada. `k` = posição na palavra (peça certa). */
  const somDaPeca = async (t: string, k?: number) => {
    if (atividade.semSomDasPecas) return;
    if (atividade.porSilaba) { await voz.falar(t.toLowerCase(), { quem: 'sofia' }); return; }
    const fonema = k !== undefined ? sons[k] : fonemasDasLetras(t)[0];
    if (fonema && (await voz.temSomReal(fonema))) await voz.somReal(fonema, 1);
  };

  useEffect(() => {
    let atual = true;
    (async () => {
      if (i === 0) await falar(atividade.enunciado, crianca);
      else if (!rodada.modelo && rodadas[i - 1].demo) await voz.falar(FALAS_FONICAS.semModelo, { quem: 'sofia' });
      if (atual) await falarPalavra();
      if (atual) inicio.current = Date.now();
    })();
    setUsadas([]); setErrosSeguidos(0); setErrosTotal(0); setPronto(false);
    erradas.current = []; brilhou.current = false;
    return () => { atual = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i]);

  const tocar = async (p: { id: string; t: string }) => {
    if (pronto || usadas.includes(p.id)) return;
    if (p.t === alvo[pos]) {
      efeitos.toque();
      const novas = [...usadas, p.id];
      setUsadas(novas);
      setErrosSeguidos(0);
      const fim = novas.length === alvo.length;
      if (fim) await somDaPeca(p.t, pos); else void somDaPeca(p.t, pos);
      if (fim) {
        setPronto(true);
        efeitos.acerto();
        // demonstração, modelo na tela ou palavra de vocabulário (valores sonoros ainda não ensinados): é exposição
        const exposicao = rodada.modelo || !!atividade.vocabulario;
        tents.current.push(tentativa(atividade.habilidade, sessao, cenaId, errosTotal, {
          mecanica: 'montar', tipo: exposicao ? 'exposicao' : 'avaliada', alvo: palavra, categoria: alvo.length === 1 && atividade.porSilaba ? 'silaba' : 'palavra',
          escolhido: erradas.current.length ? erradas.current[0] : palavra, respostas: [...erradas.current, palavra], distratores: atividade.distratoras ?? [],
          tempoMs: Date.now() - inicio.current, tentativaNumero: errosTotal + 1, ...(brilhou.current ? { comAjuda: true } : {})
        }));
        if (errosTotal) deNovo.current++;
        if (rodada.demo) marcarDemo(crianca.id, cenaId);
        await espera(500);
        // a dupla junta os sons e fala a palavra inteira
        await falarPalavra();
        const ultima = i + 1 >= rodadas.length;
        if (!rodada.demo || ultima) await voz.falar(textoVoz(atividade.comemora?.texto ?? 'Você montou a palavra!', crianca), { quem: atividade.comemora?.quem ?? 'sofia' });
        await espera(400);
        if (!ultima) setI(i + 1);
        else onFim({ tentativas: tents.current, tentouDeNovo: deNovo.current });
      }
    } else {
      efeitos.suave();
      setBalanca(p.id);
      setTimeout(() => setBalanca(null), 500);
      const seguidos = errosSeguidos + 1;
      setErrosSeguidos(seguidos);
      setErrosTotal((e) => e + 1);
      erradas.current.push(p.t);
      await somDaPeca(p.t);
      if (seguidos >= 2) {
        // 3ª tentativa: a peça certa brilha (ajuda)
        brilhou.current = true;
        await voz.falar(FALAS_FONICAS.pecaBrilha, { quem: 'sofia' });
      } else {
        await voz.falar(FALAS_FONICAS.escutaDeNovo, { quem: 'sofia' });
        // a pista é o SOM que vem agora (não a letra)
        await somDaPeca(alvo[pos], pos);
      }
    }
  };

  return (
    <div className="mec mec-montar" data-modelo={rodada.modelo ? (rodada.demo ? 'demonstracao' : 'sempre') : 'sem'} data-rodada={i}>
      <Balao fala={atividade.enunciado} crianca={crianca} />
      <Progressinho atual={i} total={rodadas.length} />
      {rodada.modelo
        ? <div className="modelo-palavra" aria-label={`Modelo: ${palavra}`} data-testid="modelo-palavra">{alvo.map((t, k) => <span key={k} className={k < pos ? 'feito' : k === pos ? 'agora' : ''}>{t}</span>)}</div>
        : <div className="pergunta montar-ouvir"><BotaoOuvir onClick={falarPalavra} rotulo="Ouvir a palavra" /><span className="dica-ouvir">Escute a palavra e monte com os sons</span></div>}
      <div className="espacos" data-testid="espacos" data-alvo={alvo.join('|')}>
        {alvo.map((t, k) => <span key={k} className={`espaco ${k < pos ? 'cheio' : ''} ${atividade.porSilaba ? 'silaba' : ''}`}>{k < pos ? t : ''}</span>)}
        {pronto ? <Brilho ativo /> : null}
      </div>
      <div className="pecas" role="group" aria-label="Peças">
        {pecas.map((p) => {
          const brilha = errosSeguidos >= 2 && p.t === alvo[pos] && !usadas.includes(p.id) && pecas.find((q) => q.t === alvo[pos] && !usadas.includes(q.id))?.id === p.id;
          return (
            <button key={p.id} className={`peca ${usadas.includes(p.id) ? 'usada' : ''} ${balanca === p.id ? 'balanca' : ''} ${brilha ? 'modelo' : ''} ${atividade.porSilaba ? 'silaba' : ''}`} onClick={() => tocar(p)} disabled={usadas.includes(p.id)} data-peca={p.t} aria-label={`Peça ${p.t}`}>
              {p.t}
            </button>
          );
        })}
      </div>
    </div>
  );
}
