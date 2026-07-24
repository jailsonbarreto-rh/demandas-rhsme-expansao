import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import {
  DEFAULT_DEMAND_FILTERS,
  DEFAULT_QUICK_FILTERS,
  type DemandFilters,
} from '../filters/filterTypes';
import { FilterPanel } from './FilterPanel';

function ScopeHarness() {
  const [filtros, setFiltros] = React.useState<DemandFilters>({
    ...DEFAULT_DEMAND_FILTERS,
    scope: 'meu',
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
      totalGeral={10}
    />
  );
}

describe('FilterPanel no escopo pessoal', () => {
  it('indica Minhas demandas e permite voltar para a equipe', async () => {
    const user = userEvent.setup();
    render(<ScopeHarness />);

    expect(screen.getByText('Minhas demandas')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Ver carteira da equipe' }));
    expect(screen.queryByText('Minhas demandas')).not.toBeInTheDocument();
  });
});
