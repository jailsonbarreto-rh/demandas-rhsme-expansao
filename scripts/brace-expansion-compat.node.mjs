import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import test from 'node:test';
import ExcelJS from 'exceljs';

const require = createRequire(import.meta.url);
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

test('override usa o backport CommonJS corrigido de brace-expansion', () => {
  const bracePackage = require('brace-expansion/package.json');
  const expand = require('brace-expansion');

  assert.equal(bracePackage.version, '2.1.4');
  assert.equal(typeof expand, 'function');
});

test('consumidores antigos e modernos continuam executando expansão de chaves', () => {
  const pattern = 'relatorio-{2025,2026}.xlsx';

  for (const consumer of minimatchConsumers) {
    const minimatch = getMinimatch(consumer);
    assert.equal(minimatch('relatorio-2026.xlsx', pattern), true, consumer.label);
    assert.equal(minimatch('relatorio-2027.xlsx', pattern), false, consumer.label);
  }
});

test('brace-expansion limita o total acumulado entre alternativas', () => {
  const expand = require('brace-expansion');
  const alternatives = `{${Array(1_000).fill('{1..5}').join(',')}}`;
  const expanded = expand(alternatives, { max: 100_000, maxLength: 50 });
  const totalLength = expanded.reduce((sum, item) => sum + item.length, 0);

  assert.ok(expanded.length > 0);
  assert.ok(totalLength <= 50);
});

test('brace-expansion aplica maxLength durante sequências largas', () => {
  const expand = require('brace-expansion');
  const paddedSequence = `{${'0'.repeat(10_000)}1..100000}`;
  const startedAt = performance.now();
  const expanded = expand(paddedSequence, { max: 100_000, maxLength: 20_000 });
  const elapsed = performance.now() - startedAt;
  const totalLength = expanded.reduce((sum, item) => sum + item.length, 0);

  assert.ok(totalLength <= 20_000);
  assert.ok(elapsed < 2_000, `expansão demorou ${elapsed.toFixed(1)}ms`);
});

test('ExcelJS continua criando e serializando arquivos', async () => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Validação');
  worksheet.addRow(['CTRH', 'ok']);
  const buffer = await workbook.xlsx.writeBuffer();
  assert.ok(buffer.byteLength > 0);
});