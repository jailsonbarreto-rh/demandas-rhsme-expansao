import { useCallback, useEffect, useState } from 'react';
import type {
  AppUser,
  ComentarioHistorico,
  CreateDemandaInput,
  DeleteDemandaInput,
  Demanda,
  EditDemandaInput,
  LegacyCreateDemandaInput,
  ProgressInput,
  RestoreDemandaInput,
  StatusTransitionInput,
} from '../types';
import type { DemandasRepository } from '../services/contracts';

export function useDemandasData(
  repository: DemandasRepository,
  user: AppUser | null,
  enableRealtime: boolean,
) {
  const [demandas, setDemandas] = useState<Demanda[]>([]);
  const [historico, setHistorico] = useState<ComentarioHistorico[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await repository.load();
      setDemandas(data.demandas);
      setHistorico(data.historico);
      setError(null);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Não foi possível carregar as demandas.');
      throw reason;
    } finally {
      setLoading(false);
    }
  }, [repository, user]);

  useEffect(() => {
    if (!user) {
      setDemandas([]);
      setHistorico([]);
      setError(null);
      return;
    }
    let active = true;
    const load = async () => {
      try {
        const data = await repository.load();
        if (active) {
          setDemandas(data.demandas);
          setHistorico(data.historico);
          setError(null);
        }
      } catch (reason) {
        if (active) setError(reason instanceof Error ? reason.message : 'Não foi possível carregar as demandas.');
      } finally {
        if (active) setLoading(false);
      }
    };
    setLoading(true);
    void load();
    const cleanup = enableRealtime ? repository.subscribe(() => { void load(); }) : () => undefined;
    return () => { active = false; cleanup(); };
  }, [enableRealtime, repository, user]);

  const mutate = useCallback(async (operation: () => Promise<void>) => {
    setError(null);
    try {
      await operation();
      await reload();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Não foi possível salvar a alteração.');
      throw reason;
    }
  }, [reload]);

  return {
    demandas,
    historico,
    loading,
    error,
    reload,
    loadTrash: () => repository.loadTrash(),
    create: (input: CreateDemandaInput | LegacyCreateDemandaInput) =>
      mutate(() => repository.create(input)),
    edit: (id: number, input: EditDemandaInput) => mutate(() => repository.edit(id, input)),
    registerProgress: (id: number, input: ProgressInput) =>
      mutate(() => repository.registerProgress(id, input)),
    transitionStatus: (id: number, input: StatusTransitionInput) =>
      mutate(() => repository.transitionStatus(id, input)),
    deleteLogically: (id: number, input: DeleteDemandaInput) =>
      mutate(() => repository.deleteLogically(id, input)),
    restore: (id: number, input: RestoreDemandaInput) =>
      mutate(() => repository.restore(id, input)),

    // Adaptadores temporários para chamadas ainda não migradas nas telas.
    update: (id: number, changes: Partial<Demanda>) => mutate(() => repository.update(id, changes)),
    updateStatus: (id: number, status: Demanda['status'], comentario: string) =>
      mutate(() => repository.updateStatus(id, status, comentario)),
    delete: (id: number) => mutate(() => repository.delete(id)),
  };
}
