import { describe, expect, it, vi } from 'vitest';
import { SupabaseProfilesService } from './supabaseProfilesService';

function createClient() {
  const order = vi.fn().mockResolvedValue({
    data: [
      { id: '1', nome: 'Ana', email: 'ana@rioeduca.net', setor: '', nivel: 'leitor', status: 'ativo' },
    ],
    error: null,
  });
  const select = vi.fn(() => ({ order }));
  const eq = vi.fn().mockResolvedValue({ error: null });
  const update = vi.fn(() => ({ eq }));
  return { client: { from: vi.fn(() => ({ select, update })) }, order, update, eq };
}

describe('SupabaseProfilesService', () => {
  it('lista perfis ordenados por nome', async () => {
    const { client, order } = createClient();
    const perfis = await new SupabaseProfilesService(client as never).list();
    expect(order).toHaveBeenCalledWith('nome', { ascending: true });
    expect(perfis[0].nome).toBe('Ana');
  });

  it('atualiza somente nível, status e setor', async () => {
    const { client, update, eq } = createClient();
    await new SupabaseProfilesService(client as never).updateAccess('1', {
      nivel: 'editor', setor: 'CTRH', nome: 'Não permitido',
    } as never);
    expect(update).toHaveBeenCalledWith({ nivel: 'editor', setor: 'CTRH' });
    expect(eq).toHaveBeenCalledWith('id', '1');
  });
});
