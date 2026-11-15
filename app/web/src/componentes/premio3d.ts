/**
 * Giro 360° dos prêmios (D029): cada prêmio é um OBJETO com espessura — frente, borda metálica e verso.
 *
 * Um único renderizador WebGL (three.js) é compartilhado por todas as peças: cada peça é desenhada
 * fora da tela e copiada para o seu canvas 2D. Assim cabem várias peças girando sem estourar o limite
 * de contextos WebGL, e o laço de animação só roda enquanto alguma peça está se mexendo.
 *
 * Este módulo é carregado sob demanda (import dinâmico): o Álbum com dezenas de selos parados não paga three.js.
 */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { lerGLB } from './glb-comum.ts';

export interface Peca {
  frente: HTMLCanvasElement | HTMLImageElement;
  /** Já espelhado na horizontal (a silhueta casa com a da frente quando a peça vira). */
  verso: HTMLCanvasElement | HTMLImageElement;
  /** Contorno externo em coordenadas 0–1 da imagem (x para a direita, y para baixo). */
  contorno: number[][];
  /** largura / altura da imagem */
  proporcao: number;
  /** Espessura em relação à altura (0–1). */
  espessura: number;
  /** Cor do metal da borda. */
  borda: number;
}

/** entrada: vem girando e assenta · auto: giro lento contínuo · parado: de frente (arrastar gira) · balanco: vai e vem, sem mostrar o verso */
export type Modo = 'entrada' | 'auto' | 'parado' | 'balanco';
export interface OpcoesVista {
  modo: Modo;
  /** "Menos movimento": sem entrada nem giro automático; arrastar continua valendo. */
  calmo?: boolean;
  /** Ângulo fixo em graus (capturas/depuração): desliga a física. */
  angulo?: number;
  aoAssentar?: () => void;
}
export interface Vista { destruir(): void; angulo(graus: number): void; /** Pulinho (a moedinha entrou no porquinho). */ pular(): void }

/** Modelo 3D de verdade (GLB): gira 360° com luz de estúdio e sombra de contato. */
export interface PecaModelo {
  /** Endereço do .glb (comprimido: meshopt + WebP). */
  url: string;
  /** Giro (graus) que põe o modelo na pose de descanso: de frente para a câmera, levemente de lado. */
  frente?: number;
  /** Sem a sombra de contato (para tirar a imagem recortada do modelo). */
  semSombra?: boolean;
  /** Inclinação da câmera sobre o modelo (radianos). Padrão 0,27 (prêmio visto um pouco de cima); personagem: quase de frente. */
  inclinar?: number;
  /**
   * Personagem sem esqueleto (Sofia, Tales, Bolota): "respira" — a escala sobe e desce de leve, devagar, como peito
   * enchendo. Desligado em "menos movimento".
   */
  respirar?: boolean;
  /** Aproximação (1 = cabe inteiro). Maior que 1 enquadra mais de perto, cortando embaixo (ex.: do joelho para cima). */
  zoom?: number;
  /** Altura do ponto de foco quando há zoom (0 = centro do modelo, 1 = topo). */
  foco?: number;
}
interface Conteudo { objeto: THREE.Object3D; descartar: () => void; inclinar: number; sombra?: { y: number; raio: number }; respirar?: boolean }

const DIST = 5.46; // a peça (altura 2) ocupa 86% da altura do canvas: sobra margem para a perspectiva e o quique
const FOV = 24;

let renderer: THREE.WebGLRenderer | null = null;
let ambiente: THREE.Texture | null = null;
const vistas = new Set<VistaInterna>();
let quadro = 0;
let antes = 0;

function motor(): THREE.WebGLRenderer {
  if (renderer) return renderer;
  const r = new THREE.WebGLRenderer({ alpha: true, antialias: true, premultipliedAlpha: true, powerPreference: 'low-power' });
  r.setPixelRatio(1);
  r.setClearColor(0x000000, 0);
  r.outputColorSpace = THREE.SRGBColorSpace;
  r.toneMapping = THREE.NoToneMapping;
  const pm = new THREE.PMREMGenerator(r);
  ambiente = pm.fromScene(new RoomEnvironment(), 0.04).texture;
  pm.dispose();
  renderer = r;
  return r;
}

function textura(fonte: HTMLCanvasElement | HTMLImageElement, r: THREE.WebGLRenderer): THREE.Texture {
  const t = fonte instanceof HTMLCanvasElement ? new THREE.CanvasTexture(fonte) : new THREE.Texture(fonte);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = Math.min(8, r.capabilities.getMaxAnisotropy());
  t.generateMipmaps = true;
  t.minFilter = THREE.LinearMipmapLinearFilter;
  t.needsUpdate = true;
  return t;
}

function face(mapa: THREE.Texture): THREE.MeshStandardMaterial {
  // a arte já vem iluminada: fica quase toda como emissiva; o resto é reflexo do ambiente tingido pela cor
  // da arte (ouro reflete dourado, esmalte azul reflete pouco) + relevo pelo próprio desenho (bump)
  return new THREE.MeshStandardMaterial({
    map: mapa, emissiveMap: mapa, emissive: 0xffffff, emissiveIntensity: 0.74, color: 0xffffff,
    metalness: 0.72, roughness: 0.3, bumpMap: mapa, bumpScale: 1.6, envMapIntensity: 0.95,
    transparent: true, alphaTest: 0.02, depthWrite: false, side: THREE.FrontSide
  });
}

class VistaInterna implements Vista {
  cena = new THREE.Scene();
  camera: THREE.PerspectiveCamera;
  /** base: inclinação fixa e sombra · grupo: o que gira, cresce e pula */
  base = new THREE.Group();
  grupo = new THREE.Group();
  sombra: THREE.Mesh | null = null;
  pulo = -1;
  ctx: CanvasRenderingContext2D;
  ang = 0; vel = 0; escala = 1; sobe = 0;
  t0 = -1; pintou = false; fixo = false; assentou = false; sujo = true; morta = false;
  arrastando = false; ultimoX = 0; ultimoT = 0;
  respirar = false; fase0 = Math.random() * 10; objeto: THREE.Object3D | null = null; escalaObjeto = 1;
  descartar: Array<() => void> = [];

  constructor(public canvas: HTMLCanvasElement, conteudo: Conteudo, public op: OpcoesVista) {
    motor();
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('sem canvas 2D');
    this.ctx = ctx;
    this.camera = new THREE.PerspectiveCamera(FOV, canvas.width / canvas.height, 0.1, 50);
    this.camera.position.set(0, 0, DIST);
    this.cena.environment = ambiente;
    const chave = new THREE.DirectionalLight(0xfff4e0, 2.2); chave.position.set(-2.5, 3.5, 5); this.cena.add(chave);
    const contra = new THREE.DirectionalLight(0xbcd4ff, 1.1); contra.position.set(3.5, -1, 3); this.cena.add(contra);
    this.grupo.add(conteudo.objeto);
    this.base.add(this.grupo);
    this.base.rotation.x = conteudo.inclinar;
    if (conteudo.sombra) {
      // sombra de contato: mancha macia no "chão", que não gira com o modelo e encolhe quando ele pula
      const mat = new THREE.MeshBasicMaterial({ map: texturaSombra(), transparent: true, depthWrite: false, opacity: 0.6 });
      const geoS = new THREE.PlaneGeometry(conteudo.sombra.raio * 3, conteudo.sombra.raio * 3);
      this.sombra = new THREE.Mesh(geoS, mat);
      this.sombra.rotation.x = -Math.PI / 2;
      this.sombra.position.y = conteudo.sombra.y;
      this.sombra.renderOrder = -1;
      this.base.add(this.sombra);
      this.descartar.push(() => { geoS.dispose(); mat.dispose(); });
    }
    this.cena.add(this.base);
    this.descartar.push(conteudo.descartar);
    this.respirar = !!conteudo.respirar && !op.calmo && op.angulo === undefined;
    this.objeto = conteudo.objeto; this.escalaObjeto = conteudo.objeto.scale.x;

    if (op.angulo !== undefined) { this.fixo = true; this.ang = (op.angulo * Math.PI) / 180; this.assentou = true; }
    else if (op.calmo || op.modo === 'parado') { this.assentou = true; }
    else if (op.modo === 'entrada') { this.ang = -Math.PI * 5; this.escala = 0.2; }
    else { this.assentou = true; this.vel = VEL_AUTO; }

    const baixo = (e: PointerEvent) => {
      if (this.fixo) return;
      this.arrastando = true; this.ultimoX = e.clientX; this.ultimoT = performance.now(); this.vel = 0;
      if (!this.assentou) { this.assentou = true; this.escala = 1; this.sobe = 0; op.aoAssentar?.(); }
      try { canvas.setPointerCapture(e.pointerId); } catch { /* ponteiro sintético */ }
      acordar();
    };
    const move = (e: PointerEvent) => {
      if (!this.arrastando) return;
      const agora = performance.now();
      const d = ((e.clientX - this.ultimoX) / Math.max(120, canvas.clientWidth)) * Math.PI * 1.35;
      this.ang += d;
      if (op.modo === 'balanco') this.ang = Math.max(-1.2, Math.min(1.2, this.ang));
      const dt = Math.max(8, agora - this.ultimoT) / 1000;
      this.vel = this.vel * 0.5 + (d / dt) * 0.5;
      this.ultimoX = e.clientX; this.ultimoT = agora; this.sujo = true;
    };
    const solta = () => { if (this.arrastando) { this.arrastando = false; if (performance.now() - this.ultimoT > 120) this.vel = 0; acordar(); } };
    canvas.addEventListener('pointerdown', baixo);
    canvas.addEventListener('pointermove', move);
    canvas.addEventListener('pointerup', solta);
    canvas.addEventListener('pointercancel', solta);
    this.descartar.push(() => { canvas.removeEventListener('pointerdown', baixo); canvas.removeEventListener('pointermove', move); canvas.removeEventListener('pointerup', solta); canvas.removeEventListener('pointercancel', solta); });
  }

  /** Avança a física; devolve true enquanto ainda há movimento. */
  passo(agora: number, dt: number): boolean {
    const girando = this.fisica(agora, dt) || this.respirar;
    if (this.respirar) this.sujo = true;
    if (this.pulo < 0) return girando;
    this.pulo += dt / 0.55;
    if (this.pulo >= 1) this.pulo = -1;
    this.sujo = true;
    return true;
  }

  private fisica(agora: number, dt: number): boolean {
    if (this.fixo) return false;
    if (!this.assentou) {
      // o relógio da entrada só anda depois do primeiro quadro desenhado e em passos curtos: a compilação
      // dos shaders (lenta em aparelho fraco) não "come" o giro
      if (!this.pintou) { this.sujo = true; return true; }
      this.t0 = this.t0 < 0 ? 0 : this.t0 + dt * 1000;
      const p = Math.min(1, this.t0 / DUR_ENTRADA);
      const e = 1 - Math.pow(1 - p, 3.2);
      this.ang = -Math.PI * 5 * (1 - e);
      const s = Math.min(1, p / 0.62);
      this.escala = 0.2 + 0.8 * (1 + 2.2 * Math.pow(s - 1, 3) + 1.2 * Math.pow(s - 1, 2));
      this.sobe = -0.5 * Math.pow(1 - Math.min(1, p / 0.5), 2);
      this.sujo = true;
      if (p >= 1) { this.assentou = true; this.ang = 0; this.escala = 1; this.sobe = 0; this.vel = 0; this.op.aoAssentar?.(); }
      return true;
    }
    if (this.arrastando) return true;
    if (this.op.modo === 'balanco' && !this.op.calmo) {
      // vai e vem (a peça não tem verso desenhado): mola até o ângulo do balanço
      const alvoB = Math.sin(agora / 1150) * 0.62;
      this.vel += ((alvoB - this.ang) * 9 - this.vel * 4.5) * dt;
      this.ang += this.vel * dt; this.sujo = true;
      return true;
    }
    const auto = this.op.modo === 'auto' && !this.op.calmo;
    if (auto) {
      // inércia do arrasto se desfaz e o giro lento volta sozinho
      this.vel += (VEL_AUTO * Math.sign(this.vel || 1) - this.vel) * Math.min(1, dt * 1.6);
      this.ang += this.vel * dt; this.sujo = true;
      return true;
    }
    // inércia e depois volta suave para a frente (mola amortecida até o múltiplo de 360° mais próximo)
    const alvo = Math.round(this.ang / (Math.PI * 2)) * Math.PI * 2;
    const rapido = Math.abs(this.vel) > 2.4;
    const forca = rapido ? 0 : (alvo - this.ang) * 14;
    this.vel += (forca - this.vel * (rapido ? 1.5 : 5.2)) * dt;
    this.ang += this.vel * dt;
    if (!rapido && Math.abs(alvo - this.ang) < 0.002 && Math.abs(this.vel) < 0.01) { this.ang = alvo; this.vel = 0; this.sujo = true; return false; }
    this.sujo = true;
    return true;
  }

  desenhar(r: THREE.WebGLRenderer) {
    const { canvas } = this;
    const w = canvas.width; const h = canvas.height;
    if (!w || !h) return;
    const tam = r.getSize(new THREE.Vector2());
    if (tam.x !== w || tam.y !== h) r.setSize(w, h, false);
    this.camera.aspect = w / h; this.camera.updateProjectionMatrix();
    this.grupo.rotation.y = this.ang;
    // pulinho: sobe em arco, com um leve "amassa e estica"
    const p = this.pulo < 0 ? 0 : this.pulo;
    const alto = Math.sin(Math.PI * p);
    // respiração (personagem sem esqueleto): ~3,6 s por ciclo, 1,4% de altura — perceptível, sem parecer "pulsar"
    // (aplicada no próprio modelo, cuja origem está nos pés: ele cresce para cima e não afunda no chão)
    if (this.respirar && this.objeto) {
      const resp = 1 + 0.014 * (0.5 - 0.5 * Math.cos((performance.now() / 1000 + this.fase0) * ((Math.PI * 2) / 3.6)));
      const b = this.escalaObjeto;
      this.objeto.scale.set(b / Math.sqrt(resp), b * resp, b / Math.sqrt(resp));
    }
    const estica = 1 + 0.07 * Math.sin(Math.PI * 2 * p);
    this.grupo.scale.set(this.escala / Math.sqrt(estica), this.escala * estica, this.escala / Math.sqrt(estica));
    this.grupo.position.y = this.sobe + alto * 0.2;
    if (this.sombra) { const k = this.escala * (1 - alto * 0.22); this.sombra.scale.set(k, k, k); (this.sombra.material as THREE.MeshBasicMaterial).opacity = 0.6 * (1 - alto * 0.35); }
    r.render(this.cena, this.camera);
    this.ctx.clearRect(0, 0, w, h);
    this.ctx.drawImage(r.domElement, 0, 0);
    this.sujo = false;
    this.pintou = true;
  }

  pular() { if (this.pulo < 0 && !this.op.calmo) { this.pulo = 0; acordar(); } }
  angulo(graus: number) { this.fixo = true; this.ang = (graus * Math.PI) / 180; this.sujo = true; acordar(); }
  destruir() { this.morta = true; vistas.delete(this); this.descartar.forEach((f) => f()); }
}

const VEL_AUTO = 0.75; // rad/s: uma volta a cada ~8 s
const DUR_ENTRADA = 2300;

function laco(agora: number) {
  quadro = 0;
  const r = renderer;
  if (!r) return;
  const dt = Math.min(0.1, antes ? (agora - antes) / 1000 : 0.016);
  antes = agora;
  let vivo = false;
  for (const v of vistas) {
    if (!v.canvas.isConnected) continue;
    if (v.passo(agora, dt)) vivo = true;
    if (v.sujo) v.desenhar(r);
  }
  if (vivo && !document.hidden) quadro = requestAnimationFrame(laco); else antes = 0;
}
function acordar() { if (!quadro) quadro = requestAnimationFrame(laco); }
if (typeof document !== 'undefined') document.addEventListener('visibilitychange', () => { if (!document.hidden && vistas.size) acordar(); });

let sombraTex: THREE.CanvasTexture | null = null;
function texturaSombra(): THREE.CanvasTexture {
  if (sombraTex) return sombraTex;
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const x = c.getContext('2d');
  if (x) {
    const g = x.createRadialGradient(64, 64, 4, 64, 64, 64);
    g.addColorStop(0, 'rgba(6,12,36,.8)'); g.addColorStop(0.4, 'rgba(6,12,36,.5)'); g.addColorStop(0.72, 'rgba(6,12,36,.14)'); g.addColorStop(1, 'rgba(6,12,36,0)');
    x.fillStyle = g; x.fillRect(0, 0, 128, 128);
  }
  sombraTex = new THREE.CanvasTexture(c);
  return sombraTex;
}

/** Selo, moeda: silhueta extrudada com chanfro (a BORDA metálica) + frente e verso pintados. */
function conteudoSelo(peca: Peca, r: THREE.WebGLRenderer): Conteudo {
  const a = peca.proporcao;
  const objeto = new THREE.Group();
  const forma = new THREE.Shape(peca.contorno.map(([x, y]) => new THREE.Vector2((x - 0.5) * 2 * a, (0.5 - y) * 2)));
  const esp = peca.espessura * 2;
  const chanfro = Math.min(0.03, esp * 0.28);
  const geo = new THREE.ExtrudeGeometry(forma, { depth: esp - chanfro * 2, bevelEnabled: true, bevelThickness: chanfro, bevelSize: 0.022, bevelSegments: 3, curveSegments: 1, steps: 1 });
  geo.translate(0, 0, -(esp - chanfro * 2) / 2);
  const metal = new THREE.MeshStandardMaterial({ color: peca.borda, metalness: 1, roughness: 0.26, envMapIntensity: 1.25 });
  objeto.add(new THREE.Mesh(geo, metal));
  const plano = new THREE.PlaneGeometry(2 * a, 2);
  const tf = textura(peca.frente, r); const tv = textura(peca.verso, r);
  const mf = face(tf); const mv = face(tv);
  const frente = new THREE.Mesh(plano, mf); frente.position.z = esp / 2 + 0.004; frente.renderOrder = 2;
  const verso = new THREE.Mesh(plano, mv); verso.position.z = -(esp / 2 + 0.004); verso.rotation.y = Math.PI; verso.renderOrder = 2;
  objeto.add(frente, verso);
  return { objeto, inclinar: 0.05, descartar: () => { geo.dispose(); plano.dispose(); metal.dispose(); mf.dispose(); mv.dispose(); tf.dispose(); tv.dispose(); } };
}

/** Cria a peça 3D no canvas dado (o canvas já deve estar com width/height em pixels). Lança erro sem WebGL. */
export function criarVista(canvas: HTMLCanvasElement, peca: Peca, opcoes: OpcoesVista): Vista {
  const v = new VistaInterna(canvas, conteudoSelo(peca, motor()), opcoes);
  vistas.add(v);
  acordar();
  return v;
}

/**
 * Cria a vista de um MODELO GLB: centralizado, do tamanho do quadro, com sombra de contato.
 * Lança erro sem WebGL ou se o arquivo não carregar (quem chama mostra a imagem de reserva).
 */
export async function criarVistaModelo(canvas: HTMLCanvasElement, peca: PecaModelo, opcoes: OpcoesVista): Promise<Vista> {
  motor();
  const gltf = await lerGLB(peca.url, '[premio3d]');
  if (!gltf) throw new Error('modelo indisponível');
  const modelo = gltf.scene.clone(true); // geometrias, materiais e texturas ficam no cache (não descartar)
  const caixa = new THREE.Box3().setFromObject(modelo);
  const tam = caixa.getSize(new THREE.Vector3());
  const meio = caixa.getCenter(new THREE.Vector3());
  const raio = Math.hypot(tam.x, tam.z) / 2;
  // cabe em pé e de lado; a diagonal (rabo do Bolota, alças do troféu) não pode sair do quadro ao girar
  const k = Math.min(1.74 / Math.max(tam.y, tam.x, tam.z), 2.16 / (raio * 2));
  // o modelo fica com os pés no "chão" do giro (a respiração cresce para cima, sem afundar)
  modelo.position.set(-meio.x, -caixa.min.y, -meio.z);
  const giro = new THREE.Group();
  giro.add(modelo);
  giro.rotation.y = ((peca.frente ?? 0) * Math.PI) / 180;
  const zoom = peca.zoom ?? 1;
  giro.scale.setScalar(k * zoom);
  const altura = tam.y * k * zoom;
  // sem zoom: centralizado; com zoom: o ponto de foco (ex.: o rosto) vai para o centro do quadro
  const yPe = zoom === 1 ? 0.06 - (tam.y * k) / 2 : -altura * (peca.foco ?? 0.5) + 0.06;
  giro.position.y = yPe;
  const v = new VistaInterna(canvas, { objeto: giro, inclinar: peca.inclinar ?? 0.27, respirar: peca.respirar, sombra: peca.semSombra ? undefined : { y: yPe - 0.01, raio: (Math.max(tam.x, tam.z) / 2) * k * zoom }, descartar: () => undefined }, opcoes);
  vistas.add(v);
  acordar();
  return v;
}
