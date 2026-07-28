import fs from 'node:fs';

const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
delete packageJson.scripts.postinstall;
packageJson.scripts['test:dependency-compat'] = 'node --test scripts/brace-expansion-compat.test.mjs';
packageJson.scripts.check = packageJson.scripts.check.replace(
  'npm audit signatures &&',
  'npm audit signatures && npm run test:dependency-compat &&',
);
packageJson.dependencies['brace-expansion-modern'] = 'npm:brace-expansion@5.0.8';
packageJson.overrides ??= {};
packageJson.overrides['brace-expansion'] = 'file:vendor/brace-expansion-compat';
fs.writeFileSync('package.json', `${JSON.stringify(packageJson, null, 2)}\n`);

fs.rmSync('scripts/patch-brace-expansion-compat.mjs');
fs.mkdirSync('vendor/brace-expansion-compat', { recursive: true });
fs.writeFileSync('vendor/brace-expansion-compat/package.json', `${JSON.stringify({
  name: 'brace-expansion',
  version: '5.0.8',
  private: true,
  main: 'index.cjs',
  license: 'UNLICENSED',
}, null, 2)}\n`);
fs.writeFileSync('vendor/brace-expansion-compat/index.cjs', `'use strict';

const modernModule = require('brace-expansion-modern');
const expand = modernModule.expand || modernModule;

if (typeof expand !== 'function') {
  throw new TypeError('brace-expansion-modern não expôs uma função compatível.');
}

module.exports = expand;
module.exports.expand = expand;
`);

fs.writeFileSync('scripts/brace-expansion-compat.test.mjs', `import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import test from 'node:test';
import ExcelJS from 'exceljs';

const require = createRequire(import.meta.url);

test('adaptador mantém a API CommonJS esperada pelo minimatch 3', () => {
  const expand = require('brace-expansion');
  assert.equal(typeof expand, 'function');
  assert.deepEqual(expand('relatorio-{2025,2026}.xlsx'), [
    'relatorio-2025.xlsx',
    'relatorio-2026.xlsx',
  ]);
});

test('minimatch direto e o minimatch do readdir-glob permanecem funcionais', () => {
  const rootMinimatch = require('minimatch');
  const nestedMinimatch = require('readdir-glob/node_modules/minimatch');
  assert.equal(rootMinimatch('relatorio.xlsx', '*.xlsx'), true);
  assert.equal(nestedMinimatch('relatorio.xlsx', '*.xlsx'), true);
});

test('ExcelJS continua criando e serializando arquivos', async () => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Validação');
  worksheet.addRow(['CTRH', 'ok']);
  const buffer = await workbook.xlsx.writeBuffer();
  assert.ok(buffer.byteLength > 0);
});
`);
