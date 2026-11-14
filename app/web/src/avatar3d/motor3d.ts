/**
 * Motor 3D do avatar (D029): boneco montado por peças, palco com giro de 360°, luz, sombra e câmera, e o
 * renderizador de miniaturas (um único contexto WebGL fora da tela → imagem em cache).
 * Este módulo é carregado sob demanda (import dinâmico em ./index.ts): o three.js não pesa na primeira tela.
 */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { COR_MASSINHA, MEDIDAS, type Aparencia } from './modelo.ts';
import { criarAcessorioCabeca, criarCabeca, criarCabelo, criarCadeira, criarCalca, criarCalcado, criarCamisa, criarCorpo } from './procedural.ts';
import { pecaPronta, piscarDoGLB } from './glb.ts';

const M = MEDIDAS;

function descartar(obj: THREE.Object3D) {
  obj.traverse((o) => {
    const m = o as THREE.Mesh;
    if (!m.isMesh) return;
    const mats = Array.isArray(m.material) ? m.material : [m.material];
    if (m.userData.compartilhado) {
      for (const mat of mats) if (mat.userData.pintado) mat.dispose();
      return;
    }
    m.geometry.dispose();
    for (const mat of mats) {
      (mat as THREE.MeshStandardMaterial).map?.dispose();
      mat.dispose();
    }
  });
}

/** O boneco: junta as peças (prontas em GLB quando existem; senão, as provisórias) no espaço comum do contrato. */
export class Boneco {
  readonly raiz = new THREE.Group();
  private conteudo: THREE.Group | null = null;
  private cabeca: THREE.Group | null = null;
  private piscar: ((v: number) => void) | null = null;
  private pedido = 0;
  private proximaPiscada = 2;
  sentado = false;

  /** Monta (ou remonta) o boneco. Só troca o que está na cena quando tudo ficou pronto: sem piscar de tela. */
  async aplicar(a: Aparencia): Promise<void> {
    const pedido = ++this.pedido;
    const sentado = a.acessibilidade.includes('cadeira-de-rodas');
    const novo = new THREE.Group();
    const cabeca = new THREE.Group(); // gira em torno do pescoço
    cabeca.position.set(0, M.pescocoY, 0);
    const noCentro = new THREE.Group(); // peças provisórias da cabeça: origem no centro da cabeça
    noCentro.position.set(0, M.cabecaY - M.pescocoY, 0);
    const noMundo = new THREE.Group(); // peças GLB da cabeça: origem no chão (contrato)
    noMundo.position.set(0, -M.pescocoY, 0);
    cabeca.add(noCentro, noMundo);
    novo.add(cabeca);

    const pele = a.pele ?? COR_MASSINHA;
    const cabeloCor = a.cabelo?.cor;
    let piscar: ((v: number) => void) | null = null;

    const [corpo, rosto, cabelo, camisa, calca, calcado] = await Promise.all([
      pecaPronta(`corpo-${a.sexo}`, { pele }, sentado),
      pecaPronta(`cabeca-${a.rosto ?? 'redondo'}`, { pele, iris: a.olhos ?? undefined, sobrancelha: cabeloCor, cabelo: cabeloCor }),
      a.cabelo ? pecaPronta(`cabelo-${a.cabelo.id}`, { cabelo: a.cabelo.cor }) : null,
      a.camisa ? pecaPronta(`camisa-${a.camisa.id}`, { tecido: a.camisa.cor, tecido2: a.camisa.cor2, pele }) : null,
      a.calca ? pecaPronta(`calca-${a.calca.id}`, { tecido: a.calca.cor, tecido2: a.calca.cor2 }, sentado) : null,
      a.calcado ? pecaPronta(`calcado-${a.calcado.id}`, { tecido: a.calcado.cor, tecido2: a.calcado.cor2 }, sentado) : null
    ]);
    const acess = await Promise.all(a.acessibilidade.map(async (id) => ({ id, obj: await pecaPronta(`acessibilidade-${id}`, { pele }) })));

    novo.add(corpo ?? criarCorpo(a, sentado));
    if (rosto) { noMundo.add(rosto); piscar = piscarDoGLB(rosto); }
    else { const c = criarCabeca(a); noCentro.add(c.grupo); piscar = c.piscar; }
    if (cabelo) noMundo.add(cabelo); else noCentro.add(criarCabelo(a));
    novo.add(camisa ?? criarCamisa(a), calca ?? criarCalca(a, sentado), calcado ?? criarCalcado(a, sentado));
    for (const { id, obj } of acess) {
      if (id === 'cadeira-de-rodas') novo.add(obj ?? criarCadeira());
      else if (obj) noMundo.add(obj);
      else { const p = criarAcessorioCabeca(id, a); if (p) noCentro.add(p); }
    }

    if (pedido !== this.pedido) { descartar(novo); return; }
    if (this.conteudo) { this.raiz.remove(this.conteudo); descartar(this.conteudo); }
    this.conteudo = novo;
    this.cabeca = cabeca;
    this.piscar = piscar;
    this.sentado = sentado;
    this.raiz.add(novo);
  }

  /** Vida do boneco parado: respira, balança de leve, inclina a cabeça e pisca. `t` em segundos. */
  animar(t: number) {
    if (!this.conteudo) return;
    const resp = Math.sin(t * 1.7);
    this.conteudo.scale.set(1 - 0.004 * resp, 1 + 0.007 * resp, 1 - 0.004 * resp);
    this.conteudo.rotation.z = this.sentado ? 0 : 0.012 * Math.sin(t * 0.9);
    if (this.cabeca) {
      this.cabeca.rotation.z = 0.035 * Math.sin(t * 0.7 + 0.6);
      this.cabeca.rotation.x = 0.02 * Math.sin(t * 1.1);
      this.cabeca.rotation.y = 0.05 * Math.sin(t * 0.45);
    }
    if (this.piscar) {
      if (t > this.proximaPiscada + 0.2) this.proximaPiscada = t + 2.4 + ((t * 7.3) % 2.6);
      const d = t - this.proximaPiscada;
      this.piscar(d > 0 && d < 0.2 ? Math.sin((d / 0.2) * Math.PI) : 0);
    }
  }
  /** Pose parada (miniaturas e "menos movimento"). */
  parado() {
    if (!this.conteudo) return;
    this.conteudo.scale.set(1, 1, 1);
    this.conteudo.rotation.z = 0;
    this.cabeca?.rotation.set(0, 0, 0);
    this.piscar?.(0);
  }
  descartar() {
    this.pedido++;
    if (this.conteudo) { this.raiz.remove(this.conteudo); descartar(this.conteudo); this.conteudo = null; }
  }
}

/* ------------------------------------------------------------------ cena, luz e câmera */

export type Enquadramento = 'corpo' | 'busto';

function texturaSombra(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d')!;
  const rg = g.createRadialGradient(64, 64, 4, 64, 64, 64);
  rg.addColorStop(0, 'rgba(12,26,64,.55)'); rg.addColorStop(0.55, 'rgba(12,26,64,.2)'); rg.addColorStop(1, 'rgba(12,26,64,0)');
  g.fillStyle = rg; g.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

class Cena {
  readonly cena = new THREE.Scene();
  readonly camera = new THREE.PerspectiveCamera(26, 1, 0.1, 20);
  readonly renderizador: THREE.WebGLRenderer;
  private readonly contato: THREE.Mesh;
  private readonly chao: THREE.Mesh;

  constructor(canvas: HTMLCanvasElement, opcoes: { sombras: boolean }) {
    const r = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'default' });
    r.outputColorSpace = THREE.SRGBColorSpace;
    r.toneMapping = THREE.NeutralToneMapping;
    r.toneMappingExposure = 1.05;
    r.setClearColor(0x000000, 0);
    r.shadowMap.enabled = opcoes.sombras;
    r.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderizador = r;

    const pmrem = new THREE.PMREMGenerator(r);
    this.cena.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    this.cena.environmentIntensity = 0.5;
    pmrem.dispose();

    // luz principal (quente, de cima e da frente), preenchimento do céu e contraluz (rim light)
    const chave = new THREE.DirectionalLight(0xfff1e0, 2.3);
    chave.position.set(1.1, 2.4, 2.2);
    chave.castShadow = opcoes.sombras;
    chave.shadow.mapSize.set(1024, 1024);
    chave.shadow.camera.left = -0.8; chave.shadow.camera.right = 0.8; chave.shadow.camera.top = 1.4; chave.shadow.camera.bottom = -0.3;
    chave.shadow.camera.near = 0.5; chave.shadow.camera.far = 6;
    chave.shadow.bias = -0.0006; chave.shadow.normalBias = 0.012; chave.shadow.radius = 5;
    const ceu = new THREE.HemisphereLight(0xe4f1ff, 0xcdb9a0, 0.6);
    const contra = new THREE.DirectionalLight(0xcfe6ff, 2.4);
    contra.position.set(-1.6, 1.7, -2.2);
    const contra2 = new THREE.DirectionalLight(0xffe2b8, 1.2);
    contra2.position.set(1.8, 1.2, -1.8);
    this.cena.add(chave, ceu, contra, contra2);

    this.chao = new THREE.Mesh(new THREE.CircleGeometry(1.4, 48), new THREE.ShadowMaterial({ opacity: 0.13, color: 0x0c1a40 }));
    this.chao.rotation.x = -Math.PI / 2;
    this.chao.receiveShadow = true;
    this.contato = new THREE.Mesh(new THREE.CircleGeometry(0.5, 32), new THREE.MeshBasicMaterial({ map: texturaSombra(), transparent: true, depthWrite: false, opacity: 0.85 }));
    this.contato.rotation.x = -Math.PI / 2;
    this.contato.position.y = 0.002;
    this.contato.scale.set(0.55, 0.4, 1);
    this.cena.add(this.chao, this.contato);
  }

  enquadrar(tipo: Enquadramento, aspecto: number, sentado = false) {
    const alvoY = tipo === 'busto' ? 0.875 : 0.57;
    const alturaVista = tipo === 'busto' ? 0.74 : 1.32;
    const larguraVista = tipo === 'busto' ? 0.7 : sentado ? 0.82 : 0.72;
    const fovV = THREE.MathUtils.degToRad(this.camera.fov);
    const dAltura = alturaVista / 2 / Math.tan(fovV / 2);
    const dLargura = larguraVista / 2 / (Math.tan(fovV / 2) * aspecto);
    const d = Math.max(dAltura, dLargura);
    this.camera.aspect = aspecto;
    this.camera.position.set(0, alvoY + (tipo === 'busto' ? 0.02 : 0.1), d);
    this.camera.lookAt(0, alvoY, 0);
    this.camera.updateProjectionMatrix();
    this.contato.scale.set(sentado ? 0.85 : 0.55, sentado ? 0.75 : 0.4, 1);
    this.chao.visible = this.contato.visible = tipo === 'corpo';
  }
  desenhar() { this.renderizador.render(this.cena, this.camera); }
  descartar() {
    this.cena.environment?.dispose();
    this.renderizador.dispose();
  }
}

/* ------------------------------------------------------------------ palco interativo (giro 360°) */

export interface OpcoesPalco { menosMovimento: boolean; enquadramento?: Enquadramento }

/** Palco do boneco num canvas visível: arrastar gira 360°, com inércia. Pausa fora da tela e com a aba escondida. */
export class Palco {
  private readonly cena: Cena;
  private readonly boneco = new Boneco();
  private readonly canvas: HTMLCanvasElement;
  private menosMovimento: boolean;
  private readonly enquadramento: Enquadramento;
  private giro = 0.35;
  private velocidade = 0;
  private arrastando = false;
  private mexeu = false;
  private ultimoX = 0;
  private visivel = true;
  private quadro = 0;
  private inicio = performance.now();
  private anterior = 0;
  private sujo = true;
  private vivo = true;
  private readonly obsTamanho: ResizeObserver;
  private readonly obsVisivel: IntersectionObserver;

  constructor(canvas: HTMLCanvasElement, o: OpcoesPalco) {
    this.canvas = canvas;
    this.menosMovimento = o.menosMovimento;
    this.enquadramento = o.enquadramento ?? 'corpo';
    this.cena = new Cena(canvas, { sombras: true });
    this.cena.cena.add(this.boneco.raiz);
    this.obsTamanho = new ResizeObserver(() => this.ajustar());
    this.obsTamanho.observe(canvas);
    this.obsVisivel = new IntersectionObserver((es) => { this.visivel = es.some((e) => e.isIntersecting); this.agendar(); });
    this.obsVisivel.observe(canvas);
    document.addEventListener('visibilitychange', this.agendar);
    canvas.addEventListener('pointerdown', this.aoApertar);
    canvas.addEventListener('pointermove', this.aoMover);
    canvas.addEventListener('pointerup', this.aoSoltar);
    canvas.addEventListener('pointercancel', this.aoSoltar);
    canvas.addEventListener('webglcontextlost', this.aoPerder);
    this.ajustar();
    this.agendar();
  }

  /** Chamado quando o contexto WebGL se perde (o componente mostra a reserva 2D). */
  aoPerderContexto: (() => void) | null = null;
  private aoPerder = (e: Event) => { e.preventDefault(); this.aoPerderContexto?.(); };

  async mostrar(a: Aparencia) {
    await this.boneco.aplicar(a);
    if (!this.vivo) return;
    this.ajustar();
    this.sujo = true;
    this.agendar();
  }
  definirMenosMovimento(v: boolean) { this.menosMovimento = v; this.sujo = true; this.agendar(); }
  /** Gira pelos botões (teclado e quem não arrasta): `passo` em voltas (0,125 = 45°). */
  girar(passo: number) { this.giro += passo * Math.PI * 2; this.mexeu = true; this.sujo = true; this.agendar(); }
  /** Define o ângulo (0 = de frente). Usado nos testes e nas capturas. */
  definirGiro(rad: number) { this.giro = rad; this.velocidade = 0; this.mexeu = true; this.sujo = true; this.agendar(); }

  private ajustar() {
    const l = this.canvas.clientWidth, a = this.canvas.clientHeight;
    if (!l || !a) return;
    // pixelRatio limitado: nitidez sem pesar em aparelho modesto
    this.cena.renderizador.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.cena.renderizador.setSize(l, a, false);
    this.cena.enquadrar(this.enquadramento, l / a, this.boneco.sentado);
    this.sujo = true;
    this.agendar();
  }
  private aoApertar = (e: PointerEvent) => {
    this.arrastando = true; this.mexeu = true; this.ultimoX = e.clientX; this.velocidade = 0;
    this.canvas.setPointerCapture?.(e.pointerId);
    this.agendar();
  };
  private aoMover = (e: PointerEvent) => {
    if (!this.arrastando) return;
    const dx = e.clientX - this.ultimoX;
    this.ultimoX = e.clientX;
    const passo = (dx / Math.max(120, this.canvas.clientWidth)) * Math.PI * 1.6;
    this.giro += passo;
    this.velocidade = passo;
    this.sujo = true;
  };
  private aoSoltar = () => { this.arrastando = false; };

  private agendar = () => {
    if (!this.vivo || this.quadro || !this.visivel || document.hidden) return;
    this.quadro = requestAnimationFrame(this.passo);
  };
  private passo = (agora: number) => {
    this.quadro = 0;
    if (!this.vivo) return;
    const t = (agora - this.inicio) / 1000;
    const dt = Math.min(0.05, t - this.anterior);
    this.anterior = t;
    let continua = this.arrastando;
    if (!this.arrastando && Math.abs(this.velocidade) > 0.0004) {
      this.giro += this.velocidade;
      this.velocidade *= Math.pow(0.9, dt * 60);
      this.sujo = true;
      continua = true;
    }
    if (this.menosMovimento) {
      this.boneco.parado();
      this.boneco.raiz.rotation.y = this.giro;
    } else {
      this.boneco.animar(t);
      // antes do primeiro toque, um vaivém lento mostra que o boneco é 3D
      this.boneco.raiz.rotation.y = this.giro + (this.mexeu ? 0 : 0.28 * Math.sin(t * 0.6));
      this.sujo = true;
      continua = true;
    }
    if (this.sujo) { this.cena.desenhar(); this.sujo = false; }
    if (continua) this.agendar();
  };

  descartar() {
    this.vivo = false;
    cancelAnimationFrame(this.quadro);
    this.obsTamanho.disconnect();
    this.obsVisivel.disconnect();
    document.removeEventListener('visibilitychange', this.agendar);
    this.canvas.removeEventListener('pointerdown', this.aoApertar);
    this.canvas.removeEventListener('pointermove', this.aoMover);
    this.canvas.removeEventListener('pointerup', this.aoSoltar);
    this.canvas.removeEventListener('pointercancel', this.aoSoltar);
    this.canvas.removeEventListener('webglcontextlost', this.aoPerder);
    this.boneco.descartar();
    this.cena.descartar();
  }
}

/* ------------------------------------------------------------------ miniaturas (um contexto fora da tela) */

let foraDaTela: { cena: Cena; canvas: HTMLCanvasElement } | null = null;
let fila: Promise<unknown> = Promise.resolve();

/**
 * Desenha o boneco numa imagem (data URL). Todas as miniaturas usam o MESMO contexto WebGL fora da tela, uma de
 * cada vez — nada de abrir um contexto por cartão.
 */
export function desenharMiniatura(a: Aparencia, tipo: Enquadramento, largura: number, altura: number, giro = tipo === 'busto' ? 0.28 : 0.3): Promise<string> {
  const tarefa = fila.then(async () => {
    if (!foraDaTela) {
      const canvas = document.createElement('canvas');
      foraDaTela = { canvas, cena: new Cena(canvas, { sombras: false }) };
      canvas.addEventListener('webglcontextlost', () => { foraDaTela = null; });
    }
    const { cena, canvas } = foraDaTela;
    const boneco = new Boneco();
    try {
      await boneco.aplicar(a);
      boneco.parado();
      boneco.raiz.rotation.y = giro;
      cena.cena.add(boneco.raiz);
      cena.renderizador.setPixelRatio(1);
      cena.renderizador.setSize(largura, altura, false);
      cena.enquadrar(tipo, largura / altura, boneco.sentado);
      cena.desenhar();
      return canvas.toDataURL('image/webp', 0.9);
    } finally {
      cena.cena.remove(boneco.raiz);
      boneco.descartar();
    }
  });
  fila = tarefa.catch(() => undefined);
  return tarefa;
}
