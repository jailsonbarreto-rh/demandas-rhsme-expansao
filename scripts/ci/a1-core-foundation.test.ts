import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const repositoryRoot = resolve(import.meta.dirname, '../..');

function readRepositoryFile(path: string): string {
  return readFileSync(resolve(repositoryRoot, path), 'utf8').replace(/\r\n/g, '\n');
}

function readMigrationChain(): string {
  const migrationsDirectory = resolve(repositoryRoot, 'supabase/migrations');
  return readdirSync(migrationsDirectory)
    .filter((name) => /^\d{14}_.+\.sql$/.test(name))
    .sort()
    .map((name) => readFileSync(resolve(migrationsDirectory, name), 'utf8'))
    .join('\n')
    .replace(/\r\n/g, '\n')
    .toLowerCase();
}

function statementAt(sql: string, start: number): string {
  if (start < 0) return '';
  const end = sql.indexOf(';', start);
  return sql.slice(start, end < 0 ? sql.length : end + 1);
}

describe('A1-Core — fundação residual', () => {
  it('descobre migrations posteriores sem enumerar releases no workflow', () => {
    const workflow = readRepositoryFile('.github/workflows/supabase-local-migrations.yml');

    expect(workflow).toContain('stage-supabase-migrations.mjs stage');
    expect(workflow).toContain('stage-supabase-migrations.mjs restore');
    expect(workflow).not.toMatch(/^\s+(?:CYCLE4_|E1A_|R3_RESPONSAVEIS|E4_SECURITY)/m);
  });

  it('retira tipos, adaptadores e chamadas operacionais legadas do cliente', () => {
    const types = readRepositoryFile('src/types.ts');
    const contracts = readRepositoryFile('src/services/contracts.ts');
    const hook = readRepositoryFile('src/hooks/useDemandasData.ts');
    const supabaseRepository = readRepositoryFile('src/services/supabaseDemandasRepository.ts');
    const localRepository = readRepositoryFile('src/services/localDemandasRepository.ts');
    const demoData = readRepositoryFile('src/data/demoDemandas.ts');
    const expandedFixtures = readRepositoryFile('src/test/expandedFixtures.ts');

    expect(types).not.toContain('LegacyCreateDemandaInput');
    expect(contracts).not.toContain('LegacyCreateDemandaInput');
    expect(contracts).not.toMatch(/^\s*update\(/m);
    expect(contracts).not.toMatch(/^\s*updateStatus\(/m);
    expect(contracts).not.toMatch(/^\s*delete\(/m);
    expect(hook).not.toContain('LegacyCreateDemandaInput');
    expect(hook).not.toMatch(/^\s*update:/m);
    expect(hook).not.toMatch(/^\s*updateStatus:/m);
    expect(hook).not.toMatch(/^\s*delete:/m);
    expect(supabaseRepository).not.toContain(".rpc('criar_sme_demanda'");
    expect(supabaseRepository).not.toContain(".rpc('atualizar_status_sme_demanda'");
    expect(localRepository).not.toContain('LegacyCreateDemandaInput');
    expect(localRepository).not.toContain('isExpandedCreateInput');
    expect(demoData).not.toContain('LegacyCreateDemandaInput');
    expect(expandedFixtures).not.toContain('LegacyCreateDemandaInput');
  });

  it('deixa as RPCs obsoletas sem execução para papéis expostos', () => {
    const sql = readMigrationChain();
    const createGrant = sql.lastIndexOf(
      'grant execute on function public.criar_sme_demanda(',
    );
    const createRevoke = sql.lastIndexOf(
      'revoke all on function public.criar_sme_demanda(',
    );
    const statusGrant = sql.lastIndexOf(
      'grant execute on function public.atualizar_status_sme_demanda(',
    );
    const statusRevoke = sql.lastIndexOf(
      'revoke all on function public.atualizar_status_sme_demanda(',
    );

    expect(createRevoke).toBeGreaterThan(createGrant);
    expect(statusRevoke).toBeGreaterThan(statusGrant);
    expect(statementAt(sql, createRevoke)).toContain(
      'from public, anon, authenticated, service_role;',
    );
    expect(statementAt(sql, statusRevoke)).toContain(
      'from public, anon, authenticated, service_role;',
    );
  });
});
