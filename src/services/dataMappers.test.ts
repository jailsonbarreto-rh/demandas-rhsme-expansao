import { describe, expect, it } from 'vitest';
import {
  fromDatabaseDate,
  toDatabaseDate,
  toDemanda,
  toHistorico,
} from './dataMappers';

describe('adaptadores de dados', () => {
  it.each([
    ['30/06/2026', '2026-06-30'],
    ['', null],
    ['dd/mm/aaaa', null],
  ])('converte %s para data do banco', (input, expected) => {
    expect(toDatabaseDate(input)).toBe(expected);
  });

  it.each([
    '12/07',
    '31/02/2026',
    '00/01/2026',
    '15/13/2026',
    'texto',
  ])('rejeita data inválida %s', (input) => {
    expect(() => toDatabaseDate(input)).toThrow('Data inválida');
  });

  it.each([
    ['2026-06-30', '30/06/2026'],
    ['2026-06-30T12:00:00Z', '30/06/2026'],
    [null, ''],
  ])('converte %s para data da interface', (input, expected) => {
    expect(fromDatabaseDate(input)).toBe(expected);
  });

  it('mapeia uma demanda do banco para o formato atual da interface', () => {
    expect(toDemanda({
      id: 7,
      numero: 'SME-PRO-2026/00007',
      tipo: 'Processo',
      assunto: 'Atualização cadastral',
      responsavel: null,
      limite1: '2026-06-30',
      limite2: null,
      status: 'Aguardando Andamento',
      setor: null,
      classificacao: null,
    })).toEqual({
      id: 7,
      numero: 'SME-PRO-2026/00007',
      tipo: 'Processo',
      assunto: 'Atualização cadastral',
      responsavel: '',
      limite1: '30/06/2026',
      limite2: '',
      status: 'Aguardando Andamento',
      setor: '',
      classificacao: '',
    });
  });

  it('mapeia snake_case do histórico sem vazar para a interface', () => {
    expect(toHistorico({
      id: 9,
      demanda_id: 3,
      status_novo: 'Tramitado',
      setor: 'CTRH',
      comentario: 'Atualizado',
      created_at: '2026-07-12T12:00:00Z',
    })).toEqual({
      id: 9,
      demandaId: 3,
      data_hora: new Date('2026-07-12T12:00:00Z').toLocaleString('pt-BR'),
      status_novo: 'Tramitado',
      setor: 'CTRH',
      comentario: 'Atualizado',
    });
  });
});
