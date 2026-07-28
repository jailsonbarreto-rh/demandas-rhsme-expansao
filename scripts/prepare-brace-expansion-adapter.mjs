import fs from 'node:fs';

const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
packageJson.scripts.postinstall = 'patch-package --error-on-fail';
packageJson.scripts['test:dependency-compat'] = 'node --test scripts/brace-expansion-compat.test.mjs';
if (!packageJson.scripts.check.includes('npm run test:dependency-compat')) {
  packageJson.scripts.check = packageJson.scripts.check.replace(
    'npm audit signatures &&',
    'npm audit signatures && npm run test:dependency-compat &&',
  );
}
packageJson.devDependencies['patch-package'] = '8.0.1';
delete packageJson.dependencies['brace-expansion-modern'];
packageJson.overrides ??= {};
packageJson.overrides['brace-expansion'] = '5.0.8';
delete packageJson.overrides.minimatch;
delete packageJson.overrides['minimatch@3.1.5'];
fs.writeFileSync('package.json', `${JSON.stringify(packageJson, null, 2)}\n`);

fs.rmSync('.npmrc', { force: true });
fs.rmSync('scripts/patch-brace-expansion-compat.mjs');
fs.rmSync('vendor', { recursive: true, force: true });
fs.mkdirSync('patches', { recursive: true });

fs.writeFileSync('scripts/brace-expansion-compat.test.mjs', `import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import fs from 'node:fs';
import test from 'node:test';
import ExcelJS from 'exceljs';

const require = createRequire(import.meta.url);
const modulePaths = [
  'minimatch',
  'readdir-glob/node_modules/minimatch',
];

test('as duas instâncias de minimatch usam a API expand corrigida', () => {
  for (const moduleId of modulePaths) {
    const resolved = require.resolve(moduleId);
    const source = fs.readFileSync(resolved, 'utf8');
    assert.match(source, /require\\('brace-expansion'\\)\\.expand/);
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
`);

fs.writeFileSync('scripts/create-brace-expansion-patches.mjs', `import fs from 'node:fs';

const targets = [
  'node_modules/minimatch/minimatch.js',
  'node_modules/readdir-glob/node_modules/minimatch/minimatch.js',
];

for (const target of targets) {
  const source = fs.readFileSync(target, 'utf8');
  const expected = "var expand = require('brace-expansion')";
  const replacement = "var expand = require('brace-expansion').expand";
  const matches = source.split(expected).length - 1;
  if (matches !== 1) {
    throw new Error(
      \`Contrato inesperado em \${target}: esperada exatamente uma declaração compatível; encontradas \${matches}.\`,
    );
  }
  fs.writeFileSync(target, source.replace(expected, replacement));
}
`);
