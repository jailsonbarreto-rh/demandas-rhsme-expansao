import type { ComentarioHistorico, Demanda } from '../types';
import { isInFollowUp, needsCtrhAction } from '../domain/workSemantics';
import { classifyDateSignal } from '../domain/temporalSignals';
import { matchDemandSearch } from '../search/demandSearch';
import { matchesPeriod } from '../search/periodFilter';
import { getTodayString } from '../utils/date';
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

function matchesTemporalQuickFilters(
  demanda: FilterableDemanda,
  filters: QuickFilters,
  today: string,
): boolean {
  if (filters.assinatura && demanda.status === 'Para Assinatura') return true;
  if (!isInFollowUp(demanda)) return false;

  const finalSignal = classifyDateSignal(demanda.limite2, today).kind;
  if (filters.hoje && finalSignal === 'today') return true;
  if (filters.vencido && finalSignal === 'overdue') return true;

  const internalSignal = classifyDateSignal(demanda.limite1, today).kind;
  if (filters.internoHoje && internalSignal === 'today') return true;
  if (filters.internoVencido && internalSignal === 'overdue') return true;

  const followUpSignal = classifyDateSignal(demanda.proximaAcaoEm, today).kind;
  if (filters.providenciaHoje && followUpSignal === 'today') return true;
  if (filters.providenciaVencida && followUpSignal === 'overdue') return true;

  return false;
}

export function applyDemandBaseFilters(
  demandas: FilterableDemanda[],
  filters: DemandFilters,
  context: ApplyDemandFiltersContext,
): FilterableDemanda[] {
  const quickFilters = context.quickFilters ?? DEFAULT_QUICK_FILTERS;
  const today = context.today ?? getTodayString();
  const hasQuickFilter = Object.values(quickFilters).some(Boolean);

  return demandas.filter((demanda) => {
    if (hasQuickFilter && !matchesTemporalQuickFilters(demanda, quickFilters, today)) return false;

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
