/**
 * CORRE-SOM · a pista em 3D (three.js, carregada sob demanda). Visual do projeto (D025: animação 3D fofa, luz quente):
 * rua de 3 pistas no meio de um campo com árvores redondas, flores e cerquinhas; o boneco da criança (avatar 3D, D029)
 * corre de costas para a câmera; arcos coloridos com uma placa (letra ou figura) em cada pista; moedinhas de enfeite e
 * almofadas fofas para pular. Nada de trem, cidade ou marca de outro jogo (regra 9).
 *
 * Quem decide o jogo é a tela (CorreSom.tsx): esta classe só anima e avisa quando cada movimento terminou (Promises).
 * "Menos movimento": a rua não corre; os arcos aparecem já parados e o boneco só troca de pista.
 */
import * as THREE from 'three';
import { Boneco } from '../../avatar3d/motor3d.ts';
import type { Aparencia } from '../../avatar3d/modelo.ts';

export interface PlacaArco { letra?: string; imagem?: string }
export type MarcaArco = 'tentado' | 'modelo' | 'certo' | null;

const PISTAS = [-1.35, 0, 1.35];
const Z_PARADA = -3.6; // onde os arcos param, à frente do boneco
const Z_SURGE = -30;
const V_CORRIDA = 6.5;
const CORES_ARCO = [0xff8a65, 0xffc93c, 0x5ec2e8];
const CEU = 0xbfe6ff;

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

/** Placa redonda do arco: letra grande (fonte escolar) ou figura. */
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
      g.font = `700 ${p.letra!.length > 1 ? 120 : 170}px Andika, Fredoka, sans-serif`;
      g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillText(p.letra!, 128, p.letra === p.letra!.toLowerCase() ? 118 : 136);
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

interface Arco { grupo: THREE.Group; mat: THREE.MeshStandardMaterial; placa: THREE.Mesh; brilho: THREE.Mesh; marca: MarcaArco; acesa: boolean }
interface Coisa { obj: THREE.Object3D; tipo: 'moeda' | 'almofada'; pista: number; pega: boolean }

export class PistaCorreSom {
  private readonly r: THREE.WebGLRenderer;
  private readonly cena = new THREE.Scene();
  private readonly camera = new THREE.PerspectiveCamera(50, 1, 0.1, 140);
  private readonly boneco = new Boneco();
  private readonly corredor = new THREE.Group();
  private readonly sombra: THREE.Mesh;
  private readonly rua: THREE.Mesh;
  private readonly texRua: THREE.CanvasTexture;
  private readonly enfeites: THREE.Object3D[] = [];
  private arcos: Arco[] = [];
  private zArcos = Z_SURGE;
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
  aoMoeda: (() => void) | null = null;
  aoTropeco: (() => void) | null = null;

  constructor(private readonly canvas: HTMLCanvasElement, private menosMovimento: boolean) {
    const r = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'default' });
    r.outputColorSpace = THREE.SRGBColorSpace;
    r.toneMapping = THREE.NeutralToneMapping;
    r.setClearColor(CEU, 1);
    this.r = r;
    this.cena.background = new THREE.Color(CEU);
    this.cena.fog = new THREE.Fog(CEU, 22, 70);

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
    this.r.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    this.r.setSize(l, a, false);
    const aspecto = l / a;
    this.camera.aspect = aspecto;
    // celular em pé: câmera mais alta e mais aberta, para as 3 pistas caberem
    const retrato = aspecto < 0.9;
    this.camera.fov = retrato ? 64 : 48;
    this.camera.position.set(0, retrato ? 3.3 : 2.5, retrato ? 5.6 : 4.4);
    this.camera.lookAt(0, retrato ? 0.9 : 1.05, -5);
    this.camera.updateProjectionMatrix();
  };

  /** Posição (0–1 da largura) de cada pista na tela, na altura dos arcos parados: para a tela pôr as áreas de toque. */
  colunasNaTela(): number[] {
    return PISTAS.map((x) => { const v = new THREE.Vector3(x, 1, Z_PARADA).project(this.camera); return (v.x + 1) / 2; });
  }

  get pista() { return this.pistaAlvo; }
  irParaPista(k: number) { this.pistaAlvo = Math.max(0, Math.min(2, k)); }
  moverPista(d: number) { this.irParaPista(this.pistaAlvo + d); }
  pular() { if (this.pulo < 0 && !this.menosMovimento) this.pulo = 0; }

  /** Espera uma condição do laço de animação (sem relógio próprio: pausa junto com a aba). */
  private ate(cond: () => boolean): Promise<void> {
    return new Promise((ok) => { this.esperas.push({ cond, ok }); this.agendar(); });
  }
  private segundos(s: number) { const fim = this.t + s; return this.ate(() => this.t >= fim); }

  /** Corre um trecho com moedinhas de enfeite e, às vezes, uma almofada para pular (sem castigo: só um tropeço fofo). */
  async correr(s: number, extras: { moedas: boolean; almofada: boolean }) {
    if (this.menosMovimento) return;
    this.vAlvo = V_CORRIDA;
    if (extras.moedas) {
      const p = Math.floor(Math.random() * 3);
      for (let k = 0; k < 5; k++) this.porCoisa('moeda', p, -14 - k * 1.6);
    }
    if (extras.almofada) this.porCoisa('almofada', this.pistaAlvo, -22);
    await this.segundos(s);
  }

  private porCoisa(tipo: Coisa['tipo'], pista: number, z: number) {
    let obj: THREE.Object3D;
    if (tipo === 'moeda') {
      const m = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.06, 20), new THREE.MeshStandardMaterial({ color: 0xffc93c, metalness: 0.3, roughness: 0.35, emissive: 0x7a4a00, emissiveIntensity: 0.25 }));
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

  /** Traz os 3 arcos com as placas e desacelera até parar na frente do boneco (a escolha nunca é feita com pressa). */
  async mostrarArcos(placas: PlacaArco[]) {
    this.tirarArcos();
    const prontas: Promise<void>[] = [];
    this.arcos = placas.map((p, k) => {
      const grupo = new THREE.Group();
      const mat = new THREE.MeshStandardMaterial({ color: CORES_ARCO[k], roughness: 0.55, emissive: 0x000000 });
      const poste = new THREE.CylinderGeometry(0.09, 0.11, 1.3, 14);
      for (const s of [-1, 1]) { const m = new THREE.Mesh(poste, mat); m.position.set(s * 0.56, 0.65, 0); grupo.add(m); }
      const meia = new THREE.Mesh(new THREE.TorusGeometry(0.56, 0.1, 12, 30, Math.PI), mat);
      meia.position.y = 1.3; grupo.add(meia);
      const { tex, pronta } = texturaPlaca(p, CORES_ARCO[k]);
      prontas.push(pronta);
      const placa = new THREE.Mesh(new THREE.CircleGeometry(0.55, 40), new THREE.MeshBasicMaterial({ map: tex, transparent: true }));
      placa.position.set(0, 2.38, 0.02);
      const brilho = new THREE.Mesh(new THREE.CircleGeometry(0.85, 40), new THREE.MeshBasicMaterial({ map: texturaRadial('rgba(255,236,140,1)'), transparent: true, depthWrite: false, opacity: 0 }));
      brilho.position.set(0, 2.38, -0.02);
      grupo.add(brilho, placa);
      grupo.position.x = PISTAS[k];
      this.cena.add(grupo);
      return { grupo, mat, placa, brilho, marca: null, acesa: false };
    });
    await Promise.all(prontas);
    if (this.menosMovimento) { this.zArcos = Z_PARADA; this.velocidade = this.vAlvo = 0; this.posicionarArcos(); return; }
    this.zArcos = Z_SURGE;
    this.posicionarArcos();
    this.vAlvo = -1; // modo "chegando": a velocidade segue a distância que falta
    await this.ate(() => this.zArcos >= Z_PARADA - 0.02);
    this.zArcos = Z_PARADA; this.vAlvo = 0; this.velocidade = 0;
  }

  private posicionarArcos() { for (const a of this.arcos) a.grupo.position.z = this.zArcos; }

  /** Acende uma placa (enquanto a guia diz o nome da figura) ou apaga todas (null). */
  acender(k: number | null) { this.arcos.forEach((a, i) => { a.acesa = i === k; }); }
  marcar(k: number, m: MarcaArco) { const a = this.arcos[k]; if (a) a.marca = m; }

  /** O boneco vai para a pista escolhida e passa pelo arco dela. */
  async passar(k: number) {
    this.irParaPista(k);
    await this.ate(() => Math.abs(this.x - PISTAS[this.pistaAlvo]) < 0.05);
    if (this.menosMovimento) {
      this.zArcos = Z_PARADA; await this.segundos(0.15); return;
    }
    this.vAlvo = 4.2;
    await this.ate(() => this.zArcos > 1.2);
    this.vAlvo = 0;
    await this.ate(() => this.velocidade < 0.3);
  }

  /** Depois de um erro: os arcos voltam para a frente do boneco, com a mesma ordem (o arco tentado fica apagadinho). */
  async voltarAosArcos() {
    if (this.menosMovimento) { this.zArcos = Z_PARADA; this.posicionarArcos(); return; }
    for (const a of this.arcos) a.grupo.visible = false;
    this.zArcos = Z_PARADA - 6;
    this.posicionarArcos();
    for (const a of this.arcos) a.grupo.visible = true;
    this.vAlvo = -1;
    await this.ate(() => this.zArcos >= Z_PARADA - 0.02);
    this.zArcos = Z_PARADA; this.vAlvo = 0; this.velocidade = 0;
  }

  tirarArcos() {
    for (const a of this.arcos) { this.cena.remove(a.grupo); a.grupo.traverse((o) => { const m = o as THREE.Mesh; if (m.isMesh) { m.geometry.dispose(); const mt = m.material as THREE.MeshBasicMaterial; mt.map?.dispose(); mt.dispose(); } }); }
    this.arcos = [];
  }

  /** Estrelinhas saindo do arco certo. */
  festejar(k: number) {
    const a = this.arcos[k];
    const base = a ? new THREE.Vector3(a.grupo.position.x, 1.8, a.grupo.position.z) : new THREE.Vector3(PISTAS[this.pistaAlvo], 1.6, -1);
    this.soltarConfete(base, 70);
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
    this.tirarArcos();
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
    this.vAlvo = V_CORRIDA * 0.7;
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

  private passo = (agora: number) => {
    this.quadro = 0;
    if (!this.vivo) return;
    const dt = this.anterior ? Math.min(0.05, (agora - this.anterior) / 1000) : 0.016;
    this.anterior = agora;
    this.t += dt;

    // velocidade: corrida, chegada (segue a distância até a parada) ou passagem
    if (this.vAlvo < 0) this.velocidade = Math.max(0.35, Math.min(V_CORRIDA, (Z_PARADA - this.zArcos) * 1.5));
    else this.velocidade += (this.vAlvo - this.velocidade) * Math.min(1, dt * 3);
    if (this.vAlvo === 0 && this.velocidade < 0.05) this.velocidade = 0;
    const dz = this.velocidade * dt;

    if (dz) {
      this.texRua.offset.y += dz / (120 / 18);
      for (const e of this.enfeites) { e.position.z += dz; if (e.position.z > 8) e.position.z -= 28 * 3.4; }
      if (this.arcos.length) { this.zArcos += dz; this.posicionarArcos(); }
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
      }
      if (c.tipo === 'almofada' && c.pega && c.obj.visible) { c.obj.scale.y = Math.max(0.2, c.obj.scale.y - dt * 3); }
    }
    this.coisas = this.coisas.filter((c) => { if (c.obj.position.z > 7) { this.cena.remove(c.obj); return false; } return true; });

    // arcos: acesa (a guia está dizendo o nome), modelo (brilha: ajuda máxima), tentado (apagadinho), certo
    for (const a of this.arcos) {
      const pulsar = 0.5 + 0.5 * Math.sin(this.t * 6);
      const m = a.brilho.material as THREE.MeshBasicMaterial;
      m.opacity = a.marca === 'certo' ? 1 : a.marca === 'modelo' ? 0.55 + 0.45 * pulsar : a.acesa ? 0.9 : 0;
      a.mat.emissive.setHex(a.marca === 'modelo' || a.marca === 'certo' ? 0x6a4a00 : 0x000000);
      a.mat.color.setHex(a.marca === 'tentado' ? 0xc9c3ba : CORES_ARCO[this.arcos.indexOf(a)]);
      (a.placa.material as THREE.MeshBasicMaterial).opacity = a.marca === 'tentado' ? 0.55 : 1;
      const s = a.acesa && !this.menosMovimento ? 1.08 + 0.04 * pulsar : 1;
      a.placa.scale.setScalar(s);
    }

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
    this.tirarArcos();
    this.boneco.descartar();
    this.cena.traverse((o) => { const m = o as THREE.Mesh; if (m.isMesh) { m.geometry.dispose(); const mt = m.material as THREE.Material; mt.dispose(); } });
    this.texRua.dispose();
    this.r.dispose();
  }
}
