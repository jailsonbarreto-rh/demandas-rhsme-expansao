import type {
  AppUser,
  ComentarioHistorico,
  Demanda,
  PerfilUsuario,
} from '../types';

export interface AppData {
  demandas: Demanda[];
  historico: ComentarioHistorico[];
}

export interface DemandasRepository {
  load(): Promise<AppData>;
  create(input: Omit<Demanda, 'id'>): Promise<void>;
  update(id: number, changes: Partial<Demanda>): Promise<void>;
  updateStatus(
    id: number,
    status: Demanda['status'],
    comentario: string,
  ): Promise<void>;
  delete(id: number): Promise<void>;
  subscribe(onRemoteChange: () => void): () => void;
}

export interface AuthService {
  restore(): Promise<AppUser | null>;
  signIn(email: string, password: string): Promise<AppUser>;
  requestAccess(email: string, password: string): Promise<void>;
  signOut(): Promise<void>;
  subscribe(onChange: (user: AppUser | null) => void): () => void;
}

export interface ProfilesService {
  list(): Promise<PerfilUsuario[]>;
  updateAccess(
    id: string,
    patch: Partial<Pick<PerfilUsuario, 'nivel' | 'status' | 'setor'>>,
  ): Promise<void>;
}
