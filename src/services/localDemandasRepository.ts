import type { ComentarioHistorico, Demanda } from '../types';
import type { AppData, DemandasRepository } from './contracts';

const DEMANDAS_KEY = 'demandas_data';
const HISTORY_KEY = 'demandas_history';
const MINIMUM_STORED_ITEMS = 20;

export type StorageAdapter = Pick<Storage, 'getItem' | 'setItem'>;

export class LocalDemandasRepository implements DemandasRepository {
  private demandas: Demanda[] = [];
  private historico: ComentarioHistorico[] = [];

  constructor(
    private readonly storage: StorageAdapter,
    private readonly initialDemandas: Demanda[],
  ) {}

  async load(): Promise<AppData> {
    const storedDemandas = this.read<Demanda[]>(DEMANDAS_KEY);
    if (storedDemandas && storedDemandas.length >= MINIMUM_STORED_ITEMS) {
      this.demandas = storedDemandas;
    } else {
      this.demandas = this.initialDemandas.map((demanda) => ({ ...demanda }));
      this.saveDemandas();
    }

    const storedHistorico = this.read<ComentarioHistorico[]>(HISTORY_KEY);
    if (storedHistorico && storedHistorico.length >= MINIMUM_STORED_ITEMS) {
      this.historico = storedHistorico;
    } else {
      const hojeStr = new Date().toLocaleString('pt-BR');
      this.historico = this.initialDemandas.map((demanda) => ({
        id: demanda.id,
        demandaId: demanda.id,
        data_hora: hojeStr,
        status_novo: demanda.status,
        setor: demanda.setor || 'SME',
        comentario: 'Demanda importada da planilha inicial.',
      }));
      this.saveHistorico();
    }

    return {
      demandas: this.demandas,
      historico: this.historico,
    };
  }

  async create(input: Omit<Demanda, 'id'>): Promise<void> {
    const id = this.demandas.length > 0
      ? Math.max(...this.demandas.map((demanda) => demanda.id)) + 1
      : 1;
    const demanda: Demanda = { id, ...input };

    this.demandas = [demanda, ...this.demandas];
    this.saveDemandas();

    const comentario: ComentarioHistorico = {
      id: Date.now(),
      demandaId: id,
      data_hora: new Date().toLocaleString('pt-BR'),
      status_novo: input.status,
      setor: input.setor,
      comentario: 'Demanda cadastrada no sistema.',
    };
    this.historico = [comentario, ...this.historico];
    this.saveHistorico();
  }

  async update(id: number, changes: Partial<Demanda>): Promise<void> {
    this.demandas = this.demandas.map((demanda) =>
      demanda.id === id ? { ...demanda, ...changes } : demanda,
    );
    this.saveDemandas();
  }

  async updateStatus(
    id: number,
    status: Demanda['status'],
    comentario: string,
  ): Promise<void> {
    const demanda = this.demandas.find((item) => item.id === id);
    this.demandas = this.demandas.map((item) =>
      item.id === id ? { ...item, status } : item,
    );
    this.saveDemandas();

    const historico: ComentarioHistorico = {
      id: Date.now(),
      demandaId: id,
      data_hora: new Date().toLocaleString('pt-BR'),
      status_novo: status,
      setor: demanda?.setor || '—',
      comentario,
    };
    this.historico = [historico, ...this.historico];
    this.saveHistorico();
  }

  async delete(id: number): Promise<void> {
    this.demandas = this.demandas.filter((demanda) => demanda.id !== id);
    this.historico = this.historico.filter((item) => item.demandaId !== id);
    this.saveDemandas();
    this.saveHistorico();
  }

  subscribe(_onRemoteChange: () => void): () => void {
    return () => undefined;
  }

  private read<T>(key: string): T | null {
    const value = this.storage.getItem(key);
    return value ? JSON.parse(value) as T : null;
  }

  private saveDemandas(): void {
    this.storage.setItem(DEMANDAS_KEY, JSON.stringify(this.demandas));
  }

  private saveHistorico(): void {
    this.storage.setItem(HISTORY_KEY, JSON.stringify(this.historico));
  }
}
