import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DeadlineControl } from './DeadlineControl';

describe('DeadlineControl', () => {
  afterEach(cleanup);

  it('mostra a data apenas quando o prazo está definido', () => {
    render(
      <DeadlineControl
        idPrefix="prazo-final"
        label="Prazo final"
        state="definido"
        date="10/08/2099"
        allowedStates={['definido', 'nao_se_aplica']}
        onStateChange={vi.fn()}
        onDateChange={vi.fn()}
      />,
    );
    expect(screen.getByLabelText('Data de prazo final')).toBeInTheDocument();
    expect(screen.getByLabelText('Não se aplica')).toBeInTheDocument();
  });

  it('limpa a data oculta ao selecionar Não se aplica', () => {
    const onStateChange = vi.fn();
    const onDateChange = vi.fn();
    render(
      <DeadlineControl
        idPrefix="prazo-final"
        label="Prazo final"
        state="definido"
        date="10/08/2099"
        allowedStates={['definido', 'nao_se_aplica']}
        onStateChange={onStateChange}
        onDateChange={onDateChange}
      />,
    );
    fireEvent.click(screen.getByLabelText('Não se aplica'));
    expect(onStateChange).toHaveBeenCalledWith('nao_se_aplica');
    expect(onDateChange).toHaveBeenCalledWith('');
  });

  it('explica a ausência legada sem classificá-la como atraso', () => {
    render(
      <DeadlineControl
        idPrefix="prazo-interno"
        label="Prazo interno"
        state="nao_informado"
        date=""
        allowedStates={['nao_informado', 'definido']}
        onStateChange={vi.fn()}
        onDateChange={vi.fn()}
      />,
    );
    expect(screen.getByText('Informação preservada como ausente no registro legado.')).toBeInTheDocument();
    expect(screen.queryByText(/vencid/i)).not.toBeInTheDocument();
  });
});
