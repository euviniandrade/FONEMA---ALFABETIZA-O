/**
 * "TRANSFORMAR FOTO EM 3D" (fila do dono nº 19), aba Foto → 3D da Área do administrador (combinado com o gerenciador:
 * este arquivo exporta `FerramentaFoto3D`; Gerenciador.tsx › AbaFoto3D carrega sozinho).
 *
 * 1. Foto: só de OBJETO, figura ou personagem desenhado. Foto de pessoa (e de criança, nunca) está bloqueada: aviso de
 *    LGPD, confirmação obrigatória do adulto e, quando o navegador sabe achar rostos (FaceDetector), foto com rosto
 *    não segue.
 * 2. Recorte: o fundo sai aqui no navegador (relevo.ts › recortarFundo); a sensibilidade ajusta.
 * 3. 3D: "relevo inflado" feito na hora, grátis e sem servidor (relevo.ts › montarRelevo), girando para aprovar.
 * 4. Colocar na plataforma: troca um prêmio 360° (troféu, baú, porquinho) ou guarda um modelo novo em
 *    assets/modelos3d/itens/. Fica valendo NESTE aparelho na hora (edicoes) e vai no pacote do Publicar
 *    (scripts/importar-pacote.ts aplica no repositório). Também baixa o .glb.
 * 5. "3D completo" (verso de verdade): gera um PEDIDO (.zip) para app/scripts/foto-para-3d.ts, que usa um serviço
 *    gratuito na internet e devolve um pacote para importar. Passo a passo: app/docs/como-transformar-foto-em-3d.md.
 */
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Icone } from '../../../componentes/ui.tsx';
import { edicoes } from '../../../servicos/edicoes.ts';
import { montarZip } from '../../../servicos/pacote-audios.ts';
import { baixar } from '../dados-admin.ts';
import { quemEdita } from '../edicao-comum.tsx';
import { caixaDaMascara, escreverGLB, montarRelevo, recortarFundo, slugItem, type Malha, type Mascara } from './relevo.ts';

const LADO_MAX = 768;

/** Para onde o modelo vai. Os prêmios 360° já existem: o modelo novo entra no lugar (o original volta com um toque). */
const DESTINOS = [
  { id: 'novo', rotulo: 'Modelo novo (guardar em modelos3d/itens/)', caminho: (s: string) => `modelos3d/itens/${s}` },
  { id: 'trofeu', rotulo: 'Prêmio 360°: no lugar do troféu', caminho: () => 'modelos3d/trofeu' },
  { id: 'bau', rotulo: 'Prêmio 360°: no lugar do baú de livros', caminho: () => 'modelos3d/bau' },
  { id: 'porquinho', rotulo: 'No lugar do cofrinho de porquinho', caminho: () => 'modelos3d/porquinho' }
] as const;
type Destino = (typeof DESTINOS)[number]['id'];

interface Foto { url: string; img: ImageBitmap; w: number; h: number; rgba: Uint8ClampedArray; nome: string }

async function abrirFoto(f: File): Promise<Foto> {
  const bmp = await createImageBitmap(f);
  const k = Math.min(1, LADO_MAX / Math.max(bmp.width, bmp.height));
  const w = Math.max(1, Math.round(bmp.width * k)), h = Math.max(1, Math.round(bmp.height * k));
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const g = c.getContext('2d', { willReadFrequently: true })!;
  g.drawImage(bmp, 0, 0, w, h);
  return { url: URL.createObjectURL(f), img: bmp, w, h, rgba: g.getImageData(0, 0, w, h).data, nome: f.name };
}

/** O navegador acha rosto de pessoa? `null` = este navegador não sabe procurar. */
async function temRosto(bmp: ImageBitmap): Promise<boolean | null> {
  const FD = (window as unknown as { FaceDetector?: new (o?: object) => { detect(i: ImageBitmapSource): Promise<unknown[]> } }).FaceDetector;
  if (!FD) return null;
  try { return (await new FD({ fastMode: true }).detect(bmp)).length > 0; } catch { return null; }
}

/** Textura: a foto recortada na caixa do objeto; o fundo vira a cor da borda do objeto (sem halo claro no contorno). */
function texturaDoObjeto(foto: Foto, m: Mascara, alfa: boolean): HTMLCanvasElement {
  const cx = caixaDaMascara(m)!;
  const k = Math.min(1, 1024 / Math.max(cx.w, cx.h));
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.round(cx.w * k)); c.height = Math.max(1, Math.round(cx.h * k));
  const g = c.getContext('2d')!;
  // borda "sangrada": espalha a cor do objeto para fora dele, várias vezes, antes de desenhar por cima
  const recorte = document.createElement('canvas');
  recorte.width = foto.w; recorte.height = foto.h;
  const gr = recorte.getContext('2d')!;
  const dados = new ImageData(new Uint8ClampedArray(foto.rgba), foto.w, foto.h);
  for (let i = 0; i < m.px.length; i++) dados.data[i * 4 + 3] = m.px[i] ? 255 : 0;
  gr.putImageData(dados, 0, 0);
  const desenhar = (dx: number, dy: number) => g.drawImage(recorte, cx.x, cx.y, cx.w, cx.h, dx, dy, c.width, c.height);
  if (!alfa) for (const r of [6, 4, 2]) for (const [dx, dy] of [[r, 0], [-r, 0], [0, r], [0, -r], [r, r], [-r, -r], [r, -r], [-r, r]]) desenhar(dx, dy);
  desenhar(0, 0);
  return c;
}

const blobDe = (c: HTMLCanvasElement, tipo: string, q?: number) => new Promise<Blob>((ok, erro) => c.toBlob((b) => (b ? ok(b) : erro(new Error('Este navegador não gerou a imagem.'))), tipo, q));
const bytes = async (b: Blob) => new Uint8Array(await b.arrayBuffer());

/** Palco que gira o relevo para aprovar (arrastar gira). */
function Previa({ malha, textura, aoFoto }: { malha: Malha; textura: HTMLCanvasElement; aoFoto: (f: () => Promise<Blob>) => void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const r = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true });
    r.outputColorSpace = THREE.SRGBColorSpace;
    r.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    r.setSize(canvas.clientWidth || 360, canvas.clientHeight || 360, false);
    const cena = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(30, (canvas.clientWidth || 360) / (canvas.clientHeight || 360), 0.1, 20);
    cam.position.set(0, 0.55, 2.4); cam.lookAt(0, 0.5, 0);
    cena.add(new THREE.HemisphereLight(0xffffff, 0xb9a88f, 1.6));
    const sol = new THREE.DirectionalLight(0xffffff, 1.6); sol.position.set(1, 2, 2); cena.add(sol);
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(malha.pos, 3));
    g.setAttribute('normal', new THREE.BufferAttribute(malha.nor, 3));
    g.setAttribute('uv', new THREE.BufferAttribute(malha.uv, 2));
    g.setIndex(new THREE.BufferAttribute(malha.idx, 1));
    const tex = new THREE.CanvasTexture(textura);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.flipY = false;
    const obj = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ map: tex, roughness: 0.75 }));
    const largura = Math.max(...Array.from({ length: malha.pos.length / 3 }, (_, i) => Math.abs(malha.pos[i * 3])));
    const esc = Math.min(1, 0.55 / Math.max(0.01, largura));
    obj.scale.setScalar(esc);
    obj.position.y = 0.5 - 0.5 * esc;
    cena.add(obj);
    let giro = 0.5, vel = 0.01, arrasto: number | null = null, q = 0, vivo = true;
    const passo = () => { if (!vivo) return; if (arrasto === null) giro += vel; obj.rotation.y = giro; r.render(cena, cam); q = requestAnimationFrame(passo); };
    passo();
    const desce = (e: PointerEvent) => { arrasto = e.clientX; vel = 0; canvas.setPointerCapture?.(e.pointerId); };
    const move = (e: PointerEvent) => { if (arrasto === null) return; giro += (e.clientX - arrasto) * 0.012; arrasto = e.clientX; };
    const sobe = () => { arrasto = null; vel = 0.006; };
    canvas.addEventListener('pointerdown', desce); canvas.addEventListener('pointermove', move); canvas.addEventListener('pointerup', sobe);
    // imagem de frente (vai junto do modelo, como as .webp dos outros prêmios)
    aoFoto(async () => { obj.rotation.y = 0.35; r.render(cena, cam); return blobDe(canvas, 'image/webp', 0.9); });
    return () => {
      vivo = false; cancelAnimationFrame(q);
      canvas.removeEventListener('pointerdown', desce); canvas.removeEventListener('pointermove', move); canvas.removeEventListener('pointerup', sobe);
      g.dispose(); tex.dispose(); (obj.material as THREE.Material).dispose(); r.dispose();
    };
  }, [malha, textura, aoFoto]);
  return <canvas ref={ref} className="foto3d-palco" style={{ width: 360, height: 360, maxWidth: '100%', touchAction: 'none', background: 'radial-gradient(#fff, #e6eef8)', borderRadius: 16 }} data-testid="foto3d-previa" aria-label="Modelo 3D girando. Arraste para girar." />;
}

export function FerramentaFoto3D() {
  const [confirmo, setConfirmo] = useState(false);
  const [foto, setFoto] = useState<Foto | null>(null);
  const [rosto, setRosto] = useState<boolean | null>(null);
  const [sens, setSens] = useState(40);
  const [espessura, setEspessura] = useState(0.12);
  const [nome, setNome] = useState('');
  const [destino, setDestino] = useState<Destino>('novo');
  const [aviso, setAviso] = useState('');
  const [erro, setErro] = useState('');
  const fotoDeFrente = useRef<(() => Promise<Blob>) | null>(null);

  const mascara = useState<Mascara | null>(null);
  const [masc, setMasc] = mascara;
  const [relevo, setRelevo] = useState<{ malha: Malha; textura: HTMLCanvasElement } | null>(null);
  const alfa = !!foto && Array.from({ length: Math.min(4000, foto.w * foto.h) }, (_, i) => foto.rgba[Math.floor(i * foto.w * foto.h / Math.min(4000, foto.w * foto.h)) * 4 + 3]).some((a) => a < 128);

  useEffect(() => {
    if (!foto || rosto) { setMasc(null); setRelevo(null); return; }
    try {
      const m = recortarFundo(foto.rgba, foto.w, foto.h, sens);
      const cx = caixaDaMascara(m);
      if (!cx || cx.w * cx.h < 400) { setMasc(null); setRelevo(null); setErro('Não achei um objeto separado do fundo. Tente uma foto com fundo liso, ou mude a sensibilidade.'); return; }
      setErro('');
      setMasc(m);
      setRelevo({ malha: montarRelevo(m, { espessura }), textura: texturaDoObjeto(foto, m, alfa) });
    } catch (e) { setErro(e instanceof Error ? e.message : 'Não deu para montar o 3D.'); }
  }, [foto, sens, espessura, rosto, alfa, setMasc]);

  const escolher = async (f?: File) => {
    setAviso(''); setErro('');
    if (!f) return;
    if (!/^image\//.test(f.type)) { setErro('Escolha uma imagem (png, jpg, webp).'); return; }
    if (f.size > 15_000_000) { setErro('Imagem grande demais (máximo 15 MB).'); return; }
    try {
      const nova = await abrirFoto(f);
      const achou = await temRosto(nova.img);
      setRosto(achou);
      setFoto(nova);
      if (!nome) setNome(f.name.replace(/\.[a-z0-9]+$/i, '').replace(/[-_]+/g, ' ').slice(0, 40));
    } catch { setErro('Não deu para abrir esta imagem.'); }
  };

  const glb = async (): Promise<Uint8Array> => {
    if (!relevo) throw new Error('Monte o 3D primeiro.');
    const jpg = await bytes(await blobDe(relevo.textura, 'image/jpeg', 0.88));
    // os modelos do projeto olham para +X (o palco dos prêmios gira para a câmera): o relevo é girado igual
    return escreverGLB(relevo.malha, jpg, 'image/jpeg', slugItem(nome), true);
  };

  const colocar = async () => {
    setErro(''); setAviso('');
    try {
      const slug = slugItem(nome);
      const base = DESTINOS.find((d) => d.id === destino)!.caminho(slug);
      const modelo = await glb();
      const frente = fotoDeFrente.current ? await fotoDeFrente.current() : null;
      const agora = Date.now();
      await edicoes.salvarMidia({ caminho: `${base}.glb`, blob: new Blob([modelo as BlobPart], { type: 'model/gltf-binary' }), nome: `${slug}.glb`, em: agora, quem: quemEdita() });
      if (frente) await edicoes.salvarMidia({ caminho: `${base}.webp`, blob: frente, nome: `${slug}.webp`, em: agora, quem: quemEdita() });
      setAviso(destino === 'novo'
        ? `Guardado como assets/${base}.glb. Ele vai no pacote do Publicar; para virar item da Lojinha ou objeto do passeio, veja o passo a passo (como-transformar-foto-em-3d.md).`
        : `Pronto: o novo modelo já aparece no lugar de "${DESTINOS.find((d) => d.id === destino)!.rotulo}" neste aparelho. Para todos, gere o pacote em Publicar. Para voltar ao original: aba Imagens › modelos3d.`);
    } catch (e) { setErro(e instanceof Error ? e.message : 'Não deu para guardar.'); }
  };

  const baixarModelo = async () => { try { baixar(new Blob([(await glb()) as BlobPart], { type: 'model/gltf-binary' }), `${slugItem(nome)}.glb`); } catch (e) { setErro(e instanceof Error ? e.message : 'Não deu.'); } };

  /** Pedido para o "3D completo" (serviço gratuito na internet), feito pelo script app/scripts/foto-para-3d.ts. */
  const pedido = async () => {
    if (!foto || !masc || !relevo) return;
    try {
      const recorte = texturaDoObjeto(foto, masc, true);
      const slug = slugItem(nome);
      const zip = montarZip([
        { nome: 'pedido.json', dados: new TextEncoder().encode(JSON.stringify({ formato: 'fonema-pedido-foto-3d', versao: 1, nome, slug, destino, caminho: DESTINOS.find((d) => d.id === destino)!.caminho(slug), confirmouQueNaoEhPessoa: true, criadoEm: new Date().toISOString(), quem: quemEdita() }, null, 1)) },
        { nome: 'foto-recortada.png', dados: await bytes(await blobDe(recorte, 'image/png')) },
        { nome: 'relevo.glb', dados: await glb() }
      ]);
      baixar(new Blob([zip as BlobPart], { type: 'application/zip' }), `fonema-pedido-3d-${slug}.zip`);
      setAviso('Pedido baixado. Envie este .zip para quem cuida do repositório: ele roda app/scripts/foto-para-3d.ts e devolve um pacote para importar.');
    } catch (e) { setErro(e instanceof Error ? e.message : 'Não deu para gerar o pedido.'); }
  };

  return (
    <div className="foto3d" data-testid="ferramenta-foto3d">
      <div className="adm-aviso" role="note">
        <b>Só foto de OBJETO, brinquedo, figura ou personagem desenhado.</b> Nunca foto de pessoa, e muito menos de criança
        (LGPD, art. 14; regra do projeto: avatar sem foto de criança). A foto não sai deste aparelho, a não ser no pedido que você mesmo baixar.
      </div>
      <label className="adm-check" style={{ marginTop: 10 }}>
        <input type="checkbox" checked={confirmo} onChange={(e) => setConfirmo(e.target.checked)} data-testid="foto3d-confirmo" />
        Sou o adulto responsável e confirmo que a foto <b>não é de uma pessoa</b>.
      </label>
      <div className="adm-linha">
        <label className={`btn adm-btn pri${confirmo ? '' : ' desligado'}`} aria-disabled={!confirmo}>
          <Icone nome="baixar" />Escolher foto
          <input type="file" accept="image/*" className="sr" disabled={!confirmo} onChange={(e) => { void escolher(e.target.files?.[0]); e.target.value = ''; }} data-testid="foto3d-arquivo" />
        </label>
        {!confirmo ? <span className="adm-nota">Marque a confirmação para escolher a foto.</span> : null}
      </div>
      {rosto ? <p className="adm-erro" role="alert" data-testid="foto3d-rosto">Esta foto parece ter o rosto de uma pessoa. Ela não pode ser usada. Escolha a foto de um objeto ou de um desenho.</p> : null}
      {foto && !rosto ? (
        <>
          <div className="adm-antes-depois" style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-start' }}>
            <figure><img src={foto.url} alt="" style={{ maxWidth: 240, maxHeight: 240 }} /><figcaption>Foto</figcaption></figure>
            {relevo ? <figure><img src={relevo.textura.toDataURL()} alt="" style={{ maxWidth: 240, maxHeight: 240, background: 'repeating-conic-gradient(#eee 0 25%, #fff 0 50%) 0 0/16px 16px' }} data-testid="foto3d-recorte" /><figcaption>Recorte</figcaption></figure> : null}
            {relevo ? <figure><Previa malha={relevo.malha} textura={relevo.textura} aoFoto={(f) => { fotoDeFrente.current = f; }} /><figcaption>3D (arraste para girar)</figcaption></figure> : null}
          </div>
          <div className="adm-filtros">
            {!alfa ? <label className="adm-campo">Fundo: sensibilidade <input type="range" min={8} max={120} value={sens} onChange={(e) => setSens(+e.target.value)} data-testid="foto3d-sensibilidade" /></label> : <span className="adm-nota">A foto já tem fundo transparente: usei o recorte dela.</span>}
            <label className="adm-campo">Espessura <input type="range" min={4} max={30} value={Math.round(espessura * 100)} onChange={(e) => setEspessura(+e.target.value / 100)} /></label>
            <label className="adm-campo largo">Nome do objeto <input value={nome} onChange={(e) => setNome(e.target.value)} maxLength={40} data-testid="foto3d-nome" /></label>
            <label className="adm-campo largo">Colocar onde <select value={destino} onChange={(e) => setDestino(e.target.value as Destino)} data-testid="foto3d-destino">{DESTINOS.map((d) => <option key={d.id} value={d.id}>{d.rotulo}</option>)}</select></label>
          </div>
          <div className="adm-linha">
            <button className="btn adm-btn verde" disabled={!relevo || !nome.trim()} onClick={() => void colocar()} data-testid="foto3d-colocar"><Icone nome="check" />Aprovar e colocar na plataforma</button>
            <button className="btn adm-btn" disabled={!relevo} onClick={() => void baixarModelo()} data-testid="foto3d-baixar"><Icone nome="baixar" />Baixar o .glb</button>
            <button className="btn adm-btn" disabled={!relevo} onClick={() => void pedido()} data-testid="foto3d-pedido"><Icone nome="cubo" />Pedir o 3D completo</button>
          </div>
          <p className="adm-nota">
            O 3D feito aqui é um <b>relevo</b>: a silhueta da foto "inflada", com a foto na frente e no verso. É grátis, fica pronto na hora e gira 360°,
            mas não inventa o verso de verdade. Para um modelo inteiro, use <b>Pedir o 3D completo</b> (usa um serviço gratuito na internet; passo a passo em
            app/docs/como-transformar-foto-em-3d.md).
          </p>
        </>
      ) : null}
      {aviso ? <p className="adm-aviso" role="status" data-testid="foto3d-aviso">{aviso}</p> : null}
      {erro ? <p className="adm-erro" role="alert" data-testid="foto3d-erro">{erro}</p> : null}
    </div>
  );
}
