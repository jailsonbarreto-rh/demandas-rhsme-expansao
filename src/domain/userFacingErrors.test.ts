import { describe, expect, it } from 'vitest';
import { getUserFacingError } from './userFacingErrors';

describe('getUserFacingError', () => {
  it('preserva mensagens de negócio compreensíveis', () => {
    expect(getUserFacingError(
      new Error('Informe o motivo da alteração para continuar.'),
      'Não foi possível salvar a alteração.',
    )).toBe('Informe o motivo da alteração para continuar.');
  });

  it('oculta detalhes de PostgREST, RPC, schema e constraints', () => {
    const fallback = 'Não foi possível salvar a alteração.';
    const technicalMessages = [
      'PGRST204: Could not find the public.editar_sme_demanda_r4 function in the schema cache',
      'permission denied for relation sme_demandas',
      'duplicate key value violates unique constraint sme_demandas_numero_key',
      'SQLSTATE 23505',
    ];

    for (const message of technicalMessages) {
      expect(getUserFacingError(new Error(message), fallback)).toBe(fallback);
    }
  });

  it('traduz erros comuns de autenticação', () => {
    expect(getUserFacingError(new Error('Invalid login credentials'), 'Não foi possível entrar.'))
      .toBe('E-mail ou senha incorretos.');
    expect(getUserFacingError(new Error('User already registered'), 'Não foi possível solicitar acesso.'))
      .toBe('Este e-mail já possui cadastro ou solicitação de acesso.');
  });
});
