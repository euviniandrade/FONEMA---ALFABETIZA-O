import { useEffect, useLayoutEffect, useMemo, useRef, useState, type PointerEvent as EventoPonteiro, type ReactNode } from 'react';
import { FALAS, FALAS_FONICAS, contrasteDosSons, surdoESonoro, type AtividadeLigar } from '@fonema/conteudo';
import { Balao, Brilho } from '../componentes/basicos.tsx';
import { Figura, Icone } from '../componentes/ui.tsx';
import { efeitos } from '../servicos/efeitos.ts';
import { espera } from '../servicos/ambiente.ts';
import { voz } from '../servicos/voz.ts';
import { falar, textoVoz } from '../util.ts';
import { embaralhar, sementeDaTentativa, sortearItens, tentativa, type PropsMecanica } from './comum.tsx';

type Lado = 'letra' | 'cena';
interface Ponta { lado: Lado; letra: string }
const F = FALAS_FONICAS;
const CORES = ['#2F86D6', '#3DAA6B', '#F08A24', '#9B5DE5'];

/**
 * LIGA O SOM (D030): 3–4 LETRAS de um lado e 3–4 CENAS do outro; a criança toca numa e na outra (ou arrasta) para
 * formar os pares. Sem texto. Tocar numa CENA toca o som que ela faz (a abelha: zzz); a letra fica calada — quem liga
 * precisa saber o som da letra. Cada ligação certa toca o SOM REAL.
 * Erro: correção contrastiva (o som da letra, o som da cena, o que muda); na 3ª tentativa da mesma letra, a cena
 * certa brilha e o par fica registrado "com ajuda". Posições sorteadas a cada vez.
 */
export function Ligar({ atividade, crianca, sessao, cenaId, revisao, onFim }: PropsMecanica<AtividadeLigar>) {
  const semente = useMemo(sementeDaTentativa, []);
  const pares = useMemo(() => sortearItens(atividade.pares, atividade.sortear ?? 4, semente).slice(0, 4), [atividade, semente]);
  const letras = useMemo(() => embaralhar(pares, semente), [pares, semente]);
  // no modo de teste (sem sorteio) as cenas ficam uma casa à frente, para o par nunca ficar lado a lado
  const cenas = useMemo(() => (semente ? embaralhar(pares, semente * 31 + 7) : [...pares.slice(1), pares[0]]), [pares, semente]);
  const [sel, setSel] = useState<Ponta | null>(null);
  const [feitas, setFeitas] = useState<string[]>([]);
  const [erros, setErros] = useState<Record<string, number>>({});
  const [balanca, setBalanca] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);
  const [linhas, setLinhas] = useState<{ letra: string; x1: number; y1: number; x2: number; y2: number }[]>([]);
  const [arrasto, setArrasto] = useState<{ de: Ponta; x1: number; y1: number; x: number; y: number } | null>(null);
  const palco = useRef<HTMLDivElement>(null);
  const tents = useRef<ReturnType<typeof tentativa>[]>([]);
  const respostas = useRef<Record<string, string[]>>({});
  const inicio = useRef(Date.now());
  const deNovo = useRef(0);
  const vivo = useRef(true);
  const parDe = (letra: string) => pares.find((p) => p.letra === letra)!;
  const diz = (texto: string) => voz.falar(textoVoz(texto, crianca), { quem: 'sofia' });
  const tocarSom = async (fonema: string | null) => { if (fonema && (await voz.temSomReal(fonema))) await voz.somReal(fonema, 1); };

  useEffect(() => {
    vivo.current = true;
    (async () => { await falar(atividade.enunciado, crianca); inicio.current = Date.now(); })();
    return () => { vivo.current = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Centro da borda de dentro de um cartão, relativo ao palco (para desenhar a linha). */
  const ancora = (p: Ponta): { x: number; y: number } | null => {
    const el = palco.current?.querySelector<HTMLElement>(`[data-liga-${p.lado}="${p.letra}"]`);
    const base = palco.current?.getBoundingClientRect();
    if (!el || !base) return null;
    const r = el.getBoundingClientRect();
    return { x: (p.lado === 'letra' ? r.right : r.left) - base.left, y: r.top + r.height / 2 - base.top };
  };
  useLayoutEffect(() => {
    const medir = () => setLinhas(feitas.flatMap((letra) => {
      const a = ancora({ lado: 'letra', letra });
      const b = ancora({ lado: 'cena', letra });
      return a && b ? [{ letra, x1: a.x, y1: a.y, x2: b.x, y2: b.y }] : [];
    }));
    medir();
    window.addEventListener('resize', medir);
    return () => window.removeEventListener('resize', medir);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feitas]);

  const corrigir = async (letra: string, cena: string) => {
    const a = parDe(letra).fonema;
    const b = parDe(cena).fonema;
    if (!a || !b || !(await voz.temSomReal(a)) || !(await voz.temSomReal(b))) { await diz(FALAS.erro1); return; }
    const contraste = contrasteDosSons(a, b);
    setAviso(contraste === 'voz' ? 'Um som tem voz e o outro não. Escute os dois e tente de novo.' : 'São dois sons diferentes. Escute os dois e tente de novo.');
    await diz(F.letraFaz); await voz.somReal(a, 1); await espera(200);
    await diz(F.cenaFaz); await voz.somReal(b, 1); await espera(200);
    const par = contraste === 'voz' ? surdoESonoro(a, b) : null;
    if (par) { await diz(F.semVoz); await voz.somReal(par[0], 1); await diz(F.comVoz); await voz.somReal(par[1], 1); await diz(F.maoNoPescoco); }
    else if (contraste === 'boca') await diz(F.bocaMuda);
    await diz(F.tentaDeNovo);
  };

  const ligar = async (letra: string, cena: string) => {
    if (ocupado || feitas.includes(letra) || feitas.includes(cena)) return;
    setSel(null);
    (respostas.current[letra] ??= []).push(cena);
    if (letra === cena) {
      const e = erros[letra] ?? 0;
      const novas = [...feitas, letra];
      setFeitas(novas);
      setAviso(null);
      efeitos.acerto();
      const p = parDe(letra);
      tents.current.push(tentativa(p.habilidade ?? atividade.habilidade, sessao, cenaId, e, {
        revisao, mecanica: 'ligar', tipo: 'avaliada', alvo: letra, categoria: 'grafema', escolhido: respostas.current[letra][0], respostas: [...respostas.current[letra]],
        distratores: pares.filter((x) => x.letra !== letra).map((x) => x.letra), tempoMs: Date.now() - inicio.current, tentativaNumero: e + 1
      }));
      if (e) deNovo.current++;
      setOcupado(true);
      await tocarSom(p.fonema);
      if (!vivo.current) return;
      setOcupado(false);
      inicio.current = Date.now();
      if (novas.length === pares.length) {
        await voz.falar(textoVoz(atividade.comemora?.texto ?? FALAS.acertos[1], crianca), { quem: atividade.comemora?.quem ?? 'sofia' });
        await espera(500);
        if (vivo.current) onFim({ tentativas: tents.current, tentouDeNovo: deNovo.current });
      }
      return;
    }
    const e = (erros[letra] ?? 0) + 1;
    setErros((x) => ({ ...x, [letra]: e }));
    efeitos.suave();
    setBalanca(cena);
    setTimeout(() => setBalanca(null), 500);
    setOcupado(true);
    try {
      if (e === 1) await corrigir(letra, cena);
      else { setAviso(FALAS.erro2); setSel({ lado: 'letra', letra }); await diz(FALAS.erro2); }
    } finally {
      if (vivo.current) setOcupado(false);
    }
  };

  /** Toque (ou fim do arrasto) numa ponta: escolhe a ponta ou fecha o par com a ponta já escolhida do outro lado. */
  const tocar = (p: Ponta, de: Ponta | null = sel) => {
    if (ocupado || feitas.includes(p.letra)) return;
    efeitos.toque();
    if (de && de.lado !== p.lado) { void (p.lado === 'cena' ? ligar(de.letra, p.letra) : ligar(p.letra, de.letra)); return; }
    setSel(p);
    if (p.lado === 'cena') void tocarSom(parDe(p.letra).fonema); // a cena faz o som dela
  };

  const pontaDoEvento = (ev: EventoPonteiro): Ponta | null => {
    const el = (document.elementFromPoint(ev.clientX, ev.clientY) as HTMLElement | null)?.closest<HTMLElement>('[data-liga-letra],[data-liga-cena]');
    if (!el) return null;
    return el.dataset.ligaLetra ? { lado: 'letra', letra: el.dataset.ligaLetra } : { lado: 'cena', letra: el.dataset.ligaCena! };
  };
  const aoDescer = (p: Ponta) => (ev: EventoPonteiro) => {
    if (ocupado || feitas.includes(p.letra)) return;
    const a = ancora(p);
    const base = palco.current?.getBoundingClientRect();
    if (a && base) setArrasto({ de: p, x1: a.x, y1: a.y, x: ev.clientX - base.left, y: ev.clientY - base.top });
  };
  const aoMover = (ev: EventoPonteiro) => {
    const base = palco.current?.getBoundingClientRect();
    if (arrasto && base) setArrasto({ ...arrasto, x: ev.clientX - base.left, y: ev.clientY - base.top });
  };
  const aoSoltar = (ev: EventoPonteiro) => {
    if (!arrasto) return;
    const de = arrasto.de;
    setArrasto(null);
    const p = pontaDoEvento(ev);
    if (!p) return;
    // soltou em cima de uma ponta do outro lado: fecha o par; soltou onde começou: é um toque
    if (p.lado !== de.lado) tocar(p, de);
    else if (p.letra === de.letra) tocar(p);
  };

  const cartao = (p: Ponta, k: number, conteudo: ReactNode, rotulo: string) => {
    const feita = feitas.includes(p.letra);
    const ordem = feitas.indexOf(p.letra);
    const brilha = p.lado === 'cena' && sel?.lado === 'letra' && sel.letra === p.letra && (erros[p.letra] ?? 0) >= 2 && !feita;
    return (
      <button
        key={`${p.lado}-${p.letra}`}
        className={`liga-cartao liga-${p.lado} ${sel?.lado === p.lado && sel.letra === p.letra ? 'sel' : ''} ${feita ? 'feita' : ''} ${balanca === p.letra && p.lado === 'cena' ? 'balanca' : ''} ${brilha ? 'modelo' : ''}`}
        style={feita ? { ['--cor' as string]: CORES[ordem % CORES.length] } : undefined}
        {...{ [`data-liga-${p.lado}`]: p.letra }}
        data-feita={feita ? '1' : undefined}
        aria-label={`${rotulo} ${k + 1}`}
        aria-pressed={sel?.lado === p.lado && sel.letra === p.letra}
        disabled={feita}
        onPointerDown={aoDescer(p)}
        onClick={(ev) => { if (ev.detail === 0) tocar(p); }}
      >
        {conteudo}
        {feita ? <Brilho ativo /> : null}
      </button>
    );
  };

  return (
    <div className="mec mec-ligar">
      <Balao fala={atividade.enunciado} crianca={crianca} />
      <div className="progressinho" aria-label={`${feitas.length} de ${pares.length} pares`}>{pares.map((p, k) => <i key={p.letra} className={k < feitas.length ? 'feito' : k === feitas.length ? 'agora' : ''} />)}</div>
      <div className={`liga-palco ${ocupado ? 'ouvindo' : ''}`} ref={palco} onPointerMove={aoMover} onPointerUp={aoSoltar} onPointerLeave={() => setArrasto(null)} data-testid="liga-o-som" data-pares={pares.length}>
        <svg className="liga-linhas" aria-hidden="true">
          {linhas.map((l) => <line key={l.letra} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke={CORES[feitas.indexOf(l.letra) % CORES.length]} />)}
          {arrasto ? <line className="liga-arrasto" x1={arrasto.x1} y1={arrasto.y1} x2={arrasto.x} y2={arrasto.y} /> : null}
        </svg>
        <div className="liga-coluna" role="group" aria-label="Letras">
          {letras.map((p, k) => cartao({ lado: 'letra', letra: p.letra }, k, <span className="letra">{p.letra}</span>, 'Letra'))}
        </div>
        <div className="liga-coluna" role="group" aria-label="Cenas: toque para ouvir o som">
          {cenas.map((p, k) => cartao({ lado: 'cena', letra: p.letra }, k, <><Figura palavra={p.cena} /><span className="liga-som"><Icone nome="som" /></span></>, 'Cena'))}
        </div>
      </div>
      {aviso ? <p className="aviso-acolhe" role="status"><Icone nome="dica" /><span>{aviso.replace('[NOME]', crianca.nome)}</span></p> : null}
    </div>
  );
}
