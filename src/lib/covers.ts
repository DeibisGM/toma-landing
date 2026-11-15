// Color de portada del blog por categoría, tomado de la paleta de la app (TomaColors).
const covers: Record<string, [string, string]> = {
  'Guías': ['#7a55ff', '#5530d9'],
  'Novedades': ['#3b78ff', '#1e4fd6'],
  'Listas': ['#ff8a45', '#f05a12'],
  'Consejos': ['#3dd9a0', '#16a874']
};

export const coverStyle = (category: string) => {
  const [c1, c2] = covers[category] ?? covers['Novedades'];
  return `--c1:${c1};--c2:${c2}`;
};
