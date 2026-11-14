import { useEffect, useMemo, useState } from 'react';
import { ACESSIBILIDADE, ITENS_LOJA, pecasPara, type ItemLoja, type PecaAvatar } from '@fonema/conteudo';
import { alternarAcessibilidade, comprar, comprarPeca, estadoPeca, podeComprar, rotuloCadeado, vestir, type AvatarCrianca } from '@fonema/motor';
import { useApp, useCrianca } from '../../contexto.tsx';
import { Carregando, Topo } from '../../componentes/basicos.tsx';
import { Fundo, Icone } from '../../componentes/ui.tsx';
import { Cofrinho } from '../../componentes/recompensas.tsx';
import { Boneco3D, RetratoBoneco } from '../../componentes/Boneco3D.tsx';
import { resolverAparencia } from '../../avatar3d/modelo.ts';
import { asset } from '../../servicos/ambiente.ts';
import { efeitos } from '../../servicos/efeitos.ts';
import { novoId } from '../../dados/repositorio.ts';
import { falar } from '../../util.ts';

type Aba = 'boneco' | 'acessibilidade' | 'utensilios';
type CatLoja = 'cabelo' | 'camisa' | 'calca' | 'calcado';
const CATS: [CatLoja, string][] = [['camisa', 'Camisas'], ['calca', 'Calças e saias'], ['calcado', 'Calçados'], ['cabelo', 'Cabelos']];

/**
 * Lojinha (de brincadeirinha, D002 · D021 · D029):
 * - "Meu boneco": roupas e penteados. O que está liberado se usa na hora; o resto mostra o cadeado
 *   ("Abre na Letra F · 12 moedas") — abre com o avanço das fases E com moedinhas.
 * - "Acessibilidade": óculos, aparelho auditivo, cadeira de rodas e pintura no rosto. Sempre grátis, sempre opcional.
 * - "Utensílios": os itens da mochila (como antes): pode × ainda não pode, "faltam X", meta do cofrinho.
 * Só moedinhas da jornada: nada com dinheiro de verdade, nada por sorte.
 */
export function Lojinha({ criancaId }: { criancaId: string }) {
  const { repo } = useApp();
  const { crianca, progresso, salvarProgresso, salvarCrianca } = useCrianca(criancaId);
  const [aba, setAba] = useState<Aba>('boneco');
  const [cat, setCat] = useState<CatLoja>('camisa');
  const [confirmar, setConfirmar] = useState<ItemLoja | null>(null);
  const [confirmarPeca, setConfirmarPeca] = useState<PecaAvatar | null>(null);
  const [provando, setProvando] = useState<PecaAvatar | null>(null);
  const temCrianca = !!crianca;
  useEffect(() => {
    if (crianca) falar({ quem: 'tales', texto: 'Aqui você troca as moedinhas que ganhou aprendendo. Pode esperar e juntar para algo maior!' }, crianca);
    // fala uma vez, quando a criança carrega (não a cada troca de peça)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [temCrianca]);

  const avatar = crianca?.avatar;
  const sexo = crianca?.genero ?? 'f';
  const aparencia = useMemo(() => {
    if (!avatar) return null;
    const a: AvatarCrianca = provando ? { ...avatar, [provando.categoria]: provando.id } : avatar;
    return resolverAparencia(a, sexo);
  }, [avatar, sexo, provando]);

  if (!crianca || !progresso || !avatar || !aparencia) return <Carregando />;
  const metaId = Object.entries(progresso.contadores).find(([k, v]) => k.startsWith('meta:') && v === 1)?.[0].slice(5);
  const itemMeta = ITENS_LOJA.find((i) => i.id === metaId) ?? null;

  const comprarItem = async (i: ItemLoja) => {
    const p = comprar(progresso, i.id, i.preco);
    await salvarProgresso({ ...p, equipados: [...p.equipados, i.id].slice(-4) });
    await repo.registrarEvento({ id: novoId('ev'), criancaId, em: Date.now(), tipo: 'compra', texto: `Trocou ${i.preco} moedinhas por: ${i.nome}` });
    efeitos.moeda();
    await falar({ quem: 'sofia', texto: 'Que escolha boa! Já está na sua mochila.' }, crianca);
    setConfirmar(null);
  };
  const definirMeta = async (i: ItemLoja) => {
    const contadores = Object.fromEntries(Object.entries(progresso.contadores).filter(([k]) => !k.startsWith('meta:')));
    await salvarProgresso({ ...progresso, contadores: { ...contadores, [`meta:${i.id}`]: 1 } });
    await falar({ quem: 'tales', texto: 'Meta escolhida! Agora é juntar moedinhas aprendendo.' }, crianca);
  };

  const usar = async (peca: PecaAvatar) => {
    efeitos.toque();
    setProvando(null);
    await salvarCrianca({ ...crianca, avatar: vestir(avatar, peca.categoria as CatLoja, peca.id, sexo) });
  };
  const trocarPeca = async (peca: PecaAvatar) => {
    await salvarProgresso(comprarPeca(progresso, peca));
    await salvarCrianca({ ...crianca, avatar: vestir(avatar, peca.categoria as CatLoja, peca.id, sexo) });
    await repo.registrarEvento({ id: novoId('ev'), criancaId, em: Date.now(), tipo: 'compra', texto: `Trocou ${peca.preco} moedinhas por: ${peca.nome} (boneco)` });
    efeitos.moeda();
    setConfirmarPeca(null);
    setProvando(null);
    await falar({ quem: 'sofia', texto: 'Que escolha boa! Já está no seu boneco.' }, crianca);
  };
  const alternar = async (id: string) => {
    efeitos.toque();
    await salvarCrianca({ ...crianca, avatar: alternarAcessibilidade(avatar, id) });
  };

  const pecas = pecasPara(cat, sexo);

  return (
    <div className="tela-lojinha" data-testid="lojinha">
      <Fundo cena="feira" desfoque={14} tom="calmo" />
      <Topo crianca={crianca} moedinhas={progresso.moedinhas.saldo} voltar={`c/${criancaId}/vila`} titulo="Lojinha da vila" />
      <main className="palco loja">
        <aside className="loja-boneco">
          <Boneco3D aparencia={aparencia} nome={crianca.nome} />
          {provando ? <p className="loja-provando" role="status"><Icone nome="olho" />Só experimentando: {provando.nome}</p> : null}
        </aside>
        <section className="cartao loja-painel">
          <div className="loja-cab">
            <Cofrinho saldo={progresso.moedinhas.saldo} />
            <div>
              <h1 className="t">Lojinha</h1>
              <p>Moedinhas só se ganham aprendendo. Nada com dinheiro de verdade, nada por sorte.</p>
              {itemMeta ? (
                <div className="meta-cofrinho">
                  <img src={asset(itemMeta.imagem)} alt="" />
                  <div>
                    <b>Minha meta: {itemMeta.nome}</b>
                    <div className="barrinha"><i style={{ width: `${Math.min(100, (progresso.moedinhas.saldo / itemMeta.preco) * 100)}%` }} /></div>
                    <small>{progresso.moedinhas.saldo >= itemMeta.preco ? 'Já dá para trocar!' : `Faltam ${itemMeta.preco - progresso.moedinhas.saldo} moedinhas`}</small>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <div className="abas loja-abas" role="tablist" aria-label="Seções da Lojinha">
            <button role="tab" aria-selected={aba === 'boneco'} className={`btn ${aba === 'boneco' ? 'pri' : ''}`} onClick={() => setAba('boneco')} data-aba="boneco"><Icone nome="pessoa" />Meu boneco</button>
            <button role="tab" aria-selected={aba === 'acessibilidade'} className={`btn ${aba === 'acessibilidade' ? 'pri' : ''}`} onClick={() => { setAba('acessibilidade'); setProvando(null); }} data-aba="acessibilidade"><Icone nome="olho" />Acessibilidade</button>
            <button role="tab" aria-selected={aba === 'utensilios'} className={`btn ${aba === 'utensilios' ? 'pri' : ''}`} onClick={() => { setAba('utensilios'); setProvando(null); }} data-aba="utensilios"><Icone nome="lojinha" />Utensílios</button>
          </div>

          {aba === 'boneco' ? (
            <div role="tabpanel" aria-label="Meu boneco" data-testid="loja-boneco">
              <div className="loja-cats" role="group" aria-label="Tipo de peça">
                {CATS.map(([c, r]) => <button key={c} type="button" className="pilula" aria-pressed={cat === c} onClick={() => { setCat(c); setProvando(null); }} data-cat={c}>{r}</button>)}
              </div>
              <div className="grade-loja grade-pecas">
                {pecas.map((peca) => {
                  const e = estadoPeca(peca, progresso);
                  const usando = avatar[cat] === peca.id;
                  const livre = e.estado === 'livre' || e.estado === 'tem';
                  const classe = usando ? 'tem' : livre || e.estado === 'pode' ? 'pode' : 'falta';
                  return (
                    <div key={peca.id} className={`item-loja item-peca ${classe} ${e.estado === 'fase' ? 'trancada' : ''}`} data-peca={peca.id} data-estado={e.estado}>
                      <span className="opcao-arte"><RetratoBoneco aparencia={resolverAparencia({ ...avatar, [cat]: peca.id }, sexo)} tipo={cat === 'cabelo' ? 'busto' : 'corpo'} largura={cat === 'cabelo' ? 160 : 132} altura={cat === 'cabelo' ? 160 : 190} /></span>
                      <b>{peca.nome}</b>
                      {usando ? <span className="ja-tem"><Icone nome="check" />Usando</span> : livre ? (
                        <button className="btn verde mini" onClick={() => usar(peca)}><Icone nome="check" />{e.estado === 'tem' ? 'Usar' : 'Usar · grátis'}</button>
                      ) : e.estado === 'pode' ? (
                        <>
                          <span className="preco"><img src={asset('recompensas/moeda.webp')} alt="" />{peca.preco}</span>
                          <button className="btn verde mini" onClick={() => setConfirmarPeca(peca)} data-trocar={peca.id}><Icone nome="check" />Trocar</button>
                        </>
                      ) : e.estado === 'faltam' ? (
                        <>
                          <span className="preco"><img src={asset('recompensas/moeda.webp')} alt="" />{peca.preco}</span>
                          <div className="barrinha"><i style={{ width: `${Math.min(100, (progresso.moedinhas.saldo / peca.preco) * 100)}%` }} /></div>
                          <small>Faltam {e.faltam}</small>
                          <button className="btn mini" onClick={() => setProvando(provando?.id === peca.id ? null : peca)}><Icone nome="olho" />Experimentar</button>
                        </>
                      ) : (
                        <>
                          <small className="cadeado"><Icone nome="cadeado" />{rotuloCadeado(e)}</small>
                          <button className="btn mini" onClick={() => setProvando(provando?.id === peca.id ? null : peca)}><Icone nome="olho" />Experimentar</button>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : aba === 'acessibilidade' ? (
            <div role="tabpanel" aria-label="Acessibilidade" data-testid="loja-acessibilidade">
              <p className="loja-nota"><span className="etiqueta verde"><Icone nome="check" />Sempre grátis</span> Use se quiser. Dá para colocar e tirar quando quiser.</p>
              <div className="grade-loja grade-pecas">
                {ACESSIBILIDADE.map((item) => {
                  const ligado = avatar.acessibilidade.includes(item.id);
                  const comItem = resolverAparencia({ ...avatar, acessibilidade: [item.id] }, sexo);
                  return (
                    <div key={item.id} className={`item-loja item-peca ${ligado ? 'tem' : 'pode'}`} data-acess={item.id}>
                      <span className="opcao-arte"><RetratoBoneco aparencia={comItem} tipo={item.id === 'cadeira-de-rodas' ? 'corpo' : 'busto'} largura={item.id === 'cadeira-de-rodas' ? 132 : 160} altura={item.id === 'cadeira-de-rodas' ? 190 : 160} /></span>
                      <b>{item.nome}</b>
                      <button className={`btn mini ${ligado ? '' : 'verde'}`} role="switch" aria-checked={ligado} onClick={() => alternar(item.id)}>{ligado ? <><Icone nome="x" />Tirar</> : <><Icone nome="check" />Colocar · grátis</>}</button>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div role="tabpanel" aria-label="Utensílios">
              {itemMeta ? null : <p className="nota-mic">Toque em "Quero juntar" para escolher uma meta para o cofrinho.</p>}
              <div className="grade-loja">
                {ITENS_LOJA.map((i) => {
                  const tem = progresso.itens.includes(i.id);
                  const { pode, faltam } = podeComprar(progresso, i.preco);
                  return (
                    <div key={i.id} className={`item-loja ${tem ? 'tem' : pode ? 'pode' : 'falta'}`} data-item={i.id}>
                      <img src={asset(i.imagem)} alt="" />
                      <b>{i.nome}</b>
                      <span className="preco"><img src={asset('recompensas/moeda.webp')} alt="" />{i.preco}</span>
                      {tem ? <span className="ja-tem"><Icone nome="check" />Na mochila</span> : pode ? (
                        <button className="btn verde" onClick={() => setConfirmar(i)}><Icone nome="check" />Trocar</button>
                      ) : (
                        <>
                          <div className="barrinha"><i style={{ width: `${Math.min(100, (progresso.moedinhas.saldo / i.preco) * 100)}%` }} /></div>
                          <small>Faltam {faltam}</small>
                          <button className="btn mini" onClick={() => definirMeta(i)}>Quero juntar</button>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>
      </main>
      {confirmar || confirmarPeca ? (
        <div className="modal" role="dialog" aria-modal="true" aria-label="Confirmar troca">
          <div className="cartao">
            {confirmar ? <img src={asset(confirmar.imagem)} alt="" className="modal-img" /> : null}
            <p className="t">Trocar <b>{(confirmar ?? confirmarPeca)!.preco} moedinhas</b> por <b>{(confirmar ?? confirmarPeca)!.nome}</b>?</p>
            {confirmar ? <p>{confirmar.fala}</p> : null}
            <p className="nota-mic">Depois da troca, sobram {progresso.moedinhas.saldo - (confirmar ?? confirmarPeca)!.preco} moedinhas.</p>
            <div className="linha-botoes">
              <button className="btn grande" onClick={() => { setConfirmar(null); setConfirmarPeca(null); }}>Esperar e juntar</button>
              <button className="btn grande verde" onClick={() => (confirmar ? comprarItem(confirmar) : trocarPeca(confirmarPeca!))} data-testid="confirmar-troca"><Icone nome="check" />Trocar agora</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
