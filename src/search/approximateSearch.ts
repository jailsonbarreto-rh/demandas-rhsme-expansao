import type { ComentarioHistorico, Demanda } from '../types';
import { matchDemandSearch } from './demandSearch';
import { normalizeSearchText, tokenizeSearchQuery } from './searchNormalization';
import type { DemandSearchField, DemandSearchMatch, DemandSearchResult } from './searchTypes';

interface ApproximateSearchOptions {
  limit?: number;
}

const FIELD_WEIGHTS: Record<DemandSearchField, number> = {
  responsavel: 7,
  numero: 6,
  assunto: 5,
  classificacao: 4,
  historico: 3,
  setor: 2,
  tipo: 2,
  status: 1,
};

function getDisplayTerms(query: string) {
  const displayByNormalized = new Map<string, string>();
  query.trim().split(/\s+/).forEach((term) => {
    const normalized = normalizeSearchText(term);
    if (normalized && !displayByNormalized.has(normalized)) displayByNormalized.set(normalized, term);
  });
  return displayByNormalized;
}

function appendUnique(
  target: Partial<Record<DemandSearchField, string[]>>,
  field: DemandSearchField,
  values: string[],
) {
  const current = target[field] ?? [];
  target[field] = Array.from(new Set([...current, ...values]));
}

function minimumApproximateTerms(totalTerms: number) {
  return Math.max(2, Math.ceil(totalTerms / 2));
}

function buildApproximateMatch(
  demanda: Demanda,
  historico: ComentarioHistorico[],
  query: string,
): DemandSearchMatch | null {
  const terms = tokenizeSearchQuery(query);
  if (terms.length < 3) return null;

  const displayTerms = getDisplayTerms(query);
  const matchedTerms: string[] = [];
  const missingTerms: string[] = [];
  const matchedFields = new Set<DemandSearchField>();
  const fieldTerms: Partial<Record<DemandSearchField, string[]>> = {};
  let historySnippet: string | undefined;
  let historyItemId: number | undefined;
  let fieldScore = 0;

  terms.forEach((term) => {
    const termMatch = matchDemandSearch(demanda, historico, term);
    if (!termMatch.matches) {
      missingTerms.push(displayTerms.get(term) ?? term);
      return;
    }

    matchedTerms.push(term);
    termMatch.matchedFields.forEach((field) => matchedFields.add(field));
    Object.entries(termMatch.fieldTerms).forEach(([field, values]) => {
      appendUnique(fieldTerms, field as DemandSearchField, values ?? []);
    });
    historySnippet ??= termMatch.historySnippet;
    historyItemId ??= termMatch.historyItemId;
    fieldScore += Math.max(0, ...termMatch.matchedFields.map((field) => FIELD_WEIGHTS[field]));
  });

  if (matchedTerms.length === terms.length) return null;
  if (matchedTerms.length < minimumApproximateTerms(terms.length)) return null;

  return {
    matches: true,
    terms,
    matchedFields: Array.from(matchedFields),
    fieldTerms,
    historySnippet,
    historyItemId,
    matchKind: 'approximate',
    matchedTermCount: matchedTerms.length,
    totalTermCount: terms.length,
    missingTerms,
    relevanceScore: matchedTerms.length * 100 + fieldScore,
  };
}

export function rankApproximateDemandSearch(
  demandas: Demanda[],
  historico: ComentarioHistorico[],
  query: string,
  options: ApproximateSearchOptions = {},
): DemandSearchResult<Demanda>[] {
  const terms = tokenizeSearchQuery(query);
  if (terms.length < 3) return [];

  if (demandas.some((demanda) => matchDemandSearch(demanda, historico, query).matches)) return [];

  const limit = Math.max(1, options.limit ?? 10);
  return demandas
    .map((demanda) => ({ demanda, match: buildApproximateMatch(demanda, historico, query) }))
    .filter((result): result is DemandSearchResult<Demanda> => result.match !== null)
    .sort((left, right) => {
      const termDifference = (right.match.matchedTermCount ?? 0) - (left.match.matchedTermCount ?? 0);
      if (termDifference !== 0) return termDifference;
      const scoreDifference = (right.match.relevanceScore ?? 0) - (left.match.relevanceScore ?? 0);
      if (scoreDifference !== 0) return scoreDifference;
      return left.demanda.numero.localeCompare(right.demanda.numero, 'pt-BR');
    })
    .slice(0, limit);
}
