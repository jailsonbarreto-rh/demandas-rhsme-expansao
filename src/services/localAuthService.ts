import type { AppUser, PerfilUsuario } from '../types';
import type { AuthService } from './contracts';
import { InvalidCredentialsError } from './errors';

const SESSION_KEY = 'demandas_user';

interface SessionStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

function validateCredentials(email: string, password: string): string {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail.endsWith('@rioeduca.net') || password.length < 8) {
    throw new InvalidCredentialsError();
  }
  return normalizedEmail;
}

function toLocalUser(email: string): AppUser {
  const perfil: PerfilUsuario = {
    id: `local:${email}`,
    nome: email.split('@')[0],
    email,
    setor: 'CTRH',
    nivel: 'editor',
    status: 'ativo',
  };
  return { id: perfil.id, email, perfil };
}

export class LocalAuthService implements AuthService {
  constructor(private readonly storage: SessionStorage) {}

  async restore(): Promise<AppUser | null> {
    const email = this.storage.getItem(SESSION_KEY);
    return email ? toLocalUser(email) : null;
  }

  async signIn(email: string, password: string): Promise<AppUser> {
    const normalizedEmail = validateCredentials(email, password);
    this.storage.setItem(SESSION_KEY, normalizedEmail);
    return toLocalUser(normalizedEmail);
  }

  async requestAccess(email: string, password: string): Promise<void> {
    validateCredentials(email, password);
  }

  async signOut(): Promise<void> {
    this.storage.removeItem(SESSION_KEY);
  }

  subscribe(): () => void {
    return () => undefined;
  }
}
