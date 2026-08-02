import type { PropsWithChildren } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { AppUser, CreateDemandaInput, Demanda } from '../types';
import type { AppData, DemandasRepository } from '../services/contracts';
import { DemandasQueryClientContext } from '../query/queryClient';
import { createMinimalDemandFixture } from '../test/expandedFixtures';
import { useDemandasData } from './useDemandasData';

const userOne: AppUser = {
  id: 'user-1',
  email: 'user-1@rioeduca.net',
  perfil: {
    id: 'user-1',
    nome: 'Usuário 1',
    email: 'user-1@rioeduca.net',
    setor: 'CTRH',
    nivel: 'editor',
    status: 'ativo',
  },
};

const userTwo: AppUser = {
  ...userOne,
  id: 'user-2',
  email: 'user-2@rioeduca.net',
  perfil: {
    ...userOne.perfil,
    id: 'user-2',
    nome: 'Usuário 2',
    email: 'user-2@rioeduca.net',
  },
};

const initialDemand = createMinimalDemandFixture({
  id: 1,
  numero: 'SME-CACHE-001',
  assunto: 'Demanda inicial do cache',
  responsavel: 'Usuário 1',
  status: 'Aguardando Andamento',
});

const refreshedDemand = createMinimalDemandFixture({
  id: 2,
  numero: 'SME-CACHE-002',
  assunto: 'Demanda atualizada em segundo plano',
  responsavel: 'Usuário 1',
  status: 'Aguardando Andamento',
});

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
      mutations: { retry: false },
    },
  });
}

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: PropsWithChildren) {
    return (
      <DemandasQueryClientContext.Provider value={queryClient}>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </DemandasQueryClientContext.Provider>
    );
  };
}

function createRepository(initialData: AppData = { demandas: [initialDemand], historico: [] }) {
  let realtimeCallback: (() => void) | undefined;
  const load = vi.fn().mockResolvedValue(initialData);
  const loadTrash = vi.fn().mockResolvedValue([initialDemand]);
  const create = vi.fn().mockResolvedValue(undefined);
  const repository: DemandasRepository = {
    load,
    loadTrash,
    create,
    edit: vi.fn().mockResolvedValue(undefined),
    registerProgress: vi.fn().mockResolvedValue(undefined),
    transitionStatus: vi.fn().mockResolvedValue(undefined),
    deleteLogically: vi.fn().mockResolvedValue(undefined),
    subscribe: vi.fn((callback) => {
      realtimeCallback = callback;
      return () => { realtimeCallback = undefined; };
    }),
  };

  return {
    repository,
    load,
    loadTrash,
    create,
    emitRealtime: () => realtimeCallback?.(),
  };
}

const createInput: CreateDemandaInput = {
  numero: 'SME-NOVA-001',
  tipo: 'Processo',
  assunto: 'Nova demanda',
  responsavel: 'Usuário 1',
  responsavelId: userOne.id,
  limite1: '',
  limite1Situacao: 'nao_informado',
  limite1Justificativa: '',
  limite2: '',
  limite2Situacao: 'nao_informado',
  limite2Justificativa: '',
  proximaAcao: 'Analisar',
  proximaAcaoEm: '',
  proximaAcaoJustificativa: '',
  linkOrigem: '',
  status: 'Aguardando Andamento',
  setor: 'CTRH',
  classificacao: 'Outros',
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe('useDemandasData com cache de servidor', () => {
  it('deduplica a consulta quando dois consumidores usam a mesma sessão', async () => {
    const queryClient = createQueryClient();
    const wrapper = createWrapper(queryClient);
    const { repository, load } = createRepository();

    const first = renderHook(() => useDemandasData(repository, userOne, false), { wrapper });
    const second = renderHook(() => useDemandasData(repository, userOne, false), { wrapper });

    await waitFor(() => {
      expect(first.result.current.demandas).toHaveLength(1);
      expect(second.result.current.demandas).toHaveLength(1);
    });

    expect(load).toHaveBeenCalledTimes(1);
    first.unmount();
    second.unmount();
    queryClient.clear();
  });

  it('agrupa eventos Realtime consecutivos em uma única atualização', async () => {
    const queryClient = createQueryClient();
    const wrapper = createWrapper(queryClient);
    const { repository, load, emitRealtime } = createRepository();

    const hook = renderHook(() => useDemandasData(repository, userOne, true), { wrapper });
    await waitFor(() => expect(hook.result.current.demandas).toHaveLength(1));

    act(() => {
      emitRealtime();
      emitRealtime();
      emitRealtime();
    });

    await waitFor(() => expect(load).toHaveBeenCalledTimes(2));
    await new Promise((resolve) => window.setTimeout(resolve, 180));
    expect(load).toHaveBeenCalledTimes(2);

    hook.unmount();
    queryClient.clear();
  });

  it('reutiliza o cache da lixeira dentro da mesma sessão', async () => {
    const queryClient = createQueryClient();
    const wrapper = createWrapper(queryClient);
    const { repository, loadTrash } = createRepository();

    const hook = renderHook(() => useDemandasData(repository, userOne, false), { wrapper });
    await waitFor(() => expect(hook.result.current.demandas).toHaveLength(1));

    let first: Demanda[] = [];
    let second: Demanda[] = [];
    await act(async () => {
      first = await hook.result.current.loadTrash();
      second = await hook.result.current.loadTrash();
    });

    expect(first).toEqual([initialDemand]);
    expect(second).toEqual([initialDemand]);
    expect(loadTrash).toHaveBeenCalledTimes(1);

    hook.unmount();
    queryClient.clear();
  });

  it('mantém os dados visíveis enquanto a mutação atualiza o cache em segundo plano', async () => {
    const queryClient = createQueryClient();
    const wrapper = createWrapper(queryClient);
    const { repository, load, create } = createRepository();
    let resolveRefresh: ((value: AppData) => void) | undefined;
    load.mockResolvedValueOnce({ demandas: [initialDemand], historico: [] });
    load.mockImplementationOnce(() => new Promise<AppData>((resolve) => { resolveRefresh = resolve; }));

    const hook = renderHook(() => useDemandasData(repository, userOne, false), { wrapper });
    await waitFor(() => expect(hook.result.current.demandas).toEqual([initialDemand]));

    let mutationPromise: Promise<void> | undefined;
    act(() => {
      mutationPromise = hook.result.current.create(createInput);
    });

    await waitFor(() => expect(create).toHaveBeenCalledWith(createInput));
    expect(hook.result.current.loading).toBe(false);
    expect(hook.result.current.demandas).toEqual([initialDemand]);

    await act(async () => {
      resolveRefresh?.({ demandas: [refreshedDemand], historico: [] });
      await mutationPromise;
    });

    await waitFor(() => expect(hook.result.current.demandas).toEqual([refreshedDemand]));
    hook.unmount();
    queryClient.clear();
  });

  it('remove o cache da sessão anterior ao trocar de usuário', async () => {
    const queryClient = createQueryClient();
    const wrapper = createWrapper(queryClient);
    const { repository, load } = createRepository();
    load
      .mockResolvedValueOnce({ demandas: [initialDemand], historico: [] })
      .mockResolvedValueOnce({ demandas: [refreshedDemand], historico: [] });

    const hook = renderHook(
      ({ user }) => useDemandasData(repository, user, false),
      { initialProps: { user: userOne as AppUser | null }, wrapper },
    );

    await waitFor(() => expect(hook.result.current.demandas).toEqual([initialDemand]));
    expect(queryClient.getQueryData(['demandas', 'session', userOne.id])).toBeDefined();

    hook.rerender({ user: userTwo });
    await waitFor(() => expect(hook.result.current.demandas).toEqual([refreshedDemand]));

    expect(queryClient.getQueryData(['demandas', 'session', userOne.id])).toBeUndefined();
    expect(queryClient.getQueryData(['demandas', 'session', userTwo.id])).toBeDefined();

    hook.unmount();
    queryClient.clear();
  });
});
