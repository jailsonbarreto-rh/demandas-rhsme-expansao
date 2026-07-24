import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { AppServices } from './services/createAppServices';
import { AccessPendingError } from './services/errors';
import type { AppUser, ComentarioHistorico, Demanda, PerfilMinimo } from './types';
import { createMinimalDemandFixture } from './test/expandedFixtures';
import { getTodayString } from './utils/date';
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

function formatDate(date: Date) {
  return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
}

function createContextualDashboardData() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayString = formatDate(yesterday);
  const todayString = getTodayString();

  return [
    createMinimalDemandFixture({
      id: 11,
      numero: 'SME-OWN-ACTIVE',
      assunto: 'Ativa pessoal',
      responsavel: 'Teste',
      responsavelId: activeUser.id,
      status: 'Aguardando Andamento',
    }),
    createMinimalDemandFixture({
      id: 12,
      numero: 'SME-OWN-SIGN',
      assunto: 'Assinatura pessoal',
      responsavel: 'Teste',
      responsavelId: activeUser.id,
      status: 'Para Assinatura',
    }),
    createMinimalDemandFixture({
      id: 13,
      numero: 'SME-OWN-TODAY',
      assunto: 'Prazo hoje pessoal',
      responsavel: 'Teste',
      responsavelId: activeUser.id,
      status: 'Aguardando Andamento',
      limite2: todayString,
    }),
    createMinimalDemandFixture({
      id: 14,
      numero: 'SME-OWN-OVERDUE',
      assunto: 'Vencida pessoal',
      responsavel: 'Teste',
      responsavelId: activeUser.id,
      status: 'Aguardando Andamento',
      limite2: yesterdayString,
    }),
    createMinimalDemandFixture({
      id: 21,
      numero: 'SME-TEAM-ACTIVE',
      assunto: 'Ativa da equipe',
      responsavel: 'Outra pessoa',
      responsavelId: 'user-2',
      status: 'Aguardando Andamento',
    }),
    createMinimalDemandFixture({
      id: 22,
      numero: 'SME-TEAM-SIGN',
      assunto: 'Assinatura da equipe',
      responsavel: 'Outra pessoa',
      responsavelId: 'user-2',
      status: 'Para Assinatura',
    }),
    createMinimalDemandFixture({
      id: 23,
      numero: 'SME-TEAM-TODAY',
      assunto: 'Prazo hoje da equipe',
      responsavel: 'Outra pessoa',
      responsavelId: 'user-2',
      status: 'Aguardando Andamento',
      limite2: todayString,
    }),
    createMinimalDemandFixture({
      id: 24,
      numero: 'SME-TEAM-OVERDUE',
      assunto: 'Vencida da equipe',
      responsavel: 'Outra pessoa',
      responsavelId: 'user-2',
      status: 'Aguardando Andamento',
      limite2: yesterdayString,
    }),
  ];
}

function expectHeaderCount(title: string, count: number) {
  expect(within(screen.getByTitle(title)).getByText(String(count))).toBeVisible();
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
    expect(screen.getByRole('button', { name: 'Demandas Equipe CTRH' })).toBeVisible();

    await user.click(screen.getByRole('button', { name: 'Demandas Equipe CTRH' }));

    await waitFor(() => expect(window.location.pathname).toBe('/demandas'));
    expect(await screen.findByText('Demanda de outro usuário')).toBeVisible();
    expect(screen.getByText('Demanda sem responsável oficial')).toBeVisible();
    expect(screen.getByRole('button', { name: /^demandas$/i })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('button', { name: 'Ver minhas demandas' })).toBeVisible();
  });

  it('atualiza os indicadores e seus filtros conforme a carteira ativa', async () => {
    const { services } = createServices(undefined, {
      demandas: createContextualDashboardData(),
      historico: [],
    });
    const user = userEvent.setup();

    render(<App services={services} />);
    await fillLogin(user);

    await waitFor(() => {
      expectHeaderCount('Exibir todas as demandas em acompanhamento', 8);
      expectHeaderCount('Filtrar por demandas aguardando assinatura', 2);
      expectHeaderCount('Filtrar por demandas com prazo hoje', 2);
      expectHeaderCount('Filtrar por demandas vencidas', 2);
    });

    await user.click(screen.getByRole('button', { name: /^minhas demandas$/i }));
    await waitFor(() => expect(window.location.pathname).toBe('/minhas-demandas'));

    await waitFor(() => {
      expectHeaderCount('Exibir todas as demandas em acompanhamento', 4);
      expectHeaderCount('Filtrar por demandas aguardando assinatura', 1);
      expectHeaderCount('Filtrar por demandas com prazo hoje', 1);
      expectHeaderCount('Filtrar por demandas vencidas', 1);
    });

    await user.click(screen.getByTitle('Filtrar por demandas aguardando assinatura'));

    expect((await screen.findAllByText('Assinatura pessoal')).length).toBeGreaterThan(0);
    expect(screen.queryAllByText('Assinatura da equipe')).toHaveLength(0);
    expect(window.location.pathname).toBe('/minhas-demandas');

    await user.click(screen.getByRole('button', { name: 'Demandas Equipe CTRH' }));
    await waitFor(() => expect(window.location.pathname).toBe('/demandas'));

    await waitFor(() => {
      expectHeaderCount('Exibir todas as demandas em acompanhamento', 8);
      expectHeaderCount('Filtrar por demandas aguardando assinatura', 2);
      expectHeaderCount('Filtrar por demandas com prazo hoje', 2);
      expectHeaderCount('Filtrar por demandas vencidas', 2);
    });
    expect((await screen.findAllByText('Assinatura da equipe')).length).toBeGreaterThan(0);
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

  it('aplica o cartão de status sem sair da carteira pessoal nem restaurar estado antigo', async () => {
    const { services } = createServices(undefined, {
      demandas: createPortfolioData(),
      historico: [],
    });
    const user = userEvent.setup();

    render(<App services={services} />);
    await fillLogin(user);
    await user.click(await screen.findByRole('button', { name: /^minhas demandas$/i }));
    await waitFor(() => expect(window.location.pathname).toBe('/minhas-demandas'));

    await user.selectOptions(screen.getByLabelText(/^status$/i), 'todos');
    await waitFor(() => expect(window.location.search).toContain('status=todos'));
    await user.click(screen.getByRole('button', { name: /em acompanhamento/i }));

    await waitFor(() => {
      expect(window.location.pathname).toBe('/minhas-demandas');
      expect(window.location.search).not.toContain('status=');
      expect(screen.getByLabelText(/^status$/i)).toHaveValue('acompanhamento');
    });
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
