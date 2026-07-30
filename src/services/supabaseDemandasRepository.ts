import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../lib/database.types';
import type { R4Functions } from '../lib/database.r4.types';
import type {
  CreateDemandaInput,
  DeleteDemandaInput,
  Demanda,
  EditDemandaInput,
  ProgressInput,
  StatusTransitionInput,
} from '../types';
import type { AppData, DemandasRepository } from './contracts';
import {
  toDatabaseDate,
  toDemanda,
  toHistorico,
  type DemandaRow,
  type HistoricoRow,
} from './dataMappers';

type QueryError = { code?: string; message: string } | null;

type R4RpcClient = {
  rpc<Name extends keyof R4Functions>(
    name: Name,
    args: R4Functions[Name]['Args'],
  ): Promise<{ data: R4Functions[Name]['Returns'] | null; error: QueryError }>;
};

const EXPANDED_DEMANDA_COLUMNS = [
  'id', 'numero', 'tipo', 'assunto', 'responsavel', 'responsavel_id',
  'limite1', 'limite1_situacao', 'limite1_justificativa',
  'limite2', 'limite2_situacao', 'limite2_justificativa',
  'proxima_acao', 'proxima_acao_em', 'link_origem', 'status', 'setor',
  'classificacao', 'origem', 'deleted_at', 'deleted_by', 'deletion_reason',
  'created_at', 'updated_at',
].join(',');

const LEGACY_DEMANDA_COLUMNS =
  'id,numero,tipo,assunto,responsavel,limite1,limite2,status,setor,classificacao';
const EXPANDED_HISTORY_COLUMNS = [
  'id', 'demanda_id', 'tipo_evento', 'status_anterior', 'status_novo',
  'setor', 'comentario', 'alteracoes', 'created_by', 'created_at',
].join(',');
const LEGACY_HISTORY_COLUMNS = 'id,demanda_id,status_novo,setor,comentario,created_at';

function throwIfError(error: QueryError): void {
  if (error) throw error;
}

function isMissingExpandedSchema(error: QueryError): boolean {
  if (!error) return false;
  const message = error.message.toLowerCase();
  return error.code === 'PGRST204'
    || error.code === '42703'
    || message.includes('could not find')
    || message.includes('does not exist')
    || message.includes('schema cache');
}

export class SupabaseDemandasRepository implements DemandasRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  private get r4Client(): R4RpcClient {
    return this.client as unknown as R4RpcClient;
  }

  private async loadExpanded(): Promise<{
    demandas: DemandaRow[] | null;
    historico: HistoricoRow[] | null;
    demandasError: QueryError;
    historicoError: QueryError;
  }> {
    const [demandasResult, historicoResult] = await Promise.all([
      this.client.from('sme_demandas')
        .select(EXPANDED_DEMANDA_COLUMNS)
        .is('deleted_at', null)
        .order('created_at', { ascending: false }),
      this.client.from('sme_historico')
        .select(EXPANDED_HISTORY_COLUMNS)
        .order('created_at', { ascending: false }),
    ]);
    return {
      demandas: demandasResult.data as unknown as DemandaRow[] | null,
      historico: historicoResult.data as unknown as HistoricoRow[] | null,
      demandasError: demandasResult.error,
      historicoError: historicoResult.error,
    };
  }

  private async loadLegacy(): Promise<AppData> {
    const [demandasResult, historicoResult] = await Promise.all([
      this.client.from('sme_demandas').select(LEGACY_DEMANDA_COLUMNS).order('created_at', { ascending: false }),
      this.client.from('sme_historico').select(LEGACY_HISTORY_COLUMNS).order('created_at', { ascending: false }),
    ]);
    throwIfError(demandasResult.error);
    throwIfError(historicoResult.error);
    return {
      demandas: ((demandasResult.data ?? []) as unknown as DemandaRow[]).map(toDemanda),
      historico: ((historicoResult.data ?? []) as unknown as HistoricoRow[]).map(toHistorico),
    };
  }

  async load(): Promise<AppData> {
    const expanded = await this.loadExpanded();
    if (!expanded.demandasError && !expanded.historicoError) {
      return {
        demandas: (expanded.demandas ?? []).map(toDemanda),
        historico: (expanded.historico ?? []).map(toHistorico),
      };
    }
    if (isMissingExpandedSchema(expanded.demandasError) || isMissingExpandedSchema(expanded.historicoError)) {
      return this.loadLegacy();
    }
    throwIfError(expanded.demandasError);
    throwIfError(expanded.historicoError);
    return { demandas: [], historico: [] };
  }

  async loadTrash(): Promise<Demanda[]> {
    const { data, error } = await this.client
      .from('sme_demandas')
      .select(EXPANDED_DEMANDA_COLUMNS)
      .not('deleted_at', 'is', null)
      .order('deleted_at', { ascending: false });
    throwIfError(error);
    return ((data ?? []) as unknown as DemandaRow[]).map(toDemanda);
  }

  async create(input: CreateDemandaInput): Promise<void> {
    const { error } = await this.r4Client.rpc('criar_sme_demanda_r4', {
      p_numero: input.numero,
      p_tipo: input.tipo,
      p_assunto: input.assunto,
      p_responsavel_id: input.responsavelId,
      p_limite1: toDatabaseDate(input.limite1),
      p_limite1_situacao: input.limite1Situacao,
      p_limite2: toDatabaseDate(input.limite2),
      p_limite2_situacao: input.limite2Situacao,
      p_proxima_acao: input.proximaAcao,
      p_proxima_acao_em: toDatabaseDate(input.proximaAcaoEm),
      p_proxima_acao_justificativa: input.proximaAcaoJustificativa ?? '',
      p_status: input.status,
      p_setor: input.setor,
      p_classificacao: input.classificacao,
      p_link_origem: input.linkOrigem,
    });
    throwIfError(error);
  }

  async edit(id: number, input: EditDemandaInput): Promise<void> {
    const { error } = await this.r4Client.rpc('editar_sme_demanda_r4', {
      p_demanda_id: id,
      p_assunto: input.assunto,
      p_responsavel_id: input.responsavelId,
      p_limite1: toDatabaseDate(input.limite1),
      p_limite1_situacao: input.limite1Situacao,
      p_limite2: toDatabaseDate(input.limite2),
      p_limite2_situacao: input.limite2Situacao,
      p_setor: input.setor,
      p_classificacao: input.classificacao,
      p_link_origem: input.linkOrigem,
      p_justificativa: input.justificativa,
    });
    throwIfError(error);
  }

  async registerProgress(id: number, input: ProgressInput): Promise<void> {
    const { error } = await this.r4Client.rpc('registrar_andamento_sme_demanda_r4', {
      p_demanda_id: id,
      p_comentario: input.comentario,
      p_proxima_acao: input.proximaAcao,
      p_proxima_acao_em: toDatabaseDate(input.proximaAcaoEm),
      p_proxima_acao_justificativa: input.proximaAcaoJustificativa ?? '',
    });
    throwIfError(error);
  }

  async transitionStatus(id: number, input: StatusTransitionInput): Promise<void> {
    const { error } = await this.r4Client.rpc('transicionar_status_sme_demanda_r4', {
      p_demanda_id: id,
      p_novo_status: input.status,
      p_comentario: input.comentario,
      p_proxima_acao: input.proximaAcao,
      p_proxima_acao_em: toDatabaseDate(input.proximaAcaoEm),
      p_proxima_acao_justificativa: input.proximaAcaoJustificativa ?? '',
    });
    throwIfError(error);
  }

  async deleteLogically(id: number, input: DeleteDemandaInput): Promise<void> {
    const { error } = await this.client.rpc('excluir_sme_demanda', { p_demanda_id: id, p_motivo: input.motivo });
    throwIfError(error);
  }

  subscribe(onRemoteChange: () => void): () => void {
    const channel = this.client.channel('central-demandas-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sme_demandas' }, onRemoteChange)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sme_historico' }, onRemoteChange)
      .subscribe();
    return () => { void this.client.removeChannel(channel); };
  }
}
