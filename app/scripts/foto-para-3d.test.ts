import { describe, expect, it } from 'vitest';
import { inflateRawSync } from 'node:zlib';
import { montarZip } from '../web/src/servicos/pacote-audios.ts';
import { abrirPacoteGeral } from '../web/src/servicos/pacote.ts';
import { escreverGLB, montarRelevo, recortarFundo } from '../web/src/telas/admin/foto3d/relevo.ts';
import { lerPedido, pacoteDoModelo } from './foto-para-3d.ts';

const txt = (o: unknown) => new TextEncoder().encode(JSON.stringify(o));
function glbDeTeste() {
  const w = 40, h = 40, px = new Uint8Array(w * h * 4).fill(255);
  for (let y = 10; y < 30; y++) for (let x = 12; x < 28; x++) { const i = (y * w + x) * 4; px[i] = 30; px[i + 1] = 90; px[i + 2] = 200; }
  return escreverGLB(montarRelevo(recortarFundo(px, w, h), { celulas: 20 }), new Uint8Array([1, 2, 3]), 'image/png', 'bloco', true);
}
const pedidoBase = { formato: 'fonema-pedido-foto-3d', versao: 1, nome: 'Bloco', slug: 'bloco', destino: 'novo', caminho: 'modelos3d/itens/bloco', confirmouQueNaoEhPessoa: true, criadoEm: '2026-11-18T10:00:00Z' };

describe('foto-para-3d (pedido → pacote do gerenciador)', () => {
  it('lê o pedido e devolve um pacote que o importador aceita', () => {
    const glb = glbDeTeste();
    const zip = montarZip([{ nome: 'pedido.json', dados: txt(pedidoBase) }, { nome: 'foto-recortada.png', dados: new Uint8Array([137, 80, 78, 71]) }, { nome: 'relevo.glb', dados: glb }]);
    const { pedido, relevo } = lerPedido(zip);
    expect(pedido.slug).toBe('bloco');
    expect(relevo?.length).toBe(glb.length);
    const pacote = abrirPacoteGeral(pacoteDoModelo(pedido, relevo!), (d) => new Uint8Array(inflateRawSync(d)));
    expect(pacote.pacote.midias.map((m) => m.caminho)).toEqual(['modelos3d/itens/bloco.glb']);
  });

  it('recusa pedido sem a confirmação de que não é foto de pessoa, e caminho fora de modelos3d', () => {
    const sem = montarZip([{ nome: 'pedido.json', dados: txt({ ...pedidoBase, confirmouQueNaoEhPessoa: false }) }, { nome: 'foto-recortada.png', dados: new Uint8Array([1]) }]);
    expect(() => lerPedido(sem)).toThrow(/não é de pessoa/);
    const fora = montarZip([{ nome: 'pedido.json', dados: txt({ ...pedidoBase, caminho: 'figuras/uva' }) }, { nome: 'foto-recortada.png', dados: new Uint8Array([1]) }]);
    expect(() => lerPedido(fora)).toThrow(/não permitido/);
    expect(() => pacoteDoModelo(lerPedido(montarZip([{ nome: 'pedido.json', dados: txt(pedidoBase) }, { nome: 'foto-recortada.png', dados: new Uint8Array([1]) }])).pedido, new Uint8Array(30))).toThrow(/GLB/);
  });
});
