import React, { useState, useEffect } from 'react';
import { Demanda } from '../types';
import { DateMaskInput } from './DateMaskInput';

interface ModalEditarProps {
  demanda: Demanda;
  onClose: () => void;
  onSalvar: (demandaId: number, camposAlterados: Partial<Demanda>) => void;
}

export const ModalEditar: React.FC<ModalEditarProps> = ({ demanda, onClose, onSalvar }) => {
  const [assunto, setAssunto] = useState<string>('');
  const [responsavel, setResponsavel] = useState<string>('');
  const [limite1, setLimite1] = useState<string>('');
  const [limite2, setLimite2] = useState<string>('');
  const [setor, setSetor] = useState<string>('');

  useEffect(() => {
    if (demanda) {
      setAssunto(demanda.assunto);
      setResponsavel(demanda.responsavel || '');
      setLimite1(demanda.limite1 || '');
      setLimite2(demanda.limite2 || '');
      setSetor(demanda.setor || '');
    }
  }, [demanda]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assunto) {
      alert("O assunto é obrigatório.");
      return;
    }

    onSalvar(demanda.id, {
      assunto,
      responsavel,
      limite1,
      limite2,
      setor
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-wrapper" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Editar Dados da Demanda</h2>
          <button className="modal-close" onClick={onClose}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-grid-modal">
              {/* ID (Readonly - Título na Caixa: ID: <valor>) */}
              <div className="input-container-floating col-full">
                <input 
                  type="text" 
                  id="edit_id"
                  className="form-control"
                  value={`ID: ${demanda.id}`}
                  readOnly 
                />
              </div>

              {/* Número do Processo (Readonly - Número: <valor>) */}
              <div className="input-container-floating col-full">
                <input 
                  type="text" 
                  id="edit_numero"
                  className="form-control"
                  value={`Número: ${demanda.numero}`}
                  readOnly 
                />
              </div>

              {/* Tipo (Readonly - Tipo: <valor>) */}
              <div className="input-container-floating col-full">
                <input 
                  type="text" 
                  id="edit_tipo"
                  className="form-control"
                  value={`Tipo: ${demanda.tipo}`}
                  readOnly 
                />
              </div>

              {/* Assunto (Editável) */}
              <div className="input-container-floating col-full">
                <input 
                  type="text" 
                  id="edit_assunto"
                  placeholder=" "
                  value={assunto} 
                  onChange={e => setAssunto(e.target.value)} 
                  required 
                />
                <label htmlFor="edit_assunto">Assunto</label>
              </div>

              {/* Responsável (Editável) */}
              <div className="input-container-floating col-full">
                <input 
                  type="text" 
                  id="edit_responsavel"
                  placeholder=" "
                  value={responsavel} 
                  onChange={e => setResponsavel(e.target.value)} 
                />
                <label htmlFor="edit_responsavel">Responsável</label>
              </div>

              {/* Limite 1 (Editável - Título Externo) */}
              <div>
                <DateMaskInput 
                  id="edit_limite1"
                  label="Limite 1"
                  value={limite1}
                  onChange={setLimite1}
                />
              </div>

              {/* Limite 2 (Editável - Título Externo) */}
              <div>
                <DateMaskInput 
                  id="edit_limite2"
                  label="Limite 2"
                  value={limite2}
                  onChange={setLimite2}
                />
              </div>

              {/* Setor (Editável) */}
              <div className="input-container-floating col-full">
                <input 
                  type="text" 
                  id="edit_setor"
                  placeholder=" "
                  value={setor} 
                  onChange={e => setSetor(e.target.value)} 
                />
                <label htmlFor="edit_setor">Setor</label>
              </div>
            </div>
          </div>
          
          <div className="modal-footer">
            <button type="submit" className="btn btn-primary">
              <i className="fa-solid fa-floppy-disk"></i> Salvar Alterações
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
