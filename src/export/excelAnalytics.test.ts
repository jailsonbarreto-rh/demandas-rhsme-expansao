import { describe, expect, it } from 'vitest';
import { DEFAULT_DEMAND_FILTERS } from '../filters/filterTypes';
import { createDemandFixture } from '../test/expandedFixtures';
import {
  buildExcelAnalytics,
  describeActiveFilters,
  getDeadlineStateLabel,
  getFollowUpInfo,
  parseBrazilianDate,
  sanitizeExcelText,
} from './excelAnalytics';

const base = createDemandFixture({
  id: 1,
  numero: 'SME-PRO-2026/00001',
  tipo: 'Processo',
  assunto: 'Assunto',
  responsavel: 'Ana',
  limite1: '',
  limite1Situacao: 'nao_informado',
  limite2: '',
  limite2Situacao: 'nao_informado',
  proximaAcao: '',
  proximaAcaoEm: '',
  status: 'Aguardando Andamento',
  setor: 'CTRH',
  classificacao: 'Administrativa',
});

describe('excelAnalytics', () => {
  it('protege textos que o Excel poderia interpretar como fórmula', () => {
    expect(sanitizeExcelText('=SOMA(A1:A2)')).toBe("'=SOMA(A1:A2)");
    expect(sanitizeExcelText('+1+1')).toBe("'+1+1");
    expect(sanitizeExcelText('-10')).toBe("'-10");
    expect(sanitizeExcelText('@comando')).toBe("'@comando");
    expect(sanitizeExcelText('Texto normal')).toBe('Texto normal');
  });

  it('converte somente datas brasileiras válidas em Date', () => {
    expect(parseBrazilianDate('16/07/2026')).toEqual(new Date(2026, 6, 16));
    expect(parseBrazilianDate('31/02/2026')).toBeNull();
    expect(parseBrazilianDate('')).toBeNull();
  });

  it('distingue estados de prazo sem transformar ausência em atraso', () => {
    expect(getDeadlineStateLabel('definido', '16/07/2026')).toBe('Definido');
    expect(getDeadlineStateLabel('nao_informado', '')).toBe('Não informado');
    expect(getDeadlineStateLabel('nao_se_aplica', '')).toBe('Não se aplica');
  });

  it('calcula indicadores de prazo final e próxima providência separadamente', () => {
    const now = new Date(2026, 6, 16, 12, 0, 0);
    const demandas = [
      { ...base, id: 1, responsavel: 'Ana', limite2: '15/07/2026', limite2Situacao: 'definido' as const, proximaAcao: 'Cobrar', proximaAcaoEm: '15/07/2026' },
      { ...base, id: 2, responsavel: 'Ana', tipo: 'Expediente' as const, status: 'Para Assinatura' as const, limite2: '16/07/2026', limite2Situacao: 'definido' as const, proximaAcao: 'Assinar', proximaAcaoEm: '16/07/2026' },
      { ...base, id: 3, responsavel: 'Bruno', setor: 'GAD', limite2: '20/07/2026', limite2Situacao: 'definido' as const, proximaAcao: 'Revisar', proximaAcaoEm: '20/07/2026' },
      { ...base, id: 4, responsavel: '', status: 'Encerrado' as const, limite2: '01/07/2026', limite2Situacao: 'definido' as const },
      { ...base, id: 5, responsavel: 'Carla', limite2: '', limite2Situacao: 'nao_informado' as const },
      { ...base, id: 6, responsavel: 'Bruno', limite2: '10/08/2026', limite2Situacao: 'definido' as const, proximaAcao: 'Acompanhar', proximaAcaoEm: '10/08/2026' },
    ];

    const result = buildExcelAnalytics(demandas, now);

    expect(result.kpis).toEqual({
      total: 6,
      emAcompanhamento: 5,
      encerrados: 1,
      paraAssinatura: 1,
      vencidos: 1,
      vencendoHoje: 1,
      providenciasVencidas: 1,
      providenciasHoje: 1,
    });
    expect(result.byType).toEqual([
      { label: 'Processo', count: 5, percentage: 83.33 },
      { label: 'Expediente', count: 1, percentage: 16.67 },
    ]);
    expect(result.deadlineSituation).toEqual([
      { label: 'Vencidas', count: 1, percentage: 16.67 },
      { label: 'Vencendo hoje', count: 1, percentage: 16.67 },
      { label: 'Próximos 7 dias', count: 1, percentage: 16.67 },
      { label: 'No prazo', count: 1, percentage: 16.67 },
      { label: 'Sem prazo definido', count: 1, percentage: 16.67 },
      { label: 'Encerradas', count: 1, percentage: 16.67 },
    ]);
    expect(result.followUpSituation).toEqual([
      { label: 'Providência vencida', count: 1, percentage: 16.67 },
      { label: 'Providência hoje', count: 1, percentage: 16.67 },
      { label: 'Próximos 7 dias', count: 1, percentage: 16.67 },
      { label: 'Futura', count: 1, percentage: 16.67 },
      { label: 'Não informada', count: 1, percentage: 16.67 },
      { label: 'Não exigida', count: 1, percentage: 16.67 },
    ]);
  });

  it('apresenta próxima providência encerrada como não exigida', () => {
    expect(getFollowUpInfo({ ...base, status: 'Encerrado' }, new Date(2026, 6, 16)).situation)
      .toBe('Não exigida');
  });

  it('descreve o recorte aplicado de forma rastreável', () => {
    expect(describeActiveFilters({
      ...DEFAULT_DEMAND_FILTERS,
      query: 'contrato',
      type: 'Processo',
      sector: 'CTRH',
      quickFilters: {
        assinatura: true,
        hoje: false,
        vencido: true,
        internoVencido: true,
        providenciaHoje: true,
      },
    })).toEqual([
      ['Busca', 'contrato'],
      ['Tipo', 'Processo'],
      ['Status', 'Em acompanhamento'],
      ['Setor', 'CTRH'],
      ['Filtros rápidos', 'Para assinatura; Prazo final vencido; Prazo interno vencido; Próxima providência hoje'],
    ]);
  });
});
