import { getTodayString, isBeforeToday, isValidDateString } from '../utils/date';
import { FormError } from './ui/FormError';

interface PastFollowUpJustificationProps {
  id: string;
  date: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  today?: string;
}

export function PastFollowUpJustification({
  id,
  date,
  value,
  onChange,
  error,
  today = getTodayString(),
}: PastFollowUpJustificationProps) {
  const past = isValidDateString(date) && isBeforeToday(date, today);
  if (!past) return null;

  return (
    <div className="past-follow-up-justification col-full">
      <div className="past-follow-up-alert" role="status">
        <i className="fa-solid fa-triangle-exclamation" aria-hidden="true" />
        <span>A data informada já está vencida. O salvamento é permitido mediante justificativa.</span>
      </div>
      <label htmlFor={id} className="input-label-externa">Justificativa da data vencida</label>
      <textarea
        id={id}
        className={`form-control status-comment ${error ? 'field-invalid' : ''}`.trim()}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Explique por que a próxima providência foi registrada com uma data anterior à atual..."
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      <FormError id={`${id}-error`} message={error} />
    </div>
  );
}
