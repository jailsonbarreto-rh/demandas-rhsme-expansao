import React from 'react';
import { ComentarioHistorico, Demanda, DemandStatus } from '../types';
import { isTechnicalHistoryEvent, presentHistoryEvent } from '../domain/historyPresentation';
import {
  GOVERNANCE_STATUS_ORDER,
  getDeadlineCoverage,
  getDefinedFinalDeadlineSituation,
  getResponsibleDistribution,
  type DeadlineCoverage,
  type ResponsibleDistributionItem,
} from '../domain/governanceAnalytics';
import { getTodayString } from '../utils/date';

interface VisaoGeralProps {
  demandas: Demanda[];
  historico: ComentarioHistorico[];
  onOpenEditar: (demanda: Demanda) => void;
  renderAtencaoImediata: () => React.ReactNode;
}

const STATUS_CLASS: Record<DemandStatus, string> = {
  'Aguardando Andamento': 'aguardando',
  Tramitado: 'tramitado',
  'Para Assinatura': 'assinatura',
  Ajustar: 'ajustar',
  Sobrestado: 'sobrestado',
  Encerrado: 'encerrado',
};

function percentage(count: number, total: number) {
  return total > 0 ? Math.round((count / total) * 100) : 0;
}

function badgeClass(status: string) {
  if (status === 'Para Assinatura') return 'badge assinatura';
  if (status === 'Encerrado') return 'badge encerrado';
  if (status === 'Tramitado') return 'badge tramitado';
  if (status === 'Ajustar') return 'badge ajustar';
  if (status === 'Sobrestado') return 'badge sobrestado';
  return 'badge aguardando';
}

function DeadlineCoverageCard({
  title,
  description,
  coverage,
}: {
  title: string;
  description: string;
  coverage: DeadlineCoverage;
}) {
  return (
    <article className="governance-card deadline-coverage-card">
      <div className="governance-card-header">
        <div>
          <span className="governance-kicker">Cobertura informacional</span>
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
        <div className="deadline-coverage-score" aria-label={`${coverage.percentualDefinido}% com prazo definido`}>
          <strong>{coverage.percentualDefinido}%</strong>
          <span>definido</span>
        </div>
      </div>

      <div
        className="coverage-stacked-bar"
        role="img"
        aria-label={`${coverage.definido} definidos, ${coverage.naoInformado} não informados e ${coverage.naoSeAplica} não aplicáveis`}
      >
        {coverage.definido > 0 && (
          <span
            className="coverage-segment defined"
            style={{ width: `${percentage(coverage.definido, coverage.total)}%` }}
          />
        )}
        {coverage.naoInformado > 0 && (
          <span
            className="coverage-segment missing"
            style={{ width: `${percentage(coverage.naoInformado, coverage.total)}%` }}
          />
        )}
        {coverage.naoSeAplica > 0 && (
          <span
            className="coverage-segment not-applicable"
            style={{ width: `${percentage(coverage.naoSeAplica, coverage.total)}%` }}
          />
        )}
      </div>

      <dl className="coverage-metrics">
        <div>
          <dt><span className="legend-dot defined" />Definido</dt>
          <dd>{coverage.definido}<small> de {coverage.total}</small></dd>
        </div>
        <div>
          <dt><span className="legend-dot missing" />Não informado</dt>
          <dd>{coverage.naoInformado}<small> de {coverage.total}</small></dd>
        </div>
        <div>
          <dt><span className="legend-dot not-applicable" />Não se aplica</dt>
          <dd>{coverage.naoSeAplica}<small> de {coverage.total}</small></dd>
        </div>
      </dl>
    </article>
  );
}

function ResponsibleRow({ item }: { item: ResponsibleDistributionItem }) {
  return (
    <div className="responsible-row">
      <div className="responsible-identity">
        <div className={`responsible-avatar ${item.vinculo !== 'oficial' ? 'pending' : ''}`} aria-hidden="true">
          {item.nome === 'Sem responsável'
            ? <i className="fa-solid fa-user-slash" />
            : item.nome.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()}
        </div>
        <div className="responsible-copy">
          <strong>{item.nome}</strong>
          {item.vinculo === 'legado_pendente' && <span className="legacy-link-badge">Responsável não vinculado</span>}
          {item.vinculo === 'nao_atribuido' && <span className="unassigned-badge">Não atribuído</span>}
        </div>
      </div>

      <div className="responsible-volume">
        <strong>{item.total}</strong>
        <span>{item.total === 1 ? 'demanda' : 'demandas'}</span>
      </div>

      <div
        className="responsible-status-bar"
        role="img"
        aria-label={`${item.nome}: ${item.total} demandas distribuídas por status`}
      >
        {GOVERNANCE_STATUS_ORDER.map((status) => {
          const count = item.status[status];
          if (count === 0) return null;
          return (
            <span
              key={status}
              className={`responsible-status-segment ${STATUS_CLASS[status]}`}
              style={{ width: `${percentage(count, item.total)}%` }}
              title={`${status}: ${count}`}
            />
          );
        })}
      </div>
    </div>
  );
}

export const VisaoGeral: React.FC<VisaoGeralProps> = ({
  demandas,
  historico,
  onOpenEditar,
  renderAtencaoImediata,
}) => {
  const total = demandas.length;
  const statusCounts: Record<string, number> = {};
  const setorCounts: Record<string, number> = {};

  demandas.forEach((demanda) => {
    statusCounts[demanda.status] = (statusCounts[demanda.status] || 0) + 1;
    const setor = demanda.setor || 'Sem setor';
    setorCounts[setor] = (setorCounts[setor] || 0) + 1;
  });

  const statusDist = Object.entries(statusCounts)
    .map(([status, count]) => ({ label: status, count, percent: percentage(count, total) }))
    .sort((a, b) => b.count - a.count);
  const setorDist = Object.entries(setorCounts)
    .map(([setor, count]) => ({ label: setor, count, percent: percentage(count, total) }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const prazoInterno = getDeadlineCoverage(demandas, 'interno');
  const prazoFinal = getDeadlineCoverage(demandas, 'final');
  const situacaoPrazoFinal = getDefinedFinalDeadlineSituation(demandas, getTodayString());
  const responsaveis = getResponsibleDistribution(demandas);

  const ultimasMovimentacoes = historico
    .filter((item) => !isTechnicalHistoryEvent(item))
    .slice(0, 5)
    .map((item) => {
      const demandaCorresp = demandas.find((demanda) => demanda.id === item.demandaId);
      return {
        ...item,
        presentation: presentHistoryEvent(item),
        processoNumero: demandaCorresp?.numero || 'Processo não localizado',
        demanda: demandaCorresp,
      };
    });

  return (
    <main className="visao-geral-container governance-dashboard">
      {renderAtencaoImediata()}

      <section className="governance-section" aria-label="Composição da carteira">
        <div className="dashboard-row governance-composition-grid">
          <article className="dashboard-col-card governance-card">
            <div className="governance-card-title">
              <span className="governance-card-icon"><i className="fa-solid fa-chart-bar" /></span>
              <div><h3>Distribuição por status</h3><p>Composição do estoque atual por situação registrada.</p></div>
            </div>
            <div className="governance-progress-list">
              {statusDist.length > 0 ? statusDist.map((item) => (
                <div key={item.label} className="progress-bar-group">
                  <div className="progress-bar-labels">
                    <span>{item.label}</span>
                    <span>{item.count} {item.count === 1 ? 'demanda' : 'demandas'} <small>({item.percent}%)</small></span>
                  </div>
                  <div className="progress-bar-outer"><div className={`progress-bar-inner ${STATUS_CLASS[item.label as DemandStatus]}`} style={{ width: `${item.percent}%` }} /></div>
                </div>
              )) : <div className="governance-empty">Nenhum dado disponível.</div>}
            </div>
          </article>

          <article className="dashboard-col-card governance-card">
            <div className="governance-card-title">
              <span className="governance-card-icon"><i className="fa-solid fa-building-user" /></span>
              <div><h3>Demandas por setor informado</h3><p>Cinco maiores volumes conforme o texto registrado na demanda.</p></div>
            </div>
            <div className="governance-progress-list">
              {setorDist.length > 0 ? setorDist.map((item) => (
                <div key={item.label} className="progress-bar-group">
                  <div className="progress-bar-labels">
                    <span>{item.label}</span>
                    <span>{item.count} {item.count === 1 ? 'demanda' : 'demandas'} <small>({item.percent}%)</small></span>
                  </div>
                  <div className="progress-bar-outer"><div className="progress-bar-inner sector" style={{ width: `${item.percent}%` }} /></div>
                </div>
              )) : <div className="governance-empty">Nenhum dado disponível.</div>}
            </div>
          </article>
        </div>
      </section>

      <section className="governance-section" aria-labelledby="deadlines-title">
        <div className="governance-section-heading">
          <div>
            <span className="governance-kicker">Confiabilidade da leitura</span>
            <h2 id="deadlines-title">Cobertura dos prazos</h2>
          </div>
        </div>

        <div className="deadline-coverage-grid">
          <DeadlineCoverageCard
            title="Prazo interno"
            description="Data de referência para organização e acompanhamento interno."
            coverage={prazoInterno}
          />
          <DeadlineCoverageCard
            title="Prazo final"
            description="Data limite registrada para conclusão ou providência da demanda."
            coverage={prazoFinal}
          />
        </div>

        <article className="governance-card deadline-situation-card">
          <div className="deadline-situation-copy">
            <span className="governance-kicker">Recorte válido</span>
            <h3>Situação dos prazos finais definidos</h3>
            <p>Somente {situacaoPrazoFinal.totalDefinido} de {total} demandas possuem prazo final definido e integram esta leitura.</p>
          </div>
          <dl className="deadline-situation-metrics">
            <div className="overdue"><dt>Vencidas</dt><dd>{situacaoPrazoFinal.vencido}</dd></div>
            <div className="today"><dt>Vencem hoje</dt><dd>{situacaoPrazoFinal.hoje}</dd></div>
            <div className="future"><dt>Futuras</dt><dd>{situacaoPrazoFinal.futuro}</dd></div>
            <div className="closed"><dt>Encerradas</dt><dd>{situacaoPrazoFinal.encerrado}</dd></div>
            {situacaoPrazoFinal.inconsistente > 0 && (
              <div className="inconsistent"><dt>Inconsistentes</dt><dd>{situacaoPrazoFinal.inconsistente}</dd></div>
            )}
          </dl>
        </article>
      </section>

      <section className="governance-section" aria-labelledby="responsible-title">
        <div className="governance-section-heading">
          <div>
            <span className="governance-kicker">Distribuição da carteira</span>
            <h2 id="responsible-title">Distribuição por responsável</h2>
          </div>
        </div>

        <article className="governance-card responsible-distribution-card">
          <div className="responsible-legend" aria-label="Legenda dos status">
            {GOVERNANCE_STATUS_ORDER.map((status) => (
              <span key={status}><i className={`legend-dot status-${STATUS_CLASS[status]}`} />{status}</span>
            ))}
          </div>
          <div className="responsible-list">
            {responsaveis.length > 0
              ? responsaveis.map((item) => <ResponsibleRow key={item.key} item={item} />)
              : <div className="governance-empty">Nenhum responsável disponível.</div>}
          </div>
        </article>
      </section>

      <section className="governance-section" aria-labelledby="history-title">
        <div className="governance-section-heading compact">
          <div>
            <span className="governance-kicker">Consciência situacional</span>
            <h2 id="history-title">Registros recentes do histórico</h2>
          </div>
        </div>
        <article className="dashboard-col-card governance-card history-governance-card">
          {ultimasMovimentacoes.length > 0 ? (
            <div className="timeline-container governance-timeline">
              {ultimasMovimentacoes.map((item, index) => (
                <div key={item.id} className={`timeline-item ${index === 0 ? 'latest' : ''}`}>
                  <div className="timeline-circle" />
                  <div className="timeline-content">
                    <div className="timeline-header">
                      <div className="timeline-meta governance-history-meta">
                        <strong>{item.processoNumero}</strong><span>•</span><span>{item.data_hora}</span>
                      </div>
                      <span className={badgeClass(item.status_novo)}>{item.status_novo}</span>
                    </div>
                    <div className="governance-history-context">
                      <span className="timeline-event-type">{item.presentation.label}</span>
                      <span className="timeline-setor"><i className="fa-solid fa-building" />{item.setor || 'CTRH'}</span>
                      {item.demanda && (
                        <button type="button" className="governance-open-link" onClick={() => onOpenEditar(item.demanda!)} title="Abrir detalhes do processo">
                          Ver processo <i className="fa-solid fa-arrow-up-right-from-square" />
                        </button>
                      )}
                    </div>
                    <div className="timeline-comment">{item.presentation.comment}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : <div className="governance-empty">Nenhuma movimentação operacional registrada.</div>}
        </article>
      </section>
    </main>
  );
};
