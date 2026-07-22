import { describe, expect, it } from 'vitest';
import {
  createDemandaMutationSchema,
  deleteMutationSchema,
  editDemandaMutationSchema,
  progressMutationSchema,
  restoreMutationSchema,
  statusTransitionMutationSchema,
} from './demandMutationSchemas';

const common = {
  assunto: 'Analisar documentação',
  responsavelId: null,
  responsavel: 'Equipe externa',
  limite1: '',
  limite1Situacao: 'nao_informado' as const,
  limite1Justificativa: '',
  limite2: '',
  limite2Situacao: 'nao_informado' as const,
  limite2Justificativa: '',
  setor: 'CTRH',
  classificacao: 'Diversos',
  linkOrigem: '',
  proximaAcao: 'Verificar retorno da unidade',
  proximaAcaoEm: '20/08/2026',
};

describe('schemas de mutação do Ciclo 4', () => {
  it('exige próxima ação e data na criação não encerrada', () => {
    const result = createDemandaMutationSchema.safeParse({
      numero: 'C4-001',
      tipo: 'Processo',
      ...common,
      status: 'Aguardando Andamento',
      proximaAcao: '',
      proximaAcaoEm: '',
    });
    expect(result.success).toBe(false);
  });

  it('aceita criação encerrada sem próxima ação', () => {
    const result = createDemandaMutationSchema.safeParse({
      numero: 'C4-002',
      tipo: 'Processo',
      ...common,
      status: 'Encerrado',
      proximaAcao: '',
      proximaAcaoEm: '',
    });
    expect(result.success).toBe(true);
  });

  it('exige justificativa útil na edição', () => {
    expect(editDemandaMutationSchema.safeParse({
      ...common,
      justificativa: 'curta',
    }).success).toBe(false);
    expect(editDemandaMutationSchema.safeParse({
      ...common,
      justificativa: 'Correção confirmada na conferência',
    }).success).toBe(true);
  });

  it('valida coerência da situação do prazo', () => {
    expect(editDemandaMutationSchema.safeParse({
      ...common,
      limite1: '20/08/2026',
      limite1Situacao: 'nao_informado',
      justificativa: 'Ajuste confirmado no processo',
    }).success).toBe(false);
    expect(editDemandaMutationSchema.safeParse({
      ...common,
      limite1Situacao: 'nao_se_aplica',
      limite1Justificativa: 'Não existe prazo interno para este caso',
      justificativa: 'Ajuste confirmado no processo',
    }).success).toBe(true);
  });

  it('exige comentário, ação e data no andamento', () => {
    expect(progressMutationSchema.safeParse({
      comentario: 'Conferido',
      proximaAcao: '',
      proximaAcaoEm: '',
    }).success).toBe(false);
    expect(progressMutationSchema.safeParse({
      comentario: 'Conferido',
      proximaAcao: 'Cobrar retorno da unidade',
      proximaAcaoEm: '25/08/2026',
    }).success).toBe(true);
  });

  it('dispensa próxima ação somente ao encerrar', () => {
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
