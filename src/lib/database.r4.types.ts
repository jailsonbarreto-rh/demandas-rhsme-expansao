import type { Database } from './database.types';

type DemandStatus = Database['public']['Tables']['sme_demandas']['Row']['status'];
type DeadlineState = Database['public']['Tables']['sme_demandas']['Row']['limite1_situacao'];
type DemandRow = Database['public']['Tables']['sme_demandas']['Row'];

export interface R4Functions {
  criar_sme_demanda_r4: {
    Args: {
      p_numero: string;
      p_tipo: string;
      p_assunto: string;
      p_responsavel_id: string | null;
      p_limite1: string | null;
      p_limite1_situacao: DeadlineState;
      p_limite2: string | null;
      p_limite2_situacao: DeadlineState;
      p_proxima_acao: string;
      p_proxima_acao_em: string | null;
      p_proxima_acao_justificativa: string | undefined;
      p_status: DemandStatus;
      p_setor: string;
      p_classificacao: string;
      p_link_origem: string;
    };
    Returns: DemandRow;
  };
  editar_sme_demanda_r4: {
    Args: {
      p_demanda_id: number;
      p_assunto: string;
      p_responsavel_id: string | null;
      p_limite1: string | null;
      p_limite1_situacao: DeadlineState;
      p_limite2: string | null;
      p_limite2_situacao: DeadlineState;
      p_setor: string;
      p_classificacao: string;
      p_link_origem: string;
      p_justificativa: string;
    };
    Returns: DemandRow;
  };
  registrar_andamento_sme_demanda_r4: {
    Args: {
      p_demanda_id: number;
      p_comentario: string;
      p_proxima_acao: string;
      p_proxima_acao_em: string | null;
      p_proxima_acao_justificativa: string | undefined;
    };
    Returns: DemandRow;
  };
  transicionar_status_sme_demanda_r4: {
    Args: {
      p_demanda_id: number;
      p_novo_status: DemandStatus;
      p_comentario: string;
      p_proxima_acao: string;
      p_proxima_acao_em: string | null;
      p_proxima_acao_justificativa: string | undefined;
    };
    Returns: DemandRow;
  };
}

export type DatabaseR4 = Omit<Database, 'public'> & {
  public: Omit<Database['public'], 'Functions'> & {
    Functions: Database['public']['Functions'] & R4Functions;
  };
};
