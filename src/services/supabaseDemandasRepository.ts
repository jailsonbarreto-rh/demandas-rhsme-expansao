import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../lib/database.types';
import type { Demanda, LegacyCreateDemandaInput } from '../types';
import type { AppData, DemandasRepository } from './contracts';
import {
  toDatabaseDate,
  toDemanda,
  toHistorico,
  type DemandaRow,
  type HistoricoRow,
} from './dataMappers';

type DemandaUpdate = Database['public']['Tables']['sme_demandas']['Update'];
type QueryError = { code?: string; message: string } | null;

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

const LEGACY_HISTORY_COLUMNS =
  'id,demanda_id,status_novo,setor,comentario,created_at';

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
      demandas: demandasResult.data as DemandaRow[] | null,
      historico: historicoResult.data as HistoricoRow[] | null,
      demandasError: demandasResult.error,
      historicoError: historicoResult.error,
    };
  }

  private async loadLegacy(): Promise<AppData> {
    const [demandasResult, historicoResult] = await Promise.all([
      this.client.from('sme_demandas')
        .select(LEGACY_DEMANDA_COLUMNS)
        .order('created_at', { ascending: false }),
      this.client.from('sme_historico')
        .select(LEGACY_HISTORY_COLUMNS)
        .order('created_at', { ascending: false }),
    ]);

    throwIfError(demandasResult.error);
    throwIfError(historicoResult.error);

    return {
      demandas: ((demandasResult.data ?? []) as DemandaRow[]).map(toDemanda),
      historico: ((historicoResult.data ?? []) as HistoricoRow[]).map(toHistorico),
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

    if (isMissingExpandedSchema(expanded.demandasError)
      || isMissingExpandedSchema(expanded.historicoError)) {
      return this.loadLegacy();
    }

    throwIfError(expanded.demandasError);
    throwIfError(expanded.historicoError);
    return { demandas: [], historico: [] };
  }

  async create(input: LegacyCreateDemandaInput): Promise<void> {
    const { error } = await this.client.rpc('criar_sme_demanda', {
      p_numero: input.numero,
      p_tipo: input.tipo,
      p_assunto: input.assunto,
      p_responsavel: input.responsavel,
      p_limite1: toDatabaseDate(input.limite1),
      p_limite2: toDatabaseDate(input.limite2),
      p_status: input.status,
      p_setor: input.setor,
      p_classificacao: input.classificacao,
    });
    throwIfError(error);
  }

  async update(id: number, changes: Partial<Demanda>): Promise<void> {
    const payload: DemandaUpdate = {};
    if (changes.numero !== undefined) payload.numero = changes.numero;
    if (changes.tipo !== undefined) payload.tipo = changes.tipo;
    if (changes.assunto !== undefined) payload.assunto = changes.assunto;
    if (changes.responsavel !== undefined) payload.responsavel = changes.responsavel;
    if (changes.limite1 !== undefined) payload.limite1 = toDatabaseDate(changes.limite1);
    if (changes.limite2 !== undefined) payload.limite2 = toDatabaseDate(changes.limite2);
    if (changes.setor !== undefined) payload.setor = changes.setor;
    if (changes.classificacao !== undefined) payload.classificacao = changes.classificacao;

    const { error } = await this.client.from('sme_demandas').update(payload).eq('id', id);
    throwIfError(error);
  }

  async updateStatus(id: number, status: Demanda['status'], comentario: string): Promise<void> {
    const { error } = await this.client.rpc('atualizar_status_sme_demanda', {
      p_demanda_id: id,
      p_novo_status: status,
      p_comentario: comentario,
    });
    throwIfError(error);
  }

  async delete(id: number): Promise<void> {
    const { error } = await this.client.from('sme_demandas').delete().eq('id', id);
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
