import type {
  AppUser,
  ComentarioHistorico,
  CreateDemandaInput,
  DeleteDemandaInput,
  Demanda,
  EditDemandaInput,
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
  create(input: CreateDemandaInput): Promise<void>;
  edit(id: number, input: EditDemandaInput): Promise<void>;
  registerProgress(id: number, input: ProgressInput): Promise<void>;
  transitionStatus(id: number, input: StatusTransitionInput): Promise<void>;
  deleteLogically(id: number, input: DeleteDemandaInput): Promise<void>;
  restore(id: number, input: RestoreDemandaInput): Promise<void>;
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
  listMinimal(): Promise<PerfilMinimo[]>;
  updateAccess(
    id: string,
    patch: Partial<Pick<PerfilUsuario, 'nivel' | 'status' | 'setor'>>,
  ): Promise<void>;
}
