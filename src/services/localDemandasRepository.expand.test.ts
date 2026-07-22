import { describe, expect, it } from 'vitest';
import { demoDemandas } from '../data/demoDemandas';
import { LocalDemandasRepository } from './localDemandasRepository';

class MemoryStorage {
  private readonly values = new Map<string, string>();

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }
}

describe('LocalDemandasRepository — contrato expandido', () => {
  it('mantém as fixtures sintéticas completas para o novo domínio', () => {
    for (const demanda of demoDemandas) {
      expect(demanda).toEqual(expect.objectContaining({
        responsavelId: expect.anything(),
        limite1Situacao: expect.stringMatching(/^(definido|nao_informado|nao_se_aplica)$/),
        limite1Justificativa: expect.any(String),
        limite2Situacao: expect.stringMatching(/^(definido|nao_informado|nao_se_aplica)$/),
        limite2Justificativa: expect.any(String),
        proximaAcao: expect.any(String),
        proximaAcaoEm: expect.any(String),
        linkOrigem: expect.any(String),
        origem: 'sistema',
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      }));
    }
  });

  it('normaliza registros locais legados sem descartar dados válidos', async () => {
    const storage = new MemoryStorage();
    storage.setItem('demandas_data', JSON.stringify([{
      id: 41,
      numero: 'DEMO-LEGADO-041',
      tipo: 'Processo',
      assunto: 'Registro sintético legado',
      responsavel: 'Usuário Demonstração A',
      limite1: '20/08/2026',
      limite2: '',
      status: 'Tramitado',
      setor: 'Setor Demonstração',
      classificacao: 'Diversos',
    }]));
    storage.setItem('demandas_history', JSON.stringify([{
      id: 51,
      demandaId: 41,
      data_hora: '20/07/2026, 10:00:00',
      status_novo: 'Tramitado',
      setor: 'Setor Demonstração',
      comentario: 'Histórico sintético legado',
    }]));

    const repository = new LocalDemandasRepository(storage as never, demoDemandas);
    const data = await repository.load();

    expect(data.demandas).toEqual([expect.objectContaining({
      id: 41,
      responsavelId: null,
      limite1Situacao: 'definido',
      limite2Situacao: 'nao_informado',
      limite1Justificativa: '',
      limite2Justificativa: '',
      proximaAcao: '',
      proximaAcaoEm: '',
      linkOrigem: '',
      origem: 'legado',
      createdAt: '',
      updatedAt: '',
    })]);
    expect(data.historico).toEqual([expect.objectContaining({
      id: 51,
      tipoEvento: 'mudanca_status',
      status_anterior: '',
      autorId: null,
      autorNome: '',
      alteracoes: [],
    })]);
  });

  it('cria histórico sintético de fallback no contrato expandido', async () => {
    const storage = new MemoryStorage();
    const repository = new LocalDemandasRepository(storage as never, demoDemandas.slice(0, 1));

    const data = await repository.load();

    expect(data.historico[0]).toEqual(expect.objectContaining({
      tipoEvento: 'criacao',
      status_anterior: '',
      autorId: null,
      autorNome: 'Usuário Demonstração',
      alteracoes: [],
    }));
  });
});
