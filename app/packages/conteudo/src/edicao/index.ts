/** Gerenciador de conteúdo: camada de edições (sobreposições) por cima do conteúdo do repositório. */
import publicadas from './publicadas.json';
import { CONTEUDO_EDITAVEL } from './colecoes.ts';
import type { Edicao, RelatorioAplicacao } from './sobreposicao.ts';

export * from './sobreposicao.ts';
export * from './colecoes.ts';
export * from './verificar.ts';
export * from './pronuncia.ts';
export * from './textos.ts';
export * from './itens.ts';

export interface ArquivoEdicoes { formato: 'fonema-edicoes'; versao: 1; nota?: string; edicoes: Edicao[] }
/** As edições já publicadas para todos (vêm com o site). O app aplica estas e, por cima, as do aparelho do administrador. */
export const EDICOES_PUBLICADAS: Edicao[] = (publicadas as unknown as ArquivoEdicoes).edicoes;

/** As edições publicadas valem para todo mundo desde a carga do conteúdo (app, motor, testes e scripts veem o mesmo). */
export const RELATORIO_PUBLICADAS: RelatorioAplicacao = EDICOES_PUBLICADAS.length ? CONTEUDO_EDITAVEL.aplicar(EDICOES_PUBLICADAS) : { aplicadas: 0, semLugar: [] };
