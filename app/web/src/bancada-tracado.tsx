/**
 * BANCADA DE TESTE do traçado das letras e do Estúdio de sons (não entra no build do app).
 *   npx vite -c vite.bancada.config.ts   →  /bancada-tracado.html?letra=A   ·  ?letras=AaBb  ·  ?tela=estudio  ·  ?tela=letra&letra=M
 * Usada para as capturas app/docs/capturas/v4-tracado-*.png e v4-estudio-*.png (web/scripts/capturas-tracado.mjs).
 */
import { createRoot } from 'react-dom/client';
import { FASES, type AtividadeLetra, type AtividadeTracar } from '@fonema/conteudo';
import type { Crianca } from '@fonema/motor';
import './estilos.css';
import { ProvedorApp, criarRepositorio } from './contexto.tsx';
import { Tracar } from './mecanicas/Tracar.tsx';
import { Letra } from './mecanicas/Letra.tsx';
import { EstudioSons } from './telas/adulto/EstudioSons.tsx';

const q = new URLSearchParams(location.search);
const crianca = { id: 'bancada', nome: 'Mariana', genero: 'f', pronuncia: { grafia: 'Ma-ri-A-na', fala: 'Mariana', rate: 1, pitchExtra: 0, voz: 'sofia' }, avatar: {} } as unknown as Crianca;
const letras = [...(q.get('letras') ?? q.get('letra') ?? 'A')];
const tracar: AtividadeTracar = { tipo: 'tracar', habilidade: 'bancada', letras, enunciado: { quem: 'sofia', texto: 'Agora desenhe a letra com o dedo.' } };
const tela = q.get('tela') ?? 'tracar';
const daLetra = FASES.flatMap((f) => f.cenas).map((c) => c.atividade).find((a): a is AtividadeLetra => a?.tipo === 'letra' && a.letra === (q.get('letra') ?? 'M').toUpperCase());

createRoot(document.getElementById('raiz')!).render(
  <ProvedorApp repo={criarRepositorio()}>
    <main className="palco" style={{ maxWidth: 980, margin: '0 auto', padding: 16 }}>
      {tela === 'estudio' ? <EstudioSons />
        : tela === 'letra' && daLetra ? <Letra atividade={daLetra} crianca={crianca} sessao="bancada" cenaId="bancada" onFim={() => document.body.setAttribute('data-fim', '1')} />
          : <Tracar key={letras.join('')} atividade={tracar} crianca={crianca} sessao="bancada" cenaId="bancada" onFim={() => document.body.setAttribute('data-fim', '1')} />}
    </main>
  </ProvedorApp>
);
