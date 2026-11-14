import { useEffect, useState } from 'react';
import { NIVEIS_INICIAIS, aplicarNivelInicial, opcoesPronuncia, progressoInicial, renderFala, type Crianca, type NivelInicial } from '@fonema/motor';
import type { Genero } from '@fonema/conteudo';
import { useApp } from '../../contexto.tsx';
import { navegar } from '../../rotas.ts';
import { Icone } from '../../componentes/ui.tsx';
import { Camada } from '../../componentes/Camada.tsx';
import { asset } from '../../servicos/ambiente.ts';
import { novoId } from '../../dados/repositorio.ts';
import { voz } from '../../servicos/voz.ts';
import { BASES } from '../crianca/Avatar.tsx';
import { Fluxo } from '../entrada/Entrada.tsx';
import type { PoseDupla } from '../../componentes/Dupla3D.tsx';

const ANO = new Date().getFullYear();
type Passo = 1 | 2 | 3 | 'entrega';
const IDADES = [3, 4, 5, 6, 7, 8];
const GENEROS: [Genero, string][] = [['m', 'Menino'], ['f', 'Menina'], ['n', 'Prefiro não informar']];
const FRASE_NIVEL: Record<NivelInicial, string> = {
  zero: 'Começa pelo alfabeto: cada letra e o som dela.',
  'letras-e-sons': 'Pula o alfabeto e começa juntando letras em sílabas.',
  'le-palavras': 'Começa lendo palavras sozinho, rumo às frases.'
};

/**
 * Cadastro da criança pelo adulto em 3 passos (D002, D013, D026), tudo sem rolagem:
 * 1 quem vai aprender (nome, idade, como a dupla fala) · 2 de onde começa · 3 resumo e autorização em um toque.
 * Apoios e rotina ficam para depois, na Área da Família.
 */
export function Cadastro({ area = 'familia' }: { area?: 'familia' | 'professor' }) {
  const { repo } = useApp();
  const [passo, setPasso] = useState<Passo>(1);
  const [nome, setNome] = useState('');
  const [idade, setIdade] = useState<number | null>(null);
  const [genero, setGenero] = useState<Genero | null>(null);
  const [nivel, setNivel] = useState<NivelInicial>('zero');
  const [autorizo, setAutorizo] = useState(false);
  const [falarNome, setFalarNome] = useState(true);
  const [tentou, setTentou] = useState(false);
  const [privacidade, setPrivacidade] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [ouvindo, setOuvindo] = useState(false);
  const [id] = useState(() => novoId('cr'));

  const primeiro = nome.trim().split(/\s+/)[0] ?? '';
  const nomeOk = primeiro.length >= 2 && /^[\p{L}'-]+$/u.test(primeiro);
  const nomeBonito = primeiro ? primeiro[0].toUpperCase() + primeiro.slice(1) : '';
  const [temClipe, setTemClipe] = useState<boolean | null>(null);
  useEffect(() => {
    let vivo = true;
    setTemClipe(null);
    if (nomeOk) voz.temNome(primeiro).then((t) => { if (vivo) setTemClipe(t); });
    return () => { vivo = false; };
  }, [primeiro, nomeOk]);
  const previa = genero ? renderFala('{Você está pronto|Você está pronta|Tudo pronto pra começar}, [NOME]?', { nome: nomeBonito || 'Mariana', genero }) : '';

  const ouvirNome = async () => {
    if (ouvindo) return;
    setOuvindo(true);
    try { await voz.ouvirNome(primeiro, 'sofia'); await new Promise((r) => setTimeout(r, 250)); await voz.ouvirNome(primeiro, 'tales'); } finally { setOuvindo(false); }
  };

  const salvar = async () => {
    setTentou(true);
    if (!autorizo || salvando) return;
    setSalvando(true);
    const agora = Date.now();
    const op = opcoesPronuncia(primeiro[0].toUpperCase() + primeiro.slice(1).toLowerCase())[0];
    const c: Crianca = {
      id,
      nome: nomeBonito,
      genero: genero ?? 'n',
      anoNascimento: ANO - (idade ?? 5),
      pronuncia: { grafia: temClipe ? nomeBonito : op.grafia, fala: op.fala, rate: op.rate, pitchExtra: op.pitchExtra, voz: 'sofia' },
      avatar: { base: BASES[0][0], cantinho: 'ceu' },
      // apoios e rotina: padrões; o adulto ajusta depois, na Área da Família
      apoios: { previsivel: false, focoCurto: false, leituraReforco: false, calmo: false },
      jaSabe: { letrasDoNome: nivel === 'zero' ? 'nao-sei' : 'sim', lePalavras: nivel === 'le-palavras' ? 'sim' : 'nao-sei', leFrases: 'nao-sei' },
      consentimentos: { responsavel: true, vozPrimeiroNome: falarNome, gravarVozAdulto: false, em: agora },
      rotina: { minutosDia: 15, horaDormir: '20:00' },
      criadoEm: agora
    };
    await repo.salvarCrianca(c);
    // D026: o nível inicial escolhido pelo adulto define o ponto de partida (do zero é o padrão)
    await repo.salvarProgresso(aplicarNivelInicial(progressoInicial(id, agora), nivel, agora));
    setSalvando(false);
    setPasso('entrega');
  };

  const passo1Ok = nomeOk && idade !== null && genero !== null;
  const avancar = () => {
    if (passo === 1) { setTentou(true); if (!passo1Ok) return; setTentou(false); setPasso(2); }
    else if (passo === 2) { setTentou(false); setPasso(3); }
  };

  const dupla: Record<string, [PoseDupla, string, string]> = {
    1: ['acenando', 'Sofia', 'Oi! Conte pra gente quem vai aprender.'],
    2: ['pensando', 'Tales', 'Na dúvida, escolha "Do zero". Dá para mudar depois.'],
    3: ['apontando', 'Sofia', `Falta só um toque para ${nomeBonito || 'a criança'} começar!`],
    entrega: ['comemorando', 'Sofia e Tales', `Tudo pronto! Estamos esperando ${nomeBonito}.`]
  };
  const [pose, quem, fala] = dupla[String(passo)];
  const rotuloNivel = NIVEIS_INICIAIS.find((n) => n.id === nivel)?.titulo ?? '';
  const rotuloGenero = GENEROS.find(([g]) => g === genero)?.[1] ?? '';

  if (passo === 'entrega') {
    return (
      <Fluxo titulo="Cadastro concluído" voltar={area} pose={pose} quem={quem} fala={fala} testId="cadastro-entrega">
        <section className="cartao fluxo-cartao entrega-cartao">
          <div className="fluxo-corpo entrega-corpo">
            <span className="etiqueta verde"><Icone nome="check" />Cadastro feito</span>
            <h1 className="t">Agora entregue o aparelho para {nomeBonito}.</h1>
            <p className="fluxo-sub">Fique por perto nos primeiros 10 minutos: é um momento especial. Daqui em diante, todo texto tem áudio.</p>
            <button className="btn enorme ipe brilha" onClick={() => navegar(`c/${id}/avatar`)} data-testid="entregar"><Icone nome="play" />Entregar para {nomeBonito}</button>
            <button className="link" onClick={() => navegar(area)}>Agora não: voltar para a {area === 'professor' ? 'Área do Professor' : 'Área da Família'}</button>
          </div>
        </section>
      </Fluxo>
    );
  }

  return (
    <Fluxo titulo="Cadastro da criança" voltar={area} pose={pose} quem={quem} fala={fala} testId="cadastro">
      <section className="cartao fluxo-cartao" data-passo={passo}>
        <div className="progresso" role="img" aria-label={`Passo ${passo} de 3`}>
          <span className="progresso-rotulo">Cadastro da criança · <b>{passo} de 3</b></span>
          <span className="progresso-barra tres"><i style={{ width: `${(passo / 3) * 100}%` }} /></span>
        </div>

        {passo === 1 ? (
          <div className="fluxo-corpo" key="p1">
            <h1 className="t">Quem vai aprender?</h1>
            <label className="campo campo-junto">
              <span className="sr">Primeiro nome da criança</span>
              <input className="nome-grande" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Primeiro nome" autoComplete="off" autoCapitalize="words" data-testid="campo-nome" aria-invalid={tentou && !nomeOk || undefined} />
            </label>
            <div className="nome-linha" aria-live="polite">
              {tentou && !nomeOk ? <small className="aviso-campo" role="alert">Escreva o primeiro nome da criança (só letras).</small>
                : nomeOk && temClipe ? <button type="button" className="ouvir-nome" onClick={ouvirNome} data-testid="ouvir-nome"><Icone nome="som" />{ouvindo ? 'Ouvindo…' : `Ouvir a Sofia e o Tales chamando ${nomeBonito}`}</button>
                : nomeOk && temClipe === false ? <small data-testid="nome-sem-gravacao">Em breve a dupla vai dizer este nome; por enquanto ele aparece escrito.</small>
                : nome.trim().includes(' ') ? <small>Usamos só o primeiro nome: <b>{nomeBonito}</b>.</small>
                : <small>Só o primeiro nome, ou como a família chama.</small>}
            </div>

            <div className={`grupo ${tentou && idade === null ? 'falta' : ''}`} role="group" aria-label="Idade">
              <span className="grupo-rotulo">Idade <em>(anos)</em>{tentou && idade === null ? <small className="aviso-campo" role="alert">Escolha a idade.</small> : null}</span>
              <div className="idades">
                {IDADES.map((i) => <button key={i} type="button" className="pilula" aria-pressed={idade === i} onClick={() => setIdade(i)} data-idade={i} aria-label={i === 8 ? '8 anos ou mais' : `${i} anos`}>{i === 8 ? '8+' : i}</button>)}
              </div>
            </div>

            <div className={`grupo ${tentou && genero === null ? 'falta' : ''}`} role="group" aria-label="Como a dupla fala com a criança">
              <span className="grupo-rotulo">Como a dupla fala com {nomeOk ? nomeBonito : 'a criança'}?{tentou && genero === null ? <small className="aviso-campo" role="alert">Escolha uma opção.</small> : null}</span>
              <div className="generos">
                {GENEROS.map(([g, r]) => <button key={g} type="button" className="pilula" aria-pressed={genero === g} onClick={() => setGenero(g)} data-genero={g}>{r}</button>)}
              </div>
              <p className="previa-curta previa" data-vazia={!previa || undefined}>{previa ? <>A dupla diz: <b>“{previa}”</b></> : 'É só para a dupla dizer “pronto” ou “pronta”.'}</p>
            </div>
          </div>
        ) : null}

        {passo === 2 ? (
          <div className="fluxo-corpo" key="p2">
            <h1 className="t">De onde {nomeBonito} começa?</h1>
            <p className="fluxo-sub">Escolha o que mais parece com {nomeBonito} hoje.</p>
            <div className="niveis" role="group" aria-label="Nível inicial">
              {NIVEIS_INICIAIS.map((n) => (
                <button key={n.id} type="button" className="nivel" aria-pressed={nivel === n.id} onClick={() => setNivel(n.id)} data-nivel={n.id}>
                  {n.id === 'zero' ? <span className="etiqueta verde recomendado">Recomendado</span> : null}
                  <span className="nivel-arte">
                    {n.id === 'zero' ? <img src={asset('figuras/muda.webp')} alt="" /> : n.id === 'letras-e-sons' ? <span className="mini-pecas" aria-hidden="true"><span>A</span><span>M</span><span>L</span></span> : <img src={asset('recompensas/bau-livros.webp')} alt="" />}
                  </span>
                  <span className="nivel-texto"><b>{n.titulo}</b><small>{FRASE_NIVEL[n.id]}</small></span>
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {passo === 3 ? (
          <div className="fluxo-corpo" key="p3">
            <h1 className="t">Tudo certo?</h1>
            <dl className="resumo">
              <div><dt>Nome</dt><dd>{nomeBonito}</dd><button className="link" onClick={() => setPasso(1)} aria-label="Mudar o nome">mudar</button></div>
              <div><dt>Idade</dt><dd>{idade === 8 ? '8 anos ou mais' : `${idade} anos`}</dd><button className="link" onClick={() => setPasso(1)} aria-label="Mudar a idade">mudar</button></div>
              <div><dt>A dupla fala como</dt><dd>{rotuloGenero}</dd><button className="link" onClick={() => setPasso(1)} aria-label="Mudar como a dupla fala">mudar</button></div>
              <div><dt>Começa</dt><dd>{rotuloNivel}</dd><button className="link" onClick={() => setPasso(2)} aria-label="Mudar de onde começa">mudar</button></div>
            </dl>
            <label className={`autorizo ${tentou && !autorizo ? 'falta' : ''}`}>
              <input type="checkbox" checked={autorizo} onChange={(e) => setAutorizo(e.target.checked)} data-testid="cons-responsavel" />
              <i className="autorizo-caixa" aria-hidden="true"><Icone nome="check" /></i>
              <span><b>{area === 'professor' ? `Tenho autorização da família de ${nomeBonito}` : `Sou responsável por ${nomeBonito} e autorizo`}</b><small>o uso do FONEMA neste aparelho.</small></span>
            </label>
            <p className="autorizo-nota">
              {tentou && !autorizo ? <span className="aviso-campo" role="alert">Toque na autorização para continuar. </span> : null}
              Não pedimos foto, sobrenome nem documento. <button className="link" onClick={() => setPrivacidade(true)} data-testid="ver-privacidade">ver detalhes de privacidade</button>
            </p>
          </div>
        ) : null}

        <footer className="fluxo-pe">
          {passo > 1 ? <button className="btn" onClick={() => { setTentou(false); setPasso((passo - 1) as Passo); }} data-testid="cadastro-voltar"><Icone nome="seta-esq" />Voltar</button> : <button className="btn" onClick={() => navegar(area)}><Icone nome="seta-esq" />Voltar</button>}
          {passo === 1 ? <button className="btn grande pri" onClick={avancar} data-incompleto={!passo1Ok || undefined} data-testid="cadastro-continuar">Continuar<Icone nome="seta" /></button> : null}
          {passo === 2 ? <button className="btn grande pri" onClick={avancar} data-testid="nivel-continuar">Continuar<Icone nome="seta" /></button> : null}
          {passo === 3 ? <button className="btn grande ipe brilha" onClick={salvar} data-incompleto={!autorizo || undefined} data-testid="salvar-crianca"><Icone nome="play" />Começar a aventura com {nomeBonito}</button> : null}
        </footer>
      </section>

      {privacidade ? (
        <Camada titulo="Privacidade, em palavras simples" aoFechar={() => setPrivacidade(false)} testId="painel-privacidade">
          <ul className="privacidade">
            <li><Icone nome="escudo" /><span><b>O que guardamos:</b> o primeiro nome, a idade e o progresso de {nomeBonito || 'a criança'}. Tudo fica neste aparelho.</span></li>
            <li><Icone nome="x" /><span><b>O que não pedimos:</b> foto, CPF, endereço, sobrenome nem e-mail da criança.</span></li>
            <li><Icone nome="microfone" /><span><b>Voz da criança:</b> nenhum áudio da criança sai do aparelho.</span></li>
            <li><Icone nome="lixeira" /><span><b>Apagar:</b> você pode levar uma cópia ou apagar tudo quando quiser, nas configurações da área do adulto.</span></li>
          </ul>
          <button className="ajuste" role="switch" aria-checked={falarNome} onClick={() => setFalarNome(!falarNome)}>
            <Icone nome="som" />
            <span><b>Falar o primeiro nome</b><small>A Sofia e o Tales chamam a criança pelo nome</small></span>
            <i className="chave" aria-hidden="true" />
          </button>
          <p className="nota-mic">Seguimos a lei de proteção de dados para crianças (LGPD, art. 14): só um adulto responsável autoriza o uso.</p>
          <button className="btn pri ajustes-pronto" onClick={() => setPrivacidade(false)}><Icone nome="check" />Entendi</button>
        </Camada>
      ) : null}
    </Fluxo>
  );
}
