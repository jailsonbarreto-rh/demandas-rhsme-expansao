const DAY_IN_MS = 86_400_000;

type TemporalSignalKind = 'overdue' | 'today' | 'next_7_days' | 'future' | 'missing';

export interface TemporalSignal {
  kind: TemporalSignalKind;
  days: number | null;
}

export interface TemporalSignalPresentation {
  label: string;
  className: string;
}

export function parseBrazilianDateOnly(value: string | null | undefined): number | null {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value?.trim() ?? '');
  if (!match) return null;

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year
    || date.getUTCMonth() !== month - 1
    || date.getUTCDate() !== day
  ) return null;

  return date.getTime();
}

export function classifyDateSignal(
  value: string | null | undefined,
  today: string,
): TemporalSignal {
  const targetTime = parseBrazilianDateOnly(value);
  const todayTime = parseBrazilianDateOnly(today);
  if (targetTime === null || todayTime === null) return { kind: 'missing', days: null };

  const difference = Math.round((targetTime - todayTime) / DAY_IN_MS);
  if (difference < 0) return { kind: 'overdue', days: Math.abs(difference) };
  if (difference === 0) return { kind: 'today', days: 0 };
  if (difference <= 7) return { kind: 'next_7_days', days: difference };
  return { kind: 'future', days: difference };
}

export function getTemporalSignalPresentation(
  signal: TemporalSignal,
): TemporalSignalPresentation {
  switch (signal.kind) {
    case 'overdue': {
      const days = signal.days ?? 0;
      return {
        label: `Vencida há ${days} ${days === 1 ? 'dia' : 'dias'}`,
        className: 'status-overdue',
      };
    }
    case 'today':
      return { label: 'Hoje', className: 'status-today' };
    case 'next_7_days': {
      const days = signal.days ?? 0;
      return {
        label: `Em ${days} ${days === 1 ? 'dia' : 'dias'}`,
        className: 'status-next-7-days',
      };
    }
    case 'future':
      return { label: 'Futura', className: 'status-future' };
    case 'missing':
      return { label: 'Não informada', className: 'status-missing' };
  }
}
