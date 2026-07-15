import { z } from 'zod';

const institutionalEmailSchema = z
  .string()
  .trim()
  .min(1, 'Informe o e-mail corporativo.')
  .email('Informe um e-mail válido.')
  .refine((email) => email.toLowerCase().endsWith('@rioeduca.net'), {
    message: 'Use um e-mail @rioeduca.net.',
  });

export const loginFormSchema = z.object({
  email: institutionalEmailSchema,
  senha: z.string().min(1, 'Informe a senha.'),
});

export const accessRequestFormSchema = z.object({
  email: institutionalEmailSchema,
  senha: z
    .string()
    .min(8, 'A senha deve ter no mínimo 8 caracteres.')
    .regex(/[A-Z]/, 'Inclua pelo menos uma letra maiúscula.')
    .regex(/[a-z]/, 'Inclua pelo menos uma letra minúscula.')
    .regex(/[0-9]/, 'Inclua pelo menos um número.'),
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;
export type AccessRequestFormValues = z.infer<typeof accessRequestFormSchema>;
