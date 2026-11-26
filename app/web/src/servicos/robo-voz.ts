/**
 * ROBÔ DE VOZ (fila do dono nº 33): o dono grava a própria voz (ou sobe um arquivo) e o ElevenLabs "Speech-to-Speech"
 * (trocador de voz) devolve a MESMA fala, com a mesma entonação, na voz escolhida. Quem muda a voz é o modelo da
 * ElevenLabs: aqui NÃO se mexe em tom nem em velocidade (regra do projeto: nunca alterar o tom/velocidade da voz).
 *
 * Chave: a chave do ElevenLabs é DO DONO, digitada no administrador e guardada só NESTE aparelho (banco "fonema-admin",
 * fora do pacote do Publicar). Nunca vai para o código, para o repositório nem para mensagens de erro. Cada conversão
 * gasta créditos da conta dele no ElevenLabs: nada é repetido sozinho (sem nova tentativa automática).
 *
 * Voz de criança (D011): o ElevenLabs não sintetiza voz de criança real. O "Personagem infantil" é uma voz DESENHADA,
 * de adulto fazendo voz de personagem de desenho (como a Sofia e o Tales). Não contornamos esse bloqueio.
 *
 * Formato da API (documentação pública da ElevenLabs; NÃO conferido nesta sessão, porque o site estava bloqueado na rede):
 *   POST {BASE}/v1/speech-to-speech/{voice_id}?output_format=mp3_44100_128
 *        cabeçalho xi-api-key; corpo multipart: audio (arquivo), model_id, remove_background_noise
 *        resposta: o áudio (audio/mpeg)
 *   GET  {BASE}/v1/voices   → { voices: [{ voice_id, name, category, labels, preview_url }] }
 *   GET  {BASE}/v1/user/subscription → { character_count, character_limit, ... } (créditos)
 * Se a ElevenLabs mudar um nome, é só trocar aqui em ELEVEN (tudo o mais lê destas constantes).
 * Arquivo sem DOM de tela: o `fetch` é injetado (os testes usam um falso; nenhum teste chama a API de verdade).
 */

import type { RegistroSubstituto } from './substituicoes.ts';

export const ELEVEN = {
  base: 'https://api.elevenlabs.io',
  caminhoConverter: (vozId: string) => `/v1/speech-to-speech/${encodeURIComponent(vozId)}`,
  caminhoVozes: '/v1/voices',
  caminhoAssinatura: '/v1/user/subscription',
  cabecalhoChave: 'xi-api-key',
  campoAudio: 'audio',
  campoModelo: 'model_id',
  campoTirarRuido: 'remove_background_noise',
  formatoSaida: 'mp3_44100_128',
  /** Modelo multilíngue (fala em português). */
  modeloPadrao: 'eleven_multilingual_sts_v2',
  modelos: [
    { id: 'eleven_multilingual_sts_v2', nome: 'Multilíngue (português) — recomendado' },
    { id: 'eleven_english_sts_v2', nome: 'Só inglês' }
  ]
} as const;

export type Fetch = (url: string, init?: RequestInit) => Promise<Response>;

export interface VozEleven { id: string; nome: string; categoria?: string; rotulos?: Record<string, string>; amostra?: string }

/** Os três cenários que o dono pediu. Cada um aponta para uma voz da biblioteca DELE (escolhida no aparelho). */
export type IdPreset = 'adulto' | 'comica' | 'infantil';
export const PRESETS: { id: IdPreset; nome: string; explica: string; procurar: RegExp }[] = [
  { id: 'adulto', nome: 'Adulto (narrador)', explica: 'Voz adulta, calma e clara, para narrar e explicar.', procurar: /narra|adult|calm/i },
  { id: 'comica', nome: 'Cômica (personagem)', explica: 'Voz de personagem engraçado, para o Bolota e as brincadeiras.', procurar: /c[oô]mic|funny|cartoon|bolota/i },
  {
    id: 'infantil', nome: 'Personagem infantil (desenho)',
    explica: 'Voz de personagem infantil de desenho animado, feita por ADULTO (como a Sofia e o Tales). Não é voz de criança de verdade: o ElevenLabs não faz voz de criança real e o FONEMA não contorna isso.',
    procurar: /sofia|tales|fonema|desenho|crian/i
  }
];

export type MotivoErro = 'sem-chave' | 'chave-invalida' | 'sem-creditos' | 'voz-bloqueada' | 'audio-ruim' | 'muitos-pedidos' | 'rede' | 'outro';
export class ErroRoboVoz extends Error {
  constructor(public motivo: MotivoErro, mensagem: string, public status?: number) { super(mensagem); this.name = 'ErroRoboVoz'; }
}

/** Mensagem simples para cada motivo (sem nunca citar a chave). */
export const MENSAGEM_ERRO: Record<MotivoErro, string> = {
  'sem-chave': 'Falta a chave do ElevenLabs. Cole a sua chave no passo 1.',
  'chave-invalida': 'O ElevenLabs não aceitou a chave. Confira se copiou a chave inteira (e se ela tem permissão de "Speech to Speech" e de ler as vozes).',
  'sem-creditos': 'Acabaram os créditos da sua conta no ElevenLabs (ou o limite do mês). Veja o plano em elevenlabs.io e tente depois.',
  'voz-bloqueada': 'O ElevenLabs recusou esta voz para esta fala. Escolha outra voz (voz de criança real não é permitida).',
  'audio-ruim': 'O ElevenLabs não conseguiu usar este áudio. Grave de novo, num lugar quieto, com no máximo uns 30 segundos.',
  'muitos-pedidos': 'Muitos pedidos ao mesmo tempo no ElevenLabs. Espere um minuto e toque em Converter de novo.',
  rede: 'Sem conexão com o ElevenLabs. Confira a internet e tente de novo.',
  outro: 'O ElevenLabs respondeu com um erro. Tente de novo daqui a pouco.'
};

/** Esconde a chave para mostrar na tela: só os 4 últimos caracteres. */
export function mascararChave(chave: string): string {
  const c = chave.trim();
  if (!c) return '';
  return `${'•'.repeat(Math.min(12, Math.max(4, c.length - 4)))}${c.slice(-4)}`;
}

/** Tira a chave de qualquer texto (por garantia, antes de mostrar uma mensagem que veio de fora). */
export function semChave(texto: string, chave: string): string {
  const c = chave.trim();
  return c.length >= 6 ? texto.split(c).join('[chave]') : texto;
}

/** Lê o corpo de erro da ElevenLabs: { detail: "texto" } ou { detail: { status, message } } (ou nada). */
async function lerDetalhe(r: Response): Promise<{ status?: string; mensagem?: string }> {
  try {
    const t = await r.text();
    try {
      const j = JSON.parse(t) as { detail?: unknown; message?: unknown };
      const d = j.detail;
      if (typeof d === 'string') return { mensagem: d };
      if (d && typeof d === 'object') {
        const o = d as { status?: unknown; message?: unknown; msg?: unknown };
        return { status: typeof o.status === 'string' ? o.status : undefined, mensagem: typeof o.message === 'string' ? o.message : typeof o.msg === 'string' ? o.msg : undefined };
      }
      if (typeof j.message === 'string') return { mensagem: j.message };
    } catch { return { mensagem: t.slice(0, 200) }; }
  } catch { /* corpo ilegível */ }
  return {};
}

/** Traduz a resposta de erro em um motivo. */
export async function erroDaResposta(r: Response, chave = ''): Promise<ErroRoboVoz> {
  const d = await lerDetalhe(r);
  const tudo = `${d.status ?? ''} ${d.mensagem ?? ''}`.toLowerCase();
  let motivo: MotivoErro = 'outro';
  if (/quota|credit|limit_reached|insufficient|exceed/.test(tudo) || r.status === 402) motivo = 'sem-creditos';
  else if (r.status === 401 || r.status === 403 || /invalid_api_key|api key|unauthor|missing_permissions/.test(tudo)) motivo = 'chave-invalida';
  else if (r.status === 429) motivo = 'muitos-pedidos';
  else if (/voice_not_allowed|child|minor|safety|moderation|not allowed/.test(tudo)) motivo = 'voz-bloqueada';
  else if (r.status === 400 || r.status === 422 || /audio/.test(tudo)) motivo = 'audio-ruim';
  const extra = d.mensagem ? ` (ElevenLabs: ${semChave(d.mensagem, chave).slice(0, 160)})` : '';
  return new ErroRoboVoz(motivo, MENSAGEM_ERRO[motivo] + (motivo === 'outro' ? extra : ''), r.status);
}

function exigirChave(chave: string): string {
  const c = chave.trim();
  if (!c) throw new ErroRoboVoz('sem-chave', MENSAGEM_ERRO['sem-chave']);
  return c;
}

async function chamar(f: Fetch, url: string, init: RequestInit): Promise<Response> {
  try { return await f(url, init); } catch { throw new ErroRoboVoz('rede', MENSAGEM_ERRO.rede); }
}

/** As vozes da biblioteca do dono. */
export async function listarVozes(chave: string, f: Fetch = fetch): Promise<VozEleven[]> {
  const c = exigirChave(chave);
  const r = await chamar(f, ELEVEN.base + ELEVEN.caminhoVozes, { headers: { [ELEVEN.cabecalhoChave]: c, accept: 'application/json' } });
  if (!r.ok) throw await erroDaResposta(r, c);
  const j = (await r.json()) as { voices?: { voice_id?: string; name?: string; category?: string; labels?: Record<string, string>; preview_url?: string }[] };
  return (j.voices ?? []).filter((v) => v.voice_id && v.name)
    .map((v) => ({ id: v.voice_id!, nome: v.name!, categoria: v.category, rotulos: v.labels, amostra: v.preview_url }))
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
}

/** Créditos restantes (caracteres do plano). Se a chave não puder ler a assinatura, devolve null (não é erro). */
export async function lerCreditos(chave: string, f: Fetch = fetch): Promise<{ usados: number; limite: number } | null> {
  const c = exigirChave(chave);
  try {
    const r = await f(ELEVEN.base + ELEVEN.caminhoAssinatura, { headers: { [ELEVEN.cabecalhoChave]: c, accept: 'application/json' } });
    if (!r.ok) return null;
    const j = (await r.json()) as { character_count?: number; character_limit?: number };
    return typeof j.character_count === 'number' && typeof j.character_limit === 'number' ? { usados: j.character_count, limite: j.character_limit } : null;
  } catch { return null; }
}

export interface PedidoConversao {
  chave: string;
  vozId: string;
  audio: Blob;
  nomeArquivo?: string;
  modelo?: string;
  tirarRuido?: boolean;
}

/** Converte a gravação na voz escolhida. UMA chamada (gasta créditos): quem chama não deve repetir sozinho. */
export async function converterVoz(p: PedidoConversao, f: Fetch = fetch): Promise<Blob> {
  const c = exigirChave(p.chave);
  if (!p.vozId) throw new ErroRoboVoz('outro', 'Escolha a voz de destino.');
  if (!p.audio.size) throw new ErroRoboVoz('audio-ruim', MENSAGEM_ERRO['audio-ruim']);
  const corpo = new FormData();
  corpo.append(ELEVEN.campoAudio, p.audio, p.nomeArquivo ?? 'gravacao.wav');
  corpo.append(ELEVEN.campoModelo, p.modelo ?? ELEVEN.modeloPadrao);
  corpo.append(ELEVEN.campoTirarRuido, p.tirarRuido ? 'true' : 'false');
  const url = `${ELEVEN.base}${ELEVEN.caminhoConverter(p.vozId)}?output_format=${ELEVEN.formatoSaida}`;
  const r = await chamar(f, url, { method: 'POST', headers: { [ELEVEN.cabecalhoChave]: c, accept: 'audio/mpeg' }, body: corpo });
  if (!r.ok) throw await erroDaResposta(r, c);
  const b = await r.blob();
  if (!b.size) throw new ErroRoboVoz('outro', MENSAGEM_ERRO.outro);
  return b.type ? b : new Blob([b], { type: 'audio/mpeg' });
}

/** Sugere, para cada cenário, uma voz da biblioteca pelo nome (o dono confirma ou troca). */
export function sugerirPresets(vozes: VozEleven[], atuais: Partial<Record<IdPreset, string>> = {}): Partial<Record<IdPreset, string>> {
  const out: Partial<Record<IdPreset, string>> = { ...atuais };
  for (const p of PRESETS) {
    if (out[p.id] && vozes.some((v) => v.id === out[p.id])) continue;
    const achou = vozes.find((v) => p.procurar.test(`${v.nome} ${Object.values(v.rotulos ?? {}).join(' ')}`));
    if (achou) out[p.id] = achou.id; else delete out[p.id];
  }
  return out;
}

/**
 * Em quais áudios um resultado do robô pode entrar: falas, palavras, sílabas, nomes. Os SONS PUROS das letras e os sons
 * ditos pela dupla NÃO (regra 1: o som é o estímulo da lição e passa pela auditoria dos sons, com voz humana conferida).
 */
export const podeReceberRobo = (it: { id: string; tipo: string }): boolean => /^(fala|nome):/.test(it.id) && it.tipo !== 'som-letra' && it.tipo !== 'som-dupla';

/**
 * O registro que vai para a camada de substituição (e, depois, para o pacote do Publicar) quando o dono salva um
 * resultado do robô numa fala. Só o necessário: a CHAVE nunca entra aqui (não há campo para ela).
 */
export function registroDoRobo(a: { id: string; blob: Blob; texto?: string; quem?: string; autorizacao: boolean; voz: string; modelo: string; duracaoMs?: number; em?: number }): RegistroSubstituto {
  return {
    id: a.id, blob: a.blob, nomeArquivo: `robo-${a.voz.replace(/[^\p{L}\p{N}]+/gu, '-').toLowerCase()}.mp3`, origem: 'robo', robo: { voz: a.voz, modelo: a.modelo },
    em: a.em ?? Date.now(), duracaoMs: a.duracaoMs, quem: a.quem?.trim() || undefined, texto: a.texto, autorizacao: a.autorizacao
  };
}
