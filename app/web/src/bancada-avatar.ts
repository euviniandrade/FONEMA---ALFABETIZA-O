/**
 * Bancada do avatar 3D (fora do app publicado): desenha o boneco com qualquer combinação de pele, olhos, cabelo e
 * cor de cabelo, de frente, de lado, de costas ou bem de perto do rosto. Usada pelas capturas de conferência
 * (`node web/e2e/folha-avatar.mjs`): `window.desenharAvatar(opcoes)` devolve a imagem (data URL).
 */
import * as THREE from 'three';
import { resolverAparencia } from './avatar3d/modelo.ts';
import { Boneco, Cena } from './avatar3d/motor3d.ts';
import { AVATAR_PADRAO } from '@fonema/motor';
import type { Genero } from '@fonema/conteudo';

interface Opcoes { sexo: Genero; pele?: string | null; olhos?: string | null; corCabelo?: string | null; cabelo?: string | null; penteado?: string | null; vista?: 'frente' | 'lado' | 'costas' | 'tres-quartos' | 'rosto' | 'olho' | 'busto' | 'busto-lado' | 'busto-costas'; largura?: number; altura?: number; acessibilidade?: string[] }

const canvas = document.createElement('canvas');
document.getElementById('raiz')!.append(canvas);
const cena = new Cena(canvas, { sombras: false, ambiente: true });

async function desenharAvatar(o: Opcoes): Promise<string> {
  const largura = o.largura ?? 400, altura = o.altura ?? 520;
  const a = resolverAparencia({ ...AVATAR_PADRAO, pele: o.pele ?? null, olhos: o.olhos ?? null, corCabelo: o.corCabelo ?? null, cabelo: o.cabelo ?? null, acessibilidade: o.acessibilidade ?? [], pronto: true }, o.sexo);
  if (o.penteado !== undefined) a.penteado = o.penteado;
  const boneco = new Boneco();
  await boneco.aplicar(a);
  boneco.parado();
  const vista = o.vista ?? 'frente';
  boneco.raiz.rotation.y = { frente: 0, lado: Math.PI / 2, costas: Math.PI, 'tres-quartos': 0.6, rosto: 0.15, olho: 0, busto: 0.28, 'busto-lado': Math.PI / 2, 'busto-costas': Math.PI * 0.85 }[vista];
  cena.cena.add(boneco.raiz);
  cena.renderizador.setPixelRatio(1);
  cena.renderizador.setSize(largura, altura, false);
  if (vista === 'rosto' || vista === 'olho') {
    cena.enquadrar('busto', largura / altura);
    const perto = vista === 'olho' ? 0.5 : 0.95;
    const alvo = new THREE.Vector3(0, vista === 'olho' ? 0.86 : 0.87, 0);
    cena.camera.position.set(0, alvo.y + 0.01, perto);
    cena.camera.lookAt(alvo);
    cena.camera.updateProjectionMatrix();
  } else cena.enquadrar(vista.startsWith('busto') ? 'busto' : 'corpo', largura / altura);
  cena.desenhar();
  const url = canvas.toDataURL('image/png');
  cena.cena.remove(boneco.raiz);
  boneco.descartar();
  return url;
}

Object.assign(window, { desenharAvatar });
document.title += ' · pronta';
