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
  limite1Situacao: 'nao_informado',
  limite2: '',
  limite2Situacao: 'nao_informado',
  status: 'Aguardando Andamento',
  setor: 'E/CTRH',
  classificacao: 'Outros',
  proximaAcao: 'Conferir documentação recebida',
  proximaAcaoEm: '20/08/2099',
});

function fillRequiredNewDemandFields() {
  fireEvent.change(screen.getByLabelText('Tipo'), { target: { value: 'Processo' } });
  fireEvent.change(screen.getByLabelText('Número'), { target: { value: 'SME-PRO-2099/99999' } });
  fireEvent.change(screen.getByLabelText('Assunto'), { target: { value: 'Nova demanda' } });
  fireEvent.change(screen.getByLabelText('Status'), { target: { value: 'Aguardando Andamento' } });
  fireEvent.change(screen.getByLabelText('Selecione a classificação'), { target: { value: 'Outros' } });
  fireEvent.change(screen.getByLabelText('Próxima providência'), { target: { value: 'Conferir documentação recebida' } });
  fireEvent.change(screen.getByLabelText('Data da próxima providência'), { target: { value: '20/08/2099' } });
}

function chooseFinalDeadlineDate() {
  fireEvent.click(screen.getByLabelText('Data definida'));
}

describe('validação de datas nos modais R4', () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('impede criar demanda com prazo interno parcial e apresenta diálogo de obrigatoriedade', async () => {
    const onSalvar = vi.fn();
    render(<ModalNovo responsaveis={[]} onClose={vi.fn()} onSalvar={onSalvar} />);
    fillRequiredNewDemandFields();
    fireEvent.change(screen.getByLabelText('Data de prazo interno'), { target: { value: '12/07' } });
    chooseFinalDeadlineDate();
    fireEvent.change(screen.getByLabelText('Data de prazo final'), { target: { value: '30/07/2099' } });

    fireEvent.submit(screen.getByRole('button', { name: /^salvar$/i }).closest('form')!);

    expect(await screen.findByText(/informe uma data válida no formato dd\/mm\/aaaa/i)).toBeVisible();
    expect(await screen.findByRole('alertdialog', { name: /prazo interno obrigatório/i })).toBeVisible();
    expect(onSalvar).not.toHaveBeenCalled();
  });

  it('impede criar demanda com prazo final inexistente', async () => {
    const onSalvar = vi.fn();
    render(<ModalNovo responsaveis={[]} onClose={vi.fn()} onSalvar={onSalvar} />);
    fillRequiredNewDemandFields();
    fireEvent.change(screen.getByLabelText('Data de prazo interno'), { target: { value: '12/07/2099' } });
    chooseFinalDeadlineDate();
    fireEvent.change(screen.getByLabelText('Data de prazo final'), { target: { value: '31/02/2099' } });

    fireEvent.submit(screen.getByRole('button', { name: /^salvar$/i }).closest('form')!);

    expect(await screen.findByText(/informe uma data válida no formato dd\/mm\/aaaa/i)).toBeVisible();
    expect(onSalvar).not.toHaveBeenCalled();
  });

  it('permite criar demanda com datas válidas e próxima providência', async () => {
    const onSalvar = vi.fn();
    render(<ModalNovo responsaveis={[]} onClose={vi.fn()} onSalvar={onSalvar} />);
    fillRequiredNewDemandFields();
    fireEvent.change(screen.getByLabelText('Data de prazo interno'), { target: { value: '12/07/2099' } });
    chooseFinalDeadlineDate();
    fireEvent.change(screen.getByLabelText('Data de prazo final'), { target: { value: '30/07/2099' } });

    fireEvent.submit(screen.getByRole('button', { name: /^salvar$/i }).closest('form')!);

    await waitFor(() => expect(onSalvar).toHaveBeenCalledWith(expect.objectContaining({
      responsavelId: '',
      limite1: '12/07/2099',
      limite1Situacao: 'definido',
      limite2: '30/07/2099',
      limite2Situacao: 'definido',
      proximaAcao: 'Conferir documentação recebida',
      proximaAcaoEm: '20/08/2099',
    })));
  });

  it('permite prazo final Não se aplica sem justificativa inicial', async () => {
    const onSalvar = vi.fn();
    render(<ModalNovo responsaveis={[]} onClose={vi.fn()} onSalvar={onSalvar} />);
    fillRequiredNewDemandFields();
    fireEvent.change(screen.getByLabelText('Data de prazo interno'), { target: { value: '12/07/2099' } });
    fireEvent.click(screen.getByLabelText('Não se aplica'));

    fireEvent.submit(screen.getByRole('button', { name: /^salvar$/i }).closest('form')!);

    await waitFor(() => expect(onSalvar).toHaveBeenCalledWith(expect.objectContaining({
      limite2: '',
      limite2Situacao: 'nao_se_aplica',
    })));
  });

  it('valida datas também na primeira adequação da edição legada', async () => {
    const onSalvar = vi.fn();
    render(<ModalEditar demanda={demanda} responsaveis={[]} onClose={vi.fn()} onSalvar={onSalvar} />);
    fireEvent.click(screen.getAllByLabelText('Data definida')[1]);
    fireEvent.change(screen.getByLabelText('Data de prazo final'), { target: { value: '31/04/2099' } });

    fireEvent.submit(screen.getByRole('button', { name: /salvar alterações/i }).closest('form')!);

    expect(await screen.findByText(/informe uma data válida no formato dd\/mm\/aaaa/i)).toBeVisible();
    expect(onSalvar).not.toHaveBeenCalled();
  });
});
