/**
 * CORRE-SOM · a pista em 3D (three.js, carregada sob demanda). Visual do projeto (D025: animação 3D fofa, luz quente):
 * rua de 3 pistas no meio de um campo com árvores redondas, flores e cerquinhas; o boneco da criança (avatar 3D, D029)
 * corre de costas para a câmera; arcos coloridos com uma placa (letra "Aa" ou figura) em cada pista; moedinhas e
 * almofadas fofas para pular. Nada de trem, cidade ou marca de outro jogo (regra 9).
 *
 * D035 (corrida contínua, pedido do dono 18/11): a pista NUNCA para. Os arcos vêm em sequência (`portal`) e passar por um
 * arco é escolher a pista em que o boneco está. Quem decide o jogo é a tela (CorreSom.tsx): esta classe só anima e avisa
 * (Promises) quando cada arco passou pelo boneco. Moedinhas e almofadas surgem entre os arcos.
 * Desempenho: placas guardadas por letra/figura (sem refazer textura), geometrias dos arcos compartilhadas e QUALIDADE
 * ADAPTATIVA (a resolução baixa quando os quadros ficam lentos e volta quando sobra folga).
 * "Menos movimento": a rua não corre; cada arco aparece parado na frente do boneco e passa no tempo do nível.
 */
import * as THREE from 'three';
import { Boneco } from '../../avatar3d/motor3d.ts';
import type { Aparencia } from '../../avatar3d/modelo.ts';
import { asset } from '../../servicos/ambiente.ts';
import type { MarcaArco, MotorCorrida, PlacaArco, PortalCorrida } from './corrida-motor.ts';

export type { MarcaArco, PlacaArco } from './corrida-motor.ts';

const PISTAS = [-1.35, 0, 1.35];
const Z_PARADA = -3.6; // "menos movimento": onde o arco fica parado, à frente do boneco
const Z_SURGE = -26; // = DISTANCIA_ARCO do motor (corre-som-corrida.ts)
const ESPACO = 12; // = ESPACO_ENTRE_ARCOS
const CORES_ARCO = [0xff8a65, 0xffc93c, 0x5ec2e8];
const CEU = 0xbfe6ff;
const PR_MAX = 1.75;
const PR_MIN = 0.75;

function texturaRadial(cor: string): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d')!;
  const rg = g.createRadialGradient(64, 64, 4, 64, 64, 64);
  rg.addColorStop(0, cor); rg.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = rg; g.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

/** Textura da rua: asfalto claro e faixas tracejadas entre as pistas. */
function texturaRua(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 256; c.height = 256;
  const g = c.getContext('2d')!;
  g.fillStyle = '#e9d9bf'; g.fillRect(0, 0, 256, 256);
  for (let k = 0; k < 220; k++) { g.fillStyle = `rgba(150,120,90,${0.05 + Math.random() * 0.06})`; g.fillRect(Math.random() * 256, Math.random() * 256, 3, 3); }
  g.fillStyle = '#c9a77c'; g.fillRect(0, 0, 10, 256); g.fillRect(246, 0, 10, 256);
  g.fillStyle = '#ffffff';
  for (const x of [256 / 3, (256 * 2) / 3]) g.fillRect(x - 4, 20, 8, 110);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(1, 18);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

/** Placa redonda do arco: letra grande (fonte escolar, "Aa") ou figura. */
function texturaPlaca(p: PlacaArco, cor: number): { tex: THREE.CanvasTexture; pronta: Promise<void> } {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d')!;
  const fundo = () => {
    g.clearRect(0, 0, 256, 256);
    g.fillStyle = '#' + cor.toString(16).padStart(6, '0');
    g.beginPath(); g.arc(128, 128, 126, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#fffaf0';
    g.beginPath(); g.arc(128, 128, 110, 0, Math.PI * 2); g.fill();
  };
  fundo();
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  let pronta: Promise<void> = Promise.resolve();
  if (p.letra) {
    const escrever = () => {
      fundo();
      g.fillStyle = '#22407a';
      g.font = `700 ${p.letra!.length > 1 ? 112 : 170}px Andika, Fredoka, sans-serif`;
      g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillText(p.letra!, 128, 134);
      tex.needsUpdate = true;
    };
    escrever();
    pronta = document.fonts?.load?.('700 100px Andika').then(() => escrever(), () => undefined) ?? Promise.resolve();
  } else if (p.imagem) {
    pronta = new Promise((ok) => {
      const img = new Image();
      img.onload = () => { fundo(); g.drawImage(img, 36, 36, 184, 184); tex.needsUpdate = true; ok(); };
      img.onerror = () => ok();
      img.src = p.imagem!;
    });
  }
  return { tex, pronta };
}

interface Arco { grupo: THREE.Group; mat: THREE.MeshStandardMaterial; placa: THREE.Mesh; brilho: THREE.Mesh }
interface Portal {
  raiz: THREE.Group; arcos: Arco[]; z: number; marca: MarcaArco; passou: boolean; longe: boolean; fim: number;
  aoPassar: (k: number) => void; aoLonge: () => void;
}
interface Coisa { obj: THREE.Object3D; tipo: 'moeda' | 'almofada'; pista: number; pega: boolean; pulou?: boolean }

export class PistaCorreSom implements MotorCorrida {
  private readonly r: THREE.WebGLRenderer;
  private readonly cena = new THREE.Scene();
  private readonly camera = new THREE.PerspectiveCamera(50, 1, 0.1, 140);
  private readonly boneco = new Boneco();
  private fundo?: THREE.Texture;
  private descartado = false;
  private readonly corredor = new THREE.Group();
  private readonly sombra: THREE.Mesh;
  private readonly rua: THREE.Mesh;
  private readonly texRua: THREE.CanvasTexture;
  private readonly enfeites: THREE.Object3D[] = [];
  private portais: Portal[] = [];
  private coisas: Coisa[] = [];
  private faixaChegada: THREE.Group | null = null;
  private confete: THREE.Points | null = null;
  private pistaAlvo = 1;
  private x = 0;
  private velocidade = 0;
  private vAlvo = 0;
  private pulo = -1;
  private tropeco = -1;
  private t = 0;
  private quadro = 0;
  private anterior = 0;
  private vivo = true;
  private dancando = false;
  private esperas: { cond: () => boolean; ok: () => void }[] = [];
  private readonly obs: ResizeObserver;
  // peças reaproveitadas (sem engasgo a cada arco)
  private readonly geoPoste = new THREE.CylinderGeometry(0.09, 0.11, 1.3, 14);
  private readonly geoMeia = new THREE.TorusGeometry(0.56, 0.1, 12, 30, Math.PI);
  private readonly geoPlaca = new THREE.CircleGeometry(0.64, 40);
  private readonly geoBrilho = new THREE.CircleGeometry(0.95, 40);
  private readonly geoMoeda = new THREE.CylinderGeometry(0.22, 0.22, 0.06, 20);
  private readonly matMoeda = new THREE.MeshStandardMaterial({ color: 0xffc93c, metalness: 0.3, roughness: 0.35, emissive: 0x7a4a00, emissiveIntensity: 0.25 });
  private readonly texBrilho = texturaRadial('rgba(255,236,140,1)');
  private readonly placas = new Map<string, { tex: THREE.CanvasTexture; pronta: Promise<void> }>();
  // qualidade adaptativa
  private pr = PR_MAX;
  private medida = { quadros: 0, tempo: 0, folga: 0 };
  private fpsMedido = 60;
  aoMoeda: (() => void) | null = null;
  aoPulo: (() => void) | null = null;
  aoTropeco: (() => void) | null = null;

  constructor(private readonly canvas: HTMLCanvasElement, private menosMovimento: boolean) {
    const r = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'default' });
    r.outputColorSpace = THREE.SRGBColorSpace;
    r.toneMapping = THREE.NeutralToneMapping;
    r.setClearColor(CEU, 1);
    this.r = r;
    this.cena.background = new THREE.Color(CEU);
    this.cena.fog = new THREE.Fog(CEU, 22, 70);
    // revisão 18/11 (item 22): céu e morros pintados atrás da pista (arte/jogos/ceu-corre-som.webp), no lugar do azul liso
    new THREE.TextureLoader().load(asset('arte/jogos/ceu-corre-som.webp'), (t) => {
      if (this.descartado) { t.dispose(); return; }
      t.colorSpace = THREE.SRGBColorSpace;
      this.fundo = t;
      this.cena.background = t;
      this.ajustarFundo();
    }, undefined, () => { /* sem a pintura, fica o céu azul */ });

    const sol = new THREE.DirectionalLight(0xfff0d8, 2.4);
    sol.position.set(3, 6, 4);
    const ceu = new THREE.HemisphereLight(0xdff1ff, 0x8fbf6a, 1.5);
    const contra = new THREE.DirectionalLight(0xcfe6ff, 1.6);
    contra.position.set(-2, 3, -4);
    this.cena.add(sol, ceu, contra);

    // campo, rua e morrinhos ao longe
    const grama = new THREE.Mesh(new THREE.PlaneGeometry(160, 160), new THREE.MeshStandardMaterial({ color: 0x8fd16a, roughness: 1 }));
    grama.rotation.x = -Math.PI / 2; grama.position.z = -50;
    this.texRua = texturaRua();
    this.rua = new THREE.Mesh(new THREE.PlaneGeometry(4.4, 120), new THREE.MeshStandardMaterial({ map: this.texRua, roughness: 0.95 }));
    this.rua.rotation.x = -Math.PI / 2; this.rua.position.set(0, 0.01, -50);
    this.cena.add(grama, this.rua);
    for (let k = 0; k < 7; k++) {
      const m = new THREE.Mesh(new THREE.SphereGeometry(8 + (k % 3) * 3, 24, 12), new THREE.MeshStandardMaterial({ color: k % 2 ? 0x7cc35a : 0x6fb44f, roughness: 1 }));
      m.scale.y = 0.45; m.position.set(-40 + k * 13, -1, -78 - (k % 2) * 6);
      this.cena.add(m);
    }
    this.criarEnfeites();

    // o boneco (de costas para a câmera) e a sombrinha dele
    this.boneco.raiz.rotation.y = Math.PI;
    this.corredor.add(this.boneco.raiz);
    this.sombra = new THREE.Mesh(new THREE.CircleGeometry(0.45, 24), new THREE.MeshBasicMaterial({ map: texturaRadial('rgba(40,60,30,.45)'), transparent: true, depthWrite: false }));
    this.sombra.rotation.x = -Math.PI / 2; this.sombra.position.y = 0.02;
    this.cena.add(this.corredor, this.sombra);

    this.obs = new ResizeObserver(() => this.ajustar());
    this.obs.observe(canvas);
    this.ajustar();
    document.addEventListener('visibilitychange', this.agendar);
    this.pr = Math.min(window.devicePixelRatio || 1, PR_MAX);
    this.agendar();
  }

  /** Veste o boneco com a aparência da criança (modelo 3D de verdade; senão a reserva feita em código). */
  async vestir(a: Aparencia) { await this.boneco.aplicar(a); }

  definirMenosMovimento(v: boolean) { this.menosMovimento = v; }

  private criarEnfeites() {
    const tronco = new THREE.CylinderGeometry(0.12, 0.16, 1, 8);
    const copa = new THREE.IcosahedronGeometry(0.9, 1);
    const flor = new THREE.SphereGeometry(0.16, 10, 8);
    const coresCopa = [0x5fb346, 0x77c25a, 0x4fa63f];
    const coresFlor = [0xff8fb1, 0xffd54f, 0xffffff, 0xb39ddb];
    const matTronco = new THREE.MeshStandardMaterial({ color: 0x9a6b45, roughness: 1 });
    for (let k = 0; k < 28; k++) {
      const lado = k % 2 ? 1 : -1;
      const g = new THREE.Group();
      if (k % 4 === 3) {
        // canteiro de flores
        for (let f = 0; f < 5; f++) {
          const m = new THREE.Mesh(flor, new THREE.MeshStandardMaterial({ color: coresFlor[(k + f) % coresFlor.length], roughness: 0.8 }));
          m.position.set((f - 2) * 0.28, 0.18, (f % 2) * 0.3);
          g.add(m);
        }
      } else if (k % 4 === 1) {
        // cerquinha branca
        const mat = new THREE.MeshStandardMaterial({ color: 0xfff6ea, roughness: 0.9 });
        for (let f = 0; f < 4; f++) { const m = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.6, 0.1), mat); m.position.set(0, 0.3, f * 0.5); g.add(m); }
        const trave = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.08, 1.6), mat); trave.position.set(0, 0.45, 0.75); g.add(trave);
      } else {
        const t = new THREE.Mesh(tronco, matTronco); t.position.y = 0.5; g.add(t);
        const c = new THREE.Mesh(copa, new THREE.MeshStandardMaterial({ color: coresCopa[k % 3], roughness: 0.9, flatShading: true }));
        c.position.y = 1.5; c.scale.setScalar(0.8 + (k % 5) * 0.12); g.add(c);
      }
      g.position.set(lado * (3.3 + (k % 5) * 0.9), 0, 6 - k * 3.4);
      this.enfeites.push(g);
      this.cena.add(g);
    }
  }

  private ajustar = () => {
    const l = this.canvas.clientWidth, a = this.canvas.clientHeight;
    if (!l || !a) return;
    this.r.setPixelRatio(this.pr);
    this.r.setSize(l, a, false);
    const aspecto = l / a;
    this.camera.aspect = aspecto;
    // celular em pé: câmera mais perto e mais fechada (revisão 18/11, item 13): os arcos parados ocupam ~metade da largura, as
    // letras ficam grandes e cada pista ganha uma faixa de toque larga (as faixas seguem a posição dos arcos na tela)
    const retrato = aspecto < 0.9;
    this.camera.fov = retrato ? 50 : 48;
    this.camera.position.set(0, retrato ? 3.0 : 2.5, retrato ? 4.6 : 4.4);
    this.camera.lookAt(0, retrato ? 1.1 : 1.05, -5);
    this.camera.updateProjectionMatrix();
    this.ajustarFundo();
  };

  /** A pintura do céu cobre a tela inteira sem esticar (como background-size: cover). */
  private ajustarFundo() {
    const t = this.fundo;
    const img = t?.image as { width: number; height: number } | undefined;
    if (!t || !img?.width || !this.canvas.clientHeight) return;
    const a = this.canvas.clientWidth / this.canvas.clientHeight, ai = img.width / img.height;
    if (a < ai) { t.repeat.set(a / ai, 1); t.offset.set((1 - a / ai) / 2, 0); } else { t.repeat.set(1, ai / a); t.offset.set(0, (1 - ai / a) / 2); }
  }

  /** Posição (0–1 da largura) de cada pista na tela, na altura dos arcos parados: para a tela pôr as áreas de toque. */
  colunasNaTela(): number[] {
    return PISTAS.map((x) => { const v = new THREE.Vector3(x, 2.45, Z_PARADA).project(this.camera); return (v.x + 1) / 2; });
  }

  get pista() { return this.pistaAlvo; }
  irParaPista(k: number) { this.pistaAlvo = Math.max(0, Math.min(2, k)); }
  pular() { if (this.pulo < 0 && !this.menosMovimento) this.pulo = 0; }
  /** Média de quadros por segundo do último segundo medido e a escala de resolução em uso (para o teste e o painel). */
  get desempenho() { return { fps: this.fpsMedido, resolucao: this.pr }; }

  /** Espera uma condição do laço de animação (sem relógio próprio: pausa junto com a aba). */
  private ate(cond: () => boolean): Promise<void> {
    return new Promise((ok) => { this.esperas.push({ cond, ok }); this.agendar(); });
  }
  private segundos(s: number) { const fim = this.t + s; return this.ate(() => this.t >= fim); }

  iniciarCorrida(v: number) { this.dancando = false; this.vAlvo = this.menosMovimento ? 0 : v; }
  pararCorrida() { this.vAlvo = 0; }

  private placa(p: PlacaArco, cor: number) {
    const chave = `${p.letra ?? ''}|${p.imagem ?? ''}|${cor}`;
    let x = this.placas.get(chave);
    if (!x) { x = texturaPlaca(p, cor); this.placas.set(chave, x); }
    return x;
  }

  /** Lança um arco (3 placas) agora; entre os arcos surgem moedinhas e, às vezes, uma almofada para pular. */
  portal(placas: PlacaArco[], tempoMs: number): PortalCorrida {
    const raiz = new THREE.Group();
    const arcos: Arco[] = placas.map((p, k) => {
      const grupo = new THREE.Group();
      const mat = new THREE.MeshStandardMaterial({ color: CORES_ARCO[k], roughness: 0.55, emissive: 0x000000 });
      for (const s of [-1, 1]) { const m = new THREE.Mesh(this.geoPoste, mat); m.position.set(s * 0.56, 0.65, 0); grupo.add(m); }
      const meia = new THREE.Mesh(this.geoMeia, mat); meia.position.y = 1.3; grupo.add(meia);
      const placa = new THREE.Mesh(this.geoPlaca, new THREE.MeshBasicMaterial({ map: this.placa(p, CORES_ARCO[k]).tex, transparent: true }));
      placa.position.set(0, 2.45, 0.02);
      const brilho = new THREE.Mesh(this.geoBrilho, new THREE.MeshBasicMaterial({ map: this.texBrilho, transparent: true, depthWrite: false, opacity: 0 }));
      brilho.position.set(0, 2.45, -0.02);
      grupo.add(brilho, placa);
      grupo.position.x = PISTAS[k];
      raiz.add(grupo);
      return { grupo, mat, placa, brilho };
    });
    let aoPassar: (k: number) => void = () => {};
    let aoLonge: () => void = () => {};
    const passou = new Promise<number>((ok) => { aoPassar = ok; });
    const longe = new Promise<void>((ok) => { aoLonge = ok; });
    const parado = this.menosMovimento;
    const pt: Portal = { raiz, arcos, z: parado ? Z_PARADA : Z_SURGE, marca: null, passou: false, longe: false, fim: parado ? this.t + tempoMs / 1000 : Infinity, aoPassar, aoLonge };
    raiz.position.z = pt.z;
    this.cena.add(raiz);
    this.portais.push(pt);
    if (!parado) this.porExtras();
    this.agendar();
    return { passou, longe, marcar: (m) => { pt.marca = m; } };
  }

  /** Moedinhas numa pista sorteada entre este arco e o anterior; às vezes uma almofada noutra pista. */
  private porExtras() {
    const p = Math.floor(Math.random() * 3);
    for (let k = 0; k < 4; k++) this.porCoisa('moeda', p, Z_SURGE + 3.5 + k * 1.4);
    if (Math.random() < 0.4) this.porCoisa('almofada', (p + 1 + Math.floor(Math.random() * 2)) % 3, Z_SURGE + 6);
  }

  private porCoisa(tipo: Coisa['tipo'], pista: number, z: number) {
    let obj: THREE.Object3D;
    if (tipo === 'moeda') {
      const m = new THREE.Mesh(this.geoMoeda, this.matMoeda);
      m.rotation.x = Math.PI / 2;
      const g = new THREE.Group(); g.add(m); g.position.y = 0.55;
      obj = g;
    } else {
      // almofada fofa (rosa, com botãozinho no meio)
      const g = new THREE.Group();
      const corpo = new THREE.Mesh(new THREE.SphereGeometry(0.5, 20, 12), new THREE.MeshStandardMaterial({ color: 0xffa6c1, roughness: 0.85 }));
      corpo.scale.set(1.1, 0.42, 0.7); corpo.position.y = 0.22;
      const botao = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 8), new THREE.MeshStandardMaterial({ color: 0xffffff }));
      botao.position.set(0, 0.42, 0.18);
      g.add(corpo, botao);
      obj = g;
    }
    obj.position.x = PISTAS[pista];
    obj.position.z = z;
    this.cena.add(obj);
    this.coisas.push({ obj, tipo, pista, pega: false });
  }

  private tirarPortal(pt: Portal) {
    this.cena.remove(pt.raiz);
    for (const a of pt.arcos) {
      a.mat.dispose();
      (a.placa.material as THREE.Material).dispose(); // a textura fica guardada (reuso)
      (a.brilho.material as THREE.Material).dispose();
    }
  }

  /** Estrelinhas saindo do arco que o boneco acabou de passar. */
  festejar() {
    this.soltarConfete(new THREE.Vector3(PISTAS[this.pistaAlvo], 1.8, -0.6), 60);
  }

  private soltarConfete(base: THREE.Vector3, n: number) {
    if (this.confete) { this.cena.remove(this.confete); this.confete.geometry.dispose(); }
    const pos = new Float32Array(n * 3), cor = new Float32Array(n * 3);
    const vel: THREE.Vector3[] = [];
    const paleta = [new THREE.Color(0xffc93c), new THREE.Color(0xff8a65), new THREE.Color(0x5ec2e8), new THREE.Color(0x8fd16a), new THREE.Color(0xffffff)];
    for (let k = 0; k < n; k++) {
      pos.set([base.x, base.y, base.z], k * 3);
      const c = paleta[k % paleta.length]; cor.set([c.r, c.g, c.b], k * 3);
      vel.push(new THREE.Vector3((Math.random() - 0.5) * 3.5, 1.5 + Math.random() * 3, (Math.random() - 0.5) * 2));
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(cor, 3));
    const pts = new THREE.Points(geo, new THREE.PointsMaterial({ size: 0.13, vertexColors: true, transparent: true }));
    pts.userData = { vel, idade: 0 };
    this.confete = pts;
    this.cena.add(pts);
  }

  /** Fim da rodada: faixa de chegada, confete e o boneco vira para a criança. Sem placar, sem "perdeu". */
  async chegada() {
    for (const pt of this.portais) this.tirarPortal(pt);
    this.portais = [];
    const g = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6 });
    for (const s of [-1, 1]) { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 2.6, 14), mat); m.position.set(s * 2.25, 1.3, 0); g.add(m); }
    const bandeiras = [0xff8a65, 0xffc93c, 0x5ec2e8, 0x8fd16a];
    for (let k = 0; k < 12; k++) {
      const b = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.34, 3), new THREE.MeshStandardMaterial({ color: bandeiras[k % 4], roughness: 0.7 }));
      b.rotation.x = Math.PI; b.position.set(-2.1 + k * 0.38, 2.3 - Math.sin((k / 11) * Math.PI) * 0.25, 0); g.add(b);
    }
    this.faixaChegada = g;
    this.cena.add(g);
    if (this.menosMovimento) { g.position.z = -1.5; this.dancando = true; return; }
    g.position.z = -16;
    this.vAlvo = 4.5;
    await this.ate(() => (this.faixaChegada?.position.z ?? 1) > 0.5);
    this.vAlvo = 0;
    this.soltarConfete(new THREE.Vector3(0, 2.2, -0.5), 140);
    this.dancando = true;
    await this.segundos(0.6);
  }

  /* ------------------------------------------------------------ laço de animação ------------------------------------------------------------ */

  private agendar = () => {
    if (!this.vivo || this.quadro || document.hidden) return;
    this.quadro = requestAnimationFrame(this.passo);
  };

  /**
   * Qualidade adaptativa: a cada segundo mede os quadros; abaixo de 50 qps baixa a resolução (até 0,75), acima de 57 qps por
   * 3 s seguidos sobe de volta (até 1,75 ou a da tela). Sem engasgo: só muda o tamanho do desenho.
   */
  private medirQualidade(dt: number) {
    const m = this.medida;
    m.quadros++; m.tempo += dt;
    if (m.tempo < 1) return;
    this.fpsMedido = Math.round(m.quadros / m.tempo);
    m.quadros = 0; m.tempo = 0;
    const teto = Math.min(window.devicePixelRatio || 1, PR_MAX);
    let novo = this.pr;
    if (this.fpsMedido < 50 && this.pr > PR_MIN) { novo = Math.max(PR_MIN, this.pr - 0.25); m.folga = 0; }
    else if (this.fpsMedido >= 57 && this.pr < teto) { if (++m.folga >= 3) { novo = Math.min(teto, this.pr + 0.25); m.folga = 0; } }
    else m.folga = 0;
    if (novo !== this.pr) { this.pr = novo; this.ajustar(); }
    this.canvas.dataset.fps = String(this.fpsMedido);
    this.canvas.dataset.resolucao = String(this.pr);
  }

  private passo = (agora: number) => {
    this.quadro = 0;
    if (!this.vivo) return;
    const dt = this.anterior ? Math.min(0.05, (agora - this.anterior) / 1000) : 0.016;
    this.anterior = agora;
    this.t += dt;

    // velocidade: a corrida (constante) ou a chegada
    this.velocidade += (this.vAlvo - this.velocidade) * Math.min(1, dt * 3);
    if (this.vAlvo === 0 && this.velocidade < 0.05) this.velocidade = 0;
    const dz = this.velocidade * dt;

    if (dz) {
      this.texRua.offset.y += dz / (120 / 18);
      for (const e of this.enfeites) { e.position.z += dz; if (e.position.z > 8) e.position.z -= 28 * 3.4; }
      if (this.faixaChegada) this.faixaChegada.position.z += dz;
      for (const c of this.coisas) c.obj.position.z += dz;
    }

    // troca de pista (suave) e corridinha
    const xAlvo = PISTAS[this.pistaAlvo];
    this.x += (xAlvo - this.x) * Math.min(1, dt * (this.menosMovimento ? 30 : 11));
    let y = 0;
    if (this.pulo >= 0) { this.pulo += dt / 0.62; y = Math.sin(Math.min(1, this.pulo) * Math.PI) * 0.95; if (this.pulo >= 1) this.pulo = -1; }
    const correndo = this.velocidade > 0.4 && !this.menosMovimento;
    const passo = correndo ? Math.abs(Math.sin(this.t * 11)) * 0.07 : 0;
    this.corredor.position.set(this.x, y + passo, 0);
    this.corredor.rotation.z = (this.x - xAlvo) * 0.25;
    if (this.tropeco >= 0) { this.tropeco += dt / 0.5; this.corredor.rotation.x = Math.sin(Math.min(1, this.tropeco) * Math.PI) * -0.25; if (this.tropeco >= 1) { this.tropeco = -1; this.corredor.rotation.x = 0; } }
    else this.corredor.rotation.x = correndo ? -0.08 : 0;
    if (this.dancando) {
      this.boneco.raiz.rotation.y += (0 - this.boneco.raiz.rotation.y) * Math.min(1, dt * 4);
      if (!this.menosMovimento) this.corredor.position.y = Math.abs(Math.sin(this.t * 4)) * 0.18;
    }
    if (this.menosMovimento) this.boneco.parado(); else this.boneco.animar(this.t);
    this.sombra.position.set(this.x, 0.02, 0);
    this.sombra.scale.setScalar(1 - y * 0.35);

    // moedinhas (enfeite) e almofadas
    for (const c of this.coisas) {
      if (c.tipo === 'moeda') c.obj.rotation.y += dt * 4;
      if (!c.pega && c.obj.position.z > -0.35 && c.obj.position.z < 0.45 && Math.abs(PISTAS[c.pista] - this.x) < 0.6) {
        if (c.tipo === 'moeda') { c.pega = true; c.obj.visible = false; this.aoMoeda?.(); }
        else if (y < 0.35) { c.pega = true; this.tropeco = 0; this.aoTropeco?.(); }
        else { c.pega = true; c.pulou = true; this.aoPulo?.(); }
      }
      if (c.tipo === 'almofada' && c.pega && !c.pulou && c.obj.visible) { c.obj.scale.y = Math.max(0.2, c.obj.scale.y - dt * 3); }
    }
    this.coisas = this.coisas.filter((c) => { if (c.obj.position.z > 7) { this.cena.remove(c.obj); return false; } return true; });

    // arcos: andam com a rua; passou pelo boneco (z ≥ 0) = escolheu a pista em que está; marca certo (brilho) ou tentado
    const pulsar = 0.5 + 0.5 * Math.sin(this.t * 6);
    for (const pt of this.portais) {
      if (this.menosMovimento) { if (!pt.passou && this.t >= pt.fim) pt.z = 0.01; }
      else pt.z += dz;
      pt.raiz.position.z = pt.z;
      if (!pt.longe && (pt.z - Z_SURGE >= ESPACO || pt.passou)) { pt.longe = true; pt.aoLonge(); }
      if (!pt.passou && pt.z >= 0) { pt.passou = true; pt.fim = this.t + 0.6; pt.aoPassar(this.pistaAlvo); }
      pt.arcos.forEach((a, k) => {
        const minha = k === this.pistaAlvo;
        const m = pt.marca && minha ? pt.marca : null;
        (a.brilho.material as THREE.MeshBasicMaterial).opacity = m === 'certo' ? 1 : m === 'modelo' ? 0.55 + 0.45 * pulsar : 0;
        a.mat.emissive.setHex(m === 'certo' ? 0x6a4a00 : 0x000000);
        a.mat.color.setHex(m === 'tentado' ? 0xc9c3ba : CORES_ARCO[k]);
        (a.placa.material as THREE.MeshBasicMaterial).opacity = m === 'tentado' ? 0.55 : 1;
      });
      if (this.menosMovimento && pt.passou) pt.raiz.visible = this.t < pt.fim;
    }
    this.portais = this.portais.filter((pt) => { const sai = pt.passou && (this.menosMovimento ? this.t >= pt.fim : pt.z > 7); if (sai) this.tirarPortal(pt); return !sai; });

    // confete
    if (this.confete) {
      const d = this.confete.userData as { vel: THREE.Vector3[]; idade: number };
      d.idade += dt;
      const pos = this.confete.geometry.getAttribute('position') as THREE.BufferAttribute;
      d.vel.forEach((v, k) => { v.y -= 4.5 * dt; pos.setXYZ(k, pos.getX(k) + v.x * dt, pos.getY(k) + v.y * dt, pos.getZ(k) + v.z * dt + dz); });
      pos.needsUpdate = true;
      (this.confete.material as THREE.PointsMaterial).opacity = Math.max(0, 1 - d.idade / 1.6);
      if (d.idade > 1.6) { this.cena.remove(this.confete); this.confete.geometry.dispose(); this.confete = null; }
    }

    this.r.render(this.cena, this.camera);
    this.medirQualidade(dt);
    this.esperas = this.esperas.filter((e) => { if (e.cond()) { e.ok(); return false; } return true; });
    this.agendar();
  };

  descartar() {
    this.vivo = false;
    cancelAnimationFrame(this.quadro);
    this.obs.disconnect();
    document.removeEventListener('visibilitychange', this.agendar);
    for (const e of this.esperas) e.ok();
    this.esperas = [];
    for (const pt of this.portais) { pt.aoPassar(this.pistaAlvo); this.tirarPortal(pt); }
    this.portais = [];
    for (const x of this.placas.values()) x.tex.dispose();
    this.texBrilho.dispose();
    this.boneco.descartar();
    this.cena.traverse((o) => { const m = o as THREE.Mesh; if (m.isMesh) { m.geometry.dispose(); const mt = m.material as THREE.Material; mt.dispose(); } });
    this.texRua.dispose();
    this.descartado = true;
    this.fundo?.dispose();
    this.r.dispose();
  }
}
