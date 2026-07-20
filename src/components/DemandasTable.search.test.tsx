import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { Demanda } from '../types';
import type { DemandSearchMatch } from '../search/searchTypes';
import { DemandasTable } from './DemandasTable';

const demanda: Demanda = {
  id: 42,
  numero: 'SME-PRO-2025/001.234',
  tipo: 'Processo',
  assunto: 'Solicitação de cessão de servidor',
  responsavel: 'Ricardo Silva',
  limite1: '10/07/2026',
  limite2: '20/07/2026',
  status: 'Aguardando Andamento',
  setor: 'E/CTRH',
  classificacao: 'Movimentação de pessoal',
};

const match: DemandSearchMatch = {
  matches: true,
  terms: ['cessao', 'ricardo', '2025'],
  matchedFields: ['numero', 'assunto', 'responsavel', 'historico'],
  fieldTerms: {
    numero: ['2025'],
    assunto: ['cessao'],
    responsavel: ['ricardo'],
    historico: ['ricardo'],
  },
  historySnippet: 'Processo devolvido para Ricardo realizar os ajustes.',
  historyItemId: 10,
};

describe('DemandasTable — resultado da busca', () => {
  it('destaca termos visíveis e explica correspondência no histórico', () => {
    render(
      <DemandasTable
        demandas={[demanda]}
        searchQuery="cessao ricardo 2025"
        searchMatches={new Map([[42, match]])}
        onOpenEditar={vi.fn()}
        onOpenStatus={vi.fn()}
        onOpenHistorico={vi.fn()}
        onExcluir={vi.fn()}
      />,
    );

    expect(screen.getByText('cessão').tagName).toBe('MARK');
    expect(screen.getByText('Ricardo', { exact: false })).toBeInTheDocument();
    expect(screen.getByText(/Encontrado em:/i)).toBeInTheDocument();
    expect(screen.getByText(/Histórico: Processo devolvido/i)).toBeInTheDocument();
  });
});
