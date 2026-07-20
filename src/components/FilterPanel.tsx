import React from 'react';
import { classificacaoValues } from '../constants/demandaOptions';
import type { PeriodField } from '../search/periodFilter';

interface FiltrosState {
  busca: string;
  tipo: string;
  classificacao: string;
  status: string;
  setor: string;
  periodoCampo: PeriodField;
  periodoInicio: string;
  periodoFim: string;
}

interface QuickFiltersState {
  assinatura: boolean;
  hoje: boolean;
  vencido: boolean;
}

interface FilterPanelProps {
  filtros: FiltrosState;
  setFiltros: React.Dispatch<React.SetStateAction<FiltrosState>>;
  quickFilters: QuickFiltersState;
  setQuickFilters: React.Dispatch<React.SetStateAction<QuickFiltersState>>;
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
    () => Boolean(filtros.periodoInicio || filtros.periodoFim),
  );
  const [searchFocused, setSearchFocused] = React.useState(false);
  const blurTimerRef = React.useRef<number | null>(null);

  React.useEffect(() => () => {
    if (blurTimerRef.current !== null) window.clearTimeout(blurTimerRef.current);
  }, []);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setFiltros((current) => ({ ...current, [name]: value }));
  };

  const toggleQuickFilter = (key: keyof QuickFiltersState) => {
    setQuickFilters((current) => ({ ...current, [key]: !current[key] }));
  };

  const handleLimparFiltros = () => {
    setFiltros({
      busca: '',
      tipo: 'Todos',
      classificacao: 'Todas',
      status: 'Somente ativos (padrão)',
      setor: 'Todos',
      periodoCampo: 'limite2',
      periodoInicio: '',
      periodoFim: '',
    });
    setQuickFilters({ assinatura: false, hoje: false, vencido: false });
  };

  const commitSearch = (query: string) => {
    const cleanQuery = query.trim().replace(/\s+/g, ' ');
    if (!cleanQuery) return;
    setFiltros((current) => ({ ...current, busca: cleanQuery }));
    onCommitSearch?.(cleanQuery);
    setSearchFocused(false);
  };

  const statusList = [
    'Aguardando Andamento',
    'Tramitado',
    'Para Assinatura',
    'Encerrado',
    'Sobrestado',
    'Ajustar',
  ];

  let filtrosAtivosCount = 0;
  if (filtros.busca.trim()) filtrosAtivosCount += 1;
  if (filtros.tipo !== 'Todos') filtrosAtivosCount += 1;
  if (filtros.classificacao !== 'Todas') filtrosAtivosCount += 1;
  if (filtros.status !== 'Somente ativos (padrão)') filtrosAtivosCount += 1;
  if (filtros.setor !== 'Todos') filtrosAtivosCount += 1;
  if (filtros.periodoInicio || filtros.periodoFim) filtrosAtivosCount += 1;
  if (quickFilters.assinatura) filtrosAtivosCount += 1;
  if (quickFilters.hoje) filtrosAtivosCount += 1;
  if (quickFilters.vencido) filtrosAtivosCount += 1;

  const showRecentSearches = searchFocused && !filtros.busca.trim() && recentSearches.length > 0;

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
              id="busca"
              name="busca"
              className="form-control"
              placeholder="Número, assunto, responsável, setor, classificação ou histórico..."
              value={filtros.busca}
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
                  if (filtros.busca.trim()) onCommitSearch?.(filtros.busca.trim());
                }, 120);
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  commitSearch(filtros.busca);
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
            <option value="Somente ativos (padrão)">Somente ativos (padrão)</option>
            <option value="Todos (exibir tudo)">Todos (exibir tudo)</option>
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
              <select id="tipo" name="tipo" className="form-select" value={filtros.tipo} onChange={handleInputChange}>
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
                name="classificacao"
                className="form-select"
                value={filtros.classificacao}
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
              <select id="setor" name="setor" className="form-select" value={filtros.setor} onChange={handleInputChange}>
                <option value="Todos">Todos</option>
                {setoresDisponiveis.map((setor) => <option key={setor} value={setor}>{setor}</option>)}
              </select>
            </div>

            <div className="filter-group period-field-group">
              <label htmlFor="periodoCampo">Campo de data</label>
              <select
                id="periodoCampo"
                name="periodoCampo"
                className="form-select"
                value={filtros.periodoCampo}
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
                name="periodoInicio"
                type="date"
                className={`form-control ${periodError ? 'field-invalid' : ''}`}
                value={filtros.periodoInicio}
                onChange={handleInputChange}
                aria-invalid={Boolean(periodError)}
                aria-describedby={periodError ? 'periodo-error' : undefined}
              />
            </div>

            <div className="filter-group period-field-group">
              <label htmlFor="periodoFim">Data final</label>
              <input
                id="periodoFim"
                name="periodoFim"
                type="date"
                className={`form-control ${periodError ? 'field-invalid' : ''}`}
                value={filtros.periodoFim}
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
