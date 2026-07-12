import { describe, expect, it } from 'vitest';
import { resolveAppConfig } from './appConfig';

describe('resolveAppConfig', () => {
  it('mantém modo local quando não há configuração', () => {
    expect(resolveAppConfig({})).toEqual({ mode: 'local' });
  });

  it('retorna configuração Supabase completa', () => {
    expect(resolveAppConfig({
      VITE_APP_MODE: 'supabase',
      VITE_SUPABASE_URL: 'https://example.supabase.co',
      VITE_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_example',
    })).toEqual({
      mode: 'supabase',
      supabaseUrl: 'https://example.supabase.co',
      supabasePublishableKey: 'sb_publishable_example',
    });
  });

  it('não faz fallback silencioso quando Supabase foi solicitado sem credenciais', () => {
    expect(resolveAppConfig({ VITE_APP_MODE: 'supabase' })).toEqual({
      mode: 'invalid',
      message: 'Configuração Supabase incompleta: VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY.',
    });
  });
});
