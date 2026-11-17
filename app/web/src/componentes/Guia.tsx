/**
 * D032 item 2 — PAINEL GUIA (vila e trilhas) e as peças que o tutorial também usa:
 * - BarraMissao: a barrinha da missão, com um pontinho por passo (ícones, nunca o nome do método);
 * - CaminhoEtapas: o caminho do que a criança vai aprender (etapas de conteudo/caminho.ts, "Você está aqui");
 * - PainelGuia: nível, estrelinhas e selos da última missão, a missão de hoje com "Continuar" e a etapa atual.
 *   No PC/tablet deitado fica ao lado; no celular fica em cima, recolhido numa faixa que abre ao tocar.
 * Nada aqui avalia: só mostra o que o motor já calculou (guia.ts, nivel.ts).
 */
import { useState, type CSSProperties } from 'react';
import { CONQUISTA_POR_ID, FALAS_TUTORIAL, FASE_POR_ID, type EtapaCaminho } from '@fonema/conteudo';
import { calcularNivel, estadoDoCaminho, fasesConcluidas, infoNome, missaoDeHoje, missaoInicialFeita, tutorialNovo, type Crianca, type EstadoEtapa, type Progresso } from '@fonema/motor';
import { navegar } from '../rotas.ts';
import { asset } from '../servicos/ambiente.ts';
import { efeitos } from '../servicos/efeitos.ts';
import { falar, textoTela } from '../util.ts';
import { AvatarMini } from './basicos.tsx';
import { Icone } from './ui.tsx';
import { Selo } from './recompensas.tsx';
import '../estilos-guia.css';

/* ------------------------------------------------------------ barra da missão ------------------------------------------------------------ */

/**
 * Barrinha da missão: trilho que enche + um pontinho por passo (feito = check verde, agora = estrela dourada).
 * `feitos` pode ser fracionário só para a animação do tutorial; `fim` desenha o baú no fim do trilho.
 */
export function BarraMissao({ passos, feitos, agora, grande = false, rotulo, className = '' }: { passos: number; feitos: number; agora?: number; grande?: boolean; rotulo?: string; className?: string }) {
  const n = Math.max(1, passos);
  const pct = Math.max(0, Math.min(1, feitos / n));
  return (
    <div className={`barra-missao ${grande ? 'grande' : ''} ${pct >= 1 ? 'cheia' : ''} ${className}`} role="progressbar" aria-valuemin={0} aria-valuemax={n} aria-valuenow={Math.floor(feitos)} aria-label={rotulo ?? `Missão: ${Math.floor(feitos)} de ${n} passos`} data-testid="barra-missao">
      <div className="bm-trilho"><i className="bm-enche" style={{ width: `${pct * 100}%` }} /></div>
      <ol className="bm-pontos" aria-hidden="true">
        {Array.from({ length: n }, (_, i) => (
          <li key={i} className={i < Math.floor(feitos) ? 'feito' : i === (agora ?? -1) ? 'agora' : ''} style={{ left: `${((i + 1) / (n + 1)) * 100}%` }}>
            {i < Math.floor(feitos) ? <Icone nome="check" /> : i === agora ? <Icone nome="estrela" /> : null}
          </li>
        ))}
      </ol>
      <span className="bm-fim" aria-hidden="true"><img src={asset('modelos3d/bau.webp')} alt="" draggable={false} /></span>
    </div>
  );
}

/* ---------------------------------------------------------------- caminho ---------------------------------------------------------------- */

export function FiguraEtapa({ etapa }: { etapa: EtapaCaminho }) {
  if (etapa.figura === 'abc') return <span className="etapa-abc" aria-hidden="true">Aa</span>;
  const capa = etapa.figura.startsWith('historias/');
  return <img className={`etapa-img ${capa ? 'capa' : ''}`} src={asset(etapa.figura)} alt="" draggable={false} />;
}

/**
 * O caminho em etapas. `destaque`: etapa iluminada agora (o tutorial acende uma de cada vez enquanto a Sofia fala).
 * `crianca` põe o rostinho dela na etapa de agora ("Você está aqui").
 */
export function CaminhoEtapas({ progresso, crianca, destaque, vistas, compacto = false }: { progresso: Progresso; crianca?: Crianca; destaque?: number[]; vistas?: number[]; compacto?: boolean }) {
  const etapas = estadoDoCaminho(progresso);
  return (
    <ol className={`caminho ${compacto ? 'compacto' : ''}`} aria-label="O caminho do que você vai aprender">
      {etapas.map(({ etapa, estado }, i) => (
        <li key={etapa.id} className={`etapa ${estado} ${destaque?.includes(i) ? 'acesa' : ''} ${vistas?.includes(i) ? 'vista' : ''}`} style={{ ['--i' as string]: i } as CSSProperties} data-etapa={etapa.id} data-estado={estado}
          aria-label={`${etapa.titulo}: ${ROTULO_ETAPA[estado]}`}>
          <span className="etapa-disco">
            <FiguraEtapa etapa={etapa} />
            {estado === 'feita' ? <span className="etapa-selo"><Icone nome="check" /></span> : null}
            {estado === 'trancada' ? <span className="etapa-cadeado"><img src={asset('arte/icones/cadeado.webp')} alt="" draggable={false} /></span> : null}
          </span>
          {!compacto ? <span className="etapa-nome">{etapa.titulo}</span> : null}
          {estado === 'agora' ? (
            <span className="etapa-aqui">
              {crianca ? <AvatarMini crianca={crianca} tamanho={compacto ? 30 : 44} /> : null}
              <b><Icone nome="estrela" />Você está aqui</b>
            </span>
          ) : null}
        </li>
      ))}
    </ol>
  );
}
const ROTULO_ETAPA: Record<EstadoEtapa, string> = { feita: 'já feita', agora: 'você está aqui', depois: 'vem depois', trancada: 'trancada, em breve' };

/* -------------------------------------------------------------- painel guia -------------------------------------------------------------- */

function Estrelinhas({ n }: { n: number }) {
  return (
    <span className="estrelinhas" role="img" aria-label={`${n} de 3 estrelinhas`}>
      {[0, 1, 2].map((i) => <Icone key={i} nome="estrela" className={i < n ? 'cheia' : ''} />)}
    </span>
  );
}

/**
 * Painel guia. `onde`: 'vila' (sobre o mapa, ao lado no PC e numa faixa recolhível no celular) ou 'trilha' (dentro da página
 * rolável: ao lado no PC, no topo no celular).
 */
export function PainelGuia({ crianca, progresso, onde }: { crianca: Crianca; progresso: Progresso; onde: 'vila' | 'trilha' }) {
  const [aberto, setAberto] = useState(false);
  const agora = Date.now();
  const nivel = calcularNivel(progresso.desafios, missaoInicialFeita(progresso), fasesConcluidas(progresso));
  const missao = missaoDeHoje(progresso, agora);
  const fase = FASE_POR_ID[missao.faseId];
  const caminho = estadoDoCaminho(progresso);
  const etapaAgora = caminho.find((e) => e.estado === 'agora')?.etapa;
  const ultima = progresso.ultimaMissao;
  const letra = infoNome(crianca.nome, crianca.pronuncia.grafia).letras;
  const total = Math.min(8, nivel.custoProximo || 1);
  const feitosNivel = Math.round(((nivel.desafiosNoNivel || 0) / (nivel.custoProximo || 1)) * total);
  const novo = tutorialNovo(progresso);
  const c = `c/${crianca.id}`;
  const continuar = () => { efeitos.toque(); navegar(`${c}/fase/${missao.faseId}`); };

  return (
    <aside className={`guia guia-${onde} ${aberto ? 'aberto' : ''}`} aria-label="Seu guia" data-testid="painel-guia">
      {/* celular: faixa recolhida (toque para abrir) */}
      <button className="guia-faixa vidro" onClick={() => { efeitos.suave(); setAberto((a) => !a); }} aria-expanded={aberto} aria-controls={`guia-corpo-${onde}`} data-testid="guia-abrir">
        {etapaAgora ? <span className="guia-faixa-fig"><FiguraEtapa etapa={etapaAgora} /></span> : null}
        <span className="guia-faixa-txt"><b>{nivel.nivel > 0 ? `Nível ${nivel.nivel}` : 'Começando'}</b><small>{etapaAgora ? etapaAgora.titulo : 'Seu guia'}</small></span>
        <BarraMissao passos={missao.passos} feitos={missao.feitaHoje ? missao.passos : 0} agora={missao.feitaHoje ? undefined : 0} className="guia-faixa-barra" />
        <span className="guia-faixa-seta"><Icone nome={aberto ? 'x' : 'mais'} /></span>
      </button>

      <div className="guia-corpo vidro" id={`guia-corpo-${onde}`}>
        <section className="guia-bloco guia-nivel">
          <AvatarMini crianca={crianca} tamanho={56} />
          <div>
            <b className="guia-titulo">{nivel.nivel > 0 ? `Nível ${nivel.nivel}` : 'Começando'}</b>
            {nivel.titulo ? <small>{nivel.rotulo}</small> : <small>{textoTela('Rumo ao nível 1, [NOME]!', crianca)}</small>}
            <span className="bo-bolinhas" aria-label={nivel.nivel > 0 ? `Faltam ${nivel.faltam} desafios para o próximo nível` : 'A primeira missão leva ao nível 1'}>
              {Array.from({ length: nivel.nivel > 0 ? total : 1 }, (_, i) => <i key={i} className={i < feitosNivel ? 'cheia' : ''} />)}
            </span>
          </div>
        </section>

        <section className="guia-bloco guia-ultima" aria-label="Sua última missão">
          <h3 className="guia-rotulo">Última missão</h3>
          {ultima ? (
            <div className="guia-ultima-linha">
              <Estrelinhas n={ultima.estrelas} />
              <span className="guia-selos">
                {ultima.selos.slice(0, 3).map((id) => CONQUISTA_POR_ID[id] ? <span key={id} className="guia-selo"><Selo conquista={CONQUISTA_POR_ID[id]} ganha={progresso.conquistas[id]} letra={letra} tamanho={44} /></span> : null)}
              </span>
            </div>
          ) : <p className="guia-vazio"><Icone nome="estrela" />A primeira está esperando!</p>}
        </section>

        <section className="guia-bloco guia-missao" aria-label="Missão de hoje">
          <h3 className="guia-rotulo">{missao.feitaHoje ? 'Missão de hoje: feita!' : 'Missão de hoje'}</h3>
          <p className="guia-fase">{fase?.titulo}</p>
          <BarraMissao passos={missao.passos} feitos={missao.feitaHoje ? missao.passos : 0} agora={missao.feitaHoje ? undefined : 0} rotulo={missao.feitaHoje ? 'Missão de hoje feita' : `Missão de hoje: ${missao.passos} passos`} />
          <button className="btn enorme ipe brilha guia-continuar" onClick={continuar} data-testid="guia-continuar"><Icone nome="play" />{progresso.sessoesFeitas ? 'Continuar' : 'Começar'}</button>
        </section>

        {etapaAgora ? (
          <section className="guia-bloco guia-caminho" aria-label="Onde você está no caminho">
            <h3 className="guia-rotulo">O seu caminho</h3>
            <CaminhoEtapas progresso={progresso} compacto />
            <button className="guia-aqui" onClick={() => { const f = etapaAgora.fala ?? FALAS_TUTORIAL.aqui; void falar(f, crianca); }} aria-label={`Você está aqui: ${etapaAgora.titulo}. Ouvir`}>
              <span className="guia-aqui-fig"><FiguraEtapa etapa={etapaAgora} /></span>
              <span><small>Você está aqui</small><b>{etapaAgora.titulo}</b></span>
              <Icone nome="som" />
            </button>
          </section>
        ) : null}

        <button className={`guia-como ${novo ? 'novo' : ''}`} onClick={() => { efeitos.toque(); navegar(`${c}/tutorial/de-novo`); }} data-testid="como-jogar">
          <img src={asset('dupla/sofia-busto-alegre.webp')} alt="" draggable={false} />
          <span>Como jogar?</span>
          {novo ? <em className="guia-novo" aria-label="novidade"><Icone nome="estrela" /></em> : null}
        </button>
      </div>
    </aside>
  );
}
