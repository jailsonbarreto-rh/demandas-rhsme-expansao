import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from './App';

describe('App no modo local', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal('alert', vi.fn());
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it('mantém login e dashboard local do perfil de teste', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.type(screen.getByPlaceholderText('usuario@rioeduca.net'), 'teste@rioeduca.net');
    await user.type(screen.getAllByPlaceholderText('••••••••')[0], 'senha-local-teste');
    await user.click(screen.getByRole('button', { name: /acessar sistema/i }));

    expect(await screen.findByRole('button', { name: /sair/i })).toBeInTheDocument();
    expect(localStorage.getItem('demandas_user')).toBe('teste@rioeduca.net');
    expect(JSON.parse(localStorage.getItem('demandas_data') ?? '[]')).toHaveLength(50);
  });

  it('encerra a sessão local sem remover as demandas', async () => {
    const user = userEvent.setup();
    localStorage.setItem('demandas_user', 'teste@rioeduca.net');
    render(<App />);
    await user.click(await screen.findByRole('button', { name: /sair/i }));

    await waitFor(() => expect(localStorage.getItem('demandas_user')).toBeNull());
    expect(screen.getByRole('button', { name: /acessar sistema/i })).toBeInTheDocument();
    expect(localStorage.getItem('demandas_data')).not.toBeNull();
  });
});
