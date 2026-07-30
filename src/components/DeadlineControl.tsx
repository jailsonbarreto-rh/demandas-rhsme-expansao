import type { DeadlineState } from '../types';
import { DateMaskInput } from './DateMaskInput';

interface DeadlineControlProps {
  idPrefix: string;
  label: string;
  state: DeadlineState;
  date: string;
  allowedStates: DeadlineState[];
  onStateChange: (state: DeadlineState) => void;
  onDateChange: (date: string) => void;
  onDateBlur?: () => void;
  stateError?: string;
  dateError?: string;
}

const STATE_LABELS: Record<DeadlineState, string> = {
  definido: 'Data definida',
  nao_informado: 'Não informado',
  nao_se_aplica: 'Não se aplica',
};

export function DeadlineControl({
  idPrefix,
  label,
  state,
  date,
  allowedStates,
  onStateChange,
  onDateChange,
  onDateBlur,
  stateError,
  dateError,
}: DeadlineControlProps) {
  const handleStateChange = (nextState: DeadlineState) => {
    onStateChange(nextState);
    if (nextState !== 'definido') onDateChange('');
  };

  return (
    <fieldset className="deadline-control col-full">
      <legend>{label}</legend>
      {allowedStates.length > 1 && (
        <div className="deadline-state-options" role="radiogroup" aria-label={`Situação de ${label}`}>
          {allowedStates.map((option) => (
            <label key={option} className={`deadline-state-option ${state === option ? 'selected' : ''}`}>
              <input
                type="radio"
                name={`${idPrefix}-state`}
                value={option}
                checked={state === option}
                onChange={() => handleStateChange(option)}
              />
              <span>{STATE_LABELS[option]}</span>
            </label>
          ))}
        </div>
      )}
      {stateError && <p className="form-error" role="alert">{stateError}</p>}
      {state === 'definido' && (
        <DateMaskInput
          id={`${idPrefix}-date`}
          label={`Data de ${label.toLocaleLowerCase('pt-BR')}`}
          value={date}
          onChange={onDateChange}
          onBlur={onDateBlur}
          error={dateError}
        />
      )}
      {state === 'nao_informado' && (
        <p className="deadline-helper">Nenhuma data foi informada para este prazo.</p>
      )}
      {state === 'nao_se_aplica' && (
        <p className="deadline-helper">Este prazo não se aplica à demanda.</p>
      )}
    </fieldset>
  );
}
