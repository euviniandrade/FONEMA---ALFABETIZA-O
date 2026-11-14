import { useEffect, useState, type ReactNode } from 'react';
import type { Fala, Personagem } from '@fonema/conteudo';
import type { Crianca } from '@fonema/motor';
import { asset } from '../servicos/ambiente.ts';
import { NOMES_PERSONAGEM, falar, textoTela } from '../util.ts';
import { useApp } from '../contexto.tsx';
import { navegar } from '../rotas.ts';
import { Icone, Logo } from './ui.tsx';
import { Camada } from './Camada.tsx';
import { PersonagemVivo, temBustoVivo } from './PersonagemVivo.tsx';

const BUSTO: Partial<Record<Personagem, string>> = { sofia: 'dupla/sofia-busto-alegre.webp', tales: 'dupla/tales-busto-alegre.webp' };
const COR: Record<string, string> = { bolota: '#A06A3B', 'dona-cida': '#B5512E', davi: '#2E7A4C', 'guarda-parque': '#1F5A37', pescadora: '#3D7CC4', 'zum-zum': '#6B7A2E' };

export function Rosto({ quem, humor = 'alegre', tamanho = 84 }: { quem: Personagem; humor?: string; tamanho?: number }) {
  const h = quem === 'tales' ? ({ curiosa: 'curioso', surpresa: 'surpreso' } as Record<string, string>)[humor] ?? humor : ({ curioso: 'curiosa', surpreso: 'surpresa' } as Record<string, string>)[humor] ?? humor;
  const src = quem === 'sofia' || quem === 'tales' ? asset(`dupla/${quem}-busto-${h}.webp`) : undefined;
  if (src || BUSTO[quem]) {
    return <img className="rosto" style={{ width: tamanho, height: tamanho }} src={src ?? asset(BUSTO[quem]!)} alt={NOMES_PERSONAGEM[quem]} onError={(e) => ((e.target as HTMLImageElement).src = asset(BUSTO[quem]!))} />;
  }
  const bicho = ({ bolota: 'tatu', 'dona-cida': 'vovo-f', 'zum-zum': 'abelha' } as Record<string, string>)[quem];
  if (bicho) return <img className="rosto rosto-bicho" style={{ width: tamanho, height: tamanho }} src={asset(`figuras/${bicho}.webp`)} alt={NOMES_PERSONAGEM[quem]} />;
  return (
    <span className="rosto rosto-letra" style={{ width: tamanho, height: tamanho, background: COR[quem] ?? '#284A86', fontSize: tamanho * 0.42 }} aria-label={NOMES_PERSONAGEM[quem]}>
      {NOMES_PERSONAGEM[quem]?.[0]}
    </span>
  );
}

/** Balão de fala com o nome do personagem e botão "ouvir" (áudio em todo texto). */
export function Balao({ fala, crianca, auto = false, humor, extras, destaque = false }: { fala: Fala; crianca?: Crianca; auto?: boolean; humor?: string; extras?: Record<string, string | number>; destaque?: boolean }) {
  useEffect(() => {
    if (auto) falar(fala, crianca, extras);
  }, [auto, fala, crianca, extras]);
  return (
    <div className={`balao ${destaque ? 'balao-destaque' : ''}`} data-quem={fala.quem}>
      {/* D027: a Sofia e o Tales falam de verdade — busto vivo com a boca sincronizada à voz */}
      {temBustoVivo(fala.quem) ? <PersonagemVivo quem={fala.quem} modo="busto" className="rosto" texto={textoTela(fala.texto, crianca, extras)} /> : <Rosto quem={fala.quem} humor={humor} />}
      <div className="balao-texto">
        <b className="balao-quem">{NOMES_PERSONAGEM[fala.quem]}</b>
        <p>{textoTela(fala.texto, crianca, extras)}</p>
      </div>
      <BotaoOuvir onClick={() => falar(fala, crianca, extras)} />
    </div>
  );
}

export function BotaoOuvir({ onClick, rotulo = 'Ouvir' }: { onClick: () => void; rotulo?: string }) {
  return (
    <button className="ouvir" onClick={onClick} aria-label={rotulo} title={rotulo}>
      <Icone nome="som" />
    </button>
  );
}

export function Moedinhas({ valor, id }: { valor: number; id?: string }) {
  return (
    <div className="moedas" id={id} aria-live="polite" data-testid="moedinhas">
      <img src={asset('recompensas/cofrinho-tatu.webp')} alt="" />
      <b>{valor}</b>
      <span className="sr">moedinhas</span>
    </div>
  );
}

/** Ajustes de acessibilidade num só botão do HUD (voz, alto contraste, reduzir movimento). O painel abre numa Camada, sempre por cima de tudo. */
export function Ajustes() {
  const { prefs, setPrefs } = useApp();
  const [aberto, setAberto] = useState(false);
  const itens: [keyof typeof prefs, string, string, string][] = [
    ['vozLigada', 'som', 'Voz e sons', 'A Sofia e o Tales falam tudo'],
    ['contraste', 'contraste', 'Alto contraste', 'Cores mais fortes para ler'],
    ['menosMovimento', 'tartaruga', 'Menos movimento', 'Sem animações rápidas']
  ];
  return (
    <div className="ajustes">
      <button className="hud-btn" aria-expanded={aberto} aria-haspopup="dialog" aria-label="Configurações: voz, contraste e movimento" onClick={() => setAberto(true)} data-testid="abrir-ajustes"><Icone nome="engrenagem" /></button>
      {aberto ? (
        <Camada titulo="Configurações" aoFechar={() => setAberto(false)} posicao="canto" testId="ajustes-painel">
          <div className="ajustes-lista" role="group" aria-label="Ajustes de acessibilidade">
            {itens.map(([k, ic, t, d]) => (
              <button key={k} className="ajuste" role="switch" aria-checked={prefs[k]} onClick={() => setPrefs({ [k]: !prefs[k] })} data-ajuste={k}>
                <Icone nome={ic} />
                <span><b>{t}</b><small>{d}</small></span>
                <i className="chave" aria-hidden="true" />
              </button>
            ))}
          </div>
          <button className="btn pri ajustes-pronto" onClick={() => setAberto(false)}><Icone nome="check" />Pronto</button>
        </Camada>
      ) : null}
    </div>
  );
}

/** HUD do topo (estilo jogo): voltar, marca, avatar, miolo livre, moedinhas no cofrinho-tatu e ajustes. */
export function Topo({ crianca, moedinhas, voltar, titulo, children }: { crianca?: Crianca; moedinhas?: number; voltar?: string; titulo?: string; children?: ReactNode }) {
  return (
    <header className="topo">
      <div className="topo-esq">
        {voltar !== undefined ? (
          <button className="hud-btn" onClick={() => navegar(voltar)} aria-label="Voltar"><Icone nome="voltar" /></button>
        ) : null}
        {crianca ? <div className="hud-perfil"><AvatarMini crianca={crianca} tamanho={52} /><div><b>{crianca.nome}</b>{titulo ? <small>{titulo}</small> : null}</div></div> : (
          <div className="hud-marca"><Logo tamanho="p" />{titulo ? <small>{titulo}</small> : null}</div>
        )}
      </div>
      <div className="topo-meio">{children}</div>
      <div className="topo-dir">
        {moedinhas !== undefined ? <Moedinhas valor={moedinhas} id="cofre-topo" /> : null}
        <Ajustes />
      </div>
    </header>
  );
}

const CANTINHO: Record<string, string> = { mata: '#3E9A63', ipe: '#F4B73C', ceu: '#A8D5F2', barro: '#C9714C' };
export function AvatarMini({ crianca, tamanho = 56 }: { crianca: Crianca; tamanho?: number }) {
  return (
    <div className="avatar-mini" style={{ background: CANTINHO[crianca.avatar.cantinho] ?? '#A8D5F2', width: tamanho, height: tamanho }}>
      <img src={asset(`avatar/${crianca.avatar.base}.webp`)} alt={`Personagem de ${crianca.nome}`} />
    </div>
  );
}
export function AvatarGrande({ crianca, itens = [] }: { crianca: Crianca; itens?: string[] }) {
  return (
    <div className="avatar-grande" style={{ ['--cantinho' as string]: CANTINHO[crianca.avatar.cantinho] ?? '#A8D5F2' }}>
      <img src={asset(`avatar/${crianca.avatar.base}.webp`)} alt={`Personagem de ${crianca.nome}`} />
      {itens.length ? (
        <div className="avatar-itens">{itens.slice(0, 4).map((i) => <img key={i} src={asset(`itens/${i}.webp`)} alt={i} />)}</div>
      ) : null}
    </div>
  );
}

/** Brilho de 1 s no acerto (6–12 partículas), sem tela cheia. */
export function Brilho({ ativo }: { ativo: boolean }) {
  const [k, setK] = useState(0);
  useEffect(() => { if (ativo) setK((x) => x + 1); }, [ativo]);
  if (!ativo) return null;
  return (
    <div className="brilho" key={k} aria-hidden="true">
      {Array.from({ length: 10 }, (_, i) => <i key={i} style={{ ['--a' as string]: `${i * 36}deg` }} />)}
    </div>
  );
}

export function Carregando() {
  return <div className="carregando" role="status"><span className="carregando-bola" aria-hidden="true" /><span className="sr">Carregando…</span></div>;
}
