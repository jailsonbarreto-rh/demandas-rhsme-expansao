import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { demoDemandas as initialDemandas } from '../data/demoDemandas';
import type {
  ComentarioHistorico,
  CreateDemandaInput,
  Demanda,
  EditDemandaInput,
} from '../types';
import { LocalDemandasRepository } from './localDemandasRepository';

class MemoryStorage implements Storage {
  private readonly values = new Map<string, string>();

  get length(): number { return this.values.size; }
  clear(): void { this.values.clear(); }
  getItem(key: string): string | null { return this.values.get(key) ?? null; }
  key(index: number): string | null { return [...this.values.keys()][index] ?? null; }
  removeItem(key: string): void { this.values.delete(key); }
  setItem(key: string, value: string): void { this.values.set(key, value); }
  keys(): string[] { return [...this.values.keys()]; }
}

const createInput: CreateDemandaInput = {
  numero: 'DEMO-C4-999',
  tipo: 'Processo',
  assunto: 'Nova demanda auditável',
  responsavel: 'Equipe Demonstração',
  responsavelId: null,
  limite1: '',
  limite1Situacao: 'nao_informado',
  limite1Justificativa: '',
  limite2: '30/09/2026',
  limite2Situacao: 'definido',
  limite2Justificativa: '',
  proximaAcao: 'Conferir documentação demonstrativa',
  proximaAcaoEm: '20/09/2026',
  linkOrigem: '',
  status: 'Aguardando Andamento',
  setor: 'Setor Demonstração',
  classificacao: 'Diversos',
};

function makeEditInput(demanda: Demanda, patch: Partial<EditDemandaInput> = {}): EditDemandaInput {
  return {
    assunto: demanda.assunto,
    responsavelId: demanda.responsavelId,
    responsavel: demanda.responsavel,
    limite1: demanda.limite1,
    limite1Situacao: demanda.limite1Situacao,
    limite1Justificativa: demanda.limite1Justificativa,
    limite2: demanda.limite2,
    limite2Situacao: demanda.limite2Situacao,
    limite2Justificativa: demanda.limite2Justificativa,
    setor: demanda.setor,
    classificacao: demanda.classificacao,
    linkOrigem: demanda.linkOrigem,
    proximaAcao: demanda.proximaAcao,
    proximaAcaoEm: demanda.proximaAcaoEm,
    justificativa: 'Alteração confirmada no teste auditável',
    ...patch,
  };
}

function makeHistory(demandas: Demanda[], comentario = 'Histórico preservado'): ComentarioHistorico[] {
  return demandas.map((demanda) => ({
    id: demanda.id,
    demandaId: demanda.id,
    data_hora: '01/01/2026, 10:00:00',
    tipoEvento: 'criacao',
    status_anterior: '',
    status_novo: demanda.status,
    setor: demanda.setor,
    comentario,
    autorId: null,
    autorNome: 'Usuário Demonstração',
    alteracoes: [],
  }));
}

describe('LocalDemandasRepository — Ciclo 4', () => {
  let storage: MemoryStorage;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-22T12:00:00-03:00'));
    storage = new MemoryStorage();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('inicializa as chaves atuais com demandas e histórico sintéticos', async () => {
    const repository = new LocalDemandasRepository(storage, initialDemandas);
    const data = await repository.load();

    expect(data.demandas).toEqual(initialDemandas);
    expect(data.historico.map((item) => item.demandaId)).toEqual(
      initialDemandas.map((demanda) => demanda.id),
    );
    expect(data.historico.every(
      (item) => item.comentario === 'Demanda sintética carregada no modo de demonstração.',
    )).toBe(true);
    expect(JSON.parse(storage.getItem('demandas_data')!)).toEqual(initialDemandas);
    expect(storage.keys()).toEqual(['demandas_data', 'demandas_history']);
  });

  it('preserva coleções válidas e normaliza campos de exclusão ausentes', async () => {
    const storedDemandas = initialDemandas.slice(0, 2).map((demanda) => {
      const { deletedAt: _deletedAt, deletedBy: _deletedBy, deletionReason: _reason, ...legacy } = demanda;
      return legacy;
    });
    storage.setItem('demandas_data', JSON.stringify(storedDemandas));
    storage.setItem('demandas_history', JSON.stringify(makeHistory(initialDemandas.slice(0, 2))));

    const data = await new LocalDemandasRepository(storage, initialDemandas).load();

    expect(data.demandas).toHaveLength(2);
    expect(data.demandas[0]).toEqual(expect.objectContaining({
      deletedAt: '',
      deletedBy: null,
      deletionReason: '',
    }));
  });

  it('redefine para fixtures seguras quando o JSON local está corrompido', async () => {
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    storage.setItem('demandas_data', '{invalid json}');
    storage.setItem('demandas_history', '{invalid json}');

    const data = await new LocalDemandasRepository(storage, initialDemandas).load();

    expect(data.demandas).toEqual(initialDemandas);
    expect(warning).toHaveBeenCalledTimes(2);
    warning.mockRestore();
  });

  it('cria demanda e exatamente um evento de criação com alterações estruturadas', async () => {
    const repository = new LocalDemandasRepository(storage, initialDemandas);
    await repository.load();

    await repository.create(createInput);
    const data = await repository.load();
    const created = data.demandas.find((demanda) => demanda.numero === createInput.numero)!;
    const events = data.historico.filter((item) => item.demandaId === created.id);

    expect(created).toEqual(expect.objectContaining({
      origem: 'sistema',
      deletedAt: '',
      proximaAcao: createInput.proximaAcao,
    }));
    expect(events).toHaveLength(1);
    expect(events[0]).toEqual(expect.objectContaining({
      tipoEvento: 'criacao',
      autorNome: 'Usuário Demonstração',
      alteracoes: expect.arrayContaining([
        expect.objectContaining({ field: 'status', after: createInput.status }),
      ]),
    }));
  });

  it('classifica edição geral, reatribuição e alteração de prazo pelo que realmente mudou', async () => {
    const repository = new LocalDemandasRepository(storage, initialDemandas);
    await repository.load();
    const target = initialDemandas[0];

    await repository.edit(target.id, makeEditInput(target, { assunto: 'Assunto auditável revisado' }));
    let data = await repository.load();
    expect(data.historico[0]).toEqual(expect.objectContaining({
      demandaId: target.id,
      tipoEvento: 'edicao',
      comentario: 'Alteração confirmada no teste auditável',
    }));

    const afterGeneral = data.demandas.find((demanda) => demanda.id === target.id)!;
    await repository.edit(target.id, makeEditInput(afterGeneral, {
      responsavel: 'Nova pessoa responsável',
      justificativa: 'Responsabilidade redistribuída após conferência',
    }));
    data = await repository.load();
    expect(data.historico[0].tipoEvento).toBe('reatribuicao');

    const afterAssignment = data.demandas.find((demanda) => demanda.id === target.id)!;
    await repository.edit(target.id, makeEditInput(afterAssignment, {
      limite1: '18/08/2026',
      justificativa: 'Prazo interno corrigido conforme documento',
    }));
    data = await repository.load();
    expect(data.historico[0].tipoEvento).toBe('alteracao_prazo');
  });

  it('registra andamento sem trocar o status e atualiza a próxima ação', async () => {
    const repository = new LocalDemandasRepository(storage, initialDemandas);
    await repository.load();
    const target = initialDemandas[0];

    await repository.registerProgress(target.id, {
      comentario: 'Documentação conferida.',
      proximaAcao: 'Cobrar complementação documental',
      proximaAcaoEm: '25/08/2026',
    });
    const data = await repository.load();
    const updated = data.demandas.find((demanda) => demanda.id === target.id)!;

    expect(updated.status).toBe(target.status);
    expect(updated.proximaAcao).toBe('Cobrar complementação documental');
    expect(data.historico[0]).toEqual(expect.objectContaining({
      tipoEvento: 'andamento',
      status_anterior: target.status,
      status_novo: target.status,
    }));
  });

  it('transiciona status e limpa próxima ação ao encerrar', async () => {
    const repository = new LocalDemandasRepository(storage, initialDemandas);
    await repository.load();
    const target = initialDemandas[0];

    await repository.transitionStatus(target.id, {
      status: 'Encerrado',
      comentario: 'Providência concluída.',
      proximaAcao: '',
      proximaAcaoEm: '',
    });
    const data = await repository.load();
    const updated = data.demandas.find((demanda) => demanda.id === target.id)!;

    expect(updated).toEqual(expect.objectContaining({
      status: 'Encerrado',
      proximaAcao: '',
      proximaAcaoEm: '',
    }));
    expect(data.historico[0]).toEqual(expect.objectContaining({
      tipoEvento: 'mudanca_status',
      status_anterior: target.status,
      status_novo: 'Encerrado',
    }));
  });

  it('exclui logicamente, preserva o histórico e permite restauração', async () => {
    const repository = new LocalDemandasRepository(storage, initialDemandas);
    await repository.load();
    const target = initialDemandas[1];

    await repository.deleteLogically(target.id, {
      motivo: 'Registro duplicado confirmado na conferência',
    });

    let data = await repository.load();
    const storedAfterDelete = JSON.parse(storage.getItem('demandas_data')!) as Demanda[];
    const deleted = storedAfterDelete.find((demanda) => demanda.id === target.id)!;
    const trash = await repository.loadTrash();

    expect(data.demandas.some((demanda) => demanda.id === target.id)).toBe(false);
    expect(deleted).toEqual(expect.objectContaining({
      deletedBy: 'demo-user',
      deletionReason: 'Registro duplicado confirmado na conferência',
    }));
    expect(trash.map((demanda) => demanda.id)).toContain(target.id);
    expect(data.historico.some(
      (item) => item.demandaId === target.id && item.tipoEvento === 'exclusao',
    )).toBe(true);

    await repository.restore(target.id, {
      motivo: 'Registro confirmado como válido após nova conferência',
    });
    data = await repository.load();
    const restored = data.demandas.find((demanda) => demanda.id === target.id)!;

    expect(restored).toEqual(expect.objectContaining({
      deletedAt: '',
      deletedBy: null,
      deletionReason: '',
    }));
    expect(data.historico[0]).toEqual(expect.objectContaining({
      demandaId: target.id,
      tipoEvento: 'restauracao',
    }));
  });

  it('rejeita número duplicado e IDs inexistentes', async () => {
    const repository = new LocalDemandasRepository(storage, initialDemandas);
    await repository.load();

    await expect(repository.create({
      ...createInput,
      numero: initialDemandas[0].numero,
    })).rejects.toThrow('Já existe uma demanda cadastrada');

    await expect(repository.registerProgress(999, {
      comentario: 'Teste',
      proximaAcao: 'Verificar registro inexistente',
      proximaAcaoEm: '20/08/2026',
    })).rejects.toThrow('Demanda não encontrada');
  });

  it('não cria assinatura remota no modo local', () => {
    const repository = new LocalDemandasRepository(storage, initialDemandas);
    const onRemoteChange = vi.fn();
    const unsubscribe = repository.subscribe(onRemoteChange);
    unsubscribe();
    expect(onRemoteChange).not.toHaveBeenCalled();
  });
});
