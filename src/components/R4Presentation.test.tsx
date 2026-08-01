import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createDemandFixture, createHistoryFixture } from '../test/expandedFixtures';
import { DemandasTable } from './DemandasTable';
import { DemandDetailDrawer } from './DemandDetailDrawer';

const active = createDemandFixture({
  id: 41,
  numero: 'R4-041',
  tipo: 'Processo',
  assunto: 'Demanda ativa com acompanhamento',
  responsavel: 'Pessoa Responsável',
  limite1: '01/01/2000',
  limite1Situacao: 'definido',
  limite2: '',
  limite2Situacao: 'nao_se_aplica',
  proximaAcao: 'Solicitar complementação documental à unidade responsável',
  proximaAcaoEm: '01/01/2000',
  status: 'Aguardando Andamento',
  setor: 'CTRH',
  classificacao: 'Diversos',
});

const legacy = createDemandFixture({
  id: 42,
  numero: 'R4-042',
  tipo: 'Expediente',
  assunto: 'Demanda legada sem dados temporais',
  responsavel: '',
  limite1: '',
  limite1Situacao: 'nao_informado',
  limite2: '',
  limite2Situacao: 'nao_informado',
  proximaAcao: '',
  proximaAcaoEm: '',
  status: 'Tramitado',
  setor: 'CTRH',
  classificacao: 'Diversos',
  origem: 'legado',
});

const closed = createDemandFixture({
  ...legacy,
  id: 43,
  numero: 'R4-043',
  assunto: 'Demanda encerrada',
  status: 'Encerrado',
});

describe('apresentação R4 na carteira e no detalhe', () => {
  afterEach(cleanup);

  it('mantém colunas atuais e acrescenta próxima providência com estados legíveis', () => {
    render(
      <DemandasTable
        demandas={[active, legacy, closed]}
        onOpenEditar={vi.fn()}
        onOpenProgress={vi.fn()}
        onOpenStatus={vi.fn()}
        onOpenHistorico={vi.fn()}
        onExcluir={vi.fn()}
      />,
    );

    expect(screen.getByRole('columnheader', { name: /prazo interno/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /prazo final/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /próxima providência/i })).toBeInTheDocument();
    expect(screen.getByText('Solicitar complementação documental à unidade responsável')).toBeInTheDocument();
    expect(screen.getAllByText(/vencida há/i).length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText('Não informada').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Não exigida').length).toBeGreaterThan(0);
    expect(screen.getByText('Não se aplica')).toBeInTheDocument();
  });

  it('destaca a próxima providência antes dos prazos e mostra antes/depois do histórico', () => {
    const history = [createHistoryFixture({
      id: 90,
      demandaId: active.id,
      data_hora: '29/07/2026, 15:30:00',
      tipoEvento: 'alteracao_prazo',
      status_anterior: active.status,
      status_novo: active.status,
      setor: 'CTRH',
      comentario: 'Reprogramação aprovada após nova análise',
      alteracoes: [{ field: 'limite1', before: '31/12/1999', after: '01/01/2000' }],
    })];

    render(
      <DemandDetailDrawer
        demanda={active}
        historico={history}
        open
        canEdit
        onClose={vi.fn()}
        onEdit={vi.fn()}
        onProgress={vi.fn()}
        onStatus={vi.fn()}
      />,
    );

    const headings = screen.getAllByRole('heading').map((heading) => heading.textContent);
    const drawer = within(screen.getByRole('dialog'));
    expect(headings.indexOf('Próxima providência')).toBeLessThan(headings.indexOf('Prazos'));
    expect(drawer.getByText(active.proximaAcao)).toBeInTheDocument();
    expect(drawer.getByText('31/12/1999')).toBeInTheDocument();
    expect(drawer.getAllByText('01/01/2000').length).toBeGreaterThanOrEqual(2);
    expect(drawer.getByText('Reprogramação aprovada após nova análise')).toBeInTheDocument();
  });
});
