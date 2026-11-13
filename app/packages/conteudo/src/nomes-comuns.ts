/**
 * Primeiros nomes mais registrados no Brasil nos últimos anos (Portal da Transparência do Registro Civil / ARPEN,
 * listas de 2020–2024; compatível com o Censo IBGE). Cada nome tem clipe nas vozes da Sofia e do Tales
 * (web/public/audio/nomes/{voz}/{nome}.mp3). Nome fora da lista: a fala toca a variante sem o nome.
 */
export const NOMES_MENINAS = [
  'Helena', 'Alice', 'Laura', 'Maria', 'Valentina', 'Heloísa', 'Manuela', 'Sophia', 'Sofia', 'Júlia', 'Isabella', 'Lívia',
  'Lorena', 'Cecília', 'Luísa', 'Giovanna', 'Maitê', 'Elisa', 'Antonella', 'Ayla', 'Liz', 'Eloá', 'Lara', 'Mariana',
  'Beatriz', 'Yasmin', 'Isadora', 'Clara', 'Ana', 'Rebeca', 'Melissa', 'Esther', 'Agatha', 'Lavínia', 'Emanuelly', 'Catarina',
  'Olívia', 'Nicole', 'Vitória', 'Mirella', 'Gabriela', 'Rafaela', 'Larissa', 'Bianca', 'Camila', 'Letícia', 'Ísis', 'Aurora',
  'Maya', 'Jade', 'Luna', 'Zoe', 'Emilly', 'Pietra', 'Malu', 'Stella', 'Marina', 'Bruna', 'Fernanda', 'Carolina',
  'Sarah', 'Isabelly', 'Kamilly', 'Allana', 'Eduarda', 'Gabrielly', 'Ana Clara', 'Ana Júlia', 'Maria Eduarda', 'Maria Clara', 'Lis', 'Analu',
  'Mariah', 'Raquel', 'Débora', 'Daniela'
];
export const NOMES_MENINOS = [
  'Miguel', 'Arthur', 'Gael', 'Théo', 'Heitor', 'Ravi', 'Davi', 'Bernardo', 'Noah', 'Gabriel', 'Samuel', 'Pedro',
  'Anthony', 'Isaac', 'Benício', 'Benjamin', 'Matheus', 'Lucas', 'Joaquim', 'Nicolas', 'Lucca', 'Lorenzo', 'Henrique', 'Rafael',
  'Henry', 'Murilo', 'Levi', 'Guilherme', 'Vicente', 'Felipe', 'Bryan', 'Matteo', 'Bento', 'João', 'Pietro', 'Leonardo',
  'Daniel', 'Gustavo', 'Enzo', 'Enrico', 'Emanuel', 'Eduardo', 'Vítor', 'Caio', 'Kauã', 'Otávio', 'Augusto', 'Thiago',
  'Yuri', 'Raul', 'Erick', 'Cauã', 'Diego', 'Fernando', 'Antônio', 'Francisco', 'José', 'Carlos', 'Ian', 'Martin',
  'Oliver', 'Calebe', 'Asafe', 'Josué', 'Breno', 'Igor', 'Luan', 'Ryan', 'Kevin', 'Vinícius', 'Benjamim', 'Apollo',
  'Lucas Gabriel', 'João Pedro', 'Pedro Henrique', 'Luiz'
];
export const NOMES_COMUNS = [...NOMES_MENINAS, ...NOMES_MENINOS].map((n) => n.split(' ')[0]).filter((n, i, a) => a.indexOf(n) === i);
