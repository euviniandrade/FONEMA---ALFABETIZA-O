import { useCallback, useEffect, useRef, useState } from 'react';
import { useApp } from '../../contexto.tsx';
import { Icone } from '../../componentes/ui.tsx';
import { SONS_DO_ESTUDIO, sonsLetras, type MapaSons } from '../../servicos/sons-letras.ts';
import { apagarSom, exportarSons, importarSons, iniciarGravacao, salvarSom, temMicrofone, type GravacaoEmCurso } from '../../servicos/estudio-sons.ts';
import { voz } from '../../servicos/voz.ts';

type Origem = 'substituto' | 'gravado' | 'publicado' | null;

/**
 * ESTÚDIO DE SONS (Área da Família / do Professor, atrás do PIN): um adulto grava o som de cada letra do jeito que
 * se faz na escola. O som gravado aqui toca no lugar do som gerado, na tela da letra, no Espelho do Som e no traçado.
 */
export function EstudioSons() {
  const { repo } = useApp();
  const [origens, setOrigens] = useState<Record<string, Origem>>({});
  const [mapa, setMapa] = useState<MapaSons | null>(null);
  const [gravando, setGravando] = useState<string | null>(null);
  const [nivel, setNivel] = useState(0);
  const [msg, setMsg] = useState('');
  const curso = useRef<GravacaoEmCurso | null>(null);
  const arquivo = useRef<HTMLInputElement>(null);
  const mic = temMicrofone();

  const atualizar = useCallback(async () => {
    setMapa(await sonsLetras.carregarMapa());
    const o: Record<string, Origem> = {};
    for (const s of SONS_DO_ESTUDIO) o[s.fonema] = (await sonsLetras.origem(s.fonema))?.origem ?? null;
    setOrigens(o);
  }, []);
  useEffect(() => { void atualizar(); return () => curso.current?.cancelar(); }, [atualizar]);

  const parar = useCallback(async (fonema: string) => {
    const c = curso.current;
    curso.current = null;
    setGravando(null);
    if (!c) return;
    const r = await c.parar();
    if (!r) { setMsg('Não deu para ouvir nada. Chegue mais perto do microfone e grave de novo.'); return; }
    await salvarSom(repo, fonema, r.wav);
    setMsg(`Som gravado (${(r.duracaoMs / 1000).toFixed(1).replace('.', ',')} s). Toque em "Ouvir" para conferir.`);
    await atualizar();
  }, [repo, atualizar]);

  const gravar = async (fonema: string) => {
    if (gravando) return;
    voz.parar();
    setMsg('');
    try {
      setGravando(fonema);
      curso.current = await iniciarGravacao(setNivel, () => void parar(fonema));
    } catch {
      setGravando(null);
      setMsg('O microfone não está liberado. Permita o uso do microfone nas configurações do navegador.');
    }
  };

  const exportar = async () => {
    const { arquivo: blob, quantos } = await exportarSons(repo);
    if (!quantos) { setMsg('Ainda não há som gravado neste aparelho para exportar.'); return; }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'fonema-sons-das-letras.json';
    a.click();
    setMsg(`${quantos} ${quantos === 1 ? 'som exportado' : 'sons exportados'}.`);
  };
  const importar = async (f: File | undefined) => {
    if (!f) return;
    try { const n = await importarSons(repo, await f.text()); setMsg(`${n} ${n === 1 ? 'som importado' : 'sons importados'}.`); await atualizar(); }
    catch (e) { setMsg(e instanceof Error ? e.message : 'Não consegui ler o arquivo.'); }
    if (arquivo.current) arquivo.current.value = '';
  };

  const gravados = Object.values(origens).filter((o) => o === 'gravado').length;
  return (
    <section className="estudio-sons" data-testid="estudio-sons">
      <h1 className="t"><Icone nome="microfone" />Sons das letras</h1>
      <p className="estudio-intro">
        Grave aqui o <b>som</b> de cada letra, como a professora faz: <b>"mmm"</b>, e não "eme". O som que você gravar toca para a criança
        no lugar do som gerado pelo computador. Fale perto do microfone, num lugar quieto; o silêncio do começo e do fim é cortado sozinho.
      </p>
      <div className="estudio-barra">
        <span className="estudio-conta" data-testid="estudio-conta"><b>{gravados}</b> de {SONS_DO_ESTUDIO.length} gravados neste aparelho</span>
        <button className="btn" onClick={exportar} data-testid="estudio-exportar"><Icone nome="baixar" />Exportar sons</button>
        <button className="btn" onClick={() => arquivo.current?.click()} data-testid="estudio-importar"><Icone nome="copiar" />Importar sons</button>
        <input ref={arquivo} type="file" accept="application/json,.json" hidden onChange={(e) => void importar(e.target.files?.[0])} data-testid="estudio-arquivo" />
      </div>
      {!mic ? <p className="estudio-aviso" role="alert">Este aparelho ou navegador não deixa gravar pelo microfone. Você ainda pode importar um arquivo de sons gravado em outro aparelho.</p> : null}
      {msg ? <p className="estudio-msg" role="status" data-testid="estudio-msg">{msg}</p> : null}
      <ul className="estudio-lista">
        {SONS_DO_ESTUDIO.map((s) => {
          const o = origens[s.fonema];
          const pub = mapa?.fonemas[s.fonema];
          const aqui = gravando === s.fonema;
          return (
            <li key={s.fonema} className={`estudio-item ${o === 'gravado' ? 'gravado' : ''} ${aqui ? 'gravando' : ''}`} data-fonema={s.fonema}>
              <span className="estudio-letra">{s.rotulo}</span>
              <span className="estudio-como"><b>{s.como}</b><small>como em {s.exemplo}</small></span>
              <span className={`estudio-estado ${o ?? 'vazio'} ${o === 'publicado' ? pub?.estado ?? '' : ''}`}>
                {o === 'substituto' ? 'Trocado pelo administrador' : o === 'gravado' ? 'Gravado por você' : o === 'publicado' ? (pub?.estado === 'duvidoso' ? 'Som gerado: confira de ouvido' : 'Som gerado') : 'Sem som: a dupla diz a palavra'}
              </span>
              {aqui ? (
                <span className="estudio-medidor" aria-label="Volume do microfone"><i style={{ width: `${Math.round(nivel * 100)}%` }} /></span>
              ) : null}
              <span className="estudio-botoes">
                {aqui
                  ? <button className="btn vermelho" onClick={() => void parar(s.fonema)} data-testid={`parar-${s.fonema}`}><Icone nome="check" />Parar</button>
                  : <button className="btn" onClick={() => void gravar(s.fonema)} disabled={!mic || !!gravando} data-testid={`gravar-${s.fonema}`}><Icone nome="gravar" />{o === 'gravado' ? 'Regravar' : 'Gravar'}</button>}
                <button className="btn" onClick={() => void sonsLetras.tocar(s.fonema)} disabled={!o || !!gravando} data-testid={`ouvir-${s.fonema}`}><Icone nome="tocar" />Ouvir</button>
                {o === 'gravado' ? <button className="btn" onClick={async () => { await apagarSom(repo, s.fonema); setMsg('Gravação apagada.'); await atualizar(); }} disabled={!!gravando} aria-label={`Apagar a gravação de ${s.rotulo}`}><Icone nome="lixeira" /></button> : null}
              </span>
            </li>
          );
        })}
      </ul>
      <p className="nota-mic">Os sons ficam só neste aparelho. Para usar em outro tablet ou mandar para a escola, toque em "Exportar sons" e depois em "Importar sons" no outro aparelho. Os sons gerados foram conferidos por medidas do sinal, não por pessoa: o melhor som é o gravado por quem ensina.</p>
    </section>
  );
}
