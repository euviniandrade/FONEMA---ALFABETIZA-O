// FONEMA · Mundo 3D v2 — camada NPCS: os outros bonecos da vila (Sofia, Tales, Bolota e crianças da vila).
//
// Hoje: rotas simples (vai de ponto em ponto, espera um pouco), param e olham para a criança quando ela chega perto,
// devolvem o tchau e, ao "Conversar", dizem falas ROTEIRIZADAS e seguras com áudio que já existe (D032: nada de IA,
// chat ou sala online sem decisão do dono). Nenhuma fala é inventada aqui: o texto é a chave do clipe gravado
// (public/audio/falas/manifesto.json) e o app toca pela voz da dupla.
//
// PONTOS DE ENCAIXE para o futuro (sem mudar o resto do passeio):
//  - `npcs.definirCerebro(c)`: quem decide o que cada boneco diz. Contrato:
//      c.conversar(npc, contexto) → Promise<{ falas: {quem:'sofia'|'tales', texto}[], balao?: string, acao?: { rotulo, lugar } }>
//    `contexto` = { nome, primeiraMissao, lugares }. Uma IA (com moderação, no servidor) entra aqui.
//  - `npcs.remoto`: presença de outras crianças (multijogador). entrar(id, { papel, altura, modelo }) · mover(id, x, z, giro, acao)
//    · sair(id). Um boneco remoto não tem rota: anda até a última posição recebida. A rede (servidor, sala) fica fora daqui.
import * as THREE from 'three';
import { Boneco, bonecoReserva } from './boneco.js';
import { clamp, lerp } from './kit.js';

/** Falas roteirizadas (todas já gravadas). [NOME] = nome da criança (o app encaixa o clipe do nome). */
export const CEREBRO_ROTEIRIZADO = {
  async conversar(npc, ctx) {
    if (npc.papel === 'sofia') {
      const falas = [{ quem: 'sofia', texto: 'Oi, [NOME]!' }];
      if (ctx.primeiraMissao) falas.push({ quem: 'sofia', texto: 'Tudo pronto para a primeira missão? É sobre o seu nome!' });
      return { falas, balao: falas.map((f) => f.texto).join(' '), acao: { rotulo: 'Missão', icone: '▶️', lugar: 'escola' } };
    }
    if (npc.papel === 'tales') {
      const falas = [{ quem: 'tales', texto: 'Oi, [NOME]!' }, { quem: 'tales', texto: 'Vamos brincar com os sons das palavras!' }];
      return { falas, balao: falas.map((f) => f.texto).join(' '), acao: { rotulo: 'Brincar', icone: '🎵', lugar: 'campinho' } };
    }
    if (npc.papel === 'bolota') {
      // o Bolota não fala: o Tales narra (D029 §5)
      const falas = [{ quem: 'tales', texto: 'Pula com a gente, [NOME]!' }];
      return { falas, balao: falas[0].texto, acao: null, pular: true };
    }
    // crianças da vila: só acenam (sem voz própria)
    return { falas: [], balao: '👋', acao: null, acenar: true };
  },
};

/** Elenco padrão: rotas (x, z) por ruas e praças, conferidas contra a colisão ao montar. */
export const ELENCO = [
  { id: 'sofia', nome: 'Sofia', papel: 'sofia', altura: 1.5, velocidade: 1.0, rota: [[-3.5, 14], [3.5, 14], [3.5, 11], [-3.5, 11]] },
  { id: 'tales', nome: 'Tales', papel: 'tales', altura: 1.55, velocidade: 1.25, rota: [[-35, 17], [-29.5, 17], [-29.5, 28], [-35, 28]] },
  { id: 'bolota', nome: 'Bolota', papel: 'bolota', altura: 0.75, velocidade: 1.5, rota: [[-2, 15], [-2, 30], [2, 44], [2, 30]] },
  { id: 'crianca-1', nome: 'Lia', papel: 'crianca', altura: 1.4, velocidade: 1.0, rota: [[14.5, -1], [17.5, -12], [14.5, -14.5]] },
  { id: 'crianca-2', nome: 'Davi', papel: 'crianca', altura: 1.45, velocidade: 1.15, rota: [[-36, 33.5], [-12, 33.5]] },
];

const RESERVA = {
  sofia: { pele: '#E9B48C', camisa: '#F2B33D', calca: '#2E4374', cabelo: '#2B1A12' },
  tales: { pele: '#B27750', camisa: '#5E8FB8', calca: '#3B3F4A', cabelo: '#1E140E' },
  bolota: { pele: '#C99A6A', camisa: '#B98450', calca: '#8A5A3A', cabelo: '#8A5A3A', calcado: '#6E4528' },
  crianca: { pele: '#D9A07A', camisa: '#E58AA6', calca: '#5E8FB8', cabelo: '#3A2416' },
};

export function criarNpcs({ grupo, colisao, menosMovimento = false }) {
  const lista = [];
  let cerebro = CEREBRO_ROTEIRIZADO;
  const _d = new THREE.Vector3();

  function adicionar(def) {
    const b = new Boneco({ altura: def.altura, nome: def.id, menosMovimento });
    b.usarModelo(bonecoReserva(RESERVA[def.papel] || RESERVA.crianca), 1.1);
    const [x, z] = def.rota?.[0] || def.pos || [0, 0];
    b.raiz.position.set(x, colisao.altura(x, z), z);
    grupo.add(b.raiz);
    const npc = { ...def, boneco: b, alvo: 1, espera: Math.random() * 2, giro: 0, vel: 0, estado: 'andando', perto: false, pulo: null, remotoAlvo: null };
    lista.push(npc);
    return npc;
  }

  /** Confere as rotas contra a colisão (aviso no console se algum trecho passa por parede). */
  function conferirRotas() {
    const ruins = [];
    for (const n of lista) {
      const r = n.rota || [];
      for (let i = 0; i < r.length; i++) {
        const a = r[i], b = r[(i + 1) % r.length];
        for (let k = 0; k <= 20; k++) { const x = lerp(a[0], b[0], k / 20), z = lerp(a[1], b[1], k / 20); if (colisao.livre(x, z, 0.25)) { ruins.push(`${n.id} ${i}: (${x.toFixed(1)}, ${z.toFixed(1)})`); break; } }
      }
    }
    if (ruins.length) console.warn('[npcs] rota passando por obstáculo:', ruins.join(' · '));
    return ruins;
  }

  function tick(dt, t, jogador) {
    for (const n of lista) {
      const b = n.boneco, p = b.raiz.position;
      const dj = Math.hypot(jogador.x - p.x, jogador.z - p.z);
      n.perto = dj < 3.2;
      let alvoX = p.x, alvoZ = p.z, quer = 0;
      if (n.remotoAlvo) { alvoX = n.remotoAlvo.x; alvoZ = n.remotoAlvo.z; quer = Math.hypot(alvoX - p.x, alvoZ - p.z) > 0.15 ? 3 : 0; }
      else if (n.estado === 'conversando' || n.perto) { quer = 0; }
      else if (n.espera > 0) { n.espera -= dt; }
      else if (n.rota?.length) {
        const [ax, az] = n.rota[n.alvo];
        alvoX = ax; alvoZ = az;
        if (Math.hypot(ax - p.x, az - p.z) < 0.4) { n.alvo = (n.alvo + 1) % n.rota.length; n.espera = 1 + Math.random() * 2.5; }
        else quer = n.velocidade;
      }
      n.vel = lerp(n.vel, quer, 1 - Math.exp(-dt * 4));
      if (n.vel > 0.05) {
        _d.set(alvoX - p.x, 0, alvoZ - p.z); const d = _d.length();
        if (d > 1e-3) {
          _d.multiplyScalar(1 / d);
          const passo = Math.min(d, n.vel * dt), nx = p.x + _d.x * passo, nz = p.z + _d.z * passo;
          // não atravessa a criança
          if (Math.hypot(jogador.x - nx, jogador.z - nz) > 0.75) { p.x = nx; p.z = nz; }
          n.giro = Math.atan2(_d.x, _d.z);
        }
      } else if (n.perto || n.estado === 'conversando') n.giro = Math.atan2(jogador.x - p.x, jogador.z - p.z);
      // pulo (Bolota pula junto)
      let noAr = false, vy = 0;
      if (n.pulo) { n.pulo.vy -= 22 * dt; n.pulo.y += n.pulo.vy * dt; vy = n.pulo.vy; noAr = true; if (n.pulo.y <= 0) { b.pousar(n.pulo.vy); n.pulo = n.pulo.mais > 0 ? { y: 0, vy: 6.5, mais: n.pulo.mais - 1 } : null; if (n.pulo) b.impulso(); } }
      const chao = colisao.altura(p.x, p.z);
      p.y = chao + (n.pulo ? n.pulo.y : 0);
      b.raiz.rotation.y = girarPara(b.raiz.rotation.y, n.giro, dt * 6);
      b.tick(dt, { vel: n.vel, correr: 3.5, noAr, vy });
      b.sombraEm(n.pulo ? n.pulo.y : 0, false);
      // longe da câmera: sem sombra projetada (desempenho)
      const longe = Math.hypot(jogador.x - p.x, jogador.z - p.z) > 26;
      if (longe !== n.longe) { n.longe = longe; b.sombras = !longe; }
      b.balao.visible = n.perto && n.estado !== 'conversando' && !b.mao.visible;
    }
  }

  return {
    lista,
    adicionar,
    conferirRotas,
    tick,
    definirCerebro(c) { cerebro = c || CEREBRO_ROTEIRIZADO; },
    /** Troca o modelo de um boneco (pacote vindo do app). */
    usarModelo(id, grupoModelo, alturaModelo) { const n = lista.find((x) => x.id === id); if (n) { n.boneco.usarModelo(grupoModelo, alturaModelo); n.boneco.sombras = !n.longe; } },
    /** O boneco mais perto da criança (até `raio` m), ou null. */
    maisPerto(x, z, raio = 3.2) {
      let m = null, md = raio;
      for (const n of lista) { const d = Math.hypot(n.boneco.raiz.position.x - x, n.boneco.raiz.position.z - z); if (d < md) { md = d; m = n; } }
      return m;
    },
    /** Círculos dos bonecos (a criança não atravessa). */
    colide(x, z, r = 0.3) { for (const n of lista) { const p = n.boneco.raiz.position, rr = r + n.altura * 0.22; if ((p.x - x) ** 2 + (p.z - z) ** 2 < rr * rr) return n; } return null; },
    async conversar(n, contexto) {
      n.estado = 'conversando';
      const r = await cerebro.conversar(n, contexto);
      if (r.acenar) n.boneco.acenar();
      if (r.pular) pular(n);
      return r;
    },
    fimConversa(n) { if (n) n.estado = 'andando'; },
    /** A criança acenou: quem está perto acena de volta. */
    tchauPerto(x, z) { for (const n of lista) { const p = n.boneco.raiz.position; if (Math.hypot(p.x - x, p.z - z) < 7) setTimeout(() => n.boneco.acenar(), 250 + Math.random() * 400); } },
    /** A criança pulou: o Bolota (se perto) pula junto. */
    puloPerto(x, z) { for (const n of lista) { const p = n.boneco.raiz.position; if (n.papel === 'bolota' && Math.hypot(p.x - x, p.z - z) < 6) pular(n, 1); } },
    remoto: {
      entrar(id, def) { return adicionar({ id, nome: def.nome || id, papel: def.papel || 'crianca', altura: def.altura || 1.45, velocidade: 3, rota: null, pos: def.pos || [0, 17] }); },
      mover(id, x, z, giro, acao) { const n = lista.find((k) => k.id === id); if (!n) return; n.remotoAlvo = { x, z }; if (giro !== undefined) n.giro = giro; if (acao === 'tchau') n.boneco.acenar(); if (acao === 'pulo') pular(n, 0); },
      sair(id) { const i = lista.findIndex((k) => k.id === id); if (i >= 0) { grupo.remove(lista[i].boneco.raiz); lista.splice(i, 1); } },
    },
  };

  function pular(n, mais = 2) { if (!n.pulo) { n.pulo = { y: 0, vy: 6.5, mais }; n.boneco.impulso(); } }
}

/** Gira `a` em direção a `b` pelo caminho mais curto. */
export function girarPara(a, b, k) {
  let d = b - a; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2;
  return a + d * clamp(k, 0, 1);
}
