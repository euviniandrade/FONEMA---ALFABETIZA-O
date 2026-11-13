import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { CONFIG_PADRAO, mesclarConfig, type ConfigPlataforma } from '@fonema/conteudo';
import { configEfetiva, progressoInicial, type Crianca, type Progresso } from '@fonema/motor';
import type { Repositorio } from './dados/repositorio.ts';
import { RepositorioIndexedDB } from './dados/repositorio-idb.ts';
import { voz } from './servicos/voz.ts';
import { efeitosLigados } from './servicos/efeitos.ts';

export interface Preferencias { vozLigada: boolean; contraste: boolean; menosMovimento: boolean }

interface Contexto {
  repo: Repositorio;
  config: ConfigPlataforma;
  configBruta: ConfigPlataforma;
  salvarConfig: (c: Partial<ConfigPlataforma>) => Promise<void>;
  prefs: Preferencias;
  setPrefs: (p: Partial<Preferencias>) => void;
  pronto: boolean;
}

const Ctx = createContext<Contexto | null>(null);

/** Troque aqui por um RepositorioApi (NestJS) quando o backend existir. */
export function criarRepositorio(): Repositorio {
  return new RepositorioIndexedDB();
}

const PREFS_PADRAO: Preferencias = { vozLigada: true, contraste: false, menosMovimento: false };

export function ProvedorApp({ children, repo }: { children: ReactNode; repo: Repositorio }) {
  const [cfgSalva, setCfgSalva] = useState<Partial<ConfigPlataforma>>({});
  const [pronto, setPronto] = useState(false);
  const [prefs, setPrefsState] = useState<Preferencias>(() => {
    try { return { ...PREFS_PADRAO, ...JSON.parse(localStorage.getItem('fonema-prefs') || '{}') }; } catch { return PREFS_PADRAO; }
  });

  useEffect(() => {
    repo.obterConfig().then((c) => { setCfgSalva(c); setPronto(true); });
    repo.apagarAudiosAntigos(30, Date.now()).catch(() => undefined);
  }, [repo]);

  const configBruta = useMemo(() => mesclarConfig(CONFIG_PADRAO, cfgSalva), [cfgSalva]);
  const config = useMemo(() => configEfetiva(configBruta), [configBruta]);

  useEffect(() => {
    voz.configurar({ ligada: prefs.vozLigada, velocidade: configBruta.voz.velocidade, provedor: configBruta.voz.provedor });
    efeitosLigados(prefs.vozLigada);
    const reduz = prefs.menosMovimento || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    document.documentElement.classList.toggle('contraste', prefs.contraste);
    document.documentElement.classList.toggle('menos-movimento', !!reduz);
    localStorage.setItem('fonema-prefs', JSON.stringify(prefs));
  }, [prefs, configBruta]);

  const salvarConfig = useCallback(async (c: Partial<ConfigPlataforma>) => {
    const novo = { ...cfgSalva, ...c };
    await repo.salvarConfig(novo);
    setCfgSalva(novo);
  }, [cfgSalva, repo]);

  const setPrefs = useCallback((p: Partial<Preferencias>) => setPrefsState((a) => ({ ...a, ...p })), []);

  return <Ctx.Provider value={{ repo, config, configBruta, salvarConfig, prefs, setPrefs, pronto }}>{children}</Ctx.Provider>;
}

export function useApp(): Contexto {
  const c = useContext(Ctx);
  if (!c) throw new Error('useApp fora do ProvedorApp');
  return c;
}

/** Carrega a criança e o progresso dela; `salvar` grava e atualiza a tela. */
export function useCrianca(id: string | undefined) {
  const { repo } = useApp();
  const [crianca, setCrianca] = useState<Crianca>();
  const [progresso, setProgresso] = useState<Progresso>();
  const [carregado, setCarregado] = useState(false);

  const recarregar = useCallback(async () => {
    if (!id) return;
    const c = await repo.obterCrianca(id);
    let p = await repo.obterProgresso(id);
    if (c && !p) {
      p = progressoInicial(id, Date.now());
      await repo.salvarProgresso(p);
    }
    if (c) voz.definirNome(c.pronuncia.fala);
    setCrianca(c);
    setProgresso(p);
    setCarregado(true);
  }, [id, repo]);

  useEffect(() => { recarregar(); }, [recarregar]);

  const salvarProgresso = useCallback(async (p: Progresso) => {
    await repo.salvarProgresso(p);
    setProgresso(p);
  }, [repo]);

  const salvarCrianca = useCallback(async (c: Crianca) => {
    await repo.salvarCrianca(c);
    setCrianca(c);
  }, [repo]);

  return { crianca, progresso, carregado, salvarProgresso, salvarCrianca, recarregar };
}
