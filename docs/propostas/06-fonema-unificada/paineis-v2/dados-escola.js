/* Dados FICTÍCIOS e coerentes da v2 — EM Jardim das Flores (Rede Municipal de Vale Verde), ano letivo 2026.
   A mesma fonte alimenta os 4 painéis: criança (Iris), professora (2º B), família (Iris) e gestão da unidade.
   Coerência com a v1 e com a secretaria: 2º ano = 88 alunos, 21 no nível 10 (24%); 2º B = 24 alunos, 3 no nível 10. */
(function(){
  const REGIOES=[ // nível n ↔ região n (Decisão 004, tabela 1.1)
    {id:0,nome:'Quintal da Sofia',nivel:'Ponto de partida',cor:'#F2B33D',icone:'casa'},
    {id:1,nome:'Ilha das Vogais',nivel:'Sons e vogais',cor:'#2EC4F1',icone:'farol'},
    {id:2,nome:'Mata Atlântica',nivel:'Primeiras letras',cor:'#2FB866',icone:'arvore'},
    {id:3,nome:'Pampa',nivel:'Juntando sons',cor:'#9BD14B',icone:'moinho'},
    {id:4,nome:'Pantanal',nivel:'Primeiras palavras',cor:'#1FA7A0',icone:'tuiuiu'},
    {id:5,nome:'Cerrado',nivel:'Sílabas complexas',cor:'#E39A2D',icone:'ipe'},
    {id:6,nome:'Caatinga',nivel:'Encontros e casos especiais',cor:'#D9734A',icone:'mandacaru'},
    {id:7,nome:'Amazônia',nivel:'Frases',cor:'#14805A',icone:'barco'},
    {id:8,nome:'Litoral e Mar',nivel:'Pequenos textos',cor:'#3FA9D9',icone:'jangada'},
    {id:9,nome:'Cidade das Letras',nivel:'Leitor fluente',cor:'#8E7CC3',icone:'teatro'},
    {id:10,nome:'Arquipélago dos Livros',nivel:'Alfabetizado pleno',cor:'#4B3FA8',icone:'livros'}];

  // ===== Turmas da escola: contagem de alunos por nível 0..10 (soma = n) =====
  const TURMAS=[
    {t:'1º A',prof:'Prof.ª Rosa Mendes',n:24,c:[1,2,4,5,5,3,2,1,1,0,0],fev:1,dose:58,fid:'ooooa',form:5},
    {t:'1º B',prof:'Prof. Caio Ferraz',n:23,c:[1,3,4,5,4,3,2,1,0,0,0],fev:1,dose:52,fid:'oaooo',form:7},
    {t:'1º C',prof:'Prof.ª Lúcia Prado',n:22,c:[2,4,6,4,3,2,1,0,0,0,0],fev:0,dose:31,fid:'xaaoo',form:7},
    {t:'1º D',prof:'Prof.ª Ana Beatriz Reis',n:24,c:[1,1,3,5,5,4,3,1,1,0,0],fev:1,dose:56,fid:'ooooo',form:8},
    {t:'2º A',prof:'Prof.ª Joana Silveira',n:22,c:[0,0,0,0,1,2,4,4,2,2,7],fev:4,dose:57,fid:'ooaoo',form:8},
    {t:'2º B',prof:'Prof.ª Helena Duarte',n:24,c:[0,0,0,1,3,4,6,3,2,2,3],fev:4,dose:59,fid:'ooooo',form:8},
    {t:'2º C',prof:'Prof. Marcos Teles',n:21,c:[0,0,0,0,1,2,3,4,2,2,7],fev:5,dose:55,fid:'oooao',form:7},
    {t:'2º D',prof:'Prof.ª Sandra Lima',n:21,c:[0,0,0,1,2,3,4,3,2,2,4],fev:3,dose:47,fid:'oaxao',form:7}];
  const med=c=>{const n=c.reduce((a,b)=>a+b,0);let a=0;for(let i=0;i<c.length;i++){a+=c[i];if(a>=n/2)return i;}return 10;};
  TURMAS.forEach(x=>{x.med=med(x.c);x.p10=Math.round(x.c[10]*1000/x.n)/10;});

  // ===== Turma 2º B: as mesmas 24 crianças da v1, com os mesmos níveis =====
  // g = grupo sugerido (próxima habilidade a ensinar), trava = onde está travada (habilidade · som · palavras)
  const GRUPOS=[
    {id:'G1',nome:'Troca surda/sonora',foco:'P/B · T/D · F/V',por:'Trocam pares que só mudam a vibração da garganta',ativ:'Espelho do Som: mão no pescoço + pares mínimos pato/bato, faca/vaca (15 min com a professora)'},
    {id:'G2',nome:'R forte e R fraco',foco:'RR · R inicial',por:'Leem RR como R brando: carro → “caro”',ativ:'Pares mínimos caro/carro, muro/murro + missão “Ponte do R forte” no tablet'},
    {id:'G3',nome:'Encontros consonantais',foco:'PR · BR · TR · BL',por:'Omitem a 2ª consoante: prato → “pato”',ativ:'Trem de sílabas PR-BR-TR com letras móveis + leitura em dupla'},
    {id:'G4',nome:'Frases e fluência',foco:'textos curtos',por:'Decodificam com precisão; foco em ritmo e compreensão',ativ:'Leitura de texto nível 8 + 2 perguntas (literal e inferencial)'}];
  const AL=[
    // nome, nível, grupo, habilidade travada, som, palavras (alvo→leitura), sinal, dose(min/sem)
    ['Luan K.',3,0,'Juntar sons CV','P/B','pato → “bato” · pipa → “biba”','alerta',52],
    ['Pedro H.',4,0,'Surda/sonora','T/D','tatu → “datu” · dedo → “tedo”','aviso',12],
    ['Rui O.',4,0,'Surda/sonora','F/V','faca → “vaca” · vela → “fela”','',55],
    ['Yasmin E.',4,0,'Pseudopalavras','P/B','“bopa” → “popa” · “pivo” → “bivo”','',57],
    ['Enzo P.',5,0,'Nasais','AM/AN','campo → “capo” · tampa → “tapa”','',60],
    ['Otto G.',5,0,'Surda/sonora','P/B','bolo → “polo” · bife → “pife”','',58],
    ['Iris N.',6,1,'R forte / fraco','RR','carro → “caro” · terra → “tera”','',61],
    ['Joana B.',6,1,'R forte / fraco','R inicial','rato → “r” brando · rua → “r” brando','',56],
    ['Lara M.',6,1,'R forte / fraco','RR','barro → “baro” · morro → “moro”','',59],
    ['Maya T.',6,1,'S com som de Z','S=Z','mesa → “messa” · casa → “cassa”','',62],
    ['Gael V.',5,1,'LH / NH','LH','palha → ? (voz incerta)','info',54],
    ['Sara D.',5,1,'R forte / fraco','RR','morro → “moro” · torre → “tore”','',57],
    ['Davi R.',6,2,'Encontros','PR','prato → “pato” · prego → “pego”','alerta',58],
    ['Nina F.',6,2,'Encontros','BR','bruxa → “buxa” · braço → “baço”','',60],
    ['Bia S.',7,2,'Encontros','BL/CL','bloco → “boco” · clube → “cube”','',63],
    ['Caio L.',7,2,'Encontros','TR','trem → “tem” · trigo → “tigo”','',59],
    ['Théo A.',7,2,'Pseudopalavras','PR','“prilo” → “pilo”','',61],
    ['Ana C.',8,2,'—','—','passou ao nível 8 ontem','ok',64],
    ['Tom Q.',8,3,'Fluência','—','pausa entre palavras','',60],
    ['Lia W.',9,3,'Compreensão','—','inferências: 2 de 4','',58],
    ['Vic Y.',9,3,'Fluência','—','entonação em perguntas','',57],
    ['Malu J.',10,3,'—','—','textos autorais','',55],
    ['Noah Z.',10,3,'—','—','textos autorais','',59],
    ['Zoe U.',10,3,'—','—','textos autorais','',60]].map(([n,nv,g,hab,som,pal,sinal,dose])=>({n,nv,g,hab,som,pal,sinal,dose}));

  // ===== Erros da turma (últimas 2 semanas, ocorrências) =====
  const ERROS=[
    {cat:'Troca surda/sonora',ex:'P/B, T/D, F/V',n:46,crc:9},
    {cat:'R forte / R fraco',ex:'RR, R inicial',n:38,crc:8},
    {cat:'Encontros consonantais',ex:'PR, BR, TR, BL',n:31,crc:7},
    {cat:'S com som de Z / SS',ex:'mesa, casa, passa',n:17,crc:4},
    {cat:'Nasalidade',ex:'AM/AN, ÃO',n:14,crc:3},
    {cat:'Leitura “de memória”',ex:'acerta palavra, erra pseudopalavra',n:12,crc:3},
    {cat:'Dígrafos LH/NH/CH',ex:'palha, ninho',n:9,crc:2},
    {cat:'Omissão de sílaba',ex:'borboleta → “borleta”',n:7,crc:2}];
  // palavras com mais erro na turma (erros / tentativas, nº de crianças, leitura mais comum)
  const PALAVRAS=[
    ['carro',14,31,7,'caro','RR',1],['pato',11,36,5,'bato','P/B',0],['prato',10,24,6,'pato','PR',2],['terra',9,22,5,'tera','RR',1],
    ['bruxa',8,19,4,'buxa','BR',2],['faca',7,25,4,'vaca','F/V',0],['mesa',7,28,4,'messa','S=Z',1],['barro',6,14,4,'baro','RR',1],
    ['tatu',6,20,3,'datu','T/D',0],['campo',5,17,3,'capo','AM',0],['pipa',5,21,3,'biba','P/B',0],['bloco',4,15,3,'boco','BL',2]]
    .map(([w,e,t,c,lido,som,g])=>({w,e,t,c,lido,som,g,pct:Math.round(e*100/t)}));
  const PSEUDO=[['pafo','bafo',6,18,'P/B'],['trelo','telo',5,16,'TR'],['carri','cari',5,15,'RR'],['bopa','popa',4,14,'P/B'],['nesa','nessa',3,13,'S=Z']]
    .map(([w,lido,e,t,som])=>({w,lido,e,t,som,pct:Math.round(e*100/t)}));
  // mapa de sons: % de erro na turma nas últimas 2 semanas e nº de crianças com dificuldade
  const SONS=[
    ['P/B','pato · bola',24,6,'troca'],['T/D','tatu · dado',15,3,'troca'],['F/V','faca · vela',18,4,'troca'],['C/G','casa · gato',6,1,'troca'],
    ['RR','carro · terra',41,8,'r'],['R-','rato · rua',22,4,'r'],['-R-','caro · fera',8,2,'r'],['S/SS','sapo · passa',12,3,'s'],
    ['S=Z','mesa · casa',19,4,'s'],['C/Ç','cebola · poço',11,2,'s'],['LH','palha · filho',9,2,'dig'],['NH','ninho · banho',7,2,'dig'],
    ['CH','chuva · bicho',4,1,'dig'],['QU/GU','queijo · guia',10,2,'dig'],['AM/AN','campo · manta',13,3,'nas'],['ÃO/ÕE','pão · limões',5,1,'nas'],
    ['PR','prato · prego',28,6,'enc'],['BR','bruxa · braço',25,5,'enc'],['TR','trem · trigo',21,4,'enc'],['BL/CL','bloco · clube',16,3,'enc']]
    .map(([s,ex,pct,crc,fam])=>({s,ex,pct,crc,fam}));
  // matriz de trocas (lido no lugar do alvo), ocorrências
  const TROCAS={alvo:['P','B','T','D','F','V'],lido:['P','B','T','D','F','V'],m:[[0,17,1,0,0,0],[6,0,0,1,0,0],[1,0,0,8,0,0],[0,1,3,0,0,0],[0,0,0,0,0,7],[0,0,0,0,2,0]]};

  // ===== Iris N. (2º B) — a mesma criança nos painéis da criança, da professora e da família =====
  const IRIS={nome:'Iris',completo:'Iris N.',turma:'2º B',nivel:6,faltam:4,regiao:6,grupo:'G2',
    meses:['fev','mar','abr','mai','jun','jul','ago','set','out','nov'],traj:[2,2,3,3,4,4,5,5,6,6],
    previsao:'entre 4 e 7 meses',dose:61,dias:[1,1,0,1,1,0,0],
    sabe:['pr, br, tr','bl, cl, fl','ch, lh, nh','ão e õe','lê frases curtas'],
    aprende:['r forte e r fraco','s com som de z'],
    leu:['prato','trem','blusa','flor','chuva','palha','ninho','limão','cravo','braço','garrafa','rato','burro','planta'],
    leuTotal:38,
    problema:[ // alvo, leitura, tipo, erros, tentativas, tendência
      ['carro','caro','RR lido como R brando',4,6,'melhorando'],['terra','tera','RR lido como R brando',3,5,'estável'],
      ['mesa','messa','S entre vogais com som de S',3,6,'estável'],['barro','baro','RR lido como R brando',2,4,'melhorando'],
      ['casa','cassa','S entre vogais com som de S',2,5,'melhorando'],['carri','cari','pseudopalavra · RR',2,3,'novo'],
      ['pafo','bafo','pseudopalavra · troca P/B',1,3,'resolvido']],
    tentativas:[ // hora, item, pseudo?, ok (1/0/null=voz incerta), lido, latência s
      ['09:42','carro',0,0,'caro',2.8],['09:42','rato',0,1,'',1.6],['09:41','terra',0,0,'tera',3.0],['09:41','garrafa',0,1,'',3.1],
      ['09:40','carri',1,0,'cari',3.4],['09:40','burro',0,1,'',2.2],['09:39','mesa',0,0,'messa',2.0],['09:39','ferro',0,null,'',2.6],
      ['ontem','rua',0,1,'',1.4],['ontem','prato',0,1,'',1.5]],
    rr:[30,38,45,58], // % de acerto em RR nas últimas 4 semanas
  };

  // ===== Escola =====
  const ESCOLA={nome:'EM Jardim das Flores',rede:'Rede Municipal de Vale Verde',direcao:'Márcia Lopes',coord:'Renata Alves',
    meses:['fev','mar','abr','mai','jun','jul','ago','set','out','nov'],
    ev2_10:[8,9,10,12,13,15,17,19,21,24],   // % do 2º ano no nível 10
    ev2_7:[14,18,23,29,35,41,46,52,57,61],  // % do 2º ano no nível 7 ou mais
    ev1_3:[5,9,14,20,27,34,41,49,57,66],    // % do 1º ano no nível 3 ou mais
    faixasFev2:{'0–3':36,'4–6':48,'7–9':8,'10':8},
    dificeis:[ // habilidade, % das crianças que já deveriam dominar e ainda não dominam, nº
      ['R forte / R fraco (RR, R inicial)',34,30],['Encontros consonantais (PR, BR, TR, BL)',29,26],['Troca surda/sonora (P/B, T/D, F/V)',22,31],
      ['S com som de Z (mesa, casa)',21,19],['Nasalidade (AM/AN, ÃO)',18,24],['Pseudopalavras (decodificar sem apoio)',15,20],['Dígrafos LH/NH',12,11]],
    modulos:['Método fônico em 10 min','Espelho do Som na sala','Grupos e estações','Ler o painel sem rotular','Pares mínimos','Fluência e compreensão','Família parceira (WhatsApp)','Escuta de voz incerta'],
  };
  window.FONEMA_DADOS={REGIOES,TURMAS,GRUPOS,AL,ERROS,PALAVRAS,PSEUDO,SONS,TROCAS,IRIS,ESCOLA};
})();
