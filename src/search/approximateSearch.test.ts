import { describe, expect, it } from 'vitest';
import { createDemandFixture, createHistoryFixture } from '../test/expandedFixtures';
import { rankApproximateDemandSearch } from './approximateSearch';

const demandas = [
  createDemandFixture({
    id: 1,
    numero: 'SME-PRO-2025/001',
    tipo: 'Processo',
    assunto: 'Processo de aposentadoria de servidor',
    responsavel: 'Pedro Almeida',
    limite1: '',
    limite2: '',
    status: 'Aguardando Andamento',
    setor: 'E/CTRH',
    classificacao: 'Aposentadoria',
  }),
  createDemandFixture({
    id: 2,
    numero: 'SME-PRO-2026/002',
    tipo: 'Processo',
    assunto: 'Processo de aposentadoria de servidor',
    responsavel: 'Maria Souza',
    limite1: '',
    limite2: '',
    status: 'Aguardando Andamento',
    setor: 'E/CTRH',
    classificacao: 'Aposentadoria',
  }),
  createDemandFixture({
    id: 3,
    numero: 'SME-PRO-2024/003',
    tipo: 'Processo',
    assunto: 'Processo de aposentadoria de servidor',
    responsavel: 'João Lima',
    limite1: '',
    limite2: '',
    status: 'Aguardando Andamento',
    setor: 'E/CTRH',
    classificacao: 'Aposentadoria',
  }),
  createDemandFixture({
    id: 4,
    numero: 'SME-PRO-2026/004',
    tipo: 'Processo',
    assunto: 'Licença para capacitação',
    responsavel: 'Carla Ramos',
    limite1: '',
    limite2: '',
    status: 'Aguardando Andamento',
    setor: 'E/CTRH',
    classificacao: 'Licença',
  }),
];

const historico = [
  createHistoryFixture({
    id: 10,
    demandaId: 1,
    data_hora: '10/07/2025 09:00:00',
    status_novo: 'Aguardando Andamento',
    setor: 'E/CTRH',
    comentario: 'Pedro apresentou a documentação de aposentadoria.',
  }),
];

describe('rankApproximateDemandSearch', () => {
  it('retorna candidatos com dois de três termos quando não existe correspondência integral', () => {
    const results = rankApproximateDemandSearch(demandas, historico, 'aposentadoria Pedro 2026');

    expect(results.map((result) => result.demanda.id)).toEqual([1, 2]);
    expect(results[0].match.matchedTermCount).toBe(2);
    expect(results[0].match.totalTermCount).toBe(3);
    expect(results[0].match.missingTerms).toEqual(['2026']);
  });

  it('não inclui correspondências exatas entre as sugestões', () => {
    expect(rankApproximateDemandSearch(demandas, historico, 'aposentadoria Pedro 2025')).toEqual([]);
  });

  it('descarta candidatos que correspondem a somente um termo', () => {
    const results = rankApproximateDemandSearch(demandas, historico, 'aposentadoria inexistente 2099');

    expect(results).toEqual([]);
  });

  it('ordena três de quatro termos antes de dois de quatro', () => {
    const results = rankApproximateDemandSearch(
      demandas,
      historico,
      'aposentadoria Pedro 2025 urgente',
    );

    expect(results[0].demanda.id).toBe(1);
    expect(results[0].match.matchedTermCount).toBe(3);
  });

  it('respeita o limite máximo de sugestões', () => {
    const results = rankApproximateDemandSearch(demandas, historico, 'aposentadoria servidor 2099', { limit: 2 });

    expect(results).toHaveLength(2);
  });
});
