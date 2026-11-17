/**
 * Peças comuns dos JOGOS DA VILA (Estrada e Rio dos Pares, Carteiro da Vila, Casa do Som; D032 §4, pesquisa 47 G6/G10/G3):
 * props, espera pela escolha (sem cronômetro: o mundo PARA até a criança escolher; 47 §3) e o carro/barco do avatar.
 */
import { useId, useRef, useState } from 'react';
import type { Tentativa } from '@fonema/motor';
import { CORES_VEICULO } from '@fonema/motor';

export interface ResultadoJogoVila { tentativas: Tentativa[]; tentouDeNovo: number }

export interface PropsJogoVila<I> {
  itens: I[];
  /** R12: na primeira vez, a guia faz um item de exemplo (não vale). */
  demo?: I | null;
  crianca: import('@fonema/motor').Crianca;
  sessao: string;
  cena: string;
  /** 'livre' no Parque de Jogos; 'desafio' quando veio do fim de uma missão. */
  contexto: 'livre' | 'desafio';
  onFim: (r: ResultadoJogoVila) => void;
}

/**
 * Espera um toque numa opção: devolve a posição tocada. Enquanto espera, `livre` = true (botões ligados). Sem tempo-limite:
 * "não respondeu" não é erro (47 §3). `repetir` (opcional) é chamado a cada `cadaMs` sem resposta (repete o estímulo).
 */
export function useEscolha() {
  const [livre, setLivre] = useState(false);
  const resolver = useRef<((k: number) => void) | null>(null);
  const esperar = (repetir?: () => Promise<void> | void, cadaMs = 10000) => new Promise<number>((ok) => {
    let timer = 0;
    const agendar = () => { if (!repetir) return; timer = window.setTimeout(async () => { if (!resolver.current) return; await repetir(); agendar(); }, cadaMs); };
    agendar();
    setLivre(true);
    resolver.current = (k) => { window.clearTimeout(timer); resolver.current = null; setLivre(false); ok(k); };
  });
  const tocar = (k: number) => { resolver.current?.(k); };
  return { livre, esperar, tocar };
}

export const corDoVeiculo = (id?: string) => (CORES_VEICULO.find((c) => c.id === id) ?? CORES_VEICULO[0]).cor;

/** Carrinho (visto de trás, subindo a estrada) ou barquinho, na cor escolhida na garagem. Desenho do projeto. */
export function Veiculo({ tipo, cor, className = '' }: { tipo: 'carro' | 'barco'; cor: string; className?: string }) {
  const u = useId().replace(/[^a-zA-Z0-9]/g, '');
  if (tipo === 'barco') {
    return (
      <svg className={`veiculo barco ${className}`} viewBox="0 0 120 110" aria-hidden="true">
        <defs>
          <linearGradient id={`vb-casco${u}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={cor} /><stop offset="1" stopColor="#1b2a4a" stopOpacity=".55" /></linearGradient>
          <linearGradient id={`vb-vela${u}`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#fff" /><stop offset="1" stopColor="#dfe8f5" /></linearGradient>
        </defs>
        <ellipse cx="60" cy="100" rx="50" ry="7" fill="#0b4f80" opacity=".25" />
        <path d="M60 8 L60 66" stroke="#7a5230" strokeWidth="4" strokeLinecap="round" />
        <path d="M62 12 Q92 40 90 64 L62 64 Z" fill={`url(#vb-vela${u})`} stroke="#c9d6ea" strokeWidth="1.5" />
        <path d="M58 18 Q36 44 38 64 L58 64 Z" fill={`url(#vb-vela${u})`} stroke="#c9d6ea" strokeWidth="1.5" />
        <path d="M14 66 H106 Q100 92 78 96 H42 Q20 92 14 66 Z" fill={`url(#vb-casco${u})`} />
        <path d="M14 66 H106" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity=".85" />
        <circle cx="40" cy="78" r="4.5" fill="#fff" opacity=".9" /><circle cx="60" cy="78" r="4.5" fill="#fff" opacity=".9" /><circle cx="80" cy="78" r="4.5" fill="#fff" opacity=".9" />
        <path d="M30 70 Q60 76 90 70" stroke="#fff" strokeWidth="2" fill="none" opacity=".35" />
      </svg>
    );
  }
  return (
    <svg className={`veiculo carro ${className}`} viewBox="0 0 120 100" aria-hidden="true">
      <defs>
        <linearGradient id={`vc-corpo${u}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff" stopOpacity=".35" /><stop offset=".35" stopColor={cor} /><stop offset="1" stopColor={cor} /></linearGradient>
        <linearGradient id={`vc-vidro${u}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#bfe6ff" /><stop offset="1" stopColor="#5b8fc4" /></linearGradient>
      </defs>
      <ellipse cx="60" cy="92" rx="52" ry="7" fill="#000" opacity=".22" />
      <rect x="14" y="70" width="18" height="20" rx="6" fill="#2b2b33" />
      <rect x="88" y="70" width="18" height="20" rx="6" fill="#2b2b33" />
      <path d="M30 30 Q34 14 50 13 H70 Q86 14 90 30 L96 46 H24 Z" fill={`url(#vc-corpo${u})`} />
      <path d="M36 31 Q39 20 51 19 H69 Q81 20 84 31 L88 44 H32 Z" fill={`url(#vc-vidro${u})`} />
      <path d="M44 22 L40 40" stroke="#fff" strokeWidth="3" opacity=".45" strokeLinecap="round" />
      <rect x="12" y="44" width="96" height="34" rx="14" fill={`url(#vc-corpo${u})`} />
      <rect x="18" y="52" width="16" height="9" rx="4" fill="#ffd94a" />
      <rect x="86" y="52" width="16" height="9" rx="4" fill="#ffd94a" />
      <rect x="44" y="60" width="32" height="11" rx="3" fill="#f7f7f2" />
      <rect x="47" y="63" width="26" height="5" rx="2" fill="#9aa3ad" opacity=".5" />
      <path d="M16 50 H104" stroke="#fff" strokeWidth="2" opacity=".35" />
    </svg>
  );
}
