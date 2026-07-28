import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { AdminSkeleton, AuthSkeleton, DashboardSkeleton, TableSkeleton } from './LoadingSkeletons';

afterEach(() => cleanup());

describe('LoadingSkeletons', () => {
  it.each([
    ['Radar de Governança', DashboardSkeleton],
    ['tabela de demandas', TableSkeleton],
    ['administração', AdminSkeleton],
    ['acesso', AuthSkeleton],
  ])('expõe o carregamento de %s como status acessível', (label, Skeleton) => {
    render(<Skeleton />);

    expect(screen.getByRole('status', { name: `Carregando ${label}` })).toHaveAttribute('aria-busy', 'true');
  });
});
