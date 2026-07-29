import { describe, expect, it, vi } from 'vitest';
import type { CreateDemandaInput, EditDemandaInput } from '../types';
import { SupabaseDemandasRepository } from './supabaseDemandasRepository';

const novaDemanda: CreateDemandaInput = {
  numero: 'SME-001',
  tipo: 'Processo',
  assunto: 'Teste',
  responsavel: 'Pessoa',
  responsavelId: null,
  limite1: '12/07/2026',
  limite1Situacao: 'definido',
  limite1Justificativa: '',
  limite2: '',
  limite2Situacao: 'nao_informado',
  limite2Justificativa: '',
  proximaAcao: 'Conferir documentação recebida',
  proximaAcaoEm: '20/07/2026',
  linkOrigem: '',
  status: 'Aguardando Andamento',
  setor: 'E/CTRH',
  classificacao: 'Diversos',
};

const editInput: EditDemandaInput = {
  assunto: 'Teste revisado',
  responsavelId: null,
  responsavel: 'Pessoa',
  limite1: '12/07/2026',
  limite1Situacao: 'definido',
  limite1Justificativa: '',
  limite2: '',
  limite2Situacao: 'nao_informado',
  limite2Justificativa: '',
  setor: 'E/CTRH',
  classificacao: 'Diversos',
  linkOrigem: '',
  proximaAcao: 'Conferir documentação revisada',
  proximaAcaoEm: '21/07/2026',
  justificativa: 'Correção confirmada na documentação',
};

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
      deleted_by: null, deletion_reason: null,
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

    expect(demandasSelect).toHaveBeenCalledWith(expect.stringContaining('deleted_at'));
    expect(demandasIs).toHaveBeenCalledWith('deleted_at', null);
    expect(data.demandas[0]).toEqual(expect.objectContaining({
      id: 7,
      limite1: '12/07/2026',
      responsavelId: null,
      origem: 'legado',
      deletedAt: '',
      deletedBy: null,
      deletionReason: '',
    }));
  });

  it('recua somente diante de ausência inequívoca do schema expandido', async () => {
    let demandAttempt = 0;
    let historyAttempt = 0;
    const client = {
      from: vi.fn((table: string) => ({
        select: vi.fn(() => {
          if (table === 'sme_demandas') {
            demandAttempt += 1;
            const result = demandAttempt === 1
              ? { data: null, error: { code: 'PGRST204', message: "Could not find the 'responsavel_id' column" } }
              : { data: [{
                  id: 8, numero: 'SME-008', tipo: 'Processo', assunto: 'Legado', responsavel: '',
                  limite1: null, limite2: null, status: 'Aguardando Andamento', setor: 'CTRH', classificacao: '',
                }], error: null };
            return {
              is: vi.fn(() => ({ order: vi.fn().mockResolvedValue(result) })),
              order: vi.fn().mockResolvedValue(result),
            };
          }
          historyAttempt += 1;
          const result = historyAttempt === 1
            ? { data: null, error: { code: 'PGRST204', message: "Could not find the 'tipo_evento' column" } }
            : { data: [{
                id: 3, demanda_id: 8, status_novo: 'Aguardando Andamento', setor: 'CTRH',
                comentario: 'Criado', created_at: '2026-07-01T10:00:00Z',
              }], error: null };
          return { order: vi.fn().mockResolvedValue(result) };
        }),
      })),
    };

    const data = await new SupabaseDemandasRepository(client as never).load();
    expect(demandAttempt).toBe(2);
    expect(historyAttempt).toBe(2);
    expect(data.demandas[0]).toEqual(expect.objectContaining({ id: 8, origem: 'legado' }));
  });

  it('carrega a lixeira sem acionar fallback legado', async () => {
    const order = vi.fn().mockResolvedValue({ data: [], error: null });
    const not = vi.fn(() => ({ order }));
    const select = vi.fn(() => ({ not }));
    const client = { from: vi.fn(() => ({ select })) };

    await new SupabaseDemandasRepository(client as never).loadTrash();
    expect(not).toHaveBeenCalledWith('deleted_at', 'is', null);
    expect(order).toHaveBeenCalledWith('deleted_at', { ascending: false });
  });

  it('cria demanda pelo contrato v2 com datas do banco', async () => {
    const { client, rpc } = createClient();
    await new SupabaseDemandasRepository(client as never).create(novaDemanda);
    expect(rpc).toHaveBeenCalledWith('criar_sme_demanda_v2', expect.objectContaining({
      p_numero: novaDemanda.numero,
      p_limite1: '2026-07-12',
      p_limite2: null,
      p_proxima_acao_em: '2026-07-20',
    }));
  });

  it('encaminha edição, andamento, transição, exclusão e restauração às RPCs nomeadas', async () => {
    const { client, rpc } = createClient();
    const repository = new SupabaseDemandasRepository(client as never);

    await repository.edit(7, editInput);
    await repository.registerProgress(7, {
      comentario: 'Conferido',
      proximaAcao: 'Cobrar retorno da unidade',
      proximaAcaoEm: '25/07/2026',
    });
    await repository.transitionStatus(7, {
      status: 'Encerrado',
      comentario: 'Concluído',
      proximaAcao: '',
      proximaAcaoEm: '',
    });
    await repository.deleteLogically(7, { motivo: 'Registro duplicado confirmado' });
    await repository.restore(7, { motivo: 'Registro deve voltar à carteira' });

    expect(rpc).toHaveBeenNthCalledWith(1, 'editar_sme_demanda', expect.objectContaining({
      p_demanda_id: 7,
      p_justificativa: editInput.justificativa,
    }));
    expect(rpc).toHaveBeenNthCalledWith(2, 'registrar_andamento_sme_demanda', expect.objectContaining({
      p_demanda_id: 7,
      p_proxima_acao_em: '2026-07-25',
    }));
    expect(rpc).toHaveBeenNthCalledWith(3, 'transicionar_status_sme_demanda', expect.objectContaining({
      p_novo_status: 'Encerrado',
      p_proxima_acao_em: null,
    }));
    expect(rpc).toHaveBeenNthCalledWith(4, 'excluir_sme_demanda', {
      p_demanda_id: 7,
      p_motivo: 'Registro duplicado confirmado',
    });
    expect(rpc).toHaveBeenNthCalledWith(5, 'restaurar_sme_demanda', {
      p_demanda_id: 7,
      p_motivo: 'Registro deve voltar à carteira',
    });
  });

  it('assina as duas tabelas e remove o canal no cleanup', () => {
    const { client, channel, removeChannel } = createClient();
    const cleanup = new SupabaseDemandasRepository(client as never).subscribe(vi.fn());
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
