import { describe, expect, it } from 'vitest';
import type { Demanda, DemandStatus } from '../types';
import {
  getWorkBucket,
  isClosed,
  isInFollowUp,
  needsCtrhAction,
  type WorkBucket,
} from './workSemantics';

const expectedBuckets: Array<[DemandStatus, WorkBucket]> = [
  ['Aguardando Andamento', 'providencia_ctrh'],
  ['Ajustar', 'providencia_ctrh'],
  ['Para Assinatura', 'providencia_ctrh'],
  ['Tramitado', 'aguardando_retorno'],
  ['Sobrestado', 'monitoramento'],
  ['Encerrado', 'encerrada'],
];

function withStatus(status: DemandStatus): Pick<Demanda, 'status'> {
  return { status };
}

describe('semântica operacional das demandas', () => {
  it.each(expectedBuckets)('classifica %s como %s', (status, bucket) => {
    expect(getWorkBucket(status)).toBe(bucket);
  });

  it('mantém Tramitado e Sobrestado em acompanhamento e exclui somente Encerrado', () => {
    const followed = expectedBuckets
      .filter(([status]) => isInFollowUp(withStatus(status)))
      .map(([status]) => status);

    expect(followed).toEqual([
      'Aguardando Andamento',
      'Ajustar',
      'Para Assinatura',
      'Tramitado',
      'Sobrestado',
    ]);
  });

  it('considera providência CTRH apenas os três status acionáveis', () => {
    const actionable = expectedBuckets
      .filter(([status]) => needsCtrhAction(withStatus(status)))
      .map(([status]) => status);

    expect(actionable).toEqual([
      'Aguardando Andamento',
      'Ajustar',
      'Para Assinatura',
    ]);
  });

  it('identifica encerramento sem reinterpretar outros status', () => {
    expect(isClosed(withStatus('Encerrado'))).toBe(true);
    expect(isClosed(withStatus('Tramitado'))).toBe(false);
  });
});
