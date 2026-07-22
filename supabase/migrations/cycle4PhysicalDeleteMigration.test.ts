import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const migrationsDir = dirname(fileURLToPath(import.meta.url));
const sql = readFileSync(
  resolve(migrationsDir, '20260722123935_cycle4_block_direct_writes.sql'),
  'utf8',
).replace(/\r\n/g, '\n').toLowerCase();

describe('Ciclo 4 — bloqueio de escritas diretas', () => {
  it('revoga UPDATE e DELETE diretos e remove as políticas físicas anteriores', () => {
    expect(sql).toMatch(/revoke update \([\s\S]*?\) on table public\.sme_demandas from authenticated;/);
    expect(sql).toContain('revoke delete on table public.sme_demandas from authenticated');
    expect(sql).toContain('drop policy if exists "editores atualizam demandas"');
    expect(sql).toContain('drop policy if exists "administradores ativos excluem demandas"');
  });

  it('não altera nem remove registros durante o endurecimento', () => {
    expect(sql).not.toMatch(/\bupdate\s+public\.sme_demandas\b/);
    expect(sql).not.toMatch(/\bdelete\s+from\b/);
    expect(sql).not.toMatch(/\btruncate\b/);
    expect(sql).not.toMatch(/\bdrop\s+table\b/);
  });
});
