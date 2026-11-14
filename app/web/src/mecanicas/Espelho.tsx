import { Figura, Icone } from '../componentes/ui.tsx';
import { useEffect, useState } from 'react';
import { som, type AtividadeEspelho } from '@fonema/conteudo';
import { infoNome } from '@fonema/motor';
import { Balao, Brilho } from '../componentes/basicos.tsx';
import { EspelhoBoca, useEspelhoEmbed } from '../componentes/EspelhoDoSom.tsx';
import { efeitos } from '../servicos/efeitos.ts';
import { espera } from '../servicos/ambiente.ts';
import { voz } from '../servicos/voz.ts';
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

  const quem = atividade.voz ?? 'sofia';
  const mostrar = async (lento = false) => {
    setFalando(true);
    // Trilha do Alfabeto: consoante usa "B, de bola." (uma vez) no lugar do som isolado, até a gravação da fonoaudióloga
    for (let k = 0; k < (atividade.falaSom ? 1 : 2); k++) {
      await voz.falar(atividade.falaSom ?? s.esticado, { quem, rate: lento ? 0.6 : 0.8 });
      setLetra(true);
      await espera(300);
    }
    setFalando(false);
  };

  useEffect(() => {
    (async () => {
      await falar(atividade.enunciado, crianca);
      await mostrar();
      if (atividade.falaAncora !== undefined) { if (atividade.falaAncora) await voz.falar(atividade.falaAncora, { quem }); }
      else await voz.falar(ehNome ? `${crianca.pronuncia.fala}!` : `${s.esticado}… ${atividade.ancora.texto}!`, { quem });
      if (nome.nota && ehNome) await voz.falar(nome.nota, { quem });
      await voz.falar(textoVoz('Agora é a sua vez, [NOME]!', crianca), { quem });
      setFase('vez');
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fiz = async () => {
    setFase('feito');
    efeitos.acerto();
    await voz.falar(textoVoz(atividade.comemora?.texto ?? 'Isso! Você fez o som!', crianca), { quem: atividade.comemora?.quem ?? 'sofia' });
    await espera(400);
    onFim({ tentativas: [tentativa(atividade.habilidade, sessao, cenaId, dica ? 1 : 0)], tentouDeNovo: 0 });
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
        <button className="btn" onClick={() => mostrar()}><Icone nome="som" />Ouvir o som</button>
        <button className="btn" onClick={() => mostrar(true)}><Icone nome="tartaruga" />Bem devagar</button>
        {fase !== 'mostra' && !atividade.falaSom && atividade.falaAncora === undefined ? <button className="btn" onClick={async () => { setDica(true); await voz.falar(s.correcao, { quem: 'sofia' }); }}><Icone nome="dica" />Dica de boca</button> : null}
        <button className="btn grande verde" onClick={fiz} disabled={fase !== 'vez'} data-testid="fiz-o-som"><Icone nome="check" />Eu fiz o som!</button>
      </div>
      {fase === 'feito' ? <Brilho ativo /> : null}
    </div>
  );
}
