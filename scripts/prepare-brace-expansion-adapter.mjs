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
delete packageJson.overrides['brace-expansion'];
delete packageJson.overrides['minimatch@3.1.5'];
packageJson.overrides.minimatch = {
  'brace-expansion': 'file:vendor/brace-expansion-compat',
};
fs.writeFileSync('package.json', `${JSON.stringify(packageJson, null, 2)}\n`);
fs.writeFileSync('.npmrc', 'install-links=true\n');

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
const requireFrom = (moduleId) => createRequire(require.resolve(moduleId));

test('adaptador mantém a API CommonJS esperada por cada minimatch 3', () => {
  const rootExpand = requireFrom('minimatch')('brace-expansion');
  const nestedExpand = requireFrom('readdir-glob/node_modules/minimatch')('brace-expansion');

  for (const expand of [rootExpand, nestedExpand]) {
    assert.equal(typeof expand, 'function');
    assert.deepEqual(expand('relatorio-{2025,2026}.xlsx'), [
      'relatorio-2025.xlsx',
      'relatorio-2026.xlsx',
    ]);
  }
});

test('as duas instâncias de minimatch executam expansão de chaves', () => {
  const rootMinimatch = require('minimatch');
  const nestedMinimatch = require('readdir-glob/node_modules/minimatch');
  const pattern = 'relatorio-{2025,2026}.xlsx';
  assert.equal(rootMinimatch('relatorio-2026.xlsx', pattern), true);
  assert.equal(nestedMinimatch('relatorio-2026.xlsx', pattern), true);
  assert.equal(rootMinimatch('relatorio-2027.xlsx', pattern), false);
  assert.equal(nestedMinimatch('relatorio-2027.xlsx', pattern), false);
});

test('ExcelJS continua criando e serializando arquivos', async () => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Validação');
  worksheet.addRow(['CTRH', 'ok']);
  const buffer = await workbook.xlsx.writeBuffer();
  assert.ok(buffer.byteLength > 0);
});
`);
