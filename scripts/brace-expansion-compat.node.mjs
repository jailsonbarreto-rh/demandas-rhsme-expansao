import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import fs from 'node:fs';
import test from 'node:test';
import ExcelJS from 'exceljs';

const require = createRequire(import.meta.url);
const modulePaths = [
  'minimatch',
  'readdir-glob/node_modules/minimatch',
];

test('as duas instâncias consumidoras usam a API expand compatível', () => {
  for (const moduleId of modulePaths) {
    const resolved = require.resolve(moduleId);
    const source = fs.readFileSync(resolved, 'utf8');
    assert.match(source, /require\('brace-expansion'\)\.expand/);
  }
});

test('as duas instâncias de minimatch executam expansão de chaves', () => {
  const pattern = 'relatorio-{2025,2026}.xlsx';
  for (const moduleId of modulePaths) {
    const minimatch = require(moduleId);
    assert.equal(minimatch('relatorio-2026.xlsx', pattern), true);
    assert.equal(minimatch('relatorio-2027.xlsx', pattern), false);
  }
});

test('ExcelJS continua criando e serializando arquivos', async () => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Validação');
  worksheet.addRow(['CTRH', 'ok']);
  const buffer = await workbook.xlsx.writeBuffer();
  assert.ok(buffer.byteLength > 0);
});
