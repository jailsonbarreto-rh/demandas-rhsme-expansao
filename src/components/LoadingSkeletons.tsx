export function DashboardSkeleton() {
  return (
    <div className="skeleton-page" aria-label="Carregando visão geral" aria-busy="true">
      <div className="skeleton-banner skeleton-block" />
      <div className="skeleton-grid">
        <div className="skeleton-card skeleton-block" />
        <div className="skeleton-card skeleton-block" />
      </div>
      <div className="skeleton-timeline skeleton-block" />
    </div>
  );
}

export function TableSkeleton() {
  return (
    <div className="skeleton-page" aria-label="Carregando tabela de demandas" aria-busy="true">
      <div className="skeleton-filters skeleton-block" />
      <div className="skeleton-table skeleton-block">
        {Array.from({ length: 7 }, (_, index) => <span key={index} className="skeleton-row" />)}
      </div>
    </div>
  );
}

export function AdminSkeleton() {
  return (
    <div className="skeleton-page" aria-label="Carregando administração" aria-busy="true">
      <div className="skeleton-grid"><div className="skeleton-card skeleton-block" /><div className="skeleton-card skeleton-block" /></div>
      <div className="skeleton-table skeleton-block" />
    </div>
  );
}
