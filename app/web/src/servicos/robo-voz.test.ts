// Robô de voz (fila nº 33): tudo com um fetch FALSO. Nenhum teste chama o ElevenLabs de verdade nem gasta créditos.
import { describe, expect, it } from 'vitest';
import {
  ELEVEN, ErroRoboVoz, converterVoz, erroDaResposta, lerCreditos, listarVozes, mascararChave, podeReceberRobo, registroDoRobo, semChave, sugerirPresets, type Fetch
} from './robo-voz.ts';
import { montarPacoteGeral } from './pacote.ts';

const CHAVE = 'sk_teste_1234567890abcdef';
interface Chamada { url: string; init?: RequestInit }
function falso(resposta: (c: Chamada) => Response | Promise<Response>): { f: Fetch; chamadas: Chamada[] } {
  const chamadas: Chamada[] = [];
  return { chamadas, f: async (url, init) => { const c = { url, init }; chamadas.push(c); return resposta(c); } };
}
const json = (x: unknown, status = 200) => new Response(JSON.stringify(x), { status, headers: { 'content-type': 'application/json' } });
const audioFalso = () => new Blob([new Uint8Array([82, 73, 70, 70, 1, 2, 3, 4])], { type: 'audio/wav' });

describe('robô de voz: chamada ao ElevenLabs (falsa)', () => {
  it('lista as vozes da biblioteca com a chave no cabeçalho xi-api-key', async () => {
    const { f, chamadas } = falso(() => json({ voices: [{ voice_id: 'v2', name: 'Tales — FONEMA', category: 'generated' }, { voice_id: 'v1', name: 'Narrador calmo', labels: { use_case: 'narration' } }, { name: 'sem id' }] }));
    const vozes = await listarVozes(CHAVE, f);
    expect(vozes.map((v) => v.id)).toEqual(['v1', 'v2']);
    expect(chamadas[0].url).toBe('https://api.elevenlabs.io/v1/voices');
    expect((chamadas[0].init?.headers as Record<string, string>)['xi-api-key']).toBe(CHAVE);
  });

  it('converte: POST multipart com audio, model_id e a voz no endereço; devolve o áudio', async () => {
    const { f, chamadas } = falso(() => new Response(new Uint8Array([0xff, 0xfb, 1, 2]), { status: 200, headers: { 'content-type': 'audio/mpeg' } }));
    const b = await converterVoz({ chave: CHAVE, vozId: 'voz 1', audio: audioFalso(), nomeArquivo: 'eu.wav' }, f);
    expect(b.size).toBe(4);
    expect(chamadas).toHaveLength(1);
    const c = chamadas[0];
    expect(c.init?.method).toBe('POST');
    expect(c.url).toBe('https://api.elevenlabs.io/v1/speech-to-speech/voz%201?output_format=mp3_44100_128');
    expect((c.init?.headers as Record<string, string>)['xi-api-key']).toBe(CHAVE);
    const corpo = c.init?.body as FormData;
    expect(corpo.get('model_id')).toBe(ELEVEN.modeloPadrao);
    expect(corpo.get('audio')).toBeInstanceOf(Blob);
    // nada de tom/velocidade mexidos aqui: só estes campos vão
    expect([...corpo.keys()].sort()).toEqual(['audio', 'model_id', 'remove_background_noise']);
  });

  it('sem chave: nem chama a API', async () => {
    const { f, chamadas } = falso(() => json({}));
    await expect(converterVoz({ chave: '  ', vozId: 'v', audio: audioFalso() }, f)).rejects.toMatchObject({ motivo: 'sem-chave' });
    await expect(listarVozes('', f)).rejects.toMatchObject({ motivo: 'sem-chave' });
    expect(chamadas).toHaveLength(0);
  });

  it('erros viram motivos em linguagem simples, sem nunca mostrar a chave', async () => {
    const casos: [Response, string][] = [
      [json({ detail: { status: 'invalid_api_key', message: `Invalid API key ${CHAVE}` } }, 401), 'chave-invalida'],
      [json({ detail: { status: 'quota_exceeded', message: 'This request exceeds your quota.' } }, 401), 'sem-creditos'],
      [json({ detail: 'Too many concurrent requests' }, 429), 'muitos-pedidos'],
      [json({ detail: [{ msg: 'field required' }] }, 422), 'audio-ruim'],
      [new Response('oops', { status: 500 }), 'outro']
    ];
    for (const [r, motivo] of casos) {
      const e = await erroDaResposta(r, CHAVE);
      expect(e.motivo, motivo).toBe(motivo);
      expect(e.message).not.toContain(CHAVE);
    }
  });

  it('rede caída: motivo "rede" e UMA tentativa só (cada conversão gasta créditos)', async () => {
    let n = 0;
    const f: Fetch = async () => { n++; throw new TypeError('Failed to fetch'); };
    const e = await converterVoz({ chave: CHAVE, vozId: 'v', audio: audioFalso() }, f).catch((x: unknown) => x);
    expect(e).toBeInstanceOf(ErroRoboVoz);
    expect((e as ErroRoboVoz).motivo).toBe('rede');
    expect(n).toBe(1);
  });

  it('créditos: lê a assinatura; sem permissão devolve null (não trava a tela)', async () => {
    expect(await lerCreditos(CHAVE, falso(() => json({ character_count: 100, character_limit: 10000 })).f)).toEqual({ usados: 100, limite: 10000 });
    expect(await lerCreditos(CHAVE, falso(() => json({}, 401)).f)).toBeNull();
  });
});

describe('robô de voz: regras do FONEMA', () => {
  it('chave mascarada na tela e apagada de qualquer texto', () => {
    expect(mascararChave(CHAVE)).toMatch(/^•+cdef$/);
    expect(mascararChave(CHAVE)).not.toContain('sk_teste');
    expect(semChave(`erro com ${CHAVE} no meio`, CHAVE)).toBe('erro com [chave] no meio');
  });

  it('sons puros das letras e sons da dupla não recebem voz do robô (regra 1); falas, palavras e nomes recebem', () => {
    expect(podeReceberRobo({ id: 'som:m', tipo: 'som-letra' })).toBe(false);
    expect(podeReceberRobo({ id: 'fala:sofia|mmm', tipo: 'som-dupla' })).toBe(false);
    expect(podeReceberRobo({ id: 'fala:sofia|Bola.', tipo: 'palavra' })).toBe(true);
    expect(podeReceberRobo({ id: 'nome:tales|ana', tipo: 'nome-crianca' })).toBe(true);
  });

  it('sugere vozes para os cenários pelo nome, sem inventar id', () => {
    const vozes = [{ id: 'a', nome: 'Narrador calmo' }, { id: 'b', nome: 'Sofia — FONEMA' }, { id: 'c', nome: 'Roberto' }];
    const s = sugerirPresets(vozes);
    expect(s.adulto).toBe('a');
    expect(s.infantil).toBe('b');
    expect(s.comica).toBeUndefined();
    expect(sugerirPresets(vozes, { comica: 'c' }).comica).toBe('c');
    expect(sugerirPresets(vozes, { comica: 'sumiu' }).comica).toBeUndefined();
  });

  it('o áudio do robô vai para o pacote marcado como "robo" (voz sintética) e a chave NUNCA vai junto', async () => {
    const r = registroDoRobo({ id: 'fala:sofia|Bola.', blob: new Blob([new Uint8Array([1, 2, 3])], { type: 'audio/mpeg' }), texto: 'Bola.', quem: 'Dono', autorizacao: true, voz: 'Sofia — FONEMA', modelo: ELEVEN.modeloPadrao, em: 0 });
    expect(r.origem).toBe('robo');
    expect(JSON.stringify(r)).not.toContain(CHAVE);
    const dados = new Uint8Array(await r.blob.arrayBuffer());
    const { zip, pacote } = montarPacoteGeral({ audios: [{ id: r.id, dados, mime: 'audio/mpeg', texto: r.texto, origem: r.origem, robo: r.robo, quem: r.quem, autorizacao: r.autorizacao, em: r.em }], edicoes: [], midias: [] });
    expect(pacote.audios[0].origem).toBe('robo');
    expect(pacote.audios[0].robo?.voz).toBe('Sofia — FONEMA');
    const texto = new TextDecoder('latin1').decode(zip);
    expect(texto).not.toContain(CHAVE);
    expect(texto).not.toContain('xi-api-key');
  });
});
