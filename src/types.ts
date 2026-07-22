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
  limite1: string; // dd/mm/aaaa ou vazio
  limite1Situacao: DeadlineState;
  limite1Justificativa: string;
  limite2: string; // dd/mm/aaaa ou vazio
  limite2Situacao: DeadlineState;
  limite2Justificativa: string;
  proximaAcao: string;
  proximaAcaoEm: string; // dd/mm/aaaa ou vazio
  linkOrigem: string;
  status: DemandStatus;
  setor: string;
  classificacao: string;
  origem: DemandOrigin;
  createdAt: string; // ISO ou vazio em fixture legada
  updatedAt: string; // ISO ou vazio em fixture legada
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
  data_hora: string; // dd/mm/aaaa hh:mm:ss ou ISO
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

export interface AppUser {
  id: string;
  email: string;
  perfil: PerfilUsuario;
}
