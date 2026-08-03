export type DemandSearchField =
  | 'numero'
  | 'tipo'
  | 'assunto'
  | 'responsavel'
  | 'setor'
  | 'classificacao'
  | 'status'
  | 'historico';

type DemandSearchMatchKind = 'exact' | 'approximate';

export interface DemandSearchMatch {
  matches: boolean;
  terms: string[];
  matchedFields: DemandSearchField[];
  fieldTerms: Partial<Record<DemandSearchField, string[]>>;
  historySnippet?: string;
  historyItemId?: number;
  matchKind?: DemandSearchMatchKind;
  matchedTermCount?: number;
  totalTermCount?: number;
  missingTerms?: string[];
  relevanceScore?: number;
}

export interface DemandSearchResult<TDemand> {
  demanda: TDemand;
  match: DemandSearchMatch;
}
