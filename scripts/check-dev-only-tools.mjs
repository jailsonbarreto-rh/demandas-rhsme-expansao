import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';

const projectRoot = process.cwd();
const distRoot = path.join(projectRoot, 'dist');
const sourcePath = path.join(projectRoot, 'src', 'dev', 'QueryDevtools.tsx');
const marker = 'cthr-query-devtools-development-only';

function collectFiles(directory) {
  return readdirSync(directory).flatMap((entry) => {
    const absolutePath = path.join(directory, entry);
    return statSync(absolutePath).isDirectory() ? collectFiles(absolutePath) : [absolutePath];
  });
}

if (!existsSync(sourcePath)) {
  throw new Error('Módulo de Query Devtools não encontrado.');
}

const source = readFileSync(sourcePath, 'utf8');
if (!source.includes(marker)) {
  throw new Error('Sentinela de desenvolvimento não encontrada no módulo Query Devtools.');
}

if (!existsSync(distRoot)) {
  throw new Error('Diretório dist não encontrado. Execute o build de produção antes deste gate.');
}

const leakedFiles = collectFiles(distRoot).filter((filePath) => {
  const extension = path.extname(filePath);
  if (!['.js', '.css', '.html', '.map'].includes(extension)) return false;
  return readFileSync(filePath, 'utf8').includes(marker);
});

if (leakedFiles.length > 0) {
  const relativeFiles = leakedFiles.map((filePath) => path.relative(projectRoot, filePath));
  throw new Error(`Query Devtools vazou para o build de produção: ${relativeFiles.join(', ')}`);
}

console.log('Query Devtools confirmado como exclusivo do ambiente de desenvolvimento.');
