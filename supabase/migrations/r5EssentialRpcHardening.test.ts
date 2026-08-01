import { readFileSync, readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const migrationsDir = dirname(fileURLToPath(import.meta.url));
const migrationFiles = readdirSync(migrationsDir)
  .filter((file) => file.endsWith('_r5_essential_harden_pre_r4_progress_status.sql'));
const migrationSql = migrationFiles
  .map((file) => readFileSync(resolve(migrationsDir, file), 'utf8'))
  .join('\n')
  .replace(/\r\n/g, '\n')
  .toLowerCase();

describe('R5 Essencial — endurecimento das RPCs anteriores ao R4', () => {
  it('versiona uma única migration de reconciliação', () => {
    expect(migrationFiles).toHaveLength(1);
  });

  it('faz os contratos anteriores delegarem às regras autoritativas do R4', () => {
    expect(migrationSql.match(/select public\.registrar_andamento_sme_demanda_r4\(/g)).toHaveLength(1);
    expect(migrationSql.match(/select public\.transicionar_status_sme_demanda_r4\(/g)).toHaveLength(1);
    expect(migrationSql.match(/\n\s*''\n/g)).toHaveLength(2);
  });

  it('mantém execução somente para authenticated', () => {
    expect(migrationSql).toContain('from public, anon, authenticated, service_role;');
    expect(migrationSql.match(/grant execute on function/g)).toHaveLength(2);
    expect(migrationSql.match(/to authenticated;/g)).toHaveLength(2);
    expect(migrationSql).not.toMatch(/grant execute[\s\S]*to service_role;/i);
  });
});
