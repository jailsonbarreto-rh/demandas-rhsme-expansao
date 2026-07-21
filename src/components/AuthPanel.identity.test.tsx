import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AuthPanel } from './AuthPanel';

describe('AuthPanel — identidade única do produto', () => {
  it('usa Fluxo RH como marca e elimina o nome legado da tela de acesso', () => {
    render(
      <AuthPanel
        mode="supabase"
        loading={false}
        onSignIn={vi.fn()}
        onRequestAccess={vi.fn()}
      />,
    );

    expect(screen.getAllByText('Fluxo RH').length).toBeGreaterThan(0);
    expect(screen.queryByText('Fluxo CTRH')).not.toBeInTheDocument();
    expect(screen.queryByText('Central de Demandas')).not.toBeInTheDocument();
  });
});
