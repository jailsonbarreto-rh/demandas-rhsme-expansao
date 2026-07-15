interface FormErrorProps {
  id?: string;
  message?: string;
}

export function FormError({ id, message }: FormErrorProps) {
  if (!message) return null;
  return <p id={id} className="form-field-error" role="alert">{message}</p>;
}
