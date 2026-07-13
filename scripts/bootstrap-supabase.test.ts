import { describe, expect, it, vi } from 'vitest';
import { resolve } from 'node:path';
import {
  getBootstrapUsers,
  importDemandas,
  loadInitialDemandas,
  readBootstrapEnv,
} from './bootstrap-supabase.mjs';

const validEnv = {
  SUPABASE_URL: 'https://example.supabase.co',
  SUPABASE_SECRET_KEY: 'secret-value',
  BOOTSTRAP_WILSON_PASSWORD: 'SenhaWilson123',
  BOOTSTRAP_JAILSON_PASSWORD: 'SenhaJailson456',
  BOOTSTRAP_TESTE_PASSWORD: 'SenhaTeste789',
};

describe('bootstrap Supabase', () => {
  it('define os dois administradores e o perfil de teste editor', () => {
    expect(getBootstrapUsers()).toEqual([
      expect.objectContaining({
        email: 'wilson.peixoto@rioeduca.net',
        nivel: 'administrador',
        passwordEnv: 'BOOTSTRAP_WILSON_PASSWORD',
      }),
      expect.objectContaining({
        email: 'jailsonbsilva@rioeduca.net',
        nivel: 'administrador',
        passwordEnv: 'BOOTSTRAP_JAILSON_PASSWORD',
      }),
      expect.objectContaining({
        email: 'teste@rioeduca.net',
        nivel: 'editor',
        passwordEnv: 'BOOTSTRAP_TESTE_PASSWORD',
      }),
    ]);
  });

  it('exige todas as variáveis privadas do processo', () => {
    expect(() => readBootstrapEnv({})).toThrow('SUPABASE_URL');
    expect(() => readBootstrapEnv({ SUPABASE_URL: 'url' })).toThrow('SUPABASE_SECRET_KEY');
    expect(() => readBootstrapEnv({
      SUPABASE_URL: 'url',
      SUPABASE_SECRET_KEY: 'secret',
    })).toThrow('BOOTSTRAP_WILSON_PASSWORD');
  });

  it('não modifica nem expõe os valores recebidos', () => {
    expect(readBootstrapEnv(validEnv)).toEqual(validEnv);
  });

  it('exige senhas iniciais distintas para os três usuários', () => {
    expect(() => readBootstrapEnv({
      ...validEnv,
      BOOTSTRAP_JAILSON_PASSWORD: validEnv.BOOTSTRAP_WILSON_PASSWORD,
    })).toThrow('devem ser distintas');
  });

  it('carrega as 50 demandas iniciais usadas pelo modo local', () => {
    const demandas = loadInitialDemandas(resolve(process.cwd(), 'src/data/initialDemandas.ts'));
    expect(demandas).toHaveLength(50);
    expect(demandas[0]).toEqual(expect.objectContaining({ numero: expect.any(String) }));
  });

  it('chama a RPC para todas as demandas e conta apenas as efetivamente criadas', async () => {
    const rpc = vi.fn()
      .mockResolvedValueOnce({ data: true, error: null })
      .mockResolvedValueOnce({ data: false, error: null });
    const demandas = [
      {
        numero: 'SME-001',
        tipo: 'Processo',
        assunto: 'Primeira',
        responsavel: '',
        limite1: '',
        limite2: '',
        status: 'Aguardando Andamento',
        setor: 'E/CTRH',
        classificacao: 'Outros',
      },
      {
        numero: 'SME-002',
        tipo: 'Processo',
        assunto: 'Segunda',
        responsavel: '',
        limite1: '',
        limite2: '',
        status: 'Tramitado',
        setor: 'E/CTRH',
        classificacao: 'Outros',
      },
    ];

    const created = await importDemandas({ rpc } as never, demandas, 'actor-id');

    expect(created).toBe(1);
    expect(rpc).toHaveBeenCalledTimes(2);
    expect(rpc).toHaveBeenNthCalledWith(1, 'bootstrap_importar_demanda', expect.objectContaining({
      p_numero: 'SME-001',
      p_actor_id: 'actor-id',
    }));
  });
});
