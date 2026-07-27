import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createMinimalDemandFixture } from '../test/expandedFixtures';
import { VisaoGeral } from './VisaoGeral';

const demanda = createMinimalDemandFixture({
  id: 901,
  numero: 'SME-PRO-2026/00901',
  assunto: 'Demanda de teste semântico',
  responsavel: 'Usuário Oficial',
  setor: 'E/CTRH',
  status: 'Aguardando Andamento',
});

describe('semânticas gerenciais da Visão Geral', () => {
  afterEach(cleanup);

  it('descreve a distribuição por setor sem inferir atividade ou desempenho', () => {
    render(
      <VisaoGeral
        demandas={[demanda]}
        historico={[]}
        onOpenEditar={vi.fn()}
        renderAtencaoImediata={() => null}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Demandas por setor informado' })).toBeVisible();
    expect(screen.queryByText(/setores mais ativos/i)).not.toBeInTheDocument();
  });
});
