import React, { useEffect, useState } from 'react';
import { Demanda } from '../types';
import { isValidDateString } from '../utils/date';
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
    setAssunto(demanda.assunto);
    setResponsavel(demanda.responsavel || '');
    setLimite1(demanda.limite1 || '');
    setLimite2(demanda.limite2 || '');
    setSetor(demanda.setor || '');
  }, [demanda]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const assuntoNormalizado = assunto.trim();
    if (!assuntoNormalizado) {
      alert('O assunto é obrigatório.');
      return;
    }

    if (limite1.trim() && !isValidDateString(limite1)) {
      alert('O prazo de análise interna é inválido. Utilize o formato dd/mm/aaaa.');
      return;
    }

    if (limite2.trim() && !isValidDateString(limite2)) {
      alert('O prazo final é inválido. Utilize o formato dd/mm/aaaa.');
      return;
    }

    onSalvar(demanda.id, {
      assunto: assuntoNormalizado,
      responsavel: responsavel.trim(),
      limite1: limite1.trim(),
      limite2: limite2.trim(),
      setor: setor.trim(),
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-wrapper" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Editar Dados da Demanda</h2>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Fechar edição da demanda">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-grid-modal">
              <div className="input-container-floating col-full">
                <input type="text" id="edit_id" className="form-control" value={`ID: ${demanda.id}`} readOnly />
              </div>

              <div className="input-container-floating col-full">
                <input type="text" id="edit_numero" className="form-control" value={`Número: ${demanda.numero}`} readOnly />
              </div>

              <div className="input-container-floating col-full">
                <input type="text" id="edit_tipo" className="form-control" value={`Tipo: ${demanda.tipo}`} readOnly />
              </div>

              <div className="input-container-floating col-full">
                <input type="text" id="edit_assunto" placeholder=" " value={assunto} onChange={e => setAssunto(e.target.value)} required />
                <label htmlFor="edit_assunto">Assunto</label>
              </div>

              <div className="input-container-floating col-full">
                <input type="text" id="edit_responsavel" placeholder=" " value={responsavel} onChange={e => setResponsavel(e.target.value)} />
                <label htmlFor="edit_responsavel">Responsável</label>
              </div>

              <div>
                <DateMaskInput id="edit_limite1" label="Limite 1" value={limite1} onChange={setLimite1} />
              </div>

              <div>
                <DateMaskInput id="edit_limite2" label="Limite 2" value={limite2} onChange={setLimite2} />
              </div>

              <div className="input-container-floating col-full">
                <input type="text" id="edit_setor" placeholder=" " value={setor} onChange={e => setSetor(e.target.value)} />
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
