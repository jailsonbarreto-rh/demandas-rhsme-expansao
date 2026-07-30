import type {
  ComentarioHistorico,
  CreateDemandaInput,
  DeadlineState,
  DeleteDemandaInput,
  Demanda,
  DemandOrigin,
  EditDemandaInput,
  FieldChange,
  HistoryEventType,
  ProgressInput,
  RestoreDemandaInput,
  StatusTransitionInput,
} from '../types';
import { requiresDeadlineChangeJustification } from '../domain/deadlineRules';
import {
  createDemandaMutationSchema,
  deleteMutationSchema,
  editDemandaMutationSchema,
  progressMutationSchema,
  restoreMutationSchema,
  statusTransitionMutationSchema,
} from '../validation/demandMutationSchemas';
import type { AppData, DemandasRepository } from './contracts';

const DEMANDAS_KEY = 'demandas_data';
const HISTORY_KEY = 'demandas_history';
const DEMO_AUTHOR = 'Usuário Demonstração';

export type StorageAdapter = Pick<Storage, 'getItem' | 'setItem'>;

function inferDeadlineState(value: unknown, state: unknown): DeadlineState {
  if (state === 'definido' || state === 'nao_informado' || state === 'nao_se_aplica') return state;
  return typeof value === 'string' && value.trim() ? 'definido' : 'nao_informado';
}

function normalizeDemanda(value: any, fallbackOrigin: DemandOrigin): Demanda {
  return {
    id: value.id,
    numero: value.numero,
    tipo: value.tipo,
    assunto: value.assunto,
    responsavel: typeof value.responsavel === 'string' ? value.responsavel : '',
    responsavelId: typeof value.responsavelId === 'string' ? value.responsavelId : null,
    limite1: typeof value.limite1 === 'string' ? value.limite1 : '',
    limite1Situacao: inferDeadlineState(value.limite1, value.limite1Situacao),
    limite1Justificativa: typeof value.limite1Justificativa === 'string' ? value.limite1Justificativa : '',
    limite2: typeof value.limite2 === 'string' ? value.limite2 : '',
    limite2Situacao: inferDeadlineState(value.limite2, value.limite2Situacao),
    limite2Justificativa: typeof value.limite2Justificativa === 'string' ? value.limite2Justificativa : '',
    proximaAcao: typeof value.proximaAcao === 'string' ? value.proximaAcao : '',
    proximaAcaoEm: typeof value.proximaAcaoEm === 'string' ? value.proximaAcaoEm : '',
    linkOrigem: typeof value.linkOrigem === 'string' ? value.linkOrigem : '',
    status: value.status,
    setor: typeof value.setor === 'string' ? value.setor : '',
    classificacao: typeof value.classificacao === 'string' ? value.classificacao : '',
    origem: value.origem === 'legado' || value.origem === 'sistema' ? value.origem : fallbackOrigin,
    deletedAt: typeof value.deletedAt === 'string' ? value.deletedAt : '',
    deletedBy: typeof value.deletedBy === 'string' ? value.deletedBy : null,
    deletionReason: typeof value.deletionReason === 'string' ? value.deletionReason : '',
    createdAt: typeof value.createdAt === 'string' ? value.createdAt : '',
    updatedAt: typeof value.updatedAt === 'string' ? value.updatedAt : '',
  };
}

function normalizeHistorico(value: any): ComentarioHistorico {
  return {
    id: value.id,
    demandaId: value.demandaId,
    data_hora: value.data_hora,
    tipoEvento: value.tipoEvento ?? 'mudanca_status',
    status_anterior: value.status_anterior ?? '',
    status_novo: value.status_novo,
    setor: typeof value.setor === 'string' ? value.setor : '',
    comentario: value.comentario,
    autorId: typeof value.autorId === 'string' ? value.autorId : null,
    autorNome: typeof value.autorNome === 'string' ? value.autorNome : '',
    alteracoes: Array.isArray(value.alteracoes) ? value.alteracoes : [],
  };
}

function fieldChange(field: string, before: unknown, after: unknown): FieldChange {
  const normalize = (value: unknown) => value === null || value === undefined ? null : String(value);
  return { field, before: normalize(before), after: normalize(after) };
}

function usefulLength(value: string): number {
  return value.replace(/\s+/g, ' ').trim().length;
}

function appendPastJustification(comment: string, justification: string): string {
  const clean = justification.trim();
  return clean ? `${comment.trim()}\nJustificativa da data vencida: ${clean}` : comment.trim();
}

export class LocalDemandasRepository implements DemandasRepository {
  private demandas: Demanda[] = [];
  private historico: ComentarioHistorico[] = [];

  constructor(
    private readonly storage: StorageAdapter,
    private readonly initialDemandas: Demanda[],
  ) {}

  private isValidDemandaArray(arr: any): arr is any[] {
    return Array.isArray(arr) && arr.every((d) => d
      && typeof d.id === 'number'
      && typeof d.numero === 'string' && d.numero.trim() !== ''
      && typeof d.tipo === 'string'
      && typeof d.assunto === 'string'
      && typeof d.status === 'string');
  }

  private isValidHistoryArray(arr: any): arr is any[] {
    return Array.isArray(arr) && arr.every((h) => h
      && typeof h.id === 'number'
      && typeof h.demandaId === 'number'
      && typeof h.status_novo === 'string'
      && typeof h.comentario === 'string');
  }

  async load(): Promise<AppData> {
    const rawDemandas = this.storage.getItem(DEMANDAS_KEY);
    const rawHistorico = this.storage.getItem(HISTORY_KEY);
    let parsedDemandas: Demanda[] | null = null;
    let parsedHistorico: ComentarioHistorico[] | null = null;
    let houveErroParse = false;

    if (rawDemandas !== null && rawHistorico !== null) {
      const storedDemandas = this.read<any[]>(DEMANDAS_KEY);
      const storedHistorico = this.read<any[]>(HISTORY_KEY);
      if (storedDemandas === null || storedHistorico === null) houveErroParse = true;
      if (this.isValidDemandaArray(storedDemandas) && this.isValidHistoryArray(storedHistorico)) {
        const demandaIds = new Set(storedDemandas.map((d) => d.id));
        parsedDemandas = storedDemandas.map((demanda) => normalizeDemanda(demanda, 'legado'));
        parsedHistorico = storedHistorico.filter((h) => demandaIds.has(h.demandaId)).map(normalizeHistorico);
      }
    }

    if (parsedDemandas && parsedHistorico) {
      this.demandas = parsedDemandas;
      this.historico = parsedHistorico;
      this.persist(this.demandas, this.historico);
    } else {
      if ((rawDemandas !== null || rawHistorico !== null) && !houveErroParse) {
        console.warn('A base de dados local estava inconsistente ou corrompida. Todos os dados foram redefinidos para os valores padrões de segurança.');
      }
      this.demandas = this.initialDemandas.map((demanda) => normalizeDemanda(demanda, 'sistema'));
      this.resetHistoricoFallback();
    }

    return {
      demandas: this.demandas.filter((demanda) => !demanda.deletedAt),
      historico: this.historico,
    };
  }

  async loadTrash(): Promise<Demanda[]> {
    return this.demandas
      .filter((demanda) => Boolean(demanda.deletedAt))
      .sort((a, b) => b.deletedAt.localeCompare(a.deletedAt));
  }

  private resetHistoricoFallback(): void {
    const hojeStr = new Date().toLocaleString('pt-BR');
    this.historico = this.demandas.map((demanda) => ({
      id: demanda.id,
      demandaId: demanda.id,
      data_hora: hojeStr,
      tipoEvento: 'criacao',
      status_anterior: '',
      status_novo: demanda.status,
      setor: demanda.setor || 'SME',
      comentario: 'Demanda sintética carregada no modo de demonstração.',
      autorId: null,
      autorNome: DEMO_AUTHOR,
      alteracoes: [],
    }));
    this.persist(this.demandas, this.historico);
  }

  async create(input: CreateDemandaInput): Promise<void> {
    if (this.demandas.some((d) => d.numero.trim().toLowerCase() === input.numero.trim().toLowerCase())) {
      throw new Error('Já existe uma demanda cadastrada com este número de processo.');
    }
    const parsed = createDemandaMutationSchema.parse(input);
    const id = this.demandas.length > 0 ? Math.max(...this.demandas.map((d) => d.id)) + 1 : 1;
    const now = new Date().toISOString();
    const { proximaAcaoJustificativa, ...demandFields } = parsed;
    const demanda: Demanda = {
      id,
      ...demandFields,
      origem: 'sistema',
      deletedAt: '',
      deletedBy: null,
      deletionReason: '',
      createdAt: now,
      updatedAt: now,
    };

    const event = this.createEvent(
      demanda,
      'criacao',
      '',
      appendPastJustification('Demanda cadastrada no sistema.', proximaAcaoJustificativa),
      [
        fieldChange('status', null, demanda.status),
        fieldChange('setor', null, demanda.setor),
        fieldChange('origem', null, demanda.origem),
        fieldChange('limite1', null, demanda.limite1),
        fieldChange('limite1_situacao', null, demanda.limite1Situacao),
        fieldChange('limite2', null, demanda.limite2),
        fieldChange('limite2_situacao', null, demanda.limite2Situacao),
        fieldChange('proxima_acao', null, demanda.proximaAcao),
        fieldChange('proxima_acao_em', null, demanda.proximaAcaoEm),
      ],
    );
    this.persist([demanda, ...this.demandas], [event, ...this.historico]);
  }

  async edit(id: number, input: EditDemandaInput): Promise<void> {
    const parsed = editDemandaMutationSchema.parse(input);
    const current = this.requireActive(id);

    if (parsed.limite1Situacao === 'nao_se_aplica') {
      throw new Error('O prazo interno não pode ser marcado como Não se aplica.');
    }
    if (current.limite1Situacao !== 'nao_informado' && parsed.limite1Situacao === 'nao_informado') {
      throw new Error('Um prazo interno já registrado não pode voltar a Não informado.');
    }
    if (current.limite2Situacao !== 'nao_informado' && parsed.limite2Situacao === 'nao_informado') {
      throw new Error('Um prazo final já registrado não pode voltar a Não informado.');
    }

    const next: Demanda = {
      ...current,
      assunto: parsed.assunto,
      responsavelId: parsed.responsavelId,
      responsavel: parsed.responsavel,
      limite1: parsed.limite1,
      limite1Situacao: parsed.limite1Situacao,
      limite1Justificativa: parsed.limite1Justificativa,
      limite2: parsed.limite2,
      limite2Situacao: parsed.limite2Situacao,
      limite2Justificativa: parsed.limite2Justificativa,
      setor: parsed.setor,
      classificacao: parsed.classificacao,
      linkOrigem: parsed.linkOrigem,
      updatedAt: new Date().toISOString(),
    };

    const fields: Array<keyof Pick<Demanda,
      'assunto' | 'responsavelId' | 'responsavel' |
      'limite1' | 'limite1Situacao' | 'limite1Justificativa' |
      'limite2' | 'limite2Situacao' | 'limite2Justificativa' |
      'setor' | 'classificacao' | 'linkOrigem'
    >> = [
      'assunto', 'responsavelId', 'responsavel',
      'limite1', 'limite1Situacao', 'limite1Justificativa',
      'limite2', 'limite2Situacao', 'limite2Justificativa',
      'setor', 'classificacao', 'linkOrigem',
    ];
    const changes = fields
      .filter((field) => current[field] !== next[field])
      .map((field) => fieldChange(field, current[field], next[field]));
    if (changes.length === 0) throw new Error('Nenhuma alteração foi identificada.');

    const internalNeedsReason = requiresDeadlineChangeJustification(
      { state: current.limite1Situacao, date: current.limite1 },
      { state: next.limite1Situacao, date: next.limite1 },
    );
    const finalNeedsReason = requiresDeadlineChangeJustification(
      { state: current.limite2Situacao, date: current.limite2 },
      { state: next.limite2Situacao, date: next.limite2 },
    );
    const deadlineFields = new Set([
      'limite1', 'limite1Situacao', 'limite1Justificativa',
      'limite2', 'limite2Situacao', 'limite2Justificativa',
    ]);
    const onlyDeadlineChanges = changes.every((change) => deadlineFields.has(change.field));
    const requiresReason = internalNeedsReason || finalNeedsReason || !onlyDeadlineChanges;
    if (requiresReason && usefulLength(parsed.justificativa) < 10) {
      throw new Error('Justifique a alteração com pelo menos 10 caracteres.');
    }

    const responsibilityFields = new Set(['responsavelId', 'responsavel']);
    const changedNames = changes.map((change) => change.field);
    const type: HistoryEventType = changedNames.every((field) => responsibilityFields.has(field))
      ? 'reatribuicao'
      : onlyDeadlineChanges
        ? 'alteracao_prazo'
        : 'edicao';
    const comment = parsed.justificativa.trim()
      || (onlyDeadlineChanges ? 'Prazo ausente no legado preenchido pela primeira vez.' : 'Dados atualizados.');
    const event = this.createEvent(next, type, current.status, comment, changes);
    this.persist(
      this.demandas.map((demanda) => demanda.id === id ? next : demanda),
      [event, ...this.historico],
    );
  }

  async registerProgress(id: number, input: ProgressInput): Promise<void> {
    const parsed = progressMutationSchema.parse(input);
    const current = this.requireActive(id);
    if (current.status === 'Encerrado') {
      throw new Error('Demanda encerrada não recebe andamento. Use a transição de status para reabri-la.');
    }
    const next: Demanda = {
      ...current,
      proximaAcao: parsed.proximaAcao,
      proximaAcaoEm: parsed.proximaAcaoEm,
      updatedAt: new Date().toISOString(),
    };
    const changes = [
      ...(current.proximaAcao !== next.proximaAcao ? [fieldChange('proxima_acao', current.proximaAcao, next.proximaAcao)] : []),
      ...(current.proximaAcaoEm !== next.proximaAcaoEm ? [fieldChange('proxima_acao_em', current.proximaAcaoEm, next.proximaAcaoEm)] : []),
    ];
    const event = this.createEvent(
      next,
      'andamento',
      current.status,
      appendPastJustification(parsed.comentario, parsed.proximaAcaoJustificativa),
      changes,
    );
    this.persist(this.demandas.map((demanda) => demanda.id === id ? next : demanda), [event, ...this.historico]);
  }

  async transitionStatus(id: number, input: StatusTransitionInput): Promise<void> {
    const parsed = statusTransitionMutationSchema.parse(input);
    const current = this.requireActive(id);
    if (current.status === parsed.status) {
      throw new Error('O status informado já é o atual. Use Registrar andamento para incluir nova movimentação.');
    }
    const next: Demanda = {
      ...current,
      status: parsed.status,
      proximaAcao: parsed.status === 'Encerrado' ? '' : parsed.proximaAcao,
      proximaAcaoEm: parsed.status === 'Encerrado' ? '' : parsed.proximaAcaoEm,
      updatedAt: new Date().toISOString(),
    };
    const changes = [
      fieldChange('status', current.status, next.status),
      ...(current.proximaAcao !== next.proximaAcao ? [fieldChange('proxima_acao', current.proximaAcao, next.proximaAcao)] : []),
      ...(current.proximaAcaoEm !== next.proximaAcaoEm ? [fieldChange('proxima_acao_em', current.proximaAcaoEm, next.proximaAcaoEm)] : []),
    ];
    const event = this.createEvent(
      next,
      'mudanca_status',
      current.status,
      appendPastJustification(parsed.comentario, parsed.proximaAcaoJustificativa),
      changes,
    );
    this.persist(this.demandas.map((demanda) => demanda.id === id ? next : demanda), [event, ...this.historico]);
  }

  async deleteLogically(id: number, input: DeleteDemandaInput): Promise<void> {
    const parsed = deleteMutationSchema.parse(input);
    const current = this.requireActive(id);
    const deletedAt = new Date().toISOString();
    const next: Demanda = {
      ...current,
      deletedAt,
      deletedBy: 'demo-user',
      deletionReason: parsed.motivo,
      updatedAt: deletedAt,
    };
    const event = this.createEvent(next, 'exclusao', current.status, parsed.motivo, [
      fieldChange('deletedAt', null, deletedAt),
      fieldChange('deletionReason', null, parsed.motivo),
    ]);
    this.persist(this.demandas.map((demanda) => demanda.id === id ? next : demanda), [event, ...this.historico]);
  }

  async restore(id: number, input: RestoreDemandaInput): Promise<void> {
    const parsed = restoreMutationSchema.parse(input);
    const current = this.demandas.find((demanda) => demanda.id === id);
    if (!current) throw new Error('Demanda não encontrada.');
    if (!current.deletedAt) throw new Error('A demanda não está excluída.');
    const next: Demanda = {
      ...current,
      deletedAt: '',
      deletedBy: null,
      deletionReason: '',
      updatedAt: new Date().toISOString(),
    };
    const event = this.createEvent(next, 'restauracao', current.status, parsed.motivo, [
      fieldChange('deletedAt', current.deletedAt, null),
      fieldChange('deletionReason', current.deletionReason, null),
    ]);
    this.persist(this.demandas.map((demanda) => demanda.id === id ? next : demanda), [event, ...this.historico]);
  }

  subscribe(onRemoteChange: () => void): () => void {
    void onRemoteChange;
    return () => undefined;
  }

  private requireActive(id: number): Demanda {
    const demanda = this.demandas.find((item) => item.id === id);
    if (!demanda) throw new Error('Demanda não encontrada.');
    if (demanda.deletedAt) throw new Error('Demanda excluída não pode ser alterada.');
    return demanda;
  }

  private createEvent(
    demanda: Demanda,
    tipoEvento: HistoryEventType,
    statusAnterior: Demanda['status'] | '',
    comentario: string,
    alteracoes: FieldChange[],
  ): ComentarioHistorico {
    const highest = this.historico.reduce((max, item) => Math.max(max, item.id), 0);
    return {
      id: highest + 1,
      demandaId: demanda.id,
      data_hora: new Date().toLocaleString('pt-BR'),
      tipoEvento,
      status_anterior: statusAnterior,
      status_novo: demanda.status,
      setor: demanda.setor || '—',
      comentario,
      autorId: null,
      autorNome: DEMO_AUTHOR,
      alteracoes,
    };
  }

  private persist(nextDemandas: Demanda[], nextHistorico: ComentarioHistorico[]): void {
    this.storage.setItem(DEMANDAS_KEY, JSON.stringify(nextDemandas));
    this.storage.setItem(HISTORY_KEY, JSON.stringify(nextHistorico));
    this.demandas = nextDemandas;
    this.historico = nextHistorico;
  }

  private read<T>(key: string): T | null {
    const value = this.storage.getItem(key);
    if (value === null) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      console.warn(`Os dados locais de "${key}" estavam corrompidos e foram redefinidos para os valores padrões.`);
      return null;
    }
  }
}
