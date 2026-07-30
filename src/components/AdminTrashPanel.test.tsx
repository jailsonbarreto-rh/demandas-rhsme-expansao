import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ComentarioHistorico, Demanda, PerfilUsuario } from '../types';
import { AdminTrashPanel } from './AdminTrashPanel';

const deletedDemand: Demanda = {
  id: 42,
  numero: 'E/CTRH-PRO-2026/00042',
  tipo: 'Processo',
  assunto: 'Revisão de enquadramento funcional',
  responsavel: 'Analista Responsável',
  responsavelId: '22222222-2222-4222-8222-222222222222',
  limite1: '01/08/2026',
  limite1Situacao: 'definido',
  limite1Justificativa: '',
  limite2: '',
  limite2Situacao: 'nao_se_aplica',
  limite2Justificativa: '',
  proximaAcao: 'Conferir documentação recebida',
  proximaAcaoEm: '03/08/2026',
  linkOrigem: '',
  status: 'Aguardando Andamento',
  setor: 'CTRH',
  classificacao: 'Vida Funcional',
  origem: 'sistema',
  deletedAt: '2026-07-30T15:30:00.000Z',
  deletedBy: '11111111-1111-4111-8111-111111111111',
  deletionReason: 'Registro duplicado após conferência administrativa.',
  createdAt: '2026-07-25T12:00:00.000Z',
  updatedAt: '2026-07-30T15:30:00.000Z',
};

const admin: PerfilUsuario = {
  id: '11111111-1111-4111-8111-111111111111',
  nome: 'Administradora CTRH',
  email: 'admin@rioeduca.net',
  setor: 'CTRH',
  nivel: 'administrador',
  status: 'ativo',
};

const history: ComentarioHistorico[] = [
  {
    id: 2,
    demandaId: 42,
    data_hora: '30/07/2026, 12:30:00',
    tipoEvento: 'exclusao',
    status_anterior: 'Aguardando Andamento',
    status_novo: 'Aguardando Andamento',
    setor: 'CTRH',
    comentario: deletedDemand.deletionReason,
    autorId: admin.id,
    autorNome: '',
    alteracoes: [],
  },
  {
    id: 1,
    demandaId: 42,
    data_hora: '25/07/2026, 09:00:00',
    tipoEvento: 'criacao',
    status_anterior: '',
    status_novo: 'Aguardando Andamento',
    setor: 'CTRH',
    comentario: 'Demanda cadastrada no sistema.',
    autorId: admin.id,
    autorNome: '',
    alteracoes: [],
  },
];

describe('AdminTrashPanel', () => {
  afterEach(cleanup);

  it('apresenta estado vazio e não oferece restauração', () => {
    render(
      <AdminTrashPanel
        demandas={[]}
        historico={[]}
        perfis={[admin]}
        loading={false}
        error={null}
        onRetry={vi.fn()}
      />,
    );

    expect(screen.getByRole('heading', { name: /demandas excluídas/i })).toBeInTheDocument();
    expect(screen.getByText(/nenhuma demanda excluída/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /restaurar/i })).not.toBeInTheDocument();
  });

  it('pesquisa por número, assunto, responsável e motivo da exclusão', async () => {
    render(
      <AdminTrashPanel
        demandas={[deletedDemand]}
        historico={history}
        perfis={[admin]}
        loading={false}
        error={null}
        onRetry={vi.fn()}
      />,
    );
    const user = userEvent.setup();
    const search = screen.getByRole('searchbox', { name: /pesquisar demandas excluídas/i });

    expect(screen.getByText(deletedDemand.numero)).toBeInTheDocument();
    await user.type(search, 'duplicado');
    expect(screen.getByText(deletedDemand.numero)).toBeInTheDocument();
    await user.clear(search);
    await user.type(search, 'texto inexistente');
    expect(screen.getByText(/nenhum registro corresponde à pesquisa/i)).toBeInTheDocument();
  });

  it('abre auditoria somente leitura com motivo, autoria, data e histórico', async () => {
    render(
      <AdminTrashPanel
        demandas={[deletedDemand]}
        historico={history}
        perfis={[admin]}
        loading={false}
        error={null}
        onRetry={vi.fn()}
      />,
    );

    await userEvent.setup().click(screen.getByRole('button', { name: /consultar demanda excluída/i }));

    const dialog = screen.getByRole('dialog', { name: /demanda excluída/i });
    expect(dialog).toHaveTextContent(deletedDemand.numero);
    expect(dialog).toHaveTextContent(deletedDemand.deletionReason);
    expect(dialog).toHaveTextContent(admin.nome);
    expect(dialog).toHaveTextContent(/30\/07\/2026/);
    expect(dialog).toHaveTextContent(/demanda cadastrada no sistema/i);
    expect(screen.queryByRole('button', { name: /restaurar/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^editar$/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /status/i })).not.toBeInTheDocument();
  });

  it('mostra falha de carregamento e permite nova tentativa', async () => {
    const onRetry = vi.fn();
    render(
      <AdminTrashPanel
        demandas={[]}
        historico={[]}
        perfis={[admin]}
        loading={false}
        error="Acesso negado"
        onRetry={onRetry}
      />,
    );

    expect(screen.getByRole('alert')).toHaveTextContent(/acesso negado/i);
    await userEvent.setup().click(screen.getByRole('button', { name: /tentar novamente/i }));
    expect(onRetry).toHaveBeenCalledOnce();
  });
});
