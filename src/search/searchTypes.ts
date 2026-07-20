export type DemandSearchField =
  | 'numero'
  | 'tipo'
  | 'assunto'
  | 'responsavel'
  | 'setor'
  | 'classificacao'
  | 'status'
  | 'historico';

export interface DemandSearchMatch {
  matches: boolean;
  terms: string[];
  matchedFields: DemandSearchField[];
  fieldTerms: Partial<Record<DemandSearchField, string[]>>;
  historySnippet?: string;
  historyItemId?: number;
}

export interface DemandSearchResult<TDemand> {
  demanda: TDemand;
  match: DemandSearchMatch;
}
