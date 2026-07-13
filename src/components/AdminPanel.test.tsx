import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { PerfilUsuario } from '../types';
import { AdminPanel } from './AdminPanel';

const pending: PerfilUsuario = {
  id: 'pending-1', nome: 'Nova Servidora', email: 'nova@rioeduca.net', setor: 'CTRH',
  nivel: 'leitor', status: 'pendente',
};

describe('AdminPanel', () => {
  afterEach(cleanup);

  it('mantém a lista simulada quando não recebe perfis', () => {
    render(<AdminPanel />);
    expect(screen.getByText('Wilson Peixoto')).toBeInTheDocument();
    expect(screen.getByText('Demonstração')).toBeInTheDocument();
    expect(screen.getByText('teste@rioeduca.net')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /aprovar/i })).not.toBeInTheDocument();
  });

  it('permite ao administrador aprovar um perfil real', async () => {
    const onUpdatePerfil = vi.fn().mockResolvedValue(undefined);
    render(<AdminPanel perfis={[pending]} onUpdatePerfil={onUpdatePerfil} />);
    expect(screen.queryByText('Demonstração')).not.toBeInTheDocument();
    await userEvent.setup().click(screen.getByRole('button', { name: /aprovar/i }));
    expect(onUpdatePerfil).toHaveBeenCalledWith(pending.id, { status: 'ativo' });
  });
});
