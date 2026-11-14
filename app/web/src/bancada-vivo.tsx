/**
 * BANCADA DE TESTE dos personagens vivos (não entra no build do app; veja vite.bancada.config.ts).
 * Usa os componentes e o serviço de voz REAIS: o balão fala pela voz oficial e o busto mexe a boca.
 *   npx vite -c vite.bancada.config.ts            (abre /bancada-vivo.html)
 *   npx vite build -c vite.bancada.config.ts --outDir <pasta>
 */
import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import type { Fala } from '@fonema/conteudo';
import './estilos.css';
import { Balao } from './componentes/basicos.tsx';
import { PersonagemVivo, type EstadoVivo } from './componentes/PersonagemVivo.tsx';
import { falar } from './util.ts';

const GESTOS: EstadoVivo[] = ['acenando', 'palmas', 'pensando', 'comemorando', 'apontando'];

function Bancada() {
  const [falas, setFalas] = useState<Fala[]>([]);
  const [estado, setEstado] = useState<EstadoVivo>('parado');
  useEffect(() => {
    void fetch('./audio/falas/manifesto.json').then((r) => r.json()).then((m: Record<string, string>) => {
      const de = (q: 'sofia' | 'tales') => Object.keys(m).filter((k) => k.startsWith(`${q}|`)).map((k) => k.slice(q.length + 1)).filter((t) => t.length > 30 && t.length < 80 && !t.includes('/') && /[.!?]$/.test(t)).slice(0, 2).map((texto) => ({ quem: q, texto }) as Fala);
      setFalas([de('sofia')[0], de('tales')[0], de('sofia')[1], de('tales')[1]].filter(Boolean));
    });
  }, []);
  return (
    <main className="palco" style={{ maxWidth: 1100, margin: '0 auto', padding: 20 }}>
      <h1 className="t">Bancada dos personagens vivos</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,.8fr) minmax(0,1.2fr)', gap: 24, alignItems: 'end' }}>
        <div style={{ height: 440, display: 'grid', justifyItems: 'center' }}>
          <PersonagemVivo quem="dupla" modo="corpo" estado={estado} aoTerminar={() => setEstado('parado')} />
        </div>
        <div data-testid="baloes">
          {falas.map((f, i) => <Balao key={i} fala={f} />)}
          <div className="linha-botoes">
            <button className="btn grande ipe" data-testid="conversa" onClick={async () => { for (const f of falas) await falar(f); }}>Ouvir a conversa</button>
          </div>
        </div>
      </div>
      <div className="linha-botoes" style={{ marginTop: 16 }}>
        {GESTOS.map((g) => <button key={g} className="btn" data-gesto={g} onClick={() => setEstado(g)}>{g}</button>)}
      </div>
      <div className="conheca-dupla">
        <h2 className="t">Conheça a Sofia e o Tales</h2>
        {(['sofia', 'tales', 'bolota', 'zum-zum'] as const).map((q) => <figure key={q}><PersonagemVivo quem={q} modo="giro" tamanho={q === 'zum-zum' ? 96 : q === 'bolota' ? 150 : 230} /><figcaption>{q}</figcaption></figure>)}
      </div>
      <div style={{ display: 'flex', gap: 24, justifyContent: 'center', height: 260 }}>
        <PersonagemVivo quem="sofia" modo="corpo" gestos /><PersonagemVivo quem="tales" modo="corpo" gestos /><PersonagemVivo quem="bolota" modo="corpo" /><PersonagemVivo quem="zum-zum" modo="corpo" />
      </div>
    </main>
  );
}
createRoot(document.getElementById('raiz')!).render(<Bancada />);
