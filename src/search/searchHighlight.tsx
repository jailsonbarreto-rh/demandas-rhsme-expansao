import type { ReactNode } from 'react';
import { normalizeSearchText, tokenizeSearchQuery } from './searchNormalization';

interface NormalizedCharacter {
  start: number;
  end: number;
}

interface NormalizedTextMap {
  text: string;
  characters: NormalizedCharacter[];
}

function normalizeWithMap(value: string): NormalizedTextMap {
  let normalized = '';
  const characters: NormalizedCharacter[] = [];
  let offset = 0;

  for (const symbol of Array.from(value)) {
    const start = offset;
    offset += symbol.length;
    const decomposed = symbol
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLocaleLowerCase('pt-BR');

    for (const character of decomposed) {
      normalized += character;
      characters.push({ start, end: offset });
    }
  }

  return { text: normalized, characters };
}

function findTermRanges(text: string, query: string) {
  const terms = tokenizeSearchQuery(query);
  if (terms.length === 0 || !text) return [] as Array<{ start: number; end: number }>;

  const mapped = normalizeWithMap(text);
  const ranges: Array<{ start: number; end: number }> = [];

  for (const term of terms) {
    const normalizedTerm = normalizeSearchText(term);
    if (!normalizedTerm) continue;

    let cursor = 0;
    while (cursor < mapped.text.length) {
      const index = mapped.text.indexOf(normalizedTerm, cursor);
      if (index < 0) break;
      const first = mapped.characters[index];
      const last = mapped.characters[index + normalizedTerm.length - 1];
      if (first && last) ranges.push({ start: first.start, end: last.end });
      cursor = index + normalizedTerm.length;
    }
  }

  return ranges
    .sort((a, b) => a.start - b.start || a.end - b.end)
    .reduce<Array<{ start: number; end: number }>>((merged, range) => {
      const previous = merged.at(-1);
      if (previous && range.start <= previous.end) {
        previous.end = Math.max(previous.end, range.end);
      } else {
        merged.push({ ...range });
      }
      return merged;
    }, []);
}

export function HighlightedText({ text, query }: { text: string; query: string }) {
  const ranges = findTermRanges(text, query);
  if (ranges.length === 0) return <>{text}</>;

  const nodes: ReactNode[] = [];
  let cursor = 0;
  ranges.forEach((range, index) => {
    if (range.start > cursor) nodes.push(text.slice(cursor, range.start));
    nodes.push(<mark key={`${range.start}-${range.end}-${index}`} className="search-highlight">{text.slice(range.start, range.end)}</mark>);
    cursor = range.end;
  });
  if (cursor < text.length) nodes.push(text.slice(cursor));

  return <>{nodes}</>;
}
