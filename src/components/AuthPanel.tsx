import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { getUserFacingError } from '../domain/userFacingErrors';
import {
  accessRequestFormSchema,
  loginFormSchema,
  type AccessRequestFormValues,
  type LoginFormValues,
} from '../validation/authSchemas';
import { BrandLogo } from './BrandLogo';
import { FormError } from './ui/FormError';

interface AuthPanelProps {
  mode: 'local' | 'supabase';
  loading: boolean;
  onSignIn: (email: string, senha: string) => Promise<void>;
  onRequestAccess: (email: string, senha: string) => Promise<void>;
}

export function AuthPanel({ mode, loading, onSignIn, onRequestAccess }: AuthPanelProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'cadastro'>('login');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showCadastroPassword, setShowCadastroPassword] = useState(false);

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { email: '', senha: '' },
  });
  const cadastroForm = useForm<AccessRequestFormValues>({
    resolver: zodResolver(accessRequestFormSchema),
    defaultValues: { email: '', senha: '' },
  });

  const cadastroSenha = useWatch({ control: cadastroForm.control, name: 'senha' }) ?? '';
  const senhaValida = {
    minimo: cadastroSenha.length >= 8,
    maiuscula: /[A-Z]/.test(cadastroSenha),
    minuscula: /[a-z]/.test(cadastroSenha),
    numero: /[0-9]/.test(cadastroSenha),
  };

  const submitLogin = loginForm.handleSubmit(async (values) => {
    try {
      await onSignIn(values.email, values.senha);
    } catch (reason) {
      toast.error(getUserFacingError(reason, 'Não foi possível entrar.'));
    }
  });

  const submitCadastro = cadastroForm.handleSubmit(async (values) => {
    try {
      await onRequestAccess(values.email, values.senha);
      toast.success(mode === 'local'
        ? 'Solicitação simulada com sucesso. Você já pode entrar com sua conta.'
        : 'Solicitação enviada. Aguarde a aprovação de um administrador.');
      loginForm.reset({ email: values.email, senha: '' });
      cadastroForm.reset();
      setActiveTab('login');
    } catch (reason) {
      toast.error(getUserFacingError(reason, 'Não foi possível solicitar acesso.'));
    }
  });

  return (
    <div className="login-split-container">
      <div className="login-sidebar">
        <div className="login-sidebar-content">
          <BrandLogo
            variant="full"
            tone="inverse"
            showEndorsement
            className="login-brand-desktop"
          />
          <p className="sidebar-description">
            Organização, acompanhamento e rastreabilidade das demandas de Recursos Humanos.
          </p>

          <div className="sidebar-features">
            <div className="feature-item">
              <div className="feature-icon-wrapper"><i className="fa-solid fa-calendar-check" aria-hidden="true" /></div>
              <div className="feature-text">
                <strong>Prazos</strong>
                <span>Alertas claros sobre datas-limite e providências em atraso.</span>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-icon-wrapper"><i className="fa-solid fa-user-check" aria-hidden="true" /></div>
              <div className="feature-text">
                <strong>Responsáveis</strong>
                <span>Distribuição clara das demandas entre pessoas e setores.</span>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-icon-wrapper"><i className="fa-solid fa-clock-rotate-left" aria-hidden="true" /></div>
              <div className="feature-text">
                <strong>Histórico</strong>
                <span>Registro completo das movimentações e observações de cada processo.</span>
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

          <div className="login-card-header">
            <h3>Painel de acesso</h3>
            <p>Identifique-se com a sua credencial @rioeduca.net</p>
          </div>

          <div className="login-tabs" aria-label="Modalidade de acesso">
            <button
              type="button"
              aria-pressed={activeTab === 'login'}
              className={`login-tab-btn ${activeTab === 'login' ? 'active' : ''}`}
              onClick={() => setActiveTab('login')}
            >
              Entrar
            </button>
            <button
              type="button"
              aria-pressed={activeTab === 'cadastro'}
              className={`login-tab-btn ${activeTab === 'cadastro' ? 'active' : ''}`}
              onClick={() => setActiveTab('cadastro')}
            >
              Primeiro acesso
            </button>
          </div>

          {activeTab === 'login' ? (
            <form onSubmit={(event) => { void submitLogin(event); }} noValidate>
              <div className="login-form-group">
                <label htmlFor="login-email">E-mail corporativo</label>
                <div className="input-icon-group">
                  <i className="fa-solid fa-envelope" aria-hidden="true" />
                  <input
                    type="email"
                    id="login-email"
                    className={loginForm.formState.errors.email ? 'form-control field-invalid' : 'form-control'}
                    placeholder="usuario@rioeduca.net"
                    autoComplete="username"
                    {...loginForm.register('email')}
                    aria-invalid={Boolean(loginForm.formState.errors.email)}
                    aria-describedby={loginForm.formState.errors.email ? 'login-email-error' : undefined}
                  />
                </div>
                <FormError id="login-email-error" message={loginForm.formState.errors.email?.message} />
              </div>

              <div className="login-form-group" style={{ marginBottom: '25px' }}>
                <label htmlFor="login-senha">Senha</label>
                <div className="input-icon-group has-visibility-toggle">
                  <i className="fa-solid fa-lock" aria-hidden="true" />
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    id="login-senha"
                    className={loginForm.formState.errors.senha ? 'form-control field-invalid' : 'form-control'}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    {...loginForm.register('senha')}
                    aria-invalid={Boolean(loginForm.formState.errors.senha)}
                    aria-describedby={loginForm.formState.errors.senha ? 'login-senha-error' : undefined}
                  />
                  <button
                    type="button"
                    className="password-visibility-toggle"
                    aria-label={showLoginPassword ? 'Ocultar senha' : 'Mostrar senha'}
                    aria-pressed={showLoginPassword}
                    onClick={() => setShowLoginPassword((visible) => !visible)}
                  >
                    <i className={`fa-solid ${showLoginPassword ? 'fa-eye-slash' : 'fa-eye'}`} aria-hidden="true" />
                  </button>
                </div>
                <FormError id="login-senha-error" message={loginForm.formState.errors.senha?.message} />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', padding: '12px', fontWeight: '600' }}
                disabled={loading || loginForm.formState.isSubmitting}
                aria-busy={loading || loginForm.formState.isSubmitting}
              >
                {loading || loginForm.formState.isSubmitting ? 'Acessando…' : 'Acessar sistema'}
              </button>
            </form>
          ) : (
            <form onSubmit={(event) => { void submitCadastro(event); }} noValidate>
              <div className="login-form-group">
                <label htmlFor="cadastro-email">Seu e-mail corporativo</label>
                <div className="input-icon-group">
                  <i className="fa-solid fa-envelope" aria-hidden="true" />
                  <input
                    type="email"
                    id="cadastro-email"
                    className={cadastroForm.formState.errors.email ? 'form-control field-invalid' : 'form-control'}
                    placeholder="nome@rioeduca.net"
                    autoComplete="username"
                    {...cadastroForm.register('email')}
                    aria-invalid={Boolean(cadastroForm.formState.errors.email)}
                    aria-describedby={cadastroForm.formState.errors.email ? 'cadastro-email-error' : undefined}
                  />
                </div>
                <FormError id="cadastro-email-error" message={cadastroForm.formState.errors.email?.message} />
              </div>

              <div className="login-form-group" style={{ marginBottom: '20px' }}>
                <label htmlFor="cadastro-senha">Criar nova senha</label>
                <div className="input-icon-group has-visibility-toggle">
                  <i className="fa-solid fa-lock" aria-hidden="true" />
                  <input
                    type={showCadastroPassword ? 'text' : 'password'}
                    id="cadastro-senha"
                    className={cadastroForm.formState.errors.senha ? 'form-control field-invalid' : 'form-control'}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    {...cadastroForm.register('senha')}
                    aria-invalid={Boolean(cadastroForm.formState.errors.senha)}
                    aria-describedby={cadastroForm.formState.errors.senha ? 'cadastro-senha-error' : undefined}
                  />
                  <button
                    type="button"
                    className="password-visibility-toggle"
                    aria-label={showCadastroPassword ? 'Ocultar senha' : 'Mostrar senha'}
                    aria-pressed={showCadastroPassword}
                    onClick={() => setShowCadastroPassword((visible) => !visible)}
                  >
                    <i className={`fa-solid ${showCadastroPassword ? 'fa-eye-slash' : 'fa-eye'}`} aria-hidden="true" />
                  </button>
                </div>
                <FormError id="cadastro-senha-error" message={cadastroForm.formState.errors.senha?.message} />

                <div className="password-requirements" aria-label="Requisitos da senha">
                  <PasswordRequirement valid={senhaValida.minimo}>Mínimo de 8 caracteres</PasswordRequirement>
                  <PasswordRequirement valid={senhaValida.maiuscula}>Pelo menos uma letra maiúscula</PasswordRequirement>
                  <PasswordRequirement valid={senhaValida.minuscula}>Pelo menos uma letra minúscula</PasswordRequirement>
                  <PasswordRequirement valid={senhaValida.numero}>Pelo menos um número</PasswordRequirement>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', padding: '12px', fontWeight: '600' }}
                disabled={loading || cadastroForm.formState.isSubmitting}
                aria-busy={loading || cadastroForm.formState.isSubmitting}
              >
                {loading || cadastroForm.formState.isSubmitting ? 'Enviando…' : 'Solicitar acesso'}
              </button>
            </form>
          )}
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
