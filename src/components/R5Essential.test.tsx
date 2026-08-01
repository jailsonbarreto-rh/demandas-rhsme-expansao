import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createDemandFixture } from '../test/expandedFixtures';
import { DemandasTable } from './DemandasTable';
import { DemandDetailDrawer } from './DemandDetailDrawer';
import { ModalAndamento } from './ModalAndamento';
import { ModalStatus } from './ModalStatus';

const active = createDemandFixture({
  id: 51,
  numero: 'R5-E-051',
  tipo: 'Processo',
  assunto: 'Demanda ativa',
  responsavel: 'Analista CTRH',
  limite1: '',
  limite2: '',
  status: 'Aguardando Andamento',
  setor: 'CTRH',
  classificacao: 'Diversos',
  proximaAcao: 'Aguardar retorno da unidade',
  proximaAcaoEm: '20/08/2099',
});

const closed = createDemandFixture({
  ...active,
  id: 52,
  numero: 'R5-E-052',
  assunto: 'Demanda encerrada',
  status: 'Encerrado',
  proximaAcao: '',
  proximaAcaoEm: '',
});

describe('R5 Essencial', () => {
  afterEach(cleanup);

  it('registra andamento mantendo o status atual', async () => {
    const onRegistrar = vi.fn().mockResolvedValue(true);
    const user = userEvent.setup();
    render(<ModalAndamento demanda={active} onClose={vi.fn()} onRegistrar={onRegistrar} />);

    expect(screen.getByText(/o status permanece/i)).toHaveTextContent(/o status permanece aguardando andamento/i);
    await user.type(screen.getByLabelText(/o que foi realizado/i), 'Cobrança encaminhada à unidade responsável.');
    await user.clear(screen.getByLabelText(/^próxima providência$/i));
    await user.type(screen.getByLabelText(/^próxima providência$/i), 'Verificar o retorno encaminhado');
    await user.clear(screen.getByLabelText(/data da próxima providência/i));
    await user.type(screen.getByLabelText(/data da próxima providência/i), '25082099');
    await user.click(screen.getByRole('button', { name: /^registrar andamento$/i }));

    expect(onRegistrar).toHaveBeenCalledWith(active.id, {
      comentario: 'Cobrança encaminhada à unidade responsável.',
      proximaAcao: 'Verificar o retorno encaminhado',
      proximaAcaoEm: '25/08/2099',
      proximaAcaoJustificativa: '',
    });
  });

  it('reabre demanda encerrada pela transição existente e não oferece o status atual', async () => {
    const onAtualizar = vi.fn().mockResolvedValue(true);
    const user = userEvent.setup();
    render(<ModalStatus demanda={closed} onClose={vi.fn()} onAtualizar={onAtualizar} />);

    expect(screen.getByRole('heading', { name: /reabrir demanda/i })).toBeVisible();
    const status = screen.getByLabelText(/novo status da demanda/i);
    expect(within(status).queryByRole('option', { name: 'Encerrado' })).not.toBeInTheDocument();
    await user.selectOptions(status, 'Tramitado');
    await user.type(screen.getByLabelText(/motivo da reabertura/i), 'Retorno recebido e tratamento retomado.');
    await user.type(screen.getByLabelText(/^próxima providência$/i), 'Analisar os documentos recebidos');
    await user.type(screen.getByLabelText(/data da próxima providência/i), '25082099');
    await user.click(screen.getByRole('button', { name: /^reabrir demanda$/i }));

    expect(onAtualizar).toHaveBeenCalledWith(closed.id, expect.objectContaining({
      status: 'Tramitado',
      comentario: 'Retorno recebido e tratamento retomado.',
      proximaAcao: 'Analisar os documentos recebidos',
      proximaAcaoEm: '25/08/2099',
    }));
  });

  it('não permite selecionar o status atual em uma alteração comum', () => {
    render(<ModalStatus demanda={active} onClose={vi.fn()} onAtualizar={vi.fn()} />);

    const status = screen.getByLabelText(/novo status da demanda/i);
    expect(status).toHaveValue('');
    expect(within(status).getByRole('option', { name: /selecione o novo status/i })).toBeDisabled();
    expect(within(status).queryByRole('option', { name: active.status })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /alterar status/i })).toBeVisible();
  });

  it('exige que o usuário escolha explicitamente o novo status', async () => {
    const onAtualizar = vi.fn();
    const user = userEvent.setup();
    render(<ModalStatus demanda={closed} onClose={vi.fn()} onAtualizar={onAtualizar} />);

    await user.type(screen.getByLabelText(/motivo da reabertura/i), 'Retorno recebido e tratamento retomado.');
    await user.type(screen.getByLabelText(/^próxima providência$/i), 'Analisar os documentos recebidos');
    await user.type(screen.getByLabelText(/data da próxima providência/i), '25082099');
    await user.click(screen.getByRole('button', { name: /^reabrir demanda$/i }));

    expect(await screen.findByText('Selecione o novo status da demanda.')).toBeVisible();
    expect(onAtualizar).not.toHaveBeenCalled();
  });

  it('oferece andamento no prontuário apenas para demanda editável e não encerrada', () => {
    const { rerender } = render(
      <DemandDetailDrawer
        demanda={active}
        historico={[]}
        open
        canEdit
        onClose={vi.fn()}
        onEdit={vi.fn()}
        onProgress={vi.fn()}
        onStatus={vi.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: /registrar andamento/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /alterar status/i })).toBeInTheDocument();

    rerender(
      <DemandDetailDrawer
        demanda={closed}
        historico={[]}
        open
        canEdit
        onClose={vi.fn()}
        onEdit={vi.fn()}
        onProgress={vi.fn()}
        onStatus={vi.fn()}
      />,
    );

    expect(screen.queryByRole('button', { name: /registrar andamento/i })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reabrir demanda/i })).toBeInTheDocument();
  });

  it('apresenta ações contextuais também na tabela', async () => {
    const user = userEvent.setup();
    render(
      <DemandasTable
        demandas={[active, closed]}
        canEdit
        onOpenEditar={vi.fn()}
        onOpenProgress={vi.fn()}
        onOpenStatus={vi.fn()}
        onOpenHistorico={vi.fn()}
        onExcluir={vi.fn()}
      />,
    );

    await user.click(screen.getByRole('button', { name: /mais ações da demanda r5-e-051/i }));
    expect(screen.getByRole('menuitem', { name: /registrar andamento/i })).toBeVisible();
    expect(screen.getByRole('menuitem', { name: /alterar status/i })).toBeVisible();
    await user.keyboard('{Escape}');

    await user.click(screen.getByRole('button', { name: /mais ações da demanda r5-e-052/i }));
    expect(screen.queryByRole('menuitem', { name: /registrar andamento/i })).not.toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /reabrir demanda/i })).toBeVisible();
  });
});
