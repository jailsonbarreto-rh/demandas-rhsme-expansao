import type { SupabaseClient, User } from '@supabase/supabase-js';
import type { AppUser, PerfilUsuario } from '../types';
import type { AuthService } from './contracts';
import { AccessPendingError, InvalidCredentialsError } from './errors';

function validateCredentials(email: string, password: string): string {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail.endsWith('@rioeduca.net') || password.length < 8) {
    throw new InvalidCredentialsError();
  }
  return normalizedEmail;
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
      await this.client.auth.signOut();
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

  async signOut(): Promise<void> {
    await this.client.auth.signOut();
  }

  subscribe(onChange: (user: AppUser | null) => void): () => void {
    const { data } = this.client.auth.onAuthStateChange((_event, session) => {
      void this.toAppUser(session?.user ?? null)
        .then(onChange)
        .catch(() => onChange(null));
    });
    return () => data.subscription.unsubscribe();
  }
}
