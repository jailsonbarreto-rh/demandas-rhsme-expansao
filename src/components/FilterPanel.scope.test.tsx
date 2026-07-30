import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import {
  DEFAULT_DEMAND_FILTERS,
  DEFAULT_QUICK_FILTERS,
  type DemandFilters,
  type QuickFilters,
} from '../filters/filterTypes';
import { FilterPanel } from './FilterPanel';

function ScopeHarness() {
  const [filtros, setFiltros] = React.useState<DemandFilters>({
    ...DEFAULT_DEMAND_FILTERS,
    query: 'processo',
    scope: 'meu',
  });
  const [quickFilters, setQuickFilters] = React.useState<QuickFilters>({
    ...DEFAULT_QUICK_FILTERS,
    assinatura: true,
  });

  return (
    <>
      <output data-testid="scope-atual">{filtros.scope}</output>
      <FilterPanel
        filtros={filtros}
        setFiltros={setFiltros}
        quickFilters={quickFilters}
        setQuickFilters={setQuickFilters}
        setoresDisponiveis={[]}
        totalExibidos={2}
        totalGeral={10}
      />
    </>
  );
}

describe('FilterPanel e o contexto de carteira', () => {
  it('limpa filtros sem alterar a carteira definida pela rota', async () => {
    const user = userEvent.setup();
    render(<ScopeHarness />);

    expect(screen.queryByText('Minhas demandas')).not.toBeInTheDocument();
    expect(screen.getByTestId('scope-atual')).toHaveTextContent('meu');

    await user.click(screen.getByRole('button', { name: 'Limpar filtros' }));

    expect(screen.getByLabelText(/busca por texto/i)).toHaveValue('');
    expect(screen.getByRole('button', { name: /para assinatura/i })).not.toHaveClass('active');
    expect(screen.getByTestId('scope-atual')).toHaveTextContent('meu');
  });
});
