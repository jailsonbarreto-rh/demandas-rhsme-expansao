import { describe, expect, it, vi } from 'vitest';
import { AccessPendingError, InvalidCredentialsError } from './errors';
import { SupabaseAuthService } from './supabaseAuthService';

const activeProfile = {
  id: 'user-1', nome: 'Usuário', email: 'teste@rioeduca.net', setor: 'CTRH', nivel: 'editor', status: 'ativo',
};

function createClient(profile: object | null = activeProfile) {
  const unsubscribe = vi.fn();
  const signOut = vi.fn().mockResolvedValue({ error: null });
  const auth = {
    signInWithPassword: vi.fn().mockResolvedValue({
      data: { user: { id: 'user-1', email: 'teste@rioeduca.net' } }, error: null,
    }),
    signUp: vi.fn().mockResolvedValue({ data: {}, error: null }),
    signOut,
    getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
    onAuthStateChange: vi.fn((callback: (...args: unknown[]) => void) => {
      void callback;
      return { data: { subscription: { unsubscribe } } };
    }),
  };
  const single = vi.fn().mockResolvedValue({ data: profile, error: profile ? null : new Error('missing') });
  const eq = vi.fn(() => ({ single }));
  const select = vi.fn(() => ({ eq }));
  return { client: { auth, from: vi.fn(() => ({ select })) }, auth, unsubscribe };
}

describe('SupabaseAuthService', () => {
  it('retorna usuário quando o perfil está ativo', async () => {
    const { client } = createClient();
    const user = await new SupabaseAuthService(client as never)
      .signIn('teste@rioeduca.net', 'senha-forte');
    expect(user.perfil.status).toBe('ativo');
  });

  it('bloqueia perfil pendente depois de credencial válida', async () => {
    const { client, auth } = createClient({ ...activeProfile, status: 'pendente' });
    await expect(new SupabaseAuthService(client as never)
      .signIn('novo@rioeduca.net', 'senha-forte')).rejects.toBeInstanceOf(AccessPendingError);
    expect(auth.signOut).toHaveBeenCalled();
  });

  it('normaliza erro de credencial', async () => {
    const { client, auth } = createClient();
    auth.signInWithPassword.mockResolvedValueOnce({ data: { user: null }, error: new Error('invalid') } as never);
    await expect(new SupabaseAuthService(client as never)
      .signIn('teste@rioeduca.net', 'senha-forte')).rejects.toBeInstanceOf(InvalidCredentialsError);
  });

  it('recusa cadastro fora do domínio corporativo', async () => {
    const { client, auth } = createClient();
    await expect(new SupabaseAuthService(client as never)
      .requestAccess('pessoa@gmail.com', 'senha-forte')).rejects.toBeInstanceOf(InvalidCredentialsError);
    expect(auth.signUp).not.toHaveBeenCalled();
  });

  it('remove a assinatura de autenticação no cleanup', () => {
    const { client, unsubscribe } = createClient();
    const cleanup = new SupabaseAuthService(client as never).subscribe(vi.fn());
    cleanup();
    expect(unsubscribe).toHaveBeenCalled();
  });
});
