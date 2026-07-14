import type { AppConfig } from '../config/appConfig';
import { initialDemandas } from '../data/initialDemandas';
import { getSupabaseClient } from '../lib/supabase';
import type { AuthService, DemandasRepository, ProfilesService } from './contracts';
import { LocalAuthService } from './localAuthService';
import { LocalDemandasRepository } from './localDemandasRepository';
import { SupabaseAuthService } from './supabaseAuthService';
import { SupabaseDemandasRepository } from './supabaseDemandasRepository';
import { SupabaseProfilesService } from './supabaseProfilesService';

export interface AppServices {
  mode: 'local' | 'supabase';
  auth: AuthService;
  demandas: DemandasRepository;
  profiles: ProfilesService;
}

export class ConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigurationError';
  }
}

const localProfilesService: ProfilesService = {
  list: async () => [],
  updateAccess: async () => undefined,
};

export function createAppServices(config: AppConfig, storage: Storage = window.localStorage): AppServices {
  if (config.mode === 'invalid') throw new ConfigurationError(config.message);
  if (config.mode === 'local') {
    return {
      mode: 'local',
      auth: new LocalAuthService(storage),
      demandas: new LocalDemandasRepository(storage, initialDemandas),
      profiles: localProfilesService,
    };
  }

  const client = getSupabaseClient(config);
  return {
    mode: 'supabase',
    auth: new SupabaseAuthService(client),
    demandas: new SupabaseDemandasRepository(client),
    profiles: new SupabaseProfilesService(client),
  };
}
