import { Figura, Icone } from '../componentes/ui.tsx';
import { useEffect, useRef, useState } from 'react';
import { som, type AtividadeEspelho } from '@fonema/conteudo';
import { infoNome } from '@fonema/motor';
import { Balao, Brilho } from '../componentes/basicos.tsx';
import { EspelhoBoca, useEspelhoEmbed } from '../componentes/EspelhoDoSom.tsx';
import { efeitos } from '../servicos/efeitos.ts';
import { espera } from '../servicos/ambiente.ts';
import { voz } from '../servicos/voz.ts';
import { useDestravar } from '../servicos/destravar.ts';
import { BotaoOuvindo } from '../componentes/BotaoOuvindo.tsx';
import { falar, textoVoz } from '../util.ts';
import { tentativa, type PropsMecanica } from './comum.tsx';

/**
 * C2 · Eu faço (Espelho do Som): fundo limpo; som ×2 → boca de frente e raio-X → a letra surge no instante
 * do som → palavra-âncora → "Agora é a sua vez, [NOME]!". Erro de articulação: dica do catálogo (§5.2).
 */
export function Espelho({ atividade, crianca, sessao, cenaId, onFim }: PropsMecanica<AtividadeEspelho>) {
  const s = som(atividade.fonema);
  const nome = infoNome(crianca.nome, crianca.pronuncia.grafia);
  const ehNome = atividade.ancora.texto === crianca.nome;
  const [letra, setLetra] = useState(false);
  const [falando, setFalando] = useState(false);
  const [fase, setFase] = useState<'mostra' | 'vez' | 'feito'>('mostra');
  const [dica, setDica] = useState(false);
  const [ouviuOSom, setOuviuOSom] = useState(false);
  const solto = useDestravar(fase === 'mostra');

  const quem = atividade.voz ?? 'sofia';
  const mostrar = async (lento = false) => {
    setFalando(true);
    // D029 §2: primeiro o SOM REAL da letra ("mmm"), depois o nome e a palavra-chave pela dupla ("M, de macaco.").
    // Sem som real para o fonema (reprovado na verificação e ainda não gravado no Estúdio), fica a fala da dupla.
    if (await voz.temSomReal(atividade.fonema)) {
      await voz.somReal(atividade.fonema, lento ? 1 : 2);
      setLetra(true);
      await espera(300);
      if (atividade.falaSom) await voz.falar(atividade.falaSom, { quem });
    } else {
      for (let k = 0; k < (atividade.falaSom ? 1 : 2); k++) {
        await voz.falar(atividade.falaSom ?? s.esticado, { quem });
        setLetra(true);
        await espera(300);
      }
    }
    setFalando(false);
  };

  /** A criança tocou em "Ouvir o som"/"Bem devagar" no meio da apresentação: o resto dela não toca por cima. */
  const mexeu = useRef(false);
  useEffect(() => {
    let vivo = true;
    const segue = () => vivo && !mexeu.current;
    (async () => {
      await falar(atividade.enunciado, crianca);
      if (segue()) await mostrar();
      if (vivo) setOuviuOSom(true); // o som já tocou: "Eu fiz o som!" libera (revisão 18/11, item 7)
      if (segue()) {
        if (atividade.falaAncora !== undefined) { if (atividade.falaAncora) await voz.falar(atividade.falaAncora, { quem }); }
        else await voz.falar(ehNome ? `${crianca.pronuncia.fala}!` : `${s.esticado}… ${atividade.ancora.texto}!`, { quem });
      }
      if (segue() && nome.nota && ehNome) await voz.falar(nome.nota, { quem });
      if (segue()) await voz.falar(textoVoz('Agora é a sua vez, [NOME]!', crianca), { quem });
      if (vivo) setFase((f) => (f === 'mostra' ? 'vez' : f));
    })();
    return () => { vivo = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const ouvirDeNovo = async (lento: boolean) => { mexeu.current = true; efeitos.toque(); await mostrar(lento); setFase((f) => (f === 'mostra' ? 'vez' : f)); };

  const fiz = async () => {
    mexeu.current = true;
    voz.parar(); // tocar em "Eu fiz o som!" corta a fala com fade
    setFase('feito');
    efeitos.acerto();
    await voz.falar(textoVoz(atividade.comemora?.texto ?? 'Isso! Você fez o som!', crianca), { quem: atividade.comemora?.quem ?? 'sofia' });
    await espera(400);
    onFim({ tentativas: [tentativa(atividade.habilidade, sessao, cenaId, dica ? 1 : 0, { tipo: 'exposicao', mecanica: 'espelho', alvo: atividade.fonema, categoria: 'fonema', tentativaNumero: 1 })], tentouDeNovo: 0 });
  };

  const letrasTela = atividade.letra;
  const embed = useEspelhoEmbed(); // o embed novo já traz a dica de boca na legenda
  return (
    <div className="mec mec-espelho licao">
      <Balao fala={atividade.enunciado} crianca={crianca} />
      <div className="espelho-palco">
        <EspelhoBoca fonema={atividade.fonema} falando={falando} />
        <div className="espelho-centro">
          <div className={`letra-surge ${letra ? 'visivel' : ''}`} aria-live="polite" data-testid="letra-espelho">
            {ehNome && nome.mudo ? <><span className="muda">{letrasTela.slice(0, nome.mudo)}</span>{letrasTela.slice(nome.mudo)}</> : letrasTela}
          </div>
          <div className="ancora"><Figura emoji={atividade.ancora.figura} palavra={ehNome ? undefined : atividade.ancora.texto} /> {atividade.ancora.texto}</div>
        </div>
      </div>
      {embed ? null : <p className="dica-boca"><Icone nome="boca" /><span>{s.dica}</span></p>}
      <div className="linha-botoes">
        <button className="btn" onClick={() => void ouvirDeNovo(false)}><Icone nome="som" />Ouvir o som</button>
        <button className="btn" onClick={() => void ouvirDeNovo(true)}><Icone nome="tartaruga" />Bem devagar</button>
        {fase !== 'mostra' && !atividade.falaSom && atividade.falaAncora === undefined ? <button className="btn" onClick={async () => { setDica(true); await voz.falar(s.correcao, { quem: 'sofia' }); }}><Icone nome="dica" />Dica de boca</button> : null}
        {/* ver e ouvir o som É a atividade: enquanto a dupla mostra, "Ouvindo…" animado (não um botão apagado) */}
        <BotaoOuvindo ouvindo={fase === 'mostra' && !solto && !ouviuOSom} onClick={fiz} disabled={fase === 'feito'} testId="fiz-o-som"><Icone nome="check" />Eu fiz o som!</BotaoOuvindo>
      </div>
      {fase === 'feito' ? <Brilho ativo /> : null}
    </div>
  );
}
