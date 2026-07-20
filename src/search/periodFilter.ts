import type { ComentarioHistorico, Demanda } from '../types';

export type PeriodField = 'limite1' | 'limite2' | 'historico';

export interface PeriodFilter {
  field: PeriodField;
  start: string;
  end: string;
}

function parseInputDate(value: string): number | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  return Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

function parseRecordDate(value: string): number | null {
  if (!value || value === 'dd/mm/aaaa') return null;

  const brazilian = /^(\d{2})\/(\d{2})\/(\d{4})/.exec(value.trim());
  if (brazilian) {
    return Date.UTC(Number(brazilian[3]), Number(brazilian[2]) - 1, Number(brazilian[1]));
  }

  const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(value.trim());
  if (iso) {
    return Date.UTC(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));
  }

  return null;
}

function isWithinRange(value: number, start: number | null, end: number | null) {
  if (start !== null && value < start) return false;
  if (end !== null && value > end) return false;
  return true;
}

export function getPeriodValidationError(filter: PeriodFilter): string | null {
  if (!filter.start || !filter.end) return null;
  const start = parseInputDate(filter.start);
  const end = parseInputDate(filter.end);
  if (start !== null && end !== null && start > end) {
    return 'A data inicial não pode ser posterior à data final.';
  }
  return null;
}

export function matchesPeriod(
  demanda: Demanda,
  historico: ComentarioHistorico[],
  filter: PeriodFilter,
): boolean {
  if (!filter.start && !filter.end) return true;
  if (getPeriodValidationError(filter)) return false;

  const start = filter.start ? parseInputDate(filter.start) : null;
  const end = filter.end ? parseInputDate(filter.end) : null;

  if (filter.field === 'historico') {
    return historico
      .filter((item) => item.demandaId === demanda.id)
      .some((item) => {
        const value = parseRecordDate(item.data_hora);
        return value !== null && isWithinRange(value, start, end);
      });
  }

  const value = parseRecordDate(demanda[filter.field]);
  return value !== null && isWithinRange(value, start, end);
}
