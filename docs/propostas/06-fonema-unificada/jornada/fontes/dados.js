// Dados compartilhados pelos infográficos da Jornada Conectada.
// Fonte: docs/sintese/00-documento-mestre.md §4.2–4.5 (mapa único), rels. 37 e 39 (temas, chefes, projetos),
// lojinha-emblemas/README.md (coleções) e videos/README.md (tipos de vídeo). Ver README.md desta pasta.

window.PRINC = [
  { id: 'N1',  nome: 'Atenção',                      cor: '#E4572E', rel: '09 · 15 · 06', frase: 'Um foco por tela; destaque sincronizado com a voz' },
  { id: 'N2',  nome: 'Engajamento ativo',            cor: '#F29E4C', rel: '15 · 30 · 37', frase: 'Toda tela pede resposta; a ação do jogo é a leitura' },
  { id: 'N3',  nome: 'Retorno do erro',              cor: '#C8553D', rel: '13 · 15 · 07', frase: 'Feedback < 1 s, específico, na tarefa; nunca punição' },
  { id: 'N4',  nome: 'Consolidação e sono',          cor: '#4B3F72', rel: '07 · 14 · 15 · 42', frase: 'Sessão no fim da tarde, revisão no dia seguinte, noite protegida' },
  { id: 'N5',  nome: 'Repetição espaçada',           cor: '#1F7A8C', rel: '07 · 20', frase: 'Intervalos 1-2-4-8-16-32-60 dias, por item' },
  { id: 'N6',  nome: 'Prática de recuperação',       cor: '#2A9D8F', rel: '07 · 13', frase: 'Tentar lembrar antes de ver de novo, com feedback' },
  { id: 'N7',  nome: 'Intercalação',                 cor: '#3A86FF', rel: '07 · 06', frase: 'Misturar pares parecidos só depois de cada um firmar' },
  { id: 'N8',  nome: 'Multissensorial congruente',   cor: '#8338EC', rel: '10 · 06 · 28', frase: 'Som + boca + letra no mesmo instante; termina na letra' },
  { id: 'N9',  nome: 'Mapeamento ortográfico',       cor: '#B5179E', rel: '35 · 06 · 25', frase: 'Som + letra + significado colam a palavra na memória' },
  { id: 'N10', nome: 'Curiosidade e predição',       cor: '#F4A261', rel: '08 · 35 · 41', frase: 'Lacuna pequena e fechável; gancho para amanhã' },
  { id: 'N11', nome: 'Carga cognitiva',              cor: '#6C757D', rel: '09 · 07', frase: 'Pouca coisa por vez; nada de detalhe sedutor' },
  { id: 'N12', nome: 'Emoção segura',                cor: '#E76F99', rel: '13 · 08 · 42', frase: 'Erro é informação; elogio ao processo; fim em alta' },
];

// ênfase: lista dos princípios que mais "trabalham" em cada região (todos operam sempre).
window.REG = [
  { id: 'R0',  nome: 'Quintal da Sofia', sub: 'Vila do Bolota', cor: '#E98A3B', sem: '1–3', etapa: 0, sons: 'Rima · sílaba · som inicial', nivel: ['0', '0'], tema: 'Quem sou eu e quem vive comigo?', chefe: 'Festa das Rimas', gancho: 'Uma garrafa chega com um mapa de 5 sinais: o barco leva à Ilha', enf: ['N8', 'N12', 'N11', 'N10'], ano: 1 },
  { id: 'R1',  nome: 'Ilha das Vogais', sub: 'praia e mar', cor: '#2BA6B9', sem: '3–6', etapa: 1, sons: 'A E I O U · é/ê · ó/ô', nivel: ['0', '1'], tema: 'Praia e mar: o primeiro contato', chefe: 'O Farol Apagado', gancho: 'O farol aceso ilumina a mata: de lá vem um /mmm/', enf: ['N8', 'N6', 'N12', 'N1'], ano: 1 },
  { id: 'R2a', nome: 'Mata Atlântica', sub: 'Vale do M-L-F', cor: '#2E9E5B', sem: '6–10', etapa: 2, sons: 'M · L · F + CV', nivel: ['1', '2'], tema: 'Quem mora na mata e do que precisa?', chefe: 'Cachoeira das Sílabas', gancho: 'A ponte do rio está em obras: o tucano espia do outro lado', enf: ['N9', 'N2', 'N5', 'N4'], ano: 1, gratis: true },
  { id: 'R2b', nome: 'Mata Atlântica', sub: 'Trilha do V-S-N', cor: '#58B368', sem: '10–16', etapa: 2, sons: 'V · S · N + CV.CV', nivel: ['2', '3'], tema: 'Quem mora na mata e do que precisa?', chefe: 'Ninho do Tucano', gancho: 'Um bilhete voa do sul: o vento trocou o P e o T', enf: ['N6', 'N7', 'N9', 'N3'], ano: 1 },
  { id: 'R3',  nome: 'Pampa', sub: 'vento e estações', cor: '#8DB33A', sem: '16–26', etapa: 3, sons: 'P · T → B · D', nivel: ['3', '4'], tema: 'O que muda do dia para a noite e entre as estações?', chefe: 'Ventania que Embaralha', gancho: 'As nuvens do Pampa viram chuva ao norte: a água começa a subir', enf: ['N7', 'N3', 'N8', 'N5'], ano: 1 },
  { id: 'R4',  nome: 'Pantanal', sub: 'cheia e seca', cor: '#1E9C8A', sem: '26–36', etapa: 4, sons: 'J · Z · X/CH · NH · LH', nivel: ['4', '5◐'], tema: 'Por que a água sobe e desce?', chefe: 'A Cheia', gancho: 'Os bichos salvos falam de um ipê que floresce na seca', enf: ['N11', 'N8', 'N9', 'N2'], ano: 1 },
  { id: 'R5',  nome: 'Cerrado', sub: 'seca e fogo', cor: '#D9A21B', sem: '36–48', etapa: 5, sons: 'C/QU · G/GU · R/RR · S/SS · Ç', nivel: ['5◐', '6◐'], tema: 'Como as plantas vivem com seca e fogo?', chefe: 'Ipê sem Flores', gancho: 'O lobo-guará conta de um sertão onde as palavras soam pelo nariz', enf: ['N7', 'N3', 'N9', 'N10'], ano: 1 },
  { id: 'R6',  nome: 'Caatinga / Sertão', sub: 'chefe do Ano 1', cor: '#C8642B', sem: '48–58', etapa: 6, sons: 'Nasais: ã · am/an · em/en…', nivel: ['6◐', '5●'], tema: 'Como se vive bem com pouca água?', chefe: 'Feira do Cordel · Meu cordel', gancho: 'A proa do barco aponta um rio tão grande que parece mar', enf: ['N4', 'N12', 'N6', 'N8'], ano: 1 },
  { id: 'R7',  nome: 'Amazônia', sub: 'rios e povos da floresta', cor: '#17703F', sem: '58–70', etapa: 7, sons: 'CVC (-r -s -l -m/n) + ditongos', nivel: ['5', '7'], tema: 'Como os povos da floresta conhecem e cuidam do rio?', chefe: 'Rio que Esqueceu as Palavras', gancho: 'O rio deságua no mar: tambores chegam do outro lado do Atlântico', enf: ['N10', 'N9', 'N5', 'N6'], ano: 2 },
  { id: 'R8',  nome: 'Litoral e Mar', sub: 'o Atlântico que liga', cor: '#2563A8', sem: '70–82', etapa: 8, sons: 'PR BR TR… PL BL CL…', nivel: ['7', '6●–7'], tema: 'O que o mar traz e leva?', chefe: 'Trem dos Encontros · Festa da vila', gancho: 'O trem novo leva a uma cidade onde tudo está em construção', enf: ['N11', 'N8', 'N6', 'N12'], ano: 2 },
  { id: 'R9',  nome: 'Cidade das Letras', sub: 'oficina', cor: '#7B4FB8', sem: '82–94', etapa: 9, sons: 'S/Z/X · CH/X · J/G · H · -ou -ão -inho', nivel: ['7', '8'], tema: 'Quem constrói e faz a cidade funcionar?', chefe: 'Jornal da Cidade · Ponte da vila', gancho: 'No observatório, uma estrela-mapa aponta o Arquipélago dos Livros', enf: ['N9', 'N7', 'N3', 'N10'], ano: 2 },
  { id: 'R10', nome: 'Arquipélago dos Livros', sub: 'chefe final e pós-jogo', cor: '#C23B6C', sem: '94–104+', etapa: 10, sons: 'Fluência · palavras frequentes · textos', nivel: ['8', '9–10'], tema: 'O que o céu e o tempo contam?', chefe: 'Festival de Leitura · Livro da minha jornada', gancho: 'Pós-jogo: estante livre, temporadas e o livro da vila', enf: ['N6', 'N10', 'N4', 'N12'], ano: 2 },
];
