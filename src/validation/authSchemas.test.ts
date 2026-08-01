import { describe, expect, it } from 'vitest';
import {
  passwordRecoveryRequestSchema,
  passwordResetSchema,
} from './authSchemas';

describe('schemas de recuperação de senha', () => {
  it('aceita somente e-mail institucional na solicitação', () => {
    expect(passwordRecoveryRequestSchema.safeParse({ email: 'pessoa@rioeduca.net' }).success).toBe(true);
    expect(passwordRecoveryRequestSchema.safeParse({ email: 'pessoa@gmail.com' }).success).toBe(false);
  });

  it('exige senha forte e confirmação idêntica', () => {
    expect(passwordResetSchema.safeParse({ senha: 'NovaSenha9', confirmacao: 'NovaSenha9' }).success).toBe(true);
    expect(passwordResetSchema.safeParse({ senha: 'NovaSenha9', confirmacao: 'OutraSenha9' }).success).toBe(false);
    expect(passwordResetSchema.safeParse({ senha: 'senhafraca', confirmacao: 'senhafraca' }).success).toBe(false);
  });
});
