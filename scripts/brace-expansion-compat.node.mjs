import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import test from 'node:test';
import ExcelJS from 'exceljs';

const require = createRequire(import.meta.url);
const projectRoot = process.cwd();
const minimatchConsumers = [
  { label: 'top-level minimatch', requireFrom: import.meta.url },
  { label: 'readdir-glob', requireFrom: require.resolve('readdir-glob') },
  {
    label: '@typescript-eslint/typescript-estree',
    requireFrom: require.resolve('@typescript-eslint/typescript-estree'),
  },
];

function getMinimatch({ label, requireFrom }) {
  const requireFromConsumer = createRequire(requireFrom);
  const loaded = requireFromConsumer('minimatch');
  const minimatch = typeof loaded === 'function' ? loaded : loaded.minimatch;
  assert.equal(typeof minimatch, 'function', `${label} deve resolver uma função minimatch`);
  return minimatch;
}

function installedBraceExpansions() {
  const lockfile = JSON.parse(readFileSync(path.join(projectRoot, 'package-lock.json'), 'utf8'));
  return Object.entries(lockfile.packages)
    .filter(([packagePath]) => packagePath.endsWith('node_modules/brace-expansion'))
    .map(([packagePath, metadata]) => ({
      packagePath,
      version: metadata.version,
      absolutePath: path.join(projectRoot, packagePath),
    }));
}

function getExpand(absolutePath) {
  const loaded = require(absolutePath);
  const expand = typeof loaded === 'function' ? loaded : loaded.expand;
  assert.equal(typeof expand, 'function', `${absolutePath} deve expor uma função de expansão`);
  return expand;
}

test('npm resolve linhas compatíveis de brace-expansion sem override global', () => {
  const installations = installedBraceExpansions();
  assert.ok(installations.length > 0);

  const versions = new Set(installations.map(({ version }) => version));
  assert.ok(versions.size > 1, 'a árvore deve preservar linhas de API compatíveis por consumidor');
});

test('consumidores antigos e modernos continuam executando expansão de chaves', () => {
  const pattern = 'relatorio-{2025,2026}.xlsx';

  for (const consumer of minimatchConsumers) {
    const minimatch = getMinimatch(consumer);
    assert.equal(minimatch('relatorio-2026.xlsx', pattern), true, consumer.label);
    assert.equal(minimatch('relatorio-2027.xlsx', pattern), false, consumer.label);
  }
});

test('todas as linhas instaladas limitam o total acumulado entre alternativas', () => {
  const alternatives = `{${Array(1_000).fill('{1..5}').join(',')}}`;

  for (const installation of installedBraceExpansions()) {
    const expand = getExpand(installation.absolutePath);
    const expanded = expand(alternatives, { max: 100_000, maxLength: 50 });
    const totalLength = expanded.reduce((sum, item) => sum + item.length, 0);

    assert.ok(expanded.length > 0, installation.version);
    assert.ok(totalLength <= 50, `${installation.version}: ${totalLength} > 50`);
  }
});

test('todas as linhas instaladas aplicam maxLength durante sequências largas', () => {
  const paddedSequence = `{${'0'.repeat(10_000)}1..100000}`;

  for (const installation of installedBraceExpansions()) {
    const expand = getExpand(installation.absolutePath);
    const startedAt = performance.now();
    const expanded = expand(paddedSequence, { max: 100_000, maxLength: 20_000 });
    const elapsed = performance.now() - startedAt;
    const totalLength = expanded.reduce((sum, item) => sum + item.length, 0);

    assert.ok(totalLength <= 20_000, `${installation.version}: ${totalLength} > 20000`);
    assert.ok(elapsed < 2_000, `${installation.version}: expansão demorou ${elapsed.toFixed(1)}ms`);
  }
});

test('ExcelJS continua criando e serializando arquivos', async () => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Validação');
  worksheet.addRow(['CTRH', 'ok']);
  const buffer = await workbook.xlsx.writeBuffer();
  assert.ok(buffer.byteLength > 0);
});
