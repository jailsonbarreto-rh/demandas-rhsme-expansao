import type { Demanda } from '../types';

type DemoInput = Pick<
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
> & Partial<Pick<
  Demanda,
  'proximaAcao' | 'proximaAcaoEm' | 'createdAt' | 'updatedAt'
>>;

function createDemoDemanda(input: DemoInput): Demanda {
  return {
    ...input,
    responsavelId: null,
    limite1Situacao: input.limite1 ? 'definido' : 'nao_informado',
    limite1Justificativa: '',
    limite2Situacao: input.limite2 ? 'definido' : 'nao_informado',
    limite2Justificativa: '',
    proximaAcao: input.proximaAcao ?? '',
    proximaAcaoEm: input.proximaAcaoEm ?? '',
    linkOrigem: '',
    origem: 'sistema',
    deletedAt: '',
    deletedBy: null,
    deletionReason: '',
    createdAt: input.createdAt ?? '2026-07-01T12:00:00Z',
    updatedAt: input.updatedAt ?? '2026-07-20T12:00:00Z',
  };
}

export const demoDemandas: Demanda[] = [
  createDemoDemanda({
    id: 1,
    numero: 'DEMO-PRO-2026-001',
    tipo: 'Processo',
    assunto: 'Análise demonstrativa de cessão temporária',
    responsavel: 'Usuário Demonstração A',
    limite1: '15/08/2026',
    limite2: '30/08/2026',
    status: 'Aguardando Andamento',
    setor: 'Setor Demonstração',
    classificacao: 'Cessão',
    proximaAcao: 'Conferir documentação demonstrativa',
    proximaAcaoEm: '10/08/2026',
  }),
  createDemoDemanda({
    id: 2,
    numero: 'DEMO-EXP-2026-002',
    tipo: 'Expediente',
    assunto: 'Revisão demonstrativa de cadastro funcional',
    responsavel: 'Usuário Demonstração B',
    limite1: '20/08/2026',
    limite2: '15/09/2026',
    status: 'Ajustar',
    setor: 'Setor Demonstração',
    classificacao: 'Consultas',
    proximaAcao: 'Corrigir cadastro demonstrativo',
    proximaAcaoEm: '18/08/2026',
  }),
  createDemoDemanda({
    id: 3,
    numero: 'DEMO-PRO-2026-003',
    tipo: 'Processo',
    assunto: 'Encaminhamento demonstrativo para assinatura',
    responsavel: 'Usuário Demonstração A',
    limite1: '25/08/2026',
    limite2: '10/09/2026',
    status: 'Para Assinatura',
    setor: 'Setor Demonstração',
    classificacao: 'Demanda Interna',
    proximaAcao: 'Acompanhar assinatura demonstrativa',
    proximaAcaoEm: '25/08/2026',
  }),
  createDemoDemanda({
    id: 4,
    numero: 'DEMO-EXP-2026-004',
    tipo: 'Expediente',
    assunto: 'Acompanhamento demonstrativo de retorno externo',
    responsavel: 'Usuário Demonstração B',
    limite1: '01/09/2026',
    limite2: '',
    status: 'Tramitado',
    setor: 'Setor Demonstração',
    classificacao: 'Diversos',
    proximaAcao: 'Verificar retorno externo demonstrativo',
    proximaAcaoEm: '01/09/2026',
  }),
  createDemoDemanda({
    id: 5,
    numero: 'DEMO-OUT-2026-005',
    tipo: 'Outros',
    assunto: 'Monitoramento demonstrativo de condição externa',
    responsavel: 'Usuário Demonstração A',
    limite1: '',
    limite2: '',
    status: 'Sobrestado',
    setor: 'Setor Demonstração',
    classificacao: 'Outros',
    proximaAcao: 'Revisar condição de sobrestamento',
    proximaAcaoEm: '15/09/2026',
  }),
  createDemoDemanda({
    id: 6,
    numero: 'DEMO-PRO-2026-006',
    tipo: 'Processo',
    assunto: 'Registro demonstrativo concluído',
    responsavel: 'Usuário Demonstração B',
    limite1: '10/07/2026',
    limite2: '20/07/2026',
    status: 'Encerrado',
    setor: 'Setor Demonstração',
    classificacao: 'Demanda Interna',
    updatedAt: '2026-07-20T15:00:00Z',
  }),
  createDemoDemanda({
    id: 7,
    numero: 'DEMO-EXP-2026-007',
    tipo: 'Expediente',
    assunto: 'Consulta demonstrativa de documentação',
    responsavel: 'Usuário Demonstração A',
    limite1: '',
    limite2: '05/10/2026',
    status: 'Aguardando Andamento',
    setor: 'Setor Demonstração',
    classificacao: 'Consultas',
    proximaAcao: 'Solicitar documentação demonstrativa',
    proximaAcaoEm: '20/09/2026',
  }),
  createDemoDemanda({
    id: 8,
    numero: 'DEMO-OUT-2026-008',
    tipo: 'Outros',
    assunto: 'Providência demonstrativa de ajuste cadastral',
    responsavel: 'Usuário Demonstração B',
    limite1: '01/10/2026',
    limite2: '15/10/2026',
    status: 'Aguardando Andamento',
    setor: 'Setor Demonstração',
    classificacao: 'Outros',
    proximaAcao: 'Revisar ajuste cadastral demonstrativo',
    proximaAcaoEm: '01/10/2026',
  }),
];
