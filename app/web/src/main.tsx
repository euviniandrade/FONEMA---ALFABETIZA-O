import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App.tsx';
import { ProvedorApp, criarRepositorio } from './contexto.tsx';
import './estilos.css';

const repo = criarRepositorio();

createRoot(document.getElementById('raiz')!).render(
  <StrictMode>
    <ProvedorApp repo={repo}>
      <App />
    </ProvedorApp>
  </StrictMode>
);
