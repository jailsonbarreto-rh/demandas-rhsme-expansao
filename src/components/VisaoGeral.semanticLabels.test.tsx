import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createMinimalDemandFixture } from '../test/expandedFixtures';
import { VisaoGeral } from './VisaoGeral';

const demandas = [
  createMinimalDemandFixture({
    id: 901,
    numero: 'SME-PRO-2026/00901',
    assunto: 'Demanda de teste semântico',
    responsavel: 'Usuário Oficial',
    responsavelId: 'uuid-oficial',
    setor: 'E/CTRH',
    status: 'Aguardando Andamento',
    limite1: '',
    limite1Situacao: 'nao_informado',
    limite2: '25/07/2026',
    limite2Situacao: 'definido',
  }),
  createMinimalDemandFixture({
    id: 902,
    numero: 'SME-PRO-2026/00902',
    assunto: 'Demanda legada de teste',
    responsavel: 'Vanessa Migrado',
    responsavelId: null,
    setor: 'E/CTRH',
    status: 'Sobrestado',
  }),
];

describe('semânticas do Radar de Governança', () => {
  afterEach(cleanup);

  it('apresenta identidade institucional e leituras analíticas sem inferir desempenho', () => {
    render(
      <VisaoGeral
        demandas={demandas}
        historico={[]}
        onOpenEditar={vi.fn()}
        renderAtencaoImediata={() => null}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Radar de Governança' })).toBeVisible();
    expect(screen.getByText('Visão estratégica do fluxo de trabalho, com análise de dados e monitoramento da carteira de demandas.')).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Cobertura dos prazos' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Distribuição por responsável' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Demandas por setor informado' })).toBeVisible();
    expect(screen.getByText('Vanessa Migrado')).toBeVisible();
    expect(screen.getByText('Vínculo legado pendente')).toBeVisible();
    expect(screen.queryByText(/setores mais ativos/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/ranking/i)).not.toBeInTheDocument();
  });
});
