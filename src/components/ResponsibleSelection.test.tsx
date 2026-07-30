import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createDemandFixture } from '../test/expandedFixtures';
import type { PerfilMinimo } from '../types';
import { ModalEditar } from './ModalEditar';
import { ModalNovo } from './ModalNovo';

const responsaveis: PerfilMinimo[] = [
  {
    id: '11111111-1111-4111-8111-111111111111',
    nome: 'ERICA VALIM DE ALMEIDA HOLANDA',
    setor: '',
  },
  {
    id: '22222222-2222-4222-8222-222222222222',
    nome: 'Wilson Peixoto',
    setor: 'SME',
  },
];

function demandWith(responsavel: string, responsavelId: string | null) {
  return createDemandFixture({
    id: 1,
    numero: 'SME-PRO-2026/00001',
    tipo: 'Processo',
    assunto: 'Assunto em análise',
    responsavel,
    responsavelId,
    limite1: '',
    limite2: '',
    status: 'Aguardando Andamento',
    setor: 'E/CTRH',
    classificacao: 'Outros',
    proximaAcao: 'Conferir documentação recebida',
    proximaAcaoEm: '20/08/2026',
  });
}

describe('seleção oficial de responsável', () => {
  afterEach(cleanup);

  it('oferece somente perfis cadastrados na nova demanda', () => {
    render(
      <ModalNovo
        responsaveis={responsaveis}
        onClose={vi.fn()}
        onSalvar={vi.fn()}
      />,
    );

    expect(screen.queryByRole('textbox', { name: 'Responsável' })).not.toBeInTheDocument();
    const select = screen.getByRole('combobox', { name: 'Responsável' });
    expect(select).toHaveTextContent('ERICA VALIM DE ALMEIDA HOLANDA');
    expect(select).toHaveTextContent('Wilson Peixoto — SME');
  });

  it('mantém o responsável atual como informação e não como opção livre', () => {
    const imported = demandWith('Vanessa Migrado', null);

    render(
      <ModalEditar
        demanda={imported}
        responsaveis={responsaveis}
        onClose={vi.fn()}
        onSalvar={vi.fn()}
      />,
    );

    expect(screen.getByDisplayValue('Responsável atual: Vanessa Migrado')).toBeVisible();
    expect(screen.getByRole('combobox', { name: 'Responsável' })).toHaveValue('');
    expect(screen.queryByRole('textbox', { name: 'Responsável' })).not.toBeInTheDocument();
    expect(screen.queryByDisplayValue(/responsável legado/i)).not.toBeInTheDocument();
  });

  it('pré-seleciona o UUID oficial na edição de demanda vinculada', () => {
    const linked = demandWith(responsaveis[0].nome, responsaveis[0].id);

    render(
      <ModalEditar
        demanda={linked}
        responsaveis={responsaveis}
        onClose={vi.fn()}
        onSalvar={vi.fn()}
      />,
    );

    expect(screen.getByRole('combobox', { name: 'Responsável' })).toHaveValue(responsaveis[0].id);
    expect(screen.queryByDisplayValue(/responsável legado/i)).not.toBeInTheDocument();
  });
});
