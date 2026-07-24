import React from 'react';
import { classificacaoValues } from '../constants/demandaOptions';
import {
  DEFAULT_DEMAND_FILTERS,
  DEFAULT_QUICK_FILTERS,
  type DemandFilters,
  type QuickFilters,
} from '../filters/filterTypes';
import type { DemandStatus } from '../types';

interface FilterPanelProps {
  filtros: DemandFilters;
  setFiltros: React.Dispatch<React.SetStateAction<DemandFilters>>;
  quickFilters: QuickFilters;
  setQuickFilters: React.Dispatch<React.SetStateAction<QuickFilters>>;
  setoresDisponiveis: string[];
  totalExibidos: number;
  totalGeral: number;
  searchInputRef?: React.RefObject<HTMLInputElement | null>;
  recentSearches?: string[];
  onCommitSearch?: (query: string) => void;
  onClearRecentSearches?: () => void;
  periodError?: string | null;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filtros,
  setFiltros,
  quickFilters,
  setQuickFilters,
  setoresDisponiveis,
  totalExibidos,
  totalGeral,
  searchInputRef,
  recentSearches = [],
  onCommitSearch,
  onClearRecentSearches,
  periodError = null,
}) => {
  const [maisFiltrosAberto, setMaisFiltrosAberto] = React.useState(
    () => Boolean(filtros.periodStart || filtros.periodEnd),
  );
  const [searchFocused, setSearchFocused] = React.useState(false);
  const blurTimerRef = React.useRef<number | null>(null);

  React.useEffect(() => () => {
    if (blurTimerRef.current !== null) window.clearTimeout(blurTimerRef.current);
  }, []);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setFiltros((current) => ({ ...current, [name as keyof DemandFilters]: value }));
  };

  const toggleQuickFilter = (key: keyof QuickFilters) => {
    setQuickFilters((current) => ({ ...current, [key]: !current[key] }));
  };

  const handleLimparFiltros = () => {
    setFiltros((current) => ({ ...DEFAULT_DEMAND_FILTERS, scope: current.scope }));
    setQuickFilters({ ...DEFAULT_QUICK_FILTERS });
  };

  const commitSearch = (query: string) => {
    const cleanQuery = query.trim().replace(/\s+/g, ' ');
    if (!cleanQuery) return;
    setFiltros((current) => ({ ...current, query: cleanQuery }));
    onCommitSearch?.(cleanQuery);
  };

  const statusList: DemandStatus[] = [
    'Aguardando Andamento',
    'Tramitado',
    'Para Assinatura',
    'Encerrado',
    'Sobrestado',
    'Ajustar',
  ];

  let filtrosAtivosCount = 0;
  if (filtros.query.trim()) filtrosAtivosCount += 1;
  if (filtros.type !== 'Todos') filtrosAtivosCount += 1;
  if (filtros.classification !== 'Todas') filtrosAtivosCount += 1;
  if (filtros.status !== 'acompanhamento') filtrosAtivosCount += 1;
  if (filtros.sector !== 'Todos') filtrosAtivosCount += 1;
  if (filtros.periodStart || filtros.periodEnd) filtrosAtivosCount += 1;
  if (quickFilters.assinatura) filtrosAtivosCount += 1;
  if (quickFilters.hoje) filtrosAtivosCount += 1;
  if (quickFilters.vencido) filtrosAtivosCount += 1;

  const showRecentSearches = searchFocused && !filtros.query.trim() && recentSearches.length > 0;

  return (
    <div className="filters-panel">
      <div className="filters-header" style={{ borderBottom: 'none', paddingBottom: 0, marginBottom: 0 }}>
        <div className="filters-quick-buttons" aria-label="Filtros rápidos">
          <button
            type="button"
            className={`btn-toggle ${quickFilters.assinatura ? 'active' : ''}`}
            onClick={() => toggleQuickFilter('assinatura')}
            aria-pressed={quickFilters.assinatura}
          >
            Para assinatura
          </button>
          <button
            type="button"
            className={`btn-toggle ${quickFilters.hoje ? 'active' : ''}`}
            onClick={() => toggleQuickFilter('hoje')}
            aria-pressed={quickFilters.hoje}
          >
            Hoje
          </button>
          <button
            type="button"
            className={`btn-toggle ${quickFilters.vencido ? 'active' : ''}`}
            onClick={() => toggleQuickFilter('vencido')}
            aria-pressed={quickFilters.vencido}
          >
            Vencido
          </button>
        </div>
      </div>

      <div className="filters-grid" style={{ marginTop: '20px' }}>
        <div className="filter-group search-input-wrapper advanced-search-wrapper" style={{ gridColumn: 'span 2' }}>
          <div className="search-label-row">
            <label htmlFor="busca">Busca por texto</label>
            <kbd className="search-shortcut" title="Posicionar o cursor na busca">Ctrl/⌘ K</kbd>
          </div>
          <div className="input-icon-group">
            <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
            <input
              ref={searchInputRef}
              type="search"
              role="combobox"
              aria-autocomplete="list"
              id="busca"
              name="query"
              className="form-control"
              placeholder="Número, assunto, responsável, setor, classificação ou histórico..."
              value={filtros.query}
              autoComplete="off"
              aria-describedby="busca-ajuda"
              aria-expanded={showRecentSearches}
              aria-controls={showRecentSearches ? 'buscas-recentes' : undefined}
              onChange={handleInputChange}
              onFocus={() => {
                if (blurTimerRef.current !== null) window.clearTimeout(blurTimerRef.current);
                setSearchFocused(true);
              }}
              onBlur={() => {
                blurTimerRef.current = window.setTimeout(() => {
                  setSearchFocused(false);
                  if (filtros.query.trim()) onCommitSearch?.(filtros.query.trim());
                }, 120);
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  commitSearch(filtros.query);
                }
                if (event.key === 'Escape') setSearchFocused(false);
              }}
            />
          </div>
          <span id="busca-ajuda" className="search-help-text">
            Todos os termos devem ser encontrados, mesmo que estejam em campos diferentes.
          </span>

          {showRecentSearches && (
            <div id="buscas-recentes" className="recent-searches-panel" aria-label="Buscas recentes">
              <div className="recent-searches-header">
                <strong>Buscas recentes</strong>
                <button
                  type="button"
                  className="recent-searches-clear"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => onClearRecentSearches?.()}
                >
                  Limpar buscas recentes
                </button>
              </div>
              <div className="recent-searches-list">
                {recentSearches.map((query) => (
                  <button
                    key={query}
                    type="button"
                    className="recent-search-item"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => commitSearch(query)}
                  >
                    <i className="fa-solid fa-clock-rotate-left" aria-hidden="true" />
                    <span>{query}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="filter-group">
          <label htmlFor="status">Status</label>
          <select
            id="status"
            name="status"
            className="form-select"
            value={filtros.status}
            onChange={handleInputChange}
          >
            <option value="acompanhamento">Somente ativos (padrão)</option>
            <option value="providencia_ctrh">Com providência CTRH</option>
            <option value="todos">Todos (exibir tudo)</option>
            {statusList.map((status) => <option key={status} value={status}>{status}</option>)}
          </select>
        </div>
      </div>

      <div className="more-filters-container">
        <button
          type="button"
          className={`btn-more-filters ${maisFiltrosAberto ? 'open' : ''}`}
          onClick={() => setMaisFiltrosAberto((open) => !open)}
          aria-expanded={maisFiltrosAberto}
          aria-controls="filtros-avancados"
        >
          <i className="fa-solid fa-chevron-down" aria-hidden="true" />
          <span>{maisFiltrosAberto ? 'Menos filtros' : 'Mais filtros'}</span>
        </button>

        <div
          id="filtros-avancados"
          className={`more-filters-panel ${maisFiltrosAberto ? 'open' : ''}`}
          hidden={!maisFiltrosAberto}
        >
          <div className="more-filters-grid">
            <div className="filter-group">
              <label htmlFor="tipo">Tipo</label>
              <select id="tipo" name="type" className="form-select" value={filtros.type} onChange={handleInputChange}>
                <option value="Todos">Todos</option>
                <option value="Expediente">Expediente</option>
                <option value="Processo">Processo</option>
                <option value="Outros">Outros</option>
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="classificacao">Classificação</label>
              <select
                id="classificacao"
                name="classification"
                className="form-select"
                value={filtros.classification}
                onChange={handleInputChange}
              >
                <option value="Todas">Todas</option>
                {classificacaoValues.map((classificacao) => (
                  <option key={classificacao} value={classificacao}>{classificacao}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="setor">Setor</label>
              <select id="setor" name="sector" className="form-select" value={filtros.sector} onChange={handleInputChange}>
                <option value="Todos">Todos</option>
                {setoresDisponiveis.map((setor) => <option key={setor} value={setor}>{setor}</option>)}
              </select>
            </div>

            <div className="filter-group period-field-group">
              <label htmlFor="periodoCampo">Campo de data</label>
              <select
                id="periodoCampo"
                name="periodField"
                className="form-select"
                value={filtros.periodField}
                onChange={handleInputChange}
              >
                <option value="limite1">Prazo interno</option>
                <option value="limite2">Prazo final</option>
                <option value="historico">Movimentação do histórico</option>
              </select>
            </div>

            <div className="filter-group period-field-group">
              <label htmlFor="periodoInicio">Data inicial</label>
              <input
                id="periodoInicio"
                name="periodStart"
                type="date"
                className={`form-control ${periodError ? 'field-invalid' : ''}`}
                value={filtros.periodStart}
                onChange={handleInputChange}
                aria-invalid={Boolean(periodError)}
                aria-describedby={periodError ? 'periodo-error' : undefined}
              />
            </div>

            <div className="filter-group period-field-group">
              <label htmlFor="periodoFim">Data final</label>
              <input
                id="periodoFim"
                name="periodEnd"
                type="date"
                className={`form-control ${periodError ? 'field-invalid' : ''}`}
                value={filtros.periodEnd}
                onChange={handleInputChange}
                aria-invalid={Boolean(periodError)}
                aria-describedby={periodError ? 'periodo-error' : undefined}
              />
            </div>
          </div>
          {periodError && <div id="periodo-error" className="period-filter-error" role="alert">{periodError}</div>}
        </div>
      </div>

      <div className="filters-summary-row">
        <div className="filters-active-summary" aria-live="polite">
          {filtrosAtivosCount > 0 && (
            <>
              <span className="badge-count">{filtrosAtivosCount}</span>
              <span>{filtrosAtivosCount === 1 ? 'filtro ativo' : 'filtros ativos'}</span>
              <span style={{ color: '#cbd5e1', margin: '0 4px' }}>•</span>
            </>
          )}
          <span>{totalExibidos === totalGeral ? `${totalGeral} demandas` : `${totalExibidos} de ${totalGeral} demandas`}</span>
        </div>

        {filtrosAtivosCount > 0 && (
          <button
            type="button"
            className="btn-clear-filters"
            onClick={handleLimparFiltros}
            title="Limpar todos os filtros de busca"
          >
            <i className="fa-solid fa-trash-can" aria-hidden="true" />
            <span>Limpar filtros</span>
          </button>
        )}
      </div>
    </div>
  );
};
