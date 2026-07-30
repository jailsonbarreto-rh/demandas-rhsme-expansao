import {
  classifyDateSignal,
  getTemporalSignalPresentation,
  parseBrazilianDateOnly,
} from '../domain/temporalSignals';

export const OPERATIONAL_TIME_ZONE = 'America/Sao_Paulo';

export const getTodayString = (now = new Date()): string => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: OPERATIONAL_TIME_ZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).formatToParts(now);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.day}/${values.month}/${values.year}`;
};

export const isBeforeToday = (dateStr: string, today = getTodayString()): boolean => {
  const date = parseBrazilianDateOnly(dateStr);
  const todayDate = parseBrazilianDateOnly(today);
  return date !== null && todayDate !== null && date < todayDate;
};

export interface PrazoSemantics {
  data: string;
  label: string | null;
  classe: string;
}

function formatDate(value: string): string {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  if (!match) return '—';
  const meses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  return `${match[1]} ${meses[Number(match[2]) - 1]} ${match[3]}`;
}

export const getPrazoFinalSemantics = (
  dateStr: string | undefined,
  today = getTodayString(),
): PrazoSemantics => {
  if (!dateStr || parseBrazilianDateOnly(dateStr) === null) {
    return { data: '—', label: null, classe: '' };
  }

  const signal = classifyDateSignal(dateStr, today);
  const presentation = getTemporalSignalPresentation(signal);
  const label = signal.kind === 'future' ? 'No prazo' : presentation.label;

  return {
    data: formatDate(dateStr),
    label,
    classe: presentation.className,
  };
};

export const isValidDateString = (value: string): boolean => (
  parseBrazilianDateOnly(value.trim()) !== null
);
