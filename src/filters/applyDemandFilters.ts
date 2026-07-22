import type { ComentarioHistorico, Demanda } from '../types';
import { isInFollowUp, needsCtrhAction } from '../domain/workSemantics';
import { matchDemandSearch } from '../search/demandSearch';
import { matchesPeriod } from '../search/periodFilter';
import { getTodayString, isBeforeToday } from '../utils/date';
import { DEFAULT_QUICK_FILTERS, type DemandFilters, type QuickFilters } from './filterTypes';

type FilterableDemanda = Demanda & {
  responsavelId?: string | null;
  proximaAcaoEm?: string;
};

export interface ApplyDemandFiltersContext {
  historico: ComentarioHistorico[];
  quickFilters?: QuickFilters;
  today?: string;
  currentUserId?: string | null;
}

function matchesStatus(demanda: Demanda, status: DemandFilters['status']): boolean {
  if (status === 'todos') return true;
  if (status === 'acompanhamento') return isInFollowUp(demanda);
  if (status === 'providencia_ctrh') return needsCtrhAction(demanda);
  return demanda.status === status;
}

function matchesFuturePeriod(demanda: FilterableDemanda, filters: DemandFilters): boolean {
  if (!filters.periodStart && !filters.periodEnd) return true;
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(demanda.proximaAcaoEm ?? '');
  if (!match) return false;
  const value = `${match[3]}-${match[2]}-${match[1]}`;
  if (filters.periodStart && value < filters.periodStart) return false;
  if (filters.periodEnd && value > filters.periodEnd) return false;
  return true;
}

function matchesResponsible(
  demanda: FilterableDemanda,
  filters: DemandFilters,
  currentUserId?: string | null,
): boolean {
  if (filters.scope === 'meu' && (!currentUserId || demanda.responsavelId !== currentUserId)) {
    return false;
  }
  if (filters.responsibleId === 'todos') return true;
  if (filters.responsibleId === 'sem_responsavel') {
    return !demanda.responsavelId && !demanda.responsavel.trim();
  }
  return demanda.responsavelId === filters.responsibleId;
}

export function applyDemandBaseFilters(
  demandas: FilterableDemanda[],
  filters: DemandFilters,
  context: ApplyDemandFiltersContext,
): FilterableDemanda[] {
  const quickFilters = context.quickFilters ?? DEFAULT_QUICK_FILTERS;
  const today = context.today ?? getTodayString();
  const hasQuickFilter = quickFilters.assinatura || quickFilters.hoje || quickFilters.vencido;

  return demandas.filter((demanda) => {
    if (hasQuickFilter) {
      const matchesQuickFilter = (
        (quickFilters.assinatura && demanda.status === 'Para Assinatura')
        || (quickFilters.hoje && isInFollowUp(demanda) && demanda.limite2 === today)
        || (
          quickFilters.vencido
          && isInFollowUp(demanda)
          && Boolean(demanda.limite2)
          && isBeforeToday(demanda.limite2)
        )
      );
      if (!matchesQuickFilter) return false;
    }

    const matchesSelectedPeriod = filters.periodField === 'proxima_acao'
      ? matchesFuturePeriod(demanda, filters)
      : matchesPeriod(demanda, context.historico, {
        field: filters.periodField,
        start: filters.periodStart,
        end: filters.periodEnd,
      });
    if (!matchesSelectedPeriod) return false;
    if (filters.type !== 'Todos' && demanda.tipo !== filters.type) return false;
    if (filters.classification !== 'Todas' && demanda.classificacao !== filters.classification) return false;
    if (!matchesStatus(demanda, filters.status)) return false;
    if (filters.sector !== 'Todos' && demanda.setor !== filters.sector) return false;
    return matchesResponsible(demanda, filters, context.currentUserId);
  });
}

export function applyDemandFilters(
  demandas: FilterableDemanda[],
  filters: DemandFilters,
  context: ApplyDemandFiltersContext,
): FilterableDemanda[] {
  return applyDemandBaseFilters(demandas, filters, context)
    .filter((demanda) => matchDemandSearch(demanda, context.historico, filters.query).matches);
}
