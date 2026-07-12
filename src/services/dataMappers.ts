import type { ComentarioHistorico, Demanda } from '../types';

export interface DemandaRow {
  id: number;
  numero: string;
  tipo: Demanda['tipo'];
  assunto: string;
  responsavel: string | null;
  limite1: string | null;
  limite2: string | null;
  status: Demanda['status'];
  setor: string | null;
  classificacao: string | null;
}

export interface HistoricoRow {
  id: number;
  demanda_id: number;
  status_novo: string;
  setor: string | null;
  comentario: string;
  created_at: string;
}

export function toDatabaseDate(value?: string): string | null {
  if (!value || value === 'dd/mm/aaaa') return null;
  const [day, month, year] = value.split('/');
  return `${year}-${month}-${day}`;
}

export function fromDatabaseDate(value: string | null): string {
  if (!value) return '';
  const [year, month, day] = value.slice(0, 10).split('-');
  return `${day}/${month}/${year}`;
}

export function toDemanda(row: DemandaRow): Demanda {
  return {
    id: row.id,
    numero: row.numero,
    tipo: row.tipo,
    assunto: row.assunto,
    responsavel: row.responsavel ?? '',
    limite1: fromDatabaseDate(row.limite1),
    limite2: fromDatabaseDate(row.limite2),
    status: row.status,
    setor: row.setor ?? '',
    classificacao: row.classificacao ?? '',
  };
}

export function toHistorico(row: HistoricoRow): ComentarioHistorico {
  return {
    id: row.id,
    demandaId: row.demanda_id,
    data_hora: new Date(row.created_at).toLocaleString('pt-BR'),
    status_novo: row.status_novo,
    setor: row.setor ?? '',
    comentario: row.comentario,
  };
}
