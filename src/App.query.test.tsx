import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { App } from './App';
import type { AppServices } from './services/createAppServices';
import type { AppUser } from './types';
import { createMinimalDemandFixture } from './test/expandedFixtures';

const activeUser: AppUser = {
  id: 'query-user',
  email: 'query-user@rioeduca.net',
  perfil: {
    id: 'query-user',
    nome: 'Usuário Query',
    email: 'query-user@rioeduca.net',
    setor: 'CTRH',
    nivel: 'editor',
    status: 'ativo',
  },
};

function createServices() {
  const recoveredDemand = createMinimalDemandFixture({
    id: 91,
    numero: 'SME-RECUPERADA-091',
    assunto: 'Demanda carregada após nova tentativa',
  });
  const load = vi.fn()
    .mockRejectedValueOnce(new Error('conexão temporariamente indisponível'))
    .mockResolvedValue({ demandas: [recoveredDemand], historico: [] });

  const services: AppServices = {
    mode: 'supabase',
    auth: {
      restore: vi.fn().mockResolvedValue(activeUser),
      signIn: vi.fn().mockResolvedValue(activeUser),
      requestAccess: vi.fn().mockResolvedValue(undefined),
      requestPasswordReset: vi.fn().mockResolvedValue(undefined),
      completePasswordReset: vi.fn().mockResolvedValue(undefined),
      signOut: vi.fn().mockResolvedValue(undefined),
      subscribe: vi.fn(() => () => undefined),
    },
    demandas: {
      load,
      loadTrash: vi.fn().mockResolvedValue([]),
      create: vi.fn().mockResolvedValue(undefined),
      edit: vi.fn().mockResolvedValue(undefined),
      registerProgress: vi.fn().mockResolvedValue(undefined),
      transitionStatus: vi.fn().mockResolvedValue(undefined),
      deleteLogically: vi.fn().mockResolvedValue(undefined),
      subscribe: vi.fn(() => () => undefined),
    },
    profiles: {
      list: vi.fn().mockResolvedValue([]),
      listMinimal: vi.fn().mockResolvedValue([]),
      updateAccess: vi.fn().mockResolvedValue(undefined),
    },
  };

  return { services, load };
}

afterEach(() => {
  cleanup();
  window.history.replaceState({}, '', '/');
  vi.restoreAllMocks();
});

describe('recuperação de consultas no App', () => {
  it('mantém o sistema disponível e permite tentar novamente após falha inicial', async () => {
    const user = userEvent.setup();
    const { services, load } = createServices();

    render(<App services={services} />);

    expect(await screen.findByText(/erro de conectividade/i)).toBeVisible();
    const retryButton = screen.getByRole('button', { name: /tentar novamente/i });
    await user.click(retryButton);

    expect(await screen.findByText('SME-RECUPERADA-091')).toBeVisible();
    await waitFor(() => expect(load).toHaveBeenCalledTimes(2));
    expect(screen.queryByText(/erro de conectividade/i)).not.toBeInTheDocument();
  });
});
