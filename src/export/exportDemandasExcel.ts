import { Workbook, type Cell, type Worksheet } from 'exceljs';
import type { Demanda } from '../types';
import {
  buildExcelAnalytics,
  describeActiveFilters,
  getDeadlineInfo,
  getDeadlineStateLabel,
  getFollowUpInfo,
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

const TEMPORAL_STYLE: Record<string, { fill: string; font: string }> = {
  Vencidas: { fill: COLORS.redLight, font: COLORS.red },
  'Prazo final vencido': { fill: COLORS.redLight, font: COLORS.red },
  'Providência vencida': { fill: COLORS.redLight, font: COLORS.red },
  'Vencendo hoje': { fill: COLORS.amberLight, font: COLORS.amber },
  'Providência hoje': { fill: COLORS.amberLight, font: COLORS.amber },
  'Próximos 7 dias': { fill: 'FFFFF7ED', font: 'FFC2410C' },
  'No prazo': { fill: COLORS.greenLight, font: COLORS.green },
  Futura: { fill: COLORS.greenLight, font: COLORS.green },
  'Sem prazo definido': { fill: COLORS.grayLight, font: COLORS.gray },
  'Não informada': { fill: COLORS.grayLight, font: COLORS.gray },
  'Não exigida': { fill: COLORS.blueLight, font: COLORS.navy },
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
    margins: { left: 0.35, right: 0.35, top: 0.55, bottom: 0.55, header: 0.2, footer: 0.2 },
  };
  worksheet.headerFooter.oddFooter = '&LCTRH • SME-RJ&C&P de &N&RGerado pelo Radar de Governança';
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
  labelCell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
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
  columns: { labelStart: string; labelEnd: string; count: string; barStart: string; barEnd: string },
  maxItems = 10,
): void {
  writeSectionTitle(worksheet, titleRow, title, columns.labelStart, columns.barEnd);
  const headerRow = titleRow + 1;
  worksheet.mergeCells(`${columns.labelStart}${headerRow}:${columns.labelEnd}${headerRow}`);
  worksheet.getCell(`${columns.labelStart}${headerRow}`).value = 'Categoria';
  worksheet.getCell(`${columns.count}${headerRow}`).value = 'Qtd.';
  worksheet.mergeCells(`${columns.barStart}${headerRow}:${columns.barEnd}${headerRow}`);
  worksheet.getCell(`${columns.barStart}${headerRow}`).value = 'Participação';

  for (const address of [
    `${columns.labelStart}${headerRow}`,
    `${columns.count}${headerRow}`,
    `${columns.barStart}${headerRow}`,
  ]) {
    const cell = worksheet.getCell(address);
    cell.font = { name: 'Aptos', size: 8, bold: true, color: { argb: COLORS.white } };
    cell.fill = fill(COLORS.navy);
    cell.border = THIN_BORDER;
    cell.alignment = { vertical: 'middle', horizontal: address.startsWith(columns.labelStart) ? 'left' : 'center' };
  }

  items.slice(0, maxItems).forEach((item, index) => {
    const row = headerRow + 1 + index;
    worksheet.mergeCells(`${columns.labelStart}${row}:${columns.labelEnd}${row}`);
    worksheet.getCell(`${columns.labelStart}${row}`).value = sanitizeExcelText(item.label);
    worksheet.getCell(`${columns.count}${row}`).value = item.count;
    worksheet.mergeCells(`${columns.barStart}${row}:${columns.barEnd}${row}`);
    worksheet.getCell(`${columns.barStart}${row}`).value = barText(item.percentage);
    for (const address of [
      `${columns.labelStart}${row}`,
      `${columns.count}${row}`,
      `${columns.barStart}${row}`,
    ]) {
      const cell = worksheet.getCell(address);
      cell.font = {
        name: address.startsWith(columns.barStart) ? 'Consolas' : 'Aptos',
        size: 8.5,
        color: { argb: address.startsWith(columns.barStart) ? COLORS.blue : COLORS.text },
      };
      cell.fill = fill(index % 2 === 0 ? COLORS.white : 'FFFAFBFC');
      cell.border = THIN_BORDER;
      cell.alignment = { vertical: 'middle', horizontal: address.startsWith(columns.labelStart) ? 'left' : 'center' };
    }
  });
}

function applySemanticCellStyle(cell: Cell, style: { fill: string; font: string }): void {
  cell.fill = fill(style.fill);
  cell.font = { name: 'Aptos', size: 9, bold: true, color: { argb: style.font } };
  cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
}

function buildSummarySheet(workbook: Workbook, options: Required<DemandasWorkbookOptions>): void {
  const worksheet = workbook.addWorksheet('Resumo', { properties: { tabColor: { argb: COLORS.navy } } });
  applyBaseSheetStyle(worksheet);
  worksheet.views = [{ state: 'frozen', ySplit: 3, activeCell: 'A4' }];
  Array.from({ length: 14 }, (_, index) => index + 1).forEach((column) => {
    worksheet.getColumn(column).width = column === 8 ? 4 : 16;
  });

  const analytics = buildExcelAnalytics(options.demandas, options.generatedAt);
  const filters = describeActiveFilters(options.filters);
  const filterSummary = filters.map(([label, value]) => `${label}: ${value}`).join(' • ');

  styleTitle(
    worksheet,
    'RADAR DE GOVERNANÇA — RELATÓRIO ANALÍTICO',
    'Leitura do recorte filtrado, com prazo final e próxima providência tratados como dimensões distintas.',
    'N',
  );
  setMetadataRow(worksheet, 5, 'Data e hora', options.generatedAt, 'N');
  setMetadataRow(worksheet, 6, 'Usuário', sanitizeExcelText(options.userEmail), 'N');
  setMetadataRow(worksheet, 7, 'Fonte', 'SITE CTRH — Base compartilhada Supabase • Exportação R4', 'N');
  setMetadataRow(worksheet, 8, 'Registros exportados', options.demandas.length, 'N');
  setMetadataRow(worksheet, 9, 'Recorte aplicado', sanitizeExcelText(filterSummary), 'N');

  writeKpiCard(worksheet, 'A', 'B', 'Total', analytics.kpis.total, COLORS.navy, COLORS.white);
  writeKpiCard(worksheet, 'C', 'D', 'Em acompanhamento', analytics.kpis.emAcompanhamento, COLORS.blueLight, COLORS.navy);
  writeKpiCard(worksheet, 'E', 'F', 'Prazo final vencido', analytics.kpis.vencidos, COLORS.redLight, COLORS.red);
  writeKpiCard(worksheet, 'G', 'H', 'Prazo final hoje', analytics.kpis.vencendoHoje, COLORS.amberLight, COLORS.amber);
  writeKpiCard(worksheet, 'I', 'J', 'Providência vencida', analytics.kpis.providenciasVencidas, COLORS.redLight, COLORS.red);
  writeKpiCard(worksheet, 'K', 'L', 'Providência hoje', analytics.kpis.providenciasHoje, COLORS.amberLight, COLORS.amber);
  writeKpiCard(worksheet, 'M', 'N', 'Para assinatura', analytics.kpis.paraAssinatura, COLORS.purpleLight, COLORS.purple);

  const left = { labelStart: 'A', labelEnd: 'B', count: 'C', barStart: 'D', barEnd: 'G' };
  const right = { labelStart: 'I', labelEnd: 'J', count: 'K', barStart: 'L', barEnd: 'N' };
  writeDistributionSection(worksheet, 'Composição por status', analytics.byStatus, 15, left, 8);
  writeDistributionSection(worksheet, 'Composição por tipo', analytics.byType, 15, right, 8);
  writeDistributionSection(worksheet, 'Demandas por setor informado', analytics.bySector, 27, left, 8);
  writeDistributionSection(worksheet, 'Composição por classificação', analytics.byClassification, 27, right, 8);
  writeDistributionSection(worksheet, 'Situação do prazo final', analytics.deadlineSituation, 39, left, 8);
  writeDistributionSection(worksheet, 'Situação da próxima providência', analytics.followUpSituation, 39, right, 8);
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
  traceCell.value = 'NOTA DE LEITURA E GOVERNANÇA\nAusência legada não é atraso. Os cartões de vencimento referem-se ao prazo final. A próxima providência possui leitura própria. “Próximos 7 dias” é informação temporal e não classificação automática de urgência.';
  traceCell.fill = fill(COLORS.background);
  traceCell.font = { name: 'Aptos', size: 8.5, color: { argb: COLORS.muted } };
  traceCell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
  traceCell.border = THIN_BORDER;
  worksheet.pageSetup.printArea = `A1:N${noteRow + 2}`;
  worksheet.pageSetup.printTitlesRow = '1:3';
}

function buildDataSheet(workbook: Workbook, options: Required<DemandasWorkbookOptions>): void {
  const worksheet = workbook.addWorksheet('Demandas', { properties: { tabColor: { argb: COLORS.blue } } });
  applyBaseSheetStyle(worksheet);
  worksheet.views = [{ state: 'frozen', ySplit: 8, activeCell: 'A9' }];

  const widths = [9, 24, 14, 42, 24, 14, 18, 14, 18, 16, 18, 20, 42, 16, 22, 14, 22, 14, 14, 26, 30, 30];
  widths.forEach((width, index) => { worksheet.getColumn(index + 1).width = width; });

  styleTitle(
    worksheet,
    'RADAR DE GOVERNANÇA — BASE EXPORTADA',
    'Base estruturada correspondente ao recorte ativo. Estados legados são preservados sem inferência.',
    'V',
  );
  const filters = describeActiveFilters(options.filters);
  const filterSummary = filters.map(([label, value]) => `${label}: ${value}`).join(' • ');
  setMetadataRow(worksheet, 5, 'Data e hora', options.generatedAt, 'V');
  setMetadataRow(worksheet, 6, 'Usuário', sanitizeExcelText(options.userEmail), 'V');
  setMetadataRow(worksheet, 7, 'Recorte', sanitizeExcelText(filterSummary), 'V');

  const headers = [
    'ID', 'Número', 'Tipo', 'Assunto', 'Responsável',
    'Prazo interno', 'Situação do prazo interno',
    'Prazo final', 'Situação do prazo final',
    'Status', 'Setor', 'Classificação',
    'Próxima providência', 'Data da próxima providência', 'Situação da próxima providência',
    'Dias até a providência', 'Situação temporal do prazo final', 'Dias até o prazo final',
    'Origem', 'Link de origem', 'Justificativa do prazo interno', 'Justificativa do prazo final',
  ];
  worksheet.getRow(8).values = headers;

  options.demandas.forEach((demanda, index) => {
    const finalDeadline = getDeadlineInfo(demanda, options.generatedAt);
    const followUp = getFollowUpInfo(demanda, options.generatedAt);
    worksheet.getRow(9 + index).values = [
      demanda.id,
      sanitizeExcelText(demanda.numero),
      sanitizeExcelText(demanda.tipo),
      sanitizeExcelText(demanda.assunto),
      sanitizeExcelText(demanda.responsavel),
      demanda.limite1Situacao === 'definido' ? parseBrazilianDate(demanda.limite1) : null,
      getDeadlineStateLabel(demanda.limite1Situacao, demanda.limite1),
      demanda.limite2Situacao === 'definido' ? parseBrazilianDate(demanda.limite2) : null,
      getDeadlineStateLabel(demanda.limite2Situacao, demanda.limite2),
      sanitizeExcelText(demanda.status),
      sanitizeExcelText(demanda.setor),
      sanitizeExcelText(demanda.classificacao),
      sanitizeExcelText(demanda.proximaAcao),
      followUp.date,
      followUp.situation,
      followUp.daysUntil,
      finalDeadline.situation,
      finalDeadline.daysUntil,
      demanda.origem === 'legado' ? 'Legado' : 'Sistema',
      sanitizeExcelText(demanda.linkOrigem),
      sanitizeExcelText(demanda.limite1Justificativa),
      sanitizeExcelText(demanda.limite2Justificativa),
    ];
  });

  const headerRow = worksheet.getRow(8);
  headerRow.height = 42;
  headerRow.eachCell((cell) => {
    cell.fill = fill(COLORS.navy);
    cell.font = { name: 'Aptos', size: 9, bold: true, color: { argb: COLORS.white } };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = THIN_BORDER;
  });

  const lastRow = 8 + options.demandas.length;
  for (let rowNumber = 9; rowNumber <= lastRow; rowNumber += 1) {
    const row = worksheet.getRow(rowNumber);
    row.height = 42;
    row.eachCell({ includeEmpty: true }, (cell, columnNumber) => {
      cell.font = { name: 'Aptos', size: 9, color: { argb: COLORS.text } };
      cell.fill = fill((rowNumber - 9) % 2 === 0 ? COLORS.white : 'FFFAFBFC');
      cell.alignment = {
        vertical: 'middle',
        horizontal: [1, 6, 7, 8, 9, 10, 14, 15, 16, 17, 18, 19].includes(columnNumber) ? 'center' : 'left',
        wrapText: true,
      };
      cell.border = THIN_BORDER;
    });
    worksheet.getCell(`F${rowNumber}`).numFmt = 'dd/mm/yyyy';
    worksheet.getCell(`H${rowNumber}`).numFmt = 'dd/mm/yyyy';
    worksheet.getCell(`N${rowNumber}`).numFmt = 'dd/mm/yyyy';
    worksheet.getCell(`P${rowNumber}`).numFmt = '0;[Red]-0;"—"';
    worksheet.getCell(`R${rowNumber}`).numFmt = '0;[Red]-0;"—"';

    const demanda = options.demandas[rowNumber - 9];
    applySemanticCellStyle(worksheet.getCell(`J${rowNumber}`), STATUS_STYLE[demanda.status]);
    const followUpStyle = TEMPORAL_STYLE[String(worksheet.getCell(`O${rowNumber}`).value)]
      ?? { fill: COLORS.grayLight, font: COLORS.gray };
    const finalStyle = TEMPORAL_STYLE[String(worksheet.getCell(`Q${rowNumber}`).value)]
      ?? { fill: COLORS.grayLight, font: COLORS.gray };
    applySemanticCellStyle(worksheet.getCell(`O${rowNumber}`), followUpStyle);
    applySemanticCellStyle(worksheet.getCell(`Q${rowNumber}`), finalStyle);
  }

  worksheet.autoFilter = `A8:V${lastRow}`;
  worksheet.pageSetup.printArea = `A1:V${lastRow}`;
  worksheet.pageSetup.printTitlesRow = '1:8';
  worksheet.headerFooter.oddHeader = '&LRadar de Governança — CTRH SME&RBase exportada';
}

export function buildDemandasWorkbook(options: DemandasWorkbookOptions): Workbook {
  const normalizedOptions: Required<DemandasWorkbookOptions> = {
    ...options,
    generatedAt: options.generatedAt ?? new Date(),
  };
  const workbook = new Workbook();
  workbook.creator = 'Radar de Governança — CTRH SME';
  workbook.lastModifiedBy = normalizedOptions.userEmail;
  workbook.created = normalizedOptions.generatedAt;
  workbook.modified = normalizedOptions.generatedAt;
  workbook.company = 'Secretaria Municipal de Educação do Rio de Janeiro';
  workbook.subject = 'Relatório analítico de demandas filtradas';
  workbook.title = 'Radar de Governança — Exportação analítica';
  workbook.description = 'Workbook gerado pelo SITE CTRH com resumo e base estruturada do R4.';
  workbook.keywords = 'SME-RJ, CTRH, demandas, prazos, próxima providência, relatório analítico';
  workbook.calcProperties.fullCalcOnLoad = true;
  buildSummarySheet(workbook, normalizedOptions);
  buildDataSheet(workbook, normalizedOptions);
  return workbook;
}

export async function exportDemandasExcel(options: DemandasWorkbookOptions): Promise<string> {
  const generatedAt = options.generatedAt ?? new Date();
  const workbook = buildDemandasWorkbook({ ...options, generatedAt });
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer as unknown as BlobPart], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const fileName = `radar_governanca_analitico_${formatFileTimestamp(generatedAt)}.xlsx`;
  link.href = url;
  link.download = fileName;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  link.remove();
  globalThis.setTimeout(() => URL.revokeObjectURL(url), 30_000);
  return fileName;
}
