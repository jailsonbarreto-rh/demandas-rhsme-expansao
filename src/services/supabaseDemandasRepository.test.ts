import { describe, expect, it, vi } from 'vitest';
import type { Demanda } from '../types';
import { SupabaseDemandasRepository } from './supabaseDemandasRepository';

const novaDemanda: Omit<Demanda, 'id'> = {
  numero: 'SME-001', tipo: 'Processo', assunto: 'Teste', responsavel: 'Pessoa',
  limite1: '12/07/2026', limite2: '', status: 'Aguardando Andamento',
  setor: 'E/CTRH', classificacao: 'Diversos',
} as Omit<Demanda, 'id'>;

function createClient() {
  const rpc = vi.fn().mockResolvedValue({ data: null, error: null });
  const removeChannel = vi.fn();
  const channel = {
    on: vi.fn().mockReturnThis(),
    subscribe: vi.fn().mockReturnThis(),
  };
  return {
    client: { rpc, channel: vi.fn(() => channel), removeChannel },
    rpc, channel, removeChannel,
  };
}

describe('SupabaseDemandasRepository', () => {
  it('carrega o modelo expandido e exclui registros logicamente removidos', async () => {
    const demandasOrder = vi.fn().mockResolvedValue({ data: [{
      id: 7, numero: 'SME-007', tipo: 'Processo', assunto: 'Assunto', responsavel: '',
      responsavel_id: null,
      limite1: '2026-07-12', limite1_situacao: 'definido', limite1_justificativa: null,
      limite2: null, limite2_situacao: 'nao_informado', limite2_justificativa: null,
      proxima_acao: '', proxima_acao_em: null, link_origem: '', origem: 'legado',
      status: 'Tramitado', setor: 'CTRH', classificacao: '', deleted_at: null,
      created_at: '2026-07-01T10:00:00Z', updated_at: '2026-07-12T12:00:00Z',
    }], error: null });
    const demandasIs = vi.fn(() => ({ order: demandasOrder }));
    const demandasSelect = vi.fn(() => ({ is: demandasIs, order: demandasOrder }));

    const historyOrder = vi.fn().mockResolvedValue({ data: [{
      id: 2, demanda_id: 7, tipo_evento: 'mudanca_status', status_anterior: null,
      status_novo: 'Tramitado', setor: 'CTRH', comentario: 'Movimentado',
      alteracoes: [], created_by: null, created_at: '2026-07-12T12:00:00Z',
    }], error: null });
    const historySelect = vi.fn(() => ({ order: historyOrder }));

    const client = { from: vi.fn((table: string) => ({
      select: table === 'sme_demandas' ? demandasSelect : historySelect,
    })) };

    const data = await new SupabaseDemandasRepository(client as never).load();

    expect(demandasSelect).toHaveBeenCalledWith(expect.stringContaining('responsavel_id'));
    expect(demandasSelect).toHaveBeenCalledWith(expect.stringContaining('created_at'));
    expect(demandasSelect).toHaveBeenCalledWith(expect.stringContaining('updated_at'));
    expect(demandasSelect).toHaveBeenCalledWith(expect.stringContaining('deleted_at'));
    expect(demandasIs).toHaveBeenCalledWith('deleted_at', null);
    expect(historySelect).toHaveBeenCalledWith(expect.stringContaining('tipo_evento'));
    expect(historySelect).toHaveBeenCalledWith(expect.stringContaining('alteracoes'));
    expect(demandasOrder).toHaveBeenCalledWith('created_at', { ascending: false });
    expect(historyOrder).toHaveBeenCalledWith('created_at', { ascending: false });
    expect(data.demandas[0]).toEqual(expect.objectContaining({
      id: 7,
      limite1: '12/07/2026',
      responsavelId: null,
      origem: 'legado',
      createdAt: '2026-07-01T10:00:00Z',
      updatedAt: '2026-07-12T12:00:00Z',
    }));
    expect(data.historico[0]).toEqual(expect.objectContaining({
      demandaId: 7,
      tipoEvento: 'mudanca_status',
      alteracoes: [],
    }));
  });

  it('recua para o contrato legado quando o schema expandido ainda não está disponível', async () => {
    const demandaSelectCalls: string[] = [];
    const historySelectCalls: string[] = [];

    const legacyDemandas = [{
      id: 8, numero: 'SME-008', tipo: 'Processo', assunto: 'Legado', responsavel: '',
      limite1: null, limite2: null, status: 'Aguardando Andamento', setor: 'CTRH', classificacao: '',
    }];
    const legacyHistory = [{
      id: 3, demanda_id: 8, status_novo: 'Aguardando Andamento', setor: 'CTRH',
      comentario: 'Criado', created_at: '2026-07-01T10:00:00Z',
    }];

    let demandAttempt = 0;
    let historyAttempt = 0;
    const client = {
      from: vi.fn((table: string) => ({
        select: vi.fn((columns: string) => {
          if (table === 'sme_demandas') {
            demandaSelectCalls.push(columns);
            demandAttempt += 1;
            const result = demandAttempt === 1
              ? { data: null, error: { code: 'PGRST204', message: "Could not find the 'responsavel_id' column" } }
              : { data: legacyDemandas, error: null };
            return {
              is: vi.fn(() => ({ order: vi.fn().mockResolvedValue(result) })),
              order: vi.fn().mockResolvedValue(result),
            };
          }

          historySelectCalls.push(columns);
          historyAttempt += 1;
          const result = historyAttempt === 1
            ? { data: null, error: { code: 'PGRST204', message: "Could not find the 'tipo_evento' column" } }
            : { data: legacyHistory, error: null };
          return { order: vi.fn().mockResolvedValue(result) };
        }),
      })),
    };

    const data = await new SupabaseDemandasRepository(client as never).load();

    expect(demandaSelectCalls).toHaveLength(2);
    expect(historySelectCalls).toHaveLength(2);
    expect(demandaSelectCalls[0]).toContain('responsavel_id');
    expect(demandaSelectCalls[1]).not.toContain('responsavel_id');
    expect(historySelectCalls[0]).toContain('tipo_evento');
    expect(historySelectCalls[1]).not.toContain('tipo_evento');
    expect(data.demandas[0]).toEqual(expect.objectContaining({
      id: 8,
      responsavelId: null,
      origem: 'legado',
    }));
    expect(data.historico[0]).toEqual(expect.objectContaining({
      demandaId: 8,
      tipoEvento: 'mudanca_status',
    }));
  });

  it('cria demanda pela RPC atômica com datas do banco', async () => {
    const { client, rpc } = createClient();
    await new SupabaseDemandasRepository(client as never).create(novaDemanda);
    expect(rpc).toHaveBeenCalledWith('criar_sme_demanda', expect.objectContaining({
      p_numero: novaDemanda.numero,
      p_limite1: '2026-07-12',
      p_limite2: null,
    }));
  });

  it('não envia status pelo update comum', async () => {
    const eq = vi.fn().mockResolvedValue({ data: null, error: null });
    const update = vi.fn(() => ({ eq }));
    const client = { from: vi.fn(() => ({ update })) };
    const repository = new SupabaseDemandasRepository(client as never);

    await repository.update(7, {
      assunto: 'Assunto atualizado',
      status: 'Encerrado',
    });

    expect(update).toHaveBeenCalledWith({ assunto: 'Assunto atualizado' });
    expect(eq).toHaveBeenCalledWith('id', 7);
  });

  it('altera status pela RPC atômica', async () => {
    const { client, rpc } = createClient();
    await new SupabaseDemandasRepository(client as never)
      .updateStatus(4, 'Tramitado', 'Encaminhado');
    expect(rpc).toHaveBeenCalledWith('atualizar_status_sme_demanda', {
      p_demanda_id: 4,
      p_novo_status: 'Tramitado',
      p_comentario: 'Encaminhado',
    });
  });

  it('assina as duas tabelas e remove o canal no cleanup', () => {
    const { client, channel, removeChannel } = createClient();
    const onChange = vi.fn();
    const cleanup = new SupabaseDemandasRepository(client as never).subscribe(onChange);
    expect(channel.on).toHaveBeenCalledTimes(2);
    cleanup();
    expect(removeChannel).toHaveBeenCalledWith(channel);
  });

  it('propaga erro retornado pela RPC', async () => {
    const { client, rpc } = createClient();
    rpc.mockResolvedValueOnce({ data: null, error: new Error('falha') });
    await expect(new SupabaseDemandasRepository(client as never).create(novaDemanda))
      .rejects.toThrow('falha');
  });
});
