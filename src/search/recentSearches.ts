import { normalizeSearchText } from './searchNormalization';

const STORAGE_KEY = 'ctrrh:recent-searches';
const MAX_RECENT_SEARCHES = 5;

export interface SearchStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

function resolveStorage(storage?: SearchStorage): SearchStorage | null {
  if (storage) return storage;
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function loadRecentSearches(storage?: SearchStorage): string[] {
  const target = resolveStorage(storage);
  if (!target) return [];

  try {
    const raw = target.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item): item is string => typeof item === 'string' && Boolean(item.trim()))
      .slice(0, MAX_RECENT_SEARCHES);
  } catch {
    return [];
  }
}

export function saveRecentSearch(query: string, storage?: SearchStorage): string[] {
  const target = resolveStorage(storage);
  const cleanQuery = query.trim().replace(/\s+/g, ' ');
  if (!cleanQuery) return loadRecentSearches(storage);

  const normalized = normalizeSearchText(cleanQuery);
  const next = [
    cleanQuery,
    ...loadRecentSearches(storage).filter((item) => normalizeSearchText(item) !== normalized),
  ].slice(0, MAX_RECENT_SEARCHES);

  if (target) {
    try {
      target.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      return next;
    }
  }

  return next;
}

export function clearRecentSearches(storage?: SearchStorage) {
  const target = resolveStorage(storage);
  if (!target) return;
  try {
    target.removeItem(STORAGE_KEY);
  } catch {
    // O histórico de busca é apenas uma conveniência; falhas locais não bloqueiam o sistema.
  }
}
