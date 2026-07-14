export type AppConfig =
  | { mode: 'local' }
  | { mode: 'supabase'; supabaseUrl: string; supabasePublishableKey: string }
  | { mode: 'invalid'; message: string };

type PublicEnv = Record<string, string | boolean | undefined>;

type CredentialSource = {
  url?: string;
  key?: string;
  urlName: string;
  keyName: string;
};

// A URL e a publishable key são credenciais públicas destinadas ao cliente web.
// Este fallback garante que um build de produção nunca opere silenciosamente em LocalStorage
// quando a sincronização de variáveis da hospedagem estiver ausente.
const PRODUCTION_SUPABASE_URL = 'https://kdhekkzwcokfrpcrsllr.supabase.co';
const PRODUCTION_SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_8a_9nkPr3eo7LlrWybgNrw_ZPRrAjCy';

function firstDefined(...values: Array<string | boolean | undefined>): string | undefined {
  return values.find((value): value is string => typeof value === 'string' && value.length > 0);
}

function resolveCredentials(env: PublicEnv, explicitMode?: string): CredentialSource {
  const viteKey = firstDefined(env.VITE_SUPABASE_PUBLISHABLE_KEY, env.VITE_SUPABASE_ANON_KEY);
  if (env.VITE_SUPABASE_URL || viteKey) {
    return {
      url: firstDefined(env.VITE_SUPABASE_URL),
      key: viteKey,
      urlName: 'VITE_SUPABASE_URL',
      keyName: 'VITE_SUPABASE_PUBLISHABLE_KEY',
    };
  }

  const integrationKey = firstDefined(env.SUPABASE_PUBLISHABLE_KEY, env.SUPABASE_ANON_KEY);
  if (env.SUPABASE_URL || integrationKey) {
    return {
      url: firstDefined(env.SUPABASE_URL),
      key: integrationKey,
      urlName: 'SUPABASE_URL',
      keyName: 'SUPABASE_PUBLISHABLE_KEY',
    };
  }

  const nextPublicKey = firstDefined(
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
  if (env.NEXT_PUBLIC_SUPABASE_URL || nextPublicKey) {
    return {
      url: firstDefined(env.NEXT_PUBLIC_SUPABASE_URL),
      key: nextPublicKey,
      urlName: 'NEXT_PUBLIC_SUPABASE_URL',
      keyName: 'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
    };
  }

  if (env.PROD === true) {
    return {
      url: PRODUCTION_SUPABASE_URL,
      key: PRODUCTION_SUPABASE_PUBLISHABLE_KEY,
      urlName: 'configuração pública de produção',
      keyName: 'publishable key pública de produção',
    };
  }

  return {
    urlName: explicitMode === 'supabase' ? 'VITE_SUPABASE_URL' : 'SUPABASE_URL',
    keyName: explicitMode === 'supabase'
      ? 'VITE_SUPABASE_PUBLISHABLE_KEY'
      : 'SUPABASE_PUBLISHABLE_KEY',
  };
}

export function resolveAppConfig(env: PublicEnv): AppConfig {
  const explicitMode = firstDefined(env.VITE_APP_MODE);

  if (explicitMode === 'local') return { mode: 'local' };
  if (explicitMode && explicitMode !== 'supabase') {
    return { mode: 'invalid', message: `Modo de aplicação inválido: ${explicitMode}.` };
  }

  const credentials = resolveCredentials(env, explicitMode);
  const hasAnyCredential = Boolean(credentials.url || credentials.key);

  if (!explicitMode && !hasAnyCredential) return { mode: 'local' };

  const missing = [
    !credentials.url && credentials.urlName,
    !credentials.key && credentials.keyName,
  ].filter((value): value is string => Boolean(value));

  if (missing.length) {
    return { mode: 'invalid', message: `Configuração Supabase incompleta: ${missing.join(', ')}.` };
  }

  return {
    mode: 'supabase',
    supabaseUrl: credentials.url!,
    supabasePublishableKey: credentials.key!,
  };
}
