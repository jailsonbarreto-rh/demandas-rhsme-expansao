import { readFile, readdir, stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { prepareLegacyMigration, writeMigrationArtifacts } from './legacy-data.mjs';

const SUPPORTED_EXTENSIONS = /\.(csv|xlsx|xlsm)$/i;

function printHelp() {
  console.log(`
Preparação da migração legada do SITE CTRH

Uso:
  npm run migration:prepare -- [opções] <arquivo-ou-diretório> [...]

Opções:
  --out <diretório>                  Saída (padrão: .migration/legacy)
  --default-classificacao <valor>    Classificação para CSV sem coluna própria (padrão: Outros)
  --default-setor <valor>            Setor usado somente quando a linha estiver vazia
  --help                             Exibe esta ajuda

Exemplos:
  npm run migration:prepare -- downloads/pagina-001.csv downloads/pagina-002.csv
  npm run migration:prepare -- --out .migration/carga-final downloads/
  npm run migration:prepare -- "demandas (1).xlsx"
`);
}

function parseArguments(argv) {
  const options = {
    outputDir: '.migration/legacy',
    defaultClassificacao: 'Outros',
    defaultSetor: '',
    inputs: [],
  };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--help') return { ...options, help: true };
    if (argument === '--out') {
      options.outputDir = argv[++index];
    } else if (argument === '--default-classificacao') {
      options.defaultClassificacao = argv[++index];
    } else if (argument === '--default-setor') {
      options.defaultSetor = argv[++index];
    } else if (argument.startsWith('--')) {
      throw new Error(`Opção desconhecida: ${argument}`);
    } else {
      options.inputs.push(argument);
    }
  }

  if (!options.outputDir) throw new Error('Informe um valor para --out.');
  if (!options.defaultClassificacao) throw new Error('Informe um valor para --default-classificacao.');
  return options;
}

async function expandInput(inputPath) {
  const absolutePath = resolve(inputPath);
  const metadata = await stat(absolutePath);
  if (metadata.isFile()) {
    if (!SUPPORTED_EXTENSIONS.test(absolutePath)) {
      throw new Error(`Formato não suportado: ${inputPath}`);
    }
    return [absolutePath];
  }
  if (!metadata.isDirectory()) throw new Error(`Entrada inválida: ${inputPath}`);

  const entries = await readdir(absolutePath, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && SUPPORTED_EXTENSIONS.test(entry.name))
    .map((entry) => resolve(absolutePath, entry.name))
    .sort((left, right) => left.localeCompare(right, 'pt-BR'));
}

export async function runPrepareCli(argv) {
  const options = parseArguments(argv);
  if (options.help) {
    printHelp();
    return 0;
  }
  if (options.inputs.length === 0) {
    printHelp();
    throw new Error('Informe ao menos um arquivo ou diretório de origem.');
  }

  const expanded = (await Promise.all(options.inputs.map(expandInput))).flat();
  if (expanded.length === 0) {
    throw new Error('Nenhum arquivo CSV ou XLSX foi encontrado nas entradas informadas.');
  }

  const sources = await Promise.all(expanded.map(async (filePath) => ({
    name: filePath,
    buffer: await readFile(filePath),
  })));
  const result = await prepareLegacyMigration({
    sources,
    defaultClassificacao: options.defaultClassificacao,
    defaultSetor: options.defaultSetor,
  });
  const outputDir = resolve(options.outputDir);
  const paths = await writeMigrationArtifacts(result, outputDir);

  console.log('\nPreparação concluída.');
  console.log(`Arquivos de origem: ${result.summary.sourceFileCount}`);
  console.log(`Registros encontrados: ${result.summary.sourceRecords}`);
  console.log(`Registros prontos: ${result.summary.readyRecords}`);
  console.log(`Pendências impeditivas: ${result.summary.blockingIssues}`);
  console.log(`Advertências: ${result.summary.warnings}`);
  console.log(`Relatório: ${paths.workbook}`);
  console.log(`Payload: ${paths.payload}`);
  console.log(`Manifesto: ${paths.manifest}`);

  return result.summary.blockingIssues > 0 ? 2 : 0;
}

const isDirectExecution = process.argv[1]
  && import.meta.url === pathToFileURL(resolve(process.argv[1])).href;

if (isDirectExecution) {
  runPrepareCli(process.argv.slice(2))
    .then((exitCode) => {
      process.exitCode = exitCode;
    })
    .catch((error) => {
      console.error(`Falha ao preparar a migração: ${error.message}`);
      process.exitCode = 1;
    });
}
