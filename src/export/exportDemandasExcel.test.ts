import JSZip from 'jszip';
import { describe, expect, it } from 'vitest';
import type { Demanda } from '../types';
import { buildDemandasWorkbook } from './exportDemandasExcel';

const demandas: Demanda[] = [
  {
    id: 7,
    numero: 'SME-PRO-2026/00007',
    tipo: 'Processo',
    assunto: '=HIPERLINK("https://exemplo.invalid")',
    responsavel: 'Ana Souza',
    limite1: '15/07/2026',
    limite2: '20/07/2026',
    status: 'Para Assinatura',
    setor: 'CTRH',
    classificacao: 'Administrativa',
  },
  {
    id: 8,
    numero: 'EXP-008',
    tipo: 'Expediente',
    assunto: 'Resposta institucional',
    responsavel: 'Bruno Lima',
    limite1: '',
    limite2: '',
    status: 'Encerrado',
    setor: 'GAD',
    classificacao: 'Judicial',
  },
];

const workbookOptions = {
  demandas,
  userEmail: 'leitor@rioeduca.net',
  filters: {
    busca: 'SME',
    tipo: 'Todos',
    classificacao: 'Todas',
    status: 'Todos (exibir tudo)',
    setor: 'Todos',
    quickFilters: { assinatura: false, hoje: false, vencido: false },
  },
  generatedAt: new Date(2026, 6, 16, 14, 35, 0),
};

describe('buildDemandasWorkbook', () => {
  it('gera workbook analítico com duas abas, metadados e tabela estruturada', async () => {
    const workbook = buildDemandasWorkbook(workbookOptions);

    expect(workbook.worksheets.map((sheet) => sheet.name)).toEqual(['Resumo', 'Demandas']);
    expect(workbook.creator).toBe('Central de Demandas — CTRH SME');

    const resumo = workbook.getWorksheet('Resumo');
    const base = workbook.getWorksheet('Demandas');
    expect(resumo?.getCell('A1').value).toBe('CENTRAL DE DEMANDAS — RELATÓRIO ANALÍTICO');
    expect(resumo?.getCell('B6').value).toBe('leitor@rioeduca.net');
    expect(resumo?.getCell('B8').value).toBe(2);

    expect(base?.views[0]).toMatchObject({ state: 'frozen', ySplit: 8 });
    expect(base?.getTables()).toHaveLength(1);
    expect(base?.getTable('DemandasExportadas').name).toBe('DemandasExportadas');
    expect(base?.getCell('F9').value).toEqual(new Date(2026, 6, 15));
    expect(base?.getCell('G9').value).toEqual(new Date(2026, 6, 20));
    expect(base?.getCell('D9').value).toBe("'=HIPERLINK(\"https://exemplo.invalid\")");
    expect(base?.getCell('K9').value).toBe('Próximos 7 dias');
    expect(base?.getCell('L9').value).toBe(4);

    const buffer = await workbook.xlsx.writeBuffer();
    expect(buffer.byteLength).toBeGreaterThan(5_000);
  });

  it('serializa uma única estrutura de filtro vinculada à tabela', async () => {
    const workbook = buildDemandasWorkbook(workbookOptions);
    const buffer = await workbook.xlsx.writeBuffer();
    const zip = await JSZip.loadAsync(buffer);

    const sheetPart = zip.file('xl/worksheets/sheet2.xml');
    const sheetRelationshipsPart = zip.file('xl/worksheets/_rels/sheet2.xml.rels');
    const tablePart = zip.file('xl/tables/table1.xml');

    expect(sheetPart).not.toBeNull();
    expect(sheetRelationshipsPart).not.toBeNull();
    expect(tablePart).not.toBeNull();

    const sheetXml = await sheetPart?.async('string');
    const sheetRelationships = await sheetRelationshipsPart?.async('string');
    const tableXml = await tablePart?.async('string');

    expect(sheetXml).toContain('<tableParts count="1">');
    expect(sheetXml).not.toMatch(/<autoFilter\b/);
    expect(sheetRelationships).toContain('/relationships/table');
    expect(tableXml).toContain('<autoFilter ref="A8:L10"');
  });
});
