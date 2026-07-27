import type { ComentarioHistorico, HistoryEventType } from '../types';

export interface HistoryEventPresentation {
  label: string;
  comment: string;
  technical: boolean;
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

const LEGACY_IMPORT_PATTERNS = [
  /^Demanda importada do lote saneado(?:\s+[a-f0-9]+)?\.?$/i,
  /^Demanda importada da planilha inicial\.?$/i,
  /^Demanda importada do sistema legado\.?$/i,
];

const OFFICIAL_PROFILE_LINK_PATTERN =
  /^Responsável vinculado a perfil oficial na migração R3\.?$/i;

export function presentHistoryEvent(
  event: Pick<ComentarioHistorico, 'tipoEvento' | 'comentario'>,
): HistoryEventPresentation {
  const rawComment = event.comentario.trim();

  if (LEGACY_IMPORT_PATTERNS.some((pattern) => pattern.test(rawComment))) {
    return {
      label: 'Importação',
      comment: 'Demanda importada do sistema legado.',
      technical: true,
    };
  }

  if (OFFICIAL_PROFILE_LINK_PATTERN.test(rawComment)) {
    return {
      label: 'Alteração de responsável',
      comment: 'Responsável vinculado ao perfil oficial.',
      technical: true,
    };
  }

  return {
    label: EVENT_LABELS[event.tipoEvento],
    comment: rawComment,
    technical: false,
  };
}

export function isTechnicalHistoryEvent(
  event: Pick<ComentarioHistorico, 'tipoEvento' | 'comentario'>,
): boolean {
  return presentHistoryEvent(event).technical;
}
