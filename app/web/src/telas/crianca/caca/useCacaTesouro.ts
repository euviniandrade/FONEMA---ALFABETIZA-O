/**
 * CAÇA AO TESOURO DAS PALAVRAS no passeio 3D (fila do dono nº 25). Regras: packages/motor/src/caca-tesouro.ts. Desenho e chegada
 * nos baús: public/mundo3d/js/caca-tesouro.js (fonte em docs/propostas/06-fonema-unificada/mundo-3d-v2). Este gancho é o "juiz":
 * monta a rodada, toca o SOM PURO (regra 1) e as charadas, confere cada chegada/escolha, corrige com contraste e grava.
 *
 * O que conta (regra 4): a escolha da letra pelo som e a leitura final (tentativas AVALIADAS, mecânica 'caca-tesouro', contexto
 * 'livre'). Achar o lugar pela charada é EXPOSIÇÃO (exploração). Aquecimento (menos de 3 sons) é exposição. Moedinhas e baús
 * abertos são enfeite. Ajuda: "ouvir de novo" = sinal de dúvida; 1ª dica repete; 2ª dica = seta/brilho = 'resposta-mostrada'
 * (conta como ajuda, não como acerto sozinho). Sem cronômetro, sem placar.
 * As tentativas são gravadas de uma vez no fim da rodada ou quando a criança sai (porta, botão sair, voltar).
 */
import { useEffect, useRef, type RefObject } from 'react';
import { FALAS, FALAS_CACA, FALAS_ESCUTA, FASE_POR_ID, LUGAR_CACA_POR_ID, type Fala } from '@fonema/conteudo';
import {
  NOME_NIVEL_CACA, barcoLiberado, bausDaPalavra, idJogoCaca, niveisDaCaca, rodadaDaCaca,
  type BauCaca, type ItemJogo, type NivelAjuda, type NivelCaca, type OpcaoJogo, type PassoCaca, type Tentativa
} from '@fonema/motor';
import { useCrianca } from '../../../contexto.tsx';
import { caminhoFigura } from '../../../componentes/ui.tsx';
import { voz } from '../../../servicos/voz.ts';
import { espera, modoTeste } from '../../../servicos/ambiente.ts';
import { falar } from '../../../util.ts';
import { sementeDaTentativa } from '../../../mecanicas/comum.tsx';
import { registro } from '../../../mecanicas/tf-comum.tsx';
import { comemorar, corrigirEscolha, tocarSom } from '../../../mecanicas/jogos/correcao.ts';
import { useSonsComClipe } from '../../../mecanicas/jogos/JogoFonico.tsx';
import { useRegistroLivre } from '../Biblioteca.tsx';
import { letraAa } from '../../../componentes/LetraAa.tsx'; // fila nº 27 (4)

interface Msg { tipo: string; detalhe?: Record<string, unknown> }
/** Para os testes (E2E): o que o juiz espera agora. Não entrega nada à criança (fica na janela do app, fora da tela). */
const juiz = (x: Record<string, unknown> | null) => { (window as unknown as { FONEMA_CACA_JUIZ?: unknown }).FONEMA_CACA_JUIZ = x; };
const urlFigura = (w: string) => { const c = caminhoFigura(undefined, w); return c ? new URL(c, location.href).href : ''; };

/** Ordem da escada de ajuda (a maior vale). */
const maiorAjuda = (a: NivelAjuda | undefined, b: NivelAjuda): NivelAjuda => {
  const ordem: NivelAjuda[] = ['nenhuma', 'repetiu', 'contraste', 'caminho', 'resposta-mostrada'];
  return !a || ordem.indexOf(b) > ordem.indexOf(a) ? b : a;
};

export function useCacaNoPasseio(ref: RefObject<HTMLIFrameElement | null>, criancaId: string, abrirDireto = false) {
  const { crianca, progresso, recarregar } = useCrianca(criancaId);
  const reg = useRegistroLivre(criancaId);
  const sons = useSonsComClipe();
  const temSom = sons ? (f: string) => sons.has(f) : undefined;
  const d = useRef({ crianca, progresso, reg, temSom, recarregar });
  d.current = { crianca, progresso, reg, temSom, recarregar };
  const pronta = useRef(false);
  const abriuMenu = useRef(false);
  const rodada = useRef(0);
  const esperando = useRef<{ tipos: string[]; res: (m: Msg | null) => void } | null>(null);
  /** Chegadas/escolhas que vieram antes de o juiz estar esperando (a criança anda enquanto a Sofia fala). */
  const fila = useRef<Msg[]>([]);
  const atual = useRef<{ ouvir: () => void; dica: () => void } | null>(null);
  const pendentes = useRef<{ cena: { id: string; titulo: string }; ts: Tentativa[] } | null>(null);

  const enviar = (tipo: string, detalhe: unknown = {}) => ref.current?.contentWindow?.postMessage({ tipo, detalhe }, '*');
  const mandarNiveis = (abrir: boolean) => {
    const { progresso: p, temSom: ts } = d.current;
    if (!p || !ts) return;
    const niveis = niveisDaCaca(p, ts);
    if (modoTeste()) console.info('[caca] níveis', niveis.map((n) => `${n.nivel}:${n.aberto ? 1 : 0}`).join(' '));
    enviar('fonema:caca-niveis', { niveis, abrir, barco: barcoLiberado(p), falaBarco: FALAS_CACA.barco });
  };
  /** Fila nº 29: o "próximo passo" do passeio livre é a missão de hoje (porta da Escola); o lembrete usa a fala já gravada do Tales. */
  const mandarGuia = () => {
    const p = d.current.progresso;
    if (!p) return;
    const titulo = FASE_POR_ID[p.faseAtual]?.titulo;
    enviar('fonema:guia', { missao: { texto: titulo ? `Missão de hoje: ${titulo}` : 'Missão de hoje: vá até a Escola', fala: FALAS_CACA.missaoHoje, lembrete: { quem: 'tales', texto: 'Agora é com você, [NOME]! Vamos continuar a missão?' } } });
  };
  /** Grava o que a rodada juntou (uma vez). `fimNivel` anota a rodada feita (é o que abre o nível seguinte e o barco). */
  const gravar = async (fimNivel?: { nivel: NivelCaca; acertos: number; total: number }) => {
    const pend = pendentes.current; pendentes.current = null;
    if (!pend) return;
    await d.current.reg.salvar(pend.cena, pend.ts, fimNivel ? (x) => ({ ...x, jogos: [...x.jogos, { id: idJogoCaca(fimNivel.nivel), em: Date.now(), acertos: fimNivel.acertos, total: fimNivel.total }] }) : (x) => x);
    // o registro grava pelo seu próprio estado: relê o progresso aqui (abre o nível seguinte e o barco)
    await d.current.recarregar();
  };
  const parar = () => {
    rodada.current++;
    esperando.current?.res(null); esperando.current = null; atual.current = null;
    voz.parar();
    void gravar();
  };

  // níveis: quando a página fica pronta e sempre que o progresso muda (abre nível novo / o barco)
  useEffect(() => {
    if (!pronta.current || !sons) return;
    mandarNiveis(abrirDireto && !abriuMenu.current);
    abriuMenu.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progresso, sons]);
  useEffect(() => () => parar(), []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const ouvir = (e: MessageEvent) => {
      if (!ref.current || e.source !== ref.current.contentWindow) return;
      const m = e.data as Msg;
      if (!m || typeof m.tipo !== 'string' || !m.tipo.startsWith('fonema:caca')) return;
      if (m.tipo === 'fonema:caca-pronta') {
        pronta.current = true;
        mandarGuia();
        if (d.current.temSom) { mandarNiveis(abrirDireto && !abriuMenu.current); abriuMenu.current = true; }
        return;
      }
      if (m.tipo === 'fonema:caca-comecar') { parar(); void jogar(Number(m.detalhe?.nivel) as NivelCaca).catch((err) => console.warn('[caca] a rodada parou', err)); return; }
      if (m.tipo === 'fonema:caca-sair') { parar(); mandarNiveis(false); return; }
      if (m.tipo === 'fonema:caca-ouvir') { atual.current?.ouvir(); return; }
      if (m.tipo === 'fonema:caca-dica') { atual.current?.dica(); return; }
      const w = esperando.current;
      if (w && w.tipos.includes(m.tipo)) { esperando.current = null; w.res(m); }
      else if (m.tipo === 'fonema:caca-chegou' || m.tipo === 'fonema:caca-escolha') fila.current.push(m);
    };
    window.addEventListener('message', ouvir);
    return () => window.removeEventListener('message', ouvir);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abrirDireto]);

  /* ------------------------------------------------------------ uma rodada ------------------------------------------------------------ */
  async function jogar(nivel: NivelCaca) {
    const { crianca: c, progresso: p, temSom: ts, reg: rg } = d.current;
    if (!c || !p || !ts) return;
    const token = ++rodada.current;
    const vivo = () => token === rodada.current;
    const r = rodadaDaCaca(p, { nivel, semente: sementeDaTentativa() || (Date.now() % 100000) + 1, temSom: ts });
    if (!r.passos.length) return;
    const cena = { id: `livre-caca-${nivel}`, titulo: `Caça ao tesouro: ${NOME_NIVEL_CACA[nivel]}` };
    const tentativas: Tentativa[] = [];
    pendentes.current = { cena, ts: tentativas };
    const diz = (f: Fala | string) => (vivo() ? falar(typeof f === 'string' ? { quem: 'sofia', texto: f } : f, c) : Promise.resolve());
    fila.current = [];
    const esperar = (tipos: string[]) => new Promise<Msg | null>((res) => {
      const i = fila.current.findIndex((m) => tipos.includes(m.tipo));
      if (i >= 0) { res(fila.current.splice(i, 1)[0]); return; }
      esperando.current = { tipos, res };
    });
    const base = (ps: PassoCaca) => ({ habilidade: ps.habilidade, sessao: rg.sessao, cena: cena.id, mecanica: 'caca-tesouro' as const, categoria: ps.categoria });
    const comoItem = (ps: PassoCaca): ItemJogo => ({ correta: ps.alvo, somAlvo: ps.somAlvo, opcoes: ps.opcoes ?? [], posicaoCerta: ps.posicaoCerta ?? 0, habilidade: ps.habilidade, formato: ps.formato === 'som-figura' ? 'som-figura' : 'som-letra', categoria: ps.categoria });
    const comoOpcao = (b: BauCaca): OpcaoJogo => ({ id: b.letra ?? b.figura ?? b.id, ...(b.letra ? { letra: b.letra } : { figura: b.figura, falar: b.figura }), som: b.som });
    const bauParaPagina = (b: BauCaca) => ({ id: b.id, x: b.x, z: b.z, letra: b.letra, rotulo: b.letra ? letraAa(b.letra) : undefined, figura: b.figura ? urlFigura(b.figura) : undefined, modo: b.lugar ? LUGAR_CACA_POR_ID[b.lugar].modo : 'terra', lugar: b.lugar });
    let acertos = 0, total = 0;
    const achados: string[] = [];

    if (r.palavra) enviar('fonema:caca-faixa', { letras: r.palavra.letras.map(() => null) });
    else enviar('fonema:caca-faixa', { letras: null });
    if (nivel === 2) enviar('fonema:caca-baus', { baus: r.passos[0].baus.map(bauParaPagina), titulo: NOME_NIVEL_CACA[2], moedas: true });

    for (let k = 0; k < r.passos.length; k++) {
      const ps = r.passos[k];
      if (!vivo()) return;
      let ajuda: NivelAjuda | undefined;
      let ouviu = 0, dicas = 0;
      const respostas: string[] = [];
      let erros = 0;

      if (ps.modo === 'andar') {
        /* -------- níveis 1 e 2: andar até o baú certo -------- */
        const { visiveis, certos } = nivel === 2 ? bausDaPalavra(ps, achados) : { visiveis: ps.baus, certos: ps.corretas };
        if (nivel === 1) enviar('fonema:caca-baus', { baus: visiveis.map(bauParaPagina), titulo: NOME_NIVEL_CACA[1], moedas: k === 0 });
        else for (const b of visiveis) enviar('fonema:caca-bau', { id: b.id, estado: 'fechado' });
        if (k === 0) await diz(nivel === 2 ? FALAS_CACA.palavra : r.aquecimento ? FALAS_CACA.sonsFigura : FALAS_CACA.sons);
        if (!vivo()) return;
        const mostrarCerto = () => { ajuda = 'resposta-mostrada'; enviar('fonema:caca-seta', { id: certos[0] }); };
        atual.current = {
          ouvir: () => { ouviu++; void tocarSom(ps.somAlvo, 1); },
          dica: () => { dicas++; if (dicas === 1) { ajuda = maiorAjuda(ajuda, 'repetiu'); void tocarSom(ps.somAlvo, 2); } else mostrarCerto(); }
        };
        juiz({ nivel, k, modo: 'andar', certos, somAlvo: ps.somAlvo });
        await tocarSom(ps.somAlvo, 2);
        const inicio = Date.now();
        for (;;) {
          const m = await esperar(['fonema:caca-chegou']);
          if (!m || !vivo()) return;
          const id = String(m.detalhe?.id ?? '');
          const bau = visiveis.find((b) => b.id === id);
          if (!bau) { enviar('fonema:caca-bau', { id, estado: 'fechado' }); continue; }
          respostas.push(bau.letra ?? bau.som);
          if (modoTeste()) console.info('[caca] baú', id, certos.includes(id) ? 'certo' : 'errado');
          if (certos.includes(id)) {
            enviar('fonema:caca-bau', { id, estado: 'certo', ...(nivel === 2 ? { voa: ps.indice } : {}) });
            enviar('fonema:caca-seta', { id: null });
            if (nivel === 2) { achados.push(id); setTimeout(() => enviar('fonema:caca-bau', { id, estado: 'sumir' }), 900); }
            const alvo = nivel === 1 && r.aquecimento ? ps.somAlvo : ps.alvo;
            tentativas.push({
              ...registro({ ...base(ps), alvo, respostas: respostas.map((x) => (r.aquecimento ? visiveis.find((b) => (b.letra ?? b.som) === x)?.som ?? x : x)), distratores: ps.distratores, inicio, nOpcoes: visiveis.length, ouviuDeNovo: ouviu, ...(ajuda ? { ajuda: maiorAjuda(ajuda, erros === 1 ? 'contraste' : erros >= 2 ? 'caminho' : 'nenhuma') } : {}) }),
              formato: ps.formato, contexto: 'livre', ...(ps.aquecimento ? { tipo: 'exposicao' as const } : {})
            });
            total++; if (erros === 0 && ajuda !== 'resposta-mostrada') acertos++;
            await comemorar(comoItem(ps), k, erros, c, diz);
            break;
          }
          erros++;
          enviar('fonema:caca-bau', { id, estado: 'tentado' });
          if (erros === 1) await corrigirEscolha(comoItem(ps), comoOpcao(bau), diz, vivo);
          else { mostrarCerto(); await diz({ quem: 'sofia', texto: FALAS.erro2 }); }
          if (!vivo()) return;
          if (erros === 1) await tocarSom(ps.somAlvo, 1);
          if (modoTeste()) console.info('[caca] correção feita');
        }
      } else {
        /* -------- níveis 3 e 4: charada até o lugar, depois a letra do som -------- */
        const lugar = LUGAR_CACA_POR_ID[ps.lugar!];
        enviar('fonema:caca-baus', { baus: ps.baus.map(bauParaPagina), charada: { texto: lugar.charada.texto, icone: lugar.icone }, apresenta: { lugar: lugar.id, texto: lugar.apresenta }, moedas: k === 0 });
        if (k === 0) await diz(nivel === 4 ? FALAS_CACA.agua : FALAS_CACA.charadas);
        if (!vivo()) return;
        let ajudaLugar: NivelAjuda = 'nenhuma';
        atual.current = {
          ouvir: () => { void diz(lugar.charada); },
          dica: () => { dicas++; if (dicas === 1) { ajudaLugar = 'repetiu'; void diz(lugar.charada); } else { ajudaLugar = 'caminho'; enviar('fonema:caca-seta', { id: ps.baus[0].id }); } }
        };
        juiz({ nivel, k, modo: 'lugar', bau: ps.baus[0].id, lugar: lugar.id, posicaoCerta: ps.posicaoCerta });
        await diz(lugar.charada);
        const inicioLugar = Date.now();
        const chegou = await esperar(['fonema:caca-chegou']);
        if (!chegou || !vivo()) return;
        enviar('fonema:caca-seta', { id: null });
        // achar o lugar = exploração (exposição: não conta para o domínio)
        tentativas.push({ ...registro({ ...base(ps), categoria: 'outro', alvo: lugar.id, respostas: [lugar.id], distratores: [], inicio: inicioLugar, tipo: 'exposicao', ajuda: ajudaLugar }), formato: 'charada-lugar', contexto: 'livre' });
        // o baú abre: 3 letras e o som
        const opcoes = ps.opcoes!;
        const marcadas: string[] = [];
        let brilha: string | undefined;
        const painel = () => enviar('fonema:caca-escolher', { titulo: 'Qual letra faz este som?', opcoes: opcoes.map((o) => ({ id: o.id, letra: o.letra, rotulo: o.letra ? letraAa(o.letra) : undefined })), marcadas, brilha });
        painel();
        dicas = 0;
        const mostrarCerto = () => { ajuda = 'resposta-mostrada'; brilha = opcoes[ps.posicaoCerta!].id; painel(); };
        atual.current = {
          ouvir: () => { ouviu++; void tocarSom(ps.somAlvo, 1); },
          dica: () => { dicas++; if (dicas === 1) { ajuda = maiorAjuda(ajuda, 'repetiu'); void tocarSom(ps.somAlvo, 2); } else mostrarCerto(); }
        };
        juiz({ nivel, k, modo: 'escolher', posicaoCerta: ps.posicaoCerta });
        await diz(FALAS_CACA.qualLetra);
        await tocarSom(ps.somAlvo, 2);
        const inicio = Date.now();
        let posEscolhida: number | undefined;
        for (;;) {
          const m = await esperar(['fonema:caca-escolha']);
          if (!m || !vivo()) return;
          const pos = Number(m.detalhe?.pos);
          const o = opcoes[pos];
          if (!o || marcadas.includes(o.id)) continue;
          respostas.push(o.id); posEscolhida ??= pos;
          if (pos === ps.posicaoCerta) {
            enviar('fonema:caca-fechar-painel');
            enviar('fonema:caca-bau', { id: ps.baus[0].id, estado: 'certo' });
            setTimeout(() => enviar('fonema:caca-bau', { id: ps.baus[0].id, estado: 'sumir' }), 1400);
            tentativas.push({
              ...registro({ ...base(ps), alvo: ps.alvo, respostas, distratores: ps.distratores, inicio, posicaoCerta: ps.posicaoCerta, posicaoEscolhida: posEscolhida, nOpcoes: opcoes.length, ouviuDeNovo: ouviu, ...(ajuda ? { ajuda: maiorAjuda(ajuda, erros === 1 ? 'contraste' : erros >= 2 ? 'caminho' : 'nenhuma') } : {}) }),
              formato: 'som-letra', contexto: 'livre'
            });
            total++; if (erros === 0 && ajuda !== 'resposta-mostrada') acertos++;
            await comemorar(comoItem(ps), k, erros, c, diz);
            break;
          }
          erros++;
          marcadas.push(o.id); painel();
          if (erros === 1) { await corrigirEscolha(comoItem(ps), o, diz, vivo); if (vivo()) await tocarSom(ps.somAlvo, 1); }
          else { mostrarCerto(); await diz({ quem: 'sofia', texto: FALAS.erro2 }); }
          if (!vivo()) return;
        }
      }
      atual.current = null;
      await espera(modoTeste() ? 30 : 500);
    }

    /* -------- nível 2: ler a palavra montada e escolher a figura -------- */
    if (r.palavra && vivo()) {
      const w = r.palavra;
      const marcadas: string[] = [];
      let brilha: string | undefined;
      let ajuda: NivelAjuda | undefined;
      let dicas = 0, erros = 0;
      const respostas: string[] = [];
      const painel = () => enviar('fonema:caca-escolher', { palavra: w.texto, titulo: 'Leia e toque na figura', opcoes: w.figuras.map((f) => ({ id: f, figura: urlFigura(f) })), marcadas, brilha });
      enviar('fonema:caca-faixa', { letras: w.letras });
      painel();
      const mostrarCerto = () => { ajuda = 'resposta-mostrada'; brilha = w.figuras[w.posicaoCerta]; painel(); };
      // a palavra NUNCA é dita antes da escolha (04 R9): a dica mostra o caminho (as letras, som por som) e depois a figura
      atual.current = {
        ouvir: () => { void diz(FALAS_CACA.lerPalavra); },
        dica: () => { dicas++; if (dicas === 1) { ajuda = maiorAjuda(ajuda, 'caminho'); void (async () => { for (const s of w.sons) { if (!vivo()) return; await tocarSom(s, 1); await espera(250); } })(); } else mostrarCerto(); }
      };
      juiz({ nivel, modo: 'palavra', posicaoCerta: w.posicaoCerta, palavra: w.texto });
      await diz(FALAS_CACA.lerPalavra);
      const inicio = Date.now();
      let posEscolhida: number | undefined;
      for (;;) {
        const m = await esperar(['fonema:caca-escolha']);
        if (!m || !vivo()) return;
        const pos = Number(m.detalhe?.pos);
        const f = w.figuras[pos];
        if (!f || marcadas.includes(f)) continue;
        respostas.push(f); posEscolhida ??= pos;
        if (pos === w.posicaoCerta) {
          enviar('fonema:caca-fechar-painel');
          tentativas.push({
            ...registro({ habilidade: w.habilidade, sessao: rg.sessao, cena: cena.id, mecanica: 'caca-tesouro', categoria: 'palavra', alvo: f, respostas, distratores: w.figuras.filter((x) => x !== f), inicio, posicaoCerta: w.posicaoCerta, posicaoEscolhida: posEscolhida, nOpcoes: 3, ...(ajuda ? { ajuda: maiorAjuda(ajuda, erros === 1 ? 'contraste' : erros >= 2 ? 'caminho' : 'nenhuma') } : {}) }),
            formato: 'caca-palavra', contexto: 'livre'
          });
          total++; if (erros === 0 && ajuda !== 'resposta-mostrada') acertos++;
          await voz.falar(f, { quem: 'sofia' });
          await diz({ quem: 'sofia', texto: FALAS.acertos[1] });
          break;
        }
        erros++;
        marcadas.push(f); painel();
        if (erros === 1) await diz(FALAS_CACA.leDeNovo);
        else { mostrarCerto(); await diz({ quem: 'sofia', texto: FALAS.erro2 }); }
        if (!vivo()) return;
      }
    }
    if (!vivo()) return;
    atual.current = null;
    const ganhouBarco = nivel === 3 && !barcoLiberado(p);
    // fila nº 30: o aviso diz para que serve a chave e onde usar; `chave` faz o guia do passeio apontar o píer até embarcar
    enviar('fonema:caca-fim', { texto: ganhouBarco ? 'Você ganhou a chave do barquinho! Ela abre o barco no píer: siga as moedinhas.' : `${NOME_NIVEL_CACA[nivel]}: tesouro completo!`, chave: ganhouBarco });
    await diz(FALAS_ESCUTA.muitoBem);
    if (ganhouBarco) await diz(FALAS_CACA.chave);
    await gravar({ nivel, acertos, total });
    juiz({ nivel, fim: true, acertos, total });
    enviar('fonema:caca-faixa', { letras: null });
  }
}
