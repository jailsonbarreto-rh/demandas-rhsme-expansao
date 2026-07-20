import { describe, expect, it } from 'vitest';
import type { ComentarioHistorico, Demanda } from '../types';
import { matchDemandSearch } from './demandSearch';

const demanda: Demanda = {
  id: 42,
  numero: 'SME-PRO-2025/001.234',
  tipo: 'Processo',
  assunto: 'Solicitação de cessão de servidor',
  responsavel: 'Ricardo Silva',
  limite1: '10/07/2026',
  limite2: '20/07/2026',
  status: 'Aguardando Andamento',
  setor: 'E/CTRH',
  classificacao: 'Movimentação de pessoal',
};

const historico: ComentarioHistorico[] = [
  {
    id: 1,
    demandaId: 42,
    data_hora: '15/07/2026 10:30:00',
    status_novo: 'Ajustar',
    setor: 'E/CTRH',
    comentario: 'Aguardando o contracheque atualizado para prosseguir.',
  },
];

describe('matchDemandSearch', () => {
  it('exige todos os termos, permitindo correspondência em campos diferentes', () => {
    const result = matchDemandSearch(demanda, historico, 'cessão ricardo 2025');

    expect(result.matches).toBe(true);
    expect(result.matchedFields).toEqual(expect.arrayContaining([
      'assunto',
      'responsavel',
      'numero',
    ]));
  });

  it('localiza número com ou sem pontuação', () => {
    expect(matchDemandSearch(demanda, historico, '2025001234').matches).toBe(true);
  });

  it('localiza conteúdo existente somente no histórico e retorna contexto', () => {
    const result = matchDemandSearch(demanda, historico, 'contracheque');

    expect(result.matches).toBe(true);
    expect(result.matchedFields).toContain('historico');
    expect(result.historySnippet).toContain('contracheque atualizado');
  });

  it('não retorna a demanda quando um dos termos não existe', () => {
    expect(matchDemandSearch(demanda, historico, 'cessão inexistente').matches).toBe(false);
  });

  it('considera tipo, classificação, setor, status e movimentações anteriores', () => {
    expect(matchDemandSearch(demanda, historico, 'processo movimentacao ctrh aguardando ajustar').matches).toBe(true);
  });
});
