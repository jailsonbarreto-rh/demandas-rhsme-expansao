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
  numero: 'DEMO-R4-999',
  tipo: 'Processo',
  assunto: 'Nova demanda auditável',
  responsavel: 'Equipe Demonstração',
  responsavelId: null,
  limite1: '10/08/2099',
  limite1Situacao: 'definido',
  limite1Justificativa: '',
  limite2: '',
  limite2Situacao: 'nao_se_aplica',
  limite2Justificativa: '',
  proximaAcao: 'Conferir documentação demonstrativa',
  proximaAcaoEm: '20/08/2099',
  proximaAcaoJustificativa: '',
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

describe('LocalDemandasRepository — R4', () => {
  let storage: MemoryStorage;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-22T12:00:00-03:00'));
    storage = new MemoryStorage();
  });

  afterEach(() => vi.useRealTimers());

  it('inicializa as chaves atuais com demandas e histórico sintéticos', async () => {
    const repository = new LocalDemandasRepository(storage, initialDemandas);
    const data = await repository.load();
    expect(data.demandas).toEqual(initialDemandas);
    expect(data.historico.map((item) => item.demandaId)).toEqual(initialDemandas.map((demanda) => demanda.id));
    expect(data.historico.every((item) => item.comentario === 'Demanda sintética carregada no modo de demonstração.')).toBe(true);
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
    expect(data.demandas[0]).toEqual(expect.objectContaining({ deletedAt: '', deletedBy: null, deletionReason: '' }));
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

  it('cria demanda válida e evento estruturado', async () => {
    const repository = new LocalDemandasRepository(storage, initialDemandas);
    await repository.load();
    await repository.create(createInput);
    const data = await repository.load();
    const created = data.demandas.find((demanda) => demanda.numero === createInput.numero)!;
    const events = data.historico.filter((item) => item.demandaId === created.id);

    expect(created).toEqual(expect.objectContaining({
      origem: 'sistema',
      limite1Situacao: 'definido',
      limite2Situacao: 'nao_se_aplica',
      proximaAcao: createInput.proximaAcao,
    }));
    expect(events).toHaveLength(1);
    expect(events[0]).toEqual(expect.objectContaining({
      tipoEvento: 'criacao',
      autorNome: 'Usuário Demonstração',
      alteracoes: expect.arrayContaining([
        expect.objectContaining({ field: 'limite1_situacao', after: 'definido' }),
      ]),
    }));
  });

  it('rejeita nova demanda sem prazo interno ou escolha final explícita', async () => {
    const repository = new LocalDemandasRepository(storage, initialDemandas);
    await repository.load();
    await expect(repository.create({
      ...createInput,
      limite1: '',
      limite1Situacao: 'nao_informado',
    })).rejects.toThrow();
    await expect(repository.create({
      ...createInput,
      numero: 'DEMO-R4-998',
      limite2Situacao: 'nao_informado',
    })).rejects.toThrow();
  });

  it('preserva lacunas legadas em edição cadastral e permite primeira adequação sem justificativa', async () => {
    const legacy: Demanda = {
      ...initialDemandas[0],
      id: 900,
      numero: 'LEGADO-900',
      assunto: 'Registro legado',
      limite1: '',
      limite1Situacao: 'nao_informado',
      limite2: '',
      limite2Situacao: 'nao_informado',
      proximaAcao: '',
      proximaAcaoEm: '',
      origem: 'legado',
    };
    storage.setItem('demandas_data', JSON.stringify([legacy]));
    storage.setItem('demandas_history', JSON.stringify(makeHistory([legacy])));
    const repository = new LocalDemandasRepository(storage, initialDemandas);
    await repository.load();

    await repository.edit(legacy.id, makeEditInput(legacy, {
      assunto: 'Registro legado corrigido',
      justificativa: 'Correção cadastral do assunto legado',
    }));
    let data = await repository.load();
    let updated = data.demandas[0];
    expect(updated).toEqual(expect.objectContaining({
      limite1Situacao: 'nao_informado',
      limite2Situacao: 'nao_informado',
      proximaAcao: '',
    }));

    await repository.edit(legacy.id, makeEditInput(updated, {
      limite1: '10/08/2099',
      limite1Situacao: 'definido',
      limite2Situacao: 'nao_se_aplica',
      justificativa: '',
    }));
    data = await repository.load();
    updated = data.demandas[0];
    expect(updated.limite1Situacao).toBe('definido');
    expect(data.historico[0]).toEqual(expect.objectContaining({
      tipoEvento: 'alteracao_prazo',
      comentario: 'Prazo ausente no legado preenchido pela primeira vez.',
    }));
  });

  it('exige justificativa para alterar prazo já registrado', async () => {
    const repository = new LocalDemandasRepository(storage, initialDemandas);
    await repository.load();
    await repository.create(createInput);
    const created = (await repository.load()).demandas.find((item) => item.numero === createInput.numero)!;

    await expect(repository.edit(created.id, makeEditInput(created, {
      limite1: '11/08/2099',
      justificativa: '',
    }))).rejects.toThrow('Justifique a alteração');

    await repository.edit(created.id, makeEditInput(created, {
      limite1: '11/08/2099',
      justificativa: 'Reprogramação aprovada após nova análise',
    }));
    expect((await repository.load()).historico[0].tipoEvento).toBe('alteracao_prazo');
  });

  it('registra andamento sem trocar status e exige justificativa para data vencida', async () => {
    const repository = new LocalDemandasRepository(storage, initialDemandas);
    await repository.load();
    const target = initialDemandas[0];

    await expect(repository.registerProgress(target.id, {
      comentario: 'Documentação conferida.',
      proximaAcao: 'Cobrar complementação documental',
      proximaAcaoEm: '01/01/2000',
      proximaAcaoJustificativa: '',
    })).rejects.toThrow();

    await repository.registerProgress(target.id, {
      comentario: 'Documentação conferida.',
      proximaAcao: 'Cobrar complementação documental',
      proximaAcaoEm: '01/01/2000',
      proximaAcaoJustificativa: 'Registro tardio após indisponibilidade temporária',
    });
    const data = await repository.load();
    const updated = data.demandas.find((demanda) => demanda.id === target.id)!;
    expect(updated.status).toBe(target.status);
    expect(updated.proximaAcao).toBe('Cobrar complementação documental');
    expect(data.historico[0].comentario).toContain('Justificativa da data vencida');
  });

  it('exige próxima providência ao movimentar legado e limpa ao encerrar', async () => {
    const repository = new LocalDemandasRepository(storage, initialDemandas);
    await repository.load();
    const target = initialDemandas[0];

    await expect(repository.transitionStatus(target.id, {
      status: 'Tramitado',
      comentario: 'Encaminhado.',
      proximaAcao: '',
      proximaAcaoEm: '',
    })).rejects.toThrow();

    await repository.transitionStatus(target.id, {
      status: 'Encerrado',
      comentario: 'Providência concluída.',
      proximaAcao: '',
      proximaAcaoEm: '',
    });
    const data = await repository.load();
    expect(data.demandas.find((demanda) => demanda.id === target.id)).toEqual(expect.objectContaining({
      status: 'Encerrado',
      proximaAcao: '',
      proximaAcaoEm: '',
    }));
  });

  it('exclui logicamente, preserva o histórico e permite restauração', async () => {
    const repository = new LocalDemandasRepository(storage, initialDemandas);
    await repository.load();
    const target = initialDemandas[1];
    await repository.deleteLogically(target.id, { motivo: 'Registro duplicado confirmado na conferência' });
    let data = await repository.load();
    const storedAfterDelete = JSON.parse(storage.getItem('demandas_data')!) as Demanda[];
    const deleted = storedAfterDelete.find((demanda) => demanda.id === target.id)!;
    expect(data.demandas.some((demanda) => demanda.id === target.id)).toBe(false);
    expect(deleted.deletedBy).toBe('demo-user');
    expect((await repository.loadTrash()).map((demanda) => demanda.id)).toContain(target.id);

    await repository.restore(target.id, { motivo: 'Registro confirmado como válido após nova conferência' });
    data = await repository.load();
    expect(data.demandas.find((demanda) => demanda.id === target.id)).toEqual(expect.objectContaining({ deletedAt: '' }));
    expect(data.historico[0].tipoEvento).toBe('restauracao');
  });

  it('rejeita número duplicado e IDs inexistentes', async () => {
    const repository = new LocalDemandasRepository(storage, initialDemandas);
    await repository.load();
    await expect(repository.create({ ...createInput, numero: initialDemandas[0].numero }))
      .rejects.toThrow('Já existe uma demanda cadastrada');
    await expect(repository.registerProgress(999, {
      comentario: 'Teste',
      proximaAcao: 'Verificar registro inexistente',
      proximaAcaoEm: '20/08/2099',
    })).rejects.toThrow('Demanda não encontrada');
  });

  it('não cria assinatura remota no modo local', () => {
    const repository = new LocalDemandasRepository(storage, initialDemandas);
    const onRemoteChange = vi.fn();
    repository.subscribe(onRemoteChange)();
    expect(onRemoteChange).not.toHaveBeenCalled();
  });
});
