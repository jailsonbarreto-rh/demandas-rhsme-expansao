import { describe, expect, it } from 'vitest';
import type { ComentarioHistorico, Demanda } from '../types';
import { getPeriodValidationError, matchesPeriod } from './periodFilter';

const demanda: Demanda = {
  id: 42,
  numero: '2025/001',
  tipo: 'Processo',
  assunto: 'Teste',
  responsavel: 'Ricardo',
  limite1: '10/07/2026',
  limite2: '20/07/2026',
  status: 'Aguardando Andamento',
  setor: 'E/CTRH',
  classificacao: 'Outros',
};

const historico: ComentarioHistorico[] = [
  {
    id: 1,
    demandaId: 42,
    data_hora: '15/07/2026 10:30:00',
    status_novo: 'Ajustar',
    setor: 'E/CTRH',
    comentario: 'Movimentação de teste',
  },
];

describe('matchesPeriod', () => {
  it('aceita intervalo inclusivo para o prazo final', () => {
    expect(matchesPeriod(demanda, historico, {
      field: 'limite2',
      start: '2026-07-20',
      end: '2026-07-20',
    })).toBe(true);
  });

  it('aceita somente limite inicial', () => {
    expect(matchesPeriod(demanda, historico, {
      field: 'limite1',
      start: '2026-07-01',
      end: '',
    })).toBe(true);
  });

  it('aceita somente limite final', () => {
    expect(matchesPeriod(demanda, historico, {
      field: 'limite2',
      start: '',
      end: '2026-07-19',
    })).toBe(false);
  });

  it('filtra por qualquer movimentação histórica no período', () => {
    expect(matchesPeriod(demanda, historico, {
      field: 'historico',
      start: '2026-07-15',
      end: '2026-07-15',
    })).toBe(true);
  });

  it('retorna mensagem de validação para intervalo invertido', () => {
    expect(getPeriodValidationError({
      field: 'limite2',
      start: '2026-08-01',
      end: '2026-07-01',
    })).toBe('A data inicial não pode ser posterior à data final.');
  });
});
