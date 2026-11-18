/**
 * Gerenciador › Missões: trocar as PALAVRAS das atividades que levam o som de cada letra (juntar os sons, caixas de sons,
 * pares mínimos, troca-letras, frases e ditado). O item novo é montado com os sons do banco (conteudo/edicao/itens.ts) e
 * passa pelo verificador AO VIVO; palavra nova abre o assistente de pronúncia; palavra sem figura pode ganhar uma na hora.
 */
import { useMemo, useState } from 'react';
import {
  CONTEUDO_EDITAVEL, ErroItem, montarCaixas, montarDitado, montarFrase, montarPar, montarSintese, montarTroca, verificarEdicao,
  type AtividadeDitado, type Cena, type Fase, type ItemFrase, type ItemParMinimo, type ItemTroca, type ResultadoVerificacao
} from '@fonema/conteudo';
import { Icone, caminhoFigura } from '../../componentes/ui.tsx';
import { edicoes } from '../../servicos/edicoes.ts';
import { AssistentePronuncia, AvisoVerificador, salvarVerificando } from './edicao-comum.tsx';
import { TrocarImagem } from './Gerenciador.tsx';
import type { ItemCaixas, ItemSintese } from '@fonema/conteudo';

const temFigura = (w: string) => !!caminhoFigura(undefined, w);
const semAcento = (w: string) => w.normalize('NFD').replace(/[̀-ͯ]/g, '');
const lista = (t: string) => t.split(/[,;]+/).map((x) => x.trim()).filter(Boolean);

export type TipoTroca = 'sintese' | 'caixas' | 'parMinimo' | 'troca' | 'frase' | 'ditado';
type Campos = Record<string, string>;

/** Campos de cada tipo, já preenchidos com o item de hoje. */
function camposIniciais(tipo: TipoTroca, item: unknown): Campos {
  switch (tipo) {
    case 'sintese': { const i = item as ItemSintese; return { palavra: i.correta, outras: i.opcoes.filter((o) => o.id !== i.correta).map((o) => o.id).join(', ') }; }
    case 'caixas': return { palavra: (item as ItemCaixas).palavra.toLowerCase() };
    case 'parMinimo': { const i = item as ItemParMinimo; return { alvo: i.alvo, outra: i.outra, distrator: i.distrator ?? '' }; }
    case 'troca': { const i = item as ItemTroca; return { de: i.de.toLowerCase(), para: i.para.toLowerCase() }; }
    case 'frase': { const i = item as ItemFrase; return { frase: i.frase, correta: i.correta, opcoes: i.opcoes.join(', ') }; }
    case 'ditado': return { palavras: (item as AtividadeDitado).palavras.join(', ').toLowerCase() };
  }
}
const ROTULOS: Record<TipoTroca, [string, string][]> = {
  sintese: [['palavra', 'Palavra que os sons formam'], ['outras', 'Outras opções (2 ou mais, com vírgula)']],
  caixas: [['palavra', 'Palavra']],
  parMinimo: [['alvo', 'Palavra certa'], ['outra', 'A outra do par (muda UM som)'], ['distrator', '3ª opção']],
  troca: [['de', 'Palavra de antes'], ['para', 'Palavra nova (uma letra trocada ou a mais)']],
  frase: [['frase', 'Frase'], ['correta', 'Resposta certa (figura)'], ['opcoes', 'Figuras para escolher (3, com vírgula)']],
  ditado: [['palavras', 'Palavras do ditado (com vírgula)']]
};

function montar(tipo: TipoTroca, item: unknown, c: Campos): unknown {
  switch (tipo) {
    case 'sintese': return montarSintese(item as ItemSintese, c.palavra, lista(c.outras), temFigura);
    case 'caixas': return montarCaixas(item as ItemCaixas, c.palavra, temFigura);
    case 'parMinimo': return montarPar(item as ItemParMinimo, c.alvo, c.outra, c.distrator, temFigura);
    case 'troca': return montarTroca(item as ItemTroca, c.de, c.para);
    case 'frase': return montarFrase(item as ItemFrase, c.frase, temFigura, { correta: c.correta, opcoes: lista(c.opcoes) });
    case 'ditado': return montarDitado((item as AtividadeDitado).letras, lista(c.palavras));
  }
}

/** Um item (ou o ditado inteiro) com o formulário de troca. */
export function TrocarItem({ fase, cena, tipo, indice, item }: { fase: Fase; cena: Cena; tipo: TipoTroca; indice?: number; item: unknown }) {
  const inicial = useMemo(() => camposIniciais(tipo, item), [tipo, item]);
  const [c, setC] = useState<Campos>(inicial);
  const [rodada, setRodada] = useState(0);
  const [msg, setMsg] = useState('');
  const base = ['cenas', `@${cena.id}`, 'atividade'];
  const mudou = JSON.stringify(c) !== JSON.stringify(inicial);
  // o que muda e onde: ditado mexe nas palavras e nas letras da atividade; os outros, no item
  const plano = useMemo((): { erro?: ErroItem; edicoes?: { caminho: (string | number)[]; valor: unknown }[] } => {
    if (!mudou) return {};
    try {
      const v = montar(tipo, item, c);
      if (tipo === 'ditado') { const d = v as { palavras: string[]; letras: string[] }; return { edicoes: [{ caminho: [...base, 'palavras'], valor: d.palavras }, { caminho: [...base, 'letras'], valor: d.letras }] }; }
      return { edicoes: [{ caminho: [...base, 'itens', indice!], valor: v }] };
    } catch (e) { return { erro: e instanceof ErroItem ? e : new ErroItem(e instanceof Error ? e.message : 'Não deu.') }; }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [c, mudou, rodada, item]);
  const r: ResultadoVerificacao | null = useMemo(() => {
    const e0 = plano.edicoes?.[0];
    return e0 ? verificarEdicao(CONTEUDO_EDITAVEL, { colecao: 'fases', item: fase.id, tipo: 'definir', caminho: e0.caminho, valor: e0.valor, em: 0 }, edicoes.edicoes()) : null;
  }, [plano, fase.id]);
  const salvar = async () => {
    for (const e of plano.edicoes ?? []) {
      const res = await salvarVerificando({ colecao: 'fases', item: fase.id, tipo: 'definir', caminho: e.caminho, valor: e.valor, nota: `${tipo}: ${Object.values(c).join(' · ')}` });
      if (!res.ok) { setRodada((x) => x + 1); return; }
    }
    setMsg('Trocado. Guardado neste aparelho.');
  };
  const lugar = tipo === 'ditado' ? [...base, 'palavras'] : [...base, 'itens', indice!];
  const reg = edicoes.noLugar({ colecao: 'fases', item: fase.id, tipo: 'definir', caminho: lugar });
  const voltar = async () => {
    for (const cam of tipo === 'ditado' ? [[...base, 'palavras'], [...base, 'letras']] : [lugar]) {
      const x = edicoes.noLugar({ colecao: 'fases', item: fase.id, tipo: 'definir', caminho: cam });
      if (x) await edicoes.voltarAoOriginal(x.chave);
    }
  };
  const figuraFalta = plano.erro?.palavra && !plano.erro.semPronuncia && /figura/.test(plano.erro.simples) ? plano.erro.palavra : null;
  return (
    <div className="adm-campo-ed" data-testid="trocar-item" data-tipo={tipo} data-item={indice ?? 'ditado'}>
      <span className="adm-campo-rot">{tipo === 'ditado' ? 'Ditado' : `Item ${indice! + 1}`}{reg ? <span className="adm-etq ipe">editado</span> : null}</span>
      <div className="adm-grade">
        {ROTULOS[tipo].map(([k, rot]) => (
          <label key={k} className="adm-campo largo">{rot}<input value={c[k] ?? ''} onChange={(e) => { setMsg(''); setC({ ...c, [k]: e.target.value }); }} data-testid={`campo-${k}`} /></label>
        ))}
      </div>
      <div className="adm-linha">
        <button className="btn adm-btn pri" disabled={!plano.edicoes || !r?.ok} onClick={() => void salvar()} data-testid="salvar-item"><Icone nome="check" />Trocar</button>
        {reg ? <button className="btn adm-btn" onClick={() => void voltar()} data-testid="original-item"><Icone nome="lixeira" />Voltar ao original</button> : null}
        {msg ? <span className="adm-etq verde" role="status" data-testid="item-trocado">{msg}</span> : null}
      </div>
      {plano.erro ? <p className="adm-bloqueio" role="alert" data-testid="erro-item">{plano.erro.simples}</p> : null}
      {plano.erro?.semPronuncia && plano.erro.palavra ? <AssistentePronuncia palavra={plano.erro.palavra} aoSalvar={() => setRodada((x) => x + 1)} /> : null}
      {figuraFalta ? <TrocarImagem caminho={`figuras/${semAcento(figuraFalta)}.webp`} /> : null}
      {plano.edicoes ? <AvisoVerificador r={r} aoPronuncia={() => setRodada((x) => x + 1)} /> : null}
    </div>
  );
}
