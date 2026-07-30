import type { ComentarioHistorico, FieldChange, HistoryEventType } from '../types';

export interface HistoryEventPresentation {
  label: string;
  comment: string;
  technical: boolean;
}

export interface HistoryChangePresentation {
  label: string;
  before: string;
  after: string;
}

const EVENT_LABELS: Record<HistoryEventType, string> = {
  criacao: 'Cadastro',
  andamento: 'Andamento',
  mudanca_status: 'Alteração de status',
  edicao: 'Edição',
  reatribuicao: 'Alteração de responsável',
  alteracao_prazo: 'Alteração de prazo',
  exclusao: 'Exclusão',
  restauracao: 'Restauração',
};

const INITIAL_IMPORT_PATTERNS = [
  /^Demanda importada do lote saneado(?:\s+[a-f0-9]+)?\.?$/i,
  /^Demanda importada da planilha inicial\.?$/i,
  /^Demanda importada do sistema legado\.?$/i,
];

const OFFICIAL_PROFILE_LINK_PATTERN =
  /^Responsável vinculado a perfil oficial na migração R3\.?$/i;

const HISTORY_FIELD_LABELS: Record<string, string> = {
  assunto: 'Assunto',
  responsavel: 'Responsável',
  setor: 'Setor',
  classificacao: 'Classificação',
  status: 'Status',
  limite1: 'Prazo interno',
  limite1_situacao: 'Situação do prazo interno',
  limite2: 'Prazo final',
  limite2_situacao: 'Situação do prazo final',
  proxima_acao: 'Próxima providência',
  proxima_acao_em: 'Data da próxima providência',
};

const HIDDEN_HISTORY_FIELDS = new Set([
  'id',
  'demanda_id',
  'responsavel_id',
  'created_by',
  'deleted_by',
  'created_at',
  'updated_at',
  'deleted_at',
  'link_origem',
  'origem',
]);

const VALUE_LABELS: Record<string, string> = {
  definido: 'Data definida',
  nao_informado: 'Não informado',
  nao_se_aplica: 'Não se aplica',
};

function presentValue(value: string | null): string {
  if (value === null || !value.trim()) return 'Não informado';
  return VALUE_LABELS[value] ?? value;
}

export function presentHistoryChanges(changes: FieldChange[]): HistoryChangePresentation[] {
  return changes.flatMap((change) => {
    const field = change.field.trim().toLowerCase();
    if (!field || HIDDEN_HISTORY_FIELDS.has(field) || field.endsWith('_id')) return [];
    const label = HISTORY_FIELD_LABELS[field];
    if (!label) return [];

    return [{
      label,
      before: presentValue(change.before),
      after: presentValue(change.after),
    }];
  });
}

export function presentHistoryEvent(
  event: Pick<ComentarioHistorico, 'tipoEvento' | 'comentario'>,
): HistoryEventPresentation {
  const rawComment = event.comentario.trim();

  if (INITIAL_IMPORT_PATTERNS.some((pattern) => pattern.test(rawComment))) {
    return {
      label: 'Cadastro inicial',
      comment: 'Registro incorporado à base de demandas.',
      technical: true,
    };
  }

  if (OFFICIAL_PROFILE_LINK_PATTERN.test(rawComment)) {
    return {
      label: 'Alteração de responsável',
      comment: 'Cadastro do responsável atualizado.',
      technical: true,
    };
  }

  return {
    label: EVENT_LABELS[event.tipoEvento],
    comment: rawComment || 'Movimentação registrada sem observação.',
    technical: false,
  };
}

export function isTechnicalHistoryEvent(
  event: Pick<ComentarioHistorico, 'tipoEvento' | 'comentario'>,
): boolean {
  return presentHistoryEvent(event).technical;
}
