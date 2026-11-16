/**
 * Barra da vila (doca) para quem ainda não lê: poucas portas grandes no caminho principal e um botão "Mais"
 * que abre um painel grande com os outros lugares. Nada foi removido (regra 7): Alfabeto, Sons, Álbum, Ilhas,
 * Passear 3D e o Treino rápido continuam a um toque, agora dentro do "Mais".
 * Cada botão tem figura 3D, rótulo curto e um "toc" ao tocar (efeitos.toque; não há fala gravada para os rótulos).
 */
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { treinoDisponivel, type Progresso } from '@fonema/motor';
import { useApp } from '../../contexto.tsx';
import { navegar } from '../../rotas.ts';
import { Icone } from '../../componentes/ui.tsx';
import { asset } from '../../servicos/ambiente.ts';
import { efeitos } from '../../servicos/efeitos.ts';
import { BotaoTreino } from './Treino.tsx';
import '../../estilos-doca.css';

const ir = (rota: string) => { efeitos.toque(); navegar(rota); };

/** Livrinho 3D com a capa de uma história do Cantinho (ícone da Leitura). */
function Livrinho() {
  return (
    <span className="doca-livro" aria-hidden="true">
      <span className="doca-livro-capa" style={{ backgroundImage: `url(${asset('historias/bolota-chuva/capa.webp')})` }} />
    </span>
  );
}

/** Quatro lugares em miniatura: o "Mais" mostra que ali dentro há outros lugares. */
function Mosaico() {
  return (
    <span className="doca-mosaico" aria-hidden="true">
      <span className="doca-mosaico-abc">Aa</span>
      <Icone nome="som" />
      <Icone nome="album" />
      <Icone nome="mapa" />
    </span>
  );
}

function BotaoDoca({ onClick, figura, rotulo, testid, ponto, cor }: { onClick: () => void; figura: ReactNode; rotulo: string; testid?: string; ponto?: string; cor?: string }) {
  return (
    <button className={`doca2-btn ${cor ?? ''}`} onClick={onClick} data-testid={testid} data-ponto={ponto}>
      <span className="doca2-fig">{figura}</span>
      <span className="doca2-rotulo">{rotulo}</span>
    </button>
  );
}

export function DocaVila({ criancaId, progresso, faseId, mundo3d }: { criancaId: string; progresso: Progresso; faseId: string; mundo3d: boolean }) {
  const { config } = useApp();
  const [aberto, setAberto] = useState(false);
  // o treino do dia é decidido uma vez, como no BotaoTreino (marca o "Mais" com o rosto da Sofia)
  const [temTreino] = useState(() => !!treinoDisponivel(progresso, config, Date.now()));
  const c = `c/${criancaId}`;
  const lojinha = config.lojinha.naVila;

  const abrir = () => { efeitos.suave(); setAberto(true); };

  return (
    <>
      <nav className="hud-doca doca2 vidro" aria-label="Lugares da vila">
        <button className="btn ipe doca-missao doca2-missao brilha" onClick={() => ir(`${c}/fase/${faseId}`)} data-testid="ir-missao"><Icone nome="play" />Missão</button>
        <BotaoDoca onClick={() => ir(`${c}/leitura`)} figura={<Livrinho />} rotulo="Leitura" testid="ir-leitura" ponto="leitura" />
        <BotaoDoca onClick={() => ir(`${c}/brincar`)} figura={<img className="ic ic3d" src={asset('figuras/pandeiro.webp')} alt="" draggable={false} />} rotulo="Brincar" testid="ir-brincar" ponto="brincar" />
        {lojinha
          ? <BotaoDoca onClick={() => ir(`${c}/lojinha`)} figura={<Icone nome="lojinha" />} rotulo="Lojinha" testid="ir-lojinha" ponto="lojinha" />
          : <BotaoDoca onClick={() => ir(`${c}/avatar`)} figura={<Icone nome="casa" />} rotulo="Meu boneco" testid="ir-boneco" ponto="boneco" />}
        <button className={`doca2-btn doca2-mais ${temTreino ? 'com-treino' : ''}`} onClick={abrir} aria-haspopup="dialog" aria-expanded={aberto} data-testid="ir-mais">
          <span className="doca2-fig"><Mosaico /></span>
          <span className="doca2-rotulo">Mais</span>
          {temTreino ? <span className="doca2-aviso" aria-hidden="true"><img src={asset('modelos3d/sofia.webp')} alt="" draggable={false} /></span> : null}
        </button>
      </nav>
      {aberto ? <PainelMais c={c} criancaId={criancaId} progresso={progresso} lojinha={lojinha} mundo3d={mundo3d} fechar={() => setAberto(false)} /> : null}
    </>
  );
}

function PainelMais({ c, criancaId, progresso, lojinha, mundo3d, fechar }: { c: string; criancaId: string; progresso: Progresso; lojinha: boolean; mundo3d: boolean; fechar: () => void }) {
  const caixa = useRef<HTMLDivElement>(null);
  useEffect(() => {
    caixa.current?.querySelector<HTMLButtonElement>('.mais-item')?.focus();
    const tecla = (e: KeyboardEvent) => { if (e.key === 'Escape') fechar(); };
    window.addEventListener('keydown', tecla);
    return () => window.removeEventListener('keydown', tecla);
  }, [fechar]);

  const item = (rota: string, figura: ReactNode, rotulo: string, ponto: string, cor = '') => (
    <button className={`mais-item ${cor}`} onClick={() => ir(rota)} data-ponto={ponto}>
      <span className="mais-fig">{figura}</span>
      <span className="mais-rotulo">{rotulo}</span>
    </button>
  );

  return createPortal(
    <div className="mais-fundo" onClick={(e) => { if (e.target === e.currentTarget) fechar(); }}>
      <div className="mais-painel" role="dialog" aria-modal="true" aria-label="Mais lugares da vila" ref={caixa} data-testid="painel-mais">
        <div className="mais-cab">
          <span className="mais-titulo"><Mosaico />Mais lugares</span>
          <button className="hud-btn mais-fechar" onClick={() => { efeitos.suave(); fechar(); }} aria-label="Fechar" data-testid="fechar-mais"><Icone nome="x" /></button>
        </div>
        <div className="mais-grade">
          <BotaoTreino criancaId={criancaId} progresso={progresso} className="mais-item mais-treino" />
          {item(`${c}/alfabeto`, <span className="doca-abc mais-abc">Aa</span>, 'Alfabeto', 'alfabeto')}
          {item(`${c}/sons`, <img className="ic ic3d" src={asset('arte/icones/som.webp')} alt="" draggable={false} />, 'Sons', 'sons')}
          {item(`${c}/album`, <img className="ic ic3d" src={asset('arte/icones/album.webp')} alt="" draggable={false} />, 'Álbum', 'album')}
          {item(`${c}/mapa`, <img className="ic ic3d" src={asset('arte/icones/mapa.webp')} alt="" draggable={false} />, 'Ilhas', 'ilhas')}
          {lojinha ? item(`${c}/avatar`, <img className="ic ic3d" src={asset('arte/icones/casa.webp')} alt="" draggable={false} />, 'Meu boneco', 'boneco') : null}
          {mundo3d ? item(`${c}/mundo`, <Icone nome="cubo" />, 'Passear 3D', 'mundo3d') : null}
        </div>
      </div>
    </div>,
    document.body
  );
}
