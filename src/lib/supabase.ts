import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { AppConfig } from '../config/appConfig';
import type { Database } from './database.types';

export type SupabaseAppConfig = Extract<AppConfig, { mode: 'supabase' }>;

let client: SupabaseClient<Database> | undefined;

export function getSupabaseClient(config: SupabaseAppConfig): SupabaseClient<Database> {
  client ??= createClient<Database>(config.supabaseUrl, config.supabasePublishableKey);
  return client;
}
