import { describe, expect, it } from 'vitest';
import {
  normalizeProcessNumber,
  normalizeSearchText,
  tokenizeSearchQuery,
} from './searchNormalization';

describe('searchNormalization', () => {
  it('remove acentos, normaliza caixa e espaços sem alterar palavras', () => {
    expect(normalizeSearchText('  CESSÃO   de  Servidor  ')).toBe('cessao de servidor');
  });

  it('remove pontuação de números e preserva letras e algarismos', () => {
    expect(normalizeProcessNumber('SEI-03/001.234/2025')).toBe('sei030012342025');
  });

  it('divide a consulta em termos únicos na ordem informada', () => {
    expect(tokenizeSearchQuery(' Cessão ricardo 2025 cessao ')).toEqual([
      'cessao',
      'ricardo',
      '2025',
    ]);
  });
});
