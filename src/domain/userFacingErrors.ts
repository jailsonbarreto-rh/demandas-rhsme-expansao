const AUTH_ERROR_MESSAGES: Array<[RegExp, string]> = [
  [/invalid login credentials/i, 'E-mail ou senha incorretos.'],
  [/email not confirmed/i, 'Confirme seu e-mail antes de entrar.'],
  [/user already registered/i, 'Este e-mail já possui cadastro ou solicitação de acesso.'],
  [/password should be at least/i, 'A senha não atende aos requisitos mínimos.'],
];

const TECHNICAL_ERROR_PATTERNS = [
  /\bPGRST\d+\b/i,
  /\bSQLSTATE\b/i,
  /\b(?:23|28|42|53|57)\d{3}\b/,
  /schema cache/i,
  /permission denied/i,
  /row-level security|\bRLS\b/i,
  /violates .* constraint/i,
  /duplicate key value/i,
  /relation ["']?[a-z0-9_.]+/i,
  /function ["']?[a-z0-9_.]+/i,
  /column ["']?[a-z0-9_.]+/i,
  /public\.[a-z0-9_]+/i,
  /sme_[a-z0-9_]+/i,
  /supabase/i,
  /postgres/i,
  /postgrest/i,
  /stack trace/i,
  /at [a-z0-9_.]+\s*\(/i,
  /https?:\/\//i,
];

function extractMessage(reason: unknown): string {
  if (reason instanceof Error) return reason.message.trim();
  if (typeof reason === 'string') return reason.trim();
  return '';
}

export function getUserFacingError(reason: unknown, fallback: string): string {
  const message = extractMessage(reason);
  if (!message) return fallback;

  const authTranslation = AUTH_ERROR_MESSAGES.find(([pattern]) => pattern.test(message));
  if (authTranslation) return authTranslation[1];

  if (TECHNICAL_ERROR_PATTERNS.some((pattern) => pattern.test(message))) return fallback;
  if (message.length > 240 || /[{}[\]<>]/.test(message)) return fallback;

  return message;
}
