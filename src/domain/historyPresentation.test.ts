import { describe, expect, it } from 'vitest';
import { presentHistoryEvent } from './historyPresentation';

const baseEvent = {
  tipoEvento: 'criacao' as const,
  comentario: '',
};

describe('presentHistoryEvent', () => {
  it('traduz a importação do lote saneado sem expor hash técnico', () => {
    const result = presentHistoryEvent({
      ...baseEvent,
      comentario: 'Demanda importada do lote saneado 2ac7da80b744.',
    });

    expect(result).toEqual({
      label: 'Importação',
      comment: 'Demanda importada do sistema legado.',
      technical: true,
    });
  });

  it('traduz a carga inicial para a mesma linguagem de produto', () => {
    const result = presentHistoryEvent({
      ...baseEvent,
      comentario: 'Demanda importada da planilha inicial.',
    });

    expect(result).toEqual({
      label: 'Importação',
      comment: 'Demanda importada do sistema legado.',
      technical: true,
    });
  });

  it('remove a referência interna R3 da vinculação de responsável', () => {
    const result = presentHistoryEvent({
      tipoEvento: 'reatribuicao',
      comentario: 'Responsável vinculado a perfil oficial na migração R3.',
    });

    expect(result).toEqual({
      label: 'Alteração de responsável',
      comment: 'Responsável vinculado ao perfil oficial.',
      technical: true,
    });
  });

  it('preserva comentários operacionais escritos pelo usuário', () => {
    const result = presentHistoryEvent({
      tipoEvento: 'andamento',
      comentario: 'Documento encaminhado para análise jurídica.',
    });

    expect(result).toEqual({
      label: 'Andamento',
      comment: 'Documento encaminhado para análise jurídica.',
      technical: false,
    });
  });
});
