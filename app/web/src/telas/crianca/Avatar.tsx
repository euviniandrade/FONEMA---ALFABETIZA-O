import { useEffect, useMemo, useState } from 'react';
import { FALAS, PASSOS_AVATAR, pecasPara, type Fala, type Genero, type PassoAvatar, type PecaAvatar } from '@fonema/conteudo';
import { definirSexo, estadoPeca, pecaEmUso, proximasPecas, rotuloCadeado, vestir, type AvatarCrianca, type Crianca, type Progresso } from '@fonema/motor';
import { Fundo, Icone } from '../../componentes/ui.tsx';
import { useCrianca } from '../../contexto.tsx';
import { navegar } from '../../rotas.ts';
import { BotaoOuvir, Carregando, Topo } from '../../componentes/basicos.tsx';
import { Boneco3D, RetratoBoneco } from '../../componentes/Boneco3D.tsx';
import { modelosExistentes, resolverAparencia } from '../../avatar3d/index.ts';
import { asset } from '../../servicos/ambiente.ts';
import { efeitos } from '../../servicos/efeitos.ts';
import { falar, textoTela } from '../../util.ts';

export const CANTINHOS: [string, string, string][] = [['mata', 'Mata', '#3E9A63'], ['ipe', 'Ipê', '#F4B73C'], ['ceu', 'Céu', '#A8D5F2'], ['barro', 'Barro', '#C9714C']];

type PassoId = 'sexo' | PassoAvatar | 'lojinha';

/** Tipos de cabelo que já têm modelo 3D (o padrão sempre conta). Enquanto o manifesto não chega, só o padrão. */
export function useModelosExistentes(): Set<string> | null {
  const [existem, setExistem] = useState<Set<string> | null>(null);
  useEffect(() => { let vivo = true; modelosExistentes().then((s) => { if (vivo) setExistem(s); }); return () => { vivo = false; }; }, []);
  return existem;
}
export const cabeloExiste = (peca: PecaAvatar, existem: Set<string> | null): boolean => peca.categoria !== 'cabelo' || !!peca.padrao || (!!peca.modelo && !!existem?.has(peca.modelo));

/**
 * "Meu boneco" (D029 §1 e §7): criador de personagem em 3D. O boneco COMEÇA no padrão completo (modelo de verdade,
 * roupa branca com o "A" azul) e a criança vai personalizando: cor da pele, dos olhos, do cabelo, tipo de cabelo
 * (quando há variações), cor da camiseta, da calça e do calçado. Nada é obrigatório. No fim, a vitrine da Lojinha
 * mostra o que abre depois (fase + moedinhas). Cadastro antigo sem sexo definido: a primeira pergunta é
 * "menino ou menina?", uma única vez.
 */
export function Avatar({ criancaId }: { criancaId: string }) {
  const { crianca, progresso, salvarCrianca } = useCrianca(criancaId);
  if (!crianca || !progresso) return <Carregando />;
  return <Montador crianca={crianca} progresso={progresso} salvarCrianca={salvarCrianca} />;
}

function Montador({ crianca, progresso, salvarCrianca }: { crianca: Crianca; progresso: Progresso; salvarCrianca: (c: Crianca) => Promise<void> }) {
  const criancaId = crianca.id;
  const jaTinha = useState(() => crianca.avatar.pronto && !crianca.generoPendente)[0];
  const existem = useModelosExistentes();
  const sexo = crianca.genero;
  const avatar = crianca.avatar;
  const cabelos = useMemo(() => pecasPara('cabelo', sexo).filter((p) => cabeloExiste(p, existem)), [sexo, existem]);
  const passos = useMemo<PassoId[]>(() => [
    ...(crianca.generoPendente ? ['sexo' as const] : []),
    // "tipo de cabelo" só entra quando existe mais de um modelo para este sexo
    ...PASSOS_AVATAR.map((p) => p.id).filter((id) => id !== 'cabelo' || cabelos.length > 1),
    'lojinha'
  ], [crianca.generoPendente, cabelos.length]);
  const [indice, setIndice] = useState(0);
  const [aviso, setAviso] = useState('');
  const passo = passos[Math.min(indice, passos.length - 1)];
  const aparencia = useMemo(() => resolverAparencia(avatar, sexo), [avatar, sexo]);
  const info = PASSOS_AVATAR.find((p) => p.id === passo);
  const primeiraVez = progresso.sessoesFeitas === 0 && !jaTinha;

  const fala: Fala = passo === 'sexo' ? FALAS.avatarSexo : passo === 'lojinha' ? FALAS.avatarLojinha : { quem: 'tales', texto: info?.pergunta ?? '' };
  useEffect(() => {
    setAviso('');
    falar(passo === 'pele' ? FALAS.avatar : fala, crianca);
    // fala só quando o passo muda (não a cada cor escolhida)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [passo]);

  const escolher = async (cat: PassoAvatar, peca: PecaAvatar) => {
    const e = estadoPeca(peca, progresso);
    efeitos.toque();
    if (e.estado !== 'livre' && e.estado !== 'tem') {
      setAviso(e.estado === 'fase' ? `${peca.nome}: ${rotuloCadeado(e).replace(/^A/, 'a')}. Você encontra na Lojinha.` : `${peca.nome} custa ${e.preco} moedinhas. Você troca na Lojinha.`);
      return;
    }
    setAviso('');
    await salvarCrianca({ ...crianca, avatar: vestir(avatar, cat, peca.id, sexo) });
  };
  const escolherSexo = async (s: Genero) => { efeitos.toque(); await salvarCrianca(definirSexo(crianca, s)); setIndice(0); };

  const ultimo = indice >= passos.length - 1;
  const concluir = async () => {
    if (crianca.generoPendente) { setIndice(0); return; }
    const c = { ...crianca, avatar: { ...avatar, pronto: true } };
    const aqui = location.hash;
    await salvarCrianca(c);
    await falar(FALAS.avatarPronto, c);
    // se a pessoa já foi para outra tela durante a fala, não puxa de volta
    if (location.hash === aqui) navegar(primeiraVez ? `c/${criancaId}/chegada` : `c/${criancaId}/vila`);
  };

  const opcoes = passo === 'sexo' || passo === 'lojinha' ? [] : passo === 'cabelo' ? cabelos : pecasPara(passo, sexo);
  const emUso = passo !== 'sexo' && passo !== 'lojinha' ? pecaEmUso(avatar, passo, sexo) : undefined;
  const vitrine = passo === 'lojinha' ? proximasPecas(progresso, sexo, 5, (p) => cabeloExiste(p, existem)) : [];
  const com = (cat: PassoAvatar, id: string): AvatarCrianca => ({ ...avatar, [cat]: id });

  return (
    <div className="tela-avatar" data-testid="montar-avatar" data-passo={passo}>
      <Fundo cena="quintal" desfoque={14} tom="calmo" />
      <Topo crianca={crianca} moedinhas={progresso.moedinhas.saldo} voltar={jaTinha ? `c/${criancaId}/vila` : undefined} titulo="Meu boneco" />
      <main className="montar">
        <section className="montar-palco" aria-label="Seu boneco">
          <Boneco3D aparencia={aparencia} nome={crianca.nome} />
        </section>

        <section className="cartao montar-painel">
          <ol className="montar-passos" aria-label="Passos para deixar o boneco do seu jeito">
            {passos.map((p, i) => {
              const feito = p === 'sexo' ? !crianca.generoPendente : p === 'lojinha' ? false : !!avatar[p];
              const rotulo = p === 'sexo' ? 'Menino ou menina' : p === 'lojinha' ? 'Lojinha' : PASSOS_AVATAR.find((x) => x.id === p)!.titulo;
              return (
                <li key={p}>
                  <button type="button" className={`montar-passo ${i === indice ? 'atual' : ''} ${feito ? 'feito' : ''}`} disabled={!!crianca.generoPendente && p !== 'sexo'} aria-current={i === indice ? 'step' : undefined} aria-label={`Passo ${i + 1}: ${rotulo}${feito ? ' (mudado)' : ''}`} onClick={() => setIndice(i)} data-ir-passo={p}>
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
                <p className="montar-dica">Seu boneco já está pronto para a aventura. A cada letra que você aprende, abrem cores e penteados novos na <b>Lojinha</b>. Você troca pelas moedinhas que ganha aprendendo.</p>
                <ul className="vitrine-lista">
                  {vitrine.map(({ peca, estado }) => (
                    <li key={`${peca.categoria}:${peca.id}`} className="opcao-peca trancada" data-peca={peca.id}>
                      <span className="opcao-arte"><RetratoBoneco aparencia={resolverAparencia(com(peca.categoria as PassoAvatar, peca.id), sexo)} tipo={peca.categoria === 'cabelo' ? 'busto' : 'corpo'} largura={peca.categoria === 'cabelo' ? 160 : 132} altura={peca.categoria === 'cabelo' ? 160 : 190} /></span>
                      <b>{nomeNaVitrine(peca)}</b>
                      <small className="cadeado"><Icone nome="cadeado" />{rotuloCadeado(estado)}</small>
                    </li>
                  ))}
                </ul>
                <p className="montar-nota">Óculos e pintura no rosto ficam na Lojinha, em <b>Acessibilidade</b>: são sempre grátis.</p>
              </div>
            ) : passo === 'cabelo' ? (
              <div className="montar-opcoes com-retrato" role="radiogroup" aria-label={info?.pergunta}>
                {opcoes.map((peca) => {
                  const e = estadoPeca(peca, progresso);
                  const livre = e.estado === 'livre' || e.estado === 'tem';
                  const sel = emUso?.id === peca.id;
                  return (
                    <button key={peca.id} type="button" role="radio" aria-checked={sel} data-peca={peca.id} data-estado={e.estado} className={`opcao-peca ${sel ? 'sel' : ''} ${livre ? '' : 'trancada'}`} aria-label={livre ? peca.nome : `${peca.nome}. ${rotuloCadeado(e)}`} onClick={() => escolher(passo, peca)}>
                      <span className="opcao-arte"><RetratoBoneco aparencia={resolverAparencia(com('cabelo', peca.id), sexo)} tipo="busto" largura={160} altura={160} /></span>
                      <b>{peca.nome}</b>
                      {livre ? null : <small className="cadeado"><Icone nome="cadeado" />{rotuloCadeado(e)}</small>}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="montar-opcoes cores" role="radiogroup" aria-label={info?.pergunta}>
                {opcoes.map((peca) => {
                  const e = estadoPeca(peca, progresso);
                  const livre = e.estado === 'livre' || e.estado === 'tem';
                  const sel = emUso?.id === peca.id;
                  return (
                    <div key={peca.id} className="opcao-cor-caixa">
                      <button
                        type="button" role="radio" aria-checked={sel} data-peca={peca.id} data-estado={e.estado}
                        className={`opcao-cor ${sel ? 'sel' : ''} ${livre ? '' : 'trancada'} ${peca.cor === '#FFFFFF' ? 'clara' : ''}`}
                        style={{ ['--cor' as string]: peca.cor }}
                        aria-label={livre ? peca.nome : `${peca.nome}. ${rotuloCadeado(e)}`}
                        onClick={() => escolher(passo, peca)}
                      >
                        {sel ? <Icone nome="check" /> : livre ? null : <Icone nome="cadeado" />}
                      </button>
                      <small>{livre ? peca.nome : rotuloCadeado(e).replace('Abre na ', '')}</small>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <p className="montar-aviso" role="status" aria-live="polite">{aviso ? <><img src={asset('recompensas/moeda.webp')} alt="" />{aviso}</> : null}</p>

          <footer className="montar-rodape">
            <button type="button" className="btn" disabled={indice === 0} onClick={() => setIndice((i) => Math.max(0, i - 1))} data-testid="avatar-voltar" aria-label="Voltar um passo"><Icone nome="seta-esq" /><span>Voltar</span></button>
            {ultimo ? (
              <button type="button" className="btn grande ipe brilha" onClick={concluir} data-testid="avatar-pronto"><Icone nome="check" />Pronto!</button>
            ) : (
              <>
                {passo === 'sexo' ? null : <button type="button" className="btn verde" onClick={concluir} data-testid="avatar-pronto"><Icone nome="check" />Pronto!</button>}
                <button type="button" className="btn grande pri" disabled={passo === 'sexo'} onClick={() => setIndice((i) => i + 1)} data-testid="avatar-proximo">Próximo<Icone nome="seta" /></button>
              </>
            )}
          </footer>
        </section>
      </main>
    </div>
  );
}

const NOME_CATEGORIA: Partial<Record<PecaAvatar['categoria'], string>> = { camisa: 'Camiseta', calca: 'Calça', calcado: 'Calçado' };
/** Na vitrine as cores vêm de categorias diferentes: "Camiseta verde", "Calçado amarelo"… */
export function nomeNaVitrine(peca: PecaAvatar): string {
  const cat = NOME_CATEGORIA[peca.categoria];
  return cat ? `${cat}: ${peca.nome.toLowerCase()}` : peca.nome;
}
