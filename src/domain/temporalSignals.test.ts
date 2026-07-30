import { describe, expect, it } from 'vitest';
import { classifyDateSignal, getTemporalSignalPresentation } from './temporalSignals';

describe('classifyDateSignal', () => {
  const today = '29/07/2026';

  it('classifica data passada como vencida', () => {
    expect(classifyDateSignal('28/07/2026', today)).toEqual({ kind: 'overdue', days: 1 });
  });

  it('classifica a data de hoje', () => {
    expect(classifyDateSignal('29/07/2026', today)).toEqual({ kind: 'today', days: 0 });
  });

  it('usa faixa única de próximos sete dias corridos', () => {
    expect(classifyDateSignal('05/08/2026', today)).toEqual({ kind: 'next_7_days', days: 7 });
  });

  it('classifica o oitavo dia como futuro', () => {
    expect(classifyDateSignal('06/08/2026', today)).toEqual({ kind: 'future', days: 8 });
  });

  it('mantém data ausente como informação faltante, sem atraso', () => {
    expect(classifyDateSignal('', today)).toEqual({ kind: 'missing', days: null });
  });
});

describe('getTemporalSignalPresentation', () => {
  it('apresenta estados em linguagem administrativa simples', () => {
    expect(getTemporalSignalPresentation({ kind: 'overdue', days: 2 }).label).toBe('Vencida há 2 dias');
    expect(getTemporalSignalPresentation({ kind: 'today', days: 0 }).label).toBe('Hoje');
    expect(getTemporalSignalPresentation({ kind: 'next_7_days', days: 3 }).label).toBe('Em 3 dias');
    expect(getTemporalSignalPresentation({ kind: 'future', days: 20 }).label).toBe('Futura');
    expect(getTemporalSignalPresentation({ kind: 'missing', days: null }).label).toBe('Não informada');
  });
});
