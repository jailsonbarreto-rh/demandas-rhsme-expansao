import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Header } from './Header';

describe('Header — identidade única do produto', () => {
  it('apresenta somente Fluxo CTRH como marca e não mantém o nome legado no cabeçalho', () => {
    render(
      <Header
        userEmail="servidor@rioeduca.net"
        demandas={[]}
        onLogout={vi.fn()}
        onOpenNovo={vi.fn()}
        onExportExcel={vi.fn()}
        filtrosAtivos={{
          status: 'Somente ativos (padrão)',
          quickFilters: { assinatura: false, hoje: false, vencido: false },
        }}
        onToggleFiltroStatus={vi.fn()}
        onToggleQuickFilter={vi.fn()}
        appMode="supabase"
      />,
    );

    expect(screen.getByText('Fluxo CTRH')).toBeInTheDocument();
    expect(screen.queryByText('Fluxo RH')).not.toBeInTheDocument();
    expect(screen.queryByText('Central de Demandas')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Painel de Demandas' })).toBeInTheDocument();
  });
});
