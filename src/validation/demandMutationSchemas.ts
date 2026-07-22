import { z } from 'zod';
import { isValidDateString } from '../utils/date';
import { statusValues, tipoValues } from './demandaSchemas';

const usefulText = (minimum: number, message: string) => z.string().trim().refine(
  (value) => value.replace(/\s+/g, ' ').length >= minimum,
  message,
);

const optionalDate = z.string().trim().refine(
  (value) => value === '' || isValidDateString(value),
  'Informe uma data válida no formato dd/mm/aaaa.',
);

const requiredDate = z.string().trim().refine(
  (value) => isValidDateString(value),
  'Informe uma data válida no formato dd/mm/aaaa.',
);

const deadlineState = z.enum(['definido', 'nao_informado', 'nao_se_aplica']);

function validateDeadline(
  value: { date: string; state: 'definido' | 'nao_informado' | 'nao_se_aplica'; justification: string },
  context: z.RefinementCtx,
  pathPrefix: 'limite1' | 'limite2',
): void {
  if (value.state === 'definido') {
    if (!value.date || !isValidDateString(value.date)) {
      context.addIssue({
        code: 'custom',
        path: [pathPrefix],
        message: 'Informe uma data válida para o prazo definido.',
      });
    }
    if (value.justification.trim()) {
      context.addIssue({
        code: 'custom',
        path: [`${pathPrefix}Justificativa`],
        message: 'Prazo definido não utiliza justificativa de não aplicabilidade.',
      });
    }
    return;
  }

  if (value.date.trim()) {
    context.addIssue({
      code: 'custom',
      path: [pathPrefix],
      message: 'Remova a data quando o prazo não estiver definido.',
    });
  }

  if (value.state === 'nao_informado' && value.justification.trim()) {
    context.addIssue({
      code: 'custom',
      path: [`${pathPrefix}Justificativa`],
      message: 'Prazo não informado não utiliza justificativa.',
    });
  }

  if (value.state === 'nao_se_aplica' && value.justification.trim().length < 10) {
    context.addIssue({
      code: 'custom',
      path: [`${pathPrefix}Justificativa`],
      message: 'Justifique por que o prazo não se aplica com pelo menos 10 caracteres.',
    });
  }
}

const commonDemandFields = {
  assunto: usefulText(1, 'Informe o assunto da demanda.'),
  responsavelId: z.string().uuid().nullable(),
  responsavel: z.string().trim(),
  limite1: optionalDate,
  limite1Situacao: deadlineState,
  limite1Justificativa: z.string().trim(),
  limite2: optionalDate,
  limite2Situacao: deadlineState,
  limite2Justificativa: z.string().trim(),
  setor: z.string().trim(),
  classificacao: usefulText(1, 'Selecione a classificação.'),
  linkOrigem: z.string().trim().refine(
    (value) => value === '' || /^https?:\/\//i.test(value),
    'Informe um link iniciado por http:// ou https://.',
  ),
  proximaAcao: z.string().trim(),
  proximaAcaoEm: optionalDate,
};

function validateDemandMutation(
  value: {
    status?: (typeof statusValues)[number];
    limite1: string;
    limite1Situacao: 'definido' | 'nao_informado' | 'nao_se_aplica';
    limite1Justificativa: string;
    limite2: string;
    limite2Situacao: 'definido' | 'nao_informado' | 'nao_se_aplica';
    limite2Justificativa: string;
    proximaAcao: string;
    proximaAcaoEm: string;
  },
  context: z.RefinementCtx,
): void {
  validateDeadline({
    date: value.limite1,
    state: value.limite1Situacao,
    justification: value.limite1Justificativa,
  }, context, 'limite1');
  validateDeadline({
    date: value.limite2,
    state: value.limite2Situacao,
    justification: value.limite2Justificativa,
  }, context, 'limite2');

  if (value.status !== 'Encerrado') {
    if (value.proximaAcao.replace(/\s+/g, ' ').trim().length < 5) {
      context.addIssue({
        code: 'custom',
        path: ['proximaAcao'],
        message: 'Descreva a próxima ação com pelo menos 5 caracteres.',
      });
    }
    if (!value.proximaAcaoEm || !isValidDateString(value.proximaAcaoEm)) {
      context.addIssue({
        code: 'custom',
        path: ['proximaAcaoEm'],
        message: 'Informe a data de acompanhamento.',
      });
    }
  }
}

export const createDemandaMutationSchema = z.object({
  numero: usefulText(1, 'Informe o número do processo ou documento.'),
  tipo: z.enum(tipoValues),
  ...commonDemandFields,
  status: z.enum(statusValues),
}).superRefine(validateDemandMutation);

export const editDemandaMutationSchema = z.object({
  ...commonDemandFields,
  justificativa: usefulText(10, 'Justifique a edição com pelo menos 10 caracteres.'),
}).superRefine((value, context) => validateDemandMutation(value, context));

export const progressMutationSchema = z.object({
  comentario: usefulText(1, 'Registre o andamento realizado.'),
  proximaAcao: usefulText(5, 'Descreva a próxima ação com pelo menos 5 caracteres.'),
  proximaAcaoEm: requiredDate,
});

export const statusTransitionMutationSchema = z.object({
  status: z.enum(statusValues),
  comentario: usefulText(1, 'Registre um comentário para justificar a mudança.'),
  proximaAcao: z.string().trim(),
  proximaAcaoEm: optionalDate,
}).superRefine((value, context) => {
  if (value.status === 'Encerrado') return;
  if (value.proximaAcao.replace(/\s+/g, ' ').trim().length < 5) {
    context.addIssue({
      code: 'custom',
      path: ['proximaAcao'],
      message: 'Descreva a próxima ação com pelo menos 5 caracteres.',
    });
  }
  if (!value.proximaAcaoEm || !isValidDateString(value.proximaAcaoEm)) {
    context.addIssue({
      code: 'custom',
      path: ['proximaAcaoEm'],
      message: 'Informe a data de acompanhamento.',
    });
  }
});

export const deleteMutationSchema = z.object({
  motivo: usefulText(10, 'Informe o motivo da exclusão com pelo menos 10 caracteres.'),
});

export const restoreMutationSchema = z.object({
  motivo: usefulText(10, 'Informe o motivo da restauração com pelo menos 10 caracteres.'),
});
