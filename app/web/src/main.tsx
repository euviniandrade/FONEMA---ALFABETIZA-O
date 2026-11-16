import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App.tsx';
import { ProvedorApp, criarRepositorio } from './contexto.tsx';
import { guardarOQueJaCarregou } from './servicos/cache-inicial.ts';
import './estilos.css';
import './estilos-entrada.css';
import './estilos-recompensas.css';
import './estilos-mecanicas.css';
import './estilos-avaliacao.css';

const repo = criarRepositorio();
// pede ao navegador para não apagar os dados deste aparelho quando faltar espaço (o progresso só existe aqui)
try { void navigator.storage?.persist?.().catch(() => false); } catch { /* navegador sem suporte */ }

guardarOQueJaCarregou();

createRoot(document.getElementById('raiz')!).render(
  <StrictMode>
    <ProvedorApp repo={repo}>
      <App />
    </ProvedorApp>
  </StrictMode>
);
