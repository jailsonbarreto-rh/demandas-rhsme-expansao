import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { AppConfig } from '../config/appConfig';

export type SupabaseAppConfig = Extract<AppConfig, { mode: 'supabase' }>;

let client: SupabaseClient | undefined;

export function getSupabaseClient(config: SupabaseAppConfig): SupabaseClient {
  client ??= createClient(config.supabaseUrl, config.supabasePublishableKey);
  return client;
}
