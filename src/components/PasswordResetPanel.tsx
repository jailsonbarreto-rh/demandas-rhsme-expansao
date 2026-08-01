import type { ReactNode } from 'react';
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import { getUserFacingError } from '../domain/userFacingErrors';
import {
  passwordResetSchema,
  type PasswordResetValues,
} from '../validation/authSchemas';
import { BrandLogo } from './BrandLogo';
import { FormError } from './ui/FormError';

export type PasswordResetState = 'checking' | 'ready' | 'invalid';

interface PasswordResetPanelProps {
  state: PasswordResetState;
  loading: boolean;
  onUpdatePassword: (password: string) => Promise<void>;
  onBackToLogin: () => void;
}

export function PasswordResetPanel({
  state,
  loading,
  onUpdatePassword,
  onBackToLogin,
}: PasswordResetPanelProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const form = useForm<PasswordResetValues>({
    resolver: zodResolver(passwordResetSchema),
    defaultValues: { senha: '', confirmacao: '' },
  });
  const password = useWatch({ control: form.control, name: 'senha' }) ?? '';
  const passwordChecks = {
    minimo: password.length >= 8,
    maiuscula: /[A-Z]/.test(password),
    minuscula: /[a-z]/.test(password),
    numero: /[0-9]/.test(password),
  };

  const submit = form.handleSubmit(async ({ senha }) => {
    try {
      await onUpdatePassword(senha);
    } catch (reason) {
      toast.error(getUserFacingError(
        reason,
        'Não foi possível redefinir a senha. Solicite um novo link.',
      ));
    }
  });

  if (state === 'checking') {
    return (
      <RecoveryLayout>
        <div className="auth-flow-heading auth-flow-centered" aria-live="polite">
          <i className="fa-solid fa-shield-halved auth-flow-icon" aria-hidden="true" />
          <h3>Validando link de recuperação</h3>
          <p>Aguarde enquanto confirmamos se este link ainda pode ser utilizado.</p>
        </div>
      </RecoveryLayout>
    );
  }

  if (state === 'invalid') {
    return (
      <RecoveryLayout>
        <div className="auth-flow-heading auth-flow-centered">
          <i className="fa-solid fa-link-slash auth-flow-icon auth-flow-icon-error" aria-hidden="true" />
          <h3>Link inválido ou expirado</h3>
          <p>Solicite um novo link na tela de acesso. Nenhuma senha foi alterada.</p>
        </div>
        <button type="button" className="btn btn-primary auth-full-width" onClick={onBackToLogin}>
          Voltar e solicitar novo link
        </button>
      </RecoveryLayout>
    );
  }

  return (
    <RecoveryLayout>
      <div className="auth-flow-heading">
        <h3>Criar nova senha</h3>
        <p>Defina uma senha forte. Ao concluir, você voltará à tela de acesso.</p>
      </div>

      <form onSubmit={(event) => { void submit(event); }} noValidate>
        <div className="login-form-group">
          <label htmlFor="reset-password">Nova senha</label>
          <div className="input-icon-group has-visibility-toggle">
            <i className="fa-solid fa-lock" aria-hidden="true" />
            <input
              type={showPassword ? 'text' : 'password'}
              id="reset-password"
              className={form.formState.errors.senha ? 'form-control field-invalid' : 'form-control'}
              autoComplete="new-password"
              placeholder="••••••••"
              {...form.register('senha')}
              aria-invalid={Boolean(form.formState.errors.senha)}
              aria-describedby={form.formState.errors.senha ? 'reset-password-error' : undefined}
            />
            <button
              type="button"
              className="password-visibility-toggle"
              aria-label={showPassword ? 'Ocultar nova senha' : 'Mostrar nova senha'}
              aria-pressed={showPassword}
              onClick={() => setShowPassword((visible) => !visible)}
            >
              <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`} aria-hidden="true" />
            </button>
          </div>
          <FormError id="reset-password-error" message={form.formState.errors.senha?.message} />

          <div className="password-requirements" aria-label="Requisitos da nova senha">
            <PasswordRequirement valid={passwordChecks.minimo}>Mínimo de 8 caracteres</PasswordRequirement>
            <PasswordRequirement valid={passwordChecks.maiuscula}>Pelo menos uma letra maiúscula</PasswordRequirement>
            <PasswordRequirement valid={passwordChecks.minuscula}>Pelo menos uma letra minúscula</PasswordRequirement>
            <PasswordRequirement valid={passwordChecks.numero}>Pelo menos um número</PasswordRequirement>
          </div>
        </div>

        <div className="login-form-group">
          <label htmlFor="reset-confirmation">Confirmar nova senha</label>
          <div className="input-icon-group has-visibility-toggle">
            <i className="fa-solid fa-lock" aria-hidden="true" />
            <input
              type={showConfirmation ? 'text' : 'password'}
              id="reset-confirmation"
              className={form.formState.errors.confirmacao ? 'form-control field-invalid' : 'form-control'}
              autoComplete="new-password"
              placeholder="••••••••"
              {...form.register('confirmacao')}
              aria-invalid={Boolean(form.formState.errors.confirmacao)}
              aria-describedby={form.formState.errors.confirmacao ? 'reset-confirmation-error' : undefined}
            />
            <button
              type="button"
              className="password-visibility-toggle"
              aria-label={showConfirmation ? 'Ocultar confirmação' : 'Mostrar confirmação'}
              aria-pressed={showConfirmation}
              onClick={() => setShowConfirmation((visible) => !visible)}
            >
              <i className={`fa-solid ${showConfirmation ? 'fa-eye-slash' : 'fa-eye'}`} aria-hidden="true" />
            </button>
          </div>
          <FormError id="reset-confirmation-error" message={form.formState.errors.confirmacao?.message} />
        </div>

        <button
          type="submit"
          className="btn btn-primary auth-full-width"
          disabled={loading || form.formState.isSubmitting}
          aria-busy={loading || form.formState.isSubmitting}
        >
          {loading || form.formState.isSubmitting ? 'Salvando…' : 'Salvar nova senha'}
        </button>
      </form>
    </RecoveryLayout>
  );
}

function RecoveryLayout({ children }: { children: ReactNode }) {
  return (
    <div className="login-split-container">
      <div className="login-sidebar">
        <div className="login-sidebar-content">
          <BrandLogo variant="full" tone="inverse" showEndorsement className="login-brand-desktop" />
          <p className="sidebar-description">
            Organização, acompanhamento e rastreabilidade das demandas de Recursos Humanos.
          </p>
          <div className="sidebar-features">
            <div className="feature-item">
              <div className="feature-icon-wrapper"><i className="fa-solid fa-shield-halved" aria-hidden="true" /></div>
              <div className="feature-text">
                <strong>Acesso seguro</strong>
                <span>Use o link recebido por e-mail para proteger a sua conta.</span>
              </div>
            </div>
          </div>
        </div>
        <div className="sidebar-pattern" />
      </div>

      <div className="login-form-area">
        <div className="login-card-editorial">
          <div className="login-mobile-brand">
            <BrandLogo variant="full" showEndorsement />
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

function PasswordRequirement({ valid, children }: { valid: boolean; children: string }) {
  return (
    <div className={`req-item ${valid ? 'valid' : ''}`}>
      <i className={valid ? 'fa-solid fa-circle-check' : 'fa-solid fa-circle-xmark'} aria-hidden="true" />
      <span>{children}</span>
    </div>
  );
}
