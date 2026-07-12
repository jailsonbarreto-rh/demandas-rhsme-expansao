import React, { useState } from 'react';
import { Demanda } from '../types';

interface ModalStatusProps {
  demanda: Demanda;
  onClose: () => void;
  onAtualizar: (demandaId: number, novoStatus: Demanda['status'], comentario: string) => void;
}

export const ModalStatus: React.FC<ModalStatusProps> = ({ demanda, onClose, onAtualizar }) => {
  const [status, setStatus] = useState<Demanda['status']>(demanda.status);
  const [comentario, setComentario] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!status || !comentario.trim()) {
      alert("Por favor, selecione o status e insira um comentário justificando a alteração.");
      return;
    }

    onAtualizar(demanda.id, status, comentario.trim());
  };

  const statusList: Demanda['status'][] = [
    'Aguardando Andamento', 'Tramitado', 'Para Assinatura', 
    'Encerrado', 'Sobrestado', 'Ajustar'
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-wrapper" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
        <div className="modal-header">
          <h2>Atualizar Status</h2>
          <button className="modal-close" onClick={onClose}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              
              {/* Seleção do Novo Status */}
              <div>
                <label htmlFor="modal_status_select" className="input-label-externa">Status da Demanda</label>
                <select 
                  id="modal_status_select"
                  className="form-select"
                  value={status}
                  onChange={e => setStatus(e.target.value as Demanda['status'])}
                  required
                >
                  {statusList.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Comentário / Observação */}
              <div>
                <label htmlFor="modal_status_comentario" className="input-label-externa">Comentário / Observação</label>
                <textarea 
                  id="modal_status_comentario"
                  className="form-control"
                  style={{ height: '120px', resize: 'vertical' }}
                  placeholder="Descreva as atualizações ou alterações realizadas para justificar a mudança de status..."
                  value={comentario}
                  onChange={e => setComentario(e.target.value)}
                  required
                ></textarea>
              </div>

            </div>
          </div>
          
          <div className="modal-footer">
            <button type="submit" className="btn btn-primary">
              <i className="fa-solid fa-floppy-disk"></i> Atualizar
            </button>
            <button type="button" className="btn" onClick={onClose}>
              <i className="fa-solid fa-xmark"></i> Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
