/**
 * BANCO DE PALAVRAS COM PRONÚNCIA ANOTADA (D030; docs/pedagogia/05-regras-de-decodificabilidade.md §6.3).
 *
 * Toda palavra que a criança LÊ ou ESCREVE sozinha, em qualquer trilha, está aqui, com os sons anotados à mão, um por
 * um (notação em `decodificabilidade.ts`). O verificador confere se a anotação bate com as letras e se cada valor
 * sonoro já foi ensinado na unidade em que a palavra aparece. Palavra fora do banco não entra em leitura.
 *
 * As anotações seguem a fala mais comum no Brasil (E e O átonos do fim como I e U; T e D antes de I como "tchi/dji"
 * em muitas regiões — as duas pronúncias valem). As listas foram montadas pelo projeto a partir das regras de
 * docs/pedagogia/01 e 05 [DP] e PRECISAM DE REVISÃO POR ALFABETIZADORA.
 */
import { montarBanco, type EntradaBanco } from '../decodificabilidade.ts';

const e = (texto: string, sons: string, extra: Partial<EntradaBanco> = {}): EntradaBanco => ({ texto, sons, ...extra });
const ox = { oxitona: true } as const;
const pseudo = (texto: string, sons: string, oxitona = false): EntradaBanco => ({ texto, sons, pseudo: true, ...(oxitona ? ox : {}) });

/** Palavras da TRILHA DOS SONS (blocos 1 a 3), na ordem em que entram. */
export const PALAVRAS_TF: EntradaBanco[] = [
  // TF-01…06 · vogais e encontros de vogais
  e('a', 'a'), e('ai', 'a i'), e('ei', 'e i'), e('oi', 'o i'), e('ui', 'u i'), e('eu', 'e u'), e('ia', 'i a'),
  // TF-07 · M
  e('mia', 'm i a'), e('meu', 'm e u'), e('ema', 'e m a', { figura: 'ema' }), e('meia', 'm e i a'), e('miau', 'm i a u', ox),
  pseudo('amu', 'a m u', true), pseudo('umi', 'u m i', true),
  // TF-08 · F
  e('foi', 'f o i'), e('fui', 'f u i'), e('fia', 'f i a'), e('afia', 'a f i a'),
  pseudo('fami', 'f a m i', true), pseudo('mafu', 'm a f u', true),
  // TF-09 · V
  e('uva', 'u v a', { figura: 'uva' }), e('viu', 'v i u', ox), e('vai', 'v a i'), e('via', 'v i a'), e('viva', 'v i v a'), e('voa', 'v o a'),
  pseudo('vafi', 'v a f i', true), pseudo('muva', 'm u v a'),
  // TF-10 · L
  e('lua', 'l u a', { figura: 'lua' }), e('mala', 'm a l a', { figura: 'mala' }), e('fila', 'f i l a', { figura: 'fila' }), e('mula', 'm u l a', { figura: 'mula' }),
  e('lula', 'l u l a', { figura: 'lula' }), e('fala', 'f a l a', { figura: 'fala' }), e('lama', 'l a m a', { figura: 'lama' }), e('lia', 'l i a'), e('lei', 'l e i'),
  pseudo('lifa', 'l i f a'), pseudo('mufa', 'm u f a'), pseudo('mifa', 'm i f a'), pseudo('lifu', 'l i f u', true),
  // TF-11 · S no começo
  e('sai', 's a i'), e('sua', 's u a'), e('sala', 's a l a'), e('saia', 's a i a'), e('sei', 's e i'),
  pseudo('safi', 's a f i', true), pseudo('sula', 's u l a'),
  // TF-12 · O e E no fim soam U e I
  e('o', 'u'), e('e', 'i'), e('ovo', 'o v u', { figura: 'ovo' }), e('fofo', 'f o f u', { figura: 'fofo' }), e('mofo', 'm o f u', { figura: 'mofo' }),
  e('vivo', 'v i v u'), e('fio', 'f i u'), e('ele', 'e l i'), e('vale', 'v a l i'), e('meio', 'm e i u'), e('ave', 'a v i'),
  pseudo('mufe', 'm u f i'), pseudo('savo', 's a v u'),
  // TF-13 · N
  e('navio', 'n a v i u', { figura: 'navio' }), e('nave', 'n a v i'), e('novo', 'n o v u'), e('nua', 'n u a'), e('na', 'n a'),
  pseudo('nafu', 'n a f u', true), pseudo('muni', 'm u n i', true),
  // TF-14 · Z
  e('zoa', 'z o a'), e('soa', 's o a'), e('vazio', 'v a z i u'), e('fazia', 'f a z i a'), e('selo', 's e l u'), e('zelo', 'z e l u'),
  pseudo('zufa', 'z u f a'), pseudo('zami', 'z a m i', true),
  // TF-15 · J
  e('sujo', 's u ʒ u'), e('suja', 's u ʒ a'), e('seja', 's e ʒ a'), e('veja', 'v ɛ ʒ a'), e('jaula', 'ʒ a u l a'),
  pseudo('jufa', 'ʒ u f a'), pseudo('jali', 'ʒ a l i', true),
  // TF-16 · P
  e('papai', 'p a p a i', { ...ox, figura: 'papai' }), e('lupa', 'l u p a', { figura: 'lupa' }), e('sapo', 's a p u', { figura: 'sapo' }), e('pia', 'p i a'),
  e('pula', 'p u l a'), e('pai', 'p a i'),
  pseudo('puli', 'p u l i', true), pseudo('pafe', 'p a f i'),
  // TF-17 · T
  e('pato', 'p a t u', { figura: 'pato' }), e('tatu', 't a t u', { ...ox, figura: 'tatu' }), e('sapato', 's a p a t u', { figura: 'sapato' }), e('mato', 'm a t u'),
  e('lata', 'l a t a'), e('luta', 'l u t a'), e('nata', 'n a t a'), e('mata', 'm a t a'),
  pseudo('tufa', 't u f a'), pseudo('latu', 'l a t u', true),
  // TF-18 · B
  e('bolo', 'b o l u', { figura: 'bolo' }), e('lobo', 'l o b u', { figura: 'lobo' }), e('boi', 'b o i'), e('bala', 'b a l a', { figura: 'bala' }), e('bato', 'b a t u'),
  e('pule', 'p u l i'), e('bule', 'b u l i'), e('bata', 'b a t a'), e('pata', 'p a t a'),
  pseudo('bufi', 'b u f i', true), pseudo('labu', 'l a b u', true),
  // TF-19 · C (ca, co, cu)
  e('faca', 'f a k a', { figura: 'faca' }), e('vaca', 'v a k a', { figura: 'vaca' }), e('macaco', 'm a k a k u', { figura: 'macaco' }), e('suco', 's u k u', { figura: 'suco' }),
  e('jaca', 'ʒ a k a', { figura: 'jaca' }), e('foca', 'f ɔ k a', { figura: 'foca' }), e('boca', 'b o k a'), e('caju', 'k a ʒ u', ox), e('come', 'k ɔ m i'),
  pseudo('cafu', 'k a f u', true), pseudo('cavu', 'k a v u', true),
  // TF-20 · D
  e('dado', 'd a d u', { figura: 'dado' }), e('dedo', 'd e d u', { figura: 'dedo' }), e('vida', 'v i d a'), e('nada', 'n a d a'), e('lado', 'l a d u'), e('cada', 'k a d a'),
  pseudo('dufa', 'd u f a'), pseudo('midu', 'm i d u', true),
  // TF-21 · G (ga, go, gu)
  e('gato', 'g a t u', { figura: 'gato' }), e('galo', 'g a l u', { figura: 'galo' }), e('fogo', 'f o g u', { figura: 'fogo' }), e('gota', 'g o t a'), e('figo', 'f i g u'),
  e('jogo', 'ʒ o g u'), e('lago', 'l a g u'), e('calo', 'k a l u'), e('gata', 'g a t a'), e('cata', 'k a t a'),
  pseudo('gufa', 'g u f a'), pseudo('lagu', 'l a g u', true),
  // TF-22 · ti e di
  e('tia', 'tʃ i a'), e('dia', 'dʒ i a'), e('tomate', 't o m a tʃ i', { figura: 'tomate' }), e('tapete', 't a p e tʃ i', { figura: 'tapete' }), e('bate', 'b a tʃ i'),
  e('leite', 'l e i tʃ i'),
  pseudo('tifa', 'tʃ i f a'), pseudo('dimu', 'dʒ i m u', true)
];

/**
 * Palavras das OUTRAS trilhas que a criança lê, monta ou escreve (Trilha A–Z, Ilha das Vogais, Vale do M-L-F): também
 * precisam de pronúncia anotada (05 §6.3). Algumas usam valores ainda não ensinados e por isso entram como VOCABULÁRIO
 * (montar e ouvir, sem contar como decodificação) — o verificador mostra quais.
 */
export const PALAVRAS_OUTRAS_TRILHAS: EntradaBanco[] = [
  // Vale do M-L-F (R2a) e Meu nome
  e('ma', 'm a'), e('mo', 'm o'), e('mu', 'm u'), e('mola', 'm ɔ l a'), e('fofa', 'f o f a'),
  pseudo('lufo', 'l u f u'), pseudo('folu', 'f o l u', true), pseudo('femo', 'f e m u'), pseudo('fuli', 'f u l i', true),
  // primeiras palavrinhas da Trilha A–Z (vocabulário para montar)
  e('babá', 'b a b a'), e('bebê', 'b e b e'), e('café', 'k a f ɛ'), e('bife', 'b i f i'), e('cama', 'k a m a'), e('banana', 'b a n a n a'),
  e('menina', 'm e n i n a'), e('bola', 'b ɔ l a', { figura: 'bola' }), e('copo', 'k ɔ p u'), e('mapa', 'm a p a'), e('roda', 'R ɔ d a'), e('rei', 'R e i'),
  e('sopa', 's o p a'), e('peixe', 'p e i ʃ i'), e('doze', 'd o z i'), e('cabe', 'k a b i')
];

export const BANCO = montarBanco([...PALAVRAS_TF, ...PALAVRAS_OUTRAS_TRILHAS]);

/**
 * Palavras dos TEXTOS DECODIFICÁVEIS do Cantinho da Leitura (biblioteca/textos.ts), acrescentadas em bloco separado.
 * "de" e "da" deixam de depender da lista de frequentes a partir do TI/DI (TF-22) e do D (TF-20). [DP] revisar com alfabetizadora.
 */
export const PALAVRAS_TEXTOS: EntradaBanco[] = [
  e('de', 'dʒ i'), e('da', 'd a'), e('no', 'n u'), e('caiu', 'k a i u', ox)
];
Object.assign(BANCO, montarBanco(PALAVRAS_TEXTOS.filter((x) => !BANCO[x.texto])));

/**
 * Palavras dos BLOCOS 4 e 5 da Trilha dos Sons (TF-23…TF-32: é e ó com acento; E e O abertos sem acento, ê e ô; as vogais
 * nasais; M antes de P e B e ão, ãe, õe, -em; o R forte do começo e o R fraco entre vogais), acrescentadas em 17/11 em bloco
 * separado. Palavra que já estava no banco com a MESMA anotação só ganha a figura (a anotação nunca muda aqui).
 * E/O tônicos sem acento anotados pela fala comum do Brasil; os DUVIDOSOS estão listados em docs/pedagogia/00 §7 e no
 * relatório da rodada. [DP] Listas montadas pelo projeto: revisar com alfabetizadora.
 */
export const PALAVRAS_BLOCOS_4_5: EntradaBanco[] = [
  // TF-23 · é e ó com acento (a sílaba forte é a do acento)
  e('pé', 'p ɛ', { figura: 'pe' }), e('vovó', 'v o v ɔ', { figura: 'vovo-f' }), e('avó', 'a v ɔ'), e('jiló', 'ʒ i l ɔ'), e('pó', 'p ɔ'),
  e('fé', 'f ɛ'), e('só', 's ɔ'), e('boné', 'b o n ɛ'), e('picolé', 'p i k o l ɛ'), e('cafuné', 'k a f u n ɛ'), e('café', 'k a f ɛ'),
  pseudo('lupé', 'l u p ɛ'), pseudo('nafó', 'n a f ɔ'),
  // TF-24 · E e O abertos sem acento; ê e ô com chapeuzinho
  e('bola', 'b ɔ l a', { figura: 'bola' }), e('vela', 'v ɛ l a', { figura: 'vela' }), e('mola', 'm ɔ l a', { figura: 'mola' }), e('cola', 'k ɔ l a', { figura: 'cola' }),
  e('copo', 'k ɔ p u', { figura: 'copo' }), e('moto', 'm ɔ t u', { figura: 'moto' }), e('janela', 'ʒ a n ɛ l a', { figura: 'janela' }),
  e('boneca', 'b o n ɛ k a', { figura: 'boneca' }), e('peteca', 'p e t ɛ k a', { figura: 'peteca' }), e('sacola', 's a k ɔ l a', { figura: 'sacola' }),
  e('pipoca', 'p i p ɔ k a', { figura: 'pipoca' }), e('caneca', 'k a n ɛ k a', { figura: 'caneca' }), e('panela', 'p a n ɛ l a', { figura: 'panela' }),
  e('ela', 'ɛ l a'), e('bota', 'b ɔ t a'), e('nova', 'n ɔ v a'), e('pote', 'p ɔ tʃ i'), e('vovô', 'v o v o', { figura: 'vovo-m' }), e('avô', 'a v o'),
  e('veto', 'v ɛ t u'), e('cota', 'k ɔ t a'),
  pseudo('dovê', 'd o v e'), pseudo('bupô', 'b u p o'),
  // TF-25 · /ã/: ã, e AN antes de consoante (AM antes de P e B fica para TF-30)
  e('lã', 'l ã', { figura: 'novelo-la' }), e('fã', 'f ã'), e('anta', 'ã t a', { figura: 'anta' }), e('panda', 'p ã d a', { figura: 'panda' }),
  e('manta', 'm ã t a'), e('canto', 'k ã t u'), e('tanto', 't ã t u'), e('tato', 't a t u'), e('janta', 'ʒ ã t a'), e('lá', 'l a'),
  pseudo('lantu', 'l ã t u', true), pseudo('tanfi', 't ã f i', true),
  // TF-26 · /ẽ/: EN (o -EM do fim, "tem", fica para TF-30)
  e('dente', 'd ẽ tʃ i'), e('pente', 'p ẽ tʃ i'), e('vento', 'v ẽ t u'), e('lento', 'l ẽ t u'), e('lenda', 'l ẽ d a'), e('venda', 'v ẽ d a'),
  pseudo('fendu', 'f ẽ d u', true), pseudo('benfa', 'b ẽ f a'),
  // TF-27 · /ĩ/: IM no fim e IN antes de consoante
  e('sim', 's ĩ'), e('fim', 'f ĩ'), e('lindo', 'l ĩ d u'), e('lido', 'l i d u'), e('tinta', 't ĩ t a'), e('vinte', 'v ĩ tʃ i'), e('minto', 'm ĩ t u'),
  e('mito', 'm i t u'), e('ninja', 'n ĩ ʒ a'),
  pseudo('tindu', 't ĩ d u', true), pseudo('binta', 'b ĩ t a'),
  // TF-28 · /õ/: OM no fim e ON antes de consoante
  e('bom', 'b õ'), e('som', 's õ'), e('onda', 'õ d a'), e('ponte', 'p õ tʃ i'), e('conta', 'k õ t a'), e('fonte', 'f õ tʃ i'), e('monte', 'm õ tʃ i'),
  pseudo('lontu', 'l õ t u', true), pseudo('donfa', 'd õ f a'),
  // TF-29 · /ũ/: UM no fim e UN antes de consoante
  e('um', 'ũ'), e('mundo', 'm ũ d u'), e('mudo', 'm u d u'), e('fundo', 'f ũ d u'), e('junto', 'ʒ ũ t u'), e('nunca', 'n ũ k a'), e('nuca', 'n u k a'),
  e('atum', 'a t ũ'),
  pseudo('tunfa', 't ũ f a'), pseudo('lunti', 'l ũ tʃ i', true),
  // TF-30 · M antes de P e B; ão, ãe, õe e o -EM do fim
  e('campo', 'k ã p u'), e('tampa', 't ã p a'), e('tapa', 't a p a'), e('bomba', 'b õ b a'), e('boba', 'b o b a'), e('pomba', 'p õ b a'),
  e('tombo', 't õ b u'), e('limpo', 'l ĩ p u'), e('samba', 's ã b a'),
  e('mão', 'm ã u', { figura: 'mao' }), e('pão', 'p ã u', { figura: 'pao' }), e('mãe', 'm ã i'), e('mamãe', 'm a m ã i', { figura: 'mamae' }), e('cão', 'k ã u'),
  e('tem', 't ẽ i'), e('bem', 'b ẽ i'), e('põe', 'p õ i'),
  pseudo('tampu', 't ã p u', true), pseudo('lombi', 'l õ b i', true),
  // TF-31 · R forte no começo da palavra (todo sotaque vale)
  e('rato', 'R a t u', { figura: 'rato' }), e('rua', 'R u a', { figura: 'rua' }), e('roda', 'R ɔ d a', { figura: 'roda' }), e('rio', 'R i u'), e('rede', 'R e dʒ i'),
  e('rolo', 'R o l u'), e('rabo', 'R a b u'), e('ripa', 'R i p a'), e('ruga', 'R u g a'),
  pseudo('rafu', 'R a f u', true), pseudo('rupi', 'R u p i', true),
  // TF-32 · R fraco entre vogais (não começa palavra)
  e('cara', 'k a ɾ a'), e('cala', 'k a l a'), e('pera', 'p e ɾ a'), e('pela', 'p e l a'), e('muro', 'm u ɾ u'), e('arara', 'a ɾ a ɾ a'),
  e('fera', 'f ɛ ɾ a'), e('puro', 'p u ɾ u'), e('coro', 'k o ɾ u'), e('vara', 'v a ɾ a'), e('jura', 'ʒ u ɾ a'),
  pseudo('furi', 'f u ɾ i', true), pseudo('lari', 'l a ɾ i', true)
];
for (const x of PALAVRAS_BLOCOS_4_5) {
  const k = x.texto.toLowerCase();
  if (BANCO[k] && BANCO[k].sons !== x.sons) throw new Error(`Banco: "${k}" com duas anotações diferentes`);
  BANCO[k] = { ...BANCO[k], ...x };
}
