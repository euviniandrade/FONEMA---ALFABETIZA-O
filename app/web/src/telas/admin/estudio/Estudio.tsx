/**
 * ESTÚDIO CRIATIVO (fila do dono nº 32: "editar os jogos, personagens e tudo, e editar voz"; nº 33: robô de voz).
 * Uma aba do administrador (#/admin/estudio/<parte>) que junta, em cartões, o que o dono mais muda:
 *  - Jogos: nome, "o que treina", ligado/desligado, ordem no Parque e as palavras da Casa do Som (com o verificador);
 *  - Personagens: nome, cor, quem é, apresentação, figuras e modelo 3D (Imagens e Foto → 3D), com prévia;
 *  - Vozes: todas as falas de cada personagem e os sons das letras: ouvir, regravar, trocar, voltar ao original;
 *  - Robô de voz: grava a voz do dono e o ElevenLabs devolve em outra voz (Adulto, Cômica, Personagem infantil).
 * Tudo entra nas mesmas edições/áudios do aparelho e sai no MESMO pacote do Publicar. Nenhuma aba antiga saiu (regra 7).
 */
import { useMemo, useState } from 'react';
import { PERSONAGENS } from '@fonema/conteudo';
import { Icone } from '../../../componentes/ui.tsx';
import { navegar } from '../../../rotas.ts';
import { asset } from '../../../servicos/ambiente.ts';
import { AbaPersonagens } from '../Gerenciador.tsx';
import { AvisoAutorizacao, ListaAudios, usePrefGravacao } from '../AbaAudios.tsx';
import { useVersaoEdicoes } from '../edicao-comum.tsx';
import { useCatalogo, useTrocados } from '../dados-admin.ts';
import { filtrarCatalogo } from '../../../servicos/catalogo-audios.ts';
import { EstudioJogos } from './EstudioJogos.tsx';
import { RoboVoz } from './RoboVoz.tsx';
import '../../../estilos-estudio.css';

type Parte = 'jogos' | 'personagens' | 'vozes' | 'robo';
const PARTES: { id: Parte; rotulo: string; icone: string; resumo: string }[] = [
  { id: 'jogos', rotulo: 'Jogos', icone: 'estrela', resumo: 'Nome, ligar/desligar, ordem no Parque e as palavras da Casa do Som.' },
  { id: 'personagens', rotulo: 'Personagens', icone: 'pessoa', resumo: 'Nome, cor, quem é, como se apresenta, figuras e modelo 3D.' },
  { id: 'vozes', rotulo: 'Vozes', icone: 'microfone', resumo: 'Cada fala de cada personagem: ouvir, regravar, trocar, voltar.' },
  { id: 'robo', rotulo: 'Robô de voz', icone: 'raio', resumo: 'Grave a sua voz e transforme em voz de adulto, cômica ou de personagem.' }
];

export function Estudio({ sub }: { sub?: string }) {
  const parte: Parte = (PARTES.find((p) => p.id === sub)?.id ?? 'jogos');
  return (
    <section className="adm-cartao est" data-testid="aba-estudio" data-parte={parte}>
      <div className="adm-cab"><h1>Estúdio criativo</h1></div>
      <p className="adm-nota">O que você muda aqui vale <b>neste aparelho</b> na hora. Para valer para todo mundo, gere o pacote em <button className="adm-link" onClick={() => navegar('admin/publicar')}>Publicar</button> (jogos, personagens e vozes vão juntos).</p>
      <nav className="est-partes" aria-label="Partes do estúdio">
        {PARTES.map((p) => (
          <button key={p.id} className="est-parte" aria-current={p.id === parte ? 'page' : undefined} onClick={() => navegar(`admin/estudio/${p.id}`)} data-parte={p.id}>
            <span className="est-parte-ic"><Icone nome={p.icone} /></span>
            <b>{p.rotulo}</b>
            <small>{p.resumo}</small>
          </button>
        ))}
      </nav>
      {parte === 'jogos' ? <EstudioJogos /> : null}
      {parte === 'personagens' ? <EstudioPersonagens /> : null}
      {parte === 'vozes' ? <EstudioVozes /> : null}
      {parte === 'robo' ? <RoboVoz /> : null}
    </section>
  );
}

/* ================================================================== PERSONAGENS */
/** Primeira figura que é imagem (para a prévia). */
const figuraDe = (imagens: string[]) => imagens.find((c) => /\.(webp|png|jpg)$/i.test(c) && !c.includes('giro/'));

function EstudioPersonagens() {
  useVersaoEdicoes();
  return (
    <div data-testid="estudio-personagens">
      <h2>Prévia do elenco</h2>
      <p className="adm-nota">É assim que cada personagem aparece agora (nome e cor de destaque). Mude logo abaixo; a prévia acompanha.</p>
      <div className="est-elenco">
        {PERSONAGENS.map((p) => {
          const fig = figuraDe(p.imagens);
          return (
            <figure key={p.id} className="est-ficha" style={{ ['--cor' as string]: p.cor }} data-testid="previa-personagem" data-personagem={p.id}>
              <div className="est-ficha-foto">{fig ? <img src={asset(fig)} alt="" /> : <span aria-hidden="true">{p.nome.slice(0, 1)}</span>}</div>
              <figcaption><b>{p.nome}</b><small>{p.papel}</small></figcaption>
            </figure>
          );
        })}
      </div>
      <div className="est-atalhos">
        <button className="est-atalho" onClick={() => navegar('admin/imagens')}><Icone nome="olho" /><span><b>Trocar figura ou modelo 3D</b><small>Aba Imagens: o arquivo novo entra no mesmo lugar (busto, giro 360°, .glb).</small></span></button>
        <button className="est-atalho" onClick={() => navegar('admin/foto3d')}><Icone nome="cubo" /><span><b>Foto → 3D</b><small>Transforma a foto de um OBJETO em modelo 3D (nunca foto de pessoa).</small></span></button>
        <button className="est-atalho" onClick={() => navegar('admin/estudio/vozes')}><Icone nome="microfone" /><span><b>Vozes do personagem</b><small>Ouvir e regravar as falas de cada um.</small></span></button>
      </div>
      <p className="adm-nota">Roupas e cores do boneco da <b>criança</b> são escolhidas por ela na Lojinha. Sofia, Tales e Bolota têm roupa fixa no desenho e no modelo 3D: para mudar a roupa deles, troque a figura ou o modelo (aba Imagens).</p>
      <AbaPersonagens />
    </div>
  );
}

/* ================================================================== VOZES */
const QUEM: { id: string; rotulo: string; filtro: { voz?: string; tipo?: 'som-letra' } }[] = [
  { id: 'sofia', rotulo: 'Sofia', filtro: { voz: 'sofia' } },
  { id: 'tales', rotulo: 'Tales', filtro: { voz: 'tales' } },
  { id: 'bolota', rotulo: 'Bolota', filtro: { voz: 'bolota' } },
  { id: 'letras', rotulo: 'Sons das letras', filtro: { tipo: 'som-letra' } }
];

function EstudioVozes() {
  const [pref, mudar] = usePrefGravacao();
  const [quem, setQuem] = useState('sofia');
  const catalogo = useCatalogo();
  const trocados = useTrocados();
  const contas = useMemo(() => Object.fromEntries(QUEM.map((q) => {
    const itens = filtrarCatalogo(catalogo ?? [], q.filtro);
    return [q.id, { total: itens.length, trocados: itens.filter((it) => trocados.has(it.id)).length }];
  })), [catalogo, trocados]);
  const atual = QUEM.find((q) => q.id === quem) ?? QUEM[0];
  return (
    <div data-testid="estudio-vozes">
      <h2>De quem é a voz?</h2>
      <div className="est-quem">
        {QUEM.map((q) => (
          <button key={q.id} className="est-quem-b" aria-current={q.id === quem ? 'true' : undefined} onClick={() => setQuem(q.id)} data-quem={q.id}>
            <b>{q.rotulo}</b>
            <small>{catalogo ? `${contas[q.id].total} áudios · ${contas[q.id].trocados} trocados aqui` : '…'}</small>
          </button>
        ))}
      </div>
      <p className="adm-nota">Cada linha: <b>Ouvir</b> o atual, <b>Subir áudio</b> (gravar de novo ou subir arquivo), <b>Voltar ao original</b>. Quer a sua voz em outro tom de personagem? Use o <button className="adm-link" onClick={() => navegar('admin/estudio/robo')}>Robô de voz</button> e salve o resultado na fala.
        {quem === 'letras' ? ' Sons das letras: só voz humana gravada (o robô não entra aqui).' : ''}</p>
      <AvisoAutorizacao pref={pref} mudar={mudar} />
      <ListaAudios key={quem} pref={pref} inicial={atual.filtro} />
    </div>
  );
}
