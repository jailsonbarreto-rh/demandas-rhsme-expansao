import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../lib/database.types';
import type { PerfilUsuario } from '../types';
import type { ProfilesService } from './contracts';

export class SupabaseProfilesService implements ProfilesService {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async list(): Promise<PerfilUsuario[]> {
    const { data, error } = await this.client
      .from('perfis_usuarios')
      .select('id,nome,email,setor,nivel,status')
      .order('nome', { ascending: true });
    if (error) throw error;
    return data ?? [];
  }

  async updateAccess(
    id: string,
    patch: Partial<Pick<PerfilUsuario, 'nivel' | 'status' | 'setor'>>,
  ): Promise<void> {
    const allowed: Partial<Pick<PerfilUsuario, 'nivel' | 'status' | 'setor'>> = {};
    if (patch.nivel !== undefined) allowed.nivel = patch.nivel;
    if (patch.status !== undefined) allowed.status = patch.status;
    if (patch.setor !== undefined) allowed.setor = patch.setor;
    if (Object.keys(allowed).length === 0) return;
    const { error } = await this.client.from('perfis_usuarios').update(allowed).eq('id', id);
    if (error) throw error;
  }
}
