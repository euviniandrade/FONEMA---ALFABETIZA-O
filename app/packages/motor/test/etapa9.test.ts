/**
 * D030 etapa 9: sondagem periódica em blocos, treino rápido (prática recomendada jogável), selos sem exposição,
 * ajuda graduada, posição da resposta, chute e queda entre sondagens.
 */
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { CONFIG_PADRAO, FASES, FASE_POR_ID, LETRA_POR_ID, valoresDaPalavra } from '@fonema/conteudo';
import type { Cena } from '@fonema/conteudo';
import {
  DIA_MS, EXEMPLO_SEGMENTACAO, PALAVRAS_SONDAGEM, PSEUDOS_SONDAGEM, SEGMENTACAO_SONDAGEM, SELOS_DE_PARTICIPACAO, alertaDeRisco, aplicarAtividade,
  avaliarConquistas, conferirDitado, letrasComSomVisto, montarSondagem, montarTreino, nivelDeAjuda, novaHabilidade,
  palavraPermitidaNaSondagem, posicoesDaRespostaCerta, progressoInicial, quedasEntreSondagens, registrarSondagem, registrarTentativa, registrarTreino,
  resultadoPorArea, resumoAprendizagem, resumoDaAjuda, sinaisDeChute, treinoDisponivel, valoresEnsinadosAte
} from '../src/index.ts';
import type { AreaSondagem, Crianca, ItemSondagem, Progresso, Tentativa } from '../src/index.ts';

const T0 = new Date('2026-11-15T15:00:00').getTime();
const cfg = CONFIG_PADRAO;
let relogio = 0;
const t = (habilidade: string, acertou: boolean, sessao: string, extra: Partial<Tentativa> = {}): Tentativa =>
  ({ em: T0 + relogio++, sessao, habilidade, acertou, mecanica: 'escolher', ...extra });
const troca = (habilidade: string, alvo: string, escolhido: string, sessao: string): Tentativa =>
  t(habilidade, true, sessao, { comAjuda: true, alvo, escolhido, respostas: [escolhido, alvo], distratores: [escolhido], tentativaNumero: 2 });
function comTentativas(ts: Tentativa[], base: Progresso = progressoInicial('c1', T0)): Progresso {
  const habilidades = { ...base.habilidades };
  for (const x of ts) habilidades[x.habilidade] = registrarTentativa(habilidades[x.habilidade] ?? novaHabilidade(), x);
  return { ...base, habilidades };
}
/** Conclui fases pelo id (só o estado; para o filtro de "já viu"). */
function concluidas(ids: string[], base: Progresso = progressoInicial('c1', T0)): Progresso {
  const fases = { ...base.fases };
  for (const id of ids) fases[id] = { estado: 'concluida', sessoes: 1, concluidaEm: T0 };
  return { ...base, fases, sessoesFeitas: 3 };
}
const ALFA = (ls: string) => [...ls].map((l) => `AL-${l}`).filter((id) => FASE_POR_ID[id]);
const MANIFESTO = fileURLToPath(new URL('../../../web/public/audio/falas/manifesto.json', import.meta.url));
const FIGURAS = fileURLToPath(new URL('../../../web/public/assets/figuras/', import.meta.url));

describe('sondagem periódica em blocos: só o que a criança já viu', () => {
  it('letras com som visto vêm das fases concluídas (Trilha A–Z, vogais, M/L/F); H, K, W, Y não entram', () => {
    expect(letrasComSomVisto(progressoInicial('c1', T0))).toEqual([]);
    const p = concluidas(ALFA('ABHKF'));
    expect(letrasComSomVisto(p)).toEqual(['A', 'B', 'F']);
    const r2a = concluidas(FASES.filter((f) => f.regiao === 'R1' || f.regiao === 'R2a').map((f) => f.id));
    expect(letrasComSomVisto(r2a)).toEqual(expect.arrayContaining(['A', 'E', 'I', 'O', 'U', 'M', 'L', 'F']));
    expect(valoresEnsinadosAte(r2a)).toEqual(expect.arrayContaining(['o-aberto', 'e-aberto']));
  });

  it('nenhuma palavra para ler ou escrever usa letra ou valor sonoro ainda não ensinado (regra 2)', () => {
    // muitas combinações de letras vistas × sementes
    const grupos = ['AFCV', 'AUVL', 'MALUFIO', 'ABCDEFGIJLMOPTUV', 'FACULIVOTDRB'];
    for (const g of grupos) {
      const p = concluidas(ALFA(g));
      const letras = letrasComSomVisto(p);
      const valores = valoresEnsinadosAte(p);
      for (let s = 1; s < 30; s++) {
        const plano = montarSondagem(p, s);
        for (const b of plano.blocos) for (const i of b.itens) {
          if (b.area === 'leitura-palavras' || b.area === 'ditado') {
            const w = (i.mostrar ?? i.alvo).toUpperCase();
            expect([...w].every((ch) => letras.includes(ch)), `${w} com letras ${letras.join('')}`).toBe(true);
            expect(palavraPermitidaNaSondagem(w, letras, valores)).toBe(true);
          }
          if (b.area === 'pseudopalavras') expect([...i.mostrar!].every((ch) => letras.includes(ch))).toBe(true);
          if (b.area === 'sons-letras') {
            expect(i.opcoes).toHaveLength(3); // R8: 3 opções
            expect(i.opcoes.every((l) => letras.includes(l))).toBe(true);
            expect(new Set(i.opcoes.map((l) => LETRA_POR_ID[l].fonema)).size).toBe(3); // nunca dois sons iguais
            expect(i.somAlvo).toBe(LETRA_POR_ID[i.alvo].fonema); // som puro, nunca o nome da letra
          }
        }
      }
    }
    // "bola" (Ó aberto) só depois da Ilha das Vogais; "dedo" (O final com som de U) ainda não
    const soAl = concluidas(ALFA('BOLAD E'));
    expect(palavraPermitidaNaSondagem('BOLA', letrasComSomVisto(soAl), valoresEnsinadosAte(soAl))).toBe(false);
    expect(valoresDaPalavra('DEDO')).toContain('o-final-u');
    expect(palavraPermitidaNaSondagem('DEDO', ['D', 'E', 'O'], ['o-aberto', 'e-aberto'])).toBe(false);
  });

  it('cinco blocos quando a criança já viu o suficiente; área sem item fica de fora (não é zero)', () => {
    const tudo = concluidas([...ALFA('ABCDEFGIJLMOPTUV'), ...FASES.filter((f) => f.regiao === 'R1' || f.regiao === 'R2a').map((f) => f.id)]);
    const plano = montarSondagem(tudo, 7);
    expect(plano.blocos.map((b) => b.area)).toEqual(['sons-letras', 'leitura-palavras', 'pseudopalavras', 'segmentacao', 'ditado']);
    expect(plano.total).toBeGreaterThanOrEqual(12);
    expect(plano.total).toBeLessThanOrEqual(18);
    // ditado usa palavras diferentes das lidas
    const lidas = plano.blocos.find((b) => b.area === 'leitura-palavras')!.itens.map((i) => i.alvo.toUpperCase());
    for (const i of plano.blocos.find((b) => b.area === 'ditado')!.itens) {
      expect(lidas).not.toContain(i.alvo);
      expect([...i.alvo].every((l) => i.bandeja!.includes(l))).toBe(true);
      expect(i.bandeja!.length).toBeGreaterThan(i.alvo.length); // há letras sobrando (sem modelo)
    }
    // pouco visto: sem pseudopalavras nem ditado, mas segmentação (só ouvida) existe
    const pouco = montarSondagem(concluidas(ALFA('AB')), 3);
    expect(pouco.blocos.map((b) => b.area)).toEqual(['segmentacao']);
  });

  it('a resposta certa não fica no mesmo lugar duas vezes seguidas e varia entre sondagens (R5, R6)', () => {
    const p = concluidas([...ALFA('ABCDEFGIJLMOPTUV'), ...FASES.filter((f) => f.regiao === 'R1' || f.regiao === 'R2a').map((f) => f.id)]);
    const posicoes = new Set<number>();
    const conjuntos = new Set<string>();
    for (let s = 1; s < 40; s++) {
      const plano = montarSondagem(p, s);
      conjuntos.add(plano.blocos[0].itens.map((i) => i.alvo).join(''));
      for (const b of plano.blocos) {
        if (b.area === 'segmentacao' || b.area === 'ditado') continue;
        let ant = -1;
        for (const i of b.itens) {
          const pos = i.opcoes.indexOf(i.alvo);
          expect(pos).toBeGreaterThanOrEqual(0);
          expect(pos).not.toBe(ant);
          ant = pos;
          posicoes.add(pos);
        }
      }
    }
    expect(posicoes.size).toBe(3);
    expect(conjuntos.size).toBeGreaterThan(5);
    expect(montarSondagem(p, 11)).toEqual(montarSondagem(p, 11)); // mesma semente, mesmo plano
  });

  it('todo item tem áudio aprovado na voz da Sofia e (na leitura) figura publicada', () => {
    if (!existsSync(MANIFESTO)) return;
    const m = JSON.parse(readFileSync(MANIFESTO, 'utf8')) as Record<string, string>;
    const tem = (w: string) => !!m[`sofia|${w.toLowerCase()}`];
    for (const w of PALAVRAS_SONDAGEM) {
      expect(tem(w), w).toBe(true);
      expect(existsSync(`${FIGURAS}${w.toLowerCase()}.webp`), `figura ${w}`).toBe(true);
    }
    for (const s of PSEUDOS_SONDAGEM) for (const w of [s.certa, ...s.erradas]) expect(tem(w), w).toBe(true);
    for (const s of SEGMENTACAO_SONDAGEM) expect(tem(s.palavra), s.palavra).toBe(true);
    // pseudopalavras reprovadas na auditoria (docs/auditoria-audio.md) não entram
    const reprovadas = ['folu', 'lufo', 'fuli', 'fulu', 'fali'];
    for (const s of PSEUDOS_SONDAGEM) for (const w of [s.certa, ...s.erradas]) expect(reprovadas).not.toContain(w);
    expect(SEGMENTACAO_SONDAGEM).toContain(EXEMPLO_SEGMENTACAO);
  });

  it('ditado confere a palavra inteira; resultado vai por área, com o escrito guardado para o adulto', () => {
    expect(conferirDitado('MALA', 'mala')).toBe(true);
    expect(conferirDitado('MALA', 'MLA')).toBe(false);
    const itens: (ItemSondagem & { area: AreaSondagem })[] = [
      { area: 'ditado', alvo: 'MALA', escolhido: 'MLA', escrito: 'MLA', acertou: false },
      { area: 'pseudopalavras', alvo: 'lifu', escolhido: 'lifu', acertou: true, posicaoCerta: 2, posicaoEscolhida: 2 }
    ];
    const areas = resultadoPorArea(itens);
    expect(areas.ditado).toMatchObject({ acertos: 0, total: 1 });
    expect(areas.ditado!.itens![0].escrito).toBe('MLA');
    const p = registrarSondagem({ ...progressoInicial('c1', T0), sessoesFeitas: 2, expressa: { regioes: [], ativa: false, sondagemEm: T0 } }, { id: 's', areas, motivo: 'dias', tela: 'blocos' }, T0 + 31 * DIA_MS);
    expect(p.sondagens![0]).toMatchObject({ tela: 'blocos', motivo: 'dias' });
  });
});

describe('queda entre sondagens e alerta', () => {
  const area = (acertos: number, total: number) => ({ acertos, total });
  const base = (): Progresso => ({ ...progressoInicial('c1', T0), sessoesFeitas: 4, ultimaSessao: T0 });
  it('queda de 25 pontos ou mais numa área (com ao menos 3 itens nas duas) vira sinal com sugestão de voltar de fase', () => {
    let p = registrarSondagem(base(), { id: 'a', areas: { 'sons-letras': area(4, 4), ditado: area(2, 3), segmentacao: area(1, 2) }, motivo: 'inicial' }, T0);
    p = registrarSondagem(p, { id: 'b', areas: { 'sons-letras': area(2, 4), ditado: area(2, 3), segmentacao: area(0, 2) }, motivo: 'dias' }, T0 + 30 * DIA_MS);
    const q = quedasEntreSondagens(p);
    expect(q.map((x) => x.area)).toEqual(['sons-letras']); // segmentação: poucos itens; ditado: igual
    expect(q[0].variacao).toBeCloseTo(-0.5);
    const a = alertaDeRisco(p, cfg, T0 + 30 * DIA_MS);
    const s = a.sinais.find((x) => x.tipo === 'queda-sondagem')!;
    expect(s.texto).toMatch(/Sons das letras/);
    expect(s.sugestao).toMatch(/voltar uma fase/);
    expect(a.nivel).toBe('atencao');
    expect(a.criterio).toMatch(/duas sondagens/);
    // subir não é queda
    const sobe = registrarSondagem(p, { id: 'c', areas: { 'sons-letras': area(4, 4) }, motivo: 'dias' }, T0 + 60 * DIA_MS);
    expect(quedasEntreSondagens(sobe)).toEqual([]);
  });
});

describe('ajuda graduada, ouviu de novo, posição e chute', () => {
  it('nível de ajuda: o gravado vale; senão deduz pela tentativa (escada de 06 §4)', () => {
    expect(nivelDeAjuda({ acertou: true, tentativaNumero: 1 })).toBe('nenhuma');
    expect(nivelDeAjuda({ acertou: true, tentativaNumero: 2, comAjuda: true })).toBe('contraste');
    expect(nivelDeAjuda({ acertou: true, tentativaNumero: 3, comAjuda: true })).toBe('resposta-mostrada');
    expect(nivelDeAjuda({ acertou: true, tentativaNumero: 3 })).toBe('caminho');
    expect(nivelDeAjuda({ acertou: true, tentativaNumero: 1, nivelAjuda: 'repetiu' })).toBe('repetiu');
    const r = resumoDaAjuda([
      t('letra-b', true, 's', { tentativaNumero: 1, ouviuDeNovo: 2 }), t('letra-b', true, 's', { tentativaNumero: 3, comAjuda: true, ouviuDeNovo: 0 }),
      t('letra-b', true, 's', { mecanica: 'letra' }) // exposição: fora
    ]);
    expect(r.itens).toBe(2);
    expect(r.porNivel).toMatchObject({ nenhuma: 1, 'resposta-mostrada': 1 });
    expect(r.ouviuDeNovo).toEqual({ itens: 1, vezes: 2, comDado: 2 });
  });

  it('posição da resposta certa: contagem por lugar', () => {
    expect(posicoesDaRespostaCerta([t('x', true, 's', { posicaoCerta: 0 }), t('x', true, 's', { posicaoCerta: 2 }), t('x', true, 's', { posicaoCerta: 2 }), t('x', true, 's')])).toEqual([1, 0, 2]);
  });

  it('chute por pressa e por posição; resposta pensada não é chute', () => {
    const rapidas = Array.from({ length: 8 }, (_, i) => t('letra-b', i % 2 === 0, 's', { alvo: 'B', escolhido: i % 2 === 0 ? 'B' : 'D', tempoMs: 600 }));
    expect(sinaisDeChute(rapidas)).toMatchObject({ chutando: true, motivo: 'pressa' });
    const mesmoLugar = Array.from({ length: 7 }, (_, i) => t('letra-b', true, 's', { alvo: 'B', escolhido: i % 3 === 0 ? 'B' : 'D', posicaoEscolhida: 0, posicaoCerta: i % 3, tempoMs: 3000 }));
    expect(sinaisDeChute(mesmoLugar)).toMatchObject({ chutando: true, motivo: 'posicao' });
    const pensadas = Array.from({ length: 10 }, (_, i) => t('letra-b', true, 's', { alvo: 'B', escolhido: 'B', posicaoEscolhida: i % 3, posicaoCerta: i % 3, tempoMs: 2500 }));
    expect(sinaisDeChute(pensadas).chutando).toBe(false);
    // no alerta: só "atenção", nunca "precisa de apoio" sozinho
    const a = alertaDeRisco(comTentativas(rapidas), cfg, T0);
    expect(a.sinais.map((s) => s.tipo)).toContain('chute');
    expect(a.nivel).toBe('atencao');
  });

  it('o painel do adulto traz ajuda, chute, quedas e treinos', () => {
    const c = { anoNascimento: 2019 } as Pick<Crianca, 'anoNascimento'>;
    const r = resumoAprendizagem(c, comTentativas([t('letra-b', true, 's', { tentativaNumero: 1, posicaoCerta: 1 })]), cfg, T0);
    expect(r.ajuda.itens).toBe(1);
    expect(r.ajuda.posicoes).toEqual([0, 1]);
    expect(r.chute.chutando).toBe(false);
    expect(r.sondagem.quedas).toEqual([]);
    expect(r.treinos).toEqual([]);
  });
});

describe('treino rápido com a Sofia (prática recomendada jogável)', () => {
  it('par confundido vira rodada curta de Escolher focada no par; registra como avaliada no contexto reforço', () => {
    const p0 = { ...comTentativas([troca('letra-b', 'B', 'D', 's1'), troca('letra-b', 'B', 'D', 's2'), troca('letra-b', 'B', 'D', 's3')]), sessoesFeitas: 3 };
    const treino = montarTreino(p0, cfg, T0)!;
    expect(treino.pratica.motivo).toBe('par-confundido');
    expect(treino.titulo).toMatch(/B e D/);
    expect(treino.atividade.tipo).toBe('escolher');
    expect(treino.atividade.itens.length).toBeGreaterThanOrEqual(3);
    expect(treino.atividade.itens.length).toBeLessThanOrEqual(5);
    // os primeiros itens põem B e D lado a lado
    const i0 = treino.atividade.itens[0];
    expect(i0.opcoes.some((o) => /^[bd]$/i.test(o.letra ?? o.id))).toBe(true);
    const tentativas = treino.atividade.itens.map((i) => t(i.habilidade!, true, 'x', { alvo: 'B', escolhido: 'B', tentativaNumero: 1 }));
    const r = registrarTreino(p0, treino, 'treino-1', tentativas, cfg, T0 + DIA_MS);
    const ts = r.progresso.habilidades['letra-b'].tentativas.filter((x) => x.sessao === 'treino-1');
    expect(ts.length).toBe(tentativas.filter((x) => x.habilidade === 'letra-b').length);
    expect(ts.every((x) => x.contexto === 'reforco' && x.tipo === 'avaliada')).toBe(true);
    expect(r.progresso.treinos).toHaveLength(1);
    expect(r.progresso.contadores['treinos-rapidos']).toBe(1);
    expect(r.progresso.moedinhas).toEqual(p0.moedinhas); // não dá nem tira moedinhas
    // uma vez por dia
    expect(treinoDisponivel(r.progresso, cfg, T0 + DIA_MS + 1000)).toBeNull();
  });

  it('sem nada para reforçar não há treino; com pré-requisito, a volta entra primeiro', () => {
    expect(montarTreino({ ...progressoInicial('c1', T0), sessoesFeitas: 2 }, cfg, T0)).toBeNull();
    const ruim = (s: string) => [t('leitura-cvcv', false, s), t('leitura-cvcv', false, s), t('leitura-cvcv', true, s)];
    const p = { ...comTentativas([...ruim('a'), ...ruim('b')]), sessoesFeitas: 2 };
    const treino = montarTreino(p, cfg, T0);
    if (treino) {
      expect(treino.pratica.motivo).toBe('pre-requisito');
      expect(treino.pratica.habilidade).toBe('silaba-cv');
      expect(treino.atividade.itens.every((i) => i.habilidade)).toBe(true);
    }
  });
});

describe('selos sem contar exposição nem autorrelato', () => {
  const cenaDe = (faseId: string, tipo: string): Cena => FASE_POR_ID[faseId].cenas.find((c) => c.atividade?.tipo === tipo)!;
  it('acertos de Letra/Espelho/Traçar/Falar não dão selo de habilidade; resposta conferida dá', () => {
    const exposicao = Array.from({ length: 30 }, () => t('vogal-e', true, 's', { mecanica: 'letra' }));
    const r1 = avaliarConquistas(comTentativas(exposicao), [], T0);
    expect(r1.novas.map((g) => g.id)).not.toContain('S-R1-03');
    const conferidas = Array.from({ length: 8 }, () => t('vogal-e', true, 's'));
    const r2 = avaliarConquistas(comTentativas(conferidas), [], T0);
    expect(r2.novas.map((g) => g.id)).toContain('S-R1-03');
    // com ajuda não conta
    const comAjuda = Array.from({ length: 8 }, () => t('vogal-e', true, 's', { comAjuda: true }));
    expect(avaliarConquistas(comTentativas(comAjuda), [], T0).novas.map((g) => g.id)).not.toContain('S-R1-03');
  });

  it('"Ler a primeira palavra sem ajuda" só com leitura conferida (o "Li!" do Falar não basta)', () => {
    const falar = cenaDe('R2a-F04', 'falar');
    let p = progressoInicial('c1', T0);
    p = aplicarAtividade(p, { sessao: 's', cena: falar, tentativas: [t('leitura-cvcv', true, 's', { mecanica: 'falar' })], tentouDeNovo: 0 }, cfg, T0);
    expect(avaliarConquistas(p, [], T0).novas.map((g) => g.id)).not.toContain('M-R2a-01');
    const ler = FASE_POR_ID['R2a-F04'].cenas.find((c) => c.atividade?.tipo === 'escolher' && c.atividade.habilidade === 'leitura-cvcv')!;
    p = aplicarAtividade(p, { sessao: 's', cena: ler, tentativas: [t('leitura-cvcv', true, 's', { alvo: 'lua', escolhido: 'lua' })], tentouDeNovo: 0 }, cfg, T0);
    expect(p.contadores['leu-sozinho-conferido']).toBe(1);
    expect(avaliarConquistas(p, [], T0).novas.map((g) => g.id)).toContain('M-R2a-01');
  });

  it('ditado: o selo conta palavras escritas CERTAS sem ajuda, não palavras tentadas', () => {
    const dit = cenaDe('R2a-F05', 'ditado');
    let p = progressoInicial('c1', T0);
    const erradas = Array.from({ length: 6 }, () => t('escrita-cvcv', false, 's', { mecanica: 'ditado' }));
    p = aplicarAtividade(p, { sessao: 's', cena: dit, tentativas: erradas, tentouDeNovo: 0, extras: { palavras: 6 } }, cfg, T0);
    expect(p.contadores['ditado-palavras']).toBe(6);
    expect(p.contadores['ditado-acertos'] ?? 0).toBe(0);
    expect(avaliarConquistas(p, [], T0).novas.map((g) => g.id)).not.toContain('S-R2a-07');
  });

  it('selos já ganhos ficam (nada é tirado), mesmo sem a evidência nova', () => {
    const p: Progresso = { ...progressoInicial('c1', T0), conquistas: { 'M-R2a-01': { id: 'M-R2a-01', nivel: 'unico', em: T0, vista: true }, 'S-R1-03': { id: 'S-R1-03', nivel: 'prata', em: T0, vista: true } } };
    const r = avaliarConquistas(p, [], T0 + DIA_MS);
    expect(r.progresso.conquistas['M-R2a-01']).toEqual(p.conquistas['M-R2a-01']);
    expect(r.progresso.conquistas['S-R1-03'].nivel).toBe('prata');
    expect(r.novas).toEqual([]);
  });

  it('selos de participação estão listados à parte e existem no catálogo', () => {
    expect(SELOS_DE_PARTICIPACAO).toEqual(expect.arrayContaining(['S-R1-02', 'S-R1-05', 'S-R2a-01']));
    expect(SELOS_DE_PARTICIPACAO).not.toContain('M-R2a-01');
  });
});
