/**
 * Regras do PRIMEIRO SOM do nome e da pronúncia (porte de prototipo-jogavel/regras-som.js para TypeScript).
 * Regra (jogo-completo/01 §2): a plataforma usa o PRIMEIRO FONEMA da pronúncia e mostra a LETRA REAL.
 * Ex.: Helena começa com /é/ (H mudo); Cecília com /s/ e a letra C; Charles com /ʃ/ (CH, duas letras e um som).
 */
import { SONS } from '@fonema/conteudo';

export interface SomInicial {
  chave: string;
  /** Nº de letras do começo do nome a destacar (inclui as mudas). */
  destaque: number;
  /** Nº de letras mudas no começo (H de Helena). */
  mudo: number;
  nota: string | null;
}

export interface OpcaoPronuncia {
  id: number;
  titulo: string;
  grafia: string;
  fala: string;
  rate: number;
  pitchExtra: number;
}

export interface FiguraRodada {
  palavra: string;
  fig: string;
  chave: string;
  certo: boolean;
}

interface Unidade { t: string; v: boolean }

const PARES: [string, string][] = [['s', 'z'], ['x', 'j'], ['p', 'b'], ['t', 'd'], ['f', 'v'], ['k', 'g'], ['m', 'n'], ['l', 'rr'], ['lh', 'l'], ['nh', 'n']];
const confunde = (a: string, b: string): boolean => {
  const base = (k: string) => k.replace('~', '');
  if (base(a) === base(b)) return true;
  return PARES.some(([x, y]) => (x === a && y === b) || (x === b && y === a));
};

const VOGAIS = 'aeiouáéíóúâêôãõàü';
const ehVogal = (c: string | undefined): boolean => !!c && VOGAIS.includes(c);
const semAcento = (c: string): string => c.normalize('NFD').replace(/[̀-ͯ]/g, '');
const vogalChave = (c: string): string => {
  const b = semAcento(c);
  if (c === 'ã') return 'a~';
  if (c === 'õ') return 'o~';
  return b;
};

/**
 * Descobre o primeiro som do nome.
 * Retorna { chave, destaque (nº de letras do começo a destacar), mudo (nº de letras mudas no começo), nota }
 */
export function somInicial(nome: string): SomInicial | null {
  const n = (nome || '').normalize('NFC').toLowerCase().trim();
  const c0 = n[0], c1 = n[1], c2 = n[2];
  if (!c0) return null;

  // vogal (com teste de nasal: vogal + m/n + consoante)
  const vogalInicial = (i: number, mudo: number, notaExtra: string | null): SomInicial => {
    const v = n[i];
    let chave = vogalChave(v);
    let destaque = 1;
    const nx = n[i + 1], nx2 = n[i + 2];
    if (!chave.includes('~') && (nx === 'm' || nx === 'n') && nx2 && !ehVogal(nx2) && nx2 !== 'h') {
      chave = semAcento(v) + '~';
      destaque = 2;
    }
    if (semAcento(v) === 'y') chave = 'i';
    if (semAcento(v) === 'w') chave = 'u';
    let nota: string | null = notaExtra || null;
    if (chave.includes('~')) nota = (nota ? nota + ' ' : '') + `Aqui o ${v.toUpperCase()}${destaque === 2 ? n[i + 1].toUpperCase() : ''} faz som pelo nariz.`;
    return { chave, destaque: destaque + mudo, mudo, nota };
  };

  if (c0 === 'h' && (ehVogal(c1) || c1 === 'y')) {
    return vogalInicial(1, 1, 'O H no começo do nome não faz som! O primeiro som é o da vogal.');
  }
  if (c0 === 'c' && c1 === 'h') return { chave: 'x', destaque: 2, mudo: 0, nota: 'C e H juntinhos fazem um som só: o mesmo de chuva.' };
  if (c0 === 'l' && c1 === 'h') return { chave: 'lh', destaque: 2, mudo: 0, nota: 'L e H juntinhos fazem um som só.' };
  if (c0 === 'n' && c1 === 'h') return { chave: 'nh', destaque: 2, mudo: 0, nota: 'N e H juntinhos fazem um som só.' };
  if (c0 === 't' && c1 === 'h') return { chave: 't', destaque: 2, mudo: 0, nota: 'Depois do T, o H fica quietinho.' };
  if (c0 === 'p' && c1 === 'h') return { chave: 'f', destaque: 2, mudo: 0, nota: 'P e H juntinhos têm o som do F.' };
  if (c0 === 'q' && c1 === 'u') return { chave: 'k', destaque: 2, mudo: 0, nota: 'Q e U juntinhos: o U fica quietinho.' };
  if (c0 === 'g' && c1 === 'u' && 'eéêií'.includes(c2 || '')) return { chave: 'g', destaque: 2, mudo: 0, nota: 'Antes de E ou I, o U fica quietinho e o G tem som de gato.' };
  if (c0 === 'c') {
    if ('eéêií'.includes(c1 || '')) return { chave: 's', destaque: 1, mudo: 0, nota: 'Antes de E ou I, o C tem som de S, como em sapo.' };
    return { chave: 'k', destaque: 1, mudo: 0, nota: null };
  }
  if (c0 === 'g') {
    if ('eéêií'.includes(c1 || '')) return { chave: 'j', destaque: 1, mudo: 0, nota: 'Antes de E ou I, o G tem som de J, como em girafa.' };
    return { chave: 'g', destaque: 1, mudo: 0, nota: null };
  }
  if (c0 === 'x') return { chave: 'x', destaque: 1, mudo: 0, nota: 'No começo do nome, o X tem o som de chuva.' };
  if (c0 === 'k') return { chave: 'k', destaque: 1, mudo: 0, nota: 'O K tem o mesmo som do C de casa.' };
  if (c0 === 'w') return { chave: 'u', destaque: 1, mudo: 0, nota: 'Neste nome, o W soa como U.' };
  if (c0 === 'y') return vogalInicial(0, 0, 'O Y soa como I.');
  if (c0 === 'r') return { chave: 'rr', destaque: 1, mudo: 0, nota: 'No começo do nome, o R tem som forte.' };
  if (c0 === 'ç') return { chave: 's', destaque: 1, mudo: 0, nota: null };
  if (ehVogal(c0)) return vogalInicial(0, 0, null);
  if (SONS[c0]) return { chave: c0, destaque: 1, mudo: 0, nota: null };
  return { chave: c0, destaque: 1, mudo: 0, nota: null };
}

// hash estável (para escolher figuras de forma determinística, sem sorte)
export const hash = (s: string): number => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);

/** Monta a rodada de 3 figuras: 1 com o mesmo som + 2 distratores distantes. */
export function rodadaFiguras(nome: string, chave: string): FiguraRodada[] {
  const alvo = SONS[chave] || SONS.s;
  const h = hash(nome.toLowerCase());
  const certo = alvo.palavras[h % alvo.palavras.length];
  const primeiraLetra = semAcento(nome[0].toLowerCase());
  const pool = ['p', 'm', 'l', 'v', 'rr', 'o', 'a', 'f', 't', 'b', 'u', 's', 'k', 'n', 'g', 'z', 'j', 'x', 'd', 'i', 'e'];
  const usados: string[] = [chave];
  const distr: FiguraRodada[] = [];
  for (let i = 0; distr.length < 2 && i < pool.length * 2; i++) {
    const k = pool[(h + i * 7) % pool.length];
    if (usados.some((u) => confunde(u, k))) continue;
    const w = SONS[k].palavras[0];
    // evita distrator que começa com a mesma LETRA do nome (1º contato: começar acertando)
    if (semAcento(w[0][0]) === primeiraLetra) continue;
    // evita distrator cuja PALAVRA começa com o mesmo som do alvo (ex.: alvo /k/ e "casa")
    usados.push(k);
    distr.push({ palavra: w[0], fig: w[1], chave: k, certo: false });
  }
  const itens: FiguraRodada[] = [{ palavra: certo[0], fig: certo[1], chave, certo: true }, ...distr];
  // posição da figura certa varia com o nome (determinística)
  const pos = h % 3;
  const [c] = itens.splice(0, 1);
  itens.splice(pos, 0, c);
  return itens;
}

/* ------------------------- pronúncia (sílabas) ------------------------- */
const GRUPOS_ONSET = ['pr', 'br', 'tr', 'dr', 'cr', 'gr', 'fr', 'vr', 'pl', 'bl', 'cl', 'gl', 'fl'];
const DIGRAFOS = ['ch', 'lh', 'nh', 'qu', 'gu', 'th', 'ph'];

function unidades(palavra: string): Unidade[] {
  const w = palavra.toLowerCase();
  const u: Unidade[] = [];
  for (let i = 0; i < w.length; i++) {
    const dupla = w.slice(i, i + 2);
    if (DIGRAFOS.includes(dupla) && !(dupla === 'gu' && !'eéêií'.includes(w[i + 2] || '')) && !(dupla === 'qu' && !w[i + 2])) {
      u.push({ t: dupla, v: false }); i++; continue;
    }
    if (w[i] === 'y' && !ehVogal(w[i + 1])) { u.push({ t: 'y', v: true }); continue; }
    u.push({ t: w[i], v: ehVogal(w[i]) });
  }
  return u;
}

/** Divide em sílabas. hiato=true separa todas as vogais (Ka-u-ã); false junta ditongos (Kau-ã). */
export function silabas(palavra: string, { hiato = false }: { hiato?: boolean } = {}): string[] {
  const u = unidades(palavra);
  const nucleos: [number, number][] = []; // índices [ini,fim] dos núcleos vocálicos
  for (let i = 0; i < u.length; i++) {
    if (!u[i].v) continue;
    let j = i;
    while (!hiato && j + 1 < u.length && u[j + 1].v && ditongo(u[j].t, u[j + 1].t)) j++;
    nucleos.push([i, j]);
    i = j;
  }
  if (!nucleos.length) return [palavra.toLowerCase()];
  const cortes: number[] = []; // índice onde começa cada sílaba (exceto a 1ª)
  for (let k = 1; k < nucleos.length; k++) {
    const fimAnt = nucleos[k - 1][1], ini = nucleos[k][0];
    const cons = ini - fimAnt - 1;
    if (cons <= 0) cortes.push(ini);
    else if (cons === 1) cortes.push(ini - 1);
    else {
      const par = u[ini - 2].t + u[ini - 1].t;
      cortes.push(GRUPOS_ONSET.includes(par) ? ini - 2 : ini - 1);
    }
  }
  const sil: string[] = [];
  let a = 0;
  for (const c of cortes) { sil.push(u.slice(a, c).map((x) => x.t).join('')); a = c; }
  sil.push(u.slice(a).map((x) => x.t).join(''));
  return sil;
}
function ditongo(a: string, b: string): boolean {
  // decrescente: vogal + i/u átonos; nasais ão, õe, ãe
  if ((a === 'ã' && (b === 'o' || b === 'e')) || (a === 'õ' && b === 'e')) return true;
  if ('iu'.includes(b) && 'aeoáéóâêô'.includes(a)) return true;
  return false;
}

/** Sílaba tônica "natural" do português (índice). */
export function tonicaNatural(sil: string[]): number {
  const i = sil.findIndex((s) => /[áéíóúâêô]/.test(s));
  if (i >= 0) return i;
  const j = sil.findIndex((s) => /[ãõ]/.test(s));
  if (j >= 0) return j;
  if (sil.length === 1) return 0;
  const ult = sil[sil.length - 1];
  if (/(r|l|z|x|i|u|im|um|is|us|ns|om|y)$/.test(ult)) return sil.length - 1;
  return sil.length - 2;
}

const AGUDO: Record<string, string> = { a: 'á', e: 'é', i: 'í', o: 'ó', u: 'ú', y: 'í' };
const CIRC: Record<string, string> = { a: 'â', e: 'ê', i: 'í', o: 'ô', u: 'ú', y: 'í' };
function tiraAcentoTonico(s: string): string { return s.replace(/[áàâ]/g, 'a').replace(/[éê]/g, 'e').replace(/í/g, 'i').replace(/[óô]/g, 'o').replace(/ú/g, 'u'); }
function acentua(s: string, tipo: string): string {
  if (/[áéíóúâêôãõ]/.test(s)) return s;
  const m = tipo === 'circ' ? CIRC : AGUDO;
  // pula o "u" de qu/gu
  let ini = 0;
  if (/^(qu|gu)/.test(s)) ini = 2;
  for (let i = ini; i < s.length; i++) if (m[s[i]]) return s.slice(0, i) + m[s[i]] + s.slice(i + 1);
  return s;
}
const cap = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1);

/** Grafia fonética para mostrar ao adulto: Ka-u-Ã (tônica em MAIÚSCULAS). */
export function grafiaFonetica(sil: string[], t: number): string {
  return sil.map((s, i) => (i === t ? s.toUpperCase() : i === 0 ? cap(s) : s)).join('-');
}
/** Converte a grafia fonética (do adulto ou gerada) no texto que vai para a voz. */
export function foneticaParaFala(grafia: string, tipoAcento = 'agudo'): string {
  const partes = grafia.split(/[-·.\s]+/).filter(Boolean);
  if (!partes.length) return '';
  let t = partes.findIndex((p) => p.length > 0 && p === p.toUpperCase() && p !== p.toLowerCase());
  // se tudo maiúsculo, não há marcação: deixa a voz decidir
  if (partes.every((p) => p === p.toUpperCase())) t = -1;
  const fala = partes.map((p, i) => {
    let s = p.toLowerCase();
    if (t >= 0 && i !== t) s = tiraAcentoTonico(s);
    if (i === t) s = acentua(s, tipoAcento);
    return s;
  }).join('');
  return cap(fala);
}

/**
 * 3 opções de pronúncia variando sílaba tônica, abertura das vogais e ritmo.
 * Cada opção: { id, titulo, grafia, fala, rate, pitchExtra }
 */
export function opcoesPronuncia(nome: string): OpcaoPronuncia[] {
  const base = nome.trim();
  const silD = silabas(base, { hiato: false });
  const silH = silabas(base, { hiato: true });
  const tNat = tonicaNatural(silD);
  const ops: OpcaoPronuncia[] = [];
  const add = (titulo: string, sil: string[], t: number, rate: number, acento: string, pitchExtra = 0): boolean => {
    const grafia = grafiaFonetica(sil, t);
    if (ops.some((o) => o.grafia.toLowerCase() === grafia.toLowerCase() && o.grafia === grafia)) return false;
    ops.push({ id: ops.length + 1, titulo, grafia, fala: foneticaParaFala(grafia, acento), rate, pitchExtra });
    return true;
  };
  add('Como se escreve', silD, tNat, 0.95, 'agudo');
  // 2: separa as vogais (hiato), tônica no fim, ritmo mais lento
  if (!add('Sílabas separadas, força no fim', silH, silH.length - 1, 0.78, 'agudo', 0.05)) {
    add('Sílabas separadas, força no começo', silH, 0, 0.78, 'agudo', 0.05);
  }
  // 3: tônica na penúltima (ou outra), vogal mais fechada
  const alvo3 = silD.length > 1 ? (tNat === silD.length - 2 ? silD.length - 1 : silD.length - 2) : 0;
  if (!add('Força em outra sílaba, vogal fechada', silD, alvo3, 0.88, 'circ', -0.05)) {
    if (!add('Força no começo, vogal fechada', silD, 0, 0.88, 'circ', -0.05)) {
      // nome de 1 sílaba: varia só a abertura da vogal e o ritmo
      ops.push({ id: ops.length + 1, titulo: 'Vogal fechada, mais devagar', grafia: grafiaFonetica(silD, 0) + ' (ê/ô)', fala: cap(acentua(tiraAcentoTonico(base.toLowerCase()), 'circ')), rate: 0.75, pitchExtra: -0.05 });
    }
  }
  while (ops.length < 3) {
    const o = ops[0];
    ops.push({ id: ops.length + 1, titulo: ops.length === 1 ? 'Mais devagar' : 'Mais animada', grafia: o.grafia, fala: o.fala, rate: ops.length === 1 ? 0.7 : 1.05, pitchExtra: ops.length === 1 ? 0 : 0.1 });
  }
  return ops.slice(0, 3);
}

