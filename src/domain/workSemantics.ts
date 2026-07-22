import type { Demanda, DemandStatus, WorkBucket } from '../types';

const WORK_BUCKET_BY_STATUS: Record<DemandStatus, WorkBucket> = {
  'Aguardando Andamento': 'providencia_ctrh',
  Ajustar: 'providencia_ctrh',
  'Para Assinatura': 'providencia_ctrh',
  Tramitado: 'aguardando_retorno',
  Sobrestado: 'monitoramento',
  Encerrado: 'encerrada',
};

export function getWorkBucket(status: DemandStatus): WorkBucket {
  return WORK_BUCKET_BY_STATUS[status];
}

export function isInFollowUp(demanda: Pick<Demanda, 'status'>): boolean {
  return getWorkBucket(demanda.status) !== 'encerrada';
}

export function needsCtrhAction(demanda: Pick<Demanda, 'status'>): boolean {
  return getWorkBucket(demanda.status) === 'providencia_ctrh';
}

export function isClosed(demanda: Pick<Demanda, 'status'>): boolean {
  return getWorkBucket(demanda.status) === 'encerrada';
}
