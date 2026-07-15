import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { toast } from 'sonner';
import type { PerfilUsuario } from '../types';
import {
  AdminPanel,
  analyzeAccessIntegrity,
  buildAccessBackup,
  type ServidorPerfil,
} from './AdminPanel';

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
    info: vi.fn(),
  },
}));

const pending: PerfilUsuario = {
  id: 'pending-1', nome: 'Nova Servidora', email: 'nova@rioeduca.net', setor: 'CTRH',
  nivel: 'leitor', status: 'pendente',
};

const activeAdmin: PerfilUsuario = {
  id: 'admin-1', nome: 'Administradora', email: 'admin@rioeduca.net', setor: 'CTRH',
  nivel: 'administrador', status: 'ativo',
};

const servidorAdmin: ServidorPerfil = {
  id: 'admin-1', nome: 'Administradora', email: 'admin@rioeduca.net', setor: 'CTRH',
  nivel: 'Administrador', status: 'Ativo',
};

describe('AdminPanel', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

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

  it('gera backup contendo os perfis e níveis de acesso', () => {
    const backup = buildAccessBackup([servidorAdmin]);
    expect(backup.escopo).toBe('perfis_e_niveis_de_acesso');
    expect(backup.usuarios_count).toBe(1);
    expect(backup.perfis).toEqual([
      expect.objectContaining({
        id: servidorAdmin.id,
        email: servidorAdmin.email,
        nivel: 'Administrador',
        status: 'Ativo',
      }),
    ]);
  });

  it('executa de verdade a exportação pelo botão administrativo', async () => {
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
    render(<AdminPanel perfis={[activeAdmin]} onUpdatePerfil={vi.fn()} />);
    await userEvent.setup().click(screen.getByRole('button', { name: /exportar perfis/i }));
    expect(click).toHaveBeenCalledOnce();
  });

  it('detecta ausência de administrador ativo na verificação de acessos', async () => {
    render(<AdminPanel perfis={[pending]} onUpdatePerfil={vi.fn()} />);
    await userEvent.setup().click(screen.getByRole('button', { name: /verificar acessos/i }));
    expect(toast.error).toHaveBeenCalledWith(
      expect.stringMatching(/verificação concluída/i),
      expect.objectContaining({ description: expect.stringMatching(/nenhum administrador ativo/i) }),
    );
  });

  it('considera íntegra uma lista institucional sem duplicidades e com administrador ativo', () => {
    const report = analyzeAccessIntegrity([servidorAdmin]);
    expect(report.ok).toBe(true);
    expect(report.issues).toEqual([]);
    expect(report.activeAdministrators).toBe(1);
  });
});
