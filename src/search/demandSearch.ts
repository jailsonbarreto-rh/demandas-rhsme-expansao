import type { ComentarioHistorico, Demanda } from '../types';
import { normalizeProcessNumber, normalizeSearchText, tokenizeSearchQuery } from './searchNormalization';
import type { DemandSearchField, DemandSearchMatch } from './searchTypes';

interface SearchFieldDocument {
  field: Exclude<DemandSearchField, 'historico'>;
  normalized: string;
  compact?: string;
}

function appendFieldTerm(
  fieldTerms: Partial<Record<DemandSearchField, string[]>>,
  field: DemandSearchField,
  term: string,
) {
  const current = fieldTerms[field] ?? [];
  if (!current.includes(term)) fieldTerms[field] = [...current, term];
}

function fieldContainsTerm(document: SearchFieldDocument, term: string) {
  if (document.normalized.includes(term)) return true;
  const compactTerm = normalizeProcessNumber(term);
  return Boolean(document.compact && compactTerm && document.compact.includes(compactTerm));
}

function historyContainsTerm(item: ComentarioHistorico, term: string) {
  const normalized = normalizeSearchText([
    item.status_novo,
    item.setor,
    item.comentario,
    item.data_hora,
  ].filter(Boolean).join(' '));
  return normalized.includes(term);
}

function buildHistorySnippet(item: ComentarioHistorico) {
  const comment = item.comentario.trim();
  if (comment.length <= 180) return comment;
  return `${comment.slice(0, 177).trimEnd()}…`;
}

function buildDemandSearchDocument(demanda: Demanda): SearchFieldDocument[] {
  return [
    {
      field: 'numero',
      normalized: normalizeSearchText(demanda.numero),
      compact: normalizeProcessNumber(demanda.numero),
    },
    { field: 'tipo', normalized: normalizeSearchText(demanda.tipo) },
    { field: 'assunto', normalized: normalizeSearchText(demanda.assunto) },
    { field: 'responsavel', normalized: normalizeSearchText(demanda.responsavel) },
    { field: 'setor', normalized: normalizeSearchText(demanda.setor) },
    { field: 'classificacao', normalized: normalizeSearchText(demanda.classificacao) },
    { field: 'status', normalized: normalizeSearchText(demanda.status) },
  ];
}

export function matchDemandSearch(
  demanda: Demanda,
  historico: ComentarioHistorico[],
  query: string,
): DemandSearchMatch {
  const terms = tokenizeSearchQuery(query);
  if (terms.length === 0) {
    return {
      matches: true,
      terms,
      matchedFields: [],
      fieldTerms: {},
    };
  }

  const documents = buildDemandSearchDocument(demanda);
  const demandHistory = historico.filter((item) => item.demandaId === demanda.id);
  const matchedFields = new Set<DemandSearchField>();
  const fieldTerms: Partial<Record<DemandSearchField, string[]>> = {};
  let historyMatch: ComentarioHistorico | undefined;

  const allTermsMatch = terms.every((term) => {
    let termMatched = false;

    documents.forEach((document) => {
      if (!fieldContainsTerm(document, term)) return;
      termMatched = true;
      matchedFields.add(document.field);
      appendFieldTerm(fieldTerms, document.field, term);
    });

    demandHistory.forEach((item) => {
      if (!historyContainsTerm(item, term)) return;
      termMatched = true;
      matchedFields.add('historico');
      appendFieldTerm(fieldTerms, 'historico', term);
      historyMatch ??= item;
    });

    return termMatched;
  });

  if (!allTermsMatch) {
    return {
      matches: false,
      terms,
      matchedFields: [],
      fieldTerms: {},
    };
  }

  return {
    matches: true,
    terms,
    matchedFields: Array.from(matchedFields),
    fieldTerms,
    historySnippet: historyMatch ? buildHistorySnippet(historyMatch) : undefined,
    historyItemId: historyMatch?.id,
  };
}
