import { readFileSync, readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const migrationsDir = dirname(fileURLToPath(import.meta.url));
const migrationFiles = readdirSync(migrationsDir)
  .filter((file) => file.endsWith('_r5_1_disable_product_restore.sql'));
const migrationSql = migrationFiles
  .map((file) => readFileSync(resolve(migrationsDir, file), 'utf8'))
  .join('\n')
  .replace(/\r\n/g, '\n')
  .toLowerCase();
const cycle4Sql = readFileSync(
  resolve(migrationsDir, '20260722123920_cycle4_admin_restore_and_grants.sql'),
  'utf8',
).replace(/\r\n/g, '\n').toLowerCase();

describe('R5-1 — lixeira administrativa sem restauração de produto', () => {
  it('versiona uma migration aditiva específica', () => {
    expect(migrationFiles).toHaveLength(1);
  });

  it('preserva a função somente para recuperação técnica fora da API', () => {
    expect(migrationSql).toContain('revoke all on function public.restaurar_sme_demanda(bigint, text)');
    expect(migrationSql).toContain('from public, anon, authenticated, service_role;');
    expect(migrationSql).toContain('recuperação técnica excepcional');
    expect(migrationSql).not.toMatch(/drop\s+function[\s\S]*restaurar_sme_demanda/);
    expect(migrationSql).not.toMatch(/grant\s+execute[\s\S]*restaurar_sme_demanda/);
  });

  it('mantém a exclusão lógica restrita internamente a administrador', () => {
    expect(cycle4Sql).toMatch(/function public\.excluir_sme_demanda[\s\S]*if not private\.is_admin\(\)/);
    expect(cycle4Sql).toMatch(/grant execute on function public\.excluir_sme_demanda\(bigint, text\)[\s\S]*to authenticated;/);
    expect(cycle4Sql).not.toMatch(/delete\s+from\s+public\.sme_demandas/);
  });
});
