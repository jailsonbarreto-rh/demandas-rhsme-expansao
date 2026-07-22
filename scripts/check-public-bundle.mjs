import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { relative, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { loadInitialDemandas } from './bootstrap-supabase.mjs';

function listFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name);
    return entry.isDirectory() ? listFiles(path) : [path];
  });
}

export function findPublicBundleLeaks(assetsDirectory, demandas) {
  const files = listFiles(assetsDirectory)
    .filter((path) => statSync(path).isFile())
    .map((path) => ({ path, content: readFileSync(path, 'utf8') }));

  return demandas.flatMap((demanda, demandaIndex) => files
    .filter((file) => file.content.includes(demanda.numero))
    .map((file) => ({
      demandaIndex: demandaIndex + 1,
      asset: relative(assetsDirectory, file.path),
    })));
}

export function checkPublicBundle({
  adminDataPath = resolve(process.cwd(), 'scripts', 'bootstrap', 'initial-demandas.json'),
  assetsDirectory = resolve(process.cwd(), 'dist', 'assets'),
} = {}) {
  if (!existsSync(assetsDirectory)) {
    throw new Error('Diretório dist/assets ausente. Execute o build antes da verificação pública.');
  }

  const demandas = loadInitialDemandas(adminDataPath);
  const assets = listFiles(assetsDirectory);
  const leaks = findPublicBundleLeaks(assetsDirectory, demandas);

  if (leaks.length > 0) {
    const recordIndexes = [...new Set(leaks.map((leak) => leak.demandaIndex))];
    const assetNames = [...new Set(leaks.map((leak) => leak.asset))];
    throw new Error(
      `Bundle público contém identificadores administrativos em ${assetNames.length} arquivo(s); `
      + `registros afetados (por posição, sem expor o conteúdo): ${recordIndexes.join(', ')}.`,
    );
  }

  return { demandasVerificadas: demandas.length, arquivosVerificados: assets.length };
}

function main() {
  const result = checkPublicBundle();
  console.log(
    `Bundle público aprovado: ${result.arquivosVerificados} arquivo(s) verificado(s) `
    + `contra ${result.demandasVerificadas} identificadores administrativos.`,
  );
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    main();
  } catch (error) {
    console.error(
      `Falha na verificação do bundle público: ${error instanceof Error ? error.message : 'erro desconhecido'}`,
    );
    process.exitCode = 1;
  }
}
