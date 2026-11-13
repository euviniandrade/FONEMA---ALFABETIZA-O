/**
 * Lojinha (de brincadeirinha) e surpresas de nível.
 * D002: só moedinhas da jornada, nunca dinheiro real, sem sorte. D008/D009: utensílios, sem joias nem adornos.
 * P1-b: itens de nível chegam como SURPRESA depois do marco (iguais para todos); a barra mostra o objetivo de aprendizagem.
 * Imagens: avatar-3d/pecas (utensilio-a-tile-*), convertidas por web/scripts/gerar-assets.py.
 */
import type { ItemLoja, Surpresa } from './tipos.ts';

const item = (id: string, nome: string, preco: number, categoria: ItemLoja['categoria'], fala: string): ItemLoja => ({
  id, nome, preco, categoria, fala, imagem: `itens/${id}.webp`
});

export const ITENS_LOJA: ItemLoja[] = [
  item('caderno', 'Caderno', 4, 'utensilio', 'Um caderno para desenhar as letras.'),
  item('balde-de-praia', 'Balde de praia', 5, 'utensilio', 'Para brincar na areia da Ilha das Vogais.'),
  item('mapa', 'Mapa', 5, 'utensilio', 'Para não se perder no arquipélago.'),
  item('regador', 'Regador', 6, 'casa', 'Para cuidar da horta da vila.'),
  item('vaso-com-muda', 'Vaso com muda', 6, 'casa', 'Uma plantinha para a sua casa.'),
  item('lanterna', 'Lanterna', 7, 'utensilio', 'Para explorar o farol.'),
  item('galocha', 'Galocha', 8, 'utensilio', 'Para pisar na lama da mata.'),
  item('capa-de-chuva', 'Capa de chuva', 8, 'utensilio', 'Para os dias de chuva na vila.'),
  item('pandeiro', 'Pandeiro', 9, 'esporte', 'Para bater as sílabas com o Davi.'),
  item('chapeu-explorador', 'Chapéu de explorador', 10, 'utensilio', 'Para as trilhas da mata.'),
  item('binoculo', 'Binóculo', 12, 'utensilio', 'Para ver os bichos de longe.'),
  item('kit-de-ciencias', 'Kit de ciências', 14, 'utensilio', 'Para descobrir como as coisas funcionam.'),
  item('violao', 'Violão', 15, 'esporte', 'Para tocar as músicas da dupla.'),
  item('patinete', 'Patinete', 18, 'esporte', 'Para passear pela praça.'),
  item('telescopio', 'Telescópio', 20, 'utensilio', 'Para olhar as estrelas da vila.')
];

/** Surpresas por nível da jornada (jogo-completo/07 §5), entregues depois do marco, sem anúncio prévio. */
export const SURPRESAS: Surpresa[] = [
  { nivel: 1, tipo: 'area', id: 'placa-da-porta', nome: 'Placa da porta com a sua letra' },
  { nivel: 2, tipo: 'item', id: 'bola', nome: 'Bola da vila', imagem: 'itens/bola.webp' },
  { nivel: 3, tipo: 'area', id: 'varal-de-rimas', nome: 'Varal de rimas no quintal' },
  { nivel: 4, tipo: 'item', id: 'chapeu-de-palha', nome: 'Chapéu de palha', imagem: 'itens/chapeu-de-palha.webp' },
  { nivel: 5, tipo: 'area', id: 'casinha-do-bolota', nome: 'Casinha do Bolota no quintal' },
  { nivel: 6, tipo: 'item', id: 'mochila', nome: 'Mochila escolar', imagem: 'itens/mochila.webp' },
  { nivel: 7, tipo: 'item', id: 'lupa', nome: 'Lupa da Caça às Sílabas', imagem: 'itens/lupa.webp' },
  { nivel: 10, tipo: 'area', id: 'farol-por-dentro', nome: 'O farol por dentro' },
  { nivel: 13, tipo: 'area', id: 'trilha-da-mata', nome: 'A trilha da mata' },
  { nivel: 16, tipo: 'area', id: 'arvore-das-palavras', nome: 'Árvore das Palavras' }
];
