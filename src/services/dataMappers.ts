import type {
  ComentarioHistorico,
  DeadlineState,
  Demanda,
  DemandOrigin,
  DemandStatus,
  FieldChange,
  HistoryEventType,
} from '../types';
import { isValidDateString } from '../utils/date';

const DEMAND_STATUSES = new Set<DemandStatus>([
  'Aguardando Andamento',
  'Tramitado',
  'Para Assinatura',
  'Encerrado',
  'Sobrestado',
  'Ajustar',
]);

const HISTORY_EVENT_TYPES = new Set<HistoryEventType>([
  'criacao',
  'andamento',
  'mudanca_status',
  'edicao',
  'reatribuicao',
  'alteracao_prazo',
  'exclusao',
  'restauracao',
]);

export interface DemandaRow {
  id: number;
  numero: string;
  tipo: Demanda['tipo'];
  assunto: string;
  responsavel: string | null;
  responsavel_id?: string | null;
  limite1: string | null;
  limite1_situacao?: DeadlineState | null;
  limite1_justificativa?: string | null;
  limite2: string | null;
  limite2_situacao?: DeadlineState | null;
  limite2_justificativa?: string | null;
  proxima_acao?: string | null;
  proxima_acao_em?: string | null;
  link_origem?: string | null;
  status: Demanda['status'];
  setor: string | null;
  classificacao: string | null;
  origem?: DemandOrigin | null;
  deleted_at?: string | null;
  deleted_by?: string | null;
  deletion_reason?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

interface RawFieldChange {
  campo?: unknown;
  anterior?: unknown;
  novo?: unknown;
  field?: unknown;
  before?: unknown;
  after?: unknown;
}

export interface HistoricoRow {
  id: number;
  demanda_id: number;
  tipo_evento?: HistoryEventType | null;
  status_anterior?: string | null;
  status_novo: string;
  setor: string | null;
  comentario: string;
  alteracoes?: unknown;
  created_by?: string | null;
  created_at: string;
}

export function toDatabaseDate(value?: string): string | null {
  const normalized = value?.trim() ?? '';
  if (!normalized || normalized === 'dd/mm/aaaa') return null;

  if (!isValidDateString(normalized)) {
    throw new Error(`Data inválida: "${normalized}". Utilize o formato dd/mm/aaaa.`);
  }

  const [day, month, year] = normalized.split('/');
  return `${year}-${month}-${day}`;
}

export function fromDatabaseDate(value: string | null | undefined): string {
  if (!value) return '';
  const [year, month, day] = value.slice(0, 10).split('-');
  return `${day}/${month}/${year}`;
}

function normalizeDeadlineState(
  state: DeadlineState | null | undefined,
  date: string | null,
): DeadlineState {
  if (state === 'definido' || state === 'nao_informado' || state === 'nao_se_aplica') {
    return state;
  }
  return date ? 'definido' : 'nao_informado';
}

function normalizeHistoryEventType(value: HistoryEventType | null | undefined): HistoryEventType {
  return value && HISTORY_EVENT_TYPES.has(value) ? value : 'mudanca_status';
}

function normalizeStatus(value: string | null | undefined): DemandStatus | '' {
  return value && DEMAND_STATUSES.has(value as DemandStatus) ? value as DemandStatus : '';
}

function normalizeFieldValue(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  return typeof value === 'string' ? value : JSON.stringify(value);
}

function normalizeFieldChanges(value: unknown): FieldChange[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((candidate) => {
    if (!candidate || typeof candidate !== 'object') return [];
    const change = candidate as RawFieldChange;
    const fieldValue = change.campo ?? change.field;
    if (typeof fieldValue !== 'string' || !fieldValue.trim()) return [];

    return [{
      field: fieldValue,
      before: normalizeFieldValue(change.anterior ?? change.before),
      after: normalizeFieldValue(change.novo ?? change.after),
    }];
  });
}

export function toDemanda(row: DemandaRow): Demanda {
  return {
    id: row.id,
    numero: row.numero,
    tipo: row.tipo,
    assunto: row.assunto,
    responsavel: row.responsavel ?? '',
    responsavelId: row.responsavel_id ?? null,
    limite1: fromDatabaseDate(row.limite1),
    limite1Situacao: normalizeDeadlineState(row.limite1_situacao, row.limite1),
    limite1Justificativa: row.limite1_justificativa ?? '',
    limite2: fromDatabaseDate(row.limite2),
    limite2Situacao: normalizeDeadlineState(row.limite2_situacao, row.limite2),
    limite2Justificativa: row.limite2_justificativa ?? '',
    proximaAcao: row.proxima_acao ?? '',
    proximaAcaoEm: fromDatabaseDate(row.proxima_acao_em),
    linkOrigem: row.link_origem ?? '',
    status: row.status,
    setor: row.setor ?? '',
    classificacao: row.classificacao ?? '',
    origem: row.origem ?? 'legado',
    deletedAt: row.deleted_at ?? '',
    deletedBy: row.deleted_by ?? null,
    deletionReason: row.deletion_reason ?? '',
    createdAt: row.created_at ?? '',
    updatedAt: row.updated_at ?? '',
  };
}

export function toHistorico(row: HistoricoRow): ComentarioHistorico {
  const statusNovo = normalizeStatus(row.status_novo);
  if (!statusNovo) {
    throw new Error(`Status de histórico inválido: "${row.status_novo}".`);
  }

  return {
    id: row.id,
    demandaId: row.demanda_id,
    data_hora: new Date(row.created_at).toLocaleString('pt-BR'),
    tipoEvento: normalizeHistoryEventType(row.tipo_evento),
    status_anterior: normalizeStatus(row.status_anterior),
    status_novo: statusNovo,
    setor: row.setor ?? '',
    comentario: row.comentario,
    autorId: row.created_by ?? null,
    autorNome: '',
    alteracoes: normalizeFieldChanges(row.alteracoes),
  };
}
