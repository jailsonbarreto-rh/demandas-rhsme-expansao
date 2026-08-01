import { describe, expect, it, vi } from 'vitest';
import { AccessPendingError, InvalidCredentialsError } from './errors';
import { SupabaseAuthService } from './supabaseAuthService';

const activeProfile = {
  id: 'user-1', nome: 'Usuário', email: 'teste@rioeduca.net', setor: 'CTRH', nivel: 'editor', status: 'ativo',
};

function createClient(profile: object | null = activeProfile) {
  const unsubscribe = vi.fn();
  const signOut = vi.fn().mockResolvedValue({ error: null });
  let authCallback: ((event: string, session: unknown) => void) | undefined;
  const auth = {
    signInWithPassword: vi.fn().mockResolvedValue({
      data: { user: { id: 'user-1', email: 'teste@rioeduca.net' } }, error: null,
    }),
    signUp: vi.fn().mockResolvedValue({ data: {}, error: null }),
    resetPasswordForEmail: vi.fn().mockResolvedValue({ data: {}, error: null }),
    updateUser: vi.fn().mockResolvedValue({ data: { user: {} }, error: null }),
    signOut,
    getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
    onAuthStateChange: vi.fn((callback: (event: string, session: unknown) => void) => {
      authCallback = callback;
      return { data: { subscription: { unsubscribe } } };
    }),
  };
  const single = vi.fn().mockResolvedValue({ data: profile, error: profile ? null : new Error('missing') });
  const eq = vi.fn(() => ({ single }));
  const select = vi.fn(() => ({ eq }));
  return {
    client: { auth, from: vi.fn(() => ({ select })) },
    auth,
    unsubscribe,
    emitAuth: (event: string, session: unknown) => authCallback?.(event, session),
  };
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
    expect(auth.signOut).toHaveBeenCalledWith({ scope: 'local' });
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

  it('solicita recuperação com e-mail normalizado e destino explícito', async () => {
    const { client, auth } = createClient();
    await new SupabaseAuthService(client as never).requestPasswordReset(
      ' Pessoa@Rioeduca.net ',
      'https://demandas-rhsme-expansao.vercel.app/redefinir-senha',
    );

    expect(auth.resetPasswordForEmail).toHaveBeenCalledWith('pessoa@rioeduca.net', {
      redirectTo: 'https://demandas-rhsme-expansao.vercel.app/redefinir-senha',
    });
  });

  it('recusa destino de recuperação externo, inseguro ou com parâmetros', async () => {
    const { client, auth } = createClient();
    const service = new SupabaseAuthService(client as never);

    await expect(service.requestPasswordReset(
      'pessoa@rioeduca.net',
      'https://site-externo.example/redefinir-senha',
    )).rejects.toThrow(/endereço de recuperação.*inválido/i);
    await expect(service.requestPasswordReset(
      'pessoa@rioeduca.net',
      'http://demandas-rhsme-expansao.vercel.app/redefinir-senha',
    )).rejects.toThrow(/endereço de recuperação.*inválido/i);
    await expect(service.requestPasswordReset(
      'pessoa@rioeduca.net',
      'https://demandas-rhsme-expansao.vercel.app/redefinir-senha?next=https://site-externo.example',
    )).rejects.toThrow(/endereço de recuperação.*inválido/i);

    expect(auth.resetPasswordForEmail).not.toHaveBeenCalled();
  });

  it('altera a senha e encerra a sessão temporária', async () => {
    const { client, auth } = createClient();
    await new SupabaseAuthService(client as never).completePasswordReset('NovaSenha9');

    expect(auth.updateUser).toHaveBeenCalledWith({ password: 'NovaSenha9' });
    expect(auth.signOut).toHaveBeenCalledWith({ scope: 'local' });
  });

  it('não informa conclusão quando a sessão temporária não pode ser encerrada', async () => {
    const { client, auth } = createClient();
    auth.signOut.mockResolvedValueOnce({ error: new Error('network') });

    await expect(new SupabaseAuthService(client as never).completePasswordReset('NovaSenha9'))
      .rejects.toThrow(/senha foi alterada.*sessão de recuperação/i);
  });

  it('encerra somente a sessão local no logout comum', async () => {
    const { client, auth } = createClient();
    await new SupabaseAuthService(client as never).signOut();

    expect(auth.signOut).toHaveBeenCalledWith({ scope: 'local' });
  });

  it('separa PASSWORD_RECOVERY da autenticação comum', () => {
    const { client, emitAuth } = createClient();
    const onChange = vi.fn();
    const onPasswordRecovery = vi.fn();
    new SupabaseAuthService(client as never).subscribe(onChange, onPasswordRecovery);

    emitAuth('PASSWORD_RECOVERY', { user: { id: 'user-1', email: 'teste@rioeduca.net' } });

    expect(onPasswordRecovery).toHaveBeenCalledOnce();
    expect(onChange).not.toHaveBeenCalled();
  });
});
