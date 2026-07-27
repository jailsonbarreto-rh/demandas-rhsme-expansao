import { Workbook, type Cell, type Worksheet } from 'exceljs';
import type { Demanda } from '../types';
import {
  buildExcelAnalytics,
  describeActiveFilters,
  getDeadlineInfo,
  parseBrazilianDate,
  sanitizeExcelText,
  type DistributionItem,
  type ExcelExportFilters,
} from './excelAnalytics';

export interface DemandasWorkbookOptions {
  demandas: Demanda[];
  userEmail: string;
  filters: ExcelExportFilters;
  generatedAt?: Date;
}

const COLORS = {
  navy: 'FF17324D',
  blue: 'FF2F6FA5',
  blueLight: 'FFEAF2F8',
  background: 'FFF3F6FA',
  white: 'FFFFFFFF',
  text: 'FF1F2937',
  muted: 'FF5B6675',
  border: 'FFD1D5DB',
  borderLight: 'FFE5E7EB',
  green: 'FF047857',
  greenLight: 'FFDCFCE7',
  amber: 'FF92400E',
  amberLight: 'FFFEF3C7',
  red: 'FFB91C1C',
  redLight: 'FFFEE2E2',
  purple: 'FF6D28D9',
  purpleLight: 'FFEDE9FE',
  gray: 'FF52525B',
  grayLight: 'FFF4F4F5',
} as const;

const THIN_BORDER = {
  top: { style: 'thin' as const, color: { argb: COLORS.borderLight } },
  left: { style: 'thin' as const, color: { argb: COLORS.borderLight } },
  bottom: { style: 'thin' as const, color: { argb: COLORS.borderLight } },
  right: { style: 'thin' as const, color: { argb: COLORS.borderLight } },
};

const STATUS_STYLE: Record<Demanda['status'], { fill: string; font: string }> = {
  'Aguardando Andamento': { fill: COLORS.grayLight, font: COLORS.gray },
  Tramitado: { fill: COLORS.blueLight, font: COLORS.navy },
  'Para Assinatura': { fill: COLORS.purpleLight, font: COLORS.purple },
  Encerrado: { fill: COLORS.greenLight, font: COLORS.green },
  Sobrestado: { fill: COLORS.grayLight, font: COLORS.gray },
  Ajustar: { fill: COLORS.amberLight, font: COLORS.amber },
};

const DEADLINE_STYLE: Record<string, { fill: string; font: string }> = {
  Vencidas: { fill: COLORS.redLight, font: COLORS.red },
  'Vencendo hoje': { fill: COLORS.amberLight, font: COLORS.amber },
  'Próximos 7 dias': { fill: 'FFFFF7ED', font: 'FFC2410C' },
  'No prazo': { fill: COLORS.greenLight, font: COLORS.green },
  'Sem prazo definido': { fill: COLORS.grayLight, font: COLORS.gray },
  Encerradas: { fill: COLORS.blueLight, font: COLORS.navy },
};

function fill(color: string) {
  return { type: 'pattern' as const, pattern: 'solid' as const, fgColor: { argb: color } };
}

function formatFileTimestamp(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}_${pad(date.getHours())}${pad(date.getMinutes())}`;
}

function applyBaseSheetStyle(worksheet: Worksheet): void {
  worksheet.properties.defaultRowHeight = 20;
  worksheet.pageSetup = {
    paperSize: 9,
    orientation: 'landscape',
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 0,
    margins: {
      left: 0.35,
      right: 0.35,
      top: 0.55,
      bottom: 0.55,
      header: 0.2,
      footer: 0.2,
    },
  };
  worksheet.headerFooter.oddFooter = '&LCTRH • SME-RJ&C&P de &N&RGerado pela Central de Demandas';
  worksheet.getColumn('A').alignment = { vertical: 'middle' };
}

function styleTitle(worksheet: Worksheet, title: string, subtitle: string, endColumn: string): void {
  worksheet.mergeCells(`A1:${endColumn}2`);
  const titleCell = worksheet.getCell('A1');
  titleCell.value = title;
  titleCell.font = { name: 'Aptos Display', size: 18, bold: true, color: { argb: COLORS.white } };
  titleCell.fill = fill(COLORS.navy);
  titleCell.alignment = { vertical: 'middle', horizontal: 'left' };
  titleCell.border = THIN_BORDER;
  worksheet.getRow(1).height = 27;
  worksheet.getRow(2).height = 27;

  worksheet.mergeCells(`A3:${endColumn}3`);
  const subtitleCell = worksheet.getCell('A3');
  subtitleCell.value = subtitle;
  subtitleCell.font = { name: 'Aptos', size: 10, italic: true, color: { argb: COLORS.muted } };
  subtitleCell.fill = fill(COLORS.background);
  subtitleCell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
  subtitleCell.border = THIN_BORDER;
  worksheet.getRow(3).height = 30;
}

function setMetadataRow(
  worksheet: Worksheet,
  row: number,
  label: string,
  value: string | number | Date,
  endColumn: string,
): void {
  worksheet.getCell(`A${row}`).value = label;
  worksheet.getCell(`A${row}`).font = { name: 'Aptos', size: 9, bold: true, color: { argb: COLORS.navy } };
  worksheet.getCell(`A${row}`).fill = fill(COLORS.blueLight);
  worksheet.getCell(`A${row}`).border = THIN_BORDER;
  worksheet.getCell(`A${row}`).alignment = { vertical: 'middle' };

  worksheet.mergeCells(`B${row}:${endColumn}${row}`);
  const valueCell = worksheet.getCell(`B${row}`);
  valueCell.value = value;
  valueCell.font = { name: 'Aptos', size: 9, color: { argb: COLORS.text } };
  valueCell.fill = fill(COLORS.white);
  valueCell.border = THIN_BORDER;
  valueCell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
  if (value instanceof Date) valueCell.numFmt = 'dd/mm/yyyy hh:mm';
  worksheet.getRow(row).height = 22;
}

function writeSectionTitle(worksheet: Worksheet, row: number, title: string, start: string, end: string): void {
  worksheet.mergeCells(`${start}${row}:${end}${row}`);
  const cell = worksheet.getCell(`${start}${row}`);
  cell.value = title.toUpperCase();
  cell.font = { name: 'Aptos', size: 10, bold: true, color: { argb: COLORS.navy } };
  cell.fill = fill(COLORS.blueLight);
  cell.border = THIN_BORDER;
  cell.alignment = { vertical: 'middle', horizontal: 'left' };
  worksheet.getRow(row).height = 24;
}

function writeKpiCard(
  worksheet: Worksheet,
  startColumn: string,
  endColumn: string,
  label: string,
  value: number,
  background: string,
  foreground: string,
): void {
  worksheet.mergeCells(`${startColumn}10:${endColumn}10`);
  worksheet.mergeCells(`${startColumn}11:${endColumn}12`);

  const labelCell = worksheet.getCell(`${startColumn}10`);
  labelCell.value = label.toUpperCase();
  labelCell.fill = fill(background);
  labelCell.font = { name: 'Aptos', size: 8, bold: true, color: { argb: foreground } };
  labelCell.alignment = { horizontal: 'center', vertical: 'middle' };
  labelCell.border = THIN_BORDER;

  const valueCell = worksheet.getCell(`${startColumn}11`);
  valueCell.value = value;
  valueCell.fill = fill(background);
  valueCell.font = { name: 'Aptos Display', size: 22, bold: true, color: { argb: foreground } };
  valueCell.alignment = { horizontal: 'center', vertical: 'middle' };
  valueCell.border = THIN_BORDER;
}

function barText(percentage: number, slots = 10): string {
  const filled = Math.min(slots, Math.max(0, Math.round((percentage / 100) * slots)));
  return `${'█'.repeat(filled)}${'░'.repeat(slots - filled)}  ${percentage.toFixed(1)}%`;
}

function writeDistributionSection(
  worksheet: Worksheet,
  title: string,
  items: DistributionItem[],
  titleRow: number,
  startColumns: { labelStart: string; labelEnd: string; count: string; barStart: string; barEnd: string },
  maxItems = 10,
): void {
  writeSectionTitle(worksheet, titleRow, title, startColumns.labelStart, startColumns.barEnd);

  const headerRow = titleRow + 1;
  worksheet.mergeCells(`${startColumns.labelStart}${headerRow}:${startColumns.labelEnd}${headerRow}`);
  worksheet.getCell(`${startColumns.labelStart}${headerRow}`).value = 'Categoria';
  worksheet.getCell(`${startColumns.count}${headerRow}`).value = 'Qtd.';
  worksheet.mergeCells(`${startColumns.barStart}${headerRow}:${startColumns.barEnd}${headerRow}`);
  worksheet.getCell(`${startColumns.barStart}${headerRow}`).value = 'Participação';

  for (const address of [
    `${startColumns.labelStart}${headerRow}`,
    `${startColumns.count}${headerRow}`,
    `${startColumns.barStart}${headerRow}`,
  ]) {
    const cell = worksheet.getCell(address);
    cell.font = { name: 'Aptos', size: 8, bold: true, color: { argb: COLORS.white } };
    cell.fill = fill(COLORS.navy);
    cell.border = THIN_BORDER;
    cell.alignment = { vertical: 'middle', horizontal: address.startsWith(startColumns.labelStart) ? 'left' : 'center' };
  }

  items.slice(0, maxItems).forEach((item, index) => {
    const row = headerRow + 1 + index;
    worksheet.mergeCells(`${startColumns.labelStart}${row}:${startColumns.labelEnd}${row}`);
    worksheet.getCell(`${startColumns.labelStart}${row}`).value = sanitizeExcelText(item.label);
    worksheet.getCell(`${startColumns.count}${row}`).value = item.count;
    worksheet.mergeCells(`${startColumns.barStart}${row}:${startColumns.barEnd}${row}`);
    worksheet.getCell(`${startColumns.barStart}${row}`).value = barText(item.percentage);

    for (const address of [
      `${startColumns.labelStart}${row}`,
      `${startColumns.count}${row}`,
      `${startColumns.barStart}${row}`,
    ]) {
      const cell = worksheet.getCell(address);
      cell.font = {
        name: address.startsWith(startColumns.barStart) ? 'Consolas' : 'Aptos',
        size: 8.5,
        color: { argb: address.startsWith(startColumns.barStart) ? COLORS.blue : COLORS.text },
      };
      cell.fill = fill(index % 2 === 0 ? COLORS.white : 'FFFAFBFC');
      cell.border = THIN_BORDER;
      cell.alignment = {
        vertical: 'middle',
        horizontal: address.startsWith(startColumns.labelStart) ? 'left' : 'center',
      };
    }
    worksheet.getRow(row).height = 21;
  });
}

function applySemanticCellStyle(cell: Cell, style: { fill: string; font: string }): void {
  cell.fill = fill(style.fill);
  cell.font = { name: 'Aptos', size: 9, bold: true, color: { argb: style.font } };
  cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
}

function buildSummarySheet(
  workbook: Workbook,
  options: Required<DemandasWorkbookOptions>,
): void {
  const worksheet = workbook.addWorksheet('Resumo', {
    properties: { tabColor: { argb: COLORS.navy } },
  });
  applyBaseSheetStyle(worksheet);
  worksheet.views = [{ state: 'frozen', ySplit: 3, activeCell: 'A4' }];

  const widths = [16, 16, 12, 16, 16, 12, 12, 4, 16, 16, 12, 16, 16, 12];
  widths.forEach((width, index) => { worksheet.getColumn(index + 1).width = width; });

  const analytics = buildExcelAnalytics(options.demandas, options.generatedAt);
  const filters = describeActiveFilters(options.filters);
  const filterSummary = filters.map(([label, value]) => `${label}: ${value}`).join(' • ');

  styleTitle(
    worksheet,
    'CENTRAL DE DEMANDAS — RELATÓRIO ANALÍTICO',
    'Leitura executiva do recorte filtrado: volume, composição, responsáveis e situação dos prazos.',
    'N',
  );

  setMetadataRow(worksheet, 5, 'Data e hora', options.generatedAt, 'N');
  setMetadataRow(worksheet, 6, 'Usuário', sanitizeExcelText(options.userEmail), 'N');
  setMetadataRow(worksheet, 7, 'Fonte', 'Central de Demandas — Base compartilhada Supabase • Modelo de exportação v1.0', 'N');
  setMetadataRow(worksheet, 8, 'Registros exportados', options.demandas.length, 'N');
  setMetadataRow(worksheet, 9, 'Recorte aplicado', sanitizeExcelText(filterSummary), 'N');

  writeKpiCard(worksheet, 'A', 'B', 'Total', analytics.kpis.total, COLORS.navy, COLORS.white);
  writeKpiCard(worksheet, 'C', 'D', 'Em acompanhamento', analytics.kpis.emAcompanhamento, COLORS.blueLight, COLORS.navy);
  writeKpiCard(worksheet, 'E', 'F', 'Encerradas', analytics.kpis.encerrados, COLORS.greenLight, COLORS.green);
  writeKpiCard(worksheet, 'G', 'H', 'Para assinatura', analytics.kpis.paraAssinatura, COLORS.purpleLight, COLORS.purple);
  writeKpiCard(worksheet, 'I', 'J', 'Vencidas', analytics.kpis.vencidos, COLORS.redLight, COLORS.red);
  writeKpiCard(worksheet, 'K', 'L', 'Vencendo hoje', analytics.kpis.vencendoHoje, COLORS.amberLight, COLORS.amber);
  worksheet.mergeCells('M10:N12');
  const noteCell = worksheet.getCell('M10');
  noteCell.value = 'CORES SEMÂNTICAS\nA cor reforça a leitura, mas todos os estados permanecem identificados por texto e quantidade.';
  noteCell.fill = fill(COLORS.background);
  noteCell.font = { name: 'Aptos', size: 8, color: { argb: COLORS.muted } };
  noteCell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
  noteCell.border = THIN_BORDER;
  worksheet.getRow(10).height = 24;
  worksheet.getRow(11).height = 28;
  worksheet.getRow(12).height = 28;

  const leftColumns = { labelStart: 'A', labelEnd: 'B', count: 'C', barStart: 'D', barEnd: 'G' };
  const rightColumns = { labelStart: 'I', labelEnd: 'J', count: 'K', barStart: 'L', barEnd: 'N' };

  writeDistributionSection(worksheet, 'Composição por status', analytics.byStatus, 15, leftColumns, 8);
  writeDistributionSection(worksheet, 'Composição por tipo', analytics.byType, 15, rightColumns, 8);
  writeDistributionSection(worksheet, 'Demandas por setor informado', analytics.bySector, 27, leftColumns, 8);
  writeDistributionSection(worksheet, 'Composição por classificação', analytics.byClassification, 27, rightColumns, 8);
  writeDistributionSection(worksheet, 'Situação operacional dos prazos', analytics.deadlineSituation, 39, leftColumns, 8);
  writeDistributionSection(worksheet, 'Faixas de dias até o prazo', analytics.deadlineRanges, 39, rightColumns, 8);

  writeDistributionSection(
    worksheet,
    'Distribuição por responsável — 10 maiores volumes',
    analytics.distribuicaoResponsaveis,
    52,
    { labelStart: 'A', labelEnd: 'D', count: 'E', barStart: 'F', barEnd: 'N' },
    10,
  );

  const filtersStart = 66;
  writeSectionTitle(worksheet, filtersStart, 'Critérios e rastreabilidade da exportação', 'A', 'N');
  const filterHeaderRow = filtersStart + 1;
  worksheet.getCell(`A${filterHeaderRow}`).value = 'Critério';
  worksheet.mergeCells(`B${filterHeaderRow}:N${filterHeaderRow}`);
  worksheet.getCell(`B${filterHeaderRow}`).value = 'Valor aplicado';
  for (const address of [`A${filterHeaderRow}`, `B${filterHeaderRow}`]) {
    const cell = worksheet.getCell(address);
    cell.fill = fill(COLORS.navy);
    cell.font = { name: 'Aptos', size: 8, bold: true, color: { argb: COLORS.white } };
    cell.border = THIN_BORDER;
  }

  filters.forEach(([label, value], index) => {
    const row = filterHeaderRow + 1 + index;
    worksheet.getCell(`A${row}`).value = label;
    worksheet.mergeCells(`B${row}:N${row}`);
    worksheet.getCell(`B${row}`).value = sanitizeExcelText(value);
    for (const address of [`A${row}`, `B${row}`]) {
      const cell = worksheet.getCell(address);
      cell.fill = fill(index % 2 === 0 ? COLORS.white : 'FFFAFBFC');
      cell.font = { name: 'Aptos', size: 8.5, color: { argb: COLORS.text } };
      cell.border = THIN_BORDER;
      cell.alignment = { vertical: 'middle', wrapText: true };
    }
  });

  const noteRow = filterHeaderRow + filters.length + 2;
  worksheet.mergeCells(`A${noteRow}:N${noteRow + 2}`);
  const traceCell = worksheet.getCell(`A${noteRow}`);
  traceCell.value = 'NOTA DE LEITURA E GOVERNANÇA\nOs indicadores representam exclusivamente os registros visíveis após a aplicação dos filtros registrados acima. O prazo analítico utiliza “Limite 2” como prazo final. Demandas encerradas são segregadas e não compõem o indicador de vencimento. Arquivo gerado sem macros e sem conexão externa.';
  traceCell.fill = fill(COLORS.background);
  traceCell.font = { name: 'Aptos', size: 8.5, color: { argb: COLORS.muted } };
  traceCell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
  traceCell.border = THIN_BORDER;

  worksheet.pageSetup.printArea = `A1:N${noteRow + 2}`;
  worksheet.pageSetup.printTitlesRow = '1:3';
}

function buildDataSheet(
  workbook: Workbook,
  options: Required<DemandasWorkbookOptions>,
): void {
  const worksheet = workbook.addWorksheet('Demandas', {
    properties: { tabColor: { argb: COLORS.blue } },
  });
  applyBaseSheetStyle(worksheet);
  worksheet.views = [{ state: 'frozen', ySplit: 8, activeCell: 'A9' }];

  const columns = [
    { width: 9 },
    { width: 24 },
    { width: 14 },
    { width: 42 },
    { width: 24 },
    { width: 14 },
    { width: 14 },
    { width: 24 },
    { width: 18 },
    { width: 20 },
    { width: 22 },
    { width: 16 },
  ];
  columns.forEach((column, index) => { worksheet.getColumn(index + 1).width = column.width; });

  styleTitle(
    worksheet,
    'CENTRAL DE DEMANDAS — BASE EXPORTADA',
    'Base estruturada correspondente ao recorte ativo no momento da exportação. Utilize os filtros do cabeçalho para análises adicionais.',
    'L',
  );

  const filters = describeActiveFilters(options.filters);
  const filterSummary = filters.map(([label, value]) => `${label}: ${value}`).join(' • ');
  setMetadataRow(worksheet, 5, 'Data e hora', options.generatedAt, 'L');
  setMetadataRow(worksheet, 6, 'Usuário', sanitizeExcelText(options.userEmail), 'L');
  setMetadataRow(worksheet, 7, 'Recorte', sanitizeExcelText(filterSummary), 'L');

  const rows = options.demandas.map((demanda) => {
    const deadline = getDeadlineInfo(demanda, options.generatedAt);
    return [
      demanda.id,
      sanitizeExcelText(demanda.numero),
      sanitizeExcelText(demanda.tipo),
      sanitizeExcelText(demanda.assunto),
      sanitizeExcelText(demanda.responsavel),
      parseBrazilianDate(demanda.limite1),
      parseBrazilianDate(demanda.limite2),
      sanitizeExcelText(demanda.status),
      sanitizeExcelText(demanda.setor),
      sanitizeExcelText(demanda.classificacao),
      deadline.situation,
      deadline.daysUntil,
    ];
  });

  const headers = [
    'ID',
    'Número',
    'Tipo',
    'Assunto',
    'Responsável',
    'Limite 1',
    'Limite 2',
    'Status',
    'Setor',
    'Classificação',
    'Situação do prazo',
    'Dias até o prazo',
  ];
  worksheet.getRow(8).values = headers;
  rows.forEach((values, index) => {
    worksheet.getRow(9 + index).values = values;
  });

  const headerRow = worksheet.getRow(8);
  headerRow.height = 32;
  headerRow.eachCell((cell) => {
    cell.fill = fill(COLORS.navy);
    cell.font = { name: 'Aptos', size: 9, bold: true, color: { argb: COLORS.white } };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = THIN_BORDER;
  });

  const lastRow = 8 + rows.length;
  for (let rowNumber = 9; rowNumber <= lastRow; rowNumber += 1) {
    const row = worksheet.getRow(rowNumber);
    row.height = 34;
    row.eachCell({ includeEmpty: true }, (cell, columnNumber) => {
      cell.font = { name: 'Aptos', size: 9, color: { argb: COLORS.text } };
      cell.fill = fill((rowNumber - 9) % 2 === 0 ? COLORS.white : 'FFFAFBFC');
      cell.alignment = {
        vertical: 'middle',
        horizontal: [1, 6, 7, 12].includes(columnNumber) ? 'center' : 'left',
        wrapText: [2, 4, 5, 8, 9, 10, 11].includes(columnNumber),
      };
      cell.border = THIN_BORDER;
    });

    worksheet.getCell(`F${rowNumber}`).numFmt = 'dd/mm/yyyy';
    worksheet.getCell(`G${rowNumber}`).numFmt = 'dd/mm/yyyy';
    worksheet.getCell(`L${rowNumber}`).numFmt = '0;[Red]-0;"—"';

    const demanda = options.demandas[rowNumber - 9];
    applySemanticCellStyle(worksheet.getCell(`H${rowNumber}`), STATUS_STYLE[demanda.status]);
    const deadlineStyle = DEADLINE_STYLE[String(worksheet.getCell(`K${rowNumber}`).value)] ?? {
      fill: COLORS.grayLight,
      font: COLORS.gray,
    };
    applySemanticCellStyle(worksheet.getCell(`K${rowNumber}`), deadlineStyle);
  }

  worksheet.autoFilter = `A8:L${lastRow}`;
  worksheet.pageSetup.printArea = `A1:L${lastRow}`;
  worksheet.pageSetup.printTitlesRow = '1:8';
  worksheet.headerFooter.oddHeader = '&LCentral de Demandas — CTRH SME&RBase exportada';
}

export function buildDemandasWorkbook(options: DemandasWorkbookOptions): Workbook {
  const normalizedOptions: Required<DemandasWorkbookOptions> = {
    ...options,
    generatedAt: options.generatedAt ?? new Date(),
  };

  const workbook = new Workbook();
  workbook.creator = 'Central de Demandas — CTRH SME';
  workbook.lastModifiedBy = normalizedOptions.userEmail;
  workbook.created = normalizedOptions.generatedAt;
  workbook.modified = normalizedOptions.generatedAt;
  workbook.company = 'Secretaria Municipal de Educação do Rio de Janeiro';
  workbook.subject = 'Relatório analítico de demandas filtradas';
  workbook.title = 'Central de Demandas — Exportação analítica';
  workbook.description = 'Workbook gerado pela Central de Demandas com resumo gerencial e base estruturada.';
  workbook.keywords = 'SME-RJ, CTRH, demandas, prazos, relatório analítico';
  workbook.calcProperties.fullCalcOnLoad = true;

  buildSummarySheet(workbook, normalizedOptions);
  buildDataSheet(workbook, normalizedOptions);
  return workbook;
}

export async function exportDemandasExcel(options: DemandasWorkbookOptions): Promise<string> {
  const generatedAt = options.generatedAt ?? new Date();
  const workbook = buildDemandasWorkbook({ ...options, generatedAt });
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob(
    [buffer as unknown as BlobPart],
    { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
  );
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const fileName = `central_demandas_analitico_${formatFileTimestamp(generatedAt)}.xlsx`;
  link.href = url;
  link.download = fileName;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  link.remove();
  globalThis.setTimeout(() => URL.revokeObjectURL(url), 30_000);
  return fileName;
}
