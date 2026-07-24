import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { MinhasDemandasCallout } from './MinhasDemandasCallout';

describe('MinhasDemandasCallout', () => {
  it('apresenta somente a mensagem aprovada e executa a ação principal', async () => {
    const onOpen = vi.fn();
    const user = userEvent.setup();
    render(<MinhasDemandasCallout onOpen={onOpen} />);

    expect(screen.getByRole('heading', { name: 'Minhas demandas' })).toBeVisible();
    expect(screen.getByText('Acompanhe sua carteira de processos.')).toBeVisible();
    expect(screen.queryByText(/atribuídas|vencidas|para hoje|assinatura/i)).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Acessar minha carteira' }));
    expect(onOpen).toHaveBeenCalledTimes(1);
  });
});
