import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ErrorBoundary } from './ErrorBoundary';

let shouldThrow = true;

function FragileRegion() {
  if (shouldThrow) throw new Error('detalhe técnico sensível');
  return <div>Conteúdo recuperado</div>;
}

describe('ErrorBoundary', () => {
  beforeEach(() => {
    shouldThrow = true;
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('substitui a falha por uma mensagem segura e acessível', () => {
    render(
      <ErrorBoundary
        title="Não foi possível exibir esta área"
        message="Tente novamente sem perder o restante do sistema."
      >
        <FragileRegion />
      </ErrorBoundary>,
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Não foi possível exibir esta área' })).toBeInTheDocument();
    expect(screen.getByText('Tente novamente sem perder o restante do sistema.')).toBeInTheDocument();
    expect(screen.queryByText('detalhe técnico sensível')).not.toBeInTheDocument();
  });

  it('tenta renderizar novamente sem recarregar a aplicação inteira', async () => {
    const user = userEvent.setup();
    const onReset = vi.fn(() => { shouldThrow = false; });
    render(
      <ErrorBoundary
        title="Falha localizada"
        message="A área pode ser recuperada."
        onReset={onReset}
      >
        <FragileRegion />
      </ErrorBoundary>,
    );

    await user.click(screen.getByRole('button', { name: /tentar novamente/i }));

    expect(onReset).toHaveBeenCalledOnce();
    expect(screen.getByText('Conteúdo recuperado')).toBeInTheDocument();
  });

  it('oferece uma ação alternativa adequada ao contexto', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <ErrorBoundary
        title="Falha no prontuário"
        message="Feche esta área para continuar."
        secondaryAction={{ label: 'Fechar prontuário', onClick: onClose }}
      >
        <FragileRegion />
      </ErrorBoundary>,
    );

    await user.click(screen.getByRole('button', { name: 'Fechar prontuário' }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('se recupera quando a identidade da região muda', () => {
    const { rerender } = render(
      <ErrorBoundary
        title="Falha localizada"
        message="A área pode ser recuperada."
        resetKeys={[1]}
      >
        <FragileRegion />
      </ErrorBoundary>,
    );

    shouldThrow = false;
    rerender(
      <ErrorBoundary
        title="Falha localizada"
        message="A área pode ser recuperada."
        resetKeys={[2]}
      >
        <FragileRegion />
      </ErrorBoundary>,
    );

    expect(screen.getByText('Conteúdo recuperado')).toBeInTheDocument();
  });
});
