import { describe, expect, it, vi } from 'vitest';
import { InvalidCredentialsError } from './errors';
import { LocalAuthService } from './localAuthService';

function createStorage() {
  const values = new Map<string, string>();
  return {
    getItem: vi.fn((key: string) => values.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => values.set(key, value)),
    removeItem: vi.fn((key: string) => values.delete(key)),
  };
}

describe('LocalAuthService', () => {
  it('mantém o login local do perfil de teste sem armazenar a senha', async () => {
    const storage = createStorage();
    const service = new LocalAuthService(storage);

    const user = await service.signIn('teste@rioeduca.net', 'senha-local-teste');

    expect(user.email).toBe('teste@rioeduca.net');
    expect(storage.getItem('demandas_user')).toBe('teste@rioeduca.net');
    expect([...storage.setItem.mock.calls].flat()).not.toContain('senha-local-teste');
  });

  it.each([
    ['pessoa@gmail.com', 'senha-local-teste'],
    ['teste@rioeduca.net', 'curta'],
  ])('recusa credenciais locais inválidas', async (email, password) => {
    await expect(new LocalAuthService(createStorage()).signIn(email, password))
      .rejects.toBeInstanceOf(InvalidCredentialsError);
  });

  it('restaura e encerra a sessão local', async () => {
    const storage = createStorage();
    const service = new LocalAuthService(storage);
    await service.signIn('teste@rioeduca.net', 'senha-local-teste');

    expect((await service.restore())?.email).toBe('teste@rioeduca.net');
    await service.signOut();
    expect(await service.restore()).toBeNull();
  });

  it('simula recuperação sem armazenar e-mail ou senha', async () => {
    const storage = createStorage();
    const service = new LocalAuthService(storage);

    await service.requestPasswordReset('teste@rioeduca.net', 'http://localhost:5173/redefinir-senha');
    await service.completePasswordReset('NovaSenha9');

    expect(storage.setItem).not.toHaveBeenCalled();
  });
});
