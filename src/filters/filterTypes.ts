import type { Demanda, DemandStatus } from '../types';

export interface DemandFilters {
  query: string;
  type: 'Todos' | Demanda['tipo'];
  classification: string;
  status: 'acompanhamento' | 'providencia_ctrh' | 'todos' | DemandStatus;
  sector: string;
  responsibleId: string | 'todos' | 'sem_responsavel';
  scope: 'equipe' | 'meu';
  periodField: 'limite1' | 'limite2' | 'historico' | 'proxima_acao';
  periodStart: string;
  periodEnd: string;
  alert: string;
}

export interface QuickFilters {
  assinatura: boolean;
  hoje: boolean;
  vencido: boolean;
  internoHoje?: boolean;
  internoVencido?: boolean;
  providenciaHoje?: boolean;
  providenciaVencida?: boolean;
}

export const DEFAULT_DEMAND_FILTERS: DemandFilters = {
  query: '',
  type: 'Todos',
  classification: 'Todas',
  status: 'acompanhamento',
  sector: 'Todos',
  responsibleId: 'todos',
  scope: 'equipe',
  periodField: 'limite2',
  periodStart: '',
  periodEnd: '',
  alert: '',
};

export const DEFAULT_QUICK_FILTERS: Required<QuickFilters> = {
  assinatura: false,
  hoje: false,
  vencido: false,
  internoHoje: false,
  internoVencido: false,
  providenciaHoje: false,
  providenciaVencida: false,
};
