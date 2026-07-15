import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { AppServices } from './services/createAppServices';
import { AccessPendingError } from './services/errors';
import type { AppUser } from './types';
import { App } from './App';

const activeUser: AppUser = {
  id: 'user-1',
  email: 'teste@rioeduca.net',
  perfil: {
    id: 'user-1', nome: 'Teste', email: 'teste@rioeduca.net', setor: 'CTRH',
    nivel: 'editor', status: 'ativo',
  },
};

function createServices(signIn = vi.fn().mockResolvedValue(activeUser)) {
  const load = vi.fn().mockResolvedValue({ demandas: [], historico: [] });
  const create = vi.fn().mockResolvedValue(undefined);
  const services: AppServices = {
    mode: 'supabase',
    auth: {
      restore: vi.fn().mockResolvedValue(null),
      signIn,
      requestAccess: vi.fn().mockResolvedValue(undefined),
      signOut: vi.fn().mockResolvedValue(undefined),
      subscribe: vi.fn(() => () => undefined),
    },
    demandas: {
      load, create,
      update: vi.fn().mockResolvedValue(undefined),
      updateStatus: vi.fn().mockResolvedValue(undefined),
      delete: vi.fn().mockResolvedValue(undefined),
      subscribe: vi.fn(() => () => undefined),
    },
    profiles: { list: vi.fn().mockResolvedValue([]), updateAccess: vi.fn().mockResolvedValue(undefined) },
  };
  return { services, load, create };
}

async function fillLogin(user: ReturnType<typeof userEvent.setup>) {
  await user.type(await screen.findByPlaceholderText('usuario@rioeduca.net'), 'teste@rioeduca.net');
  await user.type((await screen.findAllByPlaceholderText('••••••••'))[0], 'senha-remota-teste');
  await user.click(await screen.findByRole('button', { name: /acessar sistema/i }));
}

describe('App no modo Supabase', () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it('carrega dados depois do login ativo e usa o repositório remoto no cadastro', async () => {
    const user = userEvent.setup();
    const { services, load, create } = createServices();
    render(<App services={services} />);
    await fillLogin(user);
    expect(await screen.findByRole('button', { name: /nova demanda/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /administração/i })).not.toBeInTheDocument();
    await waitFor(() => expect(load).toHaveBeenCalled());

    await user.click(screen.getByRole('button', { name: /nova demanda/i }));
    await user.selectOptions(await screen.findByLabelText('Tipo'), 'Processo');
    await user.type(screen.getByLabelText('Número'), 'SME-TESTE-001');
    await user.type(screen.getByLabelText('Assunto'), 'Demanda de integração');
    await user.selectOptions(screen.getByLabelText('Status'), 'Aguardando Andamento');
    await user.selectOptions(screen.getByLabelText('Selecione a classificação'), 'Outros');
    await user.click(screen.getByRole('button', { name: /salvar/i }));

    await waitFor(() => expect(create).toHaveBeenCalledWith(expect.objectContaining({
      numero: 'SME-TESTE-001', assunto: 'Demanda de integração',
    })));
  });

  it('mantém perfil pendente na tela de login', async () => {
    const signIn = vi.fn().mockRejectedValue(new AccessPendingError());
    const { services, load } = createServices(signIn);
    render(<App services={services} />);
    await fillLogin(userEvent.setup());

    expect(await screen.findByRole('button', { name: /acessar sistema/i })).toBeInTheDocument();
    expect(await screen.findByText(/aguarda aprovação/i)).toBeVisible();
    expect(load).not.toHaveBeenCalled();
  });
});
