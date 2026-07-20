import { describe, expect, it } from 'vitest';
import {
  clearRecentSearches,
  loadRecentSearches,
  saveRecentSearch,
  type SearchStorage,
} from './recentSearches';

function createStorage(): SearchStorage {
  const values = new Map<string, string>();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => { values.set(key, value); },
    removeItem: (key) => { values.delete(key); },
  };
}

describe('recentSearches', () => {
  it('mantém no máximo cinco consultas, mais recente primeiro', () => {
    const storage = createStorage();
    ['um', 'dois', 'três', 'quatro', 'cinco', 'seis'].forEach((query) => {
      saveRecentSearch(query, storage);
    });

    expect(loadRecentSearches(storage)).toEqual([
      'seis', 'cinco', 'quatro', 'três', 'dois',
    ]);
  });

  it('remove duplicidade normalizada e preserva a grafia mais recente', () => {
    const storage = createStorage();
    saveRecentSearch('Cessão', storage);
    saveRecentSearch('  cessao  ', storage);

    expect(loadRecentSearches(storage)).toEqual(['cessao']);
  });

  it('ignora consulta vazia e limpa o histórico', () => {
    const storage = createStorage();
    saveRecentSearch('   ', storage);
    saveRecentSearch('Ricardo', storage);
    clearRecentSearches(storage);

    expect(loadRecentSearches(storage)).toEqual([]);
  });

  it('tolera conteúdo inválido no armazenamento', () => {
    const storage = createStorage();
    storage.setItem('ctrrh:recent-searches', '{inválido');

    expect(loadRecentSearches(storage)).toEqual([]);
  });
});
