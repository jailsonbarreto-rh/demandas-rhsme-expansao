import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createDemandFixture } from '../test/expandedFixtures';
import { ModalEditar } from './ModalEditar';
import { ModalNovo } from './ModalNovo';

const demanda = createDemandFixture({
  id: 1,
  numero: 'SME-PRO-2026/00001',
  tipo: 'Processo',
  assunto: 'Assunto original',
  responsavel: 'Responsável',
  limite1: '',
  limite2: '',
  status: 'Aguardando Andamento',
  setor: 'E/CTRH',
  classificacao: 'Outros',
});

function fillRequiredNewDemandFields() {
  fireEvent.change(screen.getByLabelText('Tipo'), { target: { value: 'Processo' } });
  fireEvent.change(screen.getByLabelText('Número'), { target: { value: 'SME-PRO-2026/99999' } });
  fireEvent.change(screen.getByLabelText('Assunto'), { target: { value: 'Nova demanda' } });
  fireEvent.change(screen.getByLabelText('Status'), { target: { value: 'Aguardando Andamento' } });
  fireEvent.change(screen.getByLabelText('Selecione a classificação'), { target: { value: 'Outros' } });
}

describe('validação de datas nos modais', () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('impede criar demanda com data parcial e apresenta erro junto ao campo', async () => {
    const onSalvar = vi.fn();
    const alert = vi.spyOn(window, 'alert').mockImplementation(() => undefined);
    render(<ModalNovo onClose={vi.fn()} onSalvar={onSalvar} />);
    fillRequiredNewDemandFields();
    fireEvent.change(screen.getByLabelText('Limite 1'), { target: { value: '12/07' } });

    fireEvent.submit(screen.getByRole('button', { name: /^salvar$/i }).closest('form')!);

    expect(await screen.findByText(/informe uma data válida no formato dd\/mm\/aaaa/i)).toBeVisible();
    expect(onSalvar).not.toHaveBeenCalled();
    expect(alert).not.toHaveBeenCalled();
  });

  it('impede criar demanda com data inexistente', async () => {
    const onSalvar = vi.fn();
    render(<ModalNovo onClose={vi.fn()} onSalvar={onSalvar} />);
    fillRequiredNewDemandFields();
    fireEvent.change(screen.getByLabelText('Limite 2'), { target: { value: '31/02/2026' } });

    fireEvent.submit(screen.getByRole('button', { name: /^salvar$/i }).closest('form')!);

    expect(await screen.findByText(/informe uma data válida no formato dd\/mm\/aaaa/i)).toBeVisible();
    expect(onSalvar).not.toHaveBeenCalled();
  });

  it('permite criar demanda com datas válidas', async () => {
    const onSalvar = vi.fn();
    render(<ModalNovo onClose={vi.fn()} onSalvar={onSalvar} />);
    fillRequiredNewDemandFields();
    fireEvent.change(screen.getByLabelText('Limite 1'), { target: { value: '12/07/2026' } });
    fireEvent.change(screen.getByLabelText('Limite 2'), { target: { value: '30/07/2026' } });

    fireEvent.submit(screen.getByRole('button', { name: /^salvar$/i }).closest('form')!);

    await waitFor(() => expect(onSalvar).toHaveBeenCalledWith(expect.objectContaining({
      limite1: '12/07/2026',
      limite2: '30/07/2026',
    })));
  });

  it('valida datas também na edição', async () => {
    const onSalvar = vi.fn();
    render(<ModalEditar demanda={demanda} onClose={vi.fn()} onSalvar={onSalvar} />);
    fireEvent.change(screen.getByLabelText('Limite 2'), { target: { value: '31/04/2026' } });

    fireEvent.submit(screen.getByRole('button', { name: /salvar alterações/i }).closest('form')!);

    expect(await screen.findByText(/informe uma data válida no formato dd\/mm\/aaaa/i)).toBeVisible();
    expect(onSalvar).not.toHaveBeenCalled();
  });
});
