import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Header } from './Header';

describe('Header — identidade única do produto', () => {
  it('apresenta a identidade consolidada do Radar e um estado operacional neutro', () => {
    render(
      <Header
        userEmail="servidor@rioeduca.net"
        demandas={[]}
        onLogout={vi.fn()}
        onOpenNovo={vi.fn()}
        onExportExcel={vi.fn()}
        onOpenMinhasDemandas={vi.fn()}
        personalWorkspaceActive={false}
        filtrosAtivos={{
          status: 'acompanhamento',
          quickFilters: { assinatura: false, hoje: false, vencido: false },
        }}
        onToggleFiltroStatus={vi.fn()}
        onToggleQuickFilter={vi.fn()}
        appMode="supabase"
      />,
    );

    expect(screen.getByText('Fluxo CTRH')).toBeInTheDocument();
    expect(screen.getByText('Gestão inteligente de processos e pessoas')).toBeInTheDocument();
    expect(screen.queryByText('Fluxo RH')).not.toBeInTheDocument();
    expect(screen.queryByText('Central de Demandas')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Radar de Governança' })).toBeInTheDocument();
    expect(screen.getByText('Visão estratégica do fluxo de trabalho, com análise de dados e monitoramento da carteira de demandas.')).toBeInTheDocument();
    expect(screen.getByText('Sistema online')).toBeInTheDocument();
    expect(screen.queryByText('Painel de Demandas')).not.toBeInTheDocument();
    expect(screen.queryByText(/Supabase/i)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /em acompanhamento/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /minhas demandas.*acompanhe sua carteira/i })).toBeInTheDocument();
    expect(screen.queryByText('Demandas Ativas')).not.toBeInTheDocument();
  });
});
