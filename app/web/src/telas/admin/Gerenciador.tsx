/**
 * GERENCIADOR DE CONTEÚDO (fila do dono nº 18: "editar tudo, completamente tudo"): abas Textos e falas, Personagens e
 * prêmios, Leitura (histórias, textos, fichas), Imagens, Histórico e o espaço da ferramenta "Transformar foto em 3D".
 * Tudo vale NESTE aparelho (D032: sem servidor) até o pacote ser gerado em Publicar e aplicado no repositório
 * (scripts/importar-pacote.ts). Missões ficam em AbaMissoes.tsx; as peças comuns em edicao-comum.tsx.
 */
import { Suspense, lazy, useEffect, useMemo, useState, type ComponentType } from 'react';
import {
  CAMPOS_SEMANTICOS, CONQUISTAS, CONTEUDO_EDITAVEL, HISTORIAS, ITENS_LOJA, ONDE_TEXTO_TELA, PERSONAGENS, RECURSOS, ROTULO_RECURSO, SURPRESAS, TEXTOS_DECODIFICAVEIS,
  TEXTOS_TELA, todosOsTextos, type Recursos
} from '@fonema/conteudo';
import { Icone } from '../../componentes/ui.tsx';
import { navegar } from '../../rotas.ts';
import { asset } from '../../servicos/ambiente.ts';
import { edicoes, type MidiaTrocada } from '../../servicos/edicoes.ts';
import { CampoEditavel, Paginas, useVersaoEdicoes, quemEdita } from './edicao-comum.tsx';
import { dataCurta } from './dados-admin.ts';

declare const __FONEMA_IMAGENS__: string[] | undefined;
/** Todas as figuras e modelos de public/assets (lista gerada no build). */
export const IMAGENS_DO_SITE: string[] = typeof __FONEMA_IMAGENS__ !== 'undefined' ? __FONEMA_IMAGENS__ : [];

/* ================================================================== TEXTOS E FALAS */
export function AbaTextos() {
  const v = useVersaoEdicoes();
  const [busca, setBusca] = useState('');
  const [colecao, setColecao] = useState('');
  const [tipo, setTipo] = useState('');
  const [so, setSo] = useState('');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const todos = useMemo(() => todosOsTextos(CONTEUDO_EDITAVEL), [v]);
  const editados = new Set(edicoes.edicoes().map((e) => `${e.colecao}|${e.item}|${JSON.stringify(e.caminho ?? [])}`));
  const b = busca.trim().toLowerCase();
  const lista = todos.filter((t) => (!colecao || t.colecao === colecao) && (!tipo || t.tipo === tipo) && (!b || `${t.texto} ${t.onde}`.toLowerCase().includes(b))
    && (!so || editados.has(`${t.colecao}|${t.item}|${JSON.stringify(t.caminho)}`)));
  const cols = CONTEUDO_EDITAVEL.listaDeColecoes().filter((c) => c.id !== 'banco' && c.id !== 'recursos');
  return (
    <section className="adm-cartao" data-testid="aba-textos">
      <div className="adm-cab"><h1>Textos e falas</h1><span className="adm-nota">{todos.length} textos: falas da Sofia, do Tales e do Bolota, títulos, dicas e textos de tela.</span></div>
      <p className="adm-nota">Mudar o texto de uma fala deixa o áudio <b>desatualizado</b>: grave ou suba a voz ali mesmo (ou na aba Áudios). Enquanto não houver voz, a fala aparece escrita no balão. Textos que a criança LÊ passam pelo verificador.</p>
      <div className="adm-filtros">
        <label className="adm-campo largo">Procurar <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="palavra, fase (TF-10), personagem…" data-testid="busca-texto" /></label>
        <label className="adm-campo">Onde <select value={colecao} onChange={(e) => setColecao(e.target.value)} data-testid="filtro-colecao"><option value="">tudo</option>{cols.map((c) => <option key={c.id} value={c.id}>{c.rotulo}</option>)}</select></label>
        <label className="adm-campo">Tipo <select value={tipo} onChange={(e) => setTipo(e.target.value)}><option value="">todos</option><option value="fala">falas</option><option value="titulo">títulos</option><option value="dica">dicas</option><option value="texto">outros textos</option></select></label>
        <label className="adm-campo">Mostrar <select value={so} onChange={(e) => setSo(e.target.value)}><option value="">todos</option><option value="editados">só os editados aqui</option></select></label>
      </div>
      <p className="adm-nota" data-testid="contagem-textos">{lista.length} encontrados</p>
      <Paginas itens={lista} por={25} render={(t) => (
        <CampoEditavel key={`${t.colecao}|${t.item}|${t.caminho.join('/')}`} alvo={t} rotulo={<><span className="adm-etq cinza">{CONTEUDO_EDITAVEL.colecao(t.colecao)?.rotulo}</span> {t.onde}</>} quem={t.tipo === 'fala' ? t.quem : undefined} multilinha={t.texto.length > 60} />
      )} />
    </section>
  );
}

/* ================================================================== IMAGENS */

/** Lê a largura e a altura de uma imagem. */
function medidas(src: string): Promise<{ w: number; h: number } | null> {
  return new Promise((r) => { const i = new Image(); i.onload = () => r({ w: i.naturalWidth, h: i.naturalHeight }); i.onerror = () => r(null); i.src = src; });
}
/** Recorta/redimensiona no navegador para o tamanho da figura original, em webp (ou png). */
export async function prepararImagem(arquivo: Blob, alvo: { w: number; h: number }, modo: 'cortar' | 'caber', tipo: 'image/webp' | 'image/png'): Promise<Blob> {
  const url = URL.createObjectURL(arquivo);
  try {
    const img = await new Promise<HTMLImageElement>((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => rej(new Error('Não deu para abrir esta imagem.')); i.src = url; });
    const c = document.createElement('canvas');
    c.width = alvo.w; c.height = alvo.h;
    const g = c.getContext('2d')!;
    const k = modo === 'cortar' ? Math.max(alvo.w / img.naturalWidth, alvo.h / img.naturalHeight) : Math.min(alvo.w / img.naturalWidth, alvo.h / img.naturalHeight);
    const w = img.naturalWidth * k, h = img.naturalHeight * k;
    g.imageSmoothingQuality = 'high';
    g.drawImage(img, (alvo.w - w) / 2, (alvo.h - h) / 2, w, h);
    const b = await new Promise<Blob | null>((res) => c.toBlob(res, tipo, 0.86));
    if (!b) throw new Error('Este navegador não gerou a imagem.');
    return b;
  } finally { URL.revokeObjectURL(url); }
}

/** Trocar UMA figura ou modelo (caminho em assets/): subir, recortar, ver antes × depois, guardar, voltar ao original. */
export function TrocarImagem({ caminho, aoFechar }: { caminho: string; aoFechar?: () => void }) {
  useVersaoEdicoes();
  const modelo = /\.glb$/i.test(caminho);
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [modo, setModo] = useState<'cortar' | 'caber'>('caber');
  const [pronta, setPronta] = useState<{ blob: Blob; url: string } | null>(null);
  const [orig, setOrig] = useState<{ w: number; h: number } | null>(null);
  const [erro, setErro] = useState('');
  const trocada = edicoes.midiaTrocada(caminho);
  useEffect(() => { if (!modelo) void medidas(`./assets/${caminho}`).then(setOrig); }, [caminho, modelo]);
  useEffect(() => {
    if (!arquivo) { setPronta(null); return; }
    let vivo = true;
    setErro('');
    if (modelo) { setPronta({ blob: arquivo, url: '' }); return; }
    const alvo = orig ?? { w: 512, h: 512 };
    void prepararImagem(arquivo, alvo, modo, /\.png$/i.test(caminho) ? 'image/png' : 'image/webp').then(
      (b) => { if (vivo) setPronta((a) => { if (a?.url) URL.revokeObjectURL(a.url); return { blob: b, url: URL.createObjectURL(b) }; }); },
      (e: unknown) => { if (vivo) setErro(e instanceof Error ? e.message : 'Não deu.'); }
    );
    return () => { vivo = false; };
  }, [arquivo, modo, orig, caminho, modelo]);
  const escolher = (f?: File) => {
    if (!f) return;
    if (modelo ? !/\.glb$/i.test(f.name) : !/^image\//.test(f.type)) { setErro(modelo ? 'Escolha um modelo .glb.' : 'Escolha uma imagem (png, jpg, webp).'); return; }
    if (f.size > 20_000_000) { setErro('Arquivo grande demais (máximo 20 MB).'); return; }
    setArquivo(f);
  };
  const salvar = async () => {
    if (!pronta || !arquivo) return;
    try {
      const m: MidiaTrocada = { caminho, blob: pronta.blob, nome: arquivo.name, em: Date.now(), quem: quemEdita(), ...(orig ? { largura: orig.w, altura: orig.h } : {}) };
      await edicoes.salvarMidia(m);
      setArquivo(null);
      aoFechar?.();
    } catch (e) { setErro(e instanceof Error ? e.message : 'Não deu para guardar.'); }
  };
  return (
    <div className="adm-editor" data-testid="trocar-imagem" data-caminho={caminho}>
      <div className="adm-linha"><code>assets/{caminho}</code>{orig ? <span className="adm-nota">{orig.w} × {orig.h}</span> : null}{trocada ? <span className="adm-etq ipe">trocada aqui em {dataCurta(trocada.em)}</span> : null}</div>
      <div className="adm-antes-depois">
        {!modelo ? <figure><img src={`./assets/${caminho}`} alt="" /><figcaption>Original</figcaption></figure> : <p className="adm-nota">Modelo 3D (.glb): entra como veio, sem recorte.</p>}
        {trocada && !modelo ? <figure><img src={asset(caminho)} alt="" /><figcaption>Agora (neste aparelho)</figcaption></figure> : null}
        {pronta?.url ? <figure><img src={pronta.url} alt="" data-testid="previa-imagem" /><figcaption>Nova ({modo === 'cortar' ? 'cortada para preencher' : 'inteira'})</figcaption></figure> : null}
      </div>
      <div className="adm-linha">
        <label className="btn adm-btn pri"><Icone nome="baixar" />{modelo ? 'Escolher modelo .glb' : 'Escolher imagem'}
          <input type="file" accept={modelo ? '.glb,model/gltf-binary' : 'image/*'} className="sr" onChange={(e) => { escolher(e.target.files?.[0]); e.target.value = ''; }} data-testid="arquivo-imagem" />
        </label>
        {!modelo ? (
          <>
            <label className="adm-check"><input type="radio" checked={modo === 'caber'} onChange={() => setModo('caber')} /> Inteira (sobra fica transparente)</label>
            <label className="adm-check"><input type="radio" checked={modo === 'cortar'} onChange={() => setModo('cortar')} /> Cortar para preencher</label>
          </>
        ) : null}
        <button className="btn adm-btn verde" disabled={!pronta} onClick={() => void salvar()} data-testid="salvar-imagem"><Icone nome="check" />Guardar</button>
        {trocada ? <button className="btn adm-btn" onClick={() => void edicoes.removerMidia(caminho)} data-testid="original-imagem"><Icone nome="lixeira" />Voltar ao original</button> : null}
        {aoFechar ? <button className="btn adm-btn" onClick={aoFechar}>Fechar</button> : null}
      </div>
      {erro ? <p className="adm-erro" role="alert">{erro}</p> : null}
      {!modelo ? <p className="adm-nota">A imagem nova sai no mesmo tamanho e formato da original (webp), recortada aqui no navegador.</p> : null}
    </div>
  );
}

export function AbaImagens() {
  useVersaoEdicoes();
  const [pasta, setPasta] = useState('figuras');
  const [busca, setBusca] = useState('');
  const [aberta, setAberta] = useState<string | null>(null);
  const [so, setSo] = useState('');
  const pastas = useMemo(() => [...new Set(IMAGENS_DO_SITE.map((c) => c.split('/')[0]))], []);
  const trocadas = new Set(edicoes.midias().map((m) => m.caminho));
  const b = busca.trim().toLowerCase();
  const lista = IMAGENS_DO_SITE.filter((c) => (!pasta || c.startsWith(`${pasta}/`)) && (!b || c.toLowerCase().includes(b)) && !/\.anim\.webp$/.test(c) && (!so || trocadas.has(c)));
  return (
    <section className="adm-cartao" data-testid="aba-imagens">
      <div className="adm-cab"><h1>Imagens e modelos</h1><span className="adm-nota">{IMAGENS_DO_SITE.length} arquivos · {trocadas.size} trocados neste aparelho</span></div>
      <p className="adm-nota">Toque numa figura para trocar por um arquivo seu. A nova entra no mesmo lugar (em todas as telas que usam aquela figura), recortada para o tamanho e o formato do app.</p>
      <div className="adm-filtros">
        <label className="adm-campo">Pasta <select value={pasta} onChange={(e) => setPasta(e.target.value)} data-testid="filtro-pasta"><option value="">todas</option>{pastas.map((p) => <option key={p} value={p}>{p}</option>)}</select></label>
        <label className="adm-campo largo">Procurar <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="uva, sofia, caderno…" data-testid="busca-imagem" /></label>
        <label className="adm-campo">Mostrar <select value={so} onChange={(e) => setSo(e.target.value)}><option value="">todas</option><option value="trocadas">só as trocadas</option></select></label>
      </div>
      {aberta ? <TrocarImagem caminho={aberta} aoFechar={() => setAberta(null)} /> : null}
      <div className="adm-galeria">
        <Paginas itens={lista} por={60} render={(c) => (
          <button key={c} className={`adm-miniatura ${trocadas.has(c) ? 'trocada' : ''}`} onClick={() => setAberta(c)} data-caminho={c} data-testid="miniatura">
            {/\.glb$/i.test(c) ? <Icone nome="cubo" /> : <img src={asset(c)} alt="" loading="lazy" />}
            <small>{c.replace(/^[^/]+\//, '')}</small>
          </button>
        )} />
      </div>
    </section>
  );
}

/** Miniatura com o botão de trocar (usada nos personagens, na lojinha e nas histórias). */
function ImagemDoItem({ caminho }: { caminho: string }) {
  const [abrir, setAbrir] = useState(false);
  useVersaoEdicoes();
  const c = caminho.includes('.') ? caminho : `${caminho}.webp`;
  return (
    <span className="adm-img-item">
      {/\.glb$/i.test(c) ? <Icone nome="cubo" /> : <img src={asset(c)} alt="" loading="lazy" />}
      <button className="adm-link" onClick={() => setAbrir(!abrir)} data-testid="trocar-imagem-item">{c.split('/').pop()} · trocar</button>
      {abrir ? <TrocarImagem caminho={c} aoFechar={() => setAbrir(false)} /> : null}
    </span>
  );
}

/* ================================================================== PERSONAGENS, LOJINHA, SELOS */
export function AbaPersonagens() {
  useVersaoEdicoes();
  const [parte, setParte] = useState<'personagens' | 'lojinha' | 'surpresas' | 'selos'>('personagens');
  return (
    <section className="adm-cartao" data-testid="aba-personagens">
      <div className="adm-cab"><h1>Personagens e prêmios</h1></div>
      <div className="adm-linha">
        {([['personagens', 'Personagens'], ['lojinha', 'Peças da Lojinha'], ['surpresas', 'Prêmios surpresa'], ['selos', 'Selos e conquistas']] as const).map(([id, r]) => (
          <button key={id} className="adm-aba" aria-current={parte === id ? 'page' : undefined} onClick={() => setParte(id)} data-parte={id}>{r}</button>
        ))}
      </div>
      {parte === 'personagens' ? PERSONAGENS.map((p) => (
        <fieldset key={p.id} className="adm-grupo" data-personagem={p.id}>
          <legend>{p.nome}</legend>
          <div className="adm-grade">
            <CampoEditavel alvo={{ colecao: 'personagens', item: p.id, caminho: ['nome'] }} rotulo="Nome" />
            <CampoEditavel alvo={{ colecao: 'personagens', item: p.id, caminho: ['cor'] }} rotulo="Cor" tipo="cor" />
          </div>
          <CampoEditavel alvo={{ colecao: 'personagens', item: p.id, caminho: ['papel'] }} rotulo="Quem é (para o adulto)" multilinha />
          {p.apresentacao ? <CampoEditavel alvo={p.apresentacao} rotulo="Como se apresenta (fala da chegada)" quem={p.id} multilinha /> : null}
          {p.imagens.length ? <div className="adm-linha">{p.imagens.map((c) => <ImagemDoItem key={c} caminho={c} />)}</div> : <p className="adm-nota">Ainda sem figura própria.</p>}
        </fieldset>
      )) : null}
      {parte === 'personagens' ? <p className="adm-nota">O nome muda nos rótulos das telas. As falas que dizem o nome ("Eu sou a Sofia") são texto das falas: mude em Textos e falas (e regrave o áudio).</p> : null}
      {parte === 'lojinha' ? ITENS_LOJA.map((i) => (
        <fieldset key={i.id} className="adm-grupo" data-item-loja={i.id}>
          <legend>{i.nome}</legend>
          <div className="adm-grade">
            <CampoEditavel alvo={{ colecao: 'lojinha', item: i.id, caminho: ['nome'] }} rotulo="Nome" />
            <CampoEditavel alvo={{ colecao: 'lojinha', item: i.id, caminho: ['preco'] }} rotulo="Preço (moedinhas)" tipo="numero" testid="campo-preco" />
          </div>
          <CampoEditavel alvo={{ colecao: 'lojinha', item: i.id, caminho: ['fala'] }} rotulo={'"Por que guardar?"'} />
          <ImagemDoItem caminho={i.imagem} />
        </fieldset>
      )) : null}
      {parte === 'surpresas' ? SURPRESAS.map((s) => (
        <fieldset key={s.id} className="adm-grupo">
          <legend>Nível {s.nivel}: {s.nome}</legend>
          <div className="adm-grade">
            <CampoEditavel alvo={{ colecao: 'surpresas', item: s.id, caminho: ['nome'] }} rotulo="Nome" />
            <CampoEditavel alvo={{ colecao: 'surpresas', item: s.id, caminho: ['nivel'] }} rotulo="Nível em que chega" tipo="numero" />
          </div>
          {s.imagem ? <ImagemDoItem caminho={s.imagem} /> : null}
        </fieldset>
      )) : null}
      {parte === 'selos' ? (
        <Paginas itens={CONQUISTAS} por={20} render={(c) => (
          <fieldset key={c.id} className="adm-grupo">
            <legend>{c.motivo} {c.nome} <small>({c.id})</small></legend>
            <div className="adm-grade">
              <CampoEditavel alvo={{ colecao: 'conquistas', item: c.id, caminho: ['nome'] }} rotulo="Nome" />
              <CampoEditavel alvo={{ colecao: 'conquistas', item: c.id, caminho: ['motivo'] }} rotulo="Desenho do selo (emoji ou letra)" />
            </div>
            <CampoEditavel alvo={{ colecao: 'conquistas', item: c.id, caminho: ['dica'] }} rotulo="Dica do cadeado (a habilidade)" />
          </fieldset>
        )} />
      ) : null}
      {parte === 'selos' ? <p className="adm-nota">As imagens dos troféus e baús (360°) ficam na aba Imagens, pasta <b>recompensas</b> e <b>modelos3d</b>.</p> : null}
    </section>
  );
}

/* ================================================================== LEITURA: HISTÓRIAS, TEXTOS, FICHAS */
export function AbaLeitura() {
  useVersaoEdicoes();
  const [parte, setParte] = useState<'historias' | 'textos' | 'fichas'>('textos');
  return (
    <section className="adm-cartao" data-testid="aba-leitura">
      <div className="adm-cab"><h1>Histórias, textos e fichas</h1></div>
      <div className="adm-linha">
        {([['textos', 'Textos para ler sozinho'], ['historias', 'Histórias (ouvir)'], ['fichas', 'Fichas de leitura']] as const).map(([id, r]) => (
          <button key={id} className="adm-aba" aria-current={parte === id ? 'page' : undefined} onClick={() => setParte(id)} data-parte={id}>{r}</button>
        ))}
      </div>
      {parte === 'textos' ? (
        <>
          <p className="adm-nota">A criança LÊ sozinha: cada frase passa pelo verificador na lição do texto (pelo menos 95% das palavras ela já lê).</p>
          {TEXTOS_DECODIFICAVEIS.map((t) => (
            <fieldset key={t.id} className="adm-grupo" data-texto={t.id}>
              <legend>{t.titulo} <small>(lê até {t.ate})</small></legend>
              <CampoEditavel alvo={{ colecao: 'textos', item: t.id, caminho: ['titulo'] }} rotulo="Título (também é lido)" />
              {t.linhas.map((_, i) => <CampoEditavel key={i} alvo={{ colecao: 'textos', item: t.id, caminho: ['linhas', i, 'texto'] }} rotulo={`Frase ${i + 1}`} testid="campo-frase" />)}
              {t.perguntas.map((p, i) => <CampoEditavel key={`p${i}`} alvo={{ colecao: 'textos', item: t.id, caminho: ['perguntas', i, 'pergunta', 'texto'] }} rotulo={`Pergunta ${i + 1}`} quem={p.pergunta.quem} />)}
            </fieldset>
          ))}
        </>
      ) : null}
      {parte === 'historias' ? HISTORIAS.map((h) => (
        <fieldset key={h.id} className="adm-grupo">
          <legend>{h.titulo}</legend>
          <CampoEditavel alvo={{ colecao: 'historias', item: h.id, caminho: ['titulo'] }} rotulo="Título" />
          <ImagemDoItem caminho={h.capa} />
          {h.paginas.map((p, i) => (
            <div key={i} className="adm-pagina">
              <ImagemDoItem caminho={p.imagem} />
              <CampoEditavel alvo={{ colecao: 'historias', item: h.id, caminho: ['paginas', i, 'texto', 'texto'] }} rotulo={`Página ${i + 1}`} quem={p.texto.quem} multilinha />
            </div>
          ))}
          {h.perguntas.map((p, i) => <CampoEditavel key={`q${i}`} alvo={{ colecao: 'historias', item: h.id, caminho: ['perguntas', i, 'pergunta', 'texto'] }} rotulo={`Pergunta (${p.momento})`} quem={p.pergunta.quem} />)}
          {h.vocabulario.map((p, i) => <CampoEditavel key={`v${i}`} alvo={{ colecao: 'historias', item: h.id, caminho: ['vocabulario', i, 'explica', 'texto'] }} rotulo={`Vocabulário: ${p.palavra}`} quem={p.explica.quem} multilinha />)}
        </fieldset>
      )) : null}
      {parte === 'fichas' ? (
        <>
          <p className="adm-nota">Cada palavra precisa estar no banco (com a pronúncia anotada) e ter figura. A ficha só mostra escrita a palavra que a criança já lê.</p>
          {CAMPOS_SEMANTICOS.map((c) => (
            <fieldset key={c.id} className="adm-grupo">
              <legend>{c.titulo}</legend>
              <CampoEditavel alvo={{ colecao: 'fichas', item: c.id, caminho: ['titulo'] }} rotulo="Título" />
              <CampoEditavel alvo={{ colecao: 'fichas', item: c.id, caminho: ['palavras'] }} tipo="lista" rotulo="Palavras (separadas por vírgula)" multilinha />
            </fieldset>
          ))}
        </>
      ) : null}
    </section>
  );
}

/* ================================================================== CONFIGURAÇÕES (recursos e textos de tela) */
export function ConfigConteudo() {
  useVersaoEdicoes();
  return (
    <>
      <fieldset className="adm-grupo" data-testid="recursos">
        <legend>Recursos ligados para todos</legend>
        <p className="adm-nota">Desligar só esconde o botão: nada é apagado (regra 7). Vale neste aparelho; para todos, depois do pacote.</p>
        {(Object.keys(RECURSOS) as (keyof Recursos)[]).map((k) => <CampoEditavel key={k} alvo={{ colecao: 'recursos', item: k, caminho: [] }} rotulo={ROTULO_RECURSO[k]} tipo="booleano" />)}
      </fieldset>
      <fieldset className="adm-grupo" data-testid="textos-tela">
        <legend>Textos da entrada</legend>
        {Object.keys(TEXTOS_TELA).map((k) => <CampoEditavel key={k} alvo={{ colecao: 'textos-tela', item: k, caminho: [] }} rotulo={ONDE_TEXTO_TELA[k] ?? k} />)}
      </fieldset>
    </>
  );
}

/* ================================================================== HISTÓRICO */
const resumo = (v: unknown) => { const s = typeof v === 'string' ? v : JSON.stringify(v); return s && s.length > 90 ? `${s.slice(0, 90)}…` : s; };
export function AbaHistorico() {
  useVersaoEdicoes();
  const lista = [...edicoes.edicoes()].sort((a, b) => b.em - a.em);
  const midias = edicoes.midias();
  const semLugar = edicoes.ultimo.semLugar;
  return (
    <section className="adm-cartao" data-testid="aba-historico">
      <div className="adm-cab"><h1>Histórico de edições</h1><span className="adm-nota">{lista.length} edições e {midias.length} figuras trocadas neste aparelho</span></div>
      {semLugar.length ? <div className="adm-aviso" role="alert"><b>Edições sem efeito</b> (o conteúdo do repositório mudou e o lugar não existe mais): <ul>{semLugar.map((s, i) => <li key={i}>{s.edicao.colecao} › {s.edicao.item}: {s.motivo}</li>)}</ul></div> : null}
      {!lista.length && !midias.length ? <p className="adm-nota">Nada editado neste aparelho ainda.</p> : null}
      <ul className="adm-audios" data-testid="lista-historico">
        {lista.map((e) => (
          <li key={e.chave} className="adm-audio trocado" data-testid="edicao" data-chave={e.chave}>
            <div className="adm-audio-cab">
              <span className="adm-etq cinza">{CONTEUDO_EDITAVEL.colecao(e.colecao)?.rotulo ?? e.colecao}</span>
              <b>{e.item}</b>{e.caminho?.length ? <span className="adm-nota">› {e.caminho.join(' › ')}</span> : null}
              <span className="adm-etq ipe">{e.tipo === 'novo' ? 'item novo' : e.tipo === 'ordem-cenas' ? 'ordem das cenas' : e.tipo === 'desligar-cenas' ? 'cenas desligadas' : 'mudou'}</span>
            </div>
            <p className="adm-nota">{dataCurta(e.em)}{e.quem ? ` · ${e.quem}` : ''}{e.nota ? ` · ${e.nota}` : ''}{e.anteriores?.length ? ` · ${e.anteriores.length} mudança(s) antes` : ''}</p>
            {e.tipo !== 'novo' ? <p className="adm-texto">{resumo(e.valor)}</p> : null}
            <div className="adm-linha">
              {e.colecao === 'fases' ? <button className="btn adm-btn" onClick={() => navegar(`admin/missoes/${e.item}`)}><Icone nome="olho" />Abrir a missão</button> : null}
              <button className="btn adm-btn" onClick={() => void edicoes.desfazer(e.chave)} data-testid="desfazer-historico"><Icone nome="seta-esq" />Desfazer</button>
              <button className="btn adm-btn terra" onClick={() => void edicoes.voltarAoOriginal(e.chave)} data-testid="original-historico"><Icone nome="lixeira" />Voltar ao original</button>
            </div>
          </li>
        ))}
        {midias.map((m) => (
          <li key={m.caminho} className="adm-audio trocado" data-testid="midia-trocada">
            <div className="adm-audio-cab"><span className="adm-etq cinza">Imagem</span><b>{m.caminho}</b></div>
            <p className="adm-nota">{dataCurta(m.em)}{m.quem ? ` · ${m.quem}` : ''} · arquivo {m.nome}</p>
            <div className="adm-linha"><button className="btn adm-btn terra" onClick={() => void edicoes.removerMidia(m.caminho)} data-testid="original-midia"><Icone nome="lixeira" />Voltar ao original</button></div>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ================================================================== FOTO → 3D (espaço da ferramenta do agente do avatar) */
/**
 * Rota #/admin/foto3d. A ferramenta "Transformar foto em 3D" (fila do dono nº 19) é feita em outra frente. COMBINADO:
 * ela exporta `FerramentaFoto3D` (componente React, sem props) do arquivo `telas/admin/foto3d/FerramentaFoto3D.tsx`;
 * quando o arquivo existir, este quadro a carrega sozinho (import.meta.glob: sem o arquivo, nada quebra). O resultado
 * (.glb) entra pela troca de modelo (`TrocarImagem`, caminho em assets/modelos3d/) e vai no pacote como as outras mídias.
 */
const FERRAMENTA = import.meta.glob<{ FerramentaFoto3D: ComponentType }>('./foto3d/FerramentaFoto3D.tsx');
const carregarFerramenta = Object.values(FERRAMENTA)[0];
const Ferramenta = carregarFerramenta ? lazy(() => carregarFerramenta().then((m) => ({ default: m.FerramentaFoto3D }))) : null;

export function AbaFoto3D() {
  return (
    <section className="adm-cartao" data-testid="aba-foto3d">
      <div className="adm-cab"><h1>Transformar foto em 3D</h1></div>
      {Ferramenta ? <Suspense fallback={<p className="adm-nota">Carregando a ferramenta…</p>}><Ferramenta /></Suspense> : (
        <>
          <p>A ferramenta que transforma uma foto num modelo 3D está sendo feita em outra frente (fila do dono nº 19, sem servidor). Ela vai aparecer aqui.</p>
          <p className="adm-nota">Enquanto isso: se você já tem um modelo <b>.glb</b>, troque um personagem ou objeto em <button className="adm-link" onClick={() => navegar('admin/imagens')}>Imagens</button> (pasta modelos3d). O modelo novo vai no pacote do Publicar, como as figuras.</p>
        </>
      )}
    </section>
  );
}
