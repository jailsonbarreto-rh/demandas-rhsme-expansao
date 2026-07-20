import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { Demanda } from '../types';
import type { DemandSearchMatch } from '../search/searchTypes';
import { DemandasTable } from './DemandasTable';

const demanda: Demanda = {
  id: 1,
  numero: 'SME-PRO-2025/001',
  tipo: 'Processo',
  assunto: 'Processo de aposentadoria de servidor',
  responsavel: 'Pedro Almeida',
  limite1: '',
  limite2: '',
  status: 'Aguardando Andamento',
  setor: 'E/CTRH',
  classificacao: 'Aposentadoria',
};

const match: DemandSearchMatch = {
  matches: true,
  terms: ['aposentadoria', 'pedro', '2026'],
  matchedFields: ['assunto', 'responsavel'],
  fieldTerms: {
    assunto: ['aposentadoria'],
    responsavel: ['pedro'],
  },
  matchKind: 'approximate',
  matchedTermCount: 2,
  totalTermCount: 3,
  missingTerms: ['2026'],
  relevanceScore: 209,
};

describe('DemandasTable — resultados próximos', () => {
  it('separa sugestões de resultados exatos e informa termos ausentes', () => {
    render(
      <DemandasTable
        demandas={[demanda]}
        searchQuery="aposentadoria Pedro 2026"
        searchMatches={new Map([[1, match]])}
        searchResultMode="approximate"
        onOpenEditar={vi.fn()}
        onOpenStatus={vi.fn()}
        onOpenHistorico={vi.fn()}
        onExcluir={vi.fn()}
      />,
    );

    expect(screen.getByRole('status')).toHaveTextContent(/nenhuma demanda contém todos os 3 termos/i);
    expect(screen.getByText(/2 de 3 termos/i)).toBeInTheDocument();
    expect(screen.getByText(/termo ausente:/i)).toHaveTextContent('2026');
  });
});
