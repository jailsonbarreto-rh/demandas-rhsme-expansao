import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  DEFAULT_DEMAND_FILTERS,
  DEFAULT_QUICK_FILTERS,
  type DemandFilters,
} from '../filters/filterTypes';
import { FilterPanel } from './FilterPanel';

function FilterSummaryHarness() {
  const [filtros, setFiltros] = React.useState<DemandFilters>({
    ...DEFAULT_DEMAND_FILTERS,
    query: 'processo',
  });
  const [quickFilters, setQuickFilters] = React.useState({ ...DEFAULT_QUICK_FILTERS });

  return (
    <FilterPanel
      filtros={filtros}
      setFiltros={setFiltros}
      quickFilters={quickFilters}
      setQuickFilters={setQuickFilters}
      setoresDisponiveis={[]}
      totalExibidos={2}
      totalGeral={379}
    />
  );
}

describe('resumo dos filtros', () => {
  it('destaca visual e semanticamente quando há filtros ativos', () => {
    render(<FilterSummaryHarness />);

    const row = screen.getByTestId('filters-summary-row');
    const activeState = screen.getByTestId('active-filters-state');

    expect(row).toHaveClass('has-active-filters');
    expect(activeState).toHaveTextContent('1 filtro ativo');
    expect(activeState).toHaveClass('filters-active-state');
    expect(screen.getByText('2 de 379 demandas')).toHaveClass('filters-results-summary');
    expect(screen.getByRole('button', { name: 'Limpar filtros' })).toBeVisible();
  });
});
