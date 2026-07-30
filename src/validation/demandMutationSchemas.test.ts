import { describe, expect, it } from 'vitest';
import {
  createDemandaMutationSchema,
  deleteMutationSchema,
  editDemandaMutationSchema,
  progressMutationSchema,
  restoreMutationSchema,
  statusTransitionMutationSchema,
} from './demandMutationSchemas';

const validDeadlines = {
  limite1: '10/08/2099',
  limite1Situacao: 'definido' as const,
  limite1Justificativa: '',
  limite2: '',
  limite2Situacao: 'nao_se_aplica' as const,
  limite2Justificativa: '',
};

const createBase = {
  numero: 'R4-001',
  tipo: 'Processo' as const,
  assunto: 'Analisar documentação',
  responsavelId: null,
  responsavel: '',
  ...validDeadlines,
  setor: 'CTRH',
  classificacao: 'Diversos',
  linkOrigem: '',
  proximaAcao: 'Verificar retorno da unidade',
  proximaAcaoEm: '20/08/2099',
  proximaAcaoJustificativa: '',
  status: 'Aguardando Andamento' as const,
};

const legacyEdit = {
  assunto: 'Analisar documentação legada',
  responsavelId: null,
  responsavel: '',
  limite1: '',
  limite1Situacao: 'nao_informado' as const,
  limite1Justificativa: '',
  limite2: '',
  limite2Situacao: 'nao_informado' as const,
  limite2Justificativa: '',
  setor: 'CTRH',
  classificacao: 'Diversos',
  linkOrigem: '',
  justificativa: 'Correção cadastral do registro legado',
};

describe('schemas de mutação do R4', () => {
  it('exige prazo interno definido na criação', () => {
    const result = createDemandaMutationSchema.safeParse({
      ...createBase,
      limite1: '',
      limite1Situacao: 'nao_informado',
    });
    expect(result.success).toBe(false);
  });

  it('exige escolha explícita entre data e não se aplica para prazo final', () => {
    expect(createDemandaMutationSchema.safeParse({
      ...createBase,
      limite2: '',
      limite2Situacao: 'nao_informado',
    }).success).toBe(false);
    expect(createDemandaMutationSchema.safeParse(createBase).success).toBe(true);
  });

  it('aceita criação encerrada sem próxima providência, mantendo prazos válidos', () => {
    const result = createDemandaMutationSchema.safeParse({
      ...createBase,
      status: 'Encerrado',
      proximaAcao: '',
      proximaAcaoEm: '',
    });
    expect(result.success).toBe(true);
  });

  it('preserva lacunas de prazo em edição cadastral de demanda legada', () => {
    expect(editDemandaMutationSchema.safeParse(legacyEdit).success).toBe(true);
  });

  it('rejeita data oculta em estado não informado e inversão de prazos', () => {
    expect(editDemandaMutationSchema.safeParse({
      ...legacyEdit,
      limite1: '20/08/2099',
      limite1Situacao: 'nao_informado',
    }).success).toBe(false);
    expect(editDemandaMutationSchema.safeParse({
      ...legacyEdit,
      limite1: '21/08/2099',
      limite1Situacao: 'definido',
      limite2: '20/08/2099',
      limite2Situacao: 'definido',
    }).success).toBe(false);
  });

  it('exige comentário, providência e data no andamento', () => {
    expect(progressMutationSchema.safeParse({
      comentario: 'Conferido',
      proximaAcao: '',
      proximaAcaoEm: '',
    }).success).toBe(false);
    expect(progressMutationSchema.safeParse({
      comentario: 'Conferido',
      proximaAcao: 'Cobrar retorno da unidade',
      proximaAcaoEm: '25/08/2099',
    }).success).toBe(true);
  });

  it('exige justificativa para próxima providência já vencida', () => {
    expect(progressMutationSchema.safeParse({
      comentario: 'Conferido',
      proximaAcao: 'Cobrar retorno da unidade',
      proximaAcaoEm: '01/01/2000',
      proximaAcaoJustificativa: '',
    }).success).toBe(false);
    expect(progressMutationSchema.safeParse({
      comentario: 'Conferido',
      proximaAcao: 'Cobrar retorno da unidade',
      proximaAcaoEm: '01/01/2000',
      proximaAcaoJustificativa: 'Registro tardio devidamente explicado',
    }).success).toBe(true);
  });

  it('dispensa próxima providência somente ao encerrar', () => {
    expect(statusTransitionMutationSchema.safeParse({
      status: 'Tramitado',
      comentario: 'Encaminhado',
      proximaAcao: '',
      proximaAcaoEm: '',
    }).success).toBe(false);
    expect(statusTransitionMutationSchema.safeParse({
      status: 'Encerrado',
      comentario: 'Concluído',
      proximaAcao: '',
      proximaAcaoEm: '',
    }).success).toBe(true);
  });

  it('exige motivo com dez caracteres na exclusão e restauração', () => {
    expect(deleteMutationSchema.safeParse({ motivo: 'curto' }).success).toBe(false);
    expect(restoreMutationSchema.safeParse({ motivo: 'curto' }).success).toBe(false);
    expect(deleteMutationSchema.safeParse({ motivo: 'Registro duplicado confirmado' }).success).toBe(true);
    expect(restoreMutationSchema.safeParse({ motivo: 'Registro deve voltar à carteira' }).success).toBe(true);
  });
});
