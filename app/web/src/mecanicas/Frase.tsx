import { useEffect, useMemo, useRef, useState } from 'react';
import { FALAS, FALAS_TRILHA_SONS as T, type AtividadeFrase, type Opcao } from '@fonema/conteudo';
import { Balao, Brilho } from '../componentes/basicos.tsx';
import { Icone } from '../componentes/ui.tsx';
import { efeitos } from '../servicos/efeitos.ts';
import { espera, modoTeste } from '../servicos/ambiente.ts';
import { voz } from '../servicos/voz.ts';
import { falar, textoVoz } from '../util.ts';
import { tentativa, Progressinho, embaralhar, sementeDaTentativa, type PropsMecanica } from './comum.tsx';
import { pararSons, tocarSonsEmendados } from './sons-emendados.ts';
import { OpcoesTF, registro } from './tf-comum.tsx';

type Etapa = 'ler' | 'responder' | 'eco-ouvir' | 'eco-ler' | 'feito';

/**
 * LEITURA DE FRASE decodificável + COMPREENSÃO + LEITURA EM ECO (docs/pedagogia/04 N11, N12; ABC p. 375–376; SOA p. 246–248).
 * 1. A criança lê a frase sozinha. Tocar numa palavra toca os SONS dela, um por um (ensina o caminho; não diz a palavra).
 * 2. Pergunta literal, falada pela dupla; a criança responde tocando na figura (3 figuras plausíveis, posição sorteada).
 *    Conta para a leitura da frase e para a compreensão.
 * 3. Eco (nas revisões): a Sofia lê com ritmo, palavra por palavra acesa; depois a criança relê junto. A releitura é
 *    AUTORRELATO ("Li!"): fica registrada como participação e não vale nota.
 */
export function Frase({ atividade, crianca, sessao, cenaId, revisao, onFim }: PropsMecanica<AtividadeFrase>) {
  const semente = useMemo(sementeDaTentativa, []);
  const itens = atividade.itens;
  const [i, setI] = useState(0);
  const item = itens[i];
  const palavras = useMemo(() => item.frase.split(/\s+/), [item]);
  const opcoes: Opcao[] = useMemo(() => embaralhar(item.opcoes.map((w) => ({ id: w, rotulo: w, figura: '', falar: w })), semente ? semente + i * 13 : 0), [item, semente, i]);
  const [etapa, setEtapa] = useState<Etapa>('ler');
  const [fala, setFala] = useState(atividade.enunciado);
  const [acesa, setAcesa] = useState(-1);
  const [letraAcesa, setLetraAcesa] = useState(-1);
  const [marcadas, setMarcadas] = useState<string[]>([]);
  const [acertou, setAcertou] = useState(false);
  const [ocupado, setOcupado] = useState(true);
  const respostas = useRef<string[]>([]);
  const pos = useRef<number | undefined>(undefined);
  const ajudas = useRef(0);
  const inicio = useRef(Date.now());
  const tents = useRef<ReturnType<typeof registro>[]>([]);
  const vivo = useRef(true);

  const diz = async (texto: string) => { setFala({ quem: 'sofia', texto }); await voz.falar(textoVoz(texto, crianca), { quem: 'sofia' }); };

  useEffect(() => { vivo.current = true; return () => { vivo.current = false; pararSons(); voz.parar(); }; }, []);
  useEffect(() => {
    let atual = true;
    setEtapa('ler'); setMarcadas([]); setAcertou(false); setOcupado(true); setAcesa(-1);
    respostas.current = []; pos.current = undefined; ajudas.current = 0;
    (async () => {
      await falar(atividade.enunciado, crianca);
      if (atual) { setOcupado(false); inicio.current = Date.now(); }
    })();
    return () => { atual = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i]);

  /** Tocar numa palavra: os sons dela, um por um (a criança junta). */
  const sonsDaPalavra = async (k: number) => {
    if (ocupado || (etapa !== 'ler' && etapa !== 'responder')) return;
    const limpa = palavras[k].replace(/[.,!?]/g, '').toUpperCase();
    const ps = item.palavras.find((p) => p.palavra === limpa);
    if (!ps) return;
    ajudas.current++;
    efeitos.toque();
    setOcupado(true);
    setAcesa(k);
    await tocarSonsEmendados(ps.sons, 'separado', setLetraAcesa);
    setLetraAcesa(-1);
    setAcesa(-1);
    setOcupado(false);
  };

  const li = async () => {
    setEtapa('responder');
    setOcupado(true);
    await diz(item.pergunta.texto);
    setOcupado(false);
    inicio.current = Date.now();
  };

  const responder = async (o: Opcao, k: number) => {
    if (acertou || ocupado) return;
    respostas.current.push(o.id);
    pos.current ??= k;
    if (o.id === item.correta) {
      setAcertou(true);
      efeitos.acerto();
      const comum = { sessao, cena: cenaId, mecanica: 'frase' as const, respostas: respostas.current.map((x) => x.toUpperCase()), distratores: item.opcoes.filter((x) => x !== item.correta).map((x) => x.toUpperCase()), inicio: inicio.current, revisao, posicaoCerta: opcoes.findIndex((x) => x.id === item.correta), posicaoEscolhida: pos.current, nOpcoes: opcoes.length, ouviuDeNovo: ajudas.current };
      tents.current.push(registro({ ...comum, habilidade: atividade.habilidadeCompreensao, alvo: item.correta.toUpperCase(), categoria: 'palavra' }));
      tents.current.push(registro({ ...comum, habilidade: atividade.habilidade, alvo: item.frase, categoria: 'outro' }));
      await voz.falar(o.falar ?? o.id, { quem: 'sofia' });
      await espera(200);
      await voz.falar(textoVoz(FALAS.acertos[i % FALAS.acertos.length], crianca), { quem: 'sofia' });
      if (!vivo.current) return;
      if (atividade.eco) { await eco(); return; }
      await terminar();
      return;
    }
    efeitos.suave();
    setMarcadas((m) => [...m, o.id]);
    setOcupado(true);
    // 1º erro: voltar a ler da esquerda para a direita (o caminho), e a pergunta de novo; 2º: a certa brilha
    if (respostas.current.length === 1) { await diz(FALAS.erro1); setEtapa('responder'); await diz(item.pergunta.texto); }
    else await diz(FALAS.erro2);
    setOcupado(false);
  };

  /** Leitura em eco: a Sofia lê, a criança relê junto (autorrelato, sem nota). */
  const eco = async () => {
    setOcupado(true);
    setEtapa('eco-ouvir');
    await diz(T.eco);
    const ler = voz.falar(item.frase, { quem: 'sofia' });
    // as palavras acendem no ritmo da leitura (aproximado)
    for (let k = 0; k < palavras.length && vivo.current; k++) { setAcesa(k); await espera(modoTeste() ? 5 : 260 + palavras[k].length * 70); }
    await ler;
    setAcesa(-1);
    if (!vivo.current) return;
    setEtapa('eco-ler');
    await diz(T.ecoVez);
    for (let k = 0; k < palavras.length && vivo.current; k++) { setAcesa(k); await espera(modoTeste() ? 5 : 700 + palavras[k].length * 120); }
    setAcesa(-1);
    setOcupado(false);
  };

  const leuNoEco = async () => {
    setOcupado(true);
    efeitos.acerto();
    tents.current.push(tentativa(atividade.habilidade, sessao, cenaId, 0, { tipo: 'autorrelato', mecanica: 'frase', alvo: item.frase, categoria: 'outro', tentativaNumero: 1, contexto: revisao ? 'revisao' : 'trilha' }));
    await diz(T.ecoFim);
    await terminar();
  };

  const terminar = async () => {
    setEtapa('feito');
    await espera(500);
    if (!vivo.current) return;
    if (i + 1 < itens.length) setI(i + 1);
    else onFim({ tentativas: tents.current, tentouDeNovo: tents.current.filter((t) => !t.acertou).length });
  };

  return (
    <div className="mec mec-frase" data-testid="frase" data-etapa={etapa}>
      <Balao fala={fala} crianca={crianca} />
      {itens.length > 1 ? <Progressinho atual={i} total={itens.length} /> : null}
      <div className={`frase-livro ${etapa.startsWith('eco') ? 'eco' : ''}`}>
        <p className="frase-texto" aria-label={item.frase}>
          {palavras.map((w, k) => {
            const limpa = w.replace(/[.,!?]/g, '');
            const pontuacao = w.slice(limpa.length);
            return (
              <span key={k} className="frase-palavra-caixa">
                <button className={`frase-palavra ${acesa === k ? 'acesa' : ''}`} onClick={() => void sonsDaPalavra(k)} disabled={etapa.startsWith('eco') || etapa === 'feito'} aria-label={`Ouvir os sons da palavra ${k + 1}`}>
                  {[...limpa].map((ch, j) => <span key={j} className={acesa === k && letraAcesa === j ? 'letra-acesa' : ''}>{ch}</span>)}{pontuacao}
                </button>
              </span>
            );
          })}
        </p>
        {etapa === 'ler' ? <p className="frase-dica"><Icone nome="dica" />Toque numa palavra para ouvir os sons dela.</p> : null}
        {etapa === 'feito' ? <Brilho ativo /> : null}
      </div>
      {etapa === 'ler' ? <div className="linha-botoes centro"><button className="btn grande verde" onClick={li} disabled={ocupado} data-testid="frase-li"><Icone nome="check" />Já li a frase</button></div> : null}
      {etapa === 'responder' || (etapa === 'feito' && !atividade.eco) ? (
        <OpcoesTF opcoes={opcoes} correta={item.correta} marcadas={marcadas} acertou={acertou} ocupado={ocupado} mostrarCerta={marcadas.length >= 2} onEscolher={responder} rotulo="Respostas" />
      ) : null}
      {etapa === 'eco-ler' ? <div className="linha-botoes centro"><button className="btn grande verde" onClick={leuNoEco} disabled={ocupado} data-testid="eco-li"><Icone nome="check" />Li junto!</button></div> : null}
    </div>
  );
}
