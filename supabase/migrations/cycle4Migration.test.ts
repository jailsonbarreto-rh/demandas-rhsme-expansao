import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const migrationsDir = dirname(fileURLToPath(import.meta.url));
const migrationFiles = [
  '20260722123530_cycle4_helpers_and_create_v2.sql',
  '20260722123627_cycle4_edit_demand.sql',
  '20260722123713_cycle4_progress_and_status.sql',
  '20260722123920_cycle4_admin_restore_and_grants.sql',
] as const;
const migrationPaths = migrationFiles.map((file) => resolve(migrationsDir, file));
const sql = migrationPaths
  .filter(existsSync)
  .map((path) => readFileSync(path, 'utf8'))
  .join('\n')
  .replace(/\r\n/g, '\n')
  .toLowerCase();

const requiredRpcs = [
  'criar_sme_demanda_v2',
  'editar_sme_demanda',
  'registrar_andamento_sme_demanda',
  'transicionar_status_sme_demanda',
  'excluir_sme_demanda',
  'restaurar_sme_demanda',
  'listar_perfis_minimos',
] as const;

describe('Ciclo 4 — mutações transacionais', () => {
  it('versiona as quatro migrations auditáveis registradas no banco remoto', () => {
    expect(migrationPaths.every(existsSync)).toBe(true);
  });

  it('cria todas as RPCs obrigatórias com autoria no banco', () => {
    for (const rpc of requiredRpcs) {
      expect(sql).toContain(`create or replace function public.${rpc}`);
    }

    expect(sql.match(/security definer/g)?.length).toBeGreaterThanOrEqual(requiredRpcs.length);
    expect(sql.match(/set search_path = ''/g)?.length).toBeGreaterThanOrEqual(requiredRpcs.length);
    expect(sql).toContain('auth.uid()');
  });

  it('preserva as APIs legadas e não executa exclusão física', () => {
    expect(sql).not.toMatch(/\bdelete\s+from\s+public\.sme_demandas\b/);
    expect(sql).not.toMatch(/\bdrop\s+function\s+public\.criar_sme_demanda\b/);
    expect(sql).not.toMatch(/\bdrop\s+function\s+public\.atualizar_status_sme_demanda\b/);
    expect(sql).not.toMatch(/revoke[\s\S]*public\.criar_sme_demanda\(/);
    expect(sql).not.toMatch(/revoke[\s\S]*public\.atualizar_status_sme_demanda\(/);
  });

  it('restringe as novas RPCs ao papel autenticado', () => {
    for (const rpc of requiredRpcs) {
      expect(sql).toMatch(new RegExp(`revoke all on function public\\.${rpc}\\([\\s\\S]*?from public, anon, authenticated;`));
      expect(sql).toMatch(new RegExp(`grant execute on function public\\.${rpc}\\([\\s\\S]*?to authenticated;`));
    }
  });
});
