/**
 * Peças comuns das mecânicas da TRILHA DOS SONS (D030): opções (figuras ou botões de som), o registro detalhado da
 * tentativa pelo contrato do motor (estado.ts › DetalheTentativa) e a escada de ajuda.
 */
import { useState } from 'react';
import type { Opcao } from '@fonema/conteudo';
import type { NivelAjuda, Tentativa } from '@fonema/motor';
import { Brilho } from '../componentes/basicos.tsx';
import { Figura, Icone } from '../componentes/ui.tsx';
import { efeitos } from '../servicos/efeitos.ts';
import { voz } from '../servicos/voz.ts';
import { tentativa } from './comum.tsx';
import '../estilos-trilha-sons.css';

/** Nível de ajuda pelo número de erros no item (docs/pedagogia/06 §4). */
export const ajudaPorErros = (erros: number): NivelAjuda => (erros === 0 ? 'nenhuma' : erros === 1 ? 'contraste' : erros === 2 ? 'caminho' : 'resposta-mostrada');

/** Tentativa AVALIADA com o detalhe completo (alvo, escolhido, respostas, distratores, tempo, posição, ajuda, contexto). */
export function registro(args: {
  habilidade: string; sessao: string; cena: string; mecanica: Tentativa['mecanica']; alvo: string; respostas: string[]; distratores: string[];
  inicio: number; categoria?: Tentativa['categoria']; pseudo?: boolean; revisao?: boolean; posicaoCerta?: number; posicaoEscolhida?: number;
  nOpcoes?: number; ouviuDeNovo?: number; ajuda?: NivelAjuda; tipo?: Tentativa['tipo']
}): Tentativa {
  const erros = Math.max(0, args.respostas.length - 1);
  const ajuda = args.ajuda ?? ajudaPorErros(erros);
  return tentativa(args.habilidade, args.sessao, args.cena, erros, {
    tipo: args.tipo ?? 'avaliada', mecanica: args.mecanica, alvo: args.alvo, categoria: args.categoria ?? 'palavra', escolhido: args.respostas[0] ?? args.alvo,
    respostas: args.respostas, distratores: args.distratores, tempoMs: Date.now() - args.inicio, tentativaNumero: erros + 1, nivelAjuda: ajuda,
    ...(args.pseudo ? { pseudo: true } : {}), ...(args.revisao ? { revisao: true } : {}), contexto: args.revisao ? 'revisao' : 'trilha',
    ...(args.posicaoCerta !== undefined ? { posicaoCerta: args.posicaoCerta } : {}), ...(args.posicaoEscolhida !== undefined ? { posicaoEscolhida: args.posicaoEscolhida } : {}),
    ...(args.nOpcoes ? { nOpcoes: args.nOpcoes } : {}), ...(args.ouviuDeNovo ? { ouviuDeNovo: args.ouviuDeNovo } : {}),
    ...(ajuda === 'resposta-mostrada' ? { comAjuda: true } : {})
  });
}

/**
 * Opções de resposta: FIGURAS (tocar responde; o botãozinho fala o nome da figura, R10) ou BOTÕES DE SOM (tocar só
 * ouve; a resposta vale no "É este!"). A certa só brilha quando `mostrarCerta` (3ª tentativa: conta como ajuda).
 */
export function OpcoesTF({ opcoes, correta, marcadas, acertou, ocupado, mostrarCerta, onEscolher, rotulo = 'Opções' }: {
  opcoes: Opcao[]; correta: string; marcadas: string[]; acertou: boolean; ocupado: boolean; mostrarCerta: boolean; onEscolher: (o: Opcao, posicao: number) => void; rotulo?: string;
}) {
  const [sel, setSel] = useState<string | null>(null);
  const comSom = opcoes.some((o) => o.botaoDeSom);
  const ouvir = async (o: Opcao) => {
    if (acertou || ocupado) return;
    efeitos.toque();
    setSel(o.id);
    if (o.falar) await voz.falar(o.falar, { quem: 'sofia' });
  };
  return (
    <>
      <div className={`opcoes n${opcoes.length} ${comSom ? 'opcoes-som' : ''} ${ocupado ? 'ouvindo' : ''}`} role="group" aria-label={rotulo}>
        {opcoes.map((o, k) => {
          const certa = acertou && o.id === correta;
          return (
            <div key={o.id} className="opcao-caixa">
              <button
                className={`opcao ${o.botaoDeSom ? 'opcao-som' : ''} ${sel === o.id ? 'sel' : ''} ${mostrarCerta && o.id === correta && !acertou ? 'modelo' : ''} ${certa ? 'certa' : ''} ${marcadas.includes(o.id) && !certa ? 'tentada' : ''}`}
                onClick={() => (o.botaoDeSom ? ouvir(o) : onEscolher(o, k))}
                aria-label={o.botaoDeSom ? `Som ${k + 1}: toque para ouvir` : `Figura ${k + 1}`}
                aria-pressed={o.botaoDeSom ? sel === o.id : undefined}
                data-opcao={o.id}
                data-correta={o.id === correta ? '1' : undefined}
              >
                {o.botaoDeSom ? <span className="som-botao"><Icone nome="som" /><b>{k + 1}</b></span> : <Figura palavra={o.id} />}
                {certa ? <Brilho ativo /> : null}
              </button>
              {!o.botaoDeSom && o.falar ? <button className="opcao-ouvir" aria-label={`Ouvir o nome da figura ${k + 1}`} disabled={ocupado || acertou} onClick={() => { efeitos.toque(); void voz.falar(o.falar!, { quem: 'sofia' }); }}><Icone nome="som" /></button> : null}
            </div>
          );
        })}
      </div>
      {comSom ? (
        <div className="linha-botoes centro">
          <button className="btn grande verde" data-testid="confirmar-som" disabled={!sel || acertou || ocupado} onClick={() => { const k = opcoes.findIndex((x) => x.id === sel); if (k >= 0) { setSel(null); onEscolher(opcoes[k], k); } }}>
            <Icone nome="check" />É este!
          </button>
        </div>
      ) : null}
    </>
  );
}
