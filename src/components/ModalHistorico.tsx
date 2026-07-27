import React from 'react';
import type { ComentarioHistorico, Demanda } from '../types';
import { presentHistoryEvent } from '../domain/historyPresentation';
import { AppDialog } from './ui/AppDialog';

interface ModalHistoricoProps {
  demanda: Demanda;
  historico: ComentarioHistorico[];
  onClose: () => void;
}

function badgeClass(status: string) {
  if (status === 'Para Assinatura') return 'badge assinatura';
  if (status === 'Encerrado') return 'badge encerrado';
  if (status === 'Tramitado') return 'badge tramitado';
  if (status === 'Ajustar') return 'badge ajustar';
  if (status === 'Sobrestado') return 'badge sobrestado';
  return 'badge aguardando';
}

export const ModalHistorico: React.FC<ModalHistoricoProps> = ({ demanda, historico, onClose }) => {
  const historicoFiltrado = historico.filter((item) => item.demandaId === demanda.id);
  return (
    <AppDialog title="Histórico da demanda" onClose={onClose}>
      <div className="modal-body">
        <p className="history-process-reference">Processo {demanda.numero}</p>
        {historicoFiltrado.length > 0 ? (
          <div className="history-scroll-region">
            <div className="timeline-container">
              {historicoFiltrado.map((item, index) => {
                const presentation = presentHistoryEvent(item);
                return (
                  <div key={item.id} className={`timeline-item ${index === 0 ? 'latest' : ''}`}>
                    <div className="timeline-circle" />
                    <div className="timeline-content">
                      <div className="timeline-header">
                        <div className="timeline-meta">
                          <span className="timeline-date"><i className="fa-regular fa-calendar" aria-hidden="true" /> {item.data_hora}</span>
                          <span className="timeline-event-type">{presentation.label}</span>
                          <span className="timeline-setor"><i className="fa-solid fa-building" aria-hidden="true" /> {item.setor || 'CTRH'}</span>
                        </div>
                        <span className={badgeClass(item.status_novo)}>{item.status_novo}</span>
                      </div>
                      <div className="timeline-comment">{presentation.comment}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="empty-state compact-empty">
            <i className="fa-regular fa-clock" aria-hidden="true" />
            <p>Nenhuma movimentação foi registrada para esta demanda.</p>
          </div>
        )}
      </div>
      <div className="modal-footer">
        <button type="button" className="btn btn-primary" onClick={onClose}>Fechar</button>
      </div>
    </AppDialog>
  );
};
