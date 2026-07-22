import React, { useEffect, useMemo, useState } from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from '@tanstack/react-table';
import type { Demanda } from '../types';
import type { DemandSearchField, DemandSearchMatch } from '../search/searchTypes';
import { HighlightedText } from '../search/searchHighlight';
import { getPrazoFinalSemantics } from '../utils/date';
import { isClosed } from '../domain/workSemantics';
import { ConfirmDialog } from './ui/ConfirmDialog';

interface DemandasTableProps {
  demandas: Demanda[];
  onOpenEditar: (demanda: Demanda) => void;
  onOpenStatus: (demanda: Demanda) => void;
  onOpenHistorico: (demanda: Demanda) => void;
  onExcluir: (id: number) => void;
  canEdit?: boolean;
  canDelete?: boolean;
  searchQuery?: string;
  searchMatches?: Map<number, DemandSearchMatch>;
  searchResultMode?: 'exact' | 'approximate' | 'empty';
}

const SEARCH_FIELD_LABELS: Record<DemandSearchField, string> = {
  numero: 'número',
  tipo: 'tipo',
  assunto: 'assunto',
  responsavel: 'responsável',
  setor: 'setor',
  classificacao: 'classificação',
  status: 'status',
  historico: 'histórico',
};

function getStatusBadgeClass(status: string) {
  switch (status) {
    case 'Aguardando Andamento': return 'badge aguardando';
    case 'Tramitado': return 'badge tramitado';
    case 'Para Assinatura': return 'badge assinatura';
    case 'Encerrado': return 'badge encerrado';
    case 'Sobrestado': return 'badge sobrestado';
    case 'Ajustar': return 'badge ajustar';
    default: return 'badge';
  }
}

function getInitials(name?: string) {
  const cleanName = name?.trim();
  if (!cleanName || cleanName === '—') return '—';
  const parts = cleanName.split(/\s+/);
  return parts.length === 1
    ? parts[0].substring(0, 2).toUpperCase()
    : `${parts[0][0]}${parts.at(-1)?.[0] ?? ''}`.toUpperCase();
}

function sortableDate(value: string) {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  if (!match) return Number.MAX_SAFE_INTEGER;
  return Number(`${match[3]}${match[2]}${match[1]}`);
}

function SearchMatchContext({ match, query }: { match?: DemandSearchMatch; query: string }) {
  if (!query.trim() || !match?.matches || match.matchedFields.length === 0) return null;

  return (
    <div className="search-match-context">
      <div className="search-match-summary">
        <span className="search-match-label">Encontrado em:</span>
        <span className="search-match-fields">
          {match.matchedFields.map((field) => (
            <span key={field} className={`search-match-chip ${field === 'historico' ? 'history-match' : ''}`}>
              {SEARCH_FIELD_LABELS[field]}
            </span>
          ))}
        </span>
      </div>
      {match.matchKind === 'approximate' && (
        <div className="approximate-match-details">
          <span className="approximate-match-ratio">{match.matchedTermCount} de {match.totalTermCount} termos</span>
          <span className="approximate-missing-terms">
            <strong>{(match.missingTerms?.length ?? 0) > 1 ? 'Termos ausentes:' : 'Termo ausente:'}</strong>{' '}
            {match.missingTerms?.join(', ')}
          </span>
        </div>
      )}
      {match.historySnippet && (
        <div className="search-history-snippet">
          <i className="fa-solid fa-clock-rotate-left" aria-hidden="true" />
          <span><strong>Histórico:</strong> <HighlightedText text={match.historySnippet} query={query} /></span>
        </div>
      )}
    </div>
  );
}

export const DemandasTable: React.FC<DemandasTableProps> = ({
  demandas,
  onOpenEditar,
  onOpenStatus,
  onOpenHistorico,
  onExcluir,
  canEdit = true,
  canDelete = true,
  searchQuery = '',
  searchMatches = new Map<number, DemandSearchMatch>(),
  searchResultMode = 'exact',
}) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [deleteTarget, setDeleteTarget] = useState<Demanda | null>(null);
  const columnHelper = createColumnHelper<Demanda>();

  useEffect(() => {
    setPagination((current) => ({ ...current, pageIndex: 0 }));
  }, [demandas]);

  const columns = useMemo(() => [
    columnHelper.accessor('numero', {
      header: ({ column }) => (
        <button
          type="button"
          className="table-sort-button"
          onClick={column.getToggleSortingHandler()}
          aria-label="Ordenar por processo"
        >
          Processo / Documento <SortIcon direction={column.getIsSorted()} />
        </button>
      ),
      cell: ({ row }) => {
        const demanda = row.original;
        return (
          <div className="processo-identificacao">
            <button
              type="button"
              className="numero-link"
              onClick={() => onOpenEditar(demanda)}
              title={`Abrir detalhes do processo nº ${demanda.numero}`}
            >
              <HighlightedText text={demanda.numero} query={searchQuery} />
            </button>
            <div className="processo-metadados">
              <span><HighlightedText text={demanda.tipo} query={searchQuery} /></span>
              {demanda.classificacao && (
                <>
                  <span className="separador-dot">•</span>
                  <span><HighlightedText text={demanda.classificacao} query={searchQuery} /></span>
                </>
              )}
            </div>
          </div>
        );
      },
      size: 220,
    }),
    columnHelper.accessor('assunto', {
      header: 'Assunto',
      cell: ({ row }) => {
        const demanda = row.original;
        return (
          <div className="assunto-search-cell">
            <div className="limite-linhas" title={demanda.assunto}>
              <HighlightedText text={demanda.assunto} query={searchQuery} />
            </div>
            <SearchMatchContext match={searchMatches.get(demanda.id)} query={searchQuery} />
          </div>
        );
      },
      enableSorting: false,
      size: 330,
    }),
    columnHelper.accessor('responsavel', {
      header: ({ column }) => (
        <button type="button" className="table-sort-button" onClick={column.getToggleSortingHandler()} aria-label="Ordenar por responsável">
          Responsável <SortIcon direction={column.getIsSorted()} />
        </button>
      ),
      cell: ({ row }) => {
        const demanda = row.original;
        const initials = getInitials(demanda.responsavel);
        return (
          <div className="avatar-circle-group">
            <div className={`avatar-circle ${initials === '—' ? 'no-avatar' : ''}`} title={demanda.responsavel}>{initials}</div>
            <div className="avatar-info">
              <span className="avatar-nome"><HighlightedText text={demanda.responsavel || 'Não atribuído'} query={searchQuery} /></span>
              {demanda.setor && <span className="avatar-setor"><HighlightedText text={demanda.setor} query={searchQuery} /></span>}
            </div>
          </div>
        );
      },
      sortingFn: (a, b) => (a.original.responsavel || '').localeCompare(b.original.responsavel || '', 'pt-BR'),
      size: 180,
    }),
    columnHelper.accessor('limite1', {
      header: 'Prazo Interno',
      cell: ({ getValue }) => getValue() && getValue() !== 'dd/mm/aaaa' ? getValue() : '—',
      enableSorting: false,
      size: 110,
    }),
    columnHelper.accessor('limite2', {
      header: ({ column }) => (
        <button type="button" className="table-sort-button table-sort-centered" onClick={column.getToggleSortingHandler()} aria-label="Ordenar por prazo final">
          Prazo Final <SortIcon direction={column.getIsSorted()} />
        </button>
      ),
      cell: ({ row }) => {
        const prazo = getPrazoFinalSemantics(row.original.limite2);
        return (
          <div className="prazo-final-container">
            <span className="prazo-final-data">{prazo.data}</span>
            {prazo.label && !isClosed(row.original) && <span className={`prazo-status-label ${prazo.classe}`}>{prazo.label}</span>}
          </div>
        );
      },
      sortingFn: (a, b) => sortableDate(a.original.limite2) - sortableDate(b.original.limite2),
      size: 120,
    }),
    columnHelper.accessor('status', {
      header: ({ column }) => (
        <button type="button" className="table-sort-button table-sort-centered" onClick={column.getToggleSortingHandler()} aria-label="Ordenar por status">
          Status <SortIcon direction={column.getIsSorted()} />
        </button>
      ),
      cell: ({ getValue }) => <span className={getStatusBadgeClass(getValue())}><HighlightedText text={getValue()} query={searchQuery} /></span>,
      sortingFn: 'alphanumeric',
      size: 130,
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Ações',
      cell: ({ row }) => {
        const demanda = row.original;
        return (
          <div className="actions-wrapper">
            <button type="button" className="btn btn-abrir-tabela" onClick={() => onOpenEditar(demanda)} title="Abrir detalhes da demanda">Abrir</button>
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button
                  type="button"
                  className="btn-ellipsis"
                  title="Mais ações"
                  aria-label={`Mais ações da demanda ${demanda.numero}`}
                >
                  <i className="fa-solid fa-ellipsis-vertical" aria-hidden="true" />
                </button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content className="dropdown-menu radix-dropdown-content" sideOffset={6} align="end">
                  {canEdit && (
                    <DropdownMenu.Item className="dropdown-item" onSelect={() => onOpenStatus(demanda)}>
                      <i className="fa-solid fa-rotate-left" aria-hidden="true" /><span>Alterar status</span>
                    </DropdownMenu.Item>
                  )}
                  <DropdownMenu.Item className="dropdown-item" onSelect={() => onOpenHistorico(demanda)}>
                    <i className="fa-solid fa-clock-rotate-left" aria-hidden="true" /><span>Histórico</span>
                  </DropdownMenu.Item>
                  {canDelete && (
                    <>
                      <DropdownMenu.Separator className="dropdown-divider" />
                      <DropdownMenu.Item className="dropdown-item delete-item" onSelect={() => setDeleteTarget(demanda)}>
                        <i className="fa-solid fa-trash-can" aria-hidden="true" /><span>Excluir</span>
                      </DropdownMenu.Item>
                    </>
                  )}
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </div>
        );
      },
      size: 100,
    }),
  ], [canDelete, canEdit, columnHelper, onOpenEditar, onOpenHistorico, onOpenStatus, searchMatches, searchQuery]);

  const table = useReactTable({
    data: demandas,
    columns,
    state: { sorting, pagination },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const total = table.getRowCount();
  const start = total === 0 ? 0 : pagination.pageIndex * pagination.pageSize + 1;
  const end = Math.min(total, start + pagination.pageSize - 1);
  const approximateTermCount = searchMatches.values().next().value?.totalTermCount ?? 0;

  return (
    <>
      <div className={`table-card ${searchResultMode === 'approximate' ? 'approximate-results-card' : ''}`}>
        {searchResultMode === 'approximate' && (
          <div className="approximate-search-notice" role="status">
            <i className="fa-solid fa-wand-magic-sparkles" aria-hidden="true" />
            <div>
              <strong>Nenhuma demanda contém todos os {approximateTermCount} termos pesquisados.</strong>
              <span>Exibindo resultados próximos, ordenados pela quantidade e relevância das correspondências.</span>
            </div>
          </div>
        )}
        <div className="table-responsive" role="region" aria-label={searchResultMode === 'approximate' ? 'Tabela de resultados próximos' : 'Tabela de demandas'} tabIndex={0}>
          <table className="demandas-table">
            <thead>
              {table.getHeaderGroups().map((group) => (
                <tr key={group.id}>
                  {group.headers.map((header) => (
                    <th key={header.id} style={{ width: header.getSize(), textAlign: ['numero', 'assunto', 'responsavel'].includes(header.column.id) ? 'left' : 'center' }}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.length > 0 ? table.getRowModel().rows.map((row) => (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className={cell.column.id === 'assunto' ? 'text-start-cell' : ''} style={{ textAlign: ['numero', 'assunto', 'responsavel'].includes(cell.column.id) ? 'left' : 'center' }}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              )) : (
                <tr><td colSpan={columns.length}>
                  <div className="empty-state table-empty-state">
                    <i className="fa-solid fa-filter-circle-xmark" aria-hidden="true" />
                    <strong>{searchResultMode === 'empty' ? 'Nenhum resultado exato ou próximo encontrado' : 'Nenhuma demanda encontrada'}</strong>
                    <span>{searchResultMode === 'empty' ? 'Tente corrigir algum termo ou reduzir a quantidade de palavras pesquisadas.' : 'Revise os filtros ou faça uma nova busca.'}</span>
                  </div>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="table-pagination" aria-label="Paginação da tabela">
          <div className="pagination-summary">{start}–{end} de {total} {searchResultMode === 'approximate' ? 'sugestões' : 'resultados'}</div>
          <label className="page-size-control">
            Exibir
            <select value={pagination.pageSize} onChange={(event) => table.setPageSize(Number(event.target.value))} aria-label="Resultados por página">
              {[10, 25, 50].map((size) => <option key={size} value={size}>{size}</option>)}
            </select>
          </label>
          <div className="pagination-actions">
            <button type="button" className="btn pagination-button" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} aria-label="Página anterior">
              <i className="fa-solid fa-chevron-left" aria-hidden="true" />
            </button>
            <span>Página {table.getPageCount() === 0 ? 0 : pagination.pageIndex + 1} de {table.getPageCount()}</span>
            <button type="button" className="btn pagination-button" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} aria-label="Próxima página">
              <i className="fa-solid fa-chevron-right" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Excluir demanda?"
        description={`O processo ${deleteTarget?.numero ?? ''} será removido com seu histórico. Essa ação não poderá ser desfeita.`}
        confirmLabel="Excluir demanda"
        destructive
        onConfirm={() => {
          if (deleteTarget) onExcluir(deleteTarget.id);
          setDeleteTarget(null);
        }}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
      />
    </>
  );
};

function SortIcon({ direction }: { direction: false | 'asc' | 'desc' }) {
  const icon = direction === 'asc' ? 'fa-arrow-up-short-wide' : direction === 'desc' ? 'fa-arrow-down-wide-short' : 'fa-sort';
  return <i className={`fa-solid ${icon}`} aria-hidden="true" />;
}
