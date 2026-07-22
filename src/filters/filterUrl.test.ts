import { describe, expect, it } from 'vitest';
import {
  DEFAULT_DEMAND_FILTERS,
  type DemandFilters,
} from './filterTypes';
import { parseDemandFilters, serializeDemandFilters } from './filterUrl';

describe('adaptador de filtros na URL', () => {
  it('migra o status legado Somente ativos para acompanhamento', () => {
    const filters = parseDemandFilters(new URLSearchParams({
      status: 'Somente ativos (padrão)',
    }));

    expect(filters.status).toBe('acompanhamento');
  });

  it('migra o status legado Todos para o valor tipado', () => {
    const filters = parseDemandFilters(new URLSearchParams({
      status: 'Todos (exibir tudo)',
    }));

    expect(filters.status).toBe('todos');
  });

  it('ignora parâmetros e valores desconhecidos', () => {
    const filters = parseDemandFilters(new URLSearchParams(
      'status=executar_codigo&tipo=TipoInventado&periodoCampo=drop_table&comando=alert(1)',
    ));

    expect(filters).toEqual(DEFAULT_DEMAND_FILTERS);
    expect(serializeDemandFilters(filters).has('comando')).toBe(false);
  });

  it('preserva todos os filtros conhecidos no round-trip', () => {
    const filters: DemandFilters = {
      query: 'cessão temporária',
      type: 'Processo',
      classification: 'Cessão',
      status: 'providencia_ctrh',
      sector: 'CTRH',
      responsibleId: '11111111-1111-4111-8111-111111111111',
      scope: 'meu',
      periodField: 'proxima_acao',
      periodStart: '2026-07-01',
      periodEnd: '2026-07-31',
      alert: 'prazo_final_vencido',
    };

    expect(parseDemandFilters(serializeDemandFilters(filters))).toEqual(filters);
  });

  it('não serializa os valores padrão na URL', () => {
    expect(serializeDemandFilters(DEFAULT_DEMAND_FILTERS).toString()).toBe('');
  });
});
