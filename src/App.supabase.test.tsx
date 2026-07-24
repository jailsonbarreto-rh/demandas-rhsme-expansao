import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { AppServices } from './services/createAppServices';
import { AccessPendingError } from './services/errors';
import type { AppUser, ComentarioHistorico, Demanda, PerfilMinimo } from './types';
import { createMinimalDemandFixture } from './test/expandedFixtures';
import { App } from './App';

const activeUser: AppUser = {
  id: 'user-1',
  email: 'teste@rioeduca.net',
  perfil: {
    id: 'user-1', nome: 'Teste', email: 'teste@rioeduca.net', setor: 'CTRH',
    nivel: 'editor', status: 'ativo',
  },
};

const officialResponsible: PerfilMinimo = {
  id: '11111111-1111-4111-8111-111111111111',
  nome: 'ERICA VALIM DE ALMEIDA HOLANDA',
  setor: 'E/CTRH',
};

function createServices(
  signIn = vi.fn().mockResolvedValue(activeUser),
  initialData: { demandas: Demanda[]; historico: ComentarioHistorico[] } = { demandas: [], historico: [] },
) {
  const load = vi.fn().mockResolvedValue(initialData);
  const create = vi.fn().mockResolvedValue(undefined);
  const listMinimal = vi.fn().mockResolvedValue([officialResponsible]);
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
      load,
      loadTrash: vi.fn().mockResolvedValue([]),
      create,
      edit: vi.fn().mockResolvedValue(undefined),
      registerProgress: vi.fn().mockResolvedValue(undefined),
      transitionStatus: vi.fn().mockResolvedValue(undefined),
      deleteLogically: vi.fn().mockResolvedValue(undefined),
      restore: vi.fn().mockResolvedValue(undefined),
      update: vi.fn().mockResolvedValue(undefined),
      updateStatus: vi.fn().mockResolvedValue(undefined),
      delete: vi.fn().mockResolvedValue(undefined),
      subscribe: vi.fn(() => () => undefined),
    },
    profiles: {
      list: vi.fn().mockResolvedValue([]),
      listMinimal,
      updateAccess: vi.fn().mockResolvedValue(undefined),
    },
  };
  return { services, load, create, listMinimal };
}

async function fillLogin(user: ReturnType<typeof userEvent.setup>) {
  await user.type(await screen.findByPlaceholderText('usuario@rioeduca.net'), 'teste@rioeduca.net');
  await user.type((await screen.findAllByPlaceholderText('••••••••'))[0], 'senha-remota-teste');
  await user.click(await screen.findByRole('button', { name: /acessar sistema/i }));
}

function createPortfolioData() {
  const ownDemand = createMinimalDemandFixture({
    id: 1,
    numero: 'SME-OWN-001',
    assunto: 'Demanda do usuário conectado',
    responsavel: 'Teste',
    responsavelId: activeUser.id,
    status: 'Aguardando Andamento',
  });
  const otherDemand = createMinimalDemandFixture({
    id: 2,
    numero: 'SME-OTHER-001',
    assunto: 'Demanda de outro usuário',
    responsavel: 'Outra pessoa',
    responsavelId: 'user-2',
    status: 'Aguardando Andamento',
  });
  const legacyDemand = createMinimalDemandFixture({
    id: 3,
    numero: 'SME-LEGACY-001',
    assunto: 'Demanda sem responsável oficial',
    responsavel: 'Vanessa Migrado',
    responsavelId: null,
    status: 'Aguardando Andamento',
  });
  return [ownDemand, otherDemand, legacyDemand];
}

describe('App no modo Supabase', () => {
  afterEach(() => {
    cleanup();
    window.history.replaceState({}, '', '/');
    vi.unstubAllGlobals();
  });

  it('carrega dados e perfis depois do login e grava o responsável oficial', async () => {
    const user = userEvent.setup();
    const { services, load, create, listMinimal } = createServices();
    render(<App services={services} />);
    await fillLogin(user);
    expect(await screen.findByRole('button', { name: /nova demanda/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /administração/i })).not.toBeInTheDocument();
    await waitFor(() => expect(load).toHaveBeenCalled());
    await waitFor(() => expect(listMinimal).toHaveBeenCalled());

    await user.click(screen.getByRole('button', { name: /nova demanda/i }));
    await user.selectOptions(await screen.findByLabelText('Tipo'), 'Processo');
    await user.type(screen.getByLabelText('Número'), 'SME-TESTE-001');
    await user.type(screen.getByLabelText('Assunto'), 'Demanda de integração');
    await user.selectOptions(screen.getByLabelText('Responsável'), officialResponsible.id);
    await user.selectOptions(screen.getByLabelText('Status'), 'Aguardando Andamento');
    await user.selectOptions(screen.getByLabelText('Selecione a classificação'), 'Outros');
    await user.type(screen.getByLabelText('Próxima ação'), 'Conferir documentação recebida');
    await user.type(screen.getByLabelText('Data de acompanhamento'), '20082026');
    await user.click(screen.getByRole('button', { name: /salvar/i }));

    await waitFor(() => expect(create).toHaveBeenCalledWith(expect.objectContaining({
      numero: 'SME-TESTE-001',
      assunto: 'Demanda de integração',
      responsavelId: officialResponsible.id,
      responsavel: officialResponsible.nome,
      proximaAcao: 'Conferir documentação recebida',
      proximaAcaoEm: '20/08/2026',
    })));
  });

  it('alterna explicitamente entre a carteira pessoal e a carteira geral', async () => {
    const { services } = createServices(undefined, {
      demandas: createPortfolioData(),
      historico: [],
    });
    const user = userEvent.setup();

    render(<App services={services} />);
    await fillLogin(user);
    await user.click(await screen.findByRole('button', {
      name: /minhas demandas.*acompanhe sua carteira de processos/i,
    }));

    await waitFor(() => expect(window.location.pathname).toBe('/minhas-demandas'));
    expect(window.location.search).not.toContain('escopo');
    expect(await screen.findByText('Demanda do usuário conectado')).toBeVisible();
    expect(screen.queryByText('Demanda de outro usuário')).not.toBeInTheDocument();
    expect(screen.queryByText('Demanda sem responsável oficial')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^minhas demandas$/i })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('button', { name: 'Ver todas as demandas' })).toBeVisible();

    await user.click(screen.getByRole('button', { name: 'Ver todas as demandas' }));

    await waitFor(() => expect(window.location.pathname).toBe('/demandas'));
    expect(await screen.findByText('Demanda de outro usuário')).toBeVisible();
    expect(screen.getByText('Demanda sem responsável oficial')).toBeVisible();
    expect(screen.getByRole('button', { name: /^demandas$/i })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('button', { name: 'Ver minhas demandas' })).toBeVisible();
  });

  it('limpa filtros dentro da carteira pessoal sem retornar à carteira geral', async () => {
    const { services } = createServices(undefined, {
      demandas: createPortfolioData(),
      historico: [],
    });
    const user = userEvent.setup();

    render(<App services={services} />);
    await fillLogin(user);
    await user.click(await screen.findByRole('button', { name: /^minhas demandas$/i }));
    await waitFor(() => expect(window.location.pathname).toBe('/minhas-demandas'));

    await user.type(screen.getByLabelText(/busca por texto/i), 'usuário');
    await user.click(screen.getByRole('button', { name: 'Limpar filtros' }));

    expect(window.location.pathname).toBe('/minhas-demandas');
    expect(screen.getByRole('heading', { name: 'Minhas demandas' })).toBeVisible();
    expect(await screen.findByText('Demanda do usuário conectado')).toBeVisible();
    expect(screen.queryByText('Demanda de outro usuário')).not.toBeInTheDocument();
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
