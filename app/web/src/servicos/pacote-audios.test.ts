import { describe, expect, it } from 'vitest';
import { inflateRawSync, deflateRawSync } from 'node:zlib';
import { abrirPacote, crc32, lerZip, montarPacote, montarZip, nomeNoPacote, slugDoFonema } from './pacote-audios.ts';
import { PROVEDORES, ProvedorRemotoAudios } from './provedor-audios.ts';

const bytes = (s: string) => new TextEncoder().encode(s);

describe('pacote de áudios (publicar para todos sem servidor)', () => {
  it('CRC-32 confere com o valor conhecido', () => {
    expect(crc32(bytes('123456789'))).toBe(0xcbf43926);
  });
  it('zip montado é lido de volta igual (nomes UTF-8)', () => {
    const zip = montarZip([{ nome: 'a.txt', dados: bytes('olá') }, { nome: 'audios/ç.bin', dados: new Uint8Array([1, 2, 3]) }]);
    const lido = lerZip(zip);
    expect(lido.map((a) => a.nome)).toEqual(['a.txt', 'audios/ç.bin']);
    expect(new TextDecoder().decode(lido[0].dados)).toBe('olá');
    expect([...lido[1].dados]).toEqual([1, 2, 3]);
  });
  it('lê zip com compressão (deflate) quando recebe a função de descompactar; sem ela, avisa', () => {
    const dados = bytes('x'.repeat(500));
    const comp = deflateRawSync(dados);
    const zip = montarZip([{ nome: 'x.txt', dados: comp }]);
    // vira "deflate": método 8 no cabeçalho local e no central, tamanho descompactado no central
    const v = new DataView(zip.buffer);
    v.setUint16(8, 8, true);
    const c = zip.length - 22 - (46 + 5);
    v.setUint16(c + 10, 8, true);
    v.setUint32(c + 16, crc32(dados), true);
    v.setUint32(c + 24, dados.length, true);
    expect(() => lerZip(zip)).toThrow(/Compressão/);
    expect(new TextDecoder().decode(lerZip(zip, (d) => inflateRawSync(d))[0].dados)).toBe('x'.repeat(500));
  });
  it('zip estragado é recusado', () => {
    const zip = montarZip([{ nome: 'a.txt', dados: bytes('abc') }]);
    zip[30 + 5] ^= 0xff; // muda um byte do conteúdo
    expect(() => lerZip(zip)).toThrow(/corrompido/);
    expect(() => lerZip(bytes('não é zip'))).toThrow(/zip/);
  });
  it('nomes de arquivo legíveis e seguros', () => {
    expect(nomeNoPacote(0, 'som:m', 'audio/wav')).toBe('audios/0001-som-m.wav');
    expect(nomeNoPacote(11, 'fala:sofia|B, de bola.', 'audio/mpeg')).toBe('audios/0012-fala-sofia-b-de-bola.mp3');
    expect(nomeNoPacote(2, 'som:a~', 'audio/webm;codecs=opus')).toBe('audios/0003-som-a-nasal.webm');
    expect(slugDoFonema('E')).toBe('e-aberto');
    expect(slugDoFonema('o')).toBe('o-fechado');
  });
  it('montar e abrir o pacote: pacote.json, LEIA-ME e os áudios, com texto e aviso de autorização', () => {
    const { zip, pacote } = montarPacote([
      { id: 'som:m', dados: new Uint8Array([9, 9, 9]), mime: 'audio/wav', texto: 'mmm', tipo: 'Som puro da letra', origem: 'gravacao', quem: 'Agatha', autorizacao: true, em: 0 },
      { id: 'fala:sofia|Bola.', dados: new Uint8Array([1]), mime: 'audio/mpeg', texto: 'Bola.', origem: 'arquivo', em: 0 }
    ]);
    expect(pacote.itens.map((i) => i.id)).toEqual(['fala:sofia|Bola.', 'som:m']);
    expect(pacote.aviso).toMatch(/autorização por escrito/);
    const aberto = abrirPacote(zip);
    expect(aberto.pacote.itens[1]).toMatchObject({ id: 'som:m', quem: 'Agatha', autorizacao: true, bytes: 3 });
    expect([...aberto.arquivos.get(aberto.pacote.itens[1].arquivo)!]).toEqual([9, 9, 9]);
    expect(lerZip(zip).some((a) => a.nome === 'LEIA-ME.txt')).toBe(true);
  });
  it('pacote com id inválido ou arquivo faltando é recusado', () => {
    const j = { formato: 'fonema-pacote-audios', versao: 1, criadoEm: '', aviso: '', itens: [{ id: 'som:m', arquivo: 'audios/0001-som-m.wav', mime: 'audio/wav', bytes: 3, origem: 'arquivo', em: '' }] };
    const sem = montarZip([{ nome: 'pacote.json', dados: bytes(JSON.stringify(j)) }]);
    expect(() => abrirPacote(sem)).toThrow(/Falta/);
    const ruim = montarZip([{ nome: 'pacote.json', dados: bytes(JSON.stringify({ ...j, itens: [{ ...j.itens[0], id: 'rm -rf' }] })) }]);
    expect(() => abrirPacote(ruim)).toThrow(/inválido/);
    const fuga = montarZip([{ nome: 'pacote.json', dados: bytes(JSON.stringify({ ...j, itens: [{ ...j.itens[0], arquivo: '../../etc/x' }] })) }]);
    expect(() => abrirPacote(fuga)).toThrow(/inválido/);
  });
  it('provedor remoto existe só como lugar reservado (precisa de servidor)', async () => {
    expect(PROVEDORES[0].disponivel()).toBe(true);
    const r = new ProvedorRemotoAudios();
    expect(r.disponivel()).toBe(false);
    await expect(r.publicar()).rejects.toThrow(/servidor/);
  });
});
