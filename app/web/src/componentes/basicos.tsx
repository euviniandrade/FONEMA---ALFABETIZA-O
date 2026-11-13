import { useEffect, useState, type ReactNode } from 'react';
import type { Fala, Personagem } from '@fonema/conteudo';
import type { Crianca } from '@fonema/motor';
import { asset } from '../servicos/ambiente.ts';
import { NOMES_PERSONAGEM, falar, textoTela } from '../util.ts';
import { useApp } from '../contexto.tsx';
import { navegar } from '../rotas.ts';

const BUSTO: Partial<Record<Personagem, string>> = { sofia: 'dupla/sofia-busto-alegre.webp', tales: 'dupla/tales-busto-alegre.webp' };
const COR: Record<string, string> = { bolota: '#A06A3B', 'dona-cida': '#B5512E', davi: '#2E7A4C', 'guarda-parque': '#1F5A37', pescadora: '#3D7CC4', 'zum-zum': '#6B7A2E' };

export function Rosto({ quem, humor = 'alegre', tamanho = 84 }: { quem: Personagem; humor?: string; tamanho?: number }) {
  const h = quem === 'tales' ? ({ curiosa: 'curioso', surpresa: 'surpreso' } as Record<string, string>)[humor] ?? humor : ({ curioso: 'curiosa', surpreso: 'surpresa' } as Record<string, string>)[humor] ?? humor;
  const src = quem === 'sofia' || quem === 'tales' ? asset(`dupla/${quem}-busto-${h}.webp`) : undefined;
  if (src || BUSTO[quem]) {
    return <img className="rosto" style={{ width: tamanho, height: tamanho }} src={src ?? asset(BUSTO[quem]!)} alt={NOMES_PERSONAGEM[quem]} onError={(e) => ((e.target as HTMLImageElement).src = asset(BUSTO[quem]!))} />;
  }
  return (
    <span className="rosto rosto-letra" style={{ width: tamanho, height: tamanho, background: COR[quem] ?? '#284A86', fontSize: tamanho * 0.42 }} aria-label={NOMES_PERSONAGEM[quem]}>
      {quem === 'bolota' ? '🦔' : NOMES_PERSONAGEM[quem]?.[0]}
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
      <Rosto quem={fala.quem} humor={humor} />
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
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" fill="#fff" /><path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" /></svg>
    </button>
  );
}

export function Moedinhas({ valor, id }: { valor: number; id?: string }) {
  return (
    <div className="moedas" id={id} aria-live="polite" data-testid="moedinhas">
      <img src={asset('recompensas/moeda.webp')} alt="" />
      <b>{valor}</b>
      <span className="sr">moedinhas</span>
    </div>
  );
}

export function Topo({ crianca, moedinhas, voltar, titulo, children }: { crianca?: Crianca; moedinhas?: number; voltar?: string; titulo?: string; children?: ReactNode }) {
  const { prefs, setPrefs } = useApp();
  return (
    <header className="topo">
      {voltar ? (
        <button className="btn-ic" onClick={() => navegar(voltar)} aria-label="Voltar"><span aria-hidden="true">←</span><small>Voltar</small></button>
      ) : null}
      <div className="marca" aria-label="FONEMA">
        <svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="22" fill="#1B3160" /><path d="M15 33V15h14v4h-9.5v3.6H28v4h-8.5V33z" fill="#fff" /><circle cx="34" cy="31" r="4" fill="#F4B73C" /></svg>
        <div><b>FONEMA</b><small>{titulo ?? 'plataforma de alfabetização'}</small></div>
      </div>
      {crianca ? <AvatarMini crianca={crianca} /> : null}
      <div className="topo-meio">{children}</div>
      {moedinhas !== undefined ? <Moedinhas valor={moedinhas} id="cofre-topo" /> : null}
      <div className="ajustes" role="group" aria-label="Ajustes de acessibilidade">
        <button className="btn-ic" aria-pressed={prefs.vozLigada} onClick={() => setPrefs({ vozLigada: !prefs.vozLigada })}><span aria-hidden="true">{prefs.vozLigada ? '🔊' : '🔈'}</span><small>Voz</small></button>
        <button className="btn-ic" aria-pressed={prefs.contraste} onClick={() => setPrefs({ contraste: !prefs.contraste })}><span aria-hidden="true">◐</span><small>Contraste</small></button>
        <button className="btn-ic" aria-pressed={prefs.menosMovimento} onClick={() => setPrefs({ menosMovimento: !prefs.menosMovimento })}><span aria-hidden="true">🐢</span><small>Movimento</small></button>
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
  return <div className="carregando" role="status">Carregando…</div>;
}
