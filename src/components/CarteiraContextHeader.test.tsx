import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { CarteiraContextHeader } from './CarteiraContextHeader';

describe('CarteiraContextHeader', () => {
  it('apresenta a carteira geral e oferece acesso à pessoal', async () => {
    const onSwitch = vi.fn();
    const user = userEvent.setup();

    render(<CarteiraContextHeader mode="geral" onSwitch={onSwitch} />);

    expect(screen.getByRole('heading', { name: 'Todas as demandas' })).toBeVisible();
    expect(screen.getByText('Consulte a carteira completa da equipe.')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Ver minhas demandas' }));
    expect(onSwitch).toHaveBeenCalledOnce();
  });

  it('apresenta a carteira pessoal e oferece retorno à geral', () => {
    render(<CarteiraContextHeader mode="pessoal" onSwitch={vi.fn()} />);

    expect(screen.getByRole('heading', { name: 'Minhas demandas' })).toBeVisible();
    expect(screen.getByText('Acompanhe sua carteira de processos.')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Ver todas as demandas' })).toBeVisible();
  });
});
