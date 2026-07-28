import type { Demanda, DemandStatus } from '../types';
import { isClosed } from './workSemantics';

export type DeadlineKind = 'interno' | 'final';

export interface DeadlineCoverage {
  total: number;
  definido: number;
  naoInformado: number;
  naoSeAplica: number;
  percentualDefinido: number;
}

export interface DefinedFinalDeadlineSituation {
  totalDefinido: number;
  vencido: number;
  hoje: number;
  futuro: number;
  encerrado: number;
  inconsistente: number;
}

export type ResponsibleLinkState = 'oficial' | 'legado_pendente' | 'nao_atribuido';

export interface ResponsibleDistributionItem {
  key: string;
  nome: string;
  responsavelId: string | null;
  vinculo: ResponsibleLinkState;
  total: number;
  status: Record<DemandStatus, number>;
}

export const GOVERNANCE_STATUS_ORDER: DemandStatus[] = [
  'Aguardando Andamento',
  'Tramitado',
  'Para Assinatura',
  'Ajustar',
  'Sobrestado',
  'Encerrado',
];

function createEmptyStatusCount(): Record<DemandStatus, number> {
  return {
    'Aguardando Andamento': 0,
    Tramitado: 0,
    'Para Assinatura': 0,
    Ajustar: 0,
    Sobrestado: 0,
    Encerrado: 0,
  };
}

function parseDateOnly(value: string): number | null {
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(value)) return null;
  const [day, month, year] = value.split('/').map(Number);
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year
    || date.getMonth() !== month - 1
    || date.getDate() !== day
  ) return null;
  return date.getTime();
}

export function getDeadlineCoverage(
  demandas: Demanda[],
  kind: DeadlineKind,
): DeadlineCoverage {
  const situations = demandas.map((demanda) => (
    kind === 'interno' ? demanda.limite1Situacao : demanda.limite2Situacao
  ));
  const definido = situations.filter((state) => state === 'definido').length;
  const naoInformado = situations.filter((state) => state === 'nao_informado').length;
  const naoSeAplica = situations.filter((state) => state === 'nao_se_aplica').length;

  return {
    total: demandas.length,
    definido,
    naoInformado,
    naoSeAplica,
    percentualDefinido: demandas.length > 0
      ? Math.round((definido / demandas.length) * 100)
      : 0,
  };
}

export function getDefinedFinalDeadlineSituation(
  demandas: Demanda[],
  today: string,
): DefinedFinalDeadlineSituation {
  const todayTime = parseDateOnly(today);
  const result: DefinedFinalDeadlineSituation = {
    totalDefinido: 0,
    vencido: 0,
    hoje: 0,
    futuro: 0,
    encerrado: 0,
    inconsistente: 0,
  };

  demandas.forEach((demanda) => {
    if (demanda.limite2Situacao !== 'definido') return;
    result.totalDefinido += 1;

    if (isClosed(demanda)) {
      result.encerrado += 1;
      return;
    }

    const deadlineTime = parseDateOnly(demanda.limite2);
    if (deadlineTime === null || todayTime === null) {
      result.inconsistente += 1;
      return;
    }

    if (deadlineTime < todayTime) result.vencido += 1;
    else if (deadlineTime === todayTime) result.hoje += 1;
    else result.futuro += 1;
  });

  return result;
}

export function getResponsibleDistribution(
  demandas: Demanda[],
): ResponsibleDistributionItem[] {
  const groups = new Map<string, ResponsibleDistributionItem>();

  demandas.forEach((demanda) => {
    const nomeOriginal = demanda.responsavel.trim();
    const vinculo: ResponsibleLinkState = demanda.responsavelId
      ? 'oficial'
      : nomeOriginal
        ? 'legado_pendente'
        : 'nao_atribuido';
    const nome = nomeOriginal || 'Sem responsável';
    const key = demanda.responsavelId
      ? `uuid:${demanda.responsavelId}`
      : vinculo === 'legado_pendente'
        ? `legado:${nome.toLocaleLowerCase('pt-BR')}`
        : 'nao-atribuido';

    const current = groups.get(key) ?? {
      key,
      nome,
      responsavelId: demanda.responsavelId,
      vinculo,
      total: 0,
      status: createEmptyStatusCount(),
    };

    current.total += 1;
    current.status[demanda.status] += 1;
    groups.set(key, current);
  });

  return Array.from(groups.values()).sort((a, b) => (
    b.total - a.total || a.nome.localeCompare(b.nome, 'pt-BR')
  ));
}
