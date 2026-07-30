import { useMemo, useState } from 'react';
import type { ComentarioHistorico, Demanda, PerfilUsuario } from '../types';
import { getUserFacingError } from '../domain/userFacingErrors';
import { AdminTrashDetailDialog } from './AdminTrashDetailDialog';
import './AdminTrashPanel.css';

interface AdminTrashPanelProps {
  demandas: Demanda[];
  historico: ComentarioHistorico[];
  perfis: PerfilUsuario[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR')
    .trim();
}

function formatDeletedAt(value: string): string {
  if (!value) return 'Data não identificada';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Data não identificada';
  return date.toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function AdminTrashPanel({
  demandas,
  historico,
  perfis,
  loading,
  error,
  onRetry,
}: AdminTrashPanelProps) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Demanda | null>(null);
  const profileNames = useMemo(
    () => new Map(perfis.map((perfil) => [perfil.id, perfil.nome || perfil.email])),
    [perfis],
  );
  const filtered = useMemo(() => {
    const clean = normalize(query);
    if (!clean) return demandas;
    return demandas.filter((demanda) => normalize([
      demanda.numero,
      demanda.assunto,
      demanda.responsavel,
      demanda.setor,
      demanda.status,
      demanda.deletionReason,
      profileNames.get(demanda.deletedBy ?? '') ?? '',
    ].join(' ')).includes(clean));
  }, [demandas, profileNames, query]);
  const selectedAuthor = selected?.deletedBy
    ? profileNames.get(selected.deletedBy) ?? 'Autor não identificado'
    : 'Autor não identificado';
  const visibleError = error
    ? getUserFacingError(error, 'Não foi possível carregar as demandas excluídas.')
    : null;

  return (
    <section className="dashboard-col-card admin-trash-panel" aria-labelledby="admin-trash-title">
      <div className="admin-trash-header">
        <div>
          <h2 id="admin-trash-title">
            <i className="fa-solid fa-trash-can" aria-hidden="true" /> Demandas excluídas
          </h2>
          <p>
            Consulta administrativa dos registros retirados da carteira. Os dados e o histórico permanecem preservados.
          </p>
        </div>
        <span className="admin-trash-count" aria-label={`${demandas.length} demandas excluídas`}>
          {demandas.length}
        </span>
      </div>

      {visibleError ? (
        <div className="alert-error-banner admin-trash-error" role="alert">
          <i className="fa-solid fa-triangle-exclamation" aria-hidden="true" />
          <strong>{visibleError}</strong>
          <button type="button" className="btn btn-secondary-outline" onClick={onRetry}>Tentar novamente</button>
        </div>
      ) : (
        <>
          <label className="admin-trash-search-label" htmlFor="admin-trash-search">
            Pesquisar demandas excluídas
          </label>
          <div className="admin-trash-search-wrap">
            <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
            <input
              id="admin-trash-search"
              type="search"
              className="form-control"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Número, assunto, responsável ou motivo da exclusão"
              aria-label="Pesquisar demandas excluídas"
            />
          </div>

          {loading ? (
            <div className="admin-trash-state" aria-live="polite">
              <i className="fa-solid fa-spinner fa-spin" aria-hidden="true" /> Carregando demandas excluídas…
            </div>
          ) : demandas.length === 0 ? (
            <div className="admin-trash-state">
              <i className="fa-solid fa-shield-check" aria-hidden="true" />
              <strong>Nenhuma demanda excluída</strong>
              <span>A lixeira administrativa está vazia.</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="admin-trash-state">
              <i className="fa-solid fa-filter-circle-xmark" aria-hidden="true" />
              <strong>Nenhum registro corresponde à pesquisa.</strong>
              <span>Revise os termos informados.</span>
            </div>
          ) : (
            <div className="table-responsive admin-trash-table-wrap" role="region" aria-label="Demandas excluídas" tabIndex={0}>
              <table className="demandas-table admin-trash-table">
                <thead>
                  <tr>
                    <th>Processo / documento</th>
                    <th>Assunto</th>
                    <th>Responsável</th>
                    <th>Status</th>
                    <th>Exclusão</th>
                    <th>Motivo</th>
                    <th>Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((demanda) => (
                    <tr key={demanda.id}>
                      <td><strong>{demanda.numero}</strong><span className="admin-trash-meta">{demanda.tipo}</span></td>
                      <td>{demanda.assunto}</td>
                      <td>{demanda.responsavel || 'Não atribuído'}</td>
                      <td><span className="badge encerrado">{demanda.status}</span></td>
                      <td>{formatDeletedAt(demanda.deletedAt)}</td>
                      <td><span className="admin-trash-reason" title={demanda.deletionReason}>{demanda.deletionReason || 'Não identificado'}</span></td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-secondary-outline"
                          onClick={() => setSelected(demanda)}
                          aria-label={`Consultar demanda excluída ${demanda.numero}`}
                        >
                          Consultar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      <AdminTrashDetailDialog
        demanda={selected}
        historico={historico}
        autorExclusao={selectedAuthor}
        onClose={() => setSelected(null)}
      />
    </section>
  );
}
