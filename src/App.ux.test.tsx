import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { App } from './App';

describe('segurança e acessibilidade do login', () => {
  afterEach(() => {
    cleanup();
    localStorage.clear();
    window.history.replaceState({}, '', '/');
    vi.unstubAllGlobals();
  });

  it('permite mostrar e ocultar a senha', async () => {
    render(<App />);
    const password = screen.getAllByPlaceholderText('••••••••')[0];
    expect(password).toHaveAttribute('type', 'password');
    await userEvent.setup().click(screen.getByRole('button', { name: /mostrar senha/i }));
    expect(password).toHaveAttribute('type', 'text');
    expect(screen.getByRole('button', { name: /ocultar senha/i })).toBeInTheDocument();
  });

  it('limpa e-mail e senha dos campos ao sair', async () => {
    const user = userEvent.setup();
    vi.stubGlobal('alert', vi.fn());
    render(<App />);
    await user.type(screen.getByPlaceholderText('usuario@rioeduca.net'), 'teste@rioeduca.net');
    await user.type(screen.getAllByPlaceholderText('••••••••')[0], 'senha-local-teste');
    await user.click(screen.getByRole('button', { name: /acessar sistema/i }));
    await user.click(await screen.findByRole('button', { name: /sair/i }));
    await waitFor(() => expect(screen.getByPlaceholderText('usuario@rioeduca.net')).toHaveValue(''));
    expect(screen.getAllByPlaceholderText('••••••••')[0]).toHaveValue('');
  });

  it('nomeia o controle de fechar o drawer', async () => {
    localStorage.setItem('demandas_user', 'teste@rioeduca.net');
    render(<App />);
    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: /^demandas$/i }));
    await user.click((await screen.findAllByRole('button', { name: /^abrir$/i }))[0]);
    expect(await screen.findByRole('button', { name: /fechar painel de detalhes/i })).toHaveAttribute('aria-label');
  });
  it('torna o drawer inerte enquanto um modal está aberto sobre ele', async () => {
    localStorage.setItem('demandas_user', 'teste@rioeduca.net');
    render(<App />);
    const user = userEvent.setup();

    await user.click(await screen.findByRole('button', { name: /^demandas$/i }));
    await user.click((await screen.findAllByRole('button', { name: /^abrir$/i }))[0]);
    await user.click(await screen.findByRole('button', { name: /^editar$/i }));

    expect(await screen.findByRole('heading', { name: /editar dados da demanda/i })).toBeVisible();
    await waitFor(() => {
      const drawer = document.querySelector('.drawer-overlay');
      expect(drawer).toHaveAttribute('inert');
      expect(drawer).toHaveAttribute('aria-hidden', 'true');
    });
  });

});

describe('navegação persistente', () => {
  afterEach(() => {
    cleanup();
    localStorage.clear();
    window.history.replaceState({}, '', '/');
  });

  it('restaura a tela de demandas pela URL', async () => {
    localStorage.setItem('demandas_user', 'teste@rioeduca.net');
    window.history.replaceState({}, '', '/demandas?status=Todos%20%28exibir%20tudo%29');
    render(<App />);

    expect(await screen.findByRole('button', { name: /^demandas$/i })).toHaveClass('active');
    expect(await screen.findByLabelText(/^status$/i)).toHaveValue('Todos (exibir tudo)');
  });
});
