import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import ExcelJS from 'exceljs';
import { parse } from 'csv-parse/sync';

const STATUS_BY_KEY = new Map([
  ['aguardandoandamento', 'Aguardando Andamento'],
  ['tramitado', 'Tramitado'],
  ['paraassinatura', 'Para Assinatura'],
  ['encerrado', 'Encerrado'],
  ['sobrestado', 'Sobrestado'],
  ['ajustar', 'Ajustar'],
]);

const TYPE_BY_KEY = new Map([
  ['expediente', 'Expediente'],
  ['processo', 'Processo'],
  ['outros', 'Outros'],
]);

const CLASSIFICATIONS = new Map([
  'Dispensa de Ponto',
  'CCFG',
  'Cessão',
  'Concursos',
  'Contratação',
  'Consultas',
  'Inventário',
  'Expediente Parlamentar',
  'MP',
  'Representação Judicial',
  'DP',
  'PGM',
  'Recurso',
  'Financeiro',
  'Demanda Interna',
  'Permuta',
  'Diversos',
  'Outros',
].map((value) => [normalizationKey(value), value]));

const HEADER_BY_KEY = new Map([
  ['numero', 'numero'],
  ['numerodoprocesso', 'numero'],
  ['processo', 'numero'],
  ['documento', 'numero'],
  ['assunto', 'assunto'],
  ['responsavel', 'responsavel'],
  ['limite1', 'limite1'],
  ['prazo1', 'limite1'],
  ['prazointerno', 'limite1'],
  ['limite2', 'limite2'],
  ['prazo2', 'limite2'],
  ['prazofinal', 'limite2'],
  ['status', 'status'],
  ['situacao', 'status'],
  ['andamento', 'status'],
  ['setor', 'setor'],
  ['unidade', 'setor'],
  ['tipo', 'tipo'],
  ['classificacao', 'classificacao'],
  ['categoria', 'classificacao'],
]);

const NUMBER_PATTERN = /^([0-9]{6}\.[0-9]{6}\/[0-9]{4}-[0-9]{2}|[0-9]{7}-[0-9]{2}\.[0-9]{4}\.[0-9]\.[0-9]{2}\.[0-9]{4}|[A-Z]{2,6}-(PRO|OFI|MEM|CAP)-[0-9]{4}\/[0-9]{5}(-V[0-9]{2}|-[A-Z][0-9]*)?)$/;

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

function mojibakeScore(value) {
  const markers = value.match(/Ã.|Â.|â€|â€™|â€œ|â€�|ðŸ|�/g);
  return (markers?.length ?? 0) + (value.match(/�/g)?.length ?? 0) * 4;
}

export function repairMojibake(input) {
  if (input === null || input === undefined) return '';
  let current = String(input);

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const currentScore = mojibakeScore(current);
    if (currentScore === 0) break;

    const candidate = Buffer.from(current, 'latin1').toString('utf8');
    const candidateScore = mojibakeScore(candidate);
    if (candidate.includes('�') || candidateScore >= currentScore) break;
    current = candidate;
  }

  return current;
}

function normalizationKey(input) {
  return repairMojibake(input)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

function cleanText(input) {
  return repairMojibake(input)
    .replace(/\r?\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function canonicalHeader(input) {
  const key = normalizationKey(input).replace(/^ufeff/, '');
  return HEADER_BY_KEY.get(key) ?? key;
}

function decodeText(buffer) {
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(buffer).replace(/^\uFEFF/, '');
  } catch {
    return new TextDecoder('windows-1252').decode(buffer).replace(/^\uFEFF/, '');
  }
}

function detectDelimiter(text) {
  const firstLine = text.split(/\r?\n/, 1)[0] ?? '';
  const counts = new Map([[',', 0], [';', 0], ['\t', 0]]);
  let quoted = false;

  for (let index = 0; index < firstLine.length; index += 1) {
    const character = firstLine[index];
    if (character === '"') {
      if (quoted && firstLine[index + 1] === '"') {
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (!quoted && counts.has(character)) {
      counts.set(character, counts.get(character) + 1);
    }
  }

  return [...counts.entries()].sort((left, right) => right[1] - left[1])[0][0];
}

function rowsFromCsvText(text) {
  const delimiter = detectDelimiter(text);
  const parsedRows = parse(text, {
    bom: true,
    delimiter,
    relax_column_count: true,
    relax_quotes: true,
    skip_empty_lines: true,
  });

  if (parsedRows.length === 0) return [];
  const headers = parsedRows[0].map(canonicalHeader);

  return parsedRows.slice(1).map((cells, index) => {
    const values = {};
    headers.forEach((header, columnIndex) => {
      if (!header) return;
      values[header] = repairMojibake(cells[columnIndex] ?? '');
    });
    return { sourceLine: index + 2, values };
  });
}

function cellText(value) {
  if (value === null || value === undefined) return '';
  if (value instanceof Date) {
    const day = String(value.getDate()).padStart(2, '0');
    const month = String(value.getMonth() + 1).padStart(2, '0');
    return `${day}/${month}/${value.getFullYear()}`;
  }
  if (typeof value !== 'object') return String(value);
  if ('text' in value && typeof value.text === 'string') return value.text;
  if ('richText' in value && Array.isArray(value.richText)) {
    return value.richText.map((part) => part.text ?? '').join('');
  }
  if ('result' in value) return cellText(value.result);
  return String(value);
}

async function rowsFromXlsxBuffer(buffer) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
  const worksheet = workbook.worksheets[0];
  if (!worksheet) return [];

  const firstRowValues = [];
  for (let column = 1; column <= Math.max(worksheet.columnCount, 1); column += 1) {
    firstRowValues.push(cellText(worksheet.getCell(1, column).value));
  }
  const nonEmptyHeaderCells = firstRowValues.filter((value) => value.trim() !== '');

  if (nonEmptyHeaderCells.length === 1 && /[,;\t]/.test(nonEmptyHeaderCells[0])) {
    const lines = [];
    for (let row = 1; row <= worksheet.rowCount; row += 1) {
      const value = cellText(worksheet.getCell(row, 1).value);
      if (value.trim() !== '') lines.push(value);
    }
    return rowsFromCsvText(lines.join('\n'));
  }

  const headers = firstRowValues.map(canonicalHeader);
  const rows = [];
  for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber += 1) {
    const values = {};
    let hasValue = false;
    headers.forEach((header, index) => {
      if (!header) return;
      const value = cellText(worksheet.getCell(rowNumber, index + 1).value);
      if (value.trim() !== '') hasValue = true;
      values[header] = repairMojibake(value);
    });
    if (hasValue) rows.push({ sourceLine: rowNumber, values });
  }
  return rows;
}

async function readSource(source) {
  const extension = extname(source.name).toLowerCase();
  const rows = extension === '.xlsx' || extension === '.xlsm'
    ? await rowsFromXlsxBuffer(source.buffer)
    : rowsFromCsvText(decodeText(source.buffer));

  return {
    name: source.name,
    sha256: sha256(source.buffer),
    recordCount: rows.length,
    rows,
  };
}

function normalizeDate(input) {
  const value = cleanText(input);
  if (value === '') return { value: '', valid: true };

  let year;
  let month;
  let day;
  const brazilian = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (brazilian) {
    [, day, month, year] = brazilian;
  } else if (iso) {
    [, year, month, day] = iso;
  } else {
    return { value: '', valid: false };
  }

  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  const valid = date.getUTCFullYear() === Number(year)
    && date.getUTCMonth() === Number(month) - 1
    && date.getUTCDate() === Number(day);

  return {
    value: valid ? `${year}-${month}-${day}` : '',
    valid,
  };
}

function normalizeStatus(input) {
  return STATUS_BY_KEY.get(normalizationKey(input)) ?? null;
}

function normalizeClassification(input, fallback) {
  const value = cleanText(input) || cleanText(fallback);
  return CLASSIFICATIONS.get(normalizationKey(value)) ?? null;
}

function inferType(numero) {
  const value = numero.toUpperCase();
  if (value.includes('-PRO-')
    || /^[0-9]{6}\.[0-9]{6}\/[0-9]{4}-[0-9]{2}$/.test(value)
    || /^[0-9]{7}-[0-9]{2}\.[0-9]{4}\.[0-9]\.[0-9]{2}\.[0-9]{4}$/.test(value)) {
    return 'Processo';
  }
  if (/-(OFI|MEM|CAP)-/.test(value)) return 'Expediente';
  return 'Outros';
}

function normalizeType(input, numero) {
  const value = cleanText(input);
  if (value === '') return { value: inferType(numero), inferred: true, valid: true };
  const normalized = TYPE_BY_KEY.get(normalizationKey(value));
  return normalized
    ? { value: normalized, inferred: false, valid: true }
    : { value: '', inferred: false, valid: false };
}

function normalizedNumberKey(numero) {
  return numero.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

function addIssue(issues, row, severity, code, field, originalValue, message) {
  issues.push({
    severity,
    code,
    sourceFile: row.sourceFile,
    sourceLine: row.sourceLine,
    field,
    originalValue: String(originalValue ?? ''),
    message,
  });
}

function canonicalJson(value) {
  return JSON.stringify(value);
}

export async function prepareLegacyMigration({
  sources,
  defaultClassificacao = 'Outros',
  defaultSetor = '',
}) {
  if (!Array.isArray(sources) || sources.length === 0) {
    throw new Error('Informe ao menos um arquivo CSV ou XLSX para preparar a migração.');
  }

  const sourceFiles = [];
  const sourceRows = [];
  for (const source of sources) {
    const parsedSource = await readSource(source);
    sourceFiles.push({
      name: parsedSource.name,
      sha256: parsedSource.sha256,
      recordCount: parsedSource.recordCount,
    });
    parsedSource.rows.forEach((row) => {
      sourceRows.push({ ...row, sourceFile: parsedSource.name });
    });
  }

  const issues = [];
  const payload = [];
  const readyRows = [];
  const seenNumbers = new Map();

  sourceRows.forEach((row, rowIndex) => {
    const values = row.values;
    const numero = cleanText(values.numero).toUpperCase();
    const assunto = cleanText(values.assunto);
    const responsavel = cleanText(values.responsavel);
    const setor = cleanText(values.setor) || cleanText(defaultSetor);
    const status = normalizeStatus(values.status);
    const limite1 = normalizeDate(values.limite1);
    const limite2 = normalizeDate(values.limite2);
    const tipo = normalizeType(values.tipo, numero);
    const classificacao = normalizeClassification(values.classificacao, defaultClassificacao);
    const rowIssueStart = issues.length;

    if (!numero) {
      addIssue(issues, row, 'error', 'NUMERO_OBRIGATORIO', 'numero', values.numero, 'Informe o número do processo ou documento.');
    } else if (!NUMBER_PATTERN.test(numero)) {
      addIssue(issues, row, 'error', 'NUMERO_INVALIDO', 'numero', values.numero, 'O número não atende aos formatos aceitos pela importação.');
    }
    if (!assunto) {
      addIssue(issues, row, 'error', 'ASSUNTO_OBRIGATORIO', 'assunto', values.assunto, 'Informe o assunto da demanda.');
    }
    if (!responsavel) {
      addIssue(issues, row, 'error', 'RESPONSAVEL_OBRIGATORIO', 'responsavel', values.responsavel, 'Informe o responsável da demanda.');
    }
    if (!status) {
      addIssue(issues, row, 'error', 'STATUS_INVALIDO', 'status', values.status, 'O status não possui correspondência segura no sistema novo.');
    }
    if (!setor) {
      addIssue(issues, row, 'error', 'SETOR_OBRIGATORIO', 'setor', values.setor, 'Informe o setor ou configure um setor padrão.');
    }
    if (!limite1.valid) {
      addIssue(issues, row, 'error', 'LIMITE1_INVALIDO', 'limite1', values.limite1, 'A data de Limite 1 é inválida.');
    }
    if (!limite2.valid) {
      addIssue(issues, row, 'error', 'LIMITE2_INVALIDO', 'limite2', values.limite2, 'A data de Limite 2 é inválida.');
    }
    if (limite1.valid && limite2.valid && limite1.value && limite2.value && limite2.value < limite1.value) {
      addIssue(issues, row, 'error', 'ORDEM_DOS_LIMITES_INVALIDA', 'limite2', values.limite2, 'Limite 2 não pode ser anterior ao Limite 1.');
    }
    if (!tipo.valid) {
      addIssue(issues, row, 'error', 'TIPO_INVALIDO', 'tipo', values.tipo, 'O tipo não possui correspondência segura no sistema novo.');
    } else if (tipo.inferred) {
      addIssue(issues, row, 'warning', 'TIPO_INFERIDO', 'tipo', values.tipo, `Tipo inferido como ${tipo.value} a partir do número.`);
    }
    if (!classificacao) {
      addIssue(issues, row, 'error', 'CLASSIFICACAO_INVALIDA', 'classificacao', values.classificacao, 'A classificação não é aceita pela importação.');
    } else if (!cleanText(values.classificacao)) {
      addIssue(issues, row, 'warning', 'CLASSIFICACAO_PADRAO', 'classificacao', values.classificacao, `Classificação padrão aplicada: ${classificacao}.`);
    }

    const numberKey = numero ? normalizedNumberKey(numero) : '';
    if (numberKey && seenNumbers.has(numberKey)) {
      addIssue(
        issues,
        row,
        'error',
        'NUMERO_DUPLICADO',
        'numero',
        values.numero,
        `Número duplicado; primeira ocorrência em ${seenNumbers.get(numberKey)}.`,
      );
    }

    const rowIssues = issues.slice(rowIssueStart);
    if (rowIssues.some((issue) => issue.severity === 'error')) return;

    seenNumbers.set(numberKey, `${row.sourceFile}:${row.sourceLine}`);
    const canonicalRecord = {
      source_line: rowIndex + 2,
      numero,
      tipo: tipo.value,
      assunto,
      responsavel,
      limite1: limite1.value,
      limite2: limite2.value,
      status,
      setor,
      classificacao,
    };
    payload.push(canonicalRecord);
    readyRows.push({
      sourceFile: row.sourceFile,
      originalLine: row.sourceLine,
      ...canonicalRecord,
    });
  });

  const sourceAggregateSha256 = sha256(sourceFiles
    .map((sourceFile) => `${sourceFile.name}\u0000${sourceFile.sha256}\u0000${sourceFile.recordCount}`)
    .join('\n'));
  const payloadSha256 = sha256(canonicalJson(payload));
  const summary = {
    sourceFileCount: sourceFiles.length,
    sourceRecords: sourceRows.length,
    readyRecords: payload.length,
    blockingIssues: issues.filter((issue) => issue.severity === 'error').length,
    warnings: issues.filter((issue) => issue.severity === 'warning').length,
  };
  const generatedAt = new Date().toISOString();
  const manifest = {
    version: 1,
    generatedAt,
    sourceAggregateSha256,
    sourceFiles,
    options: {
      defaultClassificacao: cleanText(defaultClassificacao),
      defaultSetor: cleanText(defaultSetor),
    },
    summary,
    payloadSha256,
  };

  return {
    generatedAt,
    payload,
    issues,
    readyRows,
    sourceFiles,
    summary,
    manifest,
  };
}

function csvEscape(value) {
  const text = String(value ?? '');
  return /[",\r\n;]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function issuesCsv(issues) {
  const headers = ['severity', 'code', 'source_file', 'source_line', 'field', 'original_value', 'message'];
  const rows = issues.map((issue) => [
    issue.severity,
    issue.code,
    issue.sourceFile,
    issue.sourceLine,
    issue.field,
    issue.originalValue,
    issue.message,
  ]);
  return [headers, ...rows].map((row) => row.map(csvEscape).join(',')).join('\n');
}

function styleHeader(row) {
  row.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF185A7D' } };
  row.alignment = { vertical: 'middle', horizontal: 'center' };
}

function setWorksheetDefaults(worksheet) {
  worksheet.views = [{ state: 'frozen', ySplit: 1 }];
  worksheet.autoFilter = worksheet.dimensions;
  worksheet.eachRow((row) => {
    row.alignment = { vertical: 'top', wrapText: true };
  });
}

async function migrationWorkbook(result, filePath) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'SITE CTRH';
  workbook.created = new Date(result.generatedAt);

  const summarySheet = workbook.addWorksheet('Resumo');
  summarySheet.columns = [
    { header: 'Indicador', key: 'metric', width: 34 },
    { header: 'Valor', key: 'value', width: 28 },
  ];
  styleHeader(summarySheet.getRow(1));
  summarySheet.addRows([
    { metric: 'Arquivos de origem', value: result.summary.sourceFileCount },
    { metric: 'Registros encontrados', value: result.summary.sourceRecords },
    { metric: 'Registros prontos', value: result.summary.readyRecords },
    { metric: 'Pendências impeditivas', value: result.summary.blockingIssues },
    { metric: 'Advertências', value: result.summary.warnings },
    { metric: 'Hash agregado das fontes', value: result.manifest.sourceAggregateSha256 },
    { metric: 'Hash do payload', value: result.manifest.payloadSha256 },
  ]);
  summarySheet.addRow([]);
  summarySheet.addRow(['Arquivo de origem', 'Registros / SHA-256']);
  styleHeader(summarySheet.getRow(summarySheet.rowCount));
  result.sourceFiles.forEach((sourceFile) => {
    summarySheet.addRow([sourceFile.name, `${sourceFile.recordCount} / ${sourceFile.sha256}`]);
  });
  summarySheet.getColumn(2).alignment = { wrapText: true, vertical: 'top' };

  const readySheet = workbook.addWorksheet('Prontos');
  readySheet.columns = [
    { header: 'Arquivo', key: 'sourceFile', width: 24 },
    { header: 'Linha original', key: 'originalLine', width: 14 },
    { header: 'Linha do lote', key: 'source_line', width: 13 },
    { header: 'Número', key: 'numero', width: 30 },
    { header: 'Tipo', key: 'tipo', width: 14 },
    { header: 'Assunto', key: 'assunto', width: 55 },
    { header: 'Responsável', key: 'responsavel', width: 24 },
    { header: 'Limite 1', key: 'limite1', width: 13 },
    { header: 'Limite 2', key: 'limite2', width: 13 },
    { header: 'Status', key: 'status', width: 24 },
    { header: 'Setor', key: 'setor', width: 18 },
    { header: 'Classificação', key: 'classificacao', width: 26 },
  ];
  styleHeader(readySheet.getRow(1));
  readySheet.addRows(result.readyRows);
  setWorksheetDefaults(readySheet);

  const issuesSheet = workbook.addWorksheet('Pendências');
  issuesSheet.columns = [
    { header: 'Severidade', key: 'severity', width: 14 },
    { header: 'Código', key: 'code', width: 28 },
    { header: 'Arquivo', key: 'sourceFile', width: 24 },
    { header: 'Linha', key: 'sourceLine', width: 10 },
    { header: 'Campo', key: 'field', width: 18 },
    { header: 'Valor original', key: 'originalValue', width: 38 },
    { header: 'Orientação', key: 'message', width: 60 },
  ];
  styleHeader(issuesSheet.getRow(1));
  issuesSheet.addRows(result.issues);
  setWorksheetDefaults(issuesSheet);

  await workbook.xlsx.writeFile(filePath);
}

export async function writeMigrationArtifacts(result, outputDir) {
  await mkdir(outputDir, { recursive: true });
  const paths = {
    payload: join(outputDir, 'payload.json'),
    manifest: join(outputDir, 'manifest.json'),
    issues: join(outputDir, 'issues.csv'),
    workbook: join(outputDir, 'relatorio-migracao.xlsx'),
  };

  await Promise.all([
    writeFile(paths.payload, `${JSON.stringify(result.payload, null, 2)}\n`, 'utf8'),
    writeFile(paths.manifest, `${JSON.stringify(result.manifest, null, 2)}\n`, 'utf8'),
    writeFile(paths.issues, `${issuesCsv(result.issues)}\n`, 'utf8'),
    migrationWorkbook(result, paths.workbook),
  ]);

  return paths;
}
