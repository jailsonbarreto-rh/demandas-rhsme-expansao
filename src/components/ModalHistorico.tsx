import React from 'react';
import { Demanda, ComentarioHistorico } from '../types';

interface ModalHistoricoProps {
  demanda: Demanda;
  historico: ComentarioHistorico[];
  onClose: () => void;
}

export const ModalHistorico: React.FC<ModalHistoricoProps> = ({ demanda, historico, onClose }) => {
  // Filtrar histórico correspondente a esta demanda específica
  const historicoFiltrado = historico.filter(h => h.demandaId === demanda.id);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-wrapper" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Histórico de Comentários — Processo {demanda.numero}</h2>
          <button className="modal-close" onClick={onClose}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
        
        <div className="modal-body">
          {historicoFiltrado.length > 0 ? (
            <div style={{ maxHeight: '420px', overflowY: 'auto', paddingRight: '5px' }}>
              <div className="timeline-container">
                {historicoFiltrado.map((h, index) => {
                  // Determina classes de cor para a badge de status na timeline
                  let statusBadgeClass = 'badge aguardando';
                  if (h.status_novo === 'Para Assinatura') statusBadgeClass = 'badge assinatura';
                  else if (h.status_novo === 'Encerrado') statusBadgeClass = 'badge encerrado';
                  else if (h.status_novo === 'Tramitado') statusBadgeClass = 'badge tramitado';
                  else if (h.status_novo === 'Ajustar') statusBadgeClass = 'badge ajustar';
                  else if (h.status_novo === 'Sobrestado') statusBadgeClass = 'badge sobrestado';

                  return (
                    <div key={h.id} className={`timeline-item ${index === 0 ? 'latest' : ''}`}>
                      <div className="timeline-circle"></div>
                      <div className="timeline-content">
                        <div className="timeline-header">
                          <div className="timeline-meta">
                            <i className="fa-regular fa-clock" style={{ marginRight: '6px' }}></i>
                            {h.data_hora}
                          </div>
                          <span className={statusBadgeClass} style={{ fontSize: '0.688rem', fontWeight: 600 }}>
                            {h.status_novo}
                          </span>
                        </div>
                        
                        <div>
                          <span className="timeline-setor">
                            <i className="fa-solid fa-building" style={{ marginRight: '4px', fontSize: '0.688rem' }}></i>
                            {h.setor || 'CTRH'}
                          </span>
                        </div>
                        
                        <div className="timeline-comment">
                          {h.comentario}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div style={{ padding: '30px 0', color: 'var(--text-muted)', textAlign: 'center', fontSize: '0.875rem' }}>
              Não há histórico de alterações de status registrado para esta demanda.
            </div>
          )}
        </div>
        
        <div className="modal-footer">
          <button type="button" className="btn" onClick={onClose}>
            <i className="fa-solid fa-xmark"></i> Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
