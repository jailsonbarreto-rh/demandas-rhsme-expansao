import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import ExcelJS from 'exceljs';
import { afterEach, describe, expect, it } from 'vitest';
import {
  prepareLegacyMigration,
  repairMojibake,
  writeMigrationArtifacts,
} from './legacy-data.mjs';

const tempDirs = [];

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

function source(name, text) {
  return { name, buffer: Buffer.from(text, 'utf8') };
}

const header = 'Número,"Assunto","Responsável","Limite 1","Limite 2","Status","Setor"';

describe('preparação dos dados legados', () => {
  it('corrige somente texto com sinais claros de mojibake', () => {
    expect(repairMojibake('ResponsÃ¡vel e CessÃ£o')).toBe('Responsável e Cessão');
    expect(repairMojibake('Responsável e Cessão')).toBe('Responsável e Cessão');
  });

  it('converte CSV com aspas, vírgula interna, status e data para o payload canônico', async () => {
    const result = await prepareLegacyMigration({
      sources: [source('pagina-001.csv', [
        header,
        'SME-PRO-2025/00001-A,"Assunto, com vírgula","João","","09/07/2026","Para assinatura","E/CTRH"',
      ].join('\n'))],
      defaultClassificacao: 'Outros',
    });

    expect(result.payload).toEqual([
      {
        source_line: 2,
        numero: 'SME-PRO-2025/00001-A',
        tipo: 'Processo',
        assunto: 'Assunto, com vírgula',
        responsavel: 'João',
        limite1: '',
        limite2: '2026-07-09',
        status: 'Para Assinatura',
        setor: 'E/CTRH',
        classificacao: 'Outros',
      },
    ]);
    expect(result.summary.blockingIssues).toBe(0);
  });

  it('infere expediente para ofício e corrige caracteres quebrados recebidos na exportação', async () => {
    const result = await prepareLegacyMigration({
      sources: [source('pagina-002.csv', [
        'NÃºmero,"Assunto","ResponsÃ¡vel","Limite 1","Limite 2","Status","Setor"',
        'SME-OFI-2025/24608-A,"SolicitaÃ§Ã£o de informaÃ§Ãµes","Giselle","","","Aguardando andamento","E/CTRH"',
      ].join('\n'))],
      defaultClassificacao: 'Outros',
    });

    expect(result.payload[0]).toMatchObject({
      numero: 'SME-OFI-2025/24608-A',
      tipo: 'Expediente',
      assunto: 'Solicitação de informações',
      status: 'Aguardando Andamento',
    });
  });

  it('consolida páginas, bloqueia duplicidade e não descarta a pendência silenciosamente', async () => {
    const row = 'SME-PRO-2025/00001-A,"Consulta","Ana","","","Tramitado","E/CTRH"';
    const result = await prepareLegacyMigration({
      sources: [
        source('pagina-001.csv', `${header}\n${row}`),
        source('pagina-002.csv', `${header}\n${row}`),
      ],
      defaultClassificacao: 'Outros',
    });

    expect(result.payload).toHaveLength(1);
    expect(result.issues).toEqual(expect.arrayContaining([
      expect.objectContaining({
        severity: 'error',
        code: 'NUMERO_DUPLICADO',
        sourceFile: 'pagina-002.csv',
      }),
    ]));
  });

  it('mantém linha incompleta no relatório e a exclui do payload', async () => {
    const result = await prepareLegacyMigration({
      sources: [source('pagina-003.csv', [
        header,
        ',"","","","","Aguardando Andamento","E/CTRH"',
      ].join('\n'))],
      defaultClassificacao: 'Outros',
    });

    expect(result.payload).toHaveLength(0);
    expect(result.summary.blockingIssues).toBeGreaterThan(0);
    expect(result.issues.map((issue) => issue.code)).toEqual(expect.arrayContaining([
      'NUMERO_OBRIGATORIO',
      'ASSUNTO_OBRIGATORIO',
      'RESPONSAVEL_OBRIGATORIO',
    ]));
  });

  it('lê o XLSX gerado pelo Excel quando cada linha CSV está concentrada na coluna A', async () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('in');
    sheet.getCell('A1').value = header;
    sheet.getCell('A2').value = 'SME-PRO-2025/00002-A,"Registro do XLSX","Beth","","","Sobrestado","E/CTRH"';
    const buffer = Buffer.from(await workbook.xlsx.writeBuffer());

    const result = await prepareLegacyMigration({
      sources: [{ name: 'demandas.xlsx', buffer }],
      defaultClassificacao: 'Outros',
    });

    expect(result.payload).toHaveLength(1);
    expect(result.payload[0]).toMatchObject({
      numero: 'SME-PRO-2025/00002-A',
      assunto: 'Registro do XLSX',
      status: 'Sobrestado',
    });
  });

  it('gera payload, manifesto, pendências e relatório Excel auditável', async () => {
    const result = await prepareLegacyMigration({
      sources: [source('pagina-001.csv', [
        header,
        'SME-PRO-2025/00003-A,"Registro pronto","Ana","","","Tramitado","E/CTRH"',
        ',"Linha incompleta","","","","Tramitado","E/CTRH"',
      ].join('\n'))],
      defaultClassificacao: 'Outros',
    });
    const outputDir = await mkdtemp(join(tmpdir(), 'ctrh-migration-'));
    tempDirs.push(outputDir);

    const paths = await writeMigrationArtifacts(result, outputDir);
    const manifest = JSON.parse(await readFile(paths.manifest, 'utf8'));
    const report = new ExcelJS.Workbook();
    await report.xlsx.readFile(paths.workbook);

    expect(manifest.payloadSha256).toMatch(/^[0-9a-f]{64}$/);
    expect(manifest.sourceFiles).toEqual([
      expect.objectContaining({ name: 'pagina-001.csv', sha256: expect.stringMatching(/^[0-9a-f]{64}$/) }),
    ]);
    expect(report.worksheets.map((sheet) => sheet.name)).toEqual([
      'Resumo',
      'Prontos',
      'Pendências',
    ]);
    expect(await readFile(paths.issues, 'utf8')).toContain('NUMERO_OBRIGATORIO');
  });
});
