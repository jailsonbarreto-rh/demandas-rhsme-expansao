import { describe, expect, it } from 'vitest';
import {
  fromDatabaseDate,
  toDatabaseDate,
  toDemanda,
  toHistorico,
} from './dataMappers';

describe('adaptadores de dados', () => {
  it.each([
    ['30/06/2026', '2026-06-30'],
    ['', null],
    ['dd/mm/aaaa', null],
  ])('converte %s para data do banco', (input, expected) => {
    expect(toDatabaseDate(input)).toBe(expected);
  });

  it.each([
    '12/07',
    '31/02/2026',
    '00/01/2026',
    '15/13/2026',
    'texto',
  ])('rejeita data inválida %s', (input) => {
    expect(() => toDatabaseDate(input)).toThrow('Data inválida');
  });

  it.each([
    ['2026-06-30', '30/06/2026'],
    ['2026-06-30T12:00:00Z', '30/06/2026'],
    [null, ''],
  ])('converte %s para data da interface', (input, expected) => {
    expect(fromDatabaseDate(input)).toBe(expected);
  });

  it('mapeia todos os campos expandidos da demanda', () => {
    expect(toDemanda({
      id: 7,
      numero: 'SME-PRO-2026/00007',
      tipo: 'Processo',
      assunto: 'Atualização cadastral',
      responsavel: 'Responsável externo',
      responsavel_id: '00000000-0000-0000-0000-000000000007',
      limite1: '2026-06-30',
      limite1_situacao: 'definido',
      limite1_justificativa: null,
      limite2: null,
      limite2_situacao: 'nao_se_aplica',
      limite2_justificativa: 'Prazo final não se aplica ao caso.',
      proxima_acao: 'Conferir documentos complementares',
      proxima_acao_em: '2026-07-15',
      link_origem: 'https://processo.rio/consulta/7',
      status: 'Aguardando Andamento',
      setor: 'CTRH',
      classificacao: 'Consultas',
      origem: 'sistema',
      deleted_at: null,
      deleted_by: null,
      deletion_reason: null,
      created_at: '2026-07-01T10:00:00Z',
      updated_at: '2026-07-12T12:00:00Z',
    } as never)).toEqual({
      id: 7,
      numero: 'SME-PRO-2026/00007',
      tipo: 'Processo',
      assunto: 'Atualização cadastral',
      responsavel: 'Responsável externo',
      responsavelId: '00000000-0000-0000-0000-000000000007',
      limite1: '30/06/2026',
      limite1Situacao: 'definido',
      limite1Justificativa: '',
      limite2: '',
      limite2Situacao: 'nao_se_aplica',
      limite2Justificativa: 'Prazo final não se aplica ao caso.',
      proximaAcao: 'Conferir documentos complementares',
      proximaAcaoEm: '15/07/2026',
      linkOrigem: 'https://processo.rio/consulta/7',
      status: 'Aguardando Andamento',
      setor: 'CTRH',
      classificacao: 'Consultas',
      origem: 'sistema',
      createdAt: '2026-07-01T10:00:00Z',
      updatedAt: '2026-07-12T12:00:00Z',
    });
  });

  it('aceita linha legada sem campos expandidos e aplica defaults seguros', () => {
    expect(toDemanda({
      id: 8,
      numero: 'SME-PRO-2026/00008',
      tipo: 'Processo',
      assunto: 'Linha legada',
      responsavel: null,
      limite1: '2026-06-30',
      limite2: null,
      status: 'Tramitado',
      setor: null,
      classificacao: null,
    } as never)).toEqual({
      id: 8,
      numero: 'SME-PRO-2026/00008',
      tipo: 'Processo',
      assunto: 'Linha legada',
      responsavel: '',
      responsavelId: null,
      limite1: '30/06/2026',
      limite1Situacao: 'definido',
      limite1Justificativa: '',
      limite2: '',
      limite2Situacao: 'nao_informado',
      limite2Justificativa: '',
      proximaAcao: '',
      proximaAcaoEm: '',
      linkOrigem: '',
      status: 'Tramitado',
      setor: '',
      classificacao: '',
      origem: 'legado',
      createdAt: '',
      updatedAt: '',
    });
  });

  it('mapeia evento expandido do histórico e converte alterações', () => {
    expect(toHistorico({
      id: 9,
      demanda_id: 3,
      tipo_evento: 'edicao',
      status_anterior: 'Aguardando Andamento',
      status_novo: 'Tramitado',
      setor: 'CTRH',
      comentario: 'Atualizado',
      created_by: '00000000-0000-0000-0000-000000000009',
      created_at: '2026-07-12T12:00:00Z',
      alteracoes: [
        { campo: 'assunto', anterior: 'Antes', novo: 'Depois' },
      ],
    } as never)).toEqual({
      id: 9,
      demandaId: 3,
      data_hora: new Date('2026-07-12T12:00:00Z').toLocaleString('pt-BR'),
      tipoEvento: 'edicao',
      status_anterior: 'Aguardando Andamento',
      status_novo: 'Tramitado',
      setor: 'CTRH',
      comentario: 'Atualizado',
      autorId: '00000000-0000-0000-0000-000000000009',
      autorNome: '',
      alteracoes: [
        { field: 'assunto', before: 'Antes', after: 'Depois' },
      ],
    });
  });

  it('aceita histórico legado sem os novos campos', () => {
    expect(toHistorico({
      id: 10,
      demanda_id: 4,
      status_novo: 'Sobrestado',
      setor: null,
      comentario: 'Registro legado',
      created_at: '2026-07-13T12:00:00Z',
    } as never)).toEqual({
      id: 10,
      demandaId: 4,
      data_hora: new Date('2026-07-13T12:00:00Z').toLocaleString('pt-BR'),
      tipoEvento: 'mudanca_status',
      status_anterior: '',
      status_novo: 'Sobrestado',
      setor: '',
      comentario: 'Registro legado',
      autorId: null,
      autorNome: '',
      alteracoes: [],
    });
  });
});
