import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('.env.example', () => {
  it('mantém local como padrão e não contém segredo', () => {
    const env = readFileSync(resolve(process.cwd(), '.env.example'), 'utf8');
    expect(env).toContain('VITE_APP_MODE=local');
    expect(env).toContain('VITE_SUPABASE_URL=');
    expect(env).toContain('VITE_SUPABASE_PUBLISHABLE_KEY=');
    expect(env).not.toMatch(/service_role|SUPABASE_SECRET_KEY/i);
  });
});
