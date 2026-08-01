import type { AuthChangeEvent, SupabaseClient, User } from '@supabase/supabase-js';
import type { AppUser, PerfilUsuario } from '../types';
import type { AuthService } from './contracts';
import { AccessPendingError, InvalidCredentialsError } from './errors';

function normalizeInstitutionalEmail(email: string): string {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail.endsWith('@rioeduca.net')) {
    throw new InvalidCredentialsError();
  }
  return normalizedEmail;
}

function validateCredentials(email: string, password: string): string {
  const normalizedEmail = normalizeInstitutionalEmail(email);
  if (password.length < 8) throw new InvalidCredentialsError();
  return normalizedEmail;
}

function validateStrongPassword(password: string): void {
  if (
    password.length < 8
    || !/[A-Z]/.test(password)
    || !/[a-z]/.test(password)
    || !/[0-9]/.test(password)
  ) {
    throw new InvalidCredentialsError('A nova senha não atende aos requisitos de segurança.');
  }
}

function validateRecoveryRedirect(redirectTo: string): string {
  let url: URL;
  try {
    url = new URL(redirectTo);
  } catch {
    throw new Error('O endereço de recuperação configurado é inválido.');
  }
  const localDevelopment = ['localhost', '127.0.0.1'].includes(url.hostname);
  const productionOrigin = 'https://demandas-rhsme-expansao.vercel.app';
  const authorizedOrigin = url.origin === productionOrigin
    || (localDevelopment && url.protocol === 'http:');
  if (url.pathname !== '/redefinir-senha' || url.search || url.hash || !authorizedOrigin) {
    throw new Error('O endereço de recuperação configurado é inválido.');
  }
  return url.toString();
}

export class SupabaseAuthService implements AuthService {
  constructor(private readonly client: SupabaseClient) {}

  private async toAppUser(user: User | null): Promise<AppUser | null> {
    if (!user?.email) return null;

    const { data, error } = await this.client
      .from('perfis_usuarios')
      .select('id,nome,email,setor,nivel,status')
      .eq('id', user.id)
      .single();
    const perfil = data as PerfilUsuario | null;

    if (error || !perfil || perfil.status !== 'ativo') {
      await this.client.auth.signOut({ scope: 'local' });
      throw new AccessPendingError();
    }

    return { id: user.id, email: user.email, perfil };
  }

  async restore(): Promise<AppUser | null> {
    const { data, error } = await this.client.auth.getSession();
    if (error || !data.session) return null;
    try {
      return await this.toAppUser(data.session.user);
    } catch (error) {
      if (error instanceof AccessPendingError) return null;
      throw error;
    }
  }

  async signIn(email: string, password: string): Promise<AppUser> {
    const normalizedEmail = validateCredentials(email, password);
    const { data, error } = await this.client.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });
    if (error || !data.user) throw new InvalidCredentialsError();
    const user = await this.toAppUser(data.user);
    if (!user) throw new InvalidCredentialsError();
    return user;
  }

  async requestAccess(email: string, password: string): Promise<void> {
    const normalizedEmail = validateCredentials(email, password);
    const { error } = await this.client.auth.signUp({
      email: normalizedEmail,
      password,
      options: { data: { nome: normalizedEmail.split('@')[0] } },
    });
    if (error) throw new InvalidCredentialsError(error.message);
  }

  async requestPasswordReset(email: string, redirectTo: string): Promise<void> {
    const normalizedEmail = normalizeInstitutionalEmail(email);
    const { error } = await this.client.auth.resetPasswordForEmail(normalizedEmail, {
      redirectTo: validateRecoveryRedirect(redirectTo),
    });
    if (error) throw new Error('Não foi possível enviar o link de recuperação agora. Tente novamente.');
  }

  async completePasswordReset(password: string): Promise<void> {
    validateStrongPassword(password);
    const { error } = await this.client.auth.updateUser({ password });
    if (error) throw new Error('Não foi possível redefinir a senha. Solicite um novo link.');
    const { error: signOutError } = await this.client.auth.signOut({ scope: 'local' });
    if (signOutError) {
      throw new Error(
        'A senha foi alterada, mas não foi possível encerrar a sessão de recuperação. Feche esta aba e entre novamente.',
      );
    }
  }

  async signOut(): Promise<void> {
    await this.client.auth.signOut({ scope: 'local' });
  }

  subscribe(
    onChange: (user: AppUser | null) => void,
    onPasswordRecovery?: () => void,
  ): () => void {
    const { data } = this.client.auth.onAuthStateChange((event: AuthChangeEvent, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        onPasswordRecovery?.();
        return;
      }
      void this.toAppUser(session?.user ?? null)
        .then(onChange)
        .catch(() => onChange(null));
    });
    return () => data.subscription.unsubscribe();
  }
}
