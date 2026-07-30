import { z } from 'zod';
import type { Demanda, DeadlineState } from '../types';
import {
  requiresDeadlineChangeJustification,
  validateDeadlinePair,
  type DeadlineSnapshot,
} from '../domain/deadlineRules';
import { getTodayString, isBeforeToday, isValidDateString } from '../utils/date';

const optionalDate = z.string().trim().refine(
  (value) => value === '' || isValidDateString(value),
  'Informe uma data válida no formato dd/mm/aaaa.',
);

const optionalProfileId = z.string().trim().refine(
  (value) => value === '' || z.string().uuid().safeParse(value).success,
  'Selecione um responsável cadastrado.',
);

const usefulTextLength = (value: string): number => value.replace(/\s+/g, ' ').trim().length;

export const tipoValues = ['Expediente', 'Processo', 'Outros'] as const;
export const statusValues = [
  'Aguardando Andamento',
  'Tramitado',
  'Para Assinatura',
  'Encerrado',
  'Sobrestado',
  'Ajustar',
] as const;
export const deadlineStateValues = ['definido', 'nao_informado', 'nao_se_aplica'] as const;

function deadlineSnapshot(state: DeadlineState, date: string): DeadlineSnapshot {
  return { state, date: date.trim() };
}

function validateDefinedDeadline(
  state: DeadlineState,
  date: string,
  path: 'limite1' | 'limite2',
  context: z.RefinementCtx,
): void {
  if (state === 'definido' && !isValidDateString(date)) {
    context.addIssue({
      code: 'custom',
      path: [path],
      message: 'Informe uma data válida para o prazo definido.',
    });
  }
  if (state !== 'definido' && date.trim()) {
    context.addIssue({
      code: 'custom',
      path: [path],
      message: 'Remova a data quando o prazo não estiver definido.',
    });
  }
}

function validateDeadlineOrder(
  values: {
    limite1: string;
    limite1Situacao: DeadlineState;
    limite2: string;
    limite2Situacao: DeadlineState;
  },
  context: z.RefinementCtx,
): void {
  const message = validateDeadlinePair(
    deadlineSnapshot(values.limite1Situacao, values.limite1),
    deadlineSnapshot(values.limite2Situacao, values.limite2),
  );
  if (message) {
    context.addIssue({ code: 'custom', path: ['limite1'], message });
  }
}

function validatePastFollowUp(
  values: { proximaAcaoEm: string; proximaAcaoJustificativa: string },
  context: z.RefinementCtx,
): void {
  if (!values.proximaAcaoEm || !isValidDateString(values.proximaAcaoEm)) return;
  if (!isBeforeToday(values.proximaAcaoEm, getTodayString())) return;
  if (usefulTextLength(values.proximaAcaoJustificativa) >= 10) return;

  context.addIssue({
    code: 'custom',
    path: ['proximaAcaoJustificativa'],
    message: 'Justifique a data de acompanhamento já vencida com pelo menos 10 caracteres.',
  });
}

function validateNextAction(
  values: {
    status: (typeof statusValues)[number];
    proximaAcao: string;
    proximaAcaoEm: string;
    proximaAcaoJustificativa: string;
  },
  context: z.RefinementCtx,
): void {
  if (values.status === 'Encerrado') return;
  if (usefulTextLength(values.proximaAcao) < 5) {
    context.addIssue({
      code: 'custom',
      path: ['proximaAcao'],
      message: 'Descreva a próxima providência com pelo menos 5 caracteres.',
    });
  }
  if (!values.proximaAcaoEm || !isValidDateString(values.proximaAcaoEm)) {
    context.addIssue({
      code: 'custom',
      path: ['proximaAcaoEm'],
      message: 'Informe a data de acompanhamento.',
    });
    return;
  }
  validatePastFollowUp(values, context);
}

export const demandaFormSchema = z.object({
  tipo: z.enum(tipoValues, { error: 'Informe o tipo da demanda.' }),
  numero: z.string().trim().min(1, 'Informe o número do processo ou documento.'),
  assunto: z.string().trim().min(1, 'Informe o assunto da demanda.'),
  responsavelId: optionalProfileId,
  limite1Situacao: z.literal('definido'),
  limite1: optionalDate,
  limite2Situacao: z.enum(['definido', 'nao_se_aplica'], {
    error: 'Escolha uma data para o prazo final ou marque Não se aplica.',
  }),
  limite2: optionalDate,
  status: z.enum(statusValues, { error: 'Informe o status da demanda.' }),
  setor: z.string().trim(),
  classificacao: z.string().trim().min(1, 'Selecione a classificação.'),
  proximaAcao: z.string().trim(),
  proximaAcaoEm: optionalDate,
  proximaAcaoJustificativa: z.string().trim(),
}).superRefine((values, context) => {
  validateDefinedDeadline(values.limite1Situacao, values.limite1, 'limite1', context);
  validateDefinedDeadline(values.limite2Situacao, values.limite2, 'limite2', context);
  validateDeadlineOrder(values, context);
  validateNextAction(values, context);
});

const editarDemandaBaseSchema = z.object({
  assunto: z.string().trim().min(1, 'Informe o assunto da demanda.'),
  responsavelId: optionalProfileId,
  limite1Situacao: z.enum(deadlineStateValues),
  limite1: optionalDate,
  limite2Situacao: z.enum(deadlineStateValues),
  limite2: optionalDate,
  setor: z.string().trim(),
  justificativa: z.string().trim(),
});

export type EditarDemandaValues = z.infer<typeof editarDemandaBaseSchema>;

export function editRequiresJustification(
  demanda: Demanda,
  values: Pick<
    EditarDemandaValues,
    'assunto' | 'responsavelId' | 'limite1Situacao' | 'limite1' | 'limite2Situacao' | 'limite2' | 'setor'
  >,
): boolean {
  const originalInternal = deadlineSnapshot(demanda.limite1Situacao, demanda.limite1);
  const nextInternal = deadlineSnapshot(values.limite1Situacao, values.limite1);
  const originalFinal = deadlineSnapshot(demanda.limite2Situacao, demanda.limite2);
  const nextFinal = deadlineSnapshot(values.limite2Situacao, values.limite2);

  const deadlineChanged = (
    requiresDeadlineChangeJustification(originalInternal, nextInternal)
    || requiresDeadlineChangeJustification(originalFinal, nextFinal)
  );
  const registrationChanged = (
    values.assunto.trim() !== demanda.assunto.trim()
    || values.responsavelId !== (demanda.responsavelId ?? '')
    || values.setor.trim() !== demanda.setor.trim()
  );

  return deadlineChanged || registrationChanged;
}

export function createEditarDemandaSchema(demanda: Demanda) {
  return editarDemandaBaseSchema.superRefine((values, context) => {
    validateDefinedDeadline(values.limite1Situacao, values.limite1, 'limite1', context);
    validateDefinedDeadline(values.limite2Situacao, values.limite2, 'limite2', context);
    validateDeadlineOrder(values, context);

    if (values.limite1Situacao === 'nao_se_aplica') {
      context.addIssue({
        code: 'custom',
        path: ['limite1Situacao'],
        message: 'O prazo interno deve possuir uma data quando for informado.',
      });
    }
    if (values.limite1Situacao === 'nao_informado' && demanda.limite1Situacao !== 'nao_informado') {
      context.addIssue({
        code: 'custom',
        path: ['limite1Situacao'],
        message: 'Um prazo interno já registrado não pode voltar a Não informado.',
      });
    }
    if (values.limite2Situacao === 'nao_informado' && demanda.limite2Situacao !== 'nao_informado') {
      context.addIssue({
        code: 'custom',
        path: ['limite2Situacao'],
        message: 'Um prazo final já registrado não pode voltar a Não informado.',
      });
    }

    if (editRequiresJustification(demanda, values) && usefulTextLength(values.justificativa) < 10) {
      context.addIssue({
        code: 'custom',
        path: ['justificativa'],
        message: 'Informe o motivo da alteração para continuar (mínimo de 10 caracteres).',
      });
    }
  });
}

export const statusDemandaSchema = z.object({
  status: z.enum(statusValues),
  comentario: z.string().trim().min(1, 'Registre um comentário para justificar a alteração.'),
  proximaAcao: z.string().trim(),
  proximaAcaoEm: optionalDate,
  proximaAcaoJustificativa: z.string().trim(),
}).superRefine(validateNextAction);

export type DemandaFormValues = z.infer<typeof demandaFormSchema>;
export type StatusDemandaValues = z.infer<typeof statusDemandaSchema>;
