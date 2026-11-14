import { useEffect, useMemo, useState } from 'react';
import { CORES_CABELO, FALAS, PASSOS_AVATAR, pecasPara, type CategoriaAvatar, type Fala, type Genero, type PecaAvatar } from '@fonema/conteudo';
import { definirSexo, estadoPeca, montagemCompleta, passoPendente, proximasPecas, rotuloCadeado, vestir, type AvatarCrianca, type Crianca, type Progresso } from '@fonema/motor';
import { Fundo, Icone } from '../../componentes/ui.tsx';
import { useCrianca } from '../../contexto.tsx';
import { navegar } from '../../rotas.ts';
import { BotaoOuvir, Carregando, Topo } from '../../componentes/basicos.tsx';
import { Boneco3D, RetratoBoneco } from '../../componentes/Boneco3D.tsx';
import { resolverAparencia } from '../../avatar3d/modelo.ts';
import { asset } from '../../servicos/ambiente.ts';
import { efeitos } from '../../servicos/efeitos.ts';
import { falar, textoTela } from '../../util.ts';

export const CANTINHOS: [string, string, string][] = [['mata', 'Mata', '#3E9A63'], ['ipe', 'Ipê', '#F4B73C'], ['ceu', 'Céu', '#A8D5F2'], ['barro', 'Barro', '#C9714C']];

type PassoId = 'sexo' | (typeof PASSOS_AVATAR)[number]['id'] | 'lojinha';

/**
 * "Meu boneco" (D029 §1): a criança MONTA um boneco 3D de verdade, que começa limpo.
 * Passos obrigatórios: pele → rosto → olhos → cabelo (e cor) → camisa → calça → calçado. No fim, a vitrine da
 * Lojinha mostra o que abre depois (fase + moedinhas). Sem foto, sem joias; menina só vê peça de menina e menino,
 * de menino. Cadastro antigo sem sexo definido: a primeira pergunta é "menino ou menina?", uma única vez.
 */
export function Avatar({ criancaId }: { criancaId: string }) {
  const { crianca, progresso, salvarCrianca } = useCrianca(criancaId);
  if (!crianca || !progresso) return <Carregando />;
  return <Montador crianca={crianca} progresso={progresso} salvarCrianca={salvarCrianca} />;
}

function Montador({ crianca, progresso, salvarCrianca }: { crianca: Crianca; progresso: Progresso; salvarCrianca: (c: Crianca) => Promise<void> }) {
  const criancaId = crianca.id;
  const jaTinha = useState(() => crianca.avatar.pronto && !crianca.generoPendente)[0];
  const passos = useMemo<PassoId[]>(() => [...(crianca.generoPendente ? ['sexo' as const] : []), ...PASSOS_AVATAR.map((p) => p.id), 'lojinha'], [crianca.generoPendente]);
  const [indice, setIndice] = useState(() => {
    if (crianca.generoPendente) return 0;
    const pend = passoPendente(crianca.avatar);
    return pend === -1 ? 0 : pend;
  });
  const [aviso, setAviso] = useState('');
  const passo = passos[Math.min(indice, passos.length - 1)];
  const sexo = crianca.genero;
  const avatar = crianca.avatar;
  const aparencia = useMemo(() => resolverAparencia(avatar, sexo), [avatar, sexo]);
  const info = PASSOS_AVATAR.find((p) => p.id === passo);
  const primeiraVez = progresso.sessoesFeitas === 0 && !jaTinha;

  const fala: Fala = passo === 'sexo' ? FALAS.avatarSexo : passo === 'lojinha' ? FALAS.avatarLojinha : { quem: 'tales', texto: info?.pergunta ?? '' };
  useEffect(() => {
    setAviso('');
    falar(passo === 'pele' ? FALAS.avatar : fala, crianca);
    // fala só quando o passo muda (não a cada peça escolhida)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [passo]);

  const salvarAvatar = async (novo: AvatarCrianca) => { efeitos.toque(); await salvarCrianca({ ...crianca, avatar: novo }); };
  const escolher = async (cat: Exclude<CategoriaAvatar, 'acessibilidade'>, peca: PecaAvatar) => {
    const e = estadoPeca(peca, progresso);
    if (e.estado !== 'livre' && e.estado !== 'tem') {
      const texto = e.estado === 'fase' ? `${peca.nome}: ${rotuloCadeado(e).toLowerCase()}. Você encontra na Lojinha.` : `${peca.nome} custa ${e.preco} moedinhas. Você troca na Lojinha.`;
      setAviso(texto);
      efeitos.toque();
      return;
    }
    setAviso('');
    await salvarAvatar(vestir(avatar, cat, peca.id, sexo));
  };
  const escolherSexo = async (s: Genero) => { efeitos.toque(); await salvarCrianca(definirSexo(crianca, s)); setIndice(0); };

  const escolhido = passo === 'sexo' ? !crianca.generoPendente : passo === 'lojinha' ? true : !!avatar[passo];
  const ultimo = indice >= passos.length - 1;
  const completo = montagemCompleta(avatar) && !crianca.generoPendente;
  const concluir = async () => {
    if (!completo) { setIndice(passos.indexOf(PASSOS_AVATAR[passoPendente(avatar)].id)); return; }
    const c = { ...crianca, avatar: { ...avatar, pronto: true } };
    await salvarCrianca(c);
    await falar(FALAS.avatarPronto, c);
    navegar(primeiraVez ? `c/${criancaId}/chegada` : `c/${criancaId}/vila`);
  };

  const opcoes = passo !== 'sexo' && passo !== 'lojinha' ? pecasPara(passo, sexo) : [];
  const comRetrato = passo === 'rosto' || passo === 'cabelo' || passo === 'camisa' || passo === 'calca' || passo === 'calcado';
  const corpoInteiro = passo === 'camisa' || passo === 'calca' || passo === 'calcado';
  const vitrine = passo === 'lojinha' ? proximasPecas(progresso, sexo, 6) : [];

  return (
    <div className="tela-avatar" data-testid="montar-avatar" data-passo={passo}>
      <Fundo cena="quintal" desfoque={14} tom="calmo" />
      <Topo crianca={crianca} moedinhas={progresso.moedinhas.saldo} voltar={jaTinha ? `c/${criancaId}/vila` : undefined} titulo="Meu boneco" />
      <main className="montar">
        <section className="montar-palco" aria-label="Seu boneco">
          <Boneco3D aparencia={aparencia} nome={crianca.nome} />
        </section>

        <section className="cartao montar-painel">
          <ol className="montar-passos" aria-label="Passos da montagem">
            {passos.map((p, i) => {
              const feito = p === 'sexo' ? !crianca.generoPendente : p === 'lojinha' ? false : !!avatar[p];
              const pode = jaTinha || i <= indice || feito || passos.slice(0, i).every((q) => q === 'sexo' ? !crianca.generoPendente : q === 'lojinha' || !!avatar[q]);
              const rotulo = p === 'sexo' ? 'Menino ou menina' : p === 'lojinha' ? 'Lojinha' : PASSOS_AVATAR.find((x) => x.id === p)!.titulo;
              return (
                <li key={p}>
                  <button type="button" className={`montar-passo ${i === indice ? 'atual' : ''} ${feito ? 'feito' : ''}`} disabled={!pode} aria-current={i === indice ? 'step' : undefined} aria-label={`Passo ${i + 1}: ${rotulo}${feito ? ' (escolhido)' : ''}`} onClick={() => setIndice(i)} data-ir-passo={p}>
                    {feito ? <Icone nome="check" /> : <b>{i + 1}</b>}
                    <span>{rotulo}</span>
                  </button>
                </li>
              );
            })}
          </ol>

          <header className="montar-pergunta">
            <h1 className="t">{textoTela(fala.texto, crianca)}</h1>
            <BotaoOuvir onClick={() => falar(fala, crianca)} />
          </header>

          <div className="montar-corpo">
            {passo === 'sexo' ? (
              <div className="montar-sexo" role="radiogroup" aria-label="Menino ou menina">
                <button type="button" className="btn enorme pri" role="radio" aria-checked={false} onClick={() => escolherSexo('m')} data-sexo="m">Menino</button>
                <button type="button" className="btn enorme ipe" role="radio" aria-checked={false} onClick={() => escolherSexo('f')} data-sexo="f">Menina</button>
              </div>
            ) : passo === 'lojinha' ? (
              <div className="montar-vitrine" data-testid="vitrine-lojinha">
                <p className="montar-dica">Seu boneco começa simples. A cada letra que você aprende, abrem roupas e penteados novos na <b>Lojinha</b>. Você troca pelas moedinhas que ganha aprendendo.</p>
                <ul className="vitrine-lista">
                  {vitrine.map(({ peca, estado }) => (
                    <li key={`${peca.categoria}:${peca.id}`} className="opcao-peca trancada" data-peca={peca.id}>
                      <span className="opcao-arte"><RetratoBoneco aparencia={resolverAparencia({ ...avatar, [peca.categoria]: peca.id }, sexo)} tipo={peca.categoria === 'cabelo' ? 'busto' : 'corpo'} largura={peca.categoria === 'cabelo' ? 160 : 132} altura={peca.categoria === 'cabelo' ? 160 : 190} /></span>
                      <b>{peca.nome}</b>
                      <small className="cadeado"><Icone nome="cadeado" />{rotuloCadeado(estado)}</small>
                    </li>
                  ))}
                </ul>
                <p className="montar-nota">Óculos, aparelho auditivo, cadeira de rodas e pintura no rosto ficam na Lojinha, em <b>Acessibilidade</b>: são sempre grátis.</p>
              </div>
            ) : (
              <>
                <div className={`montar-opcoes ${comRetrato ? 'com-retrato' : 'cores'} ${corpoInteiro ? 'corpo' : ''}`} role="radiogroup" aria-label={info?.pergunta}>
                  {opcoes.map((peca) => {
                    const e = estadoPeca(peca, progresso);
                    const livre = e.estado === 'livre' || e.estado === 'tem';
                    const sel = avatar[passo] === peca.id;
                    return (
                      <button
                        key={peca.id} type="button" role="radio" aria-checked={sel} data-peca={peca.id} data-estado={e.estado}
                        className={`${comRetrato ? 'opcao-peca' : 'opcao-cor'} ${sel ? 'sel' : ''} ${livre ? '' : 'trancada'}`}
                        style={comRetrato ? undefined : { ['--cor' as string]: peca.cor }}
                        aria-label={livre ? peca.nome : `${peca.nome}. ${rotuloCadeado(e)}`}
                        onClick={() => escolher(passo, peca)}
                      >
                        {comRetrato ? (
                          <>
                            <span className="opcao-arte"><RetratoBoneco aparencia={resolverAparencia({ ...avatar, [passo]: peca.id }, sexo)} tipo={corpoInteiro ? 'corpo' : 'busto'} largura={corpoInteiro ? 132 : 160} altura={corpoInteiro ? 190 : 160} /></span>
                            <b>{peca.nome}</b>
                            {livre ? null : <small className="cadeado"><Icone nome="cadeado" />{rotuloCadeado(e)}</small>}
                          </>
                        ) : sel ? <Icone nome="check" /> : null}
                      </button>
                    );
                  })}
                </div>
                {passo === 'cabelo' ? (
                  <div className="montar-opcoes cores cor-cabelo" role="radiogroup" aria-label="Cor do cabelo">
                    {CORES_CABELO.map((c) => (
                      <button key={c.id} type="button" role="radio" aria-checked={avatar.corCabelo === c.id} className={`opcao-cor ${avatar.corCabelo === c.id ? 'sel' : ''}`} style={{ ['--cor' as string]: c.cor }} aria-label={`Cabelo ${c.nome.toLowerCase()}`} onClick={() => salvarAvatar({ ...avatar, corCabelo: c.id })} data-cor-cabelo={c.id}>
                        {avatar.corCabelo === c.id ? <Icone nome="check" /> : null}
                      </button>
                    ))}
                  </div>
                ) : null}
              </>
            )}
          </div>

          <p className="montar-aviso" role="status" aria-live="polite">{aviso ? <><img src={asset('recompensas/moeda.webp')} alt="" />{aviso}</> : null}</p>

          <footer className="montar-rodape">
            <button type="button" className="btn" disabled={indice === 0} onClick={() => setIndice((i) => Math.max(0, i - 1))} data-testid="avatar-voltar"><Icone nome="seta-esq" />Voltar</button>
            {ultimo ? (
              <button type="button" className="btn grande ipe brilha" onClick={concluir} data-testid="avatar-pronto"><Icone nome="check" />Pronto!</button>
            ) : (
              <>
                {jaTinha ? <button type="button" className="btn verde" onClick={concluir} data-testid="avatar-pronto"><Icone nome="check" />Pronto!</button> : null}
                <button type="button" className="btn grande pri" disabled={!escolhido} onClick={() => setIndice((i) => i + 1)} data-testid="avatar-proximo">Próximo<Icone nome="seta" /></button>
              </>
            )}
          </footer>
        </section>
      </main>
    </div>
  );
}
