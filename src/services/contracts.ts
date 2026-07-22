import type {
  AppUser,
  ComentarioHistorico,
  CreateDemandaInput,
  DeleteDemandaInput,
  Demanda,
  EditDemandaInput,
  LegacyCreateDemandaInput,
  PerfilMinimo,
  PerfilUsuario,
  ProgressInput,
  RestoreDemandaInput,
  StatusTransitionInput,
} from '../types';

export interface AppData {
  demandas: Demanda[];
  historico: ComentarioHistorico[];
}

export interface DemandasRepository {
  load(): Promise<AppData>;
  loadTrash(): Promise<Demanda[]>;
  create(input: CreateDemandaInput | LegacyCreateDemandaInput): Promise<void>;
  edit(id: number, input: EditDemandaInput): Promise<void>;
  registerProgress(id: number, input: ProgressInput): Promise<void>;
  transitionStatus(id: number, input: StatusTransitionInput): Promise<void>;
  deleteLogically(id: number, input: DeleteDemandaInput): Promise<void>;
  restore(id: number, input: RestoreDemandaInput): Promise<void>;
  subscribe(onRemoteChange: () => void): () => void;

  /** @deprecated Compatibilidade temporária até a migração completa da interface. */
  update(id: number, changes: Partial<Demanda>): Promise<void>;
  /** @deprecated Compatibilidade temporária até a migração completa da interface. */
  updateStatus(
    id: number,
    status: Demanda['status'],
    comentario: string,
  ): Promise<void>;
  /** @deprecated Exclusão exige motivo explícito; use deleteLogically. */
  delete(id: number): Promise<void>;
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
  listMinimal(): Promise<PerfilMinimo[]>;
  updateAccess(
    id: string,
    patch: Partial<Pick<PerfilUsuario, 'nivel' | 'status' | 'setor'>>,
  ): Promise<void>;
}
