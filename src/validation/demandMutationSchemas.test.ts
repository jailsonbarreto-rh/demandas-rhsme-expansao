import { describe, expect, it } from 'vitest';

describe('schemas de mutação do Ciclo 4', () => {
  it('disponibiliza os seis contratos de validação', async () => {
    const schemas = await import('./demandMutationSchemas').catch(() => null);

    expect(schemas).not.toBeNull();
    expect(schemas).toEqual(expect.objectContaining({
      createDemandaMutationSchema: expect.any(Object),
      editDemandaMutationSchema: expect.any(Object),
      progressMutationSchema: expect.any(Object),
      statusTransitionMutationSchema: expect.any(Object),
      deleteMutationSchema: expect.any(Object),
      restoreMutationSchema: expect.any(Object),
    }));
  });
});
