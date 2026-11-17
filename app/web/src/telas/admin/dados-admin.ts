/** Dados e utilidades da Área do administrador (catálogo de áudios, áudios trocados, tocador, baixar arquivo). */
import { useEffect, useState } from 'react';
import { BANCO, FIGURAS } from '@fonema/conteudo';
import falasConteudo from '../../../../packages/conteudo/src/falas.json';
import auditoria from './auditoria-resumo.json';
import { montarCatalogo, type ItemCatalogo } from '../../servicos/catalogo-audios.ts';
import { SONS_DO_ESTUDIO } from '../../servicos/sons-letras.ts';
import { chaveTrecho, voz } from '../../servicos/voz.ts';
import { substituicoes, type MetaSubstituto } from '../../servicos/substituicoes.ts';

/** Arquivos de áudio tocados pelo caminho (fora dos manifestos). */
export const EXTRAS = [
  { caminho: 'assets/audio/dupla-ilha-das-vogais.mp3', texto: 'Diálogo da dupla na Ilha das Vogais (Assiste e Faz da R1)', detalhe: 'Arquivo inteiro, tocado no quadro do Assiste e Faz.' }
];

const ler = (u: string) => fetch(u).then((r) => (r.ok ? r.json() : null)).catch(() => null);

let cache: Promise<ItemCatalogo[]> | null = null;
export function carregarCatalogo(): Promise<ItemCatalogo[]> {
  cache ??= Promise.all([ler('./audio/sons/mapa.json'), ler('./audio/falas/manifesto.json'), ler('./audio/nomes/manifesto.json')]).then(([mapaSons, falas, nomes]) =>
    montarCatalogo({
      sons: SONS_DO_ESTUDIO, mapaSons, falas: falas ?? {}, nomes: nomes ?? {}, falasConteudo: falasConteudo as { voz: string; texto: string; origem: string }[],
      palavrasConhecidas: new Set([...Object.keys(FIGURAS), ...Object.keys(BANCO)]), chaveTrecho,
      auditoria: auditoria as Record<string, 'grave' | 'conferir'>, extras: EXTRAS
    }));
  return cache;
}
export function useCatalogo(): ItemCatalogo[] | null {
  const [itens, setItens] = useState<ItemCatalogo[] | null>(null);
  useEffect(() => { let vivo = true; void carregarCatalogo().then((c) => { if (vivo) setItens(c); }); return () => { vivo = false; }; }, []);
  return itens;
}

/** Áudios trocados neste aparelho (id → dados), atualizado quando algum muda. */
export function useTrocados(): Map<string, MetaSubstituto> {
  const [m, setM] = useState<Map<string, MetaSubstituto>>(new Map());
  useEffect(() => {
    let vivo = true;
    const ler = () => void substituicoes.listar().then((l) => { if (vivo) setM(new Map(l.map((r) => { const meta: MetaSubstituto = { ...r }; delete (meta as Partial<typeof r>).blob; return [r.id, meta]; }))); });
    ler();
    const sair = substituicoes.ouvir(ler);
    return () => { vivo = false; sair(); };
  }, []);
  return m;
}

/* ------------------------------------------------------------------ tocador único (um áudio por vez) */
let atual: HTMLAudioElement | null = null;
const ouvintes = new Set<(url: string | null) => void>();
export function pararAudio() {
  if (atual) { atual.pause(); atual = null; }
  for (const f of ouvintes) f(null);
}
export function tocarUrl(url: string): Promise<void> {
  pararAudio();
  voz.parar();
  const el = new Audio(url);
  atual = el;
  for (const f of ouvintes) f(url);
  return new Promise((resolve) => {
    const fim = () => { if (atual === el) { atual = null; for (const f of ouvintes) f(null); } resolve(); };
    el.onended = fim; el.onerror = fim; el.onpause = fim;
    el.play().catch(fim);
  });
}
export function useTocando(): string | null {
  const [u, setU] = useState<string | null>(null);
  useEffect(() => { ouvintes.add(setU); return () => { ouvintes.delete(setU); }; }, []);
  return u;
}
/** Toca o áudio que a plataforma toca HOJE para este item (o trocado, se houver; senão o original). */
export async function tocarAtual(it: ItemCatalogo): Promise<boolean> {
  const s = await substituicoes.url(it.id);
  if (s) { await tocarUrl(s); return true; }
  if (it.arquivo) { await tocarUrl(`./${it.arquivo}`); return true; }
  return false;
}

export function baixar(dados: Blob, nome: string) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(dados);
  a.download = nome;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 60_000);
}
export const carimbo = (d = new Date()) => `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}-${String(d.getHours()).padStart(2, '0')}${String(d.getMinutes()).padStart(2, '0')}`;
export const dataCurta = (ms?: number) => (ms ? new Date(ms).toLocaleDateString('pt-BR') : '—');
