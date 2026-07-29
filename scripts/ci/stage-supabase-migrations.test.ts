import { mkdtemp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  buildStagedMigrationManifest,
  restoreSupabaseMigrations,
  stageSupabaseMigrations,
} from './stage-supabase-migrations.mjs';

const temporaryDirectories: string[] = [];
const boundary = '20260301000000_cycle3.sql';

async function createFixture(files) {
  const root = await mkdtemp(resolve(tmpdir(), 'stage-migrations-'));
  temporaryDirectories.push(root);
  const migrationsDirectory = resolve(root, 'migrations');
  const stagingDirectory = resolve(root, 'staging');
  const manifestPath = resolve(root, 'manifest.json');
  await mkdir(migrationsDirectory);
  for (const file of files) {
    await writeFile(resolve(migrationsDirectory, file), `-- ${file}\n`);
  }
  return { root, migrationsDirectory, stagingDirectory, manifestPath };
}

afterEach(async () => {
  await Promise.all(temporaryDirectories.splice(0).map(
    (directory) => rm(directory, { recursive: true, force: true }),
  ));
});

describe('stage-supabase-migrations', () => {
  it('classifica automaticamente uma migration futura no estágio posterior', async () => {
    const files = [
      '20260101000000_base.sql',
      '20260201000000_pre_cycle3.sql',
      boundary,
      '20260401000000_cycle4.sql',
      '20990101000000_future_release.sql',
    ];
    const paths = await createFixture(files);

    const manifest = await stageSupabaseMigrations({ ...paths, boundary });

    expect(manifest).toEqual({
      boundary,
      baseline: files.slice(0, 2),
      cycle3: boundary,
      postCycle3: files.slice(3),
      all: files,
    });
    expect(await readdir(paths.migrationsDirectory)).toEqual(files.slice(0, 2));
    expect((await readdir(paths.stagingDirectory)).sort()).toEqual(files.slice(2));
    expect(JSON.parse(await readFile(paths.manifestPath, 'utf8'))).toEqual(manifest);
  });

  it('restaura Ciclo 3 e cadeia posterior na ordem canônica', async () => {
    const files = [
      '20260101000000_base.sql',
      boundary,
      '20260401000000_cycle4.sql',
      '20260501000000_r3.sql',
    ];
    const paths = await createFixture(files);
    await stageSupabaseMigrations({ ...paths, boundary });

    await restoreSupabaseMigrations({ ...paths, stage: 'cycle3' });
    expect((await readdir(paths.migrationsDirectory)).sort()).toEqual(files.slice(0, 2));

    await restoreSupabaseMigrations({ ...paths, stage: 'postCycle3' });
    expect((await readdir(paths.migrationsDirectory)).sort()).toEqual(files);
    expect(await readdir(paths.stagingDirectory)).toEqual([]);
  });

  it('recusa fronteira com path traversal e versão duplicada', async () => {
    expect(() => buildStagedMigrationManifest(
      [boundary],
      `../${boundary}`,
    )).toThrow('Fronteira inválida');

    const files = [
      boundary,
      '20260401000000_primeira.sql',
      '20260401000000_duplicada.sql',
    ];
    const paths = await createFixture(files);
    await expect(stageSupabaseMigrations({ ...paths, boundary }))
      .rejects.toThrow('Versão de migration duplicada');
  });

  it('recusa arquivo SQL inesperado fora do manifesto', async () => {
    const files = [boundary, '20260401000000_cycle4.sql'];
    const paths = await createFixture(files);
    await stageSupabaseMigrations({ ...paths, boundary });
    await writeFile(
      resolve(paths.stagingDirectory, '20260501000000_intrusa.sql'),
      '-- intrusa\n',
    );

    await expect(restoreSupabaseMigrations({ ...paths, stage: 'cycle3' }))
      .rejects.toThrow('árvore atual não corresponde integralmente ao manifesto');
  });
});
