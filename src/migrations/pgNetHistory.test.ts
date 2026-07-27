import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const migrationsDirectory = resolve(process.cwd(), 'supabase/migrations');

const expectedPgNetHistory = [
  {
    file: '20260723231805_enable_pg_net_for_r3_user_provisioning.sql',
    sql: 'create extension if not exists pg_net with schema extensions;',
  },
  {
    file: '20260723232308_remove_pg_net_after_r3_user_provisioning.sql',
    sql: 'drop extension if exists pg_net;',
  },
] as const;

function normalizeSql(value: string): string {
  return value.replace(/\r\n/g, '\n').trim();
}

describe('histórico remoto temporário de pg_net', () => {
  it('mantém no Git os dois arquivos homônimos registrados no Supabase', () => {
    const missingFiles = expectedPgNetHistory
      .map(({ file }) => file)
      .filter((file) => !existsSync(resolve(migrationsDirectory, file)));

    expect(missingFiles).toEqual([]);
  });

  it('preserva exatamente os statements registrados remotamente', () => {
    for (const migration of expectedPgNetHistory) {
      const filePath = resolve(migrationsDirectory, migration.file);
      expect(existsSync(filePath), `${migration.file} precisa existir antes de validar seu conteúdo`).toBe(true);
      expect(normalizeSql(readFileSync(filePath, 'utf8'))).toBe(migration.sql);
    }
  });

  it('termina a sequência de migrations sem pg_net instalado', () => {
    const pgNetMigrations = readdirSync(migrationsDirectory)
      .filter((file) => file.endsWith('.sql'))
      .sort()
      .map((file) => ({ file, sql: normalizeSql(readFileSync(resolve(migrationsDirectory, file), 'utf8')) }))
      .filter(({ sql }) => /\bpg_net\b/i.test(sql));

    expect(pgNetMigrations.map(({ file }) => file)).toEqual(expectedPgNetHistory.map(({ file }) => file));
    expect(pgNetMigrations.at(-1)?.sql).toBe('drop extension if exists pg_net;');
  });
});
