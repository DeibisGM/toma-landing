// Portadas del blog con la identidad de Toma: color de la paleta + pegatina 3D.
const covers: Record<string, { bg: string; sticker: string; ink: string }> = {
  'Guías': { bg: '#2b66ee', sticker: '/stickers/sk_sofa.webp', ink: '#fff' },
  'Novedades': { bg: '#6a45f2', sticker: '/stickers/sk_destello.webp', ink: '#fff' },
  'Listas': { bg: '#ff7a30', sticker: '/stickers/sk_palomitas.webp', ink: '#fff' },
  'Consejos': { bg: '#3dd9a0', sticker: '/stickers/sk_lista.webp', ink: '#05281c' }
};
const fallback = { bg: '#2b66ee', sticker: '/stickers/sk_claqueta.webp', ink: '#fff' };
export const coverFor = (category: string) => covers[category] ?? fallback;
