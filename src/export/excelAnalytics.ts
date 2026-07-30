import type { Demanda } from '../types';
import { classifyDateSignal } from '../domain/temporalSignals';
import { isClosed, isInFollowUp } from '../domain/workSemantics';
import type { DemandFilters, QuickFilters } from '../filters/filterTypes';
import { getTodayString } from '../utils/date';

export interface ExcelExportFilters extends DemandFilters {
  quickFilters: QuickFilters;
}

export interface DistributionItem {
  label: string;
  count: number;
  percentage: number;
}

export interface DeadlineInfo {
  date: Date | null;
  daysUntil: number | null;
  situation: string;
  range: string;
}

export interface FollowUpInfo {
  date: Date | null;
  daysUntil: number | null;
  situation: 'Providência vencida' | 'Providência hoje' | 'Próximos 7 dias' | 'Futura' | 'Não informada' | 'Não exigida';
}

export interface ExcelAnalytics {
  kpis: {
    total: number;
    emAcompanhamento: number;
    encerrados: number;
    paraAssinatura: number;
    vencidos: number;
    vencendoHoje: number;
    providenciasVencidas: number;
    providenciasHoje: number;
  };
  byStatus: DistributionItem[];
  byType: DistributionItem[];
  bySector: DistributionItem[];
  byClassification: DistributionItem[];
  distribuicaoResponsaveis: DistributionItem[];
  deadlineSituation: DistributionItem[];
  deadlineRanges: DistributionItem[];
  followUpSituation: DistributionItem[];
}

const DANGEROUS_EXCEL_PREFIX = /^[=+\-@\t\r\n]/;
const DAY_IN_MS = 86_400_000;

const STATUS_ORDER: Demanda['status'][] = [
  'Aguardando Andamento',
  'Tramitado',
  'Para Assinatura',
  'Ajustar',
  'Sobrestado',
  'Encerrado',
];

const SITUATION_ORDER = [
  'Vencidas',
  'Vencendo hoje',
  'Próximos 7 dias',
  'No prazo',
  'Sem prazo definido',
  'Encerradas',
];

const RANGE_ORDER = [
  'Em atraso',
  'Hoje',
  '1 a 7 dias',
  '8 a 15 dias',
  '16 a 30 dias',
  'Mais de 30 dias',
  'Sem prazo',
  'Encerradas',
];

const FOLLOW_UP_ORDER: FollowUpInfo['situation'][] = [
  'Providência vencida',
  'Providência hoje',
  'Próximos 7 dias',
  'Futura',
  'Não informada',
  'Não exigida',
];

function atLocalMidnight(value: Date): Date {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate());
}

function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function percentage(count: number, total: number): number {
  return total === 0 ? 0 : round2((count / total) * 100);
}

function normalizeLabel(value: unknown, fallback: string): string {
  const normalized = String(value ?? '').trim();
  return normalized || fallback;
}

function countBy(
  demandas: Demanda[],
  selector: (demanda: Demanda) => string,
  order?: readonly string[],
  includeZeros = false,
): DistributionItem[] {
  const counts = new Map<string, number>();
  for (const demanda of demandas) {
    const label = selector(demanda);
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }

  if (order && includeZeros) {
    for (const label of order) {
      if (!counts.has(label)) counts.set(label, 0);
    }
  }

  const result = Array.from(counts, ([label, count]) => ({
    label,
    count,
    percentage: percentage(count, demandas.length),
  }));

  if (order) {
    const position = new Map(order.map((label, index) => [label, index]));
    return result.sort((a, b) => {
      const aPosition = position.get(a.label) ?? Number.MAX_SAFE_INTEGER;
      const bPosition = position.get(b.label) ?? Number.MAX_SAFE_INTEGER;
      return aPosition - bPosition || a.label.localeCompare(b.label, 'pt-BR');
    });
  }

  return result.sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, 'pt-BR'));
}

export function sanitizeExcelText(value: unknown): string {
  const text = String(value ?? '').trim();
  return DANGEROUS_EXCEL_PREFIX.test(text) ? `'${text}` : text;
}

export function parseBrazilianDate(value: string | null | undefined): Date | null {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value?.trim() ?? '');
  if (!match) return null;

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
  return date;
}

export function getDeadlineStateLabel(
  state: Demanda['limite1Situacao'],
  date: string,
): string {
  if (state === 'nao_se_aplica') return 'Não se aplica';
  if (state === 'nao_informado') return 'Não informado';
  return parseBrazilianDate(date) ? 'Definido' : 'Inconsistente';
}

export function getDeadlineInfo(demanda: Demanda, now = new Date()): DeadlineInfo {
  if (isClosed(demanda)) {
    return {
      date: parseBrazilianDate(demanda.limite2),
      daysUntil: null,
      situation: 'Encerradas',
      range: 'Encerradas',
    };
  }

  const date = demanda.limite2Situacao === 'definido' ? parseBrazilianDate(demanda.limite2) : null;
  if (!date) return { date: null, daysUntil: null, situation: 'Sem prazo definido', range: 'Sem prazo' };

  const daysUntil = Math.round((atLocalMidnight(date).getTime() - atLocalMidnight(now).getTime()) / DAY_IN_MS);
  let situation = 'No prazo';
  if (daysUntil < 0) situation = 'Vencidas';
  else if (daysUntil === 0) situation = 'Vencendo hoje';
  else if (daysUntil <= 7) situation = 'Próximos 7 dias';

  let range = 'Mais de 30 dias';
  if (daysUntil < 0) range = 'Em atraso';
  else if (daysUntil === 0) range = 'Hoje';
  else if (daysUntil <= 7) range = '1 a 7 dias';
  else if (daysUntil <= 15) range = '8 a 15 dias';
  else if (daysUntil <= 30) range = '16 a 30 dias';

  return { date, daysUntil, situation, range };
}

export function getFollowUpInfo(demanda: Demanda, now = new Date()): FollowUpInfo {
  if (isClosed(demanda)) return { date: null, daysUntil: null, situation: 'Não exigida' };
  const date = parseBrazilianDate(demanda.proximaAcaoEm);
  if (!date) return { date: null, daysUntil: null, situation: 'Não informada' };

  const signal = classifyDateSignal(demanda.proximaAcaoEm, getTodayString(now));
  if (signal.kind === 'overdue') return { date, daysUntil: -(signal.days ?? 0), situation: 'Providência vencida' };
  if (signal.kind === 'today') return { date, daysUntil: 0, situation: 'Providência hoje' };
  if (signal.kind === 'next_7_days') return { date, daysUntil: signal.days, situation: 'Próximos 7 dias' };
  return { date, daysUntil: signal.days, situation: 'Futura' };
}

export function buildExcelAnalytics(demandas: Demanda[], now = new Date()): ExcelAnalytics {
  const emAcompanhamento = demandas.filter(isInFollowUp);
  const deadlineInfo = demandas.map((demanda) => getDeadlineInfo(demanda, now));
  const followUpInfo = demandas.map((demanda) => getFollowUpInfo(demanda, now));

  const deadlineSituation = SITUATION_ORDER.map((label) => {
    const count = deadlineInfo.filter((item) => item.situation === label).length;
    return { label, count, percentage: percentage(count, demandas.length) };
  });
  const deadlineRanges = RANGE_ORDER.map((label) => {
    const count = deadlineInfo.filter((item) => item.range === label).length;
    return { label, count, percentage: percentage(count, demandas.length) };
  });
  const followUpSituation = FOLLOW_UP_ORDER.map((label) => {
    const count = followUpInfo.filter((item) => item.situation === label).length;
    return { label, count, percentage: percentage(count, demandas.length) };
  });

  return {
    kpis: {
      total: demandas.length,
      emAcompanhamento: emAcompanhamento.length,
      encerrados: demandas.length - emAcompanhamento.length,
      paraAssinatura: demandas.filter((demanda) => demanda.status === 'Para Assinatura').length,
      vencidos: deadlineSituation.find((item) => item.label === 'Vencidas')?.count ?? 0,
      vencendoHoje: deadlineSituation.find((item) => item.label === 'Vencendo hoje')?.count ?? 0,
      providenciasVencidas: followUpSituation.find((item) => item.label === 'Providência vencida')?.count ?? 0,
      providenciasHoje: followUpSituation.find((item) => item.label === 'Providência hoje')?.count ?? 0,
    },
    byStatus: countBy(demandas, (demanda) => demanda.status, STATUS_ORDER),
    byType: countBy(demandas, (demanda) => demanda.tipo),
    bySector: countBy(demandas, (demanda) => normalizeLabel(demanda.setor, 'Não informado')),
    byClassification: countBy(demandas, (demanda) => normalizeLabel(demanda.classificacao, 'Não informada')),
    distribuicaoResponsaveis: countBy(
      demandas,
      (demanda) => normalizeLabel(demanda.responsavel, 'Não informado'),
    ).slice(0, 10),
    deadlineSituation,
    deadlineRanges,
    followUpSituation,
  };
}

export function describeActiveFilters(filters: ExcelExportFilters): Array<[string, string]> {
  const result: Array<[string, string]> = [];
  if (filters.query.trim()) result.push(['Busca', filters.query.trim()]);
  if (filters.type !== 'Todos') result.push(['Tipo', filters.type]);
  if (filters.classification !== 'Todas') result.push(['Classificação', filters.classification]);
  const statusLabel = filters.status === 'acompanhamento'
    ? 'Em acompanhamento'
    : filters.status === 'providencia_ctrh'
      ? 'Com providência CTRH'
      : filters.status === 'todos'
        ? 'Todos (exibir tudo)'
        : filters.status;
  result.push(['Status', statusLabel]);
  if (filters.sector !== 'Todos') result.push(['Setor', filters.sector]);
  if (filters.periodStart || filters.periodEnd) {
    const fieldLabels = {
      limite1: 'Prazo interno',
      limite2: 'Prazo final',
      historico: 'Movimentação do histórico',
      proxima_acao: 'Data da próxima providência',
    } as const;
    const displayDate = (value: string) => value ? value.split('-').reverse().join('/') : 'sem limite';
    const description = `${fieldLabels[filters.periodField]}: ${displayDate(filters.periodStart)} a ${displayDate(filters.periodEnd)}`;
    result.push(['Período', description]);
  }

  const quickFilters: string[] = [];
  if (filters.quickFilters.assinatura) quickFilters.push('Para assinatura');
  if (filters.quickFilters.hoje) quickFilters.push('Prazo final hoje');
  if (filters.quickFilters.vencido) quickFilters.push('Prazo final vencido');
  if (filters.quickFilters.internoHoje) quickFilters.push('Prazo interno hoje');
  if (filters.quickFilters.internoVencido) quickFilters.push('Prazo interno vencido');
  if (filters.quickFilters.providenciaHoje) quickFilters.push('Próxima providência hoje');
  if (filters.quickFilters.providenciaVencida) quickFilters.push('Próxima providência vencida');
  if (quickFilters.length > 0) result.push(['Filtros rápidos', quickFilters.join('; ')]);
  return result;
}
