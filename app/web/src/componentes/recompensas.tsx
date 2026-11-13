import type { CSSProperties } from 'react';
import type { Conquista } from '@fonema/conteudo';
import type { ConquistaGanha, InfoNivel } from '@fonema/motor';
import { asset } from '../servicos/ambiente.ts';
import { caminhoFigura } from './ui.tsx';

const METAL: Record<string, [string, string, string]> = {
  bronze: ['#F2C7A0', '#C9814A', '#8A4F24'],
  prata: ['#FFFFFF', '#C9D3DE', '#7D8A99'],
  ouro: ['#FFF1B8', '#F4B73C', '#B07A0E'],
  diamante: ['#F2FBFF', '#A8D5F2', '#3D7CC4'],
  unico: ['#FFF1B8', '#F4B73C', '#B07A0E']
};
const FORMA: Record<string, string> = {
  selo: 'M100 8 L122 30 L152 26 L158 56 L184 72 L170 100 L184 128 L158 144 L152 174 L122 170 L100 192 L78 170 L48 174 L42 144 L16 128 L30 100 L16 72 L42 56 L48 26 L78 30 Z',
  medalha: 'M100 12 A88 88 0 1 1 99.9 12 Z',
  titulo: 'M100 10 L178 40 L170 130 Q150 170 100 190 Q50 170 30 130 L22 40 Z',
  selo_validacao: 'M30 20 H170 Q182 20 182 32 V150 Q182 162 170 162 H120 L100 190 L80 162 H30 Q18 162 18 150 V32 Q18 20 30 20 Z',
  trofeu: 'M100 12 A88 88 0 1 1 99.9 12 Z',
  emblema_colecao: 'M100 10 L184 60 V140 L100 190 L16 140 V60 Z'
};

/**
 * Selo "3D" em SVG: borda grossa metálica, disco azul-marinho, motivo e faixa com o nome NEUTRO (D022).
 * Sem arco-íris (D009): no máximo 2–3 cores por selo. Gira em 3D na celebração (desligável).
 */
export function Selo({ conquista, ganha, tamanho = 150, girar = false, letra, bloqueado = false }: { conquista: Conquista; ganha?: ConquistaGanha; tamanho?: number; girar?: boolean; letra?: string; bloqueado?: boolean }) {
  const nivel = ganha?.nivel ?? 'bronze';
  const [c1, c2, c3] = bloqueado ? ['#EEF2F6', '#C9D3DE', '#9AA6B4'] : METAL[nivel] ?? METAL.ouro;
  const forma = FORMA[conquista.tipo] ?? FORMA.selo;
  const id = conquista.id.replace(/[^a-z0-9]/gi, '');
  const motivo = conquista.motivo === '$LETRA' ? letra ?? 'A' : conquista.motivo;
  const ehTexto = /^[A-ZÁÉÍÓÚ]{1,2}$/.test(motivo);
  const mist = bloqueado && conquista.visivel_antes === 'misterio';
  return (
    <figure className={`selo ${girar ? 'selo-gira' : ''} ${bloqueado ? 'selo-bloqueado' : ''}`} style={{ width: tamanho } as CSSProperties} data-conquista={conquista.id}>
      <svg viewBox="0 0 200 230" role="img" aria-label={`${conquista.nome}${bloqueado ? ' (ainda não conquistado)' : ''}`}>
        <defs>
          <linearGradient id={`m${id}`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={c1} /><stop offset=".5" stopColor={c2} /><stop offset="1" stopColor={c3} /></linearGradient>
          <radialGradient id={`d${id}`} cx=".4" cy=".35" r=".8"><stop offset="0" stopColor={bloqueado ? '#B9C4D0' : '#2E4F8E'} /><stop offset="1" stopColor={bloqueado ? '#8995A3' : '#16285A'} /></radialGradient>
          <linearGradient id={`b${id}`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#fff" stopOpacity="0" /><stop offset=".5" stopColor="#fff" stopOpacity=".55" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></linearGradient>
          <clipPath id={`c${id}`}><path d={forma} /></clipPath>
        </defs>
        <g transform="translate(0,4)">
          <path d={forma} fill={c3} transform="translate(0,6)" />
          <path d={forma} fill={`url(#m${id})`} />
          <circle cx="100" cy="100" r="62" fill={`url(#d${id})`} stroke={c3} strokeWidth="4" />
          <ellipse cx="80" cy="72" rx="34" ry="16" fill="#fff" opacity=".12" />
          {mist ? (
            <text x="100" y="122" textAnchor="middle" fontSize="64" fontFamily="Fredoka" fontWeight="700" fill="#fff" opacity=".9">?</text>
          ) : ehTexto ? (
            <text x="100" y="124" textAnchor="middle" fontSize={motivo.length > 1 ? 54 : 70} fontFamily="Fredoka" fontWeight="700" fill={bloqueado ? '#EEF2F6' : '#FFD067'} stroke="#7A4F00" strokeWidth={bloqueado ? 0 : 2}>{motivo}</text>
          ) : (
            <image href={caminhoFigura(motivo) ?? asset('figuras/estrela.webp')} x="54" y="54" width="92" height="92" opacity={bloqueado ? 0.5 : 1} style={bloqueado ? { filter: 'grayscale(1)' } : undefined} />
          )}
          {!bloqueado ? <rect className="selo-brilho" x="-120" y="0" width="80" height="200" fill={`url(#b${id})`} clipPath={`url(#c${id})`} transform="skewX(-18)" /> : null}
        </g>
        <path d="M14 182 H186 L176 200 L186 218 H14 L24 200 Z" fill={bloqueado ? '#9AA6B4' : '#1B3160'} />
        <text x="100" y="206" textAnchor="middle" fontSize={conquista.nome.length > 20 ? 12 : 15} fontFamily="Fredoka" fontWeight="600" fill="#fff">{mist ? 'Mistério' : conquista.nome}</text>
        {bloqueado ? (
          <g transform="translate(150,26)"><circle r="20" fill="#fff" stroke="#9AA6B4" strokeWidth="3" /><path d="M-8 -2 v-5 a8 8 0 0 1 16 0 v5" stroke="#4F5B6D" strokeWidth="3" fill="none" /><rect x="-10" y="-2" width="20" height="15" rx="3" fill="#4F5B6D" /></g>
        ) : null}
      </svg>
    </figure>
  );
}

export function Cofrinho({ saldo, animar = 0 }: { saldo: number; animar?: number }) {
  return (
    <div className="cofrinho" id="cofrinho" data-testid="cofrinho">
      <img className="cofre" src={asset('recompensas/cofrinho-tatu.webp')} alt="Cofrinho-tatu" />
      <b>{saldo}</b>
      {Array.from({ length: Math.min(animar, 12) }, (_, i) => (
        <img key={i} className="moeda-voando" style={{ animationDelay: `${i * 0.12}s` }} src={asset('recompensas/moeda.webp')} alt="" aria-hidden="true" />
      ))}
    </div>
  );
}

/** Termômetro 0–10 (D004). Para a criança: "aquecendo", sem número; para o adulto, com número. */
export function Termometro({ valor, comNumero = true }: { valor: number; comNumero?: boolean }) {
  return (
    <div className="termometro" role="meter" aria-valuemin={0} aria-valuemax={10} aria-valuenow={valor} aria-label="Termômetro da leitura">
      <div className="termo-escala">
        {Array.from({ length: 11 }, (_, i) => <span key={i} className={i <= valor ? 'cheio' : ''}>{comNumero ? i : ''}</span>)}
      </div>
      {comNumero ? <p><b>Nível {valor} de 10</b></p> : null}
    </div>
  );
}

/**
 * Barra do PRÓXIMO OBJETIVO (P1-b): mostra o objetivo de aprendizagem, não o prêmio.
 * 4–5 anos: bolinhas para preencher (no máximo 8 visíveis); a Sofia fala o número.
 */
export function BarraObjetivo({ nivel, objetivo, compacta = false }: { nivel: InfoNivel; objetivo?: string; compacta?: boolean }) {
  const total = Math.min(8, nivel.custoProximo || 1);
  const feitos = Math.round(((nivel.desafiosNoNivel || 0) / (nivel.custoProximo || 1)) * total);
  return (
    <div className={`barra-objetivo ${compacta ? 'compacta' : ''}`} data-testid="barra-objetivo">
      <div className="bo-titulo"><b>{nivel.nivel > 0 ? `Nível ${nivel.nivel}` : 'Começando'}</b>{nivel.titulo ? <span>{nivel.rotulo}</span> : null}</div>
      <div className="bo-bolinhas" aria-label={`Faltam ${nivel.faltam} desafios para o nível ${nivel.nivel + 1}`}>
        {Array.from({ length: total }, (_, i) => <i key={i} className={i < feitos ? 'cheia' : ''} />)}
      </div>
      {objetivo ? <p className="bo-obj">Próximo objetivo: <b>{objetivo}</b></p> : null}
      {nivel.portao && nivel.desafiosNoNivel + (nivel.estrelas ? nivel.custoProximo : 0) >= 0 && !compacta ? <p className="bo-portao">Rumo a um título novo: vencer <b>{nivel.portao.nome}</b></p> : null}
    </div>
  );
}
