import type { DeadlineState } from '../types';
import { parseBrazilianDateOnly } from './temporalSignals';

export interface DeadlineSnapshot {
  state: DeadlineState;
  date: string;
}

function normalizeDate(value: string): string {
  return value.trim();
}

function deadlineEquals(before: DeadlineSnapshot, after: DeadlineSnapshot): boolean {
  return before.state === after.state && normalizeDate(before.date) === normalizeDate(after.date);
}

export function requiresDeadlineChangeJustification(
  before: DeadlineSnapshot,
  after: DeadlineSnapshot,
): boolean {
  if (deadlineEquals(before, after)) return false;
  return before.state !== 'nao_informado';
}

export function isLegacyDeadlineCompletion(
  before: DeadlineSnapshot,
  after: DeadlineSnapshot,
): boolean {
  return before.state === 'nao_informado' && after.state !== 'nao_informado';
}

export function validateDeadlinePair(
  internal: DeadlineSnapshot,
  final: DeadlineSnapshot,
): string | null {
  if (internal.state !== 'definido' || final.state !== 'definido') return null;

  const internalDate = parseBrazilianDateOnly(internal.date);
  const finalDate = parseBrazilianDateOnly(final.date);
  if (internalDate === null || finalDate === null) return null;

  return internalDate > finalDate
    ? 'O prazo interno não pode ser posterior ao prazo final.'
    : null;
}

export function canPreserveMissingDeadline(
  original: DeadlineSnapshot,
  current: DeadlineSnapshot,
): boolean {
  return original.state === 'nao_informado' && current.state === 'nao_informado';
}

export function canUseDeadlineStateAfterRegistration(
  kind: 'internal' | 'final',
  original: DeadlineSnapshot,
  current: DeadlineSnapshot,
): boolean {
  if (current.state !== 'nao_informado') {
    return kind === 'final' || current.state === 'definido';
  }
  return canPreserveMissingDeadline(original, current);
}
