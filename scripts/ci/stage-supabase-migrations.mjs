#!/usr/bin/env node

import {
  constants,
  copyFile,
  mkdir,
  readFile,
  readdir,
  rename,
  rm,
  writeFile,
} from 'node:fs/promises';
import { basename, dirname, relative, resolve, sep } from 'node:path';
import { pathToFileURL } from 'node:url';

const MIGRATION_NAME = /^(\d{14})_[A-Za-z0-9][A-Za-z0-9._-]*\.sql$/;
const MANIFEST_KEYS = ['boundary', 'baseline', 'cycle3', 'postCycle3', 'all'];
const RESTORE_STAGES = new Set(['cycle3', 'postCycle3']);

function validateMigrationName(name, label = 'migration') {
  if (basename(name) !== name || !MIGRATION_NAME.test(name)) {
    throw new Error(`${label} inválida: ${name}`);
  }
  return name;
}

function assertSeparateDirectories(migrationsDirectory, stagingDirectory) {
  const migrations = resolve(migrationsDirectory);
  const staging = resolve(stagingDirectory);
  const migrationsToStaging = relative(migrations, staging);
  const stagingToMigrations = relative(staging, migrations);

  if (
    migrations === staging
    || (!migrationsToStaging.startsWith(`..${sep}`) && migrationsToStaging !== '..')
    || (!stagingToMigrations.startsWith(`..${sep}`) && stagingToMigrations !== '..')
  ) {
    throw new Error('Os diretórios de migrations e staging devem ser separados.');
  }
}

async function listMigrationFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const migrations = [];

  for (const entry of entries) {
    if (!entry.name.endsWith('.sql')) continue;
    if (!entry.isFile()) {
      throw new Error(`Migration não regular recusada: ${entry.name}`);
    }
    validateMigrationName(entry.name);
    migrations.push(entry.name);
  }

  migrations.sort();
  const versions = new Set();
  for (const migration of migrations) {
    const version = MIGRATION_NAME.exec(migration)[1];
    if (versions.has(version)) {
      throw new Error(`Versão de migration duplicada: ${version}`);
    }
    versions.add(version);
  }
  return migrations;
}

function validateManifest(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('Manifesto de migrations inválido.');
  }
  const keys = Object.keys(value).sort();
  if (keys.join('|') !== [...MANIFEST_KEYS].sort().join('|')) {
    throw new Error('Manifesto de migrations possui schema inesperado.');
  }

  const { boundary, baseline, cycle3, postCycle3, all } = value;
  validateMigrationName(boundary, 'Fronteira');
  validateMigrationName(cycle3, 'Migration do Ciclo 3');
  if (boundary !== cycle3) {
    throw new Error('A fronteira deve ser a migration do Ciclo 3.');
  }
  for (const [label, files] of [
    ['baseline', baseline],
    ['postCycle3', postCycle3],
    ['all', all],
  ]) {
    if (!Array.isArray(files)) {
      throw new Error(`Estágio ${label} inválido no manifesto.`);
    }
    files.forEach((file) => validateMigrationName(file, `Migration de ${label}`));
  }

  const expectedAll = [...baseline, cycle3, ...postCycle3];
  if (all.join('|') !== expectedAll.join('|')) {
    throw new Error('A ordem integral do manifesto não corresponde aos estágios.');
  }
  if ([...new Set(all)].length !== all.length) {
    throw new Error('Manifesto contém migration duplicada.');
  }
  return { boundary, baseline, cycle3, postCycle3, all };
}

export function buildStagedMigrationManifest(files, boundary) {
  validateMigrationName(boundary, 'Fronteira');
  const ordered = [...files].sort();
  ordered.forEach((file) => validateMigrationName(file));
  const boundaryIndex = ordered.indexOf(boundary);
  if (boundaryIndex < 0) {
    throw new Error(`Migration-fronteira não encontrada: ${boundary}`);
  }
  return validateManifest({
    boundary,
    baseline: ordered.slice(0, boundaryIndex),
    cycle3: boundary,
    postCycle3: ordered.slice(boundaryIndex + 1),
    all: ordered,
  });
}

async function moveFile(source, destination) {
  try {
    await rename(source, destination);
  } catch (error) {
    if (error?.code !== 'EXDEV') throw error;
    await copyFile(source, destination, constants.COPYFILE_EXCL);
    await rm(source);
  }
}

async function assertManifestState({
  migrationsDirectory,
  stagingDirectory,
  manifest,
}) {
  const migrations = await listMigrationFiles(migrationsDirectory);
  const staged = await listMigrationFiles(stagingDirectory);
  const combined = [...migrations, ...staged].sort();
  if (combined.join('|') !== [...manifest.all].sort().join('|')) {
    throw new Error('A árvore atual não corresponde integralmente ao manifesto.');
  }

  for (const file of manifest.all) {
    const occurrences = Number(migrations.includes(file)) + Number(staged.includes(file));
    if (occurrences !== 1) {
      throw new Error(`Migration deve existir em exatamente um estágio: ${file}`);
    }
  }
}

export async function stageSupabaseMigrations({
  migrationsDirectory,
  stagingDirectory,
  manifestPath,
  boundary,
}) {
  assertSeparateDirectories(migrationsDirectory, stagingDirectory);
  const migrations = await listMigrationFiles(migrationsDirectory);
  const manifest = buildStagedMigrationManifest(migrations, boundary);

  await mkdir(stagingDirectory, { recursive: true });
  const stagedEntries = await readdir(stagingDirectory);
  if (stagedEntries.length > 0) {
    throw new Error('O diretório de staging deve estar vazio.');
  }
  await mkdir(dirname(manifestPath), { recursive: true });

  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, {
    encoding: 'utf8',
    flag: 'wx',
  });
  for (const file of [manifest.cycle3, ...manifest.postCycle3]) {
    await moveFile(
      resolve(migrationsDirectory, file),
      resolve(stagingDirectory, file),
    );
  }
  await assertManifestState({ migrationsDirectory, stagingDirectory, manifest });
  return manifest;
}

export async function restoreSupabaseMigrations({
  migrationsDirectory,
  stagingDirectory,
  manifestPath,
  stage,
}) {
  assertSeparateDirectories(migrationsDirectory, stagingDirectory);
  if (!RESTORE_STAGES.has(stage)) {
    throw new Error(`Estágio de restauração inválido: ${stage}`);
  }
  const manifest = validateManifest(JSON.parse(await readFile(manifestPath, 'utf8')));
  await assertManifestState({ migrationsDirectory, stagingDirectory, manifest });
  const files = stage === 'cycle3' ? [manifest.cycle3] : manifest.postCycle3;

  for (const file of files) {
    const current = await listMigrationFiles(migrationsDirectory);
    if (current.includes(file)) {
      throw new Error(`Migration já restaurada: ${file}`);
    }
    await moveFile(
      resolve(stagingDirectory, file),
      resolve(migrationsDirectory, file),
    );
  }

  await assertManifestState({ migrationsDirectory, stagingDirectory, manifest });
  return manifest;
}

function parseCli(argv) {
  const [command, ...args] = argv;
  const options = {};
  for (let index = 0; index < args.length; index += 2) {
    const key = args[index];
    const value = args[index + 1];
    if (!key?.startsWith('--') || value === undefined) {
      throw new Error(`Argumento inválido: ${key ?? ''}`);
    }
    options[key.slice(2)] = value;
  }
  return { command, options };
}

async function main(argv) {
  const { command, options } = parseCli(argv);
  const common = {
    migrationsDirectory: options['migrations-dir'],
    stagingDirectory: options['staging-dir'],
    manifestPath: options.manifest,
  };
  if (!common.migrationsDirectory || !common.stagingDirectory || !common.manifestPath) {
    throw new Error('Informe --migrations-dir, --staging-dir e --manifest.');
  }

  if (command === 'stage') {
    if (!options.boundary) throw new Error('Informe --boundary para o staging.');
    await stageSupabaseMigrations({ ...common, boundary: options.boundary });
    return;
  }
  if (command === 'restore') {
    if (!options.stage) throw new Error('Informe --stage para a restauração.');
    await restoreSupabaseMigrations({ ...common, stage: options.stage });
    return;
  }
  throw new Error(`Comando inválido: ${command ?? ''}`);
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  main(process.argv.slice(2)).catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
