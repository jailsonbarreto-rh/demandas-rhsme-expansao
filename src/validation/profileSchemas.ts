import { z } from 'zod';

export const profileAccessSchema = z.object({
  nivel: z.enum(['administrador', 'editor', 'leitor']),
  status: z.enum(['ativo', 'pendente', 'inativo']),
  setor: z.string().trim().min(1, 'Informe o setor do perfil.'),
});

export type ProfileAccessValues = z.infer<typeof profileAccessSchema>;
