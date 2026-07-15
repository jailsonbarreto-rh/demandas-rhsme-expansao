import React from 'react';

interface DateMaskInputProps {
  id: string;
  value: string;
  onChange: (val: string) => void;
  onBlur?: () => void;
  label?: string;
  error?: string;
}

export const DateMaskInput: React.FC<DateMaskInputProps> = ({ id, value, onChange, onBlur, label, error }) => {
  const formatProgressive = (raw: string): string => {
    const digits = raw.replace(/\D/g, '').substring(0, 8);
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return `${digits.substring(0, 2)}/${digits.substring(2)}`;
    return `${digits.substring(0, 2)}/${digits.substring(2, 4)}/${digits.substring(4)}`;
  };

  return (
    <div className="date-field-wrapper">
      {label && <label htmlFor={id} className="input-label-externa">{label}</label>}
      <input
        type="text"
        id={id}
        className={`form-control ${error ? 'field-invalid' : ''}`.trim()}
        value={value}
        onChange={(event) => onChange(formatProgressive(event.target.value))}
        onBlur={onBlur}
        placeholder="dd/mm/aaaa"
        inputMode="numeric"
        maxLength={10}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      {error && <p id={`${id}-error`} className="form-field-error" role="alert">{error}</p>}
    </div>
  );
};
