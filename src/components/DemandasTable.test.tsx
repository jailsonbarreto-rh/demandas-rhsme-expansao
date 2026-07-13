import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Demanda } from '../types';
import { DemandasTable } from './DemandasTable';

const demanda: Demanda = {
  id: 1, numero: 'SME-001', tipo: 'Processo', assunto: 'Assunto', responsavel: 'Pessoa',
  limite1: '', limite2: '', status: 'Aguardando Andamento', setor: 'CTRH', classificacao: 'Outros',
};

describe('DemandasTable', () => {
  afterEach(cleanup);

  it('nomeia e informa o estado do menu de ações', () => {
    render(<DemandasTable
      demandas={[demanda]}
      onOpenEditar={vi.fn()}
      onOpenStatus={vi.fn()}
      onOpenHistorico={vi.fn()}
      onExcluir={vi.fn()}
    />);
    const menuButton = screen.getByRole('button', { name: /mais ações da demanda sme-001/i });
    expect(menuButton).toHaveAttribute('aria-expanded', 'false');
    expect(menuButton).toHaveAttribute('aria-label');
  });
});
