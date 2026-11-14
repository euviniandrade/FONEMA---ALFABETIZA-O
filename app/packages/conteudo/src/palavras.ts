/**
 * Banco de palavras. Cada palavra lida pela criança precisa ser DECODIFICÁVEL na etapa
 * (o teste `linter-decodificabilidade.test.ts` confere as palavras de leitura de cada região).
 * Figuras: emoji como marcador provisório (no produto, ilustrações 3D da casa).
 */
import type { Palavra } from './tipos.ts';

const p = (texto: string, silabas: string, figura: string, pseudo = false): Palavra => ({
  texto,
  silabas: silabas.split('-'),
  figura,
  pseudo
});

/** Figuras faladas (R0–R1): a criança ouve, não lê. */
export const FIGURAS: Record<string, Palavra> = Object.fromEntries(
  [
    p('gato', 'ga-to', '🐱'), p('pato', 'pa-to', '🦆'), p('mão', 'mão', '✋'), p('pão', 'pão', '🍞'),
    p('bola', 'bo-la', '⚽'), p('cola', 'co-la', '🧴'), p('casa', 'ca-sa', '🏠'), p('mesa', 'me-sa', '🪑'),
    p('sapo', 'sa-po', '🐸'), p('lua', 'lu-a', '🌙'), p('rua', 'ru-a', '🛣️'), p('janela', 'ja-ne-la', '🪟'),
    p('panela', 'pa-ne-la', '🍲'), p('foca', 'fo-ca', '🦭'), p('pipoca', 'pi-po-ca', '🍿'), p('leão', 'le-ão', '🦁'),
    p('avião', 'a-vi-ão', '✈️'), p('mala', 'ma-la', '🧳'), p('macaco', 'ma-ca-co', '🐒'), p('moto', 'mo-to', '🏍️'),
    p('sol', 'sol', '☀️'), p('suco', 'su-co', '🧃'), p('faca', 'fa-ca', '🍴'), p('fogo', 'fo-go', '🔥'),
    p('formiga', 'for-mi-ga', '🐜'), p('folha', 'fo-lha', '🍃'), p('pé', 'pé', '🦶'), p('bolota', 'bo-lo-ta', '🦔'),
    p('tatu', 'ta-tu', '🦔'), p('dado', 'da-do', '🎲'), p('vovó', 'vo-vó', '👵'), p('vovô', 'vo-vô', '👴'),
    p('abelha', 'a-be-lha', '🐝'), p('uva', 'u-va', '🍇'), p('ovo', 'o-vo', '🥚'), p('ovelha', 'o-ve-lha', '🐑'),
    p('elefante', 'e-le-fan-te', '🐘'), p('estrela', 'es-tre-la', '⭐'), p('escada', 'es-ca-da', '🪜'),
    p('ilha', 'i-lha', '🏝️'), p('iglu', 'i-glu', '🧊'), p('ioiô', 'i-o-iô', '🪀'), p('urso', 'ur-so', '🐻'),
    p('abacaxi', 'a-ba-ca-xi', '🍍'), p('peixe', 'pei-xe', '🐟'), p('banana', 'ba-na-na', '🍌'),
    p('caneca', 'ca-ne-ca', '☕'), p('boneca', 'bo-ne-ca', '🪆'), p('mel', 'mel', '🍯'), p('papel', 'pa-pel', '📄'),
    p('feijão', 'fei-jão', '🫘'), p('sapato', 'sa-pa-to', '👞'), p('chave', 'cha-ve', '🔑'), p('navio', 'na-vi-o', '🚢'),
    p('garrafa', 'gar-ra-fa', '🧴'), p('concha', 'con-cha', '🐚'), p('caranguejo', 'ca-ran-gue-jo', '🦀'),
    p('copo plástico', 'co-po', '🥤'), p('sacola', 'sa-co-la', '🛍️'), p('mamãe', 'ma-mãe', '👩'), p('papai', 'pa-pai', '👨'),
    p('peteca', 'pe-te-ca', '🏸'), p('ginga', 'gin-ga', '🤸'), p('esquiva', 'es-qui-va', '🤸'), p('vela', 've-la', '🕯️'),
    p('vaca', 'va-ca', '🐄'), p('zebra', 'ze-bra', '🦓'), p('rato', 'ra-to', '🐭'),
    // Trilha do Alfabeto (D027): palavras-exemplo de H, K, Q, W, X e Y (figuras 3D em web/public/assets/figuras)
    p('hipopótamo', 'hi-po-pó-ta-mo', '🦛'), p('kiwi', 'ki-wi', '🥝'), p('queijo', 'quei-jo', '🧀'), p('xícara', 'xí-ca-ra', '🍵'),
    p('waffle', 'waf-fle', '🧇'), p('yakisoba', 'ya-ki-so-ba', '🍜'), p('xilofone', 'xi-lo-fo-ne', '🎹'), p('helicóptero', 'he-li-cóp-te-ro', '🚁')
  ].map((w) => [w.texto, w])
);

/** Palavras de LEITURA de R2a (só M, L, F + vogais; sílabas CV). */
export const PALAVRAS_R2A: Palavra[] = [
  p('MALA', 'MA-LA', '🧳'), p('LUA', 'LU-A', '🌙'), p('FALA', 'FA-LA', '🗣️'), p('FILA', 'FI-LA', '🚶'),
  p('FOFO', 'FO-FO', '🧸'), p('MULA', 'MU-LA', '🫏'), p('LULA', 'LU-LA', '🦑'), p('MOLA', 'MO-LA', '🌀'),
  p('LAMA', 'LA-MA', '🟫'), p('MOFO', 'MO-FO', '🍞'),
  // pseudopalavras ("nomes de bichinhos da mata")
  p('LUFO', 'LU-FO', '', true), p('FOLU', 'FO-LU', '', true), p('MUFE', 'MU-FE', '', true), p('LIFU', 'LI-FU', '', true), p('FEMO', 'FE-MO', '', true)
];

export function figura(texto: string): Palavra {
  const w = FIGURAS[texto] ?? PALAVRAS_R2A.find((x) => x.texto === texto.toUpperCase());
  if (!w) throw new Error(`Palavra sem cadastro no banco: ${texto}`);
  return w;
}

/** Grafemas conhecidos ao FIM de cada região (para o linter de decodificabilidade). */
export const GRAFEMAS_DA_REGIAO: Record<string, string[]> = {
  // Trilha do Alfabeto: as letras aparecem SOLTAS ("B b"), nunca em palavras para ler
  AL: [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ', ' '],
  R0: [],
  R1: ['A', 'E', 'I', 'O', 'U'],
  R2a: ['A', 'E', 'I', 'O', 'U', 'M', 'L', 'F']
};
