import { z } from 'zod';
import type { DeadlineState } from '../types';
import { validateDeadlinePair } from '../domain/deadlineRules';
import { getTodayString, isBeforeToday, isValidDateString } from '../utils/date';
import { statusValues, tipoValues } from './demandaSchemas';

const usefulText = (minimum: number, message: string) => z.string().trim().refine(
  (value) => value.replace(/\s+/g, ' ').length >= minimum,
  message,
);
const optionalReason = z.string().trim().optional().default('');
const optionalDate = z.string().trim().refine(
  (value) => value === '' || isValidDateString(value),
  'Informe uma data válida no formato dd/mm/aaaa.',
);
const requiredDate = z.string().trim().refine(
  (value) => isValidDateString(value),
  'Informe uma data válida no formato dd/mm/aaaa.',
);
const deadlineState = z.enum(['definido', 'nao_informado', 'nao_se_aplica']);

function validateDeadlineValue(
  state: DeadlineState,
  date: string,
  context: z.RefinementCtx,
  path: 'limite1' | 'limite2',
): void {
  if (state === 'definido' && !isValidDateString(date)) {
    context.addIssue({ code: 'custom', path: [path], message: 'Informe uma data válida para o prazo definido.' });
  }
  if (state !== 'definido' && date.trim()) {
    context.addIssue({ code: 'custom', path: [path], message: 'Remova a data quando o prazo não estiver definido.' });
  }
}

function validateDeadlineFields(
  value: {
    limite1: string;
    limite1Situacao: DeadlineState;
    limite2: string;
    limite2Situacao: DeadlineState;
  },
  context: z.RefinementCtx,
): void {
  validateDeadlineValue(value.limite1Situacao, value.limite1, context, 'limite1');
  validateDeadlineValue(value.limite2Situacao, value.limite2, context, 'limite2');
  const orderError = validateDeadlinePair(
    { state: value.limite1Situacao, date: value.limite1 },
    { state: value.limite2Situacao, date: value.limite2 },
  );
  if (orderError) context.addIssue({ code: 'custom', path: ['limite1'], message: orderError });
}

function validatePastFollowUp(
  value: { proximaAcaoEm: string; proximaAcaoJustificativa: string },
  context: z.RefinementCtx,
): void {
  if (!value.proximaAcaoEm || !isValidDateString(value.proximaAcaoEm)) return;
  if (!isBeforeToday(value.proximaAcaoEm, getTodayString())) return;
  if (value.proximaAcaoJustificativa.replace(/\s+/g, ' ').trim().length >= 10) return;
  context.addIssue({
    code: 'custom',
    path: ['proximaAcaoJustificativa'],
    message: 'Justifique a data de acompanhamento já vencida com pelo menos 10 caracteres.',
  });
}

function validateRequiredNextAction(
  value: { proximaAcao: string; proximaAcaoEm: string; proximaAcaoJustificativa: string },
  context: z.RefinementCtx,
): void {
  if (value.proximaAcao.replace(/\s+/g, ' ').trim().length < 5) {
    context.addIssue({
      code: 'custom',
      path: ['proximaAcao'],
      message: 'Descreva a próxima providência com pelo menos 5 caracteres.',
    });
  }
  if (!value.proximaAcaoEm || !isValidDateString(value.proximaAcaoEm)) {
    context.addIssue({ code: 'custom', path: ['proximaAcaoEm'], message: 'Informe a data de acompanhamento.' });
    return;
  }
  validatePastFollowUp(value, context);
}

const commonDeadlineFields = {
  limite1: optionalDate,
  limite1Situacao: deadlineState,
  limite1Justificativa: z.string().trim(),
  limite2: optionalDate,
  limite2Situacao: deadlineState,
  limite2Justificativa: z.string().trim(),
};

export const createDemandaMutationSchema = z.object({
  numero: usefulText(1, 'Informe o número do processo ou documento.'),
  tipo: z.enum(tipoValues),
  assunto: usefulText(1, 'Informe o assunto da demanda.'),
  responsavelId: z.string().uuid().nullable(),
  responsavel: z.string().trim(),
  ...commonDeadlineFields,
  setor: z.string().trim(),
  classificacao: usefulText(1, 'Selecione a classificação.'),
  linkOrigem: z.string().trim().refine(
    (value) => value === '' || /^https?:\/\//i.test(value),
    'Informe um link iniciado por http:// ou https://.',
  ),
  proximaAcao: z.string().trim(),
  proximaAcaoEm: optionalDate,
  proximaAcaoJustificativa: optionalReason,
  status: z.enum(statusValues),
}).superRefine((value, context) => {
  validateDeadlineFields(value, context);
  if (value.limite1Situacao !== 'definido') {
    context.addIssue({ code: 'custom', path: ['limite1Situacao'], message: 'O prazo interno é obrigatório em novas demandas.' });
  }
  if (!['definido', 'nao_se_aplica'].includes(value.limite2Situacao)) {
    context.addIssue({
      code: 'custom',
      path: ['limite2Situacao'],
      message: 'Escolha uma data para o prazo final ou marque Não se aplica.',
    });
  }
  if (value.status !== 'Encerrado') validateRequiredNextAction(value, context);
});

export const editDemandaMutationSchema = z.object({
  assunto: usefulText(1, 'Informe o assunto da demanda.'),
  responsavelId: z.string().uuid().nullable(),
  responsavel: z.string().trim(),
  ...commonDeadlineFields,
  setor: z.string().trim(),
  classificacao: usefulText(1, 'Selecione a classificação.'),
  linkOrigem: z.string().trim().refine(
    (value) => value === '' || /^https?:\/\//i.test(value),
    'Informe um link iniciado por http:// ou https://.',
  ),
  justificativa: z.string().trim(),
}).superRefine(validateDeadlineFields);

export const progressMutationSchema = z.object({
  comentario: usefulText(1, 'Registre o andamento realizado.'),
  proximaAcao: usefulText(5, 'Descreva a próxima providência com pelo menos 5 caracteres.'),
  proximaAcaoEm: requiredDate,
  proximaAcaoJustificativa: optionalReason,
}).superRefine(validatePastFollowUp);

export const statusTransitionMutationSchema = z.object({
  status: z.enum(statusValues),
  comentario: usefulText(1, 'Registre um comentário para justificar a mudança.'),
  proximaAcao: z.string().trim(),
  proximaAcaoEm: optionalDate,
  proximaAcaoJustificativa: optionalReason,
}).superRefine((value, context) => {
  if (value.status !== 'Encerrado') validateRequiredNextAction(value, context);
});

export const deleteMutationSchema = z.object({
  motivo: usefulText(10, 'Informe o motivo da exclusão com pelo menos 10 caracteres.'),
});
