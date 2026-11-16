/**
 * Progresso da FLUÊNCIA (docs/pedagogia/06 §6; ABC p. 515 "gráfico de progresso"):
 *  - para a CRIANÇA: um caminho de pedrinhas, uma por leitura da lista, com estrelinhas (sem números);
 *  - para o ADULTO: palavras certas por minuto e precisão, leitura por leitura, comparando a criança com ela mesma.
 *    Sem linha de meta: as metas de 55/90 palavras por minuto do ABC (p. 379) são do currículo de Portugal; meta brasileira
 *    é decisão do projeto ainda A CALIBRAR (06 §6).
 */
import { estrelasDaLeitura, type RegistroFluencia } from '@fonema/motor';
import { Icone } from './ui.tsx';

export function CaminhoFluencia({ leituras, destaque }: { leituras: RegistroFluencia[]; destaque?: boolean }) {
  const ultimas = leituras.slice(-10);
  const base = leituras.length - ultimas.length;
  return (
    <ol className={`caminho-flu ${destaque ? 'destaque' : ''}`} aria-label={`${leituras.length} leituras feitas`}>
      {ultimas.map((r, k) => {
        const n = estrelasDaLeitura(r, leituras[base + k - 1]);
        return (
          <li key={r.em} className={`pedra ${k === ultimas.length - 1 && destaque ? 'nova' : ''}`} style={{ ['--k' as string]: k }}>
            <span className="pedra-estrelas" aria-label={`${n} estrelas`}>{Array.from({ length: n }, (_, j) => <Icone key={j} nome="estrela" />)}</span>
          </li>
        );
      })}
      <li className="pedra proxima" aria-label="Próxima leitura"><Icone nome="seta" /></li>
    </ol>
  );
}

/** Gráfico do adulto: palavras certas por minuto (linha) e precisão (rótulo), sem meta. */
export function GraficoFluenciaAdulto({ leituras }: { leituras: RegistroFluencia[] }) {
  if (!leituras.length) return <p className="painel-vazio">Ainda não há leituras cronometradas. Elas aparecem no Cantinho da Leitura quando a criança lê com 95% de acerto na trilha.</p>;
  const ls = leituras.slice(-12);
  const L = 560, A = 200, m = { e: 40, d: 14, c: 16, b: 34 };
  const max = Math.max(10, ...ls.map((r) => r.ppm)) * 1.15;
  const x = (k: number) => m.e + (ls.length === 1 ? (L - m.e - m.d) / 2 : (k * (L - m.e - m.d)) / (ls.length - 1));
  const y = (v: number) => A - m.b - (v / max) * (A - m.b - m.c);
  const passos = [0, Math.round(max / 2), Math.round(max)];
  return (
    <figure className="grafico-flu">
      <svg viewBox={`0 0 ${L} ${A}`} role="img" aria-label={`Palavras certas por minuto nas últimas ${ls.length} leituras: ${ls.map((r) => r.ppm).join(', ')}`}>
        {passos.map((v) => <g key={v}><line x1={m.e} x2={L - m.d} y1={y(v)} y2={y(v)} className="gf-grade" /><text x={m.e - 8} y={y(v) + 4} className="gf-eixo" textAnchor="end">{v}</text></g>)}
        <polyline className="gf-linha" points={ls.map((r, k) => `${x(k)},${y(r.ppm)}`).join(' ')} />
        {ls.map((r, k) => (
          <g key={r.em}>
            <circle cx={x(k)} cy={y(r.ppm)} r={5} className="gf-ponto" />
            <text x={x(k)} y={y(r.ppm) - 10} textAnchor="middle" className="gf-valor">{r.ppm}</text>
            <text x={x(k)} y={A - 14} textAnchor="middle" className="gf-eixo">{new Date(r.em).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}</text>
            <text x={x(k)} y={A - 2} textAnchor="middle" className="gf-prec">{Math.round(r.precisao * 100)}%</text>
          </g>
        ))}
      </svg>
      <figcaption>
        Palavras certas por minuto em cada leitura da lista (embaixo: data e precisão). Compare com as leituras anteriores da própria criança.
        Não há meta: as metas de outros países não valem aqui, e a meta brasileira é decisão do projeto ainda a calibrar.
        {ls.some((r) => r.microfone) ? ` O microfone, quando ligado, ouviu ${ls.filter((r) => r.microfone).map((r) => `${r.microfone!.ouviu}/${r.total}`).join(', ')} palavras (só apoio, não entra na conta).` : ''}
      </figcaption>
    </figure>
  );
}
