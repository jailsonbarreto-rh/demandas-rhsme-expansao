import { describe, expect, it } from 'vitest';
import { resolveAppConfig } from './appConfig';

describe('resolveAppConfig', () => {
  it('mantém modo local no desenvolvimento quando não há configuração', () => {
    expect(resolveAppConfig({})).toEqual({ mode: 'local' });
  });

  it('ativa o projeto Supabase oficial no build de produção mesmo sem variáveis da hospedagem', () => {
    const config = resolveAppConfig({ PROD: true });

    expect(config).toMatchObject({
      mode: 'supabase',
      supabaseUrl: 'https://kdhekkzwcokfrpcrsllr.supabase.co',
    });
    expect(config.mode === 'supabase' && config.supabasePublishableKey).toMatch(/^sb_publishable_/);
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

  it('aceita VITE_SUPABASE_ANON_KEY para compatibilidade', () => {
    expect(resolveAppConfig({
      VITE_SUPABASE_URL: 'https://example.supabase.co',
      VITE_SUPABASE_ANON_KEY: 'legacy-anon-example',
    })).toEqual({
      mode: 'supabase',
      supabaseUrl: 'https://example.supabase.co',
      supabasePublishableKey: 'legacy-anon-example',
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

  it('aceita SUPABASE_ANON_KEY usada por integrações legadas', () => {
    expect(resolveAppConfig({
      SUPABASE_URL: 'https://example.supabase.co',
      SUPABASE_ANON_KEY: 'legacy-anon-example',
    })).toEqual({
      mode: 'supabase',
      supabaseUrl: 'https://example.supabase.co',
      supabasePublishableKey: 'legacy-anon-example',
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

  it('bloqueia modo local quando PROD é verdadeiro', () => {
    expect(resolveAppConfig({
      PROD: true,
      VITE_APP_MODE: 'local',
      SUPABASE_URL: 'https://example.supabase.co',
      SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_example',
    })).toEqual({
      mode: 'invalid',
      message: 'O modo local não está disponível em produção.',
    });
  });

  it('não faz fallback silencioso quando Supabase explícito foi solicitado sem credenciais no desenvolvimento', () => {
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
