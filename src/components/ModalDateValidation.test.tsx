import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Demanda } from '../types';
import { ModalEditar } from './ModalEditar';
import { ModalNovo } from './ModalNovo';

const demanda: Demanda = {
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
};

function fillRequiredNewDemandFields() {
  fireEvent.change(screen.getByLabelText('Tipo'), { target: { value: 'Processo' } });
  fireEvent.change(screen.getByLabelText('Número'), { target: { value: 'SME-PRO-2026/99999' } });
  fireEvent.change(screen.getByLabelText('Assunto'), { target: { value: 'Nova demanda' } });
  fireEvent.change(screen.getByLabelText('Status'), { target: { value: 'Aguardando Andamento' } });
  fireEvent.change(screen.getByLabelText('Selecione a classificação'), { target: { value: 'Outros' } });
}

describe('validação de datas nos modais', () => {
  beforeEach(() => {
    vi.spyOn(window, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('impede criar demanda com data parcial', () => {
    const onSalvar = vi.fn();
    render(<ModalNovo onClose={vi.fn()} onSalvar={onSalvar} />);
    fillRequiredNewDemandFields();
    fireEvent.change(screen.getByLabelText('Limite 1'), { target: { value: '12/07' } });

    fireEvent.submit(screen.getByRole('button', { name: /^salvar$/i }).closest('form')!);

    expect(onSalvar).not.toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalledWith(expect.stringMatching(/prazo de análise interna.*inválido/i));
  });

  it('impede criar demanda com data inexistente', () => {
    const onSalvar = vi.fn();
    render(<ModalNovo onClose={vi.fn()} onSalvar={onSalvar} />);
    fillRequiredNewDemandFields();
    fireEvent.change(screen.getByLabelText('Limite 2'), { target: { value: '31/02/2026' } });

    fireEvent.submit(screen.getByRole('button', { name: /^salvar$/i }).closest('form')!);

    expect(onSalvar).not.toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalledWith(expect.stringMatching(/prazo final.*inválido/i));
  });

  it('permite criar demanda com datas válidas', () => {
    const onSalvar = vi.fn();
    render(<ModalNovo onClose={vi.fn()} onSalvar={onSalvar} />);
    fillRequiredNewDemandFields();
    fireEvent.change(screen.getByLabelText('Limite 1'), { target: { value: '12/07/2026' } });
    fireEvent.change(screen.getByLabelText('Limite 2'), { target: { value: '30/07/2026' } });

    fireEvent.submit(screen.getByRole('button', { name: /^salvar$/i }).closest('form')!);

    expect(onSalvar).toHaveBeenCalledWith(expect.objectContaining({
      limite1: '12/07/2026',
      limite2: '30/07/2026',
    }));
  });

  it('valida datas também na edição', () => {
    const onSalvar = vi.fn();
    render(<ModalEditar demanda={demanda} onClose={vi.fn()} onSalvar={onSalvar} />);
    fireEvent.change(screen.getByLabelText('Limite 2'), { target: { value: '31/04/2026' } });

    fireEvent.submit(screen.getByRole('button', { name: /salvar alterações/i }).closest('form')!);

    expect(onSalvar).not.toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalledWith(expect.stringMatching(/prazo final.*inválido/i));
  });
});
