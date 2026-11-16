/**
 * Bloco do painel do adulto: CANTINHO DA LEITURA e BRINCAR COM SONS (docs/pedagogia/06 §8 itens 5 e 6).
 * Fluência (palavras certas por minuto, sem meta), escrita própria ao lado da forma certa, histórias, textos e jogos.
 * Eco, coro e escrita própria aparecem como participação: não entram no "já sabe".
 */
import { JOGO_ESCUTA_POR_ID, HISTORIA_POR_ID, TEXTO_POR_ID } from '@fonema/conteudo';
import { dadosBiblioteca, precisaoDeLeitura, type Progresso } from '@fonema/motor';
import { GraficoFluenciaAdulto } from './GraficoFluencia.tsx';
import { Icone } from './ui.tsx';
import '../estilos-biblioteca.css';

export function PainelCantinho({ p, nome }: { p: Progresso; nome: string }) {
  const d = dadosBiblioteca(p);
  const prec = precisaoDeLeitura(p);
  const ultimas = <T extends { em: number }>(xs: T[], n = 4) => [...xs].sort((a, b) => b.em - a.em).slice(0, n);
  return (
    <>
      <div className="bloco" data-testid="painel-fluencia">
        <h2><Icone nome="raio" />Fluência: ler mais ligeiro</h2>
        <p>Precisão de leitura nas últimas {prec.respostas} respostas conferidas: <b>{Math.round(prec.precisao * 100)}%</b>. A releitura cronometrada abre a partir de 95% (Manual ABC, p. 375–376).</p>
        <GraficoFluenciaAdulto leituras={d.fluencia} />
      </div>
      <div className="bloco" data-testid="painel-escrita-propria">
        <h2><Icone nome="caderno" />Escrita do jeito de {nome}</h2>
        {d.escritas.length ? (
          <table className="tabela-escritas">
            <thead><tr><th>Dia</th><th>Escreveu</th><th>Forma certa</th></tr></thead>
            <tbody>{ultimas(d.escritas, 8).map((e) => (
              <tr key={`${e.em}-${e.vez}`}><td>{new Date(e.em).toLocaleDateString('pt-BR')}{e.vez === 2 ? ' (reescrita)' : ''}</td><td><b>{e.escrito}</b></td><td><b>{e.palavra.toUpperCase()}</b></td></tr>
            ))}</tbody>
          </table>
        ) : <p>Ainda não escreveu do seu jeito. Abre no Cantinho da Leitura depois do som do M.</p>}
        <p className="nota-mic">Mostra como {nome} pensa a escrita; não é nota e não conta para o "já sabe".</p>
      </div>
      <div className="bloco" data-testid="painel-cantinho">
        <h2><Icone nome="olho" />Histórias, textos e jogos de escutar</h2>
        <ul className="praticas">
          {ultimas(d.historias).map((h) => <li key={`h${h.em}`}><Icone nome="caderno" /><span><b>História: {HISTORIA_POR_ID[h.id]?.titulo ?? h.id}</b><small>{h.acertos} de {h.total} perguntas e palavras certas de primeira</small></span></li>)}
          {ultimas(d.textos).map((t) => <li key={`t${t.em}`}><Icone nome="olho" /><span><b>Leu sozinho: {TEXTO_POR_ID[t.id]?.titulo ?? t.id}</b><small>{t.acertos} de {t.total} perguntas certas de primeira · pediu os sons de {t.ouviuSons} palavras</small></span></li>)}
          {ultimas(d.jogos).map((j) => <li key={`j${j.em}`}><Icone nome="nota" /><span><b>Jogo: {JOGO_ESCUTA_POR_ID[j.id]?.nome ?? j.id}</b><small>{j.acertos} de {j.total} de primeira</small></span></li>)}
          {d.eco.length ? <li><Icone nome="som" /><span><b>Leitura em eco e em coro</b><small>{d.eco.length} vezes ({d.eco.reduce((s, e) => s + e.frases, 0)} frases) — participação, não conta como domínio</small></span></li> : null}
        </ul>
        {!d.historias.length && !d.textos.length && !d.jogos.length ? <p>Nada ainda. O Cantinho da Leitura e o Brincar com sons ficam na vila.</p> : null}
      </div>
    </>
  );
}
