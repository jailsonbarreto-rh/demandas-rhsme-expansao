import type {
  ComentarioHistorico,
  Demanda,
  DemandStatus,
} from '../types';

type RequiredDemandFixtureFields = Pick<
  Demanda,
  | 'id'
  | 'numero'
  | 'tipo'
  | 'assunto'
  | 'responsavel'
  | 'limite1'
  | 'limite2'
  | 'status'
  | 'setor'
  | 'classificacao'
>;

type DemandFixtureInput = RequiredDemandFixtureFields
  & Partial<Omit<Demanda, keyof RequiredDemandFixtureFields>>;

type HistoryFixtureInput = Pick<
  ComentarioHistorico,
  'id' | 'demandaId' | 'data_hora' | 'status_novo' | 'setor' | 'comentario'
> & Partial<Omit<ComentarioHistorico, 'id' | 'demandaId' | 'data_hora' | 'status_novo' | 'setor' | 'comentario'>>;

export function createDemandFixture(input: DemandFixtureInput): Demanda {
  return {
    ...input,
    responsavelId: input.responsavelId ?? null,
    limite1Situacao: input.limite1Situacao ?? (input.limite1 ? 'definido' : 'nao_informado'),
    limite1Justificativa: input.limite1Justificativa ?? '',
    limite2Situacao: input.limite2Situacao ?? (input.limite2 ? 'definido' : 'nao_informado'),
    limite2Justificativa: input.limite2Justificativa ?? '',
    proximaAcao: input.proximaAcao ?? '',
    proximaAcaoEm: input.proximaAcaoEm ?? '',
    linkOrigem: input.linkOrigem ?? '',
    origem: input.origem ?? 'sistema',
    deletedAt: input.deletedAt ?? '',
    deletedBy: input.deletedBy ?? null,
    deletionReason: input.deletionReason ?? '',
    createdAt: input.createdAt ?? '2026-07-01T12:00:00Z',
    updatedAt: input.updatedAt ?? '2026-07-20T12:00:00Z',
  };
}

export function createHistoryFixture(input: HistoryFixtureInput): ComentarioHistorico {
  return {
    ...input,
    tipoEvento: input.tipoEvento ?? 'mudanca_status',
    status_anterior: input.status_anterior ?? '',
    autorId: input.autorId ?? null,
    autorNome: input.autorNome ?? 'Usuário Demonstração',
    alteracoes: input.alteracoes ?? [],
  };
}

export function createMinimalDemandFixture(
  overrides: Partial<Demanda> & Pick<Demanda, 'id' | 'numero' | 'assunto' | 'responsavel' | 'status'>,
): Demanda {
  return createDemandFixture({
    tipo: 'Processo',
    limite1: '',
    limite2: '',
    setor: 'Setor Demonstração',
    classificacao: 'Diversos',
    ...overrides,
  });
}

export function historyForStatus(
  demandaId: number,
  status: DemandStatus,
  comentario = 'Registro sintético',
): ComentarioHistorico {
  return createHistoryFixture({
    id: demandaId,
    demandaId,
    data_hora: '20/07/2026, 10:00:00',
    status_novo: status,
    setor: 'Setor Demonstração',
    comentario,
  });
}
