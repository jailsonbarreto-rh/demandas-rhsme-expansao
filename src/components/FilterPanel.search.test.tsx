import { createRef, useState } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_DEMAND_FILTERS } from '../filters/filterTypes';
import { FilterPanel } from './FilterPanel';

const quickFilters = { assinatura: false, hoje: false, vencido: false };

afterEach(() => cleanup());

function Harness({
  onCommitSearch = vi.fn(),
  onClearRecentSearches = vi.fn(),
  periodError = null,
}: {
  onCommitSearch?: (query: string) => void;
  onClearRecentSearches?: () => void;
  periodError?: string | null;
}) {
  const [filtros, setFiltros] = useState({ ...DEFAULT_DEMAND_FILTERS });
  const [quick, setQuick] = useState(quickFilters);
  const searchInputRef = createRef<HTMLInputElement>();

  return (
    <FilterPanel
      filtros={filtros}
      setFiltros={setFiltros}
      quickFilters={quick}
      setQuickFilters={setQuick}
      setoresDisponiveis={['E/CTRH']}
      totalExibidos={1}
      totalGeral={1}
      searchInputRef={searchInputRef}
      recentSearches={['cessão ricardo 2025']}
      onCommitSearch={onCommitSearch}
      onClearRecentSearches={onClearRecentSearches}
      periodError={periodError}
    />
  );
}

describe('FilterPanel — busca avançada', () => {
  it('usa valores tipados sem alterar o rótulo conhecido do filtro padrão', () => {
    render(<Harness />);

    expect(screen.getByRole('option', { name: 'Somente ativos (padrão)' }))
      .toHaveValue('acompanhamento');
    expect(screen.getByRole('option', { name: 'Todos (exibir tudo)' }))
      .toHaveValue('todos');
    expect(screen.getByRole('option', { name: 'Com providência CTRH' }))
      .toHaveValue('providencia_ctrh');
  });

  it('permite reutilizar e confirmar uma busca recente', () => {
    const onCommitSearch = vi.fn();
    render(<Harness onCommitSearch={onCommitSearch} />);

    const input = screen.getByRole('combobox', { name: /busca por texto/i });
    fireEvent.focus(input);
    const recentSearch = screen.getByRole('button', { name: /cessão ricardo 2025/i });
    fireEvent.mouseDown(recentSearch);
    fireEvent.click(recentSearch);

    expect(input).toHaveValue('cessão ricardo 2025');
    expect(onCommitSearch).toHaveBeenCalledWith('cessão ricardo 2025');
  });

  it('confirma a consulta com Enter sem exibir o atalho no layout', () => {
    const onCommitSearch = vi.fn();
    render(<Harness onCommitSearch={onCommitSearch} />);

    const input = screen.getByRole('combobox', { name: /busca por texto/i });
    fireEvent.change(input, { target: { value: 'cessao erica 2026' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onCommitSearch).toHaveBeenCalledWith('cessao erica 2026');
    expect(screen.queryByText(/Ctrl\/⌘ K/i)).not.toBeInTheDocument();
  });

  it('exibe os filtros de período e a validação do intervalo', () => {
    render(<Harness periodError="A data inicial não pode ser posterior à data final." />);

    fireEvent.click(screen.getByRole('button', { name: /^mais filtros$/i }));

    expect(screen.getByLabelText(/campo de data/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/data inicial/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/data final/i)).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent(/data inicial não pode/i);
  });

  it('permite apagar as buscas recentes', () => {
    const onClearRecentSearches = vi.fn();
    render(<Harness onClearRecentSearches={onClearRecentSearches} />);

    fireEvent.focus(screen.getByRole('combobox', { name: /busca por texto/i }));
    fireEvent.click(screen.getByRole('button', { name: /limpar buscas recentes/i }));

    expect(onClearRecentSearches).toHaveBeenCalledTimes(1);
  });
});
