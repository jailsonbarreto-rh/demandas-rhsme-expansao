import { writeFile } from 'node:fs/promises';
import { Workbook } from 'exceljs';
import JSZip from 'jszip';
import { describe, expect, it } from 'vitest';
import { DEFAULT_DEMAND_FILTERS } from '../filters/filterTypes';
import { createDemandFixture } from '../test/expandedFixtures';
import { buildDemandasWorkbook } from './exportDemandasExcel';

const demandas = [
  createDemandFixture({
    id: 7,
    numero: 'SME-PRO-2026/00007',
    tipo: 'Processo',
    assunto: '=HIPERLINK("https://exemplo.invalid")',
    responsavel: 'Ana Souza',
    limite1: '15/07/2026',
    limite1Situacao: 'definido',
    limite2: '20/07/2026',
    limite2Situacao: 'definido',
    proximaAcao: 'Conferir assinatura e encaminhar resposta',
    proximaAcaoEm: '16/07/2026',
    status: 'Para Assinatura',
    setor: 'CTRH',
    classificacao: 'Administrativa',
    origem: 'sistema',
  }),
  createDemandFixture({
    id: 8,
    numero: 'EXP-008',
    tipo: 'Expediente',
    assunto: 'Resposta institucional',
    responsavel: 'Bruno Lima',
    limite1: '',
    limite1Situacao: 'nao_informado',
    limite2: '',
    limite2Situacao: 'nao_informado',
    proximaAcao: '',
    proximaAcaoEm: '',
    status: 'Encerrado',
    setor: 'GAD',
    classificacao: 'Judicial',
    origem: 'legado',
  }),
];

const workbookOptions = {
  demandas,
  userEmail: 'leitor@rioeduca.net',
  filters: {
    ...DEFAULT_DEMAND_FILTERS,
    query: 'SME',
    status: 'todos' as const,
    quickFilters: { assinatura: false, hoje: false, vencido: false },
  },
  generatedAt: new Date(2026, 6, 16, 14, 35, 0),
};

describe('buildDemandasWorkbook', () => {
  it('gera workbook editorial com base R4 detalhada e autofiltro conservador', async () => {
    const workbook = buildDemandasWorkbook(workbookOptions);

    expect(workbook.worksheets.map((sheet) => sheet.name)).toEqual(['Resumo', 'Demandas']);
    expect(workbook.creator).toBe('Radar de Governança — CTRH SME');

    const resumo = workbook.getWorksheet('Resumo');
    const base = workbook.getWorksheet('Demandas');
    expect(resumo?.getCell('A1').value).toBe('RADAR DE GOVERNANÇA — RELATÓRIO ANALÍTICO');
    expect(resumo?.getCell('B6').value).toBe('leitor@rioeduca.net');
    expect(resumo?.getCell('B8').value).toBe(2);
    expect(resumo?.getCell('C10').value).toBe('EM ACOMPANHAMENTO');
    expect(resumo?.getCell('A27').value).toBe('DEMANDAS POR SETOR INFORMADO');
    expect(resumo?.getCell('A52').value).toBe('DISTRIBUIÇÃO POR RESPONSÁVEL — 10 MAIORES VOLUMES');

    expect(base?.views[0]).toMatchObject({ state: 'frozen', ySplit: 8 });
    expect(base?.getTables()).toHaveLength(0);
    expect(base?.autoFilter).toBe('A8:V10');
    expect(base?.getCell('A8').value).toBe('ID');
    expect(base?.getCell('F9').value).toEqual(new Date(2026, 6, 15));
    expect(base?.getCell('G9').value).toBe('Definido');
    expect(base?.getCell('H9').value).toEqual(new Date(2026, 6, 20));
    expect(base?.getCell('I9').value).toBe('Definido');
    expect(base?.getCell('D9').value).toBe("'=HIPERLINK(\"https://exemplo.invalid\")");
    expect(base?.getCell('M9').value).toBe('Conferir assinatura e encaminhar resposta');
    expect(base?.getCell('N9').value).toEqual(new Date(2026, 6, 16));
    expect(base?.getCell('O9').value).toBe('Providência hoje');
    expect(base?.getCell('Q9').value).toBe('Próximos 7 dias');
    expect(base?.getCell('R9').value).toBe(4);
    expect(base?.getCell('G10').value).toBe('Não informado');
    expect(base?.getCell('O10').value).toBe('Não exigida');
    expect(base?.getCell('S10').value).toBe('Legado');

    const buffer = await workbook.xlsx.writeBuffer();
    expect(buffer.byteLength).toBeGreaterThan(5_000);

    if (process.env.EXCEL_COMPAT_FIXTURE_PATH) {
      await writeFile(process.env.EXCEL_COMPAT_FIXTURE_PATH, Buffer.from(buffer));
    }

    const reopened = new Workbook();
    await reopened.xlsx.load(buffer);
    const reopenedBase = reopened.getWorksheet('Demandas');
    expect(reopened.worksheets.map((sheet) => sheet.name)).toEqual(['Resumo', 'Demandas']);
    expect(reopenedBase?.getTables()).toHaveLength(0);
    expect(reopenedBase?.getCell('A8').value).toBe('ID');
    expect(reopenedBase?.getCell('D9').value).toBe("'=HIPERLINK(\"https://exemplo.invalid\")");
    expect(reopenedBase?.getCell('M9').value).toBe('Conferir assinatura e encaminhar resposta');
  });

  it('serializa OOXML sem tabelas, relações órfãs ou marcadores de recuperação', async () => {
    const workbook = buildDemandasWorkbook(workbookOptions);
    const buffer = await workbook.xlsx.writeBuffer();
    const zip = await JSZip.loadAsync(buffer);

    const sheetPart = zip.file('xl/worksheets/sheet2.xml');
    const contentTypesPart = zip.file('[Content_Types].xml');
    const workbookPart = zip.file('xl/workbook.xml');

    expect(sheetPart).not.toBeNull();
    expect(Object.keys(zip.files).filter((path) => path.startsWith('xl/tables/'))).toEqual([]);
    expect(zip.file('xl/worksheets/_rels/sheet2.xml.rels')).toBeNull();

    const sheetXml = await sheetPart?.async('string');
    const contentTypesXml = await contentTypesPart?.async('string');
    const workbookXml = await workbookPart?.async('string');

    expect(sheetXml?.match(/<autoFilter\b/g) ?? []).toHaveLength(1);
    expect(sheetXml).toContain('<autoFilter ref="A8:V10"/>');
    expect(sheetXml).not.toContain('<tableParts');
    expect(contentTypesXml).not.toContain('spreadsheetml.table');
    expect(workbookXml).not.toContain('<fileRecoveryPr');
  });

  it('mantém o autofiltro válido quando o recorte não possui registros', async () => {
    const workbook = buildDemandasWorkbook({ ...workbookOptions, demandas: [] });
    const base = workbook.getWorksheet('Demandas');
    expect(base?.autoFilter).toBe('A8:V8');

    const buffer = await workbook.xlsx.writeBuffer();
    const zip = await JSZip.loadAsync(buffer);
    const sheetXml = await zip.file('xl/worksheets/sheet2.xml')?.async('string');
    expect(sheetXml).toContain('<autoFilter ref="A8:V8"/>');
  });
});
