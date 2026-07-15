import { z } from 'zod';
import { isValidDateString } from '../utils/date';

const optionalDate = z.string().trim().refine(
  (value) => value === '' || isValidDateString(value),
  'Informe uma data válida no formato dd/mm/aaaa.',
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

export const demandaFormSchema = z.object({
  tipo: z.enum(tipoValues, { error: 'Informe o tipo da demanda.' }),
  numero: z.string().trim().min(1, 'Informe o número do processo ou documento.'),
  assunto: z.string().trim().min(1, 'Informe o assunto da demanda.'),
  responsavel: z.string().trim(),
  limite1: optionalDate,
  limite2: optionalDate,
  status: z.enum(statusValues, { error: 'Informe o status da demanda.' }),
  setor: z.string().trim(),
  classificacao: z.string().trim().min(1, 'Selecione a classificação.'),
});

export const editarDemandaSchema = z.object({
  assunto: z.string().trim().min(1, 'Informe o assunto da demanda.'),
  responsavel: z.string().trim(),
  limite1: optionalDate,
  limite2: optionalDate,
  setor: z.string().trim(),
});

export const statusDemandaSchema = z.object({
  status: z.enum(statusValues),
  comentario: z.string().trim().min(1, 'Registre um comentário para justificar a alteração.'),
});

export type DemandaFormValues = z.infer<typeof demandaFormSchema>;
export type EditarDemandaValues = z.infer<typeof editarDemandaSchema>;
export type StatusDemandaValues = z.infer<typeof statusDemandaSchema>;
