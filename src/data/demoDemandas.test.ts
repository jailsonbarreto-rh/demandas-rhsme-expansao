import { describe, expect, it } from 'vitest';
import { demoDemandas } from './demoDemandas';

describe('demoDemandas', () => {
  it('mantém um conjunto pequeno e inequivocamente sintético', () => {
    expect(demoDemandas.length).toBeGreaterThanOrEqual(6);
    expect(demoDemandas.length).toBeLessThanOrEqual(8);
    expect(demoDemandas.every((demanda) => demanda.numero.startsWith('DEMO-'))).toBe(true);
    expect(new Set(demoDemandas.map((demanda) => demanda.responsavel))).toEqual(new Set([
      'Usuário Demonstração A',
      'Usuário Demonstração B',
    ]));
  });

  it('cobre todos os estados disponíveis para os testes locais', () => {
    expect(new Set(demoDemandas.map((demanda) => demanda.status))).toEqual(new Set([
      'Aguardando Andamento',
      'Tramitado',
      'Para Assinatura',
      'Encerrado',
      'Sobrestado',
      'Ajustar',
    ]));
  });
});
