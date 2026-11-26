/**
 * TEXTOS DE TELA e RECURSOS que o administrador pode mudar sem mexer em código (gerenciador, fila do dono nº 18).
 * As telas leem daqui (ex.: Entrada.tsx); a camada de edições (edicao/) troca o valor no lugar.
 * Só textos ESCRITOS (adulto lê); o que a dupla FALA fica nas falas (com áudio).
 * Entrada refeita em 26/11/2026 (fila do dono nº 34): as chaves antigas continuam, com o mesmo lugar na tela.
 */

export const TEXTOS_TELA: Record<string, string> = {
  'entrada.titulo': 'Quem vai entrar?',
  'entrada.aluno': 'Criança · aluno(a)',
  'entrada.aluno.sub': 'Vamos jogar!',
  'entrada.aluno.nota': 'Sem senha: é só tocar no seu cartão.',
  'entrada.adultos': 'Para adultos',
  'entrada.adultos.sub': 'com login e senha',
  'entrada.familia': 'Família',
  'entrada.familia.sub': 'Pai, mãe ou responsável',
  'entrada.professor': 'Professor(a)',
  'entrada.professor.sub': 'Turma, atividades e relatórios',
  'entrada.primeira': 'Primeira vez aqui?',
  'entrada.primeira.sub': 'Criar conta',
  'entrada.admin': 'Administrador',
  'entrada.nota': 'Sem servidor por enquanto: as contas e o progresso ficam só neste aparelho.',
  'alunos.titulo': 'Quem é você?',
  'alunos.sub': 'Toque no seu cartão para entrar na aventura.'
};

/** Onde cada texto aparece (para o administrador achar). */
export const ONDE_TEXTO_TELA: Record<string, string> = {
  'entrada.titulo': 'Entrada: título (lido pelo leitor de tela)', 'entrada.aluno': 'Entrada: etiqueta do botão da criança',
  'entrada.aluno.sub': 'Entrada: frase grande do botão da criança', 'entrada.aluno.nota': 'Entrada: linha de baixo do botão da criança',
  'entrada.adultos': 'Entrada: título da parte dos adultos', 'entrada.adultos.sub': 'Entrada: ao lado do título dos adultos',
  'entrada.familia': 'Entrada: botão da família', 'entrada.familia.sub': 'Entrada: linha de baixo do botão da família',
  'entrada.professor': 'Entrada: botão do professor', 'entrada.professor.sub': 'Entrada: linha de baixo do botão do professor',
  'entrada.primeira': 'Entrada: "primeira vez" (começo)', 'entrada.primeira.sub': 'Entrada: "primeira vez" (parte em negrito)',
  'entrada.admin': 'Entrada: link do administrador (rodapé)',
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
