import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AuthPanel } from './AuthPanel';
import { PasswordResetPanel } from './PasswordResetPanel';

describe('recuperação de senha', () => {
  afterEach(cleanup);

  it('solicita o link e mostra confirmação que não revela a existência da conta', async () => {
    const user = userEvent.setup();
    const onRequestPasswordReset = vi.fn().mockResolvedValue(undefined);
    render(
      <AuthPanel
        mode="supabase"
        loading={false}
        onSignIn={vi.fn()}
        onRequestAccess={vi.fn()}
        onRequestPasswordReset={onRequestPasswordReset}
      />,
    );

    await user.click(screen.getByRole('button', { name: /esqueci minha senha/i }));
    await user.type(screen.getByLabelText(/e-mail corporativo/i), 'pessoa@rioeduca.net');
    await user.click(screen.getByRole('button', { name: /enviar link de recuperação/i }));

    expect(onRequestPasswordReset).toHaveBeenCalledWith('pessoa@rioeduca.net');
    expect(await screen.findByText(/se houver uma conta vinculada a esse e-mail/i)).toBeVisible();
  });

  it('não abre campos de senha para link inválido ou expirado', () => {
    render(
      <PasswordResetPanel
        state="invalid"
        loading={false}
        onUpdatePassword={vi.fn()}
        onBackToLogin={vi.fn()}
      />,
    );

    expect(screen.getByRole('heading', { name: /link inválido ou expirado/i })).toBeVisible();
    expect(screen.queryByLabelText(/^nova senha$/i)).not.toBeInTheDocument();
  });

  it('atualiza somente com senha forte e confirmação idêntica', async () => {
    const user = userEvent.setup();
    const onUpdatePassword = vi.fn().mockResolvedValue(undefined);
    render(
      <PasswordResetPanel
        state="ready"
        loading={false}
        onUpdatePassword={onUpdatePassword}
        onBackToLogin={vi.fn()}
      />,
    );

    await user.type(screen.getByLabelText(/^nova senha$/i), 'NovaSenha9');
    await user.type(screen.getByLabelText(/confirmar nova senha/i), 'OutraSenha9');
    await user.click(screen.getByRole('button', { name: /salvar nova senha/i }));
    expect(await screen.findByText(/as senhas precisam ser iguais/i)).toBeVisible();
    expect(onUpdatePassword).not.toHaveBeenCalled();

    await user.clear(screen.getByLabelText(/confirmar nova senha/i));
    await user.type(screen.getByLabelText(/confirmar nova senha/i), 'NovaSenha9');
    await user.click(screen.getByRole('button', { name: /salvar nova senha/i }));

    expect(onUpdatePassword).toHaveBeenCalledWith('NovaSenha9');
  });
});
