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
          assunto: string; responsavel: string; limite1: string | null; limite2: string | null;
          status: 'Aguardando Andamento' | 'Tramitado' | 'Para Assinatura' | 'Encerrado' | 'Sobrestado' | 'Ajustar';
          setor: string; classificacao: string; created_by: string | null; updated_by: string | null;
          created_at: string; updated_at: string;
        };
        Insert: {
          id?: number; numero: string; tipo: 'Expediente' | 'Processo' | 'Outros';
          assunto: string; responsavel?: string; limite1?: string | null; limite2?: string | null;
          status: 'Aguardando Andamento' | 'Tramitado' | 'Para Assinatura' | 'Encerrado' | 'Sobrestado' | 'Ajustar';
          setor?: string; classificacao?: string; created_by?: string | null; updated_by?: string | null;
          created_at?: string; updated_at?: string;
        };
        Update: {
          numero?: string; tipo?: 'Expediente' | 'Processo' | 'Outros'; assunto?: string;
          responsavel?: string; limite1?: string | null; limite2?: string | null;
          status?: 'Aguardando Andamento' | 'Tramitado' | 'Para Assinatura' | 'Encerrado' | 'Sobrestado' | 'Ajustar';
          setor?: string; classificacao?: string; updated_by?: string | null; updated_at?: string;
        };
        Relationships: [];
      };
      sme_historico: {
        Row: {
          id: number; demanda_id: number; status_novo: string; setor: string;
          comentario: string; created_by: string | null; created_at: string;
        };
        Insert: {
          id?: number; demanda_id: number; status_novo: string; setor?: string;
          comentario: string; created_by?: string | null; created_at?: string;
        };
        Update: never;
        Relationships: [];
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
