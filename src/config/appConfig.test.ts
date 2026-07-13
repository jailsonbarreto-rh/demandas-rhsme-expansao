import { describe, expect, it } from 'vitest';
import { resolveAppConfig } from './appConfig';

describe('resolveAppConfig', () => {
  it('mantém modo local quando não há configuração', () => {
    expect(resolveAppConfig({})).toEqual({ mode: 'local' });
  });

  it('retorna configuração Supabase completa com variáveis Vite explícitas', () => {
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

  it('ativa Supabase automaticamente com as variáveis sincronizadas pela integração Vercel', () => {
    expect(resolveAppConfig({
      SUPABASE_URL: 'https://example.supabase.co',
      SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_example',
    })).toEqual({
      mode: 'supabase',
      supabaseUrl: 'https://example.supabase.co',
      supabasePublishableKey: 'sb_publishable_example',
    });
  });

  it('aceita as variáveis públicas alternativas da integração', () => {
    expect(resolveAppConfig({
      NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_example',
    })).toEqual({
      mode: 'supabase',
      supabaseUrl: 'https://example.supabase.co',
      supabasePublishableKey: 'sb_publishable_example',
    });
  });

  it('mantém rollback local explícito mesmo quando a integração está configurada', () => {
    expect(resolveAppConfig({
      VITE_APP_MODE: 'local',
      SUPABASE_URL: 'https://example.supabase.co',
      SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_example',
    })).toEqual({ mode: 'local' });
  });

  it('não faz fallback silencioso quando Supabase explícito foi solicitado sem credenciais', () => {
    expect(resolveAppConfig({ VITE_APP_MODE: 'supabase' })).toEqual({
      mode: 'invalid',
      message: 'Configuração Supabase incompleta: VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY.',
    });
  });

  it('não aceita configuração automática parcial da integração', () => {
    expect(resolveAppConfig({
      SUPABASE_URL: 'https://example.supabase.co',
    })).toEqual({
      mode: 'invalid',
      message: 'Configuração Supabase incompleta: SUPABASE_PUBLISHABLE_KEY.',
    });
  });
});
