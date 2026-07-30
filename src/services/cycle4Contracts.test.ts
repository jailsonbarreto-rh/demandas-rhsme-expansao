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
] as const;

const forbiddenProductMethods = ['restore'] as const;

describe('contratos de mutação e auditoria', () => {
  it('expõe os métodos vigentes no repositório Supabase sem restauração de produto', () => {
    const repository = new SupabaseDemandasRepository({} as never) as unknown as Record<string, unknown>;

    for (const method of requiredMethods) {
      expect(repository[method], `método ausente: ${method}`).toBeTypeOf('function');
    }
    for (const method of forbiddenProductMethods) {
      expect(repository[method], `método proibido exposto: ${method}`).toBeUndefined();
    }
  });

  it('espelha o contrato no modo local sintético sem oferecer restauração', () => {
    const repository = new LocalDemandasRepository(storage, []) as unknown as Record<string, unknown>;

    for (const method of requiredMethods) {
      expect(repository[method], `método ausente: ${method}`).toBeTypeOf('function');
    }
    for (const method of forbiddenProductMethods) {
      expect(repository[method], `método proibido exposto: ${method}`).toBeUndefined();
    }
  });
});
