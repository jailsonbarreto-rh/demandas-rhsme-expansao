export type DemandStatus =
  | 'Aguardando Andamento'
  | 'Tramitado'
  | 'Para Assinatura'
  | 'Encerrado'
  | 'Sobrestado'
  | 'Ajustar';

export type WorkBucket =
  | 'providencia_ctrh'
  | 'aguardando_retorno'
  | 'monitoramento'
  | 'encerrada';

export type DeadlineState = 'definido' | 'nao_informado' | 'nao_se_aplica';
export type DemandOrigin = 'legado' | 'sistema';

export interface DeadlineValue {
  date: string;
  state: DeadlineState;
  justification: string;
}

export interface Demanda {
  id: number;
  numero: string;
  tipo: 'Expediente' | 'Processo' | 'Outros';
  assunto: string;
  responsavel: string;
  responsavelId: string | null;
  limite1: string;
  limite1Situacao: DeadlineState;
  limite1Justificativa: string;
  limite2: string;
  limite2Situacao: DeadlineState;
  limite2Justificativa: string;
  proximaAcao: string;
  proximaAcaoEm: string;
  linkOrigem: string;
  status: DemandStatus;
  setor: string;
  classificacao: string;
  origem: DemandOrigin;
  deletedAt: string;
  deletedBy: string | null;
  deletionReason: string;
  createdAt: string;
  updatedAt: string;
}

export type LegacyCreateDemandaInput = Pick<
  Demanda,
  | 'numero'
  | 'tipo'
  | 'assunto'
  | 'responsavel'
  | 'limite1'
  | 'limite2'
  | 'status'
  | 'setor'
  | 'classificacao'
>;

export type CreateDemandaInput = Omit<
  Demanda,
  | 'id'
  | 'createdAt'
  | 'updatedAt'
  | 'origem'
  | 'deletedAt'
  | 'deletedBy'
  | 'deletionReason'
>;

export interface EditDemandaInput {
  assunto: string;
  responsavelId: string | null;
  responsavel: string;
  limite1: string;
  limite1Situacao: DeadlineState;
  limite1Justificativa: string;
  limite2: string;
  limite2Situacao: DeadlineState;
  limite2Justificativa: string;
  setor: string;
  classificacao: string;
  linkOrigem: string;
  proximaAcao: string;
  proximaAcaoEm: string;
  justificativa: string;
}

export interface ProgressInput {
  comentario: string;
  proximaAcao: string;
  proximaAcaoEm: string;
}

export interface StatusTransitionInput extends ProgressInput {
  status: DemandStatus;
}

export interface DeleteDemandaInput {
  motivo: string;
}

export interface RestoreDemandaInput {
  motivo: string;
}

export type HistoryEventType =
  | 'criacao'
  | 'andamento'
  | 'mudanca_status'
  | 'edicao'
  | 'reatribuicao'
  | 'alteracao_prazo'
  | 'exclusao'
  | 'restauracao';

export interface FieldChange {
  field: string;
  before: string | null;
  after: string | null;
}

export interface ComentarioHistorico {
  id: number;
  demandaId: number;
  data_hora: string;
  tipoEvento: HistoryEventType;
  status_anterior: DemandStatus | '';
  status_novo: DemandStatus;
  setor: string;
  comentario: string;
  autorId: string | null;
  autorNome: string;
  alteracoes: FieldChange[];
}

export interface PerfilUsuario {
  id: string;
  nome: string;
  email: string;
  setor: string;
  nivel: 'administrador' | 'editor' | 'leitor';
  status: 'ativo' | 'pendente' | 'inativo';
}

export interface PerfilMinimo {
  id: string;
  nome: string;
  setor: string;
}

export interface AppUser {
  id: string;
  email: string;
  perfil: PerfilUsuario;
}
