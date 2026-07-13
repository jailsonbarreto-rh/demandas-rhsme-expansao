export type AppConfig =
  | { mode: 'local' }
  | { mode: 'supabase'; supabaseUrl: string; supabasePublishableKey: string }
  | { mode: 'invalid'; message: string };

type PublicEnv = Record<string, string | undefined>;

type CredentialSource = {
  url?: string;
  key?: string;
  urlName: string;
  keyName: string;
};

function resolveCredentials(env: PublicEnv, explicitMode?: string): CredentialSource {
  if (env.VITE_SUPABASE_URL || env.VITE_SUPABASE_PUBLISHABLE_KEY) {
    return {
      url: env.VITE_SUPABASE_URL,
      key: env.VITE_SUPABASE_PUBLISHABLE_KEY,
      urlName: 'VITE_SUPABASE_URL',
      keyName: 'VITE_SUPABASE_PUBLISHABLE_KEY',
    };
  }

  if (env.SUPABASE_URL || env.SUPABASE_PUBLISHABLE_KEY) {
    return {
      url: env.SUPABASE_URL,
      key: env.SUPABASE_PUBLISHABLE_KEY,
      urlName: 'SUPABASE_URL',
      keyName: 'SUPABASE_PUBLISHABLE_KEY',
    };
  }

  if (env.NEXT_PUBLIC_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    return {
      url: env.NEXT_PUBLIC_SUPABASE_URL,
      key: env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
      urlName: 'NEXT_PUBLIC_SUPABASE_URL',
      keyName: 'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
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
  const explicitMode = env.VITE_APP_MODE;

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
