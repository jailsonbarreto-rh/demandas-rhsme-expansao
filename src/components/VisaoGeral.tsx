import React from 'react';
import { ComentarioHistorico, Demanda } from '../types';
import { isTechnicalHistoryEvent, presentHistoryEvent } from '../domain/historyPresentation';

interface VisaoGeralProps {
  demandas: Demanda[];
  historico: ComentarioHistorico[];
  onOpenEditar: (demanda: Demanda) => void;
  renderAtencaoImediata: () => React.ReactNode;
}

export const VisaoGeral: React.FC<VisaoGeralProps> = ({
  demandas,
  historico,
  onOpenEditar,
  renderAtencaoImediata,
}) => {
  const total = demandas.length;

  const getStatusDistribution = () => {
    const statusCounts: Record<string, number> = {};
    demandas.forEach((demanda) => {
      statusCounts[demanda.status] = (statusCounts[demanda.status] || 0) + 1;
    });

    return Object.entries(statusCounts)
      .map(([status, count]) => ({
        label: status,
        count,
        percent: total > 0 ? Math.round((count / total) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count);
  };

  const getSetorDistribution = () => {
    const setorCounts: Record<string, number> = {};
    demandas.forEach((demanda) => {
      const setor = demanda.setor || 'Sem setor';
      setorCounts[setor] = (setorCounts[setor] || 0) + 1;
    });

    return Object.entries(setorCounts)
      .map(([setor, count]) => ({
        label: setor,
        count,
        percent: total > 0 ? Math.round((count / total) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  const statusDist = getStatusDistribution();
  const setorDist = getSetorDistribution();
  const ultimasMovimentacoes = historico
    .filter((item) => !isTechnicalHistoryEvent(item))
    .slice(0, 5)
    .map((item) => {
      const demandaCorresp = demandas.find((demanda) => demanda.id === item.demandaId);
      return {
        ...item,
        presentation: presentHistoryEvent(item),
        processoNumero: demandaCorresp?.numero || `Processo #${item.demandaId}`,
        demanda: demandaCorresp,
      };
    });

  return (
    <div className="visao-geral-container" style={{ animation: 'fadeIn 0.4s ease-out forwards' }}>
      {renderAtencaoImediata()}

      <div className="dashboard-row">
        <div className="dashboard-col-card">
          <h2>
            <i className="fa-solid fa-chart-bar" style={{ color: 'var(--accent-color)' }} />
            Distribuição por Status
          </h2>

          <div style={{ marginTop: '10px' }}>
            {statusDist.length > 0 ? (
              statusDist.map((item) => (
                <div key={item.label} className="progress-bar-group">
                  <div className="progress-bar-labels">
                    <span style={{ fontWeight: 600 }}>{item.label}</span>
                    <span style={{ color: 'var(--text-muted)' }}>
                      {item.count} {item.count === 1 ? 'demanda' : 'demandas'} ({item.percent}%)
                    </span>
                  </div>
                  <div className="progress-bar-outer">
                    <div
                      className="progress-bar-inner"
                      style={{
                        width: `${item.percent}%`,
                        backgroundColor: item.label === 'Encerrado'
                          ? '#94a3b8'
                          : item.label === 'Para Assinatura'
                            ? '#287B78'
                            : 'var(--accent-color)',
                      }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Nenhum dado disponível.</div>
            )}
          </div>
        </div>

        <div className="dashboard-col-card">
          <h2>
            <i className="fa-solid fa-building-user" style={{ color: 'var(--accent-color)' }} />
            Demandas por setor informado
          </h2>

          <div style={{ marginTop: '10px' }}>
            {setorDist.length > 0 ? (
              setorDist.map((item) => (
                <div key={item.label} className="progress-bar-group">
                  <div className="progress-bar-labels">
                    <span style={{ fontWeight: 600 }}>{item.label}</span>
                    <span style={{ color: 'var(--text-muted)' }}>
                      {item.count} {item.count === 1 ? 'demanda' : 'demandas'} ({item.percent}%)
                    </span>
                  </div>
                  <div className="progress-bar-outer">
                    <div
                      className="progress-bar-inner"
                      style={{ width: `${item.percent}%`, backgroundColor: 'var(--accent-color)' }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Nenhum dado disponível.</div>
            )}
          </div>
        </div>
      </div>

      <div className="dashboard-row" style={{ marginTop: '25px', gridTemplateColumns: '1fr' }}>
        <div className="dashboard-col-card" style={{ width: '100%' }}>
          <h2>
            <i className="fa-solid fa-clock-rotate-left" style={{ color: 'var(--accent-color)' }} />
            Registros recentes do histórico
          </h2>

          <div style={{ marginTop: '20px' }}>
            {ultimasMovimentacoes.length > 0 ? (
              <div className="timeline-container" style={{ paddingLeft: '25px' }}>
                {ultimasMovimentacoes.map((item, index) => {
                  let statusBadgeClass = 'badge aguardando';
                  if (item.status_novo === 'Para Assinatura') statusBadgeClass = 'badge assinatura';
                  else if (item.status_novo === 'Encerrado') statusBadgeClass = 'badge encerrado';
                  else if (item.status_novo === 'Tramitado') statusBadgeClass = 'badge tramitado';
                  else if (item.status_novo === 'Ajustar') statusBadgeClass = 'badge ajustar';
                  else if (item.status_novo === 'Sobrestado') statusBadgeClass = 'badge sobrestado';

                  return (
                    <div
                      key={item.id}
                      className={`timeline-item ${index === 0 ? 'latest' : ''}`}
                      style={{ marginBottom: '20px' }}
                    >
                      <div className="timeline-circle" />
                      <div className="timeline-content" style={{ padding: '14px 18px' }}>
                        <div className="timeline-header">
                          <div className="timeline-meta" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontWeight: 700, color: 'var(--primary-color)' }}>
                              {item.processoNumero}
                            </span>
                            <span style={{ color: '#94a3b8' }}>|</span>
                            <span>{item.data_hora}</span>
                          </div>

                          <span className={statusBadgeClass} style={{ fontSize: '0.65rem', fontWeight: 600 }}>
                            {item.status_novo}
                          </span>
                        </div>

                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                          <span className="timeline-event-type">{item.presentation.label}</span>
                          <span className="timeline-setor">
                            <i className="fa-solid fa-building" style={{ marginRight: '4px', fontSize: '0.688rem' }} />
                            {item.setor || 'CTRH'}
                          </span>

                          {item.demanda && (
                            <button
                              type="button"
                              className="btn-logout-link"
                              style={{ display: 'inline-flex', fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-color)' }}
                              onClick={() => onOpenEditar(item.demanda!)}
                              title="Abrir detalhes do processo"
                            >
                              <i className="fa-solid fa-up-right-from-square" />
                              <span>Ver processo</span>
                            </button>
                          )}
                        </div>

                        <div className="timeline-comment" style={{ marginTop: '6px', fontSize: '0.813rem', fontStyle: 'italic' }}>
                          &quot;{item.presentation.comment}&quot;
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ padding: '20px 0', color: 'var(--text-muted)', textAlign: 'center', fontSize: '0.875rem' }}>
                Nenhuma movimentação operacional registrada.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
