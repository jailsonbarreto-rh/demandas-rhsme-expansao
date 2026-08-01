import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createDemandFixture } from '../test/expandedFixtures';
import { ModalNovo } from './ModalNovo';
import { DemandasTable } from './DemandasTable';

const base = createDemandFixture({
  id: 1,
  numero: 'SME-002',
  tipo: 'Processo',
  assunto: 'Segundo assunto',
  responsavel: 'Zilda',
  limite1: '',
  limite2: '20/07/2026',
  status: 'Tramitado',
  setor: 'CTRH',
  classificacao: 'Outros',
  proximaAcao: 'Verificar retorno da unidade',
  proximaAcaoEm: '25/07/2026',
});

describe('experiência profissional de formulários e tabela', () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('apresenta validação contextual sem usar alertas nativos', async () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => undefined);
    render(<ModalNovo responsaveis={[]} onClose={vi.fn()} onSalvar={vi.fn()} />);

    fireEvent.submit(screen.getByRole('button', { name: /^salvar$/i }).closest('form')!);

    expect(await screen.findByText(/informe o tipo da demanda/i)).toBeVisible();
    expect(screen.getByText(/informe o número do processo ou documento/i)).toBeVisible();
    expect(alertSpy).not.toHaveBeenCalled();
  });

  it('oferece as classificações legadas válidas no cadastro', () => {
    render(<ModalNovo responsaveis={[]} onClose={vi.fn()} onSalvar={vi.fn()} />);

    const classificacao = screen.getByLabelText('Selecione a classificação');
    expect(within(classificacao).getByRole('option', { name: 'Permuta' })).toBeInTheDocument();
    expect(within(classificacao).getByRole('option', { name: 'Diversos' })).toBeInTheDocument();
  });

  it('ordena por processo e inicia a paginação em 50 resultados, com opção de 100', async () => {
    const demandas = Array.from({ length: 62 }, (_, index) => ({
      ...base,
      id: index + 1,
      numero: `SME-${String(62 - index).padStart(3, '0')}`,
      assunto: `Assunto ${index + 1}`,
    }));

    render(
      <DemandasTable
        demandas={demandas}
        onOpenEditar={vi.fn()}
        onOpenProgress={vi.fn()}
        onOpenStatus={vi.fn()}
        onOpenHistorico={vi.fn()}
        onExcluir={vi.fn()}
      />,
    );

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /ordenar por processo/i }));
    const firstRow = screen.getAllByRole('row')[1];
    expect(within(firstRow).getByText('SME-001')).toBeVisible();

    const pageSize = screen.getByRole('combobox', { name: 'Resultados por página' });
    expect(pageSize).toHaveValue('50');
    expect(within(pageSize).getByRole('option', { name: '10' })).toBeInTheDocument();
    expect(within(pageSize).getByRole('option', { name: '25' })).toBeInTheDocument();
    expect(within(pageSize).getByRole('option', { name: '50' })).toBeInTheDocument();
    expect(within(pageSize).getByRole('option', { name: '100' })).toBeInTheDocument();

    expect(screen.getByText(/1–50 de 62 resultados/i)).toBeVisible();
    await user.click(screen.getByRole('button', { name: /próxima página/i }));
    expect(screen.getByText(/51–62 de 62 resultados/i)).toBeVisible();
  });

  it('solicita motivo e preservação institucional antes da exclusão lógica', async () => {
    const onExcluir = vi.fn().mockResolvedValue(undefined);
    render(
      <DemandasTable
        demandas={[base]}
        onOpenEditar={vi.fn()}
        onOpenProgress={vi.fn()}
        onOpenStatus={vi.fn()}
        onOpenHistorico={vi.fn()}
        onExcluir={onExcluir}
      />,
    );

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /mais ações da demanda sme-002/i }));
    await user.click(screen.getByRole('menuitem', { name: /excluir/i }));

    expect(screen.getByRole('alertdialog')).toBeVisible();
    expect(screen.getByText(/continuará preservada na lixeira e no histórico/i)).toBeVisible();
    await user.type(screen.getByLabelText('Motivo da exclusão'), 'Registro duplicado confirmado na conferência');
    await user.click(screen.getByRole('button', { name: /excluir da carteira/i }));

    await waitFor(() => expect(onExcluir).toHaveBeenCalledWith(base.id, {
      motivo: 'Registro duplicado confirmado na conferência',
    }));
  });
});
