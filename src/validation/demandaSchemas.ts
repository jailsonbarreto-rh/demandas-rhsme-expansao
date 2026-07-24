import { z } from 'zod';
import { isValidDateString } from '../utils/date';

const optionalDate = z.string().trim().refine(
  (value) => value === '' || isValidDateString(value),
  'Informe uma data válida no formato dd/mm/aaaa.',
);

const optionalProfileId = z.string().trim().refine(
  (value) => value === '' || z.string().uuid().safeParse(value).success,
  'Selecione um responsável cadastrado.',
);

export const tipoValues = ['Expediente', 'Processo', 'Outros'] as const;
export const statusValues = [
  'Aguardando Andamento',
  'Tramitado',
  'Para Assinatura',
  'Encerrado',
  'Sobrestado',
  'Ajustar',
] as const;

function validateNextAction(
  values: { status: (typeof statusValues)[number]; proximaAcao: string; proximaAcaoEm: string },
  context: z.RefinementCtx,
): void {
  if (values.status === 'Encerrado') return;
  if (values.proximaAcao.replace(/\s+/g, ' ').trim().length < 5) {
    context.addIssue({
      code: 'custom',
      path: ['proximaAcao'],
      message: 'Descreva a próxima ação com pelo menos 5 caracteres.',
    });
  }
  if (!values.proximaAcaoEm || !isValidDateString(values.proximaAcaoEm)) {
    context.addIssue({
      code: 'custom',
      path: ['proximaAcaoEm'],
      message: 'Informe a data de acompanhamento.',
    });
  }
}

export const demandaFormSchema = z.object({
  tipo: z.enum(tipoValues, { error: 'Informe o tipo da demanda.' }),
  numero: z.string().trim().min(1, 'Informe o número do processo ou documento.'),
  assunto: z.string().trim().min(1, 'Informe o assunto da demanda.'),
  responsavelId: optionalProfileId,
  limite1: optionalDate,
  limite2: optionalDate,
  status: z.enum(statusValues, { error: 'Informe o status da demanda.' }),
  setor: z.string().trim(),
  classificacao: z.string().trim().min(1, 'Selecione a classificação.'),
  proximaAcao: z.string().trim(),
  proximaAcaoEm: optionalDate,
}).superRefine(validateNextAction);

export const editarDemandaSchema = z.object({
  assunto: z.string().trim().min(1, 'Informe o assunto da demanda.'),
  responsavelId: optionalProfileId,
  limite1: optionalDate,
  limite2: optionalDate,
  setor: z.string().trim(),
  proximaAcao: z.string().trim(),
  proximaAcaoEm: optionalDate,
  justificativa: z.string().trim().min(10, 'Justifique a edição com pelo menos 10 caracteres.'),
});

export const statusDemandaSchema = z.object({
  status: z.enum(statusValues),
  comentario: z.string().trim().min(1, 'Registre um comentário para justificar a alteração.'),
  proximaAcao: z.string().trim(),
  proximaAcaoEm: optionalDate,
}).superRefine(validateNextAction);

export type DemandaFormValues = z.infer<typeof demandaFormSchema>;
export type EditarDemandaValues = z.infer<typeof editarDemandaSchema>;
export type StatusDemandaValues = z.infer<typeof statusDemandaSchema>;
