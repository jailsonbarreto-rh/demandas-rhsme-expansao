import { cleanup, fireEvent, render, screen } from '@testing-library/react';
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

  it('mantém o rótulo das ações coerente com o comportamento da tabela', () => {
    const onOpenDetalhes = vi.fn();
    render(<DemandasTable
      demandas={[demanda]}
      onOpenEditar={onOpenDetalhes}
      onOpenStatus={vi.fn()}
      onOpenHistorico={vi.fn()}
      onExcluir={vi.fn()}
      canEdit
      canDelete
    />);

    const abrir = screen.getByRole('button', { name: /^abrir$/i });
    fireEvent.click(abrir);
    expect(onOpenDetalhes).toHaveBeenCalledWith(demanda);

    fireEvent.click(screen.getByRole('button', { name: /mais ações da demanda sme-001/i }));
    expect(screen.getByRole('menuitem', { name: /alterar status/i })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /histórico/i })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /excluir/i })).toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: /^editar$/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^editar$/i })).not.toBeInTheDocument();
  });
});