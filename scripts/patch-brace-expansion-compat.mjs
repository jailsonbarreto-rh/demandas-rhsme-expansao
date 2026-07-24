import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const candidates = [
  'node_modules/minimatch/minimatch.js',
  'node_modules/readdir-glob/node_modules/minimatch/minimatch.js',
];

const declarationPattern = /^(\s*)(var|const|let)\s+([A-Za-z_$][\w$]*)\s*=\s*require\((['"])brace-expansion\4\);?\s*$/m;
const marker = '__braceExpansionCompatModule';

for (const candidate of candidates) {
  const filePath = resolve(candidate);
  if (!existsSync(filePath)) {
    throw new Error(`Dependência esperada não encontrada para adaptação: ${candidate}`);
  }

  const source = readFileSync(filePath, 'utf8');
  if (source.includes(marker)) continue;

  const match = source.match(declarationPattern);
  if (!match) {
    throw new Error(`Importação de brace-expansion não reconhecida em: ${candidate}`);
  }

  const [, indent, declarationKind, localName] = match;
  const replacement = [
    `${indent}${declarationKind} ${marker} = require('brace-expansion')`,
    `${indent}${declarationKind} ${localName} = ${marker}.expand || ${marker}`,
  ].join('\n');

  writeFileSync(filePath, source.replace(declarationPattern, replacement));
  console.log(`Compatibilidade de brace-expansion aplicada em ${candidate}.`);
}
