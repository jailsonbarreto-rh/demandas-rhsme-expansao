import { describe, expect, it, vi } from 'vitest';
import type { Demanda } from '../types';
import { SupabaseDemandasRepository } from './supabaseDemandasRepository';

const novaDemanda: Omit<Demanda, 'id'> = {
  numero: 'SME-001', tipo: 'Processo', assunto: 'Teste', responsavel: 'Pessoa',
  limite1: '12/07/2026', limite2: '', status: 'Aguardando Andamento',
  setor: 'E/CTRH', classificacao: 'Diversos',
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
  it('carrega demandas e histórico em ordem decrescente', async () => {
    const demandasOrder = vi.fn().mockResolvedValue({ data: [{
      id: 7, numero: 'SME-007', tipo: 'Processo', assunto: 'Assunto', responsavel: '',
      limite1: '2026-07-12', limite2: null, status: 'Tramitado', setor: 'CTRH', classificacao: '',
    }], error: null });
    const historyOrder = vi.fn().mockResolvedValue({ data: [{
      id: 2, demanda_id: 7, status_novo: 'Tramitado', setor: 'CTRH',
      comentario: 'Movimentado', created_at: '2026-07-12T12:00:00Z',
    }], error: null });
    const client = { from: vi.fn((table: string) => ({
      select: vi.fn(() => ({ order: table === 'sme_demandas' ? demandasOrder : historyOrder })),
    })) };

    const data = await new SupabaseDemandasRepository(client as never).load();

    expect(demandasOrder).toHaveBeenCalledWith('created_at', { ascending: false });
    expect(historyOrder).toHaveBeenCalledWith('created_at', { ascending: false });
    expect(data.demandas[0]).toEqual(expect.objectContaining({ id: 7, limite1: '12/07/2026' }));
    expect(data.historico[0]).toEqual(expect.objectContaining({ demandaId: 7 }));
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
