import type { DeadlineState } from '../types';
import { classifyDateSignal, getTemporalSignalPresentation } from '../domain/temporalSignals';
import { getTodayString } from '../utils/date';

interface DeadlineDisplayProps {
  date: string;
  state?: DeadlineState;
  closed?: boolean;
  compact?: boolean;
  today?: string;
  missingLabel?: string;
}

function formatDate(value: string): string {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  if (!match) return '—';
  return `${match[1]}/${match[2]}/${match[3]}`;
}

export function DeadlineDisplay({
  date,
  state = date ? 'definido' : 'nao_informado',
  closed = false,
  compact = false,
  today = getTodayString(),
  missingLabel = 'Não informada',
}: DeadlineDisplayProps) {
  if (closed) {
    return <span className="temporal-state status-not-required">Não exigida</span>;
  }
  if (state === 'nao_se_aplica') {
    return <span className="temporal-state status-not-applicable">Não se aplica</span>;
  }
  if (state !== 'definido' || !date) {
    return <span className="temporal-state status-missing">{missingLabel}</span>;
  }

  const signal = classifyDateSignal(date, today);
  const presentation = getTemporalSignalPresentation(signal);
  return (
    <span className={`deadline-display ${compact ? 'compact' : ''}`}>
      <span className="deadline-display-date">{formatDate(date)}</span>
      <span className={`temporal-state ${presentation.className}`}>{presentation.label}</span>
    </span>
  );
}
