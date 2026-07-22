import type { Demanda, DemandStatus } from '../types';
import { DEFAULT_DEMAND_FILTERS, type DemandFilters } from './filterTypes';

const DEMAND_TYPES: Demanda['tipo'][] = ['Expediente', 'Processo', 'Outros'];
const DEMAND_STATUSES: DemandStatus[] = [
  'Aguardando Andamento',
  'Tramitado',
  'Para Assinatura',
  'Encerrado',
  'Sobrestado',
  'Ajustar',
];
const PERIOD_FIELDS: DemandFilters['periodField'][] = [
  'limite1',
  'limite2',
  'historico',
  'proxima_acao',
];
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function readStatus(value: string | null): DemandFilters['status'] {
  if (!value || value === 'Somente ativos (padrão)') return 'acompanhamento';
  if (value === 'Todos (exibir tudo)') return 'todos';
  if (value === 'acompanhamento' || value === 'providencia_ctrh' || value === 'todos') {
    return value;
  }
  return DEMAND_STATUSES.includes(value as DemandStatus)
    ? value as DemandStatus
    : DEFAULT_DEMAND_FILTERS.status;
}

function readDate(value: string | null): string {
  return value && DATE_PATTERN.test(value) ? value : '';
}

export function parseDemandFilters(params: URLSearchParams): DemandFilters {
  const type = params.get('tipo');
  const periodField = params.get('periodoCampo');
  const scope = params.get('escopo');

  return {
    query: params.get('busca')?.trim() ?? '',
    type: DEMAND_TYPES.includes(type as Demanda['tipo']) ? type as Demanda['tipo'] : 'Todos',
    classification: params.get('classificacao')?.trim() || 'Todas',
    status: readStatus(params.get('status')),
    sector: params.get('setor')?.trim() || 'Todos',
    responsibleId: params.get('responsavelId')?.trim() || 'todos',
    scope: scope === 'meu' ? 'meu' : 'equipe',
    periodField: PERIOD_FIELDS.includes(periodField as DemandFilters['periodField'])
      ? periodField as DemandFilters['periodField']
      : 'limite2',
    periodStart: readDate(params.get('periodoInicio')),
    periodEnd: readDate(params.get('periodoFim')),
    alert: params.get('alerta')?.trim() ?? '',
  };
}

export function serializeDemandFilters(filters: DemandFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.query) params.set('busca', filters.query);
  if (filters.type !== 'Todos') params.set('tipo', filters.type);
  if (filters.classification !== 'Todas') params.set('classificacao', filters.classification);
  if (filters.status !== 'acompanhamento') params.set('status', filters.status);
  if (filters.sector !== 'Todos') params.set('setor', filters.sector);
  if (filters.responsibleId !== 'todos') params.set('responsavelId', filters.responsibleId);
  if (filters.scope !== 'equipe') params.set('escopo', filters.scope);
  if (filters.periodField !== 'limite2') params.set('periodoCampo', filters.periodField);
  if (filters.periodStart) params.set('periodoInicio', filters.periodStart);
  if (filters.periodEnd) params.set('periodoFim', filters.periodEnd);
  if (filters.alert) params.set('alerta', filters.alert);
  return params;
}
