import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../lib/database.types';
import type { Demanda } from '../types';
import type { AppData, DemandasRepository } from './contracts';
import { toDatabaseDate, toDemanda, toHistorico } from './dataMappers';

type DemandaUpdate = Database['public']['Tables']['sme_demandas']['Update'];

function throwIfError(error: { message: string } | null): void {
  if (error) throw error;
}

export class SupabaseDemandasRepository implements DemandasRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async load(): Promise<AppData> {
    const [demandasResult, historicoResult] = await Promise.all([
      this.client.from('sme_demandas')
        .select('id,numero,tipo,assunto,responsavel,limite1,limite2,status,setor,classificacao')
        .order('created_at', { ascending: false }),
      this.client.from('sme_historico')
        .select('id,demanda_id,status_novo,setor,comentario,created_at')
        .order('created_at', { ascending: false }),
    ]);
    throwIfError(demandasResult.error);
    throwIfError(historicoResult.error);
    return {
      demandas: (demandasResult.data ?? []).map(toDemanda),
      historico: (historicoResult.data ?? []).map(toHistorico),
    };
  }

  async create(input: Omit<Demanda, 'id'>): Promise<void> {
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
