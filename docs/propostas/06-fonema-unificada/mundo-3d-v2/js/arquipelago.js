// FONEMA · Mundo 3D v2 — CENA 2: o ARQUIPÉLAGO das regiões R0–R10 (ilhas-bioma em miniatura).
// Região atual brilha (anel + facho de luz); as bloqueadas ficam sob névoa suave com cadeado.
import * as THREE from 'three';
import { Lote, G, M, F, rng, rbox, blobGeo, addRim, addWind, matStd, radialTex, canvasTex, roundRect, lerp, clamp, smooth, mergeGeos, hipRoof, roofGeo } from './kit.js';
import { criarArvores, ipe, coqueiro } from './natureza.js';
import { criarMar } from './agua.js';
import { rotulo } from './personagens.js';
import { P } from './predios.js';

export const REGIOES = [
  { id: 'R0', nome: 'Quintal', icone: '🏡', x: 0, z: 70, r: 24, topo: '#86C46A', lado: '#B98A5A' },
  { id: 'R1', nome: 'Ilha das Vogais', icone: '🗼', x: 62, z: 36, r: 15, topo: '#EBD8A6', lado: '#D9BE86' },
  { id: 'R2', nome: 'Mata Atlântica', icone: '🌿', x: 14, z: -12, r: 26, topo: '#5FAE58', lado: '#9A7048' },
  { id: 'R3', nome: 'Pampa', icone: '🐑', x: -58, z: 24, r: 22, topo: '#A8D47E', lado: '#B48A5E' },
  { id: 'R4', nome: 'Pantanal', icone: '🦩', x: -96, z: -38, r: 24, topo: '#8FC56E', lado: '#8E7050' },
  { id: 'R5', nome: 'Cerrado', icone: '🌼', x: -38, z: -86, r: 22, topo: '#C9C46A', lado: '#B5794A' },
  { id: 'R6', nome: 'Caatinga', icone: '🌵', x: 36, z: -100, r: 22, topo: '#DDB173', lado: '#B67748' },
  { id: 'R7', nome: 'Amazônia', icone: '🌳', x: 104, z: -52, r: 30, topo: '#3F944C', lado: '#7E5B3C' },
  { id: 'R8', nome: 'Litoral', icone: '🏖️', x: 134, z: 22, r: 19, topo: '#EAD49E', lado: '#D2B37C' },
  { id: 'R9', nome: 'Cidade das Letras', icone: '🏙️', x: 96, z: -150, r: 22, topo: '#BFD9A8', lado: '#A98B6C' },
  { id: 'R10', nome: 'Arquipélago dos Livros', icone: '📚', x: -14, z: -170, r: 24, topo: '#9FD08A', lado: '#9A7652' },
];

/** Ilha arredondada: cúpula achatada por cima, base que afunda, cor por altura (areia, barranco, topo). */
function ilhaGeo(seed) {
  let g = blobGeo(seed, 4, 0.16).clone();
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) { const y = p.getY(i), rho = Math.min(1, Math.hypot(p.getX(i), p.getZ(i)) / 0.5); p.setY(i, y > 0 ? 0.06 * (1 - Math.pow(rho, 8)) : y * 0.55); }
  g.computeVertexNormals();
  return g;
}

export async function criarArquipelago({ U, q, regiaoAtual = 'R0' }) {
  const grupo = new THREE.Group(); grupo.name = 'arquipelago';
  const r = rng(99);
  const iAtual = Math.max(0, REGIOES.findIndex((x) => x.id === regiaoAtual));
  const C = new Lote(11), Fo = new Lote(12), J = new Lote(13);
  const ctx = { C, Fo, J, petalas: [], flores: [], arbustos: [] };
  const arv = criarArvores(U, q);
  const matCorpo = addRim(matStd(), '#FFE4BE', 0.22);
  const extras = [];

  for (const [i, R] of REGIOES.entries()) {
    const areia = '#EED9A8', sx = R.r * 2.25;
    // ilha: topo + praia + barranco (cores por altura)
    const cTop = new THREE.Color(R.topo), cLado = new THREE.Color(R.lado), cAreia = new THREE.Color(areia), tmp = new THREE.Color();
    C.add(ilhaGeo(i * 7 + 3), R.topo, M(R.x, 0.6, R.z, 0, r() * 6, 0, sx, 9, sx), { fc: (x, y) => (y > 0.85 ? tmp.copy(cTop) : y > 0.15 ? tmp.copy(cAreia).lerp(cTop, smooth(clamp((y - 0.15) / 0.7, 0, 1))) : y > -0.8 ? tmp.copy(cAreia) : tmp.copy(cLado)) });
    const L = F(R.x, 1.15, R.z, 0);
    const pr = (k) => { const a = r() * Math.PI * 2, d = Math.sqrt(r()) * R.r * k; return [Math.cos(a) * d, Math.sin(a) * d]; };
    switch (R.id) {
      case 'R0': {
        // mini vila: coreto, casinhas coloridas, escola, ipês
        C.add(new THREE.CylinderGeometry(2.6, 2.8, 0.5, 8), P.pedra, L(0, 0.2, 0));
        C.add(new THREE.ConeGeometry(3.0, 2.2, 8), P.telha, L(0, 3.4, 0)); for (let k = 0; k < 8; k++) C.add(G.cyl10, '#fff', L(Math.cos(k * 0.785) * 2.2, 1.4, Math.sin(k * 0.785) * 2.2, 0, 0, 0, 0.18, 2.4, 0.18));
        const cores = ['#F6CD62', '#9FD0EA', '#F2A884', '#BFE2A5', '#FFF1D6', '#EDB9C8'];
        for (let k = 0; k < 9; k++) { const a = k / 9 * Math.PI * 2, d = 10 + (k % 2) * 3; const H = F(R.x + Math.cos(a) * d, 1.15, R.z + Math.sin(a) * d, -a - Math.PI / 2);
          C.add(rbox(3.4, 2.4, 3.0, 0.15), cores[k % cores.length], H(0, 1.2, 0)); C.add(roofGeo(3.0, 1.4, 3.4, 0.3), P.telha, H(0, 2.4, 0, 0, Math.PI / 2, 0)); J.add(rbox(0.8, 0.9, 0.1, 0.05), P.vidro, H(0.7, 1.4, 1.5)); C.add(rbox(0.7, 1.3, 0.1, 0.05), P.madeira, H(-0.7, 0.65, 1.5)); }
        C.add(rbox(8, 4.2, 4, 0.2), '#FCF8F0', L(0, 2.1, -17)); C.add(roofGeo(4, 1.8, 8, 0.4), P.telha, L(0, 4.2, -17, 0, Math.PI / 2, 0)); C.add(rbox(1.6, 2.4, 1.6, 0.1), '#FCF8F0', L(0, 5.5, -17)); C.add(hipRoof(1.6, 1.2, 1.6, 0.3), P.telha, L(0, 6.7, -17));
        for (const [x, z] of [[-6, 5], [6, -5], [-14, -8], [15, 7]]) ipe(ctx, R.x + x, 1.15, R.z + z, 0.55, x * 3 + 1);
        for (let k = 0; k < 18; k++) { const [x, z] = pr(0.95); if (Math.hypot(x, z) < 17) continue; arv.add(R.x + x, 1.1, R.z + z, 0.55 + r() * 0.3); }
        break;
      }
      case 'R1': {
        // farol branco e azul-marinho (2 cores) + coqueiros + 5 blocos das vogais
        const fx = 5, fz = -4;
        for (let k = 0; k < 6; k++) C.add(new THREE.CylinderGeometry(1.5 - k * 0.13, 1.6 - k * 0.13, 1.6, 20), k % 2 ? P.marinho : '#FFFFFF', L(fx, 0.8 + k * 1.6, fz));
        C.add(new THREE.CylinderGeometry(1.4, 1.4, 0.3, 20), P.marinho, L(fx, 10.4, fz)); J.add(new THREE.CylinderGeometry(0.9, 0.9, 1.4, 16), '#FFE7A8', L(fx, 11.2, fz)); C.add(new THREE.ConeGeometry(1.3, 1.4, 20), P.marinho, L(fx, 12.6, fz));
        extras.push({ tipo: 'farol', pos: L.pt(fx, 11.2, fz) });
        for (const [x, z] of [[-7, 4], [-4, 8], [8, 6]]) coqueiro(ctx, R.x + x, 1.1, R.z + z, 0.6, x * 9 + z);
        ['A', 'E', 'I', 'O', 'U'].forEach((v, k) => { C.add(rbox(1.6, 1.6, 1.6, 0.25), '#8F7FC8', L(-8 + k * 2.2, 0.8, -6 + (k % 2) * 1.2, 0, k * 0.3, 0)); extras.push({ tipo: 'letra', txt: v, pos: L.pt(-8 + k * 2.2, 2.4, -6 + (k % 2) * 1.2) }); });
        break;
      }
      case 'R2': {
        // montanha da mata com cachoeira e lago
        C.add(blobGeo(41, 3, 0.25), '#4E9B50', L(-4, 2, -6, 0, 0, 0, 22, 22, 18), { top: '#6FB862', grad: 0.25 });
        C.add(new THREE.CylinderGeometry(5.0, 5.0, 0.3, 28), '#5FC8D8', L(6, 0.05, 8));
        extras.push({ tipo: 'cachoeira', de: L.pt(0.5, 10.5, 2.2), ate: L.pt(4.5, 0.4, 6.5) });
        for (let k = 0; k < 120; k++) { const [x, z] = pr(0.95); if (Math.hypot(x - 6, z - 8) < 5.5) continue; const hh = Math.max(0, 9 - Math.hypot(x + 4, (z + 6) * 1.2) * 0.8); arv.add(R.x + x, 1.1 + hh, R.z + z, 0.5 + r() * 0.4, ['#3F8F4F', '#4FA25A', '#2F7A44'][k % 3]); }
        break;
      }
      case 'R3': {
        // pampa: coxilhas, cerca, ovelhinhas, catavento e umbu
        for (let k = 0; k < 14; k++) { const [x, z] = pr(0.75); C.add(blobGeo(k, 2, 0.15), '#FFFFFF', L(x, 0.6, z, 0, r() * 6, 0, 1.4, 1.0, 1.0)); C.add(G.sph, '#3B3F4A', L(x + 0.7, 0.75, z, 0, 0, 0, 0.5)); }
        for (let k = 0; k < 16; k++) C.add(rbox(0.2, 1.0, 0.2, 0.05), P.madeira, L(-14 + k * 1.8, 0.5, 10));
        C.add(rbox(28, 0.12, 0.08, 0.03), P.madeira, L(-0.5, 0.75, 10));
        C.add(G.cyl10, P.ferro, L(8, 4, -6, 0, 0, 0, 0.3, 8, 0.3)); for (let k = 0; k < 6; k++) C.add(rbox(0.3, 2.6, 0.06, 0.03), '#E9EEF2', L(8, 8 + Math.cos(k * 1.047) * 1.3, -5.7 + 0, k * 1.047, 0, 0).multiply(M(0, 1.3, 0)));
        arv.add(R.x - 8, 1.1, R.z - 6, 1.1, '#4F9A4F');
        break;
      }
      case 'R4': {
        // pantanal: lagoas, palafita, tuiuiús
        for (let k = 0; k < 5; k++) { const [x, z] = pr(0.65); C.add(new THREE.CylinderGeometry(3 + r() * 2.5, 3 + r() * 2.5, 0.25, 24), '#62C3D2', L(x, 0.02, z, 0, 0, 0, 1, 1, 0.7)); }
        const Pf = F(R.x + 6, 1.15, R.z - 6, 0.5);
        for (const x of [-1.6, 1.6]) for (const z of [-1.4, 1.4]) C.add(G.cyl10, P.madeiraEsc, Pf(x, 1.0, z, 0, 0, 0, 0.25, 2.0, 0.25));
        C.add(rbox(4.2, 2.2, 3.6, 0.12), P.madeiraClara, Pf(0, 3.1, 0)); C.add(roofGeo(3.6, 1.6, 4.4, 0.4), '#C9A55A', Pf(0, 4.2, 0, 0, Math.PI / 2, 0));
        for (let k = 0; k < 5; k++) { const [x, z] = pr(0.7); const B = F(R.x + x, 1.15, R.z + z, r() * 6); C.add(G.sph, '#FFFFFF', B(0, 1.6, 0, 0, 0, 0, 0.9, 0.7, 1.2)); C.add(G.cyl10, '#2B2B33', B(0, 2.4, 0.5, 0.3, 0, 0, 0.18, 1.4, 0.18)); C.add(G.torus, '#D64A3A', B(0, 2.0, 0.42, Math.PI / 2 - 0.3, 0, 0, 0.3, 0.3, 0.3)); C.add(G.cone, '#2B2B33', B(0, 3.1, 0.85, 1.4, 0, 0, 0.18, 1.0, 0.18)); for (const s of [-0.2, 0.2]) C.add(G.cyl10, '#2B2B33', B(s, 0.6, 0, 0, 0, 0, 0.06, 1.2, 0.06)); }
        for (let k = 0; k < 40; k++) { const [x, z] = pr(0.95); arv.add(R.x + x, 1.1, R.z + z, 0.45 + r() * 0.3, ['#5DB060', '#6CBB5E'][k % 2]); }
        break;
      }
      case 'R5': {
        // cerrado: árvores tortas, ipês amarelo e rosa, cupinzeiros
        for (const [x, z, c1, c2] of [[-6, 4, '#F5C033', '#F9D864'], [7, -5, '#E58AA6', '#F2B2C6'], [3, 9, '#F5C033', '#F9D864'], [-9, -8, '#E58AA6', '#F2B2C6']]) ipe(ctx, R.x + x, 1.1, R.z + z, 0.62, x * 5 + z, c1, c2);
        for (let k = 0; k < 7; k++) { const [x, z] = pr(0.8); C.add(G.cone, '#B9784B', L(x, 1.0, z, 0, 0, 0, 1.4, 2.6, 1.4)); }
        for (let k = 0; k < 26; k++) { const [x, z] = pr(0.95); arv.add(R.x + x, 1.1, R.z + z, 0.45 + r() * 0.3, ['#8DB55C', '#7AA555'][k % 2]); }
        break;
      }
      case 'R6': {
        // caatinga: mandacarus, pedras, casinha de taipa
        for (let k = 0; k < 9; k++) { const [x, z] = pr(0.8); const K = F(R.x + x, 1.1, R.z + z, r() * 6), s = 0.7 + r() * 0.5;
          C.add(G.capsule, '#5D9B5A', K(0, 2.4 * s, 0, 0, 0, 0, 0.9 * s, 3.0 * s, 0.9 * s));
          for (const sd of [-1, 1]) { C.add(G.capsule, '#5D9B5A', K(sd * 1.0 * s, 2.0 * s, 0, 0, 0, sd * 1.57, 0.6 * s, 0.6 * s, 0.6 * s)); C.add(G.capsule, '#5D9B5A', K(sd * 1.45 * s, 3.0 * s, 0, 0, 0, 0, 0.6 * s, 1.4 * s, 0.6 * s)); } }
        for (let k = 0; k < 10; k++) { const [x, z] = pr(0.9); C.add(blobGeo(k + 60, 2, 0.3), '#C9B8A0', L(x, 0.3, z, 0, r() * 6, 0, 1.5 + r() * 2, 1 + r(), 1.5 + r() * 2)); }
        const H = F(R.x - 5, 1.15, R.z + 5, 0.8); C.add(rbox(5, 2.8, 4, 0.2), '#E7B98A', H(0, 1.4, 0)); C.add(roofGeo(4, 1.4, 5, 0.4), P.telha, H(0, 2.8, 0, 0, Math.PI / 2, 0)); C.add(rbox(1, 1.8, 0.1, 0.05), P.marinho, H(0, 0.9, 2.0));
        break;
      }
      case 'R7': {
        // amazônia: floresta densa com árvores emergentes e rio
        C.add(rbox(R.r * 1.7, 0.25, 4, 1.9), '#4DB5C9', L(0, 0.0, 0, 0, 0.5, 0));
        for (let k = 0; k < 170; k++) { const [x, z] = pr(0.97); if (Math.abs((x * Math.sin(0.5) + z * Math.cos(0.5))) < 3.5) continue; arv.add(R.x + x, 1.1, R.z + z, 0.6 + r() * 0.5 + (k % 17 === 0 ? 0.8 : 0), ['#2F7A44', '#3F8F4F', '#2B6E3E', '#4FA25A'][k % 4]); }
        break;
      }
      case 'R8': {
        // litoral: coqueiros, guarda-sóis (branco e marinho) e jangada
        for (const [x, z] of [[-8, -4], [-4, -9], [3, -8], [9, -2], [-10, 4]]) coqueiro(ctx, R.x + x, 1.1, R.z + z, 0.62, x * 7 + z * 3);
        for (const [x, z] of [[2, 4], [-3, 6], [7, 6]]) { C.add(G.cyl10, '#fff', L(x, 1.3, z, 0, 0, 0, 0.1, 2.6, 0.1)); C.add(new THREE.ConeGeometry(1.6, 0.8, 8), x > 0 ? P.marinho : '#FFFFFF', L(x, 2.7, z)); }
        const Jg = F(R.x + 22, 0.2, R.z + 10, 0.6); for (let k = 0; k < 6; k++) C.add(G.cyl10, P.madeiraClara, Jg(0, 0, -1.2 + k * 0.48, 0, 0, Math.PI / 2, 0.42, 4.5, 0.42)); C.add(G.cyl10, P.madeiraEsc, Jg(0, 2.2, 0, 0, 0, 0, 0.1, 4.4, 0.1));
        { const s = new THREE.Shape(); s.moveTo(0, 0); s.lineTo(0, 3.6); s.lineTo(2.4, 0.2); s.lineTo(0, 0); C.add(new THREE.ExtrudeGeometry(s, { depth: 0.05, bevelEnabled: false }), '#FFFFFF', Jg(0.1, 0.6, 0, 0, Math.PI / 2, 0)); }
        extras.push({ tipo: 'jangada', obj: null });
        break;
      }
      case 'R9': {
        // cidade das letras: prédios arredondados com letras no telhado
        const cores = ['#9FD0EA', '#F6CD62', '#F2A884', '#BFE2A5', '#FFF1D6', '#B9D7F0'];
        let k = 0;
        for (let gx = -2; gx <= 2; gx++) for (let gz = -2; gz <= 2; gz++) {
          if (Math.hypot(gx, gz) > 2.3 || (gx === 0 && gz === 0)) continue;
          const h = 4 + ((gx * 7 + gz * 13 + 20) % 5) * 1.6, x = gx * 5.2, z = gz * 5.2;
          C.add(rbox(3.8, h, 3.8, 0.45), cores[k % cores.length], L(x, h / 2, z), { grad: 0.2 });
          for (let f = 1; f < h / 1.6; f++) for (const s of [-0.9, 0.9]) J.add(rbox(0.8, 0.8, 0.1, 0.05), P.vidro, L(x + s, f * 1.6, z + 1.92));
          if (k % 2 === 0) extras.push({ tipo: 'letra', txt: 'BCDFGJLMNPRSTVZ'[k % 15], pos: L.pt(x, h + 1.2, z) });
          k++;
        }
        C.add(G.cyl, '#E9EEF2', L(0, 0.15, 0, 0, 0, 0, 7, 0.3, 7));
        break;
      }
      case 'R10': {
        // arquipélago dos livros: pilhas de livros gigantes (2 cores por livro)
        const capas = [P.marinho, P.terracota, P.verdeMata, P.ipe];
        for (const [x, z, n] of [[-6, -3, 5], [5, 4, 4], [8, -7, 3], [-4, 8, 3]]) for (let k = 0; k < n; k++) { const B = F(R.x + x, 1.15 + k * 1.3, R.z + z, k * 0.35 + x); C.add(rbox(6 - k * 0.5, 1.2, 4.5 - k * 0.3, 0.2), capas[(k + Math.abs(x)) % 4], B(0, 0.6, 0)); C.add(rbox(5.8 - k * 0.5, 0.95, 4.4 - k * 0.3, 0.1), '#FFF6E3', B(0.15, 0.6, 0)); }
        const Lb = F(R.x, 1.4, R.z - 14, 0.2); for (const s of [-1, 1]) { C.add(rbox(4, 0.3, 5, 0.15), P.marinho, Lb(s * 2, 0.4, 0, 0, 0, s * 0.25)); C.add(rbox(3.8, 0.3, 4.8, 0.1), '#FFF6E3', Lb(s * 1.95, 0.65, 0, 0, 0, s * 0.25)); }
        for (let k = 0; k < 16; k++) { const [x, z] = pr(0.95); if (Math.hypot(x + 6, z + 3) < 4 || Math.hypot(x - 5, z - 4) < 4) continue; arv.add(R.x + x, 1.1, R.z + z, 0.5 + r() * 0.3); }
        break;
      }
    }
  }
  // ilhotas extras (só cenário)
  for (let k = 0; k < 9; k++) { const a = r() * Math.PI * 2, d = 230 + r() * 90; const x = Math.cos(a) * d, z = Math.sin(a) * d - 40; C.add(ilhaGeo(100 + k), '#8CC46B', M(x, 0.4, z, 0, r() * 6, 0, 14 + r() * 14, 6, 14 + r() * 14), { fc: (xx, y) => new THREE.Color(y > 0.6 ? '#8CC46B' : '#EED9A8') }); for (let t = 0; t < 4; t++) arv.add(x + (r() - 0.5) * 10, 1.0, z + (r() - 0.5) * 10, 0.7); }

  const corpo = C.build(matCorpo); grupo.add(corpo);
  const folhas = Fo.build(addRim(addWind(matStd({ roughness: 0.8 }), U, 0.012, 3), '#FFF2B0', 0.28)); grupo.add(folhas);
  const matJan = matStd({ emissive: new THREE.Color('#FFC27A'), emissiveIntensity: 0, roughness: 0.3 });
  if (!J.vazio) grupo.add(J.build(matJan, { cast: false }));
  arv.build(grupo, q === 'baixo' ? 0.6 : 1);
  if (ctx.petalas.length) { const pet = new THREE.InstancedMesh(new THREE.CircleGeometry(0.5, 6).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ color: '#fff' }), ctx.petalas.length); ctx.petalas.forEach((p, i) => { pet.setMatrixAt(i, p.m); pet.setColorAt(i, new THREE.Color(p.c)); }); grupo.add(pet); }

  // mar
  const mar = criarMar({ U, ilhas: REGIOES.map((R) => ({ x: R.x, z: R.z, r: R.r * 1.02 })) });
  mar.position.y = 0; grupo.add(mar);

  // rotas de boias entre regiões (douradas até a atual, brancas depois)
  const boia = new THREE.InstancedMesh(G.sph, new THREE.MeshStandardMaterial({ color: '#fff', roughness: 0.4 }), 400); let nb = 0;
  for (let i = 0; i < REGIOES.length - 1; i++) {
    const A = REGIOES[i], B = REGIOES[i + 1], mid = new THREE.Vector3((A.x + B.x) / 2 + (B.z - A.z) * 0.18, 0, (A.z + B.z) / 2 - (B.x - A.x) * 0.18);
    const cv = new THREE.QuadraticBezierCurve3(new THREE.Vector3(A.x, 0, A.z), mid, new THREE.Vector3(B.x, 0, B.z));
    const len = cv.getLength(), n = Math.floor(len / 6);
    for (let k = 0; k <= n; k++) { const p = cv.getPointAt(k / n); if (Math.hypot(p.x - A.x, p.z - A.z) < A.r + 3 || Math.hypot(p.x - B.x, p.z - B.z) < B.r + 3) continue; if (nb >= 400) break; boia.setMatrixAt(nb, M(p.x, 0.3, p.z, 0, 0, 0, i < iAtual ? 1.3 : 0.8)); boia.setColorAt(nb, new THREE.Color(i < iAtual ? '#F2B33D' : '#FFFFFF')); nb++; }
  }
  boia.count = nb; grupo.add(boia);

  // letras flutuantes (vogais, cidade das letras)
  for (const e of extras.filter((e) => e.tipo === 'letra')) {
    const t = canvasTex(128, 128, (g) => { g.fillStyle = '#FFF8E7'; roundRect(g, 8, 8, 112, 112, 26); g.fill(); g.fillStyle = '#2E4374'; g.font = '700 92px Andika, Fredoka, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(e.txt, 64, 70); });
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, toneMapped: false, alphaTest: 0.05 })); s.scale.set(1.8, 1.8, 1); s.position.copy(e.pos); s.userData.y0 = e.pos.y; grupo.add(s); e.obj = s;
  }
  // cachoeira (fita animada)
  const cach = extras.find((e) => e.tipo === 'cachoeira');
  let cachMat = null;
  if (cach) {
    const pts = [cach.de, cach.de.clone().lerp(cach.ate, 0.5).add(new THREE.Vector3(0.6, 1.2, 0.4)), cach.ate];
    const cv = new THREE.CatmullRomCurve3(pts), geo = new THREE.TubeGeometry(cv, 30, 1.2, 8).scale(1, 1, 1);
    cachMat = new THREE.ShaderMaterial({ uniforms: { uTime: U.time }, transparent: true, depthWrite: false,
      vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
      fragmentShader: 'uniform float uTime; varying vec2 vUv; void main(){ float s = fract(vUv.x * 6.0 - uTime * 1.4 + sin(vUv.y * 12.0) * 0.08); vec3 c = mix(vec3(0.55,0.86,0.95), vec3(1.0), smoothstep(0.55, 0.9, s)); gl_FragColor = vec4(c, 0.92); }' });
    grupo.add(new THREE.Mesh(geo, cachMat));
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: radialTex('rgba(255,255,255,0.9)', 'rgba(255,255,255,0)'), transparent: true, depthWrite: false })); sp.position.copy(cach.ate).add(new THREE.Vector3(0, 0.8, 0)); sp.scale.set(6, 3, 1); grupo.add(sp);
  }
  // facho do farol
  const farol = extras.find((e) => e.tipo === 'farol');
  const fachoMat = new THREE.MeshBasicMaterial({ color: '#FFF1C4', transparent: true, opacity: 0.18, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false });
  const facho = new THREE.Mesh(new THREE.ConeGeometry(4, 40, 24, 1, true).translate(0, -20, 0).rotateZ(Math.PI / 2), fachoMat);
  if (farol) { facho.position.copy(farol.pos); grupo.add(facho); }

  // estado por região: atual (anel + facho), feita (bandeira), bloqueada (névoa + cadeado)
  const nevoaTex = radialTex('rgba(255,255,255,0.95)', 'rgba(255,255,255,0)');
  const cadeadoTex = canvasTex(256, 256, (g) => {
    g.fillStyle = 'rgba(255,250,240,0.96)'; g.beginPath(); g.arc(128, 128, 118, 0, 7); g.fill();
    g.strokeStyle = '#8A8EA0'; g.lineWidth = 22; g.beginPath(); g.arc(128, 108, 42, Math.PI, 0); g.stroke();
    g.fillStyle = '#F2B33D'; roundRect(g, 66, 108, 124, 92, 22); g.fill(); g.fillStyle = '#B07C1E'; g.beginPath(); g.arc(128, 146, 14, 0, 7); g.fill(); g.fillRect(122, 150, 12, 28);
  });
  const anim = [], hits = [], rotulos = [];
  REGIOES.forEach((R, i) => {
    const estado = i < iAtual ? 'feita' : i === iAtual ? 'atual' : 'bloqueada';
    R.estado = estado;
    const lab = rotulo(R.nome, { icone: estado === 'bloqueada' ? '🔒' : estado === 'feita' ? '⭐' : R.icone, escala: 3.4, cor: estado === 'bloqueada' ? '#6B7088' : '#2E4374' });
    lab.position.set(R.x, R.id === 'R2' ? 34 : 22, R.z); grupo.add(lab); rotulos.push(lab);
    const hit = new THREE.Mesh(new THREE.CylinderGeometry(R.r, R.r, 30, 16), new THREE.MeshBasicMaterial({ visible: false })); hit.position.set(R.x, 10, R.z); hit.userData.regiao = { ...R, estado }; grupo.add(hit); hits.push(hit);
    if (estado === 'bloqueada') {
      const nv = [];
      for (let k = 0; k < 7; k++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: nevoaTex, transparent: true, depthWrite: false, opacity: 0.5, color: '#F4F7FA', fog: false })); const a = k / 7 * Math.PI * 2; s.position.set(R.x + Math.cos(a) * R.r * 0.45, 5 + (k % 3) * 2.2, R.z + Math.sin(a) * R.r * 0.45); s.scale.set(R.r * 1.25, R.r * 0.7, 1); grupo.add(s); nv.push(s); }
      const cad = new THREE.Sprite(new THREE.SpriteMaterial({ map: cadeadoTex, toneMapped: false, fog: false, alphaTest: 0.05 })); cad.scale.set(10, 10, 1); cad.position.set(R.x, 12, R.z); grupo.add(cad);
      anim.push((t) => { nv.forEach((s, k) => { s.position.y = 5 + (k % 3) * 2.2 + Math.sin(t * 0.4 + k) * 0.6; s.material.rotation = t * 0.03 * (k % 2 ? 1 : -1); }); cad.position.y = 12 + Math.sin(t * 1.2 + i) * 0.4; });
    } else if (estado === 'atual') {
      const anelM = new THREE.Mesh(new THREE.TorusGeometry(R.r * 1.12, 0.7, 12, 96), new THREE.MeshStandardMaterial({ color: '#FFD66B', emissive: '#FFC94A', emissiveIntensity: 2.2 })); anelM.rotation.x = Math.PI / 2; anelM.position.set(R.x, 0.4, R.z); grupo.add(anelM);
      const beam = new THREE.Mesh(new THREE.CylinderGeometry(3, 6, 60, 24, 1, true), new THREE.MeshBasicMaterial({ color: '#FFE9A8', transparent: true, opacity: 0.16, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false })); beam.position.set(R.x, 30, R.z); grupo.add(beam);
      anim.push((t) => { const k = 1 + Math.sin(t * 2.4) * 0.04; anelM.scale.set(k, k, 1); anelM.material.emissiveIntensity = 1.8 + Math.sin(t * 2.4) * 0.6; beam.material.opacity = 0.12 + Math.sin(t * 2.4) * 0.04; });
    } else {
      const F2 = F(R.x + R.r * 0.6, 1.1, R.z - R.r * 0.3, 0); const mastro = new THREE.Mesh(G.cyl10, new THREE.MeshStandardMaterial({ color: '#fff' })); mastro.applyMatrix4(F2(0, 2, 0, 0, 0, 0, 0.12, 4, 0.12)); grupo.add(mastro);
      const fl = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 1.1).translate(0.9, 0, 0), new THREE.MeshStandardMaterial({ color: '#F2B33D', side: THREE.DoubleSide, emissive: '#F2B33D', emissiveIntensity: 0.2 })); fl.position.copy(F2.pt(0.06, 3.4, 0)); grupo.add(fl);
      anim.push((t) => { fl.rotation.y = Math.sin(t * 2 + i) * 0.3; });
    }
  });

  return {
    grupo, regioes: REGIOES, hits, mar,
    tick(t, cam) {
      anim.forEach((f) => f(t));
      for (const e of extras) if (e.tipo === 'letra' && e.obj) e.obj.position.y = e.obj.userData.y0 + Math.sin(t * 1.5 + e.pos.x) * 0.3;
      facho.rotation.y = t * 0.7;
    },
  };
}
