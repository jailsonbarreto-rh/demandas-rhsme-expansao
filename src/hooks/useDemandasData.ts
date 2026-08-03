import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, type QueryClient } from '@tanstack/react-query';
import type {
  AppUser,
  CreateDemandaInput,
  DeleteDemandaInput,
  EditDemandaInput,
  ProgressInput,
  StatusTransitionInput,
} from '../types';
import type { AppData, DemandasRepository } from '../services/contracts';
import { getUserFacingError } from '../domain/userFacingErrors';
import {
  createAppQueryClient,
  DemandasQueryClientContext,
  demandasQueryKeys,
} from '../query/queryClient';
import { DEMANDAS_QUERY_RETRY_EVENT } from '../query/queryEvents';

const EMPTY_DATA: AppData = { demandas: [], historico: [] };
const REALTIME_INVALIDATION_DELAY_MS = 100;
const repositoryQueryClients = new WeakMap<DemandasRepository, QueryClient>();

function getRepositoryQueryClient(repository: DemandasRepository) {
  const existing = repositoryQueryClients.get(repository);
  if (existing) return existing;
  const client = createAppQueryClient();
  repositoryQueryClients.set(repository, client);
  return client;
}

export function useDemandasData(
  repository: DemandasRepository,
  user: AppUser | null,
  enableRealtime: boolean,
) {
  const providedQueryClient = useContext(DemandasQueryClientContext);
  const queryClient = providedQueryClient ?? getRepositoryQueryClient(repository);
  const [mutationError, setMutationError] = useState<string | null>(null);
  const previousUserIdRef = useRef<string | null>(null);
  const realtimeTimerRef = useRef<number | null>(null);
  const userId = user?.id ?? null;
  const queryKey = userId
    ? demandasQueryKeys.session(userId)
    : (['demandas', 'session', 'anonymous'] as const);

  const query = useQuery<AppData>({
    queryKey,
    enabled: Boolean(userId),
    queryFn: async () => {
      try {
        return await repository.load();
      } catch (reason) {
        throw new Error(getUserFacingError(reason, 'Não foi possível carregar as demandas.'));
      }
    },
  }, queryClient);

  const clearPendingRealtimeInvalidation = useCallback(() => {
    if (realtimeTimerRef.current === null) return;
    window.clearTimeout(realtimeTimerRef.current);
    realtimeTimerRef.current = null;
  }, []);

  const invalidateSessionData = useCallback(async () => {
    if (!userId) return;
    clearPendingRealtimeInvalidation();
    await queryClient.invalidateQueries({
      queryKey: demandasQueryKeys.session(userId),
      exact: true,
    });
  }, [clearPendingRealtimeInvalidation, queryClient, userId]);

  useEffect(() => {
    const previousUserId = previousUserIdRef.current;
    if (previousUserId && previousUserId !== userId) {
      void queryClient.cancelQueries({
        queryKey: demandasQueryKeys.session(previousUserId),
        exact: true,
      });
      queryClient.removeQueries({
        queryKey: demandasQueryKeys.session(previousUserId),
        exact: true,
      });
      queryClient.removeQueries({
        queryKey: demandasQueryKeys.trash(previousUserId),
        exact: true,
      });
    }
    previousUserIdRef.current = userId;
    setMutationError(null);
  }, [queryClient, userId]);

  useEffect(() => {
    if (!userId || !enableRealtime) return undefined;

    const cleanup = repository.subscribe(() => {
      clearPendingRealtimeInvalidation();
      realtimeTimerRef.current = window.setTimeout(() => {
        realtimeTimerRef.current = null;
        void queryClient.invalidateQueries({
          queryKey: demandasQueryKeys.session(userId),
          exact: true,
        });
      }, REALTIME_INVALIDATION_DELAY_MS);
    });

    return () => {
      clearPendingRealtimeInvalidation();
      cleanup();
    };
  }, [clearPendingRealtimeInvalidation, enableRealtime, queryClient, repository, userId]);

  const createMutation = useMutation({
    mutationFn: (input: CreateDemandaInput) => repository.create(input),
    onSuccess: invalidateSessionData,
  }, queryClient);
  const editMutation = useMutation({
    mutationFn: ({ id, input }: { id: number; input: EditDemandaInput }) => repository.edit(id, input),
    onSuccess: invalidateSessionData,
  }, queryClient);
  const progressMutation = useMutation({
    mutationFn: ({ id, input }: { id: number; input: ProgressInput }) => repository.registerProgress(id, input),
    onSuccess: invalidateSessionData,
  }, queryClient);
  const statusMutation = useMutation({
    mutationFn: ({ id, input }: { id: number; input: StatusTransitionInput }) => repository.transitionStatus(id, input),
    onSuccess: invalidateSessionData,
  }, queryClient);
  const deleteMutation = useMutation({
    mutationFn: ({ id, input }: { id: number; input: DeleteDemandaInput }) => repository.deleteLogically(id, input),
    onSuccess: async () => {
      await invalidateSessionData();
      if (!userId) return;
      await queryClient.invalidateQueries({
        queryKey: demandasQueryKeys.trash(userId),
        exact: true,
      });
    },
  }, queryClient);

  const executeMutation = useCallback(async (operation: () => Promise<void>) => {
    setMutationError(null);
    try {
      await operation();
    } catch (reason) {
      const message = getUserFacingError(reason, 'Não foi possível salvar a alteração.');
      setMutationError(message);
      throw new Error(message);
    }
  }, []);

  const reload = useCallback(async () => {
    if (!userId) return;
    setMutationError(null);
    try {
      await query.refetch({ throwOnError: true });
    } catch (reason) {
      throw new Error(getUserFacingError(reason, 'Não foi possível carregar as demandas.'));
    }
  }, [query, userId]);

  useEffect(() => {
    const handleRetry = () => { void reload().catch(() => undefined); };
    window.addEventListener(DEMANDAS_QUERY_RETRY_EVENT, handleRetry);
    return () => window.removeEventListener(DEMANDAS_QUERY_RETRY_EVENT, handleRetry);
  }, [reload]);

  const loadTrash = useCallback(async () => {
    if (!userId) return [];
    return queryClient.fetchQuery({
      queryKey: demandasQueryKeys.trash(userId),
      queryFn: () => repository.loadTrash(),
      staleTime: 30_000,
    });
  }, [queryClient, repository, userId]);

  const data = query.data ?? EMPTY_DATA;
  const queryError = query.error instanceof Error ? query.error.message : null;

  return {
    demandas: data.demandas,
    historico: data.historico,
    loading: Boolean(userId) && query.isPending,
    refreshing: Boolean(userId) && query.isFetching && !query.isPending,
    error: mutationError ?? queryError,
    reload,
    loadTrash,
    create: (input: CreateDemandaInput) => executeMutation(() => createMutation.mutateAsync(input)),
    edit: (id: number, input: EditDemandaInput) =>
      executeMutation(() => editMutation.mutateAsync({ id, input })),
    registerProgress: (id: number, input: ProgressInput) =>
      executeMutation(() => progressMutation.mutateAsync({ id, input })),
    transitionStatus: (id: number, input: StatusTransitionInput) =>
      executeMutation(() => statusMutation.mutateAsync({ id, input })),
    deleteLogically: (id: number, input: DeleteDemandaInput) =>
      executeMutation(() => deleteMutation.mutateAsync({ id, input })),
  };
}
