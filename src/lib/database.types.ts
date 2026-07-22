export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type DemandStatus =
  | 'Aguardando Andamento'
  | 'Tramitado'
  | 'Para Assinatura'
  | 'Encerrado'
  | 'Sobrestado'
  | 'Ajustar';

type DeadlineState = 'definido' | 'nao_informado' | 'nao_se_aplica';
type DemandOrigin = 'legado' | 'sistema';
type HistoryEventType =
  | 'criacao'
  | 'andamento'
  | 'mudanca_status'
  | 'edicao'
  | 'reatribuicao'
  | 'alteracao_prazo'
  | 'exclusao'
  | 'restauracao';

export type Database = {
  public: {
    Tables: {
      perfis_usuarios: {
        Row: {
          id: string; nome: string; email: string; setor: string;
          nivel: 'administrador' | 'editor' | 'leitor';
          status: 'ativo' | 'pendente' | 'inativo';
          created_at: string; updated_at: string;
        };
        Insert: {
          id: string; nome?: string; email: string; setor?: string;
          nivel?: 'administrador' | 'editor' | 'leitor';
          status?: 'ativo' | 'pendente' | 'inativo';
          created_at?: string; updated_at?: string;
        };
        Update: {
          nome?: string; email?: string; setor?: string;
          nivel?: 'administrador' | 'editor' | 'leitor';
          status?: 'ativo' | 'pendente' | 'inativo'; updated_at?: string;
        };
        Relationships: [];
      };
      sme_demandas: {
        Row: {
          id: number; numero: string; tipo: 'Expediente' | 'Processo' | 'Outros';
          assunto: string; responsavel: string; responsavel_id: string | null;
          limite1: string | null; limite1_situacao: DeadlineState; limite1_justificativa: string | null;
          limite2: string | null; limite2_situacao: DeadlineState; limite2_justificativa: string | null;
          proxima_acao: string | null; proxima_acao_em: string | null; link_origem: string | null;
          status: DemandStatus; setor: string; classificacao: string; origem: DemandOrigin;
          deleted_at: string | null; deleted_by: string | null; deletion_reason: string | null;
          created_by: string | null; updated_by: string | null;
          created_at: string; updated_at: string;
        };
        Insert: {
          id?: number; numero: string; tipo: 'Expediente' | 'Processo' | 'Outros';
          assunto: string; responsavel?: string; responsavel_id?: string | null;
          limite1?: string | null; limite1_situacao?: DeadlineState; limite1_justificativa?: string | null;
          limite2?: string | null; limite2_situacao?: DeadlineState; limite2_justificativa?: string | null;
          proxima_acao?: string | null; proxima_acao_em?: string | null; link_origem?: string | null;
          status: DemandStatus; setor?: string; classificacao?: string; origem?: DemandOrigin;
          deleted_at?: string | null; deleted_by?: string | null; deletion_reason?: string | null;
          created_by?: string | null; updated_by?: string | null;
          created_at?: string; updated_at?: string;
        };
        Update: {
          numero?: string; tipo?: 'Expediente' | 'Processo' | 'Outros'; assunto?: string;
          responsavel?: string; responsavel_id?: string | null;
          limite1?: string | null; limite1_situacao?: DeadlineState; limite1_justificativa?: string | null;
          limite2?: string | null; limite2_situacao?: DeadlineState; limite2_justificativa?: string | null;
          proxima_acao?: string | null; proxima_acao_em?: string | null; link_origem?: string | null;
          status?: DemandStatus; setor?: string; classificacao?: string; origem?: DemandOrigin;
          deleted_at?: string | null; deleted_by?: string | null; deletion_reason?: string | null;
          updated_by?: string | null; updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'sme_demandas_responsavel_id_fkey';
            columns: ['responsavel_id'];
            isOneToOne: false;
            referencedRelation: 'perfis_usuarios';
            referencedColumns: ['id'];
          },
        ];
      };
      sme_historico: {
        Row: {
          id: number; demanda_id: number; tipo_evento: HistoryEventType;
          status_anterior: DemandStatus | null; status_novo: DemandStatus; setor: string;
          comentario: string; alteracoes: Json; created_by: string | null; created_at: string;
        };
        Insert: {
          id?: number; demanda_id: number; tipo_evento?: HistoryEventType;
          status_anterior?: DemandStatus | null; status_novo: DemandStatus; setor?: string;
          comentario: string; alteracoes?: Json; created_by?: string | null; created_at?: string;
        };
        Update: never;
        Relationships: [
          {
            foreignKeyName: 'sme_historico_demanda_id_fkey';
            columns: ['demanda_id'];
            isOneToOne: false;
            referencedRelation: 'sme_demandas';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      criar_sme_demanda: {
        Args: {
          p_numero: string; p_tipo: string; p_assunto: string; p_responsavel: string;
          p_limite1: string | null; p_limite2: string | null; p_status: string;
          p_setor: string; p_classificacao: string;
        };
        Returns: Database['public']['Tables']['sme_demandas']['Row'];
      };
      atualizar_status_sme_demanda: {
        Args: { p_demanda_id: number; p_novo_status: string; p_comentario: string };
        Returns: undefined;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
