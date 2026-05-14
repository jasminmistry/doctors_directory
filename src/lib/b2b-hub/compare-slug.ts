export function compareSlugToCompetitorKey(slug: string): string | null {
  const prefix = "consentz-vs-";
  if (!slug.startsWith(prefix)) return null;
  const rest = slug.slice(prefix.length);
  return rest.length > 0 ? rest : null;
}
