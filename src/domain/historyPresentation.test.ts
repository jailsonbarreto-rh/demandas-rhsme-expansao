import { describe, expect, it } from 'vitest';
import { presentHistoryEvent, presentHistoryChanges } from './historyPresentation';

const baseEvent = {
  tipoEvento: 'criacao' as const,
  comentario: '',
};

describe('presentHistoryEvent', () => {
  it('traduz a importação técnica sem expor hash, lote ou sistema anterior', () => {
    const result = presentHistoryEvent({
      ...baseEvent,
      comentario: 'Demanda importada do lote saneado 2ac7da80b744.',
    });

    expect(result).toEqual({
      label: 'Cadastro inicial',
      comment: 'Registro incorporado à base de demandas.',
      technical: true,
    });
  });

  it('traduz a carga inicial para a mesma linguagem neutra', () => {
    const result = presentHistoryEvent({
      ...baseEvent,
      comentario: 'Demanda importada da planilha inicial.',
    });

    expect(result).toEqual({
      label: 'Cadastro inicial',
      comment: 'Registro incorporado à base de demandas.',
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
      comment: 'Cadastro do responsável atualizado.',
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

describe('presentHistoryChanges', () => {
  it('remove identificadores internos e traduz campos e valores para o usuário', () => {
    const changes = presentHistoryChanges([
      { field: 'responsavel_id', before: null, after: '84d7711e-4d9f-4994-a52a-b5238ac92ae0' },
      { field: 'responsavel', before: 'Nome anterior', after: 'Nome atual' },
      { field: 'limite1_situacao', before: 'nao_informado', after: 'definido' },
      { field: 'created_by', before: null, after: '84d7711e-4d9f-4994-a52a-b5238ac92ae0' },
    ]);

    expect(changes).toEqual([
      { label: 'Responsável', before: 'Nome anterior', after: 'Nome atual' },
      { label: 'Situação do prazo interno', before: 'Não informado', after: 'Data definida' },
    ]);
  });
});
