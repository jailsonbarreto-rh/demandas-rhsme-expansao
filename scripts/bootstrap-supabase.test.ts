import { describe, expect, it } from 'vitest';
import { resolve } from 'node:path';
import { getBootstrapUsers, loadInitialDemandas, readBootstrapEnv } from './bootstrap-supabase.mjs';

describe('bootstrap Supabase', () => {
  it('define os dois administradores e o perfil de teste editor', () => {
    expect(getBootstrapUsers()).toEqual([
      expect.objectContaining({ email: 'wilson.peixoto@rioeduca.net', nivel: 'administrador' }),
      expect.objectContaining({ email: 'jailsonbsilva@rioeduca.net', nivel: 'administrador' }),
      expect.objectContaining({ email: 'teste@rioeduca.net', nivel: 'editor' }),
    ]);
  });

  it('exige todas as variáveis privadas do processo', () => {
    expect(() => readBootstrapEnv({})).toThrow('SUPABASE_URL');
    expect(() => readBootstrapEnv({ SUPABASE_URL: 'url' })).toThrow('SUPABASE_SECRET_KEY');
    expect(() => readBootstrapEnv({ SUPABASE_URL: 'url', SUPABASE_SECRET_KEY: 'secret' }))
      .toThrow('BOOTSTRAP_PASSWORD');
  });

  it('não modifica nem expõe os valores recebidos', () => {
    const env = {
      SUPABASE_URL: 'https://example.supabase.co',
      SUPABASE_SECRET_KEY: 'secret-value',
      BOOTSTRAP_PASSWORD: 'temporary-value',
    };
    expect(readBootstrapEnv(env)).toEqual(env);
  });

  it('carrega as 50 demandas iniciais usadas pelo modo local', () => {
    const demandas = loadInitialDemandas(resolve(process.cwd(), 'src/data/initialDemandas.ts'));
    expect(demandas).toHaveLength(50);
    expect(demandas[0]).toEqual(expect.objectContaining({ numero: expect.any(String) }));
  });
});
