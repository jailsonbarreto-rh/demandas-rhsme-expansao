import { describe, expect, it } from 'vitest';
import {
  requiresDeadlineChangeJustification,
  validateDeadlinePair,
  type DeadlineSnapshot,
} from './deadlineRules';

const missing: DeadlineSnapshot = { state: 'nao_informado', date: '' };
const internalDate: DeadlineSnapshot = { state: 'definido', date: '10/08/2026' };
const laterInternalDate: DeadlineSnapshot = { state: 'definido', date: '12/08/2026' };
const finalDate: DeadlineSnapshot = { state: 'definido', date: '20/08/2026' };
const notApplicable: DeadlineSnapshot = { state: 'nao_se_aplica', date: '' };

describe('requiresDeadlineChangeJustification', () => {
  it('não exige justificativa no primeiro preenchimento de prazo legado ausente', () => {
    expect(requiresDeadlineChangeJustification(missing, internalDate)).toBe(false);
  });

  it('exige justificativa quando uma data já registrada é alterada', () => {
    expect(requiresDeadlineChangeJustification(internalDate, laterInternalDate)).toBe(true);
  });

  it('exige justificativa ao trocar data registrada por não se aplica', () => {
    expect(requiresDeadlineChangeJustification(finalDate, notApplicable)).toBe(true);
  });

  it('exige justificativa ao trocar não se aplica por data', () => {
    expect(requiresDeadlineChangeJustification(notApplicable, finalDate)).toBe(true);
  });

  it('não exige justificativa quando o valor não foi alterado', () => {
    expect(requiresDeadlineChangeJustification(finalDate, finalDate)).toBe(false);
  });
});

describe('validateDeadlinePair', () => {
  it('aceita prazo interno anterior ao prazo final', () => {
    expect(validateDeadlinePair(internalDate, finalDate)).toBeNull();
  });

  it('aceita prazo final marcado como não se aplica', () => {
    expect(validateDeadlinePair(internalDate, notApplicable)).toBeNull();
  });

  it('rejeita prazo interno posterior ao prazo final', () => {
    expect(validateDeadlinePair(
      { state: 'definido', date: '21/08/2026' },
      finalDate,
    )).toBe('O prazo interno não pode ser posterior ao prazo final.');
  });

  it('não transforma ausência legada em erro de ordem', () => {
    expect(validateDeadlinePair(missing, finalDate)).toBeNull();
  });
});
