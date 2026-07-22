import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const migrationsDir = dirname(fileURLToPath(import.meta.url));
const sql = readFileSync(
  resolve(migrationsDir, '20260722120000_block_physical_demand_delete.sql'),
  'utf8',
).replace(/\r\n/g, '\n').toLowerCase();

describe('Ciclo 4 — bloqueio da exclusão física', () => {
  it('revoga DELETE direto e remove a política física anterior', () => {
    expect(sql).toContain('revoke delete on table public.sme_demandas from authenticated');
    expect(sql).toContain('drop policy if exists "administradores ativos excluem demandas"');
  });

  it('não remove registros nem histórico durante o endurecimento', () => {
    expect(sql).not.toMatch(/\bdelete\s+from\b/);
    expect(sql).not.toMatch(/\btruncate\b/);
    expect(sql).not.toMatch(/\bdrop\s+table\b/);
  });
});
