/**
 * As COLEÇÕES editáveis do conteúdo (gerenciador): cada uma aponta para os dados que as telas já leem. Editar = mudar
 * esses mesmos objetos, no lugar (sobreposicao.ts). Registros de texto que são copiados para dentro das fases na carga
 * (FALAS_TRILHA_SONS, FALAS_ALFABETO) NÃO entram aqui: mudá-los não mudaria nada na tela; essas falas se editam dentro
 * de cada fase (coleção "fases").
 */
import { FASES, FASE_POR_ID, REGIOES, REGIAO_POR_ID } from '../regioes.ts';
import { ITENS_LOJA, SURPRESAS } from '../lojinha.ts';
import { CONQUISTAS, CONQUISTA_POR_ID } from '../conquistas.ts';
import { PERSONAGENS, PERSONAGEM_POR_ID } from '../personagens.ts';
import { HISTORIAS, HISTORIA_POR_ID, FALAS_HISTORIA } from '../biblioteca/historias.ts';
import { TEXTOS_DECODIFICAVEIS, TEXTO_POR_ID, FALAS_TEXTO } from '../biblioteca/textos.ts';
import { FALAS_BIBLIOTECA } from '../biblioteca/falas.ts';
import { JOGOS_ESCUTA, JOGO_ESCUTA_POR_ID, FALAS_ESCUTA } from '../biblioteca/escuta.ts';
import { CAMPOS_SEMANTICOS, CAMPO_POR_ID, PALAVRAS_DAS_FICHAS, FALAS_FICHAS } from '../fichas.ts';
import { BANCO } from '../fases/tf-banco.ts';
import { UNIDADE_DA_REVISAO_TF } from '../fases/tf.ts';
import { FALAS } from '../falas-gerais.ts';
import { FALAS_TUTORIAL } from '../caminho.ts';
import { TEXTOS_TELA, RECURSOS } from '../textos-tela.ts';
import type { Fase } from '../tipos.ts';
import { Sobreposicao, colecaoLista, colecaoRegistro, ordenarEDesligarCenas, type Colecao } from './sobreposicao.ts';

const reg = (x: object) => x as unknown as Record<string, unknown>;

/** Fases: a jornada (D031). Fase nova entra logo depois do modelo (ou fica como rascunho, fora da jornada). */
function colecaoFases(): Colecao {
  const base = colecaoLista<Fase>('fases', 'Missões (fases)', FASES, [FASE_POR_ID]);
  const rascunhos = new Set<string>();
  return {
    ...base,
    ids: () => [...FASES.map((f) => f.id), ...rascunhos],
    obter: (k) => FASES.find((f) => f.id === k) ?? (rascunhos.has(k) ? FASE_POR_ID[k] : undefined),
    inserir: (k, valor, e) => {
      const f = { ...(valor as Fase), id: k };
      // fase da Trilha dos Sons copiada de um modelo: vale a MESMA unidade do modelo para o verificador
      if (f.regiao === 'TF' && e.modelo) UNIDADE_DA_REVISAO_TF[k] = UNIDADE_DA_REVISAO_TF[e.modelo] ?? e.modelo;
      if (e.rascunho) { rascunhos.add(k); FASE_POR_ID[k] = f; }
      else {
        const pos = e.depoisDe ? FASES.findIndex((x) => x.id === e.depoisDe) : -1;
        if (pos >= 0) FASES.splice(pos + 1, 0, f); else FASES.push(f);
        FASE_POR_ID[k] = f;
      }
      const r = REGIAO_POR_ID[f.regiao];
      if (r && !r.fases.includes(k)) {
        const i = e.depoisDe ? r.fases.indexOf(e.depoisDe) : -1;
        if (i >= 0) r.fases.splice(i + 1, 0, k); else r.fases.push(k);
      }
    },
    retirar: (k) => {
      const i = FASES.findIndex((x) => x.id === k);
      if (i >= 0) FASES.splice(i, 1);
      rascunhos.delete(k);
      for (const r of REGIOES) { const j = r.fases.indexOf(k); if (j >= 0) r.fases.splice(j, 1); }
      delete FASE_POR_ID[k];
      delete UNIDADE_DA_REVISAO_TF[k];
    },
    depoisDoItem: (_k, item, edicoes) => ordenarEDesligarCenas(item as Fase, edicoes)
  };
}

/** Todas as coleções editáveis. */
export function criarColecoes(): Colecao[] {
  return [
    colecaoFases(),
    colecaoLista('regioes', 'Regiões e trilhas', REGIOES as unknown as { id: string }[], [REGIAO_POR_ID as unknown as Record<string, { id: string }>]),
    colecaoLista('personagens', 'Personagens', PERSONAGENS as unknown as { id: string }[], [PERSONAGEM_POR_ID as unknown as Record<string, { id: string }>]),
    colecaoLista('lojinha', 'Peças da Lojinha', ITENS_LOJA),
    colecaoLista('surpresas', 'Prêmios surpresa (por nível)', SURPRESAS),
    colecaoLista('conquistas', 'Selos e prêmios', CONQUISTAS, [CONQUISTA_POR_ID]),
    colecaoLista('historias', 'Histórias (ouvir)', HISTORIAS, [HISTORIA_POR_ID]),
    colecaoLista('textos', 'Textos para ler sozinho', TEXTOS_DECODIFICAVEIS, [TEXTO_POR_ID]),
    colecaoLista('fichas', 'Fichas de leitura', CAMPOS_SEMANTICOS, [CAMPO_POR_ID], {
      depoisDeTudo: () => {
        const todas = [...new Set(CAMPOS_SEMANTICOS.flatMap((c) => c.palavras))];
        PALAVRAS_DAS_FICHAS.length = 0;
        PALAVRAS_DAS_FICHAS.push(...todas);
      }
    }),
    colecaoLista('jogos-escuta', 'Jogos de escuta', JOGOS_ESCUTA, [JOGO_ESCUTA_POR_ID]),
    colecaoRegistro('banco', 'Banco de palavras (pronúncia)', reg(BANCO)),
    colecaoRegistro('falas-gerais', 'Falas gerais (chegada, vila…)', reg(FALAS)),
    colecaoRegistro('falas-tutorial', 'Falas do tutorial', reg(FALAS_TUTORIAL)),
    colecaoRegistro('falas-biblioteca', 'Falas do Cantinho da Leitura', reg(FALAS_BIBLIOTECA)),
    colecaoRegistro('falas-historia', 'Falas da hora da história', reg(FALAS_HISTORIA)),
    colecaoRegistro('falas-texto', 'Falas dos textos para ler', reg(FALAS_TEXTO)),
    colecaoRegistro('falas-escuta', 'Falas dos jogos de escuta', reg(FALAS_ESCUTA)),
    colecaoRegistro('falas-fichas', 'Falas das fichas', reg(FALAS_FICHAS)),
    colecaoRegistro('textos-tela', 'Textos de tela', TEXTOS_TELA),
    colecaoRegistro('recursos', 'Recursos (liga/desliga)', reg(RECURSOS))
  ];
}

/** A sobreposição única do conteúdo (o app, o importador e os testes usam esta). */
export const CONTEUDO_EDITAVEL = new Sobreposicao(criarColecoes());
