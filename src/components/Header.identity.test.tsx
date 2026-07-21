import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Header } from './Header';

describe('Header — hierarquia da identidade do produto', () => {
  it('apresenta Fluxo CTRH como marca, Central de Demandas como módulo e um título de página não redundante', () => {
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
    expect(screen.getByText('Central de Demandas')).toHaveClass('header-module-label');
    expect(screen.getByRole('heading', { level: 1, name: 'Painel de Demandas' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { level: 1, name: 'Central de Demandas' })).not.toBeInTheDocument();
  });
});
