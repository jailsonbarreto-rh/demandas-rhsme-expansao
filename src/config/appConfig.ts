export type AppConfig =
  | { mode: 'local' }
  | { mode: 'supabase'; supabaseUrl: string; supabasePublishableKey: string }
  | { mode: 'invalid'; message: string };

type PublicEnv = Record<string, string | undefined>;

export function resolveAppConfig(env: PublicEnv): AppConfig {
  if (!env.VITE_APP_MODE || env.VITE_APP_MODE === 'local') return { mode: 'local' };
  if (env.VITE_APP_MODE !== 'supabase') {
    return { mode: 'invalid', message: `Modo de aplicação inválido: ${env.VITE_APP_MODE}.` };
  }

  const missing = [
    !env.VITE_SUPABASE_URL && 'VITE_SUPABASE_URL',
    !env.VITE_SUPABASE_PUBLISHABLE_KEY && 'VITE_SUPABASE_PUBLISHABLE_KEY',
  ].filter(Boolean);

  if (missing.length) {
    return { mode: 'invalid', message: `Configuração Supabase incompleta: ${missing.join(', ')}.` };
  }

  return {
    mode: 'supabase',
    supabaseUrl: env.VITE_SUPABASE_URL!,
    supabasePublishableKey: env.VITE_SUPABASE_PUBLISHABLE_KEY!,
  };
}
