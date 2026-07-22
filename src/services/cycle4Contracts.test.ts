import { describe, expect, it } from 'vitest';
import { LocalDemandasRepository } from './localDemandasRepository';
import { SupabaseDemandasRepository } from './supabaseDemandasRepository';

const storage = {
  getItem: () => null,
  setItem: () => undefined,
};

const requiredMethods = [
  'loadTrash',
  'edit',
  'registerProgress',
  'transitionStatus',
  'deleteLogically',
  'restore',
] as const;

describe('contratos de mutação do Ciclo 4', () => {
  it('expõe métodos nomeados no repositório Supabase', () => {
    const repository = new SupabaseDemandasRepository({} as never) as unknown as Record<string, unknown>;

    for (const method of requiredMethods) {
      expect(repository[method], `método ausente: ${method}`).toBeTypeOf('function');
    }
  });

  it('espelha os métodos nomeados no modo local sintético', () => {
    const repository = new LocalDemandasRepository(storage, []) as unknown as Record<string, unknown>;

    for (const method of requiredMethods) {
      expect(repository[method], `método ausente: ${method}`).toBeTypeOf('function');
    }
  });
});
