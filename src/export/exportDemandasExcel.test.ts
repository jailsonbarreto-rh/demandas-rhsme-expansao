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

describe('buildDemandasWorkbook', () => {
  it('gera workbook analítico com duas abas, metadados e tabela estruturada', async () => {
    const now = new Date(2026, 6, 16, 14, 35, 0);
    const workbook = buildDemandasWorkbook({
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
      generatedAt: now,
    });

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
});
