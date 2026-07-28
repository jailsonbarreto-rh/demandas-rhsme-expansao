import { describe, expect, it } from 'vitest';
import { createMinimalDemandFixture } from '../test/expandedFixtures';
import {
  getDeadlineCoverage,
  getDefinedFinalDeadlineSituation,
  getResponsibleDistribution,
} from './governanceAnalytics';

const makeDemand = (
  id: number,
  overrides: Partial<ReturnType<typeof createMinimalDemandFixture>> = {},
) => createMinimalDemandFixture({
  id,
  numero: `SME-PRO-2026/${String(id).padStart(5, '0')}`,
  assunto: `Demanda ${id}`,
  responsavel: 'Ana Oficial',
  responsavelId: 'uuid-ana',
  status: 'Aguardando Andamento',
  ...overrides,
});

describe('governanceAnalytics', () => {
  it('calcula cobertura dos prazos sem tratar ausência como regularidade', () => {
    const demandas = [
      makeDemand(1, {
        limite1: '20/07/2026',
        limite1Situacao: 'definido',
        limite2: '25/07/2026',
        limite2Situacao: 'definido',
      }),
      makeDemand(2, {
        limite1: '',
        limite1Situacao: 'nao_informado',
        limite2: '',
        limite2Situacao: 'nao_informado',
      }),
      makeDemand(3, {
        limite1: '',
        limite1Situacao: 'nao_se_aplica',
        limite2: '',
        limite2Situacao: 'nao_se_aplica',
      }),
    ];

    expect(getDeadlineCoverage(demandas, 'interno')).toEqual({
      total: 3,
      definido: 1,
      naoInformado: 1,
      naoSeAplica: 1,
      percentualDefinido: 33,
    });

    expect(getDeadlineCoverage(demandas, 'final')).toEqual({
      total: 3,
      definido: 1,
      naoInformado: 1,
      naoSeAplica: 1,
      percentualDefinido: 33,
    });
  });

  it('classifica somente os prazos finais definidos e separa demandas encerradas', () => {
    const demandas = [
      makeDemand(1, { limite2: '26/07/2026', limite2Situacao: 'definido' }),
      makeDemand(2, { limite2: '27/07/2026', limite2Situacao: 'definido' }),
      makeDemand(3, { limite2: '30/07/2026', limite2Situacao: 'definido' }),
      makeDemand(4, {
        limite2: '10/07/2026',
        limite2Situacao: 'definido',
        status: 'Encerrado',
      }),
      makeDemand(5, { limite2: '', limite2Situacao: 'nao_informado' }),
    ];

    expect(getDefinedFinalDeadlineSituation(demandas, '27/07/2026')).toEqual({
      totalDefinido: 4,
      vencido: 1,
      hoje: 1,
      futuro: 1,
      encerrado: 1,
      inconsistente: 0,
    });
  });

  it('agrega por UUID e preserva responsável legado como vínculo pendente', () => {
    const demandas = [
      makeDemand(1, { status: 'Tramitado' }),
      makeDemand(2, { status: 'Aguardando Andamento' }),
      makeDemand(3, {
        responsavel: 'Vanessa Migrado',
        responsavelId: null,
        status: 'Sobrestado',
      }),
      makeDemand(4, {
        responsavel: '',
        responsavelId: null,
        status: 'Para Assinatura',
      }),
    ];

    const result = getResponsibleDistribution(demandas);

    expect(result[0]).toMatchObject({
      nome: 'Ana Oficial',
      total: 2,
      vinculo: 'oficial',
      status: {
        'Aguardando Andamento': 1,
        Tramitado: 1,
      },
    });
    expect(result).toEqual(expect.arrayContaining([
      expect.objectContaining({
        nome: 'Vanessa Migrado',
        total: 1,
        vinculo: 'legado_pendente',
      }),
      expect.objectContaining({
        nome: 'Sem responsável',
        total: 1,
        vinculo: 'nao_atribuido',
      }),
    ]));
  });
});
