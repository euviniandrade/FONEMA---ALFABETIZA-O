import { Figura, Icone, caminhoFigura } from '../componentes/ui.tsx';
import { useEffect, useMemo, useRef, useState } from 'react';
import { FALAS, FALAS_DOS_PARES, FALAS_FONICAS, contrasteDosSons, type AtividadeEscolher, type ItemEscolha, type Opcao } from '@fonema/conteudo';
import type { CategoriaAlvo } from '@fonema/motor';
import { Balao, Brilho, BotaoOuvir } from '../componentes/basicos.tsx';
import { efeitos } from '../servicos/efeitos.ts';
import { espera } from '../servicos/ambiente.ts';
import { voz } from '../servicos/voz.ts';
import { falar, textoVoz } from '../util.ts';
import { explicarContraste, temFrasesDoPar } from './contraste.ts';
import { Progressinho, embaralhar, sementeDaTentativa, sortearItens, tentativa, type PropsMecanica } from './comum.tsx';
import { JogoNaFase, useDesafioDaCena } from './jogos/JogoFonico.tsx';

const F = FALAS_FONICAS;
/** O que vai para o registro: a letra, a chave do fonema ("b"), a palavra. */
const idRegistro = (o: Opcao) => (o.botaoDeSom && o.som ? o.som : o.id);
function categoriaDoItem(item: ItemEscolha, certa: Opcao): CategoriaAlvo {
  if (item.formato === 'silaba-falta') return 'silaba';
  if (certa.botaoDeSom && certa.som) return 'fonema';
  if (certa.letra) return 'grafema';
  if (item.leitura || certa.figura !== undefined) return item.pseudo ? 'pseudopalavra' : 'palavra';
  return 'outro';
}

/**
 * TOCAR / CAÇAR / ENSINAR / SÍNTESE / REVISÃO: escolher entre 2–4 opções.
 *
 * D030 (etapas 3 e 4):
 *  - estímulo: o SOM REAL da letra (`somAlvo`), 2 vezes; o nome da letra só entra como apoio depois do acerto;
 *  - opções e itens sorteados a cada vez (no modo de teste, na ordem do conteúdo);
 *  - botões de som (`botaoDeSom`): tocar OUVE; a criança confirma em "É este!";
 *  - 1º erro: correção explícita e contrastiva — toca o som escolhido e o som certo e diz o que muda, sem entregar
 *    a resposta; pede nova tentativa. Só na 3ª tentativa a certa brilha, e o item fica registrado "com ajuda";
 *  - registro: alvo, respostas, distratores, tempo e número da tentativa.
 * Nada de X vermelho, buzina, perda ou cronômetro.
 */
export function Escolher(props: PropsMecanica<AtividadeEscolher>) {
  // D032 §4: a cena "som → letra" / "som → figura" pode virar jogo (Corre-Som / Bichinho Come-Som), se a criança quiser
  const desafio = useDesafioDaCena(props.atividade);
  const [jogando, setJogando] = useState(false);
  if (jogando && desafio) return <JogoNaFase desafio={desafio} {...props} />;
  return <EscolherClassico {...props} oferecerJogo={desafio ? { jogo: desafio.jogo, iniciar: () => setJogando(true) } : undefined} />;
}

function EscolherClassico({ atividade, crianca, sessao, cenaId, revisao, onFim, oferecerJogo }: PropsMecanica<AtividadeEscolher> & { oferecerJogo?: { jogo: string; iniciar: () => void } }) {
  const semente = useMemo(sementeDaTentativa, []);
  const itens = useMemo(() => sortearItens(atividade.itens, atividade.sortear, semente), [atividade, semente]);
  const [i, setI] = useState(0);
  const [erros, setErros] = useState(0);
  const [marcadas, setMarcadas] = useState<string[]>([]);
  const [acertou, setAcertou] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);
  const [selecionada, setSelecionada] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const tentativas = useRef<ReturnType<typeof tentativa>[]>([]);
  const deNovo = useRef(0);
  const respostas = useRef<string[]>([]);
  const inicio = useRef(Date.now());
  const vivo = useRef(true);
  const item = itens[i];
  const opcoes = useMemo(() => (item ? embaralhar(item.opcoes, semente ? semente + i * 7919 : 0) : []), [item, semente, i]);
  const ehLeitura = !!item?.mostrar;
  const comBotoesDeSom = !!item?.opcoes.some((o) => o.botaoDeSom);

  const quemOuvir = item?.quem ?? atividade.enunciado.quem;
  /** O estímulo do item: o som real da letra (2 vezes) quando existe; senão a fala gravada. */
  const tocarItem = async (vezes = 2) => {
    if (item?.somAlvo && (await voz.temSomReal(item.somAlvo))) { await voz.somReal(item.somAlvo, vezes); return; }
    if (item?.ouvir) return voz.falar(textoVoz(item.ouvir, crianca), { quem: quemOuvir });
    if (item?.mostrar && i === 0) return falar(atividade.enunciado, crianca);
  };

  useEffect(() => {
    vivo.current = true;
    return () => { vivo.current = false; };
  }, []);
  useEffect(() => {
    let atual = true;
    respostas.current = [];
    (async () => {
      if (i === 0) await falar(atividade.enunciado, crianca);
      if (atual && (item?.somAlvo || item?.ouvir)) await tocarItem();
      if (atual) inicio.current = Date.now();
    })();
    return () => { atual = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i]);

  if (!item) return null;
  const certa = item.opcoes.find((o) => o.id === item.correta)!;
  const diz = (texto: string, quem: 'sofia' | 'tales' = 'sofia') => voz.falar(textoVoz(texto, crianca), { quem });

  /** Tocar num botão de som: só ouve (e marca a escolha). */
  const ouvirOpcao = async (o: Opcao) => {
    if (acertou || ocupado) return;
    efeitos.toque();
    setSelecionada(o.id);
    if (o.som && (await voz.temSomReal(o.som))) await voz.somReal(o.som, 1);
    else if (o.falar) await voz.falar(o.falar, { quem: 'sofia' });
  };

  /**
   * Correção contrastiva do 1º erro. Devolve false quando não há som real para os dois lados (aí vale a escada
   * antiga: "Quase! Escuta comigo de novo." e o estímulo outra vez).
   */
  const corrigir = async (o: Opcao): Promise<boolean> => {
    const somCerto = item.somCorreta ?? item.somAlvo ?? certa.som;
    if (!o.som || !somCerto || o.som === somCerto) return false;
    if (!(await voz.temSomReal(o.som)) || !(await voz.temSomReal(somCerto))) return false;
    const contraste = item.contraste ?? contrasteDosSons(o.som, somCerto);
    setAviso(contraste === 'voz' ? 'Um som tem voz e o outro não. Escute os dois e tente de novo.'
      : contraste === 'desenho' ? 'Essas letras se parecem. Olhe bem o desenho e tente de novo.'
        : 'São dois sons diferentes. Escute os dois e tente de novo.');
    // 1. o que a criança escolheu
    if (o.botaoDeSom) await diz(F.voceEscolheu);
    else if (o.letra) await diz(temFrasesDoPar(o.som, somCerto) && contraste !== 'desenho' ? FALAS_DOS_PARES[o.som].tocou : F.letraFaz);
    else if (item.formato === 'som-cena') await diz(F.cenaFaz);
    else { if (o.falar) await voz.falar(o.falar, { quem: 'sofia' }); await diz(F.figuraComeca); }
    if (!vivo.current) return true;
    await voz.somReal(o.som, 1);
    await espera(250);
    // 2. o que muda / o som certo
    if (contraste === 'voz' || (contraste === 'boca' && temFrasesDoPar(o.som, somCerto))) {
      // par confundível: o som de cada um, com o que muda ("O P não tem voz:" + som; "O B tem voz:" + som)
      await explicarContraste(o.som, somCerto, contraste);
    } else {
      await diz(certa.botaoDeSom ? F.somDaLetra : item.formato === 'figura-letra' ? F.palavraComeca : item.formato === 'fonema-falta' ? F.somQueFalta : F.euPedi);
      await voz.somReal(somCerto, 1);
      await espera(200);
      if (contraste) await explicarContraste(o.som, somCerto, contraste);
    }
    if (!vivo.current) return true;
    await diz(F.tentaDeNovo);
    // 3. o estímulo de novo, para a nova tentativa
    if (item.somAlvo || (item.ouvir && !item.mostrarFigura)) await tocarItem(1);
    return true;
  };

  const escolher = async (o: Opcao) => {
    if (acertou || ocupado) return;
    efeitos.toque();
    respostas.current.push(idRegistro(o));
    if (o.id === item.correta) {
      setAcertou(true);
      efeitos.acerto();
      // "qual sílaba falta" fica na habilidade SÍLABA e como exposição: nunca vale como domínio da letra nem da leitura
      // (regra 6: a sílaba vale na escuta; para ler e escrever a peça é a letra; docs/pedagogia/04 §2)
      const porSilaba = item.formato === 'silaba-falta';
      tentativas.current.push(tentativa(porSilaba ? 'silaba' : item.habilidade ?? atividade.habilidade, sessao, cenaId, erros, {
        pseudo: item.pseudo, revisao, mecanica: 'escolher', tipo: porSilaba ? 'exposicao' : 'avaliada', ...(item.formato ? { formato: item.formato } : {}),
        alvo: idRegistro(certa), categoria: categoriaDoItem(item, certa), escolhido: respostas.current[0], respostas: [...respostas.current],
        distratores: item.opcoes.filter((x) => x.id !== item.correta).map(idRegistro), tempoMs: Date.now() - inicio.current, tentativaNumero: erros + 1
      }));
      if (erros > 0) deNovo.current++;
      setAviso(null);
      // tocar na figura fala o nome dela (a criança confirma o que escolheu)
      if (!o.letra && !o.botaoDeSom && o.falar && (item.somAlvo || item.formato === 'som-figura')) { await voz.falar(o.falar, { quem: 'sofia' }); await espera(150); }
      if (item.apoio && erros <= 1) {
        // apoio depois do acerto, com o nome da letra: "Isso! Esse é o som do B."
        const quem = item.apoio.quem === 'tales' ? 'tales' : 'sofia';
        if (voz.temTodas([item.apoio.texto], quem)) await diz(item.apoio.texto, quem);
        else await diz(F.essaEALetra, quem);
      } else {
        const frase = erros > 1 ? FALAS.erroJunto.replace('?', '!') : atividade.comemora?.texto ?? FALAS.acertos[i % FALAS.acertos.length];
        await voz.falar(textoVoz(frase, crianca), { quem: atividade.comemora?.quem ?? 'sofia' });
      }
      await espera(500);
      if (!vivo.current) return;
      if (i + 1 < itens.length) {
        setI(i + 1); setErros(0); setMarcadas([]); setAcertou(false); setSelecionada(null);
      } else {
        onFim({ tentativas: tentativas.current, tentouDeNovo: deNovo.current });
      }
      return;
    }
    // erro acolhido
    const e = erros + 1;
    setErros(e);
    setMarcadas((m) => [...m, o.id]);
    setSelecionada(null);
    efeitos.suave();
    setOcupado(true);
    try {
      if (e === 1) {
        if (await corrigir(o)) return;
        // sem som real para contrastar: escada antiga (a dica do conteúdo só existe nas letras do comportamento antigo)
        const dica = item.dica ?? FALAS.erro1;
        setAviso(dica);
        await voz.falar(textoVoz(dica, crianca), { quem: item.dica ? item.quemDica ?? 'sofia' : 'sofia' });
        if (item.ouvir || item.somAlvo) await tocarItem(1);
        else if (item.mostrar && item.leitura && !comBotoesDeSom) await voz.falar(item.mostrar.split(/[\s(]/)[0].toLowerCase().replace(/_/g, ''), { quem: 'sofia' });
      } else {
        // 3ª tentativa: a resposta aparece (brilha) e o item fica registrado "com ajuda"
        setAviso(FALAS.erro2);
        await voz.falar(textoVoz(FALAS.erro2, crianca), { quem: 'sofia' });
      }
    } finally {
      if (vivo.current) setOcupado(false);
    }
  };

  const temArte = (o: Opcao) => !!caminhoFigura(o.figura, o.id);
  const mostrarRotulo = (o: Opcao) => !!o.rotulo && (!temArte(o) || o.id === 'sim' || o.id === 'nao' || o.rotulo.startsWith('"'));
  const temOuvir = !!(item.ouvir || item.somAlvo);
  return (
    <div className={`mec mec-escolher estilo-${atividade.estilo ?? 'tocar'}`} data-formato={item.formato ?? ''} data-item={i}>
      {oferecerJogo && i === 0 && !acertou && !marcadas.length ? (
        <button className={`jogo-desafio ${oferecerJogo.jogo === 'come-som' ? 'come' : ''}`} onClick={() => { voz.parar(); efeitos.toque(); oferecerJogo.iniciar(); }} data-testid="oferecer-jogo" data-jogo={oferecerJogo.jogo}>
          <span className="jogo-desafio-ic"><Icone nome={oferecerJogo.jogo === 'come-som' ? 'coracao' : 'raio'} /></span>
          <span className="rot">{oferecerJogo.jogo === 'come-som' ? 'Dar comida ao Bolota' : 'Jogar no Corre-Som'}</span>
        </button>
      ) : null}
      <Balao fala={atividade.enunciado} crianca={crianca} humor={atividade.estilo === 'ensinar' ? 'pensando' : 'alegre'} />
      <Progressinho atual={i} total={itens.length} />
      <div className="pergunta">
        {temOuvir ? <BotaoOuvir onClick={() => { if (!ocupado) tocarItem(); }} rotulo="Ouvir de novo" /> : null}
        {ehLeitura ? <div className="palavra-grande" data-testid="palavra-lida">{item.mostrar}</div> : null}
        {item.mostrarFigura ? <div className="figura-pergunta" data-testid="figura-pergunta"><Figura palavra={item.mostrarFigura} /></div> : null}
        {temOuvir && !ehLeitura && !item.mostrarFigura ? <span className="dica-ouvir">Toque no alto-falante para ouvir de novo</span> : null}
      </div>
      <div className={`opcoes n${opcoes.length} ${comBotoesDeSom ? 'opcoes-som' : ''} ${ocupado ? 'ouvindo' : ''}`} role="group" aria-label="Opções">
        {opcoes.map((o, k) => {
          const modelo = erros >= 2 && o.id === item.correta;
          const ehCerta = acertou && o.id === item.correta;
          const rotuloAria = o.botaoDeSom ? `Som ${k + 1}: toque para ouvir` : o.letra ? `Letra ${o.letra}` : o.rotulo || `Figura ${k + 1}`;
          // R10 (docs/pedagogia/04): a figura tem um botãozinho que fala o nome combinado dela, sem marcar resposta
          const falaNome = !o.letra && !o.botaoDeSom && !!o.falar && o.id !== 'sim' && o.id !== 'nao';
          return (
            <div key={o.id} className="opcao-caixa">
              <button
                className={`opcao ${o.letra ? 'opcao-letra' : ''} ${o.botaoDeSom ? 'opcao-som' : ''} ${selecionada === o.id ? 'sel' : ''} ${modelo ? 'modelo' : ''} ${ehCerta ? 'certa' : ''} ${marcadas.includes(o.id) && !ehCerta ? 'tentada' : ''}`}
                onClick={() => (o.botaoDeSom ? ouvirOpcao(o) : escolher(o))}
                aria-label={rotuloAria}
                aria-pressed={o.botaoDeSom ? selecionada === o.id : undefined}
                data-opcao={o.id}
                data-correta={o.id === item.correta ? '1' : undefined}
              >
                {o.botaoDeSom ? <span className="som-botao"><Icone nome="som" /><b>{k + 1}</b></span>
                  : o.letra ? <span className="letra">{o.letra}</span> : <Figura emoji={o.figura || undefined} palavra={o.id} />}
                {mostrarRotulo(o) && !o.letra && !o.botaoDeSom ? <span className="rot">{o.rotulo}</span> : null}
                {ehCerta ? <Brilho ativo /> : null}
              </button>
              {falaNome ? <button className="opcao-ouvir" aria-label={`Ouvir o nome da figura ${k + 1}`} data-testid="ouvir-figura" disabled={ocupado || acertou} onClick={() => { efeitos.toque(); void voz.falar(o.falar!, { quem: 'sofia' }); }}><Icone nome="som" /></button> : null}
            </div>
          );
        })}
      </div>
      {comBotoesDeSom ? (
        <div className="linha-botoes">
          <button className="btn grande verde" data-testid="confirmar-som" disabled={!selecionada || acertou || ocupado} onClick={() => { const o = item.opcoes.find((x) => x.id === selecionada); if (o) escolher(o); }}>
            <Icone nome="check" />É este!
          </button>
        </div>
      ) : null}
      {aviso ? <p className="aviso-acolhe" role="status"><Icone nome="dica" /><span>{aviso.replace('[NOME]', crianca.nome)}</span></p> : null}
    </div>
  );
}
