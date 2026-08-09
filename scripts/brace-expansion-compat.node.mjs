import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import test from 'node:test';
import ExcelJS from 'exceljs';

const require = createRequire(import.meta.url);
const minimatchModulePaths = [
  'minimatch',
  'readdir-glob/node_modules/minimatch',
  '@typescript-eslint/typescript-estree/node_modules/minimatch',
];

function getMinimatch(moduleId) {
  const loaded = require(moduleId);
  const minimatch = typeof loaded === 'function' ? loaded : loaded.minimatch;
  assert.equal(typeof minimatch, 'function', `${moduleId} deve expor função minimatch`);
  return minimatch;
}

test('override usa a linha de manutenção segura e CommonJS de brace-expansion', () => {
  const bracePackage = require('brace-expansion/package.json');
  const expand = require('brace-expansion');

  assert.equal(bracePackage.version, '2.1.3');
  assert.equal(typeof expand, 'function');
});

test('consumidores antigos e modernos continuam executando expansão de chaves', () => {
  const pattern = 'relatorio-{2025,2026}.xlsx';

  for (const moduleId of minimatchModulePaths) {
    const minimatch = getMinimatch(moduleId);
    assert.equal(minimatch('relatorio-2026.xlsx', pattern), true, moduleId);
    assert.equal(minimatch('relatorio-2027.xlsx', pattern), false, moduleId);
  }
});

test('brace-expansion aplica limites de quantidade e comprimento sem expansão descontrolada', () => {
  const expand = require('brace-expansion');
  const expanded = expand('{a,b}'.repeat(50), { max: 1000, maxLength: 1000 });
  const totalLength = expanded.reduce((sum, item) => sum + item.length, 0);

  assert.ok(expanded.length <= 1000);
  assert.ok(totalLength <= 1000);
});

test('ExcelJS continua criando e serializando arquivos', async () => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Validação');
  worksheet.addRow(['CTRH', 'ok']);
  const buffer = await workbook.xlsx.writeBuffer();
  assert.ok(buffer.byteLength > 0);
});