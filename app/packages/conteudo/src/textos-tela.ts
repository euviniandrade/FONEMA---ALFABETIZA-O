/**
 * TEXTOS DE TELA e RECURSOS que o administrador pode mudar sem mexer em código (gerenciador, fila do dono nº 18).
 * As telas leem daqui (ex.: Entrada.tsx); a camada de edições (edicao/) troca o valor no lugar.
 * Só textos ESCRITOS (adulto lê); o que a dupla FALA fica nas falas (com áudio).
 */

export const TEXTOS_TELA: Record<string, string> = {
  'entrada.titulo': 'Quem vai entrar?',
  'entrada.aluno': 'Sou aluno(a)',
  'entrada.aluno.sub': 'Entrar na aventura',
  'entrada.familia': 'Sou pai, mãe ou responsável',
  'entrada.familia.sub': 'Área da Família',
  'entrada.professor': 'Sou professor(a)',
  'entrada.professor.sub': 'Área do Professor',
  'entrada.primeira': 'Primeira vez aqui',
  'entrada.primeira.sub': 'Criar conta e cadastrar a criança',
  'entrada.nota': 'Por enquanto sua conta fica guardada neste aparelho.',
  'alunos.titulo': 'Quem é você?',
  'alunos.sub': 'Toque no seu cartão para entrar na aventura.'
};

/** Onde cada texto aparece (para o administrador achar). */
export const ONDE_TEXTO_TELA: Record<string, string> = {
  'entrada.titulo': 'Entrada: título', 'entrada.aluno': 'Entrada: botão do aluno', 'entrada.aluno.sub': 'Entrada: linha de baixo do botão do aluno',
  'entrada.familia': 'Entrada: botão da família', 'entrada.familia.sub': 'Entrada: linha de baixo do botão da família',
  'entrada.professor': 'Entrada: botão do professor', 'entrada.professor.sub': 'Entrada: linha de baixo do botão do professor',
  'entrada.primeira': 'Entrada: botão "primeira vez"', 'entrada.primeira.sub': 'Entrada: linha de baixo do botão "primeira vez"',
  'entrada.nota': 'Entrada: nota do rodapé', 'alunos.titulo': 'Cartões das crianças: título', 'alunos.sub': 'Cartões das crianças: subtítulo'
};

/** Recursos que podem ser ligados e desligados para todos (o que já existe continua no código: regra 7). */
export interface Recursos {
  /** Botão "Passear 3D" no "Mais" da vila. */
  mundo3d: boolean;
  /** Botão "Brincar" na barra da vila. */
  brincar: boolean;
  /** Botão "Leitura" na barra da vila. */
  leitura: boolean;
  /** Seção "Jogos" dentro do Brincar. */
  jogos: boolean;
}
export const RECURSOS: Recursos = { mundo3d: true, brincar: true, leitura: true, jogos: true };
export const ROTULO_RECURSO: Record<keyof Recursos, string> = {
  mundo3d: 'Passear 3D (no "Mais" da vila)', brincar: 'Brincar (barra da vila)', leitura: 'Leitura (barra da vila)', jogos: 'Jogos (dentro do Brincar)'
};
