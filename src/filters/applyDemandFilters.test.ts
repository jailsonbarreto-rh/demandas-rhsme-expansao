import { describe, expect, it } from 'vitest';
import type { ComentarioHistorico, Demanda, DemandStatus } from '../types';
import { matchDemandSearch } from '../search/demandSearch';
import { applyDemandFilters } from './applyDemandFilters';
import { DEFAULT_DEMAND_FILTERS, type DemandFilters } from './filterTypes';

type FilterableDemanda = Demanda & {
  responsavelId?: string | null;
  proximaAcaoEm?: string;
};

const statuses: DemandStatus[] = [
  'Aguardando Andamento',
  'Tramitado',
  'Para Assinatura',
  'Encerrado',
  'Sobrestado',
  'Ajustar',
];

const demandas: FilterableDemanda[] = statuses.map((status, index) => ({
  id: index + 1,
  numero: `DEMO-${index + 1}`,
  tipo: index % 2 === 0 ? 'Processo' : 'Expediente',
  assunto: index === 1 ? 'Consulta a setor externo' : `Assunto ${index + 1}`,
  responsavel: index === 0 ? 'Usuário Demonstração A' : '',
  responsavelId: index === 0 ? 'user-a' : null,
  limite1: index === 0 ? '10/07/2026' : '',
  limite2: index === 0 ? '20/07/2026' : index === 3 ? '01/07/2026' : '',
  proximaAcaoEm: index === 0 ? '25/07/2026' : '',
  status,
  setor: index < 3 ? 'CTRH' : 'Externo',
  classificacao: index === 0 ? 'Cessão' : 'Outros',
}));

const historico: ComentarioHistorico[] = [{
  id: 1,
  demandaId: 2,
  data_hora: '15/07/2026 09:00:00',
  status_novo: 'Tramitado',
  setor: 'CTRH',
  comentario: 'Cobrança de retorno registrada',
}];

function filters(patch: Partial<DemandFilters>): DemandFilters {
  return { ...DEFAULT_DEMAND_FILTERS, ...patch };
}

describe('applyDemandFilters', () => {
  it('aplica acompanhamento e providência CTRH pela semântica central', () => {
    expect(applyDemandFilters(demandas, filters({ status: 'acompanhamento' }), { historico }))
      .toHaveLength(5);
    expect(applyDemandFilters(demandas, filters({ status: 'providencia_ctrh' }), { historico })
      .map((demanda) => demanda.status))
      .toEqual(['Aguardando Andamento', 'Para Assinatura', 'Ajustar']);
  });

  it('preserva o recorte exato da busca atual entre campos e histórico', () => {
    const query = 'externo cobrança';
    const expected = demandas.filter((demanda) => matchDemandSearch(demanda, historico, query).matches);

    expect(applyDemandFilters(demandas, filters({ query, status: 'todos' }), { historico }))
      .toEqual(expected);
  });

  it('combina tipo, classificação, setor e período sem alterar as regras existentes', () => {
    expect(applyDemandFilters(demandas, filters({
      status: 'todos',
      type: 'Processo',
      classification: 'Cessão',
      sector: 'CTRH',
      periodField: 'limite2',
      periodStart: '2026-07-20',
      periodEnd: '2026-07-20',
    }), { historico })).toEqual([demandas[0]]);
  });

  it('usa exclusivamente UUID no escopo pessoal, sem aproximar pelo nome', () => {
    const sameNameWithoutId: FilterableDemanda = {
      ...demandas[1],
      id: 20,
      responsavel: 'Usuário Demonstração A',
      responsavelId: null,
    };

    expect(applyDemandFilters(
      [...demandas, sameNameWithoutId],
      filters({ status: 'todos', scope: 'meu' }),
      { historico, currentUserId: 'user-a' },
    )).toEqual([demandas[0]]);
  });

  it('não classifica demanda encerrada como vencida em filtro rápido', () => {
    expect(applyDemandFilters(demandas, filters({ status: 'todos' }), {
      historico,
      today: '22/07/2026',
      quickFilters: { assinatura: false, hoje: false, vencido: true },
    })).toEqual([demandas[0]]);
  });
});
