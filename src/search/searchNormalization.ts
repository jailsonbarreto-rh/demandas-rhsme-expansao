const DIACRITICS = /[\u0300-\u036f]/g;
const NON_ALPHANUMERIC = /[^a-z0-9]/g;

export function normalizeSearchText(value: string): string {
  return value
    .normalize('NFD')
    .replace(DIACRITICS, '')
    .toLocaleLowerCase('pt-BR')
    .replace(/\s+/g, ' ')
    .trim();
}

export function normalizeProcessNumber(value: string): string {
  return normalizeSearchText(value).replace(NON_ALPHANUMERIC, '');
}

export function tokenizeSearchQuery(query: string): string[] {
  const normalized = normalizeSearchText(query);
  if (!normalized) return [];

  const uniqueTerms = new Set<string>();
  normalized.split(' ').forEach((term) => {
    const cleanTerm = term.trim();
    if (cleanTerm) uniqueTerms.add(cleanTerm);
  });

  return Array.from(uniqueTerms);
}
